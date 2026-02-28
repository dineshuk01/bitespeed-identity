const { ensureTable } = require('./db');
const { identify } = require('./identifyService');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await ensureTable();

    const { email, phoneNumber } = req.body || {};
    const hasEmail = email !== undefined && email !== null && email !== '';
    const hasPhone = phoneNumber !== undefined && phoneNumber !== null && phoneNumber !== '';

    if (!hasEmail && !hasPhone) {
      return res.status(400).json({ error: 'At least one of email or phoneNumber must be provided' });
    }

    const result = await identify(
      hasEmail ? String(email) : null,
      hasPhone ? String(phoneNumber) : null
    );

    return res.status(200).json(result);
  } catch (err) {
    console.error('/api/identify error:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};