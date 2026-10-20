import {api} from './api.js';
export default {
 async fetch(request,env){
  const url=new URL(request.url);
  if(url.pathname.startsWith('/api/')){
   if(import.meta.env?.DEV){
    // Preview-only identity, stripped from production by Vite.
    if(!['localhost','127.0.0.1'].includes(url.hostname))return new Response('Local preview only',{status:403});
    const headers=new Headers(request.headers);for(const key of [...headers.keys()])if(key.startsWith('oai-authenticated-user-'))headers.delete(key);
    headers.set('oai-authenticated-user-id','local_storyteller');request=new Request(request,{headers});env={...env,QUILL_ADMIN_USER_IDS:'local_storyteller',HIGGSFIELD_MODE:'mock',HIGGSFIELD_API_ENABLED:'false'};
   }
   return api(request,env);
  }
  return env.ASSETS.fetch(request);
 }
};
