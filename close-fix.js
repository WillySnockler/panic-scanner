(function(){
'use strict';
function closePanel(){
  var p=document.getElementById('psPanel');
  if(p){p.classList.remove('open');p.style.setProperty('display','none','important');p.setAttribute('aria-hidden','true');}
  var x=document.getElementById('psEmergencyClose');
  if(x)x.style.setProperty('display','none','important');
}
function install(){
  if(!document.body)return;
  var x=document.getElementById('psEmergencyClose');
  if(!x){
    x=document.createElement('button');
    x.id='psEmergencyClose';x.type='button';x.textContent='× CLOSE AI';x.setAttribute('aria-label','Close Panic AI');
    x.style.cssText='position:fixed!important;top:8px!important;right:8px!important;width:132px!important;height:52px!important;z-index:2147483647!important;display:none;align-items:center;justify-content:center;box-sizing:border-box;border:2px solid #8b7cff!important;border-radius:13px!important;background:#101722!important;color:#fff!important;font:900 13px -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif!important;letter-spacing:.4px;box-shadow:0 8px 30px #000!important;pointer-events:auto!important;touch-action:manipulation!important;user-select:none!important;-webkit-user-select:none!important;';
    document.body.appendChild(x);
    function hit(e){if(e){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();}closePanel();return false;}
    x.addEventListener('pointerdown',hit,{capture:true,passive:false});
    x.addEventListener('touchstart',hit,{capture:true,passive:false});
    x.addEventListener('click',hit,{capture:true,passive:false});
  }
  function delegated(e){var t=e.target;if(t&&t.closest&&t.closest('#psPanel .psClose,#psEmergencyClose')){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();closePanel();}}
  document.addEventListener('pointerdown',delegated,true);
  document.addEventListener('touchstart',delegated,true);
  document.addEventListener('click',delegated,true);
  function sync(){var p=document.getElementById('psPanel');if(p&&p.classList.contains('open')){x.style.setProperty('display','flex','important');p.style.setProperty('z-index','2147483646','important');}else{x.style.setProperty('display','none','important');}}
  sync();setInterval(sync,100);
  new MutationObserver(sync).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
