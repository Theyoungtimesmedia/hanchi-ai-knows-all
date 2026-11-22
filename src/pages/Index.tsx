import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Archive, ArrowLeft, ArrowRight, ArrowUp, BookOpen, Bot, Brain, ChevronDown, ChevronRight, CircleHelp,
  Copy, Download, File, FileCode2, FileImage, FileText, Folder, FolderOpen, GitBranch, Github, Globe,
  ImageIcon, Library, Loader2, Menu, MessageSquare, Mic, MoreHorizontal, PanelLeft, PanelRight,
  Paperclip, Pencil, Plus, RefreshCw, Search, Settings2, Share2, Sparkles, ThumbsDown, ThumbsUp,
  Trash2, Upload, Volume2, WandSparkles, X, Zap, SquarePen, Clock, AtSign, CircleUser, LogOut, Share, Pin, Check,
  MessageCircle, Square, AudioLines, Telescope, ListFilter, LayoutGrid, List, Mail, Calendar
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
  const [chatMenu,setChatMenu]=useState(false);
  const [projectMenu,setProjectMenu]=useState(false);
  const [chatSearch,setChatSearch]=useState<string|null>(null);
  const [locked,setLocked]=useState<string[]>(()=>{try{return JSON.parse(localStorage.getItem('hanchi-locked-chats')||'[]')}catch{return []}});
  const [chatProjects,setChatProjects]=useState<Record<string,string>>(()=>{try{return JSON.parse(localStorage.getItem('hanchi-chat-projects')||'{}')}catch{return {}}});
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
  const [mode,setMode]=useState<'chat'|'search'|'research'|'council'>('chat');
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
  async function editAndResend(messageId:string,text:string){
    if(busy||!text.trim())return;
    const idx=messages.findIndex(m=>m.id===messageId); if(idx<0)return;
    const history=messages.slice(0,idx); const ids=messages.slice(idx).map(m=>m.id).filter(id=>id&&!String(id).startsWith('stream-'));
    if(ids.length) await db.from('messages').delete().in('id',ids);
    setMessages(history);
    await sendMessage(text.trim(),{history});
  }
  function renameChat(id:string){const c=conversations.find(x=>x.id===id);const t=prompt('Rename chat',c?.title||'');if(!t?.trim())return;db.from('conversations').update({title:t.trim()}).eq('id',id).then(()=>setConversations(prev=>prev.map(x=>x.id===id?{...x,title:t.trim()}:x)));}
  function toggleLock(id:string){setLocked(prev=>{const n=prev.includes(id)?prev.filter(x=>x!==id):[...prev,id];localStorage.setItem('hanchi-locked-chats',JSON.stringify(n));return n;});}
  function moveToProject(id:string,pid:string|null){setChatProjects(prev=>{const n={...prev};if(pid)n[id]=pid;else delete n[id];localStorage.setItem('hanchi-chat-projects',JSON.stringify(n));return n;});setStatus(pid?'Moved to project':'Removed from project');setTimeout(()=>setStatus(''),1500);}
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
      await streamChat({messages:history,model:selectedModel==='auto'?undefined:selectedModel,effort,projectId:null,language:'en',tone:'default',searchWeb:mode==='search'||/\b(search|latest|today|current|research)\b/i.test(prompt),images:attachedImages},(chunk)=>{answer+=chunk;setMessages(prev=>prev.map(m=>m.id===streamId?{...m,content:answer}:m));},(meta)=>md=meta);
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

  async function togglePin(id:string){const c=conversations.find(x=>x.id===id);if(!c)return;const pinned=!c.pinned;await db.from('conversations').update({pinned}).eq('id',id);setConversations(prev=>prev.map(x=>x.id===id?{...x,pinned}:x));}
  async function deleteChat(id:string){if(!confirm('Delete this chat?'))return;await db.from('conversations').delete().eq('id',id);setConversations(prev=>prev.filter(x=>x.id!==id));if(id===conversationId)newChat();}

  if(!user)return <div className="hanchi-loading"><Loader2 className="spin" size={20}/><span>Loading Hanchi</span></div>;

  const fullName=user.user_metadata?.full_name||'Joshua Omoniyi';
  const pinned=conversations.filter(c=>c.pinned);
  const recent=conversations.filter(c=>!c.pinned);
  const empty=view==='chat'&&messages.length===0;
  const go=(v:View)=>{setView(v);setProfileOpen(false);};
  const composer=<Composer input={input} setInput={setInput} send={()=>sendMessage()} busy={busy} processing={processing} onUpload={()=>{setComposeMenu(false);fileRef.current?.click();}} onDictate={voiceDictate} menuOpen={composeMenu} setMenuOpen={setComposeMenu} mode={mode} setMode={setMode} effort={effort} setEffort={setEffort} effortMenu={effortMenu} setEffortMenu={setEffortMenu} onLibrary={()=>{setComposeMenu(false);go('library');}} onImage={()=>{setComposeMenu(false);go('images');}} menuBelow={empty} attachments={attachments} removeAttachment={(i)=>setAttachments(a=>a.filter((_,j)=>j!==i))}/>;

  return <div className="hanchi-app" onMouseDown={()=>{setChatMenu(false);}}>
    <aside className={`hanchi-sidebar ${sidebar?'':'is-collapsed'}`}>
      <div className="sb-head"><button className="sb-brand" onClick={newChat}>Hanchi</button><div className="sb-head-icons"><button className="icon-btn" onClick={()=>setGlobalSearchOpen(true)} title="Search chats"><Search size={20} strokeWidth={1.75}/></button><button className="icon-btn" onClick={()=>setSidebar(false)} title="Close sidebar"><PanelLeft size={20} strokeWidth={1.75}/></button></div></div>
      <nav className="sidebar-scroll">
        <button className={`nav-row ${view==='chat'&&!conversationId?'active':''}`} onClick={newChat}><SquarePen size={20} strokeWidth={1.75}/><span>New chat</span></button>
        <button className={`nav-row ${view==='images'?'active':''}`} onClick={()=>go('images')}><ImageIcon size={20} strokeWidth={1.75}/><span>Images</span></button>
        <button className={`nav-row ${view==='library'?'active':''}`} onClick={()=>go('library')}><Library size={20} strokeWidth={1.75}/><span>Library</span></button>
        <button className={`nav-row ${view==='morning'?'active':''}`} onClick={()=>go('morning')}><Clock size={20} strokeWidth={1.75}/><span>Morning</span></button>
        <button className={`nav-row ${view==='plugins'?'active':''}`} onClick={()=>go('plugins')}><AtSign size={20} strokeWidth={1.75}/><span>Plugins</span></button>
        <button className={`nav-row ${view==='brain'?'active':''}`} onClick={()=>go('brain')}><Brain size={20} strokeWidth={1.75}/><span>Brain</span></button>
        <button className={`nav-row ${view==='projects'?'active':''}`} onClick={()=>go('projects')}><MoreHorizontal size={20} strokeWidth={1.75}/><span>More</span></button>
        {pinned.length>0&&<div className="nav-group"><div className="nav-label">Pinned</div>{pinned.map(c=><ChatRow key={c.id} c={c} active={c.id===conversationId} onOpen={()=>loadConversation(c.id)} icon/>)}</div>}
        {projects.length>0&&<div className="nav-group"><div className="nav-label">Projects</div>{projects.slice(0,6).map(p=><button key={p.id} className="nav-row" onClick={()=>go('projects')}><Folder size={20} strokeWidth={1.75}/><span>{p.name}</span></button>)}</div>}
        <div className="nav-group"><div className="nav-label">Chats</div>{recent.slice(0,40).map(c=><ChatRow key={c.id} c={c} active={c.id===conversationId} onOpen={()=>loadConversation(c.id)}/>)}</div>
      </nav>
      <div className="sidebar-bottom">
        {profileOpen&&<div className="profile-pop" onMouseDown={e=>e.stopPropagation()}>
          <div className="pp-user"><span className="avatar sm">{initials(fullName)}</span><span className="profile-copy"><b>{fullName}</b><small>Private</small></span><ChevronRight size={18}/></div>
          <div className="pp-sep"/>
          <button onClick={()=>{setProfileOpen(false);setSettingsTab('personalization');setSettingsOpen(true)}}><Sparkles size={20} strokeWidth={1.75}/>Personalization</button>
          <button onClick={()=>{setProfileOpen(false);navigate('/profile')}}><CircleUser size={20} strokeWidth={1.75}/>Profile</button>
          <button onClick={()=>{setProfileOpen(false);setSettingsTab('general');setSettingsOpen(true)}}><Settings2 size={20} strokeWidth={1.75}/>Settings</button>
          <div className="pp-sep"/>
          <button onClick={()=>{setProfileOpen(false);navigate('/help')}}><CircleHelp size={20} strokeWidth={1.75}/><span className="grow">Help</span><ChevronRight size={18}/></button>
          <button onClick={signOut}><LogOut size={20} strokeWidth={1.75}/>Log out</button>
        </div>}
        <button className={`profile-row ${profileOpen?'open':''}`} onMouseDown={e=>e.stopPropagation()} onClick={()=>setProfileOpen(v=>!v)}><span className="avatar">{initials(fullName)}</span><span className="profile-copy"><b>{fullName}</b><small>Private</small></span></button>
      </div>
    </aside>

    <main className="hanchi-main">
      <header className="topbar">
        <div className="topbar-left">{!sidebar&&<button className="icon-btn" onClick={()=>setSidebar(true)} title="Open sidebar"><PanelLeft size={20} strokeWidth={1.75}/></button>}<button className="icon-btn mobile-only" onClick={()=>setSidebar(v=>!v)}><Menu size={20}/></button></div>
        {empty&&<div className="seg"><button className={mode!=='council'?'on':''} onClick={()=>setMode('chat')}>Chat</button><button className={mode==='council'?'on':'work'} onClick={()=>setMode('council')}><Sparkles size={14}/> Council</button></div>}
        <div className="topbar-right">
          {view==='chat'&&conversationId?<>
            <button className="top-pill" onClick={()=>{navigator.clipboard.writeText(location.href);setStatus('Link copied');setTimeout(()=>setStatus(''),1500)}}><Share size={18} strokeWidth={1.75}/><span>Share</span></button>
            <div className="relative" onMouseDown={e=>e.stopPropagation()}><button className="icon-btn" onClick={()=>setChatMenu(v=>!v)}><MoreHorizontal size={20}/></button>
            {chatMenu&&<div className="floating-menu chat-menu">
              <button onClick={()=>{setChatMenu(false);setRightTab('canvas');setRightOpen(true)}}><Library size={20} strokeWidth={1.75}/>View files in chat</button>
              <button onClick={()=>{setChatMenu(false);renameChat(conversationId)}}><SquarePen size={20} strokeWidth={1.75}/>Rename</button>
              <button onClick={()=>{setChatMenu(false);setChatSearch('')}}><Search size={20} strokeWidth={1.75}/>Search in chat</button>
              <button onClick={()=>setProjectMenu(v=>!v)}><Library size={20} strokeWidth={1.75}/><span className="grow">Move to project</span><ChevronRight size={18}/></button>
              {projectMenu&&<div className="sub-list">{projects.length?projects.map(pr=><button key={pr.id} onClick={()=>{setChatMenu(false);setProjectMenu(false);moveToProject(conversationId,chatProjects[conversationId]===pr.id?null:pr.id)}}><span className="grow">{safeText(pr.name||pr.title)}</span>{chatProjects[conversationId]===pr.id&&<Check size={16}/>}</button>):<div className="menu-meta">No projects yet</div>}</div>}
              <button onClick={()=>{setChatMenu(false);toggleLock(conversationId)}}><Lock size={20} strokeWidth={1.75}/>{locked.includes(conversationId)?'Unlock chat':'Lock chat'}</button>
              <button onClick={()=>{setChatMenu(false);togglePin(conversationId)}}><Pin size={20} strokeWidth={1.75}/>{conversations.find(c=>c.id===conversationId)?.pinned?'Unpin chat':'Pin chat'}</button>
              <button className="danger" onClick={()=>{setChatMenu(false);deleteChat(conversationId)}}><Trash2 size={20} strokeWidth={1.75}/>Delete</button>
              <div className="pp-sep"/>
              <button onClick={()=>{setChatMenu(false);setModelMenu(true)}}><Bot size={20} strokeWidth={1.75}/><span className="grow">Model: {selectedModel==='auto'?'Auto':selectedModel}</span><ChevronRight size={18}/></button>
            </div>}</div>
          </>:<button className="icon-btn" onClick={()=>setModelMenu(v=>!v)} title="Model"><Bot size={20} strokeWidth={1.75}/></button>}
        </div>
      </header>
      {modelMenu&&<div className="floating-menu model-menu" onMouseDown={e=>e.stopPropagation()}>{[['auto','Auto','Route by capability'],['gemini-flash','Gemini Flash','Fast everyday chat'],['gemini-pro','Gemini Pro','Deeper reasoning']].map(([id,l,d])=><button key={id} onClick={()=>{setSelectedModel(id);setModelMenu(false)}}><span className="grow"><span>{l}</span><small>{d}</small></span>{selectedModel===id&&<Check size={16}/>}</button>)}</div>}

      <section className="workbench">
        {view==='chat'&&<div className={`chat-stage ${empty?'is-empty':''}`}>
          {empty?<div className="welcome"><h1>{`Hey, ${fullName}. Ready to dive in?`}</h1>{composer}</div>:<>
          {chatSearch!==null&&<div className="chat-search"><Search size={16}/><input autoFocus value={chatSearch} onChange={e=>setChatSearch(e.target.value)} placeholder="Search this chat" onKeyDown={e=>{if(e.key==='Enter'){const el=scrollRef.current?.querySelector('.search-hit');el?.scrollIntoView({behavior:'smooth',block:'center'})}if(e.key==='Escape')setChatSearch(null)}}/><small>{chatSearch?messages.filter(m=>m.content.toLowerCase().includes(chatSearch.toLowerCase())).length+' found':''}</small><button className="icon-btn" onClick={()=>setChatSearch(null)}><X size={16}/></button></div>}
          <div ref={scrollRef} className="chat-scroll"><div className="thread">{messages.map((m,i)=><Message key={m.id||i} hit={!!chatSearch&&m.content.toLowerCase().includes(chatSearch.toLowerCase())} onEdit={m.role==='user'&&m.id&&!busy&&!locked.includes(conversationId||'')?(t:string)=>editAndResend(m.id,t):undefined} msg={m} onCopy={()=>navigator.clipboard.writeText(m.content)} onRetry={m.role==='assistant'?()=>retryFrom(m.id):undefined} onBranch={m.role==='assistant'?()=>branchFrom(m.id):undefined} onSpeak={m.role==='assistant'?()=>window.speechSynthesis?.speak(new SpeechSynthesisUtterance(m.content)):undefined}/>)}
          {busy&&<div className="thinking-row"><span className="thinking-dot"></span><span>{status||''}</span></div>}</div></div>
          {lastError&&<div className="error-strip"><span>{lastError}</span><button onClick={()=>setLastError(null)}><X size={15}/></button></div>}
          <div className="composer-dock"><div className="disclaimer">Hanchi can make mistakes. Check important info.</div>{conversationId&&locked.includes(conversationId)?<div className="locked-note"><Lock size={16}/>This chat is locked. <button onClick={()=>toggleLock(conversationId)}>Unlock</button></div>:composer}</div></>}
          <input ref={fileRef} type="file" className="hidden" multiple accept="image/*,audio/*,video/*,text/plain,text/markdown,application/pdf" onChange={e=>{Array.from(e.target.files||[]).forEach(handleFile)}}/>
        </div>}
        {view==='images'&&<ImagesView prompt={imagePrompt} setPrompt={setImagePrompt} generate={generateImage} generated={generatedImages} onPick={(t)=>setImagePrompt(t)}/>}
        {view==='library'&&<LibraryView items={filteredLibrary} query={libraryQuery} setQuery={setLibraryQuery} onOpen={a=>openArtifact(a)} onNew={()=>{go('chat');setTimeout(()=>fileRef.current?.click(),50)}}/>}
        {view==='projects'&&<ProjectsView projects={projects}/>}
        {view==='brain'&&<BrainView brain={brain}/>}
        {view==='plugins'&&<PluginsView skills={skills} connectors={connectors}/>}
        {view==='morning'&&<MorningView briefing={briefing}/>}
        {rightOpen&&<RightPanel tab={rightTab} setTab={setRightTab} canvas={canvas} artifactTab={artifactTab} setArtifactTab={setArtifactTab} brain={brain} connectors={connectors} onClose={()=>setRightOpen(false)}/>}
      </section>
    </main>

    {settingsOpen&&<SettingsModal tab={settingsTab} setTab={setSettingsTab} connectors={connectors} onClose={()=>setSettingsOpen(false)}/>}
    {globalSearchOpen&&<div className="overlay" onMouseDown={()=>setGlobalSearchOpen(false)}><div className="search-dialog" onMouseDown={e=>e.stopPropagation()}><div className="search-head"><Search size={18}/><input autoFocus value={globalQuery} onChange={e=>setGlobalQuery(e.target.value)} placeholder="Search chats..."/><button className="icon-btn" onClick={()=>setGlobalSearchOpen(false)}><X size={18}/></button></div><div className="search-results"><button onClick={()=>{newChat();setGlobalSearchOpen(false)}}><SquarePen size={18}/><span>New chat</span></button>{filteredChats.slice(0,30).map(c=><button key={c.id} onClick={()=>{loadConversation(c.id);setGlobalSearchOpen(false)}}><MessageSquare size={18}/><span>{safeText(c.title)}</span><small>{new Date(c.updated_at).toLocaleDateString('en-GB')}</small></button>)}{!filteredChats.length&&<div className="empty-state">No chats found.</div>}</div></div></div>}
  </div>
}

