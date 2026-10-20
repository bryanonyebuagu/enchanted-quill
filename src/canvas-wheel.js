// Keep pixel, line, page, and Shift-wheel gestures consistent on both axes.
export function panViewport(viewport,event,width=800,height=600){
 const line=event.deltaMode===1?20:1;
 let dx=event.deltaX*(event.deltaMode===2?width:line);
 let dy=event.deltaY*(event.deltaMode===2?height:line);
 if(event.shiftKey&&!dx){dx=dy;dy=0;}
 return {...viewport,x:viewport.x-dx,y:viewport.y-dy};
}
