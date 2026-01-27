import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, Brain, Globe, Moon, Sun, Volume2, 
  Trash2, Check, Sparkles, PenTool, Mic, Bell,
  Shield, HelpCircle, ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  SettingsSection, 
  SettingsToggle, 
  ModelPreferenceSelector,
  WritingStyleSelector 
} from "@/components/settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LANGUAGES = [
  { code: "en", name: "English (Nigeria)", flag: "🇳🇬" },
  { code: "en-us", name: "English (US)", flag: "🇺🇸" },
  { code: "ha", name: "Hausa", flag: "🇳🇬" },
  { code: "pidgin", name: "Pidgin", flag: "🇳🇬" },
];

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [memories, setMemories] = useState<any[]>([]);
  const [currentLang, setCurrentLang] = useState(LANGUAGES[0]);
  const [preferences, setPreferences] = useState({
    voice_enabled: true,
    study_mode: false,
    dark_mode: false,
    default_model: "gemini-flash",
    writing_style: "default",
    notifications_enabled: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUserId(session.user.id);
      loadUserData(session.user.id);
    });
  }, [navigate]);

  const loadUserData = async (uid: string) => {
    try {
      const { data: prefs } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", uid)
        .single();

      if (prefs) {
        setPreferences({
          voice_enabled: prefs.voice_enabled ?? true,
          study_mode: prefs.study_mode ?? false,
          dark_mode: false,
          default_model: "gemini-flash",
          writing_style: "default",
          notifications_enabled: true,
        });

        const lang = LANGUAGES.find((l) => l.code === prefs.preferred_language);
        if (lang) setCurrentLang(lang);
      }

      const { data: mems } = await supabase
        .from("user_memory")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });

      setMemories(mems || []);
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key: string, value: boolean | string) => {
    if (!userId) return;

    // Update local state immediately
    setPreferences((prev) => ({ ...prev, [key]: value }));

    // Only persist certain prefs to database
    const dbKeys = ["voice_enabled", "study_mode"];
    if (dbKeys.includes(key)) {
      try {
        const { error } = await supabase
          .from("user_preferences")
          .upsert({
            user_id: userId,
            [key]: value,
          });

        if (error) throw error;
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save preference.",
          variant: "destructive",
        });
      }
    }

    toast({
      title: "Updated",
      description: "Your settings have been saved.",
    });
  };

  const updateLanguage = async (lang: (typeof LANGUAGES)[0]) => {
    if (!userId) return;

    setCurrentLang(lang);

    try {
      await supabase.from("user_preferences").upsert({
        user_id: userId,
        preferred_language: lang.code,
      });
      toast({ title: "Language updated" });
    } catch (error) {
      console.error("Error updating language:", error);
    }
  };

  const deleteMemory = async (memoryId: string) => {
    try {
      const { error } = await supabase
        .from("user_memory")
        .delete()
        .eq("id", memoryId);

      if (error) throw error;

      setMemories((prev) => prev.filter((m) => m.id !== memoryId));
      toast({ title: "Memory deleted" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete memory.",
        variant: "destructive",
      });
    }
  };

  const clearAllMemories = async () => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("user_memory")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;

      setMemories([]);
      toast({ title: "All memories cleared" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear memories.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-lg border-b border-border p-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </div>

      <div className="flex-1 p-4 max-w-2xl mx-auto w-full">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="ai">AI & Writing</TabsTrigger>
            <TabsTrigger value="memory">Memory</TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-4">
            {/* Language */}
            <SettingsSection title="Language" icon={Globe}>
              <div className="grid gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => updateLanguage(lang)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      currentLang.code === lang.code
                        ? "border-primary bg-primary/5"
                        : "border-transparent bg-muted/50 hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{lang.flag}</span>
                      <span className="font-medium text-sm">{lang.name}</span>
                    </div>
                    {currentLang.code === lang.code && (
                      <Check size={16} className="text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </SettingsSection>

            {/* Appearance */}
            <SettingsSection title="Appearance" icon={Sun}>
              <SettingsToggle
                icon={Moon}
                label="Dark Mode"
                description="Switch to dark theme"
                checked={preferences.dark_mode}
                onChange={(v) => updatePreference("dark_mode", v)}
              />
            </SettingsSection>

            {/* Notifications */}
            <SettingsSection title="Notifications" icon={Bell}>
              <SettingsToggle
                icon={Bell}
                label="Push Notifications"
                description="Get notified about updates"
                checked={preferences.notifications_enabled}
                onChange={(v) => updatePreference("notifications_enabled", v)}
              />
            </SettingsSection>
          </TabsContent>

          {/* AI & Writing Tab */}
          <TabsContent value="ai" className="space-y-4">
            {/* Default Model */}
            <SettingsSection title="Default AI Model" icon={Sparkles}>
              <p className="text-xs text-muted-foreground mb-3">
                Choose which AI model to use by default
              </p>
              <ModelPreferenceSelector
                value={preferences.default_model}
                onChange={(v) => updatePreference("default_model", v)}
              />
            </SettingsSection>

            {/* Writing Style */}
            <SettingsSection title="Writing Tone" icon={PenTool}>
              <p className="text-xs text-muted-foreground mb-3">
                Set the default tone for AI responses
              </p>
              <WritingStyleSelector
                value={preferences.writing_style}
                onChange={(v) => updatePreference("writing_style", v)}
              />
            </SettingsSection>

            {/* Voice Settings */}
            <SettingsSection title="Voice & Audio" icon={Mic}>
              <SettingsToggle
                icon={Volume2}
                label="Voice Output"
                description="Enable text-to-speech for responses"
                checked={preferences.voice_enabled}
                onChange={(v) => updatePreference("voice_enabled", v)}
              />
              <SettingsToggle
                icon={Mic}
                label="Study Mode"
                description="Enhanced learning features"
                checked={preferences.study_mode}
                onChange={(v) => updatePreference("study_mode", v)}
              />
            </SettingsSection>
          </TabsContent>

          {/* Memory Tab */}
          <TabsContent value="memory" className="space-y-4">
            <SettingsSection title="Your Memory" icon={Brain}>
              <p className="text-xs text-muted-foreground mb-4">
                Hanchi remembers these facts about you to personalize responses.
                You can delete individual memories or clear all.
              </p>

              {memories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="mx-auto mb-2 opacity-50" size={32} />
                  <p className="text-sm">No memories yet.</p>
                  <p className="text-xs">Chat with Hanchi to build your profile.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2 mb-4">
                    {memories.slice(0, 10).map((memory) => (
                      <div
                        key={memory.id}
                        className="flex items-start justify-between p-3 rounded-xl bg-muted/50"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              {memory.category}
                            </span>
                          </div>
                          <p className="text-sm font-medium">{memory.memory_key}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {memory.memory_value}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMemory(memory.id)}
                          className="flex-shrink-0 h-8 w-8 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {memories.length > 0 && (
                    <Button
                      variant="outline"
                      className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={clearAllMemories}
                    >
                      <Trash2 size={14} className="mr-2" />
                      Clear All Memories
                    </Button>
                  )}
                </>
              )}
            </SettingsSection>

            {/* Privacy */}
            <SettingsSection title="Privacy & Data" icon={Shield}>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-left">
                  <span className="text-sm">Export My Data</span>
                  <ExternalLink size={14} className="text-muted-foreground" />
                </button>
                <button className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-left">
                  <span className="text-sm">Delete All Conversations</span>
                  <Trash2 size={14} className="text-destructive" />
                </button>
              </div>
            </SettingsSection>
          </TabsContent>
        </Tabs>

        {/* Help Link */}
        <div className="mt-6 text-center">
          <button 
            onClick={() => navigate("/help")}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <HelpCircle size={14} />
            Need help? Visit our Help Center
          </button>
        </div>
      </div>
    </div>
  );
}
