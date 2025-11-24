import { MessageSquarePlus, Trash2, Menu, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Conversation } from "@/hooks/useConversationHistory";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ConversationSidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  isLoading: boolean;
}

export const ConversationSidebar = ({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  isLoading,
}: ConversationSidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card border-r border-border">
      <div className="p-4 border-b border-border space-y-3">
        <Button
          onClick={onNewConversation}
          className="w-full bg-gradient-primary hover:opacity-90"
        >
          <MessageSquarePlus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {isLoading ? (
            <p className="text-sm text-muted-foreground p-4">Loading...</p>
          ) : filteredConversations.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4">
              {searchQuery ? "No conversations found" : "No conversations yet"}
            </p>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className={cn(
                  "group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all",
                  currentConversationId === conv.id
                    ? "bg-accent"
                    : "hover:bg-muted"
                )}
                onClick={() => {
                  onSelectConversation(conv.id);
                  setIsOpen(false);
                }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{conv.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(conv.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conv.id);
                  }}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-80 h-full">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      {isOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="lg:hidden fixed inset-y-0 left-0 w-80 z-50">
            <SidebarContent />
          </div>
        </>
      )}
    </>
  );
};
