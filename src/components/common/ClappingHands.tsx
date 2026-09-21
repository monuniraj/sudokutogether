import React, { useEffect, useState } from "react";
import { motion } from "motion/react";

export interface ClappingHandsProps {
  tier?: "champion" | "supportive";
  rank?: 1 | 2 | 3 | "podium" | "win" | "champion" | "supportive";
  darkMode?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  onComplete?: () => void;
}

const Palm: React.FC<{ isLeft?: boolean; size: number }> = ({ isLeft = true, size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ transform: isLeft ? "none" : "scaleX(-1)" }}
    className="drop-shadow-xs"
  >
    {/* Index finger */}
    <path d="M11 7V3.5a1.5 1.5 0 0 1 3 0v4.5" />
    {/* Middle finger */}
    <path d="M14 5a1.5 1.5 0 0 1 3 0v4" />
    {/* Ring finger */}
    <path d="M17 7a1.5 1.5 0 0 1 3 0v3.5" />
    {/* Palm, pinky, and thumb */}
    <path d="M20 9.5a1.5 1.5 0 0 1 3 0v3.5a6.5 6.5 0 0 1-6.5 6.5h-1.5a6.5 6.5 0 0 1-6.5-6.5v-2a1.5 1.5 0 0 1 3 0v1.5" />
  </svg>
);

export const ClappingHands: React.FC<ClappingHandsProps> = ({
  tier,
  rank = "win",
  darkMode = false,
  size = "md",
  className = "",
  onComplete
}) => {
  const isChampion = tier === "champion" || String(rank) === "1" || rank === "champion";
  const [isFinished, setIsFinished] = useState(false);

  // Finite lifecycle duration: ~2.05s for Champion (5 claps), ~1.9s for Supportive (3 claps)
  const totalDuration = isChampion ? 2.05 : 1.9;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFinished(true);
      onComplete?.();
    }, totalDuration * 1000);
    return () => clearTimeout(timer);
  }, [totalDuration, onComplete]);

  if (isFinished) return null;

  // Curated color themes
  const colorClass = isChampion
    ? darkMode
      ? "text-amber-400"
      : "text-amber-500"
    : String(rank) === "2"
    ? darkMode
      ? "text-slate-300"
      : "text-slate-500"
    : String(rank) === "3"
    ? darkMode
      ? "text-amber-400"
      : "text-amber-600"
    : darkMode
    ? "text-emerald-400"
    : "text-emerald-600";

  const dimensions = {
    sm: { w: 34, h: 22, handSize: 15 },
    md: { w: 44, h: 28, handSize: 19 },
    lg: { w: 56, h: 36, handSize: 24 }
  }[size];

  // Keyframes synchronized with audio cadence:
  // Champion: 5 claps (strikes at 0.35s, 0.65s, 0.95s, 1.25s, 1.55s)
  // Supportive: 3 claps (strikes at 0.40s, 0.80s, 1.20s)
  const leftXKeyframes = isChampion
    ? [-9, -7, -1, -6, -1, -6, -1, -6, -1, -6, -1, -4, -4]
    : [-8, -6, -1, -6, -1, -6, -1, -3, -3];

  const rightXKeyframes = isChampion
    ? [9, 7, 1, 6, 1, 6, 1, 6, 1, 6, 1, 4, 4]
    : [8, 6, 1, 6, 1, 6, 1, 3, 3];

  const leftRotateKeyframes = isChampion
    ? [36, 30, 10, 26, 10, 26, 10, 26, 10, 26, 10, 18, 18]
    : [34, 28, 10, 26, 10, 26, 10, 18, 18];

  const rightRotateKeyframes = isChampion
    ? [-36, -30, -10, -26, -10, -26, -10, -26, -10, -26, -10, -18, -18]
    : [-34, -28, -10, -26, -10, -26, -10, -18, -18];

  const championTimes = [0, 0.10, 0.17, 0.24, 0.317, 0.39, 0.463, 0.536, 0.61, 0.683, 0.756, 0.85, 1];
  const supportiveTimes = [0, 0.11, 0.21, 0.32, 0.42, 0.53, 0.63, 0.79, 1];

  const motionTimes = isChampion ? championTimes : supportiveTimes;

  // Impact micro-spark keyframes
  const sparkScaleKeyframes = isChampion
    ? [0, 0, 1.15, 0, 0, 1.15, 0, 0, 1.2, 0, 0, 1.25, 0, 0, 1.35, 0, 0]
    : [0, 0, 1.15, 0, 0, 1.2, 0, 0, 1.3, 0, 0];

  const sparkOpacityKeyframes = isChampion
    ? [0, 0, 0.85, 0, 0, 0.85, 0, 0, 0.9, 0, 0, 0.95, 0, 0, 1, 0, 0]
    : [0, 0, 0.85, 0, 0, 0.9, 0, 0, 1, 0, 0];

  const sparkTimes = isChampion
    ? [0, 0.15, 0.17, 0.22, 0.29, 0.317, 0.37, 0.44, 0.463, 0.51, 0.59, 0.61, 0.66, 0.73, 0.756, 0.82, 1]
    : [0, 0.18, 0.21, 0.27, 0.39, 0.42, 0.48, 0.60, 0.63, 0.70, 1];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{
        opacity: [0, 1, 1, 1, 0],
        scale: [0.85, 1, 1, 1, 0.95]
      }}
      transition={{
        duration: totalDuration,
        times: [0, 0.1, 0.75, 0.88, 1],
        ease: "easeOut"
      }}
      style={{ width: dimensions.w, height: dimensions.h }}
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${colorClass} ${className}`}
    >
      {/* Contact impact micro-sparks */}
      <motion.svg
        viewBox="0 0 16 16"
        className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 pointer-events-none overflow-visible"
        animate={{
          scale: sparkScaleKeyframes,
          opacity: sparkOpacityKeyframes
        }}
        transition={{
          duration: totalDuration,
          times: sparkTimes,
          ease: "linear"
        }}
      >
        <path
          d="M8 1v2.5M8 12.5v2.5M1 8h2.5M12.5 8h2.5M3 3l1.8 1.8M11.2 11.2L13 13M3 13l1.8-1.8M11.2 4.8L13 3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </motion.svg>

      {/* Left Palm */}
      <motion.div
        animate={{
          x: leftXKeyframes,
          rotate: leftRotateKeyframes
        }}
        transition={{
          duration: totalDuration,
          times: motionTimes,
          ease: "easeInOut"
        }}
        className="absolute left-1/2 -translate-x-full origin-bottom-right"
      >
        <Palm isLeft={true} size={dimensions.handSize} />
      </motion.div>

      {/* Right Palm */}
      <motion.div
        animate={{
          x: rightXKeyframes,
          rotate: rightRotateKeyframes
        }}
        transition={{
          duration: totalDuration,
          times: motionTimes,
          ease: "easeInOut"
        }}
        className="absolute left-1/2 origin-bottom-left"
      >
        <Palm isLeft={false} size={dimensions.handSize} />
      </motion.div>
    </motion.div>
  );
};
