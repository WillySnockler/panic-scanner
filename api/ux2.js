const fs = require('fs');
const path = require('path');

export default function handler(req, res) {
  let html = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');

  const fix = `<script id="panic-scanner-nav-fix">(function(){
    function bind(){
      const navs=document.querySelectorAll('.side > .nav');
      navs.forEach(function(n){
        const label=(n.querySelector('span')?.textContent||'').trim().toLowerCase();
        if(label==='watchlist') n.onclick=function(e){e.preventDefault();if(typeof go==='function')go('watchlist');};
        if(label==='plans') n.onclick=function(e){e.preventDefault();if(typeof openModal==='function')openModal('plansModal');};
        if(label==='settings') n.onclick=function(e){e.preventDefault();if(typeof openModal==='function')openModal('settingsModal');};
      });
    }
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
  })();</script>`;

  html=html.replace('</body>',fix+'</body>');
  res.setHeader('Content-Type','text/html; charset=utf-8');
  res.setHeader('Cache-Control','no-store, max-age=0, must-revalidate');
  res.status(200).send(html);
}
