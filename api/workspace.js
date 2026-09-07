const fs = require('fs');
const path = require('path');

module.exports = async function handler(req, res) {
  try {
    const html = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
    const inject = `
<style>
#psBilling{position:fixed;right:18px;bottom:18px;z-index:9999;font:14px system-ui;color:#fff}#psBilling button{border:1px solid #39455b;background:#111925;color:#fff;border-radius:10px;padding:10px 14px;font-weight:800;cursor:pointer}#psBilling .psPanel{display:none;position:fixed;right:18px;bottom:68px;width:min(430px,calc(100vw - 36px));background:#0b1119;border:1px solid #293448;border-radius:18px;padding:18px;box-shadow:0 25px 80px #000b}#psBilling.open .psPanel{display:block}#psBilling h3{margin:0 0 5px}#psBilling p{color:#9aa6b9;font-size:12px;line-height:1.45}#psBilling input{width:100%;box-sizing:border-box;background:#080d15;color:#fff;border:1px solid #303b4e;border-radius:8px;padding:10px;margin:5px 0}#psBilling .row{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}#psBilling .plan{border:1px solid #293448;border-radius:12px;padding:12px;margin-top:8px}#psBilling .primary{background:#786cff;border-color:#786cff}#psBilling .muted{color:#7f8ba0;font-size:11px}
</style>
<div id="psBilling"><button onclick="psToggleBilling()">Account &amp; Plans</button><div class="psPanel"><div id="psStatus"><h3>Panic Scanner</h3><p>Sign in to save research and purchase Pro or Elite.</p></div><div id="psAuth"><input id="psEmail" type="email" placeholder="Email"><input id="psPass" type="password" placeholder="Password (8+ characters)"><div class="row"><button class="primary" onclick="psAuthDo('login')">Sign in</button><button onclick="psAuthDo('signup')">Create account</button></div></div><div id="psPlans" style="display:none"><div class="plan"><b>Pro — 149 NOK/month</b><p>Deep investigations, catalysts, thesis tools and expanded research.</p><div class="row"><button class="primary" onclick="psCheckout('pro','monthly')">Choose Pro</button><button onclick="psCheckout('pro','yearly')">1,499 NOK/year</button></div></div><div class="plan"><b>Elite — 299 NOK/month</b><p>Everything in Pro plus advanced research and unlimited setups.</p><div class="row"><button class="primary" onclick="psCheckout('elite','monthly')">Choose Elite</button><button onclick="psCheckout('elite','yearly')">2,990 NOK/year</button></div></div><div class="row"><button onclick="psPortal()">Manage subscription</button><button onclick="psLogout()">Sign out</button></div></div><div id="psMsg" class="muted"></div></div></div>
<script>
(function(){
function token(){return localStorage.getItem('pswAccessToken')||''}
function setMsg(s){var e=document.getElementById('psMsg');if(e)e.textContent=s||''}
function refresh(){var t=token();document.getElementById('psAuth').style.display=t?'none':'';document.getElementById('psPlans').style.display=t?'block':'none';if(t){fetch('/api/account',{headers:{Authorization:'Bearer '+t}}).then(function(r){return r.json()}).then(function(d){var p=d.profile||{};document.getElementById('psStatus').innerHTML='<h3>'+String(p.email||'Account').replace(/[<>&]/g,'')+'</h3><p>Plan: '+String(p.plan||'standard')+' · '+(p.is_vip?'VIP access':'Standard access')+'</p>'}).catch(function(){})}}
window.psToggleBilling=function(){document.getElementById('psBilling').classList.toggle('open');refresh()}
window.psAuthDo=function(action){var email=document.getElementById('psEmail').value.trim(),password=document.getElementById('psPass').value;if(!email||!password)return setMsg('Enter your email and password.');setMsg('Working…');fetch('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:action,email:email,password:password})}).then(function(r){return r.json().then(function(d){return {ok:r.ok,d:d}})}).then(function(x){if(!x.ok)throw Error(x.d.error||'Authentication failed.');if(x.d.access_token){localStorage.setItem('pswAccessToken',x.d.access_token);if(x.d.refresh_token)localStorage.setItem('pswRefreshToken',x.d.refresh_token);setMsg('Signed in.');refresh()}else setMsg('Account created. Check your email if confirmation is required.')}).catch(function(e){setMsg(e.message)})}
window.psCheckout=function(plan,interval){if(!token())return setMsg('Sign in first.');setMsg('Opening secure Stripe checkout…');fetch('/api/billing',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token()},body:JSON.stringify({action:'checkout',plan:plan,interval:interval})}).then(function(r){return r.json().then(function(d){return {ok:r.ok,d:d}})}).then(function(x){if(!x.ok)throw Error(x.d.error||'Checkout failed.');location.href=x.d.url}).catch(function(e){setMsg(e.message)})}
window.psPortal=function(){fetch('/api/billing',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token()},body:JSON.stringify({action:'portal'})}).then(function(r){return r.json().then(function(d){return {ok:r.ok,d:d}})}).then(function(x){if(!x.ok)throw Error(x.d.error||'Billing portal unavailable.');location.href=x.d.url}).catch(function(e){setMsg(e.message)})}
window.psLogout=function(){localStorage.removeItem('pswAccessToken');localStorage.removeItem('pswRefreshToken');setMsg('Signed out.');refresh()}
refresh();
})();
</script>`;
    return res.status(200).send(html.replace('</body>', inject + '</body>'));
  } catch (e) {
    console.error('workspace error', e);
    return res.status(500).json({ error: 'Workspace failed to load.' });
  }
};
