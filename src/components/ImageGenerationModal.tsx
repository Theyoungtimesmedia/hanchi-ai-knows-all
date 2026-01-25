import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImagePlus, Loader2, Download, RefreshCw, Sparkles, Palette, Smile } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ImageGenerationModalProps {
  onImageGenerated?: (imageUrl: string) => void;
  trigger?: React.ReactNode;
}

type ImageStyle = 
  | "default" | "nigerian" | "nigerian_sticker" | "sticker" 
  | "anime" | "midjourney" | "dalle" | "realistic" 
  | "professional" | "creative" | "cartoon" 
  | "oil_painting" | "watercolor" | "pixel_art" | "3d_render";

type ImageModel = "sdxl" | "sdxl-turbo" | "anime" | "dreamshaper" | "realistic";

const STYLES: { value: ImageStyle; label: string; emoji: string; category: "general" | "artistic" | "nigerian" }[] = [
  { value: "default", label: "Default", emoji: "✨", category: "general" },
  { value: "professional", label: "Professional", emoji: "💼", category: "general" },
  { value: "creative", label: "Creative", emoji: "🎨", category: "general" },
  { value: "realistic", label: "Photorealistic", emoji: "📷", category: "general" },
  { value: "cartoon", label: "Cartoon", emoji: "🎬", category: "general" },
  { value: "3d_render", label: "3D Render", emoji: "🎮", category: "general" },
  
  { value: "anime", label: "Anime", emoji: "🌸", category: "artistic" },
  { value: "midjourney", label: "Midjourney Style", emoji: "🔮", category: "artistic" },
  { value: "dalle", label: "DALL-E Style", emoji: "🤖", category: "artistic" },
  { value: "oil_painting", label: "Oil Painting", emoji: "🖼️", category: "artistic" },
  { value: "watercolor", label: "Watercolor", emoji: "💧", category: "artistic" },
  { value: "pixel_art", label: "Pixel Art", emoji: "👾", category: "artistic" },
  
  { value: "nigerian", label: "Nigerian Style", emoji: "🇳🇬", category: "nigerian" },
  { value: "nigerian_sticker", label: "Nigerian Meme", emoji: "😂", category: "nigerian" },
  { value: "sticker", label: "WhatsApp Sticker", emoji: "💬", category: "nigerian" },
];

const MODELS: { value: ImageModel; label: string; description: string }[] = [
  { value: "sdxl", label: "SDXL", description: "High quality, detailed" },
  { value: "sdxl-turbo", label: "SDXL Turbo", description: "Fast generation" },
  { value: "anime", label: "Anime Model", description: "Best for anime style" },
  { value: "dreamshaper", label: "DreamShaper", description: "Artistic & creative" },
  { value: "realistic", label: "Realistic", description: "Photorealistic images" },
];

