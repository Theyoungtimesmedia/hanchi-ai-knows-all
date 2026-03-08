import { useState } from "react";
import { 
  Plus, X, Camera, Image as ImageIcon, FileText, 
  Globe, Lightbulb, Shield, Brain, GraduationCap, FileAudio
} from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { cn } from "@/lib/utils";

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

interface AddonItem {
  id: keyof ActiveAddons;
  icon: React.ReactNode;
  label: string;
  description: string;
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

  const quickActions: { icon: React.ReactNode; label: string; onClick: () => void }[] = [
    { icon: <Camera size={22} />, label: "Camera", onClick: () => { onImageUpload?.(); setIsOpen(false); } },
    { icon: <ImageIcon size={22} />, label: "Gallery", onClick: () => { onImageUpload?.(); setIsOpen(false); } },
    { icon: <FileText size={22} />, label: "Files", onClick: () => { onFileUpload?.(); setIsOpen(false); } },
    { icon: <FileAudio size={22} />, label: "Audio/Video", onClick: () => { onMediaUpload?.(); setIsOpen(false); } },
  ];

  const addonItems: AddonItem[] = [
    { id: "search", icon: <Globe size={22} />, label: "Web Search", description: "Search the web for current info", color: "text-sky-500" },
    { id: "thinking", icon: <Lightbulb size={22} />, label: "Think Deeper", description: "Longer reasoning for complex questions", color: "text-amber-500" },
    { id: "deepResearch", icon: <Brain size={22} />, label: "Deep Research", description: "Get a comprehensive report", color: "text-indigo-500" },
    { id: "study", icon: <GraduationCap size={22} />, label: "Study Mode", description: "Learn with quizzes and explanations", color: "text-emerald-500" },
    { id: "jailbreak", icon: <Shield size={22} />, label: "Unrestricted Mode", description: "Remove content filters", color: "text-red-500" },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon"
          className="h-11 w-11 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          disabled={disabled}>
          {isOpen ? <X size={22} /> : <Plus size={22} />}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl px-0 pb-10 pt-3 max-h-[70vh]">
        <div className="flex justify-center mb-5">
          <div className="w-12 h-1.5 bg-muted-foreground/20 rounded-full" />
        </div>

        {/* Quick Attach */}
        <div className="flex items-center justify-around px-6 pb-5 border-b border-border">
          {quickActions.map((action, index) => (
            <button key={index} onClick={action.onClick}
              className="flex flex-col items-center gap-2.5 p-4 rounded-2xl hover:bg-muted transition-colors min-w-[80px]">
              <div className="w-14 h-14 rounded-2xl bg-muted border border-border/50 flex items-center justify-center text-muted-foreground">
                {action.icon}
              </div>
              <span className="text-sm font-medium text-foreground">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Add-on Toggles */}
        <div className="py-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-2">Add-ons</p>
          {addonItems.map((item) => {
            const isActive = activeAddons[item.id];
            return (
              <button key={item.id}
                onClick={() => onToggleAddon(item.id, !isActive)}
                className={cn("w-full flex items-center gap-4 px-6 py-4 hover:bg-muted/50 transition-colors text-left", isActive && "bg-primary/5")}>
                <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", isActive ? "bg-primary/10" : "bg-muted", item.color)}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-foreground">{item.label}</span>
                    {isActive && <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />}
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <div className={cn("w-6 h-6 rounded-full border-2 transition-colors flex items-center justify-center",
                  isActive ? "bg-primary border-primary" : "border-muted-foreground/30")}>
                  {isActive && <div className="w-2.5 h-2.5 bg-primary-foreground rounded-full" />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="px-6 pt-4 border-t border-border">
          <p className="text-xs text-center text-muted-foreground">
            Toggle add-ons appear as chips above your message
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};
