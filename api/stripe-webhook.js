const crypto = require('crypto');

// Stripe requires the exact raw request body for signature verification.
// Vercel's Node functions can otherwise parse JSON before this handler sees it.
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
    if (key === 'v1') (parts.v1 ||= []).push(value);
    else parts[key] = value;
  }

  if (!parts.t || !parts.v1?.length) return false;

  const timestamp = Number(parts.t);
  if (!Number.isFinite(timestamp)) return false;

  // Reject stale/replayed webhook payloads.
  const tolerance = 5 * 60;
  if (Math.abs(Math.floor(Date.now() / 1000) - timestamp) > tolerance) return false;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${parts.t}.${rawBody.toString('utf8')}`, 'utf8')
    .digest();

  return parts.v1.some((candidate) => {
    try {
      const received = Buffer.from(candidate, 'hex');
      return received.length === expected.length && crypto.timingSafeEqual(expected, received);
    } catch {
      return false;
    }
  });
}

async function updateProfile(userId, patch) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !userId) throw new Error('Supabase server integration is not configured.');

  const r = await fetch(`${url}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`, {
    method: 'PATCH',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    },
    body: JSON.stringify(patch)
  });

  if (!r.ok) throw new Error(`Supabase profile update failed: ${r.status}`);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return res.status(500).json({ error: 'Stripe webhook secret is not configured.' });

  let rawBody;
  try {
    rawBody = await readRawBody(req);
  } catch (e) {
    console.error('stripe webhook body read error', e);
    return res.status(400).json({ error: 'Unable to read webhook body.' });
  }

  if (!verifyStripeSignature(rawBody, req.headers['stripe-signature'], secret)) {
    return res.status(400).json({ error: 'Invalid Stripe signature.' });
  }

  try {
    const event = JSON.parse(rawBody.toString('utf8'));
    const obj = event.data?.object || {};
    const userId = obj.metadata?.user_id || obj.subscription_details?.metadata?.user_id;
    const plan = obj.metadata?.plan || obj.subscription_details?.metadata?.plan;

    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      if (userId) {
        await updateProfile(userId, {
          plan: plan || 'pro',
          subscription_status: 'active',
          stripe_customer_id: obj.customer || null,
          stripe_subscription_id: obj.subscription || null
        });
      }
    }

    if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
      if (userId) {
        await updateProfile(userId, {
          plan: plan || 'pro',
          subscription_status: obj.status || 'unknown',
          stripe_customer_id: obj.customer || null,
          stripe_subscription_id: obj.id || null,
          stripe_price_id: obj.items?.data?.[0]?.price?.id || null,
          subscription_current_period_end: obj.current_period_end
            ? new Date(obj.current_period_end * 1000).toISOString()
            : null
        });
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      if (userId) {
        await updateProfile(userId, {
          plan: 'free',
          subscription_status: 'canceled',
          stripe_subscription_id: null,
          stripe_price_id: null,
          subscription_current_period_end: null
        });
      }
    }

    if (event.type === 'invoice.payment_failed') {
      if (userId) await updateProfile(userId, { subscription_status: 'past_due' });
    }

    if (event.type === 'invoice.payment_succeeded') {
      if (userId) await updateProfile(userId, { subscription_status: 'active' });
    }

    return res.status(200).json({ received: true });
  } catch (e) {
    console.error('stripe webhook error', e);
    return res.status(500).json({ error: e.message || 'Webhook failed.' });
  }
};
