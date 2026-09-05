# HANCI — Restore / Runbook

Working product name: **EXULT**. This is a procedures document for restoring the Supabase backend and edge functions after the Lovable-Cloud exit.

---

## 1. Repository layout that matters

| Path | Role |
|---|---|
| `supabase/config.toml` | CLI config; `project_id` + `schema_paths = ["schemas"]` (schema export is the source of truth). |
| `supabase/schemas/**` | Postgres schema export (tables, functions, RLS, triggers, grants, extensions). Applied with `supabase db push`. |
| `supabase/functions/**` | Edge functions (Deno). Deployed individually. |
| `src/integrations/supabase/client.ts` | Browser Supabase client (reads `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY`). |
| `.env` | Frontend env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`, plus non-prefixed `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY`. No secrets. |

## 2. Required environment (server-side secrets, never in Vite env)

Managed Supabase auto-injects: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`.

Manually configured (Supabase project → Edge Functions secrets):

- `OPENAI_API_KEY` — chat fallback router, transcriptions, OCR/media, image fallback, smart features, voice translation.
- `ANTHROPIC_API_KEY` — optional, model router (`hanchi-reason`).
- `GEMINI_API_KEY` — optional, model router (`hanchi-context`).
- `REPLICATE_API_KEY` — primary image generation.
- `GIPHY_API_KEY` — stickers/GIF search.
- `FIRECRAWL_API_KEY` — web search + link transcription (single-key; **freshly issued** — the Lovable-connector-managed copy is not exportable).
- `ELEVENLABS_API_KEY` — TTS.
- `YARNGPT_API_KEY` — alternate TTS.

`LOVABLE_API_KEY` must not be set anywhere.

## 3. Restore order

### 3.1 Database schema

```bash
supabase link --project-ref <project_id>
supabase db push
```

- The `schemas/` export includes the `vector` extension (pgvector), all public tables, RLS, functions (`is_admin`, `handle_updated_at`, `match_nigerian_knowledge`, tsvector helpers), triggers, and indexes.
- If pushing to an already-populated project, review the diff with `supabase db diff` first.
- **Known guard:** if the live project's migration history contains versions whose local `supabase/migrations/*.sql` files were deleted (they are, since `schemas/` is the source of truth), `supabase db push` aborts with "Remote migration versions not found in local migrations directory". Fix is history-table-only (no schema/data change):
  ```bash
  supabase migration repair --status reverted <version...>
  ```
  then `supabase migration list` and push the desired delta migration. Never changes schema objects — only the `schema_migrations` bookkeeping.

### 3.2 Data

Row volume is small (~360 rows historically). Options:

- `pg_dump` from the source (schema + data), or
- Re-create via the app (conversations/messages regenerate through use).

Critical: preserve `auth.users` UUIDs — every user-scoped table FKs to `auth.users.id`. Re-inviting users orphans existing conversations/messages. Dump and restore the `auth` schema if user data exists.

### 3.3 Edge functions

```bash
supabase functions deploy chat
supabase functions deploy process-media
supabase functions deploy transcribe-audio
supabase functions deploy generate-image
supabase functions deploy ai-smart-features
supabase functions deploy text-to-speech
supabase functions deploy yarngpt-tts
supabase functions deploy translate-voice
```

### 3.4 Storage buckets

None exist yet (no `storage.from` calls). When the file layer is implemented (EXULT Task 4):

- `documents` — private; RLS on `storage.objects` by `owner`/path prefix.
- `generated` — private; generated images/audio.
- `avatars` — public-read acceptable.

### 3.5 Frontend env

Point `.env` at the project, then rebuild:

```bash
npm run build
```

## 4. Deploy pipeline (recommended)

There is **no CI deploy today**. Auto-deploy from Lovable is gone. Until a GitHub Actions workflow exists, every edge-function change requires an explicit `supabase functions deploy <name>` after `supabase link`.

## 5. Verify after any restore

1. Auth: email/password sign-in works against the restored `auth.users`.
2. Chat: send a message → SSE streams → assistant row persists → reload → conversation visible.
3. RLS: a normal user sees only their own conversations/messages/documents/images.
4. Admin: `is_admin()` returns true only for `admin_users`; admin reads all intended rows after the Admin-foundation phase.
5. Image generation: Replicate primary; OpenAI fallback; no `provider: "lovable"` anywhere.
6. `git log` + this runbook = deploy audit trail.

## 6. Rollback

- Edge functions: redeploy the previous commit’s function source (git history holds it).
- Schema: use a `supabase db diff` snapshot before pushing; restore with a prior dump if needed.
- Frontend: rebuild from a prior commit.
- The Lovable Cloud project, if still alive read-only, is the ultimate fallback only until the two-week read-only window closes; **do not** reintroduce it as the canonical backend.