import { Language } from "../i18n/translations";

/**
 * 9-locale editorial dictionary for the three dedicated /guides/* routes.
 *
 * Every statement is grounded in features that exist in the Sudoku Sync codebase:
 * - Classic 9x9 Sudoku: Easy 51 / Medium 39 / Hard 30 / Expert 25 clues, Daily Challenge, Sudoku Solver.
 * - Same-board live & asynchronous multiplayer: 6-digit numeric Room Codes, optional Room PIN,
 *   ?room= direct browser share links, Recent Players tab, Friends list (Google Sign-In sync),
 *   Ghost Mode, automatic result sync + notifications.
 * - The 7 Smart Assistants (Auto-Notes is Hard/Expert only) and the Strict Mistake Limit (3/3).
 */

export type GuideSlug = "multiplayer-sudoku" | "beginner-sudoku" | "advanced-patterns";

export const GUIDE_SLUGS: readonly GuideSlug[] = [
  "multiplayer-sudoku",
  "beginner-sudoku",
  "advanced-patterns",
] as const;

export const GUIDE_PATHS: Record<GuideSlug, string> = {
  "multiplayer-sudoku": "/guides/multiplayer-sudoku",
  "beginner-sudoku": "/guides/beginner-sudoku",
  "advanced-patterns": "/guides/advanced-patterns",
};

export interface GuideSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface GuideFaq {
  question: string;
  answer: string;
}

/** Localized anchor labels for internal cross-links. */
export interface GuideLinkLabels {
  rules: string;
  solver: string;
  daily: string;
  about: string;
  multiplayerGuide: string;
  beginnerGuide: string;
  advancedGuide: string;
}

/** Localized direct-practice call-to-action labels. */
export interface GuidePracticeLabels {
  easy: string;
  medium: string;
  hard: string;
  expert: string;
  daily: string;
  multiplayer: string;
}

export interface GuideNavCopy {
  relatedLinksTitle: string;
  practiceTitle: string;
  linkLabels: GuideLinkLabels;
  practiceLabels: GuidePracticeLabels;
}

export interface GuideArticleContent extends GuideNavCopy {
  slug: GuideSlug;
  badge: string;
  title: string;
  subtitle: string;
  metaTitle: string;
  metaDescription: string;
  readTimeLabel: string;
  /** 4 to 5 structured editorial sections. */
  sections: GuideSection[];
  proTipTitle: string;
  proTipBody: string;
  faqTitle: string;
  /** Exactly 3 targeted Q&As per guide. */
  faqs: readonly [GuideFaq, GuideFaq, GuideFaq];
  crossLinkIntro: string;
}

// ---------------------------------------------------------------------------
// EN
// ---------------------------------------------------------------------------

const NAV_EN: GuideNavCopy = {
  relatedLinksTitle: "Keep Learning",
  practiceTitle: "Practice What You Read",
  linkLabels: {
    rules: "Sudoku Rules & Strategies",
    solver: "Sudoku Solver",
    daily: "Daily Challenge",
    about: "About Sudoku Sync",
    multiplayerGuide: "Multiplayer Sudoku Guide",
    beginnerGuide: "Beginner Sudoku Guide",
    advancedGuide: "Advanced Patterns Guide",
  },
  practiceLabels: {
    easy: "Play Easy",
    medium: "Play Medium",
    hard: "Play Hard",
    expert: "Play Expert",
    daily: "Play Today's Daily Challenge",
    multiplayer: "Start a Multiplayer Room",
  },
};

const GUIDES_EN: Record<GuideSlug, GuideArticleContent> = {
  "multiplayer-sudoku": {
    slug: "multiplayer-sudoku",
    ...NAV_EN,
    badge: "Multiplayer Guide",
    title: "How to Play Multiplayer Sudoku With Friends",
    subtitle:
      "Race on the exact same board, share a link in seconds, and compare results whenever everyone finishes. No lobby, no waiting.",
    metaTitle: "Multiplayer Sudoku Guide: Room Codes, Share Links & Friends",
    metaDescription:
      "Learn how same-board live and asynchronous multiplayer Sudoku works in Sudoku Sync: 6-digit Room Codes, optional PIN, direct share links, Friends and Ghost Mode.",
    readTimeLabel: "5 min read",
    sections: [
      {
        heading: "One Board, Zero Waiting",
        paragraphs: [
          "In Sudoku Sync multiplayer, every player receives the identical 9×9 puzzle. Nobody solves an easier or harder grid than anyone else, so the result is decided by logic and speed alone.",
          "There is no lobby to wait in. Each player's timer, progress and submission are independent, which means you can play live side by side or finish hours apart and still land on the same standings.",
        ],
      },
      {
        heading: "Create a Room in Four Steps",
        paragraphs: [
          "Open Multiplayer and choose Create. The room setup lets you decide the rules before anyone joins.",
        ],
        bullets: [
          "Pick a difficulty: Easy (51 clues), Medium (39), Hard (30) or Expert (25).",
          "Set the mistake limit, the hint limit and whether the timer is visible.",
          "Optionally lock the room with a Room PIN.",
          "Share the 6-digit numeric Room Code, or send a direct link.",
        ],
      },
      {
        heading: "Join With a Code or a Direct Link",
        paragraphs: [
          "To join, open Multiplayer, choose Join and type the 6-digit Room Code. If the host added a Room PIN, you enter it as well.",
          "Share links use the ?room= format. Opening one in any browser loads the board straight away, so friends can play on the web with nothing to install. Android and web players compete on the same board.",
        ],
      },
      {
        heading: "Recent Players, Friends and Ghost Mode",
        paragraphs: [
          "The invite list has two tabs. Recent Players shows people you have already played with, ready for a rematch. Friends is your persistent list.",
          "Signing in with Google syncs your Friends across devices. In Guest mode everything stays isolated on the device you are using. Ghost Mode hides your online presence whenever you want to play without being visible.",
        ],
      },
      {
        heading: "Results Arrive on Their Own",
        paragraphs: [
          "When a friend finishes later, the result syncs automatically and a notification tells you the race has finished. Open it to see the standings with finish time and mistakes for every participant.",
        ],
        bullets: [
          "Agree on the room limits before sending the code so everyone races under the same conditions.",
          "Smart Assistants are personal Settings, so decide together if you want a pure race.",
        ],
      },
    ],
    proTipTitle: "Pro Tip",
    proTipBody:
      "Set the mistake, hint and timer limits in the room setup before you share the code. Everyone then competes under identical conditions and the standings stay fair, even when players join at different times.",
    faqTitle: "Multiplayer FAQ",
    faqs: [
      {
        question: "Do my friends need to install the app?",
        answer:
          "No. A ?room= share link opens the same board in any browser. Friends can also install the Android app later and keep playing.",
      },
      {
        question: "Do I need an account to play with friends?",
        answer:
          "You can join and host as a Guest. Signing in with Google adds a persistent Friends list that syncs across devices, while Guest data stays isolated on your device.",
      },
      {
        question: "What happens if a friend finishes after I do?",
        answer:
          "Your result is saved and theirs is added to the standings the moment they finish. You receive a notification, so you never have to wait online.",
      },
    ],
    crossLinkIntro:
      "New to the game? Start with the Beginner Sudoku Guide and the Rules & Strategies page, or sharpen your solving speed with the Daily Challenge before your next race.",
  },
  "beginner-sudoku": {
    slug: "beginner-sudoku",
    ...NAV_EN,
    badge: "Beginner Guide",
    title: "Sudoku for Beginners: Your First Puzzle, Step by Step",
    subtitle:
      "Learn the one rule that matters, pick the right starting difficulty and use the built-in helpers to finish your first grid with confidence.",
    metaTitle: "Sudoku for Beginners: Rules, Easy Tips & Smart Assistants",
    metaDescription:
      "A calm beginner guide to classic 9×9 Sudoku: the core rule, how Easy, Medium, Hard and Expert differ, first techniques, pencil notes and Smart Assistants.",
    readTimeLabel: "6 min read",
    sections: [
      {
        heading: "The Only Rule You Need",
        paragraphs: [
          "Sudoku is played on a 9×9 grid made of nine 3×3 boxes. Fill every empty cell with a digit from 1 to 9 so that each row, each column and each 3×3 box contains every digit exactly once.",
          "You never need arithmetic and you never need to guess. Every Sudoku Sync puzzle has a single solution, so logic is always enough.",
        ],
      },
      {
        heading: "Choose Your First Difficulty",
        paragraphs: [
          "The four levels differ by how many digits are given at the start. More clues mean fewer empty cells and simpler deductions.",
        ],
        bullets: [
          "Easy: 51 clues (30 empty cells). The best place to start.",
          "Medium: 39 clues (42 empty cells).",
          "Hard: 30 clues (51 empty cells).",
          "Expert: 25 clues (56 empty cells).",
        ],
      },
      {
        heading: "Your First Three Techniques",
        paragraphs: [
          "Begin with scanning: pick a digit, look at where it already sits, and see which cells in a box are blocked by that digit's row and column.",
          "Then look for singles. A Naked Single is a cell that can only hold one digit. A Hidden Single is a digit that fits in only one cell of a row, column or box. When eight cells of a unit are filled, the last free cell is a Full House.",
        ],
      },
      {
        heading: "Pencil Notes and Smart Assistants",
        paragraphs: [
          "Notes let you write small candidate digits in a cell until you are sure. These helpers in Settings make learning smoother:",
        ],
        bullets: [
          "Highlight Identical Numbers marks every matching digit when you select a cell.",
          "Show Remaining Numbers displays how many of each digit are left to place.",
          "Highlight Related Area softly shades the row, column and box of the active cell.",
          "Auto-Remove Notes clears matching notes in connected cells when you place a digit.",
          "Fast Fill (Number-First) locks a digit so you can tap several cells in a row.",
          "Auto-Switch Completed Numbers moves on once all nine of a digit are placed.",
        ],
      },
      {
        heading: "Mistake Limit and Daily Habit",
        paragraphs: [
          "The Strict Mistake Limit (3/3) ends the game after three mistakes and trains careful play. You can switch it off in Settings while you are learning.",
          "A short Daily Challenge each day builds the habit, and the Sudoku Solver can check whether a puzzle you are stuck on is valid.",
        ],
      },
    ],
    proTipTitle: "Pro Tip",
    proTipBody:
      "Start each puzzle with the digit that already appears most often. It has the fewest places left to go, so it usually produces the first confident placements.",
    faqTitle: "Beginner FAQ",
    faqs: [
      {
        question: "Which difficulty should I play first?",
        answer:
          "Easy. With 51 clues it can be solved with scanning and single-digit deductions, which are the foundation for every harder level.",
      },
      {
        question: "Do I ever have to guess?",
        answer:
          "No. Every puzzle has exactly one solution and can be solved by logic. If you feel forced to guess, re-check your notes or look for a technique you have not used yet.",
      },
      {
        question: "What is the Mistake Limit?",
        answer:
          "It is a Smart Setting called Strict Mistake Limit (3/3). A wrong digit counts as a mistake and the game ends at three. You can turn it off in Settings.",
      },
    ],
    crossLinkIntro:
      "When singles feel easy, read the Advanced Patterns Guide. To play with a friend on the same board, see the Multiplayer Sudoku Guide, and keep the Rules & Strategies page handy as a reference.",
  },
  "advanced-patterns": {
    slug: "advanced-patterns",
    ...NAV_EN,
    badge: "Advanced Guide",
    title: "Advanced Sudoku Patterns for Hard and Expert Puzzles",
    subtitle:
      "Move beyond singles with pairs, intersections, X-Wing, Skyscraper, 2-String Kite and Y-Wing, and use notes the way strong solvers do.",
    metaTitle: "Advanced Sudoku Patterns: X-Wing, Y-Wing, Pairs & More",
    metaDescription:
      "Step up to Hard and Expert Sudoku with naked and hidden pairs, pointing pairs, box-line reduction, X-Wing, Skyscraper, 2-String Kite and Y-Wing.",
    readTimeLabel: "8 min read",
    sections: [
      {
        heading: "Build a Reliable Notes Workflow",
        paragraphs: [
          "Advanced patterns depend on accurate candidate notes. Auto-Notes fills candidates in empty cells and is available on Hard and Expert only, while Auto-Remove Notes keeps them clean as you place digits.",
          "Fill notes once, then update them after every placement. A single stale note can make a pattern look valid when it is not.",
        ],
      },
      {
        heading: "Naked and Hidden Pairs and Triples",
        paragraphs: [
          "A Naked Pair is two cells in a unit that share the same two candidates. Those digits must go in those cells, so you remove them from every other cell of that unit.",
          "A Hidden Pair is the reverse: two digits that appear in only two cells of a unit. Those cells can hold nothing else, so you delete their other candidates. Triples extend the same logic to three cells and three digits.",
        ],
      },
      {
        heading: "Pointing Pairs and Box-Line Reduction",
        paragraphs: [
          "When a digit's candidates inside a box all lie on one row or column, that digit cannot appear elsewhere on that line. This is a Pointing Pair.",
          "Box-Line Reduction works the other way: if a digit's candidates in a row or column all sit inside one box, remove it from the rest of that box.",
        ],
      },
      {
        heading: "Wings and Fish: X-Wing, Skyscraper, 2-String Kite, Y-Wing",
        paragraphs: [
          "These patterns link a few cells so that one of two outcomes must be true, which lets you eliminate candidates that see both.",
        ],
        bullets: [
          "X-Wing: a digit appears in exactly two cells in each of two rows, aligned in the same two columns. Remove it from the rest of those columns.",
          "Skyscraper: two lines each hold a digit in two cells, sharing one column end. Cells seeing both free ends lose that digit.",
          "2-String Kite: a row and a column each hold the digit twice and connect through one box.",
          "Y-Wing: a pivot with candidates AB links two cells with AC and BC. Any cell seeing both wings loses C.",
        ],
      },
      {
        heading: "A Solving Order for Expert Boards",
        paragraphs: [
          "Expert puzzles start with just 25 clues. Work in a fixed order: singles first, then intersections, then pairs and triples, and only then wings and fish.",
          "After every elimination, scan again for new singles. If a custom puzzle seems stuck, the Sudoku Solver can tell you whether it has one solution, several, or none.",
        ],
      },
    ],
    proTipTitle: "Pro Tip",
    proTipBody:
      "Hunt for patterns one digit at a time. Look at a single digit across all notes, and work through 1 to 9. Most X-Wings and Skyscrapers show up this way.",
    faqTitle: "Advanced FAQ",
    faqs: [
      {
        question: "Which advanced technique should I learn first?",
        answer:
          "Pointing Pairs and Box-Line Reduction. They appear often, need only one digit and one box, and unlock many Hard boards.",
      },
      {
        question: "Does Auto-Notes work on every difficulty?",
        answer:
          "No. Auto-Notes is available on Hard and Expert modes only. On Easy and Medium you write notes yourself, which is good practice.",
      },
      {
        question: "Can I check a puzzle from another source?",
        answer:
          "Yes. Enter the clues in the Sudoku Solver. It reports whether the grid has a unique solution, multiple solutions or none, and can solve it for you.",
      },
    ],
    crossLinkIntro:
      "Review the full technique list on the Rules & Strategies page, rebuild your basics with the Beginner Sudoku Guide, or test your patterns against a friend with the Multiplayer Sudoku Guide.",
  },
};

// ---------------------------------------------------------------------------
// HI (Devanagari conversational Hinglish)
// ---------------------------------------------------------------------------

const NAV_HI: GuideNavCopy = {
  relatedLinksTitle: "और सीखें",
  practiceTitle: "जो पढ़ा, अब खेल कर देखें",
  linkLabels: {
    rules: "सुडोकू रूल्स और स्ट्रैटेजीज़",
    solver: "सुडोकू सॉल्वर",
    daily: "डेली चैलेंज",
    about: "Sudoku Sync के बारे में",
    multiplayerGuide: "मल्टीप्लेयर सुडोकू गाइड",
    beginnerGuide: "बिगिनर सुडोकू गाइड",
    advancedGuide: "एडवांस्ड पैटर्न्स गाइड",
  },
  practiceLabels: {
    easy: "Easy खेलें",
    medium: "Medium खेलें",
    hard: "Hard खेलें",
    expert: "Expert खेलें",
    daily: "आज का डेली चैलेंज खेलें",
    multiplayer: "मल्टीप्लेयर रूम शुरू करें",
  },
};

