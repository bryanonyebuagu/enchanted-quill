# Higgsfield integration and activation

This is a tested **mock integration and server architecture**, not an account-verified live Higgsfield integration. No paid request has been made. Production is configured with `HIGGSFIELD_MODE=mock`, `HIGGSFIELD_API_ENABLED=false`, and both verification gates false. Source defaults to disabled if mode is absent. Secrets never enter Svelte or Vite client environment variables.

## Operating modes

- `disabled`: job submission is rejected; editing and prompt preparation continue.
- `mock`: server-owned job records progress through queued, processing and completed. R2 stores unique, clearly watermarked SVG demonstrations. Mock video outputs are animated placeholders, **not rendered videos** and do not animate the selected source image. Uploaded MP4/WebM files have actual playback controls. Preview credits have no monetary value.
- `live`: all of `HIGGSFIELD_API_ENABLED=true`, server credential, `HIGGSFIELD_LIVE_VERIFIED=true`, `HIGGSFIELD_BILLING_VERIFIED=true`, a verified model and verified output hosts are required. Browser controls cannot enable this mode.

## Deployment and storage

The existing Svelte 5 application is retained. A Cloudflare Worker serves `/api/*`; Vite produces `dist/client` assets and `dist/server/index.js`. Sites owns authentication and injects `oai-authenticated-user-id`. Every database and file operation checks this identity. Writes require the same Origin and a custom request header. Production has no local authentication bypass. `.openai/hosting.json` declares D1 `DB` and R2 `BUCKET`; Sites provisions these and applies the immutable `drizzle/0000_generation.sql` migration.

Projects continue to autosave on the device, including entity edits, reference bindings, positions and connections. Explicit cloud snapshots preserve linked records and can be reopened on another device. Conflicting cloud revisions are rejected; reopening preserves a local backup. Existing local drafts are not automatically overwritten by remote data.

Jobs, credit transactions and generated assets are persisted server-side. Uploaded scene/character/location assets can be mirrored to R2 for generation. Approving a scene image changes only that scene’s pointer. Reference bindings pin an approved version for a scene; changing a library reference does not alter existing approved scene images. Previous files and job versions remain stored.

## Credits and plans

Server configuration in `server/config.js` defines Free, Pro and Studio monthly preview allowances. Prices are unset. `QUILL_PLANS` and `QUILL_CREDIT_COSTS` may supply JSON overrides. These are application credit units, not a representation of Higgsfield USD prices. Payments are not connected. Only a completed job settles a charge; failed/moderated/canceled work releases reservations. D1 batches, unique job intents and a unique settlement ledger prevent duplicate reservations and deductions. A monthly wallet separates mock from live balances.

Do not set billing verification until application credit costs have been reconciled with the chosen model, parameters, account estimates and provider charging rules. There are no automatic monetary charges or subscription purchases in this build.

## Official documentation verified during implementation

- [Authentication](https://docs.higgsfield.ai/docs/authentication): `Authorization: Key KEY_ID:KEY_SECRET`. Store the complete `KEY_ID:KEY_SECRET` in `HIGGSFIELD_API_KEY`.
- [Request lifecycle](https://docs.higgsfield.ai/docs/concepts/requests): POST a documented model endpoint, retain the returned request ID, status URL and cancellation URL. Follow these returned URLs, restricted to the official API origin.
- [Idempotency](https://docs.higgsfield.ai/docs/concepts/idempotency): submissions reuse one stable key and identical payload after ambiguous failures. The adapter persists uploaded input URLs before submission. Reconciliation reuses the original job identity; it does not silently create a new paid generation.
- [Uploads](https://docs.higgsfield.ai/docs/concepts/file-uploads): request a presigned upload URL, PUT media with the returned upload headers, and never send API credentials to storage.
- [Billing and retention](https://docs.higgsfield.ai/docs/concepts/billing-and-retention): successful requests are billed, failed/moderated/canceled requests are refunded, and output must be copied into application storage for long-term retention.
- [Supplementary OpenAPI](https://docs.higgsfield.ai/docs/openapi.json): source for Soul Standard and Kling 2.5 Turbo Pro parameter examples in the registry. These schemas establish documented availability, **not account access or live verification**. This specification is not the entire current model catalog.
- [Model discovery](https://docs.higgsfield.ai/docs/llms.txt): use the selected model’s official Console documentation to verify capabilities. The reference-aware storyboard model remains a deliberately unavailable preview until its actual schema is selected and verified.

Native server-side fetch is used instead of adding the SDK because the verified REST API fits Workers directly. Authentication, schemas and responses follow those official references.

## Activation checklist, to be performed only when explicitly authorized

1. Create/fund the Higgsfield API account and obtain its two-part credential.
2. Store `HIGGSFIELD_API_KEY` as a **secret** in the deployment environment. Never add it to source or a `VITE_` variable.
3. Review the chosen models’ current schemas, account access, reference inputs and pricing. Populate `HIGGSFIELD_MODEL_REGISTRY` with verified entries. Each has `id`, `name`, `endpoint`, `capabilities`, `ratios`, `resolutions`, `durations`, `referenceInput`, `source`, `liveVerified`; reference-aware models also declare the documented `referenceField` accepting the uploaded URLs.
4. Configure `HIGGSFIELD_MEDIA_HOSTS` as an exact comma-separated allowlist of verified provider output hosts. Configure model/parameter credit costs and billing policy. Review moderation, cancellation and refund behavior.
5. Configure `QUILL_ADMIN_USER_IDS` with the trusted Sites user IDs allowed to inspect provider settings. No browser key input exists. Sites account IDs and Site-scoped user IDs are different; use the authenticated workspace account ID shown on Saved cloud projects.
6. Perform a specifically authorized small real test in a controlled environment; verify creation, reference fidelity, polling, cancellation, errors, output retention and ledger settlement against the actual account.
7. Enable the verification flags and Live Mode only after the real test succeeds, then redeploy the saved version. This build has **not performed step 6**.

## Development checks

`node --test server/api.test.js src/visual-model.test.js src/canvas-model.test.js`

The backend tests run against real in-memory SQLite with a D1-compatible adapter and fake object storage. Disabled/mock provider tests assert zero external fetches. Local preview uses Cloudflare’s local D1/R2 emulation, not production resources. Initialize a fresh preview database with `node node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config wrangler.jsonc --file drizzle/0000_generation.sql` once; do not reapply an existing schema.

Assisted creation currently uses an explicitly labeled local heading/paragraph parser and editable character/location review. No language-model analyzer is connected, and prompt composition is deterministic. A language-model service must be separately configured and verified before this can be described as AI analysis.