function ChatRow({c,active,onOpen,icon}:{c:Row;active:boolean;onOpen:()=>void;icon?:boolean;key?:string}){return <button className={`chat-row ${active?'active':''}`} onClick={onOpen}>{icon&&<MessageCircle size={20} strokeWidth={1.75}/>}<span>{safeText(c.title)||'New chat'}</span></button>}

function Message({msg,onCopy,onRetry,onBranch,onSpeak,onEdit,hit}:{msg:HanchiMessage;onEdit?:(t:string)=>void;hit?:boolean;onCopy:()=>void;onRetry?:()=>void;onBranch?:()=>void;onSpeak?:()=>void;key?:string|number}){
  const user=msg.role==='user'; const error=!!msg.metadata?.error; const [more,setMore]=useState(false); const [copied,setCopied]=useState(false); const [editing,setEditing]=useState(false); const [draft,setDraft]=useState(msg.content);
  const sources:any[]=Array.isArray(msg.metadata?.sources)?msg.metadata.sources:[];
  return <div className={`message-row ${user?'user':'assistant'} ${hit?'search-hit':''} ${editing?'editing':''}`}><div className="message-main">{editing?<div className="edit-box"><textarea autoFocus value={draft} onChange={e=>setDraft(e.target.value)} rows={3}/><div className="edit-actions"><button onClick={()=>{setEditing(false);setDraft(msg.content)}}>Cancel</button><button className="primary" disabled={!draft.trim()} onClick={()=>{setEditing(false);onEdit?.(draft)}}>Send</button></div></div>:<div className={`message-content ${error?'message-error':''}`}><ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown></div>}
  {!user&&sources.length>0&&<button className="sources-pill">Sources</button>}
  {!user&&msg.content&&<div className="message-actions"><button onClick={()=>{onCopy();setCopied(true);setTimeout(()=>setCopied(false),1200)}} title="Copy">{copied?<Check size={18}/>:<Copy size={18} strokeWidth={1.75}/>}</button><button title="Good response"><ThumbsUp size={18} strokeWidth={1.75}/></button><button title="Bad response"><ThumbsDown size={18} strokeWidth={1.75}/></button><button title="Share" onClick={onCopy}><Share size={18} strokeWidth={1.75}/></button>{onRetry&&<button onClick={onRetry} title="Try again"><RefreshCw size={18} strokeWidth={1.75}/></button>}
  <div className="relative"><button title="More" onClick={()=>setMore(v=>!v)}><MoreHorizontal size={18}/></button>{more&&<div className="floating-menu msg-menu" onMouseLeave={()=>setMore(false)}>{msg.created_at&&<div className="menu-meta">{new Date(msg.created_at).toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}</div>}<button onClick={()=>setMore(false)}><Library size={20} strokeWidth={1.75}/>View sources</button>{onBranch&&<button onClick={()=>{setMore(false);onBranch()}}><GitBranch size={20} strokeWidth={1.75}/>Branch in new chat</button>}{onSpeak&&<button onClick={()=>{setMore(false);onSpeak()}}><Volume2 size={20} strokeWidth={1.75}/>Read aloud</button>}</div>}</div></div>}
  {user&&!editing&&<div className="message-actions user-actions"><button onClick={onCopy} title="Copy"><Copy size={18} strokeWidth={1.75}/></button>{onEdit&&<button onClick={()=>{setDraft(msg.content);setEditing(true)}} title="Edit message"><Pencil size={18} strokeWidth={1.75}/></button>}</div>}</div></div>
}

