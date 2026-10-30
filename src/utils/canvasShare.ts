import { SudokuBoardState } from "../components/game/SudokuBoard";

export type ShareDifficulty = "EASY" | "MEDIUM" | "HARD" | "EXPERT" | string;

export interface ShareCanvasGameState {
  boardState?: SudokuBoardState | null;
  grid?: {
    value: number;
    isOriginalClue: boolean;
    notes?: number[] | Set<number>;
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
  surfaceCardBg: string;
  surfaceCardBorder: string;
  pillBg: string;
  pillText: string;
  pillBorder: string;
  stickerBg: string;
  stickerText: string;
  stickerBorder: string;
  stickerShadow: string;
  boardBaseBg: string;
  cellTintBg: string;
  crosshairSiblingBg: string;
  activeCellBg: string;
  identicalCellBg: string;
  gridThinLine: string;
  gridThickLine: string;
  primaryText: string;
  secondaryText: string;
  timerColor: string;
  errColor: string;
  clueColor: string;
  userColor: string;
  errorColor: string;
  errorCellBg: string;
  errorSelectedBg: string;
  noteColor: string;
  footerBg: string;
  footerBorder: string;
  footerText: string;
  footerAccent: string;
}

/**
 * Exact pastel & dark color science tokens mirrored from `App.tsx` and `SudokuBoard.tsx`.
 */
const LIGHT_THEMES: Record<string, ShareCanvasThemePalette> = {
  EASY: {
    cardBgStart: "#F2FBF7",
    cardBgMid: "#FDFBF7",
    cardBgEnd: "#E6F8EF",
    surfaceCardBg: "#FFFFFF",
    surfaceCardBorder: "rgba(6, 95, 70, 0.10)",
    pillBg: "#D1FAE5",
    pillText: "#065F46",
    pillBorder: "rgba(6, 95, 70, 0.16)",
    stickerBg: "#ECFDF5",
    stickerText: "#047857",
    stickerBorder: "#059669",
    stickerShadow: "rgba(0, 0, 0, 0.06)",
    boardBaseBg: "#FFFFFF",
    cellTintBg: "rgba(34, 197, 94, 0.12)",
    crosshairSiblingBg: "#FFFFFF",
    activeCellBg: "#86EFAC",
    identicalCellBg: "#86EFAC",
    gridThinLine: "rgba(6, 95, 70, 0.20)",
    gridThickLine: "rgba(6, 95, 70, 0.55)",
    primaryText: "#1C1917",
    secondaryText: "#78716C",
    timerColor: "#2B6CB0",
    errColor: "#9D174D",
    clueColor: "#1C1917",
    userColor: "#2B6CB0",
    errorColor: "#BE123C",
    errorCellBg: "#FEE2E2",
    errorSelectedBg: "#FCA5A5",
    noteColor: "#57534E",
    footerBg: "#FFFFFF",
    footerBorder: "rgba(6, 95, 70, 0.14)",
    footerText: "#1C1917",
    footerAccent: "#065F46",
  },
  MEDIUM: {
    cardBgStart: "#FFFDF0",
    cardBgMid: "#FDFBF7",
    cardBgEnd: "#FEF9C3",
    surfaceCardBg: "#FFFFFF",
    surfaceCardBorder: "rgba(133, 77, 14, 0.12)",
    pillBg: "#FFF99D",
    pillText: "#854D0E",
    pillBorder: "rgba(133, 77, 14, 0.18)",
    stickerBg: "#ECFDF5",
    stickerText: "#047857",
    stickerBorder: "#059669",
    stickerShadow: "rgba(0, 0, 0, 0.06)",
    boardBaseBg: "#FFFFFF",
    cellTintBg: "rgba(234, 179, 8, 0.12)",
    crosshairSiblingBg: "#FFFFFF",
    activeCellBg: "#FCD34D",
    identicalCellBg: "#FCD34D",
    gridThinLine: "rgba(133, 77, 14, 0.20)",
    gridThickLine: "rgba(133, 77, 14, 0.55)",
    primaryText: "#1C1917",
    secondaryText: "#78716C",
    timerColor: "#2B6CB0",
    errColor: "#9D174D",
    clueColor: "#1C1917",
    userColor: "#2B6CB0",
    errorColor: "#BE123C",
    errorCellBg: "#FEE2E2",
    errorSelectedBg: "#FCA5A5",
    noteColor: "#57534E",
    footerBg: "#FFFFFF",
    footerBorder: "rgba(133, 77, 14, 0.14)",
    footerText: "#1C1917",
    footerAccent: "#854D0E",
  },
  HARD: {
    cardBgStart: "#FAF5FF",
    cardBgMid: "#FDFBF7",
    cardBgEnd: "#F3E8FF",
    surfaceCardBg: "#FFFFFF",
    surfaceCardBorder: "rgba(107, 33, 168, 0.10)",
    pillBg: "#F3E8FF",
    pillText: "#6B21A8",
    pillBorder: "rgba(107, 33, 168, 0.16)",
    stickerBg: "#ECFDF5",
    stickerText: "#047857",
    stickerBorder: "#059669",
    stickerShadow: "rgba(0, 0, 0, 0.06)",
    boardBaseBg: "#FFFFFF",
    cellTintBg: "rgba(168, 85, 247, 0.12)",
    crosshairSiblingBg: "#FFFFFF",
    activeCellBg: "#D8B4FE",
    identicalCellBg: "#D8B4FE",
    gridThinLine: "rgba(107, 33, 168, 0.20)",
    gridThickLine: "rgba(107, 33, 168, 0.55)",
    primaryText: "#1C1917",
    secondaryText: "#78716C",
    timerColor: "#2B6CB0",
    errColor: "#9D174D",
    clueColor: "#1C1917",
    userColor: "#2B6CB0",
    errorColor: "#BE123C",
    errorCellBg: "#FEE2E2",
    errorSelectedBg: "#FCA5A5",
    noteColor: "#57534E",
    footerBg: "#FFFFFF",
    footerBorder: "rgba(107, 33, 168, 0.14)",
    footerText: "#1C1917",
    footerAccent: "#6B21A8",
  },
  EXPERT: {
    cardBgStart: "#FFF1F2",
    cardBgMid: "#FDFBF7",
    cardBgEnd: "#FFE4E6",
    surfaceCardBg: "#FFFFFF",
    surfaceCardBorder: "rgba(157, 23, 77, 0.10)",
    pillBg: "#FFE4E6",
    pillText: "#9D174D",
    pillBorder: "rgba(157, 23, 77, 0.16)",
    stickerBg: "#ECFDF5",
    stickerText: "#047857",
    stickerBorder: "#059669",
    stickerShadow: "rgba(0, 0, 0, 0.06)",
    boardBaseBg: "#FFFFFF",
    cellTintBg: "rgba(244, 63, 94, 0.12)",
    crosshairSiblingBg: "#FFFFFF",
    activeCellBg: "#F9A8D4",
    identicalCellBg: "#F9A8D4",
    gridThinLine: "rgba(157, 23, 77, 0.20)",
    gridThickLine: "rgba(157, 23, 77, 0.55)",
    primaryText: "#1C1917",
    secondaryText: "#78716C",
    timerColor: "#2B6CB0",
    errColor: "#9D174D",
    clueColor: "#1C1917",
    userColor: "#2B6CB0",
    errorColor: "#BE123C",
    errorCellBg: "#FEE2E2",
    errorSelectedBg: "#FCA5A5",
    noteColor: "#57534E",
    footerBg: "#FFFFFF",
    footerBorder: "rgba(157, 23, 77, 0.14)",
    footerText: "#1C1917",
    footerAccent: "#9D174D",
  },
};

const DARK_THEMES: Record<string, ShareCanvasThemePalette> = {
  EASY: {
    cardBgStart: "#181D1A",
    cardBgMid: "#222620",
    cardBgEnd: "#14241E",
    surfaceCardBg: "rgba(24, 24, 27, 0.85)",
    surfaceCardBorder: "rgba(16, 185, 129, 0.22)",
    pillBg: "#022c22",
    pillText: "#d1fae5",
    pillBorder: "rgba(16, 185, 129, 0.30)",
    stickerBg: "#064E3B",
    stickerText: "#ECFDF5",
    stickerBorder: "#059669",
    stickerShadow: "rgba(0, 0, 0, 0.06)",
    boardBaseBg: "#18181B",
    cellTintBg: "#18181B",
    crosshairSiblingBg: "#051f18",
    activeCellBg: "#0e8365",
    identicalCellBg: "#0e8365",
    gridThinLine: "#054031",
    gridThickLine: "#0b6b52",
    primaryText: "#F8FAFC",
    secondaryText: "#A8A29E",
    timerColor: "#38BDF8",
    errColor: "#F472B6",
    clueColor: "#F8FAFC",
    userColor: "#38BDF8",
    errorColor: "#FDA4AF",
    errorCellBg: "rgba(76, 5, 25, 0.45)",
    errorSelectedBg: "#881337",
    noteColor: "#94A3B8",
    footerBg: "rgba(24, 24, 27, 0.90)",
    footerBorder: "rgba(16, 185, 129, 0.25)",
    footerText: "#F8FAFC",
    footerAccent: "#6EE7B7",
  },
  MEDIUM: {
    cardBgStart: "#221E18",
    cardBgMid: "#26231D",
    cardBgEnd: "#291D10",
    surfaceCardBg: "rgba(24, 24, 27, 0.85)",
    surfaceCardBorder: "rgba(245, 158, 11, 0.22)",
    pillBg: "#451a03",
    pillText: "#fef08a",
    pillBorder: "rgba(245, 158, 11, 0.30)",
    stickerBg: "#064E3B",
    stickerText: "#ECFDF5",
    stickerBorder: "#059669",
    stickerShadow: "rgba(0, 0, 0, 0.06)",
    boardBaseBg: "#18181B",
    cellTintBg: "#18181B",
    crosshairSiblingBg: "#1f1403",
    activeCellBg: "#713f12",
    identicalCellBg: "#713f12",
    gridThinLine: "#532004",
    gridThickLine: "#7c3207",
    primaryText: "#F8FAFC",
    secondaryText: "#A8A29E",
    timerColor: "#38BDF8",
    errColor: "#F472B6",
    clueColor: "#F8FAFC",
    userColor: "#38BDF8",
    errorColor: "#FDA4AF",
    errorCellBg: "rgba(76, 5, 25, 0.45)",
    errorSelectedBg: "#881337",
    noteColor: "#94A3B8",
    footerBg: "rgba(24, 24, 27, 0.90)",
    footerBorder: "rgba(245, 158, 11, 0.25)",
    footerText: "#F8FAFC",
    footerAccent: "#FDE047",
  },
  HARD: {
    cardBgStart: "#1E1926",
    cardBgMid: "#221F28",
    cardBgEnd: "#241436",
    surfaceCardBg: "rgba(24, 24, 27, 0.85)",
    surfaceCardBorder: "rgba(168, 85, 247, 0.22)",
    pillBg: "#2e1065",
    pillText: "#e9d5ff",
    pillBorder: "rgba(168, 85, 247, 0.30)",
    stickerBg: "#064E3B",
    stickerText: "#ECFDF5",
    stickerBorder: "#059669",
    stickerShadow: "rgba(0, 0, 0, 0.06)",
    boardBaseBg: "#18181B",
    cellTintBg: "#18181B",
    crosshairSiblingBg: "#160c2b",
    activeCellBg: "#581db8",
    identicalCellBg: "#581db8",
    gridThinLine: "#31126b",
    gridThickLine: "#4c1d95",
    primaryText: "#F8FAFC",
    secondaryText: "#A8A29E",
    timerColor: "#38BDF8",
    errColor: "#F472B6",
    clueColor: "#F8FAFC",
    userColor: "#38BDF8",
    errorColor: "#FDA4AF",
    errorCellBg: "rgba(76, 5, 25, 0.45)",
    errorSelectedBg: "#881337",
    noteColor: "#94A3B8",
    footerBg: "rgba(24, 24, 27, 0.90)",
    footerBorder: "rgba(168, 85, 247, 0.25)",
    footerText: "#F8FAFC",
    footerAccent: "#D8B4FE",
  },
  EXPERT: {
    cardBgStart: "#26171C",
    cardBgMid: "#261E21",
    cardBgEnd: "#31101B",
    surfaceCardBg: "rgba(24, 24, 27, 0.85)",
    surfaceCardBorder: "rgba(244, 63, 94, 0.22)",
    pillBg: "#4c0519",
    pillText: "#fecdd3",
    pillBorder: "rgba(244, 63, 94, 0.30)",
    stickerBg: "#064E3B",
    stickerText: "#ECFDF5",
    stickerBorder: "#059669",
    stickerShadow: "rgba(0, 0, 0, 0.06)",
    boardBaseBg: "#18181B",
    cellTintBg: "#18181B",
    crosshairSiblingBg: "#210811",
    activeCellBg: "#881337",
    identicalCellBg: "#881337",
    gridThinLine: "#58061d",
    gridThickLine: "#881337",
    primaryText: "#F8FAFC",
    secondaryText: "#A8A29E",
    timerColor: "#38BDF8",
    errColor: "#F472B6",
    clueColor: "#F8FAFC",
    userColor: "#38BDF8",
    errorColor: "#FDA4AF",
    errorCellBg: "rgba(76, 5, 25, 0.45)",
    errorSelectedBg: "#881337",
    noteColor: "#94A3B8",
    footerBg: "rgba(24, 24, 27, 0.90)",
    footerBorder: "rgba(244, 63, 94, 0.25)",
    footerText: "#F8FAFC",
    footerAccent: "#FDA4AF",
  },
};

/**
 * Raw SVG XML Icon Generators (Zero CORS, inline UTF-8 Data URL rendering)
 */
const getEmblemSvg = (accentColor: string): string => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" fill="none">
  <rect width="36" height="36" rx="10" fill="#121212"/>
  <rect x="5.5" y="5.5" width="7" height="7" rx="1.8" fill="${accentColor}"/>
  <rect x="14.5" y="5.5" width="7" height="7" rx="1.8" fill="#27272A"/>
  <rect x="23.5" y="5.5" width="7" height="7" rx="1.8" fill="#3F3F46"/>
  <rect x="5.5" y="14.5" width="7" height="7" rx="1.8" fill="#27272A"/>
  <rect x="14.5" y="14.5" width="7" height="7" rx="1.8" fill="${accentColor}"/>
  <rect x="23.5" y="14.5" width="7" height="7" rx="1.8" fill="#27272A"/>
  <rect x="5.5" y="23.5" width="7" height="7" rx="1.8" fill="#3F3F46"/>
  <rect x="14.5" y="23.5" width="7" height="7" rx="1.8" fill="#27272A"/>
  <rect x="23.5" y="23.5" width="7" height="7" rx="1.8" fill="${accentColor}"/>
</svg>`;

const getSparklesSvg = (color: string): string => `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
  <path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>
</svg>`;

const getClockSvg = (color: string): string => `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10"/>
  <polyline points="12 6 12 12 16 14"/>
</svg>`;

const getTrophySvg = (color: string): string => `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
  <path d="M4 22h16"/>
  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
  <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
</svg>`;

const getZapSvg = (color: string): string => `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
</svg>`;

const getStarSvg = (color: string): string => `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
</svg>`;

const getEyeSvg = (color: string): string => `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/>
  <circle cx="12" cy="12" r="3"/>
</svg>`;

const getShieldCheckSvg = (color: string): string => `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
  <path d="m9 12 2 2 4-4"/>
</svg>`;

const getAlertCircleSvg = (color: string): string => `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10"/>
  <line x1="12" x2="12" y1="8" y2="12"/>
  <line x1="12" x2="12.01" y1="16" y2="16"/>
</svg>`;

const getFlameSvg = (color: string): string => `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
</svg>`;

const getGlobeSvg = (color: string): string => `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10"/>
  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
  <path d="M2 12h20"/>
</svg>`;

const getHashSvg = (color: string): string => `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="4" x2="20" y1="9" y2="9"/>
  <line x1="4" x2="20" y1="15" y2="15"/>
  <line x1="10" x2="8" y1="3" y2="21"/>
  <line x1="16" x2="14" y1="3" y2="21"/>
</svg>`;

/**
 * Converts a raw SVG XML string into a UTF-8 Data URL, loads it into an Image,
 * and draws it onto the 2D canvas without triggering any CORS security errors.
 */
export async function drawSvg(
  ctx: CanvasRenderingContext2D,
  svgString: string,
  x: number,
  y: number,
  size: number
): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, x, y, size, size);
      resolve();
    };
    img.onerror = () => {
      resolve();
    };
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
      svgString.trim()
    )}`;
  });
}

