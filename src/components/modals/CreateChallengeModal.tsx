import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Copy,
  Lock,
  Unlock,
  Lightbulb,
  Timer,
  Check,
  XCircle,
  Users,
  Link2
} from "lucide-react";

export type Difficulty = "EASY" | "MEDIUM" | "HARD" | "EXPERT";

export interface CreateChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  challengeSeed?: number;
  boardState?: { seed?: number | string; [key: string]: any } | null;
  isRoomLocked: boolean;
  setIsRoomLocked: (val: boolean) => void;
  roomPin: string;
  setRoomPin: (val: string) => void;
  updateRoomSettingsInFirestore: (settings: { isLocked?: boolean; pin?: string; difficulty?: Difficulty; mistakesLimit?: number; hintsLimit?: number; timerEnabled?: boolean }) => void;
  challengeDifficulty: Difficulty;
  setChallengeDifficulty: (diff: Difficulty) => void;
  challengeMistakeLimit: number;
  setChallengeMistakeLimit: (val: number) => void;
  challengeHintLimit: number;
  setChallengeHintLimit: (val: number) => void;
  challengeTimerEnabled: boolean;
  setChallengeTimerEnabled: (val: boolean) => void;
  multiplayerPlayers: Array<{ id: string; name: string; status: 'online' | 'offline'; isFriend?: boolean; [key: string]: any }>;
  getInviteCooldownState: (playerId: string) => { isJoined: boolean; isPendingSent: boolean; isDeclined: boolean; remainingSeconds: number };
  handleToggleFriend: (playerId: string, playerName: string) => void;
  handleInviteFriend: (playerId: string) => void;
  handleReinviteAll: () => void;
  isInvitingAll: boolean;
  onShareLink: () => void;
  onStartGame: () => void;
  copyToClipboard: (text: string) => void;
  showCopiedToast: (msg: string) => void;
  darkMode: boolean;
  playClickSound: () => void;
}

