import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Copy,
  Lock,
  Unlock,
  Check,
  XCircle,
  Users,
  Link2,
  AlertTriangle,
  Plus,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  SlidersHorizontal,
  ShieldCheck,
} from "lucide-react";
import { formatActiveStatus } from "../../utils/formatTimestamp";
import { useTranslation } from "../../i18n/useTranslation";
import { useFriendPresence } from "../../hooks/useFriendPresence";
import { IncognitoIcon } from "../common/IncognitoIcon";
import { BlockSyncLogo } from "../../games/blocks/BlockSyncLogo";
import { auth } from "../../firebase";
import { getActiveAuthUid, loadVault } from "../../utils/storageEngine";
import {
  getFocusableElements,
  handleNumericInputKeyDown,
  handleRovingMenuArrowKey,
  isEditableEventTarget,
  useTopmostModalKeyboardLayer,
} from "../../utils/keyboardControls";

export type Difficulty = "EASY" | "MEDIUM" | "HARD" | "EXPERT";
export type CreateRoomGameId = "sudoku" | "blocks";
export type BlocksRoomMode = "classic" | "rush";

interface CreateRoomGameCatalogEntry {
  id: CreateRoomGameId;
  primaryWord: string;
  brandWord: string;
  subtitle: string;
}

const MO_LOGIC_CREATE_GAMES: readonly CreateRoomGameCatalogEntry[] = [
  {
    id: "sudoku",
    primaryWord: "SUDOKU",
    brandWord: "SYNC",
    subtitle: "Classic 9×9 & Live Rooms",
  },
  {
    id: "blocks",
    primaryWord: "BLOCK",
    brandWord: "SYNC",
    subtitle: "Zen 9×9 Polyomino Puzzle",
  },
];

export interface CreateChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  currentUserId?: string;
  challengeSeed?: number;
  boardState?: { seed?: number | string;[key: string]: any } | null;
  isRoomLocked: boolean;
  setIsRoomLocked: (val: boolean) => void;
  roomPin: string;
  setRoomPin: (val: string) => void;
  updateRoomSettingsInFirestore: (settings: {
    isLocked?: boolean;
    pin?: string;
    difficulty?: Difficulty;
    mistakesLimit?: number;
    hintsLimit?: number;
    timerEnabled?: boolean;
  }) => void;
  challengeDifficulty: Difficulty;
  setChallengeDifficulty: (diff: Difficulty) => void;
  challengeMistakeLimit: number;
  setChallengeMistakeLimit: (val: number) => void;
  challengeHintLimit: number;
  setChallengeHintLimit: (val: number) => void;
  challengeTimerEnabled: boolean;
  setChallengeTimerEnabled: (val: boolean) => void;
  multiplayerPlayers: Array<{
    id: string;
    name: string;
    status: "online" | "offline";
    isFriend?: boolean;
    [key: string]: any;
  }>;
  getInviteCooldownState: (playerId: string) => {
    isJoined: boolean;
    isPendingSent: boolean;
    isDeclined: boolean;
    isLeft?: boolean;
    remainingSeconds: number;
    joinedAt?: number;
  };
  handleToggleFriend: (playerId: string, playerName: string) => void;
  handleInviteFriend: (playerId: string, overrideDifficulty?: Difficulty) => void;
  handleReinviteAll: () => void;
  isInvitingAll: boolean;
  onShareLink: () => void;
  onStartGame: () => void;
  copyToClipboard: (text: string) => void;
  showCopiedToast: (msg: string) => void;
  onMistakeLimitAbove3?: () => void;
  onHintLimitAbove3?: () => void;
  isOnline: boolean;
  darkMode: boolean;
  playClickSound: () => void;
  // Optional Unified Multi-Game Controls
  isDailyChallenge?: boolean;
  selectedGame?: CreateRoomGameId;
  onSelectGame?: (game: CreateRoomGameId) => void;
  blocksRoomMode?: BlocksRoomMode;
  onChangeBlocksRoomMode?: (mode: BlocksRoomMode) => void;
  blocksRoomUndo?: boolean;
  onChangeBlocksRoomUndo?: (allowUndo: boolean) => void;
  blocksRoomTimeLimitSec?: 120 | 180 | 300 | 600;
  onChangeBlocksRoomTimeLimitSec?: (seconds: 120 | 180 | 300 | 600) => void;
}

type CreateRoomSubView = "main" | "selectGame" | "rules";

