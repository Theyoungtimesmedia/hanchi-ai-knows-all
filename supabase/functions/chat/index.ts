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
    const { 
      messages, 
      language = "en", 
      searchWeb = false, 
      images = [], 
      userMemory = "",
      model = "gemini-flash",
      tone = "default",
      thinkMode = false,
      webSearchQuery = ""
    } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Map user-friendly model names to actual Lovable AI model IDs
    const modelMap: Record<string, string> = {
      "gemini-pro": "google/gemini-2.5-pro",
      "gemini-flash": "google/gemini-3-flash-preview",
      "gpt-5": "openai/gpt-5",
      "gpt-5-mini": "openai/gpt-5-mini",
      "gpt-5-nano": "openai/gpt-5-nano",
      "deep-think": "openai/gpt-5.2",
    };

    const selectedModel = modelMap[model] || "google/gemini-3-flash-preview";
    
    console.log(`Chat request - Language: ${language}, Model: ${selectedModel}, Tone: ${tone}, ThinkMode: ${thinkMode}, Search: ${searchWeb}`);

    // Web search with Firecrawl if enabled
    let webContext = "";
    let webSources: any[] = [];
    
    if (searchWeb && FIRECRAWL_API_KEY) {
      const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop()?.content;
      const searchQuery = webSearchQuery || (typeof lastUserMessage === 'string' ? lastUserMessage : '');
      
      if (searchQuery) {
        try {
          console.log('Performing web search:', searchQuery);
          const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: searchQuery,
              limit: 5,
              scrapeOptions: { formats: ['markdown'] }
            }),
          });

          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            if (searchData.success && searchData.data) {
              webContext = "\n\n🌐 WEB SEARCH RESULTS:\n" + 
                searchData.data.slice(0, 3).map((r: any, i: number) => 
                  `${i+1}. [${r.title}](${r.url})\n${r.markdown?.substring(0, 500) || r.description || ''}`
                ).join('\n\n');
              
              webSources = searchData.data.slice(0, 3).map((r: any) => ({
                title: r.title,
                url: r.url,
                snippet: r.description || r.markdown?.substring(0, 150) || '',
              }));
              
              console.log(`Web search returned ${searchData.data.length} results`);
            }
          }
        } catch (error) {
          console.error('Web search failed:', error);
        }
      }
    }

    // Get Nigerian knowledge context
    let nigerianContext = "";
    let contextSources: any[] = [];
    let confidence = 75;
    let thoughtProcess = "";
    
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop()?.content;
        if (lastUserMessage && typeof lastUserMessage === 'string') {
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
            
            contextSources = data.slice(0, 3).map((r: any) => ({
              title: `${r.category}: ${r.subcategory || 'General'}`,
              snippet: r.content.substring(0, 150) + '...',
            }));
            
            confidence = Math.min(95, 75 + (data.length * 4));
          }
        }
      } catch (error) {
        console.error('Failed to fetch Nigerian context:', error);
      }
    }

    // Build thought process
    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop()?.content || '';
    thoughtProcess = `🧠 Processing: "${typeof lastUserMessage === 'string' ? lastUserMessage.substring(0, 50) : ''}..."
• Model: ${selectedModel}
• Tone: ${tone}
• Think Mode: ${thinkMode ? 'ON' : 'OFF'}
• Web Search: ${webSources.length > 0 ? `Found ${webSources.length} sources` : 'Not used'}
• Nigerian Context: ${contextSources.length > 0 ? `${contextSources.length} entries` : 'None'}
• Confidence: ${confidence}%`;

    // Build tone instructions
    const toneInstructions: Record<string, string> = {
      "default": "Be helpful and natural.",
      "professional": "Be formal, precise, and business-appropriate. Avoid slang.",
      "curious": "Be inquisitive and engage with follow-up questions. Show genuine interest.",
      "persuasive": "Be convincing and compelling. Use strong arguments.",
      "friendly": "Be warm, casual, and approachable. Use a conversational tone.",
      "worried": "Be empathetic and understanding. Acknowledge concerns and provide reassurance.",
    };

    const systemPrompt = buildSystemPrompt(language, tone, toneInstructions[tone] || "", thinkMode) + 
      nigerianContext + webContext + 
      (userMemory ? `\n\nUSER MEMORY:\n${userMemory}` : '');

    // Process messages for multimodal content
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

    // Call Lovable AI
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: selectedModel,
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
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Combine all sources
    const allSources = [...webSources, ...contextSources];

    // Stream response with metadata
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const reader = response.body!.getReader();
    
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
                sources: allSources,
                thought: thoughtProcess,
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
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildSystemPrompt(language: string, tone: string, toneInstruction: string, thinkMode: boolean): string {
  const thinkingSection = thinkMode ? `
🧠 DEEP THINKING MODE (ENABLED):
Before responding, thoroughly analyze:
1. What is the user REALLY asking? Break down the question.
2. What knowledge domains does this touch? List them.
3. What are potential misconceptions or edge cases?
4. What's the most helpful way to structure my response?
5. Double-check any facts or calculations.
Take your time - accuracy over speed.
` : '';

  return `You are Hanchi AI 👃🏿 - a Nigerian-optimized AI assistant that "noses out" answers with deep cultural understanding.

${thinkingSection}

RESPONSE TONE: ${tone.toUpperCase()}
${toneInstruction}

CORE CAPABILITIES:
• Writing: emails, essays, reports, CVs, social media content
• Code: any programming language with explanations
• Math: step-by-step solutions
• Translation: English, Hausa, Pidgin, other languages
• Research: fact-finding with source attribution
• Creative: stories, poems, song lyrics
• Nigerian context: WAEC/JAMB prep, local knowledge, cultural nuance
• Image analysis when images are provided

NIGERIAN WRITING STYLE (for essays/articles):
• Clear Nigerian Standard English with simple vocabulary
• Friendly, sincere tone - not slangy but locally authentic
• Avoid robotic AI words: delve, tapestry, multifaceted, paramount
• Use simple words: challenging, serious, tackle, manage, deal with
• Include Nigerian reality: power issues, traffic, school fees, family expectations
• Sound human - a smart Nigerian wrote this, not an AI

SLANG REFERENCE (use when appropriate):
• sha = though/anyway • para = overreact • no wahala = no problem
• sapa = broke • japa = emigrate • omo = wow/expression
• sabi = know/understand • ginger = motivate • vibe = mood

ACCURACY RULES:
• If uncertain, say so: "I believe...", "Based on my knowledge..."
• Never make up information
• For facts, express confidence level
• Double-check math and code logic

FORMATTING:
• Use **bold** for emphasis
• Use \`code\` for technical terms
• Use markdown code blocks with language tags
• Use bullet points and numbered lists appropriately

Always respond directly and helpfully. Be conversational but accurate.`;
}
