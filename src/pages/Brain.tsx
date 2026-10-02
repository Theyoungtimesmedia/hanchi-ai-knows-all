import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Archive, ArrowLeft, Brain as BrainIcon, FileUp, Search, ShieldCheck, Sparkles, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BRAIN_SEED_RECORDS, ME_PROFILE } from "@/brain/me";
import { classifyImportedChunk, chunkSourceText, CONTEXT_ROT_RULES } from "@/brain/contextRot";
import type { BrainRecord } from "@/brain/types";

type View = "me" | "archive";

export default function Brain() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [records, setRecords] = useState<BrainRecord[]>([]);
  const [view, setView] = useState<View>("me");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [notes, setNotes] = useState("");

  const loadBrain = useCallback(async (id: string) => {
    const { data, error } = await supabase.from("brain_records").select("*").eq("user_id", id).order("updated_at", { ascending: false });
    if (error) throw error;
    if (data && data.length > 0) { setRecords(data as BrainRecord[]); return; }
    const { data: seeded, error: seedError } = await supabase.from("brain_records").insert(BRAIN_SEED_RECORDS.map((record) => ({ ...record, user_id: id, layer: "high_signal" as const }))).select("*");
    if (seedError) throw seedError;
    setRecords((seeded || []) as BrainRecord[]);
  }, []);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate("/auth"); return; }
      setUserId(session.user.id);
      try { await loadBrain(session.user.id); }
      catch (error) { console.error("Brain load failed", error); toast({ title: "Brain storage is not ready yet", description: "Apply the latest database update, then reopen this page.", variant: "destructive" }); }
      finally { setLoading(false); }
    })();
  }, [loadBrain, navigate, toast]);

  const filteredRecords = useMemo(() => records.filter((record) => {
    if (view === "me" && record.layer !== "high_signal") return false;
    if (view === "archive" && record.layer !== "context_rot") return false;
    return `${record.title} ${record.content} ${record.domain || ""} ${record.project || ""}`.toLowerCase().includes(query.toLowerCase());
  }), [query, records, view]);

  const deleteRecord = async (recordId: string) => {
    const { error } = await supabase.from("brain_records").delete().eq("id", recordId);
    if (error) { toast({ title: "Could not remove this record", variant: "destructive" }); return; }
    setRecords((current) => current.filter((record) => record.id !== recordId));
  };

  const importFiles = async (files: FileList | null) => {
    if (!files || !userId) return;
    setImporting(true);
    try {
      const imported = [];
      for (const file of Array.from(files)) for (const [index, content] of chunkSourceText(await file.text()).entries()) imported.push({
        user_id: userId, title: `${file.name} · part ${index + 1}`, content, domain: "Imported history", source_name: file.name, source_type: "uploaded_export", provenance: "Imported by Joshua through the Brain page.", confidence_score: 0.6, status: "needs_verification", ...classifyImportedChunk(content),
      });
      if (imported.length === 0) return;
      const { data, error } = await supabase.from("brain_records").insert(imported).select("*");
      if (error) throw error;
      setRecords((current) => [...(data || []) as BrainRecord[], ...current]);
      toast({ title: "History imported", description: `${imported.length} searchable archive records added.` });
      setView("archive");
    } catch (error) { console.error("Brain import failed", error); toast({ title: "Import failed", description: "The files were not added.", variant: "destructive" }); }
    finally { setImporting(false); }
  };

  const saveNote = async () => {
    if (!userId || !notes.trim()) return;
    const { data, error } = await supabase.from("brain_records").insert({ user_id: userId, title: "Personal note", content: notes.trim(), domain: "Personal", layer: "high_signal", record_type: "fact", status: "current", confidence_score: 1, source_name: "Brain page", source_type: "user_note", provenance: "Written directly by Joshua." }).select("*").single();
    if (error) { toast({ title: "Could not save note", variant: "destructive" }); return; }
    setRecords((current) => [data as BrainRecord, ...current]); setNotes(""); toast({ title: "Added to your Brain" });
  };

  return <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="min-h-screen bg-background text-foreground">
    <header className="sticky top-0 z-10 h-14 px-4 flex items-center justify-between border-b border-border/50 bg-background/90 backdrop-blur-xl"><Button variant="ghost" size="icon" onClick={() => navigate("/chat")} className="rounded-full"><ArrowLeft size={18} /></Button><div className="flex items-center gap-2 font-serif-display text-lg"><BrainIcon size={18} className="text-primary" /> Personal Brain</div><Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={importing} title="Import files" className="rounded-full"><FileUp size={17} /></Button><input ref={fileInputRef} type="file" multiple accept=".txt,.md,.json,.csv" className="hidden" onChange={(event) => { void importFiles(event.target.files); event.currentTarget.value = ""; }} /></header>
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-7"><section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] items-start"><div><p className="text-xs uppercase tracking-[0.18em] text-primary font-semibold">Private context system</p><h1 className="text-4xl md:text-5xl mt-2">Your context, without the clutter.</h1><p className="mt-4 text-muted-foreground max-w-xl">Hanchi uses the small set of current things that matter, while keeping older exports searchable instead of forcing every old detail into every reply.</p><div className="flex flex-wrap gap-2 mt-5"><Button onClick={() => setView("me")} variant={view === "me" ? "default" : "outline"} className="rounded-full"><Sparkles size={15} /> Me</Button><Button onClick={() => setView("archive")} variant={view === "archive" ? "default" : "outline"} className="rounded-full"><Archive size={15} /> Context archive</Button><Button onClick={() => fileInputRef.current?.click()} variant="outline" className="rounded-full"><FileUp size={15} /> Import exports</Button></div></div><div className="rounded-2xl border border-primary/20 bg-primary/5 p-5"><div className="flex items-center gap-2 font-medium"><ShieldCheck size={17} className="text-primary" /> Retrieval rules</div><ul className="mt-3 space-y-2 text-sm text-muted-foreground">{CONTEXT_ROT_RULES.map((rule) => <li key={rule} className="flex gap-2"><span className="text-primary">•</span>{rule}</li>)}</ul></div></section>
      {view === "me" && <section className="grid gap-4 md:grid-cols-2"><div className="rounded-2xl border border-border/60 bg-card p-5"><div className="text-xs uppercase tracking-wide text-muted-foreground">Identity</div><h2 className="text-2xl mt-2">{ME_PROFILE.name}</h2><p className="text-sm text-muted-foreground mt-2">{ME_PROFILE.communication}</p><div className="flex flex-wrap gap-2 mt-4">{ME_PROFILE.currentFocus.map((focus) => <span key={focus} className="text-xs rounded-full bg-muted px-3 py-1.5">{focus}</span>)}</div></div><div className="rounded-2xl border border-border/60 bg-card p-5"><div className="text-xs uppercase tracking-wide text-muted-foreground">Add something current</div><Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="A current goal, decision or preference…" className="mt-3 min-h-24 rounded-xl resize-none" /><Button onClick={() => void saveNote()} disabled={!notes.trim() || loading} className="mt-3 rounded-full">Save to Brain</Button></div></section>}
      <section><div className="flex items-center justify-between gap-3 mb-4"><div><h2 className="text-xl">{view === "me" ? "Current context" : "Historical archive"}</h2><p className="text-sm text-muted-foreground">{view === "me" ? "High-signal information Hanchi can use normally." : "Imported material stays searchable and marked for verification."}</p></div><div className="relative w-52"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" className="pl-9 rounded-full" /></div></div>{loading ? <div className="py-12 text-center text-muted-foreground">Loading your Brain…</div> : filteredRecords.length === 0 ? <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">{view === "archive" ? "Import your Claude or ChatGPT exports to build the archive." : "No current records yet."}</div> : <div className="grid gap-3 md:grid-cols-2">{filteredRecords.map((record) => <article key={record.id} className="rounded-2xl border border-border/60 bg-card p-4"><div className="flex items-start gap-3"><div className="flex-1 min-w-0"><div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-wide text-muted-foreground"><span>{record.domain}</span>{record.project && <span>· {record.project}</span>}{record.status === "needs_verification" && <span className="text-accent-warm">· verify</span>}</div><h3 className="font-medium mt-1">{record.title}</h3><p className="text-sm text-muted-foreground mt-2 whitespace-pre-line">{record.content}</p><p className="text-xs text-muted-foreground/70 mt-3">Source: {record.source_name || "Hanchi"}</p></div><Button variant="ghost" size="icon" onClick={() => void deleteRecord(record.id)} className="rounded-full text-muted-foreground hover:text-destructive"><Trash2 size={15} /></Button></div></article>)}</div>}</section>
    </main>
  </motion.div>;
}