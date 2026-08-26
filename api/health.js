export default async function handler(req, res) {
  res.status(200).json({
    ok: true,
    configured: Boolean(process.env.ALPHA_VANTAGE_API_KEY),
    service: 'panic-scanner-v4',
    timestamp: new Date().toISOString()
  });
}
