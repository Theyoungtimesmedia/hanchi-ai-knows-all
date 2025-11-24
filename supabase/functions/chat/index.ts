import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language = "en", searchWeb = false, images = [] } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Chat request - Language: ${language}, Search: ${searchWeb}, Images: ${images.length}`);

    // Get relevant Nigerian context using full-text search
    let nigerianContext = "";
    let contextSources: any[] = [];
    let confidence = 70; // Default confidence
    
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop()?.content;
        if (lastUserMessage && typeof lastUserMessage === 'string') {
          console.log('Fetching Nigerian context...');
          
          const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.39.3');
          const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
          
          const { data, error } = await supabase.rpc('match_nigerian_knowledge', {
            search_query: lastUserMessage,
            match_count: 5,
            filter_language: language
          });

          if (!error && data && data.length > 0) {
            nigerianContext = "\n\nRELEVANT NIGERIAN CONTEXT:\n" + 
              data.map((r: any, i: number) => `${i+1}. [${r.category}] ${r.content}`).join('\n');
            
            // Store sources for later
            contextSources = data.slice(0, 3).map((r: any) => ({
              title: `${r.category}: ${r.subcategory || 'General'}`,
              snippet: r.content.substring(0, 150) + '...',
              timestamp: r.updated_at || r.created_at,
            }));
            
            // Increase confidence if we found relevant context
            confidence = Math.min(85, 70 + (data.length * 3));
            
            console.log(`Added ${data.length} context entries, confidence: ${confidence}%`);
          }
        }
      } catch (error) {
        console.error('Failed to fetch Nigerian context:', error);
      }
    }

    // Construct system prompt based on language and capabilities
    let systemPrompt = getSystemPrompt(language, searchWeb) + nigerianContext;

    // Process messages to handle multimodal content (images)
    const processedMessages = messages.map((msg: any) => {
      if (images && images.length > 0 && msg.role === 'user') {
        return {
          role: msg.role,
          content: [
            { type: 'text', text: msg.content },
            ...images.map((img: string) => ({
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${img}` }
            }))
          ]
        };
      }
      return msg;
    });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...processedMessages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to continue." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create a TransformStream to inject metadata at the end
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const reader = response.body!.getReader();
    
    // Stream the response and add metadata at the end
    (async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            // Inject metadata before [DONE]
            const metadataEvent = `data: ${JSON.stringify({
              choices: [{ delta: {} }],
              metadata: {
                confidence,
                sources: contextSources,
              }
            })}\n\n`;
            await writer.write(new TextEncoder().encode(metadataEvent));
            await writer.write(new TextEncoder().encode("data: [DONE]\n\n"));
            break;
          }
          await writer.write(value);
        }
      } catch (error) {
        console.error('Streaming error:', error);
      } finally {
        writer.close();
      }
    })();

    return new Response(readable, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function getSystemPrompt(language: string, searchWeb?: boolean): string {
  const basePrompt = `You are Hanchi AI 👃🏿 - a Nigerian-optimized assistant that "noses out" answers.

COMMUNICATION: Be warm and conversational like a knowledgeable Nigerian friend. Use "you" not "one". Acknowledge real challenges (NEPA, sapa, traffic) while staying hopeful. Reference local experiences naturally (jollof, generator, side hustles).

CULTURAL GROUNDING: You understand Nigerian youth culture, education stress (WAEC/JAMB), digital reality (WhatsApp, data costs), and socio-economic context. You know about side hustle mentality, japa dreams, and infrastructure constraints.

RESPONSE STYLE: Direct answer first, then context with local references, practical advice within Nigerian constraints, encouragement when appropriate.

SOURCES & CONFIDENCE: When providing factual information, assess your confidence level (0-100). If you use specific sources from the Nigerian context provided, note them internally.${searchWeb ? '\n\nWEB SEARCH: Cite sources when using current information.' : ''}`;

  if (language === 'ha') return basePrompt + '\n\nRESPOND IN HAUSA: Use appropriate Hausa greetings and cultural references.';
  if (language === 'pidgin') return basePrompt + '\n\nRESPOND IN NIGERIAN PIDGIN: Use natural Pidgin expressions.';
  if (language === 'en-us') return basePrompt + '\n\nRESPOND IN AMERICAN ENGLISH: Maintain Nigerian cultural expertise.';
  return basePrompt + '\n\nRESPOND IN NIGERIAN STANDARD ENGLISH: Natural, relatable phrasing.';
}
