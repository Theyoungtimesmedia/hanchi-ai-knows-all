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
    const { messages, language = "en", searchWeb = false } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Construct system prompt based on language and capabilities
    let systemPrompt = getSystemPrompt(language);

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
          ...messages,
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

function getSystemPrompt(language: string): string {
  const basePrompt = `You are Hanchi AI - a highly intelligent, multilingual assistant that "noses out" answers with precision and warmth. You are knowledgeable, friendly, and culturally aware.

Core capabilities:
- Answer questions with accuracy and clarity
- Translate between English and Hausa
- Process and analyze images
- Help with coding and technical problems
- Tell jokes and engage in conversation
- Assist with assignments and research

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
