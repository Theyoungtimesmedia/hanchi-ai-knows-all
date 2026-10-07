import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

export type HanchiMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at?: string;
  metadata?: Record<string, unknown> | null;
};

export type HanchiArtifact = {
  id: string;
  title: string;
  file_name: string;
  mime_type: string;
  language?: string | null;
  content: string;
  version: number;
  artifact_type: string;
  preview_mode: string;
  metadata?: Record<string, unknown> | null;
  project_id?: string | null;
  conversation_id?: string | null;
  updated_at?: string;
};

export async function getSessionToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export async function edgeRequest<T = unknown>(functionName: string, init: RequestInit = {}): Promise<T> {
  const token = await getSessionToken();
  if (!token) throw new Error("Your Hanchi session has expired. Please sign in again.");

  const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(init.headers ?? {}),
    },
  });

  const text = await response.text();
  let payload: any = null;
  try { payload = text ? JSON.parse(text) : null; } catch { payload = text; }

  if (!response.ok) {
    const message = payload?.error || payload?.message || (typeof payload === "string" ? payload : `Request failed (${response.status})`);
    throw new Error(message);
  }
  return payload as T;
}

export async function streamChat(
  body: Record<string, unknown>,
  onDelta: (chunk: string) => void,
  onMetadata?: (metadata: Record<string, unknown>) => void,
) {
  const token = await getSessionToken();
  if (!token) throw new Error("Your Hanchi session has expired. Please sign in again.");

  const response = await fetch(`${SUPABASE_URL}/functions/v1/chat`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok || !response.body) {
    const text = await response.text();
    let payload: any = null;
    try { payload = text ? JSON.parse(text) : null; } catch {}
    throw new Error(payload?.error || text || `Chat request failed (${response.status})`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const raw = line.slice(5).trim();
      if (!raw || raw === "[DONE]") continue;
      try {
        const event = JSON.parse(raw);
        const delta = event?.choices?.[0]?.delta?.content;
        if (typeof delta === "string" && delta) onDelta(delta);
        if (event?.metadata && typeof event.metadata === "object") onMetadata?.(event.metadata);
      } catch {}
    }
  }
}

export function downloadTextFile(fileName: string, content: string, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName || "hanchi-file.txt";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function extractCodeArtifacts(markdown: string) {
  const results: Array<{ language: string; content: string; fileName: string }> = [];
  const regex = /```([\w+-]*)\n([\s\S]*?)```/g;
  const extensionByLanguage: Record<string, string> = {
    html: "html", css: "css", javascript: "js", js: "js", typescript: "ts", ts: "ts",
    tsx: "tsx", jsx: "jsx", python: "py", py: "py", json: "json", sql: "sql",
    bash: "sh", sh: "sh", markdown: "md", md: "md",
  };
  let match: RegExpExecArray | null;
  let index = 1;
  while ((match = regex.exec(markdown)) !== null) {
    const language = match[1] || "text";
    const extension = extensionByLanguage[language.toLowerCase()] || "txt";
    results.push({ language, content: match[2].replace(/\n$/, ""), fileName: `hanchi-artifact-${index}.${extension}` });
    index += 1;
  }
  return results;
}

export function artifactFromCodeBlock(language: string, content: string, title?: string): HanchiArtifact {
  const normalized = language.toLowerCase();
  const map: Record<string, string> = {
    html: "html", css: "css", js: "js", javascript: "js", ts: "ts", typescript: "ts",
    tsx: "tsx", jsx: "jsx", json: "json", py: "py", python: "py", sql: "sql", md: "md", markdown: "md", sh: "sh", bash: "sh",
  };
  const extension = map[normalized] || "txt";
  const previewMode = normalized === "html" ? "html" : normalized === "md" || normalized === "markdown" ? "markdown" : "code";
  return {
    id: `local-${Date.now()}`,
    title: title || `Hanchi ${normalized || "text"} artifact`,
    file_name: `hanchi-${Date.now()}.${extension}`,
    mime_type: previewMode === "html" ? "text/html" : previewMode === "markdown" ? "text/markdown" : "text/plain",
    language: language || "text",
    content,
    version: 1,
    artifact_type: "generated",
    preview_mode: previewMode,
  };
}
