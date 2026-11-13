export interface RichSegment {
  text: string;
  strong?: boolean;
}

export type RichText = readonly RichSegment[];

export interface TechniqueCardCopy {
  title: string;
  body: RichText;
}

export interface SolverFaqCopy {
  q: string;
  a: RichText;
}

export interface SolverKeyboardCardCopy {
  keys: string;
  title: string;
  desc: string;
}

export interface SolverArticleCopy {
  articleAriaLabel: string;
  overviewHeading: string;
  overviewP1: RichText;
  overviewP2: RichText;
  howToHeading: string;
  howToIntro: RichText;
  howToSteps: readonly RichText[];
  techniquesHeading: string;
  techniquesIntro: RichText;
  techniqueCards: readonly [
    TechniqueCardCopy,
    TechniqueCardCopy,
    TechniqueCardCopy,
    TechniqueCardCopy
  ];
  whyHeading: string;
  whyIntro: RichText;
  beginnersTitle: string;
  beginnersItems: readonly RichText[];
  expertsTitle: string;
  expertsItems: readonly RichText[];
  crossLinkPrefix: string;
  crossLinkLabel: string;
  crossLinkSuffix: string;
  crossLinkRulesPrefix: string;
  crossLinkRulesLabel: string;
  crossLinkRulesSuffix: string;
  keyboardHeading: string;
  keyboardIntro: RichText;
  keyboardCards: readonly [
    SolverKeyboardCardCopy,
    SolverKeyboardCardCopy,
    SolverKeyboardCardCopy,
    SolverKeyboardCardCopy
  ];
  faqHeading: string;
  faqs: readonly SolverFaqCopy[];
}

export type SolverArticleLocale =
  | "en"
  | "hi"
  | "de"
  | "ja"
  | "ko"
  | "es"
  | "fr"
  | "it"
  | "pt-BR";

export const SOLVER_ARTICLE_TRANSLATIONS: Record<
  SolverArticleLocale,
  SolverArticleCopy
