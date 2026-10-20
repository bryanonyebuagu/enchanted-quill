CREATE TABLE quill_wallets (owner TEXT NOT NULL, mode TEXT NOT NULL, period TEXT NOT NULL, plan TEXT NOT NULL DEFAULT 'free', balance INTEGER NOT NULL, held INTEGER NOT NULL DEFAULT 0, PRIMARY KEY(owner,mode,period), CHECK(balance>=0), CHECK(held>=0));
--> statement-breakpoint
CREATE TABLE quill_jobs (id TEXT PRIMARY KEY NOT NULL, owner TEXT NOT NULL, story_id TEXT NOT NULL, scene_id TEXT, kind TEXT NOT NULL, mode TEXT NOT NULL, state TEXT NOT NULL, request_key TEXT NOT NULL, request_hash TEXT NOT NULL, estimate INTEGER NOT NULL, payload TEXT NOT NULL, provider TEXT, error TEXT, asset_id TEXT, created INTEGER NOT NULL, updated INTEGER NOT NULL, UNIQUE(owner,request_key));
--> statement-breakpoint
CREATE TABLE quill_ledger (id TEXT PRIMARY KEY NOT NULL, owner TEXT NOT NULL, job_id TEXT NOT NULL, event TEXT NOT NULL, amount INTEGER NOT NULL, mode TEXT NOT NULL, period TEXT NOT NULL, applied INTEGER NOT NULL DEFAULT 0, created INTEGER NOT NULL, UNIQUE(job_id,event));
--> statement-breakpoint
CREATE TABLE quill_assets (id TEXT PRIMARY KEY NOT NULL, owner TEXT NOT NULL, job_id TEXT, story_id TEXT NOT NULL, scene_id TEXT, asset_type TEXT NOT NULL, entity_id TEXT, object_key TEXT NOT NULL, content_type TEXT NOT NULL, metadata TEXT NOT NULL, created INTEGER NOT NULL, UNIQUE(job_id));
--> statement-breakpoint
CREATE TABLE quill_projects (owner TEXT NOT NULL, id TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 1, payload TEXT NOT NULL, updated INTEGER NOT NULL, PRIMARY KEY(owner,id));
--> statement-breakpoint
CREATE TABLE quill_events (id TEXT PRIMARY KEY NOT NULL, owner TEXT NOT NULL, job_id TEXT, code TEXT NOT NULL, message TEXT NOT NULL, created INTEGER NOT NULL);
