module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  return res.status(200).json({
    ok: true,
    device: {
      status: 'ok',
      kind: 'pc',
      kindLabel: 'laptop/PC',
      devices: [
        { kind: 'hp', kindLabel: 'HP/tablet', lastText: '1 jam lalu', current: false },
        { kind: 'pc', kindLabel: 'laptop/PC', lastText: 'baru saja', current: true }
      ],
      quota: { used: 1, max: 3, left: 2, days: 30, backText: '24 Nov 2026' },
      mode: 'tanpa_kode',
      transition: false,
      transitionEnd: '',
      checkout: 'https://aiautomation.myr.id/pl/auto-feeds',
      rule: 'Maksimal 1 HP + 1 laptop/PC. Pindah perangkat maksimal 3x per 30 hari.',
      inapp: false
    }
  });
};
