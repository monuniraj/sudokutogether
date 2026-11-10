/**
 * Isolated Firestore Cloud Sync Service for Daily Challenges (Milestone 2).
 *
 * Strict isolation guarantees:
 * - Zero imports or modifications to core gameplay, multiplayer, presence, or friend services.
 * - Strictly bypasses Firestore (zero network calls) for guest or anonymous sessions.
 * - Scoped exclusively to:
 *   - `/users/{uid}/daily_challenges/{YYYY-MM-DD}` (daily progress & completion state)
 *   - `/users/{uid}/daily_stats/meta` (aggregated streak & career daily statistics)
 */

import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
  type DocumentData,
  type DocumentReference,
  type DocumentSnapshot,
} from "firebase/firestore";
import { auth, db } from "../../../firebase";
import type {
  DailyChallengeProgress,
  DailyChallengeStatus,
  DailyDifficulty,
  DailyStats,
  DayRecord,
} from "../types/daily.types";
import { getDailyDifficultyForDate, getSeedForDate, parseDateKey } from "./dailyGenerator";
import { getDailyProgress, getDailyStats } from "./dailyStorage";

const USERS_COLLECTION = "users";
const DAILY_CHALLENGES_SUBCOLLECTION = "daily_challenges";
const DAILY_STATS_SUBCOLLECTION = "daily_stats";
const DAILY_STATS_META_DOC = "meta";

const ALL_DAILY_DIFFICULTIES: readonly DailyDifficulty[] = [
  "EASY",
  "MEDIUM",
  "HARD",
  "EXPERT",
  "MASTER",
] as const;

const VALID_STATUSES: ReadonlySet<string> = new Set([
  "NOT_STARTED",
  "IN_PROGRESS",
  "COMPLETED",
  "FAILED",
]);

/**
 * Resolves a validated authenticated UID, or returns `null` if the caller is a guest,
 * anonymous session, or invalid identifier.
 */
function resolveAuthenticatedUid(uid: string | null | undefined): string | null {
  if (!uid || typeof uid !== "string") return null;
  const trimmed = uid.trim();
  if (!trimmed || trimmed.includes("/")) return null;

  const lower = trimmed.toLowerCase();
  if (
    lower === "guest" ||
    lower === "guest_anon" ||
    lower.startsWith("guest_")
  ) {
    return null;
  }

  // Defensive check against Firebase anonymous sessions sharing the same UID
  try {
    if (auth?.currentUser?.isAnonymous && auth.currentUser.uid === trimmed) {
      return null;
    }
  } catch {
    // Ignore auth inspection errors in non-browser/test environments
  }

  return trimmed;
}

function getDailyChallengeDocRef(uid: string, dateKey: string): DocumentReference<DocumentData> {
  return doc(db, USERS_COLLECTION, uid, DAILY_CHALLENGES_SUBCOLLECTION, dateKey);
}

function getDailyStatsMetaDocRef(uid: string): DocumentReference<DocumentData> {
  return doc(db, USERS_COLLECTION, uid, DAILY_STATS_SUBCOLLECTION, DAILY_STATS_META_DOC);
}

function getGlobalCompletionDocRef(
  dateKey: string,
  uid: string
): DocumentReference<DocumentData> {
  return doc(db, DAILY_CHALLENGES_SUBCOLLECTION, dateKey, "completions", uid);
}

/**
 * Safely converts a numeric epoch ms or Firestore Timestamp-like object into epoch milliseconds.
 */
