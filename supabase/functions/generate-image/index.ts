import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Poll Replicate API for completion
async function pollForCompletion(pollUrl: string, apiKey: string, maxAttempts = 60): Promise<any> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetch(pollUrl, {
      headers: { 
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
    });
    
    if (!response.ok) {
      throw new Error(`Polling failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Poll attempt ${attempt + 1}: status = ${data.status}`);
    
    if (data.status === "succeeded") {
      return data.output;
    }
    
    if (data.status === "failed" || data.status === "canceled") {
      throw new Error(data.error || "Image generation failed");
    }
    
    // Wait 1 second before next poll
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  throw new Error("Image generation timed out");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, style = "default", size = "1024x1024", isSticker = false, stickerType = "auto" } = await req.json();
    const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!prompt) {
      throw new Error("Prompt is required");
    }

    console.log(`Image generation request - Prompt: "${prompt.substring(0, 50)}...", Style: ${style}, Sticker: ${isSticker}`);

    // Build enhanced prompt based on style
    let enhancedPrompt = prompt;
    
    if (style === "nigerian") {
      enhancedPrompt = `${prompt}, Nigerian style, vibrant colors, African aesthetic, Nigerian cultural elements, high quality, detailed`;
    } else if (style === "nigerian_sticker" || (isSticker && style === "sticker")) {
      const isPepeStyle = stickerType === "pepe" || 
        (stickerType === "auto" && (
          prompt.toLowerCase().includes("pepe") || 
          prompt.toLowerCase().includes("frog") ||
          prompt.toLowerCase().includes("comrade")
        ));
      
      if (isPepeStyle) {
        enhancedPrompt = `Nigerian WhatsApp meme sticker, Pepe the Frog character wearing Nigerian agbada or dashiki, expressive face showing "${prompt}", bold Impact font text, white background, 512x512, high contrast, meme style`;
      } else {
        enhancedPrompt = `Nigerian WhatsApp meme sticker, expressive cartoon character, "${prompt}", bold text overlay, Nigerian humor style, clean white background, 512x512, high quality meme`;
      }
    } else if (style === "sticker" || isSticker) {
      enhancedPrompt = `${prompt}, WhatsApp sticker format, cartoon style, simple clean design, bold outlines, expressive, white background, 512x512 pixels, high quality, vibrant colors`;
    } else if (style === "professional") {
      enhancedPrompt = `${prompt}, professional photography, high quality, clean composition, modern design, photorealistic, 8k`;
    } else if (style === "creative") {
      enhancedPrompt = `${prompt}, creative artistic style, imaginative, unique, vibrant colors, digital art, highly detailed`;
    }

    // Try Replicate API first (Stability AI SDXL)
    if (REPLICATE_API_KEY) {
      try {
        console.log("Using Replicate API with Stability AI SDXL...");
        
        // Start the prediction
        const predictionResponse = await fetch("https://api.replicate.com/v1/predictions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${REPLICATE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b", // SDXL
            input: {
              prompt: enhancedPrompt,
              negative_prompt: "blurry, low quality, distorted, ugly, bad anatomy, watermark, signature",
              width: isSticker ? 512 : 1024,
              height: isSticker ? 512 : 1024,
              num_outputs: 1,
              scheduler: "K_EULER",
              num_inference_steps: 25,
              guidance_scale: 7.5,
            },
          }),
        });

        if (!predictionResponse.ok) {
          const errorText = await predictionResponse.text();
          console.error("Replicate prediction error:", errorText);
          throw new Error(`Replicate API error: ${predictionResponse.status}`);
        }

        const prediction = await predictionResponse.json();
        console.log("Prediction started:", prediction.id);
        
        // Get the polling URL from the response
        const pollUrl = prediction.urls?.get;
        if (!pollUrl) {
          throw new Error("No polling URL returned from Replicate");
        }
        
        // Poll for completion
        const output = await pollForCompletion(pollUrl, REPLICATE_API_KEY);
        
        if (!output || output.length === 0) {
          throw new Error("No image generated from Replicate");
        }

        const imageUrl = Array.isArray(output) ? output[0] : output;
        console.log("Image generated successfully via Replicate");

        return new Response(
          JSON.stringify({
            success: true,
            image_url: imageUrl,
            message: "Image generated with Stability AI SDXL! 🎨",
            prompt: enhancedPrompt,
            style,
            isSticker,
            provider: "replicate"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (replicateError) {
        console.error("Replicate API failed, falling back to Lovable AI:", replicateError);
      }
    }

    // Fallback to Lovable AI with Gemini image model
    if (!LOVABLE_API_KEY) {
      throw new Error("No image generation API configured. Please add REPLICATE_API_KEY or ensure LOVABLE_API_KEY is available.");
    }

    console.log("Using Lovable AI for image generation...");
    
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
      console.error("Lovable AI error:", response.status, errorText);
      throw new Error(`Image generation failed: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const textResponse = data.choices?.[0]?.message?.content || "Image generated successfully!";

    if (!imageUrl) {
      throw new Error("No image generated from Lovable AI");
    }

    return new Response(
      JSON.stringify({
        success: true,
        image_url: imageUrl,
        message: textResponse,
        prompt: enhancedPrompt,
        style,
        isSticker,
        provider: "lovable"
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
