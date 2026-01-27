import { Zap, Brain, Sparkles, Rocket, Star, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModelOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
}

const MODELS: ModelOption[] = [
  {
    id: "gemini-flash",
    name: "Hanchi Fast",
    description: "Quick responses for everyday tasks",
    icon: <Zap className="w-4 h-4 text-yellow-500" />,
    badge: "Default",
  },
  {
    id: "gemini-pro",
    name: "Hanchi Pro",
    description: "Deep reasoning & complex analysis",
    icon: <Brain className="w-4 h-4 text-purple-500" />,
  },
  {
    id: "gpt-5-mini",
    name: "GPT-5 Mini",
    description: "Balanced power & speed",
    icon: <Sparkles className="w-4 h-4 text-green-500" />,
  },
  {
    id: "gpt-5",
    name: "GPT-5",
    description: "Most powerful reasoning",
    icon: <Star className="w-4 h-4 text-blue-500" />,
  },
  {
    id: "deep-think",
    name: "Deep Think",
    description: "Extended thinking for hard problems",
    icon: <Rocket className="w-4 h-4 text-red-500" />,
  },
];

interface ModelPreferenceSelectorProps {
  value: string;
  onChange: (modelId: string) => void;
}

export function ModelPreferenceSelector({ value, onChange }: ModelPreferenceSelectorProps) {
  return (
    <div className="space-y-2">
      {MODELS.map((model) => (
        <button
          key={model.id}
          onClick={() => onChange(model.id)}
          className={cn(
            "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
            value === model.id
              ? "border-primary bg-primary/5"
              : "border-transparent bg-muted/50 hover:bg-muted"
          )}
        >
          <div className="w-9 h-9 rounded-lg bg-background flex items-center justify-center shadow-sm">
            {model.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{model.name}</span>
              {model.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary">
                  {model.badge}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{model.description}</p>
          </div>
          {value === model.id && (
            <Check size={16} className="text-primary flex-shrink-0" />
          )}
        </button>
      ))}
    </div>
  );
}
