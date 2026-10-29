# Enchanted Quill

**Live demo:** [enchanted-quill.vercel.app](https://enchanted-quill.vercel.app/)

Enchanted Quill is a visual story-development workspace for writers and creative teams. It brings character and location references, scenes, prompts, and branching storyboards together in one canvas.

## What it does

- Organizes stories, characters, locations, scenes, and reference assets.
- Connects story elements on an interactive canvas with pan, zoom, arrangement, and undo/redo controls.
- Supports branching reader choices, reusable entity profiles, and a scene navigator.
- Imports PDFs for source-based text extraction and review, with extracted details presented for user confirmation.
- Saves drafts locally and supports cloud snapshots on the original hosted workspace.
- Includes light and dark themes, tutorials, and responsive editing panels.

## Product and AI boundaries

The Scene Director assembles editable prompts from story details and saved references; it does not call a language model. PDF intake uses local text extraction rather than AI analysis. Generated image and motion previews are demonstrations, not paid or live provider output. Live provider generation is not enabled.

## Tech stack

Svelte 5, Svelte Flow, Vite, Cloudflare Workers, D1, R2, and PDF.js.

## Run locally

```sh
npm install --legacy-peer-deps
node node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config wrangler.jsonc --file drizzle/0000_generation.sql
npm run dev
```

Create the local database once before starting the app. Use `npm run build` to create a production build. The Vercel preview supports browser-local editing, but hosted Worker services such as authentication, cloud storage, and generation jobs remain on the original Cloudflare-backed workspace.

## Tests

```sh
node --test server/api.test.js src/visual-model.test.js src/canvas-model.test.js
```

See [GENERATION.md](GENERATION.md) for provider configuration and activation requirements.


## Tutorials

Seven searchable lessons cover navigation, stories and PDF intake, asset imports, canvas connections, scenes, generation previews, and saving. Progress saves in the browser, and lesson actions open the relevant workspace area.
