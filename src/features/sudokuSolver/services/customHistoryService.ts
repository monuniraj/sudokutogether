/**
 * Isolated Custom Puzzle History & Storage Service for Sudoku Solver.
 *
 * Isolation & Storage Guarantees:
 * - Guest (`uid === null` or anonymous/GUEST_* IDs): stored strictly under
 *   `localStorage["sudoku_custom_history"]`, capped at a strict sliding window
 *   of the 10 most recent puzzles.
 * - Authenticated Google users (`uid` present & non-anonymous): synced to
 *   Cloud Firestore `users/{uid}/custom_history/{recordId}` (with grid flattened
 *   to `gridFlat: number[]` since Firestore forbids nested arrays), capped at a
 *   strict sliding window of the 100 most recent puzzles, with an isolated
 *   per-UID offline cache (`sudoku_user_${uid}_custom_history`) that never reads
 *   or writes the guest storage drawer.
 */

import {
  collection,
  doc,
  getDocs,
  getDocsFromServer,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  type DocumentData,
} from "firebase/firestore";
import { auth, db } from "../../../firebase";

export const CUSTOM_HISTORY_GUEST_KEY = "sudoku_custom_history";
export const CUSTOM_HISTORY_GUEST_LIMIT = 10;
export const CUSTOM_HISTORY_CLOUD_LIMIT = 100;

export interface CustomPuzzleHistoryRecord {
  id: string;
  date: string;
  grid: number[][];
  difficulty: string;
  isAutoSolved: boolean;
  timeTaken?: number;
  createdAtMs?: number;
}

function getScopedUserHistoryCacheKey(uid: string): string {
  return `sudoku_user_${uid}_custom_history`;
}

