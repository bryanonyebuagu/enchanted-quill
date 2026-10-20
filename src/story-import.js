// Source-based draft extraction. Every suggestion remains editable.
const count=t=>String(t||'').trim().split(/\s+/u).filter(Boolean).length;
const clean=t=>t.replace(/\s+/g,' ').trim();
const heading=/^(?:(?:SCENE|CHAPTER|ACT)\s+(?:\d+|[IVX]+)\b.*|(?:INT\.|EXT\.|INT\/EXT\.)\s+.+|#{1,3}\s+.+)$/i;
const feelings=[['Fear','afraid|fearful|terrified|frightened'],['Anger','angry|furious|rage'],['Grief','grief|grieving|wept|crying'],['Joy','joyful|delighted|happy|laughed'],['Hope','hopeful|hope'],['Anxiety','anxious|nervous|worried|uneasy'],['Determination','determined|resolute']];
export function inspectStory(d){
 const gaps=[],add=(type,id,label,detail)=>gaps.push({type,id,label,detail});
 for(const c of d.characters){for(const key of ['description','appearance','personality','clothing'])if(!c[key]?.trim())add('character',c.id,key+' missing',c.name);if(!c.image&&!c.referenceReady&&!c.importFile)add('character',c.id,'Character visual missing',c.name);}
 for(const l of d.locations){if(!l.description?.trim())add('location',l.id,'Environment description missing',l.name);if(!l.image&&!l.importFile)add('location',l.id,'Location visual missing',l.name);}
 for(const s of d.scenes){if(count(s.text)<100)add('scene',s.id,'Scene needs 100 words',s.title);if(!s.characterIds?.length)add('scene',s.id,'No character connected',s.title);if(!s.locationId)add('scene',s.id,'No location connected',s.title);if(!s.emotions?.trim())add('scene',s.id,'Emotion not stated',s.title);if(!s.actions?.trim())add('scene',s.id,'Action not stated',s.title);if(!s.image&&!s.approvedImageId&&!s.importFile)add('scene',s.id,'Scene image missing',s.title);}
 if(!d.characters.length)add('story','','Characters not identified','Add the cast or identify their names.');
 if(!d.locations.length)add('story','','Locations not identified','Add the settings or identify their names.');
 if(!d.themes?.length)add('story','','Themes need review','Add the ideas this story explores.');
 return gaps;
}
export function analyzeStoryText(source,title='Imported story'){
 const text=String(source||'').replace(/\r\n?/g,'\n'),lines=text.split('\n'),starts=lines.map((s,i)=>heading.test(s.trim())?i:-1).filter(i=>i>=0);
 let chunks=starts.map((start,i)=>({title:lines[start].trim().replace(/^#+\s*/,''),text:lines.slice(start+1,starts[i+1]??lines.length).join('\n').trim(),heading:lines[start].trim()}));
 if(!chunks.length){let block='';for(const p of text.split(/\n\s*\n/u).filter(s=>s.trim())){if(block&&count(block)+count(p)>350){chunks.push({title:'Moment '+(chunks.length+1),text:block.trim(),heading:''});block='';}block+=p+'\n\n';}if(block.trim())chunks.push({title:'Moment '+(chunks.length+1),text:block.trim(),heading:''});}
 const characters=[],locations=[],themes=[];
 const quote=name=>text.split(/(?<=[.!?])\s+|\n/u).find(s=>s.toLowerCase().includes(name.toLowerCase()))||'';
 const add=(list,kind,name,description='',explicit=false)=>{name=clean(name).replace(/[.:]$/,'');if(!name||name.length>80||list.some(x=>x.name.toLowerCase()===name.toLowerCase()))return;list.push({id:'draft-'+kind+'-'+(list.length+1),name,description,appearance:'',personality:'',clothing:'',evidence:description||quote(name),confidence:explicit?'Explicit in source':'Suggested; review',selected:true});};
 for(const line of lines){const m=line.match(/^\s*(CHARACTER|CAST MEMBER|LOCATION|SETTING|THEME)\s*:\s*(.+?)(?:(?:\s*[:–—]\s*|\s+-\s+)(.*))?$/i);if(m){const kind=/CHARACTER|CAST MEMBER/i.test(m[1])?'character':/LOCATION|SETTING/i.test(m[1])?'location':'theme';add(kind==='character'?characters:kind==='location'?locations:themes,kind,m[2],m[3]||'',true);}}
 for(const line of lines){const n=line.trim();if(/^[A-Z][A-Z '\-]{2,40}$/.test(n)&&!/^(?:SCENE|CHAPTER|ACT|THE END|FADE|CUT|INT|EXT|CHARACTERS|LOCATIONS|THEMES|DAY|NIGHT)\b/.test(n))add(characters,'character',n.toLowerCase().replace(/\b\w/g,c=>c.toUpperCase()));}
 if(!characters.length){const names=new Map();for(const m of text.matchAll(/\b[A-Z][a-z]{1,20}\s+[A-Z][a-z]{1,20}\b/g))if(!/^(The|A|An|Scene|Chapter|Act|When|After|Before)\b/.test(m[0]))names.set(m[0],(names.get(m[0])||0)+1);for(const [name,n]of names)if(n>1)add(characters,'character',name);}
 for(const c of chunks){const m=c.heading.match(/^(?:INT\.|EXT\.|INT\/EXT\.)\s+(.+)$/i);if(m)add(locations,'location',m[1].replace(/\s+[-–—]\s*(DAY|NIGHT|DAWN|DUSK|LATER|CONTINUOUS).*$/i,''));}
 const scenes=chunks.map((c,i)=>{const matches=feelings.filter(([,p])=>new RegExp('\\b(?:'+p+')\\b','i').test(c.text)),location=locations.find(l=>(c.heading+' '+c.text).toLowerCase().includes(l.name.toLowerCase()));return{id:i+1,title:c.title,text:c.text,characterIds:characters.filter(a=>c.text.toLowerCase().includes(a.name.toLowerCase())).map(a=>a.id),locationId:location?.id||'',additionalLocationIds:[],emotions:matches.map(([n])=>n).join(', '),emotionEvidence:matches.map(([emotion,p])=>({emotion,quote:c.text.split(/(?<=[.!?])\s+/u).find(s=>new RegExp('\\b(?:'+p+')\\b','i').test(s))||''})),actions:c.text.split(/(?<=[.!?])\s+/u).slice(0,2).join(' '),dialogue:[...c.text.matchAll(/[“"]([^”"\n]{2,500})[”"]/g)].map(m=>m[1]).join('\n'),choices:i<chunks.length-1?[{label:'Continue',target:i+2}]:[],status:'Draft',selected:true};});
 return{title,characters,locations,themes,scenes,sourceText:text,method:'Local source extraction; review required'};
}
