import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Archive, ArrowLeft, ArrowRight, ArrowUp, BookOpen, Bot, Brain, ChevronDown, ChevronRight, CircleHelp,
  Copy, Download, File, FileCode2, FileImage, FileText, Folder, FolderOpen, GitBranch, Github, Globe,
  ImageIcon, Library, Loader2, Menu, MessageSquare, Mic, MoreHorizontal, PanelLeft, PanelRight,
  Paperclip, Pencil, Plus, RefreshCw, Search, Settings2, Share2, Sparkles, ThumbsDown, ThumbsUp,
  Trash2, Upload, Volume2, WandSparkles, X, Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { artifactFromCodeBlock, downloadTextFile, edgeRequest, extractCodeArtifacts, streamChat, type HanchiArtifact, type HanchiMessage } from '@/lib/hanchi-ui';

type Row = Record<string, any>;
type View = 'chat' | 'images' | 'library' | 'plugins' | 'projects' | 'brain' | 'morning';
type SettingsTab = 'general' | 'personalization' | 'plugins' | 'connections';
type ArtifactTab = 'preview' | 'source';
type Attachment = { name:string; kind:string; size?:number; text?:string; base64?:string; mime?:string; url?:string };
const db = supabase as any;

function initials(name='Joshua Omoniyi'){ return name.split(' ').filter(Boolean).slice(0,2).map((x)=>x[0]?.toUpperCase()).join(''); }
function safeText(v:any){ return typeof v==='string' ? v : ''; }
function iconForFile(name=''){ const n=name.toLowerCase(); if(n.endsWith('.pdf')) return <FileText/>; if(/\.(png|jpg|jpeg|webp|gif|svg)$/.test(n)) return <FileImage/>; if(/\.(ts|tsx|js|jsx|html|css|json|sql|py)$/.test(n)) return <FileCode2/>; return <File/>; }

