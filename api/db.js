const { Pool } = require('pg');

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
    });

    pool.on('error', (err) => {
      console.error('Unexpected pool error', err);
      pool = null; // reset so next request gets a fresh pool
    });
  }
  return pool;
}

async function query(text, params) {
  return getPool().query(text, params);
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
    );
    CREATE INDEX IF NOT EXISTS idx_contact_email  ON Contact(email);
    CREATE INDEX IF NOT EXISTS idx_contact_phone  ON Contact("phoneNumber");
    CREATE INDEX IF NOT EXISTS idx_contact_linked ON Contact("linkedId");
  `);
}

module.exports = { query, ensureTable };