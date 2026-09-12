const original = require('./app');

module.exports = async function(req,res){
  const end = res.end.bind(res);
  res.end = function(body, encoding, cb){
    try {
      if(typeof body === 'string'){
        body = body.replace(
          "localStorage.removeItem(TK);localStorage.removeItem(RK);localStorage.removeItem('psLoggedIn');showAuth();return null",
          "if(/401|Sign in required/i.test(String(e&&e.message||''))){localStorage.removeItem(TK);localStorage.removeItem(RK);localStorage.removeItem('psLoggedIn');showAuth();return null}hideAuth();tier='standard';return null"
        );

        const fix = `<script>(function(){
function closeAi(){var p=document.getElementById('psPanel');if(p){p.classList.remove('open');p.style.setProperty('display','none','important');p.setAttribute('aria-hidden','true');}var b=document.getElementById('psStandaloneClose');if(b)b.style.display='none';}
function install(){
  var b=document.getElementById('psStandaloneClose');
  if(!b){
    b=document.createElement('button');
    b.id='psStandaloneClose';
    b.type='button';
    b.setAttribute('aria-label','Close AI panel');
    b.textContent='✕';
    b.style.cssText='display:none;position:fixed;top:18px;right:18px;width:52px;height:52px;border:2px solid #fff;border-radius:50%;background:#e11;color:#fff;font:900 25px/1 system-ui;cursor:pointer;pointer-events:auto;touch-action:manipulation;z-index:2147483647;box-shadow:0 4px 20px rgba(0,0,0,.6);';
    b.onclick=function(e){e.preventDefault();e.stopPropagation();closeAi();return false;};
    b.onpointerup=function(e){e.preventDefault();e.stopPropagation();closeAi();return false;};
    document.body.appendChild(b);
  }
  var p=document.getElementById('psPanel');
  if(p)b.style.display=p.classList.contains('open')?'block':'none';
}
var oldOpen=window.psOpenAi;
if(typeof oldOpen==='function'&&!window.__psOpenWrapped){
  window.__psOpenWrapped=true;
  window.psOpenAi=function(){var p=document.getElementById('psPanel');if(p)p.style.removeProperty('display');var r=oldOpen.apply(this,arguments);setTimeout(install,0);setTimeout(install,100);return r;};
}
window.psClosePanel=closeAi;
document.addEventListener('click',function(e){if(e.target&&e.target.closest&&e.target.closest('#psStandaloneClose')){e.preventDefault();e.stopPropagation();closeAi();}},true);
document.addEventListener('pointerup',function(e){if(e.target&&e.target.closest&&e.target.closest('#psStandaloneClose')){e.preventDefault();e.stopPropagation();closeAi();}},true);
install();setInterval(install,300);
})();</script>`;
        if(body.includes('</body>')) body=body.replace('</body>',fix+'</body>'); else body+=fix;
      }
    } catch(err) { console.error('app wrapper patch:',err); }
    return end(body,encoding,cb);
  };
  return original(req,res);
};
