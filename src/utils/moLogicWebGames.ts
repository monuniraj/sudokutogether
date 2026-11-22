export interface MoLogicWebGameEntry {
  id: string;
  name: string;
  path: string;
  shortTagline: string;
  badge: string;
}

/**
 * Single data-driven registry of live, playable Mo Logic web games.
 * Used to auto-populate Web-only "More Games by Mo Logic" interlinks without
 * touching layout code or advertising unreleased placeholders.
 */
export const MO_LOGIC_WEB_GAMES: readonly MoLogicWebGameEntry[] = [
  {
    id: "sudoku",
    name: "Sudoku Sync",
    path: "/",
    shortTagline:
      "Classic 9×9 number puzzle with deterministic same-board multiplayer, Daily Challenge, and Smart Assistants.",
    badge: "9×9 Number Logic",
  },
  {
    id: "blocks",
    name: "Block Sync",
    path: "/blocks",
    shortTagline:
      "Calm 9×9 block placement with 3×3 box clears, Classic & Time Rush modes, and shared multiplayer rooms.",
    badge: "9×9 Block Puzzle",
  },
] as const;
