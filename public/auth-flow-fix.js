/* Panic Scanner real sign-in / signup / demo bridge. */
/* Production hardening: auth actions are delegated here so legacy inline handlers cannot break signup or demo. */
(function(){
  'use strict';
  var TK='pswAccessToken',RK='pswRefreshToken',DEMO='psDemoMode';
  var SB_URL='https://xinhpzibmvzqzahcklgy.supabase.co';
  var SB_KEY=['sb_publishable_','YsqF0jHnjrGY2anRaoH9pg_JKqiPqom'].join('');
  var sb=null,sbPromise=null;
  function token(){return localStorage.getItem(TK)||''}
  function toastSafe(m){if(window.toast)window.toast(m);else alert(m)}
  function authOverlay(){return document.getElementById('auth')}
  function hideAuth(){var a=authOverlay();if(a)a.classList.add('hidden')}
  function showAuth(){var a=authOverlay();if(a)a.classList.remove('hidden')}
  function getSupabase(){
    if(sb)return Promise.resolve(sb);
    if(sbPromise)return sbPromise;
    sbPromise=new Promise(function(resolve,reject){
      function make(){try{sb=window.supabase.createClient(SB_URL,SB_KEY);resolve(sb)}catch(e){reject(e)}}
      if(window.supabase&&window.supabase.createClient)make();
      else{var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';s.onload=make;s.onerror=function(){reject(Error('Authentication service could not load.'))};document.head.appendChild(s)}
    });
    return sbPromise;
  }
  function apiAuth(action,email,password){
    return fetch('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:action,email:email,password:password})})
      .then(function(r){return r.json().catch(function(){return{}}).then(function(d){if(!r.ok)throw Error(d.error||'Authentication failed.');return d})});
  }
  async function establishSession(d){
    localStorage.setItem(TK,d.access_token);
    if(d.refresh_token)localStorage.setItem(RK,d.refresh_token);
    localStorage.setItem('psLoggedIn','1');
    sessionStorage.removeItem(DEMO);
    try{var c=await getSupabase();if(d.refresh_token)await c.auth.setSession({access_token:d.access_token,refresh_token:d.refresh_token})}catch(e){}
    try{var r=await fetch('/api/account',{headers:{Authorization:'Bearer '+d.access_token}});var a=await r.json();window.psProfile=a.profile||{}}catch(e){window.psProfile={}}
  }
  function setBusy(on){document.querySelectorAll('#auth button').forEach(function(b){b.disabled=on})}
  async function login(){
    var email=(document.getElementById('email')?.value||'').trim().toLowerCase();
    var password=document.getElementById('password')?.value||'';
    if(!email||!password){toastSafe('Enter your email and password.');return}
    setBusy(true);
    try{var d=await apiAuth('login',email,password);if(!d.access_token)throw Error('No active session was returned.');await establishSession(d);hideAuth();toastSafe('Signed in successfully.');if(window.psFinalShowAccount)setTimeout(function(){window.psFinalShowAccount()},160)}
    catch(e){toastSafe(e.message||'Sign in failed.')}finally{setBusy(false)}
  }
  async function signup(){
    var email=(document.getElementById('email')?.value||'').trim().toLowerCase();
    var password=document.getElementById('password')?.value||'';
    if(!email||password.length<8){toastSafe('Enter a valid email and a password of at least 8 characters.');return}
    setBusy(true);
    try{var d=await apiAuth('signup',email,password);if(!d.access_token)throw Error('Account created, but no session was returned. Please sign in.');await establishSession(d);hideAuth();toastSafe('Account created and signed in.');if(window.psFinalShowAccount)setTimeout(function(){window.psFinalShowAccount()},160)}
    catch(e){toastSafe(e.message||'Could not create the account.')}finally{setBusy(false)}
  }
  function demo(){
    sessionStorage.setItem(DEMO,'1');
    hideAuth();
    toastSafe('Demo started — explore Panic Scanner with live market data. Sign in to save research and use your account.');
    setTimeout(function(){
      try{
        if(typeof window.analyze==='function')window.analyze('AAPL','Apple Inc.');
        else if(typeof window.fixResearch==='function')window.fixResearch('AAPL');
        else toastSafe('Demo could not start. Please refresh and try again.');
      }catch(e){toastSafe('Demo could not start. Please try again.')}
    },250);
  }
  function accountClick(){
    if(window.psFinalShowAccount)return window.psFinalShowAccount();
    if(token()&&window.openModal)return window.openModal('accountModal');
    if(window.psFinalShowAuth)return window.psFinalShowAuth('login');
    showAuth();
  }
  function buttonRouter(e){
    var a=authOverlay();if(!a||!a.contains(e.target))return;
    var b=e.target.closest('button');if(!b)return;
    var t=(b.textContent||'').trim().toLowerCase();
    if(/demo/.test(t)){e.preventDefault();e.stopImmediatePropagation();demo();return}
    if(/create account|sign up|signup|create free/.test(t)){e.preventDefault();e.stopImmediatePropagation();signup();return}
    if(/sign in|log in|login/.test(t)){e.preventDefault();e.stopImmediatePropagation();login();return}
  }
  function install(){
    window.enterApp=login;window.createAccount=signup;window.demoLogin=demo;
    var a=authOverlay();
    if(a){a.style.display='';a.removeAttribute('aria-hidden');if(!token()&&sessionStorage.getItem(DEMO)!=='1')a.classList.remove('hidden')}
    var b=document.getElementById('psffaccount');if(b){b.textContent='Account';b.onclick=accountClick}
    if(sessionStorage.getItem(DEMO)==='1'&&!token())hideAuth();
  }
  function boot(){install();setTimeout(install,80);setTimeout(install,400);setTimeout(install,1200)}
  document.addEventListener('click',buttonRouter,true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
