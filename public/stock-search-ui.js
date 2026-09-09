/* Panic Scanner scanner loader — load the stable renderer before user interaction. */
(function(){
'use strict';
function load(){
  if(document.getElementById('psStableScannerScript'))return;
  var s=document.createElement('script');
  s.id='psStableScannerScript';
  s.src='/ultimate-scanner-fix.js?v=3';
  s.async=false;
  (document.head||document.documentElement).appendChild(s);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
})();