function Composer(p:{input:string;setInput:(s:string)=>void;send:()=>void;busy:boolean;processing:boolean;onUpload:()=>void;onDictate:()=>void;menuOpen:boolean;setMenuOpen:(v:boolean)=>void;mode:'chat'|'search'|'research'|'council';setMode:(v:any)=>void;effort:string;setEffort:(s:string)=>void;effortMenu:boolean;setEffortMenu:(v:boolean)=>void;onLibrary:()=>void;onImage:()=>void;menuBelow:boolean;attachments:Attachment[];removeAttachment:(i:number)=>void}){
  const {input,setInput,send,busy,processing,onUpload,onDictate,menuOpen,setMenuOpen,mode,setMode,effort,setEffort,onLibrary,onImage,menuBelow,attachments,removeAttachment}=p;
  const ref=useRef<HTMLTextAreaElement>(null);
  useEffect(()=>{const el=ref.current;if(el){el.style.height='auto';el.style.height=Math.min(el.scrollHeight,200)+'px';}},[input]);
  const thinking=effort==='deep';
  const pick=(fn:()=>void)=>()=>{fn();setMenuOpen(false);};
  const items:[React.ReactNode,string,string,()=>void][]=[
    [<Paperclip size={20} strokeWidth={1.75}/>,'Add photos & files','Upload from computer',onUpload],
    [<Library size={20} strokeWidth={1.75}/>,'Add from library','Browse and search your files',onLibrary],
    [<ImageIcon size={20} strokeWidth={1.75} className="ic-img"/>,'Create image','Visualize anything',onImage],
    [<Globe size={20} strokeWidth={1.75} className="ic-web"/>,'Web search','Find real-time news and info',pick(()=>setMode('search'))],
    [<Telescope size={20} strokeWidth={1.75} className="ic-web"/>,'Deep research','Get a detailed report',pick(()=>setMode('research'))],
    [<Bot size={20} strokeWidth={1.75}/>,'Council','Models debate before answering',pick(()=>setMode('council'))],
    [<Github size={20} strokeWidth={1.75}/>,'GitHub','Triage PRs, issues, CI, and publish flows',pick(()=>setInput(input||'Using GitHub: '))],
    [<BookOpen size={20} strokeWidth={1.75}/>,'Notion','Create docs, tasks, databases',pick(()=>setInput(input||'Using Notion: '))],
  ];
  const canSend=!!input.trim()&&!busy;
  return <div className="composer-shell" onMouseDown={e=>e.stopPropagation()}>
    <div className="composer">
      {attachments.length>0&&<div className="att-row">{attachments.map((a,i)=><span className="att-chip" key={i}><FileText size={16}/><span>{a.name}</span><button onClick={()=>removeAttachment(i)}><X size={14}/></button></span>)}</div>}
      <div className="composer-line">
        <button className={`composer-btn ${menuOpen?'selected':''}`} onClick={()=>setMenuOpen(!menuOpen)} title="Add files and more"><Plus size={22} strokeWidth={1.75}/></button>
        {mode!=='chat'&&<button className="mode-chip" onClick={()=>setMode('chat')}>{mode==='search'?<Globe size={16}/>:mode==='research'?<Telescope size={16}/>:<Bot size={16}/>}<span>{mode==='search'?'Search':mode==='research'?'Deep research':'Council'}</span><X size={14}/></button>}
        <textarea ref={ref} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}} placeholder={processing?'Processing file…':'Ask anything'} rows={1}/>
        <button className={`think-btn ${thinking?'on':''}`} onClick={()=>setEffort(thinking?'standard':'deep')}><Brain size={20} strokeWidth={1.6}/><span>Think</span></button>
        <button className="composer-btn" onClick={onDictate} title="Dictate"><Mic size={20} strokeWidth={1.75}/></button>
        {canSend||busy?<button className="send-btn" onClick={send} disabled={!canSend} title="Send">{busy?<Square size={14} fill="currentColor"/>:<ArrowUp size={20} strokeWidth={2.25}/>}</button>
        :<button className="voice-btn" onClick={onDictate} title="Use voice"><AudioLines size={20} strokeWidth={2}/></button>}
      </div>
    </div>
    {menuOpen&&<div className={`plus-menu ${menuBelow?'below':'above'}`}>{items.map(([ic,l,d,fn])=><button key={l} onClick={fn}><span className="pm-ic">{ic}</span><span className="pm-l">{l}</span><span className="pm-d">{d}</span></button>)}</div>}
  </div>
}

