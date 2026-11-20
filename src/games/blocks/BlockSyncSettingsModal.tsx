import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  Check,
  ChevronRight,
  Gamepad2,
  Globe,
  Grid3X3,
  History,
  Home,
  Music,
  RotateCcw,
  Star,
  Trophy,
  Vibrate,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import {
  BlocksMatchRecord,
  getBlocksMatchHistory,
  loadBlocksVault,
} from "../../utils/storageEngine";
import { Language } from "../../i18n/translations";
import { useTranslation } from "../../i18n/useTranslation";
import { BlockSyncEndGameModal } from "./BlockSyncEndGameModal";
import { BlockSyncLogo } from "./BlockSyncLogo";

export type BlockSyncSettingsAudioCue =
  | "open"
  | "close"
  | "toggleOn"
  | "toggleOff"
  | "rowTap"
  | "replayConfirm";

export interface BlockSyncSettingsModalProps {
  darkMode: boolean;
  uid?: string | null;
  currentScore: number;
  tileClasses: Record<string, string>;
  soundOn: boolean;
  musicOn: boolean;
  vibrationsOn: boolean;
  language?: Language;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onToggleVibrations: () => void;
  onChangeLanguage?: (lang: Language) => void;
  onReplay: () => void;
  onGoHome: () => void;
  onOpenMoreGames?: () => void;
  onClose: () => void;
  onPlayUiSound?: (cue: BlockSyncSettingsAudioCue) => void;
  onTriggerHaptic?: (kind: "light" | "medium") => void;
}

type SettingsView = "main" | "history" | "stats" | "language" | "moreGames";

interface MoLogicGameCatalogEntry {
  id: "sudoku-sync" | "block-sync" | string;
  primaryWord: string;
  brandWord: string;
  subtitle: string;
  isActive: boolean;
}

const MO_LOGIC_GAMES_CATALOG: readonly MoLogicGameCatalogEntry[] = [
  {
    id: "sudoku-sync",
    primaryWord: "SUDOKU",
    brandWord: "SYNC",
    subtitle: "Classic 9×9 & Live Rooms",
    isActive: false,
  },
  {
    id: "block-sync",
    primaryWord: "BLOCK",
    brandWord: "SYNC",
    subtitle: "Zen 9×9 Polyomino Puzzle",
    isActive: true,
  },
];

const EXIT_DURATION_MS = 170;
const REPLAY_CONFIRM_TIMEOUT_MS = 3000;
const MAIN_ACTION_COUNT = 6; // History(2), Statistics(3), Language(4), More Games(5), Replay(6), Home(7)
const MAIN_TOTAL_ITEMS = 2 + MAIN_ACTION_COUNT; // Sound(0), Vibration(1), Action Rows(2..7)

function checkPrefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function formatMatchDateTime(iso: string): string {
  const parsed = Date.parse(iso);
  if (!Number.isFinite(parsed) || parsed <= 0) return "Recent match";
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(parsed));
  } catch {
    return "Recent match";
  }
}

function formatRunDate(ts: number): string {
  if (!Number.isFinite(ts) || ts <= 0) return "Prior best";
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
    }).format(new Date(ts));
  } catch {
    return "Saved run";
  }
}

function isValid9x9Grid(grid: (string | null)[][] | undefined): boolean {
  return (
    Array.isArray(grid) &&
    grid.length === 9 &&
    grid.every((row) => Array.isArray(row) && row.length === 9)
  );
}

function isEditableFocusedElement(): boolean {
  if (typeof document === "undefined") return false;
  const el = document.activeElement as HTMLElement | null;
  if (!el) return false;
  return (
    el.tagName === "INPUT" ||
    el.tagName === "TEXTAREA" ||
    el.tagName === "SELECT" ||
    el.isContentEditable
  );
}

