# Hanchi Canvas and File Deliverables

Implement the first usable file-artifact experience in the existing chat without rebuilding Hanchi or changing its backend.

## Scope
- Replace the current full-screen Canvas with a responsive docked side panel that keeps chat visible.
- Let users edit generated text/code, switch between source and preview, and download with a useful filename/extension.
- Render Markdown as a readable document preview. Preview HTML only in a sandboxed iframe; do not execute arbitrary JavaScript/TypeScript or other code.
- Add Open in Canvas and direct download actions to fenced code blocks; allow assistant messages to open as Markdown files and remove the fake download action.
- Preserve chat streaming and existing route behavior; this is the artifact MVP, not the later connectors, debate engine, audio pipeline, or morning routine.

## Technical details
Update `CanvasMode`, `Index`, `MessageBubbleV2`, `MarkdownMessage`, and `CodeBlock`. Add a small shared artifact utility only if it avoids duplicated extension, filename, and MIME logic. Keep the layout responsive, ensure mobile Canvas can be dismissed, and do not introduce dependencies or persist files until a durable project-storage contract exists.

## Verification
Run the repository build and available lint checks, address only issues introduced by this slice, and report the exact checks performed. Authenticated live verification is unavailable unless a valid existing session is available; do not claim it was tested.
