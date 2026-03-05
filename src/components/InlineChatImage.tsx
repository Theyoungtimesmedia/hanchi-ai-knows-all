import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Share2, Trash2, Edit2, ExternalLink, Copy, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface InlineChatImageProps {
  imageUrl: string;
  prompt: string;
  isLoading?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const InlineChatImage = ({ imageUrl, prompt, isLoading, onEdit, onDelete }: InlineChatImageProps) => {
  const [fullscreen, setFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hanchi-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "Downloaded! 📥" });
    } catch {
      window.open(imageUrl, "_blank");
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], "hanchi-creation.png", { type: "image/png" });
        await navigator.share({ title: "Hanchi AI Creation", files: [file] });
      } else {
        await navigator.clipboard.writeText(imageUrl);
        toast({ title: "Link copied for sharing" });
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        toast({ title: "Share failed", variant: "destructive" });
      }
    }
  };

  const handleCopy = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Copied! 📋" });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-border/60 bg-muted/30 p-6 flex flex-col items-center justify-center gap-3 min-h-[200px]"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Creating your image...</p>
        <p className="text-xs text-muted-foreground/70 max-w-[200px] text-center truncate">"{prompt}"</p>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl overflow-hidden border border-border/60 bg-muted/20"
      >
        {/* Image */}
        <div className="relative cursor-pointer group" onClick={() => setFullscreen(true)}>
          <img
            src={imageUrl}
            alt={prompt}
            className="w-full max-h-[350px] object-contain bg-muted/30"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <ExternalLink className="w-6 h-6 text-white opacity-0 group-hover:opacity-70 transition-opacity drop-shadow-lg" />
          </div>
        </div>

        {/* Action bar */}
        <div className="flex items-center gap-1 p-2 border-t border-border/40 bg-card/50">
          <Button variant="ghost" size="sm" onClick={handleDownload} className="h-8 px-2.5 gap-1.5 text-xs">
            <Download size={14} /> Download
          </Button>
          <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 px-2 gap-1.5 text-xs">
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleShare} className="h-8 px-2 gap-1.5 text-xs">
            <Share2 size={14} />
          </Button>
          {onEdit && (
            <Button variant="ghost" size="sm" onClick={onEdit} className="h-8 px-2 gap-1.5 text-xs">
              <Edit2 size={14} /> Edit
            </Button>
          )}
          {onDelete && (
            <Button variant="ghost" size="sm" onClick={onDelete} className="h-8 px-2 gap-1.5 text-xs text-destructive hover:text-destructive">
              <Trash2 size={14} />
            </Button>
          )}
        </div>
      </motion.div>

      {/* Fullscreen */}
      {fullscreen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in" onClick={() => setFullscreen(false)}>
          <div className="relative max-w-4xl max-h-[90vh]">
            <img src={imageUrl} alt={prompt} className="max-w-full max-h-[90vh] object-contain rounded-xl" />
            <div className="absolute top-4 right-4 flex gap-2">
              <Button size="sm" variant="secondary" className="bg-black/50 hover:bg-black/70 text-white" onClick={(e) => { e.stopPropagation(); handleDownload(); }}>
                <Download size={16} className="mr-2" /> Download
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
