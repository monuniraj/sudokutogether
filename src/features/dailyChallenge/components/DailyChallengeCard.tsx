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
 * - All user-facing strings wrapped with `t(...)` across all 9 supported languages.
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
  /** Optional handler to navigate directly to the dedicated `/daily-challenge` screen */
  onOpenDailyScreen?: () => void;
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

function getCompletedCtaLightTextClass(difficulty: DailyDifficulty): string {
  switch (difficulty) {
    case "EASY":
      return "text-[#065F46]";
    case "MEDIUM":
      return "text-[#78350F]";
    case "HARD":
      return "text-[#5B21B6]";
    case "EXPERT":
      return "text-[#9F1239]";
    case "MASTER":
      return "text-[#3730A3]";
    default:
      return "text-[#78350F]";
  }
}

export const DailyChallengeCard: React.FC<DailyChallengeCardProps> = ({
  uid,
  darkMode = false,
  compact = false,
  onStartDailyChallenge,
  refreshTrigger = 0,
  onModalOpenChange,
  onOpenDailyScreen,
}) => {
  const { t } = useTranslation();
  const normalizedUid =
    uid &&
    typeof uid === "string" &&
    uid.trim() &&
    uid.trim().toLowerCase() !== "guest" &&
    uid.trim().toLowerCase() !== "guest_anon" &&
    !uid.trim().toLowerCase().startsWith("guest_")
      ? uid.trim()
      : null;
  const daily = useDailyChallenge({
    uid: normalizedUid,
    enableTimer: false,
    refreshTrigger,
  });
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

  // Sync live local vault snapshot strictly for the active identity (`normalizedUid`)
  const [liveSnapshot, setLiveSnapshot] = useState<{
    uid: string | null;
    progress: DailyChallengeProgress | null;
    stats: DailyStats;
  }>(() => ({
    uid: normalizedUid,
    progress: getDailyProgress(daily.date, normalizedUid),
    stats: getDailyStats(normalizedUid),
  }));

  useEffect(() => {
    setIsCalendarOpen(false);
    setInspectedResult(null);
    setLiveSnapshot({
      uid: normalizedUid,
      progress: getDailyProgress(daily.date, normalizedUid),
      stats: getDailyStats(normalizedUid),
    });
  }, [normalizedUid]);

  useEffect(() => {
    setLiveSnapshot({
      uid: normalizedUid,
      progress: getDailyProgress(daily.date, normalizedUid),
      stats: getDailyStats(normalizedUid),
    });
  }, [daily.date, daily.status, daily.elapsedTime, daily.mistakes, daily.stats, normalizedUid, refreshTrigger]);

  // Synchronously resolve target-identity vault snapshot on the exact render of an identity switch
  const currentSnapshot =
    liveSnapshot.uid === normalizedUid
      ? liveSnapshot
      : {
          uid: normalizedUid,
          progress: getDailyProgress(daily.date, normalizedUid),
          stats: getDailyStats(normalizedUid),
        };

  const isHookSyncedForUid =
    !daily.isLoading && daily.loadedUid === normalizedUid;
  const dayRecord = currentSnapshot.stats.recordsByDate[daily.date];

  const effectiveStatus: DailyChallengeStatus =
    currentSnapshot.progress?.status ??
    (dayRecord &&
    (dayRecord.status === "COMPLETED" || dayRecord.status === "FAILED")
      ? dayRecord.status
      : isHookSyncedForUid
        ? daily.status
        : "NOT_STARTED");

  const effectiveElapsed: number =
    currentSnapshot.progress?.elapsedSeconds ??
    (dayRecord &&
    (dayRecord.status === "COMPLETED" || dayRecord.status === "FAILED")
      ? dayRecord.timeSeconds
      : isHookSyncedForUid
        ? daily.elapsedTime
        : 0);

  const effectiveMistakes: number =
    currentSnapshot.progress?.mistakesCount ??
    (dayRecord &&
    (dayRecord.status === "COMPLETED" || dayRecord.status === "FAILED")
      ? dayRecord.mistakes
      : isHookSyncedForUid
        ? daily.mistakes
        : 0);

  const effectiveStats = currentSnapshot.stats;

  const launchMasterBoard = useCallback(
    (options?: {
      date?: string;
      reviewOnly?: boolean;
      isArchive?: boolean;
      fallbackSolvedOnReview?: boolean;
    }) => {
      const targetDate = options?.date ?? daily.date;
      const generated = generateDailyPuzzle(targetDate);
      const latestProgress = getDailyProgress(targetDate, normalizedUid);
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
    [daily.date, normalizedUid, onStartDailyChallenge]
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
      if (onOpenDailyScreen) {
        setInspectedResult(null);
        setIsCalendarOpen(false);
        onOpenDailyScreen();
        return;
      }
      setCalendarAnchorDate(daily.date);
      setInspectedResult(null);
      setIsCalendarOpen(true);
    },
    [daily.date, onOpenDailyScreen]
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
        uid={normalizedUid}
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
        uid={normalizedUid}
        darkMode={darkMode}
        initialDate={calendarAnchorDate || daily.date}
        refreshTrigger={refreshTrigger}
      />
    </>
  );

  const formattedTimer = formatDurationMMSS(effectiveElapsed);

  const ctaLabel =
    effectiveStatus === "IN_PROGRESS"
      ? `${t("dailyResumeCta")} (${formattedTimer})`
      : effectiveStatus === "COMPLETED"
        ? t("dailyCompletedCta")
        : effectiveStatus === "FAILED"
          ? t("dailyFailedCta")
          : t("dailyPlayTodayCta");

  const completedLightTextClass = getCompletedCtaLightTextClass(daily.difficulty);

  const ctaButtonClasses =
    effectiveStatus === "COMPLETED"
      ? darkMode
        ? "bg-[#240d02] hover:bg-[#1a0901] text-[#fde68a] shadow-none"
        : `bg-white hover:bg-white/95 shadow-sm ${completedLightTextClass}`
      : effectiveStatus === "FAILED"
        ? darkMode
          ? "bg-rose-950 hover:bg-rose-900 shadow-none text-rose-200"
          : "bg-[#FECDD3] hover:bg-[#FDA4AF] shadow-none text-[#9F1239]"
        : darkMode
          ? "bg-[#b45309] hover:bg-[#d97706] shadow-none text-[#fef3c7]"
          : "bg-[#FCD34D] hover:bg-[#FBBF24] shadow-none text-[#78350F]";

  if (compact) {
    return (
      <>
        <button
          type="button"
          id="desktop-daily-challenge-btn"
          onClick={openCalendar}
          aria-label={t("dailyOpenCalendarBtn")}
          title={t("dailyOpenCalendarBtn")}
          className={`flex-1 min-w-0 h-[38px] px-2.5 rounded-xl border-0 shadow-none outline-none flex items-center justify-between gap-1.5 transition-all duration-150 cursor-pointer active:scale-[0.98] ${
            darkMode
              ? "bg-[#451a03]/85 hover:bg-[#78350f]/90 text-[#fde68a]"
              : "bg-[#FEF3C7]/95 hover:bg-[#FDE68A]/95 text-[#92400E]"
          }`}
        >
          <span className="inline-flex items-center gap-1.5 min-w-0">
            <Calendar className="w-3.5 h-3.5 shrink-0 stroke-[2.2]" />
            <span className="font-sans font-bold text-[11px] tracking-tight truncate leading-none">
              {t("dailyChallengeLabel")}
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
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-sans font-black text-xs sm:text-sm leading-none truncate">
                  {t("dailyChallengeLabel")}
                </span>
                <span
                  className={`inline-flex items-center shrink-0 whitespace-nowrap px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase border-0 shadow-none ${getDifficultyBadgeClasses(
                    daily.difficulty,
                    darkMode
                  )}`}
                >
                  {t(daily.difficulty.toLowerCase())}
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
              aria-label={t("dailyOpenCalendarBtn")}
              title={t("dailyOpenCalendarBtn")}
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
              title={t("dailyCurrentStreakLabel")}
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
          className={`w-full min-w-0 py-2.5 px-3 sm:px-3.5 rounded-xl border-0 flex items-center justify-between gap-2 font-sans font-black text-xs sm:text-sm whitespace-nowrap transition-all duration-150 cursor-pointer active:scale-[0.98] ${ctaButtonClasses}`}
        >
          <span className="inline-flex items-center gap-2 flex-1 min-w-0">
            {effectiveStatus === "FAILED" ? (
              <XCircle className="w-4 h-4 shrink-0 stroke-[2.3]" />
            ) : effectiveStatus !== "COMPLETED" ? (
              <Play className="w-4 h-4 shrink-0 stroke-[2.3]" />
            ) : null}
            <span className="truncate">{ctaLabel}</span>
          </span>
          <ChevronRight className="w-4 h-4 shrink-0 stroke-[2.4] opacity-80" />
        </button>
      </div>

      {sharedModals}
    </>
  );
};