/**
 * Resolves a validated authenticated non-anonymous Firebase UID,
 * or returns `null` for guest / anonymous sessions.
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

  try {
    if (auth?.currentUser?.isAnonymous && auth.currentUser.uid === trimmed) {
      return null;
    }
  } catch {
    // Safe fallback outside browser auth context
  }

  return trimmed;
}

export function normalizeCustomGrid(rawGrid: unknown): number[][] | null {
  if (!Array.isArray(rawGrid) || rawGrid.length !== 9) return null;
  const grid: number[][] = [];
  for (let r = 0; r < 9; r++) {
    const rawRow = rawGrid[r];
    if (!Array.isArray(rawRow) || rawRow.length !== 9) return null;
    const row: number[] = [];
    for (let c = 0; c < 9; c++) {
      const val = Number(rawRow[c]);
      if (!Number.isInteger(val) || val < 0 || val > 9) {
        row.push(0);
      } else {
        row.push(val);
      }
    }
    grid.push(row);
  }
  return grid;
}

export function flattenCustomGrid(grid: number[][]): number[] {
  const flat: number[] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = Number(grid[r]?.[c] ?? 0);
      flat.push(Number.isInteger(val) && val >= 0 && val <= 9 ? val : 0);
    }
  }
  return flat;
}

export function unflattenCustomGrid(flat: unknown): number[][] | null {
  if (!Array.isArray(flat) || flat.length !== 81) return null;
  const grid: number[][] = [];
  for (let r = 0; r < 9; r++) {
    const row: number[] = [];
    for (let c = 0; c < 9; c++) {
      const val = Number(flat[r * 9 + c]);
      row.push(Number.isInteger(val) && val >= 0 && val <= 9 ? val : 0);
    }
    grid.push(row);
  }
  return grid;
}

export function countGridClues(grid: number[][]): number {
  let count = 0;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if ((grid[r]?.[c] ?? 0) !== 0) count++;
    }
  }
  return count;
}

const DATE_LOCALE_MAP: Record<string, string> = {
  en: "en-US",
  hi: "hi-IN",
  de: "de-DE",
  ja: "ja-JP",
  ko: "ko-KR",
  es: "es-ES",
  fr: "fr-FR",
  it: "it-IT",
  "pt-BR": "pt-BR",
};

function resolveDateLocale(locale?: string): string {
  if (!locale || typeof locale !== "string") return "en-US";
  return DATE_LOCALE_MAP[locale] || locale;
}

export function normalizeCustomHistoryDifficulty(
  raw: unknown
): "EASY" | "MEDIUM" | "HARD" | "EXPERT" {
  const clean = String(raw || "").trim().toLowerCase();
  if (clean === "easy") return "EASY";
  if (clean === "hard") return "HARD";
  if (clean === "expert") return "EXPERT";
  return "MEDIUM";
}

export function formatCustomHistoryDifficulty(raw: string | undefined | null): string {
  const clean = String(raw || "").trim().toLowerCase();
  if (clean === "easy") return "Easy";
  if (clean === "medium") return "Medium";
  if (clean === "hard") return "Hard";
  if (clean === "expert") return "Expert";
  if (clean.length > 0) {
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  }
  return "Medium";
}

export function formatCustomHistoryDate(
  rawDate: string | undefined | null,
  locale?: string
): string {
  const targetLocale = resolveDateLocale(locale);
  const formatSafe = (d: Date): string => {
    try {
      return d.toLocaleDateString(targetLocale, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  const trimmed = String(rawDate || "").trim();
  if (!trimmed) {
    return formatSafe(new Date());
  }

  // Handle date-only YYYY-MM-DD strings without UTC off-by-one shifts
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (dateOnlyMatch) {
    const year = Number(dateOnlyMatch[1]);
    const monthIdx = Number(dateOnlyMatch[2]) - 1;
    const day = Number(dateOnlyMatch[3]);
    const localDate = new Date(year, monthIdx, day);
    if (!Number.isNaN(localDate.getTime())) {
      return formatSafe(localDate);
    }
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return formatSafe(parsed);
  }

  return trimmed;
}

function resolveTimestampMs(
  rawCreatedAt: unknown,
  rawDate: unknown,
  fallbackMs: number
): number {
  if (typeof rawCreatedAt === "number" && Number.isFinite(rawCreatedAt) && rawCreatedAt > 0) {
    return Math.floor(rawCreatedAt);
  }
  if (
    rawCreatedAt &&
    typeof rawCreatedAt === "object" &&
    "toMillis" in rawCreatedAt &&
    typeof (rawCreatedAt as { toMillis?: unknown }).toMillis === "function"
  ) {
    try {
      const ms = (rawCreatedAt as { toMillis: () => number }).toMillis();
      if (Number.isFinite(ms) && ms > 0) return Math.floor(ms);
    } catch {
      // Ignore conversion error
    }
  }
  if (typeof rawDate === "string" && rawDate.trim()) {
    const parsed = Date.parse(rawDate);
    if (Number.isFinite(parsed) && parsed > 0) return Math.floor(parsed);
  }
  return fallbackMs;
}

function sanitizeRecordId(rawId: unknown, fallbackMs: number): string {
  const clean = String(rawId || "")
    .trim()
    .replace(/[/#?[\]*]/g, "_");
  if (clean.length > 0) return clean.slice(0, 120);
  return `custom_${fallbackMs}_${Math.random().toString(36).slice(2, 7)}`;
}

function normalizeHistoryRecord(raw: unknown): CustomPuzzleHistoryRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const now = Date.now();
  const grid =
    normalizeCustomGrid(obj.grid) ||
    unflattenCustomGrid(obj.gridFlat) ||
    null;
  if (!grid) return null;

  const createdAtMs = resolveTimestampMs(obj.createdAtMs, obj.date, now);
  const id = sanitizeRecordId(obj.id, createdAtMs);
  const dateStr =
    typeof obj.date === "string" && obj.date.trim()
      ? obj.date.trim()
      : new Date(createdAtMs).toISOString();

  const record: CustomPuzzleHistoryRecord = {
    id,
    date: dateStr,
    grid,
    difficulty: formatCustomHistoryDifficulty(
      typeof obj.difficulty === "string" ? obj.difficulty : "Medium"
    ),
    isAutoSolved: Boolean(obj.isAutoSolved),
    createdAtMs,
  };

  if (
    typeof obj.timeTaken === "number" &&
    Number.isFinite(obj.timeTaken) &&
    obj.timeTaken >= 0
  ) {
    record.timeTaken = Math.floor(obj.timeTaken);
  }

  return record;
}

/**
 * Pure sliding-window upsert helper: inserts/replaces `incoming` at newest position,
 * preserves descending chronological order, and prunes any overflow beyond `maxLimit`.
 */
export function applyHistorySlidingWindow(
  existing: CustomPuzzleHistoryRecord[],
  incoming: CustomPuzzleHistoryRecord,
  maxLimit: number
): CustomPuzzleHistoryRecord[] {
  const filtered = existing.filter((item) => item.id !== incoming.id);
  const combined = [incoming, ...filtered];
  combined.sort((a, b) => (b.createdAtMs ?? 0) - (a.createdAtMs ?? 0));
  return combined.slice(0, Math.max(1, maxLimit));
}

