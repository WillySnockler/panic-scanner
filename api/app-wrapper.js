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
function closeAi(){var p=document.getElementById('psPanel');if(!p)return;p.classList.remove('open');p.style.setProperty('display','none','important');p.setAttribute('aria-hidden','true');}
function install(){var p=document.getElementById('psPanel');if(!p)return;
  var b=document.getElementById('psNewClose');
  if(!b){b=document.createElement('button');b.id='psNewClose';b.type='button';b.textContent='✕ Close AI';b.style.cssText='display:block;width:100%;margin:14px 0 0;padding:12px 16px;border:1px solid #39455b;border-radius:11px;background:#111925;color:#fff;font:900 14px system-ui;cursor:pointer;pointer-events:auto;touch-action:manipulation;position:relative;z-index:2147483647;';b.onclick=function(e){e.preventDefault();e.stopPropagation();closeAi();return false;};b.onpointerup=function(e){e.preventDefault();e.stopPropagation();closeAi();return false;};p.appendChild(b);}
  b.style.display=p.classList.contains('open')?'block':'none';
}
var oldOpen=window.psOpenAi;
if(typeof oldOpen==='function'&&!window.__psOpenWrapped){window.__psOpenWrapped=true;window.psOpenAi=function(){var p=document.getElementById('psPanel');if(p)p.style.removeProperty('display');var r=oldOpen.apply(this,arguments);setTimeout(install,0);return r;};}
window.psClosePanel=closeAi;
document.addEventListener('click',function(e){if(e.target&&e.target.closest&&e.target.closest('#psNewClose')){e.preventDefault();e.stopPropagation();closeAi();}},true);
document.addEventListener('pointerup',function(e){if(e.target&&e.target.closest&&e.target.closest('#psNewClose')){e.preventDefault();e.stopPropagation();closeAi();}},true);
install();setInterval(install,500);
})();</script>`;
        if(body.includes('</body>')) body=body.replace('</body>',fix+'</body>'); else body+=fix;
      }
    } catch(err) { console.error('app wrapper patch:',err); }
    return end(body,encoding,cb);
  };
  return original(req,res);
};
