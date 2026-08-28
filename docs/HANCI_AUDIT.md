# HANCI — Current Project Audit

Read-only audit. No code or database was modified.

---

## CURRENT PRODUCT

A consumer-facing, Nigeria-flavoured AI chat app ("Hanchi AI") with a personality persona, multimodal chat (text, images, audio/video transcription), image/sticker generation, a prompt library, a light admin dashboard, and a large amount of UI surface area that is not backed by persistence. It is a **chat app with workspace-shaped UI**, not yet a workspace product.

## CURRENT STACK

- React 18 + Vite 5 + TypeScript + Tailwind + shadcn/Radix
- Framer Motion (animations), lucide-react (icons), react-router-dom v6 (19 routes)
- TanStack Query provider mounted in `src/main.tsx` but effectively unused (pages fetch in `useEffect` + `useState`)
- Backend: Lovable Cloud (Supabase) — Postgres + Auth + 8 Deno edge functions
- AI: Lovable AI Gateway (`ai.gateway.lovable.dev`), plus Replicate, Firecrawl, Giphy, ElevenLabs/YarnGPT secrets
- PWA: `public/sw.js`, `manifest.json`, `offline.html`

## CURRENT DATABASE

19 public tables, RLS enabled on all of them.

| Table | Rows (est.) | Notes |
|---|---|---|
| conversations | 96 | user_id → auth.users, `pinned`, `language`, updated_at trigger |
| messages | 117 | conversation_id FK, `metadata` jsonb holds images/sources/confidence/thought |
| nigerian_knowledge | 144 | `embedding vector` + `content_search tsvector`; only the **tsvector** path is used |
| user_preferences | 2 | language, voice_enabled, study_mode, learning_goals |
| admin_users | 1 | read via `is_admin()` security-definer fn |
| user_memory | 0 | key/value memory; also abused as a settings store (`custom_instructions`, `tone`) |
| collections / collection_items | 0 | wired to UI, never populated in practice |
| documents **and** uploaded_documents | 0 / 0 | **duplicate source of truth** — two near-identical document tables |
| generated_images | 0 | images are generated but not reliably persisted |
| shared_conversations | 0 | share tokens |
| message_sources | 0 | sources are written into `messages.metadata` instead — **duplicate source of truth** |
| message_reactions, announcements, app_settings, blocked_users, flagged_users, conversation_templates | 0 | admin/social scaffolding |

- **Functions:** `is_admin(uuid)`, `handle_updated_at()`, `match_nigerian_knowledge(text,…)` (FTS, used) and `match_nigerian_knowledge(vector,…)` (pgvector, **never called** — no embedding pipeline exists), `update_knowledge_search_vector()`, memory/preferences updated_at fns.
- **Triggers:** updated_at on conversations, nigerian_knowledge, user_memory, user_preferences; tsvector maintenance on nigerian_knowledge.
- **Indexes:** minimal — most tables have only their PK. `messages` has 3, `nigerian_knowledge` 5.
- **Storage buckets: NONE.** No `storage.from(...)` call exists anywhere in the codebase.
- **RLS shape:** user tables scope on `auth.uid()`; admin tables use `is_admin()`. Many older policies target the `public` role rather than `authenticated` (permissive but still uid-scoped). `message_sources` INSERT is `System can insert sources` with a permissive check.

## CURRENT AI

