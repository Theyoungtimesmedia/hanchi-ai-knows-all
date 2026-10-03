# HANCI — Migration Status

Working product name: **EXULT** (renamed from HANCHI per the EXULT tasklet pack; rename is a working name only — no legal/domain claim).

Migrated to a user-owned Supabase project. Lovable Cloud and Lovable AI are discontinued and must not return as runtime dependencies.

---

## 1. Migration status summary

| Layer | Status | Evidence |
|---|---|---|
| Supabase backend | CONNECTED | `.env` points at the user-owned project (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`). |
| Schema source of truth | SWITCHED | `supabase/config.toml` → `schema_paths = ["schemas"]`. Old `supabase/migrations/*.sql` are deleted from the working tree; `supabase/schemas/**` is the untracked export used by `supabase db push`. |
| RLS | ENABLED | All public tables `ENABLE ROW LEVEL SECURITY`; admin boundary via `is_admin()` security-definer function. |
| Admin foundation | DONE | `profiles` table, `get_admin_stats()` (server-side admin-gated, real aggregates), admin SELECT policies on `conversations`/`messages`/`documents`/`generated_images`; `public.is_admin` now executable by `authenticated` so the client gate works post `db push`. |
| Chat AI | MOVED OFF LOVABLE | `supabase/functions/chat/index.ts` uses `_shared/ai-router.ts` (provider-neutral). No `LOVABLE_API_KEY` / `ai.gateway.lovable.dev` reference remains in any edge function. |
| Smart features | MOVED OFF LOVABLE | `ai-smart-features` uses `_shared/openai.ts` (`gpt-4o-mini`). |
| Audio transcription | MOVED OFF LOVABLE | `transcribe-audio` / `process-media` use OpenAI Whisper (`whisper-1`) via `_shared/openai.ts`. |
| Voice translation | MOVED OFF LOVABLE | `translate-voice` uses OpenAI (`gpt-4o-mini`). |
| Image generation | MOVED OFF LOVABLE | `generate-image` now routes Replicate (primary) → OpenAI `gpt-image-1` (fallback). Lovable fallback removed. See changelog. |
| TTS | MOVED OFF LOVABLE | `text-to-speech` (ElevenLabs) and `yarngpt-tts` (YarnGPT) never used Lovable. |
| Model router | EXISTS | `_shared/ai-router.ts` — capability-first routing, adapters for openai/anthropic/google/replicate. |
| Skills engine | EXISTS | `_shared/skills.ts` — deterministic `selectSkills()`, wired into chat. |
| Preview-auth shim | REMOVED | `src/integrations/supabase/previewAuthStorage.ts` deleted (Lovable-only platform file; not imported anywhere). |

## 2. Lovable reference classification (post-cleanup)

**Live runtime — REMOVED (0 remaining):**

| Location | What was there | Status |
|---|---|---|
| `supabase/functions/generate-image/index.ts` | `LOVABLE_API_KEY` env read, `https://ai.gateway.lovable.dev/v1/chat/completions` call, `google/gemini-2.5-flash-image` model, `provider: "lovable"` | Replaced with OpenAI `gpt-image-1` fallback; provider labelled `"openai"`. |
| `src/components/image-creator/ImagePreview.tsx` | `provider === "lovable" ? "✨ Gemini"` label branch | Removed; added `"openai"` label. |
| `src/integrations/supabase/previewAuthStorage.ts` | Lovable preview auth broker (dead file) | Deleted. |
| `public/sw.js` | `ai.gateway.lovable.dev` skip | Replaced with a generic AI-provider skip (openai/replicate/gemini/anthropic). |
| `index.html` | OG/Twitter images at `https://lovable.dev/...` | Replaced with `/hanchi-logo.png`. |
| `src/components/ModelSelector.tsx` | "Powered by Lovable AI" copy | Removed. |

**Build/deployment tooling — REMAINS (non-runtime):**
- `package.json` devDependency `lovable-tagger` + `vite.config.ts` import of `componentTagger`. Dev-mode-only editor tagging; not shipped to production bundle, no `LOVABLE_API_KEY`, no gateway URL. Removal requires regenerating `bun.lock`; deferred.

**Documentation/history — KEPT (intentionally):**
- `HANCI_ARCHITECTURE_MIGRATION_PLAN.md`, `docs/HANCI_AUDIT.md`, `README.md`, `.lovable/plan.md`, lockfile registry entries.

## 3. Verified working

- Frontend production build passes (`vite build`, 3371 modules).
- TypeScript `--noEmit` passes (no type errors).
- The only lint output is **pre-existing** debt in files untouched by this migration phase (e.g. `useChat.ts`, `Admin.tsx` `any[]`, `previewAuthStorage.ts` `prefer-const` was removed with the file). No new lint errors introduced by the Lovable-exit or admin-foundation changes.
- Chat streaming SSE contract (delta content + `metadata` object) unchanged.
- Admin dashboard stat cards now source from `get_admin_stats()` (real DB aggregates, admin-scoped server-side), replacing the previous user-scoped RLS counts.
- **Live DB (2026-09-04):** Task-2 admin delta applied via `supabase db push` → migration `20260904201211_admin_foundation.sql`. Verified live: `profiles` table + 5 RLS policies, `get_admin_stats()` function (SECURITY DEFINER, admin-gated), `Admins can view all …` SELECT policies on `conversations`/`messages`/`documents`/`generated_images`, and `public.is_admin(uuid)` executable by `authenticated`.
- Migration history reconciled (`supabase migration repair --status reverted` on the 8 orphaned remote versions whose local files were deleted when `schemas/` became the source of truth — bookkeeping only, no schema/data change).

## 4. Known remaining gaps

| # | Gap | Blocking? | Next task |
|---|---|---|---|
| 1 | Migration history reconciled and Task-2 admin delta pushed to live `20260904201211` | Closed | — |
| 2 | Store media on live DB still vanity (per-user counts work; real `profiles` autopopulation on signup not yet wired) | No | Post-admin: profile auto-create trigger on auth.users signup |
| 3 | `verify_jwt = false` on all AI edge functions; `useChat` sends only the anon key | Yes | Lockdown — must ship client session-token change with `verify_jwt = true` in the same release |
| 4 | No storage buckets; file uploads are ephemeral (base64 in session) | Yes | PERSISTENT FILES |
| 5 | Progress: durable projects/knowledge/skills/connectors/agents/automation | Yes | Tasks 4–13 |
| 6 | Live end-to-end chat verification (auth → open → send → stream → persist → reload) | No | Post-admin verification run |
| 7 | `lovable-tagger` dev dependency | No | Deferred (build-time only) |

## 5. Migration docs

- This file: status.
- `docs/HANCI_RESTORE_RUNBOOK.md` — restore procedures.
- `docs/CHANGELOG_AGENTIC.md` — dated agentic change log.

## 6. Private Brain layer

| Area | Status | Evidence |
|---|---|---|
| Brain storage | LIVE | `public.brain_records` is user-owned, RLS-protected, indexed, and deployed through the Supabase migration workflow. |
| Me profile | IMPLEMENTED | `/brain` seeds current identity, JAMB 2027, Figure, J&E schedule, and flexible planning rules from the supplied handoff. |
| Historical archive | IMPLEMENTED | `/brain` imports `.txt`, `.md`, `.json`, and `.csv` files into `context_rot` records marked `needs_verification`; source name and provenance are retained. |
| Default chat context | IMPLEMENTED | Only non-`needs_verification` `high_signal` Brain records are loaded into chat. Historical archive records are excluded from normal replies. |
| Source files | PRESERVED | Supplied handoff, ChatGPT/Claude exports, architecture notes, and continuation prompts are kept under `docs/brain/sources/`. |

The Brain is intentionally a first safe layer, not a claim that every historical export has been fully fact-extracted or deduplicated. Older material must be searched and verified before it becomes current context.