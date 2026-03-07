import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { NosyCharacter } from "./NosyCharacter";
import { NosyTypoDetector } from "./NosyTypoDetector";
import { type NosyMood, COLOR_SCHEMES } from "./NosyExpressions";

interface NosyMascotV2Props {
  isLoading?: boolean;
  isStreaming?: boolean;
  messageCount?: number;
  hasError?: boolean;
  lastMessageContent?: string;
  isFirstMessage?: boolean;
  variant?: "chat" | "landing";
  inputText?: string;
  onInputCorrection?: (corrected: string) => void;
}

const CONTEXT_TIPS: Record<string, string[]> = {
  code: ["Ooh code! Let me check for bugs... 🐛", "Nice syntax! I'd add a semicolon though 😏", "That's clean code right there 💻"],
  image: ["Creating something beautiful! 🎨", "Ooh let me see the art! 👀", "I love watching art come to life ✨"],
  first: ["Welcome! Your first message! 🎉", "Oya let's go! First message unlocked 🔓", "The journey begins! 🚀"],
  greeting: ["Hey hey! What's good? 👋", "Omo, welcome back! 🤝"],
  default: [
    "Try asking me about Nigerian history! 🇳🇬", "I can help you write code too 👀", "Press ⌘K for quick actions!",
    "Ask me to create an image for you 🎨", "I can translate between English, Yoruba & Pidgin!",
    "Want style advice? Just ask! 👔", "Omo, don't just stare at me... type something!",
    "I'm literally the nosiest AI ever created 👃", "Need help with JAMB prep? Say less 📚",
  ],
};

