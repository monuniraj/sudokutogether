export type SeoDifficulty = "EASY" | "MEDIUM" | "HARD" | "EXPERT";

export interface DifficultySiloConfig {
  difficulty: SeoDifficulty;
  slug: "easy" | "medium" | "hard" | "expert";
  path: string;
  canonicalUrl: string;
  title: string;
  description: string;
  h1: string;
  badgeLabel: string;
  clueCount: number;
  emptyCells: number;
  targetAudience: string;
  primaryTechniques: string[];
  leadSummary: string;
  strategyHeading: string;
  strategyParagraphs: string[];
  tipsHeading: string;
  tips: string[];
  faqs: Array<{ q: string; a: string }>;
  crossLinkLabel: string;
  crossLinkSub: string;
}

export const SEO_SITE_ORIGIN = "https://sudokusync.com";

export const SEO_ROOT_META = {
  canonicalUrl: `${SEO_SITE_ORIGIN}/`,
  title: "SudokuSync - Real-Time Multiplayer Sudoku",
  description:
    "Play classic Sudoku with friends in real-time multiplayer mode on SudokuSync. Challenge friends on identical boards, track stats, and improve logical reasoning.",
} as const;

export const SEO_SILO_ORDER: readonly SeoDifficulty[] = [
  "EASY",
  "MEDIUM",
  "HARD",
  "EXPERT",
];

