/* Panic Scanner workspace hardening: client-side fallbacks that keep the research workspace usable. */
(function () {
  'use strict';
  window.pswAdmin = window.pswAdmin || function () {
    var body = document.getElementById('pswBody');
    var modal = document.getElementById('pswModal');
    if (!body || !modal) return;
    document.getElementById('pswTitle').textContent = 'Admin / VIP';
    document.getElementById('pswSub').textContent = 'Owner controls';
    var raw = localStorage.getItem('pswWorkspace') || '{}';
    var state;
    try { state = JSON.parse(raw); } catch (_) { state = {}; }
    body.innerHTML = '<div class="pswNotice"><b>Owner mode</b><br>VIP access is enabled locally for this device. Server-side billing and entitlement checks must be connected before public launch.</div>' +
      '<div class="pswGrid" style="margin-top:10px">' +
      '<div class="pswCard"><h3>Plan</h3><p>' + String(state.plan || 'Standard') + '</p></div>' +
      '<div class="pswCard"><h3>VIP</h3><p>' + (state.vip ? 'Enabled' : 'Disabled') + '</p></div>' +
      '<div class="pswCard"><h3>Data</h3><p>Local workspace storage active.</p></div></div>';
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  window.pswOpen = window.pswOpen || function (k) { if (k === 'admin') window.pswAdmin(); };
})();
