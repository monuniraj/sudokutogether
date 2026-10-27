import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

export interface StudioSplashProps {
  duration?: number;
  onFinish?: () => void;
}

const TOTAL_RUNTIME_MS = 3000;
const EXIT_DURATION_S = 1.0;
const EXIT_START_MS = 2000; // Phase 3 exit begins at 2.0s, concludes at 3.0s

export const StudioSplash: React.FC<StudioSplashProps> = ({ 
  onFinish 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isRendered, setIsRendered] = useState(true);
  const hasFinishedRef = useRef(false);

  const handleFinish = () => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    setIsRendered(false);
    if (onFinish) onFinish();
  };

  useEffect(() => {
    // Phase 3: Cross-dissolve exit begins at t = 2.0s (duration: 1.0s)
    const exitTimer = setTimeout(() => {
      setIsVisible(false);
    }, EXIT_START_MS);

    // Safety fallback unmount at t = 3050ms to ensure cleanup even if onExitComplete is throttled
    const fallbackTimer = setTimeout(() => {
      handleFinish();
    }, TOTAL_RUNTIME_MS + 50);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(fallbackTimer);
    };
  }, []);

  if (!isRendered) return null;

  return (
    <AnimatePresence onExitComplete={handleFinish}>
      {isVisible && (
        <motion.div
          key="studio-splash-screen"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: EXIT_DURATION_S, ease: "easeInOut" }
          }}
          style={{ 
            transform: "translateZ(0)", 
            willChange: "opacity" 
          }}
          className="fixed inset-0 z-[99999] bg-[#000000] flex flex-col items-center justify-center select-none pointer-events-none"
        >
          {/* Main Branding Container */}
          <div className="flex flex-col items-center justify-center text-center px-6">
            
            {/* 1. App Icon with silky upward glide & soft scale (0.0s - 0.8s) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1.0, y: 0 }}
              transition={{ 
                duration: 0.8, 
                ease: [0.16, 1, 0.3, 1] 
              }}
              style={{ transform: "translateZ(0)" }}
              className="mb-5 sm:mb-6"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-2xl shadow-black/80 flex items-center justify-center bg-[#000000]">
                <img
                  src="/logo.png"
                  alt="Sudoku Sync"
                  className="w-full h-full object-cover pointer-events-none select-none"
                  style={{ transform: "scale(1.04)" }}
                />
              </div>
            </motion.div>

            {/* 2. Primary Title: SUDOKU SYNC (0.0s - 0.8s) */}
            <motion.h1
              initial={{ opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1.0, y: 0 }}
              transition={{ 
                duration: 0.8, 
                ease: [0.16, 1, 0.3, 1] 
              }}
              style={{ transform: "translateZ(0)" }}
              className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight uppercase font-sans select-none leading-none flex items-center justify-center"
            >
              <span className="font-sans font-black text-white">SUDOKU</span>
              <span className="ml-2 font-sans font-black text-[#38bdf8]">SYNC</span>
            </motion.h1>

            {/* 3. Byline: BY MOLOGIC (0.2s - 0.8s reveal, 1.2s Zen Reverence Hold, 2.0s exit) */}
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 0.85, y: 0 }}
              transition={{ 
                delay: 0.2, 
                duration: 0.6, 
                ease: [0.16, 1, 0.3, 1] 
              }}
              style={{ transform: "translateZ(0)" }}
              className="mt-3.5 flex items-center justify-center text-center"
            >
              <span 
                className="text-[12.5px] font-semibold uppercase text-slate-400 font-sans select-none"
                style={{ letterSpacing: "0.24em" }}
              >
                BY <span className="font-bold text-slate-200">MOLOGIC</span>
              </span>
            </motion.div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
