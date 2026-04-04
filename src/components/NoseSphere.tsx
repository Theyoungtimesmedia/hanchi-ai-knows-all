import { motion } from "framer-motion";
import nosyIdle from "@/assets/nosy/nosy-idle.png";

/** Animated Nosy for empty chat state */
export const NoseSphere = () => {
  return (
    <div className="relative flex items-center justify-center w-36 h-36 mb-6">
      <div className="absolute inset-0 bg-primary/15 rounded-full blur-3xl animate-pulse" />
      <motion.div
        className="relative w-28 h-28"
        animate={{ y: [0, -6, 0], scale: [1, 1.03, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <img
          src={nosyIdle}
          alt="Nosy"
          className="w-full h-full object-contain drop-shadow-xl"
          draggable={false}
        />
      </motion.div>
      <div className="absolute top-2 right-4 w-2.5 h-2.5 bg-primary/50 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
      <div className="absolute bottom-4 left-2 w-2 h-2 bg-primary/40 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
    </div>
  );
};
