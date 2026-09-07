import React from "react";
import { motion } from "motion/react";
import { X, RefreshCw, Play } from "lucide-react";

export interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  roomCodeInput: string;
  setRoomCodeInput: (code: string) => void;
  roomPinInput: string;
  setRoomPinInput: (pin: string) => void;
  joinRoomError: string | null;
  setJoinRoomError: (err: string | null) => void;
  isJoiningRoomLoading: boolean;
  onJoinRoom: () => void;
  darkMode: boolean;
  playClickSound: () => void;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({
  isOpen,
  onClose,
  onBack,
  roomCodeInput,
  setRoomCodeInput,
  roomPinInput,
  setRoomPinInput,
  joinRoomError,
  setJoinRoomError,
  isJoiningRoomLoading,
  onJoinRoom,
  darkMode,
  playClickSound
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      key="multiplayer-join-modal"
      initial={{ scale: 0.96, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.96, opacity: 0 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={`relative w-full max-w-[420px] rounded-3xl p-6 border-none flex flex-col gap-4 select-none z-[10001] text-left transition-colors duration-300 ${
        darkMode ? "bg-[#1A1A1A] text-stone-200" : "bg-[#FDFBF7] text-stone-850"
      }`}
      style={{
        boxShadow: darkMode ? '0 10px 40px rgba(0,0,0,0.6)' : '0 4px 20px rgba(0,0,0,0.08)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className={`text-[10px] font-sans font-black tracking-widest uppercase ${darkMode ? "text-sky-400" : "text-[#0369a1]"}`}>
            SudokuSync
          </span>
          <h3 className="text-xl font-sans font-black tracking-tight leading-none text-stone-850 dark:text-stone-100">
            Join Room
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

      <p className="text-xs font-sans text-stone-500 dark:text-stone-400">
        Ask your friend for their 6-digit room code to enter the match.
      </p>

      {/* 6-digit room code input */}
      <div className="flex flex-col gap-1.5 mt-1">
        <label className="font-sans font-bold text-2xs uppercase tracking-wider text-stone-400 dark:text-stone-500">
          6-Digit Room Code
        </label>
        <input
          type="text"
          maxLength={6}
          placeholder="849201"
          value={roomCodeInput}
          onChange={(e) => {
            const cleaned = e.target.value.replace(/[^0-9]/g, '');
            setRoomCodeInput(cleaned);
            setJoinRoomError(null);
          }}
          className={`w-full py-3 px-4 rounded-xl text-center text-xl font-mono font-black tracking-[0.3em] border-none outline-none transition-colors ${
            darkMode 
              ? "bg-zinc-900 text-stone-100 placeholder-zinc-700 focus:ring-2 focus:ring-sky-500/50" 
              : "bg-stone-100 text-stone-850 placeholder-stone-400 focus:ring-2 focus:ring-sky-500/30 shadow-inner"
          }`}
        />
      </div>

      {/* Optional Room PIN input */}
      <div className="flex flex-col gap-1.5">
        <label className="font-sans font-bold text-2xs uppercase tracking-wider text-stone-400 dark:text-stone-500">
          4-Digit PIN (If Room Is Locked)
        </label>
        <input
          type="password"
          maxLength={4}
          placeholder="• • • •"
          value={roomPinInput}
          onChange={(e) => {
            const cleaned = e.target.value.replace(/[^0-9]/g, '');
            setRoomPinInput(cleaned);
            setJoinRoomError(null);
          }}
          className={`w-full py-2.5 px-4 rounded-xl text-center text-sm font-mono font-bold tracking-widest border-none outline-none transition-colors ${
            darkMode 
              ? "bg-zinc-900 text-stone-100 placeholder-zinc-700 focus:ring-2 focus:ring-sky-500/50" 
              : "bg-stone-100 text-stone-850 placeholder-stone-400 focus:ring-2 focus:ring-sky-500/30 shadow-inner"
          }`}
        />
      </div>

      {/* Error Message */}
      {joinRoomError && (
        <p className="text-xs font-sans font-bold text-rose-500 text-center -my-1">
          {joinRoomError}
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2.5 mt-2">
        <button
          onClick={() => {
            playClickSound();
            onBack();
          }}
          className={`flex-1 py-3 px-4 rounded-2xl font-sans font-black text-xs uppercase tracking-wider border-none cursor-pointer transition-all active:scale-98 ${
            darkMode ? "bg-zinc-800 text-stone-300 hover:bg-zinc-700" : "bg-stone-150 text-stone-700 hover:bg-stone-200"
          }`}
        >
          Back
        </button>
        <button
          disabled={roomCodeInput.trim().length !== 6 || isJoiningRoomLoading}
          onClick={() => {
            playClickSound();
            onJoinRoom();
          }}
          className={`flex-2 py-3 px-4 rounded-2xl font-sans font-black text-xs uppercase tracking-wider border-none cursor-pointer transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 ${
            roomCodeInput.trim().length === 6 && !isJoiningRoomLoading
              ? (darkMode ? "bg-[#0c4a6e] hover:bg-[#0369a1] text-sky-100" : "bg-[#E0F2FE] hover:bg-[#bae6fd] text-[#0369a1]")
              : "opacity-50 cursor-not-allowed bg-stone-200 dark:bg-zinc-800 text-stone-400"
          }`}
        >
          {isJoiningRoomLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-current" />
          )}
          <span>{isJoiningRoomLoading ? "Joining..." : "Join Game"}</span>
        </button>
      </div>
    </motion.div>
  );
};