export default function Index(){
  const navigate=useNavigate();
  const [user,setUser]=useState<any>(null);
  const [view,setView]=useState<View>('chat');
  const [sidebar,setSidebar]=useState(true);
  const [rightOpen,setRightOpen]=useState(false);
  const [rightTab,setRightTab]=useState<'canvas'|'memory'|'activity'>('canvas');
  const [settingsOpen,setSettingsOpen]=useState(false);
  const [settingsTab,setSettingsTab]=useState<SettingsTab>('general');
  const [profileOpen,setProfileOpen]=useState(false);
  const [composeMenu,setComposeMenu]=useState(false);
  const [modelMenu,setModelMenu]=useState(false);
  const [effortMenu,setEffortMenu]=useState(false);
  const [globalSearchOpen,setGlobalSearchOpen]=useState(false);
  const [globalQuery,setGlobalQuery]=useState('');
  const [messages,setMessages]=useState<HanchiMessage[]>([]);
  const [conversations,setConversations]=useState<Row[]>([]);
  const [projects,setProjects]=useState<Row[]>([]);
  const [brain,setBrain]=useState<Row[]>([]);
  const [skills,setSkills]=useState<Row[]>([]);
  const [connectors,setConnectors]=useState<Row[]>([]);
  const [briefing,setBriefing]=useState<Row|null>(null);
  const [input,setInput]=useState('');
  const [busy,setBusy]=useState(false);
  const [processing,setProcessing]=useState(false);
  const [status,setStatus]=useState('');
  const [conversationId,setConversationId]=useState<string|null>(null);
  const [selectedModel,setSelectedModel]=useState('auto');
  const [effort,setEffort]=useState('standard');
  const [mode,setMode]=useState<'chat'|'research'|'council'>('chat');
  const [attachments,setAttachments]=useState<Attachment[]>([]);
  const [canvas,setCanvas]=useState<HanchiArtifact|null>(null);
  const [artifactTab,setArtifactTab]=useState<ArtifactTab>('preview');
  const [library,setLibrary]=useState<Row[]>([]);
  const [libraryQuery,setLibraryQuery]=useState('');
  const [imagePrompt,setImagePrompt]=useState('');
  const [generatedImages,setGeneratedImages]=useState<Row[]>([]);
  const [lastError,setLastError]=useState<string|null>(null);
  const fileRef=useRef<HTMLInputElement>(null);
  const textareaRef=useRef<HTMLTextAreaElement>(null);
  const scrollRef=useRef<HTMLDivElement>(null);

  const refresh=useCallback(async(uid:string)=>{
    const [c,p,b,s,k,br,a] = await Promise.all([
      db.from('conversations').select('id,title,updated_at,pinned').eq('user_id',uid).order('pinned',{ascending:false}).order('updated_at',{ascending:false}).limit(100),
      db.from('hanchi_projects').select('id,name,description,updated_at,status').eq('user_id',uid).order('updated_at',{ascending:false}).limit(50),
      db.from('hanchi_knowledge_items').select('id,key,value,category,scope,confidence,updated_at').eq('user_id',uid).eq('status','active').order('updated_at',{ascending:false}).limit(50),
      db.from('hanchi_skills').select('id,name,description,enabled,version').eq('user_id',uid).order('name'),
      db.from('hanchi_connectors').select('id,provider,display_name,status,last_used_at,scopes').eq('user_id',uid).order('display_name'),
      db.from('hanchi_daily_briefings').select('*').eq('user_id',uid).order('briefing_date',{ascending:false}).limit(1).maybeSingle(),
      db.from('hanchi_artifacts').select('id,title,file_name,mime_type,language,content,version,artifact_type,preview_mode,metadata,project_id,conversation_id,updated_at').eq('user_id',uid).order('updated_at',{ascending:false}).limit(100),
    ]);
    setConversations(c.data||[]); setProjects(p.data||[]); setBrain(b.data||[]); setSkills(s.data||[]); setConnectors(k.data||[]); setBriefing(br.data||null); setLibrary(a.data||[]);
  },[]);

  useEffect(()=>{
    let alive=true;
    supabase.auth.getSession().then(({data:{session}})=>{
      if(!alive) return;
      if(!session?.user){ navigate('/auth'); return; }
      setUser(session.user); refresh(session.user.id);
    });
    const {data:sub}=supabase.auth.onAuthStateChange((_e,session)=>{ if(session?.user){setUser(session.user); refresh(session.user.id);} });
    return ()=>{alive=false; sub.subscription.unsubscribe();};
  },[navigate,refresh]);

  useEffect(()=>{
    const onKey=(e:KeyboardEvent)=>{
      const k=e.key.toLowerCase();
      if((e.ctrlKey||e.metaKey)&&k==='k'){e.preventDefault();setGlobalSearchOpen(true);}
      if((e.ctrlKey||e.metaKey)&&k==='b'){e.preventDefault();setSidebar(v=>!v);}
      if((e.ctrlKey||e.metaKey)&&k==='n'){e.preventDefault();newChat();}
      if((e.ctrlKey||e.metaKey)&&e.shiftKey&&k==='l'){e.preventDefault();setRightOpen(v=>!v);}
      if(e.key==='Escape'){setSettingsOpen(false);setProfileOpen(false);setComposeMenu(false);setModelMenu(false);setEffortMenu(false);setGlobalSearchOpen(false);}
    };
    window.addEventListener('keydown',onKey); return ()=>window.removeEventListener('keydown',onKey);
  });
  useEffect(()=>{ const el=scrollRef.current; if(el) el.scrollTop=el.scrollHeight; },[messages,busy]);

  async function loadConversation(id:string){
    setLastError(null); setView('chat'); setConversationId(id);
    const {data,error}=await db.from('messages').select('id,role,content,created_at,metadata').eq('conversation_id',id).order('created_at',{ascending:true});
    if(error){setLastError(error.message);return;} setMessages(data||[]); setCanvas(null); setRightOpen(false);
  }
  function newChat(){setView('chat');setConversationId(null);setMessages([]);setAttachments([]);setCanvas(null);setRightOpen(false);setInput('');setMode('chat');setLastError(null);setTimeout(()=>textareaRef.current?.focus(),0);}
  async function ensureConversation(title:string){
    if(conversationId) return conversationId;
    const {data,error}=await db.from('conversations').insert({user_id:user.id,title:title.slice(0,80)||'New chat',language:'en'}).select('id,title,updated_at,pinned').single();
    if(error) throw error; setConversationId(data.id); setConversations(prev=>[data,...prev]); return data.id;
  }
  async function storeMessage(cid:string,role:'user'|'assistant',content:string,metadata:Row={}){
    const {data,error}=await db.from('messages').insert({conversation_id:cid,role,content,metadata}).select('id,role,content,created_at,metadata').single();
    if(error) throw error; setMessages(prev=>[...prev,data]); return data;
  }
  async function retryFrom(messageId:string){
    if(busy) return;
    const idx=messages.findIndex(m=>m.id===messageId); if(idx<0)return;
    const prevUser=[...messages.slice(0,idx)].reverse().find(m=>m.role==='user'); if(!prevUser)return;
    const history=messages.slice(0,idx);
    // Replace the selected assistant answer instead of creating a second user turn.
    if(messageId && !messageId.startsWith('stream-')){
      await db.from('messages').delete().eq('id',messageId);
    }
    setMessages(history);
    setInput('');
    await sendMessage(prevUser.content,{history,persistUser:false});
  }
  async function branchFrom(messageId:string){
    if(busy) return;
    const idx=messages.findIndex(m=>m.id===messageId); if(idx<0 || !user)return;
    const seed=messages.slice(0,idx+1);
    const title=(safeText([...seed].reverse().find(m=>m.role==='user')?.content)||'Branched chat').slice(0,72);
    const branchTitle=`${title} — Branch`;
    const {data:conversation,error:conversationError}=await db.from('conversations').insert({user_id:user.id,title:branchTitle,language:'en'}).select('id,title,updated_at,pinned').single();
    if(conversationError) { setLastError(conversationError.message); return; }
    const payload=seed.map(m=>({conversation_id:conversation.id,role:m.role,content:m.content,metadata:{...(m.metadata||{}),branched:true}}));
    const {data:copied,error:copyError}=await db.from('messages').insert(payload).select('id,role,content,created_at,metadata');
    if(copyError){ setLastError(copyError.message); return; }
    setConversationId(conversation.id);
    setMessages(copied||seed);
    setConversations(prev=>[conversation,...prev]);
    setView('chat');
    setRightOpen(false);
  }
  async function sendMessage(custom?:string, options:{history?:HanchiMessage[];persistUser?:boolean}={}){
    const raw=(custom??input).trim(); if(!raw||busy||!user)return;
    setLastError(null);
    const cid=await ensureConversation(raw);
    setInput('');
    setBusy(true);
    const attachedImages=attachments.filter(a=>a.kind==='image'&&a.base64).map(a=>a.base64 as string);
    const transcript=attachments.filter(a=>a.text).map(a=>`[${a.name}]\n${a.text}`).join('\n\n');
    const prompt=transcript?`${raw}\n\n${transcript}`:raw;
    const persistUser=options.persistUser!==false;
    const sourceHistory=options.history ?? messages.filter(m=>m.role!=='system');
    try{
      if(persistUser){
        await storeMessage(cid,'user',prompt,{mode,attachments:attachments.map(a=>({name:a.name,kind:a.kind,size:a.size}))});
      }
      const history=(persistUser ? [...sourceHistory,{role:'user',content:prompt}] : sourceHistory).map(m=>({role:m.role,content:m.content}));
      setAttachments([]);
      if(mode==='research'){
        setStatus('Researching and collecting evidence…');
        const r=await edgeRequest<any>('hanchi-research',{method:'POST',body:JSON.stringify({query:prompt,conversationId:cid})});
        const report=[r.summary?`## Research Summary\n\n${r.summary}`:'',Array.isArray(r.findings)&&r.findings.length?`## Findings\n\n${r.findings.map((x:any)=>`### ${x.title||'Finding'}\n${x.claim||''}\n\n${x.evidence||''}`).join('\n\n')}`:'',Array.isArray(r.sources)&&r.sources.length?`## Sources\n\n${r.sources.map((x:any)=>`- [${x.title||x.url}](${x.url})`).join('\n')}`:''].filter(Boolean).join('\n\n');
        await storeMessage(cid,'assistant',report||'No research report was returned.',{mode:'research',sources:r.sources||[],self_check:r.self_check});
        setMetadataForRight({mode:'research',sources:r.sources||[]});
        if(report) openArtifact(artifactFromCodeBlock('markdown',report,'Research Report'));
        return;
      }
      if(mode==='council'){
        setStatus('Council is comparing candidate models…');
        const r=await edgeRequest<any>('hanchi-council',{method:'POST',body:JSON.stringify({messages:history,conversationId:cid,effort})});
        await storeMessage(cid,'assistant',r.text||'No council response was returned.',{mode:'council',provider:r.provider,model:r.model,candidates:r.candidates,self_check:r.self_check});
        const art=extractCodeArtifacts(r.text||'')[0]; if(art){const saved=await saveArtifact(artifactFromCodeBlock(art.language,art.content),cid);openArtifact(saved);} return;
      }
      setStatus(''); let answer=''; let md:any=null; const streamId='stream-'+Date.now();
      setMessages(prev=>[...prev,{id:streamId,role:'assistant',content:'',created_at:new Date().toISOString()}]);
      await streamChat({messages:history,model:selectedModel==='auto'?undefined:selectedModel,effort,projectId:null,language:'en',tone:'default',searchWeb:/\b(search|latest|today|current|research)\b/i.test(prompt),images:attachedImages},(chunk)=>{answer+=chunk;setMessages(prev=>prev.map(m=>m.id===streamId?{...m,content:answer}:m));},(meta)=>md=meta);
      const savedMsg=await storeMessage(cid,'assistant',answer,{...(md||{}),mode:'chat'});
      setMessages(prev=>prev.filter(m=>m.id!==streamId&&m.id!==savedMsg.id).concat(savedMsg));
      const art=extractCodeArtifacts(answer)[0]; if(art){const saved=await saveArtifact(artifactFromCodeBlock(art.language,art.content),cid);openArtifact(saved);} 
      setConversations(prev=>prev.map(x=>x.id===cid?{...x,updated_at:new Date().toISOString()}:x));
    }catch(e:any){
      const msg=e instanceof Error?e.message:'Something went wrong.'; setLastError(msg);
      setMessages(prev=>prev.filter(m=>!String(m.id).startsWith('stream-')));
      try{await storeMessage(cid,'assistant',`I hit an error: ${msg}`,{error:true});}catch{}
    }finally{setBusy(false);setStatus('');}
  }
  async function saveArtifact(a:HanchiArtifact,cid:string){
    try{const r=await edgeRequest<any>('hanchi-artifact',{method:'POST',body:JSON.stringify({action:'create',conversationId:cid,title:a.title,fileName:a.file_name,mimeType:a.mime_type,language:a.language,content:a.content,artifactType:a.artifact_type,previewMode:a.preview_mode})});return r?.artifact||a;}catch{return a;}
  }
  function openArtifact(a:HanchiArtifact){setCanvas(a);setArtifactTab('preview');setRightTab('canvas');setRightOpen(true);}
  function setMetadataForRight(_x:any){setRightTab('activity');setRightOpen(true);}

  async function handleFile(file:File){
    if(processing)return; setProcessing(true); setLastError(null);
    try{
      const lower=file.name.toLowerCase();
      if(file.type==='application/pdf'||lower.endsWith('.pdf')){const url=URL.createObjectURL(file);setAttachments(p=>[...p,{name:file.name,kind:'file',size:file.size,url}]);openArtifact({id:'local-pdf-'+Date.now(),title:file.name,file_name:file.name,mime_type:'application/pdf',content:'',version:1,artifact_type:'uploaded',preview_mode:'pdf',metadata:{objectUrl:url}});return;}
      if(file.type.startsWith('image/')){
        const bytes=new Uint8Array(await file.arrayBuffer()); let bin=''; for(let i=0;i<bytes.length;i+=0x8000)bin+=String.fromCharCode(...bytes.subarray(i,Math.min(i+0x8000,bytes.length))); const base64=btoa(bin);
        const fd=new FormData();fd.append('action','ocr');fd.append('file',file);const r=await edgeRequest<any>('process-media',{method:'POST',body:fd}); setAttachments(p=>[...p,{name:file.name,kind:'image',size:file.size,text:r.text,base64,mime:file.type}]); setInput(v=>v||'Read this image and tell me what matters.');return;
      }
      const fd=new FormData();fd.append('action','transcribe');fd.append('file',file);const r=await edgeRequest<any>('process-media',{method:'POST',body:fd});setAttachments(p=>[...p,{name:file.name,kind:r.type||'file',size:file.size,text:r.text||r.extractedText||''}]);
      if(r.text||r.extractedText)setInput(v=>v||'Turn this into useful notes and next actions.');
    }catch(e:any){setLastError(e instanceof Error?e.message:'Could not process the file.');}
    finally{setProcessing(false);if(fileRef.current)fileRef.current.value='';}
  }
  async function voiceDictate(){
    try{
      const Speech=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition; if(!Speech) {setLastError('Browser dictation is not available here. Use the microphone or upload an audio file.');return;}
      const rec=new Speech();rec.lang='en-NG';rec.interimResults=false;rec.maxAlternatives=1;rec.onresult=(e:any)=>setInput(v=>`${v}${v?' ':''}${e.results[0][0].transcript}`);rec.onerror=()=>setLastError('Voice dictation failed.');rec.start();
    }catch{setLastError('Voice dictation could not start.');}
  }
  async function generateImage(){
    const p=imagePrompt.trim();if(!p)return; setGeneratedImages(x=>[{id:Date.now(),title:p,status:'queued',created_at:new Date().toISOString()},...x]); setImagePrompt(''); setStatus('Image generation is not wired to a live image provider yet.'); setTimeout(()=>setStatus(''),3000);
  }
  async function signOut(){await supabase.auth.signOut();navigate('/auth');}

  const filteredChats=useMemo(()=>conversations.filter(c=>safeText(c.title).toLowerCase().includes(globalQuery.toLowerCase())),[conversations,globalQuery]);
  const filteredLibrary=useMemo(()=>library.filter(x=>safeText(x.title||x.file_name).toLowerCase().includes(libraryQuery.toLowerCase())),[library,libraryQuery]);

  if(!user)return <div className="hanchi-loading"><Loader2 className="spin" size={20}/><span>Loading Hanchi</span></div>;

  return <div className="hanchi-app">
    <aside className={`hanchi-sidebar ${sidebar?'':'is-collapsed'}`}>
      <div className="sidebar-brand-row"><button className="brand" onClick={newChat}><span className="brand-mark">H</span><span>Hanchi</span></button><button className="icon-btn" onClick={()=>setSidebar(v=>!v)} title="Collapse sidebar"><PanelLeft size={17}/></button></div>
      {sidebar&&<>
        <div className="sidebar-actions"><button className="nav-row strong" onClick={newChat}><Plus size={17}/> <span>New chat</span><kbd>Ctrl N</kbd></button><button className="nav-row" onClick={()=>setGlobalSearchOpen(true)}><Search size={16}/><span>Search chats</span><kbd>Ctrl K</kbd></button></div>
        <nav className="sidebar-scroll">
          <div className="nav-group"><div className="nav-label">Workspace</div>
            <button className={`nav-row ${view==='chat'?'active':''}`} onClick={()=>setView('chat')}><MessageSquare size={16}/><span>Chat</span></button>
            <button className={`nav-row ${view==='images'?'active':''}`} onClick={()=>setView('images')}><ImageIcon size={16}/><span>Images</span></button>
            <button className={`nav-row ${view==='library'?'active':''}`} onClick={()=>setView('library')}><Library size={16}/><span>Library</span></button>
            <button className={`nav-row ${view==='projects'?'active':''}`} onClick={()=>setView('projects')}><FolderOpen size={16}/><span>Projects</span></button>
          </div>
          <div className="nav-group"><div className="nav-label">System</div>
            <button className={`nav-row ${view==='brain'?'active':''}`} onClick={()=>setView('brain')}><Brain size={16}/><span>Brain</span><span className="nav-count">{brain.length||''}</span></button>
            <button className={`nav-row ${view==='plugins'?'active':''}`} onClick={()=>setView('plugins')}><WandSparkles size={16}/><span>Plugins</span></button>
            <button className={`nav-row ${view==='morning'?'active':''}`} onClick={()=>setView('morning')}><Zap size={16}/><span>Morning</span></button>
          </div>
          <div className="nav-group recent"><div className="nav-label">Recent</div>{conversations.slice(0,18).map(c=><button key={c.id} className={`chat-row ${c.id===conversationId?'active':''}`} onClick={()=>loadConversation(c.id)}><span>{safeText(c.title)||'New chat'}</span></button>)}</div>
        </nav>
        <div className="sidebar-bottom"><button className="profile-row" onClick={()=>setProfileOpen(v=>!v)}><span className="avatar">{initials()}</span><span className="profile-copy"><b>{user.user_metadata?.full_name||'Joshua Omoniyi'}</b><small>Private workspace</small></span><MoreHorizontal size={16}/></button>{profileOpen&&<div className="profile-pop">
          <button onClick={()=>{setProfileOpen(false);setSettingsTab('general');setSettingsOpen(true)}}><Settings2 size={16}/>Settings</button><button onClick={()=>{setProfileOpen(false);setSettingsTab('personalization');setSettingsOpen(true)}}><Sparkles size={16}/>Personalization</button><button onClick={()=>{setProfileOpen(false);setView('plugins')}}><WandSparkles size={16}/>Plugins</button><button onClick={signOut}><ArrowRight size={16}/>Sign out</button>
        </div>}</div>
      </>}
    </aside>

    <main className="hanchi-main">
      <header className="topbar"><div className="topbar-left"><button className="icon-btn mobile-only" onClick={()=>setSidebar(v=>!v)}><Menu size={18}/></button><div className="crumbs"><span>{view==='chat'?'Chat':view[0].toUpperCase()+view.slice(1)}</span>{conversationId&&view==='chat'&&<><ChevronRight size={13}/><span className="muted">{conversations.find(x=>x.id===conversationId)?.title||'Conversation'}</span></>}</div></div><div className="topbar-right"><button className="top-pill" onClick={()=>setModelMenu(v=>!v)}><Bot size={14}/><span>{selectedModel==='auto'?'Auto':selectedModel}</span><ChevronDown size={13}/></button><button className="top-pill" onClick={()=>setRightOpen(v=>!v)}><PanelRight size={14}/><span>Context</span></button><button className="icon-btn" onClick={()=>{setSettingsTab('general');setSettingsOpen(true)}}><Settings2 size={17}/></button></div></header>
      {modelMenu&&<div className="floating-menu model-menu"><button onClick={()=>{setSelectedModel('auto');setModelMenu(false)}}><span>Auto</span><small>Route by capability</small></button><button onClick={()=>{setSelectedModel('gemini-flash');setModelMenu(false)}}><span>Gemini Flash</span><small>Fast everyday chat</small></button><button onClick={()=>{setSelectedModel('qwen-coder');setModelMenu(false)}}><span>Qwen Coder</span><small>Code-heavy work</small></button><button onClick={()=>{setSelectedModel('deepseek-chat');setModelMenu(false)}}><span>DeepSeek Chat</span><small>Long reasoning</small></button></div>}

      <section className="workbench">
        {view==='chat'&&<div className="chat-stage"><div ref={scrollRef} className="chat-scroll">
          {messages.length===0?<div className="welcome"><div className="welcome-mark">H</div><h1>What are we building?</h1><p>One private workspace. Chats, projects, files, memory and tools in one place.</p><div className="starter-grid"><button onClick={()=>setInput('Research this properly and cite the strongest sources.') }><Search/><span><b>Research</b><small>Find evidence and turn it into a clear answer.</small></span></button><button onClick={()=>setInput('Help me build this feature and show the code.') }><FileCode2/><span><b>Build</b><small>Code, debug and open the result in Canvas.</small></span></button><button onClick={()=>setInput('Read this file and give me the important points.') }><File/><span><b>Work with a file</b><small>Upload a document, image or audio.</small></span></button><button onClick={()=>setInput('Remember the high-signal context from this chat.') }><Brain/><span><b>Use Brain</b><small>Pull in saved personal context.</small></span></button></div></div>:<div className="thread">{messages.map((m,i)=><Message key={m.id||i} msg={m} onCopy={()=>navigator.clipboard.writeText(m.content)} onRetry={m.role==='assistant'?()=>retryFrom(m.id):undefined} onBranch={m.role==='assistant'?()=>branchFrom(m.id):undefined} onSpeak={m.role==='assistant'?()=>window.speechSynthesis?.speak(new SpeechSynthesisUtterance(m.content)):undefined}/>)}</div>}
          {busy&&<div className="thinking-row"><span className="thinking-dot"></span><span>{status||'Hanchi is thinking'}</span></div>}
        </div>
        {lastError&&<div className="error-strip"><span>{lastError}</span><button onClick={()=>setLastError(null)}><X size={15}/></button></div>}
        <Composer input={input} setInput={setInput} send={()=>sendMessage()} busy={busy} processing={processing} onUpload={()=>fileRef.current?.click()} onDictate={voiceDictate} menuOpen={composeMenu} setMenuOpen={setComposeMenu} mode={mode} setMode={setMode} effort={effort} setEffort={setEffort} effortMenu={effortMenu} setEffortMenu={setEffortMenu}/>
        <input ref={fileRef} type="file" className="hidden" multiple accept="image/*,audio/*,video/*,text/plain,text/markdown,application/pdf" onChange={e=>{Array.from(e.target.files||[]).forEach(handleFile)}}/>
        </div>}

        {view==='images'&&<ImagesView prompt={imagePrompt} setPrompt={setImagePrompt} generate={generateImage} generated={generatedImages}/>} 
        {view==='library'&&<LibraryView items={filteredLibrary} query={libraryQuery} setQuery={setLibraryQuery} onOpen={a=>openArtifact(a)}/>} 
        {view==='projects'&&<ProjectsView projects={projects}/>} 
        {view==='brain'&&<BrainView brain={brain}/>} 
        {view==='plugins'&&<PluginsView skills={skills} connectors={connectors}/>} 
        {view==='morning'&&<MorningView briefing={briefing}/>} 
        {rightOpen&&<RightPanel tab={rightTab} setTab={setRightTab} canvas={canvas} artifactTab={artifactTab} setArtifactTab={setArtifactTab} brain={brain} connectors={connectors} onClose={()=>setRightOpen(false)}/>} 
      </section>
    </main>

    {settingsOpen&&<SettingsModal tab={settingsTab} setTab={setSettingsTab} connectors={connectors} onClose={()=>setSettingsOpen(false)}/>}
    {globalSearchOpen&&<div className="overlay" onMouseDown={()=>setGlobalSearchOpen(false)}><div className="search-dialog" onMouseDown={e=>e.stopPropagation()}><div className="search-head"><Search size={18}/><input autoFocus value={globalQuery} onChange={e=>setGlobalQuery(e.target.value)} placeholder="Search chats"/><kbd>Esc</kbd></div><div className="search-results">{filteredChats.slice(0,30).map(c=><button key={c.id} onClick={()=>{loadConversation(c.id);setGlobalSearchOpen(false)}}><MessageSquare size={15}/><span>{safeText(c.title)}</span><small>{new Date(c.updated_at).toLocaleDateString('en-GB')}</small></button>)}{!filteredChats.length&&<div className="empty-state">No chats found.</div>}</div></div></div>}
  </div>
}

function Message({msg,onCopy,onRetry,onBranch,onSpeak}:{msg:HanchiMessage;onCopy:()=>void;onRetry?:()=>void;onBranch?:()=>void;onSpeak?:()=>void;key?:string|number}){
  const user=msg.role==='user'; const error=!!msg.metadata?.error;
  return <div className={`message-row ${user?'user':'assistant'}`}><div className="message-rail"><div className="message-avatar">{user?'JO':'H'}</div><div className="message-main"><div className="message-head"><b>{user?'You':'Hanchi'}</b><span>{msg.created_at?new Date(msg.created_at).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}):''}</span></div><div className={`message-content ${error?'message-error':''}`}><ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown></div>{!user&&<div className="message-actions"><button onClick={onCopy} title="Copy"><Copy size={15}/></button>{onSpeak&&<button onClick={onSpeak} title="Read aloud"><Volume2 size={15}/></button>}<button title="Good response"><ThumbsUp size={15}/></button><button title="Poor response"><ThumbsDown size={15}/></button>{onRetry&&<button onClick={onRetry} title="Retry"><RefreshCw size={15}/></button>}{onBranch&&<button onClick={onBranch} title="Branch chat"><GitBranch size={15}/></button>}<button title="Share"><Share2 size={15}/></button><button title="More"><MoreHorizontal size={15}/></button></div>}</div></div></div>
}

