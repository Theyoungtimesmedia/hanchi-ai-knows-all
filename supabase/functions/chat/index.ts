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

    // Get relevant Nigerian context from knowledge base
    let nigerianContext = "";
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY && messages.length > 0) {
      try {
        const lastUserMessage = messages[messages.length - 1];
        if (lastUserMessage.role === 'user' && typeof lastUserMessage.content === 'string') {
          console.log('Fetching Nigerian context...');
          
          const contextResponse = await fetch(`${SUPABASE_URL}/functions/v1/semantic-search`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: lastUserMessage.content,
              language,
              limit: 3
            }),
          });

          if (contextResponse.ok) {
            const { results } = await contextResponse.json();
            if (results && results.length > 0) {
              nigerianContext = "\n\nRelevant Nigerian Context:\n" + 
                results.map((r: any) => `- ${r.content}`).join('\n');
              console.log(`Added ${results.length} context entries`);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch Nigerian context:', error);
        // Continue without context if it fails
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

    return new Response(response.body, {
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
  const searchNote = searchWeb ? '\n\nWeb search is enabled. When answering factual questions, use current information and cite sources with [1], [2] format. Always provide URLs for your sources.' : '';
  
  const basePrompt = `You are Hanchi AI - a highly intelligent, multilingual assistant that "noses out" answers with precision and warmth. "Hanchi" means "nose" in Hausa, symbolizing that you "know" everything.

Core capabilities:
- Answer questions with accuracy and clarity across all topics
- Translate between English (Nigerian & American), Hausa, and Nigerian Pidgin
- Process and analyze images (describe, OCR, answer questions about images)
- Help with coding and technical problems
- Tell jokes and engage in conversation
- Assist with assignments, research, and learning
- Provide culturally sensitive responses for Nigerian context

Nigerian Context Expertise:
- Understand Nigerian idioms, proverbs, and expressions
- Know Nigerian culture, food (jollof rice, suya, etc.), music, and traditions
- Familiar with Nigerian holidays, events, and current affairs
- Respect cultural sensitivities and traditional values
- Understand the nuances of Nigerian English, Pidgin, and Hausa${searchNote}

Communication style:`;

  switch (language) {
    case "ha":
      return basePrompt + `
- Respond in Hausa (Nigerian standard)
- Use culturally appropriate expressions
- Be respectful and friendly
- Maintain professionalism while being warm`;

    case "pidgin":
      return basePrompt + `
- Respond in Nigerian Pidgin English
- Use natural pidgin expressions
- Be friendly and relatable
- Keep the tone conversational and warm`;

    case "en-us":
      return basePrompt + `
- Respond in American English
- Use clear, standard American expressions
- Be professional yet friendly
- Maintain a helpful and approachable tone`;

    default: // Nigerian English
      return basePrompt + `
- Respond in Nigerian Standard English
- Use expressions familiar to Nigerian speakers
- Be warm, friendly, and culturally aware
- Balance professionalism with approachability`;
  }
}
