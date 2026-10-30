import { SudokuBoardState } from "../components/game/SudokuBoard";
import {
  evaluateBoardDidWin,
  evaluatePerformanceSticker,
  extractRoomCodeFromChallenge,
} from "../components/share/ShareCard";

export interface ShareCanvasGameState {
  boardState?: SudokuBoardState | null;
  grid?: {
    value: number;
    isOriginalClue: boolean;
    notes?: number[];
  }[][];
  solutionGrid?: number[][];
  difficulty?: string;
  time?: string;
  sessionSeconds?: number;
  playerName?: string;
  bestTime?: string;
  isNewRecord?: boolean;
  isWon?: boolean;
  darkMode?: boolean;
  roomCode?: string;
  currentMistakesCount?: number;
  maxMistakesLimit?: number;
  seed?: string | number;
}

export interface ShareCanvasThemePalette {
  cardBgStart: string;
  cardBgMid: string;
  cardBgEnd: string;
  bannerBg: string;
  pillBg: string;
  pillText: string;
  stickerBg: string;
  stickerText: string;
  boardBg: string;
  cellAltBg: string;
  gridThinLine: string;
  gridThickLine: string;
  boardBorder: string;
  primaryText: string;
  secondaryText: string;
  clueColor: string;
  userColor: string;
  errorColor: string;
  errorCellBg: string;
  noteColor: string;
}

const LIGHT_THEMES: Record<string, ShareCanvasThemePalette> = {
  EASY: {
    cardBgStart: "#ECFDF5",
    cardBgMid: "#FDFBF7",
    cardBgEnd: "#D1FAE5",
    bannerBg: "rgba(255, 255, 255, 0.90)",
    pillBg: "#D1FAE5",
    pillText: "#065F46",
    stickerBg: "#A7F3D0",
    stickerText: "#064E3B",
    boardBg: "#FFFFFF",
    cellAltBg: "#F0FDF4",
    gridThinLine: "#D1FAE5",
    gridThickLine: "#334155",
    boardBorder: "#334155",
    primaryText: "#1C1917",
    secondaryText: "#64748B",
    clueColor: "#334155",
    userColor: "#3b82f6",
    errorColor: "#ef4444",
    errorCellBg: "#FEE2E2",
    noteColor: "#64748B",
  },
  MEDIUM: {
    cardBgStart: "#FFFBEB",
    cardBgMid: "#FDFBF7",
    cardBgEnd: "#FEF3C7",
    bannerBg: "rgba(255, 255, 255, 0.90)",
    pillBg: "#FEF3C7",
    pillText: "#92400E",
    stickerBg: "#FDE68A",
    stickerText: "#78350F",
    boardBg: "#FFFFFF",
    cellAltBg: "#FEFCE8",
    gridThinLine: "#FDE68A",
    gridThickLine: "#334155",
    boardBorder: "#334155",
    primaryText: "#1C1917",
    secondaryText: "#64748B",
    clueColor: "#334155",
    userColor: "#3b82f6",
    errorColor: "#ef4444",
    errorCellBg: "#FEE2E2",
    noteColor: "#64748B",
  },
  HARD: {
    cardBgStart: "#FAF5FF",
    cardBgMid: "#FDFBF7",
    cardBgEnd: "#F3E8FF",
    bannerBg: "rgba(255, 255, 255, 0.90)",
    pillBg: "#F3E8FF",
    pillText: "#6B21A8",
    stickerBg: "#E9D5FF",
    stickerText: "#4C1D95",
    boardBg: "#FFFFFF",
    cellAltBg: "#FAF5FF",
    gridThinLine: "#E9D5FF",
    gridThickLine: "#334155",
    boardBorder: "#334155",
    primaryText: "#1C1917",
    secondaryText: "#64748B",
    clueColor: "#334155",
    userColor: "#3b82f6",
    errorColor: "#ef4444",
    errorCellBg: "#FEE2E2",
    noteColor: "#64748B",
  },
  EXPERT: {
    cardBgStart: "#FFF1F2",
    cardBgMid: "#FDFBF7",
    cardBgEnd: "#FFE4E6",
    bannerBg: "rgba(255, 255, 255, 0.90)",
    pillBg: "#FFE4E6",
    pillText: "#9D174D",
    stickerBg: "#FECDD3",
    stickerText: "#881337",
    boardBg: "#FFFFFF",
    cellAltBg: "#FFF1F2",
    gridThinLine: "#FECDD3",
    gridThickLine: "#334155",
    boardBorder: "#334155",
    primaryText: "#1C1917",
    secondaryText: "#64748B",
    clueColor: "#334155",
    userColor: "#3b82f6",
    errorColor: "#ef4444",
    errorCellBg: "#FEE2E2",
    noteColor: "#64748B",
  },
};

