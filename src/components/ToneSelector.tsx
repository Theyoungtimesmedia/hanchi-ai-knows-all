import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Tone {
  id: string;
  emoji: string;
  name: string;
  description: string;
}

const tones: Tone[] = [
  { id: "default", emoji: "🤖", name: "Default", description: "Balanced & helpful" },
  { id: "professional", emoji: "🥸", name: "Professional", description: "Formal & polished" },
  { id: "curious", emoji: "🧐", name: "Curious", description: "Inquisitive & engaging" },
  { id: "persuasive", emoji: "😤", name: "Persuasive", description: "Convincing & direct" },
  { id: "friendly", emoji: "😀", name: "Friendly", description: "Warm & casual" },
  { id: "worried", emoji: "🫣", name: "Worried", description: "Cautious & considerate" },
];

interface ToneSelectorProps {
  selectedTone: string;
  onToneChange: (tone: string) => void;
}

export const ToneSelector = ({ selectedTone, onToneChange }: ToneSelectorProps) => {
  const [open, setOpen] = useState(false);
  const currentTone = tones.find(t => t.id === selectedTone) || tones[0];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted border border-border hover:bg-muted/80 transition-colors"
        >
          <span className="text-base">{currentTone.emoji}</span>
          <span className="text-sm font-medium hidden sm:inline">{currentTone.name}</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
        </motion.button>
      </DropdownMenuTrigger>
      <AnimatePresence>
        {open && (
          <DropdownMenuContent
            align="end"
            className="w-56"
            asChild
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="p-2">
                <p className="text-xs text-muted-foreground mb-2 px-2">Response Tone</p>
                {tones.map((tone) => (
                  <DropdownMenuItem
                    key={tone.id}
                    onClick={() => {
                      onToneChange(tone.id);
                      setOpen(false);
                    }}
                    className={`flex items-center gap-3 p-2 rounded-md cursor-pointer ${
                      selectedTone === tone.id ? 'bg-primary/10 border border-primary/20' : ''
                    }`}
                  >
                    <span className="text-xl">{tone.emoji}</span>
                    <div className="flex-1">
                      <span className="text-sm font-medium">{tone.name}</span>
                      <p className="text-xs text-muted-foreground">{tone.description}</p>
                    </div>
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
