/**
 * Daily Challenge Result & Career Stats Modal (Milestone 4).
 *
 * Strict UI & Architecture compliance:
 * - Pastel borderless, shadowless surfaces with smooth curved corners.
 * - Strictly Lucide React SVG vector icons (zero emojis).
 * - All user-facing strings wrapped with `t('daily.<key>', 'English Fallback')`.
 */

import React, { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertCircle,
  Award,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  Flame,
  Share2,
  Trophy,
  X,
  XCircle,
} from "lucide-react";
import { useTranslation } from "../../../i18n/useTranslation";
import type {
  DailyChallengeStatus,
  DailyDifficulty,
  DailyStats,
} from "../types/daily.types";

export interface DailyResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewBoard: () => void;
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

export const DailyResultModal: React.FC<DailyResultModalProps> = ({
  isOpen,
  onClose,
  onReviewBoard,
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
      // User dismissed native share sheet or unsupported; fall back to clipboard
    }

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2500);
        return;
      }
    } catch {
      // Fall back to textarea copy
    }

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

  if (!isOpen || typeof document === "undefined") return null;

  const isCompleted = status === "COMPLETED";
  const isFailed = status === "FAILED";

  const heroBannerClasses = isCompleted
    ? darkMode
      ? "bg-[#064e3b]/80 text-[#a7f3d0]"
      : "bg-[#D1FAE5] text-[#065F46]"
    : isFailed
      ? darkMode
        ? "bg-[#881337]/80 text-[#fecdd3]"
        : "bg-[#FFE4E6] text-[#9F1239]"
      : darkMode
        ? "bg-[#78350f]/80 text-[#fde68a]"
        : "bg-[#FEF3C7] text-[#92400E]";

  const modalContent = (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/55 backdrop-blur-sm select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="daily-result-modal-title"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-md rounded-3xl border-0 shadow-none p-5 sm:p-6 transition-colors ${
          darkMode
            ? "bg-[#1e293b] text-slate-100"
            : "bg-[#FAF9F6] text-slate-800"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Close Row */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border-0 shadow-none ${
                darkMode
                  ? "bg-slate-800 text-slate-300"
                  : "bg-[#F1F5F9] text-slate-600"
              }`}
            >
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>{date}</span>
            </span>
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-black tracking-wider uppercase border-0 shadow-none ${getDifficultyBadgeClasses(
                difficulty,
                darkMode
              )}`}
            >
              {difficulty}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={td("daily.closeBtn", "Close")}
            className={`w-9 h-9 rounded-2xl border-0 shadow-none flex items-center justify-center cursor-pointer transition-transform active:scale-95 ${
              darkMode
                ? "bg-slate-800 hover:bg-slate-700 text-slate-300"
                : "bg-[#F1F5F9] hover:bg-[#E2E8F0] text-slate-600"
            }`}
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* Status Hero Banner */}
        <div
          className={`w-full rounded-2xl border-0 shadow-none p-4 mb-4 flex items-center gap-3.5 ${heroBannerClasses}`}
        >
          <div
            className={`w-12 h-12 rounded-2xl border-0 shadow-none flex items-center justify-center shrink-0 ${
              darkMode ? "bg-black/20" : "bg-white/70"
            }`}
          >
            {isCompleted ? (
              <Trophy className="w-6 h-6 stroke-[2.2]" />
            ) : isFailed ? (
              <XCircle className="w-6 h-6 stroke-[2.2]" />
            ) : (
              <Award className="w-6 h-6 stroke-[2.2]" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2
              id="daily-result-modal-title"
              className="font-sans font-black text-lg leading-tight truncate"
            >
              {isCompleted
                ? td("daily.completedTitle", "Daily Challenge Completed")
                : isFailed
                  ? td("daily.failedTitle", "Daily Challenge Failed")
                  : td("daily.statsTitle", "Daily Challenge Stats")}
            </h2>
            <p className="text-xs font-semibold opacity-85 mt-0.5 truncate">
              {isCompleted
                ? td(
                    "daily.completedSubtitle",
                    "Great logic! Come back tomorrow for a new puzzle."
                  )
                : isFailed
                  ? td(
                      "daily.failedSubtitle",
                      "Three mistakes reached. Review the board or try tomorrow."
                    )
                  : td(
                      "daily.statsSubtitle",
                      "Keep your daily streak alive every day."
                    )}
            </p>
          </div>
        </div>

        {/* 2x2 Metric Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Solved Time */}
          <div
            className={`rounded-2xl border-0 shadow-none p-3.5 ${
              darkMode
                ? "bg-[#0c4a6e]/50 text-[#bae6fd]"
                : "bg-[#E0F2FE] text-[#0369A1]"
            }`}
          >
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider opacity-80">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>{td("daily.solvedTimeLabel", "Solved Time")}</span>
            </div>
            <div className="font-mono font-black text-2xl mt-1">
              {formatDurationMMSS(elapsedTime)}
            </div>
          </div>

          {/* Mistakes */}
          <div
            className={`rounded-2xl border-0 shadow-none p-3.5 ${
              darkMode
                ? "bg-[#881337]/45 text-[#fecdd3]"
                : "bg-[#FFE4E6] text-[#9F1239]"
            }`}
          >
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider opacity-80">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{td("daily.mistakesLabel", "Mistakes")}</span>
            </div>
            <div className="font-mono font-black text-2xl mt-1">
              {mistakes} / 3
            </div>
          </div>

          {/* Current Streak */}
          <div
            className={`rounded-2xl border-0 shadow-none p-3.5 ${
              darkMode
                ? "bg-[#78350f]/55 text-[#fde68a]"
                : "bg-[#FEF3C7] text-[#92400E]"
            }`}
          >
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider opacity-80">
              <Flame className="w-3.5 h-3.5 shrink-0" />
              <span>{td("daily.currentStreakLabel", "Current Streak")}</span>
            </div>
            <div className="font-mono font-black text-2xl mt-1">
              {stats.currentStreak}
            </div>
          </div>

          {/* Best Streak */}
          <div
            className={`rounded-2xl border-0 shadow-none p-3.5 ${
              darkMode
                ? "bg-[#4c1d95]/50 text-[#ddd6fe]"
                : "bg-[#F3E8FF] text-[#6B21A8]"
            }`}
          >
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider opacity-80">
              <Trophy className="w-3.5 h-3.5 shrink-0" />
              <span>{td("daily.bestStreakLabel", "Best Streak")}</span>
            </div>
            <div className="font-mono font-black text-2xl mt-1">
              {stats.longestStreak}
            </div>
          </div>
        </div>

        {/* Career Summary Strip */}
        <div
          className={`rounded-2xl border-0 shadow-none px-4 py-2.5 mb-5 flex items-center justify-between text-xs font-bold ${
            darkMode
              ? "bg-slate-800/80 text-slate-300"
              : "bg-[#F1F5F9] text-slate-600"
          }`}
        >
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>
              {td("daily.totalCompletedLabel", "Total Completed")}:{" "}
              <strong className="font-mono">{stats.totalCompleted}</strong>
            </span>
          </span>
          <span>
            {td("daily.bestTimeLabel", "Best Time")}:{" "}
            <strong className="font-mono">
              {stats.bestTimeSeconds !== null
                ? formatDurationMMSS(stats.bestTimeSeconds)
                : "--:--"}
            </strong>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleShareChallenge}
            className={`w-full py-3.5 px-4 rounded-2xl border-0 shadow-none font-sans font-black text-sm flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.98] ${
              darkMode
                ? "bg-[#0369a1] hover:bg-[#0284c7] text-white"
                : "bg-[#BAE6FD] hover:bg-[#7DD3FC] text-[#0C4A6E]"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 stroke-[2.5] shrink-0" />
                <span>{td("daily.copiedShare", "Copied to Clipboard")}</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 stroke-[2.2] shrink-0" />
                <span>{td("daily.shareChallengeBtn", "Share Challenge")}</span>
              </>
            )}
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onReviewBoard}
              className={`py-3 px-3.5 rounded-2xl border-0 shadow-none font-sans font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer transition-transform active:scale-[0.98] ${
                darkMode
                  ? "bg-[#312e81]/80 hover:bg-[#3730a3] text-[#c7d2fe]"
                  : "bg-[#E0E7FF] hover:bg-[#C7D2FE] text-[#3730A3]"
              }`}
            >
              <Eye className="w-4 h-4 stroke-[2.2] shrink-0" />
              <span>{td("daily.reviewBoardBtn", "Review Board")}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className={`py-3 px-3.5 rounded-2xl border-0 shadow-none font-sans font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer transition-transform active:scale-[0.98] ${
                darkMode
                  ? "bg-slate-800 hover:bg-slate-700 text-slate-200"
                  : "bg-[#F1F5F9] hover:bg-[#E2E8F0] text-slate-700"
              }`}
            >
              <X className="w-4 h-4 stroke-[2.2] shrink-0" />
              <span>{td("daily.closeBtn", "Close")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
