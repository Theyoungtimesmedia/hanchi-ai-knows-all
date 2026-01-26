import { cn } from "@/lib/utils";

export type ImageModel = "sdxl" | "sdxl-turbo" | "anime" | "dreamshaper" | "realistic" | "flux";

export interface ModelOption {
  value: ImageModel;
  label: string;
  description: string;
  speed: "fast" | "medium" | "slow";
  quality: "standard" | "high" | "ultra";
  icon: string;
}

export const MODELS: ModelOption[] = [
  { 
    value: "sdxl-turbo", 
    label: "Turbo", 
    description: "Fast generation", 
    speed: "fast", 
    quality: "standard",
    icon: "⚡"
  },
  { 
    value: "sdxl", 
    label: "SDXL", 
    description: "Balanced quality", 
    speed: "medium", 
    quality: "high",
    icon: "🎨"
  },
  { 
    value: "anime", 
    label: "Anime", 
    description: "Anime & manga style", 
    speed: "medium", 
    quality: "high",
    icon: "🌸"
  },
  { 
    value: "dreamshaper", 
    label: "DreamShaper", 
    description: "Artistic & creative", 
    speed: "slow", 
    quality: "ultra",
    icon: "✨"
  },
  { 
    value: "realistic", 
    label: "Realistic", 
    description: "Photorealistic", 
    speed: "slow", 
    quality: "ultra",
    icon: "📷"
  },
  { 
    value: "flux", 
    label: "Flux", 
    description: "Latest model", 
    speed: "medium", 
    quality: "ultra",
    icon: "🔥"
  },
];

interface ModelSelectorProps {
  value: ImageModel;
  onChange: (model: ImageModel) => void;
  compact?: boolean;
}

export const ModelSelector = ({ value, onChange, compact = false }: ModelSelectorProps) => {
  if (compact) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-1">
        {MODELS.map((model) => (
          <button
            key={model.value}
            onClick={() => onChange(model.value)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
              "border",
              value === model.value 
                ? "bg-primary text-primary-foreground border-primary" 
                : "bg-muted/50 text-foreground border-border hover:border-primary/50"
            )}
          >
            <span>{model.icon}</span>
            <span>{model.label}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {MODELS.map((model) => (
        <button
          key={model.value}
          onClick={() => onChange(model.value)}
          className={cn(
            "flex flex-col items-start p-3 rounded-xl transition-all text-left",
            "border-2",
            value === model.value 
              ? "border-primary bg-primary/10" 
              : "border-transparent bg-muted/50 hover:border-border hover:bg-muted"
          )}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{model.icon}</span>
            <span className="font-medium text-sm">{model.label}</span>
          </div>
          <p className="text-xs text-muted-foreground">{model.description}</p>
          <div className="flex gap-1 mt-2">
            <span className={cn(
              "px-1.5 py-0.5 rounded text-[10px] font-medium",
              model.speed === "fast" ? "bg-green-500/20 text-green-600" :
              model.speed === "medium" ? "bg-yellow-500/20 text-yellow-600" :
              "bg-orange-500/20 text-orange-600"
            )}>
              {model.speed}
            </span>
            <span className={cn(
              "px-1.5 py-0.5 rounded text-[10px] font-medium",
              model.quality === "ultra" ? "bg-purple-500/20 text-purple-600" :
              model.quality === "high" ? "bg-blue-500/20 text-blue-600" :
              "bg-muted text-muted-foreground"
            )}>
              {model.quality}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};
