import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, Image as ImageIcon, Download, Eye, Trash2, Search, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { HanchiStar } from "@/components/HanchiStar";
import { cn } from "@/lib/utils";

interface Artifact {
  id: string;
  kind: "document" | "image" | "code";
  title: string;
  subtitle: string;
  preview?: string | null;
  url?: string | null;
  content?: string | null;
  createdAt: string;
}

export default function Artifacts() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Artifact | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate("/auth"); return; }

      const [docsRes, imagesRes] = await Promise.all([
        supabase.from("uploaded_documents").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(100),
        supabase.from("generated_images").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(100),
      ]);

      const merged: Artifact[] = [];
      (docsRes.data || []).forEach((d) => {
        const ext = (d.file_name?.split(".").pop() || d.file_type || "TXT").toUpperCase();
        merged.push({
          id: d.id,
          kind: ext === "PDF" ? "document" : "code",
          title: d.file_name || "Untitled",
          subtitle: ext === "PDF" ? "Document · PDF" : ext,
          content: d.extracted_text || d.summary || null,
          url: d.file_url || null,
          createdAt: d.created_at || new Date().toISOString(),
        });
      });
      (imagesRes.data || []).forEach((img) => {
        merged.push({
          id: img.id,
          kind: "image",
          title: img.prompt?.slice(0, 50) || "Generated image",
          subtitle: img.style ? `Image · ${img.style}` : "Image",
          preview: img.image_url || (img.image_base64 ? `data:image/png;base64,${img.image_base64}` : null),
          url: img.image_url || null,
          createdAt: img.created_at || new Date().toISOString(),
        });
      });
      merged.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
      setArtifacts(merged);
      setLoading(false);
    })();
  }, [navigate]);

  const filtered = artifacts.filter((a) => a.title.toLowerCase().includes(search.toLowerCase()));

  const handleDownload = (a: Artifact) => {
    if (a.url) {
      window.open(a.url, "_blank");
      return;
    }
    if (a.content) {
      const blob = new Blob([a.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = a.title.endsWith(".txt") ? a.title : `${a.title}.txt`;
      link.click();
      URL.revokeObjectURL(url);
      return;
    }
    toast({ title: "Nothing to download yet", description: "This artifact has no downloadable content." });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
      className="min-h-screen bg-background flex flex-col"
    >
      <header className="h-14 px-4 flex items-center justify-between border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full h-9 w-9">
          <ArrowLeft size={18} />
        </Button>
        <div className="font-serif-display text-lg flex items-center gap-1.5">
          Artifacts <span className="text-muted-foreground text-sm">Hanchi</span>
        </div>
        <HanchiStar size={22} animated={false} className="text-accent-warm" />
      </header>

      <div className="px-4 py-4 max-w-3xl mx-auto w-full">
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search artifacts"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11 rounded-2xl bg-card border-border/60"
          />
        </div>

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => <div key={i} className="h-20 rounded-2xl bg-muted/40 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <HanchiStar size={36} className="mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">No artifacts yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Files you upload and images you generate will appear here.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelected(a)}
                className={cn(
                  "w-full text-left bg-card hover:bg-accent/40 border border-border/60 rounded-2xl p-3.5 flex items-center gap-3 transition-all"
                )}
              >
                <div className="bg-background border border-border/60 rounded-xl w-12 h-12 flex items-center justify-center flex-shrink-0">
                  {a.kind === "image" && a.preview ? (
                    <img src={a.preview} alt="" className="w-full h-full object-cover rounded-xl" />
                  ) : a.kind === "image" ? (
                    <ImageIcon size={18} className="text-muted-foreground" />
                  ) : a.kind === "code" ? (
                    <FileCode size={18} className="text-muted-foreground" />
                  ) : (
                    <FileText size={18} className="text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{a.title}</div>
                  <div className="text-xs text-muted-foreground">{a.subtitle}</div>
                </div>
                <div className="flex items-center gap-1 opacity-60">
                  <Eye size={14} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-serif-display flex items-center gap-2">
              {selected?.kind === "image" ? <ImageIcon size={18} /> : <FileText size={18} />}
              {selected?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-1">
            {selected?.kind === "image" && selected.preview ? (
              <img src={selected.preview} alt={selected.title} className="w-full rounded-2xl" />
            ) : selected?.content ? (
              <pre className="whitespace-pre-wrap text-sm bg-muted/40 p-4 rounded-2xl border border-border/40 font-mono leading-relaxed">
                {selected.content}
              </pre>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">No preview available — try downloading instead.</p>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
            <Button variant="outline" onClick={() => setSelected(null)} className="rounded-full">Close</Button>
            <Button onClick={() => selected && handleDownload(selected)} className="rounded-full gap-2">
              <Download size={14} /> Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
