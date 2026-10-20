// Temporary, single-workspace bootstrap. Remove after verification.
const {createHash}=require('node:crypto');
const starter=require('./starter.json');
const ALLOWED_SHA='42f10376bc666819c9a4916131b8712521b65e11312869c4e35de6a9018ad366';
module.exports=async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='GET')return res.status(405).json({error:'GET only'});
 const room=req.query?.room;
 if(typeof room!=='string'||!/^[a-f0-9]{32}$/.test(room)||createHash('sha256').update(room).digest('hex')!==ALLOWED_SHA)return res.status(404).json({error:'Not found'});
 const url=process.env.UPSTASH_REDIS_REST_URL||process.env.KV_REST_API_URL;
 const token=process.env.UPSTASH_REDIS_REST_TOKEN||process.env.KV_REST_API_TOKEN;
 if(!url||!token)return res.status(503).json({error:'Storage not connected in production'});
 if(starter.version!==5||starter.workflows?.length!==3||starter.workflows.reduce((n,w)=>n+w.pages.length,0)!==27)return res.status(500).json({error:'Invalid starter'});
 const key='astra:form-design:room:'+room;
 const design={revision:1,updatedAt:new Date().toISOString(),updatedBy:'Nick',design:starter};
 const lua="if redis.call('EXISTS',KEYS[1])~=0 then return 0 end\nredis.call('SET',KEYS[1],ARGV[1])\nredis.call('SET',KEYS[2],'1')\nreturn 1";
 try {
  const response=await fetch((url.endsWith('/')?url.slice(0,-1):url),{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify(['EVAL',lua,2,key,key+':revision',JSON.stringify(design)]),signal:AbortSignal.timeout(10000)});
  const data=await response.json();
  if(!response.ok||data.error)return res.status(502).json({error:'Database initialization failed'});
  return res.status(200).json({initialized:Number(data.result)===1,exists:Number(data.result)===0,revision:1,pages:27,fields:309});
 }catch(e){return res.status(502).json({error:'Database initialization unavailable'});}
};
