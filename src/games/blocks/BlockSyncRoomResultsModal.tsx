import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Clock,
  Copy,
  Crown,
  Medal,
  Play,
  Trophy,
  X,
} from "lucide-react";
import { BlockSyncLogo } from "./BlockSyncLogo";
import type { BlockSyncRoomTimeLimitSec } from "./blocksRoomEngine";
import { useTranslation } from "../../i18n/useTranslation";
import {
  getFocusableElements,
  handleRovingMenuArrowKey,
  isEditableEventTarget,
  useTopmostModalKeyboardLayer,
} from "../../utils/keyboardControls";

export interface BlockSyncRoomResultsStanding {
  id: string;
  name: string;
  score: number;
  linesCleared?: number;
  status: "completed" | "playing";
  isCurrentUser?: boolean;
}

export interface BlockSyncRoomResultsModalProps {
  isOpen: boolean;
  isDarkMode: boolean;
  roomCode: string;
  mode: "classic" | "rush";
  timeLimitSec?: BlockSyncRoomTimeLimitSec;
  undoAllowed?: boolean;
  isLoading?: boolean;
  standings: BlockSyncRoomResultsStanding[];
  currentUserAlreadyCompleted?: boolean;
  isCurrentlyInsideThisRoom?: boolean;
  onAction: () => void;
  onClose: () => void;
  onCopyRoomCode?: (code: string) => void;
  playClickSound?: () => void;
}

