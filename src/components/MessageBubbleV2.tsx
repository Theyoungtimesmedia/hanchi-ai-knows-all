import { useState } from "react";
import { 
  ChevronDown, 
  ChevronRight, 
  Copy, 
  Check, 
  RefreshCw, 
  Volume2, 
  ThumbsUp, 
  ThumbsDown,
  Edit3,
  Share2,
  MoreHorizontal
} from "lucide-react";
import { MarkdownMessage } from "./MarkdownMessage";
import { Button } from "./ui/button";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface Source {
  title: string;
  url?: string;
  snippet?: string;
  timestamp?: string;
}

interface MessageBubbleV2Props {
  role: "user" | "assistant";
  content: string;
  thought?: string;
  images?: string[];
  timestamp?: string;
  confidence?: number;
  sources?: Source[];
  onRegenerate?: () => void;
  onEdit?: (newContent: string) => void;
  language?: string;
}

export const MessageBubbleV2 = ({
  role,
  content,
  thought,
  images,
  timestamp,
  confidence,
  sources,
  onRegenerate,
  onEdit,
  language = "en",
}: MessageBubbleV2Props) => {
  const [showThought, setShowThought] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const isAI = role === "assistant";
  const { speak, isPlaying, stop } = useTextToSpeech();
  const { toast } = useToast();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (isPlaying) {
      stop();
    } else {
      speak(content, language);
    }
  };

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback(type);
    toast({
      title: type === 'up' ? "Thanks for the feedback! 👍" : "Sorry about that 👎",
      description: type === 'up' ? "Glad I could help!" : "I'll try to do better next time.",
    });
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Hanchi AI Response',
          text: content,
        });
      } else {
        await navigator.clipboard.writeText(content);
        toast({ title: "Content copied for sharing" });
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleEditSubmit = () => {
    if (onEdit && editContent.trim() !== content) {
      onEdit(editContent);
    }
    setIsEditing(false);
  };

  const formattedTime = timestamp || new Date().toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const getNoseConfidence = (conf: number) => {
    if (conf >= 80) return { text: "👃✓ Confident", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
    if (conf >= 60) return { text: "👃~ Likely", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" };
    return { text: "👃? Uncertain", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
  };

  return (
    <div className={`flex w-full mb-4 ${isAI ? 'justify-start' : 'justify-end'} animate-fade-in group`}>
      <div className={`flex flex-col max-w-[85%] md:max-w-[75%] ${isAI ? 'items-start' : 'items-end'}`}>
        
        {/* Avatar and Name */}
        <div className={`flex items-center gap-2 mb-1 ${isAI ? '' : 'flex-row-reverse'}`}>
          {isAI ? (
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-xs">
              👃🏿
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
              You
            </div>
          )}
          <span className="text-xs text-muted-foreground font-medium">
            {isAI ? 'Hanchi' : 'You'}
          </span>
        </div>

        {/* Thought Process Accordion (AI Only) */}
        {isAI && thought && (
          <div className="mb-2 w-full">
            <button 
              onClick={() => setShowThought(!showThought)}
              className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
            >
              {showThought ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              <span>View thinking process</span>
            </button>
            
            {showThought && (
              <div className="mt-2 p-3 bg-muted/50 rounded-lg border border-border text-xs text-muted-foreground animate-fade-in">
                <pre className="whitespace-pre-wrap font-mono">{thought}</pre>
              </div>
            )}
          </div>
        )}

        {/* Message Content */}
        <div className={`relative px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isAI 
            ? 'bg-card text-foreground border border-border rounded-tl-sm' 
            : 'bg-primary text-primary-foreground rounded-tr-sm'
        }`}>
          {/* Images */}
          {images && images.length > 0 && (
            <div className="mb-3 grid gap-2">
              {images.map((img, i) => (
                <img 
                  key={i} 
                  src={img.startsWith('data:') ? img : `data:image/jpeg;base64,${img}`} 
                  alt="Upload" 
                  className="rounded-lg max-h-48 object-cover w-full" 
                />
              ))}
            </div>
          )}
          
          {/* Content - Edit mode for user messages */}
          {!isAI && isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-transparent border-0 resize-none focus:outline-none min-h-[60px]"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleEditSubmit}>
                  Save & Resend
                </Button>
              </div>
            </div>
          ) : isAI ? (
            <MarkdownMessage content={content} />
          ) : (
            <p className="whitespace-pre-wrap">{content}</p>
          )}

          {/* Confidence badge */}
          {isAI && confidence && (
            <div className="mt-2 pt-2 border-t border-border/50">
              <span className={`text-xs px-2 py-0.5 rounded-full ${getNoseConfidence(confidence).color}`}>
                {getNoseConfidence(confidence).text}
              </span>
            </div>
          )}
        </div>

        {/* Actions Row */}
        <div className="flex items-center gap-1 mt-1.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[10px] text-muted-foreground mr-2">
            {formattedTime}
          </span>
          
          {isAI ? (
            <>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy} title="Copy">
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleSpeak} title="Read aloud">
                <Volume2 size={14} className={isPlaying ? 'text-primary' : ''} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`h-7 w-7 ${feedback === 'up' ? 'text-green-500' : ''}`} 
                onClick={() => handleFeedback('up')}
                title="Good response"
              >
                <ThumbsUp size={14} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`h-7 w-7 ${feedback === 'down' ? 'text-red-500' : ''}`} 
                onClick={() => handleFeedback('down')}
                title="Bad response"
              >
                <ThumbsDown size={14} />
              </Button>
              {onRegenerate && (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onRegenerate} title="Regenerate">
                  <RefreshCw size={14} />
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal size={14} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleShare}>
                    <Share2 size={14} className="mr-2" /> Share
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopy}>
                    <Copy size={14} className="mr-2" /> Copy
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              {onEdit && (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsEditing(true)} title="Edit">
                  <Edit3 size={14} />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy} title="Copy">
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </Button>
            </>
          )}
        </div>

        {/* Sources */}
        {isAI && sources && sources.length > 0 && (
          <div className="mt-2 px-1 space-y-1">
            <span className="text-[10px] text-muted-foreground font-medium">Sources:</span>
            <div className="flex flex-wrap gap-1">
              {sources.slice(0, 3).map((source, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                  {source.url ? (
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                      {source.title}
                    </a>
                  ) : (
                    source.title
                  )}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};