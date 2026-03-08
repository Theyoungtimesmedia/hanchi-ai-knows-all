import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Plus, Folder, Trash2, Loader2, MessageSquare, Image as ImageIcon, BookOpen
} from "lucide-react";
import { motion } from "framer-motion";

interface Collection {
  id: string;
  name: string;
  description: string | null;
  created_at: string | null;
  item_count?: number;
}

interface CollectionItem {
  id: string;
  item_type: string;
  item_id: string;
  item_content: string | null;
  item_metadata: any;
  created_at: string | null;
}

export default function Collections() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  useEffect(() => { loadCollections(); }, []);

  const loadCollections = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from("collections")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (data) setCollections(data);
    setIsLoading(false);
  };

  const loadItems = async (collectionId: string) => {
    const { data } = await supabase
      .from("collection_items")
      .select("*")
      .eq("collection_id", collectionId)
      .order("created_at", { ascending: false });

    if (data) setItems(data);
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from("collections").insert({
      user_id: session.user.id,
      name: newName.trim(),
      description: newDesc.trim() || null,
    });

    if (!error) {
      toast({ title: "Collection created! 📁" });
      setShowCreateDialog(false);
      setNewName("");
      setNewDesc("");
      loadCollections();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("collections").delete().eq("id", id);
    if (!error) {
      setCollections(prev => prev.filter(c => c.id !== id));
      if (selectedCollection?.id === id) {
        setSelectedCollection(null);
        setItems([]);
      }
      toast({ title: "Collection deleted" });
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    const { error } = await supabase.from("collection_items").delete().eq("id", itemId);
    if (!error) {
      setItems(prev => prev.filter(i => i.id !== itemId));
    }
  };

  const handleSelectCollection = (col: Collection) => {
    setSelectedCollection(col);
    loadItems(col.id);
  };

  const itemIcon = (type: string) => {
    switch (type) {
      case "message": return <MessageSquare size={14} />;
      case "image": return <ImageIcon size={14} />;
      case "prompt": return <BookOpen size={14} />;
      default: return <Folder size={14} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl border-b border-border py-3 px-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/chat")} className="rounded-xl">
            <ArrowLeft size={18} />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Folder size={18} className="text-primary" /> Collections
            </h1>
            <p className="text-xs text-muted-foreground">Save messages, images & prompts</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} size="sm" className="rounded-xl gap-1.5">
            <Plus size={14} /> New
          </Button>
        </div>
      </header>

      <div className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-6">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={24} className="animate-spin text-primary" />
          </div>
        ) : selectedCollection ? (
          <div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedCollection(null)} className="mb-4 rounded-xl gap-1.5">
              <ArrowLeft size={14} /> Back to collections
            </Button>
            <h2 className="text-lg font-bold mb-1">{selectedCollection.name}</h2>
            {selectedCollection.description && (
              <p className="text-sm text-muted-foreground mb-4">{selectedCollection.description}</p>
            )}

            {items.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Folder size={40} className="mx-auto mb-3 opacity-30" />
                <p>This collection is empty</p>
                <p className="text-xs mt-1">Save messages or images from chat to add items</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/50 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      {itemIcon(item.item_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-muted-foreground uppercase font-medium">{item.item_type}</span>
                      <p className="text-sm mt-1 line-clamp-3">{item.item_content || item.item_id}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <Trash2 size={14} className="text-destructive" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {collections.length === 0 ? (
              <div className="text-center py-16">
                <Folder size={48} className="text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No collections yet</p>
                <Button onClick={() => setShowCreateDialog(true)} className="mt-4 rounded-xl gap-2">
                  <Plus size={14} /> Create your first collection
                </Button>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {collections.map((col) => (
                  <motion.div
                    key={col.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => handleSelectCollection(col)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Folder size={20} />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10"
                        onClick={(e) => { e.stopPropagation(); handleDelete(col.id); }}
                      >
                        <Trash2 size={14} className="text-destructive" />
                      </Button>
                    </div>
                    <h3 className="font-semibold mt-3">{col.name}</h3>
                    {col.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{col.description}</p>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>New Collection</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Collection name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="rounded-xl"
            />
            <Input
              placeholder="Description (optional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <DialogFooter>
            <Button onClick={handleCreate} disabled={!newName.trim()} className="rounded-xl gap-2">
              <Plus size={14} /> Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
