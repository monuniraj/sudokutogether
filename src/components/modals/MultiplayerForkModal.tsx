import React from "react";
import { motion } from "motion/react";
import { X, Users, ChevronRight, Grid3X3 } from "lucide-react";

export interface MultiplayerForkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: () => void;
  onOpenJoinRoom: () => void;
  darkMode: boolean;
  playClickSound: () => void;
}

export const MultiplayerForkModal: React.FC<MultiplayerForkModalProps> = ({
  isOpen,
  onClose,
  onCreateRoom,
  onOpenJoinRoom,
  darkMode,
  playClickSound
}) => {
  if (!isOpen) return null;

  return (
    <motion.div 
      key="multiplayer-fork-modal"
      initial={{ scale: 0.96, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.96, opacity: 0 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={`relative w-full max-w-[400px] rounded-3xl p-5 border-none flex flex-col gap-4 select-none z-[10001] text-left transition-colors duration-300 ${
        darkMode ? "bg-[#1A1A1A] text-stone-200" : "bg-[#FDFBF7] text-stone-850"
      }`}
      style={{
        boxShadow: darkMode ? '0 10px 40px rgba(0,0,0,0.6)' : '0 4px 20px rgba(0,0,0,0.08)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className={`text-[10px] font-sans font-black tracking-widest uppercase ${darkMode ? "text-purple-400" : "text-[#6B21A8]"}`}>
            Together Mode
          </span>
          <h3 className="text-xl font-sans font-black tracking-tight leading-none text-stone-850 dark:text-stone-100 mt-0.5">
            Multiplayer Lobby
          </h3>
        </div>
        <button
          onClick={() => {
            playClickSound();
            onClose();
          }}
          className="p-1.5 rounded-full text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 hover:bg-stone-150 dark:hover:bg-zinc-800 transition-colors border-none cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 gap-2.5">
        {/* Route 1: Create Room */}
        <button
          onClick={() => {
            playClickSound();
            onCreateRoom();
          }}
          className={`w-full py-3 px-4 rounded-2xl flex items-center justify-between border-none cursor-pointer transition-all duration-150 text-left shadow-xs active:scale-[0.98] ${
            darkMode 
              ? "bg-[#2e1065]/40 hover:bg-[#2e1065]/60 text-purple-200 border border-purple-900/40" 
              : "bg-[#F3E8FF] hover:bg-[#e9d5ff] active:bg-[#d8b4fe] text-[#6B21A8]"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl flex items-center justify-center ${darkMode ? "bg-purple-900/60 text-purple-300" : "bg-white/80 text-[#6B21A8] shadow-xs"}`}>
              <Users className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="font-sans font-black text-sm uppercase tracking-wider leading-none">
              Create Room
            </span>
          </div>
          <ChevronRight className="w-5 h-5 stroke-[2.5] opacity-60" />
        </button>

        {/* Route 2: Join Room */}
        <button
          onClick={() => {
            playClickSound();
            onOpenJoinRoom();
          }}
          className={`w-full py-3 px-4 rounded-2xl flex items-center justify-between border-none cursor-pointer transition-all duration-150 text-left shadow-xs active:scale-[0.98] ${
            darkMode 
              ? "bg-[#0c4a6e]/40 hover:bg-[#0c4a6e]/60 text-sky-200 border border-sky-900/40" 
              : "bg-[#E0F2FE] hover:bg-[#bae6fd] active:bg-[#7dd3fc] text-[#0369a1]"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl flex items-center justify-center ${darkMode ? "bg-sky-900/60 text-sky-300" : "bg-white/80 text-[#0369a1] shadow-xs"}`}>
              <Grid3X3 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="font-sans font-black text-sm uppercase tracking-wider leading-none">
              Join Room
            </span>
          </div>
          <ChevronRight className="w-5 h-5 stroke-[2.5] opacity-60" />
        </button>
      </div>
    </motion.div>
  );
};
