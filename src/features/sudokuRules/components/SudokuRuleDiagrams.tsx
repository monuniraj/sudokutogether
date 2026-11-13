import React, { useId } from "react";
import { RulesDiagramLabels } from "../../../utils/rulesArticleTranslations";

export interface RuleDiagramProps {
  labels: RulesDiagramLabels;
  darkMode: boolean;
}

const OUTER_RADIUS = 14;

/**
 * Shared borderless pastel figure card with subtle legend chips and caption.
 */
const FigureShell: React.FC<{
  darkMode: boolean;
  caption: string;
  legends?: Array<{ dotClass: string; text: string }>;
  children: React.ReactNode;
}> = ({ darkMode, caption, legends, children }) => (
  <figure
    className={`p-4 sm:p-5 rounded-2xl border-0 space-y-3 ${
      darkMode
        ? "bg-zinc-900/75 text-zinc-200 shadow-[0_8px_26px_rgba(0,0,0,0.34)]"
        : "bg-stone-50/90 text-stone-700 shadow-[0_8px_24px_rgba(15,23,42,0.05)]"
    }`}
  >
    <div className="flex justify-center overflow-x-auto">{children}</div>
    {legends && legends.length > 0 && (
      <div className="flex flex-wrap items-center justify-center gap-2 pt-0.5">
        {legends.map((item) => (
          <span
            key={item.text}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border-0 ${
              darkMode
                ? "bg-zinc-800/90 text-zinc-200"
                : "bg-white text-stone-700 shadow-[0_2px_6px_rgba(15,23,42,0.04)]"
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.dotClass}`} />
            <span>{item.text}</span>
          </span>
        ))}
      </div>
    )}
    <figcaption
      className={`text-xs leading-relaxed text-center font-medium ${
        darkMode ? "text-zinc-300" : "text-stone-600"
      }`}
    >
      {caption}
    </figcaption>
  </figure>
);

/**
 * Shared Sudoku Sync pastel SVG palette matching SudokuBoard's soft aesthetic.
 */
function getGridPalette(darkMode: boolean) {
  return {
    boardBg: darkMode ? "#18181B" : "#FFFFFF",
    placedDigit: darkMode ? "#F4F4F5" : "#1E293B",
    minorLine: darkMode ? "rgba(255, 255, 255, 0.09)" : "rgba(100, 116, 139, 0.18)",
    majorLine: darkMode ? "rgba(212, 212, 216, 0.38)" : "rgba(100, 116, 139, 0.48)",
    outerFrame: darkMode ? "rgba(161, 161, 170, 0.42)" : "rgba(100, 116, 139, 0.45)",
    rowTint: darkMode ? "rgba(56, 189, 248, 0.20)" : "#E0F2FE",
    colTint: darkMode ? "rgba(167, 139, 250, 0.22)" : "#EDE9FE",
    boxTint: darkMode ? "rgba(251, 191, 36, 0.18)" : "#FEF3C7",
    targetTint: darkMode ? "rgba(16, 185, 129, 0.22)" : "#ECFDF5",
    targetBadge: darkMode ? "#10B981" : "#34D399",
    pairTint: darkMode ? "rgba(139, 92, 246, 0.22)" : "#F3E8FF",
    pairBadgeBg: darkMode ? "rgba(167, 139, 250, 0.24)" : "#EDE9FE",
    pairText: darkMode ? "#DDD6FE" : "#5B21B6",
    noteBadgeBg: darkMode ? "rgba(56, 189, 248, 0.18)" : "#E0F2FE",
    noteText: darkMode ? "#7DD3FC" : "#0369A1",
    elimTint: darkMode ? "rgba(244, 63, 94, 0.14)" : "#FFF1F2",
    elimBadgeBg: darkMode ? "rgba(244, 63, 94, 0.24)" : "#FFE4E6",
    elimColor: darkMode ? "#FDA4AF" : "#E11D48",
    winBadgeBg: darkMode ? "#10B981" : "#A7F3D0",
    winText: darkMode ? "#022C22" : "#065F46",
  };
}

/**
 * Diagram 1: Classic 9x9 Row, Column, and 3x3 Box House Intersection at R4C5.
 */
export const GridHousesDiagram: React.FC<RuleDiagramProps> = ({ labels, darkMode }) => {
  const clipId = `clip-houses-${useId().replace(/:/g, "")}`;
  const size = 26;
  const pad = 12;
  const boardSize = size * 9;
  const targetR = 3;
  const targetC = 4;
  const palette = getGridPalette(darkMode);

  return (
    <FigureShell
      darkMode={darkMode}
      caption={labels.stepCaption1}
      legends={[
        { dotClass: "bg-sky-400", text: labels.rowLabel },
        { dotClass: "bg-violet-400", text: labels.columnLabel },
        { dotClass: "bg-amber-400", text: labels.boxLabel },
        { dotClass: "bg-emerald-400", text: `${labels.targetCellLabel} (R4C5)` },
      ]}
    >
      <svg
        viewBox="0 0 258 258"
        className="w-full max-w-[260px] h-auto select-none"
        role="img"
        aria-label={labels.stepCaption1}
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={pad} y={pad} width={boardSize} height={boardSize} rx={OUTER_RADIUS} />
          </clipPath>
        </defs>

        <rect x={pad} y={pad} width={boardSize} height={boardSize} rx={OUTER_RADIUS} fill={palette.boardBg} />

        <g clipPath={`url(#${clipId})`}>
          {Array.from({ length: 81 }).map((_, idx) => {
            const r = Math.floor(idx / 9);
            const c = idx % 9;
            const inRow = r === targetR;
            const inCol = c === targetC;
            const inBox = Math.floor(r / 3) === 1 && Math.floor(c / 3) === 1;
            const isTarget = inRow && inCol;

            let fill = palette.boardBg;
            if (isTarget) fill = palette.targetBadge;
            else if (inRow) fill = palette.rowTint;
            else if (inCol) fill = palette.colTint;
            else if (inBox) fill = palette.boxTint;

            return (
              <rect
                key={idx}
                x={pad + c * size}
                y={pad + r * size}
                width={size}
                height={size}
                fill={fill}
              />
            );
          })}

          {/* Subtle interior cell lines */}
          {[1, 2, 4, 5, 7, 8].map((idx) => (
            <React.Fragment key={`minor-${idx}`}>
              <line
                x1={pad + idx * size}
                y1={pad}
                x2={pad + idx * size}
                y2={pad + boardSize}
                stroke={palette.minorLine}
                strokeWidth={0.85}
              />
              <line
                x1={pad}
                y1={pad + idx * size}
                x2={pad + boardSize}
                y2={pad + idx * size}
                stroke={palette.minorLine}
                strokeWidth={0.85}
              />
            </React.Fragment>
          ))}

          {/* Interior 3x3 box divider lines */}
          {[3, 6].map((idx) => (
            <React.Fragment key={`major-${idx}`}>
              <line
                x1={pad + idx * size}
                y1={pad}
                x2={pad + idx * size}
                y2={pad + boardSize}
                stroke={palette.majorLine}
                strokeWidth={1.6}
              />
              <line
                x1={pad}
                y1={pad + idx * size}
                x2={pad + boardSize}
                y2={pad + idx * size}
                stroke={palette.majorLine}
                strokeWidth={1.6}
              />
            </React.Fragment>
          ))}
        </g>

        {/* Single smooth curved outer frame */}
        <rect
          x={pad}
          y={pad}
          width={boardSize}
          height={boardSize}
          rx={OUTER_RADIUS}
          fill="none"
          stroke={palette.outerFrame}
          strokeWidth={1.7}
        />

        <text
          x={pad + targetC * size + size / 2}
          y={pad + targetR * size + size / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="16"
          fontWeight="700"
          fill={darkMode ? "#022C22" : "#064E3B"}
        >
          ?
        </text>
      </svg>
    </FigureShell>
  );
};

/**
 * Diagram 2: 3x3 Box Pencil Marks (Valid {4,6} Naked Pair eliminates 4 and 6 from center R2C2 -> 2).
 */
export const PencilNotesDiagram: React.FC<RuleDiagramProps> = ({ labels, darkMode }) => {
  const clipId = `clip-notes-${useId().replace(/:/g, "")}`;
  const cell = 68;
  const pad = 14;
  const boardSize = cell * 3;
  const palette = getGridPalette(darkMode);

  const boxCells: Array<{
    r: number;
    c: number;
    val?: string;
    notes?: number[];
    eliminated?: number[];
  }> = [
    { r: 0, c: 0, val: "1" },
    { r: 0, c: 1, val: "3" },
    { r: 0, c: 2, notes: [4, 6], eliminated: [] },
    { r: 1, c: 0, val: "7" },
    { r: 1, c: 1, notes: [2, 4, 6], eliminated: [4, 6] },
    { r: 1, c: 2, val: "9" },
    { r: 2, c: 0, notes: [4, 6], eliminated: [] },
    { r: 2, c: 1, val: "8" },
    { r: 2, c: 2, val: "5" },
  ];

  return (
    <FigureShell
      darkMode={darkMode}
      caption={labels.stepCaption2}
      legends={[
        { dotClass: "bg-sky-500", text: labels.candidatesLabel },
        { dotClass: "bg-rose-500", text: labels.eliminatedLabel },
        { dotClass: "bg-emerald-500", text: labels.targetCellLabel },
      ]}
    >
      <svg
        viewBox="0 0 232 232"
        className="w-full max-w-[232px] h-auto select-none"
        role="img"
        aria-label={labels.stepCaption2}
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={pad} y={pad} width={boardSize} height={boardSize} rx={OUTER_RADIUS} />
          </clipPath>
        </defs>

        <rect x={pad} y={pad} width={boardSize} height={boardSize} rx={OUTER_RADIUS} fill={palette.boardBg} />

        <g clipPath={`url(#${clipId})`}>
          {boxCells.map((item, idx) => {
            const x = pad + item.c * cell;
            const y = pad + item.r * cell;
            const isFocus = item.r === 1 && item.c === 1;
            const isPairCell = (item.r === 0 && item.c === 2) || (item.r === 2 && item.c === 0);
            const cellFill = isFocus
              ? palette.targetTint
              : isPairCell
                ? darkMode
                  ? "rgba(56, 189, 248, 0.08)"
                  : "#F8FAFC"
                : palette.boardBg;

            return (
              <rect
                key={`bg-${idx}`}
                x={x}
                y={y}
                width={cell}
                height={cell}
                fill={cellFill}
              />
            );
          })}

          {/* Subtle interior cell lines */}
          {[1, 2].map((idx) => (
            <React.Fragment key={`line-${idx}`}>
              <line
                x1={pad + idx * cell}
                y1={pad}
                x2={pad + idx * cell}
                y2={pad + boardSize}
                stroke={palette.minorLine}
                strokeWidth={1.1}
              />
              <line
                x1={pad}
                y1={pad + idx * cell}
                x2={pad + boardSize}
                y2={pad + idx * cell}
                stroke={palette.minorLine}
                strokeWidth={1.1}
              />
            </React.Fragment>
          ))}
        </g>

        {/* Single smooth curved outer frame */}
        <rect
          x={pad}
          y={pad}
          width={boardSize}
          height={boardSize}
          rx={OUTER_RADIUS}
          fill="none"
          stroke={palette.outerFrame}
          strokeWidth={1.8}
        />

        {/* Large bold placed digits & small candidate pencil badges */}
        {boxCells.map((item, idx) => {
          const x = pad + item.c * cell;
          const y = pad + item.r * cell;
          const isFocus = item.r === 1 && item.c === 1;

          return (
            <g key={`fg-${idx}`}>
              {item.val && (
                <text
                  x={x + cell / 2}
                  y={y + cell / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="18"
                  fontWeight="700"
                  fill={palette.placedDigit}
                >
                  {item.val}
                </text>
              )}

              {item.notes &&
                item.notes.map((digit) => {
                  const subR = Math.floor((digit - 1) / 3);
                  const subC = (digit - 1) % 3;
                  const nx = x + 16 + subC * 18;
                  const ny = y + 16 + subR * 18;
                  const isElim = item.eliminated?.includes(digit);
                  const isWinner = isFocus && !isElim;

                  return (
                    <g key={digit}>
                      <rect
                        x={nx - 8}
                        y={ny - 8}
                        width={16}
                        height={16}
                        rx={5}
                        fill={
                          isWinner
                            ? palette.winBadgeBg
                            : isElim
                              ? palette.elimBadgeBg
                              : palette.noteBadgeBg
                        }
                      />
                      <text
                        x={nx}
                        y={ny}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize="10.5"
                        fontWeight="600"
                        fill={
                          isWinner
                            ? palette.winText
                            : isElim
                              ? palette.elimColor
                              : palette.noteText
                        }
                      >
                        {digit}
                      </text>
                      {isElim && (
                        <line
                          x1={nx - 5}
                          y1={ny - 5}
                          x2={nx + 5}
                          y2={ny + 5}
                          stroke={palette.elimColor}
                          strokeWidth={1.5}
                          strokeLinecap="round"
                        />
                      )}
                    </g>
                  );
                })}
            </g>
          );
        })}
      </svg>
    </FigureShell>
  );
};

/**
 * Diagram 3: Naked Pair Lock (R4C1={3,7} and R4C8={3,7} clearing {3,7} from R4C5 -> 9).
 */
export const NakedHiddenPairsDiagram: React.FC<RuleDiagramProps> = ({ labels, darkMode }) => {
  const clipId = `clip-pair-${useId().replace(/:/g, "")}`;
  const cellW = 38;
  const cellH = 50;
  const padX = 12;
  const padY = 12;
  const rowWidth = cellW * 9;
  const palette = getGridPalette(darkMode);

  const cells: Array<{
    c: number;
    val?: string;
    pair?: [number, number];
    mixed?: { keep: number; elim: [number, number] };
  }> = [
    { c: 0, pair: [3, 7] },
    { c: 1, val: "1" },
    { c: 2, val: "6" },
    { c: 3, val: "2" },
    { c: 4, mixed: { keep: 9, elim: [3, 7] } },
    { c: 5, val: "8" },
    { c: 6, val: "5" },
    { c: 7, pair: [3, 7] },
    { c: 8, val: "4" },
  ];

  return (
    <FigureShell
      darkMode={darkMode}
      caption={labels.stepCaption3}
      legends={[
        { dotClass: "bg-violet-500", text: `${labels.lockedPairLabel} {3, 7}` },
        { dotClass: "bg-rose-500", text: labels.eliminatedLabel },
        { dotClass: "bg-emerald-500", text: `${labels.targetCellLabel} = 9` },
      ]}
    >
      <svg
        viewBox="0 0 366 74"
        className="w-full max-w-[368px] h-auto select-none"
        role="img"
        aria-label={labels.stepCaption3}
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={padX} y={padY} width={rowWidth} height={cellH} rx={OUTER_RADIUS} />
          </clipPath>
        </defs>

        <rect x={padX} y={padY} width={rowWidth} height={cellH} rx={OUTER_RADIUS} fill={palette.boardBg} />

        <g clipPath={`url(#${clipId})`}>
          {cells.map((item) => {
            const x = padX + item.c * cellW;
            const fill = item.pair
              ? palette.pairTint
              : item.mixed
                ? palette.targetTint
                : palette.boardBg;
            return <rect key={`bg-${item.c}`} x={x} y={padY} width={cellW} height={cellH} fill={fill} />;
          })}

          {/* Subtle interior cell lines */}
          {[1, 2, 4, 5, 7, 8].map((col) => (
            <line
              key={`minor-${col}`}
              x1={padX + col * cellW}
              y1={padY}
              x2={padX + col * cellW}
              y2={padY + cellH}
              stroke={palette.minorLine}
              strokeWidth={0.95}
            />
          ))}

          {/* Interior 3x3 box separators */}
          {[3, 6].map((col) => (
            <line
              key={`major-${col}`}
              x1={padX + col * cellW}
              y1={padY}
              x2={padX + col * cellW}
              y2={padY + cellH}
              stroke={palette.majorLine}
              strokeWidth={1.7}
            />
          ))}
        </g>

        {/* Single smooth curved outer frame */}
        <rect
          x={padX}
          y={padY}
          width={rowWidth}
          height={cellH}
          rx={OUTER_RADIUS}
          fill="none"
          stroke={palette.outerFrame}
          strokeWidth={1.7}
        />

        {/* Typography & candidate badges */}
        {cells.map((item) => {
          const x = padX + item.c * cellW;

          if (item.val) {
            return (
              <text
                key={`fg-${item.c}`}
                x={x + cellW / 2}
                y={padY + cellH / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="17"
                fontWeight="700"
                fill={palette.placedDigit}
              >
                {item.val}
              </text>
            );
          }

          if (item.pair) {
            const p1x = x + 11.5;
            const p2x = x + cellW - 11.5;
            const py = padY + 18;
            return (
              <g key={`fg-${item.c}`}>
                <rect x={p1x - 7} y={py - 7.5} width={14} height={15} rx={4.5} fill={palette.pairBadgeBg} />
                <text
                  x={p1x}
                  y={py}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="10.5"
                  fontWeight="600"
                  fill={palette.pairText}
                >
                  {item.pair[0]}
                </text>
                <rect x={p2x - 7} y={py - 7.5} width={14} height={15} rx={4.5} fill={palette.pairBadgeBg} />
                <text
                  x={p2x}
                  y={py}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="10.5"
                  fontWeight="600"
                  fill={palette.pairText}
                >
                  {item.pair[1]}
                </text>
              </g>
            );
          }

          if (item.mixed) {
            const e1x = x + 11.5;
            const e2x = x + cellW - 11.5;
            const ey = padY + 13;
            return (
              <g key={`fg-${item.c}`}>
                {item.mixed.elim.map((digit, dIdx) => {
                  const ex = dIdx === 0 ? e1x : e2x;
                  return (
                    <g key={digit}>
                      <rect
                        x={ex - 6.5}
                        y={ey - 6.5}
                        width={13}
                        height={13}
                        rx={4}
                        fill={palette.elimBadgeBg}
                      />
                      <text
                        x={ex}
                        y={ey}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize="10"
                        fontWeight="600"
                        fill={palette.elimColor}
                      >
                        {digit}
                      </text>
                      <line
                        x1={ex - 4}
                        y1={ey - 4}
                        x2={ex + 4}
                        y2={ey + 4}
                        stroke={palette.elimColor}
                        strokeWidth={1.4}
                        strokeLinecap="round"
                      />
                    </g>
                  );
                })}

                <text
                  x={x + cellW / 2}
                  y={padY + 35.5}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="16"
                  fontWeight="700"
                  fill={darkMode ? "#6EE7B7" : "#047857"}
                >
                  {item.mixed.keep}
                </text>
              </g>
            );
          }

          return null;
        })}
      </svg>
    </FigureShell>
  );
};

/**
 * Diagram 4: Pointing Pair in Box 1 (R1C2 & R1C3 claim candidate 4 along Row 1, eliminating 4 in Box 2).
 */
export const PointingPairsDiagram: React.FC<RuleDiagramProps> = ({ labels, darkMode }) => {
  const clipLeftId = `clip-pt-left-${useId().replace(/:/g, "")}`;
  const clipRightId = `clip-pt-right-${useId().replace(/:/g, "")}`;
  const size = 44;
  const padX = 12;
  const padY = 12;
  const boxGap = 16;
  const boxSize = size * 3;
  const palette = getGridPalette(darkMode);

  const pointingFill = darkMode ? "rgba(56, 189, 248, 0.16)" : "#F0F9FF";
  const elimCellFill = palette.elimTint;

  return (
    <FigureShell
      darkMode={darkMode}
      caption={labels.stepCaption4}
      legends={[
        { dotClass: "bg-sky-400", text: `${labels.pointingLineLabel} (4)` },
        { dotClass: "bg-rose-500", text: labels.eliminatedLabel },
      ]}
    >
      <svg
        viewBox="0 0 304 156"
        className="w-full max-w-[306px] h-auto select-none"
        role="img"
        aria-label={labels.stepCaption4}
      >
        <defs>
          <clipPath id={clipLeftId}>
            <rect x={padX} y={padY} width={boxSize} height={boxSize} rx={OUTER_RADIUS} />
          </clipPath>
          <clipPath id={clipRightId}>
            <rect
              x={padX + boxSize + boxGap}
              y={padY}
              width={boxSize}
              height={boxSize}
              rx={OUTER_RADIUS}
            />
          </clipPath>
        </defs>

        {/* Pointing alignment guide connecting Box 1 Row 1 into Box 2 Row 1 */}
        <line
          x1={padX + size * 1.5}
          y1={padY + size / 2}
          x2={padX + boxSize + boxGap + size * 2.5}
          y2={padY + size / 2}
          stroke={darkMode ? "#38BDF8" : "#0284C7"}
          strokeWidth={1.6}
          strokeDasharray="4 3"
          opacity={0.65}
        />

        {[0, 1].map((boxIdx) => {
          const bx = padX + boxIdx * (boxSize + boxGap);
          const clipId = boxIdx === 0 ? clipLeftId : clipRightId;

          return (
            <g key={boxIdx}>
              <rect x={bx} y={padY} width={boxSize} height={boxSize} rx={OUTER_RADIUS} fill={palette.boardBg} />

              <g clipPath={`url(#${clipId})`}>
                {Array.from({ length: 9 }).map((_, idx) => {
                  const r = Math.floor(idx / 3);
                  const c = idx % 3;
                  const x = bx + c * size;
                  const y = padY + r * size;
                  const isPointing = boxIdx === 0 && r === 0 && (c === 1 || c === 2);
                  const isElim = boxIdx === 1 && r === 0 && (c === 0 || c === 2);
                  const fill = isPointing ? pointingFill : isElim ? elimCellFill : palette.boardBg;

                  return <rect key={`bg-${idx}`} x={x} y={y} width={size} height={size} fill={fill} />;
                })}

                {/* Interior cell divider lines */}
                {[1, 2].map((lineIdx) => (
                  <React.Fragment key={`line-${lineIdx}`}>
                    <line
                      x1={bx + lineIdx * size}
                      y1={padY}
                      x2={bx + lineIdx * size}
                      y2={padY + boxSize}
                      stroke={palette.minorLine}
                      strokeWidth={1}
                    />
                    <line
                      x1={bx}
                      y1={padY + lineIdx * size}
                      x2={bx + boxSize}
                      y2={padY + lineIdx * size}
                      stroke={palette.minorLine}
                      strokeWidth={1}
                    />
                  </React.Fragment>
                ))}
              </g>

              {/* Single smooth curved outer frame per 3x3 box */}
              <rect
                x={bx}
                y={padY}
                width={boxSize}
                height={boxSize}
                rx={OUTER_RADIUS}
                fill="none"
                stroke={palette.outerFrame}
                strokeWidth={1.7}
              />

              {/* Cell digits & candidate pencil marks */}
              {Array.from({ length: 9 }).map((_, idx) => {
                const r = Math.floor(idx / 3);
                const c = idx % 3;
                const x = bx + c * size;
                const y = padY + r * size;
                const isPointing = boxIdx === 0 && r === 0 && (c === 1 || c === 2);
                const isElim = boxIdx === 1 && r === 0 && (c === 0 || c === 2);
                const clueText =
                  boxIdx === 0 && r === 0 && c === 0
                    ? "8"
                    : boxIdx === 0 && r === 1 && c === 1
                      ? "2"
                      : boxIdx === 0 && r === 2 && c === 0
                        ? "9"
                        : boxIdx === 1 && r === 0 && c === 1
                          ? "5"
                          : "";

                // Candidate 4 sits in top-left/middle pencil-note position so it reads unmistakably as a note
                const nx = x + 15;
                const ny = y + 18;

                return (
                  <g key={`fg-${idx}`}>
                    {clueText && (
                      <text
                        x={x + size / 2}
                        y={y + size / 2}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize="17"
                        fontWeight="700"
                        fill={palette.placedDigit}
                      >
                        {clueText}
                      </text>
                    )}

                    {isPointing && (
                      <g>
                        <rect
                          x={nx - 8}
                          y={ny - 8}
                          width={16}
                          height={16}
                          rx={5}
                          fill={palette.noteBadgeBg}
                        />
                        <text
                          x={nx}
                          y={ny}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize="10.5"
                          fontWeight="600"
                          fill={palette.noteText}
                        >
                          4
                        </text>
                      </g>
                    )}

                    {isElim && (
                      <g>
                        <rect
                          x={nx - 8}
                          y={ny - 8}
                          width={16}
                          height={16}
                          rx={5}
                          fill={palette.elimBadgeBg}
                        />
                        <text
                          x={nx}
                          y={ny}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize="10.5"
                          fontWeight="600"
                          fill={palette.elimColor}
                        >
                          4
                        </text>
                        <line
                          x1={nx - 5}
                          y1={ny - 5}
                          x2={nx + 5}
                          y2={ny + 5}
                          stroke={palette.elimColor}
                          strokeWidth={1.45}
                          strokeLinecap="round"
                        />
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </FigureShell>
  );
};

/**
 * Diagram 5: X-Wing Pattern (Rows 2 & 8 aligned on Columns 2 & 7 for candidate 6; eliminates 6 at R4C2 and R6C7).
 */
export const XWingDiagram: React.FC<RuleDiagramProps> = ({ labels, darkMode }) => {
  const clipId = `clip-xwing-${useId().replace(/:/g, "")}`;
  const size = 26;
  const pad = 12;
  const boardSize = size * 9;
  const palette = getGridPalette(darkMode);

  const corners = [
    { r: 1, c: 1 }, // R2C2
    { r: 1, c: 6 }, // R2C7
    { r: 7, c: 1 }, // R8C2
    { r: 7, c: 6 }, // R8C7
  ];
  const elimSamples = [
    { r: 3, c: 1 }, // R4C2 (Column 2 elimination)
    { r: 5, c: 6 }, // R6C7 (Column 7 elimination)
  ];

  const rowTint = darkMode ? "rgba(251, 191, 36, 0.14)" : "#FEF9C3";
  const colTint = darkMode ? "rgba(244, 63, 94, 0.14)" : "#FFE4E6";
  const cornerFill = darkMode ? "rgba(139, 92, 246, 0.35)" : "#EDE9FE";

  return (
    <FigureShell
      darkMode={darkMode}
      caption={labels.stepCaption5}
      legends={[
        { dotClass: "bg-violet-500", text: `${labels.xWingCornerLabel} (6)` },
        { dotClass: "bg-amber-400", text: `${labels.rowLabel} R2 & R8` },
        { dotClass: "bg-rose-500", text: `${labels.eliminatedLabel} (C2 & C7)` },
      ]}
    >
      <svg
        viewBox="0 0 258 258"
        className="w-full max-w-[260px] h-auto select-none"
        role="img"
        aria-label={labels.stepCaption5}
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={pad} y={pad} width={boardSize} height={boardSize} rx={OUTER_RADIUS} />
          </clipPath>
        </defs>

        <rect x={pad} y={pad} width={boardSize} height={boardSize} rx={OUTER_RADIUS} fill={palette.boardBg} />

        <g clipPath={`url(#${clipId})`}>
          {Array.from({ length: 81 }).map((_, idx) => {
            const r = Math.floor(idx / 9);
            const c = idx % 9;
            const isCorner = corners.some((pt) => pt.r === r && pt.c === c);
            const inBaseRow = r === 1 || r === 7;
            const inCoverCol = c === 1 || c === 6;

            let fill = palette.boardBg;
            if (isCorner) fill = cornerFill;
            else if (inBaseRow) fill = rowTint;
            else if (inCoverCol) fill = colTint;

            return (
              <rect
                key={idx}
                x={pad + c * size}
                y={pad + r * size}
                width={size}
                height={size}
                fill={fill}
              />
            );
          })}

          {/* Subtle interior cell lines */}
          {[1, 2, 4, 5, 7, 8].map((idx) => (
            <React.Fragment key={`minor-${idx}`}>
              <line
                x1={pad + idx * size}
                y1={pad}
                x2={pad + idx * size}
                y2={pad + boardSize}
                stroke={palette.minorLine}
                strokeWidth={0.85}
              />
              <line
                x1={pad}
                y1={pad + idx * size}
                x2={pad + boardSize}
                y2={pad + idx * size}
                stroke={palette.minorLine}
                strokeWidth={0.85}
              />
            </React.Fragment>
          ))}

          {/* Interior 3x3 box divider lines */}
          {[3, 6].map((idx) => (
            <React.Fragment key={`major-${idx}`}>
              <line
                x1={pad + idx * size}
                y1={pad}
                x2={pad + idx * size}
                y2={pad + boardSize}
                stroke={palette.majorLine}
                strokeWidth={1.6}
              />
              <line
                x1={pad}
                y1={pad + idx * size}
                x2={pad + boardSize}
                y2={pad + idx * size}
                stroke={palette.majorLine}
                strokeWidth={1.6}
              />
            </React.Fragment>
          ))}
        </g>

        {/* Single smooth curved outer frame */}
        <rect
          x={pad}
          y={pad}
          width={boardSize}
          height={boardSize}
          rx={OUTER_RADIUS}
          fill="none"
          stroke={palette.outerFrame}
          strokeWidth={1.7}
        />

        {/* Dashed X-Wing rectangle linking exact centers of R2C2, R2C7, R8C2, R8C7 */}
        <rect
          x={pad + 1.5 * size}
          y={pad + 1.5 * size}
          width={5 * size}
          height={6 * size}
          rx={4}
          fill="none"
          stroke={darkMode ? "#C4B5FD" : "#7C3AED"}
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />

        {/* Centered X-Wing corner candidate badges (6) */}
        {corners.map((pt, i) => {
          const cx = pad + pt.c * size + size / 2;
          const cy = pad + pt.r * size + size / 2;
          return (
            <g key={`corner-${i}`}>
              <rect
                x={cx - 8}
                y={cy - 8}
                width={16}
                height={16}
                rx={5}
                fill={darkMode ? "#7C3AED" : "#DDD6FE"}
              />
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="10.5"
                fontWeight="600"
                fill={darkMode ? "#FFFFFF" : "#4C1D95"}
              >
                6
              </text>
            </g>
          );
        })}

        {/* Centered red crossed-out candidate badges (6) in both Cover Columns C2 (R4C2) & C7 (R6C7) */}
        {elimSamples.map((pt, i) => {
          const cx = pad + pt.c * size + size / 2;
          const cy = pad + pt.r * size + size / 2;
          return (
            <g key={`elim-${i}`}>
              <rect
                x={cx - 8}
                y={cy - 8}
                width={16}
                height={16}
                rx={5}
                fill={palette.elimBadgeBg}
              />
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="10.5"
                fontWeight="600"
                fill={palette.elimColor}
              >
                6
              </text>
              <line
                x1={cx - 5}
                y1={cy - 5}
                x2={cx + 5}
                y2={cy + 5}
                stroke={palette.elimColor}
                strokeWidth={1.5}
                strokeLinecap="round"
              />
            </g>
          );
        })}
      </svg>
    </FigureShell>
  );
};