export const BlockSyncSettingsModal: React.FC<BlockSyncSettingsModalProps> = ({
  darkMode,
  uid,
  currentScore,
  tileClasses,
  soundOn,
  vibrationsOn,
  language: languageProp,
  onToggleSound,
  onToggleVibrations,
  onChangeLanguage,
  onReplay,
  onGoHome,
  onOpenMoreGames,
  onClose,
  onPlayUiSound,
  onTriggerHaptic,
}) => {
  const reducedMotion = useMemo(() => checkPrefersReducedMotion(), []);
  const { language: hookLanguage, setLanguage, languages } = useTranslation();
  const activeLanguage = languageProp || hookLanguage;

  const [backdropVisible, setBackdropVisible] = useState<boolean>(reducedMotion);
  const [cardVisible, setCardVisible] = useState<boolean>(reducedMotion);
  const [isExiting, setIsExiting] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<SettingsView>("main");
  const [confirmReplay, setConfirmReplay] = useState<boolean>(false);
  const [bouncedToggle, setBouncedToggle] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<BlocksMatchRecord | null>(null);

  // Mouse-free 2D keyboard navigation states
  const [keyboardNavActive, setKeyboardNavActive] = useState<boolean>(false);
  const [mainSelectedIndex, setMainSelectedIndex] = useState<number | null>(null);
  const [subSelectedIndex, setSubSelectedIndex] = useState<number | null>(null);

  const timersRef = useRef<Set<number>>(new Set());
  const replayConfirmTimerRef = useRef<number | null>(null);
  const toggleBounceTimerRef = useRef<number | null>(null);
  const exitLockRef = useRef<boolean>(false);
  const lastToggleColRef = useRef<0 | 1>(0);
  const itemRefs = useRef<Record<string, HTMLElement | null>>({});
  const statsScrollRef = useRef<HTMLDivElement | null>(null);

  const onCloseRef = useRef(onClose);
  const onReplayRef = useRef(onReplay);
  const onGoHomeRef = useRef(onGoHome);
  const onOpenMoreGamesRef = useRef(onOpenMoreGames);
  const onPlayUiSoundRef = useRef(onPlayUiSound);
  const onTriggerHapticRef = useRef(onTriggerHaptic);
  const onToggleSoundRef = useRef(onToggleSound);
  const onToggleVibrationsRef = useRef(onToggleVibrations);
  const onChangeLanguageRef = useRef(onChangeLanguage);

  onCloseRef.current = onClose;
  onReplayRef.current = onReplay;
  onGoHomeRef.current = onGoHome;
  onOpenMoreGamesRef.current = onOpenMoreGames;
  onPlayUiSoundRef.current = onPlayUiSound;
  onTriggerHapticRef.current = onTriggerHaptic;
  onToggleSoundRef.current = onToggleSound;
  onToggleVibrationsRef.current = onToggleVibrations;
  onChangeLanguageRef.current = onChangeLanguage;

  // Read isolated Block Sync vault & history strictly for current UID
  const vault = useMemo(() => loadBlocksVault(uid), [uid]);
  const matchHistory = useMemo(() => getBlocksMatchHistory(uid), [uid]);
  const topRuns = vault.topRuns ?? [];
  const interactiveMoreGames = useMemo(
    () => MO_LOGIC_GAMES_CATALOG.filter((g) => !g.isActive),
    []
  );

  const statsSummary = useMemo(() => {
    const gamesPlayed = Math.max(
      vault.gamesPlayed ?? 0,
      matchHistory.length,
      topRuns.length
    );
    const scoreSamples =
      matchHistory.length > 0
        ? matchHistory.map((m) => m.score)
        : topRuns.map((r) => r.score);
    const averageScore =
      scoreSamples.length > 0
        ? Math.round(
            scoreSamples.reduce((acc, s) => acc + s, 0) / scoreSamples.length
          )
        : 0;
    return {
      bestScore: vault.bestScore,
      gamesPlayed,
      averageScore,
    };
  }, [matchHistory, topRuns, vault.bestScore, vault.gamesPlayed]);

  const activeLanguageLabel = useMemo(() => {
    return (
      languages.find((l) => l.code === activeLanguage)?.nativeName ||
      activeLanguage
    );
  }, [activeLanguage, languages]);

  const scheduleTimer = useCallback((fn: () => void, delayMs: number): number => {
    const id = window.setTimeout(() => {
      timersRef.current.delete(id);
      fn();
    }, delayMs);
    timersRef.current.add(id);
    return id;
  }, []);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current.clear();
    if (replayConfirmTimerRef.current !== null) {
      window.clearTimeout(replayConfirmTimerRef.current);
      replayConfirmTimerRef.current = null;
    }
    if (toggleBounceTimerRef.current !== null) {
      window.clearTimeout(toggleBounceTimerRef.current);
      toggleBounceTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    exitLockRef.current = false;
    setMainSelectedIndex(null);
    setSubSelectedIndex(null);
    setKeyboardNavActive(false);
    onPlayUiSoundRef.current?.("open");

    if (reducedMotion) {
      setBackdropVisible(true);
      setCardVisible(true);
      return () => clearAllTimers();
    }

    const rafId = window.requestAnimationFrame(() => {
      setBackdropVisible(true);
    });
    scheduleTimer(() => {
      setCardVisible(true);
    }, 40);

    return () => {
      window.cancelAnimationFrame(rafId);
      clearAllTimers();
    };
  }, [clearAllTimers, reducedMotion, scheduleTimer]);

  // Reset selection cleanly whenever switching views
  useEffect(() => {
    setMainSelectedIndex(null);
    setSubSelectedIndex(null);
  }, [activeView]);

  // Keep keyboard-selected element scrolled into view inside scrollable containers
  useEffect(() => {
    if (!keyboardNavActive) return;
    if (activeView === "main" && mainSelectedIndex !== null) {
      itemRefs.current[`main-${mainSelectedIndex}`]?.scrollIntoView({
        block: "nearest",
      });
    } else if (activeView !== "main" && subSelectedIndex !== null) {
      itemRefs.current[`${activeView}-${subSelectedIndex}`]?.scrollIntoView({
        block: "nearest",
      });
    }
  }, [activeView, keyboardNavActive, mainSelectedIndex, subSelectedIndex]);

  const triggerExit = useCallback(
    (action: "close" | "replay" | "home" | "moreGames") => {
      if (exitLockRef.current) return;
      exitLockRef.current = true;
      clearAllTimers();

      if (action === "close") {
        onPlayUiSoundRef.current?.("close");
      }

      const finish = () => {
        if (action === "close") onCloseRef.current();
        else if (action === "replay") onReplayRef.current();
        else if (action === "home") onGoHomeRef.current();
        else if (action === "moreGames") {
          if (onOpenMoreGamesRef.current) {
            onOpenMoreGamesRef.current();
          } else {
            onGoHomeRef.current();
          }
        }
      };

      if (reducedMotion) {
        finish();
        return;
      }

      setIsExiting(true);
      setBackdropVisible(false);
      scheduleTimer(finish, EXIT_DURATION_MS);
    },
    [clearAllTimers, reducedMotion, scheduleTimer]
  );

  const triggerQuickToggle = useCallback(
    (
      key: "sound" | "vibration",
      currentlyOn: boolean,
      toggleFn: () => void
    ) => {
      const nextOn = !currentlyOn;
      toggleFn();

      if (key === "sound") {
        if (nextOn) onPlayUiSoundRef.current?.("toggleOn");
      } else {
        onPlayUiSoundRef.current?.(nextOn ? "toggleOn" : "toggleOff");
      }

      if (key === "vibration") {
        if (nextOn) onTriggerHapticRef.current?.("light");
      } else {
        onTriggerHapticRef.current?.("light");
      }

      setBouncedToggle(key);
      if (toggleBounceTimerRef.current !== null) {
        window.clearTimeout(toggleBounceTimerRef.current);
      }
      toggleBounceTimerRef.current = window.setTimeout(() => {
        setBouncedToggle(null);
        toggleBounceTimerRef.current = null;
      }, 140);
    },
    []
  );

  const handleOpenSubView = useCallback(
    (view: Exclude<SettingsView, "main">) => {
      onPlayUiSoundRef.current?.("rowTap");
      onTriggerHapticRef.current?.("light");
      setConfirmReplay(false);
      setActiveView(view);
    },
    []
  );

  const handleBackToMain = useCallback(() => {
    onPlayUiSoundRef.current?.("rowTap");
    onTriggerHapticRef.current?.("light");
    setConfirmReplay(false);
    setActiveView("main");
  }, []);

  const handleReplayClick = useCallback(() => {
    if (currentScore <= 0) {
      onPlayUiSoundRef.current?.("replayConfirm");
      onTriggerHapticRef.current?.("medium");
      triggerExit("replay");
      return;
    }

    if (!confirmReplay) {
      onPlayUiSoundRef.current?.("rowTap");
      onTriggerHapticRef.current?.("light");
      setConfirmReplay(true);
      if (replayConfirmTimerRef.current !== null) {
        window.clearTimeout(replayConfirmTimerRef.current);
      }
      replayConfirmTimerRef.current = window.setTimeout(() => {
        setConfirmReplay(false);
        replayConfirmTimerRef.current = null;
      }, REPLAY_CONFIRM_TIMEOUT_MS);
      return;
    }

    onPlayUiSoundRef.current?.("replayConfirm");
    onTriggerHapticRef.current?.("medium");
    triggerExit("replay");
  }, [confirmReplay, currentScore, triggerExit]);

  const activateMainIndex = useCallback(
    (idx: number) => {
      if (idx === 0) {
        lastToggleColRef.current = 0;
        triggerQuickToggle("sound", soundOn, onToggleSoundRef.current);
      } else if (idx === 1) {
        lastToggleColRef.current = 1;
        triggerQuickToggle(
          "vibration",
          vibrationsOn,
          onToggleVibrationsRef.current
        );
      } else if (idx === 2) {
        handleOpenSubView("history");
      } else if (idx === 3) {
        handleOpenSubView("stats");
      } else if (idx === 4) {
        handleOpenSubView("language");
      } else if (idx === 5) {
        handleOpenSubView("moreGames");
      } else if (idx === 6) {
        handleReplayClick();
      } else if (idx === 7) {
        onPlayUiSoundRef.current?.("rowTap");
        onTriggerHapticRef.current?.("light");
        triggerExit("home");
      }
    },
    [
      handleOpenSubView,
      handleReplayClick,
      soundOn,
      triggerExit,
      triggerQuickToggle,
      vibrationsOn,
    ]
  );

  // Full Mouse-Free Keyboard Navigation + Layered Escape/Backspace Step-Back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditableFocusedElement()) return;
      if (selectedMatch) return;

      // Layered step back on Escape or Backspace
      if (e.key === "Escape" || e.key === "Backspace") {
        e.preventDefault();
        e.stopPropagation();
        if (activeView !== "main") {
          handleBackToMain();
          return;
        }
        triggerExit("close");
        return;
      }

      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === "Tab") {
        setKeyboardNavActive(true);
        return;
      }

      const isArrowKey =
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight";

      if (isArrowKey) {
        e.preventDefault();
        e.stopPropagation();
        setKeyboardNavActive(true);

        // Clear native DOM focus so only the dedicated sky-cyan keyboard ring shows
        if (
          document.activeElement instanceof HTMLElement &&
          document.activeElement.closest('[data-block-sync-dialog="true"]')
        ) {
          document.activeElement.blur();
        }

        if (activeView === "main") {
          setMainSelectedIndex((prev) => {
            if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
              if (prev === null) {
                const next = e.key === "ArrowLeft" ? 1 : 0;
                lastToggleColRef.current = next;
                return next;
              }
              if (prev === 0 || prev === 1) {
                const next = prev === 0 ? 1 : 0;
                lastToggleColRef.current = next;
                return next;
              }
              return prev;
            }
            if (e.key === "ArrowDown") {
              if (prev === null) return 0;
              if (prev === 0 || prev === 1) return 2;
              if (prev >= MAIN_TOTAL_ITEMS - 1) return lastToggleColRef.current;
              return prev + 1;
            }
            // ArrowUp
            if (prev === null) return MAIN_TOTAL_ITEMS - 1;
            if (prev === 0 || prev === 1) return MAIN_TOTAL_ITEMS - 1;
            if (prev === 2) return lastToggleColRef.current;
            return prev - 1;
          });
          return;
        }

        if (activeView === "stats") {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            statsScrollRef.current?.scrollBy({
              top: e.key === "ArrowDown" ? 56 : -56,
              behavior: reducedMotion ? "auto" : "smooth",
            });
          }
          return;
        }

        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          const itemCount =
            activeView === "history"
              ? matchHistory.length
              : activeView === "language"
                ? languages.length
                : interactiveMoreGames.length;
          if (itemCount <= 0) return;

          setSubSelectedIndex((prev) => {
            if (prev === null) {
              return e.key === "ArrowDown" ? 0 : itemCount - 1;
            }
            if (e.key === "ArrowDown") {
              return (prev + 1) % itemCount;
            }
            return (prev - 1 + itemCount) % itemCount;
          });
        }
        return;
      }

      if (e.key === "Enter" || e.key === " " || e.code === "Space") {
        if (!keyboardNavActive) return;

        if (activeView === "main" && mainSelectedIndex !== null) {
          e.preventDefault();
          e.stopPropagation();
          activateMainIndex(mainSelectedIndex);
          return;
        }

        if (activeView === "history" && subSelectedIndex !== null) {
          const match = matchHistory[subSelectedIndex];
          if (match) {
            e.preventDefault();
            e.stopPropagation();
            onPlayUiSoundRef.current?.("rowTap");
            onTriggerHapticRef.current?.("light");
            setSelectedMatch(match);
          }
          return;
        }

        if (activeView === "language" && subSelectedIndex !== null) {
          const langOpt = languages[subSelectedIndex];
          if (langOpt) {
            e.preventDefault();
            e.stopPropagation();
            onPlayUiSoundRef.current?.("rowTap");
            onTriggerHapticRef.current?.("light");
            setLanguage(langOpt.code);
            onChangeLanguageRef.current?.(langOpt.code);
          }
          return;
        }

        if (activeView === "moreGames" && subSelectedIndex !== null) {
          const game = interactiveMoreGames[subSelectedIndex];
          if (game) {
            e.preventDefault();
            e.stopPropagation();
            onPlayUiSoundRef.current?.("rowTap");
            onTriggerHapticRef.current?.("light");
            triggerExit("moreGames");
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [
    activateMainIndex,
    activeView,
    handleBackToMain,
    interactiveMoreGames,
    keyboardNavActive,
    languages,
    mainSelectedIndex,
    matchHistory,
    reducedMotion,
    selectedMatch,
    setLanguage,
    subSelectedIndex,
    triggerExit,
  ]);

  const headerTitle =
    activeView === "history"
      ? "Match History"
      : activeView === "stats"
        ? "Statistics"
        : activeView === "language"
          ? "Language"
          : activeView === "moreGames"
            ? "More Games"
            : "Settings";

  const kbRingClass = darkMode
    ? "ring-2 ring-inset ring-[#38BDF8]"
    : "ring-2 ring-inset ring-[#2B8CEE]";

  const isMainSelected = (idx: number) =>
    keyboardNavActive && mainSelectedIndex === idx;
  const isSubSelected = (idx: number) =>
    keyboardNavActive && subSelectedIndex === idx;

  const setItemRef = (key: string) => (el: HTMLElement | null) => {
    itemRefs.current[key] = el;
  };

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        data-block-sync-dialog="true"
        aria-labelledby="block-sync-settings-title"
        onPointerMove={() => {
          if (keyboardNavActive) setKeyboardNavActive(false);
        }}
        onPointerDown={() => {
          if (keyboardNavActive) setKeyboardNavActive(false);
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget && !selectedMatch) {
            triggerExit("close");
          }
        }}
        className={`fixed inset-0 z-50 flex items-center justify-center p-3 backdrop-blur-sm transition-opacity ${
          isExiting ? "duration-[170ms] ease-in" : "duration-[130ms] ease-out"
        } ${backdropVisible ? "opacity-100" : "opacity-0"} ${
          darkMode ? "bg-black/60" : "bg-[#2C3E50]/25"
        }`}
      >
        <style>{`
          @keyframes bsSettingsSlideIn {
            0% { transform: translateX(14px); opacity: 0; }
            100% { transform: translateX(0); opacity: 1; }
          }
          @keyframes bsQuickToggleBounce {
            0% { transform: scale(1); }
            45% { transform: scale(0.94); }
            100% { transform: scale(1); }
          }
        `}</style>

        <div
          onClick={(e) => e.stopPropagation()}
          style={{ willChange: "transform, opacity" }}
          className={`w-[calc(100%-24px)] max-w-[390px] max-h-[calc(100dvh-32px)] rounded-3xl p-5 border-none flex flex-col gap-3.5 overflow-hidden transition-[transform,opacity] ${
            isExiting
              ? "duration-[170ms] ease-in scale-95 opacity-0"
              : cardVisible
                ? "duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)] scale-100 translate-y-0 opacity-100"
                : "duration-[240ms] scale-[0.94] translate-y-3 opacity-0"
          } ${
            darkMode
              ? "bg-[#141A21] text-slate-100 shadow-[0_24px_60px_rgba(0,0,0,0.62)]"
              : "bg-[#F4F8FB] text-[#2C3E50] shadow-[0_24px_60px_rgba(44,62,80,0.16)]"
          }`}
        >
          {/* Header: Clean Root Settings Header OR Balanced 3-Column Icon-Only Sub-View Header */}
          {activeView === "main" ? (
            <header className="w-full shrink-0 flex items-center justify-between gap-2">
              <div className="min-w-0 flex flex-col text-left">
                <span className="text-[10.5px] leading-none font-semibold uppercase tracking-[0.12em] opacity-55">
                  BLOCK SYNC
                </span>
                <h2
                  id="block-sync-settings-title"
                  className="mt-1 text-[21px] leading-tight font-bold tracking-[-0.02em] truncate"
                >
                  {headerTitle}
                </h2>
              </div>

              <button
                id="block-sync-settings-close-button"
                type="button"
                aria-label="Close"
                title="Close"
                onClick={() => triggerExit("close")}
                className={`w-9 h-9 rounded-full border-none outline-none focus:outline-none shrink-0 flex items-center justify-center cursor-pointer transition-colors duration-150 active:scale-90 ${
                  darkMode
                    ? "bg-[#1B242E] hover:bg-[#24303D] text-slate-300"
                    : "bg-[#E6F1F8] hover:bg-[#D5E6F3] text-[#49637A]"
                }`}
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </header>
          ) : (
            <header className="w-full shrink-0 grid grid-cols-[36px_1fr_36px] items-center gap-2">
              <button
                id="block-sync-settings-back-button"
                type="button"
                aria-label="Back"
                title="Back"
                onClick={handleBackToMain}
                className={`w-9 h-9 rounded-full border-none outline-none focus:outline-none shrink-0 flex items-center justify-center cursor-pointer transition-colors duration-150 active:scale-90 ${
                  darkMode
                    ? "bg-[#1B242E] hover:bg-[#24303D] text-slate-300"
                    : "bg-[#E6F1F8] hover:bg-[#D5E6F3] text-[#49637A]"
                }`}
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              </button>

              <div className="min-w-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10.5px] leading-none font-semibold uppercase tracking-[0.12em] opacity-55">
                  BLOCK SYNC
                </span>
                <h2
                  id="block-sync-settings-title"
                  className="mt-1 text-[21px] leading-tight font-bold tracking-[-0.02em] truncate max-w-full"
                >
                  {headerTitle}
                </h2>
              </div>

              <button
                id="block-sync-settings-close-button"
                type="button"
                aria-label="Close"
                title="Close"
                onClick={() => triggerExit("close")}
                className={`w-9 h-9 rounded-full border-none outline-none focus:outline-none shrink-0 flex items-center justify-center cursor-pointer transition-colors duration-150 active:scale-90 ${
                  darkMode
                    ? "bg-[#1B242E] hover:bg-[#24303D] text-slate-300"
                    : "bg-[#E6F1F8] hover:bg-[#D5E6F3] text-[#49637A]"
                }`}
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </header>
          )}

          {/* MAIN VIEW */}
          {activeView === "main" && (
            <div className="flex-1 min-h-0 flex flex-col gap-3 overflow-y-auto overscroll-contain p-1.5">
              {/* Top 3-Column Quick Toggle Grid */}
              <div
                aria-label="Quick Audio and Haptics Toggles"
                className="w-full shrink-0 grid grid-cols-3 gap-2.5"
              >
                {[
                  {
                    key: "sound" as const,
                    kbIndex: 0 as number | null,
                    label: "Sound",
                    active: soundOn,
                    disabled: false,
                    subLabel: soundOn ? "ON" : "OFF",
                    onClick: () => {
                      lastToggleColRef.current = 0;
                      triggerQuickToggle("sound", soundOn, onToggleSound);
                    },
                    icon: soundOn ? (
                      <Volume2 className="w-5 h-5" aria-hidden="true" />
                    ) : (
                      <VolumeX className="w-5 h-5" aria-hidden="true" />
                    ),
                    accentClass: darkMode
                      ? "bg-[#26D2E6]/18 text-[#6BE6F5] ring-1 ring-[#26D2E6]/35"
                      : "bg-[#47BBF5]/20 text-[#156994] ring-1 ring-[#47BBF5]/40",
                  },
                  {
                    key: "music" as const,
                    kbIndex: null,
                    label: "Music",
                    active: false,
                    disabled: true,
                    subLabel: "Soon",
                    onClick: () => {},
                    icon: <Music className="w-5 h-5" aria-hidden="true" />,
                    accentClass: "",
                  },
                  {
                    key: "vibration" as const,
                    kbIndex: 1 as number | null,
                    label: "Vibration",
                    active: vibrationsOn,
                    disabled: false,
                    subLabel: vibrationsOn ? "ON" : "OFF",
                    onClick: () => {
                      lastToggleColRef.current = 1;
                      triggerQuickToggle(
                        "vibration",
                        vibrationsOn,
                        onToggleVibrations
                      );
                    },
                    icon: <Vibrate className="w-5 h-5" aria-hidden="true" />,
                    accentClass: darkMode
                      ? "bg-[#26D2E6]/18 text-[#6BE6F5] ring-1 ring-[#26D2E6]/35"
                      : "bg-[#47BBF5]/20 text-[#156994] ring-1 ring-[#47BBF5]/40",
                  },
                ].map((tile) => {
                  const selected =
                    tile.kbIndex !== null && isMainSelected(tile.kbIndex);
                  return (
                    <button
                      key={tile.key}
                      ref={
                        tile.kbIndex !== null
                          ? setItemRef(`main-${tile.kbIndex}`)
                          : undefined
                      }
                      id={`block-sync-toggle-${tile.key}`}
                      type="button"
                      disabled={tile.disabled}
                      aria-disabled={tile.disabled || undefined}
                      aria-pressed={tile.disabled ? undefined : tile.active}
                      onClick={tile.disabled ? undefined : tile.onClick}
                      style={
                        bouncedToggle === tile.key &&
                        !reducedMotion &&
                        !tile.disabled
                          ? {
                              animation:
                                "bsQuickToggleBounce 130ms cubic-bezier(0.22, 1, 0.36, 1)",
                            }
                          : undefined
                      }
                      className={`h-[76px] px-2 rounded-2xl border-none outline-none focus:outline-none flex flex-col items-center justify-center gap-1.5 transition-colors duration-150 ${
                        tile.disabled
                          ? darkMode
                            ? "bg-[#1B242E] text-slate-400 opacity-45 cursor-not-allowed"
                            : "bg-[#E6F1F8]/75 text-[#6D859B] opacity-45 cursor-not-allowed"
                          : tile.active
                            ? `${tile.accentClass} cursor-pointer`
                            : darkMode
                              ? "bg-[#1B242E] text-slate-400 opacity-75 hover:opacity-95 cursor-pointer"
                              : "bg-[#E6F1F8]/75 text-[#6D859B] opacity-80 hover:opacity-100 cursor-pointer"
                      } ${selected ? kbRingClass : ""}`}
                    >
                      {tile.icon}
                      <span className="text-[11.5px] font-semibold tracking-tight leading-none">
                        {tile.label}
                      </span>
                      <span className="text-[9.5px] font-bold uppercase tracking-wider opacity-75 leading-none">
                        {tile.subLabel}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Action List (indices 2..7) */}
              <div className="w-full flex flex-col gap-2 pb-0.5">
                {/* 1. History (idx 2) */}
                <button
                  ref={setItemRef("main-2")}
                  id="block-sync-settings-history-row"
                  type="button"
                  onClick={() => handleOpenSubView("history")}
                  className={`w-full h-[50px] px-3.5 rounded-2xl border-none outline-none focus:outline-none flex items-center justify-between gap-2.5 cursor-pointer transition-all duration-150 active:scale-[0.985] ${
                    darkMode
                      ? "bg-[#1B242E] hover:bg-[#222D39] text-slate-100"
                      : "bg-[#E6F1F8]/90 hover:bg-[#DCEAF5] text-[#2C3E50]"
                  } ${isMainSelected(2) ? kbRingClass : ""}`}
                >
                  <div className="min-w-0 flex items-center gap-2.5">
                    <History className="w-4 h-4 shrink-0 opacity-75" aria-hidden="true" />
                    <span className="text-sm font-semibold truncate">History</span>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold tabular-nums ${
                        darkMode
                          ? "bg-[#141A21] text-slate-300"
                          : "bg-white/80 text-[#49637A]"
                      }`}
                    >
                      {matchHistory.length} played
                    </span>
                    <ChevronRight className="w-4 h-4 opacity-50" aria-hidden="true" />
                  </div>
                </button>

                {/* 2. Statistics (idx 3) */}
                <button
                  ref={setItemRef("main-3")}
                  id="block-sync-settings-stats-row"
                  type="button"
                  onClick={() => handleOpenSubView("stats")}
                  className={`w-full h-[50px] px-3.5 rounded-2xl border-none outline-none focus:outline-none flex items-center justify-between gap-2.5 cursor-pointer transition-all duration-150 active:scale-[0.985] ${
                    darkMode
                      ? "bg-[#1B242E] hover:bg-[#222D39] text-slate-100"
                      : "bg-[#E6F1F8]/90 hover:bg-[#DCEAF5] text-[#2C3E50]"
                  } ${isMainSelected(3) ? kbRingClass : ""}`}
                >
                  <div className="min-w-0 flex items-center gap-2.5">
                    <BarChart3 className="w-4 h-4 shrink-0 opacity-75" aria-hidden="true" />
                    <span className="text-sm font-semibold truncate">Statistics</span>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold tabular-nums ${
                        darkMode
                          ? "bg-[#141A21] text-slate-300"
                          : "bg-white/80 text-[#49637A]"
                      }`}
                    >
                      Best {statsSummary.bestScore.toLocaleString()}
                    </span>
                    <ChevronRight className="w-4 h-4 opacity-50" aria-hidden="true" />
                  </div>
                </button>

                {/* 3. Language (idx 4) */}
                <button
                  ref={setItemRef("main-4")}
                  id="block-sync-settings-language-row"
                  type="button"
                  onClick={() => handleOpenSubView("language")}
                  className={`w-full h-[50px] px-3.5 rounded-2xl border-none outline-none focus:outline-none flex items-center justify-between gap-2.5 cursor-pointer transition-all duration-150 active:scale-[0.985] ${
                    darkMode
                      ? "bg-[#1B242E] hover:bg-[#222D39] text-slate-100"
                      : "bg-[#E6F1F8]/90 hover:bg-[#DCEAF5] text-[#2C3E50]"
                  } ${isMainSelected(4) ? kbRingClass : ""}`}
                >
                  <div className="min-w-0 flex items-center gap-2.5">
                    <Globe className="w-4 h-4 shrink-0 opacity-75" aria-hidden="true" />
                    <span className="text-sm font-semibold truncate">Language</span>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold max-w-[110px] truncate ${
                        darkMode
                          ? "bg-[#141A21] text-slate-300"
                          : "bg-white/80 text-[#49637A]"
                      }`}
                    >
                      {activeLanguageLabel}
                    </span>
                    <ChevronRight className="w-4 h-4 opacity-50" aria-hidden="true" />
                  </div>
                </button>

                {/* 4. More Games (idx 5) */}
                <button
                  ref={setItemRef("main-5")}
                  id="block-sync-settings-more-games-row"
                  type="button"
                  onClick={() => handleOpenSubView("moreGames")}
                  className={`w-full h-[50px] px-3.5 rounded-2xl border-none outline-none focus:outline-none flex items-center justify-between gap-2.5 cursor-pointer transition-all duration-150 active:scale-[0.985] ${
                    darkMode
                      ? "bg-[#1B242E] hover:bg-[#222D39] text-slate-100"
                      : "bg-[#E6F1F8]/90 hover:bg-[#DCEAF5] text-[#2C3E50]"
                  } ${isMainSelected(5) ? kbRingClass : ""}`}
                >
                  <div className="min-w-0 flex items-center gap-2.5">
                    <Gamepad2 className="w-4 h-4 shrink-0 opacity-75" aria-hidden="true" />
                    <span className="text-sm font-semibold truncate">More Games</span>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold tabular-nums ${
                        darkMode
                          ? "bg-[#141A21] text-slate-300"
                          : "bg-white/80 text-[#49637A]"
                      }`}
                    >
                      {MO_LOGIC_GAMES_CATALOG.length} games
                    </span>
                    <ChevronRight className="w-4 h-4 opacity-50 shrink-0" aria-hidden="true" />
                  </div>
                </button>

                {/* 5. Replay (idx 6, 2-Tap Accidental-Wipe Guard when score > 0) */}
                <button
                  ref={setItemRef("main-6")}
                  id="block-sync-settings-replay-row"
                  type="button"
                  onClick={handleReplayClick}
                  className={`w-full h-[50px] px-3.5 rounded-2xl border-none outline-none focus:outline-none flex items-center justify-between gap-2.5 cursor-pointer transition-all duration-150 active:scale-[0.985] ${
                    confirmReplay
                      ? darkMode
                        ? "bg-[#F04D70]/22 text-[#FF8CA4] ring-1 ring-[#F04D70]/45"
                        : "bg-amber-100 text-[#9A4E0B] ring-1 ring-amber-400/55"
                      : darkMode
                        ? "bg-[#1B242E] hover:bg-[#222D39] text-slate-100"
                        : "bg-[#E6F1F8]/90 hover:bg-[#DCEAF5] text-[#2C3E50]"
                  } ${isMainSelected(6) ? kbRingClass : ""}`}
                >
                  <div className="min-w-0 flex items-center gap-2.5">
                    <RotateCcw className="w-4 h-4 shrink-0 opacity-80" aria-hidden="true" />
                    <span className="text-sm font-semibold truncate">
                      {confirmReplay ? "Tap again to restart" : "Replay"}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold opacity-65 shrink-0">
                    {confirmReplay ? "Confirm" : "Fresh board"}
                  </span>
                </button>

                {/* 6. Home (idx 7, preserves blocks_*_savedSession) */}
                <button
                  ref={setItemRef("main-7")}
                  id="block-sync-settings-home-row"
                  type="button"
                  onClick={() => {
                    onPlayUiSoundRef.current?.("rowTap");
                    onTriggerHapticRef.current?.("light");
                    triggerExit("home");
                  }}
                  className={`w-full h-[50px] px-3.5 rounded-2xl border-none outline-none focus:outline-none flex items-center justify-between gap-2.5 cursor-pointer transition-all duration-150 active:scale-[0.985] ${
                    darkMode
                      ? "bg-[#1B242E] hover:bg-[#222D39] text-slate-100"
                      : "bg-[#E6F1F8]/90 hover:bg-[#DCEAF5] text-[#2C3E50]"
                  } ${isMainSelected(7) ? kbRingClass : ""}`}
                >
                  <div className="min-w-0 flex items-center gap-2.5">
                    <Home className="w-4 h-4 shrink-0 opacity-75" aria-hidden="true" />
                    <span className="text-sm font-semibold truncate">Home</span>
                  </div>
                  <span className="text-[11px] font-medium opacity-55 shrink-0">
                    Saves progress
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* HISTORY SUB-VIEW */}
          {activeView === "history" && (
            <div
              key="subview-history"
              style={
                !reducedMotion
                  ? {
                      animation:
                        "bsSettingsSlideIn 200ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
                    }
                  : undefined
              }
              className="relative flex-1 min-h-0 flex flex-col overflow-hidden rounded-2xl"
            >
              {matchHistory.length === 0 ? (
                <div
                  id="block-sync-history-empty"
                  className={`w-full rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-center ${
                    darkMode ? "bg-[#1B242E]" : "bg-[#E6F1F8]/90"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                      darkMode
                        ? "bg-[#141A21] text-slate-400"
                        : "bg-white/80 text-[#5B92BF]"
                    }`}
                  >
                    <History className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <p className="text-sm font-bold">No completed matches yet</p>
                  <p className="text-xs opacity-65 max-w-[230px]">
                    Finish a run to save your score and 9×9 board snapshot here.
                  </p>
                </div>
              ) : (
                <>
                  <div
                    id="block-sync-history-list"
                    className="flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-2 pb-5 p-1.5"
                  >
                    {matchHistory.map((match, idx) => {
                      const hasGrid = isValid9x9Grid(match.boardSnapshot);
                      return (
                        <button
                          key={match.id}
                          ref={setItemRef(`history-${idx}`)}
                          type="button"
                          onClick={() => {
                            onPlayUiSoundRef.current?.("rowTap");
                            onTriggerHapticRef.current?.("light");
                            setSelectedMatch(match);
                          }}
                          className={`w-full p-2.5 rounded-2xl border-none outline-none focus:outline-none flex items-center justify-between gap-3 text-left cursor-pointer transition-all duration-150 active:scale-[0.985] ${
                            darkMode
                              ? "bg-[#1B242E] hover:bg-[#222D39] text-slate-100"
                              : "bg-[#E6F1F8]/90 hover:bg-[#DCEAF5] text-[#2C3E50]"
                          } ${isSubSelected(idx) ? kbRingClass : ""}`}
                        >
                          <div className="min-w-0 flex items-center gap-3">
                            {/* Compact 40x40px Mini 9x9 Snapshot */}
                            <div
                              className={`w-10 h-10 shrink-0 p-[3px] rounded-xl ${
                                darkMode
                                  ? "bg-[#141A21] shadow-[inset_0_1px_4px_rgba(0,0,0,0.45)]"
                                  : "bg-white/85 shadow-[inset_0_1px_4px_rgba(140,178,209,0.25)]"
                              }`}
                            >
                              {hasGrid ? (
                                <div className="w-full h-full grid grid-cols-9 grid-rows-9 gap-[1px]">
                                  {match.boardSnapshot.map((rArr, rIdx) =>
                                    rArr.map((colorKey, cIdx) => {
                                      if (colorKey && tileClasses[colorKey]) {
                                        return (
                                          <div
                                            key={`${match.id}-${rIdx}-${cIdx}`}
                                            className={`w-full h-full rounded-[1px] !shadow-none !border-0 ${tileClasses[colorKey]}`}
                                          />
                                        );
                                      }
                                      return (
                                        <div
                                          key={`${match.id}-${rIdx}-${cIdx}`}
                                          className={`w-full h-full rounded-[1px] ${
                                            darkMode
                                              ? "bg-[#23303E]/70"
                                              : "bg-[#E6F1F8]"
                                          }`}
                                        />
                                      );
                                    })
                                  )}
                                </div>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center opacity-50">
                                  <Grid3X3 className="w-4 h-4" aria-hidden="true" />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex flex-col">
                              <span className="text-[17px] leading-tight font-extrabold tabular-nums truncate">
                                {match.score.toLocaleString()}
                              </span>
                              <span className="mt-0.5 text-[11px] opacity-65 truncate">
                                {formatMatchDateTime(match.playedAt)} ·{" "}
                                {match.mode === "multiplayer" ? "Room" : "Solo"}
                              </span>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center gap-1.5">
                            {match.isNewBest && (
                              <span
                                className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-wider ${
                                  darkMode
                                    ? "bg-[#F9CF43]/20 text-[#F9CF43]"
                                    : "bg-amber-200/90 text-[#7A5208]"
                                }`}
                              >
                                <Star className="w-2.5 h-2.5 fill-current" aria-hidden="true" />
                                <span>BEST</span>
                              </span>
                            )}
                            <ChevronRight className="w-4 h-4 opacity-50" aria-hidden="true" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {matchHistory.length > 4 && (
                    <div
                      aria-hidden="true"
                      className={`pointer-events-none absolute inset-x-0 bottom-0 h-6 ${
                        darkMode
                          ? "bg-gradient-to-t from-[#141A21] to-transparent"
                          : "bg-gradient-to-t from-[#F4F8FB] to-transparent"
                      }`}
                    />
                  )}
                </>
              )}
            </div>
          )}

          {/* STATISTICS SUB-VIEW (Strictly Isolated to BlocksVault) */}
          {activeView === "stats" && (
            <div
              key="subview-stats"
              style={
                !reducedMotion
                  ? {
                      animation:
                        "bsSettingsSlideIn 200ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
                    }
                  : undefined
              }
              className="flex-1 min-h-0 flex flex-col gap-3 overflow-hidden"
            >
              <div className="w-full shrink-0 grid grid-cols-3 gap-2">
                {[
                  {
                    label: "BEST SCORE",
                    value: statsSummary.bestScore.toLocaleString(),
                  },
                  {
                    label: "PLAYED",
                    value: statsSummary.gamesPlayed.toLocaleString(),
                  },
                  {
                    label: "AVERAGE",
                    value: statsSummary.averageScore.toLocaleString(),
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className={`rounded-2xl p-3 flex flex-col items-center justify-center text-center ${
                      darkMode ? "bg-[#1B242E]" : "bg-[#E6F1F8]/90"
                    }`}
                  >
                    <span className="text-[9.5px] font-semibold uppercase tracking-[0.10em] opacity-55">
                      {stat.label}
                    </span>
                    <span className="mt-1 text-base sm:text-lg font-extrabold tabular-nums truncate max-w-full">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>

              <div
                className={`flex-1 min-h-0 rounded-2xl p-3 flex flex-col gap-2 overflow-hidden ${
                  darkMode ? "bg-[#1B242E]" : "bg-[#E6F1F8]/90"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.10em] opacity-55">
                  <span>PERSONAL TOP RUNS</span>
                  <span>{topRuns.length} RECORDED</span>
                </div>

                {topRuns.length === 0 ? (
                  <div className="py-6 flex flex-col items-center justify-center gap-1.5 text-center opacity-70">
                    <Trophy className="w-5 h-5 opacity-75" aria-hidden="true" />
                    <span className="text-xs font-medium">
                      Complete a match to rank your best Block Sync scores.
                    </span>
                  </div>
                ) : (
                  <div
                    ref={statsScrollRef}
                    id="block-sync-stats-scroll"
                    className="flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-1.5 p-1.5"
                  >
                    {topRuns.map((run, idx) => (
                      <div
                        key={run.id}
                        className={`px-3 py-2 rounded-xl flex items-center justify-between gap-2 text-xs ${
                          idx === 0
                            ? darkMode
                              ? "bg-[#243445] text-slate-50"
                              : "bg-white/95 text-[#223447]"
                            : darkMode
                              ? "bg-[#141A21]/75 text-slate-300"
                              : "bg-white/65 text-[#49637A]"
                        }`}
                      >
                        <div className="min-w-0 flex items-center gap-2">
                          <span className="w-5 text-[11px] font-bold tabular-nums opacity-65 shrink-0">
                            #{idx + 1}
                          </span>
                          <span className="font-semibold truncate">
                            {formatRunDate(run.achievedAt)}
                          </span>
                        </div>
                        <span className="font-bold tabular-nums shrink-0">
                          {run.score.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* LANGUAGE SUB-VIEW */}
          {activeView === "language" && (
            <div
              key="subview-language"
              style={
                !reducedMotion
                  ? {
                      animation:
                        "bsSettingsSlideIn 200ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
                    }
                  : undefined
              }
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-1.5 p-1.5"
            >
              {languages.map((langOpt, idx) => {
                const isSelected = activeLanguage === langOpt.code;
                return (
                  <button
                    key={langOpt.code}
                    ref={setItemRef(`language-${idx}`)}
                    id={`block-sync-lang-${langOpt.code}`}
                    type="button"
                    onClick={() => {
                      onPlayUiSoundRef.current?.("rowTap");
                      onTriggerHapticRef.current?.("light");
                      setLanguage(langOpt.code);
                      onChangeLanguage?.(langOpt.code);
                    }}
                    className={`w-full h-[46px] px-3.5 rounded-2xl border-none outline-none focus:outline-none flex items-center justify-between gap-2.5 cursor-pointer transition-colors duration-150 ${
                      isSelected
                        ? darkMode
                          ? "bg-[#26D2E6]/18 text-[#6BE6F5] ring-1 ring-[#26D2E6]/35"
                          : "bg-[#47BBF5]/20 text-[#156994] ring-1 ring-[#47BBF5]/40"
                        : darkMode
                          ? "bg-[#1B242E] hover:bg-[#222D39] text-slate-200"
                          : "bg-[#E6F1F8]/90 hover:bg-[#DCEAF5] text-[#2C3E50]"
                    } ${isSubSelected(idx) ? kbRingClass : ""}`}
                  >
                    <div className="min-w-0 flex items-center gap-2.5">
                      <span className="text-base leading-none shrink-0" aria-hidden="true">
                        {langOpt.flag}
                      </span>
                      <span className="text-sm font-semibold truncate">
                        {langOpt.nativeName}
                      </span>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* MORE GAMES SUB-VIEW */}
          {activeView === "moreGames" && (
            <div
              key="subview-more-games"
              style={
                !reducedMotion
                  ? {
                      animation:
                        "bsSettingsSlideIn 200ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
                    }
                  : undefined
              }
              className="flex-1 min-h-0 flex flex-col gap-2.5 overflow-y-auto overscroll-contain p-1.5"
            >
              {(() => {
                let interactiveIdxCounter = -1;
                return MO_LOGIC_GAMES_CATALOG.map((game) => {
                  const iconNode =
                    game.id === "block-sync" ? (
                      <BlockSyncLogo size={40} isDarkMode={darkMode} />
                    ) : (
                      <img
                        src="/logo.png"
                        alt={`${game.primaryWord} ${game.brandWord}`}
                        className="w-10 h-10 rounded-xl object-cover shrink-0 shadow-[0_2px_8px_rgba(15,23,42,0.12)] select-none"
                      />
                    );

                  const titleNode = (
                    <span className="text-sm font-black tracking-tight uppercase leading-none truncate">
                      <span className={darkMode ? "text-[#F8FAFC]" : "text-[#0F172A]"}>
                        {game.primaryWord}
                      </span>
                      <span
                        className={`ml-1 ${
                          darkMode ? "text-[#38BDF8]" : "text-[#2B8CEE]"
                        }`}
                      >
                        {game.brandWord}
                      </span>
                    </span>
                  );

                  if (game.isActive) {
                    return (
                      <div
                        key={game.id}
                        id={`block-sync-more-games-${game.id}`}
                        aria-current="true"
                        className={`w-full p-3 rounded-2xl border-none flex items-center justify-between gap-3 cursor-default ${
                          darkMode
                            ? "bg-[#22303E] ring-1 ring-[#38BDF8]/40"
                            : "bg-[#E6F1F8] ring-1 ring-[#2B8CEE]/35"
                        }`}
                      >
                        <div className="min-w-0 flex items-center gap-3">
                          {iconNode}
                          <div className="min-w-0 flex flex-col items-start text-left">
                            {titleNode}
                            <span className="mt-1 text-[11px] opacity-65 truncate">
                              {game.subtitle}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            darkMode
                              ? "bg-[#38BDF8]/20 text-[#38BDF8]"
                              : "bg-[#2B8CEE]/15 text-[#2B8CEE]"
                          }`}
                        >
                          Playing
                        </span>
                      </div>
                    );
                  }

                  interactiveIdxCounter += 1;
                  const interactiveIdx = interactiveIdxCounter;

                  return (
                    <button
                      key={game.id}
                      ref={setItemRef(`moreGames-${interactiveIdx}`)}
                      id={`block-sync-more-games-${game.id}`}
                      type="button"
                      onClick={() => {
                        onPlayUiSoundRef.current?.("rowTap");
                        onTriggerHapticRef.current?.("light");
                        triggerExit("moreGames");
                      }}
                      className={`w-full p-3 rounded-2xl border-none outline-none focus:outline-none flex items-center justify-between gap-3 text-left cursor-pointer transition-all duration-150 active:scale-[0.985] ${
                        darkMode
                          ? "bg-[#1B242E] hover:bg-[#222D39] text-slate-100"
                          : "bg-[#E6F1F8]/90 hover:bg-[#DCEAF5] text-[#2C3E50]"
                      } ${isSubSelected(interactiveIdx) ? kbRingClass : ""}`}
                    >
                      <div className="min-w-0 flex items-center gap-3">
                        {iconNode}
                        <div className="min-w-0 flex flex-col items-start text-left">
                          {titleNode}
                          <span className="mt-1 text-[11px] opacity-65 truncate">
                            {game.subtitle}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-50 shrink-0" aria-hidden="true" />
                    </button>
                  );
                });
              })()}

              <p className="px-1 pt-1 text-[11px] text-center opacity-50">
                Switching games saves your live Block Sync board automatically.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Match History Inspector (reviewMode, z-[60], does not affect live game) */}
      {selectedMatch && (
        <BlockSyncEndGameModal
          darkMode={darkMode}
          reviewMode={true}
          playedAtLabel={formatMatchDateTime(selectedMatch.playedAt)}
          onCloseReview={() => {
            onPlayUiSoundRef.current?.("rowTap");
            onTriggerHapticRef.current?.("light");
            setSelectedMatch(null);
          }}
          finalScore={selectedMatch.score}
          previousBestScore={
            selectedMatch.isNewBest
              ? Math.max(0, selectedMatch.bestAtTime - 1)
              : selectedMatch.bestAtTime
          }
          bestScore={selectedMatch.bestAtTime}
          initialSessionBest={selectedMatch.bestAtTime}
          isNewBest={selectedMatch.isNewBest}
          percentileData={{
            higherThanPercent: selectedMatch.percentile,
            topPercent: Math.max(1, 100 - selectedMatch.percentile),
          }}
          finalBoardState={selectedMatch.boardSnapshot}
          tileClasses={tileClasses}
          roomMode={selectedMatch.mode === "multiplayer"}
          standings={selectedMatch.roomStandings?.map((entry) => ({
            id: entry.uid || entry.name,
            name: entry.name,
            score: entry.score,
            isSelf: entry.isCurrentUser,
          }))}
        />
      )}
    </>
  );
};
