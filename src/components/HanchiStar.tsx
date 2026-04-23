import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HanchiStarProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

/** Claude-inspired starburst — Hanchi emerald variant */
export const HanchiStar = ({ size = 32, className, animated = true }: HanchiStarProps) => {
  const Comp = animated ? motion.svg : "svg" as any;
  const animProps = animated
    ? { animate: { rotate: [0, 8, 0, -8, 0] }, transition: { duration: 8, repeat: Infinity, ease: "easeInOut" } }
    : {};

  return (
    <Comp
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-primary", className)}
      {...animProps}
    >
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 360) / 12;
        return (
          <line
            key={i}
            x1="16"
            y1="6"
            x2="16"
            y2="12"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            transform={`rotate(${angle} 16 16)`}
          />
        );
      })}
    </Comp>
  );
};
