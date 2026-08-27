/* Panic Scanner: production account authentication + reliable password recovery. */
(function(){
'use strict';
var URL='https://xinhpzibmvzqzahcklgy.supabase.co',KEY='sb_publishable_YsqF0jHnjrGY2anRaoH9pg_JKqiPqom',sb,signup=false,recovery=false;
function esc(v){return String(v==null?'':v).replace(/[&<>\"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'})[c]})}
function client(){
  if(sb)return Promise.resolve(sb);
  if(window.supabase&&window.supabase.createClient){sb=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'pkce'}});return Promise.resolve(sb)}
  return new Promise(function(ok,no){var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';s.onload=function(){try{sb=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'pkce'}});ok(sb)}catch(e){no(e)}};s.onerror=no;document.head.appendChild(s)})
}
function ui(){
  if(document.getElementById('psRealAuth'))return;
  var d=document.createElement('div');d.id='psRealAuth';
  d.innerHTML='<style>#psRealAuth{position:fixed;inset:0;z-index:99999;background:rgba(3,6,12,.92);backdrop-filter:blur(18px);display:none;overflow-y:auto;-webkit-overflow-scrolling:touch;box-sizing:border-box;padding:16px}#psRealAuth.open{display:block}.psra-box{width:min(460px,100%);margin:5vh auto 8vh;background:#0b1119;border:1px solid #293448;border-radius:22px;box-shadow:0 30px 120px #000;overflow:hidden}.psra-head{padding:24px;border-bottom:1px solid #202a39}.psra-head b{font-size:21px}.psra-head p{margin:6px 0 0;color:#8490a4;font-size:11px;line-height:1.5}.psra-body{padding:24px}.psra-label{display:block;color:#8c98aa;font-size:9px;font-weight:900;letter-spacing:.8px;text-transform:uppercase;margin:0 0 6px}.psra-input{display:block;width:100%;box-sizing:border-box;padding:13px 14px;border:1px solid #263246;border-radius:11px;background:#070c13;color:#fff;outline:none;margin:0 0 14px}.psra-actions{display:flex;gap:9px;flex-wrap:wrap}.psra-actions button{flex:1;min-width:140px;border:0;border-radius:11px;padding:13px;font-weight:950;cursor:pointer}.psra-primary{background:#8b7cff;color:#fff}.psra-secondary{background:#151d29;color:#fff;border:1px solid #263246!important}.psra-link{display:block;margin-top:14px;background:none;border:0;color:#aeb9cc;font-size:10px;text-decoration:underline;cursor:pointer}.psra-msg{min-height:18px;color:#aeb9cc;font-size:10px;line-height:1.5;margin-top:12px}.ps-user{position:fixed;right:18px;top:84px;z-index:9000;display:flex;align-items:center;gap:9px;padding:9px 12px;border:1px solid #35d59d44;background:#0d1b19;color:#fff;border-radius:12px;font-size:10px;font-weight:900}.ps-user button{border:0;background:none;color:#8490a4;cursor:pointer;font-weight:900}.ps-user strong{color:#35d59d}@media(max-width:620px){.psra-box{margin:2vh auto 10vh}.ps-user{right:12px;top:auto;bottom:76px}}</style><div class="psra-box"><div class="psra-head"><b id="psra-title">Welcome back</b><p id="psra-sub">Sign in to your account and continue where you left off.</p></div><div class="psra-body"><div id="psra-name-wrap" style="display:none"><label class="psra-label">Your name</label><input id="psra-name" class="psra-input" autocomplete="name" placeholder="Your name"></div><label class="psra-label">Email</label><input id="psra-email" class="psra-input" type="email" autocomplete="email" placeholder="you@example.com"><label class="psra-label" id="psra-pass-label">Password</label><input id="psra-pass" class="psra-input" type="password" autocomplete="current-password" placeholder="At least 6 characters"><div id="psra-confirm-wrap" style="display:none"><label class="psra-label">Confirm new password</label><input id="psra-confirm" class="psra-input" type="password" autocomplete="new-password" placeholder="Repeat your new password"></div><div class="psra-actions"><button id="psra-submit" class="psra-primary">Sign in</button><button id="psra-switch" class="psra-secondary">Create account</button></div><button id="psra-reset" class="psra-link">Forgot password?</button><div id="psra-msg" class="psra-msg"></div></div></div>';
  document.body.appendChild(d);
  document.getElementById('psra-submit').onclick=function(){recovery?finishRecovery():auth()};
  document.getElementById('psra-switch').onclick=function(){setMode(!signup)};
  document.getElementById('psra-reset').onclick=reset;
}
function setMode(v){
  recovery=false;signup=v;ui();
  document.getElementById('psra-title').textContent=v?'Create your Panic Scanner account':'Welcome back';
  document.getElementById('psra-sub').textContent=v?'Create an account so Panic Scanner recognizes you and keeps your workspace synced.':'Sign in to your account and continue where you left off.';
  document.getElementById('psra-name-wrap').style.display=v?'block':'none';
  document.getElementById('psra-confirm-wrap').style.display='none';
  document.getElementById('psra-pass-label').textContent='Password';
  document.getElementById('psra-pass').autocomplete=v?'new-password':'current-password';
  document.getElementById('psra-pass').placeholder='At least 6 characters';
  document.getElementById('psra-submit').textContent=v?'Create account':'Sign in';
  document.getElementById('psra-switch').textContent=v?'I have an account':'Create account';
  document.getElementById('psra-reset').style.display='block';
  document.getElementById('psra-msg').textContent='';
}
async function auth(){
  var m=document.getElementById('psra-msg'),e=document.getElementById('psra-email').value.trim(),p=document.getElementById('psra-pass').value,n=document.getElementById('psra-name').value.trim();
  if(!e||p.length<6||(signup&&!n)){m.textContent=signup?'Enter your name, email and a password of at least 6 characters.':'Enter your email and password.';return}
  m.textContent=signup?'Creating account…':'Signing in…';
  try{
    var c=await client(),r=signup?await c.auth.signUp({email:e,password:p,options:{data:{display_name:n,full_name:n},emailRedirectTo:location.origin+'/#auth'}}):await c.auth.signInWithPassword({email:e,password:p});
    if(r.error)throw r.error;
    if(signup&&!r.data.session){m.textContent='Account created. Check your email to confirm it, then sign in.';return}
    if(r.data.user){await recognize(r.data.user);document.getElementById('psRealAuth').classList.remove('open')}
  }catch(x){
    var msg=x.message||'Authentication failed. Please try again.';
    if(/invalid login credentials|invalid password|email not confirmed/i.test(msg))msg='Login failed. Check your email and password, or use “Forgot password?” to set a new password.';
    m.textContent=msg;
  }
}
async function recognize(u){
  var n=(u.user_metadata&&(u.user_metadata.display_name||u.user_metadata.full_name))||((u.email||'').split('@')[0]);
  try{var q=await sb.from('profiles').select('display_name,plan,is_admin').eq('id',u.id).maybeSingle();if(q.data&&q.data.display_name)n=q.data.display_name;else await sb.from('profiles').upsert({id:u.id,email:u.email,display_name:n},{onConflict:'id'})}catch(_){ }
  var old=document.getElementById('psUserBadge');if(old)old.remove();
  var b=document.createElement('div');b.id='psUserBadge';b.className='ps-user';b.innerHTML='<strong>●</strong> Hi, '+esc(n)+' <button id="psSignOut">Sign out</button>';document.body.appendChild(b);
  document.getElementById('psSignOut').onclick=async function(){try{await sb.auth.signOut()}finally{b.remove();open(false)}};
}
async function reset(){
  var e=document.getElementById('psra-email').value.trim(),m=document.getElementById('psra-msg');
  if(!e){m.textContent='Enter your email first.';document.getElementById('psra-email').focus();return}
  m.textContent='Sending password reset email…';
  try{
    var c=await client(),redirect=location.origin+'/#reset',r=await c.auth.resetPasswordForEmail(e,{redirectTo:redirect});
    if(r.error)throw r.error;
    m.textContent='Reset email sent. Open the email and use the link. This page will then let you choose a new password.';
  }catch(x){
    var msg=x.message||'Could not send reset email.';
    if(/rate limit/i.test(msg))msg='Reset email limit reached. Wait a little before requesting another email, then try again.';
    else if(/redirect|not allowed/i.test(msg))msg='Password reset is not enabled for this site URL yet. The site administrator needs to allow this production URL in Supabase Auth redirect URLs.';
    m.textContent=msg;
  }
}
function showRecovery(){
  recovery=true;signup=false;ui();
  var d=document.getElementById('psRealAuth');d.classList.add('open');
  document.getElementById('psra-title').textContent='Set a new password';
  document.getElementById('psra-sub').textContent='Choose a new password for your Panic Scanner account.';
  document.getElementById('psra-name-wrap').style.display='none';
  document.getElementById('psra-pass-label').textContent='New password';
  document.getElementById('psra-pass').autocomplete='new-password';
  document.getElementById('psra-pass').placeholder='At least 6 characters';
  document.getElementById('psra-confirm-wrap').style.display='block';
  document.getElementById('psra-submit').textContent='Update password';
  document.getElementById('psra-switch').style.display='none';
  document.getElementById('psra-reset').style.display='none';
  document.getElementById('psra-email').style.display='none';
  document.getElementById('psra-msg').textContent='';
}
async function finishRecovery(){
  var m=document.getElementById('psra-msg'),p=document.getElementById('psra-pass').value,c=document.getElementById('psra-confirm').value;
  if(p.length<6){m.textContent='New password must be at least 6 characters.';return}
  if(p!==c){m.textContent='The passwords do not match.';return}
  m.textContent='Updating password…';
  try{var r=await sb.auth.updateUser({password:p});if(r.error)throw r.error;m.textContent='Password updated. You can now sign in with your new password.';setTimeout(async function(){await sb.auth.signOut();location.hash='auth';location.reload()},900)}catch(x){m.textContent=x.message||'Could not update password. Please reopen the reset link and try again.'}
}
function open(mode){ui();if(recovery)recovery=false;setMode(mode===true);document.getElementById('psRealAuth').classList.add('open');setTimeout(function(){document.getElementById('psra-email').focus()},50)}
function wire(){
  var a=document.getElementById('auth');if(a){a.style.display='none';a.setAttribute('aria-hidden','true')}
  var bs=document.querySelectorAll('#auth button');for(var i=0;i<bs.length;i++)bs[i].onclick=function(){var t=(this.textContent||'').toLowerCase();open(t.indexOf('sign')<0)};
  var b=document.querySelector('.psAuthBtn');if(b)b.onclick=function(){open(false)}
}
async function boot(){
  ui();wire();
  try{
    var c=await client();
    c.auth.onAuthStateChange(function(event,session){if(event==='PASSWORD_RECOVERY'&&session)showRecovery();else if(event==='SIGNED_IN'&&session&&!recovery)recognize(session.user)});
    var r=await c.auth.getUser();if(r.data&&r.data.user)recognize(r.data.user);
    if(location.hash&&/reset|access_token|type=recovery/i.test(location.hash))setTimeout(function(){if(!recovery)showRecovery()},250);
  }catch(_){ }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
