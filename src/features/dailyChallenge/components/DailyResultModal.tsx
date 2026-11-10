/**
 * Daily Challenge Result, Compact Stats & Top-20 Leaderboard Modal (Phase 1 Overhaul).
 *
 * Strict UI & Architecture compliance:
 * - Neutral charcoal/black dark surface (`bg-[#12161f]` / `bg-[#18181b]`) and pastel
 *   ivory/cream light surface (`bg-[#FAF9F6]`) with zero drop shadows and subtle 1px
 *   translucent borders (`border-white/10` / `border-black/5`).
 * - Single-row compact 1x3 horizontal stats strip (~48px height).
 * - Side-by-side 2-column action buttons ("Share Challenge" & "Review Board") plus
 *   full-width subtle tertiary "View Calendar & History" stub for Phase 2.
 * - Multiplayer-style scrollable Top 20 leaderboard (`/daily_challenges/{date}/completions`)
 *   with Top 3 gold/silver/bronze badges, pinned 'You' footer card with large rank badge,
 *   and clean guest/offline fallback card.
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
        ? "bg-[#064e3b]/70 text-[#a7f3d0] border border-emerald-400/20"
        : "bg-[#D1FAE5] text-[#065F46] border border-emerald-600/10";
    case "MEDIUM":
      return darkMode
        ? "bg-[#78350f]/70 text-[#fde68a] border border-amber-400/20"
        : "bg-[#FEF3C7] text-[#92400E] border border-amber-600/10";
    case "HARD":
      return darkMode
        ? "bg-[#4c1d95]/70 text-[#ddd6fe] border border-violet-400/20"
        : "bg-[#EDE9FE] text-[#5B21B6] border border-violet-600/10";
    case "EXPERT":
      return darkMode
        ? "bg-[#881337]/70 text-[#fecdd3] border border-rose-400/20"
        : "bg-[#FFE4E6] text-[#9F1239] border border-rose-600/10";
    case "MASTER":
      return darkMode
        ? "bg-[#312e81]/70 text-[#c7d2fe] border border-indigo-400/20"
        : "bg-[#E0E7FF] text-[#3730A3] border border-indigo-600/10";
  }
}

function getRankBadgeClasses(rank: number, darkMode: boolean): string {
  if (rank === 1) {
    return darkMode
      ? "bg-[#78350f]/70 text-[#fde68a] border border-amber-400/25"
      : "bg-[#FEF3C7] text-[#92400E] border border-amber-500/20";
  }
  if (rank === 2) {
    return darkMode
      ? "bg-zinc-700/75 text-zinc-200 border border-white/15"
      : "bg-[#F1F5F9] text-[#334155] border border-slate-400/20";
  }
  if (rank === 3) {
    return darkMode
      ? "bg-[#7c2d12]/70 text-[#fed7aa] border border-orange-400/25"
      : "bg-[#FFEDD5] text-[#9A3412] border border-orange-500/20";
  }
  return darkMode
    ? "bg-zinc-800/90 text-zinc-400 border border-white/10"
    : "bg-black/[0.04] text-slate-600 border border-black/5";
}

export const DailyResultModal: React.FC<DailyResultModalProps> = ({
  isOpen,
  onClose,
  onReviewBoard,
  onOpenCalendarHistory,
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
  const [calendarStubNotice, setCalendarStubNotice] = useState(false);
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

  // Resolve authenticated UID from explicit prop or active Firebase Auth session
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

  // Escape key handler & transient state reset
  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
      setCalendarStubNotice(false);
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

  // Fetch Top-20 Daily Challenge Leaderboard when modal opens
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

  // Monitor whether the user's inline leaderboard row is scrolled out of view
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
      `${td("daily.currentStreakLabel", "Current Streak")}: ${stats.currentStreak}`,
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

  const handleCalendarHistoryClick = useCallback(() => {
    if (onOpenCalendarHistory) {
      onOpenCalendarHistory();
      return;
    }
    setCalendarStubNotice(true);
    window.setTimeout(() => setCalendarStubNotice(false), 2600);
  }, [onOpenCalendarHistory]);

  const isCompleted = status === "COMPLETED";
  const isFailed = status === "FAILED";

  // Determine whether the Pinned 'You' footer card should render (must precede early return)
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
      ? "bg-[#064e3b]/65 text-[#a7f3d0] border border-emerald-400/20"
      : "bg-[#D1FAE5] text-[#065F46] border border-emerald-600/10"
    : isFailed
      ? darkMode
        ? "bg-[#881337]/65 text-[#fecdd3] border border-rose-400/20"
        : "bg-[#FFE4E6] text-[#9F1239] border border-rose-600/10"
      : darkMode
        ? "bg-[#78350f]/65 text-[#fde68a] border border-amber-400/20"
        : "bg-[#FEF3C7] text-[#92400E] border border-amber-600/10";

  const isInTop3 = myRank !== null && myRank <= 3;
  const shouldShowPinnedYouFooter =
    leaderboard.isAuthenticated &&
    !leaderboard.isOfflineOrError &&
    effectiveUserEntry !== null &&
    (!isInTop3 || isMyRowOutOfView);

  const modalContent = (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center p-3.5 sm:p-4 bg-black/65 backdrop-blur-sm select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="daily-result-modal-title"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-md rounded-3xl shadow-none p-4 sm:p-5 transition-colors ${
          darkMode
            ? "bg-[#12161f] text-zinc-100 border border-white/10"
            : "bg-[#FAF9F6] text-slate-800 border border-black/5"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Row: Status + Date + Difficulty | Close X */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`w-9 h-9 rounded-2xl shadow-none flex items-center justify-center shrink-0 ${headerPillClasses}`}
            >
              {isCompleted ? (
                <Trophy className="w-4 h-4 stroke-[2.3]" />
              ) : isFailed ? (
                <XCircle className="w-4 h-4 stroke-[2.3]" />
              ) : (
                <Award className="w-4 h-4 stroke-[2.3]" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
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
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-mono text-[11px] font-semibold opacity-65">
                  {date}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.2 rounded-full text-[9px] font-black tracking-wider uppercase shadow-none ${getDifficultyBadgeClasses(
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
            className={`w-8 h-8 rounded-2xl shadow-none flex items-center justify-center shrink-0 cursor-pointer transition-transform active:scale-95 ${
              darkMode
                ? "bg-[#18181b] hover:bg-zinc-800 text-zinc-300 border border-white/10"
                : "bg-white/90 hover:bg-black/5 text-slate-600 border border-black/5"
            }`}
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* Compact 1x3 Horizontal Summary Strip (~48px height) */}
        <div
          className={`w-full h-[50px] rounded-2xl shadow-none grid grid-cols-3 divide-x mb-3.5 ${
            darkMode
              ? "bg-[#18181b] border border-white/10 divide-white/10"
              : "bg-white/90 border border-black/5 divide-black/5"
          }`}
        >
          {/* Cell 1: Solved Time + Subtle PB */}
          <div className="flex flex-col items-center justify-center px-2 min-w-0">
            <div className="flex items-center gap-1 font-mono font-black text-xs sm:text-sm leading-none">
              <Clock className="w-3.5 h-3.5 text-sky-500 shrink-0 stroke-[2.3]" />
              <span>{formatDurationMMSS(elapsedTime)}</span>
            </div>
            <span className="font-mono text-[10px] font-semibold opacity-60 mt-1 leading-none truncate">
              {td("daily.pbShort", "PB")}:{" "}
              {stats.bestTimeSeconds !== null
                ? formatDurationMMSS(stats.bestTimeSeconds)
                : "--:--"}
            </span>
          </div>

          {/* Cell 2: Mistakes */}
          <div className="flex flex-col items-center justify-center px-2 min-w-0">
            <div className="flex items-center gap-1 font-mono font-black text-xs sm:text-sm leading-none">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 stroke-[2.3]" />
              <span>{mistakes} / 3</span>
            </div>
            <span className="font-sans text-[10px] font-semibold opacity-60 mt-1 leading-none truncate">
              {td("daily.mistakesLabel", "Mistakes")}
            </span>
          </div>

          {/* Cell 3: Streak */}
          <div className="flex flex-col items-center justify-center px-2 min-w-0">
            <div className="flex items-center gap-1 font-mono font-black text-xs sm:text-sm leading-none">
              {isCompleted ? (
                <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0 stroke-[2.3]" />
              ) : (
                <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0 stroke-[2.3]" />
              )}
              <span>{stats.currentStreak}</span>
            </div>
            <span className="font-mono text-[10px] font-semibold opacity-60 mt-1 leading-none truncate">
              {td("daily.bestShort", "Best")}: {stats.longestStreak}
            </span>
          </div>
        </div>

        {/* Multiplayer-Style Global Daily Leaderboard (Top 20 + Pinned 'You') */}
        <div
          className={`w-full rounded-2xl shadow-none overflow-hidden mb-3.5 ${
            darkMode
              ? "bg-[#18181b] border border-white/10"
              : "bg-white/90 border border-black/5"
          }`}
        >
          {/* Leaderboard Section Header */}
          <div
            className={`px-3.5 py-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider border-b ${
              darkMode
                ? "border-white/10 text-zinc-400"
                : "border-black/5 text-slate-500"
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
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
            <div className="p-4 text-center flex flex-col items-center justify-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
                  darkMode
                    ? "bg-zinc-800/90 text-zinc-300 border border-white/10"
                    : "bg-[#FEF3C7] text-[#92400E] border border-amber-500/10"
                }`}
              >
                <Users className="w-4 h-4 stroke-[2.2]" />
              </div>
              <p className="font-sans text-xs font-bold leading-snug max-w-[270px] opacity-85">
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
                className="max-h-[190px] overflow-y-auto divide-y divide-black/[0.04] dark:divide-white/[0.06] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-500/30"
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
                        className={`px-3 py-2 flex items-center justify-between gap-2 text-xs transition-colors ${
                          isMe
                            ? darkMode
                              ? "bg-[#312e81]/35"
                              : "bg-[#EEF2FF]"
                            : ""
                        }`}
                      >
                        {/* Left: Rank Badge + Name */}
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`min-w-[32px] h-6 px-1.5 rounded-lg font-mono font-black text-[11px] inline-flex items-center justify-center gap-0.5 shrink-0 shadow-none ${getRankBadgeClasses(
                              rank,
                              darkMode
                            )}`}
                          >
                            {isTopThree && (
                              <Trophy className="w-2.5 h-2.5 shrink-0 stroke-[2.4]" />
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
                              className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase shrink-0 ${
                                darkMode
                                  ? "bg-zinc-800 text-zinc-400"
                                  : "bg-black/5 text-slate-500"
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
                  className={`px-3 py-2 flex items-center justify-between gap-2 border-t ${
                    darkMode
                      ? "bg-[#1e1b4b]/55 border-white/10 text-zinc-100"
                      : "bg-[#E0E7FF]/80 border-black/5 text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`min-w-[42px] h-8 px-2 rounded-xl font-mono text-lg font-black inline-flex items-center justify-center shrink-0 shadow-none ${
                        darkMode
                          ? "bg-[#312e81] text-[#c7d2fe] border border-indigo-400/25"
                          : "bg-[#C7D2FE] text-[#312E81] border border-indigo-500/15"
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
            className={`py-3 px-3 rounded-2xl shadow-none font-sans font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer transition-transform active:scale-[0.98] ${
              darkMode
                ? "bg-[#0369a1] hover:bg-[#0284c7] text-white border border-white/10"
                : "bg-[#BAE6FD] hover:bg-[#7DD3FC] text-[#0C4A6E] border border-black/5"
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
            className={`py-3 px-3 rounded-2xl shadow-none font-sans font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer transition-transform active:scale-[0.98] ${
              darkMode
                ? "bg-[#312e81]/80 hover:bg-[#3730a3] text-[#c7d2fe] border border-white/10"
                : "bg-[#E0E7FF] hover:bg-[#C7D2FE] text-[#3730A3] border border-black/5"
            }`}
          >
            <Eye className="w-4 h-4 stroke-[2.2] shrink-0" />
            <span className="truncate">
              {td("daily.reviewBoardBtn", "Review Board")}
            </span>
          </button>
        </div>

        {/* Full-Width Subtle Tertiary Button: Calendar & History (Phase 2 Stub) */}
        <button
          type="button"
          onClick={handleCalendarHistoryClick}
          className={`w-full mt-2 py-2.5 px-3 rounded-2xl shadow-none font-sans font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors active:scale-[0.99] ${
            darkMode
              ? "bg-[#18181b] hover:bg-zinc-800 text-zinc-300 border border-white/10"
              : "bg-white/80 hover:bg-black/[0.04] text-slate-600 border border-black/5"
          }`}
        >
          <Calendar className="w-3.5 h-3.5 stroke-[2.2] shrink-0" />
          <span>
            {calendarStubNotice
              ? td("daily.calendarComingSoon", "Calendar & History — Coming in Phase 2")
              : td("daily.calendarHistoryBtn", "View Calendar & History")}
          </span>
        </button>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
