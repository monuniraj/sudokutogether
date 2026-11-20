import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { X, RefreshCw, Play, XCircle, Lock, Unlock } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useTranslation } from "../../i18n/useTranslation";
import {
  getFocusableElements,
  handleNumericInputKeyDown,
  handleRovingMenuArrowKey,
  isEditableEventTarget,
  useTopmostModalKeyboardLayer,
} from "../../utils/keyboardControls";

export interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  roomCodeInput: string;
  setRoomCodeInput: (code: string) => void;
  roomPinInput: string;
  setRoomPinInput: (pin: string) => void;
  joinRoomError: string | null;
  setJoinRoomError: (err: string | null) => void;
  isJoiningRoomLoading: boolean;
  onJoinRoom: () => void;
  darkMode: boolean;
  playClickSound: () => void;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({
  isOpen,
  onClose,
  onBack,
  roomCodeInput,
  setRoomCodeInput,
  roomPinInput,
  setRoomPinInput,
  joinRoomError,
  setJoinRoomError,
  isJoiningRoomLoading,
  onJoinRoom,
  darkMode,
  playClickSound
}) => {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDivElement>(null);
  const roomCodeInputRef = useRef<HTMLInputElement>(null);
  const roomPinInputRef = useRef<HTMLInputElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const lookupSeqRef = useRef(0);
  const [isRoomCodeFocused, setIsRoomCodeFocused] = React.useState(false);
  const [roomLockState, setRoomLockState] = useState<"idle" | "checking" | "locked" | "unlocked" | "fallback">("idle");

  const handleRoomCodeChange = useCallback((cleaned: string) => {
    setRoomCodeInput(cleaned);
    setJoinRoomError(null);
    if (cleaned.length < 6) {
      setRoomPinInput("");
    }
  }, [setRoomCodeInput, setJoinRoomError, setRoomPinInput]);

  const handleRoomPinChange = useCallback((cleaned: string) => {
    setRoomPinInput(cleaned);
    setJoinRoomError(null);
  }, [setRoomPinInput, setJoinRoomError]);

  // Auto-focus room code input when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        roomCodeInputRef.current?.focus();
      }, 120);
      return () => clearTimeout(timer);
    } else {
      lookupSeqRef.current += 1;
      setRoomLockState("idle");
    }
  }, [isOpen]);

  // Check Firestore /rooms/{roomCode}.isLocked once all 6 digits are entered
  useEffect(() => {
    if (!isOpen) return;
    const cleanedCode = roomCodeInput.trim().replace(/[^0-9]/g, "");
    if (cleanedCode.length !== 6) {
      lookupSeqRef.current += 1;
      setRoomLockState("idle");
      return;
    }

    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setRoomLockState("fallback");
      return;
    }

    const seq = ++lookupSeqRef.current;
    setRoomLockState("checking");

    getDoc(doc(db, "rooms", cleanedCode))
      .then((snap) => {
        if (lookupSeqRef.current !== seq) return;
        if (!snap.exists()) {
          setRoomLockState("fallback");
          return;
        }
        const locked = Boolean(snap.data()?.isLocked);
        if (locked) {
          setRoomLockState("locked");
          requestAnimationFrame(() => {
            if (document.activeElement === roomCodeInputRef.current) {
              roomPinInputRef.current?.focus();
            }
          });
        } else {
          setRoomLockState("unlocked");
          setRoomPinInput("");
        }
      })
      .catch(() => {
        if (lookupSeqRef.current !== seq) return;
        setRoomLockState("fallback");
      });
  }, [isOpen, roomCodeInput, setRoomPinInput]);

  const hasValidCode = roomCodeInput.trim().length === 6;
  const requiresPin = roomLockState === "locked";
  const cleanPinLength = roomPinInput.trim().length;
  const hasValidPin = !requiresPin || (cleanPinLength >= 1 && cleanPinLength <= 4);
  const canJoin = hasValidCode && hasValidPin && !isJoiningRoomLoading;

  useTopmostModalKeyboardLayer(isOpen, {
    id: "join-room-modal",
    priority: 28,
    containerRef: dialogRef,
    restoreFocus: true,
    trapFocus: true,
    onEscape: () => {
      playClickSound();
      onCloseRef.current();
      return true;
    },
    onBackspace: () => {
      playClickSound();
      onCloseRef.current();
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
        return handleRovingMenuArrowKey(e, focusables, "both");
      }
      return false;
    },
  });

  if (!isOpen) return null;

  return (
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={t("joinRoomTitle")}
      key="multiplayer-join-modal"
      initial={{ scale: 0.96, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.96, opacity: 0 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={`relative w-full max-w-[420px] rounded-3xl p-6 border-none flex flex-col gap-4 select-none z-[10001] text-left transition-colors duration-300 ${
        darkMode ? "bg-[#1A1A1A] text-stone-200" : "bg-[#FDFBF7] text-stone-850"
      }`}
      style={{
        boxShadow: darkMode ? '0 10px 40px rgba(0,0,0,0.6)' : '0 4px 20px rgba(0,0,0,0.08)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className={`text-[10px] font-sans font-black tracking-widest uppercase ${darkMode ? "text-sky-400" : "text-[#0369a1]"}`}>
            SudokuSync
          </span>
          <h3 className="text-xl font-sans font-black tracking-tight leading-none text-stone-850 dark:text-stone-100">
            {t("joinRoomTitle")}
          </h3>
        </div>
        <button
          onClick={() => {
            playClickSound();
            onClose();
          }}
          className="p-1.5 rounded-full text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 hover:bg-stone-150 dark:hover:bg-zinc-800 transition-colors border-none cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <p className="text-xs font-sans text-stone-500 dark:text-stone-400">
        {t("enterRoomCodeSub")}
      </p>

      {/* 6-digit room code input with segmented slots */}
      <div className="flex flex-col gap-1.5 mt-1">
        <div className="flex items-center justify-between">
          <label className="font-sans font-bold text-2xs uppercase tracking-wider text-stone-400 dark:text-stone-500">
            {t("roomCodeInputLabel")}
          </label>
          <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500">
            {roomCodeInput.length}/6
          </span>
        </div>

        <div 
          onClick={() => roomCodeInputRef.current?.focus()}
          className="relative w-full cursor-pointer"
        >
          {/* Overlaid hidden numeric input */}
          <input
            ref={roomCodeInputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            autoComplete="one-time-code"
            value={roomCodeInput}
            onFocus={() => setIsRoomCodeFocused(true)}
            onBlur={() => setIsRoomCodeFocused(false)}
            onKeyDown={(e) => {
              if (handleNumericInputKeyDown(e, roomCodeInput, 6, handleRoomCodeChange)) {
                return;
              }
              if (e.key === 'Enter' && canJoin) {
                playClickSound();
                onJoinRoom();
              }
            }}
            onChange={(e) => {
              const cleaned = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
              handleRoomCodeChange(cleaned);
            }}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
            aria-label={t("roomCodeInputLabel")}
          />

          {/* 6 Segmented Digit Slots */}
          <div className="grid grid-cols-6 gap-2 sm:gap-2.5 w-full">
            {[0, 1, 2, 3, 4, 5].map((idx) => {
              const hasDigit = idx < roomCodeInput.length;
              const isSlotActive = isRoomCodeFocused && (idx === roomCodeInput.length || (idx === 5 && roomCodeInput.length === 6));
              const digit = hasDigit ? roomCodeInput[idx] : null;

              return (
                <div
                  key={`room-slot-${idx}`}
                  className={`h-12 sm:h-13 rounded-xl flex items-center justify-center font-mono text-lg sm:text-xl transition-all duration-150 select-none ${
                    isSlotActive
                      ? "border-2 border-sky-500 ring-2 ring-sky-500/40 bg-sky-500/10 dark:bg-sky-500/15 scale-[1.03]"
                      : hasDigit
                      ? (darkMode 
                          ? "border border-sky-500/40 bg-zinc-900 shadow-sm" 
                          : "border border-sky-500/30 bg-stone-100 shadow-sm")
                      : (darkMode
                          ? "border border-zinc-800/80 bg-zinc-900/50"
                          : "border border-stone-200/80 bg-stone-100/60 shadow-inner")
                  }`}
                >
                  {hasDigit ? (
                    <span className="text-stone-900 dark:text-white font-bold">
                      {digit}
                    </span>
                  ) : (
                    <span className={`opacity-25 text-slate-500/30 dark:text-slate-500/30 font-black text-sm ${
                      isSlotActive ? "animate-pulse text-sky-400/60 opacity-40" : ""
                    }`}>
                      –
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Room Lock Status & Conditional 4-Digit PIN Input */}
      {hasValidCode && roomLockState === "unlocked" && (
        <div
          className={`rounded-2xl px-3.5 py-2.5 border-none flex items-center justify-center gap-2 text-xs font-sans font-bold tracking-wide transition-colors duration-150 ${
            darkMode
              ? "bg-[#022c22]/80 text-[#d1fae5] shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
              : "bg-[#D1FAE5]/80 text-[#065F46] shadow-[0_4px_14px_rgba(6,95,70,0.06)]"
          }`}
        >
          <Unlock className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
          <span>{t("roomIsUnlocked")}</span>
        </div>
      )}

      {hasValidCode && (roomLockState === "locked" || roomLockState === "fallback") && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="join-room-pin-input"
              className="font-sans font-bold text-2xs uppercase tracking-wider text-stone-400 dark:text-stone-500 flex items-center gap-1.5"
            >
              <Lock className="w-3 h-3 opacity-60" />
              <span>{t("pinInputLabel")}</span>
              {requiresPin && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-bold normal-case tracking-normal border-none ${
                    darkMode
                      ? "bg-[#4c0519] text-[#fecdd3] shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                      : "bg-[#FFE4E6] text-[#9D174D] shadow-[0_2px_8px_rgba(157,23,77,0.06)]"
                  }`}
                >
                  {t("pinRequired")}
                </span>
              )}
            </label>
          </div>

          <div className="relative w-full">
            <input
              id="join-room-pin-input"
              ref={roomPinInputRef}
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              autoComplete="one-time-code"
              placeholder="••••"
              value={roomPinInput}
              onKeyDown={(e) => {
                if (handleNumericInputKeyDown(e, roomPinInput, 4, handleRoomPinChange)) {
                  return;
                }
                if (e.key === 'Enter' && canJoin) {
                  playClickSound();
                  onJoinRoom();
                }
              }}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                handleRoomPinChange(cleaned);
              }}
              aria-label={t("pinInputLabel")}
              className={`w-full py-3 pl-4 pr-12 rounded-2xl border-none font-mono font-black text-base sm:text-lg tracking-widest text-center transition-all duration-150 focus:outline-none ${
                requiresPin
                  ? (darkMode
                      ? "bg-[#4c0519]/45 focus:bg-[#4c0519]/65 text-[#fecdd3] placeholder-[#fecdd3]/35 shadow-[0_4px_12px_rgba(0,0,0,0.35)] focus:ring-2 focus:ring-rose-400/50"
                      : "bg-[#FFE4E6]/55 focus:bg-[#FFE4E6]/75 text-[#9D174D] placeholder-[#9D174D]/35 shadow-[0_4px_14px_rgba(157,23,77,0.05)] focus:ring-2 focus:ring-rose-300/70")
                  : (darkMode
                      ? "bg-zinc-900/75 text-stone-100 placeholder-stone-600 shadow-[0_4px_12px_rgba(0,0,0,0.3)] focus:ring-2 focus:ring-sky-500/40"
                      : "bg-stone-100/85 text-stone-850 placeholder-stone-400/70 shadow-[0_4px_14px_rgba(0,0,0,0.04)] focus:ring-2 focus:ring-sky-300/70")
              }`}
            />
            <span
              className={`pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold ${
                requiresPin
                  ? (darkMode ? "text-[#fecdd3]/75" : "text-[#9D174D]/70")
                  : "text-stone-400 dark:text-stone-500"
              }`}
            >
              {roomPinInput.length}/4
            </span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {joinRoomError && (
        <p className="text-xs font-sans font-bold text-rose-500 text-center -my-1 flex items-center justify-center gap-1.5">
          <XCircle className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
          <span>{joinRoomError.replace(/^❌\s*/, "")}</span>
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2.5 mt-2">
        <button
          onClick={() => {
            playClickSound();
            onBack();
          }}
          className={`flex-1 py-3 px-4 rounded-2xl font-sans font-black text-xs uppercase tracking-wider border-none cursor-pointer transition-all active:scale-98 truncate ${
            darkMode ? "bg-zinc-800 text-stone-300 hover:bg-zinc-700" : "bg-stone-150 text-stone-700 hover:bg-stone-200"
          }`}
        >
          {t("backAction")}
        </button>
        <button
          disabled={!canJoin}
          onClick={() => {
            playClickSound();
            onJoinRoom();
          }}
          className={`flex-2 py-3 px-4 rounded-2xl font-sans font-black text-xs uppercase tracking-wider border-none cursor-pointer transition-all shadow-none active:scale-98 flex items-center justify-center gap-2 ${
            canJoin
              ? (darkMode ? "bg-[#0c4a6e] hover:bg-[#0369a1] text-sky-100" : "bg-[#E0F2FE] hover:bg-[#bae6fd] text-[#0369a1]")
              : "opacity-50 cursor-not-allowed bg-stone-200 dark:bg-zinc-800 text-stone-400"
          }`}
        >
          {isJoiningRoomLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-current" />
          )}
          <span className="truncate">{isJoiningRoomLoading ? t("joiningText") : t("joinGameAction")}</span>
        </button>
      </div>
    </motion.div>
  );
};
