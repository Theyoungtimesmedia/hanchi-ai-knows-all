import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Search, Pen, Share2, GraduationCap, Code, Briefcase, 
  Sparkles, Heart, Lightbulb, MessageSquare, FileText, Mail, 
  Calculator, Globe, BookOpen, Mic, Image as ImageIcon, Copy, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import hanchiLogo from "@/assets/hanchi-nose-logo.png";

interface Prompt {
  id: string;
  title: string;
  description: string;
  prompt: string;
  icon: React.ReactNode;
}

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  prompts: Prompt[];
}

const categories: Category[] = [
  {
    id: "writing",
    name: "Writing",
    icon: <Pen size={20} />,
    color: "bg-blue-500",
    prompts: [
      { id: "w1", title: "Professional Email", description: "Draft a formal business email", prompt: "Write a professional email to [recipient] about [topic]. Keep it formal, clear, and concise. Include a proper greeting and sign-off.", icon: <Mail size={18} /> },
      { id: "w2", title: "Essay Writer", description: "Write essays on any topic", prompt: "Write a well-structured essay about [topic]. Include an introduction with a clear thesis, 3 body paragraphs with examples, and a conclusion. Use Nigerian Standard English and simple, clear language.", icon: <FileText size={18} /> },
      { id: "w3", title: "CV/Resume", description: "Create a professional CV", prompt: "Help me create a professional CV for a [job title] position. I have experience in [experience]. Include sections for education, skills, and work experience in Nigerian format.", icon: <Briefcase size={18} /> },
      { id: "w4", title: "Cover Letter", description: "Write a compelling cover letter", prompt: "Write a cover letter for a [job title] position at [company]. Highlight my skills in [skills] and my passion for [industry]. Make it personal and professional.", icon: <FileText size={18} /> },
      { id: "w5", title: "WhatsApp Message", description: "Draft the perfect WhatsApp message", prompt: "Help me write a [type: professional/casual/romantic] WhatsApp message to [recipient] about [topic]. Make it friendly and natural.", icon: <MessageSquare size={18} /> },
      { id: "w6", title: "Blog Post", description: "Create engaging blog content", prompt: "Write a blog post about [topic] for [target audience]. Make it engaging, informative, and SEO-friendly. Include a catchy headline and subheadings.", icon: <Globe size={18} /> },
    ]
  },
  {
    id: "social",
    name: "Social Media",
    icon: <Share2 size={20} />,
    color: "bg-pink-500",
    prompts: [
      { id: "s1", title: "Instagram Caption", description: "Create engaging IG captions", prompt: "Write an engaging Instagram caption for a photo about [topic]. Include relevant hashtags and a call-to-action. Make it catchy and relatable for Nigerian youth.", icon: <MessageSquare size={18} /> },
      { id: "s2", title: "Twitter/X Thread", description: "Create viral threads", prompt: "Create a Twitter/X thread about [topic]. Make it informative, engaging, and break it into 5-7 tweets. Include relevant hashtags.", icon: <MessageSquare size={18} /> },
      { id: "s3", title: "LinkedIn Post", description: "Professional networking posts", prompt: "Write a LinkedIn post about [topic] that will engage professionals and show thought leadership. Keep it professional but personable.", icon: <Briefcase size={18} /> },
      { id: "s4", title: "TikTok Script", description: "Scripts for viral TikToks", prompt: "Write a TikTok video script about [topic]. Include hook (first 3 seconds), main content, and call-to-action. Make it trendy and engaging for Nigerian audience.", icon: <MessageSquare size={18} /> },
      { id: "s5", title: "YouTube Description", description: "Optimize your video descriptions", prompt: "Write a YouTube video description for a video about [topic]. Include relevant keywords, timestamps, links, and a call-to-action for subscribers.", icon: <Globe size={18} /> },
      { id: "s6", title: "Bio Generator", description: "Create the perfect bio", prompt: "Create a [platform] bio for someone who is a [profession/personality]. Make it memorable, professional, and include a touch of personality. Keep it within character limits.", icon: <MessageSquare size={18} /> },
    ]
  },
  {
    id: "learning",
    name: "Learning",
    icon: <GraduationCap size={20} />,
    color: "bg-green-500",
    prompts: [
      { id: "l1", title: "WAEC/NECO Prep", description: "Study for West African exams", prompt: "Help me study for my [subject] WAEC/NECO exam. Explain [topic] in simple terms with examples. Include practice questions.", icon: <GraduationCap size={18} /> },
      { id: "l2", title: "JAMB Prep", description: "University entrance preparation", prompt: "Help me prepare for JAMB [subject]. Explain [topic] clearly, give me key points to remember, and provide 5 practice questions with answers.", icon: <BookOpen size={18} /> },
      { id: "l3", title: "Math Problem Solver", description: "Solve math step-by-step", prompt: "Solve this math problem step-by-step: [problem]. Explain each step clearly so I understand the concept, not just the answer.", icon: <Calculator size={18} /> },
      { id: "l4", title: "Concept Explainer", description: "Understand complex topics", prompt: "Explain [concept] to me like I'm a secondary school student. Use simple language, real-world examples, and relate it to Nigerian context if possible.", icon: <Lightbulb size={18} /> },
      { id: "l5", title: "Study Plan Creator", description: "Organize your study schedule", prompt: "Create a study plan for my [exam] exams. I have [time available] to prepare. Include subjects: [subjects]. Balance it well and include break times.", icon: <BookOpen size={18} /> },
      { id: "l6", title: "Language Translator", description: "Translate between languages", prompt: "Translate this text from [source language] to [target language]: [text]. Keep the meaning accurate and natural-sounding.", icon: <Globe size={18} /> },
    ]
  },
  {
    id: "coding",
    name: "Coding",
    icon: <Code size={20} />,
    color: "bg-purple-500",
    prompts: [
      { id: "c1", title: "Code Generator", description: "Generate code in any language", prompt: "Write [language] code to [task]. Include comments explaining each section, error handling, and example usage.", icon: <Code size={18} /> },
      { id: "c2", title: "Bug Fixer", description: "Debug and fix code errors", prompt: "I have a bug in my code. Here's the code: [code]. The error I'm getting is: [error]. Please fix it and explain what was wrong.", icon: <Code size={18} /> },
      { id: "c3", title: "Code Explainer", description: "Understand code you didn't write", prompt: "Explain this code line by line: [code]. Tell me what it does, why it works, and suggest any improvements.", icon: <Code size={18} /> },
      { id: "c4", title: "API Integration", description: "Connect to external services", prompt: "Show me how to integrate [API name] API in [language/framework]. Include authentication, making requests, and handling responses with error handling.", icon: <Globe size={18} /> },
      { id: "c5", title: "Database Query", description: "SQL and NoSQL queries", prompt: "Write a [SQL/MongoDB] query to [task]. The table/collection structure is: [structure]. Include comments and explain the query.", icon: <Code size={18} /> },
      { id: "c6", title: "Algorithm Helper", description: "Understand and implement algorithms", prompt: "Explain the [algorithm name] algorithm. Show me how it works step-by-step, the time complexity, and implement it in [language].", icon: <Lightbulb size={18} /> },
    ]
  },
  {
    id: "business",
    name: "Business",
    icon: <Briefcase size={20} />,
    color: "bg-orange-500",
    prompts: [
      { id: "b1", title: "Business Plan", description: "Create a business plan", prompt: "Help me create a business plan for a [business type] in Nigeria. Include executive summary, market analysis, financial projections, and marketing strategy.", icon: <Briefcase size={18} /> },
      { id: "b2", title: "Marketing Copy", description: "Write compelling ad copy", prompt: "Write marketing copy for [product/service]. Target audience is [audience]. Highlight benefits, create urgency, and include a strong call-to-action.", icon: <MessageSquare size={18} /> },
      { id: "b3", title: "Proposal Writer", description: "Create winning proposals", prompt: "Write a business proposal for [project] to [client/company]. Include problem statement, proposed solution, timeline, and pricing.", icon: <FileText size={18} /> },
      { id: "b4", title: "Product Description", description: "Sell products with words", prompt: "Write a product description for [product]. Highlight key features, benefits, and why customers should buy it. Make it compelling for Nigerian market.", icon: <MessageSquare size={18} /> },
      { id: "b5", title: "Meeting Agenda", description: "Organize productive meetings", prompt: "Create a meeting agenda for [meeting purpose]. Include welcome, main topics, action items, and next steps. Duration: [time].", icon: <FileText size={18} /> },
      { id: "b6", title: "Invoice Template", description: "Create professional invoices", prompt: "Create an invoice template for my [business type] business. Include space for services, pricing, payment terms, and bank details (Nigerian format).", icon: <FileText size={18} /> },
    ]
  },
  {
    id: "creative",
    name: "Creative",
    icon: <Sparkles size={20} />,
    color: "bg-yellow-500",
    prompts: [
      { id: "cr1", title: "Story Writer", description: "Create stories and fiction", prompt: "Write a short story about [topic/theme]. Set it in Nigeria and make it engaging with interesting characters and a surprising twist.", icon: <Sparkles size={18} /> },
      { id: "cr2", title: "Image Prompt", description: "Generate AI image prompts", prompt: "Create a detailed image generation prompt for: [description]. Include style, lighting, mood, and composition details for best results.", icon: <ImageIcon size={18} /> },
      { id: "cr3", title: "Song Lyrics", description: "Write song lyrics", prompt: "Write song lyrics about [topic] in [genre: Afrobeats/Hip-hop/R&B] style. Include a catchy hook, verses, and bridge. Make it suitable for Nigerian artists.", icon: <Mic size={18} /> },
      { id: "cr4", title: "Poem Generator", description: "Create beautiful poetry", prompt: "Write a poem about [topic]. Style: [rhyming/free verse/haiku]. Make it emotional and meaningful.", icon: <Heart size={18} /> },
      { id: "cr5", title: "Brainstorming", description: "Generate creative ideas", prompt: "Brainstorm 10 creative ideas for [topic/project]. Think outside the box and consider Nigerian context. Include brief explanations for each.", icon: <Lightbulb size={18} /> },
      { id: "cr6", title: "Name Generator", description: "Create names for anything", prompt: "Generate 10 creative names for my [business/product/project] that [does what]. The names should be memorable, easy to pronounce, and relevant to Nigerian market.", icon: <Sparkles size={18} /> },
    ]
  },
];