function toEpochMillis(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.floor(value));
  }
  if (
    value &&
    typeof value === "object" &&
    "toMillis" in value &&
    typeof (value as { toMillis?: unknown }).toMillis === "function"
  ) {
    try {
      const ms = (value as { toMillis: () => number }).toMillis();
      return typeof ms === "number" && Number.isFinite(ms) ? Math.max(0, Math.floor(ms)) : fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

function normalizeDifficultyValue(raw: unknown, fallbackDate: string): DailyDifficulty {
  if (typeof raw === "string") {
    const upper = raw.trim().toUpperCase();
    if (ALL_DAILY_DIFFICULTIES.includes(upper as DailyDifficulty)) {
      return upper as DailyDifficulty;
    }
  }
  return getDailyDifficultyForDate(fallbackDate);
}

function normalizeStatusValue(raw: unknown): DailyChallengeStatus {
  if (typeof raw === "string") {
    const upper = raw.trim().toUpperCase();
    if (VALID_STATUSES.has(upper)) {
      return upper as DailyChallengeStatus;
    }
  }
  return "NOT_STARTED";
}

function normalizeBoardArray(raw: unknown): number[] {
  if (!Array.isArray(raw) || raw.length !== 81) {
    return Array<number>(81).fill(0);
  }
  return raw.map((cell) => {
    const n = Number(cell);
    return Number.isInteger(n) && n >= 0 && n <= 9 ? n : 0;
  });
}

function normalizeNotesMap(raw: unknown): Record<number, number[]> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }
  const normalized: Record<number, number[]> = {};
  for (const [key, list] of Object.entries(raw as Record<string, unknown>)) {
    const idx = Number(key);
    if (!Number.isInteger(idx) || idx < 0 || idx > 80 || !Array.isArray(list)) {
      continue;
    }
    const digits = Array.from(
      new Set(
        list
          .map((d) => Number(d))
          .filter((d) => Number.isInteger(d) && d >= 1 && d <= 9)
      )
    ).sort((a, b) => a - b);
    if (digits.length > 0) {
      normalized[idx] = digits;
    }
  }
  return normalized;
}

/**
 * Fetches a Firestore document preferring live server data (SSOT) with offline cache fallback.
 */
async function readServerFirstDoc(
  ref: DocumentReference<DocumentData>
): Promise<DocumentSnapshot<DocumentData>> {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return await getDoc(ref);
  }
  try {
    return await getDocFromServer(ref);
  } catch {
    return await getDoc(ref);
  }
}

async function safeReadServerFirstDoc(
  ref: DocumentReference<DocumentData>
): Promise<DocumentSnapshot<DocumentData> | null> {
  try {
    return await readServerFirstDoc(ref);
  } catch {
    return null;
  }
}

export type DailyEligibilityStatus = "OFFICIAL_DAILY" | "EXHIBITION";

export interface DailyCloudWriteOptions {
  /** When true (e.g. multiplayer exhibition replays), bypasses official cloud writes */
  isExhibition?: boolean;
}

function isTerminalDailyStatus(raw: unknown): boolean {
  const normalized = normalizeStatusValue(raw);
  return normalized === "COMPLETED" || normalized === "FAILED";
}

function isCompletionSnapCompleted(
  snap: DocumentSnapshot<DocumentData> | null
): boolean {
  if (!snap || !snap.exists()) return false;
  const data = snap.data();
  if (!data || data.status === undefined || data.status === null) {
    // Legacy completion docs represent a completed run by document existence
    return true;
  }
  return normalizeStatusValue(data.status) === "COMPLETED";
}

/**
 * Determines whether a player is eligible for an official Daily Challenge attempt
 * ("OFFICIAL_DAILY") or has already finished/failed this calendar date locally or
 * in Cloud Firestore ("EXHIBITION").
 */
export async function checkPlayerDailyEligibility(
  uid: string | null | undefined,
  dateKey: string
): Promise<DailyEligibilityStatus> {
  const normalizedDate = String(dateKey || "").trim();
  parseDateKey(normalizedDate);

  const cleanUid = resolveAuthenticatedUid(uid);
  const storageUid = cleanUid ?? null;

  // 1. Local vault inspection (authoritative for instant/offline disqualifications)
  const localProgress = getDailyProgress(normalizedDate, storageUid);
  if (
    localProgress &&
    (localProgress.status === "COMPLETED" || localProgress.status === "FAILED")
  ) {
    return "EXHIBITION";
  }

  const localStats = getDailyStats(storageUid, normalizedDate);
  const localRecord = localStats.recordsByDate[normalizedDate];
  if (
    localRecord &&
    (localRecord.status === "COMPLETED" || localRecord.status === "FAILED")
  ) {
    return "EXHIBITION";
  }

  // Strictly avoid Firestore calls for guest or anonymous sessions
  if (!cleanUid) {
    return "OFFICIAL_DAILY";
  }

  // 2. Cloud Firestore SSOT inspection
  const [completionSnap, challengeSnap] = await Promise.all([
    safeReadServerFirstDoc(getGlobalCompletionDocRef(normalizedDate, cleanUid)),
    safeReadServerFirstDoc(getDailyChallengeDocRef(cleanUid, normalizedDate)),
  ]);

  if (isCompletionSnapCompleted(completionSnap)) {
    return "EXHIBITION";
  }

  if (challengeSnap?.exists() && isTerminalDailyStatus(challengeSnap.data()?.status)) {
    return "EXHIBITION";
  }

  return "OFFICIAL_DAILY";
}

