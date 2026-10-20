# Enchanted Quill

A Svelte 5 story intelligence workspace with a node-based storytelling canvas, scene direction, and a Higgsfield-ready generation architecture. The design uses Inter, Space Grotesk, white/black surfaces and lemon (#DFFF00).

## Development

- `npm install --legacy-peer-deps`
- Initialize a fresh local database once: `node node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config wrangler.jsonc --file drizzle/0000_generation.sql`
- `npm run dev`
- `npm run build`
- `node --test server/api.test.js src/visual-model.test.js src/canvas-model.test.js`

Vite produces `dist/client` and `dist/server/index.js`. The Sites hosting manifest provisions D1 and R2. Hosted identity is supplied by Sites; preview identity is confined to development builds.

## Workspace

- Six complete branching story editions, 60 authored scenes, 24 character dossiers, 19 locations and 12 detailed prompt templates, alongside the original starter project.
- Svelte Flow canvas with character, location, scene, prompt, image and video node types; pan, zoom, arrangement, fit view, undo/redo and functional connections.
- Reusable entity profiles, multiple characters and locations per scene, reference-version bindings, branching reader choices, scene navigator and responsive properties panels.
- Manual story creation and a clearly labeled local draft-breakdown parser. No language-model story analyzer is connected.
- Scene Director creates three editable structured prompts from the actual story moment, saved profiles, reference IDs, camera choices and continuity. Prompt composition is local, not a claim of AI inference.
- Finalized scenes require 100 words; incomplete drafts remain editable and autosaved.
- Scene image versions, approval pointers, source-image selection for video, downloadable outputs, and uploaded-video playback.
- Local autosave preserves existing drafts and canvas state. Cloud snapshots preserve linked records; cloud autosave follows an initial snapshot. Stale revisions cannot overwrite newer cloud data. Reopening a cloud project preserves a restorable local backup.

## Generation status

**No paid generation or payments are active.** Mock jobs, persistent history, preview credits, cancellation, failure/recovery controls, subscriptions UI and administrator provider status are implemented. All mock images and motion placeholders are labeled as demonstrations, not AI output. Mock motion previews are not rendered videos.

Live Higgsfield has not been tested against a funded account. API credentials remain server-side. Activation requires account/model verification, verified billing rules and output hosts, and explicit environment gates. See [GENERATION.md](GENERATION.md) for official documentation, configuration and activation steps.

## Asset consistency

Character identity, location environment and narrative scene assets are distinct types. Generic setting photos are no longer presented as scene renders, and unrelated locations no longer share fallback imagery. Uncreated references are explicitly marked pending. Existing original portraits and turnarounds are retained; new full identity sheets can be generated later or imported and approved now. Generated and imported scene versions remain linked to their story and scene IDs.

## Stack

Svelte 5, Svelte Flow (@xyflow/svelte), Vite, Lucide, Cloudflare Workers/D1/R2, and the retained Sites build integration. No React runtime or separate animation framework is required.
