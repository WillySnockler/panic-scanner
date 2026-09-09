/* Deep Investigation is click-only. Suppress automatic investigation calls from Analyze. */
(function(){
  'use strict';
  var MANUAL='__psManualInvestigation';
  function wrapAnalyze(){
    if(typeof window.analyze!=='function')return false;
    var current=window.analyze;
    if(current.__psClickOnlyWrapped)return true;
    async function wrapped(symbol,name){
      var old=window.investigate;
      window.investigate=function(){return Promise.resolve(null);};
      try{return await current(symbol,name)}finally{window.investigate=old;}
    }
    wrapped.__psClickOnlyWrapped=true;
    window.analyze=wrapped;
    return true;
  }
  function allowManual(e){
    var el=e.target&&e.target.closest?e.target.closest('.investigateBtn, [onclick*="investigate"]'):null;
    if(!el)return;
    window[MANUAL]=true;
    setTimeout(function(){window[MANUAL]=false},90000);
  }
  function patchFetch(){
    if(window.__psInvestigationFetchGuard)return;
    var original=window.fetch.bind(window);
    window.fetch=async function(input,init){
      var url=String(typeof input==='string'?input:(input&&input.url)||'');
      if(url.indexOf('/api/investigate')!==-1&&!window[MANUAL]){
        return new Response(JSON.stringify({blocked:true,investigation:null,news:{articles:[]}}),{status:200,headers:{'Content-Type':'application/json'}});
      }
      return original(input,init);
    };
    window.__psInvestigationFetchGuard=true;
  }
  function install(){
    patchFetch();
    wrapAnalyze();
    document.addEventListener('click',allowManual,true);
    setInterval(wrapAnalyze,250);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
