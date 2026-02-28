const { query, ensureTable } = require('./db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await ensureTable();

    if (req.method === 'GET') {
      const result = await query(
        `SELECT * FROM Contact ORDER BY "createdAt" ASC`
      );
      return res.status(200).json({ contacts: result.rows, total: result.rows.length });
    }

    if (req.method === 'DELETE') {
      await query(`DELETE FROM Contact`);
      await query(`ALTER SEQUENCE contact_id_seq RESTART WITH 1`);
      return res.status(200).json({ message: 'All contacts deleted, ID counter reset' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('/api/contacts error:', err);
    return res.status(500).json({ error: err.message });
  }
};