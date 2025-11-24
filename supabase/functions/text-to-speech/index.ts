import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Voice mapping for different languages
const VOICE_MAPPING: Record<string, string> = {
  'en': 'Aria', // Nigerian English
  'ha': 'Aria', // Hausa (use closest voice)
  'pidgin': 'Aria', // Pidgin (use Nigerian accent)
  'en-us': 'Sarah', // American English
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, language } = await req.json();
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');

    console.log(`TTS request - Language: ${language}, Text length: ${text?.length || 0}`);

    if (!ELEVENLABS_API_KEY) {
      console.error('ELEVENLABS_API_KEY is not configured');
      throw new Error('ELEVENLABS_API_KEY is not configured');
    }

    if (!text || text.trim().length === 0) {
      console.error('No text provided for TTS');
      throw new Error('Text is required');
    }

    const voiceName = VOICE_MAPPING[language] || 'Aria';
    const voiceId = getVoiceId(voiceName);
    
    console.log(`Using voice: ${voiceName} (${voiceId})`);

    // Call ElevenLabs API with improved error handling
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      
      // Provide more specific error messages
      if (response.status === 401) {
        throw new Error('Invalid ElevenLabs API key');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (response.status === 400) {
        throw new Error('Invalid request to ElevenLabs API');
      }
      
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    console.log('ElevenLabs API response received, processing audio...');

    // Convert audio to base64 with chunked processing for large files
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Process in chunks to avoid memory issues
    const chunkSize = 32768;
    let base64Audio = '';
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      base64Audio += btoa(String.fromCharCode(...chunk));
    }

    console.log(`Audio generated successfully. Size: ${base64Audio.length} bytes`);

    return new Response(
      JSON.stringify({ 
        audioContent: base64Audio,
        contentType: 'audio/mpeg',
        language: language,
        voice: voiceName
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in text-to-speech function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// ElevenLabs voice IDs
function getVoiceId(voiceName: string): string {
  const voices: Record<string, string> = {
    'Aria': '9BWtsMINqrJLrRacOk9x',
    'Sarah': 'EXAVITQu4vr4xnSDxMaL',
    'Roger': 'CwhRBWXzGAHq8TQ4Fs17',
  };
  return voices[voiceName] || voices['Aria'];
}
