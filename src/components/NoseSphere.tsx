import { motion } from "framer-motion";

/** Animated nose-bot sphere for empty chat state */
export const NoseSphere = () => {
  return (
    <div className="relative flex items-center justify-center w-36 h-36 mb-6">
      <div className="absolute inset-0 bg-primary/15 rounded-full blur-3xl animate-pulse" />
      <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary/20 to-transparent" />
      <motion.div
        className="relative w-28 h-28 rounded-full bg-gradient-to-br from-[#1A1A2E] via-[#2A2A3E] to-[#0A0A15] shadow-lg flex items-center justify-center border border-primary/30"
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Visor */}
        <motion.div className="absolute top-6 left-4 right-4 h-5 rounded-lg bg-gradient-to-b from-primary/80 to-primary/40 border border-primary/50"
          animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, repeat: Infinity }} />
        {/* Pupils */}
        <div className="absolute top-7 left-7 w-2 h-2 rounded-full bg-white" />
        <div className="absolute top-7 right-7 w-2 h-2 rounded-full bg-white" />
        {/* Nose dome */}
        <div className="w-8 h-10 rounded-full bg-[#2A2A3E] border border-primary/40 flex items-center justify-center mt-2">
          <div className="flex gap-1">
            <div className="w-2 h-1.5 rounded-full bg-[#1A1A28]" />
            <div className="w-2 h-1.5 rounded-full bg-[#1A1A28]" />
          </div>
        </div>
        {/* Antenna */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="w-0.5 h-4 bg-[#555] mx-auto" />
          <motion.div className="w-3 h-3 rounded-full bg-primary mx-auto -mt-0.5"
            animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
        </div>
        <div className="absolute inset-3 rounded-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      </motion.div>
      <div className="absolute top-2 right-4 w-2.5 h-2.5 bg-primary/50 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
      <div className="absolute bottom-4 left-2 w-2 h-2 bg-primary/40 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
    </div>
  );
};
