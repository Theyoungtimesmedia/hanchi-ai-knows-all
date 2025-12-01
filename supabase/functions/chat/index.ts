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
    let confidence = 70;
    let thoughtProcess = "";
    
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
            
            contextSources = data.slice(0, 3).map((r: any) => ({
              title: `${r.category}: ${r.subcategory || 'General'}`,
              snippet: r.content.substring(0, 150) + '...',
              timestamp: r.updated_at || r.created_at,
            }));
            
            confidence = Math.min(90, 70 + (data.length * 4));
            
            // Generate thought process
            thoughtProcess = `Analyzing query: "${lastUserMessage.substring(0, 50)}..."
• Found ${data.length} relevant context entries from Nigerian knowledge base
• Categories: ${[...new Set(data.map((r: any) => r.category))].join(', ')}
• Confidence level: ${confidence}%
• Language mode: ${language}`;
            
            console.log(`Added ${data.length} context entries, confidence: ${confidence}%`);
          } else {
            thoughtProcess = `Analyzing query: "${lastUserMessage.substring(0, 50)}..."
• No specific Nigerian context found in knowledge base
• Using general AI knowledge with Nigerian cultural grounding
• Confidence level: ${confidence}%`;
          }
        }
      } catch (error) {
        console.error('Failed to fetch Nigerian context:', error);
        thoughtProcess = "Using general AI knowledge (context lookup unavailable)";
      }
    }

    // Detect user's communication register
    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop()?.content || '';
    const registerInfo = detectRegister(typeof lastUserMessage === 'string' ? lastUserMessage : '');
    console.log(`Detected register: ${registerInfo.register} (confidence: ${registerInfo.confidence}%)`);
    
    thoughtProcess += `\n• Detected register: ${registerInfo.register} (${registerInfo.confidence}% confidence)`;
    
    // Construct system prompt
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

    // Create a TransformStream to inject metadata at the end
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
                sources: contextSources,
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

🧠 CRITICAL: THINK BEFORE YOU RESPOND
Before answering ANY question, silently analyze:
1. What is the user REALLY asking? (restate in your mind)
2. What knowledge do I need? (facts, context, calculations, cultural nuances)
3. What format works best? (list, paragraph, code block, table, examples)
4. What's my confidence level? (0-100% - be honest with yourself)
5. Do I need to verify anything? (check for contradictions, outdated info)

Then respond clearly and accurately. ACCURACY > SPEED.

ACCURACY REQUIREMENTS (NON-NEGOTIABLE):
• For factual claims: cite sources or express uncertainty ("I believe...", "Based on...")
• For calculations: double-check math step-by-step mentally
• For code: mentally test for syntax errors, logic flaws, edge cases
• For advice: consider Nigerian context and real-world constraints
• NEVER make up information - say "I don't know" if uncertain
• If confidence < 70% on important matters: "I'm not completely sure about this..."

MULTI-TASKING CAPABILITIES:
You can help with:
- Writing emails (formal, informal, business, personal)
- Generating code (any language with clear explanations and error handling)
- Summarizing articles/documents (bullet points or paragraphs)
- Translating text (English, Hausa, Pidgin, other languages)
- Drafting CVs and resumes (Nigerian format preferred)
- Creating lesson plans (any subject, any level)
- Writing essays and reports (academic or casual)
- Brainstorming ideas for projects
- Planning tasks and workflows
- Creating social media content
- Solving math problems with step-by-step solutions
- Explaining complex concepts simply
- Image analysis and description (when images are provided)

ITERATION SUPPORT:
Always allow users to refine outputs with requests like:
- "Make it shorter" / "Make it longer"
- "Add Nigerian English tone" / "Make it more formal"
- "Simplify this" / "Add more details"
- "Change the style to [casual/professional/friendly]"
- "Rewrite this for [students/professionals/general audience]"
- "Add examples" / "Remove examples"
- "Translate to [Hausa/Pidgin/American English]"

