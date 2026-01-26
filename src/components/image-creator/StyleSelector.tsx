import { cn } from "@/lib/utils";

export type ImageStyle = 
  | "default" | "nigerian" | "nigerian_sticker" | "sticker" 
  | "anime" | "midjourney" | "dalle" | "realistic" 
  | "professional" | "creative" | "cartoon" 
  | "oil_painting" | "watercolor" | "pixel_art" | "3d_render"
  | "cyberpunk" | "vintage" | "neon" | "minimalist";

export type StyleCategory = "popular" | "artistic" | "nigerian" | "effects";

export interface StyleOption {
  value: ImageStyle;
  label: string;
  emoji: string;
  category: StyleCategory;
  gradient?: string;
}

export const STYLES: StyleOption[] = [
  // Popular
  { value: "default", label: "Default", emoji: "✨", category: "popular", gradient: "from-blue-500 to-purple-500" },
  { value: "professional", label: "Professional", emoji: "💼", category: "popular", gradient: "from-slate-600 to-slate-800" },
  { value: "realistic", label: "Photorealistic", emoji: "📷", category: "popular", gradient: "from-gray-500 to-gray-700" },
  { value: "anime", label: "Anime", emoji: "🌸", category: "popular", gradient: "from-pink-400 to-purple-500" },
  { value: "midjourney", label: "Midjourney", emoji: "🔮", category: "popular", gradient: "from-indigo-500 to-purple-600" },
  
  // Artistic
  { value: "dalle", label: "DALL-E Style", emoji: "🤖", category: "artistic", gradient: "from-emerald-500 to-teal-600" },
  { value: "cartoon", label: "Cartoon", emoji: "🎬", category: "artistic", gradient: "from-yellow-400 to-orange-500" },
  { value: "3d_render", label: "3D Render", emoji: "🎮", category: "artistic", gradient: "from-cyan-500 to-blue-600" },
  { value: "oil_painting", label: "Oil Painting", emoji: "🖼️", category: "artistic", gradient: "from-amber-600 to-orange-700" },
  { value: "watercolor", label: "Watercolor", emoji: "💧", category: "artistic", gradient: "from-sky-400 to-blue-500" },
  { value: "pixel_art", label: "Pixel Art", emoji: "👾", category: "artistic", gradient: "from-green-500 to-emerald-600" },
  
  // Nigerian
  { value: "nigerian", label: "Nigerian Style", emoji: "🇳🇬", category: "nigerian", gradient: "from-green-600 to-green-800" },
  { value: "nigerian_sticker", label: "Nigerian Meme", emoji: "😂", category: "nigerian", gradient: "from-green-500 to-yellow-500" },
  { value: "sticker", label: "WhatsApp Sticker", emoji: "💬", category: "nigerian", gradient: "from-green-400 to-teal-500" },
  
  // Effects
  { value: "cyberpunk", label: "Cyberpunk", emoji: "🌆", category: "effects", gradient: "from-fuchsia-500 to-cyan-500" },
  { value: "vintage", label: "Vintage", emoji: "📻", category: "effects", gradient: "from-amber-500 to-yellow-600" },
  { value: "neon", label: "Neon Glow", emoji: "💡", category: "effects", gradient: "from-pink-500 to-violet-600" },
  { value: "minimalist", label: "Minimalist", emoji: "◻️", category: "effects", gradient: "from-neutral-400 to-neutral-600" },
  { value: "creative", label: "Creative", emoji: "🎨", category: "effects", gradient: "from-rose-500 to-pink-600" },
];

const CATEGORY_LABELS: Record<StyleCategory, { label: string; icon: string }> = {
  popular: { label: "Popular", icon: "🔥" },
  artistic: { label: "Artistic", icon: "🎨" },
  nigerian: { label: "Nigerian", icon: "🇳🇬" },
  effects: { label: "Effects", icon: "✨" },
};

interface StyleSelectorProps {
  value: ImageStyle;
  onChange: (style: ImageStyle) => void;
  compact?: boolean;
}

export const StyleSelector = ({ value, onChange, compact = false }: StyleSelectorProps) => {
  const categories: StyleCategory[] = ["popular", "artistic", "nigerian", "effects"];
  
  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {STYLES.slice(0, 8).map((style) => (
          <button
            key={style.value}
            onClick={() => onChange(style.value)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
              "border border-border hover:border-primary/50",
              value === style.value 
                ? "bg-primary text-primary-foreground border-primary" 
                : "bg-muted/50 text-foreground hover:bg-muted"
            )}
          >
            {style.emoji} {style.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => {
        const categoryStyles = STYLES.filter(s => s.category === category);
        const { label, icon } = CATEGORY_LABELS[category];
        
        return (
          <div key={category} className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span>{icon}</span>
              <span>{label}</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {categoryStyles.map((style) => (
                <button
                  key={style.value}
                  onClick={() => onChange(style.value)}
                  className={cn(
                    "relative flex flex-col items-center gap-1 p-3 rounded-xl transition-all",
                    "border-2 hover:scale-105",
                    value === style.value 
                      ? "border-primary bg-primary/10 shadow-lg" 
                      : "border-transparent bg-muted/50 hover:border-border hover:bg-muted"
                  )}
                >
                  <div 
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center text-xl",
                      "bg-gradient-to-br",
                      style.gradient || "from-gray-400 to-gray-600"
                    )}
                  >
                    {style.emoji}
                  </div>
                  <span className="text-xs font-medium text-center leading-tight">
                    {style.label}
                  </span>
                  {value === style.value && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-[10px] text-primary-foreground">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