const TRENDS=['Stickers','Photosynthesis as a diagram','Map of ancient Lagos','Timeline of Nigerian history','Plant cell poster','Cozy bedroom at sunset','Retro beach sticker sheet','Afrobeats gig poster'];
function ImagesView({prompt,setPrompt,generate,generated,onPick}:{prompt:string;setPrompt:(s:string)=>void;generate:()=>void;generated:Row[];onPick:(s:string)=>void}){return <div className="page"><h1 className="page-title">Images</h1><div className="composer standalone"><div className="composer-line"><button className="composer-btn"><Plus size={22} strokeWidth={1.75}/></button><textarea rows={1} value={prompt} onChange={e=>setPrompt(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();generate()}}} placeholder="Describe a new image"/><button className="think-btn"><Brain size={20} strokeWidth={1.6}/><span>Think</span></button><button className="composer-btn"><Mic size={20} strokeWidth={1.75}/></button>{prompt.trim()?<button className="send-btn" onClick={generate}><ArrowUp size={20}/></button>:<button className="voice-btn"><AudioLines size={20}/></button>}</div></div>
<div className="chip-row"><span className="chip on">Trending</span>{generated.length>0&&<span className="chip">My images</span>}</div>
<div className="trend-grid">{generated.map(x=><div className="trend-tile pending" key={x.id}><span>{x.title}</span></div>)}{TRENDS.map((t,i)=><button key={t} className={`trend-tile t${i%8}`} onClick={()=>onPick(t)}><span>{t}</span></button>)}</div></div>}

