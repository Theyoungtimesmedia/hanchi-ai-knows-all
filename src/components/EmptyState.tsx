import { motion } from "framer-motion";

/** Custom SVG illustration for the empty chat state */
export const EmptyState = () => {
  return (
    <div className="relative flex items-center justify-center w-20 h-20 mb-6">
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl scale-150" />
      
      <motion.svg
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative w-20 h-20"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Outer ring */}
        <motion.circle
          cx="40" cy="40" r="36"
          stroke="hsl(var(--primary))"
          strokeWidth="1"
          strokeDasharray="4 6"
          fill="none"
          opacity="0.3"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "40px 40px" }}
        />
        
        {/* Inner circle */}
        <circle cx="40" cy="40" r="24" fill="hsl(var(--primary) / 0.08)" stroke="hsl(var(--primary) / 0.2)" strokeWidth="1" />
        
        {/* Chat bubble icon */}
        <path
          d="M30 35 C30 31.5 33 29 37 29 H43 C47 29 50 31.5 50 35 V41 C50 44.5 47 47 43 47 H39 L34 51 V47 H33 C30 47 30 44.5 30 41 Z"
          fill="hsl(var(--primary) / 0.15)"
          stroke="hsl(var(--primary))"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Dots inside bubble */}
        <motion.circle cx="36" cy="38" r="1.5" fill="hsl(var(--primary))"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
        />
        <motion.circle cx="40" cy="38" r="1.5" fill="hsl(var(--primary))"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
        />
        <motion.circle cx="44" cy="38" r="1.5" fill="hsl(var(--primary))"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
        />
        
        {/* Small decorative dots */}
        <motion.circle cx="18" cy="24" r="2" fill="hsl(var(--primary) / 0.2)"
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.circle cx="62" cy="56" r="1.5" fill="hsl(var(--primary) / 0.15)"
          animate={{ scale: [1, 1.4, 1], opacity: [0.15, 0.4, 0.15] }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        />
      </motion.svg>
    </div>
  );
};
