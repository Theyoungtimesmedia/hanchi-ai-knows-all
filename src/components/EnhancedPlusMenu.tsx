import { useState } from "react";
import { 
  Plus, X, Camera, Image as ImageIcon, FileText, Wand2, Lightbulb, 
  Search, Globe, BookOpen, Sticker, Shield, Mic, Brain, ShoppingCart,
  GraduationCap, Bot
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
  onFileUpload
}: EnhancedPlusMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showImageGen, setShowImageGen] = useState(false);
  const navigate = useNavigate();

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
      id: "thinking", 
      icon: <Lightbulb size={20} />, 
      label: "Thinking", 
      description: "Think longer for better answers",
      isToggle: true,
      color: "text-yellow-500"
    },
    { 
      id: "deepResearch", 
      icon: <Brain size={20} />, 
      label: "Deep research", 
      description: "Get a detailed report",
      isToggle: true,
      color: "text-indigo-500"
    },
    { 
      id: "search", 
      icon: <Globe size={20} />, 
      label: "Web search", 
      description: "Find real-time news and info",
      isToggle: true,
      color: "text-blue-500"
    },
    { 
      id: "study", 
      icon: <GraduationCap size={20} />, 
      label: "Study and learn", 
      description: "Learn a new concept",
      isToggle: true,
      color: "text-orange-500"
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
      id: "custom_gpt", 
      icon: <Bot size={20} />, 
      label: "Custom GPT", 
      description: "Build your own AI assistant",
      isNav: true,
      color: "text-pink-500"
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
            className="h-10 w-10 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            disabled={disabled}
          >
            {isOpen ? <X size={22} /> : <Plus size={22} />}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-3xl px-0 pb-8 pt-3 max-h-[85vh]">
          {/* Handle bar */}
          <div className="flex justify-center mb-4">
            <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center justify-around px-4 pb-4 border-b border-border">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted transition-colors min-w-[80px]"
              >
                <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground">
                  {action.icon}
                </div>
                <span className="text-xs font-medium text-foreground">{action.label}</span>
              </button>
            ))}
          </div>

          {/* Menu Items */}
          <div className="py-2 overflow-y-auto max-h-[50vh]">
            {menuItems.map((item) => {
              const addonKey = item.id as keyof ActiveAddons;
              const isActive = item.isToggle && activeAddons[addonKey];
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={cn(
                    "w-full flex items-center gap-4 px-6 py-4 hover:bg-muted transition-colors text-left",
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
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  {item.isToggle && (
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 transition-colors flex items-center justify-center",
                      isActive ? "bg-primary border-primary" : "border-muted-foreground"
                    )}>
                      {isActive && <div className="w-2 h-2 bg-primary-foreground rounded-full" />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>

      {/* Image Generation Modal */}
      <Dialog open={showImageGen} onOpenChange={setShowImageGen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <ImageGenerationModal onImageGenerated={(url) => {
            onAction?.("image_generated", url);
            setShowImageGen(false);
          }} />
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
