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

import React, { useCallback, useEffect, useState } from "react";
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
  DailyDifficulty,
  DailyStats,
} from "../types/daily.types";
import { DailyResultModal } from "./DailyResultModal";

export interface DailyChallengeLaunchPayload {
  date: string;
  difficulty: DailyDifficulty;
  puzzle: number[][];
  solved: number[][];
  seed: number;
  savedProgress: DailyChallengeProgress | null;
  reviewOnly?: boolean;
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
}) => {
  const { t } = useTranslation();
  const daily = useDailyChallenge({ uid });
  const [isResultOpen, setIsResultOpen] = useState(false);

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
    (reviewOnly = false) => {
      const generated = generateDailyPuzzle(daily.date);
      const latestProgress = getDailyProgress(daily.date, uid);
      if (onStartDailyChallenge) {
        onStartDailyChallenge({
          date: generated.date,
          difficulty: generated.difficulty,
          puzzle: generated.puzzle,
          solved: generated.solved,
          seed: generated.seed,
          savedProgress: latestProgress,
          reviewOnly,
        });
      }
    },
    [daily.date, uid, onStartDailyChallenge]
  );

  const handleCardClick = useCallback(() => {
    if (effectiveStatus === "COMPLETED" || effectiveStatus === "FAILED") {
      setIsResultOpen(true);
      return;
    }
    launchMasterBoard(false);
  }, [effectiveStatus, launchMasterBoard]);

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
        ? "bg-[#064e3b] text-[#a7f3d0]"
        : "bg-[#D1FAE5] text-[#065F46]"
      : effectiveStatus === "FAILED"
        ? darkMode
          ? "bg-[#881337] text-[#fecdd3]"
          : "bg-[#FFE4E6] text-[#9F1239]"
        : darkMode
          ? "bg-[#92400e] text-[#fef3c7]"
          : "bg-[#FDE68A] text-[#78350F]";

  if (compact) {
    return (
      <>
        <button
          type="button"
          id="desktop-daily-challenge-btn"
          onClick={handleCardClick}
          className={`flex-1 min-w-0 h-[38px] px-2.5 rounded-xl border-0 shadow-none outline-none flex items-center justify-between gap-1.5 transition-transform duration-150 cursor-pointer active:scale-[0.98] ${
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

        <DailyResultModal
          isOpen={isResultOpen}
          onClose={() => setIsResultOpen(false)}
          onReviewBoard={() => {
            setIsResultOpen(false);
            launchMasterBoard(true);
          }}
          date={daily.date}
          difficulty={daily.difficulty}
          status={effectiveStatus}
          elapsedTime={effectiveElapsed}
          mistakes={effectiveMistakes}
          stats={effectiveStats}
          darkMode={darkMode}
        />
      </>
    );
  }

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        id="home-daily-challenge-card"
        onClick={handleCardClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleCardClick();
          }
        }}
        className={`w-full rounded-2xl border-0 shadow-none p-3.5 sm:p-4 transition-transform duration-150 cursor-pointer active:scale-[0.99] select-none ${
          darkMode
            ? "bg-[#451a03]/85 hover:bg-[#78350f]/80 text-[#fde68a]"
            : "bg-[#FEF3C7] hover:bg-[#FDE68A]/80 text-[#92400E]"
        }`}
      >
        {/* Top Row: Date + Difficulty Badge | Current Streak */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`w-7 h-7 rounded-xl border-0 shadow-none flex items-center justify-center shrink-0 ${
                darkMode ? "bg-black/25" : "bg-white/75"
              }`}
            >
              <Calendar className="w-3.5 h-3.5 stroke-[2.2]" />
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
              <Trophy className="w-3.5 h-3.5 shrink-0 stroke-[2.3]" />
            ) : (
              <Flame className="w-3.5 h-3.5 shrink-0 stroke-[2.3]" />
            )}
            <span>{effectiveStats.currentStreak}</span>
          </div>
        </div>

        {/* Bottom Dynamic CTA Pill */}
        <div
          className={`w-full py-2.5 px-3.5 rounded-xl border-0 shadow-none flex items-center justify-between gap-2 font-sans font-black text-xs sm:text-sm ${ctaButtonClasses}`}
        >
          <span className="inline-flex items-center gap-2 truncate">
            {effectiveStatus === "COMPLETED" ? (
              <Trophy className="w-4 h-4 shrink-0 stroke-[2.3]" />
            ) : effectiveStatus === "FAILED" ? (
              <XCircle className="w-4 h-4 shrink-0 stroke-[2.3]" />
            ) : (
              <Play className="w-4 h-4 shrink-0 stroke-[2.3]" />
            )}
            <span className="truncate">{ctaLabel}</span>
          </span>
          <ChevronRight className="w-4 h-4 shrink-0 stroke-[2.4] opacity-80" />
        </div>
      </div>

      <DailyResultModal
        isOpen={isResultOpen}
        onClose={() => setIsResultOpen(false)}
        onReviewBoard={() => {
          setIsResultOpen(false);
          launchMasterBoard(true);
        }}
        date={daily.date}
        difficulty={daily.difficulty}
        status={effectiveStatus}
        elapsedTime={effectiveElapsed}
        mistakes={effectiveMistakes}
        stats={effectiveStats}
        darkMode={darkMode}
      />
    </>
  );
};
