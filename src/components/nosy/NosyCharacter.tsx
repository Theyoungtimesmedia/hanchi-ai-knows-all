import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EXPRESSIONS, MOOD_BODY_ANIMATIONS, COLOR_SCHEMES, type NosyMood } from "./NosyExpressions";

interface NosyCharacterProps {
  mood: NosyMood;
  size?: number;
  mousePosition?: { x: number; y: number };
  colorSchemeIndex?: number;
}

export const NosyCharacter = ({
  mood,
  size = 120,
  mousePosition,
  colorSchemeIndex = 0,
}: NosyCharacterProps) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [waveAngle, setWaveAngle] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const expr = EXPRESSIONS[mood];
  const colors = COLOR_SCHEMES[colorSchemeIndex % COLOR_SCHEMES.length];
  const bodyAnim = MOOD_BODY_ANIMATIONS[mood];

  // Blink system
  useEffect(() => {
    const blink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    };
    const interval = setInterval(blink, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  // Wave animation for waving mood
  useEffect(() => {
    if (mood !== "waving") return;
    let frame: number;
    let start = Date.now();
    const animate = () => {
      const elapsed = Date.now() - start;
      setWaveAngle(Math.sin(elapsed / 150) * 30);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [mood]);

  // Calculate pupil tracking
  const getPupilOffset = () => {
    if (!mousePosition || !svgRef.current) {
      return { x: expr.pupilOffsetX, y: expr.pupilOffsetY };
    }
    const rect = svgRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (mousePosition.x - cx) / rect.width;
    const dy = (mousePosition.y - cy) / rect.height;
    const maxX = 4, maxY = 3;
    return {
      x: Math.max(-maxX, Math.min(maxX, dx * 12)),
      y: Math.max(-maxY, Math.min(maxY, dy * 8)),
    };
  };

  const pupil = getPupilOffset();
  const eyeScaleY = isBlinking ? 0.08 : expr.eyeScaleY;

  // Thinking chin-tap uses rightArm
  const rightArmAngle = mood === "thinking"
    ? expr.rightArmRotate
    : mood === "waving"
    ? -(90 + waveAngle)
    : expr.rightArmRotate;

  const viewBox = "0 0 120 150";

  return (
    <motion.div animate={bodyAnim as any} style={{ width: size, height: size * 1.25 }}>
      <svg
        ref={svgRef}
        viewBox={viewBox}
        width="100%"
        height="100%"
        style={{ overflow: "visible" }}
      >
        <defs>
          {/* Body gradient */}
          <radialGradient id={`bodyGrad-${colorSchemeIndex}`} cx="40%" cy="30%">
            <stop offset="0%" stopColor={colors.accent} />
            <stop offset="50%" stopColor={colors.body} />
            <stop offset="100%" stopColor={colors.bodyDark} />
          </radialGradient>
          {/* Eye shine */}
          <radialGradient id="eyeShine" cx="35%" cy="25%">
            <stop offset="0%" stopColor="white" />
            <stop offset="100%" stopColor="#F5F5F5" />
          </radialGradient>
          {/* Shadow */}
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity="0.2" />
          </filter>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* === LEGS === */}
        <motion.g
          animate={{ rotate: expr.leftLegRotate }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          style={{ originX: "42px", originY: "120px" }}
        >
          <ellipse cx="42" cy="135" rx="8" ry="12" fill={colors.bodyDark} opacity="0.9" />
          {/* Shoe */}
          <ellipse cx="42" cy="145" rx="10" ry="5" fill="#333" />
        </motion.g>
        <motion.g
          animate={{ rotate: expr.rightLegRotate }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 0.3 }}
          style={{ originX: "78px", originY: "120px" }}
        >
          <ellipse cx="78" cy="135" rx="8" ry="12" fill={colors.bodyDark} opacity="0.9" />
          <ellipse cx="78" cy="145" rx="10" ry="5" fill="#333" />
        </motion.g>

        {/* === BODY (nose/teardrop shape) === */}
        <motion.g
          animate={{ rotate: expr.bodyRotate, y: expr.bodyY, scale: expr.bodyScale }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          filter="url(#shadow)"
        >
          {/* Main body - teardrop/bean */}
          <path
            d="M 60 15 C 30 15, 15 45, 18 75 C 20 95, 30 120, 45 125 C 52 128, 68 128, 75 125 C 90 120, 100 95, 102 75 C 105 45, 90 15, 60 15 Z"
            fill={`url(#bodyGrad-${colorSchemeIndex})`}
            stroke={colors.bodyDark}
            strokeWidth="1.5"
          />

          {/* Belly highlight */}
          <ellipse cx="60" cy="90" rx="22" ry="18" fill="white" opacity="0.08" />

          {/* === BEANIE CAP === */}
          <path
            d="M 38 22 C 38 8, 82 8, 82 22 C 82 30, 38 30, 38 22 Z"
            fill="#2D2D2D"
            stroke="#222"
            strokeWidth="1"
          />
          {/* Beanie pom-pom */}
          <circle cx="60" cy="8" r="5" fill="#E53E3E" />
          {/* Beanie stripes */}
          <path d="M 40 18 C 40 18, 60 22, 80 18" stroke="#E53E3E" strokeWidth="2" fill="none" opacity="0.7" />
          <path d="M 39 24 C 39 24, 60 28, 81 24" stroke="#48BB78" strokeWidth="1.5" fill="none" opacity="0.5" />

          {/* === EYES === */}
          <g transform="translate(0, 0)">
            {/* Left eye */}
            <motion.g
              animate={{ scaleY: eyeScaleY }}
              transition={{ duration: isBlinking ? 0.08 : 0.3 }}
              style={{ originX: "45px", originY: "52px" }}
            >
              <ellipse cx="45" cy="52" rx="10" ry="12" fill="url(#eyeShine)" stroke="#333" strokeWidth="1" />
              {/* Pupil */}
              <motion.circle
                cx={45 + pupil.x}
                cy={52 + pupil.y}
                r="5"
                fill="#1A1A2E"
              />
              {/* Pupil highlight */}
              <circle cx={43 + pupil.x} cy={49 + pupil.y} r="2" fill="white" opacity="0.9" />
            </motion.g>

            {/* Right eye */}
            <motion.g
              animate={{ scaleY: eyeScaleY }}
              transition={{ duration: isBlinking ? 0.08 : 0.3 }}
              style={{ originX: "75px", originY: "52px" }}
            >
              <ellipse cx="75" cy="52" rx="10" ry="12" fill="url(#eyeShine)" stroke="#333" strokeWidth="1" />
              <motion.circle
                cx={75 + pupil.x}
                cy={52 + pupil.y}
                r="5"
                fill="#1A1A2E"
              />
              <circle cx={73 + pupil.x} cy={49 + pupil.y} r="2" fill="white" opacity="0.9" />
            </motion.g>

            {/* Eyebrows */}
            <motion.path
              d={`M 35 ${38 + expr.eyebrowY} Q 45 ${33 + expr.eyebrowY} 55 ${38 + expr.eyebrowY}`}
              stroke="#333"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              animate={{ rotate: expr.eyebrowRotate }}
              style={{ originX: "45px", originY: "36px" }}
            />
            <motion.path
              d={`M 65 ${38 + expr.eyebrowY} Q 75 ${33 + expr.eyebrowY} 85 ${38 + expr.eyebrowY}`}
              stroke="#333"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              animate={{ rotate: -expr.eyebrowRotate }}
              style={{ originX: "75px", originY: "36px" }}
            />
          </g>

          {/* === NOSE (tiny, since body IS the nose shape) === */}
          <ellipse cx="60" cy="70" rx="4" ry="3" fill={colors.bodyDark} opacity="0.5" />

          {/* === MOUTH === */}
          <motion.g transform="translate(60, 85)">
            <motion.path
              d={expr.mouthPath}
              stroke="#333"
              strokeWidth="2"
              strokeLinecap="round"
              fill={mood === "happy" ? "#FF6B6B" : "none"}
              animate={{ scale: expr.mouthScale }}
              transition={{ duration: 0.3 }}
            />
          </motion.g>

          {/* === LEFT ARM === */}
          <motion.g
            animate={{ rotate: expr.leftArmRotate, y: expr.leftArmY }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ originX: "22px", originY: "80px" }}
          >
            <path
              d="M 22 80 C 12 85, 5 95, 8 105"
              stroke={colors.bodyDark}
              strokeWidth="8"
              strokeLinecap="round"
              fill="none"
            />
            {/* Hand */}
            <circle cx="8" cy="105" r="5" fill={colors.body} stroke={colors.bodyDark} strokeWidth="1" />
          </motion.g>

          {/* === RIGHT ARM === */}
          <motion.g
            animate={{ rotate: rightArmAngle, y: expr.rightArmY }}
            transition={{ duration: mood === "waving" ? 0.15 : 0.5, ease: "easeOut" }}
            style={{ originX: "98px", originY: "80px" }}
          >
            <path
              d="M 98 80 C 108 85, 115 95, 112 105"
              stroke={colors.bodyDark}
              strokeWidth="8"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="112" cy="105" r="5" fill={colors.body} stroke={colors.bodyDark} strokeWidth="1" />

            {/* Phone in hand (bored) */}
            {expr.showPhone && (
              <g transform="translate(105, 95)">
                <rect x="-5" y="-8" width="10" height="16" rx="2" fill="#333" stroke="#555" strokeWidth="0.5" />
                <rect x="-3.5" y="-6" width="7" height="11" rx="1" fill="#4FC3F7" opacity="0.7" />
                {/* Scrolling lines */}
                <motion.g
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <line x1="-2" y1="-3" x2="2" y2="-3" stroke="white" strokeWidth="0.5" opacity="0.5" />
                  <line x1="-2" y1="-1" x2="3" y2="-1" stroke="white" strokeWidth="0.5" opacity="0.5" />
                  <line x1="-2" y1="1" x2="1" y2="1" stroke="white" strokeWidth="0.5" opacity="0.5" />
                  <line x1="-2" y1="3" x2="2.5" y2="3" stroke="white" strokeWidth="0.5" opacity="0.5" />
                </motion.g>
              </g>
            )}
          </motion.g>
        </motion.g>

        {/* === EXTRAS === */}
        {/* Sweat drop */}
        <AnimatePresence>
          {expr.showSweatDrop && (
            <motion.ellipse
              cx="88" cy="35"
              rx="3" ry="5"
              fill="#64B5F6"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: [0.8, 0.4, 0.8], y: [0, 5, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </AnimatePresence>

        {/* Sparkles */}
        <AnimatePresence>
          {expr.showSparkles && (
            <>
              {[
                { cx: 25, cy: 20, delay: 0 },
                { cx: 95, cy: 15, delay: 0.3 },
                { cx: 15, cy: 55, delay: 0.6 },
                { cx: 105, cy: 50, delay: 0.2 },
              ].map((s, i) => (
                <motion.text
                  key={i}
                  x={s.cx} y={s.cy}
                  fontSize="8"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5], rotate: [0, 180, 360] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: s.delay }}
                >
                  ✨
                </motion.text>
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Thought dots */}
        <AnimatePresence>
          {expr.showThoughtDots && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.circle
                  key={i}
                  cx={100 + i * 8}
                  cy={25 - i * 5}
                  r={2 + i}
                  fill="#999"
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
                />
              ))}
            </motion.g>
          )}
        </AnimatePresence>
      </svg>
    </motion.div>
  );
};
