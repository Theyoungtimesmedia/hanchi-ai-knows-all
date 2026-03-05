import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";

import nosyDefault from "@/assets/nosy-default.png";
import nosyCurious from "@/assets/nosy-curious.png";
import nosyHappy from "@/assets/nosy-happy.png";
import nosyBored from "@/assets/nosy-bored.png";
import nosyWorried from "@/assets/nosy-worried.png";
import nosyThinking from "@/assets/nosy-thinking.png";
import nosyWaving from "@/assets/nosy-waving.png";
import nosyPixar from "@/assets/nosy-pixar.png";
import nosyGhibli from "@/assets/nosy-ghibli.png";
import nosyClay from "@/assets/nosy-clay.png";

export type NosyMood = "idle" | "curious" | "thinking" | "happy" | "worried" | "bored" | "waving";

interface NosyMascotProps {
  isLoading?: boolean;
  isStreaming?: boolean;
  messageCount?: number;
  hasError?: boolean;
  lastMessageContent?: string;
  isFirstMessage?: boolean;
  variant?: "chat" | "landing";
}

const STYLE_CYCLE = [
  { src: nosyBored, label: "Bored" },
  { src: nosyPixar, label: "Pixar" },
  { src: nosyGhibli, label: "Ghibli" },
  { src: nosyClay, label: "Clay" },
];

const CONTEXT_TIPS: Record<string, string[]> = {
  code: [
    "Ooh code! Let me check for bugs... 🐛",
    "Nice syntax! I'd add a semicolon though 😏",
    "That's clean code right there 💻",
  ],
  image: [
    "Creating something beautiful! 🎨",
    "Ooh let me see the art! 👀",
    "I love watching art come to life ✨",
  ],
  first: [
    "Welcome! Your first message! 🎉",
    "Oya let's go! First message unlocked 🔓",
    "The journey begins! 🚀",
  ],
  greeting: [
    "Hey hey! What's good? 👋",
    "Omo, welcome back! 🤝",
  ],
  default: [
    "Try asking me about Nigerian history! 🇳🇬",
    "I can help you write code too 👀",
    "Press ⌘K for quick actions!",
    "Ask me to create an image for you 🎨",
    "I can translate between English, Yoruba & Pidgin!",
    "Want style advice? Just ask! 👔",
    "Omo, don't just stare at me... type something!",
    "I'm literally the nosiest AI ever created 👃",
    "Need help with JAMB prep? Say less 📚",
    "I can help with your CV or cover letter ✍️",
  ],
};

const MOOD_IMAGES: Record<NosyMood, string> = {
  idle: nosyDefault,
  curious: nosyCurious,
  thinking: nosyThinking,
  happy: nosyHappy,
  worried: nosyWorried,
  bored: nosyBored,
  waving: nosyWaving,
};

