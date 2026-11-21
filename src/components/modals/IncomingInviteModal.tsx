import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Check, Lock, XCircle, RefreshCw } from "lucide-react";
import { useTranslation } from "../../i18n/useTranslation";
import { BlockSyncLogo } from "../../games/blocks/BlockSyncLogo";

export interface IncomingInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  incomingChallengeDetails: {
    senderName?: string;
    difficulty?: string;
    maxMistakes?: number;
    password?: string;
    pinHash?: string;
    gameType?: "sudoku" | "blocks";
    blocksMode?: "classic" | "rush";
    blocksUndoAllowed?: boolean;
    blocksTimeLimitSec?: number;
    [key: string]: any;
  } | null;
  enteredInvitePassword: string;
  setEnteredInvitePassword: (val: string) => void;
  invitePasswordError: string | null;
  setInvitePasswordError: (err: string | null) => void;
  onDecline: () => void;
  onAccept: () => void;
  isJoiningRoomLoading?: boolean;
  darkMode: boolean;
  playClickSound: () => void;
}

export const IncomingInviteModal: React.FC<IncomingInviteModalProps> = ({
  isOpen,
  onClose,
  incomingChallengeDetails,
  enteredInvitePassword,
  setEnteredInvitePassword,
  invitePasswordError,
  setInvitePasswordError,
  onDecline,
  onAccept,
  isJoiningRoomLoading = false,
  darkMode,
  playClickSound
}) => {
  const { t } = useTranslation();

  const isBlocksInvite = incomingChallengeDetails?.gameType === "blocks";
  const blocksMode = incomingChallengeDetails?.blocksMode === "rush" ? "rush" : "classic";
  const blocksModeLabel =
    blocksMode === "rush" ? t("blocks_mode_rush") : t("blocks_mode_classic");
  const blocksTimeMinutes = Math.max(
    1,
    Math.round((Number(incomingChallengeDetails?.blocksTimeLimitSec) || 180) / 60)
  );
  const blocksUndoAllowed =
    incomingChallengeDetails?.blocksUndoAllowed !== undefined
      ? Boolean(incomingChallengeDetails.blocksUndoAllowed)
      : true;
  const shouldShowPasswordField = isBlocksInvite
    ? Boolean(incomingChallengeDetails?.password || incomingChallengeDetails?.pinHash)
    : Boolean(incomingChallengeDetails?.password);

  const normalizedDiff = (incomingChallengeDetails?.difficulty || "MEDIUM").toUpperCase();
  const diffKey = (normalizedDiff === "EASY" ? "easy" : normalizedDiff === "HARD" ? "hard" : normalizedDiff === "EXPERT" ? "expert" : "medium") as any;
  const diffLabel = t(diffKey) || normalizedDiff;

  const diffBadgeStyle = normalizedDiff === "EASY"
    ? (darkMode ? "bg-[#022c22] text-[#d1fae5]" : "bg-[#D1FAE5] text-[#065F46]")
    : normalizedDiff === "HARD"
    ? (darkMode ? "bg-[#2e1065] text-[#e9d5ff]" : "bg-[#F3E8FF] text-[#6B21A8]")
    : normalizedDiff === "EXPERT"
    ? (darkMode ? "bg-[#4c0519] text-[#fecdd3]" : "bg-[#FFE4E6] text-[#9D174D]")
    : (darkMode ? "bg-[#451a03] text-[#fef08a]" : "bg-[#FFF99D] text-[#854D0E]");

  const acceptBtnStyle = isBlocksInvite
    ? (darkMode
        ? "bg-[#0EA5E9] text-slate-950 hover:bg-[#38BDF8] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/80"
        : "bg-[#2B8CEE] text-white hover:bg-[#1E7AD8] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-900/35")
    : normalizedDiff === "EASY"
    ? (darkMode ? "bg-[#022c22] text-[#d1fae5] hover:bg-[#022c22]/80" : "bg-[#D1FAE5] text-[#065F46] hover:bg-[#A7F3D0]")
    : normalizedDiff === "HARD"
    ? (darkMode ? "bg-[#2e1065] text-[#e9d5ff] hover:bg-[#2e1065]/80" : "bg-[#F3E8FF] text-[#6B21A8] hover:bg-[#f3e8ff]/80")
    : normalizedDiff === "EXPERT"
    ? (darkMode ? "bg-[#4c0519] text-[#fecdd3] hover:bg-[#4c0519]/80" : "bg-[#FFE4E6] text-[#9D174D] hover:bg-[#ffe4e6]/80")
    : (darkMode ? "bg-[#451a03] text-[#fef08a] hover:bg-[#451a03]/80" : "bg-[#FFF99D] text-[#854D0E] hover:bg-[#ffffbf]");

  return (
    <AnimatePresence>
      {isOpen && incomingChallengeDetails && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`fixed inset-0 z-[10000] flex items-center justify-center backdrop-blur-sm p-4 ${
            isBlocksInvite
              ? (darkMode ? "bg-[#0B0F14]/80" : "bg-[#E8F1F8]/80")
              : "bg-[#FDFBF7]/80 dark:bg-[#1A1A1A]/80"
          }`}
        >
          {/* Backdrop (backdrop-click dismissal disabled to prevent accidental closure while typing password) */}
          <div className="absolute inset-0 pointer-events-none" />

          <motion.div 
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className={`modal card relative w-full max-w-sm rounded-[32px] p-8 flex flex-col gap-6 shadow-[0_12px_40px_rgba(0,0,0,0.08)] select-none z-[10001] text-center transition-colors duration-300 ${
              isBlocksInvite
                ? (darkMode
                    ? "bg-[#141A21] text-slate-100 border border-white/10"
                    : "bg-[#F4F8FB] text-slate-900 border border-[#D4E4F0]")
                : (darkMode ? "bg-[#2A2D24] text-[#FDFBF7] border-none" : "bg-[#FDFBF7] text-[#4B5563] border-none")
            }`}
          >
            <div className="flex flex-col items-center gap-1 min-w-0 max-w-full">
              {isBlocksInvite ? (
                <div className="flex flex-col items-center gap-2 mb-0.5">
                  <div className="flex items-center justify-center gap-2">
                    <BlockSyncLogo size={28} isDarkMode={darkMode} />
                    <span className={`text-[11px] font-sans font-extrabold uppercase tracking-[0.2em] ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                      BLOCK <span className={darkMode ? "text-[#38BDF8]" : "text-[#2B8CEE]"}>SYNC</span>
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider ${
                    darkMode ? "bg-[#38BDF8]/15 text-[#38BDF8]" : "bg-[#2B8CEE]/12 text-[#2B8CEE]"
                  }`}>
                    {blocksModeLabel}
                  </span>
                </div>
              ) : (
                <span className={`text-[12px] font-sans font-bold uppercase tracking-widest ${darkMode ? "text-[#D1D5DB]" : "text-[#9CA3AF]"}`}>
                  {`${normalizedDiff} RACE`}
                </span>
              )}
              <h3 className={`text-2xl font-sans font-medium tracking-tight mt-1 max-w-full truncate ${
                isBlocksInvite
                  ? (darkMode ? "text-slate-100" : "text-slate-900")
                  : (darkMode ? "text-[#FDFBF7]" : "text-[#4B5563]")
              }`}>
                {incomingChallengeDetails.senderName || incomingChallengeDetails.fromName || t("fellowPlayer")}
              </h3>
              <p className={`text-sm font-sans mt-0.5 ${
                isBlocksInvite
                  ? (darkMode ? "text-slate-400" : "text-slate-600")
                  : (darkMode ? "text-[#9CA3AF]" : "text-[#6B7280]")
              }`}>
                {t("invitedYouMessage")}
              </p>
            </div>

            {/* 📊 SUMMARY */}
            {isBlocksInvite ? (
              <div className="flex items-center justify-center gap-6 py-2">
                <div className="flex flex-col items-center">
                  <span className={`text-[10px] uppercase font-bold tracking-widest ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                    {t("blocks_mode_label")}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-black uppercase tracking-wider mt-1 ${
                    darkMode ? "bg-[#38BDF8]/15 text-[#38BDF8]" : "bg-[#2B8CEE]/12 text-[#2B8CEE]"
                  }`}>
                    {blocksModeLabel}
                  </span>
                </div>
                <div className={`w-[1px] h-8 ${darkMode ? "bg-slate-700/60" : "bg-[#D4E4F0]"}`} />
                <div className="flex flex-col items-center">
                  <span className={`text-[10px] uppercase font-bold tracking-widest ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                    {blocksMode === "rush" ? t("blocks_time_limit_label") : t("blocks_undo_label")}
                  </span>
                  <span className={`text-lg font-mono font-semibold mt-0.5 ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
                    {blocksMode === "rush"
                      ? t("blocks_min_short", { min: blocksTimeMinutes })
                      : (blocksUndoAllowed ? t("blocks_undo_allowed") : t("blocks_undo_none"))}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-6 py-2">
                <div className="flex flex-col items-center">
                  <span className={`text-[10px] uppercase font-bold tracking-widest ${darkMode ? "text-[#6B7280]" : "text-[#D1D5DB]"}`}>{t("levelLabel")}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-black uppercase tracking-wider mt-1 ${diffBadgeStyle}`}>
                    {diffLabel}
                  </span>
                </div>
                <div className={`w-[1px] h-8 ${darkMode ? "bg-[#4B5563]" : "bg-[#E5E7EB]"}`} />
                <div className="flex flex-col items-center">
                  <span className={`text-[10px] uppercase font-bold tracking-widest ${darkMode ? "text-[#6B7280]" : "text-[#D1D5DB]"}`}>{t("mistakesLabel")}</span>
                  <span className="text-lg font-mono font-medium">{t("mistakesLimitText", { count: incomingChallengeDetails.maxMistakes ?? 3 })}</span>
                </div>
              </div>
            )}

            {/* 🔒 PASSWORD FIELD */}
            {shouldShowPasswordField && (
              <div className={`p-4 rounded-3xl flex flex-col gap-2 select-none ${
                isBlocksInvite
                  ? (darkMode
                      ? "bg-[#1A2430] text-slate-200 border border-[#38BDF8]/20"
                      : "bg-[#EBF4FB] text-slate-800 border border-[#C8DFF3]")
                  : `border-none ${darkMode ? "bg-stone-800/20 text-rose-300" : "bg-[#FFF5F5] text-red-950"}`
              }`}>
                <div className="flex items-center justify-center gap-1.5 font-sans font-bold uppercase tracking-wider text-[10px]">
                  <Lock className={`w-3.5 h-3.5 stroke-[2.5] shrink-0 ${
                    isBlocksInvite
                      ? (darkMode ? "text-[#38BDF8]" : "text-[#2B8CEE]")
                      : "text-red-500"
                  }`} />
                  <span>{t("enterPasswordTitle")}</span>
                </div>
                <input
                  type="text"
                  maxLength={16}
                  disabled={isJoiningRoomLoading}
                  placeholder={t("passcodePlaceholder")}
                  value={enteredInvitePassword}
                  onChange={(e) => {
                    setEnteredInvitePassword(e.target.value.replace(/[^a-zA-Z0-9]/g, ''));
                    setInvitePasswordError(null);
                  }}
                  className={`w-full py-2.5 px-3 rounded-[16px] text-center text-xs font-mono font-bold tracking-widest border-none select-none ${
                    isBlocksInvite
                      ? `focus:outline-none focus:ring-2 focus:ring-inset ${
                          darkMode
                            ? "bg-[#0F172A]/85 text-slate-100 placeholder-slate-500 focus:ring-[#38BDF8]"
                            : "bg-white text-slate-900 placeholder-slate-400 focus:ring-[#2B8CEE]"
                        }`
                      : `focus:outline-none focus:ring-0 ${
                          darkMode ? "bg-black/20 text-stone-100 placeholder-zinc-700" : "bg-white text-stone-850 placeholder-stone-300"
                        }`
                  } ${isJoiningRoomLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                />
                {invitePasswordError && (
                  <span className="text-[10px] font-bold text-rose-600 text-center uppercase tracking-wide mt-0.5 flex items-center justify-center gap-1">
                    <XCircle className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                    <span>{invitePasswordError.replace(/^❌\s*/, "")}</span>
                  </span>
                )}
              </div>
            )}

            {/* ACTION FOOTER */}
            <div className="flex flex-col gap-2 w-full mt-2">
              <div className="flex w-full gap-3">
                <button
                  disabled={isJoiningRoomLoading}
                  onClick={() => {
                    playClickSound();
                    onDecline();
                  }}
                  className={`flex-1 aspect-[2/1] rounded-[24px] flex items-center justify-center transition-all shadow-[0_4px_12px_rgba(0,0,0,0.02)] active:scale-95 border-none focus-visible:outline-none ${
                    isJoiningRoomLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  } ${
                    isBlocksInvite
                      ? (darkMode
                          ? "bg-[#1E293B] text-slate-200 hover:bg-[#273549] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#38BDF8]"
                          : "bg-[#E2EBF3] text-slate-700 hover:bg-[#D4E2EE] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2B8CEE]")
                      : (darkMode ? "bg-[#3F4238] text-[#FDFBF7] hover:bg-[#4E5146]" : "bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]")
                  }`}
                >
                  <X className="w-7 h-7" strokeWidth={1.5} />
                </button>
                <button
                  disabled={isJoiningRoomLoading}
                  onClick={() => {
                    playClickSound();
                    onAccept();
                  }}
                  className={`flex-1 aspect-[2/1] rounded-[24px] flex items-center justify-center transition-all shadow-[0_4px_12px_rgba(0,0,0,0.02)] active:scale-95 border-none focus-visible:outline-none ${
                    isJoiningRoomLoading ? "opacity-90 cursor-not-allowed" : "cursor-pointer"
                  } ${acceptBtnStyle}`}
                >
                  {isJoiningRoomLoading ? (
                    <RefreshCw className="w-6 h-6 animate-spin stroke-[2]" />
                  ) : (
                    <Check className="w-7 h-7" strokeWidth={1.5} />
                  )}
                </button>
              </div>
              {isJoiningRoomLoading && (
                <span className={`text-xs font-sans font-bold animate-pulse mt-0.5 ${
                  isBlocksInvite
                    ? (darkMode ? "text-[#38BDF8]" : "text-[#2B8CEE]")
                    : "text-emerald-600 dark:text-emerald-400"
                }`}>
                  {t("connectingToArena")}
                </span>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
