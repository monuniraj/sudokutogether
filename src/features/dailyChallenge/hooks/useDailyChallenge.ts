/**
 * Isolated Gameplay & Auto-Save Hook for Daily Challenges (Milestone 3).
 *
 * Strict isolation guarantees:
 * - Zero imports or modifications to existing gameplay hooks (`useSudokuGame.ts`),
 *   multiplayer services, presence hooks, or sound engines.
 * - Self-contained state, 1-second timer, visibility auto-pause, pencil notes,
 *   3-strike mistake handling, debounced auto-save, and Firestore cloud reconciliation.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  DailyChallengeProgress,
  DailyChallengeStatus,
  DailyDifficulty,
  DailyStats,
} from "../types/daily.types";
import {
  formatDateKey,
  generateDailyPuzzle,
  getDailyDifficultyForDate,
  getSeedForDate,
  parseDateKey,
} from "../services/dailyGenerator";
import {
  calculateDailyStats,
  getDailyProgress,
  getDailyStats,
  recordDailyCompletion,
  saveDailyProgress,
} from "../services/dailyStorage";
import {
  fetchDailyProgressFromCloud,
  fetchDailyStatsFromCloud,
  recordDailyCompletionToCloud,
  resolveProgressConflict,
  saveDailyProgressToCloud,
} from "../services/dailyCloudService";

const MAX_MISTAKES = 3;
const DEFAULT_CLOUD_DEBOUNCE_MS = 1500;
const EMPTY_BOARD_STRING = "0".repeat(81);

export interface UseDailyChallengeOptions {
  /** Authenticated Firebase UID, or null/undefined for guest sessions */
  uid?: string | null;
  /** Initial calendar date in YYYY-MM-DD format (defaults to today's local date) */
  initialDate?: string;
  /** Debounce delay in milliseconds for cloud auto-save writes (default: 1500ms) */
  autoSaveDebounceMs?: number;
  /** Enable internal 1-second gameplay timer & visibility auto-pause (default: false for passive display cards) */
  enableTimer?: boolean;
  /** Optional external counter to trigger local+cloud daily vault re-sync */
  refreshTrigger?: number;
}

export interface UseDailyChallengeReturn {
  /** Active challenge calendar date in YYYY-MM-DD format */
  date: string;
  /** Switch active Daily Challenge calendar date (YYYY-MM-DD) */
  setDate: (nextDate: string) => void;
  /** Normalized identity UID this hook's loaded state currently represents (null = guest) */
  loadedUid: string | null;
  /** Current lifecycle status of the active day's challenge */
  status: DailyChallengeStatus;
  /** Current 81-character board string ('0' = empty, '1'..'9' = digit) */
  board: string;
  /** Immutable 81-character starting clue string ('0' = editable, '1'..'9' = clue) */
  initialBoard: string;
  /** Canonical 81-character solved board string */
  solution: string;
  /** Difficulty tier mapped from the active calendar day */
  difficulty: DailyDifficulty;
  /** Currently selected cell index (0..80), or null when none selected */
  selectedCell: number | null;
  /** Pencil marks keyed by cell index (0..80) -> sorted candidate digits */
  notes: Record<number, number[]>;
  /** Active solve timer in seconds */
  elapsedTime: number;
  /** Whether the active challenge timer and board inputs are paused */
  isPaused: boolean;
  /** Current mistake count (reaching 3 transitions status to 'FAILED') */
  mistakes: number;
  /** Aggregated Daily Challenge career statistics and streak metrics */
  stats: DailyStats;
  /** True while loading/reconciling local and cloud state for the active date/uid */
  isLoading: boolean;
  /** Select or deselect a cell index (0..80 or null) */
  selectCell: (index: number | null) => void;
  /** Enter a digit (1..9) into the currently selected editable cell */
  setNumber: (num: number) => void;
  /** Toggle a pencil mark candidate (1..9) on the currently selected empty cell */
  toggleNote: (num: number) => void;
  /** Clear the digit or pencil marks from the currently selected editable cell */
  eraseCell: () => void;
  /** Pause or resume the active Daily Challenge session */
  togglePause: () => void;
}

