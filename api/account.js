function authToken(req) {
  const value = String(req.headers.authorization || '');
  return value.startsWith('Bearer ') ? value.slice(7) : '';
}

async function getUser(token) {
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  if (!url || !anon || !token) return null;
  const r = await fetch(`${url}/auth/v1/user`, { headers: { apikey: anon, Authorization: `Bearer ${token}` } });
  return r.ok ? r.json() : null;
}

async function db(path, options = {}) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase server integration is not configured.');
  const r = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`Database request failed: ${r.status} ${text}`);
  return text ? JSON.parse(text) : null;
}

export default async function handler(req, res) {
  try {
    if (!['GET', 'PUT'].includes(req.method)) return res.status(405).json({ error: 'Method not allowed' });
    const user = await getUser(authToken(req));
    if (!user) return res.status(401).json({ error: 'Sign in required.' });

    const id = encodeURIComponent(user.id);
    if (req.method === 'GET') {
      const [profiles, settings, watchlists, setups, investigations, theses] = await Promise.all([
        db(`profiles?id=eq.${id}&select=id,email,plan,is_admin,is_vip,subscription_status,stripe_customer_id,stripe_subscription_id,stripe_price_id,subscription_current_period_end`),
        db(`user_settings?user_id=eq.${id}&select=settings`),
        db(`watchlists?user_id=eq.${id}&select=symbols`),
        db(`saved_setups?user_id=eq.${id}&select=id,data,created_at&order=created_at.desc`),
        db(`saved_investigations?user_id=eq.${id}&select=id,data,created_at&order=created_at.desc`),
        db(`saved_theses?user_id=eq.${id}&select=id,data,created_at&order=created_at.desc`)
      ]);
      return res.status(200).json({
        profile: profiles?.[0] || { id: user.id, email: user.email, plan: 'Standard', is_admin: false, is_vip: false },
        settings: settings?.[0]?.settings || {},
        watchlist: watchlists?.[0]?.symbols || [],
        setups: setups || [],
        investigations: investigations || [],
        theses: theses || []
      });
    }

    const body = req.body || {};
    const now = new Date().toISOString();
    if (body.settings) await db('user_settings', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ user_id: user.id, settings: body.settings, updated_at: now }) });
    if (Array.isArray(body.watchlist)) await db('watchlists', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ user_id: user.id, symbols: body.watchlist, updated_at: now }) });
    if (body.profile) {
      const allowed = {};
      if (body.profile.email) allowed.email = body.profile.email;
      await db(`profiles?id=eq.${id}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ ...allowed, updated_at: now }) });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('account state error', e);
    return res.status(500).json({ error: e.message || 'Account state failed.' });
  }
}
