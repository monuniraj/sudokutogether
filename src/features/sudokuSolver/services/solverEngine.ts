export type CustomSolveStatus = "unique" | "multiple" | "unsolvable";

export interface CustomSolveResult {
  solution: number[][] | null;
  status: CustomSolveStatus;
}

const ALL_DIGITS_MASK = 0b1111111110; // Bits 1..9
const MAX_MRV_NODES = 200_000;
const MAX_SOLVE_DURATION_MS = 350;

/**
 * Counts set bits inside bits 1..9 of an integer mask.
 */
function countMaskBits(mask: number): number {
  let count = 0;
  let m = mask >> 1;
  while (m !== 0) {
    m &= m - 1;
    count++;
  }
  return count;
}

/**
 * Checks rows, columns, and 3x3 boxes for duplicate non-zero digits (1..9) and returns
 * stringified `"r,c"` coordinates for every conflicting cell.
 */
export function validateCustomGrid(grid: number[][]): Set<string> {
  const conflicts = new Set<string>();
  if (!Array.isArray(grid) || grid.length !== 9) return conflicts;

  // Row duplicates
  for (let r = 0; r < 9; r++) {
    const row = grid[r];
    if (!Array.isArray(row) || row.length !== 9) continue;
    const seen = new Map<number, Array<{ r: number; c: number }>>();
    for (let c = 0; c < 9; c++) {
      const val = row[c];
      if (!Number.isInteger(val) || val < 1 || val > 9) continue;
      const list = seen.get(val) ?? [];
      list.push({ r, c });
      seen.set(val, list);
    }
    seen.forEach((coords) => {
      if (coords.length > 1) {
        coords.forEach(({ r: cr, c: cc }) => conflicts.add(`${cr},${cc}`));
      }
    });
  }

  // Column duplicates
  for (let c = 0; c < 9; c++) {
    const seen = new Map<number, Array<{ r: number; c: number }>>();
    for (let r = 0; r < 9; r++) {
      const row = grid[r];
      if (!Array.isArray(row) || row.length !== 9) continue;
      const val = row[c];
      if (!Number.isInteger(val) || val < 1 || val > 9) continue;
      const list = seen.get(val) ?? [];
      list.push({ r, c });
      seen.set(val, list);
    }
    seen.forEach((coords) => {
      if (coords.length > 1) {
        coords.forEach(({ r: cr, c: cc }) => conflicts.add(`${cr},${cc}`));
      }
    });
  }

  // 3x3 Box duplicates
  for (let boxRow = 0; boxRow < 9; boxRow += 3) {
    for (let boxCol = 0; boxCol < 9; boxCol += 3) {
      const seen = new Map<number, Array<{ r: number; c: number }>>();
      for (let dr = 0; dr < 3; dr++) {
        const row = grid[boxRow + dr];
        if (!Array.isArray(row) || row.length !== 9) continue;
        for (let dc = 0; dc < 3; dc++) {
          const r = boxRow + dr;
          const c = boxCol + dc;
          const val = row[c];
          if (!Number.isInteger(val) || val < 1 || val > 9) continue;
          const list = seen.get(val) ?? [];
          list.push({ r, c });
          seen.set(val, list);
        }
      }
      seen.forEach((coords) => {
        if (coords.length > 1) {
          coords.forEach(({ r: cr, c: cc }) => conflicts.add(`${cr},${cc}`));
        }
      });
    }
  }

  return conflicts;
}

/**
 * Pure MRV bitmask Sudoku solver for user-entered newspaper / custom puzzles.
 * Evaluates up to 2 solutions while enforcing strict node-visit and wall-clock caps
 * so sparse or adversarial inputs never block the UI thread.
 */