function hydrateProgressFromDocData(
  dateKey: string,
  data: DocumentData
): DailyChallengeProgress {
  const updatedAt = toEpochMillis(
    data.updatedAt ?? data.lastUpdated,
    toEpochMillis(data.completedAt, 0)
  );
  const completedAtRaw = data.completedAt !== undefined && data.completedAt !== null
    ? toEpochMillis(data.completedAt, 0)
    : undefined;

  const progress: DailyChallengeProgress = {
    date: dateKey,
    seed:
      typeof data.seed === "number" && Number.isFinite(data.seed)
        ? data.seed >>> 0
        : getSeedForDate(dateKey),
    difficulty: normalizeDifficultyValue(data.difficulty, dateKey),
    status: normalizeStatusValue(data.status),
    boardFlat: normalizeBoardArray(data.boardFlat),
    puzzleFlat: normalizeBoardArray(data.puzzleFlat),
    notesByCell: normalizeNotesMap(data.notesByCell),
    elapsedSeconds: Math.max(0, Math.floor(Number(data.elapsedSeconds) || 0)),
    mistakesCount: Math.max(0, Math.floor(Number(data.mistakesCount) || 0)),
    hintsCount: Math.max(0, Math.floor(Number(data.hintsCount) || 0)),
    startedAt: toEpochMillis(data.startedAt, updatedAt),
    updatedAt,
  };

  if (completedAtRaw !== undefined && completedAtRaw > 0) {
    progress.completedAt = completedAtRaw;
  }

  return progress;
}

function hydrateDayRecordFromDocData(
  fallbackDate: string,
  raw: unknown
): DayRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const rec = raw as Record<string, unknown>;
  const candidateDate =
    typeof rec.date === "string" && rec.date.trim() ? rec.date.trim() : fallbackDate;

  try {
    parseDateKey(candidateDate);
  } catch {
    return null;
  }

  const status = normalizeStatusValue(rec.status);
  const timeSeconds = Math.max(0, Math.floor(Number(rec.timeSeconds) || 0));
  const mistakes = Math.max(0, Math.floor(Number(rec.mistakes) || 0));
  const hints = Math.max(0, Math.floor(Number(rec.hints) || 0));
  const updatedAt = toEpochMillis(rec.updatedAt ?? rec.lastUpdated, 0);
  const completedAtMs =
    rec.completedAt !== null && rec.completedAt !== undefined
      ? toEpochMillis(rec.completedAt, 0)
      : null;

  return {
    date: candidateDate,
    difficulty: normalizeDifficultyValue(rec.difficulty, candidateDate),
    status,
    timeSeconds,
    mistakes,
    hints,
    isPerfect:
      typeof rec.isPerfect === "boolean"
        ? rec.isPerfect
        : status === "COMPLETED" && mistakes === 0 && hints === 0,
    completedAt: completedAtMs && completedAtMs > 0 ? completedAtMs : null,
    updatedAt,
    ...(typeof rec.isArchive === "boolean" ? { isArchive: rec.isArchive } : {}),
  };
}

