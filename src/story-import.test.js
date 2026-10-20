import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzeStoryText,inspectStory} from './story-import.js';
const source='CHARACTER: Mara Vel - a courier.\nLOCATION: Rooftop - an antenna in the rain.\nTHEME: Identity\nSCENE 1: Arrival\nMara Vel was afraid on the Rooftop. "Keep the recorder safe."\nSCENE 2: Dawn\nMara Vel felt hopeful in an unnamed chamber.';
test('extracts explicit records, dialogue, emotions and ordered moments',()=>{
 const d=analyzeStoryText(source,'Test');assert.equal(d.characters[0].name,'Mara Vel');assert.equal(d.characters[0].description,'a courier.');assert.equal(d.locations[0].name,'Rooftop');assert.equal(d.themes[0].name,'Identity');assert.equal(d.scenes.length,2);assert.deepEqual(d.scenes[0].characterIds,[d.characters[0].id]);assert.equal(d.scenes[0].locationId,d.locations[0].id);assert.equal(d.scenes[1].locationId,'');assert.equal(d.scenes[0].emotions,'Fear');assert.match(d.scenes[0].emotionEvidence[0].quote,/afraid/);assert.match(d.scenes[0].dialogue,/recorder/);assert.equal(d.scenes[0].choices[0].target,2);assert.equal(d.sourceText,source);
});
test('does not invent a cast, setting, visual reference or emotion',()=>{
 const d=analyzeStoryText('A small light moved across a wall.\n\nNothing else was known.');assert.equal(d.characters.length,0);assert.equal(d.locations.length,0);assert.equal(d.scenes[0].emotions,'');assert.ok(inspectStory(d).some(g=>g.label==='Characters not identified'));assert.ok(inspectStory(d).some(g=>g.label==='Scene image missing'));
});
test('screenplay headings identify places and uppercase cues identify people',()=>{
 const d=analyzeStoryText('INT. HARBOR WORKSHOP - NIGHT\nNIMA OSS\nThe engine is broken.\nEXT. SEA WALL - DAWN\nNIMA OSS\nNima Oss watches the tide.');assert.equal(d.scenes.length,2);assert.deepEqual(d.locations.map(l=>l.name),['HARBOR WORKSHOP','SEA WALL']);assert.deepEqual(d.characters.map(c=>c.name),['Nima Oss']);assert.equal(d.scenes[1].locationId,d.locations[1].id);
});
test('readiness updates after missing details are supplied',()=>{
 const d=analyzeStoryText(source);const c=d.characters[0];Object.assign(c,{appearance:'dark curls',personality:'patient',clothing:'coat',image:'reference.jpg'});d.locations[0].image='roof.jpg';for(const s of d.scenes){s.text=Array(100).fill('word').join(' ');s.locationId=d.locations[0].id;s.approvedImageId='scene-'+s.id;}assert.equal(inspectStory(d).length,0);
});
