import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// YarnGPT voice mapping for Nigerian context
const VOICE_MAPPING: Record<string, string> = {
  'en': 'Idera',          // Melodic, gentle - Nigerian English
  'ha': 'Zainab',         // Soothing, gentle - Hausa
  'pidgin': 'Tayo',       // Upbeat, energetic - Pidgin
  'en-us': 'Adam',        // Deep, clear - American English
  'formal': 'Emma',       // Authoritative - Formal contexts
  'casual': 'Wura',       // Young, sweet - Casual chat
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, language, register } = await req.json();
    const YARNGPT_API_KEY = Deno.env.get('YARNGPT_API_KEY');

    console.log(`YarnGPT TTS request - Language: ${language}, Register: ${register}, Text length: ${text?.length || 0}`);

    if (!YARNGPT_API_KEY) {
      console.error('YARNGPT_API_KEY is not configured');
      throw new Error('YARNGPT_API_KEY is not configured');
    }

    if (!text || text.trim().length === 0) {
      throw new Error('Text is required');
    }

    // Select voice based on register and language
    const voiceName = VOICE_MAPPING[register === 'formal-NSE' ? 'formal' : language] || 'Idera';
    
    console.log(`Using YarnGPT voice: ${voiceName}`);

    // Call YarnGPT API
    const response = await fetch('https://yarngpt.ai/api/v1/tts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${YARNGPT_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text.trim(),
        voice: voiceName,
        response_format: 'mp3',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('YarnGPT API error:', response.status, errorText);
      
      if (response.status === 401) {
        throw new Error('Invalid YarnGPT API key');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      
      throw new Error(`YarnGPT API error: ${response.status}`);
    }

    console.log('YarnGPT API response received, processing audio...');

    // Convert audio to base64 with chunked processing
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    const chunkSize = 32768;
    let base64Audio = '';
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      base64Audio += btoa(String.fromCharCode(...chunk));
    }

    console.log(`YarnGPT audio generated successfully. Size: ${base64Audio.length} bytes`);

    return new Response(
      JSON.stringify({ 
        audioContent: base64Audio,
        contentType: 'audio/mpeg',
        language,
        voice: voiceName,
        provider: 'yarngpt'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in yarngpt-tts function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