function hydrateStatsFromDocData(data: DocumentData): DailyStats {
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

  const rawBestMap =
    data.bestTimeByDifficulty && typeof data.bestTimeByDifficulty === "object"
      ? (data.bestTimeByDifficulty as Record<string, unknown>)
      : {};
  const rawCompletedMap =
    data.completedByDifficulty && typeof data.completedByDifficulty === "object"
      ? (data.completedByDifficulty as Record<string, unknown>)
      : {};

  for (const diff of ALL_DAILY_DIFFICULTIES) {
    const rawBest = rawBestMap[diff];
    if (typeof rawBest === "number" && Number.isFinite(rawBest) && rawBest > 0) {
      bestTimeByDifficulty[diff] = Math.floor(rawBest);
    }
    const rawCount = rawCompletedMap[diff];
    if (typeof rawCount === "number" && Number.isFinite(rawCount) && rawCount > 0) {
      completedByDifficulty[diff] = Math.floor(rawCount);
    }
  }

  const recordsByDate: Record<string, DayRecord> = {};
  if (data.recordsByDate && typeof data.recordsByDate === "object") {
    for (const [dateKey, rawRec] of Object.entries(
      data.recordsByDate as Record<string, unknown>
    )) {
      const hydrated = hydrateDayRecordFromDocData(dateKey, rawRec);
      if (hydrated) {
        recordsByDate[hydrated.date] = hydrated;
      }
    }
  }

  const rawBestTime = data.bestTimeSeconds;
  const bestTimeSeconds =
    typeof rawBestTime === "number" && Number.isFinite(rawBestTime) && rawBestTime > 0
      ? Math.floor(rawBestTime)
      : null;

  const lastCompletedDate =
    typeof data.lastCompletedDate === "string" && data.lastCompletedDate.trim()
      ? data.lastCompletedDate.trim()
      : null;

  return {
    totalCompleted: Math.max(0, Math.floor(Number(data.totalCompleted) || 0)),
    currentStreak: Math.max(0, Math.floor(Number(data.currentStreak) || 0)),
    longestStreak: Math.max(0, Math.floor(Number(data.longestStreak) || 0)),
    bestTimeSeconds,
    averageTimeSeconds: Math.max(0, Math.floor(Number(data.averageTimeSeconds) || 0)),
    totalTimeSeconds: Math.max(0, Math.floor(Number(data.totalTimeSeconds) || 0)),
    perfectDaysCount: Math.max(0, Math.floor(Number(data.perfectDaysCount) || 0)),
    lastCompletedDate,
    bestTimeByDifficulty,
    completedByDifficulty,
    recordsByDate,
  };
}

/**
 * Extracts the canonical last-modified timestamp (ms) from a DailyChallengeProgress entry,
 * supporting both `lastUpdated` and `updatedAt` fields.
 */
function getProgressTimestamp(progress: DailyChallengeProgress): number {
  const withAlias = progress as DailyChallengeProgress & { lastUpdated?: unknown };
  return toEpochMillis(withAlias.lastUpdated ?? progress.updatedAt, 0);
}

/**
 * Resolves conflicts between local vault progress and Firestore cloud progress.
 * Cloud wins strictly when `cloud.lastUpdated > local.lastUpdated` (mapped to `updatedAt`),
 * otherwise local progress is retained.
 */
export function resolveProgressConflict(
  local: DailyChallengeProgress | null,
  cloud: DailyChallengeProgress | null
): DailyChallengeProgress | null {
  if (!local && !cloud) return null;
  if (!local) return cloud;
  if (!cloud) return local;

  const cloudUpdated = getProgressTimestamp(cloud);
  const localUpdated = getProgressTimestamp(local);

  return cloudUpdated > localUpdated ? cloud : local;
}

/**
 * Fetches a single day's Daily Challenge progress from `/users/{uid}/daily_challenges/{YYYY-MM-DD}`.
 * Strictly returns `null` without making any Firestore network call for guest users.
 */
export async function fetchDailyProgressFromCloud(
  uid: string | null | undefined,
  date: string
): Promise<DailyChallengeProgress | null> {
  const cleanUid = resolveAuthenticatedUid(uid);
  if (!cleanUid) return null;

  const normalizedDate = String(date || "").trim();
  parseDateKey(normalizedDate);

  try {
    const snap = await readServerFirstDoc(getDailyChallengeDocRef(cleanUid, normalizedDate));
    if (!snap.exists()) return null;
    const data = snap.data();
    if (!data) return null;
    return hydrateProgressFromDocData(normalizedDate, data);
  } catch (err) {
    console.warn("[DailyCloudService] Failed to fetch daily progress:", err);
    return null;
  }
}

/**
 * Persists in-progress or updated Daily Challenge state to `/users/{uid}/daily_challenges/{YYYY-MM-DD}`.
 * Strictly exits early without network calls for guest users or exhibition sessions.
 */
