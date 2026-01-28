import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";

interface KeyboardShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SHORTCUTS = [
  { category: "Navigation", items: [
    { keys: ["⌘", "K"], action: "Open search / Quick actions" },
    { keys: ["⌘", "N"], action: "New conversation" },
    { keys: ["⌘", "P"], action: "Open prompt library" },
    { keys: ["⌘", ","], action: "Open settings" },
    { keys: ["⌘", "?"], action: "Show this help" },
  ]},
  { category: "Chat", items: [
    { keys: ["Enter"], action: "Send message" },
    { keys: ["Shift", "Enter"], action: "New line" },
    { keys: ["⌘", "↵"], action: "Send with Think Mode" },
    { keys: ["Esc"], action: "Stop generating / Close dialog" },
  ]},
  { category: "Sidebar", items: [
    { keys: ["⌘", "B"], action: "Toggle sidebar" },
    { keys: ["⌘", "S"], action: "Pin current conversation" },
  ]},
];

export function KeyboardShortcutsModal({ open, onOpenChange }: KeyboardShortcutsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard size={20} className="text-primary" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-2">
          {SHORTCUTS.map((section) => (
            <div key={section.category}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                {section.category}
              </h3>
              <div className="space-y-2">
                {section.items.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-1.5"
                  >
                    <span className="text-sm">{shortcut.action}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, i) => (
                        <kbd
                          key={i}
                          className="min-w-[24px] px-2 py-1 rounded-md bg-muted text-xs font-mono font-medium text-center"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
          <p>Press <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">⌘ ?</kbd> anytime to see shortcuts</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
