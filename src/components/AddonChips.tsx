import { X, Globe, Lightbulb, Shield, Brain, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { ActiveAddons } from "./EnhancedPlusMenu";
import { motion, AnimatePresence } from "framer-motion";

interface AddonChipsProps {
  activeAddons: ActiveAddons;
  onRemove: (addon: keyof ActiveAddons) => void;
}

const addonConfig: Record<keyof ActiveAddons, { icon: React.ReactNode; label: string; gradient: string }> = {
  search: { icon: <Globe size={16} />, label: "Web Search", gradient: "from-sky-500/20 to-blue-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400" },
  thinking: { icon: <Lightbulb size={16} />, label: "Think Deeper", gradient: "from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400" },
  jailbreak: { icon: <Shield size={16} />, label: "Unrestricted", gradient: "from-red-500/20 to-rose-500/10 border-red-500/30 text-red-600 dark:text-red-400" },
  deepResearch: { icon: <Brain size={16} />, label: "Deep Research", gradient: "from-indigo-500/20 to-purple-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400" },
  study: { icon: <GraduationCap size={16} />, label: "Study Mode", gradient: "from-emerald-500/20 to-green-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400" },
};

export const AddonChips = ({ activeAddons, onRemove }: AddonChipsProps) => {
  const activeKeys = Object.entries(activeAddons)
    .filter(([_, active]) => active)
    .map(([key]) => key as keyof ActiveAddons);

  if (activeKeys.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-3">
      <AnimatePresence>
        {activeKeys.map((key) => {
          const config = addonConfig[key];
          return (
            <motion.button
              key={key}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={() => onRemove(key)}
              className={cn(
                "flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-sm font-bold border-2 transition-all",
                "bg-gradient-to-r shadow-md hover:shadow-lg hover:scale-[1.03] active:scale-[0.97]",
                config.gradient
              )}
            >
              <span className="flex-shrink-0">{config.icon}</span>
              <span>{config.label}</span>
              <X size={15} className="ml-1 opacity-60 hover:opacity-100 transition-opacity" />
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
