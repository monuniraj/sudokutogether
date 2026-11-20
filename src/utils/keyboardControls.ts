/**
 * Pure keyboard event helpers and shared topmost-modal keyboard coordinator
 * shared across gameplay (`App.tsx`), Solver (`SudokuSolverScreen.tsx`), and modals.
 */

import { useEffect, useRef, type RefObject } from "react";

/**
 * Returns true when focus is inside an editable form field so global puzzle shortcuts do not hijack typing.
 */
export function isEditableEventTarget(target: EventTarget | null): boolean {
  if (!target || typeof HTMLElement === "undefined" || !(target instanceof HTMLElement)) {
    return false;
  }
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

/**
 * Extracts a 1-9 digit from either top-row (`Digit1`-`Digit9`) or numpad (`Numpad1`-`Numpad9`) keys,
 * ignoring modified chords (Ctrl/Meta/Alt).
 */
export function getKeyboardDigit(e: KeyboardEvent): number | null {
  if (e.ctrlKey || e.metaKey || e.altKey) return null;
  if (e.key >= "1" && e.key <= "9") {
    return Number(e.key);
  }
  const match = /^(?:Digit|Numpad)([1-9])$/.exec(e.code);
  return match ? Number(match[1]) : null;
}

const FOCUSABLE_SELECTOR = [
  "button:not([disabled]):not([tabindex='-1'])",
  "[href]:not([tabindex='-1'])",
  "input:not([disabled]):not([type='hidden']):not([tabindex='-1'])",
  "select:not([disabled]):not([tabindex='-1'])",
  "textarea:not([disabled]):not([tabindex='-1'])",
  "[tabindex]:not([tabindex='-1'])",
].join(", ");

/**
 * Returns visible, keyboard-focusable elements within `container` in DOM order.
 */
export function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];
  const candidates = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  return candidates.filter((el) => {
    if (el.hasAttribute("disabled") || el.getAttribute("aria-hidden") === "true") {
      return false;
    }
    const style = window.getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") {
      return false;
    }
    return el.getClientRects().length > 0;
  });
}

/**
 * Traps Tab / Shift+Tab focus cleanly inside an active modal dialog container.
 */
export function trapFocusTabKey(
  e: KeyboardEvent,
  container: HTMLElement | null
): boolean {
  if (e.key !== "Tab" || !container) return false;
  const focusables = getFocusableElements(container);
  if (focusables.length === 0) {
    e.preventDefault();
    return true;
  }
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const active = document.activeElement as HTMLElement | null;

  if (e.shiftKey) {
    if (!active || active === first || !container.contains(active)) {
      e.preventDefault();
      last.focus();
      return true;
    }
  } else if (!active || active === last || !container.contains(active)) {
    e.preventDefault();
    first.focus();
    return true;
  }
  return false;
}

/**
 * Moves focus between items in an open menu/dropdown/toolbar using Arrow keys, Home, and End,
 * calling `e.preventDefault()` so the underlying page never scrolls.
 */
export function handleRovingMenuArrowKey(
  e: { key: string; preventDefault: () => void; stopPropagation?: () => void },
  items: HTMLElement[],
  orientation: "vertical" | "horizontal" | "both" = "vertical"
): boolean {
  if (items.length === 0) return false;

  const isNext =
    (orientation !== "horizontal" && e.key === "ArrowDown") ||
    (orientation !== "vertical" && e.key === "ArrowRight");
  const isPrev =
    (orientation !== "horizontal" && e.key === "ArrowUp") ||
    (orientation !== "vertical" && e.key === "ArrowLeft");

  if (!isNext && !isPrev && e.key !== "Home" && e.key !== "End") {
    return false;
  }

  e.preventDefault();
  e.stopPropagation?.();
  const activeIdx = items.indexOf(document.activeElement as HTMLElement);
  let targetIdx = 0;

  if (e.key === "Home") {
    targetIdx = 0;
  } else if (e.key === "End") {
    targetIdx = items.length - 1;
  } else if (isNext) {
    targetIdx = activeIdx >= 0 ? (activeIdx + 1) % items.length : 0;
  } else if (isPrev) {
    targetIdx = activeIdx >= 0 ? (activeIdx - 1 + items.length) % items.length : items.length - 1;
  }

  items[targetIdx]?.focus();
  return true;
}

