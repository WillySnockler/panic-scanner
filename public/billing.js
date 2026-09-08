/* Panic Scanner production billing/account bridge. */
(function(){
  const TK='pswAccessToken';let profile=null;
  function token(){return localStorage.getItem(TK)||''}
  async function api(path,options){const o=options||{};o.headers=Object.assign({'Content-Type':'application/json'},o.headers||{});if(token())o.headers.Authorization='Bearer '+token();const r=await fetch(path,o);const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||'Request failed');return d}
  function plan(){if(profile?.is_admin||profile?.is_vip)return 'elite';const p=String(profile?.plan||'standard').toLowerCase();return p==='elite'?'elite':p==='pro'?'pro':'standard'}
  async function refreshProfile(){if(!token()){profile=null;return}try{const d=await api('/api/account');profile=d.profile||null;if(profile){localStorage.setItem('psEmail',profile.email||'');localStorage.setItem('psPlan',plan());localStorage.setItem('psAdmin',profile.is_admin?'1':'0')}}catch(e){}}
  function patchPlans(){document.querySelectorAll('.plan.pro,.plan.elite').forEach(card=>{card.querySelectorAll('button').forEach(b=>b.remove());card.querySelectorAll('.price').forEach(x=>x.remove())})}
  async function startCheckout(p,interval='monthly'){if(!token()){if(window.psFinalShowAuth)window.psFinalShowAuth('login');return}try{const d=await api('/api/billing',{method:'POST',body:JSON.stringify({action:'checkout',plan:p,interval})});if(d.url)location.href=d.url;else throw Error('Checkout URL missing.')}catch(e){if(window.toast)toast(e.message)}}
  async function manageBilling(){if(!token()){if(window.psFinalShowAuth)window.psFinalShowAuth('login');return}try{const d=await api('/api/billing',{method:'POST',body:JSON.stringify({action:'portal'})});if(d.url)location.href=d.url;else throw Error('Billing portal unavailable.')}catch(e){if(window.toast)toast(e.message)}}
  window.startCheckout=startCheckout;window.manageBilling=manageBilling;
  function wire(){const b=document.getElementById('psffaccount');if(b){b.textContent='Account';b.dataset.accountFixed='1';b.onclick=function(){if(token()){if(window.psFinalShowAccount)window.psFinalShowAccount();else if(window.openModal)window.openModal('accountModal')}else if(window.psFinalShowAuth)window.psFinalShowAuth('login')}}patchPlans()}
  function loadWorkspaceScript(){if(document.getElementById('psWorkspaceScript'))return;const s=document.createElement('script');s.id='psWorkspaceScript';s.src='/workspace-fix.js';document.head.appendChild(s)}
  function loadFrontFix(){if(document.getElementById('psFrontFixScript'))return;const s=document.createElement('script');s.id='psFrontFixScript';s.src='/front-fix.js';document.head.appendChild(s)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){wire();loadWorkspaceScript();loadFrontFix()});else{wire();loadWorkspaceScript();loadFrontFix()}
  refreshProfile().then(wire);setInterval(function(){refreshProfile().then(wire)},60000);window.addEventListener('focus',function(){refreshProfile().then(wire)});document.addEventListener('visibilitychange',function(){if(!document.hidden)refreshProfile().then(wire)});
})();
