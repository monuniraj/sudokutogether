import React, { forwardRef } from "react";
import { Trophy, Sparkles, Clock, Award, ShieldCheck } from "lucide-react";

export type ShareDifficulty = "EASY" | "MEDIUM" | "HARD" | "EXPERT" | string;

export interface ShareCardCell {
  value: number;
  isOriginalClue?: boolean;
  [key: string]: any;
}

export interface ShareCardBoardState {
  grid?: ShareCardCell[][];
  seed?: number | string;
  currentMistakesCount?: number;
  maxMistakesLimit?: number;
  [key: string]: any;
}

export interface ShareCardProps {
  boardState: ShareCardBoardState | null;
  difficulty: ShareDifficulty;
  time: string;
  playerName: string;
  tagline?: string;
  bestTime?: string;
  isNewRecord?: boolean;
  darkMode?: boolean;
  hiddenOffscreen?: boolean;
  roomCode?: string;
}

interface PastelPalette {
  cardBgLight: string;
  cardBgDark: string;
  accentLight: string;
  accentDark: string;
  pillBgLight: string;
  pillBgDark: string;
  pillTextLight: string;
  pillTextDark: string;
  clueBgLight: string;
  clueBgDark: string;
  solvedBgLight: string;
  solvedBgDark: string;
  solvedTextLight: string;
  solvedTextDark: string;
  gridBorderLight: string;
  gridBorderDark: string;
  subBorderLight: string;
  subBorderDark: string;
}