/**
 * Handles numeric input keydowns for both top-row `0–9` (`Digit0`–`Digit9`) and desktop Numpad
 * (`Numpad0`–`Numpad9`, even when NumLock is off) without double-entry or missed keystrokes.
 */
export function handleNumericInputKeyDown(
  e: {
    code: string;
    key: string;
    ctrlKey: boolean;
    metaKey: boolean;
    altKey: boolean;
    preventDefault: () => void;
    currentTarget: HTMLInputElement;
  },
  currentValue: string,
  maxLength: number,
  onValueChange: (cleaned: string) => void
): boolean {
  if (e.ctrlKey || e.metaKey || e.altKey) return false;

  const codeMatch = /^(?:Numpad|Digit)([0-9])$/.exec(e.code);
  const digit = codeMatch
    ? codeMatch[1]
    : /^[0-9]$/.test(e.key)
      ? e.key
      : null;

  if (digit === null) return false;

  e.preventDefault();
  const input = e.currentTarget;
  const start = input.selectionStart ?? currentValue.length;
  const end = input.selectionEnd ?? currentValue.length;
  const rawNext = currentValue.slice(0, start) + digit + currentValue.slice(end);
  const cleaned = rawNext.replace(/[^0-9]/g, "").slice(0, maxLength);
  onValueChange(cleaned);

  const nextPos = Math.min(start + 1, cleaned.length);
  requestAnimationFrame(() => {
    try {
      input.setSelectionRange(nextPos, nextPos);
    } catch {
      // Ignore selection range errors on unmounted inputs
    }
  });
  return true;
}

export interface ModalKeyboardLayerOptions {
  /** Unique identifier for this modal/overlay layer. */
  id: string;
  /** Optional stack priority; higher values always sit on top of lower priorities. Defaults to `0`. */
  priority?: number;
  /** Optional modal root ref for automatic Tab focus trapping and focus handoff/restoration. */
  containerRef?: RefObject<HTMLElement | null>;
  /** Restore focus to the opener (with preventScroll) when this layer closes. Defaults to `true`. */
  restoreFocus?: boolean;
  /** Trap Tab / Shift+Tab inside `containerRef` when present. Defaults to `true`. */
  trapFocus?: boolean;
  /** Focus the first focusable element inside `containerRef` on activation when needed. Defaults to `false`. */
  autoFocus?: boolean;
  /** Custom Escape handler for the topmost layer. Return `false` to decline handling. */
  onEscape?: (e: KeyboardEvent) => boolean | void;
  /** Custom Backspace handler when focus is NOT in an editable element. Return `false` to decline handling. */
  onBackspace?: (e: KeyboardEvent) => boolean | void;
  /** Optional custom capture-phase handler for keys on the topmost layer. Return `true` when consumed. */
  onKeyDown?: (e: KeyboardEvent) => boolean | void;
}

interface InternalModalKeyboardLayer {
  token: number;
  seq: number;
  previousFocus: HTMLElement | null;
  getOptions: () => ModalKeyboardLayerOptions;
}

const modalKeyboardStack: InternalModalKeyboardLayer[] = [];
let modalLayerTokenSeq = 0;
let modalListenersAttached = false;

function getSortedTopmostModalLayer(): InternalModalKeyboardLayer | null {
  if (modalKeyboardStack.length === 0) return null;
  let top = modalKeyboardStack[0];
  let topPriority = top.getOptions().priority ?? 0;
  for (let i = 1; i < modalKeyboardStack.length; i++) {
    const candidate = modalKeyboardStack[i];
    const candidatePriority = candidate.getOptions().priority ?? 0;
    if (
      candidatePriority > topPriority ||
      (candidatePriority === topPriority && candidate.seq > top.seq)
    ) {
      top = candidate;
      topPriority = candidatePriority;
    }
  }
  return top;
}

