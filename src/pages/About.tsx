import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Globe, Zap, Users, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import hanchiLogo from "@/assets/hanchi-nose-logo.png";

const values = [
  {
    icon: <Globe size={24} />,
    title: "Nigerian-First",
    description: "Built specifically for Nigerians, understanding our languages, culture, and unique challenges."
  },
  {
    icon: <Heart size={24} />,
    title: "Free Forever",
    description: "We believe AI should be accessible to everyone. Hanchi is completely free with no hidden costs."
  },
  {
    icon: <Zap size={24} />,
    title: "Fast & Reliable",
    description: "Optimized for Nigerian network conditions. Get quick responses even on slow connections."
  },
  {
    icon: <Shield size={24} />,
    title: "Privacy-First",
    description: "Your data stays private. We don't sell or share your conversations with anyone."
  }
];

const stats = [
  { value: "100K+", label: "Users" },
  { value: "1M+", label: "Messages Answered" },
  { value: "4", label: "Languages" },
  { value: "24/7", label: "Available" }
];

export default function About() {
  const navigate = useNavigate();

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
            <h1 className="text-xl font-bold text-foreground">About Hanchi</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="mb-6"
          >
            <img src={hanchiLogo} alt="Hanchi AI" className="w-24 h-24 mx-auto rounded-3xl shadow-lg" />
          </motion.div>
          <h2 className="text-3xl font-bold text-foreground mb-4">
            The AI That Noses Out Everything 👃🏿
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hanchi AI is Nigeria's smartest AI assistant, built to understand our languages, 
            culture, and the unique challenges we face every day. We're not just another chatbot - 
            we're your smart friend who truly gets you.
          </p>
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-primary/10 via-primary/5 to-orange-500/10 rounded-3xl p-8 mb-12"
        >
          <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="text-primary" />
            Our Mission
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            To make AI accessible to every Nigerian, regardless of their location, language, or economic status. 
            We believe that AI can be a powerful tool for education, productivity, and creativity - 
            and everyone deserves access to it. That's why Hanchi is and will always be free.
          </p>
        </motion.div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <h3 className="text-xl font-bold text-foreground mb-6 text-center">What We Stand For</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                  {value.icon}
                </div>
                <h4 className="font-semibold text-foreground mb-2">{value.title}</h4>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border border-border rounded-3xl p-8 mb-12"
        >
          <h3 className="text-xl font-bold text-foreground mb-6 text-center flex items-center justify-center gap-2">
            <Users className="text-primary" />
            Hanchi in Numbers
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Why Hanchi */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-12"
        >
          <h3 className="text-xl font-bold text-foreground mb-6 text-center">Why "Hanchi"?</h3>
          <div className="bg-card border border-border rounded-2xl p-6">
            <p className="text-muted-foreground leading-relaxed mb-4">
              The name "Hanchi" is inspired by the Hausa word for "nose" - <strong>hanci</strong>. 
              Just like a nose that detects and identifies everything around it, Hanchi AI 
              "noses out" answers to your questions, finding information and solutions with precision.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The nose emoji 👃🏿 represents our commitment to being authentically Nigerian - 
              understanding the nuances, culture, and lived experiences of our users. 
              When you ask Hanchi a question, you're getting answers from an AI that truly 
              understands your world.
            </p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <h3 className="text-xl font-bold text-foreground mb-4">Ready to start nosing? 👃🏿</h3>
          <Button size="lg" onClick={() => navigate("/chat")} className="rounded-full px-8">
            Start Chatting
          </Button>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 pt-8 border-t border-border text-center text-sm text-muted-foreground"
        >
          <p>Made with ❤️ for Nigeria</p>
          <p className="mt-2">© 2025 Hanchi AI. The AI that noses out everything.</p>
        </motion.div>
      </main>
    </div>
  );
}
