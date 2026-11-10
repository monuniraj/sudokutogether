/**
 * Isolated Local Vault Storage & Streak Engine for Daily Challenges (Milestone 1).
 *
 * - Enforces namespace isolation between guest sessions (`sudoku_daily_vault_guest`)
 *   and authenticated user accounts (`sudoku_daily_vault_${uid}`) without importing
 *   core auth, Firebase, multiplayer, or presence modules.
 * - Computes consecutive calendar streaks deterministically from completed YYYY-MM-DD
 *   keys so replays, out-of-order archive completions, and midnight rollovers remain exact.
 */

import type {
  DailyChallengeProgress,
  DailyDifficulty,
  DailyStats,
  DayRecord,
  RecordDailyCompletionInput,
} from "../types/daily.types";
import { formatDateKey, parseDateKey } from "./dailyGenerator";

const DAILY_VAULT_GUEST_KEY = "sudoku_daily_vault_guest";
const DAILY_VAULT_PREFIX = "sudoku_daily_vault_";
const ACTIVE_USER_BRIDGE_KEY = "sudoku_active_user";
const LAST_AUTH_UID_BRIDGE_KEY = "sudoku_last_auth_uid";
const MS_PER_DAY = 86_400_000;

interface DailyVaultEnvelope {
  version: 1;
  progressByDate: Record<string, DailyChallengeProgress>;
  recordsByDate: Record<string, DayRecord>;
  updatedAt: number;
}

// In-memory fallback store for SSR or restricted storage environments
const memoryVaultFallback = new Map<string, DailyVaultEnvelope>();

function isGuestIdentifier(uid?: string | null): boolean {
  if (!uid) return true;
  const trimmed = uid.trim();
  return (
    !trimmed ||
    trimmed === "guest" ||
    trimmed === "GUEST" ||
    trimmed === "GUEST_ANON" ||
    trimmed.startsWith("GUEST_")
  );
}

/**
 * Resolves the storage vault key for the active or explicitly supplied user namespace.
 */
export function getDailyVaultStorageKey(uid?: string | null): string {
  if (uid !== undefined) {
    return isGuestIdentifier(uid)
      ? DAILY_VAULT_GUEST_KEY
      : `${DAILY_VAULT_PREFIX}${uid!.trim()}`;
  }

  if (typeof window !== "undefined") {
    try {
      const activeBridge =
        window.localStorage.getItem(ACTIVE_USER_BRIDGE_KEY) ||
        window.localStorage.getItem(LAST_AUTH_UID_BRIDGE_KEY);
      if (!isGuestIdentifier(activeBridge)) {
        return `${DAILY_VAULT_PREFIX}${activeBridge!.trim()}`;
      }
    } catch {}
  }

  return DAILY_VAULT_GUEST_KEY;
}

function createEmptyEnvelope(): DailyVaultEnvelope {
  return {
    version: 1,
    progressByDate: {},
    recordsByDate: {},
    updatedAt: Date.now(),
  };
}

function readDailyVault(uid?: string | null): DailyVaultEnvelope {
  const storageKey = getDailyVaultStorageKey(uid);

  if (typeof window === "undefined") {
    return memoryVaultFallback.get(storageKey) ?? createEmptyEnvelope();
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return memoryVaultFallback.get(storageKey) ?? createEmptyEnvelope();
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return createEmptyEnvelope();
    }
    return {
      version: 1,
      progressByDate:
        parsed.progressByDate && typeof parsed.progressByDate === "object"
          ? parsed.progressByDate
          : {},
      recordsByDate:
        parsed.recordsByDate && typeof parsed.recordsByDate === "object"
          ? parsed.recordsByDate
          : {},
      updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : Date.now(),
    };
  } catch {
    return memoryVaultFallback.get(storageKey) ?? createEmptyEnvelope();
  }
}