export async function saveDailyProgressToCloud(
  uid: string | null | undefined,
  progress: DailyChallengeProgress & DailyCloudWriteOptions,
  options?: DailyCloudWriteOptions
): Promise<void> {
  if (progress.isExhibition || options?.isExhibition) return;

  const cleanUid = resolveAuthenticatedUid(uid);
  if (!cleanUid) return;

  const normalizedDate = String(progress.date || "").trim();
  parseDateKey(normalizedDate);

  const now = Date.now();
  const updatedAt = toEpochMillis(progress.updatedAt, now) || now;

  const payload: Record<string, unknown> = {
    date: normalizedDate,
    seed: progress.seed >>> 0,
    difficulty: progress.difficulty,
    status: progress.status,
    boardFlat: normalizeBoardArray(progress.boardFlat),
    puzzleFlat: normalizeBoardArray(progress.puzzleFlat),
    notesByCell: normalizeNotesMap(progress.notesByCell),
    elapsedSeconds: Math.max(0, Math.floor(Number(progress.elapsedSeconds) || 0)),
    mistakesCount: Math.max(0, Math.floor(Number(progress.mistakesCount) || 0)),
    hintsCount: Math.max(0, Math.floor(Number(progress.hintsCount) || 0)),
    startedAt: toEpochMillis(progress.startedAt, updatedAt),
    updatedAt,
    lastUpdated: updatedAt,
    serverUpdatedAt: serverTimestamp(),
  };

  if (progress.completedAt !== undefined && progress.completedAt !== null) {
    payload.completedAt = toEpochMillis(progress.completedAt, updatedAt);
  }

  try {
    await setDoc(getDailyChallengeDocRef(cleanUid, normalizedDate), payload, {
      merge: true,
    });
  } catch (err) {
    console.warn("[DailyCloudService] Failed to save daily progress:", err);
  }
}

export interface DailyLeaderboardEntry {
  uid: string;
  playerName: string;
  isGuest: boolean;
  time: number;
  mistakes: number;
  completedAt: number;
}

export interface DailyLeaderboardResult {
  entries: DailyLeaderboardEntry[];
  userRank: number | null;
  userEntry: DailyLeaderboardEntry | null;
  isAuthenticated: boolean;
  isOfflineOrError: boolean;
}

/**
 * Atomically records a completed Daily Challenge outcome to:
 * - `/users/{uid}/daily_challenges/{YYYY-MM-DD}`
 * - `/users/{uid}/daily_stats/meta`
 * - `/daily_challenges/{YYYY-MM-DD}/completions/{uid}` (Global Daily Leaderboard)
 * Strictly exits early without network calls for guest users, exhibition sessions,
 * or when a completion record already exists (preserving write-once immutability).
 */
