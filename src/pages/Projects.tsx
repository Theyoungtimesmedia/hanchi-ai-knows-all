 import { useState, useEffect } from "react";
 import { useNavigate } from "react-router-dom";
 import { motion } from "framer-motion";
 import { ArrowLeft, Plus, Folder, MessageSquare, FileText, Settings, Trash2, MoreVertical, Users, Clock, Search, Grid, List } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
 import { supabase } from "@/integrations/supabase/client";
 import { useToast } from "@/hooks/use-toast";
 
 interface Project {
   id: string;
   name: string;
   description: string;
   emoji: string;
   chatCount: number;
   fileCount: number;
   createdAt: string;
   updatedAt: string;
   color: string;
 }
 
 const COLORS = [
   "from-blue-500 to-cyan-500",
   "from-purple-500 to-pink-500",
   "from-emerald-500 to-teal-500",
   "from-orange-500 to-red-500",
   "from-indigo-500 to-purple-500",
   "from-amber-500 to-orange-500",
 ];
 
 export default function Projects() {
   const navigate = useNavigate();
   const { toast } = useToast();
   const [projects, setProjects] = useState<Project[]>([]);
   const [searchQuery, setSearchQuery] = useState("");
   const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
   const [isCreating, setIsCreating] = useState(false);
   const [newProject, setNewProject] = useState({ name: "", description: "", emoji: "📁" });
 
   useEffect(() => {
     const saved = localStorage.getItem('hanchi_projects');
     if (saved) {
       setProjects(JSON.parse(saved));
     } else {
       // Default projects
       setProjects([
         {
           id: "1",
           name: "Marketing Ideas",
           description: "Campaign brainstorming and content",
           emoji: "📊",
           chatCount: 5,
           fileCount: 3,
           createdAt: new Date().toISOString(),
           updatedAt: new Date().toISOString(),
           color: COLORS[0],
         },
         {
           id: "2",
           name: "Code Projects",
           description: "Development assistance",
           emoji: "💻",
           chatCount: 12,
           fileCount: 8,
           createdAt: new Date().toISOString(),
           updatedAt: new Date().toISOString(),
           color: COLORS[1],
         },
       ]);
     }
   }, []);
 
   const saveProjects = (newProjects: Project[]) => {
     setProjects(newProjects);
     localStorage.setItem('hanchi_projects', JSON.stringify(newProjects));
   };
 
   const createProject = () => {
     if (!newProject.name.trim()) {
       toast({ title: "Please enter a project name", variant: "destructive" });
       return;
     }
 
     const project: Project = {
       id: Date.now().toString(),
       name: newProject.name,
       description: newProject.description,
       emoji: newProject.emoji,
       chatCount: 0,
       fileCount: 0,
       createdAt: new Date().toISOString(),
       updatedAt: new Date().toISOString(),
       color: COLORS[Math.floor(Math.random() * COLORS.length)],
     };
 
     saveProjects([...projects, project]);
     setNewProject({ name: "", description: "", emoji: "📁" });
     setIsCreating(false);
     toast({ title: "Project created! 🎉" });
   };
 
   const deleteProject = (id: string) => {
     saveProjects(projects.filter(p => p.id !== id));
     toast({ title: "Project deleted" });
   };
 
   const filteredProjects = projects.filter(p =>
     p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     p.description.toLowerCase().includes(searchQuery.toLowerCase())
   );
 
   const emojis = ["📁", "📊", "💻", "📚", "✨", "🎯", "🚀", "💡", "🎨", "📝", "🔬", "🌍"];
 
   return (
     <motion.div 
       className="min-h-screen bg-background"
       initial={{ opacity: 0 }}
       animate={{ opacity: 1 }}
     >
       {/* Header */}
       <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/50">
         <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
           <Button variant="ghost" size="icon" onClick={() => navigate('/chat')} className="rounded-xl h-9 w-9">
             <ArrowLeft size={18} />
           </Button>
           <div className="flex-1">
             <h1 className="text-base font-semibold flex items-center gap-2">
               <Folder size={18} className="text-primary" />
               Projects
             </h1>
             <p className="text-[10px] text-muted-foreground">Organize your conversations</p>
           </div>
           <Button onClick={() => setIsCreating(true)} size="sm" className="gap-1.5 rounded-xl">
             <Plus size={14} />
             New Project
           </Button>
         </div>
       </header>
 
       <main className="max-w-5xl mx-auto px-4 py-6">
         {/* Search & View Toggle */}
         <div className="flex items-center gap-3 mb-6">
           <div className="flex-1 relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
             <Input
               placeholder="Search projects..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="pl-9 rounded-xl h-10"
             />
           </div>
           <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-xl">
             <Button
               variant={viewMode === "grid" ? "default" : "ghost"}
               size="icon"
               onClick={() => setViewMode("grid")}
               className="h-8 w-8 rounded-lg"
             >
               <Grid size={16} />
             </Button>
             <Button
               variant={viewMode === "list" ? "default" : "ghost"}
               size="icon"
               onClick={() => setViewMode("list")}
               className="h-8 w-8 rounded-lg"
             >
               <List size={16} />
             </Button>
           </div>
         </div>
 
         {/* Create Project Modal */}
         {isCreating && (
           <Card className="mb-6 border-primary/30">
             <CardHeader className="pb-3">
               <CardTitle className="text-base">Create New Project</CardTitle>
               <CardDescription className="text-xs">Organize related chats and files</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="flex items-center gap-3">
                 <div className="space-y-1.5">
                   <p className="text-xs text-muted-foreground">Icon</p>
                   <div className="flex flex-wrap gap-1">
                     {emojis.map(e => (
                       <button
                         key={e}
                         onClick={() => setNewProject(p => ({ ...p, emoji: e }))}
                         className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-all ${
                           newProject.emoji === e ? "bg-primary/20 ring-2 ring-primary" : "bg-muted hover:bg-muted/80"
                         }`}
                       >
                         {e}
                       </button>
                     ))}
                   </div>
                 </div>
               </div>
               <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1.5">
                   <p className="text-xs text-muted-foreground">Name</p>
                   <Input
                     value={newProject.name}
                     onChange={(e) => setNewProject(p => ({ ...p, name: e.target.value }))}
                     placeholder="Project name"
                     className="rounded-xl h-9"
                   />
                 </div>
                 <div className="space-y-1.5">
                   <p className="text-xs text-muted-foreground">Description</p>
                   <Input
                     value={newProject.description}
                     onChange={(e) => setNewProject(p => ({ ...p, description: e.target.value }))}
                     placeholder="Brief description"
                     className="rounded-xl h-9"
                   />
                 </div>
               </div>
               <div className="flex gap-2 justify-end">
                 <Button variant="outline" size="sm" onClick={() => setIsCreating(false)} className="rounded-xl">Cancel</Button>
                 <Button size="sm" onClick={createProject} className="rounded-xl">Create Project</Button>
               </div>
             </CardContent>
           </Card>
         )}
 
         {/* Projects Grid/List */}
         {filteredProjects.length === 0 ? (
           <div className="text-center py-16">
             <Folder className="mx-auto mb-4 text-muted-foreground/50" size={48} />
             <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
             <p className="text-sm text-muted-foreground mb-4">Create a project to organize your chats</p>
             <Button onClick={() => setIsCreating(true)} className="rounded-xl">
               <Plus size={16} className="mr-2" />
               Create your first project
             </Button>
           </div>
         ) : (
           <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 gap-4" : "space-y-3"}>
             {filteredProjects.map((project) => (
               <motion.div
                 key={project.id}
                 whileHover={{ scale: 1.02 }}
                 className="cursor-pointer"
               >
                 <Card className="overflow-hidden hover:border-primary/30 transition-all">
                   <div className={`h-2 bg-gradient-to-r ${project.color}`} />
                   <CardContent className="p-4">
                     <div className="flex items-start justify-between mb-3">
                       <div className="flex items-center gap-2">
                         <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-xl">
                           {project.emoji}
                         </div>
                         <div>
                           <h3 className="font-semibold text-sm">{project.name}</h3>
                           <p className="text-[10px] text-muted-foreground line-clamp-1">{project.description}</p>
                         </div>
                       </div>
                       <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                           <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg">
                             <MoreVertical size={14} />
                           </Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end">
                           <DropdownMenuItem onClick={() => toast({ title: "Coming soon!" })}>
                             <Settings size={14} className="mr-2" />
                             Settings
                           </DropdownMenuItem>
                           <DropdownMenuItem 
                             onClick={() => deleteProject(project.id)}
                             className="text-destructive"
                           >
                             <Trash2 size={14} className="mr-2" />
                             Delete
                           </DropdownMenuItem>
                         </DropdownMenuContent>
                       </DropdownMenu>
                     </div>
                     <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                       <div className="flex items-center gap-1">
                         <MessageSquare size={12} />
                         {project.chatCount} chats
                       </div>
                       <div className="flex items-center gap-1">
                         <FileText size={12} />
                         {project.fileCount} files
                       </div>
                     </div>
                   </CardContent>
                 </Card>
               </motion.div>
             ))}
           </div>
         )}
       </main>
     </motion.div>
   );
 }