export const ImageGenerationModal = ({ onImageGenerated, trigger }: ImageGenerationModalProps) => {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<ImageStyle>("default");
  const [model, setModel] = useState<ImageModel>("sdxl");
  const [isSticker, setIsSticker] = useState(false);
  const [useGiphy, setUseGiphy] = useState(false);
  const [giphyType, setGiphyType] = useState<"stickers" | "gifs">("stickers");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<any>(null);
  const [giphyResults, setGiphyResults] = useState<any[]>([]);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt for the image",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);
    setGiphyResults([]);

    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { 
          prompt, 
          style, 
          model,
          isSticker: isSticker || style === "sticker" || style === "nigerian_sticker",
          useGiphy,
          giphyType
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || "Image generation failed");
      }

      setGeneratedImage(data);
      
      if (data.all_results) {
        setGiphyResults(data.all_results);
      }
      
      toast({
        title: data.provider === "giphy" ? "Found from Giphy! 🎉" : "Image generated! 🎨",
        description: data.message,
      });

      if (onImageGenerated && data.image_url) {
        onImageGenerated(data.image_url);
      }
    } catch (error) {
      console.error("Image generation error:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate image",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedImage?.image_url) return;
    
    try {
      const link = document.createElement('a');
      link.href = generatedImage.image_url;
      link.download = `hanchi-${style}-${Date.now()}.${generatedImage.provider === 'giphy' ? 'gif' : 'png'}`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download error:", error);
      window.open(generatedImage.image_url, '_blank');
    }
  };

  const selectGiphyResult = (result: any) => {
    setGeneratedImage({
      ...generatedImage,
      image_url: result.url,
      message: `Selected "${result.title}" from Giphy!`
    });
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImagePlus className="text-primary" size={20} />
            Create Image with Hanchi
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate" className="gap-2">
              <Sparkles size={16} /> Generate
            </TabsTrigger>
            <TabsTrigger value="giphy" className="gap-2">
              <Smile size={16} /> Giphy
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="generate" className="space-y-4 mt-4">
            {/* Prompt Input */}
            <div className="space-y-2">
              <Label htmlFor="prompt">Describe your image</Label>
              <Textarea
                id="prompt"
                placeholder="A beautiful sunset over Lagos Island with orange and purple sky..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[80px] resize-none"
              />
            </div>

            {/* Style Selection with Categories */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Palette size={16} /> Style
              </Label>
              <Select value={style} onValueChange={(v: ImageStyle) => setStyle(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1 text-xs text-muted-foreground font-semibold">General</div>
                  {STYLES.filter(s => s.category === "general").map(s => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.emoji} {s.label}
                    </SelectItem>
                  ))}
                  <div className="px-2 py-1 text-xs text-muted-foreground font-semibold mt-2">Artistic</div>
                  {STYLES.filter(s => s.category === "artistic").map(s => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.emoji} {s.label}
                    </SelectItem>
                  ))}
                  <div className="px-2 py-1 text-xs text-muted-foreground font-semibold mt-2">Nigerian 🇳🇬</div>
                  {STYLES.filter(s => s.category === "nigerian").map(s => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.emoji} {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Model Selection */}
            <div className="space-y-2">
              <Label>AI Model</Label>
              <Select value={model} onValueChange={(v: ImageModel) => setModel(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {MODELS.map(m => (
                    <SelectItem key={m.value} value={m.value}>
                      <div className="flex flex-col">
                        <span>{m.label}</span>
                        <span className="text-xs text-muted-foreground">{m.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sticker Mode Toggle */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="sticker-mode">Sticker Mode</Label>
                <p className="text-xs text-muted-foreground">
                  512x512px optimized for WhatsApp
                </p>
              </div>
              <Switch
                id="sticker-mode"
                checked={isSticker}
                onCheckedChange={setIsSticker}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="giphy" className="space-y-4 mt-4">
            {/* Giphy Search */}
            <div className="space-y-2">
              <Label htmlFor="giphy-prompt">Search Giphy</Label>
              <Textarea
                id="giphy-prompt"
                placeholder="Search for stickers, GIFs, memes..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[60px] resize-none"
              />
            </div>

            {/* Giphy Type */}
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={giphyType} onValueChange={(v: "stickers" | "gifs") => setGiphyType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stickers">🏷️ Stickers</SelectItem>
                  <SelectItem value="gifs">🎬 GIFs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="space-y-0.5">
                <Label>Use Giphy</Label>
                <p className="text-xs text-muted-foreground">
                  Search millions of stickers & GIFs
                </p>
              </div>
              <Switch
                checked={useGiphy}
                onCheckedChange={setUseGiphy}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Generated Image Preview */}
        {generatedImage && (
          <div className="space-y-3 mt-4">
            <Label>Generated {generatedImage.provider === 'giphy' ? 'Giphy Result' : 'Image'}</Label>
            <div className="relative rounded-xl overflow-hidden border border-border bg-muted/50">
              <img 
                src={generatedImage.image_url} 
                alt="Generated" 
                className="w-full h-auto max-h-[300px] object-contain"
              />
              {generatedImage.provider && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-background/80 rounded text-xs">
                  {generatedImage.provider === 'giphy' ? '🎉 Giphy' : 
                   generatedImage.provider === 'replicate' ? '🎨 AI' : '✨ Gemini'}
                </div>
              )}
            </div>
            
            {/* Giphy alternatives */}
            {giphyResults.length > 1 && (
              <div className="space-y-2">
                <Label className="text-xs">More options:</Label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {giphyResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => selectGiphyResult(result)}
                      className="flex-shrink-0 rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-colors"
                    >
                      <img 
                        src={result.preview || result.url} 
                        alt={result.title}
                        className="w-16 h-16 object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownload}
                className="flex-1 gap-2"
              >
                <Download size={16} /> Download
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex-1 gap-2"
              >
                <RefreshCw size={16} /> Regenerate
              </Button>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating || !prompt.trim()}
          className="w-full gap-2 mt-4"
        >
          {isGenerating ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              {useGiphy ? "Searching..." : "Generating..."}
            </>
          ) : (
            <>
              <ImagePlus size={18} />
              {useGiphy ? "Search Giphy" : "Generate Image"}
            </>
          )}
        </Button>

        {/* Tips */}
        <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/50 rounded-lg mt-4">
          <p className="font-medium">💡 Tips for better results:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Try <strong>Anime</strong> or <strong>Midjourney</strong> styles for artistic images</li>
            <li>Use <strong>Nigerian Meme</strong> for Naija-style WhatsApp stickers</li>
            <li>Enable <strong>Giphy</strong> tab to find existing stickers & GIFs</li>
            <li>Be specific: "A happy Yoruba woman in Ankara" vs "A woman"</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};
