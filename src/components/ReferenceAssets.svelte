<script>
 import { Upload, ShieldCheck, Copy, Image, Sparkles } from 'lucide-svelte';
 import GenerationStudio from './GenerationStudio.svelte';
 import { apiRequest } from '../generation-client.js';
 import { referencePrompt, scopedAssets } from '../visual-model.js';
 import { importImage, approveReference } from '../visual-store.js';
 let {entity,type,assets=[],onassetschange,notify,storyId='reference-library'}=$props();
 let error=$state(''),busy=$state(false),show=$state(false),coverageConfirmed=$state(false),generationOpen=$state(false);
 let versions=$derived(scopedAssets(assets,type,entity.id));
 let approved=$derived(versions.find(a=>a.approved));
 let prompt=$derived(referencePrompt(entity,type));
 async function upload(e){const f=e.currentTarget.files?.[0];if(!f)return;if(type==='character'&&!coverageConfirmed){error='Confirm that this sheet contains full-body views, facial close-ups and expressions.';e.target.value='';return;}busy=true;error='';try{await importImage(f,{type,ownerId:entity.id,prompt,coverage:type==='character'?['full-body','facial-closeups','expressions']:['environment']});await onassetschange();notify('Reference version saved. Approve it to use it in scenes.');}catch(err){error=err.message;}finally{busy=false;e.target.value='';}}
 async function approve(id){try{if(versions.find(v=>v.id===id)?.bundled){notify('This bundled reference is already approved. Import a new version to replace it.');return;}if(versions.find(v=>v.id===id)?.blob)await approveReference(id);else await apiRequest('/assets/'+id+'/approve',{method:'POST',body:'{}'});await onassetschange();notify('Reference approved. Existing scene images are unchanged.');}catch(err){error=err.message;}}
 async function copy(){try{await navigator.clipboard.writeText(prompt);notify('Reference prompt copied');}catch{error='Select the prompt text to copy it.';}}
</script>
<div class="reference-assets">
 <div class="reference-status"><ShieldCheck size={14}/><strong>{type==='character'?'Character identity':'Location environment'}</strong><small>{approved?approved.coverage?.includes('portrait-or-sheet-unverified')?'Imported portrait / unverified sheet':'Approved reference':entity.referenceReady?'Bundled body and portrait references':'Reference needed'}</small></div>
 {#if approved}<img class="saved-reference-preview" src={approved.url} alt={`${entity.name} approved ${type} reference`}/>{:else if type==='location'}<div class="location-reference-empty"><Image size={28}/><strong>{entity.name}</strong><span>Unique location reference pending</span><small>No unrelated location image assigned</small></div>{/if}
 {#if type==='character'}<p class="reference-help">Full-body views, facial close-ups and expressions in one sheet. {entity.referenceReady?'Existing body turnarounds and portraits are preserved; upload a complete expression sheet to extend them.':'Create a unique identity before producing scenes.'}</p>{/if}
 {#if type==='character'}<label class="reference-coverage"><input type="checkbox" bind:checked={coverageConfirmed}/> This sheet includes full-body views, facial close-ups and expressions.</label>{/if}<div class="reference-actions"><label class="button secondary upload-control"><Upload size={14}/>{busy?'Saving…':'Add reference version'}<input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} onchange={upload}/></label><button class="text-button" onclick={()=>show=!show}><Sparkles size={14}/> Reference prompt</button></div>
 {#if show}<div class="reference-prompt"><p>{prompt}</p><button class="button secondary" onclick={copy}><Copy size={13}/> Copy prompt</button><p>Generate with your chosen provider, then import and approve the result. No provider is connected in this workspace.</p></div>{/if}
 {#if error}<p role="alert" class="director-error">{error}</p>{/if}
 <button class="button primary" onclick={()=>generationOpen=!generationOpen}><Sparkles size={14}/> Generate {type==='character'?'reference sheet':'location reference'}</button>{#if generationOpen}<GenerationStudio {storyId} kind={type} entityId={entity.id} title={entity.name} {prompt} {assets} {onassetschange} {notify}/>{/if}
 {#if versions.length}<details class="reference-history"><summary>{versions.length} saved reference versions</summary>{#each versions.toReversed() as v}<div><img src={v.url} alt={`${entity.name} reference version`}/><span>{new Date(v.createdAt).toLocaleDateString()}<small>{v.id.slice(0,8)}</small></span><button class="button secondary" onclick={()=>approve(v.id)}>{v.approved?'Approved':'Approve'}</button></div>{/each}</details>{/if}
</div>