function readLocalHistoryList(
  storageKey: string,
  maxLimit: number
): CustomPuzzleHistoryRecord[] {
  if (typeof window === "undefined" || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const normalized: CustomPuzzleHistoryRecord[] = [];
    const seenIds = new Set<string>();
    for (const item of parsed) {
      const rec = normalizeHistoryRecord(item);
      if (!rec || seenIds.has(rec.id)) continue;
      seenIds.add(rec.id);
      normalized.push(rec);
    }
    normalized.sort((a, b) => (b.createdAtMs ?? 0) - (a.createdAtMs ?? 0));
    return normalized.slice(0, maxLimit);
  } catch {
    return [];
  }
}

function writeLocalHistoryList(
  storageKey: string,
  records: CustomPuzzleHistoryRecord[],
  maxLimit: number
): CustomPuzzleHistoryRecord[] {
  const capped = [...records]
    .sort((a, b) => (b.createdAtMs ?? 0) - (a.createdAtMs ?? 0))
    .slice(0, maxLimit);
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(capped));
    } catch (err) {
      console.warn(`[CustomHistory] Failed writing localStorage key "${storageKey}":`, err);
    }
  }
  return capped;
}

function hydrateFirestoreDocRecord(
  docId: string,
  data: DocumentData
): CustomPuzzleHistoryRecord | null {
  return normalizeHistoryRecord({
    ...data,
    id: data?.id || docId,
  });
}

/**
 * Saves a custom puzzle record to isolated Guest (`localStorage` max 10)
 * or authenticated Google Firestore `users/{uid}/custom_history` (max 100).
 */
export async function saveCustomGameToHistory(
  uid: string | null,
  puzzleRecord: CustomPuzzleHistoryRecord
): Promise<CustomPuzzleHistoryRecord[]> {
  const normalized = normalizeHistoryRecord({
    ...puzzleRecord,
    createdAtMs: puzzleRecord.createdAtMs ?? Date.now(),
  });
  if (!normalized) {
    return await getCustomGameHistory(uid);
  }

  const resolvedUid = resolveAuthenticatedUid(uid);

  // 1. Strict Guest / Anonymous Branch (Zero Firestore calls; max 10 items)
  if (!resolvedUid) {
    const current = readLocalHistoryList(
      CUSTOM_HISTORY_GUEST_KEY,
      CUSTOM_HISTORY_GUEST_LIMIT
    );
    const next = applyHistorySlidingWindow(
      current,
      normalized,
      CUSTOM_HISTORY_GUEST_LIMIT
    );
    return writeLocalHistoryList(
      CUSTOM_HISTORY_GUEST_KEY,
      next,
      CUSTOM_HISTORY_GUEST_LIMIT
    );
  }

  // 2. Authenticated Google User Branch (Firestore SSOT + isolated per-UID cache; max 100 items)
  const scopedCacheKey = getScopedUserHistoryCacheKey(resolvedUid);
  const cachedCurrent = readLocalHistoryList(
    scopedCacheKey,
    CUSTOM_HISTORY_CLOUD_LIMIT
  );
  const cachedNext = applyHistorySlidingWindow(
    cachedCurrent,
    normalized,
    CUSTOM_HISTORY_CLOUD_LIMIT
  );
  writeLocalHistoryList(
    scopedCacheKey,
    cachedNext,
    CUSTOM_HISTORY_CLOUD_LIMIT
  );

  try {
    const historyCol = collection(db, "users", resolvedUid, "custom_history");
    const docRef = doc(historyCol, normalized.id);
    const payload: Record<string, unknown> = {
      id: normalized.id,
      date: normalized.date,
      gridFlat: flattenCustomGrid(normalized.grid),
      clueCount: countGridClues(normalized.grid),
      difficulty: normalized.difficulty,
      isAutoSolved: normalized.isAutoSolved,
      createdAtMs: normalized.createdAtMs ?? Date.now(),
      updatedAt: serverTimestamp(),
    };
    if (typeof normalized.timeTaken === "number") {
      payload.timeTaken = normalized.timeTaken;
    }

    await setDoc(docRef, payload, { merge: true });

    // Enforce strict sliding window limit of 100 puzzles in Firestore
    const orderedQuery = query(historyCol, orderBy("createdAtMs", "desc"));
    const snapshot = await getDocs(orderedQuery);
    if (snapshot.docs.length > CUSTOM_HISTORY_CLOUD_LIMIT) {
      const overflowDocs = snapshot.docs.slice(CUSTOM_HISTORY_CLOUD_LIMIT);
      for (let i = 0; i < overflowDocs.length; i += 400) {
        const chunk = overflowDocs.slice(i, i + 400);
        const batch = writeBatch(db);
        for (const oldDoc of chunk) {
          batch.delete(oldDoc.ref);
        }
        await batch.commit();
      }
    }

    const syncedList: CustomPuzzleHistoryRecord[] = [];
    for (const d of snapshot.docs.slice(0, CUSTOM_HISTORY_CLOUD_LIMIT)) {
      const rec = hydrateFirestoreDocRecord(d.id, d.data());
      if (rec) syncedList.push(rec);
    }
    if (syncedList.length > 0) {
      return writeLocalHistoryList(
        scopedCacheKey,
        syncedList,
        CUSTOM_HISTORY_CLOUD_LIMIT
      );
    }
  } catch (err) {
    console.warn("[CustomHistory] Firestore save/prune fallback to scoped cache:", err);
  }

  return cachedNext;
}

