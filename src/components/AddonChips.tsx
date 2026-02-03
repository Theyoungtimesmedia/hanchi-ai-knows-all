import { X, Globe, Lightbulb, Shield, Brain, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { ActiveAddons } from "./EnhancedPlusMenu";

interface AddonChipsProps {
  activeAddons: ActiveAddons;
  onRemove: (addon: keyof ActiveAddons) => void;
}

const addonConfig: Record<keyof ActiveAddons, { icon: React.ReactNode; label: string }> = {
  search: { icon: <Globe size={14} />, label: "Web Search" },
  thinking: { icon: <Lightbulb size={14} />, label: "Think Deeper" },
  jailbreak: { icon: <Shield size={14} />, label: "Unrestricted" },
  deepResearch: { icon: <Brain size={14} />, label: "Deep Research" },
  study: { icon: <GraduationCap size={14} />, label: "Study Mode" },
};

export const AddonChips = ({ activeAddons, onRemove }: AddonChipsProps) => {
  const activeKeys = Object.entries(activeAddons)
    .filter(([_, active]) => active)
    .map(([key]) => key as keyof ActiveAddons);

  if (activeKeys.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {activeKeys.map((key, index) => {
        const config = addonConfig[key];
        return (
          <button
            key={key}
            onClick={() => onRemove(key)}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold border transition-all",
              "bg-primary/10 text-primary border-primary/20",
              "hover:bg-primary/15 hover:border-primary/30 hover:scale-[1.02]",
              "active:scale-[0.98] shadow-sm",
              "animate-chip-enter addon-chip-active"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span className="text-primary">{config.icon}</span>
            <span>{config.label}</span>
            <X size={14} className="ml-0.5 opacity-70 hover:opacity-100 transition-opacity" />
          </button>
        );
      })}
    </div>
  );
};
