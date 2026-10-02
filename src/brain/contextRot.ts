import type { BrainLayer, BrainRecordType } from "./types";

export const CONTEXT_ROT_RULES = [
  "Use high-signal context normally.",
  "Search historical context only when the user asks about the past, a date, a contradiction or missing project history.",
  "Historical context never silently overrides current confirmed information.",
  "Preserve source, chronology, provenance and uncertainty labels.",
] as const;

export const chunkSourceText = (text: string, size = 6000) => {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];
  const chunks: string[] = [];
  for (let index = 0; index < normalized.length; index += size) chunks.push(normalized.slice(index, index + size));
  return chunks;
};

export const classifyImportedChunk = (content: string): { layer: BrainLayer; record_type: BrainRecordType } => {
  const lower = content.toLowerCase();
  if (lower.includes("needs verification") || lower.includes("uncertain") || lower.includes("historical")) return { layer: "context_rot", record_type: "source_chunk" };
  return { layer: "context_rot", record_type: "source_chunk" };
};