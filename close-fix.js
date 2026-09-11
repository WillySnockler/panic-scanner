(function(){
'use strict';

function closeAi(){
  var p=document.getElementById('psPanel');
  if(p){
    p.classList.remove('open');
    p.removeAttribute('style');
    p.style.setProperty('display','none','important');
    p.setAttribute('aria-hidden','true');
  }
  var e=document.getElementById('psEmergencyClose');
  if(e)e.style.setProperty('display','none','important');
}

function install(){
  if(!document.body)return;

  var e=document.getElementById('psEmergencyClose');
  if(!e){
    e=document.createElement('button');
    e.id='psEmergencyClose';
    e.type='button';
    e.setAttribute('aria-label','Close Panic AI');
    e.textContent='× CLOSE AI';
    e.style.cssText='position:fixed!important;top:max(10px,env(safe-area-inset-top))!important;right:10px!important;width:140px!important;height:56px!important;z-index:2147483647!important;display:none;align-items:center;justify-content:center;box-sizing:border-box;border:2px solid #8b7cff!important;border-radius:14px!important;background:#101722!important;color:#fff!important;font:900 14px -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif!important;letter-spacing:.4px;box-shadow:0 8px 30px #000!important;pointer-events:auto!important;touch-action:manipulation!important;user-select:none!important;-webkit-user-select:none!important;-webkit-tap-highlight-color:transparent!important;';
    document.body.appendChild(e);
  }

  function hit(ev){
    if(ev){
      ev.preventDefault();
      ev.stopPropagation();
      if(ev.stopImmediatePropagation)ev.stopImmediatePropagation();
    }
    closeAi();
    return false;
  }

  ['pointerdown','pointerup','touchstart','touchend','mousedown','mouseup','click'].forEach(function(type){
    e.addEventListener(type,hit,{capture:true,passive:false});
  });

  function delegated(ev){
    var t=ev.target;
    if(t&&t.closest&&t.closest('#psPanel .psClose,#psEmergencyClose'))hit(ev);
  }
  ['pointerdown','pointerup','touchstart','touchend','mousedown','mouseup','click'].forEach(function(type){
    document.addEventListener(type,delegated,{capture:true,passive:false});
  });

  function sync(){
    var p=document.getElementById('psPanel');
    if(p&&p.classList.contains('open')){
      p.style.setProperty('z-index','2147483646','important');
      e.style.setProperty('display','flex','important');
      e.style.setProperty('pointer-events','auto','important');
      var c=p.querySelector('.psClose');
      if(c){
        c.style.setProperty('position','fixed','important');
        c.style.setProperty('top','10px','important');
        c.style.setProperty('right','10px','important');
        c.style.setProperty('z-index','2147483647','important');
        c.style.setProperty('width','140px','important');
        c.style.setProperty('height','56px','important');
        c.style.setProperty('pointer-events','auto','important');
        c.style.setProperty('touch-action','manipulation','important');
      }
    }else{
      e.style.setProperty('display','none','important');
    }
  }

  sync();
  setInterval(sync,100);
  new MutationObserver(sync).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