| Capability | Provider / Model | Route | I/O | Status |
|---|---|---|---|---|
| Chat (streaming) | Lovable AI — `google/gemini-3-flash-preview` default; map to gemini-2.5-pro, gpt-5 / -mini / -nano, gpt-5.2 | `functions/chat` | text + images → SSE text + metadata (confidence, sources, thought) | WORKING |
| Web search grounding | Firecrawl `/v1/search` | inside `functions/chat` | query → markdown context + sources | WORKING (silent fallback on failure) |
| Nigerian context RAG | Postgres FTS via `match_nigerian_knowledge(text)` | inside `functions/chat` | query → 5 rows | WORKING, keyword-only (no embeddings) |
| Audio/voice transcription | Lovable AI — `google/gemini-2.5-flash` multimodal | `functions/transcribe-audio`, `process-media` | opus/webm/m4a/wav → text | WORKING |
| Media/link transcription | Firecrawl scrape + `gemini-2.5-pro` | `functions/process-media` | YouTube/TikTok/FB URL → timed transcript + summary | PARTIAL — depends on scrapable page text, not real ASR of the video |
| Document/OCR extraction | `gemini-2.5-flash` | `functions/process-media` | pdf/image/text → extracted text + summary | WORKING, result is **not persisted** |
| Image generation | Replicate (SDXL etc.) primary, Lovable `gemini-2.5-flash-image` fallback, Giphy passthrough | `functions/generate-image` | prompt → base64/url | WORKING |
| Summarize / auto-tag / smart-search | `gemini-2.5-flash` / `-flash-lite` | `functions/ai-smart-features` | messages → summary/tags | PARTIAL — function exists, thin/absent UI wiring |
| TTS | YarnGPT + ElevenLabs | `functions/yarngpt-tts`, `text-to-speech` | text → audio | PARTIAL — external YarnGPT dependency |
| Voice translation | Lovable AI | `functions/translate-voice` | audio → translated text | PARTIAL |

Limitations: no embeddings pipeline, no tool/function calling, no agent loop, no per-user model routing persisted, `verify_jwt = false` on all six configured functions (chat is callable with the anon key by anyone).

## CURRENT AUTH

- Supabase email/password only (`signInWithPassword`, `signUp`) in `src/pages/Auth.tsx`. **No Google/OAuth provider.**
- No route guard component: each page independently calls `supabase.auth.getSession()` and redirects. Protected routes render before the check resolves.
- Admin gate = `rpc('is_admin')` on the client for UI, plus `is_admin()` inside RLS for data. Data layer is sound; UI gate alone is not.

## CURRENT FILE SYSTEM

**There is none.** `useFileUpload` converts files to base64 in React state and sends them inline to edge functions. Nothing is written to Supabase Storage, and `documents` / `uploaded_documents` stay empty. Files do not survive a page reload. This is the single biggest gap for a workspace product.

## CURRENT CHAT SYSTEM

`useChat` → `POST /functions/v1/chat` (raw fetch with the anon key, manual SSE line parsing, AbortController for stop) → streams into local state → persists user + assistant rows into `messages`, bumps `conversations.updated_at`, auto-titles from the first message. Load-on-mount by `conversation_id`. Regenerate and edit-and-resend are implemented client-side.

---

## WORKING

- Email/password auth and session handling
- Conversation CRUD, pinning, titling, message persistence, load-by-conversation
- Streaming chat with model selection, tone, think mode, web search, Nigerian context
- Voice recording → transcription; opus/webm handling
- Document/image extraction and summarization (in-session)
- Image + sticker generation (Replicate/Gemini/Giphy)
- Admin dashboard: announcements CRUD, blocked/flagged lists, counts (RLS-enforced)
- Personalization and Memories pages backed by `user_memory`
- Settings: preferences persistence + memory delete/clear
- PWA shell, theming, route transitions

## PARTIAL

- **Collections** — full UI + tables + RLS, but nothing in the app writes items in normal flows
- **Artifacts** — reads `uploaded_documents` + `generated_images`, both of which are never written
- **Shared chats** — table and dialog exist, unverified end to end
- **ai-smart-features** — deployed but barely surfaced in the UI
- **Link transcription** — scrape-based, fails on JS-only or robots-blocked pages
- **TTS / voice translation** — dependent on external YarnGPT availability
- **Search** — `QuickSearchModal` filters conversation titles and static actions in memory; no full-text search across messages

## MOCK / LOCAL-ONLY

- **Projects** (`localStorage: hanchi_projects`) — no table, no sync
- **Custom GPTs** (`localStorage: hanchi_custom_gpts`) — no table, no effect on the chat system prompt beyond the session
- **Apps / connectors** (`src/pages/Apps.tsx`) — hardcoded `APPS[]`, connect toggle only fires a toast; **no connector layer exists**
- **Discover** — hardcoded feature demos that prefill a prompt
- **Prompt library recents** — localStorage
- **Plugins** (`src/utils/pluginSystem.ts`, `src/plugins/*`) — a registry no page executes

