/**
 * Daily Challenge Result, Compact Stats & Top-20 Leaderboard Modal.
 *
 * Strict UI & Architecture compliance:
 * - True neutral charcoal dark palette (`#18181b` / `#222225` / `#27272a` — zero bluish tint)
 *   and warm pastel ivory light palette (`#FDFBF7` / `#F4EFE6` / `#FFFFFF`), strictly matching
 *   `GameOverModal` and native board dialogs.
 * - STRICT BORDERLESS & SHADOWLESS RULE: zero visible borders, outlines, or dividers.
 * - Explicit "Streak" label in the 3rd tile of the 1x3 summary strip to prevent confusion with Rank.
 * - Top-20 scrollable leaderboard + Pinned 'You' footer card + Guest/Offline fallback.
 * - Clickable date badge & bottom "View Calendar & History" wired to `DailyCalendarModal`,
 *   plus `<ChevronLeft />` Back navigation when opened from the calendar.
 * - Strictly Lucide React SVG vector icons (zero emojis).
 * - All user-facing strings wrapped with `t('daily.<key>', 'English Fallback')`.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertCircle,
  Award,
  Calendar,
  Check,
  ChevronLeft,
  Clock,
  Eye,
  Flame,
  Loader2,
  Share2,
  Trophy,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { auth } from "../../../firebase";
import { useTranslation } from "../../../i18n/useTranslation";
import {
  fetchDailyLeaderboard,
  type DailyLeaderboardEntry,
  type DailyLeaderboardResult,
} from "../services/dailyCloudService";
import type {
  DailyChallengeStatus,
  DailyDifficulty,
  DailyStats,
} from "../types/daily.types";

export interface DailyResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewBoard: () => void;
  onOpenCalendarHistory?: () => void;
  onBackToCalendar?: () => void;
  uid?: string | null;
  date: string;
  difficulty: DailyDifficulty;
  status: DailyChallengeStatus;
  elapsedTime: number;
  mistakes: number;
  stats: DailyStats;
  darkMode?: boolean;
}

function formatDurationMMSS(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function getDifficultyBadgeClasses(
  difficulty: DailyDifficulty,
  darkMode: boolean
): string {
  switch (difficulty) {
    case "EASY":
      return darkMode
        ? "bg-[#064e3b] text-[#a7f3d0]"
        : "bg-[#D1FAE5] text-[#065F46]";
    case "MEDIUM":
      return darkMode
        ? "bg-[#78350f] text-[#fde68a]"
        : "bg-[#FEF3C7] text-[#92400E]";
    case "HARD":
      return darkMode
        ? "bg-[#4c1d95] text-[#ddd6fe]"
        : "bg-[#EDE9FE] text-[#5B21B6]";
    case "EXPERT":
      return darkMode
        ? "bg-[#881337] text-[#fecdd3]"
        : "bg-[#FFE4E6] text-[#9F1239]";
    case "MASTER":
      return darkMode
        ? "bg-[#312e81] text-[#c7d2fe]"
        : "bg-[#E0E7FF] text-[#3730A3]";
  }
}

function getRankBadgeClasses(rank: number, darkMode: boolean): string {
  if (rank === 1) {
    return darkMode
      ? "bg-[#78350f]/80 text-[#fde68a]"
      : "bg-[#FEF3C7] text-[#92400E]";
  }
  if (rank === 2) {
    return darkMode
      ? "bg-zinc-700 text-zinc-200"
      : "bg-[#E2E8F0] text-[#334155]";
  }
  if (rank === 3) {
    return darkMode
      ? "bg-[#7c2d12]/80 text-[#fed7aa]"
      : "bg-[#FFEDD5] text-[#9A3412]";
  }
  return darkMode
    ? "bg-[#2c2c30] text-zinc-300"
    : "bg-[#EDE8DE] text-stone-700";
}

export const DailyResultModal: React.FC<DailyResultModalProps> = ({
  isOpen,
  onClose,
  onReviewBoard,
  onOpenCalendarHistory,
  onBackToCalendar,
  uid,
  date,
  difficulty,
  status,
  elapsedTime,
  mistakes,
  stats,
  darkMode = false,
}) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<DailyLeaderboardResult>({
    entries: [],
    userRank: null,
    userEntry: null,
    isAuthenticated: false,
    isOfflineOrError: false,
  });
  const [isMyRowOutOfView, setIsMyRowOutOfView] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const myRowRef = useRef<HTMLDivElement | null>(null);

  const resolvedUid = useMemo(() => {
    if (uid !== undefined) return uid;
    try {
      const current = auth?.currentUser;
      if (current && !current.isAnonymous && current.uid) {
        return current.uid;
      }
    } catch {}
    return null;
  }, [uid]);

  const td = useCallback(
    (key: string, fallback: string): string => {
      const val = (t as (k: string) => string)(key);
      if (!val || val === key || /^daily\./i.test(val)) {
        return fallback;
      }
      return val;
    },
    [t]
  );

  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setIsLoadingLeaderboard(true);

    fetchDailyLeaderboard(resolvedUid, date)
      .then((res) => {
        if (!cancelled) {
          setLeaderboard(res);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingLeaderboard(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, resolvedUid, date, status, elapsedTime]);

  const evaluateUserRowVisibility = useCallback(() => {
    const container = scrollContainerRef.current;
    const myRow = myRowRef.current;
    if (!container) {
      setIsMyRowOutOfView(false);
      return;
    }
    if (!myRow) {
      setIsMyRowOutOfView(true);
      return;
    }
    const cRect = container.getBoundingClientRect();
    const rRect = myRow.getBoundingClientRect();
    const outOfView =
      rRect.bottom < cRect.top + 6 || rRect.top > cRect.bottom - 6;
    setIsMyRowOutOfView(outOfView);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const raf = window.requestAnimationFrame(() => {
      evaluateUserRowVisibility();
    });
    return () => window.cancelAnimationFrame(raf);
  }, [isOpen, leaderboard, evaluateUserRowVisibility]);

  const handleShareChallenge = useCallback(async () => {
    const formattedTime = formatDurationMMSS(elapsedTime);
    const statusLabel =
      status === "COMPLETED"
        ? `${td("daily.solvedIn", "Solved in")} ${formattedTime}`
        : status === "FAILED"
          ? td("daily.challengeFailed", "Challenge Failed")
          : td("daily.inProgress", "In Progress");

    const shareUrl = "https://sudokusync.com";
    const shareText = [
      `SudokuSync Daily Challenge (${date})`,
      `${td("daily.difficultyLabel", "Difficulty")}: ${difficulty}`,
      statusLabel,
      `${td("daily.mistakesLabel", "Mistakes")}: ${mistakes}/3`,
      `${td("daily.streakLabel", "Streak")}: ${stats.currentStreak}`,
      shareUrl,
    ].join("\n");

    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({
          title: `SudokuSync Daily Challenge — ${date}`,
          text: shareText,
          url: shareUrl,
        });
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2500);
        return;
      }
    } catch {
      // User dismissed share sheet; fall back to clipboard
    }

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2500);
        return;
      }
    } catch {}

    if (typeof document !== "undefined") {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = shareText;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2500);
      } catch {}
    }
  }, [date, difficulty, elapsedTime, mistakes, stats.currentStreak, status, td]);

  const isCompleted = status === "COMPLETED";
  const isFailed = status === "FAILED";

  const myRank = leaderboard.userRank;
  const effectiveUserEntry: DailyLeaderboardEntry | null = useMemo(() => {
    if (!leaderboard.isAuthenticated) return null;
    if (leaderboard.userEntry) return leaderboard.userEntry;
    if (isCompleted) {
      return {
        uid: resolvedUid || "you",
        playerName: td("daily.youLabel", "You"),
        isGuest: false,
        time: elapsedTime,
        mistakes,
        completedAt: Date.now(),
      };
    }
    return null;
  }, [
    leaderboard.isAuthenticated,
    leaderboard.userEntry,
    isCompleted,
    resolvedUid,
    td,
    elapsedTime,
    mistakes,
  ]);

  if (!isOpen || typeof document === "undefined") return null;

  const headerPillClasses = isCompleted
    ? darkMode
      ? "bg-[#064e3b] text-[#a7f3d0]"
      : "bg-[#D1FAE5] text-[#065F46]"
    : isFailed
      ? darkMode
        ? "bg-[#881337] text-[#fecdd3]"
        : "bg-[#FFE4E6] text-[#9F1239]"
      : darkMode
        ? "bg-[#78350f] text-[#fde68a]"
        : "bg-[#FEF3C7] text-[#92400E]";

  const isInTop3 = myRank !== null && myRank <= 3;
  const shouldShowPinnedYouFooter =
    leaderboard.isAuthenticated &&
    !leaderboard.isOfflineOrError &&
    effectiveUserEntry !== null &&
    (!isInTop3 || isMyRowOutOfView);

  const modalContent = (
    <div
      className="fixed inset-0 z-[10000] overflow-y-auto flex justify-center p-3.5 sm:p-4 pt-[calc(76px+env(safe-area-inset-top,0px))] pb-4 sm:pb-6 bg-black/65 backdrop-blur-sm select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="daily-result-modal-title"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-md max-h-[85dvh] overflow-y-auto my-auto rounded-3xl border-0 shadow-none p-4 sm:p-5 transition-colors ${
          darkMode
            ? "bg-[#18181b] text-zinc-100"
            : "bg-[#FDFBF7] text-[#1C1917]"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Row: Optional Calendar Back + Status + Clickable Date + Difficulty | Close X */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-2 min-w-0">
            {onBackToCalendar && (
              <button
                type="button"
                onClick={onBackToCalendar}
                aria-label={td("daily.backToCalendarBtn", "Back to Calendar")}
                className={`w-8 h-8 rounded-2xl border-0 shadow-none flex items-center justify-center shrink-0 cursor-pointer transition-transform active:scale-95 ${
                  darkMode
                    ? "bg-[#222225] hover:bg-[#2c2c30] text-zinc-200"
                    : "bg-[#F4EFE6] hover:bg-[#EAE3D5] text-stone-700"
                }`}
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.4]" />
              </button>
            )}

            <div
              className={`w-9 h-9 rounded-2xl border-0 shadow-none flex items-center justify-center shrink-0 ${headerPillClasses}`}
            >
              {isCompleted ? (
                <Trophy
                  className={`w-4 h-4 stroke-[2.3] ${
                    darkMode ? "text-[#FBBF24]" : "text-[#B45309]"
                  }`}
                />
              ) : isFailed ? (
                <XCircle className="w-4 h-4 stroke-[2.3]" />
              ) : (
                <Award className="w-4 h-4 stroke-[2.3]" />
              )}
            </div>

            <div className="min-w-0">
              <h2
                id="daily-result-modal-title"
                className="font-sans font-black text-sm sm:text-base leading-tight truncate"
              >
                {isCompleted
                  ? td("daily.completedTitle", "Daily Challenge Completed")
                  : isFailed
                    ? td("daily.failedTitle", "Daily Challenge Failed")
                    : td("daily.statsTitle", "Daily Challenge Stats")}
              </h2>

              <div className="flex items-center gap-1.5 mt-1">
                <button
                  type="button"
                  onClick={onOpenCalendarHistory}
                  disabled={!onOpenCalendarHistory}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border-0 shadow-none font-mono text-[11px] font-bold transition-colors ${
                    onOpenCalendarHistory
                      ? darkMode
                        ? "bg-[#222225] hover:bg-[#2c2c30] text-zinc-300 cursor-pointer"
                        : "bg-[#F4EFE6] hover:bg-[#EAE3D5] text-stone-700 cursor-pointer"
                      : darkMode
                        ? "bg-[#222225] text-zinc-400"
                        : "bg-[#F4EFE6] text-stone-600"
                  }`}
                >
                  <Calendar className="w-2.5 h-2.5 shrink-0 opacity-80" />
                  <span>{date}</span>
                </button>

                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase border-0 shadow-none ${getDifficultyBadgeClasses(
                    difficulty,
                    darkMode
                  )}`}
                >
                  {difficulty}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={td("daily.closeBtn", "Close")}
            className={`w-8 h-8 rounded-2xl border-0 shadow-none flex items-center justify-center shrink-0 cursor-pointer transition-transform active:scale-95 ${
              darkMode
                ? "bg-[#222225] hover:bg-[#2c2c30] text-zinc-300"
                : "bg-[#F4EFE6] hover:bg-[#EAE3D5] text-stone-600"
            }`}
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* Compact 1x3 Borderless Horizontal Stats Strip */}
        <div className="w-full grid grid-cols-3 gap-2 mb-3.5">
          {/* Box 1: Solved Time + PB */}
          <div
            className={`rounded-2xl border-0 shadow-none px-2.5 py-2 flex flex-col items-center justify-center min-w-0 ${
              darkMode
                ? "bg-[#222225] text-zinc-100"
                : "bg-[#F4EFE6] text-[#1C1917]"
            }`}
          >
            <div
              className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${
                darkMode ? "text-zinc-400" : "text-stone-600"
              }`}
            >
              <Clock
                className={`w-3 h-3 shrink-0 stroke-[2.3] ${
                  darkMode ? "text-sky-400" : "text-[#0369A1]"
                }`}
              />
              <span>{td("daily.timeLabel", "Time")}</span>
            </div>
            <div className="font-mono font-black text-sm sm:text-base leading-tight mt-0.5">
              {formatDurationMMSS(elapsedTime)}
            </div>
            <span
              className={`font-mono text-[10px] font-semibold mt-0.5 leading-none truncate ${
                darkMode ? "text-zinc-400" : "text-stone-600"
              }`}
            >
              {td("daily.pbShort", "PB")}:{" "}
              {stats.bestTimeSeconds !== null
                ? formatDurationMMSS(stats.bestTimeSeconds)
                : "--:--"}
            </span>
          </div>

          {/* Box 2: Mistakes */}
          <div
            className={`rounded-2xl border-0 shadow-none px-2.5 py-2 flex flex-col items-center justify-center min-w-0 ${
              darkMode
                ? "bg-[#222225] text-zinc-100"
                : "bg-[#F4EFE6] text-[#1C1917]"
            }`}
          >
            <div
              className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${
                darkMode ? "text-zinc-400" : "text-stone-600"
              }`}
            >
              <AlertCircle
                className={`w-3 h-3 shrink-0 stroke-[2.3] ${
                  darkMode ? "text-rose-400" : "text-[#BE123C]"
                }`}
              />
              <span>{td("daily.mistakesLabel", "Mistakes")}</span>
            </div>
            <div className="font-mono font-black text-sm sm:text-base leading-tight mt-0.5">
              {mistakes} / 3
            </div>
            <span
              className={`font-sans text-[10px] font-semibold mt-0.5 leading-none truncate ${
                darkMode ? "text-zinc-400" : "text-stone-600"
              }`}
            >
              {stats.totalCompleted} {td("daily.solvedCountShort", "solved")}
            </span>
          </div>

          {/* Box 3: Streak (explicit Streak header to avoid confusion with Rank) */}
          <div
            className={`rounded-2xl border-0 shadow-none px-2.5 py-2 flex flex-col items-center justify-center min-w-0 ${
              darkMode
                ? "bg-[#222225] text-zinc-100"
                : "bg-[#F4EFE6] text-[#1C1917]"
            }`}
          >
            <div
              className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${
                darkMode ? "text-zinc-400" : "text-stone-600"
              }`}
            >
              {isCompleted ? (
                <Trophy
                  className={`w-3 h-3 shrink-0 stroke-[2.3] ${
                    darkMode ? "text-[#FBBF24]" : "text-[#B45309]"
                  }`}
                />
              ) : (
                <Flame
                  className={`w-3 h-3 shrink-0 stroke-[2.3] ${
                    darkMode ? "text-[#FBBF24]" : "text-[#D97706]"
                  }`}
                />
              )}
              <span>{td("daily.streakLabel", "Streak")}</span>
            </div>
            <div className="font-mono font-black text-sm sm:text-base leading-tight mt-0.5">
              {stats.currentStreak}
            </div>
            <span
              className={`font-mono text-[10px] font-semibold mt-0.5 leading-none truncate ${
                darkMode ? "text-zinc-400" : "text-stone-600"
              }`}
            >
              {td("daily.bestShort", "Best")}: {stats.longestStreak}
            </span>
          </div>
        </div>

        {/* Multiplayer-Style Global Daily Leaderboard (Borderless, Top 20 + Pinned 'You') */}
        <div
          className={`w-full rounded-2xl border-0 shadow-none overflow-hidden mb-3.5 ${
            darkMode
              ? "bg-[#222225] text-zinc-100"
              : "bg-[#F4EFE6] text-[#1C1917]"
          }`}
        >
          {/* Leaderboard Section Header */}
          <div
            className={`px-3.5 py-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider border-0 ${
              darkMode
                ? "bg-[#27272a] text-zinc-300"
                : "bg-[#EDE6DA] text-stone-600"
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              <Trophy
                className={`w-3.5 h-3.5 shrink-0 ${
                  darkMode ? "text-[#FBBF24]" : "text-[#B45309]"
                }`}
              />
              <span>
                {td("daily.globalLeaderboardTitle", "Global Daily Leaderboard")}
              </span>
            </span>
            <span className="font-mono text-[10px] opacity-75">
              {td("daily.top20Badge", "Top 20")}
            </span>
          </div>

          {/* Guest / Offline Fallback Card */}
          {!leaderboard.isAuthenticated || leaderboard.isOfflineOrError ? (
            <div className="p-4 text-center flex flex-col items-center justify-center gap-2">
              <div
                className={`w-9 h-9 rounded-2xl border-0 shadow-none flex items-center justify-center ${
                  darkMode
                    ? "bg-[#2c2c30] text-zinc-200"
                    : "bg-[#FEF3C7] text-[#92400E]"
                }`}
              >
                <Users className="w-4 h-4 stroke-[2.2]" />
              </div>
              <p className="font-sans text-xs font-bold leading-snug max-w-[270px] opacity-80">
                {td(
                  "daily.signInLeaderboardPrompt",
                  "Sign in with Google to rank on the Global Daily Leaderboard"
                )}
              </p>
            </div>
          ) : isLoadingLeaderboard ? (
            <div className="h-[130px] flex items-center justify-center gap-2 text-xs font-semibold opacity-70">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{td("daily.loadingLeaderboard", "Loading standings...")}</span>
            </div>
          ) : (
            <>
              {/* Scrollable Top 20 Container */}
              <div
                ref={scrollContainerRef}
                onScroll={evaluateUserRowVisibility}
                className="max-h-[190px] overflow-y-auto p-1.5 flex flex-col gap-1 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-500/35"
              >
                {leaderboard.entries.length === 0 ? (
                  <div className="py-7 px-4 text-center text-xs font-semibold opacity-70">
                    {td(
                      "daily.noCompletionsYet",
                      "No finishers recorded yet today. Claim the #1 spot!"
                    )}
                  </div>
                ) : (
                  leaderboard.entries.map((entry, idx) => {
                    const rank = idx + 1;
                    const isMe = Boolean(resolvedUid && entry.uid === resolvedUid);
                    const isTopThree = rank <= 3;

                    return (
                      <div
                        key={entry.uid}
                        ref={isMe ? myRowRef : undefined}
                        className={`px-2.5 py-2 rounded-xl border-0 shadow-none flex items-center justify-between gap-2 text-xs transition-colors ${
                          isMe
                            ? darkMode
                              ? "bg-[#2e2a44] text-zinc-100"
                              : "bg-[#E0E7FF] text-[#1E1B4B]"
                            : darkMode
                              ? "bg-[#1b1b1e] text-zinc-200"
                              : "bg-white/85 text-[#1C1917]"
                        }`}
                      >
                        {/* Left: Rank Badge + Name */}
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`min-w-[32px] h-6 px-1.5 rounded-lg font-mono font-black text-[11px] inline-flex items-center justify-center gap-0.5 shrink-0 border-0 shadow-none ${getRankBadgeClasses(
                              rank,
                              darkMode
                            )}`}
                          >
                            {isTopThree && (
                              <Trophy
                                className={`w-2.5 h-2.5 shrink-0 stroke-[2.4] ${
                                  darkMode ? "text-[#FBBF24]" : "text-[#B45309]"
                                }`}
                              />
                            )}
                            <span>#{rank}</span>
                          </span>

                          <span className="font-sans font-bold truncate">
                            {isMe
                              ? `${entry.playerName} (${td("daily.youLabel", "You")})`
                              : entry.playerName}
                          </span>

                          {entry.isGuest && (
                            <span
                              className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase shrink-0 border-0 ${
                                darkMode
                                  ? "bg-[#27272a] text-zinc-400"
                                  : "bg-[#EDE8DE] text-stone-600"
                              }`}
                            >
                              {td("daily.guestTag", "Guest")}
                            </span>
                          )}
                        </div>

                        {/* Right: Time + Mistakes */}
                        <div className="flex items-center gap-2.5 shrink-0 font-mono text-[11px]">
                          <span className="font-black">
                            {formatDurationMMSS(entry.time)}
                          </span>
                          <span className="opacity-60">
                            {entry.mistakes}/3
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Pinned 'You' Footer Card when rank > 3 or scrolled out of view */}
              {shouldShowPinnedYouFooter && effectiveUserEntry && (
                <div
                  className={`mx-1.5 mb-1.5 px-3 py-2 rounded-xl border-0 shadow-none flex items-center justify-between gap-2 ${
                    darkMode
                      ? "bg-[#2a273c] text-zinc-100"
                      : "bg-[#E0E7FF] text-[#1E1B4B]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`min-w-[44px] h-8 px-2 rounded-xl font-mono text-lg font-black inline-flex items-center justify-center shrink-0 border-0 shadow-none ${
                        darkMode
                          ? "bg-[#3b3466] text-[#ddd6fe]"
                          : "bg-[#C7D2FE] text-[#312E81]"
                      }`}
                    >
                      {myRank !== null ? `#${myRank}` : "#--"}
                    </span>
                    <div className="min-w-0">
                      <span className="font-sans font-black text-xs block leading-tight truncate">
                        {td("daily.youLabel", "You")}
                      </span>
                      <span className="font-sans text-[10px] font-semibold opacity-70 block leading-tight">
                        {td("daily.yourStandingLabel", "Your Standing")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 font-mono text-xs">
                    <span className="font-black">
                      {formatDurationMMSS(effectiveUserEntry.time)}
                    </span>
                    <span className="opacity-70 text-[11px]">
                      {effectiveUserEntry.mistakes} / 3
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* 2-Column Side-by-Side Primary Actions: Share Challenge & Review Board */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleShareChallenge}
            className={`py-3 px-3 rounded-2xl border-0 shadow-none font-sans font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer transition-transform active:scale-[0.98] ${
              darkMode
                ? "bg-[#0c4a6e] hover:bg-[#075985] text-[#bae6fd]"
                : "bg-[#BAE6FD] hover:bg-[#7DD3FC] text-[#0C4A6E]"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 stroke-[2.5] shrink-0" />
                <span className="truncate">
                  {td("daily.copiedShare", "Copied")}
                </span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 stroke-[2.2] shrink-0" />
                <span className="truncate">
                  {td("daily.shareChallengeBtn", "Share Challenge")}
                </span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onReviewBoard}
            className={`py-3 px-3 rounded-2xl border-0 shadow-none font-sans font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.98] ${
              darkMode
                ? "bg-[#2e1065] hover:bg-[#3b0764] text-[#e9d5ff]"
                : "bg-[#F3E8FF] hover:bg-[#E9D5FF] text-[#6B21A8]"
            }`}
          >
            <Eye className="w-4 h-4 stroke-[2.2] shrink-0" />
            <span className="truncate">
              {td("daily.reviewBoardBtn", "Review Board")}
            </span>
          </button>
        </div>

        {/* Full-Width Tactile Daily Pill: Calendar & History */}
        <button
          type="button"
          onClick={onOpenCalendarHistory}
          disabled={!onOpenCalendarHistory}
          className={`w-full mt-2 py-2.5 px-3 rounded-2xl border-0 shadow-none font-sans font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] ${
            onOpenCalendarHistory ? "cursor-pointer" : "opacity-60 cursor-default"
          } ${
            darkMode
              ? "bg-[#451a03]/85 hover:bg-[#78350f] text-[#fde68a]"
              : "bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E]"
          }`}
        >
          <Calendar className="w-3.5 h-3.5 stroke-[2.2] shrink-0" />
          <span>{td("daily.calendarHistoryBtn", "View Calendar & History")}</span>
        </button>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
