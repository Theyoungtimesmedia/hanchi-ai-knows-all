export type NosyMood = "idle" | "curious" | "thinking" | "happy" | "worried" | "bored" | "waving" | "typing-help" | "excited" | "sleepy" | "laughing";

export interface BodyPartState {
  eyeScaleY: number;
  pupilOffsetX: number;
  pupilOffsetY: number;
  eyebrowY: number;
  eyebrowRotate: number;
  mouthPath: string;
  mouthScale: number;
  leftArmRotate: number;
  rightArmRotate: number;
  leftArmY: number;
  rightArmY: number;
  bodyRotate: number;
  bodyY: number;
  bodyScale: number;
  leftLegRotate: number;
  rightLegRotate: number;
  showSweatDrop?: boolean;
  showSparkles?: boolean;
  showThoughtDots?: boolean;
  showPhone?: boolean;
}

const MOUTHS = {
  smile: "M -6 0 Q 0 6 6 0",
  grin: "M -8 -1 Q 0 10 8 -1",
  flat: "M -5 0 L 5 0",
  frown: "M -6 3 Q 0 -4 6 3",
  o: "M -3 -3 Q -3 3 0 4 Q 3 3 3 -3 Q 3 -4 0 -4 Q -3 -4 -3 -3",
  smirk: "M -5 1 Q 0 3 5 -2",
  laugh: "M -9 -2 Q 0 12 9 -2",
  sleepyMouth: "M -4 0 Q 0 2 4 0",
};

export const EXPRESSIONS: Record<NosyMood, BodyPartState> = {
  idle: {
    eyeScaleY: 1, pupilOffsetX: 0, pupilOffsetY: 0,
    eyebrowY: 0, eyebrowRotate: 0,
    mouthPath: MOUTHS.smile, mouthScale: 1,
    leftArmRotate: 15, rightArmRotate: -15,
    leftArmY: 0, rightArmY: 0,
    bodyRotate: 0, bodyY: 0, bodyScale: 1,
    leftLegRotate: 5, rightLegRotate: -5,
  },
  curious: {
    eyeScaleY: 1.3, pupilOffsetX: -2, pupilOffsetY: -1,
    eyebrowY: -5, eyebrowRotate: -5,
    mouthPath: MOUTHS.o, mouthScale: 0.8,
    leftArmRotate: 15, rightArmRotate: -50,
    leftArmY: 0, rightArmY: -5,
    bodyRotate: -6, bodyY: -3, bodyScale: 1.03,
    leftLegRotate: 5, rightLegRotate: -5,
  },
  thinking: {
    eyeScaleY: 0.6, pupilOffsetX: 2, pupilOffsetY: -1,
    eyebrowY: -2, eyebrowRotate: 8,
    mouthPath: MOUTHS.flat, mouthScale: 0.9,
    leftArmRotate: 15, rightArmRotate: -90,
    leftArmY: 0, rightArmY: -20,
    bodyRotate: 3, bodyY: -2, bodyScale: 1,
    leftLegRotate: 5, rightLegRotate: -5,
    showThoughtDots: true,
  },
  happy: {
    eyeScaleY: 0.3, pupilOffsetX: 0, pupilOffsetY: 0,
    eyebrowY: -4, eyebrowRotate: 0,
    mouthPath: MOUTHS.grin, mouthScale: 1.2,
    leftArmRotate: -60, rightArmRotate: 60,
    leftArmY: -15, rightArmY: -15,
    bodyRotate: 0, bodyY: -5, bodyScale: 1.05,
    leftLegRotate: 10, rightLegRotate: -10,
    showSparkles: true,
  },
  excited: {
    eyeScaleY: 1.4, pupilOffsetX: 0, pupilOffsetY: -2,
    eyebrowY: -6, eyebrowRotate: 0,
    mouthPath: MOUTHS.grin, mouthScale: 1.3,
    leftArmRotate: -80, rightArmRotate: 80,
    leftArmY: -20, rightArmY: -20,
    bodyRotate: 0, bodyY: -8, bodyScale: 1.08,
    leftLegRotate: 15, rightLegRotate: -15,
    showSparkles: true,
  },
  laughing: {
    eyeScaleY: 0.15, pupilOffsetX: 0, pupilOffsetY: 0,
    eyebrowY: -5, eyebrowRotate: 0,
    mouthPath: MOUTHS.laugh, mouthScale: 1.3,
    leftArmRotate: -40, rightArmRotate: 40,
    leftArmY: -10, rightArmY: -10,
    bodyRotate: 0, bodyY: -3, bodyScale: 1.04,
    leftLegRotate: 8, rightLegRotate: -8,
    showSparkles: true,
  },
  worried: {
    eyeScaleY: 1.2, pupilOffsetX: 0, pupilOffsetY: 1,
    eyebrowY: -2, eyebrowRotate: 15,
    mouthPath: MOUTHS.frown, mouthScale: 0.9,
    leftArmRotate: 30, rightArmRotate: -30,
    leftArmY: 5, rightArmY: 5,
    bodyRotate: 0, bodyY: 2, bodyScale: 0.97,
    leftLegRotate: 3, rightLegRotate: -3,
    showSweatDrop: true,
  },
  bored: {
    eyeScaleY: 0.5, pupilOffsetX: 1, pupilOffsetY: 2,
    eyebrowY: 2, eyebrowRotate: 0,
    mouthPath: MOUTHS.flat, mouthScale: 0.8,
    leftArmRotate: 20, rightArmRotate: -45,
    leftArmY: 5, rightArmY: 0,
    bodyRotate: 5, bodyY: 5, bodyScale: 0.98,
    leftLegRotate: 2, rightLegRotate: -2,
    showPhone: true,
  },
  sleepy: {
    eyeScaleY: 0.2, pupilOffsetX: 0, pupilOffsetY: 2,
    eyebrowY: 3, eyebrowRotate: 0,
    mouthPath: MOUTHS.sleepyMouth, mouthScale: 0.7,
    leftArmRotate: 25, rightArmRotate: -25,
    leftArmY: 8, rightArmY: 8,
    bodyRotate: 8, bodyY: 6, bodyScale: 0.96,
    leftLegRotate: 2, rightLegRotate: -2,
  },
  waving: {
    eyeScaleY: 1, pupilOffsetX: -1, pupilOffsetY: 0,
    eyebrowY: -3, eyebrowRotate: 0,
    mouthPath: MOUTHS.grin, mouthScale: 1.1,
    leftArmRotate: 15, rightArmRotate: -120,
    leftArmY: 0, rightArmY: -25,
    bodyRotate: -3, bodyY: -2, bodyScale: 1.02,
    leftLegRotate: 5, rightLegRotate: -5,
  },
  "typing-help": {
    eyeScaleY: 1.1, pupilOffsetX: 3, pupilOffsetY: 0,
    eyebrowY: -3, eyebrowRotate: -8,
    mouthPath: MOUTHS.smirk, mouthScale: 1,
    leftArmRotate: 15, rightArmRotate: -70,
    leftArmY: 0, rightArmY: -10,
    bodyRotate: -5, bodyY: -2, bodyScale: 1.02,
    leftLegRotate: 5, rightLegRotate: -5,
  },
};

