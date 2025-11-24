import { ExternalLink, Copy, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  favicon?: string;
  category?: string;
}

interface SearchResultsProps {
  results: SearchResult[];
}

export const SearchResults = ({ results }: SearchResultsProps) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!results || results.length === 0) return null;

  const copyLink = async (url: string, index: number) => {
    await navigator.clipboard.writeText(url);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="text-primary">👃🏿</span>
          Sources Found ({results.length})
        </p>
      </div>
      <div className="space-y-2">
        {results.map((result, index) => (
          <Card key={index} className="bg-card border-border hover:border-primary/50 transition-all duration-200 group">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 min-w-0"
                    >
                      <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {result.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />
                        {getDomain(result.url)}
                      </p>
                    </a>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0 h-8 w-8"
                      onClick={() => copyLink(result.url, index)}
                    >
                      {copiedIndex === index ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {result.snippet}
                  </p>
                  {result.category && (
                    <Badge variant="secondary" className="text-xs">
                      {result.category}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
