<script>
 import {Handle,Position} from '@xyflow/svelte';
 import {Users,MapPin,Clapperboard,Sparkles,Image,Film,ArrowUpRight} from 'lucide-svelte';
 let {data,selected}=$props();
 const icons={character:Users,location:MapPin,scene:Clapperboard,prompt:Sparkles,image:Image,video:Film};
 let Icon=$derived(icons[data.kind]);
</script>
<div class="story-node" class:selected>
 <Handle type="target" position={Position.Left}/>
 <div class="node-type"><Icon size={13}/><span>{data.kind==='prompt'?'AI Prompt':data.kind}</span>{#if data.mock}<b>DEMO</b>{/if}</div>
 {#if data.image}<img class="node-image" src={data.image} alt={data.title}/>{:else if ['image','video','location'].includes(data.kind)}<div class="node-empty"><Icon size={25}/><span>{data.kind==='location'?'Reference needed':'No approved output'}</span></div>{/if}
 <div class="node-copy"><h3>{data.title}</h3><p>{data.description||'Open to develop this part of the story.'}</p>{#if data.meta}<small>{data.meta}</small>{/if}<button class="nodrag nopan" onclick={data.open}>Inspect & edit <ArrowUpRight size={12}/></button></div>
 <Handle type="source" position={Position.Right}/>
</div>
