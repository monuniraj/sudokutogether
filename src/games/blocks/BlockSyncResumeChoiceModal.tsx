import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { Clock, Play, Sparkles, Users, X } from "lucide-react";
import { isHapticsEnabled } from "../../utils/haptics";
import {
  getFocusableElements,
  isEditableEventTarget,
  useTopmostModalKeyboardLayer,
} from "../../utils/keyboardControls";
import { BlockSyncPendingRoomSession } from "./blocksRoomEngine";

export interface BlockSyncResumeChoiceModalProps {
  isOpen: boolean;
  isDarkMode: boolean;
  pendingRoom: BlockSyncPendingRoomSession | null;
  soloSavedScore?: number | null;
  onResumeMultiplayer: (session: BlockSyncPendingRoomSession) => void;
  onPlaySoloClassic: () => void;
  onClose: () => void;
}

const EXIT_DURATION_MS = 160;

function formatMmSs(totalSec: number): string {
  const safe = Math.max(0, Math.floor(totalSec));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function triggerModalHaptic(style: ImpactStyle): void {
  if (!isHapticsEnabled()) return;
  try {
    if (Capacitor.isNativePlatform()) {
      void Haptics.impact({ style }).catch(() => {});
      return;
    }
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(style === ImpactStyle.Medium ? 14 : 8);
    }
  } catch {
    // Silent fallback when haptics unavailable
  }
}

