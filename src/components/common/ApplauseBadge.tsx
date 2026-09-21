import React from "react";
import { motion } from "motion/react";

interface ApplauseBadgeProps {
  rank?: 1 | 2 | 3 | "podium" | "win";
  darkMode?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const ApplauseBadge: React.FC<ApplauseBadgeProps> = ({
  rank = "win",
  darkMode = false,
  size = "md",
  className = ""
}) => {
  const isRank1 = String(rank) === "1" || rank === "win";
  const isRank2 = String(rank) === "2";
  const isRank3 = String(rank) === "3";

  const colorClasses = isRank1
    ? darkMode
      ? "bg-amber-950/40 text-amber-300 border-amber-500/40"
      : "bg-amber-50 text-amber-700 border-amber-300/80 shadow-[0_2px_10px_rgba(245,158,11,0.15)]"
    : isRank2
    ? darkMode
      ? "bg-slate-800/40 text-slate-200 border-slate-500/40"
      : "bg-slate-100 text-slate-700 border-slate-300"
    : isRank3
    ? darkMode
      ? "bg-amber-950/30 text-amber-400 border-amber-700/40"
      : "bg-amber-100/70 text-amber-800 border-amber-400/60"
    : darkMode
    ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/40"
    : "bg-emerald-50 text-emerald-700 border-emerald-300";

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5"
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Radiating pulsing acoustic wave rings */}
      <motion.span
        animate={{
          scale: [1, 1.45, 1.8],
          opacity: [0.55, 0.25, 0]
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: "easeOut",
          times: [0, 0.5, 1]
        }}
        className="absolute inset-0 rounded-full border border-current pointer-events-none opacity-40"
      />
      <motion.span
        animate={{
          scale: [1, 1.35, 1.65],
          opacity: [0.45, 0.15, 0]
        }}
        transition={{
          duration: 1.8,
          delay: 0.35,
          repeat: Infinity,
          ease: "easeOut",
          times: [0, 0.5, 1]
        }}
        className="absolute inset-0 rounded-full border border-current pointer-events-none opacity-30"
      />

      {/* Rhythmic 3-step pop clapping hands container */}
      <motion.div
        animate={{
          scale: [1, 1.14, 0.98, 1.14, 0.98, 1.18, 1],
          rotate: [0, -5, 5, -4, 4, -2, 0]
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          repeatDelay: 0.8,
          ease: "easeInOut",
          times: [0, 0.18, 0.36, 0.54, 0.72, 0.88, 1]
        }}
        className={`relative z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${colorClasses} select-none`}
      >
        {/* Minimalist vector clapping hands */}
        <svg
          className={`${iconSizes[size]} shrink-0 fill-current`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Left palm */}
          <path d="M7 11V6a2 2 0 0 1 4 0v5" />
          <path d="M11 7.5a2 2 0 0 1 4 0v4.5" />
          <path d="M15 9.5a2 2 0 0 1 4 0v3.5a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6V13" />
          {/* Accent sound sparkles */}
          <line x1="2" y1="5" x2="4" y2="7" />
          <line x1="4" y1="2" x2="5" y2="5" />
        </svg>

        <span className="font-sans font-black text-[10px] tracking-wider uppercase">
          Applause
        </span>
      </motion.div>
    </div>
  );
};