function LibraryView({items,query,setQuery,onOpen,onNew}:{items:Row[];query:string;setQuery:(s:string)=>void;onOpen:(a:any)=>void;onNew:()=>void}){
  const [tab,setTab]=useState('Suggested');
  const shown=tab==='Images'?items.filter(x=>/image|png|jpe?g/.test(String(x.mime_type||x.file_name))):items;
  const ago=(d:string)=>{const s=(Date.now()-new Date(d).getTime())/1000;if(s<3600)return `${Math.max(1,Math.round(s/60))}m ago`;if(s<86400)return `${Math.round(s/3600)}h ago`;if(s<604800)return `${Math.round(s/86400)}d ago`;return `${Math.round(s/604800)}w ago`;};
  return <div className="page wide"><div className="lib-head"><h1 className="page-title">Library</h1><div className="lib-tools"><button className="icon-btn"><ListFilter size={20} strokeWidth={1.75}/></button><span className="vsep"/><button className="icon-btn"><LayoutGrid size={20} strokeWidth={1.75}/></button><button className="icon-btn on"><List size={20} strokeWidth={1.75}/></button><div className="search-box"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search library"/></div><button className="new-btn" onClick={onNew}>New <ChevronDown size={18}/></button></div></div>
  <div className="tabs">{['Suggested','Favorites','Folders','Images','All'].map(t=><button key={t} className={tab===t?'on':''} onClick={()=>setTab(t)}>{t}</button>)}</div>
  <div className="library-table"><div className="library-row library-row-head"><span>Name</span><span>Last activity</span></div>{shown.map(x=><button className="library-row" key={x.id} onClick={()=>onOpen(x)}><span className="file-name"><span className={`file-ic ${/\.pdf$/i.test(x.file_name||'')?'pdf':''}`}>{iconForFile(x.file_name||x.title)}</span><span>{x.file_name||x.title}</span></span><span className="muted">{x.updated_at?`Modified ${ago(x.updated_at)}`:''}</span></button>)}{!shown.length&&<div className="empty-state">Files you create or upload will show up here.</div>}</div></div>}

