# Project Engineering Rules

- Treat generated artifact previews as untrusted content: render HTML only in an isolated sandboxed iframe, never execute other generated code, and keep artifact edits local until an explicit save/persistence flow exists; this protects Joshua's private workspace and avoids implying files are durably stored.
- Route primary app chat through Google Gemini using a server-side `GEMINI_API_KEY`; keep provider credentials out of browser code so Joshua's key remains private.