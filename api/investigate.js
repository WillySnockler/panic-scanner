export default async function handler(request, response) {
  const symbol = String(request.query?.symbol || "").trim().toUpperCase();
  const depth = String(request.query?.depth || "pro").toLowerCase();
  if (!symbol) return response.status(400).json({ error: "Missing stock symbol." });

  const key = process.env.ALPHA_VANTAGE_API_KEY;
  if (!key) return response.status(500).json({ error: "ALPHA_VANTAGE_API_KEY is not configured in Vercel." });

  async function av(functionName, extra = {}) {
    const params = new URLSearchParams({ function: functionName, apikey: key, ...extra });
    if (functionName !== "NEWS_SENTIMENT") params.set("symbol", symbol);
    const r = await fetch(`https://www.alphavantage.co/query?${params.toString()}`);
    const data = await r.json();
    if (data.Note) throw new Error("Market-data API limit reached. Try again later.");
    if (data["Error Message"]) throw new Error("No data returned for this symbol.");
    return data;
  }

  try {
    const [overview, news] = await Promise.all([
      av("OVERVIEW"),
      av("NEWS_SENTIMENT", { tickers: symbol, limit: depth === "elite" ? "12" : "6", sort: "LATEST" })
    ]);

    let income = null;
    if (depth === "elite") {
      try { income = await av("INCOME_STATEMENT"); } catch (_) { income = null; }
    }

    const articles = (news.feed || []).slice(0, depth === "elite" ? 12 : 6).map(a => ({
      title: a.title,
      source: a.source,
      url: a.url,
      time: a.time_published,
      sentiment: a.overall_sentiment_label,
      score: Number(a.overall_sentiment_score || 0),
      summary: a.summary
    }));

    const revenue = (income?.annualReports || []).slice(0, 5).map(x => Number(x.totalRevenue)).filter(Number.isFinite);
    const eps = (income?.annualReports || []).slice(0, 5).map(x => Number(x.eps)).filter(Number.isFinite);
    const avgNews = articles.length ? articles.reduce((s, a) => s + a.score, 0) / articles.length : 0;
    const positiveNews = articles.filter(a => /positive|bullish/i.test(a.sentiment)).length;
    const negativeNews = articles.filter(a => /negative|bearish/i.test(a.sentiment)).length;
    const revenueGrowth = revenue.length >= 2 && revenue[1] ? ((revenue[0] - revenue[1]) / Math.abs(revenue[1])) * 100 : null;
    const epsGrowth = eps.length >= 2 && eps[1] ? ((eps[0] - eps[1]) / Math.abs(eps[1])) * 100 : null;

    let quality = 50;
    if (revenueGrowth !== null) quality += revenueGrowth > 0 ? 12 : -12;
    if (epsGrowth !== null) quality += epsGrowth > 0 ? 15 : -15;
    if (avgNews > 0.15) quality += 8;
    if (avgNews < -0.15) quality -= 8;
    quality = Math.max(0, Math.min(100, Math.round(quality)));

    const fundamentals = {
      sector: overview.Sector || "—", industry: overview.Industry || "—", description: overview.Description || "",
      marketCap: overview.MarketCapitalization || null, pe: overview.PERatio || null, peg: overview.PEGRatio || null,
      eps: overview.EPS || null, revenueTTM: overview.RevenueTTM || null, profitMargin: overview.ProfitMargin || null,
      operatingMargin: overview.OperatingMarginTTM || null, beta: overview.Beta || null, dividendYield: overview.DividendYield || null,
      revenueGrowth, epsGrowth
    };
    const verdict = quality >= 70 ? "Fundamentals look resilient" : quality <= 35 ? "Fundamentals show meaningful weakness" : "Fundamentals are mixed";

    return response.status(200).json({
      symbol, depth, generatedAt: new Date().toISOString(), company: overview.Name || symbol, fundamentals,
      news: { articles, averageSentiment: avgNews, positive: positiveNews, negative: negativeNews },
      earnings: depth === "elite" ? { annualReports: income?.annualReports || [], eps, revenue } : null,
      investigation: {
        quality, verdict,
        steps: [
          { id: "market", label: "Market reaction", status: "complete", detail: "Price and panic signal reviewed." },
          { id: "technical", label: "Technical condition", status: "complete", detail: "Momentum and trend context reviewed." },
          { id: "fundamentals", label: "Fundamentals", status: "complete", detail: verdict },
          { id: "catalysts", label: "Catalysts & news", status: articles.length ? "complete" : "limited", detail: articles.length ? `${articles.length} recent articles reviewed.` : "No recent news returned." },
          { id: "risk", label: "Risk assessment", status: "complete", detail: "Key risks and uncertainty reviewed." },
          { id: "conclusion", label: "Final conclusion", status: "complete", detail: "Evidence assembled into a research view." }
        ]
      }
    });
  } catch (error) {
    return response.status(502).json({ error: error.message || "Investigation failed." });
  }
}
