import { X, Globe, Lightbulb, Shield, Brain, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { ActiveAddons } from "./EnhancedPlusMenu";

interface AddonChipsProps {
  activeAddons: ActiveAddons;
  onRemove: (addon: keyof ActiveAddons) => void;
}

const addonConfig: Record<keyof ActiveAddons, { icon: React.ReactNode; label: string; color: string }> = {
  search: { 
    icon: <Globe size={12} />, 
    label: "Search", 
    color: "bg-blue-500/20 text-blue-600 border-blue-500/30" 
  },
  thinking: { 
    icon: <Lightbulb size={12} />, 
    label: "Thinking", 
    color: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30" 
  },
  jailbreak: { 
    icon: <Shield size={12} />, 
    label: "Unrestricted", 
    color: "bg-red-500/20 text-red-600 border-red-500/30" 
  },
  deepResearch: { 
    icon: <Brain size={12} />, 
    label: "Deep Research", 
    color: "bg-indigo-500/20 text-indigo-600 border-indigo-500/30" 
  },
  study: { 
    icon: <GraduationCap size={12} />, 
    label: "Study Mode", 
    color: "bg-orange-500/20 text-orange-600 border-orange-500/30" 
  },
};

export const AddonChips = ({ activeAddons, onRemove }: AddonChipsProps) => {
  const activeKeys = Object.entries(activeAddons)
    .filter(([_, active]) => active)
    .map(([key]) => key as keyof ActiveAddons);

  if (activeKeys.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mb-2">
      {activeKeys.map((key) => {
        const config = addonConfig[key];
        return (
          <button
            key={key}
            onClick={() => onRemove(key)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all hover:scale-105 active:scale-95",
              config.color
            )}
          >
            {config.icon}
            <span>{config.label}</span>
            <X size={12} className="ml-0.5" />
          </button>
        );
      })}
    </div>
  );
};
