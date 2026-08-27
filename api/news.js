export default async function handler(request, response) {
  const symbol = String(request.query?.symbol || '').trim().toUpperCase();
  if (!symbol) return response.status(400).json({ error: 'Missing stock symbol.' });
  const key = process.env.ALPHA_VANTAGE_API_KEY;
  if (!key) return response.status(500).json({ error: 'ALPHA_VANTAGE_API_KEY is not configured in Vercel.' });

  try {
    const params = new URLSearchParams({
      function: 'NEWS_SENTIMENT',
      tickers: symbol,
      limit: '50',
      sort: 'LATEST',
      apikey: key
    });
    const r = await fetch(`https://www.alphavantage.co/query?${params}`, { cache: 'no-store' });
    const data = await r.json();
    if (data.Note) return response.status(429).json({ error: 'Market news API limit reached. Try again shortly.' });
    if (data['Error Message']) return response.status(502).json({ error: 'News provider rejected this symbol.' });

    // Alpha Vantage can return a broad feed even when tickers= is supplied.
    // Keep only articles that explicitly carry sentiment for the requested ticker.
    const relevant = (data.feed || []).filter(article => {
      const sentiments = Array.isArray(article.ticker_sentiment) ? article.ticker_sentiment : [];
      return sentiments.some(t => String(t.ticker || '').toUpperCase() === symbol && Number(t.relevance_score || 0) > 0.05);
    });

    const articles = relevant.slice(0, 12).map(a => {
      const ts = (Array.isArray(a.ticker_sentiment) ? a.ticker_sentiment : []).find(t => String(t.ticker || '').toUpperCase() === symbol);
      return {
        title: a.title || 'Market headline',
        source: a.source || 'Market news',
        url: a.url || '',
        time: a.time_published || '',
        sentiment: ts?.ticker_sentiment_label || a.overall_sentiment_label || 'Neutral',
        score: Number(ts?.ticker_sentiment_score ?? a.overall_sentiment_score ?? 0),
        relevance: Number(ts?.relevance_score || 0),
        summary: a.summary || ''
      };
    });

    return response.status(200).json({
      symbol,
      updatedAt: new Date().toISOString(),
      articles,
      positive: articles.filter(a => /positive|bullish/i.test(a.sentiment)).length,
      negative: articles.filter(a => /negative|bearish/i.test(a.sentiment)).length
    });
  } catch (error) {
    return response.status(502).json({ error: error.message || 'Unable to load live news.' });
  }
}