const GUIDES_HI: Record<GuideSlug, GuideArticleContent> = {
  "multiplayer-sudoku": {
    slug: "multiplayer-sudoku",
    ...NAV_HI,
    badge: "मल्टीप्लेयर गाइड",
    title: "दोस्तों के साथ मल्टीप्लेयर सुडोकू कैसे खेलें",
    subtitle:
      "बिल्कुल एक ही बोर्ड पर रेस करें, कुछ सेकंड में लिंक शेयर करें, और जब सब खत्म करें तब रिज़ल्ट्स कम्पेयर करें। न लॉबी, न इंतज़ार।",
    metaTitle: "मल्टीप्लेयर सुडोकू गाइड: रूम कोड, शेयर लिंक और फ्रेंड्स",
    metaDescription:
      "Sudoku Sync में सेम-बोर्ड लाइव और एसिंक्रोनस मल्टीप्लेयर कैसे काम करता है: 6-डिजिट रूम कोड, ऑप्शनल PIN, डायरेक्ट शेयर लिंक, फ्रेंड्स और घोस्ट मोड।",
    readTimeLabel: "5 मिनट रीड",
    sections: [
      {
        heading: "एक बोर्ड, ज़ीरो इंतज़ार",
        paragraphs: [
          "Sudoku Sync मल्टीप्लेयर में हर प्लेयर को बिल्कुल सेम 9×9 पज़ल मिलता है। किसी का ग्रिड आसान या मुश्किल नहीं होता, इसलिए जीत सिर्फ लॉजिक और स्पीड से तय होती है।",
          "यहाँ कोई लॉबी नहीं जिसमें वेट करना पड़े। हर प्लेयर का टाइमर, प्रोग्रेस और सबमिशन अलग-अलग चलता है, तो आप साथ में लाइव खेल सकते हैं या घंटों बाद खत्म करें, स्टैंडिंग्स फिर भी एक जैसी रहती हैं।",
        ],
      },
      {
        heading: "चार स्टेप में रूम बनाएँ",
        paragraphs: [
          "मल्टीप्लेयर खोलें और Create चुनें। रूम सेटअप में आप किसी के जुड़ने से पहले नियम तय कर सकते हैं।",
        ],
        bullets: [
          "डिफिकल्टी चुनें: Easy (51 क्लूज़), Medium (39), Hard (30) या Expert (25)।",
          "मिस्टेक लिमिट, हिंट लिमिट और टाइमर दिखाना है या नहीं, यह सेट करें।",
          "चाहें तो रूम PIN से रूम लॉक करें।",
          "6-डिजिट न्यूमेरिक रूम कोड शेयर करें या डायरेक्ट लिंक भेज दें।",
        ],
      },
      {
        heading: "कोड या डायरेक्ट लिंक से जॉइन करें",
        paragraphs: [
          "जॉइन करने के लिए मल्टीप्लेयर खोलें, Join चुनें और 6-डिजिट रूम कोड डालें। अगर होस्ट ने रूम PIN लगाया है तो वह भी डालना होगा।",
          "शेयर लिंक्स ?room= फॉर्मेट में होते हैं। किसी भी ब्राउज़र में खोलते ही बोर्ड लोड हो जाता है, तो दोस्तों को कुछ इंस्टॉल नहीं करना पड़ता। Android और वेब प्लेयर्स सेम बोर्ड पर कम्पीट करते हैं।",
        ],
      },
      {
        heading: "रीसेंट प्लेयर्स, फ्रेंड्स और घोस्ट मोड",
        paragraphs: [
          "इनवाइट लिस्ट में दो टैब्स हैं। Recent Players में वे लोग दिखते हैं जिनके साथ आप पहले खेल चुके हैं, रीमैच के लिए तैयार। Friends आपकी पर्सिस्टेंट लिस्ट है।",
          "Google Sign-In करने पर Friends आपके सारे डिवाइस पर सिंक होते हैं। गेस्ट मोड में सब कुछ उसी डिवाइस पर अलग रहता है। Ghost Mode से आप बिना ऑनलाइन दिखे खेल सकते हैं।",
        ],
      },
      {
        heading: "रिज़ल्ट्स अपने आप आ जाते हैं",
        paragraphs: [
          "जब कोई दोस्त बाद में खत्म करता है, रिज़ल्ट अपने आप सिंक होता है और नोटिफिकेशन आता है कि रेस पूरी हो गई। उसे खोलकर हर पार्टिसिपेंट का फिनिश टाइम और मिस्टेक्स के साथ स्टैंडिंग्स देखें।",
        ],
        bullets: [
          "कोड भेजने से पहले रूम की लिमिट्स तय कर लें ताकि सब एक जैसी कंडीशंस में खेलें।",
          "Smart Assistants पर्सनल सेटिंग्स हैं, इसलिए प्योर रेस चाहिए तो पहले साथ में तय कर लें।",
        ],
      },
    ],
    proTipTitle: "प्रो टिप",
    proTipBody:
      "कोड शेयर करने से पहले रूम सेटअप में मिस्टेक, हिंट और टाइमर लिमिट्स सेट कर दें। फिर सब एक जैसी कंडीशंस में खेलते हैं और स्टैंडिंग्स फेयर रहती हैं, चाहे प्लेयर्स अलग-अलग टाइम पर जुड़ें।",
    faqTitle: "मल्टीप्लेयर FAQ",
    faqs: [
      {
        question: "क्या दोस्तों को ऐप इंस्टॉल करना पड़ेगा?",
        answer:
          "नहीं। ?room= शेयर लिंक किसी भी ब्राउज़र में वही बोर्ड खोल देता है। दोस्त बाद में चाहें तो Android ऐप इंस्टॉल करके खेलना जारी रख सकते हैं।",
      },
      {
        question: "दोस्तों के साथ खेलने के लिए अकाउंट चाहिए?",
        answer:
          "आप गेस्ट के तौर पर भी होस्ट या जॉइन कर सकते हैं। Google Sign-In से पर्सिस्टेंट फ्रेंड्स लिस्ट मिलती है जो डिवाइस पर सिंक होती है, जबकि गेस्ट डेटा आपके डिवाइस पर अलग रहता है।",
      },
      {
        question: "अगर दोस्त मेरे बाद खत्म करे तो क्या होता है?",
        answer:
          "आपका रिज़ल्ट सेव रहता है और उनका रिज़ल्ट खत्म करते ही स्टैंडिंग्स में जुड़ जाता है। आपको नोटिफिकेशन मिलता है, इसलिए ऑनलाइन बैठकर वेट नहीं करना पड़ता।",
      },
    ],
    crossLinkIntro:
      "गेम में नए हैं? पहले बिगिनर सुडोकू गाइड और सुडोकू रूल्स और स्ट्रैटेजीज़ पेज पढ़ें, या अगली रेस से पहले डेली चैलेंज से अपनी सॉल्विंग स्पीड तेज़ करें।",
  },
  "beginner-sudoku": {
    slug: "beginner-sudoku",
    ...NAV_HI,
    badge: "बिगिनर गाइड",
    title: "बिगिनर्स के लिए सुडोकू: पहली पज़ल, स्टेप बाय स्टेप",
    subtitle:
      "एक ज़रूरी नियम समझें, सही स्टार्टिंग डिफिकल्टी चुनें और बिल्ट-इन हेल्पर्स की मदद से अपनी पहली ग्रिड आराम से पूरी करें।",
    metaTitle: "बिगिनर्स के लिए सुडोकू: रूल्स, आसान टिप्स और स्मार्ट असिस्टेंट्स",
    metaDescription:
      "क्लासिक 9×9 सुडोकू की आसान बिगिनर गाइड: कोर रूल, Easy, Medium, Hard और Expert का फर्क, पहली टेक्निक्स, पेंसिल नोट्स और Smart Assistants।",
    readTimeLabel: "6 मिनट रीड",
    sections: [
      {
        heading: "सिर्फ एक नियम याद रखें",
        paragraphs: [
          "सुडोकू 9×9 ग्रिड पर खेला जाता है जो नौ 3×3 बॉक्सेज़ से बनी होती है। हर खाली सेल में 1 से 9 तक का डिजिट ऐसे भरें कि हर रो, हर कॉलम और हर 3×3 बॉक्स में हर डिजिट सिर्फ एक बार आए।",
          "आपको कैलकुलेशन की ज़रूरत नहीं और अंदाज़ा लगाने की भी नहीं। Sudoku Sync की हर पज़ल का सिर्फ एक सॉल्यूशन होता है, इसलिए लॉजिक हमेशा काफी है।",
        ],
      },
      {
        heading: "पहली डिफिकल्टी कैसे चुनें",
        paragraphs: [
          "चारों लेवल्स का फर्क शुरुआत में दिए गए डिजिट्स की गिनती से होता है। ज़्यादा क्लूज़ का मतलब कम खाली सेल्स और आसान डिडक्शंस।",
        ],
        bullets: [
          "Easy: 51 क्लूज़ (30 खाली सेल्स)। शुरुआत के लिए सबसे बढ़िया।",
          "Medium: 39 क्लूज़ (42 खाली सेल्स)।",
          "Hard: 30 क्लूज़ (51 खाली सेल्स)।",
          "Expert: 25 क्लूज़ (56 खाली सेल्स)।",
        ],
      },
      {
        heading: "आपकी पहली तीन टेक्निक्स",
        paragraphs: [
          "स्कैनिंग से शुरुआत करें: एक डिजिट चुनें, देखें वह कहाँ पहले से है, और समझें कि उसकी रो और कॉलम किस बॉक्स के सेल्स को ब्लॉक करते हैं।",
          "फिर सिंगल्स ढूँढें। Naked Single वह सेल है जिसमें सिर्फ एक ही डिजिट आ सकता है। Hidden Single वह डिजिट है जो रो, कॉलम या बॉक्स के सिर्फ एक सेल में फिट होता है। जब किसी यूनिट के आठ सेल्स भर जाएँ तो आखिरी खाली सेल Full House होती है।",
        ],
      },
      {
        heading: "पेंसिल नोट्स और Smart Assistants",
        paragraphs: [
          "नोट्स से आप सेल में छोटे कैंडिडेट डिजिट्स लिख सकते हैं जब तक पक्का न हो जाए। सेटिंग्स के ये हेल्पर्स सीखना आसान बनाते हैं:",
        ],
        bullets: [
          "Highlight Identical Numbers सेल सेलेक्ट करते ही सारे मैचिंग डिजिट्स दिखाता है।",
          "Show Remaining Numbers बताता है कि हर डिजिट कितनी बार रखना बाकी है।",
          "Highlight Related Area एक्टिव सेल की रो, कॉलम और बॉक्स को हल्का शेड करता है।",
          "Auto-Remove Notes डिजिट रखते ही जुड़े हुए सेल्स के मैचिंग नोट्स हटा देता है।",
          "Fast Fill (Number-First) एक डिजिट लॉक करता है ताकि आप कई सेल्स पर लगातार टैप कर सकें।",
          "Auto-Switch Completed Numbers जब एक डिजिट के नौ के नौ लग जाएँ तो अगले डिजिट पर ले जाता है।",
        ],
      },
      {
        heading: "मिस्टेक लिमिट और डेली आदत",
        paragraphs: [
          "Strict Mistake Limit (3/3) तीन गलतियों के बाद गेम खत्म कर देता है और ध्यान से खेलना सिखाता है। सीखते वक्त आप इसे सेटिंग्स में बंद कर सकते हैं।",
          "रोज़ का छोटा डेली चैलेंज आदत बनाता है, और सुडोकू सॉल्वर से आप चेक कर सकते हैं कि जिस पज़ल में अटके हैं वह सही है या नहीं।",
        ],
      },
    ],
    proTipTitle: "प्रो टिप",
    proTipBody:
      "हर पज़ल की शुरुआत उस डिजिट से करें जो पहले से सबसे ज़्यादा बार दिख रहा हो। उसके लिए सबसे कम जगह बचती है, इसलिए पहले पक्के प्लेसमेंट्स अक्सर वहीं से मिलते हैं।",
    faqTitle: "बिगिनर FAQ",
    faqs: [
      {
        question: "सबसे पहले कौनसी डिफिकल्टी खेलनी चाहिए?",
        answer:
          "Easy। 51 क्लूज़ के साथ इसे स्कैनिंग और सिंगल-डिजिट डिडक्शंस से सॉल्व किया जा सकता है, और यही हर मुश्किल लेवल की नींव हैं।",
      },
      {
        question: "क्या कभी अंदाज़ा लगाना पड़ता है?",
        answer:
          "नहीं। हर पज़ल का एक ही सॉल्यूशन होता है और लॉजिक से सॉल्व होता है। अगर लगे कि गेस करना पड़ रहा है तो अपने नोट्स दोबारा चेक करें या कोई नई टेक्निक ढूँढें।",
      },
      {
        question: "मिस्टेक लिमिट क्या है?",
        answer:
          "यह Strict Mistake Limit (3/3) नाम की स्मार्ट सेटिंग है। गलत डिजिट मिस्टेक गिनता है और तीन पर गेम खत्म हो जाता है। इसे सेटिंग्स में बंद किया जा सकता है।",
      },
    ],
    crossLinkIntro:
      "जब सिंगल्स आसान लगने लगें तो एडवांस्ड पैटर्न्स गाइड पढ़ें। दोस्त के साथ सेम बोर्ड पर खेलने के लिए मल्टीप्लेयर सुडोकू गाइड देखें, और सुडोकू रूल्स और स्ट्रैटेजीज़ पेज को रेफरेंस के तौर पर पास रखें।",
  },
  "advanced-patterns": {
    slug: "advanced-patterns",
    ...NAV_HI,
    badge: "एडवांस्ड गाइड",
    title: "Hard और Expert पज़ल्स के लिए एडवांस्ड सुडोकू पैटर्न्स",
    subtitle:
      "सिंगल्स से आगे बढ़ें: पेयर्स, इंटरसेक्शंस, X-Wing, Skyscraper, 2-String Kite और Y-Wing सीखें, और नोट्स का इस्तेमाल स्ट्रॉन्ग सॉल्वर्स की तरह करें।",
    metaTitle: "एडवांस्ड सुडोकू पैटर्न्स: X-Wing, Y-Wing, पेयर्स और और भी",
    metaDescription:
      "Naked और Hidden Pairs, Pointing Pairs, Box-Line Reduction, X-Wing, Skyscraper, 2-String Kite और Y-Wing के साथ Hard और Expert सुडोकू में आगे बढ़ें।",
    readTimeLabel: "8 मिनट रीड",
    sections: [
      {
        heading: "भरोसेमंद नोट्स वर्कफ़्लो बनाएँ",
        paragraphs: [
          "एडवांस्ड पैटर्न्स सही कैंडिडेट नोट्स पर टिके होते हैं। Auto-Notes खाली सेल्स में कैंडिडेट्स भर देता है और सिर्फ Hard और Expert में मिलता है, जबकि Auto-Remove Notes डिजिट रखते वक्त उन्हें साफ रखता है।",
          "नोट्स एक बार भरें, फिर हर प्लेसमेंट के बाद अपडेट करें। एक पुराना नोट भी पैटर्न को गलत तरह से सही दिखा सकता है।",
        ],
      },
      {
        heading: "Naked और Hidden Pairs और Triples",
        paragraphs: [
          "Naked Pair एक यूनिट के वे दो सेल्स हैं जिनके कैंडिडेट्स वही दो डिजिट्स हैं। वे डिजिट्स उन्हीं सेल्स में जाएँगे, इसलिए यूनिट के बाकी सेल्स से हटा दें।",
          "Hidden Pair उल्टा है: दो डिजिट्स जो यूनिट के सिर्फ दो सेल्स में आते हैं। उन सेल्स में और कुछ नहीं जा सकता, इसलिए उनके बाकी कैंडिडेट्स मिटा दें। Triples यही लॉजिक तीन सेल्स और तीन डिजिट्स पर लगाते हैं।",
        ],
      },
      {
        heading: "Pointing Pairs और Box-Line Reduction",
        paragraphs: [
          "जब किसी डिजिट के बॉक्स के अंदर के सारे कैंडिडेट्स एक ही रो या कॉलम में हों, तो वह डिजिट उस लाइन के बाकी हिस्से में नहीं आ सकता। इसे Pointing Pair कहते हैं।",
          "Box-Line Reduction उल्टा काम करता है: अगर किसी रो या कॉलम में डिजिट के सारे कैंडिडेट्स एक ही बॉक्स में हों, तो उस बॉक्स के बाकी सेल्स से उसे हटा दें।",
        ],
      },
      {
        heading: "विंग्स और फिश: X-Wing, Skyscraper, 2-String Kite, Y-Wing",
        paragraphs: [
          "ये पैटर्न्स कुछ सेल्स को ऐसे जोड़ते हैं कि दो में से एक आउटकम सच होना ही है, जिससे आप वे कैंडिडेट्स हटा सकते हैं जो दोनों को देखते हैं।",
        ],
        bullets: [
          "X-Wing: एक डिजिट दो रोज़ में सिर्फ दो-दो सेल्स में आता है, और वे सेम दो कॉलम्स में अलाइन्ड हैं। उन कॉलम्स के बाकी सेल्स से उसे हटा दें।",
          "Skyscraper: दो लाइंस में डिजिट दो-दो सेल्स में है और एक कॉलम का एक सिरा कॉमन है। दोनों खुले सिरों को देखने वाले सेल्स से वह डिजिट हट जाता है।",
          "2-String Kite: एक रो और एक कॉलम में डिजिट दो-दो बार है और दोनों एक बॉक्स के ज़रिए जुड़े हैं।",
          "Y-Wing: AB कैंडिडेट्स वाला पिवट, AC और BC वाले दो सेल्स को जोड़ता है। दोनों विंग्स को देखने वाले हर सेल से C हट जाता है।",
        ],
      },
      {
        heading: "Expert बोर्ड्स के लिए सॉल्विंग ऑर्डर",
        paragraphs: [
          "Expert पज़ल्स सिर्फ 25 क्लूज़ से शुरू होती हैं। एक तय ऑर्डर में चलें: पहले सिंगल्स, फिर इंटरसेक्शंस, फिर पेयर्स और ट्रिपल्स, और तब जाकर विंग्स और फिश।",
          "हर एलिमिनेशन के बाद नई सिंगल्स के लिए दोबारा स्कैन करें। अगर कोई कस्टम पज़ल अटक जाए तो सुडोकू सॉल्वर बता सकता है कि उसका एक सॉल्यूशन है, कई हैं या कोई नहीं।",
        ],
      },
    ],
    proTipTitle: "प्रो टिप",
    proTipBody:
      "पैटर्न्स एक-एक डिजिट करके ढूँढें। सारे नोट्स में एक ही डिजिट को देखें और 1 से 9 तक चलते जाएँ। ज़्यादातर X-Wing और Skyscraper इसी तरह मिलते हैं।",
    faqTitle: "एडवांस्ड FAQ",
    faqs: [
      {
        question: "सबसे पहले कौनसी एडवांस्ड टेक्निक सीखनी चाहिए?",
        answer:
          "Pointing Pairs और Box-Line Reduction। ये अक्सर मिलते हैं, इनमें सिर्फ एक डिजिट और एक बॉक्स देखना पड़ता है, और कई Hard बोर्ड्स खोल देते हैं।",
      },
      {
        question: "क्या Auto-Notes हर डिफिकल्टी में काम करता है?",
        answer:
          "नहीं। Auto-Notes सिर्फ Hard और Expert मोड में मिलता है। Easy और Medium में नोट्स आप खुद लिखते हैं, जो अच्छी प्रैक्टिस है।",
      },
      {
        question: "क्या मैं किसी और सोर्स की पज़ल चेक कर सकता हूँ?",
        answer:
          "हाँ। क्लूज़ को सुडोकू सॉल्वर में डालें। वह बताता है कि ग्रिड का यूनिक सॉल्यूशन है, कई सॉल्यूशंस हैं या कोई नहीं, और आपके लिए सॉल्व भी कर सकता है।",
      },
    ],
    crossLinkIntro:
      "पूरी टेक्निक लिस्ट सुडोकू रूल्स और स्ट्रैटेजीज़ पेज पर देखें, बिगिनर सुडोकू गाइड से बेसिक्स दोबारा मज़बूत करें, या मल्टीप्लेयर सुडोकू गाइड के साथ दोस्त से अपने पैटर्न्स का मुकाबला करें।",
  },
};

// ---------------------------------------------------------------------------
// DE
// ---------------------------------------------------------------------------

const NAV_DE: GuideNavCopy = {
  relatedLinksTitle: "Weiterlernen",
  practiceTitle: "Gelesenes direkt ausprobieren",
  linkLabels: {
    rules: "Sudoku-Regeln & Strategien",
    solver: "Sudoku-Löser",
    daily: "Tages-Rätsel",
    about: "Über Sudoku Sync",
    multiplayerGuide: "Multiplayer-Sudoku-Ratgeber",
    beginnerGuide: "Sudoku-Ratgeber für Anfänger",
    advancedGuide: "Ratgeber für fortgeschrittene Muster",
  },
  practiceLabels: {
    easy: "Einfach spielen",
    medium: "Mittel spielen",
    hard: "Schwer spielen",
    expert: "Experte spielen",
    daily: "Heutiges Tages-Rätsel spielen",
    multiplayer: "Multiplayer-Raum starten",
  },
};

