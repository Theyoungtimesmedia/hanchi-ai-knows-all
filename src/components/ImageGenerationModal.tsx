import { useState, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ImagePlus, Loader2, Sparkles, Smile, Wand2, 
  ChevronDown, ChevronUp, Type, Zap, Sticker, Download
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { 
  StyleSelector, 
  ModelSelector, 
  TextOverlayEditor,
  ImagePreview,
  GiphyBrowser,
  type ImageStyle,
  type ImageModel,
  type TextOverlay,
} from "./image-creator";

interface ImageGenerationModalProps {
  onImageGenerated?: (imageUrl: string) => void;
  trigger?: React.ReactNode;
  defaultStickerMode?: boolean;
}

const PROMPT_SUGGESTIONS = [
  "A beautiful sunset over Lagos Island skyline",
  "Nigerian street food vendor in vibrant market",
  "Ankara fabric pattern with modern design",
  "Happy Nigerian family celebrating Sallah",
  "Futuristic African city with traditional elements",
  "Portrait of elegant Nigerian woman in gele",
];

const STICKER_SUGGESTIONS = [
  "Happy Nigerian man laughing - WhatsApp sticker",
  "Cute chibi Nigerian girl with Ankara dress",
  "Nigerian slang text: 'E choke!'",
  "Funny reaction face - 'Wetin concern me?'",
  "Nigerian jollof rice with happy face",
  "Money flying - 'God when?'",
];

export const ImageGenerationModal = ({ onImageGenerated, trigger, defaultStickerMode = false }: ImageGenerationModalProps) => {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<ImageStyle>("default");
  const [model, setModel] = useState<ImageModel>("sdxl-turbo");
  const [isSticker, setIsSticker] = useState(defaultStickerMode);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<any>(null);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [activeTab, setActiveTab] = useState("generate");
  const { toast } = useToast();

  // Update sticker mode when prop changes
  useEffect(() => {
    setIsSticker(defaultStickerMode);
    if (defaultStickerMode) {
      setStyle("nigerian_meme");
    }
  }, [defaultStickerMode]);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      toast({
        title: "Enter a prompt",
        description: "Describe what you want to create",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);
    setTextOverlays([]);

    try {
      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: { 
          prompt, 
          style, 
          model,
          isSticker: isSticker || style === "sticker" || style === "nigerian_meme",
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || "Generation failed");

      setGeneratedImage(data);
      
      toast({
        title: "Created!",
        description: data.message || "Your image is ready",
      });

      if (onImageGenerated && data.image_url) {
        onImageGenerated(data.image_url);
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, style, model, isSticker, toast, onImageGenerated]);

  const handleGiphySelect = (result: { id: string; title: string; url: string; preview: string }) => {
    setGeneratedImage({
      image_url: result.url,
      provider: "giphy",
      message: `Selected "${result.title}" from Giphy!`,
    });
    setActiveTab("generate");
  };

  const handleUsePrompt = (suggestion: string) => {
    setPrompt(suggestion);
  };

  const suggestions = isSticker ? STICKER_SUGGESTIONS : PROMPT_SUGGESTIONS;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2 rounded-xl">
            <ImagePlus size={18} /> Create Image
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[580px] max-h-[90vh] p-0 gap-0 overflow-hidden rounded-2xl">
        {/* Header */}
        <DialogHeader className="px-6 py-5 border-b border-border bg-gradient-to-r from-primary/5 to-violet-500/5">
          <DialogTitle className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center shadow-lg">
              {isSticker ? <Sticker className="text-white" size={22} /> : <Wand2 className="text-white" size={22} />}
            </div>
            <div>
              <span className="text-xl font-bold">{isSticker ? "Sticker Creator" : "Image Creator"}</span>
              <p className="text-sm text-muted-foreground font-normal">
                {isSticker ? "Create WhatsApp-style stickers" : "AI-powered image generation"}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-100px)]">
          <div className="p-6 space-y-6">
            {/* Mode Toggle */}
            <div className="flex items-center justify-center gap-4 p-4 bg-muted/30 rounded-2xl">
              <button
                onClick={() => { setIsSticker(false); setStyle("default"); }}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all",
                  !isSticker 
                    ? "bg-primary text-primary-foreground shadow-lg" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Wand2 size={18} />
                Image
              </button>
              <button
                onClick={() => { setIsSticker(true); setStyle("nigerian_meme"); }}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all",
                  isSticker 
                    ? "bg-primary text-primary-foreground shadow-lg" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Sticker size={18} />
                Sticker
              </button>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-12 rounded-xl">
                <TabsTrigger value="generate" className="gap-2 text-sm rounded-lg">
                  <Sparkles size={16} /> Generate AI
                </TabsTrigger>
                <TabsTrigger value="giphy" className="gap-2 text-sm rounded-lg">
                  <Smile size={16} /> Giphy Search
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="generate" className="space-y-5 mt-5">
                {/* Prompt Input */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-sm font-semibold">
                    <Type size={16} /> Describe your {isSticker ? "sticker" : "image"}
                  </Label>
                  <Textarea
                    placeholder={isSticker 
                      ? "A funny Nigerian meme sticker..."
                      : "A beautiful sunset over Lagos Island..."
                    }
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[110px] resize-none text-base rounded-xl"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.metaKey) {
                        handleGenerate();
                      }
                    }}
                  />
                  
                  {/* Prompt Suggestions */}
                  <div className="flex flex-wrap gap-2">
                    {suggestions.slice(0, 3).map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => handleUsePrompt(suggestion)}
                        className="px-3 py-1.5 text-xs bg-muted/50 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground truncate max-w-[200px]"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Style Selector */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-sm font-semibold">
                    <Sparkles size={16} /> Style
                  </Label>
                  <StyleSelector value={style} onChange={setStyle} />
                </div>

                {/* Advanced Options Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full gap-2 text-muted-foreground"
                >
                  Advanced Options
                  {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </Button>

                {/* Advanced Options */}
                {showAdvanced && (
                  <div className="space-y-4 p-4 bg-muted/20 rounded-xl border border-border animate-fade-in">
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2 text-sm">
                        <Zap size={14} /> AI Model
                      </Label>
                      <ModelSelector value={model} onChange={setModel} compact />
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="giphy" className="mt-5">
                <GiphyBrowser onSelect={handleGiphySelect} />
              </TabsContent>
            </Tabs>

            {/* Generated Image Preview */}
            {generatedImage && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Your Creation</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTextEditor(!showTextEditor)}
                    className={cn(
                      "gap-2 text-xs rounded-lg",
                      showTextEditor && "bg-primary/10 text-primary"
                    )}
                  >
                    <Type size={14} />
                    Add Text
                  </Button>
                </div>
                
                <ImagePreview
                  imageUrl={generatedImage.image_url}
                  provider={generatedImage.provider}
                  textOverlays={textOverlays}
                  onRegenerate={handleGenerate}
                  isRegenerating={isGenerating}
                />
                
                {/* Text Overlay Editor */}
                {showTextEditor && (
                  <div className="animate-fade-in">
                    <TextOverlayEditor
                      overlays={textOverlays}
                      onChange={setTextOverlays}
                      imageWidth={512}
                      imageHeight={512}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Generate Button */}
            {activeTab === "generate" && (
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating || !prompt.trim()}
                className="w-full h-14 gap-2 text-base font-semibold rounded-xl"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    {isSticker ? <Sticker size={20} /> : <Wand2 size={20} />}
                    Generate {isSticker ? "Sticker" : "Image"}
                  </>
                )}
              </Button>
            )}

            {/* Tips */}
            <div className="text-sm text-muted-foreground space-y-2 p-4 bg-muted/30 rounded-xl">
              <p className="font-semibold flex items-center gap-2">
                <Sparkles size={14} /> Pro tips
              </p>
              <ul className="space-y-1 text-xs ml-5">
                {isSticker ? (
                  <>
                    <li>• Use "Nigerian Meme" style for WhatsApp-ready stickers</li>
                    <li>• Add text like "E choke!" or "God when?" for reactions</li>
                    <li>• Be specific: "laughing Nigerian man with gele"</li>
                  </>
                ) : (
                  <>
                    <li>• Use "Midjourney" style for stunning artistic images</li>
                    <li>• Be specific: "Happy Yoruba woman in Ankara" vs just "woman"</li>
                    <li>• Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">⌘ Enter</kbd> to generate quickly</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
