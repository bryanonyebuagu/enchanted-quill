<script>
 export let data=[];
 export let labels=[];
 let hovered=null;
 $: max=Math.max(1,...data);
 $: points=data.map((v,i)=>[16+i*468/Math.max(1,data.length-1),132-v/max*104]);
 $: line=points.map(p=>p.join(',')).join(' ');
</script>
<div class="chart-wrap">
 <svg viewBox="0 0 500 160" role="img" aria-label="Words written per scene">
  <defs><linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#ac9bdd" stop-opacity=".24"/><stop offset="1" stop-color="#ac9bdd" stop-opacity="0"/></linearGradient></defs>
  {#each [28,80,132] as y}<line x1="16" x2="484" y1={y} y2={y} stroke="#ffffff0a"/>{/each}
  {#if points.length}<polygon points={`16,140 ${line} 484,140`} fill="url(#chart-fill)"/><polyline points={line} fill="none" stroke="#ad9bd9" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>{/if}
  {#each points as p,i}<g><circle role="img" aria-label={`${data[i]} words`} cx={p[0]} cy={p[1]} r="13" fill="transparent" onmouseenter={()=>hovered=i} onmouseleave={()=>hovered=null}/><circle cx={p[0]} cy={p[1]} r={hovered===i?5:3} fill="#bbaae4" stroke="#26242d" stroke-width="2"/>{#if hovered===i}<rect x={Math.max(4,Math.min(410,p[0]-40))} y={Math.max(2,p[1]-33)} width="85" height="23" rx="5" fill="#39333f"/><text x={Math.max(46,Math.min(452,p[0]+2))} y={Math.max(17,p[1]-18)} text-anchor="middle" fill="#e7e3f2" font-size="9">{data[i]} words</text>{/if}</g>{/each}
 </svg>
 <div class="chart-labels">{#each labels as label,i}<button class:active={hovered===i} onfocus={()=>hovered=i} onblur={()=>hovered=null} onmouseenter={()=>hovered=i} onmouseleave={()=>hovered=null} aria-label={`${label}: ${data[i]} words`}>{label}</button>{/each}</div>
</div>
<style>.chart-wrap{width:100%;min-width:0}svg{display:block;width:100%;overflow:visible}.chart-labels{display:flex;justify-content:space-between;padding:0 8px;gap:4px}.chart-labels button{font:inherit;font-size:9px;background:transparent;border:0;color:#6f727b;padding:5px 2px;border-radius:3px;cursor:default}.chart-labels .active{color:#c5b6e6}g circle{transition:r .15s}</style>
