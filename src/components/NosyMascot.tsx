import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";

import nosyDefault from "@/assets/nosy-default.png";
import nosyCurious from "@/assets/nosy-curious.png";
import nosyHappy from "@/assets/nosy-happy.png";
import nosyBored from "@/assets/nosy-bored.png";
import nosyPixar from "@/assets/nosy-pixar.png";
import nosyGhibli from "@/assets/nosy-ghibli.png";
import nosyClay from "@/assets/nosy-clay.png";

type NosyMood = "idle" | "curious" | "thinking" | "happy" | "bored";

interface NosyMascotProps {
  isLoading?: boolean;
  isStreaming?: boolean;
  messageCount?: number;
  hasError?: boolean;
}

const STYLE_CYCLE = [
  { src: nosyBored, label: "Bored" },
  { src: nosyPixar, label: "Pixar" },
  { src: nosyGhibli, label: "Ghibli" },
  { src: nosyClay, label: "Clay" },
];

const TIPS = [
  "Try asking me about Nigerian history! 🇳🇬",
  "I can help you write code too, you know 👀",
  "Press ⌘K for quick actions!",
  "Ask me to create an image for you 🎨",
  "I can translate between English, Yoruba & Pidgin!",
  "Want style advice? Just ask! 👔",
  "Omo, don't just stare at me... type something!",
  "I'm literally the nosiest AI ever created 👃",
  "Need help with JAMB prep? Say less 📚",
  "I can help with your CV or cover letter ✍️",
];

