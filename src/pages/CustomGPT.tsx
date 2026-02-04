import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Bot, Plus, Trash2, Edit3, Play, Save, Sparkles, Globe, Brain, Code, Image as ImageIcon, MessageSquare, Mic, Eye, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CustomGPT {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  emoji: string;
  createdAt: string;
  capabilities: {
    webSearch: boolean;
    imageGeneration: boolean;
    codeExecution: boolean;
    voiceOutput: boolean;
  };
  conversationStarters: string[];
  temperature: number;
  maxTokens: number;
}

const defaultCapabilities = {
  webSearch: false,
  imageGeneration: false,
  codeExecution: false,
  voiceOutput: false,
};

export default function CustomGPT() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [gpts, setGpts] = useState<CustomGPT[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [previewMode, setPreviewMode] = useState(false);
  const [testMessage, setTestMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    systemPrompt: "",
    emoji: "🤖",
    capabilities: { ...defaultCapabilities },
    conversationStarters: ["", "", ""],
    temperature: 0.7,
    maxTokens: 2048,
  });

  useEffect(() => {
    const saved = localStorage.getItem('hanchi_custom_gpts');
    if (saved) {
      setGpts(JSON.parse(saved));
    }
  }, []);

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
      capabilities: formData.capabilities,
      conversationStarters: formData.conversationStarters.filter(s => s.trim()),
      temperature: formData.temperature,
      maxTokens: formData.maxTokens,
    };

    saveGpts([...gpts, newGpt]);
    resetForm();
    toast({ title: "Custom GPT created! 🎉" });
  };

  const handleUpdate = () => {
    if (!editingId) return;
    
    const updated = gpts.map(gpt => 
      gpt.id === editingId 
        ? { 
            ...gpt, 
            ...formData,
            conversationStarters: formData.conversationStarters.filter(s => s.trim()),
          }
        : gpt
    );
    
    saveGpts(updated);
    resetForm();
    toast({ title: "GPT updated!" });
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setActiveTab("basic");
    setPreviewMode(false);
    setFormData({
      name: "",
      description: "",
      systemPrompt: "",
      emoji: "🤖",
      capabilities: { ...defaultCapabilities },
      conversationStarters: ["", "", ""],
      temperature: 0.7,
      maxTokens: 2048,
    });
  };

  const handleDelete = (id: string) => {
    saveGpts(gpts.filter(gpt => gpt.id !== id));
    toast({ title: "GPT deleted" });
  };

  const handleUse = (gpt: CustomGPT) => {
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
      capabilities: gpt.capabilities || { ...defaultCapabilities },
      conversationStarters: [...(gpt.conversationStarters || []), "", "", ""].slice(0, 3),
      temperature: gpt.temperature || 0.7,
      maxTokens: gpt.maxTokens || 2048,
    });
    setIsCreating(true);
  };

  const updateStarter = (index: number, value: string) => {
    const newStarters = [...formData.conversationStarters];
    newStarters[index] = value;
    setFormData(f => ({ ...f, conversationStarters: newStarters }));
  };

  const emojiOptions = ["🤖", "👨‍💻", "📚", "🎨", "💼", "🎮", "🧠", "✍️", "🔬", "🌍", "👃🏿", "🚀", "💡", "🎯", "🔥"];

  const templates = [
    {
      emoji: "✍️",
      name: "Nigerian Essay Writer",
      description: "Writes in natural Nigerian Standard English",
      prompt: "You are a Nigerian essay writer. Write in clear Nigerian Standard English - not Pidgin, not British academic English. Use simple direct words. Never use AI words like 'delve', 'tapestry', 'multifaceted'. Include Nigerian context when relevant.",
      capabilities: { webSearch: false, imageGeneration: false, codeExecution: false, voiceOutput: false },
    },
    {
      emoji: "💼",
      name: "Nigerian CV Expert",
      description: "Creates professional Nigerian-format CVs",
      prompt: "You are an expert at creating Nigerian-style CVs and cover letters. You understand what Nigerian employers look for, proper formatting for Nigerian job applications, and how to highlight relevant experience for the Nigerian job market.",
      capabilities: { webSearch: true, imageGeneration: false, codeExecution: false, voiceOutput: false },
    },
    {
      emoji: "📚",
      name: "WAEC/JAMB Tutor",
      description: "Helps with exam preparation",
      prompt: "You are an experienced Nigerian tutor specializing in WAEC, JAMB, and NECO preparation. Explain concepts clearly, provide practice questions, and give exam tips. Focus on the Nigerian curriculum and common exam patterns.",
      capabilities: { webSearch: true, imageGeneration: false, codeExecution: false, voiceOutput: true },
    },
    {
      emoji: "👨‍💻",
      name: "Code Assistant",
      description: "Helps write and debug code",
      prompt: "You are an expert programmer. Help users write, debug, and understand code in any programming language. Provide clear explanations, best practices, and working examples. Always consider security and performance.",
      capabilities: { webSearch: true, imageGeneration: false, codeExecution: true, voiceOutput: false },
    }
  ];

  return (
    <motion.div 
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/chat')} className="rounded-xl h-9 w-9">
            <ArrowLeft size={18} />
          </Button>
          <div className="flex-1">
            <h1 className="text-base font-semibold flex items-center gap-2">
              <Bot size={18} className="text-primary" />
              Custom GPT Builder
            </h1>
            <p className="text-[10px] text-muted-foreground">Create personalized AI assistants</p>
          </div>
          {!isCreating && (
            <Button onClick={() => setIsCreating(true)} size="sm" className="gap-1.5 rounded-xl">
              <Plus size={14} />
              Create
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-4">
        {/* Create/Edit Form */}
        {isCreating && (
          <Card className="mb-6 border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Sparkles className="text-primary" size={18} />
                    {editingId ? "Edit Custom GPT" : "Create New Custom GPT"}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Define how your custom AI assistant should behave
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={previewMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPreviewMode(!previewMode)}
                    className="gap-1.5 rounded-xl text-xs"
                  >
                    <Eye size={12} />
                    Preview
                  </Button>
                  <Button variant="ghost" size="icon" onClick={resetForm} className="h-8 w-8 rounded-xl">
                    <X size={14} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {previewMode ? (
                /* Preview Mode */
                <div className="rounded-xl bg-muted/30 p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                      {formData.emoji}
                    </div>
                    <div>
                      <h3 className="font-semibold">{formData.name || "Untitled GPT"}</h3>
                      <p className="text-xs text-muted-foreground">{formData.description || "No description"}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {formData.capabilities.webSearch && <Badge variant="secondary" className="text-[10px]"><Globe size={10} className="mr-1" />Web Search</Badge>}
                    {formData.capabilities.imageGeneration && <Badge variant="secondary" className="text-[10px]"><ImageIcon size={10} className="mr-1" />Images</Badge>}
                    {formData.capabilities.codeExecution && <Badge variant="secondary" className="text-[10px]"><Code size={10} className="mr-1" />Code</Badge>}
                    {formData.capabilities.voiceOutput && <Badge variant="secondary" className="text-[10px]"><Mic size={10} className="mr-1" />Voice</Badge>}
                  </div>

                  {formData.conversationStarters.filter(s => s.trim()).length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-muted-foreground">Conversation Starters</p>
                      {formData.conversationStarters.filter(s => s.trim()).map((starter, i) => (
                        <div key={i} className="p-2 rounded-lg bg-background text-xs">{starter}</div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-border/50">
                    <Input
                      placeholder="Test your GPT..."
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      className="h-9 text-xs rounded-xl"
                    />
                  </div>
                </div>
              ) : (
                /* Edit Mode */
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4 h-9 p-1 bg-muted/50 rounded-xl mb-4">
                    <TabsTrigger value="basic" className="text-[10px] rounded-lg">Basic</TabsTrigger>
                    <TabsTrigger value="capabilities" className="text-[10px] rounded-lg">Capabilities</TabsTrigger>
                    <TabsTrigger value="starters" className="text-[10px] rounded-lg">Starters</TabsTrigger>
                    <TabsTrigger value="advanced" className="text-[10px] rounded-lg">Advanced</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4">
                    {/* Emoji Selector */}
                    <div className="space-y-2">
                      <Label className="text-xs">Icon</Label>
                      <div className="flex flex-wrap gap-1.5">
                        {emojiOptions.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => setFormData(f => ({ ...f, emoji }))}
                            className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
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

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-xs">Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                          placeholder="e.g., Nigerian Essay Writer"
                          className="h-9 text-sm rounded-xl"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="description" className="text-xs">Description</Label>
                        <Input
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                          placeholder="Short description"
                          className="h-9 text-sm rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="systemPrompt" className="text-xs">Instructions (System Prompt)</Label>
                      <Textarea
                        id="systemPrompt"
                        value={formData.systemPrompt}
                        onChange={(e) => setFormData(f => ({ ...f, systemPrompt: e.target.value }))}
                        placeholder="Tell the AI how to behave..."
                        className="min-h-[120px] text-sm rounded-xl"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="capabilities" className="space-y-3">
                    <p className="text-xs text-muted-foreground mb-3">Enable features for your GPT</p>
                    
                    {[
                      { key: 'webSearch', icon: Globe, label: 'Web Search', desc: 'Search the internet' },
                      { key: 'imageGeneration', icon: ImageIcon, label: 'Image Generation', desc: 'Create images' },
                      { key: 'codeExecution', icon: Code, label: 'Code Execution', desc: 'Run code snippets' },
                      { key: 'voiceOutput', icon: Mic, label: 'Voice Output', desc: 'Speak responses' },
                    ].map(({ key, icon: Icon, label, desc }) => (
                      <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon size={14} className="text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{label}</p>
                            <p className="text-[10px] text-muted-foreground">{desc}</p>
                          </div>
                        </div>
                        <Switch
                          checked={formData.capabilities[key as keyof typeof formData.capabilities]}
                          onCheckedChange={(checked) => 
                            setFormData(f => ({ 
                              ...f, 
                              capabilities: { ...f.capabilities, [key]: checked } 
                            }))
                          }
                        />
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="starters" className="space-y-3">
                    <p className="text-xs text-muted-foreground mb-3">Add example prompts users can click to start</p>
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Starter {i + 1}</Label>
                        <Input
                          value={formData.conversationStarters[i] || ""}
                          onChange={(e) => updateStarter(i, e.target.value)}
                          placeholder={`e.g., "Help me write an essay about..."`}
                          className="h-9 text-sm rounded-xl"
                        />
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="advanced" className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-xs">Temperature</Label>
                          <span className="text-xs text-muted-foreground">{formData.temperature}</span>
                        </div>
                        <Slider
                          value={[formData.temperature]}
                          onValueChange={([v]) => setFormData(f => ({ ...f, temperature: v }))}
                          min={0}
                          max={2}
                          step={0.1}
                        />
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Lower = more focused, Higher = more creative
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-xs">Max Tokens</Label>
                          <span className="text-xs text-muted-foreground">{formData.maxTokens}</span>
                        </div>
                        <Slider
                          value={[formData.maxTokens]}
                          onValueChange={([v]) => setFormData(f => ({ ...f, maxTokens: v }))}
                          min={256}
                          max={4096}
                          step={256}
                        />
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Maximum response length
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={resetForm} className="rounded-xl">
                  Cancel
                </Button>
                <Button size="sm" onClick={editingId ? handleUpdate : handleCreate} className="gap-1.5 rounded-xl">
                  <Save size={14} />
                  {editingId ? "Update" : "Create"} GPT
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* GPT List */}
        <div className="space-y-3">
          <h2 className="text-xs font-medium text-muted-foreground">Your Custom GPTs</h2>
          
          {gpts.length === 0 ? (
            <Card className="border-dashed border-border/50">
              <CardContent className="py-8 text-center">
                <Bot size={40} className="mx-auto text-muted-foreground mb-3" />
                <h3 className="font-medium text-sm mb-1">No custom GPTs yet</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Create your first custom AI assistant
                </p>
                <Button onClick={() => setIsCreating(true)} variant="outline" size="sm" className="gap-1.5 rounded-xl">
                  <Plus size={14} />
                  Create Custom GPT
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {gpts.map((gpt) => (
                <Card key={gpt.id} className="group hover:border-primary/30 transition-colors border-border/50">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl shrink-0">
                        {gpt.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">{gpt.name}</h3>
                        <p className="text-[10px] text-muted-foreground line-clamp-1">
                          {gpt.description || "No description"}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {gpt.capabilities?.webSearch && <Badge variant="outline" className="text-[8px] px-1 py-0">Web</Badge>}
                          {gpt.capabilities?.imageGeneration && <Badge variant="outline" className="text-[8px] px-1 py-0">Image</Badge>}
                          {gpt.capabilities?.codeExecution && <Badge variant="outline" className="text-[8px] px-1 py-0">Code</Badge>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-border/50">
                      <Button 
                        size="sm" 
                        className="flex-1 gap-1 h-8 rounded-xl text-xs"
                        onClick={() => handleUse(gpt)}
                      >
                        <Play size={12} />
                        Use
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-8 w-8 rounded-xl"
                        onClick={() => startEdit(gpt)}
                      >
                        <Edit3 size={12} />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-8 w-8 rounded-xl text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleDelete(gpt.id)}
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Templates */}
        <div className="mt-6 space-y-3">
          <h2 className="text-xs font-medium text-muted-foreground">Templates</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {templates.map((template, i) => (
              <Card 
                key={i} 
                className="cursor-pointer hover:border-primary/30 transition-colors border-border/50"
                onClick={() => {
                  setFormData({
                    emoji: template.emoji,
                    name: template.name,
                    description: template.description,
                    systemPrompt: template.prompt,
                    capabilities: template.capabilities,
                    conversationStarters: ["", "", ""],
                    temperature: 0.7,
                    maxTokens: 2048,
                  });
                  setIsCreating(true);
                }}
              >
                <CardContent className="p-3 flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-lg">
                    {template.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-xs">{template.name}</h3>
                    <p className="text-[10px] text-muted-foreground truncate">{template.description}</p>
                  </div>
                  <Plus size={14} className="text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </motion.div>
  );
}