const GUIDES_DE: Record<GuideSlug, GuideArticleContent> = {
  "multiplayer-sudoku": {
    slug: "multiplayer-sudoku",
    ...NAV_DE,
    badge: "Multiplayer-Ratgeber",
    title: "Multiplayer-Sudoku mit Freunden spielen",
    subtitle:
      "Tretet auf exakt demselben Feld an, teilt einen Link in Sekunden und vergleicht die Ergebnisse, sobald alle fertig sind. Keine Lobby, kein Warten.",
    metaTitle: "Multiplayer-Sudoku: Raumcode, Einladungslink & Freunde",
    metaDescription:
      "So funktioniert Same-Board-Multiplayer in Sudoku Sync live und zeitversetzt: 6-stelliger Raumcode, optionale PIN, direkter Einladungslink, Freunde und Geist-Modus.",
    readTimeLabel: "5 Min. Lesezeit",
    sections: [
      {
        heading: "Ein Feld, null Wartezeit",
        paragraphs: [
          "Im Multiplayer von Sudoku Sync erhalten alle Spielenden dasselbe 9×9-Rätsel. Niemand löst ein leichteres oder schwereres Gitter, deshalb entscheiden allein Logik und Tempo.",
          "Es gibt keine Lobby, in der man warten muss. Timer, Fortschritt und Abgabe jeder Person laufen unabhängig. Ihr könnt also live nebeneinander spielen oder Stunden später fertig werden und landet trotzdem in derselben Rangliste.",
        ],
      },
      {
        heading: "Einen Raum in vier Schritten erstellen",
        paragraphs: [
          "Öffne Multiplayer und wähle Erstellen. In der Raumeinrichtung legst du die Regeln fest, bevor jemand beitritt.",
        ],
        bullets: [
          "Schwierigkeit wählen: Einfach (51 Hinweise), Mittel (39), Schwer (30) oder Experte (25).",
          "Fehlerlimit, Hinweislimit und Sichtbarkeit des Timers festlegen.",
          "Den Raum optional mit einer Raum-PIN sperren.",
          "Den 6-stelligen numerischen Raumcode teilen oder direkt einen Link senden.",
        ],
      },
      {
        heading: "Mit Code oder direktem Link beitreten",
        paragraphs: [
          "Zum Beitreten öffnest du Multiplayer, wählst Beitreten und gibst den 6-stelligen Raumcode ein. Hat der Gastgeber eine Raum-PIN gesetzt, gibst du auch diese ein.",
          "Einladungslinks nutzen das Format ?room=. In jedem Browser geöffnet, lädt sofort das Spielfeld, sodass Freunde ohne Installation im Web mitspielen. Android- und Web-Spielende treten auf demselben Feld an.",
        ],
      },
      {
        heading: "Letzte Mitspieler, Freunde und Geist-Modus",
        paragraphs: [
          "Die Einladungsliste hat zwei Tabs. Letzte Mitspieler zeigt Personen, mit denen du schon gespielt hast, bereit für eine Revanche. Freunde ist deine dauerhafte Liste.",
          "Mit der Google-Anmeldung werden deine Freunde geräteübergreifend synchronisiert. Im Gastmodus bleibt alles isoliert auf dem verwendeten Gerät. Der Geist-Modus blendet deinen Online-Status aus, wenn du unsichtbar spielen möchtest.",
        ],
      },
      {
        heading: "Ergebnisse kommen von allein",
        paragraphs: [
          "Wenn ein Freund später fertig wird, synchronisiert sich das Ergebnis automatisch und eine Benachrichtigung meldet, dass das Rennen beendet ist. Öffne sie, um die Rangliste mit Zeit und Fehlern aller Teilnehmenden zu sehen.",
        ],
        bullets: [
          "Legt die Raumlimits fest, bevor ihr den Code verschickt, damit alle unter gleichen Bedingungen antreten.",
          "Smart-Assistenten sind persönliche Einstellungen. Sprecht also ab, ob es ein reines Rennen sein soll.",
        ],
      },
    ],
    proTipTitle: "Profi-Tipp",
    proTipBody:
      "Stelle Fehler-, Hinweis- und Timerlimit in der Raumeinrichtung ein, bevor du den Code teilst. So spielen alle unter denselben Bedingungen und die Rangliste bleibt fair, auch wenn Leute zu unterschiedlichen Zeiten einsteigen.",
    faqTitle: "Multiplayer-FAQ",
    faqs: [
      {
        question: "Müssen meine Freunde die App installieren?",
        answer:
          "Nein. Ein ?room=-Link öffnet dasselbe Feld in jedem Browser. Später können Freunde die Android-App installieren und weiterspielen.",
      },
      {
        question: "Brauche ich ein Konto, um mit Freunden zu spielen?",
        answer:
          "Du kannst als Gast erstellen und beitreten. Mit der Google-Anmeldung erhältst du eine dauerhafte Freundesliste, die geräteübergreifend synchronisiert wird, während Gastdaten isoliert auf deinem Gerät bleiben.",
      },
      {
        question: "Was passiert, wenn ein Freund nach mir fertig wird?",
        answer:
          "Dein Ergebnis bleibt gespeichert und seines kommt in die Rangliste, sobald es fertig ist. Du bekommst eine Benachrichtigung und musst nicht online warten.",
      },
    ],
    crossLinkIntro:
      "Neu im Spiel? Beginne mit dem Sudoku-Ratgeber für Anfänger und der Seite Regeln & Strategien oder trainiere vor dem nächsten Rennen dein Tempo mit dem Tages-Rätsel.",
  },
  "beginner-sudoku": {
    slug: "beginner-sudoku",
    ...NAV_DE,
    badge: "Anfänger-Ratgeber",
    title: "Sudoku für Anfänger: Dein erstes Rätsel Schritt für Schritt",
    subtitle:
      "Lerne die eine wichtige Regel, wähle die passende Startschwierigkeit und nutze die eingebauten Helfer, um dein erstes Gitter sicher zu lösen.",
    metaTitle: "Sudoku für Anfänger: Regeln, Tipps & Smart-Assistenten",
    metaDescription:
      "Ein ruhiger Einstieg ins klassische 9×9-Sudoku: die Grundregel, Unterschiede zwischen Einfach, Mittel, Schwer und Experte, erste Techniken, Notizen und Smart-Assistenten.",
    readTimeLabel: "6 Min. Lesezeit",
    sections: [
      {
        heading: "Die einzige Regel, die du brauchst",
        paragraphs: [
          "Sudoku wird auf einem 9×9-Gitter aus neun 3×3-Blöcken gespielt. Fülle jedes leere Feld mit einer Ziffer von 1 bis 9, sodass jede Zeile, jede Spalte und jeder 3×3-Block jede Ziffer genau einmal enthält.",
          "Du brauchst weder Rechnen noch Raten. Jedes Sudoku-Sync-Rätsel hat genau eine Lösung, Logik reicht also immer aus.",
        ],
      },
      {
        heading: "Die erste Schwierigkeit wählen",
        paragraphs: [
          "Die vier Stufen unterscheiden sich darin, wie viele Ziffern am Anfang vorgegeben sind. Mehr Hinweise bedeuten weniger leere Felder und einfachere Schlüsse.",
        ],
        bullets: [
          "Einfach: 51 Hinweise (30 leere Felder). Der beste Einstieg.",
          "Mittel: 39 Hinweise (42 leere Felder).",
          "Schwer: 30 Hinweise (51 leere Felder).",
          "Experte: 25 Hinweise (56 leere Felder).",
        ],
      },
      {
        heading: "Deine ersten drei Techniken",
        paragraphs: [
          "Beginne mit dem Scannen: Wähle eine Ziffer, sieh nach, wo sie schon steht, und prüfe, welche Felder eines Blocks durch ihre Zeile und Spalte blockiert sind.",
          "Suche dann nach Singles. Ein Naked Single ist ein Feld, in das nur eine Ziffer passt. Ein Hidden Single ist eine Ziffer, die in einer Zeile, Spalte oder einem Block nur in ein Feld passt. Sind acht Felder einer Einheit gefüllt, ist das letzte freie Feld ein Full House.",
        ],
      },
      {
        heading: "Notizen und Smart-Assistenten",
        paragraphs: [
          "Mit Notizen schreibst du kleine Kandidatenziffern in ein Feld, bis du sicher bist. Diese Helfer in den Einstellungen erleichtern das Lernen:",
        ],
        bullets: [
          "Gleiche Zahlen hervorheben markiert beim Auswählen eines Feldes alle gleichen Ziffern.",
          "Verbleibende Zahlen anzeigen zeigt, wie oft jede Ziffer noch fehlt.",
          "Verbundene Felder hervorheben schattiert Zeile, Spalte und Block des aktiven Feldes dezent.",
          "Notizen auto-löschen entfernt passende Notizen in verbundenen Feldern, sobald du eine Ziffer setzt.",
          "Schnellausfüllen (Zahl zuerst) sperrt eine Ziffer, damit du mehrere Felder nacheinander antippen kannst.",
          "Fertige Zahlen auto-wechseln springt weiter, sobald alle neun einer Ziffer gesetzt sind.",
        ],
      },
      {
        heading: "Fehlerlimit und tägliche Routine",
        paragraphs: [
          "Das Strikte Fehlerlimit (3/3) beendet das Spiel nach drei Fehlern und fördert sorgfältiges Spielen. Beim Lernen kannst du es in den Einstellungen ausschalten.",
          "Ein kurzes Tages-Rätsel jeden Tag schafft Routine, und der Sudoku-Löser prüft, ob ein Rätsel, an dem du hängst, gültig ist.",
        ],
      },
    ],
    proTipTitle: "Profi-Tipp",
    proTipBody:
      "Starte jedes Rätsel mit der Ziffer, die schon am häufigsten vorkommt. Sie hat die wenigsten verbleibenden Plätze und liefert deshalb meist die ersten sicheren Eintragungen.",
    faqTitle: "Anfänger-FAQ",
    faqs: [
      {
        question: "Welche Schwierigkeit sollte ich zuerst spielen?",
        answer:
          "Einfach. Mit 51 Hinweisen lässt es sich durch Scannen und Single-Schlüsse lösen, die Grundlage jeder schwereren Stufe.",
      },
      {
        question: "Muss ich jemals raten?",
        answer:
          "Nein. Jedes Rätsel hat genau eine Lösung und ist logisch lösbar. Wenn du glaubst raten zu müssen, prüfe deine Notizen oder suche nach einer Technik, die du noch nicht genutzt hast.",
      },
      {
        question: "Was ist das Fehlerlimit?",
        answer:
          "Es ist die Smart-Einstellung Striktes Fehlerlimit (3/3). Eine falsche Ziffer zählt als Fehler und beim dritten endet das Spiel. In den Einstellungen kannst du es ausschalten.",
      },
    ],
    crossLinkIntro:
      "Wenn Singles leichtfallen, lies den Ratgeber für fortgeschrittene Muster. Für Partien mit Freunden auf demselben Feld hilft der Multiplayer-Sudoku-Ratgeber, und die Seite Regeln & Strategien dient als Nachschlagewerk.",
  },
  "advanced-patterns": {
    slug: "advanced-patterns",
    ...NAV_DE,
    badge: "Ratgeber für Fortgeschrittene",
    title: "Fortgeschrittene Sudoku-Muster für schwere und Experten-Rätsel",
    subtitle:
      "Gehe über Singles hinaus mit Paaren, Schnittmengen, X-Wing, Skyscraper, 2-String-Kite und Y-Wing und nutze Notizen wie starke Löser.",
    metaTitle: "Fortgeschrittene Sudoku-Muster: X-Wing, Y-Wing, Paare & mehr",
    metaDescription:
      "Meistere schwere und Experten-Rätsel mit Naked und Hidden Pairs, Pointing Pairs, Box-Line-Reduktion, X-Wing, Skyscraper, 2-String-Kite und Y-Wing.",
    readTimeLabel: "8 Min. Lesezeit",
    sections: [
      {
        heading: "Einen verlässlichen Notiz-Ablauf aufbauen",
        paragraphs: [
          "Fortgeschrittene Muster hängen von korrekten Kandidatennotizen ab. Auto-Notizen füllt Kandidaten in leere Felder und ist nur bei Schwer und Experte verfügbar, während Notizen auto-löschen sie beim Setzen von Ziffern sauber hält.",
          "Fülle die Notizen einmal und aktualisiere sie nach jeder Eintragung. Schon eine veraltete Notiz kann ein Muster gültig aussehen lassen, obwohl es das nicht ist.",
        ],
      },
      {
        heading: "Naked und Hidden Pairs sowie Triples",
        paragraphs: [
          "Ein Naked Pair sind zwei Felder einer Einheit mit denselben zwei Kandidaten. Diese Ziffern gehören in genau diese Felder, also streichst du sie in allen anderen Feldern der Einheit.",
          "Ein Hidden Pair ist das Gegenstück: zwei Ziffern, die in einer Einheit nur in zwei Feldern vorkommen. Diese Felder können nichts anderes enthalten, also löschst du ihre übrigen Kandidaten. Triples übertragen die Logik auf drei Felder und drei Ziffern.",
        ],
      },
      {
        heading: "Pointing Pairs und Box-Line-Reduktion",
        paragraphs: [
          "Liegen alle Kandidaten einer Ziffer innerhalb eines Blocks auf einer Zeile oder Spalte, kann die Ziffer im Rest dieser Linie nicht stehen. Das ist ein Pointing Pair.",
          "Die Box-Line-Reduktion funktioniert umgekehrt: Liegen alle Kandidaten einer Ziffer in einer Zeile oder Spalte in einem Block, streichst du sie im Rest dieses Blocks.",
        ],
      },
      {
        heading: "Wings und Fische: X-Wing, Skyscraper, 2-String-Kite, Y-Wing",
        paragraphs: [
          "Diese Muster verknüpfen einige Felder so, dass eines von zwei Ergebnissen wahr sein muss. So kannst du Kandidaten streichen, die beide Felder sehen.",
        ],
        bullets: [
          "X-Wing: Eine Ziffer steht in zwei Zeilen jeweils in genau zwei Feldern, ausgerichtet auf dieselben zwei Spalten. Streiche sie im Rest dieser Spalten.",
          "Skyscraper: Zwei Linien haben die Ziffer je in zwei Feldern und teilen ein Spaltenende. Felder, die beide freien Enden sehen, verlieren die Ziffer.",
          "2-String-Kite: Eine Zeile und eine Spalte enthalten die Ziffer je zweimal und verbinden sich über einen Block.",
          "Y-Wing: Ein Pivot mit den Kandidaten AB verknüpft zwei Felder mit AC und BC. Jedes Feld, das beide Flügel sieht, verliert C.",
        ],
      },
      {
        heading: "Eine Lösungsreihenfolge für Experten-Gitter",
        paragraphs: [
          "Experten-Rätsel starten mit nur 25 Hinweisen. Arbeite in fester Reihenfolge: zuerst Singles, dann Schnittmengen, dann Paare und Triples und erst danach Wings und Fische.",
          "Suche nach jeder Streichung erneut nach neuen Singles. Hängt ein eigenes Rätsel fest, verrät dir der Sudoku-Löser, ob es eine, mehrere oder keine Lösung hat.",
        ],
      },
    ],
    proTipTitle: "Profi-Tipp",
    proTipBody:
      "Suche Muster Ziffer für Ziffer. Betrachte eine einzelne Ziffer über alle Notizen hinweg und arbeite dich von 1 bis 9 durch. So tauchen die meisten X-Wings und Skyscraper auf.",
    faqTitle: "FAQ für Fortgeschrittene",
    faqs: [
      {
        question: "Welche fortgeschrittene Technik sollte ich zuerst lernen?",
        answer:
          "Pointing Pairs und Box-Line-Reduktion. Sie treten oft auf, brauchen nur eine Ziffer und einen Block und lösen viele schwere Gitter.",
      },
      {
        question: "Funktionieren Auto-Notizen in jeder Schwierigkeit?",
        answer:
          "Nein. Auto-Notizen gibt es nur bei Schwer und Experte. Bei Einfach und Mittel schreibst du Notizen selbst, was eine gute Übung ist.",
      },
      {
        question: "Kann ich ein Rätsel aus einer anderen Quelle prüfen?",
        answer:
          "Ja. Gib die Hinweise im Sudoku-Löser ein. Er meldet, ob das Gitter eine eindeutige Lösung, mehrere Lösungen oder keine hat, und kann es für dich lösen.",
      },
    ],
    crossLinkIntro:
      "Die vollständige Technikliste findest du unter Regeln & Strategien. Festige deine Grundlagen mit dem Sudoku-Ratgeber für Anfänger oder teste deine Muster mit dem Multiplayer-Sudoku-Ratgeber gegen Freunde.",
  },
};

// ---------------------------------------------------------------------------
// JA
// ---------------------------------------------------------------------------

const NAV_JA: GuideNavCopy = {
  relatedLinksTitle: "さらに学ぶ",
  practiceTitle: "読んだ内容をすぐ実践",
  linkLabels: {
    rules: "数独のルールと戦略",
    solver: "数独ソルバー",
    daily: "デイリーチャレンジ",
    about: "Sudoku Sync について",
    multiplayerGuide: "マルチプレイ数独ガイド",
    beginnerGuide: "数独 初心者ガイド",
    advancedGuide: "上級パターンガイド",
  },
  practiceLabels: {
    easy: "初級をプレイ",
    medium: "中級をプレイ",
    hard: "上級をプレイ",
    expert: "エキスパートをプレイ",
    daily: "今日のデイリーチャレンジをプレイ",
    multiplayer: "マルチプレイルームを作成",
  },
};

