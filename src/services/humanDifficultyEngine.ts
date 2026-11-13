/**
 * Human-Logic Sudoku Difficulty Grader, Bottleneck Evaluator & Candidate Distribution Engine.
 *
 * Pure, zero-dependency deterministic engine providing:
 * 1. Strict State-Machine Bitmask Human-Logic Pattern Checkers:
 *    - Cognitive Single Sub-Tiers: Box Hidden Singles (SE 1.2), Line Hidden Singles (SE 1.5), Naked Singles (SE 2.3)
 *    - Pointing Pairs / Triples & Box-Line Reduction / Claiming (SE 2.6-2.8)
 *    - Naked Pairs & Hidden Pairs (SE 3.0-3.4)
 *    - Naked Triples & Hidden Triples (SE 3.6-3.8)
 *    - X-Wing (Row & Column locked rectangles, SE 3.2)
 *    - Skyscraper (Single-digit Turbot Fish across rows/columns, SE 4.0)
 *    - 2-String Kite (Row + Column bi-local link via shared 3x3 box, SE 4.1)
 *    - Y-Wing / XY-Wing (Bi-value pivot + pincer eliminations, SE 4.2)
 * 2. Digit Starvation & 3x3 Box Distribution Rules:
 *    - EASY / MEDIUM: Balanced 3x3 box clue counts, balanced digit frequencies, clean Single-Only solvability.
 *    - HARD / EXPERT (and MASTER): High-frequency digit caps (no 6-8 clue giveaway digits) and intentional
 *      single-digit scarcity (starved digits with 0-2 clues).
 * 3. Active Anti-Single Guided Digging, 2-Opt Bottleneck Swap & Multi-Candidate Seeded Selection:
 *    - Strictly invokes advanced techniques ONLY when `availCount === 0` (zero opportunistic inflation).
 *    - Actively suppresses chute cross-hatches and opening Box Hidden Singles via 2-Opt Clue Swaps.
 *    - Evaluates multiple deterministic candidate boards per Mulberry32 seed within a strict 80ms CPU budget.
 */

export type EngineDifficulty = "EASY" | "MEDIUM" | "HARD" | "EXPERT" | "MASTER";

export interface TechniqueUsageCounts {
  nakedSingles: number;
  hiddenSingles: number;
  boxHiddenSingles: number;
  lineHiddenSingles: number;
  pointingPairs: number;
  nakedPairs: number;
  hiddenPairs: number;
  nakedTriples: number;
  hiddenTriples: number;
  xWings: number;
  skyscrapers: number;
  twoStringKites: number;
  yWings: number;
  guesses: number;
}

export interface DigitDistributionMetrics {
  digitCounts: number[]; // Length 10 (indices 1..9 used)
  boxClueCounts: number[]; // Length 9 (boxes 0..8)
  rowClueCounts: number[]; // Length 9 (rows 0..8)
  colClueCounts: number[]; // Length 9 (cols 0..8)
  totalClues: number;
  minDigitCount: number;
  maxDigitCount: number;
  starvedDigitCount: number; // Digits with <= 1 clue
  lowFrequencyDigitCount: number; // Digits with <= 2 clues
  highFrequencyDigitCount: number; // Digits with >= 6 clues
  minBoxClues: number;
  maxBoxClues: number;
  boxSpread: number;
  passesStarvationRules: boolean;
}

export interface BottleneckMetrics {
  initialSingles: number;
  initialBoxHiddenSingles: number;
  minSinglesInFirst10Steps: number;
  zeroSingleBottlenecks: number;
  lowSingleBottlenecks: number;
  peakTechniqueWeight: number;
}

export interface HumanDifficultyReport {
  solvedByLogic: boolean;
  requiresGuessing: boolean;
  classifiedTier: "EASY" | "MEDIUM" | "HARD" | "EXPERT";
  logicScore: number;
  compositeFitnessScore: number;
  techniques: TechniqueUsageCounts;
  distribution: DigitDistributionMetrics;
  bottlenecks: BottleneckMetrics;
}

export interface GeneratedCandidateResult {
  puzzle: number[][];
  solved: number[][];
  puzzleFlat: number[];
  solutionFlat: number[];
  clueCount: number;
  candidatesEvaluated: number;
  elapsedMs: number;
  report: HumanDifficultyReport;
}

const ALL_DIGITS_MASK = 0b1111111110; // Bits 1..9

// ─────────────────────────────────────────────────────────────────────────────
// Precomputed Unit & Peer Lookup Tables (Initialized Once)
// ─────────────────────────────────────────────────────────────────────────────

const CELL_ROW = new Int32Array(81);
const CELL_COL = new Int32Array(81);
const CELL_BOX = new Int32Array(81);

const ROW_CELLS: number[][] = Array.from({ length: 9 }, () => []);
const COL_CELLS: number[][] = Array.from({ length: 9 }, () => []);
const BOX_CELLS: number[][] = Array.from({ length: 9 }, () => []);
const ALL_UNITS: number[][] = [];
const CELL_PEERS: number[][] = Array.from({ length: 81 }, () => []);

for (let idx = 0; idx < 81; idx++) {
  const r = Math.floor(idx / 9);
  const c = idx % 9;
  const b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
  CELL_ROW[idx] = r;
  CELL_COL[idx] = c;
  CELL_BOX[idx] = b;
  ROW_CELLS[r].push(idx);
  COL_CELLS[c].push(idx);
  BOX_CELLS[b].push(idx);
}

for (let i = 0; i < 9; i++) ALL_UNITS.push(ROW_CELLS[i]);
for (let i = 0; i < 9; i++) ALL_UNITS.push(COL_CELLS[i]);
for (let i = 0; i < 9; i++) ALL_UNITS.push(BOX_CELLS[i]);

for (let idx = 0; idx < 81; idx++) {
  const peerSet = new Set<number>();
  const r = CELL_ROW[idx];
  const c = CELL_COL[idx];
  const b = CELL_BOX[idx];
  for (const p of ROW_CELLS[r]) if (p !== idx) peerSet.add(p);
  for (const p of COL_CELLS[c]) if (p !== idx) peerSet.add(p);
  for (const p of BOX_CELLS[b]) if (p !== idx) peerSet.add(p);
  CELL_PEERS[idx] = Array.from(peerSet);
}

function arePeers(idx1: number, idx2: number): boolean {
  if (idx1 === idx2) return false;
  return (
    CELL_ROW[idx1] === CELL_ROW[idx2] ||
    CELL_COL[idx1] === CELL_COL[idx2] ||
    CELL_BOX[idx1] === CELL_BOX[idx2]
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Bitwise Helpers
// ─────────────────────────────────────────────────────────────────────────────

export function countBits(mask: number): number {
  let c = 0;
  let m = mask;
  while (m !== 0) {
    m &= m - 1;
    c++;
  }
  return c;
}

function lowestDigit(mask: number): number {
  for (let d = 1; d <= 9; d++) {
    if ((mask & (1 << d)) !== 0) return d;
  }
  return 0;
}

function extractTwoDigits(mask: number): [number, number] {
  let first = 0;
  for (let d = 1; d <= 9; d++) {
    if ((mask & (1 << d)) !== 0) {
      if (first === 0) first = d;
      else return [first, d];
    }
  }
  return [0, 0];
}

function extractTwoPositions(posMask: number): [number, number] {
  let first = -1;
  for (let i = 0; i < 9; i++) {
    if ((posMask & (1 << i)) !== 0) {
      if (first === -1) first = i;
      else return [first, i];
    }
  }
  return [-1, -1];
}

// ─────────────────────────────────────────────────────────────────────────────
// Fast Bitmask MRV Uniqueness Engine
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Counts valid solutions up to `limit` (default 2) using zero-allocation Int32Array
 * row/col/box bitmasks and Minimum Remaining Values (MRV) cell selection.
 */
export function countSolutionsBitmaskMRV(grid: number[][], limit = 2): number {
  const values = new Int32Array(81);
  const rowMask = new Int32Array(9);
  const colMask = new Int32Array(9);
  const boxMask = new Int32Array(9);

  for (let r = 0; r < 9; r++) {
    const row = grid[r];
    for (let c = 0; c < 9; c++) {
      const val = row[c];
      const idx = r * 9 + c;
      values[idx] = val;
      if (val !== 0) {
        const bit = 1 << val;
        const b = CELL_BOX[idx];
        if ((rowMask[r] & bit) !== 0 || (colMask[c] & bit) !== 0 || (boxMask[b] & bit) !== 0) {
          return 0;
        }
        rowMask[r] |= bit;
        colMask[c] |= bit;
        boxMask[b] |= bit;
      }
    }
  }

  let solutions = 0;

  const search = (): void => {
    if (solutions >= limit) return;

    let bestIdx = -1;
    let bestCandMask = 0;
    let bestCandCount = 10;

    for (let idx = 0; idx < 81; idx++) {
      if (values[idx] !== 0) continue;
      const r = CELL_ROW[idx];
      const c = CELL_COL[idx];
      const b = CELL_BOX[idx];
      const candMask = ALL_DIGITS_MASK & ~(rowMask[r] | colMask[c] | boxMask[b]);
      if (candMask === 0) return; // Dead end

      const cnt = countBits(candMask);
      if (cnt < bestCandCount) {
        bestCandCount = cnt;
        bestIdx = idx;
        bestCandMask = candMask;
        if (cnt === 1) break;
      }
    }

    if (bestIdx === -1) {
      solutions++;
      return;
    }

    const br = CELL_ROW[bestIdx];
    const bc = CELL_COL[bestIdx];
    const bb = CELL_BOX[bestIdx];

    let mask = bestCandMask;
    while (mask !== 0) {
      const lowBit = mask & -mask;
      mask &= mask - 1;

      values[bestIdx] = 1; // Non-zero marker
      rowMask[br] |= lowBit;
      colMask[bc] |= lowBit;
      boxMask[bb] |= lowBit;

      search();

      boxMask[bb] &= ~lowBit;
      colMask[bc] &= ~lowBit;
      rowMask[br] &= ~lowBit;
      values[bestIdx] = 0;

      if (solutions >= limit) return;
    }
  };

  search();
  return solutions;
}

export function hasUniqueSolutionFast(grid: number[][]): boolean {
  return countSolutionsBitmaskMRV(grid, 2) === 1;
}

// ─────────────────────────────────────────────────────────────────────────────
// Candidate Initialization & Placement Helpers
// ─────────────────────────────────────────────────────────────────────────────

export function initCandidatesFromGrid(grid: number[][]): {
  values: Int32Array;
  cands: Int32Array;
  emptyCount: number;
} {
  const values = new Int32Array(81);
  const cands = new Int32Array(81);
  const rowMask = new Int32Array(9);
  const colMask = new Int32Array(9);
  const boxMask = new Int32Array(9);
  let emptyCount = 0;

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const idx = r * 9 + c;
      const val = grid[r][c];
      values[idx] = val;
      if (val !== 0) {
        const bit = 1 << val;
        rowMask[r] |= bit;
        colMask[c] |= bit;
        boxMask[CELL_BOX[idx]] |= bit;
      } else {
        emptyCount++;
      }
    }
  }

  for (let idx = 0; idx < 81; idx++) {
    if (values[idx] === 0) {
      const r = CELL_ROW[idx];
      const c = CELL_COL[idx];
      const b = CELL_BOX[idx];
      cands[idx] = ALL_DIGITS_MASK & ~(rowMask[r] | colMask[c] | boxMask[b]);
    }
  }

  return { values, cands, emptyCount };
}

