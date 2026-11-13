export interface DailyRichSegment {
  text: string;
  strong?: boolean;
  code?: boolean;
}

export type DailyRichText = readonly DailyRichSegment[];

export interface DailyTierCardCopy {
  title: string;
  body: DailyRichText;
}

export interface DailyFaqCopy {
  q: string;
  a: DailyRichText;
}

export interface DailyKeyboardShortcutCopy {
  keys: string;
  title: string;
  desc: string;
}

export interface DailyArticleCopy {
  articleAriaLabel: string;
  whatIsHeading: string;
  whatIsP1: DailyRichText;
  whatIsP2: DailyRichText;
  whatIsBullets: readonly DailyRichText[];
  scalingHeading: string;
  scalingIntro: DailyRichText;
  scalingTiers: readonly [
    DailyTierCardCopy,
    DailyTierCardCopy,
    DailyTierCardCopy,
    DailyTierCardCopy
  ];
  sundayMasterCard: DailyTierCardCopy;
  crossLinkPrefix: string;
  crossLinkLabel: string;
  crossLinkSuffix: string;
  streakHeading: string;
  streakP1: DailyRichText;
  streakP2: DailyRichText;
  streakBullets: readonly [DailyRichText, DailyRichText];
  keyboardHeading: string;
  keyboardIntro: DailyRichText;
  keyboardShortcuts: readonly [
    DailyKeyboardShortcutCopy,
    DailyKeyboardShortcutCopy,
    DailyKeyboardShortcutCopy,
    DailyKeyboardShortcutCopy,
    DailyKeyboardShortcutCopy,
    DailyKeyboardShortcutCopy
  ];
  faqHeading: string;
  faqs: readonly DailyFaqCopy[];
}

export type DailyArticleLocale =
  | "en"
  | "hi"
  | "de"
  | "ja"
  | "ko"
  | "es"
  | "fr"
  | "it"
  | "pt-BR";

export const DAILY_ARTICLE_TRANSLATIONS: Record<
  DailyArticleLocale,
  DailyArticleCopy
