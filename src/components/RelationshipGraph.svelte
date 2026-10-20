<script>
 import { createEventDispatcher } from 'svelte';
 export let compact=false;
 const dispatch=createEventDispatcher();
 let active='elara';
 const nodes=[{id:'elara',name:'Elara Voss',x:238,y:140,color:'#b8a5e0',image:'/images/elara.png'},{id:'rowan',name:'Rowan Ashford',x:89,y:70,color:'#92b5a9',image:'/images/rowan.png'},{id:'maeve',name:'Maeve Thorne',x:389,y:70,color:'#c6a575',image:'/images/maeve.png'},{id:'castle',name:'Ashford Castle',x:102,y:234,color:'#8f9fae',image:'/images/castle.jpg'},{id:'letter',name:'The invitation',x:374,y:234,color:'#a9b68c'}];
</script>
<div class="graph" class:compact>
 <svg viewBox="0 0 480 300" role="img" aria-label="Sample relationships between characters and story elements">
  <defs>{#each nodes.filter(n=>n.image) as n}<pattern id={`portrait-${compact?'mini':'full'}-${n.id}`} width="1" height="1" patternContentUnits="objectBoundingBox"><image href={n.image} width="1" height="1" preserveAspectRatio="xMidYMid slice"/></pattern>{/each}</defs>
  {#each nodes.filter(n=>n.id!=='elara') as n}<path d={`M238 140 Q${(238+n.x)/2} ${n.y>140?140:n.y} ${n.x} ${n.y}`} stroke={active===n.id||active==='elara'?n.color+'70':'#ffffff12'} stroke-width="1" fill="none"/><circle cx={(238+n.x)/2} cy={(140+n.y)/2-8} r="2" fill={n.color}/>{/each}
  <text x="145" y="82">guides</text><text x="321" y="82">mentors</text><text x="137" y="195">belongs to</text><text x="309" y="193">chosen by</text>
  {#each nodes as n}<g role="button" tabindex="0" aria-label={`Inspect ${n.name}`} class:active={active===n.id} onclick={()=>{active=n.id;dispatch('select',n.id);}} onkeydown={(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();active=n.id;dispatch('select',n.id);}}}><circle cx={n.x} cy={n.y} r={n.id==='elara'?30:23} fill="#1c2024" stroke={n.color} stroke-opacity={active===n.id?'1':'.4'} stroke-width={active===n.id?'2':'1'}/>{#if n.image}<circle cx={n.x} cy={n.y} r={n.id==='elara'?26:19} fill={`url(#portrait-${compact?'mini':'full'}-${n.id})`}/>{:else}<text class="symbol" x={n.x} y={n.y+5}>✦</text>{/if}<text class="name" x={n.x} y={n.y+(n.id==='elara'?47:39)}>{n.name}</text></g>{/each}
 </svg>
</div>
<style>.graph{width:100%;min-width:0;background-image:radial-gradient(#ffffff0e 1px,transparent 1px);background-size:20px 20px;border-radius:8px}.graph svg{display:block;width:100%;max-height:530px}text{font-family:inherit;font-size:12px;fill:#606570;text-anchor:middle}.name{font-size:14px;fill:#b9bec5}.symbol{font-size:15px;fill:#b1bc95}g{cursor:pointer;outline:none}g circle{transition:stroke .2s,stroke-opacity .2s}g:hover .name,g:focus .name{fill:#e8e6f0}g:focus circle{stroke:#fff;stroke-width:2}.active .name{fill:#e4dcf4}.compact{max-height:220px;overflow:hidden}.compact svg{margin-top:-10px}</style>
