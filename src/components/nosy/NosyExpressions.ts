export type NosyMood =
  | "idle" | "curious" | "thinking" | "happy" | "worried"
  | "bored" | "waving" | "typing-help" | "excited"
  | "sleepy" | "laughing";

export interface FaceState {
  visorGlow: string;          // CSS color for visor glow
  visorPulse: boolean;
  pupilScale: number;
  pupilOffsetX: number;
  pupilOffsetY: number;
  mouthArc: number;           // -1 (frown) to 1 (smile), 0 = flat
  mouthOpen: number;          // 0 (closed) to 1 (wide open)
  antennaAngle: number;
  antennaBob: boolean;
  leftArmAngle: number;
  rightArmAngle: number;
  bodyTilt: number;
  bodyBounce: number;
  hoverHeight: number;
  jetIntensity: number;       // 0-1
  showSparks: boolean;
  showZzz: boolean;
  showExclamation: boolean;
  showHeart: boolean;
  showSweat: boolean;
}

export const EXPRESSIONS: Record<NosyMood, FaceState> = {
  idle: {
    visorGlow: "#00E5A0", visorPulse: false,
    pupilScale: 1, pupilOffsetX: 0, pupilOffsetY: 0,
    mouthArc: 0.3, mouthOpen: 0,
    antennaAngle: 0, antennaBob: true,
    leftArmAngle: 20, rightArmAngle: -20,
    bodyTilt: 0, bodyBounce: 3, hoverHeight: 4, jetIntensity: 0.4,
    showSparks: false, showZzz: false, showExclamation: false, showHeart: false, showSweat: false,
  },
  curious: {
    visorGlow: "#00D4FF", visorPulse: true,
    pupilScale: 1.3, pupilOffsetX: -3, pupilOffsetY: -1,
    mouthArc: 0, mouthOpen: 0.4,
    antennaAngle: -15, antennaBob: false,
    leftArmAngle: 15, rightArmAngle: -60,
    bodyTilt: -8, bodyBounce: 2, hoverHeight: 8, jetIntensity: 0.6,
    showSparks: false, showZzz: false, showExclamation: true, showHeart: false, showSweat: false,
  },
  thinking: {
    visorGlow: "#FFB800", visorPulse: true,
    pupilScale: 0.8, pupilOffsetX: 2, pupilOffsetY: -2,
    mouthArc: 0, mouthOpen: 0,
    antennaAngle: 10, antennaBob: false,
    leftArmAngle: 25, rightArmAngle: -100,
    bodyTilt: 5, bodyBounce: 1, hoverHeight: 6, jetIntensity: 0.3,
    showSparks: true, showZzz: false, showExclamation: false, showHeart: false, showSweat: false,
  },
  happy: {
    visorGlow: "#00FF88", visorPulse: false,
    pupilScale: 0.7, pupilOffsetX: 0, pupilOffsetY: 0,
    mouthArc: 1, mouthOpen: 0.5,
    antennaAngle: 0, antennaBob: true,
    leftArmAngle: -50, rightArmAngle: 50,
    bodyTilt: 0, bodyBounce: 10, hoverHeight: 12, jetIntensity: 0.8,
    showSparks: true, showZzz: false, showExclamation: false, showHeart: true, showSweat: false,
  },
  excited: {
    visorGlow: "#FF00FF", visorPulse: true,
    pupilScale: 1.4, pupilOffsetX: 0, pupilOffsetY: -2,
    mouthArc: 1, mouthOpen: 0.8,
    antennaAngle: 0, antennaBob: true,
    leftArmAngle: -80, rightArmAngle: 80,
    bodyTilt: 0, bodyBounce: 15, hoverHeight: 16, jetIntensity: 1,
    showSparks: true, showZzz: false, showExclamation: true, showHeart: true, showSweat: false,
  },
  laughing: {
    visorGlow: "#00FF88", visorPulse: false,
    pupilScale: 0.4, pupilOffsetX: 0, pupilOffsetY: 0,
    mouthArc: 1, mouthOpen: 1,
    antennaAngle: 0, antennaBob: true,
    leftArmAngle: -40, rightArmAngle: 40,
    bodyTilt: 0, bodyBounce: 8, hoverHeight: 10, jetIntensity: 0.7,
    showSparks: true, showZzz: false, showExclamation: false, showHeart: false, showSweat: false,
  },
  worried: {
    visorGlow: "#FF6B6B", visorPulse: true,
    pupilScale: 1.2, pupilOffsetX: 0, pupilOffsetY: 2,
    mouthArc: -0.8, mouthOpen: 0.2,
    antennaAngle: 20, antennaBob: false,
    leftArmAngle: 35, rightArmAngle: -35,
    bodyTilt: 0, bodyBounce: 1, hoverHeight: 2, jetIntensity: 0.2,
    showSparks: false, showZzz: false, showExclamation: false, showHeart: false, showSweat: true,
  },
  bored: {
    visorGlow: "#888888", visorPulse: false,
    pupilScale: 0.6, pupilOffsetX: 3, pupilOffsetY: 3,
    mouthArc: -0.2, mouthOpen: 0,
    antennaAngle: 25, antennaBob: false,
    leftArmAngle: 30, rightArmAngle: -45,
    bodyTilt: 8, bodyBounce: 0, hoverHeight: 2, jetIntensity: 0.15,
    showSparks: false, showZzz: true, showExclamation: false, showHeart: false, showSweat: false,
  },
  sleepy: {
    visorGlow: "#6B5CE7", visorPulse: false,
    pupilScale: 0.3, pupilOffsetX: 0, pupilOffsetY: 3,
    mouthArc: 0, mouthOpen: 0.3,
    antennaAngle: 30, antennaBob: false,
    leftArmAngle: 30, rightArmAngle: -30,
    bodyTilt: 12, bodyBounce: 0, hoverHeight: 1, jetIntensity: 0.1,
    showSparks: false, showZzz: true, showExclamation: false, showHeart: false, showSweat: false,
  },
  waving: {
    visorGlow: "#00E5A0", visorPulse: false,
    pupilScale: 1, pupilOffsetX: -1, pupilOffsetY: 0,
    mouthArc: 0.8, mouthOpen: 0.3,
    antennaAngle: -5, antennaBob: true,
    leftArmAngle: 20, rightArmAngle: -140,
    bodyTilt: -4, bodyBounce: 4, hoverHeight: 8, jetIntensity: 0.5,
    showSparks: false, showZzz: false, showExclamation: false, showHeart: true, showSweat: false,
  },
  "typing-help": {
    visorGlow: "#00D4FF", visorPulse: true,
    pupilScale: 1.1, pupilOffsetX: 4, pupilOffsetY: 0,
    mouthArc: 0.2, mouthOpen: 0,
    antennaAngle: -10, antennaBob: false,
    leftArmAngle: 20, rightArmAngle: -70,
    bodyTilt: -6, bodyBounce: 2, hoverHeight: 6, jetIntensity: 0.5,
    showSparks: false, showZzz: false, showExclamation: true, showHeart: false, showSweat: false,
  },
};

