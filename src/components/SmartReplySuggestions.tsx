import { Button } from "./ui/button";

interface SmartReplySuggestionsProps {
  lastMessage: string;
  messageType: 'code' | 'text' | 'list' | 'table' | 'explanation';
  onSuggestionClick: (suggestion: string) => void;
}

export const SmartReplySuggestions = ({
  lastMessage,
  messageType,
  onSuggestionClick,
}: SmartReplySuggestionsProps) => {
  const getSuggestions = (): string[] => {
    switch (messageType) {
      case 'code':
        return [
          "Explain this code step by step",
          "Add comments to make it clearer",
          "Show me how to use this",
          "Can you simplify this?"
        ];
      case 'list':
        return [
          "Give me more details on the first option",
          "Which one do you recommend?",
          "Explain the differences",
          "Give practical examples"
        ];
      case 'explanation':
        return [
          "Give me a simple example",
          "Make it shorter abeg",
          "Tell me more",
          "Explain in Pidgin"
        ];
      case 'table':
        return [
          "Which option is best for me?",
          "Explain the pros and cons",
          "Give more details",
          "Compare in simple terms"
        ];
      default:
        return [
          "Tell me more about this",
          "Make it shorter",
          "Give me an example",
          "Explain it differently"
        ];
    }
  };

  const suggestions = getSuggestions().slice(0, 4);

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
        <span>👃</span>
        <span>Nose deeper:</span>
      </div>
      {suggestions.map((suggestion, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          className="text-xs h-7 rounded-full hover:bg-accent transition-all"
          onClick={() => onSuggestionClick(suggestion)}
        >
          {suggestion}
        </Button>
      ))}
    </div>
  );
};
