import React from "react";

export interface BlockSyncLogoProps {
  size?: number;
  isDarkMode?: boolean;
  className?: string;
}

/**
 * Reusable placeholder SVG logo for Block Sync.
 * Self-contained so swapping to the final official brand asset later only requires
 * editing this file.
 */
export const BlockSyncLogo: React.FC<BlockSyncLogoProps> = ({
  size = 40,
  isDarkMode = false,
  className = "",
}) => {
  const backingFill = isDarkMode ? "#1D2834" : "#E8F3FA";
  const emptySlotFill = isDarkMode ? "#141A21" : "#D2E4F1";
  const highlightOpacity = isDarkMode ? 0.32 : 0.45;

  const tiles: ReadonlyArray<{
    x: number;
    y: number;
    fill: string;
    empty?: boolean;
  }> = [
    // Row 0: Sky-Cyan L-top + Golden-Yellow + Recessed Empty
    { x: 6, y: 6, fill: "#22C7F0" },
    { x: 15.9, y: 6, fill: "#F5B700" },
    { x: 25.8, y: 6, fill: emptySlotFill, empty: true },
    // Row 1: Sky-Cyan L-base (2 tiles) + Recessed Empty
    { x: 6, y: 15.9, fill: "#22C7F0" },
    { x: 15.9, y: 15.9, fill: "#22C7F0" },
    { x: 25.8, y: 15.9, fill: emptySlotFill, empty: true },
    // Row 2: Emerald-Green (2 tiles) + Soft-Lavender
    { x: 6, y: 25.8, fill: "#10C981" },
    { x: 15.9, y: 25.8, fill: "#10C981" },
    { x: 25.8, y: 25.8, fill: "#C084FC" },
  ];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={`rounded-xl shrink-0 select-none ${className}`.trim()}
    >
      <rect width="40" height="40" rx="10" fill={backingFill} />
      {tiles.map((tile, idx) => (
        <g key={idx}>
          <rect
            x={tile.x}
            y={tile.y}
            width="8.2"
            height="8.2"
            rx="2.3"
            fill={tile.fill}
          />
          {!tile.empty && (
            <rect
              x={tile.x + 1.1}
              y={tile.y + 0.9}
              width="6"
              height="1.6"
              rx="0.8"
              fill="#FFFFFF"
              fillOpacity={highlightOpacity}
            />
          )}
        </g>
      ))}
    </svg>
  );
};

export default BlockSyncLogo;
