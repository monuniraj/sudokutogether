import React, { useMemo, useRef, useEffect } from "react";
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
import { usePodiumAudio } from "../../hooks/usePodiumAudio";

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
  isMultiplayer?: boolean;
  completedGames?: any[];

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
  onStartRematchGame,
  isMultiplayer,
  completedGames
}) => {
  const { t } = useTranslation();
  const playerIds = (multiplayerPlayers || []).map((p: any) => p.id);
  const { isIncognito, toggleIncognito, getFriendStatus, getFriendLastActive } = useFriendPresence(userProfile?.id, playerIds);

  // 1. PERMANENT STANDINGS LOCK: Cache and permanently freeze standings snapshot
  const cachedStandingsRef = useRef<any[] | null>(null);
  const activeMatchKeyRef = useRef<string | null>(null);
  // 4. ELIMINATE "00:00" FALLBACK: Freeze completed duration at instant of match resolution
  const frozenDurationRef = useRef<number | null>(null);

  const currentMatchKey = String(challengeSeed || rematchGameId || boardState?.seed || "");
  if (activeMatchKeyRef.current !== currentMatchKey && currentMatchKey !== "") {
    activeMatchKeyRef.current = currentMatchKey;
    cachedStandingsRef.current = null;
    frozenDurationRef.current = null;
  }

  const results = useMemo(() => {
    // 6. ALIGN MODAL STANDINGS WITH HISTORY / STATS: Resolve recorded match snapshot
    const allCompletedGames = completedGames || (() => {
      try {
        const stored = localStorage.getItem("sudoku_completed_games");
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    })();

    const currentSeedNum = challengeSeed ?? (boardState?.seed ? Number(boardState.seed) : undefined);
    const matchedGame = (allCompletedGames || []).find((g: any) => {
      if (currentSeedNum !== undefined && (g.seed === currentSeedNum || Number(g.seed) === currentSeedNum)) return true;
      if (rematchGameId && (g.id === rematchGameId || String(g.seed).slice(-6) === rematchGameId)) return true;
      if (boardState?.seed && (g.seed === boardState.seed || Number(g.seed) === Number(boardState.seed))) return true;
      return false;
    });

    const didCurrentPlayerFail =
      mistakeLimitEnabled &&
      (boardState?.maxMistakesLimit === 0
        ? (boardState?.currentMistakesCount ?? 0) > 0
        : (boardState?.currentMistakesCount ?? 0) >= (boardState?.maxMistakesLimit ?? 3));

    // 4. ELIMINATE "00:00" FALLBACK: Freeze actual completed duration; disconnect from volatile live sessionSeconds
    if (sessionSeconds > 0 && frozenDurationRef.current === null) {
      frozenDurationRef.current = sessionSeconds;
    }

    let resolvedLocalTime = didCurrentPlayerFail ? 9999 : (frozenDurationRef.current ?? sessionSeconds);

    // If 0 is encountered unexpectedly on a win, resolve time from recorded match snapshot in completedGames, syncedLeaderboard, or lastCompletedSession
    if (!didCurrentPlayerFail && (resolvedLocalTime === 0 || !resolvedLocalTime)) {
      if (matchedGame && Number(matchedGame.timeSec) > 0) {
        resolvedLocalTime = Number(matchedGame.timeSec);
      } else {
        const syncedMe = (syncedLeaderboard || []).find((r: any) => r.userId === userProfile?.id);
        if (syncedMe && Number(syncedMe.timeSec) > 0) {
          resolvedLocalTime = Number(syncedMe.timeSec);
        } else {
          try {
            const lastSession = JSON.parse(localStorage.getItem("sudoku_lastCompletedSession") || "{}");
            if (lastSession && Number(lastSession.seconds) > 0) {
              resolvedLocalTime = Number(lastSession.seconds);
            }
          } catch {}
        }
      }
      if (resolvedLocalTime === 0 || !resolvedLocalTime) {
        resolvedLocalTime = 1; // absolute minimum guard against "00:00" on a win
      }
      frozenDurationRef.current = resolvedLocalTime;
    }

    // 2. RESTORE SMART BEST-SCORE REPLAY SYNC for local user
    let localIsWon = !didCurrentPlayerFail;
    let localMistakes = boardState?.currentMistakesCount || 0;

    if (matchedGame) {
      const priorWasWin = Boolean(matchedGame.isWon);
      const priorTimeSec = Number(matchedGame.timeSec) > 0 ? Number(matchedGame.timeSec) : Infinity;
      const priorMistakes = Number(matchedGame.mistakes || 0);

      if (priorWasWin && didCurrentPlayerFail) {
        // If prior record was a WIN and new run is FAILED/ABANDONED -> NEVER overwrite the WIN
        localIsWon = true;
        resolvedLocalTime = priorTimeSec;
        localMistakes = priorMistakes;
      } else if (priorWasWin && !didCurrentPlayerFail) {
        // If both runs are WINS -> Overwrite ONLY if newTimeSec < oldTimeSec OR (newTimeSec === oldTimeSec AND newMistakes < oldMistakes)
        const isBetter = resolvedLocalTime < priorTimeSec || (resolvedLocalTime === priorTimeSec && localMistakes < priorMistakes);
        if (!isBetter) {
          resolvedLocalTime = priorTimeSec;
          localMistakes = priorMistakes;
        }
      }
    }

    const resultsMap = new Map<string, any>();
    const currentLocalName = (userProfile?.name && userProfile.name.trim()) || getActiveDisplayName();

    const localMe = {
      id: userProfile?.id || "me",
      name: currentLocalName,
      time: !localIsWon ? 9999 : resolvedLocalTime,
      elapsedTime: resolvedLocalTime,
      mistakes: localMistakes,
      failed: !localIsWon,
      isAbandoned: false,
      isMe: true,
      isReal: true,
      isPending: false,
      timestamp: Date.now()
    };
    resultsMap.set(localMe.id, localMe);

    // Helper to merge participant records (matching MatchResultsModal in History)
    const mergeParticipant = (item: any) => {
      if (!item) return;
      const pId = item.userId || item.id;
      if (!pId) return;

      const isCurrentUser = pId === userProfile?.id || pId === "me" || item.isMe === true;
      const pName = isCurrentUser
        ? (item.playerName || item.name || currentLocalName)
        : (item.playerName || item.name || "Opponent");

      // 5. ABANDONED / FORFEIT RULES
      const isAbandoned =
        item.status === "abandoned" ||
        item.status === "left" ||
        item.status === "forfeited" ||
        item.status === "quit" ||
        Boolean(item.abandoned) ||
        Boolean(item.forfeited) ||
        Boolean(item.isAbandoned);

      const isWon = !isAbandoned && (
        item.isWon !== undefined
          ? Boolean(item.isWon)
          : item.failed !== undefined
          ? !item.failed
          : !item.isPending
      );

      const isPending = !isCurrentUser && !isAbandoned && (item.isPending ?? false);
      const rawTime = Number(item.timeSec ?? item.time ?? item.elapsedTime ?? 0);
      const pTime = isAbandoned ? 99999 : !isWon ? 9999 : rawTime;
      const elapsedTime = rawTime > 0 && rawTime < 9999 ? rawTime : (Number(item.elapsedTime) || 0);

      // Smart Replay preservation: if existing entry is already a superior win, do not downgrade it
      const existing = resultsMap.get(pId);
      if (existing) {
        const existingWon = !existing.failed && !existing.isAbandoned && !existing.isPending;
        if (existingWon && (isAbandoned || !isWon)) {
          return;
        }
        if (existingWon && isWon && !isAbandoned) {
          if (existing.time < pTime || (existing.time === pTime && existing.mistakes <= (Number(item.mistakes) || 0))) {
            return;
          }
        }
      }

      resultsMap.set(pId, {
        id: pId,
        name: pName,
        time: pTime,
        elapsedTime: elapsedTime,
        mistakes: item.mistakes !== undefined ? Number(item.mistakes) : 0,
        hints: item.hints !== undefined ? Number(item.hints) : ((item as any).hintsUsed ?? 0),
        failed: (!isWon && !isPending) || isAbandoned,
        isAbandoned: isAbandoned,
        status: item.status,
        isMe: isCurrentUser,
        isReal: true,
        isPending: isPending,
        timestamp: item.timestamp?.toMillis ? item.timestamp.toMillis() : (item.timestamp ? new Date(item.timestamp).getTime() : (item.date ? new Date(item.date).getTime() : 0))
      });
    };

    // 6. Merge stored participants from matched history / completedGames
    const storedParticipants = matchedGame?.participants;
    if (Array.isArray(storedParticipants)) {
      storedParticipants.forEach(mergeParticipant);
    }

    // Overlay live synced results from Firestore
    if (Array.isArray(syncedLeaderboard)) {
      syncedLeaderboard.forEach(mergeParticipant);
    }

    // Merge previously cached standings snapshot (Rule 1 lock: freeze against drops)
    if (Array.isArray(cachedStandingsRef.current)) {
      cachedStandingsRef.current.forEach(mergeParticipant);
    }

    // 3. STRICT RANKING & TIE-BREAKER LOGIC
    const list = Array.from(resultsMap.values());
    list.sort((a, b) => {
      // 1. Status: Completed/Won > Pending > Failed/Abandoned/Left
      const getStatusPriority = (p: any) => {
        if (p.isAbandoned || p.failed) return 2;
        if (p.isPending) return 1;
        return 0; // Completed / Won
      };

      const priorityA = getStatusPriority(a);
      const priorityB = getStatusPriority(b);
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // If both are Completed/Won:
      if (priorityA === 0) {
        // 2. Completion Time: Ascending (lower time = higher rank)
        if (a.time !== b.time) {
          return a.time - b.time;
        }
        // 3. Mistakes: Fewer errors win ties
        if (a.mistakes !== b.mistakes) {
          return a.mistakes - b.mistakes;
        }
        // 4. Submission Timestamp: Earliest completion breaks deadlocks
        const timeA = Number(a.timestamp || 0);
        const timeB = Number(b.timestamp || 0);
        if (timeA && timeB && timeA !== timeB) {
          return timeA - timeB;
        }
        return (a.elapsedTime || 0) - (b.elapsedTime || 0);
      }

      // If both are Pending:
      if (priorityA === 1) {
        if (a.mistakes !== b.mistakes) {
          return a.mistakes - b.mistakes;
        }
        return (a.elapsedTime || 0) - (b.elapsedTime || 0);
      }

      // If both are Failed / Abandoned:
      if (a.isAbandoned !== b.isAbandoned) {
        return a.isAbandoned ? 1 : -1;
      }
      if (a.mistakes !== b.mistakes) {
        return a.mistakes - b.mistakes;
      }
      return (b.elapsedTime || 0) - (a.elapsedTime || 0);
    });

    // 1. PERMANENT STANDINGS LOCK:
    // Cache and permanently freeze standings snapshot whenever results.length >= 2 is present.
    // Do NOT let the list clear or revert when live room listeners drop or opponents leave.
    if (list.length >= 2) {
      cachedStandingsRef.current = list;
      return list;
    } else if (cachedStandingsRef.current && cachedStandingsRef.current.length >= 2) {
      return cachedStandingsRef.current;
    }

    return list;
  }, [
    boardState,
    checkIsDisplayNameConfigured,
    getActiveDisplayName,
    mistakeLimitEnabled,
    sessionSeconds,
    syncedLeaderboard,
    userProfile,
    completedGames,
    challengeSeed,
    rematchGameId
  ]);

  const isMultiplayerCompetitive = isMultiplayer ?? (challengeSeed !== undefined || results.length >= 2);
  const { playPodiumSequence } = usePodiumAudio();
  const podiumAudioTriggeredRef = useRef<boolean>(false);
  const localLowerRankRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen || endGameStep !== 1) {
      podiumAudioTriggeredRef.current = false;
      return;
    }

    if (!isMultiplayerCompetitive || podiumAudioTriggeredRef.current) return;

    podiumAudioTriggeredRef.current = true;
    const isWinner = Boolean(results[0]?.isMe && !results[0]?.failed && !results[0]?.isAbandoned);
    const isPB = Boolean(isNewRecordAchieved && results.find((p) => p.isMe && !p.failed));
    playPodiumSequence(isWinner, isPB);
  }, [isOpen, endGameStep, isMultiplayerCompetitive, results, isNewRecordAchieved, playPodiumSequence]);

  useEffect(() => {
    if (isOpen && endGameStep === 1 && localLowerRankRef.current) {
      const timer = setTimeout(() => {
        localLowerRankRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 750);
      return () => clearTimeout(timer);
    }
  }, [isOpen, endGameStep]);

  const winnerTime = useMemo(() => {
    if (results.length > 0 && !results[0].failed && !results[0].isAbandoned && !results[0].isPending && results[0].time < 9999) {
      return results[0].time;
    }
    return null;
  }, [results]);

  const formatGapDelta = (playerTime: number) => {
    if (winnerTime === null || !playerTime || playerTime <= winnerTime || playerTime >= 9999) return null;
    const deltaSec = Math.round(playerTime - winnerTime);
    if (deltaSec <= 0 || deltaSec > 7200) return null;
    const mins = Math.floor(deltaSec / 60);
    const secs = deltaSec % 60;
    return `+${mins}:${String(secs).padStart(2, "0")}s`;
  };

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
            <div className="max-h-[48vh] sm:max-h-[52vh] overflow-y-auto overscroll-contain px-1 py-1 custom-scrollbar flex flex-col gap-2.5">
              {results.map((player, idx) => {
                const isPending = !!player.isPending;
                const isPodium1 = isMultiplayerCompetitive && idx === 0 && !player.failed && !player.isAbandoned && !isPending;
                const isPodium2 = isMultiplayerCompetitive && idx === 1 && !player.failed && !player.isAbandoned && !isPending;
                const isPodium3 = isMultiplayerCompetitive && idx === 2 && !player.failed && !player.isAbandoned && !isPending;
                const isLowerRank = isMultiplayerCompetitive && idx >= 3;
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
                const gapDelta = (isPodium2 || isPodium3) && !player.failed && !player.isAbandoned && !isPending
                  ? formatGapDelta(player.time)
                  : null;

                // Hierarchy Styling based on BORDERLESS Design Language
                let containerClass = "flex items-center justify-between p-3.5 rounded-2xl gap-3 transition-all border-none border-0 ";
                let containerStyle: React.CSSProperties = { transformOrigin: "center" };

                if (isMultiplayerCompetitive) {
                  if (isPodium1) {
                    // RANK 1 — Soft warm honey champagne with subtle diffuse glow
                    containerClass += `animate-podium-rank-1 ${isMeNewPB ? "animate-radiant-sheen" : ""} ${
                      darkMode ? "bg-amber-400/20 text-amber-200 shadow-lg shadow-amber-500/10" : "bg-amber-100/70 text-amber-900"
                    }`;
                    containerStyle = {
                      boxShadow: darkMode ? "0 10px 25px -5px rgba(245, 158, 11, 0.1)" : "0 12px 32px -8px rgba(245, 195, 110, 0.15)",
                      transform: "scale(1.03)",
                      transformOrigin: "center"
                    };
                  } else if (isPodium2) {
                    // RANK 2 — Cool ice-platinum / crisp mist
                    containerClass += `animate-podium-rank-2 shadow-none ${
                      darkMode ? "bg-sky-400/15 text-sky-200" : "bg-sky-100/60 text-sky-900"
                    }`;
                    containerStyle = {
                      boxShadow: "none",
                      transform: "scale(1.0)",
                      transformOrigin: "center"
                    };
                  } else if (isPodium3) {
                    // RANK 3 — Soft pastel sandstone / warm muted terracotta
                    containerClass += `animate-podium-rank-3 shadow-none ${
                      darkMode ? "bg-orange-400/15 text-orange-200" : "bg-orange-100/60 text-orange-900"
                    }`;
                    containerStyle = {
                      boxShadow: "none",
                      transform: "scale(0.96)",
                      transformOrigin: "center"
                    };
                  } else {
                    // Lower ranks (4+)
                    containerClass += `animate-podium-lower shadow-none ${
                      player.isMe
                        ? darkMode
                          ? "bg-white/[0.08] text-stone-100"
                          : "bg-black/[0.06] text-stone-900"
                        : darkMode
                        ? "bg-white/[0.04] text-stone-400"
                        : "bg-black/[0.03] text-stone-600"
                    }`;
                    containerStyle = {
                      animationDelay: `${700 + (idx - 3) * 60}ms`,
                      transform: "scale(1.0)",
                      transformOrigin: "center"
                    };
                  }
                } else {
                  // Solo fallback
                  containerClass += `animate-podium-reveal ${isMeNewPB ? "animate-radiant-sheen" : ""} ${
                    idx === 0
                      ? darkMode
                        ? "bg-[#4c0519]/70 text-[#fecdd3] shadow-[0_2px_12px_rgba(0,0,0,0.25)]"
                        : "bg-[#FFE4E6] text-[#9D174D] shadow-[0_2px_12px_rgba(244,63,94,0.08)]"
                      : darkMode
                      ? "bg-zinc-800/40 text-zinc-400"
                      : "bg-stone-100/80 text-stone-500"
                  }`;
                  containerStyle = {
                    animationDelay: `${idx * 80}ms`,
                    transform: isMeNewPB ? "scale(1.02)" : undefined
                  };
                }

                return (
                  <div
                    key={player.id}
                    ref={isLowerRank && player.isMe ? localLowerRankRef : undefined}
                    style={containerStyle}
                    className={containerClass}
                  >
                    {/* Left: Rank Medal/Trophy icon + Player Name + subtle badges */}
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 relative z-10">
                      <span
                        className={`font-mono text-sm sm:text-base font-black w-7 sm:w-8 text-center flex items-center justify-center shrink-0 ${
                          player.isAbandoned
                            ? "text-rose-500"
                            : isPending
                            ? "text-amber-500 animate-pulse"
                            : isPodium1
                            ? darkMode
                              ? "text-amber-300"
                              : "text-amber-600"
                            : isPodium2
                            ? darkMode
                              ? "text-sky-300"
                              : "text-sky-600"
                            : isPodium3
                            ? darkMode
                              ? "text-orange-300"
                              : "text-orange-600"
                            : darkMode
                            ? "text-zinc-500 text-xs font-bold"
                            : "text-stone-400 text-xs font-bold"
                        }`}
                      >
                        {player.isAbandoned ? (
                          <XCircle className="w-4 h-4 text-rose-500 stroke-[2.5]" />
                        ) : isPending ? (
                          <Clock className="w-4 h-4 text-amber-500 animate-spin" />
                        ) : isPodium1 ? (
                          <Trophy
                            className={`w-5 h-5 stroke-[2.5] shrink-0 ${
                              darkMode ? "text-amber-300 fill-amber-400/20" : "text-amber-600 fill-amber-400/30"
                            }`}
                          />
                        ) : isPodium2 ? (
                          <Award className={`w-4.5 h-4.5 stroke-[2.5] shrink-0 ${darkMode ? "text-sky-300" : "text-sky-600"}`} />
                        ) : isPodium3 ? (
                          <Award className={`w-4.5 h-4.5 stroke-[2.5] shrink-0 ${darkMode ? "text-orange-300" : "text-orange-600"}`} />
                        ) : (
                          positionStr
                        )}
                      </span>

                      <div className="flex items-center gap-2 min-w-0 flex-wrap">
                        <span
                          className={`font-sans font-bold text-sm leading-normal overflow-visible truncate ${
                            isPodium1
                              ? darkMode
                                ? "text-amber-200"
                                : "text-amber-950 font-black"
                              : isPodium2
                              ? darkMode
                                ? "text-sky-200 font-bold"
                                : "text-sky-950 font-bold"
                              : isPodium3
                              ? darkMode
                                ? "text-orange-200 font-bold"
                                : "text-orange-950 font-bold"
                              : player.isMe
                              ? darkMode
                                ? "text-stone-100 font-bold"
                                : "text-stone-900 font-bold"
                              : darkMode
                              ? "text-zinc-400 font-medium"
                              : "text-stone-600 font-medium"
                          }`}
                        >
                          {player.name}
                        </span>

                        {/* Top 3 'YOU' badge */}
                        {player.isMe && !isLowerRank && (
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-sans font-bold uppercase tracking-wider shrink-0 leading-normal overflow-visible ${
                              isPodium1
                                ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                                : "bg-indigo-500/15 text-indigo-600 dark:text-indigo-300"
                            }`}
                          >
                            {t("youBadge")}
                          </span>
                        )}

                        {/* Lower Rank 4+ 'YOU • #X' badge */}
                        {player.isMe && isLowerRank && (
                          <span className="text-[9px] bg-stone-500/20 text-stone-700 dark:text-stone-300 px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider shrink-0 leading-normal">
                            YOU • #{idx + 1}
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

                    {/* Right: Clean Time + Gap Delta Badge + error count */}
                    <div className="flex flex-col items-end justify-center shrink-0 whitespace-nowrap text-right relative z-10">
                      {player.isAbandoned ? (
                        <div className="flex flex-col items-end">
                          <span className="font-mono text-xs font-semibold text-rose-500">
                            {player.status === "left" ? "Left" : "Abandoned"}
                          </span>
                          {player.mistakes > 0 && (
                            <span className="font-mono text-[9px] text-stone-500 dark:text-zinc-400">
                              {player.mistakes} errors
                            </span>
                          )}
                        </div>
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
                          <div className="flex items-center gap-1.5">
                            {gapDelta && (
                              <span
                                className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md border-none tracking-tight leading-none ${
                                  isPodium2
                                    ? darkMode
                                      ? "bg-sky-500/20 text-sky-200"
                                      : "bg-sky-500/15 text-sky-800"
                                    : darkMode
                                    ? "bg-orange-500/20 text-orange-200"
                                    : "bg-orange-500/15 text-orange-800"
                                }`}
                              >
                                {gapDelta}
                              </span>
                            )}
                            <span
                              className={`font-mono font-bold text-sm sm:text-base ${
                                isPodium1
                                  ? darkMode
                                    ? "text-amber-200"
                                    : "text-amber-950 font-black"
                                  : isPodium2
                                  ? darkMode
                                    ? "text-sky-200"
                                    : "text-sky-900"
                                  : isPodium3
                                  ? darkMode
                                    ? "text-orange-200"
                                    : "text-orange-900"
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
                          </div>
                          <span
                            className={`font-sans text-[9px] ${
                              isPodium1
                                ? darkMode
                                  ? "text-amber-300/70"
                                  : "text-amber-900/70"
                                : isPodium2
                                ? darkMode
                                  ? "text-sky-300/70"
                                  : "text-sky-800/70"
                                : isPodium3
                                ? darkMode
                                  ? "text-orange-300/70"
                                  : "text-orange-800/70"
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
              })}
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
                  cachedStandingsRef.current = null;
                  frozenDurationRef.current = null;
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
                  </div>

                  {/* Right: Lock toggle + Close button securely pinned */}
                  <div className="flex items-center gap-2 pr-1">
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
                      className={`p-1.5 rounded-full border-none cursor-pointer transition-all hover:scale-110 active:scale-95 shrink-0 ${
                        darkMode ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300" : "bg-stone-100 hover:bg-stone-200 text-stone-600"
                      }`}
                      title="Close"
                    >
                      <X className="w-4 h-4 stroke-[2.5]" />
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
