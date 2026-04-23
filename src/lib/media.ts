export interface TranscriptSegment {
  start?: number | null;
  end?: number | null;
  text: string;
}

export interface ProcessedMediaContext {
  text: string;
  summary?: string;
  analysis?: string;
  type: 'transcription' | 'analysis' | 'ocr' | 'document' | 'link';
  fileName?: string;
  fileType?: string;
  title?: string;
  provider?: string;
  sourceUrl?: string;
  transcriptSegments?: TranscriptSegment[];
  extractedText?: string;
}

const SUPPORTED_MEDIA_HOSTS = [
  'youtube.com',
  'www.youtube.com',
  'youtu.be',
  'm.youtube.com',
  'tiktok.com',
  'www.tiktok.com',
  'vm.tiktok.com',
  'facebook.com',
  'www.facebook.com',
  'fb.watch',
  'm.facebook.com',
];

export const detectSupportedMediaUrl = (input: string): string | null => {
  const match = input.match(/https?:\/\/[^\s]+/i);
  if (!match) return null;

  try {
    const url = new URL(match[0]);
    return SUPPORTED_MEDIA_HOSTS.includes(url.hostname) ? match[0] : null;
  } catch {
    return null;
  }
};

export const formatTimestamp = (seconds?: number | null): string => {
  if (seconds === undefined || seconds === null || Number.isNaN(seconds)) {
    return '--:--';
  }

  const totalSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hours > 0) {
    return [hours, minutes, secs].map((part, index) => index === 0 ? String(part) : String(part).padStart(2, '0')).join(':');
  }

  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export const formatTranscriptSegments = (segments?: TranscriptSegment[]): string => {
  if (!segments?.length) return '';

  return segments
    .filter((segment) => segment.text?.trim())
    .map((segment) => `- [${formatTimestamp(segment.start)}] ${segment.text.trim()}`)
    .join('\n');
};

export const buildStructuredMediaMessage = (media: ProcessedMediaContext): string => {
  const sourceLine = media.sourceUrl
    ? `URL: ${media.sourceUrl}`
    : `File: ${media.fileName || 'Untitled file'}`;

  const transcriptBlock = formatTranscriptSegments(media.transcriptSegments) || media.text.trim();

  return [
    `Please work from this processed media context and keep your reply organised.`,
    ``,
    `## Source`,
    `- ${sourceLine}`,
    media.title ? `- Title: ${media.title}` : null,
    media.provider ? `- Provider: ${media.provider}` : null,
    media.fileType ? `- Type: ${media.fileType}` : null,
    ``,
    `## Extracted Transcript`,
    transcriptBlock || `- No transcript text was extracted.`,
    ``,
    media.extractedText && media.extractedText !== media.text ? `## Extracted Text\n${media.extractedText}\n` : null,
    media.summary ? `## Processing Summary\n${media.summary}\n` : null,
    media.analysis ? `## Processing Notes\n${media.analysis}\n` : null,
    `## Reply Format`,
    `Respond in exactly these sections:`,
    `1. **Timed Transcript Cleanup** — show a clean readable transcript using timestamps if available.`,
    `2. **Summary** — concise overview of the content.`,
    `3. **Key Points** — main ideas, claims, or action items in bullets.`,
    `4. **Questions / Gaps** — anything unclear, missing, or worth checking.`,
    ``,
    `Do not skip sections. If timing is incomplete, say that clearly instead of inventing exact times.`,
  ].filter(Boolean).join('\n');
};