import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Search, MessageSquare, HelpCircle, ChevronDown, Mail, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import hanchiLogo from "@/assets/hanchi-nose-logo.png";

const faqs = [
  {
    category: "Getting Started",
    questions: [
      {
        q: "What is Hanchi AI?",
        a: "Hanchi AI is Nigeria's smartest AI assistant that 'noses out' answers. It's like ChatGPT but optimized for Nigerians - understanding our languages (English, Hausa, Pidgin), culture, and daily challenges. Best part? It's completely FREE!"
      },
      {
        q: "How do I start using Hanchi?",
        a: "Just sign up with your email, and you're good to go! No credit card required. Type or speak your questions in the chat, and Hanchi will nose out the answers for you."
      },
      {
        q: "Is Hanchi really free?",
        a: "Yes! Hanchi is 100% free for everyone. No hidden charges, no premium tiers, no limits. We believe AI should be accessible to all Nigerians."
      },
      {
        q: "What languages does Hanchi support?",
        a: "Hanchi supports English (Nigerian & American), Hausa, and Nigerian Pidgin. You can switch languages anytime, and Hanchi understands code-switching too!"
      }
    ]
  },
  {
    category: "Features",
    questions: [
      {
        q: "What can I use Hanchi for?",
        a: "Almost everything! Write emails, essays, CVs, code, solve math problems, translate languages, create images, study for WAEC/JAMB/NECO, draft WhatsApp messages, brainstorm ideas, and so much more."
      },
      {
        q: "How do I generate images?",
        a: "Tap the + button in the chat, select 'Create image', describe what you want, and Hanchi will generate it for you. You can also create Nigerian-style WhatsApp stickers!"
      },
      {
        q: "What is 'Think Before Talk' mode?",
        a: "When enabled, Hanchi takes extra time to think through complex questions before answering. This gives you more accurate, well-reasoned responses. Great for essays, coding, and important decisions."
      },
      {
        q: "What is Unrestricted Mode?",
        a: "Unrestricted Mode reduces content filters for creative writing and roleplay. Use responsibly - Hanchi still won't help with anything illegal or harmful."
      },
      {
        q: "Can Hanchi help with my exams?",
        a: "Absolutely! Hanchi is excellent for WAEC, NECO, and JAMB preparation. It can explain concepts, solve practice questions step-by-step, create study plans, and quiz you on topics."
      }
    ]
  },
  {
    category: "Voice & Translation",
    questions: [
      {
        q: "How do I use voice input?",
        a: "Tap the microphone button and speak. Hanchi will transcribe your words into text. You can speak in English, Hausa, or Pidgin."
      },
      {
        q: "Can Hanchi translate my voice?",
        a: "Yes! Use the Voice Translation feature (+ menu → Voice Translation) to speak in one language and get translations in another. Great for learning languages!"
      },
      {
        q: "Does Hanchi speak back to me?",
        a: "Yes! Tap the speaker icon on any message to hear it read aloud. Hanchi uses Nigerian-accented voices for a natural experience."
      }
    ]
  },
  {
    category: "Account & Privacy",
    questions: [
      {
        q: "Is my data safe with Hanchi?",
        a: "Absolutely. We don't sell your data or share it with third parties. Your conversations are private and encrypted. You can delete your data anytime from Settings."
      },
      {
        q: "Can I use Hanchi offline?",
        a: "Hanchi needs internet to work since it uses cloud AI. However, you can still open the app and view your past conversations offline."
      },
      {
        q: "How do I delete my account?",
        a: "Go to Settings → Account → Delete Account. This will permanently remove all your data. Note: This action cannot be undone."
      }
    ]
  },
  {
    category: "Troubleshooting",
    questions: [
      {
        q: "Hanchi is not responding. What do I do?",
        a: "First, check your internet connection. If it's working, try refreshing the page. If the problem persists, clear your browser cache or try a different browser."
      },
      {
        q: "My voice recording isn't working.",
        a: "Make sure you've allowed microphone access in your browser. Check your browser settings: Settings → Privacy → Site Settings → Microphone."
      },
      {
        q: "Images are not generating.",
        a: "Image generation may take a few seconds. If it fails, try a simpler prompt or check your internet connection. If problems persist, try again later."
      },
      {
        q: "The app is slow.",
        a: "Try closing other tabs to free up memory. Clear your browser cache. For best performance, use Chrome or Edge on desktop, or the installed PWA on mobile."
      }
    ]
  }
];

export default function Help() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = faqs.map(cat => ({
    ...cat,
    questions: cat.questions.filter(q =>
      q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.questions.length > 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <div className="flex items-center gap-2">
            <img src={hanchiLogo} alt="Hanchi" className="w-8 h-8 rounded-full" />
            <h1 className="text-xl font-bold text-foreground">Help Center</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="text-6xl mb-4">❓</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">How can we help you?</h2>
          <p className="text-muted-foreground">Find answers to common questions about Hanchi AI</p>
        </motion.div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 h-12 rounded-full bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Button
            variant="outline"
            className="h-auto py-4 px-6 justify-start gap-4 rounded-2xl"
            onClick={() => navigate("/chat")}
          >
            <MessageSquare className="text-primary" size={24} />
            <div className="text-left">
              <div className="font-semibold">Ask Hanchi</div>
              <div className="text-sm text-muted-foreground">Get help directly from Hanchi AI</div>
            </div>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 px-6 justify-start gap-4 rounded-2xl"
            onClick={() => window.open("mailto:support@hanchi.ai", "_blank")}
          >
            <Mail className="text-primary" size={24} />
            <div className="text-left">
              <div className="font-semibold">Contact Support</div>
              <div className="text-sm text-muted-foreground">Email us for more help</div>
            </div>
          </Button>
        </div>

        {/* FAQs */}
        <div className="space-y-6">
          {filteredFaqs.map((category, catIndex) => (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIndex * 0.1 }}
            >
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <HelpCircle size={20} className="text-primary" />
                {category.category}
              </h3>
              <Accordion type="single" collapsible className="bg-card border border-border rounded-2xl overflow-hidden">
                {category.questions.map((faq, index) => (
                  <AccordionItem key={index} value={`${category.category}-${index}`} className="border-border">
                    <AccordionTrigger className="px-6 py-4 hover:bg-muted/50 text-left">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4 text-muted-foreground">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          ))}
        </div>

        {filteredFaqs.length === 0 && (
          <div className="text-center py-20">
            <Search size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No results found</h3>
            <p className="text-muted-foreground mb-4">Try a different search term</p>
            <Button onClick={() => navigate("/chat")}>
              Ask Hanchi Instead
            </Button>
          </div>
        )}

        {/* Still Need Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-r from-primary/10 via-primary/5 to-orange-500/10 rounded-3xl p-8 text-center"
        >
          <h3 className="text-xl font-bold text-foreground mb-2">Still need help? 👃</h3>
          <p className="text-muted-foreground mb-4">
            Can't find what you're looking for? Ask Hanchi directly or contact our support team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate("/chat")}>
              <MessageSquare size={18} className="mr-2" />
              Ask Hanchi
            </Button>
            <Button variant="outline" onClick={() => window.open("mailto:support@hanchi.ai", "_blank")}>
              <Mail size={18} className="mr-2" />
              Email Support
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
