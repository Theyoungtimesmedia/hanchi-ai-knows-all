import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Shield, Users, Bell, Settings, Loader2, Trash2, Ban, Flag, Plus, AlertTriangle, BarChart3, Megaphone
} from "lucide-react";
import { motion } from "framer-motion";

interface Announcement {
  id: string;
  title: string;
  content: string;
  is_active: boolean | null;
  created_at: string | null;
}

export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
  const [flaggedUsers, setFlaggedUsers] = useState<any[]>([]);
  const [showAnnouncementDialog, setShowAnnouncementDialog] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [stats, setStats] = useState({ conversations: 0, messages: 0, images: 0 });

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/auth"); return; }

    const { data } = await supabase.rpc("is_admin", { _user_id: session.user.id });
    if (!data) { navigate("/chat"); return; }
    setIsAdmin(true);
    loadData();
  };

  const loadData = async () => {
    const [annRes, blockedRes, flaggedRes, convRes, msgRes, imgRes] = await Promise.all([
      supabase.from("announcements").select("*").order("created_at", { ascending: false }),
      supabase.from("blocked_users").select("*").order("created_at", { ascending: false }),
      supabase.from("flagged_users").select("*").order("created_at", { ascending: false }),
      supabase.from("conversations").select("id", { count: "exact", head: true }),
      supabase.from("messages").select("id", { count: "exact", head: true }),
      supabase.from("generated_images").select("id", { count: "exact", head: true }),
    ]);

    if (annRes.data) setAnnouncements(annRes.data);
    if (blockedRes.data) setBlockedUsers(blockedRes.data);
    if (flaggedRes.data) setFlaggedUsers(flaggedRes.data);
    setStats({
      conversations: convRes.count || 0,
      messages: msgRes.count || 0,
      images: imgRes.count || 0,
    });
  };

  const createAnnouncement = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await supabase.from("announcements").insert({
      title: newTitle.trim(),
      content: newContent.trim(),
      created_by: session?.user.id,
    });
    if (!error) {
      toast({ title: "Announcement created" });
      setShowAnnouncementDialog(false);
      setNewTitle("");
      setNewContent("");
      loadData();
    }
  };

  const toggleAnnouncement = async (id: string, active: boolean) => {
    await supabase.from("announcements").update({ is_active: active }).eq("id", id);
    loadData();
  };

  const deleteAnnouncement = async (id: string) => {
    await supabase.from("announcements").delete().eq("id", id);
    loadData();
  };

  const unblockUser = async (id: string) => {
    await supabase.from("blocked_users").delete().eq("id", id);
    loadData();
  };

  const unflagUser = async (id: string) => {
    await supabase.from("flagged_users").delete().eq("id", id);
    loadData();
  };

  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="animate-spin text-primary" size={24} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl border-b border-border py-3 px-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/chat")} className="rounded-xl">
            <ArrowLeft size={18} />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Shield size={18} className="text-primary" /> Admin Dashboard
            </h1>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Conversations", value: stats.conversations, icon: BarChart3 },
            { label: "Messages", value: stats.messages, icon: Users },
            { label: "Images", value: stats.images, icon: BarChart3 },
          ].map((stat) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-card border border-border/50 text-center">
              <stat.icon size={20} className="mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="announcements" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 h-10 p-1 bg-muted/50 rounded-xl">
            <TabsTrigger value="announcements" className="rounded-lg text-xs gap-1"><Megaphone size={14} /> Announcements</TabsTrigger>
            <TabsTrigger value="moderation" className="rounded-lg text-xs gap-1"><Flag size={14} /> Moderation</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg text-xs gap-1"><Settings size={14} /> App Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="announcements" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Announcements</h2>
              <Button onClick={() => setShowAnnouncementDialog(true)} size="sm" className="rounded-xl gap-1.5">
                <Plus size={14} /> New
              </Button>
            </div>
            {announcements.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Megaphone size={40} className="mx-auto mb-3 opacity-30" />
                <p>No announcements yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {announcements.map((ann) => (
                  <div key={ann.id} className="p-4 rounded-xl bg-card border border-border/50 group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold">{ann.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{ann.content}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={ann.is_active ?? false} onCheckedChange={(v) => toggleAnnouncement(ann.id, v)} />
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteAnnouncement(ann.id)}>
                          <Trash2 size={14} className="text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="moderation" className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><Ban size={16} /> Blocked Users</h2>
              {blockedUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No blocked users</p>
              ) : (
                <div className="space-y-2">
                  {blockedUsers.map((u) => (
                    <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/50">
                      <div>
                        <p className="text-sm font-medium">{u.user_id}</p>
                        <p className="text-xs text-muted-foreground">{u.reason || "No reason"}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => unblockUser(u.id)} className="rounded-xl text-xs">Unblock</Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><Flag size={16} /> Flagged Users</h2>
              {flaggedUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No flagged users</p>
              ) : (
                <div className="space-y-2">
                  {flaggedUsers.map((u) => (
                    <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/50">
                      <div>
                        <p className="text-sm font-medium">{u.user_id}</p>
                        <p className="text-xs text-muted-foreground">{u.reason || "No reason"}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => unflagUser(u.id)} className="rounded-xl text-xs">Dismiss</Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="p-6 rounded-2xl bg-card border border-border/50 text-center">
              <AlertTriangle size={32} className="mx-auto mb-3 text-amber-500" />
              <h3 className="font-semibold mb-1">App Settings</h3>
              <p className="text-sm text-muted-foreground">Maintenance mode and feature flags coming soon.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showAnnouncementDialog} onOpenChange={setShowAnnouncementDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>New Announcement</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="rounded-xl" />
            <Textarea placeholder="Content" value={newContent} onChange={(e) => setNewContent(e.target.value)} className="rounded-xl" />
          </div>
          <DialogFooter>
            <Button onClick={createAnnouncement} disabled={!newTitle.trim() || !newContent.trim()} className="rounded-xl gap-2">
              <Plus size={14} /> Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