> = {
  en: {
    articleAriaLabel: "Daily Sudoku Challenge Guide and Difficulty Schedule",
    whatIsHeading: "What is the Daily Sudoku Challenge?",
    whatIsP1: [
      { text: "The " },
      { text: "Daily Sudoku Challenge", strong: true },
      {
        text: " is a globally synchronized daily logic benchmark designed so every solver—whether playing in a desktop browser, on a tablet, or in our Android app—confronts the exact same 9×9 grid on a given calendar day. Rather than serving random uncalibrated puzzles per user, our generator binds each date string (",
      },
      { text: "SUDOKU_DAILY:YYYY-MM-DD", code: true },
      { text: ") to a deterministic cryptographic-style pipeline combining " },
      { text: "32-bit FNV-1a string hashing", strong: true },
      { text: ", a " },
      { text: "Murmur3 avalanche mixer", strong: true },
      { text: ", and a pure " },
      { text: "mulberry32", strong: true },
      { text: " pseudo-random number generator." },
    ],
    whatIsP2: [
      { text: "Because " },
      { text: "mulberry32", strong: true },
      {
        text: " produces an identical sequence of numbers from the same integer seed on every CPU architecture, every player worldwide receives the identical clue coordinates, identical candidate choke points, and the exact same unique solution. That strict determinism eliminates luck-of-the-draw bias: when you compare completion times with friends or climb the global Top-20 leaderboard, faster times come strictly from sharper scanning, cleaner notation, and deeper logical foresight.",
      },
    ],
    whatIsBullets: [
      [
        { text: "Deterministic Global Parity:", strong: true },
        {
          text: " Every device synthesizes the same 81-cell layout directly from the date seed, ensuring instant offline availability and zero discrepancy between web and mobile.",
        },
      ],
      [
        { text: "Standardized Tournament Ruleset:", strong: true },
        {
          text: " All Daily boards enforce a live elapsed timer and a strict three-mistake limit, transforming an everyday solo grid into an equitable global competition and synchronized Friends Daily Race.",
        },
      ],
    ],
    scalingHeading:
      "Weekly Difficulty Scaling: From Monday Singles to Weekend Chains",
    scalingIntro: [
      {
        text: "Great puzzle publications build rhythm across the week instead of flat difficulty. Our Daily engine mirrors a progressive seven-day cadence—starting with approachable visual cross-hatching on Monday and culminating in sparse, tournament-caliber boards containing intentional ",
      },
      { text: "0-Single Dead-Ends", strong: true },
      { text: " and multi-unit " },
      { text: "Skyscraper chains", strong: true },
      { text: " by Saturday and Sunday:" },
    ],
    scalingTiers: [
      {
        title: "Monday — Easy Warm-Up (51 Clues)",
        body: [
          {
            text: "Engineered for brisk scanning with balanced 3×3 box distribution. Every step resolves cleanly through ",
          },
          { text: "Naked Singles", strong: true },
          { text: " and " },
          { text: "Hidden Singles", strong: true },
          {
            text: " without requiring pencil marks, helping players warm up speed and accuracy at the start of the week.",
          },
        ],
      },
      {
        title: "Tuesday & Wednesday — Medium Flow (39 Clues)",
        body: [
          {
            text: "Drops the board to 42 empty cells so single-digit scans thin out naturally mid-game. Players transition into box-line interactions, ",
          },
          { text: "Pointing Pairs", strong: true },
          {
            text: ", and disciplined candidate notation while preserving steady solve momentum.",
          },
        ],
      },
      {
        title: "Thursday & Friday — Hard Bottlenecks (30 Clues)",
        body: [
          {
            text: "Evaluated with our Human-Logic bottleneck checker to force authentic ",
          },
          { text: "0-Single Dead-Ends", strong: true },
          {
            text: " where every row, column, and box stops offering immediate digits. Advancing requires ",
          },
          { text: "Locked Candidates", strong: true },
          { text: ", " },
          { text: "Naked/Hidden Pairs", strong: true },
          { text: ", and " },
          { text: "Triples", strong: true },
          { text: "." },
        ],
      },
      {
        title: "Saturday — Expert Starvation (25 Clues)",
        body: [
          { text: "Applies " },
          { text: "Strict Digit Starvation", strong: true },
          {
            text: " so high-frequency anchors are withheld early. Breaking through Saturday's bottlenecks demands long-range elimination techniques including ",
          },
          { text: "Skyscraper chains", strong: true },
          { text: ", " },
          { text: "2-String Kites", strong: true },
          { text: ", " },
          { text: "X-Wings", strong: true },
          { text: ", and " },
          { text: "Y-Wings", strong: true },
          { text: "." },
        ],
      },
    ],
    sundayMasterCard: {
      title: "Sunday — Master Capstone (23 Clues)",
      body: [
        {
          text: "Reserved for Sunday's showcase gauntlet with only 23 clues and 58 open squares. Verified via bitmask MRV uniqueness checks and anti-single mutation passes, Sunday Master grids test sustained pencil-mark pruning, alternating inference chains, and deep Skyscraper eliminations from start to finish.",
        },
      ],
    },
    crossLinkPrefix:
      "If you ever get stuck halfway through a tricky newspaper puzzle or want to audit whether a custom 25-clue board holds a single unique solution before practicing chains like Skyscrapers or X-Wings, try loading it into our ",
    crossLinkLabel: "Free Sudoku Solver",
    crossLinkSuffix:
      " to inspect conflicts in real time, verify uniqueness, or play through the grid interactively.",
    streakHeading: "Building a Daily Streak & Brain-Training Habit",
    streakP1: [
      {
        text: "Committing five to fifteen minutes a day to structured deductive reasoning is one of the simplest ways to keep executive cognition sharp. Unlike twitch-based mobile games built on sensory overload, Sudoku engages ",
      },
      { text: "working memory", strong: true },
      { text: ", " },
      { text: "sustained selective attention", strong: true },
      { text: ", and " },
      { text: "spatial pattern recognition", strong: true },
      {
        text: " in a calm, deliberate loop. Practicing consistently across all seven tiers trains your eye to spot conjugate pairs and intersecting line eliminations before consciously scanning individual cells.",
      },
    ],
    streakP2: [
      {
        text: "Our streak architecture is deliberately crafted to reward genuine daily consistency while letting you catch up on missed puzzles at your own pace:",
      },
    ],
    streakBullets: [
      [
        { text: "Authentic Streak Accounting:", strong: true },
        { text: " Solving today's puzzle on its active calendar date extends your " },
        { text: "Current Streak", strong: true },
        { text: " and updates your all-time " },
        { text: "Longest Streak", strong: true },
        {
          text: ". Archive completions add to your Total Solved mastery count without artificially padding consecutive-day streaks.",
        },
      ],
      [
        { text: "Cross-Device Sync & Vault Isolation:", strong: true },
        {
          text: " Signing in keeps your calendar records, solve times, and streak milestones backed up in Cloud Firestore, while Guest sessions store history in an isolated local vault with zero account leakage.",
        },
      ],
    ],
    keyboardHeading: "Desktop Speed-Solving: Keyboard Controls for Daily Rankings",
    keyboardIntro: [
      {
        text: "Breaking into the ",
      },
      { text: "Top-20 Daily Speed Leaderboard", strong: true },
      {
        text: " requires zero wasted cursor travel. Every active Daily Challenge puzzle supports all six core desktop shortcuts so you can scan candidates, enter digits, and undo misclicks cleanly without lifting your hands:",
      },
    ],
    keyboardShortcuts: [
      {
        keys: "1–9 / Numpad 1–9",
        title: "Dual-Zone Digit Entry",
        desc: "Enter solved values or candidate pencil digits smoothly using either top-row numbers or your dedicated Numpad.",
      },
      {
        keys: "Backspace / Delete",
        title: "Zero-Friction Erase",
        desc: "Clear tentative pencil marks or wipe an unverified cell immediately without reaching for an on-screen button.",
      },
      {
        keys: "Ctrl + Z / Cmd + Z",
        title: "Single-Tap Undo",
        desc: "Step back through move history instantaneously on Windows, Linux, or macOS without breaking your solving cadence.",
      },
      {
        keys: "Spacebar / N",
        title: "Pencil Notes Toggle",
        desc: "Flip between normal digit entry and candidate pencil mode on the fly—Spacebar captures focus cleanly without scrolling the page.",
      },
      {
        keys: "H",
        title: "Logical Hint Check",
        desc: "Need a nudge on Sunday Expert tiers? Press H to trigger a targeted Hint right from the grid.",
      },
      {
        keys: "Arrow Keys • Tab / Esc",
        title: "Keyboard & Menu Navigation",
        desc: "Glide across cells with Up/Down/Left/Right arrows, switch modal choices with arrows, and follow clear pastel focus outlines via Tab.",
      },
    ],
    faqHeading: "Daily Challenge Frequently Asked Questions",
    faqs: [
      {
        q: "How are Daily Challenge scoring and rankings calculated?",
        a: [
          {
            text: "Your Daily Challenge score centers on solving cleanly without hitting the 3-mistake ceiling. On the global Top-20 leaderboard and Friends Daily Race standings, players who complete the board are ranked primarily by ",
          },
          { text: "fastest elapsed solve time", strong: true },
          {
            text: ", with fewer mistakes and clean zero-hint solves acting as natural performance benchmarks.",
          },
        ],
      },
      {
        q: "Can I play past daily challenges I missed?",
        a: [
          {
            text: "Yes. Every prior date in the Mon–Sun monthly calendar remains permanently unlocked through ",
          },
          { text: "Archive Play", strong: true },
          {
            text: ". Clicking any missed date generates the exact deterministic puzzle from that historical calendar key and increments your Total Solved count upon completion, while excluding archive runs from streak calculations.",
          },
        ],
      },
      {
        q: "Are the daily puzzles created by AI or deterministic human logic?",
        a: [
          {
            text: "They are built with deterministic math and human deduction rules—never generative AI guesses. Each board uses a date-seeded ",
          },
          { text: "mulberry32", strong: true },
          { text: " PRNG combined with our " },
          { text: "humanDifficultyEngine", strong: true },
          {
            text: ", verifying mathematical uniqueness via bitmask MRV backtracking and enforcing real human-solvable barriers such as ",
          },
          { text: "0-Single Dead-Ends", strong: true },
          { text: ", " },
          { text: "Skyscraper chains", strong: true },
          { text: ", and " },
          { text: "2-String Kites", strong: true },
          { text: "." },
        ],
      },
      {
        q: "What happens if I make 3 mistakes on today's challenge?",
        a: [
          {
            text: "Making a third mistake ends the official competitive run for that date as ",
          },
          { text: "Failed (3/3)", strong: true },
          {
            text: " to preserve leaderboard fairness. Because the calendar locks official scores per day, consistent note taking and patient verification before placing digits are rewarded on harder Thursday–Sunday grids.",
          },
        ],
      },
    ],
  },

  hi: {
    articleAriaLabel: "Daily Sudoku Challenge गाइड और वीकली डिफिकल्टी शेड्यूल",
    whatIsHeading: "Daily Sudoku Challenge क्या है?",
    whatIsP1: [
      { text: "" },
      { text: "Daily Sudoku Challenge", strong: true },
      {
        text: " एक ग्लोबल सिंक्रोनाइज़्ड लॉजिक बेंचमार्क है, ताकि हर प्लेयर—चाहे डेस्कटॉप ब्राउज़र पर हो, टैबलेट पर हो या हमारे Android ऐप पर—किसी भी तारीख को बिल्कुल एक जैसा 9×9 ग्रिड खेले। हर यूज़र को अलग-अलग रैंडम बोर्ड देने के बजाय हमारा जनरेटर उस दिन की तारीख (",
      },
      { text: "SUDOKU_DAILY:YYYY-MM-DD", code: true },
      { text: ") को एक डिटरमिनिस्टिक पाइपलाइन से जोड़ता है जिसमें " },
      { text: "32-bit FNV-1a हैशिंग", strong: true },
      { text: ", " },
      { text: "Murmur3 एवलांच मिक्सर", strong: true },
      { text: " और प्योर " },
      { text: "mulberry32 seeding", strong: true },
      { text: " शामिल है।" },
    ],
    whatIsP2: [
      { text: "क्योंकि " },
      { text: "mulberry32", strong: true },
      {
        text: " एक ही नंबर सीड से हर डिवाइस और हर प्रोसेसर पर बिल्कुल सेम सीक्वेंस बनाता है, इसलिए दुनियाभर के सभी खिलाड़ियों को एकदम बराबर क्ल्यूज़, बराबर बॉटलनेक्स और वही एक यूनिक सॉल्यूशन मिलता है। इस सख्त सिंक्रोनाइज़ेशन से लक फैक्टर खत्म हो जाता है—जब आप दोस्तों से टाइम कम्पेयर करते हैं या ग्लोबल Top-20 लीडरबोर्ड पर चढ़ते हैं, तो तेज टाइम सिर्फ आपकी स्कैनिंग स्पीड, क्लीन नोट्स और शार्प लॉजिक की वजह से आता है।",
      },
    ],
    whatIsBullets: [
      [
        { text: "100% ग्लोबल सीड पैरिटी:", strong: true },
        {
          text: " हर डिवाइस सीधे उस दिन के डेट-सीड से वही 81-सेल लेआउट तैयार करता है—जिससे ऑफलाइन भी इंस्टेंट गेम शुरू होता है और वेब व मोबाइल में कोई फर्क नहीं आता।",
        },
      ],
      [
        { text: "स्टैंडर्ड टूर्नामेंट रूल्स:", strong: true },
        {
          text: " हर Daily बोर्ड पर लाइव टाइमर और सख्त 3-मिस्टेक लिमिट लागू होती है, जो रोज़ की सोलो पज़ल को एक फेयर ग्लोबल कॉम्पिटिशन और Friends Daily Race में बदल देती है।",
        },
      ],
    ],
    scalingHeading:
      "वीकली डिफिकल्टी स्केलिंग: Monday सिंगल्स से Weekend चेन्स तक",
    scalingIntro: [
      {
        text: "बेहतरीन पज़ल प्लैटफ़ॉर्म पूरे हफ्ते एक जैसी फ्लैट कठिनाई रखने के बजाय शानदार रिदम बनाते हैं। हमारा Daily इंजन सोमवार से रविवार का प्रोग्रेसिव ग्राफ फॉलो करता है—सोमवार को आसान स्कैनिंग से शुरू होकर शनिवार-रविवार को जानबूझकर बनाए गए ",
      },
      { text: "0-Single Dead-Ends", strong: true },
      { text: " और एडवांस्ड " },
      { text: "Skyscraper", strong: true },
      { text: " चेन्स तक पहुंचता है:" },
    ],
    scalingTiers: [
      {
        title: "सोमवार (Monday) — Easy वॉर्म-अप (51 क्ल्यूज़)",
        body: [
          {
            text: "सप्ताह की तेज़ और स्मूद शुरुआत के लिए बैलेंस्ड 3×3 बॉक्स डिस्ट्रीब्यूशन के साथ डिज़ाइन किया गया है। इसमें पेंसिल नोट्स के बिना भी हर स्टेप ",
          },
          { text: "Naked Singles", strong: true },
          { text: " और " },
          { text: "Hidden Singles", strong: true },
          { text: " से आसानी से खुलता है।" },
        ],
      },
      {
        title: "मंगलवार और बुधवार — Medium फ्लो (39 क्ल्यूज़)",
        body: [
          {
            text: "यहाँ 42 सेल्स खाली रहती हैं जिससे गेम के बीच में सीधी स्कैनिंग थोड़ी कम होने लगती है। स्पीड बनाए रखने के लिए आपको बॉक्स-लाइन इंटरैक्शन, ",
          },
          { text: "Pointing Pairs", strong: true },
          {
            text: " और सटीक कैंडिडेट नोट्स का इस्तेमाल करना होता है।",
          },
        ],
      },
      {
        title: "गुरुवार और शुक्रवार — Hard बॉटलनेक्स (30 क्ल्यूज़)",
        body: [
          {
            text: "हमारे ह्यूमन-लॉजिक बॉटलनेक चेकर से पास होकर ये ग्रिड असली ",
          },
          { text: "0-Single Dead-Ends", strong: true },
          {
            text: " बनाते हैं, जहाँ कोई भी सेल सीधे नहीं भरती। आगे बढ़ने के लिए ",
          },
          { text: "Locked Candidates", strong: true },
          { text: ", " },
          { text: "Naked/Hidden Pairs", strong: true },
          { text: " और " },
          { text: "Triples", strong: true },
          { text: " ज़रूरी होते हैं।" },
        ],
      },
      {
        title: "शनिवार (Saturday) — Expert स्टार्वेशन (25 क्ल्यूज़)",
        body: [
          { text: "यहाँ " },
          { text: "Strict Digit Starvation", strong: true },
          {
            text: " लागू होता है जिससे आसान नंबर बहुत कम मिलते हैं। शनिवार का लॉक तोड़ने के लिए ",
          },
          { text: "Skyscraper", strong: true },
          { text: ", " },
          { text: "2-String Kites", strong: true },
          { text: ", " },
          { text: "X-Wings", strong: true },
          { text: " और " },
          { text: "Y-Wings", strong: true },
          { text: " जैसी लॉन्ग-रेंज चेन्स लगानी पड़ती हैं।" },
        ],
      },
    ],
    sundayMasterCard: {
      title: "रविवार (Sunday) — Master कैपस्टोन (23 क्ल्यूज़)",
      body: [
        {
          text: "सिर्फ 23 क्ल्यूज़ और 58 खाली खानों के साथ रविवार का Master लेवल हफ्ते की सबसे बड़ी परीक्षा है। बिटमास्क MRV यूनिकनेस चेक और एंटी-सिंगल म्यूटेशन के बाद बने ये बोर्ड पूरे गेम में सटीक नोट्स प्रूनिंग, अल्टरनेटिंग चेन्स और गहरे Skyscraper एलिमिनेशन्स टेस्ट करते हैं।",
        },
      ],
    },
    crossLinkPrefix:
      "अगर आप कभी अख़बार की किसी मुश्किल पज़ल के बीच अटक जाएं या 25-क्ल्यू वाले किसी कस्टम ग्रिड पर Skyscraper व X-Wing लगाने से पहले उसका यूनिक सॉल्यूशन चेक करना चाहें, तो उसे हमारे ",
    crossLinkLabel: "फ्री सुडोकू सॉल्वर (Sudoku Solver)",
    crossLinkSuffix:
      " में डालकर तुरंत कन्फ्लिक्ट देख सकते हैं, यूनिकनेस कन्फर्म कर सकते हैं या बोर्ड को इंटरैक्टिव तरीके से खेल सकते हैं।",
    streakHeading: "Daily Streak बनाना और ब्रेन-ट्रेनिंग की आदत",
    streakP1: [
      {
        text: "रोज़ाना 5 से 15 मिनट स्ट्रक्चर्ड डिडक्टिव लॉजिक को देना दिमाग को शार्प रखने का सबसे असरदार और आसान तरीका है। शोर-शराबे वाले रिफ्लेक्स गेम्स के बजाय सुडोकू शांत माहौल में आपकी ",
      },
      { text: "वर्किंग मेमोरी", strong: true },
      { text: ", " },
      { text: "गहरे फोकस (Selective Attention)", strong: true },
      { text: " और " },
      { text: "स्पेशियल पैटर्न पहचान", strong: true },
      {
        text: " को मजबूत करता है। हफ्ते के सातों लेवल रोज़ खेलने से आपकी नज़र अपने आप कॉन्जुगेट पेयर्स और क्रॉस-लाइन एलिमिनेशन्स पकड़ने लगती है।",
      },
    ],
    streakP2: [
      {
        text: "हमारा Streak सिस्टम असली डेली कंसिस्टेंसी को ईमानदारी से रिवॉर्ड करने के लिए बनाया गया है, साथ ही छूटे हुए दिनों की प्रैक्टिस भी आसान रखता है:",
      },
    ],
    streakBullets: [
      [
        { text: "असली Streak कैलकुलेशन:", strong: true },
        { text: " आज की पज़ल को उसी कैलेंडर डेट पर सॉल्व करने से आपकी " },
        { text: "Current Streak", strong: true },
        { text: " बढ़ती है और ऑल-टाइम " },
        { text: "Longest Streak", strong: true },
        {
          text: " अपडेट होती है। पुरानी तारीखों के Archive Play से Total Solved काउंट जरूर बढ़ता है, लेकिन लगातार दिनों की Streak फर्जी तरीके से नहीं बढ़ती।",
        },
      ],
      [
        { text: "क्रॉस-डिवाइस सिंक और वॉल्ट आइसोलेशन:", strong: true },
        {
          text: " लॉगिन करने पर आपका पूरा कैलेंडर रिकॉर्ड, सॉल्व टाइम और Streak माइलस्टोन Cloud Firestore में सेफ रहते हैं, जबकि Guest सेशन बिल्कुल अलग लोकल वॉल्ट में रहता है ताकि कोई डेटा मिक्स न हो।",
        },
      ],
    ],
    keyboardHeading: "डेस्कटॉप स्पीड-सॉल्विंग: Daily Rankings के लिए कीबोर्ड कंट्रोल्स",
    keyboardIntro: [
      { text: "अगर आपका लक्ष्य " },
      { text: "Top-20 डेली लीडरबोर्ड", strong: true },
      {
        text: " में जगह बनाना है, तो माउस क्लिक करने में सेकंड्स बर्बाद न करें। Daily Challenge बोर्ड पर सभी 6 डेस्कटॉप कीबोर्ड शॉर्टकट्स चलते हैं—जिससे तेज़ नंबर एंट्री और क्लीन अनडू सब हाथ के नीचे रहता है:",
      },
    ],
    keyboardShortcuts: [
      {
        keys: "1–9 / Numpad 1–9",
        title: "फ़ास्ट डिजिट एंट्री",
        desc: "टॉप नंबर-रो या डेडिकेटेड Numpad—दोनों से फाइनल डिजिट्स और कैंडिडेट नोट्स बिजली की रफ्तार से भरें।",
      },
      {
        keys: "Backspace / Delete",
        title: "तुरंत सेल इरेज़",
        desc: "गलत नंबर या पुराने पेंसिल नोट को बिना माउस हिलाए एक की-प्रेस में साफ़ करें।",
      },
      {
        keys: "Ctrl + Z / Cmd + Z",
        title: "इंस्टैंट अनडू",
        desc: "गलत क्लिक हो जाए तो Windows/Linux पर Ctrl + Z या Mac पर Cmd + Z से तुरंत पिछली स्टेप पर लौटें।",
      },
      {
        keys: "Spacebar / N",
        title: "Pencil Notes टॉगल",
        desc: "नॉर्मल एंट्री और पेंसिल नोट्स मोड के बीच तुरंत स्विच करें—Spacebar बिना पेज स्क्रॉल किए स्मार्ट तरीके से काम करता है।",
      },
      {
        keys: "H",
        title: "तुरंत Hint पाएं",
        desc: "रविवार के Expert बोर्ड पर कहीं अटक जाएं तो H दबाकर सुरक्षित रूप से लॉजिकल Hint चेक करें।",
      },
      {
        keys: "Arrow Keys • Tab / Esc",
        title: "स्मूद ग्रिड और मेन्यू मूवमेंट",
        desc: "एरो कीज़ से 9×9 ग्रिड और पॉपअप ऑप्शंस में ऊपर-नीचे जाएं, और साफ़ :focus-visible रिंग के साथ Tab से पूरा इंटरफ़ेस कंट्रोल करें।",
      },
    ],
    faqHeading: "Daily Challenge से जुड़े आम सवाल (FAQs)",
    faqs: [
      {
        q: "Daily Challenge की स्कोरिंग और रैंकिंग कैसे तय होती है?",
        a: [
          {
            text: "आपकी Daily परफॉर्मेंस इस पर निर्भर करती है कि आप 3-मिस्टेक लिमिट पार किए बिना कितनी सफाई से बोर्ड पूरा करते हैं। ग्लोबल Top-20 लीडरबोर्ड और Friends Daily Race में खिलाड़ियों की रैंक मुख्य रूप से ",
          },
          { text: "सबसे कम सॉल्व टाइम (Fastest Time)", strong: true },
          {
            text: " पर तय होती है, जहाँ कम गलतियाँ और बिना हिंट वाली जीत आपकी एक्यूरेसी दिखाती हैं।",
          },
        ],
      },
      {
        q: "क्या मैं पिछले छूटे हुए Daily Challenge दोबारा खेल सकता हूँ?",
        a: [
          {
            text: "हाँ, बिल्कुल। सोम-से-रवि कैलेंडर में बीती हुई हर तारीख ",
          },
          { text: "Archive Play", strong: true },
          {
            text: " के ज़रिए हमेशा अनलॉक रहती है। किसी भी पुरानी डेट पर क्लिक करने से उसी दिन का सटीक डिटरमिनिस्टिक बोर्ड खुलता है और जीतने पर आपका Total Solved काउंट बढ़ता है (सिर्फ Streak में काउंट नहीं होता)।",
          },
        ],
      },
      {
        q: "क्या ये डेली पज़ल्स AI बनाती है या ह्यूमन लॉजिक से जनरेट होती हैं?",
        a: [
          {
            text: "ये पूरी तरह डिटरमिनिस्टिक गणित और ह्यूमन डिडक्शन रूल्स से बनती हैं—रैंडम AI गेस से नहीं। हर बोर्ड में डेट-सीडेड ",
          },
          { text: "mulberry32", strong: true },
          { text: " PRNG और हमारा " },
          { text: "humanDifficultyEngine", strong: true },
          {
            text: " इस्तेमाल होता है, जो बिटमास्क MRV से यूनिक सॉल्यूशन कन्फर्म करता है और ",
          },
          { text: "0-Single Dead-Ends", strong: true },
          { text: ", " },
          { text: "Skyscraper", strong: true },
          { text: " और " },
          { text: "2-String Kites", strong: true },
          { text: " जैसे असली लॉजिकल चैलेंज सुनिश्चित करता है।" },
        ],
      },
      {
        q: "अगर आज के चैलेंज में 3 गलतियाँ हो जाएं तो क्या होगा?",
        a: [
          {
            text: "तीसरी गलती होते ही उस तारीख का ऑफिशियल कॉम्पिटिटिव अटेम्प्ट ",
          },
          { text: "Failed (3/3)", strong: true },
          {
            text: " पर लॉक हो जाता है ताकि लीडरबोर्ड फेयर बना रहे। चूंकि हर दिन का स्कोर लॉक होता है, इसलिए गुरुवार से रविवार के कठिन ग्रिड्स पर नंबर रखने से पहले पेंसिल नोट्स से क्रॉस-चेक करना सबसे समझदारी है।",
          },
        ],
      },
    ],
  },

  de: {
    articleAriaLabel: "Leitfaden zum Tages-Rätsel und wöchentlicher Schwierigkeitsplan",
    whatIsHeading: "Was ist das Sudoku Tages-Rätsel?",
    whatIsP1: [
      { text: "Das " },
      { text: "Sudoku Tages-Rätsel (Daily Challenge)", strong: true },
      {
        text: " ist ein weltweit synchronisierter Logik-Wettbewerb: Egal ob du im Desktop-Browser, auf dem Tablet oder in unserer Android-App spielst—an jedem Kalendertag liegt exakt dasselbe 9×9-Brett vor. Statt zufälliger Einzelrätsel bindet unser Generator jedes Datum (",
      },
      { text: "SUDOKU_DAILY:YYYY-MM-DD", code: true },
      { text: ") an eine deterministische Pipeline aus " },
      { text: "32-Bit-FNV-1a-Hashing", strong: true },
      { text: ", einem " },
      { text: "Murmur3-Avalanche-Mixer", strong: true },
      { text: " und einem reinen " },
      { text: "mulberry32", strong: true },
      { text: "-Zufallszahlengenerator." },
    ],
    whatIsP2: [
      { text: "Da " },
      { text: "mulberry32", strong: true },
      {
        text: " aus demselben ganzzahligen Seed auf jeder Prozessorarchitektur exakt dieselbe Zahlenfolge erzeugt, erhalten alle Spieler weltweit identische Startvorgaben, identische Engstellen und genau dieselbe eindeutige Lösung. So entscheidet kein Losglück: Wenn du Zeiten mit Freunden vergleichst oder in die globale Top-20-Bestenliste einziehst, zählen allein sauberes Scannen, präzise Notizen und logischer Weitblick.",
      },
    ],
    whatIsBullets: [
      [
        { text: "Deterministische globale Parität:", strong: true },
        {
          text: " Jedes Gerät generiert exakt dasselbe 81-Felder-Layout direkt aus dem Datums-Seed—sofort offline verfügbar und ohne jede Abweichung zwischen Web und App.",
        },
      ],
      [
        { text: "Einheitliches Turnier-Regelwerk:", strong: true },
        {
          text: " Alle Tages-Rätsel laufen mit Live-Timer und strenger 3-Fehler-Grenze und machen aus dem täglichen Solo-Brett einen fairen globalen Vergleich sowie ein synchronisiertes Freunde-Tagesrennen.",
        },
      ],
    ],
    scalingHeading:
      "Wöchentliche Schwierigkeitskurve: Von Montags-Singles bis zu Wochenend-Ketten",
    scalingIntro: [
      {
        text: "Hochwertige Rätselreihen folgen über die Woche einem klaren Rhythmus statt eintöniger Gleichförmigkeit. Unser Daily-Generator bildet diese siebentägige Steigerung ab—vom flüssigen Cross-Hatching am Montag bis zu spärlich besetzten Turnier-Brettern mit gezielten ",
      },
      { text: "0-Single-Sackgassen", strong: true },
      { text: " und mehrgliedrigen " },
      { text: "Skyscraper-Ketten", strong: true },
      { text: " am Wochenende:" },
    ],
    scalingTiers: [
      {
        title: "Montag — Leichtes Aufwärmen (51 Vorgaben)",
        body: [
          {
            text: "Ausgelegt auf zügiges Scannen mit ausgewogener 3×3-Block-Verteilung. Jeder Zug löst sich sauber über ",
          },
          { text: "Naked Singles", strong: true },
          { text: " und " },
          { text: "Hidden Singles", strong: true },
          {
            text: " ganz ohne Bleistift-Notizen—ideal, um Tempo und Treffsicherheit zu Wochenbeginn hochzufahren.",
          },
        ],
      },
      {
        title: "Dienstag & Mittwoch — Mittlerer Spielfluss (39 Vorgaben)",
        body: [
          {
            text: "Senkt das Brett auf 42 leere Felder, sodass direkte Treffer im Mittelteil spürbar dünner werden. Nun greifen Block-Linien-Wechselwirkungen, ",
          },
          { text: "Pointing Pairs", strong: true },
          {
            text: " und disziplinierte Kandidaten-Notizen bei flüssigem Lösungstempo.",
          },
        ],
      },
      {
        title: "Donnerstag & Freitag — Schwere Engstellen (30 Vorgaben)",
        body: [
          {
            text: "Von unserem Human-Logic-Prüfer auf echte ",
          },
          { text: "0-Single-Sackgassen", strong: true },
          {
            text: " abgestimmt, an denen keine Zeile, Spalte oder Box mehr eine sofortige Ziffer bietet. Weiter geht es nur über ",
          },
          { text: "Locked Candidates", strong: true },
          { text: ", " },
          { text: "Naked/Hidden Pairs", strong: true },
          { text: " sowie " },
          { text: "Triples", strong: true },
          { text: "." },
        ],
      },
      {
        title: "Samstag — Experten-Knappheit (25 Vorgaben)",
        body: [
          { text: "Erzwingt " },
          { text: "Strict Digit Starvation", strong: true },
          {
            text: ", sodass häufige Ankerziffern früh fehlen. Um die Samstags-Blockaden zu knacken, brauchst du weitreichende Eliminationsketten wie ",
          },
          { text: "Skyscraper", strong: true },
          { text: ", " },
          { text: "2-String Kites", strong: true },
          { text: ", " },
          { text: "X-Wings", strong: true },
          { text: " und " },
          { text: "Y-Wings", strong: true },
          { text: "." },
        ],
      },
    ],
    sundayMasterCard: {
      title: "Sonntag — Master-Finale (23 Vorgaben)",
      body: [
        {
          text: "Der Höhepunkt der Woche mit nur 23 Startzahlen und 58 freien Feldern. Per Bitmask-MRV-Eindeutigkeitsprüfung und Anti-Single-Mutationen verifiziert, testen Sonntags-Master-Bretter konsequentes Kandidaten-Ausdünnen, alternierende Inferenzketten und tiefe Skyscraper-Eliminationen von Zug eins bis zum Schluss.",
        },
      ],
    },
    crossLinkPrefix:
      "Wenn du bei einem kniffligen Zeitungsrätsel feststeckst oder vor Techniken wie Skyscraper oder X-Wing prüfen möchtest, ob ein eigenes 25-Vorgaben-Brett eindeutig lösbar ist, lade es in unseren ",
    crossLinkLabel: "kostenlosen Sudoku-Löser",
    crossLinkSuffix:
      ", um Konflikte live zu erkennen, die Eindeutigkeit zu testen oder interaktiv weiterzuspielen.",
    streakHeading: "Tägliche Serie (Streak) & Gehirntraining aufbauen",
    streakP1: [
      {
        text: "Fünf bis fünfzehn Minuten strukturierte Deduktion am Tag gehören zu den wirksamsten Routinen für exekutive Fitness. Anders als hektische Reflex-Spiele trainiert Sudoku ",
      },
      { text: "Arbeitsgedächtnis", strong: true },
      { text: ", " },
      { text: "selektive Daueraufmerksamkeit", strong: true },
      { text: " und " },
      { text: "räumliche Mustererkennung", strong: true },
      {
        text: " in ruhiger Konzentration. Wer regelmäßig über alle sieben Wochenstufen spielt, erkennt konjugierte Paare und Linien-Ausschlüsse bald schon auf den ersten Blick.",
      },
    ],
    streakP2: [
      {
        text: "Unsere Serien-Logik belohnt echte tägliche Beständigkeit fair und lässt dich verpasste Tage trotzdem in Ruhe nachholen:",
      },
    ],
    streakBullets: [
      [
        { text: "Ehrliche Serien-Wertung:", strong: true },
        { text: " Löst du das heutige Rätsel noch am selben Kalendertag, wächst deine " },
        { text: "Aktuelle Serie", strong: true },
        { text: " und aktualisiert deine persönliche " },
        { text: "Beste Serie", strong: true },
        {
          text: ". Abschlüsse im Archiv-Spiel zählen für deinen Gesamtstand (Total Solved), verlängern aber keine Tages-Serie künstlich.",
        },
      ],
      [
        { text: "Geräte-Sync & Tresor-Trennung:", strong: true },
        {
          text: " Mit Konto bleiben Kalenderverlauf, Bestzeiten und Serien-Meilensteine in Cloud Firestore gesichert; Gast-Sitzungen speichern lokal im strikt getrennten Speicher ohne Datenvermischung.",
        },
      ],
    ],
    keyboardHeading: "Desktop-Tempo: Tastenkürzel für die tägliche Bestenliste",
    keyboardIntro: [
      { text: "Wer beim " },
      { text: "Tages-Rätsel unter die Top 20", strong: true },
      {
        text: " kommen möchte, spart mit der Tastatur wertvolle Sekunden pro Zug. Alle sechs Desktop-Kürzel stehen Ihnen im gesamten Daily Challenge ohne Mauswege zur Verfügung:",
      },
    ],
    keyboardShortcuts: [
      {
        keys: "1–9 / Numpad 1–9",
        title: "Zifferneingabe im Doppelpack",
        desc: "Geben Sie Lösungen und Kandidaten wahlweise über die obere Zahlenreihe oder den Ziffernblock ohne Verzögerung ein.",
      },
      {
        keys: "Backspace / Entf",
        title: "Feld direkt leeren",
        desc: "Entfernen Sie Notizen oder Zahlen mit einem einzigen Anschlag, statt zum Radiergummi-Button zu greifen.",
      },
      {
        keys: "Strg + Z / Cmd + Z",
        title: "Züge sicher widerrufen",
        desc: "Machen Sie Verklicker unter Windows, Linux und macOS sofort mit einem vertrauten Kürzel rückgängig.",
      },
      {
        keys: "Leertaste / N",
        title: "Notizen-Umschalter",
        desc: "Wechseln Sie blitzschnell zwischen Wert- und Kandidaten-Modus—die Leertaste schaltet um, ohne dass die Seite scrollt.",
      },
      {
        keys: "H",
        title: "Gezielter Hinweis",
        desc: "Wenn ein Sonntags-Experte feststeckt, liefert die Taste H direkt einen strategischen Denkanstoß.",
      },
      {
        keys: "Pfeiltasten • Tab / Esc",
        title: "Volle Fokus- und Menüsteuerung",
        desc: "Bewegen Sie die Auswahl im Gitter und in Dialogmenüs per Pfeiltaste und folgen Sie klaren Fokusrahmen über Tab.",
      },
    ],
    faqHeading: "Häufige Fragen zum Tages-Rätsel",
    faqs: [
      {
        q: "Wie werden Punkte und Platzierungen im Tages-Rätsel berechnet?",
        a: [
          {
            text: "Entscheidend ist der saubere Abschluss ohne Erreichen des 3-Fehler-Limits. In der globalen Top-20-Liste und im Freunde-Tagesrennen zählt in erster Linie die ",
          },
          { text: "schnellste Lösungszeit", strong: true },
          {
            text: ", ergänzt durch möglichst wenige Fehler und hilfsfreie Durchgänge als echte Leistungsmarke.",
          },
        ],
      },
      {
        q: "Kann ich verpasste Tages-Rätsel nachträglich spielen?",
        a: [
          {
            text: "Ja. Jeder frühere Tag im Monatskalender bleibt über das ",
          },
          { text: "Archiv-Spiel (Archive Play)", strong: true },
          {
            text: " dauerhaft freigeschaltet. Ein Klick auf ein vergangenes Datum lädt exakt das deterministische Brett jenes Tages und erhöht beim Lösen deine Gesamtzahl, bleibt für die Serien-Statistik jedoch außen vor.",
          },
        ],
      },
      {
        q: "Stammen die Tages-Rätsel von KI oder deterministischer Menschen-Logik?",
        a: [
          {
            text: "Sie entstehen durch exakte Mathematik und menschliche Ableitungsregeln—nie durch geratene KI-Zahlen. Jedes Brett verbindet den datumsbasierten ",
          },
          { text: "mulberry32", strong: true },
          { text: "-PRNG mit unserer ",
          },
          { text: "humanDifficultyEngine", strong: true },
          {
            text: ", prüft per Bitmask-MRV die Eindeutigkeit und garantiert echte Hürden wie ",
          },
          { text: "0-Single-Sackgassen", strong: true },
          { text: ", " },
          { text: "Skyscraper", strong: true },
          { text: " und " },
          { text: "2-String Kites", strong: true },
          { text: "." },
        ],
      },
      {
        q: "Was passiert bei 3 Fehlern im heutigen Tages-Rätsel?",
        a: [
          {
            text: "Mit dem dritten Fehler endet der offizielle Wertungslauf für dieses Datum als ",
          },
          { text: "Gescheitert (3/3)", strong: true },
          {
            text: ", damit die Bestenliste fair bleibt. Da pro Tag nur ein offizielles Ergebnis zählt, zahlen sich ab Donnerstag konsequente Bleistift-Notizen und kurzes Gegenprüfen vor jedem Eintrag aus.",
          },
        ],
      },
    ],
  },

  ja: {
    articleAriaLabel: "デイリーチャレンジガイドと週間難易度スケジュール",
    whatIsHeading: "デイリー数独チャレンジとは？",
    whatIsP1: [
      { text: "「" },
      { text: "デイリー数独チャレンジ", strong: true },
      {
        text: "」は、PCブラウザ・タブレット・Androidアプリのどれを使っていても、世界中のプレイヤーが同じ日にまったく同一の9×9盤面に挑戦できるグローバル同期ロジック課題です。ユーザーごとに無作為な盤面を出すのではなく、日付キー（",
      },
      { text: "SUDOKU_DAILY:YYYY-MM-DD", code: true },
      { text: "）を " },
      { text: "32ビット FNV-1a ハッシュ", strong: true },
      { text: "、" },
      { text: "Murmur3 アバランチ混合", strong: true },
      { text: "、そして決定論的擬似乱数生成器 " },
      { text: "mulberry32", strong: true },
      { text: " のパイプラインに直結させています。" },
    ],
    whatIsP2: [
      { text: "" },
      { text: "mulberry32", strong: true },
      {
        text: " は同じ整数シードからどのCPU環境でも完全に一致する数列を生成するため、初期ヒントの位置・思考が止まる難所・唯一の正解まで全プレイヤーで100%共通になります。引きの運に左右されないため、フレンドとのタイム比較や世界トップ20ランキングでは、スキャン精度・メモ整理・先読みの論理力だけが純粋に競われます。",
      },
    ],
    whatIsBullets: [
      [
        { text: "完全同一の日付シード生成：", strong: true },
        {
          text: " 全端末が日付シードから81マスを直接組み立てるため、オフラインでも即起動しWeb版とアプリ版の差異がゼロです。",
        },
      ],
      [
        { text: "統一トーナメントルール：", strong: true },
        {
          text: " すべてのデイリー盤面で経過タイマーと厳格なミス3回上限が適用され、普段のソロプレイが公平な世界戦やフレンドデイリーレースに変わります。",
        },
      ],
    ],
    scalingHeading: "曜日別難易度の変化：月曜のシングルから週末チェーンへ",
    scalingIntro: [
      {
        text: "優れたパズル媒体が平日のリズムから週末の難問へと段階を上げるように、デイリーエンジンも7日間の美しい曲線を描きます。月曜の軽快な交差スキャンから始まり、土日には意図的な ",
      },
      { text: "0-Single停滞", strong: true },
      { text: " や複数ユニットを結ぶ " },
      { text: "Skyscraper（スカイスクレイパー）", strong: true },
      { text: " が立ちはだかります。",
      },
    ],
    scalingTiers: [
      {
        title: "月曜 — かんたんウォームアップ（ヒント51個）",
        body: [
          {
            text: "3×3ブロックの配置バランスを整えた軽快な盤面です。メモ機能を使わなくても ",
          },
          { text: "ネイキッドシングル", strong: true },
          { text: " と " },
          { text: "ヒドゥンシングル", strong: true },
          {
            text: " だけでテンポよく解け、週明けのスピード調整に最適です。",
          },
        ],
      },
      {
        title: "火曜・水曜 — ふつうの連鎖リズム（ヒント39個）",
        body: [
          {
            text: "空きマス42個となり、中盤で単純な1桁スキャンが自然と減ってきます。行・列とブロックの交差判定、",
          },
          { text: "ポインティングペア", strong: true },
          {
            text: "、計画的な候補メモへと無理なく移行できる設計です。",
          },
        ],
      },
      {
        title: "木曜・金曜 — むずかしい論理の壁（ヒント30個）",
        body: [
          {
            text: "人間ロジック解析器により、どの行・列・ブロックを見ても即決できるマスがない本物の ",
          },
          { text: "0-Single停滞", strong: true },
          {
            text: " を組み込んでいます。突破するには ",
          },
          { text: "ロックドキャンディデート", strong: true },
          { text: "、" },
          { text: "ネイキッド／ヒドゥンペア", strong: true },
          { text: "、" },
          { text: "トリプル（3国同盟）", strong: true },
          { text: " が不可欠です。" },
        ],
      },
      {
        title: "土曜 — エキスパート数字枯渇（ヒント25個）",
        body: [
          { text: "" },
          { text: "Strict Digit Starvation（厳格な数字制限）", strong: true },
          {
            text: " により序盤の足掛かりとなる数字をあえて抑えています。土曜の壁を抜けるには ",
          },
          { text: "Skyscraper", strong: true },
          { text: "、" },
          { text: "2-String Kite", strong: true },
          { text: "、" },
          { text: "X-Wing", strong: true },
          { text: "、" },
          { text: "Y-Wing", strong: true },
          { text: " といった長距離消去法が求められます。" },
        ],
      },
    ],
    sundayMasterCard: {
      title: "日曜 — マスター総仕上げ（ヒント23個）",
      body: [
        {
          text: "初期ヒントわずか23個・空き58マスで挑む週末の最高峰ステージです。ビットマスクMRVによる唯一解検証とアンチシングル変異パスを経て生成され、最初から最後まで精緻な候補削減、交互推論チェーン、深いSkyscraper消去が試されます。",
        },
      ],
    },
    crossLinkPrefix:
      "新聞の難問の途中で手が止まったときや、25ヒントの自作盤面でSkyscraper・X-Wingに挑む前に唯一解を確かめたいときは、ぜひ ",
    crossLinkLabel: "無料数独ソルバー",
    crossLinkSuffix:
      " に盤面を入力して、リアルタイムの重複チェック・唯一解検証・インタラクティブ練習をご活用ください。",
    streakHeading: "毎日の連続記録（Streak）と脳トレ習慣",
    streakP1: [
      {
        text: "1日5〜15分、筋道を立てて数字を絞る時間は、実行機能（思考の司令塔）を冴え渡らせる最も手軽な習慣です。派手な演出で反射神経を急かすゲームと違い、数独は落ち着いた集中の中で ",
      },
      { text: "ワーキングメモリ", strong: true },
      { text: "、" },
      { text: "持続的選択的注意", strong: true },
      { text: "、" },
      { text: "空間パターン認識力", strong: true },
      {
        text: " を同時に鍛えます。7段階の難易度を継続して解くことで、意識的に1マスずつ追う前に共役ペアやライン消去が自然と目に飛び込むようになります。",
      },
    ],
    streakP2: [
      {
        text: "連続記録システムは、日々の継続を正しく評価しつつ、解き逃した日の問題も後から無理なく消化できるよう設計されています。",
      },
    ],
    streakBullets: [
      [
        { text: "誠実な連続記録カウント：", strong: true },
        { text: " 今日の問題を当日のカレンダー日付のうちにクリアすると " },
        { text: "現在の連続記録", strong: true },
        { text: " が伸び、" },
        { text: "最高連続記録", strong: true },
        {
          text: " も更新されます。過去日付のアーカイブプレイは通算クリア数に加算されますが、連続記録の数字を水増しすることはありません。",
        },
      ],
      [
        { text: "端末間同期とデータ分離：", strong: true },
        {
          text: " ログインすればカレンダー達成履歴・クリアタイム・連続記録がCloud Firestoreへ安全に同期されます。ゲスト利用時は分離されたローカル領域に保存され、アカウント間で混線しません。",
        },
      ],
    ],
    keyboardHeading: "デスクトップ高速攻略：デイリーランキング用キーボード操作",
    keyboardIntro: [
      { text: "デイリーチャレンジの " },
      { text: "Top-20 スピードランキング", strong: true },
      {
        text: " を狙うなら、カーソル移動のロスをゼロにすることが近道です。デイリー盤面では以下6種類のデスクトップ操作がすべてネイティブ対応しています：",
      },
    ],
    keyboardShortcuts: [
      {
        keys: "1–9 / Numpad 1–9",
        title: "数字キー＆テンキー完全対応",
        desc: "最上段の数字キーと右側のテンキーのどちらからでも確定数字・候補メモを遅延なく入力できます。",
      },
      {
        keys: "Backspace / Delete",
        title: "ワンタッチ消去",
        desc: "入力ミスや古いメモを、消去ボタンまでカーソルを動かさず一瞬でクリアします。",
      },
      {
        keys: "Ctrl + Z / Cmd + Z",
        title: "即座に一手戻す（Undo）",
        desc: "タイムアタック中の誤入力も、OS標準のショートカットでリズムを崩さずやり直せます。",
      },
      {
        keys: "Space / N",
        title: "鉛筆メモ切替（スクロール抑止）",
        desc: "入力と候補メモを瞬時に切替。Spaceキーを押してもブラウザ画面が下にスクロールしない設計です。",
      },
      {
        keys: "H",
        title: "ヒント呼び出し",
        desc: "日曜の難問（Expert）で詰まったときは H キーからロジカルヒントをすぐに確認できます。",
      },
      {
        keys: "矢印キー • Tab / Esc",
        title: "盤面・メニューの全キーボード操作",
        desc: "上下左右の矢印キーでマスとメニュー項目を移動し、視認性の高いフォーカスリングを見ながら Tab で操作できます。",
      },
    ],
    faqHeading: "デイリーチャレンジ よくある質問（FAQ）",
    faqs: [
      {
        q: "スコアやランキング順位はどのように決まりますか？",
        a: [
          {
            text: "ミス3回の上限に達せず正しく解き切ることが基本条件です。世界トップ20ランキングおよびフレンドデイリーレースでは、完走者の ",
          },
          { text: "最速クリアタイム", strong: true },
          {
            text: " を最優先に順位が決まり、ミスの少なさやノーヒント完走が実力の指標になります。",
          },
        ],
      },
      {
        q: "過去のデイリーチャレンジをさかのぼって遊べますか？",
        a: [
          {
            text: "はい。月〜日の月間カレンダーにある過去の日付はすべて ",
          },
          { text: "アーカイブプレイ（Archive Play）", strong: true },
          {
            text: " としていつでも挑戦できます。過去の日付を選ぶとその日の決定論的盤面が再現され、クリアすると通算解決数が増えます（連続記録には加算されません）。",
          },
        ],
      },
      {
        q: "問題はAIが作っているのですか？それとも確定ロジックですか？",
        a: [
          {
            text: "生成AIの当て推量ではなく、100%決定論的アルゴリズムと人間の論理ルールで設計されています。日付シードの ",
          },
          { text: "mulberry32", strong: true },
          { text: " PRNGと独自の " },
          { text: "humanDifficultyEngine", strong: true },
          {
            text: " を組み合わせ、ビットマスクMRVで唯一解を保証したうえで ",
          },
          { text: "0-Single停滞", strong: true },
          { text: "、" },
          { text: "Skyscraper", strong: true },
          { text: "、" },
          { text: "2-String Kite", strong: true },
          { text: " などの本格的な関門を組み込んでいます。" },
        ],
      },
      {
        q: "今日のチャレンジで3回ミスするとどうなりますか？",
        a: [
          {
            text: "ランキングの公平性を守るため、3回目のミスでその日付の公式チャレンジは ",
          },
          { text: "失敗（3/3）", strong: true },
          {
            text: " として確定します。1日1回限りの公式スコアだからこそ、木曜〜日曜の難問では丁寧なメモ入力と確定前の再確認が大きな武器になります。",
          },
        ],
      },
    ],
  },

  ko: {
    articleAriaLabel: "일일 스도쿠 챌린지 가이드 및 요일별 난이도 일정",
    whatIsHeading: "일일 스도쿠 챌린지란 무엇인가요?",
    whatIsP1: [
      { text: "" },
      { text: "일일 스도쿠 챌린지(Daily Challenge)", strong: true },
      {
        text: " 는 데스크톱 브라우저, 태블릿, Android 앱 등 어떤 기기로 접속하더라도 전 세계 모든 플레이어가 같은 날 정확히 동일한 9×9 보드로 실력을 겨루도록 설계된 글로벌 동기화 퍼즐입니다. 사용자마다 무작위 판을 내주는 대신 날짜 키(",
      },
      { text: "SUDOKU_DAILY:YYYY-MM-DD", code: true },
      { text: ")를 " },
      { text: "32비트 FNV-1a 해싱", strong: true },
      { text: ", " },
      { text: "Murmur3 아발란치 믹서", strong: true },
      { text: ", 순수 " },
      { text: "mulberry32", strong: true },
      { text: " 의사난수 생성기 파이프라인에 결합해 보드를 생성합니다." },
    ],
    whatIsP2: [
      { text: "" },
      { text: "mulberry32", strong: true },
      {
        text: " 는 같은 정수 시드에서 모든 CPU 환경마다 한 치의 오차도 없이 똑같은 수열을 출력하므로, 전 세계 모든 이용자가 동일한 초기 숫자 위치, 동일한 병목 구간, 그리고 단 하나의 유일한 정답을 마주합니다. 운에 따른 편차가 전혀 없기 때문에 친구와 기록을 비교하거나 글로벌 Top-20 리더보드에 오를 때 빠른 기록은 오직 예리한 스캔, 깔끔한 메모, 깊은 추론의 결과로 결정됩니다.",
      },
    ],
    whatIsBullets: [
      [
        { text: "결정론적 글로벌 동일 시드:", strong: true },
        {
          text: " 모든 기기가 날짜 시드에서 81칸 배치를 직접 생성하므로 오프라인에서도 즉시 실행되며 웹과 모바일 간 차이가 전혀 없습니다.",
        },
      ],
      [
        { text: "표준화된 토너먼트 규칙:", strong: true },
        {
          text: " 모든 일일 보드에는 실시간 타이머와 엄격한 실수 3회 제한이 적용되어, 혼자 푸는 매일의 퍼즐을 공정한 글로벌 경쟁과 실시간 친구 대결로 바꿔 줍니다.",
        },
      ],
    ],
    scalingHeading:
      "요일별 난이도 상승: 월요일 싱글부터 주말 고급 체인까지",
    scalingIntro: [
      {
        text: "완성도 높은 퍼즐 시리즈는 일주일 내내 똑같은 난이도를 유지하지 않고 뚜렷한 리듬을 만듭니다. SudokuSync의 일일 엔진도 월요일의 경쾌한 교차 스캔으로 시작해 토·일요일에는 의도적인 ",
      },
      { text: "0-Single 막힘", strong: true },
      { text: " 과 다중 유닛 " },
      { text: "스카이스크래퍼(Skyscraper) 체인", strong: true },
      { text: " 이 등장하는 토너먼트급 보드로 이어집니다:" },
    ],
    scalingTiers: [
      {
        title: "월요일 — 쉬움 워밍업 (힌트 51개)",
        body: [
          {
            text: "균형 잡힌 3×3 박스 배치로 빠르게 스캔하며 풀 수 있도록 설계했습니다. 연필 메모 없이도 ",
          },
          { text: "네이키드 싱글", strong: true },
          { text: " 과 " },
          { text: "히든 싱글", strong: true },
          {
            text: " 만으로 매끄럽게 풀려 한 주를 시작할 때 손과 눈의 감각을 깨우기에 좋습니다.",
          },
        ],
      },
      {
        title: "화요일 & 수요일 — 보통 리듬 (힌트 39개)",
        body: [
          {
            text: "빈칸이 42개로 늘어나며 중반부터 단순 한 자리 스캔만으로는 막히기 시작합니다. 박스-라인 상호작용, ",
          },
          { text: "포인팅 페어(Pointing Pairs)", strong: true },
          {
            text: ", 체계적인 후보 숫자 메모로 자연스럽게 넘어가며 꾸준한 풀이 속도를 유지하게 합니다.",
          },
        ],
      },
      {
        title: "목요일 & 금요일 — 어려움 논리 병목 (힌트 30개)",
        body: [
          {
            text: "인간 논리(Human-Logic) 검사기를 통해 모든 가로줄·세로줄·박스에서 바로 놓을 수 있는 숫자가 끊기는 진짜 ",
          },
          { text: "0-Single 막힘", strong: true },
          {
            text: " 구간을 만듭니다. 돌파하려면 ",
          },
          { text: "록드 캔디데이트(Locked Candidates)", strong: true },
          { text: ", " },
          { text: "네이키드/히든 페어", strong: true },
          { text: ", " },
          { text: "트리플(Triples)", strong: true },
          { text: " 을 정확히 찾아야 합니다." },
        ],
      },
      {
        title: "토요일 — 전문가 숫자 고갈 (힌트 25개)",
        body: [
          { text: "" },
          { text: "Strict Digit Starvation(엄격한 숫자 희소성)", strong: true },
          {
            text: " 을 적용해 초반 기준점이 되는 단서를 의도적으로 줄였습니다. 토요일의 벽을 넘기 위해서는 ",
          },
          { text: "Skyscraper 체인", strong: true },
          { text: ", " },
          { text: "2-String Kite", strong: true },
          { text: ", " },
          { text: "X-Wing", strong: true },
          { text: ", " },
          { text: "Y-Wing", strong: true },
          { text: " 같은 원거리 후보 소거 기법이 필수입니다." },
        ],
      },
    ],
    sundayMasterCard: {
      title: "일요일 — 마스터 피날레 (힌트 23개)",
      body: [
        {
          text: "단 23개의 힌트와 58개의 빈칸으로 펼쳐지는 한 주의 최종 관문입니다. 비트마스크 MRV 유일해 검증과 안티-싱글 변형 패스를 통과한 일요일 마스터 보드는 처음부터 끝까지 정교한 메모 가지치기, 교대 추론 체인, 깊이 있는 Skyscraper 소거를 시험합니다.",
        },
      ],
    },
    crossLinkPrefix:
      "신문이나 책의 까다로운 퍼즐 중간에서 막히거나, Skyscraper·X-Wing을 연습하기 전에 직접 만든 25힌트 보드가 유일해를 갖는지 확인하고 싶다면 ",
    crossLinkLabel: "무료 스도쿠 풀이기",
    crossLinkSuffix:
      " 에 입력해 실시간 충돌 확인, 유일해 검증, 인터랙티브 연습을 바로 이용해 보세요.",
    streakHeading: "연속 기록(Streak) 쌓기와 매일 두뇌 트레이닝",
    streakP1: [
      {
        text: "하루 5~15분을 구조화된 연역적 사고에 투자하는 것은 실행 인지 능력을 날카롭게 유지하는 가장 간단하고 확실한 방법입니다. 감각적 자극만 앞세운 순발력 게임과 달리 스도쿠는 차분한 몰입 속에서 ",
      },
      { text: "작업 기억력", strong: true },
      { text: ", " },
      { text: "지속적 선택 집중력", strong: true },
      { text: ", " },
      { text: "공간 패턴 인식력", strong: true },
      {
        text: " 을 단련합니다. 일곱 단계 난이도를 꾸준히 풀다 보면 일일이 한 칸씩 훑기 전에 공액 쌍과 교차 라인 소거가 한눈에 들어오기 시작합니다.",
      },
    ],
    streakP2: [
      {
        text: "연속 기록 시스템은 매일 꾸준히 도전하는 성실함을 공정하게 보상하면서도, 놓친 퍼즐을 부담 없이 다시 풀 수 있게 설계되어 있습니다:",
      },
    ],
    streakBullets: [
      [
        { text: "정직한 연속 기록 집계:", strong: true },
        { text: " 오늘의 퍼즐을 해당 달력 날짜 안에 완료하면 " },
        { text: "현재 연속 기록", strong: true },
        { text: " 이 늘어나고 역대 " },
        { text: "최고 연속 기록", strong: true },
        {
          text: " 이 갱신됩니다. 지난 날짜의 아카이브 플레이는 누적 해결 횟수에는 반영되지만 일일 연속 기록을 인위적으로 부풀리지는 않습니다.",
        },
      ],
      [
        { text: "기기 간 동기화 & 저장소 완전 분리:", strong: true },
        {
          text: " 로그인하면 달력 기록, 완료 시간, 연속 달성 내역이 Cloud Firestore에 안전하게 백업되며, 게스트 세션은 계정에 섞이지 않는 별도의 로컬 보관함에 저장됩니다.",
        },
      ],
    ],
    keyboardHeading: "데스크톱 스피드 솔빙: 일일 랭킹을 위한 키보드 단축키",
    keyboardIntro: [
      { text: "일일 챌린지 " },
      { text: "Top-20 스피드 리더보드", strong: true },
      {
        text: " 에 진입하려면 마우스 이동 시간을 줄이는 것이 핵심입니다. 모든 일일 퍼즐은 6가지 데스크톱 단축키를 완벽히 지원합니다:",
      },
    ],
    keyboardShortcuts: [
      {
        keys: "1–9 / Numpad 1–9",
        title: "상단 숫자 & 넘패드 입력",
        desc: "상단 숫자 열과 오른쪽 전용 Numpad 중 편한 쪽으로 정답과 후보 메모를 즉시 입력하세요.",
      },
      {
        keys: "Backspace / Delete",
        title: "선택 칸 즉시 지우기",
        desc: "잘못 적었거나 오래된 후보 메모를 지우개 버튼 클릭 없이 한 번에 삭제합니다.",
      },
      {
        keys: "Ctrl + Z / Cmd + Z",
        title: "즉시 실행 취소",
        desc: "Windows, Linux, macOS에서 익숙한 단축키로 실수를 바로 되돌리고 기록 흐름을 유지하세요.",
      },
      {
        keys: "Spacebar / N",
        title: "연필 메모 빠른 전환",
        desc: "Spacebar 또는 N 키로 메모 모드를 전환하세요. 스페이스바를 눌러도 화면이 스크롤되지 않습니다.",
      },
      {
        keys: "H",
        title: "논리 힌트 확인",
        desc: "일요일 Expert 난이도에서 흐름이 막혔을 때 H 키로 즉시 힌트를 확인할 수 있습니다.",
      },
      {
        keys: "방향키 • Tab / Esc",
        title: "보드 및 메뉴 방향키 이동",
        desc: "상하좌우 방향키로 보드와 모달 메뉴를 오가고, 선명한 포커스 링과 함께 Tab/Esc로 제어하세요.",
      },
    ],
    faqHeading: "일일 챌린지 자주 묻는 질문 (FAQ)",
    faqs: [
      {
        q: "일일 챌린지 점수와 순위는 어떻게 계산되나요?",
        a: [
          {
            text: "핵심 기준은 실수 3회 상한에 걸리지 않고 보드를 깔끔하게 완성하는 것입니다. 글로벌 Top-20 리더보드 및 친구 일일 대결에서는 완주한 플레이어를 ",
          },
          { text: "최단 풀이 시간", strong: true },
          {
            text: " 순으로 우선 정렬하며, 적은 실수와 무힌트 클리어가 실력을 가늠하는 주요 지표가 됩니다.",
          },
        ],
      },
      {
        q: "놓친 지난 일일 챌린지를 다시 플레이할 수 있나요?",
        a: [
          {
            text: "네, 가능합니다. 월–일 월간 달력의 모든 이전 날짜는 ",
          },
          { text: "아카이브 플레이(Archive Play)", strong: true },
          {
            text: " 를 통해 언제든 열려 있습니다. 지난 날짜를 선택하면 그날의 정확한 결정론적 퍼즐이 열리며, 완료 시 누적 해결 횟수는 올라가지만 연속 기록 계산에서는 제외됩니다.",
          },
        ],
      },
      {
        q: "일일 퍼즐은 AI가 만드나요, 아니면 인간 논리 알고리즘으로 만드나요?",
        a: [
          {
            text: "생성형 AI의 추측이 아닌 100% 결정론적 수학과 인간 추론 규칙으로 제작됩니다. 날짜 시드 기반 ",
          },
          { text: "mulberry32", strong: true },
          { text: " PRNG와 자체 " },
          { text: "humanDifficultyEngine", strong: true },
          {
            text: " 을 결합해 비트마스크 MRV로 유일해를 검증하고 ",
          },
          { text: "0-Single 막힘", strong: true },
          { text: ", " },
          { text: "Skyscraper", strong: true },
          { text: ", " },
          { text: "2-String Kite", strong: true },
          { text: " 같은 실제 논리 관문을 보장합니다." },
        ],
      },
      {
        q: "오늘의 챌린지에서 실수를 3번 하면 어떻게 되나요?",
        a: [
          {
            text: "리더보드 공정성을 지키기 위해 세 번째 실수를 하는 즉시 해당 날짜의 공식 경쟁 도전은 ",
          },
          { text: "실패 (3/3)", strong: true },
          {
            text: " 로 종료됩니다. 하루 공식 기록은 단 한 번뿐이므로, 난도가 높아지는 목~일요일 보드에서는 꼼꼼한 메모 작성과 확정 전 한 번 더 확인하는 습관이 중요합니다.",
          },
        ],
      },
    ],
  },

  es: {
    articleAriaLabel: "Guía del Reto Diario de Sudoku y escala semanal de dificultad",
    whatIsHeading: "¿Qué es el Reto Diario de Sudoku?",
    whatIsP1: [
      { text: "El " },
      { text: "Reto Diario de Sudoku", strong: true },
      {
        text: " es una prueba lógica sincronizada a escala mundial para que cada jugador—ya sea en navegador de escritorio, tableta o nuestra app de Android—se enfrente exactamente al mismo tablero 9×9 en una fecha concreta. En lugar de repartir cuadrículas aleatorias distintas a cada persona, nuestro generador enlaza la fecha (",
      },
      { text: "SUDOKU_DAILY:YYYY-MM-DD", code: true },
      { text: ") a una cadena determinista que combina " },
      { text: "hashing FNV-1a de 32 bits", strong: true },
      { text: ", un " },
      { text: "mezclador avalancha Murmur3", strong: true },
      { text: " y un generador pseudoaleatorio puro " },
      { text: "mulberry32", strong: true },
      { text: "." },
    ],
    whatIsP2: [
      { text: "Como " },
      { text: "mulberry32", strong: true },
      {
        text: " produce exactamente la misma secuencia numérica a partir de la misma semilla entera en cualquier arquitectura de procesador, todo el mundo recibe idénticas pistas iniciales, los mismos puntos de bloqueo y la misma solución única. Este determinismo absoluto elimina el factor suerte: al comparar tiempos con amigos o subir al Top-20 global, la ventaja viene únicamente de un escaneo más rápido, notas limpias y mayor visión deductiva.",
      },
    ],
    whatIsBullets: [
      [
        { text: "Paridad global determinista:", strong: true },
        {
          text: " Cada dispositivo sintetiza la misma disposición de 81 casillas directamente desde la semilla del día, garantizando disponibilidad sin conexión y cero diferencias entre web y móvil.",
        },
      ],
      [
        { text: "Reglas estándar de torneo:", strong: true },
        {
          text: " Todos los tableros diarios incluyen cronómetro en vivo y un límite estricto de tres errores, convirtiendo la partida diaria en una competición justa y en una Carrera Diaria con Amigos sincronizada.",
        },
      ],
    ],
    scalingHeading:
      "Escala semanal de dificultad: de Singles el lunes a cadenas el fin de semana",
    scalingIntro: [
      {
        text: "Las grandes publicaciones de pasatiempos construyen un ritmo semanal en lugar de ofrecer una dificultad plana. Nuestro motor diario sigue esa progresión de siete días—empezando por un escaneo visual ágil el lunes hasta llegar a tableros escasos de nivel torneo con ",
      },
      { text: "bloqueos 0-Single", strong: true },
      { text: " intencionados y cadenas " },
      { text: "Skyscraper", strong: true },
      { text: " el sábado y el domingo:" },
    ],
    scalingTiers: [
      {
        title: "Lunes — Calentamiento Fácil (51 pistas)",
        body: [
          {
            text: "Pensado para un barrido ágil con reparto equilibrado entre cajas 3×3. Cada paso se resuelve con claridad mediante ",
          },
          { text: "Singles Desnudos", strong: true },
          { text: " y " },
          { text: "Singles Ocultos", strong: true },
          {
            text: " sin necesitar marcas a lápiz, ideal para coger velocidad y precisión al arrancar la semana.",
          },
        ],
      },
      {
        title: "Martes y Miércoles — Fluidez Media (39 pistas)",
        body: [
          {
            text: "Reduce el tablero a 42 casillas vacías para que el escaneo directo se agote de forma natural a mitad de partida. Requiere dominar interacciones caja-línea, ",
          },
          { text: "Pointing Pairs", strong: true },
          {
            text: " y anotación ordenada de candidatos manteniendo buen ritmo.",
          },
        ],
      },
      {
        title: "Jueves y Viernes — Cuellos de botella Difíciles (30 pistas)",
        body: [
          {
            text: "Validado con nuestro analizador lógico humano para forzar auténticos ",
          },
          { text: "bloqueos 0-Single", strong: true },
          {
            text: " donde ninguna fila, columna o caja regala dígitos inmediatos. Avanzar exige aplicar ",
          },
          { text: "Candidatos Bloqueados (Locked Candidates)", strong: true },
          { text: ", " },
          { text: "Pares Desnudos/Ocultos", strong: true },
          { text: " y " },
          { text: "Tríos (Triples)", strong: true },
          { text: "." },
        ],
      },
      {
        title: "Sábado — Escasez Experto (25 pistas)",
        body: [
          { text: "Aplica " },
          { text: "Escasez Estricta de Dígitos (Strict Digit Starvation)", strong: true },
          {
            text: " para retener anclas fáciles al principio. Superar los bloqueos del sábado exige técnicas de eliminación a larga distancia como cadenas ",
          },
          { text: "Skyscraper", strong: true },
          { text: ", " },
          { text: "2-String Kites", strong: true },
          { text: ", " },
          { text: "X-Wings", strong: true },
          { text: " y " },
          { text: "Y-Wings", strong: true },
          { text: "." },
        ],
      },
    ],
    sundayMasterCard: {
      title: "Domingo — Prueba Maestra (23 pistas)",
      body: [
        {
          text: "Reservado para el desafío estrella del domingo con solo 23 pistas y 58 casillas vacías. Verificados mediante unicidad bitmask MRV y pasadas anti-single, los tableros Master dominicales ponen a prueba el podado constante de candidatos, cadenas de inferencia alternantes y eliminaciones profundas con Skyscraper de principio a fin.",
        },
      ],
    },
    crossLinkPrefix:
      "Si alguna vez te quedas atascado a mitad de un sudoku complicado de periódico o quieres comprobar si un tablero propio de 25 pistas tiene solución única antes de practicar Skyscraper o X-Wing, cárgalo en nuestro ",
    crossLinkLabel: "Solucionador de Sudoku gratis",
    crossLinkSuffix:
      " para detectar conflictos al instante, verificar su unicidad o jugarlo de forma interactiva.",
    streakHeading: "Construir una racha diaria y entrenar la mente",
    streakP1: [
      {
        text: "Dedicar entre cinco y quince minutos al día al razonamiento deductivo estructurado es una de las formas más sencillas de mantener aguda la cognición ejecutiva. A diferencia de los juegos móviles frenéticos basados en reflejos y sobrecarga sensorial, el Sudoku ejercita la ",
      },
      { text: "memoria de trabajo", strong: true },
      { text: ", la " },
      { text: "atención selectiva sostenida", strong: true },
      { text: " y el " },
      { text: "reconocimiento espacial de patrones", strong: true },
      {
        text: " en un entorno sereno y deliberado. Practicar con constancia los siete niveles entrena tu vista para detectar pares conjugados y cruces de línea antes siquiera de revisar casilla por casilla.",
      },
    ],
    streakP2: [
      {
        text: "Nuestra arquitectura de rachas está diseñada para premiar la constancia real de cada día sin impedirte ponerte al día con retos anteriores a tu propio ritmo:",
      },
    ],
    streakBullets: [
      [
        { text: "Conteo auténtico de rachas:", strong: true },
        { text: " Resolver el reto de hoy dentro de su fecha natural amplía tu " },
        { text: "Racha actual", strong: true },
        { text: " y actualiza tu " },
        { text: "Mejor racha", strong: true },
        {
          text: " histórica. Las partidas completadas en el Archivo suman al total de tableros resueltos sin inflar artificialmente los días consecutivos.",
        },
      ],
      [
        { text: "Sincronización multidispositivo y bóveda aislada:", strong: true },
        {
          text: " Al iniciar sesión, tu historial del calendario, tiempos y rachas quedan respaldados en Cloud Firestore; en modo Invitado, todo se guarda en un espacio local aislado sin fugas entre cuentas.",
        },
      ],
    ],
    keyboardHeading: "Velocidad en escritorio: atajos de teclado para el ranking diario",
    keyboardIntro: [
      { text: "Entrar en el " },
      { text: "Top-20 de velocidad del Reto Diario", strong: true },
      {
        text: " exige eliminar desplazamientos innecesarios de ratón. Cada tablero diario admite los seis atajos principales de escritorio para resolver sin pausas:",
      },
    ],
    keyboardShortcuts: [
      {
        keys: "1–9 / Numpad 1–9",
        title: "Dígitos con fila superior o Numpad",
        desc: "Introduce valores definitivos o candidatos usando indistintamente los números superiores o el teclado numérico.",
      },
      {
        keys: "Backspace / Delete",
        title: "Borrado sin fricción",
        desc: "Limpia marcas de lápiz o dígitos sin confirmar al instante sin apartar la vista de la región activa.",
      },
      {
        keys: "Ctrl + Z / Cmd + Z",
        title: "Deshacer al instante",
        desc: "Revierte cualquier toque erróneo en Windows, Linux o Mac sin perder el ritmo de tu cronómetro.",
      },
      {
        keys: "Barra espaciadora / N",
        title: "Alternar notas de lápiz",
        desc: "Cambia entre modo normal y notas de candidatos al vuelo; el espacio evita el desplazamiento de página.",
      },
      {
        keys: "H",
        title: "Pista lógica rápida",
        desc: "¿Atascado en el reto Experto del domingo? Pulsa H para consultar una pista directa desde el tablero.",
      },
      {
        keys: "Flechas • Tab / Esc",
        title: "Navegación total y menús",
        desc: "Muévete por la cuadrícula y las listas abiertas con las flechas, con anillos de enfoque nítidos al usar Tab.",
      },
    ],
    faqHeading: "Preguntas frecuentes sobre el Reto Diario",
    faqs: [
      {
        q: "¿Cómo se calculan la puntuación y las clasificaciones del Reto Diario?",
        a: [
          {
            text: "La clave está en completar el tablero con limpieza sin alcanzar el tope de 3 errores. En el Top-20 global y en la Carrera Diaria con Amigos, quienes completan el reto se ordenan principalmente por ",
          },
          { text: "menor tiempo de resolución", strong: true },
          {
            text: ", con menos fallos y partidas sin pistas como referencia natural de maestría.",
          },
        ],
      },
      {
        q: "¿Puedo jugar retos diarios pasados que me haya perdido?",
        a: [
          {
            text: "Sí. Cada fecha anterior del calendario mensual de lunes a domingo permanece desbloqueada para siempre mediante el ",
          },
          { text: "Juego de Archivo (Archive Play)", strong: true },
          {
            text: ". Al tocar cualquier día pasado se genera exactamente el mismo tablero determinista de aquella fecha y suma a tu Total Resuelto al completarlo, excluyéndolo del cómputo de racha.",
          },
        ],
      },
      {
        q: "¿Los retos diarios los genera una IA o lógica humana determinista?",
        a: [
          {
            text: "Se construyen con matemática determinista y reglas de deducción humana, nunca con aproximaciones de IA generativa. Cada cuadrícula combina el PRNG ",
          },
          { text: "mulberry32", strong: true },
          { text: " sembrado por fecha con nuestro " },
          { text: "humanDifficultyEngine", strong: true },
          {
            text: ", verificando unicidad por backtracking bitmask MRV y garantizando barreras reales como ",
          },
          { text: "bloqueos 0-Single", strong: true },
          { text: ", cadenas " },
          { text: "Skyscraper", strong: true },
          { text: " y " },
          { text: "2-String Kites", strong: true },
          { text: "." },
        ],
      },
      {
        q: "¿Qué ocurre si cometo 3 errores en el reto de hoy?",
        a: [
          {
            text: "Al cometer el tercer fallo, el intento competitivo oficial de esa fecha finaliza como ",
          },
          { text: "Fallado (3/3)", strong: true },
          {
            text: " para proteger la limpieza de la clasificación. Como cada día solo admite un marcador oficial, tomar notas de candidatos con rigor y verificar antes de fijar dígitos marca la diferencia de jueves a domingo.",
          },
        ],
      },
    ],
  },

  fr: {
    articleAriaLabel: "Guide du Défi du Jour Sudoku et courbe de difficulté hebdomadaire",
    whatIsHeading: "Qu'est-ce que le Défi du Jour Sudoku ?",
    whatIsP1: [
      { text: "Le " },
      { text: "Défi du Jour Sudoku", strong: true },
      {
        text: " est une référence logique synchronisée mondialement pour que chaque joueur—sur ordinateur, tablette ou application Android—affronte exactement la même grille 9×9 à une date donnée. Au lieu de distribuer des grilles aléatoires disparates, notre générateur associe la date du jour (",
      },
      { text: "SUDOKU_DAILY:YYYY-MM-DD", code: true },
      { text: ") à un pipeline déterministe mêlant " },
      { text: "hachage FNV-1a 32 bits", strong: true },
      { text: ", un " },
      { text: "mélangeur avalanche Murmur3", strong: true },
      { text: " et le générateur pseudo-aléatoire pur " },
      { text: "mulberry32", strong: true },
      { text: "." },
    ],
    whatIsP2: [
      { text: "Comme " },
      { text: "mulberry32", strong: true },
      {
        text: " produit strictement la même suite numérique à partir d'une graine entière sur chaque architecture CPU, tous les joueurs du monde reçoivent exactement les mêmes indices, les mêmes points de blocage et l'unique solution. Ce déterminisme total supprime le facteur chance : face à vos amis ou dans le Top 20 mondial, seul comptent la vitesse de balayage, la clarté des notes et la finesse déductive.",
      },
    ],
    whatIsBullets: [
      [
        { text: "Parité mondiale déterministe :", strong: true },
        {
          text: " Chaque appareil reconstruit localement la même grille de 81 cases depuis la graine du jour, assurant un accès hors ligne immédiat et zéro écart entre web et mobile.",
        },
      ],
      [
        { text: "Règles de tournoi uniformisées :", strong: true },
        {
          text: " Chaque grille quotidienne impose un chronomètre actif et une limite stricte de trois erreurs, transformant la partie solo en compétition mondiale équitable et en Course Quotidienne entre Amis.",
        },
      ],
    ],
    scalingHeading:
      "Progression hebdomadaire : des Singletons du lundi aux chaînes du week-end",
    scalingIntro: [
      {
        text: "Les meilleures rubriques de jeux logiques suivent une cadence progressive sur la semaine plutôt qu'une difficulté uniforme. Notre moteur quotidien reproduit cette montée en puissance sur sept jours—du balayage visuel fluide du lundi aux grilles épurées de niveau tournoi intégrant de véritables ",
      },
      { text: "impasses 0-Single", strong: true },
      { text: " et des chaînes " },
      { text: "Skyscraper", strong: true },
      { text: " dès le samedi :" },
    ],
    scalingTiers: [
      {
        title: "Lundi — Mise en train Facile (51 indices)",
        body: [
          {
            text: "Calibrée pour un balayage vif grâce à une répartition équilibrée des blocs 3×3. Chaque étape se débloque proprement par ",
          },
          { text: "Singletons Nus", strong: true },
          { text: " et " },
          { text: "Singletons Cachés", strong: true },
          {
            text: " sans même poser de notes au crayon—idéal pour lancer la semaine en rythme.",
          },
        ],
      },
      {
        title: "Mardi & Mercredi — Rythme Moyen (39 indices)",
        body: [
          {
            text: "Passe à 42 cases vides afin que l'observation directe s'essouffle naturellement à mi-parcours. Il faut alors exploiter les interactions bloc-ligne, les ",
          },
          { text: "Pointing Pairs (Paires pointantes)", strong: true },
          {
            text: " et une prise de notes rigoureuse pour garder l'élan.",
          },
        ],
      },
      {
        title: "Jeudi & Vendredi — Blocages Difficiles (30 indices)",
        body: [
          {
            text: "Contrôlée par notre évaluateur logique humain pour créer de vraies ",
          },
          { text: "impasses 0-Single", strong: true },
          {
            text: " où aucune ligne, colonne ou région n'offre plus de chiffre immédiat. Débloquer la suite exige ",
          },
          { text: "Candidats Bloqués (Locked Candidates)", strong: true },
          { text: ", " },
          { text: "Paires Nues/Cachées", strong: true },
          { text: " et " },
          { text: "Triplets", strong: true },
          { text: "." },
        ],
      },
      {
        title: "Samedi — Rareté Expert (25 indices)",
        body: [
          { text: "Applique la " },
          { text: "Rareté Stricte des Chiffres (Strict Digit Starvation)", strong: true },
          {
            text: " en retenant les chiffres d'ancrage faciles dès le départ. Franchir les verrous du samedi demande des éliminations longue portée : ",
          },
          { text: "Skyscraper", strong: true },
          { text: ", " },
          { text: "2-String Kites", strong: true },
          { text: ", " },
          { text: "X-Wings", strong: true },
          { text: " et " },
          { text: "Y-Wings", strong: true },
          { text: "." },
        ],
      },
    ],
    sundayMasterCard: {
      title: "Dimanche — Épreuve Maître (23 indices)",
      body: [
        {
          text: "Réservée au défi phare du dimanche avec seulement 23 indices et 58 cases vides. Validées par unicité bitmask MRV et passes anti-singletons, les grilles Maître dominicales exigent un élagage constant des candidats, des chaînes d'inférence alternées et des éliminations Skyscraper poussées du début à la fin.",
        },
      ],
    },
    crossLinkPrefix:
      "Si vous bloquez en pleine grille de journal ou souhaitez vérifier qu'une grille personnalisée à 25 indices possède bien une solution unique avant de travailler les Skyscraper ou X-Wing, importez-la dans notre ",
    crossLinkLabel: "Solveur de Sudoku gratuit",
    crossLinkSuffix:
      " pour repérer les conflits en direct, prouver l'unicité ou jouer la grille de façon interactive.",
    streakHeading: "Construire une série quotidienne et entretenir son esprit",
    streakP1: [
      {
        text: "Consacrer cinq à quinze minutes par jour au raisonnement déductif structuré reste l'un des moyens les plus efficaces de garder les fonctions exécutives vives. Loin des jeux mobiles nerveux fondés sur la surcharge sensorielle, le Sudoku sollicite la ",
      },
      { text: "mémoire de travail", strong: true },
      { text: ", l'" },
      { text: "attention sélective soutenue", strong: true },
      { text: " et la " },
      { text: "reconnaissance spatiale des motifs", strong: true },
      {
        text: " dans un calme méthodique. Pratiquer régulièrement les sept paliers entraîne l'œil à repérer paires conjuguées et alignements avant même de scanner chaque case.",
      },
    ],
    streakP2: [
      {
        text: "Notre système de séries est pensé pour récompenser la régularité réelle au jour le jour tout en vous laissant rattraper vos grilles manquées à votre rythme :",
      },
    ],
    streakBullets: [
      [
        { text: "Calcul authentique des séries :", strong: true },
        { text: " Résoudre la grille du jour à sa date calendaire prolonge votre " },
        { text: "Série actuelle", strong: true },
        { text: " et actualise votre " },
        { text: "Meilleure série", strong: true },
        {
          text: " record. Les parties jouées en Archive augmentent votre total résolu sans gonfler artificiellement les jours consécutifs.",
        },
      ],
      [
        { text: "Synchro multi-appareils & coffres isolés :", strong: true },
        {
          text: " En vous connectant, calendrier, temps et paliers de série sont sauvegardés sur Cloud Firestore ; en mode Invité, tout reste dans un stockage local strictement cloisonné sans mélange de données.",
        },
      ],
    ],
    keyboardHeading: "Jeu rapide sur ordinateur : raccourcis clavier du Défi du Jour",
    keyboardIntro: [
      { text: "Pour viser le " },
      { text: "Top 20 du classement quotidien", strong: true },
      {
        text: ", chaque aller-retour de souris compte. Chaque grille du Défi du Jour prend en charge nos six raccourcis clavier essentiels :",
      },
    ],
    keyboardShortcuts: [
      {
        keys: "1–9 / Pavé num. 1–9",
        title: "Saisie double zone des chiffres",
        desc: "Tapez vos réponses et candidats avec la rangée supérieure ou le pavé numérique dédié sans aucune latence.",
      },
      {
        keys: "Backspace / Suppr",
        title: "Effacement immédiat",
        desc: "Supprimez une annotation au crayon ou une saisie douteuse d'une simple touche sans quitter la case des yeux.",
      },
      {
        keys: "Ctrl + Z / Cmd + Z",
        title: "Annulation en un geste",
        desc: "Revenez en arrière sur Windows, Linux ou macOS sans casser votre cadence de résolution.",
      },
      {
        keys: "Espace / N",
        title: "Bascule Notes au crayon",
        desc: "Passez instantanément du mode chiffre au mode notes ; Espace est intercepté pour éviter le défilement de la page.",
      },
      {
        keys: "H",
        title: "Indice stratégique",
        desc: "Bloqué sur une grille Expert du dimanche ? Appuyez sur H pour obtenir un indice ciblé depuis le plateau.",
      },
      {
        keys: "Flèches • Tab / Échap",
        title: "Navigation clavier et menus",
        desc: "Parcourez la grille 9×9 et les listes déroulantes avec les flèches, guidé par des anneaux de focus bien visibles.",
      },
    ],
    faqHeading: "Foire aux questions — Défi du Jour",
    faqs: [
      {
        q: "Comment sont calculés le score et le classement du Défi du Jour ?",
        a: [
          {
            text: "La performance repose d'abord sur une résolution propre sans atteindre la limite des 3 erreurs. Dans le Top 20 mondial et la Course Quotidienne entre Amis, les vainqueurs sont classés avant tout selon le ",
          },
          { text: "meilleur temps de résolution", strong: true },
          {
            text: ", un faible nombre d'erreurs et l'absence d'indices servant de repères naturels de maîtrise.",
          },
        ],
      },
      {
        q: "Puis-je rejouer aux défis quotidiens passés que j'ai manqués ?",
        a: [
          {
            text: "Oui. Chaque date antérieure du calendrier mensuel lun–dim reste débloquée en permanence via le ",
          },
          { text: "Jeu d'Archive (Archive Play)", strong: true },
          {
            text: ". Cliquer sur une date passée génère exactement la grille déterministe de ce jour-là et incrémente votre total résolu une fois terminée, hors calcul de série quotidienne.",
          },
        ],
      },
      {
        q: "Les grilles quotidiennes sont-elles générées par IA ou par logique humaine déterministe ?",
        a: [
          {
            text: "Elles reposent sur des mathématiques déterministes et des règles de déduction humaine—jamais sur des approximations d'IA générative. Chaque grille associe le PRNG ",
          },
          { text: "mulberry32", strong: true },
          { text: " indexé par la date à notre " },
          { text: "humanDifficultyEngine", strong: true },
          {
            text: ", garantissant l'unicité par backtracking bitmask MRV et de vrais paliers comme les ",
          },
          { text: "impasses 0-Single", strong: true },
          { text: ", chaînes " },
          { text: "Skyscraper", strong: true },
          { text: " et " },
          { text: "2-String Kites", strong: true },
          { text: "." },
        ],
      },
      {
        q: "Que se passe-t-il si je fais 3 erreurs sur le défi d'aujourd'hui ?",
        a: [
          {
            text: "La troisième erreur clôt la tentative officielle compétitive de cette date en ",
          },
          { text: "Échec (3/3)", strong: true },
          {
            text: " afin de préserver l'équité du classement. Comme une seule tentative officielle est validée par jour, la prise de notes rigoureuse et la vérification patiente avant de poser un chiffre sont primordiales du jeudi au dimanche.",
          },
        ],
      },
    ],
  },

  it: {
    articleAriaLabel: "Guida alla Sfida del Giorno Sudoku e scala settimanale",
    whatIsHeading: "Che cos'è la Sfida del Giorno Sudoku?",
    whatIsP1: [
      { text: "La " },
      { text: "Sfida del Giorno Sudoku", strong: true },
      {
        text: " è una prova di logica sincronizzata a livello globale, pensata perché ogni giocatore—da browser desktop, tablet o app Android—affronti esattamente la stessa griglia 9×9 in ogni giornata di calendario. Invece di servire schemi casuali diversi per utente, il nostro generatore lega la data (",
      },
      { text: "SUDOKU_DAILY:YYYY-MM-DD", code: true },
      { text: ") a una pipeline deterministica che unisce " },
      { text: "hashing FNV-1a a 32 bit", strong: true },
      { text: ", un " },
      { text: "mixer valanga Murmur3", strong: true },
      { text: " e il generatore pseudocasuale puro " },
      { text: "mulberry32", strong: true },
      { text: "." },
    ],
    whatIsP2: [
      { text: "Poiché " },
      { text: "mulberry32", strong: true },
      {
        text: " genera la medesima sequenza numerica dallo stesso seme intero su qualsiasi architettura CPU, tutti i giocatori nel mondo ricevono gli stessi numeri iniziali, gli stessi snodi critici e l'identica soluzione univoca. Questo determinismo assoluto azzera il fattore fortuna: quando confronti i tempi con gli amici o sali nella Top-20 globale, contano solo colpo d'occhio, annotazioni ordinate e deduzione profonda.",
      },
    ],
    whatIsBullets: [
      [
        { text: "Parità globale deterministica:", strong: true },
        {
          text: " Ogni dispositivo ricostruisce localmente la stessa griglia da 81 celle partendo dal seme giornaliero, garantendo gioco offline immediato e zero differenze tra web e app.",
        },
      ],
      [
        { text: "Regolamento torneo unificato:", strong: true },
        {
          text: " Tutte le griglie giornaliere applicano cronometro attivo e limite rigido di 3 errori, trasformando la partita quotidiana in una sfida equa mondiale e nella Gara Giornaliera tra Amici.",
        },
      ],
    ],
    scalingHeading:
      "Difficoltà settimanale: dai Singoli del lunedì alle catene del weekend",
    scalingIntro: [
      {
        text: "Le migliori rubriche enigmistiche costruiscono un ritmo settimanale invece di una difficoltà piatta. Il nostro motore giornaliero segue questa progressione su sette giorni—partendo dal colpo d'occhio rapido del lunedì fino a schemi essenziali da torneo con autentici ",
      },
      { text: "stalli 0-Single", strong: true },
      { text: " e catene " },
      { text: "Skyscraper", strong: true },
      { text: " nel weekend:" },
    ],
    scalingTiers: [
      {
        title: "Lunedì — Riscaldamento Facile (51 indizi)",
        body: [
          {
            text: "Progettato per una scansione veloce con distribuzione equilibrata nei riquadri 3×3. Ogni passaggio scorre tramite ",
          },
          { text: "Singoli Nudi", strong: true },
          { text: " e " },
          { text: "Singoli Nascosti", strong: true },
          {
            text: " senza bisogno di appunti a matita—perfetto per scaldare riflessi e precisione a inizio settimana.",
          },
        ],
      },
      {
        title: "Martedì & Mercoledì — Ritmo Medio (39 indizi)",
        body: [
          {
            text: "Scende a 42 caselle vuote così che le mosse dirette si diradino naturalmente a metà partita. Occorre passare alle interazioni blocco-linea, ai ",
          },
          { text: "Pointing Pairs", strong: true },
          {
            text: " e a candidati ordinati mantenendo alta la fluidità.",
          },
        ],
      },
      {
        title: "Giovedì & Venerdì — Snodi Difficili (30 indizi)",
        body: [
          {
            text: "Verificato dal nostro controllore di logica umana per produrre veri ",
          },
          { text: "stalli 0-Single", strong: true },
          {
            text: " in cui nessuna riga, colonna o riquadro offre cifre immediate. Per proseguire servono ",
          },
          { text: "Candidati Bloccati (Locked Candidates)", strong: true },
          { text: ", " },
          { text: "Coppie Nude/Nascoste", strong: true },
          { text: " e " },
          { text: "Terzine (Triples)", strong: true },
          { text: "." },
        ],
      },
      {
        title: "Sabato — Carenza Esperto (25 indizi)",
        body: [
          { text: "Applica " },
          { text: "Strict Digit Starvation", strong: true },
          {
            text: " trattenendo le cifre d'appoggio più frequenti all'inizio. Superare i blocchi del sabato richiede eliminazioni a lungo raggio come catene ",
          },
          { text: "Skyscraper", strong: true },
          { text: ", " },
          { text: "2-String Kites", strong: true },
          { text: ", " },
          { text: "X-Wing", strong: true },
          { text: " e " },
          { text: "Y-Wing", strong: true },
          { text: "." },
        ],
      },
    ],
    sundayMasterCard: {
      title: "Domenica — Prova Master (23 indizi)",
      body: [
        {
          text: "Riservata alla sfida regina della domenica con appena 23 cifre date e 58 caselle libere. Convalidata da controlli di unicità bitmask MRV e passaggi anti-singolo, la griglia Master domenicale mette alla prova potatura costante dei candidati, catene di inferenza alternate ed eliminazioni Skyscraper profonde dall'inizio alla fine.",
        },
      ],
    },
    crossLinkPrefix:
      "Se ti blocchi a metà di uno schema su carta o vuoi verificare che una griglia personalizzata da 25 indizi abbia soluzione unica prima di esercitarti con Skyscraper o X-Wing, caricala nel nostro ",
    crossLinkLabel: "Risolutore Sudoku gratuito",
    crossLinkSuffix:
      " per individuare conflitti in tempo reale, certificare l'unicità o giocarla in modo interattivo.",
    streakHeading: "Costruire una serie quotidiana e allenare la mente",
    streakP1: [
      {
        text: "Dedicare dai cinque ai quindici minuti al giorno al ragionamento deduttivo strutturato è uno dei modi più semplici per mantenere vivaci le funzioni esecutive. A differenza dei giochi frenetici basati sul sovraccarico sensoriale, il Sudoku allena ",
      },
      { text: "memoria di lavoro", strong: true },
      { text: ", " },
      { text: "attenzione selettiva sostenuta", strong: true },
      { text: " e " },
      { text: "riconoscimento spaziale dei pattern", strong: true },
      {
        text: " in modo calmo e mirato. Esercitarsi con regolarità su tutti e sette i livelli allena l'occhio a cogliere coppie coniugate e incroci di linea ancora prima di leggere singole celle.",
      },
    ],
    streakP2: [
      {
        text: "La nostra struttura delle serie premia in modo trasparente la costanza quotidiana, lasciandoti comunque recuperare con calma le sfide perse:",
      },
    ],
    streakBullets: [
      [
        { text: "Conteggio autentico della serie:", strong: true },
        { text: " Risolvere lo schema odierno nella sua data effettiva estende la " },
        { text: "Serie attuale", strong: true },
        { text: " e aggiorna il tuo record " },
        { text: "Miglior serie", strong: true },
        {
          text: ". I completamenti in Archivio incrementano il totale risolto senza gonfiare artificialmente i giorni consecutivi.",
        },
      ],
      [
        { text: "Sync multi-dispositivo e isolamento archivio:", strong: true },
        {
          text: " Con l'accesso Google, calendario, tempi e traguardi vengono salvati su Cloud Firestore; le sessioni Ospite restano invece in uno spazio locale separato senza alcuna commistione.",
        },
      ],
    ],
    keyboardHeading: "Velocità su desktop: scorciatoie da tastiera per la classifica giornaliera",
    keyboardIntro: [
      { text: "Entrare nella " },
      { text: "Top-20 di velocità della Sfida del Giorno", strong: true },
      {
        text: " significa ridurre a zero gli spostamenti del mouse. Ogni griglia quotidiana supporta tutte e sei le scorciatoie principali:",
      },
    ],
    keyboardShortcuts: [
      {
        keys: "1–9 / Numpad 1–9",
        title: "Inserimento cifre a doppia zona",
        desc: "Digita soluzioni definitive o candidati a matita sia con la riga numerica superiore sia con il tastierino numerico.",
      },
      {
        keys: "Backspace / Canc",
        title: "Cancellazione immediata",
        desc: "Rimuovi al volo appunti o cifre provvisorie senza dover cliccare il pulsante Gomma sullo schermo.",
      },
      {
        keys: "Ctrl + Z / Cmd + Z",
        title: "Annulla istantaneo",
        desc: "Correggi subito un clic errato su Windows, Linux o macOS mantenendo fluido il ritmo sul timer.",
      },
      {
        keys: "Spazio / N",
        title: "Attiva/Disattiva Note",
        desc: "Alterna tra inserimento normale e modalità matita senza staccare le dita: Spazio non fa scorrere la pagina.",
      },
      {
        keys: "H",
        title: "Suggerimento logico",
        desc: "In difficoltà sulla sfida Esperta della domenica? Premi H per richiamare un aiuto mirato direttamente sulla griglia.",
      },
      {
        keys: "Frecce • Tab / Esc",
        title: "Navigazione griglia e menu",
        desc: "Spostati tra celle e menu aperti con i tasti freccia e segui chiaramente i contorni di focus con Tab.",
      },
    ],
    faqHeading: "Domande frequenti sulla Sfida del Giorno",
    faqs: [
      {
        q: "Come vengono calcolati punteggio e classifiche nella Sfida del Giorno?",
        a: [
          {
            text: "Tutto ruota sul completare la griglia in modo pulito senza raggiungere il tetto dei 3 errori. Nella Top-20 globale e nella Gara Giornaliera tra Amici, chi completa lo schema viene ordinato principalmente per ",
          },
          { text: "minor tempo di risoluzione", strong: true },
          {
            text: ", mentre meno errori e partite senza aiuti fungono da naturali indicatori di precisione.",
          },
        ],
      },
      {
        q: "Posso giocare le sfide giornaliere passate che ho saltato?",
        a: [
          {
            text: "Sì. Ogni giorno precedente nel calendario mensile lun–dom resta sempre sbloccato tramite il ",
          },
          { text: "Gioco d'Archivio (Archive Play)", strong: true },
          {
            text: ". Toccando una data passata si ricrea l'esatta griglia deterministica di quel giorno e la vittoria aggiorna il Totale Risolti, pur rimanendo esclusa dal conteggio della serie giornaliera.",
          },
        ],
      },
      {
        q: "Gli schemi del giorno sono creati dall'IA o da logica umana deterministica?",
        a: [
          {
            text: "Nascono da matematica deterministica e regole di deduzione umane—mai da tentativi di IA generativa. Ogni griglia combina il PRNG ",
          },
          { text: "mulberry32", strong: true },
          { text: " legato alla data con il nostro " },
          { text: "humanDifficultyEngine", strong: true },
          {
            text: ", verificando l'unicità via bitmask MRV e assicurando ostacoli reali come ",
          },
          { text: "stalli 0-Single", strong: true },
          { text: ", catene " },
          { text: "Skyscraper", strong: true },
          { text: " e " },
          { text: "2-String Kites", strong: true },
          { text: "." },
        ],
      },
      {
        q: "Cosa succede se commetto 3 errori nella sfida di oggi?",
        a: [
          {
            text: "Al terzo errore la partita competitiva ufficiale di quella data si chiude come ",
          },
          { text: "Fallita (3/3)", strong: true },
          {
            text: " per tutelare l'equità della classifica. Poiché vale un solo tentativo ufficiale al giorno, annotazioni costanti e verifica attenta prima di inserire cifre fanno la differenza da giovedì a domenica.",
          },
        ],
      },
    ],
  },

  "pt-BR": {
    articleAriaLabel: "Guia do Desafio Diário de Sudoku e escala semanal de dificuldade",
    whatIsHeading: "O que é o Desafio Diário de Sudoku?",
    whatIsP1: [
      { text: "O " },
      { text: "Desafio Diário de Sudoku", strong: true },
      {
        text: " é um marco lógico sincronizado globalmente para que qualquer jogador—seja no navegador do computador, no tablet ou no app Android—enfrente exatamente a mesma grade 9×9 em cada dia do calendário. Em vez de entregar quebra-cabeças aleatórios diferentes por usuário, nosso gerador vincula a data (",
      },
      { text: "SUDOKU_DAILY:YYYY-MM-DD", code: true },
      { text: ") a um pipeline determinístico que combina " },
      { text: "hash FNV-1a de 32 bits", strong: true },
      { text: ", um " },
      { text: "misturador avalanche Murmur3", strong: true },
      { text: " e o gerador pseudoaleatório puro " },
      { text: "mulberry32", strong: true },
      { text: "." },
    ],
    whatIsP2: [
      { text: "Como o " },
      { text: "mulberry32", strong: true },
      {
        text: " gera exatamente a mesma sequência numérica a partir da mesma semente inteira em qualquer arquitetura de CPU, todos no mundo recebem pistas idênticas, os mesmos gargalos e a mesma solução única. Esse determinismo absoluto elimina qualquer fator sorte: ao comparar tempos com amigos ou subir no Top-20 global, vencer depende só de varredura ágil, notas limpas e raciocínio preciso.",
      },
    ],
    whatIsBullets: [
      [
        { text: "Paridade global determinística:", strong: true },
        {
          text: " Cada aparelho monta as mesmas 81 casas diretamente da semente da data, garantindo funcionamento offline imediato e zero diferença entre web e celular.",
        },
      ],
      [
        { text: "Regras padronizadas de torneio:", strong: true },
        {
          text: " Todas as grades diárias trazem cronômetro ao vivo e limite rígido de 3 erros, transformando o jogo solo de todo dia em competição global justa e na Corrida Diária de Amigos.",
        },
      ],
    ],
    scalingHeading:
      "Escala semanal de dificuldade: dos Únicos de segunda às cadeias do fim de semana",
    scalingIntro: [
      {
        text: "Boas publicações de lógica constroem ritmo ao longo da semana em vez de repetir uma dificuldade plana. Nosso motor diário segue essa cadência de sete dias—começando com varredura visual fluida na segunda-feira até chegar a grades enxutas de torneio com ",
      },
      { text: "bloqueios 0-Single", strong: true },
      { text: " intencionais e cadeias " },
      { text: "Skyscraper", strong: true },
      { text: " no sábado e no domingo:" },
    ],
    scalingTiers: [
      {
        title: "Segunda-feira — Aquecimento Fácil (51 pistas)",
        body: [
          {
            text: "Calibrado para leitura rápida com distribuição equilibrada nos blocos 3×3. Cada passo fecha com naturalidade por ",
          },
          { text: "Únicos Nus", strong: true },
          { text: " e " },
          { text: "Únicos Ocultos", strong: true },
          {
            text: " sem exigir notas a lápis—ótimo para aquecer velocidade e precisão no início da semana.",
          },
        ],
      },
      {
        title: "Terça e Quarta — Fluxo Médio (39 pistas)",
        body: [
          {
            text: "Reduz a grade para 42 casas vazias para que jogadas diretas rareiem naturalmente no meio do jogo. Exige transitar para interações bloco-linha, ",
          },
          { text: "Pointing Pairs", strong: true },
          {
            text: " e anotação disciplinada de candidatos mantendo o ritmo constante.",
          },
        ],
      },
      {
        title: "Quinta e Sexta — Gargalos Difíceis (30 pistas)",
        body: [
          {
            text: "Validado pelo nosso avaliador de lógica humana para forçar autênticos ",
          },
          { text: "bloqueios 0-Single", strong: true },
          {
            text: ", onde nenhuma linha, coluna ou bloco entrega dígitos imediatos. Avançar exige ",
          },
          { text: "Candidatos Bloqueados (Locked Candidates)", strong: true },
          { text: ", " },
          { text: "Pares Nus/Ocultos", strong: true },
          { text: " e " },
          { text: "Trios (Triples)", strong: true },
          { text: "." },
        ],
      },
      {
        title: "Sábado — Escassez Especialista (25 pistas)",
        body: [
          { text: "Aplica " },
          { text: "Escassez Estrita de Dígitos (Strict Digit Starvation)", strong: true },
          {
            text: " retendo âncoras fáceis no início. Romper os impasses do sábado pede técnicas de eliminação de longo alcance como cadeias ",
          },
          { text: "Skyscraper", strong: true },
          { text: ", " },
          { text: "2-String Kites", strong: true },
          { text: ", " },
          { text: "X-Wings", strong: true },
          { text: " e " },
          { text: "Y-Wings", strong: true },
          { text: "." },
        ],
      },
    ],
    sundayMasterCard: {
      title: "Domingo — Desafio Mestre (23 pistas)",
      body: [
        {
          text: "Reservado ao desafio máximo de domingo com apenas 23 pistas e 58 casas vazias. Verificadas por unicidade bitmask MRV e passes anti-único, as grades Mestre dominicais testam poda contínua de candidatos, cadeias de inferência alternadas e eliminações profundas com Skyscraper do começo ao fim.",
        },
      ],
    },
    crossLinkPrefix:
      "Se você travar no meio de um Sudoku de jornal ou quiser conferir se uma grade personalizada de 25 pistas tem solução única antes de treinar Skyscraper ou X-Wing, carregue-a no nosso ",
    crossLinkLabel: "Solucionador de Sudoku grátis",
    crossLinkSuffix:
      " para checar conflitos na hora, confirmar a unicidade ou jogar de modo interativo.",
    streakHeading: "Construir sequência diária e hábito de treino mental",
    streakP1: [
      {
        text: "Dedicar de cinco a quinze minutos por dia ao raciocínio dedutivo estruturado é uma das formas mais simples de manter a cognição executiva afiada. Ao contrário de jogos frenéticos baseados em sobrecarga sensorial, o Sudoku exercita a ",
      },
      { text: "memória de trabalho", strong: true },
      { text: ", a " },
      { text: "atenção seletiva sustentada", strong: true },
      { text: " e o " },
      { text: "reconhecimento espacial de padrões", strong: true },
      {
        text: " em um ritmo calmo e deliberado. Praticar com constância nos sete níveis treina seu olhar para notar pares conjugados e cruzamentos antes mesmo de conferir célula por célula.",
      },
    ],
    streakP2: [
      {
        text: "Nosso sistema de sequência recompensa a regularidade real do dia a dia sem impedir que você coloque desafios atrasados em dia no seu próprio ritmo:",
      },
    ],
    streakBullets: [
      [
        { text: "Contagem autêntica de sequência:", strong: true },
        { text: " Concluir o desafio de hoje dentro da data atual amplia sua " },
        { text: "Sequência atual", strong: true },
        { text: " e atualiza seu recorde de " },
        { text: "Melhor sequência", strong: true },
        {
          text: ". Vitórias no Modo Arquivo somam ao Total Resolvido sem inflar artificialmente os dias consecutivos.",
        },
      ],
      [
        { text: "Sincronização entre aparelhos e isolamento:", strong: true },
        {
          text: " Ao fazer login, seu histórico do calendário, tempos e marcos ficam salvos no Cloud Firestore; sessões de Visitante usam um cofre local isolado sem vazar dados entre contas.",
        },
      ],
    ],
    keyboardHeading: "Velocidade no desktop: atalhos de teclado para o ranking diário",
    keyboardIntro: [
      { text: "Alcançar o " },
      { text: "Top-20 de velocidade do Desafio Diário", strong: true },
      {
        text: " exige eliminar movimentos extras do mouse. Toda grade diária suporta os seis atalhos completos de teclado:",
      },
    ],
    keyboardShortcuts: [
      {
        keys: "1–9 / Numpad 1–9",
        title: "Entrada dupla de dígitos",
        desc: "Preencha respostas finais ou candidatos usando tanto os números superiores quanto o teclado numérico dedicado.",
      },
      {
        keys: "Backspace / Delete",
        title: "Limpeza sem atrito",
        desc: "Apague anotações a lápis ou células duvidosas com um único toque, sem buscar o botão na tela.",
      },
      {
        keys: "Ctrl + Z / Cmd + Z",
        title: "Desfazer instantâneo",
        desc: "Volte um passo na hora no Windows, Linux ou macOS sem quebrar o ritmo do seu cronômetro.",
      },
      {
        keys: "Espaço / N",
        title: "Alternar Notas a lápis",
        desc: "Troque entre valor fixo e rascunho em movimento—a barra de Espaço alterna sem rolar a página.",
      },
      {
        keys: "H",
        title: "Dica lógica na grade",
        desc: "Travou no Desafio Expert de domingo? Pressione H para acionar uma dica diretamente no tabuleiro.",
      },
      {
        keys: "Setas • Tab / Esc",
        title: "Navegação na grade e menus",
        desc: "Percorra células e opções de menu com as setas direcionais acompanhado por anéis de foco nítidos via Tab.",
      },
    ],
    faqHeading: "Perguntas frequentes sobre o Desafio Diário",
    faqs: [
      {
        q: "Como funcionam a pontuação e o ranking do Desafio Diário?",
        a: [
          {
            text: "Seu desempenho depende de fechar a grade com precisão sem atingir o teto de 3 erros. No Top-20 global e na Corrida Diária de Amigos, quem conclui o tabuleiro é classificado principalmente pelo ",
          },
          { text: "menor tempo de resolução", strong: true },
          {
            text: ", com menos erros e partidas sem dicas como marcos naturais de eficiência.",
          },
        ],
      },
      {
        q: "Posso jogar desafios diários passados que perdi?",
        a: [
          {
            text: "Sim. Toda data anterior no calendário mensal de segunda a domingo permanece desbloqueada para sempre pelo ",
          },
          { text: "Modo Arquivo (Archive Play)", strong: true },
          {
            text: ". Tocar em qualquer dia passado gera exatamente o quebra-cabeça determinístico daquela data e soma ao seu Total Resolvido ao concluir, ficando fora do cálculo de sequência diária.",
          },
        ],
      },
      {
        q: "Os desafios diários são criados por IA ou por lógica humana determinística?",
        a: [
          {
            text: "São gerados com matemática determinística e regras humanas de dedução—nunca por chutes de IA generativa. Cada tabuleiro combina o PRNG ",
          },
          { text: "mulberry32", strong: true },
          { text: " baseado na data ao nosso " },
          { text: "humanDifficultyEngine", strong: true },
          {
            text: ", validando unicidade via backtracking bitmask MRV e garantindo barreiras reais como ",
          },
          { text: "bloqueios 0-Single", strong: true },
          { text: ", cadeias " },
          { text: "Skyscraper", strong: true },
          { text: " e " },
          { text: "2-String Kites", strong: true },
          { text: "." },
        ],
      },
      {
        q: "O que acontece se eu cometer 3 erros no desafio de hoje?",
        a: [
          {
            text: "Ao cometer o terceiro erro, a tentativa competitiva oficial daquela data é encerrada como ",
          },
          { text: "Falhou (3/3)", strong: true },
          {
            text: " para preservar a justiça do ranking. Como o calendário registra apenas uma tentativa oficial por dia, manter notas consistentes e revisar antes de confirmar dígitos faz toda a diferença de quinta a domingo.",
          },
        ],
      },
    ],
  },
};

