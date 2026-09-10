(function(){
'use strict';
var LEGACY='https://raw.githubusercontent.com/WillySnockler/panic-scanner/3697f706b07f40953256857d0c1ebe4528e5026b/final-fix.js';
var TK='pswAccessToken',RK='pswRefreshToken';
function loadLegacy(done){
  if(window.__psLegacyLoaded){done();return;}
  var s=document.createElement('script');
  s.src=LEGACY;
  s.onload=function(){window.__psLegacyLoaded=true;done()};
  s.onerror=function(){done()};
  document.head.appendChild(s);
}
function close(){
  var p=document.getElementById('psPanel');
  if(p){p.classList.remove('open');p.style.setProperty('display','none','important');p.setAttribute('aria-hidden','true');}
  var x=document.getElementById('psEmergencyClose');
  if(x)x.style.display='none';
}
function removeSignupUi(){
  var root=document.getElementById('auth');
  if(!root)return;
  root.querySelectorAll('button,a,[role="button"],label,div,span,p').forEach(function(el){
    var t=(el.textContent||'').trim().toLowerCase();
    if(!t)return;
    if((t==='create account'||t==='create an account'||t==='sign up'||t==='signup') && !el.querySelector('input,form')){
      el.style.setProperty('display','none','important');
    }
  });
  root.querySelectorAll('[onclick]').forEach(function(el){
    var o=el.getAttribute('onclick')||'';
    if(/createAccount|signup/i.test(o))el.style.setProperty('display','none','important');
  });
}
function showAuth(){var a=document.getElementById('auth');if(a)a.classList.remove('hidden');}
function hideAuth(){var a=document.getElementById('auth');if(a)a.classList.add('hidden');}
function syncTools(){
  var logged=!!localStorage.getItem(TK);
  var tools=document.getElementById('psTools');
  if(tools)tools.style.setProperty('display',logged?'flex':'none','important');
  removeSignupUi();
}
async function login(){
  var email=(document.getElementById('email')?.value||'').trim().toLowerCase();
  var password=document.getElementById('password')?.value||'';
  if(!email||!password){if(window.toast)toast('Enter your email and password.');return;}
  try{
    var r=await fetch('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'login',email,password})});
    var d=await r.json().catch(function(){return{}});
    if(!r.ok||!d.access_token)throw Error(d.error||'Sign in failed.');
    localStorage.setItem(TK,d.access_token);
    if(d.refresh_token)localStorage.setItem(RK,d.refresh_token);
    localStorage.setItem('psLoggedIn','1');
    hideAuth();
    syncTools();
    if(window.toast)toast('Signed in.');
    try{
      var ar=await fetch('/api/account',{headers:{'Content-Type':'application/json',Authorization:'Bearer '+d.access_token}});
      if(ar.ok){var ad=await ar.json();window.__psTier=((ad.profile?.is_admin||ad.profile?.is_vip)?'elite':String(ad.profile?.plan||'Standard').toLowerCase());if(window.__psTier!=='elite'&&window.__psTier!=='pro')window.__psTier='standard';}
    }catch(e){}
  }catch(e){if(window.toast)toast(e.message||'Sign in failed.');}
}
function install(){
  if(!document.body)return;
  var x=document.getElementById('psEmergencyClose');
  if(!x){
    x=document.createElement('button');
    x.id='psEmergencyClose';x.type='button';x.textContent='×  CLOSE AI';x.setAttribute('aria-label','Close Panic AI');
    x.style.cssText='position:fixed!important;top:10px!important;right:10px!important;width:112px!important;height:48px!important;z-index:2147483647!important;display:none;align-items:center;justify-content:center;box-sizing:border-box;border:1px solid rgba(143,130,255,.8);border-radius:12px;background:rgba(9,14,22,.98);color:#fff;font:900 12px -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;letter-spacing:.5px;box-shadow:0 8px 30px rgba(0,0,0,.65),0 0 20px rgba(117,104,255,.3);pointer-events:auto!important;touch-action:manipulation!important;-webkit-user-select:none;user-select:none;';
    document.body.appendChild(x);
    ['pointerdown','pointerup','touchstart','touchend','click'].forEach(function(type){x.addEventListener(type,function(e){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();close();},true);});
  }
  var oldEnter=window.enterApp;
  window.enterApp=login;
  window.createAccount=function(){if(window.toast)toast('Account creation is not available. Please sign in with your existing account.');};
  window.demoLogin=function(){if(window.toast)toast('Please sign in with your existing account.');showAuth();};
  function sync(){
    var p=document.getElementById('psPanel');
    if(p&&p.classList.contains('open'))x.style.setProperty('display','flex','important');else x.style.setProperty('display','none','important');
    syncTools();
  }
  setInterval(sync,150);
  new MutationObserver(sync).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});
  sync();
  document.addEventListener('submit',function(e){var f=e.target;if(f&&f.closest&&f.closest('#auth')){e.preventDefault();login();}},true);
  document.addEventListener('click',function(e){
    var el=e.target.closest&&e.target.closest('#auth button,[data-action="login"],.loginBtn');
    if(el){var t=(el.textContent||'').toLowerCase();if(/sign in|log in|login/.test(t)){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();login();}}
  },true);
}
loadLegacy(install);
})();
