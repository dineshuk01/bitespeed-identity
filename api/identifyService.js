const { query } = require('./db');

async function findMatchingContacts(email, phoneNumber) {
  const conditions = [];
  const params = [];
  let i = 1;

  if (email) {
    conditions.push(`email = $${i++}`);
    params.push(email);
  }
  if (phoneNumber) {
    conditions.push(`"phoneNumber" = $${i++}`);
    params.push(String(phoneNumber));
  }

  if (conditions.length === 0) return [];

  const result = await query(
    `SELECT * FROM Contact
     WHERE (${conditions.join(' OR ')})
     AND "deletedAt" IS NULL
     ORDER BY "createdAt" ASC`,
    params
  );
  return result.rows;
}

async function getRootPrimary(contact) {
  if (contact.linkPrecedence === 'primary') return contact;
  const result = await query(
    `SELECT * FROM Contact WHERE id = $1 AND "deletedAt" IS NULL`,
    [contact.linkedId]
  );
  return result.rows[0];
}

async function getCluster(primaryId) {
  const result = await query(
    `SELECT * FROM Contact
     WHERE (id = $1 OR "linkedId" = $1)
     AND "deletedAt" IS NULL
     ORDER BY "createdAt" ASC`,
    [primaryId]
  );
  return result.rows;
}

async function createPrimaryContact(email, phoneNumber) {
  const result = await query(
    `INSERT INTO Contact (email, "phoneNumber", "linkedId", "linkPrecedence", "createdAt", "updatedAt")
     VALUES ($1, $2, NULL, 'primary', NOW(), NOW())
     RETURNING *`,
    [email || null, phoneNumber ? String(phoneNumber) : null]
  );
  return result.rows[0];
}

async function createSecondaryContact(email, phoneNumber, primaryId) {
  const result = await query(
    `INSERT INTO Contact (email, "phoneNumber", "linkedId", "linkPrecedence", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, 'secondary', NOW(), NOW())
     RETURNING *`,
    [email || null, phoneNumber ? String(phoneNumber) : null, primaryId]
  );
  return result.rows[0];
}

async function demoteToSecondary(contactId, newPrimaryId) {
  // Demote the contact itself
  await query(
    `UPDATE Contact
     SET "linkPrecedence" = 'secondary', "linkedId" = $1, "updatedAt" = NOW()
     WHERE id = $2`,
    [newPrimaryId, contactId]
  );
  // Re-link all of the demoted contact's existing secondaries
  await query(
    `UPDATE Contact
     SET "linkedId" = $1, "updatedAt" = NOW()
     WHERE "linkedId" = $2 AND "deletedAt" IS NULL`,
    [newPrimaryId, contactId]
  );
}

function buildResponse(cluster) {
  const primary = cluster.find(c => c.linkPrecedence === 'primary');
  const secondaries = cluster.filter(c => c.linkPrecedence === 'secondary');

  const emails = [];
  if (primary.email) emails.push(primary.email);
  for (const c of secondaries) {
    if (c.email && !emails.includes(c.email)) emails.push(c.email);
  }

  const phoneNumbers = [];
  if (primary.phoneNumber) phoneNumbers.push(primary.phoneNumber);
  for (const c of secondaries) {
    if (c.phoneNumber && !phoneNumbers.includes(c.phoneNumber)) phoneNumbers.push(c.phoneNumber);
  }

  return {
    contact: {
      primaryContatctId: primary.id,
      emails,
      phoneNumbers,
      secondaryContactIds: secondaries.map(c => c.id),
    },
  };
}

async function identify(email, phoneNumber) {
  const phone = phoneNumber ? String(phoneNumber) : null;

  const matches = await findMatchingContacts(email, phone);

  if (matches.length === 0) {
    const newContact = await createPrimaryContact(email, phone);
    return buildResponse([newContact]);
  }

  // Resolve all root primaries
  const primaryMap = new Map();
  for (const match of matches) {
    const root = await getRootPrimary(match);
    if (root) primaryMap.set(root.id, root);
  }

  const primaries = Array.from(primaryMap.values()).sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  const truePrimary = primaries[0];

  // Merge: demote newer primaries
  if (primaries.length > 1) {
    for (let i = 1; i < primaries.length; i++) {
      await demoteToSecondary(primaries[i].id, truePrimary.id);
    }
  }

  // Check for new info
  const cluster = await getCluster(truePrimary.id);
  const existingEmails = new Set(cluster.map(c => c.email).filter(Boolean));
  const existingPhones = new Set(cluster.map(c => c.phoneNumber).filter(Boolean));

  const isNewEmail = email && !existingEmails.has(email);
  const isNewPhone = phone && !existingPhones.has(phone);

  if (isNewEmail || isNewPhone) {
    await createSecondaryContact(email, phone, truePrimary.id);
  }

  const finalCluster = await getCluster(truePrimary.id);
  return buildResponse(finalCluster);
}

module.exports = { identify };