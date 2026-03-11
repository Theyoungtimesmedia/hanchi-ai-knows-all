import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const action = formData.get('action') as string || 'transcribe';
    const language = formData.get('language') as string || 'en';

    if (!file) throw new Error('No file provided');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const fileType = file.type;
    const fileName = file.name || 'media';
    const isAudio = fileType.startsWith('audio/') || fileName.endsWith('.opus') || fileName.endsWith('.ogg');
    const isVideo = fileType.startsWith('video/');
    const isImage = fileType.startsWith('image/');

    // OCR - Image processing
    if (isImage || action === 'ocr') {
      const bytes = await file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(bytes)));
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
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Audio/Video transcription
    if (isAudio || isVideo) {
      if (action === 'transcribe' || action === 'analyze') {
        // Step 1: Transcribe with Whisper
        const apiFormData = new FormData();
        apiFormData.append('file', file, fileName);
        apiFormData.append('model', 'whisper-1');

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

        if (action === 'transcribe') {
          return new Response(JSON.stringify({
            text: transcription.text,
            type: 'transcription',
          }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
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
          analysis: analysis.choices?.[0]?.message?.content || '',
          type: 'analysis',
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    throw new Error(`Unsupported file type: ${fileType}. Supported: images, audio, video files.`);
  } catch (error) {
    console.error('Enhanced media processing error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
