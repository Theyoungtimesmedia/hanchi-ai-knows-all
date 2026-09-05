# HANCI — CHANGELOG (Agentic)

Working product name: **EXULT**.

This changelog records agent-executed changes. Each entry follows the bounded-task discipline: inspect → change → verify → document → stop. Dates are UTC unless noted.

---

## 2026-09-04 — Admin foundation pushed to live DB

**Task:** Deploy the Task-2 admin schema delta to the live Supabase project.

**What happened:**

- Precondition: the repo deleted `supabase/migrations/*.sql` when `supabase/schemas/` became the schema source of truth (`config.toml` → `schema_paths = ["schemas"]`). The live project still had 8 migration versions applied in its history table with no local files, so `supabase db push` guard-railed with "Remote migration versions not found in local migrations directory".
- Reconciled history table (bookkeeping only — no schema/data touched): `supabase migration repair --status reverted 20260831141340 20260831141546 20260901194756 20260904032454 20260904032629 20260904032724 20260904032817 20260904032956`.
- Created `supabase/migrations/20260904201211_admin_foundation.sql` mirroring the `schemas/` Task-2 delta (profiles table + RLS + admin policies, `get_admin_stats()`, admin read policies on conversations/messages/documents/generated_images, `is_admin` authenticated grant).
- `supabase db push --dry-run` → exactly 1 migration (`20260904201211_admin_foundation.sql`); then `supabase db push` applied it.
- Verified against the live DB via `supabase db query --linked`:
  - `profiles` table exists (20 tables total now).
  - All 5 `profiles` policies live (`Users can … own profile` ×3, `Admins can view/update all profiles`).
  - `Admins can view all` policies live on conversations, messages, documents, generated_images (alongside unchanged user policies).
  - `get_admin_stats()` exists; `public.is_admin(uuid)` has EXECUTE for `authenticated` + `postgres` (REVOKEd from PUBLIC).
- Networking note: pooler connections intermittently dropped/timeout; read-only verifications were retried until successful. No data impact.

**Blocked / deferred:**

- Live end-to-end chat verification still outstanding; profile auto-create trigger on `auth.users` signup still un-wired (post-admin housekeeping).

---

## 2026-09-04 — Admin foundation (EXULT tasklet Task 2)

**Task:** Admin identity + real, server-gated statistics without leaking user data; per EXULT tasklet Task 2 and audit findings 1–3.

**Schema files (source of truth, `supabase/schemas/`; applied to live DB via `supabase db push`):**

- **`public/tables/profiles.sql`** (new):
  - `profiles` table (`id` uuid PK default `gen_random_uuid()`, `user_id` uuid `NOT NULL UNIQUE` FK → `auth.users(id)` ON DELETE CASCADE, `display_name`, `avatar_url`, `locale` default `'en'`, `created_at`/`updated_at`).
  - RLS enabled. User INSERT/UPDATE/SELECT own profile only (`auth.uid() = user_id`). Admin SELECT/UPDATE via `private.is_admin(auth.uid())`.
  - `BEFORE UPDATE` trigger → `public.handle_updated_at()`.
- **`public/functions/get_admin_stats.sql`** (new):
  - `get_admin_stats()` returns `jsonb`; `SECURITY DEFINER`, `SET search_path TO 'public'`.
  - Raises `'Not authorized'` unless `private.is_admin(auth.uid())` — server-side gate, not client hiding.
  - Returns real aggregates: `users`, `conversations`, `messages`, `documents`, `generated_images`, `admins`, `messages_last_24h`, `messages_last_7d`, `new_users_last_7d`.
  - `GRANT EXECUTE ... TO authenticated, postgres, service_role`; `REVOKE ALL ... FROM PUBLIC`.
- **Admin read policies** (append-only additions, no removal of user policies):
  - `conversations.sql` → `"Admins can view all conversations"` FOR SELECT TO `authenticated` USING `private.is_admin(auth.uid())`.
  - `messages.sql` → `"Admins can view all messages"` FOR SELECT TO `authenticated`.
  - `documents.sql` → `"Admins can view all documents"` FOR SELECT TO `authenticated`.
  - `generated_images.sql` → `"Admins can view all images"` FOR SELECT TO `authenticated`.
  - Rationale: admins previously saw only their own rows (RLS user-scoped) → fake statistics; admin SELECT bypass per table restores real admin visibility while user policies remain intact.
- **`public/functions/is_admin.sql`** — grant alignment: `GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO "authenticated", "postgres"` (was postgres-only). `public.is_admin` is the function PostgREST exposes via `rpc("is_admin")`, which `Admin.tsx`/`AppSidebar.tsx` call; without the grant the client gate would fail after `db push`. `private.is_admin` (RLS path) was already authenticated-visible.
- **`.pgdelta-export.json`** — registered `profiles.sql` (table load order) and `get_admin_stats.sql` (function load order).

**Frontend:**

- `src/pages/Admin.tsx` — `loadData()` now calls `supabase.rpc("get_admin_stats")` once instead of three RLS-scoped count queries (`conversations`/`messages`/`generated_images`), so the dashboard card numbers are real DB-wide counts guarded server-side. The `is_admin` client gate at `Admin.tsx:44` remains as a UI convenience; the RPC itself is the enforcement.
- `src/integrations/supabase/types.ts` — added `profiles` table Row/Insert/Update and `get_admin_stats` RPC signature (`Args: {}, Returns: Json`).

