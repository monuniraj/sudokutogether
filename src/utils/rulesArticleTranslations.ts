import { Language } from "../i18n/translations";

export interface RulesQuickJumpTab {
  id:
    | "rules-basics"
    | "rules-notes"
    | "rules-strategies"
    | "rules-advanced"
    | "rules-assistants"
    | "rules-faq";
  label: string;
}

export interface RulesDiagramLabels {
  rowLabel: string;
  columnLabel: string;
  boxLabel: string;
  targetCellLabel: string;
  candidatesLabel: string;
  eliminatedLabel: string;
  lockedPairLabel: string;
  pointingLineLabel: string;
  xWingCornerLabel: string;
  stepCaption1: string;
  stepCaption2: string;
  stepCaption3: string;
  stepCaption4: string;
  stepCaption5: string;
}

export interface RulesStrategyCard {
  id: string;
  name: string;
  levelBadge: string;
  summary: string;
  howToSpot: string;
  exampleNote: string;
}

export interface RulesAssistantItem {
  id: string;
  name: string;
  badge: string;
  description: string;
  whenToUse: string;
}

export interface RulesFaqItem {
  question: string;
  answer: string;
}

export interface RulesContextualTemplates {
  beginnerCtaTemplate: string;
  notesCtaTemplate: string;
  strategiesCtaTemplate: string;
  advancedCtaTemplate: string;
  linkLabels: {
    easyLink: string;
    mediumLink: string;
    hardLink: string;
    expertLink: string;
    dailyLink: string;
    solverLink: string;
  };
}

export interface RulesArticleLocaleContent {
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    readingBadge: string;
  };
  quickJumpTabs: readonly [
    RulesQuickJumpTab,
    RulesQuickJumpTab,
    RulesQuickJumpTab,
    RulesQuickJumpTab,
    RulesQuickJumpTab,
    RulesQuickJumpTab
  ];
  diagramLabels: RulesDiagramLabels;
  basics: {
    heading: string;
    intro: string;
    coreRules: readonly { title: string; desc: string }[];
    coordinatesTitle: string;
    coordinatesDesc: string;
    difficultyScaleTitle: string;
    difficultyRows: readonly {
      difficulty: "EASY" | "MEDIUM" | "HARD" | "EXPERT";
      label: string;
      clues: string;
      logicSummary: string;
    }[];
  };
  notes: {
    heading: string;
    intro: string;
    workflowTitle: string;
    workflowSteps: readonly string[];
    shortcutsTitle: string;
    shortcuts: readonly { keys: string; action: string }[];
  };
  strategies: {
    heading: string;
    intro: string;
    items: readonly [
      RulesStrategyCard,
      RulesStrategyCard,
      RulesStrategyCard,
      RulesStrategyCard,
      RulesStrategyCard
    ];
  };
  advanced: {
    heading: string;
    intro: string;
    items: readonly [
      RulesStrategyCard,
      RulesStrategyCard,
      RulesStrategyCard
    ];
  };
  assistants: {
    heading: string;
    intro: string;
    items: readonly [
      RulesAssistantItem,
      RulesAssistantItem,
      RulesAssistantItem,
      RulesAssistantItem,
      RulesAssistantItem,
      RulesAssistantItem,
      RulesAssistantItem
    ];
  };
  contextualLinks: RulesContextualTemplates;
  faq: {
    heading: string;
    items: readonly [
      RulesFaqItem,
      RulesFaqItem,
      RulesFaqItem,
      RulesFaqItem,
      RulesFaqItem
    ];
  };
}

