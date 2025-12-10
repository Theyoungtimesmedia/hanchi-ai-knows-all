import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Free AI providers - No API key needed
const FREE_AI_PROVIDERS = [
  {
    name: "HuggingFace",
    url: "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3",
    transform: (messages: any[], systemPrompt: string) => ({
      inputs: `<s>[INST] ${systemPrompt}\n\nUser: ${messages[messages.length - 1]?.content || ''} [/INST]`,
      parameters: { max_new_tokens: 2048, temperature: 0.7, return_full_text: false }
    }),
    parseResponse: async (response: Response) => {
      const data = await response.json();
      return data[0]?.generated_text || data.generated_text || '';
    }
  }
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language = "en", searchWeb = false, images = [], userMemory = "", model = "mistral", thinkMode = false, tone = "default" } = await req.json();
    
    console.log(`Chat request - Language: ${language}, Model: ${model}, ThinkMode: ${thinkMode}, Tone: ${tone}`);

    // Detect user's communication register
    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop()?.content || '';
    const registerInfo = detectRegister(typeof lastUserMessage === 'string' ? lastUserMessage : '');
    console.log(`Detected register: ${registerInfo.register} (confidence: ${registerInfo.confidence}%)`);
    
    // Construct system prompt with tone
    let systemPrompt = getSystemPrompt(language, registerInfo, searchWeb, thinkMode, tone);
    if (userMemory) {
      systemPrompt += `\n\nUSER MEMORY/CONTEXT:\n${userMemory}`;
    }

    // Build conversation context
    const conversationHistory = messages.map((msg: any) => {
      if (msg.role === 'user') {
        return `User: ${msg.content}`;
      }
      return `Assistant: ${msg.content}`;
    }).join('\n\n');

    // Use HuggingFace free API (no key needed for basic models)
    const HF_API_KEY = Deno.env.get("HUGGINGFACE_API_KEY") || "";
    
    // Try multiple free models
    const modelsToTry = [
      "mistralai/Mistral-7B-Instruct-v0.3",
      "google/flan-t5-xxl",
      "HuggingFaceH4/zephyr-7b-beta"
    ];

    let responseText = "";
    let success = false;

    for (const modelName of modelsToTry) {
      try {
        const prompt = buildPrompt(systemPrompt, conversationHistory, lastUserMessage, thinkMode);
        
        const response = await fetch(`https://api-inference.huggingface.co/models/${modelName}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(HF_API_KEY ? { "Authorization": `Bearer ${HF_API_KEY}` } : {})
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_new_tokens: 2048,
              temperature: 0.7,
              return_full_text: false,
              do_sample: true
            }
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data[0]?.generated_text) {
            responseText = data[0].generated_text;
          } else if (data.generated_text) {
            responseText = data.generated_text;
          } else if (typeof data === 'string') {
            responseText = data;
          }
          
          if (responseText) {
            success = true;
            console.log(`Success with model: ${modelName}`);
            break;
          }
        } else {
          console.log(`Model ${modelName} failed: ${response.status}`);
        }
      } catch (e) {
        console.log(`Error with model ${modelName}:`, e);
      }
    }

    // Fallback response if all models fail
    if (!success || !responseText) {
      responseText = getFallbackResponse(lastUserMessage, language, registerInfo);
    }

    // Clean up response
    responseText = cleanResponse(responseText, thinkMode);

    // Stream the response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Stream response character by character for smooth typing effect
        const words = responseText.split(' ');
        for (let i = 0; i < words.length; i++) {
          const word = words[i] + (i < words.length - 1 ? ' ' : '');
          const event = `data: ${JSON.stringify({
            choices: [{ delta: { content: word } }]
          })}\n\n`;
          controller.enqueue(encoder.encode(event));
          await new Promise(resolve => setTimeout(resolve, 20)); // Typing effect
        }

        // Send metadata
        const metadataEvent = `data: ${JSON.stringify({
          choices: [{ delta: {} }],
          metadata: { 
            confidence: registerInfo.confidence, 
            sources: [], 
            thought: thinkMode ? `🧠 Thinking: Analyzed with ${registerInfo.register} register, ${tone} tone` : undefined
          }
        })}\n\n`;
        controller.enqueue(encoder.encode(metadataEvent));
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      }
    });

    return new Response(stream, {
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

function buildPrompt(systemPrompt: string, history: string, lastMessage: string, thinkMode: boolean): string {
  let prompt = `<s>[INST] ${systemPrompt}\n\n`;
  
  if (thinkMode) {
    prompt += `Before answering, think step by step about the best response.\n\n`;
  }
  
  if (history) {
    prompt += `Previous conversation:\n${history}\n\n`;
  }
  
  prompt += `Current question: ${lastMessage} [/INST]`;
  return prompt;
}

function cleanResponse(text: string, thinkMode: boolean): string {
  // Remove instruction tokens
  let cleaned = text
    .replace(/<\/?s>/g, '')
    .replace(/\[INST\]|\[\/INST\]/g, '')
    .replace(/^(Assistant:|Hanchi:)/i, '')
    .trim();
  
  // Add thinking indicator if in think mode
  if (thinkMode && !cleaned.startsWith('🧠')) {
    cleaned = `🧠 *Thinking...* \n\n${cleaned}`;
  }
  
  return cleaned;
}

function getFallbackResponse(userMessage: string, language: string, registerInfo: RegisterAnalysis): string {
  const lowercaseMessage = userMessage.toLowerCase();
  
  // Smart fallback based on message type
  if (lowercaseMessage.includes('hello') || lowercaseMessage.includes('hi') || lowercaseMessage.includes('hey')) {
    if (registerInfo.register === 'pidgin') {
      return "How you dey! 👃🏿 Na Hanchi be this, your AI assistant wey go help you with anything. Wetin you wan do today?";
    }
    return "Hello! 👃🏿 I'm Hanchi, your Nigerian AI assistant. I'm here to help with anything - writing, coding, studying, or just chatting. What can I do for you today?";
  }
  
  if (lowercaseMessage.includes('help')) {
    return `I'm Hanchi AI 👃🏿 - I can help you with:\n\n📝 **Writing**: Essays, emails, CVs, cover letters\n💻 **Coding**: Debug, explain, generate code\n📚 **Learning**: WAEC, JAMB, homework help\n🌍 **Translation**: English, Hausa, Pidgin\n💬 **Chat**: Advice, brainstorming, ideas\n\nJust ask me anything!`;
  }
  
  if (lowercaseMessage.includes('essay') || lowercaseMessage.includes('write')) {
    return "I'd be happy to help you write! 📝 Please tell me:\n\n1. What topic or subject?\n2. How long should it be?\n3. What style - formal, casual, or academic?\n\nShare these details and I'll create something great for you!";
  }
  
  if (lowercaseMessage.includes('code') || lowercaseMessage.includes('programming')) {
    return "I can help with coding! 💻 Just share:\n\n1. What language (Python, JavaScript, etc.)?\n2. What are you trying to build?\n3. Any specific error or issue?\n\nPaste your code or describe what you need!";
  }
  
  // Generic response
  if (language === 'ha') {
    return "Sannu! 👃🏿 Ina Hanchi, AI helper dinka. Yaya zan taimaka maka yau?";
  }
  
  if (registerInfo.register === 'pidgin') {
    return "Bros/sis! 👃🏿 Na Hanchi dey here. Wetin you wan make I help you with? Just yarn me wetin dey your mind!";
  }
  
  return "Hey there! 👃🏿 I'm Hanchi, ready to help! I noticed the AI servers are a bit busy right now, but I can still assist. What would you like help with? Try being specific - like 'write an essay about...' or 'explain how to...'";
}

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

function getSystemPrompt(language: string, registerInfo: RegisterAnalysis, searchWeb: boolean, thinkMode: boolean, tone: string): string {
  const toneInstructions = {
    default: "Be helpful and clear.",
    professional: "Respond professionally and formally. Use proper business language.",
    curious: "Be inquisitive. Ask follow-up questions. Show genuine interest.",
    persuasive: "Be convincing and compelling. Use persuasive language.",
    friendly: "Be warm, casual, and approachable. Use emojis sparingly.",
    worried: "Be cautious and considerate. Show concern for potential issues."
  };

  return `You are Hanchi AI 👃🏿 - Nigeria's smartest FREE AI assistant that "noses out" answers.
You are completely FREE - no premium, no limits. You can do EVERYTHING ChatGPT, Gemini, Claude, and Grok can do.

DETECTED USER STYLE: ${registerInfo.register} (confidence: ${registerInfo.confidence}%)
TONE TO USE: ${tone} - ${toneInstructions[tone as keyof typeof toneInstructions] || toneInstructions.default}

${thinkMode ? `🧠 THINK MODE ACTIVE - Before responding:
1. Analyze what the user is really asking
2. Consider multiple approaches
3. Choose the best response strategy
4. Explain your reasoning briefly before answering` : ''}

CAPABILITIES (YOU CAN DO ALL):
✅ Write emails, essays, CVs, cover letters, proposals
✅ Generate and debug code in any language  
✅ Solve math problems step-by-step
✅ Translate: English ↔ Hausa ↔ Pidgin ↔ other languages
✅ Create content: social media, blogs, stories, poems, songs
✅ Study help: WAEC, NECO, JAMB preparation
✅ Brainstorm ideas and plan projects
✅ Draft WhatsApp messages, birthday wishes, etc.
✅ Summarize documents and articles
✅ Explain complex topics simply

NIGERIAN WRITING STYLE:
- Friendly, sincere tone - not robotic
- Avoid AI words: delve, tapestry, multifaceted, crucial, paramount
- Use simple words: challenging, serious, manage, tackle, face
- Reference Nigerian reality when relevant (hustle, NEPA, traffic, school fees)

REGISTER-BASED RESPONSE:
${registerInfo.register === 'pidgin' ? 'Respond in Nigerian Pidgin naturally.' :
  registerInfo.register === 'casual-NSE' ? 'Respond casually but clearly. Light slang OK, 1-2 emojis if it fits.' :
  registerInfo.register === 'code' ? 'Provide clean, tested code with comments and explanations.' :
  'Respond in clear Nigerian Standard English. Professional but relatable.'}

IMPORTANT:
- Be FAST and HELPFUL
- For factual claims, express uncertainty if needed
- Never make up information
- Keep responses concise unless detail is requested
${searchWeb ? '- Include relevant web information when helpful' : ''}

LANGUAGE: ${language === 'ha' ? 'Respond in Hausa' : language === 'pidgin' ? 'Respond in Nigerian Pidgin' : 'Nigerian Standard English'}`;
}
