import React from "react";
import { RulesDiagramLabels } from "../../../utils/rulesArticleTranslations";

export interface RuleDiagramProps {
  labels: RulesDiagramLabels;
  darkMode: boolean;
}

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
              darkMode ? "bg-zinc-800/90 text-zinc-200" : "bg-white text-stone-700 shadow-[0_2px_6px_rgba(15,23,42,0.04)]"
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
 * Diagram 1: Classic 9x9 Row, Column, and 3x3 Box House Intersection at R4C5.
 */
export const GridHousesDiagram: React.FC<RuleDiagramProps> = ({ labels, darkMode }) => {
  const size = 26;
  const pad = 12;
  const targetR = 3;
  const targetC = 4;

  const rowBg = darkMode ? "rgba(56, 189, 248, 0.20)" : "#E0F2FE";
  const colBg = darkMode ? "rgba(167, 139, 250, 0.22)" : "#EDE9FE";
  const boxBg = darkMode ? "rgba(251, 191, 36, 0.18)" : "#FEF3C7";
  const targetBg = darkMode ? "#10B981" : "#34D399";
  const neutralBg = darkMode ? "#18181B" : "#FFFFFF";
  const minorStroke = darkMode ? "#3F3F46" : "#E5E7EB";
  const majorStroke = darkMode ? "#A1A1AA" : "#78716C";

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
        <rect
          x={pad}
          y={pad}
          width={size * 9}
          height={size * 9}
          rx={10}
          fill={neutralBg}
        />
        {Array.from({ length: 81 }).map((_, idx) => {
          const r = Math.floor(idx / 9);
          const c = idx % 9;
          const inRow = r === targetR;
          const inCol = c === targetC;
          const inBox = Math.floor(r / 3) === 1 && Math.floor(c / 3) === 1;
          const isTarget = inRow && inCol;

          let fill = neutralBg;
          if (isTarget) fill = targetBg;
          else if (inRow && inBox) fill = rowBg;
          else if (inCol && inBox) fill = colBg;
          else if (inRow) fill = rowBg;
          else if (inCol) fill = colBg;
          else if (inBox) fill = boxBg;

          return (
            <rect
              key={idx}
              x={pad + c * size}
              y={pad + r * size}
              width={size}
              height={size}
              fill={fill}
              stroke={minorStroke}
              strokeWidth={0.8}
            />
          );
        })}

        {/* Bold 3x3 box boundaries */}
        {[0, 1, 2].flatMap((br) =>
          [0, 1, 2].map((bc) => (
            <rect
              key={`${br}-${bc}`}
              x={pad + bc * size * 3}
              y={pad + br * size * 3}
              width={size * 3}
              height={size * 3}
              fill="none"
              stroke={majorStroke}
              strokeWidth={1.6}
            />
          ))
        )}

        <text
          x={pad + targetC * size + size / 2}
          y={pad + targetR * size + size / 2 + 4}
          textAnchor="middle"
          fontSize="11"
          fontWeight="800"
          fill={darkMode ? "#052E16" : "#064E3B"}
        >
          ?
        </text>
      </svg>
    </FigureShell>
  );
};

/**
 * Diagram 2: 3x3 Box Pencil Marks (Candidate Notes Eliminated by Peers).
 */
