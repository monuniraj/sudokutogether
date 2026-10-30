import React, { forwardRef } from "react";
import {
  Trophy,
  Sparkles,
  Clock,
  Award,
  ShieldCheck,
  ExternalLink,
  Flame,
  Target,
} from "lucide-react";
import { SudokuBoard, Difficulty, SudokuBoardState } from "../game/SudokuBoard";

export type ShareDifficulty = "EASY" | "MEDIUM" | "HARD" | "EXPERT" | string;

export interface ShareCardProps {
  boardState: SudokuBoardState | null;
  solutionGrid?: number[][];
  difficulty: ShareDifficulty;
  time: string;
  sessionSeconds?: number;
  playerName: string;
  tagline?: string;
  bestTime?: string;
  isNewRecord?: boolean;
  darkMode?: boolean;
  hiddenOffscreen?: boolean;
  roomCode?: string;
  challengeUrl?: string;
}

interface PastelPalette {
  cardBgLight: string;
  cardBgDark: string;
  pillBgLight: string;
  pillBgDark: string;
  pillTextLight: string;
  pillTextDark: string;
  stickerBgLight: string;
  stickerBgDark: string;
  stickerTextLight: string;
  stickerTextDark: string;
  stickerShadowLight: string;
  stickerShadowDark: string;
}