export const BlockSyncRoomResultsModal: React.FC<BlockSyncRoomResultsModalProps> = ({
  isOpen,
  isDarkMode,
  roomCode,
  mode,
  timeLimitSec = 180,
  undoAllowed,
  isLoading = false,
  standings,
  currentUserAlreadyCompleted = false,
  isCurrentlyInsideThisRoom = false,
  onAction,
  onClose,
  onCopyRoomCode,
  playClickSound,
}) => {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const onCloseRef = useRef(onClose);
  const onActionRef = useRef(onAction);
  onCloseRef.current = onClose;
  onActionRef.current = onAction;

  const [copied, setCopied] = useState(false);

  const sortedStandings = useMemo(() => {
    return [...(standings || [])].sort((a, b) => {
      const aCompleted = a.status === "completed";
      const bCompleted = b.status === "completed";
      if (aCompleted !== bCompleted) return aCompleted ? -1 : 1;
      if (aCompleted && bCompleted) {
        if (b.score !== a.score) return b.score - a.score;
        const aLines = a.linesCleared ?? 0;
        const bLines = b.linesCleared ?? 0;
        if (bLines !== aLines) return bLines - aLines;
      }
      return (a.name || "").localeCompare(b.name || "");
    });
  }, [standings]);

  const handleDismiss = useCallback(() => {
    onCloseRef.current();
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setCopied(false);
    const timer = window.setTimeout(() => {
      const active = document.activeElement as HTMLElement | null;
      if (active && dialogRef.current?.contains(active)) return;
      const primaryBtn = dialogRef.current?.querySelector<HTMLElement>(
        "#block-sync-results-primary-action"
      );
      if (primaryBtn) {
        primaryBtn.focus({ preventScroll: true });
      } else {
        const focusables = getFocusableElements(dialogRef.current);
        focusables[0]?.focus({ preventScroll: true });
      }
    }, 30);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  useTopmostModalKeyboardLayer(isOpen, {
    id: "block-sync-room-results-modal",
    priority: 35,
    containerRef: dialogRef,
    restoreFocus: true,
    trapFocus: true,
    onEscape: () => {
      playClickSound?.();
      handleDismiss();
      return true;
    },
    onBackspace: () => {
      playClickSound?.();
      handleDismiss();
      return true;
    },
    onKeyDown: (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey || isEditableEventTarget(e.target)) {
        return false;
      }
      if (
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight" ||
        e.key === "Home" ||
        e.key === "End"
      ) {
        const focusables = getFocusableElements(dialogRef.current);
        if (handleRovingMenuArrowKey(e, focusables, "both")) {
          const nextEl = document.activeElement as HTMLElement | null;
          nextEl?.scrollIntoView({ block: "nearest", behavior: "smooth" });
          return true;
        }
      }
      return false;
    },
  });

  if (!isOpen) return null;

  const rushMinutes = Math.max(1, Math.round(timeLimitSec / 60));

  const primaryLabel = isCurrentlyInsideThisRoom
    ? t("blocks_continue_playing")
    : !currentUserAlreadyCompleted
      ? t("blocks_play_this_room")
      : t("closeBtn");

  const handleCopyCode = () => {
    playClickSound?.();
    if (onCopyRoomCode) {
      onCopyRoomCode(roomCode);
    } else {
      try {
        navigator.clipboard?.writeText(roomCode);
      } catch { }
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div
      data-block-sync-dialog="true"
      className={`fixed inset-0 z-[10000] flex items-center justify-center p-3 transition-opacity duration-150 ${
        isDarkMode
          ? "bg-black/60 backdrop-blur-[3px]"
          : "bg-slate-900/25 backdrop-blur-[2px]"
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          playClickSound?.();
          handleDismiss();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Block Sync Room ${roomCode} Standings`}
        className={`w-[calc(100%-24px)] max-w-[400px] max-h-[calc(100dvh-28px-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px))] rounded-3xl p-5 flex flex-col gap-3.5 select-none overflow-hidden ${
          isDarkMode
            ? "bg-[#141A21] text-[#F8FAFC] border border-white/10 shadow-[0_18px_46px_rgba(0,0,0,0.58)]"
            : "bg-[#F4F8FB] text-[#1E293B] border border-[#D4E4F0] shadow-[0_14px_40px_rgba(15,23,42,0.12)]"
        }`}
      >
        {/* Header */}
        <header className="flex flex-col gap-2.5 shrink-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <BlockSyncLogo size={28} isDarkMode={isDarkMode} />
              <div className="flex flex-col min-w-0">
                <span
                  className={`text-[10px] font-sans font-black tracking-[0.18em] uppercase leading-none ${
                    isDarkMode ? "text-slate-200" : "text-[#2C3E50]"
                  }`}
                >
                  BLOCK{" "}
                  <span className={isDarkMode ? "text-[#38BDF8]" : "text-[#2B8CEE]"}>
                    SYNC
                  </span>
                </span>
                <h2 className="mt-1 text-lg font-sans font-extrabold tracking-tight leading-none truncate">
                  {t("blocks_room_standings")}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                playClickSound?.();
                handleDismiss();
              }}
              aria-label={t("closeBtn")}
              title={t("closeBtn")}
              className={`w-9 h-9 rounded-full border-none cursor-pointer flex items-center justify-center transition-all active:scale-95 shrink-0 ${
                isDarkMode
                  ? "bg-[#1B242E] hover:bg-[#24303D] text-slate-200"
                  : "bg-[#E6F1F8] hover:bg-[#D5E6F3] text-[#49637A]"
              }`}
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider ${
                mode === "rush"
                  ? isDarkMode
                    ? "bg-[#0EA5E9]/20 text-[#38BDF8]"
                    : "bg-[#E0F2FE] text-[#0369A1]"
                  : isDarkMode
                    ? "bg-[#1B242E] text-slate-200"
                    : "bg-[#E6F1F8] text-[#2C3E50]"
              }`}
            >
              {mode === "rush" && <Clock className="w-3 h-3 shrink-0" aria-hidden="true" />}
              <span>
                {mode === "rush"
                  ? `${t("blocks_mode_rush")} · ${t("blocks_min_short", { min: rushMinutes })}`
                  : t("blocks_mode_classic")}
              </span>
            </span>

            {typeof undoAllowed === "boolean" && (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                  isDarkMode
                    ? "bg-white/[0.06] text-slate-300"
                    : "bg-white/85 text-[#49637A]"
                }`}
              >
                {undoAllowed ? t("blocks_undo_on") : t("blocks_undo_disabled_badge")}
              </span>
            )}

            <button
              type="button"
              onClick={handleCopyCode}
              title={t("blocks_copy_room_code")}
              aria-label={t("blocks_copy_room_code")}
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider tabular-nums border-none cursor-pointer transition-all active:scale-95 ${
                isDarkMode
                  ? "bg-[#38BDF8]/15 hover:bg-[#38BDF8]/25 text-[#38BDF8]"
                  : "bg-[#2B8CEE]/12 hover:bg-[#2B8CEE]/20 text-[#2B8CEE]"
              }`}
            >
              <span>{t("blocks_room")} · {roomCode}</span>
              {copied ? (
                <Check className="w-2.5 h-2.5 stroke-[2.8]" aria-hidden="true" />
              ) : (
                <Copy className="w-2.5 h-2.5 stroke-[2.3]" aria-hidden="true" />
              )}
            </button>
          </div>
        </header>

        {/* Standings Scroll List (p-1.5 -mx-1.5 prevents clipping) */}
        <div
          className={`rounded-2xl p-3 flex-1 min-h-0 flex flex-col ${
            isDarkMode ? "bg-[#1B242E]" : "bg-[#E6F1F8]/90"
          }`}
        >
          <div className="flex-1 min-h-0 max-h-[46vh] overflow-y-auto no-scrollbar p-1.5 -mx-1.5 space-y-2">
            {isLoading && sortedStandings.length === 0 ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2 text-center opacity-70">
                <Trophy className="w-5 h-5 animate-pulse" aria-hidden="true" />
                <span className="text-xs font-semibold">{t("blocks_loading_standings")}</span>
              </div>
            ) : sortedStandings.length === 0 ? (
              <div className="py-8 flex flex-col items-center justify-center gap-1.5 text-center opacity-70">
                <Trophy className="w-5 h-5 opacity-75" aria-hidden="true" />
                <span className="text-xs font-semibold">{t("blocks_no_scores_yet")}</span>
              </div>
            ) : (
              sortedStandings.map((entry, idx) => {
                const isCompleted = entry.status === "completed";
                const podiumTier = isCompleted && idx < 3 ? idx + 1 : 0;

                const rowThemeClass =
                  podiumTier === 1
                    ? isDarkMode
                      ? "bg-[#1E2733] text-slate-50 border border-[#FBBF24]/38 shadow-[0_0_16px_rgba(251,191,36,0.10)]"
                      : "bg-white/92 text-[#1E293B] border border-[#D97706]/35 shadow-[0_2px_10px_rgba(217,119,6,0.08)]"
                    : podiumTier === 2
                      ? isDarkMode
                        ? "bg-[#1B2430] text-slate-100 border border-slate-300/28"
                        : "bg-white/88 text-[#1E293B] border border-slate-300/80 shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
                      : podiumTier === 3
                        ? isDarkMode
                          ? "bg-[#1B232D] text-slate-100 border border-[#FB923C]/30"
                          : "bg-white/88 text-[#1E293B] border border-[#C2410C]/25"
                        : entry.isCurrentUser
                          ? isDarkMode
                            ? "bg-[#243445] text-slate-50 border border-[#38BDF8]/30"
                            : "bg-white/95 text-[#1E293B] border border-[#2B8CEE]/25 shadow-[0_2px_8px_rgba(44,62,80,0.06)]"
                          : isDarkMode
                            ? "bg-[#141A21]/75 text-slate-300"
                            : "bg-white/70 text-[#49637A]";

                return (
                  <div
                    key={entry.id}
                    className={`px-3 py-2.5 rounded-xl flex items-center justify-between gap-2.5 text-xs ${rowThemeClass}`}
                  >
                    <div className="min-w-0 flex items-center gap-2.5">
                      {podiumTier > 0 ? (
                        <span
                          aria-label={`Rank ${podiumTier}`}
                          className={`w-7 h-7 rounded-xl inline-flex items-center justify-center shrink-0 ${
                            podiumTier === 1
                              ? isDarkMode
                                ? "bg-[#FBBF24]/20 text-[#FCD34D]"
                                : "bg-[#FEF3C7] text-[#B45309]"
                              : podiumTier === 2
                                ? isDarkMode
                                  ? "bg-slate-300/18 text-slate-200"
                                  : "bg-slate-200/90 text-slate-600"
                                : isDarkMode
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
                      ) : entry.status === "playing" ? (
                        <span
                          aria-label="Playing"
                          className={`w-7 h-7 rounded-xl inline-flex items-center justify-center shrink-0 ${
                            isDarkMode
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

                      {entry.isCurrentUser && (
                        <span
                          className={`shrink-0 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                            isDarkMode
                              ? "bg-[#38BDF8]/18 text-[#38BDF8]"
                              : "bg-[#2B8CEE]/14 text-[#2B8CEE]"
                          }`}
                        >
                          {t("blocks_you")}
                        </span>
                      )}
                    </div>

                    <div className="shrink-0 flex flex-col items-end">
                      {isCompleted ? (
                        <>
                          <span className="font-extrabold text-sm tabular-nums leading-tight">
                            {entry.score.toLocaleString()}
                          </span>
                          {entry.linesCleared !== undefined && (
                            <span className="text-[10px] font-medium opacity-65 tabular-nums">
                              {entry.linesCleared === 1
                                ? t("blocks_line_singular", { n: entry.linesCleared })
                                : t("blocks_line_plural", { n: entry.linesCleared })}
                            </span>
                          )}
                        </>
                      ) : (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            isDarkMode
                              ? "bg-white/[0.06] text-slate-300"
                              : "bg-slate-200/70 text-[#49637A]"
                          }`}
                        >
                          {t("blocks_playing_ellipsis")}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer Primary CTA */}
        <footer className="shrink-0 pt-0.5">
          <button
            id="block-sync-results-primary-action"
            type="button"
            onClick={() => {
              playClickSound?.();
              onActionRef.current();
            }}
            className={`w-full min-h-[48px] px-4 rounded-2xl border-none cursor-pointer font-sans font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.985] ${
              isDarkMode
                ? "bg-[#38BDF8] hover:bg-[#52C8FA] text-[#082032] shadow-[0_8px_20px_rgba(56,189,248,0.26)]"
                : "bg-[#2B8CEE] hover:bg-[#1D7AD9] text-white shadow-[0_8px_20px_rgba(43,140,238,0.24)]"
            }`}
          >
            {!isCurrentlyInsideThisRoom && !currentUserAlreadyCompleted && (
              <Play className="w-4 h-4 fill-current shrink-0" aria-hidden="true" />
            )}
            <span>{primaryLabel}</span>
          </button>
        </footer>
      </div>
    </div>
  );
};
