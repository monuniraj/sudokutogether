/**
 * Dedicated Daily Sudoku Challenge Page (`/daily-challenge`).
 *
 * Implements the "Iceberg Architecture":
 * - Above the fold: Today's Daily Challenge Hero CTA Card, 3-tile Streak Summary Strip,
 *   and inline Mon–Sun Monthly Calendar & Archive Grid with `DailyResultModal`.
 * - Below the fold: `<DailySEOArticle />` semantic HTML compliance content.
 *
 * Strictly honors Pastel Borderless, Shadowless UI + Dark Mode parity + `uid`-isolated vaults.
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Award,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  Lock,
  Play,
  Trophy,
  XCircle,
} from "lucide-react";
import { useTranslation } from "../../../i18n/useTranslation";
import { useDailyChallenge } from "../hooks/useDailyChallenge";
import {
  formatDateKey,
  generateDailyPuzzle,
  getDailyDifficultyForDate,
} from "../services/dailyGenerator";
import { getDailyProgress, getDailyStats } from "../services/dailyStorage";
import type {
  DailyChallengeStatus,
  DailyDifficulty,
  DailyStats,
} from "../types/daily.types";
import type { DailyChallengeLaunchPayload } from "./DailyChallengeCard";
import { DailyResultModal } from "./DailyResultModal";
import { DailySEOArticle } from "./DailySEOArticle";

export interface DailyChallengeScreenProps {
  uid?: string | null;
  darkMode?: boolean;
  refreshTrigger?: number;
  onStartDailyChallenge: (payload: DailyChallengeLaunchPayload) => void;
  onOpenSolver?: () => void;
}

function formatDurationMMSS(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function getShortDifficultyKey(difficulty: DailyDifficulty): string {
  switch (difficulty) {
    case "EASY":
      return "dailyDiffShortEasy";
    case "MEDIUM":
      return "dailyDiffShortMedium";
    case "HARD":
      return "dailyDiffShortHard";
    case "EXPERT":
      return "dailyDiffShortExpert";
    case "MASTER":
      return "dailyDiffShortMaster";
  }
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
        ? "bg-[#713f12] text-[#fef08a]"
        : "bg-[#FEF3C7] text-[#92400E]";
    case "HARD":
      return darkMode
        ? "bg-[#3b0764] text-[#e9d5ff]"
        : "bg-[#F3E8FF] text-[#6B21A8]";
    case "EXPERT":
    case "MASTER":
      return darkMode
        ? "bg-[#4c0519] text-[#fecdd3]"
        : "bg-[#FFE4E6] text-[#9D174D]";
  }
}

export const DailyChallengeScreen: React.FC<DailyChallengeScreenProps> = ({
  uid,
  darkMode = false,
  refreshTrigger = 0,
  onStartDailyChallenge,
  onOpenSolver,
}) => {
  const { t, language } = useTranslation();
  const normalizedUid = uid && String(uid).trim().length > 0 ? String(uid).trim() : null;

  const daily = useDailyChallenge({
    uid: normalizedUid,
    enableTimer: false,
    refreshTrigger,
  });

  const todayKey = daily.date || formatDateKey(new Date());

  const [viewYear, setViewYear] = useState<number>(() => {
    return Number(todayKey.slice(0, 4)) || new Date().getFullYear();
  });
  const [viewMonthIndex, setViewMonthIndex] = useState<number>(() => {
    const m = Number(todayKey.slice(5, 7));
    return m >= 1 && m <= 12 ? m - 1 : new Date().getMonth();
  });

  const [inspectedResult, setInspectedResult] = useState<{
    date: string;
    difficulty: DailyDifficulty;
    status: DailyChallengeStatus;
    elapsedTime: number;
    mistakes: number;
    stats: DailyStats;
    fromCalendar: boolean;
  } | null>(null);

  // Clear inspected modal whenever active account identity switches
  useEffect(() => {
    setInspectedResult(null);
  }, [normalizedUid]);

  // Keep today's anchor snapshot synced strictly to the active uid
  const stats: DailyStats = useMemo(
    () => getDailyStats(normalizedUid, todayKey),
    [normalizedUid, todayKey, refreshTrigger, daily.stats.totalCompleted, daily.stats.currentStreak]
  );

  const todayRecord = stats.recordsByDate[todayKey];
  const todayLocalProgress = useMemo(
    () => getDailyProgress(todayKey, normalizedUid),
    [todayKey, normalizedUid, refreshTrigger, daily.status]
  );

  const effectiveStatus: DailyChallengeStatus =
    daily.loadedUid === normalizedUid
      ? daily.status
      : todayRecord?.status === "COMPLETED"
        ? "COMPLETED"
        : todayRecord?.status === "FAILED"
          ? "FAILED"
          : todayLocalProgress?.status === "IN_PROGRESS"
            ? "IN_PROGRESS"
            : "NOT_STARTED";

  const effectiveElapsed: number =
    daily.loadedUid === normalizedUid
      ? daily.elapsedTime
      : todayRecord?.timeSeconds ?? todayLocalProgress?.elapsedSeconds ?? 0;

  const effectiveMistakes: number =
    daily.loadedUid === normalizedUid
      ? daily.mistakes
      : todayRecord?.mistakes ?? todayLocalProgress?.mistakesCount ?? 0;

  const monthTitle = useMemo(() => {
    try {
      const d = new Date(Date.UTC(viewYear, viewMonthIndex, 15));
      return new Intl.DateTimeFormat(language || "en", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(d);
    } catch {
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      return `${monthNames[viewMonthIndex] || ""} ${viewYear}`;
    }
  }, [viewYear, viewMonthIndex, language]);

  const weekdayHeaders = useMemo(
    () => [
      t("dailyWeekdayMon"),
      t("dailyWeekdayTue"),
      t("dailyWeekdayWed"),
      t("dailyWeekdayThu"),
      t("dailyWeekdayFri"),
      t("dailyWeekdaySat"),
      t("dailyWeekdaySun"),
    ],
    [t]
  );

  const calendarCells = useMemo(() => {
    const firstUtc = new Date(Date.UTC(viewYear, viewMonthIndex, 1));
    const leadingBlanks = (firstUtc.getUTCDay() + 6) % 7;
    const daysInMonth = new Date(Date.UTC(viewYear, viewMonthIndex + 1, 0)).getUTCDate();

    const items: Array<{ day: number; dateKey: string } | null> = [];
    for (let i = 0; i < leadingBlanks; i++) {
      items.push(null);
    }
    const mm = String(viewMonthIndex + 1).padStart(2, "0");
    for (let d = 1; d <= daysInMonth; d++) {
      const dd = String(d).padStart(2, "0");
      items.push({ day: d, dateKey: `${viewYear}-${mm}-${dd}` });
    }
    return items;
  }, [viewYear, viewMonthIndex]);

  const handlePrevMonth = useCallback(() => {
    setViewMonthIndex((prev) => {
      if (prev === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setViewMonthIndex((prev) => {
      if (prev === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  }, []);

  const launchDatePuzzle = useCallback(
    (opts: {
      date: string;
      reviewOnly?: boolean;
      fallbackSolvedOnReview?: boolean;
    }) => {
      const generated = generateDailyPuzzle(opts.date);
      const savedProgress = getDailyProgress(opts.date, normalizedUid);
      onStartDailyChallenge({
        date: generated.date,
        difficulty: generated.difficulty,
        puzzle: generated.puzzle,
        solved: generated.solved,
        seed: generated.seed,
        savedProgress,
        reviewOnly: Boolean(opts.reviewOnly),
        isArchive: opts.date < todayKey,
        fallbackSolvedOnReview: Boolean(opts.fallbackSolvedOnReview),
      });
    },
    [normalizedUid, onStartDailyChallenge, todayKey]
  );

  const handleTodayCtaClick = useCallback(() => {
    if (effectiveStatus === "COMPLETED" || effectiveStatus === "FAILED") {
      setInspectedResult({
        date: todayKey,
        difficulty: daily.difficulty,
        status: effectiveStatus,
        elapsedTime: effectiveElapsed,
        mistakes: effectiveMistakes,
        stats,
        fromCalendar: false,
      });
      return;
    }

    launchDatePuzzle({ date: todayKey, reviewOnly: false });
  }, [
    effectiveStatus,
    todayKey,
    daily.difficulty,
    effectiveElapsed,
    effectiveMistakes,
    stats,
    launchDatePuzzle,
  ]);

  const handleCellClick = useCallback(
    (dateKey: string) => {
      if (dateKey > todayKey) return;

      const existingRecord = stats.recordsByDate[dateKey];
      if (
        existingRecord &&
        (existingRecord.status === "COMPLETED" ||
          existingRecord.status === "FAILED")
      ) {
        setInspectedResult({
          date: dateKey,
          difficulty: existingRecord.difficulty,
          status: existingRecord.status,
          elapsedTime: existingRecord.timeSeconds,
          mistakes: existingRecord.mistakes,
          stats,
          fromCalendar: true,
        });
        return;
      }

      launchDatePuzzle({ date: dateKey, reviewOnly: false });
    },
    [todayKey, stats, launchDatePuzzle]
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

  const ctaButtonClasses =
    effectiveStatus === "COMPLETED"
      ? darkMode
        ? "bg-[#240d02] hover:bg-[#1a0901] text-[#fde68a]"
        : "bg-white hover:bg-white/95 text-[#065F46]"
      : effectiveStatus === "FAILED"
        ? darkMode
          ? "bg-rose-950 hover:bg-rose-900 text-rose-200"
          : "bg-[#FECDD3] hover:bg-[#FDA4AF] text-[#9F1239]"
        : darkMode
          ? "bg-[#b45309] hover:bg-[#d97706] text-[#fef3c7]"
          : "bg-[#FCD34D] hover:bg-[#FBBF24] text-[#78350F]";

  return (
    <div
      id="daily-challenge-screen"
      className="h-[100dvh] max-h-full flex-1 min-h-0 w-full flex flex-col overflow-hidden select-none pt-[calc(70px+env(safe-area-inset-top,0px))]"
    >
      <main className="flex-1 min-h-0 w-full overflow-y-auto px-4 sm:px-6 pt-3 pb-24">
        <section className="w-full max-w-3xl mx-auto space-y-4">
          {/* Today's Featured Daily Challenge Hero Card */}
          <div
            className={`w-full rounded-3xl border-0 shadow-none p-5 sm:p-6 transition-colors ${
              darkMode
                ? "bg-[#451a03]/80 text-[#fde68a]"
                : "bg-[#FEF3C7]/90 text-[#92400E]"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3.5 min-w-0">
                <div
                  className={`w-11 h-11 rounded-2xl border-0 shadow-none flex items-center justify-center shrink-0 ${
                    darkMode ? "bg-black/25" : "bg-white/80"
                  }`}
                >
                  {effectiveStatus === "COMPLETED" ? (
                    <Trophy
                      className={`w-5 h-5 stroke-[2.2] ${
                        darkMode ? "text-[#FBBF24]" : "text-[#B45309]"
                      }`}
                    />
                  ) : (
                    <Calendar className="w-5 h-5 stroke-[2.2]" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="font-sans font-black text-lg sm:text-xl tracking-tight leading-tight">
                      {t("dailyChallengeLabel")}
                    </h1>
                    <span
                      className={`inline-flex items-center shrink-0 whitespace-nowrap px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wider uppercase border-0 shadow-none ${getDifficultyBadgeClasses(
                        daily.difficulty,
                        darkMode
                      )}`}
                    >
                      {t(daily.difficulty.toLowerCase())}
                    </span>
                  </div>
                  <p className="font-mono text-xs font-bold opacity-80 mt-1">
                    {todayKey}
                  </p>
                </div>
              </div>

              <button
                type="button"
                id="daily-screen-play-today-btn"
                onClick={handleTodayCtaClick}
                className={`h-11 px-5 rounded-2xl border-0 shadow-none font-sans font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.98] shrink-0 ${ctaButtonClasses}`}
              >
                {effectiveStatus === "COMPLETED" ? (
                  <Trophy className="w-4 h-4 shrink-0 stroke-[2.3]" />
                ) : effectiveStatus === "FAILED" ? (
                  <XCircle className="w-4 h-4 shrink-0 stroke-[2.3]" />
                ) : (
                  <Play className="w-4 h-4 shrink-0 fill-current" />
                )}
                <span>{ctaLabel}</span>
              </button>
            </div>
          </div>

          {/* 3-Tile Streak & Performance Strip */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            <div
              className={`rounded-2xl border-0 shadow-none p-3.5 flex flex-col items-center justify-center text-center ${
                darkMode
                  ? "bg-zinc-900/70 text-zinc-100"
                  : "bg-[#FEF3C7]/65 text-[#78350F]"
              }`}
            >
              <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider opacity-75">
                <Flame
                  className={`w-3.5 h-3.5 shrink-0 ${
                    darkMode ? "text-amber-400" : "text-amber-600"
                  }`}
                />
                <span className="truncate">{t("dailyStreakTitle")}</span>
              </div>
              <span className="font-mono text-xl sm:text-2xl font-black mt-1">
                {stats.currentStreak}
              </span>
            </div>

            <div
              className={`rounded-2xl border-0 shadow-none p-3.5 flex flex-col items-center justify-center text-center ${
                darkMode
                  ? "bg-zinc-900/70 text-zinc-100"
                  : "bg-[#D1FAE5]/65 text-[#065F46]"
              }`}
            >
              <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider opacity-75">
                <Trophy
                  className={`w-3.5 h-3.5 shrink-0 ${
                    darkMode ? "text-emerald-400" : "text-emerald-700"
                  }`}
                />
                <span className="truncate">{t("dailyTotalSolvedLabel")}</span>
              </div>
              <span className="font-mono text-xl sm:text-2xl font-black mt-1">
                {stats.totalCompleted}
              </span>
            </div>

            <div
              className={`rounded-2xl border-0 shadow-none p-3.5 flex flex-col items-center justify-center text-center ${
                darkMode
                  ? "bg-zinc-900/70 text-zinc-100"
                  : "bg-[#E0E7FF]/75 text-[#3730A3]"
              }`}
            >
              <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider opacity-75">
                <Award
                  className={`w-3.5 h-3.5 shrink-0 ${
                    darkMode ? "text-indigo-300" : "text-indigo-700"
                  }`}
                />
                <span className="truncate">{t("dailyLongestStreakShort")}</span>
              </div>
              <span className="font-mono text-xl sm:text-2xl font-black mt-1">
                {stats.longestStreak}
              </span>
            </div>
          </div>

          {/* Inline Mon–Sun Monthly Calendar & Archive Grid */}
          <div
            className={`w-full rounded-3xl border-0 shadow-none p-4 sm:p-6 transition-colors ${
              darkMode
                ? "bg-[#18181b] text-zinc-100"
                : "bg-[#FDFBF7] text-[#1C1917]"
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="font-sans font-black text-base sm:text-lg leading-tight">
                  {t("dailyCalendarTitle")}
                </h2>
                <p className="font-sans text-xs font-semibold opacity-65">
                  {t("dailyCalendarSubtitle")}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  aria-label="Previous Month"
                  className={`w-9 h-9 rounded-2xl border-0 shadow-none flex items-center justify-center cursor-pointer transition-transform active:scale-95 ${
                    darkMode
                      ? "bg-[#222225] hover:bg-[#2c2c30] text-zinc-200"
                      : "bg-[#F4EFE6] hover:bg-[#EAE3D5] text-stone-700"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4 stroke-[2.3]" />
                </button>
                <span className="font-sans font-black text-xs sm:text-sm min-w-[116px] text-center">
                  {monthTitle}
                </span>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  aria-label="Next Month"
                  className={`w-9 h-9 rounded-2xl border-0 shadow-none flex items-center justify-center cursor-pointer transition-transform active:scale-95 ${
                    darkMode
                      ? "bg-[#222225] hover:bg-[#2c2c30] text-zinc-200"
                      : "bg-[#F4EFE6] hover:bg-[#EAE3D5] text-stone-700"
                  }`}
                >
                  <ChevronRight className="w-4 h-4 stroke-[2.3]" />
                </button>
              </div>
            </div>

            {/* Weekday Header Row */}
            <div className="grid grid-cols-7 gap-1.5 mb-2">
              {weekdayHeaders.map((label, idx) => (
                <div
                  key={idx}
                  className="text-center font-sans text-[10px] sm:text-xs font-black uppercase tracking-wider opacity-60 py-1"
                >
                  {label}
                </div>
              ))}
            </div>

            {/* 7-Column Calendar Cells */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {calendarCells.map((cell, idx) => {
                if (!cell) {
                  return <div key={`blank-${idx}`} className="h-[56px] sm:h-[62px]" />;
                }

                const { day, dateKey } = cell;
                const isToday = dateKey === todayKey;
                const isFuture = dateKey > todayKey;
                const record = stats.recordsByDate[dateKey];
                const progress = !isFuture ? getDailyProgress(dateKey, normalizedUid) : null;
                const dayDifficulty = getDailyDifficultyForDate(dateKey);

                const isCompleted = record?.status === "COMPLETED";
                const isFailed = record?.status === "FAILED";
                const isInProgress =
                  !isCompleted && !isFailed && progress?.status === "IN_PROGRESS";

                const todayRingClasses =
                  isToday && !isFuture
                    ? darkMode
                      ? "ring-2 ring-[#F59E0B] ring-offset-2 ring-offset-zinc-900"
                      : "ring-2 ring-[#D97706] ring-offset-2 ring-offset-[#FDFBF7]"
                    : "";

                let tileClasses = "";
                if (isFuture) {
                  tileClasses = darkMode
                    ? "bg-[#1e1e21]/50 text-zinc-600 cursor-not-allowed"
                    : "bg-[#F4EFE6]/45 text-stone-400 cursor-not-allowed";
                } else if (isCompleted) {
                  tileClasses = darkMode
                    ? "bg-[#022c22]/85 hover:bg-[#064e3b] text-[#a7f3d0] cursor-pointer"
                    : "bg-[#D1FAE5] hover:bg-[#A7F3D0] text-[#065F46] cursor-pointer";
                } else if (isFailed) {
                  tileClasses = darkMode
                    ? "bg-[#4c0519]/75 hover:bg-[#881337] text-[#fecdd3] cursor-pointer"
                    : "bg-[#FFE4E6] hover:bg-[#FECDD3] text-[#9F1239] cursor-pointer";
                } else if (isInProgress) {
                  tileClasses = darkMode
                    ? "bg-[#0c4a6e]/50 hover:bg-[#0c4a6e]/70 text-[#bae6fd] cursor-pointer"
                    : "bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#0369A1] cursor-pointer";
                } else if (isToday) {
                  tileClasses = darkMode
                    ? "bg-[#78350F]/40 hover:bg-[#78350F]/55 text-[#FEF3C7] cursor-pointer"
                    : "bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#78350F] cursor-pointer";
                } else {
                  tileClasses = darkMode
                    ? "bg-[#222225] hover:bg-[#2c2c30] text-zinc-300 cursor-pointer"
                    : "bg-[#F4EFE6] hover:bg-[#EAE3D5] text-stone-700 cursor-pointer";
                }

                return (
                  <button
                    key={dateKey}
                    type="button"
                    disabled={isFuture}
                    onClick={() => handleCellClick(dateKey)}
                    aria-label={
                      isCompleted
                        ? t("dailyTileCompletedAria", { date: dateKey })
                        : isToday
                          ? t("dailyTileTodayAria", { date: dateKey })
                          : dateKey
                    }
                    className={`h-[56px] sm:h-[62px] rounded-xl border-0 shadow-none p-1.5 flex flex-col items-center justify-between transition-transform active:scale-95 ${tileClasses} ${todayRingClasses}`}
                  >
                    <span className="font-mono text-xs sm:text-sm font-black leading-none mt-0.5">
                      {day}
                    </span>

                    {isFuture ? (
                      <Lock className="w-3 h-3 opacity-45 mb-0.5" />
                    ) : isCompleted ? (
                      <div className="flex flex-col items-center leading-none gap-0.5">
                        <Trophy
                          className={`w-3 h-3 shrink-0 stroke-[2.4] ${
                            darkMode ? "text-[#FBBF24]" : "text-[#B45309]"
                          }`}
                        />
                        <span className="font-mono text-[9px] font-bold tracking-tighter">
                          {formatDurationMMSS(record.timeSeconds)}
                        </span>
                      </div>
                    ) : isFailed ? (
                      <div className="flex flex-col items-center leading-none gap-0.5">
                        <XCircle className="w-3 h-3 shrink-0 stroke-[2.4]" />
                        <span className="font-mono text-[8.5px] font-bold uppercase">
                          3/3
                        </span>
                      </div>
                    ) : isInProgress ? (
                      <div className="flex flex-col items-center leading-none gap-0.5">
                        <Clock
                          className={`w-3 h-3 shrink-0 stroke-[2.4] ${
                            darkMode ? "text-sky-400" : "text-[#0369A1]"
                          }`}
                        />
                        <span className="font-mono text-[10px] font-bold">
                          {formatDurationMMSS(progress.elapsedSeconds)}
                        </span>
                      </div>
                    ) : isToday ? (
                      <span className="font-mono text-[9px] font-black uppercase tracking-tight mb-0.5 max-w-full truncate px-0.5">
                        {t(getShortDifficultyKey(dayDifficulty))}
                      </span>
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-35 mb-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Below-the-Fold AdSense Compliance SEO Article */}
        <DailySEOArticle darkMode={darkMode} onNavigateSolver={onOpenSolver} />
      </main>

      <DailyResultModal
        isOpen={Boolean(inspectedResult)}
        onClose={() => setInspectedResult(null)}
        onReviewBoard={() => {
          const targetDate = inspectedResult?.date ?? todayKey;
          const isComp = inspectedResult?.status === "COMPLETED";
          setInspectedResult(null);
          launchDatePuzzle({
            date: targetDate,
            reviewOnly: true,
            fallbackSolvedOnReview: isComp,
          });
        }}
        onOpenCalendarHistory={() => setInspectedResult(null)}
        onBackToCalendar={
          inspectedResult?.fromCalendar ? () => setInspectedResult(null) : undefined
        }
        uid={normalizedUid}
        date={inspectedResult?.date ?? todayKey}
        difficulty={inspectedResult?.difficulty ?? daily.difficulty}
        status={inspectedResult?.status ?? effectiveStatus}
        elapsedTime={inspectedResult?.elapsedTime ?? effectiveElapsed}
        mistakes={inspectedResult?.mistakes ?? effectiveMistakes}
        stats={inspectedResult?.stats ?? stats}
        darkMode={darkMode}
      />
    </div>
  );
};

export default DailyChallengeScreen;

