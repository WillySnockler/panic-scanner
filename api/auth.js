/* Production auth endpoint: login, signup, and refresh. */
function supabaseConfig(){
  const url=process.env.SUPABASE_URL || 'https://xinhpzibmvzqzahcklgy.supabase.co';
  let secret=process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if(!secret && process.env.SUPABASE_SECRET_KEYS){try{secret=JSON.parse(process.env.SUPABASE_SECRET_KEYS).default||''}catch{}}
  const publishable=process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || ['sb_publishable_','YsqF0jHnjrGY2anRaoH9pg_JKqiPqom'].join('');
  return {url,secret,publishable};
}
async function authRequest(path, body) {
  const {url,publishable}=supabaseConfig();
  if (!url || !publishable) throw new Error('Supabase authentication is not configured.');
  const r = await fetch(`${url}/auth/v1/${path}`, { method:'POST', headers:{apikey:publishable,'Content-Type':'application/json'}, body:JSON.stringify(body) });
  const text=await r.text(); let data=null; try{data=text?JSON.parse(text):null}catch{}
  if(!r.ok) throw new Error(data?.msg||data?.message||data?.error_description||data?.error||'Authentication failed.');
  return data;
}
async function adminCreateUser(email,password){
  const {url,secret}=supabaseConfig();
  if(!secret) return null;
  const r=await fetch(`${url}/auth/v1/admin/users`,{method:'POST',headers:{apikey:secret,Authorization:`Bearer ${secret}`,'Content-Type':'application/json'},body:JSON.stringify({email,password,email_confirm:true})});
  const text=await r.text(); let data=null; try{data=text?JSON.parse(text):null}catch{}
  if(r.ok)return data;
  const msg=String(data?.msg||data?.message||data?.error_description||data?.error||'');
  if(/already|exists|registered/i.test(msg))throw new Error('An account with this email already exists. Sign in instead.');
  throw new Error(msg||'Could not create the account.');
}
module.exports=async(req,res)=>{
 if(!['POST','OPTIONS'].includes(req.method))return res.status(405).json({error:'Method not allowed'});
 if(req.method==='OPTIONS')return res.status(204).end();
 try{
  const action=String(req.body?.action||'login'),email=String(req.body?.email||'').trim().toLowerCase(),password=String(req.body?.password||'');
  if(action==='signup'){
    if(!email||password.length<8)return res.status(400).json({error:'Use a valid email and a password of at least 8 characters.'});
    /* Never fall back to /signup when an admin secret is unavailable: that path sends confirmation email and hits the SMTP quota. */
    const created=await adminCreateUser(email,password);
    if(!created)return res.status(503).json({error:'Account creation is not configured on the server yet.'});
    const session=await authRequest('token?grant_type=password',{email,password});
    return res.status(200).json({ok:true,...session});
  }
  if(action==='login'){
    if(!email||!password)return res.status(400).json({error:'Email and password are required.'});
    return res.status(200).json({ok:true,...await authRequest('token?grant_type=password',{email,password})});
  }
  if(action==='refresh'){
    const refresh_token=String(req.body?.refresh_token||'');
    if(!refresh_token)return res.status(400).json({error:'Refresh token is required.'});
    return res.status(200).json({ok:true,...await authRequest('token?grant_type=refresh_token',{refresh_token})});
  }
  return res.status(400).json({error:'Unknown authentication action.'});
 }catch(e){
  const msg=e.message||'Authentication failed.';
  const status=/already exists|already registered/i.test(msg)?409:/not configured/i.test(msg)?503:/rate limit|email rate/i.test(msg)?429:401;
  return res.status(status).json({error:msg});
 }
};
