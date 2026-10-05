import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Trophy,
  Award,
  Clock,
  XCircle,
  RotateCcw,
  Sparkles,
  Copy,
  Lock,
  Unlock,
  Plus,
  Check,
  Users,
  Share2,
  ArrowLeft,
  Play
} from "lucide-react";
import { useTranslation } from "../../i18n/useTranslation";
import { useFriendPresence } from "../../hooks/useFriendPresence";
import { formatActiveStatus } from "../../utils/formatTimestamp";

export interface GameOverModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  difficulty: string;
  boardState: any;
  mistakeLimitEnabled: boolean;
  sessionSeconds: number;
  syncedLeaderboard: any[];
  userProfile: any;
  checkIsDisplayNameConfigured: () => boolean;
  getActiveDisplayName: () => string;
  isNewRecordAchieved: boolean;
  formatTimer: (seconds: number) => string;
  playClickSound: () => void;

  // Step 1 Actions
  onSameGameReplay: () => Promise<void>;
  onNewGameClick: () => void;

  // Step 2 Rematch & Room State
  endGameStep: 1 | 2;
  setEndGameStep: (step: 1 | 2) => void;
  rematchGameId: string;
  challengeSeed: number;
  isRoomLocked: boolean;
  setIsRoomLocked: (locked: boolean) => void;
  roomPin: string;
  setRoomPin: (pin: string) => void;
  updateRoomSettingsInFirestore: (settings: { isLocked: boolean; pin: string }) => void;
  copyToClipboard: (text: string) => void;
  showCopiedToast: (text: string) => void;
  multiplayerPlayers: any[];
  getInviteCooldownState: (playerId: string) => any;
  handleToggleFriend: (playerId: string, playerName: string) => void;
  handleInviteFriend: (playerId: string) => void;
  handleReinviteAll: () => void;
  isInvitingAll: boolean;
  shareChallengeLink: (roomCode: string, msg: string) => Promise<void>;
  onStartRematchGame: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  onClose,
  darkMode,
  difficulty,
  boardState,
  mistakeLimitEnabled,
  sessionSeconds,
  syncedLeaderboard,
  userProfile,
  checkIsDisplayNameConfigured,
  getActiveDisplayName,
  isNewRecordAchieved,
  formatTimer,
  playClickSound,
  onSameGameReplay,
  onNewGameClick,
  endGameStep,
  setEndGameStep,
  rematchGameId,
  challengeSeed,
  isRoomLocked,
  setIsRoomLocked,
  roomPin,
  setRoomPin,
  updateRoomSettingsInFirestore,
  copyToClipboard,
  showCopiedToast,
  multiplayerPlayers,
  getInviteCooldownState,
  handleToggleFriend,
  handleInviteFriend,
  handleReinviteAll,
  isInvitingAll,
  shareChallengeLink,
  onStartRematchGame
}) => {
  const { t } = useTranslation();
  const playerIds = (multiplayerPlayers || []).map((p: any) => p.id);
  const { isIncognito, toggleIncognito, getFriendStatus, getFriendLastActive } = useFriendPresence(userProfile?.id, playerIds);

  if (!isOpen || !boardState) return null;

  const activeRematchRoomCode = String(
    rematchGameId || challengeSeed || (boardState?.seed ? String(boardState.seed).slice(-6) : "849201")
  )
    .padStart(6, "0")
    .slice(-6);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Backdrop click dismisser — closes overlay and reveals the board beneath (disabled in Step 2 Rematch/PIN screen to prevent accidental closure) */}
      <div
        className={`absolute inset-0 ${endGameStep === 2 ? "pointer-events-none" : "cursor-pointer"}`}
        onClick={() => {
          if (endGameStep === 2) return;
          playClickSound();
          onClose();
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={`modal card p-4 sm:p-6 md:p-8 w-[92%] sm:w-full max-w-lg max-h-[85vh] sm:max-h-[88vh] my-auto mx-auto relative flex flex-col gap-3 sm:gap-4 rounded-[28px] shadow-[0_24px_50px_rgba(0,0,0,0.2)] overflow-hidden ${
          darkMode ? "bg-zinc-900 border border-zinc-700/50" : "bg-[#FDFBF7] border border-stone-200"
        }`}
      >
        {/* ── 2-STEP END-GAME FLOW ── */}
        {endGameStep === 1 ? (
          <>
            {/* Header Strip for Step 1: MATCH RESULTS + X button */}
            <div className="flex items-center justify-between shrink-0 select-none">
              <div className="flex items-center gap-2">
                <h3
                  className={`text-lg sm:text-xl font-sans font-black tracking-tight uppercase leading-normal overflow-visible ${
                    darkMode ? "text-white" : "text-[#1C1917]"
                  }`}
                >
                  {t("multiplayerLobbyTitle")}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider leading-normal overflow-visible ${
                    darkMode ? "bg-purple-900/40 text-purple-300" : "bg-[#F3E8FF] text-[#6B21A8]"
                  }`}
                >
                  {t(difficulty.toLowerCase() as any)}
                </span>
              </div>
              <button
                onClick={() => {
                  playClickSound();
                  onClose();
                }}
                className={`p-1.5 rounded-full border-none cursor-pointer transition-all hover:scale-110 active:scale-95 ${
                  darkMode ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300" : "bg-stone-100 hover:bg-stone-200 text-stone-600"
                }`}
                title="Close"
              >
                <X className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>

            <div className={`w-full h-px shrink-0 ${darkMode ? "bg-zinc-800" : "bg-stone-200"}`} />

            {/* SCREEN 1: Middle Leaderboard Player List cleanly spaced */}
            <div className="max-h-[48vh] sm:max-h-[52vh] overflow-y-auto overscroll-contain pr-1 custom-scrollbar flex flex-col gap-2">
              {(() => {
                const didCurrentPlayerFail =
                  mistakeLimitEnabled &&
                  (boardState.maxMistakesLimit === 0
                    ? boardState.currentMistakesCount > 0
                    : boardState.currentMistakesCount >= boardState.maxMistakesLimit);

                const resultsMap = new Map<string, any>();

                const isConfigured = checkIsDisplayNameConfigured();
                const currentLocalName = (userProfile?.name && userProfile.name.trim()) || getActiveDisplayName();
                const localMe = {
                  id: userProfile?.id || "me",
                  name: currentLocalName,
                  time: didCurrentPlayerFail ? 9999 : sessionSeconds,
                  elapsedTime: sessionSeconds,
                  mistakes: boardState.currentMistakesCount,
                  failed: didCurrentPlayerFail,
                  isMe: true,
                  isReal: true,
                  isPending: false
                };
                resultsMap.set(localMe.id, localMe);

                syncedLeaderboard.forEach((r: any) => {
                  const isCurrentUser = r.userId === userProfile?.id;
                  const isAbandoned = r.status === "abandoned" || r.status === "left" || r.status === "forfeited";
                  resultsMap.set(r.userId, {
                    id: r.userId,
                    name: isCurrentUser ? r.playerName || currentLocalName : r.playerName,
                    time: isAbandoned ? 99999 : !r.isWon ? 9999 : Number(r.timeSec),
                    elapsedTime:
                      Number(r.timeSec) > 0 && Number(r.timeSec) < 9999
                        ? Number(r.timeSec)
                        : Number(r.elapsedTime) || 0,
                    mistakes: Number(r.mistakes),
                    failed: (!r.isWon && !r.isPending) || isAbandoned,
                    isAbandoned: isAbandoned,
                    isMe: isCurrentUser,
                    isReal: true,
                    isPending: !isCurrentUser && !isAbandoned ? !!r.isPending : false
                  });
                });

                const results = Array.from(resultsMap.values());
                results.sort((a, b) => {
                  if (a.isAbandoned !== b.isAbandoned) return a.isAbandoned ? 1 : -1;
                  const aPending = !!a.isPending;
                  const bPending = !!b.isPending;
                  if (aPending !== bPending) return aPending ? 1 : -1;
                  if (a.failed !== b.failed) return a.failed ? 1 : -1;
                  if (a.time !== b.time) return a.time - b.time;
                  if (a.mistakes !== b.mistakes) return a.mistakes - b.mistakes;
                  return (a.elapsedTime || 0) - (b.elapsedTime || 0);
                });

                return results.map((player, idx) => {
                  const isMultiplayerCompetitive = results.length >= 2;
                  const isPending = !!player.isPending;
                  const isPodium1 = isMultiplayerCompetitive && idx === 0 && !player.failed && !player.isAbandoned;
                  const isPodium2 = isMultiplayerCompetitive && idx === 1 && !player.failed && !player.isAbandoned;
                  const isPodium3 = isMultiplayerCompetitive && idx === 2 && !player.failed && !player.isAbandoned;
                  const isSoloComplete = !isMultiplayerCompetitive && idx === 0 && !player.failed && !player.isAbandoned;
                  const positionStr = isMultiplayerCompetitive
                    ? idx === 0
                      ? t("podium1st")
                      : idx === 1
                      ? t("podium2nd")
                      : idx === 2
                      ? t("podium3rd")
                      : `${idx + 1}th`
                    : "—";
                  const isMeNewPB = Boolean(player.isMe && isNewRecordAchieved && !player.failed);

                  return (
                    <div
                      key={player.id}
                      style={{
                        animationDelay: `${idx * 80}ms`,
                        transform: isMeNewPB ? "scale(1.02)" : undefined
                      }}
                      className={`animate-podium-reveal ${
                        isMeNewPB ? "animate-radiant-sheen" : ""
                      } flex items-center justify-between p-3.5 rounded-2xl gap-3 transition-all border-none ${
                        isPodium1
                          ? darkMode
                            ? "bg-[#4c0519]/70 text-[#fecdd3] shadow-[0_2px_12px_rgba(0,0,0,0.25)]"
                            : "bg-[#FFE4E6] text-[#9D174D] shadow-[0_2px_12px_rgba(244,63,94,0.08)]"
                          : isPodium2
                          ? darkMode
                            ? "bg-[#2e1065]/70 text-[#e9d5ff] shadow-xs"
                            : "bg-[#F3E8FF] text-[#6B21A8] shadow-xs"
                          : isPodium3
                          ? darkMode
                            ? "bg-[#451a03]/70 text-[#fef08a] shadow-xs"
                            : "bg-[#FFF99D] text-[#854D0E] shadow-xs"
                          : darkMode
                          ? "bg-zinc-800/40 text-zinc-400"
                          : "bg-stone-100/80 text-stone-500"
                      }`}
                    >
                      {/* Left: Rank Medal/Trophy icon + Player Name + subtle 'YOU' badge + subtle 'New PB' pill badge */}
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 relative z-10">
                        <span
                          className={`font-mono text-sm sm:text-base font-black w-7 sm:w-8 text-center flex items-center justify-center shrink-0 ${
                            player.isAbandoned
                              ? "text-rose-500"
                              : isPending
                              ? "text-amber-500 animate-pulse"
                              : isPodium1
                              ? darkMode
                                ? "text-[#fecdd3]"
                                : "text-[#9D174D]"
                              : isPodium2
                              ? darkMode
                                ? "text-[#e9d5ff]"
                                : "text-[#6B21A8]"
                              : isPodium3
                              ? darkMode
                                ? "text-[#fef08a]"
                                : "text-[#854D0E]"
                              : darkMode
                              ? "text-zinc-400"
                              : "text-stone-500"
                          }`}
                        >
                          {player.isAbandoned ? (
                            <XCircle className="w-4 h-4 text-rose-500 stroke-[2.5]" />
                          ) : isPending ? (
                            <Clock className="w-4 h-4 text-amber-500 animate-spin" />
                          ) : isPodium1 ? (
                            <Trophy
                              className={`w-5 h-5 stroke-[2.5] shrink-0 ${
                                darkMode ? "text-[#fecdd3] fill-[#9F1239]/60" : "text-[#9D174D] fill-[#FECDD3]"
                              }`}
                            />
                          ) : isPodium2 ? (
                            <Award className={`w-4.5 h-4.5 stroke-[2.5] shrink-0 ${darkMode ? "text-[#e9d5ff]" : "text-[#6B21A8]"}`} />
                          ) : isPodium3 ? (
                            <Award className={`w-4.5 h-4.5 stroke-[2.5] shrink-0 ${darkMode ? "text-[#fef08a]" : "text-[#854D0E]"}`} />
                          ) : (
                            positionStr
                          )}
                        </span>

                        <div className="flex items-center gap-2 min-w-0 flex-wrap">
                          <span
                            className={`font-sans font-bold text-sm leading-normal overflow-visible truncate ${
                              isPodium1
                                ? darkMode
                                  ? "text-[#fecdd3]"
                                  : "text-[#9D174D]"
                                : isPodium2
                                ? darkMode
                                  ? "text-[#e9d5ff]"
                                  : "text-[#6B21A8]"
                                : isPodium3
                                ? darkMode
                                  ? "text-[#fef08a]"
                                  : "text-[#854D0E]"
                                : player.isMe
                                ? darkMode
                                  ? "text-indigo-300 font-bold"
                                  : "text-indigo-950 font-bold"
                                : darkMode
                                ? "text-zinc-300 font-medium"
                                : "text-stone-700 font-medium"
                            }`}
                          >
                            {player.name}
                          </span>

                          {player.isMe && (
                            <span className="text-[9px] bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 px-1.5 py-0.5 rounded font-sans font-semibold uppercase tracking-wider shrink-0 leading-normal overflow-visible">
                              {t("youBadge")}
                            </span>
                          )}

                          {player.isMe && isNewRecordAchieved && !player.failed && (
                            <span className="text-[8.5px] bg-amber-400/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-sans font-medium uppercase tracking-wider flex items-center gap-1 shrink-0 animate-pulse">
                              <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                              <span>New PB</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Clean Time + small compact error count */}
                      <div className="flex flex-col items-end justify-center shrink-0 whitespace-nowrap text-right relative z-10">
                        {player.isAbandoned ? (
                          <span className="font-mono text-xs font-semibold text-rose-500">Left</span>
                        ) : isPending ? (
                          <span className="font-mono text-xs text-amber-500 flex items-center gap-1 font-bold">
                            <span>Solving</span>
                            <span className="inline-flex items-center gap-0.5 ml-0.5">
                              <span
                                className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block animate-pulse-dots"
                                style={{ animationDelay: "0s" }}
                              />
                              <span
                                className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block animate-pulse-dots"
                                style={{ animationDelay: "0.2s" }}
                              />
                              <span
                                className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block animate-pulse-dots"
                                style={{ animationDelay: "0.4s" }}
                              />
                            </span>
                          </span>
                        ) : player.failed ? (
                          <>
                            <span className="font-mono font-semibold text-xs sm:text-sm text-rose-500">Failed</span>
                            <span className="font-mono text-[9px] text-stone-500 dark:text-zinc-400">
                              {player.mistakes} errors
                            </span>
                          </>
                        ) : (
                          <>
                            <span
                              className={`font-mono font-bold text-sm sm:text-base ${
                                isPodium1
                                  ? darkMode
                                    ? "text-[#fecdd3]"
                                    : "text-[#9D174D]"
                                  : isPodium2
                                  ? darkMode
                                    ? "text-[#e9d5ff]"
                                    : "text-[#6B21A8]"
                                  : isPodium3
                                  ? darkMode
                                    ? "text-[#fef08a]"
                                    : "text-[#854D0E]"
                                  : player.isMe
                                  ? darkMode
                                    ? "text-indigo-300 font-bold"
                                    : "text-indigo-950 font-bold"
                                  : darkMode
                                  ? "text-zinc-300 font-bold"
                                  : "text-stone-700 font-bold"
                              }`}
                            >
                              {formatTimer(player.time < 9999 ? player.time : player.elapsedTime || 0)}
                            </span>
                            <span
                              className={`font-sans text-[9px] ${
                                isPodium1
                                  ? darkMode
                                    ? "text-[#fecdd3]/80"
                                    : "text-[#9D174D]/80"
                                  : isPodium2
                                  ? darkMode
                                    ? "text-[#e9d5ff]/80"
                                    : "text-[#6B21A8]/80"
                                  : isPodium3
                                  ? darkMode
                                    ? "text-[#fef08a]/80"
                                    : "text-[#854D0E]/80"
                                  : darkMode
                                  ? "text-zinc-400"
                                  : "text-stone-500"
                              }`}
                            >
                              {player.mistakes === 0
                                ? "0 errors"
                                : `${player.mistakes} ${player.mistakes === 1 ? "error" : "errors"}`}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* SCREEN 1: Action buttons — SAME GAME | NEW GAME — Evenly Sharing Footer */}
            <div className="flex gap-2.5 w-full pt-3 border-t border-stone-200/50 dark:border-zinc-800/50 shrink-0">
              {/* [ SAME GAME ] — Replay same board and parameters */}
              <button
                onClick={async () => {
                  playClickSound();
                  await onSameGameReplay();
                }}
                className={`flex-1 py-3 px-2 rounded-2xl flex items-center justify-center gap-1.5 text-xs font-mono font-black uppercase tracking-wider transition-all shadow-xs active:scale-95 border-none cursor-pointer ${
                  darkMode
                    ? "bg-[#022c22] hover:bg-[#022c22]/80 text-[#d1fae5]"
                    : "bg-[#D1FAE5] hover:bg-[#A7F3D0] text-[#065F46]"
                }`}
              >
                <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                <span>{t("sameGame")}</span>
              </button>

              {/* [ NEW GAME ] — Fresh board seed and parameters via full Create Room modal */}
              <button
                onClick={() => {
                  playClickSound();
                  onNewGameClick();
                }}
                className={`flex-1 py-3 px-2 rounded-2xl flex items-center justify-center gap-1.5 text-xs font-mono font-black uppercase tracking-wider transition-all shadow-xs active:scale-95 border-none cursor-pointer ${
                  darkMode
                    ? "bg-[#2e1065] hover:bg-[#2e1065]/80 text-[#e9d5ff]"
                    : "bg-[#F3E8FF] hover:bg-[#E9D5FF] text-[#6B21A8]"
                }`}
              >
                <Sparkles className="w-4 h-4 stroke-[2.5]" />
                <span>{t("newGame")}</span>
              </button>
            </div>
          </>
        ) : (
          <>
            {/* SCREEN 2: REMATCH LOBBY & INVITATIONS */}
            <div className="flex-1 min-h-0 flex flex-col gap-3 overflow-hidden">
              {/* HEADER BAR: CODE & LOCK TOGGLE + CLOSE BUTTON */}
              <div className="flex flex-col gap-2 shrink-0 select-none">
                <div className="flex items-center justify-between">
                  {/* Left: 6-digit room code */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-sans font-black tracking-wider text-stone-850 dark:text-stone-100 flex items-center gap-1.5">
                      <span className="text-stone-400 dark:text-stone-500 text-2xs uppercase font-bold">{t("codeLabel")}</span>
                      <span className="font-mono tracking-widest text-sm sm:text-base select-all">{activeRematchRoomCode}</span>
                    </span>
                    <button
                      onClick={() => {
                        playClickSound();
                        copyToClipboard(activeRematchRoomCode);
                        showCopiedToast(t("roomCodeCopied"));
                      }}
                      title={t("copyRoomCode")}
                      className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 hover:bg-stone-150 dark:hover:bg-zinc-800 transition-colors border-none cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {/* Lobby Quick Status Chip */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        playClickSound();
                        toggleIncognito();
                      }}
                      title={isIncognito ? "Ghost Mode active (tap to appear online)" : "Online (tap for Ghost Mode)"}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold tracking-wider uppercase border-none cursor-pointer transition-all active:scale-95 select-none ${
                        isIncognito
                          ? (darkMode
                              ? "bg-purple-950/70 text-purple-300 border border-purple-800/60 hover:bg-purple-900/60"
                              : "bg-purple-100 text-purple-800 border border-purple-200 hover:bg-purple-200/80")
                          : (darkMode
                              ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/60"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100")
                      }`}
                    >
                      {isIncognito ? (
                        <>
                          <span className="text-xs leading-none">🕶️</span>
                          <span>Ghost Mode</span>
                        </>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Online</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Right: Lock toggle + Close button */}
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
                          ? darkMode
                            ? "bg-[#4c0519] text-[#fecdd3] shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
                            : "bg-[#FFE4E6] text-[#9D174D] shadow-[0_8px_16px_rgba(157,23,77,0.06),_0_2px_4px_rgba(0,0,0,0.02)]"
                          : darkMode
                          ? "bg-[#022c22] text-[#d1fae5] shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
                          : "bg-[#D1FAE5] text-[#065F46] shadow-[0_8px_16px_rgba(6,95,70,0.06),_0_2px_4px_rgba(0,0,0,0.02)]"
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
                      onClick={() => {
                        playClickSound();
                        onClose();
                      }}
                      className={`p-1.5 rounded-full border-none cursor-pointer transition-all hover:scale-110 active:scale-95 ${
                        darkMode ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300" : "bg-stone-100 hover:bg-stone-200 text-stone-600"
                      }`}
                      title="Close"
                    >
                      <X className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>

                {/* Revealed inline PIN input if locked */}
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
                            const cleaned = e.target.value.replace(/[^0-9]/g, "").slice(0, 4);
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

              {/* PLAYER ROSTER & INLINE ACTIONS */}
              <div className="flex-1 min-h-0 overflow-y-auto pr-0.5 no-scrollbar flex flex-col gap-4 max-h-[190px] my-1.5 py-0.5">
                {multiplayerPlayers.length === 0 ? (
                  <span className="text-xs italic text-stone-500 py-4 text-center">
                    No past players yet. Share the link below to invite someone.
                  </span>
                ) : (
                  <>
                    {(() => {
                      const sortPlayers = (list: any[]) => {
                        return [...list].sort((a, b) => {
                          const statusA = getFriendStatus(a.id, a.status);
                          const statusB = getFriendStatus(b.id, b.status);
                          const isOnlineA = statusA === "online";
                          const isOnlineB = statusB === "online";
                          if (isOnlineA !== isOnlineB) {
                            return isOnlineA ? -1 : 1;
                          }
                          if (a.lastPlayedAt !== b.lastPlayedAt) return (b.lastPlayedAt || 0) - (a.lastPlayedAt || 0);
                          return a.name.localeCompare(b.name);
                        });
                      };

                      const friends = sortPlayers(multiplayerPlayers.filter((p) => p.isFriend));
                      const recentPlayers = sortPlayers(multiplayerPlayers.filter((p) => !p.isFriend));

                      const renderRow = (player: any, index: number) => {
                        const { isJoined, isPendingSent, isDeclined, isLeft, remainingSeconds } = getInviteCooldownState(
                          player.id
                        );
                        const effectiveStatus = getFriendStatus(player.id, player.status);
                        const isAnimated = index < 5;

                        const cardContent = (
                          <div
                            className={`flex items-center justify-between p-2.5 px-3 rounded-xl transition-all duration-200 shrink-0 w-full ${
                              darkMode
                                ? "bg-zinc-900/60 border border-zinc-800/60 text-stone-200"
                                : "bg-white border border-stone-200/60 text-stone-850 shadow-xs"
                            }`}
                          >
                            {/* Left: Status Dot (omitted if offline/incognito), Add Friend Icon, Username */}
                            <div className="flex items-center gap-2 min-w-0">
                              {effectiveStatus === "online" && (
                                <span className="w-2 h-2 rounded-full shrink-0 bg-emerald-400 animate-pulse-gentle" />
                              )}
                              {player.isFriend ? (
                                <span
                                  className={`text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md shrink-0 ${
                                    darkMode ? "bg-[#022c22] text-[#d1fae5]" : "bg-[#D1FAE5] text-[#065F46]"
                                  }`}
                                >
                                  ✓
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleToggleFriend(player.id, player.name)}
                                  className={`w-7 h-7 rounded-lg border-none cursor-pointer shrink-0 transition-all active:scale-95 flex items-center justify-center ${
                                    darkMode
                                      ? "bg-zinc-800 hover:bg-zinc-750 text-stone-300 hover:text-white"
                                      : "bg-stone-150 hover:bg-stone-200 text-stone-700 hover:text-stone-900"
                                  }`}
                                  title="Add Friend"
                                >
                                  <Plus className="w-5 h-5 stroke-[2.5]" />
                                </button>
                              )}
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-xs font-sans truncate">{player.name}</span>
                                <span className="text-[9.5px] text-stone-400 capitalize">
                                  {formatActiveStatus(effectiveStatus, getFriendLastActive(player.id, player.lastActive || player.lastPlayedAt))}
                                </span>
                              </div>
                            </div>

                            {/* Right: Dedicated match invite button */}
                            <div className="shrink-0 ml-2">
                              {isJoined ? (
                                <span
                                  className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl flex items-center gap-1 ${
                                    darkMode ? "bg-[#022c22] text-[#d1fae5]" : "bg-[#D1FAE5] text-[#065F46]"
                                  }`}
                                >
                                  <Check className="w-3 h-3 stroke-[3]" />
                                  JOINED
                                </span>
                              ) : isLeft ? (
                                <button
                                  disabled
                                  className={`text-[9.5px] font-mono font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-xl border-none opacity-90 cursor-not-allowed ${
                                    darkMode ? "bg-zinc-800 text-stone-400" : "bg-stone-200 text-stone-600"
                                  }`}
                                >
                                  LEFT ({remainingSeconds}s)
                                </button>
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
                                  className={`text-[9.5px] font-mono font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl border-none cursor-pointer transition-all active:scale-95 shadow-xs leading-normal overflow-visible ${
                                    darkMode
                                      ? "bg-[#4c0519] hover:bg-[#831843] text-[#fecdd3]"
                                      : "bg-[#FFE4E6] hover:bg-[#FBCFE8] text-[#9D174D]"
                                  }`}
                                >
                                  <span className="leading-normal overflow-visible">{t("inviteBtn")}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );

                        if (isAnimated) {
                          return (
                            <div
                              key={player.id}
                              className="w-full shrink-0 animate-cascade-drop"
                              style={{ animationDelay: `${index * 45}ms` }}
                            >
                              {cardContent}
                            </div>
                          );
                        }

                        return (
                          <div key={player.id} className="w-full shrink-0">
                            {cardContent}
                          </div>
                        );
                      };

                      return (
                        <>
                          {friends.length > 0 && (
                            <div className="flex flex-col gap-2">
                              <span
                                className={`font-sans font-bold text-[10px] uppercase tracking-wider pl-1 leading-normal overflow-visible ${
                                  darkMode ? "text-stone-500" : "text-stone-400"
                                }`}
                              >
                                <span className="leading-normal overflow-visible">
                                  {t("friendsTab")} ({friends.length})
                                </span>
                              </span>
                              {friends.map((player, idx) => renderRow(player, idx))}
                            </div>
                          )}
                          {recentPlayers.length > 0 && (
                            <div className="flex flex-col gap-2">
                              <span
                                className={`font-sans font-bold text-[10px] uppercase tracking-wider pl-1 mt-2 leading-normal overflow-visible ${
                                  darkMode ? "text-stone-500" : "text-stone-400"
                                }`}
                              >
                                <span className="leading-normal overflow-visible">
                                  {t("recentTab")} ({recentPlayers.length})
                                </span>
                              </span>
                              {recentPlayers.map((player, idx) => renderRow(player, idx))}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </>
                )}
              </div>

              {/* ACTION ROW: RE-INVITE ALL & SHARE LINK */}
              <div className="grid grid-cols-2 gap-2.5 w-full shrink-0 mt-2 mb-1">
                {/* Left: RE-INVITE ALL / STOP */}
                <button
                  onClick={() => handleReinviteAll()}
                  disabled={!isInvitingAll && multiplayerPlayers.length === 0}
                  className={`w-full py-2.5 px-2 text-xs font-mono font-black uppercase tracking-wider rounded-xl border-none transition-all duration-150 cursor-pointer text-center flex items-center justify-center gap-1.5 active:scale-95 shadow-xs leading-normal overflow-visible ${
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
                      <span className="leading-normal overflow-visible">{t("stopAction")}</span>
                    </>
                  ) : (
                    <>
                      <Users className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                      <span className="leading-normal overflow-visible">{t("reinviteAll")}</span>
                    </>
                  )}
                </button>

                {/* Right: SHARE LINK */}
                <button
                  onClick={async () => {
                    playClickSound();
                    await shareChallengeLink(activeRematchRoomCode, "Play Sudoku with me! Let's see who finishes first:");
                  }}
                  style={{ animationDelay: "0.4s" }}
                  className={`animate-shimmer-sweep w-full py-2.5 px-2 text-xs font-mono font-black uppercase tracking-wider rounded-xl border-none transition-all duration-150 cursor-pointer text-center flex items-center justify-center gap-1.5 active:scale-95 shadow-xs leading-normal overflow-visible ${
                    darkMode
                      ? "bg-[#0c4a6e]/50 hover:bg-[#0c4a6e]/80 text-[#bae6fd]"
                      : "bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#0369A1]"
                  }`}
                >
                  <Share2 className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                  <span className="leading-normal overflow-visible">{t("shareLink")}</span>
                </button>
              </div>

              {/* BOTTOM ROW: Back (Left) | START GAME (Right / Primary) */}
              <div className="flex items-center gap-3 w-full pt-2 border-t border-stone-200/50 dark:border-zinc-800/50 shrink-0">
                {/* Left: Back to Step 1 */}
                <button
                  onClick={() => {
                    playClickSound();
                    setEndGameStep(1);
                  }}
                  className={`p-3 rounded-2xl flex items-center justify-center transition-all shadow-xs active:scale-95 border-none cursor-pointer shrink-0 ${
                    darkMode ? "bg-zinc-850 hover:bg-zinc-800 text-stone-300" : "bg-stone-100 hover:bg-stone-200 text-stone-700"
                  }`}
                  title="Back to Leaderboard"
                >
                  <ArrowLeft className="w-5 h-5" strokeWidth={2} />
                </button>

                {/* Right / Primary: START GAME */}
                <button
                  onClick={() => {
                    playClickSound();
                    onStartRematchGame();
                  }}
                  className={`flex-1 py-3 px-6 rounded-2xl flex items-center justify-center gap-2 font-mono font-black text-sm tracking-wider uppercase transition-all shadow-md active:scale-98 border-none cursor-pointer text-white ${
                    darkMode
                      ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/40"
                      : "bg-emerald-600 hover:bg-emerald-550 shadow-emerald-600/30"
                  }`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{t("startGameAction")}</span>
                </button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};