export const COLOR_SCHEMES = [
  { name: "Default", body: "#C68642", bodyDark: "#8D5524", accent: "#F4A460", highlight: "#FFCC80" },
  { name: "Neon", body: "#00E5FF", bodyDark: "#0097A7", accent: "#76FF03", highlight: "#B2FF59" },
  { name: "Earth", body: "#8D6E63", bodyDark: "#5D4037", accent: "#A5D6A7", highlight: "#C8E6C9" },
  { name: "Ocean", body: "#42A5F5", bodyDark: "#1565C0", accent: "#80DEEA", highlight: "#B3E5FC" },
  { name: "Sunset", body: "#FF7043", bodyDark: "#D84315", accent: "#FFD54F", highlight: "#FFE082" },
  { name: "Galaxy", body: "#7E57C2", bodyDark: "#4527A0", accent: "#CE93D8", highlight: "#E1BEE7" },
];

export const MOOD_BODY_ANIMATIONS: Record<NosyMood, object> = {
  idle: { y: [0, -4, 0], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } },
  curious: { y: [0, -3, 0], rotate: [-6, -4, -6], transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" } },
  thinking: { y: [0, -5, 0], rotate: [3, 5, 3], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } },
  happy: { y: [0, -12, 0, -8, 0], scale: [1, 1.08, 0.96, 1.04, 1], transition: { duration: 0.8, repeat: Infinity, ease: "easeOut" } },
  excited: { y: [0, -15, 0, -10, 0], scale: [1, 1.1, 0.95, 1.06, 1], rotate: [0, -5, 5, -3, 0], transition: { duration: 0.6, repeat: Infinity, ease: "easeOut" } },
  laughing: { y: [0, -6, 0, -4, 0], x: [-2, 2, -2], transition: { duration: 0.5, repeat: Infinity, ease: "easeInOut" } },
  worried: { x: [-1, 1, -1], y: [0, -1, 0], transition: { duration: 0.4, repeat: Infinity, ease: "easeInOut" } },
  bored: { y: [0, 2, 0], rotate: [5, 6, 5], transition: { duration: 4, repeat: Infinity, ease: "easeInOut" } },
  sleepy: { y: [0, 3, 0], rotate: [8, 10, 8], transition: { duration: 5, repeat: Infinity, ease: "easeInOut" } },
  waving: { y: [0, -3, 0], rotate: [-3, 0, -3], transition: { duration: 1, repeat: 3, ease: "easeInOut" } },
  "typing-help": { y: [0, -2, 0], rotate: [-5, -4, -5], transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" } },
};