/**
 * Retrieves custom Solver puzzle history sorted newest-first, isolated by Guest vs Google UID.
 */
export async function getCustomGameHistory(
  uid: string | null
): Promise<CustomPuzzleHistoryRecord[]> {
  const resolvedUid = resolveAuthenticatedUid(uid);

  if (!resolvedUid) {
    return readLocalHistoryList(
      CUSTOM_HISTORY_GUEST_KEY,
      CUSTOM_HISTORY_GUEST_LIMIT
    );
  }

  const scopedCacheKey = getScopedUserHistoryCacheKey(resolvedUid);
  const historyCol = collection(db, "users", resolvedUid, "custom_history");
  const q = query(
    historyCol,
    orderBy("createdAtMs", "desc"),
    limit(CUSTOM_HISTORY_CLOUD_LIMIT)
  );

  try {
    const isOffline =
      typeof navigator !== "undefined" && navigator.onLine === false;
    const snap = isOffline ? await getDocs(q) : await getDocsFromServer(q).catch(() => getDocs(q));
    const records: CustomPuzzleHistoryRecord[] = [];
    for (const d of snap.docs) {
      const rec = hydrateFirestoreDocRecord(d.id, d.data());
      if (rec) records.push(rec);
    }
    return writeLocalHistoryList(
      scopedCacheKey,
      records,
      CUSTOM_HISTORY_CLOUD_LIMIT
    );
  } catch (err) {
    console.warn("[CustomHistory] Firestore fetch failed, using scoped cache:", err);
    return readLocalHistoryList(scopedCacheKey, CUSTOM_HISTORY_CLOUD_LIMIT);
  }
}

/**
 * Patches `timeTaken` (seconds) onto an existing "Played on Board" custom history entry
 * when the player solves the puzzle on the main board.
 */
export async function updateCustomHistoryTime(
  uid: string | null,
  recordId: string | undefined | null,
  timeTaken: number
): Promise<void> {
  if (!recordId || !Number.isFinite(timeTaken) || timeTaken <= 0) return;
  const cleanSeconds = Math.floor(timeTaken);
  const resolvedUid = resolveAuthenticatedUid(uid);

  if (!resolvedUid) {
    const current = readLocalHistoryList(
      CUSTOM_HISTORY_GUEST_KEY,
      CUSTOM_HISTORY_GUEST_LIMIT
    );
    const idx = current.findIndex((r) => r.id === recordId);
    if (idx === -1) return;
    const updated = [...current];
    updated[idx] = { ...updated[idx], timeTaken: cleanSeconds };
    writeLocalHistoryList(
      CUSTOM_HISTORY_GUEST_KEY,
      updated,
      CUSTOM_HISTORY_GUEST_LIMIT
    );
    return;
  }

  const scopedCacheKey = getScopedUserHistoryCacheKey(resolvedUid);
  const cached = readLocalHistoryList(scopedCacheKey, CUSTOM_HISTORY_CLOUD_LIMIT);
  const cachedIdx = cached.findIndex((r) => r.id === recordId);
  if (cachedIdx !== -1) {
    const nextCache = [...cached];
    nextCache[cachedIdx] = { ...nextCache[cachedIdx], timeTaken: cleanSeconds };
    writeLocalHistoryList(
      scopedCacheKey,
      nextCache,
      CUSTOM_HISTORY_CLOUD_LIMIT
    );
  }

  try {
    const docRef = doc(db, "users", resolvedUid, "custom_history", recordId);
    await updateDoc(docRef, {
      timeTaken: cleanSeconds,
      updatedAt: serverTimestamp(),
    });
  } catch {
    // Doc may already have been pruned beyond the 100-item window or device may be offline
  }
}