> = {
  en: {
    articleAriaLabel: "Free Online Sudoku Solver and Logic Diagnostics",
    overviewHeading: "Free Online Sudoku Solver & Logic Diagnostics",
    overviewP1: [
      {
        text: "Stuck halfway through a morning newspaper puzzle or double-checking a brutal custom grid? The ",
      },
      { text: "SudokuSync Sudoku Solver", strong: true },
      {
        text: " turns any valid 9×9 board into an instant, interactive diagnostic workspace. Enter digits cleanly on mobile or desktop, verify uniqueness in milliseconds, and either reveal the completed board with ",
      },
      { text: "Auto-Solve", strong: true },
      { text: " or switch straight into " },
      { text: "Play Puzzle", strong: true },
      { text: " mode with full Pencil Notes and timer tracking." },
    ],
    overviewP2: [
      {
        text: "Unlike bare answer generators that dump numbers onto a screen with zero context, our underlying logic stack pairs fast deterministic bitmask verification with SudokuSync's human deduction engine—highlighting conflict cells before you lock your clues and estimating true board difficulty based on clue density and pattern complexity.",
      },
    ],
    howToHeading: "How to Use the Free Sudoku Solver",
    howToIntro: [
      {
        text: "You can recreate any printed book puzzle, magazine challenge, or shared screenshot grid manually in under thirty seconds. Manual entry prevents optical character recognition (OCR) misreads caused by blurry print or shadows, while giving you instant guardrails as you type:",
      },
    ],
    howToSteps: [
      [
        { text: "1. Enter Your Starting Clues:", strong: true },
        { text: " Tap any square on the 9×9 board and select digits " },
        { text: "1–9", strong: true },
        {
          text: " from the keypad. On desktop, navigate cells effortlessly with your ",
        },
        { text: "Arrow keys", strong: true },
        { text: " and enter or clear numbers using your keyboard." },
      ],
      [
        { text: "2. Watch Real-Time Conflict Validation:", strong: true },
        {
          text: " Every entry is validated immediately across its row, column, and 3×3 box. Duplicate numbers are highlighted in soft rose so you can fix newspaper typos before locking the grid.",
        },
      ],
      [
        {
          text: "3. Reach the 17-Clue Threshold & Difficulty Badge:",
          strong: true,
        },
        { text: " Mathematically, a classic 9×9 Sudoku needs at least " },
        { text: "17 clues", strong: true },
        {
          text: " to guarantee a single unique solution. As you type clues, the status bar classifies your grid live across ",
        },
        { text: "Easy (45+ clues)", strong: true },
        { text: ", " },
        { text: "Medium (35–44 clues)", strong: true },
        { text: ", " },
        { text: "Hard (28–34 clues)", strong: true },
        { text: ", and " },
        { text: "Expert (<28 clues)", strong: true },
        { text: "." },
      ],
      [
        { text: "4. Lock & Choose Your Path:", strong: true },
        { text: " Tap " },
        { text: "Lock & Play", strong: true },
        { text: " once all clues are valid. From the locked action deck, tap " },
        { text: "Auto-Solve", strong: true },
        {
          text: " to compute and highlight the solved cells—with automatic detection for unique vs. multiple solutions—or tap ",
        },
        { text: "Play Puzzle", strong: true },
        {
          text: " to continue solving the board yourself in Solo mode and archive it in ",
        },
        { text: "Custom History", strong: true },
        { text: "." },
      ],
    ],
    techniquesHeading: "Supported Logic & Pattern Architecture",
    techniquesIntro: [
      {
        text: "Our solver and puzzle-grading engine doesn't merely check whether numbers fit—it understands how real solvers think. Across SudokuSync's Hard and Expert logic tiers, the analyzer evaluates genuine elimination structures that bridge impossible-looking stalls and teach stronger deduction habits:",
      },
    ],
    techniqueCards: [
      {
        title: "0-Single Dead-Ends & Pair Pruning",
        body: [
          { text: "Tough grids deliberately create " },
          { text: "0-Single Dead-Ends", strong: true },
          {
            text: " where basic crosshatching reveals zero immediate placements. Breaking them requires spotting ",
          },
          { text: "Pointing Pairs", strong: true },
          { text: ", " },
          { text: "Naked Pairs", strong: true },
          { text: ", and " },
          { text: "Hidden Pairs", strong: true },
          {
            text: " to strip out rival candidates until fresh singles reopen.",
          },
        ],
      },
      {
        title: "Skyscraper & 2-String Kite",
        body: [
          { text: "Under " },
          { text: "Strict Digit Starvation", strong: true },
          {
            text: ", common numbers become scarce across boxes. Connecting two strong conjugate links via a ",
          },
          { text: "Skyscraper", strong: true },
          { text: " or intersecting row-column-box " },
          { text: "2-String Kite", strong: true },
          {
            text: " eliminates candidates visible to both chain endpoints without guessing.",
          },
        ],
      },
      {
        title: "X-Wing Rectangular Alignments",
        body: [
          {
            text: "When a single digit appears in strictly the same two columns across two separate rows (or vice versa), an ",
          },
          { text: "X-Wing", strong: true },
          {
            text: " forms a logical rectangle—safely clearing that candidate from every other cell along the two intersecting lines.",
          },
        ],
      },
      {
        title: "Y-Wing (XY-Wing) Pivots",
        body: [
          {
            text: "Built around three bi-value cells sharing paired candidates (AB, AC, and BC), a ",
          },
          { text: "Y-Wing", strong: true },
          {
            text: " acts as a pure logic hinge: whichever value the pivot holds, any square seeing both pincers can rule out digit C immediately.",
          },
        ],
      },
    ],
    whyHeading: "Why Use a Sudoku Solver?",
    whyIntro: [
      {
        text: "A dedicated solver isn't just for rescuing finished grids—it serves two distinct roles depending on where you are in your puzzle journey:",
      },
    ],
    beginnersTitle: "For Beginners Learning Patterns",
    beginnersItems: [
      [
        { text: "Catch Entry Mistakes Early:", strong: true },
        {
          text: " Spot subtle box or column duplicates instantly instead of discovering an unsolvable contradiction twenty minutes later.",
        },
      ],
      [
        { text: "Learn Without Spoilers:", strong: true },
        { text: " Use " },
        { text: "Play Puzzle", strong: true },
        {
          text: " to transfer printed grids onto a clean digital board with auto-notes and undo history.",
        },
      ],
    ],
    expertsTitle: "For Experts Auditing Tough Boards",
    expertsItems: [
      [
        { text: "Verify Uniqueness & Misprints:", strong: true },
        {
          text: " Confirm whether an ultra-sparse puzzle from a book or friend actually holds a single valid solution before committing time.",
        },
      ],
      [
        { text: "Audit Brutal Grids Quickly:", strong: true },
        {
          text: " Check your final deductions on 25-clue boards and keep personal custom puzzles organized inside local or cloud history.",
        },
      ],
    ],
    crossLinkPrefix:
      "Once you finish analyzing a tough board or practicing patterns here, put your deduction skills to the test on the ",
    crossLinkLabel: "Daily Sudoku Challenge",
    crossLinkSuffix:
      ". Every player worldwide receives the exact same deterministically seeded grid each day, letting you benchmark your solving speed across progressive Monday-to-Sunday difficulty tiers and build a competitive daily streak.",
    crossLinkRulesPrefix: "Want step-by-step visual diagrams for X-Wing, Y-Wing, Pointing Pairs, and our 7 built-in Smart Assistants? Browse the ",
    crossLinkRulesLabel: "Sudoku Rules & Strategies Hub",
    crossLinkRulesSuffix: ".",
    keyboardHeading: "Desktop Keyboard Workflow: Fast Clue Entry & Play Mode Controls",
    keyboardIntro: [
      {
        text: "Transcribe newspaper, book, or screenshot grids in seconds without lifting your hands off the keyboard. While entering givens in the Solver workspace, ",
      },
      { text: "Arrow keys, 1–9 / Numpad 1–9, and Backspace / Delete / 0", strong: true },
      {
        text: " keep entry rapid; switching to ",
      },
      { text: "Play Puzzle", strong: true },
      {
        text: " unlocks the complete six-shortcut gameplay suite (",
      },
      { text: "Spacebar / N", strong: true },
      { text: " for Notes, " },
      { text: "Ctrl + Z / Cmd + Z", strong: true },
      { text: " for Undo, and " },
      { text: "H", strong: true },
      { text: " for Hints)." },
    ],
    keyboardCards: [
      {
        keys: "1–9 / Numpad 1–9",
        title: "Rapid Clue & Answer Input",
        desc: "Use either top-row number keys or your dedicated Numpad to lock printed clues onto the 9×9 grid—or fill final answers once you switch into Play Puzzle.",
      },
      {
        keys: "Backspace / Delete / 0",
        title: "Instant Cell Clear",
        desc: "Pressed a wrong clue from a book puzzle? Hit Backspace, Delete, or 0 before tapping Lock & Play to clear any conflicting cell immediately.",
      },
      {
        keys: "Arrow Keys & Tab / Esc",
        title: "Zero-Mouse Grid Navigation",
        desc: "Glide smoothly across rows and columns with Up, Down, Left, and Right arrows, move between controls with Tab, and dismiss drawers cleanly via Esc.",
      },
      {
        keys: "Space / N • Ctrl/Cmd+Z • H",
        title: "Full Play Puzzle Shortcuts",
        desc: "After choosing Play Puzzle on your locked board, toggle Pencil Notes with Spacebar or N, step back with Ctrl/Cmd + Z, or inspect a Hint via H.",
      },
    ],
    faqHeading: "Sudoku Solver Frequently Asked Questions",
    faqs: [
      {
        q: "Can this solver crack brutal 25-clue Expert puzzles?",
        a: [
          {
            text: "Yes. Whether you enter a relaxing 50-clue newspaper warm-up or a starved 25-clue Expert board packed with ",
          },
          { text: "Skyscraper", strong: true },
          { text: ", " },
          { text: "2-String Kite", strong: true },
          { text: ", " },
          { text: "X-Wing", strong: true },
          { text: ", and " },
          { text: "Y-Wing", strong: true },
          {
            text: " bottlenecks, our bitmask solver resolves valid grids cleanly within milliseconds.",
          },
        ],
      },
      {
        q: "Is it a blind brute-force solver or a human-logic solver?",
        a: [
          { text: "SudokuSync combines both strengths intentionally. When you tap " },
          { text: "Auto-Solve", strong: true },
          { text: ", a deterministic " },
          { text: "Minimum Remaining Values (MRV) bitmask engine", strong: true },
          {
            text: " evaluates constraint propagation and counts up to two valid solutions so you always know if a puzzle is uniquely solvable or ambiguous. Meanwhile, our paired human-logic grader analyzes ",
          },
          { text: "0-Single Dead-Ends", strong: true },
          { text: ", " },
          { text: "Pointing Pairs", strong: true },
          { text: ", " },
          { text: "Naked/Hidden Pairs", strong: true },
          { text: ", and single-digit chains—and tapping " },
          { text: "Play Puzzle", strong: true },
          { text: " lets you practice those exact deductions interactively." },
        ],
      },
      {
        q: "Why must a puzzle have at least 17 starting clues before locking?",
        a: [
          { text: "By mathematical proof, " },
          { text: "17", strong: true },
          {
            text: " is the minimum number of clues a standard 9×9 Sudoku can contain while still preserving a single unique solution. Any grid with 16 or fewer clues guarantees multiple competing answers, so the Lock & Play gate keeps you from locking under-constrained boards by accident.",
          },
        ],
      },
      {
        q: "What happens if my puzzle is unsolvable or has multiple solutions?",
        a: [
          {
            text: "If an entered digit violates row, column, or 3×3 rules, real-time validation flags the conflict immediately. If there are no duplicate conflicts on the surface yet deep constraint propagation proves no completion exists, the solver alerts you with a clear banner so you can tap ",
          },
          { text: "Edit Clues", strong: true },
          {
            text: " and verify your transcription. Boards with more than one valid completion are clearly labeled as ",
          },
          { text: "Multiple Solutions", strong: true },
          { text: "." },
        ],
      },
    ],
  },

  hi: {
    articleAriaLabel: "फ्री ऑनलाइन सुडोकू सॉल्वर और लॉजिक डायग्नोस्टिक्स गाइड",
    overviewHeading: "फ्री ऑनलाइन सुडोकू सॉल्वर और लॉजिक डायग्नोस्टिक्स",
    overviewP1: [
      {
        text: "क्या आप सुबह के अख़बार की किसी पज़ल के बीच अटक गए हैं या अपने किसी टफ कस्टम ग्रिड को क्रॉस-चेक करना चाहते हैं? ",
      },
      { text: "SudokuSync सुडोकू सॉल्वर", strong: true },
      {
        text: " किसी भी वैलिड 9×9 बोर्ड को तुरंत एक स्मार्ट, इंटरैक्टिव डायग्नोस्टिक वर्कस्पेस में बदल देता है। मोबाइल या डेस्कटॉप पर क्लीन तरीके से नंबर भरें, मिलीसेकंड्स में यूनिक सॉल्यूशन चेक करें, और चाहें तो ",
      },
      { text: "Auto-Solve", strong: true },
      { text: " से पूरा हल देखें या सीधे " },
      { text: "Play Puzzle", strong: true },
      { text: " मोड में पेंसिल नोट्स और टाइमर के साथ खुद सॉल्व करें।" },
    ],
    overviewP2: [
      {
        text: "बाकी साधारण आंसर टूल सिर्फ नंबर भरकर दे देते हैं, लेकिन हमारा इंजन तेज़ बिटमास्क वेरिफिकेशन को SudokuSync के ह्यूमन-लॉजिक ग्रेडर के साथ जोड़ता है—ताकि क्ल्यूज़ लॉक करने से पहले ही डुप्लीकेट कन्फ्लिक्ट हाइलाइट हो जाएं और पैटर्न की गहराई के हिसाब से बोर्ड की असली कठिनाई तुरंत पता चले।",
      },
    ],
    howToHeading: "फ्री सुडोकू सॉल्वर कैसे इस्तेमाल करें",
    howToIntro: [
      {
        text: "आप किसी भी किताब, मैगज़ीन या स्क्रीनशॉट वाली पज़ल को 30 सेकंड के अंदर सीधे बोर्ड पर उतार सकते हैं। मैनुअल एंट्री से धुंधली फोटो या प्रिंट की परछाई से होने वाली OCR गड़बड़ियां नहीं होतीं और टाइप करते समय लाइव गार्डरेल्स साथ चलते हैं:",
      },
    ],
    howToSteps: [
      [
        { text: "1. शुरुआती क्ल्यूज़ दर्ज करें:", strong: true },
        { text: " 9×9 ग्रिड के किसी भी सेल पर टैप करें और कीपैड से " },
        { text: "1–9", strong: true },
        { text: " चुनें। डेस्कटॉप पर आप " },
        { text: "Arrow keys", strong: true },
        { text: " से सेल्स बदल सकते हैं और कीबोर्ड से ही नंबर टाइप या इरेज़ कर सकते हैं।" },
      ],
      [
        { text: "2. रियल-टाइम कन्फ्लिक्ट चेकिंग देखें:", strong: true },
        {
          text: " हर एंट्री तुरंत उसकी रो, कॉलम और 3×3 बॉक्स में चेक होती है। अगर कोई नंबर रिपीट होता है तो सेल सॉफ्ट रोज़ रंग में हाइलाइट हो जाता है, जिससे लॉक करने से पहले ही टाइपिंग की गलती पकड़ी जाती है।",
        },
      ],
      [
        { text: "3. 17-क्ल्यू लिमिट और लाइव डिफिकल्टी बैज:", strong: true },
        { text: " गणित के नियम से एक परफेक्ट 9×9 सुडोकू में सिंगल यूनिक सॉल्यूशन के लिए कम से कम " },
        { text: "17 क्ल्यूज़", strong: true },
        {
          text: " होना ज़रूरी है। जैसे-जैसे आप नंबर डालते हैं, स्टेटस बार ग्रिड को लाइव ",
        },
        { text: "Easy (45+ क्ल्यूज़)", strong: true },
        { text: ", " },
        { text: "Medium (35–44 क्ल्यूज़)", strong: true },
        { text: ", " },
        { text: "Hard (28–34 क्ल्यूज़)", strong: true },
        { text: " और " },
        { text: "Expert (<28 क्ल्यूज़)", strong: true },
        { text: " में कैटेगराइज़ करता है।" },
      ],
      [
        { text: "4. लॉक करें और अपना मोड चुनें:", strong: true },
        { text: " सारे क्ल्यूज़ सही होने पर " },
        { text: "Lock & Play", strong: true },
        { text: " पर टैप करें। लॉक डेक खुलने पर " },
        { text: "Auto-Solve", strong: true },
        {
          text: " दबाकर तुरंत पूरा हल और यूनिक बनाम मल्टीपल सॉल्यूशन स्टेटस देखें—या खुद प्रैक्टिस करने के लिए ",
        },
        { text: "Play Puzzle", strong: true },
        { text: " दबाकर सोलो बोर्ड खेलें और उसे " },
        { text: "Custom History", strong: true },
        { text: " में सेव करें।" },
      ],
    ],
    techniquesHeading: "सपोर्टेड एडवांस्ड लॉजिक और पैटर्न आर्किटेक्चर",
    techniquesIntro: [
      {
        text: "हमारा सॉल्वर और ग्रेडिंग इंजन सिर्फ यह नहीं देखता कि नंबर फिट हो रहा है या नहीं—यह बिल्कुल एक अनुभवी प्लेयर की तरह सोचता है। SudokuSync के Hard और Expert लेवल्स में इंजन उन असली एलिमिनेशन पैटर्न्स को पहचानता है जो अटके हुए बोर्ड खोलते हैं:",
      },
    ],
    techniqueCards: [
      {
        title: "0-Single डेड-एंड्स और पेयर प्रूनिंग",
        body: [
          { text: "टफ ग्रिड्स में जानबूझकर ऐसे " },
          { text: "0-Single डेड-एंड्स", strong: true },
          {
            text: " बनाए जाते हैं जहाँ सिंपल स्कैनिंग से एक भी सीधा नंबर नहीं मिलता। इन्हें ब्रेक करने के लिए ",
          },
          { text: "Pointing Pairs", strong: true },
          { text: ", " },
          { text: "Naked Pairs", strong: true },
          { text: " और " },
          { text: "Hidden Pairs", strong: true },
          {
            text: " की मदद से फालतू कैंडिडेट्स हटाने पड़ते हैं, ताकि नए सिंगल्स खुल सकें।",
          },
        ],
      },
      {
        title: "Skyscraper और 2-String Kite",
        body: [
          { text: "जब ग्रिड में " },
          { text: "Strict Digit Starvation", strong: true },
          {
            text: " लागू होता है, तो आसान अंक बॉक्सेस में बहुत कम रह जाते हैं। ऐसे में ",
          },
          { text: "Skyscraper", strong: true },
          { text: " या रो-कॉलम-बॉक्स को जोड़ने वाली " },
          { text: "2-String Kite", strong: true },
          {
            text: " चेन दो स्ट्रॉन्ग कॉन्जुगेट लिंक्स को जोड़कर बिना तुक्का लगाए दोनों सिरों से दिखने वाले सेल्स के कैंडिडेट्स काट देती है।",
          },
        ],
      },
      {
        title: "X-Wing रेक्टैंगुलर अलाइनमेंट",
        body: [
          {
            text: "जब कोई एक अंक ठीक दो अलग रोज़ के बिल्कुल एक जैसे दो कॉलम्स में (या इसके उलट) लॉक हो जाए, तो एक ",
          },
          { text: "X-Wing", strong: true },
          {
            text: " रेक्टैंगल बनता है—जिससे उन दोनों क्रॉसिंग लाइन्स की बाकी हर सेल से वह नंबर सेफली एलिमिनेट हो जाता है।",
          },
        ],
      },
      {
        title: "Y-Wing (XY-Wing) पिवट्स",
        body: [
          {
            text: "जब तीन बाई-वैल्यू सेल्स आपस में जुड़े पेयर्स (AB, AC और BC) बनाती हैं, तो ",
          },
          { text: "Y-Wing", strong: true },
          {
            text: " एक लॉजिकल हिंज की तरह काम करती है: पिवट सेल में कोई भी वैल्यू आए, दोनों पिनसर सेल्स को देखने वाले किसी भी खाने से अंक C पक्का बाहर हो जाता है।",
          },
        ],
      },
    ],
    whyHeading: "सुडोकू सॉल्वर क्यों इस्तेमाल करें?",
    whyIntro: [
      {
        text: "एक अच्छा सॉल्वर सिर्फ फंसी हुई पज़ल का जवाब देखने के लिए नहीं होता—यह आपकी स्किल के हिसाब से दो अलग तरीकों से मदद करता है:",
      },
    ],
    beginnersTitle: "पैटर्न सीखने वाले बिगिनर्स के लिए",
    beginnersItems: [
      [
        { text: "एंट्री की गलतियां शुरू में ही पकड़ें:", strong: true },
        {
          text: " 20 मिनट बाद बोर्ड अटकने के बजाय टाइप करते वक्त ही रो या बॉक्स के डुप्लीकेट नंबर तुरंत सुधार लें।",
        },
      ],
      [
        { text: "बिना स्पॉइलर के प्रैक्टिस करें:", strong: true },
        { text: " " },
        { text: "Play Puzzle", strong: true },
        {
          text: " फीचर से अख़बार की पज़ल को ऑटो-नोट्स और अनडू हिस्ट्री वाले क्लीन डिजिटल बोर्ड पर खेलें।",
        },
      ],
    ],
    expertsTitle: "टफ बोर्ड्स ऑडिट करने वाले एक्सपर्ट्स के लिए",
    expertsItems: [
      [
        { text: "यूनिकनेस और मिसप्रिंट चेक करें:", strong: true },
        {
          text: " किसी किताब या दोस्त की दी हुई कम क्ल्यूज़ वाली पज़ल पर समय लगाने से पहले कन्फर्म करें कि उसका सिर्फ एक ही सही हल है।",
        },
      ],
      [
        { text: "25-क्ल्यू ग्रिड्स जल्दी वेरिफाई करें:", strong: true },
        {
          text: " ब्रूटल एक्सपर्ट बोर्ड्स पर अपने फाइनल डिडक्शन्स क्रॉस-चेक करें और अपनी कस्टम पज़ल्स को लोकल या क्लाउड हिस्ट्री में संभालकर रखें।",
        },
      ],
    ],
    crossLinkPrefix:
      "जब आप यहां किसी टफ बोर्ड का ऑडिट या एडवांस्ड पैटर्न्स की प्रैक्टिस पूरी कर लें, तो अपने लॉजिक का असली टेस्ट ",
    crossLinkLabel: "Daily Sudoku Challenge",
    crossLinkSuffix:
      " पर जरूर आज़माएं। हर दिन दुनियाभर के सभी खिलाड़ियों को बिल्कुल एक जैसा डिटरमिनिस्टिक बोर्ड मिलता है—जहाँ आप सोमवार से रविवार तक के लेवल स्केलिंग में अपनी स्पीड जांच सकते हैं और कॉम्पिटिटिव डेली स्ट्रीक बना सकते हैं।",
    crossLinkRulesPrefix: "अगर आप X-Wing, Y-Wing, Pointing Pairs के SVG डायग्राम और हमारे 7 Smart Assistants (जैसे Auto-Notes व Fast Fill) को विस्तार से समझना चाहते हैं, तो ",
    crossLinkRulesLabel: "Sudoku नियम और रणनीतियाँ (Rules Hub)",
    crossLinkRulesSuffix: " ज़रूर पढ़ें।",
    keyboardHeading: "डेस्कटॉप कीबोर्ड वर्कफ़्लो: फ़ास्ट क्लू एंट्री और प्ले मोड कंट्रोल्स",
    keyboardIntro: [
      {
        text: "कीबोर्ड से हाथ हटाए बिना अख़बार या किताब का कोई भी ग्रिड सेकंडों में टाइप करें। सॉल्वर सेटअप बोर्ड पर ",
      },
      { text: "Arrow keys, 1–9 / Numpad 1–9 और Backspace / Delete / 0", strong: true },
      { text: " से क्ल्यूज़ तुरंत भरें, और जैसे ही आप " },
      { text: "Play Puzzle", strong: true },
      { text: " पर स्विच करते हैं, पूरा 6-शॉर्टकट गेमप्ले सेट (" },
      { text: "Spacebar / N", strong: true },
      { text: " पेंसिल नोट्स, " },
      { text: "Ctrl + Z / Cmd + Z", strong: true },
      { text: " अनडू, और " },
      { text: "H", strong: true },
      { text: " हिंट) एक्टिव हो जाता है।" },
    ],
    keyboardCards: [
      {
        keys: "1–9 / Numpad 1–9",
        title: "फ़ास्ट क्लू और नंबर एंट्री",
        desc: "चाहे टॉप-रो नंबर्स दबाएं या डेडिकेटेड Numpad—सॉल्वर ग्रिड में प्रिंटेड क्ल्यूज़ तुरंत एंटर करें या Play Puzzle मोड में फाइनल डिजिट्स लॉक करें।",
      },
      {
        keys: "Backspace / Delete / 0",
        title: "गलत सेल तुरंत साफ़ करें",
        desc: "प्रिंटेड पज़ल उतारते वक्त गलती हो जाए तो Lock & Play दबाने से पहले Backspace, Delete या 0 दबाकर कन्फ्लिक्ट सेल को फ़ौरन खाली करें।",
      },
      {
        keys: "Arrow Keys • Tab / Esc",
        title: "बिना माउस ग्रिड और मेन्यू नेविगेशन",
        desc: "Up, Down, Left और Right एरो कीज़ से 9×9 ग्रिड पर तेज़ी से मूव करें, Tab से साफ़ फ़ोकस रिंग के साथ बटन्स बदलें और Esc से ड्रॉअर बंद करें।",
      },
      {
        keys: "Space / N • Ctrl/Cmd+Z • H",
        title: "Play Puzzle के पूरे शॉर्टकट्स",
        desc: "बोर्ड लॉक करके Play Puzzle चुनने के बाद Spacebar या N से Pencil Notes ऑन-ऑफ़ करें, Ctrl/Cmd + Z से अनडू करें और H से लॉजिकल हिंट पाएं।",
      },
    ],
    faqHeading: "सुडोकू सॉल्वर से जुड़े आम सवाल (FAQs)",
    faqs: [
      {
        q: "क्या यह सॉल्वर 25 क्ल्यूज़ वाली ब्रूटल Expert पज़ल्स हल कर सकता है?",
        a: [
          {
            text: "हाँ, बिल्कुल। चाहे आप 50 क्ल्यूज़ वाला आसान अख़बारी वॉर्म-अप डालें या ",
          },
          { text: "Skyscraper", strong: true },
          { text: ", " },
          { text: "2-String Kite", strong: true },
          { text: ", " },
          { text: "X-Wing", strong: true },
          { text: " और " },
          { text: "Y-Wing", strong: true },
          {
            text: " जैसे बॉटलनेक्स से भरा 25-क्ल्यू Expert ग्रिड, हमारा बिटमास्क सॉल्वर मिलीसेकंड्स में सही हल निकाल देता है।",
          },
        ],
      },
      {
        q: "क्या यह सिर्फ अंधा ब्रूट-फोर्स टूल है या ह्यूमन-लॉजिक पर काम करता है?",
        a: [
          { text: "SudokuSync दोनों ताकतों को स्मार्टली मिलाता है। जब आप " },
          { text: "Auto-Solve", strong: true },
          { text: " दबाते हैं, तो डिटरमिनिस्टिक " },
          { text: "MRV बिटमास्क इंजन", strong: true },
          {
            text: " तुरंत कंस्ट्रेंट चेक करके दो संभावित हल तक गिनता है ताकि पता चले कि पज़ल यूनिक है या नहीं। साथ ही हमारा ह्यूमन-लॉजिक ग्रेडर ",
          },
          { text: "0-Single डेड-एंड्स", strong: true },
          { text: ", " },
          { text: "Pointing Pairs", strong: true },
          { text: " और " },
          { text: "Naked/Hidden Pairs", strong: true },
          { text: " को एनालाइज़ करता है—जिन्हें आप " },
          { text: "Play Puzzle", strong: true },
          { text: " दबाकर खुद इंटरैक्टिव तरीके से प्रैक्टिस कर सकते हैं।" },
        ],
      },
      {
        q: "लॉक करने से पहले पज़ल में कम से कम 17 क्ल्यूज़ क्यों ज़रूरी हैं?",
        a: [
          { text: "गणितीय प्रमाण के मुताबिक, एक स्टैंडर्ड 9×9 सुडोकू में सिर्फ एक यूनिक सॉल्यूशन रखने के लिए न्यूनतम " },
          { text: "17 क्ल्यूज़", strong: true },
          {
            text: " होना अनिवार्य है। 16 या उससे कम क्ल्यूज़ वाले बोर्ड के हमेशा कई अलग-अलग हल निकलते हैं, इसलिए हमारा लॉक गेट गलती से अधूरे बोर्ड लॉक होने से बचाता है।",
          },
        ],
      },
      {
        q: "अगर मेरी पज़ल सॉल्व न हो या उसके कई हल निकलें तो क्या होता है?",
        a: [
          {
            text: "अगर कोई नंबर रो, कॉलम या 3×3 बॉक्स का नियम तोड़ता है, तो लाइव वैलिडेशन तुरंत उसे लाल/रोज़ रंग में दिखा देता है। और अगर ऊपर से कोई डुप्लीकेट न दिखे लेकिन गहराई में कोई हल संभव न हो, तो सॉल्वर साफ बैनर दिखाता है ताकि आप ",
          },
          { text: "Edit Clues", strong: true },
          {
            text: " से अपने क्ल्यूज़ दोबारा जांच सकें। एक से ज़्यादा वैलिड हल होने पर बोर्ड साफ तौर पर ",
          },
          { text: "Multiple Solutions", strong: true },
          { text: " लेबल के साथ दिखता है।" },
        ],
      },
    ],
  },

  de: {
    articleAriaLabel: "Kostenloser Online-Sudoku-Löser & Logik-Diagnose",
    overviewHeading: "Kostenloser Online-Sudoku-Löser & Logik-Diagnose",
    overviewP1: [
      {
        text: "Steckst du mitten in einem Zeitungsrätsel fest oder willst du ein anspruchsvolles eigenes 9×9-Gitter prüfen? Der ",
      },
      { text: "SudokuSync Sudoku-Löser", strong: true },
      {
        text: " verwandelt jedes gültige Gitter in eine interaktive Diagnosefläche. Gib Vorgaben sauber auf Handy oder Desktop ein, prüfe die Eindeutigkeit in Millisekunden und zeige entweder die komplette Lösung per ",
      },
      { text: "Auto-Lösen", strong: true },
      { text: " an oder wechsle direkt in " },
      { text: "Puzzle spielen", strong: true },
      { text: " mit Kandidaten-Notizen und Timer." },
    ],
    overviewP2: [
      {
        text: "Anders als einfache Ergebnis-Generatoren, die Ziffern ohne Erklärung ausgeben, kombiniert unsere Logik-Engine ultraschnelle Bitmask-Verifizierung mit SudokuSyncs Human-Logic-Bewerter: Konflikte werden vor dem Fixieren sofort markiert und die echte Schwierigkeit anhand der Vorgabendichte und Techniktiefe eingeschätzt.",
      },
    ],
    howToHeading: "So nutzt du den kostenlosen Sudoku-Löser",
    howToIntro: [
      {
        text: "Jedes Rätsel aus Zeitung, Buch oder einem geteilten Screenshot lässt sich in unter 30 Sekunden sauber übertragen. Die direkte Eingabe vermeidet typische OCR-Lesefehler durch unscharfe Fotos oder Schatten und prüft jeden Schritt live:",
      },
    ],
    howToSteps: [
      [
        { text: "1. Startvorgaben eintragen:", strong: true },
        { text: " Tippe auf ein beliebiges Feld des 9×9-Rasters und wähle ", },
        { text: "1–9", strong: true },
        { text: ". Am PC navigierst du bequem mit den " },
        { text: "Pfeiltasten", strong: true },
        { text: " und gibst Zahlen direkt per Tastatur ein." },
      ],
      [
        { text: "2. Echtzeit-Konfliktprüfung beobachten:", strong: true },
        {
          text: " Jede Ziffer wird sofort in Zeile, Spalte und 3×3-Block validiert. Doppelte Zahlen erscheinen zartrosa, damit Tippfehler aus der Vorlage noch vor dem Fixieren auffallen.",
        },
      ],
      [
        {
          text: "3. 17-Vorgaben-Grenze & Live-Schwierigkeitsgrad:",
          strong: true,
        },
        { text: " Mathematisch benötigt ein klassisches 9×9-Sudoku mindestens " },
        { text: "17 Vorgaben", strong: true },
        {
          text: " für eine eindeutige Lösung. Während der Eingabe stuft die Statusleiste dein Brett automatisch in ",
        },
        { text: "Leicht (45+ Vorgaben)", strong: true },
        { text: ", " },
        { text: "Mittel (35–44 Vorgaben)", strong: true },
        { text: ", " },
        { text: "Schwer (28–34 Vorgaben)", strong: true },
        { text: " und " },
        { text: "Experte (<28 Vorgaben)", strong: true },
        { text: " ein." },
      ],
      [
        { text: "4. Fixieren & Modus wählen:", strong: true },
        { text: " Tippe auf " },
        { text: "Fixieren & Spielen", strong: true },
        { text: ", sobald alle Vorgaben stimmen. Danach kannst du über " },
        { text: "Auto-Lösen", strong: true },
        {
          text: " die Lösung berechnen und eindeutige bzw. mehrdeutige Bretter erkennen—oder mit ",
        },
        { text: "Puzzle spielen", strong: true },
        {
          text: " selbst im Solo-Modus weiterspielen und das Brett im ",
        },
        { text: "Eigenen Verlauf", strong: true },
        { text: " sichern." },
      ],
    ],
    techniquesHeading: "Unterstützte Logik & Muster-Architektur",
    techniquesIntro: [
      {
        text: "Unsere Diagnose-Engine prüft nicht nur blind auf Regelkonformität, sondern bildet menschliche Deduktionsketten ab. In den Stufen Schwer und Experte bewertet sie gezielt jene fortgeschrittenen Muster, an denen reines Scannen scheitert:",
      },
    ],
    techniqueCards: [
      {
        title: "0-Single-Sackgassen & Paar-Elimination",
        body: [
          { text: "Anspruchsvolle Bretter erzeugen gezielt " },
          { text: "0-Single-Sackgassen", strong: true },
          {
            text: ", in denen Cross-Hatching keinen direkten Treffer liefert. Erst ",
          },
          { text: "Pointing Pairs", strong: true },
          { text: ", " },
          { text: "Naked Pairs", strong: true },
          { text: " und " },
          { text: "Hidden Pairs", strong: true },
          {
            text: " lichten die Kandidaten, bis wieder neue Singles frei werden.",
          },
        ],
      },
      {
        title: "Skyscraper & 2-String Kite",
        body: [
          { text: "Unter " },
          { text: "Strict Digit Starvation", strong: true },
          {
            text: " bleiben Schlüsselfelder rar. Verbindet man zwei starke Konjugatpaare per ",
          },
          { text: "Skyscraper", strong: true },
          { text: " oder über Zeile-Spalte-Block als " },
          { text: "2-String Kite", strong: true },
          {
            text: ", fallen gemeinsame Kandidaten an beiden Kettenenden ohne Raten weg.",
          },
        ],
      },
      {
        title: "X-Wing-Rechtecke",
        body: [
          {
            text: "Taucht ein Kandidat in zwei Zeilen exakt in denselben zwei Spalten auf (oder umgekehrt), entsteht ein ",
          },
          { text: "X-Wing", strong: true },
          {
            text: "—alle übrigen Vorkommen dieser Ziffer entlang der beiden gekreuzten Linien lassen sich sicher streichen.",
          },
        ],
      },
      {
        title: "Y-Wing (XY-Wing)-Scharniere",
        body: [
          {
            text: "Drei Zweikandidaten-Felder mit den Kombinationen AB, AC und BC bilden ein ",
          },
          { text: "Y-Wing", strong: true },
          {
            text: ": Egal ob der Angelpunkt A oder B annimmt, jedes Feld im Sichtbereich beider Flügel schließt Ziffer C zuverlässig aus.",
          },
        ],
      },
    ],
    whyHeading: "Warum einen Sudoku-Löser verwenden?",
    whyIntro: [
      {
        text: "Ein präziser Sudoku-Löser ist weit mehr als eine Notlösung für festgefahrene Runden—er erfüllt je nach Spielniveau zwei klare Aufgaben:",
      },
    ],
    beginnersTitle: "Für Einsteiger zum Technik-Training",
    beginnersItems: [
      [
        { text: "Eingabefehler sofort bemerken:", strong: true },
        {
          text: " Erkenne doppelte Zahlen in Blöcken oder Spalten direkt beim Abtippen, statt zwanzig Minuten später auf einen Widerspruch zu stoßen.",
        },
      ],
      [
        { text: "Ohne Spoiler weiterlernen:", strong: true },
        { text: " Übertrage gedruckte Rätsel per " },
        { text: "Puzzle spielen", strong: true },
        {
          text: " auf ein sauberes digitales Brett inklusive automatischer Notizen und Rückgängig-Funktion.",
        },
      ],
    ],
    expertsTitle: "Für Profis zur Brett-Analyse",
    expertsItems: [
      [
        { text: "Eindeutigkeit & Druckfehler prüfen:", strong: true },
        {
          text: " Teste vorab, ob ein extremes 25-Vorgaben-Rätsel wirklich genau eine gültige Lösung besitzt.",
        },
      ],
      [
        { text: "Komplexe Ketten schnell verifizieren:", strong: true },
        {
          text: " Kontrolliere deine finalen Reduktionen und archiviere eigene Rätsel sauber im lokalen oder Cloud-Verlauf.",
        },
      ],
    ],
    crossLinkPrefix:
      "Sobald du hier Muster geübt oder ein kniffliges Gitter analysiert hast, miss dein Können im ",
    crossLinkLabel: "Tages-Rätsel (Daily Challenge)",
    crossLinkSuffix:
      ". Weltweit erhalten alle Spieler jeden Tag exakt dasselbe deterministisch erzeugte Gitter—ideal, um deine Lösungszeit von Montag bis Sonntag zu vergleichen und eine echte Serie aufzubauen.",
    crossLinkRulesPrefix: "Möchtest du visuelle Schritt-für-Schritt-Diagramme für X-Wing, Y-Wing, Pointing Pairs und unsere 7 Smart-Assistenten? Öffne den ",
    crossLinkRulesLabel: "Sudoku-Regel- & Strategieführer",
    crossLinkRulesSuffix: ".",
    keyboardHeading: "Desktop-Tastatur-Workflow: Schnelle Vorgaben-Eingabe & Spielkürzel",
    keyboardIntro: [
      {
        text: "Übertragen Sie Zeitungs- oder Buchrätsel in Sekunden, ohne die Hände von der Tastatur zu nehmen. Im Eingabemodus des Lösers sorgen ",
      },
      { text: "Pfeiltasten, 1–9 / Ziffernblock 1–9 sowie Backspace / Entf / 0", strong: true },
      { text: " für höchstes Tempo; mit einem Klick auf " },
      { text: "Play Puzzle", strong: true },
      { text: " stehen zusätzlich alle Spielkürzel (" },
      { text: "Leertaste / N", strong: true },
      { text: " für Notizen, " },
      { text: "Strg + Z / Cmd + Z", strong: true },
      { text: " zum Rückgängigmachen und " },
      { text: "H", strong: true },
      { text: " für Hinweise) bereit." },
    ],
    keyboardCards: [
      {
        keys: "1–9 / Numpad 1–9",
        title: "Vorgaben & Ziffern eingeben",
        desc: "Nutzen Sie wahlweise die obere Zahlenreihe oder den separaten Ziffernblock, um gegebene Zahlen blitzschnell ins 9×9-Gitter zu übernehmen.",
      },
      {
        keys: "Backspace / Entf / 0",
        title: "Feld sofort leeren",
        desc: "Tippfehler beim Abtippen aus dem Heft? Backspace, Entfernen oder 0 löscht das markierte Feld noch vor „Lock & Play“ ohne Umweg.",
      },
      {
        keys: "Pfeile • Tab / Esc",
        title: "Navigation ohne Maus",
        desc: "Springen Sie per Pfeiltasten direkt von Feld zu Feld, steuern Sie Schaltflächen mit Tab samt klarer Fokus-Umrandung und schließen Sie Menüs mit Esc.",
      },
      {
        keys: "Space / N • Strg/Cmd+Z • H",
        title: "Alle Spielkürzel im Play-Modus",
        desc: "Sobald Sie nach dem Sperren „Play Puzzle“ starten, schalten Leertaste oder N Kandidaten-Notizen um, Strg/Cmd + Z macht Züge rückgängig und H zeigt einen Hinweis.",
      },
    ],
    faqHeading: "Häufige Fragen zum Sudoku-Löser",
    faqs: [
      {
        q: "Löst der Rechner auch extreme Experten-Rätsel mit nur 25 Vorgaben?",
        a: [
          {
            text: "Ja. Ob entspanntes 50-Vorgaben-Rätsel oder stark verknapptes 25-Vorgaben-Expertenbrett mit ",
          },
          { text: "Skyscraper", strong: true },
          { text: ", " },
          { text: "2-String Kite", strong: true },
          { text: ", " },
          { text: "X-Wing", strong: true },
          { text: " und " },
          { text: "Y-Wing", strong: true },
          {
            text: "—die Bitmask-Engine berechnet gültige Lösungen in wenigen Millisekunden.",
          },
        ],
      },
      {
        q: "Arbeitet das Tool mit blindem Ausprobieren oder echter Logik?",
        a: [
          { text: "SudokuSync verbindet beides bewusst. Mit " },
          { text: "Auto-Lösen", strong: true },
          { text: " prüft eine deterministische " },
          { text: "MRV-Bitmask-Engine", strong: true },
          {
            text: " die Einschränkungen und zählt bis zu zwei gültige Lösungen, um Eindeutigkeit zu garantieren. Gleichzeitig bewertet unser Human-Logic-Grader ",
          },
          { text: "0-Single-Sackgassen", strong: true },
          { text: ", " },
          { text: "Pointing Pairs", strong: true },
          { text: " und " },
          { text: "Naked/Hidden Pairs", strong: true },
          { text: "—und mit " },
          { text: "Puzzle spielen", strong: true },
          { text: " kannst du genau diese Schritte selbst durchdenken." },
        ],
      },
      {
        q: "Warum sind vor dem Fixieren mindestens 17 Vorgaben Pflicht?",
        a: [
          { text: "Mathematisch bewiesen sind " },
          { text: "17 Vorgaben", strong: true },
          {
            text: " das absolute Minimum für ein standardmäßiges 9×9-Sudoku mit genau einer Lösung. Mit 16 oder weniger Ziffern entstehen zwangsläufig mehrere Lösungen—die 17-Vorgaben-Sperre verhindert versehentliche unbestimmte Bretter.",
          },
        ],
      },
      {
        q: "Was passiert bei unlösbaren Gittern oder mehreren Lösungen?",
        a: [
          {
            text: "Direkte Regelverstöße in Zeile, Spalte oder 3×3-Block markiert die Live-Prüfung sofort. Zeigt erst die Tiefensuche einen Widerspruch, erscheint ein deutlicher Hinweis für ",
          },
          { text: "Vorgaben ändern", strong: true },
          {
            text: ". Bretter mit mehr als einer gültigen Vervollständigung werden klar als ",
          },
          { text: "Mehrere Lösungen", strong: true },
          { text: " gekennzeichnet." },
        ],
      },
    ],
  },

  ja: {
    articleAriaLabel: "無料オンライン数独（ナンプレ）ソルバー＆ロジック診断ガイド",
    overviewHeading: "無料オンライン数独（ナンプレ）ソルバー＆ロジック診断",
    overviewP1: [
      {
        text: "新聞や雑誌の数独（ナンプレ）で手が止まったり、手元の超難問に唯一解があるか確認したくなったりしていませんか？ ",
      },
      { text: "SudokuSync 数独ソルバー", strong: true },
      {
        text: "は、有効な9×9盤面をその場でインタラクティブな解析ワークスペースへ変換します。スマホでもPCでも数字を素早く入力でき、数ミリ秒で唯一解を検証。",
      },
      { text: "自動解答", strong: true },
      { text: "で答えを確認することも、そのまま " },
      { text: "パズルをプレイ", strong: true },
      { text: " へ切り替えてメモ機能・タイマー付きで自力攻略することも可能です。" },
    ],
    overviewP2: [
      {
        text: "数字だけを無味乾燥に表示する一般的な解答ツールとは異なり、高速なビットマスク検証とSudokuSync独自の人間ロジック評価エンジンを連携。確定前に重複ミスをリアルタイムで警告し、初期配置数と手筋の難しさから正確な難易度を見積もります。",
      },
    ],
    howToHeading: "無料数独ソルバーの使い方",
    howToIntro: [
      {
        text: "紙のパズル本や雑誌の問題、友人から送られたスクリーンショットも30秒以内に手入力できます。かすれ文字や影で誤読しやすいカメラOCRに頼らず、入力と同時にルール違反を防げます。",
      },
    ],
    howToSteps: [
      [
        { text: "1. 初期配置（ヒント）を入力：", strong: true },
        { text: " 9×9のマスを選んでキーパッドから ", },
        { text: "1〜9", strong: true },
        { text: " を入力します。PCでは " },
        { text: "矢印キー", strong: true },
        { text: " によるマス移動とキーボード入力に対応しています。" },
      ],
      [
        { text: "2. リアルタイム重複チェック：", strong: true },
        {
          text: " 行・列・3×3ブロックのルールを即座に判定します。同じ数字が重なると淡いローズ色でハイライトされるため、転記ミスをロック前に修正できます。",
        },
      ],
      [
        { text: "3. 17個の最小ヒント数とライブ難易度判定：", strong: true },
        { text: " 数学的に標準9×9数独が唯一解を持つには最低 " },
        { text: "17個のヒント", strong: true },
        {
          text: " が必要です。入力に応じて上部のステータスが ",
        },
        { text: "かんたん (45個以上)", strong: true },
        { text: "・" },
        { text: "ふつう (35〜44個)", strong: true },
        { text: "・" },
        { text: "むずかしい (28〜34個)", strong: true },
        { text: "・" },
        { text: "エキスパート (28個未満)", strong: true },
        { text: " に自動分類されます。" },
      ],
      [
        { text: "4. 確定して次のアクションを選択：", strong: true },
        { text: " 有効な配置が揃ったら " },
        { text: "確定してプレイ", strong: true },
        { text: " をタップ。確定後は " },
        { text: "自動解答", strong: true },
        {
          text: " で唯一解／複数解の判定と解答を表示するか、",
        },
        { text: "パズルをプレイ", strong: true },
        {
          text: " でソロ挑戦して結果を ",
        },
        { text: "カスタム履歴", strong: true },
        { text: " に記録できます。" },
      ],
    ],
    techniquesHeading: "対応ロジックと高度パターン解析",
    techniquesIntro: [
      {
        text: "SudokuSyncのエンジンは単に埋まるかどうかを調べるだけでなく、人間が実際に使う論理手筋を基準に盤面を解析します。「むずかしい」「エキスパート」では以下の高度な消去法が評価対象になります。",
      },
    ],
    techniqueCards: [
      {
        title: "0-Single停滞 ＆ ペア消去法",
        body: [
          { text: "高難度盤面では単純なスキャンが完全に止まる " },
          { text: "0-Single停滞", strong: true },
          {
            text: " が意図的に作られます。突破するには ",
          },
          { text: "ポインティングペア（ライン・ブロック制限）", strong: true },
          { text: "、" },
          { text: "ネイキッドペア（2国同盟）", strong: true },
          { text: "、" },
          { text: "ヒドゥンペア（隠れ2国同盟）", strong: true },
          {
            text: " で候補を削り、次のシングルを開く必要があります。",
          },
        ],
      },
      {
        title: "Skyscraper ＆ 2-String Kite",
        body: [
          { text: "厳格な数字制限（" },
          { text: "Strict Digit Starvation", strong: true },
          {
            text: "）下では手掛かりが極端に乏しくなります。強リンク同士を結ぶ ",
          },
          { text: "Skyscraper（スカイスクレイパー）", strong: true },
          { text: " や行・列・ブロックをつなぐ " },
          { text: "2-String Kite", strong: true },
          {
            text: " により、両端と交差するマスから推測なしで候補数字を消去できます。",
          },
        ],
      },
      {
        title: "X-Wing（長方形消去）",
        body: [
          {
            text: "ある数字の候補が2つの行で同じ2列のみ（または2列で同じ2行のみ）に限定されると ",
          },
          { text: "X-Wing", strong: true },
          {
            text: " が成立し、交差ライン上の他マスからその数字を安全に取り除けます。",
          },
        ],
      },
      {
        title: "Y-Wing（XY-Wing）連鎖",
        body: [
          {
            text: "2候補ずつ持つ3マス（AB・AC・BC）が連携する ",
          },
          { text: "Y-Wing", strong: true },
          {
            text: " では、軸となるマスがAとBのどちらを取っても、両翼から見える共通マスから候補Cを確実に消せます。",
          },
        ],
      },
    ],
    whyHeading: "数独ソルバーを活用するメリット",
    whyIntro: [
      {
        text: "ソルバーは「答え合わせ」だけでなく、上達段階に応じて2つの明確な役割を果たします。",
      },
    ],
    beginnersTitle: "手筋を学びたい初級・中級者に",
    beginnersItems: [
      [
        { text: "入力ミスを即座に防ぐ：", strong: true },
        {
          text: " 20分かけてから矛盾に気づくのではなく、入力した瞬間に重複セルを検出できます。",
        },
      ],
      [
        { text: "ネタバレなしで練習：", strong: true },
        { text: " " },
        { text: "パズルをプレイ", strong: true },
        {
          text: " を使えば、紙の問題を自動メモ・やり直し機能付きのデジタル盤面へそのまま移して解けます。",
        },
      ],
    ],
    expertsTitle: "難問を検証したい上級者に",
    expertsItems: [
      [
        { text: "唯一解と誤植のチェック：", strong: true },
        {
          text: " 25個配置のような超難問に挑む前に、印刷ミスや複数解がないか一瞬で確かめられます。",
        },
      ],
      [
        { text: "手筋の確認と履歴保存：", strong: true },
        {
          text: " 詰まった局面を素早く検算し、お気に入りのカスタム盤面をローカル／クラウド履歴に整理できます。",
        },
      ],
    ],
    crossLinkPrefix:
      "パターン研究や検算が終わったら、次は全世界共通シードで競う ",
    crossLinkLabel: "デイリー問題（Daily Challenge）",
    crossLinkSuffix:
      " で実力を試してみましょう。毎日すべてのプレイヤーにまったく同じ盤面が出題されるため、月曜から日曜までの難易度カーブに沿ってタイム比較や連続ストリーク記録に挑戦できます。",
    crossLinkRulesPrefix: "X-Wing・Y-Wing・Pointing Pairs の図解や、Auto-Notes（Hard/Expert専用）を含む7つのスマート補助機能の使い方は、",
    crossLinkRulesLabel: "数独ルール・解法＆機能ガイド",
    crossLinkRulesSuffix: " で確認できます。",
    keyboardHeading: "デスクトップ版キーボード操作ガイド：高速入力とプレイ時ショートカット",
    keyboardIntro: [
      {
        text: "キーボードから手を離さず、新聞やパズル誌の盤面を数秒で入力できます。ソルバーの入力画面では ",
      },
      { text: "矢印キー・1〜9 / テンキー 1〜9・Backspace / Delete / 0", strong: true },
      { text: " が即座に反応し、" },
      { text: "Play Puzzle", strong: true },
      { text: " に切り替えるとメモ切替（" },
      { text: "Space / N", strong: true },
      { text: "）、元に戻す（" },
      { text: "Ctrl + Z / Cmd + Z", strong: true },
      { text: "）、ヒント（" },
      { text: "H", strong: true },
      { text: "）を含む全6系統のショートカットが使えます。" },
    ],
    keyboardCards: [
      {
        keys: "1–9 / Numpad 1–9",
        title: "数字と初期ヒントの高速入力",
        desc: "メインキーボードの数字キーでもテンキー（Numpad）でも同じ精度で素早く 9×9 盤面へ数字を入力できます。",
      },
      {
        keys: "Backspace / Delete / 0",
        title: "誤入力セルの即時消去",
        desc: "問題を写し間違えても、Lock & Play を押す前に Backspace・Delete・0 のいずれかで即座にマスを空に戻せます。",
      },
      {
        keys: "矢印キー • Tab / Esc",
        title: "マウス不要の盤面・メニュー移動",
        desc: "上下左右の矢印キーでマスを滑らかに移動し、Tab の視認性の高いフォーカス枠や Esc で各種メニューを操作できます。",
      },
      {
        keys: "Space / N • Ctrl/Cmd+Z • H",
        title: "Play Puzzle モードの完全ショートカット",
        desc: "盤面ロック後に Play Puzzle を開けば、Space や N で候補メモ切替、Ctrl/Cmd + Z で一手戻す、H でヒント確認が行えます。",
      },
    ],
    faqHeading: "数独ソルバー よくある質問（FAQ）",
    faqs: [
      {
        q: "ヒントわずか25個のエキスパート難問も解けますか？",
        a: [
          {
            text: "はい、対応しています。ヒント50個の基本問題から、",
          },
          { text: "Skyscraper", strong: true },
          { text: "・" },
          { text: "2-String Kite", strong: true },
          { text: "・" },
          { text: "X-Wing", strong: true },
          { text: "・" },
          { text: "Y-Wing", strong: true },
          {
            text: " を要する25個のエキスパート問題まで、ビットマスクエンジンが数ミリ秒で正確に解きます。",
          },
        ],
      },
      {
        q: "総当たり計算ではなく人間のロジックにも対応していますか？",
        a: [
          { text: "両方意図的に組み合わせています。" },
          { text: "自動解答", strong: true },
          { text: " では決定論的な " },
          { text: "MRV（最小残余値）ビットマスクエンジン", strong: true },
          {
            text: " が制約伝播を行い最大2解まで探索して唯一解を保証します。一方、内部のロジック評価は ",
          },
          { text: "0-Single停滞", strong: true },
          { text: "・" },
          { text: "ポインティングペア", strong: true },
          { text: "・" },
          { text: "ネイキッド／ヒドゥンペア", strong: true },
          { text: " を解析しており、" },
          { text: "パズルをプレイ", strong: true },
          { text: " から自分の手で同じ論理を実践できます。" },
        ],
      },
      {
        q: "ロックするのに最低17個のヒントが必要なのはなぜですか？",
        a: [
          { text: "数学的証明により、通常の9×9数独がただ1つの解（唯一解）を保つための最小ヒント数は " },
          { text: "17個", strong: true },
          {
            text: " と確定しています。16個以下では必ず複数解が生じるため、未完成な盤面を誤って確定しないよう17個ゲートを設けています。",
          },
        ],
      },
      {
        q: "解けない盤面や複数解の盤面を入力するとどうなりますか？",
        a: [
          {
            text: "行・列・ブロックの重複はその場で即座にエラー表示されます。表面上は重複がなくても論理的に矛盾する盤面では警告バナーが出るため、",
          },
          { text: "数字を編集", strong: true },
          {
            text: " から入力を見直せます。また解が2つ以上見つかった場合は明確に ",
          },
          { text: "複数解（Multiple Solutions）", strong: true },
          { text: " と表示されます。" },
        ],
      },
    ],
  },

  ko: {
    articleAriaLabel: "무료 온라인 스도쿠 풀이기 및 논리 진단 가이드",
    overviewHeading: "무료 온라인 스도쿠 풀이기 & 논리 진단",
    overviewP1: [
      {
        text: "신문이나 퍼즐 책의 스도쿠 중간에서 막혔거나 직접 만든 고난도 퍼즐의 정답이 궁금하신가요? ",
      },
      { text: "SudokuSync 스도쿠 풀이기", strong: true },
      {
        text: "는 모든 유효한 9×9 보드를 즉시 대화형 분석 공간으로 바꿔 줍니다. 모바일과 PC 어디서나 숫자를 깔끔하게 입력하고 밀리초 만에 유일해를 검증한 뒤, ",
      },
      { text: "자동 풀이", strong: true },
      { text: "로 정답을 확인하거나 ",
      },
      { text: "퍼즐 플레이", strong: true },
      { text: " 모드로 전환해 연필 메모 및 타이머와 함께 직접 풀어 보세요." },
    ],
    overviewP2: [
      {
        text: "맥락 없이 숫자만 채워 주는 단순 계산기와 달리, 빠른 비트마스크 검증기와 SudokuSync의 인간 논리 등급 엔진을 결합해 숫자를 고정하기 전 충돌 칸을 바로 표시하고 힌트 밀도와 패턴 깊이를 기준으로 실제 난이도를 판별합니다.",
      },
    ],
    howToHeading: "무료 스도쿠 풀이기 사용 방법",
    howToIntro: [
      {
        text: "인쇄된 퍼즐, 잡지 문제, 공유받은 스크린샷 보드도 30초 안에 손쉽게 옮길 수 있습니다. 흐릿한 인쇄물이나 그림자로 인한 OCR 오인식을 피하면서도 입력 즉시 실시간 검증을 받을 수 있습니다:",
      },
    ],
    howToSteps: [
      [
        { text: "1. 시작 힌트 입력하기:", strong: true },
        { text: " 9×9 보드에서 원하는 칸을 눌러 키패드의 ", },
        { text: "1–9", strong: true },
        { text: " 를 선택하세요. 데스크톱에서는 " },
        { text: "방향키", strong: true },
        { text: " 로 칸을 이동하고 키보드로 바로 숫자를 입력·삭제할 수 있습니다." },
      ],
      [
        { text: "2. 실시간 충돌 검사 확인:", strong: true },
        {
          text: " 모든 숫자는 같은 가로줄, 세로줄, 3×3 박스 기준으로 즉시 검사됩니다. 중복된 숫자는 연한 로즈 컬러로 강조되어 보드를 고정하기 전에 오타를 쉽게 수정할 수 있습니다.",
        },
      ],
      [
        { text: "3. 최소 17개 힌트 기준 & 실시간 난이도 배지:", strong: true },
        { text: " 수학적으로 일반 9×9 스도쿠가 단 하나의 정답(유일해)을 가지려면 최소 " },
        { text: "17개의 힌트", strong: true },
        {
          text: " 가 필요합니다. 숫자를 채울수록 상태 바에 ",
        },
        { text: "쉬움 (45+ 힌트)", strong: true },
        { text: ", " },
        { text: "보통 (35–44 힌트)", strong: true },
        { text: ", " },
        { text: "어려움 (28–34 힌트)", strong: true },
        { text: ", " },
        { text: "전문가 (<28 힌트)", strong: true },
        { text: " 등급이 실시간으로 표시됩니다." },
      ],
      [
        { text: "4. 고정 후 원하는 모드 선택:", strong: true },
        { text: " 힌트 입력이 끝나면 " },
        { text: "고정 및 플레이", strong: true },
        { text: " 를 누르세요. 액션 덱에서 " },
        { text: "자동 풀이", strong: true },
        {
          text: " 로 유일해/복수해 판정과 정답을 확인하거나, ",
        },
        { text: "퍼즐 플레이", strong: true },
        {
          text: " 로 직접 솔로 플레이를 이어가며 ",
        },
        { text: "커스텀 기록", strong: true },
        { text: " 에 저장할 수 있습니다." },
      ],
    ],
    techniquesHeading: "지원되는 고급 논리 및 패턴 분석 구조",
    techniquesIntro: [
      {
        text: "SudokuSync 분석기는 단순 적합성 검증을 넘어 숙련된 플레이어의 사고 방식을 모델링합니다. 어려움과 전문가 티어에서는 다음과 같은 핵심 소거 구조를 정밀하게 평가합니다:",
      },
    ],
    techniqueCards: [
      {
        title: "0-Single 막힘 & 페어 소거법",
        body: [
          { text: "어려운 보드는 기본 스캔으로 바로 채울 칸이 전혀 나오지 않는 " },
          { text: "0-Single 막힘", strong: true },
          {
            text: " 구간을 의도적으로 만듭니다. 이를 뚫으려면 ",
          },
          { text: "포인팅 페어(Pointing Pairs)", strong: true },
          { text: ", " },
          { text: "네이키드 페어", strong: true },
          { text: ", " },
          { text: "히든 페어", strong: true },
          {
            text: " 로 불필요한 후보를 지워 새 싱글을 열어야 합니다.",
          },
        ],
      },
      {
        title: "Skyscraper & 2-String Kite",
        body: [
          { text: "엄격한 숫자 희소성(" },
          { text: "Strict Digit Starvation", strong: true },
          {
            text: ") 환경에서는 쉬운 단서가 급격히 줄어듭니다. 두 강한 링크를 잇는 ",
          },
          { text: "스카이스크래퍼(Skyscraper)", strong: true },
          { text: " 나 가로·세로·박스를 연결하는 " },
          { text: "2-String Kite", strong: true },
          {
            text: " 체인을 사용하면 추측 없이 양 끝점의 공통 교차 후보를 제거할 수 있습니다.",
          },
        ],
      },
      {
        title: "X-Wing 직사각형 배열",
        body: [
          {
            text: "특정 숫자의 후보가 두 개의 행에서 정확히 같은 두 열에만 나타날 때(또는 그 반대의 경우) ",
          },
          { text: "X-Wing", strong: true },
          {
            text: " 사각형이 형성되어, 교차하는 두 줄의 나머지 칸에서 해당 후보를 안전하게 지울 수 있습니다.",
          },
        ],
      },
      {
        title: "Y-Wing (XY-Wing) 피벗 연결",
        body: [
          {
            text: "후보 2개씩을 공유하는 세 칸(AB, AC, BC)이 짝을 이루는 ",
          },
          { text: "Y-Wing", strong: true },
          {
            text: " 은 순수 논리 경첩처럼 작동해, 중심 피벗이 어떤 값을 갖든 두 날개 칸과 겹치는 칸의 숫자 C를 즉시 배제합니다.",
          },
        ],
      },
    ],
    whyHeading: "스도쿠 풀이기를 활용해야 하는 이유",
    whyIntro: [
      {
        text: "전용 풀이기는 단순히 정답만 보는 도구가 아니라, 실력 단계에 맞춰 두 가지 뚜렷한 가치를 제공합니다:",
      },
    ],
    beginnersTitle: "패턴을 익히는 입문·중급자를 위해",
    beginnersItems: [
      [
        { text: "입력 오류 조기 차단:", strong: true },
        {
          text: " 20분 동안 푼 뒤에 모순을 발견하는 대신, 옮겨 적는 순간 중복된 박스·열 숫자를 바로 잡아냅니다.",
        },
      ],
      [
        { text: "스포일러 없는 실전 연습:", strong: true },
        { text: " " },
        { text: "퍼즐 플레이", strong: true },
        {
          text: " 로 인쇄된 문제를 자동 메모와 실행 취소가 지원되는 깔끔한 디지털 보드로 옮겨 직접 풀 수 있습니다.",
        },
      ],
    ],
    expertsTitle: "난제를 검증하는 숙련자를 위해",
    expertsItems: [
      [
        { text: "유일해 & 인쇄 오류 검증:", strong: true },
        {
          text: " 25개 힌트 수준의 초고난도 퍼즐을 풀기 전에 실제로 단 하나의 유효한 정답만 있는지 즉시 검증합니다.",
        },
      ],
      [
        { text: "고급 추론 검산 및 보관:", strong: true },
        {
          text: " 까다로운 보드의 마지막 추론을 빠르게 확인하고 개인 커스텀 기록을 로컬 또는 클라우드에 체계적으로 저장합니다.",
        },
      ],
    ],
    crossLinkPrefix:
      "어려운 보드 분석과 패턴 연습을 마쳤다면 이제 전 세계 동일 시드 보드로 실력을 겨루는 ",
    crossLinkLabel: "일일 챌린지(Daily Challenge)",
    crossLinkSuffix:
      " 에 도전해 보세요. 매일 모든 플레이어가 완전히 같은 퍼즐을 받으며 월요일부터 일요일까지 이어지는 난이도 곡선 속에서 기록을 비교하고 데일리 스트릭을 쌓을 수 있습니다.",
    crossLinkRulesPrefix: "X-Wing·Y-Wing·Pointing Pairs 단계별 다이어그램과 7가지 스마트 도우미(Hard/Expert 전용 자동 메모 등)의 자세한 설명은 ",
    crossLinkRulesLabel: "스도쿠 규칙 및 전략 허브",
    crossLinkRulesSuffix: " 에서 확인할 수 있습니다.",
    keyboardHeading: "데스크톱 키보드 단축키 워크플로: 빠른 숫자 입력 및 플레이 제어",
    keyboardIntro: [
      {
        text: "키보드에서 손을 떼지 않고도 책이나 신문 퍼즐을 몇 초 만에 옮겨 적을 수 있습니다. 풀이기 입력 단계에서는 ",
      },
      { text: "방향키, 1–9 / 넘패드(Numpad) 1–9, Backspace / Delete / 0", strong: true },
      { text: " 으로 빠르게 입력하고, " },
      { text: "Play Puzzle", strong: true },
      { text: " 로 전환하면 메모(" },
      { text: "Spacebar / N", strong: true },
      { text: "), 실행 취소(" },
      { text: "Ctrl + Z / Cmd + Z", strong: true },
      { text: "), 힌트(" },
      { text: "H", strong: true },
      { text: ") 단축키를 모두 사용할 수 있습니다." },
    ],
    keyboardCards: [
      {
        keys: "1–9 / Numpad 1–9",
        title: "초기 힌트 및 정답 고속 입력",
        desc: "상단 숫자 키와 전용 숫자 패드(Numpad)를 모두 지원해 9×9 보드에 숫자를 빈틈없이 빠르게 입력할 수 있습니다.",
      },
      {
        keys: "Backspace / Delete / 0",
        title: "선택 칸 즉시 지우기",
        desc: "오타가 나도 Lock & Play를 누르기 전에 Backspace, Delete 또는 0 키를 눌러 잘못된 숫자를 즉시 지울 수 있습니다.",
      },
      {
        keys: "방향키 • Tab / Esc",
        title: "마우스 없는 보드 및 메뉴 이동",
        desc: "상하좌우 방향키로 보드 칸을 자유롭게 이동하고, 선명한 포커스 링이 적용된 Tab 이동 및 Esc 닫기로 쾌적하게 조작하세요.",
      },
      {
        keys: "Space / N • Ctrl/Cmd+Z • H",
        title: "Play Puzzle 전용 단축키 6종",
        desc: "보드를 잠근 뒤 Play Puzzle을 시작하면 Spacebar 또는 N으로 연필 메모, Ctrl/Cmd + Z로 실행 취소, H로 논리 힌트를 호출할 수 있습니다.",
      },
    ],
    faqHeading: "스도쿠 풀이기 자주 묻는 질문 (FAQ)",
    faqs: [
      {
        q: "25개 힌트만 있는 전문가(Expert) 퍼즐도 풀 수 있나요?",
        a: [
          {
            text: "네. 50개 힌트의 가벼운 신문 퍼즐부터 ",
          },
          { text: "Skyscraper", strong: true },
          { text: ", " },
          { text: "2-String Kite", strong: true },
          { text: ", " },
          { text: "X-Wing", strong: true },
          { text: ", " },
          { text: "Y-Wing", strong: true },
          {
            text: " 병목이 걸린 25개 힌트 전문가 보드까지 비트마스크 엔진이 밀리초 단위로 정확히 해결합니다.",
          },
        ],
      },
      {
        q: "무작정 대입하는 방식인가요, 인간 논리 기반인가요?",
        a: [
          { text: "두 가지 장점을 의도적으로 결합했습니다. " },
          { text: "자동 풀이", strong: true },
          { text: " 를 누르면 결정론적 " },
          { text: "MRV 비트마스크 엔진", strong: true },
          {
            text: " 이 제약 전파를 수행하며 최대 2개의 해를 탐색해 유일해 여부를 판별합니다. 동시에 내부 인간 논리 평가기는 ",
          },
          { text: "0-Single 막힘", strong: true },
          { text: ", " },
          { text: "포인팅 페어", strong: true },
          { text: ", " },
          { text: "네이키드/히든 페어", strong: true },
          { text: " 를 분석하며, " },
          { text: "퍼즐 플레이", strong: true },
          { text: " 로 해당 논리를 직접 연습할 수 있습니다." },
        ],
      },
      {
        q: "보드를 고정하려면 왜 최소 17개의 힌트가 필요한가요?",
        a: [
          { text: "수학적 증명에 따라 표준 9×9 스도쿠가 단 하나의 정답을 유지하기 위한 최소 단서 수는 " },
          { text: "17개", strong: true },
          {
            text: " 입니다. 16개 이하에서는 반드시 복수의 해가 존재하므로, 실수로 불완전한 보드를 잠그지 않도록 17개 기준을 두고 있습니다.",
          },
        ],
      },
      {
        q: "풀 수 없거나 해가 여러 개인 퍼즐을 입력하면 어떻게 되나요?",
        a: [
          {
            text: "가로줄, 세로줄, 3×3 박스 규칙에 어긋나는 입력은 실시간 검사로 즉시 표시됩니다. 겉보기 충돌이 없어도 논리적으로 해가 없다면 안내 배너가 뜨므로 ",
          },
          { text: "숫자 수정", strong: true },
          {
            text: " 을 눌러 입력을 점검할 수 있으며, 유효한 해가 둘 이상인 경우에는 명확히 ",
          },
          { text: "복수 해(Multiple Solutions)", strong: true },
          { text: " 로 표시됩니다." },
        ],
      },
    ],
  },

  es: {
    articleAriaLabel: "Solucionador de Sudoku Online Gratis y Diagnóstico Lógico",
    overviewHeading: "Solucionador de Sudoku Online Gratis y Diagnóstico Lógico",
    overviewP1: [
      {
        text: "¿Atascado a mitad de un Sudoku del periódico o quieres comprobar un tablero personalizado extremo? El ",
      },
      { text: "Solucionador de SudokuSync", strong: true },
      {
        text: " convierte cualquier cuadrícula válida de 9×9 en un banco de pruebas interactivo al instante. Introduce las pistas cómodamente en móvil o escritorio, verifica la solución única en milisegundos y elige entre revelar el tablero con ",
      },
      { text: "Autoresolver", strong: true },
      { text: " o pasar directamente a " },
      { text: "Jugar tablero", strong: true },
      { text: " con Notas de lápiz y cronómetro." },
    ],
    overviewP2: [
      {
        text: "A diferencia de los resolvedores básicos que solo vuelcan números sin contexto, nuestro motor combina verificación determinista por máscaras de bits con el analizador lógico humano de SudokuSync: detecta conflictos antes de fijar las pistas y estima la dificultad real según la densidad de pistas y patrones exigidos.",
      },
    ],
    howToHeading: "Cómo usar el Solucionador de Sudoku gratis",
    howToIntro: [
      {
        text: "Puedes copiar cualquier puzzle de libro, revista o captura de pantalla en menos de treinta segundos. La entrada manual evita errores de lectura óptica (OCR) por papel borroso o sombras mientras te protege en tiempo real:",
      },
    ],
    howToSteps: [
      [
        { text: "1. Introduce las pistas iniciales:", strong: true },
        { text: " Toca cualquier casilla del tablero 9×9 y elige dígitos del " },
        { text: "1 al 9", strong: true },
        { text: " en el teclado. En ordenador, muévete con las " },
        { text: "flechas de dirección", strong: true },
        { text: " y escribe o borra números directamente con tu teclado." },
      ],
      [
        { text: "2. Revisa la validación de conflictos en vivo:", strong: true },
        {
          text: " Cada número se comprueba al instante en su fila, columna y caja 3×3. Los duplicados se resaltan en rosa suave para que corrijas erratas de transcripción antes de bloquear el tablero.",
        },
      ],
      [
        { text: "3. Umbral de 17 pistas e insignia de dificultad:", strong: true },
        { text: " Matemáticamente, un Sudoku 9×9 estándar necesita al menos " },
        { text: "17 pistas", strong: true },
        {
          text: " para asegurar una única solución. Mientras añades números, la barra clasifica tu tablero en ",
        },
        { text: "Fácil (45+ pistas)", strong: true },
        { text: ", " },
        { text: "Medio (35–44 pistas)", strong: true },
        { text: ", " },
        { text: "Difícil (28–34 pistas)", strong: true },
        { text: " y " },
        { text: "Experto (<28 pistas)", strong: true },
        { text: "." },
      ],
      [
        { text: "4. Fija y elige tu camino:", strong: true },
        { text: " Pulsa " },
        { text: "Fijar y jugar", strong: true },
        { text: " cuando tus pistas sean válidas. En la barra de acciones, toca " },
        { text: "Autoresolver", strong: true },
        {
          text: " para calcular la solución—distinguiendo solución única de múltiple—o elige ",
        },
        { text: "Jugar tablero", strong: true },
        {
          text: " para resolverlo tú mismo en modo Solo y guardarlo en tu ",
        },
        { text: "Historial propio", strong: true },
        { text: "." },
      ],
    ],
    techniquesHeading: "Lógica compatible y arquitectura de patrones",
    techniquesIntro: [
      {
        text: "Nuestro analizador no se limita a probar números: modela cómo razona un jugador avanzado. En los niveles Difícil y Experto evalúa estructuras reales de eliminación que destraban cualquier bloqueo:",
      },
    ],
    techniqueCards: [
      {
        title: "Bloqueos 0-Single y Pares",
        body: [
          { text: "Las cuadrículas exigentes crean adrede " },
          { text: "bloqueos 0-Single", strong: true },
          {
            text: " donde el escaneo simple no halla jugadas directas. Romperlos exige detectar ",
          },
          { text: "Pointing Pairs", strong: true },
          { text: ", " },
          { text: "Pares Desnudos", strong: true },
          { text: " y " },
          { text: "Pares Ocultos", strong: true },
          { text: " hasta liberar nuevos Singles." },
        ],
      },
      {
        title: "Skyscraper y 2-String Kite",
        body: [
          { text: "Bajo " },
          { text: "Escasez Estricta de Dígitos (Digit Starvation)", strong: true },
          {
            text: ", los números fáciles desaparecen. Conectar dos enlaces fuertes mediante un ",
          },
          { text: "Skyscraper", strong: true },
          { text: " o un " },
          { text: "2-String Kite", strong: true },
          {
            text: " entre fila, columna y caja elimina candidatos visibles desde ambos extremos sin tantear.",
          },
        ],
      },
      {
        title: "Alineaciones rectangulares X-Wing",
        body: [
          {
            text: "Cuando un candidato ocupa exactamente las mismas dos columnas en dos filas distintas (o viceversa), un ",
          },
          { text: "X-Wing", strong: true },
          {
            text: " forma un rectángulo lógico que descarta ese número del resto de celdas en ambas líneas cruzadas.",
          },
        ],
      },
      {
        title: "Pivotes Y-Wing (XY-Wing)",
        body: [
          {
            text: "Formado por tres casillas bivalor con pares AB, AC y BC, un ",
          },
          { text: "Y-Wing", strong: true },
          {
            text: " actúa como bisagra pura: tome A o B el pivote, cualquier casilla que vea ambos extremos descarta el dígito C.",
          },
        ],
      },
    ],
    whyHeading: "¿Por qué usar un Solucionador de Sudoku?",
    whyIntro: [
      {
        text: "Un buen solucionador sirve mucho más que para ver respuestas finales: cumple dos funciones claras según tu nivel:",
      },
    ],
    beginnersTitle: "Para principiantes aprendiendo patrones",
    beginnersItems: [
      [
        { text: "Detecta errores al instante:", strong: true },
        {
          text: " Corrige duplicados sutiles en cajas o columnas mientras copias, evitando descubrir una contradicción veinte minutos después.",
        },
      ],
      [
        { text: "Aprende sin spoilers:", strong: true },
        { text: " Usa " },
        { text: "Jugar tablero", strong: true },
        {
          text: " para pasar puzzles impresos a un tablero limpio con notas automáticas e historial de deshacer.",
        },
      ],
    ],
    expertsTitle: "Para expertos auditando retos duros",
    expertsItems: [
      [
        { text: "Verifica unicidad y erratas:", strong: true },
        {
          text: " Confirma antes de empezar si un tablero extremo de libro tiene de verdad una única solución válida.",
        },
      ],
      [
        { text: "Audita tableros de 25 pistas rápido:", strong: true },
        {
          text: " Comprueba tus deducciones finales y organiza tus tableros propios en el historial local o en la nube.",
        },
      ],
    ],
    crossLinkPrefix:
      "Cuando termines de auditar un tablero difícil o practicar patrones aquí, pon a prueba tu lógica en el ",
    crossLinkLabel: "Reto Diario (Daily Challenge)",
    crossLinkSuffix:
      ". Cada día todos los jugadores del mundo reciben el mismo tablero generado de forma determinista, ideal para comparar tiempos de lunes a domingo y mantener tu racha diaria.",
    crossLinkRulesPrefix: "¿Buscas diagramas paso a paso de X-Wing, Y-Wing, Pointing Pairs y los 7 Asistentes Inteligentes integrados? Explora el ",
    crossLinkRulesLabel: "Centro de Reglas y Estrategias de Sudoku",
    crossLinkRulesSuffix: ".",
    keyboardHeading: "Flujo de teclado en escritorio: entrada rápida y controles de juego",
    keyboardIntro: [
      {
        text: "Transcribe cualquier tablero impreso o captura en segundos sin soltar el teclado. Al introducir pistas en el solucionador, ",
      },
      { text: "las flechas, 1–9 / teclado numérico y Backspace / Supr / 0", strong: true },
      { text: " agilizan la carga; al cambiar a " },
      { text: "Play Puzzle", strong: true },
      { text: " dispondrás además de " },
      { text: "Barra espaciadora / N", strong: true },
      { text: " (notas), " },
      { text: "Ctrl + Z / Cmd + Z", strong: true },
      { text: " (deshacer) y " },
      { text: "H", strong: true },
      { text: " (pista)." },
    ],
    keyboardCards: [
      {
        keys: "1–9 / Numpad 1–9",
        title: "Entrada ágil de pistas y dígitos",
        desc: "Usa la fila superior de números o el teclado numérico lateral para fijar pistas iniciales o completar casillas en Play Puzzle.",
      },
      {
        keys: "Backspace / Delete / 0",
        title: "Borrado inmediato de casilla",
        desc: "¿Te equivocaste al copiar un número? Pulsa Backspace, Supr o 0 antes de pulsar Lock & Play para limpiar la celda al instante.",
      },
      {
        keys: "Flechas • Tab / Esc",
        title: "Navegación total sin ratón",
        desc: "Recorre la cuadrícula 9×9 con las teclas de flecha, muévete entre botones con Tab y enfoque visible, y cierra paneles con Esc.",
      },
      {
        keys: "Space / N • Ctrl/Cmd+Z • H",
        title: "Atajos completos en Play Puzzle",
        desc: "Al bloquear el tablero en Play Puzzle, activa notas de lápiz con Espacio o N, deshaz movimientos con Ctrl/Cmd + Z y pide pista con H.",
      },
    ],
    faqHeading: "Preguntas frecuentes sobre el Solucionador",
    faqs: [
      {
        q: "¿Puede este solucionador resolver tableros Experto de 25 pistas?",
        a: [
          {
            text: "Sí. Tanto si introduces un calentamiento de 50 pistas como un tablero Experto de 25 pistas con ",
          },
          { text: "Skyscraper", strong: true },
          { text: ", " },
          { text: "2-String Kite", strong: true },
          { text: ", " },
          { text: "X-Wing", strong: true },
          { text: " y " },
          { text: "Y-Wing", strong: true },
          {
            text: ", nuestro motor de máscaras de bits resuelve tableros válidos en milisegundos.",
          },
        ],
      },
      {
        q: "¿Usa fuerza bruta ciega o lógica humana?",
        a: [
          { text: "SudokuSync combina ambas fortalezas. Al pulsar " },
          { text: "Autoresolver", strong: true },
          { text: ", un motor determinista de " },
          { text: "Valores Mínimos Restantes (MRV)", strong: true },
          {
            text: " propaga restricciones y busca hasta dos soluciones válidas para confirmar la unicidad. Paralelamente, nuestro evaluador humano analiza ",
          },
          { text: "bloqueos 0-Single", strong: true },
          { text: ", " },
          { text: "Pointing Pairs", strong: true },
          { text: " y " },
          { text: "Pares Desnudos/Ocultos", strong: true },
          { text: "—y con " },
          { text: "Jugar tablero", strong: true },
          { text: " puedes entrenar esas mismas deducciones paso a paso." },
        ],
      },
      {
        q: "¿Por qué se exigen al menos 17 pistas antes de fijar?",
        a: [
          { text: "Por demostración matemática, " },
          { text: "17 pistas", strong: true },
          {
            text: " es el mínimo absoluto para que un Sudoku 9×9 estándar conserve una única solución válida. Con 16 o menos siempre existen varias respuestas posibles.",
          },
        ],
      },
      {
        q: "¿Qué ocurre si el puzzle no tiene solución o tiene varias?",
        a: [
          {
            text: "Si un dígito incumple fila, columna o caja 3×3, se marca al momento. Si la propagación profunda confirma que no hay solución posible, verás un aviso para volver con ",
          },
          { text: "Editar pistas", strong: true },
          {
            text: ". Los tableros con más de una solución válida se etiquetan claramente como ",
          },
          { text: "Soluciones Múltiples", strong: true },
          { text: "." },
        ],
      },
    ],
  },

  fr: {
    articleAriaLabel: "Solveur de Sudoku Gratuit en Ligne et Diagnostic Logique",
    overviewHeading: "Solveur de Sudoku Gratuit en Ligne & Diagnostic Logique",
    overviewP1: [
      {
        text: "Bloqué au milieu d'une grille de journal ou envie de vérifier une grille personnalisée redoutable ? Le ",
      },
      { text: "Solveur SudokuSync", strong: true },
      {
        text: " transforme instantanément toute grille 9×9 valide en espace d'analyse interactif. Saisissez vos chiffres sur mobile ou ordinateur, vérifiez l'unicité en quelques millisecondes et affichez la solution via ",
      },
      { text: "Résoudre", strong: true },
      { text: " ou basculez en mode " },
      { text: "Jouer la grille", strong: true },
      { text: " avec notes au crayon et chronomètre." },
    ],
    overviewP2: [
      {
        text: "Contrairement aux outils basiques qui remplissent des chiffres sans contexte, notre architecture associe un solveur bitmask ultra-rapide à l'analyseur logique humain de SudokuSync : il signale les doublons avant validation et estime la véritable difficulté selon la densité d'indices et les motifs requis.",
      },
    ],
    howToHeading: "Comment utiliser le Solveur de Sudoku gratuit",
    howToIntro: [
      {
        text: "Recopiez n'importe quelle grille papier, revue ou capture d'écran en moins de trente secondes. La saisie manuelle évite les erreurs de reconnaissance OCR dues au flou ou aux ombres tout en vous guidant en direct :",
      },
    ],
    howToSteps: [
      [
        { text: "1. Saisissez vos indices de départ :", strong: true },
        { text: " Touchez une case de la grille 9×9 et choisissez ", },
        { text: "1–9", strong: true },
        { text: ". Sur ordinateur, déplacez-vous avec les " },
        { text: "flèches du clavier", strong: true },
        { text: " et saisissez ou effacez directement vos chiffres." },
      ],
      [
        { text: "2. Profitez du contrôle de conflits en temps réel :", strong: true },
        {
          text: " Chaque chiffre est vérifié immédiatement sur sa ligne, sa colonne et son bloc 3×3. Les doublons apparaissent en rose doux pour corriger toute erreur de copie avant le verrouillage.",
        },
      ],
      [
        { text: "3. Seuil des 17 indices & badge de difficulté :", strong: true },
        { text: " Mathématiquement, un Sudoku 9×9 classique requiert au minimum " },
        { text: "17 indices", strong: true },
        {
          text: " pour garantir une solution unique. En cours de saisie, la barre d'état classe votre grille en ",
        },
        { text: "Facile (45+ indices)", strong: true },
        { text: ", " },
        { text: "Moyen (35–44 indices)", strong: true },
        { text: ", " },
        { text: "Difficile (28–34 indices)", strong: true },
        { text: " ou " },
        { text: "Expert (<28 indices)", strong: true },
        { text: "." },
      ],
      [
        { text: "4. Validez et choisissez votre option :", strong: true },
        { text: " Touchez " },
        { text: "Valider & Jouer", strong: true },
        { text: " une fois les indices prêts. Depuis le panneau d'action, touchez " },
        { text: "Résoudre", strong: true },
        {
          text: " pour obtenir la grille complète et détecter les solutions multiples, ou ",
        },
        { text: "Jouer la grille", strong: true },
        {
          text: " pour la résoudre en Solo et l'archiver dans votre ",
        },
        { text: "Historique perso", strong: true },
        { text: "." },
      ],
    ],
    techniquesHeading: "Logique prise en charge & motifs avancés",
    techniquesIntro: [
      {
        text: "Notre moteur ne se contente pas de vérifier si les chiffres s'emboîtent : il modélise le raisonnement d'un joueur chevronné. Dans les paliers Difficile et Expert, il évalue les techniques d'élimination indispensables :",
      },
    ],
    techniqueCards: [
      {
        title: "Impasses 0-Single & Paires",
        body: [
          { text: "Les grilles exigeantes provoquent volontairement des " },
          { text: "impasses 0-Single", strong: true },
          {
            text: " où le balayage direct n'offre aucun coup sûr. Il faut alors repérer ",
          },
          { text: "Pointing Pairs (Paires pointantes)", strong: true },
          { text: ", " },
          { text: "Paires Nues", strong: true },
          { text: " et " },
          { text: "Paires Cachées", strong: true },
          { text: " pour rouvrir de nouveaux coups." },
        ],
      },
      {
        title: "Skyscraper & 2-String Kite",
        body: [
          { text: "Sous " },
          { text: "Rareté Stricte des Chiffres (Strict Digit Starvation)", strong: true },
          {
            text: ", les repères évidents se font rares. Relier deux liens forts via un ",
          },
          { text: "Skyscraper", strong: true },
          { text: " ou un " },
          { text: "2-String Kite", strong: true },
          {
            text: " entre ligne, colonne et bloc élimine les candidats visibles par les deux extrémités sans deviner.",
          },
        ],
      },
      {
        title: "Rectangles X-Wing",
        body: [
          {
            text: "Lorsqu'un chiffre n'apparaît que dans les deux mêmes colonnes sur deux lignes distinctes (ou inversement), un ",
          },
          { text: "X-Wing", strong: true },
          {
            text: " forme un rectangle logique permettant d'effacer ce candidat sur le reste des deux lignes croisées.",
          },
        ],
      },
      {
        title: "Pivots Y-Wing (XY-Wing)",
        body: [
          {
            text: "Construit autour de trois cases bivalentes partageant AB, AC et BC, le ",
          },
          { text: "Y-Wing", strong: true },
          {
            text: " agit comme charnière logique : quelle que soit la valeur du pivot, toute case voyant les deux pinces exclut le chiffre C.",
          },
        ],
      },
    ],
    whyHeading: "Pourquoi utiliser un Solveur de Sudoku ?",
    whyIntro: [
      {
        text: "Bien plus qu'un simple dépanneur, un solveur dédié remplit deux rôles précis selon votre progression :",
      },
    ],
    beginnersTitle: "Pour les débutants qui apprennent",
    beginnersItems: [
      [
        { text: "Évitez les erreurs de recopie :", strong: true },
        {
          text: " Repérez immédiatement un doublon de colonne ou de bloc avant de perdre vingt minutes sur une grille faussée.",
        },
      ],
      [
        { text: "Pratiquez sans spoilers :", strong: true },
        { text: " Utilisez " },
        { text: "Jouer la grille", strong: true },
        {
          text: " pour transférer une grille papier sur un plateau numérique net avec notes automatiques et annulation.",
        },
      ],
    ],
    expertsTitle: "Pour les experts qui auditent",
    expertsItems: [
      [
        { text: "Vérifiez l'unicité et les coquilles :", strong: true },
        {
          text: " Confirmez en un clin d'œil qu'une grille extrême à 25 indices possède bien une solution mathématique unique.",
        },
      ],
      [
        { text: "Auditez vos chaînes complexes :", strong: true },
        {
          text: " Contrôlez vos déductions finales et conservez vos grilles favorites dans l'historique local ou cloud.",
        },
      ],
    ],
    crossLinkPrefix:
      "Une fois vos schémas vérifiés et vos motifs maîtrisés, testez votre rapidité sur le ",
    crossLinkLabel: "Défi du Jour (Daily Challenge)",
    crossLinkSuffix:
      ". Chaque joueur dans le monde reçoit exactement la même grille générée de façon déterministe : mesurez-vous du lundi au dimanche et entretenez votre série quotidienne.",
    crossLinkRulesPrefix: "Vous voulez consulter nos schémas visuels pour X-Wing, Y-Wing, les paires pointantes et nos 7 Assistants Intelligents intégrés ? Parcourez le ",
    crossLinkRulesLabel: "Guide des Règles et Stratégies Sudoku",
    crossLinkRulesSuffix: ".",
    keyboardHeading: "Raccourcis clavier sur ordinateur : saisie rapide et mode jeu",
    keyboardIntro: [
      {
        text: "Recopiez une grille de journal ou de livre en quelques secondes sans quitter le clavier. Lors de la saisie des indices, ",
      },
      { text: "les flèches, 1–9 / pavé numérique et Retour arrière / Suppr / 0", strong: true },
      { text: " assurent une frappe fluide ; en passant sur " },
      { text: "Play Puzzle", strong: true },
      { text: ", vous débloquez " },
      { text: "Espace / N", strong: true },
      { text: " (notes), " },
      { text: "Ctrl + Z / Cmd + Z", strong: true },
      { text: " (annuler) et " },
      { text: "H", strong: true },
      { text: " (indice)." },
    ],
    keyboardCards: [
      {
        keys: "1–9 / Pavé num. 1–9",
        title: "Saisie rapide des chiffres",
        desc: "Utilisez indifféremment la rangée supérieure ou le pavé numérique dédié pour placer les indices ou finaliser votre grille.",
      },
      {
        keys: "Backspace / Suppr / 0",
        title: "Effacement instantané",
        desc: "Une erreur de copie ? Appuyez sur Retour arrière, Suppr ou 0 avant de cliquer sur Lock & Play pour vider la case aussitôt.",
      },
      {
        keys: "Flèches • Tab / Échap",
        title: "Navigation complète sans souris",
        desc: "Déplacez-vous dans les 81 cases avec les flèches directionnelles, naviguez via Tab avec anneau de focus net et fermez les tiroirs avec Échap.",
      },
      {
        keys: "Espace / N • Ctrl/Cmd+Z • H",
        title: "Raccourcis complets en Play Puzzle",
        desc: "Une fois la grille verrouillée en Play Puzzle, activez le mode notes avec Espace ou N, annulez avec Ctrl/Cmd + Z ou affichez un indice via H.",
      },
    ],
    faqHeading: "Questions fréquentes sur le Solveur",
    faqs: [
      {
        q: "Ce solveur résout-il les grilles Expert à 25 indices ?",
        a: [
          {
            text: "Oui. Qu'il s'agisse d'une grille facile à 50 indices ou d'une grille Expert à 25 indices dotée de ",
          },
          { text: "Skyscraper", strong: true },
          { text: ", " },
          { text: "2-String Kite", strong: true },
          { text: ", " },
          { text: "X-Wing", strong: true },
          { text: " et " },
          { text: "Y-Wing", strong: true },
          {
            text: ", notre moteur bitmask résout toute grille valide en quelques millisecondes.",
          },
        ],
      },
      {
        q: "Est-ce une force brute aveugle ou une logique humaine ?",
        a: [
          { text: "SudokuSync associe les deux approches. Lorsque vous touchez " },
          { text: "Résoudre", strong: true },
          { text: ", un moteur déterministe " },
          { text: "MRV bitmask", strong: true },
          {
            text: " propage les contraintes et compte jusqu'à deux solutions pour certifier l'unicité. En parallèle, notre évaluateur humain analyse ",
          },
          { text: "impasses 0-Single", strong: true },
          { text: ", " },
          { text: "Pointing Pairs", strong: true },
          { text: " et " },
          { text: "Paires Nues/Cachées", strong: true },
          { text: "—et " },
          { text: "Jouer la grille", strong: true },
          { text: " vous permet de pratiquer ces déductions vous-même." },
        ],
      },
      {
        q: "Pourquoi faut-il au moins 17 indices avant de valider ?",
        a: [
          { text: "Il est mathématiquement démontré que " },
          { text: "17 indices", strong: true },
          {
            text: " constituent le minimum absolu pour qu'un Sudoku 9×9 standard admette une solution unique. En dessous de 17, plusieurs solutions coexistent toujours.",
          },
        ],
      },
      {
        q: "Que se passe-t-il si ma grille est insoluble ou ambiguë ?",
        a: [
          {
            text: "Tout doublon de ligne, colonne ou bloc est signalé instantanément. Si aucune solution n'existe après propagation profonde, une alerte vous invite à utiliser ",
          },
          { text: "Modifier", strong: true },
          {
            text: ". Les grilles possédant plusieurs complétions valides affichent clairement ",
          },
          { text: "Solutions Multiples", strong: true },
          { text: "." },
        ],
      },
    ],
  },

  it: {
    articleAriaLabel: "Risolutore Sudoku Online Gratis e Diagnostica Logica",
    overviewHeading: "Risolutore Sudoku Online Gratis & Diagnostica Logica",
    overviewP1: [
      {
        text: "Bloccato a metà di uno schema da giornale o vuoi controllare un difficile schema personalizzato? Il ",
      },
      { text: "Risolutore SudokuSync", strong: true },
      {
        text: " trasforma qualsiasi griglia 9×9 valida in uno spazio di diagnosi interattivo. Inserisci le cifre su smartphone o desktop, verifica l'unicità in millisecondi e scegli se svelare la soluzione con ",
      },
      { text: "Autorisolvi", strong: true },
      { text: " oppure passare a " },
      { text: "Gioca schema", strong: true },
      { text: " con note a matita e timer." },
    ],
    overviewP2: [
      {
        text: "A differenza dei risolutori che riempiono numeri senza contesto, la nostra architettura unisce la verifica bitmask deterministica al motore logico umano di SudokuSync, evidenziando eventuali conflitti prima del blocco e stimando la difficoltà reale in base a densità degli indizi e schemi richiesti.",
      },
    ],
    howToHeading: "Come usare il Risolutore Sudoku gratuito",
    howToIntro: [
      {
        text: "Puoi ricopiare qualsiasi schema da rivista, libro o screenshot in meno di trenta secondi. L'inserimento manuale previene gli errori di scansione OCR causati da stampa sfocata o ombre, offrendo controlli istantanei:",
      },
    ],
    howToSteps: [
      [
        { text: "1. Inserisci gli indizi iniziali:", strong: true },
        { text: " Tocca una casella della griglia 9×9 e seleziona le cifre " },
        { text: "1–9", strong: true },
        { text: ". Su desktop spostati comodamente con i " },
        { text: "tasti freccia", strong: true },
        { text: " e digita o cancella direttamente da tastiera." },
      ],
      [
        { text: "2. Controlla i conflitti in tempo reale:", strong: true },
        {
          text: " Ogni cifra viene verificata subito su riga, colonna e riquadro 3×3. I duplicati si colorano in rosa tenue per correggere errori di trascrizione prima di bloccare lo schema.",
        },
      ],
      [
        { text: "3. Soglia dei 17 indizi e badge di difficoltà:", strong: true },
        { text: " Matematicamente un Sudoku 9×9 richiede almeno " },
        { text: "17 indizi", strong: true },
        {
          text: " per garantire una sola soluzione unica. Man mano che inserisci indizi, la barra classifica lo schema tra ",
        },
        { text: "Facile (45+ indizi)", strong: true },
        { text: ", " },
        { text: "Medio (35–44 indizi)", strong: true },
        { text: ", " },
        { text: "Difficile (28–34 indizi)", strong: true },
        { text: " ed " },
        { text: "Esperto (<28 indizi)", strong: true },
        { text: "." },
      ],
      [
        { text: "4. Blocca e scegli il percorso:", strong: true },
        { text: " Tocca " },
        { text: "Blocca e gioca", strong: true },
        { text: " quando gli indizi sono validi. Dalla barra azioni, premi " },
        { text: "Autorisolvi", strong: true },
        {
          text: " per calcolare lo schema completo—con distinzione tra soluzione unica e multipla—oppure ",
        },
        { text: "Gioca schema", strong: true },
        {
          text: " per risolverlo in autonomia e salvarlo nella ",
        },
        { text: "Cronologia personalizzata", strong: true },
        { text: "." },
      ],
    ],
    techniquesHeading: "Logica supportata e architettura dei pattern",
    techniquesIntro: [
      {
        text: "Il nostro motore non controlla soltanto se i numeri combaciano, ma valuta le reali deduzioni umane. Nei livelli Difficile ed Esperto analizza le strutture avanzate che sbloccano gli stalli più ostici:",
      },
    ],
    techniqueCards: [
      {
        title: "Stalli 0-Single e Coppie",
        body: [
          { text: "Gli schemi impegnativi creano intenzionalmente " },
          { text: "stalli 0-Single", strong: true },
          {
            text: " in cui la scansione diretta non offre mosse immediate. Servono ",
          },
          { text: "Pointing Pairs", strong: true },
          { text: ", " },
          { text: "Coppie Nude", strong: true },
          { text: " e " },
          { text: "Coppie Nascoste", strong: true },
          { text: " per ridurre i candidati finché non riappaiono nuovi singoli." },
        ],
      },
      {
        title: "Skyscraper & 2-String Kite",
        body: [
          { text: "Sotto " },
          { text: "Strict Digit Starvation", strong: true },
          {
            text: ", i riferimenti immediati scarseggiano. Collegando due coppie forti tramite uno ",
          },
          { text: "Skyscraper", strong: true },
          { text: " o un " },
          { text: "2-String Kite", strong: true },
          {
            text: " tra riga, colonna e riquadro si eliminano i candidati visibili da entrambe le estremità senza tirare a indovinare.",
          },
        ],
      },
      {
        title: "Rettangoli X-Wing",
        body: [
          {
            text: "Quando una cifra compare esattamente nelle stesse due colonne in due righe distinte (o viceversa), un ",
          },
          { text: "X-Wing", strong: true },
          {
            text: " forma un rettangolo logico che rimuove quel candidato dal resto delle due linee incrociate.",
          },
        ],
      },
      {
        title: "Perni Y-Wing (XY-Wing)",
        body: [
          {
            text: "Basato su tre celle bivalore (AB, AC e BC), uno ",
          },
          { text: "Y-Wing", strong: true },
          {
            text: " funge da cerniera logica: qualunque valore assuma il perno, ogni cella che vede entrambe le ali esclude subito la cifra C.",
          },
        ],
      },
    ],
    whyHeading: "Perché usare un Risolutore Sudoku?",
    whyIntro: [
      {
        text: "Un risolutore preciso non serve solo a sbloccare schemi fermi, ma supporta due obiettivi chiari in base alla tua esperienza:",
      },
    ],
    beginnersTitle: "Per chi sta imparando le tecniche",
    beginnersItems: [
      [
        { text: "Scopri gli errori subito:", strong: true },
        {
          text: " Individua all'istante duplicati in righe o riquadri mentre ricopi, evitando contraddizioni venti minuti più tardi.",
        },
      ],
      [
        { text: "Allenati senza spoiler:", strong: true },
        { text: " Con " },
        { text: "Gioca schema", strong: true },
        {
          text: " trasferisci gli schemi stampati su una griglia digitale pulita con note automatiche e cronologia annulla.",
        },
      ],
    ],
    expertsTitle: "Per esperti che verificano schemi ardui",
    expertsItems: [
      [
        { text: "Verifica unicità ed errori di stampa:", strong: true },
        {
          text: " Controlla subito se uno schema estremo da rivista possiede davvero una sola soluzione valida.",
        },
      ],
      [
        { text: "Convalida catene da 25 indizi:", strong: true },
        {
          text: " Verifica rapidamente le tue riduzioni finali e conserva gli schemi personalizzati nella cronologia locale o cloud.",
        },
      ],
    ],
    crossLinkPrefix:
      "Dopo aver analizzato uno schema complesso o esercitato le tue tecniche qui, mettiti alla prova nella ",
    crossLinkLabel: "Sfida del Giorno (Daily Challenge)",
    crossLinkSuffix:
      ". Ogni giocatore nel mondo riceve ogni giorno la stessa griglia generata deterministicamente, ideale per confrontare i tempi dal lunedì alla domenica e costruire la tua serie positiva.",
    crossLinkRulesPrefix: "Vuoi vedere diagrammi passo passo per X-Wing, Y-Wing, Pointing Pairs e scoprire i 7 Assistenti Smart integrati? Visita l'",
    crossLinkRulesLabel: "Hub Regole e Strategie Sudoku",
    crossLinkRulesSuffix: ".",
    keyboardHeading: "Flusso da tastiera su desktop: inserimento rapido e controlli di gioco",
    keyboardIntro: [
      {
        text: "Trascrivi qualsiasi schema da rivista o giornale in pochi secondi senza staccare le mani dalla tastiera. In fase di caricamento usi ",
      },
      { text: "frecce, 1–9 / tastierino numerico e Backspace / Canc / 0", strong: true },
      { text: ", mentre passando a " },
      { text: "Play Puzzle", strong: true },
      { text: " si attivano " },
      { text: "Spazio / N", strong: true },
      { text: " (appunti), " },
      { text: "Ctrl + Z / Cmd + Z", strong: true },
      { text: " (annulla) e " },
      { text: "H", strong: true },
      { text: " (suggerimento)." },
    ],
    keyboardCards: [
      {
        keys: "1–9 / Numpad 1–9",
        title: "Inserimento veloce cifre e indizi",
        desc: "Digita con la fila numerica superiore o il tastierino numerico laterale per impostare gli indizi o risolvere la griglia in Play Puzzle.",
      },
      {
        keys: "Backspace / Canc / 0",
        title: "Cancellazione immediata della cella",
        desc: "Hai sbagliato un numero copiando lo schema? Premi Backspace, Canc o 0 prima di Lock & Play per svuotare subito la cella.",
      },
      {
        keys: "Frecce • Tab / Esc",
        title: "Navigazione precisa senza mouse",
        desc: "Spostati fra righe e colonne con le frecce, muoviti tra i pulsanti con Tab e contorno di focus ben visibile, e chiudi i pannelli con Esc.",
      },
      {
        keys: "Spazio / N • Ctrl/Cmd+Z • H",
        title: "Scorciatoie complete in Play Puzzle",
        desc: "Avviata la modalità Play Puzzle sullo schema bloccato, attiva i candidati a matita con Spazio o N, annulla con Ctrl/Cmd + Z o richiedi un aiuto con H.",
      },
    ],
    faqHeading: "Domande frequenti sul Risolutore Sudoku",
    faqs: [
      {
        q: "Questo risolutore risolve schemi Esperto da 25 indizi?",
        a: [
          {
            text: "Sì. Che si tratti di uno schema semplice da 50 indizi o di una griglia Esperto da 25 indizi ricca di ",
          },
          { text: "Skyscraper", strong: true },
          { text: ", " },
          { text: "2-String Kite", strong: true },
          { text: ", " },
          { text: "X-Wing", strong: true },
          { text: " e " },
          { text: "Y-Wing", strong: true },
          {
            text: ", il motore bitmask risolve ogni griglia valida in pochi millisecondi.",
          },
        ],
      },
      {
        q: "Usa forza bruta o logica umana?",
        a: [
          { text: "SudokuSync unisce entrambi i punti di forza. Premendo " },
          { text: "Autorisolvi", strong: true },
          { text: ", un motore deterministico " },
          { text: "MRV bitmask", strong: true },
          {
            text: " propaga i vincoli e conta fino a due soluzioni per certificare l'unicità. Intanto, il nostro valutatore umano analizza ",
          },
          { text: "stalli 0-Single", strong: true },
          { text: ", " },
          { text: "Pointing Pairs", strong: true },
          { text: " e " },
          { text: "Coppie Nude/Nascoste", strong: true },
          { text: ", mentre con " },
          { text: "Gioca schema", strong: true },
          { text: " puoi allenarti su quelle stesse deduzioni." },
        ],
      },
      {
        q: "Perché servono almeno 17 indizi prima di bloccare?",
        a: [
          { text: "È matematicamente dimostrato che " },
          { text: "17 indizi", strong: true },
          {
            text: " sono il minimo indispensabile affinché un Sudoku 9×9 standard abbia una sola soluzione valida. Con 16 o meno esistono sempre più soluzioni possibili.",
          },
        ],
      },
      {
        q: "Cosa succede se lo schema non ha soluzione o ne ha molteplici?",
        a: [
          {
            text: "Qualsiasi violazione su riga, colonna o riquadro 3×3 viene segnalata all'istante. Se la ricerca profonda rileva nessuna soluzione, un banner chiaro ti permette di tornare su ",
          },
          { text: "Modifica indizi", strong: true },
          {
            text: ". Gli schemi con più soluzioni valide vengono contrassegnati chiaramente come ",
          },
          { text: "Soluzioni Multiple", strong: true },
          { text: "." },
        ],
      },
    ],
  },

  "pt-BR": {
    articleAriaLabel: "Solucionador de Sudoku Online Grátis e Diagnóstico Lógico",
    overviewHeading: "Solucionador de Sudoku Online Grátis & Diagnóstico Lógico",
    overviewP1: [
      {
        text: "Travou no meio de um Sudoku de jornal ou quer conferir um desafio personalizado extremo? O ",
      },
      { text: "Solucionador do SudokuSync", strong: true },
      {
        text: " transforma qualquer grade 9×9 válida em um painel de diagnóstico interativo na hora. Digite as pistas no celular ou computador, verifique a unicidade em milissegundos e escolha revelar tudo com ",
      },
      { text: "Resolver", strong: true },
      { text: " ou ir direto para " },
      { text: "Jogar puzzle", strong: true },
      { text: " com notas a lápis e cronômetro." },
    ],
    overviewP2: [
      {
        text: "Diferente de calculadoras simples que apenas jogam números na tela, nossa arquitetura une verificação determinística por máscara de bits ao avaliador lógico humano do SudokuSync—apontando conflitos antes de travar o tabuleiro e classificando a dificuldade real pela densidade de pistas e padrões exigidos.",
      },
    ],
    howToHeading: "Como usar o Solucionador de Sudoku grátis",
    howToIntro: [
      {
        text: "Você consegue transcrever qualquer puzzle impresso de livro, revista ou captura de tela em menos de trinta segundos. A entrada manual evita erros de leitura óptica (OCR) por papel borrado ou sombras e já valida tudo enquanto você digita:",
      },
    ],
    howToSteps: [
      [
        { text: "1. Insira suas pistas iniciais:", strong: true },
        { text: " Toque em qualquer célula da grade 9×9 e escolha dígitos de " },
        { text: "1 a 9", strong: true },
        { text: " no teclado. No desktop, navegue com as " },
        { text: "setas direcionais", strong: true },
        { text: " e digite ou apague números diretamente no teclado." },
      ],
      [
        { text: "2. Acompanhe a validação de conflitos em tempo real:", strong: true },
        {
          text: " Cada número é checado imediatamente na linha, coluna e bloco 3×3. Duplicatas ficam destacadas em rosa suave para corrigir erros de digitação antes de travar o jogo.",
        },
      ],
      [
        { text: "3. Limite de 17 pistas e selo de dificuldade:", strong: true },
        { text: " Matematicamente, um Sudoku 9×9 clássico precisa de pelo menos " },
        { text: "17 pistas", strong: true },
        {
          text: " para garantir solução única. Conforme você preenche, a barra classifica a grade em ",
        },
        { text: "Fácil (45+ pistas)", strong: true },
        { text: ", " },
        { text: "Médio (35–44 pistas)", strong: true },
        { text: ", " },
        { text: "Difícil (28–34 pistas)", strong: true },
        { text: " e " },
        { text: "Especialista (<28 pistas)", strong: true },
        { text: "." },
      ],
      [
        { text: "4. Trave e escolha seu caminho:", strong: true },
        { text: " Toque em " },
        { text: "Travar e jogar", strong: true },
        { text: " quando todas as pistas estiverem corretas. No painel travado, toque em " },
        { text: "Resolver", strong: true },
        {
          text: " para calcular e conferir solução única ou múltipla—ou toque em ",
        },
        { text: "Jogar puzzle", strong: true },
        {
          text: " para resolver no modo Solo e salvar no ",
        },
        { text: "Histórico próprio", strong: true },
        { text: "." },
      ],
    ],
    techniquesHeading: "Lógica compatível e arquitetura de padrões",
    techniquesIntro: [
      {
        text: "Nosso mecanismo não testa apenas se os números cabem—ele entende como jogadores experientes pensam. Nos níveis Difícil e Especialista, avalia estruturas reais de eliminação que desbloqueiam impasses:",
      },
    ],
    techniqueCards: [
      {
        title: "Bloqueios 0-Single & Pares",
        body: [
          { text: "Grades difíceis criam propositalmente " },
          { text: "bloqueios 0-Single", strong: true },
          {
            text: " em que a varredura básica não acha jogadas diretas. Superá-los exige encontrar ",
          },
          { text: "Pointing Pairs", strong: true },
          { text: ", " },
          { text: "Pares Nus", strong: true },
          { text: " e " },
          { text: "Pares Ocultos", strong: true },
          { text: " para limpar candidatos até surgirem novos Únicos." },
        ],
      },
      {
        title: "Skyscraper & 2-String Kite",
        body: [
          { text: "Sob " },
          { text: "Escassez Estrita de Dígitos (Strict Digit Starvation)", strong: true },
          {
            text: ", pistas fáceis ficam raras. Ligar dois pares fortes por meio de um ",
          },
          { text: "Skyscraper", strong: true },
          { text: " ou um " },
          { text: "2-String Kite", strong: true },
          {
            text: " entre linha, coluna e bloco elimina candidatos visíveis pelas duas pontas sem chutes.",
          },
        ],
      },
      {
        title: "Alinhamentos retangulares X-Wing",
        body: [
          {
            text: "Quando um dígito aparece estritamente nas mesmas duas colunas em duas linhas distintas (ou vice-versa), um ",
          },
          { text: "X-Wing", strong: true },
          {
            text: " forma um retângulo lógico—removendo esse candidato do restante das duas linhas cruzadas.",
          },
        ],
      },
      {
        title: "Pivôs Y-Wing (XY-Wing)",
        body: [
          {
            text: "Formado por três casas bivaloradas com pares AB, AC e BC, um ",
          },
          { text: "Y-Wing", strong: true },
          {
            text: " funciona como dobradiça lógica: qualquer valor que o pivô assuma, toda casa que enxerga as duas asas descarta o dígito C.",
          },
        ],
      },
    ],
    whyHeading: "Por que usar um Solucionador de Sudoku?",
    whyIntro: [
      {
        text: "Um solucionador dedicado vai muito além de mostrar respostas—ele desempenha dois papéis claros conforme seu nível:",
      },
    ],
    beginnersTitle: "Para iniciantes aprendendo padrões",
    beginnersItems: [
      [
        { text: "Pegue erros de digitação cedo:", strong: true },
        {
          text: " Identifique duplicatas sutis em blocos ou colunas na hora de copiar, evitando descobrir uma contradição vinte minutos depois.",
        },
      ],
      [
        { text: "Pratique sem spoilers:", strong: true },
        { text: " Use " },
        { text: "Jogar puzzle", strong: true },
        {
          text: " para passar grades impressas para um tabuleiro digital limpo com notas automáticas e histórico de desfazer.",
        },
      ],
    ],
    expertsTitle: "Para especialistas auditando tabuleiros",
    expertsItems: [
      [
        { text: "Verifique unicidade e erros de impressão:", strong: true },
        {
          text: " Confirme antes de investir tempo se um puzzle de livro muito esparso realmente possui uma única solução válida.",
        },
      ],
      [
        { text: "Audite grades de 25 pistas rápido:", strong: true },
        {
          text: " Confira suas deduções finais e mantenha seus tabuleiros personalizados organizados no histórico local ou na nuvem.",
        },
      ],
    ],
    crossLinkPrefix:
      "Depois de auditar um tabuleiro difícil ou treinar padrões por aqui, teste suas habilidades no ",
    crossLinkLabel: "Desafio Diário (Daily Challenge)",
    crossLinkSuffix:
      ". Todos os jogadores no mundo recebem exatamente a mesma grade gerada de forma determinística a cada dia—ideal para comparar tempos de segunda a domingo e construir uma sequência diária.",
    crossLinkRulesPrefix: "Quer ver diagramas passo a passo de X-Wing, Y-Wing, Pares Apontadores e conferir todos os 7 Assistentes Inteligentes? Acesse o ",
    crossLinkRulesLabel: "Guia de Regras e Estratégias do Sudoku",
    crossLinkRulesSuffix: ".",
    keyboardHeading: "Atalhos de teclado no desktop: preenchimento rápido e controles do modo jogo",
    keyboardIntro: [
      {
        text: "Digite qualquer grade de revista ou jornal em segundos sem tirar as mãos do teclado. Na entrada de pistas, use ",
      },
      { text: "setas, 1–9 / teclado numérico e Backspace / Delete / 0", strong: true },
      { text: "; ao alternar para " },
      { text: "Play Puzzle", strong: true },
      { text: ", você também ganha " },
      { text: "Espaço / N", strong: true },
      { text: " (rascunho), " },
      { text: "Ctrl + Z / Cmd + Z", strong: true },
      { text: " (desfazer) e " },
      { text: "H", strong: true },
      { text: " (dica)." },
    ],
    keyboardCards: [
      {
        keys: "1–9 / Numpad 1–9",
        title: "Entrada ágil de pistas e dígitos",
        desc: "Funciona tanto com a linha superior de números quanto com o teclado numérico (Numpad) para preencher ou resolver a grade 9×9.",
      },
      {
        keys: "Backspace / Delete / 0",
        title: "Limpeza imediata da célula",
        desc: "Digitou uma pista errada? Pressione Backspace, Delete ou 0 antes de tocar em Lock & Play para limpar o conflito na hora.",
      },
      {
        keys: "Setas • Tab / Esc",
        title: "Navegação completa sem mouse",
        desc: "Percorra linhas e colunas com as setas direcionais, navegue pelos botões via Tab com destaque de foco nítido e feche painéis com Esc.",
      },
      {
        keys: "Espaço / N • Ctrl/Cmd+Z • H",
        title: "Atalhos completos no Play Puzzle",
        desc: "Após travar a grade e abrir Play Puzzle, alterne notas a lápis com Espaço ou N, desfaça jogadas com Ctrl/Cmd + Z e peça dica com H.",
      },
    ],
    faqHeading: "Perguntas frequentes sobre o Solucionador",
    faqs: [
      {
        q: "Este solucionador resolve tabuleiros Especialista de 25 pistas?",
        a: [
          {
            text: "Sim. Seja um aquecimento de 50 pistas ou uma grade Especialista de 25 pistas repleta de ",
          },
          { text: "Skyscraper", strong: true },
          { text: ", " },
          { text: "2-String Kite", strong: true },
          { text: ", " },
          { text: "X-Wing", strong: true },
          { text: " e " },
          { text: "Y-Wing", strong: true },
          {
            text: ", nosso motor bitmask resolve tabuleiros válidos em milissegundos.",
          },
        ],
      },
      {
        q: "Ele usa força bruta cega ou lógica humana?",
        a: [
          { text: "O SudokuSync combina as duas forças. Ao tocar em " },
          { text: "Resolver", strong: true },
          { text: ", um motor determinístico " },
          { text: "MRV bitmask", strong: true },
          {
            text: " propaga restrições e conta até duas soluções válidas para comprovar unicidade. Enquanto isso, nosso avaliador humano analisa ",
          },
          { text: "bloqueios 0-Single", strong: true },
          { text: ", " },
          { text: "Pointing Pairs", strong: true },
          { text: " e " },
          { text: "Pares Nus/Ocultos", strong: true },
          { text: "—e tocar em " },
          { text: "Jogar puzzle", strong: true },
          { text: " permite treinar essas exatas deduções." },
        ],
      },
      {
        q: "Por que o puzzle precisa ter no mínimo 17 pistas antes de travar?",
        a: [
          { text: "Por prova matemática, " },
          { text: "17 pistas", strong: true },
          {
            text: " é o mínimo necessário para um Sudoku 9×9 padrão preservar uma única solução válida. Com 16 ou menos sempre existem múltiplas respostas possíveis.",
          },
        ],
      },
      {
        q: "O que acontece se o meu puzzle for impossível ou tiver várias soluções?",
        a: [
          {
            text: "Qualquer conflito em linha, coluna ou bloco 3×3 é destacado na hora. Se não houver duplicatas aparentes mas a propagação provar que não há solução, um aviso orienta a tocar em ",
          },
          { text: "Editar pistas", strong: true },
          {
            text: ". Grades com mais de uma solução válida recebem claramente o rótulo ",
          },
          { text: "Múltiplas Soluções", strong: true },
          { text: "." },
        ],
      },
    ],
  },
};

