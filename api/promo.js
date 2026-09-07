async function supabase(path, options = {}) {
  const base = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key) throw new Error('Supabase server integration is not configured.');
  const r = await fetch(`${base}/rest/v1/${path}`, {
    ...options,
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  const text = await r.text();
  let data = null; try { data = text ? JSON.parse(text) : null; } catch {}
  if (!r.ok) throw new Error(data?.message || `Supabase request failed: ${r.status}`);
  return data;
}

async function authenticate(req) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  if (!token) return null;
  const base = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  if (!base || !anon) throw new Error('Supabase authentication is not configured.');
  const r = await fetch(`${base}/auth/v1/user`, { headers: { apikey: anon, Authorization: `Bearer ${token}` } });
  if (!r.ok) return null;
  return r.json();
}

module.exports = async (req, res) => {
  if (!['POST', 'OPTIONS'].includes(req.method)) return res.status(405).json({ error: 'Method not allowed' });
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    const user = await authenticate(req);
    if (!user?.id) return res.status(401).json({ error: 'Sign in required.' });
    const code = String(req.body?.code || '').trim().toUpperCase();
    if (!/^[A-Z0-9_-]{3,64}$/.test(code)) return res.status(400).json({ error: 'Enter a valid promo code.' });

    const rows = await supabase(`promo_codes?code=eq.${encodeURIComponent(code)}&active=eq.true&select=code,plan,percent_off,max_redemptions,redemptions,expires_at&limit=1`);
    const promo = rows?.[0];
    if (!promo) return res.status(404).json({ error: 'Promo code not found or inactive.' });
    if (promo.expires_at && new Date(promo.expires_at).getTime() <= Date.now()) return res.status(410).json({ error: 'Promo code has expired.' });
    if (promo.max_redemptions != null && promo.redemptions >= promo.max_redemptions) return res.status(410).json({ error: 'Promo code redemption limit reached.' });

    const profiles = await supabase(`profiles?id=eq.${encodeURIComponent(user.id)}&select=id,plan&limit=1`);
    const current = profiles?.[0]?.plan || 'Standard';
    const plan = ['Elite', 'Pro', 'Standard'].includes(promo.plan) ? promo.plan : current;
    await supabase(`promo_codes?code=eq.${encodeURIComponent(code)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ redemptions: (promo.redemptions || 0) + 1 })
    });
    await supabase('profiles', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ id: user.id, email: user.email || null, plan })
    });
    return res.status(200).json({ ok: true, code: promo.code, plan, percent_off: promo.percent_off || 0 });
  } catch (e) {
    console.error('promo redemption error', e);
    return res.status(500).json({ error: e.message || 'Promo redemption failed.' });
  }
};
