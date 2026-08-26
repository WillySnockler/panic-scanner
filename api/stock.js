export default async function handler(request, response) {
  const symbol = String(request.query?.symbol || "").trim().toUpperCase();
  if (!symbol) return response.status(400).json({ error: "Missing stock symbol." });
  const key = process.env.ALPHA_VANTAGE_API_KEY;
  if (!key) return response.status(500).json({ error: "ALPHA_VANTAGE_API_KEY is not configured in Vercel." });

  try {
    const url = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=" + encodeURIComponent(symbol) + "&outputsize=compact&apikey=" + encodeURIComponent(key);
    const r = await fetch(url);
    const data = await r.json();
    if (!r.ok) throw new Error("Alpha Vantage request failed.");
    if (data["Error Message"]) return response.status(404).json({ error: "Stock symbol not found." });
    if (data.Note) return response.status(429).json({ error: "Market-data API limit reached. Try again later." });
    const series = data["Time Series (Daily)"];
    if (!series) return response.status(502).json({ error: "No daily market data was returned." });

    const history = Object.entries(series).map(([date, v]) => ({
      date,
      open: Number(v["1. open"]),
      high: Number(v["2. high"]),
      low: Number(v["3. low"]),
      close: Number(v["4. close"]),
      volume: Number(v["5. volume"])
    })).filter(x => Number.isFinite(x.close)).sort((a,b) => new Date(a.date)-new Date(b.date));
    if (history.length < 20) return response.status(502).json({ error: "Not enough historical data for analysis." });

    const closes = history.map(x => x.close);
    const latest = history.at(-1), previous = history.at(-2);
    const sma = p => closes.length < p ? null : closes.slice(-p).reduce((a,b)=>a+b,0)/p;
    const sma20 = sma(20), sma50 = sma(50);
    function rsi(values, period=14){
      if(values.length<=period)return null;
      let gains=0,losses=0;
      for(let i=values.length-period;i<values.length;i++){const c=values[i]-values[i-1];if(c>0)gains+=c;else losses+=Math.abs(c);}
      const ag=gains/period, al=losses/period;if(al===0)return 100;const rs=ag/al;return 100-(100/(1+rs));
    }
    const rsi14=rsi(closes);
    const recent20=closes.slice(-20), high20=Math.max(...recent20);
    const drawdown20=high20?((latest.close-high20)/high20)*100:0;
    const change=latest.close-previous.close, changePercent=previous.close?change/previous.close*100:0;

    let score=0;
    if(changePercent<=-8)score+=35;else if(changePercent<=-5)score+=28;else if(changePercent<=-3)score+=20;else if(changePercent<=-2)score+=12;else if(changePercent<=-1)score+=5;
    if(rsi14!==null){if(rsi14<=25)score+=25;else if(rsi14<=30)score+=20;else if(rsi14<=35)score+=12;else if(rsi14<=40)score+=5;}
    if(drawdown20<=-20)score+=25;else if(drawdown20<=-15)score+=20;else if(drawdown20<=-10)score+=15;else if(drawdown20<=-5)score+=8;
    if(sma20!==null&&latest.close<sma20)score+=5;if(sma50!==null&&latest.close<sma50)score+=5;
    score=Math.max(0,Math.min(100,Math.round(score)));
    const verdict=score>=75?"Extreme panic":score>=55?"Strong panic":score>=35?"Elevated fear":score>=20?"Mild weakness":"No major panic";

    let rollingHigh=-Infinity;
    const chartHistory=history.slice(-60).map((x,i,arr)=>{
      rollingHigh=Math.max(rollingHigh,x.close);
      const prev=i?arr[i-1].close:x.close;
      const daily=prev?((x.close-prev)/prev)*100:0;
      const dd=rollingHigh?((x.close-rollingHigh)/rollingHigh)*100:0;
      const stress=daily<=-5||dd<=-12?3:daily<=-3||dd<=-8?2:daily<=-2||dd<=-5?1:0;
      return {date:x.date,close:x.close,open:x.open,high:x.high,low:x.low,volume:x.volume,dailyChange:Number(daily.toFixed(2)),drawdown:Number(dd.toFixed(2)),stress};
    });

    return response.status(200).json({
      symbol, price:latest.close, change, changePercent:(changePercent>=0?"+":"")+changePercent.toFixed(2)+"%", volume:latest.volume,
      technicals:{rsi14:rsi14!==null?Number(rsi14.toFixed(2)):null,sma20:sma20!==null?Number(sma20.toFixed(2)):null,sma50:sma50!==null?Number(sma50.toFixed(2)):null,drawdown20:Number(drawdown20.toFixed(2))},
      panic:{score,verdict}, history:chartHistory
    });
  } catch(error){
    console.error(error);return response.status(500).json({error:"Unable to retrieve market data."});
  }
}
