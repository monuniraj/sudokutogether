import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

export interface StudioSplashProps {
  duration?: number;
  onFinish?: () => void;
}

export const StudioSplash: React.FC<StudioSplashProps> = ({
  duration = 1000,
  onFinish
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isRendered, setIsRendered] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  if (!isRendered) return null;

  return (
    <AnimatePresence
      onExitComplete={() => {
        setIsRendered(false);
        if (onFinish) onFinish();
      }}
    >
      {isVisible && (
        <motion.div
          key="mologic-studio-splash"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }}
          className="fixed inset-0 z-[999999] bg-[#0B0F17] flex flex-col items-center justify-center select-none overflow-hidden pointer-events-auto"
          style={{ willChange: "opacity" }}
        >
          {/* Subtle ambient lighting */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-[320px] h-[320px] sm:w-[480px] sm:h-[480px] rounded-full bg-gradient-to-tr from-sky-500/10 via-indigo-500/5 to-transparent blur-3xl" />
          </div>

          {/* Center Brand Identity */}
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex flex-col items-center justify-center px-6"
          >
            {/* Elegant Luxury Studio Monogram Emblem */}
            <div className="relative mb-6 flex items-center justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-b from-stone-800/80 to-stone-900/90 border border-stone-700/50 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center justify-center backdrop-blur-md">
                <svg
                  className="w-9 h-9 sm:w-11 sm:h-11 text-white"
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Clean isometric modern "M" logo mark */}
                  <path
                    d="M10 38V12L24 24L38 12V38"
                    stroke="url(#mologic-grad)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <defs>
                    <linearGradient id="mologic-grad" x1="10" y1="12" x2="38" y2="38" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#38BDF8" />
                      <stop offset="0.5" stopColor="#E0F2FE" />
                      <stop offset="1" stopColor="#818CF8" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              {/* Subtle outer glow ring */}
              <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-sky-400/20 to-indigo-500/20 blur-sm pointer-events-none" />
            </div>

            {/* Typography */}
            <div className="flex flex-col items-center text-center">
              <h1 className="text-xl sm:text-2xl font-black tracking-[0.35em] text-white uppercase font-sans drop-shadow-sm ml-[0.35em]">
                M O L O G I C
              </h1>
              <span className="text-[9px] sm:text-[10.5px] font-bold tracking-[0.45em] text-stone-400/90 uppercase mt-2.5 font-sans ml-[0.45em]">
                S T U D I O S
              </span>
            </div>
          </motion.div>

          {/* Minimalist Bottom Touch */}
          <div className="absolute bottom-10 inset-x-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[9px] font-mono tracking-[0.25em] text-stone-600 uppercase">
              PURE LOGIC • COGNITIVE PLAY
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
