import { ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Source {
  title: string;
  url?: string;
  snippet?: string;
  timestamp?: string;
}

interface SourcesDisplayProps {
  sources: Source[];
}

export const SourcesDisplay = ({ sources }: SourcesDisplayProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!sources || sources.length === 0) return null;

  const displayedSources = isExpanded ? sources : sources.slice(0, 3);

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="font-medium">Sources ({sources.length})</span>
      </div>
      <div className="space-y-2">
        {displayedSources.map((source, index) => (
          <div
            key={index}
            className="flex items-start gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0 text-primary" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-primary hover:underline truncate"
                >
                  {source.title}
                </a>
                {source.timestamp && (
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {new Date(source.timestamp).toLocaleDateString()}
                  </span>
                )}
              </div>
              {source.snippet && (
                <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">
                  {source.snippet}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      {sources.length > 3 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-7 text-xs w-full"
        >
          {isExpanded ? (
            <>
              Show less <ChevronUp className="w-3 h-3 ml-1" />
            </>
          ) : (
            <>
              Show {sources.length - 3} more <ChevronDown className="w-3 h-3 ml-1" />
            </>
          )}
        </Button>
      )}
    </div>
  );
};