const drawLogoOrEmblem = async (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  accentColor: string
): Promise<void> => {
  const loadedLogo = await new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = "/logo.png";
  });

  if (loadedLogo) {
    ctx.save();
    drawRoundedRect(ctx, x, y, size, size, 9);
    ctx.fillStyle = "#121212";
    ctx.fill();
    ctx.clip();
    ctx.drawImage(loadedLogo, x, y, size, size);
    ctx.restore();
  } else {
    await drawSvg(ctx, getEmblemSvg(accentColor), x, y, size);
  }
};

export const evaluateBoardDidWin = (
  boardState: SudokuBoardState | null,
  isWonProp?: boolean
): boolean => {
  const mistakes = boardState?.currentMistakesCount ?? 0;
  const maxMistakes = boardState?.maxMistakesLimit ?? 3;
  const hitMaxMistakes =
    maxMistakes === 0
      ? mistakes > 0
      : maxMistakes < 999 && mistakes >= maxMistakes;

  if (hitMaxMistakes) {
    return false;
  }

  const isGridCompletelyFilled = Boolean(
    boardState?.grid &&
      boardState.grid.length === 9 &&
      boardState.grid.every(
        (row) =>
          Array.isArray(row) &&
          row.length === 9 &&
          row.every((cell) => cell && cell.value !== 0)
      )
  );

  if (!isGridCompletelyFilled) {
    return false;
  }

  return isWonProp !== undefined ? Boolean(isWonProp) : true;
};

