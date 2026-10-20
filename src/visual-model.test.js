import test from 'node:test';
import assert from 'node:assert/strict';
import {wordCount,validateScene,minimumMessage,composePrompts,approvedSceneAsset,referencePrompt,allocateSceneId} from './visual-model.js';
const cast=[{id:'a',name:'Ari',description:'Tall, copper curls, dark eyes, blue coat'}];
const places=[{id:'library',name:'North Library',description:'Three oak arches and a glass ceiling'}];
const scene={id:1,text:'word '.repeat(100),characterIds:['a'],locationId:'library'};
test('deleted scene IDs never get reused, including retained media',()=>{
 const p={id:'one',scenes:[{id:1}]};
 assert.equal(allocateSceneId(p,[{type:'scene',storyId:'one',ownerId:8}]),9);
 assert.equal(allocateSceneId(p),10);
});
test('100 words validates the actual description, never the generated prompt',()=>{
 assert.equal(wordCount(' \n one\t two  '),2);
 assert.equal(validateScene({...scene,text:'word '.repeat(99),promptOverrides:{image:'word '.repeat(1000)}}),minimumMessage);
 assert.equal(validateScene(scene),'');
 assert.equal(validateScene({...scene,characterIds:[]}),'Select at least one saved character.');
 assert.equal(validateScene({...scene,locationId:''}),'Select or create a saved location.');
});
test('shared setting preserves identity while each moment and camera are distinct',()=>{
 const a=composePrompts({...scene,text:'Ari enters the library.',camera:'Wide'},cast,places,null);
 const b=composePrompts({...scene,text:'Ari discovers a hidden book.',camera:'Close-up'},cast,places,{title:'Entry',text:'Ari enters.'});
 assert.notEqual(a.image,b.image);assert.match(a.image,/enters the library/);assert.match(b.image,/hidden book/);
 assert.match(a.image,/North Library/);assert.match(b.image,/North Library/);assert.match(b.image,/copper curls/);assert.match(b.image,/Camera: Close-up/);
 assert.match(b.imageToVideo,/exact initial frame/);assert.notEqual(b.imageToVideo,b.textToVideo);
});
test('approved image resolves only within the same story AND scene; references cannot leak into scenes',()=>{
 const assets=[{id:'v1',type:'scene',storyId:'one',ownerId:1},{id:'v2',type:'scene',storyId:'two',ownerId:1},{id:'ref',type:'location',ownerId:'library'}];
 assert.equal(approvedSceneAsset({...scene,approvedImageId:'v1'},'one',assets).id,'v1');
 assert.equal(approvedSceneAsset({...scene,approvedImageId:'v2'},'one',assets),null);
 assert.equal(approvedSceneAsset({...scene,id:2,approvedImageId:'v1'},'one',assets),null);
 assert.equal(approvedSceneAsset({...scene,approvedImageId:'ref'},'one',assets),null);
 assert.equal(approvedSceneAsset(scene,'one',assets),null);
});
test('references and saved prompts remain immutable while composing another scene',()=>{
 const refs=[{id:'a-ref-v3',ownerId:'a',type:'character',approved:true},{id:'l-ref-v2',ownerId:'library',type:'location',approved:true}];
 const before=JSON.stringify({scene,refs});const p=composePrompts(scene,cast,places,null,refs);
 assert.match(p.image,/a-ref-v3/);assert.match(p.image,/l-ref-v2/);assert.equal(JSON.stringify({scene,refs}),before);
 assert.match(referencePrompt(cast[0],'character'),/facial close-ups/);assert.match(referencePrompt(cast[0],'character'),/expressions/);
 assert.match(referencePrompt(places[0],'location'),/location ID library/);
});
