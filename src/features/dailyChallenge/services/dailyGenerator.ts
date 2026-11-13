/**
 * Deterministic Daily Challenge Puzzle Generator (Milestone 1).
 *
 * Strictly isolated pure logic module:
 * - Derives a deterministic 32-bit unsigned seed from a canonical YYYY-MM-DD key.
 * - Maps day-of-week cleanly from Monday (EASY) through Sunday (MASTER).
 * - Generates a uniquely solvable 9x9 Sudoku board using Mulberry32 PRNG and
 *   exact constraint-checking backtracking without mutating or importing core solver files.
 */

import type { DailyDifficulty, GeneratedDailyPuzzle } from "../types/daily.types";
import {
  countSolutionsBitmaskMRV,
  generateHumanGradedBoard,
} from "../../../services/humanDifficultyEngine";

const DATE_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const dailyPuzzleCache = new Map<string, GeneratedDailyPuzzle>();

/**
 * Day-of-week difficulty progression (UTC day index 0 = Sun .. 6 = Sat):
 * Mon -> EASY, Tue -> MEDIUM, Wed -> MEDIUM, Thu -> HARD, Fri -> HARD, Sat -> EXPERT, Sun -> MASTER
 */
const DAY_OF_WEEK_DIFFICULTY: readonly DailyDifficulty[] = [
  "MASTER", // 0: Sunday
  "EASY",   // 1: Monday
  "MEDIUM", // 2: Tuesday
  "MEDIUM", // 3: Wednesday
  "HARD",   // 4: Thursday
  "HARD",   // 5: Friday
  "EXPERT", // 6: Saturday
] as const;

/**
 * Target cell removals out of 81 cells per difficulty tier, aligned with
 * the core engine clue targets (51 / 39 / 30 / 25 / 23 clues).
 */
const TARGET_REMOVALS_BY_DIFFICULTY: Record<DailyDifficulty, number> = {
  EASY: 30,   // 51 clues
  MEDIUM: 42, // 39 clues
  HARD: 51,   // 30 clues
  EXPERT: 56, // 25 clues
  MASTER: 58, // 23 clues (bounded by strict uniqueness guard)
};

/**
 * Formats a Date object into a local calendar YYYY-MM-DD key.
 */
export function formatDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Validates and parses a strict YYYY-MM-DD calendar date key.
 * Throws if format or calendar date (e.g. Feb 30) is invalid.
 */
export function parseDateKey(dateKey: string): { year: number; month: number; day: number } {
  const trimmed = String(dateKey || "").trim();
  const match = DATE_KEY_PATTERN.exec(trimmed);
  if (!match) {
    throw new Error(`Invalid Daily Challenge date format "${dateKey}". Expected YYYY-MM-DD.`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    throw new Error(`Out-of-range calendar values in date "${dateKey}".`);
  }

  const utcDate = new Date(Date.UTC(year, month - 1, day));
  if (
    utcDate.getUTCFullYear() !== year ||
    utcDate.getUTCMonth() !== month - 1 ||
    utcDate.getUTCDate() !== day
  ) {
    throw new Error(`Non-existent calendar date "${dateKey}".`);
  }

  return { year, month, day };
}

/**
 * Maps a YYYY-MM-DD date string to its weekly difficulty tier:
 * Monday (EASY) -> Tuesday/Wednesday (MEDIUM) -> Thursday/Friday (HARD)
 * -> Saturday (EXPERT) -> Sunday (MASTER).
 */
export function getDailyDifficultyForDate(dateKey: string): DailyDifficulty {
  const { year, month, day } = parseDateKey(dateKey);
  const utcDayIndex = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return DAY_OF_WEEK_DIFFICULTY[utcDayIndex];
}

/**
 * Derives a deterministic, non-zero 32-bit unsigned integer seed from a YYYY-MM-DD date string
 * using 32-bit FNV-1a hashing followed by Murmur3 fmix32 avalanche mixing.
 */
export function getSeedForDate(dateKey: string): number {
  parseDateKey(dateKey);
  const input = `SUDOKU_DAILY:${dateKey.trim()}`;

  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }

  // Final avalanche mix so adjacent calendar dates diverge sharply
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x85ebca6b);
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 0xc2b2ae35);
  hash ^= hash >>> 16;

  const unsignedSeed = hash >>> 0;
  return unsignedSeed === 0 ? 1 : unsignedSeed;
}

