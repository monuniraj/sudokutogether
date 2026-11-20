import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  Clock,
  Copy,
  Crown,
  Grid3X3,
  Home,
  Medal,
  RotateCcw,
  Star,
  TrendingUp,
  Trophy,
  X,
} from "lucide-react";
import { ConfettiBurst } from "../../components/common/ConfettiBurst";

export interface BlockSyncMiniBoardCell {
  color: string;
}

export interface BlockSyncSoloRunEntry {
  id: string;
  score: number;
  achievedAt: number;
  isCurrent?: boolean;
  label?: string;
}

export interface BlockSyncRoomStandingEntry {
  id: string;
  name: string;
  score: number;
  isSelf?: boolean;
  statusLabel?: string;
}

export interface BlockSyncEndGameModalProps {
  darkMode: boolean;
  finalScore: number;
  previousBestScore: number;
  bestScore: number;
  initialSessionBest: number;
  isNewBest: boolean;
  percentileData: {
    higherThanPercent: number;
    topPercent: number;
  };
  finalBoardState: (BlockSyncMiniBoardCell | string | null)[][];
  tileClasses: Record<string, string>;
  soloRuns?: BlockSyncSoloRunEntry[];
  roomMode?: boolean;
  roomCode?: string;
  endReason?: "out_of_moves" | "time_up";
  standings?: BlockSyncRoomStandingEntry[];
  onPlayAgain?: () => void;
  onBackHome?: () => void;
  reviewMode?: boolean;
  playedAtLabel?: string;
  onCloseReview?: () => void;
  onScoreTick?: (tickIndex: number) => void;
  onNewBestReveal?: () => void;
  onPodiumReveal?: (rank: number) => void;
  onModalSettledChange?: (settled: boolean) => void;
  onButtonTapCue?: (action: "playAgain" | "backHome") => void;
  registerPlayAgainTrigger?: (triggerFn: (() => void) | null) => void;
}

const EXIT_DURATION_MS = 180;
const REVIEW_EXIT_DURATION_MS = 160;
const COUNT_UP_DURATION_MS = 420;

function checkPrefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function formatRunTimestamp(achievedAt: number): string {
  if (!Number.isFinite(achievedAt) || achievedAt <= 0) {
    return "Prior record";
  }
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
    }).format(new Date(achievedAt));
  } catch {
    return "Saved run";
  }
}

function hasValid9x9Snapshot(
  grid: (BlockSyncMiniBoardCell | string | null)[][]
): boolean {
  return (
    Array.isArray(grid) &&
    grid.length === 9 &&
    grid.every((row) => Array.isArray(row) && row.length === 9)
  );
}

