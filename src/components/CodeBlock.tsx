import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Download, PanelRightOpen } from 'lucide-react';
import { Button } from './ui/button';
import { artifactExtension, downloadArtifact, safeArtifactFilename } from '@/lib/artifacts';

interface CodeBlockProps {
  language: string;
  children: string;
  onOpenArtifact?: (content: string, language: string) => void;
}

export const CodeBlock = ({ language, children, onOpenArtifact }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const extension = artifactExtension(language, "code");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadArtifact(children, safeArtifactFilename("hanchi-file", extension), extension);
  };

  return (
    <div className="relative group my-4">
      <div className="flex items-center justify-between bg-muted px-4 py-2 rounded-t-lg border border-border">
        <span className="text-xs font-medium text-muted-foreground uppercase">
          {language}
        </span>
        <div className="flex items-center gap-1">
          {onOpenArtifact && <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2" onClick={() => onOpenArtifact(children, language)} aria-label="Open code in Canvas"><PanelRightOpen className="h-3.5 w-3.5" /><span className="text-xs">Open</span></Button>}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleDownload} aria-label={`Download ${extension} file`} title="Download file"><Download className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy} aria-label="Copy code" title="Copy code">{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}</Button>
        </div>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language}
        PreTag="div"
        className="!mt-0 !rounded-t-none"
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
};
