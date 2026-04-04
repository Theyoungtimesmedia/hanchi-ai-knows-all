import { motion, AnimatePresence } from "framer-motion";
import { type NosyMood, MOOD_ANIMATIONS } from "./NosyExpressions";

// Import all character pose images
import nosyIdle from "@/assets/nosy/nosy-idle.png";
import nosyWaving from "@/assets/nosy/nosy-waving.png";
import nosyThinking from "@/assets/nosy/nosy-thinking.png";
import nosyHappy from "@/assets/nosy/nosy-happy.png";
import nosyWorried from "@/assets/nosy/nosy-worried.png";
import nosyCurious from "@/assets/nosy/nosy-curious.png";
import nosyBored from "@/assets/nosy/nosy-bored.png";
import nosyExcited from "@/assets/nosy/nosy-excited.png";
import nosySleepy from "@/assets/nosy/nosy-sleepy.png";
import nosyLaughing from "@/assets/nosy/nosy-laughing.png";
import nosyTypingHelp from "@/assets/nosy/nosy-typing-help.png";

const MOOD_IMAGES: Record<NosyMood, string> = {
  idle: nosyIdle,
  waving: nosyWaving,
  thinking: nosyThinking,
  happy: nosyHappy,
  worried: nosyWorried,
  curious: nosyCurious,
  bored: nosyBored,
  excited: nosyExcited,
  sleepy: nosySleepy,
  laughing: nosyLaughing,
  "typing-help": nosyTypingHelp,
};

interface NosyCharacterProps {
  mood: NosyMood;
  size?: number;
}

export const NosyCharacter = ({ mood, size = 120 }: NosyCharacterProps) => {
  const anim = MOOD_ANIMATIONS[mood];
  const img = MOOD_IMAGES[mood];

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Glow effect underneath */}
      <motion.div
        className="absolute inset-0 rounded-full blur-xl"
        style={{ background: anim.glow, opacity: 0.15 }}
        animate={anim.pulseGlow ? { opacity: [0.1, 0.3, 0.1] } : {}}
        transition={anim.pulseGlow ? { duration: 1.5, repeat: Infinity } : {}}
      />

      {/* Ground shadow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-black/10 blur-sm"
        style={{ width: size * 0.5, height: size * 0.08 }}
      />

      {/* Character image with animations */}
      <motion.div
        animate={{
          y: anim.bounce > 0 ? [0, -anim.bounce, 0] : 0,
          rotate: anim.rotate,
          scale: anim.scale,
        }}
        transition={{
          y: { duration: anim.bounceDuration, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 0.5, ease: "easeOut" },
          scale: { duration: 0.3, ease: "easeOut" },
        }}
        className="relative w-full h-full"
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={mood}
            src={img}
            alt={`Nosy - ${mood}`}
            width={size}
            height={size}
            className="w-full h-full object-contain drop-shadow-lg select-none pointer-events-none"
            draggable={false}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.25 }}
          />
        </AnimatePresence>
      </motion.div>

      {/* Sparkle effects for happy/excited moods */}
      {(mood === "happy" || mood === "excited") && (
        <motion.div
          className="absolute -top-2 -right-2"
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5], rotate: [0, 180, 360] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <span className="text-lg">✨</span>
        </motion.div>
      )}

      {/* Zzz for sleepy/bored */}
      {(mood === "sleepy" || mood === "bored") && (
        <motion.div
          className="absolute -top-3 right-0 flex flex-col items-end gap-0.5"
          animate={{ y: [0, -6, 0], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <span className="text-xs text-muted-foreground/60 font-mono">z</span>
          <span className="text-sm text-muted-foreground/70 font-mono -mt-1.5">Z</span>
          <span className="text-base text-muted-foreground/80 font-mono -mt-2">Z</span>
        </motion.div>
      )}
    </div>
  );
};
