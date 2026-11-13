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

