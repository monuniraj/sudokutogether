/**
 * Isolated Domain Types for the Daily Challenge Feature (Milestone 1).
 * Zero dependencies on core gameplay, multiplayer, or presence modules.
 */

export type DailyDifficulty = "EASY" | "MEDIUM" | "HARD" | "EXPERT" | "MASTER";

export type DailyChallengeStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "FAILED";

export interface DailyChallengeProgress {
  /** Calendar date key in strict YYYY-MM-DD format */
  date: string;
  /** Deterministic PRNG seed derived from the calendar date */
  seed: number;
  /** Difficulty tier assigned to this calendar day */
  difficulty: DailyDifficulty;
  /** Current lifecycle status of this day's challenge */
  status: DailyChallengeStatus;
  /** Current 81-element board array (0 = empty, 1..9 = filled) */
  boardFlat: number[];
  /** Original 81-element puzzle clue mask (0 = editable cell, 1..9 = fixed clue) */
  puzzleFlat: number[];
  /** Pencil marks keyed by flat cell index (0..80) -> sorted candidate digits */
  notesByCell: Record<number, number[]>;
  /** Active play time elapsed in seconds */
  elapsedSeconds: number;
  /** Number of mistakes committed so far */
  mistakesCount: number;
  /** Number of hints used so far */
  hintsCount: number;
  /** Epoch timestamp (ms) when this daily session began */
  startedAt: number;
  /** Epoch timestamp (ms) when progress was last saved */
  updatedAt: number;
  /** Epoch timestamp (ms) when solved (present when status === "COMPLETED") */
  completedAt?: number;
}

export interface DayRecord {
  /** Calendar date key in strict YYYY-MM-DD format */
  date: string;
  /** Difficulty tier assigned to this calendar day */
  difficulty: DailyDifficulty;
  /** Recorded outcome status for this calendar day */
  status: DailyChallengeStatus;
  /** Solve duration in seconds */
  timeSeconds: number;
  /** Total mistakes committed during the recorded run */
  mistakes: number;
  /** Total hints used during the recorded run */
  hints: number;
  /** True when completed with 0 mistakes and 0 hints */
  isPerfect: boolean;
  /** Epoch timestamp (ms) when completed (null if not completed) */
  completedAt: number | null;
  /** Epoch timestamp (ms) of last update */
  updatedAt: number;
}

export interface DailyStats {
  /** Total distinct calendar days completed */
  totalCompleted: number;
  /** Current consecutive daily completion streak */
  currentStreak: number;
  /** Highest consecutive daily completion streak ever achieved */
  longestStreak: number;
  /** Fastest completed daily solve time in seconds (null if none completed) */
  bestTimeSeconds: number | null;
  /** Average completed solve time in seconds (0 if none completed) */
  averageTimeSeconds: number;
  /** Cumulative solve time across all completed daily challenges in seconds */
  totalTimeSeconds: number;
  /** Number of completed days achieved with 0 mistakes and 0 hints */
  perfectDaysCount: number;
  /** Most recent completed calendar date in YYYY-MM-DD format (null if none) */
  lastCompletedDate: string | null;
  /** Personal best solve time (seconds) per DailyDifficulty tier */
  bestTimeByDifficulty: Record<DailyDifficulty, number | null>;
  /** Total completed daily challenges per DailyDifficulty tier */
  completedByDifficulty: Record<DailyDifficulty, number>;
  /** Full map of recorded calendar day outcomes keyed by YYYY-MM-DD */
  recordsByDate: Record<string, DayRecord>;
}

export interface GeneratedDailyPuzzle {
  /** Calendar date key in strict YYYY-MM-DD format */
  date: string;
  /** Deterministic PRNG seed derived from the date */
  seed: number;
  /** Difficulty tier mapped from the day of the week */
  difficulty: DailyDifficulty;
  /** Number of pre-filled given clues on the generated board */
  clueCount: number;
  /** 9x9 puzzle grid (0 = empty, 1..9 = given clue) */
  puzzle: number[][];
  /** 9x9 complete valid solution grid */
  solved: number[][];
  /** 81-element row-major puzzle array */
  puzzleFlat: number[];
  /** 81-element row-major solution array */
  solutionFlat: number[];
}

export interface RecordDailyCompletionInput {
  /** Calendar date key in strict YYYY-MM-DD format */
  date: string;
  /** Difficulty tier for the completed daily puzzle */
  difficulty: DailyDifficulty;
  /** Final solve duration in seconds */
  timeSeconds: number;
  /** Mistakes committed during the solve */
  mistakes: number;
  /** Hints used during the solve */
  hints: number;
  /** Optional completion timestamp in epoch ms (defaults to Date.now()) */
  completedAt?: number;
}

