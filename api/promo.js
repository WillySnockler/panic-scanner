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
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  if (!token || !process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) return null;
  const r = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, { headers: { apikey: process.env.SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` } });
  return r.ok ? r.json() : null;
}

module.exports = async (req, res) => {
  if (!['POST', 'OPTIONS'].includes(req.method)) return res.status(405).json({ error: 'Method not allowed' });
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    const user = await authenticate(req);
    if (!user?.id) return res.status(401).json({ error: 'Sign in required.' });
    const code = String(req.body?.code || '').trim().toUpperCase();
    if (!/^[A-Z0-9_-]{3,64}$/.test(code)) return res.status(400).json({ error: 'Enter a valid promo code.' });

    const rows = await supabase(`promo_codes?code=eq.${encodeURIComponent(code)}&active=eq.true&select=id,code,plan,discount_percent,max_redemptions,redemption_count,expires_at&limit=1`);
    const promo = rows?.[0];
    if (!promo) return res.status(404).json({ error: 'Promo code not found or inactive.' });
    if (promo.expires_at && new Date(promo.expires_at).getTime() <= Date.now()) return res.status(410).json({ error: 'Promo code has expired.' });
    if (promo.max_redemptions != null && promo.redemption_count >= promo.max_redemptions) return res.status(410).json({ error: 'Promo code redemption limit reached.' });

    const existing = await supabase(`promo_redemptions?promo_code_id=eq.${encodeURIComponent(promo.id)}&user_id=eq.${encodeURIComponent(user.id)}&select=id&limit=1`);
    if (existing?.length) return res.status(409).json({ error: 'This promo code has already been redeemed on this account.' });

    const plan = ['elite', 'pro', 'standard'].includes(String(promo.plan || '').toLowerCase()) ? String(promo.plan).toLowerCase() : 'standard';
    await supabase('promo_redemptions', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ promo_code_id: promo.id, user_id: user.id })
    });
    await supabase(`promo_codes?id=eq.${encodeURIComponent(promo.id)}`, {
      method: 'PATCH', headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ redemption_count: (promo.redemption_count || 0) + 1 })
    });
    await supabase(`profiles?id=eq.${encodeURIComponent(user.id)}`, {
      method: 'PATCH', headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ plan, updated_at: new Date().toISOString() })
    });
    return res.status(200).json({ ok: true, code: promo.code, plan: plan[0].toUpperCase() + plan.slice(1), percent_off: promo.discount_percent || 0 });
  } catch (e) {
    console.error('promo redemption error', e);
    return res.status(500).json({ error: e.message || 'Promo redemption failed.' });
  }
};