function handleModalStackKeyDownCapture(e: KeyboardEvent): void {
  const top = getSortedTopmostModalLayer();
  if (!top) return;

  const opts = top.getOptions();
  const editable = isEditableEventTarget(e.target);

  if (opts.onKeyDown) {
    const consumed = opts.onKeyDown(e);
    if (consumed === true) {
      e.stopPropagation();
      return;
    }
  }

  if (e.key === "Escape") {
    if (opts.onEscape) {
      const handled = opts.onEscape(e);
      if (handled !== false) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    }
    // Always keep Escape scoped strictly to the topmost active layer
    e.stopPropagation();
    return;
  }

  if (e.key === "Backspace") {
    // Never hijack Backspace while typing inside inputs/textareas/selects/contenteditable
    if (editable) return;
    if (!e.ctrlKey && !e.metaKey && !e.altKey && opts.onBackspace) {
      const handled = opts.onBackspace(e);
      if (handled !== false) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    }
    if (!e.ctrlKey && !e.metaKey && !e.altKey) {
      e.stopPropagation();
    }
    return;
  }

  if (e.key === "Tab") {
    const container = opts.containerRef?.current ?? null;
    if (opts.trapFocus !== false && container) {
      trapFocusTabKey(e, container);
    }
    e.stopPropagation();
    return;
  }

  // Prevent arrow/activation keys from reaching underlying listeners when focus is outside the modal container
  const isNavOrActionKey =
    e.key === "ArrowUp" ||
    e.key === "ArrowDown" ||
    e.key === "ArrowLeft" ||
    e.key === "ArrowRight" ||
    e.key === "Enter" ||
    e.key === " ";

  if (isNavOrActionKey) {
    const container = opts.containerRef?.current ?? null;
    const targetNode = e.target as Node | null;
    if (!container || !targetNode || !container.contains(targetNode)) {
      e.stopPropagation();
    }
  }
}

function handleModalStackKeyDownBubble(e: KeyboardEvent): void {
  if (modalKeyboardStack.length === 0) return;
  if (
    e.key === "Escape" ||
    e.key === "Tab" ||
    e.key === "ArrowUp" ||
    e.key === "ArrowDown" ||
    e.key === "ArrowLeft" ||
    e.key === "ArrowRight" ||
    e.key === "Enter" ||
    e.key === " " ||
    (e.key === "Backspace" && !isEditableEventTarget(e.target))
  ) {
    e.stopPropagation();
  }
}

function syncModalStackListeners(): void {
  if (typeof window === "undefined") return;
  if (modalKeyboardStack.length > 0 && !modalListenersAttached) {
    window.addEventListener("keydown", handleModalStackKeyDownCapture, true);
    window.addEventListener("keydown", handleModalStackKeyDownBubble, false);
    modalListenersAttached = true;
  } else if (modalKeyboardStack.length === 0 && modalListenersAttached) {
    window.removeEventListener("keydown", handleModalStackKeyDownCapture, true);
    window.removeEventListener("keydown", handleModalStackKeyDownBubble, false);
    modalListenersAttached = false;
  }
}

function safeFocusWithoutScroll(el: HTMLElement | null | undefined): void {
  if (!el || !el.isConnected) return;
  if (el.hasAttribute("disabled")) return;
  try {
    el.focus({ preventScroll: true });
  } catch {
    el.focus();
  }
}

/**
 * Returns `true` whenever at least one modal/overlay layer is registered on the shared keyboard stack.
 */
export function hasActiveModalKeyboardLayer(): boolean {
  return modalKeyboardStack.length > 0;
}

/**
 * Returns the `id` of the currently owning topmost modal keyboard layer, or `null` if empty.
 */
export function getTopmostModalKeyboardLayerId(): string | null {
  const top = getSortedTopmostModalLayer();
  return top ? top.getOptions().id : null;
}