const GUIDES_JA: Record<GuideSlug, GuideArticleContent> = {
  "multiplayer-sudoku": {
    slug: "multiplayer-sudoku",
    ...NAV_JA,
    badge: "マルチプレイガイド",
    title: "友達と遊ぶマルチプレイ数独の始め方",
    subtitle:
      "まったく同じ盤面で競い、数秒でリンクを共有し、全員が終わったタイミングで結果を比べられます。ロビー待ちはありません。",
    metaTitle: "マルチプレイ数独ガイド：ルームコード・共有リンク・フレンド",
    metaDescription:
      "Sudoku Sync の同一盤面ライブ／非同期マルチプレイの仕組みを解説。6桁のルームコード、任意のPIN、直接共有リンク、フレンド、ゴーストモード。",
    readTimeLabel: "読了目安 5分",
    sections: [
      {
        heading: "ひとつの盤面、待ち時間ゼロ",
        paragraphs: [
          "Sudoku Sync のマルチプレイでは、全員がまったく同じ 9×9 の問題を解きます。誰かだけ簡単・難しいということがなく、勝敗は論理力とスピードだけで決まります。",
          "待機するロビーはありません。各プレイヤーのタイマー・進行・提出は独立しているため、同時にライブで遊ぶことも、数時間後に終えることもでき、同じ順位表に反映されます。",
        ],
      },
      {
        heading: "4ステップでルームを作成",
        paragraphs: [
          "マルチプレイを開き「作成」を選びます。誰かが参加する前に、ルームの設定でルールを決められます。",
        ],
        bullets: [
          "難易度を選択：初級（ヒント51）、中級（39）、上級（30）、エキスパート（25）。",
          "ミス上限、ヒント上限、タイマーを表示するかどうかを設定。",
          "必要ならルームPINでロック。",
          "6桁の数字のルームコードを共有、またはリンクを直接送信。",
        ],
      },
      {
        heading: "コードまたは直接リンクで参加",
        paragraphs: [
          "参加するには、マルチプレイから「参加」を選び、6桁のルームコードを入力します。ホストがルームPINを設定している場合は、それも入力します。",
          "共有リンクは ?room= 形式です。どのブラウザで開いてもすぐに盤面が読み込まれ、友達はインストール不要でウェブから遊べます。Androidとウェブのプレイヤーは同じ盤面で競います。",
        ],
      },
      {
        heading: "最近のプレイヤー、フレンド、ゴーストモード",
        paragraphs: [
          "招待リストには2つのタブがあります。「最近のプレイヤー」は一緒に遊んだ相手で、すぐに再戦できます。「フレンド」は永続的なリストです。",
          "Googleでログインすると、フレンドが端末をまたいで同期されます。ゲストモードでは、すべてが使用中の端末内で独立して保存されます。ゴーストモードを使えば、オンライン状態を隠して遊べます。",
        ],
      },
      {
        heading: "結果は自動で届く",
        paragraphs: [
          "友達が後から終えると、結果は自動で同期され、レース終了の通知が届きます。通知を開くと、全参加者のクリアタイムとミス数つきの順位表を確認できます。",
        ],
        bullets: [
          "コードを送る前にルームの上限を決めておくと、全員が同じ条件で競えます。",
          "スマートアシストは個人の設定です。純粋な勝負にしたい場合は事前に相談しましょう。",
        ],
      },
    ],
    proTipTitle: "上達のコツ",
    proTipBody:
      "コードを共有する前に、ルーム設定でミス・ヒント・タイマーの上限を決めましょう。全員が同じ条件で競えるため、参加時間がバラバラでも順位が公平に保たれます。",
    faqTitle: "マルチプレイ FAQ",
    faqs: [
      {
        question: "友達はアプリのインストールが必要ですか？",
        answer:
          "いいえ。?room= の共有リンクを開けば、どのブラウザでも同じ盤面が開きます。後からAndroidアプリを入れて続けることもできます。",
      },
      {
        question: "友達と遊ぶのにアカウントは必要ですか？",
        answer:
          "ゲストのままでもホストや参加ができます。Googleでログインすると端末間で同期される永続フレンドリストが使え、ゲストのデータは端末内で独立したままです。",
      },
      {
        question: "友達が自分より後に終えた場合はどうなりますか？",
        answer:
          "自分の結果は保存され、友達の結果は終えた瞬間に順位表へ追加されます。通知が届くので、オンラインで待つ必要はありません。",
      },
    ],
    crossLinkIntro:
      "初めての方は、まず初心者ガイドと「ルールと戦略」ページをご覧ください。次の対戦の前にデイリーチャレンジで解くスピードを磨くのもおすすめです。",
  },
  "beginner-sudoku": {
    slug: "beginner-sudoku",
    ...NAV_JA,
    badge: "初心者ガイド",
    title: "初心者のための数独：最初の1問をステップごとに",
    subtitle:
      "大切なルールをひとつだけ覚え、最適な開始難易度を選び、内蔵のサポート機能を使って最初の盤面を自信を持ってクリアしましょう。",
    metaTitle: "初心者向け数独：ルール・基本のコツ・スマートアシスト",
    metaDescription:
      "クラシック 9×9 数独の初心者ガイド。基本ルール、初級・中級・上級・エキスパートの違い、最初のテクニック、メモ機能、スマートアシストを解説。",
    readTimeLabel: "読了目安 6分",
    sections: [
      {
        heading: "覚えるルールはたったひとつ",
        paragraphs: [
          "数独は、9つの 3×3 ブロックからなる 9×9 の盤面で遊びます。空きマスに 1 から 9 の数字を入れ、各行・各列・各 3×3 ブロックにすべての数字がちょうど1回ずつ入るようにします。",
          "計算も当て推量も必要ありません。Sudoku Sync のすべての問題は解がひとつだけなので、論理だけで必ず解けます。",
        ],
      },
      {
        heading: "最初の難易度を選ぶ",
        paragraphs: [
          "4つのレベルの違いは、最初に与えられる数字の数です。ヒントが多いほど空きマスが少なく、推理も簡単になります。",
        ],
        bullets: [
          "初級：ヒント51（空き30マス）。最初の一歩に最適。",
          "中級：ヒント39（空き42マス）。",
          "上級：ヒント30（空き51マス）。",
          "エキスパート：ヒント25（空き56マス）。",
        ],
      },
      {
        heading: "最初に覚える3つのテクニック",
        paragraphs: [
          "まずはスキャンから。ひとつの数字を選び、すでに置かれている場所を確認して、その行と列によってブロック内のどのマスが塞がれるかを見ます。",
          "次にシングルを探します。ネイキッドシングルは、入る数字がひとつしかないマス。ヒドゥンシングルは、行・列・ブロックの中で1か所にしか入らない数字です。ある範囲の8マスが埋まったら、最後の空きマスはフルハウスです。",
        ],
      },
      {
        heading: "メモ機能とスマートアシスト",
        paragraphs: [
          "メモを使えば、確信が持てるまでマスに小さく候補を書き込めます。設定にある次のサポート機能が学習をスムーズにします。",
        ],
        bullets: [
          "同じ数字をハイライト：マスを選ぶと、盤面上の同じ数字をすべて強調します。",
          "残り数字を表示：各数字があといくつ残っているかを表示します。",
          "関連エリアをハイライト：選択中のマスの行・列・ブロックをうっすら強調します。",
          "メモの自動削除：数字を置くと、関連するマスの同じメモを消します。",
          "高速入力（数字優先）：数字を固定して、複数のマスを連続でタップできます。",
          "完了した数字を自動切替：ある数字を9個置き終えると次の数字に切り替わります。",
        ],
      },
      {
        heading: "ミス制限と毎日の習慣",
        paragraphs: [
          "ミス制限 (3/3) は、3回ミスするとゲームオーバーになり、慎重なプレイを身につけられます。学習中は設定でオフにできます。",
          "毎日のデイリーチャレンジが習慣づくりに役立ち、行き詰まった問題が正しいかどうかは数独ソルバーで確認できます。",
        ],
      },
    ],
    proTipTitle: "上達のコツ",
    proTipBody:
      "各問題は、すでに最も多く置かれている数字から始めましょう。残る場所が最も少ないため、最初の確実な配置が見つかりやすくなります。",
    faqTitle: "初心者 FAQ",
    faqs: [
      {
        question: "最初はどの難易度で遊ぶべきですか？",
        answer:
          "初級です。ヒントが51個あるので、スキャンとシングルの推理だけで解けます。これはどの高難度でも土台になります。",
      },
      {
        question: "当てずっぽうで入れる場面はありますか？",
        answer:
          "いいえ。どの問題も解はひとつで、論理で解けます。推測するしかないと感じたら、メモを見直すか、まだ使っていないテクニックを探しましょう。",
      },
      {
        question: "ミス制限とは何ですか？",
        answer:
          "ミス制限 (3/3) というスマート設定です。間違った数字はミスと数えられ、3回でゲームオーバーになります。設定でオフにできます。",
      },
    ],
    crossLinkIntro:
      "シングルに慣れたら上級パターンガイドへ。友達と同じ盤面で遊ぶにはマルチプレイ数独ガイドを、リファレンスとして「ルールと戦略」ページも手元に置いておきましょう。",
  },
  "advanced-patterns": {
    slug: "advanced-patterns",
    ...NAV_JA,
    badge: "上級ガイド",
    title: "上級・エキスパート問題のための数独上級パターン",
    subtitle:
      "シングルの先へ。ペア、交差、X-Wing、スカイスクレイパー、2-String Kite、Y-Wing を学び、強いプレイヤーのようにメモを活用しましょう。",
    metaTitle: "数独の上級パターン：X-Wing・Y-Wing・ペアほか",
    metaDescription:
      "ネイキッド／ヒドゥンペア、ポインティングペア、ボックスライン削減、X-Wing、スカイスクレイパー、2-String Kite、Y-Wing で上級・エキスパートに挑戦。",
    readTimeLabel: "読了目安 8分",
    sections: [
      {
        heading: "頼れるメモのワークフローを作る",
        paragraphs: [
          "上級パターンは正確な候補メモに依存します。自動メモ入力は空きマスに候補を埋める機能で、上級とエキスパートでのみ使え、メモの自動削除は数字を置くたびに候補を整理してくれます。",
          "メモは一度埋めたら、配置のたびに更新しましょう。古いメモがひとつあるだけで、成立していないパターンが成立して見えることがあります。",
        ],
      },
      {
        heading: "ネイキッド／ヒドゥンのペアとトリプル",
        paragraphs: [
          "ネイキッドペアとは、同じ範囲内で同じ2つの候補だけを持つ2マスのことです。その2つの数字はそのマスに入るので、範囲内の他のマスから消せます。",
          "ヒドゥンペアはその逆で、範囲内で2マスにしか入らない2つの数字です。そのマスには他の数字が入らないので、余分な候補を削除できます。トリプルは同じ考え方を3マス・3数字に広げたものです。",
        ],
      },
      {
        heading: "ポインティングペアとボックスライン削減",
        paragraphs: [
          "あるブロック内で、ある数字の候補がすべて1つの行または列に並ぶとき、その数字はその線の他の場所には入りません。これがポインティングペアです。",
          "ボックスライン削減は逆の考え方です。行または列で、ある数字の候補がすべて1つのブロックに収まるなら、そのブロックの他のマスから消せます。",
        ],
      },
      {
        heading: "ウィングとフィッシュ：X-Wing、スカイスクレイパー、2-String Kite、Y-Wing",
        paragraphs: [
          "これらのパターンは、いくつかのマスを結び付けて「2つの結果のどちらかは必ず真」となる状況を作り、両方が見えるマスの候補を消します。",
        ],
        bullets: [
          "X-Wing：ある数字が2つの行でそれぞれちょうど2マスにあり、同じ2つの列に揃っている。その列の他のマスから消します。",
          "スカイスクレイパー：2本の線でそれぞれ2マスに数字があり、片端の列が共通。両方の自由端が見えるマスからその数字を消します。",
          "2-String Kite：ある行とある列にそれぞれ数字が2つずつあり、1つのブロックでつながっている。",
          "Y-Wing：候補 AB のピボットが、AC と BC の2マスと結び付く。両方の翼が見えるマスから C を消します。",
        ],
      },
      {
        heading: "エキスパート盤面のための解く順序",
        paragraphs: [
          "エキスパートの問題はヒントが25個だけです。順序を決めて進めましょう。まずシングル、次に交差、そのあとペアとトリプル、最後にウィングとフィッシュです。",
          "削除のたびに新しいシングルがないかもう一度確認します。自作の問題が止まったときは、数独ソルバーで解がひとつか複数か、あるいはないかを確認できます。",
        ],
      },
    ],
    proTipTitle: "上達のコツ",
    proTipBody:
      "パターンは数字ごとに探しましょう。すべてのメモを通して1つの数字だけを見て、1から9まで順に進めます。X-Wing やスカイスクレイパーの多くはこの方法で見つかります。",
    faqTitle: "上級 FAQ",
    faqs: [
      {
        question: "最初に覚えるべき上級テクニックは？",
        answer:
          "ポインティングペアとボックスライン削減です。頻繁に現れ、見るのは1つの数字と1つのブロックだけで、多くの上級盤面を突破できます。",
      },
      {
        question: "自動メモ入力はすべての難易度で使えますか？",
        answer:
          "いいえ。自動メモ入力は上級とエキスパートのモードでのみ利用できます。初級と中級では自分でメモを書くことになり、良い練習になります。",
      },
      {
        question: "他の出典の問題も確認できますか？",
        answer:
          "はい。数独ソルバーにヒントを入力してください。解が一意か、複数か、存在しないかを示し、解答も表示できます。",
      },
    ],
    crossLinkIntro:
      "テクニックの一覧は「ルールと戦略」ページで確認できます。基礎は初心者ガイドで固め、パターンの腕試しはマルチプレイ数独ガイドで友達と対戦しましょう。",
  },
};

// ---------------------------------------------------------------------------
// KO
// ---------------------------------------------------------------------------

const NAV_KO: GuideNavCopy = {
  relatedLinksTitle: "더 알아보기",
  practiceTitle: "읽은 내용 바로 연습하기",
  linkLabels: {
    rules: "스도쿠 규칙과 전략",
    solver: "스도쿠 솔버",
    daily: "일일 챌린지",
    about: "Sudoku Sync 소개",
    multiplayerGuide: "멀티플레이 스도쿠 가이드",
    beginnerGuide: "스도쿠 초보자 가이드",
    advancedGuide: "고급 패턴 가이드",
  },
  practiceLabels: {
    easy: "쉬움 플레이",
    medium: "보통 플레이",
    hard: "어려움 플레이",
    expert: "전문가 플레이",
    daily: "오늘의 일일 챌린지 플레이",
    multiplayer: "멀티플레이 방 만들기",
  },
};

