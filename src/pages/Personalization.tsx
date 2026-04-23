import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const TONES = [
  { id: "default", label: "Default", description: "Balanced and adaptive" },
  { id: "professional", label: "Professional", description: "Clear, concise, formal" },
  { id: "casual", label: "Casual", description: "Friendly and relaxed" },
  { id: "playful", label: "Playful", description: "Warm with humour" },
  { id: "scholar", label: "Scholar", description: "Detailed and analytical" },
];

export default function Personalization() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [tone, setTone] = useState("default");
  const [toneOpen, setToneOpen] = useState(false);
  const [instructions, setInstructions] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate("/auth"); return; }
      setUserId(session.user.id);
      const { data } = await supabase.from("user_memory").select("memory_value").eq("user_id", session.user.id).eq("memory_key", "custom_instructions").maybeSingle();
      if (data?.memory_value) setInstructions(data.memory_value);
      const { data: toneData } = await supabase.from("user_memory").select("memory_value").eq("user_id", session.user.id).eq("memory_key", "tone").maybeSingle();
      if (toneData?.memory_value) setTone(toneData.memory_value);
    })();
  }, [navigate]);

  const save = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await supabase.from("user_memory").upsert({
        user_id: userId, memory_key: "custom_instructions", memory_value: instructions, category: "preferences",
      }, { onConflict: "user_id,memory_key" });
      await supabase.from("user_memory").upsert({
        user_id: userId, memory_key: "tone", memory_value: tone, category: "preferences",
      }, { onConflict: "user_id,memory_key" });
      toast({ title: "Personalization saved" });
      navigate("/settings");
    } catch (e) {
      toast({ title: "Save failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const activeTone = TONES.find((t) => t.id === tone) || TONES[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
      className="min-h-screen bg-background flex flex-col"
    >
      <header className="h-14 px-4 flex items-center justify-between border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={() => navigate("/settings")} className="rounded-full h-9 w-9">
          <ArrowLeft size={18} />
        </Button>
        <div className="font-serif-display text-lg">Personalization</div>
        <Button variant="ghost" size="icon" onClick={save} disabled={saving} className="rounded-full h-9 w-9 bg-muted/60">
          <Check size={16} />
        </Button>
      </header>

      <div className="px-4 py-5 max-w-2xl mx-auto w-full space-y-6">
        {/* Tone */}
        <div className="rounded-2xl bg-card border border-border/60 overflow-hidden">
          <button
            onClick={() => setToneOpen((v) => !v)}
            className="w-full flex items-center justify-between p-4 text-left"
          >
            <div>
              <div className="text-xs text-muted-foreground">Base style and tone</div>
              <div className="text-sm font-medium mt-0.5">{activeTone.label}</div>
            </div>
            <ChevronDown size={18} className={cn("text-muted-foreground transition-transform", toneOpen && "rotate-180")} />
          </button>
          {toneOpen && (
            <div className="border-t border-border/40 p-2">
              {TONES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setTone(t.id); setToneOpen(false); }}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-xl text-left hover:bg-accent/40 transition-colors",
                    tone === t.id && "bg-accent/40"
                  )}
                >
                  <div>
                    <div className="text-sm font-medium">{t.label}</div>
                    <div className="text-xs text-muted-foreground">{t.description}</div>
                  </div>
                  {tone === t.id && <Check size={16} className="text-primary" />}
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground -mt-3 px-1">
          This is the main voice and tone Hanchi uses in your conversations. It does not change Hanchi's capabilities.
        </p>

        {/* Custom instructions */}
        <div>
          <div className="text-xs text-muted-foreground mb-2 px-1 uppercase tracking-wide">Custom instructions</div>
          <Textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Tell Hanchi how you want it to respond. e.g. 'Use clear Nigerian Standard English, think before answering, be proactive with next steps...'"
            className="min-h-[260px] rounded-2xl bg-card border-border/60 p-4 text-sm leading-relaxed resize-none"
          />
          <p className="text-xs text-muted-foreground mt-2 px-1">
            Hanchi keeps this in mind every reply. Edits save when you tap the check.
          </p>
        </div>

        <Button onClick={save} disabled={saving} className="w-full rounded-full h-11">
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </motion.div>
  );
}
