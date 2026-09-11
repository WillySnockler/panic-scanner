(function(){'use strict';
const $=id=>document.getElementById(id);
function closeAi(){const p=$('psPanel');if(!p)return;p.classList.remove('open');p.style.setProperty('display','none','important');p.setAttribute('aria-hidden','true');}
function openAi(){const p=$('psPanel');if(!p)return;p.style.removeProperty('display');p.classList.add('open');p.setAttribute('aria-hidden','false');}
window.psClosePanel=closeAi;
function hideCreate(){document.querySelectorAll('button,a,[role="button"]').forEach(el=>{const t=(el.textContent||'').trim().toLowerCase();if(t==='create account'||t==='create an account'||t==='sign up'||t==='signup')el.style.display='none';});}
window.createAccount=function(){if(typeof window.toast==='function')window.toast('Please sign in with your existing account.');};
function wireClose(){const p=$('psPanel');if(!p)return;const b=p.querySelector('.psClose');if(!b)return;b.type='button';b.style.setProperty('pointer-events','auto','important');b.style.setProperty('touch-action','manipulation','important');b.onclick=function(e){e.preventDefault();e.stopPropagation();closeAi();return false;};b.onpointerup=function(e){e.preventDefault();e.stopPropagation();closeAi();return false;};}
document.addEventListener('pointerdown',e=>{const b=e.target?.closest?.('#psPanel .psClose');if(b){e.preventDefault();e.stopImmediatePropagation();closeAi();}},true);
document.addEventListener('pointerup',e=>{const b=e.target?.closest?.('#psPanel .psClose');if(b){e.preventDefault();e.stopImmediatePropagation();closeAi();}},true);
document.addEventListener('click',e=>{const b=e.target?.closest?.('#psPanel .psClose');if(b){e.preventDefault();e.stopImmediatePropagation();closeAi();}},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAi();});
function wrapAi(){const original=window.psOpenAi;if(typeof original!=='function'||original.__safeWrapped)return false;const wrapped=function(){const result=original.apply(this,arguments);openAi();wireClose();return result;};wrapped.__safeWrapped=true;window.psOpenAi=wrapped;return true;}
function wireOpen(){document.querySelectorAll('.psOpen').forEach(b=>{if(b.dataset.safeWired)return;b.dataset.safeWired='1';b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(typeof window.analyze==='function')window.analyze(b.dataset.s,b.dataset.n);});});}
function manualDeep(){const b=document.querySelector('.investigateBar button');if(!b||b.dataset.safeDeep)return;b.dataset.safeDeep='1';b.textContent='Run Deep Search →';b.removeAttribute('onclick');b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(typeof window.investigate==='function')return window.investigate(e);});}
function enhanceSearch(){const s=document.querySelector('.search');if(!s||s.dataset.safeEnhanced)return;s.dataset.safeEnhanced='1';const i=$('q');if(!i)return;const q=document.createElement('div');q.style.cssText='display:flex;gap:6px;overflow:auto;padding:7px 0;scrollbar-width:none;';['NVDA','MU','AAPL','TSLA','MSFT','MOWI'].forEach(sym=>{const b=document.createElement('button');b.type='button';b.textContent=sym;b.style.cssText='flex:none;border:1px solid #263752;background:#0a111b;color:#aab6c8;border-radius:8px;padding:7px 10px;font-size:9px;font-weight:900;';b.addEventListener('click',()=>{i.value=sym;if(typeof window.searchStocks==='function')window.searchStocks();});q.appendChild(b);});s.insertAdjacentElement('afterend',q);}
function run(){hideCreate();wireClose();wireOpen();manualDeep();enhanceSearch();wrapAi();}
run();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});
setTimeout(run,250);
setTimeout(run,1000);
})();
