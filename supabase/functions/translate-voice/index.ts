import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getProviderError, openAIChatCompletion } from "../_shared/openai.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, sourceLang, targetLang } = await req.json();
    
    if (!text || !sourceLang || !targetLang) {
      throw new Error('Missing required parameters');
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const translationResponse = await openAIChatCompletion({
      apiKey: OPENAI_API_KEY,
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a Nigerian language translator. Translate accurately between English, Hausa, and Nigerian Pidgin. Preserve cultural context and idioms where appropriate. Only return the translated text, nothing else.',
        },
        {
          role: 'user',
          content: `Translate from ${sourceLang} to ${targetLang}: ${text}`,
        },
      ],
      temperature: 0.3,
    });

    if (!translationResponse.ok) {
      throw new Error(await getProviderError(translationResponse));
    }

    const translationData = await translationResponse.json();
    const translatedText = translationData.choices[0].message.content;

    return new Response(
      JSON.stringify({ translatedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Translation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Translation failed';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
