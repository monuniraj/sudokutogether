import React from "react";
import { motion } from "motion/react";
import { X, Users, ChevronRight, Grid3X3, AlertTriangle } from "lucide-react";

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
            SudokuSync
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

      {/* Offline Banner — visible only when device has no internet */}
      {!isOnline && (
        <div className="w-full py-2.5 px-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-2 select-none">
          <AlertTriangle className="w-4 h-4 stroke-[2.5] text-amber-500 shrink-0" />
          <span>You are offline. Create a room to start Solo, or reconnect to play multiplayer.</span>
        </div>
      )}

      {/* Routes Grid */}
      <div className="grid grid-cols-1 gap-2.5">
        {/* Route 1: Create Room — always available; offline starts as Solo */}
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

        {/* Route 2: Join Room — requires live Firestore; disabled offline */}
        <button
          onClick={() => {
            if (!isOnline) return;
            playClickSound();
            onOpenJoinRoom();
          }}
          disabled={!isOnline}
          style={!isOnline ? { opacity: 0.4, pointerEvents: 'none', cursor: 'not-allowed' } : undefined}
          className={`w-full py-3 px-4 rounded-2xl flex items-center justify-between border-none transition-all duration-150 text-left shadow-xs ${
            isOnline
              ? "cursor-pointer active:scale-[0.98]"
              : "cursor-not-allowed opacity-40 pointer-events-none"
          } ${
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
