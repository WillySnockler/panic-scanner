/* Panic Scanner front-screen / responsive control fix. */
(function(){
  'use strict';
  function visible(el){
    if(!el || el.classList.contains('hidden')) return false;
    var cs=getComputedStyle(el);
    if(cs.display==='none'||cs.visibility==='hidden'||Number(cs.opacity||1)===0) return false;
    var r=el.getBoundingClientRect();
    return r.width>0 && r.height>0;
  }
  function apply(){
    var tools=document.getElementById('psTools');
    if(tools){
      /* Settings remains in the app's normal navigation; keep Panic AI here. */
      var buttons=tools.querySelectorAll('button');
      if(buttons[1]) buttons[1].style.display='none';
    }
    var style=document.getElementById('psFrontFixCss');
    if(!style){
      style=document.createElement('style');
      style.id='psFrontFixCss';
      style.textContent='\n#psTools{position:fixed!important;left:12px!important;right:auto!important;top:12px!important;z-index:100000!important;display:flex!important;gap:8px!important}\n#psTools button,#psffbar button{white-space:nowrap}\n#psffbar{position:fixed!important;right:12px!important;left:auto!important;top:12px!important;z-index:100001!important;display:flex!important;gap:8px!important}\n/* Keep floating controls available normally, but hide them only while a real modal is open. */\nbody.psOverlayActive #psTools,body.psOverlayActive #psffbar{display:none!important}\n@media(max-width:600px){.topright{display:none!important}#psTools{left:10px!important;top:10px!important}#psffbar{right:10px!important;top:10px!important;gap:6px!important}#psTools button,#psffbar button{padding:9px 11px!important;font-size:12px!important;border-radius:11px!important;box-shadow:none!important}}\n';
      document.head.appendChild(style);
    }
    var overlayOpen=false;
    document.querySelectorAll('.modal').forEach(function(m){ if(visible(m)) overlayOpen=true; });
    var custom=document.getElementById('psffmodal');
    if(visible(custom)) overlayOpen=true;
    document.body.classList.toggle('psOverlayActive',overlayOpen);
  }
  function boot(){apply();setTimeout(apply,50);setTimeout(apply,250);setTimeout(apply,1000);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  new MutationObserver(function(){apply()}).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style','aria-hidden']});
  setInterval(apply,500);
})();
