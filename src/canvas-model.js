export const graphId=(kind,id)=>`${kind}:${id}`;
export function buildGraph(project,characters,locations){
 const nodes=[],edges=[];const cast=characters.filter(c=>project.characterIds?.includes(c.id)||project.scenes.some(s=>s.characterIds?.includes(c.id))),places=locations.filter(l=>project.locationIds?.includes(l.id)||project.scenes.some(s=>s.locationId===l.id||s.additionalLocationIds?.includes(l.id)));
 cast.forEach((c,i)=>nodes.push({id:graphId('character',c.id),type:'story',position:{x:0,y:i*400},data:{kind:'character',entityId:c.id}}));
 places.forEach((l,i)=>nodes.push({id:graphId('location',l.id),type:'story',position:{x:330,y:i*280},data:{kind:'location',entityId:l.id}}));
 project.scenes.forEach((s,i)=>{nodes.push({id:graphId('scene',s.id),type:'story',position:{x:700+(i%3)*350,y:Math.floor(i/3)*390},data:{kind:'scene',entityId:s.id}});(s.characterIds||[]).forEach(id=>edges.push({id:`cast-${id}-${s.id}`,source:graphId('character',id),target:graphId('scene',s.id)}));[s.locationId,...(s.additionalLocationIds||[])].filter(Boolean).forEach(id=>edges.push({id:`setting-${id}-${s.id}`,source:graphId('location',id),target:graphId('scene',s.id)}));s.choices.forEach((c,j)=>edges.push({id:`branch-${s.id}-${j}-${c.target}`,source:graphId('scene',s.id),target:graphId('scene',c.target),label:c.label}));});
 return {nodes,edges};
}
export function connectStory(project,nodes,sourceId,targetId){
 const a=nodes.find(n=>n.id===sourceId)?.data,b=nodes.find(n=>n.id===targetId)?.data;if(!a||!b||sourceId===targetId)throw Error('Choose two different nodes.');
 const scene=project.scenes.find(s=>s.id===b.entityId),from=project.scenes.find(s=>s.id===a.entityId);
 if(a.kind==='character'&&['scene','prompt'].includes(b.kind)&&scene){scene.characterIds=[...new Set([...(scene.characterIds||[]),a.entityId])];return 'Character reference connected';}
 if(a.kind==='location'&&['scene','prompt'].includes(b.kind)&&scene){if(!scene.locationId)scene.locationId=a.entityId;else if(scene.locationId!==a.entityId)scene.additionalLocationIds=[...new Set([...(scene.additionalLocationIds||[]),a.entityId])];return 'Location reference connected';}
 if(a.kind==='scene'&&b.kind==='scene'&&from&&scene){if(!from.choices.some(c=>c.target===scene.id))from.choices.push({label:'Continue to '+scene.title,target:scene.id});return 'Story branch connected';}
 const stages=['scene','prompt','image','video'];if(stages.indexOf(b.kind)===stages.indexOf(a.kind)+1&&stages.includes(a.kind)){if(a.entityId!==b.entityId)throw Error('A generation pipeline must belong to the same scene.');return 'Generation pipeline connected';}
 throw Error('Connect characters or locations to scenes, scenes to moments, or scene → prompt → image → video.');
}
export function disconnectStory(project,nodes,edge,remaining){
 const a=nodes.find(n=>n.id===edge.source)?.data,b=nodes.find(n=>n.id===edge.target)?.data;if(!a||!b)return;const target=project.scenes.find(s=>s.id===b.entityId),from=project.scenes.find(s=>s.id===a.entityId);
 if(remaining.some(e=>e.source===edge.source&&e.target===edge.target))return;
 if(['character','location'].includes(a.kind)&&remaining.some(e=>e.source===edge.source&&nodes.some(n=>n.id===e.target&&n.data.entityId===b.entityId&&['scene','prompt'].includes(n.data.kind))))return;
 if(a.kind==='character'&&['scene','prompt'].includes(b.kind)&&target)target.characterIds=(target.characterIds||[]).filter(id=>id!==a.entityId);
 if(a.kind==='location'&&['scene','prompt'].includes(b.kind)&&target){if(target.locationId===a.entityId){target.locationId=target.additionalLocationIds?.[0]||'';target.additionalLocationIds=(target.additionalLocationIds||[]).slice(1);}else target.additionalLocationIds=(target.additionalLocationIds||[]).filter(id=>id!==a.entityId);}
 if(a.kind==='scene'&&b.kind==='scene'&&from)from.choices=from.choices.filter(c=>c.target!==b.entityId);
}
