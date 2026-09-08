const crypto = require('crypto');

module.exports.config = { api: { bodyParser: false } };

async function readRawBody(req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return Buffer.from(req.body, 'utf8');
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks);
}

function verifyStripeSignature(rawBody, header, secret) {
  const parts = {};
  for (const part of String(header || '').split(',')) {
    const [key, value] = part.split('=');
    if (!key || !value) continue;
    if (key === 'v1') (parts.v1 ||= []).push(value); else parts[key] = value;
  }
  if (!parts.t || !parts.v1?.length) return false;
  const timestamp = Number(parts.t);
  if (!Number.isFinite(timestamp) || Math.abs(Math.floor(Date.now() / 1000) - timestamp) > 5 * 60) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${parts.t}.${rawBody.toString('utf8')}`, 'utf8').digest();
  return parts.v1.some(candidate => {
    try { const received = Buffer.from(candidate, 'hex'); return received.length === expected.length && crypto.timingSafeEqual(expected, received); }
    catch { return false; }
  });
}

async function supabaseRequest(path, options = {}) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase server integration is not configured.');
  const r = await fetch(`${url}/rest/v1/${path}`, { ...options, headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...(options.headers || {}) } });
  if (!r.ok) throw new Error(`Supabase request failed: ${r.status}`);
  return r;
}

async function updateProfile(userId, patch) {
  if (!userId) return;
  await supabaseRequest('profiles', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ id: userId, ...patch }) });
}

async function findUserIdByStripe({ customerId, subscriptionId }) {
  const filters = [];
  if (customerId) filters.push(`stripe_customer_id=eq.${encodeURIComponent(customerId)}`);
  if (subscriptionId) filters.push(`stripe_subscription_id=eq.${encodeURIComponent(subscriptionId)}`);
  for (const filter of filters) {
    const r = await supabaseRequest(`profiles?select=id&${filter}&limit=1`);
    const rows = await r.json();
    if (rows?.[0]?.id) return rows[0].id;
  }
  return null;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return res.status(500).json({ error: 'Stripe webhook secret is not configured.' });
  let rawBody;
  try { rawBody = await readRawBody(req); } catch (e) { return res.status(400).json({ error: 'Unable to read webhook body.' }); }
  if (!verifyStripeSignature(rawBody, req.headers['stripe-signature'], secret)) return res.status(400).json({ error: 'Invalid Stripe signature.' });

  try {
    const event = JSON.parse(rawBody.toString('utf8'));
    const obj = event.data?.object || {};
    const metadata = obj.metadata || obj.subscription_details?.metadata || {};
    const customerId = obj.customer || obj.customer_id || null;
    const subscriptionId = obj.subscription || (obj.object === 'subscription' ? obj.id : null) || null;
    const userId = metadata.user_id || await findUserIdByStripe({ customerId, subscriptionId });
    const rawPlan = String(metadata.plan || '').toLowerCase();
    const plan = rawPlan === 'elite' ? 'elite' : rawPlan === 'pro' ? 'pro' : null;

    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      if (userId) await updateProfile(userId, { ...(plan ? { plan } : {}), subscription_status: 'active', stripe_customer_id: customerId, stripe_subscription_id: subscriptionId });
    }
    if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
      if (userId) {
        const status = String(obj.status || 'unknown').toLowerCase();
        const active = ['active', 'trialing'].includes(status);
        const patch = {
          subscription_status: status,
          stripe_customer_id: customerId,
          stripe_subscription_id: obj.id || subscriptionId,
          stripe_price_id: obj.items?.data?.[0]?.price?.id || null,
          subscription_current_period_end: obj.current_period_end ? new Date(obj.current_period_end * 1000).toISOString() : null
        };
        if (active && plan) patch.plan = plan;
        if (!active && ['canceled', 'unpaid', 'incomplete_expired'].includes(status)) patch.plan = 'standard';
        await updateProfile(userId, patch);
      }
    }
    if (event.type === 'customer.subscription.deleted' && userId) await updateProfile(userId, { plan: 'standard', subscription_status: 'canceled', stripe_subscription_id: null, stripe_price_id: null, subscription_current_period_end: null });
    if (event.type === 'invoice.payment_failed' && userId) await updateProfile(userId, { subscription_status: 'past_due' });
    if (event.type === 'invoice.payment_succeeded' && userId) await updateProfile(userId, { subscription_status: 'active' });
    return res.status(200).json({ received: true });
  } catch (e) {
    console.error('stripe webhook error', e);
    return res.status(500).json({ error: e.message || 'Webhook failed.' });
  }
};
