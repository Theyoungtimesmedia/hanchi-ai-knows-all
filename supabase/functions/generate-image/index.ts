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
    const { prompt, style = "default", size = "1024x1024", isSticker = false, stickerType = "auto" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!prompt) {
      throw new Error("Prompt is required");
    }

    console.log(`Image generation request - Prompt: "${prompt.substring(0, 50)}...", Style: ${style}, Sticker: ${isSticker}, StickerType: ${stickerType}`);

    // Build enhanced prompt based on style
    let enhancedPrompt = prompt;
    
    if (style === "nigerian") {
      enhancedPrompt = `${prompt}, Nigerian style, vibrant colors, African aesthetic, Nigerian cultural elements, high quality`;
    } else if (style === "nigerian_sticker" || (isSticker && style === "sticker")) {
      // Nigerian WhatsApp sticker generation - enhanced for authentic Nigerian memes
      const isPepeStyle = stickerType === "pepe" || 
        (stickerType === "auto" && (
          prompt.toLowerCase().includes("pepe") || 
          prompt.toLowerCase().includes("frog") ||
          prompt.toLowerCase().includes("comrade")
        ));
      
      if (isPepeStyle) {
        // Nigerian Pepe the Frog meme style - based on viral Nigerian WhatsApp stickers
        enhancedPrompt = `Create a high-quality Nigerian WhatsApp meme sticker in the "Comrade Pepe" style:

VISUAL STYLE:
- Pepe the Frog character (green cartoon frog with distinctive bulging eyes and wide mouth)
- Human body wearing Nigerian attire (agbada, dashiki, or casual Nigerian outfit)
- Expressive exaggerated facial expression matching: "${prompt}"
- Bold, readable Impact or Arial Black font text overlay
- Clean white or solid color background (not transparent)
- 512x512 pixel sticker format

EXPRESSION/MOOD:
- Nigerian meme humor style - relatable, ironic, self-deprecating
- Reference Nigerian internet culture: "Comrade why??", "God when?", "Sapa"
- Expression should be dramatic and exaggerated like Nollywood reactions

TECHNICAL:
- High contrast, clear outlines
- Bold black text with white outline for readability
- Professional meme quality like popular Nigerian WhatsApp stickers`;
      } else {
        // Authentic Nigerian meme sticker style
        enhancedPrompt = `Create an authentic Nigerian WhatsApp meme sticker:

VISUAL STYLE:
- Feature a realistic Nigerian person OR expressive cartoon character
- Dramatic, exaggerated facial expression matching: "${prompt}"
- Style reference: Nollywood reaction memes, Nigerian Twitter memes
- Bold Impact font text overlay with the phrase/caption

CULTURAL ELEMENTS:
- Use authentic Nigerian expressions: "No wahala", "E choke", "Ehen!", "Na wa o", "Sapa", "Mumu"
- Relatable Nigerian scenarios (NEPA, fuel scarcity, Lagos traffic, sapa season)
- Nigerian humor style: ironic, self-deprecating, witty commentary

TECHNICAL REQUIREMENTS:
- 512x512 pixel WhatsApp sticker format
- Clean background (white or solid color)
- High contrast, readable text with black font + white outline
- Professional quality like viral Nigerian memes
- Expressive, relatable, shareable design`;
      }
    } else if (style === "sticker" || isSticker) {
      enhancedPrompt = `${prompt}, WhatsApp sticker format, cartoon style, simple clean design, bold outlines, expressive, transparent background, 512x512 pixels, high quality, vibrant colors`;
    } else if (style === "professional") {
      enhancedPrompt = `${prompt}, professional, high quality, clean, modern design, photorealistic`;
    } else if (style === "creative") {
      enhancedPrompt = `${prompt}, creative, artistic, imaginative, unique style, vibrant`;
    }

    // Use Lovable AI with Gemini image model
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: enhancedPrompt
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`Image generation failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("Image generation response received");

    // Extract the image from the response
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const textResponse = data.choices?.[0]?.message?.content || "Image generated successfully!";

    if (!imageUrl) {
      throw new Error("No image generated");
    }

    return new Response(
      JSON.stringify({
        success: true,
        image_url: imageUrl,
        message: textResponse,
        prompt: enhancedPrompt,
        style,
        isSticker,
        stickerType,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Image generation error:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
