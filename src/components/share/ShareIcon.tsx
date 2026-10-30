import React from "react";
import { motion } from "motion/react";
import { Share2 } from "lucide-react";

export interface ShareIconProps {
  onClick: () => void;
  darkMode?: boolean;
  title?: string;
  className?: string;
  showBadge?: boolean;
}

export const ShareIcon: React.FC<ShareIconProps> = ({
  onClick,
  darkMode = false,
  title = "Share Result",
  className = "",
  showBadge = true,
}) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      animate={{
        rotate: [0, -8, 8, -6, 6, -3, 3, 0],
        scale: [1, 1.06, 1, 1.04, 1],
      }}
      transition={{
        duration: 2.2,
        repeat: Infinity,
        repeatDelay: 2.5,
        ease: "easeInOut",
      }}
      className={`relative p-1.5 rounded-full border-none cursor-pointer select-none flex items-center justify-center transition-colors shadow-[0_4px_12px_rgba(0,0,0,0.06)] ${
        darkMode
          ? "bg-amber-400/15 hover:bg-amber-400/25 text-amber-300"
          : "bg-amber-100/90 hover:bg-amber-200/90 text-amber-800"
      } ${className}`}
    >
      <Share2 className="w-4 h-4 stroke-[2.4]" />

      {showBadge && (
        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 pointer-events-none">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              darkMode ? "bg-amber-400" : "bg-rose-500"
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              darkMode ? "bg-amber-400" : "bg-rose-500"
            }`}
          />
        </span>
      )}
    </motion.button>
  );
};

export default ShareIcon;