function placeDigitInState(
  values: Int32Array,
  cands: Int32Array,
  idx: number,
  digit: number
): void {
  values[idx] = digit;
  cands[idx] = 0;
  const bit = 1 << digit;
  const peers = CELL_PEERS[idx];
  for (let i = 0; i < peers.length; i++) {
    cands[peers[i]] &= ~bit;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Human-Logic Pattern Checkers (Strict Cognitive Hierarchy)
// ─────────────────────────────────────────────────────────────────────────────

export interface SinglePlacement {
  idx: number;
  digit: number;
  kind: "boxHidden" | "lineHidden" | "naked";
}

/**
 * Scans current candidate masks for all immediately playable Singles, ordered by
 * cognitive visual ease:
 * 1. Box Hidden Singles (SE 1.2 - 3x3 chute cross-hatching, easiest for humans)
 * 2. Line Hidden Singles (SE 1.5 - full 9-cell row/column scan)
 * 3. Naked Singles (SE 2.3 - 8-peer intersection across row + col + box)
 */
export function findSingles(
  values: Int32Array,
  cands: Int32Array
): {
  placements: SinglePlacement[];
  boxHiddenCount: number;
  lineHiddenCount: number;
  hiddenCount: number;
  nakedCount: number;
} {
  const placementsMap = new Map<number, SinglePlacement>();
  let boxHiddenCount = 0;
  let lineHiddenCount = 0;
  let nakedCount = 0;

  // 1. Box Hidden Singles (Units 18..26 are the 9 3x3 boxes)
  for (let b = 0; b < 9; b++) {
    const unit = BOX_CELLS[b];
    let seenOnce = 0;
    let seenMultiple = 0;
    for (let i = 0; i < 9; i++) {
      const m = cands[unit[i]];
      seenMultiple |= seenOnce & m;
      seenOnce |= m;
    }
    const singleDigitsMask = seenOnce & ~seenMultiple;
    if (singleDigitsMask === 0) continue;

    for (let d = 1; d <= 9; d++) {
      const bit = 1 << d;
      if ((singleDigitsMask & bit) === 0) continue;
      for (let i = 0; i < 9; i++) {
        const cellIdx = unit[i];
        if ((cands[cellIdx] & bit) !== 0) {
          if (!placementsMap.has(cellIdx)) {
            placementsMap.set(cellIdx, { idx: cellIdx, digit: d, kind: "boxHidden" });
            boxHiddenCount++;
          }
          break;
        }
      }
    }
  }

  // 2. Line (Row & Column) Hidden Singles (Units 0..17)
  for (let u = 0; u < 18; u++) {
    const unit = ALL_UNITS[u];
    let seenOnce = 0;
    let seenMultiple = 0;
    for (let i = 0; i < 9; i++) {
      const m = cands[unit[i]];
      seenMultiple |= seenOnce & m;
      seenOnce |= m;
    }
    const singleDigitsMask = seenOnce & ~seenMultiple;
    if (singleDigitsMask === 0) continue;

    for (let d = 1; d <= 9; d++) {
      const bit = 1 << d;
      if ((singleDigitsMask & bit) === 0) continue;
      for (let i = 0; i < 9; i++) {
        const cellIdx = unit[i];
        if ((cands[cellIdx] & bit) !== 0) {
          if (!placementsMap.has(cellIdx)) {
            placementsMap.set(cellIdx, { idx: cellIdx, digit: d, kind: "lineHidden" });
            lineHiddenCount++;
          }
          break;
        }
      }
    }
  }

  // 3. Pure Naked Singles (cells with 1 candidate bit not already a Hidden Single)
  for (let idx = 0; idx < 81; idx++) {
    if (values[idx] !== 0) continue;
    const mask = cands[idx];
    if (mask !== 0 && (mask & (mask - 1)) === 0) {
      const digit = lowestDigit(mask);
      if (digit > 0 && !placementsMap.has(idx)) {
        placementsMap.set(idx, { idx, digit, kind: "naked" });
        nakedCount++;
      }
    }
  }

  return {
    placements: Array.from(placementsMap.values()),
    boxHiddenCount,
    lineHiddenCount,
    hiddenCount: boxHiddenCount + lineHiddenCount,
    nakedCount,
  };
}

/**
 * Pattern Checker: Pointing Pairs/Triples (Box -> Row/Col) & Box-Line Reduction / Claiming (Row/Col -> Box).
 * Returns the number of distinct pattern deductions that eliminated at least one candidate.
 */
export function applyPointingAndBoxLine(cands: Int32Array): number {
  let deductions = 0;

  // A. Pointing Pairs / Triples: Box candidates confined to a single Row or Column
  for (let b = 0; b < 9; b++) {
    const boxCells = BOX_CELLS[b];
    for (let d = 1; d <= 9; d++) {
      const bit = 1 << d;
      let rowFlags = 0;
      let colFlags = 0;
      let count = 0;

      for (let i = 0; i < 9; i++) {
        const idx = boxCells[i];
        if ((cands[idx] & bit) !== 0) {
          rowFlags |= 1 << CELL_ROW[idx];
          colFlags |= 1 << CELL_COL[idx];
          count++;
        }
      }

      if (count < 2) continue;

      if ((rowFlags & (rowFlags - 1)) === 0) {
        let targetRow = 0;
        while (((rowFlags >> targetRow) & 1) === 0) targetRow++;
        const rowCells = ROW_CELLS[targetRow];
        let changed = false;
        for (let i = 0; i < 9; i++) {
          const idx = rowCells[i];
          if (CELL_BOX[idx] !== b && (cands[idx] & bit) !== 0) {
            cands[idx] &= ~bit;
            changed = true;
          }
        }
        if (changed) deductions++;
      }

      if ((colFlags & (colFlags - 1)) === 0) {
        let targetCol = 0;
        while (((colFlags >> targetCol) & 1) === 0) targetCol++;
        const colCells = COL_CELLS[targetCol];
        let changed = false;
        for (let i = 0; i < 9; i++) {
          const idx = colCells[i];
          if (CELL_BOX[idx] !== b && (cands[idx] & bit) !== 0) {
            cands[idx] &= ~bit;
            changed = true;
          }
        }
        if (changed) deductions++;
      }
    }
  }

  // B. Box-Line Reduction (Claiming): Row or Column candidates confined to a single 3x3 Box
  for (let lineIdx = 0; lineIdx < 18; lineIdx++) {
    const lineCells = ALL_UNITS[lineIdx]; // 0..8 rows, 9..17 cols
    const isRow = lineIdx < 9;
    const fixedCoord = isRow ? lineIdx : lineIdx - 9;

    for (let d = 1; d <= 9; d++) {
      const bit = 1 << d;
      let boxFlags = 0;
      let count = 0;

      for (let i = 0; i < 9; i++) {
        const idx = lineCells[i];
        if ((cands[idx] & bit) !== 0) {
          boxFlags |= 1 << CELL_BOX[idx];
          count++;
        }
      }

      if (count >= 2 && (boxFlags & (boxFlags - 1)) === 0) {
        let targetBox = 0;
        while (((boxFlags >> targetBox) & 1) === 0) targetBox++;
        const boxCells = BOX_CELLS[targetBox];
        let changed = false;
        for (let i = 0; i < 9; i++) {
          const idx = boxCells[i];
          const coord = isRow ? CELL_ROW[idx] : CELL_COL[idx];
          if (coord !== fixedCoord && (cands[idx] & bit) !== 0) {
            cands[idx] &= ~bit;
            changed = true;
          }
        }
        if (changed) deductions++;
      }
    }
  }

  return deductions;
}

/**
 * Pattern Checker: Naked Pairs & Hidden Pairs across all 27 units.
 */
export function applyNakedAndHiddenPairs(cands: Int32Array): {
  nakedPairs: number;
  hiddenPairs: number;
} {
  let nakedPairs = 0;
  let hiddenPairs = 0;
  const posMaskByDigit = new Int32Array(10);

  for (let u = 0; u < 27; u++) {
    const unit = ALL_UNITS[u];

    // 1. Naked Pairs
    for (let i = 0; i < 8; i++) {
      const m1 = cands[unit[i]];
      if (countBits(m1) !== 2) continue;
      for (let j = i + 1; j < 9; j++) {
        if (cands[unit[j]] !== m1) continue;
        let changed = false;
        for (let k = 0; k < 9; k++) {
          if (k === i || k === j) continue;
          const otherIdx = unit[k];
          if ((cands[otherIdx] & m1) !== 0) {
            cands[otherIdx] &= ~m1;
            changed = true;
          }
        }
        if (changed) nakedPairs++;
      }
    }

    // 2. Hidden Pairs
    posMaskByDigit.fill(0);
    for (let pos = 0; pos < 9; pos++) {
      const m = cands[unit[pos]];
      if (m === 0) continue;
      for (let d = 1; d <= 9; d++) {
        if ((m & (1 << d)) !== 0) {
          posMaskByDigit[d] |= 1 << pos;
        }
      }
    }

    for (let d1 = 1; d1 <= 8; d1++) {
      const pMask = posMaskByDigit[d1];
      if (countBits(pMask) !== 2) continue;
      for (let d2 = d1 + 1; d2 <= 9; d2++) {
        if (posMaskByDigit[d2] !== pMask) continue;
        const pairBits = (1 << d1) | (1 << d2);
        const [p1, p2] = extractTwoPositions(pMask);
        if (p1 === -1 || p2 === -1) continue;
        let changed = false;
        const idx1 = unit[p1];
        const idx2 = unit[p2];
        if ((cands[idx1] & ~pairBits) !== 0) {
          cands[idx1] &= pairBits;
          changed = true;
        }
        if ((cands[idx2] & ~pairBits) !== 0) {
          cands[idx2] &= pairBits;
          changed = true;
        }
        if (changed) hiddenPairs++;
      }
    }
  }

  return { nakedPairs, hiddenPairs };
}

/**
 * Pattern Checker: Naked Triples & Hidden Triples across all 27 units.
 */
export function applyNakedAndHiddenTriples(cands: Int32Array): {
  nakedTriples: number;
  hiddenTriples: number;
} {
  let nakedTriples = 0;
  let hiddenTriples = 0;
  const posMaskByDigit = new Int32Array(10);

  for (let u = 0; u < 27; u++) {
    const unit = ALL_UNITS[u];

    // 1. Naked Triples
    for (let i = 0; i < 7; i++) {
      const m1 = cands[unit[i]];
      const c1 = countBits(m1);
      if (c1 < 2 || c1 > 3) continue;
      for (let j = i + 1; j < 8; j++) {
        const m2 = cands[unit[j]];
        const c2 = countBits(m2);
        if (c2 < 2 || c2 > 3) continue;
        const m12 = m1 | m2;
        if (countBits(m12) > 3) continue;
        for (let k = j + 1; k < 9; k++) {
          const m3 = cands[unit[k]];
          const c3 = countBits(m3);
          if (c3 < 2 || c3 > 3) continue;
          const unionMask = m12 | m3;
          if (countBits(unionMask) !== 3) continue;

          let changed = false;
          for (let x = 0; x < 9; x++) {
            if (x === i || x === j || x === k) continue;
            const otherIdx = unit[x];
            if ((cands[otherIdx] & unionMask) !== 0) {
              cands[otherIdx] &= ~unionMask;
              changed = true;
            }
          }
          if (changed) nakedTriples++;
        }
      }
    }

    // 2. Hidden Triples
    posMaskByDigit.fill(0);
    for (let pos = 0; pos < 9; pos++) {
      const m = cands[unit[pos]];
      if (m === 0) continue;
      for (let d = 1; d <= 9; d++) {
        if ((m & (1 << d)) !== 0) {
          posMaskByDigit[d] |= 1 << pos;
        }
      }
    }

    for (let d1 = 1; d1 <= 7; d1++) {
      const p1 = posMaskByDigit[d1];
      const cnt1 = countBits(p1);
      if (cnt1 < 2 || cnt1 > 3) continue;
      for (let d2 = d1 + 1; d2 <= 8; d2++) {
        const p2 = posMaskByDigit[d2];
        const cnt2 = countBits(p2);
        if (cnt2 < 2 || cnt2 > 3) continue;
        const p12 = p1 | p2;
        if (countBits(p12) > 3) continue;
        for (let d3 = d2 + 1; d3 <= 9; d3++) {
          const p3 = posMaskByDigit[d3];
          const cnt3 = countBits(p3);
          if (cnt3 < 2 || cnt3 > 3) continue;
          const unionPos = p12 | p3;
          if (countBits(unionPos) !== 3) continue;

          const tripleDigitsMask = (1 << d1) | (1 << d2) | (1 << d3);
          let changed = false;
          for (let pos = 0; pos < 9; pos++) {
            if ((unionPos & (1 << pos)) !== 0) {
              const cellIdx = unit[pos];
              if ((cands[cellIdx] & ~tripleDigitsMask) !== 0) {
                cands[cellIdx] &= tripleDigitsMask;
                changed = true;
              }
            }
          }
          if (changed) hiddenTriples++;
        }
      }
    }
  }

  return { nakedTriples, hiddenTriples };
}

/**
 * Pattern Checker: X-Wing (Row-based and Column-based 2x2 locked candidate rectangles, SE 3.2).
 */
export function applyXWings(cands: Int32Array): number {
  let xWings = 0;
  const rowColMask = new Int32Array(9);
  const colRowMask = new Int32Array(9);

  for (let d = 1; d <= 9; d++) {
    const bit = 1 << d;

    // 1. Row-based X-Wing
    for (let r = 0; r < 9; r++) {
      let mask = 0;
      for (let c = 0; c < 9; c++) {
        if ((cands[r * 9 + c] & bit) !== 0) {
          mask |= 1 << c;
        }
      }
      rowColMask[r] = mask;
    }

    for (let r1 = 0; r1 < 8; r1++) {
      const m1 = rowColMask[r1];
      if (countBits(m1) !== 2) continue;
      for (let r2 = r1 + 1; r2 < 9; r2++) {
        if (rowColMask[r2] !== m1) continue;
        const [c1, c2] = extractTwoPositions(m1);
        if (c1 === -1 || c2 === -1) continue;
        let changed = false;
        for (let r = 0; r < 9; r++) {
          if (r === r1 || r === r2) continue;
          const idx1 = r * 9 + c1;
          const idx2 = r * 9 + c2;
          if ((cands[idx1] & bit) !== 0) {
            cands[idx1] &= ~bit;
            changed = true;
          }
          if ((cands[idx2] & bit) !== 0) {
            cands[idx2] &= ~bit;
            changed = true;
          }
        }
        if (changed) xWings++;
      }
    }

    // 2. Column-based X-Wing
    for (let c = 0; c < 9; c++) {
      let mask = 0;
      for (let r = 0; r < 9; r++) {
        if ((cands[r * 9 + c] & bit) !== 0) {
          mask |= 1 << r;
        }
      }
      colRowMask[c] = mask;
    }

    for (let c1 = 0; c1 < 8; c1++) {
      const m1 = colRowMask[c1];
      if (countBits(m1) !== 2) continue;
      for (let c2 = c1 + 1; c2 < 9; c2++) {
        if (colRowMask[c2] !== m1) continue;
        const [r1, r2] = extractTwoPositions(m1);
        if (r1 === -1 || r2 === -1) continue;
        let changed = false;
        for (let c = 0; c < 9; c++) {
          if (c === c1 || c === c2) continue;
          const idx1 = r1 * 9 + c;
          const idx2 = r2 * 9 + c;
          if ((cands[idx1] & bit) !== 0) {
            cands[idx1] &= ~bit;
            changed = true;
          }
          if ((cands[idx2] & bit) !== 0) {
            cands[idx2] &= ~bit;
            changed = true;
          }
        }
        if (changed) xWings++;
      }
    }
  }

  return xWings;
}

/**
 * Pattern Checker: Skyscraper (Single-Digit Turbot Fish across two conjugate rows or columns
 * sharing one base cross-line, eliminating from common peers of the two roof cells, SE 4.0).
 */
export function applySkyscrapers(cands: Int32Array): number {
  let skyscrapers = 0;
  const rowColMask = new Int32Array(9);
  const colRowMask = new Int32Array(9);

  for (let d = 1; d <= 9; d++) {
    const bit = 1 << d;

    // 1. Row-based Skyscraper
    for (let r = 0; r < 9; r++) {
      let mask = 0;
      for (let c = 0; c < 9; c++) {
        if ((cands[r * 9 + c] & bit) !== 0) mask |= 1 << c;
      }
      rowColMask[r] = mask;
    }

    for (let r1 = 0; r1 < 8; r1++) {
      const m1 = rowColMask[r1];
      if (countBits(m1) !== 2) continue;
      for (let r2 = r1 + 1; r2 < 9; r2++) {
        const m2 = rowColMask[r2];
        if (countBits(m2) !== 2 || m1 === m2) continue;
        const sharedColMask = m1 & m2;
        if (countBits(sharedColMask) !== 1) continue;

        let cRoof1 = 0;
        const roof1Mask = m1 & ~sharedColMask;
        while (((roof1Mask >> cRoof1) & 1) === 0) cRoof1++;

        let cRoof2 = 0;
        const roof2Mask = m2 & ~sharedColMask;
        while (((roof2Mask >> cRoof2) & 1) === 0) cRoof2++;

        const roofIdx1 = r1 * 9 + cRoof1;
        const roofIdx2 = r2 * 9 + cRoof2;

        let changed = false;
        const peers1 = CELL_PEERS[roofIdx1];
        for (let i = 0; i < peers1.length; i++) {
          const z = peers1[i];
          if (z === roofIdx2 || (cands[z] & bit) === 0) continue;
          if (arePeers(z, roofIdx2)) {
            cands[z] &= ~bit;
            changed = true;
          }
        }
        if (changed) skyscrapers++;
      }
    }

    // 2. Column-based Skyscraper
    for (let c = 0; c < 9; c++) {
      let mask = 0;
      for (let r = 0; r < 9; r++) {
        if ((cands[r * 9 + c] & bit) !== 0) mask |= 1 << r;
      }
      colRowMask[c] = mask;
    }

    for (let c1 = 0; c1 < 8; c1++) {
      const m1 = colRowMask[c1];
      if (countBits(m1) !== 2) continue;
      for (let c2 = c1 + 1; c2 < 9; c2++) {
        const m2 = colRowMask[c2];
        if (countBits(m2) !== 2 || m1 === m2) continue;
        const sharedRowMask = m1 & m2;
        if (countBits(sharedRowMask) !== 1) continue;

        let rRoof1 = 0;
        const roof1Mask = m1 & ~sharedRowMask;
        while (((roof1Mask >> rRoof1) & 1) === 0) rRoof1++;

        let rRoof2 = 0;
        const roof2Mask = m2 & ~sharedRowMask;
        while (((roof2Mask >> rRoof2) & 1) === 0) rRoof2++;

        const roofIdx1 = rRoof1 * 9 + c1;
        const roofIdx2 = rRoof2 * 9 + c2;

        let changed = false;
        const peers1 = CELL_PEERS[roofIdx1];
        for (let i = 0; i < peers1.length; i++) {
          const z = peers1[i];
          if (z === roofIdx2 || (cands[z] & bit) === 0) continue;
          if (arePeers(z, roofIdx2)) {
            cands[z] &= ~bit;
            changed = true;
          }
        }
        if (changed) skyscrapers++;
      }
    }
  }

  return skyscrapers;
}

/**
 * Pattern Checker: 2-String Kite (Single-Digit Turbot Fish linking a conjugate row and
 * a conjugate column via a shared 3x3 box, eliminating at the cross-intersection of the free ends, SE 4.1).
 */
export function applyTwoStringKites(cands: Int32Array): number {
  let kites = 0;
  const rowColMask = new Int32Array(9);
  const colRowMask = new Int32Array(9);

  for (let d = 1; d <= 9; d++) {
    const bit = 1 << d;

    for (let r = 0; r < 9; r++) {
      let mask = 0;
      for (let c = 0; c < 9; c++) {
        if ((cands[r * 9 + c] & bit) !== 0) mask |= 1 << c;
      }
      rowColMask[r] = mask;
    }

    for (let c = 0; c < 9; c++) {
      let mask = 0;
      for (let r = 0; r < 9; r++) {
        if ((cands[r * 9 + c] & bit) !== 0) mask |= 1 << r;
      }
      colRowMask[c] = mask;
    }

    for (let r = 0; r < 9; r++) {
      if (countBits(rowColMask[r]) !== 2) continue;
      const [cA, cB] = extractTwoPositions(rowColMask[r]);
      if (cA === -1 || cB === -1) continue;
      const rEndA = r * 9 + cA;
      const rEndB = r * 9 + cB;

      for (let c = 0; c < 9; c++) {
        if (countBits(colRowMask[c]) !== 2) continue;
        const [rA, rB] = extractTwoPositions(colRowMask[c]);
        if (rA === -1 || rB === -1) continue;
        const cEndA = rA * 9 + c;
        const cEndB = rB * 9 + c;

        // Test all 4 combinations of (box-connected row end, box-connected col end)
        const combos: Array<[number, number, number, number]> = [
          [rEndA, cB, cEndA, rB],
          [rEndA, cB, cEndB, rA],
          [rEndB, cA, cEndA, rB],
          [rEndB, cA, cEndB, rA],
        ];

        for (let k = 0; k < 4; k++) {
          const [boxNodeR, freeCol, boxNodeC, freeRow] = combos[k];
          if (boxNodeR === boxNodeC) continue;
          if (CELL_BOX[boxNodeR] !== CELL_BOX[boxNodeC]) continue;
          if (freeRow === r || freeCol === c) continue;

          const targetIdx = freeRow * 9 + freeCol;
          if ((cands[targetIdx] & bit) !== 0) {
            cands[targetIdx] &= ~bit;
            kites++;
          }
        }
      }
    }
  }

  return kites;
}

/**
 * Pattern Checker: Y-Wing / XY-Wing (Bi-value pivot {A,B} seeing pincers {A,C} and {B,C}, SE 4.2).
 */
export function applyYWings(cands: Int32Array): number {
  let yWings = 0;

  for (let pivot = 0; pivot < 81; pivot++) {
    const pivotMask = cands[pivot];
    if (countBits(pivotMask) !== 2) continue;

    const [dA, dB] = extractTwoDigits(pivotMask);
    const bitA = 1 << dA;
    const bitB = 1 << dB;
    const peers = CELL_PEERS[pivot];

    for (let i = 0; i < peers.length; i++) {
      const w1 = peers[i];
      const m1 = cands[w1];
      if (countBits(m1) !== 2) continue;
      if ((m1 & bitA) === 0 || (m1 & bitB) !== 0) continue;
      const bitC = m1 & ~bitA;

      for (let j = 0; j < peers.length; j++) {
        const w2 = peers[j];
        if (w2 === w1) continue;
        const m2 = cands[w2];
        if (m2 !== (bitB | bitC)) continue;

        let changed = false;
        const w1Peers = CELL_PEERS[w1];
        for (let k = 0; k < w1Peers.length; k++) {
          const z = w1Peers[k];
          if (z === pivot || z === w2) continue;
          if ((cands[z] & bitC) === 0) continue;
          if (arePeers(z, w2)) {
            cands[z] &= ~bitC;
            changed = true;
          }
        }
        if (changed) yWings++;
      }
    }
  }

  return yWings;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Digit Starvation & 3x3 Box Distribution Analyzer
// ─────────────────────────────────────────────────────────────────────────────

export function analyzeDigitAndBoxDistribution(
  grid: number[][],
  difficulty: EngineDifficulty = "MEDIUM"
): DigitDistributionMetrics {
  const digitCounts = new Array<number>(10).fill(0);
  const boxClueCounts = new Array<number>(9).fill(0);
  const rowClueCounts = new Array<number>(9).fill(0);
  const colClueCounts = new Array<number>(9).fill(0);
  let totalClues = 0;

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = grid[r][c];
      if (val >= 1 && val <= 9) {
        digitCounts[val]++;
        rowClueCounts[r]++;
        colClueCounts[c]++;
        boxClueCounts[Math.floor(r / 3) * 3 + Math.floor(c / 3)]++;
        totalClues++;
      }
    }
  }

  let minDigitCount = 9;
  let maxDigitCount = 0;
  let starvedDigitCount = 0;
  let lowFrequencyDigitCount = 0;
  let highFrequencyDigitCount = 0;

  for (let d = 1; d <= 9; d++) {
    const cnt = digitCounts[d];
    if (cnt < minDigitCount) minDigitCount = cnt;
    if (cnt > maxDigitCount) maxDigitCount = cnt;
    if (cnt <= 1) starvedDigitCount++;
    if (cnt <= 2) lowFrequencyDigitCount++;
    if (cnt >= 6) highFrequencyDigitCount++;
  }

  let minBoxClues = 9;
  let maxBoxClues = 0;
  for (let b = 0; b < 9; b++) {
    const cnt = boxClueCounts[b];
    if (cnt < minBoxClues) minBoxClues = cnt;
    if (cnt > maxBoxClues) maxBoxClues = cnt;
  }

  const boxSpread = maxBoxClues - minBoxClues;

  let passesStarvationRules = true;
  if (difficulty === "EASY") {
    passesStarvationRules = minBoxClues >= 4 && minDigitCount >= 3;
  } else if (difficulty === "MEDIUM") {
    passesStarvationRules = minBoxClues >= 3 && minDigitCount >= 2;
  } else if (difficulty === "HARD") {
    passesStarvationRules =
      highFrequencyDigitCount === 0 &&
      maxDigitCount <= 5 &&
      lowFrequencyDigitCount >= 2;
  } else {
    // EXPERT / MASTER
    passesStarvationRules =
      highFrequencyDigitCount === 0 &&
      maxDigitCount <= 4 &&
      starvedDigitCount >= 2 &&
      lowFrequencyDigitCount >= 4;
  }

  return {
    digitCounts,
    boxClueCounts,
    rowClueCounts,
    colClueCounts,
    totalClues,
    minDigitCount,
    maxDigitCount,
    starvedDigitCount,
    lowFrequencyDigitCount,
    highFrequencyDigitCount,
    minBoxClues,
    maxBoxClues,
    boxSpread,
    passesStarvationRules,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Strict State-Machine Human-Logic Grader & Bottleneck Evaluator
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Simulates solving a Sudoku board using a strict state-machine hierarchy:
 * - Advanced techniques (Pointing/Claiming -> Pairs -> Triples -> X-Wing -> Skyscraper ->
 *   2-String Kite -> Y-Wing) are ONLY invoked when `availCount === 0` (zero Singles anywhere on the board).
 * - Singles are played in human cognitive priority order: Box Hidden Single -> Line Hidden Single -> Naked Single.
 */
export function evaluateHumanDifficulty(
  grid: number[][],
  targetDifficulty: EngineDifficulty = "MEDIUM",
  solutionGrid?: number[][]
): HumanDifficultyReport {
  const distribution = analyzeDigitAndBoxDistribution(grid, targetDifficulty);
  const { values, cands, emptyCount: initialEmpty } = initCandidatesFromGrid(grid);

  const techniques: TechniqueUsageCounts = {
    nakedSingles: 0,
    hiddenSingles: 0,
    boxHiddenSingles: 0,
    lineHiddenSingles: 0,
    pointingPairs: 0,
    nakedPairs: 0,
    hiddenPairs: 0,
    nakedTriples: 0,
    hiddenTriples: 0,
    xWings: 0,
    skyscrapers: 0,
    twoStringKites: 0,
    yWings: 0,
    guesses: 0,
  };

  let remainingEmpty = initialEmpty;
  let stepIndex = 0;
  let initialSingles = 0;
  let initialBoxHiddenSingles = 0;
  let minSinglesInFirst10Steps = 81;
  let zeroSingleBottlenecks = 0;
  let lowSingleBottlenecks = 0;
  let peakTechniqueWeight = 1;

  const isHardOrExpertTarget =
    targetDifficulty === "HARD" ||
    targetDifficulty === "EXPERT" ||
    targetDifficulty === "MASTER";

  const applyStrictDeductionsAtZeroSingles = (): boolean => {
    const pt = applyPointingAndBoxLine(cands);
    if (pt > 0) {
      techniques.pointingPairs += pt;
      if (peakTechniqueWeight < 2) peakTechniqueWeight = 2;
      return true;
    }

    const pairs = applyNakedAndHiddenPairs(cands);
    if (pairs.nakedPairs > 0 || pairs.hiddenPairs > 0) {
      techniques.nakedPairs += pairs.nakedPairs;
      techniques.hiddenPairs += pairs.hiddenPairs;
      if (peakTechniqueWeight < 3) peakTechniqueWeight = 3;
      return true;
    }

    const triples = applyNakedAndHiddenTriples(cands);
    if (triples.nakedTriples > 0 || triples.hiddenTriples > 0) {
      techniques.nakedTriples += triples.nakedTriples;
      techniques.hiddenTriples += triples.hiddenTriples;
      if (peakTechniqueWeight < 4) peakTechniqueWeight = 4;
      return true;
    }

    const xw = applyXWings(cands);
    if (xw > 0) {
      techniques.xWings += xw;
      if (peakTechniqueWeight < 5) peakTechniqueWeight = 5;
      return true;
    }

    const sky = applySkyscrapers(cands);
    if (sky > 0) {
      techniques.skyscrapers += sky;
      if (peakTechniqueWeight < 6) peakTechniqueWeight = 6;
      return true;
    }

    const kite = applyTwoStringKites(cands);
    if (kite > 0) {
      techniques.twoStringKites += kite;
      if (peakTechniqueWeight < 6) peakTechniqueWeight = 6;
      return true;
    }

    const yw = applyYWings(cands);
    if (yw > 0) {
      techniques.yWings += yw;
      if (peakTechniqueWeight < 7) peakTechniqueWeight = 7;
      return true;
    }

    return false;
  };

  while (remainingEmpty > 0) {
    const { placements, boxHiddenCount } = findSingles(values, cands);
    const availCount = placements.length;

    if (stepIndex === 0) {
      initialSingles = availCount;
      initialBoxHiddenSingles = boxHiddenCount;
    }
    if (stepIndex < 10 && availCount < minSinglesInFirst10Steps) {
      minSinglesInFirst10Steps = availCount;
    }

    // STRICT STATE-MACHINE GATE: Advanced deductions ONLY fire when zero Singles exist!
    if (availCount === 0) {
      zeroSingleBottlenecks++;
      let unlocked = false;

      for (let chain = 0; chain < 10; chain++) {
        if (!applyStrictDeductionsAtZeroSingles()) break;
        const postCheck = findSingles(values, cands);
        if (postCheck.placements.length > 0) {
          unlocked = true;
          break;
        }
      }

      if (unlocked) {
        continue;
      }

      // Stalled beyond Y-Wing / Skyscraper / 2-String Kite: resolve 1 MRV bi-value cell to continue trace
      techniques.guesses++;
      let guessIdx = -1;
      let bestCnt = 10;
      for (let idx = 0; idx < 81; idx++) {
        if (values[idx] !== 0) continue;
        const cnt = countBits(cands[idx]);
        if (cnt > 0 && cnt < bestCnt) {
          bestCnt = cnt;
          guessIdx = idx;
          if (cnt === 2) break;
        }
      }

      if (guessIdx === -1) break;
      const r = CELL_ROW[guessIdx];
      const c = CELL_COL[guessIdx];
      const fallbackDigit =
        solutionGrid?.[r]?.[c] || lowestDigit(cands[guessIdx]);
      if (!fallbackDigit) break;

      placeDigitInState(values, cands, guessIdx, fallbackDigit);
      remainingEmpty--;
      stepIndex++;
      continue;
    }

    // Track constricted single valleys (excluding final 15-cell endgame cleanup)
    if (availCount <= 2 && remainingEmpty > 15) {
      lowSingleBottlenecks++;
    }

    // Place singles in cognitive order:
    // - For HARD/EXPERT: 1 single per step so every zero-single or 1-single valley is observed accurately.
    // - For EASY/MEDIUM: up to 3 singles per wave for fast simulation.
    const batchLimit = isHardOrExpertTarget ? 1 : Math.min(availCount, 3);
    for (let i = 0; i < batchLimit; i++) {
      const move = placements[i];
      if (values[move.idx] !== 0) continue;
      placeDigitInState(values, cands, move.idx, move.digit);
      if (move.kind === "boxHidden") {
        techniques.boxHiddenSingles++;
        techniques.hiddenSingles++;
      } else if (move.kind === "lineHidden") {
        techniques.lineHiddenSingles++;
        techniques.hiddenSingles++;
      } else {
        techniques.nakedSingles++;
      }
      remainingEmpty--;
    }
    stepIndex++;
  }

  if (minSinglesInFirst10Steps === 81) {
    minSinglesInFirst10Steps = initialSingles;
  }

  const solvedByLogic = remainingEmpty === 0 && techniques.guesses === 0;
  const requiresGuessing = techniques.guesses > 0 || remainingEmpty > 0;

  // Weighted SE-aligned Human Logic Score (strictly earned at mandatory bottlenecks + harder single types)
  const logicScore =
    techniques.boxHiddenSingles * 1 +
    techniques.lineHiddenSingles * 4 +
    techniques.nakedSingles * 6 +
    techniques.pointingPairs * 38 +
    techniques.nakedPairs * 52 +
    techniques.hiddenPairs * 64 +
    techniques.nakedTriples * 85 +
    techniques.hiddenTriples * 95 +
    techniques.xWings * 130 +
    techniques.skyscrapers * 155 +
    techniques.twoStringKites * 165 +
    techniques.yWings * 185 +
    zeroSingleBottlenecks * 75 +
    lowSingleBottlenecks * 14;

  const mandatoryAdvancedCount =
    techniques.pointingPairs +
    techniques.nakedPairs +
    techniques.hiddenPairs +
    techniques.nakedTriples +
    techniques.hiddenTriples +
    techniques.xWings +
    techniques.skyscrapers +
    techniques.twoStringKites +
    techniques.yWings;

  const expertPatternCount =
    techniques.nakedTriples +
    techniques.hiddenTriples +
    techniques.xWings +
    techniques.skyscrapers +
    techniques.twoStringKites +
    techniques.yWings;

  let classifiedTier: "EASY" | "MEDIUM" | "HARD" | "EXPERT" = "EASY";
  if (
    expertPatternCount > 0 ||
    zeroSingleBottlenecks >= 2 ||
    (zeroSingleBottlenecks >= 1 && distribution.totalClues <= 26)
  ) {
    classifiedTier = "EXPERT";
  } else if (
    mandatoryAdvancedCount > 0 ||
    zeroSingleBottlenecks >= 1 ||
    (lowSingleBottlenecks >= 6 && distribution.totalClues <= 31)
  ) {
    classifiedTier = "HARD";
  } else if (
    techniques.lineHiddenSingles + techniques.nakedSingles >= 14 ||
    initialSingles <= 6 ||
    distribution.totalClues <= 42
  ) {
    classifiedTier = "MEDIUM";
  }

  const bottlenecks: BottleneckMetrics = {
    initialSingles,
    initialBoxHiddenSingles,
    minSinglesInFirst10Steps,
    zeroSingleBottlenecks,
    lowSingleBottlenecks,
    peakTechniqueWeight,
  };

  const compositeFitnessScore = computeCompositeFitnessScore(
    targetDifficulty,
    logicScore,
    solvedByLogic,
    requiresGuessing,
    techniques,
    distribution,
    bottlenecks
  );

  return {
    solvedByLogic,
    requiresGuessing,
    classifiedTier,
    logicScore,
    compositeFitnessScore,
    techniques,
    distribution,
    bottlenecks,
  };
}

function computeCompositeFitnessScore(
  targetDifficulty: EngineDifficulty,
  logicScore: number,
  solvedByLogic: boolean,
  requiresGuessing: boolean,
  techniques: TechniqueUsageCounts,
  distribution: DigitDistributionMetrics,
  bottlenecks: BottleneckMetrics
): number {
  if (targetDifficulty === "EASY") {
    let score = 300;
    if (!solvedByLogic || requiresGuessing) score -= 600;
    if (bottlenecks.zeroSingleBottlenecks > 0) score -= 350;
    if (distribution.minBoxClues >= 4) score += 70;
    else score -= (4 - distribution.minBoxClues) * 55;
    score -= distribution.boxSpread * 12;
    score += Math.min(bottlenecks.initialSingles, 14) * 6;
    if (distribution.minDigitCount >= 4) score += 45;
    return score;
  }

  if (targetDifficulty === "MEDIUM") {
    let score = 300;
    if (!solvedByLogic || requiresGuessing) score -= 500;
    if (bottlenecks.zeroSingleBottlenecks > 0) score -= 180;
    if (distribution.minBoxClues >= 3) score += 55;
    else score -= (3 - distribution.minBoxClues) * 45;
    score -= distribution.boxSpread * 10;
    // Reward Line Hidden Singles (SE 1.5) & Naked Singles (SE 2.3) over trivial Box Hidden Singles
    score += (techniques.lineHiddenSingles + techniques.nakedSingles) * 5;
    if (bottlenecks.initialSingles >= 3 && bottlenecks.initialSingles <= 7) {
      score += 55;
    } else if (bottlenecks.initialSingles > 10) {
      score -= (bottlenecks.initialSingles - 10) * 12;
    }
    return score;
  }

  if (targetDifficulty === "HARD") {
    let score = logicScore;

    // Mandatory Logical Bottleneck Gate: A true HARD board should hit >= 1 zero-single wall
    if (bottlenecks.zeroSingleBottlenecks >= 1) {
      score += 220 + bottlenecks.zeroSingleBottlenecks * 65;
    } else {
      score -= 140;
    }

    if (solvedByLogic && !requiresGuessing) {
      score += 160;
    } else if (techniques.guesses === 1) {
      // A single beyond-Y-Wing chain step is still far harder than a trivial Single-Only board
      score += 40;
    } else {
      score -= techniques.guesses * 90;
    }

    // Penalize opening chute cross-hatches (Box Hidden Singles on Move 1)
    if (bottlenecks.initialBoxHiddenSingles === 0) score += 85;
    else if (bottlenecks.initialBoxHiddenSingles === 1) score += 35;
    else score -= bottlenecks.initialBoxHiddenSingles * 35;

    if (bottlenecks.initialSingles <= 2) score += 80;
    else if (bottlenecks.initialSingles <= 4) score += 35;
    else score -= (bottlenecks.initialSingles - 4) * 28;

    if (bottlenecks.minSinglesInFirst10Steps <= 1) score += 60;

    // Digit Starvation rewards for HARD
    if (distribution.maxDigitCount <= 4) score += 75;
    else if (distribution.maxDigitCount === 5) score += 35;
    else score -= distribution.highFrequencyDigitCount * 70;

    score += distribution.starvedDigitCount * 40;
    score += distribution.lowFrequencyDigitCount * 25;
    return score;
  }

  // EXPERT / MASTER
  let score = logicScore * 1.35;

  // Mandatory Deep Bottleneck Gate for EXPERT
  if (bottlenecks.zeroSingleBottlenecks >= 2) {
    score += 320 + bottlenecks.zeroSingleBottlenecks * 80;
  } else if (bottlenecks.zeroSingleBottlenecks === 1) {
    score += 180;
  } else {
    score -= 220;
  }

  if (solvedByLogic && !requiresGuessing) {
    score += 210;
  } else if (techniques.guesses === 1) {
    // 1 deep chain/AIC step beyond Y-Wing represents SE 4.5-5.2 Expert difficulty
    score += 95;
  } else if (techniques.guesses === 2) {
    score += 20;
  } else {
    score -= (techniques.guesses - 2) * 85;
  }

  // Brutal opening scarcity: Expert boards should have 0 or 1 Box Hidden Single on Move 1
  if (bottlenecks.initialBoxHiddenSingles === 0) score += 110;
  else if (bottlenecks.initialBoxHiddenSingles === 1) score += 40;
  else score -= bottlenecks.initialBoxHiddenSingles * 45;

  if (bottlenecks.initialSingles <= 1) score += 110;
  else if (bottlenecks.initialSingles === 2) score += 65;
  else if (bottlenecks.initialSingles === 3) score += 20;
  else score -= (bottlenecks.initialSingles - 3) * 35;

  // Strict Digit Starvation rewards for EXPERT / MASTER
  if (distribution.maxDigitCount <= 4) score += 95;
  else if (distribution.maxDigitCount === 5) score += 20;
  else score -= distribution.highFrequencyDigitCount * 90;

  if (distribution.starvedDigitCount >= 2) score += 105;
  else if (distribution.starvedDigitCount === 1) score += 55;
  else score -= 60;

  score += distribution.lowFrequencyDigitCount * 28;

  return score;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Anti-Single Guided Digging & 2-Opt Bottleneck Swap Engine
// ─────────────────────────────────────────────────────────────────────────────

const TARGET_REMOVALS: Record<EngineDifficulty, number> = {
  EASY: 30,   // 51 clues (balanced 3x3 boxes, 100% Singles)
  MEDIUM: 42, // 39 clues (balanced 3x3 boxes, Line Hidden + Naked Singles)
  HARD: 51,   // 30 clues (Digit Starvation + mandatory Locked/Pair/Triple bottlenecks)
  EXPERT: 56, // 25 clues (Strict Digit Starvation + multi-valley Fish/Wing/Chain bottlenecks)
  MASTER: 58, // 23 clues (Minimal/near-minimal Sunday Master tier)
};

function shuffleWithSeededPRNG<T>(items: readonly T[], prng: () => number): T[] {
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
 * Computes an "Anti-Single Enabler Score" for each currently filled clue cell `(r, c)`.
 * Clues that participate in 2-of-3 chute cross-hatches or directly lock immediate Box Hidden
 * Singles / Naked Singles receive the highest scores so they are prioritized for removal/swap.
 */
function rankEnablerCluesToBreakSingles(
  puzzle: number[][],
  digitCounts: Int32Array,
  boxCounts: Int32Array
): number[] {
  const { values, cands } = initCandidatesFromGrid(puzzle);
  const { placements } = findSingles(values, cands);

  const enablerScore = new Int32Array(81);

  // 1. Score clues that directly peer into immediate singles
  for (let i = 0; i < placements.length; i++) {
    const single = placements[i];
    const weight = single.kind === "boxHidden" ? 25 : single.kind === "lineHidden" ? 14 : 18;
    const sRow = CELL_ROW[single.idx];
    const sCol = CELL_COL[single.idx];
    const sBox = CELL_BOX[single.idx];
    const bandRowStart = Math.floor(sRow / 3) * 3;
    const stackColStart = Math.floor(sCol / 3) * 3;

    // Peer clues directly constricting this single cell
    const peers = CELL_PEERS[single.idx];
    for (let p = 0; p < peers.length; p++) {
      const peerIdx = peers[p];
      if (values[peerIdx] !== 0) {
        enablerScore[peerIdx] += weight;
      }
    }

    // For Box Hidden Singles: find the 2 cross-hatching clues of `single.digit` in the same chute!
    if (single.kind === "boxHidden") {
      for (let r = bandRowStart; r < bandRowStart + 3; r++) {
        for (let c = 0; c < 9; c++) {
          const idx = r * 9 + c;
          if (CELL_BOX[idx] !== sBox && values[idx] === single.digit) {
            enablerScore[idx] += 40;
          }
        }
      }
      for (let c = stackColStart; c < stackColStart + 3; c++) {
        for (let r = 0; r < 9; r++) {
          const idx = r * 9 + c;
          if (CELL_BOX[idx] !== sBox && values[idx] === single.digit) {
            enablerScore[idx] += 40;
          }
        }
      }
    }
  }

  // 2. Also score high-frequency digits and dense boxes
  const clueIndices: number[] = [];
  for (let idx = 0; idx < 81; idx++) {
    const val = values[idx];
    if (val === 0) continue;
    const b = CELL_BOX[idx];
    if (boxCounts[b] <= 1) continue; // Keep at least 1 clue per box
    enablerScore[idx] += digitCounts[val] * 8 + boxCounts[b] * 4;
    clueIndices.push(idx);
  }

  clueIndices.sort((a, b) => enablerScore[b] - enablerScore[a]);
  return clueIndices;
}

/**
 * Performs fast 2-Opt Bottleneck Swaps on a carved HARD/EXPERT/MASTER board:
 * Restores 1 empty cell (preferring immediate singles or starved digits) to unlock the removal
 * of 1 or 2 high-enabler cross-hatch clues, actively converting Single-Only boards into
 * genuine logical bottleneck boards (`zeroSingleBottlenecks >= 1`).
 */
function mutateBoardToBreakSingles(
  puzzle: number[][],
  solved: number[][],
  digitCounts: Int32Array,
  boxCounts: Int32Array,
  maxDigitCap: number,
  allowNetExtraRemovals: boolean,
  deadlineMs: number,
  nowMs: () => number,
  maxSwaps = 4
): number {
  let netExtraRemovals = 0;

  for (let swapStep = 0; swapStep < maxSwaps; swapStep++) {
    if (nowMs() >= deadlineMs) break;

    const { values, cands } = initCandidatesFromGrid(puzzle);
    const { placements, boxHiddenCount } = findSingles(values, cands);

    // Stop mutating once opening Box Hidden Singles are eliminated and total opening singles are scarce
    if (boxHiddenCount === 0 && placements.length <= 1) {
      break;
    }

    const rankedEnablerClues = rankEnablerCluesToBreakSingles(
      puzzle,
      digitCounts,
      boxCounts
    );
    if (rankedEnablerClues.length === 0) break;

    // First try direct removal of top enabler clues (for EXPERT/MASTER)
    if (allowNetExtraRemovals) {
      let directRemoved = false;
      for (let i = 0; i < Math.min(rankedEnablerClues.length, 5); i++) {
        if (nowMs() >= deadlineMs) break;
        const cIdx = rankedEnablerClues[i];
        const cr = CELL_ROW[cIdx];
        const cc = CELL_COL[cIdx];
        const cb = CELL_BOX[cIdx];
        const cVal = puzzle[cr][cc];
        if (cVal === 0 || boxCounts[cb] <= 1) continue;

        puzzle[cr][cc] = 0;
        if (hasUniqueSolutionFast(puzzle)) {
          digitCounts[cVal]--;
          boxCounts[cb]--;
          netExtraRemovals++;
          directRemoved = true;
          break;
        } else {
          puzzle[cr][cc] = cVal;
        }
      }
      if (directRemoved) continue;
    }

    // 2-Opt Swap: pick an enabler clue that locks a Box Hidden Single or over-cap digit,
    // and swap it with an empty cell whose digit is low-frequency and does not create new Box Hidden Singles.
    let swapApplied = false;
    const candidateClues = rankedEnablerClues.slice(0, 6);

    // Collect candidate empty cells (prioritizing cells from low-clue boxes and low-frequency digits)
    const emptyIndices: number[] = [];
    for (let idx = 0; idx < 81; idx++) {
      if (values[idx] === 0) {
        const solDigit = solved[CELL_ROW[idx]][CELL_COL[idx]];
        if (digitCounts[solDigit] < maxDigitCap) {
          emptyIndices.push(idx);
        }
      }
    }

    for (let i = 0; i < candidateClues.length && !swapApplied; i++) {
      if (nowMs() >= deadlineMs) break;
      const c1 = candidateClues[i];
      const r1 = CELL_ROW[c1];
      const col1 = CELL_COL[c1];
      const b1 = CELL_BOX[c1];
      const val1 = puzzle[r1][col1];
      if (val1 === 0 || boxCounts[b1] <= 1) continue;

      for (let j = 0; j < Math.min(emptyIndices.length, 8); j++) {
        if (nowMs() >= deadlineMs) break;
        const empIdx = emptyIndices[j];
        const er = CELL_ROW[empIdx];
        const ec = CELL_COL[empIdx];
        const eb = CELL_BOX[empIdx];
        const eVal = solved[er][ec];
        if (eVal === val1) continue;

        // Apply 1-for-1 swap tentatively
        puzzle[er][ec] = eVal;
        puzzle[r1][col1] = 0;

        if (hasUniqueSolutionFast(puzzle)) {
          let bonusRemoved = false;
          if (allowNetExtraRemovals) {
            for (let k = i + 1; k < candidateClues.length; k++) {
              const c2 = candidateClues[k];
              const r2 = CELL_ROW[c2];
              const col2 = CELL_COL[c2];
              const b2 = CELL_BOX[c2];
              const val2 = puzzle[r2][col2];
              if (val2 === 0 || boxCounts[b2] <= 1) continue;

              puzzle[r2][col2] = 0;
              if (hasUniqueSolutionFast(puzzle)) {
                digitCounts[val2]--;
                boxCounts[b2]--;
                netExtraRemovals++;
                bonusRemoved = true;
                break;
              } else {
                puzzle[r2][col2] = val2;
              }
            }
          }

          const afterState = initCandidatesFromGrid(puzzle);
          const afterSingles = findSingles(afterState.values, afterState.cands);

          const improvedSingles =
            bonusRemoved ||
            afterSingles.boxHiddenCount < boxHiddenCount ||
            (afterSingles.boxHiddenCount === boxHiddenCount &&
              afterSingles.placements.length < placements.length) ||
            (digitCounts[val1] > maxDigitCap && digitCounts[eVal] < maxDigitCap);

          if (improvedSingles) {
            digitCounts[eVal]++;
            digitCounts[val1]--;
            boxCounts[eb]++;
            boxCounts[b1]--;
            swapApplied = true;
            break;
          }
        }

        // Revert tentative swap
        puzzle[r1][col1] = val1;
        puzzle[er][ec] = 0;
      }
    }

    if (!swapApplied) break;
  }

  return netExtraRemovals;
}

/**
 * Carves a single candidate puzzle from `solved` using difficulty-specific
 * distribution rules (Balanced 3x3 Boxes for EASY/MEDIUM; Digit Starvation +
 * Anti-Single Guided Digging + 2-Opt Bottleneck Swaps for HARD/EXPERT/MASTER).
 */
function carveCandidateBoard(
  solved: number[][],
  difficulty: EngineDifficulty,
  prng: () => number,
  candidateIndex: number,
  deadlineMs: number,
  nowMs: () => number
): { puzzle: number[][]; removedCount: number } {
  const puzzle = solved.map((row) => [...row]);
  const removedTarget = TARGET_REMOVALS[difficulty];

  const digitCounts = new Int32Array(10).fill(9);
  const boxCounts = new Int32Array(9).fill(9);
  const rowCounts = new Int32Array(9).fill(9);
  const colCounts = new Int32Array(9).fill(9);

  const basePositions = Array.from({ length: 81 }, (_, i) => i);
  const shuffledPositions = shuffleWithSeededPRNG(basePositions, prng);

  let orderedPositions: number[];

  if (difficulty === "EASY" || difficulty === "MEDIUM") {
    orderedPositions = shuffledPositions;
  } else {
    // HARD / EXPERT / MASTER: Deterministic Digit Starvation & Chute Asymmetry Ordering
    const allDigits = shuffleWithSeededPRNG([1, 2, 3, 4, 5, 6, 7, 8, 9], prng);
    const primaryStarved = new Set<number>(
      allDigits.slice(0, difficulty === "HARD" ? 2 : 3)
    );
    const secondaryStarved = new Set<number>(
      allDigits.slice(difficulty === "HARD" ? 2 : 3, difficulty === "HARD" ? 4 : 6)
    );

    const wave1: number[] = [];
    const wave2: number[] = [];
    const wave3: number[] = [];

    for (let i = 0; i < shuffledPositions.length; i++) {
      const pos = shuffledPositions[i];
      const r = CELL_ROW[pos];
      const c = CELL_COL[pos];
      const d = solved[r][c];
      if (primaryStarved.has(d)) {
        wave1.push(pos);
      } else if (secondaryStarved.has(d) || ((r + c + candidateIndex) % 3 === 0)) {
        wave2.push(pos);
      } else {
        wave3.push(pos);
      }
    }
    orderedPositions = [...wave1, ...wave2, ...wave3];
  }

  const minBoxFloor =
    difficulty === "EASY" ? 4 : difficulty === "MEDIUM" ? 3 : 1;
  const minLineFloor =
    difficulty === "EASY" ? 4 : difficulty === "MEDIUM" ? 3 : 1;
  const minDigitFloor =
    difficulty === "EASY" ? 4 : difficulty === "MEDIUM" ? 3 : 0;
  const maxDigitCap =
    difficulty === "HARD" ? 5 : difficulty === "EXPERT" || difficulty === "MASTER" ? 4 : 9;

  let removedCount = 0;

  // For HARD/EXPERT/MASTER: Carve the first ~40 clues rapidly via Starvation waves, then switch
  // to Anti-Single Guided Digging for the final holes so every late removal breaks an active Single!
  const guidedThreshold =
    difficulty === "HARD" ? 40 : difficulty === "EXPERT" || difficulty === "MASTER" ? 42 : 99;

  for (let i = 0; i < orderedPositions.length; i++) {
    if (removedCount >= Math.min(removedTarget, guidedThreshold)) break;
    const pos = orderedPositions[i];
    const r = CELL_ROW[pos];
    const c = CELL_COL[pos];
    const b = CELL_BOX[pos];
    const val = puzzle[r][c];
    if (val === 0) continue;

    if (boxCounts[b] <= minBoxFloor) continue;
    if (rowCounts[r] <= minLineFloor || colCounts[c] <= minLineFloor) continue;
    if (digitCounts[val] <= minDigitFloor) continue;

    puzzle[r][c] = 0;
    if (hasUniqueSolutionFast(puzzle)) {
      removedCount++;
      digitCounts[val]--;
      boxCounts[b]--;
      rowCounts[r]--;
      colCounts[c]--;
    } else {
      puzzle[r][c] = val;
    }
  }

  // Phase 2 (HARD / EXPERT / MASTER): Anti-Single Guided Digging for the remaining holes
  if (
    (difficulty === "HARD" || difficulty === "EXPERT" || difficulty === "MASTER") &&
    removedCount < removedTarget
  ) {
    const antiSingleOrder = rankEnablerCluesToBreakSingles(
      puzzle,
      digitCounts,
      boxCounts
    );
    for (let i = 0; i < antiSingleOrder.length; i++) {
      if (removedCount >= removedTarget) break;
      const pos = antiSingleOrder[i];
      const r = CELL_ROW[pos];
      const c = CELL_COL[pos];
      const b = CELL_BOX[pos];
      const val = puzzle[r][c];
      if (val === 0 || boxCounts[b] <= 1) continue;

      puzzle[r][c] = 0;
      if (hasUniqueSolutionFast(puzzle)) {
        removedCount++;
        digitCounts[val]--;
        boxCounts[b]--;
        rowCounts[r]--;
        colCounts[c]--;
      } else {
        puzzle[r][c] = val;
      }
    }
  }

  // Fallback Pass if target removals not yet reached
  if (removedCount < removedTarget) {
    for (let i = 0; i < shuffledPositions.length; i++) {
      if (removedCount >= removedTarget) break;
      const pos = shuffledPositions[i];
      const r = CELL_ROW[pos];
      const c = CELL_COL[pos];
      const b = CELL_BOX[pos];
      const val = puzzle[r][c];
      if (val === 0) continue;

      puzzle[r][c] = 0;
      if (hasUniqueSolutionFast(puzzle)) {
        removedCount++;
        digitCounts[val]--;
        boxCounts[b]--;
        rowCounts[r]--;
        colCounts[c]--;
      } else {
        puzzle[r][c] = val;
      }
    }
  }

  // Phase 3 (HARD / EXPERT / MASTER): 2-Opt Bottleneck Mutation to suppress opening Singles
  if (
    (difficulty === "HARD" || difficulty === "EXPERT" || difficulty === "MASTER") &&
    nowMs() < deadlineMs
  ) {
    const extraRemoved = mutateBoardToBreakSingles(
      puzzle,
      solved,
      digitCounts,
      boxCounts,
      maxDigitCap,
      difficulty !== "HARD",
      deadlineMs,
      nowMs,
      difficulty === "HARD" ? 3 : 4
    );
    removedCount += extraRemoved;
  }

  return { puzzle, removedCount };
}

/**
 * Generates a complete solved board and evaluates multiple candidate puzzles within a
 * strict CPU time budget (`maxTimeBudgetMs`, default 80ms) using the provided `prng`,
 * returning the candidate with the highest Human-Logic fitness score for `difficulty`.
 */
export function generateHumanGradedBoard(
  difficulty: EngineDifficulty,
  prng: () => number,
  solveBaseGrid: (grid: number[][], rng: () => number) => boolean,
  maxTimeBudgetMs = 80
): GeneratedCandidateResult {
  const startMs = typeof performance !== "undefined" ? performance.now() : Date.now();
  const nowMs = () => (typeof performance !== "undefined" ? performance.now() : Date.now());
  const deadlineMs = startMs + maxTimeBudgetMs;

  // 1. Generate the canonical solved board ONCE from the seed PRNG so `solved` is 100% invariant
  const solved: number[][] = Array.from({ length: 9 }, () => Array<number>(9).fill(0));
  solveBaseGrid(solved, prng);

  const maxCandidates =
    difficulty === "EASY"
      ? 2
      : difficulty === "MEDIUM"
      ? 3
      : 6; // HARD, EXPERT, MASTER evaluate up to 6 anti-single mutated candidates within the 80ms budget

  let bestPuzzle: number[][] | null = null;
  let bestReport: HumanDifficultyReport | null = null;
  let bestRemovedCount = 0;
  let candidatesEvaluated = 0;

  for (let attempt = 0; attempt < maxCandidates; attempt++) {
    if (attempt > 0 && nowMs() >= deadlineMs) {
      break;
    }

    const { puzzle, removedCount } = carveCandidateBoard(
      solved,
      difficulty,
      prng,
      attempt,
      deadlineMs,
      nowMs
    );
    const report = evaluateHumanDifficulty(puzzle, difficulty, solved);
    candidatesEvaluated++;

    if (
      !bestPuzzle ||
      !bestReport ||
      report.compositeFitnessScore > bestReport.compositeFitnessScore
    ) {
      bestPuzzle = puzzle;
      bestReport = report;
      bestRemovedCount = removedCount;
    }

    // Early exit for EASY/MEDIUM if an ideal single-only balanced board is already found
    if (
      (difficulty === "EASY" || difficulty === "MEDIUM") &&
      report.solvedByLogic &&
      report.bottlenecks.zeroSingleBottlenecks === 0 &&
      report.distribution.passesStarvationRules
    ) {
      break;
    }
  }

  const finalPuzzle = bestPuzzle!;
  const finalReport = bestReport!;
  const elapsedMs = Math.max(0, Math.round((nowMs() - startMs) * 10) / 10);

  return {
    puzzle: finalPuzzle,
    solved,
    puzzleFlat: finalPuzzle.flat(),
    solutionFlat: solved.flat(),
    clueCount: 81 - bestRemovedCount,
    candidatesEvaluated,
    elapsedMs,
    report: finalReport,
  };
}
