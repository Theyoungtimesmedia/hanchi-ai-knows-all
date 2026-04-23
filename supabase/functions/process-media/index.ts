import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

async function transcribeWithGemini(LOVABLE_API_KEY: string, bytes: Uint8Array, mime: string, language: string) {
  const base64 = encodeBase64Chunked(bytes);
  const langHint = language && language !== 'en'
    ? `The speaker is most likely speaking ${language === 'ha' ? 'Hausa' : language === 'pid' ? 'Nigerian Pidgin' : language === 'yo' ? 'Yoruba' : language === 'ig' ? 'Igbo' : language}. `
    : '';

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        {
          role: 'system',
          content: 'You are a precise audio/video transcription engine. Output ONLY a JSON object: {"text": string, "language": string, "segments": [{"start": number|null, "end": number|null, "text": string}]}. Use short segments (5-15s). No commentary.',
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: `${langHint}Transcribe this media into clean timestamped segments. Return JSON only.` },
            { type: 'image_url', image_url: { url: `data:${mime};base64,${base64}` } },
          ],
        },
      ],
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('Gemini transcription error:', response.status, errText);
    if (response.status === 429) throw new Error('Rate limit exceeded.');
    if (response.status === 402) throw new Error('AI credits exhausted.');
    throw new Error(`Transcription failed (${response.status})`);
  }

  const data = await response.json();
  let parsed: any = {};
  try { parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}'); }
  catch { parsed = { text: data.choices?.[0]?.message?.content || '', segments: [] }; }

  const segments = normalizeSegments(parsed.segments || []);
  return {
    text: parsed.text || segments.map((s: any) => s.text).join(' '),
    language: parsed.language || language || 'en',
    segments,
  };
}

async function summarizeTranscript(LOVABLE_API_KEY: string, sourceLabel: string, transcript: string) {
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-3-flash-preview',
      messages: [
        { role: 'system', content: 'Summarize transcripts cleanly. Return markdown with two sections only: ## Summary and ## Key Points.' },
        { role: 'user', content: `Source: ${sourceLabel}\n\nTranscript:\n${transcript}` },
      ],
    }),
  });

  if (!response.ok) return '';
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

