# Enchanted Quill

Enchanted Quill is a visual storytelling studio for writers, filmmakers, and creative teams. Develop a story from its first idea to its final outcome, organize recurring characters and locations, and connect every moment on an interactive branching storyboard.

A cinematic castle backdrop, spacious typography, white and black surfaces, and vibrant lemon accents frame the workspace. The sun and moon control in the navbar switches between light and dark mode and remembers your preference.

## Development

- `npm install --legacy-peer-deps`
- Initialize a fresh local database once: `node node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config wrangler.jsonc --file drizzle/0000_generation.sql`
- `npm run dev`
- `npm run build`
- `node --test server/api.test.js src/visual-model.test.js src/canvas-model.test.js`

Vite produces `dist/client` and `dist/server/index.js`. The application uses Cloudflare D1 and R2 for durable records and asset storage. Hosted identity is supplied by the deployment platform; preview identity is confined to development builds.

## Workspace

- Six complete branching story editions, 60 authored scenes, 24 character dossiers, 19 locations and 12 detailed prompt templates, alongside the original starter project.
- Canvas controls: mouse wheel and two-finger trackpad gestures pan; hold Ctrl while scrolling to zoom. Pinch-to-zoom and the on-screen zoom controls remain available.
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

Svelte 5, Svelte Flow (@xyflow/svelte), Vite, Lucide, Cloudflare Workers/D1/R2,. No React runtime or separate animation framework is required.

## Project structure

```text
build/                Hosting build integration
drizzle/              Database schema and migration metadata
public/images/        Backgrounds, portraits, and reference sheets
server/               Worker routes, storage, jobs, credits, provider adapter, and tests
src/components/       Canvas, scene direction, asset libraries, and studio panels
src/                  Svelte application, story content, styles, data models, and tests
.env.example          Environment variable template without credentials
GENERATION.md         Provider configuration and activation guide
package.json          Dependencies and development scripts
vite.config.js        Application and Worker build configuration
wrangler.jsonc        Local Worker and storage bindings
```

Install dependencies from the lockfile before development. Generated build output, dependencies, local databases, private environment files, and runtime user uploads are intentionally excluded from source control. Configure deployment secrets in the hosting environment. Existing production projects and uploaded assets remain in their database and object storage.
