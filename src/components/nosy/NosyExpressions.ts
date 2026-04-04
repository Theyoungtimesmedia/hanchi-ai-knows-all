export type NosyMood =
  | "idle" | "curious" | "thinking" | "happy" | "worried"
  | "bored" | "waving" | "typing-help" | "excited"
  | "sleepy" | "laughing";

// Animation configs per mood for the image-based character
export interface MoodAnimation {
  bounce: number;        // px bounce amplitude
  bounceDuration: number;
  rotate: number;        // degrees tilt
  scale: number;
  glow: string;          // CSS shadow color
  pulseGlow: boolean;
}

export const MOOD_ANIMATIONS: Record<NosyMood, MoodAnimation> = {
  idle:         { bounce: 4,  bounceDuration: 3,   rotate: 0,  scale: 1,    glow: "hsl(var(--primary))", pulseGlow: false },
  curious:      { bounce: 3,  bounceDuration: 1.5, rotate: -6, scale: 1.05, glow: "#00D4FF",            pulseGlow: true },
  thinking:     { bounce: 2,  bounceDuration: 2,   rotate: 5,  scale: 1,    glow: "#FFB800",            pulseGlow: true },
  happy:        { bounce: 12, bounceDuration: 0.6, rotate: 0,  scale: 1.08, glow: "#00FF88",            pulseGlow: false },
  excited:      { bounce: 16, bounceDuration: 0.5, rotate: 0,  scale: 1.1,  glow: "#FF00FF",            pulseGlow: true },
  laughing:     { bounce: 6,  bounceDuration: 0.4, rotate: 0,  scale: 1.05, glow: "#00FF88",            pulseGlow: false },
  worried:      { bounce: 1,  bounceDuration: 0.4, rotate: 0,  scale: 0.95, glow: "#FF6B6B",            pulseGlow: true },
  bored:        { bounce: 0,  bounceDuration: 4,   rotate: 5,  scale: 0.98, glow: "#888888",            pulseGlow: false },
  sleepy:       { bounce: 0,  bounceDuration: 5,   rotate: 10, scale: 0.96, glow: "#6B5CE7",            pulseGlow: false },
  waving:       { bounce: 4,  bounceDuration: 1,   rotate: -4, scale: 1.05, glow: "hsl(var(--primary))", pulseGlow: false },
  "typing-help":{ bounce: 2,  bounceDuration: 1.5, rotate: -5, scale: 1.02, glow: "#00D4FF",            pulseGlow: true },
};

export const TIPS: Record<string, string[]> = {
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
