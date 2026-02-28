const { Pool } = require('pg');

// Connection pool — Vercel serverless functions are stateless
// so we create a pool per cold start (Neon supports this well)
let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false, // required for Neon
      },
      max: 1,              // serverless: keep pool small
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

async function query(text, params) {
  const client = getPool();
  return client.query(text, params);
}

// Create table if it doesn't exist — call this at the top of each function
async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS Contact (
      id             SERIAL PRIMARY KEY,
      "phoneNumber"  TEXT,
      email          TEXT,
      "linkedId"     INTEGER REFERENCES Contact(id),
      "linkPrecedence" TEXT NOT NULL CHECK("linkPrecedence" IN ('primary', 'secondary')),
      "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "deletedAt"    TIMESTAMPTZ
    );
    CREATE INDEX IF NOT EXISTS idx_contact_email  ON Contact(email);
    CREATE INDEX IF NOT EXISTS idx_contact_phone  ON Contact("phoneNumber");
    CREATE INDEX IF NOT EXISTS idx_contact_linked ON Contact("linkedId");
  `);
}

module.exports = { query, ensureTable };