const { ensureTable } = require('./db');
const { identify } = require('./identifyService');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await ensureTable();

    // Vercel parses JSON body automatically, but guard anyway
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { email, phoneNumber } = body;

    const hasEmail = email !== undefined && email !== null && String(email).trim() !== '';
    const hasPhone = phoneNumber !== undefined && phoneNumber !== null && String(phoneNumber).trim() !== '';

    if (!hasEmail && !hasPhone) {
      return res.status(400).json({ error: 'At least one of email or phoneNumber must be provided' });
    }

    const result = await identify(
      hasEmail ? String(email).trim() : null,
      hasPhone ? String(phoneNumber).trim() : null
    );

    return res.status(200).json(result);
  } catch (err) {
    console.error('/api/identify error:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};