import {test} from 'node:test';import assert from 'node:assert/strict';import {buildGraph,connectStory,disconnectStory} from './canvas-model.js';
const make=()=>({id:'story',characterIds:['a','b'],locationIds:['one','two'],scenes:[{id:1,title:'First',text:'Moment',characterIds:['a'],locationId:'one',choices:[]},{id:2,title:'Second',text:'Next',characterIds:[],locationId:'',choices:[]}]});
test('connections update reusable records and support multiple characters and locations',()=>{const p=make(),{nodes}=buildGraph(p,[{id:'a'},{id:'b'}],[{id:'one'},{id:'two'}]);connectStory(p,nodes,'character:b','scene:1');connectStory(p,nodes,'character:b','scene:1');assert.deepEqual(p.scenes[0].characterIds,['a','b']);connectStory(p,nodes,'location:two','scene:1');assert.deepEqual(p.scenes[0].additionalLocationIds,['two']);connectStory(p,nodes,'scene:1','scene:2');assert.equal(p.scenes[0].choices[0].target,2);assert.equal(p.scenes.length,2);});
test('disconnecting only removes the selected relationship',()=>{const p=make(),{nodes}=buildGraph(p,[{id:'a'},{id:'b'}],[{id:'one'},{id:'two'}]);connectStory(p,nodes,'character:b','scene:1');disconnectStory(p,nodes,{source:'character:b',target:'scene:1'},[]);assert.deepEqual(p.scenes[0].characterIds,['a']);assert.equal(p.scenes[0].locationId,'one');});
test('generation nodes cannot link assets to a different scene',()=>{const p=make();const nodes=[{id:'image:1',data:{kind:'image',entityId:1}},{id:'video:2',data:{kind:'video',entityId:2}}];assert.throws(()=>connectStory(p,nodes,'image:1','video:2'),/same scene/);});
test('story order and branches reconstruct deterministically after serialization',()=>{const p=make(),graph=buildGraph(p,[{id:'a'}],[{id:'one'}]);connectStory(p,graph.nodes,'scene:1','scene:2');const restored=JSON.parse(JSON.stringify(p)),next=buildGraph(restored,[{id:'a'}],[{id:'one'}]);assert.ok(next.edges.some(e=>e.source==='scene:1'&&e.target==='scene:2'));assert.equal(next.nodes.filter(n=>n.data.kind==='character').length,1);});
test('imported themes and scene imagery become functional canvas records',()=>{
 const project={id:'pdf',characterIds:[],locationIds:[],themes:[{id:'identity',name:'Identity',sceneIds:[]}],scenes:[{id:1,title:'Arrival',characterIds:[],locationId:'',choices:[],approvedImageId:'image-1'}]};
 const graph=buildGraph(project,[],[]);
 assert.ok(graph.nodes.some(n=>n.data.kind==='theme'));
 assert.ok(graph.nodes.some(n=>n.id==='image:1'));
 assert.ok(graph.edges.some(e=>e.source==='scene:1'&&e.target==='prompt:1'));
 connectStory(project,graph.nodes,'theme:identity','scene:1');assert.deepEqual(project.themes[0].sceneIds,[1]);
 disconnectStory(project,graph.nodes,{source:'theme:identity',target:'scene:1'},[]);assert.deepEqual(project.themes[0].sceneIds,[]);
});