export async function recordDailyCompletionToCloud(
  uid: string | null | undefined,
  date: string,
  record: DayRecord,
  stats: DailyStats,
  playerName?: string,
  options?: DailyCloudWriteOptions
): Promise<void> {
  if (options?.isExhibition) return;

  const cleanUid = resolveAuthenticatedUid(uid);
  if (!cleanUid) return;

  const normalizedDate = String(date || record.date || "").trim();
  parseDateKey(normalizedDate);

  const userChallengeDocRef = getDailyChallengeDocRef(cleanUid, normalizedDate);
  const leaderboardDocRef = getGlobalCompletionDocRef(normalizedDate, cleanUid);

  // Inspect existing completion state before writing to prevent overwriting official records
  const [existingLeaderboardSnap, existingChallengeSnap] = await Promise.all([
    safeReadServerFirstDoc(leaderboardDocRef),
    safeReadServerFirstDoc(userChallengeDocRef),
  ]);

  if (
    isCompletionSnapCompleted(existingLeaderboardSnap) ||
    (existingChallengeSnap?.exists() &&
      isTerminalDailyStatus(existingChallengeSnap.data()?.status))
  ) {
    return;
  }

  const now = Date.now();
  const updatedAt = toEpochMillis(record.updatedAt, now) || now;
  const completedAt =
    record.completedAt !== null && record.completedAt !== undefined
      ? toEpochMillis(record.completedAt, updatedAt)
      : updatedAt;

  const cleanRecord: DayRecord = {
    date: normalizedDate,
    difficulty: record.difficulty,
    status: "COMPLETED",
    timeSeconds: Math.max(0, Math.floor(Number(record.timeSeconds) || 0)),
    mistakes: Math.max(0, Math.floor(Number(record.mistakes) || 0)),
    hints: Math.max(0, Math.floor(Number(record.hints) || 0)),
    isPerfect: Boolean(record.isPerfect),
    completedAt,
    updatedAt,
    ...(typeof record.isArchive === "boolean" ? { isArchive: record.isArchive } : {}),
  };

  const challengePayload: Record<string, unknown> = {
    date: normalizedDate,
    difficulty: cleanRecord.difficulty,
    status: "COMPLETED",
    elapsedSeconds: cleanRecord.timeSeconds,
    mistakesCount: cleanRecord.mistakes,
    hintsCount: cleanRecord.hints,
    isPerfect: cleanRecord.isPerfect,
    completedAt,
    updatedAt,
    lastUpdated: updatedAt,
    record: cleanRecord,
    serverUpdatedAt: serverTimestamp(),
  };

  const statsPayload: Record<string, unknown> = {
    totalCompleted: Math.max(0, Math.floor(Number(stats.totalCompleted) || 0)),
    currentStreak: Math.max(0, Math.floor(Number(stats.currentStreak) || 0)),
    longestStreak: Math.max(0, Math.floor(Number(stats.longestStreak) || 0)),
    bestTimeSeconds:
      stats.bestTimeSeconds !== null && stats.bestTimeSeconds > 0
        ? Math.floor(stats.bestTimeSeconds)
        : null,
    averageTimeSeconds: Math.max(0, Math.floor(Number(stats.averageTimeSeconds) || 0)),
    totalTimeSeconds: Math.max(0, Math.floor(Number(stats.totalTimeSeconds) || 0)),
    perfectDaysCount: Math.max(0, Math.floor(Number(stats.perfectDaysCount) || 0)),
    lastCompletedDate: stats.lastCompletedDate ?? normalizedDate,
    bestTimeByDifficulty: { ...stats.bestTimeByDifficulty },
    completedByDifficulty: { ...stats.completedByDifficulty },
    recordsByDate: {
      ...stats.recordsByDate,
      [normalizedDate]: cleanRecord,
    },
    updatedAt,
    lastUpdated: updatedAt,
    serverUpdatedAt: serverTimestamp(),
  };

  const resolvedPlayerName =
    (playerName && playerName.trim()) ||
    auth?.currentUser?.displayName?.trim() ||
    "Player";

  const leaderboardPayload: Record<string, unknown> = {
    uid: cleanUid,
    playerName: resolvedPlayerName,
    isGuest: false,
    status: "COMPLETED",
    time: cleanRecord.timeSeconds,
    mistakes: cleanRecord.mistakes,
    difficulty: cleanRecord.difficulty,
    completedAt,
    updatedAt: serverTimestamp(),
  };

  try {
    const batch = writeBatch(db);
    batch.set(userChallengeDocRef, challengePayload, {
      merge: true,
    });
    batch.set(getDailyStatsMetaDocRef(cleanUid), statsPayload, {
      merge: true,
    });
    batch.set(leaderboardDocRef, leaderboardPayload);
    await batch.commit();
  } catch {
    // Fallback: guarantee private user stats commit even if global leaderboard rules block
    try {
      const privateBatch = writeBatch(db);
      privateBatch.set(userChallengeDocRef, challengePayload, {
        merge: true,
      });
      privateBatch.set(getDailyStatsMetaDocRef(cleanUid), statsPayload, {
        merge: true,
      });
      await privateBatch.commit();
    } catch (err) {
      console.warn("[DailyCloudService] Failed to record daily completion:", err);
    }
  }
}

function hydrateLeaderboardEntry(
  docId: string,
  data: DocumentData
): DailyLeaderboardEntry {
  const entryUid =
    typeof data.uid === "string" && data.uid.trim() ? data.uid.trim() : docId;
  const rawName =
    typeof data.playerName === "string" && data.playerName.trim()
      ? data.playerName.trim()
      : typeof data.displayName === "string" && data.displayName.trim()
        ? data.displayName.trim()
        : "Player";
  const isGuest =
    typeof data.isGuest === "boolean"
      ? data.isGuest
      : entryUid.toLowerCase().startsWith("guest");
  const time = Math.max(
    0,
    Math.floor(Number(data.time ?? data.timeSeconds ?? data.elapsedSeconds) || 0)
  );
  const mistakes = Math.max(
    0,
    Math.floor(Number(data.mistakes ?? data.mistakesCount) || 0)
  );
  const completedAt = toEpochMillis(data.completedAt, 0);

  return {
    uid: entryUid,
    playerName: rawName,
    isGuest,
    time,
    mistakes,
    completedAt,
  };
}

