const fs = require('fs');
const path = require('path');

function patch(html) {
  html = html.replace(
    '@media(max-width:620px){.side{top:auto;right:0;width:100%;height:68px;bottom:0;flex-direction:row;justify-content:space-around;border-right:0;border-top:1px solid var(--line);padding:7px;z-index:100}',
    '@media(max-width:620px){body{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}input,textarea{-webkit-user-select:text;user-select:text;-webkit-touch-callout:default}.side{top:auto;right:0;width:100%;height:68px;bottom:0;flex-direction:row;justify-content:space-around;border-right:0;border-top:1px solid var(--line);padding:7px;z-index:100}'
  );
  html = html.replace(
    '.chartTip,.eliteTip{min-width:160px}.authBox{padding:26px}}',
    '.chartTip,.eliteTip{min-width:160px;left:auto!important;right:10px!important;top:10px!important;max-width:calc(100% - 20px)}.authBox{padding:26px}}'
  );
  html = html.replace(
    "tip.style.left=Math.max(8,Math.min(r.width-205,x+14))+'px';tip.style.top=Math.max(8,Math.min(r.height-100,best.y/330*r.height-55))+'px'",
    "tip.style.left='auto';tip.style.right='10px';tip.style.top='10px'"
  );
  html = html.replace(
    '<text x="${Math.min(W-190,sx+8)}" y="55" fill="#ff8794" class="eliteLabel">MARKET STRESS</text><text x="${Math.min(W-180,rx+8)}" y="55" fill="#58e3b2" class="eliteLabel">RECOVERY WATCH</text>',
    '<text x="${Math.max(12,Math.min(W-190,sx-118))}" y="55" fill="#ff8794" class="eliteLabel">MARKET STRESS</text><text x="${Math.max(12,Math.min(W-180,rx+10))}" y="55" fill="#58e3b2" class="eliteLabel">RECOVERY WATCH</text>'
  );
  html = html.replace(
    '</script></body></html>',
    "document.addEventListener('contextmenu',e=>{if(window.matchMedia('(max-width:620px)').matches)e.preventDefault()});document.addEventListener('selectstart',e=>{if(window.matchMedia('(max-width:620px)').matches&&!e.target.matches('input,textarea'))e.preventDefault()});</script></body></html>"
  );
  return html;
}

module.exports = (req, res) => {
  const source = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.status(200).send(patch(source));
};
