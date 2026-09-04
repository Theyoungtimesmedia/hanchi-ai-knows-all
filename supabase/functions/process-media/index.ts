import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getProviderError, openAIChatCompletion, openAITranscription } from "../_shared/openai.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };

const textDecoder = new TextDecoder();

const normalizeSegments = (segments: any[] = []) => segments
  .filter((segment) => segment?.text)
  .map((segment) => ({ start: segment.start ?? null, end: segment.end ?? null, text: String(segment.text) }));

const encodeBase64Chunked = (bytes: Uint8Array): string => {
  let binary = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    const sub = bytes.subarray(i, Math.min(i + CHUNK, bytes.length));
    binary += String.fromCharCode.apply(null, Array.from(sub) as unknown as number[]);
  }
  return btoa(binary);
};

const normalizeAudioMime = (mime: string, fileName: string) => {
  const lower = (mime || '').toLowerCase();
  const name = (fileName || '').toLowerCase();
  if (lower.includes('opus') || name.endsWith('.opus')) return 'audio/ogg';
  if (lower.includes('ogg') || name.endsWith('.ogg')) return 'audio/ogg';
  if (lower.includes('webm') || name.endsWith('.webm')) return 'audio/webm';
  if (lower.includes('mpeg') || lower.includes('mp3') || name.endsWith('.mp3')) return 'audio/mpeg';
  if (lower.includes('wav') || name.endsWith('.wav')) return 'audio/wav';
  if (lower.includes('m4a') || name.endsWith('.m4a')) return 'audio/mp4';
  if (lower.includes('mp4') || name.endsWith('.mp4')) return 'video/mp4';
  return lower || 'audio/webm';
};

/** Transcribe audio/video with Whisper on the user-owned OpenAI account. */
async function transcribeMedia(apiKey: string, bytes: Uint8Array, mime: string, fileName: string, language: string) {
  const response = await openAITranscription({ apiKey, bytes, mimeType: mime, fileName, language });

  if (!response.ok) {
    const message = await getProviderError(response);
    console.error('Transcription error:', response.status, message);
    if (response.status === 429) throw new Error('Rate limit exceeded. Please try again shortly.');
    throw new Error(message);
  }

  const data = await response.json();
  const segments = normalizeSegments(data.segments || []);
  return {
    text: data.text || segments.map((s: any) => s.text).join(' '),
    language: data.language || language || 'en',
    segments,
  };
}

async function summarizeTranscript(apiKey: string, sourceLabel: string, transcript: string) {
  const response = await openAIChatCompletion({
    apiKey,
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Summarize transcripts cleanly. Return markdown with two sections only: ## Summary and ## Key Points.' },
      { role: 'user', content: `Source: ${sourceLabel}\n\nTranscript:\n${transcript}` },
    ],
    maxTokens: 800,
  });

  if (!response.ok) return '';
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

