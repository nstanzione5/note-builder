// Vercel Node endpoint: shared project storage in Upstash. No PHI.
const ROOM=/^[a-f0-9]{32}$/;
const PREFIX='astra:form-design:room:';
const SCRIPT="local stored=redis.call('GET',KEYS[1])\nlocal previous=0\nif stored then local ok,parsed=pcall(cjson.decode,stored); if not ok or type(parsed)~='table' then return {-1,0} end; previous=tonumber(parsed.revision) or 0 end\nif previous~=tonumber(ARGV[1]) then return {0,previous} end\nredis.call('SET',KEYS[1],ARGV[2]); return {1,previous+1}";
async function redis(command){
 const url=process.env.UPSTASH_REDIS_REST_URL||process.env.KV_REST_API_URL;
 const token=process.env.UPSTASH_REDIS_REST_TOKEN||process.env.KV_REST_API_TOKEN;
 if(!url||!token){const e=new Error('Upstash variables missing for this deployment.');e.status=503;throw e;}
 const response=await fetch(url.replace(/\/$/,''),{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(command),signal:AbortSignal.timeout(10000)});
 const result=await response.json().catch(()=>({}));
 if(!response.ok||result.error){const e=new Error('Database unavailable.');e.status=502;throw e;}
 return result.result;
}
function fail(res,status,error){return res.status(status).json({error});}
module.exports=async function handler(req,res){
 res.setHeader('Cache-Control','no-store,max-age=0');res.setHeader('X-Content-Type-Options','nosniff');
 if(req.method!=='GET'&&req.method!=='POST')return fail(res,405,'Only GET and POST supported.');
 try{
  if(req.method==='GET'){
   const room=typeof req.query?.room==='string'?req.query.room:'';
   if(!ROOM.test(room))return fail(res,400,'Invalid shared workspace link.');
   const raw=await redis(['GET',PREFIX+room]);
   if(raw===null)return res.status(200).json({exists:false,revision:0});
   const record=typeof raw==='string'?JSON.parse(raw):raw;
   return res.status(200).json({exists:true,revision:record.revision,updatedAt:record.updatedAt,updatedBy:record.updatedBy,design:record.design});
  }
  const body=typeof req.body==='string'?JSON.parse(req.body):req.body;
  const room=body?.room,base=body?.baseRevision,design=body?.design;
  if(typeof room!=='string'||!ROOM.test(room))return fail(res,400,'Invalid shared workspace link.');
  if(!Number.isSafeInteger(base)||base<0)return fail(res,400,'Missing or invalid revision.');
  if(!design||design.version!==5||!Array.isArray(design.workflows)||design.workflows.length!==3||!design.workflows.every(w=>Array.isArray(w.pages)&&w.pages.every(p=>Array.isArray(p.fields))))return fail(res,400,'Invalid Astra project.');
  const updatedBy=String(body.editor||'Editor').trim().slice(0,50).replace(/[<>]/g,'')||'Editor';
  const next={revision:base+1,updatedAt:new Date().toISOString(),updatedBy,design};
  const serialized=JSON.stringify(next);
  if(Buffer.byteLength(serialized,'utf8')>1500000)return fail(res,413,'Project exceeds allowed size.');
  const reply=await redis(['EVAL',SCRIPT,1,PREFIX+room,base,serialized]);
  if(!Array.isArray(reply)||reply.length<2)return fail(res,502,'Unexpected database response.');
  if(+reply[0]===0)return res.status(409).json({error:'Another editor updated this project. Your local work was not overwritten.',remoteRevision:+reply[1]});
  if(+reply[0]!==1)return fail(res,500,'Stored project requires review.');
  return res.status(200).json({saved:true,revision:+reply[1],updatedAt:next.updatedAt,updatedBy});
 }catch(e){return fail(res,e.status||500,e.status===503?e.message:'Shared storage request failed. Local backup is unaffected.');}
};