(function(){
'use strict';
const $=id=>document.getElementById(id);
const style=document.createElement('style');
style.textContent=`
:root{--ps-bg:#05070b;--ps-panel:#090e16;--ps-panel2:#0d1420;--ps-line:#1d2a3b;--ps-text:#f4f7fb;--ps-muted:#718096;--ps-purple:#8b7cff;--ps-blue:#4d8dff;--ps-green:#32e0a0}
body{overflow-x:hidden!important}
.search{width:min(100% - 24px,720px)!important;max-width:720px!important;margin:18px auto 0!important;padding:7px!important;border:1px solid #263752!important;border-radius:15px!important;background:linear-gradient(145deg,#090e16,#070b12)!important;box-shadow:0 0 0 1px #7568ff0a,0 0 32px #695cff18,0 18px 55px #000b!important}
.search input{height:48px!important;background:#080d14!important;border:1px solid #1e2d42!important;border-radius:10px!important;font-size:14px!important;padding:0 14px!important;box-sizing:border-box}.search input::placeholder{color:#58677d}.search input:focus{border-color:#7568ff!important;box-shadow:0 0 0 3px #7568ff14,0 0 22px #7568ff18!important}.search .primary{height:48px!important;min-width:88px!important;border-radius:10px!important;background:linear-gradient(135deg,#8f82ff,#4c8dff)!important;box-shadow:0 0 20px #7568ff30!important;font-size:11px!important}
.psMeta{width:min(100% - 32px,700px);margin:8px auto 0!important;display:flex;align-items:center;gap:7px;color:#63738a;font-size:8px;letter-spacing:.65px;text-transform:uppercase}.psDot{width:5px;height:5px;border-radius:50%;background:var(--ps-green);box-shadow:0 0 9px var(--ps-green);flex:none}.psQuick{width:min(100% - 32px,700px);margin:8px auto 0!important;display:flex;gap:5px;overflow-x:auto;padding:1px 0 4px;scrollbar-width:none}.psQuick::-webkit-scrollbar{display:none}.psQuick button{flex:none;border:1px solid #1e3047;background:#0a111b;color:#8190a6;border-radius:8px;padding:7px 10px;font-size:9px;font-weight:900;letter-spacing:.3px;box-shadow:inset 0 0 12px #4d8dff05}.psQuick button:active{border-color:#7c6cff;color:#fff;box-shadow:0 0 14px #7c6cff25}
#matchesSection{width:min(100% - 24px,720px);margin:18px auto 0!important}#matchesSection .sectionHead{margin-bottom:7px!important}#matchesSection .sectionHead h2{font-size:11px!important;letter-spacing:1.4px!important;color:#b9c5d5!important}#matchesSection .sectionHead p{font-size:8px!important;color:#65758c!important}.psMatches{display:grid;gap:5px;padding:0!important}
.psMatch{display:grid;grid-template-columns:38px minmax(0,1fr) auto;gap:10px;align-items:center;padding:10px!important;border:1px solid #19283a!important;border-radius:11px!important;background:linear-gradient(100deg,#0b121c,#080e16)!important;box-shadow:inset 0 0 25px #4d8dff03!important;min-width:0}.psMatch:active{border-color:#695cff!important}.psLogo{width:34px;height:34px;border-radius:9px;background:linear-gradient(145deg,#18243a,#0c131f);border:1px solid #30425d;display:grid;place-items:center;color:#dbe5f5;font-size:9px;font-weight:1000;box-shadow:0 0 13px #4d8dff0c}.psTicker{display:block;font-size:12px!important;line-height:1.1;color:#f4f7fb;letter-spacing:.5px}.psCompany{display:block;color:#a5b0c0;font-size:9px!important;line-height:1.2;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}.psSub{display:block;color:#5f7087;font-size:7px!important;line-height:1.2;margin-top:3px;text-transform:uppercase;letter-spacing:.4px}.psOpen{border:1px solid #30425b!important;background:#0e1724!important;color:#dfe7f2!important;border-radius:8px!important;padding:8px 9px!important;font-size:8px!important;font-weight:950!important;white-space:nowrap;cursor:pointer!important;pointer-events:auto!important;position:relative!important;z-index:30!important}.psOpen:active{background:#191532!important;border-color:#806fff!important;box-shadow:0 0 15px #7568ff2b}
.analysisGrid{grid-template-columns:minmax(0,1fr)!important;gap:8px!important}.analysisCard,.chartCard,.newsCard,.researchCard{border-radius:13px!important;background:linear-gradient(180deg,#0b121b,#080d14)!important;border-color:#1d2a3b!important;box-shadow:0 12px 40px #0008!important}.analysisCard{padding:13px!important}.ticker{font-size:25px!important}.company{font-size:9px!important}.price{font-size:25px!important}.scoreRow{margin:13px 0 9px!important}.gauge{width:72px!important;height:72px!important;flex-basis:72px!important}.gauge strong{font-size:21px!important}.metric{padding:7px 0!important;font-size:9px!important}.chartCard{padding:10px!important}.chartTitle h2{font-size:11px!important}.chartTitle span{font-size:7px!important}.rangeBtns{overflow-x:auto;white-space:nowrap}.rangeBtns button{padding:5px 7px!important;font-size:7px!important}.interactiveChart{height:230px!important;background:#060a10!important;border-radius:10px!important}.gridLine{stroke:#172333!important}.pricePath{stroke:#9185ff!important;stroke-width:2.4!important;filter:drop-shadow(0 0 4px #7568ff66)}.priceArea{opacity:.18!important}.investigateBar{margin-top:8px!important;padding:11px!important;border-radius:12px!important;border:1px solid #5149a466!important;background:linear-gradient(100deg,#10152a,#090f17)!important;box-shadow:0 0 25px #7568ff0b!important;position:relative!important;z-index:25!important}.investigateBar b{font-size:10px!important}.investigateBar span{font-size:7px!important}.investigateBtn{min-height:38px!important;background:linear-gradient(135deg,#8f82ff,#4d8dff)!important;border-radius:8px!important;padding:8px 10px!important;font-size:8px!important;box-shadow:0 0 18px #7568ff2d!important;cursor:pointer!important;pointer-events:auto!important;position:relative!important;z-index:30!important;touch-action:manipulation!important}.investigateBtn:active{transform:scale(.97)}#investigation{margin-top:8px!important}.investHead{padding:13px!important;border-radius:13px!important}.investHead h2{font-size:17px!important}.investHead p{font-size:8px!important}.step{min-height:52px!important;padding:7px!important}.step b{font-size:7px!important}.step small{font-size:7px!important}.eliteMap{border-radius:13px!important;padding:11px!important}.eliteHead h3{font-size:15px!important}.eliteHead p{font-size:8px!important}.eliteChart{height:260px!important}
@media(min-width:621px){.analysisGrid{grid-template-columns:minmax(250px,.65fr) minmax(0,1.35fr)!important}.interactiveChart{height:330px!important}}
@media(max-width:620px){main,.container,.app,.shell{width:100%!important;max-width:100%!important;padding-left:10px!important;padding-right:10px!important;box-sizing:border-box}.search{width:calc(100% - 8px)!important}.search .primary{width:auto!important}.psMeta,.psQuick{width:calc(100% - 16px)!important}.psMatch{grid-template-columns:36px minmax(0,1fr) auto}.psLogo{width:32px;height:32px}.psOpen{padding:7px 8px!important}.analysisCard,.chartCard,.newsCard{padding:10px!important}.interactiveChart{height:215px!important}}
`;
document.head.appendChild(style);

function enhance(){
 const s=document.querySelector('.search');
 if(s&&!s.dataset.psEnhanced){
  s.dataset.psEnhanced='1';s.classList.add('psTerminal');
  const i=$('q');
  if(i){
   i.placeholder='Search ticker or company  ·  NVDA, MU, MOWI';
   const m=document.createElement('div');m.className='psMeta';m.innerHTML='<i class="psDot"></i><span>LIVE SECURITIES</span><span>·</span><span>Stocks · ETFs · Companies</span>';s.insertAdjacentElement('afterend',m);
   const q=document.createElement('div');q.className='psQuick';['NVDA','MU','AAPL','TSLA','MSFT','MOWI'].forEach(x=>{const b=document.createElement('button');b.type='button';b.textContent=x;b.addEventListener('click',()=>{i.value=x;window.searchStocks()});q.appendChild(b)});m.insertAdjacentElement('afterend',q);
  }
 }
 const bar=document.querySelector('.investigateBar');
 if(bar){
  const b=bar.querySelector('b');if(b)b.textContent='Deep Search';
  const p=bar.querySelector('span');if(p)p.textContent='Fundamentals · catalysts · news · technical risk';
  const btn=bar.querySelector('button');
  if(btn&&!btn.dataset.psDeepFixed){
   btn.dataset.psDeepFixed='1';btn.textContent='Run Deep Search →';btn.type='button';btn.removeAttribute('onclick');btn.style.pointerEvents='auto';
   btn.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();window.__psManualDeepSearch=true;const fn=window.investigate;if(typeof fn==='function')return fn.call(this,e)},true);
  }
 }
}

