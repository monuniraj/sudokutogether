export interface KeyboardShortcutCardCopy {
  keys: string;
  title: string;
  desc: string;
}

export interface KeyboardGuideCopy {
  heading: string;
  subheading: string;
  intro: string;
  cards: readonly [
    KeyboardShortcutCardCopy,
    KeyboardShortcutCardCopy,
    KeyboardShortcutCardCopy,
    KeyboardShortcutCardCopy,
    KeyboardShortcutCardCopy,
    KeyboardShortcutCardCopy
  ];
  proTipTitle: string;
  crossLinkPrefix: string;
  crossLinkDailyLabel: string;
  crossLinkMiddle: string;
  crossLinkSolverLabel: string;
  crossLinkSuffix: string;
}

export type KeyboardGuideLocale =
  | "en"
  | "hi"
  | "de"
  | "ja"
  | "ko"
  | "es"
  | "fr"
  | "it"
  | "pt-BR";

export const KEYBOARD_GUIDE_TRANSLATIONS: Record<
  KeyboardGuideLocale,
  KeyboardGuideCopy
> = {
  en: {
    heading: "Desktop & Keyboard Shortcuts Guide",
    subheading: "Zero-mouse speed solving, menu arrow navigation & clear focus rings",
    intro:
      "Desktop and Chromebook solvers can clear Hard, Expert, and Daily Challenge boards far faster without lifting their hands off the keyboard. SudokuSync implements full tournament-standard keybindings alongside keyboard focus trapping, high-contrast pastel focus outlines on Home buttons, and arrow-key navigation inside every difficulty selector and settings dropdown.",
    cards: [
      {
        keys: "1–9  /  Numpad 1–9",
        title: "Digit & Fast-Fill Input",
        desc: "Enter candidates or final digits using either the top number row or a dedicated desktop numeric keypad. In Fast-Fill mode, pressing 1–9 locks or unlocks that active paint digit instantly.",
      },
      {
        keys: "Backspace  /  Delete",
        title: "Erase & Candidate Clear",
        desc: "Remove any user-entered digit or wipe pencil marks from the currently selected editable cell in one keystroke while keeping locked starter clues protected.",
      },
      {
        keys: "Ctrl + Z  /  Cmd + Z",
        title: "Instant Step Undo",
        desc: "Step backward cleanly through misplaced digits and candidate markups on Windows, Linux, Chromebook, or macOS without reaching for the toolbar.",
      },
      {
        keys: "Spacebar  /  N",
        title: "Pencil Notes Mode Toggle",
        desc: "Flip between Final Digit entry and Pencil Notes annotation mid-solve. Spacebar input is safely intercepted so the browser viewport never jumps or scrolls downward.",
      },
      {
        keys: "H",
        title: "Smart Logic Hint",
        desc: "Trigger a context-aware Smart Hint on the active grid when an Expert chain or 0-Single bottleneck blocks progress.",
      },
      {
        keys: "Arrow Keys  /  Tab  /  Esc",
        title: "Grid, Menu & Focus Navigation",
        desc: "Glide across cells with Up/Down/Left/Right arrows—or use Tab, Enter, Escape, and vertical arrows inside Home difficulty drawers and Room settings dropdowns with crisp visible focus rings and zero background page scroll.",
      },
    ],
    proTipTitle: "Put Keyboard Speed Into Practice",
    crossLinkPrefix:
      "Once the six shortcuts feel automatic under your fingers, test your solve pace on the globally seeded ",
    crossLinkDailyLabel: "Daily Challenge",
    crossLinkMiddle:
      " leaderboard—or enter printed newspaper puzzles rapidly with desktop keyboard navigation inside our ",
    crossLinkSolverLabel: "Free Sudoku Solver",
    crossLinkSuffix: ".",
  },

  hi: {
    heading: "Desktop & Keyboard Shortcuts गाइड",
    subheading: "बिना माउस के तेज़ सॉल्विंग, मेन्यू एरो नेविगेशन और साफ फोकस रिंग्स",
    intro:
      "अगर आप लैपटॉप या डेस्कटॉप पर खेलते हैं, तो बिना माउस टच किए सिर्फ कीबोर्ड से Hard, Expert और Daily Challenge बोर्ड्स काफी तेज़ी से क्लियर कर सकते हैं। SudokuSync में फुल इंडस्ट्री-स्टैंडर्ड शॉर्टकट्स के साथ-साथ Home बटनों पर साफ विज़ुअल फोकस आउटलाइन, मॉडल्स में फोकस-ट्रैपिंग और हर ड्रॉपडाउन मेन्यू में स्मूद एरो-की नेविगेशन मिलता है।",
    cards: [
      {
        keys: "1–9  /  Numpad 1–9",
        title: "नंबर और Fast-Fill एंट्री",
        desc: "ऊपरी नंबर रो या कीबोर्ड के अलग Numpad से सीधे डिजिट या पेंसिल नोट्स भरें। Fast-Fill मोड में 1–9 दबाकर आप उस नंबर को तुरंत लॉक या अनलॉक कर सकते हैं।",
      },
      {
        keys: "Backspace  /  Delete",
        title: "सेल क्लियर / इरेज़",
        desc: "सिलेक्टेड सेल में डाले गए गलत नंबर या पेंसिल नोट्स को एक की से मिटाएं—ओरिजिनल स्टार्टिंग क्ल्यूज़ हमेशा सेफ रहते हैं।",
      },
      {
        keys: "Ctrl + Z  /  Cmd + Z",
        title: "तुरंत Undo (वापस जाएं)",
        desc: "Windows, Linux और Mac पर बिना टूलबार क्लिक किए अपनी पिछली चाल या नोट बदलने का स्टेप तुरंत रिवर्स करें।",
      },
      {
        keys: "Spacebar  /  N",
        title: "Pencil / Notes मोड टॉगल",
        desc: "गेम के बीच में फाइनल नंबर और पेंसिल नोट्स मोड में तुरंत स्विच करें। Spacebar दबाने पर पेज नीचे स्क्रॉल नहीं होगा।",
      },
      {
        keys: "H",
        title: "स्मार्ट लॉजिक हिंट",
        desc: "जब Expert ग्रिड या किसी कठिन 0-Single बॉटलनेक पर अटक जाएं, तो तुरंत H दबाकर स्मार्ट हिंट लें।",
      },
      {
        keys: "Arrow Keys  /  Tab  /  Esc",
        title: "ग्रिड और मेन्यू नेविगेशन",
        desc: "9×9 ग्रिड के अंदर Up/Down/Left/Right एरो से घूमने के साथ-साथ, Home डिफिकल्टी ड्रॉअर और सेटिंग्स ड्रॉपडाउन में भी बिना बैकग्राउंड स्क्रॉल हुए एरो कीज़ और साफ फोकस रिंग से नेविगेट करें।",
      },
    ],
    proTipTitle: "कीबोर्ड स्पीड की प्रैक्टिस आज़माएं",
    crossLinkPrefix:
      "जब ये छह शॉर्टकट्स उंगलियों पर सेट हो जाएं, तो ग्लोबल सीड वाले ",
    crossLinkDailyLabel: "Daily Challenge",
    crossLinkMiddle:
      " में अपना बेस्ट टाइम बनाइए—या अख़बार की पज़ल को कीबोर्ड से फटाफट चेक करने के लिए हमारे ",
    crossLinkSolverLabel: "फ्री Sudoku Solver",
    crossLinkSuffix: " का इस्तेमाल करें।",
  },

  de: {
    heading: "Desktop- & Tastaturkürzel-Leitfaden",
    subheading: "Schnelles Lösen ohne Maus, Menü-Pfeilnavigation & klare Fokusringe",
    intro:
      "Auf Desktop und Laptop löst du Schwer-, Experten- und Tages-Rätsel deutlich schneller, wenn deine Hände komplett auf der Tastatur bleiben. SudokuSync kombiniert klassische Turnier-Tastenkürzel mit sauberem Fokus-Trapping in Dialogen, gut sichtbaren Fokus-Umrissen auf der Startseite und echter Pfeiltasten-Navigation in allen Auswahlmenüs.",
    cards: [
      {
        keys: "1–9  /  Numpad 1–9",
        title: "Ziffern- & Fast-Fill-Eingabe",
        desc: "Trage Ziffern oder Kandidaten wahlweise über die obere Zahlenreihe oder den Ziffernblock ein. Im Fast-Fill-Modus fixierst oder löst du mit 1–9 sofort die aktive Ziffer.",
      },
      {
        keys: "Backspace  /  Delete",
        title: "Feld leeren / löschen",
        desc: "Löscht selbst gesetzte Ziffern oder Bleistift-Notizen im aktiven Feld mit einem Tastendruck, während feste Startvorgaben geschützt bleiben.",
      },
      {
        keys: "Strg + Z  /  Cmd + Z",
        title: "Schritt rückgängig (Undo)",
        desc: "Mache Fehleingaben oder Notizänderungen unter Windows, Linux und macOS sofort rückgängig, ohne die Maus zu bewegen.",
      },
      {
        keys: "Leertaste  /  N",
        title: "Notiz-Modus umschalten",
        desc: "Wechsle blitzschnell zwischen fester Zahl und Bleistift-Notiz. Die Leertaste wird sauber abgefangen, sodass die Seite nicht nach unten scrollt.",
      },
      {
        keys: "H",
        title: "Smarter Logik-Hinweis",
        desc: "Löst einen kontextbezogenen Hinweis aus, sobald eine Experten-Kette oder 0-Single-Sackgasse den Spielfluss stoppt.",
      },
      {
        keys: "Pfeiltasten  /  Tab  /  Esc",
        title: "Brett-, Menü- & Fokussteuerung",
        desc: "Bewege dich im Gitter mit den Pfeiltasten—und navigiere per Tab, Enter, Escape sowie Pfeil hoch/runter in Schwierigkeitslisten und Dropdowns mit klaren Fokusringen ohne Seitenscrollen.",
      },
    ],
    proTipTitle: "Tastaturtempo direkt testen",
    crossLinkPrefix:
      "Sobald die sechs Kürzel flüssig sitzen, miss dein Tempo in unserem weltweit synchronisierten ",
    crossLinkDailyLabel: "Tages-Rätsel",
    crossLinkMiddle:
      " oder übertrage gedruckte Zeitungsrätsel blitzschnell per Tastatur in den ",
    crossLinkSolverLabel: "kostenlosen Sudoku-Löser",
    crossLinkSuffix: ".",
  },

  ja: {
    heading: "デスクトップ＆キーボードショートカットガイド",
    subheading: "マウス不要の高速入力・メニュー矢印操作・明確なフォーカス表示",
    intro:
      "PCやノートパソコンでは、キーボードだけで操作を完結させることで「むずかしい」「エキスパート」「デイリー問題」の攻略スピードが格段に上がります。SudokuSyncは世界標準の数独ショートカットに加え、モーダル内のフォーカストラップ、ホーム画面ボタンの視認性の高いフォーカス枠、各種ドロップダウンの矢印キー移動に対応しています。",
    cards: [
      {
        keys: "1–9  /  テンキー 1–9",
        title: "数字・ファストフィル入力",
        desc: "キーボード上段の数字キーとテンキーの両方に対応。ファストフィル（連続入力）モード中は 1〜9 を押すだけでペイント数字を即座に選択・解除できます。",
      },
      {
        keys: "Backspace  /  Delete",
        title: "マス消去・メモ削除",
        desc: "選択中のマスに入力した数字や鉛筆メモをワンタッチで消去します。最初から配置されている固定ヒントは誤って消えません。",
      },
      {
        keys: "Ctrl + Z  /  Cmd + Z",
        title: "1手戻す（アンドゥ）",
        desc: "Windows・Linux・Macの環境を問わず、カーソルを移動せずに誤入力や候補メモの変更を即座に元へ戻せます。",
      },
      {
        keys: "Space  /  N",
        title: "メモ（鉛筆）モード切替",
        desc: "確定数字の入力と候補メモを瞬時に切り替えます。Spaceキー押下時の不要なページスクロールも完全に防止しています。",
      },
      {
        keys: "H",
        title: "スマートヒント",
        desc: "エキスパート帯の連鎖や 0-Single 停滞で詰まった際、Hキーで論理に基づいた次の一手ヒントを呼び出します。",
      },
      {
        keys: "矢印キー  /  Tab  /  Esc",
        title: "盤面・メニュー・フォーカス操作",
        desc: "上下左右キーでのマス移動に加え、ホームの難易度選択シートや部屋設定メニュー内でも背景をスクロールさせず矢印キー・Tab・Escで快適に操作できます。",
      },
    ],
    proTipTitle: "ショートカットでタイム短縮に挑戦",
    crossLinkPrefix:
      "6つのキー操作に慣れてきたら、世界中のプレイヤーと同条件で競える ",
    crossLinkDailyLabel: "デイリーチャレンジ",
    crossLinkMiddle:
      " で記録に挑戦してみてください。新聞や雑誌の問題をキーボードで素早く検証したい場合は ",
    crossLinkSolverLabel: "無料数独ソルバー",
    crossLinkSuffix: " も便利です。",
  },

  ko: {
    heading: "데스크톱 & 키보드 단축키 가이드",
    subheading: "마우스 없는 빠른 풀이, 메뉴 방향키 탐색 & 선명한 포커스 링",
    intro:
      "데스크톱이나 노트북에서는 키보드만으로 입력과 탐색을 처리할 때 어려움·전문가·일일 챌린지 보드의 풀이 속도가 훨씬 빨라집니다. SudokuSync는 업계 표준 스도쿠 단축키뿐 아니라 모달 내부 포커스 트랩, 홈 버튼의 선명한 포커스 표시, 드롭다운 메뉴 방향키 이동을 완벽히 지원합니다.",
    cards: [
      {
        keys: "1–9  /  숫자 패드 1–9",
        title: "숫자 & 빠른 채우기 입력",
        desc: "상단 숫자 행과 오른쪽 숫자 키패드(Numpad)를 모두 지원합니다. 빠른 채우기 모드에서는 1–9 키로 페인트 숫자를 즉시 잠그거나 해제할 수 있습니다.",
      },
      {
        keys: "Backspace  /  Delete",
        title: "칸 비우기 / 지우기",
        desc: "현재 선택한 빈칸에 입력한 숫자나 연필 메모를 한 번에 지웁니다. 기본 제공된 고정 힌트는 안전하게 보호됩니다.",
      },
      {
        keys: "Ctrl + Z  /  Cmd + Z",
        title: "즉시 실행 취소 (Undo)",
        desc: "Windows, Linux, macOS에서 툴바를 클릭할 필요 없이 방금 입력한 숫자나 후보 메모 변경을 바로 되돌립니다.",
      },
      {
        keys: "Spacebar  /  N",
        title: "연필 메모 모드 전환",
        desc: "확정 숫자 입력과 후보 메모 모드를 즉시 오갑니다. Spacebar를 눌러도 브라우저 화면이 아래로 스크롤되지 않도록 안전하게 막아 두었습니다.",
      },
      {
        keys: "H",
        title: "스마트 논리 힌트",
        desc: "전문가 체인이나 0-Single 막힘 구간에서 막혔을 때 H 키를 눌러 상황에 맞는 힌트를 바로 받을 수 있습니다.",
      },
      {
        keys: "방향키  /  Tab  /  Esc",
        title: "보드·메뉴 & 포커스 탐색",
        desc: "상하좌우 방향키로 보드 칸을 이동하고, 홈 난이도 선택 창과 방 설정 드롭다운 안에서도 페이지 스크롤 없이 방향키·Tab·Esc와 뚜렷한 포커스 링으로 조작하세요.",
      },
    ],
    proTipTitle: "키보드 스피드를 실전에서 검증하세요",
    crossLinkPrefix:
      "여섯 가지 단축키가 손에 익었다면 전 세계 동일 시드로 겨루는 ",
    crossLinkDailyLabel: "일일 챌린지",
    crossLinkMiddle:
      " 에서 최고 기록에 도전해 보세요. 종이 스도쿠를 키보드로 빠르게 입력해 검산하려면 ",
    crossLinkSolverLabel: "무료 스도쿠 풀이기",
    crossLinkSuffix: " 를 바로 열어 확인할 수 있습니다.",
  },

  es: {
    heading: "Guía de atajos de escritorio y teclado",
    subheading: "Resolución rápida sin ratón, flechas en menús y foco visible",
    intro:
      "En ordenador o portátil puedes resolver tableros Difícil, Experto y Reto Diario mucho más rápido sin apartar las manos del teclado. SudokuSync integra los seis atajos estándar de torneo junto con retención de foco en ventanas modales, anillos de enfoque nítidos en los botones de inicio y navegación con flechas dentro de cada selector.",
    cards: [
      {
        keys: "1–9  /  Teclado numérico 1–9",
        title: "Entrada de dígitos y Pintado Rápido",
        desc: "Introduce cifras o notas tanto con la fila superior como con el teclado numérico (Numpad). En modo Pintado Rápido, pulsar 1–9 activa o libera ese dígito al instante.",
      },
      {
        keys: "Retroceso (Backspace)  /  Supr (Delete)",
        title: "Borrar casilla y notas",
        desc: "Elimina cualquier número propio o marca a lápiz de la celda seleccionada con una sola pulsación manteniendo protegidas las pistas iniciales.",
      },
      {
        keys: "Ctrl + Z  /  Cmd + Z",
        title: "Deshacer al instante",
        desc: "Retrocede paso a paso por dígitos mal colocados o cambios de candidatos en Windows, Linux y macOS sin mover el ratón.",
      },
      {
        keys: "Espacio  /  N",
        title: "Alternar modo Notas a Lápiz",
        desc: "Cambia al vuelo entre cifra definitiva y anotación de candidatos. La barra espaciadora evita por defecto cualquier salto o desplazamiento vertical de la página.",
      },
      {
        keys: "H",
        title: "Pista lógica inteligente",
        desc: "Solicita una pista contextual cuando una cadena Experto o un bloqueo 0-Single detenga tu avance.",
      },
      {
        keys: "Flechas  /  Tab  /  Esc",
        title: "Navegación en tablero y menús",
        desc: "Muévete por la cuadrícula 9×9 con las cuatro flechas y desplázate dentro de selectores de dificultad, ajustes e idioma sin que la página haga scroll.",
      },
    ],
    proTipTitle: "Pon a prueba tu velocidad con el teclado",
    crossLinkPrefix:
      "Cuando domines estos seis controles, mide tu tiempo en el ",
    crossLinkDailyLabel: "Reto Diario",
    crossLinkMiddle:
      " sincronizado globalmente, o transcribe sudokus impresos a toda velocidad en nuestro ",
    crossLinkSolverLabel: "Solucionador de Sudoku gratis",
    crossLinkSuffix: ".",
  },

  fr: {
    heading: "Guide des raccourcis clavier & bureau",
    subheading: "Résolution rapide sans souris, navigation au clavier et focus visible",
    intro:
      "Sur ordinateur, vous résolvez les grilles Difficile, Expert et Défi du Jour bien plus vite sans quitter le clavier. SudokuSync réunit les six raccourcis de référence ainsi qu'un piégeage strict du focus dans les fenêtres, des contours de sélection bien visibles sur l'accueil et le défilement au fléchage dans chaque menu.",
    cards: [
      {
        keys: "1–9  /  Pavé numérique 1–9",
        title: "Saisie directe & Remplissage rapide",
        desc: "Saisissez vos chiffres depuis la rangée supérieure ou le pavé numérique dédié. En mode Remplissage rapide, appuyer sur 1–9 verrouille ou libère instantanément le chiffre actif.",
      },
      {
        keys: "Retour arrière  /  Suppr",
        title: "Effacer case & notes",
        desc: "Supprimez en une touche tout chiffre saisi ou brouillon dans la case sélectionnée tout en préservant les indices de départ.",
      },
      {
        keys: "Ctrl + Z  /  Cmd + Z",
        title: "Annulation immédiate",
        desc: "Revenez proprement sur une erreur ou une modification de candidats sous Windows, Linux et macOS sans quitter la grille des yeux.",
      },
      {
        keys: "Espace  /  N",
        title: "Basculer le mode Notes",
        desc: "Alternez instantanément entre chiffre final et annotations. La barre d'espace est interceptée pour empêcher tout défilement parasite de la page.",
      },
      {
        keys: "H",
        title: "Indice logique ciblé",
        desc: "Déclenchez un indice intelligent lorsqu'une impasse 0-Single ou une chaîne Expert bloque votre progression.",
      },
      {
        keys: "Flèches  /  Tab  /  Échap",
        title: "Navigation grille, menus & focus",
        desc: "Parcourez la grille 9×9 aux flèches et naviguez dans les sélecteurs de difficulté, salons et langues sans faire défiler l'arrière-plan, avec anneaux de focus bien nets.",
      },
    ],
    proTipTitle: "Passez à la vitesse supérieure",
    crossLinkPrefix:
      "Une fois ces six réflexes acquis, chronométrez vos performances sur le ",
    crossLinkDailyLabel: "Défi du Jour",
    crossLinkMiddle:
      " mondial—ou recopiez rapidement vos grilles papier au clavier dans notre ",
    crossLinkSolverLabel: "Solveur de Sudoku gratuit",
    crossLinkSuffix: ".",
  },

  it: {
    heading: "Guida alle scorciatoie da tastiera e desktop",
    subheading: "Risoluzione veloce senza mouse, frecce nei menu e focus visibile",
    intro:
      "Da computer puoi completare schemi Difficile, Esperto e Sfida del Giorno molto più rapidamente restando sempre sulla tastiera. SudokuSync offre le sei scorciatoie standard da torneo insieme al blocco del focus nelle finestre modali, contorni di selezione nitidi nella schermata iniziale e navigazione con frecce in tutti i menu a discesa.",
    cards: [
      {
        keys: "1–9  /  Tastierino 1–9",
        title: "Inserimento cifre & Fast-Fill",
        desc: "Digita numeri o candidati sia dalla fila superiore sia dal tastierino numerico. In modalità Fast-Fill, premere 1–9 blocca o sblocca subito la cifra attiva.",
      },
      {
        keys: "Backspace  /  Canc (Delete)",
        title: "Cancella cella & appunti",
        desc: "Rimuovi all'istante una cifra inserita o le note a matita nella cella selezionata, lasciando intatti gli indizi originali.",
      },
      {
        keys: "Ctrl + Z  /  Cmd + Z",
        title: "Annulla mossa istantaneo",
        desc: "Torna indietro passo dopo passo tra numeri errati e candidati su Windows, Linux o macOS senza toccare il mouse.",
      },
      {
        keys: "Spazio  /  N",
        title: "Attiva/disattiva Note",
        desc: "Alterna subito tra inserimento definitivo e annotazioni a matita. La barra spaziatrice non fa mai scorrere la pagina verso il basso.",
      },
      {
        keys: "H",
        title: "Suggerimento logico",
        desc: "Richiedi un aiuto mirato quando uno stallo 0-Single o una catena Esperto frena la risoluzione.",
      },
      {
        keys: "Frecce  /  Tab  /  Esc",
        title: "Griglia, menu & gestione focus",
        desc: "Spostati nella griglia 9×9 con le quattro frecce e naviga nei selettori di difficoltà, stanza e lingua con frecce, Tab ed Esc senza scroll indesiderati.",
      },
    ],
    proTipTitle: "Metti alla prova la tua velocità",
    crossLinkPrefix:
      "Quando queste sei scorciatoie diventano automatiche, sfida la classifica globale nella ",
    crossLinkDailyLabel: "Sfida del Giorno",
    crossLinkMiddle:
      " oppure trascrivi velocemente da tastiera gli schemi su carta dentro il nostro ",
    crossLinkSolverLabel: "Risolutore Sudoku gratuito",
    crossLinkSuffix: ".",
  },

  "pt-BR": {
    heading: "Guia de atalhos de teclado e desktop",
    subheading: "Resolução ágil sem mouse, setas nos menus e foco visível",
    intro:
      "No computador ou notebook, você resolve grades Difícil, Especialista e do Desafio Diário muito mais rápido sem tirar as mãos do teclado. O SudokuSync combina os seis atalhos padrão de torneio com travamento de foco em modais, contornos nítidos nos botões iniciais e navegação por setas em todos os seletores e menus.",
    cards: [
      {
        keys: "1–9  /  Teclado numérico 1–9",
        title: "Entrada numérica e Preenchimento Rápido",
        desc: "Digite números finais ou notas usando a fileira superior ou o teclado numérico (Numpad). No modo Preenchimento Rápido, 1–9 fixa ou libera o dígito na hora.",
      },
      {
        keys: "Backspace  /  Delete",
        title: "Apagar célula e notas",
        desc: "Limpe qualquer número digitado ou anotação a lápis na célula ativa com um toque, preservando todas as pistas originais bloqueadas.",
      },
      {
        keys: "Ctrl + Z  /  Cmd + Z",
        title: "Desfazer instantâneo",
        desc: "Volte atrás passo a passo em jogadas ou rascunhos no Windows, Linux e macOS sem precisar clicar na barra de ações.",
      },
      {
        keys: "Barra de Espaço  /  N",
        title: "Alternar modo Notas a Lápis",
        desc: "Alterne na hora entre número definitivo e rascunho de candidatos. A barra de espaço é interceptada para que a página nunca role para baixo.",
      },
      {
        keys: "H",
        title: "Dica lógica inteligente",
        desc: "Acione uma dica contextual quando um bloqueio 0-Single ou cadeia Especialista travar o avanço do tabuleiro.",
      },
      {
        keys: "Setas  /  Tab  /  Esc",
        title: "Grade, menus e navegação por foco",
        desc: "Percorra a grade 9×9 com as setas direcionais e navegue dentro dos menus de dificuldade, sala e idioma usando setas, Tab e Esc sem rolar a página.",
      },
    ],
    proTipTitle: "Teste seu ritmo no teclado",
    crossLinkPrefix:
      "Depois que os seis atalhos ficarem naturais, teste sua velocidade na tabela global do ",
    crossLinkDailyLabel: "Desafio Diário",
    crossLinkMiddle:
      " ou digite tabuleiros de jornal rapidamente pelo teclado no nosso ",
    crossLinkSolverLabel: "Solucionador de Sudoku grátis",
    crossLinkSuffix: ".",
  },
};

