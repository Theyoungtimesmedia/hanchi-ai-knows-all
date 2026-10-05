import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { CodeBlock } from './CodeBlock';
import type { Components } from 'react-markdown';

interface MarkdownMessageProps {
  content: string;
  onOpenArtifact?: (content: string, language: string) => void;
  allowRawHtml?: boolean;
}

export const MarkdownMessage = ({ content, onOpenArtifact, allowRawHtml = true }: MarkdownMessageProps) => {
  const components: Components = {
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const codeString = String(children).replace(/\n$/, '');

      return match ? (
        <CodeBlock language={match[1]} onOpenArtifact={onOpenArtifact}>{codeString}</CodeBlock>
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
      return <th className="px-4 py-2 text-left text-sm font-semibold">{children}</th>;
    },
    td({ children }) {
      return <td className="px-4 py-2 text-sm border-t border-border">{children}</td>;
    },
    ul({ children }) {
      return <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>;
    },
    ol({ children }) {
      return <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>;
    },
    blockquote({ children }) {
      return <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">{children}</blockquote>;
    },
    a({ href, children }) {
      return <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{children}</a>;
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
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={allowRawHtml ? [rehypeRaw] : []}
      components={components}
    >
      {content}
    </ReactMarkdown>
  );
};
