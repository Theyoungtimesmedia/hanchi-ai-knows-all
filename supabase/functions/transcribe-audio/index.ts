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
    const { audio, language, mimeType = 'audio/webm', fileName = 'audio.webm' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const decodeBase64 = (input: string) => {
      const cleaned = input.includes(',') ? input.split(',')[1] : input;
      const binary = atob(cleaned);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return bytes;
    };

    const binaryAudio = decodeBase64(audio);
    
    const formData = new FormData();
    const audioBlob = new Blob([binaryAudio], { type: mimeType });
    formData.append('file', audioBlob, fileName);
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'verbose_json');
    
    // Add language hint if available
    if (language && language !== 'en') {
      formData.append('language', language === 'ha' ? 'ha' : 'en');
    }

    // Use Lovable AI gateway for transcription
    const response = await fetch('https://ai.gateway.lovable.dev/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Transcription API error:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      }
      if (response.status === 402) {
        throw new Error('Credits exhausted. Please add funds to continue.');
      }
      
      throw new Error('Failed to transcribe audio');
    }

    const result = await response.json();
    const segments = Array.isArray(result.segments)
      ? result.segments.map((segment: any) => ({
          start: segment.start,
          end: segment.end,
          text: segment.text,
        }))
      : [];

    return new Response(
      JSON.stringify({ text: result.text, transcriptSegments: segments, language: result.language }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in transcribe-audio function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