export type StickerBadgeTier =
  | "record"
  | "excellent"
  | "great"
  | "solved"
  | "defeat_close"
  | "defeat_freeze"
  | "defeat_backup"
  | "none";

export const evaluatePerformanceSticker = (
  difficulty: string,
  seconds: number,
  isWon: boolean = true,
  isNewRecord: boolean = false,
  filledCellsCount: number = 0
): { label: string; tier: StickerBadgeTier } => {
  if (!isWon) {
    if (filledCellsCount >= 64) {
      return { label: "SO CLOSE!", tier: "defeat_close" };
    }
    if (filledCellsCount >= 40) {
      return { label: "BRAIN FREEZE!", tier: "defeat_freeze" };
    }
    return { label: "NEED BACKUP!", tier: "defeat_backup" };
  }

  if (isNewRecord) {
    return { label: "NEW RECORD!", tier: "record" };
  }

  const diff = String(difficulty || "EASY").toUpperCase();
  const thresholds: Record<string, { excellent: number; great: number }> = {
    EASY: { excellent: 120, great: 240 },
    MEDIUM: { excellent: 210, great: 390 },
    HARD: { excellent: 330, great: 600 },
    EXPERT: { excellent: 480, great: 900 },
  };
  const { excellent, great } = thresholds[diff] || thresholds.EASY;

  if (seconds > 0 && seconds <= excellent) {
    return { label: "EXCELLENT TIME", tier: "excellent" };
  }
  if (seconds > 0 && seconds <= great) {
    return { label: "GREAT TIME", tier: "great" };
  }
  return { label: "SOLVED", tier: "solved" };
};

