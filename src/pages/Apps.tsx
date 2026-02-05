 import { useState, useEffect } from "react";
 import { useNavigate } from "react-router-dom";
 import { motion } from "framer-motion";
 import { ArrowLeft, Grid, Search, Zap, Music, MapPin, Calendar, ShoppingBag, Plane, Palette, BookOpen, Calculator, Cloud, Heart, ExternalLink, Check, Star } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Card, CardContent } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { useToast } from "@/hooks/use-toast";
 
 interface App {
   id: string;
   name: string;
   description: string;
   icon: any;
   color: string;
   category: string;
   connected: boolean;
   featured?: boolean;
 }
 
 const APPS: App[] = [
   { id: "spotify", name: "Spotify", description: "Play and discover music", icon: Music, color: "bg-green-500", category: "Entertainment", connected: false, featured: true },
   { id: "google-maps", name: "Google Maps", description: "Find places and directions", icon: MapPin, color: "bg-blue-500", category: "Travel", connected: false },
   { id: "google-calendar", name: "Calendar", description: "Schedule and reminders", icon: Calendar, color: "bg-red-500", category: "Productivity", connected: false, featured: true },
   { id: "shopping", name: "Jumia", description: "Shop products online", icon: ShoppingBag, color: "bg-orange-500", category: "Shopping", connected: false },
   { id: "booking", name: "Booking.com", description: "Book hotels and stays", icon: Plane, color: "bg-blue-600", category: "Travel", connected: false },
   { id: "canva", name: "Canva", description: "Design graphics and images", icon: Palette, color: "bg-purple-500", category: "Design", connected: false, featured: true },
   { id: "coursera", name: "Coursera", description: "Online courses and learning", icon: BookOpen, color: "bg-indigo-500", category: "Education", connected: false },
   { id: "calculator", name: "Wolfram", description: "Math and calculations", icon: Calculator, color: "bg-amber-500", category: "Productivity", connected: false },
   { id: "weather", name: "Weather", description: "Weather forecasts", icon: Cloud, color: "bg-cyan-500", category: "Utilities", connected: true },
   { id: "health", name: "Health", description: "Health tracking and info", icon: Heart, color: "bg-pink-500", category: "Health", connected: false },
 ];
 
 const CATEGORIES = ["All", "Featured", "Productivity", "Entertainment", "Travel", "Education", "Design", "Shopping", "Utilities", "Health"];
 
 export default function Apps() {
   const navigate = useNavigate();
   const { toast } = useToast();
   const [searchQuery, setSearchQuery] = useState("");
   const [selectedCategory, setSelectedCategory] = useState("All");
   const [apps, setApps] = useState(APPS);
 
   const toggleConnection = (appId: string) => {
     setApps(prev => prev.map(app => 
       app.id === appId ? { ...app, connected: !app.connected } : app
     ));
     const app = apps.find(a => a.id === appId);
     toast({ 
       title: app?.connected ? `${app?.name} disconnected` : `${app?.name} connected! 🎉`,
       description: app?.connected ? "" : "You can now use this app in chats"
     });
   };
 
   const filteredApps = apps.filter(app => {
     const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       app.description.toLowerCase().includes(searchQuery.toLowerCase());
     const matchesCategory = selectedCategory === "All" || 
       app.category === selectedCategory ||
       (selectedCategory === "Featured" && app.featured);
     return matchesSearch && matchesCategory;
   });
 
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
               <Grid size={18} className="text-primary" />
               Apps & Integrations
               <Badge variant="secondary" className="ml-1 text-[10px]">NEW</Badge>
             </h1>
             <p className="text-[10px] text-muted-foreground">Connect apps to enhance Hanchi</p>
           </div>
         </div>
       </header>
 
       <main className="max-w-5xl mx-auto px-4 py-6">
         {/* Search */}
         <div className="relative mb-6">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
           <Input
             placeholder="Search apps..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="pl-9 rounded-xl h-10"
           />
         </div>
 
         {/* Categories */}
         <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
           {CATEGORIES.map(cat => (
             <Button
               key={cat}
               variant={selectedCategory === cat ? "default" : "outline"}
               size="sm"
               onClick={() => setSelectedCategory(cat)}
               className="rounded-full text-xs whitespace-nowrap"
             >
               {cat === "Featured" && <Star size={12} className="mr-1" />}
               {cat}
             </Button>
           ))}
         </div>
 
         {/* Connected Apps */}
         {apps.some(a => a.connected) && (
           <div className="mb-8">
             <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
               <Zap size={14} className="text-primary" />
               Connected Apps
             </h2>
             <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
               {apps.filter(a => a.connected).map(app => (
                 <div key={app.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20 whitespace-nowrap">
                   <div className={`w-6 h-6 rounded-lg ${app.color} flex items-center justify-center`}>
                     <app.icon size={14} className="text-white" />
                   </div>
                   <span className="text-xs font-medium">{app.name}</span>
                   <Check size={14} className="text-primary" />
                 </div>
               ))}
             </div>
           </div>
         )}
 
         {/* Apps Grid */}
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
           {filteredApps.map((app) => (
             <motion.div key={app.id} whileHover={{ scale: 1.02 }}>
               <Card className="overflow-hidden hover:border-primary/30 transition-all cursor-pointer">
                 <CardContent className="p-4">
                   <div className="flex items-start justify-between mb-3">
                     <div className={`w-11 h-11 rounded-xl ${app.color} flex items-center justify-center shadow-lg`}>
                       <app.icon size={20} className="text-white" />
                     </div>
                     {app.featured && (
                       <Badge variant="secondary" className="text-[9px]">
                         <Star size={8} className="mr-0.5" />
                         Featured
                       </Badge>
                     )}
                   </div>
                   <h3 className="font-semibold text-sm mb-1">{app.name}</h3>
                   <p className="text-[10px] text-muted-foreground mb-3 line-clamp-2">{app.description}</p>
                   <Button
                     variant={app.connected ? "outline" : "default"}
                     size="sm"
                     className="w-full rounded-xl text-xs h-8"
                     onClick={() => toggleConnection(app.id)}
                   >
                     {app.connected ? (
                       <>
                         <Check size={12} className="mr-1" />
                         Connected
                       </>
                     ) : (
                       "Connect"
                     )}
                   </Button>
                 </CardContent>
               </Card>
             </motion.div>
           ))}
         </div>
 
         {filteredApps.length === 0 && (
           <div className="text-center py-16">
             <Grid className="mx-auto mb-4 text-muted-foreground/50" size={48} />
             <h3 className="text-lg font-semibold mb-2">No apps found</h3>
             <p className="text-sm text-muted-foreground">Try a different search term</p>
           </div>
         )}
       </main>
     </motion.div>
   );
 }