// Model capabilities come from documented schemas, not the consumer website catalog.
export const DOCS='https://docs.higgsfield.ai/docs/openapi.json';
export const models=[
 {id:'soul-standard',name:'Soul Standard',endpoint:'/higgsfield-ai/soul/standard',capabilities:['text-to-image','character','location'],ratios:['1:1','4:3','3:4','3:2','2:3','5:4','4:5','16:9','9:16','21:9'],resolutions:['2K','4K'],durations:[],referenceInput:false,source:DOCS,liveVerified:false},
 {id:'kling-i2v',name:'Kling 2.5 Turbo Pro',endpoint:'/kling-video/v2.5-turbo/pro/image-to-video',capabilities:['image-to-video'],ratios:[],resolutions:[],durations:[5,10],referenceInput:true,source:DOCS,liveVerified:false},
 {id:'kling-t2v',name:'Kling 2.5 Turbo Pro',endpoint:'/kling-video/v2.5-turbo/pro/text-to-video',capabilities:['text-to-video'],ratios:[],resolutions:[],durations:[5,10],referenceInput:false,source:DOCS,liveVerified:false},
 {id:'scene-reference-pending',name:'Reference-aware scene model',endpoint:null,capabilities:['scene'],ratios:['16:9','9:16','1:1'],resolutions:['Preview'],durations:[],referenceInput:true,source:null,liveVerified:false}
];
export const plans={free:{name:'Free',monthlyCredits:100,price:null},pro:{name:'Pro',monthlyCredits:1000,price:null},studio:{name:'Studio',monthlyCredits:5000,price:null}};
export function configuration(env){
 let catalog=models;
 if(env.HIGGSFIELD_MODEL_REGISTRY){try{const parsed=JSON.parse(env.HIGGSFIELD_MODEL_REGISTRY);if(Array.isArray(parsed))catalog=parsed;}catch{}}
 let planConfig=plans;try{if(env.QUILL_PLANS)planConfig=JSON.parse(env.QUILL_PLANS);}catch{}
 let costs={'text-to-image':4,scene:4,character:8,location:4,'image-to-video':20,'text-to-video':25};try{if(env.QUILL_CREDIT_COSTS)costs=JSON.parse(env.QUILL_CREDIT_COSTS);}catch{}
 return {mode:['disabled','mock','live'].includes(env.HIGGSFIELD_MODE)?env.HIGGSFIELD_MODE:'disabled',enabled:env.HIGGSFIELD_API_ENABLED==='true',credentials:env.HIGGSFIELD_API_KEY||'',verified:env.HIGGSFIELD_LIVE_VERIFIED==='true',billingVerified:env.HIGGSFIELD_BILLING_VERIFIED==='true',models:catalog,plans:planConfig,costs};
}
export function requireLive(env){const c=configuration(env);if(c.mode!=='live'||!c.enabled||!c.credentials||!c.verified||!c.billingVerified)throw new Error('Live generation is locked. Credentials, account/model verification and billing policy verification are required.');return c;}