**Verification (evidence):**

- `node node_modules/typescript/bin/tsc --noEmit` → exit 0.
- `node node_modules/vite/bin/vite.js build` → exit 0, 3371 modules, built in 2m55s.
- `eslint src/pages/Admin.tsx` → only the **pre-existing** `any[]` errors + `useEffect` dep warning (baseline, untouched by this task); no new findings.
- `.pgdelta-export.json` parses as valid JSON.

**Blocked / deferred (documented, not regressions):**

- Schema changes are NOT yet applied to the live Supabase project (needs approved `supabase db push`).
- Profile auto-creation on signup (trigger on `auth.users`) not wired yet — returns to post-admin housekeeping.
- No migration file generation for these schema deltas yet; they live in `schemas/` per current source-of-truth convention.

---

## 2026-09-04 — Lovable AI removal from image generation

**Task:** Finish the Lovable AI exit (master pack §5.1–5.2; EXULT tasklet Task 1).

**Files changed:**

- `supabase/functions/generate-image/index.ts`
  - Removed `LOVABLE_API_KEY` env read.
  - Removed the `https://ai.gateway.lovable.dev/v1/chat/completions` fallback and its `google/gemini-2.5-flash-image` model.
  - Added OpenAI `gpt-image-1` fallback (`https://api.openai.com/v1/images/generations`), consuming `OPENAI_API_KEY`, handling 429/402 explicitly, normalising `b64_json`/`url` into the existing `image_url` frontend contract, and reporting `provider: "openai"`.
  - Hardenned the final error: `"No image generation API configured. Configure REPLICATE_API_KEY or OPENAI_API_KEY."`
- `src/components/image-creator/ImagePreview.tsx`
  - Removed the `provider === "lovable" ? "✨ Gemini"` label branch; added `provider === "openai" ? "🎨 AI"`.
- `public/sw.js`
  - Replaced the obsolete `ai.gateway.lovable.dev` request skip with a generic AI-provider skip (openai / replicate / generativelanguage / anthropic) so no provider API response is ever cached.
- `index.html`
  - Replaced both Lovable OG/Twitter image URLs with `/hanchi-logo.png`.
- `src/components/ModelSelector.tsx`
  - Removed the "Powered by Lovable AI" tooltip copy.
- `src/integrations/supabase/previewAuthStorage.ts`
  - **Deleted.** Lovable-only preview auth broker; confirmed dead (no importers anywhere in `src/`). Recoverable from git history.
- `supabase/config.toml` / deleted `supabase/migrations/*.sql` — pre-existing working-tree state (schema source of truth moved to `supabase/schemas/`); not part of this change.

**Reinstall (verification toolchain):**
- `node_modules` was corrupted by an interrupted install (missing `.bin`, truncated packages). Removed and reinstalled cleanly via `npm install` (530 packages, npm 11.19.0). `package-lock.json` was reconciled with `package.json` (the lock previously pinned `@supabase/supabase-js@^2.86.2` while `package.json` declares `^2.112.4`).

**Verification (evidence):**

- `node node_modules/typescript/bin/tsc --noEmit` → exit 0 (no type errors).
- `node node_modules/vite/bin/vite.js build` → exit 0, 3371 modules, built in 78s.
- `eslint src` → exit 1 with **pre-existing only** errors (files untouched by this task: `useChat.ts`, `Admin.tsx`, `Apps.tsx`, `Auth.tsx`, etc.). No new lint errors in changed files (`ImagePreview.tsx`, `ModelSelector.tsx` clean).
- Sweep for `lovable` / `ai.gateway.lovable.dev` / `LOVABLE_API_KEY` across non-doc runtime files:
  - Edge functions: **0 matches**.
  - `src/`: only the deleted file’s hits and intentional comments (`ai-router.ts` line 4 comment).
  - Remaining live hits: `lovable-tagger` devDependency (build-time).

**Not touched (per non-goals):**

- `useChat.ts` SSE parser and `chat/index.ts` streaming path — frozen (master pack §14/§15).
- `messages.metadata` shape — additive-only policy.
- `is_admin()` / admin RLS — only privilege boundary; changed in the next phase (Admin foundation).

---

## NEXT TASK (planned)

Admin foundation (EXULT tasklet Task 2):

- Add `profiles` table (id → auth.users, display_name, avatar_url, locale, timestamps) with RLS.
- Add `get_admin_stats()` SECURITY DEFINER function returning real counts/aggregates.
- Add admin-only read policies on operational tables (conversations, messages, documents, generated_images) scoped via `is_admin()`.
- Rewire `src/pages/Admin.tsx` to call `get_admin_stats()` instead of user-scoped direct counts.

---

## Historical reference

- `docs/HANCI_AUDIT.md` — pre-Lovable-exit audit (read-only, kept as history).
- `HANCI_ARCHITECTURE_MIGRATION_PLAN.md` — Lovable-Cloud exit plan (kept as history).