export const CreateChallengeModal: React.FC<CreateChallengeModalProps> = ({
  isOpen,
  onClose,
  onBack,
  currentUserId,
  challengeSeed,
  boardState,
  isRoomLocked,
  setIsRoomLocked,
  roomPin,
  setRoomPin,
  updateRoomSettingsInFirestore,
  challengeDifficulty,
  setChallengeDifficulty,
  challengeMistakeLimit,
  setChallengeMistakeLimit,
  challengeHintLimit,
  setChallengeHintLimit,
  challengeTimerEnabled,
  setChallengeTimerEnabled,
  multiplayerPlayers,
  getInviteCooldownState,
  handleToggleFriend,
  handleInviteFriend,
  handleReinviteAll,
  isInvitingAll,
  onShareLink,
  onStartGame,
  copyToClipboard,
  showCopiedToast,
  onMistakeLimitAbove3,
  onHintLimitAbove3,
  isOnline,
  darkMode,
  playClickSound,
  isDailyChallenge = false,
  selectedGame,
  onSelectGame,
  blocksRoomMode,
  onChangeBlocksRoomMode,
  blocksRoomUndo,
  onChangeBlocksRoomUndo,
  blocksRoomTimeLimitSec,
  onChangeBlocksRoomTimeLimitSec,
}) => {
  const { t } = useTranslation();
  const effectiveUserId =
    currentUserId || auth.currentUser?.uid || getActiveAuthUid() || loadVault("guest").profile?.id;

  const sanitizedPlayers = useMemo(() => {
    return (multiplayerPlayers || []).filter((p) => {
      if (!p || !p.id) return false;
      if (effectiveUserId && p.id === effectiveUserId) return false;
      if (p.id === "GUEST_ANON" || p.id === "me") return false;
      return true;
    });
  }, [multiplayerPlayers, effectiveUserId]);

  const playerIds = sanitizedPlayers.map((p) => p.id);
  const { isIncognito, toggleIncognito, getFriendStatus, getFriendLastActive } =
    useFriendPresence(effectiveUserId, playerIds);

  // Safe local defaults for optional Multi-Game props
  const [localSelectedGame, setLocalSelectedGame] = useState<CreateRoomGameId>("sudoku");
  const [localBlocksMode, setLocalBlocksMode] = useState<BlocksRoomMode>("classic");
  const [localBlocksUndo, setLocalBlocksUndo] = useState<boolean>(false);
  const [localBlocksTimeLimitSec, setLocalBlocksTimeLimitSec] = useState<120 | 180 | 300 | 600>(180);

  const effectiveSelectedGame: CreateRoomGameId = isDailyChallenge
    ? "sudoku"
    : selectedGame ?? localSelectedGame;
  const effectiveBlocksMode: BlocksRoomMode = blocksRoomMode ?? localBlocksMode;
  const effectiveBlocksUndo: boolean = blocksRoomUndo ?? localBlocksUndo;
  const effectiveBlocksTimeLimitSec: 120 | 180 | 300 | 600 =
    blocksRoomTimeLimitSec ?? localBlocksTimeLimitSec;

  const isBlocksTheme = effectiveSelectedGame === "blocks";

  const [activeSubView, setActiveSubView] = useState<CreateRoomSubView>("main");
  const [openDropdown, setOpenDropdown] = useState<"difficulty" | "blocksMode" | null>(null);
  const [isLobbyLocked, setIsLobbyLocked] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"recent" | "friends">("recent");
  const [lockMicroToast, setLockMicroToast] = useState<{
    key: number;
    text: string;
    locked: boolean;
  } | null>(null);
  const [isKeyboardNavActive, setIsKeyboardNavActive] = useState<boolean>(false);

  const modalRef = useRef<HTMLDivElement | null>(null);
  const activeDropdownRef = useRef<HTMLDivElement | null>(null);
  const modeDropdownTriggerRef = useRef<HTMLButtonElement | null>(null);
  const gameSelectorTriggerRef = useRef<HTMLButtonElement | null>(null);
  const rulesTriggerRef = useRef<HTMLButtonElement | null>(null);
  const preferredColRef = useRef<number>(0);
  const lastPointerPosRef = useRef<{ x: number; y: number } | null>(null);
  const lockToastTimerRef = useRef<number | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return false;
    }
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const clearLockMicroToast = () => {
    if (lockToastTimerRef.current !== null && typeof window !== "undefined") {
      window.clearTimeout(lockToastTimerRef.current);
      lockToastTimerRef.current = null;
    }
    setLockMicroToast(null);
  };

  const triggerLockMicroToast = (locked: boolean) => {
    if (lockToastTimerRef.current !== null && typeof window !== "undefined") {
      window.clearTimeout(lockToastTimerRef.current);
    }
    setLockMicroToast({
      key: Date.now(),
      text: locked ? "Room locked — PIN required" : "Room unlocked",
      locked,
    });
    if (typeof window !== "undefined") {
      lockToastTimerRef.current = window.setTimeout(() => {
        lockToastTimerRef.current = null;
        setLockMicroToast(null);
      }, 1600);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setIsLobbyLocked(false);
      setOpenDropdown(null);
      setActiveSubView("main");
      setIsKeyboardNavActive(false);
      clearLockMicroToast();
    }
    return () => {
      if (lockToastTimerRef.current !== null && typeof window !== "undefined") {
        window.clearTimeout(lockToastTimerRef.current);
        lockToastTimerRef.current = null;
      }
    };
  }, [isOpen]);

  // Focus active dropdown option cleanly on open
  useEffect(() => {
    if (!isOpen || !openDropdown) return;
    const focusTimer = window.setTimeout(() => {
      const options = getFocusableElements(activeDropdownRef.current);
      const selected = options.find((el) => el.getAttribute("aria-selected") === "true");
      (selected || options[0])?.focus({ preventScroll: true });
    }, 10);
    return () => window.clearTimeout(focusTimer);
  }, [isOpen, openDropdown]);

  // Move focus cleanly to first visible action when switching sub-views in keyboard mode
  useEffect(() => {
    if (!isOpen || !isKeyboardNavActive) return;
    const raf = window.requestAnimationFrame(() => {
      const container = modalRef.current;
      if (!container) return;
      const focusables = getFocusableElements(container);
      focusables[0]?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(raf);
  }, [isOpen, activeSubView]);

  // Clear keyboard-only focus ring immediately on genuine pointer/touch activity
  useEffect(() => {
    if (!isOpen) return;
    const clearKbd = () => {
      setIsKeyboardNavActive(false);
      const activeEl = document.activeElement;
      if (
        activeEl instanceof HTMLElement &&
        modalRef.current?.contains(activeEl) &&
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

    const node = modalRef.current;
    node?.addEventListener("pointerdown", handlePointerDown, true);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => {
      node?.removeEventListener("pointerdown", handlePointerDown, true);
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [isOpen]);

  const handleSelectGameId = (game: CreateRoomGameId) => {
    if (isDailyChallenge) return;
    setLocalSelectedGame(game);
    onSelectGame?.(game);
  };

  const handleSetBlocksMode = (mode: BlocksRoomMode) => {
    setLocalBlocksMode(mode);
    onChangeBlocksRoomMode?.(mode);
  };

  const handleSetBlocksUndo = (allowUndo: boolean) => {
    setLocalBlocksUndo(allowUndo);
    onChangeBlocksRoomUndo?.(allowUndo);
  };

  const handleSetBlocksTimeLimit = (sec: 120 | 180 | 300 | 600) => {
    setLocalBlocksTimeLimitSec(sec);
    onChangeBlocksRoomTimeLimitSec?.(sec);
  };

  const get2DModalNavRows = (): HTMLElement[][] => {
    const root = modalRef.current;
    if (!root) return [];
    const rowNodes = Array.from(root.querySelectorAll("[data-kbd-row]")) as HTMLElement[];
    const rows: HTMLElement[][] = [];

    for (const rowEl of rowNodes) {
      const style = window.getComputedStyle(rowEl);
      if (style.display === "none" || style.visibility === "hidden") continue;
      if (rowEl.getClientRects().length === 0) continue;
      const items = getFocusableElements(rowEl);
      if (items.length > 0) {
        rows.push(items);
      }
    }
    return rows;
  };

  const returnToMainFromSubView = (focusTarget: "selectGame" | "rules" | null = null) => {
    setActiveSubView("main");
    requestAnimationFrame(() => {
      if (focusTarget === "selectGame") {
        gameSelectorTriggerRef.current?.focus({ preventScroll: true });
      } else if (focusTarget === "rules") {
        rulesTriggerRef.current?.focus({ preventScroll: true });
      }
    });
  };

  // Shared Topmost-Modal Keyboard Stack coordinator + 2D mouse-free modal navigation
  useTopmostModalKeyboardLayer(isOpen, {
    id: "create-challenge-modal",
    priority: 30,
    containerRef: modalRef,
    restoreFocus: true,
    trapFocus: true,
    onEscape: () => {
      if (openDropdown) {
        setOpenDropdown(null);
        requestAnimationFrame(() => modeDropdownTriggerRef.current?.focus({ preventScroll: true }));
        return true;
      }
      if (activeSubView !== "main") {
        returnToMainFromSubView(activeSubView === "selectGame" ? "selectGame" : "rules");
        return true;
      }
      onCloseRef.current();
      return true;
    },
    onBackspace: () => {
      if (openDropdown) {
        setOpenDropdown(null);
        requestAnimationFrame(() => modeDropdownTriggerRef.current?.focus({ preventScroll: true }));
        return true;
      }
      if (activeSubView !== "main") {
        returnToMainFromSubView(activeSubView === "selectGame" ? "selectGame" : "rules");
        return true;
      }
      onCloseRef.current();
      return true;
    },
    onKeyDown: (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return false;

      if (e.key === "Tab") {
        setIsKeyboardNavActive(true);
        if (openDropdown) {
          setOpenDropdown(null);
        }
        return false; // Let stack trapFocusTabKey handle Tab cleanly
      }

      if (openDropdown) {
        const options = getFocusableElements(activeDropdownRef.current);
        if (handleRovingMenuArrowKey(e, options, "vertical")) {
          setIsKeyboardNavActive(true);
          return true;
        }
        return false;
      }

      const isArrowKey =
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight";

      if (!isArrowKey) {
        return false;
      }

      const editable = isEditableEventTarget(e.target);
      // Keep horizontal cursor movement untouched inside PIN <input>
      if (editable && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
        return false;
      }

      const rows = get2DModalNavRows();
      if (rows.length === 0) return false;

      e.preventDefault();
      setIsKeyboardNavActive(true);

      const activeEl = document.activeElement as HTMLElement | null;
      let curRow = -1;
      let curCol = -1;
      for (let r = 0; r < rows.length; r++) {
        const c = activeEl ? rows[r].indexOf(activeEl) : -1;
        if (c !== -1) {
          curRow = r;
          curCol = c;
          break;
        }
      }

      let targetRow = 0;
      let targetCol = 0;

      if (curRow === -1) {
        if (e.key === "ArrowUp") {
          targetRow = rows.length - 1;
          targetCol = 0;
        } else if (e.key === "ArrowLeft") {
          targetRow = 0;
          targetCol = rows[0].length - 1;
        } else {
          targetRow = 0;
          targetCol = 0;
        }
        preferredColRef.current = targetCol;
      } else if (e.key === "ArrowDown") {
        targetRow = (curRow + 1) % rows.length;
        targetCol = Math.min(preferredColRef.current, rows[targetRow].length - 1);
      } else if (e.key === "ArrowUp") {
        targetRow = (curRow - 1 + rows.length) % rows.length;
        targetCol = Math.min(preferredColRef.current, rows[targetRow].length - 1);
      } else if (e.key === "ArrowRight") {
        targetRow = curRow;
        targetCol = rows[curRow].length > 1 ? (curCol + 1) % rows[curRow].length : curCol;
        preferredColRef.current = targetCol;
      } else if (e.key === "ArrowLeft") {
        targetRow = curRow;
        targetCol =
          rows[curRow].length > 1
            ? (curCol - 1 + rows[curRow].length) % rows[curRow].length
            : curCol;
        preferredColRef.current = targetCol;
      }

      const targetEl = rows[targetRow]?.[targetCol];
      if (targetEl) {
        targetEl.focus({ preventScroll: true });
        targetEl.scrollIntoView({ block: "nearest", behavior: reducedMotion ? "auto" : "smooth" });
      }
      return true;
    },
  });

  if (!isOpen) return null;

  const activeRoomCode = String(
    challengeSeed || (boardState?.seed ? String(boardState.seed).slice(-6) : "849201")
  )
    .padStart(6, "0")
    .slice(-6);

  // Glanceable 1-line rules summary
  const summaryLine = (() => {
    if (effectiveSelectedGame === "blocks") {
      const undoText = effectiveBlocksUndo ? "Undo On" : "Undo Off";
      if (effectiveBlocksMode === "rush") {
        const mins = Math.round(effectiveBlocksTimeLimitSec / 60);
        return `Time Rush (${mins}m) · Same Seeded Blocks · ${undoText}`;
      }
      return `Same Seeded Blocks · ${undoText}`;
    }

    const effectiveMistakes = isDailyChallenge ? 3 : challengeMistakeLimit;
    const effectiveHints = isDailyChallenge ? 3 : challengeHintLimit;
    const effectiveTimer = isDailyChallenge ? true : challengeTimerEnabled;

    const mistakesLabel =
      effectiveMistakes === 0
        ? t("mistakes0")
        : effectiveMistakes === 999
          ? t("mistakesUnlimited")
          : t("mistakesCount", { count: effectiveMistakes });
    const hintsLabel =
      effectiveHints === 0
        ? t("hints0")
        : effectiveHints === 1
          ? t("hints1")
          : t("hintsCount", { count: effectiveHints });
    const timerLabel = effectiveTimer ? "Timer On" : "Timer Off";
    return `${mistakesLabel} · ${hintsLabel} · ${timerLabel}`;
  })();

  const modalSurfaceClass = isBlocksTheme
    ? darkMode
      ? "bg-[#141A21] text-slate-100"
      : "bg-[#F4F8FB] text-[#2C3E50]"
    : darkMode
      ? "bg-[#1A1A1A] text-stone-200"
      : "bg-[#FDFBF7] text-stone-850";

  const surfaceCardClass = isBlocksTheme
    ? darkMode
      ? "bg-[#1B242E] text-slate-100"
      : "bg-[#E6F1F8]/95 text-[#2C3E50]"
    : darkMode
      ? "bg-zinc-900/75 text-stone-200"
      : "bg-white text-stone-850 shadow-xs";

  const iconBtnSurfaceClass = isBlocksTheme
    ? darkMode
      ? "bg-[#1B242E] hover:bg-[#24303D] text-slate-200"
      : "bg-[#E6F1F8] hover:bg-[#D5E6F3] text-[#49637A]"
    : darkMode
      ? "bg-zinc-800 hover:bg-zinc-750 text-stone-250"
      : "bg-stone-100 hover:bg-stone-200 text-stone-700";

  const syncAccentClass = darkMode ? "text-[#38BDF8]" : "text-[#2B8CEE]";

  // Preserve exact Sudoku dynamic Light & Dark difficulty pill colors
  const sudokuDifficultyBtnClass =
    challengeDifficulty === "EASY"
      ? darkMode
        ? "bg-[#022c22] text-[#d1fae5] shadow-[0_8px_16px_rgba(0,0,0,0.4)]"
        : "bg-[#D1FAE5] text-[#065F46] shadow-[0_8px_16px_rgba(6,95,70,0.06),_0_2px_4px_rgba(0,0,0,0.02)]"
      : challengeDifficulty === "MEDIUM"
        ? darkMode
          ? "bg-[#451a03] text-[#fef08a] shadow-[0_8px_16px_rgba(0,0,0,0.4)]"
          : "bg-[#FFF99D] text-[#854D0E] shadow-[0_8px_16px_rgba(133,77,14,0.06),_0_2px_4px_rgba(0,0,0,0.02)]"
        : challengeDifficulty === "HARD"
          ? darkMode
            ? "bg-[#2e1065] text-[#e9d5ff] shadow-[0_8px_16px_rgba(0,0,0,0.4)]"
            : "bg-[#F3E8FF] text-[#6B21A8] shadow-[0_8px_16px_rgba(107,33,168,0.06),_0_2px_4px_rgba(0,0,0,0.02)]"
          : darkMode
            ? "bg-[#4c0519] text-[#fecdd3] shadow-[0_8px_16px_rgba(0,0,0,0.4)]"
            : "bg-[#FFE4E6] text-[#9D174D] shadow-[0_8px_16px_rgba(157,23,77,0.06),_0_2px_4px_rgba(0,0,0,0.02)]";

  const blocksModeBtnClass = darkMode
    ? "bg-[#1B242E] hover:bg-[#24303D] text-[#38BDF8] shadow-[0_6px_16px_rgba(0,0,0,0.34)]"
    : "bg-[#E6F1F8] hover:bg-[#D5E6F3] text-[#0369A1] shadow-[0_6px_16px_rgba(44,62,80,0.06)]";

  return (
    <motion.div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-label="Create Room"
      data-create-room-kbd={isKeyboardNavActive ? "true" : "false"}
      data-create-room-theme={effectiveSelectedGame}
      key="multiplayer-create-modal"
      initial={{ scale: 0.96, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.96, opacity: 0 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={`modal card relative w-[92%] max-w-md h-[min(640px,calc(100dvh-28px-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)))] max-h-[calc(100dvh-28px-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px))] rounded-3xl p-5 sm:p-6 border-none flex flex-col gap-3.5 select-none z-[10001] text-left transition-colors duration-200 overflow-hidden ${modalSurfaceClass}`}
      style={{
        boxShadow: darkMode ? "0 14px 44px rgba(0,0,0,0.58)" : "0 8px 32px rgba(15,23,42,0.10)",
      }}
    >
      <style>{`
        @keyframes createRoomSlideIn {
          from {
            opacity: 0;
            transform: translate3d(16px, 0, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
      `}</style>

      {/* Floating Lock / Unlock Micro-Toast (1600ms, GPU transform + opacity, never shifts layout) */}
      <AnimatePresence>
        {lockMicroToast && (
          <motion.div
            key={lockMicroToast.key}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.96 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="pointer-events-none absolute top-14 left-1/2 -translate-x-1/2 z-[10040]"
          >
            <div
              className={`px-3.5 py-1.5 rounded-full text-[11px] font-sans font-bold tracking-wide flex items-center gap-1.5 whitespace-nowrap shadow-md ${lockMicroToast.locked
                ? darkMode
                  ? "bg-[#4c0519] text-[#fecdd3]"
                  : "bg-[#FFE4E6] text-[#9D174D]"
                : darkMode
                  ? "bg-[#022c22] text-[#d1fae5]"
                  : "bg-[#D1FAE5] text-[#065F46]"
                }`}
            >
              {lockMicroToast.locked ? (
                <Lock className="w-3 h-3 stroke-[2.5] shrink-0" />
              ) : (
                <Unlock className="w-3 h-3 stroke-[2.5] shrink-0" />
              )}
              <span>{lockMicroToast.text}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================================================================== */}
      {/* SUB-VIEW 1: SELECT GAME                                               */}
      {/* ===================================================================== */}
      {activeSubView === "selectGame" && (
        <div
          key="create-room-subview-select-game"
          style={
            !reducedMotion
              ? { animation: "createRoomSlideIn 200ms cubic-bezier(0.22, 1, 0.36, 1) forwards" }
              : undefined
          }
          className="flex-1 min-h-0 flex flex-col gap-3.5"
        >
          {/* Symmetric 3-Column Icon-Only Sub-View Header */}
          <div
            data-kbd-row="sub-header"
            className="grid grid-cols-[36px_1fr_36px] items-center gap-2 shrink-0"
          >
            <button
              type="button"
              onClick={() => {
                playClickSound();
                returnToMainFromSubView("selectGame");
              }}
              aria-label="Back"
              title="Back"
              className={`w-9 h-9 rounded-full border-none cursor-pointer flex items-center justify-center transition-all active:scale-95 ${iconBtnSurfaceClass}`}
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.3]" />
            </button>

            <div className="min-w-0 text-center flex flex-col items-center justify-center">
              <span
                className={`text-[9.5px] font-sans font-black uppercase tracking-[0.18em] leading-none ${syncAccentClass}`}
              >
                MO LOGIC
              </span>
              <h3 className="text-base font-sans font-black tracking-tight leading-tight mt-0.5 truncate">
                Select Game
              </h3>
            </div>

            <button
              type="button"
              onClick={() => {
                playClickSound();
                setIsLobbyLocked(false);
                setOpenDropdown(null);
                onClose();
              }}
              aria-label="Close"
              title="Close"
              className={`w-9 h-9 rounded-full border-none cursor-pointer flex items-center justify-center transition-all active:scale-95 ${iconBtnSurfaceClass}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col gap-2.5 p-2 -mx-2">
            {MO_LOGIC_CREATE_GAMES.map((game) => {
              const isSelected = effectiveSelectedGame === game.id;
              return (
                <div key={game.id} data-kbd-row={`select-game-${game.id}`}>
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      handleSelectGameId(game.id);
                      returnToMainFromSubView("selectGame");
                    }}
                    className={`w-full p-3.5 rounded-2xl border-none flex items-center justify-between gap-3 text-left cursor-pointer transition-all active:scale-[0.985] ${isSelected
                      ? darkMode
                        ? "bg-[#1B242E] ring-1 ring-[#38BDF8]/45"
                        : "bg-[#E6F1F8] ring-1 ring-[#2B8CEE]/35"
                      : darkMode
                        ? "bg-zinc-900/60 hover:bg-zinc-800/80"
                        : "bg-white/90 hover:bg-white shadow-xs"
                      }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {game.id === "blocks" ? (
                        <BlockSyncLogo size={38} isDarkMode={darkMode} />
                      ) : (
                        <img
                          src="/logo.png"
                          alt="Sudoku Sync"
                          className="w-[38px] h-[38px] rounded-xl object-cover shrink-0 shadow-[0_2px_8px_rgba(15,23,42,0.12)]"
                        />
                      )}
                      <div className="min-w-0 flex flex-col">
                        <span className="text-sm font-sans font-black tracking-tight uppercase leading-none truncate">
                          <span className={darkMode ? "text-stone-100" : "text-stone-900"}>
                            {game.primaryWord}
                          </span>
                          <span className={`ml-1 ${syncAccentClass}`}>{game.brandWord}</span>
                        </span>
                        <span className="mt-1 text-[11px] font-sans opacity-65 truncate">
                          {game.subtitle}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <span
                        className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${darkMode ? "bg-[#38BDF8]/20 text-[#38BDF8]" : "bg-[#2B8CEE]/15 text-[#2B8CEE]"
                          }`}
                      >
                        <Check className="w-4 h-4 stroke-[2.8]" />
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-VIEW 2: MATCH RULES                                               */}
      {/* ===================================================================== */}
      {activeSubView === "rules" && (
        <div
          key="create-room-subview-rules"
          style={
            !reducedMotion
              ? { animation: "createRoomSlideIn 200ms cubic-bezier(0.22, 1, 0.36, 1) forwards" }
              : undefined
          }
          className="flex-1 min-h-0 flex flex-col gap-3.5"
        >
          {/* Symmetric 3-Column Icon-Only Sub-View Header */}
          <div
            data-kbd-row="rules-header"
            className="grid grid-cols-[36px_1fr_36px] items-center gap-2 shrink-0"
          >
            <button
              type="button"
              onClick={() => {
                playClickSound();
                returnToMainFromSubView("rules");
              }}
              aria-label="Back"
              title="Back"
              className={`w-9 h-9 rounded-full border-none cursor-pointer flex items-center justify-center transition-all active:scale-95 ${iconBtnSurfaceClass}`}
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.3]" />
            </button>

            <div className="min-w-0 text-center flex flex-col items-center justify-center">
              <span className="text-[9.5px] font-sans font-black uppercase tracking-[0.18em] leading-none">
                <span className={darkMode ? "text-stone-200" : "text-stone-800"}>
                  {effectiveSelectedGame === "blocks" ? "BLOCK" : "SUDOKU"}
                </span>
                <span className={`ml-1 ${syncAccentClass}`}>SYNC</span>
              </span>
              <h3 className="text-base font-sans font-black tracking-tight leading-tight mt-0.5 truncate">
                Match Rules
              </h3>
            </div>

            <button
              type="button"
              onClick={() => {
                playClickSound();
                setIsLobbyLocked(false);
                setOpenDropdown(null);
                onClose();
              }}
              aria-label="Close"
              title="Close"
              className={`w-9 h-9 rounded-full border-none cursor-pointer flex items-center justify-center transition-all active:scale-95 ${iconBtnSurfaceClass}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col gap-3 p-2 -mx-2">
            {effectiveSelectedGame === "sudoku" ? (
              isDailyChallenge ? (
                <div className={`p-4 rounded-2xl flex flex-col gap-2 ${surfaceCardClass}`}>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="text-xs font-sans font-black uppercase tracking-wider">
                      Daily Challenge Rules Locked
                    </span>
                  </div>
                  <p className="text-xs font-sans opacity-75 leading-relaxed">
                    Daily Challenge rooms enforce standard competitive parity across all players:
                    <strong> 3 Mistakes</strong>, <strong>3 Hints</strong>, and <strong>Timer On</strong>.
                  </p>
                </div>
              ) : (
                <>
                  {/* Mistakes */}
                  <div className={`p-3.5 rounded-2xl flex flex-col gap-2 ${surfaceCardClass}`}>
                    <span className="text-[10.5px] font-mono font-black uppercase tracking-wider opacity-65">
                      Mistake Limit
                    </span>
                    <div data-kbd-row="rules-mistakes" className="grid grid-cols-2 gap-2">
                      {[
                        { label: t("mistakes0"), val: 0 },
                        { label: t("mistakes3"), val: 3 },
                        { label: t("mistakes5"), val: 5 },
                        { label: t("mistakesUnlimited"), val: 999 },
                      ].map((opt) => {
                        const active = challengeMistakeLimit === opt.val;
                        return (
                          <button
                            key={opt.val}
                            type="button"
                            disabled={isLobbyLocked}
                            onClick={() => {
                              playClickSound();
                              setChallengeMistakeLimit(opt.val);
                              updateRoomSettingsInFirestore({ mistakesLimit: opt.val });
                              if (opt.val > 3) {
                                onMistakeLimitAbove3?.();
                              }
                            }}
                            className={`py-2 px-2.5 rounded-xl text-[11px] font-mono font-black uppercase tracking-wider border-none transition-all active:scale-95 ${isLobbyLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                              } ${active
                                ? darkMode
                                  ? "bg-[#451a03] text-[#fef08a] shadow-xs"
                                  : "bg-[#FFF99D] text-[#854D0E] shadow-xs"
                                : darkMode
                                  ? "bg-zinc-800/70 hover:bg-zinc-800 text-stone-300"
                                  : "bg-stone-100 hover:bg-stone-200/80 text-stone-700"
                              }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Hints */}
                  <div className={`p-3.5 rounded-2xl flex flex-col gap-2 ${surfaceCardClass}`}>
                    <span className="text-[10.5px] font-mono font-black uppercase tracking-wider opacity-65">
                      Hint Limit
                    </span>
                    <div data-kbd-row="rules-hints" className="grid grid-cols-4 gap-2">
                      {[
                        { label: t("hints0"), val: 0 },
                        { label: t("hints1"), val: 1 },
                        { label: t("hints3"), val: 3 },
                        { label: t("hints5"), val: 5 },
                      ].map((opt) => {
                        const active = challengeHintLimit === opt.val;
                        return (
                          <button
                            key={opt.val}
                            type="button"
                            disabled={isLobbyLocked}
                            onClick={() => {
                              playClickSound();
                              setChallengeHintLimit(opt.val);
                              updateRoomSettingsInFirestore({ hintsLimit: opt.val });
                              if (opt.val > 3) {
                                onHintLimitAbove3?.();
                              }
                            }}
                            className={`py-2 px-1.5 rounded-xl text-[11px] font-mono font-black uppercase tracking-wider border-none transition-all active:scale-95 truncate ${isLobbyLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                              } ${active
                                ? darkMode
                                  ? "bg-[#2e1065] text-[#e9d5ff] shadow-xs"
                                  : "bg-[#F3E8FF] text-[#6B21A8] shadow-xs"
                                : darkMode
                                  ? "bg-zinc-800/70 hover:bg-zinc-800 text-stone-300"
                                  : "bg-stone-100 hover:bg-stone-200/80 text-stone-700"
                              }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Timer */}
                  <div className={`p-3.5 rounded-2xl flex flex-col gap-2 ${surfaceCardClass}`}>
                    <span className="text-[10.5px] font-mono font-black uppercase tracking-wider opacity-65">
                      Match Timer
                    </span>
                    <div data-kbd-row="rules-timer" className="grid grid-cols-2 gap-2">
                      {[
                        { label: t("timerOn"), val: true },
                        { label: t("timerOff"), val: false },
                      ].map((opt) => {
                        const active = challengeTimerEnabled === opt.val;
                        return (
                          <button
                            key={String(opt.val)}
                            type="button"
                            disabled={isLobbyLocked}
                            onClick={() => {
                              playClickSound();
                              setChallengeTimerEnabled(opt.val);
                              updateRoomSettingsInFirestore({ timerEnabled: opt.val });
                            }}
                            className={`py-2 px-2.5 rounded-xl text-[11px] font-mono font-black uppercase tracking-wider border-none transition-all active:scale-95 ${isLobbyLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                              } ${active
                                ? darkMode
                                  ? "bg-[#0c4a6e]/70 text-[#bae6fd] shadow-xs"
                                  : "bg-[#E0F2FE] text-[#0369A1] shadow-xs"
                                : darkMode
                                  ? "bg-zinc-800/70 hover:bg-zinc-800 text-stone-300"
                                  : "bg-stone-100 hover:bg-stone-200/80 text-stone-700"
                              }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )
            ) : (
              <>
                {/* Block Sync Mode */}
                <div className={`p-3.5 rounded-2xl flex flex-col gap-2 ${surfaceCardClass}`}>
                  <span className="text-[10.5px] font-mono font-black uppercase tracking-wider opacity-65">
                    Game Mode
                  </span>
                  <div data-kbd-row="rules-blocks-mode" className="grid grid-cols-2 gap-2">
                    {[
                      { id: "classic" as const, label: "Classic Survival" },
                      { id: "rush" as const, label: "Time Rush" },
                    ].map((opt) => {
                      const active = effectiveBlocksMode === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          disabled={isLobbyLocked}
                          onClick={() => {
                            playClickSound();
                            handleSetBlocksMode(opt.id);
                          }}
                          className={`py-2.5 px-2.5 rounded-xl text-[11px] font-sans font-black tracking-tight border-none transition-all active:scale-95 ${isLobbyLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                            } ${active
                              ? darkMode
                                ? "bg-[#0EA5E9]/25 text-[#38BDF8] ring-1 ring-[#38BDF8]/40"
                                : "bg-[#BAE6FD] text-[#0369A1]"
                              : darkMode
                                ? "bg-[#141A21] hover:bg-[#24303D] text-slate-300"
                                : "bg-white/80 hover:bg-white text-slate-700"
                            }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Fairness Badge */}
                <div
                  className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 ${surfaceCardClass}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${darkMode
                        ? "bg-[#10B981]/20 text-[#34D399]"
                        : "bg-[#D1FAE5] text-[#065F46]"
                        }`}
                    >
                      <ShieldCheck className="w-4 h-4 stroke-[2.3]" />
                    </div>
                    <div className="min-w-0 flex flex-col">
                      <span className="text-xs font-sans font-extrabold leading-tight truncate">
                        Same Seeded Blocks
                      </span>
                      <span className="text-[11px] opacity-65 truncate">
                        Both players draw identical piece sequences
                      </span>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${darkMode
                      ? "bg-[#10B981]/20 text-[#34D399]"
                      : "bg-[#D1FAE5] text-[#065F46]"
                      }`}
                  >
                    Always On
                  </span>
                </div>

                {/* Allow Undo Toggle */}
                <div
                  data-kbd-row="rules-blocks-undo"
                  className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 ${surfaceCardClass}`}
                >
                  <div className="min-w-0 flex flex-col">
                    <span className="text-xs font-sans font-extrabold leading-tight">
                      Allow Undo
                    </span>
                    <span className="text-[11px] opacity-65">
                      Permit single-step piece undo during room match
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={isLobbyLocked}
                    role="switch"
                    aria-checked={effectiveBlocksUndo}
                    onClick={() => {
                      playClickSound();
                      handleSetBlocksUndo(!effectiveBlocksUndo);
                    }}
                    className={`shrink-0 px-3.5 py-1.5 rounded-xl text-[11px] font-mono font-black uppercase tracking-wider border-none transition-all active:scale-95 ${isLobbyLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                      } ${effectiveBlocksUndo
                        ? darkMode
                          ? "bg-[#10B981]/25 text-[#34D399]"
                          : "bg-[#D1FAE5] text-[#065F46]"
                        : darkMode
                          ? "bg-[#141A21] text-slate-400"
                          : "bg-white text-slate-600"
                      }`}
                  >
                    {effectiveBlocksUndo ? "ON" : "OFF"}
                  </button>
                </div>

                {/* Time Limit (Time Rush only) */}
                {effectiveBlocksMode === "rush" && (
                  <div className={`p-3.5 rounded-2xl flex flex-col gap-2 ${surfaceCardClass}`}>
                    <span className="text-[10.5px] font-mono font-black uppercase tracking-wider opacity-65">
                      Time Limit
                    </span>
                    <div data-kbd-row="rules-blocks-time" className="grid grid-cols-4 gap-2">
                      {([120, 180, 300, 600] as const).map((sec) => {
                        const active = effectiveBlocksTimeLimitSec === sec;
                        const label = `${Math.round(sec / 60)}m`;
                        return (
                          <button
                            key={sec}
                            type="button"
                            disabled={isLobbyLocked}
                            onClick={() => {
                              playClickSound();
                              handleSetBlocksTimeLimit(sec);
                            }}
                            className={`py-2 rounded-xl text-xs font-mono font-black uppercase border-none transition-all active:scale-95 ${isLobbyLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                              } ${active
                                ? darkMode
                                  ? "bg-[#0EA5E9]/25 text-[#38BDF8] ring-1 ring-[#38BDF8]/40"
                                  : "bg-[#BAE6FD] text-[#0369A1]"
                                : darkMode
                                  ? "bg-[#141A21] hover:bg-[#24303D] text-slate-300"
                                  : "bg-white/80 hover:bg-white text-slate-700"
                              }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Pinned Bottom Done Button */}
          <div data-kbd-row="rules-footer" className="shrink-0 pt-1">
            <button
              type="button"
              onClick={() => {
                playClickSound();
                returnToMainFromSubView("rules");
              }}
              className={`w-full py-3 rounded-2xl border-none font-sans font-black text-xs uppercase tracking-wider cursor-pointer transition-all active:scale-[0.98] ${isBlocksTheme
                ? darkMode
                  ? "bg-[#0EA5E9] hover:bg-[#38BDF8] text-[#082032]"
                  : "bg-[#2B8CEE] hover:bg-[#1D7AD9] text-white"
                : darkMode
                  ? "bg-[#022c22] hover:bg-[#064e3b] text-[#d1fae5]"
                  : "bg-[#D1FAE5] hover:bg-[#A7F3D0] text-[#065F46]"
                }`}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MAIN VIEW: UNIFIED MULTI-GAME CREATE ROOM                             */}
      {/* ===================================================================== */}
      {activeSubView === "main" && (
        <>
          {/* 1. PINNED TOP HEADER + GAME SELECTOR + 2-SLOT ROW + MICRO-SUMMARY */}
          <div className="flex flex-col gap-2.5 shrink-0 select-none">
            <div data-kbd-row="header" className="flex items-center justify-between">
              {/* Left: 6-digit room code */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-sans font-black tracking-wider flex items-center gap-1.5">
                  <span className="opacity-50 text-2xs uppercase font-bold">{t("codeLabel")}</span>
                  <span
                    className={`font-mono tabular-nums tracking-widest text-sm sm:text-base ${isOnline ? "select-all" : "text-amber-600 dark:text-amber-400"
                      }`}
                  >
                    {isOnline ? activeRoomCode : t("offline")}
                  </span>
                </span>
                {isOnline && (
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      copyToClipboard(activeRoomCode);
                      showCopiedToast(t("roomCodeCopied"));
                    }}
                    title={t("copyRoomCode")}
                    aria-label={t("copyRoomCode")}
                    className={`p-1 rounded-lg border-none cursor-pointer transition-colors ${isBlocksTheme
                      ? darkMode
                        ? "text-slate-400 hover:text-slate-100 hover:bg-[#1B242E]"
                        : "text-[#49637A] hover:text-[#2C3E50] hover:bg-[#E6F1F8]"
                      : "text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 hover:bg-stone-150 dark:hover:bg-zinc-800"
                      }`}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Right: Ghost Mode + Lock/Unlock + Close */}
              <div className="flex items-center gap-1.5 sm:gap-2 pr-0.5">
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    toggleIncognito();
                  }}
                  title={isIncognito ? `${t("incognitoMode")} ON` : `${t("incognitoMode")} OFF`}
                  aria-label={t("incognitoMode")}
                  aria-pressed={isIncognito}
                  className={`p-1.5 rounded-xl border flex items-center justify-center cursor-pointer select-none transition-colors duration-200 active:scale-95 ${isIncognito
                    ? darkMode
                      ? "bg-purple-900/30 text-purple-300 border-purple-500/20"
                      : "bg-purple-100/70 text-purple-900 border-purple-200/50"
                    : darkMode
                      ? "bg-white/[0.06] text-stone-400 border-transparent hover:bg-white/[0.1]"
                      : "bg-black/[0.04] text-stone-600 border-transparent hover:bg-black/[0.07]"
                    }`}
                >
                  <IncognitoIcon className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    const next = !isRoomLocked;
                    setIsRoomLocked(next);
                    triggerLockMicroToast(next);
                    const cleanPin = roomPin.trim().replace(/[^0-9]/g, "").slice(0, 4);
                    if (next && cleanPin.length >= 1 && cleanPin.length <= 4) {
                      updateRoomSettingsInFirestore({ isLocked: true, pin: cleanPin });
                    } else {
                      updateRoomSettingsInFirestore({ isLocked: false, pin: "" });
                    }
                  }}
                  title={isRoomLocked ? t("locked") || "Locked" : t("unlocked") || "Unlocked"}
                  aria-label={isRoomLocked ? "Room Locked" : "Room Unlocked"}
                  className={`p-2 rounded-xl transition-all duration-150 cursor-pointer border-none active:scale-95 flex items-center justify-center select-none ${isRoomLocked
                    ? darkMode
                      ? "bg-[#4c0519] text-[#fecdd3] shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
                      : "bg-[#FFE4E6] text-[#9D174D] shadow-[0_8px_16px_rgba(157,23,77,0.06),_0_2px_4px_rgba(0,0,0,0.02)]"
                    : darkMode
                      ? "bg-[#022c22] text-[#d1fae5] shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
                      : "bg-[#D1FAE5] text-[#065F46] shadow-[0_8px_16px_rgba(6,95,70,0.06),_0_2px_4px_rgba(0,0,0,0.02)]"
                    }`}
                >
                  {isRoomLocked ? (
                    <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : (
                    <Unlock className="w-3.5 h-3.5 stroke-[2.5]" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setIsLobbyLocked(false);
                    setOpenDropdown(null);
                    onClose();
                  }}
                  className={`p-1.5 rounded-full border-none cursor-pointer transition-all active:scale-95 hover:scale-105 shrink-0 ${iconBtnSurfaceClass}`}
                  title="Close"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Locked PIN Banner ONLY when locked (permanent unlocked bar removed) */}
            <AnimatePresence initial={false}>
              {isRoomLocked && (
                <motion.div
                  key="room-locked-pin"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden -mx-1.5 px-1.5"
                >
                  <div
                    data-kbd-row="pin-row"
                    className={`my-1.5 flex items-center justify-between gap-2 px-3 py-2 rounded-2xl border-none ${darkMode
                      ? "bg-[#4c0519]/40 text-[#fecdd3] shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                      : "bg-[#FFE4E6]/65 text-[#9D174D] shadow-[0_4px_14px_rgba(157,23,77,0.05)]"
                      }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Lock className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                      <span className="font-sans font-bold text-[10px] sm:text-xs uppercase tracking-wider shrink-0">
                        {t("setPin")}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold truncate ${darkMode ? "bg-[#4c0519] text-[#fecdd3]" : "bg-white/80 text-[#9D174D]"
                          }`}
                      >
                        {t("pinRequired")}
                      </span>
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={4}
                      placeholder="_ _ _ _"
                      value={roomPin}
                      aria-label={t("pinRequired")}
                      onKeyDown={(e) => {
                        handleNumericInputKeyDown(e, roomPin, 4, (cleaned) => {
                          setRoomPin(cleaned);
                          updateRoomSettingsInFirestore(
                            cleaned.length >= 1
                              ? { isLocked: true, pin: cleaned }
                              : { isLocked: false, pin: "" }
                          );
                        });
                      }}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/[^0-9]/g, "").slice(0, 4);
                        setRoomPin(cleaned);
                        updateRoomSettingsInFirestore(
                          cleaned.length >= 1
                            ? { isLocked: true, pin: cleaned }
                            : { isLocked: false, pin: "" }
                        );
                      }}
                      className="w-24 px-2 py-1 text-center font-mono font-black text-xs sm:text-sm tracking-widest rounded-lg border-none bg-white/95 dark:bg-zinc-950/90 text-stone-850 dark:text-stone-100 shadow-xs focus:outline-none focus:ring-2 focus:ring-rose-300"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Offline warning banner */}
            {!isOnline && (
              <div className="w-full py-2 px-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-2 select-none">
                <AlertTriangle className="w-4 h-4 stroke-[2.5] text-amber-500 shrink-0" />
                <span>{t("offlineWarning")}</span>
              </div>
            )}

            {/* Top Full-Width Game Selector Pill */}
            <div data-kbd-row="game-selector" className="w-full">
              <button
                ref={gameSelectorTriggerRef}
                type="button"
                disabled={isDailyChallenge || isLobbyLocked}
                aria-label="Select game"
                onClick={() => {
                  if (isDailyChallenge || isLobbyLocked) return;
                  playClickSound();
                  setOpenDropdown(null);
                  setActiveSubView("selectGame");
                }}
                className={`w-full px-3.5 py-2.5 rounded-2xl border-none flex items-center justify-between gap-2.5 transition-all duration-150 ${isDailyChallenge || isLobbyLocked
                  ? "cursor-default opacity-90"
                  : "cursor-pointer active:scale-[0.985]"
                  } ${isBlocksTheme
                    ? darkMode
                      ? "bg-[#1B242E] hover:bg-[#222D39] text-slate-100 shadow-[0_6px_18px_rgba(0,0,0,0.34)]"
                      : "bg-[#E6F1F8] hover:bg-[#DCEAF5] text-[#2C3E50] shadow-[0_6px_18px_rgba(44,62,80,0.06)]"
                    : darkMode
                      ? "bg-zinc-900/90 hover:bg-zinc-800/90 text-stone-100 shadow-[0_6px_18px_rgba(0,0,0,0.35)]"
                      : "bg-white hover:bg-stone-50 text-stone-850 shadow-[0_4px_16px_rgba(15,23,42,0.05)]"
                  }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {isBlocksTheme ? (
                    <BlockSyncLogo size={26} isDarkMode={darkMode} />
                  ) : (
                    <img
                      src="/logo.png"
                      alt="Sudoku Sync"
                      className="w-[26px] h-[26px] rounded-lg object-cover shrink-0 shadow-[0_2px_6px_rgba(15,23,42,0.12)]"
                    />
                  )}
                  <span className="text-xs sm:text-sm font-sans font-black tracking-tight uppercase leading-none truncate">
                    <span className={darkMode ? "text-stone-100" : "text-stone-900"}>
                      {isBlocksTheme ? "BLOCK" : "SUDOKU"}
                    </span>
                    <span className={`ml-1 ${syncAccentClass}`}>SYNC</span>
                  </span>
                </div>

                {isDailyChallenge ? (
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded-full text-[9.5px] font-mono font-black uppercase tracking-wider ${darkMode ? "bg-amber-900/40 text-amber-300" : "bg-amber-100 text-amber-800"
                      }`}
                  >
                    Daily Locked
                  </span>
                ) : (
                  <ChevronDown className="w-4 h-4 opacity-60 shrink-0" />
                )}
              </button>
            </div>

            {/* Universal 2-Slot Row: Left = Mode / Difficulty | Right = Rules */}
            <div className="relative z-[10010]">
              {openDropdown && (
                <div
                  className="fixed inset-0 z-[10015] bg-transparent cursor-default"
                  onClick={() => setOpenDropdown(null)}
                />
              )}

              <div data-kbd-row="slots" className="grid grid-cols-2 gap-2.5 w-full">
                {/* Left Pill: Sudoku Difficulty OR Block Sync Mode */}
                <div
                  className={`relative w-full transition-opacity duration-150 ${isLobbyLocked ? "pointer-events-none opacity-50" : ""
                    }`}
                >
                  {effectiveSelectedGame === "sudoku" ? (
                    <>
                      <button
                        ref={modeDropdownTriggerRef}
                        type="button"
                        aria-haspopup="listbox"
                        aria-expanded={openDropdown === "difficulty"}
                        onClick={() => {
                          playClickSound();
                          setOpenDropdown(openDropdown === "difficulty" ? null : "difficulty");
                        }}
                        className={`w-full h-[40px] flex items-center justify-center gap-1 px-2.5 text-xs font-mono font-black uppercase tracking-wider rounded-2xl border-none outline-none cursor-pointer transition-all duration-150 active:scale-95 ${sudokuDifficultyBtnClass}`}
                      >
                        <span className="truncate">
                          {challengeDifficulty === "EASY"
                            ? t("easy")
                            : challengeDifficulty === "MEDIUM"
                              ? t("medium")
                              : challengeDifficulty === "HARD"
                                ? t("hard")
                                : t("expert")}{" "}
                          ▾
                        </span>
                      </button>

                      {openDropdown === "difficulty" && (
                        <div
                          ref={activeDropdownRef}
                          role="listbox"
                          aria-label={t("selectDifficulty")}
                          className="absolute top-full left-0 mt-1.5 w-full min-w-[140px] rounded-2xl p-1.5 flex flex-col gap-1 z-[10020] bg-white dark:bg-zinc-900 shadow-xl border border-stone-200/80 dark:border-zinc-800"
                        >
                          {(["EASY", "MEDIUM", "HARD", "EXPERT"] as Difficulty[]).map((lvl) => (
                            <button
                              key={lvl}
                              type="button"
                              role="option"
                              aria-selected={challengeDifficulty === lvl}
                              onClick={() => {
                                playClickSound();
                                setChallengeDifficulty(lvl);
                                setOpenDropdown(null);
                                updateRoomSettingsInFirestore({ difficulty: lvl });
                                requestAnimationFrame(() =>
                                  modeDropdownTriggerRef.current?.focus({ preventScroll: true })
                                );
                              }}
                              className={`w-full py-2 px-2.5 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider text-left border-none cursor-pointer transition-all ${lvl === "EASY"
                                ? darkMode
                                  ? "hover:bg-[#022c22] text-[#d1fae5]"
                                  : "hover:bg-[#D1FAE5] text-[#065F46]"
                                : lvl === "MEDIUM"
                                  ? darkMode
                                    ? "hover:bg-[#451a03] text-[#fef08a]"
                                    : "hover:bg-[#FFF99D] text-[#854D0E]"
                                  : lvl === "HARD"
                                    ? darkMode
                                      ? "hover:bg-[#2e1065] text-[#e9d5ff]"
                                      : "hover:bg-[#F3E8FF] text-[#6B21A8]"
                                    : darkMode
                                      ? "hover:bg-[#4c0519] text-[#fecdd3]"
                                      : "hover:bg-[#FFE4E6] text-[#9D174D]"
                                } ${challengeDifficulty === lvl
                                  ? darkMode
                                    ? "bg-zinc-800 font-black"
                                    : "bg-stone-100 font-black"
                                  : "bg-transparent"
                                }`}
                            >
                              {lvl === "EASY"
                                ? t("easy")
                                : lvl === "MEDIUM"
                                  ? t("medium")
                                  : lvl === "HARD"
                                    ? t("hard")
                                    : t("expert")}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <button
                        ref={modeDropdownTriggerRef}
                        type="button"
                        aria-haspopup="listbox"
                        aria-expanded={openDropdown === "blocksMode"}
                        onClick={() => {
                          playClickSound();
                          setOpenDropdown(openDropdown === "blocksMode" ? null : "blocksMode");
                        }}
                        className={`w-full h-[40px] flex items-center justify-center gap-1 px-2.5 text-xs font-sans font-extrabold tracking-tight rounded-2xl border-none outline-none cursor-pointer transition-all duration-150 active:scale-95 ${blocksModeBtnClass}`}
                      >
                        <span className="truncate">
                          {effectiveBlocksMode === "rush" ? "Time Rush" : "Classic"} ▾
                        </span>
                      </button>

                      {openDropdown === "blocksMode" && (
                        <div
                          ref={activeDropdownRef}
                          role="listbox"
                          aria-label="Block Sync Mode"
                          className={`absolute top-full left-0 mt-1.5 w-full min-w-[160px] rounded-2xl p-1.5 flex flex-col gap-1 z-[10020] shadow-xl ${darkMode
                            ? "bg-[#1B242E] border border-slate-700/60"
                            : "bg-white border border-slate-200/80"
                            }`}
                        >
                          {[
                            { id: "classic" as const, label: "Classic Survival" },
                            { id: "rush" as const, label: "Time Rush" },
                          ].map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              role="option"
                              aria-selected={effectiveBlocksMode === opt.id}
                              onClick={() => {
                                playClickSound();
                                handleSetBlocksMode(opt.id);
                                setOpenDropdown(null);
                                requestAnimationFrame(() =>
                                  modeDropdownTriggerRef.current?.focus({ preventScroll: true })
                                );
                              }}
                              className={`w-full py-2 px-2.5 rounded-xl text-[11px] font-sans font-bold text-left border-none cursor-pointer transition-all ${effectiveBlocksMode === opt.id
                                ? darkMode
                                  ? "bg-[#0EA5E9]/25 text-[#38BDF8]"
                                  : "bg-[#E6F1F8] text-[#0369A1]"
                                : darkMode
                                  ? "text-slate-200 hover:bg-[#24303D]"
                                  : "text-slate-700 hover:bg-slate-100"
                                }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Right Pill: Match Rules */}
                <button
                  ref={rulesTriggerRef}
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setOpenDropdown(null);
                    setActiveSubView("rules");
                  }}
                  className={`w-full h-[40px] flex items-center justify-between gap-1.5 px-3 text-xs font-sans font-extrabold tracking-tight rounded-2xl border-none outline-none cursor-pointer transition-all duration-150 active:scale-95 ${isBlocksTheme
                    ? darkMode
                      ? "bg-[#1B242E] hover:bg-[#24303D] text-slate-200 shadow-[0_6px_16px_rgba(0,0,0,0.34)]"
                      : "bg-[#E6F1F8] hover:bg-[#D5E6F3] text-[#49637A] shadow-[0_6px_16px_rgba(44,62,80,0.06)]"
                    : darkMode
                      ? "bg-zinc-900/90 hover:bg-zinc-800 text-stone-200 shadow-[0_6px_16px_rgba(0,0,0,0.35)]"
                      : "bg-white hover:bg-stone-50 text-stone-700 shadow-[0_4px_14px_rgba(15,23,42,0.05)]"
                    }`}
                >
                  <span className="inline-flex items-center gap-1.5 min-w-0">
                    <SlidersHorizontal className="w-3.5 h-3.5 stroke-[2.3] shrink-0" />
                    <span className="truncate">Rules</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60 shrink-0" />
                </button>
              </div>
            </div>

            {/* Glanceable 1-Line Micro-Summary Strip */}
            <div className="px-1 text-[11.5px] font-sans font-semibold opacity-65 truncate select-none">
              {summaryLine}
            </div>

            {/* Status Badge when lobby is locked */}
            <AnimatePresence>
              {isLobbyLocked && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-2xl text-[11px] font-mono font-bold tracking-wide select-none ${darkMode
                    ? "bg-amber-950/40 border border-amber-800/60 text-amber-300"
                    : "bg-amber-50 border border-amber-200 text-amber-800"
                    }`}
                >
                  <Lock className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                  <span>{t("settingsLockedNotice")}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 2. BOUNDED MIDDLE ROSTER (RECENT / FRIENDS) */}
          <div className="flex-1 min-h-0 flex flex-col gap-2 select-none">
            <div data-kbd-row="tabs" className="flex items-center justify-center px-0.5 shrink-0">
              {(() => {
                const fCount = sanitizedPlayers.filter((p) => p.isFriend).length;
                const rCount = sanitizedPlayers.length;
                return (
                  <div
                    className={`flex w-full rounded-2xl p-1 ${isBlocksTheme
                      ? darkMode
                        ? "bg-[#1B242E]"
                        : "bg-[#E6F1F8]/90"
                      : darkMode
                        ? "bg-zinc-900/60"
                        : "bg-stone-200/50"
                      }`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveTab("recent")}
                      className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all border-none cursor-pointer truncate ${activeTab === "recent"
                        ? darkMode
                          ? "bg-zinc-800 text-stone-100 shadow-sm"
                          : "bg-white text-stone-800 shadow-sm"
                        : darkMode
                          ? "bg-transparent text-stone-500 hover:text-stone-300"
                          : "bg-transparent text-stone-500 hover:text-stone-700"
                        }`}
                    >
                      {t("recentTab", { count: rCount })}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("friends")}
                      className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all border-none cursor-pointer truncate ${activeTab === "friends"
                        ? darkMode
                          ? "bg-zinc-800 text-stone-100 shadow-sm"
                          : "bg-white text-stone-800 shadow-sm"
                        : darkMode
                          ? "bg-transparent text-stone-500 hover:text-stone-300"
                          : "bg-transparent text-stone-500 hover:text-stone-700"
                        }`}
                    >
                      {t("friendsTab", { count: fCount })}
                    </button>
                  </div>
                );
              })()}
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2.5 no-scrollbar p-2 -mx-2">
              {sanitizedPlayers.length === 0 ? (
                <span className="text-xs italic text-stone-500 py-6 text-center">
                  {t("noPastPlayers")}
                </span>
              ) : (
                (() => {
                  const sortPlayers = (list: typeof multiplayerPlayers) => {
                    return [...list].sort((a, b) => {
                      const stateA = getInviteCooldownState(a.id);
                      const stateB = getInviteCooldownState(b.id);
                      const isRoomA = Boolean(stateA.isJoined || stateA.isLeft);
                      const isRoomB = Boolean(stateB.isJoined || stateB.isLeft);

                      if (isRoomA !== isRoomB) {
                        return isRoomA ? -1 : 1;
                      }

                      if (isRoomA && isRoomB) {
                        const timeA = stateA.joinedAt || a.lastPlayedAt || 0;
                        const timeB = stateB.joinedAt || b.lastPlayedAt || 0;
                        if (timeA !== timeB) return timeB - timeA;
                      }

                      const statusA = getFriendStatus(a.id, a.status);
                      const statusB = getFriendStatus(b.id, b.status);
                      const isOnlineA = statusA === "online";
                      const isOnlineB = statusB === "online";
                      if (isOnlineA !== isOnlineB) {
                        return isOnlineA ? -1 : 1;
                      }

                      if (a.lastPlayedAt !== b.lastPlayedAt) {
                        return (b.lastPlayedAt || 0) - (a.lastPlayedAt || 0);
                      }
                      return (a.name || "").localeCompare(b.name || "");
                    });
                  };

                  const friends = sortPlayers(sanitizedPlayers.filter((p) => p.isFriend));
                  const recentPlayers = sortPlayers(sanitizedPlayers);

                  const renderRow = (player: any, index: number) => {
                    const { isJoined, isPendingSent, isDeclined, isLeft, remainingSeconds } =
                      getInviteCooldownState(player.id);
                    const effectiveStatus = getFriendStatus(player.id, player.status);
                    const isAnimated = index < 5;

                    const cardContent = (
                      <div
                        data-kbd-row={`roster-${index}`}
                        className={`flex items-center justify-between p-2.5 px-3 rounded-2xl transition-all duration-200 shrink-0 w-full ${isBlocksTheme
                          ? darkMode
                            ? "bg-[#1B242E] text-slate-100"
                            : "bg-white/90 text-[#2C3E50] shadow-xs"
                          : darkMode
                            ? "bg-zinc-900/60 border border-zinc-800/60 text-stone-200"
                            : "bg-white border border-stone-200/60 text-stone-850 shadow-xs"
                          }`}
                      >
                        {/* Left: Status Dot, Add Friend, Username */}
                        <div className="flex items-center gap-2 min-w-0">
                          {effectiveStatus === "online" && (
                            <span className="w-2 h-2 rounded-full shrink-0 bg-emerald-400 animate-pulse-gentle" />
                          )}
                          {player.isFriend ? (
                            <span
                              className={`text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md shrink-0 ${darkMode
                                ? "bg-[#022c22] text-[#d1fae5]"
                                : "bg-[#D1FAE5] text-[#065F46]"
                                }`}
                            >
                              {t("friendBadge")}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleFriend(player.id, player.name)}
                              className={`w-7 h-7 rounded-lg border-none cursor-pointer shrink-0 transition-all active:scale-95 flex items-center justify-center ${darkMode
                                ? "bg-zinc-800 hover:bg-zinc-750 text-stone-300 hover:text-white"
                                : "bg-stone-150 hover:bg-stone-200 text-stone-700 hover:text-stone-900"
                                }`}
                              title={t("addFriend")}
                              aria-label={t("addFriend")}
                            >
                              <Plus className="w-4 h-4 stroke-[2.5]" />
                            </button>
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-xs font-sans truncate">
                              {player.name}
                            </span>
                            <span className="text-[9.5px] text-stone-400 capitalize">
                              {formatActiveStatus(
                                effectiveStatus,
                                getFriendLastActive(player.id, player.lastActive || player.lastPlayedAt)
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Right: Dedicated match invite button */}
                        <div className="shrink-0 ml-2">
                          {isJoined ? (
                            <span
                              className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl flex items-center gap-1 ${darkMode
                                ? "bg-[#022c22] text-[#d1fae5]"
                                : "bg-[#D1FAE5] text-[#065F46]"
                                }`}
                            >
                              <Check className="w-3 h-3 stroke-[3]" />
                              {t("joinedStatus")}
                            </span>
                          ) : isLeft ? (
                            <button
                              type="button"
                              disabled
                              className={`text-[9.5px] font-mono font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-xl border-none opacity-90 cursor-not-allowed ${darkMode ? "bg-zinc-800 text-stone-400" : "bg-stone-200 text-stone-600"
                                }`}
                            >
                              {t("leftStatus", { seconds: remainingSeconds })}
                            </button>
                          ) : isPendingSent ? (
                            <button
                              type="button"
                              disabled
                              className={`text-[9.5px] font-mono font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-xl border-none opacity-90 cursor-not-allowed ${darkMode
                                ? "bg-[#451a03] text-[#fef08a]"
                                : "bg-[#FFF99D] text-[#854D0E]"
                                }`}
                            >
                              {t("sentStatus", { seconds: remainingSeconds })}
                            </button>
                          ) : isDeclined ? (
                            <button
                              type="button"
                              disabled
                              className={`text-[9.5px] font-mono font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-xl border-none opacity-90 cursor-not-allowed ${darkMode
                                ? "bg-[#4c0519] text-[#fecdd3]"
                                : "bg-[#FFE4E6] text-[#9D174D]"
                                }`}
                            >
                              {t("declinedStatus", { seconds: remainingSeconds })}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                if (!isOnline) return;
                                playClickSound();
                                setIsLobbyLocked(true);
                                setOpenDropdown(null);
                                handleInviteFriend(player.id, challengeDifficulty);
                              }}
                              disabled={!isOnline}
                              style={
                                !isOnline
                                  ? { opacity: 0.4, pointerEvents: "none", cursor: "not-allowed" }
                                  : undefined
                              }
                              className={`text-[9.5px] font-mono font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl border-none transition-all active:scale-95 shadow-xs ${!isOnline
                                ? "cursor-not-allowed opacity-40 pointer-events-none"
                                : "cursor-pointer"
                                } ${darkMode
                                  ? "bg-[#4c0519] hover:bg-[#831843] text-[#fecdd3]"
                                  : "bg-[#FFE4E6] hover:bg-[#FBCFE8] text-[#9D174D]"
                                }`}
                            >
                              {t("inviteAction")}
                            </button>
                          )}
                        </div>
                      </div>
                    );

                    if (isAnimated) {
                      return (
                        <div
                          key={player.id}
                          className="w-full shrink-0 animate-cascade-drop"
                          style={{ animationDelay: `${index * 45}ms` }}
                        >
                          {cardContent}
                        </div>
                      );
                    }

                    return (
                      <div key={player.id} className="w-full shrink-0">
                        {cardContent}
                      </div>
                    );
                  };

                  return (
                    <>
                      {activeTab === "friends" &&
                        (friends.length > 0 ? (
                          <div className="flex flex-col gap-2">
                            {friends.map((player, idx) => renderRow(player, idx))}
                          </div>
                        ) : (
                          <span className="text-xs italic text-stone-500 py-6 text-center block">
                            {t("noFriendsAdded")}
                          </span>
                        ))}
                      {activeTab === "recent" &&
                        (recentPlayers.length > 0 ? (
                          <div className="flex flex-col gap-2">
                            {recentPlayers.map((player, idx) => renderRow(player, idx))}
                          </div>
                        ) : (
                          <span className="text-xs italic text-stone-500 py-6 text-center block">
                            {t("noRecentOpponents")}
                          </span>
                        ))}
                    </>
                  );
                })()
              )}
            </div>
          </div>

          {/* 3. PINNED BOTTOM ACTION FOOTER */}
          <div className="flex flex-col gap-2.5 shrink-0 select-none pt-1">
            {/* Side-by-side RE-INVITE ALL / INVITE FRIEND */}
            <div data-kbd-row="secondary-actions" className="grid grid-cols-2 gap-2.5 w-full">
              <button
                type="button"
                onClick={() => {
                  if (!isOnline) return;
                  if (!isInvitingAll) {
                    setIsLobbyLocked(true);
                    setOpenDropdown(null);
                  }
                  handleReinviteAll();
                }}
                disabled={!isOnline || (!isInvitingAll && sanitizedPlayers.length === 0)}
                style={
                  !isOnline
                    ? { opacity: 0.4, pointerEvents: "none", cursor: "not-allowed" }
                    : undefined
                }
                className={`w-full py-2.5 px-2 text-xs font-mono font-black uppercase tracking-wider rounded-2xl border-none transition-all duration-150 text-center flex items-center justify-center gap-1.5 shadow-xs ${!isOnline || (!isInvitingAll && sanitizedPlayers.length === 0)
                  ? "cursor-not-allowed opacity-40"
                  : "cursor-pointer active:scale-95"
                  } ${isInvitingAll
                    ? "bg-rose-500 hover:bg-rose-600 text-white animate-pulse"
                    : darkMode
                      ? "bg-[#2e1065]/60 hover:bg-[#2e1065] text-[#e9d5ff]"
                      : "bg-[#F3E8FF] hover:bg-[#E9D5FF] text-[#6B21A8]"
                  }`}
              >
                {isInvitingAll ? (
                  <>
                    <XCircle className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                    <span className="truncate">{t("stopAction")}</span>
                  </>
                ) : (
                  <>
                    <Users className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                    <span className="truncate">{t("reinviteAllAction")}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!isOnline) return;
                  playClickSound();
                  setIsLobbyLocked(true);
                  setOpenDropdown(null);
                  onShareLink();
                }}
                disabled={!isOnline}
                style={{
                  ...(!isOnline
                    ? { opacity: 0.4, pointerEvents: "none", cursor: "not-allowed" }
                    : {}),
                  animationDelay: "0.4s",
                }}
                className={`animate-shimmer-sweep w-full py-2.5 px-2 text-xs font-mono font-black uppercase tracking-wider rounded-2xl border-none transition-all duration-150 text-center flex items-center justify-center gap-1.5 shadow-xs ${!isOnline
                  ? "cursor-not-allowed opacity-40 pointer-events-none"
                  : "cursor-pointer active:scale-95"
                  } ${darkMode
                    ? "bg-[#0c4a6e]/50 hover:bg-[#0c4a6e]/80 text-[#bae6fd]"
                    : "bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#0369A1]"
                  }`}
              >
                <Link2 className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                <span className="truncate">{t("shareLinkAction")}</span>
              </button>
            </div>

            {/* Bottom Row: Back [←] | START GAME */}
            <div data-kbd-row="footer" className="flex items-center gap-3 w-full shrink-0">
              {onBack && (
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    onBack();
                  }}
                  className={`p-3 rounded-2xl flex items-center justify-center transition-all shadow-xs active:scale-95 border-none cursor-pointer shrink-0 ${iconBtnSurfaceClass}`}
                  title="Back"
                  aria-label="Back"
                >
                  <ArrowLeft className="w-5 h-5" strokeWidth={2} />
                </button>
              )}

              {effectiveSelectedGame === "blocks" ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!isOnline) return;
                    playClickSound();
                    onStartGame();
                  }}
                  disabled={!isOnline}
                  className={`flex-1 py-3.5 sm:py-4 px-4 text-xs sm:text-sm font-sans font-black uppercase tracking-wider rounded-2xl border-none transition-all duration-150 text-center shadow-md flex items-center justify-center gap-2 ${!isOnline
                    ? "opacity-50 cursor-not-allowed bg-slate-300 dark:bg-[#1B242E] text-slate-500 dark:text-slate-400"
                    : darkMode
                      ? "cursor-pointer hover:scale-[1.01] active:scale-98 bg-[#0EA5E9] hover:bg-[#38BDF8] text-[#082032] shadow-[0_8px_20px_rgba(14,165,233,0.28)]"
                      : "cursor-pointer hover:scale-[1.01] active:scale-98 bg-[#2B8CEE] hover:bg-[#1D7AD9] text-white shadow-[0_8px_20px_rgba(43,140,238,0.24)]"
                    }`}
                >
                  <span className="truncate">
                    {isOnline ? t("startGameAction") : t("offline")}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (!isOnline) return;
                    playClickSound();
                    onStartGame();
                  }}
                  disabled={!isOnline}
                  className={`flex-1 py-3.5 sm:py-4 px-4 text-xs sm:text-sm font-sans font-black uppercase tracking-wider rounded-2xl border-none transition-all duration-150 text-center shadow-md flex items-center justify-center gap-2 ${!isOnline
                    ? "opacity-50 cursor-not-allowed bg-stone-300 dark:bg-zinc-800 text-stone-500 dark:text-stone-400"
                    : darkMode
                      ? "cursor-pointer hover:scale-[1.01] active:scale-98 bg-[#022c22] hover:bg-[#064e3b] text-[#d1fae5] shadow-[0_8px_20px_rgba(0,0,0,0.5)]"
                      : "cursor-pointer hover:scale-[1.01] active:scale-98 bg-[#D1FAE5] hover:bg-[#A7F3D0] active:bg-[#6EE7B7] text-[#065F46] shadow-[0_8px_20px_rgba(6,95,70,0.12)]"
                    }`}
                >
                  <span className="truncate">
                    {isOnline ? t("startGameAction") : t("offline")}
                  </span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};
