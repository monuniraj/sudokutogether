import React from "react";

export interface Sudoku3DWatermarkProps {
  difficulty?: "EASY" | "MEDIUM" | "HARD" | "EXPERT" | string;
}

/**
 * 3D Isometric Sudoku Watermark
 * Renders an authentic 3D perspective 9x9 Sudoku grid using `currentColor`
 * to dynamically harmonize with the active difficulty card palette
 * (Easy: Emerald, Medium: Amber, Hard: Rose, Expert: Purple).
 */
export const Sudoku3DWatermark: React.FC<Sudoku3DWatermarkProps> = React.memo(() => {
  // Realistic, authentic Sudoku puzzle layout
  const printedClues: { r: number; c: number; val: number }[] = [
    { r: 0, c: 0, val: 5 }, { r: 0, c: 1, val: 3 }, { r: 0, c: 4, val: 7 },
    { r: 1, c: 0, val: 6 }, { r: 1, c: 3, val: 1 }, { r: 1, c: 4, val: 9 }, { r: 1, c: 5, val: 5 },
    { r: 2, c: 1, val: 9 }, { r: 2, c: 2, val: 8 }, { r: 2, c: 7, val: 6 },
    { r: 3, c: 0, val: 8 }, { r: 3, c: 4, val: 6 }, { r: 3, c: 8, val: 3 },
    { r: 4, c: 0, val: 4 }, { r: 4, c: 3, val: 8 }, { r: 4, c: 5, val: 3 }, { r: 4, c: 8, val: 1 },
    { r: 5, c: 4, val: 2 }, { r: 5, c: 8, val: 6 },
    { r: 6, c: 1, val: 6 }, { r: 6, c: 6, val: 2 }, { r: 6, c: 7, val: 8 },
    { r: 7, c: 3, val: 4 }, { r: 7, c: 4, val: 1 }, { r: 7, c: 5, val: 9 }, { r: 7, c: 8, val: 5 },
    { r: 8, c: 4, val: 8 }, { r: 8, c: 8, val: 9 },
  ];

  // User-entered / actively placed digits (including 7, 3, 2)
  const handwrittenDigits: { r: number; c: number; val: number }[] = [
    { r: 0, c: 7, val: 2 },
    { r: 2, c: 4, val: 3 },
    { r: 5, c: 0, val: 7 },
    { r: 8, c: 7, val: 7 },
  ];

  return (
    <div
      className="absolute inset-0 pointer-events-none select-none z-0 flex items-center justify-center overflow-hidden"
      style={{ perspective: "900px" }}
      aria-hidden="true"
    >
      <div
        style={{
          transform: "rotateX(44deg) rotateZ(-22deg) scale(1.4) translateY(12%)",
          transformStyle: "preserve-3d",
          opacity: 0.22,
          mixBlendMode: "soft-light",
          maskImage: "radial-gradient(ellipse at center, rgba(0,0,0,0.2) 20%, rgba(0,0,0,1) 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, rgba(0,0,0,0.2) 20%, rgba(0,0,0,1) 75%)",
        }}
        className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] flex items-center justify-center shrink-0"
      >
        <svg
          viewBox="0 0 270 270"
          width="100%"
          height="100%"
          className="overflow-visible text-current"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Faint, theme-matched background highlight tiles behind filled cells (7, 3, 2) */}
          {handwrittenDigits.map(({ r, c }, idx) => (
            <rect
              key={`highlight-${idx}`}
              x={c * 30 + 1.5}
              y={r * 30 + 1.5}
              width={27}
              height={27}
              rx={3}
              fill="currentColor"
              fillOpacity={0.16}
            />
          ))}

          {/* Standard inner cell borders: thin (1px) */}
          {[1, 2, 4, 5, 7, 8].map((i) => (
            <g key={`minor-grid-${i}`}>
              <line
                x1={i * 30}
                y1={0}
                x2={i * 30}
                y2={270}
                stroke="currentColor"
                strokeWidth={1}
                strokeOpacity={0.4}
              />
              <line
                x1={0}
                y1={i * 30}
                x2={270}
                y2={i * 30}
                stroke="currentColor"
                strokeWidth={1}
                strokeOpacity={0.4}
              />
            </g>
          ))}

          {/* 3x3 block separation dividers: bold (2.5px) */}
          {[0, 3, 6, 9].map((i) => (
            <g key={`major-grid-${i}`}>
              <line
                x1={i * 30}
                y1={0}
                x2={i * 30}
                y2={270}
                stroke="currentColor"
                strokeWidth={2.5}
                strokeOpacity={0.85}
              />
              <line
                x1={0}
                y1={i * 30}
                x2={270}
                y2={i * 30}
                stroke="currentColor"
                strokeWidth={2.5}
                strokeOpacity={0.85}
              />
            </g>
          ))}

          {/* Standard printed clue digits - crisp font weights proportionally centered */}
          {printedClues.map(({ r, c, val }, idx) => (
            <text
              key={`clue-${idx}`}
              x={c * 30 + 15}
              y={r * 30 + 15}
              textAnchor="middle"
              dominantBaseline="central"
              fill="currentColor"
              fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              fontWeight="700"
              fontSize="16"
              opacity={0.85}
            >
              {val}
            </text>
          ))}

          {/* User-entered / handwritten digits (7, 3, 2) matching app's marker handwriting style */}
          {handwrittenDigits.map(({ r, c, val }, idx) => (
            <text
              key={`handwritten-${idx}`}
              x={c * 30 + 15}
              y={r * 30 + 15}
              textAnchor="middle"
              dominantBaseline="central"
              fill="currentColor"
              className="handwriting"
              fontFamily="'Patrick Hand', 'Architects Daughter', 'Kalam', 'Caveat', 'Segoe Print', cursive, sans-serif"
              fontStyle="italic"
              fontWeight="900"
              fontSize="20"
              opacity={0.95}
            >
              {val}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
});

Sudoku3DWatermark.displayName = "Sudoku3DWatermark";
