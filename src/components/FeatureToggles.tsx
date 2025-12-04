import { useState } from "react";
import { Image as ImageIcon, Search, Languages, X } from "lucide-react";
import { Button } from "./ui/button";
import { ImageGenerationModal } from "./ImageGenerationModal";
import { VoiceTranslationPanel } from "./VoiceTranslationPanel";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { cn } from "@/lib/utils";

interface FeatureTogglesProps {
  onWebSearch?: (query: string) => void;
  disabled?: boolean;
}

export const FeatureToggles = ({ onWebSearch, disabled }: FeatureTogglesProps) => {
  const [showTranslation, setShowTranslation] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim() && onWebSearch) {
      onWebSearch(searchQuery.trim());
      setSearchQuery("");
      setShowSearch(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Image Generation Toggle */}
      <ImageGenerationModal
        trigger={
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10"
            disabled={disabled}
            title="Generate Image 🎨"
          >
            <ImageIcon size={18} />
          </Button>
        }
      />

      {/* Voice Translation Toggle */}
      <Dialog open={showTranslation} onOpenChange={setShowTranslation}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10"
            disabled={disabled}
            title="Voice Translation 🗣️"
          >
            <Languages size={18} />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md p-0 bg-transparent border-none">
          <VoiceTranslationPanel onClose={() => setShowTranslation(false)} />
        </DialogContent>
      </Dialog>

      {/* Web Search Toggle */}
      <Dialog open={showSearch} onOpenChange={setShowSearch}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10"
            disabled={disabled}
            title="Search the Web 🔍"
          >
            <Search size={18} />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="text-primary" size={20} />
              <h3 className="text-lg font-semibold">Nose Around the Web 👃</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Search the web and get answers with sources
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="What should I search for?"
                className="flex-1 bg-muted border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button onClick={handleSearch} disabled={!searchQuery.trim()}>
                Search
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