/**
 * Queries `/daily_challenges/{date}/completions` ordered by `time ASC, mistakes ASC` (limit 20)
 * and resolves the active authenticated user's rank (including when outside Top 20).
 * Strictly bypasses Firestore for guest users.
 */
export async function fetchDailyLeaderboard(
  uid: string | null | undefined,
  date: string
): Promise<DailyLeaderboardResult> {
  const cleanUid = resolveAuthenticatedUid(uid);
  if (!cleanUid) {
    return {
      entries: [],
      userRank: null,
      userEntry: null,
      isAuthenticated: false,
      isOfflineOrError: false,
    };
  }

  const normalizedDate = String(date || "").trim();
  parseDateKey(normalizedDate);

  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return {
      entries: [],
      userRank: null,
      userEntry: null,
      isAuthenticated: true,
      isOfflineOrError: true,
    };
  }

  try {
    const completionsCol = collection(
      db,
      DAILY_CHALLENGES_SUBCOLLECTION,
      normalizedDate,
      "completions"
    );

    let entries: DailyLeaderboardEntry[] = [];
    try {
      const topQuery = query(
        completionsCol,
        orderBy("time", "asc"),
        orderBy("mistakes", "asc"),
        limit(20)
      );
      const snap = await getDocs(topQuery);
      entries = snap.docs.map((d) => hydrateLeaderboardEntry(d.id, d.data()));
    } catch {
      // Composite index fallback: order by time ASC and tie-break by mistakes ASC client-side
      const fallbackQuery = query(
        completionsCol,
        orderBy("time", "asc"),
        limit(20)
      );
      const snap = await getDocs(fallbackQuery);
      entries = snap.docs
        .map((d) => hydrateLeaderboardEntry(d.id, d.data()))
        .sort((a, b) => a.time - b.time || a.mistakes - b.mistakes);
    }

    const foundIdx = entries.findIndex((entry) => entry.uid === cleanUid);
    if (foundIdx >= 0) {
      return {
        entries,
        userRank: foundIdx + 1,
        userEntry: entries[foundIdx],
        isAuthenticated: true,
        isOfflineOrError: false,
      };
    }

    // Active user is outside Top 20: check if they have a cloud completion and count faster runs
    const userDocRef = doc(
      db,
      DAILY_CHALLENGES_SUBCOLLECTION,
      normalizedDate,
      "completions",
      cleanUid
    );
    const userSnap = await readServerFirstDoc(userDocRef);
    if (!userSnap.exists() || !userSnap.data()) {
      return {
        entries,
        userRank: null,
        userEntry: null,
        isAuthenticated: true,
        isOfflineOrError: false,
      };
    }

    const userEntry = hydrateLeaderboardEntry(userSnap.id, userSnap.data()!);
    let userRank: number | null = null;
    try {
      const fasterQuery = query(
        completionsCol,
        where("time", "<", userEntry.time)
      );
      const countSnap = await getCountFromServer(fasterQuery);
      userRank = (countSnap.data().count || 0) + 1;
    } catch {
      userRank = entries.length + 1;
    }

    return {
      entries,
      userRank,
      userEntry,
      isAuthenticated: true,
      isOfflineOrError: false,
    };
  } catch (err) {
    console.warn("[DailyCloudService] Failed to fetch daily leaderboard:", err);
    return {
      entries: [],
      userRank: null,
      userEntry: null,
      isAuthenticated: true,
      isOfflineOrError: true,
    };
  }
}

/**
 * Fetches aggregated Daily Challenge statistics and calendar records from `/users/{uid}/daily_stats/meta`.
 * Strictly returns `null` without making any Firestore network call for guest users.
 */
export async function fetchDailyStatsFromCloud(
  uid: string | null | undefined
): Promise<DailyStats | null> {
  const cleanUid = resolveAuthenticatedUid(uid);
  if (!cleanUid) return null;

  try {
    const snap = await readServerFirstDoc(getDailyStatsMetaDocRef(cleanUid));
    if (!snap.exists()) return null;
    const data = snap.data();
    if (!data) return null;
    return hydrateStatsFromDocData(data);
  } catch (err) {
    console.warn("[DailyCloudService] Failed to fetch daily stats:", err);
    return null;
  }
}

