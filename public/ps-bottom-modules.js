(function(){'use strict';
function mount(){
 var r=document.querySelector('.nativeWorkbench');if(!r)return;
 if(r.dataset.workbenchFixed==='1')return;r.dataset.workbenchFixed='1';
 var h=r.querySelector('h2');if(h)h.textContent='Work from here — without leaving the desk.';
 var p=r.querySelector('header p');if(p)p.textContent='Search, analyze, investigate and manage access directly inside this workspace.';
 var actions=r.querySelector('.nativeActions');
 if(actions){
  var buttons=actions.querySelectorAll('button');
  if(buttons[0])buttons[0].onclick=function(){var q=document.getElementById('q');if(q){q.focus();q.scrollIntoView({behavior:'smooth',block:'center'})}};
  if(buttons[1])buttons[1].onclick=function(){var a=document.getElementById('analysis');if(a&&!a.classList.contains('hidden')){a.scrollIntoView({behavior:'smooth',block:'center'})}else{setStatus('Analyze a stock first. The signal stack will then be available here.')}};
  if(buttons[2])buttons[2].onclick=function(){if(window.current&&window.current.symbol&&typeof window.investigate==='function'){window.investigate();setStatus('Investigation started for '+window.current.symbol+'.')}else setStatus('Analyze a stock first, then challenge the thesis.')}};
 }
 var desk=r.querySelectorAll('.nativeDesk button');
 if(desk[0])desk[0].onclick=function(){var q=document.getElementById('q');if(q){q.focus();q.scrollIntoView({behavior:'smooth',block:'center'})}};
 if(desk[1])desk[1].onclick=function(){var a=document.getElementById('analysis');if(a&&!a.classList.contains('hidden'))a.scrollIntoView({behavior:'smooth',block:'center');else setStatus('Analyze a stock first.')}};
 if(desk[2])desk[2].onclick=function(){if(window.current&&typeof window.investigate==='function')window.investigate();else setStatus('Analyze a stock first.')}};
 if(desk[3])desk[3].onclick=function(){if(typeof window.openModal==='function')window.openModal('settingsModal')}};
 var controls=r.querySelectorAll('.nativeControls button');
 if(controls[0])controls[0].onclick=function(){if(typeof window.psOpenAi==='function')window.psOpenAi();else setStatus('Panic AI is unavailable right now.')}};
 if(controls[1])controls[1].onclick=function(){if(typeof window.psOpenPlanner==='function')window.psOpenPlanner();else setStatus('Planner is unavailable right now.')}};
 if(controls[2])controls[2].onclick=function(){if(typeof window.openModal==='function')window.openModal('accountModal')}};
 if(controls[3])controls[3].onclick=function(){if(typeof window.psOpenSettings==='function')window.psOpenSettings();else if(typeof window.openModal==='function')window.openModal('settingsModal')}};
 var search=document.createElement('div');search.className='nativeInlineSearch';search.innerHTML='<input id="nativeWorkbenchQuery" placeholder="Ticker or company — e.g. MU or Microsoft" maxlength="30"><button type="button">Search & analyze</button>';
 r.insertBefore(search,actions||r.firstChild);var input=search.querySelector('input'),go=search.querySelector('button');
 go.onclick=async function(){var q=(input.value||'').trim();if(!q){input.focus();return}setStatus('Searching '+q+'…');try{var res=await fetch('/api/search?q='+encodeURIComponent(q)),data=await res.json(),m=(data.matches||[])[0];if(!m){setStatus('No matching security found.');return}if(typeof window.analyze!=='function')throw Error('Scanner is still loading');await window.analyze(m.symbol,m.name);setStatus(m.symbol+' analyzed. The signal stack is now active.')}catch(e){setStatus('Search failed: '+(e.message||e))}};
 input.onkeydown=function(e){if(e.key==='Enter')go.click()};
 var access=document.createElement('div');access.className='nativeAccess';access.innerHTML='<button type="button">Sign in / Account</button><button type="button">✦ Panic AI</button>';
 r.appendChild(access);var ab=access.querySelectorAll('button');
 ab[0].onclick=function(){var auth=document.getElementById('auth');var token=localStorage.getItem('pswAccessToken');if(!token&&auth){auth.classList.remove('hidden');return}if(typeof window.openModal==='function')window.openModal('accountModal')};
 ab[1].onclick=function(){if(typeof window.psOpenAi==='function')window.psOpenAi();else setStatus('Panic AI is unavailable right now.')};
 function setStatus(t){var s=r.querySelector('.nativeStatus');if(!s){s=document.createElement('div');s.className='nativeStatus';r.insertBefore(s,actions||r.firstChild)}s.textContent=t}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();setTimeout(mount,100);setTimeout(mount,600);})();
