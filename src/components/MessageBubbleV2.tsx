import { useState } from "react";
import { InlineChatImage } from "./InlineChatImage";
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
  MoreHorizontal,
  Download,
  ExternalLink,
  Code,
  FileText,
  FolderHeart
} from "lucide-react";
import { MarkdownMessage } from "./MarkdownMessage";
import { Button } from "./ui/button";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
  onSaveToCollection?: (content: string, type: string) => void;
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
  onSaveToCollection,
  language = "en",
}: MessageBubbleV2Props) => {
  const [showThought, setShowThought] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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
      title: type === 'up' ? "Thanks for the feedback!" : "Sorry about that",
      description: type === 'up' ? "Glad I could help!" : "I'll try to do better.",
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

  const handleImageDownload = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hanchi-image-${index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "Image downloaded" });
    } catch (error) {
      toast({ title: "Download failed", variant: "destructive" });
    }
  };

  const formattedTime = timestamp || new Date().toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const getConfidenceBadge = (conf: number) => {
    if (conf >= 80) return { 
      text: "High confidence", 
      color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
    };
    if (conf >= 60) return { 
      text: "Medium confidence", 
      color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" 
    };
    return { 
      text: "Low confidence", 
      color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" 
    };
  };

  // Check if content has code blocks
  const hasCodeBlock = content.includes('```');

  return (
    <div className={cn(
      "flex w-full mb-6 group",
      isAI ? 'justify-start' : 'justify-end'
    )}>
      <div className={cn(
        "flex flex-col max-w-[88%] md:max-w-[80%]",
        isAI ? 'items-start' : 'items-end'
      )}>
        
        {/* Avatar and Name */}
        <div className={cn(
          "flex items-center gap-2.5 mb-2",
          isAI ? '' : 'flex-row-reverse'
        )}>
          {isAI ? (
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center border border-border/50">
              <span className="text-foreground font-semibold text-sm">Y</span>
            </div>
          )}
          <span className="text-sm font-semibold text-foreground">
            {isAI ? 'Hanchi' : 'You'}
          </span>
          <span className="text-xs text-muted-foreground">
            {formattedTime}
          </span>
        </div>

        {/* Thought Process Accordion (AI Only) */}
        {isAI && thought && (
          <div className="mb-3 w-full">
            <button 
              onClick={() => setShowThought(!showThought)}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-muted/50"
            >
              {showThought ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              View thinking process
            </button>
            
            {showThought && (
              <div className="mt-2 p-4 bg-muted/30 rounded-xl border border-border text-sm text-muted-foreground animate-fade-in">
                <pre className="whitespace-pre-wrap font-mono text-xs">{thought}</pre>
              </div>
            )}
          </div>
        )}

        {/* Message Content */}
        <div className={cn(
          "relative px-5 py-4 rounded-2xl text-base leading-relaxed",
          isAI 
            ? 'message-bubble-ai shadow-sm' 
            : 'message-bubble-user shadow-md'
        )}>
          {/* Images - use InlineChatImage for AI-generated images */}
          {images && images.length > 0 && (
            <div className="mb-4 space-y-3">
              {images.map((img, i) => {
                const imgSrc = img.startsWith('data:') || img.startsWith('http') 
                  ? img 
                  : `data:image/jpeg;base64,${img}`;
                
                // AI-generated images (from assistant) get full controls
                if (isAI) {
                  return (
                    <InlineChatImage
                      key={i}
                      imageUrl={imgSrc}
                      prompt=""
                    />
                  );
                }
                
                // User-uploaded images stay simple
                return (
                  <div key={i} className="relative group/img">
                    <img 
                      src={imgSrc}
                      alt="Image" 
                      className="rounded-xl max-h-72 object-cover w-full cursor-pointer hover:opacity-95 transition-opacity"
                      onClick={() => setSelectedImage(imgSrc)}
                    />
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover/img:opacity-100 transition-opacity">
                      <Button size="icon" variant="secondary" className="h-8 w-8 rounded-lg bg-black/50 hover:bg-black/70 text-white"
                        onClick={(e) => { e.stopPropagation(); handleImageDownload(imgSrc, i); }}>
                        <Download size={14} />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Content - Edit mode for user messages */}
          {!isAI && isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-transparent border-0 resize-none focus:outline-none min-h-[80px] text-primary-foreground"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10">
                  Cancel
                </Button>
                <Button size="sm" onClick={handleEditSubmit} className="bg-white/20 hover:bg-white/30 text-primary-foreground">
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
            <div className="mt-3 pt-3 border-t border-border/30">
              <span className={cn(
                "text-xs px-2.5 py-1 rounded-full font-medium",
                getConfidenceBadge(confidence).color
              )}>
                {getConfidenceBadge(confidence).text}
              </span>
            </div>
          )}
        </div>

        {/* Actions Row */}
        <div className="flex items-center gap-1 mt-2 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isAI ? (
            <>
              <Button variant="ghost" size="sm" className="h-8 px-2 gap-1.5 text-muted-foreground hover:text-foreground" onClick={handleCopy}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span className="text-xs">Copy</span>
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2 gap-1.5 text-muted-foreground hover:text-foreground" onClick={handleSpeak}>
                <Volume2 size={14} className={isPlaying ? 'text-primary' : ''} />
                <span className="text-xs">{isPlaying ? 'Stop' : 'Read'}</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className={cn("h-8 px-2", feedback === 'up' && 'text-emerald-500')}
                onClick={() => handleFeedback('up')}
              >
                <ThumbsUp size={14} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className={cn("h-8 px-2", feedback === 'down' && 'text-red-500')}
                onClick={() => handleFeedback('down')}
              >
                <ThumbsDown size={14} />
              </Button>
              {onRegenerate && (
                <Button variant="ghost" size="sm" className="h-8 px-2 gap-1.5 text-muted-foreground hover:text-foreground" onClick={onRegenerate}>
                  <RefreshCw size={14} />
                  <span className="text-xs">Retry</span>
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal size={14} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={handleShare}>
                    <Share2 size={14} className="mr-2" /> Share
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSaveToCollection?.(content, images?.length ? 'image' : 'message')}>
                    <FolderHeart size={14} className="mr-2" /> Save to Collection
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopy}>
                    <Copy size={14} className="mr-2" /> Copy all
                  </DropdownMenuItem>
                  {hasCodeBlock && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => toast({ title: "Code copied" })}>
                        <Code size={14} className="mr-2" /> Copy code
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast({ title: "Feature coming soon" })}>
                        <FileText size={14} className="mr-2" /> Download as file
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              {onEdit && (
                <Button variant="ghost" size="sm" className="h-8 px-2 gap-1.5 text-muted-foreground hover:text-foreground" onClick={() => setIsEditing(true)}>
                  <Edit3 size={14} />
                  <span className="text-xs">Edit</span>
                </Button>
              )}
              <Button variant="ghost" size="sm" className="h-8 px-2 gap-1.5 text-muted-foreground hover:text-foreground" onClick={handleCopy}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span className="text-xs">Copy</span>
              </Button>
            </>
          )}
        </div>

        {/* Sources */}
        {isAI && sources && sources.length > 0 && (
          <div className="mt-3 px-1 space-y-2">
            <span className="text-xs text-muted-foreground font-medium">Sources:</span>
            <div className="flex flex-wrap gap-2">
              {sources.slice(0, 4).map((source, i) => (
                <a
                  key={i}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-muted/50 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink size={12} />
                  {source.title}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img 
              src={selectedImage} 
              alt="Preview" 
              className="max-w-full max-h-[90vh] object-contain rounded-xl"
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="bg-black/50 hover:bg-black/70 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handleImageDownload(selectedImage, 0);
                }}
              >
                <Download size={16} className="mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