function PluginsView({skills,connectors}:{skills:Row[];connectors:Row[]}){
  const installed=connectors.filter(c=>c.status==='connected');
  const popular:[string,string,React.ReactNode][]=[['Gmail','Read and manage Gmail',<Mail size={24}/>],['Google Calendar','See and plan your schedule',<Calendar size={24}/>],['GitHub','Triage PRs, issues, CI, and publish flows',<Github size={24}/>],['Notion','Create docs, tasks, databases',<BookOpen size={24}/>],['Firecrawl','Scrape and search the web',<Globe size={24}/>],['Supabase','Manage and query databases',<Zap size={24}/>]];
  const isOn=(n:string)=>connectors.some(c=>(c.display_name||c.provider||'').toLowerCase().includes(n.toLowerCase().split(' ')[0])&&c.status==='connected');
  return <div className="page"><div className="plug-head"><div><h1 className="page-title">Plugins</h1><p className="page-sub">Work with Hanchi across your favorite tools.</p></div><div className="plug-tools"><div className="search-box"><Search size={18}/><input placeholder="Search plugins"/></div><button className="circle-btn"><Plus size={20}/></button></div></div>
  <div className="sec-label">Installed <ChevronRight size={16}/></div><div className="inst-row">{installed.map(c=><span className="app-ic" key={c.id} title={c.display_name}>{(c.display_name||c.provider||'?')[0]}</span>)}{!installed.length&&<span className="muted small">Nothing connected yet.</span>}</div>
  <div className="sec-label">Popular</div><div className="plug-grid">{popular.map(([n,d,ic])=><div className="plug-item" key={n}><span className="app-ic big">{ic}</span><div><b>{n}</b><small>{d}</small></div><button className="icon-btn">{isOn(n)?<MoreHorizontal size={20}/>:<Plus size={22} strokeWidth={1.5}/>}</button></div>)}</div>
  {skills.length>0&&<><div className="sec-label">Skills</div><div className="plug-grid">{skills.map(s=><div className="plug-item" key={s.id}><span className="app-ic big"><Sparkles size={22}/></span><div><b>{s.name}</b><small>{s.description||'Skill'}</small></div><button className="icon-btn">{s.enabled?<Check size={20}/>:<Plus size={22} strokeWidth={1.5}/>}</button></div>)}</div></>}</div>}

