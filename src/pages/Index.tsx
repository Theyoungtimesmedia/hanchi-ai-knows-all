import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Archive,
  ArrowDown,
  ArrowUp,
  Bot,
  Brain,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  Command,
  Copy,
  File,
  FileCode2,
  FileText,
  FolderKanban,
  Github,
  Globe,
  LayoutPanelRight,
  Loader2,
  Mail,
  Menu,
  MessageSquare,
  Mic,
  MoreHorizontal,
  Moon,
  Paperclip,
  PanelLeft,
  PanelRight,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  ThumbsDown,
  ThumbsUp,
  Upload,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  artifactFromCodeBlock,
  downloadTextFile,
  edgeRequest,
  extractCodeArtifacts,
  streamChat,
  type HanchiArtifact,
  type HanchiMessage,
} from "@/lib/hanchi-ui";

type Row = Record<string, any>;

type CanvasState = {
  artifact: HanchiArtifact;
  tab: "preview" | "source";
};

type CommandItem = {
  label: string;
  hint: string;
  icon: React.ReactNode;
  action: () => void;
};

const db = supabase as any;

function shortTime(value?: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function inferArtifact(markdown: string): HanchiArtifact | null {
  const blocks = extractCodeArtifacts(markdown);
  if (!blocks.length) return null;
  const first = blocks[0];
  return artifactFromCodeBlock(first.language, first.content);
}

function initials(name?: string | null) {
  return (name || "Joshua Omoniyi")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function Index() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [rightTab, setRightTab] = useState<"canvas" | "memory" | "activity">("canvas");
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newMenuOpen, setNewMenuOpen] = useState(false);
  const [composerMenuOpen, setComposerMenuOpen] = useState(false);
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [effortMenuOpen, setEffortMenuOpen] = useState(false);
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("auto");
  const [effort, setEffort] = useState("standard");
  const [mode, setMode] = useState<"chat" | "council" | "research">("chat");
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<HanchiMessage[]>([]);
  const [conversations, setConversations] = useState<Row[]>([]);
  const [projects, setProjects] = useState<Row[]>([]);
  const [brain, setBrain] = useState<Row[]>([]);
  const [skills, setSkills] = useState<Row[]>([]);
  const [connectors, setConnectors] = useState<Row[]>([]);
  const [briefing, setBriefing] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);
  const [composerBusy, setComposerBusy] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [metadata, setMetadata] = useState<Record<string, any> | null>(null);
  const [canvas, setCanvas] = useState<CanvasState | null>(null);
  const [search, setSearch] = useState("");
  const [attachments, setAttachments] = useState<Row[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const refreshWorkspace = useCallback(async (uid: string) => {
    const [conversationResult, projectResult, brainResult, skillResult, connectorResult, briefingResult] = await Promise.all([
      db.from("conversations").select("id,title,updated_at,pinned").eq("user_id", uid).order("pinned", { ascending: false }).order("updated_at", { ascending: false }).limit(60),
      db.from("hanchi_projects").select("id,name,description,updated_at,status").eq("user_id", uid).order("updated_at", { ascending: false }).limit(30),
      db.from("hanchi_knowledge_items").select("id,key,value,category,scope,confidence,updated_at").eq("user_id", uid).eq("status", "active").order("updated_at", { ascending: false }).limit(40),
      db.from("hanchi_skills").select("id,name,description,enabled,version").eq("user_id", uid).order("name", { ascending: true }),
      db.from("hanchi_connectors").select("id,provider,display_name,status,last_used_at,scopes").eq("user_id", uid).order("display_name", { ascending: true }),
      db.from("hanchi_daily_briefings").select("*").eq("user_id", uid).order("briefing_date", { ascending: false }).limit(1).maybeSingle(),
    ]);
    setConversations(conversationResult.data || []);
    setProjects(projectResult.data || []);
    setBrain(brainResult.data || []);
    setSkills(skillResult.data || []);
    setConnectors(connectorResult.data || []);
    setBriefing(briefingResult.data || null);
  }, []);

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!alive) return;
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      refreshWorkspace(session.user.id);
    });
    return () => { alive = false; };
  }, [navigate, refreshWorkspace]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if ((event.ctrlKey || event.metaKey) && key === "k") {
        event.preventDefault();
        setCommandOpen(true);
      }
      if ((event.ctrlKey || event.metaKey) && key === "b") {
        event.preventDefault();
        setSidebarCollapsed((value) => !value);
      }
      if ((event.ctrlKey || event.metaKey) && key === "n") {
        event.preventDefault();
        startNewChat();
      }
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && key === "l") {
        event.preventDefault();
        setRightOpen((value) => !value);
      }
      if (event.key === "Escape") {
        setCommandOpen(false);
        setSettingsOpen(false);
        setNewMenuOpen(false);
        setComposerMenuOpen(false);
        setModelMenuOpen(false);
        setEffortMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, busy]);

  async function loadConversation(id: string) {
    setCurrentConversationId(id);
    const result = await db.from("messages").select("id,role,content,created_at,metadata").eq("conversation_id", id).order("created_at", { ascending: true });
    setMessages(result.data || []);
    setCanvas(null);
    setMetadata(null);
  }

  async function startNewChat() {
    setCurrentConversationId(null);
    setMessages([]);
    setInput("");
    setAttachments([]);
    setCanvas(null);
    setMode("chat");
    setStatusText("");
    textareaRef.current?.focus();
  }

  async function ensureConversation(firstMessage: string) {
    if (currentConversationId) return currentConversationId;
    const title = firstMessage.trim().slice(0, 64) || "New chat";
    const result = await db.from("conversations").insert({
      user_id: user.id,
      title,
      language: "en",
    }).select("id").single();
    if (result.error) throw result.error;
    setCurrentConversationId(result.data.id);
    setConversations((prev) => [{ id: result.data.id, title, updated_at: new Date().toISOString(), pinned: false }, ...prev]);
    return result.data.id;
  }

  async function persistMessage(conversationId: string, role: "user" | "assistant", content: string, extra: Record<string, any> = {}) {
    const result = await db.from("messages").insert({
      conversation_id: conversationId,
      role,
      content,
      metadata: extra,
    }).select("id,role,content,created_at,metadata").single();
    if (result.error) throw result.error;
    setMessages((prev) => [...prev, result.data]);
    return result.data as HanchiMessage;
  }

  async function saveArtifact(artifact: HanchiArtifact, conversationId: string) {
    try {
      const payload = await edgeRequest<any>("hanchi-artifact", {
        method: "POST",
        body: JSON.stringify({
          action: "create",
          conversationId,
          title: artifact.title,
          fileName: artifact.file_name,
          mimeType: artifact.mime_type,
          language: artifact.language,
          content: artifact.content,
          artifactType: artifact.artifact_type,
          previewMode: artifact.preview_mode,
        }),
      });
      return payload?.artifact || artifact;
    } catch {
      return artifact;
    }
  }

  async function openArtifact(artifact: HanchiArtifact) {
    setRightOpen(true);
    setRightTab("canvas");
    setCanvas({ artifact, tab: "preview" });
  }

  async function sendMessage(customInput?: string) {
    const raw = (customInput ?? input).trim();
    if (!raw || busy || !user) return;

    const conversationId = await ensureConversation(raw);
    setBusy(true);
    setStatusText(mode === "council" ? "Hanchi Council is comparing models…" : mode === "research" ? "Hanchi Research is gathering sources…" : "");
    setInput("");

    const attachedImages = attachments.filter((item) => item.kind === "image").map((item) => item.base64).filter(Boolean);
    const transcriptText = attachments.filter((item) => item.kind === "transcript").map((item) => item.text).filter(Boolean).join("\n\n");
    const prompt = transcriptText ? `${raw}\n\n[Transcript from ${attachments[0]?.name || "uploaded media"}]\n${transcriptText}` : raw;

    await persistMessage(conversationId, "user", prompt, {
      attachments: attachments.map((item) => ({ name: item.name, kind: item.kind, size: item.size })),
      mode,
    });
    setAttachments([]);

    try {
      if (mode === "research") {
        const result = await edgeRequest<any>("hanchi-research", {
          method: "POST",
          body: JSON.stringify({ query: prompt, conversationId }),
        });
        const report = [
          result.summary ? `## Research Summary\n\n${result.summary}` : "",
          Array.isArray(result.findings) && result.findings.length
            ? `## Findings\n\n${result.findings.map((item: any) => `### ${item.title || "Finding"}\n${item.claim || ""}\n\n${item.evidence || ""}`).join("\n\n")}`
            : "",
          result.sources?.length ? `## Sources\n\n${result.sources.map((source: any) => `- [${source.title || "Source"}](${source.url || "#"})`).join("\n")}` : "",
        ].filter(Boolean).join("\n\n");
        const assistant = await persistMessage(conversationId, "assistant", report || "No research report was returned.", {
          mode: "research",
          sources: result.sources || [],
          self_check: result.self_check,
        });
        setMetadata({ mode: "research", sources: result.sources?.length || 0, self_check: result.self_check });
        if (report) openArtifact(artifactFromCodeBlock("markdown", report, "Hanchi Research Report"));
        return assistant;
      }

      if (mode === "council") {
        const result = await edgeRequest<any>("hanchi-council", {
          method: "POST",
          body: JSON.stringify({
            messages: [...messages, { role: "user", content: prompt }],
            conversationId,
            effort,
          }),
        });
        const assistant = await persistMessage(conversationId, "assistant", result.text || "No council response was returned.", {
          mode: "council",
          provider: result.provider,
          model: result.model,
          candidates: result.candidates,
          self_check: result.self_check,
        });
        setMetadata({ mode: "council", provider: result.provider, model: result.model, candidates: result.candidates, self_check: result.self_check });
        const artifact = inferArtifact(result.text || "");
        if (artifact) await openArtifact(await saveArtifact(artifact, conversationId));
        return assistant;
      }

      let answer = "";
      let streamedMetadata: Record<string, any> | null = null;
      const history = [...messages, { role: "user", content: prompt }].map((message) => ({ role: message.role, content: message.content }));
      const optimistic: HanchiMessage = { id: `stream-${Date.now()}`, role: "assistant", content: "", created_at: new Date().toISOString() };
      setMessages((prev) => [...prev, optimistic]);

      await streamChat({
        messages: history,
        model: selectedModel === "auto" ? undefined : selectedModel,
        effort,
        projectId: null,
        language: "en",
        tone: "default",
        searchWeb: attachments.some((item) => item.kind === "web") || mode === "chat" && /(search|latest|today|current)/i.test(prompt),
        images: attachedImages,
      }, (chunk) => {
        answer += chunk;
        setMessages((prev) => prev.map((item) => item.id === optimistic.id ? { ...item, content: answer } : item));
      }, (meta) => {
        streamedMetadata = meta;
        setMetadata(meta);
      });

      const artifact = inferArtifact(answer);
      if (artifact) {
        const saved = await saveArtifact(artifact, conversationId);
        await openArtifact(saved);
      }

      await db.from("messages").insert({
        conversation_id: conversationId,
        role: "assistant",
        content: answer,
        metadata: { ...streamedMetadata, mode: "chat" },
      });
      setMessages((prev) => prev.filter((item) => item.id !== optimistic.id).concat({
        id: `persisted-${Date.now()}`,
        role: "assistant",
        content: answer,
        created_at: new Date().toISOString(),
        metadata: streamedMetadata,
      }));
      setConversations((prev) => prev.map((item) => item.id === conversationId ? { ...item, updated_at: new Date().toISOString() } : item));
    } catch (error) {
      setMessages((prev) => prev.filter((item) => !item.id.startsWith("stream-")));
      const message = error instanceof Error ? error.message : "Something went wrong.";
      await persistMessage(conversationId, "assistant", `I hit an error: ${message}`, { error: true });
    } finally {
      setBusy(false);
      setStatusText("");
    }
  }

  async function handleFile(file: File) {
    if (!file || composerBusy) return;
    setComposerBusy(true);
    try {
      const lower = file.name.toLowerCase();
      const isImage = file.type.startsWith("image/");
      const isPdf = file.type === "application/pdf" || lower.endsWith(".pdf");

      if (isPdf) {
        const url = URL.createObjectURL(file);
        const artifact: HanchiArtifact = {
          id: `local-pdf-${Date.now()}`,
          title: file.name,
          file_name: file.name,
          mime_type: "application/pdf",
          content: "",
          version: 1,
          artifact_type: "uploaded",
          preview_mode: "pdf",
        };
        setCanvas({ artifact: { ...artifact, metadata: { objectUrl: url } }, tab: "preview" });
        setRightOpen(true);
        setRightTab("canvas");
        setAttachments((prev) => [...prev, { name: file.name, kind: "file", size: file.size, url }]);
        return;
      }

      if (isImage) {
        const buffer = await file.arrayBuffer();
        let binary = "";
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, Math.min(i + 0x8000, bytes.length)));
        const base64 = btoa(binary);
        const form = new FormData();
        form.append("action", "ocr");
        form.append("file", file);
        const result = await edgeRequest<any>("process-media", { method: "POST", body: form });
        setAttachments((prev) => [...prev, { name: file.name, kind: "image", size: file.size, text: result.text, base64, mime: file.type }]);
        setInput((value) => value || "Read this image and explain what's important.");
        return;
      }

      const form = new FormData();
      form.append("action", "transcribe");
      form.append("file", file);
      const result = await edgeRequest<any>("process-media", { method: "POST", body: form });
      setAttachments((prev) => [...prev, {
        name: file.name,
        kind: result.type === "transcription" ? "transcript" : "file",
        size: file.size,
        text: result.text || result.extractedText || "",
      }]);
      if (result.text || result.extractedText) setInput((value) => value || "Turn this into useful notes and next actions.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not process this file.";
      setStatusText(message);
      window.setTimeout(() => setStatusText(""), 3500);
    } finally {
      setComposerBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function copyMessage(content: string) {
    await navigator.clipboard.writeText(content);
  }

  async function regenerate() {
    const lastUser = [...messages].reverse().find((message) => message.role === "user");
    if (!lastUser || busy) return;
    await sendMessage(lastUser.content);
  }

  const filteredConversations = conversations.filter((item) => String(item.title || "").toLowerCase().includes(search.toLowerCase()));
  const commandItems = useMemo<CommandItem[]>(() => [
    { label: "New chat", hint: "Ctrl + N", icon: <Plus size={16} />, action: startNewChat },
    { label: "Toggle sidebar", hint: "Ctrl + B", icon: <PanelLeft size={16} />, action: () => setSidebarCollapsed((value) => !value) },
    { label: "Toggle canvas", hint: "Ctrl + Shift + L", icon: <PanelRight size={16} />, action: () => setRightOpen((value) => !value) },
    { label: "Open Brain", hint: "", icon: <Brain size={16} />, action: () => { setRightTab("memory"); setRightOpen(true); } },
    { label: "Projects", hint: "", icon: <FolderKanban size={16} />, action: () => navigate("/projects") },
    { label: "Settings", hint: "Ctrl + ,", icon: <Settings size={16} />, action: () => setSettingsOpen(true) },
  ], [navigate]);

  if (!user) {
    return <div className="hanchi-loading"><Loader2 className="spin" size={22} /><span>Loading Hanchi…</span></div>;
  }

  return (
    <div className="hanchi-shell">
      <aside className={`hanchi-sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="hanchi-sidebar-top">
          <button className="hanchi-brand" onClick={startNewChat} aria-label="Hanchi home">
            <span className="hanchi-brand-mark">H</span>
            {!sidebarCollapsed && <span className="hanchi-brand-name">Hanchi</span>}
          </button>
          <button className="hanchi-icon-button" onClick={() => setSidebarCollapsed((value) => !value)} title="Toggle sidebar">
            {sidebarCollapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
          </button>
        </div>

        {!sidebarCollapsed && (
          <>
            <button className="hanchi-new-chat" onClick={startNewChat}>
              <Plus size={16} />
              <span>New chat</span>
              <kbd>Ctrl N</kbd>
            </button>

            <div className="hanchi-side-search">
              <Search size={15} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search chats" />
              <button onClick={() => { setCommandOpen(true); setCommandQuery(""); }} title="Command palette"><Command size={15} /></button>
            </div>

            <nav className="hanchi-nav" aria-label="Workspace">
              <button className="hanchi-nav-item active"><MessageSquare size={16} /><span>Chats</span></button>
              <button className="hanchi-nav-item" onClick={() => navigate("/projects")}><FolderKanban size={16} /><span>Projects</span><span className="nav-count">{projects.length || ""}</span></button>
              <button className="hanchi-nav-item" onClick={() => { setRightTab("memory"); setRightOpen(true); }}><Brain size={16} /><span>Brain</span><span className="nav-count">{brain.length || ""}</span></button>
              <button className="hanchi-nav-item" onClick={() => navigate("/artifacts")}><FileCode2 size={16} /><span>Files & Artifacts</span></button>
              <button className="hanchi-nav-item" onClick={() => navigate("/prompts")}><Zap size={16} /><span>Skills</span><span className="nav-count">{skills.length || ""}</span></button>
              <button className="hanchi-nav-item" onClick={() => setSettingsOpen(true)}><Wrench size={16} /><span>Connectors</span><span className="nav-count">{connectors.length || ""}</span></button>
              <button className="hanchi-nav-item" onClick={() => { if (briefing) { setRightTab("activity"); setRightOpen(true); } else { setInput("Give me Joshua's Morning"); textareaRef.current?.focus(); } }}><Sparkles size={16} /><span>Joshua's Morning</span></button>
              <button className="hanchi-nav-item" onClick={() => setSettingsOpen(true)}><CalendarDays size={16} /><span>Automations</span></button>
            </nav>

            <div className="hanchi-side-section">
              <div className="hanchi-side-label"><span>Recent</span><MoreHorizontal size={14} /></div>
              <div className="hanchi-chat-list">
                {filteredConversations.slice(0, 22).map((conversation) => (
                  <button key={conversation.id} className={`hanchi-chat-item ${conversation.id === currentConversationId ? "selected" : ""}`} onClick={() => loadConversation(conversation.id)}>
                    <span className="chat-item-title">{conversation.title || "Untitled chat"}</span>
                  </button>
                ))}
                {!filteredConversations.length && <div className="hanchi-empty-side">No chats yet.</div>}
              </div>
            </div>
          </>
        )}

        <div className="hanchi-sidebar-spacer" />
        <div className="hanchi-sidebar-bottom">
          {!sidebarCollapsed && (
            <button className="hanchi-profile-row" onClick={() => setSettingsOpen(true)}>
              <span className="hanchi-avatar">{initials(user.user_metadata?.full_name || user.email?.split("@")[0])}</span>
              <span className="profile-copy"><strong>Joshua Omoniyi</strong><small>Personal workspace</small></span>
              <MoreHorizontal size={16} />
            </button>
          )}
        </div>
      </aside>

      <main className="hanchi-main">
        <header className="hanchi-topbar">
          <div className="hanchi-topbar-left">
            <button className="hanchi-mobile-menu" onClick={() => setSidebarCollapsed((value) => !value)}><Menu size={18} /></button>
            <button className="hanchi-project-switcher" onClick={() => navigate("/projects")}>
              <span className="project-dot" />
              <span>Personal workspace</span>
              <ChevronDown size={14} />
            </button>
          </div>
          <div className="hanchi-topbar-centre">
            <div className="hanchi-mode-pill">
              <span className="mode-status-dot" />
              {mode === "chat" ? "Chat" : mode === "council" ? "Council" : "Research"}
            </div>
            <span className="hanchi-context-note">Private · Joshua only</span>
          </div>
          <div className="hanchi-topbar-right">
            <button className="hanchi-icon-button" onClick={() => setRightOpen((value) => !value)} title="Canvas"><LayoutPanelRight size={17} /></button>
            <button className="hanchi-icon-button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} title="Theme">
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button className="hanchi-icon-button" onClick={() => setCommandOpen(true)} title="Command palette"><Command size={17} /></button>
          </div>
        </header>

        <div className={`hanchi-workspace ${rightOpen ? "with-canvas" : ""}`}>
          <section className="hanchi-chat-column">
            <div className="hanchi-message-scroll" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="hanchi-welcome">
                  <div className="hanchi-welcome-mark">H</div>
                  <h1>What are we working on?</h1>
                  <p>Chat, research, build, organise or think things through. Hanchi already has Joshua's workspace context loaded.</p>
                  <div className="hanchi-starter-grid">
                    <button onClick={() => { setInput("Help me plan what I should work on today."); textareaRef.current?.focus(); }}><CalendarDays size={16} /><span><b>Plan today</b><small>Use my real schedule and priorities</small></span></button>
                    <button onClick={() => { setMode("research"); setInput("Research "); textareaRef.current?.focus(); }}><Globe size={16} /><span><b>Research</b><small>Sources, synthesis and citations</small></span></button>
                    <button onClick={() => { setInput("Create a Markdown document for "); setRightOpen(true); textareaRef.current?.focus(); }}><FileText size={16} /><span><b>Create a file</b><small>Open it in the Canvas</small></span></button>
                    <button onClick={() => { setMode("council"); setInput("Compare these options and tell me what you would actually choose: "); textareaRef.current?.focus(); }}><Bot size={16} /><span><b>Ask the Council</b><small>Multiple models, one final answer</small></span></button>
                  </div>
                  {briefing && (
                    <div className="hanchi-morning-card">
                      <div className="morning-head"><span>Joshua's Morning</span><span>{briefing.briefing_date}</span></div>
                      <strong>{briefing.word_of_day || "A focused start."}</strong>
                      <p>{briefing.bible_reference ? `${briefing.bible_reference} — ${briefing.bible_text}` : briefing.note}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hanchi-thread">
                  <div className="hanchi-thread-meta">
                    <span>{metadata?.mode || mode}</span>
                    {metadata?.model && <span>{metadata.model}</span>}
                    {metadata?.self_check && <span><ShieldCheck size={12} /> checked</span>}
                  </div>
                  {messages.map((message) => (
                    <article key={message.id} className={`hanchi-message ${message.role}`}>
                      <div className="message-author">{message.role === "user" ? <span className="hanchi-avatar small">JM</span> : <span className="hanchi-brand-mark small">H</span>}</div>
                      <div className="message-content">
                        <div className="message-body">
                          {message.role === "assistant" ? (
                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                              pre({ children }) { return <div className="markdown-pre">{children}</div>; },
                              code({ inline, className, children }) {
                                const language = className?.replace("language-", "") || "text";
                                return inline ? <code>{children}</code> : <code data-language={language}>{children}</code>;
                              },
                            }}>{message.content}</ReactMarkdown>
                          ) : <div className="user-copy">{message.content}</div>}
                        </div>
                        {message.role === "assistant" && !message.id.startsWith("stream-") && (
                          <div className="message-actions">
                            <button title="Copy" onClick={() => copyMessage(message.content)}><Copy size={14} /></button>
                            <button title="Helpful"><ThumbsUp size={14} /></button>
                            <button title="Not helpful"><ThumbsDown size={14} /></button>
                            {inferArtifact(message.content) && <button title="Open in Canvas" onClick={() => openArtifact(inferArtifact(message.content)!)}><LayoutPanelRight size={14} /></button>}
                            <button title="More"><MoreHorizontal size={14} /></button>
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                  {busy && <div className="hanchi-working"><span className="working-dot" /><span>{statusText || "Thinking"}</span><span className="working-pulse">•••</span></div>}
                </div>
              )}
            </div>

            <div className="hanchi-composer-wrap">
              {attachments.length > 0 && (
                <div className="hanchi-attachment-row">
                  {attachments.map((item, index) => (
                    <div className="hanchi-attachment-chip" key={`${item.name}-${index}`}>
                      {item.kind === "transcript" ? <Mic size={13} /> : item.kind === "image" ? <File size={13} /> : <Paperclip size={13} />}
                      <span>{item.name}</span>
                      <button onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== index))}><X size={12} /></button>
                    </div>
                  ))}
                </div>
              )}

              <div className="hanchi-composer">
                <div className="composer-topline">
                  <div className="composer-left-tools">
                    <div className="relative-wrap">
                      <button className="composer-tool" onClick={() => setComposerMenuOpen((value) => !value)} title="Add"><Plus size={17} /></button>
                      {composerMenuOpen && <div className="hanchi-menu composer-menu">
                        <button onClick={() => { fileRef.current?.click(); setComposerMenuOpen(false); }}><Upload size={15} /><span>Upload file</span><small>PDF, images, audio, code</small></button>
                        <button onClick={() => { setMode("research"); setComposerMenuOpen(false); }}><Globe size={15} /><span>Research</span><small>Search + cited report</small></button>
                        <button onClick={() => { setMode("council"); setComposerMenuOpen(false); }}><Bot size={15} /><span>Model Council</span><small>Compare models</small></button>
                        <button onClick={() => { setMode("chat"); setComposerMenuOpen(false); setInput("Create a file: "); }}><FileCode2 size={15} /><span>Create artifact</span><small>Open in Canvas</small></button>
                      </div>}
                    </div>
                    <button className={`composer-tool ${mode === "research" ? "active" : ""}`} onClick={() => setMode(mode === "research" ? "chat" : "research")} title="Research"><Globe size={16} /></button>
                    <button className={`composer-tool ${mode === "council" ? "active" : ""}`} onClick={() => setMode(mode === "council" ? "chat" : "council")} title="Council"><Bot size={16} /></button>
                  </div>
                  <div className="composer-right-tools">
                    <div className="relative-wrap">
                      <button className="composer-select" onClick={() => setEffortMenuOpen((value) => !value)}>Effort <strong>{effort[0].toUpperCase() + effort.slice(1)}</strong><ChevronDown size={13} /></button>
                      {effortMenuOpen && <div className="hanchi-menu small-menu">
                        {["light", "standard", "high"].map((value) => <button key={value} onClick={() => { setEffort(value); setEffortMenuOpen(false); }}><span>{value[0].toUpperCase() + value.slice(1)}</span>{effort === value && <Check size={14} />}</button>)}
                      </div>}
                    </div>
                    <div className="relative-wrap">
                      <button className="composer-select" onClick={() => setModelMenuOpen((value) => !value)}>{selectedModel === "auto" ? "Auto" : selectedModel}<ChevronDown size={13} /></button>
                      {modelMenuOpen && <div className="hanchi-menu small-menu model-menu">
                        {[["auto","Auto"],["hanchi-context","Context"],["hanchi-instant","Instant"],["hanchi-fast","Fast"],["hanchi-coder","Coder"]].map(([value,label]) => <button key={value} onClick={() => { setSelectedModel(value); setModelMenuOpen(false); }}><span>{label}</span>{selectedModel === value && <Check size={14} />}</button>)}
                      </div>}
                    </div>
                  </div>
                </div>
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendMessage(); } }}
                  placeholder={mode === "research" ? "Ask Hanchi to research something…" : mode === "council" ? "Ask the model council…" : "Message Hanchi…"}
                  rows={1}
                />
                <div className="composer-bottomline">
                  <div className="composer-status">
                    <button onClick={() => setMode("chat")} className={mode === "chat" ? "active-mode" : ""}><MessageSquare size={13} /> Chat</button>
                    {mode !== "chat" && <span>·</span>}
                    {mode === "research" && <span>Research mode</span>}
                    {mode === "council" && <span>Council mode</span>}
                  </div>
                  <div className="composer-actions">
                    <input ref={fileRef} type="file" hidden onChange={(event) => event.target.files?.[0] && handleFile(event.target.files[0])} />
                    <button className="composer-voice" onClick={() => fileRef.current?.click()} title="Upload voice note"><Mic size={16} /></button>
                    <button className={`composer-send ${(!input.trim() || busy || composerBusy) ? "disabled" : ""}`} onClick={() => sendMessage()} disabled={!input.trim() || busy || composerBusy} title="Send"><ArrowUp size={17} /></button>
                  </div>
                </div>
              </div>
              <div className="composer-footnote">Hanchi can be wrong. For important decisions, use Verify or Council and inspect the sources.</div>
            </div>
          </section>

          {rightOpen && (
            <aside className="hanchi-right-panel">
              <div className="right-panel-head">
                <div className="right-panel-tabs">
                  <button className={rightTab === "canvas" ? "active" : ""} onClick={() => setRightTab("canvas")}><LayoutPanelRight size={14} />Canvas</button>
                  <button className={rightTab === "memory" ? "active" : ""} onClick={() => setRightTab("memory")}><Brain size={14} />Memory</button>
                  <button className={rightTab === "activity" ? "active" : ""} onClick={() => setRightTab("activity")}><ShieldCheck size={14} />Activity</button>
                </div>
                <button className="hanchi-icon-button" onClick={() => setRightOpen(false)} title="Close"><X size={16} /></button>
              </div>

              {rightTab === "canvas" && (
                <div className="canvas-body">
                  {canvas ? (
                    <>
                      <div className="canvas-titlebar">
                        <div><FileCode2 size={15} /><strong>{canvas.artifact.title}</strong><span>v{canvas.artifact.version}</span></div>
                        <div className="canvas-actions">
                          <button className={canvas.tab === "preview" ? "active" : ""} onClick={() => setCanvas((value) => value ? { ...value, tab: "preview" } : value)}>Preview</button>
                          <button className={canvas.tab === "source" ? "active" : ""} onClick={() => setCanvas((value) => value ? { ...value, tab: "source" } : value)}>Source</button>
                          <button onClick={() => downloadTextFile(canvas.artifact.file_name, canvas.artifact.content, canvas.artifact.mime_type)}><ArrowDown size={14} />Download</button>
                        </div>
                      </div>
                      {canvas.tab === "preview" ? (
                        canvas.artifact.preview_mode === "html" ? (
                          <iframe title="HTML preview" className="artifact-iframe" sandbox="allow-scripts" srcDoc={canvas.artifact.content} />
                        ) : canvas.artifact.preview_mode === "markdown" ? (
                          <div className="artifact-document"><ReactMarkdown remarkPlugins={[remarkGfm]}>{canvas.artifact.content}</ReactMarkdown></div>
                        ) : canvas.artifact.preview_mode === "pdf" ? (
                          <iframe title="PDF preview" className="artifact-iframe" src={String(canvas.artifact.metadata?.objectUrl || "")} />
                        ) : (
                          <div className="artifact-source"><div className="language-pill">{canvas.artifact.language || "text"}</div><pre>{canvas.artifact.content}</pre></div>
                        )
                      ) : (
                        <div className="artifact-source"><textarea value={canvas.artifact.content} onChange={(event) => setCanvas((value) => value ? { ...value, artifact: { ...value.artifact, content: event.target.value } } : value)} /></div>
                      )}
                    </>
                  ) : (
                    <div className="right-empty"><LayoutPanelRight size={26} /><strong>Canvas</strong><p>Generated files, code and reports open here automatically.</p></div>
                  )}
                </div>
              )}

              {rightTab === "memory" && (
                <div className="right-list-panel">
                  <div className="right-list-intro"><h3>Joshua's Brain</h3><p>High-signal context Hanchi can retrieve while you work.</p></div>
                  {brain.map((item) => <div className="memory-card" key={item.id}><div className="memory-meta"><span>{item.category || "general"}</span><span>{item.scope || "global"}</span></div><strong>{item.key}</strong><p>{item.value}</p></div>)}
                  {!brain.length && <div className="right-empty"><Brain size={26} /><strong>No memory loaded yet</strong></div>}
                </div>
              )}

              {rightTab === "activity" && (
                <div className="right-list-panel">
                  <div className="right-list-intro"><h3>Workspace activity</h3><p>Trust signals for models, connectors and execution.</p></div>
                  <div className="activity-card"><div className="activity-icon"><ShieldCheck size={15} /></div><div><strong>Self-check</strong><p>{metadata?.self_check ? "Completed for the latest response." : "Waiting for the next response."}</p></div></div>
                  <div className="activity-card"><div className="activity-icon"><Bot size={15} /></div><div><strong>Model</strong><p>{metadata?.model || "Auto routing"}{metadata?.provider ? ` · ${metadata.provider}` : ""}</p></div></div>
                  <div className="activity-card"><div className="activity-icon"><Wrench size={15} /></div><div><strong>Connectors</strong><p>{connectors.filter((item) => item.status === "connected").length} connected · {connectors.length} available</p></div></div>
                  {connectors.map((item) => <div className="connector-row" key={item.id}><div className="connector-icon">{item.provider === "github" ? <Github size={15} /> : item.provider === "notion" ? <FileText size={15} /> : item.provider === "gmail" ? <Mail size={15} /> : item.provider === "google_calendar" ? <CalendarDays size={15} /> : <Globe size={15} />}</div><span>{item.display_name}</span><em className={item.status === "connected" ? "connected" : "disconnected"}>{item.status}</em></div>)}
                </div>
              )}
            </aside>
          )}
        </div>
      </main>

      {commandOpen && (
        <div className="hanchi-overlay" onMouseDown={() => setCommandOpen(false)}>
          <div className="hanchi-command" onMouseDown={(event) => event.stopPropagation()}>
            <div className="command-input"><Search size={17} /><input autoFocus value={commandQuery} onChange={(event) => setCommandQuery(event.target.value)} placeholder="Search commands…" /><kbd>Esc</kbd></div>
            <div className="command-list">
              {commandItems.filter((item) => item.label.toLowerCase().includes(commandQuery.toLowerCase())).map((item) => (
                <button key={item.label} onClick={() => { item.action(); setCommandOpen(false); }}><span className="command-icon">{item.icon}</span><span className="command-copy"><strong>{item.label}</strong>{item.hint && <small>{item.hint}</small>}</span><ChevronRight size={14} /></button>
              ))}
            </div>
          </div>
        </div>
      )}

      {settingsOpen && (
        <div className="hanchi-overlay" onMouseDown={() => setSettingsOpen(false)}>
          <div className="hanchi-settings-pop" onMouseDown={(event) => event.stopPropagation()}>
            <div className="settings-head"><div><h2>Hanchi settings</h2><p>Personal workspace controls</p></div><button className="hanchi-icon-button" onClick={() => setSettingsOpen(false)}><X size={17} /></button></div>
            <div className="settings-section"><span>Workspace</span><button onClick={() => { setRightTab("memory"); setRightOpen(true); setSettingsOpen(false); }}><Brain size={15} />Memory & context<ChevronRight size={14} /></button><button onClick={() => navigate("/projects")}><FolderKanban size={15} />Projects<ChevronRight size={14} /></button><button onClick={() => navigate("/artifacts")}><FileCode2 size={15} />Files & artifacts<ChevronRight size={14} /></button></div>
            <div className="settings-section"><span>Connections</span>{connectors.slice(0,5).map((item) => <div className="settings-connector" key={item.id}><span>{item.display_name}</span><em className={item.status === "connected" ? "connected" : "disconnected"}>{item.status}</em></div>)}</div>
            <div className="settings-section"><span>Appearance</span><button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>{theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}{theme === "dark" ? "Light theme" : "Dark theme"}<small>Use your preferred workspace mode</small></button><button><Archive size={15} />Density<small>Optimised for desktop</small></button></div>
            <div className="settings-foot"><ShieldCheck size={14} />Only Joshua can access this workspace.</div>
          </div>
        </div>
      )}
    </div>
  );
}