const GUIDES_KO: Record<GuideSlug, GuideArticleContent> = {
  "multiplayer-sudoku": {
    slug: "multiplayer-sudoku",
    ...NAV_KO,
    badge: "멀티플레이 가이드",
    title: "친구와 함께하는 멀티플레이 스도쿠 방법",
    subtitle:
      "완전히 같은 보드에서 겨루고, 몇 초 만에 링크를 공유하고, 모두가 끝났을 때 결과를 비교하세요. 로비도 대기도 없습니다.",
    metaTitle: "멀티플레이 스도쿠 가이드: 방 코드, 공유 링크, 친구",
    metaDescription:
      "Sudoku Sync의 동일 보드 실시간 및 비동기 멀티플레이 방식을 안내합니다. 6자리 방 코드, 선택형 PIN, 직접 공유 링크, 친구, 고스트 모드.",
    readTimeLabel: "읽는 시간 5분",
    sections: [
      {
        heading: "하나의 보드, 대기 시간 제로",
        paragraphs: [
          "Sudoku Sync 멀티플레이에서는 모든 플레이어가 동일한 9×9 퍼즐을 받습니다. 누구도 더 쉽거나 어려운 퍼즐을 풀지 않으므로 오직 논리력과 속도로 승부가 갈립니다.",
          "기다려야 하는 로비가 없습니다. 각 플레이어의 타이머, 진행 상황, 제출은 서로 독립적이어서 나란히 실시간으로 하거나 몇 시간 뒤에 끝내도 같은 순위표에 반영됩니다.",
        ],
      },
      {
        heading: "네 단계로 방 만들기",
        paragraphs: [
          "멀티플레이를 열고 만들기를 선택하세요. 방 설정에서 누군가 참여하기 전에 규칙을 정할 수 있습니다.",
        ],
        bullets: [
          "난이도 선택: 쉬움(단서 51개), 보통(39개), 어려움(30개), 전문가(25개).",
          "실수 제한, 힌트 제한, 타이머 표시 여부 설정.",
          "원하면 방 PIN으로 방을 잠금.",
          "6자리 숫자 방 코드를 공유하거나 링크를 바로 전송.",
        ],
      },
      {
        heading: "코드 또는 직접 링크로 참여하기",
        paragraphs: [
          "참여하려면 멀티플레이를 열고 참여하기를 선택한 뒤 6자리 방 코드를 입력하세요. 호스트가 방 PIN을 설정했다면 PIN도 입력합니다.",
          "공유 링크는 ?room= 형식입니다. 어떤 브라우저에서 열어도 바로 보드가 로드되어 친구는 설치 없이 웹에서 플레이할 수 있습니다. Android와 웹 플레이어는 같은 보드에서 겨룹니다.",
        ],
      },
      {
        heading: "최근 플레이어, 친구, 고스트 모드",
        paragraphs: [
          "초대 목록에는 두 개의 탭이 있습니다. 최근 플레이어는 이미 함께 한 사람들이 표시되어 바로 재대결할 수 있습니다. 친구는 지속적으로 유지되는 목록입니다.",
          "Google로 로그인하면 친구가 기기 간에 동기화됩니다. 게스트 모드에서는 모든 데이터가 사용 중인 기기에 독립적으로 보관됩니다. 고스트 모드를 켜면 온라인 상태를 숨기고 플레이할 수 있습니다.",
        ],
      },
      {
        heading: "결과는 자동으로 도착합니다",
        paragraphs: [
          "친구가 나중에 끝내면 결과가 자동으로 동기화되고 레이스가 끝났다는 알림이 옵니다. 알림을 열면 모든 참가자의 완료 시간과 실수 횟수가 담긴 순위표를 볼 수 있습니다.",
        ],
        bullets: [
          "코드를 보내기 전에 방 제한을 정해 모두가 같은 조건에서 겨루도록 하세요.",
          "스마트 어시스턴트는 개인 설정입니다. 순수한 대결을 원하면 미리 함께 정하세요.",
        ],
      },
    ],
    proTipTitle: "프로 팁",
    proTipBody:
      "코드를 공유하기 전에 방 설정에서 실수, 힌트, 타이머 제한을 정하세요. 모두가 같은 조건으로 겨루므로 참여 시간이 달라도 순위가 공정하게 유지됩니다.",
    faqTitle: "멀티플레이 FAQ",
    faqs: [
      {
        question: "친구가 앱을 설치해야 하나요?",
        answer:
          "아니요. ?room= 공유 링크는 어떤 브라우저에서도 같은 보드를 엽니다. 나중에 Android 앱을 설치해 이어서 플레이할 수도 있습니다.",
      },
      {
        question: "친구와 플레이하려면 계정이 필요한가요?",
        answer:
          "게스트로도 방을 만들거나 참여할 수 있습니다. Google 로그인을 하면 기기 간에 동기화되는 지속형 친구 목록을 쓸 수 있고, 게스트 데이터는 기기에 독립적으로 남습니다.",
      },
      {
        question: "친구가 저보다 늦게 끝내면 어떻게 되나요?",
        answer:
          "내 결과는 저장되고, 친구의 결과는 끝내는 즉시 순위표에 추가됩니다. 알림이 오므로 온라인에서 기다릴 필요가 없습니다.",
      },
    ],
    crossLinkIntro:
      "처음이라면 초보자 가이드와 규칙과 전략 페이지부터 보세요. 다음 대결 전에 일일 챌린지로 풀이 속도를 끌어올리는 것도 좋습니다.",
  },
  "beginner-sudoku": {
    slug: "beginner-sudoku",
    ...NAV_KO,
    badge: "초보자 가이드",
    title: "초보자를 위한 스도쿠: 첫 퍼즐을 단계별로",
    subtitle:
      "꼭 필요한 규칙 하나를 익히고, 알맞은 시작 난이도를 고르고, 내장 도우미로 첫 퍼즐을 자신 있게 완성해 보세요.",
    metaTitle: "초보자 스도쿠: 규칙, 쉬운 팁, 스마트 어시스턴트",
    metaDescription:
      "클래식 9×9 스도쿠 입문 가이드. 핵심 규칙, 쉬움·보통·어려움·전문가의 차이, 첫 기법, 메모와 스마트 어시스턴트를 소개합니다.",
    readTimeLabel: "읽는 시간 6분",
    sections: [
      {
        heading: "필요한 규칙은 단 하나",
        paragraphs: [
          "스도쿠는 아홉 개의 3×3 블록으로 이루어진 9×9 격자에서 합니다. 빈칸마다 1부터 9까지 숫자를 채워 모든 가로줄, 세로줄, 3×3 블록에 각 숫자가 정확히 한 번씩 들어가게 하면 됩니다.",
          "계산도 추측도 필요 없습니다. Sudoku Sync의 모든 퍼즐은 해답이 하나뿐이어서 논리만으로 항상 풀 수 있습니다.",
        ],
      },
      {
        heading: "첫 난이도 고르기",
        paragraphs: [
          "네 단계는 처음에 주어지는 숫자 수로 구분됩니다. 단서가 많을수록 빈칸이 적고 추론도 쉬워집니다.",
        ],
        bullets: [
          "쉬움: 단서 51개(빈칸 30개). 시작하기에 가장 좋습니다.",
          "보통: 단서 39개(빈칸 42개).",
          "어려움: 단서 30개(빈칸 51개).",
          "전문가: 단서 25개(빈칸 56개).",
        ],
      },
      {
        heading: "처음 익힐 세 가지 기법",
        paragraphs: [
          "스캔으로 시작하세요. 숫자 하나를 골라 이미 놓인 위치를 확인하고, 그 숫자의 가로줄과 세로줄이 블록 안의 어느 칸을 막는지 살펴봅니다.",
          "그다음 싱글을 찾으세요. 네이키드 싱글은 들어갈 수 있는 숫자가 하나뿐인 칸입니다. 히든 싱글은 가로줄, 세로줄 또는 블록에서 한 칸에만 들어갈 수 있는 숫자입니다. 어떤 영역의 여덟 칸이 차면 마지막 빈칸은 풀 하우스입니다.",
        ],
      },
      {
        heading: "메모와 스마트 어시스턴트",
        paragraphs: [
          "메모를 사용하면 확신이 들 때까지 칸에 작은 후보 숫자를 적어 둘 수 있습니다. 설정의 다음 도우미가 학습을 편하게 해 줍니다.",
        ],
        bullets: [
          "동일한 숫자 강조: 칸을 선택하면 같은 숫자를 모두 강조합니다.",
          "남은 숫자 표시: 각 숫자가 몇 개 남았는지 보여 줍니다.",
          "관련 영역 강조: 선택한 칸의 가로줄, 세로줄, 블록을 은은하게 강조합니다.",
          "메모 자동 삭제: 숫자를 놓으면 연결된 칸의 같은 메모를 지웁니다.",
          "빠른 입력 (숫자 먼저): 숫자를 고정해 여러 칸을 연속으로 터치할 수 있습니다.",
          "완료된 숫자 자동 전환: 한 숫자를 아홉 개 모두 놓으면 다음 숫자로 넘어갑니다.",
        ],
      },
      {
        heading: "실수 제한과 매일의 습관",
        paragraphs: [
          "엄격한 실수 제한 (3/3)은 실수가 세 번이면 게임이 끝나 신중한 플레이를 길러 줍니다. 배우는 동안에는 설정에서 끌 수 있습니다.",
          "매일 짧게 일일 챌린지를 하면 습관이 만들어지고, 막힌 퍼즐이 올바른지는 스도쿠 솔버로 확인할 수 있습니다.",
        ],
      },
    ],
    proTipTitle: "프로 팁",
    proTipBody:
      "이미 가장 많이 나온 숫자부터 시작하세요. 남은 자리가 가장 적어서 확실한 첫 배치가 나오기 쉽습니다.",
    faqTitle: "초보자 FAQ",
    faqs: [
      {
        question: "처음에는 어떤 난이도로 해야 하나요?",
        answer:
          "쉬움입니다. 단서가 51개여서 스캔과 싱글 추론만으로 풀 수 있고, 이는 모든 어려운 단계의 기초입니다.",
      },
      {
        question: "찍어야 할 때가 있나요?",
        answer:
          "없습니다. 모든 퍼즐은 해답이 하나이며 논리로 풀 수 있습니다. 찍어야 할 것 같다면 메모를 다시 확인하거나 아직 쓰지 않은 기법을 찾아보세요.",
      },
      {
        question: "실수 제한이란 무엇인가요?",
        answer:
          "엄격한 실수 제한 (3/3)이라는 스마트 설정입니다. 틀린 숫자는 실수로 계산되며 세 번째에 게임이 끝납니다. 설정에서 끌 수 있습니다.",
      },
    ],
    crossLinkIntro:
      "싱글이 쉬워지면 고급 패턴 가이드를 읽어 보세요. 친구와 같은 보드에서 겨루려면 멀티플레이 스도쿠 가이드를, 참고용으로는 규칙과 전략 페이지를 곁에 두세요.",
  },
  "advanced-patterns": {
    slug: "advanced-patterns",
    ...NAV_KO,
    badge: "고급 가이드",
    title: "어려움·전문가 퍼즐을 위한 스도쿠 고급 패턴",
    subtitle:
      "싱글을 넘어 페어, 교차, X-Wing, 스카이스크레이퍼, 2-String Kite, Y-Wing을 익히고 고수처럼 메모를 활용해 보세요.",
    metaTitle: "스도쿠 고급 패턴: X-Wing, Y-Wing, 페어 등",
    metaDescription:
      "네이키드·히든 페어, 포인팅 페어, 박스-라인 소거, X-Wing, 스카이스크레이퍼, 2-String Kite, Y-Wing으로 어려움·전문가 스도쿠에 도전하세요.",
    readTimeLabel: "읽는 시간 8분",
    sections: [
      {
        heading: "믿을 수 있는 메모 흐름 만들기",
        paragraphs: [
          "고급 패턴은 정확한 후보 메모에 달려 있습니다. 자동 메모는 빈칸에 후보를 채워 주며 어려움과 전문가에서만 사용할 수 있고, 메모 자동 삭제는 숫자를 놓을 때마다 후보를 깔끔하게 정리해 줍니다.",
          "메모는 한 번 채운 뒤 숫자를 놓을 때마다 갱신하세요. 낡은 메모 하나만으로도 성립하지 않는 패턴이 성립하는 것처럼 보일 수 있습니다.",
        ],
      },
      {
        heading: "네이키드·히든 페어와 트리플",
        paragraphs: [
          "네이키드 페어는 한 영역에서 같은 두 후보만 가진 두 칸입니다. 그 숫자들은 그 칸에 들어가야 하므로 영역 안의 다른 칸에서 지울 수 있습니다.",
          "히든 페어는 반대입니다. 한 영역에서 두 칸에만 들어갈 수 있는 두 숫자입니다. 그 칸에는 다른 숫자가 들어갈 수 없으므로 나머지 후보를 지웁니다. 트리플은 같은 논리를 세 칸과 세 숫자로 확장한 것입니다.",
        ],
      },
      {
        heading: "포인팅 페어와 박스-라인 소거",
        paragraphs: [
          "한 블록 안에서 어떤 숫자의 후보가 모두 한 가로줄 또는 세로줄에 있으면, 그 숫자는 그 줄의 나머지 칸에 들어갈 수 없습니다. 이것이 포인팅 페어입니다.",
          "박스-라인 소거는 반대로 작동합니다. 가로줄 또는 세로줄에서 어떤 숫자의 후보가 모두 한 블록 안에 있으면, 그 블록의 나머지 칸에서 지웁니다.",
        ],
      },
      {
        heading: "윙과 피시: X-Wing, 스카이스크레이퍼, 2-String Kite, Y-Wing",
        paragraphs: [
          "이 패턴들은 몇 개의 칸을 연결해 둘 중 하나는 반드시 참이 되게 하고, 둘 다 보이는 칸의 후보를 지웁니다.",
        ],
        bullets: [
          "X-Wing: 한 숫자가 두 줄에서 각각 정확히 두 칸에만 있고 같은 두 열에 정렬되어 있습니다. 그 열의 나머지 칸에서 지웁니다.",
          "스카이스크레이퍼: 두 줄에서 숫자가 각각 두 칸에 있고 한쪽 끝 열을 공유합니다. 두 자유 끝이 모두 보이는 칸에서 그 숫자를 지웁니다.",
          "2-String Kite: 한 가로줄과 한 세로줄에 숫자가 각각 두 번씩 있고 하나의 블록으로 연결됩니다.",
          "Y-Wing: 후보 AB인 피벗이 AC, BC인 두 칸과 연결됩니다. 두 날개가 모두 보이는 칸에서는 C를 지웁니다.",
        ],
      },
      {
        heading: "전문가 보드를 위한 풀이 순서",
        paragraphs: [
          "전문가 퍼즐은 단서가 25개뿐입니다. 정해진 순서로 진행하세요. 먼저 싱글, 다음 교차, 그다음 페어와 트리플, 마지막으로 윙과 피시입니다.",
          "소거할 때마다 새 싱글이 없는지 다시 훑어보세요. 직접 만든 퍼즐이 막히면 스도쿠 솔버가 해답이 하나인지, 여러 개인지, 없는지 알려 줍니다.",
        ],
      },
    ],
    proTipTitle: "프로 팁",
    proTipBody:
      "패턴은 숫자 하나씩 찾으세요. 모든 메모에서 한 숫자만 보고 1부터 9까지 차례로 살펴보세요. X-Wing과 스카이스크레이퍼 대부분이 이렇게 발견됩니다.",
    faqTitle: "고급 FAQ",
    faqs: [
      {
        question: "어떤 고급 기법부터 배우는 것이 좋나요?",
        answer:
          "포인팅 페어와 박스-라인 소거입니다. 자주 나타나고, 숫자 하나와 블록 하나만 보면 되며, 많은 어려움 보드를 풀어 줍니다.",
      },
      {
        question: "자동 메모는 모든 난이도에서 작동하나요?",
        answer:
          "아니요. 자동 메모는 어려움과 전문가 모드에서만 제공됩니다. 쉬움과 보통에서는 직접 메모를 적게 되며 좋은 연습이 됩니다.",
      },
      {
        question: "다른 곳의 퍼즐도 확인할 수 있나요?",
        answer:
          "네. 스도쿠 솔버에 단서를 입력하세요. 해답이 하나인지, 여러 개인지, 없는지 알려 주고 직접 풀어 주기도 합니다.",
      },
    ],
    crossLinkIntro:
      "전체 기법 목록은 규칙과 전략 페이지에서 확인하고, 초보자 가이드로 기초를 다지거나 멀티플레이 스도쿠 가이드로 친구와 패턴 실력을 겨뤄 보세요.",
  },
};

// ---------------------------------------------------------------------------
// ES
// ---------------------------------------------------------------------------

const NAV_ES: GuideNavCopy = {
  relatedLinksTitle: "Sigue aprendiendo",
  practiceTitle: "Practica lo que has leído",
  linkLabels: {
    rules: "Reglas y estrategias de Sudoku",
    solver: "Solucionador de Sudoku",
    daily: "Reto Diario",
    about: "Acerca de Sudoku Sync",
    multiplayerGuide: "Guía de Sudoku multijugador",
    beginnerGuide: "Guía de Sudoku para principiantes",
    advancedGuide: "Guía de patrones avanzados",
  },
  practiceLabels: {
    easy: "Jugar Fácil",
    medium: "Jugar Medio",
    hard: "Jugar Difícil",
    expert: "Jugar Experto",
    daily: "Jugar el Reto Diario de hoy",
    multiplayer: "Crear una sala multijugador",
  },
};