/**
 * Registers a modal/overlay layer on the shared topmost-modal keyboard stack and returns its cleanup function.
 */
export function registerModalKeyboardLayer(
  options: ModalKeyboardLayerOptions | (() => ModalKeyboardLayerOptions)
): () => void {
  const getOptions = typeof options === "function" ? options : () => options;
  const resolved = getOptions();
  const activeEl =
    typeof document !== "undefined" && document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
  const previousFocus =
    activeEl && typeof document !== "undefined" && activeEl !== document.body
      ? activeEl
      : null;

  // Replace any stale entry with the same layer id
  for (let i = modalKeyboardStack.length - 1; i >= 0; i--) {
    if (modalKeyboardStack[i].getOptions().id === resolved.id) {
      modalKeyboardStack.splice(i, 1);
    }
  }

  modalLayerTokenSeq += 1;
  const entry: InternalModalKeyboardLayer = {
    token: modalLayerTokenSeq,
    seq: modalLayerTokenSeq,
    previousFocus,
    getOptions,
  };
  modalKeyboardStack.push(entry);
  syncModalStackListeners();

  let unregistered = false;
  return () => {
    if (unregistered) return;
    unregistered = true;

    const idx = modalKeyboardStack.findIndex((item) => item.token === entry.token);
    if (idx !== -1) {
      modalKeyboardStack.splice(idx, 1);
    }
    syncModalStackListeners();

    const closingOpts = entry.getOptions();
    if (closingOpts.restoreFocus === false || typeof window === "undefined") {
      return;
    }

    window.requestAnimationFrame(() => {
      const nextTop = getSortedTopmostModalLayer();
      if (nextTop) {
        const nextContainer = nextTop.getOptions().containerRef?.current ?? null;
        const activeNow = document.activeElement as HTMLElement | null;
        if (nextContainer && (!activeNow || !nextContainer.contains(activeNow))) {
          if (entry.previousFocus && entry.previousFocus.isConnected && nextContainer.contains(entry.previousFocus)) {
            safeFocusWithoutScroll(entry.previousFocus);
          } else {
            const firstFocusable = getFocusableElements(nextContainer)[0];
            safeFocusWithoutScroll(firstFocusable);
          }
        }
        return;
      }

      if (entry.previousFocus && entry.previousFocus.isConnected) {
        const activeNow = document.activeElement;
        const closingContainer = closingOpts.containerRef?.current ?? null;
        const focusLostOrInsideClosing =
          !activeNow ||
          activeNow === document.body ||
          !activeNow.isConnected ||
          (closingContainer !== null && closingContainer.contains(activeNow));
        if (focusLostOrInsideClosing) {
          safeFocusWithoutScroll(entry.previousFocus);
        }
      }
    });
  };
}

/**
 * React hook that binds an open modal/overlay to the shared topmost-modal keyboard stack
 * with automatic handoff and non-scrolling focus restoration on close/unmount.
 */
export function useTopmostModalKeyboardLayer(
  isOpen: boolean,
  options: ModalKeyboardLayerOptions
): void {
  const optionsRef = useRef<ModalKeyboardLayerOptions>(options);
  optionsRef.current = options;

  useEffect(() => {
    if (!isOpen) return;

    const unregister = registerModalKeyboardLayer(() => optionsRef.current);

    let rafId: number | null = null;
    if (optionsRef.current.autoFocus && typeof window !== "undefined") {
      rafId = window.requestAnimationFrame(() => {
        const container = optionsRef.current.containerRef?.current ?? null;
        if (!container) return;
        const activeNow = document.activeElement as HTMLElement | null;
        if (!activeNow || !container.contains(activeNow)) {
          const firstFocusable = getFocusableElements(container)[0];
          safeFocusWithoutScroll(firstFocusable);
        }
      });
    }

    return () => {
      if (rafId !== null && typeof window !== "undefined") {
        window.cancelAnimationFrame(rafId);
      }
      unregister();
    };
  }, [isOpen, options.id, options.priority]);
}

