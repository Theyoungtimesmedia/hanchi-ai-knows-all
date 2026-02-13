import { useState } from "react";
import { X, Copy, Check, ArrowLeft, Wand2, Minus, Plus, BookOpen, Bug, MessageSquare, Code, FileText, Download, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { MarkdownMessage } from "./MarkdownMessage";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CanvasModeProps {
  content: string;
  type: "code" | "document";
  onClose: () => void;
  onUpdate: (newContent: string) => void;
  onSendMessage: (message: string) => void;
}

export const CanvasMode = ({ content, type, onClose, onUpdate, onSendMessage }: CanvasModeProps) => {
  const [editableContent, setEditableContent] = useState(content);
  const [copied, setCopied] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const { toast } = useToast();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(editableContent);
    setCopied(true);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = type === "code" ? "txt" : "md";
    const blob = new Blob([editableContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hanchi-canvas.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "File downloaded" });
  };

  const quickActions = type === "code" 
    ? [
        { icon: <Bug size={14} />, label: "Fix bugs", prompt: "Fix any bugs in this code" },
        { icon: <MessageSquare size={14} />, label: "Add comments", prompt: "Add clear comments to this code" },
        { icon: <Sparkles size={14} />, label: "Optimize", prompt: "Optimize this code for performance" },
        { icon: <Code size={14} />, label: "Add tests", prompt: "Write unit tests for this code" },
      ]
    : [
        { icon: <Wand2 size={14} />, label: "Polish", prompt: "Add final polish and improve readability" },
        { icon: <Minus size={14} />, label: "Shorter", prompt: "Make this more concise while keeping key points" },
        { icon: <Plus size={14} />, label: "Longer", prompt: "Expand this with more detail and examples" },
        { icon: <BookOpen size={14} />, label: "Simplify", prompt: "Simplify this to a 5th grade reading level" },
      ];

  const handleChatSubmit = () => {
    if (!chatInput.trim()) return;
    onSendMessage(chatInput);
    setChatInput("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex">
      {/* Chat panel */}
      <div className="w-[380px] border-r border-border/50 flex flex-col bg-card/50">
        <div className="h-14 flex items-center gap-2 px-4 border-b border-border/50">
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-lg">
            <ArrowLeft size={16} />
          </Button>
          <span className="text-sm font-semibold">Canvas Chat</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-center py-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">👃🏿</span>
            </div>
            <p className="text-xs text-muted-foreground">Ask Hanchi to edit your {type}</p>
          </div>
        </div>
        <div className="p-3 border-t border-border/50">
          <div className="flex gap-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleChatSubmit()}
              placeholder={`Edit this ${type}...`}
              className="flex-1 bg-muted/50 rounded-lg px-3 py-2 text-sm border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
            <Button size="sm" onClick={handleChatSubmit} disabled={!chatInput.trim()} className="rounded-lg">
              Send
            </Button>
          </div>
        </div>
      </div>

      {/* Editor panel */}
      <div className="flex-1 flex flex-col">
        <div className="h-14 flex items-center justify-between px-4 border-b border-border/50 bg-background">
          <div className="flex items-center gap-2">
            {type === "code" ? <Code size={16} className="text-primary" /> : <FileText size={16} className="text-primary" />}
            <span className="text-sm font-semibold">{type === "code" ? "Code Editor" : "Document Editor"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 gap-1.5 text-xs">
              {copied ? <Check size={14} /> : <Copy size={14} />} Copy
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDownload} className="h-8 gap-1.5 text-xs">
              <Download size={14} /> Download
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X size={16} />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            {type === "code" ? (
              <textarea
                value={editableContent}
                onChange={(e) => setEditableContent(e.target.value)}
                className="w-full min-h-[500px] bg-muted/30 rounded-xl p-4 font-mono text-sm border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
                spellCheck={false}
              />
            ) : (
              <textarea
                value={editableContent}
                onChange={(e) => setEditableContent(e.target.value)}
                className="w-full min-h-[500px] bg-transparent rounded-xl p-4 text-sm border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none leading-relaxed"
              />
            )}
          </div>
        </div>

        {/* Quick actions bar */}
        <div className="border-t border-border/50 p-3 bg-muted/30">
          <div className="flex items-center gap-2 max-w-3xl mx-auto overflow-x-auto scrollbar-none">
            {quickActions.map((action, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                onClick={() => onSendMessage(action.prompt)}
                className="h-8 rounded-lg text-[10px] gap-1.5 whitespace-nowrap border-border/50 hover:border-primary/30 hover:bg-primary/5"
              >
                {action.icon} {action.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