const SHARE_PALETTES: Record<string, PastelPalette> = {
  EASY: {
    cardBgLight: "linear-gradient(145deg, #ECFDF5 0%, #FDFBF7 55%, #D1FAE5 100%)",
    cardBgDark: "linear-gradient(145deg, #052e24 0%, #121615 60%, #064e3b 100%)",
    accentLight: "#059669",
    accentDark: "#34D399",
    pillBgLight: "#D1FAE5",
    pillBgDark: "rgba(16, 185, 129, 0.2)",
    pillTextLight: "#065F46",
    pillTextDark: "#6EE7B7",
    clueBgLight: "rgba(6, 95, 70, 0.08)",
    clueBgDark: "rgba(255, 255, 255, 0.06)",
    solvedBgLight: "#FFFFFF",
    solvedBgDark: "#181C1B",
    solvedTextLight: "#047857",
    solvedTextDark: "#34D399",
    gridBorderLight: "rgba(6, 95, 70, 0.45)",
    gridBorderDark: "#0b6b52",
    subBorderLight: "rgba(6, 95, 70, 0.16)",
    subBorderDark: "#054031",
  },
  MEDIUM: {
    cardBgLight: "linear-gradient(145deg, #FFFBEB 0%, #FDFBF7 55%, #FEF3C7 100%)",
    cardBgDark: "linear-gradient(145deg, #2e1c05 0%, #161412 60%, #451a03 100%)",
    accentLight: "#D97706",
    accentDark: "#FBBF24",
    pillBgLight: "#FEF3C7",
    pillBgDark: "rgba(245, 158, 11, 0.2)",
    pillTextLight: "#92400E",
    pillTextDark: "#FCD34D",
    clueBgLight: "rgba(146, 64, 14, 0.08)",
    clueBgDark: "rgba(255, 255, 255, 0.06)",
    solvedBgLight: "#FFFFFF",
    solvedBgDark: "#1C1917",
    solvedTextLight: "#B45309",
    solvedTextDark: "#FBBF24",
    gridBorderLight: "rgba(133, 77, 14, 0.45)",
    gridBorderDark: "#7c3207",
    subBorderLight: "rgba(133, 77, 14, 0.16)",
    subBorderDark: "#532004",
  },
  HARD: {
    cardBgLight: "linear-gradient(145deg, #FAF5FF 0%, #FDFBF7 55%, #F3E8FF 100%)",
    cardBgDark: "linear-gradient(145deg, #241042 0%, #141218 60%, #3b0764 100%)",
    accentLight: "#7C3AED",
    accentDark: "#C084FC",
    pillBgLight: "#F3E8FF",
    pillBgDark: "rgba(168, 85, 247, 0.2)",
    pillTextLight: "#6B21A8",
    pillTextDark: "#D8B4FE",
    clueBgLight: "rgba(107, 33, 168, 0.08)",
    clueBgDark: "rgba(255, 255, 255, 0.06)",
    solvedBgLight: "#FFFFFF",
    solvedBgDark: "#181520",
    solvedTextLight: "#6D28D9",
    solvedTextDark: "#C084FC",
    gridBorderLight: "rgba(107, 33, 168, 0.45)",
    gridBorderDark: "#4c1d95",
    subBorderLight: "rgba(107, 33, 168, 0.16)",
    subBorderDark: "#31126b",
  },
  EXPERT: {
    cardBgLight: "linear-gradient(145deg, #FFF1F2 0%, #FDFBF7 55%, #FFE4E6 100%)",
    cardBgDark: "linear-gradient(145deg, #3b0819 0%, #181214 60%, #4c0519 100%)",
    accentLight: "#E11D48",
    accentDark: "#FB7185",
    pillBgLight: "#FFE4E6",
    pillBgDark: "rgba(244, 63, 94, 0.2)",
    pillTextLight: "#9D174D",
    pillTextDark: "#FDA4AF",
    clueBgLight: "rgba(157, 23, 77, 0.08)",
    clueBgDark: "rgba(255, 255, 255, 0.06)",
    solvedBgLight: "#FFFFFF",
    solvedBgDark: "#1F1418",
    solvedTextLight: "#BE123C",
    solvedTextDark: "#FB7185",
    gridBorderLight: "rgba(157, 23, 77, 0.45)",
    gridBorderDark: "#881337",
    subBorderLight: "rgba(157, 23, 77, 0.16)",
    subBorderDark: "#58061d",
  },
};

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  (
    {
      boardState,
      difficulty = "EASY",
      time = "01:15",
      playerName = "Player",
      tagline = "मैंने इसे इतनी देर में सॉल्व किया! क्या आप कर सकते हैं?",
      bestTime,
      isNewRecord = false,
      darkMode = false,
      hiddenOffscreen = false,
      roomCode,
    },
    ref
  ) => {
    const normalizedDiff = String(difficulty || "EASY").toUpperCase();
    const palette = SHARE_PALETTES[normalizedDiff] || SHARE_PALETTES.EASY;
    const grid = boardState?.grid;
    const mistakes = boardState?.currentMistakesCount ?? 0;
    const seedCode =
      roomCode ||
      (boardState?.seed ? String(boardState.seed).padStart(6, "0").slice(-6) : null);

    const wrapperStyle: React.CSSProperties = hiddenOffscreen
      ? {
          position: "fixed",
          left: "-9999px",
          top: "0px",
          pointerEvents: "none",
          zIndex: -1,
        }
      : {};

    return (
      <div style={wrapperStyle}>
        <div
          ref={ref}
          style={{
            width: "360px",
            background: darkMode ? palette.cardBgDark : palette.cardBgLight,
            borderRadius: "28px",
            boxShadow: darkMode
              ? "0 20px 45px rgba(0, 0, 0, 0.55)"
              : "0 18px 40px rgba(28, 25, 23, 0.08)",
            padding: "22px",
            fontFamily:
              'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            color: darkMode ? "#F5F5F4" : "#1C1917",
            boxSizing: "border-box",
          }}
          className="flex flex-col gap-4 select-none border-none overflow-hidden"
        >
          {/* Top Brand & Difficulty Header */}
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
                    fontSize: "10px",
                    fontWeight: 600,
                    color: darkMode ? "#A8A29E" : "#78716C",
                  }}
                >
                  {playerName}
                  {seedCode ? ` • #${seedCode}` : ""}
                </span>
              </div>
            </div>

            {/* Difficulty Pastel Pill */}
            <div
              style={{
                backgroundColor: darkMode ? palette.pillBgDark : palette.pillBgLight,
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

          {/* Prominent Time & Best Time Hero Banner */}
          <div
            style={{
              backgroundColor: darkMode
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(255, 255, 255, 0.82)",
              borderRadius: "20px",
              padding: "14px 16px",
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
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  color: darkMode ? "#FFFFFF" : "#1C1917",
                  lineHeight: 1.15,
                }}
              >
                {time}
              </span>
            </div>

            {/* Prominent Best Time / New Record Badge */}
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
                padding: "8px 12px",
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
                {mistakes === 0 ? "0 Mistakes • 100% Clean" : `${mistakes} Mistake${mistakes === 1 ? "" : "s"}`}
              </span>
            </div>
          </div>

          {/* Mini 9x9 Completed Grid Snapshot */}
          <div
            style={{
              width: "100%",
              aspectRatio: "1 / 1",
              borderRadius: "16px",
              border: `2px solid ${darkMode ? palette.gridBorderDark : palette.gridBorderLight}`,
              backgroundColor: darkMode ? palette.solvedBgDark : palette.solvedBgLight,
              overflow: "hidden",
              display: "grid",
              gridTemplateColumns: "repeat(9, minmax(0, 1fr))",
              boxShadow: darkMode
                ? "0 4px 16px rgba(0,0,0,0.35)"
                : "0 4px 14px rgba(0,0,0,0.04)",
            }}
          >
            {Array.from({ length: 9 }).map((_, r) =>
              Array.from({ length: 9 }).map((__, c) => {
                const cell = grid?.[r]?.[c];
                const val = cell?.value && cell.value > 0 ? cell.value : "";
                const isClue = Boolean(cell?.isOriginalClue);

                const borderRight =
                  c === 2 || c === 5
                    ? `1.8px solid ${darkMode ? palette.gridBorderDark : palette.gridBorderLight}`
                    : c === 8
                    ? "none"
                    : `1px solid ${darkMode ? palette.subBorderDark : palette.subBorderLight}`;

                const borderBottom =
                  r === 2 || r === 5
                    ? `1.8px solid ${darkMode ? palette.gridBorderDark : palette.gridBorderLight}`
                    : r === 8
                    ? "none"
                    : `1px solid ${darkMode ? palette.subBorderDark : palette.subBorderLight}`;

                return (
                  <div
                    key={`${r}-${c}`}
                    style={{
                      backgroundColor: isClue
                        ? darkMode
                          ? palette.clueBgDark
                          : palette.clueBgLight
                        : darkMode
                        ? palette.solvedBgDark
                        : palette.solvedBgLight,
                      borderRight,
                      borderBottom,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "13px",
                      fontWeight: isClue ? 700 : 800,
                      color: isClue
                        ? darkMode
                          ? "#E7E5E4"
                          : "#292524"
                        : darkMode
                        ? palette.solvedTextDark
                        : palette.solvedTextLight,
                      aspectRatio: "1 / 1",
                    }}
                  >
                    {val}
                  </div>
                );
              })
            )}
          </div>

          {/* Dopamine Viral Tagline Footer */}
          <div
            style={{
              backgroundColor: darkMode ? palette.pillBgDark : palette.pillBgLight,
              color: darkMode ? palette.pillTextDark : palette.pillTextLight,
              borderRadius: "16px",
              padding: "10px 14px",
              textAlign: "center",
              fontSize: "12px",
              fontWeight: 800,
              lineHeight: 1.4,
            }}
          >
            {tagline}
          </div>
        </div>
      </div>
    );
  }
);

ShareCard.displayName = "ShareCard";

export default ShareCard;