function getContextTip(lastContent?: string, isFirst?: boolean): string {
  if (isFirst) return pick(CONTEXT_TIPS.first);
  if (lastContent) {
    if (lastContent.includes("```")) return pick(CONTEXT_TIPS.code);
    if (/image|picture|draw|paint|create/i.test(lastContent)) return pick(CONTEXT_TIPS.image);
    if (/^(hi|hello|hey|sup|what's up|yo)/i.test(lastContent)) return pick(CONTEXT_TIPS.greeting);
  }
  return pick(CONTEXT_TIPS.default);
}

function pick(arr: string[]) { return arr[Math.floor(Math.random() * arr.length)]; }

export const NosyMascotV2 = ({
  isLoading, isStreaming, messageCount = 0, hasError,
  lastMessageContent, isFirstMessage, variant = "chat",
  inputText = "", onInputCorrection,
}: NosyMascotV2Props) => {
  const [mood, setMood] = useState<NosyMood>(variant === "landing" ? "waving" : "idle");
  const [showTip, setShowTip] = useState(false);
  const [tipText, setTipText] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevMsgCount = useRef(messageCount);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  // Mouse tracking
  useEffect(() => {
    const handler = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  // Landing wave
  useEffect(() => {
    if (variant === "landing") {
      setMood("waving");
      setTipText("Hey! Come check out Hanchi AI! 👋");
      setShowTip(true);
      const t = setTimeout(() => { setMood("idle"); setShowTip(false); }, 4000);
      return () => clearTimeout(t);
    }
  }, [variant]);

  // Loading/error reactions
  useEffect(() => {
    if (hasError) {
      setMood("worried");
      setTipText("Something went wrong... 😰");
      setShowTip(true);
      setTimeout(() => setShowTip(false), 3000);
    } else if (isLoading || isStreaming) {
      setMood("thinking");
    }
  }, [isLoading, isStreaming, hasError]);

  // New messages
  useEffect(() => {
    if (messageCount > prevMsgCount.current && !isLoading && !isStreaming) {
      setMood("happy");
      setTipText(getContextTip(messageCount === 1 || isFirstMessage ? undefined : lastMessageContent, messageCount === 1 || isFirstMessage));
      setShowTip(true);
      const t = setTimeout(() => { setMood("idle"); setShowTip(false); }, 3500);
      prevMsgCount.current = messageCount;
      return () => clearTimeout(t);
    }
    prevMsgCount.current = messageCount;
  }, [messageCount, isLoading, isStreaming, lastMessageContent, isFirstMessage]);

  // Idle → bored
  useEffect(() => {
    if (mood === "idle" && !isLoading && !isStreaming && variant === "chat") {
      idleTimerRef.current = setTimeout(() => setMood("bored"), 30000);
    }
    return () => { if (idleTimerRef.current) clearTimeout(idleTimerRef.current); };
  }, [mood, isLoading, isStreaming, variant]);

  // Color cycling when bored
  useEffect(() => {
    if (mood === "bored") {
      const interval = setInterval(() => setColorIndex(p => (p + 1) % COLOR_SCHEMES.length), 3000);
      return () => clearInterval(interval);
    } else {
      setColorIndex(0);
    }
  }, [mood]);

  // Periodic tips
  useEffect(() => {
    if ((mood === "bored" || mood === "idle") && variant === "chat") {
      const timer = setInterval(() => {
        setTipText(getContextTip(lastMessageContent));
        setShowTip(true);
        setTimeout(() => setShowTip(false), 4000);
      }, 18000);
      return () => clearInterval(timer);
    }
  }, [mood, variant, lastMessageContent]);

  // Wake on typing
  useEffect(() => {
    const handler = () => {
      if (mood === "bored" || mood === "idle") {
        setMood("curious");
        setTimeout(() => { if (!isLoading && !isStreaming) setMood("idle"); }, 2000);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mood, isLoading, isStreaming]);

  const handleClick = useCallback(() => {
    if (isDragging) return;
    setTipText(getContextTip(lastMessageContent));
    setShowTip(true);
    setMood("happy");
    controls.start({ scale: [1, 1.2, 0.9, 1.1, 1], rotate: [0, -10, 10, -5, 0], transition: { duration: 0.6 } });
    setTimeout(() => { setShowTip(false); setMood("idle"); }, 4000);
  }, [isDragging, controls, lastMessageContent]);

  const handleTypoDetected = () => {
    if (mood !== "thinking" && mood !== "happy") setMood("typing-help");
  };
  const handleTypoCleared = () => {
    if (mood === "typing-help") setMood("idle");
  };

  if (isMinimized) {
    return (
      <motion.button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full bg-card border border-border shadow-lg flex items-center justify-center overflow-hidden"
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", damping: 12 }}
      >
        <NosyCharacter mood="idle" size={40} />
      </motion.button>
    );
  }

  const position = variant === "landing" ? "" : "absolute bottom-20 right-4";
  const charSize = variant === "landing" ? 140 : 100;

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
              <div className="absolute -bottom-1.5 right-4 w-3 h-3 bg-card border-r border-b border-border/60 rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Color scheme label */}
        <AnimatePresence>
          {mood === "bored" && colorIndex > 0 && (
            <motion.div
              key={colorIndex}
              initial={{ opacity: 0, y: -8, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.8 }}
              className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[9px] font-bold px-2.5 py-0.5 rounded-full shadow-lg whitespace-nowrap z-10"
            >
              {COLOR_SCHEMES[colorIndex].name} mode ✨
            </motion.div>
          )}
        </AnimatePresence>

        {/* Typo detector */}
        <div className="relative">
          <NosyTypoDetector
            inputText={inputText}
            onCorrection={onInputCorrection}
            onTypoDetected={handleTypoDetected}
            onTypoCleared={handleTypoCleared}
          />
        </div>

        {/* Character */}
        <motion.div onClick={handleClick} animate={controls} className="relative select-none group">
          {/* Glow */}
          <motion.div
            className="absolute inset-[-12px] rounded-full"
            animate={{
              boxShadow: mood === "thinking"
                ? ["0 0 25px 10px hsl(var(--primary) / 0.25)", "0 0 45px 15px hsl(var(--primary) / 0.45)", "0 0 25px 10px hsl(var(--primary) / 0.25)"]
                : mood === "happy"
                ? ["0 0 20px 8px hsl(142 71% 45% / 0.2)", "0 0 35px 12px hsl(142 71% 45% / 0.35)", "0 0 20px 8px hsl(142 71% 45% / 0.2)"]
                : "0 0 12px 4px hsl(var(--primary) / 0.1)",
            }}
            transition={{ duration: mood === "thinking" ? 1 : 2, repeat: (mood === "thinking" || mood === "happy") ? Infinity : 0 }}
          />

          <NosyCharacter
            mood={mood}
            size={charSize}
            mousePosition={mousePos}
            colorSchemeIndex={colorIndex}
          />

          {/* Mood indicator dot */}
          <motion.div
            className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-background ${
              mood === "happy" ? "bg-emerald-400" :
              mood === "thinking" ? "bg-amber-400" :
              mood === "worried" ? "bg-red-400" :
              mood === "bored" ? "bg-muted-foreground" :
              mood === "typing-help" ? "bg-blue-400" :
              "bg-primary"
            }`}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Minimize */}
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
