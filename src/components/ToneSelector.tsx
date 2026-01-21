import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

export interface ToneOption {
  id: string;
  emoji: string;
  name: string;
  description: string;
}

export const TONE_OPTIONS: ToneOption[] = [
  { id: 'default', emoji: '🤖', name: 'Default', description: 'Natural and helpful' },
  { id: 'professional', emoji: '🥸', name: 'Professional', description: 'Formal and precise' },
  { id: 'curious', emoji: '🧐', name: 'Curious', description: 'Inquisitive and engaging' },
  { id: 'persuasive', emoji: '😤', name: 'Persuasive', description: 'Convincing arguments' },
  { id: 'friendly', emoji: '😀', name: 'Friendly', description: 'Warm and casual' },
  { id: 'worried', emoji: '🫣', name: 'Worried', description: 'Empathetic and careful' },
];

interface ToneSelectorProps {
  selectedTone: string;
  onToneChange: (toneId: string) => void;
}

export function ToneSelector({ selectedTone, onToneChange }: ToneSelectorProps) {
  const currentTone = TONE_OPTIONS.find(t => t.id === selectedTone) || TONE_OPTIONS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2 gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <span>{currentTone.emoji}</span>
          <span className="hidden md:inline text-xs">{currentTone.name}</span>
          <ChevronDown size={12} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-popover border border-border">
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
          Response Tone
        </div>
        {TONE_OPTIONS.map((tone) => (
          <DropdownMenuItem
            key={tone.id}
            onClick={() => onToneChange(tone.id)}
            className={`flex items-center gap-2 cursor-pointer ${
              selectedTone === tone.id ? 'bg-primary/10' : ''
            }`}
          >
            <span className="text-lg">{tone.emoji}</span>
            <div className="flex-1">
              <div className="font-medium text-sm">{tone.name}</div>
              <div className="text-xs text-muted-foreground">{tone.description}</div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
