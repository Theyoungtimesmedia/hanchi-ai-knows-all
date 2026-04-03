import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { EXPRESSIONS, BODY_ANIMATIONS, THEME_PALETTES, type NosyMood } from "./NosyExpressions";

interface NosyCharacterProps {
  mood: NosyMood;
  size?: number;
  mousePosition?: { x: number; y: number };
  paletteIndex?: number;
}

/**
 * Brand-new Nosy: A hovering spherical robot with a prominent nose dome,
 * visor eyes, antenna, jet thrusters, and articulated mechanical arms.
 * Completely different design from any previous version.
 */
export const NosyCharacter = ({ mood, size = 120, mousePosition, paletteIndex = 0 }: NosyCharacterProps) => {
  const [blink, setBlink] = useState(false);
  const [breathe, setBreathe] = useState(1);
  const [waveAngle, setWaveAngle] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const expr = EXPRESSIONS[mood];
  const palette = THEME_PALETTES[paletteIndex % THEME_PALETTES.length];
  const bodyAnim = BODY_ANIMATIONS[mood];

  // Blink
  useEffect(() => {
    const id = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 110);
    }, 2800 + Math.random() * 2500);
    return () => clearInterval(id);
  }, []);

  // Breathing
  useEffect(() => {
    let raf: number;
    const t0 = Date.now();
    const tick = () => { setBreathe(1 + Math.sin((Date.now() - t0) / 1400) * 0.015); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Wave
  useEffect(() => {
    if (mood !== "waving") return;
    let raf: number;
    const t0 = Date.now();
    const tick = () => { setWaveAngle(Math.sin((Date.now() - t0) / 110) * 30); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mood]);

  // Pupil tracking
  const getPupil = () => {
    if (!mousePosition || !svgRef.current) return { x: expr.pupilOffsetX, y: expr.pupilOffsetY };
    const r = svgRef.current.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const dx = (mousePosition.x - cx) / r.width, dy = (mousePosition.y - cy) / r.height;
    return { x: Math.max(-5, Math.min(5, dx * 16)), y: Math.max(-4, Math.min(4, dy * 12)) };
  };
  const pupil = getPupil();
  const visorH = blink ? 1 : 18;

  const rightArm = mood === "waving" ? -(130 + waveAngle) : expr.rightArmAngle;

  return (
    <motion.div animate={bodyAnim as any} style={{ width: size, height: size * 1.3 }}>
      <svg ref={svgRef} viewBox="0 0 140 180" width="100%" height="100%" style={{ overflow: "visible" }}>
        <defs>
          {/* Main shell gradient */}
          <radialGradient id={`shell-${paletteIndex}`} cx="35%" cy="25%" r="65%">
            <stop offset="0%" stopColor="#555" />
            <stop offset="40%" stopColor={palette.shell} />
            <stop offset="100%" stopColor="#0A0A15" />
          </radialGradient>
          {/* Visor gradient */}
          <linearGradient id="visorGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={expr.visorGlow} stopOpacity="0.9" />
            <stop offset="100%" stopColor={expr.visorGlow} stopOpacity="0.4" />
          </linearGradient>
          {/* Glow filter */}
          <filter id="glowF">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="jetGlow">
            <feGaussianBlur stdDeviation="4" />
          </filter>
          {/* Specular */}
          <radialGradient id="specHL" cx="30%" cy="18%" r="45%">
            <stop offset="0%" stopColor="white" stopOpacity="0.3" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* === GROUND SHADOW === */}
        <ellipse cx="70" cy="172" rx="25" ry="4" fill="black" opacity="0.1" />

        {/* === JET THRUSTERS === */}
        <motion.g animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 0.3, repeat: Infinity }}>
          {/* Left jet */}
          <motion.ellipse cx="52" cy="148" rx="4" ry={8 + expr.jetIntensity * 12}
            fill={palette.accent} opacity={0.15 + expr.jetIntensity * 0.3}
            filter="url(#jetGlow)" />
          {/* Right jet */}
          <motion.ellipse cx="88" cy="148" rx="4" ry={8 + expr.jetIntensity * 12}
            fill={palette.accent} opacity={0.15 + expr.jetIntensity * 0.3}
            filter="url(#jetGlow)" />
        </motion.g>

        {/* === LEGS / HOVER PODS === */}
        <g>
          <rect x="48" y="132" width="8" height="16" rx="4" fill="#333" stroke="#222" strokeWidth="0.8" />
          <rect x="84" y="132" width="8" height="16" rx="4" fill="#333" stroke="#222" strokeWidth="0.8" />
          {/* Pod bottoms */}
          <ellipse cx="52" cy="148" rx="6" ry="3" fill="#444" stroke={palette.accent} strokeWidth="0.5" />
          <ellipse cx="88" cy="148" rx="6" ry="3" fill="#444" stroke={palette.accent} strokeWidth="0.5" />
        </g>

        {/* === MAIN BODY (spherical shell) === */}
        <motion.g
          animate={{ scale: breathe }}
          transition={{ duration: 0 }}
        >
          {/* Body sphere */}
          <ellipse cx="70" cy="90" rx="42" ry="48"
            fill={`url(#shell-${paletteIndex})`}
            stroke="#333" strokeWidth="1.5" />
          {/* Specular highlight */}
          <ellipse cx="70" cy="90" rx="42" ry="48" fill="url(#specHL)" />
          {/* Chest plate accent */}
          <ellipse cx="70" cy="105" rx="22" ry="14"
            fill="none" stroke={palette.accent} strokeWidth="0.8" opacity="0.3" />
          {/* Panel line details */}
          <path d="M 40 80 Q 70 72 100 80" fill="none" stroke="#444" strokeWidth="0.6" opacity="0.5" />
          <path d="M 38 100 Q 70 108 102 100" fill="none" stroke="#444" strokeWidth="0.6" opacity="0.5" />

          {/* === NOSE DOME (the signature feature!) === */}
          <g>
            <ellipse cx="70" cy="88" rx="10" ry="12"
              fill="#2A2A3E" stroke={palette.accent} strokeWidth="1" />
            <ellipse cx="70" cy="88" rx="10" ry="12"
              fill="none" stroke="white" strokeWidth="0.3" opacity="0.3" />
            {/* Nostrils */}
            <ellipse cx="66" cy="91" rx="2.5" ry="2" fill="#1A1A28" />
            <ellipse cx="74" cy="91" rx="2.5" ry="2" fill="#1A1A28" />
            {/* Nose highlight */}
            <ellipse cx="68" cy="84" rx="3" ry="2" fill="white" opacity="0.12" />
            {/* Nose bridge accent light */}
            <motion.circle cx="70" cy="80" r="1.5"
              fill={palette.accent} opacity={0.4}
              animate={{ opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 2, repeat: Infinity }} />
          </g>

          {/* === VISOR (eyes) === */}
          <g>
            {/* Visor housing */}
            <motion.rect
              x="42" y="58" rx="10"
              width="56"
              animate={{ height: visorH }}
              transition={{ duration: blink ? 0.05 : 0.25 }}
              fill="url(#visorGrad)"
              stroke={palette.accent} strokeWidth="1.2"
              filter={expr.visorPulse ? "url(#glowF)" : undefined}
              style={{ overflow: "hidden" }}
            />
            {/* Visor scanline effect */}
            {!blink && (
              <motion.line x1="42" x2="98" strokeWidth="0.5" stroke={palette.accent} opacity="0.15"
                animate={{ y1: [60, 74, 60], y2: [60, 74, 60] }}
                transition={{ duration: 2, repeat: Infinity }} />
            )}

            {/* Left pupil */}
            {!blink && (
              <motion.g>
                <motion.circle
                  cx={58 + pupil.x} cy={67 + pupil.y}
                  r={4 * expr.pupilScale}
                  fill="white" />
                <motion.circle
                  cx={58 + pupil.x} cy={67 + pupil.y}
                  r={2 * expr.pupilScale}
                  fill={palette.accent} />
              </motion.g>
            )}
            {/* Right pupil */}
            {!blink && (
              <motion.g>
                <motion.circle
                  cx={82 + pupil.x} cy={67 + pupil.y}
                  r={4 * expr.pupilScale}
                  fill="white" />
                <motion.circle
                  cx={82 + pupil.x} cy={67 + pupil.y}
                  r={2 * expr.pupilScale}
                  fill={palette.accent} />
              </motion.g>
            )}
          </g>

          {/* === MOUTH (LED strip) === */}
          <motion.g transform="translate(70, 100)">
            {expr.mouthOpen > 0.5 ? (
              /* Open mouth - arc */
              <motion.path
                d={`M -8 0 Q 0 ${8 * expr.mouthArc} 8 0 Q 0 ${4 + 6 * expr.mouthOpen} -8 0`}
                fill={palette.accent} opacity="0.7"
                stroke={palette.accent} strokeWidth="1"
              />
            ) : (
              /* Closed mouth - line/arc */
              <motion.path
                d={`M -8 0 Q 0 ${6 * expr.mouthArc} 8 0`}
                fill="none"
                stroke={palette.accent} strokeWidth="1.8" strokeLinecap="round"
                opacity="0.8"
              />
            )}
          </motion.g>

          {/* === ANTENNA === */}
          <motion.g
            animate={{ rotate: expr.antennaAngle }}
            transition={{ duration: 0.4, type: "spring" }}
            style={{ originX: "70px", originY: "42px" }}
          >
            <line x1="70" y1="42" x2="70" y2="22" stroke="#555" strokeWidth="2.5" strokeLinecap="round" />
            {/* Antenna ball */}
            <motion.circle cx="70" cy="20" r="5"
              fill={palette.accent}
              filter="url(#glowF)"
              animate={expr.antennaBob ? { cy: [20, 16, 20] } : {}}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Inner light */}
            <circle cx="70" cy="20" r="2" fill="white" opacity="0.5" />
          </motion.g>
        </motion.g>

        {/* === LEFT ARM === */}
        <motion.g
          animate={{ rotate: expr.leftArmAngle }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ originX: "32px", originY: "85px" }}
        >
          <path d="M 32 85 C 20 90 12 105 16 118"
            stroke="#444" strokeWidth="7" strokeLinecap="round" fill="none" />
          {/* Claw hand */}
          <g transform="translate(16, 118)">
            <circle cx="0" cy="0" r="5" fill="#555" stroke={palette.accent} strokeWidth="0.8" />
            <line x1="-4" y1="3" x2="-6" y2="7" stroke="#666" strokeWidth="2" strokeLinecap="round" />
            <line x1="0" y1="4" x2="0" y2="8" stroke="#666" strokeWidth="2" strokeLinecap="round" />
            <line x1="4" y1="3" x2="6" y2="7" stroke="#666" strokeWidth="2" strokeLinecap="round" />
          </g>
        </motion.g>

        {/* === RIGHT ARM === */}
        <motion.g
          animate={{ rotate: rightArm }}
          transition={{ duration: mood === "waving" ? 0.1 : 0.5, ease: "easeOut" }}
          style={{ originX: "108px", originY: "85px" }}
        >
          <path d="M 108 85 C 120 90 128 105 124 118"
            stroke="#444" strokeWidth="7" strokeLinecap="round" fill="none" />
          <g transform="translate(124, 118)">
            <circle cx="0" cy="0" r="5" fill="#555" stroke={palette.accent} strokeWidth="0.8" />
            <line x1="-4" y1="3" x2="-6" y2="7" stroke="#666" strokeWidth="2" strokeLinecap="round" />
            <line x1="0" y1="4" x2="0" y2="8" stroke="#666" strokeWidth="2" strokeLinecap="round" />
            <line x1="4" y1="3" x2="6" y2="7" stroke="#666" strokeWidth="2" strokeLinecap="round" />
          </g>
        </motion.g>

        {/* === EFFECTS === */}

        {/* Sparks */}
        {expr.showSparks && (
          <motion.g animate={{ opacity: [0, 1, 0] }} transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.4 }}>
            <text x="108" y="45" fontSize="10" fill={palette.accent}>✦</text>
            <text x="28" y="50" fontSize="8" fill={palette.accent}>✧</text>
            <text x="95" y="30" fontSize="7" fill={palette.accent}>✦</text>
          </motion.g>
        )}

        {/* Zzz */}
        {expr.showZzz && (
          <motion.g animate={{ y: [0, -8, 0], opacity: [0.3, 1, 0.3] }} transition={{ duration: 2.5, repeat: Infinity }}>
            <text x="100" y="40" fontSize="10" fill="#888" fontFamily="monospace">z</text>
            <text x="108" y="32" fontSize="13" fill="#888" fontFamily="monospace">Z</text>
            <text x="118" y="22" fontSize="16" fill="#888" fontFamily="monospace">Z</text>
          </motion.g>
        )}

        {/* Heart */}
        {expr.showHeart && (
          <motion.text x="105" y="48" fontSize="12"
            animate={{ y: [48, 38], opacity: [1, 0], scale: [1, 1.5] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}>
            💚
          </motion.text>
        )}

        {/* Sweat */}
        {expr.showSweat && (
          <motion.g animate={{ y: [0, 8], opacity: [0.8, 0] }} transition={{ duration: 1, repeat: Infinity }}>
            <circle cx="100" cy="55" r="2" fill="#4FC3F7" />
          </motion.g>
        )}

        {/* Exclamation */}
        {expr.showExclamation && (
          <motion.text x="100" y="38" fontSize="14" fill={palette.accent} fontWeight="bold"
            animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>
            !
          </motion.text>
        )}
      </svg>
    </motion.div>
  );
};