function Composer(p:{input:string;setInput:(s:string)=>void;send:()=>void;busy:boolean;processing:boolean;onUpload:()=>void;onDictate:()=>void;menuOpen:boolean;setMenuOpen:(v:boolean)=>void;mode:'chat'|'research'|'council';setMode:(v:any)=>void;effort:string;setEffort:(s:string)=>void;effortMenu:boolean;setEffortMenu:(v:boolean)=>void}){
  const {input,setInput,send,busy,processing,onUpload,onDictate,menuOpen,setMenuOpen,mode,setMode,effort,setEffort,effortMenu,setEffortMenu}=p;
  return <div className="composer-wrap"><div className="composer"><div className="composer-tools"><div className="relative"><button className={`composer-btn ${menuOpen?'selected':''}`} onClick={()=>setMenuOpen(!menuOpen)} title="Add"><Plus size={19}/></button>{menuOpen&&<div className="floating-menu attach-menu"><button onClick={onUpload}><Upload size={16}/><span>Upload photos & files</span></button><button onClick={()=>setMode('research')}><Search size={16}/><span>Research mode</span></button><button onClick={()=>setMode('council')}><Bot size={16}/><span>Council mode</span></button><button onClick={()=>setMode('chat')}><MessageSquare size={16}/><span>Normal chat</span></button><button><Github size={16}/><span>GitHub</span></button><button><BookOpen size={16}/><span>Notion</span></button></div>}</div><div className="composer-spacer"></div><div className="relative"><button className="mode-btn" onClick={()=>setEffortMenu(!effortMenu)}><span>{effort==='standard'?'Think':effort}</span><ChevronDown size={13}/></button>{effortMenu&&<div className="floating-menu effort-menu"><button onClick={()=>{setEffort('fast');setEffortMenu(false)}}>Fast</button><button onClick={()=>{setEffort('standard');setEffortMenu(false)}}>Standard</button><button onClick={()=>{setEffort('deep');setEffortMenu(false)}}>Deep</button></div>}</div></div><textarea ref={(el)=>el&&el.setAttribute('data-composer','1')} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}} placeholder={mode==='research'?'Ask Hanchi to research…':mode==='council'?'Ask the council…':'Ask Hanchi anything…'} rows={1}/><div className="composer-bottom"><div className="composer-status">{processing?<span>Processing file…</span>:mode!=='chat'?<span className="mode-tag">{mode}</span>:<span>Private workspace</span>}</div><div className="composer-actions"><button className="composer-btn" onClick={onDictate} title="Dictate"><Mic size={18}/></button><button className={`send-btn ${!input.trim()||busy?'disabled':''}`} onClick={send} disabled={!input.trim()||busy} title="Send"><ArrowUp size={18}/></button></div></div></div></div>
}

