import generated from './generated-art.json' with {type:'json'};
export const generatedArt=generated;
export const bundledAssets=generated.filter(a=>a.type!=='cover').concat(['elara','rowan','maeve'].map(id=>({id:'art-character-'+id,type:'character',ownerId:id,storyId:'library-midnight',url:'/images/'+id+'-turnaround.png',source:'Original generated reference',createdAt:'2026-10-20T00:00:00.000Z',approved:true,bundled:true,coverage:['full-body']})));
export function coverFor(project){return project.cover||generated.find(a=>a.type==='cover'&&a.storyId===project.id)?.url||null;}
export function applyArtwork(projects,characters,locations){
 for(const c of characters){const ref=bundledAssets.find(a=>a.type==='character'&&a.ownerId===c.id);if(ref){c.referenceSheet=ref.url;c.referencePrompt=ref.prompt||c.prompt;if(!c.image)c.image=ref.url;c.referenceReady=true;}}
 for(const l of locations){const ref=bundledAssets.find(a=>a.type==='location'&&a.ownerId===l.id);if(ref)l.referenceImage=ref.url;}
 for(const p of projects){if(!p.cover||!p.cover.startsWith('/images/generated/')){const cover=generated.find(a=>a.type==='cover'&&a.storyId===p.id);if(cover&&(!p.cover||/^\/images\/(castle|city|sea|forest|space|desert)\.jpg$/.test(p.cover)))p.cover=cover.url;}}
}
