/* Deep Investigation must run only when the user clicks the button. */
(function(){
  function install(){
    if(window.__psInvestigationClickFixInstalled)return;
    if(typeof window.analyze!=='function')return setTimeout(install,50);
    const originalAnalyze=window.analyze;
    window.analyze=async function(symbol,name){
      const originalInvestigate=window.investigate;
      let autoCalled=false;
      window.investigate=function(){autoCalled=true;};
      try{return await originalAnalyze(symbol,name)}
      finally{window.investigate=originalInvestigate;}
    };
    window.__psInvestigationClickFixInstalled=true;
  }
  install();
})();