export function solveCustomBoard(grid: number[][]): CustomSolveResult {
  if (!Array.isArray(grid) || grid.length !== 9) {
    return { solution: null, status: "unsolvable" };
  }

  const workGrid: number[][] = Array.from({ length: 9 }, () => Array<number>(9).fill(0));
  const rowMask = new Int32Array(9);
  const colMask = new Int32Array(9);
  const boxMask = new Int32Array(9);

  let clueCount = 0;

  // Validate shape, digit range, and initial clue uniqueness via bitmasks
  for (let r = 0; r < 9; r++) {
    const row = grid[r];
    if (!Array.isArray(row) || row.length !== 9) {
      return { solution: null, status: "unsolvable" };
    }
    const boxBase = Math.floor(r / 3) * 3;
    for (let c = 0; c < 9; c++) {
      const val = Number(row[c]);
      if (!Number.isInteger(val) || val < 0 || val > 9) {
        return { solution: null, status: "unsolvable" };
      }
      workGrid[r][c] = val;
      if (val !== 0) {
        const bit = 1 << val;
        const box = boxBase + Math.floor(c / 3);
        if ((rowMask[r] & bit) !== 0 || (colMask[c] & bit) !== 0 || (boxMask[box] & bit) !== 0) {
          return { solution: null, status: "unsolvable" };
        }
        rowMask[r] |= bit;
        colMask[c] |= bit;
        boxMask[box] |= bit;
        clueCount++;
      }
    }
  }

  // Already a complete valid 9x9 grid
  if (clueCount === 81) {
    return {
      solution: workGrid.map((r) => [...r]),
      status: "unique",
    };
  }

  let solutions = 0;
  let firstSolution: number[][] | null = null;
  let nodesVisited = 0;
  let aborted = false;
  const startMs = Date.now();

  const search = (): void => {
    if (solutions >= 2 || aborted) return;

    nodesVisited++;
    if (nodesVisited >= MAX_MRV_NODES || ((nodesVisited & 4095) === 0 && Date.now() - startMs > MAX_SOLVE_DURATION_MS)) {
      aborted = true;
      return;
    }

    // Minimum Remaining Values (MRV): pick empty cell with fewest candidate bits
    let bestRow = -1;
    let bestCol = -1;
    let bestBox = -1;
    let bestCandMask = 0;
    let bestCandCount = 10;

    for (let r = 0; r < 9; r++) {
      const boxBase = Math.floor(r / 3) * 3;
      const rUsed = rowMask[r];
      for (let c = 0; c < 9; c++) {
        if (workGrid[r][c] !== 0) continue;
        const box = boxBase + Math.floor(c / 3);
        const candMask = ALL_DIGITS_MASK & ~(rUsed | colMask[c] | boxMask[box]);
        if (candMask === 0) {
          return; // Dead end
        }
        const candCount = countMaskBits(candMask);
        if (candCount < bestCandCount) {
          bestRow = r;
          bestCol = c;
          bestBox = box;
          bestCandMask = candMask;
          bestCandCount = candCount;
          if (candCount === 1) break;
        }
      }
      if (bestCandCount === 1) break;
    }

    if (bestRow === -1) {
      solutions++;
      if (solutions === 1) {
        firstSolution = workGrid.map((r) => [...r]);
      }
      return;
    }

    for (let num = 1; num <= 9; num++) {
      const bit = 1 << num;
      if ((bestCandMask & bit) === 0) continue;

      workGrid[bestRow][bestCol] = num;
      rowMask[bestRow] |= bit;
      colMask[bestCol] |= bit;
      boxMask[bestBox] |= bit;

      search();

      boxMask[bestBox] &= ~bit;
      colMask[bestCol] &= ~bit;
      rowMask[bestRow] &= ~bit;
      workGrid[bestRow][bestCol] = 0;

      if (solutions >= 2 || aborted) return;
    }
  };

  search();

  if (solutions === 0 || !firstSolution) {
    return { solution: null, status: "unsolvable" };
  }

  // A valid 9x9 Sudoku strictly requires at least 17 clues to guarantee uniqueness.
  if (solutions >= 2 || clueCount < 17) {
    return { solution: firstSolution, status: "multiple" };
  }

  return { solution: firstSolution, status: "unique" };
}

