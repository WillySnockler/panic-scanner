/* Production auth endpoint: login, signup, and refresh. */
async function authRequest(path, body) {
  const url = process.env.SUPABASE_URL || 'https://xinhpzibmvzqzahcklgy.supabase.co';
  const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || ['sb_publishable_','YsqF0jHnjrGY2anRaoH9pg_JKqiPqom'].join('');
  if (!url || !key) throw new Error('Supabase authentication is not configured.');
  const r = await fetch(`${url}/auth/v1/${path}`, { method:'POST', headers:{apikey:key,'Content-Type':'application/json'}, body:JSON.stringify(body) });
  const text=await r.text(); let data=null; try{data=text?JSON.parse(text):null}catch{}
  if(!r.ok) throw new Error(data?.msg||data?.message||data?.error_description||data?.error||'Authentication failed.');
  return data;
}
async function adminCreateUser(email,password){
  const url=process.env.SUPABASE_URL || 'https://xinhpzibmvzqzahcklgy.supabase.co';
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!key) return null;
  const r=await fetch(`${url}/auth/v1/admin/users`,{method:'POST',headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({email,password,email_confirm:true})});
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
    /* Prefer the server-side Admin API so normal signups do not consume Supabase confirmation-email quota. */
    const created=await adminCreateUser(email,password);
    if(created){
      const session=await authRequest('token?grant_type=password',{email,password});
      return res.status(200).json({ok:true,...session});
    }
    /* Safe fallback for deployments that have not configured the service-role key. */
    return res.status(200).json({ok:true,...await authRequest('signup',{email,password})});
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
  const status=/already exists|already registered|rate limit|email rate/i.test(msg)?409:401;
  return res.status(status).json({error:msg});
 }
};
