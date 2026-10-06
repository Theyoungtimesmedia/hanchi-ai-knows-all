# Project Engineering Rules

- Treat generated artifact previews as untrusted content: render HTML only in an isolated sandboxed iframe, never execute other generated code, and keep artifact edits local until an explicit save/persistence flow exists; this protects Joshua's private workspace and avoids implying files are durably stored.
- Route primary app chat through Google Gemini using a server-side `GEMINI_API_KEY`; keep provider credentials out of browser code so Joshua's key remains private.
- Keep Vite's optimized dependency modules out of the service-worker cache and version the app cache when changing its asset strategy; mixed stale module graphs can load duplicate React runtimes.