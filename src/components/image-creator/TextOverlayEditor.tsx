import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Type, Palette, Move, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  strokeColor: string;
  strokeWidth: number;
  rotation: number;
}

const FONT_OPTIONS = [
  { value: "Impact", label: "Impact (Meme)" },
  { value: "Arial Black", label: "Arial Black" },
  { value: "Comic Sans MS", label: "Comic Sans" },
  { value: "Bangers", label: "Bangers" },
  { value: "Permanent Marker", label: "Marker" },
];

const PRESET_COLORS = [
  "#FFFFFF", "#000000", "#FF0000", "#00FF00", 
  "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF",
  "#FF6B00", "#008000", "#FFA500", "#800080"
];

const NIGERIAN_PHRASES = [
  "No wahala!", "E choke!", "Sapa loading...", "Comrade why?",
  "God when?", "Omo see life!", "Na me be this?", "Ehen!",
  "Shey you dey whine me?", "Person pikin!", "Why you dey do me?",
];

interface TextOverlayEditorProps {
  overlays: TextOverlay[];
  onChange: (overlays: TextOverlay[]) => void;
  imageWidth: number;
  imageHeight: number;
}

export const TextOverlayEditor = ({ 
  overlays, 
  onChange, 
  imageWidth, 
  imageHeight 
}: TextOverlayEditorProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(overlays[0]?.id || null);
  
  const selectedOverlay = overlays.find(o => o.id === selectedId);

  const addOverlay = (text = "Your text here") => {
    const newOverlay: TextOverlay = {
      id: `text-${Date.now()}`,
      text,
      x: 50,
      y: 50,
      fontSize: 32,
      fontFamily: "Impact",
      color: "#FFFFFF",
      strokeColor: "#000000",
      strokeWidth: 2,
      rotation: 0,
    };
    onChange([...overlays, newOverlay]);
    setSelectedId(newOverlay.id);
  };

  const updateOverlay = (id: string, updates: Partial<TextOverlay>) => {
    onChange(overlays.map(o => o.id === id ? { ...o, ...updates } : o));
  };

  const removeOverlay = (id: string) => {
    onChange(overlays.filter(o => o.id !== id));
    if (selectedId === id) {
      setSelectedId(overlays[0]?.id || null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Text List */}
      <div className="flex flex-wrap gap-2">
        {overlays.map((overlay, index) => (
          <button
            key={overlay.id}
            onClick={() => setSelectedId(overlay.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all",
              "border",
              selectedId === overlay.id 
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted/50 border-border hover:border-primary/50"
            )}
          >
            <Type size={14} />
            <span className="max-w-[100px] truncate">{overlay.text || `Text ${index + 1}`}</span>
          </button>
        ))}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => addOverlay()}
          className="gap-1"
        >
          <Plus size={14} /> Add Text
        </Button>
      </div>

      {/* Quick Phrases */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Quick Nigerian Phrases</Label>
        <div className="flex flex-wrap gap-1.5">
          {NIGERIAN_PHRASES.slice(0, 6).map((phrase) => (
            <button
              key={phrase}
              onClick={() => addOverlay(phrase)}
              className="px-2 py-1 text-xs bg-muted/50 hover:bg-muted rounded-md transition-colors border border-border hover:border-primary/50"
            >
              {phrase}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Text Editor */}
      {selectedOverlay && (
        <div className="p-4 bg-muted/30 rounded-xl space-y-4 border border-border">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Type size={16} /> Edit Text
            </Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeOverlay(selectedOverlay.id)}
              className="text-destructive hover:text-destructive h-8 w-8 p-0"
            >
              <Trash2 size={16} />
            </Button>
          </div>

          <Input
            value={selectedOverlay.text}
            onChange={(e) => updateOverlay(selectedOverlay.id, { text: e.target.value })}
            placeholder="Enter your text..."
            className="font-bold"
          />

          <div className="grid grid-cols-2 gap-4">
            {/* Font Family */}
            <div className="space-y-2">
              <Label className="text-xs">Font</Label>
              <Select 
                value={selectedOverlay.fontFamily}
                onValueChange={(v) => updateOverlay(selectedOverlay.id, { fontFamily: v })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map(font => (
                    <SelectItem key={font.value} value={font.value}>
                      <span style={{ fontFamily: font.value }}>{font.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Font Size */}
            <div className="space-y-2">
              <Label className="text-xs">Size: {selectedOverlay.fontSize}px</Label>
              <Slider
                value={[selectedOverlay.fontSize]}
                onValueChange={([v]) => updateOverlay(selectedOverlay.id, { fontSize: v })}
                min={12}
                max={72}
                step={2}
              />
            </div>
          </div>

          {/* Colors */}
          <div className="space-y-2">
            <Label className="text-xs flex items-center gap-2">
              <Palette size={14} /> Colors
            </Label>
            <div className="flex items-center gap-4">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Text</span>
                <div className="flex gap-1">
                  {PRESET_COLORS.slice(0, 6).map(color => (
                    <button
                      key={`text-${color}`}
                      onClick={() => updateOverlay(selectedOverlay.id, { color })}
                      className={cn(
                        "w-6 h-6 rounded-md border-2 transition-transform hover:scale-110",
                        selectedOverlay.color === color ? "border-primary" : "border-transparent"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Stroke</span>
                <div className="flex gap-1">
                  {PRESET_COLORS.slice(0, 6).map(color => (
                    <button
                      key={`stroke-${color}`}
                      onClick={() => updateOverlay(selectedOverlay.id, { strokeColor: color })}
                      className={cn(
                        "w-6 h-6 rounded-md border-2 transition-transform hover:scale-110",
                        selectedOverlay.strokeColor === color ? "border-primary" : "border-transparent"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Position */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-2">
                <Move size={14} /> X: {selectedOverlay.x}%
              </Label>
              <Slider
                value={[selectedOverlay.x]}
                onValueChange={([v]) => updateOverlay(selectedOverlay.id, { x: v })}
                min={0}
                max={100}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Y: {selectedOverlay.y}%</Label>
              <Slider
                value={[selectedOverlay.y]}
                onValueChange={([v]) => updateOverlay(selectedOverlay.id, { y: v })}
                min={0}
                max={100}
              />
            </div>
          </div>

          {/* Stroke Width & Rotation */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Stroke: {selectedOverlay.strokeWidth}px</Label>
              <Slider
                value={[selectedOverlay.strokeWidth]}
                onValueChange={([v]) => updateOverlay(selectedOverlay.id, { strokeWidth: v })}
                min={0}
                max={6}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Rotate: {selectedOverlay.rotation}°</Label>
              <Slider
                value={[selectedOverlay.rotation]}
                onValueChange={([v]) => updateOverlay(selectedOverlay.id, { rotation: v })}
                min={-45}
                max={45}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
