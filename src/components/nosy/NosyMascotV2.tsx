import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { NosyCharacter } from "./NosyCharacter";
import { NosyTypoDetector } from "./NosyTypoDetector";
import { type NosyMood, THEME_PALETTES } from "./NosyExpressions";

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

const TIPS: Record<string, string[]> = {
  code: ["Scanning code… looks clean! 🤖", "I'd refactor that, but you do you 💻", "Bug detector activated! 🐛"],
  image: ["Creating something sick! 🎨", "Art mode: ON 🖼️", "Pixels assembling… ✨"],
  first: ["First message! Let's gooo! 🚀", "Welcome aboard, fam! 🤝", "System online. Vibes: immaculate 🔥"],
  greeting: ["Yo! What's good? 👋", "Eyin! Ready to build? 🤖"],
  default: [
    "Ask me anything — I literally know everything 👃", "Press ⌘K for shortcuts!", "I can generate images too 🎨",
    "Need code help? Say less 💻", "Try: 'create an image of Lagos at sunset'", "I'm watching your every keystroke 👀",
    "Fun fact: I never sleep. Never. 🤖", "Omo, type something already!",
  ],
};

function pick(a: string[]) { return a[Math.floor(Math.random() * a.length)]; }

function getTip(last?: string, first?: boolean): string {
  if (first) return pick(TIPS.first);
  if (last) {
    if (last.includes("```")) return pick(TIPS.code);
    if (/image|picture|draw|paint|create/i.test(last)) return pick(TIPS.image);
    if (/^(hi|hello|hey|sup|yo)/i.test(last)) return pick(TIPS.greeting);
  }
  return pick(TIPS.default);
}

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
  const [paletteIdx, setPaletteIdx] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevCount = useRef(messageCount);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  useEffect(() => {
    const h = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);

  // Landing wave
  useEffect(() => {
    if (variant !== "landing") return;
    setMood("waving");
    setTipText("Eyin! Come check out Hanchi AI! 🤖");
    setShowTip(true);
    const t = setTimeout(() => { setMood("idle"); setShowTip(false); }, 4000);
    return () => clearTimeout(t);
  }, [variant]);

  // Loading/error
  useEffect(() => {
    if (hasError) { setMood("worried"); setTipText("Something broke… 😰"); setShowTip(true); setTimeout(() => setShowTip(false), 3000); }
    else if (isLoading || isStreaming) setMood("thinking");
  }, [isLoading, isStreaming, hasError]);

  // New messages
  useEffect(() => {
    if (messageCount > prevCount.current && !isLoading && !isStreaming) {
      setMood("happy");
      setTipText(getTip(messageCount === 1 || isFirstMessage ? undefined : lastMessageContent, messageCount === 1 || isFirstMessage));
      setShowTip(true);
      const t = setTimeout(() => { setMood("idle"); setShowTip(false); }, 3500);
      prevCount.current = messageCount;
      return () => clearTimeout(t);
    }
    prevCount.current = messageCount;
  }, [messageCount, isLoading, isStreaming, lastMessageContent, isFirstMessage]);

  // Idle → bored
  useEffect(() => {
    if (mood === "idle" && !isLoading && !isStreaming && variant === "chat") {
      idleTimer.current = setTimeout(() => setMood("bored"), 30000);
    }
    return () => { if (idleTimer.current) clearTimeout(idleTimer.current); };
  }, [mood, isLoading, isStreaming, variant]);

  // Palette cycle when bored
  useEffect(() => {
    if (mood === "bored") {
      const iv = setInterval(() => setPaletteIdx(p => (p + 1) % THEME_PALETTES.length), 3000);
      return () => clearInterval(iv);
    } else { setPaletteIdx(0); }
  }, [mood]);

  // Periodic tips
  useEffect(() => {
    if ((mood === "bored" || mood === "idle") && variant === "chat") {
      const iv = setInterval(() => { setTipText(getTip(lastMessageContent)); setShowTip(true); setTimeout(() => setShowTip(false), 4000); }, 18000);
      return () => clearInterval(iv);
    }
  }, [mood, variant, lastMessageContent]);

  // Wake on keypress
  useEffect(() => {
    const h = () => {
      if (mood === "bored" || mood === "idle") {
        setMood("curious");
        setTimeout(() => { if (!isLoading && !isStreaming) setMood("idle"); }, 2000);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [mood, isLoading, isStreaming]);

  const handleClick = useCallback(() => {
    if (isDragging) return;
    setTipText(getTip(lastMessageContent));
    setShowTip(true);
    setMood("happy");
    controls.start({ scale: [1, 1.2, 0.9, 1.1, 1], rotate: [0, -10, 10, -5, 0], transition: { duration: 0.6 } });
    setTimeout(() => { setShowTip(false); setMood("idle"); }, 4000);
  }, [isDragging, controls, lastMessageContent]);

  if (isMinimized) {
    return (
      <motion.button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full bg-card border border-border shadow-lg flex items-center justify-center overflow-hidden"
        whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
        initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
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
        drag={variant === "chat"} dragConstraints={constraintsRef} dragElastic={0.1}
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
              initial={{ opacity: 0, y: 10, scale: 0.7 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.7 }} transition={{ type: "spring", damping: 15 }}
              className="absolute bottom-full right-0 mb-3 max-w-[220px] z-10"
            >
              <div className="bg-card border border-border/60 rounded-2xl rounded-br-sm px-3.5 py-2.5 shadow-xl backdrop-blur-sm">
                <p className="text-[11px] text-foreground leading-relaxed font-medium">{tipText}</p>
              </div>
              <div className="absolute -bottom-1.5 right-4 w-3 h-3 bg-card border-r border-b border-border/60 rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Palette label */}
        <AnimatePresence>
          {mood === "bored" && paletteIdx > 0 && (
            <motion.div key={paletteIdx}
              initial={{ opacity: 0, y: -8, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.8 }}
              className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[9px] font-bold px-2.5 py-0.5 rounded-full shadow-lg whitespace-nowrap z-10"
            >
              {THEME_PALETTES[paletteIdx].name} mode ✨
            </motion.div>
          )}
        </AnimatePresence>

        {/* Typo detector */}
        <div className="relative">
          <NosyTypoDetector inputText={inputText} onCorrection={onInputCorrection}
            onTypoDetected={() => { if (mood !== "thinking" && mood !== "happy") setMood("typing-help"); }}
            onTypoCleared={() => { if (mood === "typing-help") setMood("idle"); }}
          />
        </div>

        {/* Character */}
        <motion.div onClick={handleClick} animate={controls} className="relative select-none group">
          <motion.div className="absolute inset-[-12px] rounded-full"
            animate={{
              boxShadow: mood === "thinking"
                ? ["0 0 25px 10px hsl(var(--primary) / 0.25)", "0 0 45px 15px hsl(var(--primary) / 0.45)", "0 0 25px 10px hsl(var(--primary) / 0.25)"]
                : mood === "happy"
                ? ["0 0 20px 8px hsl(142 71% 45% / 0.2)", "0 0 35px 12px hsl(142 71% 45% / 0.35)", "0 0 20px 8px hsl(142 71% 45% / 0.2)"]
                : "0 0 12px 4px hsl(var(--primary) / 0.1)",
            }}
            transition={{ duration: mood === "thinking" ? 1 : 2, repeat: (mood === "thinking" || mood === "happy") ? Infinity : 0 }}
          />

          <NosyCharacter mood={mood} size={charSize} mousePosition={mousePos} paletteIndex={paletteIdx} />

          <motion.div
            className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-background ${
              mood === "happy" ? "bg-emerald-400" : mood === "thinking" ? "bg-amber-400" :
              mood === "worried" ? "bg-red-400" : mood === "bored" ? "bg-muted-foreground" :
              mood === "typing-help" ? "bg-blue-400" : "bg-primary"
            }`}
            animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
          />

          {variant === "chat" && (
            <button onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-muted border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-destructive/20 transition-colors text-[10px] opacity-0 group-hover:opacity-100">
              ×
            </button>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};
