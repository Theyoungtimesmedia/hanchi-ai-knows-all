import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Edit2, Share2, Copy, Check } from "lucide-react";
import { TextOverlay } from "./TextOverlayEditor";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ImagePreviewProps {
  imageUrl: string;
  provider?: string;
  textOverlays?: TextOverlay[];
  onRegenerate?: () => void;
  onEdit?: () => void;
  isRegenerating?: boolean;
  className?: string;
}

export const ImagePreview = ({
  imageUrl,
  provider,
  textOverlays = [],
  onRegenerate,
  onEdit,
  isRegenerating,
  className,
}: ImagePreviewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Render image with text overlays
  useEffect(() => {
    if (!canvasRef.current || !imageUrl) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image
      ctx.drawImage(img, 0, 0);
      
      // Draw text overlays
      textOverlays.forEach(overlay => {
        const x = (overlay.x / 100) * canvas.width;
        const y = (overlay.y / 100) * canvas.height;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((overlay.rotation * Math.PI) / 180);
        
        ctx.font = `bold ${overlay.fontSize}px "${overlay.fontFamily}", Impact, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // Draw stroke
        if (overlay.strokeWidth > 0) {
          ctx.strokeStyle = overlay.strokeColor;
          ctx.lineWidth = overlay.strokeWidth * 2;
          ctx.lineJoin = "round";
          ctx.strokeText(overlay.text, 0, 0);
        }
        
        // Draw fill
        ctx.fillStyle = overlay.color;
        ctx.fillText(overlay.text, 0, 0);
        
        ctx.restore();
      });
      
      setIsReady(true);
    };
    
    img.onerror = () => {
      console.error("Failed to load image for canvas");
      setIsReady(false);
    };
    
    img.src = imageUrl;
  }, [imageUrl, textOverlays]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    
    try {
      const dataUrl = canvasRef.current.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `hanchi-creation-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({ title: "Downloaded! 📥", description: "Image saved to your device" });
    } catch {
      // Fallback for cross-origin images
      window.open(imageUrl, "_blank");
    }
  };

  const handleCopy = async () => {
    if (!canvasRef.current) return;
    
    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvasRef.current?.toBlob(blob => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to create blob"));
        }, "image/png");
      });
      
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob })
      ]);
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Copied! 📋", description: "Image copied to clipboard" });
    } catch {
      toast({ 
        title: "Copy failed", 
        description: "Could not copy image to clipboard",
        variant: "destructive" 
      });
    }
  };

  const handleShare = async () => {
    if (!navigator.share) {
      toast({ 
        title: "Sharing not supported", 
        description: "Use download or copy instead",
        variant: "destructive"
      });
      return;
    }

    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvasRef.current?.toBlob(blob => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to create blob"));
        }, "image/png");
      });
      
      const file = new File([blob], "hanchi-creation.png", { type: "image/png" });
      
      await navigator.share({
        title: "Check out my Hanchi creation!",
        files: [file],
      });
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error("Share failed:", err);
      }
    }
  };

  const providerLabel = provider === "giphy" ? "🎉 Giphy" :
                        provider === "replicate" ? "🎨 AI" :
                        provider === "openai" ? "🎨 AI" : null;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Image Container */}
      <div className="relative rounded-2xl overflow-hidden border border-border bg-gradient-to-br from-muted/50 to-muted">
        <canvas
          ref={canvasRef}
          className={cn(
            "w-full h-auto max-h-[400px] object-contain transition-opacity duration-300",
            isReady ? "opacity-100" : "opacity-0"
          )}
        />
        
        {/* Fallback image while canvas loads */}
        {!isReady && (
          <img 
            src={imageUrl} 
            alt="Generated" 
            className="w-full h-auto max-h-[400px] object-contain"
          />
        )}
        
        {/* Provider badge */}
        {providerLabel && (
          <div className="absolute top-3 right-3 px-3 py-1.5 bg-background/90 backdrop-blur-sm rounded-full text-xs font-medium shadow-lg">
            {providerLabel}
          </div>
        )}
        
        {/* Loading overlay */}
        {isRegenerating && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <RefreshCw className="w-8 h-8 animate-spin text-primary" />
              <span className="text-sm font-medium">Regenerating...</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button 
          variant="default" 
          size="sm" 
          onClick={handleDownload}
          className="flex-1 gap-2"
        >
          <Download size={16} /> Download
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleCopy}
          className="gap-2"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleShare}
          className="gap-2"
        >
          <Share2 size={16} />
        </Button>
        
        {onEdit && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onEdit}
            className="gap-2"
          >
            <Edit2 size={16} /> Edit
          </Button>
        )}
        
        {onRegenerate && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="gap-2"
          >
            <RefreshCw size={16} className={isRegenerating ? "animate-spin" : ""} />
          </Button>
        )}
      </div>
    </div>
  );
};