async function extractLinkTranscript(apiKey: string, FIRECRAWL_API_KEY: string | null, url: string) {
  if (!FIRECRAWL_API_KEY) {
    throw new Error('Link transcription needs FIRECRAWL_API_KEY to be configured.');
  }

  const scrapeResponse = await fetch('https://api.firecrawl.dev/v2/scrape', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
      formats: ['markdown', 'html', 'summary'],
      onlyMainContent: true,
      waitFor: 2000,
    }),
  });

  if (!scrapeResponse.ok) {
    const errText = await scrapeResponse.text();
    throw new Error(`Could not inspect link (${scrapeResponse.status}): ${errText}`);
  }

  const scrapeData = await scrapeResponse.json();
  const page = scrapeData.data || scrapeData;
  const rawPageContent = [page.summary, page.markdown, page.html].filter(Boolean).join('\n\n');
  const title = page.metadata?.title || page.title || 'Untitled video';

  const aiResponse = await openAIChatCompletion({
    apiKey,
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'Extract transcript-like content from scraped YouTube, TikTok, or Facebook video pages. Return strict JSON with title, provider, transcript, summary, analysis, and transcriptSegments. transcriptSegments must be an array of objects with start, end, text. If exact timestamps are unavailable, use null for start/end and keep transcript text in order. Never invent dialogue not supported by the page.',
      },
      {
        role: 'user',
        content: `URL: ${url}\n\nPage content:\n${rawPageContent.slice(0, 40000)}`,
      },
    ],
    responseFormat: { type: 'json_object' },
  });

  if (!aiResponse.ok) {
    const message = await getProviderError(aiResponse);
    throw new Error(`Failed to extract transcript from link: ${message}`);
  }

  const aiData = await aiResponse.json();
  let parsed: any = {};
  try { parsed = JSON.parse(aiData.choices?.[0]?.message?.content || '{}'); } catch { parsed = {}; }

  return {
    title: parsed.title || title,
    provider: parsed.provider || new URL(url).hostname,
    text: parsed.transcript || '',
    summary: parsed.summary || page.summary || '',
    analysis: parsed.analysis || '',
    transcriptSegments: normalizeSegments(parsed.transcriptSegments),
    sourceUrl: url,
    type: 'link',
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not configured');

    if (req.headers.get('content-type')?.includes('application/json')) {
      const { url, action = 'transcribe_link' } = await req.json();
      if (action === 'transcribe_link' && url) {
        const result = await extractLinkTranscript(OPENAI_API_KEY, FIRECRAWL_API_KEY, url);
        return new Response(JSON.stringify(result), { headers: jsonHeaders });
      }
      throw new Error('Unsupported JSON request');
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const action = formData.get('action') as string || 'transcribe';
    const language = formData.get('language') as string || 'en';

    if (!file) throw new Error('No file provided');

    const fileType = file.type;
    const fileName = file.name || 'media';
    const isAudio = fileType.startsWith('audio/') || fileName.endsWith('.opus') || fileName.endsWith('.ogg');
    const isVideo = fileType.startsWith('video/');
    const isImage = fileType.startsWith('image/');
    const isDocument = fileType.startsWith('text/') || ['application/json', 'text/csv'].includes(fileType) || /\.(txt|md|json|csv)$/i.test(fileName);

    // OCR / image understanding
    if (isImage || action === 'ocr') {
      const bytes = await file.arrayBuffer();
      const base64 = encodeBase64Chunked(new Uint8Array(bytes));
      const mimeType = fileType || 'image/jpeg';

      const response = await openAIChatCompletion({
        apiKey: OPENAI_API_KEY,
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are an OCR and image analysis expert. Extract ALL text from the image accurately. If there is no text, describe the image in detail. For documents, preserve formatting and structure.' },
          { role: 'user', content: [
            { type: 'text', text: 'Extract all text from this image. If it\'s a document, preserve the structure. If no text, provide a detailed description.' },
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } }
          ]},
        ],
        maxTokens: 4000,
      });

      if (!response.ok) {
        const message = await getProviderError(response);
        console.error('OCR error:', response.status, message);
        if (response.status === 429) throw new Error('Rate limit exceeded. Please try again shortly.');
        throw new Error(message);
      }

      const result = await response.json();
      const text = result.choices?.[0]?.message?.content || '';
      return new Response(JSON.stringify({ text, type: 'ocr', extractedText: text }), { headers: jsonHeaders });
    }

    if (isDocument) {
      const extractedText = textDecoder.decode(await file.arrayBuffer());
      const summary = await summarizeTranscript(OPENAI_API_KEY, fileName, extractedText.slice(0, 20000));
      return new Response(JSON.stringify({
        text: extractedText,
        extractedText,
        summary,
        type: 'document',
      }), { headers: jsonHeaders });
    }

    // Audio/video transcription via Whisper
    if (isAudio || isVideo) {
      if (action === 'transcribe' || action === 'analyze') {
        const audioBuf = await file.arrayBuffer();
        const audioBytes = new Uint8Array(audioBuf);
        const audioMime = normalizeAudioMime(fileType, fileName);

        const transcription = await transcribeMedia(OPENAI_API_KEY, audioBytes, audioMime, fileName, language);
        const summary = await summarizeTranscript(OPENAI_API_KEY, fileName, transcription.text);

        if (action === 'transcribe') {
          return new Response(JSON.stringify({
            text: transcription.text,
            summary,
            transcriptSegments: transcription.segments,
            language: transcription.language,
            type: 'transcription',
          }), { headers: jsonHeaders });
        }

        const mediaType = isVideo ? 'video' : 'audio';
        const analysisRes = await openAIChatCompletion({
          apiKey: OPENAI_API_KEY,
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: `You are an AI assistant analyzing transcribed ${mediaType} content. Provide a clear summary, key points, and relevant insights. If content is in a Nigerian language, include both original and English translation.` },
            { role: 'user', content: `Analyze this transcribed ${mediaType} content:\n\n"${transcription.text}"\n\nProvide: 1) Summary 2) Key points 3) Notable insights or action items.` },
          ],
          maxTokens: 2000,
        });

        if (!analysisRes.ok) {
          return new Response(JSON.stringify({
            text: transcription.text,
            transcriptSegments: transcription.segments,
            type: 'transcription',
            analysisError: true,
          }), { headers: jsonHeaders });
        }

        const analysis = await analysisRes.json();
        return new Response(JSON.stringify({
          text: transcription.text,
          summary,
          analysis: analysis.choices?.[0]?.message?.content || '',
          transcriptSegments: transcription.segments,
          language: transcription.language,
          type: 'analysis',
        }), { headers: jsonHeaders });
      }
    }

    throw new Error(`Unsupported file type: ${fileType}. Supported: images, audio, video, and text documents.`);
  } catch (error) {
    console.error('Media processing error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500, headers: jsonHeaders });
  }
});
