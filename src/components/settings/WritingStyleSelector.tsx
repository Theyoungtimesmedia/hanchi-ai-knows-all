import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface WritingStyle {
  id: string;
  emoji: string;
  name: string;
  description: string;
}

const WRITING_STYLES: WritingStyle[] = [
  { id: "default", emoji: "🤖", name: "Default", description: "Natural and helpful" },
  { id: "professional", emoji: "🥸", name: "Professional", description: "Formal and precise" },
  { id: "curious", emoji: "🧐", name: "Curious", description: "Inquisitive and engaging" },
  { id: "persuasive", emoji: "😤", name: "Persuasive", description: "Convincing arguments" },
  { id: "friendly", emoji: "😀", name: "Friendly", description: "Warm and casual" },
  { id: "worried", emoji: "🫣", name: "Worried", description: "Empathetic and careful" },
];

interface WritingStyleSelectorProps {
  value: string;
  onChange: (styleId: string) => void;
}

export function WritingStyleSelector({ value, onChange }: WritingStyleSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {WRITING_STYLES.map((style) => (
        <button
          key={style.id}
          onClick={() => onChange(style.id)}
          className={cn(
            "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
            value === style.id
              ? "border-primary bg-primary/5"
              : "border-transparent bg-muted/50 hover:bg-muted"
          )}
        >
          <span className="text-xl">{style.emoji}</span>
          <div className="flex-1 min-w-0">
            <span className="font-medium text-sm block">{style.name}</span>
            <p className="text-xs text-muted-foreground truncate">{style.description}</p>
          </div>
          {value === style.id && (
            <Check size={14} className="text-primary flex-shrink-0" />
          )}
        </button>
      ))}
    </div>
  );
}
