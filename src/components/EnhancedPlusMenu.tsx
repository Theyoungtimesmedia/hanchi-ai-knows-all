import { useState } from "react";
import { 
  Plus, X, Camera, Image as ImageIcon, FileText, Wand2, Lightbulb, 
  Search, Globe, BookOpen, Sticker, Shield, Mic, Brain, 
  GraduationCap, Bot, Sparkles, FileAudio, FileVideo
} from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Dialog, DialogContent } from "./ui/dialog";
import { ImageGenerationModal } from "./ImageGenerationModal";
import { VoiceTranslationPanel } from "./VoiceTranslationPanel";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export interface ActiveAddons {
  search?: boolean;
  thinking?: boolean;
  jailbreak?: boolean;
  deepResearch?: boolean;
  study?: boolean;
}

interface EnhancedPlusMenuProps {
  onAction?: (action: string, data?: any) => void;
  disabled?: boolean;
  activeAddons: ActiveAddons;
  onToggleAddon: (addon: keyof ActiveAddons, enabled: boolean) => void;
  onImageUpload?: () => void;
  onFileUpload?: () => void;
  onMediaUpload?: () => void;
}

interface MenuItem {
  id: keyof ActiveAddons | string;
  icon: React.ReactNode;
  label: string;
  description: string;
  isToggle?: boolean;
  isModal?: boolean;
  isNav?: boolean;
  color?: string;
}

export const EnhancedPlusMenu = ({ 
  onAction, 
  disabled, 
  activeAddons,
  onToggleAddon,
  onImageUpload,
  onFileUpload,
  onMediaUpload,
}: EnhancedPlusMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showImageGen, setShowImageGen] = useState(false);
  const [stickerMode, setStickerMode] = useState(false);
  const navigate = useNavigate();

  const quickActions: { icon: React.ReactNode; label: string; onClick: () => void }[] = [
    { icon: <Camera size={22} />, label: "Camera", onClick: () => { onImageUpload?.(); setIsOpen(false); } },
    { icon: <ImageIcon size={22} />, label: "Gallery", onClick: () => { onImageUpload?.(); setIsOpen(false); } },
    { icon: <FileText size={22} />, label: "Files", onClick: () => { onFileUpload?.(); setIsOpen(false); } },
    { icon: <FileAudio size={22} />, label: "Audio/Video", onClick: () => { onMediaUpload?.(); setIsOpen(false); } },
  ];

  const menuItems: MenuItem[] = [
    { 
      id: "create_image", 
      icon: <Wand2 size={22} />, 
      label: "Create Image", 
      description: "Generate AI images from text",
      isModal: true,
      color: "text-violet-500"
    },
    { 
      id: "create_sticker", 
      icon: <Sticker size={22} />, 
      label: "Create Sticker", 
      description: "Generate Nigerian-style stickers",
      isModal: true,
      color: "text-amber-500"
    },
    { 
      id: "search", 
      icon: <Globe size={22} />, 
      label: "Web Search", 
      description: "Search the web for current info",
      isToggle: true,
      color: "text-sky-500"
    },
    { 
      id: "thinking", 
      icon: <Lightbulb size={22} />, 
      label: "Think Deeper", 
      description: "Longer reasoning for complex questions",
      isToggle: true,
      color: "text-amber-500"
    },
    { 
      id: "deepResearch", 
      icon: <Brain size={22} />, 
      label: "Deep Research", 
      description: "Get a comprehensive report",
      isToggle: true,
      color: "text-indigo-500"
    },
    { 
      id: "study", 
      icon: <GraduationCap size={22} />, 
      label: "Study Mode", 
      description: "Learn with quizzes and explanations",
      isToggle: true,
      color: "text-emerald-500"
    },
    { 
      id: "voice_translate", 
      icon: <Mic size={22} />, 
      label: "Voice Translation", 
      description: "English ↔ Hausa ↔ Pidgin",
      isModal: true,
      color: "text-cyan-500"
    },
    { 
      id: "custom_gpt", 
      icon: <Bot size={22} />, 
      label: "Custom GPT", 
      description: "Build your own AI assistant",
      isNav: true,
      color: "text-pink-500"
    },
    { 
      id: "jailbreak", 
      icon: <Shield size={22} />, 
      label: "Unrestricted Mode", 
      description: "Remove content filters",
      isToggle: true,
      color: "text-red-500"
    },
  ];

  const handleItemClick = (item: MenuItem) => {
    if (item.isToggle) {
      const addonKey = item.id as keyof ActiveAddons;
      onToggleAddon(addonKey, !activeAddons[addonKey]);
      return;
    }

    if (item.isNav) {
      if (item.id === "custom_gpt") {
        navigate("/custom-gpt");
        setIsOpen(false);
      }
      return;
    }

    if (item.isModal) {
      if (item.id === "create_image") {
        setStickerMode(false);
        setShowImageGen(true);
        setIsOpen(false);
      } else if (item.id === "create_sticker") {
        setStickerMode(true);
        setShowImageGen(true);
        setIsOpen(false);
      } else if (item.id === "voice_translate") {
        setShowTranslation(true);
        setIsOpen(false);
      }
      return;
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            disabled={disabled}
          >
            {isOpen ? <X size={22} /> : <Plus size={22} />}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-3xl px-0 pb-10 pt-3 max-h-[85vh]">
          {/* Handle bar */}
          <div className="flex justify-center mb-5">
            <div className="w-12 h-1.5 bg-muted-foreground/20 rounded-full" />
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center justify-around px-6 pb-5 border-b border-border">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className="flex flex-col items-center gap-2.5 p-4 rounded-2xl hover:bg-muted transition-colors min-w-[90px]"
              >
                <div className="w-14 h-14 rounded-2xl bg-muted border border-border/50 flex items-center justify-center text-muted-foreground">
                  {action.icon}
                </div>
                <span className="text-sm font-medium text-foreground">{action.label}</span>
              </button>
            ))}
          </div>

          {/* Menu Items */}
          <div className="py-3 overflow-y-auto max-h-[50vh]">
            {menuItems.map((item) => {
              const addonKey = item.id as keyof ActiveAddons;
              const isActive = item.isToggle && activeAddons[addonKey];
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={cn(
                    "w-full flex items-center gap-4 px-6 py-4 hover:bg-muted/50 transition-colors text-left",
                    isActive && "bg-primary/5"
                  )}
                >
                  <div className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center",
                    isActive ? "bg-primary/10" : "bg-muted",
                    item.color || "text-muted-foreground"
                  )}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-semibold text-foreground">{item.label}</span>
                      {isActive && (
                        <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  {item.isToggle && (
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 transition-colors flex items-center justify-center",
                      isActive ? "bg-primary border-primary" : "border-muted-foreground/30"
                    )}>
                      {isActive && <div className="w-2.5 h-2.5 bg-primary-foreground rounded-full" />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer hint */}
          <div className="px-6 pt-4 border-t border-border">
            <p className="text-xs text-center text-muted-foreground">
              Toggle add-ons appear as chips above your message
            </p>
          </div>
        </SheetContent>
      </Sheet>

      {/* Image/Sticker Generation Modal */}
      <Dialog open={showImageGen} onOpenChange={setShowImageGen}>
        <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto p-0">
          <ImageGenerationModal 
            onImageGenerated={(url) => {
              onAction?.("image_generated", url);
              setShowImageGen(false);
            }}
            defaultStickerMode={stickerMode}
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