export const BODY_ANIMATIONS: Record<NosyMood, object> = {
  idle:         { y: [0, -4, 0], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } },
  curious:      { y: [0, -3, 0], rotate: [-6, -4, -6], transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" } },
  thinking:     { y: [0, -5, 0], rotate: [3, 5, 3], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } },
  happy:        { y: [0, -12, 0, -8, 0], scale: [1, 1.06, 0.97, 1.03, 1], transition: { duration: 0.8, repeat: Infinity, ease: "easeOut" } },
  excited:      { y: [0, -15, 0, -10, 0], scale: [1, 1.08, 0.95, 1.05, 1], rotate: [0, -5, 5, -3, 0], transition: { duration: 0.6, repeat: Infinity } },
  laughing:     { y: [0, -6, 0, -4, 0], x: [-2, 2, -2], transition: { duration: 0.5, repeat: Infinity } },
  worried:      { x: [-1, 1, -1], y: [0, -1, 0], transition: { duration: 0.4, repeat: Infinity } },
  bored:        { y: [0, 2, 0], rotate: [5, 7, 5], transition: { duration: 4, repeat: Infinity, ease: "easeInOut" } },
  sleepy:       { y: [0, 3, 0], rotate: [8, 12, 8], transition: { duration: 5, repeat: Infinity, ease: "easeInOut" } },
  waving:       { y: [0, -3, 0], rotate: [-3, 0, -3], transition: { duration: 1, repeat: 3, ease: "easeInOut" } },
  "typing-help": { y: [0, -2, 0], rotate: [-5, -3, -5], transition: { duration: 1.5, repeat: Infinity } },
};

export const THEME_PALETTES = [
  { name: "Hanchi", shell: "#1A1A2E", accent: "#00E5A0", glow: "#00E5A0" },
  { name: "Neon",   shell: "#0D0D2B", accent: "#FF00FF", glow: "#FF00FF" },
  { name: "Solar",  shell: "#2E1A00", accent: "#FFB800", glow: "#FFD54F" },
  { name: "Ocean",  shell: "#0A1929", accent: "#00D4FF", glow: "#80DEEA" },
  { name: "Berry",  shell: "#2E0A29", accent: "#E040FB", glow: "#EA80FC" },
  { name: "Forest", shell: "#0A291A", accent: "#76FF03", glow: "#B2FF59" },
];
