/* Professional stock search UI — Trading 212-inspired, without copying its branding. */
(function(){
  'use strict';
  function install(){
    if(document.getElementById('psStockSearchUI'))return;
    var s=document.createElement('style');
    s.id='psStockSearchUI';
    s.textContent=`
      .matches{padding:0!important;background:#0b1018;border:1px solid #202a39;border-radius:18px;overflow:hidden;box-shadow:0 18px 55px #0005}
      .matches:before{content:'Stocks';display:block;padding:16px 20px 12px;color:#f6f8fc;font-size:14px;font-weight:950;border-bottom:1px solid #202a39;background:linear-gradient(180deg,#111925,#0d131d)}
      .match{position:relative;display:grid!important;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:18px!important;min-height:72px;padding:12px 18px!important;border-top:1px solid #1c2533!important;background:#0b1018;transition:background .15s ease}
      .match:first-child{border-top:0!important}
      .match:hover{background:#111925}
      .match>div:first-child{min-width:0;display:flex;align-items:center;gap:12px}
      .match>div:first-child:before{content:'$';width:38px;height:38px;flex:0 0 38px;border-radius:11px;display:grid;place-items:center;background:#151d29;border:1px solid #2a3547;color:#b8c2d4;font-size:13px;font-weight:950}
      .match b{font-size:14px;letter-spacing:.2px;color:#f8faff}
      .match small{font-size:10px!important;color:#7f8ba0!important;margin-top:3px!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .match button,.match .outline{min-width:78px;border:1px solid #303b4e!important;background:#151d29!important;color:#fff!important;border-radius:10px!important;padding:9px 13px!important;font-size:10px!important;font-weight:900!important;transition:.15s ease}
      .match button:hover,.match .outline:hover{background:#786cff!important;border-color:#786cff!important}
      @media(max-width:700px){
        .matches:before{padding:14px 15px 10px}
        .match{min-height:66px;padding:10px 13px!important;gap:10px!important}
        .match>div:first-child:before{width:34px;height:34px;flex-basis:34px}
        .match button,.match .outline{min-width:66px;padding:8px 9px!important}
      }
    `;
    document.head.appendChild(s);
  }
  function start(){install();setTimeout(install,500);setTimeout(install,1500)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
