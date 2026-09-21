import React from "react";
import { motion } from "motion/react";
import { X, Users, ChevronRight, Grid3X3, WifiOff } from "lucide-react";

export interface MultiplayerForkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: () => void;
  onOpenJoinRoom: () => void;
  isOnline: boolean;
  darkMode: boolean;
  playClickSound: () => void;
}

export const MultiplayerForkModal: React.FC<MultiplayerForkModalProps> = ({
  isOpen,
  onClose,
  onCreateRoom,
  onOpenJoinRoom,
  isOnline,
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
      className={`relative w-full max-w-[400px] rounded-3xl p-6 border-none flex flex-col gap-5 select-none z-[10001] transition-colors duration-300 ${
        darkMode ? "bg-[#1A1A1A] text-stone-200" : "bg-[#FDFBF7] text-stone-850"
      }`}
      style={{
        boxShadow: darkMode ? '0 10px 40px rgba(0,0,0,0.6)' : '0 4px 20px rgba(0,0,0,0.08)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col text-left">
          <span className={`text-[10px] font-sans font-black tracking-widest uppercase ${darkMode ? "text-purple-400" : "text-[#6B21A8]"}`}>
            SudokuSync
          </span>
          <h3 className="text-xl font-sans font-black tracking-tight leading-none text-stone-850 dark:text-stone-100 mt-0.5">
            {isOnline ? "Multiplayer Lobby" : "Multiplayer Unavailable"}
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

      {!isOnline ? (
        /* 🚫 OFFLINE STATE: Prominent universal WifiOff notice & honest messaging */
        <div className="flex flex-col items-center justify-center py-2 px-1 text-center">
          {/* Prominent Wifi-Off Icon (Language-barrier safe) */}
          <div className={`p-4 rounded-3xl mb-4 flex items-center justify-center ${
            darkMode ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
          }`}>
            <WifiOff className="w-14 h-14 stroke-[2]" />
          </div>

          <h4 className="text-lg font-sans font-black tracking-tight text-stone-900 dark:text-stone-100 mb-1.5">
            You're Offline
          </h4>
          <p className="text-xs sm:text-sm font-sans font-medium text-stone-500 dark:text-stone-400 max-w-[280px] leading-relaxed mb-5">
            Please connect to the internet to play multiplayer.
          </p>

          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className={`w-full py-3 px-4 rounded-2xl font-sans font-black text-xs uppercase tracking-wider transition-all duration-150 border-none cursor-pointer shadow-sm active:scale-[0.98] ${
              darkMode
                ? "bg-zinc-800 hover:bg-zinc-700 text-stone-200"
                : "bg-stone-200 hover:bg-stone-300 text-stone-800"
            }`}
          >
            Got it
          </button>
        </div>
      ) : (
        /* 🌐 ONLINE ROUTES: Create Room & Join Room */
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
      )}
    </motion.div>
  );
};
