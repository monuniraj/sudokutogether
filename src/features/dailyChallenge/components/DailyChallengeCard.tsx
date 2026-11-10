/**
 * Self-Contained Daily Challenge Home Screen Card (Milestone 4).
 *
 * Strict UI & Architecture compliance:
 * - Reads live state from `useDailyChallenge({ uid })`.
 * - Routes "Play Today" / "Resume" directly into the master `App.tsx` game board
 *   with zero duplicate board modals.
 * - Opens `DailyResultModal` when viewing completed/failed results & streak stats.
 * - Pastel borderless, shadowless surfaces with smooth curved corners.
 * - Strictly Lucide React SVG vector icons (zero emojis).
 * - All user-facing strings wrapped with `t('daily.<key>', 'English Fallback')`.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Calendar,
  ChevronRight,
  Flame,
  Play,
  Trophy,
  XCircle,
} from "lucide-react";
import { useTranslation } from "../../../i18n/useTranslation";
import { useDailyChallenge } from "../hooks/useDailyChallenge";
import { generateDailyPuzzle } from "../services/dailyGenerator";
import { getDailyProgress, getDailyStats } from "../services/dailyStorage";
import type {
  DailyChallengeProgress,
  DailyChallengeStatus,
  DailyDifficulty,
  DailyStats,
} from "../types/daily.types";
import { DailyCalendarModal } from "./DailyCalendarModal";
import { DailyResultModal } from "./DailyResultModal";

export interface DailyChallengeLaunchPayload {
  date: string;
  difficulty: DailyDifficulty;
  puzzle: number[][];
  solved: number[][];
  seed: number;
  savedProgress: DailyChallengeProgress | null;
  reviewOnly?: boolean;
  isArchive?: boolean;
  fallbackSolvedOnReview?: boolean;
}

export interface DailyChallengeCardProps {
  /** Authenticated Firebase UID, or null/undefined for guest sessions */
  uid?: string | null;
  /** Dark mode flag from App shell */
  darkMode?: boolean;
  /** Optional compact pill layout for tight side-by-side desktop slots */
  compact?: boolean;
  /** Callback to launch today's Daily Challenge on the master App.tsx board */
  onStartDailyChallenge?: (payload: DailyChallengeLaunchPayload) => void;
  /** Optional counter incremented by App.tsx whenever daily vault state updates */
  refreshTrigger?: number;
  /** Notifies parent App shell whenever Calendar or Result modal opens/closes (for timer auto-pause) */
  onModalOpenChange?: (isOpen: boolean) => void;
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

