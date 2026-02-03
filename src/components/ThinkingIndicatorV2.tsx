export const ThinkingIndicatorV2 = () => {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 rounded-2xl border border-border/50 w-fit animate-fade-in">
      <div className="relative">
        <span className="text-xl">👃🏿</span>
        <div className="absolute inset-0 animate-ping opacity-30">
          <span className="text-xl">👃🏿</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-medium text-foreground">Nosing out the answer</span>
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};
