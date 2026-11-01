/**
 * Isolated Pure LocalStorage Tracking for Guest Login Reminders
 * - Tracks completed guest games count without touching React state or Cloud Firestore
 * - Enforces a 24-hour mute cooldown on user dismissal (✕)
 */

const GUEST_GAMES_COUNT_KEY = "sudoku_guest_games_completed_count";
const GUEST_PROMPT_DISMISSED_AT_KEY = "sudoku_guest_prompt_dismissed_at";
const GUEST_PROMPT_THRESHOLD = 3;
const MUTE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export function getGuestGamesCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(GUEST_GAMES_COUNT_KEY);
    return raw ? Math.max(0, parseInt(raw, 10) || 0) : 0;
  } catch {
    return 0;
  }
}

export function incrementGuestGameCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const current = getGuestGamesCount();
    const next = current + 1;
    localStorage.setItem(GUEST_GAMES_COUNT_KEY, String(next));
    return next;
  } catch {
    return 0;
  }
}

export function isGuestPromptMuted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const dismissedAtRaw = localStorage.getItem(GUEST_PROMPT_DISMISSED_AT_KEY);
    if (!dismissedAtRaw) return false;
    const dismissedAt = parseInt(dismissedAtRaw, 10);
    if (!dismissedAt || isNaN(dismissedAt)) return false;
    return Date.now() - dismissedAt < MUTE_DURATION_MS;
  } catch {
    return false;
  }
}

export function dismissGuestPrompt24h(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GUEST_PROMPT_DISMISSED_AT_KEY, String(Date.now()));
  } catch {
    // Ignore storage exceptions
  }
}

export function shouldShowGuestPrompt(isGuest: boolean, threshold = GUEST_PROMPT_THRESHOLD): boolean {
  if (!isGuest) return false;
  if (isGuestPromptMuted()) return false;
  return getGuestGamesCount() >= threshold;
}