const GUIDES_ES: Record<GuideSlug, GuideArticleContent> = {
  "multiplayer-sudoku": {
    slug: "multiplayer-sudoku",
    ...NAV_ES,
    badge: "Guía multijugador",
    title: "Cómo jugar Sudoku multijugador con amigos",
    subtitle:
      "Compite en exactamente el mismo tablero, comparte un enlace en segundos y compara resultados cuando todos terminen. Sin lobby y sin esperas.",
    metaTitle: "Sudoku multijugador: código de sala, enlace y amigos",
    metaDescription:
      "Descubre cómo funciona el multijugador en el mismo tablero, en vivo y asíncrono, en Sudoku Sync: código de sala de 6 dígitos, PIN opcional, enlace directo, amigos y Modo Fantasma.",
    readTimeLabel: "5 min de lectura",
    sections: [
      {
        heading: "Un tablero, cero esperas",
        paragraphs: [
          "En el multijugador de Sudoku Sync todos reciben el mismo puzzle de 9×9. Nadie resuelve una cuadrícula más fácil o más difícil, así que el resultado depende solo de la lógica y la velocidad.",
          "No hay un lobby en el que esperar. El temporizador, el progreso y el envío de cada jugador son independientes, por lo que puedes jugar en vivo junto a otros o terminar horas después y aparecer igualmente en la misma clasificación.",
        ],
      },
      {
        heading: "Crea una sala en cuatro pasos",
        paragraphs: [
          "Abre Multijugador y elige Crear. En la configuración de la sala decides las reglas antes de que nadie se una.",
        ],
        bullets: [
          "Elige la dificultad: Fácil (51 pistas), Medio (39), Difícil (30) o Experto (25).",
          "Define el límite de errores, el límite de pistas y si el temporizador es visible.",
          "Bloquea la sala con un PIN opcional.",
          "Comparte el código de sala numérico de 6 dígitos o envía un enlace directo.",
        ],
      },
      {
        heading: "Únete con un código o un enlace directo",
        paragraphs: [
          "Para unirte, abre Multijugador, elige Unirse e introduce el código de sala de 6 dígitos. Si el anfitrión puso un PIN, también lo escribes.",
          "Los enlaces para compartir usan el formato ?room=. Al abrirlos en cualquier navegador el tablero se carga al instante, así que tus amigos juegan en la web sin instalar nada. Los jugadores de Android y de la web compiten en el mismo tablero.",
        ],
      },
      {
        heading: "Jugadores recientes, amigos y Modo Fantasma",
        paragraphs: [
          "La lista de invitaciones tiene dos pestañas. Jugadores recientes muestra a quienes ya han jugado contigo, listos para una revancha. Amigos es tu lista persistente.",
          "Al iniciar sesión con Google tus amigos se sincronizan entre dispositivos. En modo Invitado todo queda aislado en el dispositivo que usas. El Modo Fantasma oculta tu presencia en línea cuando prefieres jugar sin ser visto.",
        ],
      },
      {
        heading: "Los resultados llegan solos",
        paragraphs: [
          "Cuando un amigo termina más tarde, el resultado se sincroniza automáticamente y una notificación te avisa de que la carrera ha terminado. Ábrela para ver la clasificación con el tiempo y los errores de cada participante.",
        ],
        bullets: [
          "Acordad los límites de la sala antes de enviar el código para que todos compitan en las mismas condiciones.",
          "Los Asistentes Inteligentes son ajustes personales, así que decidid juntos si queréis una carrera pura.",
        ],
      },
    ],
    proTipTitle: "Consejo profesional",
    proTipBody:
      "Configura los límites de errores, pistas y temporizador en la sala antes de compartir el código. Así todos compiten en condiciones idénticas y la clasificación sigue siendo justa aunque los jugadores entren en momentos distintos.",
    faqTitle: "Preguntas frecuentes de multijugador",
    faqs: [
      {
        question: "¿Mis amigos necesitan instalar la aplicación?",
        answer:
          "No. Un enlace ?room= abre el mismo tablero en cualquier navegador. Más adelante pueden instalar la app de Android y seguir jugando.",
      },
      {
        question: "¿Necesito una cuenta para jugar con amigos?",
        answer:
          "Puedes crear salas y unirte como Invitado. Iniciar sesión con Google añade una lista de Amigos persistente que se sincroniza entre dispositivos, mientras que los datos de Invitado siguen aislados en tu dispositivo.",
      },
      {
        question: "¿Qué pasa si un amigo termina después que yo?",
        answer:
          "Tu resultado queda guardado y el suyo se suma a la clasificación en cuanto termina. Recibes una notificación, así que no tienes que esperar en línea.",
      },
    ],
    crossLinkIntro:
      "¿Eres nuevo? Empieza con la Guía de Sudoku para principiantes y la página de Reglas y estrategias, o mejora tu velocidad con el Reto Diario antes de la próxima carrera.",
  },
  "beginner-sudoku": {
    slug: "beginner-sudoku",
    ...NAV_ES,
    badge: "Guía para principiantes",
    title: "Sudoku para principiantes: tu primer puzzle paso a paso",
    subtitle:
      "Aprende la única regla que importa, elige la dificultad inicial adecuada y usa las ayudas integradas para terminar tu primera cuadrícula con confianza.",
    metaTitle: "Sudoku para principiantes: reglas, consejos y asistentes",
    metaDescription:
      "Guía tranquila del Sudoku clásico de 9×9: la regla básica, diferencias entre Fácil, Medio, Difícil y Experto, primeras técnicas, notas y Asistentes Inteligentes.",
    readTimeLabel: "6 min de lectura",
    sections: [
      {
        heading: "La única regla que necesitas",
        paragraphs: [
          "El Sudoku se juega en una cuadrícula de 9×9 formada por nueve cajas de 3×3. Rellena cada casilla vacía con un dígito del 1 al 9 de modo que cada fila, cada columna y cada caja de 3×3 contenga todos los dígitos exactamente una vez.",
          "No necesitas hacer cálculos ni adivinar. Cada puzzle de Sudoku Sync tiene una única solución, así que la lógica siempre basta.",
        ],
      },
      {
        heading: "Elige tu primera dificultad",
        paragraphs: [
          "Los cuatro niveles se diferencian por la cantidad de dígitos que se dan al principio. Más pistas significan menos casillas vacías y deducciones más sencillas.",
        ],
        bullets: [
          "Fácil: 51 pistas (30 casillas vacías). El mejor punto de partida.",
          "Medio: 39 pistas (42 casillas vacías).",
          "Difícil: 30 pistas (51 casillas vacías).",
          "Experto: 25 pistas (56 casillas vacías).",
        ],
      },
      {
        heading: "Tus tres primeras técnicas",
        paragraphs: [
          "Empieza con el escaneo: elige un dígito, mira dónde está ya colocado y comprueba qué casillas de una caja quedan bloqueadas por su fila y su columna.",
          "Después busca singles. Un Naked Single es una casilla que solo admite un dígito. Un Hidden Single es un dígito que solo cabe en una casilla de una fila, columna o caja. Cuando ocho casillas de una unidad están llenas, la última libre es un Full House.",
        ],
      },
      {
        heading: "Notas y Asistentes Inteligentes",
        paragraphs: [
          "Las notas te permiten escribir pequeños dígitos candidatos en una casilla hasta estar seguro. Estas ayudas de Ajustes hacen más suave el aprendizaje:",
        ],
        bullets: [
          "Destacar números idénticos marca todos los dígitos iguales al seleccionar una casilla.",
          "Mostrar números restantes indica cuántos de cada dígito faltan por colocar.",
          "Destacar área relacionada sombrea suavemente la fila, la columna y la caja de la casilla activa.",
          "Eliminar notas automáticamente borra las notas coincidentes en casillas conectadas al colocar un dígito.",
          "Relleno rápido (Número primero) fija un dígito para que puedas tocar varias casillas seguidas.",
          "Cambiar automáticamente números completos pasa al siguiente cuando se han colocado los nueve de un dígito.",
        ],
      },
      {
        heading: "Límite de errores y hábito diario",
        paragraphs: [
          "El Límite estricto de errores (3/3) termina la partida tras tres errores y entrena el juego cuidadoso. Puedes desactivarlo en Ajustes mientras aprendes.",
          "Un Reto Diario corto cada día crea el hábito, y el Solucionador de Sudoku puede comprobar si un puzzle en el que te has atascado es válido.",
        ],
      },
    ],
    proTipTitle: "Consejo profesional",
    proTipBody:
      "Empieza cada puzzle con el dígito que ya aparece más veces. Es el que menos lugares libres tiene, por lo que suele dar las primeras colocaciones seguras.",
    faqTitle: "Preguntas frecuentes para principiantes",
    faqs: [
      {
        question: "¿Qué dificultad debo jugar primero?",
        answer:
          "Fácil. Con 51 pistas se resuelve con escaneo y deducciones de singles, que son la base de todos los niveles más difíciles.",
      },
      {
        question: "¿Tengo que adivinar alguna vez?",
        answer:
          "No. Cada puzzle tiene una única solución y se resuelve con lógica. Si sientes que debes adivinar, revisa tus notas o busca una técnica que aún no hayas usado.",
      },
      {
        question: "¿Qué es el límite de errores?",
        answer:
          "Es el ajuste inteligente Límite estricto de errores (3/3). Un dígito incorrecto cuenta como error y la partida termina al tercero. Puedes desactivarlo en Ajustes.",
      },
    ],
    crossLinkIntro:
      "Cuando los singles te resulten fáciles, lee la Guía de patrones avanzados. Para jugar con un amigo en el mismo tablero, consulta la Guía de Sudoku multijugador y ten a mano la página de Reglas y estrategias.",
  },
  "advanced-patterns": {
    slug: "advanced-patterns",
    ...NAV_ES,
    badge: "Guía avanzada",
    title: "Patrones avanzados de Sudoku para puzzles Difíciles y Expertos",
    subtitle:
      "Ve más allá de los singles con pares, intersecciones, X-Wing, Skyscraper, 2-String Kite y Y-Wing, y usa las notas como los solucionadores expertos.",
    metaTitle: "Patrones avanzados de Sudoku: X-Wing, Y-Wing, pares y más",
    metaDescription:
      "Sube de nivel con pares desnudos y ocultos, pares apuntadores, reducción caja-línea, X-Wing, Skyscraper, 2-String Kite y Y-Wing en Sudoku Difícil y Experto.",
    readTimeLabel: "8 min de lectura",
    sections: [
      {
        heading: "Construye un flujo de notas fiable",
        paragraphs: [
          "Los patrones avanzados dependen de notas de candidatos precisas. Notas automáticas rellena los candidatos en las casillas vacías y solo está disponible en Difícil y Experto, mientras que Eliminar notas automáticamente las mantiene limpias al colocar dígitos.",
          "Rellena las notas una vez y actualízalas tras cada colocación. Una sola nota desactualizada puede hacer que un patrón parezca válido cuando no lo es.",
        ],
      },
      {
        heading: "Pares y tríos desnudos y ocultos",
        paragraphs: [
          "Un Naked Pair son dos casillas de una unidad con los mismos dos candidatos. Esos dígitos deben ir en esas casillas, así que los eliminas del resto de casillas de la unidad.",
          "Un Hidden Pair es lo contrario: dos dígitos que aparecen solo en dos casillas de una unidad. Esas casillas no pueden contener nada más, por lo que borras sus otros candidatos. Los tríos extienden la misma lógica a tres casillas y tres dígitos.",
        ],
      },
      {
        heading: "Pares apuntadores y reducción caja-línea",
        paragraphs: [
          "Cuando todos los candidatos de un dígito dentro de una caja están en una misma fila o columna, ese dígito no puede aparecer en el resto de esa línea. Es un Pointing Pair.",
          "La reducción caja-línea funciona al revés: si todos los candidatos de un dígito en una fila o columna están dentro de una caja, lo eliminas del resto de esa caja.",
        ],
      },
      {
        heading: "Alas y peces: X-Wing, Skyscraper, 2-String Kite, Y-Wing",
        paragraphs: [
          "Estos patrones enlazan unas pocas casillas de modo que uno de dos resultados tiene que ser cierto, lo que permite eliminar candidatos que ven a ambas.",
        ],
        bullets: [
          "X-Wing: un dígito aparece en exactamente dos casillas de cada una de dos filas, alineadas en las mismas dos columnas. Elimínalo del resto de esas columnas.",
          "Skyscraper: dos líneas tienen el dígito en dos casillas cada una y comparten el extremo de una columna. Las casillas que ven ambos extremos libres pierden ese dígito.",
          "2-String Kite: una fila y una columna contienen el dígito dos veces cada una y se conectan a través de una caja.",
          "Y-Wing: un pivote con candidatos AB enlaza dos casillas con AC y BC. Cualquier casilla que vea ambas alas pierde C.",
        ],
      },
      {
        heading: "Un orden de resolución para tableros Expertos",
        paragraphs: [
          "Los puzzles Expertos empiezan con solo 25 pistas. Trabaja en un orden fijo: primero singles, luego intersecciones, después pares y tríos, y solo al final alas y peces.",
          "Tras cada eliminación, vuelve a buscar singles nuevos. Si un puzzle propio se atasca, el Solucionador de Sudoku te dice si tiene una solución, varias o ninguna.",
        ],
      },
    ],
    proTipTitle: "Consejo profesional",
    proTipBody:
      "Busca patrones dígito por dígito. Observa un solo dígito en todas las notas y recorre del 1 al 9. Así aparecen la mayoría de los X-Wing y Skyscraper.",
    faqTitle: "Preguntas frecuentes avanzadas",
    faqs: [
      {
        question: "¿Qué técnica avanzada debería aprender primero?",
        answer:
          "Los pares apuntadores y la reducción caja-línea. Aparecen con frecuencia, solo requieren un dígito y una caja, y desbloquean muchos tableros Difíciles.",
      },
      {
        question: "¿Las notas automáticas funcionan en todas las dificultades?",
        answer:
          "No. Notas automáticas solo está disponible en los modos Difícil y Experto. En Fácil y Medio escribes tú las notas, lo cual es una buena práctica.",
      },
      {
        question: "¿Puedo comprobar un puzzle de otra fuente?",
        answer:
          "Sí. Introduce las pistas en el Solucionador de Sudoku. Indica si la cuadrícula tiene solución única, varias o ninguna, y puede resolverla por ti.",
      },
    ],
    crossLinkIntro:
      "Repasa la lista completa de técnicas en Reglas y estrategias, refuerza lo básico con la Guía de Sudoku para principiantes o pon a prueba tus patrones frente a un amigo con la Guía de Sudoku multijugador.",
  },
};

// ---------------------------------------------------------------------------
// FR
// ---------------------------------------------------------------------------

const NAV_FR: GuideNavCopy = {
  relatedLinksTitle: "Continuer à apprendre",
  practiceTitle: "Mettez en pratique",
  linkLabels: {
    rules: "Règles et stratégies du Sudoku",
    solver: "Solveur Sudoku",
    daily: "Défi du Jour",
    about: "À propos de Sudoku Sync",
    multiplayerGuide: "Guide du Sudoku multijoueur",
    beginnerGuide: "Guide du Sudoku pour débutants",
    advancedGuide: "Guide des motifs avancés",
  },
  practiceLabels: {
    easy: "Jouer en Facile",
    medium: "Jouer en Moyen",
    hard: "Jouer en Difficile",
    expert: "Jouer en Expert",
    daily: "Jouer le Défi du Jour",
    multiplayer: "Créer un salon multijoueur",
  },
};

const GUIDES_FR: Record<GuideSlug, GuideArticleContent> = {
  "multiplayer-sudoku": {
    slug: "multiplayer-sudoku",
    ...NAV_FR,
    badge: "Guide multijoueur",
    title: "Comment jouer au Sudoku multijoueur entre amis",
    subtitle:
      "Affrontez-vous sur exactement la même grille, partagez un lien en quelques secondes et comparez les résultats quand chacun a terminé. Pas de lobby, pas d'attente.",
    metaTitle: "Sudoku multijoueur : code de salon, lien et amis",
    metaDescription:
      "Découvrez le multijoueur sur la même grille, en direct et en différé, dans Sudoku Sync : code de salon à 6 chiffres, PIN optionnel, lien direct, amis et Mode Fantôme.",
    readTimeLabel: "5 min de lecture",
    sections: [
      {
        heading: "Une grille, zéro attente",
        paragraphs: [
          "Dans le multijoueur de Sudoku Sync, chaque joueur reçoit exactement la même grille 9×9. Personne ne résout une grille plus facile ou plus difficile, donc seuls la logique et la vitesse font la différence.",
          "Il n'y a pas de lobby où patienter. Le chronomètre, la progression et la soumission de chaque joueur sont indépendants : vous pouvez jouer en direct côte à côte ou terminer des heures plus tard et figurer dans le même classement.",
        ],
      },
      {
        heading: "Créer un salon en quatre étapes",
        paragraphs: [
          "Ouvrez Multijoueur et choisissez Créer. La configuration du salon vous permet de fixer les règles avant que quiconque ne rejoigne.",
        ],
        bullets: [
          "Choisissez la difficulté : Facile (51 indices), Moyen (39), Difficile (30) ou Expert (25).",
          "Réglez la limite d'erreurs, la limite d'indices et la visibilité du chronomètre.",
          "Verrouillez éventuellement le salon avec un PIN.",
          "Partagez le code de salon numérique à 6 chiffres ou envoyez un lien direct.",
        ],
      },
      {
        heading: "Rejoindre avec un code ou un lien direct",
        paragraphs: [
          "Pour rejoindre, ouvrez Multijoueur, choisissez Rejoindre et saisissez le code de salon à 6 chiffres. Si l'hôte a défini un PIN, vous le saisissez aussi.",
          "Les liens de partage utilisent le format ?room=. Ouverts dans n'importe quel navigateur, ils chargent la grille immédiatement : vos amis jouent sur le web sans rien installer. Les joueurs Android et web s'affrontent sur la même grille.",
        ],
      },
      {
        heading: "Joueurs récents, amis et Mode Fantôme",
        paragraphs: [
          "La liste d'invitations comporte deux onglets. Joueurs récents affiche les personnes avec qui vous avez déjà joué, prêtes pour une revanche. Amis est votre liste persistante.",
          "En vous connectant avec Google, vos amis se synchronisent entre vos appareils. En mode Invité, tout reste isolé sur l'appareil utilisé. Le Mode Fantôme masque votre présence en ligne quand vous préférez jouer discrètement.",
        ],
      },
      {
        heading: "Les résultats arrivent tout seuls",
        paragraphs: [
          "Quand un ami termine plus tard, son résultat se synchronise automatiquement et une notification vous indique que la course est terminée. Ouvrez-la pour voir le classement avec le temps et les erreurs de chaque participant.",
        ],
        bullets: [
          "Convenez des limites du salon avant d'envoyer le code pour que tout le monde joue dans les mêmes conditions.",
          "Les Assistants Intelligents sont des réglages personnels : décidez ensemble si vous voulez une course pure.",
        ],
      },
    ],
    proTipTitle: "Astuce de pro",
    proTipBody:
      "Réglez les limites d'erreurs, d'indices et de chronomètre dans la configuration du salon avant de partager le code. Tout le monde joue alors dans des conditions identiques et le classement reste équitable, même si les joueurs arrivent à des moments différents.",
    faqTitle: "FAQ multijoueur",
    faqs: [
      {
        question: "Mes amis doivent-ils installer l'application ?",
        answer:
          "Non. Un lien ?room= ouvre la même grille dans n'importe quel navigateur. Ils pourront installer l'application Android plus tard et continuer à jouer.",
      },
      {
        question: "Ai-je besoin d'un compte pour jouer avec des amis ?",
        answer:
          "Vous pouvez créer un salon et en rejoindre un en tant qu'Invité. La connexion Google ajoute une liste d'Amis persistante synchronisée entre appareils, tandis que les données Invité restent isolées sur votre appareil.",
      },
      {
        question: "Que se passe-t-il si un ami termine après moi ?",
        answer:
          "Votre résultat est enregistré et le sien s'ajoute au classement dès qu'il termine. Vous recevez une notification, inutile d'attendre en ligne.",
      },
    ],
    crossLinkIntro:
      "Nouveau venu ? Commencez par le Guide du Sudoku pour débutants et la page Règles et stratégies, ou affûtez votre vitesse avec le Défi du Jour avant la prochaine course.",
  },
  "beginner-sudoku": {
    slug: "beginner-sudoku",
    ...NAV_FR,
    badge: "Guide débutant",
    title: "Sudoku pour débutants : votre première grille pas à pas",
    subtitle:
      "Apprenez l'unique règle qui compte, choisissez la bonne difficulté de départ et profitez des aides intégrées pour terminer votre première grille en confiance.",
    metaTitle: "Sudoku pour débutants : règles, conseils et assistants",
    metaDescription:
      "Un guide serein du Sudoku classique 9×9 : la règle de base, les différences entre Facile, Moyen, Difficile et Expert, premières techniques, notes et Assistants Intelligents.",
    readTimeLabel: "6 min de lecture",
    sections: [
      {
        heading: "La seule règle à connaître",
        paragraphs: [
          "Le Sudoku se joue sur une grille 9×9 composée de neuf blocs 3×3. Remplissez chaque case vide avec un chiffre de 1 à 9 de sorte que chaque ligne, chaque colonne et chaque bloc 3×3 contienne chaque chiffre exactement une fois.",
          "Aucun calcul, aucune devinette. Chaque grille de Sudoku Sync n'a qu'une seule solution : la logique suffit toujours.",
        ],
      },
      {
        heading: "Choisir sa première difficulté",
        paragraphs: [
          "Les quatre niveaux se distinguent par le nombre de chiffres donnés au départ. Plus il y a d'indices, moins il y a de cases vides et plus les déductions sont simples.",
        ],
        bullets: [
          "Facile : 51 indices (30 cases vides). Le meilleur point de départ.",
          "Moyen : 39 indices (42 cases vides).",
          "Difficile : 30 indices (51 cases vides).",
          "Expert : 25 indices (56 cases vides).",
        ],
      },
      {
        heading: "Vos trois premières techniques",
        paragraphs: [
          "Commencez par le balayage : choisissez un chiffre, repérez où il se trouve déjà et voyez quelles cases d'un bloc sont bloquées par sa ligne et sa colonne.",
          "Cherchez ensuite les singles. Un Naked Single est une case qui ne peut contenir qu'un seul chiffre. Un Hidden Single est un chiffre qui ne tient que dans une seule case d'une ligne, d'une colonne ou d'un bloc. Quand huit cases d'une unité sont remplies, la dernière libre est un Full House.",
        ],
      },
      {
        heading: "Notes et Assistants Intelligents",
        paragraphs: [
          "Les notes permettent d'écrire de petits chiffres candidats dans une case jusqu'à ce que vous soyez sûr. Ces aides des Réglages facilitent l'apprentissage :",
        ],
        bullets: [
          "Surligner les chiffres identiques marque tous les chiffres égaux quand vous sélectionnez une case.",
          "Afficher les chiffres restants indique combien d'exemplaires de chaque chiffre restent à placer.",
          "Surligner la zone liée ombre doucement la ligne, la colonne et le bloc de la case active.",
          "Effacer auto les notes supprime les notes correspondantes dans les cases liées quand vous placez un chiffre.",
          "Saisie Rapide (Chiffre d'abord) verrouille un chiffre pour toucher plusieurs cases d'affilée.",
          "Basculer auto les chiffres complétés passe au suivant quand les neuf exemplaires sont placés.",
        ],
      },
      {
        heading: "Limite d'erreurs et habitude quotidienne",
        paragraphs: [
          "La Limite d'Erreurs Stricte (3/3) met fin à la partie après trois erreurs et encourage un jeu soigné. Vous pouvez la désactiver dans les Réglages pendant l'apprentissage.",
          "Un court Défi du Jour chaque jour crée l'habitude, et le Solveur Sudoku peut vérifier si une grille sur laquelle vous bloquez est valide.",
        ],
      },
    ],
    proTipTitle: "Astuce de pro",
    proTipBody:
      "Commencez chaque grille par le chiffre qui apparaît déjà le plus souvent. Il a le moins d'emplacements restants et donne donc généralement les premiers placements sûrs.",
    faqTitle: "FAQ débutants",
    faqs: [
      {
        question: "Quelle difficulté dois-je jouer en premier ?",
        answer:
          "Facile. Avec 51 indices, on la résout par balayage et déductions de singles, la base de tous les niveaux supérieurs.",
      },
      {
        question: "Faut-il parfois deviner ?",
        answer:
          "Non. Chaque grille a exactement une solution et se résout par logique. Si vous avez l'impression de devoir deviner, vérifiez vos notes ou cherchez une technique que vous n'avez pas encore utilisée.",
      },
      {
        question: "Qu'est-ce que la limite d'erreurs ?",
        answer:
          "C'est le réglage intelligent Limite d'Erreurs Stricte (3/3). Un chiffre incorrect compte comme une erreur et la partie s'arrête à la troisième. Vous pouvez la désactiver dans les Réglages.",
      },
    ],
    crossLinkIntro:
      "Quand les singles vous semblent faciles, lisez le Guide des motifs avancés. Pour jouer avec un ami sur la même grille, consultez le Guide du Sudoku multijoueur, et gardez la page Règles et stratégies sous la main.",
  },
  "advanced-patterns": {
    slug: "advanced-patterns",
    ...NAV_FR,
    badge: "Guide avancé",
    title: "Motifs avancés de Sudoku pour les grilles Difficile et Expert",
    subtitle:
      "Dépassez les singles avec les paires, les intersections, X-Wing, Skyscraper, 2-String Kite et Y-Wing, et utilisez les notes comme les meilleurs solveurs.",
    metaTitle: "Motifs avancés de Sudoku : X-Wing, Y-Wing, paires et plus",
    metaDescription:
      "Progressez en Difficile et Expert avec les paires nues et cachées, paires pointantes, réduction bloc-ligne, X-Wing, Skyscraper, 2-String Kite et Y-Wing.",
    readTimeLabel: "8 min de lecture",
    sections: [
      {
        heading: "Construire un flux de notes fiable",
        paragraphs: [
          "Les motifs avancés reposent sur des notes de candidats exactes. Notes automatiques remplit les candidats dans les cases vides et n'existe qu'en Difficile et Expert, tandis qu'Effacer auto les notes les garde propres au fil des placements.",
          "Remplissez les notes une fois, puis mettez-les à jour après chaque placement. Une seule note périmée peut faire paraître valide un motif qui ne l'est pas.",
        ],
      },
      {
        heading: "Paires et triplets nus et cachés",
        paragraphs: [
          "Une Naked Pair est formée de deux cases d'une unité partageant les deux mêmes candidats. Ces chiffres vont forcément dans ces cases : vous les retirez des autres cases de l'unité.",
          "Une Hidden Pair est l'inverse : deux chiffres qui n'apparaissent que dans deux cases d'une unité. Ces cases ne peuvent contenir rien d'autre, vous supprimez donc leurs autres candidats. Les triplets étendent la même logique à trois cases et trois chiffres.",
        ],
      },
      {
        heading: "Paires pointantes et réduction bloc-ligne",
        paragraphs: [
          "Quand tous les candidats d'un chiffre dans un bloc sont sur une même ligne ou colonne, ce chiffre ne peut apparaître ailleurs sur cette ligne. C'est une Pointing Pair.",
          "La réduction bloc-ligne fonctionne en sens inverse : si tous les candidats d'un chiffre dans une ligne ou colonne se trouvent dans un seul bloc, retirez-le du reste de ce bloc.",
        ],
      },
      {
        heading: "Ailes et poissons : X-Wing, Skyscraper, 2-String Kite, Y-Wing",
        paragraphs: [
          "Ces motifs relient quelques cases de sorte que l'un des deux résultats soit forcément vrai, ce qui permet d'éliminer les candidats vus par les deux.",
        ],
        bullets: [
          "X-Wing : un chiffre apparaît dans exactement deux cases de chacune de deux lignes, alignées sur les deux mêmes colonnes. Retirez-le du reste de ces colonnes.",
          "Skyscraper : deux lignes contiennent le chiffre dans deux cases chacune et partagent une extrémité de colonne. Les cases voyant les deux extrémités libres perdent ce chiffre.",
          "2-String Kite : une ligne et une colonne contiennent chacune le chiffre deux fois et se rejoignent par un bloc.",
          "Y-Wing : un pivot de candidats AB relie deux cases AC et BC. Toute case voyant les deux ailes perd C.",
        ],
      },
      {
        heading: "Un ordre de résolution pour les grilles Expert",
        paragraphs: [
          "Les grilles Expert démarrent avec seulement 25 indices. Travaillez dans un ordre fixe : d'abord les singles, puis les intersections, puis les paires et triplets, et enfin les ailes et poissons.",
          "Après chaque élimination, cherchez de nouveau de nouveaux singles. Si une grille personnalisée bloque, le Solveur Sudoku vous dit si elle a une solution, plusieurs ou aucune.",
        ],
      },
    ],
    proTipTitle: "Astuce de pro",
    proTipBody:
      "Cherchez les motifs chiffre par chiffre. Observez un seul chiffre dans toutes les notes et parcourez de 1 à 9. La plupart des X-Wing et Skyscraper apparaissent ainsi.",
    faqTitle: "FAQ avancée",
    faqs: [
      {
        question: "Quelle technique avancée apprendre en premier ?",
        answer:
          "Les paires pointantes et la réduction bloc-ligne. Elles reviennent souvent, ne demandent qu'un chiffre et un bloc, et débloquent de nombreuses grilles Difficile.",
      },
      {
        question: "Les notes automatiques fonctionnent-elles à toutes les difficultés ?",
        answer:
          "Non. Notes automatiques n'est disponible qu'en modes Difficile et Expert. En Facile et Moyen, vous écrivez les notes vous-même, ce qui est un bon entraînement.",
      },
      {
        question: "Puis-je vérifier une grille d'une autre source ?",
        answer:
          "Oui. Saisissez les indices dans le Solveur Sudoku. Il indique si la grille a une solution unique, plusieurs solutions ou aucune, et peut la résoudre pour vous.",
      },
    ],
    crossLinkIntro:
      "Retrouvez la liste complète des techniques dans Règles et stratégies, consolidez vos bases avec le Guide du Sudoku pour débutants, ou testez vos motifs face à un ami avec le Guide du Sudoku multijoueur.",
  },
};

