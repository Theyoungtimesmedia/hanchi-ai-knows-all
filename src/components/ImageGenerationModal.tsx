import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ImagePlus, Loader2, Sparkles, Smile, Wand2, 
  ChevronDown, ChevronUp, Type, Zap
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
}

const PROMPT_SUGGESTIONS = [
  "A beautiful sunset over Lagos Island with orange sky",
  "Nigerian street food vendor in colorful market",
  "Ankara pattern design with vibrant colors",
  "Happy Yoruba woman in traditional attire",
  "Futuristic Lagos skyline at night",
  "Cute anime girl with Nigerian flag colors",
];

export const ImageGenerationModal = ({ onImageGenerated, trigger }: ImageGenerationModalProps) => {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<ImageStyle>("default");
  const [model, setModel] = useState<ImageModel>("sdxl-turbo");
  const [isSticker, setIsSticker] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<any>(null);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [activeTab, setActiveTab] = useState("generate");
  const { toast } = useToast();

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
          isSticker: isSticker || style === "sticker" || style === "nigerian_sticker",
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || "Generation failed");

      setGeneratedImage(data);
      
      toast({
        title: "Created! 🎨",
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <ImagePlus size={18} /> Create Image
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-purple-500/5">
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
              <Wand2 className="text-primary-foreground" size={20} />
            </div>
            <div>
              <span className="text-lg">Hanchi Image Creator</span>
              <p className="text-xs text-muted-foreground font-normal">
                AI-powered images & stickers
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-80px)]">
          <div className="p-6 space-y-5">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-12">
                <TabsTrigger value="generate" className="gap-2 text-sm">
                  <Sparkles size={16} /> Generate AI
                </TabsTrigger>
                <TabsTrigger value="giphy" className="gap-2 text-sm">
                  <Smile size={16} /> Giphy Search
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="generate" className="space-y-5 mt-5">
                {/* Prompt Input */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Type size={16} /> Describe your image
                  </Label>
                  <Textarea
                    placeholder="A beautiful sunset over Lagos Island..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[100px] resize-none text-base"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.metaKey) {
                        handleGenerate();
                      }
                    }}
                  />
                  
                  {/* Prompt Suggestions */}
                  <div className="flex flex-wrap gap-1.5">
                    {PROMPT_SUGGESTIONS.slice(0, 3).map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => handleUsePrompt(suggestion)}
                        className="px-2.5 py-1 text-xs bg-muted/50 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground truncate max-w-[200px]"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Style Selector */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Sparkles size={16} /> Style
                  </Label>
                  <StyleSelector value={style} onChange={setStyle} />
                </div>

                {/* Quick Options */}
                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
                  <div className="flex items-center gap-3 flex-1">
                    <Switch
                      id="sticker-mode"
                      checked={isSticker}
                      onCheckedChange={setIsSticker}
                    />
                    <Label htmlFor="sticker-mode" className="text-sm cursor-pointer">
                      <span className="font-medium">Sticker Mode</span>
                      <span className="text-muted-foreground ml-2">512x512</span>
                    </Label>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="gap-1 text-muted-foreground"
                  >
                    Advanced
                    {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </Button>
                </div>

                {/* Advanced Options */}
                {showAdvanced && (
                  <div className="space-y-4 p-4 bg-muted/20 rounded-xl border border-border animate-in fade-in slide-in-from-top-2">
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
                  <Label className="text-sm font-medium">Your Creation</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTextEditor(!showTextEditor)}
                    className={cn(
                      "gap-1.5 text-xs",
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
                  <div className="animate-in fade-in slide-in-from-top-2">
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
                className="w-full h-12 gap-2 text-base font-medium"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Creating magic...
                  </>
                ) : (
                  <>
                    <Wand2 size={20} />
                    Generate Image
                  </>
                )}
              </Button>
            )}

            {/* Tips */}
            <div className="text-xs text-muted-foreground space-y-1.5 p-4 bg-muted/30 rounded-xl">
              <p className="font-medium flex items-center gap-1.5">
                <span className="text-base">💡</span> Pro tips
              </p>
              <ul className="space-y-1 ml-5">
                <li>• Use <strong>Midjourney</strong> style for stunning artistic images</li>
                <li>• <strong>Nigerian Meme</strong> creates WhatsApp-ready stickers</li>
                <li>• Be specific: "Happy Yoruba woman in Ankara" vs just "woman"</li>
                <li>• Press <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">⌘ Enter</kbd> to generate quickly</li>
              </ul>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