export const CreateChallengeModal: React.FC<CreateChallengeModalProps> = ({
  isOpen,
  onClose,
  challengeSeed,
  boardState,
  isRoomLocked,
  setIsRoomLocked,
  roomPin,
  setRoomPin,
  updateRoomSettingsInFirestore,
  challengeDifficulty,
  setChallengeDifficulty,
  challengeMistakeLimit,
  setChallengeMistakeLimit,
  challengeHintLimit,
  setChallengeHintLimit,
  challengeTimerEnabled,
  setChallengeTimerEnabled,
  multiplayerPlayers,
  getInviteCooldownState,
  handleToggleFriend,
  handleInviteFriend,
  handleReinviteAll,
  isInvitingAll,
  onShareLink,
  onStartGame,
  copyToClipboard,
  showCopiedToast,
  darkMode,
  playClickSound
}) => {
  const [openDropdown, setOpenDropdown] = useState<"difficulty" | "mistakes" | "hints" | "timer" | null>(null);

  if (!isOpen) return null;

  const activeRoomCode = String(challengeSeed || (boardState?.seed ? String(boardState.seed).slice(-6) : "849201")).padStart(6, '0').slice(-6);

  return (
    <motion.div 
      key="multiplayer-create-modal"
      initial={{ scale: 0.96, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.96, opacity: 0 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={`relative w-[92%] max-w-md h-[70vh] rounded-3xl p-5 sm:p-6 border-none flex flex-col gap-4 select-none z-[10001] text-left transition-colors duration-300 ${
        darkMode ? "bg-[#1A1A1A] text-stone-200" : "bg-[#FDFBF7] text-stone-850"
      }`}
      style={{
        boxShadow: darkMode ? '0 10px 40px rgba(0,0,0,0.6)' : '0 4px 20px rgba(0,0,0,0.08)'
      }}
    >
      {/* 1. HEADER: ROOM CODE & LOCK STATUS */}
      <div className="flex flex-col gap-2 shrink-0 select-none">
        <div className="flex items-center justify-between">
          {/* Left: 6-digit room code */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs sm:text-sm font-sans font-black tracking-wider text-stone-850 dark:text-stone-100 flex items-center gap-1.5">
              <span className="text-stone-400 dark:text-stone-500 text-2xs uppercase font-bold">CODE:</span>
              <span className="font-mono tracking-widest text-sm sm:text-base select-all">{activeRoomCode}</span>
            </span>
            <button
              onClick={() => {
                playClickSound();
                copyToClipboard(activeRoomCode);
                showCopiedToast("Room code copied!");
              }}
              title="Copy room code"
              className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 hover:bg-stone-150 dark:hover:bg-zinc-800 transition-colors border-none cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right: Lock toggle & Close button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playClickSound();
                const next = !isRoomLocked;
                setIsRoomLocked(next);
                updateRoomSettingsInFirestore({ isLocked: next, pin: roomPin });
              }}
              className={`px-3 py-1.5 rounded-xl font-mono text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all duration-150 cursor-pointer border-none active:scale-95 flex items-center gap-1.5 select-none ${
                isRoomLocked
                  ? (darkMode
                      ? "bg-[#4c0519] text-[#fecdd3] shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
                      : "bg-[#FFE4E6] text-[#9D174D] shadow-[0_8px_16px_rgba(157,23,77,0.06),_0_2px_4px_rgba(0,0,0,0.02)]")
                  : (darkMode
                      ? "bg-[#022c22] text-[#d1fae5] shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
                      : "bg-[#D1FAE5] text-[#065F46] shadow-[0_8px_16px_rgba(6,95,70,0.06),_0_2px_4px_rgba(0,0,0,0.02)]")
              }`}
            >
              {isRoomLocked ? (
                <>
                  <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>LOCKED</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>UNLOCKED</span>
                </>
              )}
            </button>

            <button 
              onClick={() => { playClickSound(); onClose(); }}
              className={`p-1.5 rounded-full border-none cursor-pointer transition-all active:scale-95 hover:scale-105 ${
                darkMode ? "bg-zinc-800 hover:bg-zinc-750 text-stone-250" : "bg-stone-100 hover:bg-stone-200 text-stone-700"
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Revealed inline soft-bordered input if locked */}
        <AnimatePresence>
          {isRoomLocked && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden"
            >
              <div className="flex items-center justify-between gap-2 px-3 py-2 mt-1 rounded-xl bg-stone-100/80 dark:bg-zinc-900/60 border border-stone-200/80 dark:border-zinc-800/80">
                <span className="font-sans font-bold text-[10px] sm:text-xs uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  SET 4-DIGIT PIN:
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="_ _ _ _"
                  value={roomPin}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                    setRoomPin(cleaned);
                    updateRoomSettingsInFirestore({ isLocked: true, pin: cleaned });
                  }}
                  className="w-24 px-2 py-1 text-center font-mono font-black text-xs sm:text-sm tracking-widest rounded-lg border border-stone-300/80 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-stone-850 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. COMPACT SETTINGS 2x2 BALANCED GRID (HOMEPAGE PILL STYLING) */}
      <div className="relative z-[10010] shrink-0 select-none">
        {/* Invisible backdrop to dismiss open dropdown */}
        {openDropdown && (
          <div
            className="fixed inset-0 z-[10015] bg-transparent cursor-default"
            onClick={() => setOpenDropdown(null)}
          />
        )}

        <div className="grid grid-cols-2 gap-2.5 w-full">
          {/* Top-Left: Difficulty */}
          <div className="relative w-full">
            <button
              onClick={() => {
                playClickSound();
                setOpenDropdown(openDropdown === "difficulty" ? null : "difficulty");
              }}
              className={`w-full h-[38px] flex items-center justify-center gap-1 px-2 text-xs font-mono font-black uppercase tracking-wider rounded-xl border-none outline-none cursor-pointer transition-all duration-150 active:scale-95 ${
                challengeDifficulty === "EASY"
                  ? (darkMode ? "bg-[#022c22] text-[#d1fae5] shadow-[0_8px_16px_rgba(0,0,0,0.4)]" : "bg-[#D1FAE5] text-[#065F46] shadow-[0_8px_16px_rgba(6,95,70,0.06),_0_2px_4px_rgba(0,0,0,0.02)]")
                  : challengeDifficulty === "MEDIUM"
                  ? (darkMode ? "bg-[#451a03] text-[#fef08a] shadow-[0_8px_16px_rgba(0,0,0,0.4)]" : "bg-[#FFF99D] text-[#854D0E] shadow-[0_8px_16px_rgba(133,77,14,0.06),_0_2px_4px_rgba(0,0,0,0.02)]")
                  : challengeDifficulty === "HARD"
                  ? (darkMode ? "bg-[#2e1065] text-[#e9d5ff] shadow-[0_8px_16px_rgba(0,0,0,0.4)]" : "bg-[#F3E8FF] text-[#6B21A8] shadow-[0_8px_16px_rgba(107,33,168,0.06),_0_2px_4px_rgba(0,0,0,0.02)]")
                  : (darkMode ? "bg-[#4c0519] text-[#fecdd3] shadow-[0_8px_16px_rgba(0,0,0,0.4)]" : "bg-[#FFE4E6] text-[#9D174D] shadow-[0_8px_16px_rgba(157,23,77,0.06),_0_2px_4px_rgba(0,0,0,0.02)]")
              }`}
            >
              <span className="truncate">
                {challengeDifficulty === "EASY" ? "Easy" : challengeDifficulty === "MEDIUM" ? "Medium" : challengeDifficulty === "HARD" ? "Hard" : "Expert"} ▾
              </span>
            </button>

            {openDropdown === "difficulty" && (
              <div className="absolute top-full left-0 mt-1.5 w-full min-w-[140px] rounded-xl p-1.5 flex flex-col gap-1 z-[10020] bg-white dark:bg-zinc-900 shadow-xl border border-stone-200/80 dark:border-zinc-800">
                {(["EASY", "MEDIUM", "HARD", "EXPERT"] as Difficulty[]).map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => {
                      playClickSound();
                      setChallengeDifficulty(lvl);
                      setOpenDropdown(null);
                      updateRoomSettingsInFirestore({ difficulty: lvl });
                    }}
                    className={`w-full py-2 px-2.5 rounded-lg text-[10px] font-mono font-black uppercase tracking-wider text-left border-none cursor-pointer transition-all ${
                      lvl === "EASY"
                        ? (darkMode ? "hover:bg-[#022c22] text-[#d1fae5]" : "hover:bg-[#D1FAE5] text-[#065F46]")
                        : lvl === "MEDIUM"
                        ? (darkMode ? "hover:bg-[#451a03] text-[#fef08a]" : "hover:bg-[#FFF99D] text-[#854D0E]")
                        : lvl === "HARD"
                        ? (darkMode ? "hover:bg-[#2e1065] text-[#e9d5ff]" : "hover:bg-[#F3E8FF] text-[#6B21A8]")
                        : (darkMode ? "hover:bg-[#4c0519] text-[#fecdd3]" : "hover:bg-[#FFE4E6] text-[#9D174D]")
                    } ${challengeDifficulty === lvl ? (darkMode ? "bg-zinc-800 font-black" : "bg-stone-100 font-black") : "bg-transparent"}`}
                  >
                    {lvl.charAt(0) + lvl.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Top-Right: Mistakes */}
          <div className="relative w-full">
            <button
              onClick={() => {
                playClickSound();
                setOpenDropdown(openDropdown === "mistakes" ? null : "mistakes");
              }}
              className={`w-full h-[38px] flex items-center justify-center gap-1 px-2 text-xs font-mono font-black uppercase tracking-wider rounded-xl border-none outline-none cursor-pointer transition-all duration-150 active:scale-95 ${
                darkMode
                  ? "bg-[#451a03] text-[#fef08a] shadow-[0_8px_16px_rgba(0,0,0,0.4)]"
                  : "bg-[#FFF99D] text-[#854D0E] shadow-[0_8px_16px_rgba(133,77,14,0.06),_0_2px_4px_rgba(0,0,0,0.02)]"
              }`}
            >
              <span className="truncate">
                {challengeMistakeLimit === 0 ? "0 Mistakes" : challengeMistakeLimit === 999 ? "Unlimited" : `${challengeMistakeLimit} Mistakes`} ▾
              </span>
            </button>

            {openDropdown === "mistakes" && (
              <div className="absolute top-full right-0 mt-1.5 w-full min-w-[200px] rounded-xl p-1.5 flex flex-col gap-1 z-[10020] bg-white dark:bg-zinc-900 shadow-xl border border-stone-200/80 dark:border-zinc-800">
                {[
                  { label: "0 Mistakes (Sudden Death)", val: 0 },
                  { label: "3 Mistakes", val: 3 },
                  { label: "5 Mistakes", val: 5 },
                  { label: "Unlimited", val: 999 },
                ].map(opt => (
                  <button
                    key={opt.label}
                    onClick={() => {
                      playClickSound();
                      setChallengeMistakeLimit(opt.val);
                      setOpenDropdown(null);
                      updateRoomSettingsInFirestore({ mistakesLimit: opt.val });
                    }}
                    className={`w-full py-2 px-2.5 rounded-lg text-[10px] font-mono font-black uppercase tracking-wider text-left border-none cursor-pointer transition-all ${
                      darkMode
                        ? "hover:bg-[#451a03] text-[#fef08a]"
                        : "hover:bg-[#FFF99D] text-[#854D0E]"
                    } ${challengeMistakeLimit === opt.val ? (darkMode ? "bg-zinc-800 font-black" : "bg-stone-100 font-black") : "bg-transparent"}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bottom-Left: Hints */}
          <div className="relative w-full">
            <button
              onClick={() => {
                playClickSound();
                setOpenDropdown(openDropdown === "hints" ? null : "hints");
              }}
              className={`w-full h-[38px] flex items-center justify-center gap-1.5 px-2 text-xs font-mono font-black uppercase tracking-wider rounded-xl border-none outline-none cursor-pointer transition-all duration-150 active:scale-95 ${
                darkMode
                  ? "bg-[#2e1065] text-[#e9d5ff] shadow-[0_8px_16px_rgba(0,0,0,0.4)]"
                  : "bg-[#F3E8FF] text-[#6B21A8] shadow-[0_8px_16px_rgba(107,33,168,0.06),_0_2px_4px_rgba(0,0,0,0.02)]"
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
              <span className="truncate">
                {challengeHintLimit === 0 ? "No Hints" : challengeHintLimit === 1 ? "1 Hint" : `${challengeHintLimit} Hints`} ▾
              </span>
            </button>

            {openDropdown === "hints" && (
              <div className="absolute top-full left-0 mt-1.5 w-full min-w-[150px] rounded-xl p-1.5 flex flex-col gap-1 z-[10020] bg-white dark:bg-zinc-900 shadow-xl border border-stone-200/80 dark:border-zinc-800">
                {[
                  { label: "No Hints", val: 0 },
                  { label: "1 Hint", val: 1 },
                  { label: "3 Hints", val: 3 },
                  { label: "5 Hints", val: 5 },
                ].map(opt => (
                  <button
                    key={opt.label}
                    onClick={() => {
                      playClickSound();
                      setChallengeHintLimit(opt.val);
                      setOpenDropdown(null);
                      updateRoomSettingsInFirestore({ hintsLimit: opt.val });
                    }}
                    className={`w-full py-2 px-2.5 rounded-lg text-[10px] font-mono font-black uppercase tracking-wider text-left border-none cursor-pointer transition-all flex items-center gap-1.5 ${
                      darkMode
                        ? "hover:bg-[#2e1065] text-[#e9d5ff]"
                        : "hover:bg-[#F3E8FF] text-[#6B21A8]"
                    } ${challengeHintLimit === opt.val ? (darkMode ? "bg-zinc-800 font-black" : "bg-stone-100 font-black") : "bg-transparent"}`}
                  >
                    <Lightbulb className="w-3 h-3 stroke-[2.5] shrink-0" />
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bottom-Right: Timer */}
          <div className="relative w-full">
            <button
              onClick={() => {
                playClickSound();
                setOpenDropdown(openDropdown === "timer" ? null : "timer");
              }}
              className={`w-full h-[38px] flex items-center justify-center gap-1.5 px-2 text-xs font-mono font-black uppercase tracking-wider rounded-xl border-none outline-none cursor-pointer transition-all duration-150 active:scale-95 ${
                challengeTimerEnabled
                  ? (darkMode ? "bg-[#0c4a6e]/50 text-[#bae6fd] shadow-[0_8px_16px_rgba(0,0,0,0.4)]" : "bg-[#E0F2FE] text-[#0369A1] shadow-[0_8px_16px_rgba(3,105,161,0.06),_0_2px_4px_rgba(0,0,0,0.02)]")
                  : (darkMode ? "bg-zinc-800/80 text-stone-400" : "bg-stone-150 text-stone-600")
              }`}
            >
              <Timer className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
              <span className="truncate">
                {challengeTimerEnabled ? "TIMER ON ▾" : "TIMER OFF ▾"}
              </span>
            </button>

            {openDropdown === "timer" && (
              <div className="absolute top-full right-0 mt-1.5 w-full min-w-[150px] rounded-xl p-1.5 flex flex-col gap-1 z-[10020] bg-white dark:bg-zinc-900 shadow-xl border border-stone-200/80 dark:border-zinc-800">
                {[
                  { label: "Timer On", val: true },
                  { label: "Timer Off", val: false },
                ].map(opt => (
                  <button
                    key={opt.label}
                    onClick={() => {
                      playClickSound();
                      setChallengeTimerEnabled(opt.val);
                      setOpenDropdown(null);
                      updateRoomSettingsInFirestore({ timerEnabled: opt.val });
                    }}
                    className={`w-full py-2 px-2.5 rounded-lg text-[10px] font-mono font-black uppercase tracking-wider text-left border-none cursor-pointer transition-all flex items-center gap-1.5 ${
                      darkMode
                        ? "hover:bg-[#0c4a6e]/50 text-[#bae6fd]"
                        : "hover:bg-[#E0F2FE] text-[#0369A1]"
                    } ${challengeTimerEnabled === opt.val ? (darkMode ? "bg-zinc-800 font-black" : "bg-stone-100 font-black") : "bg-transparent"}`}
                  >
                    <Timer className="w-3 h-3 stroke-[2.5] shrink-0" />
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. PLAYER ROSTER & INLINE ACTIONS */}
      <div className="flex-1 min-h-0 flex flex-col gap-2 select-none">
        <div className="flex items-center justify-between px-1 shrink-0">
          <span className={`font-sans font-black uppercase tracking-wider text-[10px] ${darkMode ? "text-stone-400" : "text-stone-500"}`}>
            Players & Friends:
          </span>
          <span className={`text-[10px] font-mono font-bold ${darkMode ? "text-stone-500" : "text-stone-400"}`}>
            {multiplayerPlayers.length} Available
          </span>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-2 no-scrollbar">
          {multiplayerPlayers.length === 0 ? (
            <span className="text-xs italic text-stone-500 py-6 text-center">
              No past players yet. Share your room code or link below!
            </span>
          ) : (
            multiplayerPlayers.map(player => {
              const { isJoined, isPendingSent, isDeclined, remainingSeconds } = getInviteCooldownState(player.id);

              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-2.5 px-3 rounded-xl transition-all duration-200 shrink-0 ${
                    darkMode 
                      ? "bg-zinc-900/60 border border-zinc-800/60 text-stone-200" 
                      : "bg-white border border-stone-200/60 text-stone-850 shadow-xs"
                  }`}
                >
                  {/* Left: Status Dot, Username, Inline Friend Toggle */}
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      player.status === 'online' ? "bg-emerald-400 animate-pulse" : "bg-stone-300 dark:bg-zinc-700"
                    }`} />
                    <span className="font-bold text-xs font-sans truncate">
                      {player.name}
                    </span>
                    {player.isFriend ? (
                      <span className={`text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg shrink-0 ${
                        darkMode ? "bg-[#022c22] text-[#d1fae5]" : "bg-[#D1FAE5] text-[#065F46]"
                      }`}>
                        FRIEND
                      </span>
                    ) : (
                      <button
                        onClick={() => handleToggleFriend(player.id, player.name)}
                        className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border-none cursor-pointer shrink-0 transition-all active:scale-95 ${
                          darkMode ? "bg-zinc-800 hover:bg-zinc-750 text-stone-300" : "bg-stone-150 hover:bg-stone-200 text-stone-700"
                        }`}
                      >
                        + Add
                      </button>
                    )}
                  </div>

                  {/* Right: Dedicated match invite button */}
                  <div className="shrink-0 ml-2">
                    {isJoined ? (
                      <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl flex items-center gap-1 ${
                        darkMode ? "bg-[#022c22] text-[#d1fae5]" : "bg-[#D1FAE5] text-[#065F46]"
                      }`}>
                        <Check className="w-3 h-3 stroke-[3]" />
                        JOINED
                      </span>
                    ) : isPendingSent ? (
                      <button
                        disabled
                        className={`text-[9.5px] font-mono font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-xl border-none opacity-90 cursor-not-allowed ${
                          darkMode ? "bg-[#451a03] text-[#fef08a]" : "bg-[#FFF99D] text-[#854D0E]"
                        }`}
                      >
                        SENT ({remainingSeconds}s)...
                      </button>
                    ) : isDeclined ? (
                      <button
                        disabled
                        className={`text-[9.5px] font-mono font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-xl border-none opacity-90 cursor-not-allowed ${
                          darkMode ? "bg-[#4c0519] text-[#fecdd3]" : "bg-[#FFE4E6] text-[#9D174D]"
                        }`}
                      >
                        DECLINED ({remainingSeconds}s)
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          playClickSound();
                          handleInviteFriend(player.id);
                        }}
                        className={`text-[9.5px] font-mono font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl border-none cursor-pointer transition-all active:scale-95 shadow-xs ${
                          darkMode ? "bg-[#4c0519] hover:bg-[#831843] text-[#fecdd3]" : "bg-[#FFE4E6] hover:bg-[#FBCFE8] text-[#9D174D]"
                        }`}
                      >
                        INVITE
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. BOTTOM ACTION GROUPING */}
      <div className="flex flex-col gap-2.5 shrink-0 select-none mt-[14px]">
        {/* Side-by-side equal-width buttons */}
        <div className="grid grid-cols-2 gap-2.5 w-full">
          {/* Left: RE-INVITE ALL / STOP */}
          <button
            onClick={() => handleReinviteAll()}
            disabled={!isInvitingAll && multiplayerPlayers.length === 0}
            className={`w-full py-2.5 px-2 text-xs font-mono font-black uppercase tracking-wider rounded-xl border-none transition-all duration-150 cursor-pointer text-center flex items-center justify-center gap-1.5 active:scale-95 shadow-xs ${
              isInvitingAll
                ? "bg-rose-500 hover:bg-rose-600 text-white animate-pulse"
                : darkMode
                  ? "bg-[#2e1065]/60 hover:bg-[#2e1065] text-[#e9d5ff]"
                  : "bg-[#F3E8FF] hover:bg-[#E9D5FF] text-[#6B21A8]"
            }`}
          >
            {isInvitingAll ? (
              <>
                <XCircle className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                <span>STOP</span>
              </>
            ) : (
              <>
                <Users className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                <span>RE-INVITE ALL</span>
              </>
            )}
          </button>

          {/* Right: SHARE LINK */}
          <button
            onClick={() => {
              playClickSound();
              onShareLink();
            }}
            className={`w-full py-2.5 px-2 text-xs font-mono font-black uppercase tracking-wider rounded-xl border-none transition-all duration-150 cursor-pointer text-center flex items-center justify-center gap-1.5 active:scale-95 shadow-xs ${
              darkMode
                ? "bg-[#0c4a6e]/50 hover:bg-[#0c4a6e]/80 text-[#bae6fd]"
                : "bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#0369A1]"
            }`}
          >
            <Link2 className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
            <span>SHARE LINK</span>
          </button>
        </div>

        {/* Full-width primary START GAME button */}
        <button
          onClick={() => {
            playClickSound();
            onStartGame();
          }}
          className={`w-full py-3.5 sm:py-4 px-4 text-xs sm:text-sm font-sans font-black uppercase tracking-wider rounded-2xl border-none transition-all duration-150 cursor-pointer text-center hover:scale-[1.01] active:scale-98 shadow-md flex items-center justify-center gap-2 ${
            darkMode
              ? "bg-[#022c22] hover:bg-[#064e3b] text-[#d1fae5] shadow-[0_8px_20px_rgba(0,0,0,0.5)]"
              : "bg-[#D1FAE5] hover:bg-[#A7F3D0] active:bg-[#6EE7B7] text-[#065F46] shadow-[0_8px_20px_rgba(6,95,70,0.12)]"
          }`}
        >
          <span>START GAME</span>
        </button>
      </div>
    </motion.div>
  );
};
