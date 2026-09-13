(function(){
  function sync(){
    var panel=document.getElementById('psPanel');
    var button=document.getElementById('panicAiCloseNew');
    if(!panel||!button)return;
    button.hidden=!panel.classList.contains('open');
  }
  function closePanel(){
    var panel=document.getElementById('psPanel');
    if(panel){panel.classList.remove('open');panel.style.display='none';}
    sync();
  }
  function start(){
    if(!document.body)return setTimeout(start,50);
    if(!document.getElementById('panicAiCloseNew')){
      var button=document.createElement('button');
      button.id='panicAiCloseNew';
      button.type='button';
      button.textContent='CLOSE AI';
      button.setAttribute('aria-label','Close AI panel');
      button.style.cssText='position:fixed;right:20px;bottom:20px;z-index:2147483647;width:132px;height:50px;border:2px solid #fff;border-radius:14px;background:#e51f3d;color:#fff;font:900 15px system-ui,sans-serif;cursor:pointer;box-shadow:0 8px 30px rgba(0,0,0,.7);';
      button.addEventListener('click',closePanel);
      button.addEventListener('pointerup',closePanel);
      document.body.appendChild(button);
    }
    sync();
    setInterval(sync,200);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
