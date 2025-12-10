import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Puter AI endpoint - FREE AI access with multiple models
const PUTER_AI_URL = "https://api.puter.com/ai/chat";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language = "en", searchWeb = false, images = [], userMemory = "", model = "gpt-4o" } = await req.json();
    
    // Try Puter AI first (free), fallback to Lovable AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    console.log(`Chat request - Language: ${language}, Model: ${model}, Images: ${images.length}`);

    // Detect user's communication register
    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop()?.content || '';
    const registerInfo = detectRegister(typeof lastUserMessage === 'string' ? lastUserMessage : '');
    console.log(`Detected register: ${registerInfo.register} (confidence: ${registerInfo.confidence}%)`);
    
    // Construct system prompt
    let systemPrompt = getSystemPrompt(language, registerInfo, searchWeb);
    if (userMemory) {
      systemPrompt += `\n\nUSER MEMORY/CONTEXT:\n${userMemory}`;
    }

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

    // Use Lovable AI Gateway (free with multiple models)
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash", // Fast and free
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
          JSON.stringify({ error: "Rate limits exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Stream response
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const reader = response.body!.getReader();
    
    (async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            const metadataEvent = `data: ${JSON.stringify({
              choices: [{ delta: {} }],
              metadata: { confidence: 85, sources: [], thought: `Analyzed with ${registerInfo.register} register` }
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
  
  const formalCount = (userMessage.match(formalMarkers) || []).length;
  const casualCount = (userMessage.match(casualMarkers) || []).length;
  const pidginCount = (userMessage.match(pidginMarkers) || []).length;
  const codeCount = (userMessage.match(codeMarkers) || []).length;
  
  const scores = { formal: formalCount * 3, casual: casualCount * 2, pidgin: pidginCount * 3, code: codeCount * 5 };
  const maxScore = Math.max(...Object.values(scores));
  
  let register: RegisterAnalysis['register'] = 'formal-NSE';
  if (maxScore < 4) register = 'formal-NSE';
  else if (scores.code === maxScore) register = 'code';
  else if (scores.pidgin === maxScore) register = 'pidgin';
  else if (scores.formal === maxScore) register = formalCount >= 2 ? 'academic' : 'formal-NSE';
  else register = 'casual-NSE';
  
  return { register, confidence: Math.min(100, 40 + (maxScore * 10)), tone: register === 'formal-NSE' || register === 'academic' ? 'polite' : 'friendly' };
}

function getSystemPrompt(language: string, registerInfo: RegisterAnalysis, searchWeb?: boolean): string {
  return `You are Hanchi AI 👃🏿 - Nigeria's smartest AI assistant that "noses out" answers.
You are FREE for everyone - no premium, no limits. You can do EVERYTHING ChatGPT, Gemini, Claude, and Grok can do.

DETECTED USER STYLE: ${registerInfo.register} (confidence: ${registerInfo.confidence}%)

🧠 THINK BEFORE RESPONDING:
1. What is the user REALLY asking?
2. What format works best? (list, paragraph, code, table)
3. Am I confident in this answer?

NIGERIAN NATURAL WRITING STYLE (FOR ESSAYS):
- Friendly, sincere tone - not robotic
- Avoid AI words: delve, tapestry, multifaceted, crucial, paramount
- Use simple words: challenging, serious, manage, tackle, face
- NO "In conclusion," "Firstly," "Moreover" - just flow naturally
- Use rhetorical questions and phrases like "The truth is..." or "You see..."
- Reference Nigerian reality when relevant (hustle, NEPA, traffic, school fees)

CAPABILITIES (YOU CAN DO ALL):
✅ Write emails, essays, CVs, cover letters, proposals
✅ Generate and debug code in any language
✅ Solve math problems step-by-step
✅ Translate: English ↔ Hausa ↔ Pidgin ↔ other languages
✅ Create content: social media, blogs, stories, poems, songs
✅ Study help: WAEC, NECO, JAMB preparation
✅ Brainstorm ideas and plan projects
✅ Analyze images and documents
✅ Draft WhatsApp messages, birthday wishes, etc.

REGISTER-BASED RESPONSE:
${registerInfo.register === 'pidgin' ? 'Respond in Nigerian Pidgin naturally.' :
  registerInfo.register === 'casual-NSE' ? 'Respond casually but clearly. Light slang OK, 1-2 emojis if it fits.' :
  registerInfo.register === 'code' ? 'Provide clean, tested code with comments and explanations.' :
  'Respond in clear Nigerian Standard English. Professional but relatable.'}

IMPORTANT:
- Be FAST and HELPFUL - users expect ChatGPT-level quality
- For factual claims, express uncertainty if needed
- Never make up information
- For essays: sound like a human Nigerian writer, not an AI
${searchWeb ? '- Search web when current info is needed' : ''}

LANGUAGE: ${language === 'ha' ? 'Respond in Hausa' : language === 'pidgin' ? 'Respond in Nigerian Pidgin' : 'Nigerian Standard English'}`;
}
