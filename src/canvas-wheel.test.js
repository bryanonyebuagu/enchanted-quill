import test from 'node:test';
import assert from 'node:assert/strict';
import {panViewport} from './canvas-wheel.js';
const start={x:100,y:200,zoom:.7};
test('horizontal and diagonal trackpad input pans without changing zoom',()=>{
 assert.deepEqual(panViewport(start,{deltaX:40,deltaY:0,deltaMode:0}),{x:60,y:200,zoom:.7});
 assert.deepEqual(panViewport(start,{deltaX:-15,deltaY:30,deltaMode:0}),{x:115,y:170,zoom:.7});
 assert.deepEqual(start,{x:100,y:200,zoom:.7});
});
test('line, page and Shift-wheel input retain their intended direction',()=>{
 assert.deepEqual(panViewport(start,{deltaX:2,deltaY:-3,deltaMode:1}),{x:60,y:260,zoom:.7});
 assert.deepEqual(panViewport(start,{deltaX:1,deltaY:0,deltaMode:2},500,400),{x:-400,y:200,zoom:.7});
 assert.deepEqual(panViewport(start,{deltaX:0,deltaY:25,deltaMode:0,shiftKey:true}),{x:75,y:200,zoom:.7});
});