const DARK_THEMES: Record<string, ShareCanvasThemePalette> = {
  EASY: {
    cardBgStart: "#052e24",
    cardBgMid: "#121615",
    cardBgEnd: "#064e3b",
    bannerBg: "rgba(255, 255, 255, 0.06)",
    pillBg: "rgba(16, 185, 129, 0.24)",
    pillText: "#6EE7B7",
    stickerBg: "#065F46",
    stickerText: "#ECFDF5",
    boardBg: "#1E1E24",
    cellAltBg: "#18181D",
    gridThinLine: "#2E2E38",
    gridThickLine: "#64748B",
    boardBorder: "#475569",
    primaryText: "#F8FAFC",
    secondaryText: "#94A3B8",
    clueColor: "#334155",
    userColor: "#3b82f6",
    errorColor: "#ef4444",
    errorCellBg: "rgba(239, 68, 68, 0.18)",
    noteColor: "#94A3B8",
  },
  MEDIUM: {
    cardBgStart: "#2e1c05",
    cardBgMid: "#161412",
    cardBgEnd: "#451a03",
    bannerBg: "rgba(255, 255, 255, 0.06)",
    pillBg: "rgba(245, 158, 11, 0.24)",
    pillText: "#FCD34D",
    stickerBg: "#78350F",
    stickerText: "#FFFBEB",
    boardBg: "#1E1E24",
    cellAltBg: "#18181D",
    gridThinLine: "#2E2E38",
    gridThickLine: "#64748B",
    boardBorder: "#475569",
    primaryText: "#F8FAFC",
    secondaryText: "#94A3B8",
    clueColor: "#334155",
    userColor: "#3b82f6",
    errorColor: "#ef4444",
    errorCellBg: "rgba(239, 68, 68, 0.18)",
    noteColor: "#94A3B8",
  },
  HARD: {
    cardBgStart: "#241042",
    cardBgMid: "#141218",
    cardBgEnd: "#3b0764",
    bannerBg: "rgba(255, 255, 255, 0.06)",
    pillBg: "rgba(168, 85, 247, 0.24)",
    pillText: "#D8B4FE",
    stickerBg: "#581C87",
    stickerText: "#FAF5FF",
    boardBg: "#1E1E24",
    cellAltBg: "#18181D",
    gridThinLine: "#2E2E38",
    gridThickLine: "#64748B",
    boardBorder: "#475569",
    primaryText: "#F8FAFC",
    secondaryText: "#94A3B8",
    clueColor: "#334155",
    userColor: "#3b82f6",
    errorColor: "#ef4444",
    errorCellBg: "rgba(239, 68, 68, 0.18)",
    noteColor: "#94A3B8",
  },
  EXPERT: {
    cardBgStart: "#3b0819",
    cardBgMid: "#181214",
    cardBgEnd: "#4c0519",
    bannerBg: "rgba(255, 255, 255, 0.06)",
    pillBg: "rgba(244, 63, 94, 0.24)",
    pillText: "#FDA4AF",
    stickerBg: "#881337",
    stickerText: "#FFF1F2",
    boardBg: "#1E1E24",
    cellAltBg: "#18181D",
    gridThinLine: "#2E2E38",
    gridThickLine: "#64748B",
    boardBorder: "#475569",
    primaryText: "#F8FAFC",
    secondaryText: "#94A3B8",
    clueColor: "#334155",
    userColor: "#3b82f6",
    errorColor: "#ef4444",
    errorCellBg: "rgba(239, 68, 68, 0.18)",
    noteColor: "#94A3B8",
  },
};

const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
};

const parseFormattedTimeToSeconds = (formatted: string): number => {
  const parts = String(formatted || "")
    .trim()
    .split(":")
    .map((n) => parseInt(n, 10));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * 60 + parts[1];
  }
  return 180;
};

