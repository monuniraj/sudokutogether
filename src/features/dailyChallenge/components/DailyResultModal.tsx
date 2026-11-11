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
 * - All user-facing strings wrapped with `t(...)` across all 9 supported languages.
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
  Globe,
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
  roomRaceData?: {
    roomCode: string;
    participants: Array<{
      uid: string;
      displayName: string;
      timeSec: number | null;
      mistakes: number;
      isFailed?: boolean;
      isWon?: boolean;
      isExhibition?: boolean;
      isCurrentUser?: boolean;
    }>;
  };
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
  roomRaceData,
}) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const hasRoomRace = Boolean(roomRaceData?.participants?.length);
  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState<"room" | "global">(
    roomRaceData?.participants?.length ? "room" : "global"
  );
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

  useEffect(() => {
    if (!isOpen) return;
    setActiveLeaderboardTab(roomRaceData?.participants?.length ? "room" : "global");
  }, [isOpen, roomRaceData?.roomCode]);

  const effectiveLeaderboardTab: "room" | "global" =
    hasRoomRace ? activeLeaderboardTab : "global";

  const sortedRoomParticipants = useMemo(() => {
    if (!roomRaceData?.participants?.length) return [];
    return [...roomRaceData.participants].sort((a, b) => {
      const aWon = Boolean(a.isWon) && !a.isFailed && a.timeSec !== null;
      const bWon = Boolean(b.isWon) && !b.isFailed && b.timeSec !== null;
      if (aWon !== bWon) return aWon ? -1 : 1;
      if (aWon && bWon) {
        const aTime = Number(a.timeSec ?? 999999);
        const bTime = Number(b.timeSec ?? 999999);
        if (aTime !== bTime) return aTime - bTime;
        return Number(a.mistakes ?? 0) - Number(b.mistakes ?? 0);
      }
      const aFailed = Boolean(a.isFailed);
      const bFailed = Boolean(b.isFailed);
      if (aFailed !== bFailed) return aFailed ? 1 : -1;
      return Number(a.mistakes ?? 0) - Number(b.mistakes ?? 0);
    });
  }, [roomRaceData?.participants]);

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
    if (!isOpen || effectiveLeaderboardTab !== "global") return;
    const raf = window.requestAnimationFrame(() => {
      evaluateUserRowVisibility();
    });
    return () => window.cancelAnimationFrame(raf);
  }, [isOpen, leaderboard, effectiveLeaderboardTab, evaluateUserRowVisibility]);

  const handleShareChallenge = useCallback(async () => {
    const formattedTime = formatDurationMMSS(elapsedTime);
    const statusLabel =
      status === "COMPLETED"
        ? t("dailySolvedIn", { time: formattedTime })
        : status === "FAILED"
          ? t("dailyChallengeFailed")
          : t("dailyInProgress");

    const shareUrl = "https://sudokusync.com";
    const shareTitle = t("dailyShareTitle", { date });
    const shareText = [
      shareTitle,
      `${t("difficultyLabel")}: ${t(difficulty.toLowerCase())}`,
      statusLabel,
      `${t("errsLabel")}: ${mistakes}/3`,
      `${t("dailyStreakLabel")}: ${stats.currentStreak}`,
      shareUrl,
    ].join("\n");

    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({
          title: shareTitle,
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
  }, [date, difficulty, elapsedTime, mistakes, stats.currentStreak, status, t]);

  const isCompleted = status === "COMPLETED";
  const isFailed = status === "FAILED";

  const myRank = leaderboard.userRank;
  const effectiveUserEntry: DailyLeaderboardEntry | null = useMemo(() => {
    if (!leaderboard.isAuthenticated) return null;
    if (leaderboard.userEntry) return leaderboard.userEntry;
    if (isCompleted) {
      return {
        uid: resolvedUid || "you",
        playerName: t("dailyYouLabel"),
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
    t,
    elapsedTime,
    mistakes,
  ]);

  if (!isOpen || typeof document === "undefined") return null;

  const headerPillClasses = isCompleted
    ? darkMode
      ? "bg-[#78350F]/40 text-[#FBBF24]"
      : "bg-[#FEF3C7] text-[#B45309]"
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
                aria-label={t("dailyBackToCalendarBtn")}
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
                  ? t("dailyCompletedTitle")
                  : isFailed
                    ? t("dailyFailedTitle")
                    : t("dailyStatsTitle")}
              </h2>

              <div className="flex items-center flex-wrap gap-1.5 mt-1">
                <button
                  type="button"
                  onClick={onOpenCalendarHistory}
                  disabled={!onOpenCalendarHistory}
                  className={`inline-flex items-center gap-1 shrink-0 whitespace-nowrap px-2 py-0.5 rounded-full border-0 shadow-none font-mono text-[11px] font-bold transition-colors ${
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
                  className={`inline-flex items-center shrink-0 whitespace-nowrap px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase border-0 shadow-none ${getDifficultyBadgeClasses(
                    difficulty,
                    darkMode
                  )}`}
                >
                  {t(difficulty.toLowerCase())}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t("closeBtn")}
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
            className={`rounded-2xl border-0 shadow-none px-1.5 sm:px-2.5 py-2 flex flex-col items-center justify-center min-w-0 ${
              darkMode
                ? "bg-[#222225] text-zinc-100"
                : "bg-[#F4EFE6] text-[#1C1917]"
            }`}
          >
            <div
              className={`flex items-center justify-center gap-1 max-w-full min-w-0 text-[10px] font-bold uppercase tracking-tight sm:tracking-wider ${
                darkMode ? "text-zinc-400" : "text-stone-600"
              }`}
            >
              <Clock
                className={`w-3 h-3 shrink-0 stroke-[2.3] ${
                  darkMode ? "text-sky-400" : "text-[#0369A1]"
                }`}
              />
              <span className="truncate">{t("timeLabel")}</span>
            </div>
            <div className="font-mono font-black text-sm sm:text-base leading-tight mt-0.5">
              {formatDurationMMSS(elapsedTime)}
            </div>
            <span
              className={`font-mono text-[10px] font-semibold mt-0.5 leading-none max-w-full truncate ${
                darkMode ? "text-zinc-400" : "text-stone-600"
              }`}
            >
              {t("dailyPbShort")}:{" "}
              {stats.bestTimeSeconds !== null
                ? formatDurationMMSS(stats.bestTimeSeconds)
                : "--:--"}
            </span>
          </div>

          {/* Box 2: Mistakes */}
          <div
            className={`rounded-2xl border-0 shadow-none px-1.5 sm:px-2.5 py-2 flex flex-col items-center justify-center min-w-0 ${
              darkMode
                ? "bg-[#222225] text-zinc-100"
                : "bg-[#F4EFE6] text-[#1C1917]"
            }`}
          >
            <div
              className={`flex items-center justify-center gap-1 max-w-full min-w-0 text-[10px] font-bold uppercase tracking-tight sm:tracking-wider ${
                darkMode ? "text-zinc-400" : "text-stone-600"
              }`}
            >
              <AlertCircle
                className={`w-3 h-3 shrink-0 stroke-[2.3] ${
                  darkMode ? "text-rose-400" : "text-[#BE123C]"
                }`}
              />
              <span className="truncate">{t("errsLabel")}</span>
            </div>
            <div className="font-mono font-black text-sm sm:text-base leading-tight mt-0.5">
              {mistakes} / 3
            </div>
            <span
              className={`font-sans text-[10px] font-semibold mt-0.5 leading-none max-w-full truncate ${
                darkMode ? "text-zinc-400" : "text-stone-600"
              }`}
            >
              {t("dailySolvedCountShort", { count: stats.totalCompleted })}
            </span>
          </div>

          {/* Box 3: Streak (explicit Streak header to avoid confusion with Rank) */}
          <div
            className={`rounded-2xl border-0 shadow-none px-1.5 sm:px-2.5 py-2 flex flex-col items-center justify-center min-w-0 ${
              darkMode
                ? "bg-[#222225] text-zinc-100"
                : "bg-[#F4EFE6] text-[#1C1917]"
            }`}
          >
            <div
              className={`flex items-center justify-center gap-1 max-w-full min-w-0 text-[10px] font-bold uppercase tracking-tight sm:tracking-wider ${
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
              <span className="truncate">{t("dailyStreakLabel")}</span>
            </div>
            <div className="font-mono font-black text-sm sm:text-base leading-tight mt-0.5">
              {stats.currentStreak}
            </div>
            <span
              className={`font-mono text-[10px] font-semibold mt-0.5 leading-none max-w-full truncate ${
                darkMode ? "text-zinc-400" : "text-stone-600"
              }`}
            >
              {t("dailyBestShort", { count: stats.longestStreak })}
            </span>
          </div>
        </div>

        {/* Multiplayer-Style Leaderboard Container: Tabbed (Room Race vs Global Top 20) or Pure Global Top 20 */}
        <div
          className={`w-full rounded-2xl border-0 shadow-none overflow-hidden mb-3.5 ${
            darkMode
              ? "bg-[#222225] text-zinc-100"
              : "bg-[#F4EFE6] text-[#1C1917]"
          }`}
        >
          {/* Leaderboard Section Header */}
          {hasRoomRace ? (
            <div
              className={`p-1.5 flex items-center gap-1.5 border-0 ${
                darkMode ? "bg-[#27272a]" : "bg-[#EDE6DA]"
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveLeaderboardTab("room")}
                className={`flex-1 min-w-0 py-1.5 px-2.5 rounded-xl border-0 shadow-none text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  effectiveLeaderboardTab === "room"
                    ? darkMode
                      ? "bg-[#3f3f46] text-zinc-100"
                      : "bg-white text-[#1C1917]"
                    : darkMode
                      ? "bg-transparent text-zinc-400 hover:text-zinc-200"
                      : "bg-transparent text-stone-600 hover:text-[#1C1917]"
                }`}
              >
                <Users className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">
                  {t("dailyRoomRaceTab", {
                    count: roomRaceData?.participants?.length ?? 0,
                  })}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveLeaderboardTab("global")}
                className={`flex-1 min-w-0 py-1.5 px-2.5 rounded-xl border-0 shadow-none text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  effectiveLeaderboardTab === "global"
                    ? darkMode
                      ? "bg-[#3f3f46] text-zinc-100"
                      : "bg-white text-[#1C1917]"
                    : darkMode
                      ? "bg-transparent text-zinc-400 hover:text-zinc-200"
                      : "bg-transparent text-stone-600 hover:text-[#1C1917]"
                }`}
              >
                <Globe className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{t("dailyGlobalTop20Tab")}</span>
              </button>
            </div>
          ) : (
            <div
              className={`px-3.5 py-2 flex items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-wider border-0 ${
                darkMode
                  ? "bg-[#27272a] text-zinc-300"
                  : "bg-[#EDE6DA] text-stone-600"
              }`}
            >
              <span className="inline-flex items-center gap-1.5 min-w-0">
                <Trophy
                  className={`w-3.5 h-3.5 shrink-0 ${
                    darkMode ? "text-[#FBBF24]" : "text-[#B45309]"
                  }`}
                />
                <span className="truncate">
                  {t("dailyGlobalLeaderboardTitle")}
                </span>
              </span>
              <span className="font-mono text-[10px] opacity-75 shrink-0 whitespace-nowrap">
                {t("dailyTop20Badge")}
              </span>
            </div>
          )}

          {effectiveLeaderboardTab === "room" && hasRoomRace ? (
            <div className="max-h-[190px] overflow-y-auto p-1.5 flex flex-col gap-1 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-500/35">
              {sortedRoomParticipants.map((p, idx) => {
                const isWonRow =
                  Boolean(p.isWon) && !p.isFailed && p.timeSec !== null;
                const wonRank = idx + 1;
                const isTopThree = isWonRow && wonRank <= 3;

                return (
                  <div
                    key={p.uid || `${p.displayName}-${idx}`}
                    className={`min-w-0 flex items-center justify-between gap-1.5 py-2 px-3 rounded-xl border-0 shadow-none text-xs transition-colors ${
                      p.isCurrentUser
                        ? darkMode
                          ? "bg-[#2e2a44] text-zinc-100"
                          : "bg-[#E0E7FF] text-[#1E1B4B]"
                        : darkMode
                          ? "bg-[#1b1b1e] text-zinc-200"
                          : "bg-white/85 text-[#1C1917]"
                    }`}
                  >
                    {/* Left: Rank + Name + Badges */}
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <span
                        className={`min-w-[30px] h-6 px-1.5 rounded-lg font-mono font-black text-[11px] inline-flex items-center justify-center gap-0.5 shrink-0 border-0 shadow-none ${
                          isWonRow
                            ? getRankBadgeClasses(wonRank, darkMode)
                            : p.isFailed
                              ? darkMode
                                ? "bg-rose-500/20 text-rose-300"
                                : "bg-rose-100 text-rose-700"
                              : darkMode
                                ? "bg-amber-500/20 text-amber-300"
                                : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {isTopThree && (
                          <Trophy
                            className={`w-2.5 h-2.5 shrink-0 stroke-[2.4] ${
                              darkMode ? "text-[#FBBF24]" : "text-[#B45309]"
                            }`}
                          />
                        )}
                        <span>{isWonRow ? `#${wonRank}` : "-"}</span>
                      </span>

                      <span className="truncate font-semibold min-w-0">
                        {p.displayName}
                      </span>

                      {p.isCurrentUser && (
                        <span
                          className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase shrink-0 border-0 shadow-none ${
                            darkMode
                              ? "bg-purple-500/25 text-purple-200"
                              : "bg-[#EDE9FE] text-[#6B21A8]"
                          }`}
                        >
                          {t("youBadge")}
                        </span>
                      )}

                      {p.isExhibition && (
                        <span
                          className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold shrink-0 border-0 shadow-none ${
                            darkMode
                              ? "bg-[#78350f]/75 text-[#fde68a]"
                              : "bg-[#FEF3C7] text-[#92400E]"
                          }`}
                        >
                          <span className="sm:hidden">
                            {t("dailyExhibitionShortBadge")}
                          </span>
                          <span className="hidden sm:inline">
                            {t("dailyExhibitionFullBadge")}
                          </span>
                        </span>
                      )}
                    </div>

                    {/* Right: Time / Solving / Failed */}
                    <div className="shrink-0 font-mono text-[11px] font-bold whitespace-nowrap">
                      {p.isFailed ? (
                        <span
                          className={
                            darkMode ? "text-rose-400" : "text-rose-600"
                          }
                        >
                          {t("dailyRoomFailedErrors", {
                            count: p.mistakes ?? 0,
                          })}
                        </span>
                      ) : isWonRow ? (
                        <span>{formatDurationMMSS(p.timeSec as number)}</span>
                      ) : (
                        <span
                          className={
                            darkMode ? "text-amber-300" : "text-amber-700"
                          }
                        >
                          {t("statusSolving")}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <>
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
                    {t("dailySignInLeaderboardPrompt")}
                  </p>
                </div>
              ) : isLoadingLeaderboard ? (
                <div className="h-[130px] flex items-center justify-center gap-2 text-xs font-semibold opacity-70">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t("dailyLoadingLeaderboard")}</span>
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
                        {t("dailyNoCompletionsYet")}
                      </div>
                    ) : (
                      leaderboard.entries.map((entry, idx) => {
                        const rank = idx + 1;
                        const isMe = Boolean(
                          resolvedUid && entry.uid === resolvedUid
                        );
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
                                      darkMode
                                        ? "text-[#FBBF24]"
                                        : "text-[#B45309]"
                                    }`}
                                  />
                                )}
                                <span>#{rank}</span>
                              </span>

                              <span className="font-sans font-bold truncate">
                                {isMe
                                  ? `${entry.playerName} (${t("dailyYouLabel")})`
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
                                  {t("dailyGuestTag")}
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
                            {t("dailyYouLabel")}
                          </span>
                          <span className="font-sans text-[10px] font-semibold opacity-70 block leading-tight truncate">
                            {t("dailyYourStandingLabel")}
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
            </>
          )}
        </div>

        {/* 2-Column Side-by-Side Primary Actions: Share Challenge & Review Board */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleShareChallenge}
            className={`py-3 px-2.5 sm:px-3 min-w-0 rounded-2xl border-0 shadow-none font-sans font-black text-[11px] sm:text-sm whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer transition-transform active:scale-[0.98] ${
              darkMode
                ? "bg-[#0c4a6e] hover:bg-[#075985] text-[#bae6fd]"
                : "bg-[#BAE6FD] hover:bg-[#7DD3FC] text-[#0C4A6E]"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 stroke-[2.5] shrink-0" />
                <span className="truncate">
                  {t("dailyCopiedShare")}
                </span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 stroke-[2.2] shrink-0" />
                <span className="truncate">
                  {t("dailyShareChallengeBtn")}
                </span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onReviewBoard}
            className={`py-3 px-2.5 sm:px-3 min-w-0 rounded-2xl border-0 shadow-none font-sans font-bold text-[11px] sm:text-sm whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.98] ${
              darkMode
                ? "bg-[#2e1065] hover:bg-[#3b0764] text-[#e9d5ff]"
                : "bg-[#F3E8FF] hover:bg-[#E9D5FF] text-[#6B21A8]"
            }`}
          >
            <Eye className="w-4 h-4 stroke-[2.2] shrink-0" />
            <span className="truncate">
              {t("dailyReviewBoardBtn")}
            </span>
          </button>
        </div>

        {/* Full-Width Tactile Daily Pill: Calendar & History */}
        <button
          type="button"
          onClick={onOpenCalendarHistory}
          disabled={!onOpenCalendarHistory}
          className={`w-full min-w-0 mt-2 py-2.5 px-3 rounded-2xl border-0 shadow-none font-sans font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] ${
            onOpenCalendarHistory ? "cursor-pointer" : "opacity-60 cursor-default"
          } ${
            darkMode
              ? "bg-[#451a03]/85 hover:bg-[#78350f] text-[#fde68a]"
              : "bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E]"
          }`}
        >
          <Calendar className="w-3.5 h-3.5 stroke-[2.2] shrink-0" />
          <span className="truncate">{t("dailyCalendarHistoryBtn")}</span>
        </button>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