/**
 * Deterministic Mulberry32 PRNG matching the core engine sequence.
 */
export function createSeededPRNG(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    let t = (state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleDeterministic<T>(items: readonly T[], prng: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(prng() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

/**
 * Checks whether placing `num` (1..9) at `(row, col)` obeys row, column, and 3x3 box constraints.
 */
export function isValidPlacement(grid: number[][], row: number, col: number, num: number): boolean {
  for (let x = 0; x < 9; x++) {
    if (grid[row][x] === num) return false;
    if (grid[x][col] === num) return false;
  }
  const boxRowStart = row - (row % 3);
  const boxColStart = col - (col % 3);
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (grid[boxRowStart + r][boxColStart + c] === num) return false;
    }
  }
  return true;
}

/**
 * Deterministic recursive backtracking solver that fills a 9x9 grid using the supplied PRNG.
 */
function solveSudokuDeterministic(grid: number[][], prng: () => number): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0) {
        const candidates = shuffleDeterministic([1, 2, 3, 4, 5, 6, 7, 8, 9], prng);
        for (const num of candidates) {
          if (isValidPlacement(grid, r, c, num)) {
            grid[r][c] = num;
            if (solveSudokuDeterministic(grid, prng)) {
              return true;
            }
            grid[r][c] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

/**
 * Counts valid solutions up to `limit` (default 2) using Minimum Remaining Values (MRV)
 * bitmask heuristic for rapid uniqueness verification across EXPERT and MASTER boards.
 */
export function countSolutions(grid: number[][], limit = 2): number {
  return countSolutionsBitmaskMRV(grid, limit);
}

/**
 * Returns the nominal target clue count for a DailyDifficulty tier.
 */
export function getTargetClueCount(difficulty: DailyDifficulty): number {
  return 81 - TARGET_REMOVALS_BY_DIFFICULTY[difficulty];
}

/**
 * Generates the deterministic, uniquely solvable Daily Challenge puzzle for a given
 * YYYY-MM-DD date string (defaults to today's local calendar date), graded via the
 * Human-Logic Difficulty & Digit Starvation Engine.
 */
export function generateDailyPuzzle(
  dateKey: string = formatDateKey(),
  difficultyOverride?: DailyDifficulty
): GeneratedDailyPuzzle {
  const normalizedDate = dateKey.trim();
  const difficulty = difficultyOverride ?? getDailyDifficultyForDate(normalizedDate);
  const cacheKey = `${normalizedDate}_${difficulty}`;

  const cached = dailyPuzzleCache.get(cacheKey);
  if (cached) {
    const puzzle = cached.puzzle.map((r) => [...r]);
    const solved = cached.solved.map((r) => [...r]);
    return {
      date: cached.date,
      seed: cached.seed,
      difficulty: cached.difficulty,
      clueCount: cached.clueCount,
      puzzle,
      solved,
      puzzleFlat: [...cached.puzzleFlat],
      solutionFlat: [...cached.solutionFlat],
    };
  }

  const seed = getSeedForDate(normalizedDate);
  const prng = createSeededPRNG(seed);

  const generated = generateHumanGradedBoard(
    difficulty,
    prng,
    solveSudokuDeterministic,
    80
  );

  const result: GeneratedDailyPuzzle = {
    date: normalizedDate,
    seed,
    difficulty,
    clueCount: generated.clueCount,
    puzzle: generated.puzzle,
    solved: generated.solved,
    puzzleFlat: generated.puzzleFlat,
    solutionFlat: generated.solutionFlat,
  };

  if (dailyPuzzleCache.size >= 64) {
    const firstKey = dailyPuzzleCache.keys().next().value;
    if (firstKey) dailyPuzzleCache.delete(firstKey);
  }
  dailyPuzzleCache.set(cacheKey, {
    ...result,
    puzzle: result.puzzle.map((r) => [...r]),
    solved: result.solved.map((r) => [...r]),
    puzzleFlat: [...result.puzzleFlat],
    solutionFlat: [...result.solutionFlat],
  });

  return result;
}

