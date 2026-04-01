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
  const [breathScale, setBreathScale] = useState(1);
  const svgRef = useRef<SVGSVGElement>(null);
  const expr = EXPRESSIONS[mood];
  const colors = COLOR_SCHEMES[colorSchemeIndex % COLOR_SCHEMES.length];
  const bodyAnim = MOOD_BODY_ANIMATIONS[mood];

  // Blink system - more natural with double blinks
  useEffect(() => {
    const blink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 120);
      // Occasional double blink
      if (Math.random() > 0.7) {
        setTimeout(() => {
          setIsBlinking(true);
          setTimeout(() => setIsBlinking(false), 100);
        }, 250);
      }
    };
    const interval = setInterval(blink, 2500 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, []);

  // Breathing animation
  useEffect(() => {
    let frame: number;
    const start = Date.now();
    const animate = () => {
      const elapsed = Date.now() - start;
      setBreathScale(1 + Math.sin(elapsed / 1200) * 0.012);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Wave animation
  useEffect(() => {
    if (mood !== "waving") return;
    let frame: number;
    const start = Date.now();
    const animate = () => {
      const elapsed = Date.now() - start;
      setWaveAngle(Math.sin(elapsed / 120) * 35);
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
    const maxX = 4.5, maxY = 3.5;
    return {
      x: Math.max(-maxX, Math.min(maxX, dx * 14)),
      y: Math.max(-maxY, Math.min(maxY, dy * 10)),
    };
  };

  const pupil = getPupilOffset();
  const eyeScaleY = isBlinking ? 0.06 : expr.eyeScaleY;

  const rightArmAngle = mood === "thinking"
    ? expr.rightArmRotate
    : mood === "waving"
    ? -(90 + waveAngle)
    : expr.rightArmRotate;

  const viewBox = "0 0 140 170";

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
          {/* Enhanced body gradient with 3D depth */}
          <radialGradient id={`bodyGrad-${colorSchemeIndex}`} cx="35%" cy="25%" r="65%">
            <stop offset="0%" stopColor={colors.highlight || colors.accent} stopOpacity="0.9" />
            <stop offset="30%" stopColor={colors.accent} />
            <stop offset="65%" stopColor={colors.body} />
            <stop offset="100%" stopColor={colors.bodyDark} />
          </radialGradient>
          {/* Specular highlight */}
          <radialGradient id={`specular-${colorSchemeIndex}`} cx="30%" cy="20%" r="40%">
            <stop offset="0%" stopColor="white" stopOpacity="0.35" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          {/* Eye gradient */}
          <radialGradient id="eyeGrad" cx="35%" cy="25%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="70%" stopColor="#F8F8F8" />
            <stop offset="100%" stopColor="#E8E8E8" />
          </radialGradient>
          {/* Pupil gradient */}
          <radialGradient id="pupilGrad" cx="40%" cy="35%">
            <stop offset="0%" stopColor="#2C2C4A" />
            <stop offset="60%" stopColor="#1A1A2E" />
            <stop offset="100%" stopColor="#0D0D1A" />
          </radialGradient>
          {/* Shadows & effects */}
          <filter id="bodyShadow" x="-25%" y="-15%" width="150%" height="150%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor={colors.bodyDark} floodOpacity="0.3" />
          </filter>
          <filter id="innerGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="softShadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
          </filter>
          {/* Clothing pattern */}
          <pattern id="stripePattern" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke={colors.bodyDark} strokeWidth="1" opacity="0.1" />
          </pattern>
          {/* Beanie pattern */}
          <linearGradient id="beanieGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2D2D2D" />
            <stop offset="50%" stopColor="#3A3A3A" />
            <stop offset="100%" stopColor="#252525" />
          </linearGradient>
        </defs>

        {/* === GROUND SHADOW === */}
        <motion.ellipse
          cx="70" cy="162" rx="28" ry="5"
          fill="black" opacity="0.08"
          animate={{ rx: mood === "happy" ? 32 : 28, opacity: mood === "happy" ? 0.05 : 0.08 }}
          transition={{ duration: 0.3 }}
        />

        {/* === LEGS WITH SNEAKERS === */}
        <motion.g
          animate={{ rotate: expr.leftLegRotate }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          style={{ originX: "52px", originY: "135px" }}
        >
          {/* Leg */}
          <path d="M 48 130 Q 46 142 44 150" stroke={colors.bodyDark} strokeWidth="9" strokeLinecap="round" fill="none" />
          {/* Sneaker */}
          <g transform="translate(44, 148)">
            <path d="M -12 -2 Q -12 6 0 7 Q 14 7 15 2 Q 15 -2 8 -4 Q 0 -5 -8 -4 Q -12 -3 -12 -2 Z" fill="#333" />
            <path d="M -10 -1 Q -10 3 0 4 Q 12 4 13 1" fill="none" stroke="#555" strokeWidth="0.8" />
            {/* Sole highlight */}
            <path d="M -8 5 Q 0 6 10 5" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" />
            {/* Lace dots */}
            <circle cx="-2" cy="-2" r="0.8" fill="white" opacity="0.7" />
            <circle cx="2" cy="-3" r="0.8" fill="white" opacity="0.7" />
            <circle cx="6" cy="-3" r="0.8" fill="white" opacity="0.7" />
          </g>
        </motion.g>
        <motion.g
          animate={{ rotate: expr.rightLegRotate }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 0.3 }}
          style={{ originX: "88px", originY: "135px" }}
        >
          <path d="M 92 130 Q 94 142 96 150" stroke={colors.bodyDark} strokeWidth="9" strokeLinecap="round" fill="none" />
          <g transform="translate(96, 148)">
            <path d="M -12 -2 Q -12 6 0 7 Q 14 7 15 2 Q 15 -2 8 -4 Q 0 -5 -8 -4 Q -12 -3 -12 -2 Z" fill="#333" />
            <path d="M -10 -1 Q -10 3 0 4 Q 12 4 13 1" fill="none" stroke="#555" strokeWidth="0.8" />
            <path d="M -8 5 Q 0 6 10 5" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="-2" cy="-2" r="0.8" fill="white" opacity="0.7" />
            <circle cx="2" cy="-3" r="0.8" fill="white" opacity="0.7" />
            <circle cx="6" cy="-3" r="0.8" fill="white" opacity="0.7" />
          </g>
        </motion.g>

        {/* === MAIN BODY === */}
        <motion.g
          animate={{ rotate: expr.bodyRotate, y: expr.bodyY, scale: (expr.bodyScale || 1) * breathScale }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          filter="url(#bodyShadow)"
        >
          {/* Body - refined teardrop with more organic shape */}
          <path
            d="M 70 18 C 38 18, 22 50, 25 82 C 27 102, 38 128, 52 135 C 60 139, 80 139, 88 135 C 102 128, 113 102, 115 82 C 118 50, 102 18, 70 18 Z"
            fill={`url(#bodyGrad-${colorSchemeIndex})`}
            stroke={colors.bodyDark}
            strokeWidth="1.2"
          />
          {/* Specular highlight overlay */}
          <path
            d="M 70 18 C 38 18, 22 50, 25 82 C 27 102, 38 128, 52 135 C 60 139, 80 139, 88 135 C 102 128, 113 102, 115 82 C 118 50, 102 18, 70 18 Z"
            fill={`url(#specular-${colorSchemeIndex})`}
          />
          {/* Belly patch - lighter area */}
          <ellipse cx="70" cy="100" rx="24" ry="20" fill="white" opacity="0.06" />
          {/* Clothing detail: hoodie pocket */}
          <path
            d="M 50 98 Q 50 108 70 110 Q 90 108 90 98"
            fill="none" stroke={colors.bodyDark} strokeWidth="1" opacity="0.3"
          />
          {/* Hoodie strings */}
          <line x1="62" y1="70" x2="60" y2="82" stroke={colors.bodyDark} strokeWidth="1" opacity="0.4" />
          <line x1="78" y1="70" x2="80" y2="82" stroke={colors.bodyDark} strokeWidth="1" opacity="0.4" />
          <circle cx="60" cy="83" r="1.5" fill={colors.bodyDark} opacity="0.4" />
          <circle cx="80" cy="83" r="1.5" fill={colors.bodyDark} opacity="0.4" />

          {/* === BEANIE CAP - more detailed === */}
          <path
            d="M 44 28 C 44 10, 96 10, 96 28 C 96 36, 44 36, 44 28 Z"
            fill="url(#beanieGrad)"
            stroke="#222"
            strokeWidth="1"
          />
          {/* Beanie ribbing */}
          <path d="M 45 32 Q 70 37 95 32" fill="none" stroke="#444" strokeWidth="0.5" />
          <path d="M 44 30 Q 70 35 96 30" fill="none" stroke="#444" strokeWidth="0.5" />
          {/* Pom-pom with fluff */}
          <circle cx="70" cy="9" r="6" fill="#E53E3E" />
          <circle cx="67" cy="7" r="2" fill="#FF6B6B" opacity="0.6" />
          <circle cx="73" cy="11" r="1.5" fill="#C62828" opacity="0.5" />
          {/* Beanie stripes - Nigerian flag colors */}
          <path d="M 46 21 Q 70 25 94 21" stroke="#008751" strokeWidth="2.5" fill="none" opacity="0.8" />
          <path d="M 45 26 Q 70 30 95 26" stroke="white" strokeWidth="1.5" fill="none" opacity="0.4" />

          {/* === EYES - more expressive === */}
          <g>
            {/* Left eye */}
            <motion.g
              animate={{ scaleY: eyeScaleY }}
              transition={{ duration: isBlinking ? 0.06 : 0.3 }}
              style={{ originX: "55px", originY: "58px" }}
            >
              <ellipse cx="55" cy="58" rx="11" ry="13" fill="url(#eyeGrad)" stroke="#444" strokeWidth="1.2" />
              {/* Iris */}
              <motion.circle
                cx={55 + pupil.x}
                cy={58 + pupil.y}
                r="6.5"
                fill="#3E2723"
              />
              {/* Pupil */}
              <motion.circle
                cx={55 + pupil.x}
                cy={58 + pupil.y}
                r="4"
                fill="url(#pupilGrad)"
              />
              {/* Pupil highlights - dual */}
              <circle cx={52 + pupil.x} cy={54 + pupil.y} r="2.5" fill="white" opacity="0.95" />
              <circle cx={57 + pupil.x} cy={60 + pupil.y} r="1" fill="white" opacity="0.5" />
              {/* Eyelash detail */}
              <path d="M 44 50 Q 47 47 50 49" stroke="#333" strokeWidth="1" fill="none" />
              <path d="M 60 49 Q 63 47 66 50" stroke="#333" strokeWidth="1" fill="none" />
            </motion.g>

            {/* Right eye */}
            <motion.g
              animate={{ scaleY: eyeScaleY }}
              transition={{ duration: isBlinking ? 0.06 : 0.3 }}
              style={{ originX: "85px", originY: "58px" }}
            >
              <ellipse cx="85" cy="58" rx="11" ry="13" fill="url(#eyeGrad)" stroke="#444" strokeWidth="1.2" />
              <motion.circle cx={85 + pupil.x} cy={58 + pupil.y} r="6.5" fill="#3E2723" />
              <motion.circle cx={85 + pupil.x} cy={58 + pupil.y} r="4" fill="url(#pupilGrad)" />
              <circle cx={82 + pupil.x} cy={54 + pupil.y} r="2.5" fill="white" opacity="0.95" />
              <circle cx={87 + pupil.x} cy={60 + pupil.y} r="1" fill="white" opacity="0.5" />
              <path d="M 74 50 Q 77 47 80 49" stroke="#333" strokeWidth="1" fill="none" />
              <path d="M 90 49 Q 93 47 96 50" stroke="#333" strokeWidth="1" fill="none" />
            </motion.g>

            {/* Eyebrows - thicker, more expressive */}
            <motion.path
              d={`M 43 ${44 + expr.eyebrowY} Q 55 ${38 + expr.eyebrowY} 65 ${44 + expr.eyebrowY}`}
              stroke="#2D2D2D"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              animate={{ rotate: expr.eyebrowRotate }}
              style={{ originX: "55px", originY: "42px" }}
            />
            <motion.path
              d={`M 75 ${44 + expr.eyebrowY} Q 85 ${38 + expr.eyebrowY} 97 ${44 + expr.eyebrowY}`}
              stroke="#2D2D2D"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              animate={{ rotate: -expr.eyebrowRotate }}
              style={{ originX: "85px", originY: "42px" }}
            />
          </g>

          {/* === NOSE (small bridge) === */}
          <ellipse cx="70" cy="76" rx="4.5" ry="3.5" fill={colors.bodyDark} opacity="0.4" />
          <ellipse cx="68" cy="76" rx="2" ry="1.5" fill={colors.bodyDark} opacity="0.2" />
          <ellipse cx="72" cy="76" rx="2" ry="1.5" fill={colors.bodyDark} opacity="0.2" />

          {/* === MOUTH - more detailed === */}
          <motion.g transform="translate(70, 92)">
            <motion.path
              d={expr.mouthPath}
              stroke="#333"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill={mood === "happy" || mood === "waving" ? "#FF6B6B" : "none"}
              animate={{ scale: expr.mouthScale }}
              transition={{ duration: 0.3 }}
            />
            {/* Teeth hint on grin */}
            {(mood === "happy" || mood === "waving") && (
              <rect x="-4" y="0" width="8" height="3" rx="1" fill="white" opacity="0.6" />
            )}
          </motion.g>

          {/* Cheek blush */}
          {(mood === "happy" || mood === "waving") && (
            <>
              <ellipse cx="42" cy="72" rx="6" ry="4" fill="#FF8A80" opacity="0.25" />
              <ellipse cx="98" cy="72" rx="6" ry="4" fill="#FF8A80" opacity="0.25" />
            </>
          )}

          {/* === LEFT ARM with hand detail === */}
          <motion.g
            animate={{ rotate: expr.leftArmRotate, y: expr.leftArmY }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ originX: "30px", originY: "88px" }}
          >
            <path
              d="M 30 88 C 18 93, 10 105, 14 118"
              stroke={colors.body}
              strokeWidth="9"
              strokeLinecap="round"
              fill="none"
            />
            {/* Hand with fingers */}
            <g transform="translate(14, 118)">
              <circle cx="0" cy="0" r="6" fill={colors.body} stroke={colors.bodyDark} strokeWidth="1" />
              {/* Thumb */}
              <ellipse cx="-5" cy="-2" rx="3" ry="2" fill={colors.body} stroke={colors.bodyDark} strokeWidth="0.5" transform="rotate(-30 -5 -2)" />
            </g>
          </motion.g>

          {/* === RIGHT ARM with hand detail === */}
          <motion.g
            animate={{ rotate: rightArmAngle, y: expr.rightArmY }}
            transition={{ duration: mood === "waving" ? 0.12 : 0.5, ease: "easeOut" }}
            style={{ originX: "110px", originY: "88px" }}
          >
            <path
              d="M 110 88 C 122 93, 130 105, 126 118"
              stroke={colors.body}
              strokeWidth="9"
              strokeLinecap="round"
              fill="none"
            />
            <g transform="translate(126, 118)">
              <circle cx="0" cy="0" r="6" fill={colors.body} stroke={colors.bodyDark} strokeWidth="1" />
              <ellipse cx="5" cy="-2" rx="3" ry="2" fill={colors.body} stroke={colors.bodyDark} strokeWidth="0.5" transform="rotate(30 5 -2)" />
            </g>

            {/* Phone in hand (bored) - more detailed */}
            {expr.showPhone && (
              <g transform="translate(120, 108)">
                <rect x="-7" y="-10" width="14" height="22" rx="3" fill="#1A1A2E" stroke="#333" strokeWidth="0.8" />
                <rect x="-5.5" y="-8" width="11" height="17" rx="2" fill="#4FC3F7" opacity="0.8" />
                {/* Screen content */}
                <motion.g
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <rect x="-4" y="-5" width="8" height="2" rx="0.5" fill="white" opacity="0.3" />
                  <rect x="-4" y="-2" width="6" height="1.5" rx="0.5" fill="white" opacity="0.2" />
                  <rect x="-4" y="1" width="7" height="2" rx="0.5" fill="white" opacity="0.3" />
                  <rect x="-4" y="4" width="5" height="1.5" rx="0.5" fill="white" opacity="0.2" />
                  <rect x="-4" y="7" width="8" height="2" rx="0.5" fill="white" opacity="0.25" />
                </motion.g>
                {/* Notch */}
                <rect x="-2" y="-9" width="4" height="1.5" rx="0.75" fill="#1A1A2E" />
              </g>
            )}
          </motion.g>
        </motion.g>

        {/* === EXTRAS === */}
        {/* Sweat drop - improved */}
        <AnimatePresence>
          {expr.showSweatDrop && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.path
                d="M 100 38 Q 102 32 104 38 Q 104 42 102 43 Q 100 42 100 38 Z"
                fill="#64B5F6"
                animate={{ y: [0, 8, 0], opacity: [0.8, 0.4, 0.8] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.path
                d="M 96 48 Q 97 45 98 48 Q 98 50 97 50.5 Q 96 50 96 48 Z"
                fill="#64B5F6"
                opacity="0.5"
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }}
              />
            </motion.g>
          )}
        </AnimatePresence>

        {/* Sparkles - enhanced */}
        <AnimatePresence>
          {expr.showSparkles && (
            <>
              {[
                { cx: 30, cy: 22, delay: 0, size: 10 },
                { cx: 110, cy: 18, delay: 0.3, size: 8 },
                { cx: 18, cy: 60, delay: 0.6, size: 9 },
                { cx: 120, cy: 55, delay: 0.2, size: 7 },
                { cx: 70, cy: 5, delay: 0.4, size: 11 },
                { cx: 25, cy: 100, delay: 0.5, size: 6 },
              ].map((s, i) => (
                <motion.g
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0], scale: [0.3, 1.3, 0.3], rotate: [0, 180, 360] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: s.delay }}
                >
                  {/* 4-pointed star */}
                  <path
                    d={`M ${s.cx} ${s.cy - s.size/2} L ${s.cx + 1.5} ${s.cy - 1.5} L ${s.cx + s.size/2} ${s.cy} L ${s.cx + 1.5} ${s.cy + 1.5} L ${s.cx} ${s.cy + s.size/2} L ${s.cx - 1.5} ${s.cy + 1.5} L ${s.cx - s.size/2} ${s.cy} L ${s.cx - 1.5} ${s.cy - 1.5} Z`}
                    fill="#FFD700"
                    opacity="0.85"
                  />
                </motion.g>
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Thought dots - improved */}
        <AnimatePresence>
          {expr.showThoughtDots && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {[0, 1, 2].map((i) => (
                <motion.circle
                  key={i}
                  cx={112 + i * 9}
                  cy={30 - i * 6}
                  r={2.5 + i * 1.2}
                  fill="hsl(var(--muted-foreground))"
                  opacity="0.5"
                  animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.7, 1.2, 0.7] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
                />
              ))}
            </motion.g>
          )}
        </AnimatePresence>

        {/* Z's for bored */}
        <AnimatePresence>
          {mood === "bored" && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {[0, 1, 2].map((i) => (
                <motion.text
                  key={i}
                  x={30 - i * 5}
                  y={30 - i * 10}
                  fontSize={8 + i * 2}
                  fill="hsl(var(--muted-foreground))"
                  opacity="0.4"
                  fontWeight="bold"
                  animate={{ opacity: [0, 0.5, 0], y: [0, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                >
                  z
                </motion.text>
              ))}
            </motion.g>
          )}
        </AnimatePresence>
      </svg>
    </motion.div>
  );
};