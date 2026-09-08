/* Panic Scanner front-screen / responsive control fix. */
(function(){
  'use strict';
  function apply(){
    var auth=document.getElementById('auth');
    if(auth) auth.classList.add('hidden');
    var style=document.getElementById('psFrontFixCss');
    if(!style){
      style=document.createElement('style');
      style.id='psFrontFixCss';
      style.textContent='\n#auth{display:none!important}\n#psTools{right:190px!important;top:12px!important;left:auto!important}\n#psffbar{right:12px!important;top:12px!important}\n#psTools button,#psffbar button{white-space:nowrap}\n@media(max-width:600px){#psTools{left:8px!important;right:auto!important;top:8px!important;gap:6px!important}#psffbar{right:8px!important;left:auto!important;top:8px!important;gap:6px!important}#psTools button,#psffbar button{padding:8px 10px!important;font-size:12px!important;border-radius:10px!important}}\n';
      document.head.appendChild(style);
    }
  }
  function boot(){apply();setTimeout(apply,50);setTimeout(apply,250);setTimeout(apply,1000);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  new MutationObserver(function(){apply()}).observe(document.documentElement,{childList:true,subtree:true});
})();
