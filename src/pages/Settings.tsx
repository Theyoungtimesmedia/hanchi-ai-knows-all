import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Trash2, ArrowLeft, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [memories, setMemories] = useState<any[]>([]);
  const [preferences, setPreferences] = useState({
    voice_enabled: true,
    study_mode: false,
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
      // Load preferences
      const { data: prefs } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", uid)
        .single();

      if (prefs) {
        setPreferences({
          voice_enabled: prefs.voice_enabled,
          study_mode: prefs.study_mode,
        });
      }

      // Load memories
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your preferences and memory</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Customize how Hanchi works for you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="voice">Voice Features</Label>
                <p className="text-sm text-muted-foreground">Enable voice input and output</p>
              </div>
              <Switch
                id="voice"
                checked={preferences.voice_enabled}
                onCheckedChange={(checked) => updatePreference("voice_enabled", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="study">Study Mode</Label>
                <p className="text-sm text-muted-foreground">Optimize for WAEC/JAMB/NECO prep</p>
              </div>
              <Switch
                id="study"
                checked={preferences.study_mode}
                onCheckedChange={(checked) => updatePreference("study_mode", checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <CardTitle>Your Memory</CardTitle>
            </div>
            <CardDescription>
              Hanchi remembers these facts about you to personalize responses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {memories.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No memories yet. Chat with Hanchi to build your profile.
              </p>
            ) : (
              <div className="space-y-2">
                {memories.map((memory) => (
                  <div
                    key={memory.id}
                    className="flex items-start justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {memory.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(memory.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{memory.memory_key}</p>
                      <p className="text-sm text-muted-foreground">{memory.memory_value}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMemory(memory.id)}
                      className="flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}