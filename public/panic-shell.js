(function(){'use strict';
function addQuickAccess(){
  if(document.getElementById('psQuickAccess'))return;
  var tools=document.getElementById('psTools');
  if(!tools)return;
  var wrap=document.createElement('div');
  wrap.id='psQuickAccess';
  wrap.innerHTML='<button type="button" data-action="ai">✦ Panic AI</button><button type="button" data-action="account">Account</button><button type="button" data-action="signin">Sign in</button>';
  wrap.querySelector('[data-action="ai"]').onclick=function(){if(window.psOpenAi)window.psOpenAi();else if(window.psFinalShowAuth)window.psFinalShowAuth('login')};
  wrap.querySelector('[data-action="account"]').onclick=function(){if(window.psFinalShowAccount)window.psFinalShowAccount();else if(window.openModal)window.openModal('accountModal');else if(window.psFinalShowAuth)window.psFinalShowAuth('login')};
  wrap.querySelector('[data-action="signin"]').onclick=function(){if(window.psFinalShowAuth)window.psFinalShowAuth('login');else document.getElementById('auth')?.classList.remove('hidden')};
  tools.parentNode.insertBefore(wrap,tools.nextSibling);
  var s=document.createElement('style');s.id='psQuickAccessCss';s.textContent='#psQuickAccess{position:fixed;top:14px;right:14px;z-index:9998;display:flex;gap:7px;pointer-events:auto}#psQuickAccess button{border:1px solid #39455b;background:#111925;color:#fff;border-radius:10px;padding:9px 12px;font:800 12px system-ui;cursor:pointer;box-shadow:0 8px 25px #0007}#psQuickAccess button:first-child{background:linear-gradient(135deg,#786cff,#4f8cff);border-color:#8b7cff}@media(max-width:600px){#psQuickAccess{top:8px;right:8px;gap:5px}#psQuickAccess button{padding:8px 9px;font-size:11px}}';document.head.appendChild(s);
}
function sync(){
  var q=document.getElementById('psQuickAccess');if(!q)return;
  var has=!!localStorage.getItem('pswAccessToken');
  q.querySelector('[data-action="signin"]').style.display=has?'none':'';
  q.querySelector('[data-action="account"]').style.display=has?'':'none';
}
function run(){addQuickAccess();sync()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
setTimeout(run,300);setTimeout(run,1200);setInterval(sync,1500);
})();