function isAuthenticatedUid(uid?: string | null): uid is string {
  if (!uid || typeof uid !== "string") return false;
  const trimmed = uid.trim();
  if (!trimmed || trimmed.includes("/")) return false;
  const lower = trimmed.toLowerCase();
  return (
    lower !== "guest" &&
    lower !== "guest_anon" &&
    !lower.startsWith("guest_")
  );
}

function flatToBoardString(flat: readonly number[]): string {
  if (!Array.isArray(flat) || flat.length !== 81) {
    return EMPTY_BOARD_STRING;
  }
  let result = "";
  for (let i = 0; i < 81; i++) {
    const val = Number(flat[i]);
    result += Number.isInteger(val) && val >= 1 && val <= 9 ? String(val) : "0";
  }
  return result;
}

function boardStringToFlat(boardStr: string): number[] {
  const flat = Array<number>(81).fill(0);
  for (let i = 0; i < 81 && i < boardStr.length; i++) {
    const code = boardStr.charCodeAt(i) - 48;
    flat[i] = code >= 1 && code <= 9 ? code : 0;
  }
  return flat;
}

function cloneNotesMap(notes: Record<number, number[]>): Record<number, number[]> {
  const cloned: Record<number, number[]> = {};
  for (const [k, v] of Object.entries(notes)) {
    const idx = Number(k);
    if (Number.isInteger(idx) && idx >= 0 && idx <= 80 && Array.isArray(v) && v.length > 0) {
      cloned[idx] = [...v].sort((a, b) => a - b);
    }
  }
  return cloned;
}

/**
 * Removes candidate `num` from pencil marks in the same row, column, and 3x3 box as `cellIndex`.
 */
function prunePeerNotes(
  notes: Record<number, number[]>,
  cellIndex: number,
  num: number
): Record<number, number[]> {
  const targetRow = Math.floor(cellIndex / 9);
  const targetCol = cellIndex % 9;
  const targetBoxRow = Math.floor(targetRow / 3);
  const targetBoxCol = Math.floor(targetCol / 3);

  const next: Record<number, number[]> = {};
  for (const [key, digits] of Object.entries(notes)) {
    const idx = Number(key);
    if (idx === cellIndex || !Array.isArray(digits)) continue;

    const r = Math.floor(idx / 9);
    const c = idx % 9;
    const isSamePeer =
      r === targetRow ||
      c === targetCol ||
      (Math.floor(r / 3) === targetBoxRow && Math.floor(c / 3) === targetBoxCol);

    const filtered = isSamePeer ? digits.filter((d) => d !== num) : [...digits];
    if (filtered.length > 0) {
      next[idx] = filtered;
    }
  }
  return next;
}

/**
 * Reconciles local and cloud DailyStats by merging per-date records (preferring COMPLETED
 * outcomes and newer/faster valid records) and recomputing consecutive streaks.
 */
function reconcileStatsWithCloud(
  localStats: DailyStats,
  cloudStats: DailyStats | null,
  uid: string,
  referenceDateKey: string
): DailyStats {
  if (!cloudStats) return localStats;

  const mergedRecords = { ...localStats.recordsByDate };
  let localNeedsUpdate = false;

  for (const [dateKey, cloudRec] of Object.entries(cloudStats.recordsByDate)) {
    const localRec = mergedRecords[dateKey];
    if (!localRec) {
      mergedRecords[dateKey] = cloudRec;
      localNeedsUpdate = true;
      continue;
    }

    if (cloudRec.status === "COMPLETED" && localRec.status !== "COMPLETED") {
      mergedRecords[dateKey] = cloudRec;
      localNeedsUpdate = true;
      continue;
    }

    if (cloudRec.status === "COMPLETED" && localRec.status === "COMPLETED") {
      const cloudFaster =
        cloudRec.timeSeconds > 0 &&
        (localRec.timeSeconds <= 0 || cloudRec.timeSeconds < localRec.timeSeconds);
      if (cloudFaster || cloudRec.updatedAt > localRec.updatedAt) {
        mergedRecords[dateKey] = {
          ...localRec,
          ...cloudRec,
          timeSeconds: cloudFaster ? cloudRec.timeSeconds : localRec.timeSeconds,
          isPerfect: localRec.isPerfect || cloudRec.isPerfect,
        };
        localNeedsUpdate = true;
      }
    } else if (cloudRec.updatedAt > localRec.updatedAt) {
      mergedRecords[dateKey] = cloudRec;
      localNeedsUpdate = true;
    }
  }

  if (localNeedsUpdate) {
    for (const rec of Object.values(mergedRecords)) {
      if (rec.status === "COMPLETED") {
        recordDailyCompletion(
          {
            date: rec.date,
            difficulty: rec.difficulty,
            timeSeconds: rec.timeSeconds,
            mistakes: rec.mistakes,
            hints: rec.hints,
            completedAt: rec.completedAt ?? rec.updatedAt,
            ...(typeof rec.isArchive === "boolean" ? { isArchive: rec.isArchive } : {}),
          },
          uid,
          referenceDateKey
        );
      }
    }
  }

  return calculateDailyStats(mergedRecords, referenceDateKey);
}

