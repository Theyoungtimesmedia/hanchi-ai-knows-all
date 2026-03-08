import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Sparkles, Download, Share2, Loader2, Trash2,
  Smile, Palette, Image as ImageIcon, Wand2, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const STYLE_PRESETS = [
  { id: "emoji", label: "Emoji", emoji: "😀", description: "Cute emoji style" },
  { id: "chibi", label: "Chibi", emoji: "🎭", description: "Anime chibi style" },
  { id: "meme", label: "Meme", emoji: "🤣", description: "Nigerian meme style" },
  { id: "cartoon", label: "Cartoon", emoji: "🎨", description: "Vibrant cartoon" },
  { id: "realistic", label: "Realistic", emoji: "📸", description: "Photo-realistic" },
  { id: "pixel", label: "Pixel Art", emoji: "👾", description: "Retro pixel style" },
];

interface StickerItem {
  id: string;
  prompt: string;
  image_url: string | null;
  image_base64: string | null;
  style: string | null;
  created_at: string | null;
}

export default function StickerStudio() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("cartoon");
  const [isGenerating, setIsGenerating] = useState(false);
  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewSticker, setPreviewSticker] = useState<StickerItem | null>(null);

  useEffect(() => {
    loadStickers();
  }, []);

  const loadStickers = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("generated_images")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("style", "sticker")
        .order("created_at", { ascending: false })
        .limit(50);

      if (data) setStickers(data);
    } catch (err) {
      console.error("Failed to load stickers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: {
          prompt: `${selectedStyle} style sticker: ${prompt}. White background, no border, sticker-ready, transparent edges, high quality`,
          style: "sticker",
          isSticker: true,
        },
      });

      if (error) throw error;

      if (data?.url || data?.base64) {
        toast({ title: "Sticker created! 🎨" });
        loadStickers();
        setPrompt("");
      }
    } catch (err) {
      toast({
        title: "Generation failed",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (sticker: StickerItem) => {
    const url = sticker.image_url || (sticker.image_base64 ? `data:image/png;base64,${sticker.image_base64}` : null);
    if (!url) return;

    const link = document.createElement("a");
    link.href = url;
    link.download = `sticker-${sticker.id.slice(0, 8)}.png`;
    link.click();
    toast({ title: "Downloaded! 📥" });
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("generated_images").delete().eq("id", id);
    if (!error) {
      setStickers(prev => prev.filter(s => s.id !== id));
      setPreviewSticker(null);
      toast({ title: "Sticker deleted" });
    }
  };

  const handleShare = async (sticker: StickerItem) => {
    const url = sticker.image_url || (sticker.image_base64 ? `data:image/png;base64,${sticker.image_base64}` : null);
    if (!url) return;

    if (navigator.share) {
      try {
        const res = await fetch(url);
        const blob = await res.blob();
        const file = new File([blob], "sticker.png", { type: "image/png" });
        await navigator.share({ files: [file], title: "Check out this sticker!" });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied!" });
    }
  };

  const getStickerUrl = (s: StickerItem) =>
    s.image_url || (s.image_base64 ? `data:image/png;base64,${s.image_base64}` : null);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl border-b border-border py-3 px-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/chat")} className="rounded-xl h-10 w-10">
            <ArrowLeft size={18} />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Palette size={20} className="text-primary" /> Sticker Studio
            </h1>
            <p className="text-xs text-muted-foreground">Create & manage your sticker collection</p>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-6 space-y-6">
        {/* Creator Section */}
        <div className="bg-card rounded-2xl border border-border/50 p-5 space-y-4 shadow-sm">
          <h2 className="font-semibold flex items-center gap-2">
            <Wand2 size={16} className="text-primary" /> Create New Sticker
          </h2>

          {/* Style Presets */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {STYLE_PRESETS.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={cn(
                  "flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border transition-all min-w-[80px]",
                  selectedStyle === style.id
                    ? "bg-primary/10 border-primary/30 shadow-sm"
                    : "bg-muted/50 border-border/50 hover:border-border"
                )}
              >
                <span className="text-2xl">{style.emoji}</span>
                <span className="text-xs font-medium">{style.label}</span>
              </button>
            ))}
          </div>

          {/* Prompt Input */}
          <div className="flex gap-3">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your sticker... e.g. 'Happy Nigerian man eating jollof rice'"
              className="flex-1 rounded-xl resize-none min-h-[80px]"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full rounded-xl h-12 gap-2 font-semibold"
          >
            {isGenerating ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Creating...
              </>
            ) : (
              <>
                <Sparkles size={18} /> Generate Sticker
              </>
            )}
          </Button>
        </div>

        {/* Sticker Grid */}
        <div>
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <ImageIcon size={16} className="text-primary" /> Your Stickers
            <span className="text-xs text-muted-foreground ml-auto">{stickers.length} stickers</span>
          </h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin text-primary" />
            </div>
          ) : stickers.length === 0 ? (
            <div className="text-center py-16">
              <Smile size={48} className="text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No stickers yet. Create your first one above!</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {stickers.map((sticker) => {
                const url = getStickerUrl(sticker);
                if (!url) return null;
                return (
                  <motion.div
                    key={sticker.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="group relative aspect-square rounded-xl border border-border/50 bg-muted/30 overflow-hidden cursor-pointer hover:border-primary/30 hover:shadow-md transition-all"
                    onClick={() => setPreviewSticker(sticker)}
                  >
                    <img src={url} alt={sticker.prompt} className="w-full h-full object-contain p-2" />
                    <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg" onClick={(e) => { e.stopPropagation(); handleDownload(sticker); }}>
                        <Download size={14} />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg" onClick={(e) => { e.stopPropagation(); handleShare(sticker); }}>
                        <Share2 size={14} />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); handleDelete(sticker.id); }}>
                        <Trash2 size={14} className="text-destructive" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Preview Lightbox */}
      <AnimatePresence>
        {previewSticker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/90 backdrop-blur-lg flex flex-col items-center justify-center p-6"
            onClick={() => setPreviewSticker(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={getStickerUrl(previewSticker)!}
                alt={previewSticker.prompt}
                className="w-full max-h-[60vh] object-contain rounded-2xl"
              />
              <p className="text-sm text-muted-foreground text-center mt-4 line-clamp-2">{previewSticker.prompt}</p>
              <div className="flex items-center justify-center gap-3 mt-4">
                <Button variant="outline" size="sm" className="rounded-xl gap-2" onClick={() => handleDownload(previewSticker)}>
                  <Download size={14} /> Download
                </Button>
                <Button variant="outline" size="sm" className="rounded-xl gap-2" onClick={() => handleShare(previewSticker)}>
                  <Share2 size={14} /> Share
                </Button>
                <Button variant="outline" size="sm" className="rounded-xl gap-2 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(previewSticker.id)}>
                  <Trash2 size={14} /> Delete
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
