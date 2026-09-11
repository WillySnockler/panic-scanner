const original=require('./account');
module.exports=async function(req,res){
  const json=res.json.bind(res),status=res.status.bind(res);let code=200;
  res.status=function(n){code=n;return res};
  res.json=function(body){
    if(code===503&&req.method==='GET'){
      return json({profile:{plan:'Standard',is_admin:false,is_vip:false},settings:{sound:true,haptic:true,reduce_motion:false,volume:70,research_range:'60',compact_mode:false,chart_detail:2},watchlist:[],setups:[],investigations:[],theses:[],journal:[]});
    }
    return json(body);
  };
  return original(req,res);
};