export default function Prompts() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredCategories = categories.map(cat => ({
    ...cat,
    prompts: cat.prompts.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => 
    !selectedCategory || cat.id === selectedCategory
  ).filter(cat => cat.prompts.length > 0);

  const copyPrompt = (prompt: Prompt) => {
    navigator.clipboard.writeText(prompt.prompt);
    setCopiedId(prompt.id);
    toast({ title: "Prompt copied! 👃", description: "Paste it in the chat to use" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const usePrompt = (prompt: Prompt) => {
    navigate("/chat", { state: { initialPrompt: prompt.prompt } });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <div className="flex items-center gap-2">
            <img src={hanchiLogo} alt="Hanchi" className="w-8 h-8 rounded-full" />
            <h1 className="text-xl font-bold text-foreground">Prompt Library</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            placeholder="Search prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 rounded-full bg-card border-border"
          />
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-thin">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
            className="rounded-full shrink-0"
          >
            All
          </Button>
          {categories.map(cat => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat.id)}
              className="rounded-full shrink-0 gap-2"
            >
              {cat.icon}
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Prompts Grid */}
        <div className="space-y-8">
          {filteredCategories.map((category, catIndex) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIndex * 0.1 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl ${category.color} flex items-center justify-center text-white`}>
                  {category.icon}
                </div>
                <h2 className="text-xl font-bold text-foreground">{category.name}</h2>
                <span className="text-sm text-muted-foreground">({category.prompts.length})</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.prompts.map((prompt, index) => (
                  <motion.div
                    key={prompt.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card border border-border rounded-2xl p-4 hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                        {prompt.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{prompt.title}</h3>
                        <p className="text-sm text-muted-foreground">{prompt.description}</p>
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4 bg-muted/50 p-2 rounded-lg">
                      {prompt.prompt.substring(0, 100)}...
                    </p>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2"
                        onClick={() => copyPrompt(prompt)}
                      >
                        {copiedId === prompt.id ? <Check size={14} /> : <Copy size={14} />}
                        {copiedId === prompt.id ? "Copied!" : "Copy"}
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 gap-2"
                        onClick={() => usePrompt(prompt)}
                      >
                        <MessageSquare size={14} />
                        Use
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-20">
            <Search size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No prompts found</h3>
            <p className="text-muted-foreground">Try a different search term</p>
          </div>
        )}
      </main>
    </div>
  );
}
