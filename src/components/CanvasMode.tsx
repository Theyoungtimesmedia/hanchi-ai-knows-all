import { useEffect, useMemo, useState } from "react";
import { Check, Code, Copy, Download, Eye, FileText, X } from "lucide-react";
import { Button } from "./ui/button";
import { MarkdownMessage } from "./MarkdownMessage";
import { useToast } from "@/hooks/use-toast";
import { artifactExtension, downloadArtifact, safeArtifactFilename } from "@/lib/artifacts";

interface CanvasModeProps {
  content: string;
  type: "code" | "document";
  title: string;
  language: string;
  onClose: () => void;
  onUpdate: (newContent: string) => void;
}

export const CanvasMode = ({ content, type, title, language, onClose, onUpdate }: CanvasModeProps) => {
  const [editableContent, setEditableContent] = useState(content);
  const [view, setView] = useState<"source" | "preview">("source");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setEditableContent(content);
    setView("source");
  }, [content, language]);

  const extension = artifactExtension(language, type);
  const filename = safeArtifactFilename(title, extension);
  const canPreview = type === "document" || language.toLowerCase() === "html" || language.toLowerCase() === "htm";
  const isHtml = language.toLowerCase() === "html" || language.toLowerCase() === "htm";
  const previewDocument = useMemo(() => {
    if (!isHtml) return "";
    const hasDocument = /<!doctype\s+html|<html[\s>]/i.test(editableContent);
    return hasDocument ? editableContent : `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>${editableContent}</body></html>`;
  }, [editableContent, isHtml]);

  const updateContent = (value: string) => {
    setEditableContent(value);
    onUpdate(value);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editableContent);
      setCopied(true);
      toast({ title: "Copied to clipboard" });
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast({ title: "Could not copy file", variant: "destructive" });
    }
  };

  const handleDownload = () => {
    downloadArtifact(editableContent, filename, extension);
    toast({ title: "File downloaded", description: filename });
  };

  return (
    <aside className="fixed inset-0 z-50 flex min-w-0 flex-col border-l border-border bg-background lg:relative lg:inset-auto lg:z-10 lg:h-screen lg:w-[42%] lg:max-w-[620px] lg:min-w-[360px] lg:flex-shrink-0">
      <header className="flex h-12 flex-shrink-0 items-center justify-between gap-3 border-b border-border/50 px-3 md:px-4">
        <div className="flex min-w-0 items-center gap-2">
          {type === "code" ? <Code size={15} className="flex-shrink-0 text-primary" /> : <FileText size={15} className="flex-shrink-0 text-primary" />}
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold">{title}</h2>
            <p className="truncate text-[10px] uppercase text-muted-foreground">{language} · {filename}</p>
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy} aria-label="Copy file" title="Copy file">
            {copied ? <Check size={15} /> : <Copy size={15} />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDownload} aria-label="Download file" title="Download file">
            <Download size={15} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose} aria-label="Close Canvas" title="Close Canvas">
            <X size={16} />
          </Button>
        </div>
      </header>

      <div className="flex h-10 flex-shrink-0 items-center gap-1 border-b border-border/40 px-3">
        <Button variant={view === "source" ? "secondary" : "ghost"} size="sm" className="h-7 gap-1.5 px-2.5 text-xs" onClick={() => setView("source")}>
          <Code size={13} /> Source
        </Button>
        <Button variant={view === "preview" ? "secondary" : "ghost"} size="sm" className="h-7 gap-1.5 px-2.5 text-xs" onClick={() => setView("preview")} disabled={!canPreview} title={!canPreview ? "Preview is available for HTML and Markdown files" : undefined}>
          <Eye size={13} /> Preview
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {view === "source" ? (
          <textarea
            aria-label="Edit file content"
            value={editableContent}
            onChange={(event) => updateContent(event.target.value)}
            className="h-full min-h-0 w-full resize-none border-0 bg-background p-4 font-mono text-[13px] leading-6 text-foreground outline-none focus:ring-0"
            spellCheck={type !== "code"}
          />
        ) : isHtml ? (
          <iframe
            title={`${title} preview`}
            srcDoc={previewDocument}
            sandbox=""
            referrerPolicy="no-referrer"
            className="h-full w-full border-0 bg-background"
          />
        ) : (
          <div className="h-full overflow-y-auto px-5 py-4">
            <article className="mx-auto max-w-2xl text-sm leading-7">
              <MarkdownMessage content={editableContent} allowRawHtml={false} />
            </article>
          </div>
        )}
      </div>
    </aside>
  );
};