export const DailyChallengeCard: React.FC<DailyChallengeCardProps> = ({
  uid,
  darkMode = false,
  compact = false,
  onStartDailyChallenge,
  refreshTrigger = 0,
  onModalOpenChange,
}) => {
  const { t } = useTranslation();
  const daily = useDailyChallenge({ uid, enableTimer: false });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarAnchorDate, setCalendarAnchorDate] = useState<string | undefined>(undefined);
  const [inspectedResult, setInspectedResult] = useState<{
    date: string;
    difficulty: DailyDifficulty;
    status: DailyChallengeStatus;
    elapsedTime: number;
    mistakes: number;
    stats: DailyStats;
    fromCalendar: boolean;
  } | null>(null);

  const onModalOpenChangeRef = useRef(onModalOpenChange);
  onModalOpenChangeRef.current = onModalOpenChange;

  useEffect(() => {
    onModalOpenChangeRef.current?.(isCalendarOpen || Boolean(inspectedResult));
  }, [isCalendarOpen, inspectedResult]);

  useEffect(() => {
    return () => {
      onModalOpenChangeRef.current?.(false);
    };
  }, []);

  // Sync live local vault snapshot whenever App.tsx updates daily progress/completion
  const [liveSnapshot, setLiveSnapshot] = useState<{
    progress: DailyChallengeProgress | null;
    stats: DailyStats;
  }>(() => ({
    progress: getDailyProgress(daily.date, uid),
    stats: getDailyStats(uid),
  }));

  useEffect(() => {
    setLiveSnapshot({
      progress: getDailyProgress(daily.date, uid),
      stats: getDailyStats(uid),
    });
  }, [daily.date, daily.status, daily.elapsedTime, daily.stats, uid, refreshTrigger]);

  const effectiveStatus = liveSnapshot.progress?.status ?? daily.status;
  const effectiveElapsed =
    liveSnapshot.progress?.elapsedSeconds ?? daily.elapsedTime;
  const effectiveMistakes =
    liveSnapshot.progress?.mistakesCount ?? daily.mistakes;
  const effectiveStats = liveSnapshot.stats;

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

  const launchMasterBoard = useCallback(
    (options?: {
      date?: string;
      reviewOnly?: boolean;
      isArchive?: boolean;
      fallbackSolvedOnReview?: boolean;
    }) => {
      const targetDate = options?.date ?? daily.date;
      const generated = generateDailyPuzzle(targetDate);
      const latestProgress = getDailyProgress(targetDate, uid);
      if (onStartDailyChallenge) {
        onStartDailyChallenge({
          date: generated.date,
          difficulty: generated.difficulty,
          puzzle: generated.puzzle,
          solved: generated.solved,
          seed: generated.seed,
          savedProgress: latestProgress,
          reviewOnly: options?.reviewOnly,
          isArchive: options?.isArchive ?? targetDate < daily.date,
          fallbackSolvedOnReview: options?.fallbackSolvedOnReview,
        });
      }
    },
    [daily.date, uid, onStartDailyChallenge]
  );

  const handlePlayOrResume = useCallback(() => {
    if (effectiveStatus === "COMPLETED" || effectiveStatus === "FAILED") {
      setInspectedResult({
        date: daily.date,
        difficulty: daily.difficulty,
        status: effectiveStatus,
        elapsedTime: effectiveElapsed,
        mistakes: effectiveMistakes,
        stats: effectiveStats,
        fromCalendar: false,
      });
      return;
    }
    launchMasterBoard({ date: daily.date, reviewOnly: false, isArchive: false });
  }, [
    effectiveStatus,
    daily.date,
    daily.difficulty,
    effectiveElapsed,
    effectiveMistakes,
    effectiveStats,
    launchMasterBoard,
  ]);

  const openCalendar = useCallback(
    (e?: React.SyntheticEvent) => {
      if (e) {
        e.stopPropagation();
      }
      setCalendarAnchorDate(daily.date);
      setInspectedResult(null);
      setIsCalendarOpen(true);
    },
    [daily.date]
  );

  const sharedModals = (
    <>
      <DailyResultModal
        isOpen={Boolean(inspectedResult)}
        onClose={() => setInspectedResult(null)}
        onReviewBoard={() => {
          const targetDate = inspectedResult?.date ?? daily.date;
          const isComp = inspectedResult?.status === "COMPLETED";
          setInspectedResult(null);
          launchMasterBoard({
            date: targetDate,
            reviewOnly: true,
            fallbackSolvedOnReview: isComp,
          });
        }}
        onOpenCalendarHistory={() => {
          setCalendarAnchorDate(inspectedResult?.date ?? daily.date);
          setInspectedResult(null);
          setIsCalendarOpen(true);
        }}
        onBackToCalendar={
          inspectedResult?.fromCalendar
            ? () => {
                setCalendarAnchorDate(inspectedResult.date);
                setInspectedResult(null);
                setIsCalendarOpen(true);
              }
            : undefined
        }
        uid={uid}
        date={inspectedResult?.date ?? daily.date}
        difficulty={inspectedResult?.difficulty ?? daily.difficulty}
        status={inspectedResult?.status ?? effectiveStatus}
        elapsedTime={inspectedResult?.elapsedTime ?? effectiveElapsed}
        mistakes={inspectedResult?.mistakes ?? effectiveMistakes}
        stats={inspectedResult?.stats ?? effectiveStats}
        darkMode={darkMode}
      />

      <DailyCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        onLaunchDayPuzzle={(payload) => {
          setIsCalendarOpen(false);
          onStartDailyChallenge?.(payload);
        }}
        onInspectDayResult={({ date: inspectedDate, record, stats }) => {
          setCalendarAnchorDate(inspectedDate);
          setIsCalendarOpen(false);
          setInspectedResult({
            date: inspectedDate,
            difficulty: record.difficulty,
            status: record.status,
            elapsedTime: record.timeSeconds,
            mistakes: record.mistakes,
            stats,
            fromCalendar: true,
          });
        }}
        uid={uid}
        darkMode={darkMode}
        initialDate={calendarAnchorDate || daily.date}
        refreshTrigger={refreshTrigger}
      />
    </>
  );

  const formattedTimer = formatDurationMMSS(effectiveElapsed);

  const ctaLabel =
    effectiveStatus === "IN_PROGRESS"
      ? `${td("daily.resumeCta", "Resume")} (${formattedTimer})`
      : effectiveStatus === "COMPLETED"
        ? td("daily.completedCta", "Completed (View Stats)")
        : effectiveStatus === "FAILED"
          ? td("daily.failedCta", "Failed (View Stats)")
          : td("daily.playTodayCta", "Play Today");

  const ctaButtonClasses =
    effectiveStatus === "COMPLETED"
      ? darkMode
        ? "bg-[#064e3b] hover:bg-[#065f46] text-[#a7f3d0]"
        : "bg-[#A7F3D0] hover:bg-[#6EE7B7] text-[#065F46]"
      : effectiveStatus === "FAILED"
        ? darkMode
          ? "bg-[#881337] hover:bg-[#9f1239] text-[#fecdd3]"
          : "bg-[#FECDD3] hover:bg-[#FDA4AF] text-[#9F1239]"
        : darkMode
          ? "bg-[#b45309] hover:bg-[#d97706] text-[#fef3c7]"
          : "bg-[#FCD34D] hover:bg-[#FBBF24] text-[#78350F]";

  if (compact) {
    return (
      <>
        <button
          type="button"
          id="desktop-daily-challenge-btn"
          onClick={openCalendar}
          aria-label={td("daily.openCalendarBtn", "Open Daily Calendar")}
          title={td("daily.openCalendarBtn", "Open Daily Calendar")}
          className={`flex-1 min-w-0 h-[38px] px-2.5 rounded-xl border-0 shadow-none outline-none flex items-center justify-between gap-1.5 transition-all duration-150 cursor-pointer active:scale-[0.98] ${
            darkMode
              ? "bg-[#451a03]/85 hover:bg-[#78350f]/90 text-[#fde68a]"
              : "bg-[#FEF3C7]/95 hover:bg-[#FDE68A]/95 text-[#92400E]"
          }`}
        >
          <span className="inline-flex items-center gap-1.5 min-w-0">
            <Calendar className="w-3.5 h-3.5 shrink-0 stroke-[2.2]" />
            <span className="font-sans font-bold text-[11px] tracking-tight truncate leading-none">
              {td("daily.cardTitle", "Daily Challenge")}
            </span>
          </span>
          <span className="inline-flex items-center gap-1 shrink-0 font-mono text-[10px] font-black opacity-85">
            <Flame className="w-3 h-3 shrink-0" />
            <span>{effectiveStats.currentStreak}</span>
          </span>
        </button>

        {sharedModals}
      </>
    );
  }

  return (
    <>
      <div
        id="home-daily-challenge-card"
        onClick={openCalendar}
        className={`w-full rounded-2xl border-0 shadow-none p-3.5 sm:p-4 transition-colors duration-150 cursor-pointer select-none ${
          darkMode
            ? "bg-[#451a03]/75 hover:bg-[#451a03]/95 text-[#fde68a]"
            : "bg-[#FEF3C7]/80 hover:bg-[#FEF3C7] text-[#92400E]"
        }`}
      >
        {/* Top Row: Date + Difficulty Badge | Calendar Trigger + Current Streak */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`w-7 h-7 rounded-xl border-0 shadow-none flex items-center justify-center shrink-0 ${
                darkMode ? "bg-black/25" : "bg-white/75"
              }`}
            >
              {effectiveStatus === "COMPLETED" ? (
                <Trophy
                  className={`w-3.5 h-3.5 stroke-[2.2] ${
                    darkMode ? "text-[#FBBF24]" : "text-[#B45309]"
                  }`}
                />
              ) : (
                <Flame className="w-3.5 h-3.5 stroke-[2.2]" />
              )}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-sans font-black text-xs sm:text-sm leading-none truncate">
                  {td("daily.cardTitle", "Daily Challenge")}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase border-0 shadow-none ${getDifficultyBadgeClasses(
                    daily.difficulty,
                    darkMode
                  )}`}
                >
                  {daily.difficulty}
                </span>
              </div>
              <span className="font-mono text-[11px] font-semibold opacity-80 block mt-0.5">
                {daily.date}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={openCalendar}
              aria-label={td("daily.openCalendarBtn", "Open Daily Calendar")}
              title={td("daily.openCalendarBtn", "Open Daily Calendar")}
              className={`w-7 h-7 rounded-full border-0 shadow-none flex items-center justify-center shrink-0 cursor-pointer transition-transform active:scale-95 ${
                darkMode
                  ? "bg-black/25 hover:bg-black/45 text-[#fde68a]"
                  : "bg-white/80 hover:bg-white text-[#92400E]"
              }`}
            >
              <Calendar className="w-4 h-4 stroke-[2.2]" />
            </button>

            {/* Streak Badge */}
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border-0 shadow-none shrink-0 font-mono text-xs font-black ${
                darkMode
                  ? "bg-black/25 text-[#fde68a]"
                  : "bg-white/80 text-[#92400E]"
              }`}
              title={td("daily.currentStreakLabel", "Current Streak")}
            >
              {effectiveStatus === "COMPLETED" ? (
                <Trophy
                  className={`w-3.5 h-3.5 shrink-0 stroke-[2.3] ${
                    darkMode ? "text-[#FBBF24]" : "text-[#B45309]"
                  }`}
                />
              ) : (
                <Flame className="w-3.5 h-3.5 shrink-0 stroke-[2.3]" />
              )}
              <span>{effectiveStats.currentStreak}</span>
            </div>
          </div>
        </div>

        {/* Bottom Dynamic Action CTA Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handlePlayOrResume();
          }}
          className={`w-full py-2.5 px-3.5 rounded-xl border-0 shadow-none flex items-center justify-between gap-2 font-sans font-black text-xs sm:text-sm transition-all duration-150 cursor-pointer active:scale-[0.98] ${ctaButtonClasses}`}
        >
          <span className="inline-flex items-center gap-2 truncate">
            {effectiveStatus === "COMPLETED" ? (
              <Trophy
                className={`w-4 h-4 shrink-0 stroke-[2.3] ${
                  darkMode ? "text-[#FBBF24]" : "text-[#B45309]"
                }`}
              />
            ) : effectiveStatus === "FAILED" ? (
              <XCircle className="w-4 h-4 shrink-0 stroke-[2.3]" />
            ) : (
              <Play className="w-4 h-4 shrink-0 stroke-[2.3]" />
            )}
            <span className="truncate">{ctaLabel}</span>
          </span>
          <ChevronRight className="w-4 h-4 shrink-0 stroke-[2.4] opacity-80" />
        </button>
      </div>

      {sharedModals}
    </>
  );
};