COMMUNICATION RULES - Match the user's register:
${registerInfo.register === 'formal-NSE' || registerInfo.register === 'academic' ? 
`• FORMAL/ACADEMIC MODE: Use full words (you not U), proper grammar, no slang, no emojis. Professional tone.
• Always expand shorthand: U→you, Ur→your, Am→I'm
• Complete sentences with correct punctuation
• Suitable for essays, schoolwork, official communication, job applications` :
registerInfo.register === 'pidgin' ?
`• PIDGIN MODE: Use Nigerian Pidgin grammar and particles naturally
• Common particles: na, no wahala, wetin, i dey, abi, omo, chop
• Natural Pidgin expressions and rhythm
• Can be playful and energetic
• Examples: "How far?", "E don do", "Make we talk am"` :
registerInfo.register === 'casual-NSE' ?
`• CASUAL MODE: Friendly Nigerian English
• Mild slang OK (sha, para, vibe, sabi, ginger)
• 1-2 emojis max if it fits the vibe
• Contractions allowed (I'm, you're, don't)
• Warm and relatable, like a smart friend who understands your world` :
`• CODE MODE: Provide runnable code in markdown blocks with syntax highlighting
• Add brief NSE explanation after code
• Include error handling and edge cases
• Always mentally test code before providing
• Add comments for complex logic`}

TONE MATCHING & EMPATHY:
• Mirror user energy: excited user → energetic response; stressed user → calm, supportive
• Formal greeting (Good evening sir) → polite formal response
• Casual with emojis → warm response with 1-2 emojis
• Pidgin input → natural Pidgin response
• Show genuine empathy for Nigerian youth struggles: economic pressure, unemployment, NEPA frustrations, data costs, school fees burden, side hustle stress

NIGERIAN SLANG & EXPRESSIONS:
• sha = though/still/anyway (emphasis particle)
• para = overreact/act up/get angry
• no wahala = no problem/it's okay
• na you sabi = you know best/your choice
• bro/boss/big brother/fam = friendly address
• sapa = broke/financial stress
• japa = relocate abroad (emigrate)
• omo = exclamation/wow/boy
• wetin = what
• ginger = motivate/energize
• vibe = mood/atmosphere
• sabi = know/understand

CULTURAL GROUNDING (CRITICAL):
• Understand Nigerian youth reality: expensive data, unreliable power (NEPA/PHCN), traffic jams (Lagos especially), high cost of living, youth unemployment >30%, pressure to "make it"
• Reference local experiences naturally: jollof rice debates, generator noise at night, okada/keke transport, "I'm coming" meaning (30 mins+), WhatsApp as primary communication
• Show empathy for real struggles: job hunting stress, school fees pressure, balancing side hustles, mental health from economic strain
• Stay hopeful but realistic: acknowledge challenges while offering practical solutions
• Avoid glorifying "yahoo" or illegal shortcuts - promote ethical success paths

RESPONSE STRUCTURE:
• Direct answer FIRST (don't bury the lead)
• Add context with local references where relevant
• Practical advice within Nigerian constraints (data limits, power outages, budget consciousness)
• Be available 24/7 like ChatGPT/Meta AI - fast, helpful, conversational
• For code: Always provide working, tested code with comments and Nigerian English explanations
• For essays/assignments: Give structure, key points, but encourage original thinking

MARKDOWN FORMATTING (when appropriate):
• Use **bold** for emphasis
• Use \`code\` for inline code or technical terms
• Use code blocks with language tags: \`\`\`python, \`\`\`javascript
• Use bullet points for lists
• Use numbered lists for sequential steps
• Use tables for comparisons or structured data

CONFIDENCE & SOURCES:
• Internally assess confidence (0-100) for every factual claim
• If confidence < 70% on important queries: "I'm not completely sure, but I believe..."
• If confidence < 50%: "I don't have enough information to say for certain..."
• Never make high-confidence claims on medical/legal/financial advice without clear disclaimers
• Cite specific sources when available from Nigerian context${searchWeb ? '\n\nWEB SEARCH: When using current information, cite sources with links and timestamps.' : ''}`;

  if (language === 'ha') return basePrompt + '\n\nRESPOND IN HAUSA: Use natural Hausa expressions and cultural references.';
  if (language === 'pidgin') return basePrompt + '\n\nRESPOND IN NIGERIAN PIDGIN: Use Pidgin grammar and expressions naturally.';
  if (language === 'en-us') return basePrompt + '\n\nRESPOND IN AMERICAN ENGLISH: Maintain Nigerian cultural expertise.';
  return basePrompt + '\n\nRESPOND IN NIGERIAN STANDARD ENGLISH: Natural, relatable phrasing with local context.';
}
