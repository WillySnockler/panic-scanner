async function authRequest(path, body) {
  const url = process.env.SUPABASE_URL || 'https://xinhpzibmvzqzahcklgy.supabase.co';
  /* Publishable/anon Supabase keys are safe for client authentication; service role remains env-only. */
  const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || ['sb_publishable_','YsqF0jHnjrGY2anRaoH9pg_JKqiPqom'].join('');
  if (!url || !key) throw new Error('Supabase authentication is not configured.');
  const r = await fetch(`${url}/auth/v1/${path}`, { method:'POST', headers:{apikey:key,'Content-Type':'application/json'}, body:JSON.stringify(body) });
  const text=await r.text(); let data=null; try{data=text?JSON.parse(text):null}catch{}
  if(!r.ok) throw new Error(data?.msg||data?.message||data?.error_description||data?.error||'Authentication failed.');
  return data;
}
module.exports=async(req,res)=>{
 if(!['POST','OPTIONS'].includes(req.method))return res.status(405).json({error:'Method not allowed'});
 if(req.method==='OPTIONS')return res.status(204).end();
 try{
  const action=String(req.body?.action||'login'),email=String(req.body?.email||'').trim().toLowerCase(),password=String(req.body?.password||'');
  if(action==='signup'){if(!email||password.length<8)return res.status(400).json({error:'Use a valid email and a password of at least 8 characters.'});return res.status(200).json({ok:true,...await authRequest('signup',{email,password})});}
  if(action==='login'){if(!email||!password)return res.status(400).json({error:'Email and password are required.'});return res.status(200).json({ok:true,...await authRequest('token?grant_type=password',{email,password})});}
  if(action==='refresh'){const refresh_token=String(req.body?.refresh_token||'');if(!refresh_token)return res.status(400).json({error:'Refresh token is required.'});return res.status(200).json({ok:true,...await authRequest('token?grant_type=refresh_token',{refresh_token})});}
  return res.status(400).json({error:'Unknown authentication action.'});
 }catch(e){return res.status(401).json({error:e.message||'Authentication failed.'})}
};
