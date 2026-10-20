import {requireLive} from './config.js';
const origin='https://api.higgsfield.ai';
export function providerURL(value){const u=new URL(value,origin);if(u.origin!==origin||u.username||u.password||u.search||u.hash)throw Error('Invalid provider URL');return u.href;}
export class HiggsfieldProvider {
 constructor(env,fetcher=fetch){this.env=env;this.fetcher=fetcher;}
 async call(url,{method='GET',body,idempotencyKey}={}){
  const c=requireLive(this.env); // This guard applies to submission, status, uploads, estimates AND cancellation.
  const headers={Authorization:`Key ${c.credentials}`,'Content-Type':'application/json'};
  if(idempotencyKey)headers['Idempotency-Key']=idempotencyKey;
  const r=await this.fetcher(providerURL(url),{method,headers,body:body===undefined?undefined:JSON.stringify(body),redirect:'error',signal:AbortSignal.timeout(30000)});
  if(!r.ok){const e=Error(`Higgsfield request failed (${r.status}). Check provider access and logs.`);e.code=r.status;throw e;}
  return r.status===202?null:r.json();
 }
 payload(model,job,inputUrls=[]){
  const data={prompt:job.prompt};
  if(model.ratios?.length)data.aspect_ratio=job.settings.aspectRatio;
  if(model.resolutions?.length)data.resolution=job.settings.resolution;
  if(model.durations?.length)data.duration=job.settings.duration;
  if(job.kind==='image-to-video'){if(!inputUrls[0])throw Error('A starting image is required');data.image_url=inputUrls[0];}
  if(model.referenceField&&inputUrls.length)data[model.referenceField]=inputUrls;
  return data;
 }
 submit(model,job,inputUrls=[]){if(!model.endpoint||!model.liveVerified)throw Error('Model is unavailable until verified for this account.');return this.call(model.endpoint,{method:'POST',body:this.payload(model,job,inputUrls),idempotencyKey:job.id});}
 status(job){return this.call(job.providerStatusURL);}
 cancel(job){return this.call(job.providerCancelURL,{method:'POST'});}
 async upload(blob){
  const ticket=await this.call('/files/generate-upload-url',{method:'POST',body:{content_type:blob.type}});
  const url=new URL(ticket.upload_url);if(url.protocol!=='https:'||url.username||url.password)throw Error('Invalid upload URL');
  // Never send the API credential to object storage.
  const r=await this.fetcher(url.href,{method:'PUT',headers:ticket.upload_headers,body:blob,redirect:'error'});if(!r.ok)throw Error('Provider media upload failed');return ticket.public_url;
 }
}
