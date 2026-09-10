(function(){
'use strict';
var LEGACY='https://raw.githubusercontent.com/WillySnockler/panic-scanner/3697f706b07f40953256857d0c1ebe4528e5026b/final-fix.js';
function loadLegacy(done){
  if(window.__psLegacyLoaded){done();return;}
  var s=document.createElement('script');
  s.src=LEGACY;
  s.onload=function(){window.__psLegacyLoaded=true;done()};
  s.onerror=function(){done()};
  document.head.appendChild(s);
}
function close(){
  var p=document.getElementById('psPanel');
  if(p){p.classList.remove('open');p.style.setProperty('display','none','important');p.setAttribute('aria-hidden','true');}
  var x=document.getElementById('psEmergencyClose');
  if(x)x.style.display='none';
}
function install(){
  if(!document.body)return;
  var x=document.getElementById('psEmergencyClose');
  if(!x){
    x=document.createElement('button');
    x.id='psEmergencyClose';
    x.type='button';
    x.textContent='×  CLOSE AI';
    x.setAttribute('aria-label','Close Panic AI');
    x.style.cssText='position:fixed!important;top:10px!important;right:10px!important;width:112px!important;height:48px!important;z-index:2147483647!important;display:none;align-items:center;justify-content:center;box-sizing:border-box;border:1px solid rgba(143,130,255,.8);border-radius:12px;background:rgba(9,14,22,.98);color:#fff;font:900 12px -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;letter-spacing:.5px;box-shadow:0 8px 30px rgba(0,0,0,.65),0 0 20px rgba(117,104,255,.3);pointer-events:auto!important;touch-action:manipulation!important;-webkit-user-select:none;user-select:none;';
    document.body.appendChild(x);
    ['pointerdown','pointerup','touchstart','touchend','click'].forEach(function(type){
      x.addEventListener(type,function(e){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();close();},true);
    });
  }
  function sync(){
    var p=document.getElementById('psPanel');
    if(p&&p.classList.contains('open')){
      x.style.setProperty('display','flex','important');
    }else{
      x.style.setProperty('display','none','important');
    }
  }
  setInterval(sync,150);
  new MutationObserver(sync).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});
  sync();
}
loadLegacy(install);
})();
