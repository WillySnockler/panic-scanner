/* Panic Scanner workspace hardening + Supabase account persistence. */
(function () {
  'use strict';
  var SUPABASE_URL = 'https://xinhpzibmvzqzahcklgy.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_YsqF0jHnjrGY2anRaoH9pg_JKqiPqom';
  var sb = null;
  var ready = false;
  var authButton = null;

  function esc(x) { return String(x == null ? '' : x).replace(/[&<>\"']/g, function (c) { return ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'})[c]; }); }
  function localState() { try { return JSON.parse(localStorage.getItem('pswWorkspace') || '{}'); } catch (_) { return {}; } }
  function saveLocal(s) { try { localStorage.setItem('pswWorkspace', JSON.stringify(s)); } catch (_) {} }
  function ensureClient() {
    if (window.supabase && window.supabase.createClient) { sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }); ready = true; return Promise.resolve(); }
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      s.onload = function () { try { sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }); ready = true; resolve(); } catch (e) { reject(e); } };
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  function ensureStyles() {
    if (document.getElementById('ps-auth-style')) return;
    var s = document.createElement('style'); s.id = 'ps-auth-style'; s.textContent = '.psAuthBtn{position:fixed;right:18px;top:86px;z-index:180;border:1px solid #786cff66;background:#141329;color:#fff;border-radius:11px;padding:9px 12px;font-size:9px;font-weight:950;box-shadow:0 12px 35px #0007}.psAuthBackdrop{position:fixed;inset:0;z-index:500;background:#000c;backdrop-filter:blur(14px);display:none;padding:16px}.psAuthBackdrop.open{display:block}.psAuthBox{width:min(430px,100%);margin:10vh auto;background:#0b1119;border:1px solid #263246;border-radius:20px;box-shadow:0 35px 120px #000e;overflow:hidden}.psAuthHead{padding:20px;border-bottom:1px solid #202a39;display:flex;justify-content:space-between;gap:12px}.psAuthHead b{font-size:17px}.psAuthHead span{display:block;color:#8490a4;font-size:9px;margin-top:4px}.psAuthBody{padding:20px}.psAuthBody label{display:block;color:#7d899d;font-size:8px;font-weight:900;text-transform:uppercase;margin:10px 0 5px}.psAuthBody input{width:100%;box-sizing:border-box;background:#080d15;color:#fff;border:1px solid #202a39;border-radius:9px;padding:11px}.psAuthActions{display:flex;gap:8px;margin-top:14px}.psAuthActions button{flex:1;border:0;border-radius:10px;padding:11px;font-weight:950}.psAuthPrimary{background:#8b7cff;color:#fff}.psAuthSecondary{background:#151d29;color:#fff;border:1px solid #202a39!important}.psAuthMsg{min-height:18px;color:#8490a4;font-size:9px;line-height:1.45;margin-top:10px}.psAuthClose{background:#151d29;color:#fff;border:1px solid #202a39;border-radius:9px;width:34px}.psAuthUser{position:fixed;right:18px;top:86px;z-index:180;border:1px solid #35d59d44;background:#0d1b19;color:#fff;border-radius:11px;padding:9px 12px;font-size:9px;font-weight:950}.psAuthUser button{margin-left:7px;border:0;background:transparent;color:#8490a4;font-weight:900}@media(max-width:620px){.psAuthBtn,.psAuthUser{right:12px;top:auto;bottom:76px}.psAuthBox{margin:5vh auto}}'; document.head.appendChild(s);
  }
  function modal() {
    if (document.getElementById('psAuthModal')) return document.getElementById('psAuthModal');
    var d = document.createElement('div'); d.id = 'psAuthModal'; d.className = 'psAuthBackdrop';
    d.innerHTML = '<div class="psAuthBox"><div class="psAuthHead"><div><b>Panic Scanner account</b><span>Save your research across devices.</span></div><button class="psAuthClose" id="psAuthClose">×</button></div><div class="psAuthBody"><label>Email</label><input id="psAuthEmail" type="email" autocomplete="email" placeholder="you@example.com"><label>Password</label><input id="psAuthPassword" type="password" autocomplete="current-password" placeholder="At least 6 characters"><div class="psAuthActions"><button class="psAuthPrimary" id="psAuthSignIn">Sign in</button><button class="psAuthSecondary" id="psAuthSignUp">Create account</button></div><div class="psAuthMsg" id="psAuthMsg"></div></div></div>';
    document.body.appendChild(d);
    document.getElementById('psAuthClose').onclick = function () { d.classList.remove('open'); };
    document.getElementById('psAuthSignIn').onclick = function () { auth(false); };
    document.getElementById('psAuthSignUp').onclick = function () { auth(true); };
    return d;
  }
  function openAuth() { ensureStyles(); modal().classList.add('open'); var e = document.getElementById('psAuthEmail'); if (e) e.focus(); }
  async function auth(signup) {
    var msg = document.getElementById('psAuthMsg'), email = (document.getElementById('psAuthEmail').value || '').trim(), password = document.getElementById('psAuthPassword').value || '';
    if (!email || password.length < 6) { msg.textContent = 'Enter a valid email and a password of at least 6 characters.'; return; }
    msg.textContent = signup ? 'Creating account…' : 'Signing in…';
    try { await ensureClient(); var r = signup ? await sb.auth.signUp({ email: email, password: password }) : await sb.auth.signInWithPassword({ email: email, password: password }); if (r.error) throw r.error; if (signup && !r.data.session) msg.textContent = 'Account created. Check your email to confirm it, then sign in.'; else { document.getElementById('psAuthModal').classList.remove('open'); await refreshUser(); } } catch (e) { msg.textContent = e.message || 'Authentication failed.'; }
  }
  function addButton() {
    if (authButton || !document.body) return;
    authButton = document.createElement('button'); authButton.className = 'psAuthBtn'; authButton.textContent = 'Sign in / Create account'; authButton.onclick = openAuth; document.body.appendChild(authButton);
  }
  function addUserButton(email) {
    if (authButton) authButton.remove();
    var old = document.getElementById('psAuthUser'); if (old) old.remove();
    var d = document.createElement('div'); d.id = 'psAuthUser'; d.className = 'psAuthUser'; d.innerHTML = 'Signed in · ' + esc(email || 'Account') + ' <button id="psAuthLogout">Sign out</button>'; document.body.appendChild(d);
    document.getElementById('psAuthLogout').onclick = async function () { await sb.auth.signOut(); localStorage.removeItem('pswWorkspaceRemote'); location.reload(); };
  }
  async function syncRemote(user) {
    if (!sb || !user) return;
    var s = localState();
    var w = (s.watch || []).map(function (symbol) { return { user_id: user.id, symbol: String(symbol).toUpperCase() }; });
    if (w.length) await sb.from('watchlist_items').upsert(w, { onConflict: 'user_id,symbol' });
    if (s.setups && s.setups.length) await sb.from('setups').insert(s.setups.slice(0, 50).map(function (x) { return { user_id:user.id, symbol:String(x.symbol||'').toUpperCase(), entry:x.entry||null, stop:x.stop||null, target:x.target||null, position_amount:x.money||null, risk_profile:x.risk||null }; }));
    if (s.theses && s.theses.length) await sb.from('theses').insert(s.theses.slice(0, 50).map(function (x) { return { user_id:user.id, symbol:String(x.symbol||'').toUpperCase(), catalyst:x.catalyst||null, bull_case:x.bull||null, bear_case:x.bear||null, confirmation:x.confirm||null, invalidation:x.invalidation||null }; }));
    if (s.journal && s.journal.length) await sb.from('journal_entries').insert(s.journal.slice(0, 100).map(function (x) { return { user_id:user.id, entry_type:x.type||'research', symbol:x.symbol||null, title:x.title||null, body:x.body||null, metadata:x }; }));
    if (s.settings) await sb.from('user_settings').upsert({ user_id:user.id, sound:s.settings.sound !== false, haptic:s.settings.haptic !== false, reduce_motion:s.settings.motion === true, volume:Number(s.settings.volume||70), research_range:String(s.settings.range||'60') });
    var p = await sb.from('profiles').select('plan,is_admin').eq('id', user.id).maybeSingle();
    if (p.data) { s.plan = p.data.plan === 'elite' ? 'Elite' : p.data.plan === 'pro' ? 'Pro' : 'Standard'; s.vip = !!p.data.is_admin || s.plan !== 'Standard'; saveLocal(s); }
    var [rw,rs,rt,rj,rg] = await Promise.all([
      sb.from('watchlist_items').select('symbol').eq('user_id',user.id).order('created_at',{ascending:false}),
      sb.from('setups').select('symbol,entry,stop,target,position_amount,risk_profile,created_at').eq('user_id',user.id).order('created_at',{ascending:false}).limit(100),
      sb.from('theses').select('symbol,catalyst,bull_case,bear_case,confirmation,invalidation,created_at').eq('user_id',user.id).order('created_at',{ascending:false}).limit(100),
      sb.from('journal_entries').select('entry_type,symbol,title,body,metadata,created_at').eq('user_id',user.id).order('created_at',{ascending:false}).limit(100),
      sb.from('user_settings').select('*').eq('user_id',user.id).maybeSingle()
    ]);
    var n = localState(); n.watch = (rw.data||[]).map(function(x){return x.symbol;}); n.setups=(rs.data||[]).map(function(x){return {symbol:x.symbol,entry:x.entry,stop:x.stop,target:x.target,money:x.position_amount,risk:x.risk_profile,date:x.created_at};}); n.theses=(rt.data||[]).map(function(x){return {symbol:x.symbol,catalyst:x.catalyst,bull:x.bull_case,bear:x.bear_case,confirm:x.confirmation,invalidation:x.invalidation,date:x.created_at};}); n.journal=(rj.data||[]).map(function(x){return Object.assign({type:x.entry_type,symbol:x.symbol,title:x.title,body:x.body,date:x.created_at},x.metadata||{});}); if(rg.data)n.settings={sound:rg.data.sound,haptic:rg.data.haptic,motion:rg.data.reduce_motion,volume:rg.data.volume,range:rg.data.research_range}; saveLocal(n);
  }
  async function refreshUser() { try { await ensureClient(); var r = await sb.auth.getUser(); if (r.data && r.data.user) { addUserButton(r.data.user.email); await syncRemote(r.data.user); } else addButton(); } catch (_) { addButton(); } }
  window.pswAdmin = function () {
    var body = document.getElementById('pswBody'), modalEl = document.getElementById('pswModal'); if (!body || !modalEl) return;
    document.getElementById('pswTitle').textContent = 'Admin / VIP'; document.getElementById('pswSub').textContent = 'Account status';
    var s = localState();
    body.innerHTML = '<div class="pswNotice"><b>Account-backed workspace</b><br>Saved research is stored in your Panic Scanner account. Subscription entitlements remain server-controlled.</div><div class="pswGrid" style="margin-top:10px"><div class="pswCard"><h3>Plan</h3><p>' + esc(s.plan || 'Standard') + '</p></div><div class="pswCard"><h3>VIP</h3><p>' + (s.vip ? 'Enabled' : 'Standard access') + '</p></div><div class="pswCard"><h3>Account</h3><p>' + (sb ? 'Connected' : 'Not connected') + '</p></div></div>';
    modalEl.classList.add('open'); document.body.style.overflow = 'hidden';
  };
  window.pswOpen = window.pswOpen || function (k) { if (k === 'admin') window.pswAdmin(); };
  function boot() { ensureStyles(); addButton(); refreshUser(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