// Animation configs per mood
const MOOD_ANIMATIONS: Record<NosyMood, any> = {
  idle: {
    y: [0, -6, 0],
    rotate: [0, 1, -1, 0],
    transition: { y: { duration: 3, repeat: Infinity, ease: "easeInOut" }, rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" } },
  },
  curious: {
    y: [0, -3, 0],
    rotate: [-5, -8, -5],
    scale: [1, 1.05, 1],
    transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
  },
  thinking: {
    y: [0, -8, 0],
    rotate: [0, 3, -3, 0],
    scale: [1, 1.02, 1],
    transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
  },
  happy: {
    y: [0, -12, 0, -8, 0],
    rotate: [0, -5, 5, -3, 0],
    scale: [1, 1.1, 0.95, 1.05, 1],
    transition: { duration: 0.8, repeat: Infinity, ease: "easeOut" },
  },
  worried: {
    y: [0, -2, 0],
    x: [-2, 2, -2],
    rotate: [0, -2, 2, 0],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
  },
  bored: {
    y: [0, -2, 0],
    rotate: [0, 2, 0],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
  },
  waving: {
    y: [0, -4, 0],
    rotate: [0, -3, 3, 0],
    scale: [1, 1.05, 1],
    transition: { duration: 1, repeat: 3, ease: "easeInOut" },
  },
};

function getContextTip(lastContent?: string, isFirst?: boolean): string {
  if (isFirst) {
    const tips = CONTEXT_TIPS.first;
    return tips[Math.floor(Math.random() * tips.length)];
  }
  if (lastContent) {
    if (lastContent.includes("```")) {
      const tips = CONTEXT_TIPS.code;
      return tips[Math.floor(Math.random() * tips.length)];
    }
    if (/image|picture|draw|paint|create/i.test(lastContent)) {
      const tips = CONTEXT_TIPS.image;
      return tips[Math.floor(Math.random() * tips.length)];
    }
    if (/^(hi|hello|hey|sup|what's up|yo)/i.test(lastContent)) {
      const tips = CONTEXT_TIPS.greeting;
      return tips[Math.floor(Math.random() * tips.length)];
    }
  }
  const tips = CONTEXT_TIPS.default;
  return tips[Math.floor(Math.random() * tips.length)];
}

export const NosyMascot = ({
  isLoading,
  isStreaming,
  messageCount = 0,
  hasError,
  lastMessageContent,
  isFirstMessage,
  variant = "chat",
}: NosyMascotProps) => {
  const [mood, setMood] = useState<NosyMood>(variant === "landing" ? "waving" : "idle");
  const [showTip, setShowTip] = useState(false);
  const [tipText, setTipText] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [boredStyleIndex, setBoredStyleIndex] = useState(0);
  const [isCyclingStyles, setIsCyclingStyles] = useState(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const styleCycleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevMsgCount = useRef(messageCount);
  const controls = useAnimation();
  const constraintsRef = useRef<HTMLDivElement>(null);

  // Landing page: wave then idle
  useEffect(() => {
    if (variant === "landing") {
      setMood("waving");
      setTipText("Hey! Come check out Hanchi AI! 👋");
      setShowTip(true);
      const t1 = setTimeout(() => { setMood("idle"); setShowTip(false); }, 4000);
      return () => clearTimeout(t1);
    }
  }, [variant]);

  // React to loading/streaming/error
  useEffect(() => {
    if (hasError) {
      setMood("worried");
      setTipText("Something went wrong... 😰");
      setShowTip(true);
      setTimeout(() => setShowTip(false), 3000);
      setIsCyclingStyles(false);
    } else if (isLoading || isStreaming) {
      setMood("thinking");
      setIsCyclingStyles(false);
    }
  }, [isLoading, isStreaming, hasError]);

  // React to new messages
  useEffect(() => {
    if (messageCount > prevMsgCount.current && !isLoading && !isStreaming) {
      setMood("happy");
      setIsCyclingStyles(false);

      // Context-aware tip
      if (messageCount === 1 || isFirstMessage) {
        setTipText(getContextTip(undefined, true));
        setShowTip(true);
      } else if (lastMessageContent) {
        setTipText(getContextTip(lastMessageContent));
        setShowTip(true);
      }

      const t = setTimeout(() => { setMood("idle"); setShowTip(false); }, 3500);
      prevMsgCount.current = messageCount;
      return () => clearTimeout(t);
    }
    prevMsgCount.current = messageCount;
  }, [messageCount, isLoading, isStreaming, lastMessageContent, isFirstMessage]);

  // Idle → bored after 30s
  useEffect(() => {
    if (mood === "idle" && !isLoading && !isStreaming && variant === "chat") {
      idleTimerRef.current = setTimeout(() => {
        setMood("bored");
        setIsCyclingStyles(true);
      }, 30000);
    }
    return () => { if (idleTimerRef.current) clearTimeout(idleTimerRef.current); };
  }, [mood, isLoading, isStreaming, variant]);

  // Style cycling when bored
  useEffect(() => {
    if (isCyclingStyles) {
      styleCycleRef.current = setInterval(() => {
        setBoredStyleIndex(prev => (prev + 1) % STYLE_CYCLE.length);
      }, 3000);
    }
    return () => { if (styleCycleRef.current) clearInterval(styleCycleRef.current); };
  }, [isCyclingStyles]);

  // Periodic idle tips
  useEffect(() => {
    if ((mood === "bored" || mood === "idle") && variant === "chat") {
      const tipTimer = setInterval(() => {
        setTipText(getContextTip(lastMessageContent));
        setShowTip(true);
        setTimeout(() => setShowTip(false), 4000);
      }, 18000);
      return () => clearInterval(tipTimer);
    }
  }, [mood, variant, lastMessageContent]);

  // Wake up on typing
  useEffect(() => {
    const handleActivity = () => {
      if (mood === "bored" || mood === "idle") {
        setMood("curious");
        setIsCyclingStyles(false);
        setTimeout(() => setMood("idle"), 2000);
      }
    };
    window.addEventListener("keydown", handleActivity);
    return () => window.removeEventListener("keydown", handleActivity);
  }, [mood]);

  const handleClick = useCallback(() => {
    if (isDragging) return;
    setTipText(getContextTip(lastMessageContent));
    setShowTip(true);
    setMood("happy");
    setIsCyclingStyles(false);
    controls.start({
      scale: [1, 1.25, 0.85, 1.15, 1],
      rotate: [0, -15, 15, -8, 0],
      transition: { duration: 0.6 },
    });
    setTimeout(() => { setShowTip(false); setMood("idle"); }, 4000);
  }, [isDragging, controls, lastMessageContent]);

  const getCurrentImage = () => {
    if (isCyclingStyles && mood === "bored") return STYLE_CYCLE[boredStyleIndex].src;
    return MOOD_IMAGES[mood] || nosyDefault;
  };

  const getCurrentLabel = () => {
    if (isCyclingStyles && mood === "bored") return STYLE_CYCLE[boredStyleIndex].label;
    return null;
  };

  const currentAnimation = MOOD_ANIMATIONS[mood] || MOOD_ANIMATIONS.idle;

  if (isMinimized) {
    return (
      <motion.button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full bg-card border border-border shadow-lg shadow-primary/20 flex items-center justify-center overflow-hidden"
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", damping: 12 }}
      >
        <img src={nosyDefault} alt="Nosy" className="w-11 h-11 object-contain" />
      </motion.button>
    );
  }

  const size = variant === "landing" ? "w-32 h-32 md:w-40 md:h-40" : "w-24 h-24 md:w-28 md:h-28";
  const position = variant === "landing" ? "" : "absolute bottom-20 right-4";

  return (
    <div ref={constraintsRef} className={variant === "chat" ? "fixed inset-0 pointer-events-none z-50" : "relative pointer-events-none"}>
      <motion.div
        drag={variant === "chat"}
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setTimeout(() => setIsDragging(false), 100)}
        className={`pointer-events-auto ${position} cursor-grab active:cursor-grabbing`}
        initial={{ y: 80, opacity: 0, scale: 0.5 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 14, stiffness: 180, delay: variant === "landing" ? 0.8 : 0.5 }}
      >
        {/* Speech bubble */}
        <AnimatePresence>
          {showTip && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.7 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.7 }}
              transition={{ type: "spring", damping: 15 }}
              className="absolute bottom-full right-0 mb-3 max-w-[220px] z-10"
            >
              <div className="bg-card border border-border/60 rounded-2xl rounded-br-sm px-3.5 py-2.5 shadow-xl backdrop-blur-sm">
                <p className="text-[11px] text-foreground leading-relaxed font-medium">{tipText}</p>
              </div>
              {/* Bubble tail */}
              <div className="absolute -bottom-1.5 right-4 w-3 h-3 bg-card border-r border-b border-border/60 rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Style label when cycling */}
        <AnimatePresence>
          {getCurrentLabel() && (
            <motion.div
              key={getCurrentLabel()}
              initial={{ opacity: 0, y: -8, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.8 }}
              className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[9px] font-bold px-2.5 py-0.5 rounded-full shadow-lg whitespace-nowrap z-10"
            >
              {getCurrentLabel()} mode ✨
            </motion.div>
          )}
        </AnimatePresence>

        {/* Character with real animations */}
        <motion.div onClick={handleClick} animate={controls} className="relative select-none group">
          {/* Dynamic glow based on mood */}
          <motion.div
            className="absolute inset-[-12px] rounded-full"
            animate={{
              boxShadow: mood === "thinking"
                ? ["0 0 25px 10px hsl(var(--primary) / 0.25)", "0 0 45px 15px hsl(var(--primary) / 0.45)", "0 0 25px 10px hsl(var(--primary) / 0.25)"]
                : mood === "happy"
                ? ["0 0 20px 8px hsl(142 71% 45% / 0.2)", "0 0 35px 12px hsl(142 71% 45% / 0.35)", "0 0 20px 8px hsl(142 71% 45% / 0.2)"]
                : mood === "worried"
                ? "0 0 15px 5px hsl(0 84% 60% / 0.15)"
                : "0 0 12px 4px hsl(var(--primary) / 0.1)",
            }}
            transition={{ duration: mood === "thinking" ? 1 : 2, repeat: (mood === "thinking" || mood === "happy") ? Infinity : 0 }}
          />

          {/* Animated character image */}
          <AnimatePresence mode="wait">
            <motion.div
              key={getCurrentImage() + mood}
              initial={{ opacity: 0, scale: 0.6, rotate: -15 }}
              animate={{
                opacity: 1,
                scale: 1,
                rotate: 0,
                ...currentAnimation,
              }}
              exit={{ opacity: 0, scale: 0.6, rotate: 15 }}
              transition={{
                opacity: { duration: 0.3 },
                scale: { duration: 0.4, type: "spring" },
                rotate: { duration: 0.3 },
                ...currentAnimation.transition,
              }}
              className={size}
            >
              <img
                src={getCurrentImage()}
                alt={`Nosy - ${mood}`}
                className="w-full h-full object-contain drop-shadow-2xl"
                draggable={false}
                style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.15))" }}
              />
            </motion.div>
          </AnimatePresence>

          {/* Mood indicator dot */}
          <motion.div
            className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-background ${
              mood === "happy" ? "bg-emerald-400" :
              mood === "thinking" ? "bg-amber-400" :
              mood === "worried" ? "bg-red-400" :
              mood === "bored" ? "bg-muted-foreground" :
              "bg-primary"
            }`}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Minimize button */}
          {variant === "chat" && (
            <button
              onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-muted border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-destructive/20 transition-colors text-[10px] opacity-0 group-hover:opacity-100"
            >
              ×
            </button>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};