export function getSolverArticleCopy(lang?: string | null): SolverArticleCopy {
  const normalized = (lang || "en").trim().toLowerCase();
  if (normalized === "hi" || normalized.startsWith("hi-")) {
    return SOLVER_ARTICLE_TRANSLATIONS.hi;
  }
  if (normalized === "de" || normalized.startsWith("de-")) {
    return SOLVER_ARTICLE_TRANSLATIONS.de;
  }
  if (normalized === "ja" || normalized.startsWith("ja-")) {
    return SOLVER_ARTICLE_TRANSLATIONS.ja;
  }
  if (normalized === "ko" || normalized.startsWith("ko-")) {
    return SOLVER_ARTICLE_TRANSLATIONS.ko;
  }
  if (normalized === "es" || normalized.startsWith("es-")) {
    return SOLVER_ARTICLE_TRANSLATIONS.es;
  }
  if (normalized === "fr" || normalized.startsWith("fr-")) {
    return SOLVER_ARTICLE_TRANSLATIONS.fr;
  }
  if (normalized === "it" || normalized.startsWith("it-")) {
    return SOLVER_ARTICLE_TRANSLATIONS.it;
  }
  if (normalized === "pt-br" || normalized.startsWith("pt")) {
    return SOLVER_ARTICLE_TRANSLATIONS["pt-BR"];
  }
  return SOLVER_ARTICLE_TRANSLATIONS.en;
}