export function getDailyArticleCopy(lang?: string | null): DailyArticleCopy {
  const normalized = (lang || "en").trim().toLowerCase();
  if (normalized === "hi" || normalized.startsWith("hi-")) {
    return DAILY_ARTICLE_TRANSLATIONS.hi;
  }
  if (normalized === "de" || normalized.startsWith("de-")) {
    return DAILY_ARTICLE_TRANSLATIONS.de;
  }
  if (normalized === "ja" || normalized.startsWith("ja-")) {
    return DAILY_ARTICLE_TRANSLATIONS.ja;
  }
  if (normalized === "ko" || normalized.startsWith("ko-")) {
    return DAILY_ARTICLE_TRANSLATIONS.ko;
  }
  if (normalized === "es" || normalized.startsWith("es-")) {
    return DAILY_ARTICLE_TRANSLATIONS.es;
  }
  if (normalized === "fr" || normalized.startsWith("fr-")) {
    return DAILY_ARTICLE_TRANSLATIONS.fr;
  }
  if (normalized === "it" || normalized.startsWith("it-")) {
    return DAILY_ARTICLE_TRANSLATIONS.it;
  }
  if (normalized === "pt-br" || normalized.startsWith("pt")) {
    return DAILY_ARTICLE_TRANSLATIONS["pt-BR"];
  }
  return DAILY_ARTICLE_TRANSLATIONS.en;
}

