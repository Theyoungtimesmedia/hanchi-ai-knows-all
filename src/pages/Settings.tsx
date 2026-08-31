import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { 
  ArrowLeft, Brain, Globe, Moon, Sun, Volume2, 
  Trash2, Check, Sparkles, PenTool, Mic, Bell,
  Shield, HelpCircle, ExternalLink, Download, Palette,
  MessageSquare, Code, Zap, Eye, Database, Key, Plus, ChevronRight
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  SettingsSection, 
  SettingsToggle, 
  ModelPreferenceSelector,
  WritingStyleSelector 
} from "@/components/settings";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

// Add Memory inline form component
function AddMemoryForm({ userId, onAdded }: { userId: string | null; onAdded: (mem: any) => void }) {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [category, setCategory] = useState("general");
  const { toast } = useToast();

  const handleAdd = async () => {
    if (!userId || !key.trim() || !value.trim()) return;
    try {
      const { data, error } = await supabase.from("user_memory").insert({
        user_id: userId,
        memory_key: key.trim(),
        memory_value: value.trim(),
        category,
      }).select().single();
      if (error) throw error;
      onAdded(data);
      setOpen(false);
      setKey(""); setValue(""); setCategory("general");
      toast({ title: "Memory added ✨" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to add memory", variant: "destructive" });
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="w-full mb-4 rounded-xl gap-2">
        <Plus size={14} /> Add Memory
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Add Memory</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Key (what to remember)</Label>
              <Input placeholder="e.g. Name, School, Goal" value={key} onChange={(e) => setKey(e.target.value)} className="rounded-xl mt-1" /></div>
            <div><Label className="text-xs">Value</Label>
              <Input placeholder="e.g. Adamu, UNILAG, Pass JAMB" value={value} onChange={(e) => setValue(e.target.value)} className="rounded-xl mt-1" /></div>
            <div><Label className="text-xs">Category</Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {["general", "personal", "academic", "work", "health", "preferences"].map((cat) => (
                  <button key={cat} onClick={() => setCategory(cat)}
                    className={cn("text-xs p-2 rounded-xl capitalize", category === cat ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted")}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAdd} disabled={!key.trim() || !value.trim()} className="rounded-xl gap-2">
              <Plus size={14} /> Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

const LANGUAGES = [
  { code: "en", name: "English (Nigeria)", flag: "🇳🇬" },
  { code: "en-us", name: "English (US)", flag: "🇺🇸" },
  { code: "ha", name: "Hausa", flag: "🇳🇬" },
  { code: "pidgin", name: "Pidgin", flag: "🇳🇬" },
];

interface SettingsGroup {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const settingsGroups: SettingsGroup[] = [
  { id: "general", label: "General", icon: <Globe size={20} />, description: "Language, theme, font size", color: "from-sky-500/20 to-blue-500/10 text-sky-600 dark:text-sky-400" },
  { id: "ai", label: "AI & Model", icon: <Sparkles size={20} />, description: "Default model, writing tone", color: "from-violet-500/20 to-purple-500/10 text-violet-600 dark:text-violet-400" },
  { id: "chat", label: "Chat", icon: <MessageSquare size={20} />, description: "Display, features, density", color: "from-emerald-500/20 to-green-500/10 text-emerald-600 dark:text-emerald-400" },
  { id: "memory", label: "Memory", icon: <Database size={20} />, description: "Manage what Hanchi remembers", color: "from-amber-500/20 to-yellow-500/10 text-amber-600 dark:text-amber-400" },
  { id: "privacy", label: "Privacy & Data", icon: <Shield size={20} />, description: "Export, delete, account", color: "from-red-500/20 to-rose-500/10 text-red-600 dark:text-red-400" },
];

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [userId, setUserId] = useState<string | null>(null);
  const [memories, setMemories] = useState<any[]>([]);
  const [currentLang, setCurrentLang] = useState(LANGUAGES[0]);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [preferences, setPreferences] = useState({
    voice_enabled: true,
    study_mode: false,
    default_model: "gemini-flash",
    writing_style: "default",
    notifications_enabled: true,
    message_density: "comfortable",
    code_theme: "dark",
    markdown_enabled: true,
    web_search_enabled: true,
    image_generation_enabled: true,
    voice_input_enabled: true,
    font_size: 14,
    auto_save: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) { navigate("/auth"); return; }
      setUserId(session.user.id);
      loadUserData(session.user.id);
    });
  }, [navigate]);

  const loadUserData = async (uid: string) => {
    try {
      const { data: prefs } = await supabase.from("user_preferences").select("*").eq("user_id", uid).single();
      if (prefs) {
        setPreferences(prev => ({ ...prev, voice_enabled: prefs.voice_enabled ?? true, study_mode: prefs.study_mode ?? false }));
        const lang = LANGUAGES.find((l) => l.code === prefs.preferred_language);
        if (lang) setCurrentLang(lang);
      }
      const { data: mems } = await supabase.from("user_memory").select("*").eq("user_id", uid).order("created_at", { ascending: false });
      setMemories(mems || []);
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key: string, value: boolean | string | number) => {
    if (!userId) return;
    setPreferences((prev) => ({ ...prev, [key]: value }));
    if (key === "voice_enabled" || key === "study_mode") {
      const payload = key === "voice_enabled"
        ? { user_id: userId, voice_enabled: Boolean(value) }
        : { user_id: userId, study_mode: Boolean(value) };
      try { await supabase.from("user_preferences").upsert(payload); }
      catch (error) { toast({ title: "Error", description: "Failed to save preference.", variant: "destructive" }); }
    }
    toast({ title: "Updated", description: "Settings saved" });
  };

  const updateLanguage = async (lang: (typeof LANGUAGES)[0]) => {
    if (!userId) return;
    setCurrentLang(lang);
    try { await supabase.from("user_preferences").upsert({ user_id: userId, preferred_language: lang.code }); toast({ title: "Language updated" }); } 
    catch (error) { console.error("Error updating language:", error); }
  };

  const deleteMemory = async (memoryId: string) => {
    try {
      const { error } = await supabase.from("user_memory").delete().eq("id", memoryId);
      if (error) throw error;
      setMemories((prev) => prev.filter((m) => m.id !== memoryId));
      toast({ title: "Memory deleted" });
    } catch (error) { toast({ title: "Error", description: "Failed to delete memory.", variant: "destructive" }); }
  };

  const clearAllMemories = async () => {
    if (!userId) return;
    try {
      const { error } = await supabase.from("user_memory").delete().eq("user_id", userId);
      if (error) throw error;
      setMemories([]);
      toast({ title: "All memories cleared" });
    } catch (error) { toast({ title: "Error", description: "Failed to clear memories.", variant: "destructive" }); }
  };

  const exportData = () => {
    const data = { preferences, memories, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hanchi-data-export.json';
    a.click();
    toast({ title: "Data exported" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Render settings group detail page
  const renderGroupContent = () => {
    switch (activeGroup) {
      case "general":
        return (
          <div className="space-y-4">
            <SettingsSection title="Language" icon={Globe}>
              <div className="grid grid-cols-2 gap-2">
                {LANGUAGES.map((lang) => (
                  <button key={lang.code} onClick={() => updateLanguage(lang)}
                    className={cn("flex items-center justify-between p-2.5 rounded-xl border transition-all text-sm",
                      currentLang.code === lang.code ? "border-primary bg-primary/5" : "border-transparent bg-muted/50 hover:bg-muted")}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{lang.flag}</span>
                      <span className="font-medium text-xs">{lang.name}</span>
                    </div>
                    {currentLang.code === lang.code && <Check size={14} className="text-primary" />}
                  </button>
                ))}
              </div>
            </SettingsSection>
            <SettingsSection title="Appearance" icon={Palette}>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                  <div className="flex items-center gap-3">
                    {theme === 'dark' ? <Moon size={18} className="text-primary" /> : <Sun size={18} className="text-primary" />}
                    <div><p className="text-sm font-medium">Dark Mode</p><p className="text-xs text-muted-foreground">Switch theme</p></div>
                  </div>
                  <Switch checked={theme === 'dark'} onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} />
                </div>
                <div className="p-3 rounded-xl bg-muted/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Eye size={18} className="text-primary" />
                      <div><p className="text-sm font-medium">Font Size</p><p className="text-xs text-muted-foreground">{preferences.font_size}px</p></div>
                    </div>
                  </div>
                  <Slider value={[preferences.font_size]} onValueChange={([v]) => updatePreference("font_size", v)} min={12} max={20} step={1} className="w-full" />
                </div>
              </div>
            </SettingsSection>
            <SettingsSection title="Notifications" icon={Bell}>
              <SettingsToggle icon={Bell} label="Push Notifications" description="Get notified about updates"
                checked={preferences.notifications_enabled} onChange={(v) => updatePreference("notifications_enabled", v)} />
            </SettingsSection>
          </div>
        );

      case "ai":
        return (
          <div className="space-y-4">
            <SettingsSection title="Default AI Model" icon={Sparkles}>
              <p className="text-xs text-muted-foreground mb-3">Choose your preferred AI model</p>
              <ModelPreferenceSelector value={preferences.default_model} onChange={(v) => updatePreference("default_model", v)} />
            </SettingsSection>
            <SettingsSection title="Writing Tone" icon={PenTool}>
              <p className="text-xs text-muted-foreground mb-3">Set default tone for responses</p>
              <WritingStyleSelector value={preferences.writing_style} onChange={(v) => updatePreference("writing_style", v)} />
            </SettingsSection>
            <SettingsSection title="AI Features" icon={Zap}>
              <div className="space-y-1">
                <SettingsToggle icon={Mic} label="Voice Input" description="Enable speech-to-text"
                  checked={preferences.voice_input_enabled} onChange={(v) => updatePreference("voice_input_enabled", v)} />
                <SettingsToggle icon={Volume2} label="Voice Output" description="Enable text-to-speech"
                  checked={preferences.voice_enabled} onChange={(v) => updatePreference("voice_enabled", v)} />
              </div>
            </SettingsSection>
          </div>
        );

      case "chat":
        return (
          <div className="space-y-4">
            <SettingsSection title="Chat Features" icon={MessageSquare}>
              <div className="space-y-1">
                <SettingsToggle icon={Globe} label="Web Search" description="Search the web for answers"
                  checked={preferences.web_search_enabled} onChange={(v) => updatePreference("web_search_enabled", v)} />
                <SettingsToggle icon={Sparkles} label="Image Generation" description="Generate images from text"
                  checked={preferences.image_generation_enabled} onChange={(v) => updatePreference("image_generation_enabled", v)} />
                <SettingsToggle icon={Code} label="Markdown Rendering" description="Format code and text"
                  checked={preferences.markdown_enabled} onChange={(v) => updatePreference("markdown_enabled", v)} />
              </div>
            </SettingsSection>
            <SettingsSection title="Message Display" icon={Eye}>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground mb-2">Message Density</p>
                <div className="grid grid-cols-3 gap-2">
                  {['compact', 'comfortable', 'spacious'].map((density) => (
                    <button key={density} onClick={() => updatePreference("message_density", density)}
                      className={cn("p-2 rounded-xl text-xs font-medium capitalize transition-all",
                        preferences.message_density === density ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted")}>
                      {density}
                    </button>
                  ))}
                </div>
              </div>
            </SettingsSection>
            <SettingsSection title="Learning" icon={Brain}>
              <SettingsToggle icon={Brain} label="Study Mode" description="Enhanced learning features"
                checked={preferences.study_mode} onChange={(v) => updatePreference("study_mode", v)} />
            </SettingsSection>
          </div>
        );

      case "memory":
        return (
          <div className="space-y-4">
            <SettingsSection title="Your Memory" icon={Database}>
              <p className="text-xs text-muted-foreground mb-4">Hanchi remembers these facts to personalize responses.</p>
              <AddMemoryForm userId={userId} onAdded={(mem) => setMemories(prev => [mem, ...prev])} />
              {memories.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Brain className="mx-auto mb-2 opacity-50" size={28} />
                  <p className="text-sm">No memories yet</p>
                  <p className="text-xs">Chat with Hanchi to build your profile</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2 mb-4 max-h-[400px] overflow-y-auto">
                    {memories.map((memory) => (
                      <div key={memory.id} className="flex items-start justify-between p-2.5 rounded-xl bg-muted/30">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{memory.category}</span>
                          </div>
                          <p className="text-xs font-medium">{memory.memory_key}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{memory.memory_value}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => deleteMemory(memory.id)} className="flex-shrink-0 h-7 w-7 text-destructive hover:bg-destructive/10">
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    ))}
                  </div>
                  {memories.length > 0 && (
                    <Button variant="outline" size="sm" className="w-full text-destructive border-destructive/30 hover:bg-destructive/10" onClick={clearAllMemories}>
                      <Trash2 size={12} className="mr-2" /> Clear All Memories
                    </Button>
                  )}
                </>
              )}
            </SettingsSection>
          </div>
        );

      case "privacy":
        return (
          <div className="space-y-4">
            <SettingsSection title="Privacy & Data" icon={Shield}>
              <div className="space-y-2">
                <button onClick={exportData} className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Download size={18} className="text-primary" /></div>
                    <div><p className="text-sm font-medium">Export My Data</p><p className="text-xs text-muted-foreground">Download all your data</p></div>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </button>
                <button className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center"><Trash2 size={18} className="text-destructive" /></div>
                    <div><p className="text-sm font-medium text-destructive">Delete All Conversations</p><p className="text-xs text-muted-foreground">This action cannot be undone</p></div>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </button>
              </div>
            </SettingsSection>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div className="flex flex-col min-h-screen bg-background" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => activeGroup ? setActiveGroup(null) : navigate("/chat")} className="rounded-xl h-9 w-9">
            <ArrowLeft size={18} />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles size={16} className="text-primary" />
            </div>
            <h1 className="text-lg font-serif-display font-semibold">{activeGroup ? settingsGroups.find(g => g.id === activeGroup)?.label || "Settings" : "Settings"}</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 max-w-2xl mx-auto w-full">
        {activeGroup ? (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
            {renderGroupContent()}
          </motion.div>
        ) : (
          <motion.div className="space-y-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            {settingsGroups.map((group, i) => (
              <motion.button
                key={group.id}
                onClick={() => setActiveGroup(group.id)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/20 hover:shadow-md transition-all text-left group"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className={cn("w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center flex-shrink-0", group.color)}>
                  {group.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-foreground">{group.label}</p>
                  <p className="text-sm text-muted-foreground">{group.description}</p>
                </div>
                <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </motion.button>
            ))}

            {/* Quick links to dedicated pages */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <button onClick={() => navigate("/personalization")} className="p-3 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all text-center">
                <span className="text-xs font-medium block">Personalization</span>
              </button>
              <button onClick={() => navigate("/memories")} className="p-3 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all text-center">
                <span className="text-xs font-medium block">Memories</span>
              </button>
              <button onClick={() => navigate("/artifacts")} className="p-3 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all text-center">
                <span className="text-xs font-medium block">Artifacts</span>
              </button>
            </div>

            {/* Help Link */}
            <div className="mt-6 text-center">
              <button onClick={() => navigate("/help")} className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <HelpCircle size={12} /> Need help? Visit our Help Center
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
