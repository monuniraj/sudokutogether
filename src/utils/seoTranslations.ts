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
      title: "Play Hard Sudoku Online Free | 33-Clue Strategy Puzzles — SudokuSync",
      description:
        "Challenge yourself with free 33-clue Hard Sudoku online on SudokuSync. Apply Hidden Pairs, Triples, and Pencil Notes to crack sparse single-solution grids.",
      h1: "Play Hard Sudoku Online — Free 33-Clue Strategy Puzzles",
      badgeLabel: "33 Clues • 48 Empty Cells",
      targetAudience: "Experienced & Analytical Solvers",
      primaryTechniques: [
        "Hidden Pairs & Triples",
        "Pointing Pairs Elimination",
        "Full Candidate Pencil Notes",
      ],
      leadSummary:
        "Hard Sudoku drops starting clues to 33 (leaving 48 empty cells), creating sparse corridors where quick scanning reveals only initial anchors. Steady progress relies on disciplined Pencil Notes, Hidden Pairs, and systematic elimination.",
      strategyHeading: "Breaking 33-Clue Hard Grids With Hidden Pairs & Triples",
      strategyParagraphs: [
        "On a 33-clue board, Singles often hide beneath four or five candidates. Enable Notes Mode to mark candidate sets across tight lines. When two digits appear strictly inside the same two squares of a house—even with extra candidates present—they form a Hidden Pair, letting you strip away all other notes from both cells.",
        "Pair Hidden Pairs and Triples with Pointing Pairs: when a candidate in a 3x3 box sits exclusively along one row or column, remove that candidate along the rest of that line outside the box.",
      ],
      tipsHeading: "Tactical Checklist for Hard Grids",
      tips: [
        "Populate clean candidate Pencil Notes in cramped bands before scanning loosely across all 81 squares.",
        "Spot Naked Pairs and Hidden Pairs sharing only two digits—trimming other marks quickly exposes locked Singles.",
        "Never guess: every Hard puzzle is uniqueness-verified for pure logical solvability.",
      ],
      faqs: [
        {
          q: "How many clues does Hard Sudoku have on SudokuSync?",
          a: "Hard puzzles contain 33 starting clues and 48 blank cells, engineered to demand Pointing Pairs, Naked Pairs, and Hidden Triples.",
        },
        {
          q: "Do Hard boards ever require guessing?",
          a: "Never. Every generated board passes exact uniqueness verification so pure logical deduction always leads to the solution.",
        },
      ],
      crossLinkLabel: "Hard Sudoku",
      crossLinkSub: "33 Clues • Hidden Pairs",
    },
    EXPERT: {
      title: "Play Expert Sudoku Online Free | 27-Clue X-Wing Puzzles — SudokuSync",
      description:
        "Test your mastery on free 27-clue Expert Sudoku puzzles online. Hunt X-Wing patterns, Hidden Triples, and deep candidate chains with friends on SudokuSync.",
      h1: "Play Expert Sudoku Online — Free 27-Clue X-Wing Puzzles",
      badgeLabel: "27 Clues • 54 Empty Cells",
      targetAudience: "Advanced Tacticians & Competitive Players",
      primaryTechniques: [
        "X-Wing Rectangular Locks",
        "Hidden Pairs & Triples",
        "Chained Candidate Pruning",
      ],
      leadSummary:
        "Expert Sudoku strips the board down to just 27 initial clues and 54 blank cells—pushing logical deduction into deep pattern territory. Built for seasoned solvers, Expert rewards clean Pencil Notes, X-Wing recognition, and calm precision.",
      strategyHeading: "Cracking 27-Clue Expert Grids With X-Wing & Chained Elimination",
      strategyParagraphs: [
        "With only 27 clues anchoring the grid, most boxes open with just two or three digits. Once Scanning and Hidden Pairs stall, filter one digit at a time for an X-Wing: find a candidate appearing in strictly two columns within row A and the exact same two columns within row B, locking a logical rectangle that eliminates that candidate elsewhere in both columns.",
        "Combine X-Wing elimination with Box-Line Reduction (Claiming) and Hidden Triples. Clearing just two or three key candidates collapses stubborn chains cleanly while protecting your Personal Best eligibility.",
      ],
      tipsHeading: "Tactical Checklist for Expert Grids",
      tips: [
        "Tap digits on the keypad to highlight every placement and note of one number while hunting X-Wing rectangles.",
        "Audit 3-box bands for Box-Line Reduction claims before searching deeper chains.",
        "Verify candidates carefully under the 3-mistake rule—precision beats hasty guesses on 27-clue grids.",
      ],
      faqs: [
        {
          q: "How sparse is an Expert Sudoku puzzle on SudokuSync?",
          a: "Expert puzzles start with 27 fixed clues and 54 empty cells—nearly half the clues of Easy—requiring Hidden Triples and X-Wing logic.",
        },
        {
          q: "Do Personal Best times count on Expert if hints or unlimited mistakes are used?",
          a: "No. Personal Best records strictly require standard 3-mistake enforcement and fair-play hint limits.",
        },
      ],
      crossLinkLabel: "Expert Sudoku",
      crossLinkSub: "27 Clues • X-Wing",
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
      title: "मुफ्त कठिन सुडोकू खेलें | 33 संकेतों वाली रणनीति पहेलियाँ — SudokuSync",
      description:
        "SudokuSync पर 33 शुरुआती संकेतों वाली कठिन सुडोकू पहेलियों की चुनौती लें। हिडन पेयर्स, ट्रिपल्स और पेंसिल नोट्स से जटिल बोर्ड हल करें।",
      h1: "कठिन सुडोकू ऑनलाइन खेलें — 33 संकेतों वाली रणनीति पहेलियाँ",
      badgeLabel: "33 संकेत • 48 खाली खाने",
      targetAudience: "अनुभवी और विश्लेषणात्मक खिलाड़ी",
      primaryTechniques: [
        "हिडन पेयर्स और ट्रिपल्स",
        "पॉइंटिंग पेयर्स उन्मूलन",
        "पूर्ण कैंडिडेट पेंसिल नोट्स",
      ],
      leadSummary:
        "कठिन (Hard) सुडोकू में शुरुआती संकेत घटकर 33 रह जाते हैं और 48 खाने खाली होते हैं। इसमें शुरुआती स्कैनिंग के बाद पेंसिल नोट्स, हिडन पेयर्स और क्रमबद्ध उन्मूलन से ही आगे का रास्ता खुलता है।",
      strategyHeading: "हिडन पेयर्स और ट्रिपल्स से 33-संकेत कठिन ग्रिड कैसे तोड़ें",
      strategyParagraphs: [
        "33-संकेत पहेली में कई सिंगल्स चार या पाँच संभावित अंकों के बीच छिपे रहते हैं। नोट्स मोड चालू करके भीड़भाड़ वाली पंक्तियों के सभी उम्मीदवार लिखें। जब दो अंक किसी पंक्ति या बॉक्स में केवल उन्हीं दो खानों तक सीमित हों, तो वे हिडन पेयर बनाते हैं जिससे बाकी सभी उम्मीदवार वहां से हट जाते हैं।",
        "पॉइंटिंग पेयर्स के साथ हिडन ट्रिपल्स का उपयोग करके बाहरी पंक्तियों से अतिरिक्त संभावनाएँ काटें और अटके हुए मध्य खंड खोलें।",
      ],
      tipsHeading: "कठिन ग्रिड के लिए उपयोगी टिप्स",
      tips: [
        "सभी 81 खानों में भटकने से पहले भरी हुई पंक्तियों में साफ पेंसिल नोट्स भरें।",
        "सिर्फ दो अंकों वाले नेकेड और हिडन पेयर्स ढूँढें—अन्य नोट्स हटते ही नया सिंगल प्रकट होता है।",
        "कभी अनुमान न लगाएं: हर कठिन बोर्ड एकमात्र अद्वितीय समाधान के लिए जाँचा जाता है।",
      ],
      faqs: [
        {
          q: "SudokuSync पर कठिन सुडोकू में कितने संकेत होते हैं?",
          a: "कठिन पहेलियों में 33 शुरुआती संकेत और 48 खाली खाने होते हैं, जिनमें पॉइंटिंग पेयर्स और हिडन ट्रिपल्स की आवश्यकता होती है।",
        },
        {
          q: "क्या कठिन बोर्ड में तुक्का लगाने की ज़रूरत पड़ती है?",
          a: "कभी नहीं। हर पहेली अद्वितीय समाधान जांच से गुजरती है ताकि शुद्ध तर्क से पूरा हल निकल सके।",
        },
      ],
      crossLinkLabel: "कठिन सुडोकू",
      crossLinkSub: "33 संकेत • हिडन पेयर्स",
    },
    EXPERT: {
      title: "मुफ्त विशेषज्ञ सुडोकू खेलें | 27 संकेतों वाली X-विंग पहेलियाँ — SudokuSync",
      description:
        "27 शुरुआती संकेतों वाली मुफ्त विशेषज्ञ (Expert) सुडोकू पहेलियों पर अपनी कुशलता परखें। X-विंग पैटर्न, हिडन ट्रिपल्स और पेंसिल नोट्स का उपयोग करें।",
      h1: "विशेषज्ञ सुडोकू ऑनलाइन खेलें — 27 संकेतों वाली X-विंग पहेलियाँ",
      badgeLabel: "27 संकेत • 54 खाली खाने",
      targetAudience: "मास्टर रणनीतिकार और प्रतिस्पर्धी खिलाड़ी",
      primaryTechniques: [
        "X-विंग पैटर्न आयताकार लॉक",
        "हिडन पेयर्स और ट्रिपल्स",
        "श्रृंखलाबद्ध कैंडिडेट उन्मूलन",
      ],
      leadSummary:
        "विशेषज्ञ (Expert) सुडोकू बोर्ड को केवल 27 शुरुआती संकेतों और 54 खाली खानों तक सीमित कर देता है। अनुभवी खिलाड़ियों के लिए बना यह स्तर सटीक पेंसिल नोट्स, X-विंग पैटर्न की पहचान और संयम की परीक्षा लेता है।",
      strategyHeading: "X-विंग और गहन उन्मूलन से 27-संकेत विशेषज्ञ ग्रिड कैसे जीतें",
      strategyParagraphs: [
        "केवल 27 शुरुआती अंक होने से कई 3x3 बॉक्स दो या तीन संकेतों के साथ शुरू होते हैं। जब स्कैनिंग और हिडन पेयर्स रुक जाएं, तो एक-एक अंक फ़िल्टर करके X-विंग पैटर्न खोजें: यदि कोई उम्मीदवार पंक्ति A और पंक्ति B दोनों में ठीक उन्हीं दो स्तंभों में आता है, तो उन दोनों स्तंभों के बाकी सभी खानों से वह उम्मीदवार हट जाता है।",
        "बॉक्स-लाइन रिडक्शन और हिडन ट्रिपल्स के साथ X-विंग का मेल जटिल श्रृंखलाओं को खोल देता है और आपकी 3-गलतियों की सटीकता बनाए रखता है।",
      ],
      tipsHeading: "विशेषज्ञ ग्रिड के लिए उपयोगी टिप्स",
      tips: [
        "X-विंग पैटर्न देखने के लिए कीपैड पर एक अंक चुनकर उसके सभी समान नोट्स हाइलाइट करें।",
        "गहरी श्रृंखला खोजने से पहले 3-बॉक्स पट्टियों में बॉक्स-लाइन रिडक्शन की जांच करें।",
        "27-संकेत ग्रिड पर जल्दबाज़ी की जगह शांत नोट सत्यापन अपनाएं ताकि 3-गलतियों का नियम सुरक्षित रहे।",
      ],
      faqs: [
        {
          q: "SudokuSync पर विशेषज्ञ सुडोकू कितना विरल होता है?",
          a: "विशेषज्ञ पहेलियों में केवल 27 शुरुआती संकेत और 54 खाली खाने होते हैं—आसान से लगभग आधे—जिनमें हिडन ट्रिपल्स और X-विंग पैटर्न काम आते हैं।",
        },
        {
          q: "क्या अनलिमिटेड गलतियों या अतिरिक्त हिंट्स के साथ Personal Best गिना जाता है?",
          a: "नहीं। लीडरबोर्ड की निष्पक्षता बनाए रखने के लिए Personal Best केवल मानक 3-गलतियों और तय हिंट नियम के तहत ही दर्ज होता है।",
        },
      ],
      crossLinkLabel: "विशेषज्ञ सुडोकू",
      crossLinkSub: "27 संकेत • X-विंग",
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
      title: "Schweres Sudoku kostenlos online spielen | 33 Vorgaben — SudokuSync",
      description:
        "Fordere dich selbst mit kostenlosem schweren 33-Vorgaben-Sudoku heraus. Nutze Hidden Pairs, Triples und Kandidaten-Notizen für knifflige Gitter.",
      h1: "Schweres Sudoku online spielen — 33-Vorgaben-Strategierätsel",
      badgeLabel: "33 Vorgaben • 48 Leere Felder",
      targetAudience: "Erfahrene & Analytische Löser",
      primaryTechniques: [
        "Hidden Pairs & Triples",
        "Pointing-Pairs-Elimination",
        "Vollständige Kandidaten-Notizen",
      ],
      leadSummary:
        "Schweres Sudoku reduziert die Startvorgaben auf 33 (48 leere Felder). Hier erschließen erst konsequente Kandidaten-Notizen, Hidden Pairs und indirekte Eliminationsketten den Durchbruch.",
      strategyHeading: "33-Vorgaben-Gitter mit Hidden Pairs & Triples knacken",
      strategyParagraphs: [
        "In 33-Vorgaben-Brettern verbergen sich Singles oft unter vier oder fünf Kandidaten. Aktiviere den Notizmodus für enge Reihen. Tauchen zwei Ziffern innerhalb einer Einheit nur in denselben zwei Zellen auf, bilden sie ein Hidden Pair und alle übrigen Kandidaten dort entfallen.",
        "Kombiniere Pointing Pairs mit Hidden Triples, um Linien außerhalb eines Blocks gezielt von blockierten Ziffern zu befreien.",
      ],
      tipsHeading: "Checkliste für schwere Gitter",
      tips: [
        "Fülle Kandidaten-Notizen zuerst in dicht besetzten Zeilen aus, statt planlos über das gesamte Feld zu suchen.",
        "Achte auf Naked und Hidden Pairs—das Entfernen von Beifang enthüllt sofort neue Singles.",
        "Nie raten: Jedes schwere Brett ist mathematisch eindeutig ohne Versuch-und-Irrtum lösbar.",
      ],
      faqs: [
        {
          q: "Wie viele Vorgaben hat Schwer auf SudokuSync?",
          a: "Schwere Gitter beginnen mit 33 Vorgaben und 48 freien Feldern und erfordern Techniken wie Pointing Pairs und Hidden Triples.",
        },
        {
          q: "Muss man bei Schwer jemals raten?",
          a: "Nein. Jedes generierte Brett wird auf exakte Eindeutigkeit geprüft und bleibt rein logisch lösbar.",
        },
      ],
      crossLinkLabel: "Schwer Sudoku",
      crossLinkSub: "33 Vorgaben • Hidden Pairs",
    },
    EXPERT: {
      title: "Experten-Sudoku kostenlos spielen | 27 Vorgaben & X-Wing — SudokuSync",
      description:
        "Teste deine Meisterschaft im kostenlosen 27-Vorgaben-Experten-Sudoku. Finde X-Wing-Muster, Hidden Triples und tiefe Logikketten online.",
      h1: "Experten-Sudoku online spielen — 27-Vorgaben-X-Wing-Rätsel",
      badgeLabel: "27 Vorgaben • 54 Leere Felder",
      targetAudience: "Taktiker & Turnierspieler",
      primaryTechniques: [
        "X-Wing Rechteck-Elimination",
        "Hidden Pairs & Triples",
        "Verkettetes Kandidaten-Pruning",
      ],
      leadSummary:
        "Das Experten-Level reduziert das Brett auf nur 27 Startvorgaben und 54 leere Felder. Es belohnt akribische Kandidaten-Notizen, die sichere X-Wing-Erkennung und höchste Präzision ohne Fehler.",
      strategyHeading: "27-Vorgaben-Expertenbretter mit X-Wing & Kettenlogik lösen",
      strategyParagraphs: [
        "Bei nur 27 Vorgaben starten viele Blöcke mit zwei oder drei Zahlen. Wenn Standard-Scannen und Paare erschöpft sind, filtere Ziffer für Ziffer nach einem X-Wing: Steht ein Kandidat in zwei Zeilen exakt in denselben zwei Spalten, bildet das Rechteck eine Sperre, durch die der Kandidat in allen anderen Zellen dieser Spalten gestrichen wird.",
        "Ergänze die X-Wing-Strategie durch Box-Line-Reduction (Claiming) und Hidden Triples, um komplexe Blockaden ohne Raten sicher aufzulösen.",
      ],
      tipsHeading: "Checkliste für Experten-Gitter",
      tips: [
        "Tippe einzelne Zahlen auf dem Tastenfeld an, um alle Vorkommen und Notizen für den X-Wing-Scan hervorzuheben.",
        "Prüfe 3er-Bänder konsequent auf Box-Line-Reduction, bevor du lange Ketten suchst.",
        "Bleib unter der 3-Fehler-Regel ruhig—sorgfältige Notizprüfung schlägt hastiges Tippen immer.",
      ],
      faqs: [
        {
          q: "Wie spärlich ist das Experten-Sudoku auf SudokuSync besetzt?",
          a: "Experten-Rätsel starten mit lediglich 27 Vorgaben und 54 leeren Feldern—fast halb so viele Hinweise wie Einfach—und verlangen X-Wing sowie Hidden Triples.",
        },
        {
          q: "Zählen Bestzeiten bei unbegrenzten Fehlern oder Zusatz-Tipps?",
          a: "Nein. Für faire Bestenlisten gelten Bestzeiten ausschließlich mit aktivem 3-Fehler-Limit und regulären Tipp-Regeln.",
        },
      ],
      crossLinkLabel: "Experte Sudoku",
      crossLinkSub: "27 Vorgaben • X-Wing",
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
      title: "無料 むずかしい数独（ナンプレ）オンライン | ヒント33個の戦略パズル — SudokuSync",
      description:
        "初期配置33個の本格派「むずかしい」数独に無料挑戦。隠れペア・トリプルや候補メモを駆使して手強い難問を論理的に解き明かそう。",
      h1: "むずかしい数独（ナンプレ）オンライン — ヒント33個の戦略パズル",
      badgeLabel: "初期配置 33個 • 空きマス 48個",
      targetAudience: "上級者・本格ロジックファン",
      primaryTechniques: [
        "隠れペア＆トリプル（Hidden Pairs）",
        "ポインティングペア消去",
        "精密な候補数字メモ",
      ],
      leadSummary:
        "「むずかしい」数独では初期配置が33個（空きマス48個）まで絞られます。序盤のスキャン後は、候補メモの整理と「隠れペア・トリプル」などの高度な絞り込みが突破口になります。",
      strategyHeading: "隠れペア＆トリプルで33個の数独を突破する",
      strategyParagraphs: [
        "33個配置の盤面では、確定マスが多くの候補数字に埋もれて見えにくくなります。メモ機能を使って候補を書き出し、ある行・列・ブロック内で「2つの数字が同じ2マスにしか入らない」状態（隠れペア）を見つけたら、その2マスから不要な候補をすべて削除できます。",
        "ポインティングペアや隠れトリプルと組み合わせることで、止まっていた中盤の連鎖が一気に開けます。",
      ],
      tipsHeading: "むずかしい盤面の攻略チェックリスト",
      tips: [
        "全体をやみくもに見る前に、ヒントが多い列やブロックから丁寧にメモを埋めましょう。",
        "ネイキッドペアや隠れペアを見つけたら、余分なメモを消して新しいシングルを露出させましょう。",
        "当てずっぽうは不要です。すべての問題が唯一解保証の純粋な論理パズルです。",
      ],
      faqs: [
        {
          q: "むずかしい数独のヒント（初期配置）はいくつですか？",
          a: "33個の初期数字と48個の空きマスで構成され、ポインティングペアや隠れペア・トリプルの活用が求められます。",
        },
        {
          q: "途中で仮置き（カン）が必要になることはありますか？",
          a: "ありません。生成時に唯一解検証を行っているため、論理だけで必ず最後まで解けます。",
        },
      ],
      crossLinkLabel: "むずかしい数独",
      crossLinkSub: "初期33個 • 隠れペア",
    },
    EXPERT: {
      title: "無料 エキスパート数独（ナンプレ）オンライン | 初期27個・X-ウイング対応 — SudokuSync",
      description:
        "初期配置わずか27個の超難問「エキスパート」数独を無料プレイ。X-ウイング（X-Wing）や隠れトリプルで極限の論理推理に挑戦しましょう。",
      h1: "エキスパート数独（ナンプレ）オンライン — 初期27個・X-ウイング難問",
      badgeLabel: "初期配置 27個 • 空きマス 54個",
      targetAudience: "達人・トーナメント志向プレイヤー",
      primaryTechniques: [
        "X-ウイング（X-Wing）長方形ロック",
        "隠れペア＆トリプル",
        "多段階チェーン消去",
      ],
      leadSummary:
        "「エキスパート」は初期配置わずか27個・空きマス54個という極限の難易度です。熟練プレイヤー向けに設計されており、緻密な候補メモ管理と「X-ウイング（X-Wing）」の発見が勝利を分けます。",
      strategyHeading: "X-ウイングと連鎖消去で27個の超難問を攻略",
      strategyParagraphs: [
        "初期数字が27個しかない盤面では、各ブロックに2〜3個しか手掛かりがありません。基本手筋が行き詰まったら数字を1つずつハイライトし、「2つの行において同じ2つの列にだけ出現する候補」＝X-ウイングを探します。この長方形ロックが成立すると、該当2列の他のマスからその候補を一括消去できます。",
        "さらにボックス・ライン消去や隠れトリプルを組み合わせることで、固着した連鎖が鮮やかに崩れ始めます。",
      ],
      tipsHeading: "エキスパート盤面の攻略チェックリスト",
      tips: [
        "キーパッドの数字ボタンで同じ数字とメモを強調表示し、X-ウイングの長方形を見つけやすくしましょう。",
        "複雑な連鎖を探す前に、3連ブロックのライン消去を見落としていないか点検しましょう。",
        "27個盤面では焦ってタップせず、3ミス制限を守って正確なメモ検証を優先しましょう。",
      ],
      faqs: [
        {
          q: "エキスパート数独はどれくらいヒントが少ないですか？",
          a: "初期配置27個・空きマス54個（かんたんの約半分）という高密度な空白を持ち、隠れトリプルやX-ウイングなどの上級技が不可欠です。",
        },
        {
          q: "無制限ミス設定や追加ヒントを使っても自己ベスト記録は残りますか？",
          a: "いいえ。公平なランキング維持のため、自己ベスト記録は標準の3ミス制限と規定ヒント上限内でのみ認定されます。",
        },
      ],
      crossLinkLabel: "エキスパート数独",
      crossLinkSub: "初期27個 • X-ウイング",
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
      title: "무료 어려움 스도쿠 온라인 | 33개 힌트 전략 퍼즐 — SudokuSync",
      description:
        "33개의 힌트만 주어지는 무료 어려움 스도쿠에 도전하세요. 히든 페어·트리플과 후보 메모로 치밀한 논리 퍼즐을 해결할 수 있습니다.",
      h1: "어려움 스도쿠 온라인 플레이 — 33개 힌트 전략 퍼즐",
      badgeLabel: "초기 힌트 33개 • 빈 칸 48개",
      targetAudience: "숙련자 및 논리 분석형 플레이어",
      primaryTechniques: [
        "히든 페어 및 트리플",
        "포인팅 페어 소거법",
        "전체 후보 숫자 메모",
      ],
      leadSummary:
        "어려움(Hard) 스도쿠는 시작 힌트가 33개(빈 칸 48개)로 크게 줄어들어 단순 스캔만으로는 금세 막히게 됩니다. 꼼꼼한 후보 메모와 히든 페어·트리플 탐색이 해법의 열쇠입니다.",
      strategyHeading: "히든 페어·트리플로 33개 힌트 어려움 보드 돌파하기",
      strategyParagraphs: [
        "33개 힌트 퍼즐에서는 많은 싱글이 4~5개 후보 숫자 속에 숨어 있습니다. 메모 모드를 켜고 빽빽한 줄의 후보를 모두 적은 뒤, 두 숫자가 한 영역 안에서 오직 같은 두 칸에만 들어갈 때(히든 페어) 나머지 후보들을 깔끔하게 지워내세요.",
        "포인팅 페어와 히든 트리플을 함께 적용하면 굳어 있던 중앙 블록들이 연쇄적으로 풀립니다.",
      ],
      tipsHeading: "어려움 보드 공략 체크리스트",
      tips: [
        "81칸 전체를 헤매기 전에 후보가 좁은 행과 박스부터 메모를 꼼꼼히 작성하세요.",
        "네이키드 페어나 히든 페어로 불필요한 메모를 지우면 숨어 있던 싱글이 바로 드러납니다.",
        "절대 추측하지 마세요. 모든 어려움 퍼즐은 유일한 해답이 보장된 순수 논리 퍼즐입니다.",
      ],
      faqs: [
        {
          q: "SudokuSync 어려움 스도쿠에는 힌트가 몇 개인가요?",
          a: "초기 힌트 33개와 빈 칸 48개로 구성되며, 포인팅 페어와 히든 페어·트리플 같은 중상급 논리가 요구됩니다.",
        },
        {
          q: "어려움 단계에서 찍어서 풀어야 하는 경우가 있나요?",
          a: "없습니다. 모든 보드는 생성 시 유일해 검증을 통과해 100% 논리만으로 풀 수 있습니다.",
        },
      ],
      crossLinkLabel: "어려움 스도쿠",
      crossLinkSub: "힌트 33개 • 히든 페어",
    },
    EXPERT: {
      title: "무료 전문가 스도쿠 온라인 | 27개 힌트 X-Wing 퍼즐 — SudokuSync",
      description:
        "단 27개의 힌트로 시작하는 무료 전문가(Expert) 스도쿠! X-Wing 패턴과 히든 트리플, 다단계 후보 소거로 최고 난이도에 도전하세요.",
      h1: "전문가 스도쿠 온라인 플레이 — 27개 힌트 X-Wing 고난도 퍼즐",
      badgeLabel: "초기 힌트 27개 • 빈 칸 54개",
      targetAudience: "고급 전략가 및 기록 경쟁 플레이어",
      primaryTechniques: [
        "X-Wing 사각형 패턴 잠금",
        "히든 페어 및 트리플",
        "연쇄 후보 숫자 가지치기",
      ],
      leadSummary:
        "전문가(Expert) 스도쿠는 초기 힌트가 단 27개뿐이고 54개 칸이 비어 있는 최상위 도전 모드입니다. 체계적인 메모 관리와 X-Wing 패턴 포착 능력, 흔들리지 않는 정확도가 승패를 가릅니다.",
      strategyHeading: "X-Wing 패턴과 연쇄 소거로 27개 힌트 전문가 보드 깨기",
      strategyParagraphs: [
        "27개 힌트만 남아 있어 대부분의 박스가 2~3개 숫자로 시작합니다. 기본 스캔과 페어가 멈추면 숫자를 하나씩 선택해 X-Wing을 찾으세요: 서로 다른 두 행에서 특정 후보가 정확히 같은 두 열에만 등장하면 사각형 잠금이 형성되어, 해당 두 열의 다른 칸에서 그 후보를 모두 지울 수 있습니다.",
        "박스-라인 축소(Claiming)와 히든 트리플을 X-Wing과 결합하면 복잡하게 얽힌 연쇄 칸들이 한 번에 풀려 나갑니다.",
      ],
      tipsHeading: "전문가 보드 공략 체크리스트",
      tips: [
        "숫자 키패드를 눌러 단일 숫자와 메모를 강조 표시하면 X-Wing 직사각형을 훨씬 쉽게 찾을 수 있습니다.",
        "깊은 연쇄를 찾기 전 3박스 띠에서 박스-라인 축소가 빠지지 않았는지 먼저 점검하세요.",
        "27개 보드에서는 빠른 터치보다 3실수 제한을 지키는 신중한 메모 검증이 기록 달성의 지름길입니다.",
      ],
      faqs: [
        {
          q: "SudokuSync 전문가 스도쿠는 얼마나 어려운가요?",
          a: "쉬움의 약 절반 수준인 27개 힌트와 54개 빈 칸으로 시작하며, 히든 트리플과 X-Wing 같은 고급 기법이 필수입니다.",
        },
        {
          q: "실수 무제한 설정이나 추가 힌트를 써도 최고 기록에 반영되나요?",
          a: "아니요. 공정한 기록 경쟁을 위해 개인 최고 기록(Personal Best)은 기본 3실수 제한 및 허용 힌트 규칙 내에서만 인정됩니다.",
        },
      ],
      crossLinkLabel: "전문가 스도쿠",
      crossLinkSub: "힌트 27개 • X-Wing",
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
      title: "Jugar Sudoku Difícil Online Gratis | 33 Pistas — SudokuSync",
      description:
        "Ponte a prueba con Sudoku Difícil gratis de 33 pistas. Aplica Pares Ocultos, Tríos y Notas de candidatos para superar tableros exigentes.",
      h1: "Jugar Sudoku Difícil Online — Estrategia con 33 Pistas",
      badgeLabel: "33 Pistas • 48 Casillas Vacías",
      targetAudience: "Jugadores Experimentados y Analíticos",
      primaryTechniques: [
        "Pares y Tríos Ocultos",
        "Eliminación por Pares Apuntadores",
        "Notas Completas de Candidatos",
      ],
      leadSummary:
        "El Sudoku Difícil reduce las pistas iniciales a 33 (con 48 casillas vacías). Para avanzar tras los primeros trazos son imprescindibles las notas de candidatos, los Pares Ocultos y la deducción por pasos.",
      strategyHeading: "Superar tableros Difíciles de 33 pistas con Pares Ocultos",
      strategyParagraphs: [
        "Con 33 pistas, los Singles suelen esconderse entre cuatro o cinco candidatos. Activa el modo Notas en las líneas más densas: cuando dos dígitos aparecen exclusivamente en las mismas dos casillas de una unidad, forman un Par Oculto que permite descartar todos los demás candidatos allí.",
        "Combina Pares Apuntadores con Tríos Ocultos para despejar bloqueos en la zona central sin recurrir jamás al azar.",
      ],
      tipsHeading: "Lista táctica para tableros Difíciles",
      tips: [
        "Completa primero notas limpias en filas o cajas con mayor densidad de pistas.",
        "Busca Pares Desnudos y Pares Ocultos: limpiar dos notas sobrantes suele revelar un Single inmediato.",
        "Nunca adivines: cada tablero Difícil está verificado para tener una única solución lógica.",
      ],
      faqs: [
        {
          q: "¿Cuántas pistas tiene el Sudoku Difícil en SudokuSync?",
          a: "Contiene 33 pistas iniciales y 48 casillas vacías, diseñadas para requerir Pares Apuntadores, Pares Ocultos y Tríos.",
        },
        {
          q: "¿Es necesario tantear por prueba y error en Difícil?",
          a: "Nunca. Cada puzzle pasa una verificación matemática de unicidad antes de comenzar.",
        },
      ],
      crossLinkLabel: "Sudoku Difícil",
      crossLinkSub: "33 Pistas • Pares Ocultos",
    },
    EXPERT: {
      title: "Jugar Sudoku Experto Online Gratis | 27 Pistas y X-Wing — SudokuSync",
      description:
        "Demuestra tu maestría en el Sudoku Experto gratis de 27 pistas. Encuentra patrones X-Wing, Tríos Ocultos y cadenas lógicas avanzadas en SudokuSync.",
      h1: "Jugar Sudoku Experto Online — Retos X-Wing de 27 Pistas",
      badgeLabel: "27 Pistas • 54 Casillas Vacías",
      targetAudience: "Tácticos Avanzados y Competidores",
      primaryTechniques: [
        "Patrón Rectangular X-Wing",
        "Pares y Tríos Ocultos",
        "Podado Encadenado de Candidatos",
      ],
      leadSummary:
        "El modo Experto deja el tablero con apenas 27 pistas iniciales y 54 casillas vacías. Diseñado para veteranos, exige disciplina con las notas, detección del patrón X-Wing y precisión absoluta.",
      strategyHeading: "Dominar el Sudoku Experto de 27 pistas con X-Wing",
      strategyParagraphs: [
        "Con solo 27 dígitos iniciales, muchas cajas arrancan con dos o tres pistas. Cuando las técnicas básicas se estanquen, filtra dígito por dígito buscando un patrón X-Wing: si un candidato aparece exactamente en dos columnas de la fila A y en las mismas dos columnas de la fila B, queda bloqueado en diagonal y puedes borrarlo del resto de esas columnas.",
        "Alterna X-Wing con Reducción Caja-Línea y Tríos Ocultos para desbloquear cadenas largas conservando intacto tu registro de récords.",
      ],
      tipsHeading: "Lista táctica para tableros Expertos",
      tips: [
        "Pulsa un número en el teclado para resaltar sus instancias y notas al cazar rectángulos X-Wing.",
        "Revisa reducciones Caja-Línea en cada banda de tres cajas antes de buscar cadenas profundas.",
        "Bajo la regla de 3 errores, verificar tus notas siempre rinde más que tocar con prisa en 27 pistas.",
      ],
      faqs: [
        {
          q: "¿Qué tan exigente es el modo Experto en SudokuSync?",
          a: "Empieza con solo 27 pistas fijas y 54 casillas vacías—casi la mitad que Fácil—exigiendo Tríos Ocultos y eliminaciones X-Wing.",
        },
        {
          q: "¿Cuentan los récords personales con errores ilimitados o pistas extra?",
          a: "No. Los récords personales exigen el límite oficial de 3 errores y juego limpio en pistas.",
        },
      ],
      crossLinkLabel: "Sudoku Experto",
      crossLinkSub: "27 Pistas • X-Wing",
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
      title: "Jouer au Sudoku Difficile Gratuit en Ligne | 33 Indices — SudokuSync",
      description:
        "Relevez le défi du Sudoku Difficile gratuit à 33 indices sur SudokuSync. Utilisez les Paires Cachées, Triplets et notes de candidats.",
      h1: "Jouer au Sudoku Difficile en Ligne — Stratégie à 33 Indices",
      badgeLabel: "33 Indices • 48 Cases Vides",
      targetAudience: "Joueurs Expérimentés & Analystes",
      primaryTechniques: [
        "Paires et Triplets Cachés",
        "Élimination par Paires Pointantes",
        "Notes Complètes de Candidats",
      ],
      leadSummary:
        "Le Sudoku Difficile descend à 33 indices initiaux pour 48 cases vides. Au-delà des premiers placements, la progression repose sur les notes de candidats, les Paires Cachées et la réduction méthodique.",
      strategyHeading: "Débloquer les grilles Difficiles à 33 indices",
      strategyParagraphs: [
        "Sur une grille à 33 indices, les singletons restent souvent dissimulés parmi quatre ou cinq candidats. Activez le mode Notes dans les zones denses : lorsque deux chiffres n'apparaissent que dans exactement deux mêmes cases d'une unité, ils forment une Paire Cachée et libèrent ces deux cases de tout autre candidat.",
        "Combinez Paires Pointantes et Triplets Cachés pour dénouer le cœur de la grille avec rigueur.",
      ],
      tipsHeading: "Checklist tactique pour grilles Difficiles",
      tips: [
        "Remplissez d'abord des notes propres dans les lignes ou blocs les plus fournis.",
        "Repérez les Paires Nues et Cachées : réduire deux cases à deux candidats révèle vite de nouveaux coups sûrs.",
        "Ne devinez jamais : chaque grille Difficile est certifiée à solution logique unique.",
      ],
      faqs: [
        {
          q: "Combien d'indices possède une grille Difficile sur SudokuSync ?",
          a: "Les grilles Difficiles démarrent avec 33 indices et 48 cases vides, nécessitant Paires Pointantes et Paires ou Triplets Cachés.",
        },
        {
          q: "Faut-il procéder par hypothèses hasardeuses en Difficile ?",
          a: "Jamais. Chaque grille est mathématiquement vérifiée lors de sa génération.",
        },
      ],
      crossLinkLabel: "Sudoku Difficile",
      crossLinkSub: "33 Indices • Paires Cachées",
    },
    EXPERT: {
      title: "Jouer au Sudoku Expert Gratuit en Ligne | 27 Indices & X-Wing — SudokuSync",
      description:
        "Testez votre maîtrise sur nos grilles Expert gratuites à 27 indices. Repérez les motifs X-Wing, Triplets Cachés et chaînes logiques sur SudokuSync.",
      h1: "Jouer au Sudoku Expert en Ligne — Défis X-Wing à 27 Indices",
      badgeLabel: "27 Indices • 54 Cases Vides",
      targetAudience: "Tacticiens Avancés & Compétiteurs",
      primaryTechniques: [
        "Motif Rectangulaire X-Wing",
        "Paires et Triplets Cachés",
        "Élagage en Chaîne des Candidats",
      ],
      leadSummary:
        "Le mode Expert réduit la grille à seulement 27 indices de départ et 54 cases vides. Conçu pour les spécialistes, il met à l'épreuve la tenue des notes, le repérage des motifs X-Wing et le sang-froid.",
      strategyHeading: "Résoudre le Sudoku Expert à 27 indices grâce au X-Wing",
      strategyParagraphs: [
        "Avec seulement 27 chiffres initiaux, de nombreux blocs ouvrent avec deux ou trois indices. Quand les techniques classiques calent, filtrez un chiffre à la fois pour repérer un motif X-Wing : si ce candidat n'occupe que deux colonnes identiques dans deux lignes distinctes, il est verrouillé en diagonale et peut être rayé du reste de ces deux colonnes.",
        "Associez le X-Wing à la réduction Bloc-Ligne et aux Triplets Cachés pour briser les blocages avancés sans erreur.",
      ],
      tipsHeading: "Checklist tactique pour grilles Expert",
      tips: [
        "Sélectionnez un chiffre au clavier pour mettre en évidence ses occurrences et notes lors d'une recherche X-Wing.",
        "Vérifiez les bandes de trois blocs pour les réductions Bloc-Ligne avant les chaînes longues.",
        "Sous la règle des 3 erreurs, la vérification patiente des notes prime sur la précipitation sur 27 indices.",
      ],
      faqs: [
        {
          q: "Quelle est la difficulté réelle du niveau Expert sur SudokuSync ?",
          a: "Les grilles Expert n'offrent que 27 indices et 54 cases vides—près de moitié moins qu'en Facile—et demandent Triplets Cachés et X-Wing.",
        },
        {
          q: "Les records personnels sont-ils comptés avec erreurs illimitées ou indices bonus ?",
          a: "Non. Les records exigent l'activation stricte de la limite de 3 erreurs et le respect du plafond d'indices.",
        },
      ],
      crossLinkLabel: "Sudoku Expert",
      crossLinkSub: "27 Indices • X-Wing",
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
      title: "Gioca a Sudoku Difficile Online Gratis | 33 Indizi — SudokuSync",
      description:
        "Mettiti alla prova con il Sudoku Difficile gratis da 33 indizi su SudokuSync. Applica Coppie Nascoste, Terzetti e Note per vincere gli schemi più spogli.",
      h1: "Gioca a Sudoku Difficile Online — Strategia da 33 Indizi",
      badgeLabel: "33 Indizi • 48 Celle Vuote",
      targetAudience: "Giocatori Esperti & Analitici",
      primaryTechniques: [
        "Coppie e Terzetti Nascosti",
        "Eliminazione Coppie Puntanti",
        "Note Complete dei Candidati",
      ],
      leadSummary:
        "Il Sudoku Difficile riduce gli indizi a 33 lasciando 48 celle vuote. Superati i primi incastri, servono note ordinate, Coppie Nascoste ed eliminazioni indirette passo dopo passo.",
      strategyHeading: "Superare schemi Difficili da 33 indizi con Coppie Nascoste",
      strategyParagraphs: [
        "Su una griglia da 33 indizi i Singoli spesso restano nascosti tra quattro o cinque candidati. Attiva le Note nelle linee più dense: quando due cifre compaiono solo nelle stesse due celle di un'unità, formano una Coppia Nascosta e puoi cancellare ogni altro candidato da quelle due celle.",
        "Combina Coppie Puntanti e Terzetti Nascosti per sbloccare le fasce centrali senza mai tirare a indovinare.",
      ],
      tipsHeading: "Checklist tattica per griglie Difficili",
      tips: [
        "Compila prima note accurate nelle righe e nei riquadri più popolati.",
        "Individua Coppie Nude e Nascoste: rimuovere note superflue fa emergere subito nuovi Singoli.",
        "Mai indovinare: ogni schema Difficile è verificato per garantire un'unica soluzione logica.",
      ],
      faqs: [
        {
          q: "Quanti indizi ha il Sudoku Difficile su SudokuSync?",
          a: "Gli schemi Difficili offrono 33 indizi iniziali e 48 celle vuote, richiedendo Coppie Puntanti e Terzetti Nascosti.",
        },
        {
          q: "Serve mai procedere per tentativi nel livello Difficile?",
          a: "Mai. Ogni griglia generata supera la verifica matematica di unicità.",
        },
      ],
      crossLinkLabel: "Sudoku Difficile",
      crossLinkSub: "33 Indizi • Coppie Nascoste",
    },
    EXPERT: {
      title: "Gioca a Sudoku Esperto Online Gratis | 27 Indizi & X-Wing — SudokuSync",
      description:
        "Dimostra la tua abilità sul Sudoku Esperto gratis da 27 indizi. Cerca schemi X-Wing, Terzetti Nascosti e catene di candidati su SudokuSync.",
      h1: "Gioca a Sudoku Esperto Online — Sfide X-Wing da 27 Indizi",
      badgeLabel: "27 Indizi • 54 Celle Vuote",
      targetAudience: "Tattici Avanzati & Giocatori Competitivi",
      primaryTechniques: [
        "Schema Rettangolare X-Wing",
        "Coppie e Terzetti Nascosti",
        "Potatura a Catena dei Candidati",
      ],
      leadSummary:
        "Il livello Esperto lascia solo 27 indizi iniziali e 54 celle vuote. Creato per solutori esperti, premia la gestione disciplinata delle note, il riconoscimento di schemi X-Wing e la massima precisione.",
      strategyHeading: "Padroneggiare il Sudoku Esperto da 27 indizi con lo Schema X-Wing",
      strategyParagraphs: [
        "Con soli 27 indizi molti riquadri partono con due o tre cifre. Quando scansione e coppie si fermano, filtra una cifra alla volta cercando uno schema X-Wing: se un candidato appare in esattamente due colonne della riga A e nelle stesse identiche due colonne della riga B, blocca un rettangolo logico che permette di eliminarlo dal resto di quelle colonne.",
        "Unisci X-Wing, riduzione Riquadro-Linea e Terzetti Nascosti per sbloccare lunghe catene proteggendo la validità del tuo record.",
      ],
      tipsHeading: "Checklist tattica per griglie Esperto",
      tips: [
        "Tocca una cifra sul tastierino per evidenziare numeri e note mentre cerchi rettangoli X-Wing.",
        "Controlla sempre le fasce da 3 riquadri per riduzioni Riquadro-Linea prima di catene complesse.",
        "Con il limite di 3 errori, la verifica calma delle note batte sempre la fretta sugli schemi da 27 indizi.",
      ],
      faqs: [
        {
          q: "Quanto è scarno uno schema Esperto su SudokuSync?",
          a: "Parte con soli 27 indizi e 54 celle vuote—quasi la metà rispetto al Facile—richiedendo Terzetti Nascosti ed eliminazioni X-Wing.",
        },
        {
          q: "I record personali valgono con errori illimitati o aiuti extra?",
          a: "No. Per tutelare le classifiche, i record personali richiedono il limite di 3 errori e il rispetto delle regole sugli aiuti.",
        },
      ],
      crossLinkLabel: "Sudoku Esperto",
      crossLinkSub: "27 Indizi • X-Wing",
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
      title: "Jogar Sudoku Difícil Online Grátis | 33 Pistas — SudokuSync",
      description:
        "Desafie-se no Sudoku Difícil grátis com 33 pistas no SudokuSync. Aplique Pares Ocultos, Trios e notas de candidatos para vencer grades complexas.",
      h1: "Jogar Sudoku Difícil Online — Estratégia com 33 Pistas",
      badgeLabel: "33 Pistas • 48 Células Vazias",
      targetAudience: "Jogadores Experientes & Analíticos",
      primaryTechniques: [
        "Pares e Trios Ocultos",
        "Eliminação por Pares Apontadores",
        "Notas Completas de Candidatos",
      ],
      leadSummary:
        "O Sudoku Difícil reduz as pistas para 33 e deixa 48 células vazias. Após as primeiras jogadas, o progresso exige anotações organizadas, identificação de Pares Ocultos e eliminação passo a passo.",
      strategyHeading: "Quebrando grades Difíceis de 33 pistas com Pares Ocultos",
      strategyParagraphs: [
        "Em tabuleiros de 33 pistas, os Únicos costumam ficar ocultos em células com quatro ou cinco candidatos. Ative o modo Notas nas linhas mais preenchidas: quando dois números aparecem exclusivamente nas mesmas duas células de uma unidade, formam um Par Oculto e permitem limpar os demais candidatos delas.",
        "Associe Pares Apontadores a Trios Ocultos para destravar blocos centrais sem jamais depender de sorte.",
      ],
      tipsHeading: "Checklist tático para grades Difíceis",
      tips: [
        "Preencha primeiro notas limpas nas fileiras e blocos mais densos antes de buscar pelo tabuleiro todo.",
        "Procure Pares Nus e Ocultos: limpar notas extras quase sempre expõe um novo dígito certo.",
        "Nunca chute: todo Sudoku Difícil passa por verificação de solução única.",
      ],
      faqs: [
        {
          q: "Quantas pistas o Sudoku Difícil tem no SudokuSync?",
          a: "Grades Difíceis começam com 33 pistas e 48 casas vazias, exigindo técnicas como Pares Apontadores e Trios Ocultos.",
        },
        {
          q: "É preciso chutar em tabuleiros Difíceis?",
          a: "Nunca. Todo quebra-cabeça gerado tem solução única comprovada por pura lógica.",
        },
      ],
      crossLinkLabel: "Sudoku Difícil",
      crossLinkSub: "33 Pistas • Pares Ocultos",
    },
    EXPERT: {
      title: "Jogar Sudoku Especialista Online Grátis | 27 Pistas & X-Wing — SudokuSync",
      description:
        "Teste sua maestria no Sudoku Especialista (Expert) grátis de 27 pistas. Encontre padrões X-Wing, Trios Ocultos e cadeias avançadas no SudokuSync.",
      h1: "Jogar Sudoku Especialista Online — Desafios X-Wing de 27 Pistas",
      badgeLabel: "27 Pistas • 54 Células Vazias",
      targetAudience: "Estrategistas Avançados & Competidores",
      primaryTechniques: [
        "Padrão Retangular X-Wing",
        "Pares e Trios Ocultos",
        "Poda Encadeada de Candidatos",
      ],
      leadSummary:
        "O modo Especialista reduz o tabuleiro a apenas 27 pistas iniciais e 54 células vazias. Feito para veteranos, recompensa anotações disciplinadas, reconhecimento do padrão X-Wing e calma sob pressão.",
      strategyHeading: "Vencendo grades Especialista de 27 pistas com o Padrão X-Wing",
      strategyParagraphs: [
        "Com apenas 27 pistas iniciais, muitos blocos começam com dois ou três números. Quando a varredura e os pares travarem, filtre um dígito por vez buscando um padrão X-Wing: encontre um candidato restrito exatamente às mesmas duas colunas em duas linhas diferentes, criando uma trava retangular que o elimina de todas as outras células dessas duas colunas.",
        "Combine o X-Wing com Redução Bloco-Linha e Trios Ocultos para dissolver cadeias longas mantendo seu histórico limpo.",
      ],
      tipsHeading: "Checklist tático para grades Especialista",
      tips: [
        "Toque um número no teclado para destacar todas as ocorrências e notas ao procurar retângulos X-Wing.",
        "Revise reduções Bloco-Linha em faixas de três blocos antes de buscar cadeias profundas.",
        "Sob o limite de 3 erros, conferir notas com paciência vence toques apressados em tabuleiros de 27 pistas.",
      ],
      faqs: [
        {
          q: "Quão vazio começa um Sudoku Especialista no SudokuSync?",
          a: "Começa com apenas 27 pistas e 54 espaços vazios—quase metade do Fácil—exigindo Trios Ocultos e eliminações X-Wing.",
        },
        {
          q: "Recordes Pessoais contam usando erros ilimitados ou dicas extras?",
          a: "Não. Para manter a integridade do placar, Recordes Pessoais exigem o limite padrão de 3 erros e jogo justo nas dicas.",
        },
      ],
      crossLinkLabel: "Sudoku Especialista",
      crossLinkSub: "27 Pistas • X-Wing",
    },
  },
};

