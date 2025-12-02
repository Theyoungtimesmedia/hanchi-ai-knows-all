import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ImagePlus, Loader2, Download, RefreshCw } from "lucide-react";
import { useImageGeneration } from "@/hooks/useImageGeneration";

interface ImageGenerationModalProps {
  onImageGenerated?: (imageUrl: string) => void;
  trigger?: React.ReactNode;
}

export const ImageGenerationModal = ({ onImageGenerated, trigger }: ImageGenerationModalProps) => {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<"default" | "nigerian" | "sticker" | "professional" | "creative">("default");
  const [isSticker, setIsSticker] = useState(false);
  
  const { isGenerating, generatedImage, generateImage, clearImage } = useImageGeneration();

  const handleGenerate = async () => {
    const image = await generateImage(prompt, style, isSticker);
    if (image && onImageGenerated) {
      onImageGenerated(image.url);
    }
  };

  const handleDownload = async () => {
    if (!generatedImage?.url) return;
    
    try {
      const link = document.createElement('a');
      link.href = generatedImage.url;
      link.download = `hanchi-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const handleRegenerate = () => {
    clearImage();
    handleGenerate();
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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImagePlus className="text-primary" size={20} />
            Create Image with Hanchi
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Prompt Input */}
          <div className="space-y-2">
            <Label htmlFor="prompt">Describe your image</Label>
            <Textarea
              id="prompt"
              placeholder="A beautiful sunset over Lagos Island with orange and purple sky..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Style Selection */}
          <div className="space-y-2">
            <Label>Style</Label>
            <Select value={style} onValueChange={(v: any) => setStyle(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="nigerian">Nigerian Style 🇳🇬</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="creative">Creative / Artistic</SelectItem>
                <SelectItem value="sticker">WhatsApp Sticker</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sticker Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sticker-mode">WhatsApp Sticker Mode</Label>
              <p className="text-xs text-muted-foreground">
                512x512px, transparent background, bold design
              </p>
            </div>
            <Switch
              id="sticker-mode"
              checked={isSticker}
              onCheckedChange={setIsSticker}
            />
          </div>

          {/* Generated Image Preview */}
          {generatedImage && (
            <div className="space-y-3">
              <Label>Generated Image</Label>
              <div className="relative rounded-xl overflow-hidden border border-border bg-muted/50">
                <img 
                  src={generatedImage.url} 
                  alt="Generated" 
                  className="w-full h-auto max-h-[300px] object-contain"
                />
              </div>
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
                  onClick={handleRegenerate}
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
            className="w-full gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <ImagePlus size={18} />
                Generate Image
              </>
            )}
          </Button>

          {/* Tips */}
          <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/50 rounded-lg">
            <p className="font-medium">💡 Tips for better results:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Be specific about colors, style, and composition</li>
              <li>For Nigerian themes: mention landmarks, Ankara, traditional elements</li>
              <li>For stickers: keep designs simple and expressive</li>
              <li>Try prompts like: "Omo character saying 'No wahala'"</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
