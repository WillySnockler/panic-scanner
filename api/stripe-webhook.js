const crypto = require('crypto');

function parseSignature(header) {
  const out = {};
  for (const part of String(header || '').split(',')) {
    const [k, v] = part.split('=');
    if (k && v) out[k] = v;
  }
  return out;
}

function verify(raw, header, secret) {
  const sig = parseSignature(header);
  if (!sig.t || !sig.v1) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${sig.t}.${raw}`, 'utf8').digest('hex');
  try { return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig.v1)); } catch { return false; }
}

async function updateProfile(userId, patch) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !userId) throw new Error('Supabase server integration is not configured.');
  const r = await fetch(`${url}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`, {
    method: 'PATCH',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(patch)
  });
  if (!r.ok) throw new Error(`Supabase profile update failed: ${r.status}`);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !verify(raw, req.headers['stripe-signature'], secret)) return res.status(400).json({ error: 'Invalid Stripe signature.' });

  try {
    const event = JSON.parse(raw);
    const obj = event.data?.object || {};
    const userId = obj.metadata?.user_id || obj.subscription_details?.metadata?.user_id;
    const plan = obj.metadata?.plan || obj.subscription_details?.metadata?.plan;

    if (event.type === 'checkout.session.completed') {
      if (userId) await updateProfile(userId, {
        plan: plan || 'pro',
        subscription_status: 'active',
        stripe_customer_id: obj.customer || null,
        stripe_subscription_id: obj.subscription || null
      });
    }

    if (event.type === 'customer.subscription.updated') {
      if (userId) await updateProfile(userId, {
        plan: plan || 'pro',
        subscription_status: obj.status || 'unknown',
        stripe_customer_id: obj.customer || null,
        stripe_subscription_id: obj.id || null,
        stripe_price_id: obj.items?.data?.[0]?.price?.id || null,
        subscription_current_period_end: obj.current_period_end ? new Date(obj.current_period_end * 1000).toISOString() : null
      });
    }

    if (event.type === 'customer.subscription.deleted') {
      if (userId) await updateProfile(userId, { plan: 'free', subscription_status: 'canceled', stripe_subscription_id: null, stripe_price_id: null });
    }

    if (event.type === 'invoice.payment_failed') {
      if (userId) await updateProfile(userId, { subscription_status: 'past_due' });
    }

    return res.status(200).json({ received: true });
  } catch (e) {
    console.error('stripe webhook error', e);
    return res.status(500).json({ error: e.message || 'Webhook failed.' });
  }
};
