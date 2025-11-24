export const TypingIndicator = () => {
  return (
    <div className="flex gap-2 items-center p-4 bg-muted/30 rounded-2xl w-fit">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
      </div>
      <span className="text-xs text-muted-foreground">Nosing out answers...</span>
    </div>
  );
};
