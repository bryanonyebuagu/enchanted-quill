# Enchanted Quill

A cinematic story development workspace built with Svelte 5, Vite, and Lucide icons. Motion uses Svelte transitions and CSS; no additional UI or animation framework is required.

## Run locally

```sh
npm install
npm run dev
```

## Production build

```sh
npm run build
```

The generated `dist` directory is a static site.

## Experience

- Dashboard, story workspace, storyboard, writing view, timeline, and branching reader.
- Collapsible navigation, command palette, docked resizable inspector, accessible dialogs, mobile navigation, and reduced-motion support.
- Scene editing, choices, local project creation, scene reordering, search and filters, JSON import/export, and activity history.
- Character portraits and four-angle full-body turnaround reference sheets with downloadable originals and the exact prompts used.
- Location previews, sample relationships, themes, pinned context notes, and a prompt library.
- Narrative health measures scene reachability and structural completeness, not AI-generated creative quality.

## Data and scope

This is a UI/UX design implementation with working browser-local interactions. It does not connect to a live AI service. AI memory, character biographies, relationships, and themes use labeled sample context. Story counts and structural checks use actual local scene data.

Data is saved to `quill-studio-v1` in localStorage. The first launch imports the earlier `enchanted-quill` story when present, without removing the original key. Export stories to keep a portable backup. Browser-local data is not shared across devices or origins.

## Images

Character portraits and turnaround sheets were generated with the built-in image generation tool. Exact prompts are recorded in `src/portrait-prompts.json` and `src/turnaround-prompts.json` and are visible in the app.

The castle background is retained from the original application. Castle, forest, and library photographs are served locally from `public/images`.

## Stack

- Svelte 5 reactive state and built-in transitions
- Vite static production build
- Lucide Svelte icons
- CSS Grid, responsive panels, native drag and drop, SVG charts and relationships
