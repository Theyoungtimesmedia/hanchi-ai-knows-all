import { useState } from "react";
import { 
  Plus, X, Camera, Image as ImageIcon, FileText, Wand2, Lightbulb, 
  Search, Globe, BookOpen, Sticker, Shield, Mic 
} from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { ImageGenerationModal } from "./ImageGenerationModal";
import { VoiceTranslationPanel } from "./VoiceTranslationPanel";
import { cn } from "@/lib/utils";

interface PlusMenuProps {
  onAction?: (action: string, data?: any) => void;
  disabled?: boolean;
  activeFeatures?: {
    thinking?: boolean;
    jailbreak?: boolean;
  };
  onToggleThinking?: (enabled: boolean) => void;
  onToggleJailbreak?: (enabled: boolean) => void;
  onImageUpload?: () => void;
  onFileUpload?: () => void;
}

interface MenuItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  isToggle?: boolean;
  isModal?: boolean;
  color?: string;
}

export const PlusMenu = ({ 
  onAction, 
  disabled, 
  activeFeatures = {},
  onToggleThinking,
  onToggleJailbreak,
  onImageUpload,
  onFileUpload
}: PlusMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showImageGen, setShowImageGen] = useState(false);
  const [showStickerGen, setShowStickerGen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const quickActions: { icon: React.ReactNode; label: string; onClick: () => void }[] = [
    { icon: <Camera size={20} />, label: "Camera", onClick: () => { onImageUpload?.(); setIsOpen(false); } },
    { icon: <ImageIcon size={20} />, label: "Photos", onClick: () => { onImageUpload?.(); setIsOpen(false); } },
    { icon: <FileText size={20} />, label: "Files", onClick: () => { onFileUpload?.(); setIsOpen(false); } },
  ];

  const menuItems: MenuItem[] = [
    { 
      id: "create_image", 
      icon: <Wand2 size={20} />, 
      label: "Create image", 
      description: "Visualize anything",
      isModal: true,
      color: "text-purple-500"
    },
    { 
      id: "create_sticker", 
      icon: <Sticker size={20} />, 
      label: "Nigerian Sticker", 
      description: "Generate WhatsApp stickers",
      isModal: true,
      color: "text-green-500"
    },
    { 
      id: "thinking", 
      icon: <Lightbulb size={20} />, 
      label: "Thinking", 
      description: "Think longer for better answers",
      isToggle: true,
      color: "text-yellow-500"
    },
    { 
      id: "web_search", 
      icon: <Globe size={20} />, 
      label: "Web search", 
      description: "Find real-time news and info",
      color: "text-blue-500"
    },
    { 
      id: "voice_translate", 
      icon: <Mic size={20} />, 
      label: "Voice Translation", 
      description: "Translate voice EN ↔ Hausa ↔ Pidgin",
      isModal: true,
      color: "text-cyan-500"
    },
    { 
      id: "study", 
      icon: <BookOpen size={20} />, 
      label: "Study and learn", 
      description: "Learn a new concept",
      color: "text-orange-500"
    },
    { 
      id: "jailbreak", 
      icon: <Shield size={20} />, 
      label: "Unrestricted Mode", 
      description: "Remove content restrictions",
      isToggle: true,
      color: "text-red-500"
    },
  ];

  const handleItemClick = (item: MenuItem) => {
    if (item.isToggle) {
      if (item.id === "thinking") {
        onToggleThinking?.(!activeFeatures.thinking);
      } else if (item.id === "jailbreak") {
        onToggleJailbreak?.(!activeFeatures.jailbreak);
      }
      return;
    }

    if (item.isModal) {
      if (item.id === "create_image") {
        setShowImageGen(true);
        setIsOpen(false);
      } else if (item.id === "create_sticker") {
        setShowStickerGen(true);
        setIsOpen(false);
      } else if (item.id === "voice_translate") {
        setShowTranslation(true);
        setIsOpen(false);
      }
      return;
    }

    if (item.id === "web_search") {
      onAction?.("web_search");
      setIsOpen(false);
    } else if (item.id === "study") {
      onAction?.("study", "Help me study and learn about...");
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Plus Button */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            disabled={disabled}
          >
            {isOpen ? <X size={22} /> : <Plus size={22} />}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[360px] p-0 rounded-2xl overflow-hidden border-border bg-card">
          {/* Quick Action Buttons */}
          <div className="flex items-center justify-around p-4 border-b border-border bg-muted/30">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted transition-colors min-w-[80px]"
              >
                <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground">
                  {action.icon}
                </div>
                <span className="text-xs font-medium text-foreground">{action.label}</span>
              </button>
            ))}
          </div>

          {/* Menu Items */}
          <div className="py-2 max-h-[400px] overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = item.isToggle && (
                (item.id === "thinking" && activeFeatures.thinking) ||
                (item.id === "jailbreak" && activeFeatures.jailbreak)
              );
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={cn(
                    "w-full flex items-center gap-4 px-4 py-3 hover:bg-muted transition-colors text-left",
                    isActive && "bg-primary/10"
                  )}
                >
                  <div className={cn("shrink-0", item.color || "text-muted-foreground")}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{item.label}</span>
                      {isActive && (
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                  </div>
                  {item.isToggle && (
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 transition-colors",
                      isActive ? "bg-primary border-primary" : "border-muted-foreground"
                    )} />
                  )}
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Generation Modal */}
      <ImageGenerationModal
        trigger={<span className="hidden" />}
        onImageGenerated={(url) => onAction?.("image_generated", url)}
      />
      
      {/* External modals */}
      <Dialog open={showImageGen} onOpenChange={setShowImageGen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <ImageGenerationModal onImageGenerated={(url) => {
            onAction?.("image_generated", url);
            setShowImageGen(false);
          }} />
        </DialogContent>
      </Dialog>

      {/* Sticker Generation Modal */}
      <Dialog open={showStickerGen} onOpenChange={setShowStickerGen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-0 bg-transparent border-none">
          <NigerianStickerModal 
            onClose={() => setShowStickerGen(false)} 
            onStickerGenerated={(url) => onAction?.("sticker_generated", url)}
          />
        </DialogContent>
      </Dialog>

      {/* Voice Translation Modal */}
      <Dialog open={showTranslation} onOpenChange={setShowTranslation}>
        <DialogContent className="sm:max-w-md p-0 bg-transparent border-none">
          <VoiceTranslationPanel onClose={() => setShowTranslation(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};

// Nigerian Sticker Generator Component
interface NigerianStickerModalProps {
  onClose: () => void;
  onStickerGenerated?: (url: string) => void;
}

import { useState as useLocalState } from "react";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Loader2, Download, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const NigerianStickerModal = ({ onClose, onStickerGenerated }: NigerianStickerModalProps) => {
  const [prompt, setPrompt] = useLocalState("");
  const [stickerType, setStickerType] = useLocalState<"pepe" | "nigerian" | "auto">("auto");
  const [isGenerating, setIsGenerating] = useLocalState(false);
  const [generatedImage, setGeneratedImage] = useLocalState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { 
          prompt, 
          style: "nigerian_sticker",
          stickerType,
          isSticker: true 
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || "Generation failed");

      setGeneratedImage(data.image_url);
      onStickerGenerated?.(data.image_url);
      toast({ title: "Sticker nosed out! 👃🏿", description: "Your Nigerian sticker is ready" });
    } catch (error) {
      console.error("Sticker generation error:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate sticker",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `hanchi-sticker-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Sticker className="text-green-500" size={24} />
        <div>
          <h3 className="text-lg font-bold text-foreground">Nigerian Sticker Generator</h3>
          <p className="text-xs text-muted-foreground">Create WhatsApp stickers with Nigerian vibes</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <Label>Sticker Type</Label>
          <Select value={stickerType} onValueChange={(v: any) => setStickerType(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto (AI decides)</SelectItem>
              <SelectItem value="pepe">Pepe the Frog Meme 🐸</SelectItem>
              <SelectItem value="nigerian">Nigerian Meme Style 🇳🇬</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Describe your sticker</Label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder='E.g. "No wahala" expression, "Comrade why??" reaction, frustrated face with "Sapa loading"'
            className="min-h-[80px] resize-none"
          />
        </div>

        {generatedImage && (
          <div className="space-y-2">
            <Label>Generated Sticker</Label>
            <div className="relative rounded-xl overflow-hidden border border-border bg-muted/50 flex items-center justify-center p-4">
              <img 
                src={generatedImage} 
                alt="Generated Sticker" 
                className="max-w-[200px] max-h-[200px] object-contain"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload} className="flex-1 gap-2">
                <Download size={16} /> Download
              </Button>
              <Button variant="outline" size="sm" onClick={handleGenerate} disabled={isGenerating} className="flex-1 gap-2">
                <RefreshCw size={16} /> Regenerate
              </Button>
            </div>
          </div>
        )}

        <Button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()} className="w-full gap-2">
          {isGenerating ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sticker size={18} />
              Generate Sticker
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg space-y-1">
          <p className="font-medium">💡 Tips for Nigerian stickers:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Use Pidgin phrases: "No wahala", "E choke", "Sapa"</li>
            <li>Add Nigerian expressions and reactions</li>
            <li>Pepe memes work great with "Comrade why??"</li>
            <li>Describe emotions: frustrated, happy, confused</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