// ---------------------------------------------------------------------------
// IT
// ---------------------------------------------------------------------------

const NAV_IT: GuideNavCopy = {
  relatedLinksTitle: "Continua a imparare",
  practiceTitle: "Metti in pratica quanto letto",
  linkLabels: {
    rules: "Regole e strategie del Sudoku",
    solver: "Risolutore Sudoku",
    daily: "Sfida del Giorno",
    about: "Informazioni su Sudoku Sync",
    multiplayerGuide: "Guida al Sudoku multigiocatore",
    beginnerGuide: "Guida al Sudoku per principianti",
    advancedGuide: "Guida agli schemi avanzati",
  },
  practiceLabels: {
    easy: "Gioca Facile",
    medium: "Gioca Medio",
    hard: "Gioca Difficile",
    expert: "Gioca Esperto",
    daily: "Gioca la Sfida del Giorno",
    multiplayer: "Crea una stanza multigiocatore",
  },
};

const GUIDES_IT: Record<GuideSlug, GuideArticleContent> = {
  "multiplayer-sudoku": {
    slug: "multiplayer-sudoku",
    ...NAV_IT,
    badge: "Guida multigiocatore",
    title: "Come giocare a Sudoku multigiocatore con gli amici",
    subtitle:
      "Sfidatevi sulla stessa identica griglia, condividete un link in pochi secondi e confrontate i risultati quando tutti hanno finito. Niente lobby, niente attese.",
    metaTitle: "Sudoku multigiocatore: codice stanza, link e amici",
    metaDescription:
      "Scopri come funziona il multigiocatore sulla stessa griglia, dal vivo e asincrono, in Sudoku Sync: codice stanza a 6 cifre, PIN opzionale, link diretto, amici e Modalità Fantasma.",
    readTimeLabel: "5 min di lettura",
    sections: [
      {
        heading: "Una griglia, zero attese",
        paragraphs: [
          "Nel multigiocatore di Sudoku Sync ogni giocatore riceve lo stesso identico schema 9×9. Nessuno risolve una griglia più facile o più difficile, quindi il risultato dipende solo da logica e velocità.",
          "Non c'è nessuna lobby in cui aspettare. Timer, progressi e invio di ogni giocatore sono indipendenti: puoi giocare dal vivo fianco a fianco oppure finire ore dopo e trovarti comunque nella stessa classifica.",
        ],
      },
      {
        heading: "Crea una stanza in quattro passaggi",
        paragraphs: [
          "Apri Multigiocatore e scegli Crea. La configurazione della stanza ti permette di decidere le regole prima che qualcuno entri.",
        ],
        bullets: [
          "Scegli la difficoltà: Facile (51 indizi), Medio (39), Difficile (30) o Esperto (25).",
          "Imposta il limite di errori, il limite di suggerimenti e la visibilità del timer.",
          "Blocca facoltativamente la stanza con un PIN.",
          "Condividi il codice stanza numerico a 6 cifre oppure invia direttamente un link.",
        ],
      },
      {
        heading: "Entra con un codice o un link diretto",
        paragraphs: [
          "Per entrare, apri Multigiocatore, scegli Unisciti e digita il codice stanza a 6 cifre. Se l'host ha impostato un PIN, lo inserisci anche tu.",
          "I link di condivisione usano il formato ?room=. Aperti in qualsiasi browser caricano subito la griglia, così gli amici giocano sul web senza installare nulla. I giocatori Android e web si sfidano sulla stessa griglia.",
        ],
      },
      {
        heading: "Giocatori recenti, amici e Modalità Fantasma",
        paragraphs: [
          "L'elenco degli inviti ha due schede. Giocatori recenti mostra chi ha già giocato con te, pronto per una rivincita. Amici è la tua lista persistente.",
          "Accedendo con Google, i tuoi amici si sincronizzano tra i dispositivi. In modalità Ospite tutto resta isolato sul dispositivo in uso. La Modalità Fantasma nasconde la tua presenza online quando preferisci giocare senza farti vedere.",
        ],
      },
      {
        heading: "I risultati arrivano da soli",
        paragraphs: [
          "Quando un amico finisce più tardi, il risultato si sincronizza automaticamente e una notifica ti avvisa che la gara è terminata. Aprila per vedere la classifica con tempo ed errori di ogni partecipante.",
        ],
        bullets: [
          "Concordate i limiti della stanza prima di inviare il codice, così tutti gareggiano alle stesse condizioni.",
          "Gli Assistenti Intelligenti sono impostazioni personali: decidete insieme se volete una gara pura.",
        ],
      },
    ],
    proTipTitle: "Consiglio da esperti",
    proTipBody:
      "Imposta i limiti di errori, suggerimenti e timer nella configurazione della stanza prima di condividere il codice. Tutti gareggiano così in condizioni identiche e la classifica resta equa anche se i giocatori entrano in momenti diversi.",
    faqTitle: "FAQ multigiocatore",
    faqs: [
      {
        question: "I miei amici devono installare l'app?",
        answer:
          "No. Un link ?room= apre la stessa griglia in qualsiasi browser. Più avanti possono installare l'app Android e continuare a giocare.",
      },
      {
        question: "Mi serve un account per giocare con gli amici?",
        answer:
          "Puoi creare stanze e unirti come Ospite. Accedere con Google aggiunge una lista Amici persistente sincronizzata tra dispositivi, mentre i dati Ospite restano isolati sul tuo dispositivo.",
      },
      {
        question: "Cosa succede se un amico finisce dopo di me?",
        answer:
          "Il tuo risultato viene salvato e il suo si aggiunge alla classifica appena termina. Ricevi una notifica, quindi non devi aspettare online.",
      },
    ],
    crossLinkIntro:
      "Sei alle prime armi? Inizia con la Guida al Sudoku per principianti e la pagina Regole e strategie, oppure allena la velocità con la Sfida del Giorno prima della prossima gara.",
  },
  "beginner-sudoku": {
    slug: "beginner-sudoku",
    ...NAV_IT,
    badge: "Guida per principianti",
    title: "Sudoku per principianti: il tuo primo schema passo dopo passo",
    subtitle:
      "Impara l'unica regola che conta, scegli la difficoltà iniziale giusta e usa gli aiuti integrati per completare la tua prima griglia con sicurezza.",
    metaTitle: "Sudoku per principianti: regole, consigli e assistenti",
    metaDescription:
      "Una guida serena al Sudoku classico 9×9: la regola di base, le differenze tra Facile, Medio, Difficile ed Esperto, prime tecniche, note e Assistenti Intelligenti.",
    readTimeLabel: "6 min di lettura",
    sections: [
      {
        heading: "L'unica regola che ti serve",
        paragraphs: [
          "Il Sudoku si gioca su una griglia 9×9 composta da nove riquadri 3×3. Riempi ogni casella vuota con una cifra da 1 a 9 in modo che ogni riga, ogni colonna e ogni riquadro 3×3 contenga ogni cifra esattamente una volta.",
          "Non servono calcoli e non serve tirare a indovinare. Ogni schema di Sudoku Sync ha una sola soluzione, quindi la logica basta sempre.",
        ],
      },
      {
        heading: "Scegli la tua prima difficoltà",
        paragraphs: [
          "I quattro livelli differiscono per il numero di cifre date all'inizio. Più indizi significano meno caselle vuote e deduzioni più semplici.",
        ],
        bullets: [
          "Facile: 51 indizi (30 caselle vuote). Il miglior punto di partenza.",
          "Medio: 39 indizi (42 caselle vuote).",
          "Difficile: 30 indizi (51 caselle vuote).",
          "Esperto: 25 indizi (56 caselle vuote).",
        ],
      },
      {
        heading: "Le tue prime tre tecniche",
        paragraphs: [
          "Inizia con la scansione: scegli una cifra, guarda dove è già posizionata e controlla quali caselle di un riquadro sono bloccate dalla sua riga e colonna.",
          "Poi cerca i single. Un Naked Single è una casella che può contenere una sola cifra. Un Hidden Single è una cifra che entra in una sola casella di una riga, colonna o riquadro. Quando otto caselle di un'unità sono piene, l'ultima libera è un Full House.",
        ],
      },
      {
        heading: "Note e Assistenti Intelligenti",
        paragraphs: [
          "Le note ti permettono di scrivere piccole cifre candidate in una casella finché non sei sicuro. Questi aiuti nelle Impostazioni rendono l'apprendimento più fluido:",
        ],
        bullets: [
          "Evidenzia numeri identici segna tutte le cifre uguali quando selezioni una casella.",
          "Mostra numeri rimanenti indica quante cifre di ciascun tipo restano da inserire.",
          "Evidenzia area correlata ombreggia con delicatezza riga, colonna e riquadro della casella attiva.",
          "Rimuovi note automaticamente cancella le note corrispondenti nelle caselle collegate quando inserisci una cifra.",
          "Inserimento Rapido (Prima numero) blocca una cifra per toccare più caselle di seguito.",
          "Cambio automatico numeri completati passa alla cifra successiva quando tutte e nove sono inserite.",
        ],
      },
      {
        heading: "Limite di errori e abitudine quotidiana",
        paragraphs: [
          "Il Limite Errori Rigido (3/3) termina la partita dopo tre errori e promuove un gioco attento. Puoi disattivarlo nelle Impostazioni mentre impari.",
          "Una breve Sfida del Giorno ogni giorno crea l'abitudine, e il Risolutore Sudoku può verificare se uno schema in cui sei bloccato è valido.",
        ],
      },
    ],
    proTipTitle: "Consiglio da esperti",
    proTipBody:
      "Inizia ogni schema dalla cifra che compare già più spesso. Ha meno posizioni rimaste e quindi di solito offre i primi inserimenti sicuri.",
    faqTitle: "FAQ per principianti",
    faqs: [
      {
        question: "Quale difficoltà devo giocare per prima?",
        answer:
          "Facile. Con 51 indizi si risolve con scansione e deduzioni di single, la base di ogni livello più difficile.",
      },
      {
        question: "Devo mai tirare a indovinare?",
        answer:
          "No. Ogni schema ha esattamente una soluzione e si risolve con la logica. Se senti di dover indovinare, ricontrolla le note o cerca una tecnica che non hai ancora usato.",
      },
      {
        question: "Cos'è il limite di errori?",
        answer:
          "È l'impostazione intelligente Limite Errori Rigido (3/3). Una cifra sbagliata conta come errore e la partita termina al terzo. Puoi disattivarlo nelle Impostazioni.",
      },
    ],
    crossLinkIntro:
      "Quando i single ti sembrano facili, leggi la Guida agli schemi avanzati. Per giocare con un amico sulla stessa griglia consulta la Guida al Sudoku multigiocatore e tieni a portata di mano la pagina Regole e strategie.",
  },
  "advanced-patterns": {
    slug: "advanced-patterns",
    ...NAV_IT,
    badge: "Guida avanzata",
    title: "Schemi avanzati di Sudoku per livelli Difficile ed Esperto",
    subtitle:
      "Vai oltre i single con coppie, intersezioni, X-Wing, Skyscraper, 2-String Kite e Y-Wing, e usa le note come i risolutori più forti.",
    metaTitle: "Schemi avanzati di Sudoku: X-Wing, Y-Wing, coppie e altro",
    metaDescription:
      "Sali di livello con coppie nude e nascoste, coppie puntanti, riduzione riquadro-linea, X-Wing, Skyscraper, 2-String Kite e Y-Wing nel Sudoku Difficile ed Esperto.",
    readTimeLabel: "8 min di lettura",
    sections: [
      {
        heading: "Costruisci un flusso di note affidabile",
        paragraphs: [
          "Gli schemi avanzati dipendono da note di candidati accurate. Note automatiche inserisce i candidati nelle caselle vuote ed è disponibile solo in Difficile ed Esperto, mentre Rimuovi note automaticamente le mantiene pulite man mano che inserisci cifre.",
          "Compila le note una volta e aggiornale dopo ogni inserimento. Una sola nota obsoleta può far sembrare valido uno schema che non lo è.",
        ],
      },
      {
        heading: "Coppie e terne nude e nascoste",
        paragraphs: [
          "Una Naked Pair è formata da due caselle di un'unità con gli stessi due candidati. Quelle cifre devono andare in quelle caselle, quindi le elimini dalle altre caselle dell'unità.",
          "Una Hidden Pair è il contrario: due cifre che compaiono solo in due caselle di un'unità. Quelle caselle non possono contenere altro, quindi cancelli gli altri loro candidati. Le terne estendono la stessa logica a tre caselle e tre cifre.",
        ],
      },
      {
        heading: "Coppie puntanti e riduzione riquadro-linea",
        paragraphs: [
          "Quando tutti i candidati di una cifra in un riquadro si trovano su una sola riga o colonna, quella cifra non può comparire nel resto della linea. È una Pointing Pair.",
          "La riduzione riquadro-linea funziona al contrario: se tutti i candidati di una cifra in una riga o colonna sono dentro un solo riquadro, eliminala dal resto di quel riquadro.",
        ],
      },
      {
        heading: "Ali e pesci: X-Wing, Skyscraper, 2-String Kite, Y-Wing",
        paragraphs: [
          "Questi schemi collegano alcune caselle in modo che uno di due esiti debba essere vero, permettendo di eliminare i candidati visti da entrambe.",
        ],
        bullets: [
          "X-Wing: una cifra compare in esattamente due caselle in ciascuna di due righe, allineate sulle stesse due colonne. Eliminala dal resto di quelle colonne.",
          "Skyscraper: due linee hanno la cifra in due caselle ciascuna e condividono un'estremità di colonna. Le caselle che vedono entrambe le estremità libere perdono quella cifra.",
          "2-String Kite: una riga e una colonna contengono la cifra due volte ciascuna e si collegano tramite un riquadro.",
          "Y-Wing: un perno con candidati AB collega due caselle con AC e BC. Ogni casella che vede entrambe le ali perde C.",
        ],
      },
      {
        heading: "Un ordine di risoluzione per le griglie Esperto",
        paragraphs: [
          "Gli schemi Esperto partono con soli 25 indizi. Lavora con un ordine fisso: prima i single, poi le intersezioni, poi coppie e terne e solo alla fine ali e pesci.",
          "Dopo ogni eliminazione cerca di nuovo nuovi single. Se uno schema personalizzato si blocca, il Risolutore Sudoku ti dice se ha una soluzione, più soluzioni o nessuna.",
        ],
      },
    ],
    proTipTitle: "Consiglio da esperti",
    proTipBody:
      "Cerca gli schemi una cifra alla volta. Osserva una sola cifra in tutte le note e procedi da 1 a 9. La maggior parte degli X-Wing e degli Skyscraper salta fuori così.",
    faqTitle: "FAQ avanzate",
    faqs: [
      {
        question: "Quale tecnica avanzata devo imparare per prima?",
        answer:
          "Le coppie puntanti e la riduzione riquadro-linea. Compaiono spesso, richiedono una sola cifra e un riquadro e sbloccano molte griglie Difficili.",
      },
      {
        question: "Le note automatiche funzionano a ogni difficoltà?",
        answer:
          "No. Note automatiche è disponibile solo nelle modalità Difficile ed Esperto. In Facile e Medio scrivi tu le note, ed è un ottimo allenamento.",
      },
      {
        question: "Posso verificare uno schema di un'altra fonte?",
        answer:
          "Sì. Inserisci gli indizi nel Risolutore Sudoku. Indica se la griglia ha una soluzione unica, più soluzioni o nessuna, e può risolverla per te.",
      },
    ],
    crossLinkIntro:
      "Ripassa l'elenco completo delle tecniche in Regole e strategie, rinforza le basi con la Guida al Sudoku per principianti o metti alla prova i tuoi schemi contro un amico con la Guida al Sudoku multigiocatore.",
  },
};

