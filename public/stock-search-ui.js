/* Premium stock search UI — brokerage-grade, Trading-212-inspired but original. */
(function(){
  'use strict';
  var STYLE='psPremiumStockSearch';
  function install(){
    if(document.getElementById(STYLE))return;
    var s=document.createElement('style');s.id=STYLE;
    s.textContent=`
      .matches,.searchResults,.stockSearchResults{background:#0b1018!important;border:1px solid #263142!important;border-radius:18px!important;overflow:hidden!important;box-shadow:0 20px 65px #0008!important;padding:0!important}
      .matches:before{content:'Stocks';display:block;padding:15px 18px 11px;background:#101722;color:#f7f9fd;font-size:12px;font-weight:900;letter-spacing:.2px;border-bottom:1px solid #202a39}
      .match{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;align-items:center!important;gap:20px!important;min-height:78px!important;padding:12px 16px!important;margin:0!important;border:0!important;border-top:1px solid #1d2735!important;border-radius:0!important;background:#0b1018!important;transition:background .16s ease!important}
      .match:first-child{border-top:0!important}.match:hover{background:#111925!important}.match:active{background:#151d29!important}
      .match>div:first-child{min-width:0!important;display:flex!important;align-items:center!important;gap:12px!important}
      .match>div:first-child:before{content:'$';width:42px;height:42px;flex:0 0 42px;border-radius:12px;display:grid;place-items:center;background:linear-gradient(145deg,#182234,#111925);border:1px solid #303d51;color:#dce3ee;font-size:13px;font-weight:950;box-shadow:inset 0 1px #ffffff0b}
      .match b{display:block!important;color:#f8faff!important;font-size:14px!important;font-weight:900!important;line-height:1.15!important;letter-spacing:.15px!important}
      .match small{display:block!important;color:#7f8ba0!important;font-size:10px!important;line-height:1.25!important;margin-top:4px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;max-width:45vw!important}
      .match button,.match .outline{min-width:82px!important;height:36px!important;padding:0 13px!important;border:1px solid #354258!important;border-radius:10px!important;background:#151d29!important;color:#f7f9fd!important;font-size:10px!important;font-weight:900!important;box-shadow:none!important;transition:all .16s ease!important}
      .match button:hover,.match .outline:hover{background:#786cff!important;border-color:#786cff!important;transform:translateY(-1px)!important}
      @media(max-width:700px){.matches,.searchResults,.stockSearchResults{border-radius:15px!important}.matches:before{padding:13px 14px 10px;font-size:11px}.match{min-height:68px!important;gap:10px!important;padding:10px 12px!important}.match>div:first-child:before{width:36px;height:36px;flex-basis:36px;border-radius:10px}.match b{font-size:13px!important}.match small{font-size:9px!important;max-width:52vw!important}.match button,.match .outline{min-width:64px!important;height:34px!important;padding:0 9px!important;font-size:9px!important}}
    `;document.head.appendChild(s);
  }
  function start(){install()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
