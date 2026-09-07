import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

export interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  playClickSound: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({
  isOpen,
  onClose,
  darkMode,
  playClickSound
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div
            className="absolute inset-0 cursor-pointer"
            onClick={() => {
              playClickSound();
              onClose();
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className={`relative w-full max-w-sm rounded-[16px] shadow-2xl overflow-hidden flex flex-col ${
              darkMode ? "bg-[#1E1E1E] border border-zinc-800" : "bg-[#FDFBF7]"
            }`}
          >
            <div
              className={`p-4 border-b flex justify-between items-center ${
                darkMode ? "border-zinc-800/60" : "border-stone-200/60"
              }`}
            >
              <h3
                className={`font-sans font-black text-lg ${
                  darkMode ? "text-amber-200" : "text-amber-800"
                }`}
              >
                How to Play
              </h3>
              <button
                onClick={() => {
                  playClickSound();
                  onClose();
                }}
                className={`p-1.5 rounded-full border-none cursor-pointer hover:opacity-80 active:scale-95 transition-all ${
                  darkMode ? "bg-zinc-800 text-stone-400" : "bg-stone-200 text-stone-500"
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 max-h-[60vh] overflow-y-auto">
              <p
                className={`font-sans text-sm leading-relaxed ${
                  darkMode ? "text-stone-300" : "text-stone-700"
                }`}
              >
                The goal of SudokuSync is to fill the grid so that every row, column, and 3x3
                box contains all numbers from 1 to 9. Each number can only appear once in each row,
                column, and 3x3 box. Use the Pencil tool to jot down potential numbers. Use the
                Eraser tool to correct mistakes. The game is complete once the grid is filled
                correctly. Stay calm and enjoy the journey.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
