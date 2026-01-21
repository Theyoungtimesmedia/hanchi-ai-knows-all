import { ChevronDown, Zap, Brain, Sparkles, Rocket, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface AIModel {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
}

export const AI_MODELS: AIModel[] = [
  { 
    id: 'gemini-flash', 
    name: 'Hanchi Fast', 
    description: 'Quick responses, great for most tasks',
    icon: <Zap className="w-4 h-4 text-yellow-500" />,
    badge: 'Default'
  },
  { 
    id: 'gemini-pro', 
    name: 'Hanchi Pro', 
    description: 'Deep reasoning & complex analysis',
    icon: <Brain className="w-4 h-4 text-purple-500" />,
  },
  { 
    id: 'gpt-5-mini', 
    name: 'GPT-5 Mini', 
    description: 'OpenAI - balanced power & speed',
    icon: <Sparkles className="w-4 h-4 text-green-500" />,
  },
  { 
    id: 'gpt-5', 
    name: 'GPT-5', 
    description: 'OpenAI - most powerful reasoning',
    icon: <Star className="w-4 h-4 text-blue-500" />,
  },
  { 
    id: 'deep-think', 
    name: 'Deep Think', 
    description: 'Extended thinking for complex problems',
    icon: <Rocket className="w-4 h-4 text-red-500" />,
    badge: 'Pro'
  },
];

interface AIModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

export function AIModelSelector({ selectedModel, onModelChange }: AIModelSelectorProps) {
  const currentModel = AI_MODELS.find(m => m.id === selectedModel) || AI_MODELS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 font-medium h-9 px-3">
          <span className="text-lg">👃🏿</span>
          <span className="hidden sm:inline">{currentModel.name}</span>
          <ChevronDown size={14} className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 bg-popover border border-border">
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
          Choose AI Model
        </div>
        <DropdownMenuSeparator />
        {AI_MODELS.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => onModelChange(model.id)}
            className={`flex items-start gap-3 py-2.5 px-2 cursor-pointer ${
              selectedModel === model.id ? 'bg-primary/10' : ''
            }`}
          >
            <div className="mt-0.5">{model.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{model.name}</span>
                {model.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    model.badge === 'Default' 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-yellow-500/20 text-yellow-600'
                  }`}>
                    {model.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{model.description}</p>
            </div>
            {selectedModel === model.id && (
              <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
