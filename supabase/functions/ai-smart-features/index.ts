import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, action, conversationId } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const aiHeaders = {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    };

    // Action: summarize - Summarize a conversation
    if (action === 'summarize') {
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: aiHeaders,
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: 'You are a conversation summarizer. Provide a concise, clear summary of the conversation including: 1) Main topics discussed 2) Key decisions or conclusions 3) Action items if any. Keep it under 200 words.' },
            { role: 'user', content: `Summarize this conversation:\n\n${messages.map((m: any) => `${m.role}: ${m.content}`).join('\n\n')}` },
          ],
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) return new Response(JSON.stringify({ error: 'Rate limited. Try again shortly.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        if (response.status === 402) return new Response(JSON.stringify({ error: 'Credits exhausted.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        throw new Error(`AI error: ${response.status}`);
      }

      const result = await response.json();
      return new Response(JSON.stringify({ summary: result.choices?.[0]?.message?.content || '' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Action: auto-tag - Tag a conversation
    if (action === 'auto-tag') {
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: aiHeaders,
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-lite',
          messages: [
            { role: 'system', content: 'Analyze the conversation and return 2-4 relevant tags. Return ONLY a JSON array of strings. Examples: ["coding", "python"], ["creative writing", "story"], ["homework", "math", "algebra"]' },
            { role: 'user', content: messages.map((m: any) => `${m.role}: ${m.content}`).join('\n').slice(0, 2000) },
          ],
          max_tokens: 100,
        }),
      });

      if (!response.ok) throw new Error(`AI error: ${response.status}`);
      const result = await response.json();
      const content = result.choices?.[0]?.message?.content || '[]';
      
      let tags: string[] = [];
      try {
        const cleaned = content.replace(/```json\n?/g, '').replace(/```/g, '').trim();
        tags = JSON.parse(cleaned);
      } catch { tags = ['general']; }

      return new Response(JSON.stringify({ tags }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Action: smart-search - Search across messages with AI
    if (action === 'smart-search') {
      const { query, allMessages } = await req.json().catch(() => ({ query: '', allMessages: [] }));
      
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: aiHeaders,
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: 'You are a search assistant. Given a user query and conversation messages, find and return the most relevant messages. Return a JSON array of objects with "index" (message index), "relevance" (0-1), and "snippet" (relevant excerpt). Max 5 results.' },
            { role: 'user', content: `Query: "${messages?.[0]?.content || ''}"\n\nMessages to search:\n${(allMessages || messages || []).slice(0, 50).map((m: any, i: number) => `[${i}] ${m.role}: ${m.content?.slice(0, 200)}`).join('\n')}` },
          ],
          max_tokens: 500,
        }),
      });

      if (!response.ok) throw new Error(`AI error: ${response.status}`);
      const result = await response.json();
      const content = result.choices?.[0]?.message?.content || '[]';
      
      let results: any[] = [];
      try {
        const cleaned = content.replace(/```json\n?/g, '').replace(/```/g, '').trim();
        results = JSON.parse(cleaned);
      } catch { results = []; }

      return new Response(JSON.stringify({ results }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Unknown action. Use: summarize, auto-tag, smart-search' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('AI smart features error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
