import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';

interface MarkdownMessageProps {
  content: string;
}

export const MarkdownMessage = ({ content }: MarkdownMessageProps) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || '');
          const [copied, setCopied] = useState(false);
          
          const handleCopy = async () => {
            await navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          };

          return !inline && match ? (
            <div className="relative group my-4">
              <div className="flex items-center justify-between bg-muted px-4 py-2 rounded-t-lg border border-border">
                <span className="text-xs font-medium text-muted-foreground uppercase">
                  {match[1]}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>
              <SyntaxHighlighter
                style={oneDark}
                language={match[1]}
                PreTag="div"
                className="!mt-0 !rounded-t-none"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            </div>
          ) : (
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
              {children}
            </code>
          );
        },
        table({ children }) {
          return (
            <div className="my-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-border border border-border rounded-lg">
                {children}
              </table>
            </div>
          );
        },
        thead({ children }) {
          return <thead className="bg-muted">{children}</thead>;
        },
        th({ children }) {
          return (
            <th className="px-4 py-2 text-left text-sm font-semibold">
              {children}
            </th>
          );
        },
        td({ children }) {
          return (
            <td className="px-4 py-2 text-sm border-t border-border">
              {children}
            </td>
          );
        },
        ul({ children }) {
          return <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>;
        },
        ol({ children }) {
          return <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>;
        },
        blockquote({ children }) {
          return (
            <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">
              {children}
            </blockquote>
          );
        },
        a({ href, children }) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {children}
            </a>
          );
        },
        h1({ children }) {
          return <h1 className="text-2xl font-bold mt-6 mb-4">{children}</h1>;
        },
        h2({ children }) {
          return <h2 className="text-xl font-bold mt-5 mb-3">{children}</h2>;
        },
        h3({ children }) {
          return <h3 className="text-lg font-semibold mt-4 mb-2">{children}</h3>;
        },
        p({ children }) {
          return <p className="leading-relaxed my-2">{children}</p>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
};
