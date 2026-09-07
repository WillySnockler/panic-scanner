async function db(path, options = {}) {
  const base = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key) throw new Error('Supabase server integration is not configured.');
  const r = await fetch(`${base}/rest/v1/${path}`, { ...options, headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...(options.headers || {}) } });
  const text = await r.text(); let data = null; try { data = text ? JSON.parse(text) : null; } catch {}
  if (!r.ok) throw new Error(data?.message || `Supabase request failed: ${r.status}`);
  return data;
}

async function userFromToken(req) {
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  if (!token || !process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) return null;
  const r = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, { headers: { apikey: process.env.SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` } });
  return r.ok ? r.json() : null;
}

async function requireAdmin(req) {
  const user = await userFromToken(req);
  if (!user?.id) return { error: 'Sign in required.', status: 401 };
  const rows = await db(`profiles?id=eq.${encodeURIComponent(user.id)}&select=id,email,is_admin,is_vip,plan&limit=1`);
  if (!rows?.[0]?.is_admin) return { error: 'Admin access required.', status: 403 };
  return { user, profile: rows[0] };
}

module.exports = async (req, res) => {
  if (!['GET', 'POST', 'PATCH', 'OPTIONS'].includes(req.method)) return res.status(405).json({ error: 'Method not allowed' });
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    const auth = await requireAdmin(req);
    if (auth.error) return res.status(auth.status).json({ error: auth.error });

    if (req.method === 'GET') {
      const [users, promos] = await Promise.all([
        db('profiles?select=id,email,display_name,plan,is_admin,is_vip,subscription_status,subscription_current_period_end,vip_until&order=created_at.desc&limit=500'),
        db('promo_codes?select=id,code,plan,discount_percent,active,max_redemptions,redemption_count,expires_at,created_at&order=created_at.desc&limit=500')
      ]);
      return res.status(200).json({ ok: true, users: users || [], promos: promos || [] });
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const code = String(body.code || '').trim().toUpperCase();
      const plan = ['standard', 'pro', 'elite'].includes(String(body.plan || '').toLowerCase()) ? String(body.plan).toLowerCase() : 'pro';
      const percent = Math.max(0, Math.min(100, Number(body.discount_percent ?? body.percent_off ?? 0)));
      if (!/^[A-Z0-9_-]{3,64}$/.test(code)) return res.status(400).json({ error: 'Invalid promo code.' });
      const created = await db('promo_codes', {
        method: 'POST', headers: { Prefer: 'return=representation' },
        body: JSON.stringify({ code, plan, discount_percent: percent, active: true, max_redemptions: body.max_redemptions == null ? null : Math.max(1, Number(body.max_redemptions)), redemption_count: 0, expires_at: body.expires_at || null })
      });
      return res.status(201).json({ ok: true, promo: created?.[0] || null });
    }

    const body = req.body || {};
    const target = String(body.user_id || '').trim();
    if (!target) return res.status(400).json({ error: 'user_id is required.' });
    const patch = {};
    if (body.plan && ['standard', 'pro', 'elite'].includes(String(body.plan).toLowerCase())) patch.plan = String(body.plan).toLowerCase();
    if (typeof body.is_admin === 'boolean') patch.is_admin = body.is_admin;
    if (typeof body.is_vip === 'boolean') patch.is_vip = body.is_vip;
    if (body.vip_until !== undefined) patch.vip_until = body.vip_until || null;
    if (!Object.keys(patch).length) return res.status(400).json({ error: 'No supported changes supplied.' });
    await db(`profiles?id=eq.${encodeURIComponent(target)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() }) });
    await db('admin_audit_log', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ admin_user_id: auth.user.id, action: 'update_profile_entitlement', target_user_id: target, metadata: patch }) });
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('admin api error', e);
    return res.status(500).json({ error: e.message || 'Admin request failed.' });
  }
};
