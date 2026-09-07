export default async function handler(req, res) {
  const checks = {
    marketData: Boolean(process.env.ALPHA_VANTAGE_API_KEY),
    supabase: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
    supabaseService: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    stripe: Boolean(process.env.STRIPE_SECRET_KEY),
    stripeWebhook: Boolean(process.env.STRIPE_WEBHOOK_SECRET)
  };

  const configured = Object.values(checks).every(Boolean);
  res.status(configured ? 200 : 503).json({
    ok: configured,
    configured,
    checks,
    service: 'panic-scanner-v4',
    timestamp: new Date().toISOString()
  });
}