export const extractRoomCodeFromChallenge = (
  challengeInput?: string,
  roomCode?: string,
  boardState?: SudokuBoardState | null
): string => {
  if (roomCode && String(roomCode).trim().length > 0) {
    const cleanRoom = String(roomCode).trim();
    const matchSudoku = cleanRoom.match(/SUDOKU-([A-Z0-9]+)-/i);
    if (matchSudoku && matchSudoku[1]) return matchSudoku[1].toUpperCase();
    return cleanRoom.toUpperCase();
  }

  if (challengeInput) {
    const matchSudoku = challengeInput.match(/SUDOKU-([A-Z0-9]+)-/i);
    if (matchSudoku && matchSudoku[1]) {
      return matchSudoku[1].toUpperCase();
    }
    const matchQuery = challengeInput.match(/[?&]challenge=([^&#]+)/i);
    if (matchQuery && matchQuery[1]) {
      const token = decodeURIComponent(matchQuery[1]);
      const innerMatch = token.match(/SUDOKU-([A-Z0-9]+)-/i);
      if (innerMatch && innerMatch[1]) return innerMatch[1].toUpperCase();
      return token;
    }
  }

  if (boardState?.seed) {
    return String(boardState.seed).padStart(6, "0").slice(-6).toUpperCase();
  }

  return "849201";
};

export interface BuiltChallengeUrlInfo {
  fullUrl: string;
  displayUrl: string;
  extractedRoomCode: string;
  challengeId: string;
}

export function buildFreshChallengeUrl(challengeId: string): string;
export function buildFreshChallengeUrl(
  boardState: SudokuBoardState | null,
  difficulty: string,
  roomCode?: string
): BuiltChallengeUrlInfo;
export function buildFreshChallengeUrl(
  boardStateOrChallengeId: SudokuBoardState | string | null,
  difficulty?: string,
  roomCode?: string
): string | BuiltChallengeUrlInfo {
  const origin =
    typeof window !== "undefined" &&
    window.location.origin &&
    !/localhost|127\.0\.0\.1|capacitor:\/\//i.test(window.location.origin)
      ? window.location.origin.replace(/\/+$/, "")
      : "https://sudokusync.com";

  if (typeof boardStateOrChallengeId === "string") {
    const rawToken = boardStateOrChallengeId.trim();
    if (!rawToken) {
      return `${origin}/?challenge=SUDOKU-849201-EASY-M3-H3-T1`;
    }
    if (/^https?:\/\//i.test(rawToken)) {
      return rawToken;
    }
    return `${origin}/?challenge=${rawToken}`;
  }

  const boardState = boardStateOrChallengeId;
  const diff = String(
    difficulty || boardState?.difficulty || "EASY"
  ).toUpperCase();
  const seed = extractRoomCodeFromChallenge(undefined, roomCode, boardState);
  const maxMistakes = boardState?.maxMistakesLimit ?? 3;
  const hintLimit = (boardState as any)?.hintLimit ?? 3;
  const challengeId = `SUDOKU-${seed}-${diff}-M${maxMistakes}-H${hintLimit}-T1`;

  return {
    fullUrl: `${origin}/?challenge=${challengeId}`,
    displayUrl: `sudokusync.com | Room Code: ${seed}`,
    extractedRoomCode: seed,
    challengeId,
  };
}

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
 * Draws text at exact geometric vertical & horizontal center of `(centerX, centerY)`
 * using `actualBoundingBoxAscent` and `actualBoundingBoxDescent` compensation
 * so custom fonts (`Space Grotesk`, `Patrick Hand`, `JetBrains Mono`) share the exact same center.
 */
const drawCenteredText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  centerY: number
) => {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const metrics = ctx.measureText(text);
  if (
    typeof metrics.actualBoundingBoxAscent === "number" &&
    typeof metrics.actualBoundingBoxDescent === "number"
  ) {
    const dy =
      (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2;
    ctx.fillText(text, centerX, centerY + dy);
  } else {
    ctx.fillText(text, centerX, centerY);
  }
};

const drawLeftMiddleText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  leftX: number,
  centerY: number
) => {
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  const metrics = ctx.measureText(text);
  if (
    typeof metrics.actualBoundingBoxAscent === "number" &&
    typeof metrics.actualBoundingBoxDescent === "number"
  ) {
    const dy =
      (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2;
    ctx.fillText(text, leftX, centerY + dy);
  } else {
    ctx.fillText(text, leftX, centerY);
  }
};

/**
 * Pure HTML5 2D Canvas generator for Sudoku Sync Share Cards.
 * - Vector-styled pastel achievement stickers (-2.5deg tilt, 1.5px stroke, Mint/Emerald on win, Rose/Coral on defeat)
 * - Clean Hero Solve Timer + app-native flat pastel Hook Pill
 * - Enlarged, balanced grid digits (~25px Space Grotesk clues, ~29px Patrick Hand user inputs)
 * - Dual-tone "SUDOKU SYNC" brand header with active accent blue (#2B6CB0 / #38BDF8)
 */
export async function generateShareCanvas(
  gameState: ShareCanvasGameState | SudokuBoardState | null,
  challengeId?: string,
  themeColor?: string
): Promise<string> {
  // 1. Explicitly load and await custom web fonts in their exact weights & sizes
  if (typeof document !== "undefined" && document.fonts) {
    try {
      await Promise.allSettled([
        document.fonts.load('400 25px "Space Grotesk"'),
        document.fonts.load('600 11px "Space Grotesk"'),
        document.fonts.load('700 13px "Space Grotesk"'),
        document.fonts.load('400 29px "Patrick Hand"'),
        document.fonts.load('700 19px "JetBrains Mono"'),
        document.fonts.load('700 11px "JetBrains Mono"'),
      ]);
      await document.fonts.ready;
    } catch {
      // Fallback gracefully if font loader rejects
    }
  }

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

  const gridCells = resolvedBoard?.grid || [];
  let filledCellsCount = 0;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if ((gridCells[r]?.[c]?.value ?? 0) !== 0) {
        filledCellsCount++;
      }
    }
  }

  const effectiveSeconds =
    typeof rawState.sessionSeconds === "number" && rawState.sessionSeconds > 0
      ? rawState.sessionSeconds
      : parseFormattedTimeToSeconds(timeStr);

  const stickerBadge = evaluatePerformanceSticker(
    normalizedDiff,
    effectiveSeconds,
    didWin,
    Boolean(rawState.isNewRecord && didWin),
    filledCellsCount
  );

  const extractedRoomCode = extractRoomCodeFromChallenge(
    challengeId,
    rawState.roomCode,
    resolvedBoard
  );

  const ctaCopy = didWin
    ? `I beat this in ${timeStr}! Beat my time!`
    : "Stuck! Can you help me finish this?";

  const CARD_WIDTH = 360;
  const CARD_HEIGHT = 532;
  const SCALE = 2; // 720x1064 ultra-crisp retina output

  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH * SCALE;
  canvas.height = CARD_HEIGHT * SCALE;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to initialize 2D canvas context");
  }

  ctx.scale(SCALE, SCALE);
  ctx.clearRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  const appSansFont =
    '"Space Grotesk", "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif';
  const appHandwritingFont =
    '"Patrick Hand", "Architects Daughter", "Kalam", cursive, sans-serif';
  const appMonoFont =
    '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';

  // 1. Pastel Card Background (Rounded 28px)
  const bgGrad = ctx.createLinearGradient(0, 0, CARD_WIDTH * 0.85, CARD_HEIGHT);
  bgGrad.addColorStop(0, palette.cardBgStart);
  bgGrad.addColorStop(0.5, palette.cardBgMid);
  bgGrad.addColorStop(1, palette.cardBgEnd);

  drawRoundedRect(ctx, 0, 0, CARD_WIDTH, CARD_HEIGHT, 28);
  ctx.fillStyle = bgGrad;
  ctx.fill();

  // Subtle inner card border for crisp framing
  drawRoundedRect(ctx, 0.75, 0.75, CARD_WIDTH - 1.5, CARD_HEIGHT - 1.5, 27.5);
  ctx.strokeStyle = palette.surfaceCardBorder;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 2. Top Brand Row: Emblem + Dual-Tone "SUDOKU SYNC" + Player Handle + Difficulty Pastel Pill (y = 16..48)
  const headerY = 16;
  const logoSize = 32;

  await drawLogoOrEmblem(ctx, 18, headerY, logoSize, palette.activeCellBg);

  ctx.font = `700 13px ${appSansFont}`;
  const sudokuWord = "SUDOKU ";
  const sudokuWordW = ctx.measureText(sudokuWord).width;
  ctx.fillStyle = palette.primaryText;
  drawLeftMiddleText(ctx, sudokuWord, 58, headerY + 10);

  ctx.fillStyle = palette.timerColor; // Active theme accent blue (#2B6CB0 / #38BDF8)
  drawLeftMiddleText(ctx, "SYNC", 58 + sudokuWordW, headerY + 10);

  ctx.fillStyle = palette.secondaryText;
  ctx.font = `500 10.5px ${appSansFont}`;
  drawLeftMiddleText(ctx, playerName, 58, headerY + 24);

  // Difficulty Pill (Matches live difficulty button palette from App.tsx)
  ctx.font = `700 10px ${appMonoFont}`;
  const diffTextW = ctx.measureText(normalizedDiff).width;
  const diffIconSize = 11.5;
  const diffGap = 4.5;
  const diffContentW = diffIconSize + diffGap + diffTextW;
  const diffPillW = Math.max(68, diffContentW + 22);
  const diffPillH = 25;
  const diffPillX = CARD_WIDTH - 18 - diffPillW;
  const diffPillY = headerY + (logoSize - diffPillH) / 2;

  drawRoundedRect(ctx, diffPillX, diffPillY, diffPillW, diffPillH, 12.5);
  ctx.fillStyle = palette.pillBg;
  ctx.fill();
  ctx.strokeStyle = palette.pillBorder;
  ctx.lineWidth = 1;
  ctx.stroke();

  const diffStartX = diffPillX + (diffPillW - diffContentW) / 2;
  const diffCenterY = diffPillY + diffPillH / 2;
  await drawSvg(
    ctx,
    getSparklesSvg(palette.pillText),
    diffStartX,
    diffCenterY - diffIconSize / 2,
    diffIconSize
  );
  ctx.fillStyle = palette.pillText;
  ctx.font = `700 10px ${appMonoFont}`;
  drawLeftMiddleText(
    ctx,
    normalizedDiff,
    diffStartX + diffIconSize + diffGap,
    diffCenterY
  );

  // 3. Vector HUD & App-Native Flat Pastel Hook Pill (y = 56..124)
  const bannerX = 18;
  const bannerY = 56;
  const bannerW = CARD_WIDTH - 36;
  const bannerH = 66;

  ctx.save();
  ctx.shadowColor = darkMode
    ? "rgba(0, 0, 0, 0.25)"
    : "rgba(28, 25, 23, 0.04)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 3;
  drawRoundedRect(ctx, bannerX, bannerY, bannerW, bannerH, 16);
  ctx.fillStyle = palette.surfaceCardBg;
  ctx.fill();
  ctx.restore();

  drawRoundedRect(ctx, bannerX, bannerY, bannerW, bannerH, 16);
  ctx.strokeStyle = palette.surfaceCardBorder;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Hero Solve Timer Row: Clean, bold tabular timer framed alongside the SVG clock icon
  const clockSize = 15.5;
  const timerRowY = bannerY + 20;
  await drawSvg(
    ctx,
    getClockSvg(palette.timerColor),
    bannerX + 14,
    timerRowY - clockSize / 2,
    clockSize
  );

  ctx.fillStyle = palette.timerColor;
  ctx.font = `700 19px ${appMonoFont}`;
  drawLeftMiddleText(ctx, timeStr, bannerX + 14 + clockSize + 6.5, timerRowY);

  // Right Status Pill: ERR / Best Time vector badge
  const statusLabel = didWin
    ? rawState.bestTime
      ? `BEST ${rawState.bestTime}`
      : `ERR: ${mistakes}/${maxMistakes || 3}`
    : `ERR: ${mistakes || maxMistakes || 3}/${maxMistakes || 3}`;

  const statusPillBg = didWin
    ? palette.pillBg
    : darkMode
    ? "rgba(244, 63, 94, 0.18)"
    : "#FFF1F2";

  const statusPillBorder = didWin
    ? palette.pillBorder
    : darkMode
    ? "rgba(244, 63, 94, 0.35)"
    : "#FECDD3";

  const statusPillColor = didWin
    ? palette.pillText
    : darkMode
    ? "#FDA4AF"
    : "#BE123C";

  ctx.font = `700 9.5px ${appMonoFont}`;
  const statusTextW = ctx.measureText(statusLabel).width;
  const statusIconSize = 12;
  const statusGap = 4;
  const statusContentW = statusIconSize + statusGap + statusTextW;
  const statusPillW = Math.max(76, statusContentW + 18);
  const statusPillH = 23;
  const statusPillX = bannerX + bannerW - 12 - statusPillW;
  const statusPillY = timerRowY - statusPillH / 2;

  drawRoundedRect(
    ctx,
    statusPillX,
    statusPillY,
    statusPillW,
    statusPillH,
    statusPillH / 2
  );
  ctx.fillStyle = statusPillBg;
  ctx.fill();
  ctx.strokeStyle = statusPillBorder;
  ctx.lineWidth = 1;
  ctx.stroke();

  const statusStartX = statusPillX + (statusPillW - statusContentW) / 2;
  const statusCenterY = statusPillY + statusPillH / 2;
  const statusSvg = didWin
    ? getShieldCheckSvg(statusPillColor)
    : getAlertCircleSvg(statusPillColor);

  await drawSvg(
    ctx,
    statusSvg,
    statusStartX,
    statusCenterY - statusIconSize / 2,
    statusIconSize
  );
  ctx.fillStyle = statusPillColor;
  ctx.font = `700 9.5px ${appMonoFont}`;
  drawLeftMiddleText(
    ctx,
    statusLabel,
    statusStartX + statusIconSize + statusGap,
    statusCenterY
  );

  // Viral Hook Message enclosed inside an app-native flat pastel pill (rounded-full, subtle border, high contrast)
  const hookPillX = bannerX + 10;
  const hookPillY = bannerY + 36;
  const hookPillW = bannerW - 20;
  const hookPillH = 23;

  const hookPillBg = didWin
    ? darkMode
      ? "rgba(6, 78, 59, 0.45)"
      : "#ECFDF5"
    : darkMode
    ? "rgba(76, 5, 25, 0.45)"
    : "#FFF1F2";

  const hookPillBorder = didWin
    ? darkMode
      ? "rgba(16, 185, 129, 0.35)"
      : "rgba(5, 150, 105, 0.22)"
    : darkMode
    ? "rgba(244, 63, 94, 0.35)"
    : "rgba(244, 63, 94, 0.22)";

  const hookPillText = didWin
    ? darkMode
      ? "#D1FAE5"
      : "#065F46"
    : darkMode
    ? "#FECDD3"
    : "#9F1239";

  drawRoundedRect(
    ctx,
    hookPillX,
    hookPillY,
    hookPillW,
    hookPillH,
    hookPillH / 2
  );
  ctx.fillStyle = hookPillBg;
  ctx.fill();
  ctx.strokeStyle = hookPillBorder;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = hookPillText;
  ctx.font = `600 10.5px ${appSansFont}`;
  drawCenteredText(
    ctx,
    ctaCopy,
    hookPillX + hookPillW / 2,
    hookPillY + hookPillH / 2
  );

  // 4. Authentic 9x9 Pastel Sudoku Board (324x324 Square at x = 18, y = 138)
  const boardX = 18;
  const boardY = 138;
  const boardSize = 324;
  const cellSize = boardSize / 9; // Exact 36px per cell

  const selectedRow =
    !didWin && typeof resolvedBoard?.selectedRow === "number"
      ? resolvedBoard.selectedRow
      : null;
  const selectedCol =
    !didWin && typeof resolvedBoard?.selectedCol === "number"
      ? resolvedBoard.selectedCol
      : null;
  const selectedVal =
    selectedRow !== null && selectedCol !== null
      ? gridCells[selectedRow]?.[selectedCol]?.value ?? 0
      : 0;

  // Soft board elevation shadow matching SudokuBoard.tsx
  ctx.save();
  ctx.shadowColor = darkMode
    ? "rgba(0, 0, 0, 0.45)"
    : "rgba(43, 108, 176, 0.05)";
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 4;
  drawRoundedRect(ctx, boardX, boardY, boardSize, boardSize, 12);
  ctx.fillStyle = palette.boardBaseBg;
  ctx.fill();
  ctx.restore();

  ctx.save();
  drawRoundedRect(ctx, boardX, boardY, boardSize, boardSize, 12);
  ctx.fillStyle = palette.boardBaseBg;
  ctx.fill();
  ctx.clip();

  // Render 81 cells: authentic pastel backgrounds + enlarged, balanced numbers (~25px clues, ~29px user inputs)
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cellX = boardX + c * cellSize;
      const cellY = boardY + r * cellSize;
      const cell = gridCells[r]?.[c];
      const val = cell?.value ?? 0;
      const isClue = Boolean(cell?.isOriginalClue);

      const isSelected = selectedRow === r && selectedCol === c;
      const isHighlightedSibling =
        selectedRow !== null &&
        selectedCol !== null &&
        !isSelected &&
        (selectedRow === r ||
          selectedCol === c ||
          (Math.floor(selectedRow / 3) === Math.floor(r / 3) &&
            Math.floor(selectedCol / 3) === Math.floor(c / 3)));
      const isIdenticalValue =
        val !== 0 && selectedVal !== 0 && val === selectedVal && !isSelected;

      const isMistake =
        val !== 0 &&
        !isClue &&
        ((solutionGrid.length === 9 &&
          solutionGrid[r]?.[c] !== undefined &&
          solutionGrid[r][c] !== val) ||
          hasCellConflict(gridCells, r, c, val));

      // Exact cell background fill matching live SudokuBoard.tsx
      if (isSelected && isMistake) {
        ctx.fillStyle = palette.errorSelectedBg;
        ctx.fillRect(cellX, cellY, cellSize, cellSize);
      } else if (isMistake) {
        ctx.fillStyle = palette.errorCellBg;
        ctx.fillRect(cellX, cellY, cellSize, cellSize);
      } else if (isSelected) {
        ctx.fillStyle = palette.activeCellBg;
        ctx.fillRect(cellX, cellY, cellSize, cellSize);
      } else if (isIdenticalValue) {
        ctx.fillStyle = palette.identicalCellBg;
        ctx.fillRect(cellX, cellY, cellSize, cellSize);
      } else if (isHighlightedSibling) {
        ctx.fillStyle = palette.crosshairSiblingBg;
        ctx.fillRect(cellX, cellY, cellSize, cellSize);
      } else {
        ctx.fillStyle = palette.cellTintBg;
        ctx.fillRect(cellX, cellY, cellSize, cellSize);
      }

      if (val !== 0) {
        const centerX = cellX + cellSize / 2;
        const centerY = cellY + cellSize / 2;

        // Enlarged (+20-25%) clean, non-chunky typography (400 normal weight)
        if (isClue) {
          ctx.font = `400 25px ${appSansFont}`;
          ctx.fillStyle = palette.clueColor;
        } else if (isMistake) {
          ctx.font = `400 29px ${appHandwritingFont}`;
          ctx.fillStyle = palette.errorColor;
        } else {
          ctx.font = `400 29px ${appHandwritingFont}`;
          ctx.fillStyle = palette.userColor;
        }

        drawCenteredText(ctx, String(val), centerX, centerY);
      } else {
        const rawNotes = cell?.notes;
        const notesList: number[] =
          rawNotes instanceof Set
            ? Array.from(rawNotes)
            : Array.isArray(rawNotes)
            ? rawNotes
            : [];

        if (notesList.length > 0) {
          const subSize = cellSize / 3;
          ctx.font = `500 8.5px ${appSansFont}`;
          ctx.fillStyle = palette.noteColor;
          for (const n of notesList) {
            if (n >= 1 && n <= 9) {
              const nr = Math.floor((n - 1) / 3);
              const nc = (n - 1) % 3;
              const nx = cellX + nc * subSize + subSize / 2;
              const ny = cellY + nr * subSize + subSize / 2;
              drawCenteredText(ctx, String(n), nx, ny);
            }
          }
        }
      }
    }
  }

  // Thin 1.25px pastel cell grid lines
  ctx.strokeStyle = palette.gridThinLine;
  ctx.lineWidth = 1.25;
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

  // Heavy 2.2px pastel 3x3 box divider lines
  ctx.strokeStyle = palette.gridThickLine;
  ctx.lineWidth = 2.2;
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

  // Outer 2.2px rounded pastel board border
  drawRoundedRect(ctx, boardX, boardY, boardSize, boardSize, 12);
  ctx.strokeStyle = palette.gridThickLine;
  ctx.lineWidth = 2.2;
  ctx.stroke();

  // 5. Vector-Styled Pastel Achievement Sticker Badge (Prominent in BOTH Win and Defeat states at -2.5deg tilt)
  if (stickerBadge.tier !== "none" && stickerBadge.label) {
    ctx.save();
    ctx.font = `700 9.5px ${appSansFont}`;
    const stickerTextW = ctx.measureText(stickerBadge.label).width;
    const stickerIconSize = 12.5;
    const stickerGap = 4.5;
    const stickerContentW = stickerIconSize + stickerGap + stickerTextW;
    const stickerW = stickerContentW + 22;
    const stickerH = 24;

    // Curated Mint/Emerald (Victory / Best Time) vs Rose/Coral (Stuck / Defeat) vector pill palette
    const badgeBg = didWin
      ? darkMode
        ? "#064E3B"
        : "#ECFDF5"
      : darkMode
      ? "#4C0519"
      : "#FFF1F2";

    const badgeBorder = didWin ? "#059669" : "#F43F5E";

    const badgeText = didWin
      ? darkMode
        ? "#ECFDF5"
        : "#047857"
      : darkMode
      ? "#FFE4E6"
      : "#BE123C";

    // Organically floated over the top-right edge of the 9x9 board
    const stickerCenterX = boardX + boardSize - stickerW / 2 - 6;
    const stickerCenterY = boardY + 1;

    ctx.translate(stickerCenterX, stickerCenterY);
    ctx.rotate((-2.5 * Math.PI) / 180);

    // Soft vector drop shadow (rgba(0,0,0,0.06), blur: 8px, y: 3px)
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.06)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;
    drawRoundedRect(
      ctx,
      -stickerW / 2,
      -stickerH / 2,
      stickerW,
      stickerH,
      stickerH / 2
    );
    ctx.fillStyle = badgeBg;
    ctx.fill();
    ctx.restore();

    // Clean 1.5px subtle pastel stroke
    drawRoundedRect(
      ctx,
      -stickerW / 2,
      -stickerH / 2,
      stickerW,
      stickerH,
      stickerH / 2
    );
    ctx.strokeStyle = badgeBorder;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const stickerStartX = -stickerContentW / 2;
    const stickerSvg =
      stickerBadge.tier === "record" || stickerBadge.tier === "defeat_freeze"
        ? getZapSvg(badgeText)
        : stickerBadge.tier === "excellent" ||
          stickerBadge.tier === "defeat_close"
        ? getFlameSvg(badgeText)
        : stickerBadge.tier === "great"
        ? getStarSvg(badgeText)
        : stickerBadge.tier === "defeat_backup"
        ? getEyeSvg(badgeText)
        : getTrophySvg(badgeText);

    await drawSvg(
      ctx,
      stickerSvg,
      stickerStartX,
      -stickerIconSize / 2,
      stickerIconSize
    );
    ctx.fillStyle = badgeText;
    ctx.font = `700 9.5px ${appSansFont}`;
    drawLeftMiddleText(
      ctx,
      stickerBadge.label,
      stickerStartX + stickerIconSize + stickerGap,
      0
    );
    ctx.restore();
  }

  // 6. Viral Loop & Actionable Branding Footer Banner (y = 476..512)
  const footerX = 18;
  const footerY = 476;
  const footerW = CARD_WIDTH - 36;
  const footerH = 36;

  ctx.save();
  ctx.shadowColor = darkMode
    ? "rgba(0, 0, 0, 0.25)"
    : "rgba(28, 25, 23, 0.04)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 2;
  drawRoundedRect(ctx, footerX, footerY, footerW, footerH, 14);
  ctx.fillStyle = palette.footerBg;
  ctx.fill();
  ctx.restore();

  drawRoundedRect(ctx, footerX, footerY, footerW, footerH, 14);
  ctx.strokeStyle = palette.footerBorder;
  ctx.lineWidth = 1;
  ctx.stroke();

  const domainText = "sudokusync.com";
  const dividerText = "  |  ";
  const roomLabelText = "Room Code: ";
  const roomCodeValue = extractedRoomCode;
  const footerIconSize = 13;
  const footerGap = 4.5;

  ctx.font = `600 10.5px ${appSansFont}`;
  const domainW = ctx.measureText(domainText).width;
  const dividerW = ctx.measureText(dividerText).width;
  const roomLabelW = ctx.measureText(roomLabelText).width;

  ctx.font = `700 11px ${appMonoFont}`;
  const roomCodeW = ctx.measureText(roomCodeValue).width;

  const totalFooterContentW =
    footerIconSize +
    footerGap +
    domainW +
    dividerW +
    footerIconSize +
    footerGap +
    roomLabelW +
    roomCodeW;

  let cursorX = footerX + (footerW - totalFooterContentW) / 2;
  const footerCenterY = footerY + footerH / 2;

  await drawSvg(
    ctx,
    getGlobeSvg(palette.footerAccent),
    cursorX,
    footerCenterY - footerIconSize / 2,
    footerIconSize
  );
  cursorX += footerIconSize + footerGap;

  ctx.fillStyle = palette.footerText;
  ctx.font = `600 10.5px ${appSansFont}`;
  drawLeftMiddleText(ctx, domainText, cursorX, footerCenterY);
  cursorX += domainW;

  ctx.save();
  ctx.fillStyle = palette.secondaryText;
  ctx.globalAlpha = 0.45;
  drawLeftMiddleText(ctx, dividerText, cursorX, footerCenterY);
  ctx.restore();
  cursorX += dividerW;

  await drawSvg(
    ctx,
    getHashSvg(palette.footerAccent),
    cursorX,
    footerCenterY - footerIconSize / 2,
    footerIconSize
  );
  cursorX += footerIconSize + footerGap;

  ctx.fillStyle = palette.secondaryText;
  ctx.font = `600 10.5px ${appSansFont}`;
  drawLeftMiddleText(ctx, roomLabelText, cursorX, footerCenterY);
  cursorX += roomLabelW;

  ctx.fillStyle = palette.footerAccent;
  ctx.font = `700 11px ${appMonoFont}`;
  drawLeftMiddleText(ctx, roomCodeValue, cursorX, footerCenterY);

  return canvas.toDataURL("image/png");
}

export default generateShareCanvas;