const hasCellConflict = (
  grid: { value: number; isOriginalClue: boolean }[][],
  row: number,
  col: number,
  val: number
): boolean => {
  if (!val) return false;
  for (let c = 0; c < 9; c++) {
    if (c !== col && grid[row]?.[c]?.value === val) return true;
  }
  for (let r = 0; r < 9; r++) {
    if (r !== row && grid[r]?.[col]?.value === val) return true;
  }
  const boxStartRow = Math.floor(row / 3) * 3;
  const boxStartCol = Math.floor(col / 3) * 3;
  for (let r = boxStartRow; r < boxStartRow + 3; r++) {
    for (let c = boxStartCol; c < boxStartCol + 3; c++) {
      if ((r !== row || c !== col) && grid[r]?.[c]?.value === val) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Pure HTML5 2D Canvas generator for Sudoku Sync Share Cards.
 * Completely bypasses html2canvas and DOM flexbox baseline bugs by rendering
 * the card, pills, and 81 board cells directly with geometric centering
 * (`ctx.textAlign = 'center'` and `ctx.textBaseline = 'middle'`).
 */
export async function generateShareCanvas(
  gameState: ShareCanvasGameState | SudokuBoardState | null,
  challengeId?: string,
  themeColor?: string
): Promise<string> {
  const rawState = (gameState || {}) as ShareCanvasGameState;
  const resolvedBoard: SudokuBoardState | null =
    rawState.boardState !== undefined
      ? rawState.boardState
      : Array.isArray(rawState.grid)
      ? (rawState as unknown as SudokuBoardState)
      : null;

  const normalizedDiff = String(
    rawState.difficulty ||
      resolvedBoard?.difficulty ||
      themeColor ||
      "EASY"
  ).toUpperCase();

  const darkMode = Boolean(rawState.darkMode);
  const basePalette = darkMode
    ? DARK_THEMES[normalizedDiff] || DARK_THEMES.EASY
    : LIGHT_THEMES[normalizedDiff] || LIGHT_THEMES.EASY;

  const palette: ShareCanvasThemePalette = {
    ...basePalette,
    ...(themeColor && /^#|^rgb/i.test(themeColor)
      ? { pillBg: themeColor }
      : {}),
  };

  const timeStr = rawState.time || "00:00";
  const playerName = rawState.playerName || "Player";
  const solutionGrid = rawState.solutionGrid || [];
  const mistakes =
    rawState.currentMistakesCount ??
    resolvedBoard?.currentMistakesCount ??
    0;
  const maxMistakes =
    rawState.maxMistakesLimit ?? resolvedBoard?.maxMistakesLimit ?? 3;

  const didWin = evaluateBoardDidWin(resolvedBoard, rawState.isWon);

  const effectiveSeconds =
    typeof rawState.sessionSeconds === "number" && rawState.sessionSeconds > 0
      ? rawState.sessionSeconds
      : parseFormattedTimeToSeconds(timeStr);

  const stickerBadge = evaluatePerformanceSticker(
    normalizedDiff,
    effectiveSeconds,
    didWin
  );

  const extractedRoomCode = extractRoomCodeFromChallenge(
    challengeId,
    rawState.roomCode,
    resolvedBoard
  );

  const ctaCopy = didWin
    ? "Can you beat my time?"
    : "Stuck! Can you help me finish this?";

  // Wait briefly for web fonts if available
  if (typeof document !== "undefined" && (document as any).fonts?.ready) {
    try {
      await Promise.race([
        (document as any).fonts.ready,
        new Promise((res) => setTimeout(res, 150)),
      ]);
    } catch {
      // Ignore font readiness errors and fall back to system fonts
    }
  }

  const CARD_WIDTH = 360;
  const CARD_HEIGHT = 512;
  const SCALE = 2; // 720x1024 crisp retina output

  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH * SCALE;
  canvas.height = CARD_HEIGHT * SCALE;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to initialize 2D canvas context");
  }

  ctx.scale(SCALE, SCALE);
  ctx.clearRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  const sansFont =
    '"Space Grotesk", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const monoFont =
    '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';

  // 1. Pastel Card Background (Rounded Rectangle)
  const bgGrad = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
  bgGrad.addColorStop(0, palette.cardBgStart);
  bgGrad.addColorStop(0.52, palette.cardBgMid);
  bgGrad.addColorStop(1, palette.cardBgEnd);

  drawRoundedRect(ctx, 0, 0, CARD_WIDTH, CARD_HEIGHT, 28);
  ctx.fillStyle = bgGrad;
  ctx.fill();

  // 2. Top Brand & Difficulty Header (y = 18..52)
  const headerY = 18;
  const logoSize = 34;

  // Mini 3x3 Sudoku Emblem Badge (Geometric, zero external image CORS risk)
  drawRoundedRect(ctx, 18, headerY, logoSize, logoSize, 10);
  ctx.fillStyle = "#18181B";
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
  ctx.lineWidth = 1;
  for (let i = 1; i <= 2; i++) {
    const offset = (logoSize / 3) * i;
    ctx.beginPath();
    ctx.moveTo(18 + offset, headerY + 5);
    ctx.lineTo(18 + offset, headerY + logoSize - 5);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(18 + 5, headerY + offset);
    ctx.lineTo(18 + logoSize - 5, headerY + offset);
    ctx.stroke();
  }

  // Brand Title & Player Name
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = palette.primaryText;
  ctx.font = `900 13px ${sansFont}`;
  ctx.fillText("SUDOKU SYNC", 60, headerY + 11);

  ctx.fillStyle = palette.secondaryText;
  ctx.font = `700 10.5px ${sansFont}`;
  ctx.fillText(playerName, 60, headerY + 25);

  // Difficulty Pastel Pill (Top Right)
  ctx.font = `900 10px ${sansFont}`;
  const diffTextWidth = ctx.measureText(normalizedDiff).width;
  const diffPillW = Math.max(58, diffTextWidth + 24);
  const diffPillH = 24;
  const diffPillX = CARD_WIDTH - 18 - diffPillW;
  const diffPillY = headerY + (logoSize - diffPillH) / 2;

  drawRoundedRect(ctx, diffPillX, diffPillY, diffPillW, diffPillH, 12);
  ctx.fillStyle = palette.pillBg;
  ctx.fill();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = palette.pillText;
  ctx.fillText(
    normalizedDiff,
    diffPillX + diffPillW / 2,
    diffPillY + diffPillH / 2
  );

  // 3. Status Banner: Timer + Win/Loss Psychological Copy + Status Pill (y = 62..118)
  const bannerX = 18;
  const bannerY = 62;
  const bannerW = CARD_WIDTH - 36;
  const bannerH = 56;

  drawRoundedRect(ctx, bannerX, bannerY, bannerW, bannerH, 18);
  ctx.fillStyle = palette.bannerBg;
  ctx.fill();

  // Timer string
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = palette.primaryText;
  ctx.font = `900 20px ${monoFont}`;
  ctx.fillText(timeStr, bannerX + 14, bannerY + 20);

  // Clean psychological hook message
  ctx.fillStyle = palette.primaryText;
  ctx.font = `800 11px ${sansFont}`;
  ctx.fillText(ctaCopy, bannerX + 14, bannerY + 41);

  // Right Status Pill (Win vs. Loss)
  const statusLabel = didWin
    ? rawState.isNewRecord
      ? "NEW BEST"
      : rawState.bestTime
      ? `BEST ${rawState.bestTime}`
      : `ERR: ${mistakes}/${maxMistakes || 3}`
    : `ERR: ${mistakes || maxMistakes || 3}/${maxMistakes || 3}`;

  ctx.font = `900 9.5px ${sansFont}`;
  const statusTextW = ctx.measureText(statusLabel).width;
  const statusPillW = Math.max(66, statusTextW + 20);
  const statusPillH = 26;
  const statusPillX = bannerX + bannerW - 12 - statusPillW;
  const statusPillY = bannerY + (bannerH - statusPillH) / 2;

  drawRoundedRect(
    ctx,
    statusPillX,
    statusPillY,
    statusPillW,
    statusPillH,
    10
  );
  if (didWin) {
    ctx.fillStyle = rawState.isNewRecord ? "#FEF3C7" : palette.pillBg;
  } else {
    ctx.fillStyle = darkMode ? "rgba(239, 68, 68, 0.22)" : "#FEE2E2";
  }
  ctx.fill();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (didWin) {
    ctx.fillStyle = rawState.isNewRecord ? "#92400E" : palette.pillText;
  } else {
    ctx.fillStyle = darkMode ? "#FCA5A5" : "#B91C1C";
  }
  ctx.fillText(
    statusLabel,
    statusPillX + statusPillW / 2,
    statusPillY + statusPillH / 2
  );

  // 4. 9x9 Sudoku Board (324x324 Square at x = 18, y = 130)
  const boardX = 18;
  const boardY = 130;
  const boardSize = 324;
  const cellSize = boardSize / 9; // Exact 36px per cell

  ctx.save();
  drawRoundedRect(ctx, boardX, boardY, boardSize, boardSize, 16);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.clip();

  const gridCells = resolvedBoard?.grid || [];

  // Cell backgrounds & numbers
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cellX = boardX + c * cellSize;
      const cellY = boardY + r * cellSize;
      const cell = gridCells[r]?.[c];
      const val = cell?.value ?? 0;
      const isClue = Boolean(cell?.isOriginalClue);

      const isMistake =
        val !== 0 &&
        !isClue &&
        ((solutionGrid.length === 9 &&
          solutionGrid[r]?.[c] !== undefined &&
          solutionGrid[r][c] !== val) ||
          hasCellConflict(gridCells, r, c, val));

      // Subtle alternating 3x3 box tint or error cell tint
      const boxParity = (Math.floor(r / 3) + Math.floor(c / 3)) % 2 === 1;
      if (isMistake) {
        ctx.fillStyle = "#FEE2E2";
        ctx.fillRect(cellX, cellY, cellSize, cellSize);
      } else if (boxParity) {
        ctx.fillStyle = palette.cellAltBg;
        ctx.fillRect(cellX, cellY, cellSize, cellSize);
      }

      if (val !== 0) {
        // Exact geometric center of cell — zero baseline shift between fixed and user numbers
        const centerX = cellX + cellSize / 2;
        const centerY = cellY + cellSize / 2;

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = isClue
          ? `700 20px ${sansFont}`
          : `800 21px ${sansFont}`;

        if (isClue) {
          ctx.fillStyle = "#334155";
        } else if (isMistake) {
          ctx.fillStyle = "#ef4444";
        } else {
          ctx.fillStyle = "#3b82f6";
        }

        ctx.fillText(String(val), centerX, centerY);
      } else if (Array.isArray(cell?.notes) && cell.notes.length > 0) {
        // Render 3x3 candidate pencil marks if cell is empty
        const subSize = cellSize / 3;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `600 8.5px ${sansFont}`;
        ctx.fillStyle = palette.noteColor;
        for (const n of cell.notes) {
          if (n >= 1 && n <= 9) {
            const nr = Math.floor((n - 1) / 3);
            const nc = (n - 1) % 3;
            const nx = cellX + nc * subSize + subSize / 2;
            const ny = cellY + nr * subSize + subSize / 2;
            ctx.fillText(String(n), nx, ny);
          }
        }
      }
    }
  }

  // Thin 1px cell grid lines
  ctx.strokeStyle = palette.gridThinLine;
  ctx.lineWidth = 1;
  for (let i = 1; i < 9; i++) {
    if (i % 3 === 0) continue;
    const pos = i * cellSize;
    ctx.beginPath();
    ctx.moveTo(boardX + pos, boardY);
    ctx.lineTo(boardX + pos, boardY + boardSize);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(boardX, boardY + pos);
    ctx.lineTo(boardX + boardSize, boardY + pos);
    ctx.stroke();
  }

  // Thick 2px 3x3 box lines
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 2;
  for (let i = 3; i < 9; i += 3) {
    const pos = i * cellSize;
    ctx.beginPath();
    ctx.moveTo(boardX + pos, boardY);
    ctx.lineTo(boardX + pos, boardY + boardSize);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(boardX, boardY + pos);
    ctx.lineTo(boardX + boardSize, boardY + pos);
    ctx.stroke();
  }

  ctx.restore();

  // Outer rounded board border
  drawRoundedRect(ctx, boardX, boardY, boardSize, boardSize, 16);
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Rotated Fast-Solve Sticker Badge ONLY on eligible Win (strictly hidden on Loss)
  if (didWin && stickerBadge.tier !== "none" && stickerBadge.label) {
    ctx.save();
    ctx.font = `900 9.5px ${sansFont}`;
    const stickerW = ctx.measureText(stickerBadge.label).width + 24;
    const stickerH = 22;
    const stickerCenterX = boardX + boardSize - stickerW / 2 - 4;
    const stickerCenterY = boardY + 2;

    ctx.translate(stickerCenterX, stickerCenterY);
    ctx.rotate((-2 * Math.PI) / 180);

    drawRoundedRect(
      ctx,
      -stickerW / 2,
      -stickerH / 2,
      stickerW,
      stickerH,
      11
    );
    ctx.fillStyle = palette.stickerBg;
    ctx.fill();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = palette.stickerText;
    ctx.fillText(stickerBadge.label, 0, 0);
    ctx.restore();
  }

  // 5. Clean Single-Line Footer Pill (y = 466..498)
  const footerX = 18;
  const footerY = 466;
  const footerW = CARD_WIDTH - 36;
  const footerH = 30;

  drawRoundedRect(ctx, footerX, footerY, footerW, footerH, 12);
  ctx.fillStyle = palette.pillBg;
  ctx.fill();

  const footerText = `sudokusync.com | Room Code: ${extractedRoomCode}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = palette.pillText;
  ctx.font = `800 10.5px ${monoFont}`;
  ctx.fillText(footerText, footerX + footerW / 2, footerY + footerH / 2);

  return canvas.toDataURL("image/png");
}

export default generateShareCanvas;