function ProjectsView({projects}:{projects:Row[]}){return <div className="page"><div className="page-head"><div><div className="eyebrow">Workspaces</div><h1>Projects</h1><p>Keep instructions, chats and artifacts together.</p></div><button className="primary-btn"><Plus size={16}/>New project</button></div><div className="card-grid">{projects.map(p=><div className="project-card" key={p.id}><div className="project-icon"><Folder size={18}/></div><b>{p.name}</b><span>{p.description||'Private project workspace'}</span><small>{p.status||'active'}</small></div>)}{!projects.length&&<div className="empty-card"><FolderOpen size={25}/><b>No projects yet</b><span>Create one from your Project workspace.</span></div>}</div></div>}
function BrainView({brain}:{brain:Row[]}){return <div className="page"><div className="page-head"><div><div className="eyebrow">Personal context</div><h1>Brain</h1><p>High-signal memory Hanchi can use while working.</p></div><button className="outline-btn"><Pencil size={15}/>Manage</button></div><div className="memory-grid">{brain.map(x=><div className="memory-card" key={x.id}><div className="memory-meta"><span>{x.category||'memory'}</span><span>{x.confidence?`${x.confidence}%`:''}</span></div><b>{x.key}</b><p>{typeof x.value==='string'?x.value:JSON.stringify(x.value)}</p></div>)}{!brain.length&&<div className="empty-card"><Brain size={25}/><b>Brain is empty</b><span>High-signal context will appear here.</span></div>}</div></div>}
function MorningView({briefing}:{briefing:Row|null}){return <div className="page"><div className="page-head"><div><div className="eyebrow">Daily briefing</div><h1>Morning</h1><p>Your compact start-of-day briefing.</p></div></div><div className="morning-grid"><div className="morning-card hero"><span>Word of the day</span><b>{briefing?.word_of_day||'Clarity'}</b><small>{briefing?.note||'No briefing has been generated yet.'}</small></div><div className="morning-card"><span>Bible reference</span><b>{briefing?.bible_reference||'—'}</b><small>{briefing?.bible_text||'—'}</small></div><div className="morning-card"><span>Priorities</span><b>{briefing?.priorities?JSON.stringify(briefing.priorities):'—'}</b></div></div></div>}
function RightPanel({tab,setTab,canvas,artifactTab,setArtifactTab,brain,connectors,onClose}:{tab:'canvas'|'memory'|'activity';setTab:(t:any)=>void;canvas:HanchiArtifact|null;artifactTab:ArtifactTab;setArtifactTab:(t:ArtifactTab)=>void;brain:Row[];connectors:Row[];onClose:()=>void}){return <aside className="right-panel"><div className="right-tabs"><button className={tab==='canvas'?'active':''} onClick={()=>setTab('canvas')}><PanelRight size={14}/>Canvas</button><button className={tab==='memory'?'active':''} onClick={()=>setTab('memory')}><Brain size={14}/>Memory</button><button className={tab==='activity'?'active':''} onClick={()=>setTab('activity')}><Zap size={14}/>Activity</button><button className="icon-btn" onClick={onClose}><X size={15}/></button></div>{tab==='canvas'&&<div className="canvas-panel">{canvas?<><div className="canvas-head"><div><b>{canvas.title}</b><small>{canvas.file_name}</small></div><div className="canvas-actions"><button onClick={()=>setArtifactTab('preview')} className={artifactTab==='preview'?'active':''}>Preview</button><button onClick={()=>setArtifactTab('source')} className={artifactTab==='source'?'active':''}>Source</button><button onClick={()=>downloadTextFile(canvas.file_name,canvas.content,canvas.mime_type)}><Download size={14}/></button></div></div>{artifactTab==='preview'?(canvas.preview_mode==='html'?<iframe className="artifact-frame" title={canvas.title} sandbox="allow-scripts" srcDoc={canvas.content}/>:canvas.preview_mode==='pdf'&&canvas.metadata?.objectUrl?<iframe className="artifact-frame" title={canvas.title} src={String(canvas.metadata.objectUrl)}/>:<div className="artifact-doc"><ReactMarkdown remarkPlugins={[remarkGfm]}>{canvas.content}</ReactMarkdown></div>):<pre className="artifact-source"><code>{canvas.content}</code></pre>}</>:<div className="right-empty"><PanelRight size={28}/><b>Canvas is ready</b><span>Generated code, reports and previews will appear here.</span></div>}</div>}{tab==='memory'&&<div className="right-list"><h3>High-signal memory</h3>{brain.slice(0,20).map(x=><div className="memory-card" key={x.id}><div className="memory-meta"><span>{x.category||'memory'}</span><span>{x.confidence?`${x.confidence}%`:''}</span></div><b>{x.key}</b><p>{typeof x.value==='string'?x.value:JSON.stringify(x.value)}</p></div>)}</div>}{tab==='activity'&&<div className="right-list"><h3>System state</h3><div className="activity-card"><Zap size={15}/><div><b>Connectors</b><p>{connectors.length} configured</p></div></div><div className="activity-card"><Brain size={15}/><div><b>Brain</b><p>{brain.length} active entries</p></div></div></div>}</aside>}
function SettingsModal({tab,setTab,connectors,onClose}:{tab:SettingsTab;setTab:(t:SettingsTab)=>void;connectors:Row[];onClose:()=>void}){return <div className="overlay" onMouseDown={onClose}><div className="settings-modal" onMouseDown={e=>e.stopPropagation()}><div className="settings-sidebar"><div className="settings-title">Settings</div>{(['general','personalization','plugins','connections'] as SettingsTab[]).map(t=><button key={t} className={tab===t?'active':''} onClick={()=>setTab(t)}>{t==='general'?<Settings2 size={16}/>:t==='personalization'?<Sparkles size={16}/>:t==='plugins'?<WandSparkles size={16}/>:<Globe size={16}/>}<span>{t[0].toUpperCase()+t.slice(1)}</span></button>)}</div><div className="settings-main"><div className="settings-main-head"><div><b>{tab[0].toUpperCase()+tab.slice(1)}</b><span>Hanchi private workspace controls</span></div><button className="icon-btn" onClick={onClose}><X size={17}/></button></div>{tab==='general'&&<div className="settings-stack"><label>Appearance<select defaultValue="system"><option>system</option><option>light</option><option>dark</option></select></label><label>Language<select defaultValue="English"><option>English</option><option>Yoruba</option></select></label><label className="toggle-line"><span><b>Browser dictation</b><small>Use your browser microphone for quick notes.</small></span><input type="checkbox" defaultChecked/></label></div>}{tab==='personalization'&&<div className="settings-stack"><label>Base style<textarea defaultValue={'Thoughtful, warm and playful. Nigerian Standard English. Be direct and check your work.'}/></label><label className="toggle-line"><span><b>Self-check</b><small>Ask Hanchi to sanity-check answers before returning them.</small></span><input type="checkbox" defaultChecked/></label></div>}{tab==='plugins'&&<div className="settings-stack">{connectors.map(c=><div className="setting-row" key={c.id}><span className="tool-icon"><WandSparkles size={15}/></span><div><b>{c.display_name||c.provider}</b><small>{c.status||'unknown'}</small></div><button className="outline-btn">Manage</button></div>)}</div>}{tab==='connections'&&<div className="settings-stack"><div className="connection-banner"><Github size={18}/><div><b>GitHub</b><small>Repository editing depends on connector write permission.</small></div><span className="status">Read available</span></div><div className="connection-banner"><BookOpen size={18}/><div><b>Notion</b><small>Connected workspace tools can be surfaced here.</small></div><span className="status">Configured</span></div></div>}</div></div></div>}
