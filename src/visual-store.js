// Binary media stays in IndexedDB, outside the story's localStorage record.
const database = () => new Promise((resolve,reject)=>{
  const request=indexedDB.open('enchanted-quill-media-v1',1);
  request.onupgradeneeded=()=>request.result.createObjectStore('assets',{keyPath:'id'});
  request.onsuccess=()=>resolve(request.result); request.onerror=()=>reject(request.error);
});
async function transaction(mode, action) {
  const db=await database();
  try { return await new Promise((resolve,reject)=>{const tx=db.transaction('assets',mode), req=action(tx.objectStore('assets')); let result; req.onsuccess=()=>result=req.result; tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error || Error('Media transaction aborted'));}); }
  finally { db.close(); }
}
export async function loadAssets(){return transaction('readonly',s=>s.getAll());}
export async function saveAsset(asset){await transaction('readwrite',s=>s.put(asset));return asset;}
export async function importImage(file, metadata){
  if(!file || !['image/png','image/jpeg','image/webp'].includes(file.type))throw Error('Choose a PNG, JPEG or WebP image.');
  if(file.size>20*1024*1024)throw Error('Choose an image smaller than 20 MB.');
  const bitmap=await createImageBitmap(file); bitmap.close();
  const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',await file.arrayBuffer()))].map(b=>b.toString(16).padStart(2,'0')).join('');
  const existing=await loadAssets();
  if(metadata.type==='location'&&existing.some(a=>a.type==='location'&&a.ownerId!==metadata.ownerId&&a.hash===hash))throw Error('This image already belongs to a different location. Import a unique environment reference.');
  if(metadata.type==='scene'&&existing.some(a=>a.type!=='scene'&&a.hash===hash))throw Error('This is a saved reference image. Import a new composition of the story moment instead.');
  return saveAsset({...metadata,hash,id:crypto.randomUUID(),blob:file,createdAt:new Date().toISOString(),source:'Imported',approved:false});
}
export async function approveReference(id){
  const all=await loadAssets(), asset=all.find(a=>a.id===id); if(!asset || asset.type==='scene')throw Error('Reference not found');
  // Previous versions remain intact; only the explicit approval pointer changes.
  const db=await database();
  try {await new Promise((resolve,reject)=>{const tx=db.transaction('assets','readwrite'),s=tx.objectStore('assets');all.filter(a=>a.type===asset.type&&a.ownerId===asset.ownerId).forEach(a=>s.put({...a,approved:a.id===id}));tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}finally{db.close();}
}
