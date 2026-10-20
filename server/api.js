import {configuration,requireLive} from './config.js';
import {HiggsfieldProvider,providerURL} from './higgsfield.js';
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
const uid=()=>crypto.randomUUID(), period=()=>new Date().toISOString().slice(0,7);
const one=(db,sql,...args)=>db.prepare(sql).bind(...args).first();
const rows=async(db,sql,...args)=>(await db.prepare(sql).bind(...args).all()).results;
const run=(db,sql,...args)=>db.prepare(sql).bind(...args).run();
const fail=(message,status=400)=>{const e=Error(message);e.status=status;throw e;};
const safe=job=>{const p=JSON.parse(job.payload);return {id:job.id,storyId:job.story_id,sceneId:job.scene_id,kind:job.kind,mode:job.mode,state:job.state,estimate:job.estimate,prompt:p.prompt,settings:p.settings,error:job.error,assetId:job.asset_id,createdAt:job.created,progress:job.state==='completed'?100:job.state==='processing'?55:job.state==='queued'?12:0,sourceAssetId:p.sourceAssetId,characterIds:p.characterIds,locationIds:p.locationIds};};
const sha=async value=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))].map(v=>v.toString(16).padStart(2,'0')).join('');
function escapeXML(t){return String(t||'').replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));}
function demo(job){const p=JSON.parse(job.payload),motion=job.kind.includes('video');return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720"><rect width="1280" height="720" fill="#151813"/><g fill="none" stroke="#dfff00" opacity=".5"><path d="M0 540L640 200L1280 540M100 720L640 200L1180 720M0 410H1280M0 600H1280"/><circle cx="640" cy="310" r="90">${motion?'<animate attributeName="r" values="86;96;86" dur="6s" repeatCount="indefinite"/>':''}</circle></g><rect x="50" y="40" width="360" height="46" rx="10" fill="#dfff00"/><text x="72" y="70" font-family="sans-serif" font-size="22" fill="#101500">MOCK DEMO · NOT AI OUTPUT</text><text x="60" y="595" font-family="sans-serif" font-size="36" fill="white">${escapeXML(p.title||job.kind).slice(0,85)}</text><text x="60" y="645" font-family="sans-serif" font-size="19" fill="#b7c19c">${escapeXML(p.prompt.slice(0,105))}</text><text x="60" y="688" font-family="sans-serif" font-size="16" fill="#b7c19c">${escapeXML(job.story_id)} / ${escapeXML(job.scene_id||p.entityId||'asset')} · ${job.id.slice(0,8)} · ${motion?'Animated placeholder, not a rendered video':'Workflow demonstration, not a story illustration'}</text></svg>`;}
async function wallet(db,owner,mode,c){const month=period();await run(db,'INSERT OR IGNORE INTO quill_wallets(owner,mode,period,plan,balance,held) VALUES(?,?,?,?,?,0)',owner,mode,month,'free',c.plans.free.monthlyCredits);return one(db,'SELECT * FROM quill_wallets WHERE owner=? AND mode=? AND period=?',owner,mode,month);}
async function settle(db,job,charge){
 const month=JSON.parse(job.payload).period, event=charge?'charge':'release',amount=charge?job.estimate:0;
 await db.batch([
  db.prepare('INSERT OR IGNORE INTO quill_ledger(id,owner,job_id,event,amount,mode,period,created) VALUES(?,?,?,?,?,?,?,?)').bind(uid(),job.owner,job.id,'settled',amount,job.mode,month,Date.now()),
  db.prepare('UPDATE quill_wallets SET balance=balance-?,held=MAX(0,held-?) WHERE owner=? AND mode=? AND period=? AND EXISTS(SELECT 1 FROM quill_ledger WHERE job_id=? AND event=\'settled\' AND applied=0)').bind(amount,job.estimate,job.owner,job.mode,month,job.id),
  db.prepare('UPDATE quill_ledger SET applied=1 WHERE job_id=? AND event=\'settled\'').bind(job.id)
 ]);
}
async function persistResult(env,job,providerResponse){
 const p=JSON.parse(job.payload),assetId='result-'+job.id,objectKey=`${job.owner}/${job.story_id}/${job.scene_id||p.entityId||'assets'}/${assetId}`;
 const old=await one(env.DB,'SELECT * FROM quill_assets WHERE id=? AND owner=?',assetId,job.owner);if(old)return old.id;
 let body,type;
 if(job.mode==='mock'){body=demo(job);type='image/svg+xml';}
 else {const output=providerResponse.images?.[0]?.url||providerResponse.video?.url;if(!output)throw Error('Provider completed without supported media output');const u=new URL(output),allowed=(env.HIGGSFIELD_MEDIA_HOSTS||'').split(',');if(u.protocol!=='https:'||!allowed.includes(u.hostname))throw Error('Output host needs administrator verification');const r=await fetch(u,{redirect:'error'});if(!r.ok)throw Error('Output retrieval failed');body=await r.arrayBuffer();if(body.byteLength>100*1024*1024)throw Error('Output exceeds storage limit');type=r.headers.get('content-type')||'application/octet-stream';}
 await env.BUCKET.put(objectKey,body,{httpMetadata:{contentType:type}});
 const assetType=job.kind==='character'?'character':job.kind==='location'?'location':job.kind.includes('video')?'video':'scene';
 const metadata={...p,mode:job.mode,approved:false,mock:job.mode==='mock',motionPreview:job.mode==='mock'&&assetType==='video',providerRequestId:providerResponse?.request_id};
 await run(env.DB,'INSERT OR IGNORE INTO quill_assets(id,owner,job_id,story_id,scene_id,asset_type,entity_id,object_key,content_type,metadata,created) VALUES(?,?,?,?,?,?,?,?,?,?,?)',assetId,job.owner,job.id,job.story_id,job.scene_id,assetType,p.entityId||null,objectKey,type,JSON.stringify(metadata),Date.now());return assetId;
}
async function advance(env,job){
 if(['failed','canceled'].includes(job.state)||job.state==='completed'&&job.asset_id)return job;
 let state=job.state,response;
 if(job.mode==='mock'){const age=Date.now()-job.created;state=age<1800?'queued':age<5200?'processing':'completed';}
 else {requireLive(env);if(!job.provider||!JSON.parse(job.provider).providerStatusURL)return job;response=await new HiggsfieldProvider(env).status(JSON.parse(job.provider));state=({queued:'queued',in_progress:'processing',completed:'completed',failed:'failed',nsfw:'failed',canceled:'canceled'})[response.status]||'processing';}
 let assetId=job.asset_id,error=null;
 if(['completed','failed','canceled'].includes(state)){
  await run(env.DB,"UPDATE quill_jobs SET state=?,updated=? WHERE id=? AND state IN ('queued','processing')",state,Date.now(),job.id);
  const current=await one(env.DB,'SELECT * FROM quill_jobs WHERE id=?',job.id);
  if(current.state!==state)return current;
  await settle(env.DB,job,state==='completed');
 }
 if(state==='completed')try{assetId=await persistResult(env,job,response);}catch(e){error=e.message;}
 if(state==='failed')error='Provider generation failed or was moderated. Reserved credits released.';
 await run(env.DB,"UPDATE quill_jobs SET state=?,asset_id=?,error=?,updated=? WHERE id=? AND (state=? OR state IN ('queued','processing'))",state,assetId,error,Date.now(),job.id,state);
 return {...job,state,asset_id:assetId,error};
}
function validateRequest(p,c){
 if(!p||typeof p.storyId!=='string'||p.storyId.length>180||!p.storyId)fail('Select a story.');
 if(typeof p.prompt!=='string'||!p.prompt.trim()||p.prompt.length>30000)fail('Enter a prompt of 1–30,000 characters.');
 const model=c.models.find(m=>m.id===p.modelId&&m.capabilities.includes(p.kind));if(!model)fail('Choose a supported model for this capability.');
 if(!p.settings||model.ratios?.length&&!model.ratios.includes(p.settings.aspectRatio)||model.resolutions?.length&&!model.resolutions.includes(p.settings.resolution)||model.durations?.length&&!model.durations.includes(p.settings.duration))fail('Unsupported generation settings.');
 if(p.kind==='scene'&&(typeof p.sceneDescription!=='string'||p.sceneDescription.trim().split(/\s+/).length<100))fail('Not enough words to create a new scene. Please write at least 100 words.');
 if(['scene','image-to-video','text-to-video'].includes(p.kind)&&!p.sceneId)fail('Select a scene.');
 if(p.kind==='scene'&&(!p.characterIds?.length||!p.locationIds?.length))fail('Choose characters and a saved location.');
 if(['character','location'].includes(p.kind)&&!p.entityId)fail('Select a saved character or location.');
 return model;
}
export async function api(request,env){
 const url=new URL(request.url),path=url.pathname.replace(/^\/api/,'');
 try{
  const owner=request.headers.get('oai-authenticated-user-id');if(!owner)return json({error:'Sign in with ChatGPT to use generation and cloud storage.'},401);
  const admin=(env.QUILL_ADMIN_USER_IDS||'').split(',').includes(owner),c=configuration(env);
  if(request.method!=='GET'){if(request.headers.get('Origin')!==url.origin||request.headers.get('X-Quill-Request')!=='1')fail('Invalid request origin.',403);if(Number(request.headers.get('content-length')||0)>25*1024*1024)fail('Request is too large.',413);}
  if(path==='/session')return json({user:{id:owner,admin},mode:c.mode,connected:!!c.credentials&&c.enabled&&c.verified&&c.billingVerified,models:c.models.map(({endpoint,...m})=>m),plans:c.plans,costs:c.costs,paymentsEnabled:false,preview:true});
  if(!env.DB||!env.BUCKET)fail('Generation storage is not configured.',503);
  if(path==='/wallet'){const w=await wallet(env.DB,owner,c.mode==='live'?'live':'mock',c);return json({...w,available:w.balance-w.held,preview:c.mode!=='live',ledger:await rows(env.DB,'SELECT job_id,event,amount,mode,created FROM quill_ledger WHERE owner=? ORDER BY created DESC LIMIT 50',owner)});}
  if(path==='/admin'){if(!admin)fail('Administrator access required.',403);return json({mode:c.mode,apiEnabled:c.enabled,keyConfigured:!!c.credentials,liveVerified:c.verified,billingVerified:c.billingVerified,connectionStatus:c.credentials?'Configured, verification required':'Higgsfield API Not Connected',capabilities:c.models.map(m=>({id:m.id,capabilities:m.capabilities,verified:m.liveVerified})),stats:await rows(env.DB,'SELECT mode,state,COUNT(*) count FROM quill_jobs GROUP BY mode,state'),errors:await rows(env.DB,'SELECT code,message,created FROM quill_events ORDER BY created DESC LIMIT 30')});}
  if(path==='/jobs'&&request.method==='GET'){return json({jobs:(await rows(env.DB,'SELECT * FROM quill_jobs WHERE owner=? ORDER BY created DESC LIMIT 60',owner)).map(safe)});}
  if(path==='/jobs'&&request.method==='POST'){
   if(c.mode==='disabled')fail('Generation is disabled. An administrator can enable Mock Mode without API credentials.',409);
   if(!request.headers.get('content-type')?.includes('application/json'))fail('Use JSON.',415);
   const p=await request.json(),model=validateRequest(p,c),key=request.headers.get('Idempotency-Key');
   if(!key||!/^[a-zA-Z0-9_-]{8,100}$/.test(key))fail('A valid idempotency key is required.');
   const hash=await sha(JSON.stringify(p));const existing=await one(env.DB,'SELECT * FROM quill_jobs WHERE owner=? AND request_key=?',owner,key);if(existing){if(existing.request_hash!==hash)fail('Idempotency key was already used with different parameters.',409);return json({job:safe(existing)},200);}
   const references=[];for(const id of [...new Set([...(p.sourceAssetId?[p.sourceAssetId]:[]),...(p.referenceIds||[])])]){const a=await one(env.DB,'SELECT * FROM quill_assets WHERE id=? AND owner=?',id,owner);if(!a)fail('A selected reference is missing or belongs to another user.',403);references.push(a);}
   if(p.kind==='image-to-video'&&(!p.sourceAssetId||!references.some(a=>a.id===p.sourceAssetId&&a.asset_type==='scene'&&a.story_id===p.storyId&&a.scene_id===String(p.sceneId))))fail('Use an image belonging to this story and scene.');
   if(c.mode==='live'){requireLive(env);if(!model.liveVerified||!model.endpoint)fail('This model has not been verified for live use.',409);if(references.some(a=>JSON.parse(a.metadata).mock))fail('Demo assets cannot be used as approved live references.');if(p.kind==='scene'&&(!model.referenceField||!references.length))fail('A verified reference-aware model and approved identity/environment assets are required.');}
   const estimate=Number(c.costs[p.kind]);if(!Number.isSafeInteger(estimate)||estimate<1)fail('Credit pricing needs administrator configuration.',409);
   await wallet(env.DB,owner,c.mode,c);const id=uid(),now=Date.now(),payload={...p,period:period()},mode=c.mode;
   try{await env.DB.batch([
    env.DB.prepare('INSERT INTO quill_jobs(id,owner,story_id,scene_id,kind,mode,state,request_key,request_hash,estimate,payload,created,updated) SELECT ?,?,?,?,?,?,\'queued\',?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM quill_wallets WHERE owner=? AND mode=? AND period=? AND balance-held>=?)').bind(id,owner,p.storyId,p.sceneId?String(p.sceneId):null,p.kind,mode,key,hash,estimate,JSON.stringify(payload),now,now,owner,mode,period(),estimate),
    env.DB.prepare('UPDATE quill_wallets SET held=held+? WHERE owner=? AND mode=? AND period=? AND EXISTS(SELECT 1 FROM quill_jobs WHERE id=?)').bind(estimate,owner,mode,period(),id),
    env.DB.prepare('INSERT INTO quill_ledger(id,owner,job_id,event,amount,mode,period,applied,created) SELECT ?,?,?,\'reserved\',?,?,?,1,? WHERE EXISTS(SELECT 1 FROM quill_jobs WHERE id=?)').bind(uid(),owner,id,estimate,mode,period(),now,id)
   ]);}catch(e){const other=await one(env.DB,'SELECT * FROM quill_jobs WHERE owner=? AND request_key=?',owner,key);if(other&&other.request_hash===hash)return json({job:safe(other)});throw e;}
   let job=await one(env.DB,'SELECT * FROM quill_jobs WHERE id=?',id);if(!job)fail('Insufficient credits. No generation request was submitted.',402);
   if(mode==='live')try{const provider=new HiggsfieldProvider(env),urls=[];for(const a of references){const obj=await env.BUCKET.get(a.object_key);if(!obj)throw Error('Reference file missing');urls.push(await provider.upload(new Blob([await obj.arrayBuffer()],{type:a.content_type})));}const prepared={model,inputUrls:urls};await run(env.DB,'UPDATE quill_jobs SET provider=? WHERE id=?',JSON.stringify(prepared),id);const result=await provider.submit(model,{...p,id},urls);const saved={...prepared,providerStatusURL:providerURL(result.status_url),providerCancelURL:providerURL(result.cancel_url),requestId:result.request_id};await run(env.DB,'UPDATE quill_jobs SET provider=? WHERE id=?',JSON.stringify(saved),id);}catch(e){const saved=await one(env.DB,'SELECT * FROM quill_jobs WHERE id=?',id);const uncertain=!!saved.provider&&!e.code;await run(env.DB,'UPDATE quill_jobs SET state=?,error=? WHERE id=?',uncertain?'submission_uncertain':'failed',uncertain?'Submission status is uncertain. Reconcile this job without creating a new request.':'Submission was rejected before acceptance. Reserved credits released.',id);if(!uncertain)await settle(env.DB,job,false);}
   job=await one(env.DB,'SELECT * FROM quill_jobs WHERE id=?',id);
   return json({job:safe(job)},201);
  }
  const reconcile=path.match(/^\/jobs\/([a-zA-Z0-9-]+)\/reconcile$/);
  if(reconcile&&request.method==='POST'){const job=await one(env.DB,'SELECT * FROM quill_jobs WHERE id=? AND owner=?',reconcile[1],owner);if(!job||job.state!=='submission_uncertain'||!job.provider)fail('No ambiguous submission to reconcile.',409);requireLive(env);const prepared=JSON.parse(job.provider),payload=JSON.parse(job.payload);const result=await new HiggsfieldProvider(env).submit(prepared.model,{...payload,id:job.id},prepared.inputUrls);const saved={...prepared,providerStatusURL:providerURL(result.status_url),providerCancelURL:providerURL(result.cancel_url),requestId:result.request_id};await run(env.DB,'UPDATE quill_jobs SET provider=?,state=\'queued\',error=NULL WHERE id=?',JSON.stringify(saved),job.id);return json({job:safe({...job,state:'queued',error:null})});}
  const jm=path.match(/^\/jobs\/([a-zA-Z0-9-]+)(\/cancel)?$/);
  if(jm){let job=await one(env.DB,'SELECT * FROM quill_jobs WHERE id=? AND owner=?',jm[1],owner);if(!job)fail('Job not found.',404);if(jm[2]&&request.method==='POST'){job=await advance(env,job);if(job.state!=='queued')fail('Only queued jobs can be canceled.',409);if(job.mode==='live')await new HiggsfieldProvider(env).cancel(JSON.parse(job.provider));await run(env.DB,'UPDATE quill_jobs SET state=\'canceled\',updated=? WHERE id=? AND state=\'queued\'',Date.now(),job.id);const canceled=await one(env.DB,'SELECT * FROM quill_jobs WHERE id=?',job.id);if(canceled.state!=='canceled')fail('Processing has started; cancellation is no longer available.',409);await settle(env.DB,job,false);job=canceled;}else if(request.method==='GET')job=await advance(env,job);else fail('Method not allowed',405);return json({job:safe(job)});}
  const approval=path.match(/^\/assets\/([a-zA-Z0-9-]+)\/approve$/);
  if(approval&&request.method==='POST'){const target=await one(env.DB,'SELECT * FROM quill_assets WHERE id=? AND owner=?',approval[1],owner);if(!target||!['character','location'].includes(target.asset_type))fail('Reference not found.',404);const related=await rows(env.DB,'SELECT id,metadata FROM quill_assets WHERE owner=? AND asset_type=? AND entity_id=?',owner,target.asset_type,target.entity_id);await env.DB.batch(related.map(a=>env.DB.prepare('UPDATE quill_assets SET metadata=? WHERE id=? AND owner=?').bind(JSON.stringify({...JSON.parse(a.metadata),approved:a.id===target.id}),a.id,owner)));return json({approved:target.id});}
  const am=path.match(/^\/assets\/([a-zA-Z0-9-]+)$/);
  if(am&&request.method==='GET'){const a=await one(env.DB,'SELECT * FROM quill_assets WHERE id=? AND owner=?',am[1],owner);if(!a)fail('Asset not found.',404);const obj=await env.BUCKET.get(a.object_key);if(!obj)fail('Asset file missing.',404);return new Response(obj.body,{headers:{'Content-Type':a.content_type,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; sandbox"}});}
  if(path==='/assets'&&request.method==='GET')return json({assets:(await rows(env.DB,'SELECT * FROM quill_assets WHERE owner=? ORDER BY created DESC LIMIT 300',owner)).map(a=>({...JSON.parse(a.metadata),id:a.id,type:a.asset_type,ownerId:a.entity_id||Number(a.scene_id),storyId:a.story_id,sceneId:a.scene_id,mime:a.content_type,url:'/api/assets/'+a.id,createdAt:new Date(a.created).toISOString()}))});
  if(path==='/assets'&&request.method==='POST'){
   const meta=JSON.parse(decodeURIComponent(request.headers.get('X-Quill-Asset')||'%7B%7D')),type=request.headers.get('content-type');if(!['image/png','image/jpeg','image/webp','video/mp4','video/webm'].includes(type))fail('Unsupported media type.',415);if(!['scene','character','location','video'].includes(meta.type)||!meta.storyId||meta.type==='scene'&&!Number.isSafeInteger(meta.ownerId))fail('Invalid asset ownership.');
   const bytes=await request.arrayBuffer();if(bytes.byteLength>20*1024*1024)fail('Media exceeds 20 MB.',413);const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(v=>v.toString(16).padStart(2,'0')).join('');const others=await rows(env.DB,'SELECT asset_type,entity_id,metadata FROM quill_assets WHERE owner=?',owner);if(others.some(a=>JSON.parse(a.metadata).hash===hash&&((['character','location'].includes(meta.type)&&a.asset_type===meta.type&&a.entity_id!==meta.ownerId)||(meta.type==='scene'&&['character','location'].includes(a.asset_type)))))fail('This image already belongs to a different visual asset. Use a unique reference or scene composition.');meta.hash=hash;const id=uid(),key=`${owner}/${meta.storyId}/${meta.ownerId}/${id}`;await env.BUCKET.put(key,bytes,{httpMetadata:{contentType:type}});await run(env.DB,'INSERT INTO quill_assets(id,owner,story_id,scene_id,asset_type,entity_id,object_key,content_type,metadata,created) VALUES(?,?,?,?,?,?,?,?,?,?)',id,owner,meta.storyId,['scene','video'].includes(meta.type)?String(meta.ownerId):null,meta.type,['character','location'].includes(meta.type)?meta.ownerId:null,key,type,JSON.stringify({...meta,source:'Imported',mock:false}),Date.now());return json({id},201);
  }
  if(path==='/projects'&&request.method==='GET')return json({projects:await rows(env.DB,'SELECT id,revision,payload,updated FROM quill_projects WHERE owner=?',owner)});
  if(path.startsWith('/projects/')&&request.method==='PUT'){const id=decodeURIComponent(path.slice(10)),p=await request.json();if(!p.project||p.project.id!==id||!Array.isArray(p.project.scenes))fail('Invalid project record.');if(JSON.stringify(p).length>4*1024*1024)fail('Project too large.',413);const current=Number.isSafeInteger(p.revision)?p.revision:0;const result=await one(env.DB,'INSERT INTO quill_projects(owner,id,revision,payload,updated) VALUES(?,?,?,?,?) ON CONFLICT(owner,id) DO UPDATE SET revision=quill_projects.revision+1,payload=excluded.payload,updated=excluded.updated WHERE quill_projects.revision=? RETURNING revision',owner,id,1,JSON.stringify(p.project),Date.now(),current);if(!result)fail('A newer cloud version exists. Reopen or save a copy before overwriting.',409);return json({revision:result.revision});}
  fail('Route not found.',404);
 }catch(e){const status=e.status||500;if(status>=500&&env.DB)try{await run(env.DB,'INSERT INTO quill_events(id,owner,code,message,created) VALUES(?,?,?,?,?)',uid(),request.headers.get('oai-authenticated-user-id')||'anonymous','request_failure','A generation or storage operation failed. Review server configuration.',Date.now());}catch{}return json({error:status>=500?'The operation could not complete. Your existing data is unchanged. Check provider settings.':e.message},status);}
}
