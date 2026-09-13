const original = require('./app');

module.exports = async function(req,res){
  const end = res.end.bind(res);
  res.end = function(body, encoding, cb){
    try {
      if(Buffer.isBuffer(body)) body=body.toString('utf8');
      if(typeof body==='string'){
        const extra=`<style>#panicAiCloseNew{display:none;position:fixed;right:20px;bottom:20px;z-index:2147483647;width:132px;height:50px;border:2px solid #fff;border-radius:14px;background:#e51f3d;color:#fff;font:900 15px system-ui,sans-serif;cursor:pointer;box-shadow:0 8px 30px rgba(0,0,0,.75)}</style><button id="panicAiCloseNew" type="button" aria-label="Close AI panel">CLOSE AI</button><script>(function(){function sync(){var p=document.getElementById('psPanel'),b=document.getElementById('panicAiCloseNew');if(!p||!b)return;b.style.display=p.classList.contains('open')?'block':'none'}function closeIt(e){if(e){e.preventDefault();e.stopPropagation()}var p=document.getElementById('psPanel');if(p){p.classList.remove('open');p.style.display='none'}sync()}function start(){var b=document.getElementById('panicAiCloseNew');if(!b)return setTimeout(start,50);b.onclick=closeIt;b.onpointerup=closeIt;b.ontouchend=closeIt;sync();setInterval(sync,150)}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start()})();</script>`;
        body=body.replace('</body>',extra+'</body>');
      }
    }catch(e){console.error('wrapper v2',e)}
    return end(body,encoding,cb);
  };
  return original(req,res);
};
