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
    const { input } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Parsing task from: ${input}`);

    const systemPrompt = `You are a task parsing assistant. Extract task information from natural language input.

Examples:
- "Remind me to study math tomorrow at 5pm" -> {"title": "Study math", "due_date": "tomorrow 5pm", "priority": "medium", "category": "study"}
- "High priority: Submit JAMB form by next Friday" -> {"title": "Submit JAMB form", "due_date": "next Friday", "priority": "high", "category": "exam"}
- "Call Mum" -> {"title": "Call Mum", "priority": "medium"}

Return ONLY a JSON object with these fields:
{
  "title": "task title",
  "description": "optional details",
  "due_date": "relative date string or null",
  "priority": "low|medium|high",
  "category": "study|personal|work|exam|other"
}`;

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
          { role: "user", content: input }
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to parse task");
    }

    const data = await response.json();
    const taskText = data.choices[0].message.content;
    
    // Extract JSON from response
    const jsonMatch = taskText.match(/\{[\s\S]*\}/);
    const task = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      title: input,
      priority: "medium",
      category: "other"
    };

    return new Response(JSON.stringify(task), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Task parsing error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
