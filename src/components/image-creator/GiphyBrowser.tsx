import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, TrendingUp, Loader2, Smile, Film } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface GiphyResult {
  id: string;
  title: string;
  url: string;
  preview: string;
}

interface GiphyBrowserProps {
  onSelect: (result: GiphyResult) => void;
}

export const GiphyBrowser = ({ onSelect }: GiphyBrowserProps) => {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"stickers" | "gifs">("stickers");
  const [results, setResults] = useState<GiphyResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const searchGiphy = async (searchQuery?: string) => {
    setIsLoading(true);
    setHasSearched(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: {
          prompt: searchQuery || query || "trending",
          useGiphy: true,
          giphyType: type,
        },
      });

      if (error) throw error;

      if (data.all_results) {
        setResults(data.all_results);
      } else if (data.image_url) {
        setResults([{
          id: data.giphy_id || "1",
          title: data.message || "Giphy result",
          url: data.image_url,
          preview: data.preview_url || data.image_url,
        }]);
      }
    } catch (error) {
      console.error("Giphy search error:", error);
      toast({
        title: "Search failed",
        description: "Could not search Giphy. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchGiphy();
    }
  };

  const quickSearches = [
    "laughing", "happy", "sad", "wow", "angry", 
    "dancing", "celebrating", "thinking", "love"
  ];

  return (
    <div className="space-y-4">
      {/* Type Toggle */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg">
        <button
          onClick={() => setType("stickers")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all text-sm font-medium",
            type === "stickers" 
              ? "bg-background shadow-sm text-foreground" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Smile size={16} /> Stickers
        </button>
        <button
          onClick={() => setType("gifs")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all text-sm font-medium",
            type === "gifs" 
              ? "bg-background shadow-sm text-foreground" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Film size={16} /> GIFs
        </button>
      </div>

      {/* Search Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Search ${type}...`}
            className="pl-10"
          />
        </div>
        <Button onClick={() => searchGiphy()} disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
        </Button>
      </div>

      {/* Quick Searches */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground flex items-center gap-2">
          <TrendingUp size={14} /> Quick searches
        </Label>
        <div className="flex flex-wrap gap-1.5">
          {quickSearches.map((term) => (
            <button
              key={term}
              onClick={() => {
                setQuery(term);
                searchGiphy(term);
              }}
              className="px-2.5 py-1 text-xs bg-muted/50 hover:bg-muted rounded-full transition-colors capitalize"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Trending Button */}
      {!hasSearched && (
        <Button 
          variant="outline" 
          className="w-full gap-2" 
          onClick={() => searchGiphy("trending")}
          disabled={isLoading}
        >
          <TrendingUp size={16} />
          Load Trending {type === "stickers" ? "Stickers" : "GIFs"}
        </Button>
      )}

      {/* Results Grid */}
      {results.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">
            {results.length} results
          </Label>
          <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto p-1">
            {results.map((result) => (
              <button
                key={result.id}
                onClick={() => onSelect(result)}
                className="relative aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-primary transition-all hover:scale-105 bg-muted"
              >
                <img
                  src={result.preview || result.url}
                  alt={result.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {hasSearched && results.length === 0 && !isLoading && (
        <div className="text-center py-8 text-muted-foreground">
          <Smile size={48} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">No {type} found. Try a different search!</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      )}
    </div>
  );
};
