const app=require('./app');
module.exports=async function(req,res){
 const originalEnd=res.end.bind(res),originalWrite=res.write.bind(res);let chunks=[];
 res.write=function(chunk,encoding){if(chunk)chunks.push(Buffer.isBuffer(chunk)?chunk:Buffer.from(chunk,encoding));return true};
 res.end=function(chunk,encoding){if(chunk)chunks.push(Buffer.isBuffer(chunk)?chunk:Buffer.from(chunk,encoding));let body=Buffer.concat(chunks).toString('utf8');if(req.method==='GET'&&typeof body==='string'&&body.includes('</body>')){if(!body.includes('/ps-enhance.js'))body=body.replace('</body>','<script src="/ps-enhance.js?v=1"></script></body>');if(!body.includes('/ps-bottom-redesign.css'))body=body.replace('</head>','<link rel="stylesheet" href="/ps-bottom-redesign.css?v=1"></head>');if(!body.includes('/ps-bottom-modules.js'))body=body.replace('</body>','<script src="/ps-bottom-modules.js?v=2"></script></body>')}res.write=originalWrite;res.end=originalEnd;return res.end(Buffer.from(body,'utf8'))};
 return app(req,res);
};
