/**
 * Pure keyboard event helpers shared across gameplay (`App.tsx`) and Solver (`SudokuSolverScreen.tsx`).
 */

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

