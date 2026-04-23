import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Convert base64 -> bytes safely (large input proof)
const decodeBase64 = (input: string) => {
  const cleaned = input.includes(',') ? input.split(',')[1] : input;
  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

// Convert bytes -> base64 in chunks (avoids "argument too large" stack overflow)
const encodeBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    const sub = bytes.subarray(i, Math.min(i + CHUNK, bytes.length));
    binary += String.fromCharCode.apply(null, Array.from(sub) as unknown as number[]);
  }
  return btoa(binary);
};

const normalizeMime = (mime: string, fileName: string) => {
  const lower = (mime || '').toLowerCase();
  const name = (fileName || '').toLowerCase();
  if (lower.includes('opus') || name.endsWith('.opus')) return 'audio/ogg';
  if (lower.includes('ogg') || name.endsWith('.ogg')) return 'audio/ogg';
  if (lower.includes('webm') || name.endsWith('.webm')) return 'audio/webm';
  if (lower.includes('mpeg') || lower.includes('mp3') || name.endsWith('.mp3')) return 'audio/mpeg';
  if (lower.includes('wav') || name.endsWith('.wav')) return 'audio/wav';
  if (lower.includes('m4a') || lower.includes('mp4') || name.endsWith('.m4a') || name.endsWith('.mp4')) return 'audio/mp4';
  return lower || 'audio/webm';
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audio, language, mimeType = 'audio/webm', fileName = 'audio.webm' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');
    if (!audio) throw new Error('No audio data received');

    const bytes = decodeBase64(audio);
    const base64Clean = encodeBase64(bytes);
    const finalMime = normalizeMime(mimeType, fileName);

    const langHint = language && language !== 'en'
      ? `The speaker is most likely speaking ${language === 'ha' ? 'Hausa' : language === 'pid' ? 'Nigerian Pidgin' : language === 'yo' ? 'Yoruba' : language === 'ig' ? 'Igbo' : language}. `
      : '';

    // Use Gemini multimodal audio understanding via Lovable AI Gateway
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
            content: 'You are a precise audio transcription engine. Output ONLY a JSON object matching this schema: {"text": string, "language": string, "segments": [{"start": number|null, "end": number|null, "text": string}]}. Preserve speaker meaning. If multiple speakers, prefix lines with "Speaker A:", "Speaker B:" inside text. No commentary outside JSON.',
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: `${langHint}Transcribe this audio cleanly. Break into short timestamped segments where possible (each ~5-15 seconds). Return JSON only.` },
              { type: 'image_url', image_url: { url: `data:${finalMime};base64,${base64Clean}` } },
            ],
          },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Transcription gateway error:', response.status, errorText);
      if (response.status === 429) throw new Error('Rate limit exceeded. Please try again in a moment.');
      if (response.status === 402) throw new Error('AI credits exhausted. Please add funds to continue.');
      throw new Error('Failed to transcribe audio');
    }

    const result = await response.json();
    const raw = result.choices?.[0]?.message?.content || '{}';
    let parsed: any = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { text: raw, segments: [] };
    }

    const segments = Array.isArray(parsed.segments)
      ? parsed.segments
          .filter((s: any) => s && typeof s.text === 'string' && s.text.trim())
          .map((s: any) => ({
            start: typeof s.start === 'number' ? s.start : null,
            end: typeof s.end === 'number' ? s.end : null,
            text: String(s.text).trim(),
          }))
      : [];

    return new Response(
      JSON.stringify({
        text: parsed.text || segments.map((s: any) => s.text).join(' '),
        transcriptSegments: segments,
        language: parsed.language || language || 'en',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Error in transcribe-audio function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
