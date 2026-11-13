export type SeoLanguage = "en" | "hi" | "de" | "ja" | "ko" | "es" | "fr" | "it" | "pt-BR";
export type SeoDifficulty = "EASY" | "MEDIUM" | "HARD" | "EXPERT";

export interface SeoLanguageMeta {
  code: SeoLanguage;
  urlSlug: string;
  htmlLang: string;
  nativeName: string;
  englishName: string;
}

export const SEO_LANGUAGES: readonly SeoLanguageMeta[] = [
  { code: "en", urlSlug: "en", htmlLang: "en", nativeName: "English", englishName: "English" },
  { code: "hi", urlSlug: "hi", htmlLang: "hi", nativeName: "हिन्दी", englishName: "Hindi" },
  { code: "de", urlSlug: "de", htmlLang: "de", nativeName: "Deutsch", englishName: "German" },
  { code: "ja", urlSlug: "ja", htmlLang: "ja", nativeName: "日本語", englishName: "Japanese" },
  { code: "ko", urlSlug: "ko", htmlLang: "ko", nativeName: "한국어", englishName: "Korean" },
  { code: "es", urlSlug: "es", htmlLang: "es", nativeName: "Español", englishName: "Spanish" },
  { code: "fr", urlSlug: "fr", htmlLang: "fr", nativeName: "Français", englishName: "French" },
  { code: "it", urlSlug: "it", htmlLang: "it", nativeName: "Italiano", englishName: "Italian" },
  { code: "pt-BR", urlSlug: "pt-br", htmlLang: "pt-BR", nativeName: "Português (Brasil)", englishName: "Portuguese (Brazil)" },
] as const;

export interface SeoUiStrings {
  rootTitle: string;
  rootDescription: string;
  quickAnswersSuffix: string;
  returnToBoardTemplate: string;
  playDiffCluesTemplate: string;
  canonicalUrlLabel: string;
  fundamentalRulesSub: string;
  masterDeductionSub: string;
  languageEditionsLabel: string;
  gridSpecLabel: string;
  startingCluesWord: string;
  emptyCellsWord: string;
  coreTechniquesTitle: string;
  quickChecklistTitle: string;
  browseAllDifficultiesLabel: string;
  faqSectionSuffix: string;
  homeLinkLabel: string;
  aboutLinkLabel: string;
  contactLinkLabel: string;
  privacyLinkLabel: string;
  termsLinkLabel: string;
  allRightsReserved: string;
}

export const SEO_UI_STRINGS: Record<SeoLanguage, SeoUiStrings> = {
  en: {
    rootTitle: "SudokuSync - Real-Time Multiplayer Sudoku",
    rootDescription:
      "Play classic Sudoku with friends in real-time multiplayer mode on SudokuSync. Challenge friends on identical boards, track stats, and improve logical reasoning.",
    quickAnswersSuffix: "Quick Answers",
    returnToBoardTemplate: "Return to {label} Board",
    playDiffCluesTemplate: "Play {label} ({clues} Clues)",
    canonicalUrlLabel: "Canonical Silo",
    fundamentalRulesSub: "Fundamental rules & logic guidelines",
    masterDeductionSub: "Master advanced deduction and pattern recognition",
    languageEditionsLabel: "Languages",
    gridSpecLabel: "Grid Specification",
    startingCluesWord: "starting clues",
    emptyCellsWord: "empty cells",
    coreTechniquesTitle: "Core Techniques Used",
    quickChecklistTitle: "Quick Solving Checklist",
    browseAllDifficultiesLabel: "Browse All Difficulties",
    faqSectionSuffix: "Questions & Answers",
    homeLinkLabel: "Home",
    aboutLinkLabel: "About Us",
    contactLinkLabel: "Contact Us",
    privacyLinkLabel: "Privacy Policy",
    termsLinkLabel: "Terms of Service",
    allRightsReserved: "© 2026 SudokuSync. All rights reserved.",
  },
  hi: {
    rootTitle: "SudokuSync - रीयल-टाइम मल्टीप्लेयर सुडोकू",
    rootDescription:
      "SudokuSync पर दोस्तों के साथ मुफ्त क्लासिक सुडोकू और रीयल-टाइम मल्टीप्लेयर मुकाबले खेलें। एक समान बोर्ड पर रेस करें, आंकड़े ट्रैक करें और तार्किक क्षमता बढ़ाएं।",
    quickAnswersSuffix: "त्वरित उत्तर",
    returnToBoardTemplate: "{label} बोर्ड पर लौटें",
    playDiffCluesTemplate: "{label} खेलें ({clues} संकेत)",
    canonicalUrlLabel: "कैनोनिकल पेज",
    fundamentalRulesSub: "बुनियादी नियम और तार्किक दिशानिर्देश",
    masterDeductionSub: "उन्नत पैटर्न और कटौती तकनीकों में महारत हासिल करें",
    languageEditionsLabel: "भाषाएँ",
    gridSpecLabel: "ग्रिड विवरण",
    startingCluesWord: "शुरुआती संकेत",
    emptyCellsWord: "खाली खाने",
    coreTechniquesTitle: "मुख्य रणनीति तकनीकें",
    quickChecklistTitle: "त्वरित समाधान चेकलिस्ट",
    browseAllDifficultiesLabel: "सभी कठिनाई स्तर देखें",
    faqSectionSuffix: "प्रश्न और उत्तर",
    homeLinkLabel: "होम",
    aboutLinkLabel: "हमारे बारे में",
    contactLinkLabel: "संपर्क करें",
    privacyLinkLabel: "गोपनीयता नीति",
    termsLinkLabel: "सेवा की शर्तें",
    allRightsReserved: "© 2026 SudokuSync. सर्वाधिकार सुरक्षित।",
  },
  de: {
    rootTitle: "SudokuSync - Kostenloses Echtzeit-Multiplayer-Sudoku",
    rootDescription:
      "Spiele klassisches Sudoku kostenlos online mit Freunden im Echtzeit-Multiplayer auf SudokuSync. Löse identische Bretter, verfolge Bestzeiten und trainiere Logik.",
    quickAnswersSuffix: "Kurze Antworten",
    returnToBoardTemplate: "Zurück zum {label}-Brett",
    playDiffCluesTemplate: "{label} spielen ({clues} Vorgaben)",
    canonicalUrlLabel: "Kanonische URL",
    fundamentalRulesSub: "Grundregeln & logische Richtlinien",
    masterDeductionSub: "Fortgeschrittene Deduktion und Mustererkennung meistern",
    languageEditionsLabel: "Sprachen",
    gridSpecLabel: "Gitter-Spezifikation",
    startingCluesWord: "Startvorgaben",
    emptyCellsWord: "leere Felder",
    coreTechniquesTitle: "Kern-Techniken",
    quickChecklistTitle: "Schnelle Lösungs-Checkliste",
    browseAllDifficultiesLabel: "Alle Schwierigkeitsgrade",
    faqSectionSuffix: "Fragen & Antworten",
    homeLinkLabel: "Startseite",
    aboutLinkLabel: "Über uns",
    contactLinkLabel: "Kontakt",
    privacyLinkLabel: "Datenschutz",
    termsLinkLabel: "Nutzungsbedingungen",
    allRightsReserved: "© 2026 SudokuSync. Alle Rechte vorbehalten.",
  },
  ja: {
    rootTitle: "SudokuSync - 無料リアルタイム対戦ナンプレ・数独",
    rootDescription:
      "SudokuSyncでクラシック数独（ナンプレ）をオンラインで無料プレイ。リアルタイム対戦ルームで友達と同じ盤面に挑み、最速記録や論理力を磨きましょう。",
    quickAnswersSuffix: "よくある質問",
    returnToBoardTemplate: "{label}の盤面に戻る",
    playDiffCluesTemplate: "{label}をプレイ（ヒント{clues}個）",
    canonicalUrlLabel: "正規URL",
    fundamentalRulesSub: "基本ルールと論理ガイドライン",
    masterDeductionSub: "高度な推論とパターン認識をマスターする",
    languageEditionsLabel: "言語",
    gridSpecLabel: "盤面仕様",
    startingCluesWord: "初期配置",
    emptyCellsWord: "空きマス",
    coreTechniquesTitle: "主な解法テクニック",
    quickChecklistTitle: "攻略チェックリスト",
    browseAllDifficultiesLabel: "すべての難易度",
    faqSectionSuffix: "Q&A",
    homeLinkLabel: "ホーム",
    aboutLinkLabel: "運営情報",
    contactLinkLabel: "お問い合わせ",
    privacyLinkLabel: "プライバシーポリシー",
    termsLinkLabel: "利用規約",
    allRightsReserved: "© 2026 SudokuSync. All rights reserved.",
  },
  ko: {
    rootTitle: "SudokuSync - 무료 실시간 멀티플레이어 스도쿠",
    rootDescription:
      "SudokuSync에서 클래식 스도쿠를 무료로 즐기고 친구와 실시간 멀티플레이어 대결을 펼쳐보세요. 동일한 시드 보드에서 실력과 기록을 겨뤄보세요.",
    quickAnswersSuffix: "빠른 답변",
    returnToBoardTemplate: "{label} 보드로 돌아가기",
    playDiffCluesTemplate: "{label} 플레이 (힌트 {clues}개)",
    canonicalUrlLabel: "표준 경로",
    fundamentalRulesSub: "기본 규칙 및 논리 가이드",
    masterDeductionSub: "고급 추론과 패턴 인식을 마스터하세요",
    languageEditionsLabel: "언어",
    gridSpecLabel: "그리드 사양",
    startingCluesWord: "초기 숫자",
    emptyCellsWord: "빈 칸",
    coreTechniquesTitle: "핵심 풀이 기법",
    quickChecklistTitle: "빠른 풀이 체크리스트",
    browseAllDifficultiesLabel: "모든 난이도 보기",
    faqSectionSuffix: "자주 묻는 질문",
    homeLinkLabel: "홈",
    aboutLinkLabel: "소개",
    contactLinkLabel: "문의하기",
    privacyLinkLabel: "개인정보 처리방침",
    termsLinkLabel: "이용약관",
    allRightsReserved: "© 2026 SudokuSync. All rights reserved.",
  },
  es: {
    rootTitle: "SudokuSync - Sudoku Multijugador Gratis en Tiempo Real",
    rootDescription:
      "Juega Sudoku clásico gratis online con amigos en tiempo real en SudokuSync. Compite en tableros idénticos, registra tus récords y entrena tu lógica.",
    quickAnswersSuffix: "Respuestas rápidas",
    returnToBoardTemplate: "Volver al tablero {label}",
    playDiffCluesTemplate: "Jugar {label} ({clues} pistas)",
    canonicalUrlLabel: "Ruta canónica",
    fundamentalRulesSub: "Reglas fundamentales y guía lógica",
    masterDeductionSub: "Domina la deducción avanzada y el reconocimiento de patrones",
    languageEditionsLabel: "Idiomas",
    gridSpecLabel: "Especificación del tablero",
    startingCluesWord: "pistas iniciales",
    emptyCellsWord: "casillas vacías",
    coreTechniquesTitle: "Técnicas principales",
    quickChecklistTitle: "Lista táctica rápida",
    browseAllDifficultiesLabel: "Explorar dificultades",
    faqSectionSuffix: "Preguntas frecuentes",
    homeLinkLabel: "Inicio",
    aboutLinkLabel: "Sobre nosotros",
    contactLinkLabel: "Contacto",
    privacyLinkLabel: "Política de privacidad",
    termsLinkLabel: "Términos de servicio",
    allRightsReserved: "© 2026 SudokuSync. Todos los derechos reservados.",
  },
  fr: {
    rootTitle: "SudokuSync - Sudoku Multijoueur Gratuit en Temps Réel",
    rootDescription:
      "Jouez au Sudoku classique gratuitement en ligne et défiez vos amis en temps réel sur SudokuSync. Affrontez-vous sur des grilles identiques et suivez vos records.",
    quickAnswersSuffix: "Réponses rapides",
    returnToBoardTemplate: "Revenir à la grille {label}",
    playDiffCluesTemplate: "Jouer {label} ({clues} indices)",
    canonicalUrlLabel: "URL canonique",
    fundamentalRulesSub: "Règles fondamentales et logique de base",
    masterDeductionSub: "Maîtrisez la déduction avancée et la reconnaissance de motifs",
    languageEditionsLabel: "Langues",
    gridSpecLabel: "Spécification de la grille",
    startingCluesWord: "indices de départ",
    emptyCellsWord: "cases vides",
    coreTechniquesTitle: "Techniques clés",
    quickChecklistTitle: "Checklist tactique",
    browseAllDifficultiesLabel: "Toutes les difficultés",
    faqSectionSuffix: "Questions fréquentes",
    homeLinkLabel: "Accueil",
    aboutLinkLabel: "À propos",
    contactLinkLabel: "Contact",
    privacyLinkLabel: "Confidentialité",
    termsLinkLabel: "Conditions d'utilisation",
    allRightsReserved: "© 2026 SudokuSync. Tous droits réservés.",
  },
  it: {
    rootTitle: "SudokuSync - Sudoku Multiplayer Gratuito in Tempo Reale",
    rootDescription:
      "Gioca a Sudoku classico gratis online e sfida i tuoi amici in tempo reale su SudokuSync. Competi su schemi identici, migliora i record personali e allena la mente.",
    quickAnswersSuffix: "Risposte rapide",
    returnToBoardTemplate: "Torna allo schema {label}",
    playDiffCluesTemplate: "Gioca {label} ({clues} indizi)",
    canonicalUrlLabel: "Percorso canonico",
    fundamentalRulesSub: "Regole fondamentali e logica di gioco",
    masterDeductionSub: "Padroneggia la deduzione avanzata e il riconoscimento dei pattern",
    languageEditionsLabel: "Lingue",
    gridSpecLabel: "Specifiche griglia",
    startingCluesWord: "indizi iniziali",
    emptyCellsWord: "celle vuote",
    coreTechniquesTitle: "Tecniche principali",
    quickChecklistTitle: "Checklist tattica veloce",
    browseAllDifficultiesLabel: "Tutte le difficoltà",
    faqSectionSuffix: "Domande frequenti",
    homeLinkLabel: "Home",
    aboutLinkLabel: "Chi siamo",
    contactLinkLabel: "Contatti",
    privacyLinkLabel: "Privacy",
    termsLinkLabel: "Termini di servizio",
    allRightsReserved: "© 2026 SudokuSync. Tutti i diritti riservati.",
  },
  "pt-BR": {
    rootTitle: "SudokuSync - Sudoku Multijogador Grátis em Tempo Real",
    rootDescription:
      "Jogue Sudoku clássico grátis online com amigos em tempo real no SudokuSync. Dispute tabuleiros idênticos, acompanhe estatísticas e treine sua lógica.",
    quickAnswersSuffix: "Respostas rápidas",
    returnToBoardTemplate: "Voltar ao tabuleiro {label}",
    playDiffCluesTemplate: "Jogar {label} ({clues} pistas)",
    canonicalUrlLabel: "URL canônica",
    fundamentalRulesSub: "Regras fundamentais e diretrizes de lógica",
    masterDeductionSub: "Domine deduções avançadas e reconhecimento de padrões",
    languageEditionsLabel: "Idiomas",
    gridSpecLabel: "Especificação da grade",
    startingCluesWord: "pistas iniciais",
    emptyCellsWord: "células vazias",
    coreTechniquesTitle: "Técnicas principais",
    quickChecklistTitle: "Checklist tático rápido",
    browseAllDifficultiesLabel: "Todas as dificuldades",
    faqSectionSuffix: "Perguntas frequentes",
    homeLinkLabel: "Início",
    aboutLinkLabel: "Sobre nós",
    contactLinkLabel: "Contato",
    privacyLinkLabel: "Privacidade",
    termsLinkLabel: "Termos de serviço",
    allRightsReserved: "© 2026 SudokuSync. Todos os direitos reservados.",
  },
};

