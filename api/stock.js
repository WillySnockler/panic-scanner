export default async function handler(request, response) {
  const symbol = String(request.query?.symbol || "").trim().toUpperCase();

  if (!symbol) {
    return response.status(400).json({ error: "Missing stock symbol." });
  }

  const key = process.env.ALPHA_VANTAGE_API_KEY;

  if (!key) {
    return response.status(500).json({
      error: "ALPHA_VANTAGE_API_KEY is not configured in Vercel."
    });
  }

  try {
    const url =
      "https://www.alphavantage.co/query" +
      "?function=TIME_SERIES_DAILY" +
      "&symbol=" + encodeURIComponent(symbol) +
      "&outputsize=compact" +
      "&apikey=" + encodeURIComponent(key);

    const r = await fetch(url);
    const data = await r.json();

    if (!r.ok) {
      throw new Error("Alpha Vantage request failed.");
    }

    if (data["Error Message"]) {
      return response.status(404).json({
        error: "Stock symbol not found."
      });
    }

    if (data["Note"]) {
      return response.status(429).json({
        error: "Market-data API limit reached. Try again later."
      });
    }

    const series = data["Time Series (Daily)"];

    if (!series) {
      return response.status(502).json({
        error: "No daily market data was returned."
      });
    }

    const history = Object.entries(series)
      .map(([date, values]) => ({
        date,
        open: Number(values["1. open"]),
        high: Number(values["2. high"]),
        low: Number(values["3. low"]),
        close: Number(values["4. close"]),
        volume: Number(values["5. volume"])
      }))
      .filter(x => Number.isFinite(x.close))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (history.length < 20) {
      return response.status(502).json({
        error: "Not enough historical data for analysis."
      });
    }

    const latest = history[history.length - 1];
    const previous = history[history.length - 2];

    const closes = history.map(x => x.close);

    function sma(values, period) {
      if (values.length < period) return null;

      const slice = values.slice(-period);
      return slice.reduce((sum, value) => sum + value, 0) / period;
    }

    function rsi(values, period = 14) {
      if (values.length <= period) return null;

      let gains = 0;
      let losses = 0;

      for (let i = values.length - period; i < values.length; i++) {
        const change = values[i] - values[i - 1];

        if (change > 0) {
          gains += change;
        } else {
          losses += Math.abs(change);
        }
      }

      const averageGain = gains / period;
      const averageLoss = losses / period;

      if (averageLoss === 0) return 100;

      const rs = averageGain / averageLoss;
      return 100 - (100 / (1 + rs));
    }

    const sma20 = sma(closes, 20);
    const sma50 = sma(closes, 50);
    const rsi14 = rsi(closes, 14);

    const recent20 = closes.slice(-20);
    const highest20 = Math.max(...recent20);

    const drawdown20 =
      highest20 > 0
        ? ((latest.close - highest20) / highest20) * 100
        : 0;

    const change = latest.close - previous.close;

    const changePercent =
      previous.close !== 0
        ? (change / previous.close) * 100
        : 0;

    /*
      PANIC / OVEREACTION HEURISTIC

      Higher score = stronger signs of a selloff/possible overreaction.

      This is NOT a buy recommendation.
    */

    let score = 0;

    // Large daily decline
    if (changePercent <= -8) score += 35;
    else if (changePercent <= -5) score += 28;
    else if (changePercent <= -3) score += 20;
    else if (changePercent <= -2) score += 12;
    else if (changePercent <= -1) score += 5;

    // RSI weakness
    if (rsi14 !== null) {
      if (rsi14 <= 25) score += 25;
      else if (rsi14 <= 30) score += 20;
      else if (rsi14 <= 35) score += 12;
      else if (rsi14 <= 40) score += 5;
    }

    // Recent drawdown
    if (drawdown20 <= -20) score += 25;
    else if (drawdown20 <= -15) score += 20;
    else if (drawdown20 <= -10) score += 15;
    else if (drawdown20 <= -5) score += 8;

    // Below moving averages
    if (sma20 !== null && latest.close < sma20) {
      score += 5;
    }

    if (sma50 !== null && latest.close < sma50) {
      score += 5;
    }

    score = Math.max(0, Math.min(100, Math.round(score)));

    let verdict;

    if (score >= 75) {
      verdict = "Extreme panic";
    } else if (score >= 55) {
      verdict = "Strong panic";
    } else if (score >= 35) {
      verdict = "Elevated fear";
    } else if (score >= 20) {
      verdict = "Mild weakness";
    } else {
      verdict = "No major panic";
    }

    return response.status(200).json({
      symbol,
      price: latest.close,
      change,
      changePercent:
        (changePercent >= 0 ? "+" : "") +
        changePercent.toFixed(2) +
        "%",

      volume: latest.volume,

      technicals: {
        rsi14: rsi14 !== null ? Number(rsi14.toFixed(2)) : null,
        sma20: sma20 !== null ? Number(sma20.toFixed(2)) : null,
        sma50: sma50 !== null ? Number(sma50.toFixed(2)) : null,
        drawdown20: Number(drawdown20.toFixed(2))
      },

      panic: {
        score,
        verdict
      },

      history: history.slice(-60).map(x => ({
        date: x.date,
        close: x.close
      }))
    });

  } catch (error) {
    console.error(error);

    return response.status(500).json({
      error: "Unable to retrieve market data."
    });
  }
}
