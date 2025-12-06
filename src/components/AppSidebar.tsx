import { useState, useMemo } from "react";
import { MessageSquare, Settings, LogOut, X, Plus, User, Search, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Input } from "./ui/input";
import { useNavigate } from "react-router-dom";

interface Conversation {
  id: string;
  title: string;
  updated_at: string | null;
}

interface AppSidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onOpenSettings: () => void;
  onSignOut: () => void;
  onClose: () => void;
  isOpen: boolean;
  user?: {
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  } | null;
}

export const AppSidebar = ({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onOpenSettings,
  onSignOut,
  onClose,
  isOpen,
  user,
}: AppSidebarProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const userAvatar = user?.user_metadata?.avatar_url;

  const handleViewProfile = () => {
    navigate("/profile");
    onClose();
  };

  // Filter conversations by search query
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    return conversations.filter(conv => 
      conv.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  // Group conversations by date
  const groupedConversations = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setDate(lastMonth.getDate() - 30);

    const groups: { label: string; conversations: Conversation[] }[] = [
      { label: 'Today', conversations: [] },
      { label: 'Yesterday', conversations: [] },
      { label: 'Previous 7 Days', conversations: [] },
      { label: 'Previous 30 Days', conversations: [] },
      { label: 'Older', conversations: [] },
    ];

    filteredConversations.forEach(conv => {
      const date = conv.updated_at ? new Date(conv.updated_at) : new Date();
      date.setHours(0, 0, 0, 0);

      if (date >= today) {
        groups[0].conversations.push(conv);
      } else if (date >= yesterday) {
        groups[1].conversations.push(conv);
      } else if (date >= lastWeek) {
        groups[2].conversations.push(conv);
      } else if (date >= lastMonth) {
        groups[3].conversations.push(conv);
      } else {
        groups[4].conversations.push(conv);
      }
    });

    return groups.filter(group => group.conversations.length > 0);
  }, [filteredConversations]);

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-card shadow-xl transform transition-transform duration-300 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    } md:relative md:translate-x-0 flex flex-col border-r border-border/50`}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-border/50">
        <div className="flex items-center gap-2 font-bold text-lg text-foreground">
          <span className="text-xl">👃🏿</span>
          Hanchi AI
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="md:hidden h-8 w-8"
        >
          <X size={18} />
        </Button>
      </div>

      {/* New Chat Button */}
      <div className="px-3 py-3">
        <Button
          onClick={onNewConversation}
          className="w-full rounded-xl flex items-center justify-center gap-2 h-10"
        >
          <Plus size={16} /> New Chat
        </Button>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm rounded-lg bg-muted/50 border-0"
          />
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1 px-2">
        {groupedConversations.length > 0 ? (
          groupedConversations.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-4">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1">
                {group.label}
              </div>
              <div className="space-y-0.5">
                {group.conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`group flex items-center gap-2 w-full text-left p-2.5 rounded-lg transition-colors cursor-pointer ${
                      currentConversationId === conv.id
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => onSelectConversation(conv.id)}
                  >
                    <MessageSquare size={14} className={
                      currentConversationId === conv.id ? 'text-primary flex-shrink-0' : 'text-muted-foreground group-hover:text-primary flex-shrink-0'
                    } />
                    <span className="text-sm font-medium truncate flex-1">
                      {conv.title}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(conv.id);
                      }}
                    >
                      <Trash2 size={12} className="text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8 px-4">
            {searchQuery ? 'No conversations found' : 'No conversations yet'}
          </p>
        )}
      </ScrollArea>

      {/* User Section */}
      <div className="p-3 border-t border-border/50">
        <button 
          onClick={handleViewProfile}
          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
        >
          {userAvatar ? (
            <img src={userAvatar} alt="Profile" className="w-9 h-9 rounded-full" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0 text-left">
            <div className="text-sm font-medium text-foreground truncate">{userName}</div>
            <div className="text-[10px] text-muted-foreground flex items-center gap-1">
              <User size={10} /> View Profile
            </div>
          </div>
        </button>
        
        <div className="grid grid-cols-2 gap-2 mt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenSettings}
            className="rounded-lg flex items-center justify-center gap-1.5 text-muted-foreground hover:text-foreground h-8 text-xs"
          >
            <Settings size={14} /> Settings
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSignOut}
            className="rounded-lg flex items-center justify-center gap-1.5 text-destructive hover:bg-destructive/10 h-8 text-xs"
          >
            <LogOut size={14} /> Logout
          </Button>
        </div>
      </div>
    </div>
  );
};