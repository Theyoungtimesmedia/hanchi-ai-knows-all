import { useState, useMemo } from "react";
import { 
  MessageSquare, Settings, LogOut, X, Plus, User, Search, Trash2, Pin, 
  BookOpen, HelpCircle, Folder, Bot, Palette, FolderHeart,
  Compass, Sparkles, Image as ImageIcon, Wand2, Mic, FileDown, Shield,
  ChevronDown, ChevronRight, Box, Brain
} from "lucide-react";
import { HanchiStar } from "./HanchiStar";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Input } from "./ui/input";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  title: string;
  updated_at: string | null;
  pinned?: boolean | null;
}

interface AppSidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onPinConversation?: (id: string, pinned: boolean) => void;
  onOpenSettings: () => void;
  onSignOut: () => void;
  onClose: () => void;
  isOpen: boolean;
  onOpenImageGen?: () => void;
  onOpenVoiceTranslation?: () => void;
  onExportChat?: () => void;
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
  onPinConversation,
  onOpenSettings,
  onSignOut,
  onClose,
  isOpen,
  onOpenImageGen,
  onOpenVoiceTranslation,
  onExportChat,
  user,
}: AppSidebarProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const userAvatar = user?.user_metadata?.avatar_url;

  useState(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabase.rpc("is_admin", { _user_id: session.user.id }).then(({ data }) => {
          setIsAdmin(!!data);
        });
      }
    });
  });

  const handleViewProfile = () => {
    navigate("/profile");
    onClose();
  };

  const handlePin = (id: string, currentlyPinned: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    onPinConversation?.(id, !currentlyPinned);
  };

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    return conversations.filter(conv => 
      conv.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  const { pinnedConversations, regularConversations } = useMemo(() => {
    const pinned = filteredConversations.filter(c => c.pinned);
    const regular = filteredConversations.filter(c => !c.pinned);
    return { pinnedConversations: pinned, regularConversations: regular };
  }, [filteredConversations]);

  const groupedConversations = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today); lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today); lastMonth.setDate(lastMonth.getDate() - 30);

    const groups: { label: string; conversations: Conversation[] }[] = [
      { label: 'Today', conversations: [] },
      { label: 'Yesterday', conversations: [] },
      { label: 'Previous 7 Days', conversations: [] },
      { label: 'Previous 30 Days', conversations: [] },
      { label: 'Older', conversations: [] },
    ];

    regularConversations.forEach(conv => {
      const date = conv.updated_at ? new Date(conv.updated_at) : new Date();
      date.setHours(0, 0, 0, 0);
      if (date >= today) groups[0].conversations.push(conv);
      else if (date >= yesterday) groups[1].conversations.push(conv);
      else if (date >= lastWeek) groups[2].conversations.push(conv);
      else if (date >= lastMonth) groups[3].conversations.push(conv);
      else groups[4].conversations.push(conv);
    });

    return groups.filter(group => group.conversations.length > 0);
  }, [regularConversations]);

  const ConversationItem = ({ conv, isPinned }: { conv: Conversation; isPinned: boolean }) => (
    <div
      className={cn(
        "group flex items-center gap-2.5 w-full text-left p-3 rounded-xl transition-all duration-200 cursor-pointer",
        currentConversationId === conv.id
          ? 'bg-primary/10 text-primary border border-primary/20'
          : 'hover:bg-muted text-foreground border border-transparent'
      )}
      onClick={() => onSelectConversation(conv.id)}
    >
      <MessageSquare size={16} className={
        currentConversationId === conv.id ? 'text-primary flex-shrink-0' : 'text-muted-foreground flex-shrink-0'
      } />
      <span className="text-sm font-medium truncate flex-1">{conv.title}</span>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon"
          className={cn("h-7 w-7 rounded-lg", isPinned && 'opacity-100')}
          onClick={(e) => handlePin(conv.id, isPinned, e)}>
          <Pin size={14} className={isPinned ? "text-primary fill-primary" : "text-muted-foreground"} />
        </Button>
        <Button variant="ghost" size="icon"
          className="h-7 w-7 rounded-lg hover:bg-destructive/10"
          onClick={(e) => { e.stopPropagation(); onDeleteConversation(conv.id); }}>
          <Trash2 size={14} className="text-destructive" />
        </Button>
      </div>
    </div>
  );

  const exploreItems = [
    { icon: <Compass size={16} />, label: "Discover", path: "/discover", color: "text-sky-500" },
    { icon: <BookOpen size={16} />, label: "Prompts", path: "/prompts", color: "text-amber-500" },
    { icon: <Box size={16} />, label: "Artifacts", path: "/artifacts", color: "text-accent-warm" },
    { icon: <Folder size={16} />, label: "Projects", path: "/projects", color: "text-indigo-500" },
    { icon: <Palette size={16} />, label: "Stickers", path: "/sticker-studio", color: "text-pink-500" },
    { icon: <FolderHeart size={16} />, label: "Collections", path: "/collections", color: "text-violet-500" },
    { icon: <Bot size={16} />, label: "Custom GPT", path: "/custom-gpt", color: "text-emerald-500" },
    { icon: <Brain size={16} />, label: "Memories", path: "/memories", color: "text-rose-500" },
  ];

  const toolItems = [
    { icon: <Wand2 size={16} />, label: "Create Image", onClick: onOpenImageGen, color: "text-purple-500" },
    { icon: <Mic size={16} />, label: "Translate", onClick: onOpenVoiceTranslation, color: "text-blue-500" },
    { icon: <FileDown size={16} />, label: "Export", onClick: onExportChat, color: "text-orange-500" },
  ];

  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-50 w-72 bg-card transform transition-transform duration-300 ease-out",
      isOpen ? 'translate-x-0' : '-translate-x-full',
      "md:relative md:translate-x-0 flex flex-col border-r border-border/50 shadow-xl md:shadow-none"
    )}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <HanchiStar size={18} className="text-primary" />
          </div>
          <div>
            <span className="font-serif-display text-lg font-semibold text-foreground leading-none">Hanchi</span>
            <p className="text-[10px] text-muted-foreground mt-0.5">No suffer mode</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden h-8 w-8 rounded-lg">
          <X size={18} />
        </Button>
      </div>

      {/* New Chat */}
      <div className="px-3 py-3">
        <Button onClick={onNewConversation}
          className="w-full rounded-xl flex items-center justify-center gap-2 h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5">
          <Plus size={18} /> New Chat
        </Button>
      </div>

      {/* Collapsible Explore & Tools - Horizontal at top */}
      <div className="px-3 pb-2 space-y-1">
        {/* Explore Toggle */}
        <button 
          onClick={() => setExploreOpen(!exploreOpen)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Compass size={16} className="text-primary" />
            <span>Explore</span>
          </div>
          {exploreOpen ? <ChevronDown size={14} className="text-muted-foreground" /> : <ChevronRight size={14} className="text-muted-foreground" />}
        </button>
        {exploreOpen && (
          <div className="grid grid-cols-3 gap-1.5 px-1 pb-1">
            {exploreItems.map((item) => (
              <button
                key={item.label}
                onClick={() => { navigate(item.path); onClose(); }}
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl hover:bg-muted/70 transition-colors group"
              >
                <div className={cn("w-9 h-9 rounded-xl bg-muted flex items-center justify-center group-hover:scale-105 transition-transform", item.color)}>
                  {item.icon}
                </div>
                <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground">{item.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Tools Toggle */}
        <button 
          onClick={() => setToolsOpen(!toolsOpen)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-primary" />
            <span>Tools</span>
          </div>
          {toolsOpen ? <ChevronDown size={14} className="text-muted-foreground" /> : <ChevronRight size={14} className="text-muted-foreground" />}
        </button>
        {toolsOpen && (
          <div className="grid grid-cols-3 gap-1.5 px-1 pb-1">
            {toolItems.map((item) => (
              <button
                key={item.label}
                onClick={() => { item.onClick?.(); onClose(); }}
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl hover:bg-muted/70 transition-colors group"
              >
                <div className={cn("w-9 h-9 rounded-xl bg-muted flex items-center justify-center group-hover:scale-105 transition-transform", item.color)}>
                  {item.icon}
                </div>
                <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground">{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search conversations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 text-sm rounded-xl bg-muted/50 border-border/50 focus:border-primary/50" />
        </div>
      </div>

      <ScrollArea className="flex-1 px-2">
        {/* Pinned */}
        {pinnedConversations.length > 0 && (
          <div className="mb-3">
            <div className="text-[10px] font-semibold text-primary uppercase tracking-wider px-2 py-1.5 flex items-center gap-1.5">
              <Pin size={10} className="fill-primary" /> Pinned
            </div>
            <div className="space-y-1">
              {pinnedConversations.map((conv) => (
                <ConversationItem key={conv.id} conv={conv} isPinned={true} />
              ))}
            </div>
          </div>
        )}

        {/* Conversations */}
        {groupedConversations.length > 0 ? (
          groupedConversations.map((group, i) => (
            <div key={i} className="mb-3">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                {group.label}
              </div>
              <div className="space-y-1">
                {group.conversations.map((conv) => (
                  <ConversationItem key={conv.id} conv={conv} isPinned={false} />
                ))}
              </div>
            </div>
          ))
        ) : pinnedConversations.length === 0 && (
          <div className="text-center py-12 px-4">
            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
              <MessageSquare size={20} className="text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Start a new chat above</p>
          </div>
        )}
      </ScrollArea>

      {/* User Section */}
      <div className="p-3 border-t border-border/50 bg-muted/30">
        <button onClick={handleViewProfile}
          className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-card transition-colors cursor-pointer border border-transparent hover:border-border/50">
          {userAvatar ? (
            <img src={userAvatar} alt="Profile" className="w-10 h-10 rounded-full" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0 text-left">
            <div className="text-sm font-semibold text-foreground truncate">{userName}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <User size={10} /> View Profile
            </div>
          </div>
        </button>
        
        <div className="flex items-center gap-2 mt-3">
          <ThemeToggle />
          <Button variant="outline" size="sm" onClick={onOpenSettings}
            className="flex-1 rounded-xl flex items-center justify-center gap-1.5 h-9 text-xs border-border/50">
            <Settings size={14} /> Settings
          </Button>
          <Button variant="outline" size="sm" onClick={onSignOut}
            className="flex-1 rounded-xl flex items-center justify-center gap-1.5 text-destructive hover:bg-destructive/10 hover:border-destructive/30 h-9 text-xs border-border/50">
            <LogOut size={14} /> Logout
          </Button>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <Button variant="ghost" size="sm" onClick={() => { navigate("/help"); onClose(); }}
            className="flex-1 rounded-xl flex items-center justify-center gap-1.5 h-9 text-xs text-muted-foreground hover:text-foreground">
            <HelpCircle size={14} /> Help
          </Button>
          {isAdmin && (
            <Button variant="ghost" size="sm" onClick={() => { navigate("/admin"); onClose(); }}
              className="flex-1 rounded-xl flex items-center justify-center gap-1.5 h-9 text-xs text-muted-foreground hover:text-primary">
              <Shield size={14} /> Admin
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
