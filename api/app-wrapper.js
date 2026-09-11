const original = require('./app');

module.exports = async function(req,res){
  const end = res.end.bind(res);
  res.end = function(body, encoding, cb){
    try {
      if(typeof body === 'string'){
        // A database/account-load failure must not destroy an otherwise valid auth session.
        body = body.replace(
          "localStorage.removeItem(TK);localStorage.removeItem(RK);localStorage.removeItem('psLoggedIn');showAuth();return null",
          "if(/401|Sign in required/i.test(String(e&&e.message||''))){localStorage.removeItem(TK);localStorage.removeItem(RK);localStorage.removeItem('psLoggedIn');showAuth();return null}hideAuth();tier='standard';return null"
        );

        // Guaranteed AI-panel close control. This runs after the app and final-fix scripts,
        // delegates at capture phase, and does not use a MutationObserver (avoids freezes).
        const fix = `<script>(function(){\nfunction psCloseHard(){var p=document.getElementById('psPanel');if(!p)return;p.classList.remove('open');p.style.setProperty('display','none','important');p.setAttribute('aria-hidden','true');var b=document.getElementById('psEmergencyClose');if(b)b.style.display='none';}\nwindow.psClosePanel=psCloseHard;\nfunction wire(){var p=document.getElementById('psPanel');if(!p)return;var c=p.querySelector('.psClose');if(c){c.style.setProperty('pointer-events','auto','important');c.style.setProperty('touch-action','manipulation','important');c.style.setProperty('z-index','2147483647','important');c.onclick=function(e){e.preventDefault();e.stopPropagation();psCloseHard();return false;};c.onpointerup=function(e){e.preventDefault();e.stopPropagation();psCloseHard();return false;};}\nif(!document.getElementById('psEmergencyClose')){var b=document.createElement('button');b.id='psEmergencyClose';b.type='button';b.textContent='Close';b.style.cssText='display:none;position:fixed;right:18px;top:66px;z-index:2147483647;padding:10px 14px;border:1px solid #39455b;border-radius:9px;background:#111925;color:#fff;font:800 14px system-ui;pointer-events:auto;touch-action:manipulation;';b.onclick=psCloseHard;b.onpointerup=psCloseHard;document.body.appendChild(b);}}\nfunction sync(){var p=document.getElementById('psPanel'),b=document.getElementById('psEmergencyClose');if(!p||!b)return;var open=p.classList.contains('open')&&getComputedStyle(p).display!=='none';b.style.display=open?'block':'none';}\ndocument.addEventListener('pointerup',function(e){if(e.target&&e.target.closest&&e.target.closest('#psPanel .psClose,#psEmergencyClose')){e.preventDefault();e.stopPropagation();psCloseHard();}},true);\ndocument.addEventListener('click',function(e){if(e.target&&e.target.closest&&e.target.closest('#psPanel .psClose,#psEmergencyClose')){e.preventDefault();e.stopPropagation();psCloseHard();}},true);\nwire();sync();setInterval(function(){wire();sync();},500);\n})();</script>`;
        if(body.includes('</body>')) body=body.replace('</body>',fix+'</body>'); else body+=fix;
      }
    } catch(err) { console.error('app wrapper patch:',err); }
    return end(body,encoding,cb);
  };
  return original(req,res);
};