export function useDailyChallenge(
  optionsOrUid?: UseDailyChallengeOptions | string | null
): UseDailyChallengeReturn {
  const normalizedOptions: UseDailyChallengeOptions =
    typeof optionsOrUid === "string" || optionsOrUid === null
      ? { uid: typeof optionsOrUid === "string" ? optionsOrUid : null }
      : optionsOrUid ?? {};

  const uid = isAuthenticatedUid(normalizedOptions.uid)
    ? normalizedOptions.uid.trim()
    : null;
  const refreshTrigger = normalizedOptions.refreshTrigger ?? 0;
  const enableTimer = Boolean(normalizedOptions.enableTimer);
  const autoSaveDebounceMs =
    typeof normalizedOptions.autoSaveDebounceMs === "number" &&
    normalizedOptions.autoSaveDebounceMs >= 0
      ? normalizedOptions.autoSaveDebounceMs
      : DEFAULT_CLOUD_DEBOUNCE_MS;

  const [date, setDateState] = useState<string>(() => {
    if (normalizedOptions.initialDate) {
      const candidate = normalizedOptions.initialDate.trim();
      parseDateKey(candidate);
      return candidate;
    }
    return formatDateKey(new Date());
  });

  const initialGenerated = useMemo(() => generateDailyPuzzle(date), []);

  const [loadedUid, setLoadedUid] = useState<string | null>(uid);
  const [status, setStatus] = useState<DailyChallengeStatus>("NOT_STARTED");
  const [board, setBoard] = useState<string>(() =>
    flatToBoardString(initialGenerated.puzzleFlat)
  );
  const [initialBoard, setInitialBoard] = useState<string>(() =>
    flatToBoardString(initialGenerated.puzzleFlat)
  );
  const [solution, setSolution] = useState<string>(() =>
    flatToBoardString(initialGenerated.solutionFlat)
  );
  const [difficulty, setDifficulty] = useState<DailyDifficulty>(
    initialGenerated.difficulty
  );
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<number, number[]>>({});
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [mistakes, setMistakes] = useState<number>(0);
  const [stats, setStats] = useState<DailyStats>(() => getDailyStats(uid));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const startedAtRef = useRef<number>(Date.now());
  const cloudSaveTimerRef = useRef<number | null>(null);

  // Live snapshot ref so debounced timers, pause handlers, and visibility listeners stay fresh
  const liveSnapshotRef = useRef({
    uid,
    date,
    status,
    board,
    initialBoard,
    difficulty,
    notes,
    elapsedTime,
    mistakes,
  });

  useEffect(() => {
    liveSnapshotRef.current = {
      uid,
      date,
      status,
      board,
      initialBoard,
      difficulty,
      notes,
      elapsedTime,
      mistakes,
    };
  }, [uid, date, status, board, initialBoard, difficulty, notes, elapsedTime, mistakes]);

  const clearScheduledCloudSave = useCallback(() => {
    if (cloudSaveTimerRef.current !== null && typeof window !== "undefined") {
      window.clearTimeout(cloudSaveTimerRef.current);
      cloudSaveTimerRef.current = null;
    }
  }, []);

  const buildProgressPayload = useCallback(
    (overrides?: Partial<DailyChallengeProgress>): DailyChallengeProgress => {
      const snap = liveSnapshotRef.current;
      const targetDate = overrides?.date ?? snap.date;
      const now = Date.now();
      const resolvedStatus = overrides?.status ?? snap.status;

      const payload: DailyChallengeProgress = {
        date: targetDate,
        seed: overrides?.seed ?? getSeedForDate(targetDate),
        difficulty: overrides?.difficulty ?? snap.difficulty,
        status: resolvedStatus,
        boardFlat: overrides?.boardFlat ?? boardStringToFlat(snap.board),
        puzzleFlat: overrides?.puzzleFlat ?? boardStringToFlat(snap.initialBoard),
        notesByCell: overrides?.notesByCell ?? cloneNotesMap(snap.notes),
        elapsedSeconds: overrides?.elapsedSeconds ?? snap.elapsedTime,
        mistakesCount: overrides?.mistakesCount ?? snap.mistakes,
        hintsCount: overrides?.hintsCount ?? 0,
        startedAt: overrides?.startedAt ?? startedAtRef.current,
        updatedAt: overrides?.updatedAt ?? now,
      };

      if (resolvedStatus === "COMPLETED") {
        payload.completedAt = overrides?.completedAt ?? now;
      }

      return payload;
    },
    []
  );

  const persistProgressNow = useCallback(
    (
      overrides?: Partial<DailyChallengeProgress>,
      options?: { immediateCloud?: boolean }
    ) => {
      const snap = liveSnapshotRef.current;
      const payload = buildProgressPayload(overrides);

      // Always write immediately to isolated local vault
      saveDailyProgress(payload, snap.uid);

      if (!isAuthenticatedUid(snap.uid)) {
        return;
      }

      clearScheduledCloudSave();

      if (options?.immediateCloud) {
        void saveDailyProgressToCloud(snap.uid, payload);
      } else if (typeof window !== "undefined") {
        const targetUid = snap.uid;
        cloudSaveTimerRef.current = window.setTimeout(() => {
          cloudSaveTimerRef.current = null;
          void saveDailyProgressToCloud(targetUid, payload);
        }, autoSaveDebounceMs);
      } else {
        void saveDailyProgressToCloud(snap.uid, payload);
      }
    },
    [autoSaveDebounceMs, buildProgressPayload, clearScheduledCloudSave]
  );

  const setDate = useCallback(
    (nextDate: string) => {
      const trimmed = String(nextDate || "").trim();
      parseDateKey(trimmed);
      clearScheduledCloudSave();
      setDateState(trimmed);
    },
    [clearScheduledCloudSave]
  );

  // Initialization & Local + Cloud Reconciliation Flow
  useEffect(() => {
    let cancelled = false;
    clearScheduledCloudSave();
    setIsLoading(true);
    setSelectedCell(null);
    setIsPaused(false);

    const todayKey = formatDateKey(new Date());
    const generated = generateDailyPuzzle(date);
    const generatedInitialStr = flatToBoardString(generated.puzzleFlat);
    const generatedSolutionStr = flatToBoardString(generated.solutionFlat);

    // Synchronously isolate & seed state from the target identity's local vault
    // BEFORE awaiting any async cloud fetches so prior-identity state never leaks.
    const localProgress = getDailyProgress(date, uid);
    const localStats = getDailyStats(uid, todayKey);
    const localRecordForDate = localStats.recordsByDate[date];

    if (localProgress && localProgress.status !== "NOT_STARTED") {
      const restoredInitial =
        localProgress.puzzleFlat.length === 81 &&
        localProgress.puzzleFlat.some((v) => v > 0)
          ? flatToBoardString(localProgress.puzzleFlat)
          : generatedInitialStr;
      const restoredBoard =
        localProgress.boardFlat.length === 81
          ? flatToBoardString(localProgress.boardFlat)
          : restoredInitial;

      startedAtRef.current = localProgress.startedAt || Date.now();
      setDifficulty(localProgress.difficulty || generated.difficulty);
      setInitialBoard(restoredInitial);
      setSolution(generatedSolutionStr);
      setBoard(restoredBoard);
      setStatus(localProgress.status);
      setElapsedTime(Math.max(0, localProgress.elapsedSeconds || 0));
      setMistakes(Math.max(0, localProgress.mistakesCount || 0));
      setNotes(cloneNotesMap(localProgress.notesByCell || {}));
    } else if (
      localRecordForDate &&
      (localRecordForDate.status === "COMPLETED" ||
        localRecordForDate.status === "FAILED")
    ) {
      startedAtRef.current = localRecordForDate.completedAt || Date.now();
      setDifficulty(localRecordForDate.difficulty || generated.difficulty);
      setInitialBoard(generatedInitialStr);
      setSolution(generatedSolutionStr);
      setBoard(
        localRecordForDate.status === "COMPLETED"
          ? generatedSolutionStr
          : generatedInitialStr
      );
      setStatus(localRecordForDate.status);
      setElapsedTime(Math.max(0, localRecordForDate.timeSeconds || 0));
      setMistakes(Math.max(0, localRecordForDate.mistakes || 0));
      setNotes({});
    } else {
      startedAtRef.current = Date.now();
      setDifficulty(generated.difficulty);
      setInitialBoard(generatedInitialStr);
      setSolution(generatedSolutionStr);
      setBoard(generatedInitialStr);
      setStatus("NOT_STARTED");
      setElapsedTime(0);
      setMistakes(0);
      setNotes({});
    }
    setStats(localStats);
    setLoadedUid(uid);

    const initialize = async () => {
      let resolvedProgress: DailyChallengeProgress | null = localProgress;

      if (isAuthenticatedUid(uid)) {
        const [cloudProgress, cloudStats] = await Promise.all([
          fetchDailyProgressFromCloud(uid, date),
          fetchDailyStatsFromCloud(uid),
        ]);
        if (cancelled) return;

        resolvedProgress = resolveProgressConflict(localProgress, cloudProgress);

        // Mirror newer cloud progress into local vault
        if (
          resolvedProgress &&
          cloudProgress &&
          resolvedProgress === cloudProgress
        ) {
          saveDailyProgress(resolvedProgress, uid);
        }

        const reconciled = reconcileStatsWithCloud(
          localStats,
          cloudStats,
          uid,
          todayKey
        );
        const cloudRecordForDate = reconciled.recordsByDate[date];

        if (resolvedProgress && resolvedProgress.status !== "NOT_STARTED") {
          const restoredInitial =
            resolvedProgress.puzzleFlat.length === 81 &&
            resolvedProgress.puzzleFlat.some((v) => v > 0)
              ? flatToBoardString(resolvedProgress.puzzleFlat)
              : generatedInitialStr;
          const restoredBoard =
            resolvedProgress.boardFlat.length === 81
              ? flatToBoardString(resolvedProgress.boardFlat)
              : restoredInitial;

          startedAtRef.current = resolvedProgress.startedAt || Date.now();
          setDifficulty(resolvedProgress.difficulty || generated.difficulty);
          setInitialBoard(restoredInitial);
          setSolution(generatedSolutionStr);
          setBoard(restoredBoard);
          setStatus(resolvedProgress.status);
          setElapsedTime(Math.max(0, resolvedProgress.elapsedSeconds || 0));
          setMistakes(Math.max(0, resolvedProgress.mistakesCount || 0));
          setNotes(cloneNotesMap(resolvedProgress.notesByCell || {}));
        } else if (
          cloudRecordForDate &&
          (cloudRecordForDate.status === "COMPLETED" ||
            cloudRecordForDate.status === "FAILED")
        ) {
          startedAtRef.current = cloudRecordForDate.completedAt || Date.now();
          setDifficulty(cloudRecordForDate.difficulty || generated.difficulty);
          setInitialBoard(generatedInitialStr);
          setSolution(generatedSolutionStr);
          setBoard(
            cloudRecordForDate.status === "COMPLETED"
              ? generatedSolutionStr
              : generatedInitialStr
          );
          setStatus(cloudRecordForDate.status);
          setElapsedTime(Math.max(0, cloudRecordForDate.timeSeconds || 0));
          setMistakes(Math.max(0, cloudRecordForDate.mistakes || 0));
          setNotes({});
        } else {
          startedAtRef.current = Date.now();
          setDifficulty(generated.difficulty);
          setInitialBoard(generatedInitialStr);
          setSolution(generatedSolutionStr);
          setBoard(generatedInitialStr);
          setStatus("NOT_STARTED");
          setElapsedTime(0);
          setMistakes(0);
          setNotes({});
        }

        setStats(reconciled);
        setLoadedUid(uid);
      }

      if (!cancelled) {
        setIsLoading(false);
      }
    };

    void initialize();

    return () => {
      cancelled = true;
      clearScheduledCloudSave();
    };
  }, [date, uid, refreshTrigger, clearScheduledCloudSave]);

  // 1-Second Gameplay Timer Ticker (opt-in via enableTimer, and strictly when IN_PROGRESS and not paused)
  useEffect(() => {
    if (!enableTimer || isLoading || status !== "IN_PROGRESS" || isPaused) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setElapsedTime((prev: number) => {
        const next = prev + 1;
        if (next % 5 === 0) {
          const snap = liveSnapshotRef.current;
          if (snap.status === "IN_PROGRESS") {
            saveDailyProgress(
              buildProgressPayload({ elapsedSeconds: next }),
              snap.uid
            );
          }
        }
        return next;
      });
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [enableTimer, isLoading, status, isPaused, buildProgressPayload]);

  // Auto-pause timer & flush progress on document visibility change (opt-in active gameplay instances only)
  useEffect(() => {
    if (!enableTimer || typeof document === "undefined") return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        const snap = liveSnapshotRef.current;
        if (snap.status === "IN_PROGRESS") {
          setIsPaused(true);
          persistProgressNow(undefined, { immediateCloud: true });
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enableTimer, persistProgressNow]);

  const selectCell = useCallback((index: number | null) => {
    if (index === null) {
      setSelectedCell(null);
      return;
    }
    if (Number.isInteger(index) && index >= 0 && index < 81) {
      setSelectedCell(index);
    }
  }, []);

  const setNumber = useCallback(
    (num: number) => {
      if (!Number.isInteger(num) || num < 1 || num > 9) return;
      if (isLoading || isPaused) return;
      if (status === "COMPLETED" || status === "FAILED") return;
      if (selectedCell === null || selectedCell < 0 || selectedCell >= 81) return;

      // Ignore immutable starting clues or cells already solved
      if (initialBoard[selectedCell] !== "0") return;
      if (board[selectedCell] === solution[selectedCell]) return;

      const digitChar = String(num);
      const isFirstAction = status === "NOT_STARTED";
      if (isFirstAction) {
        startedAtRef.current = Date.now();
      }

      if (digitChar === solution[selectedCell]) {
        const nextBoard =
          board.slice(0, selectedCell) + digitChar + board.slice(selectedCell + 1);
        const nextNotes = prunePeerNotes(notes, selectedCell, num);
        const isSolved = nextBoard === solution;

        setBoard(nextBoard);
        setNotes(nextNotes);

        if (isSolved) {
          const completedAt = Date.now();
          setStatus("COMPLETED");
          setIsPaused(false);
          clearScheduledCloudSave();

          const completedProgress = buildProgressPayload({
            status: "COMPLETED",
            boardFlat: boardStringToFlat(nextBoard),
            notesByCell: nextNotes,
            completedAt,
            updatedAt: completedAt,
          });
          saveDailyProgress(completedProgress, uid);

          const todayKey = formatDateKey(new Date());
          const updatedStats = recordDailyCompletion(
            {
              date,
              difficulty,
              timeSeconds: elapsedTime,
              mistakes,
              hints: 0,
              completedAt,
            },
            uid,
            todayKey
          );
          setStats(updatedStats);

          if (isAuthenticatedUid(uid)) {
            const dayRecord = updatedStats.recordsByDate[date] ?? {
              date,
              difficulty,
              status: "COMPLETED" as const,
              timeSeconds: elapsedTime,
              mistakes,
              hints: 0,
              isPerfect: mistakes === 0,
              completedAt,
              updatedAt: completedAt,
            };
            void recordDailyCompletionToCloud(uid, date, dayRecord, updatedStats);
          }
        } else {
          setStatus("IN_PROGRESS");
          persistProgressNow({
            status: "IN_PROGRESS",
            boardFlat: boardStringToFlat(nextBoard),
            notesByCell: nextNotes,
          });
        }
      } else {
        const nextMistakes = mistakes + 1;
        setMistakes(nextMistakes);

        if (nextMistakes >= MAX_MISTAKES) {
          const failedAt = Date.now();
          setStatus("FAILED");
          setIsPaused(false);
          clearScheduledCloudSave();

          const failedProgress = buildProgressPayload({
            status: "FAILED",
            mistakesCount: nextMistakes,
            updatedAt: failedAt,
          });
          saveDailyProgress(failedProgress, uid);

          const todayKey = formatDateKey(new Date());
          const updatedStats = getDailyStats(uid, todayKey);
          setStats(updatedStats);

          if (isAuthenticatedUid(uid)) {
            void saveDailyProgressToCloud(uid, failedProgress);
          }
        } else {
          setStatus("IN_PROGRESS");
          persistProgressNow({
            status: "IN_PROGRESS",
            mistakesCount: nextMistakes,
          });
        }
      }
    },
    [
      isLoading,
      isPaused,
      status,
      selectedCell,
      initialBoard,
      board,
      solution,
      notes,
      clearScheduledCloudSave,
      buildProgressPayload,
      uid,
      date,
      difficulty,
      elapsedTime,
      mistakes,
      persistProgressNow,
    ]
  );

  const toggleNote = useCallback(
    (num: number) => {
      if (!Number.isInteger(num) || num < 1 || num > 9) return;
      if (isLoading || isPaused) return;
      if (status === "COMPLETED" || status === "FAILED") return;
      if (selectedCell === null || selectedCell < 0 || selectedCell >= 81) return;

      // Ignore starting clues or cells with an entered digit
      if (initialBoard[selectedCell] !== "0" || board[selectedCell] !== "0") return;

      if (status === "NOT_STARTED") {
        startedAtRef.current = Date.now();
      }

      const existing: number[] = notes[selectedCell] || [];
      const hasDigit = existing.includes(num);
      const updatedCellNotes = hasDigit
        ? existing.filter((d: number) => d !== num)
        : [...existing, num].sort((a: number, b: number) => a - b);

      const nextNotes = cloneNotesMap(notes);
      if (updatedCellNotes.length > 0) {
        nextNotes[selectedCell] = updatedCellNotes;
      } else {
        delete nextNotes[selectedCell];
      }

      setNotes(nextNotes);
      setStatus("IN_PROGRESS");
      persistProgressNow({
        status: "IN_PROGRESS",
        notesByCell: nextNotes,
      });
    },
    [
      isLoading,
      isPaused,
      status,
      selectedCell,
      initialBoard,
      board,
      notes,
      persistProgressNow,
    ]
  );

  const eraseCell = useCallback(() => {
    if (isLoading || isPaused) return;
    if (status === "COMPLETED" || status === "FAILED") return;
    if (selectedCell === null || selectedCell < 0 || selectedCell >= 81) return;

    // Ignore immutable starting clues
    if (initialBoard[selectedCell] !== "0") return;

    const hasValue = board[selectedCell] !== "0";
    const hasNotes = Boolean(notes[selectedCell]?.length);
    if (!hasValue && !hasNotes) return;

    const nextBoard = hasValue
      ? board.slice(0, selectedCell) + "0" + board.slice(selectedCell + 1)
      : board;

    const nextNotes = cloneNotesMap(notes);
    delete nextNotes[selectedCell];

    const nextStatus: DailyChallengeStatus =
      status === "NOT_STARTED" ? "IN_PROGRESS" : status;

    setBoard(nextBoard);
    setNotes(nextNotes);
    if (nextStatus !== status) {
      setStatus(nextStatus);
    }

    persistProgressNow({
      status: nextStatus,
      boardFlat: boardStringToFlat(nextBoard),
      notesByCell: nextNotes,
    });
  }, [
    isLoading,
    isPaused,
    status,
    selectedCell,
    initialBoard,
    board,
    notes,
    persistProgressNow,
  ]);

  const togglePause = useCallback(() => {
    if (isLoading) return;
    if (status === "COMPLETED" || status === "FAILED") return;

    setIsPaused((prev: boolean) => {
      const nextPaused = !prev;
      if (nextPaused && status === "IN_PROGRESS") {
        persistProgressNow(undefined, { immediateCloud: true });
      }
      return nextPaused;
    });
  }, [isLoading, status, persistProgressNow]);

  // Ensure canonical difficulty fallback stays aligned if date is queried synchronously
  const resolvedDifficulty = difficulty || getDailyDifficultyForDate(date);

  return {
    date,
    setDate,
    loadedUid,
    status,
    board,
    initialBoard,
    solution,
    difficulty: resolvedDifficulty,
    selectedCell,
    notes,
    elapsedTime,
    isPaused,
    mistakes,
    stats,
    isLoading,
    selectCell,
    setNumber,
    toggleNote,
    eraseCell,
    togglePause,
  };
}
