const original = require('./app');

module.exports = async function(req,res){
  const end = res.end.bind(res);
  res.end = function(body, encoding, cb){
    try {
      // app.js can finish the response with either a string or a Buffer.
      if(Buffer.isBuffer(body)) body = body.toString('utf8');
      if(typeof body === 'string'){
        body = body.replace(
          "localStorage.removeItem(TK);localStorage.removeItem(RK);localStorage.removeItem('psLoggedIn');showAuth();return null",
          "if(/401|Sign in required/i.test(String(e&&e.message||''))){localStorage.removeItem(TK);localStorage.removeItem(RK);localStorage.removeItem('psLoggedIn');showAuth();return null}hideAuth();tier='standard';return null"
        );

        const fix = `<script>(function(){
(function(){
  var ID='psBrandNewAiClose';
  function panel(){return document.getElementById('psPanel');}
  function button(){return document.getElementById(ID);}
  function closeNow(e){
    if(e){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();}
    var p=panel();
    if(p){
      p.classList.remove('open');
      p.style.setProperty('display','none','important');
      p.setAttribute('aria-hidden','true');
    }
    var b=button();
    if(b){b.style.setProperty('display','none','important');}
    return false;
  }
  function build(){
    // Permanently remove the OLD close button. It is no longer used.
    document.querySelectorAll('.psClose').forEach(function(x){x.remove();});
    var b=button();
    if(!b){
      b=document.createElement('button');
      b.id=ID;
      b.type='button';
      b.textContent='CLOSE AI';
      b.setAttribute('aria-label','Close Panic AI');
      b.setAttribute('data-new-ai-close','true');
      b.style.cssText='display:none!important;position:fixed!important;top:12px!important;right:12px!important;z-index:2147483647!important;width:118px!important;height:48px!important;padding:0!important;border:2px solid #ffffff!important;border-radius:14px!important;background:#d71939!important;color:#ffffff!important;font:900 15px/48px system-ui,sans-serif!important;text-align:center!important;cursor:pointer!important;pointer-events:auto!important;touch-action:manipulation!important;box-shadow:0 8px 28px rgba(0,0,0,.7)!important;';
      b.addEventListener('click',closeNow,true);
      b.addEventListener('pointerdown',function(e){e.stopPropagation();},true);
      b.addEventListener('pointerup',closeNow,true);
      b.addEventListener('touchend',closeNow,true);
      document.body.appendChild(b);
    }
    var p=panel();
    if(p && p.classList.contains('open')) b.style.setProperty('display','block','important');
    else b.style.setProperty('display','none','important');
  }
  function start(){
    if(!document.body)return setTimeout(start,50);
    build();
    setInterval(build,250);
    new MutationObserver(function(){build();}).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style']});
    document.addEventListener('click',function(e){var b=e.target&&e.target.closest?e.target.closest('#'+ID):null;if(b)closeNow(e);},true);
    document.addEventListener('pointerup',function(e){var b=e.target&&e.target.closest?e.target.closest('#'+ID):null;if(b)closeNow(e);},true);
    document.addEventListener('touchend',function(e){var b=e.target&&e.target.closest?e.target.closest('#'+ID):null;if(b)closeNow(e);},true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
})();</script>`;
        if(body.includes('</body>')) body=body.replace('</body>',fix+'</body>'); else body+=fix;
      }
    } catch(err) { console.error('app wrapper patch:',err); }
    return end(body,encoding,cb);
  };
  return original(req,res);
};
