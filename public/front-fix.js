/* Panic Scanner front-screen / responsive control fix. */
(function(){
  'use strict';
  function apply(){
    var auth=document.getElementById('auth');
    if(auth) auth.classList.add('hidden');
    var tools=document.getElementById('psTools');
    if(tools){
      /* Keep Panic AI at the top; Settings already lives in the bottom navigation. */
      var buttons=tools.querySelectorAll('button');
      if(buttons[1]) buttons[1].style.display='none';
    }
    var style=document.getElementById('psFrontFixCss');
    if(!style){
      style=document.createElement('style');
      style.id='psFrontFixCss';
      style.textContent='\n#auth{display:none!important}\n#psTools{position:fixed!important;left:12px!important;right:auto!important;top:12px!important;z-index:100000!important;display:flex!important;gap:8px!important}\n#psTools button,#psffbar button{white-space:nowrap}\n#psffbar{position:fixed!important;right:12px!important;left:auto!important;top:12px!important;z-index:100001!important;display:flex!important;gap:8px!important}\n@media(max-width:600px){.topright{display:none!important}#psTools{left:10px!important;top:10px!important}#psffbar{right:10px!important;top:10px!important;gap:6px!important}#psTools button,#psffbar button{padding:9px 11px!important;font-size:12px!important;border-radius:11px!important;box-shadow:none!important}}\n';
      document.head.appendChild(style);
    }
  }
  function boot(){apply();setTimeout(apply,50);setTimeout(apply,250);setTimeout(apply,1000);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  new MutationObserver(function(){apply()}).observe(document.documentElement,{childList:true,subtree:true});
})();