export const BlockSyncResumeChoiceModal: React.FC<BlockSyncResumeChoiceModalProps> = ({
  isOpen,
  isDarkMode,
  pendingRoom,
  soloSavedScore = null,
  onResumeMultiplayer,
  onPlaySoloClassic,
  onClose,
}) => {
  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return false;
    }
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const [isExiting, setIsExiting] = useState<boolean>(false);
  const [isKeyboardNavActive, setIsKeyboardNavActive] = useState<boolean>(false);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const exitTimerRef = useRef<number | null>(null);
  const lastPointerPosRef = useRef<{ x: number; y: number } | null>(null);

  const clearExitTimer = useCallback(() => {
    if (exitTimerRef.current !== null && typeof window !== "undefined") {
      window.clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsExiting(false);
      setIsKeyboardNavActive(false);
      setNowMs(Date.now());
    }
    return () => clearExitTimer();
  }, [isOpen, clearExitTimer]);

  // Live 1s countdown ticker while modal is open for Time Rush rooms
  useEffect(() => {
    if (
      !isOpen ||
      !pendingRoom ||
      pendingRoom.config.mode !== "rush" ||
      !pendingRoom.rushEndAt
    ) {
      return;
    }
    setNowMs(Date.now());
    const id = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => window.clearInterval(id);
  }, [isOpen, pendingRoom?.config.mode, pendingRoom?.rushEndAt]);

  // Clear keyboard-only focus ring immediately on pointer/touch activity
  useEffect(() => {
    if (!isOpen) return;
    const clearKbd = () => {
      setIsKeyboardNavActive(false);
      const activeEl = document.activeElement;
      if (
        activeEl instanceof HTMLElement &&
        dialogRef.current?.contains(activeEl) &&
        !isEditableEventTarget(activeEl)
      ) {
        activeEl.blur();
      }
    };

    const handlePointerDown = () => clearKbd();
    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") {
        clearKbd();
        return;
      }
      const prev = lastPointerPosRef.current;
      lastPointerPosRef.current = { x: e.clientX, y: e.clientY };
      if (!prev) return;
      if (Math.abs(e.clientX - prev.x) > 2 || Math.abs(e.clientY - prev.y) > 2) {
        clearKbd();
      }
    };

    const node = dialogRef.current;
    node?.addEventListener("pointerdown", handlePointerDown, true);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => {
      node?.removeEventListener("pointerdown", handlePointerDown, true);
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [isOpen]);

  const triggerExit = useCallback(
    (action: "close" | "resumeRoom" | "soloClassic") => {
      if (isExiting) return;
      if (action === "close") {
        triggerModalHaptic(ImpactStyle.Light);
      } else {
        triggerModalHaptic(ImpactStyle.Medium);
      }

      const execute = () => {
        if (action === "resumeRoom" && pendingRoom) {
          onResumeMultiplayer(pendingRoom);
        } else if (action === "soloClassic") {
          onPlaySoloClassic();
        } else {
          onClose();
        }
      };

      if (reducedMotion || typeof window === "undefined") {
        execute();
        return;
      }

      setIsExiting(true);
      clearExitTimer();
      exitTimerRef.current = window.setTimeout(() => {
        exitTimerRef.current = null;
        execute();
      }, EXIT_DURATION_MS);
    },
    [
      clearExitTimer,
      isExiting,
      onClose,
      onPlaySoloClassic,
      onResumeMultiplayer,
      pendingRoom,
      reducedMotion,
    ]
  );

  // Shared Topmost Keyboard Stack coordinator (ArrowUp/Down, Tab, Escape/Backspace)
  useTopmostModalKeyboardLayer(Boolean(isOpen && pendingRoom), {
    id: "block-sync-resume-choice-modal",
    priority: 40,
    containerRef: dialogRef,
    restoreFocus: true,
    trapFocus: true,
    autoFocus: true,
    onEscape: () => {
      triggerExit("close");
      return true;
    },
    onBackspace: () => {
      triggerExit("close");
      return true;
    },
    onKeyDown: (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return false;
      if (e.key === "Tab") {
        setIsKeyboardNavActive(true);
        return false;
      }
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        const items = getFocusableElements(dialogRef.current);
        if (items.length === 0) return false;
        e.preventDefault();
        setIsKeyboardNavActive(true);
        const activeIdx = items.indexOf(document.activeElement as HTMLElement);
        const nextIdx =
          activeIdx === -1
            ? e.key === "ArrowDown"
              ? 0
              : items.length - 1
            : e.key === "ArrowDown"
              ? (activeIdx + 1) % items.length
              : (activeIdx - 1 + items.length) % items.length;
        const target = items[nextIdx];
        target?.focus({ preventScroll: true });
        target?.scrollIntoView({
          block: "nearest",
          behavior: reducedMotion ? "auto" : "smooth",
        });
        return true;
      }
      if (e.key === "Enter" || e.key === " ") {
        setIsKeyboardNavActive(true);
        return false; // Let focused native button activate cleanly without double-triggering
      }
      return false;
    },
  });

  if (!isOpen || !pendingRoom) return null;

  const isRush = pendingRoom.config.mode === "rush";
  const remainingSec =
    isRush && pendingRoom.rushEndAt
      ? Math.max(0, Math.ceil((pendingRoom.rushEndAt - nowMs) / 1000))
      : null;
  const isRushExpired = isRush && pendingRoom.rushEndAt !== undefined && pendingRoom.rushEndAt <= nowMs;

  const syncAccentClass = isDarkMode ? "text-[#38BDF8]" : "text-[#2B8CEE]";
  const focusRingClass = isKeyboardNavActive
    ? isDarkMode
      ? "focus:outline-none focus:ring-2 focus:ring-[#38BDF8]"
      : "focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
    : "focus:outline-none";

  return (
    <div
      data-block-sync-dialog="true"
      className={`fixed inset-0 z-[55] flex items-center justify-center p-3 transition-opacity ${
        isExiting ? "opacity-0 duration-[160ms] ease-in" : "opacity-100 duration-150"
      } ${isDarkMode ? "bg-black/55 backdrop-blur-[3px]" : "bg-slate-900/25 backdrop-blur-[2px]"}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          triggerExit("close");
        }
      }}
    >
      <style>{`
        @keyframes bsResumeModalEnter {
          from {
            opacity: 0;
            transform: translate3d(0, 12px, 0) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }
      `}</style>

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="block-sync-resume-choice-title"
        style={
          !reducedMotion
            ? isExiting
              ? {
                  opacity: 0,
                  transform: "translate3d(0, 8px, 0) scale(0.96)",
                  transition: "transform 160ms ease-in, opacity 160ms ease-in",
                }
              : {
                  animation: "bsResumeModalEnter 220ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
                }
            : undefined
        }
        className={`w-[calc(100%-24px)] max-w-[380px] max-h-[calc(100dvh-28px-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px))] rounded-3xl p-5 flex flex-col gap-4 border-none select-none overflow-hidden ${
          isDarkMode
            ? "bg-[#141A21] text-slate-100 shadow-[0_18px_46px_rgba(0,0,0,0.58)]"
            : "bg-[#F4F8FB] text-[#2C3E50] shadow-[0_14px_40px_rgba(15,23,42,0.12)]"
        }`}
      >
        {/* Header */}
        <div className="grid grid-cols-[1fr_36px] items-center gap-2 shrink-0">
          <div className="min-w-0 flex flex-col">
            <span className="text-[10px] font-sans font-black uppercase tracking-[0.18em] leading-none">
              <span className={isDarkMode ? "text-slate-200" : "text-[#2C3E50]"}>BLOCK</span>
              <span className={`ml-1 ${syncAccentClass}`}>SYNC</span>
            </span>
            <h3
              id="block-sync-resume-choice-title"
              className="text-lg font-sans font-extrabold tracking-tight leading-tight mt-1 truncate"
            >
              Continue Playing
            </h3>
          </div>

          <button
            type="button"
            onClick={() => triggerExit("close")}
            aria-label="Close"
            title="Close"
            className={`w-9 h-9 rounded-full border-none cursor-pointer flex items-center justify-center transition-all active:scale-95 ${focusRingClass} ${
              isDarkMode
                ? "bg-[#1B242E] hover:bg-[#24303D] text-slate-200"
                : "bg-[#E6F1F8] hover:bg-[#D5E6F3] text-[#49637A]"
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Option Cards */}
        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2.5 pr-0.5">
          {/* Option 1: Resume Multiplayer Room */}
          <button
            type="button"
            id="block-sync-resume-room-option"
            onClick={() => triggerExit("resumeRoom")}
            className={`w-full min-h-[68px] p-3.5 rounded-2xl border-none text-left flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-[0.985] ${focusRingClass} ${
              isDarkMode
                ? "bg-[#1B242E] hover:bg-[#222E3B] ring-1 ring-[#38BDF8]/40 text-slate-100 shadow-[0_8px_20px_rgba(0,0,0,0.32)]"
                : "bg-[#E6F1F8] hover:bg-[#DCEAF5] ring-1 ring-[#2B8CEE]/35 text-[#2C3E50] shadow-[0_6px_18px_rgba(44,62,80,0.06)]"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isRushExpired
                    ? isDarkMode
                      ? "bg-[#4c0519]/80 text-[#fda4af]"
                      : "bg-[#FFE4E6] text-[#9D174D]"
                    : isDarkMode
                      ? "bg-[#0EA5E9]/20 text-[#38BDF8]"
                      : "bg-white/90 text-[#2B8CEE]"
                }`}
              >
                {isRush ? (
                  <Clock className="w-5 h-5 stroke-[2.2]" />
                ) : (
                  <Users className="w-5 h-5 stroke-[2.2]" />
                )}
              </div>

              <div className="min-w-0 flex flex-col">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-sm font-sans font-extrabold tracking-tight truncate tabular-nums">
                    Room {pendingRoom.config.roomCode}
                  </span>
                </div>
                <span className="mt-0.5 text-[11.5px] font-sans opacity-75 truncate tabular-nums">
                  {isRush
                    ? isRushExpired
                      ? `Time Up · Tap to submit (${pendingRoom.score.toLocaleString()})`
                      : `Time Rush ${formatMmSs(remainingSec ?? 0)} · Score ${pendingRoom.score.toLocaleString()}`
                    : `Classic · Score ${pendingRoom.score.toLocaleString()}`}
                </span>
              </div>
            </div>

            <span
              className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider ${
                isRushExpired
                  ? isDarkMode
                    ? "bg-[#4c0519] text-[#fda4af]"
                    : "bg-[#FFE4E6] text-[#9D174D]"
                  : isDarkMode
                    ? "bg-[#10B981]/20 text-[#34D399]"
                    : "bg-[#D1FAE5] text-[#065F46]"
              }`}
            >
              {isRushExpired ? "TIME UP" : "LIVE"}
            </span>
          </button>

          {/* Option 2: Play Solo Classic */}
          <button
            type="button"
            id="block-sync-resume-solo-option"
            onClick={() => triggerExit("soloClassic")}
            className={`w-full min-h-[68px] p-3.5 rounded-2xl border-none text-left flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-[0.985] ${focusRingClass} ${
              isDarkMode
                ? "bg-[#1B242E]/75 hover:bg-[#1B242E] text-slate-100"
                : "bg-white/90 hover:bg-white text-[#2C3E50] shadow-[0_4px_14px_rgba(44,62,80,0.05)]"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isDarkMode
                    ? "bg-white/[0.06] text-slate-200"
                    : "bg-[#E6F1F8] text-[#49637A]"
                }`}
              >
                {soloSavedScore != null ? (
                  <Play className="w-4.5 h-4.5 stroke-[2.3]" />
                ) : (
                  <Sparkles className="w-4.5 h-4.5 stroke-[2.2]" />
                )}
              </div>

              <div className="min-w-0 flex flex-col">
                <span className="text-sm font-sans font-extrabold tracking-tight truncate">
                  Play Solo Classic
                </span>
                <span className="mt-0.5 text-[11.5px] font-sans opacity-75 truncate tabular-nums">
                  {soloSavedScore != null
                    ? `Resume saved board (${soloSavedScore.toLocaleString()})`
                    : "Start fresh Classic run"}
                </span>
                <span className="mt-0.5 text-[10.5px] font-sans opacity-55 truncate">
                  Multiplayer room stays active
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
