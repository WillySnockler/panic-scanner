const original = require('./app');

module.exports = async function(req,res){
  const end = res.end.bind(res);
  res.end = function(body, encoding, cb){
    try {
      if(typeof body === 'string' && body.includes("localStorage.removeItem(TK);localStorage.removeItem(RK);localStorage.removeItem('psLoggedIn');showAuth();return null")){
        body = body.replace(
          "localStorage.removeItem(TK);localStorage.removeItem(RK);localStorage.removeItem('psLoggedIn');showAuth();return null",
          "if(/401|Sign in required/i.test(String(e&&e.message||''))){localStorage.removeItem(TK);localStorage.removeItem(RK);localStorage.removeItem('psLoggedIn');showAuth();return null}hideAuth();tier='standard';return null"
        );
      }
    } catch(err) { console.error('app auth patch:',err); }
    return end(body,encoding,cb);
  };
  return original(req,res);
};
