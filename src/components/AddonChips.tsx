import { X, Globe, Lightbulb, Shield, Brain, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { ActiveAddons } from "./EnhancedPlusMenu";

interface AddonChipsProps {
  activeAddons: ActiveAddons;
  onRemove: (addon: keyof ActiveAddons) => void;
}

const addonConfig: Record<keyof ActiveAddons, { icon: React.ReactNode; label: string; color: string }> = {
  search: { 
    icon: <Globe size={14} />, 
    label: "Web Search", 
    color: "bg-sky-500/15 text-sky-600 border-sky-500/30 dark:bg-sky-500/20 dark:text-sky-400" 
  },
  thinking: { 
    icon: <Lightbulb size={14} />, 
    label: "Think Deeper", 
    color: "bg-amber-500/15 text-amber-600 border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-400" 
  },
  jailbreak: { 
    icon: <Shield size={14} />, 
    label: "Unrestricted", 
    color: "bg-red-500/15 text-red-600 border-red-500/30 dark:bg-red-500/20 dark:text-red-400" 
  },
  deepResearch: { 
    icon: <Brain size={14} />, 
    label: "Deep Research", 
    color: "bg-indigo-500/15 text-indigo-600 border-indigo-500/30 dark:bg-indigo-500/20 dark:text-indigo-400" 
  },
  study: { 
    icon: <GraduationCap size={14} />, 
    label: "Study Mode", 
    color: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-400" 
  },
};

export const AddonChips = ({ activeAddons, onRemove }: AddonChipsProps) => {
  const activeKeys = Object.entries(activeAddons)
    .filter(([_, active]) => active)
    .map(([key]) => key as keyof ActiveAddons);

  if (activeKeys.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-3 animate-fade-in">
      {activeKeys.map((key) => {
        const config = addonConfig[key];
        return (
          <button
            key={key}
            onClick={() => onRemove(key)}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-medium border transition-all",
              "hover:scale-[1.02] active:scale-[0.98] shadow-sm",
              config.color
            )}
          >
            {config.icon}
            <span>{config.label}</span>
            <X size={14} className="ml-0.5 opacity-60 hover:opacity-100" />
          </button>
        );
      })}
    </div>
  );
};
