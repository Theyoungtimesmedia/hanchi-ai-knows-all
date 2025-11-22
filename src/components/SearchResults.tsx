import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

interface SearchResultsProps {
  results: SearchResult[];
}

export const SearchResults = ({ results }: SearchResultsProps) => {
  if (!results || results.length === 0) return null;

  return (
    <div className="mt-4 space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Sources:</p>
      <div className="space-y-2">
        {results.map((result, index) => (
          <Card key={index} className="bg-muted/30">
            <CardContent className="p-3">
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 group"
              >
                <ExternalLink className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-1">
                    {result.title}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {result.snippet}
                  </p>
                </div>
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