## BROKEN / RISKY

- No storage layer, so every file-based feature is ephemeral
- `verify_jwt = false` on `chat`, `transcribe-audio`, `text-to-speech`, `yarngpt-tts`, `translate-voice`, `generate-image` — unauthenticated cost exposure
- `pgvector` column and `match_nigerian_knowledge(vector,…)` are dead code (no embedding writer)
- Missing indexes on `messages(conversation_id, created_at)`-style access paths as volume grows
- Duplicate truth: `documents` vs `uploaded_documents`; `message_sources` vs `messages.metadata`

## MISSING (for HANCI)

Projects as a real entity, project↔chat↔file relationships, Supabase Storage + a file/ingestion pipeline, embeddings + semantic retrieval, a durable model-routing config, reusable skills, external connectors/OAuth, scheduling/automation, agent runs and tool calls, an audit/usage log, and a single auth guard.

## ARCHITECTURAL STRENGTHS

1. Clean edge-function boundary — all AI keys stay server-side, providers are swappable in one place.
2. RLS is enabled everywhere with a correct security-definer admin pattern (no role-on-profile anti-pattern).
3. Conversation/message schema is generic (jsonb metadata) and can absorb projects, artifacts, and tool output without a rewrite.
4. Hooks are already the seam between UI and backend — repointing `useFileUpload`/`useChat` changes behaviour app-wide.
5. Design system and routing are consistent enough to add a project scope without redesigning pages.

## ARCHITECTURAL PROBLEMS

1. localStorage is a parallel, unsynced database for Projects and Custom GPTs.
2. No storage bucket, so the document model is fictional.
3. Duplicate/conflicting tables and metadata locations.
4. Auth checks are copy-pasted per page and race the first render.
5. TanStack Query is installed but unused — no caching, refetch, or invalidation discipline.
6. Open edge functions (`verify_jwt = false`) with no per-user quota.
7. Retrieval is keyword-only despite pgvector being installed.

## DANGEROUS AREAS TO MODIFY

- `src/hooks/useChat.ts` — hand-rolled SSE parser; the buffering logic is easy to break.
- `supabase/functions/chat/index.ts` — persona, tone, context injection and streaming all in one file.
- `supabase/functions/process-media/index.ts` — chunked base64 handling; naive edits reintroduce stack-overflow crashes on large files.
- `src/integrations/supabase/client.ts`, `types.ts`, `.env`, `supabase/config.toml` — generated.
- Any change to `messages.metadata` shape — it is the de facto schema for sources, images, and reasoning.
- `is_admin()` and admin RLS policies — the only real privilege boundary.

## RECOMMENDED FOUNDATION

1. **Make persistence real before adding features.** Create a Supabase Storage bucket with RLS, collapse `documents`/`uploaded_documents` into one table, and repoint `useFileUpload` at upload → row → signed URL.
2. **Promote Projects to a first-class table** (`projects`, `project_members` if ever shared) and add `project_id` to conversations, documents, and generated_images. Migrate the localStorage payloads once, then delete that code path.
3. **Lock the backend down.** Turn on `verify_jwt` for the AI functions, read `auth.uid()` server-side, and add a per-user usage/quota table — this must happen before connectors or agents.
4. **Build the retrieval layer properly.** Add an embedding writer for documents and messages, an HNSW index, and one `search(query, project_id)` RPC that both chat grounding and global search call. Retire the dead vector RPC or wire it.
5. **Introduce one config source of truth** — a `user_settings`/`model_routing` table replacing the `user_memory` key/value overloading — then layer skills, connectors, and agent runs on top of it as separate tables with their own RLS.

**Verdict:** the codebase can safely evolve into HANCI. The chat core, RLS discipline, and edge-function boundary are reusable as-is; the workspace layer (storage, projects, retrieval, connectors) is genuinely absent rather than half-broken, which makes it additive work rather than a rewrite. The main cleanup debt is the localStorage features and the duplicate tables.