export const PencilNotesDiagram: React.FC<RuleDiagramProps> = ({ labels, darkMode }) => {
  const cell = 64;
  const pad = 16;
  const boxFill = darkMode ? "#18181B" : "#FFFFFF";
  const targetFill = darkMode ? "rgba(16, 185, 129, 0.16)" : "#ECFDF5";
  const lineStroke = darkMode ? "#3F3F46" : "#D6D3D1";
  const clueColor = darkMode ? "#E4E4E7" : "#1C1917";
  const noteColor = darkMode ? "#7DD3FC" : "#0369A1";
  const elimColor = darkMode ? "#FB7185" : "#E11D48";

  const boxClues: Array<{ r: number; c: number; val?: string; notes?: number[]; eliminated?: number[] }> = [
    { r: 0, c: 0, val: "1" },
    { r: 0, c: 1, val: "3" },
    { r: 0, c: 2, notes: [5, 8], eliminated: [] },
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
        viewBox="0 0 224 224"
        className="w-full max-w-[224px] h-auto select-none"
        role="img"
        aria-label={labels.stepCaption2}
      >
        <rect
          x={pad}
          y={pad}
          width={cell * 3}
          height={cell * 3}
          rx={12}
          fill={boxFill}
          stroke={darkMode ? "#71717A" : "#A8A29E"}
          strokeWidth={2}
        />

        {boxClues.map((item, idx) => {
          const x = pad + item.c * cell;
          const y = pad + item.r * cell;
          const isFocus = item.r === 1 && item.c === 1;
          return (
            <g key={idx}>
              <rect
                x={x}
                y={y}
                width={cell}
                height={cell}
                fill={isFocus ? targetFill : "none"}
                stroke={lineStroke}
                strokeWidth={1}
              />
              {item.val && (
                <text
                  x={x + cell / 2}
                  y={y + cell / 2 + 7}
                  textAnchor="middle"
                  fontSize="20"
                  fontWeight="800"
                  fill={clueColor}
                >
                  {item.val}
                </text>
              )}
              {item.notes &&
                item.notes.map((digit) => {
                  const subR = Math.floor((digit - 1) / 3);
                  const subC = (digit - 1) % 3;
                  const nx = x + 13 + subC * 18;
                  const ny = y + 18 + subR * 17;
                  const isElim = item.eliminated?.includes(digit);
                  const isWinner = isFocus && !isElim;
                  return (
                    <g key={digit}>
                      {isWinner && (
                        <circle
                          cx={nx}
                          cy={ny - 4}
                          r={8}
                          fill={darkMode ? "#10B981" : "#A7F3D0"}
                        />
                      )}
                      <text
                        x={nx}
                        y={ny}
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight={isWinner ? "800" : "700"}
                        fill={
                          isElim
                            ? elimColor
                            : isWinner
                              ? darkMode
                                ? "#022C22"
                                : "#064E3B"
                              : noteColor
                        }
                      >
                        {digit}
                      </text>
                      {isElim && (
                        <line
                          x1={nx - 5}
                          y1={ny - 8}
                          x2={nx + 5}
                          y2={ny}
                          stroke={elimColor}
                          strokeWidth={1.6}
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
 * Diagram 3: Naked Pair Lock (R4C1={3,7} and R4C8={3,7} clearing R4C5={3,7,9} -> 9).
 */
export const NakedHiddenPairsDiagram: React.FC<RuleDiagramProps> = ({ labels, darkMode }) => {
  const cellW = 34;
  const cellH = 44;
  const padX = 12;
  const padY = 14;

  const cells: Array<{
    c: number;
    val?: string;
    pair?: [number, number];
    mixed?: { keep: number; elim: number[] };
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

  const baseFill = darkMode ? "#18181B" : "#FFFFFF";
  const pairFill = darkMode ? "rgba(139, 92, 246, 0.25)" : "#EDE9FE";
  const targetFill = darkMode ? "rgba(16, 185, 129, 0.20)" : "#ECFDF5";
  const borderStroke = darkMode ? "#52525B" : "#D6D3D1";

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
        viewBox="0 0 330 72"
        className="w-full max-w-[360px] h-auto select-none"
        role="img"
        aria-label={labels.stepCaption3}
      >
        {cells.map((item) => {
          const x = padX + item.c * cellW;
          const fill = item.pair ? pairFill : item.mixed ? targetFill : baseFill;
          return (
            <g key={item.c}>
              <rect
                x={x}
                y={padY}
                width={cellW}
                height={cellH}
                fill={fill}
                stroke={borderStroke}
                strokeWidth={1}
              />
              {item.val && (
                <text
                  x={x + cellW / 2}
                  y={padY + cellH / 2 + 5}
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight="700"
                  fill={darkMode ? "#D4D4D8" : "#57534E"}
                >
                  {item.val}
                </text>
              )}
              {item.pair && (
                <>
                  <text
                    x={x + 11}
                    y={padY + 26}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="800"
                    fill={darkMode ? "#DDD6FE" : "#5B21B6"}
                  >
                    {item.pair[0]}
                  </text>
                  <text
                    x={x + 23}
                    y={padY + 26}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="800"
                    fill={darkMode ? "#DDD6FE" : "#5B21B6"}
                  >
                    {item.pair[1]}
                  </text>
                </>
              )}
              {item.mixed && (
                <>
                  <text
                    x={x + 10}
                    y={padY + 17}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="700"
                    fill={darkMode ? "#FB7185" : "#E11D48"}
                  >
                    3
                  </text>
                  <line
                    x1={x + 6}
                    y1={padY + 11}
                    x2={x + 14}
                    y2={padY + 18}
                    stroke={darkMode ? "#FB7185" : "#E11D48"}
                    strokeWidth={1.5}
                  />
                  <text
                    x={x + 24}
                    y={padY + 17}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="700"
                    fill={darkMode ? "#FB7185" : "#E11D48"}
                  >
                    7
                  </text>
                  <line
                    x1={x + 20}
                    y1={padY + 11}
                    x2={x + 28}
                    y2={padY + 18}
                    stroke={darkMode ? "#FB7185" : "#E11D48"}
                    strokeWidth={1.5}
                  />
                  <text
                    x={x + cellW / 2}
                    y={padY + 36}
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight="900"
                    fill={darkMode ? "#6EE7B7" : "#047857"}
                  >
                    9
                  </text>
                </>
              )}
            </g>
          );
        })}
        {/* Box separators */}
        {[0, 3, 6].map((col) => (
          <rect
            key={col}
            x={padX + col * cellW}
            y={padY}
            width={cellW * 3}
            height={cellH}
            fill="none"
            stroke={darkMode ? "#A1A1AA" : "#78716C"}
            strokeWidth={1.8}
          />
        ))}
      </svg>
    </FigureShell>
  );
};

/**
 * Diagram 4: Pointing Pair in Box 1 (R1C2 & R1C3 claim digit 4 along Row 1, eliminating 4 in Box 2).
 */
export const PointingPairsDiagram: React.FC<RuleDiagramProps> = ({ labels, darkMode }) => {
  const size = 38;
  const padX = 16;
  const padY = 14;
  const boxGap = 12;

  const baseFill = darkMode ? "#18181B" : "#FFFFFF";
  const pointingFill = darkMode ? "rgba(56, 189, 248, 0.24)" : "#E0F2FE";
  const elimFill = darkMode ? "rgba(244, 63, 94, 0.16)" : "#FFE4E6";
  const borderStroke = darkMode ? "#3F3F46" : "#D6D3D1";
  const boxStroke = darkMode ? "#A1A1AA" : "#78716C";

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
        viewBox="0 0 272 142"
        className="w-full max-w-[290px] h-auto select-none"
        role="img"
        aria-label={labels.stepCaption4}
      >
        {/* Box 1 (left 3x3) and Box 2 (right 3x3) */}
        {[0, 1].map((boxIdx) => {
          const bx = padX + boxIdx * (size * 3 + boxGap);
          return (
            <g key={boxIdx}>
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

                return (
                  <g key={idx}>
                    <rect
                      x={x}
                      y={y}
                      width={size}
                      height={size}
                      fill={isPointing ? pointingFill : isElim ? elimFill : baseFill}
                      stroke={borderStroke}
                      strokeWidth={0.9}
                    />
                    {clueText && (
                      <text
                        x={x + size / 2}
                        y={y + size / 2 + 5}
                        textAnchor="middle"
                        fontSize="14"
                        fontWeight="700"
                        fill={darkMode ? "#E4E4E7" : "#44403C"}
                      >
                        {clueText}
                      </text>
                    )}
                    {isPointing && (
                      <text
                        x={x + size / 2}
                        y={y + size / 2 + 5}
                        textAnchor="middle"
                        fontSize="13"
                        fontWeight="800"
                        fill={darkMode ? "#7DD3FC" : "#0369A1"}
                      >
                        4
                      </text>
                    )}
                    {isElim && (
                      <>
                        <text
                          x={x + size / 2}
                          y={y + size / 2 + 5}
                          textAnchor="middle"
                          fontSize="13"
                          fontWeight="800"
                          fill={darkMode ? "#FB7185" : "#E11D48"}
                        >
                          4
                        </text>
                        <line
                          x1={x + 11}
                          y1={y + 11}
                          x2={x + size - 11}
                          y2={y + size - 11}
                          stroke={darkMode ? "#FB7185" : "#E11D48"}
                          strokeWidth={1.8}
                        />
                      </>
                    )}
                  </g>
                );
              })}
              <rect
                x={bx}
                y={padY}
                width={size * 3}
                height={size * 3}
                fill="none"
                stroke={boxStroke}
                strokeWidth={1.8}
              />
            </g>
          );
        })}

        {/* Pointing dashed alignment guide across Row 1 */}
        <line
          x1={padX + size * 1.4}
          y1={padY + size / 2}
          x2={padX + size * 3 + boxGap + size * 2.6}
          y2={padY + size / 2}
          stroke={darkMode ? "#38BDF8" : "#0284C7"}
          strokeWidth={1.5}
          strokeDasharray="4 3"
          opacity={0.7}
        />
      </svg>
    </FigureShell>
  );
};

/**
 * Diagram 5: X-Wing Pattern (Rows 2 & 8 aligned on Columns 2 & 7 for digit 6).
 */
export const XWingDiagram: React.FC<RuleDiagramProps> = ({ labels, darkMode }) => {
  const size = 24;
  const pad = 14;
  const corners = [
    { r: 1, c: 1 },
    { r: 1, c: 6 },
    { r: 7, c: 1 },
    { r: 7, c: 6 },
  ];
  const elimSamples = [
    { r: 3, c: 1 },
    { r: 5, c: 6 },
  ];

  const baseFill = darkMode ? "#18181B" : "#FFFFFF";
  const rowTint = darkMode ? "rgba(251, 191, 36, 0.14)" : "#FEF9C3";
  const colTint = darkMode ? "rgba(244, 63, 94, 0.14)" : "#FFE4E6";
  const cornerFill = darkMode ? "#8B5CF6" : "#DDD6FE";
  const minorStroke = darkMode ? "#3F3F46" : "#E5E7EB";
  const majorStroke = darkMode ? "#A1A1AA" : "#78716C";

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
        viewBox="0 0 244 244"
        className="w-full max-w-[244px] h-auto select-none"
        role="img"
        aria-label={labels.stepCaption5}
      >
        {Array.from({ length: 81 }).map((_, idx) => {
          const r = Math.floor(idx / 9);
          const c = idx % 9;
          const isCorner = corners.some((pt) => pt.r === r && pt.c === c);
          const inBaseRow = r === 1 || r === 7;
          const inCoverCol = c === 1 || c === 6;

          let fill = baseFill;
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
              stroke={minorStroke}
              strokeWidth={0.75}
            />
          );
        })}

        {/* Bold 3x3 outlines */}
        {[0, 1, 2].flatMap((br) =>
          [0, 1, 2].map((bc) => (
            <rect
              key={`${br}-${bc}`}
              x={pad + bc * size * 3}
              y={pad + br * size * 3}
              width={size * 3}
              height={size * 3}
              fill="none"
              stroke={majorStroke}
              strokeWidth={1.5}
            />
          ))
        )}

        {/* Dashed X-Wing rectangle & diagonals */}
        <rect
          x={pad + 1.5 * size}
          y={pad + 1.5 * size}
          width={5 * size}
          height={6 * size}
          fill="none"
          stroke={darkMode ? "#C4B5FD" : "#6D28D9"}
          strokeWidth={1.6}
          strokeDasharray="4 3"
        />

        {corners.map((pt, i) => (
          <text
            key={i}
            x={pad + pt.c * size + size / 2}
            y={pad + pt.r * size + size / 2 + 4}
            textAnchor="middle"
            fontSize="11"
            fontWeight="900"
            fill={darkMode ? "#FFFFFF" : "#4C1D95"}
          >
            6
          </text>
        ))}

        {elimSamples.map((pt, i) => {
          const cx = pad + pt.c * size + size / 2;
          const cy = pad + pt.r * size + size / 2;
          return (
            <g key={i}>
              <text
                x={cx}
                y={cy + 4}
                textAnchor="middle"
                fontSize="10"
                fontWeight="800"
                fill={darkMode ? "#FB7185" : "#E11D48"}
              >
                6
              </text>
              <line
                x1={cx - 5}
                y1={cy - 5}
                x2={cx + 5}
                y2={cy + 5}
                stroke={darkMode ? "#FB7185" : "#E11D48"}
                strokeWidth={1.5}
              />
            </g>
          );
        })}
      </svg>
    </FigureShell>
  );
};

