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
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  throw new Error("Image generation timed out");
}

// Search Giphy for stickers/GIFs
async function searchGiphy(query: string, apiKey: string, type: "stickers" | "gifs" = "stickers"): Promise<any> {
  const endpoint = type === "stickers" 
    ? "https://api.giphy.com/v1/stickers/search"
    : "https://api.giphy.com/v1/gifs/search";
  
  const url = `${endpoint}?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=10&rating=pg-13`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Giphy API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.data || [];
}

// Get trending stickers from Giphy
async function getTrendingGiphy(apiKey: string, type: "stickers" | "gifs" = "stickers"): Promise<any> {
  const endpoint = type === "stickers"
    ? "https://api.giphy.com/v1/stickers/trending"
    : "https://api.giphy.com/v1/gifs/trending";
  
  const url = `${endpoint}?api_key=${apiKey}&limit=10&rating=pg-13`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Giphy API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.data || [];
}

// Model configurations for different styles
const MODEL_CONFIGS: Record<string, { version: string; name: string; params?: any }> = {
  "sdxl": {
    version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
    name: "Stability AI SDXL",
    params: { scheduler: "K_EULER", num_inference_steps: 25, guidance_scale: 7.5 }
  },
  "sdxl-turbo": {
    version: "a00d0b7dcbb9c3fbb34ba87d2d5b46c56969c84a628bf778a7fdaec30b1b99c5",
    name: "SDXL Turbo",
    params: { num_inference_steps: 4, guidance_scale: 0 }
  },
  "anime": {
    version: "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
    name: "Anime Diffusion",
    params: { scheduler: "K_EULER_ANCESTRAL", num_inference_steps: 30, guidance_scale: 7 }
  },
  "dreamshaper": {
    version: "ed6d8bee9a278b0d7125872bddfb9dd3f9aab6e8a75c3cb3c2c03a9d7c27a8f2",
    name: "DreamShaper",
    params: { scheduler: "DPMSolverMultistep", num_inference_steps: 30, guidance_scale: 7.5 }
  },
  "realistic": {
    version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
    name: "Realistic Vision",
    params: { scheduler: "DPMSolverMultistep", num_inference_steps: 30, guidance_scale: 7 }
  },
  "flux": {
    version: "f2ab8a5bfe79f02f0789a146cf5e73d2a4ff2684a98c2b303d1e1ff3814271db",
    name: "Flux",
    params: { num_inference_steps: 28, guidance_scale: 3.5 }
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      prompt, 
      style = "default", 
      model = "sdxl",
      size = "1024x1024", 
      isSticker = false, 
      stickerType = "auto",
      useGiphy = false,
      giphyType = "stickers"
    } = await req.json();
    
    const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const GIPHY_API_KEY = Deno.env.get("GIPHY_API_KEY");
    
    if (!prompt) {
      throw new Error("Prompt is required");
    }

    console.log(`Image request - Prompt: "${prompt.substring(0, 50)}...", Style: ${style}, Model: ${model}, Sticker: ${isSticker}, UseGiphy: ${useGiphy}`);

    // If Giphy mode is enabled, search for stickers/GIFs
    if (useGiphy && GIPHY_API_KEY) {
      try {
        console.log(`Searching Giphy for: ${prompt}`);
        let giphyResults = await searchGiphy(prompt, GIPHY_API_KEY, giphyType as "stickers" | "gifs");
        
        // If no results, try trending
        if (giphyResults.length === 0) {
          console.log("No Giphy results, getting trending...");
          giphyResults = await getTrendingGiphy(GIPHY_API_KEY, giphyType as "stickers" | "gifs");
        }
        
        if (giphyResults.length > 0) {
          // Pick a random result from top 5
          const randomIndex = Math.floor(Math.random() * Math.min(5, giphyResults.length));
          const selected = giphyResults[randomIndex];
          
          return new Response(
            JSON.stringify({
              success: true,
              image_url: selected.images?.original?.url || selected.images?.fixed_height?.url,
              preview_url: selected.images?.preview_gif?.url || selected.images?.fixed_height_small?.url,
              webp_url: selected.images?.original?.webp || selected.images?.fixed_height?.webp,
              message: `Found "${selected.title}" from Giphy! 🎉`,
              prompt,
              style,
              isSticker: true,
              provider: "giphy",
              giphy_id: selected.id,
              giphy_url: selected.url,
              all_results: giphyResults.slice(0, 5).map((g: any) => ({
                id: g.id,
                title: g.title,
                url: g.images?.original?.url || g.images?.fixed_height?.url,
                preview: g.images?.preview_gif?.url || g.images?.fixed_height_small?.url
              }))
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } catch (giphyError) {
        console.error("Giphy search failed:", giphyError);
        // Continue to AI generation as fallback
      }
    }

    // Build enhanced prompt based on style
    let enhancedPrompt = prompt;
    let negativePrompt = "blurry, low quality, distorted, ugly, bad anatomy, watermark, signature, text errors";
    
    switch (style) {
      case "nigerian":
        enhancedPrompt = `${prompt}, professional Nigerian style, vibrant Ankara patterns, African aesthetic, Nigerian cultural elements, Lagos cityscape, colorful, ultra high quality, photorealistic, detailed`;
        break;
      
      case "nigerian_meme":
        // Mature, realistic Nigerian meme style - not cartoonish
        enhancedPrompt = `Ultra realistic Nigerian meme image, photorealistic style, ${prompt}, authentic Nigerian context, natural lighting, high resolution, professional photography quality, real human expressions, genuine emotion, viral meme potential, sharp details, modern Nigerian urban setting`;
        negativePrompt = "cartoon, anime, illustrated, childish, low quality, blurry, distorted, unrealistic";
        break;
      
      case "nollywood":
        enhancedPrompt = `${prompt}, Nollywood movie poster style, dramatic lighting, Nigerian actors aesthetic, cinematic composition, bold colors, professional movie poster quality, 4K, dramatic`;
        break;
      
      case "sticker":
        enhancedPrompt = `${prompt}, WhatsApp sticker format, clean professional design, solid white background, high contrast, clear edges, modern illustration style, 512x512 pixels, high quality, sharp details`;
        negativePrompt = "realistic photo, complex background, low quality";
        break;
      
      case "anime":
        enhancedPrompt = `${prompt}, anime style, manga art, Japanese animation, vibrant colors, detailed, studio ghibli quality, beautiful lighting, masterpiece, 4K`;
        negativePrompt = "realistic, western cartoon, low quality, blurry";
        break;
      
      case "midjourney":
        enhancedPrompt = `${prompt}, highly detailed, intricate, elegant, sharp focus, artstation trending, concept art, digital painting, dramatic lighting, 8k, masterpiece, cinematic, volumetric lighting`;
        negativePrompt = "simple, flat, low detail, amateur";
        break;
      
      case "dalle":
        enhancedPrompt = `${prompt}, digital art, trending on artstation, highly detailed, vibrant colors, creative, imaginative, professional quality, 4K`;
        break;
      
      case "realistic":
        enhancedPrompt = `${prompt}, photorealistic, professional photography, high resolution, ultra detailed, natural lighting, 8k, ultra HD, DSLR quality`;
        negativePrompt = "cartoon, anime, illustration, drawing, painting, artificial";
        break;
      
      case "professional":
        enhancedPrompt = `${prompt}, professional photography, high quality, clean composition, modern design, photorealistic, studio lighting, 8k, commercial quality`;
        break;
      
      case "cinematic":
        enhancedPrompt = `${prompt}, cinematic photography, movie still, dramatic lighting, anamorphic lens, film grain, color grading, 35mm film, blockbuster movie quality, epic composition`;
        break;
      
      case "portrait":
        enhancedPrompt = `${prompt}, professional portrait photography, studio lighting, shallow depth of field, high resolution, beautiful skin tones, magazine quality, 8k`;
        break;
      
      case "creative":
        enhancedPrompt = `${prompt}, creative artistic style, imaginative, unique, vibrant colors, digital art, highly detailed, surreal, award-winning`;
        break;
      
      case "cartoon":
        enhancedPrompt = `${prompt}, cartoon style, colorful, fun, animated, pixar style, 3d render, professional animation quality`;
        negativePrompt = "realistic, scary, dark, low quality";
        break;
      
      case "oil_painting":
        enhancedPrompt = `${prompt}, oil painting, classical art, Renaissance style, rich colors, textured brushstrokes, museum quality, masterpiece, gallery worthy`;
        break;
      
      case "watercolor":
        enhancedPrompt = `${prompt}, watercolor painting, soft colors, artistic, flowing, delicate, paper texture, beautiful, professional artist quality`;
        break;
      
      case "pixel_art":
        enhancedPrompt = `${prompt}, pixel art, 16-bit, retro game style, nostalgic, colorful pixels, game sprite, professional pixel art`;
        negativePrompt = "realistic, high resolution, blurry, 3d";
        break;
      
      case "3d_render":
        enhancedPrompt = `${prompt}, 3D render, octane render, unreal engine 5, cinema 4d, high quality, realistic lighting, detailed, 8K resolution`;
        break;
      
      case "cyberpunk":
        enhancedPrompt = `${prompt}, cyberpunk style, neon lights, futuristic city, sci-fi, blade runner aesthetic, purple and cyan colors, high tech, rain, reflections, detailed, 8K`;
        negativePrompt = "natural, organic, vintage, old, rural";
        break;
      
      case "vintage":
        enhancedPrompt = `${prompt}, vintage style, retro aesthetic, 1970s photography, warm tones, film grain, nostalgic, sepia undertones, kodak film`;
        negativePrompt = "modern, digital, futuristic, sharp, clean";
        break;
      
      case "neon":
        enhancedPrompt = `${prompt}, neon glow, vibrant neon colors, glowing lights, dark background, synthwave aesthetic, electric, high contrast, cinematic`;
        break;
      
      case "minimalist":
        enhancedPrompt = `${prompt}, minimalist design, clean lines, simple shapes, white space, modern aesthetic, elegant simplicity, professional`;
        negativePrompt = "complex, detailed, busy, cluttered, noisy";
        break;
      
      default:
        enhancedPrompt = `${prompt}, high quality, detailed, professional, 4K, sharp`;
    }

    // Determine dimensions
    const width = isSticker ? 512 : 1024;
    const height = isSticker ? 512 : 1024;

    // Try Replicate API with selected model
    if (REPLICATE_API_KEY) {
      try {
        const modelConfig = MODEL_CONFIGS[model] || MODEL_CONFIGS["sdxl"];
        console.log(`Using Replicate with ${modelConfig.name}...`);
        
        const predictionResponse = await fetch("https://api.replicate.com/v1/predictions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${REPLICATE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            version: modelConfig.version,
            input: {
              prompt: enhancedPrompt,
              negative_prompt: negativePrompt,
              width,
              height,
              num_outputs: 1,
              ...modelConfig.params
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
        
        const pollUrl = prediction.urls?.get;
        if (!pollUrl) {
          throw new Error("No polling URL returned from Replicate");
        }
        
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
            message: `Image generated with ${modelConfig.name}! 🎨`,
            prompt: enhancedPrompt,
            style,
            model,
            isSticker,
            provider: "replicate"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (replicateError) {
        console.error("Replicate API failed:", replicateError);
      }
    }

    // Fallback to Lovable AI
    if (!LOVABLE_API_KEY) {
      throw new Error("No image generation API configured. Please add REPLICATE_API_KEY.");
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
        messages: [{ role: "user", content: enhancedPrompt }],
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
      throw new Error(`Image generation failed: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      throw new Error("No image generated from Lovable AI");
    }

    return new Response(
      JSON.stringify({
        success: true,
        image_url: imageUrl,
        message: "Image generated with Gemini! 🎨",
        prompt: enhancedPrompt,
        style,
        model: "gemini",
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
