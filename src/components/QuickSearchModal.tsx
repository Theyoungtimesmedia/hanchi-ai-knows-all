import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import {
  Search, MessageSquare, Settings, BookOpen, Sparkles,
  HelpCircle, Image as ImageIcon, Mic, Plus, Pin, History
} from "lucide-react";

interface QuickSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversations?: Array<{ id: string; title: string }>;
  onSelectConversation?: (id: string) => void;
  onNewConversation?: () => void;
}

interface QuickAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  action: () => void;
  category: string;
}

export function QuickSearchModal({
  open,
  onOpenChange,
  conversations = [],
  onSelectConversation,
  onNewConversation,
}: QuickSearchModalProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const quickActions: QuickAction[] = useMemo(() => [
    {
      id: "new-chat",
      icon: <Plus size={16} />,
      label: "New conversation",
      description: "Start a fresh chat",
      action: () => { onNewConversation?.(); onOpenChange(false); },
      category: "actions"
    },
    {
      id: "prompts",
      icon: <BookOpen size={16} />,
      label: "Prompt Library",
      description: "Browse ready-to-use prompts",
      action: () => { navigate("/prompts"); onOpenChange(false); },
      category: "pages"
    },
    {
      id: "discover",
      icon: <Sparkles size={16} />,
      label: "Discover Features",
      description: "Explore Hanchi's capabilities",
      action: () => { navigate("/discover"); onOpenChange(false); },
      category: "pages"
    },
    {
      id: "settings",
      icon: <Settings size={16} />,
      label: "Settings",
      description: "Preferences and account",
      action: () => { navigate("/settings"); onOpenChange(false); },
      category: "pages"
    },
    {
      id: "help",
      icon: <HelpCircle size={16} />,
      label: "Help Center",
      description: "FAQs and guides",
      action: () => { navigate("/help"); onOpenChange(false); },
      category: "pages"
    },
    {
      id: "create-image",
      icon: <ImageIcon size={16} />,
      label: "Create Image",
      description: "Generate AI images",
      action: () => { navigate("/chat", { state: { prefillPrompt: "Create an image of..." } }); onOpenChange(false); },
      category: "features"
    },
    {
      id: "voice-translate",
      icon: <Mic size={16} />,
      label: "Voice Translation",
      description: "Translate between languages",
      action: () => { navigate("/chat", { state: { openVoiceTranslation: true } }); onOpenChange(false); },
      category: "features"
    },
  ], [navigate, onOpenChange, onNewConversation]);

  const filteredResults = useMemo(() => {
    const q = query.toLowerCase();
    
    const matchedActions = quickActions.filter(a => 
      a.label.toLowerCase().includes(q) || 
      a.description.toLowerCase().includes(q)
    );

    const matchedConversations = conversations
      .filter(c => c.title.toLowerCase().includes(q))
      .slice(0, 5)
      .map(c => ({
        id: `conv-${c.id}`,
        icon: <MessageSquare size={16} />,
        label: c.title,
        description: "Open conversation",
        action: () => { onSelectConversation?.(c.id); onOpenChange(false); },
        category: "conversations"
      }));

    return [...matchedActions, ...matchedConversations];
  }, [query, quickActions, conversations, onSelectConversation, onOpenChange]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filteredResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filteredResults[selectedIndex]) {
      e.preventDefault();
      filteredResults[selectedIndex].action();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search size={18} className="text-muted-foreground" />
          <Input
            placeholder="Search conversations, actions, and more..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border-0 focus-visible:ring-0 px-0 text-base"
            autoFocus
          />
          <kbd className="px-2 py-1 rounded bg-muted text-xs font-mono text-muted-foreground">
            esc
          </kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto py-2">
          {query === "" && (
            <div className="px-3 py-1.5">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Quick Actions
              </p>
            </div>
          )}

          {filteredResults.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-muted-foreground">No results found</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {filteredResults.map((item, index) => (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    selectedIndex === index
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  <div className={`flex-shrink-0 ${selectedIndex === index ? "text-primary" : "text-muted-foreground"}`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                  </div>
                  {item.category === "conversations" && (
                    <History size={14} className="text-muted-foreground" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-4 py-2 border-t border-border bg-muted/30">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">↵</kbd> select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">↑↓</kbd> navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">esc</kbd> close
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
