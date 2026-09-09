/* Panic Scanner — Deep Investigation: explicit-click only + premium research UI. */
(function(){
  'use strict';
  var installed=false,running=false;
  var TK='pswAccessToken';
  function token(){return localStorage.getItem(TK)||''}
  function tier(){var p=window.psProfile||{};if(p.is_admin||p.is_vip)return 'elite';var x=String(p.plan||localStorage.getItem('psPlan')||'standard').toLowerCase();return x==='elite'||x==='pro'?x:'standard'}
  function esc(v){return String(v==null?'':v).replace(/[&<>\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]})}
  function css(){
    if(document.getElementById('psDeepPremiumCSS'))return;
    var s=document.createElement('style');s.id='psDeepPremiumCSS';s.textContent=`
      .investigation{display:none!important;margin-top:22px!important}.investigation.ps-invest-open{display:block!important}
      .investHead{position:relative!important;overflow:hidden!important;padding:25px!important;border:1px solid #303b52!important;background:radial-gradient(500px 180px at 85% 0,#5b4bd522,transparent 65%),linear-gradient(135deg,#141a29,#0b1018)!important;border-radius:20px!important}
      .investHead:after{content:'DEEP RESEARCH';position:absolute;right:18px;top:18px;font-size:8px;font-weight:950;letter-spacing:1.6px;color:#a99fff;border:1px solid #786cff55;border-radius:99px;padding:6px 8px;background:#786cff0d}
      .investHead h2{font-size:30px!important;letter-spacing:-.8px!important;margin:7px 0 5px!important}.investHead p{max-width:700px!important;line-height:1.55!important}
      .steps{grid-template-columns:repeat(6,1fr)!important;gap:8px!important}.step{min-height:88px!important;padding:12px!important;background:#0d141e!important;border-color:#263142!important}.step.done{border-color:#35d59d55!important;background:#0c1717!important}.step b{font-size:10px!important}.step small{font-size:8px!important;line-height:1.35!important}
      .researchGrid{gap:14px!important}.researchCard{background:linear-gradient(180deg,#101722,#0b1018)!important;border:1px solid #263142!important;border-radius:16px!important}
      .final{background:linear-gradient(135deg,#0d1b19,#0c1516)!important;border-color:#35d59d55!important}.finalScore{font-variant-numeric:tabular-nums!important}
      .psDeepLoading{display:flex;align-items:center;gap:10px;color:#9ba6b9;font-size:11px;padding:16px 0}.psDeepDot{width:8px;height:8px;border-radius:50%;background:#8b7cff;box-shadow:0 0 18px #8b7cff;animation:pspulse 1s infinite alternate}@keyframes pspulse{to{opacity:.25;transform:scale(.7)}}
      .psDeepError{margin-top:14px;padding:13px;border:1px solid #ff526655;border-radius:12px;background:#211116;color:#ffb5be;font-size:11px}
      @media(max-width:850px){.steps{grid-template-columns:repeat(2,1fr)!important}}@media(max-width:520px){.investHead{padding:18px!important}.investHead h2{font-size:24px!important}.investHead:after{display:none}.steps{grid-template-columns:1fr!important}.researchGrid{grid-template-columns:1fr!important}.final{grid-template-columns:1fr!important}}
    `;document.head.appendChild(s);
  }
  function hide(){var el=document.querySelector('.investigation');if(el)el.classList.remove('ps-invest-open')}
  function button(){return document.querySelector('.investigateBtn')||document.querySelector('[onclick*="investigate"]')}
  function symbol(){return String(window.current?.symbol||window.psCurrent?.symbol||document.getElementById('ticker')?.textContent||'').trim().toUpperCase()}
  function api(url){return fetch(url,{headers:{'Content-Type':'application/json','Authorization:'Bearer '+token()}}).then(function(r){return r.json().then(function(d){if(!r.ok)throw Error(d.error||'Investigation failed.');return d})})}
  function setText(id,v){var e=document.getElementById(id);if(e)e.textContent=v==null?'—':v}
  function render(d,sym,depth){
    var inv=d.investigation||{},q=Number(inv.quality||50),score=Number(window.current?.panic?.score||window.psCurrent?.panic?.score||0);
    setText('qualityScore',q);setText('stressScore',score);setText('recoveryScore',Math.max(0,Math.min(100,Math.round(100-score*.55+q*.2))));setText('finalScore',Math.round((q+(100-score))/2));setText('finalVerdict',inv.verdict||'Research complete');
    var e=document.getElementById('qualityBar');if(e)e.style.width=q+'%';e=document.getElementById('stressBar');if(e)e.style.width=score+'%';var rec=Math.max(0,Math.min(100,Math.round(100-score*.55+q*.2)));e=document.getElementById('recoveryBar');if(e)e.style.width=rec+'%';
    setText('finalText',(inv.steps||[]).map(function(x){return x.detail||x.label}).join(' ')||'Evidence was assembled across the available research steps.');
    var steps=document.getElementById('steps');if(steps)steps.innerHTML=(inv.steps||[]).map(function(x,i){return '<div class="step '+(x.status==='complete'?'done':'')+'"><b>0'+(i+1)+' · '+esc(x.label)+'</b><small>'+esc(x.detail||x.status||'Complete')+'</small></div>'}).join('');
    var wc=document.getElementById('whatChanged');if(wc)wc.innerHTML='<div class="bullet"><b>'+esc(sym)+'</b> · '+esc(depth)+' depth research completed.</div><div class="bullet">News context: '+Number(d.news?.positive||0)+' positive/bullish and '+Number(d.news?.negative||0)+' negative/bearish recent articles.</div>';
  }
  async function run(e){
    if(e){e.preventDefault();e.stopImmediatePropagation();}
    if(running)return;running=true;window.__psManualInvestigation=true;
    var el=document.querySelector('.investigation');if(el)el.classList.add('ps-invest-open');
    var btn=button();if(btn){btn.disabled=true;btn.textContent='Investigating…'}
    var head=document.querySelector('.investHead');if(head&&!document.getElementById('psDeepLoading')){var x=document.createElement('div');x.id='psDeepLoading';x.className='psDeepLoading';x.innerHTML='<span class="psDeepDot"></span><span>Running evidence checks, news context and risk synthesis…</span>';head.appendChild(x)}
    var sym=symbol();try{if(!sym)throw Error('Analyze a stock first.');if(!token())throw Error('Please sign in first.');var depth=tier();var d=await api('/api/investigate?symbol='+encodeURIComponent(sym)+'&depth='+encodeURIComponent(depth));window.current=window.current||{};window.current.investigation=d.investigation||d;render(d,sym,depth);if(window.toast)toast('Deep Investigation complete.')}catch(err){var host=document.querySelector('.investigation');if(host){var old=host.querySelector('.psDeepError');if(old)old.remove();var er=document.createElement('div');er.className='psDeepError';er.textContent=err.message||'Investigation failed.';host.appendChild(er)}if(window.toast)toast(err.message||'Investigation failed.')}finally{var load=document.getElementById('psDeepLoading');if(load)load.remove();if(btn){btn.disabled=false;btn.textContent='Investigate →'}running=false;setTimeout(function(){window.__psManualInvestigation=false},1000)}
  }
  function install(){if(installed)return;installed=true;css();hide();document.addEventListener('click',function(e){var b=e.target&&e.target.closest?e.target.closest('.investigateBtn, [onclick*="investigate"]'):null;if(!b)return;run(e)},true);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
