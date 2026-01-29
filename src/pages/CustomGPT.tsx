import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bot, Plus, Trash2, Edit3, Play, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CustomGPT {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  emoji: string;
  createdAt: string;
}

export default function CustomGPT() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [gpts, setGpts] = useState<CustomGPT[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    systemPrompt: "",
    emoji: "🤖",
  });

  // Load GPTs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('hanchi_custom_gpts');
    if (saved) {
      setGpts(JSON.parse(saved));
    }
  }, []);

  // Save GPTs to localStorage
  const saveGpts = (newGpts: CustomGPT[]) => {
    setGpts(newGpts);
    localStorage.setItem('hanchi_custom_gpts', JSON.stringify(newGpts));
  };

  const handleCreate = () => {
    if (!formData.name.trim() || !formData.systemPrompt.trim()) {
      toast({ title: "Please fill in name and instructions", variant: "destructive" });
      return;
    }

    const newGpt: CustomGPT = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      systemPrompt: formData.systemPrompt,
      emoji: formData.emoji,
      createdAt: new Date().toISOString(),
    };

    saveGpts([...gpts, newGpt]);
    setFormData({ name: "", description: "", systemPrompt: "", emoji: "🤖" });
    setIsCreating(false);
    toast({ title: "Custom GPT created! 🎉" });
  };

  const handleUpdate = () => {
    if (!editingId) return;
    
    const updated = gpts.map(gpt => 
      gpt.id === editingId 
        ? { ...gpt, ...formData }
        : gpt
    );
    
    saveGpts(updated);
    setEditingId(null);
    setFormData({ name: "", description: "", systemPrompt: "", emoji: "🤖" });
    toast({ title: "GPT updated!" });
  };

  const handleDelete = (id: string) => {
    saveGpts(gpts.filter(gpt => gpt.id !== id));
    toast({ title: "GPT deleted" });
  };

  const handleUse = (gpt: CustomGPT) => {
    // Store the selected GPT in session storage for use in chat
    sessionStorage.setItem('hanchi_active_custom_gpt', JSON.stringify(gpt));
    navigate('/chat');
    toast({ title: `Now using ${gpt.name}`, description: gpt.description });
  };

  const startEdit = (gpt: CustomGPT) => {
    setEditingId(gpt.id);
    setFormData({
      name: gpt.name,
      description: gpt.description,
      systemPrompt: gpt.systemPrompt,
      emoji: gpt.emoji,
    });
    setIsCreating(true);
  };

  const emojiOptions = ["🤖", "👨‍💻", "📚", "🎨", "💼", "🎮", "🧠", "✍️", "🔬", "🌍", "👃🏿", "🚀"];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/chat')}>
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <Bot size={20} className="text-primary" />
              Custom GPT Builder
            </h1>
            <p className="text-xs text-muted-foreground">Create personalized AI assistants</p>
          </div>
          {!isCreating && (
            <Button onClick={() => setIsCreating(true)} className="gap-2">
              <Plus size={16} />
              Create
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Create/Edit Form */}
        {isCreating && (
          <Card className="mb-6 animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="text-primary" size={20} />
                {editingId ? "Edit Custom GPT" : "Create New Custom GPT"}
              </CardTitle>
              <CardDescription>
                Define how your custom AI assistant should behave
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Emoji Selector */}
              <div className="space-y-2">
                <Label>Choose an Icon</Label>
                <div className="flex flex-wrap gap-2">
                  {emojiOptions.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setFormData(f => ({ ...f, emoji }))}
                      className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                        formData.emoji === emoji 
                          ? 'bg-primary/20 ring-2 ring-primary' 
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g., Nigerian Essay Writer"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Short Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                  placeholder="e.g., Writes essays in natural Nigerian English"
                />
              </div>

              {/* System Prompt */}
              <div className="space-y-2">
                <Label htmlFor="systemPrompt">Instructions (System Prompt)</Label>
                <Textarea
                  id="systemPrompt"
                  value={formData.systemPrompt}
                  onChange={(e) => setFormData(f => ({ ...f, systemPrompt: e.target.value }))}
                  placeholder="Tell the AI how to behave, what personality to have, what to focus on..."
                  className="min-h-[150px]"
                />
                <p className="text-xs text-muted-foreground">
                  Tip: Be specific about tone, expertise areas, and response style
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => {
                  setIsCreating(false);
                  setEditingId(null);
                  setFormData({ name: "", description: "", systemPrompt: "", emoji: "🤖" });
                }}>
                  Cancel
                </Button>
                <Button onClick={editingId ? handleUpdate : handleCreate} className="gap-2">
                  <Save size={16} />
                  {editingId ? "Update" : "Create"} GPT
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* GPT List */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">Your Custom GPTs</h2>
          
          {gpts.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Bot size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-1">No custom GPTs yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first custom AI assistant
                </p>
                <Button onClick={() => setIsCreating(true)} variant="outline" className="gap-2">
                  <Plus size={16} />
                  Create Custom GPT
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {gpts.map((gpt) => (
                <Card key={gpt.id} className="group hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">
                        {gpt.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{gpt.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {gpt.description || "No description"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
                      <Button 
                        size="sm" 
                        className="flex-1 gap-1.5"
                        onClick={() => handleUse(gpt)}
                      >
                        <Play size={14} />
                        Use
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => startEdit(gpt)}
                      >
                        <Edit3 size={14} />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleDelete(gpt.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Example Templates */}
        <div className="mt-8 space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">Example Templates</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                emoji: "✍️",
                name: "Nigerian Essay Writer",
                description: "Writes in natural Nigerian Standard English",
                prompt: "You are a Nigerian essay writer. Write in clear Nigerian Standard English - not Pidgin, not British academic English. Use simple direct words. Never use AI words like 'delve', 'tapestry', 'multifaceted'. Include Nigerian context when relevant."
              },
              {
                emoji: "💼",
                name: "Nigerian CV Expert",
                description: "Creates professional Nigerian-format CVs",
                prompt: "You are an expert at creating Nigerian-style CVs and cover letters. You understand what Nigerian employers look for, proper formatting for Nigerian job applications, and how to highlight relevant experience for the Nigerian job market."
              },
              {
                emoji: "📚",
                name: "WAEC/JAMB Tutor",
                description: "Helps with exam preparation",
                prompt: "You are an experienced Nigerian tutor specializing in WAEC, JAMB, and NECO preparation. Explain concepts clearly, provide practice questions, and give exam tips. Focus on the Nigerian curriculum and common exam patterns."
              },
              {
                emoji: "🎨",
                name: "Social Media Manager",
                description: "Creates engaging Nigerian content",
                prompt: "You are a Nigerian social media expert. Create engaging content for Instagram, Twitter, TikTok that resonates with Nigerian audiences. Understand Nigerian trends, humor, and cultural references."
              }
            ].map((template, i) => (
              <Card 
                key={i} 
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => {
                  setFormData({
                    emoji: template.emoji,
                    name: template.name,
                    description: template.description,
                    systemPrompt: template.prompt,
                  });
                  setIsCreating(true);
                }}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl">
                    {template.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm">{template.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{template.description}</p>
                  </div>
                  <Plus size={16} className="text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