export interface LocalizedSiloContent {
  title: string;
  description: string;
  h1: string;
  badgeLabel: string;
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

export const LOCALIZED_SEO_SILOS: Record<SeoLanguage, Record<SeoDifficulty, LocalizedSiloContent>> = {
  en: {
    EASY: {
      title: "Play Easy Sudoku Online Free | 51-Clue Beginner Puzzles — SudokuSync",
      description:
        "Solve free Easy Sudoku puzzles online with 51 starting clues and instant validation. Master Cross-Hatching Scanning, Box Elimination, or race friends live.",
      h1: "Play Easy Sudoku Online — Free 51-Clue Logic Puzzles",
      badgeLabel: "51 Clues • 30 Empty Cells",
      targetAudience: "Beginners, Warm-Ups & Speed Runs",
      primaryTechniques: [
        "Cross-Hatching Scanning",
        "Box & Line Elimination",
        "Single-Digit Counting",
      ],
      leadSummary:
        "Easy Sudoku boards on SudokuSync start with 51 verified pre-filled clues and only 30 empty cells, leaving enough anchors across every 3x3 block to build clean deduction momentum without guessing. Every grid is generated deterministically and verified to contain one unique solution.",
      strategyHeading: "How to Master 51-Clue Easy Sudoku With Scanning",
      strategyParagraphs: [
        "With 51 starting clues distributed across the 9x9 board, most 3x3 boxes already contain five or six given digits. Start by scanning rows and columns for your highest-frequency digits using Cross-Hatching: project intersecting lines through adjacent boxes to isolate the lone open square.",
        "Pair Cross-Hatching Scanning with Full-House and Last-Remaining-Cell checks. Whenever a row, column, or 3x3 box reaches seven or eight filled digits, scan the missing numbers directly—one-step elimination completes these closures smoothly and builds speed for Personal Best records.",
      ],
      tipsHeading: "Tactical Checklist for Easy Grids",
      tips: [
        "Focus on digits appearing most often first—completing one digit removes visual clutter across all nine boxes.",
        "Toggle Fast-Fill (Paintbrush) mode via the lightning button to place obvious single-box matches rapidly.",
        "Practice under the 3-mistake limit to build clean accuracy habits before stepping up to Medium or Hard.",
      ],
      faqs: [
        {
          q: "How many starting clues are in an Easy Sudoku puzzle?",
          a: "Every Easy Sudoku puzzle on SudokuSync starts with 51 fixed clues and 30 empty cells, verified by our uniqueness solver so every board has strictly one valid solution.",
        },
        {
          q: "Do I need candidate Pencil Notes for Easy Sudoku?",
          a: "Usually no. Nearly every empty cell on a 51-clue Easy board resolves through visual Cross-Hatching Scanning and simple row, column, or box elimination.",
        },
      ],
      crossLinkLabel: "Easy Sudoku",
      crossLinkSub: "51 Clues • Scanning",
    },
    MEDIUM: {
      title: "Play Medium Sudoku Online Free | 41-Clue Daily Puzzles — SudokuSync",
      description:
        "Play free Medium Sudoku with 41 starting clues on SudokuSync. Practice Elimination and Naked Singles, use smart candidate notes, or challenge friends via link.",
      h1: "Play Medium Sudoku Online — Free 41-Clue Daily Puzzles",
      badgeLabel: "41 Clues • 40 Empty Cells",
      targetAudience: "Intermediate & Daily Logic Solvers",
      primaryTechniques: [
        "Line-to-Box Elimination",
        "Naked Singles Deduction",
        "Selective Pencil Notes",
      ],
      leadSummary:
        "Medium Sudoku introduces 41 starting clues and 40 open squares—shifting the balance away from quick last-cell fills toward cross-unit Elimination and Naked Singles. It is the ideal mode for daily cognitive flow and balanced multiplayer races.",
      strategyHeading: "Solving 41-Clue Medium Boards With Elimination & Naked Singles",
      strategyParagraphs: [
        "Once direct Cross-Hatching Scanning slows on a 41-clue grid, inspect busy intersections where an empty cell shares a row, column, and 3x3 box containing seven or eight unique digits. Rule out every seen digit; if eight digits are excluded, the lone survivor is a Naked Single.",
        "Whenever two candidate spots remain for a digit inside a single 3x3 box and align on the same row or column (Locked Candidates), eliminate that digit from the rest of that line outside the box to unlock stalled bands.",
      ],
      tipsHeading: "Tactical Checklist for Medium Grids",
      tips: [
        "Record Pencil Notes sparingly using Snyder Notation—only mark a candidate inside a 3x3 box when it fits in two cells.",
        "Keep Auto-Remove Notes enabled to clear obsolete pencil candidates cleanly whenever you place a verified digit.",
        "Look for Naked Singles at dense row-column intersections whenever Scanning stops yielding immediate hits.",
      ],
      faqs: [
        {
          q: "What makes Medium Sudoku harder than Easy?",
          a: "Reducing starting clues from 51 down to 41 raises empty squares to 40, requiring cross-unit Elimination and Naked Singles rather than Scanning alone.",
        },
        {
          q: "Are Medium multiplayer rooms identical for all players?",
          a: "Yes. Every multiplayer room encodes one canonical PRNG seed so every participant solves the exact same 41-clue board.",
        },
      ],
      crossLinkLabel: "Medium Sudoku",
      crossLinkSub: "41 Clues • Singles",
    },
    HARD: {
      title: "Play Hard Sudoku Online Free | 30-Clue Logic Puzzles — SudokuSync",
      description:
        "Challenge yourself with free 30-clue Hard Sudoku online on SudokuSync. Break 0-Single dead-ends using Pointing Pairs, Naked & Hidden Pairs, and clean candidate notes.",
      h1: "Play Hard Sudoku Online — Free 30-Clue Logic Puzzles",
      badgeLabel: "30 Clues • 51 Empty Cells",
      targetAudience: "Experienced & Analytical Solvers",
      primaryTechniques: [
        "0-Single Dead-End Breaking",
        "Pointing Pairs & Box-Line Locks",
        "Naked & Hidden Pairs",
      ],
      leadSummary:
        "Hard Sudoku drops starting clues to 30 (leaving 51 empty cells), deliberately creating 0-Single dead-ends where quick scanning stalls completely. Breaking through demands disciplined Pencil Notes, Pointing Pairs, and Naked or Hidden Pairs.",
      strategyHeading: "Breaking 30-Clue 0-Single Dead-Ends With Pointing, Naked & Hidden Pairs",
      strategyParagraphs: [
        "On a 30-clue board, surface Singles vanish quickly into 0-Single dead-ends where no cell solves outright. Turn on Notes Mode to map candidates cleanly, then hunt Pointing Pairs: whenever a digit in a 3x3 box sits strictly on one row or column, lock it there and clear that candidate along the rest of the line.",
        "Follow Pointing Pairs with Naked Pairs and Hidden Pairs—two digits confined exclusively to two squares in a unit—stripping away rival candidates until fresh Singles cascade open.",
      ],
      tipsHeading: "Tactical Checklist for Hard Grids",
      tips: [
        "Fill complete Pencil Notes in cramped rows and boxes as soon as scanning hits a 0-Single wall.",
        "Pair Pointing Pairs with Naked and Hidden Pairs—pruning just two extra marks unlocks stalled bands.",
        "Never guess: every 30-clue Hard board is uniqueness-verified for pure logical solvability.",
      ],
      faqs: [
        {
          q: "How many clues does Hard Sudoku have on SudokuSync?",
          a: "Hard puzzles contain 30 starting clues and 51 blank cells, engineered to force 0-Single dead-ends solved via Pointing Pairs and Naked or Hidden Pairs.",
        },
        {
          q: "Do Hard boards ever require guessing?",
          a: "Never. Every generated 30-clue puzzle passes exact uniqueness and human-logic verification so pure deduction always finishes the grid.",
        },
      ],
      crossLinkLabel: "Hard Sudoku",
      crossLinkSub: "30 Clues • Pairs & Pointing",
    },
    EXPERT: {
      title: "Play Expert Sudoku Online Free | 25-Clue Skyscraper & Chain Puzzles — SudokuSync",
      description:
        "Test your mastery on free 25-clue Expert Sudoku puzzles online. Conquer Strict Digit Starvation with Skyscraper, 2-String Kite, and Advanced Chains on SudokuSync.",
      h1: "Play Expert Sudoku Online — Free 25-Clue Skyscraper & Chain Puzzles",
      badgeLabel: "25 Clues • 56 Empty Cells",
      targetAudience: "Advanced Tacticians & Competitive Players",
      primaryTechniques: [
        "Skyscraper & 2-String Kite",
        "Strict Digit Starvation Filtering",
        "Advanced Conjugate Chains",
      ],
      leadSummary:
        "Expert Sudoku strips the grid down to just 25 starting clues and 56 blank cells under Strict Digit Starvation—leaving key digits deeply bottlenecked across boxes. Built for seasoned tacticians, Expert demands Skyscraper, 2-String Kite, and Advanced Chains.",
      strategyHeading: "Cracking 25-Clue Digit Starvation With Skyscraper, 2-String Kite & Chains",
      strategyParagraphs: [
        "With only 25 clues anchoring the board and Strict Digit Starvation limiting high-frequency giveaways, single-step Pairs soon run dry. Filter one digit at a time to trace a Skyscraper or 2-String Kite: link strong conjugate pairs across two rows, columns, or a shared 3x3 box so any cell seeing both ends of the chain drops that candidate safely.",
        "When 2-String Kite and Skyscraper eliminations crack open a starved digit, pivot back to Advanced Chains and Locked Candidates to collapse stubborn bottlenecks without risking your 3-mistake limit.",
      ],
      tipsHeading: "Tactical Checklist for Expert Grids",
      tips: [
        "Tap individual numbers on the keypad to isolate starved digits and trace Skyscraper or 2-String Kite links cleanly.",
        "Spot bi-local strong links across rows, columns, and boxes to assemble Advanced Chains instead of guessing.",
        "Respect the 3-mistake rule—verifying chain endpoints beats hasty taps on 25-clue boards.",
      ],
      faqs: [
        {
          q: "How hard is Expert Sudoku with 25 clues on SudokuSync?",
          a: "Expert starts with just 25 clues and 56 empty cells under Strict Digit Starvation, engineered to require Skyscraper, 2-String Kite, and Advanced Chains.",
        },
        {
          q: "Do Personal Best times count on Expert if hints or unlimited mistakes are used?",
          a: "No. Personal Best records strictly require standard 3-mistake enforcement and fair-play hint limits.",
        },
      ],
      crossLinkLabel: "Expert Sudoku",
      crossLinkSub: "25 Clues • Chains & Kite",
    },
  },
  hi: {
    EASY: {
      title: "मुफ्त आसान सुडोकू खेलें | 51 संकेतों वाली शुरुआती पहेलियाँ — SudokuSync",
      description:
        "51 शुरुआती संकेतों और तुरंत जांच के साथ मुफ्त आसान सुडोकू ऑनलाइन खेलें। क्रॉस-हैचिंग स्कैनिंग तकनीक सीखें या दोस्तों के साथ लाइव मुकाबला करें।",
      h1: "आसान सुडोकू ऑनलाइन खेलें — 51 संकेतों वाली मुफ्त पहेलियाँ",
      badgeLabel: "51 संकेत • 30 खाली खाने",
      targetAudience: "शुरुआती खिलाड़ी, वार्म-अप और तेज़ दौड़",
      primaryTechniques: [
        "क्रॉस-हैचिंग स्कैनिंग तकनीक",
        "बॉक्स और पंक्ति उन्मूलन",
        "अधिक आवृत्ति वाले अंक की खोज",
      ],
      leadSummary:
        "SudokuSync पर आसान (Easy) सुडोकू बोर्ड 51 सत्यापित संकेतों और केवल 30 खाली खानों से शुरू होते हैं। हर 3x3 ब्लॉक में पर्याप्त अंक मौजूद होने से आप बिना तुक्का लगाए साफ तर्क के साथ तेज़ी से पहेली हल कर सकते हैं।",
      strategyHeading: "स्कैनिंग तकनीक से 51-संकेत आसान सुडोकू कैसे जीतें",
      strategyParagraphs: [
        "9x9 बोर्ड पर 51 शुरुआती संकेत होने से अधिकांश 3x3 खानों में पहले से ही पाँच या छह अंक होते हैं। सबसे अधिक बार दिखने वाले अंकों को चुनकर क्रॉस-हैचिंग स्कैनिंग तकनीक से पंक्तियों और स्तंभों को स्कैन करें और अकेले खाली खाने को तुरंत पहचानें।",
        "जब किसी पंक्ति, स्तंभ या 3x3 बॉक्स में 7 या 8 खाने भर चुके हों, तो बचे हुए एक-दो अंकों को सीधे भरकर व्यक्तिगत सर्वश्रेष्ठ (Personal Best) समय रिकॉर्ड के लिए गति बढ़ाएं।",
      ],
      tipsHeading: "आसान ग्रिड के लिए उपयोगी टिप्स",
      tips: [
        "सबसे अधिक दिखाई देने वाले अंक से शुरुआत करें—एक अंक के सभी 9 स्थान भरने से बोर्ड तुरंत साफ दिखने लगता है।",
        "तेज़ भरने के लिए लाइटनिंग बटन से फास्ट-फिल (पेंटब्रश) मोड चालू करें।",
        "मध्यम या कठिन स्तर पर जाने से पहले 3-गलतियों की सीमा के साथ सटीकता की आदत डालें।",
      ],
      faqs: [
        {
          q: "आसान सुडोकू पहेली में कितने शुरुआती संकेत होते हैं?",
          a: "SudokuSync की हर आसान पहेली 51 निश्चित संकेतों और 30 खाली खानों से शुरू होती है, जिसका केवल एक ही मान्य समाधान होता है।",
        },
        {
          q: "क्या आसान सुडोकू के लिए पेंसिल नोट्स की ज़रूरत होती है?",
          a: "आमतौर पर नहीं। 51 संकेतों वाले लगभग सभी खाली खाने विज़ुअल स्कैनिंग तकनीक और सामान्य उन्मूलन से हल हो जाते हैं।",
        },
      ],
      crossLinkLabel: "आसान सुडोकू",
      crossLinkSub: "51 संकेत • स्कैनिंग",
    },
    MEDIUM: {
      title: "मुफ्त मध्यम सुडोकू खेलें | 41 संकेतों वाली दैनिक पहेलियाँ — SudokuSync",
      description:
        "SudokuSync पर 41 शुरुआती संकेतों के साथ मुफ्त मध्यम सुडोकू खेलें। उन्मूलन और नेकेड सिंगल्स का अभ्यास करें और पेंसिल नोट्स के साथ दोस्तों को चुनौती दें।",
      h1: "मध्यम सुडोकू ऑनलाइन खेलें — 41 संकेतों वाली दैनिक पहेलियाँ",
      badgeLabel: "41 संकेत • 40 खाली खाने",
      targetAudience: "मध्यम स्तर और दैनिक तार्किक खिलाड़ी",
      primaryTechniques: [
        "पंक्ति-से-बॉक्स उन्मूलन",
        "नेकेड सिंगल्स तर्क",
        "चयनात्मक पेंसिल नोट्स",
      ],
      leadSummary:
        "मध्यम (Medium) सुडोकू 41 संकेतों और 40 खाली खानों के साथ आता है—जहाँ केवल स्कैनिंग के बजाय पंक्ति, स्तंभ और बॉक्स के बीच उन्मूलन और नेकेड सिंगल्स की भूमिका बढ़ जाती है। यह दैनिक दिमागी कसरत और निष्पक्ष मल्टीप्लेयर रेस के लिए सबसे संतुलित स्तर है।",
      strategyHeading: "उन्मूलन और नेकेड सिंगल्स से 41-संकेत मध्यम बोर्ड कैसे हल करें",
      strategyParagraphs: [
        "जब सीधी स्कैनिंग धीमी पड़ने लगे, तो ऐसे खाली खानों पर ध्यान दें जिनकी पंक्ति, स्तंभ और 3x3 बॉक्स में मिलाकर 7 या 8 अलग-अलग अंक पहले से मौजूद हों। सभी दिखने वाले अंक हटाने पर यदि केवल एक ही विकल्प बचे, तो वही नेकेड सिंगल होता है।",
        "यदि किसी 3x3 बॉक्स में किसी अंक के केवल दो संभावित स्थान एक ही पंक्ति या स्तंभ में हों (लॉक्ड कैंडिडेट्स), तो बॉक्स के बाहर उसी पंक्ति/स्तंभ से उस अंक को हटा दें।",
      ],
      tipsHeading: "मध्यम ग्रिड के लिए उपयोगी टिप्स",
      tips: [
        "स्नायडर नोटेशन अपनाएं—किसी 3x3 बॉक्स में अंक केवल तभी नोट करें जब उसके सिर्फ दो संभावित खाने हों।",
        "गलत पेंसिल निशान अपने आप हटाने के लिए ऑटो-रिमूव नोट्स चालू रखें।",
        "जब स्कैनिंग रुक जाए, तो घनी पंक्तियों के चौराहों पर नेकेड सिंगल्स खोजें।",
      ],
      faqs: [
        {
          q: "मध्यम सुडोकू आसान से अलग और कठिन कैसे होता है?",
          a: "संकेत 51 से घटकर 41 हो जाने पर 40 खाने खाली रहते हैं, जिससे सीधी स्कैनिंग के साथ उन्मूलन और नेकेड सिंगल्स आवश्यक हो जाते हैं।",
        },
        {
          q: "क्या मध्यम मल्टीप्लेयर रूम में सभी खिलाड़ियों को एक ही बोर्ड मिलता है?",
          a: "हाँ। हर मल्टीप्लेयर रूम एक साझा सीड का उपयोग करता है ताकि सभी खिलाड़ी बिल्कुल एक जैसी 41-संकेत पहेली हल करें।",
        },
      ],
      crossLinkLabel: "मध्यम सुडोकू",
      crossLinkSub: "41 संकेत • सिंगल्स",
    },
    HARD: {
      title: "मुफ्त हार्ड सुडोकू खेलें | 30 क्ल्यूज़ वाली लॉजिक पज़ल्स — SudokuSync",
      description:
        "SudokuSync पर 30 शुरुआती क्ल्यूज़ वाले फ्री हार्ड सुडोकू खेलें। पेंसिल नोट्स, पॉइंटिंग पेयर्स और नेकेड/हिडन पेयर्स की मदद से 0-Single डेड-एंड्स क्रैक करें।",
      h1: "हार्ड सुडोकू ऑनलाइन खेलें — 30 क्ल्यूज़ वाली फ्री लॉजिक पज़ल्स",
      badgeLabel: "30 क्ल्यूज़ • 51 खाली सेल्स",
      targetAudience: "अनुभवी और स्ट्रैटेजी पसंद करने वाले प्लेयर्स",
      primaryTechniques: [
        "0-Single डेड-एंड्स ब्रेक करना",
        "पॉइंटिंग पेयर्स और बॉक्स-लाइन लॉक्स",
        "नेकेड और हिडन पेयर्स",
      ],
      leadSummary:
        "हार्ड (Hard) सुडोकू में शुरुआती क्ल्यूज़ घटकर 30 रह जाते हैं और 51 सेल्स खाली होते हैं, जिससे जानबूझकर ऐसे 0-Single डेड-एंड्स बनते हैं जहाँ सिंपल स्कैनिंग पूरी तरह रुक जाती है। आगे बढ़ने के लिए क्लीन पेंसिल नोट्स, पॉइंटिंग पेयर्स और नेकेड व हिडन पेयर्स ही रास्ता खोलते हैं।",
      strategyHeading: "पॉइंटिंग, नेकेड और हिडन पेयर्स से 30-क्ल्यू 0-Single डेड-एंड्स कैसे तोड़ें",
      strategyParagraphs: [
        "30-क्ल्यू ग्रिड में आसान सिंगल्स जल्दी खत्म हो जाते हैं और बोर्ड 0-Single डेड-एंड पर अटक जाता है जहाँ कोई भी सेल सीधे नहीं भरता। ऐसे में नोट्स मोड ऑन करके सारे कैंडिडेट्स लिखें और पॉइंटिंग पेयर्स ढूँढें: अगर किसी 3x3 बॉक्स में कोई नंबर सिर्फ एक ही रो या कॉलम में आ सकता है, तो बाकी पूरी लाइन से उस नंबर का ऑप्शन हटा दें।",
        "इसके बाद नेकेड पेयर्स और हिडन पेयर्स पर फोकस करें—जब दो नंबर्स किसी लाइन या बॉक्स के ठीक दो सेल्स में लॉक हो जाएं, तो एक्स्ट्रा पेंसिल नोट्स क्लियर करते ही नए सिंगल्स अपने आप खुलने लगते हैं।",
      ],
      tipsHeading: "हार्ड ग्रिड्स के लिए प्रैक्टिकल चेकलिस्ट",
      tips: [
        "जैसे ही स्कैनिंग 0-Single वॉल से टकराए, भीड़ वाली रोज़ और बॉक्सेस में साफ पेंसिल नोट्स भर लें।",
        "पॉइंटिंग पेयर्स के साथ नेकेड और हिडन पेयर्स इस्तेमाल करें—सिर्फ दो एक्स्ट्रा नोट्स हटते ही पूरा सेक्शन अनलॉक हो जाता है।",
        "कभी गेस न करें: हर 30-क्ल्यू हार्ड बोर्ड सिंगल यूनिक सॉल्यूशन के लिए पहले से वेरिफाइड होता है।",
      ],
      faqs: [
        {
          q: "SudokuSync पर हार्ड सुडोकू में कितने क्ल्यूज़ होते हैं?",
          a: "हार्ड पज़ल्स में 30 शुरुआती क्ल्यूज़ और 51 खाली सेल्स होते हैं, जिन्हें पॉइंटिंग पेयर्स और नेकेड/हिडन पेयर्स से 0-Single डेड-एंड्स पार करने के लिए डिज़ाइन किया गया है।",
        },
        {
          q: "क्या हार्ड बोर्ड हल करने के लिए कभी तुक्का लगाना पड़ता है?",
          a: "बिलकुल नहीं। हर 30-क्ल्यू बोर्ड यूनिकनेस और ह्यूमन-लॉजिक वेरिफिकेशन के बाद ही बनता है ताकि प्योर लॉजिक से पूरा हल निकले।",
        },
      ],
      crossLinkLabel: "हार्ड सुडोकू",
      crossLinkSub: "30 क्ल्यूज़ • पेयर्स और पॉइंटिंग",
    },
    EXPERT: {
      title: "मुफ्त एक्सपर्ट सुडोकू खेलें | 25 क्ल्यूज़ Skyscraper और चेन पज़ल्स — SudokuSync",
      description:
        "केवल 25 क्ल्यूज़ वाले फ्री एक्सपर्ट सुडोकू में अपना स्किल टेस्ट करें। Skyscraper, 2-String Kite और एडवांस्ड चेन्स से सख्त डिजिट स्टार्वेशन को मात दें।",
      h1: "एक्सपर्ट सुडोकू ऑनलाइन खेलें — 25 क्ल्यूज़ Skyscraper और चेन पज़ल्स",
      badgeLabel: "25 क्ल्यूज़ • 56 खाली सेल्स",
      targetAudience: "एडवांस्ड रणनीतिकार और कॉम्पिटिटिव प्लेयर्स",
      primaryTechniques: [
        "Skyscraper और 2-String Kite",
        "सख्त डिजिट स्टार्वेशन फ़िल्टरिंग",
        "एडवांस्ड कॉन्जुगेट चेन्स",
      ],
      leadSummary:
        "एक्सपर्ट (Expert) सुडोकू ग्रिड को सिर्फ 25 शुरुआती क्ल्यूज़ और 56 खाली सेल्स तक समेट देता है—जहाँ सख्त डिजिट स्टार्वेशन की वजह से ज़रूरी नंबर्स काफी सीमित रहते हैं। इसे क्रैक करने के लिए Skyscraper, 2-String Kite और एडवांस्ड चेन्स की गहरी समझ चाहिए।",
      strategyHeading: "Skyscraper, 2-String Kite और एडवांस्ड चेन्स से 25-क्ल्यू डिजिट स्टार्वेशन कैसे क्रैक करें",
      strategyParagraphs: [
        "सिर्फ 25 क्ल्यूज़ और सख्त डिजिट स्टार्वेशन के कारण आसान पेयर्स जल्दी खत्म हो जाते हैं। एक-एक नंबर को फ़िल्टर करके Skyscraper या 2-String Kite ट्रेस करें: दो अलग रोज़, कॉलम्स या किसी एक कॉमन 3x3 बॉक्स के ज़रिए स्ट्रॉन्ग कॉन्जुगेट पेयर्स को जोड़ें—जो सेल चेन के दोनों सिरों को देखती हो, वहाँ से वह कैंडिडेट नंबर पक्का हट जाता है।",
        "जैसे ही Skyscraper या 2-String Kite किसी स्टार्व्ड नंबर का लॉक खोलें, एडवांस्ड चेन्स और लॉक्ड कैंडिडेट्स की मदद से मुश्किल बॉटलनेक्स तोड़ें और अपनी 3-गलतियों की लिमिट सुरक्षित रखें।",
      ],
      tipsHeading: "एक्सपर्ट ग्रिड्स के लिए प्रैक्टिकल चेकलिस्ट",
      tips: [
        "कीपैड पर एक-एक नंबर टैप करके स्टार्व्ड डिजिट्स को हाइलाइट करें, ताकि Skyscraper और 2-String Kite लिंक साफ दिखें।",
        "गेस मारने के बजाय रो, कॉलम और बॉक्स में दो-पॉइंट वाले स्ट्रॉन्ग लिंक्स जोड़कर एडवांस्ड चेन्स बनाएं।",
        "25-क्ल्यू ग्रिड्स पर 3-मिस्टेक रूल का ध्यान रखें—जल्दबाज़ी से ज़्यादा ज़रूरी है चेन के एंडपॉइंट्स चेक करना।",
      ],
      faqs: [
        {
          q: "SudokuSync पर 25 क्ल्यूज़ वाला एक्सपर्ट सुडोकू कितना टफ होता है?",
          a: "एक्सपर्ट बोर्ड सिर्फ 25 क्ल्यूज़ और 56 खाली सेल्स के साथ सख्त डिजिट स्टार्वेशन में चलता है, जिसे Skyscraper, 2-String Kite और एडवांस्ड चेन्स के बिना हल करना मुश्किल है।",
        },
        {
          q: "क्या अनलिमिटेड मिस्टेक्स या एक्स्ट्रा हिंट्स इस्तेमाल करने पर Personal Best गिना जाता है?",
          a: "नहीं। फेयर लीडरबोर्ड के लिए Personal Best रिकॉर्ड केवल स्टैंडर्ड 3-मिस्टेक लिमिट और तय हिंट नियम के तहत ही काउंट होते हैं।",
        },
      ],
      crossLinkLabel: "एक्सपर्ट सुडोकू",
      crossLinkSub: "25 क्ल्यूज़ • चेन्स और काइट",
    },
  },
  de: {
    EASY: {
      title: "Einfaches Sudoku kostenlos online spielen | 51 Vorgaben — SudokuSync",
      description:
        "Löse kostenlose einfache Sudoku-Rätsel mit 51 Startvorgaben online. Meistere die Scan-Technik (Cross-Hatching) oder spiele live gegen Freunde.",
      h1: "Einfaches Sudoku online spielen — Kostenlose 51-Vorgaben-Rätsel",
      badgeLabel: "51 Vorgaben • 30 Leere Felder",
      targetAudience: "Einsteiger, Warm-Up & Speedruns",
      primaryTechniques: [
        "Cross-Hatching Scan-Technik",
        "Block- & Linien-Elimination",
        "Häufigkeits-Zählung",
      ],
      leadSummary:
        "Einfache Sudoku-Bretter auf SudokuSync starten mit 51 geprüften Startvorgaben und nur 30 leeren Feldern. Jedes Gitter wird deterministisch erzeugt und garantiert eine eindeutige Lösung ganz ohne Raten.",
      strategyHeading: "Mit Scan-Technik das 51-Vorgaben-Sudoku meistern",
      strategyParagraphs: [
        "Bei 51 Vorgaben enthalten die meisten 3x3-Blöcke bereits fünf oder sechs Ziffern. Nutze die Cross-Hatching Scan-Technik: Verfolge Zeilen und Spalten für häufige Zahlen durch benachbarte Blöcke, um das einzig verbliebene freie Feld sofort zu isolieren.",
        "Kombiniere das Scannen mit Full-House-Prüfungen in fast vollen Reihen oder Blöcken, um Lücken flüssig zu schließen und persönliche Bestzeiten aufzustellen.",
      ],
      tipsHeading: "Checkliste für einfache Gitter",
      tips: [
        "Beginne mit den häufigsten Ziffern—jede abgeschlossene Zahl macht das Brett übersichtlicher.",
        "Aktiviere den Schnellfüll-Modus (Fast-Fill) über das Blitz-Symbol für schnelle Einträge.",
        "Übe mit dem 3-Fehler-Limit, um saubere Genauigkeit für Medium und Hard aufzubauen.",
      ],
      faqs: [
        {
          q: "Wie viele Startvorgaben hat ein einfaches Sudoku?",
          a: "Jedes einfache Rätsel auf SudokuSync beginnt mit exakt 51 festen Vorgaben und 30 leeren Feldern sowie genau einer eindeutigen Lösung.",
        },
        {
          q: "Brauche ich Notizen für einfaches Sudoku?",
          a: "Meistens nicht. Fast jedes Feld eines 51-Vorgaben-Bretts löst sich durch visuelles Cross-Hatching-Scannen und direkte Elimination.",
        },
      ],
      crossLinkLabel: "Einfach Sudoku",
      crossLinkSub: "51 Vorgaben • Scannen",
    },
    MEDIUM: {
      title: "Mittleres Sudoku kostenlos online spielen | 41 Vorgaben — SudokuSync",
      description:
        "Spiele kostenloses mittleres Sudoku mit 41 Startvorgaben auf SudokuSync. Trainiere Elimination und Naked Singles mit smarten Notizen oder gegen Freunde.",
      h1: "Mittleres Sudoku online spielen — 41-Vorgaben-Tagesrätsel",
      badgeLabel: "41 Vorgaben • 40 Leere Felder",
      targetAudience: "Fortgeschrittene & Tägliches Logiktraining",
      primaryTechniques: [
        "Linien-Block-Elimination",
        "Naked Singles Deduktion",
        "Gezielte Bleistift-Notizen",
      ],
      leadSummary:
        "Mittleres Sudoku bietet 41 Vorgaben und 40 leere Felder—hier treten systematische Elimination und Naked Singles in den Vordergrund. Perfekt für täglichen Spielfluss und faire Multiplayer-Duelle.",
      strategyHeading: "41-Vorgaben-Bretter mit Elimination & Naked Singles lösen",
      strategyParagraphs: [
        "Sobald direktes Scannen stockt, prüfe Schnittpunkte von Zeilen, Spalten und Blöcken mit sieben oder acht sichtbaren Ziffern. Bleibt genau ein Kandidat übrig, hast du einen Naked Single gefunden.",
        "Liegen die letzten zwei möglichen Felder einer Ziffer in einem Block auf derselben Linie (Locked Candidates), streiche diese Ziffer im Rest der Zeile oder Spalte.",
      ],
      tipsHeading: "Checkliste für mittlere Gitter",
      tips: [
        "Nutze Snyder-Notation: Trage eine Zahl im 3x3-Block nur ein, wenn genau zwei Felder möglich sind.",
        "Lass Auto-Remove Notes aktiviert, um erledigte Kandidaten automatisch bereinigen zu lassen.",
        "Suche an dicht besetzten Zeilen-Spalten-Kreuzungen gezielt nach Naked Singles.",
      ],
      faqs: [
        {
          q: "Warum ist Mittel anspruchsvoller als Einfach?",
          a: "Mit 41 statt 51 Vorgaben wachsen die leeren Felder auf 40, sodass reines Scannen nicht mehr ausreicht und Elimination plus Naked Singles nötig werden.",
        },
        {
          q: "Erhalten im Multiplayer alle Spieler dasselbe Medium-Brett?",
          a: "Ja. Jeder Multiplayer-Raum nutzt einen identischen Seed für exakt dasselbe 41-Vorgaben-Rätsel.",
        },
      ],
      crossLinkLabel: "Mittel Sudoku",
      crossLinkSub: "41 Vorgaben • Singles",
    },
    HARD: {
      title: "Schweres Sudoku kostenlos online spielen | 30 Vorgaben — SudokuSync",
      description:
        "Fordere dich selbst mit kostenlosem schweren 30-Vorgaben-Sudoku heraus. Knacke 0-Single-Sackgassen mit Pointing Pairs, Naked & Hidden Pairs und Notizen.",
      h1: "Schweres Sudoku online spielen — 30-Vorgaben-Strategierätsel",
      badgeLabel: "30 Vorgaben • 51 Leere Felder",
      targetAudience: "Erfahrene & Analytische Löser",
      primaryTechniques: [
        "0-Single-Sackgassen auflösen",
        "Pointing Pairs & Block-Linien-Sperren",
        "Naked & Hidden Pairs",
      ],
      leadSummary:
        "Schweres Sudoku reduziert die Startvorgaben auf 30 (51 leere Felder) und erzeugt gezielt 0-Single-Sackgassen, in denen reines Scannen komplett stockt. Den Durchbruch liefern saubere Kandidaten-Notizen, Pointing Pairs sowie Naked und Hidden Pairs.",
      strategyHeading: "30-Vorgaben-Sackgassen mit Pointing, Naked & Hidden Pairs knacken",
      strategyParagraphs: [
        "In 30-Vorgaben-Brettern versiegen offensichtliche Singles rasch in 0-Single-Sackgassen ohne direkten Treffer. Aktiviere den Notizmodus und suche Pointing Pairs: Liegt eine Ziffer innerhalb eines 3x3-Blocks nur auf einer Zeile oder Spalte, wird sie entlang der restlichen Linie außerhalb des Blocks gestrichen.",
        "Kombiniere Pointing Pairs mit Naked Pairs und Hidden Pairs—zwei Ziffern, die sich in einer Einheit exklusiv auf zwei Felder beschränken—bis blockierte Singles wieder sichtbar werden.",
      ],
      tipsHeading: "Checkliste für schwere Gitter",
      tips: [
        "Fülle in dichten Zeilen und Blöcken vollständige Kandidaten-Notizen ein, sobald Scannen in einer 0-Single-Sackgasse endet.",
        "Nutze Pointing Pairs zusammen mit Naked und Hidden Pairs—schon wenige gestrichene Kandidaten öffnen ganze Reihen.",
        "Nie raten: Jedes 30-Vorgaben-Brett ist mathematisch eindeutig und rein logisch lösbar.",
      ],
      faqs: [
        {
          q: "Wie viele Vorgaben hat Schwer auf SudokuSync?",
          a: "Schwere Gitter starten mit 30 Vorgaben und 51 freien Feldern, ausgelegt auf 0-Single-Sackgassen mit Pointing Pairs sowie Naked und Hidden Pairs.",
        },
        {
          q: "Muss man bei Schwer jemals raten?",
          a: "Nein. Jedes generierte 30-Vorgaben-Rätsel wird auf exakte Eindeutigkeit und logische Lösbarkeit geprüft.",
        },
      ],
      crossLinkLabel: "Schwer Sudoku",
      crossLinkSub: "30 Vorgaben • Pairs & Pointing",
    },
    EXPERT: {
      title: "Experten-Sudoku kostenlos spielen | 25 Vorgaben, Skyscraper & Ketten — SudokuSync",
      description:
        "Teste deine Meisterschaft im kostenlosen 25-Vorgaben-Experten-Sudoku. Meistern Strict Digit Starvation mit Skyscraper, 2-String Kite und tiefen Ketten.",
      h1: "Experten-Sudoku online spielen — 25-Vorgaben-Skyscraper & Logikketten",
      badgeLabel: "25 Vorgaben • 56 Leere Felder",
      targetAudience: "Taktiker & Turnierspieler",
      primaryTechniques: [
        "Skyscraper & 2-String Kite",
        "Strict Digit Starvation Analyse",
        "Verkettete Konjugatpaare (Advanced Chains)",
      ],
      leadSummary:
        "Das Experten-Level reduziert das Brett auf nur 25 Startvorgaben und 56 leere Felder unter strikter Ziffern-Verknappung (Strict Digit Starvation). Es verlangt akribische Notizen, Skyscraper, 2-String Kite und fortgeschrittene Kettenlogik.",
      strategyHeading: "25-Vorgaben-Verknappung mit Skyscraper, 2-String Kite & Ketten lösen",
      strategyParagraphs: [
        "Bei nur 25 Vorgaben und Strict Digit Starvation führen einfache Paare bald nicht mehr weiter. Filtere Ziffer für Ziffer nach Skyscraper oder 2-String Kite: Verknüpfe starke Konjugatpaare über zwei Zeilen, Spalten oder einen gemeinsamen 3x3-Block, sodass jedes Feld im Sichtbereich beider Kettenenden diesen Kandidaten sicher verliert.",
        "Haben Skyscraper oder 2-String Kite eine verknappte Ziffer aufgebrochen, löse verbleibende Engpässe mit Advanced Chains und Claiming, ohne das 3-Fehler-Limit zu gefährden.",
      ],
      tipsHeading: "Checkliste für Experten-Gitter",
      tips: [
        "Tippe einzelne Ziffern auf dem Tastenfeld an, um verknappte Zahlen hervorzuheben und Skyscraper- oder 2-String-Kite-Links zu sehen.",
        "Verbinde starke Konjugatpaare über Zeilen, Spalten und Blöcke zu Advanced Chains, statt zu raten.",
        "Bleib unter der 3-Fehler-Regel ruhig—das Prüfen von Kettenendpunkten schlägt hastiges Tippen auf 25-Vorgaben-Gittern.",
      ],
      faqs: [
        {
          q: "Wie anspruchsvoll ist Experten-Sudoku mit 25 Vorgaben auf SudokuSync?",
          a: "Experten-Rätsel starten mit nur 25 Vorgaben und 56 leeren Feldern unter Strict Digit Starvation und erfordern Skyscraper, 2-String Kite sowie Advanced Chains.",
        },
        {
          q: "Zählen Bestzeiten bei unbegrenzten Fehlern oder Zusatz-Tipps?",
          a: "Nein. Für faire Bestenlisten gelten Bestzeiten ausschließlich mit aktivem 3-Fehler-Limit und regulären Tipp-Regeln.",
        },
      ],
      crossLinkLabel: "Experte Sudoku",
      crossLinkSub: "25 Vorgaben • Ketten & Kite",
    },
  },
  ja: {
    EASY: {
      title: "無料 かんたん数独（ナンプレ）オンライン | ヒント51個の入門パズル — SudokuSync",
      description:
        "初期配置51個の無料かんたん数独（ナンプレ）を今すぐプレイ。スキャン法（交差法）の基礎を身につけ、リアルタイム対戦で友達と競いましょう。",
      h1: "かんたん数独（ナンプレ）オンライン — ヒント51個の無料パズル",
      badgeLabel: "初期配置 51個 • 空きマス 30個",
      targetAudience: "初心者・ウォーミングアップ・タイムアタック",
      primaryTechniques: [
        "スキャン法（クロスハッチング）",
        "ブロック＆ライン消去法",
        "高頻度数字のカウント",
      ],
      leadSummary:
        "SudokuSyncの「かんたん」数独は、検証済みの初期数字51個・空きマス30個からスタートします。すべての3x3ブロックに十分な手掛かりがあるため、勘に頼らず論理だけで爽快に解き進められます。",
      strategyHeading: "51個の初期配置をスキャン法（交差法）で素早く解くコツ",
      strategyParagraphs: [
        "初期配置が51個ある盤面では、各3x3ブロックに5〜6個の数字が入っています。盤面に多く登場している数字から順番に「スキャン法（交差法）」を使い、隣接ブロックの行と列を交差させて残る1マスを確実に見つけましょう。",
        "空きマスが1〜2個になった行・列・ブロック（フルハウス）を優先して埋めることで、ミスなくスピーディに自己ベスト記録を狙えます。",
      ],
      tipsHeading: "かんたん盤面の攻略チェックリスト",
      tips: [
        "出現回数の多い数字から先に9個すべて埋めると、盤面が一気にシンプルになります。",
        "連続入力には稲妻ボタンの「ファストフィル（ブラシモード）」を活用しましょう。",
        "3ミス制限ルールで正確に解く習慣を身につけてから「ふつう」や「むずかしい」へ進みましょう。",
      ],
      faqs: [
        {
          q: "かんたん数独の初期数字はいくつありますか？",
          a: "SudokuSyncの「かんたん」は51個の確定数字と30個の空きマスで構成され、必ず唯一解になることが数学的に検証されています。",
        },
        {
          q: "かんたんレベルでメモ機能は必要ですか？",
          a: "通常は不要です。51個ヒントの盤面は視覚的なスキャン法とシンプルな消去法だけでほぼ最後まで解けます。",
        },
      ],
      crossLinkLabel: "かんたん数独",
      crossLinkSub: "初期51個 • スキャン法",
    },
    MEDIUM: {
      title: "無料 ふつう数独（ナンプレ）オンライン | ヒント41個のデイリーパズル — SudokuSync",
      description:
        "初期配置41個の無料「ふつう」数独をオンラインでプレイ。消去法とネイキッドシングル、便利なメモ機能を活用し、友達と同一盤面で対戦できます。",
      h1: "ふつう数独（ナンプレ）オンライン — ヒント41個の論理パズル",
      badgeLabel: "初期配置 41個 • 空きマス 40個",
      targetAudience: "中級者・毎日の脳トレプレイヤー",
      primaryTechniques: [
        "ライン・ブロック消去法",
        "ネイキッドシングル（確定数字）",
        "スナイダー記法メモ",
      ],
      leadSummary:
        "「ふつう」数独は初期配置41個・空きマス40個となり、単純なスキャンだけでなく行・列・ブロックの交差点を見抜く「消去法」と「ネイキッドシングル」が鍵になります。毎日の集中トレーニングや友達との対戦に最適です。",
      strategyHeading: "消去法とネイキッドシングルで41個の盤面を攻略",
      strategyParagraphs: [
        "スキャン法が一段落したら、すでに7〜8種類の数字が揃っている行・列・3x3ブロックの交差点に注目してください。周囲の数字をすべて除外して1つだけ残る候補が「ネイキッドシングル」です。",
        "ブロック内で特定の数字が入るマスが同じ行または列の2マスだけに絞られたら（ロックされた候補）、ブロック外の同ラインからその数字を消去できます。",
      ],
      tipsHeading: "ふつう盤面の攻略チェックリスト",
      tips: [
        "スナイダー記法：ブロック内で候補が2マスだけの数字から優先的にメモを入れましょう。",
        "確定数字を入力したら自動で関連メモを消す「メモ自動削除」をオンにしておくと快適です。",
        "スキャンが行き詰まったら、数字が密集した交差マスでネイキッドシングルを探しましょう。",
      ],
      faqs: [
        {
          q: "「ふつう」は「かんたん」と何が違いますか？",
          a: "初期配置が51個から41個（空き40マス）へ減るため、スキャン法に加えて消去法とネイキッドシングルの判断が必要になります。",
        },
        {
          q: "対戦ルームでは相手と全く同じ問題が出ますか？",
          a: "はい。シード値により同じ41個配置の盤面が配信され、純粋な実力勝負ができます。",
        },
      ],
      crossLinkLabel: "ふつう数独",
      crossLinkSub: "初期41個 • シングル",
    },
    HARD: {
      title: "無料 むずかしい数独（ナンプレ）オンライン | ヒント30個の論理パズル — SudokuSync",
      description:
        "初期配置30個の「むずかしい」数独に無料挑戦。ポインティングペアやネイキッド／ヒドゥンペアを駆使して0-Single停滞を論理的に突破しよう。",
      h1: "むずかしい数独（ナンプレ）オンライン — ヒント30個の本格パズル",
      badgeLabel: "初期配置 30個 • 空きマス 51個",
      targetAudience: "上級者・本格ロジックファン",
      primaryTechniques: [
        "0-Single停滞の突破",
        "ポインティングペア（ライン・ブロック制限）",
        "ネイキッドペア＆ヒドゥンペア",
      ],
      leadSummary:
        "「むずかしい」数独は初期配置が30個（空きマス51個）まで絞られ、単一候補がゼロになる「0-Single停滞」が意図的に発生します。突破するには緻密な候補メモとポインティングペア、ネイキッド／ヒドゥンペアが欠かせません。",
      strategyHeading: "ポインティングペアとペア法で30個の0-Single停滞を突破する",
      strategyParagraphs: [
        "30個配置の盤面では、表面上のシングルがすぐに尽きて「0-Single停滞」に陥ります。メモモードで候補を書き出し、まずポインティングペアを探しましょう。ある3x3ブロック内で特定の数字が1つの行または列にだけ並ぶとき、ブロック外の同ラインからその候補をすべて消去できます。",
        "続いて、2つの数字が同じ2マスだけに絞られるネイキッドペアおよびヒドゥンペアを見つけ、余分な候補をそぎ落として新たなシングルを呼び込みます。",
      ],
      tipsHeading: "むずかしい盤面の攻略チェックリスト",
      tips: [
        "スキャンが0-Singleの壁に止まったら、密度の高い行やブロックから丁寧にメモを埋めましょう。",
        "ポインティングペアとネイキッド／ヒドゥンペアを組み合わせると、止まった領域が一気にほどけます。",
        "当てずっぽうは不要です。すべての30個盤面が唯一解・純粋ロジックで解けるよう検証されています。",
      ],
      faqs: [
        {
          q: "むずかしい数独のヒント（初期配置）はいくつですか？",
          a: "30個の初期数字と51個の空きマスで構成され、ポインティングペアやネイキッド／ヒドゥンペアを使って0-Single停滞を突破する設計です。",
        },
        {
          q: "途中で仮置き（カン）が必要になることはありますか？",
          a: "ありません。すべての30個問題が唯一解および論理的解法の検証を通過しています。",
        },
      ],
      crossLinkLabel: "むずかしい数独",
      crossLinkSub: "初期30個 • ペア＆ポインティング",
    },
    EXPERT: {
      title: "無料 エキスパート数独（ナンプレ）オンライン | 初期25個・スカイスクレイパー対応 — SudokuSync",
      description:
        "初期配置わずか25個の超難問「エキスパート」数独を無料プレイ。Skyscraper・2-String Kite・上級チェーンで厳格な数字制限（Digit Starvation）を制覇しよう。",
      h1: "エキスパート数独（ナンプレ）オンライン — 初期25個・上級チェーン難問",
      badgeLabel: "初期配置 25個 • 空きマス 56個",
      targetAudience: "達人・トーナメント志向プレイヤー",
      primaryTechniques: [
        "スカイスクレイパー（Skyscraper）＆ 2-String Kite",
        "厳格な数字制限（Strict Digit Starvation）対策",
        "上級強リンクチェーン消去",
      ],
      leadSummary:
        "「エキスパート」は厳格な数字制限（Strict Digit Starvation）のもと、初期配置わずか25個・空きマス56個まで削ぎ落とした極限難易度です。熟練者向けに設計され、Skyscraper・2-String Kite・上級チェーンの連鎖推理が鍵を握ります。",
      strategyHeading: "Skyscraper・2-String Kite・上級チェーンで25個の難問を攻略",
      strategyParagraphs: [
        "初期数字が25個しかなく数字の出現数も厳しく制限（Digit Starvation）されているため、単純なペア法はすぐに行き詰まります。数字を1つずつハイライトしてSkyscraperや2-String Kiteを探しましょう。2つの行・列や共通ブロックを強リンク（2択ペア）で結び、両端から見えるマスの候補を論理的に削ります。",
        "Skyscraperや2-String Kiteで突破口を開いたら、上級チェーンとロックされた候補を組み合わせて複雑な連鎖を解きほぐし、3ミス制限内でクリアを目指しましょう。",
      ],
      tipsHeading: "エキスパート盤面の攻略チェックリスト",
      tips: [
        "キーパッドで1つずつ数字を選び、少ない数字のSkyscraperや2-String Kiteの強リンクを見やすくしましょう。",
        "当て推量ではなく、行・列・ブロック間の2択（強リンク）をつないで上級チェーンを組み立てましょう。",
        "25個盤面では焦ってタップせず、チェーンの両端を確認して3ミス制限を守るのが最速への近道です。",
      ],
      faqs: [
        {
          q: "初期配置25個のエキスパート数独はどれくらい難しいですか？",
          a: "Strict Digit Starvationが適用された初期25個・空き56マスの高難度盤面で、Skyscraper・2-String Kite・上級チェーンなどの手筋が求められます。",
        },
        {
          q: "無制限ミス設定や追加ヒントを使っても自己ベスト記録は残りますか？",
          a: "いいえ。公平なランキング維持のため、自己ベスト記録は標準の3ミス制限と規定ヒント上限内でのみ認定されます。",
        },
      ],
      crossLinkLabel: "エキスパート数独",
      crossLinkSub: "初期25個 • チェーン＆カイト",
    },
  },
  ko: {
    EASY: {
      title: "무료 쉬움 스도쿠 온라인 | 51개 힌트 입문 퍼즐 — SudokuSync",
      description:
        "51개의 초기 힌트가 제공되는 무료 쉬움 스도쿠를 온라인에서 바로 플레이하세요. 스캐닝 기법을 익히고 친구와 실시간 대결을 즐길 수 있습니다.",
      h1: "쉬움 스도쿠 온라인 플레이 — 51개 힌트 무료 로직 퍼즐",
      badgeLabel: "초기 힌트 51개 • 빈 칸 30개",
      targetAudience: "입문자, 두뇌 워밍업 및 스피드 런",
      primaryTechniques: [
        "크로스 해칭 스캐닝 기법",
        "박스 및 행·열 소거법",
        "다빈도 숫자 집중 탐색",
      ],
      leadSummary:
        "SudokuSync의 쉬움(Easy) 스도쿠는 검증된 51개의 초기 숫자와 단 30개의 빈 칸으로 시작합니다. 모든 3x3 박스에 충분한 단서가 있어 추측 없이 깔끔한 논리만으로 빠르게 완성할 수 있습니다.",
      strategyHeading: "스캐닝 기법으로 51개 힌트 쉬움 스도쿠 정복하기",
      strategyParagraphs: [
        "51개의 힌트가 배치된 보드에서는 대부분의 3x3 박스에 이미 5~6개의 숫자가 채워져 있습니다. 보드에 가장 많이 나온 숫자부터 스캐닝 기법(교차 스캔)으로 가로줄과 세로줄을 훑어 단 하나 남은 빈 칸을 찾아내세요.",
        "이미 7~8개가 채워진 줄이나 박스를 우선 마감하는 습관을 들이면 안정적으로 개인 최고 기록을 단축할 수 있습니다.",
      ],
      tipsHeading: "쉬움 보드 공략 체크리스트",
      tips: [
        "가장 자주 보이는 숫자부터 9개를 모두 완성하면 전체 보드가 훨씬 선명해집니다.",
        "번개 아이콘의 빠른 채우기(페인트브러시) 모드로 확실한 칸을 연속 입력해 보세요.",
        "실수 3회 제한 규칙으로 연습해 정확도를 높인 뒤 보통 단계로 넘어가세요.",
      ],
      faqs: [
        {
          q: "쉬움 스도쿠에는 처음에 몇 개의 숫자가 주어지나요?",
          a: "SudokuSync의 모든 쉬움 퍼즐은 51개의 고정 힌트와 30개의 빈 칸으로 시작하며, 유일한 정답이 수학적으로 검증되어 있습니다.",
        },
        {
          q: "쉬움 단계에서도 메모 기능이 꼭 필요한가요?",
          a: "대부분 필요하지 않습니다. 51개 힌트 보드는 직관적인 스캐닝 기법과 간단한 소거만으로도 끝까지 풀립니다.",
        },
      ],
      crossLinkLabel: "쉬움 스도쿠",
      crossLinkSub: "힌트 51개 • 스캐닝",
    },
    MEDIUM: {
      title: "무료 보통 스도쿠 온라인 | 41개 힌트 데일리 퍼즐 — SudokuSync",
      description:
        "41개 초기 힌트로 즐기는 무료 보통 스도쿠! 소거법과 네이키드 싱글 전략, 스마트 메모를 활용해 혼자 또는 친구와 공정하게 대결하세요.",
      h1: "보통 스도쿠 온라인 플레이 — 41개 힌트 데일리 퍼즐",
      badgeLabel: "초기 힌트 41개 • 빈 칸 40개",
      targetAudience: "중급자 및 매일 두뇌 트레이닝",
      primaryTechniques: [
        "라인-박스 교차 소거법",
        "네이키드 싱글 추론",
        "선택적 후보 메모",
      ],
      leadSummary:
        "보통(Medium) 스도쿠는 41개의 힌트와 40개의 빈 칸을 제공하여 단순 스캔을 넘어 교차 소거법과 네이키드 싱글 판단력을 요구합니다. 꾸준한 두뇌 훈련과 멀티플레이어 경주에 가장 균형 잡힌 난이도입니다.",
      strategyHeading: "소거법과 네이키드 싱글로 41개 힌트 보통 보드 풀기",
      strategyParagraphs: [
        "기본 스캐닝이 멈추면 가로줄·세로줄·3x3 박스에 총 7~8개의 서로 다른 숫자가 모인 교차 칸을 살펴보세요. 이미 존재하는 숫자를 모두 소거하고 단 1개만 남는다면 확실한 네이키드 싱글입니다.",
        "하나의 3x3 박스 안에서 특정 숫자가 들어갈 두 칸이 같은 줄에 나란히 놓여 있다면(잠긴 후보), 박스 밖의 해당 줄에서 그 숫자를 제외할 수 있습니다.",
      ],
      tipsHeading: "보통 보드 공략 체크리스트",
      tips: [
        "스나이더 표기법처럼 박스 내 가능한 위치가 2칸뿐인 숫자 위주로 메모를 남기세요.",
        "숫자를 확정 입력할 때 겹치는 메모를 지워주는 '메모 자동 삭제' 기능을 유지하세요.",
        "스캐닝이 막히면 밀도가 높은 행과 열의 교차점에서 네이키드 싱글을 찾으세요.",
      ],
      faqs: [
        {
          q: "보통 난이도는 쉬움과 무엇이 다른가요?",
          a: "초기 힌트가 51개에서 41개로 줄고 빈 칸이 40개로 늘어나, 스캐닝뿐 아니라 교차 소거법과 네이키드 싱글이 필요해집니다.",
        },
        {
          q: "멀티플레이어 방에서는 상대와 완전히 같은 문제를 푸나요?",
          a: "네. 동일한 시드 코드를 공유하므로 모든 참가자가 똑같은 41개 힌트 보드에서 공정하게 실력을 겨룹니다.",
        },
      ],
      crossLinkLabel: "보통 스도쿠",
      crossLinkSub: "힌트 41개 • 싱글",
    },
    HARD: {
      title: "무료 어려움 스도쿠 온라인 | 30개 힌트 전략 퍼즐 — SudokuSync",
      description:
        "30개의 힌트로 시작하는 무료 어려움 스도쿠에 도전하세요. 포인팅 페어와 네이키드·히든 페어로 0-Single 막힘 구간을 논리적으로 돌파하세요.",
      h1: "어려움 스도쿠 온라인 플레이 — 30개 힌트 전략 퍼즐",
      badgeLabel: "초기 힌트 30개 • 빈 칸 51개",
      targetAudience: "숙련자 및 논리 분석형 플레이어",
      primaryTechniques: [
        "0-Single 막힘 돌파",
        "포인팅 페어(Pointing Pairs) 소거법",
        "네이키드 및 히든 페어",
      ],
      leadSummary:
        "어려움(Hard) 스도쿠는 시작 힌트가 30개(빈 칸 51개)로 줄어들며, 단순 스캔이 완전히 멈추는 '0-Single 막힘' 구간을 의도적으로 만들어 냅니다. 꼼꼼한 후보 메모와 포인팅 페어, 네이키드·히든 페어가 돌파의 열쇠입니다.",
      strategyHeading: "포인팅 페어와 네이키드·히든 페어로 30개 힌트 막힘 돌파하기",
      strategyParagraphs: [
        "30개 힌트 보드에서는 눈에 보이는 싱글이 빠르게 소진되며 바로 풀리는 칸이 없는 0-Single 막힘에 부딪힙니다. 메모 모드를 켜고 후보를 정리한 뒤 포인팅 페어를 찾으세요. 하나의 3x3 박스 안에서 특정 숫자가 같은 가로줄 또는 세로줄에만 놓이면, 박스 밖의 해당 줄에서 그 후보를 모두 지울 수 있습니다.",
        "이어서 같은 영역 내 두 칸에만 묶이는 네이키드 페어와 히든 페어를 포착해 불필요한 후보를 제거하면 막혀 있던 싱글들이 연쇄적으로 열립니다.",
      ],
      tipsHeading: "어려움 보드 공략 체크리스트",
      tips: [
        "스캔이 0-Single 벽에 막히는 즉시 빽빽한 행과 박스부터 후보 메모를 빠짐없이 채우세요.",
        "포인팅 페어와 네이키드·히든 페어를 함께 쓰면 몇 개의 메모만 지워도 막힌 구간이 풀립니다.",
        "절대 추측하지 마세요. 모든 30개 힌트 퍼즐은 유일해 및 순수 논리 풀이가 검증되어 있습니다.",
      ],
      faqs: [
        {
          q: "SudokuSync 어려움 스도쿠에는 힌트가 몇 개인가요?",
          a: "초기 힌트 30개와 빈 칸 51개로 구성되며, 포인팅 페어와 네이키드·히든 페어로 0-Single 막힘을 풀도록 설계되어 있습니다.",
        },
        {
          q: "어려움 단계에서 찍어서 풀어야 하는 경우가 있나요?",
          a: "없습니다. 모든 30개 힌트 보드는 유일해 검증을 통과해 100% 논리만으로 풀 수 있습니다.",
        },
      ],
      crossLinkLabel: "어려움 스도쿠",
      crossLinkSub: "힌트 30개 • 페어 & 포인팅",
    },
    EXPERT: {
      title: "무료 전문가 스도쿠 온라인 | 25개 힌트 스카이스크래퍼 & 체인 — SudokuSync",
      description:
        "단 25개의 힌트로 시작하는 무료 전문가(Expert) 스도쿠! 스카이스크래퍼, 2-String Kite, 고급 체인으로 엄격한 숫자 희소성(Digit Starvation)을 정복하세요.",
      h1: "전문가 스도쿠 온라인 플레이 — 25개 힌트 고급 체인 퍼즐",
      badgeLabel: "초기 힌트 25개 • 빈 칸 56개",
      targetAudience: "고급 전략가 및 기록 경쟁 플레이어",
      primaryTechniques: [
        "스카이스크래퍼(Skyscraper) & 2-String Kite",
        "엄격한 숫자 희소성(Digit Starvation) 추적",
        "고급 강링크 체인(Advanced Chains)",
      ],
      leadSummary:
        "전문가(Expert) 스도쿠는 엄격한 숫자 희소성(Strict Digit Starvation) 아래 단 25개의 초기 힌트와 56개의 빈 칸만 남긴 최상위 난이도입니다. 스카이스크래퍼, 2-String Kite, 고급 체인 추론이 승패를 가릅니다.",
      strategyHeading: "스카이스크래퍼·2-String Kite·고급 체인으로 25개 힌트 돌파하기",
      strategyParagraphs: [
        "힌트가 25개뿐이고 숫자 분포까지 엄격히 제한(Digit Starvation)된 보드에서는 기본 페어만으로는 금세 멈추게 됩니다. 숫자를 하나씩 필터링하며 스카이스크래퍼나 2-String Kite를 찾으세요. 두 행·열 또는 공통 3x3 박스를 잇는 강한 쌍을 연결하면 양쪽 끝과 겹치는 칸에서 해당 후보를 논리적으로 제거할 수 있습니다.",
        "스카이스크래퍼나 2-String Kite로 희소한 숫자의 물꼬를 튼 뒤에는 고급 체인과 잠긴 후보를 연결해 3실수 제한 안에서 보드를 깔끔하게 마무리하세요.",
      ],
      tipsHeading: "전문가 보드 공략 체크리스트",
      tips: [
        "숫자 키패드로 한 숫자씩 강조해 희소한 숫자의 스카이스크래퍼 및 2-String Kite 연결을 한눈에 파악하세요.",
        "추측 대신 행·열·박스를 잇는 이지선다(강한 링크)를 이어 고급 체인을 구성하세요.",
        "25개 보드에서는 성급한 터치보다 체인 양 끝점을 확인해 3실수 제한을 지키는 것이 핵심입니다.",
      ],
      faqs: [
        {
          q: "25개 힌트 전문가 스도쿠는 얼마나 어려운가요?",
          a: "Strict Digit Starvation이 적용된 25개 힌트·56개 빈 칸 보드로, 스카이스크래퍼, 2-String Kite, 고급 체인 기법이 요구됩니다.",
        },
        {
          q: "실수 무제한 설정이나 추가 힌트를 써도 최고 기록에 반영되나요?",
          a: "아니요. 공정한 기록 경쟁을 위해 개인 최고 기록(Personal Best)은 기본 3실수 제한 및 허용 힌트 규칙 내에서만 인정됩니다.",
        },
      ],
      crossLinkLabel: "전문가 스도쿠",
      crossLinkSub: "힌트 25개 • 체인 & 카이트",
    },
  },
  es: {
    EASY: {
      title: "Jugar Sudoku Fácil Online Gratis | 51 Pistas — SudokuSync",
      description:
        "Resuelve puzzles de Sudoku Fácil gratis con 51 pistas iniciales. Domina la técnica de escaneo (Cross-Hatching) o compite en vivo con tus amigos.",
      h1: "Jugar Sudoku Fácil Online — Puzzles Gratis de 51 Pistas",
      badgeLabel: "51 Pistas • 30 Casillas Vacías",
      targetAudience: "Principiantes, Calentamiento y Velocidad",
      primaryTechniques: [
        "Técnica de Escaneo (Cross-Hatching)",
        "Eliminación por Caja y Línea",
        "Conteo de Dígitos Frecuentes",
      ],
      leadSummary:
        "Los tableros de Sudoku Fácil en SudokuSync comienzan con 51 pistas verificadas y solo 30 casillas vacías. Cada región 3x3 ofrece suficientes referencias para avanzar con pura lógica sin adivinar jamás.",
      strategyHeading: "Cómo dominar el Sudoku Fácil de 51 pistas con Escaneo",
      strategyParagraphs: [
        "Con 51 pistas iniciales en la cuadrícula 9x9, la mayoría de las cajas 3x3 ya tienen cinco o seis números. Empieza aplicando la técnica de escaneo sobre los dígitos más repetidos: cruza filas y columnas vecinas para aislar la única casilla libre en cada bloque.",
        "Combina el escaneo con cierres rápidos de filas o bloques casi llenos para mejorar tu fluidez y marcar nuevos récords personales.",
      ],
      tipsHeading: "Lista táctica para tableros Fáciles",
      tips: [
        "Prioriza los números que más aparecen: completar un dígito despeja visualmente todo el tablero.",
        "Activa el modo Relleno Rápido (Pincel) con el icono del rayo para colocar aciertos obvios al instante.",
        "Practica con el límite de 3 errores para consolidar precisión antes de pasar a Medio o Difícil.",
      ],
      faqs: [
        {
          q: "¿Cuántas pistas iniciales tiene un Sudoku Fácil?",
          a: "Cada tablero Fácil en SudokuSync incluye exactamente 51 pistas fijas y 30 casillas vacías con solución única verificada.",
        },
        {
          q: "¿Necesito usar Notas de lápiz en Sudoku Fácil?",
          a: "Normalmente no. Casi todas las casillas en un tablero de 51 pistas se resuelven mediante escaneo visual y eliminación directa.",
        },
      ],
      crossLinkLabel: "Sudoku Fácil",
      crossLinkSub: "51 Pistas • Escaneo",
    },
    MEDIUM: {
      title: "Jugar Sudoku Medio Online Gratis | 41 Pistas — SudokuSync",
      description:
        "Juega Sudoku Medio gratis con 41 pistas iniciales en SudokuSync. Practica Eliminación y Sencillos Desnudos (Naked Singles) o reta a amigos con un enlace.",
      h1: "Jugar Sudoku Medio Online — Retos Diarios de 41 Pistas",
      badgeLabel: "41 Pistas • 40 Casillas Vacías",
      targetAudience: "Jugadores Intermedios y Práctica Diaria",
      primaryTechniques: [
        "Eliminación Línea-a-Caja",
        "Sencillos Desnudos (Naked Singles)",
        "Notas Selectivas de Candidatos",
      ],
      leadSummary:
        "El Sudoku Medio presenta 41 pistas iniciales y 40 casillas vacías, trasladando el foco hacia la eliminación cruzada y los Sencillos Desnudos. Es el nivel ideal para entrenar la mente cada día o competir en carreras equilibradas.",
      strategyHeading: "Resolver tableros Medios de 41 pistas con Eliminación y Singles",
      strategyParagraphs: [
        "Cuando el escaneo directo se detenga en un tablero de 41 pistas, busca intersecciones donde una casilla comparta fila, columna y caja con siete u ocho dígitos distintos. Si ocho dígitos quedan descartados, el único restante es un Sencillo Desnudo.",
        "Si las dos únicas posiciones posibles de un número en una caja 3x3 coinciden en la misma fila o columna, elimínalo del resto de esa línea fuera de la caja.",
      ],
      tipsHeading: "Lista táctica para tableros Medios",
      tips: [
        "Usa notación Snyder en tus notas: apunta un candidato dentro de una caja solo cuando quepa en dos celdas.",
        "Mantén activado Auto-Eliminar Notas para limpiar candidatos antiguos al confirmar un número.",
        "Busca Sencillos Desnudos en las intersecciones más pobladas cuando falten jugadas directas.",
      ],
      faqs: [
        {
          q: "¿Qué hace más difícil al Sudoku Medio que al Fácil?",
          a: "Pasar de 51 a 41 pistas aumenta a 40 los espacios vacíos, exigiendo combinar escaneo con Eliminación y Sencillos Desnudos.",
        },
        {
          q: "¿Las salas multijugador en Medio muestran el mismo tablero?",
          a: "Sí. Todas las salas usan una semilla determinista para que cada jugador resuelva exactamente la misma cuadrícula de 41 pistas.",
        },
      ],
      crossLinkLabel: "Sudoku Medio",
      crossLinkSub: "41 Pistas • Singles",
    },
    HARD: {
      title: "Jugar Sudoku Difícil Online Gratis | 30 Pistas — SudokuSync",
      description:
        "Ponte a prueba con Sudoku Difícil gratis de 30 pistas. Rompe bloqueos 0-Single con Pointing Pairs, Pares Desnudos y Ocultos y notas precisas.",
      h1: "Jugar Sudoku Difícil Online — Desafíos de 30 Pistas",
      badgeLabel: "30 Pistas • 51 Casillas Vacías",
      targetAudience: "Jugadores Experimentados y Analíticos",
      primaryTechniques: [
        "Superar Bloqueos 0-Single",
        "Pointing Pairs (Pares Apuntadores)",
        "Pares Desnudos y Ocultos",
      ],
      leadSummary:
        "El Sudoku Difícil reduce las pistas iniciales a 30 (con 51 casillas vacías), generando bloqueos 0-Single donde el escaneo básico se detiene por completo. Avanzar exige notas disciplinadas, Pointing Pairs y Pares Desnudos u Ocultos.",
      strategyHeading: "Romper bloqueos 0-Single de 30 pistas con Pointing, Pares Desnudos y Ocultos",
      strategyParagraphs: [
        "En un tablero de 30 pistas, los Singles superficiales desaparecen pronto y dejan el tablero en un bloqueo 0-Single sin jugadas inmediatas. Activa el modo Notas y detecta Pointing Pairs: si un candidato en una caja 3x3 solo cabe en una misma fila o columna, puedes borrarlo del resto de esa línea fuera de la caja.",
        "Combina Pointing Pairs con Pares Desnudos y Pares Ocultos—dos números restringidos exclusivamente a dos casillas de una unidad—para limpiar candidatos rivales y destapar nuevos Singles.",
      ],
      tipsHeading: "Lista táctica para tableros Difíciles",
      tips: [
        "Completa notas de candidatos en las filas y cajas más densas en cuanto el escaneo choque contra un bloqueo 0-Single.",
        "Combina Pointing Pairs con Pares Desnudos y Ocultos: despejar solo dos marcas extra desbloquea líneas enteras.",
        "Nunca adivines: cada tablero Difícil de 30 pistas está verificado para resolverse con pura lógica y solución única.",
      ],
      faqs: [
        {
          q: "¿Cuántas pistas tiene el Sudoku Difícil en SudokuSync?",
          a: "Contiene 30 pistas iniciales y 51 casillas vacías, diseñadas para provocar bloqueos 0-Single resueltos con Pointing Pairs y Pares Desnudos u Ocultos.",
        },
        {
          q: "¿Es necesario tantear por prueba y error en Difícil?",
          a: "Nunca. Cada puzzle de 30 pistas supera la verificación matemática de unicidad y lógica humana antes de mostrarse.",
        },
      ],
      crossLinkLabel: "Sudoku Difícil",
      crossLinkSub: "30 Pistas • Pares y Pointing",
    },
    EXPERT: {
      title: "Jugar Sudoku Experto Online Gratis | 25 Pistas, Skyscraper y Cadenas — SudokuSync",
      description:
        "Demuestra tu maestría en Sudoku Experto gratis de 25 pistas. Vence la Escasez Estricta de Dígitos (Digit Starvation) con Skyscraper, 2-String Kite y Cadenas Avanzadas.",
      h1: "Jugar Sudoku Experto Online — Retos de 25 Pistas y Cadenas Avanzadas",
      badgeLabel: "25 Pistas • 56 Casillas Vacías",
      targetAudience: "Tácticos Avanzados y Competidores",
      primaryTechniques: [
        "Skyscraper y 2-String Kite",
        "Escasez Estricta de Dígitos (Digit Starvation)",
        "Cadenas Avanzadas de Pares Conjugados",
      ],
      leadSummary:
        "El modo Experto reduce el tablero a apenas 25 pistas iniciales y 56 casillas vacías bajo Escasez Estricta de Dígitos (Digit Starvation). Diseñado para estrategas, exige Skyscraper, 2-String Kite y Cadenas Avanzadas.",
      strategyHeading: "Superar la escasez de 25 pistas con Skyscraper, 2-String Kite y Cadenas",
      strategyParagraphs: [
        "Con solo 25 dígitos iniciales y Digit Starvation limitando los números fáciles, las parejas simples pronto se agotan. Filtra un dígito cada vez para trazar un Skyscraper o un 2-String Kite: enlaza pares fuertes entre dos filas, columnas o una caja compartida para eliminar con seguridad ese candidato de cualquier celda que vea ambos extremos.",
        "Cuando un Skyscraper o 2-String Kite abra paso en un dígito escaso, apoya el cierre con Cadenas Avanzadas y candidatos bloqueados manteniendo intacto tu límite de 3 errores.",
      ],
      tipsHeading: "Lista táctica para tableros Expertos",
      tips: [
        "Pulsa un dígito en el teclado para aislar números escasos y visualizar enlaces de Skyscraper o 2-String Kite.",
        "Une enlaces fuertes entre filas, columnas y cajas para formar Cadenas Avanzadas en lugar de improvisar.",
        "Con 25 pistas y regla de 3 errores, comprobar los extremos de cada cadena siempre vence a la prisa.",
      ],
      faqs: [
        {
          q: "¿Qué tan exigente es el modo Experto de 25 pistas en SudokuSync?",
          a: "Empieza con solo 25 pistas y 56 casillas vacías bajo Escasez Estricta de Dígitos, diseñado para requerir Skyscraper, 2-String Kite y Cadenas Avanzadas.",
        },
        {
          q: "¿Cuentan los récords personales con errores ilimitados o pistas extra?",
          a: "No. Los récords personales exigen el límite oficial de 3 errores y juego limpio en pistas.",
        },
      ],
      crossLinkLabel: "Sudoku Experto",
      crossLinkSub: "25 Pistas • Cadenas y Kite",
    },
  },
  fr: {
    EASY: {
      title: "Jouer au Sudoku Facile Gratuit en Ligne | 51 Indices — SudokuSync",
      description:
        "Résolvez gratuitement nos grilles de Sudoku Facile avec 51 indices de départ. Maîtrisez la technique de balayage (Cross-Hatching) ou défiez vos amis.",
      h1: "Jouer au Sudoku Facile en Ligne — Grilles Gratuites à 51 Indices",
      badgeLabel: "51 Indices • 30 Cases Vides",
      targetAudience: "Débutants, Échauffement & Vitesse",
      primaryTechniques: [
        "Technique de Balayage (Cross-Hatching)",
        "Élimination par Bloc et Ligne",
        "Comptage des Chiffres Fréquents",
      ],
      leadSummary:
        "Les grilles Faciles sur SudokuSync démarrent avec 51 indices vérifiés et seulement 30 cases vides. Chaque bloc 3x3 offre suffisamment de repères pour avancer par pure déduction sans jamais deviner.",
      strategyHeading: "Maîtriser le Sudoku Facile à 51 indices par Balayage",
      strategyParagraphs: [
        "Avec 51 indices sur la grille 9x9, la majorité des blocs contiennent déjà cinq ou six chiffres. Commencez par la technique de balayage sur les chiffres les plus présents : croisez lignes et colonnes voisines pour isoler l'unique case libre.",
        "Complétez ensuite les lignes, colonnes ou blocs où il ne manque qu'un ou deux chiffres afin d'accélérer votre rythme vers un record personnel.",
      ],
      tipsHeading: "Checklist tactique pour grilles Faciles",
      tips: [
        "Ciblez d'abord les chiffres les plus fréquents pour alléger rapidement la lecture de la grille.",
        "Activez le mode Remplissage Rapide (Pinceau) via le bouton éclair pour poser les évidences en série.",
        "Entraînez-vous avec la limite de 3 erreurs pour acquérir des réflexes fiables avant le niveau Moyen.",
      ],
      faqs: [
        {
          q: "Combien d'indices contient une grille de Sudoku Facile ?",
          a: "Chaque grille Facile sur SudokuSync commence avec 51 indices fixes et 30 cases vides, garantis à solution unique.",
        },
        {
          q: "Les notes au crayon sont-elles nécessaires en Facile ?",
          a: "Généralement non. Presque toutes les cases d'une grille à 51 indices se résolvent grâce au balayage visuel et à l'élimination simple.",
        },
      ],
      crossLinkLabel: "Sudoku Facile",
      crossLinkSub: "51 Indices • Balayage",
    },
    MEDIUM: {
      title: "Jouer au Sudoku Moyen Gratuit en Ligne | 41 Indices — SudokuSync",
      description:
        "Jouez au Sudoku Moyen gratuit avec 41 indices sur SudokuSync. Pratiquez l'élimination et les Singletons Nus, ou affrontez vos amis en temps réel.",
      h1: "Jouer au Sudoku Moyen en Ligne — Grilles Quotidiennes à 41 Indices",
      badgeLabel: "41 Indices • 40 Cases Vides",
      targetAudience: "Joueurs Intermédiaires & Entraînement Quotidien",
      primaryTechniques: [
        "Élimination Ligne-Bloc",
        "Singletons Nus (Naked Singles)",
        "Notes Sélectives de Candidats",
      ],
      leadSummary:
        "Le niveau Moyen propose 41 indices et 40 cases vides, déplaçant l'effort vers l'élimination croisée et les Singletons Nus. C'est le format idéal pour l'entraînement quotidien et les duels équilibrés.",
      strategyHeading: "Résoudre les grilles Moyennes à 41 indices",
      strategyParagraphs: [
        "Lorsque le balayage direct ralentit sur une grille à 41 indices, examinez les intersections où ligne, colonne et bloc réunissent sept ou huit chiffres distincts. Si huit chiffres sont exclus, le dernier candidat est un Singleton Nu.",
        "Si un chiffre n'a que deux emplacements possibles dans un bloc et qu'ils sont alignés sur une même ligne ou colonne, éliminez-le du reste de cette ligne hors du bloc.",
      ],
      tipsHeading: "Checklist tactique pour grilles Moyennes",
      tips: [
        "Utilisez la notation Snyder : ne notez un candidat dans un bloc 3x3 que s'il tient dans deux cases.",
        "Gardez l'option Suppression Auto des Notes active pour nettoyer vos candidats à chaque placement validé.",
        "Cherchez les Singletons Nus aux croisements denses dès que le balayage direct marque une pause.",
      ],
      faqs: [
        {
          q: "Pourquoi le niveau Moyen est-il plus exigeant que Facile ?",
          a: "En passant de 51 à 41 indices (40 cases vides), le balayage seul ne suffit plus et demande élimination croisée et Singletons Nus.",
        },
        {
          q: "En multijoueur Moyen, les joueurs ont-ils la même grille ?",
          a: "Oui. Chaque salon utilise une graine unique générant exactement le même plateau à 41 indices pour tous les participants.",
        },
      ],
      crossLinkLabel: "Sudoku Moyen",
      crossLinkSub: "41 Indices • Singles",
    },
    HARD: {
      title: "Jouer au Sudoku Difficile Gratuit en Ligne | 30 Indices — SudokuSync",
      description:
        "Relevez le défi du Sudoku Difficile gratuit à 30 indices sur SudokuSync. Débloquez les impasses 0-Single grâce aux Pointing Pairs et aux Paires Nues et Cachées.",
      h1: "Jouer au Sudoku Difficile en Ligne — Grilles Stratégiques à 30 Indices",
      badgeLabel: "30 Indices • 51 Cases Vides",
      targetAudience: "Joueurs Expérimentés & Analystes",
      primaryTechniques: [
        "Franchir les Impasses 0-Single",
        "Paires Pointantes (Pointing Pairs)",
        "Paires Nues et Cachées",
      ],
      leadSummary:
        "Le Sudoku Difficile descend à 30 indices initiaux pour 51 cases vides, créant volontairement des impasses 0-Single où le balayage rapide s'arrête net. La progression passe par les notes de candidats, les Pointing Pairs et les Paires Nues et Cachées.",
      strategyHeading: "Débloquer les impasses 0-Single à 30 indices",
      strategyParagraphs: [
        "Sur une grille à 30 indices, les singletons apparents disparaissent vite et laissent place à une impasse 0-Single sans coup immédiat. Activez le mode Notes pour repérer les Pointing Pairs : lorsqu'un candidat d'un bloc 3x3 ne figure que sur une seule ligne ou colonne, rayez-le du reste de cette ligne hors du bloc.",
        "Enchaînez avec les Paires Nues et les Paires Cachées—deux chiffres cantonnés aux deux mêmes cases d'une unité—pour écarter les candidats parasites et rouvrir de nouveaux coups sûrs.",
      ],
      tipsHeading: "Checklist tactique pour grilles Difficiles",
      tips: [
        "Remplissez vos notes dans les lignes et blocs denses dès que le balayage heurte une impasse 0-Single.",
        "Combinez Pointing Pairs, Paires Nues et Paires Cachées : deux candidats rayés suffisent souvent à relancer toute une bande.",
        "Ne devinez jamais : chaque grille Difficile à 30 indices est certifiée à solution logique unique.",
      ],
      faqs: [
        {
          q: "Combien d'indices possède une grille Difficile sur SudokuSync ?",
          a: "Les grilles Difficiles démarrent avec 30 indices et 51 cases vides, conçues pour provoquer des impasses 0-Single résolues par Pointing Pairs et Paires Nues et Cachées.",
        },
        {
          q: "Faut-il procéder par hypothèses hasardeuses en Difficile ?",
          a: "Jamais. Chaque grille à 30 indices est mathématiquement vérifiée pour son unicité et sa résolution logique.",
        },
      ],
      crossLinkLabel: "Sudoku Difficile",
      crossLinkSub: "30 Indices • Paires & Pointing",
    },
    EXPERT: {
      title: "Jouer au Sudoku Expert Gratuit en Ligne | 25 Indices, Skyscraper & Chaînes — SudokuSync",
      description:
        "Testez votre maîtrise sur nos grilles Expert gratuites à 25 indices. Surmontez la Rareté Stricte des Chiffres (Digit Starvation) avec Skyscraper, 2-String Kite et Chaînes Avancées.",
      h1: "Jouer au Sudoku Expert en Ligne — Défis Skyscraper & Chaînes à 25 Indices",
      badgeLabel: "25 Indices • 56 Cases Vides",
      targetAudience: "Tacticiens Avancés & Compétiteurs",
      primaryTechniques: [
        "Skyscraper & 2-String Kite",
        "Rareté Stricte (Strict Digit Starvation)",
        "Chaînes Avancées de Paires Fortes",
      ],
      leadSummary:
        "Le mode Expert réduit la grille à seulement 25 indices de départ et 56 cases vides sous Rareté Stricte des Chiffres (Strict Digit Starvation). Conçu pour les spécialistes, il exige le Skyscraper, le 2-String Kite et les Chaînes Avancées.",
      strategyHeading: "Dompter la rareté à 25 indices avec Skyscraper, 2-String Kite et Chaînes",
      strategyParagraphs: [
        "Avec seulement 25 chiffres initiaux et la Digit Starvation qui raréfie les repères faciles, les paires simples s'épuisent rapidement. Filtrez un chiffre à la fois pour tracer un Skyscraper ou un 2-String Kite : reliez des paires fortes entre deux lignes, colonnes ou un bloc commun afin d'éliminer ce candidat de toute case voyant les deux extrémités.",
        "Dès qu'un Skyscraper ou un 2-String Kite libère un chiffre rare, appuyez-vous sur les Chaînes Avancées et les candidats verrouillés pour boucler la grille sans risquer la limite des 3 erreurs.",
      ],
      tipsHeading: "Checklist tactique pour grilles Expert",
      tips: [
        "Sélectionnez chaque chiffre au clavier pour isoler les candidats rares et visualiser les liens Skyscraper ou 2-String Kite.",
        "Reliez les liens forts entre lignes, colonnes et blocs pour bâtir des Chaînes Avancées au lieu de deviner.",
        "Sous la règle des 3 erreurs, vérifier les deux extrémités d'une chaîne prime sur la précipitation sur 25 indices.",
      ],
      faqs: [
        {
          q: "Quelle est la difficulté réelle du niveau Expert à 25 indices sur SudokuSync ?",
          a: "Les grilles Expert n'offrent que 25 indices et 56 cases vides sous Rareté Stricte des Chiffres, exigeant Skyscraper, 2-String Kite et Chaînes Avancées.",
        },
        {
          q: "Les records personnels sont-ils comptés avec erreurs illimitées ou indices bonus ?",
          a: "Non. Les records exigent l'activation stricte de la limite de 3 erreurs et le respect du plafond d'indices.",
        },
      ],
      crossLinkLabel: "Sudoku Expert",
      crossLinkSub: "25 Indices • Chaînes & Kite",
    },
  },
  it: {
    EASY: {
      title: "Gioca a Sudoku Facile Online Gratis | 51 Indizi — SudokuSync",
      description:
        "Risolvi schemi di Sudoku Facile gratis con 51 indizi iniziali. Padroneggia la tecnica di scansione (Cross-Hatching) o sfida gli amici in diretta.",
      h1: "Gioca a Sudoku Facile Online — Schemi Gratis da 51 Indizi",
      badgeLabel: "51 Indizi • 30 Celle Vuote",
      targetAudience: "Principianti, Riscaldamento & Speedrun",
      primaryTechniques: [
        "Tecnica di Scansione (Cross-Hatching)",
        "Eliminazione per Riquadro e Linea",
        "Conteggio Cifre Frequenti",
      ],
      leadSummary:
        "Gli schemi Facili su SudokuSync partono con 51 indizi verificati e solo 30 celle vuote, offrendo riferimenti chiari in ogni riquadro 3x3 per avanzare con pura deduzione logica senza mai tirare a indovinare.",
      strategyHeading: "Come padroneggiare il Sudoku Facile da 51 indizi con la Scansione",
      strategyParagraphs: [
        "Con 51 cifre iniziali nella griglia 9x9, gran parte dei riquadri 3x3 contiene già cinque o sei indizi. Inizia con la tecnica di scansione sui numeri più frequenti: incrocia righe e colonne adiacenti per isolare l'unica cella libera.",
        "Abbina la scansione alla chiusura rapida di righe o riquadri quasi completi per migliorare i tuoi tempi record personali.",
      ],
      tipsHeading: "Checklist tattica per griglie Facili",
      tips: [
        "Concentrati prima sui numeri già più presenti per liberare visivamente l'intero schema.",
        "Attiva la modalità Riempimento Rapido (Pennello) dal pulsante fulmine per inserire subito le cifre evidenti.",
        "Allenati con il limite di 3 errori per sviluppare precisione prima di passare a Medio o Difficile.",
      ],
      faqs: [
        {
          q: "Quanti indizi iniziali ci sono nel Sudoku Facile?",
          a: "Ogni schema Facile su SudokuSync parte con esattamente 51 indizi fissi e 30 celle vuote con una sola soluzione valida.",
        },
        {
          q: "Servono le Note a matita per il Sudoku Facile?",
          a: "Di solito no. Quasi tutte le celle di uno schema da 51 indizi si risolvono con scansione visiva ed eliminazione diretta.",
        },
      ],
      crossLinkLabel: "Sudoku Facile",
      crossLinkSub: "51 Indizi • Scansione",
    },
    MEDIUM: {
      title: "Gioca a Sudoku Medio Online Gratis | 41 Indizi — SudokuSync",
      description:
        "Gioca a Sudoku Medio gratis con 41 indizi su SudokuSync. Esercitati con Eliminazione e Singoli Nudi, usa note smart o sfida gli amici via link.",
      h1: "Gioca a Sudoku Medio Online — Schemi Quotidiani da 41 Indizi",
      badgeLabel: "41 Indizi • 40 Celle Vuote",
      targetAudience: "Giocatori Intermedi & Allenamento Quotidiano",
      primaryTechniques: [
        "Eliminazione Linea-Riquadro",
        "Deduzione Singoli Nudi (Naked Singles)",
        "Note Selettive dei Candidati",
      ],
      leadSummary:
        "Il Sudoku Medio introduce 41 indizi iniziali e 40 caselle vuote, spostando l'equilibrio verso l'eliminazione incrociata e i Singoli Nudi. Perfetto per mantenere la mente attiva ogni giorno o per sfide equilibrate.",
      strategyHeading: "Risolvere schemi Medi da 41 indizi con Eliminazione e Singoli",
      strategyParagraphs: [
        "Quando la scansione diretta rallenta su una griglia da 41 indizi, osserva gli incroci in cui una cella condivide riga, colonna e riquadro con sette o otto cifre distinte: l'unica cifra mancante è un Singolo Nudo.",
        "Se in un riquadro 3x3 le sole due posizioni possibili di un numero giacciono sulla stessa riga o colonna, puoi escluderlo dal resto di quella linea fuori dal riquadro.",
      ],
      tipsHeading: "Checklist tattica per griglie Medie",
      tips: [
        "Annota con criterio (notazione Snyder): segna un candidato nel riquadro solo se entra in due celle.",
        "Lascia attiva la Rimozione Automatica delle Note per mantenere pulito il quadro dei candidati.",
        "Cerca Singoli Nudi negli incroci più ricchi di cifre quando la scansione si ferma.",
      ],
      faqs: [
        {
          q: "Perché il Sudoku Medio è più impegnativo del Facile?",
          a: "Scendere da 51 a 41 indizi porta le celle vuote a 40, richiedendo eliminazione incrociata e Singoli Nudi oltre alla scansione.",
        },
        {
          q: "In modalità multiplayer Medio tutti ricevono lo stesso schema?",
          a: "Sì. Ogni stanza usa un seed univoco così ogni giocatore affronta esattamente la stessa griglia da 41 indizi.",
        },
      ],
      crossLinkLabel: "Sudoku Medio",
      crossLinkSub: "41 Indizi • Singoli",
    },
    HARD: {
      title: "Gioca a Sudoku Difficile Online Gratis | 30 Indizi — SudokuSync",
      description:
        "Mettiti alla prova con il Sudoku Difficile gratis da 30 indizi su SudokuSync. Supera i blocchi 0-Single con Pointing Pairs, Coppie Nude e Nascoste e note precise.",
      h1: "Gioca a Sudoku Difficile Online — Schemi Strategici da 30 Indizi",
      badgeLabel: "30 Indizi • 51 Celle Vuote",
      targetAudience: "Giocatori Esperti & Analitici",
      primaryTechniques: [
        "Superamento Blocchi 0-Single",
        "Pointing Pairs (Coppie Puntanti)",
        "Coppie Nude e Nascoste",
      ],
      leadSummary:
        "Il Sudoku Difficile riduce gli indizi a 30 lasciando 51 celle vuote, creando intenzionalmente blocchi 0-Single in cui la scansione diretta si ferma. Per ripartire servono note ordinate, Pointing Pairs e Coppie Nude o Nascoste.",
      strategyHeading: "Sbloccare gli schemi 0-Single da 30 indizi con Pointing, Coppie Nude e Nascoste",
      strategyParagraphs: [
        "Su una griglia da 30 indizi i Singoli immediati spariscono presto, lasciando uno stallo 0-Single senza mosse dirette. Attiva le Note e cerca le Pointing Pairs: se un candidato in un riquadro 3x3 compare solo su una riga o colonna, puoi eliminarlo dal resto di quella linea fuori dal riquadro.",
        "Abbina poi Coppie Nude e Coppie Nascoste—due cifre confinate esclusivamente alle stesse due celle di un'unità—per scartare gli altri candidati e far emergere nuovi Singoli.",
      ],
      tipsHeading: "Checklist tattica per griglie Difficili",
      tips: [
        "Compila note complete nelle righe e nei riquadri più densi appena la scansione incontra un blocco 0-Single.",
        "Unisci Pointing Pairs, Coppie Nude e Coppie Nascoste: cancellare due candidati extra riapre intere fasce.",
        "Mai indovinare: ogni griglia Difficile da 30 indizi è verificata per avere un'unica soluzione logica.",
      ],
      faqs: [
        {
          q: "Quanti indizi ha il Sudoku Difficile su SudokuSync?",
          a: "Gli schemi Difficili offrono 30 indizi iniziali e 51 celle vuote, progettati per creare blocchi 0-Single risolvibili con Pointing Pairs e Coppie Nude o Nascoste.",
        },
        {
          q: "Serve mai procedere per tentativi nel livello Difficile?",
          a: "Mai. Ogni griglia da 30 indizi supera la verifica matematica di unicità e logica umana.",
        },
      ],
      crossLinkLabel: "Sudoku Difficile",
      crossLinkSub: "30 Indizi • Coppie & Pointing",
    },
    EXPERT: {
      title: "Gioca a Sudoku Esperto Online Gratis | 25 Indizi, Skyscraper & Catene — SudokuSync",
      description:
        "Dimostra la tua abilità sul Sudoku Esperto gratis da 25 indizi. Domina la Scarsità Rigorosa di Cifre (Digit Starvation) con Skyscraper, 2-String Kite e Catene Avanzate.",
      h1: "Gioca a Sudoku Esperto Online — Sfide Skyscraper & Catene da 25 Indizi",
      badgeLabel: "25 Indizi • 56 Celle Vuote",
      targetAudience: "Tattici Avanzati & Giocatori Competitivi",
      primaryTechniques: [
        "Skyscraper & 2-String Kite",
        "Scarsità Rigorosa di Cifre (Digit Starvation)",
        "Catene Avanzate di Coppie Forti",
      ],
      leadSummary:
        "Il livello Esperto scende a soli 25 indizi iniziali e 56 celle vuote con Scarsità Rigorosa di Cifre (Strict Digit Starvation). Creato per esperti, richiede Skyscraper, 2-String Kite e Catene Avanzate.",
      strategyHeading: "Superare schemi Esperto da 25 indizi con Skyscraper, 2-String Kite e Catene",
      strategyParagraphs: [
        "Con soli 25 indizi e la Digit Starvation che limita i numeri facili, le coppie semplici si esauriscono presto. Filtra una cifra alla volta cercando uno Skyscraper o un 2-String Kite: collega coppie forti tra due righe, colonne o un riquadro condiviso per eliminare quel candidato da qualsiasi cella che veda entrambi gli estremi.",
        "Quando uno Skyscraper o un 2-String Kite sblocca una cifra scarsa, sfrutta le Catene Avanzate e i candidati bloccati per chiudere lo schema rispettando il limite di 3 errori.",
      ],
      tipsHeading: "Checklist tattica per griglie Esperto",
      tips: [
        "Tocca una cifra sul tastierino per isolare i numeri più scarsi e individuare facilmente i collegamenti Skyscraper o 2-String Kite.",
        "Collega coppie forti tra righe, colonne e riquadri per costruire Catene Avanzate invece di tirare a indovinare.",
        "Con il limite di 3 errori su schemi da 25 indizi, verificare gli estremi della catena batte sempre la fretta.",
      ],
      faqs: [
        {
          q: "Quanto è impegnativo uno schema Esperto da 25 indizi su SudokuSync?",
          a: "Parte con soli 25 indizi e 56 celle vuote sotto Strict Digit Starvation, richiedendo Skyscraper, 2-String Kite e Catene Avanzate.",
        },
        {
          q: "I record personali valgono con errori illimitati o aiuti extra?",
          a: "No. Per tutelare le classifiche, i record personali richiedono il limite di 3 errori e il rispetto delle regole sugli aiuti.",
        },
      ],
      crossLinkLabel: "Sudoku Esperto",
      crossLinkSub: "25 Indizi • Catene & Kite",
    },
  },
  "pt-BR": {
    EASY: {
      title: "Jogar Sudoku Fácil Online Grátis | 51 Pistas — SudokuSync",
      description:
        "Resolva quebra-cabeças de Sudoku Fácil grátis com 51 pistas iniciais. Domine a técnica de varredura (Cross-Hatching) ou desafie amigos ao vivo.",
      h1: "Jogar Sudoku Fácil Online — Tabuleiros Grátis com 51 Pistas",
      badgeLabel: "51 Pistas • 30 Células Vazias",
      targetAudience: "Iniciantes, Aquecimento & Velocidade",
      primaryTechniques: [
        "Técnica de Varredura (Cross-Hatching)",
        "Eliminação por Bloco e Linha",
        "Contagem de Dígitos Frequentes",
      ],
      leadSummary:
        "Os tabuleiros de Sudoku Fácil no SudokuSync começam com 51 pistas verificadas e apenas 30 espaços vazios, garantindo referências claras em cada bloco 3x3 para deduzir tudo sem chutar.",
      strategyHeading: "Como dominar o Sudoku Fácil de 51 pistas com Varredura",
      strategyParagraphs: [
        "Com 51 dígitos iniciais distribuídos na grade 9x9, quase todos os blocos 3x3 já possuem cinco ou seis pistas. Use a técnica de varredura nos números mais frequentes: cruze linhas e colunas adjacentes para isolar o único quadrado livre.",
        "Feche rapidamente linhas, colunas ou blocos com apenas uma ou duas casas restantes para ganhar ritmo e quebrar seu Recorde Pessoal.",
      ],
      tipsHeading: "Checklist tático para grades Fáceis",
      tips: [
        "Comece pelos números que mais aparecem—completar um dígito limpa visualmente todo o tabuleiro.",
        "Ative o modo Preenchimento Rápido (Pincel) pelo ícone de raio para preencher óbvios em sequência.",
        "Pratique com o limite de 3 erros para criar precisão antes de avançar para Médio ou Difícil.",
      ],
      faqs: [
        {
          q: "Quantas pistas iniciais tem um Sudoku Fácil?",
          a: "Cada Sudoku Fácil no SudokuSync começa com 51 pistas fixas e 30 células vazias, com solução única matematicamente comprovada.",
        },
        {
          q: "Preciso usar anotações a lápis no Sudoku Fácil?",
          a: "Geralmente não. Quase todas as casas de um tabuleiro de 51 pistas são resolvidas com varredura visual e eliminação direta.",
        },
      ],
      crossLinkLabel: "Sudoku Fácil",
      crossLinkSub: "51 Pistas • Varredura",
    },
    MEDIUM: {
      title: "Jogar Sudoku Médio Online Grátis | 41 Pistas — SudokuSync",
      description:
        "Jogue Sudoku Médio grátis com 41 pistas iniciais no SudokuSync. Pratique Eliminação e Únicos Nus (Naked Singles), use anotações ou corra contra amigos.",
      h1: "Jogar Sudoku Médio Online — Desafios Diários com 41 Pistas",
      badgeLabel: "41 Pistas • 40 Células Vazias",
      targetAudience: "Jogadores Intermediários & Treino Diário",
      primaryTechniques: [
        "Eliminação Linha-para-Bloco",
        "Únicos Nus (Naked Singles)",
        "Anotações Seletivas",
      ],
      leadSummary:
        "O Sudoku Médio traz 41 pistas e 40 espaços vazios, mudando o foco para eliminação cruzada e Únicos Nus. É o nível ideal para manter o raciocínio afiado diariamente e disputar partidas equilibradas.",
      strategyHeading: "Resolvendo grades Médias de 41 pistas com Eliminação e Singles",
      strategyParagraphs: [
        "Quando a varredura direta desacelerar em um tabuleiro de 41 pistas, procure interseções em que uma célula compartilhe linha, coluna e bloco com sete ou oito dígitos distintos. Se sobrar apenas um candidato possível, você encontrou um Único Nu.",
        "Quando um número cabe em apenas duas células de um bloco 3x3 alinhadas na mesma linha ou coluna, remova esse dígito do restante dessa linha fora do bloco.",
      ],
      tipsHeading: "Checklist tático para grades Médias",
      tips: [
        "Use a notação de Snyder: marque um candidato no bloco 3x3 apenas quando houver exatamente duas posições.",
        "Deixe a remoção automática de notas ativada para manter suas anotações sempre atualizadas.",
        "Procure Únicos Nus nos cruzamentos mais densos sempre que a varredura parar.",
      ],
      faqs: [
        {
          q: "O que torna o Sudoku Médio mais difícil que o Fácil?",
          a: "Reduzir de 51 para 41 pistas eleva as casas vazias para 40, exigindo combinar varredura com Eliminação e Únicos Nus.",
        },
        {
          q: "Em salas multijogador Médias todos jogam o mesmo tabuleiro?",
          a: "Sim. Cada sala usa uma semente idêntica para que todos resolvam exatamente a mesma grade de 41 pistas.",
        },
      ],
      crossLinkLabel: "Sudoku Médio",
      crossLinkSub: "41 Pistas • Singles",
    },
    HARD: {
      title: "Jogar Sudoku Difícil Online Grátis | 30 Pistas — SudokuSync",
      description:
        "Desafie-se no Sudoku Difícil grátis com 30 pistas no SudokuSync. Quebre bloqueios 0-Single com Pointing Pairs, Pares Nus e Ocultos e notas precisas.",
      h1: "Jogar Sudoku Difícil Online — Estratégia com 30 Pistas",
      badgeLabel: "30 Pistas • 51 Células Vazias",
      targetAudience: "Jogadores Experientes & Analíticos",
      primaryTechniques: [
        "Superar Bloqueios 0-Single",
        "Pointing Pairs (Pares Apontadores)",
        "Pares Nus e Ocultos",
      ],
      leadSummary:
        "O Sudoku Difícil reduz as pistas para 30 e deixa 51 células vazias, criando propositalmente bloqueios 0-Single em que a varredura rápida trava por completo. Avançar exige notas disciplinadas, Pointing Pairs e Pares Nus e Ocultos.",
      strategyHeading: "Quebrando bloqueios 0-Single de 30 pistas com Pointing, Pares Nus e Ocultos",
      strategyParagraphs: [
        "Em tabuleiros de 30 pistas, os Únicos óbvios logo acabam e deixam um bloqueio 0-Single sem jogadas diretas. Ative o modo Notas e busque Pointing Pairs: quando um candidato em um bloco 3x3 aparece apenas em uma linha ou coluna, elimine-o do restante dessa linha fora do bloco.",
        "Em seguida, aplique Pares Nus e Pares Ocultos—dois dígitos restritos exclusivamente às mesmas duas casas de uma unidade—para limpar candidatos extras e revelar novos Únicos.",
      ],
      tipsHeading: "Checklist tático para grades Difíceis",
      tips: [
        "Preencha notas completas nas fileiras e blocos mais cheios assim que a varredura bater num bloqueio 0-Single.",
        "Combine Pointing Pairs com Pares Nus e Ocultos: limpar apenas duas anotações extras destrava faixas inteiras.",
        "Nunca chute: todo Sudoku Difícil de 30 pistas passa por verificação de solução lógica única.",
      ],
      faqs: [
        {
          q: "Quantas pistas o Sudoku Difícil tem no SudokuSync?",
          a: "Grades Difíceis começam com 30 pistas e 51 casas vazias, projetadas para gerar bloqueios 0-Single resolvidos com Pointing Pairs e Pares Nus e Ocultos.",
        },
        {
          q: "É preciso chutar em tabuleiros Difíceis?",
          a: "Nunca. Todo quebra-cabeça de 30 pistas tem solução única comprovada por pura lógica humana.",
        },
      ],
      crossLinkLabel: "Sudoku Difícil",
      crossLinkSub: "30 Pistas • Pares e Pointing",
    },
    EXPERT: {
      title: "Jogar Sudoku Especialista Online Grátis | 25 Pistas, Skyscraper & Cadeias — SudokuSync",
      description:
        "Teste sua maestria no Sudoku Especialista (Expert) grátis de 25 pistas. Vença a Escassez Estrita de Dígitos (Digit Starvation) com Skyscraper, 2-String Kite e Cadeias Avançadas.",
      h1: "Jogar Sudoku Especialista Online — Desafios Skyscraper & Cadeias de 25 Pistas",
      badgeLabel: "25 Pistas • 56 Células Vazias",
      targetAudience: "Estrategistas Avançados & Competidores",
      primaryTechniques: [
        "Skyscraper & 2-String Kite",
        "Escassez Estrita (Strict Digit Starvation)",
        "Cadeias Avançadas de Pares Fortes",
      ],
      leadSummary:
        "O modo Especialista reduz o tabuleiro a apenas 25 pistas iniciais e 56 células vazias sob Escassez Estrita de Dígitos (Strict Digit Starvation). Feito para veteranos, exige Skyscraper, 2-String Kite e Cadeias Avançadas.",
      strategyHeading: "Vencendo a escassez de 25 pistas com Skyscraper, 2-String Kite e Cadeias",
      strategyParagraphs: [
        "Com apenas 25 pistas iniciais e a Digit Starvation limitando dígitos fáceis, pares simples logo se esgotam. Filtre um dígito por vez para traçar um Skyscraper ou 2-String Kite: conecte pares fortes entre duas linhas, colunas ou um bloco em comum para remover esse candidato de qualquer casa que enxergue as duas pontas.",
        "Quando um Skyscraper ou 2-String Kite destravar um dígito escasso, use Cadeias Avançadas e candidatos travados para fechar o tabuleiro protegendo seu limite de 3 erros.",
      ],
      tipsHeading: "Checklist tático para grades Especialista",
      tips: [
        "Toque um número no teclado para isolar dígitos escassos e enxergar ligações de Skyscraper ou 2-String Kite.",
        "Conecte elos fortes entre linhas, colunas e blocos para montar Cadeias Avançadas em vez de chutar.",
        "Sob o limite de 3 erros em grades de 25 pistas, conferir as duas pontas da cadeia sempre vence a pressa.",
      ],
      faqs: [
        {
          q: "Quão difícil é o Sudoku Especialista de 25 pistas no SudokuSync?",
          a: "Começa com apenas 25 pistas e 56 espaços vazios sob Strict Digit Starvation, exigindo Skyscraper, 2-String Kite e Cadeias Avançadas.",
        },
        {
          q: "Recordes Pessoais contam usando erros ilimitados ou dicas extras?",
          a: "Não. Para manter a integridade do placar, Recordes Pessoais exigem o limite padrão de 3 erros e jogo justo nas dicas.",
        },
      ],
      crossLinkLabel: "Sudoku Especialista",
      crossLinkSub: "25 Pistas • Cadeias & Kite",
    },
  },
};

