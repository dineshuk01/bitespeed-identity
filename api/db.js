const { Pool } = require('pg');

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000,
    });

    pool.on('error', (err) => {
      console.error('Pool error:', err.message);
      pool = null;
    });
  }
  return pool;
}

async function query(text, params) {
  const p = getPool();
  try {
    return await p.query(text, params);
  } catch (err) {
    pool = null; // reset on error so next request retries
    throw err;
  }
}

async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS Contact (
      id               SERIAL PRIMARY KEY,
      "phoneNumber"    TEXT,
      email            TEXT,
      "linkedId"       INTEGER REFERENCES Contact(id),
      "linkPrecedence" TEXT NOT NULL CHECK("linkPrecedence" IN ('primary','secondary')),
      "createdAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "deletedAt"      TIMESTAMPTZ
    )
  `);

  await query(`CREATE INDEX IF NOT EXISTS idx_contact_email  ON Contact(email)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_contact_phone  ON Contact("phoneNumber")`);
  await query(`CREATE INDEX IF NOT EXISTS idx_contact_linked ON Contact("linkedId")`);
}

module.exports = { query, ensureTable };