export const SEO_SILO_MAP: Record<SeoDifficulty, DifficultySiloConfig> = {
  EASY: {
    difficulty: "EASY",
    slug: "easy",
    path: "/easy",
    canonicalUrl: `${SEO_SITE_ORIGIN}/easy`,
    title: "Play Easy Sudoku Online Free | 51-Clue Beginner Puzzles — SudokuSync",
    description:
      "Solve free Easy Sudoku puzzles online with 51 starting clues and instant validation. Master Cross-Hatching Scanning, Box Elimination, or race friends live.",
    h1: "Play Easy Sudoku Online — Free 51-Clue Logic Puzzles",
    badgeLabel: "51 Clues • 30 Empty Cells",
    clueCount: 51,
    emptyCells: 30,
    targetAudience: "Beginners, Warm-Ups & Speed Runs",
    primaryTechniques: [
      "Cross-Hatching Scanning",
      "Box & Line Elimination",
      "Single-Digit Counting",
    ],
    leadSummary:
      "Easy Sudoku boards on SudokuSync start with 51 verified pre-filled clues and only 30 empty cells, leaving enough anchors across every 3x3 block to build clean deduction momentum without guessing. Every grid is punctured symmetrically with a deterministic PRNG seed and mathematically proven to contain one unique solution.",
    strategyHeading: "How to Master 51-Clue Easy Sudoku With Scanning",
    strategyParagraphs: [
      "With 51 starting clues distributed across the 9x9 board, most 3x3 boxes already contain five or six given digits. Start by Scanning rows and columns for your highest-frequency digits (numbers that already appear five to seven times on the grid) using Cross-Hatching: project two horizontal lines and one vertical line through adjacent boxes to isolate the single remaining open square.",
      "Pair Cross-Hatching Scanning with Full-House and Last-Remaining-Cell checks. Whenever a row, column, or 3x3 box reaches seven or eight filled digits, scan the missing numbers directly—one-step elimination completes these closures smoothly and helps train your speed for competitive personal best records.",
    ],
    tipsHeading: "Tactical Checklist for Easy Grids",
    tips: [
      "Focus on digits appearing most often first—locking a completed number early removes visual clutter across all nine boxes.",
      "Toggle Fast-Fill (Paintbrush) mode via the lightning button to place obvious Single-Box matches rapidly without repetitive cell-tapping.",
      "Practice under the 3-mistake limit to build clean accuracy habits before stepping up to Medium or Hard rooms.",
    ],
    faqs: [
      {
        q: "How many starting clues are in an Easy Sudoku puzzle?",
        a: "Every Easy Sudoku puzzle on SudokuSync starts with 51 fixed clues and 30 empty cells, mathematically checked by our backtracking uniqueness solver so every board has strictly one valid solution.",
      },
      {
        q: "Do I need candidate Pencil Notes for Easy Sudoku?",
        a: "Usually no. Nearly every empty cell on a 51-clue Easy board resolves through visual Cross-Hatching Scanning and simple row, column, or 3x3 box elimination.",
      },
    ],
    crossLinkLabel: "Easy Sudoku",
    crossLinkSub: "51 Clues • Scanning",
  },
  MEDIUM: {
    difficulty: "MEDIUM",
    slug: "medium",
    path: "/medium",
    canonicalUrl: `${SEO_SITE_ORIGIN}/medium`,
    title: "Play Medium Sudoku Online Free | 41-Clue Daily Puzzles — SudokuSync",
    description:
      "Play free Medium Sudoku with 41 starting clues on SudokuSync. Practice Elimination and Naked Singles, use smart candidate notes, or challenge friends via link.",
    h1: "Play Medium Sudoku Online — Free 41-Clue Daily Puzzles",
    badgeLabel: "41 Clues • 40 Empty Cells",
    clueCount: 41,
    emptyCells: 40,
    targetAudience: "Intermediate & Daily Logic Solvers",
    primaryTechniques: [
      "Line-to-Box Elimination",
      "Naked Singles Deduction",
      "Selective Pencil Notes",
    ],
    leadSummary:
      "Medium Sudoku introduces 41 starting clues and 40 open squares—shifting the balance away from quick last-cell fills toward cross-unit Elimination and Naked Singles. It is the benchmark mode for everyday cognitive flow, multiplayer duels with balanced pacing, and disciplined note-taking.",
    strategyHeading: "Solving 41-Clue Medium Boards With Elimination & Naked Singles",
    strategyParagraphs: [
      "Once the immediate Cross-Hatching Scanning pass stalls on a 41-clue grid, inspect high-density intersections where an empty cell shares a row, column, and 3x3 box containing seven or eight unique digits. Tally every already-placed number across those three intersecting houses; if eight digits are ruled out, the lone remaining candidate is a Naked Single.",
      "Whenever two possible spots remain for a digit inside a single 3x3 box and both spots sit on the same row or column (a Locked Candidate), you can safely eliminate that digit from the rest of that row or column outside the box—often cracking the entire middle tier of the board wide open.",
    ],
    tipsHeading: "Tactical Checklist for Medium Grids",
    tips: [
      "Record Pencil Notes sparingly using Snyder Notation—only mark a candidate inside a 3x3 box when it can fit in just two cells.",
      "Let Auto-Remove Notes clean up intersecting candidates automatically whenever you commit a verified digit.",
      "When two clues in one corridor fail to yield a placement, trace orthogonal Empty Rectangles and Naked Singles at triple intersections.",
    ],
    faqs: [
      {
        q: "What makes Medium Sudoku harder than Easy?",
        a: "Reducing starting clues from 51 down to 41 increases empty cells to 40, meaning direct Scanning alone runs out partway through and requires combining Elimination with Naked Singles.",
      },
      {
        q: "Are Medium multiplayer rooms identical for both players?",
        a: "Yes. Every multiplayer room encodes a single canonical PRNG seed so both you and your opponent play the exact same 41-clue board fairly.",
      },
    ],
    crossLinkLabel: "Medium Sudoku",
    crossLinkSub: "41 Clues • Singles",
  },
  HARD: {
    difficulty: "HARD",
    slug: "hard",
    path: "/hard",
    canonicalUrl: `${SEO_SITE_ORIGIN}/hard`,
    title: "Play Hard Sudoku Online Free | 33-Clue Strategy Puzzles — SudokuSync",
    description:
      "Challenge yourself with free 33-clue Hard Sudoku online on SudokuSync. Apply Hidden Pairs, Triples, and Pencil Notes to crack sparse single-solution grids.",
    h1: "Play Hard Sudoku Online — Free 33-Clue Strategy Puzzles",
    badgeLabel: "33 Clues • 48 Empty Cells",
    clueCount: 33,
    emptyCells: 48,
    targetAudience: "Experienced & Analytical Solvers",
    primaryTechniques: [
      "Hidden Pairs & Triples",
      "Pointing Pairs Elimination",
      "Full Candidate Pencil Notes",
    ],
    leadSummary:
      "Hard Sudoku drops starting clues to 33 (leaving 48 open cells), creating sparse corridors where single-pass scanning reveals only initial footholds. Progression relies on tracking candidate sets cleanly, spotting Hidden Pairs and Triples, and eliminating indirect possibilities step by step.",
    strategyHeading: "Breaking 33-Clue Hard Grids With Hidden Pairs & Triples",
    strategyParagraphs: [
      "On a 33-clue puzzle, Naked Singles frequently stay concealed inside busy cells populated with four or five candidates. Activate Notes Mode and systematically mark full candidates across tight rows or boxes. When two specific digits appear strictly inside the exact same two squares of a house—even alongside other candidate numbers—they form a Hidden Pair, letting you strip away all extra candidates from those two squares.",
      "Extend the same principle to Hidden Triples and Pointing Pairs: whenever a candidate in a 3x3 box aligns along a single row or column, eliminate that digit from the rest of that line outside the box to uncover locked singles and cascade through stubborn middle blocks.",
    ],
    tipsHeading: "Tactical Checklist for Hard Grids",
    tips: [
      "Populate clean candidate Pencil Notes in cramped rows first before searching randomly across all 81 squares.",
      "Look closely for Naked Pairs and Hidden Pairs sharing only two digits—stripping the other marks almost always exposes a new Single.",
      "Never guess: every SudokuSync Hard puzzle is uniqueness-verified so pure logic guarantees a deterministic next move.",
    ],
    faqs: [
      {
        q: "How many clues does Hard Sudoku have on SudokuSync?",
        a: "Hard puzzles contain 33 starting clues and 48 blank cells, engineered to demand intermediate-to-advanced deduction like Pointing Pairs, Naked Pairs, and Hidden Triples.",
      },
      {
        q: "Do Hard boards ever require trial-and-error guessing?",
        a: "Never. Every generated board undergoes exact solution-counting verification during creation, guaranteeing 100% pure logical solvability without bifurcation guessing.",
      },
    ],
    crossLinkLabel: "Hard Sudoku",
    crossLinkSub: "33 Clues • Hidden Pairs",
  },
  EXPERT: {
    difficulty: "EXPERT",
    slug: "expert",
    path: "/expert",
    canonicalUrl: `${SEO_SITE_ORIGIN}/expert`,
    title: "Play Expert Sudoku Online Free | 27-Clue X-Wing Puzzles — SudokuSync",
    description:
      "Test your mastery on free 27-clue Expert Sudoku puzzles online. Hunt X-Wing patterns, Hidden Triples, and deep candidate chains with friends on SudokuSync.",
    h1: "Play Expert Sudoku Online — Free 27-Clue X-Wing Puzzles",
    badgeLabel: "27 Clues • 54 Empty Cells",
    clueCount: 27,
    emptyCells: 54,
    targetAudience: "Advanced Tacticians & Tournament Players",
    primaryTechniques: [
      "X-Wing Rectangular Locks",
      "Hidden Pairs & Triples",
      "Chained Candidate Pruning",
    ],
    leadSummary:
      "Expert Sudoku strips the board down to just 27 initial clues and 54 blank cells—pushing logical deduction into sparse high-tension territory. Designed for veteran players, Expert grids reward disciplined Pencil Notes maintenance, structural pattern spotting like X-Wing formations, and calm accuracy under pressure.",
    strategyHeading: "Cracking 27-Clue Expert Grids With X-Wing & Chained Elimination",
    strategyParagraphs: [
      "With only 27 starting digits anchoring the grid, most boxes open with just two or three clues. Once foundational Scanning and Hidden Pairs plateau, filter your board digit-by-digit looking for an X-Wing: find a candidate digit that appears in strictly two columns within row A and strictly the exact same two columns within row B. Because those four cells form a locked logical rectangle, that digit must occupy opposite corners—allowing you to delete it from every other row inside those two columns.",
      "Combine X-Wing pruning with Claiming (Box-Line Reduction) and Hidden Triples. Clearing just two or three strategic candidates along intersecting bands collapses chains of unsolved cells and preserves your clean zero-mistake streak on the Personal Best leaderboard.",
    ],
    tipsHeading: "Tactical Checklist for Expert Grids",
    tips: [
      "Tap numbers on the keypad to spotlight all instances and candidate notes of a single digit across the board when hunting X-Wing rectangles.",
      "Audit full candidate intersections in bands of three boxes to spot Claiming Pairs early before searching deeper chains.",
      "Stay patient under 3-mistake rules—note verification beats rapid tapping on 27-clue grids every time.",
    ],
    faqs: [
      {
        q: "How sparse is an Expert Sudoku puzzle on SudokuSync?",
        a: "Expert puzzles begin with 27 starting clues and 54 empty cells—half as many clues as Easy—requiring advanced candidate techniques such as Hidden Triples and X-Wing eliminations.",
      },
      {
        q: "Do Personal Best times count on Expert if hints or unlimited mistakes are used?",
        a: "No. To protect competitive leaderboard integrity, Personal Best times strictly require standard mistake enforcement (max 3 mistakes) and qualify only under fair-play hint limits.",
      },
    ],
    crossLinkLabel: "Expert Sudoku",
    crossLinkSub: "27 Clues • X-Wing",
  },
};

