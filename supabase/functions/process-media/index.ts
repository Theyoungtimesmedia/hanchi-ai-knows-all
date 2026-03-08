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
    const action = formData.get('action') as string || 'transcribe'; // transcribe | analyze
    const language = formData.get('language') as string || 'en';

    if (!file) {
      throw new Error('No file provided');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const fileType = file.type;
    const isAudio = fileType.startsWith('audio/');
    const isVideo = fileType.startsWith('video/');

    if (!isAudio && !isVideo) {
      throw new Error(`Unsupported file type: ${fileType}. Only audio and video files are supported.`);
    }

    // For transcription, use Whisper via Lovable AI gateway
    if (action === 'transcribe') {
      const apiFormData = new FormData();
      apiFormData.append('file', file, file.name || 'media.webm');
      apiFormData.append('model', 'whisper-1');

      // Add language hint
      if (language && language !== 'en') {
        const langMap: Record<string, string> = { ha: 'ha', pid: 'en', yo: 'yo', ig: 'ig' };
        apiFormData.append('language', langMap[language] || language);
      }

      const response = await fetch('https://ai.gateway.lovable.dev/v1/audio/transcriptions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}` },
        body: apiFormData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Transcription API error:', response.status, errorText);
        if (response.status === 429) throw new Error('Rate limit exceeded. Please try again shortly.');
        if (response.status === 402) throw new Error('Service credits exhausted.');
        throw new Error(`Transcription failed (${response.status})`);
      }

      const result = await response.json();
      return new Response(
        JSON.stringify({ text: result.text, type: 'transcription' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For analysis, transcribe first then send to LLM
    if (action === 'analyze') {
      // Step 1: Transcribe
      const apiFormData = new FormData();
      apiFormData.append('file', file, file.name || 'media.webm');
      apiFormData.append('model', 'whisper-1');

      const transcribeRes = await fetch('https://ai.gateway.lovable.dev/v1/audio/transcriptions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}` },
        body: apiFormData,
      });

      if (!transcribeRes.ok) {
        throw new Error('Failed to transcribe media for analysis');
      }

      const transcription = await transcribeRes.json();

      // Step 2: Analyze with LLM
      const analysisRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
              content: 'You are an AI assistant analyzing transcribed audio/video content. Provide a clear summary, key points, and any relevant insights. If the content is in a Nigerian language, include both the original and English translation.',
            },
            {
              role: 'user',
              content: `Please analyze this transcribed ${isVideo ? 'video' : 'audio'} content:\n\n"${transcription.text}"\n\nProvide: 1) A summary 2) Key points 3) Any notable insights or action items.`,
            },
          ],
          max_tokens: 2000,
        }),
      });

      if (!analysisRes.ok) {
        // Fall back to just returning transcription
        return new Response(
          JSON.stringify({ text: transcription.text, type: 'transcription', analysisError: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const analysis = await analysisRes.json();
      const analysisText = analysis.choices?.[0]?.message?.content || '';

      return new Response(
        JSON.stringify({
          text: transcription.text,
          analysis: analysisText,
          type: 'analysis',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error) {
    console.error('Error in process-media:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