// ---------------------------------------------------------------------------
// PT-BR
// ---------------------------------------------------------------------------

const NAV_PT_BR: GuideNavCopy = {
  relatedLinksTitle: "Continue aprendendo",
  practiceTitle: "Pratique o que você leu",
  linkLabels: {
    rules: "Regras e estratégias do Sudoku",
    solver: "Solucionador de Sudoku",
    daily: "Desafio Diário",
    about: "Sobre o Sudoku Sync",
    multiplayerGuide: "Guia de Sudoku multijogador",
    beginnerGuide: "Guia de Sudoku para iniciantes",
    advancedGuide: "Guia de padrões avançados",
  },
  practiceLabels: {
    easy: "Jogar Fácil",
    medium: "Jogar Médio",
    hard: "Jogar Difícil",
    expert: "Jogar Especialista",
    daily: "Jogar o Desafio Diário de hoje",
    multiplayer: "Criar uma sala multijogador",
  },
};

const GUIDES_PT_BR: Record<GuideSlug, GuideArticleContent> = {
  "multiplayer-sudoku": {
    slug: "multiplayer-sudoku",
    ...NAV_PT_BR,
    badge: "Guia multijogador",
    title: "Como jogar Sudoku multijogador com amigos",
    subtitle:
      "Dispute no mesmo tabuleiro exato, compartilhe um link em segundos e compare os resultados quando todos terminarem. Sem lobby, sem espera.",
    metaTitle: "Sudoku multijogador: código da sala, link e amigos",
    metaDescription:
      "Veja como funciona o multijogador no mesmo tabuleiro, ao vivo e assíncrono, no Sudoku Sync: código de sala de 6 dígitos, PIN opcional, link direto, amigos e Modo Fantasma.",
    readTimeLabel: "5 min de leitura",
    sections: [
      {
        heading: "Um tabuleiro, zero espera",
        paragraphs: [
          "No multijogador do Sudoku Sync, todos recebem exatamente o mesmo quebra-cabeça 9×9. Ninguém resolve uma grade mais fácil ou mais difícil, então o resultado depende só de lógica e velocidade.",
          "Não há lobby para esperar. O cronômetro, o progresso e o envio de cada jogador são independentes, então você pode jogar ao vivo lado a lado ou terminar horas depois e ainda aparecer na mesma classificação.",
        ],
      },
      {
        heading: "Crie uma sala em quatro passos",
        paragraphs: [
          "Abra Multijogador e escolha Criar. A configuração da sala permite definir as regras antes de qualquer pessoa entrar.",
        ],
        bullets: [
          "Escolha a dificuldade: Fácil (51 dicas), Médio (39), Difícil (30) ou Especialista (25).",
          "Defina o limite de erros, o limite de dicas e se o cronômetro fica visível.",
          "Se quiser, bloqueie a sala com um PIN.",
          "Compartilhe o código de sala numérico de 6 dígitos ou envie um link direto.",
        ],
      },
      {
        heading: "Entre com um código ou um link direto",
        paragraphs: [
          "Para entrar, abra Multijogador, escolha Entrar e digite o código de sala de 6 dígitos. Se o anfitrião definiu um PIN, você também o digita.",
          "Os links de compartilhamento usam o formato ?room=. Abertos em qualquer navegador, carregam o tabuleiro na hora, e seus amigos jogam pela web sem instalar nada. Jogadores de Android e da web competem no mesmo tabuleiro.",
        ],
      },
      {
        heading: "Jogadores recentes, amigos e Modo Fantasma",
        paragraphs: [
          "A lista de convites tem duas abas. Jogadores recentes mostra quem já jogou com você, pronto para a revanche. Amigos é a sua lista persistente.",
          "Ao entrar com o Google, seus amigos são sincronizados entre dispositivos. No modo Convidado, tudo fica isolado no dispositivo que você está usando. O Modo Fantasma oculta sua presença online quando você prefere jogar sem ser visto.",
        ],
      },
      {
        heading: "Os resultados chegam sozinhos",
        paragraphs: [
          "Quando um amigo termina depois, o resultado é sincronizado automaticamente e uma notificação avisa que a corrida acabou. Abra para ver a classificação com o tempo e os erros de cada participante.",
        ],
        bullets: [
          "Combinem os limites da sala antes de enviar o código para que todos disputem nas mesmas condições.",
          "Os Assistentes Inteligentes são configurações pessoais, então decidam juntos se querem uma corrida pura.",
        ],
      },
    ],
    proTipTitle: "Dica de especialista",
    proTipBody:
      "Defina os limites de erros, dicas e cronômetro na configuração da sala antes de compartilhar o código. Assim todos competem em condições idênticas e a classificação continua justa, mesmo que os jogadores entrem em horários diferentes.",
    faqTitle: "Perguntas frequentes sobre multijogador",
    faqs: [
      {
        question: "Meus amigos precisam instalar o aplicativo?",
        answer:
          "Não. Um link ?room= abre o mesmo tabuleiro em qualquer navegador. Depois, eles podem instalar o app Android e continuar jogando.",
      },
      {
        question: "Preciso de uma conta para jogar com amigos?",
        answer:
          "Você pode criar e entrar em salas como Convidado. Entrar com o Google adiciona uma lista de Amigos persistente sincronizada entre dispositivos, enquanto os dados de Convidado ficam isolados no seu dispositivo.",
      },
      {
        question: "O que acontece se um amigo terminar depois de mim?",
        answer:
          "Seu resultado fica salvo e o dele entra na classificação assim que terminar. Você recebe uma notificação, então não precisa esperar online.",
      },
    ],
    crossLinkIntro:
      "Está começando? Comece pelo Guia de Sudoku para iniciantes e pela página de Regras e estratégias, ou afie sua velocidade com o Desafio Diário antes da próxima corrida.",
  },
  "beginner-sudoku": {
    slug: "beginner-sudoku",
    ...NAV_PT_BR,
    badge: "Guia para iniciantes",
    title: "Sudoku para iniciantes: seu primeiro quebra-cabeça passo a passo",
    subtitle:
      "Aprenda a única regra que importa, escolha a dificuldade inicial certa e use os auxílios integrados para terminar sua primeira grade com confiança.",
    metaTitle: "Sudoku para iniciantes: regras, dicas e assistentes",
    metaDescription:
      "Um guia tranquilo do Sudoku clássico 9×9: a regra básica, diferenças entre Fácil, Médio, Difícil e Especialista, primeiras técnicas, anotações e Assistentes Inteligentes.",
    readTimeLabel: "6 min de leitura",
    sections: [
      {
        heading: "A única regra de que você precisa",
        paragraphs: [
          "O Sudoku é jogado em uma grade 9×9 formada por nove blocos 3×3. Preencha cada célula vazia com um dígito de 1 a 9 de modo que cada linha, cada coluna e cada bloco 3×3 contenha todos os dígitos exatamente uma vez.",
          "Você não precisa fazer contas nem chutar. Todo quebra-cabeça do Sudoku Sync tem uma única solução, então a lógica sempre basta.",
        ],
      },
      {
        heading: "Escolha sua primeira dificuldade",
        paragraphs: [
          "Os quatro níveis diferem pela quantidade de dígitos dados no início. Mais dicas significam menos células vazias e deduções mais simples.",
        ],
        bullets: [
          "Fácil: 51 dicas (30 células vazias). O melhor ponto de partida.",
          "Médio: 39 dicas (42 células vazias).",
          "Difícil: 30 dicas (51 células vazias).",
          "Especialista: 25 dicas (56 células vazias).",
        ],
      },
      {
        heading: "Suas três primeiras técnicas",
        paragraphs: [
          "Comece pela varredura: escolha um dígito, veja onde ele já está e confira quais células de um bloco ficam bloqueadas pela linha e pela coluna dele.",
          "Depois procure singles. Um Naked Single é uma célula que só aceita um dígito. Um Hidden Single é um dígito que só cabe em uma célula de uma linha, coluna ou bloco. Quando oito células de uma unidade estão preenchidas, a última livre é um Full House.",
        ],
      },
      {
        heading: "Anotações e Assistentes Inteligentes",
        paragraphs: [
          "As anotações permitem escrever pequenos dígitos candidatos em uma célula até ter certeza. Estes auxílios nas Configurações deixam o aprendizado mais suave:",
        ],
        bullets: [
          "Destacar números idênticos marca todos os dígitos iguais ao selecionar uma célula.",
          "Mostrar números restantes exibe quantos de cada dígito ainda faltam colocar.",
          "Destacar área relacionada sombreia suavemente a linha, a coluna e o bloco da célula ativa.",
          "Remover notas automaticamente apaga as anotações correspondentes nas células conectadas ao colocar um dígito.",
          "Preenchimento Rápido (Número primeiro) trava um dígito para você tocar várias células em sequência.",
          "Alternar automaticamente números concluídos avança quando os nove de um dígito foram colocados.",
        ],
      },
      {
        heading: "Limite de erros e hábito diário",
        paragraphs: [
          "O Limite Estrito de Erros (3/3) encerra a partida após três erros e incentiva o jogo cuidadoso. Você pode desativá-lo nas Configurações enquanto aprende.",
          "Um Desafio Diário curto todos os dias cria o hábito, e o Solucionador de Sudoku pode verificar se um quebra-cabeça em que você travou é válido.",
        ],
      },
    ],
    proTipTitle: "Dica de especialista",
    proTipBody:
      "Comece cada quebra-cabeça pelo dígito que já aparece mais vezes. Ele tem menos lugares restantes e, por isso, costuma render as primeiras colocações seguras.",
    faqTitle: "Perguntas frequentes para iniciantes",
    faqs: [
      {
        question: "Qual dificuldade devo jogar primeiro?",
        answer:
          "Fácil. Com 51 dicas, ela é resolvida com varredura e deduções de singles, a base de todos os níveis mais difíceis.",
      },
      {
        question: "Preciso chutar alguma vez?",
        answer:
          "Não. Todo quebra-cabeça tem exatamente uma solução e pode ser resolvido por lógica. Se sentir que precisa chutar, revise suas anotações ou procure uma técnica que ainda não usou.",
      },
      {
        question: "O que é o limite de erros?",
        answer:
          "É a configuração inteligente Limite Estrito de Erros (3/3). Um dígito errado conta como erro e a partida termina no terceiro. Você pode desativá-lo nas Configurações.",
      },
    ],
    crossLinkIntro:
      "Quando os singles parecerem fáceis, leia o Guia de padrões avançados. Para jogar com um amigo no mesmo tabuleiro, veja o Guia de Sudoku multijogador e mantenha a página de Regras e estratégias à mão.",
  },
  "advanced-patterns": {
    slug: "advanced-patterns",
    ...NAV_PT_BR,
    badge: "Guia avançado",
    title: "Padrões avançados de Sudoku para quebra-cabeças Difíceis e de Especialista",
    subtitle:
      "Vá além dos singles com pares, interseções, X-Wing, Skyscraper, 2-String Kite e Y-Wing, e use as anotações como os melhores solucionadores.",
    metaTitle: "Padrões avançados de Sudoku: X-Wing, Y-Wing, pares e mais",
    metaDescription:
      "Suba de nível com pares nus e ocultos, pares apontadores, redução bloco-linha, X-Wing, Skyscraper, 2-String Kite e Y-Wing em Sudoku Difícil e Especialista.",
    readTimeLabel: "8 min de leitura",
    sections: [
      {
        heading: "Monte um fluxo de anotações confiável",
        paragraphs: [
          "Os padrões avançados dependem de anotações de candidatos precisas. Notas automáticas preenche candidatos nas células vazias e está disponível apenas em Difícil e Especialista, enquanto Remover notas automaticamente as mantém limpas conforme você coloca dígitos.",
          "Preencha as anotações uma vez e atualize-as após cada colocação. Uma única nota desatualizada pode fazer um padrão parecer válido quando não é.",
        ],
      },
      {
        heading: "Pares e trios nus e ocultos",
        paragraphs: [
          "Um Naked Pair são duas células de uma unidade com os mesmos dois candidatos. Esses dígitos precisam ficar nessas células, então você os remove das outras células da unidade.",
          "Um Hidden Pair é o inverso: dois dígitos que aparecem em apenas duas células de uma unidade. Essas células não podem conter mais nada, então você apaga os outros candidatos delas. Os trios estendem a mesma lógica a três células e três dígitos.",
        ],
      },
      {
        heading: "Pares apontadores e redução bloco-linha",
        paragraphs: [
          "Quando todos os candidatos de um dígito dentro de um bloco estão em uma única linha ou coluna, esse dígito não pode aparecer no restante dessa linha. Isso é um Pointing Pair.",
          "A redução bloco-linha funciona ao contrário: se todos os candidatos de um dígito em uma linha ou coluna estão dentro de um bloco, remova-o do restante desse bloco.",
        ],
      },
      {
        heading: "Asas e peixes: X-Wing, Skyscraper, 2-String Kite, Y-Wing",
        paragraphs: [
          "Esses padrões ligam algumas células de modo que um entre dois resultados precisa ser verdadeiro, permitindo eliminar candidatos vistos por ambas.",
        ],
        bullets: [
          "X-Wing: um dígito aparece em exatamente duas células em cada uma de duas linhas, alinhadas nas mesmas duas colunas. Remova-o do restante dessas colunas.",
          "Skyscraper: duas linhas têm o dígito em duas células cada e compartilham a ponta de uma coluna. As células que veem as duas pontas livres perdem esse dígito.",
          "2-String Kite: uma linha e uma coluna contêm o dígito duas vezes cada e se conectam por um bloco.",
          "Y-Wing: um pivô com candidatos AB liga duas células com AC e BC. Qualquer célula que veja as duas asas perde C.",
        ],
      },
      {
        heading: "Uma ordem de resolução para tabuleiros de Especialista",
        paragraphs: [
          "Os quebra-cabeças de Especialista começam com apenas 25 dicas. Trabalhe em ordem fixa: primeiro singles, depois interseções, depois pares e trios e só então asas e peixes.",
          "Após cada eliminação, procure novamente novos singles. Se um quebra-cabeça personalizado travar, o Solucionador de Sudoku informa se ele tem uma solução, várias ou nenhuma.",
        ],
      },
    ],
    proTipTitle: "Dica de especialista",
    proTipBody:
      "Procure padrões um dígito de cada vez. Observe um único dígito em todas as anotações e percorra de 1 a 9. A maioria dos X-Wings e Skyscrapers aparece assim.",
    faqTitle: "Perguntas frequentes avançadas",
    faqs: [
      {
        question: "Qual técnica avançada devo aprender primeiro?",
        answer:
          "Pares apontadores e redução bloco-linha. Aparecem com frequência, exigem apenas um dígito e um bloco e destravam muitos tabuleiros Difíceis.",
      },
      {
        question: "As notas automáticas funcionam em todas as dificuldades?",
        answer:
          "Não. Notas automáticas está disponível apenas nos modos Difícil e Especialista. Em Fácil e Médio você escreve as anotações, o que é um ótimo treino.",
      },
      {
        question: "Posso verificar um quebra-cabeça de outra fonte?",
        answer:
          "Sim. Digite as dicas no Solucionador de Sudoku. Ele informa se a grade tem solução única, várias soluções ou nenhuma, e pode resolvê-la para você.",
      },
    ],
    crossLinkIntro:
      "Revise a lista completa de técnicas em Regras e estratégias, reforce a base com o Guia de Sudoku para iniciantes ou teste seus padrões contra um amigo com o Guia de Sudoku multijogador.",
  },
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const GUIDES_TRANSLATIONS: Record<Language, Record<GuideSlug, GuideArticleContent>> = {
  en: GUIDES_EN,
  hi: GUIDES_HI,
  de: GUIDES_DE,
  ja: GUIDES_JA,
  ko: GUIDES_KO,
  es: GUIDES_ES,
  fr: GUIDES_FR,
  it: GUIDES_IT,
  "pt-BR": GUIDES_PT_BR,
};

export const ACADEMY_STRIP_TITLES: Record<Language, string> = {
  en: "Sudoku Academy & Tools",
  hi: "सुडोकू अकादमी और टूल्स",
  de: "Sudoku-Akademie & Werkzeuge",
  ja: "数独アカデミー＆ツール",
  ko: "스도쿠 아카데미 & 도구",
  es: "Academia de Sudoku y Herramientas",
  fr: "Académie Sudoku & Outils",
  it: "Accademia Sudoku e Strumenti",
  "pt-BR": "Academia Sudoku e Ferramentas",
};

/** Resolves a guide's localized copy, falling back to English. */
export function getGuideCopy(lang: Language, slug: GuideSlug): GuideArticleContent {
  const locale = GUIDES_TRANSLATIONS[lang] || GUIDES_TRANSLATIONS.en;
  return locale[slug] || GUIDES_TRANSLATIONS.en[slug];
}

/** Parses `/guides/<slug>` (with optional trailing slash / .html) into a GuideSlug. */
export function parseGuideSlugFromPath(pathname?: string | null): GuideSlug | null {
  if (!pathname) return null;
  const normalized = pathname.trim().replace(/\/+$/, "").replace(/\.html$/, "").toLowerCase();
  const match = normalized.match(/^\/guides\/([a-z-]+)$/);
  if (!match) return null;
  return (GUIDE_SLUGS as readonly string[]).includes(match[1]) ? (match[1] as GuideSlug) : null;
}
