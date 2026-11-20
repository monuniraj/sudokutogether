import React, { useCallback, useEffect, useRef, useState } from "react";
import { X, Users, ChevronRight, Grid3X3, WifiOff, Clock } from "lucide-react";
import { useTranslation } from "../../i18n/useTranslation";
import { BlockSyncLogo } from "../../games/blocks/BlockSyncLogo";
import type { BlockSyncPendingRoomSession } from "../../games/blocks/blocksRoomEngine";
import {
  getFocusableElements,
  handleRovingMenuArrowKey,
  useTopmostModalKeyboardLayer,
} from "../../utils/keyboardControls";

export interface MultiplayerForkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: () => void;
  onOpenJoinRoom: () => void;
  isOnline: boolean;
  darkMode: boolean;
  playClickSound: () => void;
  pendingBlocksRoom?: BlockSyncPendingRoomSession | null;
  onResumePendingBlocksRoom?: (session: BlockSyncPendingRoomSession) => void;
}

function formatMmSs(totalSec: number): string {
  const safe = Math.max(0, Math.floor(totalSec));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export const MultiplayerForkModal: React.FC<MultiplayerForkModalProps> = ({
  isOpen,
  onClose,
  onCreateRoom,
  onOpenJoinRoom,
  isOnline,
  darkMode,
  playClickSound,
  pendingBlocksRoom = null,
  onResumePendingBlocksRoom,
}) => {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  const handleDismiss = useCallback(() => {
    onCloseRef.current();
  }, []);

  // Live 1s countdown ticker for pending Time Rush Block Sync rooms
  useEffect(() => {
    if (
      !isOpen ||
      !pendingBlocksRoom ||
      pendingBlocksRoom.config.mode !== "rush" ||
      !pendingBlocksRoom.rushEndAt
    ) {
      return;
    }
    setNowMs(Date.now());
    const id = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => window.clearInterval(id);
  }, [isOpen, pendingBlocksRoom?.config.mode, pendingBlocksRoom?.rushEndAt]);

  useEffect(() => {
    if (!isOpen) return;
    const focusTimer = window.setTimeout(() => {
      const currentActive = document.activeElement as HTMLElement | null;
      if (currentActive && dialogRef.current?.contains(currentActive)) {
        return;
      }
      const menuButtons = getFocusableElements(menuRef.current);
      if (menuButtons.length > 0) {
        menuButtons[0].focus({ preventScroll: true });
      } else {
        const dialogFocusables = getFocusableElements(dialogRef.current);
        dialogFocusables[0]?.focus({ preventScroll: true });
      }
    }, 30);
    return () => window.clearTimeout(focusTimer);
  }, [isOpen, isOnline, Boolean(pendingBlocksRoom)]);

  // Shared Topmost Keyboard Stack coordinator (vertical menu roving + Escape/Backspace + Tab trap)
  useTopmostModalKeyboardLayer(isOpen, {
    id: "multiplayer-fork-modal",
    priority: 25,
    containerRef: dialogRef,
    restoreFocus: true,
    trapFocus: true,
    onEscape: () => {
      handleDismiss();
      return true;
    },
    onBackspace: () => {
      handleDismiss();
      return true;
    },
    onKeyDown: (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return false;
      const menuButtons = getFocusableElements(menuRef.current);
      if (
        menuButtons.length > 0 &&
        (e.key === "ArrowUp" ||
          e.key === "ArrowDown" ||
          e.key === "Home" ||
          e.key === "End")
      ) {
        return handleRovingMenuArrowKey(e, menuButtons, "vertical");
      }
      return false;
    },
  });

  if (!isOpen) return null;

  const hasResumeRoomCard = Boolean(pendingBlocksRoom && onResumePendingBlocksRoom);
  const isRushRoom = pendingBlocksRoom?.config.mode === "rush";
  const rushRemainingSec =
    isRushRoom && pendingBlocksRoom?.rushEndAt
      ? Math.max(0, Math.ceil((pendingBlocksRoom.rushEndAt - nowMs) / 1000))
      : null;
  const isRushExpired =
    isRushRoom &&
    pendingBlocksRoom?.rushEndAt !== undefined &&
    pendingBlocksRoom.rushEndAt <= nowMs;

  return (
    <div
      ref={dialogRef}
      key="multiplayer-fork-modal"
      role="dialog"
      aria-modal="true"
      aria-label={isOnline ? t("multiplayerLobbyTitle") : t("multiplayerUnavailable")}
      className={`relative w-full max-w-[400px] max-h-[calc(100dvh-28px-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px))] overflow-hidden rounded-3xl p-6 border-none flex flex-col gap-5 select-none z-[10001] ${
        darkMode ? "bg-[#1A1A1A] text-stone-200" : "bg-[#FDFBF7] text-stone-850"
      }`}
      style={{
        boxShadow: darkMode ? '0 10px 40px rgba(0,0,0,0.6)' : '0 4px 20px rgba(0,0,0,0.08)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col text-left">
          <span className={`text-[10px] font-sans font-black tracking-widest uppercase ${darkMode ? "text-purple-400" : "text-[#6B21A8]"}`}>
            SudokuSync
          </span>
          <h3 className="text-xl font-sans font-black tracking-tight leading-normal overflow-visible text-stone-850 dark:text-stone-100 mt-0.5">
            {isOnline ? t("multiplayerLobbyTitle") : t("multiplayerUnavailable")}
          </h3>
        </div>
        <button
          type="button"
          aria-label={t("closeTooltip")}
          onClick={() => {
            playClickSound();
            handleDismiss();
          }}
          className="p-1.5 rounded-full text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 hover:bg-stone-150 dark:hover:bg-zinc-800 transition-colors border-none cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {!isOnline ? (
        /* 🚫 OFFLINE STATE: Prominent universal WifiOff notice & honest messaging */
        <div className="flex flex-col items-center justify-center py-2 px-1 text-center">
          {/* Prominent Wifi-Off Icon (Language-barrier safe) */}
          <div className={`p-4 rounded-3xl mb-4 flex items-center justify-center ${
            darkMode ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
          }`}>
            <WifiOff className="w-14 h-14 stroke-[2]" />
          </div>

          <h4 className="text-lg font-sans font-black tracking-tight leading-normal overflow-visible text-stone-900 dark:text-stone-100 mb-1.5">
            {t("youAreOffline")}
          </h4>
          <p className="text-xs sm:text-sm font-sans font-medium text-stone-500 dark:text-stone-400 max-w-[280px] leading-relaxed mb-5">
            {t("offlineNoticeSub")}
          </p>

          <button
            type="button"
            onClick={() => {
              playClickSound();
              handleDismiss();
            }}
            className={`w-full py-3 px-4 rounded-2xl font-sans font-black text-xs uppercase tracking-wider transition-all duration-150 border-none cursor-pointer shadow-sm active:scale-[0.98] truncate leading-normal overflow-visible ${
              darkMode
                ? "bg-zinc-800 hover:bg-zinc-700 text-stone-200"
                : "bg-stone-200 hover:bg-stone-300 text-stone-800"
            }`}
          >
            {t("gotItAction")}
          </button>
        </div>
      ) : (
        /* 🌐 ONLINE ROUTES: Resume Pending Room (when active) + Create Room & Join Room */
        <div
          ref={menuRef}
          role="menu"
          className="grid grid-cols-1 gap-2.5 overflow-y-auto min-h-0 pr-0.5"
        >
          {hasResumeRoomCard && pendingBlocksRoom && (
            <button
              type="button"
              role="menuitem"
              id="multiplayer-fork-resume-blocks-button"
              onClick={() => {
                playClickSound();
                onResumePendingBlocksRoom?.(pendingBlocksRoom);
              }}
              className={`w-full py-3 px-4 rounded-2xl flex items-center justify-between gap-2.5 border-none cursor-pointer transition-all duration-150 text-left shadow-xs active:scale-[0.98] ${
                darkMode
                  ? "bg-[#1B242E] hover:bg-[#222E3B] text-slate-100 ring-1 ring-[#38BDF8]/40"
                  : "bg-[#E6F1F8] hover:bg-[#DCEAF5] text-[#2C3E50] ring-1 ring-[#2B8CEE]/35"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <BlockSyncLogo size={32} isDarkMode={darkMode} />
                <div className="min-w-0 flex flex-col">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-sans font-black text-xs uppercase tracking-wider truncate tabular-nums">
                      Resume Room {pendingBlocksRoom.config.roomCode}
                    </span>
                    <span
                      className={`shrink-0 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-black uppercase tracking-wider ${
                        isRushExpired
                          ? darkMode
                            ? "bg-[#4c0519] text-[#fda4af]"
                            : "bg-[#FFE4E6] text-[#9D174D]"
                          : darkMode
                            ? "bg-[#10B981]/20 text-[#34D399]"
                            : "bg-[#D1FAE5] text-[#065F46]"
                      }`}
                    >
                      {isRushExpired ? "TIME UP" : "LIVE"}
                    </span>
                  </div>
                  <span className="mt-0.5 text-[11px] font-sans font-semibold opacity-75 truncate tabular-nums inline-flex items-center gap-1">
                    {isRushRoom && <Clock className="w-3 h-3 shrink-0" />}
                    {isRushRoom
                      ? isRushExpired
                        ? `Time Up · Tap to submit (${pendingBlocksRoom.score.toLocaleString()})`
                        : `Time Rush ${formatMmSs(rushRemainingSec ?? 0)} · Score ${pendingBlocksRoom.score.toLocaleString()}`
                      : `Classic · Score ${pendingBlocksRoom.score.toLocaleString()}`}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 stroke-[2.5] opacity-60 shrink-0" />
            </button>
          )}

          {/* Route 1: Create Room */}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              playClickSound();
              onCreateRoom();
            }}
            className={`w-full py-3 px-4 rounded-2xl flex items-center justify-between border-none cursor-pointer transition-all duration-150 text-left shadow-xs active:scale-[0.98] ${
              darkMode 
                ? "bg-[#2e1065]/40 hover:bg-[#2e1065]/60 text-purple-200 border border-purple-900/40" 
                : "bg-[#F3E8FF] hover:bg-[#e9d5ff] active:bg-[#d8b4fe] text-[#6B21A8]"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl flex items-center justify-center ${darkMode ? "bg-purple-900/60 text-purple-300" : "bg-white/80 text-[#6B21A8] shadow-xs"}`}>
                <Users className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="font-sans font-black text-sm uppercase tracking-wider leading-normal overflow-visible truncate py-0.5">
                {t("createRoomTitle")}
              </span>
            </div>
            <ChevronRight className="w-5 h-5 stroke-[2.5] opacity-60 shrink-0" />
          </button>

          {/* Route 2: Join Room */}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              playClickSound();
              onOpenJoinRoom();
            }}
            className={`w-full py-3 px-4 rounded-2xl flex items-center justify-between border-none cursor-pointer transition-all duration-150 text-left shadow-xs active:scale-[0.98] ${
              darkMode 
                ? "bg-[#0c4a6e]/40 hover:bg-[#0c4a6e]/60 text-sky-200 border border-sky-900/40" 
                : "bg-[#E0F2FE] hover:bg-[#bae6fd] active:bg-[#7dd3fc] text-[#0369a1]"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl flex items-center justify-center ${darkMode ? "bg-sky-900/60 text-sky-300" : "bg-white/80 text-[#0369a1] shadow-xs"}`}>
                <Grid3X3 className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="font-sans font-black text-sm uppercase tracking-wider leading-normal overflow-visible truncate py-0.5">
                {t("joinRoomTitle")}
              </span>
            </div>
            <ChevronRight className="w-5 h-5 stroke-[2.5] opacity-60 shrink-0" />
          </button>
        </div>
      )}
    </div>
  );
};
