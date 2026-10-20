export const wordCount = text => String(text || '').trim().split(/\s+/u).filter(Boolean).length;
export const minimumMessage = 'Not enough words to create a new scene. Please write at least 100 words.';
export function allocateSceneId(project, assets = []) {
  const retained=assets.filter(a=>a.type==='scene'&&a.storyId===project.id&&Number.isSafeInteger(a.ownerId)).map(a=>a.ownerId+1);
  const id=Math.max(project.nextSceneId||1,...project.scenes.map(s=>s.id+1),...retained);
  project.nextSceneId=id+1;
  return id;
}
export function validateScene(scene) {
  if (wordCount(scene.text) < 100) return minimumMessage;
  if (!scene.characterIds?.length) return 'Select at least one saved character.';
  if (!scene.locationId) return 'Select or create a saved location.';
  return '';
}
export function scopedAssets(assets, type, ownerId, storyId) {
  return assets.filter(a => a.type === type && a.ownerId === ownerId && (!storyId || a.storyId === storyId));
}
export function approvedSceneAsset(scene, storyId, assets) {
  return scopedAssets(assets, 'scene', scene.id, storyId).find(a => a.id === scene.approvedImageId) || null;
}
export function referencePrompt(entity, type) {
  if (type === 'character') return `Create ONE identity reference sheet for ${entity.name}. ${entity.prompt || entity.description}. Appearance: ${entity.appearance||'Follow the saved visual brief'}. Clothing: ${entity.clothing||'Futuristic fantasy tailoring'}. Personality: ${entity.personality||entity.archetype||'Naturalistic expression'}. Unique identity: ${entity.id}. Full-body front, left profile, right three-quarter and back views, facial close-ups and neutral, joyful, fearful, angry and sorrowful expressions, arranged in one image. Same anatomy, age, face, skin tone, hair and costume in every view. Hyper-realistic skin pores and natural imperfections; futuristic fantasy clothing with believable tailoring and materials. Neutral studio lighting, full feet visible, no cropped limbs, no celebrity resemblance. This is an identity asset, not a story scene.`;
  return `Create a unique environment reference for ${entity.name}, location ID ${entity.id}. ${entity.description}. Atmosphere: ${entity.atmosphere || ''}. ${entity.detail || ''}. Establish distinctive architecture, geography, scale, materials, entrances, landmarks and a coherent lighting palette. Cinematic photorealism. Empty establishing composition, no text or watermark. This is a saved location reference, not a character portrait or a narrative scene. Do not substitute another location's design.`;
}
export function composePrompts(scene, characters, locations, previous, references = []) {
  const cast = characters.filter(c => scene.characterIds?.includes(c.id));
  const place = locations.find(l => l.id === scene.locationId);
  const extraPlaces=locations.filter(l=>scene.additionalLocationIds?.includes(l.id));
  const identities = cast.map(c => {
    const binding=scene.referenceBindings?.['character:'+c.id];
    const refs = references.filter(r => r.type === 'character' && r.ownerId === c.id && (binding?r.id===binding:r.approved));
    return `${c.name} [${c.id}]: ${c.description}. Saved appearance: ${c.appearance||'use reference'}. Clothing: ${c.clothing||'use reference'}. Personality: ${c.personality||c.archetype||''}. APPEARANCE NOTES ONLY (ignore reference framing and pose): ${c.prompt || ''}. Identity assets: ${refs.map(r=>r.id).join(', ') || (c.referenceReady ? `bundled ${c.id} portrait and turnaround` : 'MISSING: establish a reference before production')}.`;
  }).join('\n');
  const locationRefs = references.filter(r=>r.type==='location' && [place?.id,...extraPlaces.map(l=>l.id)].includes(r.ownerId) && (scene.referenceBindings?.['location:'+r.ownerId]?r.id===scene.referenceBindings['location:'+r.ownerId]:r.approved));
  const context = `STORY MOMENT\n${scene.text || '[Describe this moment in at least 100 words]'}\n\nCAST AND IDENTITY\n${identities || '[Select saved characters]'}\n\nENVIRONMENT\n${place ? `${place.name} [${place.id}]. ${place.description}. ${place.atmosphere || ''}. Reference: ${locationRefs.map(r=>r.id).join(', ') || 'not yet supplied'}.` : '[Select a saved location]'}${extraPlaces.map(l=>'\nAdditional setting '+l.name+' ['+l.id+']: '+l.description).join('')}\n\nDIRECTION\nActions: ${scene.actions || 'Follow the actions in the scene description.'}\nDialogue: ${scene.dialogue || 'No added dialogue.'}\nExpressions: ${scene.emotions || 'Derive from the described moment; do not invent a different intention.'}\nCamera: ${scene.camera || 'Eye-level medium wide shot'}, ${scene.lens || '35mm'}, ${scene.cameraMove || 'slow dolly in'}.\nAtmosphere: ${scene.atmosphere || 'Naturalistic cinematic lighting, grounded futuristic fantasy.'}\n\nCONTINUITY\n${scene.continuity || (previous ? `Previous scene: ${previous.title}. ${previous.text.slice(-1100)}` : 'Opening scene. Establish continuity without inventing prior events.')}\nMaintain approved faces, proportions, costume, props and location landmarks. References establish identity and environment; compose a NEW image of this specific action. Never return a reference sheet or generic establishing image as the scene.`;
  return {
    image: `CINEMATIC SCENE IMAGE\n${context}\n\nCapture one precise, filmable instant of the described action. Deliberate blocking, motivated light, physically credible contact and eyelines, realistic human skin and fabric. Change composition to match this moment, even when revisiting the same location. No collage, reference-sheet layout, captions, subtitles or watermark.`,
    imageToVideo: `IMAGE-TO-VIDEO MOTION BRIEF\nUse the selected scene image as the exact initial frame. Preserve its composition at time zero and all identities, wardrobe, architecture and lighting.\n${context}\n\nAnimate only the described actions and expressions with natural weight, subtle breathing, coherent hands and eye movement. Camera movement: ${scene.cameraMove || 'slow dolly in'}. Environmental motion must fit the atmosphere. One continuous shot with the duration selected in Generation Studio; no cuts, morphing, added characters, invented actions or scene change. Speech only if the director explicitly requests it.`,
    textToVideo: `TEXT-TO-VIDEO CINEMATIC BRIEF\n${context}\n\nCreate one continuous cinematic shot with the duration selected in Generation Studio. Establish the selected composition, progress through the described action, then settle on its emotional result. Camera movement: ${scene.cameraMove || 'slow dolly in'}. Consistent faces, anatomy, costume, location geometry and light throughout. No montage, reference-sheet composition, captions or watermark.`
  };
}
