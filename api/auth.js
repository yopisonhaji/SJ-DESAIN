module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const now = Date.now();
  return res.status(200).json({
    ok: true,
    email: 'member@sjdesain.com',
    session: {
      email: 'member@sjdesain.com',
      loggedInAt: now,
      expiresAt: now + 30 * 24 * 60 * 60 * 1000
    }
  });
};
