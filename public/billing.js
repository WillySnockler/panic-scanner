/* Panic Scanner production auth + billing bridge. */
(function(){
  const SUPABASE_URL='https://xinhpzibmvzqzahcklgy.supabase.co';
  const SUPABASE_KEY='sb_publishable_YsqF0jHnjrGY2anRaoH9pg_JKqiPqom';
  let client=null, profile=null;
  function load(){
    if(window.supabase?.createClient){client=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY); init();return;}
    const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';s.onload=()=>{client=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);init()};document.head.appendChild(s);
  }
  async function init(){
    const {data:{session}}=await client.auth.getSession();
    if(session){hideAuth();await refreshProfile();}
    client.auth.onAuthStateChange(async (_e,s)=>{if(s){hideAuth();await refreshProfile()}else{showAuth()}});
    window.startCheckout=startCheckout;window.manageBilling=manageBilling;window.createAccount=createAccount;window.enterApp=signIn;window.demoLogin=()=>toast('Demo access is disabled. Create a free account to continue.');
    patchButtons();
  }
  function hideAuth(){document.getElementById('auth')?.classList.add('hidden')}
  function showAuth(){document.getElementById('auth')?.classList.remove('hidden')}
  async function signIn(){
    const email=document.getElementById('email')?.value.trim(),password=document.getElementById('password')?.value||'';
    if(!email||!password){toast('Enter your email and password.');return}
    const {error}=await client.auth.signInWithPassword({email,password});if(error)toast(error.message);else toast('Signed in.');
  }
  async function createAccount(){
    const email=document.getElementById('email')?.value.trim(),password=document.getElementById('password')?.value||'';
    if(!email||password.length<6){toast('Use an email and a password of at least 6 characters.');return}
    const {error}=await client.auth.signUp({email,password});if(error)toast(error.message);else toast('Account created. Check your email if confirmation is required.');
  }
  async function refreshProfile(){
    const {data:{user}}=await client.auth.getUser(); if(!user)return;
    const {data,error}=await client.from('profiles').select('*').eq('id',user.id).maybeSingle();
    if(!error) profile=data||{plan:'free',subscription_status:'free'};
    localStorage.setItem('psEmail',user.email||'');localStorage.setItem('psPlan',profile?.plan||'free');
    const badge=document.querySelector('.online');if(badge)badge.textContent=`● ${String(profile?.plan||'free').toUpperCase()} ACCOUNT`;
    patchButtons();
  }
  async function authHeaders(){const {data:{session}}=await client.auth.getSession();return session?{Authorization:`Bearer ${session.access_token}`}:{}}
  async function startCheckout(plan,interval='monthly'){
    const headers=await authHeaders();if(!headers.Authorization){openModal('accountModal');toast('Sign in first.');return}
    const r=await fetch('/api/billing',{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify({action:'checkout',plan,interval})});const d=await r.json();if(!r.ok){toast(d.error||'Checkout is not configured yet.');return}window.location.href=d.url;
  }
  async function manageBilling(){const headers=await authHeaders();if(!headers.Authorization){openModal('accountModal');return}const r=await fetch('/api/billing',{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify({action:'portal'})});const d=await r.json();if(!r.ok){toast(d.error||'Billing portal unavailable.');return}window.location.href=d.url;}
  function patchButtons(){
    document.querySelectorAll('.plan.pro button').forEach(b=>{if(!b.dataset.billing){b.dataset.billing='1';b.textContent='Choose Pro · 149 NOK/mo';b.onclick=()=>startCheckout('pro','monthly')}});
    document.querySelectorAll('.plan.elite button').forEach(b=>{if(!b.dataset.billing){b.dataset.billing='1';b.textContent='Choose Elite · 299 NOK/mo';b.onclick=()=>startCheckout('elite','monthly')}});
    const modal=document.getElementById('accountModal');if(modal&&!modal.querySelector('[data-manage-billing]')){const p=modal.querySelector('.modalBody');const box=document.createElement('div');box.style='margin-top:14px;display:flex;gap:8px;justify-content:flex-end';box.innerHTML='<button data-manage-billing class="outline">Manage subscription</button><button class="outline" onclick="closeModal(\'accountModal\')">Close</button>';p.appendChild(box);box.querySelector('[data-manage-billing]').onclick=manageBilling;}
    document.querySelectorAll('.plan .price').forEach(x=>{if(x.textContent==='Premium')x.textContent='149 NOK / month';if(x.textContent==='Premium+')x.textContent='299 NOK / month'});
  }
  const originalInvestigate=window.investigate;
  window.investigate=function(){const p=profile?.plan||localStorage.getItem('psPlan')||'free';if(p==='free'){openModal('plansModal');toast('Deep Investigation is a Pro feature.');return}return originalInvestigate?.()};
  const originalDrawElite=window.drawElite;
  window.drawElite=function(){const p=profile?.plan||localStorage.getItem('psPlan')||'free';if(p!=='elite'){return}return originalDrawElite?.()};
  load();
})();
