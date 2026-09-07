function authToken(req) {
  const value = String(req.headers.authorization || '');
  return value.startsWith('Bearer ') ? value.slice(7).trim() : '';
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
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`Database request failed: ${r.status} ${text}`);
  return text ? JSON.parse(text) : null;
}

async function ensureProfile(user) {
  const id = encodeURIComponent(user.id);
  const rows = await db(`profiles?id=eq.${id}&select=id,email,display_name,plan,is_admin,subscription_status,stripe_customer_id,stripe_subscription_id,stripe_price_id,subscription_current_period_end,vip_until&limit=1`);
  if (rows?.[0]) return rows[0];
  await db('profiles', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ id: user.id, email: user.email || null, plan: 'standard', subscription_status: 'free' })
  });
  return { id: user.id, email: user.email || null, plan: 'standard', is_admin: false, subscription_status: 'free' };
}

function normalizedPlan(value) {
  const p = String(value || 'standard').toLowerCase();
  return p === 'elite' ? 'Elite' : p === 'pro' ? 'Pro' : 'Standard';
}

export default async function handler(req, res) {
  try {
    if (!['GET', 'PUT'].includes(req.method)) return res.status(405).json({ error: 'Method not allowed' });
    const user = await getUser(authToken(req));
    if (!user) return res.status(401).json({ error: 'Sign in required.' });
    const id = encodeURIComponent(user.id);
    const profile = await ensureProfile(user);

    if (req.method === 'GET') {
      const [settings, watchlist, setups, investigations, theses, journal] = await Promise.all([
        db(`user_settings?user_id=eq.${id}&select=sound,haptic,reduce_motion,volume,research_range&limit=1`),
        db(`watchlist_items?user_id=eq.${id}&select=symbol,created_at&order=created_at.asc`),
        db(`setups?user_id=eq.${id}&select=*&order=created_at.desc`),
        db(`investigations?user_id=eq.${id}&select=*&order=created_at.desc`),
        db(`theses?user_id=eq.${id}&select=*&order=created_at.desc`),
        db(`journal_entries?user_id=eq.${id}&select=*&order=created_at.desc`)
      ]);
      return res.status(200).json({
        profile: { ...profile, plan: normalizedPlan(profile.plan) },
        settings: settings?.[0] || { sound: true, haptic: true, reduce_motion: false, volume: 70, research_range: '60' },
        watchlist: (watchlist || []).map(x => x.symbol),
        setups: setups || [],
        investigations: investigations || [],
        theses: theses || [],
        journal: journal || []
      });
    }

    const body = req.body || {};
    if (body.settings && typeof body.settings === 'object') {
      const s = body.settings;
      await db('user_settings', {
        method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({ user_id: user.id, sound: s.sound !== false, haptic: s.haptic !== false, reduce_motion: Boolean(s.reduce_motion ?? s.motion), volume: Math.max(0, Math.min(100, Number(s.volume ?? 70))), research_range: String(s.research_range ?? s.range ?? '60'), updated_at: new Date().toISOString() })
      });
    }

    if (Array.isArray(body.watchlist)) {
      const unique = [...new Set(body.watchlist.map(x => String(x).trim().toUpperCase()).filter(Boolean))].slice(0, 100);
      await db(`watchlist_items?user_id=eq.${id}`, { method: 'DELETE' });
      if (unique.length) await db('watchlist_items', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(unique.map(symbol => ({ user_id: user.id, symbol }))) });
    }

    if (body.profile && typeof body.profile === 'object') {
      const allowed = {};
      if (body.profile.display_name != null) allowed.display_name = String(body.profile.display_name).slice(0, 80);
      if (Object.keys(allowed).length) await db(`profiles?id=eq.${id}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ ...allowed, updated_at: new Date().toISOString() }) });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('account state error', e);
    return res.status(500).json({ error: e.message || 'Account state failed.' });
  }
}