export const NosyMascot = ({ isLoading, isStreaming, messageCount = 0, hasError }: NosyMascotProps) => {
  const [mood, setMood] = useState<NosyMood>("idle");
  const [showTip, setShowTip] = useState(false);
  const [tipText, setTipText] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [boredStyleIndex, setBoredStyleIndex] = useState(0);
  const [isCyclingStyles, setIsCyclingStyles] = useState(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const styleCycleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const controls = useAnimation();
  const constraintsRef = useRef<HTMLDivElement>(null);

  // Mood from props
  useEffect(() => {
    if (hasError) {
      setMood("idle");
      setIsCyclingStyles(false);
    } else if (isLoading || isStreaming) {
      setMood("thinking");
      setIsCyclingStyles(false);
    }
  }, [isLoading, isStreaming, hasError]);

  // Flash happy on new message
  useEffect(() => {
    if (messageCount > 0 && !isLoading && !isStreaming) {
      setMood("happy");
      setIsCyclingStyles(false);
      const timer = setTimeout(() => setMood("idle"), 3000);
      return () => clearTimeout(timer);
    }
  }, [messageCount]);

  // Idle → bored after 30s
  useEffect(() => {
    if (mood === "idle" && !isLoading && !isStreaming) {
      idleTimerRef.current = setTimeout(() => {
        setMood("bored");
        setIsCyclingStyles(true);
      }, 30000);
    }
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [mood, isLoading, isStreaming]);

  // Cycle styles when bored
  useEffect(() => {
    if (isCyclingStyles) {
      styleCycleRef.current = setInterval(() => {
        setBoredStyleIndex(prev => (prev + 1) % STYLE_CYCLE.length);
      }, 3000);
    }
    return () => {
      if (styleCycleRef.current) clearInterval(styleCycleRef.current);
    };
  }, [isCyclingStyles]);

  // Periodic tips
  useEffect(() => {
    if (mood === "bored" || mood === "idle") {
      const tipTimer = setInterval(() => {
        setTipText(TIPS[Math.floor(Math.random() * TIPS.length)]);
        setShowTip(true);
        setTimeout(() => setShowTip(false), 4000);
      }, 15000);
      return () => clearInterval(tipTimer);
    }
  }, [mood]);

  // Activity detection
  useEffect(() => {
    const handleActivity = () => {
      if (mood === "bored") {
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
    setTipText(TIPS[Math.floor(Math.random() * TIPS.length)]);
    setShowTip(true);
    setMood("happy");
    setIsCyclingStyles(false);
    controls.start({
      scale: [1, 1.2, 0.9, 1.1, 1],
      rotate: [0, -10, 10, -5, 0],
      transition: { duration: 0.5 },
    });
    setTimeout(() => {
      setShowTip(false);
      setMood("idle");
    }, 4000);
  }, [isDragging, controls]);

  const getCurrentImage = () => {
    if (isCyclingStyles && mood === "bored") return STYLE_CYCLE[boredStyleIndex].src;
    switch (mood) {
      case "curious": return nosyCurious;
      case "thinking": return nosyCurious;
      case "happy": return nosyHappy;
      case "bored": return nosyBored;
      default: return nosyDefault;
    }
  };

  const getCurrentLabel = () => {
    if (isCyclingStyles && mood === "bored") return STYLE_CYCLE[boredStyleIndex].label;
    return null;
  };

  if (isMinimized) {
    return (
      <motion.button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-24 right-4 z-50 w-12 h-12 rounded-full bg-primary shadow-lg shadow-primary/30 flex items-center justify-center overflow-hidden"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
      >
        <img src={nosyDefault} alt="Nosy" className="w-10 h-10 object-contain" />
      </motion.button>
    );
  }

  return (
    <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-50">
      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setTimeout(() => setIsDragging(false), 100)}
        className="pointer-events-auto absolute bottom-20 right-4 cursor-grab active:cursor-grabbing"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.5 }}
      >
        {/* Speech bubble */}
        <AnimatePresence>
          {showTip && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.8 }}
              className="absolute bottom-full right-0 mb-2 max-w-[200px]"
            >
              <div className="bg-card border border-border/60 rounded-2xl rounded-br-sm px-3 py-2 shadow-xl">
                <p className="text-[11px] text-foreground leading-relaxed">{tipText}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Style label when cycling */}
        <AnimatePresence>
          {getCurrentLabel() && (
            <motion.div
              key={getCurrentLabel()}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[9px] font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap z-10"
            >
              {getCurrentLabel()} mode ✨
            </motion.div>
          )}
        </AnimatePresence>

        {/* Character */}
        <motion.div onClick={handleClick} animate={controls} className="relative select-none group">
          {/* Glow */}
          <motion.div
            className="absolute inset-[-8px] rounded-full opacity-40"
            animate={{
              boxShadow: mood === "thinking"
                ? ["0 0 20px 8px hsl(160 84% 39% / 0.3)", "0 0 35px 12px hsl(160 84% 39% / 0.5)", "0 0 20px 8px hsl(160 84% 39% / 0.3)"]
                : "0 0 15px 4px hsl(160 84% 39% / 0.15)",
            }}
            transition={{ duration: 1.5, repeat: mood === "thinking" ? Infinity : 0 }}
          />

          {/* Image */}
          <AnimatePresence mode="wait">
            <motion.div
              key={getCurrentImage()}
              initial={{ opacity: 0, scale: 0.7, rotate: -10 }}
              animate={{
                opacity: 1,
                scale: 1,
                rotate: 0,
                y: mood === "thinking" ? [0, -6, 0] : mood === "idle" ? [0, -4, 0] : 0,
              }}
              exit={{ opacity: 0, scale: 0.7, rotate: 10 }}
              transition={{
                opacity: { duration: 0.4 },
                scale: { duration: 0.4, type: "spring" },
                rotate: { duration: 0.4 },
                y: {
                  duration: mood === "thinking" ? 0.8 : 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
              className="w-24 h-24 md:w-28 md:h-28"
            >
              <img
                src={getCurrentImage()}
                alt={`Nosy - ${mood}`}
                className="w-full h-full object-contain drop-shadow-xl"
                draggable={false}
              />
            </motion.div>
          </AnimatePresence>

          {/* Minimize button */}
          <button
            onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-muted border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-destructive/20 transition-colors text-[10px] opacity-0 group-hover:opacity-100"
          >
            ×
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};