export const RULES_ARTICLE_TRANSLATIONS: Record<Language, RulesArticleLocaleContent> = {
  en: {
    hero: {
      badge: "SudokuSync Strategy Manual",
      title: "Sudoku Rules, Solving Strategies & Smart Assistants",
      subtitle:
        "Master classic 9x9 Sudoku from your first grid house to Expert Fish and Wing deductions, and configure every in-game Smart Assistant and keyboard shortcut built into SudokuSync.",
      readingBadge: "Complete 9x9 Guide",
    },
    quickJumpTabs: [
      { id: "rules-basics", label: "Core Rules" },
      { id: "rules-notes", label: "Pencil Notes" },
      { id: "rules-strategies", label: "Core Techniques" },
      { id: "rules-advanced", label: "Expert Patterns" },
      { id: "rules-assistants", label: "Smart Assistants" },
      { id: "rules-faq", label: "FAQs" },
    ],
    diagramLabels: {
      rowLabel: "Row House",
      columnLabel: "Column House",
      boxLabel: "3x3 Box",
      targetCellLabel: "Target",
      candidatesLabel: "Notes",
      eliminatedLabel: "Eliminate",
      lockedPairLabel: "Pair Lock",
      pointingLineLabel: "Box-Line",
      xWingCornerLabel: "X-Wing",
      stepCaption1: "Diagram 1: A 9x9 cell belongs to three intersecting houses: one row, one column, and one 3x3 box.",
      stepCaption2: "Diagram 2: Pencil marks narrow empty cells to valid candidates before committing final digits.",
      stepCaption3: "Diagram 3: Naked Pairs lock two digits inside two cells so other candidates in that house clear out.",
      stepCaption4: "Diagram 4: Pointing Pairs align a candidate inside one 3x3 box along a shared row or column.",
      stepCaption5: "Diagram 5: X-Wing base corners form a rectangle that eliminates the digit along both cover lines.",
    },
    basics: {
      heading: "1. Classic 9x9 Grid Anatomy & Core Rules",
      intro:
        "Every SudokuSync board uses the classic 9x9 layout divided into 81 cells and nine 3x3 boxes. Sudoku is pure logic rather than arithmetic: digits 1 through 9 act strictly as distinct symbols.",
      coreRules: [
        {
          title: "One 1–9 Set Per Row",
          desc: "Each of the 9 horizontal rows must contain digits 1 through 9 with zero repeats.",
        },
        {
          title: "One 1–9 Set Per Column",
          desc: "Each of the 9 vertical columns must hold all nine digits 1 through 9 exactly once.",
        },
        {
          title: "One 1–9 Set Per 3x3 Box",
          desc: "Each of the nine bold 3x3 subgrids (houses) must contain 1 through 9 without duplicates.",
        },
        {
          title: "Unique Solution & Mistake Validation",
          desc: "Every generated board in SudokuSync is verified for a single unique solution. Optional Mistake Limit tracks incorrect entries (default 3 mistakes in Solo or configurable limits in Multiplayer Challenge rooms) without changing starting clues.",
        },
      ],
      coordinatesTitle: "Standard Coordinate Notation (R1C1–R9C9)",
      coordinatesDesc:
        "Solvers label cells by Row (R1–R9 from top to bottom) and Column (C1–C9 from left to right). For example, R1C1 is the top-left corner and R9C9 is the bottom-right corner. Three intersecting houses—Row, Column, and 3x3 Box—govern up to 20 peer cells around any square.",
      difficultyScaleTitle: "SudokuSync Difficulty Scale & Clue Counts",
      difficultyRows: [
        {
          difficulty: "EASY",
          label: "Easy",
          clues: "51 Clues (30 Empty)",
          logicSummary: "Balanced 3x3 boxes solved smoothly with Last Free Cell and Singles only.",
        },
        {
          difficulty: "MEDIUM",
          label: "Medium",
          clues: "39 Clues (42 Empty)",
          logicSummary: "Balanced 3x3 boxes combining Line Hidden Singles, Box Hidden Singles, and Naked Singles.",
        },
        {
          difficulty: "HARD",
          label: "Hard",
          clues: "30 Clues (51 Empty)",
          logicSummary: "Digit starvation with Pointing Pairs, Box-Line Reduction, Naked/Hidden Pairs, and Triples.",
        },
        {
          difficulty: "EXPERT",
          label: "Expert",
          clues: "25 Clues (56 Empty)",
          logicSummary: "Strict digit starvation requiring X-Wing, Y-Wing, Swordfish, Skyscraper, and multi-step chains.",
        },
      ],
    },
    notes: {
      heading: "2. Pencil Marks (Candidate Notes) & Keyboard Speed",
      intro:
        "Guessing breaks the unique-solution chain and costs mistakes. Instead, switch Pencil Notes ON whenever a cell is uncertain so you can track every legal candidate digit cleanly inside each square.",
      workflowTitle: "Clean Pencil-Mark Workflow",
      workflowSteps: [
        "Pass 1 — Fill obvious Full House and Scanning Singles first before marking up notes.",
        "Pass 2 — Switch to Pencil Notes when scanning stalls, noting digits that fit only two spots in a 3x3 box (Snyder notation) or full candidates on Hard and Expert grids.",
        "Pass 3 — Keep Auto-Remove Notes enabled in Settings so placing a final digit automatically strips stale candidates from peer cells in that row, column, and box.",
        "Pass 4 — Re-scan rows, columns, and boxes whenever notes shrink to reveal newly created Hidden Singles or Locked Pairs.",
      ],
      shortcutsTitle: "Verified SudokuSync Keyboard Controls",
      shortcuts: [
        { keys: "1–9 / Numpad 1–9", action: "Enter a final digit or toggle candidate notes (locks/unlocks paint digit in Fast Fill mode)." },
        { keys: "Backspace / Delete", action: "Clear your entered digit or notes from the selected editable cell." },
        { keys: "Spacebar / N", action: "Toggle between Final Digit entry and Pencil Notes without scrolling the page." },
        { keys: "Ctrl + Z / Cmd + Z", action: "Step backward through previous entries and candidate note edits." },
        { keys: "H", action: "Trigger a Smart Logic Hint on the active board when stuck on a bottleneck." },
        { keys: "Arrow Keys / Tab / Esc", action: "Move cell selection across the 9x9 grid, traverse menus, or close active modals." },
      ],
    },
    strategies: {
      heading: "3. Beginner & Intermediate Solving Techniques",
      intro:
        "Progress systematically from single-house scans to pair locks and box-line intersections. Master these five techniques to clear Easy, Medium, and Hard SudokuSync boards without guessing.",
      items: [
        {
          id: "full-house",
          name: "Last Free Cell (Full House)",
          levelBadge: "Beginner",
          summary: "When eight cells of a row, column, or 3x3 box are filled, the single empty cell must take the one missing digit.",
          howToSpot: "Watch any house with only one blank square left and count from 1 to 9.",
          exampleNote: "Row 2 contains 1, 2, 3, 4, 6, 7, 8, 9. The single open cell R2C5 is forced to be 5.",
        },
        {
          id: "scanning",
          name: "Scanning & Cross-Hatching",
          levelBadge: "Beginner",
          summary: "Project horizontal rows and vertical columns across a 3x3 box to eliminate occupied lines and isolate a single remaining slot.",
          howToSpot: "Pick a digit that appears twice inside a band of three adjacent 3x3 boxes and cross-hatch the third box.",
          exampleNote: "If 7 appears in Row 1 and Row 3, the third top-band box can only accept 7 in Row 2.",
        },
        {
          id: "naked-hidden-singles",
          name: "Naked Singles & Hidden Singles",
          levelBadge: "Beginner–Medium",
          summary: "A Naked Single leaves only one possible candidate inside a cell after checking its peers. A Hidden Single is a digit that can appear in only one cell of a house even when that cell holds several notes.",
          howToSpot: "Enable Highlight Related Area for Naked Singles, or highlight a digit across the grid to spot Hidden Singles.",
          exampleNote: "R5C4 allows {2, 6, 8}, yet 8 appears nowhere else in Column 4—making R5C4 a Hidden Single 8.",
        },
        {
          id: "pairs-triples",
          name: "Naked Pairs, Hidden Pairs & Triples",
          levelBadge: "Medium–Hard",
          summary: "When two cells inside one house share the exact same two candidates {A, B}, no other cell in that house can contain A or B. Triples extend this lock across three cells and three digits.",
          howToSpot: "Look for two bivalue cells with identical {A, B} pencil marks in the same row, column, or 3x3 box.",
          exampleNote: "R4C1={3, 7} and R4C8={3, 7} lock 3 and 7 in Row 4, clearing 3 and 7 from R4C5={3, 7, 9} to reveal 9.",
        },
        {
          id: "pointing-box-line",
          name: "Pointing Pairs & Box-Line Reduction",
          levelBadge: "Hard",
          summary: "When all candidates for a digit inside a 3x3 box lie on a single row or column, eliminate that digit from the rest of that line outside the box (Pointing Pair). Conversely, if a line limits a digit to one 3x3 box, clear it from the rest of that box (Box-Line Reduction).",
          howToSpot: "Inspect aligned candidates along a shared box-row or box-column intersection.",
          exampleNote: "In Box 1, digit 4 sits only in R1C2 and R1C3. You can safely erase 4 from R1C5 through R1C9.",
        },
      ],
    },
    advanced: {
      heading: "4. Advanced Expert Patterns",
      intro:
        "When 25-clue Expert boards hit a 0-Single bottleneck after Pointing Pairs and Triples, multi-house fish and wing patterns unlock clean eliminations.",
      items: [
        {
          id: "x-wing",
          name: "X-Wing Strategy",
          levelBadge: "Expert Fish",
          summary: "A digit appears in exactly two candidate cells in two different rows, and both rows align in the exact same two columns—forming a locked rectangle.",
          howToSpot: "Look for a 2x2 rectangular grid of candidates for one digit across two base rows (or two base columns).",
          exampleNote: "Digit 6 sits only at {C2, C7} in Row 2 and Row 8. Remove 6 from all other cells in Columns 2 and 7.",
        },
        {
          id: "y-wing",
          name: "Y-Wing (XY-Wing) Strategy",
          levelBadge: "Expert Wing",
          summary: "A bivalue pivot cell {X, Y} sees two bivalue pincers {X, Z} and {Y, Z}. Regardless of whether the pivot resolves to X or Y, one pincer must equal Z.",
          howToSpot: "Find a two-candidate pivot connected to two two-candidate pincers sharing the elimination digit Z.",
          exampleNote: "Pivot R3C3={2, 5} sees pincers R3C9={2, 9} and R7C3={5, 9}. Any cell seeing both pincers cannot be 9.",
        },
        {
          id: "swordfish",
          name: "Swordfish Strategy",
          levelBadge: "Expert 3x3 Fish",
          summary: "Extends X-Wing to three base rows where a digit appears in 2 or 3 cells per row, all confined within the exact same three columns.",
          howToSpot: "Filter candidates for one digit and check three rows whose positions stay inside three shared columns.",
          exampleNote: "Digit 3 in Rows 1, 5, and 9 falls strictly inside Columns 3, 6, and 8—eliminating 3 elsewhere in those columns.",
        },
      ],
    },
    assistants: {
      heading: "5. Smart Assistants Guide (All 7 In-Game Settings)",
      intro:
        "Open Settings -> Smart Assistants at any time to tailor visual aids and input efficiency to your preferred challenge level, from full beginner visibility to pure tournament minimalism.",
      items: [
        {
          id: "highlight-identical",
          name: "Highlight Identical Numbers",
          badge: "Visual Aid",
          description: "Highlights every matching digit across the entire 9x9 grid whenever you select a filled cell.",
          whenToUse: "Ideal for fast Cross-Hatching scans across bands and checking if all nine instances of a digit are placed.",
        },
        {
          id: "remaining-numbers",
          name: "Show Remaining Numbers",
          badge: "Keypad Counter",
          description: "Displays subtle live counters on each 1–9 keypad button showing how many placements remain on the board.",
          whenToUse: "Helps prioritize high-frequency digits (`1` or `2` remaining) near endgame cleanups.",
        },
        {
          id: "highlight-area",
          name: "Highlight Related Area",
          badge: "House Focus",
          description: "Softly shades the connected row, column, and 3x3 box intersecting the active cell.",
          whenToUse: "Prevents line-reading mistakes on tall screens and speeds up Naked Single checks.",
        },
        {
          id: "auto-remove-notes",
          name: "Auto-Remove Notes",
          badge: "Note Hygiene",
          description: "Automatically clears conflicting candidate notes from connected row, column, and 3x3 box cells whenever you place a final digit.",
          whenToUse: "Keep ON during timed Solo, Daily Challenge, or Multiplayer races so Pair and X-Wing scans stay accurate.",
        },
        {
          id: "auto-notes",
          name: "Auto-Notes",
          badge: "Hard & Expert Only",
          description: "Automatically populates valid legal candidate notes across empty cells strictly on Hard and Expert puzzles.",
          whenToUse: "Helpful when jumping straight into Pointing Pairs, X-Wing, and Y-Wing pattern practice without manual setup.",
        },
        {
          id: "fast-fill",
          name: "Fast Fill (Number-First)",
          badge: "Speed Input",
          description: "Locks an active digit on the keypad so tapping multiple cells fills final numbers or candidate marks rapidly without re-selecting cells first.",
          whenToUse: "Pairs cleanly with Numpad 1–9 or touch sweeps during Daily Challenge and Multiplayer speed runs.",
        },
        {
          id: "auto-switch-completed",
          name: "Auto-Switch Completed Numbers",
          badge: "Flow Assist",
          description: "Automatically advances your active number brush to the next incomplete digit once all 9 instances of the current number are placed.",
          whenToUse: "Eliminates extra taps between digits when sweeping through Easy, Medium, or endgame sequences.",
        },
      ],
    },
    contextualLinks: {
      beginnerCtaTemplate:
        "Ready to test Grid Houses and Scanning? Warm up on {{easyLink}} (51 clues) or step into {{mediumLink}} (39 clues).",
      notesCtaTemplate:
        "Want to drill clean Pencil Marks or verify newspaper puzzles cell by cell? Try {{hardLink}} (30 clues) or test board logic inside our {{solverLink}}.",
      strategiesCtaTemplate:
        "Put Singles, Pairs, and Pointing Lines to work on {{hardLink}}, push into {{expertLink}}, or compete on today's global seed in {{dailyLink}}.",
      advancedCtaTemplate:
        "Face verified multi-step fish and wing bottlenecks on {{expertLink}} (25 clues), or inspect tricky custom positions in our {{solverLink}}.",
      linkLabels: {
        easyLink: "Easy Sudoku",
        mediumLink: "Medium Sudoku",
        hardLink: "Hard Sudoku",
        expertLink: "Expert Sudoku",
        dailyLink: "Daily Challenge",
        solverLink: "Free Sudoku Solver",
      },
    },
    faq: {
      heading: "6. Sudoku Rules & Strategy FAQs",
      items: [
        {
          question: "How many starting clues do SudokuSync difficulties use?",
          answer:
            "Every classic 9x9 puzzle in SudokuSync uses verified clue tiers and logical grading: Easy starts with 51 clues (30 empty), Medium has 39 clues (42 empty), Hard has 30 clues (51 empty), and Expert has 25 clues (56 empty).",
        },
        {
          question: "Why does Auto-Notes only fill candidates on Hard and Expert?",
          answer:
            "Easy (51 clues) and Medium (39 clues) puzzles are designed around balanced Singles and quick human scanning. Auto-Notes targets Hard and Expert grids so players immediately focus on Pairs, Triples, Pointing Lines, X-Wing, and Y-Wing eliminations.",
        },
        {
          question: "Do Same-Board Multiplayer rooms and Daily Challenge use identical grids for players?",
          answer:
            "Yes. Every Multiplayer room and Daily Challenge uses deterministic seeding so each participant solves the exact same 9x9 layout and clue distribution, making completion time and mistake count strictly fair.",
        },
        {
          question: "How does Mistake Limit work in Solo vs. Multiplayer Challenge rooms?",
          answer:
            "In Solo play, Mistake Limit defaults to 3 mistakes and can be toggled in Settings. In Multiplayer Challenge rooms, the room host configures the match mistake limit when creating the challenge.",
        },
        {
          question: "Can I analyze custom 9x9 newspaper or practice puzzles in SudokuSync?",
          answer:
            "Yes. Open the Sudoku Solver from Settings or Home links, enter at least 17 valid clues on the 9x9 grid, check live duplicate validation, click Auto-Solve to inspect the unique solution, or click Play Puzzle to solve it interactively on the main board.",
        },
      ],
    },
  },

  hi: {
    hero: {
      badge: "SudokuSync Strategy Guide",
      title: "Sudoku Niyam, Solving Tricks & Smart Assistants",
      subtitle:
        "Classic 9x9 Sudoku ke basic grid houses se lekar Expert X-Wing aur Y-Wing deductions tak sab seekhein, aur SudokuSync ke 7 Smart Assistants aur keyboard shortcuts ka sahi istemal karein.",
      readingBadge: "Poora 9x9 Guide",
    },
    quickJumpTabs: [
      { id: "rules-basics", label: "Basic Niyam" },
      { id: "rules-notes", label: "Pencil Notes" },
      { id: "rules-strategies", label: "Core Tricks" },
      { id: "rules-advanced", label: "Expert Patterns" },
      { id: "rules-assistants", label: "Smart Assistants" },
      { id: "rules-faq", label: "FAQs" },
    ],
    diagramLabels: {
      rowLabel: "Row",
      columnLabel: "Column",
      boxLabel: "3x3 Box",
      targetCellLabel: "Target",
      candidatesLabel: "Notes",
      eliminatedLabel: "Hatayein",
      lockedPairLabel: "Pair Lock",
      pointingLineLabel: "Box-Line",
      xWingCornerLabel: "X-Wing",
      stepCaption1: "Diagram 1: Har 9x9 cell teen houses se judta hai: ek Row, ek Column aur ek 3x3 Box.",
      stepCaption2: "Diagram 2: Final number bharne se pehle Pencil Notes se valid candidates narrow down karein.",
      stepCaption3: "Diagram 3: Naked Pairs do cells mein do digits lock karte hain jisse baaki cells se woh notes hat jaate hain.",
      stepCaption4: "Diagram 4: Pointing Pairs ek 3x3 box ke andar candidate ko ek hi row ya column par align dikhata hai.",
      stepCaption5: "Diagram 5: X-Wing ke char corners ek rectangle banakar cover lines se baaki candidates eliminate karte hain.",
    },
    basics: {
      heading: "1. Classic 9x9 Grid Structure aur Core Niyam",
      intro:
        "SudokuSync ka har board classic 9x9 grid par chalta hai jisme 81 cells aur nau 3x3 boxes hote hain. Yeh poori tarah pure logic game hai—1 se 9 tak ke digits sirf symbols ki tarah kaam karte hain, isme koi maths calculation nahi hoti.",
      coreRules: [
        {
          title: "Har Row Mein 1–9 Ek Baar",
          desc: "9 horizontal rows mein se har ek row mein 1 se 9 tak sabhi digits bina kisi repeat ke aane chahiye.",
        },
        {
          title: "Har Column Mein 1–9 Ek Baar",
          desc: "9 vertical columns mein se har ek column mein 1 se 9 tak poore nau digits ek baar hi honge.",
        },
        {
          title: "Har 3x3 Box Mein 1–9 Ek Baar",
          desc: "Nau bold 3x3 blocks (houses) mein har box ke andar 1 se 9 tak sabhi numbers unique hone chahiye.",
        },
        {
          title: "Single Solution aur Mistake Limit",
          desc: "SudokuSync ke har puzzle ka ek hi unique solution verified hota hai. Settings mein Mistake Limit (Solo mein default 3 mistakes, aur Multiplayer rooms mein host ki set ki hui limit) galat entries track karta hai.",
        },
      ],
      coordinatesTitle: "Cell Coordinates (R1C1–R9C9)",
      coordinatesDesc:
        "Players cells ko Row (R1–R9 upar se neeche) aur Column (C1–C9 left se right) se samajhte hain, jaise R1C1 top-left corner hai. Har cell apni Row, Column aur 3x3 Box ke 20 peer cells se connected hota hai.",
      difficultyScaleTitle: "SudokuSync Difficulty Levels aur Clue Counts",
      difficultyRows: [
        {
          difficulty: "EASY",
          label: "Easy",
          clues: "51 Clues (30 Khali)",
          logicSummary: "Balanced 3x3 boxes jo sirf Last Free Cell aur Singles se smoothly solve ho jaate hain.",
        },
        {
          difficulty: "MEDIUM",
          label: "Medium",
          clues: "39 Clues (42 Khali)",
          logicSummary: "Balanced boxes jisme Line Hidden Singles, Box Hidden Singles aur Naked Singles use hote hain.",
        },
        {
          difficulty: "HARD",
          label: "Hard",
          clues: "30 Clues (51 Khali)",
          logicSummary: "Digit starvation ke saath Pointing Pairs, Box-Line Reduction aur Pairs/Triples logic lagta hai.",
        },
        {
          difficulty: "EXPERT",
          label: "Expert",
          clues: "25 Clues (56 Khali)",
          logicSummary: "Strict digit starvation jisme X-Wing, Y-Wing, Swordfish aur multi-step chains solve karna padta hai.",
        },
      ],
    },
    notes: {
      heading: "2. Pencil Marks (Notes) aur Keyboard Speed",
      intro:
        "Andaze se number dalne par mistakes hoti hain. Jab kisi square par doubt ho toh turant Pencil Notes ON karein taaki saare possible numbers cell ke andar saaf dikhte rahein.",
      workflowTitle: "Smart Pencil-Mark Workflow",
      workflowSteps: [
        "Step 1 — Sabse pehle aasaan Full House aur Scanning Singles seedha bhar dein.",
        "Step 2 — Jab direct scanning ruk jaaye tab Pencil Notes chalu karein aur har empty cell ke valid candidates mark karein.",
        "Step 3 — Settings mein Auto-Remove Notes ON rakhein taaki final number dalte hi connected cells se purane notes apne aap clear ho jaayein.",
        "Step 4 — Har elimination ke baad row, column aur box dobara scan karein kyunki naye Hidden Singles aur Locked Pairs samne aate hain.",
      ],
      shortcutsTitle: "SudokuSync ke Keyboard Shortcuts",
      shortcuts: [
        { keys: "1–9 / Numpad 1–9", action: "Final digit ya pencil notes daalein (Fast Fill mode mein active number lock/unlock karein)." },
        { keys: "Backspace / Delete", action: "Selected editable cell se galat digit ya notes turant hatayein." },
        { keys: "Spacebar / N", action: "Bina page scroll kiye Final Digit aur Pencil Notes mode ke beech switch karein." },
        { keys: "Ctrl + Z / Cmd + Z", action: "Apni pichhli entry ya note edit turant undo karein." },
        { keys: "H", action: "Kisi hard bottleneck par atakne par board ke liye Smart Logic Hint trigger karein." },
        { keys: "Arrow Keys / Tab / Esc", action: "9x9 grid mein cell move karein, menus traverse karein ya modals band karein." },
      ],
    },
    strategies: {
      heading: "3. Beginner aur Intermediate Solving Tricks",
      intro:
        "Single-house scanning se shuru karke Pairs aur Box-Line intersections tak badhein. Yeh 5 tricks Easy, Medium aur Hard boards bina tukke ke solve karne mein madad karti hain.",
      items: [
        {
          id: "full-house",
          name: "Last Free Cell (Full House)",
          levelBadge: "Shuruati",
          summary: "Jab kisi row, column ya 3x3 box mein 8 cells bhar jaate hain toh bacha hua akela khali cell wahi missing digit leta hai.",
          howToSpot: "Jis row, column ya box mein sirf ek khali dabba bacha ho wahan 1–9 check karein.",
          exampleNote: "Row 2 mein 1, 2, 3, 4, 6, 7, 8, 9 aa chuke hain, toh akela khali cell R2C5 pakka 5 hoga.",
        },
        {
          id: "scanning",
          name: "Scanning & Cross-Hatching",
          levelBadge: "Shuruati",
          summary: "Ek 3x3 box ke upar rows aur columns ki lines cross karke dekhein ki kaunsa digit kahan nahi aa sakta.",
          howToSpot: "Jo number 3 boxes ki ek line mein do baar dikh raha ho, teesre box mein uski bachi hui line check karein.",
          exampleNote: "Agar 7 pehle se Row 1 aur Row 3 mein hai, toh teesre top box mein 7 sirf Row 2 mein aa sakta hai.",
        },
        {
          id: "naked-hidden-singles",
          name: "Naked Singles & Hidden Singles",
          levelBadge: "Easy–Medium",
          summary: "Naked Single mein ek cell ke andar sirf ek hi candidate bachta hai. Hidden Single mein cell mein kai notes hote hain par koi ek digit poore house mein sirf wahin fit hota hai.",
          howToSpot: "Naked Singles ke liye Highlight Related Area ON rakhein, aur Hidden Single ke liye kisi ek digit ko poore board par scan karein.",
          exampleNote: "R5C4 mein {2, 6, 8} notes hain par poore Column 4 mein 8 kahin aur nahi hai—toh R5C4 par 8 pakka hai.",
        },
        {
          id: "pairs-triples",
          name: "Naked Pairs, Hidden Pairs & Triples",
          levelBadge: "Medium–Hard",
          summary: "Agar ek hi house ke do cells mein bilkul same do candidates {A, B} hain, toh us house ke baaki cells se A aur B eliminate ho jaate hain. Triples teen cells aur teen digits par yahi lock lagate hain.",
          howToSpot: "Ek hi row, column ya box mein aise do cells dhoondhein jinke notes sirf exact same {A, B} dikha rahe hon.",
          exampleNote: "R4C1={3, 7} aur R4C8={3, 7} lock hone se R4C5={3, 7, 9} se 3 aur 7 hat jaayenge aur 9 bachega.",
        },
        {
          id: "pointing-box-line",
          name: "Pointing Pairs & Box-Line Reduction",
          levelBadge: "Hard",
          summary: "Agar ek 3x3 box ke andar kisi digit ke saare candidates ek hi row ya column par padte hain, toh box ke bahar usi line se woh digit hata dein. Ulta, agar kisi line ke saare candidates ek hi box mein hon toh box ke baaki cells se hata dein.",
          howToSpot: "Har 3x3 box ke andar ek hi line mein chipke hue candidates dhoondhein.",
          exampleNote: "Box 1 mein 4 sirf R1C2 aur R1C3 mein aa sakta hai, isliye R1C5 se R1C9 tak 4 eliminate ho jaayega.",
        },
      ],
    },
    advanced: {
      heading: "4. Expert Level Advanced Patterns",
      intro:
        "25-clue Expert puzzles mein jab Singles aur Pairs khatam ho jaate hain, tab X-Wing, Y-Wing aur Swordfish patterns aage ka rasta kholte hain.",
      items: [
        {
          id: "x-wing",
          name: "X-Wing Strategy",
          levelBadge: "Expert Fish",
          summary: "Jab koi digit do alag rows mein sirf exact same do columns par candidate banta hai toh char corners ek rectangle banate hain.",
          howToSpot: "Ek hi number ke liye do rows mein sirf do-do candidates check karein jo same columns par aligned hon.",
          exampleNote: "Digit 6 Row 2 aur Row 8 mein sirf {C2, C7} par hai, toh Column 2 aur Column 7 ke baaki cells se 6 hata dein.",
        },
        {
          id: "y-wing",
          name: "Y-Wing (XY-Wing) Strategy",
          levelBadge: "Expert Wing",
          summary: "Ek 2-candidate pivot cell {X, Y} do pincer cells {X, Z} aur {Y, Z} se judta hai—jisse dono pincers ke common peer cells se Z eliminate ho jaata hai.",
          howToSpot: "Ek pivot aur do wing cells dhoondhein jinke pairs {X, Y}, {X, Z}, {Y, Z} ka cycle banayein.",
          exampleNote: "Pivot R3C3={2, 5} agar R3C9={2, 9} aur R7C3={5, 9} ko dekhta hai, toh dono wings ke common peer se 9 hat jaayega.",
        },
        {
          id: "swordfish",
          name: "Swordfish Strategy",
          levelBadge: "Expert 3x3 Fish",
          summary: "Yeh X-Wing ka 3-row version hai jahan ek digit teen rows mein sirf 2–3 positions par aata hai aur sabhi positions exact same teen columns mein hoti hain.",
          howToSpot: "Kisi digit par teen rows check karein jinke saare candidates teen common columns ke andar fit hote hon.",
          exampleNote: "Rows 1, 5 aur 9 mein 3 sirf Columns 3, 6 aur 8 par hai—toh un columns ke baaki rows se 3 eliminate hoga.",
        },
      ],
    },
    assistants: {
      heading: "5. Smart Assistants Guide (Sabhi 7 In-Game Settings)",
      intro:
        "Settings -> Smart Assistants mein jaakar aap kabhi bhi apni speed aur preference ke hisaab se sabhi 7 visual aur input assists ON ya OFF kar sakte hain.",
      items: [
        {
          id: "highlight-identical",
          name: "Highlight Identical Numbers",
          badge: "Visual Madad",
          description: "Kisi bhi bhare hue cell ko select karne par poore 9x9 board mein wahi digit har jagah highlight ho jaata hai.",
          whenToUse: "Cross-Hatching scanning fast karne aur bache hue numbers jaldi spot karne ke liye best hai.",
        },
        {
          id: "remaining-numbers",
          name: "Show Remaining Numbers",
          badge: "Keypad Counter",
          description: "1–9 keypad buttons par live counter dikhata hai ki har digit kitni baar bharna baaki hai.",
          whenToUse: "Endgame mein jin digits ke sirf 1 ya 2 spots bache hon unhe pehle finish karne ke liye helpful hai.",
        },
        {
          id: "highlight-area",
          name: "Highlight Related Area",
          badge: "Area Focus",
          description: "Selected cell se judi row, column aur 3x3 box ko halka pastel shade mein highlight karta hai.",
          whenToUse: "Naked Singles check karte waqt row ya column misread hone se bachata hai.",
        },
        {
          id: "auto-remove-notes",
          name: "Auto-Remove Notes",
          badge: "Safai Assist",
          description: "Final digit dalte hi connected row, column aur 3x3 box se conflicting pencil notes apne aap delete kar deta hai.",
          whenToUse: "Timed Solo, Daily Challenge aur Multiplayer matches mein notes saaf rakhne ke liye ON rakhein.",
        },
        {
          id: "auto-notes",
          name: "Auto-Notes",
          badge: "Sirf Hard & Expert",
          description: "Sirf Hard aur Expert puzzles par khali cells mein valid candidate notes apne aap fill kar deta hai.",
          whenToUse: "Hard (30 clues) aur Expert (25 clues) par seedha Pointing Pairs, X-Wing aur Y-Wing patterns solve karne ke liye ideal hai.",
        },
        {
          id: "fast-fill",
          name: "Fast Fill (Number-First)",
          badge: "Tez Input",
          description: "Keypad par ek digit lock kar deta hai taaki aap alag-alag cells par tap karke tezi se entries ya notes bhar sakein.",
          whenToUse: "Daily Challenge aur Multiplayer speed runs mein repeated clicks kam karne ke liye zabardast hai.",
        },
        {
          id: "auto-switch-completed",
          name: "Auto-Switch Completed Numbers",
          badge: "Smooth Flow",
          description: "Jab kisi digit ke sabhi 9 instances complete ho jaayein toh aapka active number brush agle baaki digit par automatically switch ho jaata hai.",
          whenToUse: "Fast Fill ke saath lagatar numbers place karte waqt flow tootne nahi deta.",
        },
      ],
    },
    contextualLinks: {
      beginnerCtaTemplate:
        "Grid Houses aur Scanning try karne ke liye {{easyLink}} (51 clues) se shuru karein ya {{mediumLink}} (39 clues) khelein.",
      notesCtaTemplate:
        "Pencil Marks ki practice karni ho ya newspaper puzzle verify karna ho, toh {{hardLink}} (30 clues) try karein ya hamara {{solverLink}} kholein.",
      strategiesCtaTemplate:
        "Singles, Pairs aur Pointing Lines ko {{hardLink}}, {{expertLink}} ya roz ke global seed {{dailyLink}} par test karein.",
      advancedCtaTemplate:
        "25-clue {{expertLink}} boards par X-Wing aur Y-Wing bottlenecks solve karein ya mushkil positions ko {{solverLink}} mein check karein.",
      linkLabels: {
        easyLink: "Easy Sudoku",
        mediumLink: "Medium Sudoku",
        hardLink: "Hard Sudoku",
        expertLink: "Expert Sudoku",
        dailyLink: "Daily Challenge",
        solverLink: "Free Sudoku Solver",
      },
    },
    faq: {
      heading: "6. Sudoku Niyam & Strategy FAQs",
      items: [
        {
          question: "SudokuSync ke char difficulty levels mein kitne clues milte hain?",
          answer:
            "SudokuSync classic 9x9 grids mein Easy par 51 clues (30 empty), Medium par 39 clues (42 empty), Hard par 30 clues (51 empty), aur Expert par 25 clues (56 empty) diye jaate hain.",
        },
        {
          question: "Auto-Notes sirf Hard aur Expert par hi kyun kaam karta hai?",
          answer:
            "Easy (51 clues) aur Medium (39 clues) puzzles Singles aur normal scanning practice ke liye design hain. Auto-Notes khaas Hard aur Expert ke liye hai taaki aap directly Pairs, Pointing Lines, X-Wing aur Y-Wing logic par dhyan de sakein.",
        },
        {
          question: "Kya Same-Board Multiplayer rooms aur Daily Challenge mein sabko bilkul ek hi board milta hai?",
          answer:
            "Haan. Dono modes deterministic seed use karte hain jisse har player ko bilkul identical 9x9 puzzle aur clues milte hain—taaki solve time aur mistakes ka comparison 100% fair rahe.",
        },
        {
          question: "Solo aur Multiplayer rooms mein Mistake Limit kaise kaam karta hai?",
          answer:
            "Solo mode mein Mistake Limit default 3 mistakes par rehta hai jise aap Settings se toggle kar sakte hain. Multiplayer Challenge rooms mein room host challenge banate waqt mistake limit set karta hai.",
        },
        {
          question: "Kya main apna custom 9x9 puzzle SudokuSync Solver mein check ya khel sakta hoon?",
          answer:
            "Bilkul. Settings ya links se Sudoku Solver kholein, kam se kam 17 valid clues daalein, Auto-Solve se unique answer dekhein, ya Play Puzzle dabakar use main interactive board par solve karein.",
        },
      ],
    },
  },

  de: {
    hero: {
      badge: "SudokuSync Strategie-Handbuch",
      title: "Sudoku-Regeln, Lösungsstrategien & Smart Assistants",
      subtitle:
        "Beherrsche klassisches 9x9-Sudoku von den Grundregeln bis zu Experten-Mustern wie X-Wing, Y-Wing und Swordfish und nutze alle 7 Smart Assistants sowie Tastaturkürzel in SudokuSync optimal.",
      readingBadge: "Kompletter 9x9-Leitfaden",
    },
    quickJumpTabs: [
      { id: "rules-basics", label: "Grundregeln" },
      { id: "rules-notes", label: "Bleistiftnotizen" },
      { id: "rules-strategies", label: "Basistechniken" },
      { id: "rules-advanced", label: "Profi-Muster" },
      { id: "rules-assistants", label: "Smart Assistants" },
      { id: "rules-faq", label: "FAQ" },
    ],
    diagramLabels: {
      rowLabel: "Zeile",
      columnLabel: "Spalte",
      boxLabel: "3x3-Block",
      targetCellLabel: "Ziel",
      candidatesLabel: "Notizen",
      eliminatedLabel: "Streichen",
      lockedPairLabel: "Paar-Sperre",
      pointingLineLabel: "Block-Linie",
      xWingCornerLabel: "X-Wing",
      stepCaption1: "Diagramm 1: Jedes 9x9-Feld gehört zu drei Einheiten: einer Zeile, einer Spalte und einem 3x3-Block.",
      stepCaption2: "Diagramm 2: Kandidatennotizen grenzen leere Felder systematisch ein, bevor du Ziffern festsetzt.",
      stepCaption3: "Diagramm 3: Ein Naked Pair bindet zwei Ziffern auf zwei Felder und löscht sie im restlichen Block.",
      stepCaption4: "Diagramm 4: Ein Pointing Pair richtet Kandidaten im 3x3-Block entlang derselben Zeile oder Spalte aus.",
      stepCaption5: "Diagramm 5: Die vier Ecken eines X-Wings bilden ein Rechteck und entfernen Kandidaten entlang beider Spalten.",
    },
    basics: {
      heading: "1. Aufbau des 9x9-Gitters & Grundregeln",
      intro:
        "Jedes Brett in SudokuSync folgt dem klassischen 9x9-Raster mit 81 Feldern und neun 3x3-Blöcken. Sudoku basiert auf reiner Ausschlusslogik; gerechnet wird nicht.",
      coreRules: [
        { title: "1–9 einmal pro Zeile", desc: "Jede der 9 waagerechten Zeilen enthält die Ziffern 1 bis 9 genau einmal." },
        { title: "1–9 einmal pro Spalte", desc: "Jede der 9 senkrechten Spalten enthält alle Ziffern 1 bis 9 ohne Wiederholung." },
        { title: "1–9 einmal pro 3x3-Block", desc: "Jeder der neun umrahmten 3x3-Blöcke (Houses) umfasst genau einmal 1 bis 9." },
        { title: "Eindeutige Lösung & Fehlerlimit", desc: "Jedes generierte SudokuSync-Rätsel besitzt eine geprüfte eindeutige Lösung. Das optionale Fehlerlimit zählt Fehleingaben (Standard 3 im Solo-Modus bzw. Raumvorgabe im Multiplayer)." },
      ],
      coordinatesTitle: "Standard-Koordinaten (R1C1–R9C9)",
      coordinatesDesc:
        "Felder werden über Zeile (R1–R9) und Spalte (C1–C9) benannt. R1C1 ist oben links, R9C9 unten rechts. Jedes Feld teilt sich bis zu 20 Nachbarfelder über seine drei Einheiten.",
      difficultyScaleTitle: "SudokuSync Schwierigkeitsgrade & Vorgaben",
      difficultyRows: [
        { difficulty: "EASY", label: "Leicht", clues: "51 Hinweise (30 leer)", logicSummary: "Ausgewogene 3x3-Blöcke, rein mit letztem freien Feld und Singles lösbar." },
        { difficulty: "MEDIUM", label: "Mittel", clues: "39 Hinweise (42 leer)", logicSummary: "Kombination aus versteckten Linien-/Block-Singles und Naked Singles." },
        { difficulty: "HARD", label: "Schwer", clues: "30 Hinweise (51 leer)", logicSummary: "Gezielte Ziffernknappheit mit Pointing Pairs, Box-Line-Reduktion sowie Paaren und Drillingen." },
        { difficulty: "EXPERT", label: "Experte", clues: "25 Hinweise (56 leer)", logicSummary: "Strenge Knappheit mit X-Wing, Y-Wing, Swordfish und mehrstufigen Kettenschlüssen." },
      ],
    },
    notes: {
      heading: "2. Bleistiftnotizen (Kandidaten) & Tastaturtempo",
      intro:
        "Raten führt schnell zu Fehlern. Nutze den Notizmodus konsequent, um alle zulässigen Ziffern sauber festzuhalten.",
      workflowTitle: "Sauberer Notiz-Workflow",
      workflowSteps: [
        "Schritt 1 — Löse zuerst offensichtliche Full Houses und klare Singles ohne Notizen.",
        "Schritt 2 — Aktiviere Notizen, sobald die direkte Suche stockt.",
        "Schritt 3 — Lass „Notizen auto. löschen“ aktiv, damit beim Setzen einer Zahl alle Konflikte in Zeile, Spalte und Block sofort verschwinden.",
        "Schritt 4 — Prüfe nach jeder Reduktion erneut auf neue versteckte Singles oder Paare.",
      ],
      shortcutsTitle: "Verifizierte SudokuSync Tastaturkürzel",
      shortcuts: [
        { keys: "1–9 / Numpad 1–9", action: "Ziffer oder Notiz eingeben (im Schnellfüllen-Modus aktive Ziffer sperren/entsperren)." },
        { keys: "Backspace / Delete", action: "Eingetragene Ziffer oder Notizen im ausgewählten Feld löschen." },
        { keys: "Leertaste / N", action: "Zwischen Ziffern- und Notizmodus wechseln, ohne dass die Seite scrollt." },
        { keys: "Ctrl + Z / Cmd + Z", action: "Letzte Eingaben und Notizänderungen schrittweise rückgängig machen." },
        { keys: "H", action: "Einen smarten Logik-Hinweis auf dem aktiven Brett anfordern." },
        { keys: "Pfeiltasten / Tab / Esc", action: "Zwischen Zellen navigieren, Menüs bedienen oder Modals schließen." },
      ],
    },
    strategies: {
      heading: "3. Einsteiger- & Fortgeschrittenen-Techniken",
      intro: "Diese fünf Kerntechniken tragen dich sicher durch Leicht, Mittel und Schwer.",
      items: [
        {
          id: "full-house",
          name: "Letztes freies Feld (Full House)",
          levelBadge: "Einsteiger",
          summary: "Stehen acht Ziffern in einer Einheit bereits fest, muss das neunte Feld die letzte fehlende Ziffer aufnehmen.",
          howToSpot: "Achte auf fast volle Zeilen, Spalten oder Blöcke mit nur einem freien Feld.",
          exampleNote: "In Zeile 2 fehlt von 1–9 nur die 5: R2C5 ist sofort 5.",
        },
        {
          id: "scanning",
          name: "Scannen & Cross-Hatching",
          levelBadge: "Einsteiger",
          summary: "Übertrage vorhandene Ziffern per gedachter Linien durch benachbarte 3x3-Blöcke.",
          howToSpot: "Suche Ziffern, die zweimal in einem Band aus drei Blöcken vorkommen.",
          exampleNote: "Steht die 7 in Zeile 1 und Zeile 3, bleibt im dritten Block nur Zeile 2.",
        },
        {
          id: "naked-hidden-singles",
          name: "Naked Singles & Hidden Singles",
          levelBadge: "Einsteiger–Mittel",
          summary: "Beim Naked Single erlaubt das Feld nur einen Kandidaten; beim Hidden Single kommt eine Ziffer innerhalb einer Einheit nur einmal vor.",
          howToSpot: "Aktiviere „Bereich markieren“ für Naked Singles und vergleiche Kandidaten pro Einheit für Hidden Singles.",
          exampleNote: "R5C4 hat {2, 6, 8}, doch die 8 existiert sonst nirgends in Spalte 4.",
        },
        {
          id: "pairs-triples",
          name: "Naked Pairs, Hidden Pairs & Drillinge",
          levelBadge: "Mittel–Schwer",
          summary: "Teilen sich zwei Felder derselben Einheit exakt dieselben zwei Kandidaten {A, B}, können A und B aus allen anderen Feldern dieser Einheit gestrichen werden.",
          howToSpot: "Halte Ausschau nach zwei Zweier-Notizen mit identischem Paar {A, B} in einem Block oder einer Linie.",
          exampleNote: "R4C1={3, 7} und R4C8={3, 7} streichen 3 und 7 aus R4C5={3, 7, 9}, übrig bleibt 9.",
        },
        {
          id: "pointing-box-line",
          name: "Pointing Pairs & Box-Line-Reduktion",
          levelBadge: "Schwer",
          summary: "Liegt ein Kandidat eines 3x3-Blocks nur auf einer Zeile oder Spalte, wird er außerhalb des Blocks auf derselben Linie gelöscht (und umgekehrt).",
          howToSpot: "Prüfe, ob alle Positionen einer Ziffer im Block eine gerade Linie bilden.",
          exampleNote: "In Block 1 steht 4 nur in R1C2 und R1C3 -> 4 verschwindet aus R1C5–R1C9.",
        },
      ],
    },
    advanced: {
      heading: "4. Experten-Muster",
      intro: "Bei 25-Hinweis-Expertenbrettern lösen diese drei Muster anspruchsvolle Engpässe.",
      items: [
        {
          id: "x-wing",
          name: "X-Wing-Strategie",
          levelBadge: "Experte Fish",
          summary: "Eine Ziffer steht in zwei Zeilen jeweils in denselben zwei Spalten und bildet ein gesperrtes Rechteck.",
          howToSpot: "Suche nach einer 2x2-Ausrichtung derselben Ziffer über zwei Zeilen oder Spalten.",
          exampleNote: "Steht 6 in Zeile 2 und Zeile 8 nur in {C2, C7}, fällt 6 in allen anderen Feldern von C2 und C7 weg.",
        },
        {
          id: "y-wing",
          name: "Y-Wing (XY-Wing)",
          levelBadge: "Experte Wing",
          summary: "Ein Drehfeld {X, Y} verbindet zwei Flügel {X, Z} und {Y, Z}; jedes gemeinsame Nachbarfeld beider Flügel verliert Z.",
          howToSpot: "Finde ein Zweier-Zentrum, das zwei passende Zweier-Flügel in Zeile/Spalte/Block sieht.",
          exampleNote: "R3C3={2, 5} mit R3C9={2, 9} und R7C3={5, 9} eliminiert 9 in gemeinsamen Schnittfeldern.",
        },
        {
          id: "swordfish",
          name: "Swordfish-Strategie",
          levelBadge: "Experte 3x3",
          summary: "Die 3-Zeilen-Erweiterung des X-Wings: Kandidaten in drei Zeilen beschränken sich auf genau drei Spalten.",
          howToSpot: "Prüfe drei Zeilen einer Ziffer auf eine gemeinsame 3-Spalten-Menge.",
          exampleNote: "Liegt die 3 in R1, R5 und R9 nur in C3, C6, C8, wird sie im Rest dieser Spalten gelöscht.",
        },
      ],
    },
    assistants: {
      heading: "5. Smart Assistants Guide (Alle 7 Einstellungen)",
      intro: "Passe unter Einstellungen -> Smart Assistants alle sieben Hilfen individuell an.",
      items: [
        { id: "highlight-identical", name: "Gleiche Zahlen hervorheben", badge: "Visuell", description: "Hebt alle identischen Ziffern auf dem gesamten 9x9-Brett hervor.", whenToUse: "Perfekt für schnelles Cross-Hatching." },
        { id: "remaining-numbers", name: "Verbleibende Zahlen anzeigen", badge: "Tasten-Zähler", description: "Zeigt auf den Zifferntasten 1–9 an, wie oft jede Zahl noch fehlt.", whenToUse: "Hilft im Endspiel beim schnellen Abschließen." },
        { id: "highlight-area", name: "Bereich markieren", badge: "Einheiten-Fokus", description: "Markiert sanft Zeile, Spalte und 3x3-Block rund um die ausgewählte Zelle.", whenToUse: "Verhindert Zeilenfehler auf großen Displays." },
        { id: "auto-remove-notes", name: "Notizen auto. löschen", badge: "Notizpflege", description: "Entfernt veraltete Kandidaten in verbundenen Feldern sofort beim Setzen einer Ziffer.", whenToUse: "Immer empfohlen für Tages-Challenge und Multiplayer." },
        { id: "auto-notes", name: "Auto-Notizen", badge: "Nur Schwer & Experte", description: "Füllt gültige Kandidatennotizen automatisch ausschließlich auf den Stufen Schwer und Experte.", whenToUse: "Ideal zum direkten Trainieren von Paaren, X-Wing und Y-Wing." },
        { id: "fast-fill", name: "Schnellfüllen (Zahl zuerst)", badge: "Tempo-Eingabe", description: "Fixiert eine Ziffer auf dem Tastenfeld für schnelles Antippen mehrerer Felder.", whenToUse: "Ideal für schnelle Ziffernserien am Handy oder per Numpad." },
        { id: "auto-switch-completed", name: "Fertige Zahlen auto. wechseln", badge: "Spielfluss", description: "Wechselt automatisch zur nächsten unvollständigen Ziffer, sobald alle 9 Exemplare gesetzt sind.", whenToUse: "Spart unnötige Klicks zwischen abgeschlossenen Ziffern." },
      ],
    },
    contextualLinks: {
      beginnerCtaTemplate: "Bereit für die Praxis? Starte entspannt mit {{easyLink}} (51 Hinweise) oder steige ein in {{mediumLink}} (39 Hinweise).",
      notesCtaTemplate: "Notizen gezielt trainieren oder Zeitungsrätsel prüfen? Teste {{hardLink}} (30 Hinweise) oder nutze unseren {{solverLink}}.",
      strategiesCtaTemplate: "Wende Singles, Paare und Pointing Lines direkt auf {{hardLink}}, {{expertLink}} oder in der {{dailyLink}} an.",
      advancedCtaTemplate: "Meistere 25-Hinweis-Bretter auf {{expertLink}} oder analysiere knifflige Positionen im {{solverLink}}.",
      linkLabels: {
        easyLink: "Leichtes Sudoku",
        mediumLink: "Mittleres Sudoku",
        hardLink: "Schweres Sudoku",
        expertLink: "Experten-Sudoku",
        dailyLink: "Tages-Challenge",
        solverLink: "Kostenloser Sudoku Solver",
      },
    },
    faq: {
      heading: "6. Häufige Fragen (FAQ)",
      items: [
        { question: "Wie viele Startziffern haben die Stufen in SudokuSync?", answer: "Leicht startet mit 51 Hinweisen (30 leer), Mittel mit 39 (42 leer), Schwer mit 30 (51 leer) und Experte mit 25 Hinweisen (56 leer)." },
        { question: "Warum funktionieren Auto-Notizen nur auf Schwer und Experte?", answer: "Leicht (51) und Mittel (39) fördern freies Scannen und Singles. Auto-Notizen konzentriert sich auf Schwer und Experte für Paare, Pointing Lines und Fish/Wing-Strategien." },
        { question: "Bekommen alle Spieler im Multiplayer und in der Tages-Challenge exakt dasselbe Brett?", answer: "Ja. Beide Modi nutzen deterministische Seeds für identische Bretter und faire Zeit- sowie Fehlervergleiche." },
        { question: "Wie funktioniert das Fehlerlimit im Solo- und Multiplayer-Modus?", answer: "Im Solo-Modus gilt standardmäßig ein Limit von 3 Fehlern (in den Einstellungen umschaltbar). In Multiplayer-Räumen legt der Host das Limit fest." },
        { question: "Kann ich eigene 9x9-Rätsel in SudokuSync lösen oder spielen?", answer: "Ja. Öffne den Sudoku Solver, gib mindestens 17 gültige Hinweise ein und wähle Auto-Lösung oder Puzzle spielen." },
      ],
    },
  },

  ja: {
    hero: {
      badge: "SudokuSync 攻略マニュアル",
      title: "数独のルール・解法テクニック・スマートアシストガイド",
      subtitle:
        "クラシック9x9数独の基本ルールから上級パターン（X-Wing・Y-Wing・Swordfish）、さらにSudokuSync実装済みの全7種スマートアシストとキーボード操作をわかりやすく解説します。",
      readingBadge: "完全 9x9 ガイド",
    },
    quickJumpTabs: [
      { id: "rules-basics", label: "基本ルール" },
      { id: "rules-notes", label: "候補メモ" },
      { id: "rules-strategies", label: "基本・中級技" },
      { id: "rules-advanced", label: "上級パターン" },
      { id: "rules-assistants", label: "スマートアシスト" },
      { id: "rules-faq", label: "FAQ" },
    ],
    diagramLabels: {
      rowLabel: "行 (Row)",
      columnLabel: "列 (Col)",
      boxLabel: "3x3 ブロック",
      targetCellLabel: "注目セル",
      candidatesLabel: "候補メモ",
      eliminatedLabel: "消去",
      lockedPairLabel: "予約ペア",
      pointingLineLabel: "ライン確定",
      xWingCornerLabel: "X-Wing",
      stepCaption1: "図1: 9x9の各マスは「行」「列」「3x3ブロック」の3つのハウスに属します。",
      stepCaption2: "図2: 不明なマスには候補メモ（ペンシルマーク）を入れて論理的に絞り込みます。",
      stepCaption3: "図3: Naked Pair は2マスに2数字を固定し、同じハウス内の他マスから候補を消去します。",
      stepCaption4: "図4: Pointing Pair はブロック内の候補が1列・1行に並ぶと外部の同ラインから候補を除外します。",
      stepCaption5: "図5: X-Wing の4隅が長方形を作ると、交差する列全体から該当候補を消去できます。",
    },
    basics: {
      heading: "1. クラシック 9x9 盤面の構造と基本ルール",
      intro:
        "SudokuSyncの盤面はすべて81マス・9つの3x3ブロックで構成されたクラシック9x9です。計算は一切不要で、1〜9を重複なく配置する純粋な論理パズルです。",
      coreRules: [
        { title: "各行（横）に 1〜9 を重複なく", desc: "9本ある横の行すべてに 1〜9 が1回ずつ入ります。" },
        { title: "各列（縦）に 1〜9 を重複なく", desc: "9本ある縦の列すべてに 1〜9 が1回ずつ入ります。" },
        { title: "各 3x3 ブロックに 1〜9 を重複なく", desc: "太枠で区切られた9つの 3x3 ブロック内に 1〜9 が1回ずつ入ります。" },
        { title: "唯一解とミス制限検証", desc: "生成される全盤面は唯一解が検証済みです。設定のミス制限（ソロは初期値3回、マルチプレイヤーはホスト設定）で誤答を管理できます。" },
      ],
      coordinatesTitle: "標準座標表記 (R1C1〜R9C9)",
      coordinatesDesc: "上から行 R1〜R9、左から列 C1〜C9 で表します。任意の1マスは同じ行・列・ブロックの最大20個のピアと影響し合います。",
      difficultyScaleTitle: "SudokuSync 難易度別ヒント数一覧",
      difficultyRows: [
        { difficulty: "EASY", label: "初級 (Easy)", clues: "初期数字 51（空白 30）", logicSummary: "均整の取れた配置で、Last Free Cell とシングルのみで解けます。" },
        { difficulty: "MEDIUM", label: "中級 (Medium)", clues: "初期数字 39（空白 42）", logicSummary: "ブロック・ラインの Hidden Single と Naked Single を組み合わせます。" },
        { difficulty: "HARD", label: "上級 (Hard)", clues: "初期数字 30（空白 51）", logicSummary: "数字偏りを活かし、Pointing Pairs・Box-Line・ペア/トリプルで崩します。" },
        { difficulty: "EXPERT", label: "エキスパート", clues: "初期数字 25（空白 56）", logicSummary: "厳密な数字絞り込みにより X-Wing・Y-Wing・Swordfish が必要になります。" },
      ],
    },
    notes: {
      heading: "2. 候補メモ（ペンシルマーク）とキーボード操作",
      intro: "当て推量はミスにつながります。確定できないマスにはメモモードを活用して候補数字を記録しましょう。",
      workflowTitle: "ミスを防ぐメモ手順",
      workflowSteps: [
        "1. 最初はメモなしで確定できるシングルをすべて埋めます。",
        "2. 行き詰まったらメモモードに切り替え、各マスの候補を入力します。",
        "3. 設定で「メモを自動削除」をオンにしておくと、確定入力時に関連マスの不要メモが自動で消えます。",
        "4. 候補が減ったら同じ行・列・ブロックを見直し、新しい確定数字やペアを探します。",
      ],
      shortcutsTitle: "SudokuSync 実装済みキーボードショートカット",
      shortcuts: [
        { keys: "1–9 / Numpad 1–9", action: "確定数字または候補メモを入力（高速入力時は選択数字をロック/解除）。" },
        { keys: "Backspace / Delete", action: "選択中のマスから入力数字やメモを消去。" },
        { keys: "Spacebar / N", action: "ページをスクロールさせずに通常入力とメモ入力を切り替え。" },
        { keys: "Ctrl + Z / Cmd + Z", action: "直前の入力・メモ操作を1手戻す。" },
        { keys: "H", action: "行き詰まった際にスマート論理ヒントを実行。" },
        { keys: "Arrow Keys / Tab / Esc", action: "9x9盤面の移動、メニュー選択、モーダルを閉じる操作。" },
      ],
    },
    strategies: {
      heading: "3. 初級・中級〜上級の基礎解法テクニック",
      intro: "この5つの基本手法を順番に使えるようになると、Easy・Medium・Hard を安定して解けるようになります。",
      items: [
        { id: "full-house", name: "ラストフリーセル (Full House)", levelBadge: "初級", summary: "行・列・3x3ブロックで8マスが埋まっていれば、残り1マスに欠けている数字が確定します。", howToSpot: "空きマスが1つだけのユニットを探します。", exampleNote: "Row 2 に 5 だけ無ければ R2C5=5 確定。" },
        { id: "scanning", name: "スキャン・クロスハッチング", levelBadge: "初級", summary: "隣接ブロックの既出数字を縦横に伸ばし、残るブロック内の配置先を1つに絞ります。", howToSpot: "横に並んだ3ブロック内に同じ数字が2つある箇所に注目します。", exampleNote: "1行目と3行目に7があれば、3つ目の上段ブロックでは2行目のみ可能です。" },
        { id: "naked-hidden-singles", name: "Naked Single と Hidden Single", levelBadge: "初級〜中級", summary: "マスの候補が1つだけ残るのが Naked Single、ハウス内でその数字が入るマスが1つだけなのが Hidden Single です。", howToSpot: "関連エリア強調で Naked、同一数字ハイライトで Hidden を見つけます。", exampleNote: "R5C4 が {2,6,8} でも Column 4 で 8 が他になければ 8 確定。" },
        { id: "pairs-triples", name: "Naked/Hidden ペア・トリプル", levelBadge: "中級〜上級", summary: "同じハウス内の2マスが全く同じ2候補 {A, B} を持つ場合、他のマスから A と B を削除できます。", howToSpot: "2候補だけのマスが同じ組で2つ並んでいる箇所を探します。", exampleNote: "R4C1={3,7} と R4C8={3,7} により R4C5={3,7,9} から 9 が確定。" },
        { id: "pointing-box-line", name: "Pointing Pairs & Box-Line 消去", levelBadge: "上級", summary: "ブロック内の特定候補が1行または1列にしか存在しない場合、ブロック外の同ラインからその候補を消去します。", howToSpot: "ブロック内で一列に並んだ候補をチェックします。", exampleNote: "Box 1 の 4 が R1C2, R1C3 のみなら R1C5〜R1C9 から 4 を消去。" },
      ],
    },
    advanced: {
      heading: "4. エキスパート向け上級パターン",
      intro: "ヒント25個の Expert 盤面では、以下のフィッシュ／ウィング系ロジックが突破口になります。",
      items: [
        { id: "x-wing", name: "X-Wing 戦略", levelBadge: "Expert Fish", summary: "2つの行で特定数字の候補が全く同じ2列だけに現れると長方形が成立し、その2列の他マスから候補を消去できます。", howToSpot: "同じ数字が2箇所ずつ対になる2行（または2列）を探します。", exampleNote: "2行目と8行目で6が {C2,C7} のみなら C2, C7 の他行から6を消去。" },
        { id: "y-wing", name: "Y-Wing (XY-Wing)", levelBadge: "Expert Wing", summary: "中心 {X,Y} が両翼 {X,Z} と {Y,Z} を見ているとき、両翼に共通して見えるマスから Z を消去できます。", howToSpot: "2候補マス3つが連鎖するコーナーを探索します。", exampleNote: "R3C3={2,5}・R3C9={2,9}・R7C3={5,9} の共通ピアから9を削除。" },
        { id: "swordfish", name: "Swordfish 戦略", levelBadge: "Expert 3x3", summary: "X-Wing を3行×3列へ拡張したパターン。3つの行の候補が同じ3列内に収まれば、それら列の他マスから削除できます。", howToSpot: "候補が2〜3個の行を3本組み合わせて列が3つに収まるか確認します。", exampleNote: "R1, R5, R9 の 3 が C3, C6, C8 のみならその3列の他行から3を消去。" },
      ],
    },
    assistants: {
      heading: "5. スマートアシスト機能ガイド（設定内全7種）",
      intro: "「設定 -> スマートアシスト」からプレイスタイルに合わせて7種類の補助機能を自由に切り替えられます。",
      items: [
        { id: "highlight-identical", name: "同じ数字を強調", badge: "視覚補助", description: "選択中マスと同じ数字を盤面全体でハイライトします。", whenToUse: "スキャン速度を上げたいときに最適です。" },
        { id: "remaining-numbers", name: "残りの数字を表示", badge: "残り数表示", description: "キーパッド 1〜9 上に各数字の残り個数を表示します。", whenToUse: "終盤で残り1〜2個の数字を素早く見つけられます。" },
        { id: "highlight-area", name: "関連エリアを強調", badge: "範囲ガイド", description: "選択マスの行・列・3x3ブロックを淡い色で表示します。", whenToUse: "見落とし防止に役立ちます。" },
        { id: "auto-remove-notes", name: "メモを自動削除", badge: "メモ管理", description: "確定数字を入力すると関連する行・列・ブロックの重複メモを自動消去します。", whenToUse: "Daily Challenge や対戦時は常にオンが推奨です。" },
        { id: "auto-notes", name: "オートメモ", badge: "Hard・Expert 専用", description: "Hard と Expert 難易度限定で空白マスへ有効な候補メモを自動入力します。", whenToUse: "ペアや X-Wing の思考演習に集中したいときに便利です。" },
        { id: "fast-fill", name: "高速入力（数字先選択）", badge: "連続入力", description: "数字をキーパッドでロックし、複数マスをタップして素早く入力できます。", whenToUse: "スピードクリアや同じ候補の一括入力に最適です。" },
        { id: "auto-switch-completed", name: "完了数字を自動切替", badge: "フロー補助", description: "ある数字が9個すべて埋まると自動で次の未完了数字へ切り替わります。", whenToUse: "高速入力モードと組み合わせるとテンポ良く進みます。" },
      ],
    },
    contextualLinks: {
      beginnerCtaTemplate: "基本ルールを試すなら {{easyLink}}（ヒント51）または {{mediumLink}}（ヒント39）から始めましょう。",
      notesCtaTemplate: "メモ運用や新聞問題の検証には {{hardLink}}（ヒント30）や {{solverLink}} が便利です。",
      strategiesCtaTemplate: "学んだ手法を {{hardLink}}・{{expertLink}}、または毎日の {{dailyLink}} で実践しましょう。",
      advancedCtaTemplate: "ヒント25の {{expertLink}} に挑戦するか、難解盤面を {{solverLink}} で解析してみてください。",
      linkLabels: {
        easyLink: "初級数独",
        mediumLink: "中級数独",
        hardLink: "上級数独",
        expertLink: "エキスパート数独",
        dailyLink: "デイリーチャレンジ",
        solverLink: "無料数独ソルバー",
      },
    },
    faq: {
      heading: "6. よくある質問 (FAQ)",
      items: [
        { question: "SudokuSync の難易度ごとの初期ヒント数はいくつですか？", answer: "初級は51個（空白30）、中級は39個（空白42）、上級は30個（空白51）、エキスパートは25個（空白56）です。" },
        { question: "オートメモが Hard と Expert 専用なのはなぜですか？", answer: "Easy（51個）と Medium（39個）は自力スキャンを楽しむ設計のためです。Hard・Expert ではペアやフィッシュ戦術に集中できるようオートメモが用意されています。" },
        { question: "マルチプレイヤー対戦とデイリーチャレンジは全員同じ盤面ですか？", answer: "はい。決定論的シードにより全プレイヤーへ完全に同一の9x9盤面が配布され、タイムとミス回数で公平に競えます。" },
        { question: "ミス制限の仕組みはどうなっていますか？", answer: "ソロモードでは初期設定3回まで（設定から変更可）、マルチプレイヤーではルーム作成時にホストが制限回数を設定します。" },
        { question: "紙の数独や自作の9x9問題をソルバーで解けますか？", answer: "はい。数独ソルバーで17個以上のヒントを入力し、「自動解答」で唯一解を確認したり、「パズルをプレイ」でそのまま遊ぶことができます。" },
      ],
    },
  },

  ko: {
    hero: {
      badge: "SudokuSync 전략 매뉴얼",
      title: "스도쿠 규칙, 핵심 풀이 전략 및 스마트 어시스트 가이드",
      subtitle:
        "정통 9x9 스도쿠의 기본 하우스 구조부터 X-Wing·Y-Wing·Swordfish 같은 최고난도 패턴, 그리고 SudokuSync의 7가지 스마트 어시스트와 키보드 단축키를 한눈에 익히세요.",
      readingBadge: "완전판 9x9 가이드",
    },
    quickJumpTabs: [
      { id: "rules-basics", label: "기본 규칙" },
      { id: "rules-notes", label: "후보 메모" },
      { id: "rules-strategies", label: "핵심 기법" },
      { id: "rules-advanced", label: "고급 패턴" },
      { id: "rules-assistants", label: "스마트 어시스트" },
      { id: "rules-faq", label: "FAQ" },
    ],
    diagramLabels: {
      rowLabel: "가로줄 (행)",
      columnLabel: "세로줄 (열)",
      boxLabel: "3x3 박스",
      targetCellLabel: "대상 칸",
      candidatesLabel: "후보 메모",
      eliminatedLabel: "제거",
      lockedPairLabel: "잠긴 쌍",
      pointingLineLabel: "박스-라인",
      xWingCornerLabel: "X-Wing",
      stepCaption1: "도해 1: 9x9 보드의 각 칸은 가로줄, 세로줄, 3x3 박스라는 세 하우스에 동시에 속합니다.",
      stepCaption2: "도해 2: 숫자를 확정하기 전에 연필 메모로 가능한 후보를 좁히면 실수를 줄일 수 있습니다.",
      stepCaption3: "도해 3: Naked Pair는 두 칸에 두 숫자를 묶어 같은 하우스 내 다른 칸에서 해당 후보를 제거합니다.",
      stepCaption4: "도해 4: Pointing Pair는 한 3x3 박스의 후보가 한 줄에 모일 때 박스 밖 동일 줄에서 후보를 지웁니다.",
      stepCaption5: "도해 5: X-Wing의 네 모서리가 직사각형을 이루면 두 열의 나머지 칸에서 해당 숫자를 제거할 수 있습니다.",
    },
    basics: {
      heading: "1. 정통 9x9 보드 구조 및 기본 규칙",
      intro: "SudokuSync의 모든 퍼즐은 81칸과 아홉 개의 3x3 박스로 구성된 정통 9x9 격자입니다. 사칙연산 없이 1~9 기호의 논리 배치만으로 완성합니다.",
      coreRules: [
        { title: "모든 가로줄에 1–9 한 번씩", desc: "9개의 가로줄마다 숫자 1~9가 중복 없이 정확히 한 번씩 들어가야 합니다." },
        { title: "모든 세로줄에 1–9 한 번씩", desc: "9개의 세로줄마다 숫자 1~9가 빠짐없이 한 번씩 채워집니다." },
        { title: "모든 3x3 박스에 1–9 한 번씩", desc: "굵은 선으로 나뉜 9개의 3x3 구역 안에서도 1~9가 중복될 수 없습니다." },
        { title: "유일해 검증 및 실수 제한", desc: "모든 퍼즐은 단 하나의 정답만 존재하도록 검증됩니다. 설정의 실수 제한(솔로 기본 3회, 멀티플레이는 방장 설정)으로 오답을 관리합니다." },
      ],
      coordinatesTitle: "표준 좌표 표기법 (R1C1–R9C9)",
      coordinatesDesc: "위에서 아래로 행 R1–R9, 왼쪽에서 오른쪽으로 열 C1–C9로 부릅니다. 한 칸은 행·열·박스를 공유하는 최대 20개 칸의 영향을 받습니다.",
      difficultyScaleTitle: "SudokuSync 난이도별 힌트 수",
      difficultyRows: [
        { difficulty: "EASY", label: "쉬움 (Easy)", clues: "초기 힌트 51개 (빈칸 30)", logicSummary: "균형 잡힌 배치로 마지막 빈칸과 싱글 전략만으로 풀립니다." },
        { difficulty: "MEDIUM", label: "보통 (Medium)", clues: "초기 힌트 39개 (빈칸 42)", logicSummary: "라인·박스 히든 싱글과 네이키드 싱글이 어우러집니다." },
        { difficulty: "HARD", label: "어려움 (Hard)", clues: "초기 힌트 30개 (빈칸 51)", logicSummary: "Pointing Pairs, Box-Line 축소, 쌍/트리플 논리가 요구됩니다." },
        { difficulty: "EXPERT", label: "전문가 (Expert)", clues: "초기 힌트 25개 (빈칸 56)", logicSummary: "엄격한 숫자 제한 속에서 X-Wing, Y-Wing, Swordfish 등 다단계 추론이 필요합니다." },
      ],
    },
    notes: {
      heading: "2. 연필 메모(후보 숫자) 및 키보드 단축키",
      intro: "확신이 없을 때 찍기 대신 메모 모드를 켜서 가능한 후보를 깔끔하게 추적하세요.",
      workflowTitle: "깔끔한 메모 관리 순서",
      workflowSteps: [
        "1단계 — 먼저 눈에 바로 보이는 풀 하우스와 기본 싱글을 모두 채웁니다.",
        "2단계 — 막히는 구간이 오면 메모 모드를 켜고 후보를 기록합니다.",
        "3단계 — 설정에서 메모 자동 삭제를 켜 두면 숫자 확정 시 연결된 줄과 박스의 중복 메모가 즉시 지워집니다.",
        "4단계 — 메모가 줄어들 때마다 다시 줄과 박스를 스캔해 숨겨진 싱글과 쌍을 찾으세요.",
      ],
      shortcutsTitle: "검증된 SudokuSync 키보드 단축키",
      shortcuts: [
        { keys: "1–9 / Numpad 1–9", action: "숫자 또는 메모 입력 (빠른 채우기 모드에서는 활성 숫자를 잠금/해제)." },
        { keys: "Backspace / Delete", action: "선택된 빈칸/입력칸의 숫자나 메모 지우기." },
        { keys: "Spacebar / N", action: "화면 스크롤 없이 일반 입력과 메모 모드 전환." },
        { keys: "Ctrl + Z / Cmd + Z", action: "이전 숫자 입력 및 메모 변경을 즉시 실행 취소." },
        { keys: "H", action: "막힌 구간에서 스마트 논리 힌트 실행." },
        { keys: "Arrow Keys / Tab / Esc", action: "9x9 셀 이동, 메뉴 탐색 및 모달 창 닫기." },
      ],
    },
    strategies: {
      heading: "3. 초급·중급·고급 핵심 풀이 기법",
      intro: "아래 5가지 기법을 익히면 Easy, Medium, Hard 퍼즐을 추측 없이 완주할 수 있습니다.",
      items: [
        { id: "full-house", name: "마지막 빈칸 (Full House)", levelBadge: "초급", summary: "한 줄이나 3x3 박스에 8칸이 채워지면 남은 1칸은 빠진 숫자로 즉시 확정됩니다.", howToSpot: "빈칸이 하나만 남은 행, 열, 박스를 먼저 확인하세요.", exampleNote: "Row 2에 5만 없다면 R2C5=5입니다." },
        { id: "scanning", name: "스캐닝 & 교차 탐색", levelBadge: "초급", summary: "인접 블록의 숫자를 가로·세로로 연장해 목표 박스에서 들어갈 수 있는 칸을 좁힙니다.", howToSpot: "세 개의 박스가 이어진 줄에 같은 숫자가 2개 있으면 세 번째 박스를 보세요.", exampleNote: "1행과 3행에 7이 있으면 세 번째 상단 박스의 7은 2행에만 들어갑니다." },
        { id: "naked-hidden-singles", name: "네이키드 싱글 & 히든 싱글", levelBadge: "초급–중급", summary: "칸 자체의 후보가 1개면 네이키드 싱글, 여러 메모 중 특정 숫자가 하우스 전체에서 한 칸에만 있으면 히든 싱글입니다.", howToSpot: "영역 강조와 동일 숫자 강조를 함께 활용하면 쉽게 보입니다.", exampleNote: "R5C4={2,6,8} 중 Column 4에서 8이 여기뿐이면 8 확정." },
        { id: "pairs-triples", name: "네이키드/히든 페어 & 트리플", levelBadge: "중급–고급", summary: "같은 하우스의 두 칸이 정확히 {A, B}만 후보로 가지면 나머지 칸의 A와 B를 지울 수 있습니다.", howToSpot: "두 후보만 적힌 동일한 쌍 {A, B}가 한 하우스에 두 번 나오는지 찾으세요.", exampleNote: "R4C1={3,7}, R4C8={3,7}이면 R4C5={3,7,9}에서 9만 남습니다." },
        { id: "pointing-box-line", name: "포인팅 페어 & 박스-라인 축소", levelBadge: "고급", summary: "3x3 박스 안의 특정 후보가 한 행이나 열에만 모이면 박스 밖 같은 줄에서 해당 후보를 제거합니다.", howToSpot: "한 박스 내 일렬로만 정렬된 후보가 있는지 점검하세요.", exampleNote: "Box 1의 4가 R1C2, R1C3에만 있으면 R1C5–R1C9의 4를 제거합니다." },
      ],
    },
    advanced: {
      heading: "4. 전문가용 고급 패턴",
      intro: "힌트 25개 Expert 보드에서 싱글과 페어가 막힐 때 다음 세 패턴이 돌파구가 됩니다.",
      items: [
        { id: "x-wing", name: "X-Wing 전략", levelBadge: "Expert Fish", summary: "두 개의 행에서 특정 숫자가 정확히 같은 두 열에만 위치하면 직사각형을 이루어 두 열의 나머지 칸에서 그 숫자를 지웁니다.", howToSpot: "한 숫자가 두 줄에 딱 두 번씩 대칭으로 나타나는지 보세요.", exampleNote: "Row 2와 8에서 6이 {C2,C7}에만 있으면 C2, C7의 다른 칸에서 6을 제거." },
        { id: "y-wing", name: "Y-Wing (XY-Wing)", levelBadge: "Expert Wing", summary: "중심 {X,Y}가 두 날개 {X,Z}, {Y,Z}와 연결되면 양쪽 날개가 동시에 보는 칸에서 Z를 제거할 수 있습니다.", howToSpot: "후보가 2개인 중심 칸과 2개의 날개 칸을 연결해 보세요.", exampleNote: "R3C3={2,5}, R3C9={2,9}, R7C3={5,9}가 공통으로 보는 칸에서 9 제거." },
        { id: "swordfish", name: "Swordfish 전략", levelBadge: "Expert 3x3", summary: "X-Wing을 3행×3열로 확장해, 세 행의 후보가 동일한 세 열 안에만 있을 때 그 열들의 다른 칸에서 후보를 지웁니다.", howToSpot: "특정 숫자의 후보가 2~3개인 세 행이 3개 열 안에 겹치는지 확인하세요.", exampleNote: "R1, R5, R9의 3이 C3, C6, C8에만 있으면 해당 열 나머지 칸에서 3 제거." },
      ],
    },
    assistants: {
      heading: "5. 스마트 어시스트 가이드 (설정 7종 전체)",
      intro: "설정 -> 스마트 어시스트에서 7가지 시각·입력 보조 옵션을 언제든 켜고 끌 수 있습니다.",
      items: [
        { id: "highlight-identical", name: "동일 숫자 강조", badge: "시각 보조", description: "선택한 칸과 같은 숫자를 9x9 보드 전체에서 강조 표시합니다.", whenToUse: "빠른 교차 스캔에 가장 유용합니다." },
        { id: "remaining-numbers", name: "남은 숫자 표시", badge: "키패드 카운터", description: "1–9 키패드 버튼 위에 앞으로 채워야 할 남은 개수를 표시합니다.", whenToUse: "후반부에 남은 1~2개 숫자를 빨리 마무리할 때 좋습니다." },
        { id: "highlight-area", name: "관련 영역 강조", badge: "하우스 포커스", description: "선택 칸의 가로줄, 세로줄, 3x3 박스를 은은한 파스텔 톤으로 표시합니다.", whenToUse: "줄 착각을 막아 실수를 줄입니다." },
        { id: "auto-remove-notes", name: "메모 자동 삭제", badge: "메모 정리", description: "숫자를 확정하면 연결된 줄과 박스의 겹치는 후보 메모를 자동으로 지웁니다.", whenToUse: "데일리 챌린지와 멀티플레이 대결 시 켜두는 것을 권장합니다." },
        { id: "auto-notes", name: "자동 메모", badge: "Hard & Expert 전용", description: "어려움(Hard)과 전문가(Expert) 난이도에서만 빈칸의 유효 후보를 자동으로 채워줍니다.", whenToUse: "페어, X-Wing, Y-Wing 패턴 훈련에 집중할 때 효과적입니다." },
        { id: "fast-fill", name: "빠른 채우기 (숫자 우선)", badge: "속도 입력", description: "키패드 숫자를 잠그고 여러 칸을 연속 탭해 빠르게 숫자를 입력합니다.", whenToUse: "스피드 클리어와 숫자 일괄 배치에 최적화되어 있습니다." },
        { id: "auto-switch-completed", name: "완료된 숫자 자동 전환", badge: "흐름 보조", description: "한 숫자의 9개 배치가 모두 끝나면 자동으로 다음 미완료 숫자로 전환됩니다.", whenToUse: "빠른 채우기 모드와 함께 쓰면 터치 횟수가 크게 줄어듭니다." },
      ],
    },
    contextualLinks: {
      beginnerCtaTemplate: "기본 규칙과 스캐닝을 바로 익히려면 {{easyLink}}(힌트 51) 또는 {{mediumLink}}(힌트 39)로 시작해 보세요.",
      notesCtaTemplate: "메모 활용을 연습하거나 오프라인 퍼즐을 풀고 싶다면 {{hardLink}}(힌트 30) 또는 {{solverLink}}를 이용해 보세요.",
      strategiesCtaTemplate: "싱글·페어·포인팅 기법을 {{hardLink}}, {{expertLink}} 또는 오늘의 {{dailyLink}}에서 바로 적용해 보세요.",
      advancedCtaTemplate: "힌트 25개 {{expertLink}} 보드에 도전하거나 어려운 배치를 {{solverLink}}로 검증해 보세요.",
      linkLabels: {
        easyLink: "쉬움 스도쿠",
        mediumLink: "보통 스도쿠",
        hardLink: "어려움 스도쿠",
        expertLink: "전문가 스도쿠",
        dailyLink: "데일리 챌린지",
        solverLink: "무료 스도쿠 솔버",
      },
    },
    faq: {
      heading: "6. 자주 묻는 질문 (FAQ)",
      items: [
        { question: "SudokuSync 난이도별 초기 힌트 개수는 어떻게 되나요?", answer: "쉬움 51개(빈칸 30), 보통 39개(빈칸 42), 어려움 30개(빈칸 51), 전문가 25개(빈칸 56)입니다." },
        { question: "자동 메모(Auto-Notes)는 왜 Hard와 Expert에서만 동작하나요?", answer: "쉬움(51)과 보통(39)은 기본 스캐닝 훈련용으로 설계되었으며, 어려움·전문가에서는 쌍/피쉬 고급 추론에 바로 집중할 수 있도록 지원합니다." },
        { question: "멀티플레이와 데일리 챌린지에서는 모두 같은 퍼즐을 푸나요?", answer: "네. 결정론적 시드 생성을 통해 모든 참가자에게 동일한 9x9 퍼즐과 힌트가 제공되어 공정하게 시간과 실수를 겨룰 수 있습니다." },
        { question: "실수 제한은 솔로와 멀티플레이에서 어떻게 다른가요?", answer: "솔로 모드 기본 실수 제한은 3회이며 설정에서 끄고 켤 수 있습니다. 멀티플레이 방에서는 방 생성 시 호스트가 제한을 정합니다." },
        { question: "직접 입력한 9x9 퍼즐을 솔버로 풀거나 플레이할 수 있나요?", answer: "가능합니다. 스도쿠 솔버에서 17개 이상의 유효한 힌트를 입력한 뒤 자동 풀기 또는 보드에서 플레이하기를 선택하세요." },
      ],
    },
  },

  es: {
    hero: {
      badge: "Manual de Estrategia SudokuSync",
      title: "Reglas de Sudoku, Estrategias y Asistentes Inteligentes",
      subtitle:
        "Domina el Sudoku clásico 9x9 desde las reglas básicas hasta deducciones Experto (X-Wing, Y-Wing, Swordfish) y aprovecha los 7 Asistentes Inteligentes y atajos de teclado de SudokuSync.",
      readingBadge: "Guía Completa 9x9",
    },
    quickJumpTabs: [
      { id: "rules-basics", label: "Reglas Básicas" },
      { id: "rules-notes", label: "Notas / Lápiz" },
      { id: "rules-strategies", label: "Técnicas Clave" },
      { id: "rules-advanced", label: "Nivel Experto" },
      { id: "rules-assistants", label: "Asistentes" },
      { id: "rules-faq", label: "FAQ" },
    ],
    diagramLabels: {
      rowLabel: "Fila",
      columnLabel: "Columna",
      boxLabel: "Caja 3x3",
      targetCellLabel: "Objetivo",
      candidatesLabel: "Notas",
      eliminatedLabel: "Descartar",
      lockedPairLabel: "Par Bloqueado",
      pointingLineLabel: "Caja-Línea",
      xWingCornerLabel: "X-Wing",
      stepCaption1: "Diagrama 1: Cada celda 9x9 pertenece a tres unidades: una fila, una columna y una caja 3x3.",
      stepCaption2: "Diagrama 2: Las marcas de lápiz reducen los candidatos posibles antes de fijar un dígito final.",
      stepCaption3: "Diagrama 3: Un Par Desnudo bloquea dos dígitos en dos celdas y limpia esos candidatos del resto.",
      stepCaption4: "Diagrama 4: Un Par Apuntado alinea candidatos dentro de una caja 3x3 sobre la misma fila o columna.",
      stepCaption5: "Diagrama 5: Las cuatro esquinas de un X-Wing forman un rectángulo que elimina el dígito de ambas columnas.",
    },
    basics: {
      heading: "1. Anatomía de la Cuadrícula 9x9 y Reglas Esenciales",
      intro: "Todo tablero de SudokuSync usa la cuadrícula clásica 9x9 con 81 celdas y nueve cajas 3x3. No hay aritmética: 1 al 9 son símbolos de pura lógica.",
      coreRules: [
        { title: "1–9 sin repetir por Fila", desc: "Cada una de las 9 filas horizontales contiene del 1 al 9 una sola vez." },
        { title: "1–9 sin repetir por Columna", desc: "Cada una de las 9 columnas verticales contiene del 1 al 9 exactamente una vez." },
        { title: "1–9 sin repetir por Caja 3x3", desc: "Cada uno de los nueve bloques 3x3 contiene del 1 al 9 sin duplicados." },
        { title: "Solución Única y Límite de Errores", desc: "Cada tablero tiene solución única verificada. El límite opcional de errores (3 por defecto en Solo o configurable en salas Multijugador) valida fallos sin alterar pistas iniciales." },
      ],
      coordinatesTitle: "Notación de Coordenadas (R1C1–R9C9)",
      coordinatesDesc: "Las filas van de R1 a R9 y las columnas de C1 a C9. Cada celda interactúa con hasta 20 celdas vecinas de su fila, columna y caja.",
      difficultyScaleTitle: "Niveles y Pistas en SudokuSync",
      difficultyRows: [
        { difficulty: "EASY", label: "Fácil", clues: "51 Pistas (30 vacías)", logicSummary: "Cajas equilibradas que se resuelven solo con Última Celda Libre y Simples." },
        { difficulty: "MEDIUM", label: "Medio", clues: "39 Pistas (42 vacías)", logicSummary: "Combina Simples Ocultos en línea/caja y Simples Desnudos." },
        { difficulty: "HARD", label: "Difícil", clues: "30 Pistas (51 vacías)", logicSummary: "Escasez de dígitos con Pares Apuntados, Reducción Caja-Línea, Pares y Tríos." },
        { difficulty: "EXPERT", label: "Experto", clues: "25 Pistas (56 vacías)", logicSummary: "Alta dificultad con X-Wing, Y-Wing, Swordfish y cadenas lógicas." },
      ],
    },
    notes: {
      heading: "2. Marcas de Lápiz (Notas) y Atajos de Teclado",
      intro: "Evita adivinar activando las Notas cuando una celda tenga varias opciones posibles.",
      workflowTitle: "Flujo Limpio con Notas",
      workflowSteps: [
        "Paso 1 — Rellena primero los Simples evidentes sin llenar el tablero de notas innecesarias.",
        "Paso 2 — Activa Notas de Lápiz cuando el escaneo directo se detenga.",
        "Paso 3 — Deja activo Borrar Notas Auto. en Ajustes para limpiar candidatos obsoletos al instante.",
        "Paso 4 — Revisa cada unidad tras cada eliminación para descubrir nuevos Simples Ocultos.",
      ],
      shortcutsTitle: "Atajos de Teclado Verificados en SudokuSync",
      shortcuts: [
        { keys: "1–9 / Numpad 1–9", action: "Ingresar dígito o nota (en Llenado Rápido fija o libera el número activo)." },
        { keys: "Backspace / Delete", action: "Borrar dígito o notas de la celda seleccionada." },
        { keys: "Spacebar / N", action: "Alternar entre Número Final y Notas de Lápiz sin mover la página." },
        { keys: "Ctrl + Z / Cmd + Z", action: "Deshacer paso a paso jugadas y ediciones de notas." },
        { keys: "H", action: "Solicitar una Pista Lógica Inteligente cuando te atascas." },
        { keys: "Flechas / Tab / Esc", action: "Moverte por la cuadrícula 9x9, menús y ventanas modales." },
      ],
    },
    strategies: {
      heading: "3. Técnicas Básicas e Intermedias",
      intro: "Domina estas cinco técnicas para superar niveles Fácil, Medio y Difícil sin adivinar.",
      items: [
        { id: "full-house", name: "Última Celda Libre (Full House)", levelBadge: "Principiante", summary: "Cuando ocho celdas de una unidad están llenas, la única vacía toma el dígito faltante.", howToSpot: "Busca filas, columnas o cajas con un solo hueco.", exampleNote: "Si en la Fila 2 solo falta el 5, R2C5=5." },
        { id: "scanning", name: "Escaneo y Cruce (Cross-Hatching)", levelBadge: "Principiante", summary: "Proyecta filas y columnas ocupadas sobre una caja 3x3 para aislar la única casilla libre.", howToSpot: "Busca bandas de tres cajas donde un número ya aparece dos veces.", exampleNote: "Con un 7 en Fila 1 y Fila 3, en la tercera caja solo cabe en Fila 2." },
        { id: "naked-hidden-singles", name: "Simples Desnudos y Simples Ocultos", levelBadge: "Básico–Medio", summary: "Un Simple Desnudo deja un solo candidato en la celda; un Simple Oculto aparece en una sola celda de la unidad.", howToSpot: "Usa Resaltar Área para Simples Desnudos y resalta un dígito para ver Simples Ocultos.", exampleNote: "R5C4 tiene {2,6,8}, pero el 8 no cabe en otra celda de la Columna 4." },
        { id: "pairs-triples", name: "Pares Desnudos/Ocultos y Tríos", levelBadge: "Medio–Difícil", summary: "Si dos celdas de la misma unidad comparten exactamente {A, B}, ningún otro hueco de esa unidad puede tener A o B.", howToSpot: "Identifica pares bivalor idénticos en filas, columnas o cajas.", exampleNote: "R4C1={3,7} y R4C8={3,7} limpian 3 y 7 de R4C5={3,7,9}, dejando 9." },
        { id: "pointing-box-line", name: "Pares Apuntados y Reducción Caja-Línea", levelBadge: "Difícil", summary: "Cuando un candidato dentro de una caja 3x3 cae solo en una línea, se elimina del resto de esa línea fuera de la caja.", howToSpot: "Observa candidatos alineados dentro de un bloque.", exampleNote: "En Caja 1 el 4 solo está en R1C2 y R1C3 -> elimina 4 de R1C5 a R1C9." },
      ],
    },
    advanced: {
      heading: "4. Patrones Avanzados de Nivel Experto",
      intro: "En tableros Experto de 25 pistas, estos patrones destraban cuellos de botella complejos.",
      items: [
        { id: "x-wing", name: "Estrategia X-Wing", levelBadge: "Experto Fish", summary: "Un dígito aparece solo en las mismas dos columnas de dos filas distintas, eliminándolo del resto de esas dos columnas.", howToSpot: "Busca un rectángulo 2x2 de candidatos de un mismo número.", exampleNote: "El 6 en Fila 2 y Fila 8 solo ocupa {C2,C7}; bórralo del resto de C2 y C7." },
        { id: "y-wing", name: "Estrategia Y-Wing (XY-Wing)", levelBadge: "Experto Wing", summary: "Un pivote {X,Y} ve dos alas {X,Z} y {Y,Z}; toda celda que vea ambas alas descarta Z.", howToSpot: "Busca tres celdas bivalor encadenadas por dos valores compartidos.", exampleNote: "R3C3={2,5}, R3C9={2,9} y R7C3={5,9} eliminan el 9 de su intersección." },
        { id: "swordfish", name: "Estrategia Swordfish", levelBadge: "Experto 3x3", summary: "Versión de tres filas del X-Wing contenidas dentro de exactamente tres columnas comunes.", howToSpot: "Agrupa tres filas donde un dígito solo use las mismas tres columnas.", exampleNote: "El 3 en R1, R5 y R9 limitado a C3, C6, C8 se borra del resto de esas columnas." },
      ],
    },
    assistants: {
      heading: "5. Guía de Asistentes Inteligentes (Los 7 Ajustes)",
      intro: "Configura los 7 asistentes visuales y de velocidad en Ajustes -> Asistentes Inteligentes.",
      items: [
        { id: "highlight-identical", name: "Resaltar Números Idénticos", badge: "Ayuda Visual", description: "Resalta todos los dígitos iguales en todo el tablero 9x9.", whenToUse: "Ideal para escaneos rápidos." },
        { id: "remaining-numbers", name: "Mostrar Números Restantes", badge: "Contador", description: "Muestra en el teclado 1–9 cuántas veces falta colocar cada dígito.", whenToUse: "Acelera los cierres del tablero." },
        { id: "highlight-area", name: "Resaltar Área Relacionada", badge: "Enfoque", description: "Sombrea suavemente fila, columna y bloque 3x3 de la celda seleccionada.", whenToUse: "Evita errores de lectura entre filas." },
        { id: "auto-remove-notes", name: "Borrar Notas Automáticamente", badge: "Limpieza", description: "Elimina candidatos conflictivos al instante tras colocar un número definitivo.", whenToUse: "Recomendado siempre en Reto Diario y Multijugador." },
        { id: "auto-notes", name: "Notas Automáticas", badge: "Solo Difícil y Experto", description: "Rellena candidatos válidos automáticamente únicamente en niveles Difícil y Experto.", whenToUse: "Perfecto para practicar Pares, X-Wing e Y-Wing sin teclear todo." },
        { id: "fast-fill", name: "Llenado Rápido (Número Primero)", badge: "Velocidad", description: "Fija un número en el teclado para tocar múltiples celdas seguidas.", whenToUse: "Excelente para rachas rápidas y teclado numérico." },
        { id: "auto-switch-completed", name: "Cambiar Número Completado", badge: "Fluidez", description: "Cambia automáticamente al siguiente número pendiente cuando completas los 9 de un dígito.", whenToUse: "Reduce toques innecesarios en Llenado Rápido." },
      ],
    },
    contextualLinks: {
      beginnerCtaTemplate: "Empieza practicando unidades y escaneo en {{easyLink}} (51 pistas) o sube a {{mediumLink}} (39 pistas).",
      notesCtaTemplate: "¿Quieres entrenar notas limpias o validar tableros de papel? Prueba {{hardLink}} (30 pistas) o abre nuestro {{solverLink}}.",
      strategiesCtaTemplate: "Aplica Simples, Pares y Líneas en {{hardLink}}, {{expertLink}} o en la semilla global del {{dailyLink}}.",
      advancedCtaTemplate: "Supera cuellos de botella de 25 pistas en {{expertLink}} o analiza posiciones complejas en el {{solverLink}}.",
      linkLabels: {
        easyLink: "Sudoku Fácil",
        mediumLink: "Sudoku Medio",
        hardLink: "Sudoku Difícil",
        expertLink: "Sudoku Experto",
        dailyLink: "Reto Diario",
        solverLink: "Solucionador Gratis",
      },
    },
    faq: {
      heading: "6. Preguntas Frecuentes (FAQ)",
      items: [
        { question: "¿Cuántas pistas iniciales tiene cada dificultad en SudokuSync?", answer: "Fácil tiene 51 pistas (30 vacías), Medio 39 (42 vacías), Difícil 30 (51 vacías) y Experto 25 pistas (56 vacías)." },
        { question: "¿Por qué Notas Automáticas solo funciona en Difícil y Experto?", answer: "Fácil (51) y Medio (39) entrenan el escaneo visual. Difícil y Experto están pensados para técnicas de pares y patrones avanzados." },
        { question: "¿Todos reciben exactamente el mismo tablero en Multijugador y Reto Diario?", answer: "Sí, ambos usan semillas deterministas para garantizar tableros idénticos y tiempos comparables." },
        { question: "¿Cómo funciona el Límite de Errores?", answer: "En Solo es de 3 errores por defecto y se puede activar o desactivar en Ajustes; en salas Multijugador lo define el anfitrión." },
        { question: "¿Puedo resolver o jugar un Sudoku personalizado en SudokuSync?", answer: "Sí. Abre el Solucionador de Sudoku, introduce al menos 17 pistas válidas y elige Resolver Auto. o Jugar Puzzle." },
      ],
    },
  },

  fr: {
    hero: {
      badge: "Manuel Stratégique SudokuSync",
      title: "Règles du Sudoku, Stratégies et Assistants Intelligents",
      subtitle:
        "Maîtrisez le Sudoku classique 9x9, des règles de base jusqu'aux figures Expert (X-Wing, Y-Wing, Swordfish), avec les 7 Assistants Intelligents et raccourcis clavier de SudokuSync.",
      readingBadge: "Guide Complet 9x9",
    },
    quickJumpTabs: [
      { id: "rules-basics", label: "Règles de Base" },
      { id: "rules-notes", label: "Notes / Crayon" },
      { id: "rules-strategies", label: "Techniques" },
      { id: "rules-advanced", label: "Niveau Expert" },
      { id: "rules-assistants", label: "Assistants" },
      { id: "rules-faq", label: "FAQ" },
    ],
    diagramLabels: {
      rowLabel: "Ligne",
      columnLabel: "Colonne",
      boxLabel: "Bloc 3x3",
      targetCellLabel: "Cible",
      candidatesLabel: "Notes",
      eliminatedLabel: "Éliminer",
      lockedPairLabel: "Paire Liée",
      pointingLineLabel: "Bloc-Ligne",
      xWingCornerLabel: "X-Wing",
      stepCaption1: "Schéma 1 : Chaque case 9x9 appartient à trois unités : une ligne, une colonne et un bloc 3x3.",
      stepCaption2: "Schéma 2 : Les notes au crayon filtrent les candidats possibles avant de valider un chiffre final.",
      stepCaption3: "Schéma 3 : Une Paire Nue bloque deux chiffres sur deux cases et nettoie les autres cases de l'unité.",
      stepCaption4: "Schéma 4 : Une Paire Pointante aligne un candidat du bloc 3x3 le long d'une même ligne ou colonne.",
      stepCaption5: "Schéma 5 : Les quatre sommets d'un X-Wing forment un rectangle qui élimine le chiffre sur les deux colonnes.",
    },
    basics: {
      heading: "1. Anatomie de la Grille 9x9 et Règles Fondamentales",
      intro: "Chaque grille SudokuSync repose sur le format classique 9x9 (81 cases, neuf blocs 3x3). Aucun calcul n'est requis : 1 à 9 sont des symboles logiques.",
      coreRules: [
        { title: "1–9 unique par Ligne", desc: "Chaque ligne horizontale contient tous les chiffres de 1 à 9 sans doublon." },
        { title: "1–9 unique par Colonne", desc: "Chaque colonne verticale contient les chiffres 1 à 9 une seule fois." },
        { title: "1–9 unique par Bloc 3x3", desc: "Chacun des neuf carrés 3x3 contient 1 à 9 exactement une fois." },
        { title: "Solution Unique et Limite d'Erreurs", desc: "Chaque grille générée possède une unique solution vérifiée. La limite d'erreurs optionnelle (3 en Solo ou réglée par l'hôte en Multijoueur) encadre chaque partie." },
      ],
      coordinatesTitle: "Notation des Coordonnées (R1C1–R9C9)",
      coordinatesDesc: "Les lignes vont de R1 à R9 et les colonnes de C1 à C9. Chaque case partage jusqu'à 20 cases voisines via ses trois unités.",
      difficultyScaleTitle: "Niveaux et Indices dans SudokuSync",
      difficultyRows: [
        { difficulty: "EASY", label: "Facile", clues: "51 Indices (30 vides)", logicSummary: "Blocs équilibrés résolubles uniquement par Dernière Case et Singles." },
        { difficulty: "MEDIUM", label: "Moyen", clues: "39 Indices (42 vides)", logicSummary: "Mélange Singles Cachés (ligne/bloc) et Singles Nus." },
        { difficulty: "HARD", label: "Difficile", clues: "30 Indices (51 vides)", logicSummary: "Rareté ciblée demandant Paires Pointantes, Réduction Bloc-Ligne, Paires et Triplets." },
        { difficulty: "EXPERT", label: "Expert", clues: "25 Indices (56 vides)", logicSummary: "Grilles exigeantes résolues via X-Wing, Y-Wing, Swordfish et chaînes." },
      ],
    },
    notes: {
      heading: "2. Notes au Crayon et Vitesse au Clavier",
      intro: "Évitez de deviner en passant en mode Notes dès qu'une case reste ambiguë.",
      workflowTitle: "Méthode Propre avec Notes",
      workflowSteps: [
        "Étape 1 — Remplissez d'abord tous les Singles évidents sans notes.",
        "Étape 2 — Passez en Notes lorsque le balayage direct s'arrête.",
        "Étape 3 — Gardez Effacement Auto des Notes activé pour nettoyer automatiquement les candidats.",
        "Étape 4 — Rebalayez la ligne, la colonne et le bloc après chaque réduction.",
      ],
      shortcutsTitle: "Raccourcis Clavier Vérifiés dans SudokuSync",
      shortcuts: [
        { keys: "1–9 / Numpad 1–9", action: "Entrer un chiffre ou une note (verrouille/déverrouille le chiffre en Remplissage Rapide)." },
        { keys: "Backspace / Delete", action: "Effacer le chiffre saisi ou les notes de la case sélectionnée." },
        { keys: "Spacebar / N", action: "Basculer entre Chiffre Final et Notes sans faire défiler la page." },
        { keys: "Ctrl + Z / Cmd + Z", action: "Annuler pas à pas vos dernières saisies et notes." },
        { keys: "H", action: "Déclencher un Indice Logique Intelligent." },
        { keys: "Flèches / Tab / Esc", action: "Naviguer sur la grille 9x9, parcourir les menus ou fermer un dialogue." },
      ],
    },
    strategies: {
      heading: "3. Techniques Débutant à Intermédiaire",
      intro: "Maîtrisez ces cinq méthodes pour terminer Facile, Moyen et Difficile sans hasard.",
      items: [
        { id: "full-house", name: "Dernière Case Libre (Full House)", levelBadge: "Débutant", summary: "Quand huit cases d'une unité sont remplies, la neuvième prend le seul chiffre manquant.", howToSpot: "Cherchez les unités avec une seule case vide.", exampleNote: "En Ligne 2 il ne manque que le 5 : R2C5 vaut 5." },
        { id: "scanning", name: "Balayage et Croisement", levelBadge: "Débutant", summary: "Projetez les lignes et colonnes occupées sur un bloc 3x3 pour isoler la seule case libre.", howToSpot: "Observez les bandes de trois blocs contenant déjà deux fois un chiffre.", exampleNote: "Avec un 7 en Ligne 1 et 3, le troisième bloc n'accepte 7 qu'en Ligne 2." },
        { id: "naked-hidden-singles", name: "Singles Nus et Singles Cachés", levelBadge: "Débutant–Moyen", summary: "Un Single Nu laisse un seul candidat dans la case ; un Single Caché n'existe que dans une case de l'unité.", howToSpot: "Activez Surligner la Zone pour les Singles Nus.", exampleNote: "R5C4={2,6,8} mais 8 n'est nulle part ailleurs en Colonne 4." },
        { id: "pairs-triples", name: "Paires Nues/Cachées et Triplets", levelBadge: "Moyen–Difficile", summary: "Si deux cases d'une unité ne contiennent que {A, B}, retirez A et B des autres cases de cette unité.", howToSpot: "Repérez deux cases partageant les mêmes deux notes.", exampleNote: "R4C1={3,7} et R4C8={3,7} suppriment 3 et 7 de R4C5={3,7,9}, révélant 9." },
        { id: "pointing-box-line", name: "Paires Pointantes et Réduction Bloc-Ligne", levelBadge: "Difficile", summary: "Si un candidat d'un bloc 3x3 n'apparaît que sur une même ligne, supprimez-le du reste de cette ligne hors du bloc.", howToSpot: "Vérifiez l'alignement des candidats dans chaque bloc.", exampleNote: "Dans Bloc 1, 4 est uniquement en R1C2 et R1C3 -> retirez 4 de R1C5 à R1C9." },
      ],
    },
    advanced: {
      heading: "4. Figures Expert Avancées",
      intro: "Sur les grilles Expert à 25 indices, ces trois figures débloquent les blocages avancés.",
      items: [
        { id: "x-wing", name: "Stratégie X-Wing", levelBadge: "Expert Fish", summary: "Un chiffre limité aux mêmes deux colonnes sur deux lignes forme un rectangle verrouillé et s'élimine ailleurs dans ces deux colonnes.", howToSpot: "Cherchez un alignement 2x2 pour un même chiffre.", exampleNote: "6 limité à {C2,C7} en R2 et R8 disparaît du reste de C2 et C7." },
        { id: "y-wing", name: "Stratégie Y-Wing (XY-Wing)", levelBadge: "Expert Wing", summary: "Un pivot {X,Y} relie deux ailes {X,Z} et {Y,Z} : toute case voyant les deux ailes exclut Z.", howToSpot: "Trouvez trois cases à deux candidats formant un triangle logique.", exampleNote: "R3C3={2,5}, R3C9={2,9} et R7C3={5,9} retirent 9 de leur intersection." },
        { id: "swordfish", name: "Stratégie Swordfish", levelBadge: "Expert 3x3", summary: "Extension du X-Wing sur trois lignes contenues dans trois colonnes communes.", howToSpot: "Repérez trois lignes dont les candidats tiennent dans trois colonnes identiques.", exampleNote: "3 en R1, R5 et R9 dans {C3,C6,C8} est éliminé ailleurs sur ces colonnes." },
      ],
    },
    assistants: {
      heading: "5. Guide des 7 Assistants Intelligents",
      intro: "Ouvrez Paramètres -> Assistants Intelligents pour personnaliser ces 7 aides.",
      items: [
        { id: "highlight-identical", name: "Surligner les Chiffres Identiques", badge: "Aide Visuelle", description: "Met en valeur chaque occurrence du chiffre sélectionné sur la grille.", whenToUse: "Idéal pour le balayage rapide." },
        { id: "remaining-numbers", name: "Afficher les Chiffres Restants", badge: "Compteur Clavier", description: "Affiche sur les touches 1–9 combien d'exemplaires restent à placer.", whenToUse: "Accélère les fins de grille." },
        { id: "highlight-area", name: "Surligner la Zone Liée", badge: "Focus Unité", description: "Colore légèrement la ligne, colonne et bloc 3x3 de la case active.", whenToUse: "Évite les décalages visuels." },
        { id: "auto-remove-notes", name: "Effacer Notes Auto.", badge: "Propreté", description: "Supprime les notes conflictuelles dès qu'un chiffre définitif est posé.", whenToUse: "Indispensable pour le Défi Quotidien et le Multijoueur." },
        { id: "auto-notes", name: "Notes Auto.", badge: "Difficile & Expert Uniquement", description: "Remplit automatiquement les candidats valides uniquement sur Difficile et Expert.", whenToUse: "Parfait pour s'exercer directement aux Paires, X-Wing et Y-Wing." },
        { id: "fast-fill", name: "Remplissage Rapide (Chiffre d'abord)", badge: "Saisie Rapide", description: "Verrouille un chiffre au clavier pour remplir plusieurs cases d'affilée.", whenToUse: "Gain de temps majeur sur mobile ou pavé numérique." },
        { id: "auto-switch-completed", name: "Changer Chiffre Terminé Auto.", badge: "Fluidité", description: "Passe automatiquement au chiffre suivant une fois les 9 exemplaires placés.", whenToUse: "Enchaîne les séries sans clic supplémentaire." },
      ],
    },
    contextualLinks: {
      beginnerCtaTemplate: "Prêts à pratiquer ? Lancez une partie {{easyLink}} (51 indices) ou {{mediumLink}} (39 indices).",
      notesCtaTemplate: "Besoin de maîtriser les notes ou vérifier une grille papier ? Essayez {{hardLink}} (30 indices) ou le {{solverLink}}.",
      strategiesCtaTemplate: "Testez Singles, Paires et Pointantes sur {{hardLink}}, {{expertLink}} ou le {{dailyLink}}.",
      advancedCtaTemplate: "Relevez les 25 indices du mode {{expertLink}} ou analysez vos positions dans notre {{solverLink}}.",
      linkLabels: {
        easyLink: "Sudoku Facile",
        mediumLink: "Sudoku Moyen",
        hardLink: "Sudoku Difficile",
        expertLink: "Sudoku Expert",
        dailyLink: "Défi Quotidien",
        solverLink: "Solveur Sudoku Gratuit",
      },
    },
    faq: {
      heading: "6. Questions Fréquentes (FAQ)",
      items: [
        { question: "Combien d'indices de départ offrent les difficultés de SudokuSync ?", answer: "Facile : 51 indices (30 vides), Moyen : 39 indices (42 vides), Difficile : 30 indices (51 vides), Expert : 25 indices (56 vides)." },
        { question: "Pourquoi Notes Auto. est-il réservé à Difficile et Expert ?", answer: "Facile et Moyen privilégient le balayage visuel direct. Difficile et Expert bénéficient des notes pré-remplies pour les techniques avancées." },
        { question: "Le Multijoueur et le Défi Quotidien utilisent-ils la même grille ?", answer: "Oui. Chaque défi repose sur une graine déterministe assurant exactement la même grille pour tous les joueurs." },
        { question: "Comment fonctionne la limite d'erreurs ?", answer: "En Solo elle vaut 3 erreurs par défaut (modifiable dans Paramètres). En Multijoueur l'hôte choisit la limite du salon." },
        { question: "Puis-je résoudre une grille personnalisée 9x9 ?", answer: "Oui, via le Solveur Sudoku : entrez au moins 17 indices valides puis lancez Résolution Auto ou Jouer la Grille." },
      ],
    },
  },

  it: {
    hero: {
      badge: "Manuale Strategico SudokuSync",
      title: "Regole del Sudoku, Strategie e Assistenti Intelligenti",
      subtitle:
        "Impara il Sudoku classico 9x9 dalle basi fino alle tecniche Expert (X-Wing, Y-Wing, Swordfish) e scopri tutti i 7 Assistenti Intelligenti e le scorciatoie da tastiera di SudokuSync.",
      readingBadge: "Guida Completa 9x9",
    },
    quickJumpTabs: [
      { id: "rules-basics", label: "Regole Base" },
      { id: "rules-notes", label: "Note a Matita" },
      { id: "rules-strategies", label: "Tecniche Chiave" },
      { id: "rules-advanced", label: "Livello Esperto" },
      { id: "rules-assistants", label: "Assistenti" },
      { id: "rules-faq", label: "FAQ" },
    ],
    diagramLabels: {
      rowLabel: "Riga",
      columnLabel: "Colonna",
      boxLabel: "Riquadro 3x3",
      targetCellLabel: "Cella",
      candidatesLabel: "Note",
      eliminatedLabel: "Elimina",
      lockedPairLabel: "Coppia Bloccata",
      pointingLineLabel: "Box-Linea",
      xWingCornerLabel: "X-Wing",
      stepCaption1: "Diagramma 1: Ogni cella 9x9 appartiene a tre unità: una riga, una colonna e un riquadro 3x3.",
      stepCaption2: "Diagramma 2: Le note a matita restringono i candidati prima di confermare una cifra finale.",
      stepCaption3: "Diagramma 3: Una Coppia Nuda blocca due cifre in due celle eliminandole dal resto dell'unità.",
      stepCaption4: "Diagramma 4: Una Coppia Puntata allinea un candidato nel box 3x3 lungo la stessa riga o colonna.",
      stepCaption5: "Diagramma 5: I quattro vertici di un X-Wing formano un rettangolo che elimina la cifra dalle due colonne.",
    },
    basics: {
      heading: "1. Struttura della Griglia 9x9 e Regole Principali",
      intro: "SudokuSync utilizza esclusivamente il classico schema 9x9 da 81 celle e nove riquadri 3x3. Serve solo logica pura, nessun calcolo matematico.",
      coreRules: [
        { title: "1–9 unico per Riga", desc: "Ogni riga orizzontale contiene i numeri da 1 a 9 senza ripetizioni." },
        { title: "1–9 unico per Colonna", desc: "Ogni colonna verticale contiene le cifre da 1 a 9 esattamente una volta." },
        { title: "1–9 unico per Riquadro 3x3", desc: "Ogni blocco 3x3 contiene tutti i numeri da 1 a 9 senza duplicati." },
        { title: "Soluzione Unica e Limite Errori", desc: "Ogni schema ha una sola soluzione verificata. Il limite errori opzionale (3 in Solo, configurabile dall'host in Multigiocatore) controlla gli inserimenti errati." },
      ],
      coordinatesTitle: "Coordinate Standard (R1C1–R9C9)",
      coordinatesDesc: "Le righe vanno da R1 a R9 e le colonne da C1 a C9. Ogni cella condivide fino a 20 celle collegate.",
      difficultyScaleTitle: "Livelli e Indizi in SudokuSync",
      difficultyRows: [
        { difficulty: "EASY", label: "Facile", clues: "51 Indizi (30 vuote)", logicSummary: "Schema bilanciato risolvibile solo con Ultima Cella Libera e Singoli." },
        { difficulty: "MEDIUM", label: "Medio", clues: "39 Indizi (42 vuote)", logicSummary: "Combina Singoli Nascosti di riga/riquadro e Singoli Nudi." },
        { difficulty: "HARD", label: "Difficile", clues: "30 Indizi (51 vuote)", logicSummary: "Richiede Coppie Puntate, Riduzione Box-Linea, Coppie e Terzine." },
        { difficulty: "EXPERT", label: "Esperto", clues: "25 Indizi (56 vuote)", logicSummary: "Scarsità mirata con X-Wing, Y-Wing, Swordfish e catene logiche." },
      ],
    },
    notes: {
      heading: "2. Note a Matita e Comandi da Tastiera",
      intro: "Attiva la modalità Note invece di tirare a indovinare per tracciare tutti i candidati validi.",
      workflowTitle: "Flusso Ordinato con le Note",
      workflowSteps: [
        "1. Inserisci prima tutti i Singoli evidenti senza note.",
        "2. Passa alle Note a Matita quando la scansione diretta si ferma.",
        "3. Tieni attivo Rimuovi Note Auto nelle Impostazioni per pulire automaticamente i candidati obsoleti.",
        "4. Ricontrolla righe, colonne e riquadri dopo ogni eliminazione.",
      ],
      shortcutsTitle: "Scorciatoie da Tastiera Verificate in SudokuSync",
      shortcuts: [
        { keys: "1–9 / Numpad 1–9", action: "Inserisci cifra o nota (blocca/sblocca la cifra in Riempimento Rapido)." },
        { keys: "Backspace / Delete", action: "Cancella cifra o note nella cella selezionata." },
        { keys: "Spacebar / N", action: "Alterna Cifra Finale e Note a Matita senza scorrere la pagina." },
        { keys: "Ctrl + Z / Cmd + Z", action: "Annulla passo passo inserimenti e note." },
        { keys: "H", action: "Attiva un Suggerimento Logico Intelligente." },
        { keys: "Frecce / Tab / Esc", action: "Muoviti nella griglia 9x9, nei menu e chiudi i modali." },
      ],
    },
    strategies: {
      heading: "3. Tecniche Base e Intermedie",
      intro: "Queste cinque tecniche coprono perfettamente Facile, Medio e Difficile senza tentativi casuali.",
      items: [
        { id: "full-house", name: "Ultima Cella Libera (Full House)", levelBadge: "Principiante", summary: "Quando otto celle di una riga, colonna o box sono piene, l'ultima riceve la cifra mancante.", howToSpot: "Cerca unità con un solo spazio vuoto.", exampleNote: "Se in Riga 2 manca solo il 5, R2C5=5." },
        { id: "scanning", name: "Scansione e Incrocio", levelBadge: "Principiante", summary: "Proietta righe e colonne già occupate attraverso un riquadro 3x3 per isolare una cella.", howToSpot: "Cerca fasce di tre riquadri con due occorrenze dello stesso numero.", exampleNote: "Con 7 in Riga 1 e 3, nel terzo blocco resta solo Riga 2." },
        { id: "naked-hidden-singles", name: "Singoli Nudi e Singoli Nascosti", levelBadge: "Base–Medio", summary: "Un Singolo Nudo lascia un unico candidato nella cella; un Singolo Nascosto compare in una sola cella di tutta l'unità.", howToSpot: "Usa Evidenzia Area Correlata e selezione numero.", exampleNote: "R5C4 ha {2,6,8}, ma 8 non appare altrove in Colonna 4." },
        { id: "pairs-triples", name: "Coppie Nude/Nascoste e Terzine", levelBadge: "Medio–Difficile", summary: "Due celle con gli identici due candidati {A, B} nella stessa unità escludono A e B dalle altre celle.", howToSpot: "Cerca due celle bivalore identiche nello stesso gruppo.", exampleNote: "R4C1={3,7} e R4C8={3,7} tolgono 3 e 7 da R4C5={3,7,9}, lasciando 9." },
        { id: "pointing-box-line", name: "Coppie Puntate e Riduzione Box-Linea", levelBadge: "Difficile", summary: "Se un candidato in un box 3x3 sta su una sola riga o colonna, va rimosso fuori dal box lungo quella linea.", howToSpot: "Controlla i candidati allineati in ogni riquadro.", exampleNote: "In Box 1 il 4 è solo in R1C2 e R1C3 -> rimuovi 4 da R1C5 a R1C9." },
      ],
    },
    advanced: {
      heading: "4. Pattern Avanzati Esperto",
      intro: "Negli schemi Esperto da 25 indizi questi tre schemi risolvono i passaggi più ostici.",
      items: [
        { id: "x-wing", name: "Strategia X-Wing", levelBadge: "Esperto Fish", summary: "Un candidato in due righe occupa esattamente le stesse due colonne, consentendo di eliminarlo dal resto di quelle colonne.", howToSpot: "Cerca un rettangolo 2x2 per la stessa cifra.", exampleNote: "Il 6 in R2 e R8 solo in {C2,C7} elimina il 6 altrove in C2 e C7." },
        { id: "y-wing", name: "Strategia Y-Wing (XY-Wing)", levelBadge: "Esperto Wing", summary: "Un perno {X,Y} vede due ali {X,Z} e {Y,Z}; ogni cella che vede entrambe le ali esclude Z.", howToSpot: "Individua tre celle a due candidati collegate a catena.", exampleNote: "R3C3={2,5}, R3C9={2,9} e R7C3={5,9} eliminano il 9 comune." },
        { id: "swordfish", name: "Strategia Swordfish", levelBadge: "Esperto 3x3", summary: "Estensione a tre righe dell'X-Wing racchiusa in tre colonne comuni.", howToSpot: "Trova tre righe di un candidato contenute nelle stesse tre colonne.", exampleNote: "Il 3 in R1, R5, R9 solo in C3, C6, C8 viene eliminato altrove in quelle colonne." },
      ],
    },
    assistants: {
      heading: "5. Guida agli Assistenti Intelligenti (Tutti i 7)",
      intro: "Personalizza tutti e 7 gli aiuti da Impostazioni -> Assistenti Intelligenti.",
      items: [
        { id: "highlight-identical", name: "Evidenzia Numeri Identici", badge: "Aiuto Visivo", description: "Evidenzia tutte le cifre uguali su tutto lo schema 9x9.", whenToUse: "Velocizza la scansione visiva." },
        { id: "remaining-numbers", name: "Mostra Numeri Rimanenti", badge: "Contatore", description: "Mostra sui tasti 1–9 quante cifre mancano per ogni numero.", whenToUse: "Utile per chiudere rapidamente la partita." },
        { id: "highlight-area", name: "Evidenzia Area Correlata", badge: "Focus Unità", description: "Sfuma riga, colonna e riquadro 3x3 della cella attiva.", whenToUse: "Previene errori di allineamento." },
        { id: "auto-remove-notes", name: "Rimuovi Note Auto.", badge: "Pulizia Note", description: "Cancella automaticamente i candidati superati quando inserisci una cifra.", whenToUse: "Consigliato in Sfida Giornaliera e Multigiocatore." },
        { id: "auto-notes", name: "Note Automatiche", badge: "Solo Difficile ed Esperto", description: "Compila automaticamente i candidati validi esclusivamente nei livelli Difficile ed Esperto.", whenToUse: "Ideale per allenarsi subito su Coppie, X-Wing e Y-Wing." },
        { id: "fast-fill", name: "Riempimento Rapido (Numero Prima)", badge: "Velocità", description: "Blocca una cifra sul tastierino per riempire più celle toccandole in sequenza.", whenToUse: "Perfetto con tastierino numerico o tocco rapido." },
        { id: "auto-switch-completed", name: "Cambio Numero Completato", badge: "Fluidità", description: "Passa al numero successivo appena completi tutte le 9 celle della cifra attuale.", whenToUse: "Riduce i tocchi extra nel flusso di gioco." },
      ],
    },
    contextualLinks: {
      beginnerCtaTemplate: "Metti alla prova regole e incroci con {{easyLink}} (51 indizi) o {{mediumLink}} (39 indizi).",
      notesCtaTemplate: "Vuoi esercitarti con le note o verificare schemi cartacei? Prova {{hardLink}} (30 indizi) o il nostro {{solverLink}}.",
      strategiesCtaTemplate: "Applica Singoli, Coppie e Linee su {{hardLink}}, {{expertLink}} o nella {{dailyLink}}.",
      advancedCtaTemplate: "Affronta i 25 indizi di {{expertLink}} oppure analizza casi difficili con il {{solverLink}}.",
      linkLabels: {
        easyLink: "Sudoku Facile",
        mediumLink: "Sudoku Medio",
        hardLink: "Sudoku Difficile",
        expertLink: "Sudoku Esperto",
        dailyLink: "Sfida Giornaliera",
        solverLink: "Risolutore Sudoku Gratis",
      },
    },
    faq: {
      heading: "6. Domande Frequenti (FAQ)",
      items: [
        { question: "Quanti indizi iniziali hanno le difficoltà di SudokuSync?", answer: "Facile 51 indizi (30 vuote), Medio 39 (42 vuote), Difficile 30 (51 vuote) ed Esperto 25 indizi (56 vuote)." },
        { question: "Perché Note Automatiche è disponibile solo su Difficile ed Esperto?", answer: "Facile (51) e Medio (39) allenano la scansione diretta; Difficile ed Esperto usano le note per strategie avanzate." },
        { question: "Multigiocatore e Sfida Giornaliera danno lo stesso schema a tutti?", answer: "Sì, entrambi usano semi deterministici per garantire schemi identici ed equi." },
        { question: "Come funziona il Limite Errori?", answer: "In Solo è 3 di default ed è disattivabile nelle Impostazioni; nel Multigiocatore lo sceglie l'host della stanza." },
        { question: "Posso risolvere un Sudoku 9x9 personalizzato?", answer: "Sì, apri il Risolutore Sudoku, inserisci almeno 17 indizi validi e scegli Risolvi o Gioca Puzzle." },
      ],
    },
  },

  "pt-BR": {
    hero: {
      badge: "Manual de Estratégia SudokuSync",
      title: "Regras do Sudoku, Estratégias e Assistentes Inteligentes",
      subtitle:
        "Domine o Sudoku clássico 9x9 das unidades básicas até deduções Expert (X-Wing, Y-Wing, Swordfish) e configure todos os 7 Assistentes Inteligentes e atalhos de teclado do SudokuSync.",
      readingBadge: "Guia Completo 9x9",
    },
    quickJumpTabs: [
      { id: "rules-basics", label: "Regras Básicas" },
      { id: "rules-notes", label: "Notas / Lápis" },
      { id: "rules-strategies", label: "Técnicas Chave" },
      { id: "rules-advanced", label: "Nível Expert" },
      { id: "rules-assistants", label: "Assistentes" },
      { id: "rules-faq", label: "FAQ" },
    ],
    diagramLabels: {
      rowLabel: "Linha",
      columnLabel: "Coluna",
      boxLabel: "Bloco 3x3",
      targetCellLabel: "Alvo",
      candidatesLabel: "Notas",
      eliminatedLabel: "Eliminar",
      lockedPairLabel: "Par Travado",
      pointingLineLabel: "Bloco-Linha",
      xWingCornerLabel: "X-Wing",
      stepCaption1: "Diagrama 1: Cada célula 9x9 pertence a três unidades: uma linha, uma coluna e um bloco 3x3.",
      stepCaption2: "Diagrama 2: Anotações a lápis filtram os candidatos válidos antes de confirmar o dígito final.",
      stepCaption3: "Diagrama 3: Um Par Nu trava dois dígitos em duas células e limpa esses candidatos do restante da unidade.",
      stepCaption4: "Diagrama 4: Um Par Apontado alinha candidatos dentro de um bloco 3x3 sobre uma mesma linha ou coluna.",
      stepCaption5: "Diagrama 5: Os quatro cantos de um X-Wing formam um retângulo que elimina o dígito nas duas colunas.",
    },
    basics: {
      heading: "1. Anatomia da Grade 9x9 e Regras Essenciais",
      intro: "Todo tabuleiro do SudokuSync segue o padrão clássico 9x9 (81 células, nove blocos 3x3). Nenhuma conta matemática é necessária: apenas lógica pura de 1 a 9.",
      coreRules: [
        { title: "1–9 único por Linha", desc: "Cada uma das 9 linhas horizontais deve conter os números de 1 a 9 sem repetição." },
        { title: "1–9 único por Coluna", desc: "Cada uma das 9 colunas verticais deve conter de 1 a 9 exatamente uma vez." },
        { title: "1–9 único por Bloco 3x3", desc: "Cada um dos nove quadrantes 3x3 deve receber 1 a 9 sem duplicatas." },
        { title: "Solução Única e Limite de Erros", desc: "Cada quebra-cabeça gerado tem solução única verificada. O Limite de Erros opcional (padrão 3 no Solo ou definido pelo anfitrião no Multiplayer) valida palpites incorretos." },
      ],
      coordinatesTitle: "Notação Padrão de Coordenadas (R1C1–R9C9)",
      coordinatesDesc: "Linhas vão de R1 a R9 e colunas de C1 a C9. Cada célula se conecta a até 20 células vizinhas.",
      difficultyScaleTitle: "Níveis de Dificuldade e Pistas no SudokuSync",
      difficultyRows: [
        { difficulty: "EASY", label: "Fácil", clues: "51 Pistas (30 vazias)", logicSummary: "Blocos equilibrados resolvidos apenas com Última Célula Livre e Simples." },
        { difficulty: "MEDIUM", label: "Médio", clues: "39 Pistas (42 vazias)", logicSummary: "Combina Simples Ocultos em linha/bloco e Simples Nus." },
        { difficulty: "HARD", label: "Difícil", clues: "30 Pistas (51 vazias)", logicSummary: "Escassez de dígitos exigindo Pares Apontados, Redução Bloco-Linha, Pares e Trios." },
        { difficulty: "EXPERT", label: "Expert", clues: "25 Pistas (56 vazias)", logicSummary: "Alta complexidade com X-Wing, Y-Wing, Swordfish e cadeias lógicas." },
      ],
    },
    notes: {
      heading: "2. Notas a Lápis e Atalhos de Teclado",
      intro: "Em vez de chutar números, ligue o modo Notas sempre que uma célula tiver mais de uma opção.",
      workflowTitle: "Fluxo Limpo com Notas",
      workflowSteps: [
        "Passo 1 — Preencha os Simples óbvios antes de criar notas.",
        "Passo 2 — Ative Notas a Lápis quando a varredura direta pausar.",
        "Passo 3 — Deixe Auto-Remover Notas ligado nas Configurações para limpar candidatos antigos automaticamente.",
        "Passo 4 — Revise linhas, colunas e blocos após cada eliminação.",
      ],
      shortcutsTitle: "Atalhos de Teclado Verificados no SudokuSync",
      shortcuts: [
        { keys: "1–9 / Numpad 1–9", action: "Inserir dígito ou nota (no Preenchimento Rápido trava/destrava o número ativo)." },
        { keys: "Backspace / Delete", action: "Apagar número digitado ou notas da célula selecionada." },
        { keys: "Spacebar / N", action: "Alternar entre Dígito Final e Notas sem rolar a tela." },
        { keys: "Ctrl + Z / Cmd + Z", action: "Desfazer jogadas e alterações de notas passo a passo." },
        { keys: "H", action: "Acionar uma Dica Lógica Inteligente quando travar." },
        { keys: "Setas / Tab / Esc", action: "Navegar pela grade 9x9, menus e fechar modais." },
      ],
    },
    strategies: {
      heading: "3. Técnicas Básicas e Intermediárias",
      intro: "Domine estas cinco técnicas para concluir Fácil, Médio e Difícil sem adivinhações.",
      items: [
        { id: "full-house", name: "Última Célula Livre (Full House)", levelBadge: "Iniciante", summary: "Com oito células preenchidas em uma unidade, a nona recebe obrigatoriamente o último dígito faltante.", howToSpot: "Procure linhas, colunas ou blocos com apenas 1 espaço vazio.", exampleNote: "Se na Linha 2 falta apenas o 5, R2C5=5." },
        { id: "scanning", name: "Varredura e Cruzamento", levelBadge: "Iniciante", summary: "Projete linhas e colunas ocupadas por um dígito através de um bloco 3x3.", howToSpot: "Observe faixas de três blocos onde um número já aparece duas vezes.", exampleNote: "Com 7 na Linha 1 e na Linha 3, no terceiro bloco só resta a Linha 2." },
        { id: "naked-hidden-singles", name: "Simples Nus e Simples Ocultos", levelBadge: "Básico–Médio", summary: "Um Simples Nu deixa apenas um candidato na célula; um Simples Oculto aparece em apenas uma célula de toda a unidade.", howToSpot: "Ative Destacar Área Relacionada para facilitar a leitura.", exampleNote: "R5C4={2,6,8}, mas o 8 não cabe em outro lugar da Coluna 4." },
        { id: "pairs-triples", name: "Pares Nus/Ocultos e Trios", levelBadge: "Médio–Difícil", summary: "Se duas células da mesma unidade compartilham exatamente {A, B}, remova A e B das demais células dessa unidade.", howToSpot: "Procure pares bivalor idênticos no mesmo bloco ou linha.", exampleNote: "R4C1={3,7} e R4C8={3,7} removem 3 e 7 de R4C5={3,7,9}, revelando 9." },
        { id: "pointing-box-line", name: "Pares Apontados e Redução Bloco-Linha", levelBadge: "Difícil", summary: "Quando um candidato em um bloco 3x3 fica restrito a uma única linha ou coluna, elimine-o do restante dessa linha fora do bloco.", howToSpot: "Verifique candidatos alinhados dentro de cada bloco.", exampleNote: "No Bloco 1, o 4 só cabe em R1C2 e R1C3 -> apague 4 de R1C5 a R1C9." },
      ],
    },
    advanced: {
      heading: "4. Padrões Avançados Expert",
      intro: "Em tabuleiros Expert de 25 pistas, estes três padrões destravam bloqueios difíceis.",
      items: [
        { id: "x-wing", name: "Estratégia X-Wing", levelBadge: "Expert Fish", summary: "Um número restrito às mesmas duas colunas em duas linhas forma um retângulo e é eliminado do resto dessas duas colunas.", howToSpot: "Busque alinhamentos 2x2 de um mesmo candidato.", exampleNote: "O 6 em R2 e R8 só existe em {C2,C7}; remova 6 do resto de C2 e C7." },
        { id: "y-wing", name: "Estratégia Y-Wing (XY-Wing)", levelBadge: "Expert Wing", summary: "Um pivô {X,Y} enxerga duas asas {X,Z} e {Y,Z}; qualquer célula que veja ambas as asas perde Z.", howToSpot: "Localize três células bivalor encadeadas.", exampleNote: "R3C3={2,5}, R3C9={2,9} e R7C3={5,9} removem o 9 da interseção." },
        { id: "swordfish", name: "Estratégia Swordfish", levelBadge: "Expert 3x3", summary: "Extensão de três linhas do X-Wing contida em três colunas em comum.", howToSpot: "Procure três linhas de um dígito limitadas a três colunas idênticas.", exampleNote: "O 3 em R1, R5 e R9 restrito a C3, C6, C8 é apagado do resto dessas colunas." },
      ],
    },
    assistants: {
      heading: "5. Guia dos Assistentes Inteligentes (Todos os 7)",
      intro: "Personalize todos os 7 recursos visuais e de velocidade em Configurações -> Assistentes Inteligentes.",
      items: [
        { id: "highlight-identical", name: "Destacar Números Idênticos", badge: "Ajuda Visual", description: "Realça todos os dígitos iguais no tabuleiro 9x9 ao selecionar uma célula.", whenToUse: "Ótimo para varreduras rápidas." },
        { id: "remaining-numbers", name: "Mostrar Números Restantes", badge: "Contador", description: "Mostra nos botões 1–9 quantas instâncias ainda faltam colocar.", whenToUse: "Ajuda a priorizar números quase completos." },
        { id: "highlight-area", name: "Destacar Área Relacionada", badge: "Foco de Unidade", description: "Destaca suavemente a linha, coluna e bloco 3x3 da célula ativa.", whenToUse: "Evita erros visuais de alinhamento." },
        { id: "auto-remove-notes", name: "Auto-Remover Notas", badge: "Higiene", description: "Limpa candidatos conflitantes nas unidades ligadas assim que um dígito final é colocado.", whenToUse: "Recomendado sempre no Desafio Diário e Multiplayer." },
        { id: "auto-notes", name: "Notas Automáticas", badge: "Apenas Difícil e Expert", description: "Preenche candidatos válidos automaticamente exclusivamente nos níveis Difícil e Expert.", whenToUse: "Excelente para treinar Pares, X-Wing e Y-Wing diretamente." },
        { id: "fast-fill", name: "Preenchimento Rápido (Número Primeiro)", badge: "Velocidade", description: "Trava um número no teclado para tocar várias células seguidas rapidamente.", whenToUse: "Ideal para corridas de tempo e teclado numérico." },
        { id: "auto-switch-completed", name: "Trocar Números Completos", badge: "Fluidez", description: "Avança automaticamente para o próximo dígito pendente quando todas as 9 cópias são colocadas.", whenToUse: "Reduz toques extras junto ao Preenchimento Rápido." },
      ],
    },
    contextualLinks: {
      beginnerCtaTemplate: "Quer testar regras e varreduras agora? Comece em {{easyLink}} (51 pistas) ou avance para {{mediumLink}} (39 pistas).",
      notesCtaTemplate: "Treine anotações em {{hardLink}} (30 pistas) ou confira tabuleiros de papel no {{solverLink}}.",
      strategiesCtaTemplate: "Aplique Simples, Pares e Linhas em {{hardLink}}, {{expertLink}} ou no {{dailyLink}} de hoje.",
      advancedCtaTemplate: "Encare 25 pistas em {{expertLink}} ou analise jogadas difíceis com o {{solverLink}}.",
      linkLabels: {
        easyLink: "Sudoku Fácil",
        mediumLink: "Sudoku Médio",
        hardLink: "Sudoku Difícil",
        expertLink: "Sudoku Expert",
        dailyLink: "Desafio Diário",
        solverLink: "Solucionador Grátis",
      },
    },
    faq: {
      heading: "6. Perguntas Frequentes (FAQ)",
      items: [
        { question: "Quantas pistas iniciais cada dificuldade oferece no SudokuSync?", answer: "Fácil com 51 pistas (30 vazias), Médio com 39 (42 vazias), Difícil com 30 (51 vazias) e Expert com 25 pistas (56 vazias)." },
        { question: "Por que Notas Automáticas funciona apenas em Difícil e Expert?", answer: "Fácil (51) e Médio (39) desenvolvem varredura básica; Difícil e Expert focam diretamente em pares, linhas e padrões avançados." },
        { question: "Multiplayer e Desafio Diário geram exatamente a mesma grade para todos?", answer: "Sim. Sementes determinísticas garantem o mesmo tabuleiro 9x9 para comparação justa de tempo e erros." },
        { question: "Como funciona o Limite de Erros?", answer: "No Solo o padrão é 3 erros (ajustável nas Configurações). No Multiplayer o anfitrião escolhe o limite ao criar a sala." },
        { question: "Posso resolver ou jogar um Sudoku 9x9 personalizado?", answer: "Sim. Abra o Solucionador de Sudoku, insira pelo menos 17 pistas válidas e escolha Resolver ou Jogar Puzzle." },
      ],
    },
  },
};

export function getRulesArticleCopy(lang: Language): RulesArticleLocaleContent {
  return RULES_ARTICLE_TRANSLATIONS[lang] || RULES_ARTICLE_TRANSLATIONS.en;
}

