const crypto = require('crypto');

const PRICE_KEYS = {
  pro_monthly: 'STRIPE_PRO_MONTHLY_PRICE_ID',
  pro_yearly: 'STRIPE_PRO_YEARLY_PRICE_ID',
  elite_monthly: 'STRIPE_ELITE_MONTHLY_PRICE_ID',
  elite_yearly: 'STRIPE_ELITE_YEARLY_PRICE_ID'
};

function env(name) {
  return process.env[name];
}

async function supabaseUser(token) {
  const url = env('SUPABASE_URL');
  const anon = env('SUPABASE_ANON_KEY');
  if (!url || !anon || !token) return null;
  const r = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: anon, Authorization: `Bearer ${token}` }
  });
  if (!r.ok) return null;
  return r.json();
}

async function stripe(path, body) {
  const key = env('STRIPE_SECRET_KEY');
  if (!key) throw new Error('Stripe is not configured on the production server.');
  const r = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams(body)
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error?.message || 'Stripe request failed.');
  return data;
}

function priceId(plan, interval) {
  const key = PRICE_KEYS[`${plan}_${interval}`];
  return key ? env(key) : null;
}

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const action = req.body?.action || 'config';
    const auth = String(req.headers.authorization || '');
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    const user = await supabaseUser(token);

    if (!user && action !== 'config') return res.status(401).json({ error: 'Sign in required.' });

    if (action === 'config') {
      return res.status(200).json({
        configured: Boolean(env('STRIPE_SECRET_KEY') && priceId('pro', 'monthly') && priceId('pro', 'yearly') && priceId('elite', 'monthly') && priceId('elite', 'yearly')),
        plans: {
          pro: { monthly: 149, yearly: 1490 },
          elite: { monthly: 299, yearly: 2990 }
        }
      });
    }

    if (action === 'checkout') {
      const plan = req.body?.plan === 'elite' ? 'elite' : 'pro';
      const interval = req.body?.interval === 'yearly' ? 'yearly' : 'monthly';
      const price = priceId(plan, interval);
      if (!price) return res.status(503).json({ error: 'Stripe prices are not configured yet.' });
      const origin = req.headers.origin || `https://${req.headers.host}`;
      const session = await stripe('checkout/sessions', {
        mode: 'subscription',
        'line_items[0][price]': price,
        'line_items[0][quantity]': '1',
        success_url: `${origin}/?billing=success`,
        cancel_url: `${origin}/?billing=cancelled`,
        customer_email: user.email || '',
        'metadata[user_id]': user.id,
        'metadata[plan]': plan,
        'subscription_data[metadata][user_id]': user.id,
        'subscription_data[metadata][plan]': plan,
        allow_promotion_codes: 'true'
      });
      return res.status(200).json({ url: session.url });
    }

    if (action === 'portal') {
      const supabaseUrl = env('SUPABASE_URL');
      const service = env('SUPABASE_SERVICE_ROLE_KEY');
      if (!supabaseUrl || !service) return res.status(503).json({ error: 'Supabase server integration is not configured.' });
      const q = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(user.id)}&select=stripe_customer_id`, {
        headers: { apikey: service, Authorization: `Bearer ${service}` }
      });
      const rows = await q.json();
      const customer = rows?.[0]?.stripe_customer_id;
      if (!customer) return res.status(400).json({ error: 'No Stripe customer exists for this account yet.' });
      const origin = req.headers.origin || `https://${req.headers.host}`;
      const portal = await stripe('billing_portal/sessions', { customer, return_url: origin });
      return res.status(200).json({ url: portal.url });
    }

    return res.status(400).json({ error: 'Unknown billing action.' });
  } catch (e) {
    console.error('billing error', e);
    return res.status(500).json({ error: e.message || 'Billing request failed.' });
  }
};
