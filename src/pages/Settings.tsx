import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowLeft, Brain, Globe, Moon, Volume2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LANGUAGES = [
  { code: 'en', name: 'English (Nigeria)', flag: '🇳🇬' },
  { code: 'en-us', name: 'English (US)', flag: '🇺🇸' },
  { code: 'ha', name: 'Hausa', flag: '🇳🇬' },
  { code: 'pidgin', name: 'Pidgin', flag: '🇳🇬' },
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
        });
        
        const lang = LANGUAGES.find(l => l.code === prefs.preferred_language);
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

  const updatePreference = async (key: string, value: boolean) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("user_preferences")
        .upsert({
          user_id: userId,
          [key]: value,
        });

      if (error) throw error;

      setPreferences((prev) => ({ ...prev, [key]: value }));
      toast({
        title: "Preference updated",
        description: "Your settings have been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update preferences.",
        variant: "destructive",
      });
    }
  };

  const updateLanguage = async (lang: typeof LANGUAGES[0]) => {
    if (!userId) return;
    
    setCurrentLang(lang);
    
    try {
      await supabase
        .from("user_preferences")
        .upsert({
          user_id: userId,
          preferred_language: lang.code,
        });
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
      toast({
        title: "Memory deleted",
        description: "This memory has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete memory.",
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
    <div className="flex flex-col min-h-screen bg-background animate-fade-in">
      {/* Header */}
      <div className="bg-card p-6 shadow-sm flex items-center gap-4 z-10 border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="rounded-full hover:bg-muted"
        >
          <ArrowLeft size={24} />
        </Button>
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
      </div>

      <div className="p-6 max-w-2xl mx-auto w-full space-y-6">
        {/* Language Section */}
        <div className="bg-card rounded-3xl p-6 shadow-sm border border-border">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Globe className="text-primary" size={20} /> Language
          </h2>
          <div className="grid gap-3">
            {LANGUAGES.map((lang) => (
              <button 
                key={lang.code}
                onClick={() => updateLanguage(lang)}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  currentLang.code === lang.code 
                    ? 'border-primary bg-primary/5 text-primary' 
                    : 'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="font-medium">{lang.name}</span>
                </div>
                {currentLang.code === lang.code && <Check size={20} />}
              </button>
            ))}
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-card rounded-3xl p-6 shadow-sm border border-border">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Volume2 className="text-primary" size={20} /> Preferences
          </h2>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between p-3 hover:bg-muted rounded-xl transition-colors">
              <div className="flex items-center gap-3 text-foreground">
                <Moon size={20} /> <span>Dark Mode</span>
              </div>
              <button 
                onClick={() => updatePreference('dark_mode', !preferences.dark_mode)}
                className={`w-12 h-6 rounded-full relative transition-colors ${
                  preferences.dark_mode ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <div className={`w-5 h-5 bg-card rounded-full absolute top-0.5 shadow-sm transition-all ${
                  preferences.dark_mode ? 'right-0.5' : 'left-0.5'
                }`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between p-3 hover:bg-muted rounded-xl transition-colors">
              <div className="flex items-center gap-3 text-foreground">
                <Volume2 size={20} /> <span>Voice Output</span>
              </div>
              <button 
                onClick={() => updatePreference('voice_enabled', !preferences.voice_enabled)}
                className={`w-12 h-6 rounded-full relative transition-colors ${
                  preferences.voice_enabled ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <div className={`w-5 h-5 bg-card rounded-full absolute top-0.5 shadow-sm transition-all ${
                  preferences.voice_enabled ? 'right-0.5' : 'left-0.5'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Memory Section */}
        <div className="bg-card rounded-3xl p-6 shadow-sm border border-border">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Brain className="text-primary" size={20} /> Your Memory
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Hanchi remembers these facts about you to personalize responses
          </p>
          
          {memories.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No memories yet. Chat with Hanchi to build your profile.
            </p>
          ) : (
            <div className="space-y-2">
              {memories.map((memory) => (
                <div
                  key={memory.id}
                  className="flex items-start justify-between p-4 rounded-2xl bg-muted/50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {memory.category}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(memory.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{memory.memory_key}</p>
                    <p className="text-sm text-muted-foreground">{memory.memory_value}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMemory(memory.id)}
                    className="flex-shrink-0 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
