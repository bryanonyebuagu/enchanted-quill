# Enchanted Quill

[Live preview](https://enchanted-quill.vercel.app/) · [Hosted workspace](https://enchanted-quill-stories.proud-panda-0902.chatgpt.site/)

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

Svelte 5, Svelte Flow (@xyflow/svelte), Vite, Lucide, Cloudflare Workers/D1/R2. No React runtime or separate animation framework is required.

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

## Vercel preview

Vercel uses `vercel.json` and `vite.vercel.config.js` to build the Svelte frontend. Story editing, reusable libraries, the canvas, prompt composition, local image imports, and browser autosave work without a server connection. The existing Cloudflare Worker, authentication, D1 database, R2 uploads, generation jobs, and credits are not migrated to Vercel. API requests in this preview return a clear unavailable response, and paid generation remains disabled. Use the original hosted workspace for its existing cloud services. Browser-local stories are separate on each domain.


## Import your story and production assets



Character, location, scene and theme libraries support two paths: create within the workspace or import an existing image / JSON record. Imported portraits are marked as unverified reference sheets until their coverage is confirmed. Scene images remain separate from identity and location assets.



New Story and Story Workspace include a complete PDF import review. PDF.js reads every supported page (up to 500 pages / 40 MB), preserves the full extracted text and original file, proposes scene headings, explicit character and location records, quoted dialogue and directly stated emotions, and reports missing details. This is local, source-based extraction rather than a connected language-model analysis service. Suggested names and interpretation require review. Scanned pages need OCR, which is not connected.



Embedded raster images are extracted where supported, deduplicated, and explicitly assigned by the user to character, location, scene or theme records. Up to 200 embedded images are offered for review; unsupported, oversized and unassigned imagery remains in the original PDF. No visual identity is guessed from a picture. The original PDF and imported media persist in browser IndexedDB; project records and extracted page text can be included in the existing cloud snapshot workflow on the original host.



Approved drafts open as linked character, location, theme and scene nodes, with prompt/image nodes when scene imagery was imported. Missing references, descriptions, scene connections and emotions stay visible in the production checklist. A beginning-to-ending story planner and Markdown story-bible export support production handoff. No paid generation runs on upload, selection or save.



## Story artwork and themes



The bundled library contains seven distinct project covers, nineteen unique location references and twenty-one new multi-view character reference sheets, alongside the three retained original character references. Generated artwork has stable asset IDs, saved prompts and distinct content hashes. Existing imported or approved user assets take precedence. Each story has its own cast, settings, scenes and authored thematic guide. Dark mode uses neutral pitch-black surfaces with lemon accents; light mode and the castle background remain available.


## Tutorials

Seven searchable lessons cover navigation, stories and PDF intake, asset imports, canvas connections, scenes, generation previews, and saving. Progress saves in the browser, and lesson actions open the relevant workspace area.
