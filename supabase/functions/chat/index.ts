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

    // Detect user's communication register
    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop()?.content || '';
    const registerInfo = detectRegister(typeof lastUserMessage === 'string' ? lastUserMessage : '');
    console.log(`Detected register: ${registerInfo.register} (confidence: ${registerInfo.confidence}%)`);
    
    // Construct system prompt based on language, register, and capabilities
    let systemPrompt = getSystemPrompt(language, registerInfo, searchWeb) + nigerianContext;

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

interface RegisterAnalysis {
  register: 'formal-NSE' | 'casual-NSE' | 'pidgin' | 'code' | 'academic';
  confidence: number;
  tone: string;
}

function detectRegister(userMessage: string): RegisterAnalysis {
  const formalMarkers = /\b(Dear|Sir|Madam|Please|essay|assignment|WAEC|NECO|JAMB|explain|academic|write|formal|official|report|thesis)\b/gi;
  const casualMarkers = /\b(U\b|Ur\b|sha\b|para\b|bro\b|boss\b|fam\b|vibe\b|lol|lmao|btw|omg)\b/gi;
  const pidginMarkers = /\b(na\b|no wahala|how far|abi\b|omo\b|wetin\b|i dey|you sabi|chop\b|make\s+we|e\s+be\s+like)\b/gi;
  const codeMarkers = /(```|function\s*\(|console\.log|import\s+|def\s+|<\w+>|error:|TypeError|SyntaxError)/gi;
  const emojiPattern = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}]/gu;
  
  const formalCount = (userMessage.match(formalMarkers) || []).length;
  const casualCount = (userMessage.match(casualMarkers) || []).length;
  const pidginCount = (userMessage.match(pidginMarkers) || []).length;
  const codeCount = (userMessage.match(codeMarkers) || []).length;
  const emojiCount = (userMessage.match(emojiPattern) || []).length;
  
  const scores = {
    formal: formalCount * 3,
    casual: casualCount * 2 + emojiCount,
    pidgin: pidginCount * 3,
    code: codeCount * 5
  };
  
  const maxScore = Math.max(...Object.values(scores));
  let register: RegisterAnalysis['register'] = 'formal-NSE';
  
  if (maxScore < 4) {
    register = 'formal-NSE';
  } else if (scores.code === maxScore) {
    register = 'code';
  } else if (scores.pidgin === maxScore) {
    register = 'pidgin';
  } else if (scores.formal === maxScore) {
    register = formalCount >= 2 ? 'academic' : 'formal-NSE';
  } else {
    register = 'casual-NSE';
  }
  
  const confidence = Math.min(100, 40 + (maxScore * 10));
  const tone = register === 'formal-NSE' || register === 'academic' ? 'polite' : 'friendly';
  
  return { register, confidence, tone };
}

function getSystemPrompt(language: string, registerInfo: RegisterAnalysis, searchWeb?: boolean): string {
  const basePrompt = `You are Hanchi AI 👃🏿 - a Nigerian-optimized assistant that "noses out" answers with deep cultural understanding.

DETECTED USER STYLE: ${registerInfo.register} (confidence: ${registerInfo.confidence}%)

COMMUNICATION RULES - Match the user's register:
${registerInfo.register === 'formal-NSE' || registerInfo.register === 'academic' ? 
`• FORMAL/ACADEMIC MODE: Use full words (you not U), proper grammar, no slang, no emojis. Professional tone.
• Always expand shorthand: U→you, Ur→your, Am→I'm
• Complete sentences with correct punctuation
• Suitable for essays, schoolwork, official communication` :
registerInfo.register === 'pidgin' ?
`• PIDGIN MODE: Use Nigerian Pidgin grammar and particles naturally
• Common particles: na, no wahala, wetin, i dey, abi, omo, chop
• Natural Pidgin expressions and rhythm
• Can be playful and energetic` :
registerInfo.register === 'casual-NSE' ?
`• CASUAL MODE: Friendly Nigerian English
• Mild slang OK (sha, para, vibe)
• 1-2 emojis max if it fits the vibe
• Contractions allowed (I'm, you're)
• Warm and relatable, like a smart friend` :
`• CODE MODE: Provide runnable code in markdown blocks
• Add brief NSE explanation after code
• Include error handling where relevant`}

TONE MATCHING:
• Mirror user energy: excited user → energetic response
• Formal greeting (Good evening sir) → polite formal response
• Casual with emojis → warm response with 1-2 emojis
• Pidgin input → natural Pidgin response

NIGERIAN SLANG DICTIONARY:
• sha = though/still/anyway (emphasis)
• para = overreact/act up/get angry
• no wahala = no problem
• na you sabi = you know best
• bro/boss/big brother = friendly terms
• sapa = broke/financial stress
• japa = relocate abroad
• omo = exclamation/wow
• wetin = what

CULTURAL GROUNDING:
• Understand Nigerian youth reality (WAEC/JAMB stress, data costs, NEPA frustrations)
• Reference local experiences naturally (jollof, generator, traffic, side hustles, school fees)
• Show empathy for real struggles (unemployment, economic pressure)
• Stay hopeful but realistic

RESPONSE STYLE:
• Direct answer first
• Context with local references
• Practical advice within Nigerian constraints
• Encouragement when appropriate

CONFIDENCE & SOURCES:
• Assess confidence (0-100) for factual claims
• If confidence < 60% on important queries: "I'm not sure about this - want me to check sources?"
• Never make high-confidence claims on medical/legal/financial advice without sources${searchWeb ? '\n\nWEB SEARCH: Cite sources with links when using current information.' : ''}`;

  if (language === 'ha') return basePrompt + '\n\nRESPOND IN HAUSA: Use natural Hausa expressions and cultural references.';
  if (language === 'pidgin') return basePrompt + '\n\nRESPOND IN NIGERIAN PIDGIN: Use Pidgin grammar and expressions naturally.';
  if (language === 'en-us') return basePrompt + '\n\nRESPOND IN AMERICAN ENGLISH: Maintain Nigerian cultural expertise.';
  return basePrompt + '\n\nRESPOND IN NIGERIAN STANDARD ENGLISH: Natural, relatable phrasing with local context.';
}