function writeDailyVault(envelope: DailyVaultEnvelope, uid?: string | null): void {
  const storageKey = getDailyVaultStorageKey(uid);
  const nextEnvelope: DailyVaultEnvelope = {
    ...envelope,
    version: 1,
    updatedAt: Date.now(),
  };

  memoryVaultFallback.set(storageKey, nextEnvelope);

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(nextEnvelope));
    } catch {}
  }
}

/**
 * Converts a validated YYYY-MM-DD key into UTC epoch milliseconds at 00:00:00 UTC.
 */
function dateKeyToUtcMs(dateKey: string): number {
  const { year, month, day } = parseDateKey(dateKey);
  return Date.UTC(year, month - 1, day);
}

/**
 * Shifts a YYYY-MM-DD date key by `deltaDays` calendar days (e.g. -1 for yesterday).
 */
export function shiftDateKey(dateKey: string, deltaDays: number): string {
  const shiftedMs = dateKeyToUtcMs(dateKey) + deltaDays * MS_PER_DAY;
  const d = new Date(shiftedMs);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Computes consecutive calendar streaks and aggregate statistics from a map of DayRecords.
 *
 * Consecutive streak rules:
 * - `longestStreak`: longest uninterrupted chain of consecutive YYYY-MM-DD dates with `status === "COMPLETED"`.
 * - `currentStreak`: active streak anchored to `referenceDateKey` (defaults to today).
 *   If `referenceDateKey` is completed, counts consecutive completed days ending on `referenceDateKey`.
 *   Else if `referenceDateKey - 1 day` (yesterday) is completed, counts consecutive completed days
 *   ending on yesterday (preserving an active streak before today's puzzle is finished).
 *   Otherwise returns `0`.
 */
export function calculateDailyStats(
  recordsByDate: Record<string, DayRecord>,
  referenceDateKey: string = formatDateKey()
): DailyStats {
  const bestTimeByDifficulty: Record<DailyDifficulty, number | null> = {
    EASY: null,
    MEDIUM: null,
    HARD: null,
    EXPERT: null,
    MASTER: null,
  };

  const completedByDifficulty: Record<DailyDifficulty, number> = {
    EASY: 0,
    MEDIUM: 0,
    HARD: 0,
    EXPERT: 0,
    MASTER: 0,
  };

  const completedRecords: DayRecord[] = [];
  for (const key of Object.keys(recordsByDate)) {
    const rec = recordsByDate[key];
    if (rec && rec.status === "COMPLETED") {
      completedRecords.push(rec);
    }
  }

  // Sort ascending by ISO YYYY-MM-DD date string
  completedRecords.sort((a, b) => a.date.localeCompare(b.date));

  let totalTimeSeconds = 0;
  let bestTimeSeconds: number | null = null;
  let perfectDaysCount = 0;

  for (const rec of completedRecords) {
    const secs = Math.max(0, Math.floor(Number(rec.timeSeconds) || 0));
    totalTimeSeconds += secs;

    if (secs > 0 && (bestTimeSeconds === null || secs < bestTimeSeconds)) {
      bestTimeSeconds = secs;
    }

    if (rec.isPerfect) {
      perfectDaysCount++;
    }

    const diff = rec.difficulty;
    if (diff in completedByDifficulty) {
      completedByDifficulty[diff] += 1;
      if (secs > 0) {
        const prevDiffBest = bestTimeByDifficulty[diff];
        if (prevDiffBest === null || secs < prevDiffBest) {
          bestTimeByDifficulty[diff] = secs;
        }
      }
    }
  }

  // Calculate longestStreak across sorted unique non-archive completed dates
  const streakRecords = completedRecords.filter((rec) => !rec.isArchive);
  let longestStreak = 0;
  let runningStreak = 0;
  let prevUtcMs: number | null = null;

  for (const rec of streakRecords) {
    try {
      const currUtcMs = dateKeyToUtcMs(rec.date);
      if (prevUtcMs !== null && currUtcMs - prevUtcMs === MS_PER_DAY) {
        runningStreak += 1;
      } else {
        runningStreak = 1;
      }
      if (runningStreak > longestStreak) {
        longestStreak = runningStreak;
      }
      prevUtcMs = currUtcMs;
    } catch {
      // Skip malformed date keys defensively
    }
  }

  // Calculate currentStreak anchored to referenceDateKey (today or yesterday), excluding Archive Play
  const completedDateSet = new Set(streakRecords.map((r) => r.date));
  let currentStreak = 0;

  try {
    parseDateKey(referenceDateKey);
    const yesterdayKey = shiftDateKey(referenceDateKey, -1);
    let cursorKey: string | null = completedDateSet.has(referenceDateKey)
      ? referenceDateKey
      : completedDateSet.has(yesterdayKey)
        ? yesterdayKey
        : null;

    while (cursorKey && completedDateSet.has(cursorKey)) {
      currentStreak += 1;
      cursorKey = shiftDateKey(cursorKey, -1);
    }
  } catch {
    currentStreak = 0;
  }

  const totalCompleted = completedRecords.length;
  const averageTimeSeconds =
    totalCompleted > 0 ? Math.round(totalTimeSeconds / totalCompleted) : 0;
  const lastCompletedDate =
    totalCompleted > 0 ? completedRecords[totalCompleted - 1].date : null;

  return {
    totalCompleted,
    currentStreak,
    longestStreak,
    bestTimeSeconds,
    averageTimeSeconds,
    totalTimeSeconds,
    perfectDaysCount,
    lastCompletedDate,
    bestTimeByDifficulty,
    completedByDifficulty,
    recordsByDate: { ...recordsByDate },
  };
}

/**
 * Retrieves saved progress for a specific YYYY-MM-DD Daily Challenge, or null if none exists.
 */
export function getDailyProgress(
  date: string,
  uid?: string | null
): DailyChallengeProgress | null {
  const normalizedDate = date.trim();
  parseDateKey(normalizedDate);
  const vault = readDailyVault(uid);
  const entry = vault.progressByDate[normalizedDate];
  if (!entry) return null;

  return {
    ...entry,
    boardFlat: [...entry.boardFlat],
    puzzleFlat: [...entry.puzzleFlat],
    notesByCell: Object.fromEntries(
      Object.entries(entry.notesByCell || {}).map(([k, v]) => [Number(k), [...v]])
    ),
  };
}

/**
 * Persists in-progress or updated Daily Challenge state into the scoped local vault
 * and keeps the calendar DayRecord status synchronized.
 */
export function saveDailyProgress(
  progress: DailyChallengeProgress,
  uid?: string | null
): DailyChallengeProgress {
  const normalizedDate = progress.date.trim();
  parseDateKey(normalizedDate);

  const now = Date.now();
  const sanitizedProgress: DailyChallengeProgress = {
    ...progress,
    date: normalizedDate,
    boardFlat: [...progress.boardFlat],
    puzzleFlat: [...progress.puzzleFlat],
    notesByCell: Object.fromEntries(
      Object.entries(progress.notesByCell || {}).map(([k, v]) => [Number(k), [...v]])
    ),
    elapsedSeconds: Math.max(0, Math.floor(Number(progress.elapsedSeconds) || 0)),
    mistakesCount: Math.max(0, Math.floor(Number(progress.mistakesCount) || 0)),
    hintsCount: Math.max(0, Math.floor(Number(progress.hintsCount) || 0)),
    startedAt: progress.startedAt || now,
    updatedAt: now,
  };

  const vault = readDailyVault(uid);
  vault.progressByDate[normalizedDate] = sanitizedProgress;

  // Keep calendar DayRecord synchronized without downgrading an already COMPLETED day
  const existingRecord = vault.recordsByDate[normalizedDate];
  if (!existingRecord || existingRecord.status !== "COMPLETED") {
    vault.recordsByDate[normalizedDate] = {
      date: normalizedDate,
      difficulty: sanitizedProgress.difficulty,
      status: sanitizedProgress.status,
      timeSeconds: sanitizedProgress.elapsedSeconds,
      mistakes: sanitizedProgress.mistakesCount,
      hints: sanitizedProgress.hintsCount,
      isPerfect:
        sanitizedProgress.status === "COMPLETED" &&
        sanitizedProgress.mistakesCount === 0 &&
        sanitizedProgress.hintsCount === 0,
      completedAt:
        sanitizedProgress.status === "COMPLETED"
          ? sanitizedProgress.completedAt ?? now
          : null,
      updatedAt: now,
      ...(existingRecord?.isArchive !== undefined ? { isArchive: existingRecord.isArchive } : {}),
    };
  }

  writeDailyVault(vault, uid);
  return sanitizedProgress;
}

/**
 * Returns aggregated Daily Challenge statistics and consecutive streak metrics
 * for the active or specified user namespace.
 */
export function getDailyStats(
  uid?: string | null,
  referenceDateKey: string = formatDateKey()
): DailyStats {
  const vault = readDailyVault(uid);
  return calculateDailyStats(vault.recordsByDate, referenceDateKey);
}

/**
 * Records a completed Daily Challenge run for a specific YYYY-MM-DD date,
 * updates any saved progress entry to "COMPLETED", recalculates consecutive
 * streaks and personal bests, and returns the updated DailyStats.
 */
export function recordDailyCompletion(
  input: RecordDailyCompletionInput,
  uid?: string | null,
  referenceDateKey: string = formatDateKey()
): DailyStats {
  const normalizedDate = input.date.trim();
  parseDateKey(normalizedDate);

  const now = input.completedAt ?? Date.now();
  const timeSeconds = Math.max(0, Math.floor(Number(input.timeSeconds) || 0));
  const mistakes = Math.max(0, Math.floor(Number(input.mistakes) || 0));
  const hints = Math.max(0, Math.floor(Number(input.hints) || 0));
  const isPerfect = mistakes === 0 && hints === 0;

  const vault = readDailyVault(uid);
  const existing = vault.recordsByDate[normalizedDate];

  if (existing && existing.status === "COMPLETED") {
    // Retain fastest valid solve time and preserve perfect badge on replay
    const retainedTime =
      existing.timeSeconds > 0 && timeSeconds > 0
        ? Math.min(existing.timeSeconds, timeSeconds)
        : existing.timeSeconds || timeSeconds;

    vault.recordsByDate[normalizedDate] = {
      ...existing,
      difficulty: input.difficulty,
      status: "COMPLETED",
      timeSeconds: retainedTime,
      mistakes: retainedTime === timeSeconds ? mistakes : existing.mistakes,
      hints: retainedTime === timeSeconds ? hints : existing.hints,
      isPerfect: existing.isPerfect || isPerfect,
      completedAt: existing.completedAt ?? now,
      updatedAt: now,
      isArchive: existing.isArchive === true,
    };
  } else {
    vault.recordsByDate[normalizedDate] = {
      date: normalizedDate,
      difficulty: input.difficulty,
      status: "COMPLETED",
      timeSeconds,
      mistakes,
      hints,
      isPerfect,
      completedAt: now,
      updatedAt: now,
      isArchive: Boolean(input.isArchive),
    };
  }

  const existingProgress = vault.progressByDate[normalizedDate];
  if (existingProgress) {
    vault.progressByDate[normalizedDate] = {
      ...existingProgress,
      status: "COMPLETED",
      elapsedSeconds: timeSeconds,
      mistakesCount: mistakes,
      hintsCount: hints,
      completedAt: existingProgress.completedAt ?? now,
      updatedAt: now,
    };
  }

  writeDailyVault(vault, uid);
  return calculateDailyStats(vault.recordsByDate, referenceDateKey);
}

