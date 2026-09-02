import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getProviderError, openAIChatCompletion } from "../_shared/openai.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages = [], action, query = '', allMessages = [] } = await req.json();
    
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not configured');

    // Action: summarize - Summarize a conversation
    if (action === 'summarize') {
      const response = await openAIChatCompletion({
        apiKey: OPENAI_API_KEY,
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a conversation summarizer. Provide a concise, clear summary of the conversation including: 1) Main topics discussed 2) Key decisions or conclusions 3) Action items if any. Keep it under 200 words.' },
          { role: 'user', content: `Summarize this conversation:\n\n${messages.map((m: any) => `${m.role}: ${m.content}`).join('\n\n')}` },
        ],
        maxTokens: 500,
      });

      if (!response.ok) {
        return new Response(JSON.stringify({ error: await getProviderError(response) }), { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const result = await response.json();
      return new Response(JSON.stringify({ summary: result.choices?.[0]?.message?.content || '' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Action: auto-tag - Tag a conversation
    if (action === 'auto-tag') {
      const response = await openAIChatCompletion({
        apiKey: OPENAI_API_KEY,
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Analyze the conversation and return 2-4 relevant tags. Return ONLY a JSON array of strings. Examples: ["coding", "python"], ["creative writing", "story"], ["homework", "math", "algebra"]' },
          { role: 'user', content: messages.map((m: any) => `${m.role}: ${m.content}`).join('\n').slice(0, 2000) },
        ],
        maxTokens: 100,
        responseFormat: { type: 'json_object' },
      });

      if (!response.ok) return new Response(JSON.stringify({ error: await getProviderError(response) }), { status: response.status, headers: jsonHeaders });
      const result = await response.json();
      const content = result.choices?.[0]?.message?.content || '[]';
      
      let tags: string[] = [];
      try {
        const cleaned = content.replace(/```json\n?/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        tags = Array.isArray(parsed) ? parsed : parsed.tags;
      } catch { tags = ['general']; }

      return new Response(JSON.stringify({ tags }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Action: smart-search - Search across messages with AI
    if (action === 'smart-search') {
      const response = await openAIChatCompletion({
        apiKey: OPENAI_API_KEY,
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a search assistant. Given a user query and conversation messages, find and return the most relevant messages. Return a JSON object with a results array. Each result has index, relevance, and snippet. Return at most 5 results.' },
          { role: 'user', content: `Query: "${query || messages?.[0]?.content || ''}"\n\nMessages to search:\n${(allMessages || messages || []).slice(0, 50).map((m: any, i: number) => `[${i}] ${m.role}: ${m.content?.slice(0, 200)}`).join('\n')}` },
        ],
        maxTokens: 500,
        responseFormat: { type: 'json_object' },
      });

      if (!response.ok) return new Response(JSON.stringify({ error: await getProviderError(response) }), { status: response.status, headers: jsonHeaders });
      const result = await response.json();
      const content = result.choices?.[0]?.message?.content || '[]';
      
      let results: any[] = [];
      try {
        const cleaned = content.replace(/```json\n?/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        results = Array.isArray(parsed) ? parsed : parsed.results || [];
      } catch { results = []; }

      return new Response(JSON.stringify({ results }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Unknown action. Use: summarize, auto-tag, smart-search' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('AI smart features error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
