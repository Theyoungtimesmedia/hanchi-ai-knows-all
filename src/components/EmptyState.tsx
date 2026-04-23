import { motion } from "framer-motion";
import { HanchiStar } from "./HanchiStar";

/** Claude-style empty chat state — minimal star + ambient glow */
export const EmptyState = () => {
  return (
    <motion.div
      className="relative flex items-center justify-center w-16 h-16 mb-5"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl scale-150" />
      <HanchiStar size={48} />
    </motion.div>
  );
};
