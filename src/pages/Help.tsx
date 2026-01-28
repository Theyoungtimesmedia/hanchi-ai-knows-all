import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowLeft, Search, MessageSquare, Image as ImageIcon, Mic,
  Globe, Brain, Sparkles, Shield, BookOpen, HelpCircle,
  Keyboard, Zap, FileText
} from "lucide-react";

const FAQ_DATA = [
  {
    category: "Getting Started",
    icon: Zap,
    items: [
      {
        q: "What is Hanchi AI?",
        a: "Hanchi AI is Nigeria's smartest AI assistant. It can answer questions, write essays, create images, translate between languages, and help with everyday tasks - all tailored for Nigerian users."
      },
      {
        q: "Is Hanchi free to use?",
        a: "Yes! Hanchi AI is completely free with no premium tiers. All features including image generation, voice translation, and unrestricted mode are available to everyone."
      },
      {
        q: "How do I start a conversation?",
        a: "Simply type your question or request in the chat input at the bottom of the screen and press Enter or tap the send button. You can also use quick actions or the prompt library for inspiration."
      },
    ]
  },
  {
    category: "Chat Features",
    icon: MessageSquare,
    items: [
      {
        q: "What is Think Mode?",
        a: "Think Mode makes Hanchi analyze your question more deeply before responding. Enable it using the 💭 toggle in the header for more thoughtful, detailed answers to complex questions."
      },
      {
        q: "How do I search the web?",
        a: "Toggle the 'Web' switch in the header to enable web search. Hanchi will search the internet for real-time information and include sources in the response."
      },
      {
        q: "Can I edit my messages?",
        a: "Yes! Hover over any of your sent messages and click the edit icon to modify it. Hanchi will regenerate a new response based on your edited message."
      },
      {
        q: "How do I regenerate a response?",
        a: "Click the regenerate (↻) icon below any AI response to get a new answer to the same question."
      },
    ]
  },
  {
    category: "Image & Stickers",
    icon: ImageIcon,
    items: [
      {
        q: "How do I create images?",
        a: "Click the + button and select 'Create image' or simply ask Hanchi to 'create an image of...'. You can choose from multiple styles like realistic, anime, Midjourney, and Nigerian meme styles."
      },
      {
        q: "How do I make Nigerian stickers?",
        a: "Use the 'Nigerian Sticker' option from the + menu. Describe your sticker using Pidgin phrases like 'No wahala', 'E choke', or 'Sapa loading' for authentic Nigerian memes."
      },
      {
        q: "Can I download generated images?",
        a: "Yes! Every generated image has download and share buttons. You can save them directly to your device or share via any app."
      },
    ]
  },
  {
    category: "Voice & Translation",
    icon: Mic,
    items: [
      {
        q: "How does voice translation work?",
        a: "Open 'Voice Translation' from the + menu. Record yourself speaking in English, Hausa, or Pidgin, and Hanchi will translate and speak the translation in your target language."
      },
      {
        q: "Which languages does Hanchi support?",
        a: "Hanchi fully supports English (Nigerian), Hausa, and Nigerian Pidgin for both text and voice interactions."
      },
    ]
  },
  {
    category: "Writing & Essays",
    icon: FileText,
    items: [
      {
        q: "How does Hanchi write essays?",
        a: "Hanchi writes in natural Nigerian Standard English - the kind used in newspapers and universities. It avoids robotic AI phrases and uses simple, direct vocabulary that feels human."
      },
      {
        q: "Can Hanchi help with WAEC/JAMB prep?",
        a: "Absolutely! Use prompts from the Learning category or ask directly. Hanchi can explain concepts, create practice questions, and help you study for any Nigerian exam."
      },
    ]
  },
  {
    category: "Privacy & Safety",
    icon: Shield,
    items: [
      {
        q: "What is Unrestricted Mode?",
        a: "Unrestricted Mode removes content filters for advanced users who need uncensored responses. Enable it from the + menu. Use responsibly."
      },
      {
        q: "Is my data private?",
        a: "Your conversations are stored securely and only accessible to you. You can delete individual conversations or all your data from Settings > Privacy & Data."
      },
      {
        q: "What does Hanchi remember about me?",
        a: "Hanchi learns facts about you to personalize responses (like your profession or interests). View and manage these in Settings > Memory."
      },
    ]
  },
];

const KEYBOARD_SHORTCUTS = [
  { keys: ["⌘", "K"], action: "Open search" },
  { keys: ["⌘", "N"], action: "New conversation" },
  { keys: ["⌘", "P"], action: "Open prompt library" },
  { keys: ["⌘", "/"], action: "Show keyboard shortcuts" },
  { keys: ["Enter"], action: "Send message" },
  { keys: ["Shift", "Enter"], action: "New line in message" },
  { keys: ["Esc"], action: "Close dialog/panel" },
  { keys: ["⌘", ","], action: "Open settings" },
];

export default function Help() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFAQ = FAQ_DATA.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-lg border-b border-border p-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/chat")}
            className="rounded-full"
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Help Center</h1>
            <p className="text-sm text-muted-foreground">
              Everything you need to know about Hanchi
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 max-w-3xl mx-auto w-full">
        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-12 rounded-2xl bg-muted/50 border-border/50 text-base"
          />
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <button
            onClick={() => navigate("/prompts")}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all"
          >
            <BookOpen size={24} className="text-primary" />
            <span className="text-sm font-medium">Prompts</span>
          </button>
          <button
            onClick={() => navigate("/discover")}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all"
          >
            <Sparkles size={24} className="text-amber-500" />
            <span className="text-sm font-medium">Discover</span>
          </button>
          <button
            onClick={() => navigate("/settings")}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all"
          >
            <Brain size={24} className="text-purple-500" />
            <span className="text-sm font-medium">Settings</span>
          </button>
          <button
            onClick={() => navigate("/chat")}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all"
          >
            <MessageSquare size={24} className="text-green-500" />
            <span className="text-sm font-medium">Chat</span>
          </button>
        </div>

        {/* Keyboard Shortcuts Section */}
        <div className="mb-8 p-4 rounded-2xl bg-card border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Keyboard size={20} className="text-primary" />
            <h2 className="font-semibold">Keyboard Shortcuts</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {KEYBOARD_SHORTCUTS.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{shortcut.action}</span>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key, i) => (
                    <kbd
                      key={i}
                      className="px-2 py-1 rounded-md bg-muted text-xs font-mono font-medium"
                    >
                      {key}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-6">
          {filteredFAQ.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.category} className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <Icon size={18} className="text-primary" />
                  <h2 className="font-semibold text-lg">{category.category}</h2>
                </div>
                <Accordion type="single" collapsible className="space-y-2">
                  {category.items.map((item, index) => (
                    <AccordionItem
                      key={index}
                      value={`${category.category}-${index}`}
                      className="border border-border rounded-xl px-4 bg-card"
                    >
                      <AccordionTrigger className="text-left text-sm font-medium py-3 hover:no-underline">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground pb-4">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            );
          })}
        </div>

        {filteredFAQ.length === 0 && (
          <div className="text-center py-12">
            <HelpCircle size={48} className="mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
          </div>
        )}

        {/* Contact Section */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-border text-center">
          <h3 className="font-semibold mb-2">Still need help?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Ask Hanchi directly - it knows everything about itself!
          </p>
          <Button onClick={() => navigate("/chat")} className="rounded-full">
            <MessageSquare size={16} className="mr-2" />
            Ask Hanchi
          </Button>
        </div>
      </div>
    </div>
  );
}