function render(matches){
 const box=$('matches');if(!box)return;
 box.className='psMatches';
 box.innerHTML=(matches||[]).map(m=>{const sym=String(m.symbol||'').replace(/[^A-Za-z0-9._-]/g,'');const name=String(m.name||sym).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));const region=String(m.region||'').replace(/[<>]/g,'');const currency=String(m.currency||'').replace(/[<>]/g,'');return `<div class="psMatch"><div class="psLogo">${sym.slice(0,3)}</div><div><b class="psTicker">${sym}</b><span class="psCompany">${name}</span><span class="psSub">${region}${region&&currency?' · ':''}${currency}</span></div><button class="psOpen" type="button" data-s="${sym}" data-n="${name}">Open →</button></div>`}).join('')||'<div class="loading">No securities found. Try a ticker or company name.</div>';
 box.querySelectorAll('.psOpen').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();window.analyze(b.dataset.s,b.dataset.n)},true));
}

window.searchStocks=async function(){const q=$('q')?.value.trim();if(!q)return $('q')?.focus();$('matchesSection').style.display='block';$('matches').innerHTML='<div class="loading">Searching live securities…</div>';try{const r=await fetch('/api/search?q='+encodeURIComponent(q));const d=await r.json();if(!r.ok)throw Error(d.error||'Search failed');render(d.matches||[]);$('matchesSection').scrollIntoView({behavior:'smooth',block:'nearest'})}catch(e){$('matches').innerHTML='<div class="loading red">'+String(e.message).replace(/[<>]/g,'')+'</div>'}};

const realInvestigate=window.investigate;
if(typeof realInvestigate==='function'&&!window.__psDeepWrapped){
 window.__psDeepWrapped=true;window.__psManualDeepSearch=false;
 window.investigate=function(){
  if(!window.__psManualDeepSearch)return Promise.resolve();
  window.__psManualDeepSearch=false;
  return realInvestigate.apply(this,arguments);
 };
}

enhance();new MutationObserver(enhance).observe(document.body,{childList:true,subtree:true});
})();
