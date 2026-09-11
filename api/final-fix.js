const fs=require('fs');
const path=require('path');
module.exports=function(req,res){
  try{
    const original=fs.readFileSync(path.join(process.cwd(),'final-fix.js'),'utf8');
    const closeFix=`
(function(){
'use strict';
function closeAiNow(){
  var p=document.getElementById('psPanel');
  if(p){p.classList.remove('open');p.setAttribute('aria-hidden','true');p.style.setProperty('display','none','important');}
  var e=document.getElementById('psEmergencyClose');
  if(e)e.style.setProperty('display','none','important');
}
function installCloseControl(){
  if(!document.body)return;
  var e=document.getElementById('psEmergencyClose');
  if(!e){
    e=document.createElement('button');
    e.id='psEmergencyClose';e.type='button';e.textContent='× CLOSE AI';e.setAttribute('aria-label','Close Panic AI');
    e.style.cssText='position:fixed!important;top:max(10px,env(safe-area-inset-top))!important;right:10px!important;width:140px!important;height:56px!important;z-index:2147483647!important;display:none;align-items:center;justify-content:center;box-sizing:border-box;border:2px solid #8b7cff!important;border-radius:14px!important;background:#101722!important;color:#fff!important;font:900 14px -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif!important;box-shadow:0 8px 30px #000!important;pointer-events:auto!important;touch-action:manipulation!important;-webkit-tap-highlight-color:transparent!important;';
    document.body.appendChild(e);
  }
  function hit(ev){if(ev){ev.preventDefault();ev.stopPropagation();if(ev.stopImmediatePropagation)ev.stopImmediatePropagation();}closeAiNow();return false;}
  ['pointerdown','pointerup','touchstart','touchend','mousedown','mouseup','click'].forEach(function(t){e.addEventListener(t,hit,{capture:true,passive:false});});
  function delegated(ev){var t=ev.target;if(t&&t.closest&&t.closest('#psPanel .psClose,#psEmergencyClose'))hit(ev);}
  ['pointerdown','pointerup','touchstart','touchend','mousedown','mouseup','click'].forEach(function(t){document.addEventListener(t,delegated,{capture:true,passive:false});});
  function sync(){var p=document.getElementById('psPanel');if(p&&p.classList.contains('open')){e.style.setProperty('display','flex','important');p.style.setProperty('z-index','2147483646','important');var c=p.querySelector('.psClose');if(c){c.style.setProperty('position','fixed','important');c.style.setProperty('top','10px','important');c.style.setProperty('right','10px','important');c.style.setProperty('z-index','2147483647','important');c.style.setProperty('width','140px','important');c.style.setProperty('height','56px','important');c.style.setProperty('pointer-events','auto','important');}}else e.style.setProperty('display','none','important');}
  sync();setInterval(sync,100);
  new MutationObserver(sync).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installCloseControl);else installCloseControl();
})();
`;
    res.statusCode=200;
    res.setHeader('Content-Type','application/javascript; charset=utf-8');
    res.setHeader('Cache-Control','no-store, max-age=0');
    res.end(original+'\n'+closeFix);
  }catch(e){res.statusCode=500;res.setHeader('Content-Type','application/javascript');res.end('console.error('+JSON.stringify(e.message)+')');}
};