export function getKeyboardGuideCopy(lang?: string | null): KeyboardGuideCopy {
  const normalized = (lang || "en").trim().toLowerCase();
  if (normalized === "hi" || normalized.startsWith("hi-")) {
    return KEYBOARD_GUIDE_TRANSLATIONS.hi;
  }
  if (normalized === "de" || normalized.startsWith("de-")) {
    return KEYBOARD_GUIDE_TRANSLATIONS.de;
  }
  if (normalized === "ja" || normalized.startsWith("ja-")) {
    return KEYBOARD_GUIDE_TRANSLATIONS.ja;
  }
  if (normalized === "ko" || normalized.startsWith("ko-")) {
    return KEYBOARD_GUIDE_TRANSLATIONS.ko;
  }
  if (normalized === "es" || normalized.startsWith("es-")) {
    return KEYBOARD_GUIDE_TRANSLATIONS.es;
  }
  if (normalized === "fr" || normalized.startsWith("fr-")) {
    return KEYBOARD_GUIDE_TRANSLATIONS.fr;
  }
  if (normalized === "it" || normalized.startsWith("it-")) {
    return KEYBOARD_GUIDE_TRANSLATIONS.it;
  }
  if (normalized === "pt-br" || normalized.startsWith("pt")) {
    return KEYBOARD_GUIDE_TRANSLATIONS["pt-BR"];
  }
  return KEYBOARD_GUIDE_TRANSLATIONS.en;
}