export function parseDifficultyFromPath(pathname?: string | null): SeoDifficulty | null {
  if (!pathname) return null;
  const cleaned = pathname.trim().replace(/^\/+|\/+$/g, "").toLowerCase();
  if (cleaned === "easy") return "EASY";
  if (cleaned === "medium") return "MEDIUM";
  if (cleaned === "hard") return "HARD";
  if (cleaned === "expert") return "EXPERT";
  return null;
}

export function getDifficultyPath(difficulty: SeoDifficulty): string {
  return SEO_SILO_MAP[difficulty].path;
}

export function getDifficultyCanonicalUrl(difficulty: SeoDifficulty): string {
  return SEO_SILO_MAP[difficulty].canonicalUrl;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildStaticNoscriptHtml(config: DifficultySiloConfig): string {
  const techniquesHtml = config.primaryTechniques
    .map((tech) => `<li>${escapeHtml(tech)}</li>`)
    .join("\n        ");
  const strategyHtml = config.strategyParagraphs
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join("\n      ");
  const tipsHtml = config.tips
    .map((tip) => `<li>${escapeHtml(tip)}</li>`)
    .join("\n        ");
  const faqsHtml = config.faqs
    .map(
      (faq) =>
        `<h3>${escapeHtml(faq.q)}</h3>\n      <p>${escapeHtml(faq.a)}</p>`
    )
    .join("\n      ");
  const siloNavLinks = SEO_SILO_ORDER.map((lvl) => {
    const item = SEO_SILO_MAP[lvl];
    return `<a href="${item.path}" style="color: #0369a1; text-decoration: underline;">${escapeHtml(item.crossLinkLabel)} (${item.clueCount} Clues)</a>`;
  }).join(" | ");

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 2rem; max-width: 820px; margin: 0 auto; line-height: 1.65; color: #1e1e1e; background-color: #fdfbf7;">
      <h1>${escapeHtml(config.h1)}</h1>
      <p><strong>Grid Specification:</strong> ${config.clueCount} starting clues, ${config.emptyCells} empty cells &mdash; ${escapeHtml(config.targetAudience)}.</p>
      <p>${escapeHtml(config.leadSummary)}</p>
      <h2>${escapeHtml(config.strategyHeading)}</h2>
      ${strategyHtml}
      <h2>Core Techniques Used</h2>
      <ul>
        ${techniquesHtml}
      </ul>
      <h2>Quick Solving Checklist</h2>
      <ul>
        ${tipsHtml}
      </ul>
      <h2>${escapeHtml(config.crossLinkLabel)} Questions &amp; Answers</h2>
      ${faqsHtml}
      <nav aria-label="Difficulty Silos" style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #e5e7eb;">
        <strong>Browse All Difficulties:</strong> ${siloNavLinks}
      </nav>
      <footer style="margin-top: 1.5rem; display: flex; flex-wrap: wrap; gap: 1rem; align-items: center;">
        <a href="/" style="color: #0369a1; text-decoration: underline;">Home</a> |
        <a href="/about.html" style="color: #0369a1; text-decoration: underline;">About Us</a> |
        <a href="/contact.html" style="color: #0369a1; text-decoration: underline;">Contact Us</a> |
        <a href="/privacy.html" style="color: #0369a1; text-decoration: underline;">Privacy Policy</a> |
        <a href="/terms.html" style="color: #0369a1; text-decoration: underline;">Terms of Service</a>
        <span style="opacity: 0.8; font-family: monospace; font-size: 11px; margin-left: 0.5rem;">&copy; 2026 SudokuSync. All rights reserved.</span>
      </footer>
    </div>
  `.trim();
}
