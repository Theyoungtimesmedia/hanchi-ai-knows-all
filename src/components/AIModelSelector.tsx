import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sparkles, Zap, Brain, Globe, Code } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AIModel {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  speed: string;
  badge?: string;
}

const models: AIModel[] = [
  {
    id: "mistral",
    name: "Mistral 7B",
    description: "Fast & capable",
    icon: <Zap className="w-4 h-4 text-yellow-500" />,
    speed: "Very Fast",
    badge: "Default"
  },
  {
    id: "zephyr",
    name: "Zephyr",
    description: "Great for chat",
    icon: <Sparkles className="w-4 h-4 text-blue-500" />,
    speed: "Fast"
  },
  {
    id: "flan",
    name: "Flan-T5",
    description: "Google's model",
    icon: <Globe className="w-4 h-4 text-green-500" />,
    speed: "Fast"
  },
  {
    id: "codellama",
    name: "Code Llama",
    description: "Best for coding",
    icon: <Code className="w-4 h-4 text-purple-500" />,
    speed: "Medium"
  },
  {
    id: "thinking",
    name: "Deep Think",
    description: "Step-by-step reasoning",
    icon: <Brain className="w-4 h-4 text-orange-500" />,
    speed: "Slow"
  }
];

interface AIModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export const AIModelSelector = ({ selectedModel, onModelChange }: AIModelSelectorProps) => {
  const [open, setOpen] = useState(false);
  const currentModel = models.find(m => m.id === selectedModel) || models[0];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted border border-border hover:bg-muted/80 transition-colors"
        >
          {currentModel.icon}
          <span className="text-sm font-medium">{currentModel.name}</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
        </motion.button>
      </DropdownMenuTrigger>
      <AnimatePresence>
        {open && (
          <DropdownMenuContent
            align="start"
            className="w-64"
            asChild
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="p-2">
                <p className="text-xs text-muted-foreground mb-2 px-2">Choose AI Model</p>
                {models.map((model) => (
                  <DropdownMenuItem
                    key={model.id}
                    onClick={() => {
                      onModelChange(model.id);
                      setOpen(false);
                    }}
                    className={`flex items-center gap-3 p-2 rounded-md cursor-pointer ${
                      selectedModel === model.id ? 'bg-primary/10 border border-primary/20' : ''
                    }`}
                  >
                    <div className="p-1.5 rounded-md bg-muted">
                      {model.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{model.name}</span>
                        {model.badge && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary">
                            {model.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{model.description}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{model.speed}</span>
                  </DropdownMenuItem>
                ))}
              </div>
            </motion.div>
          </DropdownMenuContent>
        )}
      </AnimatePresence>
    </DropdownMenu>
  );
};
