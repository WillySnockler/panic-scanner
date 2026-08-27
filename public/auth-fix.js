/* Fix the legacy full-screen login gate so the working Supabase account UI is reachable. */
(function () {
  'use strict';
  function hideLegacyAuth() {
    var legacy = document.getElementById('auth');
    if (!legacy) return false;
    legacy.style.display = 'none';
    legacy.setAttribute('aria-hidden', 'true');
    return true;
  }

  function wireLegacyButtons() {
    var signIn = document.querySelector('#auth .authBtn');
    var create = document.querySelector('#auth .authAlt button:first-child');
    var demo = document.querySelector('#auth .authAlt button:last-child');
    var accountButton = document.querySelector('.psAuthBtn');

    function openAccount() {
      var btn = document.querySelector('.psAuthBtn');
      if (btn) btn.click();
      else setTimeout(openAccount, 150);
    }

    if (signIn) signIn.onclick = openAccount;
    if (create) create.onclick = openAccount;
    if (demo) demo.onclick = openAccount;
    return !!(signIn || create || demo || accountButton);
  }

  function boot() {
    hideLegacyAuth();
    wireLegacyButtons();
    var tries = 0;
    var timer = setInterval(function () {
      hideLegacyAuth();
      if (wireLegacyButtons() || ++tries > 40) clearInterval(timer);
    }, 150);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
