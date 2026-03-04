import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NosyMascotProps {
  isLoading?: boolean;
  isStreaming?: boolean;
  isTyping?: boolean;
  messageCount?: number;
  hasError?: boolean;
}

type NosyState = "idle" | "curious" | "thinking" | "happy" | "worried" | "peek" | "sleeping";

const TIPS = [
  "Try asking me about Nigerian history 🇳🇬",
  "I can help you prep for JAMB too 📚",
  "Want me to write an essay in Nigerian English?",
  "I can translate to Hausa, Pidgin, or Yoruba",
  "Ask me to create an image of anything 🎨",
  "Fun fact: Nigeria has over 500 languages!",
  "Need help with code? I got you 💻",
  "Try voice mode — just click the mic 🎤",
  "I can help with your CV or cover letter",
  "Ask me about minimalist style tips 👕",
];

const NOSY_EXPRESSIONS: Record<NosyState, { eyes: string; mouth: string; rotate: number; scale: number }> = {
  idle: { eyes: "👀", mouth: "", rotate: 0, scale: 1 },
  curious: { eyes: "👀", mouth: "", rotate: 15, scale: 1.1 },
  thinking: { eyes: "🤔", mouth: "", rotate: -5, scale: 1.05 },
  happy: { eyes: "😊", mouth: "", rotate: 0, scale: 1.15 },
  worried: { eyes: "😟", mouth: "", rotate: -10, scale: 0.95 },
  peek: { eyes: "👀", mouth: "", rotate: 5, scale: 1 },
  sleeping: { eyes: "😴", mouth: "", rotate: -15, scale: 0.9 },
};

export const NosyMascot = ({ isLoading, isStreaming, isTyping, messageCount = 0, hasError }: NosyMascotProps) => {
  const [state, setState] = useState<NosyState>("idle");
  const [showTip, setShowTip] = useState(false);
  const [currentTip, setCurrentTip] = useState("");
  const [dismissed, setDismissed] = useState(false);
  const [idleTime, setIdleTime] = useState(0);

  // Check if dismissed
  useEffect(() => {
    const d = localStorage.getItem("nosy_dismissed");
    if (d === "true") setDismissed(true);
  }, []);

  // State machine based on app state
  useEffect(() => {
    if (hasError) {
      setState("worried");
      return;
    }
    if (isLoading && !isStreaming) {
      setState("thinking");
      return;
    }
    if (isStreaming) {
      setState("happy");
      return;
    }
    if (isTyping) {
      setState("curious");
      return;
    }
    setState("idle");
  }, [isLoading, isStreaming, isTyping, hasError]);

  // Idle timer for peek state
  useEffect(() => {
    if (state !== "idle") {
      setIdleTime(0);
      return;
    }
    const interval = setInterval(() => {
      setIdleTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [state]);

  // Show tip after 30s idle
  useEffect(() => {
    if (idleTime >= 30 && !showTip && state === "idle") {
      const tip = TIPS[Math.floor(Math.random() * TIPS.length)];
      setCurrentTip(tip);
      setShowTip(true);
      setState("peek");

      const timeout = setTimeout(() => {
        setShowTip(false);
        setState("idle");
        setIdleTime(0);
      }, 8000);
      return () => clearTimeout(timeout);
    }
  }, [idleTime, showTip, state]);

  const handleClick = useCallback(() => {
    if (showTip) {
      setShowTip(false);
      setState("idle");
      setIdleTime(0);
      return;
    }
    const tip = TIPS[Math.floor(Math.random() * TIPS.length)];
    setCurrentTip(tip);
    setShowTip(true);
    setState("happy");
    setTimeout(() => {
      setShowTip(false);
      setState("idle");
    }, 5000);
  }, [showTip]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissed(true);
    localStorage.setItem("nosy_dismissed", "true");
  };

  if (dismissed) return null;

  const expr = NOSY_EXPRESSIONS[state];

  return (
    <div className="fixed bottom-24 right-4 z-30 md:bottom-8 md:right-6">
      <AnimatePresence>
        {showTip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute bottom-full right-0 mb-2 w-56 p-3 rounded-2xl bg-card border border-border/60 shadow-lg"
          >
            <div className="absolute bottom-[-6px] right-6 w-3 h-3 bg-card border-r border-b border-border/60 rotate-45" />
            <p className="text-xs text-foreground leading-relaxed">{currentTip}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="relative cursor-pointer select-none group"
        onClick={handleClick}
        animate={{
          rotate: expr.rotate,
          scale: expr.scale,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        whileHover={{ scale: expr.scale * 1.1 }}
        whileTap={{ scale: expr.scale * 0.9 }}
      >
        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-muted border border-border text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground z-10"
        >
          ×
        </button>

        {/* Glow */}
        <motion.div
          className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
          animate={{
            scale: state === "thinking" ? [1, 1.3, 1] : state === "happy" ? [1, 1.2, 1] : 1,
            opacity: state === "sleeping" ? 0.3 : 0.6,
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Main body */}
        <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-primary via-primary/90 to-primary/70 shadow-lg flex flex-col items-center justify-center overflow-visible">
          {/* Eyes - positioned above nose */}
          <motion.span
            className="text-[10px] leading-none -mt-0.5"
            animate={
              state === "curious"
                ? { x: [0, 3, 0], transition: { duration: 0.6, repeat: Infinity } }
                : state === "thinking"
                ? { y: [0, -2, 0], transition: { duration: 1.5, repeat: Infinity } }
                : state === "sleeping"
                ? { opacity: [1, 0.3, 1], transition: { duration: 2, repeat: Infinity } }
                : {}
            }
          >
            {expr.eyes}
          </motion.span>

          {/* Nose */}
          <motion.span
            className="text-2xl leading-none"
            animate={
              state === "happy"
                ? { y: [0, -2, 0], transition: { duration: 0.4, repeat: 2 } }
                : state === "worried"
                ? { x: [0, -1, 1, 0], transition: { duration: 0.3, repeat: 3 } }
                : {}
            }
          >
            👃🏿
          </motion.span>

          {/* Inner highlight */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/15 to-transparent pointer-events-none" />
        </div>

        {/* State indicator dot */}
        <motion.div
          className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
          animate={{
            backgroundColor:
              state === "thinking" ? "hsl(var(--primary))" :
              state === "happy" ? "#22c55e" :
              state === "worried" ? "#ef4444" :
              state === "curious" ? "#f59e0b" :
              "hsl(var(--muted-foreground))",
            scale: state === "thinking" ? [1, 1.3, 1] : 1,
          }}
          transition={{ duration: 1, repeat: state === "thinking" ? Infinity : 0 }}
        />
      </motion.div>
    </div>
  );
};
