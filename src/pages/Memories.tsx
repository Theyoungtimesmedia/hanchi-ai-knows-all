import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Trash2, Plus, Download, Info, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserMemory } from "@/hooks/useUserMemory";

export default function Memories() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [view, setView] = useState<"main" | "saved">("main");
  const [refSaved, setRefSaved] = useState(true);
  const [refHistory, setRefHistory] = useState(true);
  const [nickname, setNickname] = useState("");
  const [occupation, setOccupation] = useState("");
  const [aboutYou, setAboutYou] = useState("");
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const { memories, addMemory, deleteMemory, refreshMemories } = useUserMemory(userId);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate("/auth"); return; }
      setUserId(session.user.id);
      const { data } = await supabase.from("user_memory").select("memory_key, memory_value").eq("user_id", session.user.id).in("memory_key", ["nickname", "occupation", "about_you", "ref_saved_memories", "ref_chat_history"]);
      data?.forEach((m) => {
        if (m.memory_key === "nickname") setNickname(m.memory_value);
        if (m.memory_key === "occupation") setOccupation(m.memory_value);
        if (m.memory_key === "about_you") setAboutYou(m.memory_value);
        if (m.memory_key === "ref_saved_memories") setRefSaved(m.memory_value !== "false");
        if (m.memory_key === "ref_chat_history") setRefHistory(m.memory_value !== "false");
      });
    })();
  }, [navigate]);

  const saveField = async (key: string, value: string) => {
    if (!userId) return;
    await addMemory(key, value, "profile");
  };

  const handleToggle = async (key: string, val: boolean, setter: (v: boolean) => void) => {
    setter(val);
    if (!userId) return;
    await addMemory(key, val ? "true" : "false", "preferences");
  };

  const exportMemories = () => {
    const blob = new Blob([JSON.stringify(memories, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hanchi-memories.json";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Memories exported" });
  };

  const handleAddMemory = async () => {
    if (!newKey.trim() || !newValue.trim()) return;
    await addMemory(newKey.trim(), newValue.trim(), "general");
    setNewKey(""); setNewValue(""); setAddOpen(false);
    toast({ title: "Memory added" });
  };

  const filteredMemories = memories.filter((m) =>
    m.memory_key.toLowerCase().includes(search.toLowerCase()) ||
    m.memory_value.toLowerCase().includes(search.toLowerCase())
  );

  if (view === "saved") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
        className="min-h-screen bg-background flex flex-col"
      >
        <header className="h-14 px-4 flex items-center justify-between border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-10">
          <Button variant="ghost" size="icon" onClick={() => setView("main")} className="rounded-full h-9 w-9">
            <ArrowLeft size={18} />
          </Button>
          <div className="font-serif-display text-lg">Saved memories</div>
          <Button variant="ghost" size="icon" onClick={exportMemories} className="rounded-full h-9 w-9 bg-muted/60" title="Export">
            <Download size={16} />
          </Button>
        </header>

        <div className="px-4 py-4 max-w-2xl mx-auto w-full">
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search"
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-11 rounded-2xl bg-card border-border/60"
            />
          </div>

          <div className="space-y-2">
            {filteredMemories.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-12">No saved memories yet.</p>
            ) : filteredMemories.map((m) => (
              <div key={m.id} className="bg-card border border-border/60 rounded-2xl p-3.5 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground capitalize mb-0.5">{m.category}</div>
                  <div className="text-sm font-medium">{m.memory_key}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{m.memory_value}</div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteMemory(m.id)} className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-full flex-shrink-0">
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={() => setAddOpen(true)} className="fixed bottom-6 left-6 rounded-full h-12 w-12 p-0 shadow-lg">
          <Plus size={20} />
        </Button>
        <Button onClick={refreshMemories} variant="outline" className="fixed bottom-6 right-6 rounded-full h-12 w-12 p-0 shadow-lg bg-card">
          <RefreshCw size={18} />
        </Button>

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent className="rounded-3xl">
            <DialogHeader><DialogTitle className="font-serif-display">Add memory</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">What to remember</Label>
                <Input value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="e.g. Favourite subject" className="rounded-xl mt-1" /></div>
              <div><Label className="text-xs">Details</Label>
                <Textarea value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder="e.g. Mathematics, especially algebra" className="rounded-xl mt-1 min-h-[80px]" /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)} className="rounded-full">Cancel</Button>
              <Button onClick={handleAddMemory} disabled={!newKey.trim() || !newValue.trim()} className="rounded-full">Save memory</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
      className="min-h-screen bg-background flex flex-col"
    >
      <header className="h-14 px-4 flex items-center justify-between border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={() => navigate("/settings")} className="rounded-full h-9 w-9">
          <ArrowLeft size={18} />
        </Button>
        <div className="font-serif-display text-lg">Memories</div>
        <Button variant="ghost" size="icon" onClick={() => navigate("/settings")} className="rounded-full h-9 w-9 bg-muted/60" title="Info">
          <Info size={16} />
        </Button>
      </header>

      <div className="px-4 py-5 max-w-2xl mx-auto w-full space-y-5">
        <button
          onClick={() => setView("saved")}
          className="w-full bg-card border border-border/60 rounded-2xl p-4 text-left hover:bg-accent/30 transition-colors"
        >
          <div className="text-sm font-medium">Manage memories</div>
          <div className="text-xs text-muted-foreground mt-0.5">{memories.length} saved · view, edit, export</div>
        </button>

        <div className="space-y-3">
          <div className="bg-card border border-border/60 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Reference saved memories</div>
              <Switch checked={refSaved} onCheckedChange={(v) => handleToggle("ref_saved_memories", v, setRefSaved)} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Lets Hanchi save and use memories when responding.</p>
          </div>
          <div className="bg-card border border-border/60 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Reference chat history</div>
              <Switch checked={refHistory} onCheckedChange={(v) => handleToggle("ref_chat_history", v, setRefHistory)} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Lets Hanchi reference recent conversations when responding.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Your nickname</Label>
            <Input
              value={nickname} onChange={(e) => setNickname(e.target.value)} onBlur={() => saveField("nickname", nickname)}
              placeholder="What should Hanchi call you?"
              className="mt-1.5 h-12 rounded-2xl bg-card border-border/60 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Your occupation</Label>
            <Input
              value={occupation} onChange={(e) => setOccupation(e.target.value)} onBlur={() => saveField("occupation", occupation)}
              placeholder="Student, founder, designer..."
              className="mt-1.5 h-12 rounded-2xl bg-card border-border/60 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">More about you</Label>
            <Textarea
              value={aboutYou} onChange={(e) => setAboutYou(e.target.value)} onBlur={() => saveField("about_you", aboutYou)}
              placeholder="Interests, values, or preferences to keep in mind"
              className="mt-1.5 rounded-2xl bg-card border-border/60 text-sm min-h-[100px]"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
