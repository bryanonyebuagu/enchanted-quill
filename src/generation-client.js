export async function apiRequest(path,options={}){
 const headers={'X-Quill-Request':'1',...options.headers};if(options.body&&!(options.body instanceof Blob))headers['Content-Type']='application/json';
 const r=await fetch('/api'+path,{...options,headers,credentials:'same-origin'});const data=await r.json();if(!r.ok){const e=Error(data.error||'Request failed');e.status=r.status;throw e;}return data;
}
const uploads=new Map();
export async function syncLocalAsset(asset,storyId){
 if(!asset.blob)return asset.id;
 const key=storyId+':'+asset.id;if(uploads.has(key))return uploads.get(key);
 const data=await apiRequest('/assets',{method:'POST',headers:{'Content-Type':asset.blob.type,'X-Quill-Asset':encodeURIComponent(JSON.stringify({type:asset.type,ownerId:asset.ownerId,storyId,prompt:asset.prompt?.slice(0,2000),approved:asset.approved||false,localSourceId:asset.id}))},body:asset.blob});uploads.set(key,data.id);return data.id;
}
