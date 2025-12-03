import { MessageSquare, Settings, LogOut, Sparkles, X, Plus, User } from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
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
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const userAvatar = user?.user_metadata?.avatar_url;

  const handleViewProfile = () => {
    navigate("/profile");
    onClose();
  };

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-card shadow-xl transform transition-transform duration-300 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    } md:relative md:translate-x-0 flex flex-col`}>
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2 font-bold text-xl text-foreground">
          <span className="text-2xl">👃🏿</span>
          Hanchi AI
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="md:hidden"
        >
          <X size={20} />
        </Button>
      </div>

      {/* New Chat Button */}
      <div className="px-4 py-4">
        <Button
          onClick={onNewConversation}
          variant="secondary"
          className="w-full rounded-2xl flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary"
        >
          <Plus size={18} /> New Chat
        </Button>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1 px-4">
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2">
          Recent
        </div>
        <div className="space-y-1">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={`w-full text-left p-3 rounded-xl transition-colors flex items-center gap-3 group ${
                currentConversationId === conv.id
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <MessageSquare size={16} className={
                currentConversationId === conv.id ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
              } />
              <span className="text-sm font-medium truncate flex-1">
                {conv.title}
              </span>
            </button>
          ))}
          
          {conversations.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No conversations yet
            </p>
          )}
        </div>
      </ScrollArea>

      {/* User Section */}
      <div className="p-4 border-t border-border">
        <button 
          onClick={handleViewProfile}
          className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-colors cursor-pointer"
        >
          {userAvatar ? (
            <img src={userAvatar} alt="Profile" className="w-10 h-10 rounded-full" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0 text-left">
            <div className="text-sm font-bold text-foreground truncate">{userName}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <User size={10} /> View Profile
            </div>
          </div>
        </button>
        
        <div className="grid grid-cols-2 gap-2 mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenSettings}
            className="rounded-xl flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <Settings size={16} /> Settings
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSignOut}
            className="rounded-xl flex items-center justify-center gap-2 text-destructive hover:bg-destructive/10"
          >
            <LogOut size={16} /> Logout
          </Button>
        </div>
      </div>
    </div>
  );
};