function ImagesView({prompt,setPrompt,generate,generated}:{prompt:string;setPrompt:(s:string)=>void;generate:()=>void;generated:Row[]}){return <div className="page"><div className="page-head"><div><div className="eyebrow">Create</div><h1>Images</h1><p>Generate and organise visual work in the same workspace.</p></div></div><div className="image-composer"><button className="icon-btn"><Plus size={18}/></button><input value={prompt} onChange={e=>setPrompt(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')generate()}} placeholder="Describe an image or wallpaper…"/><button className="primary-icon" onClick={generate}><Sparkles size={18}/></button></div><div className="section-title"><span>Recent creations</span><span className="muted">{generated.length} items</span></div><div className="image-grid">{generated.map(x=><div className="image-card" key={x.id}><div className="image-placeholder"><Sparkles size={24}/></div><div className="image-card-copy"><b>{x.title}</b><span>{x.status}</span></div></div>)}{!generated.length&&<div className="empty-card"><ImageIcon size={26}/><b>No generated images yet</b><span>Start with the prompt above.</span></div>}</div></div>}
function LibraryView({items,query,setQuery,onOpen}:{items:Row[];query:string;setQuery:(s:string)=>void;onOpen:(a:any)=>void}){return <div className="page"><div className="page-head library-head"><div><div className="eyebrow">Workspace files</div><h1>Library</h1><p>Every saved artifact and uploaded document, searchable from one place.</p></div><button className="outline-btn"><Upload size={16}/>Upload</button></div><div className="library-toolbar"><div className="search-box"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search library"/></div><button className="outline-btn"><Folder size={16}/>Folders</button><button className="outline-btn"><MoreHorizontal size={16}/></button></div><div className="library-table"><div className="library-row library-row-head"><span>Name</span><span>Type</span><span>Updated</span></div>{items.map(x=><button className="library-row" key={x.id} onClick={()=>onOpen(x)}><span className="file-name">{iconForFile(x.file_name||x.title)}<span>{x.file_name||x.title}</span></span><span>{x.mime_type||'file'}</span><span>{x.updated_at?new Date(x.updated_at).toLocaleDateString('en-GB'):''}</span></button>)}{!items.length&&<div className="empty-card"><Library size={25}/><b>Nothing saved yet</b><span>Generated artifacts will appear here.</span></div>}</div></div>}
function ProjectsView({projects}:{projects:Row[]}){return <div className="page"><div className="page-head"><div><div className="eyebrow">Workspaces</div><h1>Projects</h1><p>Keep instructions, chats and artifacts together.</p></div><button className="primary-btn"><Plus size={16}/>New project</button></div><div className="card-grid">{projects.map(p=><div className="project-card" key={p.id}><div className="project-icon"><Folder size={18}/></div><b>{p.name}</b><span>{p.description||'Private project workspace'}</span><small>{p.status||'active'}</small></div>)}{!projects.length&&<div className="empty-card"><FolderOpen size={25}/><b>No projects yet</b><span>Create one from your Project workspace.</span></div>}</div></div>}
function BrainView({brain}:{brain:Row[]}){return <div className="page"><div className="page-head"><div><div className="eyebrow">Personal context</div><h1>Brain</h1><p>High-signal memory Hanchi can use while working.</p></div><button className="outline-btn"><Pencil size={15}/>Manage</button></div><div className="memory-grid">{brain.map(x=><div className="memory-card" key={x.id}><div className="memory-meta"><span>{x.category||'memory'}</span><span>{x.confidence?`${x.confidence}%`:''}</span></div><b>{x.key}</b><p>{typeof x.value==='string'?x.value:JSON.stringify(x.value)}</p></div>)}{!brain.length&&<div className="empty-card"><Brain size={25}/><b>Brain is empty</b><span>High-signal context will appear here.</span></div>}</div></div>}
function PluginsView({skills,connectors}:{skills:Row[];connectors:Row[]}){return <div className="page"><div className="page-head"><div><div className="eyebrow">Tools</div><h1>Plugins</h1><p>Skills and connected tools available to your private workspace.</p></div></div><div className="two-col"><div className="panel"><div className="panel-head"><b>Skills</b><span>{skills.length}</span></div>{skills.map(s=><div className="plugin-row" key={s.id}><span className="tool-icon"><Sparkles size={15}/></span><div><b>{s.name}</b><small>{s.description||'Instruction pack'}</small></div><span className={s.enabled?'status on':'status'}>{s.enabled?'Enabled':'Off'}</span></div>)}</div><div className="panel"><div className="panel-head"><b>Connectors</b><span>{connectors.length}</span></div>{connectors.map(c=><div className="plugin-row" key={c.id}><span className="tool-icon"><WandSparkles size={15}/></span><div><b>{c.display_name||c.provider}</b><small>{c.scopes||'Connector'}</small></div><span className={c.status==='connected'?'status on':'status'}>{c.status||'unknown'}</span></div>)}</div></div></div>}
function MorningView({briefing}:{briefing:Row|null}){return <div className="page"><div className="page-head"><div><div className="eyebrow">Daily briefing</div><h1>Morning</h1><p>Your compact start-of-day briefing.</p></div></div><div className="morning-grid"><div className="morning-card hero"><span>Word of the day</span><b>{briefing?.word_of_day||'Clarity'}</b><small>{briefing?.note||'No briefing has been generated yet.'}</small></div><div className="morning-card"><span>Bible reference</span><b>{briefing?.bible_reference||'—'}</b><small>{briefing?.bible_text||'—'}</small></div><div className="morning-card"><span>Priorities</span><b>{briefing?.priorities?JSON.stringify(briefing.priorities):'—'}</b></div></div></div>}
function RightPanel({tab,setTab,canvas,artifactTab,setArtifactTab,brain,connectors,onClose}:{tab:'canvas'|'memory'|'activity';setTab:(t:any)=>void;canvas:HanchiArtifact|null;artifactTab:ArtifactTab;setArtifactTab:(t:ArtifactTab)=>void;brain:Row[];connectors:Row[];onClose:()=>void}){return <aside className="right-panel"><div className="right-tabs"><button className={tab==='canvas'?'active':''} onClick={()=>setTab('canvas')}><PanelRight size={14}/>Canvas</button><button className={tab==='memory'?'active':''} onClick={()=>setTab('memory')}><Brain size={14}/>Memory</button><button className={tab==='activity'?'active':''} onClick={()=>setTab('activity')}><Zap size={14}/>Activity</button><button className="icon-btn" onClick={onClose}><X size={15}/></button></div>{tab==='canvas'&&<div className="canvas-panel">{canvas?<><div className="canvas-head"><div><b>{canvas.title}</b><small>{canvas.file_name}</small></div><div className="canvas-actions"><button onClick={()=>setArtifactTab('preview')} className={artifactTab==='preview'?'active':''}>Preview</button><button onClick={()=>setArtifactTab('source')} className={artifactTab==='source'?'active':''}>Source</button><button onClick={()=>downloadTextFile(canvas.file_name,canvas.content,canvas.mime_type)}><Download size={14}/></button></div></div>{artifactTab==='preview'?(canvas.preview_mode==='html'?<iframe className="artifact-frame" title={canvas.title} sandbox="allow-scripts" srcDoc={canvas.content}/>:canvas.preview_mode==='pdf'&&canvas.metadata?.objectUrl?<iframe className="artifact-frame" title={canvas.title} src={String(canvas.metadata.objectUrl)}/>:<div className="artifact-doc"><ReactMarkdown remarkPlugins={[remarkGfm]}>{canvas.content}</ReactMarkdown></div>):<pre className="artifact-source"><code>{canvas.content}</code></pre>}</>:<div className="right-empty"><PanelRight size={28}/><b>Canvas is ready</b><span>Generated code, reports and previews will appear here.</span></div>}</div>}{tab==='memory'&&<div className="right-list"><h3>High-signal memory</h3>{brain.slice(0,20).map(x=><div className="memory-card" key={x.id}><div className="memory-meta"><span>{x.category||'memory'}</span><span>{x.confidence?`${x.confidence}%`:''}</span></div><b>{x.key}</b><p>{typeof x.value==='string'?x.value:JSON.stringify(x.value)}</p></div>)}</div>}{tab==='activity'&&<div className="right-list"><h3>System state</h3><div className="activity-card"><Zap size={15}/><div><b>Connectors</b><p>{connectors.length} configured</p></div></div><div className="activity-card"><Brain size={15}/><div><b>Brain</b><p>{brain.length} active entries</p></div></div></div>}</aside>}
function SettingsModal({tab,setTab,connectors,onClose}:{tab:SettingsTab;setTab:(t:SettingsTab)=>void;connectors:Row[];onClose:()=>void}){return <div className="overlay" onMouseDown={onClose}><div className="settings-modal" onMouseDown={e=>e.stopPropagation()}><div className="settings-sidebar"><div className="settings-title">Settings</div>{(['general','personalization','plugins','connections'] as SettingsTab[]).map(t=><button key={t} className={tab===t?'active':''} onClick={()=>setTab(t)}>{t==='general'?<Settings2 size={16}/>:t==='personalization'?<Sparkles size={16}/>:t==='plugins'?<WandSparkles size={16}/>:<Globe size={16}/>}<span>{t[0].toUpperCase()+t.slice(1)}</span></button>)}</div><div className="settings-main"><div className="settings-main-head"><div><b>{tab[0].toUpperCase()+tab.slice(1)}</b><span>Hanchi private workspace controls</span></div><button className="icon-btn" onClick={onClose}><X size={17}/></button></div>{tab==='general'&&<div className="settings-stack"><label>Appearance<select defaultValue="system"><option>system</option><option>light</option><option>dark</option></select></label><label>Language<select defaultValue="English"><option>English</option><option>Yoruba</option></select></label><label className="toggle-line"><span><b>Browser dictation</b><small>Use your browser microphone for quick notes.</small></span><input type="checkbox" defaultChecked/></label></div>}{tab==='personalization'&&<div className="settings-stack"><label>Base style<textarea defaultValue={'Thoughtful, warm and playful. Nigerian Standard English. Be direct and check your work.'}/></label><label className="toggle-line"><span><b>Self-check</b><small>Ask Hanchi to sanity-check answers before returning them.</small></span><input type="checkbox" defaultChecked/></label></div>}{tab==='plugins'&&<div className="settings-stack">{connectors.map(c=><div className="setting-row" key={c.id}><span className="tool-icon"><WandSparkles size={15}/></span><div><b>{c.display_name||c.provider}</b><small>{c.status||'unknown'}</small></div><button className="outline-btn">Manage</button></div>)}</div>}{tab==='connections'&&<div className="settings-stack"><div className="connection-banner"><Github size={18}/><div><b>GitHub</b><small>Repository editing depends on connector write permission.</small></div><span className="status">Read available</span></div><div className="connection-banner"><BookOpen size={18}/><div><b>Notion</b><small>Connected workspace tools can be surfaced here.</small></div><span className="status">Configured</span></div></div>}</div></div></div>}