const SHARE_PALETTES: Record<string, PastelPalette> = {
  EASY: {
    cardBgLight: "linear-gradient(155deg, #ECFDF5 0%, #FDFBF7 52%, #D1FAE5 100%)",
    cardBgDark: "linear-gradient(155deg, #052e24 0%, #121615 58%, #064e3b 100%)",
    pillBgLight: "#D1FAE5",
    pillBgDark: "rgba(16, 185, 129, 0.22)",
    pillTextLight: "#065F46",
    pillTextDark: "#6EE7B7",
    stickerBgLight: "#A7F3D0",
    stickerBgDark: "#065F46",
    stickerTextLight: "#064E3B",
    stickerTextDark: "#ECFDF5",
    stickerShadowLight: "0 10px 24px rgba(5, 150, 105, 0.22)",
    stickerShadowDark: "0 10px 24px rgba(0, 0, 0, 0.55)",
  },
  MEDIUM: {
    cardBgLight: "linear-gradient(155deg, #FFFBEB 0%, #FDFBF7 52%, #FEF3C7 100%)",
    cardBgDark: "linear-gradient(155deg, #2e1c05 0%, #161412 58%, #451a03 100%)",
    pillBgLight: "#FEF3C7",
    pillBgDark: "rgba(245, 158, 11, 0.22)",
    pillTextLight: "#92400E",
    pillTextDark: "#FCD34D",
    stickerBgLight: "#FDE68A",
    stickerBgDark: "#78350F",
    stickerTextLight: "#78350F",
    stickerTextDark: "#FFFBEB",
    stickerShadowLight: "0 10px 24px rgba(217, 119, 6, 0.22)",
    stickerShadowDark: "0 10px 24px rgba(0, 0, 0, 0.55)",
  },
  HARD: {
    cardBgLight: "linear-gradient(155deg, #FAF5FF 0%, #FDFBF7 52%, #F3E8FF 100%)",
    cardBgDark: "linear-gradient(155deg, #241042 0%, #141218 58%, #3b0764 100%)",
    pillBgLight: "#F3E8FF",
    pillBgDark: "rgba(168, 85, 247, 0.22)",
    pillTextLight: "#6B21A8",
    pillTextDark: "#D8B4FE",
    stickerBgLight: "#E9D5FF",
    stickerBgDark: "#581C87",
    stickerTextLight: "#4C1D95",
    stickerTextDark: "#FAF5FF",
    stickerShadowLight: "0 10px 24px rgba(124, 58, 237, 0.22)",
    stickerShadowDark: "0 10px 24px rgba(0, 0, 0, 0.55)",
  },
  EXPERT: {
    cardBgLight: "linear-gradient(155deg, #FFF1F2 0%, #FDFBF7 52%, #FFE4E6 100%)",
    cardBgDark: "linear-gradient(155deg, #3b0819 0%, #181214 58%, #4c0519 100%)",
    pillBgLight: "#FFE4E6",
    pillBgDark: "rgba(244, 63, 94, 0.22)",
    pillTextLight: "#9D174D",
    pillTextDark: "#FDA4AF",
    stickerBgLight: "#FECDD3",
    stickerBgDark: "#881337",
    stickerTextLight: "#881337",
    stickerTextDark: "#FFF1F2",
    stickerShadowLight: "0 10px 24px rgba(225, 29, 72, 0.22)",
    stickerShadowDark: "0 10px 24px rgba(0, 0, 0, 0.55)",
  },
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

export const evaluatePerformanceSticker = (
  difficulty: string,
  seconds: number
): { label: string; tier: "excellent" | "great" | "nice" } => {
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
  return { label: "NICE TRY", tier: "nice" };
};

export const buildFreshChallengeUrl = (
  boardState: SudokuBoardState | null,
  difficulty: string,
  roomCode?: string
): { fullUrl: string; displayUrl: string } => {
  const diff = String(
    difficulty || boardState?.difficulty || "EASY"
  ).toUpperCase();
  const seed =
    roomCode ||
    (boardState?.seed
      ? String(boardState.seed).padStart(6, "0").slice(-6)
      : "849201");
  const maxMistakes = boardState?.maxMistakesLimit ?? 3;
  const hintLimit = (boardState as any)?.hintLimit ?? 3;
  const challengeId = `SUDOKU-${seed}-${diff}-M${maxMistakes}-H${hintLimit}-T1`;

  return {
    fullUrl: `https://play.sudokusync.com/?challenge=${challengeId}`,
    displayUrl: `play.sudokusync.com/?challenge=${challengeId}`,
  };
};

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  (
    {
      boardState,
      solutionGrid = [],
      difficulty = "EASY",
      time = "01:15",
      sessionSeconds,
      playerName = "Player",
      tagline,
      bestTime,
      isNewRecord = false,
      darkMode = false,
      hiddenOffscreen = false,
      roomCode,
      challengeUrl,
    },
    ref
  ) => {
    const normalizedDiff = String(
      difficulty || boardState?.difficulty || "EASY"
    ).toUpperCase() as Difficulty;
    const palette = SHARE_PALETTES[normalizedDiff] || SHARE_PALETTES.EASY;
    const mistakes = boardState?.currentMistakesCount ?? 0;

    const effectiveSeconds =
      typeof sessionSeconds === "number" && sessionSeconds > 0
        ? sessionSeconds
        : parseFormattedTimeToSeconds(time);

    const stickerBadge = evaluatePerformanceSticker(
      normalizedDiff,
      effectiveSeconds
    );

    const { displayUrl } = buildFreshChallengeUrl(
      boardState,
      normalizedDiff,
      roomCode
    );
    const finalDisplayUrl = challengeUrl
      ? challengeUrl.replace(/^https?:\/\//i, "")
      : displayUrl;

    const finalTagline =
      tagline ||
      `मैंने इसे ${time} में सॉल्व किया! एक क्लिक में अपना रिकॉर्ड बनाने जाओ`;

    const cleanAuthenticBoardState: SudokuBoardState | null = boardState
      ? {
          ...boardState,
          selectedRow: null,
          selectedCol: null,
        }
      : null;

    const wrapperStyle: React.CSSProperties = hiddenOffscreen
      ? {
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
          width: "360px",
          maxWidth: "360px",
          pointerEvents: "none",
        }
      : {};

    return (
      <div style={wrapperStyle}>
        <div
          ref={ref}
          style={{
            width: "360px",
            maxWidth: "360px",
            background: darkMode ? palette.cardBgDark : palette.cardBgLight,
            borderRadius: "28px",
            boxShadow: darkMode
              ? "0 20px 45px rgba(0, 0, 0, 0.55)"
              : "0 18px 40px rgba(28, 25, 23, 0.08)",
            padding: "20px",
            fontFamily:
              'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            color: darkMode ? "#F5F5F4" : "#1C1917",
            boxSizing: "border-box",
          }}
          className="flex flex-col gap-3.5 select-none border-none overflow-hidden"
        >
          {/* 1. Apple-Grade Widget Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  backgroundColor: "#121212",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.14)",
                }}
                className="flex items-center justify-center overflow-hidden shrink-0"
              >
                <img
                  src="/logo.png"
                  alt="Sudoku Sync"
                  crossOrigin="anonymous"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col leading-tight">
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 900,
                    letterSpacing: "0.06em",
                    color: darkMode ? "#FAFAF9" : "#1C1917",
                  }}
                  className="uppercase"
                >
                  Sudoku Sync
                </span>
                <span
                  style={{
                    fontSize: "10.5px",
                    fontWeight: 700,
                    color: darkMode ? "#A8A29E" : "#78716C",
                  }}
                >
                  {playerName}
                </span>
              </div>
            </div>

            {/* Difficulty Pastel Pill */}
            <div
              style={{
                backgroundColor: darkMode
                  ? palette.pillBgDark
                  : palette.pillBgLight,
                color: darkMode ? palette.pillTextDark : palette.pillTextLight,
                padding: "5px 12px",
                borderRadius: "9999px",
                fontSize: "10px",
                fontWeight: 900,
                letterSpacing: "0.08em",
              }}
              className="uppercase flex items-center gap-1"
            >
              <Sparkles style={{ width: "11px", height: "11px" }} />
              <span>{normalizedDiff}</span>
            </div>
          </div>

          {/* 2. Prominent Solve Time & Best Record Hero Strip */}
          <div
            style={{
              backgroundColor: darkMode
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(255, 255, 255, 0.86)",
              borderRadius: "20px",
              padding: "12px 16px",
              boxShadow: darkMode
                ? "0 4px 14px rgba(0,0,0,0.22)"
                : "0 6px 18px rgba(0,0,0,0.03)",
            }}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex flex-col">
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  color: darkMode ? "#A8A29E" : "#78716C",
                }}
                className="uppercase flex items-center gap-1"
              >
                <Clock style={{ width: "11px", height: "11px" }} />
                <span>SOLVE TIME</span>
              </span>
              <span
                style={{
                  fontSize: "26px",
                  fontWeight: 900,
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  color: darkMode ? "#FFFFFF" : "#1C1917",
                  lineHeight: 1.15,
                }}
              >
                {time}
              </span>
            </div>

            {/* Best Time / Flawless Badge */}
            <div
              style={{
                backgroundColor: isNewRecord
                  ? darkMode
                    ? "rgba(245, 158, 11, 0.22)"
                    : "#FEF3C7"
                  : darkMode
                  ? palette.pillBgDark
                  : palette.pillBgLight,
                color: isNewRecord
                  ? darkMode
                    ? "#FCD34D"
                    : "#92400E"
                  : darkMode
                  ? palette.pillTextDark
                  : palette.pillTextLight,
                borderRadius: "14px",
                padding: "7px 12px",
              }}
              className="flex flex-col items-end justify-center shrink-0"
            >
              <div className="flex items-center gap-1">
                {isNewRecord ? (
                  <Trophy style={{ width: "13px", height: "13px" }} />
                ) : mistakes === 0 ? (
                  <ShieldCheck style={{ width: "13px", height: "13px" }} />
                ) : (
                  <Award style={{ width: "13px", height: "13px" }} />
                )}
                <span
                  style={{
                    fontSize: "9px",
                    fontWeight: 900,
                    letterSpacing: "0.08em",
                  }}
                  className="uppercase"
                >
                  {isNewRecord
                    ? "NEW BEST TIME!"
                    : bestTime
                    ? `BEST ${bestTime}`
                    : mistakes === 0
                    ? "FLAWLESS WIN"
                    : "COMPLETED"}
                </span>
              </div>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  opacity: 0.85,
                  marginTop: "2px",
                }}
              >
                {mistakes === 0
                  ? "0 Mistakes • 100% Clean"
                  : `${mistakes} Mistake${mistakes === 1 ? "" : "s"}`}
              </span>
            </div>
          </div>

          {/* 3. Authentic <SudokuBoard /> + Dynamic Rotated Sticker Overlay */}
          <div className="relative w-full aspect-square flex items-center justify-center my-0.5">
            <div className="w-full h-full pointer-events-none">
              <SudokuBoard
                id="share-card-authentic-board"
                boardState={cleanAuthenticBoardState}
                difficulty={normalizedDiff}
                solutionGrid={solutionGrid}
                isTimerPaused={false}
                onResumeSession={() => {}}
                visualizingBacktrack={false}
                highlightAreas={true}
                highlightIdentical={true}
                isNumberFirstInputMode={false}
                lockedNum={null}
                activeKeypadNum={null}
                darkMode={darkMode}
                playClickSound={() => {}}
                onCellClick={() => {}}
              />
            </div>

            {/* Dynamic Premium Rotated Pastel Sticker Badge (-2deg) */}
            <div
              style={{
                position: "absolute",
                top: "-10px",
                right: "-6px",
                transform: "rotate(-2deg)",
                backgroundColor: darkMode
                  ? palette.stickerBgDark
                  : palette.stickerBgLight,
                color: darkMode
                  ? palette.stickerTextDark
                  : palette.stickerTextLight,
                boxShadow: darkMode
                  ? palette.stickerShadowDark
                  : palette.stickerShadowLight,
                padding: "6px 14px",
                borderRadius: "9999px",
                fontSize: "10.5px",
                fontWeight: 900,
                letterSpacing: "0.06em",
                zIndex: 20,
              }}
              className="border-none select-none flex items-center gap-1.5 uppercase"
            >
              {stickerBadge.tier === "excellent" ? (
                <Flame style={{ width: "12px", height: "12px" }} />
              ) : stickerBadge.tier === "great" ? (
                <Sparkles style={{ width: "12px", height: "12px" }} />
              ) : (
                <Target style={{ width: "12px", height: "12px" }} />
              )}
              <span>{stickerBadge.label}</span>
            </div>
          </div>

          {/* 4. Psychological Hook & Unsolved Challenge Link Section */}
          <div
            style={{
              backgroundColor: darkMode
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(255, 255, 255, 0.88)",
              borderRadius: "20px",
              padding: "12px 14px",
              boxShadow: darkMode
                ? "0 4px 14px rgba(0,0,0,0.22)"
                : "0 4px 14px rgba(0,0,0,0.03)",
            }}
            className="flex flex-col items-center gap-2 text-center border-none"
          >
            <p
              style={{
                fontSize: "12px",
                fontWeight: 800,
                lineHeight: 1.4,
                color: darkMode ? "#FAFAF9" : "#1C1917",
                margin: 0,
              }}
            >
              {finalTagline}
            </p>

            {/* Clean Fresh Unsolved Challenge Link Pill */}
            <div
              style={{
                backgroundColor: darkMode
                  ? palette.pillBgDark
                  : palette.pillBgLight,
                color: darkMode ? palette.pillTextDark : palette.pillTextLight,
                borderRadius: "12px",
                padding: "6px 12px",
                fontSize: "10px",
                fontWeight: 800,
                fontFamily:
                  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                width: "100%",
                boxSizing: "border-box",
              }}
              className="flex items-center justify-center gap-1.5 truncate"
            >
              <ExternalLink
                style={{ width: "11px", height: "11px", flexShrink: 0 }}
              />
              <span className="truncate">{finalDisplayUrl}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ShareCard.displayName = "ShareCard";

export default ShareCard;
