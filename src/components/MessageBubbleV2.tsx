import { useState } from "react";
import { ChevronDown, ChevronRight, Copy, Check, RefreshCw, Volume2 } from "lucide-react";
import { MarkdownMessage } from "./MarkdownMessage";
import { Button } from "./ui/button";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

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
  language = "en",
}: MessageBubbleV2Props) => {
  const [showThought, setShowThought] = useState(false);
  const [copied, setCopied] = useState(false);
  const isAI = role === "assistant";
  const { speak, isPlaying, stop } = useTextToSpeech();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (isPlaying) {
      stop();
    } else {
      speak(content, language);
    }
  };

  const formattedTime = timestamp || new Date().toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const getNoseConfidence = (conf: number) => {
    if (conf >= 80) return { text: "Hanchi's nose is sure 👃✓", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
    if (conf >= 60) return { text: "Nose is sniffing 👃~", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" };
    return { text: "Still nosing around 👃?", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
  };

  return (
    <div className={`flex w-full mb-6 ${isAI ? 'justify-start' : 'justify-end'} animate-fade-in`}>
      <div className={`flex flex-col max-w-[85%] md:max-w-[70%] ${isAI ? 'items-start' : 'items-end'}`}>
        
        {/* Thought Process Accordion (AI Only) */}
        {isAI && thought && (
          <div className="mb-2 w-full">
            <button 
              onClick={() => setShowThought(!showThought)}
              className="flex items-center gap-2 text-xs font-semibold text-primary/70 hover:text-primary transition-colors bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10"
            >
              <span>👃🏿</span>
              {showThought ? "Hide Hanchi's Thinking" : "See How Hanchi Nosed It Out"}
              {showThought ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </button>
            
            {showThought && (
              <div className="mt-2 p-4 bg-card rounded-xl border border-primary/10 shadow-sm text-sm text-muted-foreground animate-scale-in">
                <div className="flex items-center gap-2 mb-2 text-primary text-xs font-bold uppercase tracking-wider">
                  <span>👃🏿</span> Hanchi's Thought Process
                </div>
                <p className="whitespace-pre-wrap">{thought}</p>
              </div>
            )}
          </div>
        )}

        {/* Message Content */}
        <div className={`relative px-5 py-4 rounded-3xl shadow-sm text-sm md:text-base leading-relaxed ${
          isAI 
            ? 'bg-card text-foreground rounded-tl-none border border-border' 
            : 'bg-primary text-primary-foreground rounded-tr-none shadow-lg'
        }`}>
          {/* Images */}
          {images && images.length > 0 && (
            <div className="mb-3 grid gap-2">
              {images.map((img, i) => (
                <img 
                  key={i} 
                  src={img.startsWith('data:') ? img : `data:image/jpeg;base64,${img}`} 
                  alt="Upload" 
                  className="rounded-xl max-h-60 object-cover w-full" 
                />
              ))}
            </div>
          )}
          
          {/* Content */}
          {isAI ? (
            <MarkdownMessage content={content} />
          ) : (
            <p className="whitespace-pre-wrap">{content}</p>
          )}

          {/* Confidence badge */}
          {isAI && confidence && (
            <div className="mt-3 flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${getNoseConfidence(confidence).color}`}>
                {getNoseConfidence(confidence).text}
              </span>
            </div>
          )}
        </div>

        {/* Actions & Timestamp */}
        <div className="flex items-center gap-2 mt-2 px-2">
          <span className="text-[10px] text-muted-foreground">
            {formattedTime}
          </span>
          
          {isAI && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleCopy}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleSpeak}
              >
                <Volume2 size={12} className={isPlaying ? 'text-primary' : ''} />
              </Button>
              {onRegenerate && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={onRegenerate}
                  title="Nose it out again"
                >
                  <RefreshCw size={12} />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Sources */}
        {isAI && sources && sources.length > 0 && (
          <div className="mt-2 px-2 space-y-1">
            <span className="text-[10px] text-muted-foreground font-medium">👃 What Hanchi sniffed out:</span>
            {sources.slice(0, 3).map((source, i) => (
              <div key={i} className="text-[10px] text-muted-foreground">
                {source.url ? (
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                    {source.title}
                  </a>
                ) : (
                  <span>{source.title}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