export const BlockSyncEndGameModal: React.FC<BlockSyncEndGameModalProps> = ({
  darkMode,
  finalScore,
  previousBestScore,
  bestScore,
  isNewBest,
  percentileData,
  finalBoardState,
  tileClasses,
  soloRuns = [],
  roomMode = false,
  roomCode,
  endReason = "out_of_moves",
  standings = [],
  onPlayAgain,
  onBackHome,
  reviewMode = false,
  playedAtLabel,
  onCloseReview,
  onScoreTick,
  onNewBestReveal,
  onPodiumReveal,
  onModalSettledChange,
  onButtonTapCue,
  registerPlayAgainTrigger,
}) => {
  const reducedMotion = useMemo(() => checkPrefersReducedMotion(), []);
  const instantReveal = reducedMotion || reviewMode;

  const hasMultiplayerStandings = roomMode && standings.length > 0;
  const selfStandingIdx = hasMultiplayerStandings
    ? standings.findIndex((entry) => entry.isSelf)
    : -1;
  const selfRank = selfStandingIdx >= 0 ? selfStandingIdx + 1 : null;
  const allPlayersFinished =
    hasMultiplayerStandings && standings.every((entry) => !entry.statusLabel);
  const isFirstPlaceFinish = Boolean(roomMode && selfRank === 1);
  const isPodiumTwoOrThreeFinish = Boolean(
    roomMode &&
      ((selfRank === 2 && standings.length >= 2) ||
        (selfRank === 3 && standings.length >= 3))
  );

  const [backdropVisible, setBackdropVisible] = useState<boolean>(reducedMotion);
  const [cardVisible, setCardVisible] = useState<boolean>(reducedMotion);
  const [snapshotVisible, setSnapshotVisible] = useState<boolean>(instantReveal);
  const [displayedScore, setDisplayedScore] = useState<number>(
    instantReveal ? finalScore : 0
  );
  const [newBestPopped, setNewBestPopped] = useState<boolean>(
    instantReveal && isNewBest
  );
  const [confettiMode, setConfettiMode] = useState<
    "all" | "top-only" | "cannon-only" | "top-two-waves" | null
  >(null);
  const [copiedRoomCode, setCopiedRoomCode] = useState<boolean>(false);
  const [detailsVisible, setDetailsVisible] = useState<boolean>(instantReveal);
  const [isExiting, setIsExiting] = useState<boolean>(false);

  const timersRef = useRef<Set<number>>(new Set());
  const rafRef = useRef<number | null>(null);
  const exitLockRef = useRef<boolean>(false);
  const celebrationFiredRef = useRef<boolean>(false);

  const onScoreTickRef = useRef(onScoreTick);
  const onNewBestRevealRef = useRef(onNewBestReveal);
  const onPodiumRevealRef = useRef(onPodiumReveal);
  const onModalSettledChangeRef = useRef(onModalSettledChange);
  const onButtonTapCueRef = useRef(onButtonTapCue);
  const onPlayAgainRef = useRef(onPlayAgain);
  const onBackHomeRef = useRef(onBackHome);
  const onCloseReviewRef = useRef(onCloseReview);

  const celebrationStateRef = useRef({
    isNewBest,
    isFirstPlaceFinish,
    isPodiumTwoOrThreeFinish,
    selfRank,
  });
  celebrationStateRef.current = {
    isNewBest,
    isFirstPlaceFinish,
    isPodiumTwoOrThreeFinish,
    selfRank,
  };

  onScoreTickRef.current = onScoreTick;
  onNewBestRevealRef.current = onNewBestReveal;
  onPodiumRevealRef.current = onPodiumReveal;
  onModalSettledChangeRef.current = onModalSettledChange;
  onButtonTapCueRef.current = onButtonTapCue;
  onPlayAgainRef.current = onPlayAgain;
  onBackHomeRef.current = onBackHome;
  onCloseReviewRef.current = onCloseReview;

  const cancelChoreographyTimers = useCallback(() => {
    timersRef.current.forEach((timerId) => {
      window.clearTimeout(timerId);
    });
    timersRef.current.clear();
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const scheduleTimer = useCallback((fn: () => void, delayMs: number): number => {
    const id = window.setTimeout(() => {
      timersRef.current.delete(id);
      fn();
    }, delayMs);
    timersRef.current.add(id);
    return id;
  }, []);

  // Staggered GPU-only modal entry & score count-up choreography (bypassed cleanly in reviewMode)
  useEffect(() => {
    exitLockRef.current = false;
    celebrationFiredRef.current = false;
    onModalSettledChangeRef.current?.(false);

    if (reviewMode) {
      const rafEnter = window.requestAnimationFrame(() => {
        setBackdropVisible(true);
        setCardVisible(true);
      });
      setSnapshotVisible(true);
      setDisplayedScore(finalScore);
      setNewBestPopped(isNewBest);
      setConfettiMode(null);
      setDetailsVisible(true);
      onModalSettledChangeRef.current?.(true);
      return () => {
        window.cancelAnimationFrame(rafEnter);
        cancelChoreographyTimers();
        onModalSettledChangeRef.current?.(false);
      };
    }

    if (reducedMotion) {
      setBackdropVisible(true);
      setCardVisible(true);
      setSnapshotVisible(true);
      setDisplayedScore(finalScore);
      setNewBestPopped(isNewBest);
      setConfettiMode(null);
      setDetailsVisible(true);
      onModalSettledChangeRef.current?.(true);
      const cState = celebrationStateRef.current;
      if (cState.isNewBest) {
        onNewBestRevealRef.current?.();
      } else if (cState.isFirstPlaceFinish) {
        onPodiumRevealRef.current?.(1);
      } else if (cState.isPodiumTwoOrThreeFinish && cState.selfRank) {
        onPodiumRevealRef.current?.(cState.selfRank);
      }
      return () => {
        onModalSettledChangeRef.current?.(false);
      };
    }

    // 0ms: Backdrop blur/dim
    const rafBackdrop = window.requestAnimationFrame(() => {
      setBackdropVisible(true);
    });

    // 60ms: Outer card spring
    scheduleTimer(() => {
      setCardVisible(true);
    }, 60);

    // 160ms: Mini board snapshot settles + Hero score 0 -> finalScore count-up (420ms ease-out)
    scheduleTimer(() => {
      setSnapshotVisible(true);
      if (finalScore <= 0) {
        setDisplayedScore(0);
        return;
      }

      const startTime = performance.now();
      let lastTickAt = 0;
      let tickCount = 0;

      const stepCountUp = (now: number) => {
        if (exitLockRef.current) return;
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / COUNT_UP_DURATION_MS);
        const eased = 1 - Math.pow(1 - progress, 3);
        const nextVal = Math.round(finalScore * eased);
        setDisplayedScore(nextVal);

        if (progress < 1 && now - lastTickAt >= 55) {
          lastTickAt = now;
          onScoreTickRef.current?.(tickCount);
          tickCount += 1;
        }

        if (progress < 1) {
          rafRef.current = window.requestAnimationFrame(stepCountUp);
        } else {
          setDisplayedScore(finalScore);
          rafRef.current = null;
        }
      };

      rafRef.current = window.requestAnimationFrame(stepCountUp);
    }, 160);

    // 300ms: Celebratory full-viewport Confetti & Audio/Haptic trigger (New Best / #1 / #2-#3 Podium)
    scheduleTimer(() => {
      if (exitLockRef.current || celebrationFiredRef.current) return;
      const cState = celebrationStateRef.current;
      if (!cState.isNewBest && !cState.isFirstPlaceFinish && !cState.isPodiumTwoOrThreeFinish) {
        return;
      }
      celebrationFiredRef.current = true;
      if (cState.isNewBest) {
        setNewBestPopped(true);
        setConfettiMode("all");
        onNewBestRevealRef.current?.();
      } else if (cState.isFirstPlaceFinish) {
        setConfettiMode("top-two-waves");
        onPodiumRevealRef.current?.(1);
      } else if (cState.isPodiumTwoOrThreeFinish && cState.selfRank) {
        setConfettiMode("top-only");
        onPodiumRevealRef.current?.(cState.selfRank);
      }
    }, 300);

    // 360ms: Percentile bar fill + staggered standings + footer settle
    scheduleTimer(() => {
      if (exitLockRef.current) return;
      setDetailsVisible(true);
      onModalSettledChangeRef.current?.(true);
    }, 360);

    return () => {
      window.cancelAnimationFrame(rafBackdrop);
      cancelChoreographyTimers();
      setConfettiMode(null);
      onModalSettledChangeRef.current?.(false);
    };
  }, [
    cancelChoreographyTimers,
    finalScore,
    isNewBest,
    reducedMotion,
    reviewMode,
    scheduleTimer,
  ]);

  const handleExitAction = useCallback(
    (action: "playAgain" | "backHome" | "closeReview") => {
      if (exitLockRef.current) return;
      exitLockRef.current = true;
      onModalSettledChangeRef.current?.(false);
      setConfettiMode(null);
      cancelChoreographyTimers();

      if (action !== "closeReview") {
        onButtonTapCueRef.current?.(action);
      }

      const finish = () => {
        if (action === "closeReview") {
          onCloseReviewRef.current?.();
        } else if (action === "playAgain") {
          onPlayAgainRef.current?.();
        } else {
          onBackHomeRef.current?.();
        }
      };

      if (reducedMotion) {
        finish();
        return;
      }

      setIsExiting(true);
      setBackdropVisible(false);
      scheduleTimer(
        finish,
        action === "closeReview" ? REVIEW_EXIT_DURATION_MS : EXIT_DURATION_MS
      );
    },
    [cancelChoreographyTimers, reducedMotion, scheduleTimer]
  );

  // Scoped Escape / Backspace key support strictly when inspecting history in reviewMode
  useEffect(() => {
    if (!reviewMode) return;
    const handleReviewKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement | null;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.tagName === "SELECT" ||
          activeEl.isContentEditable)
      ) {
        return;
      }
      if (e.key === "Escape" || e.key === "Backspace") {
        e.preventDefault();
        e.stopPropagation();
        handleExitAction("closeReview");
      }
    };
    window.addEventListener("keydown", handleReviewKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleReviewKeyDown, true);
    };
  }, [handleExitAction, reviewMode]);

  useEffect(() => {
    if (!registerPlayAgainTrigger || reviewMode) return;
    registerPlayAgainTrigger(() => handleExitAction("playAgain"));
    return () => {
      registerPlayAgainTrigger(null);
    };
  }, [handleExitAction, registerPlayAgainTrigger, reviewMode]);

  const isNewRecordHeadline = isNewBest && previousBestScore > 0;
  const heroScoreSizeClass =
    finalScore >= 10_000_000
      ? "text-[clamp(24px,6.8vw,32px)]"
      : finalScore >= 1_000_000
        ? "text-[clamp(28px,8vw,36px)]"
        : "text-[clamp(38px,10.5vw,44px)]";

  const hasSnapshotGrid = hasValid9x9Snapshot(finalBoardState);
  const isFirstSoloRecord =
    !reviewMode &&
    !hasMultiplayerStandings &&
    previousBestScore === 0 &&
    soloRuns.length <= 1;
  const showBottomFade = hasMultiplayerStandings
    ? standings.length > 3
    : !isFirstSoloRecord && soloRuns.length > 3;

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-block-sync-dialog="true"
      aria-labelledby="block-sync-gameover-title"
      onClick={(e) => {
        if (reviewMode && e.target === e.currentTarget) {
          handleExitAction("closeReview");
        }
      }}
      className={`fixed inset-0 ${
        reviewMode ? "z-[60]" : "z-50"
      } flex items-center justify-center p-3 backdrop-blur-sm transition-opacity ${
        isExiting
          ? reviewMode
            ? "duration-[160ms] ease-in"
            : "duration-[180ms] ease-in"
          : "duration-[140ms] ease-out"
      } ${backdropVisible ? "opacity-100" : "opacity-0"} ${
        darkMode ? "bg-black/60" : "bg-[#2C3E50]/25"
      }`}
    >
      <style>{`
        @keyframes bsEndNewBestPop {
          0% { transform: scale(0.8); opacity: 0; }
          62% { transform: scale(1.06); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* Full-Viewport Celebratory Confetti Canvas (outside modal overflow-hidden bounds, skipped in reviewMode) */}
      {confettiMode !== null && !reducedMotion && !reviewMode && (
        <ConfettiBurst
          darkMode={darkMode}
          mode={confettiMode}
          onComplete={() => setConfettiMode(null)}
        />
      )}

      <div
        onClick={(e) => e.stopPropagation()}
        style={{ willChange: "transform, opacity" }}
        className={`w-[calc(100%-24px)] max-w-[390px] max-h-[calc(100dvh-32px)] rounded-3xl p-5 border-none flex flex-col gap-3.5 overflow-hidden transition-[transform,opacity] ${
          isExiting
            ? reviewMode
              ? "duration-[160ms] ease-in scale-95 opacity-0"
              : "duration-[180ms] ease-in scale-95 opacity-0"
            : cardVisible
              ? reviewMode
                ? "duration-[180ms] ease-out scale-100 translate-y-0 opacity-100"
                : "duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] scale-100 translate-y-0 opacity-100"
              : "duration-[280ms] scale-[0.92] translate-y-4 opacity-0"
        } ${
          darkMode
            ? "bg-[#141A21] text-slate-100 shadow-[0_24px_60px_rgba(0,0,0,0.62)]"
            : "bg-[#F4F8FB] text-[#2C3E50] shadow-[0_24px_60px_rgba(44,62,80,0.16)]"
        }`}
      >
        {/* Header & Typography Hierarchy */}
        <header className="w-full shrink-0 flex items-start justify-between gap-2 text-left">
          <div className="min-w-0 flex flex-col gap-1">
            <span className="text-[10.5px] leading-none font-semibold uppercase tracking-[0.12em] opacity-55 truncate">
              {reviewMode
                ? playedAtLabel
                  ? `MATCH RECORD · ${playedAtLabel}`
                  : "MATCH RECORD"
                : "BLOCK SYNC"}
            </span>
            <h2
              id="block-sync-gameover-title"
              className={`text-[22px] leading-tight font-bold tracking-[-0.02em] inline-flex items-center gap-2 ${
                darkMode ? "text-slate-100" : "text-[#2C3E50]"
              }`}
            >
              {!reviewMode && endReason === "time_up" && (
                <Clock
                  className={`w-5 h-5 shrink-0 ${
                    darkMode ? "text-[#FBBF24]" : "text-[#D97706]"
                  }`}
                  aria-hidden="true"
                />
              )}
              <span>
                {reviewMode
                  ? isNewBest
                    ? "NEW RECORD!"
                    : roomMode
                      ? "MULTIPLAYER MATCH"
                      : "SOLO MATCH"
                  : endReason === "time_up"
                    ? "TIME'S UP!"
                    : isNewRecordHeadline
                      ? "NEW RECORD!"
                      : "OUT OF MOVES"}
              </span>
            </h2>
          </div>

          <div className="shrink-0 flex flex-wrap items-center justify-end gap-1.5">
            {(isFirstPlaceFinish || isPodiumTwoOrThreeFinish) && (
              <span
                className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] leading-none font-bold uppercase tracking-[0.08em] ${
                  selfRank === 1
                    ? darkMode
                      ? "bg-[#FBBF24]/22 text-[#FDE047] border border-[#FBBF24]/40"
                      : "bg-amber-200/95 text-[#78350F] border border-amber-400/50"
                    : selfRank === 2
                      ? darkMode
                        ? "bg-slate-300/20 text-slate-100 border border-slate-300/35"
                        : "bg-slate-200/95 text-slate-800 border border-slate-300"
                      : darkMode
                        ? "bg-orange-400/22 text-orange-200 border border-orange-400/40"
                        : "bg-orange-200/90 text-[#9A3412] border border-orange-300"
                }`}
              >
                {selfRank === 1 ? (
                  <Crown className="w-3 h-3 shrink-0" aria-hidden="true" />
                ) : (
                  <Medal className="w-3 h-3 shrink-0" aria-hidden="true" />
                )}
                <span>
                  {selfRank === 1
                    ? allPlayersFinished && standings.length > 1
                      ? "WINNER"
                      : "LEADER"
                    : selfRank === 2
                      ? "2ND"
                      : "3RD"}
                </span>
              </span>
            )}

            {isNewBest && (
              <span
                id="block-sync-new-best-badge"
                style={
                  newBestPopped && !reducedMotion && !reviewMode
                    ? {
                        animation:
                          "bsEndNewBestPop 240ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
                      }
                    : undefined
                }
                className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full border-none text-[11px] leading-none font-bold uppercase tracking-[0.08em] ${
                  newBestPopped ? "opacity-100" : "opacity-0"
                } ${
                  darkMode
                    ? "bg-[#F9CF43]/22 text-[#F9CF43] shadow-[0_4px_16px_rgba(249,207,67,0.2)]"
                    : "bg-amber-200/95 text-[#7A5208] shadow-[0_4px_14px_rgba(245,158,11,0.26)]"
                }`}
              >
                <Star className="w-3 h-3 fill-current shrink-0" aria-hidden="true" />
                <span>NEW BEST</span>
              </span>
            )}

            {reviewMode && (
              <button
                id="block-sync-review-close-button"
                type="button"
                aria-label="Close match record"
                title="Close"
                onClick={() => handleExitAction("closeReview")}
                className={`w-8 h-8 rounded-full border-none flex items-center justify-center cursor-pointer transition-colors duration-150 active:scale-90 ${
                  darkMode
                    ? "bg-[#1B242E] hover:bg-[#24303D] text-slate-300"
                    : "bg-[#E6F1F8] hover:bg-[#D5E6F3] text-[#49637A]"
                }`}
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </header>

        {/* Hero Score + Compact 9x9 Mini Board Snapshot Row */}
        <section
          aria-label="Final Score and Board Snapshot"
          className={`w-full shrink-0 rounded-2xl p-3.5 border-none grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3.5 transition-[transform,opacity] duration-[220ms] ease-out ${
            snapshotVisible
              ? "opacity-100 scale-100"
              : "opacity-0 scale-[0.97]"
          } ${
            darkMode
              ? "bg-[#1B242E] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
              : "bg-[#E6F1F8]/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
          }`}
        >
          <div className="min-w-0 flex flex-col items-start justify-center text-left">
            <span className="text-[10px] leading-none font-semibold uppercase tracking-[0.10em] opacity-55">
              FINAL SCORE
            </span>
            <span
              id="block-sync-final-score"
              className={`mt-1.5 max-w-full truncate font-extrabold tabular-nums tracking-[-0.03em] leading-none ${heroScoreSizeClass} ${
                darkMode ? "text-slate-50" : "text-[#223447]"
              }`}
            >
              {displayedScore.toLocaleString()}
            </span>
            <div
              className={`mt-2 inline-flex items-center gap-1.5 text-[11.5px] font-semibold tabular-nums ${
                darkMode ? "text-slate-300/85" : "text-[#49637A]"
              }`}
            >
              <Trophy
                className={`w-3.5 h-3.5 shrink-0 ${
                  darkMode ? "text-[#93C5FD]" : "text-[#5B92BF]"
                }`}
                aria-hidden="true"
              />
              <span className="truncate">
                BEST: {bestScore.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Concentric 9x9 Mini Board Snapshot (graceful fallback if legacy record has no grid) */}
          <div
            aria-label="Final 9 by 9 Board Snapshot"
            className={`w-[100px] h-[100px] shrink-0 p-1.5 rounded-2xl border-none transition-[transform,opacity] duration-[220ms] ease-out ${
              snapshotVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
            } ${
              darkMode
                ? "bg-[#141A21] shadow-[inset_0_2px_6px_rgba(0,0,0,0.48)]"
                : "bg-white/80 shadow-[inset_0_2px_6px_rgba(140,178,209,0.24)]"
            }`}
          >
            {hasSnapshotGrid ? (
              <div className="w-full h-full grid grid-cols-9 grid-rows-9 gap-[1.5px]">
                {finalBoardState.map((rowArr, rowIdx) =>
                  rowArr.map((cell, colIdx) => {
                    const isAltSubgrid =
                      (Math.floor(rowIdx / 3) + Math.floor(colIdx / 3)) % 2 === 1;
                    const colorKey =
                      typeof cell === "string" ? cell : cell?.color;
                    if (colorKey && tileClasses[colorKey]) {
                      return (
                        <div
                          key={`mini-cell-${rowIdx}-${colIdx}`}
                          className={`w-full h-full rounded-[2px] !shadow-none ${tileClasses[colorKey]}`}
                        />
                      );
                    }
                    return (
                      <div
                        key={`mini-cell-${rowIdx}-${colIdx}`}
                        className={`w-full h-full rounded-[2px] ${
                          darkMode
                            ? isAltSubgrid
                              ? "bg-[#23303E]"
                              : "bg-[#1B242E]"
                            : isAltSubgrid
                              ? "bg-[#D7E8F5]"
                              : "bg-[#EFF6FB]"
                        }`}
                      />
                    );
                  })
                )}
              </div>
            ) : (
              <div
                id="block-sync-legacy-snapshot-fallback"
                className="w-full h-full flex flex-col items-center justify-center gap-1 opacity-55"
              >
                <Grid3X3 className="w-5 h-5" aria-hidden="true" />
                <span className="text-[9px] font-semibold uppercase tracking-wider">
                  No Grid
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Compact 1-Row Percentile Pill */}
        <section
          aria-label="Score Percentile"
          className={`w-full shrink-0 px-3.5 py-2.5 rounded-2xl border-none flex flex-col gap-2 transition-[transform,opacity] duration-[220ms] ease-out ${
            detailsVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2"
          } ${darkMode ? "bg-[#1B242E]" : "bg-[#E6F1F8]/90"}`}
        >
          <div className="w-full flex items-center justify-between gap-2">
            <div className="min-w-0 flex items-center gap-2">
              <TrendingUp
                className={`w-3.5 h-3.5 shrink-0 ${
                  darkMode ? "text-[#93C5FD]" : "text-[#5B92BF]"
                }`}
                aria-hidden="true"
              />
              <p
                id="block-sync-percentile-message"
                className={`text-xs font-semibold truncate ${
                  darkMode ? "text-slate-200" : "text-[#2C3E50]"
                }`}
              >
                Higher than {percentileData.higherThanPercent}% of players
              </p>
            </div>
            <span
              className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                darkMode
                  ? "bg-[#243445] text-[#93C5FD]"
                  : "bg-sky-200/80 text-[#2E5E82]"
              }`}
            >
              Top {percentileData.topPercent}%
            </span>
          </div>

          <div
            className={`w-full h-2 rounded-full overflow-hidden ${
              darkMode
                ? "bg-[#141A21] shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]"
                : "bg-white/85 shadow-[inset_0_1px_3px_rgba(140,178,209,0.28)]"
            }`}
          >
            <div
              className={`h-full w-full origin-left rounded-full transition-transform duration-[360ms] ease-out ${
                darkMode
                  ? "bg-gradient-to-r from-[#5B92BF] via-[#7BB0D6] to-[#93C5FD]"
                  : "bg-gradient-to-r from-sky-300 via-[#7BB0D6] to-[#5B92BF]"
              }`}
              style={{
                transform: `scaleX(${
                  detailsVisible
                    ? Math.max(0.02, percentileData.higherThanPercent / 100)
                    : 0
                })`,
              }}
            />
          </div>
        </section>

        {/* Bounded Scrollable Standings or Match Details */}
        <section
          aria-label={
            hasMultiplayerStandings
              ? "Room Standings"
              : reviewMode
                ? "Match Details"
                : "Personal Top Runs"
          }
          className={`relative w-full min-h-0 rounded-2xl border-none overflow-hidden transition-[transform,opacity] duration-[220ms] ease-out ${
            detailsVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2"
          } ${darkMode ? "bg-[#1B242E]" : "bg-[#E6F1F8]/90"}`}
        >
          <div className="px-3.5 pt-2.5 pb-1.5 flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-[0.10em]">
            <span className="opacity-55">
              {hasMultiplayerStandings
                ? "ROOM STANDINGS"
                : reviewMode && soloRuns.length === 0
                  ? "MATCH SUMMARY"
                  : "TOP RUNS"}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {roomCode && (
                <button
                  type="button"
                  onClick={() => {
                    try {
                      navigator.clipboard?.writeText(roomCode);
                    } catch { }
                    setCopiedRoomCode(true);
                    window.setTimeout(() => setCopiedRoomCode(false), 1400);
                  }}
                  title={`Copy Room Code ${roomCode}`}
                  aria-label={`Copy Room Code ${roomCode}`}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-semibold uppercase tracking-wider tabular-nums border-none cursor-pointer transition-all active:scale-95 ${
                    darkMode
                      ? "bg-[#38BDF8]/15 hover:bg-[#38BDF8]/25 text-[#38BDF8]"
                      : "bg-[#2B8CEE]/12 hover:bg-[#2B8CEE]/20 text-[#2B8CEE]"
                  }`}
                >
                  <span>ROOM · {roomCode}</span>
                  {copiedRoomCode ? (
                    <Check className="w-2.5 h-2.5 stroke-[2.8]" aria-hidden="true" />
                  ) : (
                    <Copy className="w-2.5 h-2.5 stroke-[2.3]" aria-hidden="true" />
                  )}
                </button>
              )}
              <span className="opacity-55">
                {hasMultiplayerStandings
                  ? "RANKED"
                  : isFirstSoloRecord
                    ? "FIRST RUN"
                    : reviewMode && soloRuns.length === 0
                      ? "SOLO"
                      : `${soloRuns.length} RECORDED`}
              </span>
            </div>
          </div>

          {hasMultiplayerStandings ? (
            <div
              id="block-sync-standings-list"
              className="max-h-[156px] overflow-y-auto overscroll-contain px-2.5 pb-3.5 space-y-1.5"
            >
              {standings.map((entry, idx) => {
                const isCompletedRow = !entry.statusLabel;
                const podiumTier = isCompletedRow && idx < 3 ? idx + 1 : 0;
                const rowThemeClass =
                  podiumTier === 1
                    ? darkMode
                      ? "bg-[#1E2733] text-slate-50 border border-[#FBBF24]/38 shadow-[0_0_16px_rgba(251,191,36,0.10)]"
                      : "bg-white/92 text-[#1E293B] border border-[#D97706]/35 shadow-[0_2px_10px_rgba(217,119,6,0.08)]"
                    : podiumTier === 2
                      ? darkMode
                        ? "bg-[#1B2430] text-slate-100 border border-slate-300/28"
                        : "bg-white/88 text-[#1E293B] border border-slate-300/80 shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
                      : podiumTier === 3
                        ? darkMode
                          ? "bg-[#1B232D] text-slate-100 border border-[#FB923C]/30"
                          : "bg-white/88 text-[#1E293B] border border-[#C2410C]/25"
                        : entry.isSelf
                          ? darkMode
                            ? "bg-[#243445] text-slate-50"
                            : "bg-white/95 text-[#223447] shadow-[0_2px_8px_rgba(44,62,80,0.06)]"
                          : darkMode
                            ? "bg-[#141A21]/75 text-slate-300"
                            : "bg-white/60 text-[#49637A]";

                return (
                  <div
                    key={entry.id}
                    style={{
                      transitionDelay:
                        detailsVisible && !instantReveal
                          ? `${Math.min(idx, 6) * 40}ms`
                          : "0ms",
                    }}
                    className={`px-3 py-2 rounded-xl flex items-center justify-between gap-2 text-xs transition-[transform,opacity] duration-[200ms] ease-out ${
                      detailsVisible
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-2"
                    } ${rowThemeClass}`}
                  >
                    <div className="min-w-0 flex items-center gap-2.5">
                      {podiumTier > 0 ? (
                        <span
                          aria-label={`Rank ${podiumTier}`}
                          className={`w-7 h-7 rounded-xl inline-flex items-center justify-center shrink-0 ${
                            podiumTier === 1
                              ? darkMode
                                ? "bg-[#FBBF24]/20 text-[#FCD34D]"
                                : "bg-[#FEF3C7] text-[#B45309]"
                              : podiumTier === 2
                                ? darkMode
                                  ? "bg-slate-300/18 text-slate-200"
                                  : "bg-slate-200/90 text-slate-600"
                                : darkMode
                                  ? "bg-[#FB923C]/18 text-[#FDBA74]"
                                  : "bg-[#FFEDD5] text-[#C2410C]"
                          }`}
                        >
                          {podiumTier === 1 ? (
                            <Crown className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          ) : (
                            <Medal className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          )}
                        </span>
                      ) : entry.statusLabel ? (
                        <span
                          aria-label="Playing"
                          className={`w-7 h-7 rounded-xl inline-flex items-center justify-center shrink-0 ${
                            darkMode
                              ? "bg-white/[0.06] text-slate-400"
                              : "bg-slate-200/65 text-slate-500"
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        </span>
                      ) : (
                        <span className="w-7 text-center text-[11px] font-bold tabular-nums opacity-65 shrink-0">
                          #{idx + 1}
                        </span>
                      )}
                      <span className="font-semibold truncate">{entry.name}</span>
                      {entry.isSelf && (
                        <span
                          className={`shrink-0 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                            darkMode
                              ? "bg-[#38BDF8]/18 text-[#38BDF8]"
                              : "bg-[#2B8CEE]/14 text-[#2B8CEE]"
                          }`}
                        >
                          YOU
                        </span>
                      )}
                      {entry.statusLabel && (
                        <span className="shrink-0 text-[10px] font-medium opacity-65">
                          {entry.statusLabel}
                        </span>
                      )}
                    </div>
                    <span className="font-bold tabular-nums shrink-0">
                      {entry.score.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : isFirstSoloRecord ? (
            <div id="block-sync-first-record-card" className="px-3.5 pb-3.5 pt-1">
              <div
                className={`px-3 py-2.5 rounded-xl flex items-center justify-between gap-2.5 ${
                  darkMode
                    ? "bg-[#141A21]/85 text-slate-100"
                    : "bg-white/85 text-[#223447] shadow-[0_2px_10px_rgba(44,62,80,0.05)]"
                }`}
              >
                <div className="min-w-0 flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-xl shrink-0 flex items-center justify-center ${
                      darkMode
                        ? "bg-[#F9CF43]/18 text-[#F9CF43]"
                        : "bg-amber-100 text-[#9A6700]"
                    }`}
                  >
                    <Trophy className="w-3.5 h-3.5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex flex-col text-left">
                    <span className="text-xs font-bold truncate">
                      First Record Set
                    </span>
                    <span className="text-[11px] opacity-65 truncate">
                      Your baseline score is locked in
                    </span>
                  </div>
                </div>
                <span className="text-sm font-extrabold tabular-nums shrink-0">
                  {finalScore.toLocaleString()}
                </span>
              </div>
            </div>
          ) : reviewMode && soloRuns.length === 0 ? (
            <div className="px-3.5 pb-3.5 pt-1">
              <div
                className={`px-3 py-2.5 rounded-xl flex items-center justify-between gap-2.5 text-xs ${
                  darkMode
                    ? "bg-[#141A21]/85 text-slate-200"
                    : "bg-white/85 text-[#223447] shadow-[0_2px_10px_rgba(44,62,80,0.05)]"
                }`}
              >
                <span className="font-semibold truncate opacity-80">
                  {isNewBest ? "Set a new personal best" : "Recorded solo run"}
                </span>
                <span className="font-bold tabular-nums shrink-0">
                  {finalScore.toLocaleString()}
                </span>
              </div>
            </div>
          ) : (
            <div
              id="block-sync-standings-list"
              className="max-h-[156px] overflow-y-auto overscroll-contain px-2.5 pb-3.5 space-y-1.5"
            >
              {soloRuns.map((run, idx) => (
                <div
                  key={run.id}
                  style={{
                    transitionDelay:
                      detailsVisible && !instantReveal
                        ? `${Math.min(idx, 6) * 40}ms`
                        : "0ms",
                  }}
                  className={`px-3 py-2 rounded-xl flex items-center justify-between gap-2 text-xs transition-[transform,opacity] duration-[200ms] ease-out ${
                    detailsVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-2"
                  } ${
                    run.isCurrent
                      ? darkMode
                        ? "bg-[#243445] text-slate-50"
                        : "bg-white/95 text-[#223447] shadow-[0_2px_8px_rgba(44,62,80,0.06)]"
                      : darkMode
                        ? "bg-[#141A21]/75 text-slate-300"
                        : "bg-white/60 text-[#49637A]"
                  }`}
                >
                  <div className="min-w-0 flex items-center gap-2">
                    <span className="w-5 text-[11px] font-bold tabular-nums opacity-65 shrink-0">
                      #{idx + 1}
                    </span>
                    <span className="font-semibold truncate">
                      {run.label ||
                        (run.isCurrent
                          ? "Current Run"
                          : formatRunTimestamp(run.achievedAt))}
                    </span>
                    {run.isCurrent && (
                      <span
                        className={`shrink-0 px-1.5 py-0.5 rounded-md text-[9.5px] font-bold uppercase tracking-wider ${
                          darkMode
                            ? "bg-[#93C5FD]/20 text-[#93C5FD]"
                            : "bg-sky-100 text-[#2E5E82]"
                        }`}
                      >
                        Now
                      </span>
                    )}
                  </div>
                  <span className="font-bold tabular-nums shrink-0">
                    {run.score.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}

          {showBottomFade && (
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-x-0 bottom-0 h-5 ${
                darkMode
                  ? "bg-gradient-to-t from-[#1B242E] to-transparent"
                  : "bg-gradient-to-t from-[#E6F1F8] to-transparent"
              }`}
            />
          )}
        </section>

        {/* Pinned Thumb-Zone Footer (Safe Back-to-History CTA in reviewMode) */}
        <footer
          className={`w-full shrink-0 flex flex-col gap-1.5 pt-0.5 transition-[transform,opacity] duration-[200ms] ease-out ${
            detailsVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-1.5"
          }`}
        >
          {reviewMode ? (
            <button
              id="block-sync-back-to-history-button"
              type="button"
              onClick={() => handleExitAction("closeReview")}
              className={`w-full h-[48px] px-5 rounded-2xl border-none text-[15px] font-semibold flex items-center justify-center gap-2 cursor-pointer transition-transform duration-150 active:scale-[0.98] hover:scale-[1.01] ${
                darkMode
                  ? "bg-[#7BB0D6] text-slate-950 shadow-[0_8px_22px_rgba(0,0,0,0.42)]"
                  : "bg-[#5B92BF] text-white shadow-[0_8px_22px_rgba(91,146,191,0.28)]"
              }`}
            >
              <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Back to History</span>
            </button>
          ) : (
            <>
              <button
                id="block-sync-play-again-button"
                type="button"
                onClick={() => handleExitAction("playAgain")}
                className={`w-full h-[50px] px-5 rounded-2xl border-none text-[15.5px] font-semibold flex items-center justify-center gap-2 cursor-pointer transition-transform duration-150 active:scale-[0.98] hover:scale-[1.01] ${
                  darkMode
                    ? "bg-[#7BB0D6] text-slate-950 shadow-[0_8px_22px_rgba(0,0,0,0.42)]"
                    : "bg-[#5B92BF] text-white shadow-[0_8px_22px_rgba(91,146,191,0.28)]"
                }`}
              >
                <RotateCcw className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Play Again</span>
              </button>

              <button
                id="block-sync-back-home-button"
                type="button"
                onClick={() => handleExitAction("backHome")}
                className={`w-full h-[40px] px-4 rounded-2xl border-none text-[13.5px] font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors duration-150 active:scale-[0.98] ${
                  darkMode
                    ? "bg-transparent hover:bg-[#1B242E] text-slate-400 hover:text-slate-200"
                    : "bg-transparent hover:bg-[#E6F1F8] text-[#5E748A] hover:text-[#2C3E50]"
                }`}
              >
                <Home className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Back to Home</span>
              </button>
            </>
          )}
        </footer>
      </div>
    </div>
  );
};
