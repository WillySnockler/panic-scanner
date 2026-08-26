export default async function handler(request, response) {
  try {
    const q = request.query?.q;

    if (!q) {
      return response.status(400).json({ error: 'Missing search query' });
    }

    const key = process.env.ALPHA_VANTAGE_API_KEY;

    if (!key) {
      return response.status(500).json({ error: 'API key is not configured' });
    }

    const url =
      'https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=' +
      encodeURIComponent(q) +
      '&apikey=' +
      encodeURIComponent(key);

    const r = await fetch(url);
    const data = await r.json();

    if (data.Note) {
      return response.status(429).json({ error: data.Note });
    }

    if (data['Error Message']) {
      return response.status(400).json({ error: data['Error Message'] });
    }

    const matches = (data.bestMatches || []).map(x => ({
      symbol: x['1. symbol'],
      name: x['2. name'],
      type: x['3. type'],
      region: x['4. region'],
      currency: x['8. currency']
    }));

    return response.status(200).json({ matches });

  } catch (error) {
    return response.status(500).json({
      error: 'Search failed'
    });
  }
}
