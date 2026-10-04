const extensions: Record<string, string> = {
  html: "html", htm: "html", svg: "svg", css: "css", scss: "scss",
  javascript: "js", js: "js", typescript: "ts", ts: "ts", tsx: "tsx", jsx: "jsx",
  json: "json", markdown: "md", md: "md", python: "py", py: "py",
  bash: "sh", sh: "sh", sql: "sql", yaml: "yml", yml: "yml", xml: "xml",
  java: "java", c: "c", cpp: "cpp", go: "go", rust: "rs", ruby: "rb",
};

const mimeTypes: Record<string, string> = {
  html: "text/html;charset=utf-8", svg: "image/svg+xml;charset=utf-8",
  css: "text/css;charset=utf-8", json: "application/json;charset=utf-8",
  pdf: "application/pdf", md: "text/markdown;charset=utf-8",
};

export const artifactExtension = (language: string, type: "code" | "document") => {
  const normalized = language.trim().toLowerCase();
  return extensions[normalized] || (type === "document" ? "md" : "txt");
};

export const safeArtifactFilename = (name: string, extension: string) => {
  const safeName = name
    .trim()
    .replace(/\.[a-z0-9]{1,8}$/i, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "hanchi-file";
  return `${safeName}.${extension}`;
};

export const downloadArtifact = (content: string, filename: string, extension: string) => {
  const blob = new Blob([content], { type: mimeTypes[extension] || "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};