async function extractLinkTranscript(LOVABLE_API_KEY: string, FIRECRAWL_API_KEY: string | null, url: string) {
  if (!FIRECRAWL_API_KEY) {
    throw new Error('Link transcription needs the Firecrawl connector to be available.');
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

  const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-pro',
      messages: [
        {
          role: 'system',
          content: 'Extract transcript-like content from scraped YouTube, TikTok, or Facebook video pages. Return strict JSON with title, provider, transcript, summary, analysis, and transcriptSegments. transcriptSegments must be an array of objects with start, end, text. If exact timestamps are unavailable, use null for start/end and keep transcript text in order. Never invent dialogue not supported by the page.',
        },
        {
          role: 'user',
          content: `URL: ${url}\n\nPage content:\n${rawPageContent}`,
        },
      ],
      response_format: { type: 'json_object' },
    }),
  });

  if (!aiResponse.ok) {
    const errText = await aiResponse.text();
    throw new Error(`Failed to extract transcript from link (${aiResponse.status}): ${errText}`);
  }

  const aiData = await aiResponse.json();
  const parsed = JSON.parse(aiData.choices?.[0]?.message?.content || '{}');
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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    if (req.headers.get('content-type')?.includes('application/json')) {
      const { url, action = 'transcribe_link' } = await req.json();
      if (action === 'transcribe_link' && url) {
        const result = await extractLinkTranscript(LOVABLE_API_KEY, FIRECRAWL_API_KEY, url);
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

    // OCR - Image processing
    if (isImage || action === 'ocr') {
      const bytes = await file.arrayBuffer();
      const base64 = encodeBase64Chunked(new Uint8Array(bytes));
      const mimeType = fileType || 'image/jpeg';

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: 'You are an OCR and image analysis expert. Extract ALL text from the image accurately. If there is no text, describe the image in detail. For documents, preserve formatting and structure.' },
            { role: 'user', content: [
              { type: 'text', text: 'Extract all text from this image. If it\'s a document, preserve the structure. If no text, provide a detailed description.' },
              { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } }
            ]},
          ],
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('OCR error:', response.status, errText);
        if (response.status === 429) throw new Error('Rate limit exceeded. Please try again shortly.');
        if (response.status === 402) throw new Error('Service credits exhausted.');
        throw new Error(`OCR failed (${response.status})`);
      }

      const result = await response.json();
      return new Response(JSON.stringify({
        text: result.choices?.[0]?.message?.content || '',
        type: 'ocr',
        extractedText: result.choices?.[0]?.message?.content || '',
      }), { headers: jsonHeaders });
    }

    if (isDocument) {
      const extractedText = textDecoder.decode(await file.arrayBuffer());
      const summary = await summarizeTranscript(LOVABLE_API_KEY, fileName, extractedText.slice(0, 20000));
      return new Response(JSON.stringify({
        text: extractedText,
        extractedText,
        summary,
        type: 'document',
      }), { headers: jsonHeaders });
    }

    // Audio/Video transcription
    if (isAudio || isVideo) {
      if (action === 'transcribe' || action === 'analyze') {
        // Step 1: Transcribe with Whisper
        const apiFormData = new FormData();
        apiFormData.append('file', file, fileName);
        apiFormData.append('model', 'whisper-1');
        apiFormData.append('response_format', 'verbose_json');

        if (language && language !== 'en') {
          const langMap: Record<string, string> = { ha: 'ha', pid: 'en', yo: 'yo', ig: 'ig' };
          apiFormData.append('language', langMap[language] || language);
        }

        const transcribeRes = await fetch('https://ai.gateway.lovable.dev/v1/audio/transcriptions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}` },
          body: apiFormData,
        });

        if (!transcribeRes.ok) {
          const errText = await transcribeRes.text();
          console.error('Transcription error:', transcribeRes.status, errText);
          if (transcribeRes.status === 429) throw new Error('Rate limit exceeded.');
          if (transcribeRes.status === 402) throw new Error('Credits exhausted.');
          throw new Error(`Transcription failed (${transcribeRes.status})`);
        }

        const transcription = await transcribeRes.json();
        const transcriptSegments = normalizeSegments(transcription.segments || []);
        const summary = await summarizeTranscript(LOVABLE_API_KEY, fileName, transcription.text || '');

        if (action === 'transcribe') {
          return new Response(JSON.stringify({
            text: transcription.text,
            summary,
            transcriptSegments,
            type: 'transcription',
          }), { headers: jsonHeaders });
        }

        // Step 2: Analyze with AI
        const mediaType = isVideo ? 'video' : 'audio';
        const analysisRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: `You are an AI assistant analyzing transcribed ${mediaType} content. Provide a clear summary, key points, and any relevant insights. If content is in a Nigerian language, include both the original and English translation.` },
              { role: 'user', content: `Analyze this transcribed ${mediaType} content:\n\n"${transcription.text}"\n\nProvide: 1) Summary 2) Key points 3) Notable insights or action items.` },
            ],
            max_tokens: 2000,
          }),
        });

        if (!analysisRes.ok) {
          return new Response(JSON.stringify({ text: transcription.text, type: 'transcription', analysisError: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const analysis = await analysisRes.json();
        return new Response(JSON.stringify({
          text: transcription.text,
          summary,
          analysis: analysis.choices?.[0]?.message?.content || '',
          transcriptSegments,
          type: 'analysis',
        }), { headers: jsonHeaders });
      }
    }

    throw new Error(`Unsupported file type: ${fileType}. Supported: images, audio, video files.`);
  } catch (error) {
    console.error('Enhanced media processing error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500, headers: jsonHeaders });
  }
});
