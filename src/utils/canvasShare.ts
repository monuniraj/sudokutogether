import { SudokuBoardState } from "../components/game/SudokuBoard";
import { getCurrentLanguage, DIFFICULTY_TRANSLATIONS } from "../i18n/useTranslation";

export type ShareDifficulty = "EASY" | "MEDIUM" | "HARD" | "EXPERT" | string;

export interface ShareCanvasGameState {
  boardState?: SudokuBoardState | null;
  grid?: {
    value: number;
    isOriginalClue: boolean;
    notes?: number[] | Set<number>;
  }[][];
  solutionGrid?: number[][];
  difficulty?: string;
  time?: string;
  sessionSeconds?: number;
  playerName?: string;
  bestTime?: string;
  isNewRecord?: boolean;
  isWon?: boolean;
  darkMode?: boolean;
  roomCode?: string;
  currentMistakesCount?: number;
  maxMistakesLimit?: number;
  seed?: string | number;
  language?: string;
}


export interface ShareI18nStrings {
  sticker: {
    record: string;
    excellent: string;
    great: string;
    solved: string;
    defeat_close: string;
    defeat_freeze: string;
    defeat_backup: string;
  };
  hook: {
    win_record: (time: string) => string;
    win_normal: (time: string) => string;
    defeat: string;
  };
  hud: {
    best: (time: string) => string;
    err: (count: number, max: number) => string;
  };
  footer: {
    room_code: string;
  };
  modal: {
    title: string;
    generating: string;
    btn_share: string;
    btn_save: string;
    toast_copied: string;
    share_title: string;
    share_msg: (url: string) => string;
  };
}

export const SHARE_I18N: Record<string, ShareI18nStrings> = {
  en: {
    sticker: {
      record: "NEW RECORD!",
      excellent: "EXCELLENT TIME",
      great: "GREAT TIME",
      solved: "SOLVED",
      defeat_close: "SO CLOSE!",
      defeat_freeze: "BRAIN FREEZE!",
      defeat_backup: "NEED BACKUP!",
    },
    hook: {
      win_record: (t) => `New best time ${t}! Can you beat it?`,
      win_normal: (t) => `I beat this puzzle in ${t}! Beat my time!`,
      defeat: "Stuck! Can you finish this puzzle?",
    },
    hud: {
      best: (t) => `BEST ${t}`,
      err: (c, m) => `ERR: ${c}/${m}`,
    },
    footer: {
      room_code: "Room Code: ",
    },
    modal: {
      title: "SHARE SCREENSHOT",
      generating: "Generating Screenshot...",
      btn_share: "Share this Screenshot",
      btn_save: "Save to Gallery",
      toast_copied: "Link copied to clipboard! Paste it alongside your image.",
      share_title: "Sudoku Sync Challenge",
      share_msg: (url) => `Can you beat my game? Play here: ${url}`,
    },
  },
  hi: {
    sticker: {
      record: "नया रिकॉर्ड!",
      excellent: "गज़ब की स्पीड!",
      great: "शानदार टाइम!",
      solved: "पहेली हल!",
      defeat_close: "बस थोड़ा सा रह गया!",
      defeat_freeze: "दिमाग की बत्ती गुल!",
      defeat_backup: "मदद चाहिए!",
    },
    hook: {
      win_record: (t) => `नया बेस्ट रिकॉर्ड ${t}! दम है तो तोड़ के दिखाओ!`,
      win_normal: (t) => `मैंने इसे ${t} में हल किया! मेरा टाइम बीट करो!`,
      defeat: "अटक गया यार! क्या तुम इसे पूरा कर सकते हो?",
    },
    hud: {
      best: (t) => `बेस्ट ${t}`,
      err: (c, m) => `गलती: ${c}/${m}`,
    },
    footer: {
      room_code: "कमरा कोड: ",
    },
    modal: {
      title: "स्क्रीनशॉट शेयर करें",
      generating: "स्क्रीनशॉट बन रहा है...",
      btn_share: "स्क्रीनशॉट शेयर करें",
      btn_save: "गैलरी में सेव करें",
      toast_copied: "लिंक कॉपी हो गया! इमेज के साथ पेस्ट करें।",
      share_title: "सुडोकू सिंक चैलेंज",
      share_msg: (url) => `क्या तुम मेरा स्कोर हरा सकते हो? यहाँ खेलो: ${url}`,
    },
  },
  de: {
    sticker: {
      record: "NEUER REKORD!",
      excellent: "TOP-ZEIT!",
      great: "STARK GELÖST!",
      solved: "GELÖST",
      defeat_close: "FAST GESCHAFFT!",
      defeat_freeze: "KNOTEN IM KOPF!",
      defeat_backup: "BRAUCHE HILFE!",
    },
    hook: {
      win_record: (t) => `Neuer Rekord in ${t}! Kannst du das toppen?`,
      win_normal: (t) => `In ${t} gelöst! Schlag meine Zeit!`,
      defeat: "Ich hänge fest! Kannst du das beenden?",
    },
    hud: {
      best: (t) => `BEST ${t}`,
      err: (c, m) => `FEHLER: ${c}/${m}`,
    },
    footer: {
      room_code: "Raum-Code: ",
    },
    modal: {
      title: "SCREENSHOT TEILEN",
      generating: "Erstelle Screenshot...",
      btn_share: "Screenshot teilen",
      btn_save: "In Galerie speichern",
      toast_copied: "Link kopiert! Zusammen mit dem Bild einfügen.",
      share_title: "Sudoku Sync Challenge",
      share_msg: (url) => `Schlägst du meine Zeit? Jetzt spielen: ${url}`,
    },
  },
  ja: {
    sticker: {
      record: "新記録達成！",
      excellent: "神タイム！",
      great: "ナイスクリア！",
      solved: "クリア！",
      defeat_close: "あと一歩だった！",
      defeat_freeze: "脳がフリーズ！",
      defeat_backup: "誰か助けて！",
    },
    hook: {
      win_record: (t) => `自己ベスト ${t} 達成！この記録抜ける？`,
      win_normal: (t) => `${t} でクリア！タイムアタック勝負だ！`,
      defeat: "ギブアップ…！代わりにクリアしてくれる？",
    },
    hud: {
      best: (t) => `ベスト ${t}`,
      err: (c, m) => `ミス: ${c}/${m}`,
    },
    footer: {
      room_code: "ルームコード: ",
    },
    modal: {
      title: "スクリーンショット共有",
      generating: "画像を生成中...",
      btn_share: "スクショをシェア",
      btn_save: "アルバムに保存",
      toast_copied: "リンクをコピーしました！画像と一緒にシェアしてね。",
      share_title: "数独シンク 対戦チャレンジ",
      share_msg: (url) => `私のタイムに勝てるかな？ここから挑戦：${url}`,
    },
  },
  ko: {
    sticker: {
      record: "신기록 달성!",
      excellent: "역대급 스피드!",
      great: "나이스 클리어!",
      solved: "클리어!",
      defeat_close: "아깝다, 한 끗 차이!",
      defeat_freeze: "뇌정지 옴!",
      defeat_backup: "도움이 필요해!",
    },
    hook: {
      win_record: (t) => `새로운 기록 ${t}! 나 이길 수 있어?`,
      win_normal: (t) => `${t}만에 클리어! 내 기록 깨봐!`,
      defeat: "여기서 막힘... 대신 풀어줄 사람?",
    },
    hud: {
      best: (t) => `최고 ${t}`,
      err: (c, m) => `오답: ${c}/${m}`,
    },
    footer: {
      room_code: "방 코드: ",
    },
    modal: {
      title: "스크린샷 공유",
      generating: "이미지 생성 중...",
      btn_share: "스크린샷 공유하기",
      btn_save: "갤러리에 저장",
      toast_copied: "링크 복사 완료! 이미지와 함께 붙여넣으세요.",
      share_title: "스도쿠 싱크 챌린지",
      share_msg: (url) => `내 기록 넘을 수 있어? 도전해봐: ${url}`,
    },
  },
  es: {
    sticker: {
      record: "¡NUEVO RÉCORD!",
      excellent: "¡TIEMPAZO!",
      great: "¡BUEN TIEMPO!",
      solved: "RESUELTO",
      defeat_close: "¡POR NADA!",
      defeat_freeze: "¡CEREBRO FRITO!",
      defeat_backup: "¡NECESITO AYUDA!",
    },
    hook: {
      win_record: (t) => `¡Nuevo récord en ${t}! ¿Podrás superarlo?`,
      win_normal: (t) => `¡Lo completé en ${t}! ¡A ver si me ganas!`,
      defeat: "¡Me quedé atascado! ¿Puedes terminarlo tú?",
    },
    hud: {
      best: (t) => `RÉCORD ${t}`,
      err: (c, m) => `FALLOS: ${c}/${m}`,
    },
    footer: {
      room_code: "Código de sala: ",
    },
    modal: {
      title: "COMPARTIR CAPTURA",
      generating: "Generando captura...",
      btn_share: "Compartir captura",
      btn_save: "Guardar en galería",
      toast_copied: "¡Enlace copiado! Pégalo junto con tu imagen.",
      share_title: "Desafío Sudoku Sync",
      share_msg: (url) => `¿Puedes ganarme? Juega aquí: ${url}`,
    },
  },
  fr: {
    sticker: {
      record: "NOUVEAU RECORD !",
      excellent: "CHRONO PARFAIT !",
      great: "BIEN JOUÉ !",
      solved: "RÉSOLU",
      defeat_close: "À ÇA DU BUT !",
      defeat_freeze: "PAGE BLANCHE !",
      defeat_backup: "À L'AIDE !",
    },
    hook: {
      win_record: (t) => `Nouveau record en ${t} ! Capable de faire mieux ?`,
      win_normal: (t) => `Terminé en ${t} ! Bats mon chrono !`,
      defeat: "Je cale ! Tu peux finir cette grille ?",
    },
    hud: {
      best: (t) => `TOP ${t}`,
      err: (c, m) => `ERREURS : ${c}/${m}`,
    },
    footer: {
      room_code: "Code de salon : ",
    },
    modal: {
      title: "PARTAGER LA CAPTURE",
      generating: "Génération en cours...",
      btn_share: "Partager la capture",
      btn_save: "Enregistrer dans la galerie",
      toast_copied: "Lien copié ! Colle-le avec ton image.",
      share_title: "Défi Sudoku Sync",
      share_msg: (url) => `Tu peux battre mon score ? Reçois le défi : ${url}`,
    },
  },
  it: {
    sticker: {
      record: "NUOVO RECORD!",
      excellent: "TEMPO BOMBA!",
      great: "OTTIMO TEMPO!",
      solved: "RISOLTO",
      defeat_close: "QUASI FATTA!",
      defeat_freeze: "BLOCCO TOTALE!",
      defeat_backup: "SERVE UN AIUTO!",
    },
    hook: {
      win_record: (t) => `Nuovo record in ${t}! Riesci a battermi?`,
      win_normal: (t) => `Finito in ${t}! Sfida il mio tempo!`,
      defeat: "Mi sono bloccato! Riesci a finirlo tu?",
    },
    hud: {
      best: (t) => `TOP ${t}`,
      err: (c, m) => `ERRORI: ${c}/${m}`,
    },
    footer: {
      room_code: "Codice stanza: ",
    },
    modal: {
      title: "CONDIVIDI SCREENSHOT",
      generating: "Creazione in corso...",
      btn_share: "Condividi screenshot",
      btn_save: "Salva nella galleria",
      toast_copied: "Link copiato! Incollalo insieme alla tua immagine.",
      share_title: "Sfida Sudoku Sync",
      share_msg: (url) => `Riesci a battermi? Gioca qui: ${url}`,
    },
  },
  pt: {
    sticker: {
      record: "NOVO RECORDE!",
      excellent: "TEMPO MONSTRO!",
      great: "MANDOU BEM!",
      solved: "RESOLVIDO",
      defeat_close: "FOI POR POUCO!",
      defeat_freeze: "DEU TILT!",
      defeat_backup: "SOCORRO, TRAVEI!",
    },
    hook: {
      win_record: (t) => `Novo recorde de ${t}! Duvido você bater!`,
      win_normal: (t) => `Fechei em ${t}! Tenta bater meu tempo!`,
      defeat: "Travei legal! Consegue terminar esse pra mim?",
    },
    hud: {
      best: (t) => `MELHOR ${t}`,
      err: (c, m) => `ERROS: ${c}/${m}`,
    },
    footer: {
      room_code: "Código da sala: ",
    },
    modal: {
      title: "COMPARTILHAR CAPTURA",
      generating: "Gerando captura...",
      btn_share: "Compartilhar captura",
      btn_save: "Salvar na galeria",
      toast_copied: "Link copiado! Cole junto com a sua imagem.",
      share_title: "Desafio Sudoku Sync",
      share_msg: (url) => `Consegue me vencer? Jogue aqui: ${url}`,
    },
  },
};
SHARE_I18N["pt-BR"] = SHARE_I18N["pt"];

export const getShareI18n = (lang?: string): ShareI18nStrings => {
  const code = (lang || getCurrentLanguage() || "en").toLowerCase();
  if (SHARE_I18N[code]) return SHARE_I18N[code];
  const shortCode = code.split("-")[0];
  if (SHARE_I18N[shortCode]) return SHARE_I18N[shortCode];
  return SHARE_I18N.en;
};

export const getLocalizedDifficulty = (diff: string, lang?: string): string => {
  const normalizedKey = diff.toLowerCase() as 'easy' | 'medium' | 'hard' | 'expert';
  const rawLang = (lang || getCurrentLanguage() || "en").toLowerCase();
  const langKey = rawLang === 'pt-br' ? 'pt' : rawLang.split('-')[0];
  const translated = DIFFICULTY_TRANSLATIONS[langKey]?.[normalizedKey] || DIFFICULTY_TRANSLATIONS.en?.[normalizedKey] || diff;
  return translated.toUpperCase();
};

export interface ShareCanvasThemePalette {
  cardBgStart: string;
  cardBgMid: string;
  cardBgEnd: string;
  surfaceCardBg: string;
  surfaceCardBorder: string;
  pillBg: string;
  pillText: string;
  pillBorder: string;
  stickerBg: string;
  stickerText: string;
  stickerBorder: string;
  stickerShadow: string;
  boardBaseBg: string;
  cellTintBg: string;
  crosshairSiblingBg: string;
  activeCellBg: string;
  identicalCellBg: string;
  gridThinLine: string;
  gridThickLine: string;
  primaryText: string;
  secondaryText: string;
  timerColor: string;
  errColor: string;
  clueColor: string;
  userColor: string;
  errorColor: string;
  errorCellBg: string;
  errorSelectedBg: string;
  noteColor: string;
  footerBg: string;
  footerBorder: string;
  footerText: string;
  footerAccent: string;
}

/**
 * Exact pastel & dark color science tokens mirrored from `App.tsx` and `SudokuBoard.tsx`.
 */
const LIGHT_THEMES: Record<string, ShareCanvasThemePalette> = {
  EASY: {
    cardBgStart: "#F0FDF4",
    cardBgMid: "#FDFBF7",
    cardBgEnd: "#DCFCE7",
    surfaceCardBg: "#FFFFFF",
    surfaceCardBorder: "rgba(6, 95, 70, 0.15)",
    pillBg: "#D1FAE5",
    pillText: "#065F46",
    pillBorder: "rgba(6, 95, 70, 0.20)",
    stickerBg: "#ECFDF5",
    stickerText: "#047857",
    stickerBorder: "#059669",
    stickerShadow: "rgba(0, 0, 0, 0.06)",
    boardBaseBg: "#FFFFFF",
    cellTintBg: "rgba(34, 197, 94, 0.12)",
    crosshairSiblingBg: "#FFFFFF",
    activeCellBg: "#86EFAC",
    identicalCellBg: "#86EFAC",
    gridThinLine: "rgba(6, 95, 70, 0.20)",
    gridThickLine: "rgba(6, 95, 70, 0.45)",
    primaryText: "#1C1917",
    secondaryText: "#78716C",
    timerColor: "#2B6CB0",
    errColor: "#9D174D",
    clueColor: "#1C1917",
    userColor: "#2B6CB0",
    errorColor: "#BE123C",
    errorCellBg: "#FEE2E2",
    errorSelectedBg: "#FCA5A5",
    noteColor: "#57534E",
    footerBg: "#FFFFFF",
    footerBorder: "rgba(6, 95, 70, 0.14)",
    footerText: "#2B6CB0",
    footerAccent: "#334155",
  },
  MEDIUM: {
    cardBgStart: "#FEFCE8",
    cardBgMid: "#FDFBF7",
    cardBgEnd: "#FEF9C3",
    surfaceCardBg: "#FFFFFF",
    surfaceCardBorder: "rgba(133, 77, 14, 0.15)",
    pillBg: "#FFF99D",
    pillText: "#854D0E",
    pillBorder: "rgba(133, 77, 14, 0.20)",
    stickerBg: "#ECFDF5",
    stickerText: "#047857",
    stickerBorder: "#059669",
    stickerShadow: "rgba(0, 0, 0, 0.06)",
    boardBaseBg: "#FFFFFF",
    cellTintBg: "rgba(234, 179, 8, 0.12)",
    crosshairSiblingBg: "#FFFFFF",
    activeCellBg: "#FDE047",
    identicalCellBg: "#FDE047",
    gridThinLine: "rgba(133, 77, 14, 0.20)",
    gridThickLine: "rgba(133, 77, 14, 0.45)",
    primaryText: "#1C1917",
    secondaryText: "#78716C",
    timerColor: "#2B6CB0",
    errColor: "#9D174D",
    clueColor: "#1C1917",
    userColor: "#2B6CB0",
    errorColor: "#BE123C",
    errorCellBg: "#FEE2E2",
    errorSelectedBg: "#FCA5A5",
    noteColor: "#57534E",
    footerBg: "#FFFFFF",
    footerBorder: "rgba(133, 77, 14, 0.14)",
    footerText: "#2B6CB0",
    footerAccent: "#334155",
  },
  HARD: {
    cardBgStart: "#FAF5FF",
    cardBgMid: "#FDFBF7",
    cardBgEnd: "#F3E8FF",
    surfaceCardBg: "#FFFFFF",
    surfaceCardBorder: "rgba(107, 33, 168, 0.15)",
    pillBg: "#F3E8FF",
    pillText: "#6B21A8",
    pillBorder: "rgba(107, 33, 168, 0.20)",
    stickerBg: "#ECFDF5",
    stickerText: "#047857",
    stickerBorder: "#059669",
    stickerShadow: "rgba(0, 0, 0, 0.06)",
    boardBaseBg: "#FFFFFF",
    cellTintBg: "rgba(168, 85, 247, 0.12)",
    crosshairSiblingBg: "#FFFFFF",
    activeCellBg: "#D8B4FE",
    identicalCellBg: "#D8B4FE",
    gridThinLine: "rgba(107, 33, 168, 0.20)",
    gridThickLine: "rgba(107, 33, 168, 0.45)",
    primaryText: "#1C1917",
    secondaryText: "#78716C",
    timerColor: "#2B6CB0",
    errColor: "#9D174D",
    clueColor: "#1C1917",
    userColor: "#2B6CB0",
    errorColor: "#BE123C",
    errorCellBg: "#FEE2E2",
    errorSelectedBg: "#FCA5A5",
    noteColor: "#57534E",
    footerBg: "#FFFFFF",
    footerBorder: "rgba(107, 33, 168, 0.14)",
    footerText: "#2B6CB0",
    footerAccent: "#334155",
  },
  EXPERT: {
    cardBgStart: "#FFF1F2",
    cardBgMid: "#FDFBF7",
    cardBgEnd: "#FFE4E6",
    surfaceCardBg: "#FFFFFF",
    surfaceCardBorder: "rgba(157, 23, 77, 0.15)",
    pillBg: "#FFE4E6",
    pillText: "#9D174D",
    pillBorder: "rgba(157, 23, 77, 0.20)",
    stickerBg: "#ECFDF5",
    stickerText: "#047857",
    stickerBorder: "#059669",
    stickerShadow: "rgba(0, 0, 0, 0.06)",
    boardBaseBg: "#FFFFFF",
    cellTintBg: "rgba(244, 63, 94, 0.12)",
    crosshairSiblingBg: "#FFFFFF",
    activeCellBg: "#F9A8D4",
    identicalCellBg: "#F9A8D4",
    gridThinLine: "rgba(157, 23, 77, 0.20)",
    gridThickLine: "rgba(157, 23, 77, 0.45)",
    primaryText: "#1C1917",
    secondaryText: "#78716C",
    timerColor: "#2B6CB0",
    errColor: "#9D174D",
    clueColor: "#1C1917",
    userColor: "#2B6CB0",
    errorColor: "#BE123C",
    errorCellBg: "#FEE2E2",
    errorSelectedBg: "#FCA5A5",
    noteColor: "#57534E",
    footerBg: "#FFFFFF",
    footerBorder: "rgba(157, 23, 77, 0.14)",
    footerText: "#2B6CB0",
    footerAccent: "#334155",
  },
};

const DARK_THEMES: Record<string, ShareCanvasThemePalette> = {
  EASY: {
    cardBgStart: "#181D1A",
    cardBgMid: "#222620",
    cardBgEnd: "#14241E",
    surfaceCardBg: "rgba(24, 24, 27, 0.88)",
    surfaceCardBorder: "rgba(16, 185, 129, 0.22)",
    pillBg: "#022c22",
    pillText: "#6EE7B7",
    pillBorder: "rgba(16, 185, 129, 0.30)",
    stickerBg: "#064E3B",
    stickerText: "#6EE7B7",
    stickerBorder: "#059669",
    stickerShadow: "rgba(0, 0, 0, 0.22)",
    boardBaseBg: "#18181B",
    cellTintBg: "#18181B",
    crosshairSiblingBg: "#051f18",
    activeCellBg: "#0e8365",
    identicalCellBg: "#0e8365",
    gridThinLine: "#054031",
    gridThickLine: "#0b6b52",
    primaryText: "#F8FAFC",
    secondaryText: "#A8A29E",
    timerColor: "#38BDF8",
    errColor: "#F472B6",
    clueColor: "#F8FAFC",
    userColor: "#38BDF8",
    errorColor: "#FDA4AF",
    errorCellBg: "rgba(76, 5, 25, 0.45)",
    errorSelectedBg: "#881337",
    noteColor: "#94A3B8",
    footerBg: "#1E293B",
    footerBorder: "rgba(56, 189, 248, 0.20)",
    footerText: "#38BDF8",
    footerAccent: "#E2E8F0",
  },
  MEDIUM: {
    cardBgStart: "#221E18",
    cardBgMid: "#26231D",
    cardBgEnd: "#291D10",
    surfaceCardBg: "rgba(24, 24, 27, 0.88)",
    surfaceCardBorder: "rgba(245, 158, 11, 0.22)",
    pillBg: "#451a03",
    pillText: "#fef08a",
    pillBorder: "rgba(245, 158, 11, 0.30)",
    stickerBg: "#064E3B",
    stickerText: "#6EE7B7",
    stickerBorder: "#059669",
    stickerShadow: "rgba(0, 0, 0, 0.22)",
    boardBaseBg: "#18181B",
    cellTintBg: "#18181B",
    crosshairSiblingBg: "#1f1403",
    activeCellBg: "#713f12",
    identicalCellBg: "#713f12",
    gridThinLine: "#532004",
    gridThickLine: "#7c3207",
    primaryText: "#F8FAFC",
    secondaryText: "#A8A29E",
    timerColor: "#38BDF8",
    errColor: "#F472B6",
    clueColor: "#F8FAFC",
    userColor: "#38BDF8",
    errorColor: "#FDA4AF",
    errorCellBg: "rgba(76, 5, 25, 0.45)",
    errorSelectedBg: "#881337",
    noteColor: "#94A3B8",
    footerBg: "#1E293B",
    footerBorder: "rgba(56, 189, 248, 0.20)",
    footerText: "#38BDF8",
    footerAccent: "#E2E8F0",
  },
  HARD: {
    cardBgStart: "#1E1926",
    cardBgMid: "#221F28",
    cardBgEnd: "#241436",
    surfaceCardBg: "rgba(24, 24, 27, 0.88)",
    surfaceCardBorder: "rgba(168, 85, 247, 0.22)",
    pillBg: "#2e1065",
    pillText: "#e9d5ff",
    pillBorder: "rgba(168, 85, 247, 0.30)",
    stickerBg: "#064E3B",
    stickerText: "#6EE7B7",
    stickerBorder: "#059669",
    stickerShadow: "rgba(0, 0, 0, 0.22)",
    boardBaseBg: "#18181B",
    cellTintBg: "#18181B",
    crosshairSiblingBg: "#160c2b",
    activeCellBg: "#581db8",
    identicalCellBg: "#581db8",
    gridThinLine: "#31126b",
    gridThickLine: "#4c1d95",
    primaryText: "#F8FAFC",
    secondaryText: "#A8A29E",
    timerColor: "#38BDF8",
    errColor: "#F472B6",
    clueColor: "#F8FAFC",
    userColor: "#38BDF8",
    errorColor: "#FDA4AF",
    errorCellBg: "rgba(76, 5, 25, 0.45)",
    errorSelectedBg: "#881337",
    noteColor: "#94A3B8",
    footerBg: "#1E293B",
    footerBorder: "rgba(56, 189, 248, 0.20)",
    footerText: "#38BDF8",
    footerAccent: "#E2E8F0",
  },
  EXPERT: {
    cardBgStart: "#26171C",
    cardBgMid: "#261E21",
    cardBgEnd: "#31101B",
    surfaceCardBg: "rgba(24, 24, 27, 0.88)",
    surfaceCardBorder: "rgba(244, 63, 94, 0.22)",
    pillBg: "#4c0519",
    pillText: "#fecdd3",
    pillBorder: "rgba(244, 63, 94, 0.30)",
    stickerBg: "#064E3B",
    stickerText: "#6EE7B7",
    stickerBorder: "#059669",
    stickerShadow: "rgba(0, 0, 0, 0.22)",
    boardBaseBg: "#18181B",
    cellTintBg: "#18181B",
    crosshairSiblingBg: "#210811",
    activeCellBg: "#881337",
    identicalCellBg: "#881337",
    gridThinLine: "#58061d",
    gridThickLine: "#881337",
    primaryText: "#F8FAFC",
    secondaryText: "#A8A29E",
    timerColor: "#38BDF8",
    errColor: "#F472B6",
    clueColor: "#F8FAFC",
    userColor: "#38BDF8",
    errorColor: "#FDA4AF",
    errorCellBg: "rgba(76, 5, 25, 0.45)",
    errorSelectedBg: "#881337",
    noteColor: "#94A3B8",
    footerBg: "#1E293B",
    footerBorder: "rgba(56, 189, 248, 0.20)",
    footerText: "#38BDF8",
    footerAccent: "#E2E8F0",
  },
};

/**
 * Raw SVG XML Icon Generators (Zero CORS, inline UTF-8 Data URL rendering)
 */
const getEmblemSvg = (accentColor: string): string => `
<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 36 36" fill="none">
  <rect width="36" height="36" rx="10" fill="#121212"/>
  <rect x="5.5" y="5.5" width="7" height="7" rx="1.8" fill="${accentColor}"/>
  <rect x="14.5" y="5.5" width="7" height="7" rx="1.8" fill="#27272A"/>
  <rect x="23.5" y="5.5" width="7" height="7" rx="1.8" fill="#3F3F46"/>
  <rect x="5.5" y="14.5" width="7" height="7" rx="1.8" fill="#27272A"/>
  <rect x="14.5" y="14.5" width="7" height="7" rx="1.8" fill="${accentColor}"/>
  <rect x="23.5" y="14.5" width="7" height="7" rx="1.8" fill="#27272A"/>
  <rect x="5.5" y="23.5" width="7" height="7" rx="1.8" fill="#3F3F46"/>
  <rect x="14.5" y="23.5" width="7" height="7" rx="1.8" fill="#27272A"/>
  <rect x="23.5" y="23.5" width="7" height="7" rx="1.8" fill="${accentColor}"/>
</svg>`;

const getSparklesSvg = (color: string): string => `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
  <path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>
</svg>`;

const getClockSvg = (color: string): string => `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10"/>
  <polyline points="12 6 12 12 16 14"/>
</svg>`;

const getTrophySvg = (color: string): string => `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
  <path d="M4 22h16"/>
  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
  <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
</svg>`;

const getZapSvg = (color: string): string => `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
</svg>`;

const getBrainSvg = (color: string): string => `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
  <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
  <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>
  <path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/>
  <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/>
  <path d="M3.477 10.896a4 4 0 0 1 .585-.396"/>
  <path d="M19.938 10.5a4 4 0 0 1 .585.396"/>
  <path d="M6 18a4 4 0 0 1-1.967-.516"/>
  <path d="M19.967 17.484A4 4 0 0 1 18 18"/>
</svg>`;

const getStarSvg = (color: string): string => `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
</svg>`;

const getEyeSvg = (color: string): string => `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/>
  <circle cx="12" cy="12" r="3"/>
</svg>`;

const getShieldCheckSvg = (color: string): string => `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
  <path d="m9 12 2 2 4-4"/>
</svg>`;

const getAlertCircleSvg = (color: string): string => `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10"/>
  <line x1="12" x2="12" y1="8" y2="12"/>
  <line x1="12" x2="12.01" y1="16" y2="16"/>
</svg>`;

const getFlameSvg = (color: string): string => `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
</svg>`;

const getGlobeSvg = (color: string): string => `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10"/>
  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
  <path d="M2 12h20"/>
</svg>`;

const getHashSvg = (color: string): string => `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="4" x2="20" y1="9" y2="9"/>
  <line x1="4" x2="20" y1="15" y2="15"/>
  <line x1="10" x2="8" y1="3" y2="21"/>
  <line x1="16" x2="14" y1="3" y2="21"/>
</svg>`;

/**
 * Converts a raw SVG XML string into a UTF-8 Data URL, loads it into an Image,
 * and draws it onto the 2D canvas without triggering any CORS security errors.
 * Ensures the SVG vector is rasterized at high-DPI resolution (minimum 4x logical size)
 * before being drawn to guarantee razor-sharp edges.
 */
export async function drawSvg(
  ctx: CanvasRenderingContext2D,
  svgString: string,
  x: number,
  y: number,
  size: number
): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, x, y, size, size);
      ctx.restore();
      resolve();
    };
    img.onerror = () => {
      resolve();
    };

    const targetPx = Math.max(96, Math.round(size * 4));
    let enhancedSvg = svgString.trim();
    if (enhancedSvg.includes("<svg")) {
      if (/width="[^"]*"/i.test(enhancedSvg) && /height="[^"]*"/i.test(enhancedSvg)) {
        enhancedSvg = enhancedSvg
          .replace(/width="[^"]*"/i, `width="${targetPx}"`)
          .replace(/height="[^"]*"/i, `height="${targetPx}"`);
      } else {
        enhancedSvg = enhancedSvg.replace(
          /<svg([^>]*)>/i,
          `<svg$1 width="${targetPx}" height="${targetPx}">`
        );
      }
    }

    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
      enhancedSvg
    )}`;
  });
}

const drawLogoOrEmblem = async (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  accentColor: string
): Promise<void> => {
  const loadedLogo = await new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = "/logo.png";
    setTimeout(() => resolve(null), 400);
  });

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  if (loadedLogo && (loadedLogo.naturalWidth || loadedLogo.width) >= 128) {
    drawRoundedRect(ctx, x, y, size, size, 9);
    ctx.fillStyle = "#121212";
    ctx.fill();
    ctx.clip();
    ctx.drawImage(loadedLogo, x, y, size, size);
  } else {
    await drawSvg(ctx, getEmblemSvg(accentColor), x, y, size);
  }
  ctx.restore();
};

export const evaluateBoardDidWin = (
  boardState: SudokuBoardState | null,
  isWonProp?: boolean
): boolean => {
  const mistakes = boardState?.currentMistakesCount ?? 0;
  const maxMistakes = boardState?.maxMistakesLimit ?? 3;
  const hitMaxMistakes =
    maxMistakes === 0
      ? mistakes > 0
      : maxMistakes < 999 && mistakes >= maxMistakes;

  if (hitMaxMistakes) {
    return false;
  }

  const isGridCompletelyFilled = Boolean(
    boardState?.grid &&
      boardState.grid.length === 9 &&
      boardState.grid.every(
        (row) =>
          Array.isArray(row) &&
          row.length === 9 &&
          row.every((cell) => cell && cell.value !== 0)
      )
  );

  if (!isGridCompletelyFilled) {
    return false;
  }

  return isWonProp !== undefined ? Boolean(isWonProp) : true;
};

export type StickerBadgeTier =
  | "record"
  | "excellent"
  | "great"
  | "solved"
  | "defeat_close"
  | "defeat_freeze"
  | "defeat_backup"
  | "none";

export const evaluatePerformanceSticker = (
  difficulty: string,
  seconds: number,
  isWon: boolean = true,
  isNewRecord: boolean = false,
  filledCellsCount: number = 0,
  lang?: string
): { label: string; tier: StickerBadgeTier } => {
  const i18n = getShareI18n(lang);
  if (!isWon) {
    if (filledCellsCount >= 68) {
      return { label: i18n.sticker.defeat_close, tier: "defeat_close" };
    }
    return { label: i18n.sticker.defeat_freeze, tier: "defeat_freeze" };
  }

  if (isNewRecord) {
    return { label: i18n.sticker.record, tier: "record" };
  }

  const diff = String(difficulty || "EASY").toUpperCase();
  const thresholds: Record<string, { excellent: number; great: number }> = {
    EASY: { excellent: 120, great: 240 },
    MEDIUM: { excellent: 210, great: 390 },
    HARD: { excellent: 330, great: 600 },
    EXPERT: { excellent: 480, great: 900 },
  };
  const { excellent, great } = thresholds[diff] || thresholds.EASY;

  if (seconds > 0 && seconds <= excellent) {
    return { label: i18n.sticker.excellent, tier: "excellent" };
  }
  if (seconds > 0 && seconds <= great) {
    return { label: i18n.sticker.great, tier: "great" };
  }
  return { label: i18n.sticker.solved, tier: "solved" };
};

export const extractRoomCodeFromChallenge = (
  challengeInput?: string,
  roomCode?: string,
  boardState?: SudokuBoardState | null
): string => {
  if (roomCode && String(roomCode).trim().length > 0) {
    const cleanRoom = String(roomCode).trim();
    const matchSudoku = cleanRoom.match(/SUDOKU-([A-Z0-9]+)-/i);
    if (matchSudoku && matchSudoku[1]) return matchSudoku[1].toUpperCase();
    return cleanRoom.toUpperCase();
  }

  if (challengeInput) {
    const matchSudoku = challengeInput.match(/SUDOKU-([A-Z0-9]+)-/i);
    if (matchSudoku && matchSudoku[1]) {
      return matchSudoku[1].toUpperCase();
    }
    const matchQuery = challengeInput.match(/[?&]challenge=([^&#]+)/i);
    if (matchQuery && matchQuery[1]) {
      const token = decodeURIComponent(matchQuery[1]);
      const innerMatch = token.match(/SUDOKU-([A-Z0-9]+)-/i);
      if (innerMatch && innerMatch[1]) return innerMatch[1].toUpperCase();
      return token;
    }
  }

  if (boardState?.seed) {
    return String(boardState.seed).padStart(6, "0").slice(-6).toUpperCase();
  }

  return "849201";
};

/**
 * Resolves the active user's display name from explicit props or the canonical localStorage vault,
 * preventing any fallback to placeholder bot names like "Chloe Zen".
 */
export const resolveActiveSenderName = (explicitName?: string): string => {
  const cleanedExplicit = String(explicitName || "").trim();
  if (
    cleanedExplicit &&
    cleanedExplicit.toLowerCase() !== "player" &&
    cleanedExplicit.toLowerCase() !== "chloe zen"
  ) {
    return cleanedExplicit;
  }

  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const activeUid =
        localStorage.getItem("sudoku_active_auth_uid") || "guest";
      const vaultKey =
        !activeUid || activeUid === "guest" || activeUid.startsWith("GUEST_")
          ? "sudoku_guest_vault"
          : `sudoku_vault_${activeUid}`;
      const rawVault = localStorage.getItem(vaultKey);
      if (rawVault) {
        const parsedVault = JSON.parse(rawVault);
        const vaultName = String(
          parsedVault?.profile?.displayName || parsedVault?.profile?.name || ""
        ).trim();
        if (vaultName && vaultName.toLowerCase() !== "chloe zen") {
          return vaultName;
        }
      }
    } catch {
      // Ignore storage parse errors
    }
  }

  return cleanedExplicit || "Player";
};

export interface BuiltChallengeUrlInfo {
  fullUrl: string;
  displayUrl: string;
  extractedRoomCode: string;
  challengeId: string;
}

export function buildFreshChallengeUrl(
  challengeId: string,
  playerName?: string
): string;
export function buildFreshChallengeUrl(
  boardState: SudokuBoardState | null,
  difficulty: string,
  roomCode?: string,
  playerName?: string
): BuiltChallengeUrlInfo;
export function buildFreshChallengeUrl(
  boardStateOrChallengeId: SudokuBoardState | string | null,
  difficultyOrPlayerName?: string,
  roomCode?: string,
  playerName?: string
): string | BuiltChallengeUrlInfo {
  const origin =
    typeof window !== "undefined" &&
    window.location.origin &&
    !/localhost|127\.0\.0\.1|capacitor:\/\//i.test(window.location.origin)
      ? window.location.origin.replace(/\/+$/, "")
      : "https://sudokusync.com";

  if (typeof boardStateOrChallengeId === "string") {
    const activePlayerName = resolveActiveSenderName(difficultyOrPlayerName);
    const senderQuery = activePlayerName
      ? `&sender=${encodeURIComponent(activePlayerName)}`
      : "";
    const rawToken = boardStateOrChallengeId.trim();
    if (!rawToken) {
      return `${origin}/?challenge=SUDOKU-849201-EASY-M3-H3-T1${senderQuery}`;
    }
    if (/^https?:\/\//i.test(rawToken)) {
      return /[?&]sender=/i.test(rawToken)
        ? rawToken
        : `${rawToken}${rawToken.includes("?") ? "" : "?"}${senderQuery}`;
    }
    return `${origin}/?challenge=${rawToken}${senderQuery}`;
  }

  const boardState = boardStateOrChallengeId;
  const activePlayerName = resolveActiveSenderName(playerName);
  const senderQuery = activePlayerName
    ? `&sender=${encodeURIComponent(activePlayerName)}`
    : "";
  const diff = String(
    difficultyOrPlayerName || boardState?.difficulty || "EASY"
  ).toUpperCase();
  const seed = extractRoomCodeFromChallenge(undefined, roomCode, boardState);
  const maxMistakes = boardState?.maxMistakesLimit ?? 3;
  const hintLimit = (boardState as any)?.hintLimit ?? 3;
  const challengeId = `SUDOKU-${seed}-${diff}-M${maxMistakes}-H${hintLimit}-T1`;

  return {
    fullUrl: `${origin}/?challenge=${challengeId}${senderQuery}`,
    displayUrl: `${typeof window !== "undefined" && Boolean(window.CrazyGames) ? "Play on CrazyGames.com" : "sudokusync.com"} | Room Code: ${seed}`,
    extractedRoomCode: seed,
    challengeId,
  };
}

const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
};

const parseFormattedTimeToSeconds = (formatted: string): number => {
  const parts = String(formatted || "")
    .trim()
    .split(":")
    .map((n) => parseInt(n, 10));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * 60 + parts[1];
  }
  return 180;
};

const hasCellConflict = (
  grid: { value: number; isOriginalClue: boolean }[][],
  row: number,
  col: number,
  val: number
): boolean => {
  if (!val) return false;
  for (let c = 0; c < 9; c++) {
    if (c !== col && grid[row]?.[c]?.value === val) return true;
  }
  for (let r = 0; r < 9; r++) {
    if (r !== row && grid[r]?.[col]?.value === val) return true;
  }
  const boxStartRow = Math.floor(row / 3) * 3;
  const boxStartCol = Math.floor(col / 3) * 3;
  for (let r = boxStartRow; r < boxStartRow + 3; r++) {
    for (let c = boxStartCol; c < boxStartCol + 3; c++) {
      if ((r !== row || c !== col) && grid[r]?.[c]?.value === val) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Draws text at exact geometric vertical & horizontal center of `(centerX, centerY)`
 * using `actualBoundingBoxAscent` and `actualBoundingBoxDescent` compensation
 * so custom fonts (`Space Grotesk`, `Patrick Hand`, `JetBrains Mono`) share the exact same center.
 */
const drawCenteredText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  centerY: number
) => {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const metrics = ctx.measureText(text);
  if (
    typeof metrics.actualBoundingBoxAscent === "number" &&
    typeof metrics.actualBoundingBoxDescent === "number"
  ) {
    const dy =
      (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2;
    ctx.fillText(text, centerX, centerY + dy);
  } else {
    ctx.fillText(text, centerX, centerY);
  }
};

const drawLeftMiddleText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  leftX: number,
  centerY: number
) => {
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  const metrics = ctx.measureText(text);
  if (
    typeof metrics.actualBoundingBoxAscent === "number" &&
    typeof metrics.actualBoundingBoxDescent === "number"
  ) {
    const dy =
      (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2;
    ctx.fillText(text, leftX, centerY + dy);
  } else {
    ctx.fillText(text, leftX, centerY);
  }
};

/**
 * Native Canvas Vector Icons (Zero Emojis, Crisp Path2D/Line Vectors)
 */
export function drawVectorAlertTriangle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.9;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Triangle path
  const half = size / 2;
  ctx.beginPath();
  ctx.moveTo(x + half, y + 1.2);
  ctx.lineTo(x + size - 1.2, y + size - 1.2);
  ctx.lineTo(x + 1.2, y + size - 1.2);
  ctx.closePath();
  ctx.stroke();

  // Exclamation stem
  ctx.beginPath();
  ctx.moveTo(x + half, y + size * 0.42);
  ctx.lineTo(x + half, y + size * 0.65);
  ctx.stroke();

  // Exclamation dot
  ctx.beginPath();
  ctx.arc(x + half, y + size * 0.81, 1.15, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function drawVectorZap(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string
): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Lightning bolt path
  ctx.beginPath();
  ctx.moveTo(x + size * 0.58, y + 1);
  ctx.lineTo(x + size * 0.18, y + size * 0.54);
  ctx.lineTo(x + size * 0.48, y + size * 0.54);
  ctx.lineTo(x + size * 0.42, y + size - 1);
  ctx.lineTo(x + size * 0.82, y + size * 0.46);
  ctx.lineTo(x + size * 0.52, y + size * 0.46);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

export function getChallengeTapeStrings(lang: string, didWin: boolean, timeStr: string): { line1: string; line2: string } {
  const norm = (lang || "en").toLowerCase();
  if (norm.startsWith("hi")) {
    return {
      line1: didWin ? `${timeStr} में हल किया!` : "अटक गया यार!",
      line2: didWin ? "मेरा टाइम बीट करके दिखाओ!" : "क्या तुम इसे पूरा कर सकते हो?"
    };
  }
  if (norm.startsWith("de")) {
    return {
      line1: didWin ? `IN ${timeStr} GELÖST!` : "FESTGESTECKT!",
      line2: didWin ? "SCHLAG MEINE ZEIT!" : "KANNST DU DAS BEENDEN?"
    };
  }
  if (norm.startsWith("ja")) {
    return {
      line1: didWin ? `${timeStr}でクリア！` : "ギブアップ！",
      line2: didWin ? "私のタイムを超えられる？" : "代わりにクリアしてくれる？"
    };
  }
  if (norm.startsWith("ko")) {
    return {
      line1: didWin ? `${timeStr}만에 성공!` : "뇌정지 옴!",
      line2: didWin ? "내 기록 깰 수 있어?" : "이어서 풀어볼래?"
    };
  }
  if (norm.startsWith("es")) {
    return {
      line1: didWin ? `¡RESUELTO EN ${timeStr}!` : "¡ME RENDÍ!",
      line2: didWin ? "¡SUPERA MI TIEMPO!" : "¿PUEDES TERMINARLO?"
    };
  }
  if (norm.startsWith("fr")) {
    return {
      line1: didWin ? `RÉSOLU EN ${timeStr} !` : "BLOQUÉ !",
      line2: didWin ? "BATS MON CHRONO !" : "PEUX-TU LE FINIR ?"
    };
  }
  if (norm.startsWith("it")) {
    return {
      line1: didWin ? `RISOLTO IN ${timeStr}!` : "BLOCCATO!",
      line2: didWin ? "BATTI IL MIO TEMPO!" : "PUOI FINIRLO TU?"
    };
  }
  if (norm.startsWith("pt")) {
    return {
      line1: didWin ? `RESOLVIDO EM ${timeStr}!` : "TRAVOU!",
      line2: didWin ? "SUPERE MEU TEMPO!" : "CONSEGUE TERMINAR?"
    };
  }
  return {
    line1: didWin ? `SOLVED IN ${timeStr}!` : "STUCK!",
    line2: didWin ? "BEAT MY TIME IF YOU CAN!" : "CAN YOU FINISH THIS PUZZLE?"
  };
}

/**
 * Pure HTML5 2D Canvas generator for Sudoku Sync Share Cards.
 * - Full Light & Dark Mode adaptation across card surfaces, stickers, HUD pills, and footer
 * - Crisp inline vector Brain SVG (`getBrainSvg`) for "BRAIN FREEZE!" defeat states
 * - Enlarged (+20%) borderless floating achievement sticker anchored cleanly above the board boundary
 * - Scaled-up (+15-20%) footer typography ("sudokusync.com | Room Code: [ID]") filling horizontal whitespace
 */
export async function generateShareCanvas(
  gameState: ShareCanvasGameState | SudokuBoardState | null,
  challengeId?: string,
  themeColor?: string
): Promise<string> {
  // 1. Explicitly load and await custom web fonts in their exact weights & sizes
  if (typeof document !== "undefined" && document.fonts) {
    try {
      await Promise.allSettled([
        document.fonts.load('400 25px "Space Grotesk"'),
        document.fonts.load('700 18.5px "Space Grotesk"'),
        document.fonts.load('700 13.5px "Space Grotesk"'),
        document.fonts.load('700 13px "Space Grotesk"'),
        document.fonts.load('700 11.5px "Space Grotesk"'),
        document.fonts.load('400 29px "Patrick Hand"'),
        document.fonts.load('700 24px "JetBrains Mono"'),
        document.fonts.load('700 13px "JetBrains Mono"'),
        document.fonts.load('700 11.5px "JetBrains Mono"'),
      ]);
      await document.fonts.ready;
    } catch {
      // Fallback gracefully if font loader rejects
    }
  }

  const rawState = (gameState || {}) as ShareCanvasGameState;
  const resolvedBoard: SudokuBoardState | null =
    rawState.boardState !== undefined
      ? rawState.boardState
      : Array.isArray(rawState.grid)
      ? (rawState as unknown as SudokuBoardState)
      : null;

  const normalizedDiff = String(
    resolvedBoard?.difficulty ||
      (rawState?.boardState as any)?.difficulty ||
      rawState.difficulty ||
      themeColor ||
      "EASY"
  ).toUpperCase();

  const darkMode =
    rawState.darkMode !== undefined
      ? Boolean(rawState.darkMode)
      : typeof document !== "undefined" &&
        document.documentElement.classList.contains("dark");

  const basePalette = darkMode
    ? DARK_THEMES[normalizedDiff] || DARK_THEMES.EASY
    : LIGHT_THEMES[normalizedDiff] || LIGHT_THEMES.EASY;

  const palette: ShareCanvasThemePalette = {
    ...basePalette,
    ...(themeColor && /^#|^rgb/i.test(themeColor)
      ? { pillBg: themeColor }
      : {}),
  };

  const timeStr = rawState.time || "00:00";
  const playerName = resolveActiveSenderName(rawState.playerName);
  const solutionGrid = rawState.solutionGrid || [];
  const mistakes =
    rawState.currentMistakesCount ??
    resolvedBoard?.currentMistakesCount ??
    0;
  const maxMistakes =
    rawState.maxMistakesLimit ?? resolvedBoard?.maxMistakesLimit ?? 3;

  const didWin = evaluateBoardDidWin(resolvedBoard, rawState.isWon);

  const gridCells = resolvedBoard?.grid || [];
  let filledCellsCount = 0;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if ((gridCells[r]?.[c]?.value ?? 0) !== 0) {
        filledCellsCount++;
      }
    }
  }

  const activeLang = rawState.language || getCurrentLanguage() || "en";
  const i18n = getShareI18n(activeLang);

  const effectiveSeconds =
    typeof rawState.sessionSeconds === "number" && rawState.sessionSeconds > 0
      ? rawState.sessionSeconds
      : parseFormattedTimeToSeconds(timeStr);

  const isRecordWin = Boolean(rawState.isNewRecord && didWin);

  const stickerBadge = evaluatePerformanceSticker(
    normalizedDiff,
    effectiveSeconds,
    didWin,
    isRecordWin,
    filledCellsCount,
    activeLang
  );

  const extractedRoomCode = extractRoomCodeFromChallenge(
    challengeId,
    rawState.roomCode,
    resolvedBoard
  );

  const ctaCopy = didWin
    ? (isRecordWin ? i18n.hook.win_record(timeStr) : i18n.hook.win_normal(timeStr))
    : i18n.hook.defeat;

  const localizedDiff = getLocalizedDifficulty(normalizedDiff, activeLang);

  const CARD_WIDTH = 360;
  const CARD_HEIGHT = 546;
  const SCALE = 3; // 1080x1638 razor-sharp high-DPI supersampled output (3x)

  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH * SCALE;
  canvas.height = CARD_HEIGHT * SCALE;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to initialize 2D canvas context");
  }

  ctx.scale(SCALE, SCALE);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  const appSansFont =
    '"Space Grotesk", "Noto Sans", "Noto Sans Devanagari", "Hiragino Kaku Gothic ProN", "Malgun Gothic", "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif';
  const appHandwritingFont =
    '"Patrick Hand", "Architects Daughter", "Kalam", cursive, sans-serif';
  const appMonoFont =
    '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';

  // 1. Borderless Pastel/Dark Card Background (Rounded 28px)
  const bgGrad = ctx.createLinearGradient(0, 0, CARD_WIDTH * 0.85, CARD_HEIGHT);
  bgGrad.addColorStop(0, palette.cardBgStart);
  bgGrad.addColorStop(0.5, palette.cardBgMid);
  bgGrad.addColorStop(1, palette.cardBgEnd);

  drawRoundedRect(ctx, 0, 0, CARD_WIDTH, CARD_HEIGHT, 28);
  ctx.fillStyle = bgGrad;
  ctx.fill();

  // 2. Top Brand Row: Emblem + Dual-Tone "SUDOKU SYNC" + Player Handle + Borderless Difficulty Pill (y = 16..48)
  const headerY = 16;
  const logoSize = 32;

  await drawLogoOrEmblem(ctx, 18, headerY, logoSize, palette.activeCellBg);

  ctx.font = `700 13px ${appSansFont}`;
  const sudokuWord = "SUDOKU ";
  const sudokuWordW = ctx.measureText(sudokuWord).width;
  ctx.fillStyle = palette.primaryText;
  drawLeftMiddleText(ctx, sudokuWord, 58, headerY + 10);

  ctx.fillStyle = palette.timerColor; // Active theme accent blue (#2B6CB0 / #38BDF8)
  drawLeftMiddleText(ctx, "SYNC", 58 + sudokuWordW, headerY + 10);

  ctx.fillStyle = darkMode ? "#F8FAFC" : "#1E293B";
  ctx.font = `700 11px ${appSansFont}`;
  drawLeftMiddleText(ctx, playerName, 58, headerY + 24);

  // Borderless Localized Difficulty Pill with auto-scaling & soft diffused elevation
  let diffFontSize = 10;
  ctx.font = `700 ${diffFontSize}px ${appSansFont}`;
  let diffTextW = ctx.measureText(localizedDiff).width;
  while (diffTextW > 64 && diffFontSize > 8) {
    diffFontSize -= 0.5;
    ctx.font = `700 ${diffFontSize}px ${appSansFont}`;
    diffTextW = ctx.measureText(localizedDiff).width;
  }
  const diffIconSize = 11.5;
  const diffGap = 4.5;
  const diffContentW = diffIconSize + diffGap + diffTextW;
  const diffPillW = Math.max(68, diffContentW + 22);
  const diffPillH = 25;
  const diffPillX = CARD_WIDTH - 18 - diffPillW;
  const diffPillY = headerY + (logoSize - diffPillH) / 2;

  ctx.save();
  ctx.shadowColor = darkMode
    ? "rgba(0, 0, 0, 0.22)"
    : "rgba(0, 0, 0, 0.04)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;
  drawRoundedRect(
    ctx,
    diffPillX,
    diffPillY,
    diffPillW,
    diffPillH,
    diffPillH / 2
  );
  ctx.fillStyle = palette.pillBg;
  ctx.fill();
  ctx.restore();

  const diffStartX = diffPillX + (diffPillW - diffContentW) / 2;
  const diffCenterY = diffPillY + diffPillH / 2;
  await drawSvg(
    ctx,
    getSparklesSvg(palette.pillText),
    diffStartX,
    diffCenterY - diffIconSize / 2,
    diffIconSize
  );
  ctx.fillStyle = palette.pillText;
  ctx.font = `700 ${diffFontSize}px ${appSansFont}`;
  drawLeftMiddleText(
    ctx,
    localizedDiff,
    diffStartX + diffIconSize + diffGap,
    diffCenterY
  );

  // 3. Compact 40px White HUD Box (y = 63..103, 15px clearance below header)
  const bannerX = 18;
  const bannerY = 63;
  const bannerW = CARD_WIDTH - 36;
  const bannerH = 40;

  ctx.save();
  ctx.shadowColor = darkMode
    ? "rgba(0, 0, 0, 0.28)"
    : "rgba(28, 25, 23, 0.04)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 2;
  drawRoundedRect(ctx, bannerX, bannerY, bannerW, bannerH, 14);
  ctx.fillStyle = palette.surfaceCardBg;
  ctx.fill();
  ctx.restore();

  const timerRowY = bannerY + bannerH / 2;

  // Hero Solve Timer on the left (24px bold tabular JetBrains Mono with 18px vector clock)
  const clockSize = 18;
  await drawSvg(
    ctx,
    getClockSvg(palette.timerColor),
    bannerX + 12,
    timerRowY - clockSize / 2,
    clockSize
  );

  ctx.fillStyle = palette.timerColor;
  ctx.font = `700 24px ${appMonoFont}`;
  drawLeftMiddleText(ctx, timeStr, bannerX + 12 + clockSize + 6.5, timerRowY);

  // Right Status Pill: Borderless ERR / FLAWLESS / Best Time vector badge (Localized), vertically centered
  const statusLabel = didWin
    ? rawState.bestTime
      ? i18n.hud.best(rawState.bestTime)
      : (mistakes === 0 ? "FLAWLESS" : i18n.hud.err(mistakes, maxMistakes || 3))
    : i18n.hud.err(mistakes || maxMistakes || 3, maxMistakes || 3);

  const statusPillBg = didWin
    ? darkMode
      ? "#064E3B"
      : "#ECFDF5"
    : darkMode
    ? "#4C0519"
    : "#FFF1F2";

  const statusPillColor = didWin
    ? darkMode
      ? "#6EE7B7"
      : "#047857"
    : darkMode
    ? "#FDA4AF"
    : "#BE123C";

  ctx.font = `700 10.5px ${appMonoFont}`;
  const statusTextW = ctx.measureText(statusLabel).width;
  const statusIconSize = 12;
  const statusGap = 4;
  const statusContentW = statusIconSize + statusGap + statusTextW;
  const statusPillW = Math.max(76, statusContentW + 16);
  const statusPillH = 24;
  const statusPillX = bannerX + bannerW - 10 - statusPillW;
  const statusPillY = timerRowY - statusPillH / 2;

  drawRoundedRect(
    ctx,
    statusPillX,
    statusPillY,
    statusPillW,
    statusPillH,
    statusPillH / 2
  );
  ctx.fillStyle = statusPillBg;
  ctx.fill();

  const statusStartX = statusPillX + (statusPillW - statusContentW) / 2;
  const statusCenterY = timerRowY;
  const statusSvg = didWin
    ? getShieldCheckSvg(statusPillColor)
    : getAlertCircleSvg(statusPillColor);

  await drawSvg(
    ctx,
    statusSvg,
    statusStartX,
    statusCenterY - statusIconSize / 2,
    statusIconSize
  );
  ctx.fillStyle = statusPillColor;
  ctx.font = `700 10.5px ${appMonoFont}`;
  drawLeftMiddleText(
    ctx,
    statusLabel,
    statusStartX + statusIconSize + statusGap,
    statusCenterY
  );

  // 4. Authentic 9x9 Pastel Sudoku Board (324x324 Square at x = 18, y = 154)
  const boardX = 18;
  const boardY = 154;
  const boardSize = 324;
  const cellSize = boardSize / 9; // Exact 36px per cell

  const selectedRow =
    !didWin && typeof resolvedBoard?.selectedRow === "number"
      ? resolvedBoard.selectedRow
      : null;
  const selectedCol =
    !didWin && typeof resolvedBoard?.selectedCol === "number"
      ? resolvedBoard.selectedCol
      : null;
  const selectedVal =
    selectedRow !== null && selectedCol !== null
      ? gridCells[selectedRow]?.[selectedCol]?.value ?? 0
      : 0;

  // Soft board elevation shadow matching SudokuBoard.tsx
  ctx.save();
  ctx.shadowColor = darkMode
    ? "rgba(0, 0, 0, 0.45)"
    : "rgba(43, 108, 176, 0.05)";
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 4;
  drawRoundedRect(ctx, boardX, boardY, boardSize, boardSize, 12);
  ctx.fillStyle = palette.boardBaseBg;
  ctx.fill();
  ctx.restore();

  ctx.save();
  drawRoundedRect(ctx, boardX, boardY, boardSize, boardSize, 12);
  ctx.fillStyle = palette.boardBaseBg;
  ctx.fill();
  ctx.clip();

  // Render 81 cells: authentic pastel backgrounds + enlarged, balanced numbers (~25px clues, ~29px user inputs)
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cellX = boardX + c * cellSize;
      const cellY = boardY + r * cellSize;
      const cell = gridCells[r]?.[c];
      const val = cell?.value ?? 0;
      const isClue = Boolean(cell?.isOriginalClue);

      const isSelected = selectedRow === r && selectedCol === c;
      const isHighlightedSibling =
        selectedRow !== null &&
        selectedCol !== null &&
        !isSelected &&
        (selectedRow === r ||
          selectedCol === c ||
          (Math.floor(selectedRow / 3) === Math.floor(r / 3) &&
            Math.floor(selectedCol / 3) === Math.floor(c / 3)));
      const isIdenticalValue =
        val !== 0 && selectedVal !== 0 && val === selectedVal && !isSelected;

      const isMistake =
        val !== 0 &&
        !isClue &&
        ((solutionGrid.length === 9 &&
          solutionGrid[r]?.[c] !== undefined &&
          solutionGrid[r][c] !== val) ||
          hasCellConflict(gridCells, r, c, val));

      // Exact cell background fill matching live SudokuBoard.tsx (bypassed on player-filled cells)
      const isPlayerFilled = !isClue && val !== 0;
      if (!isPlayerFilled) {
        if (isSelected && isMistake) {
          ctx.fillStyle = palette.errorSelectedBg;
          ctx.fillRect(cellX, cellY, cellSize, cellSize);
        } else if (isMistake) {
          ctx.fillStyle = palette.errorCellBg;
          ctx.fillRect(cellX, cellY, cellSize, cellSize);
        } else if (isSelected) {
          ctx.fillStyle = palette.activeCellBg;
          ctx.fillRect(cellX, cellY, cellSize, cellSize);
        } else if (isIdenticalValue) {
          ctx.fillStyle = palette.identicalCellBg;
          ctx.fillRect(cellX, cellY, cellSize, cellSize);
        } else if (isHighlightedSibling) {
          ctx.fillStyle = palette.crosshairSiblingBg;
          ctx.fillRect(cellX, cellY, cellSize, cellSize);
        } else {
          ctx.fillStyle = palette.cellTintBg;
          ctx.fillRect(cellX, cellY, cellSize, cellSize);
        }
      }

      if (val !== 0) {
        const centerX = cellX + cellSize / 2;
        const centerY = cellY + cellSize / 2;

        // Enlarged (+20-25%) clean, non-chunky typography (400 normal weight)
        if (isClue) {
          ctx.font = `400 25px ${appSansFont}`;
          ctx.fillStyle = palette.clueColor;
        } else if (isMistake) {
          ctx.font = `400 29px ${appHandwritingFont}`;
          ctx.fillStyle = palette.errorColor;
        } else {
          ctx.font = `400 29px ${appHandwritingFont}`;
          ctx.fillStyle = palette.userColor;
        }

        drawCenteredText(ctx, String(val), centerX, centerY);

        // Authentic 9-Pass Blue / Red Marker Redaction (Obscure filled digits)
        if (!isClue) {
          ctx.save();
          ctx.strokeStyle = isMistake
            ? '#ef4444'
            : (darkMode ? '#38BDF8' : '#0284C7');
          ctx.lineWidth = 3.4;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();

          const cx = cellX + cellSize / 2;
          const cy = cellY + cellSize / 2;

          ctx.moveTo(cx - 12, cy - 13);
          ctx.lineTo(cx + 12, cy - 10);
          ctx.lineTo(cx - 13, cy - 7);
          ctx.lineTo(cx + 13, cy - 4);
          ctx.lineTo(cx - 12, cy - 1);
          ctx.lineTo(cx + 13, cy + 2);
          ctx.lineTo(cx - 13, cy + 5);
          ctx.lineTo(cx + 12, cy + 8);
          ctx.lineTo(cx - 12, cy + 11);
          ctx.lineTo(cx + 11, cy + 13);

          ctx.stroke();
          ctx.restore();
        }
      } else {
        const rawNotes = cell?.notes;
        const notesList: number[] =
          rawNotes instanceof Set
            ? Array.from(rawNotes)
            : Array.isArray(rawNotes)
            ? rawNotes
            : [];

        if (notesList.length > 0) {
          const subSize = cellSize / 3;
          ctx.font = `500 8.5px ${appSansFont}`;
          ctx.fillStyle = palette.noteColor;
          for (const n of notesList) {
            if (n >= 1 && n <= 9) {
              const nr = Math.floor((n - 1) / 3);
              const nc = (n - 1) % 3;
              const nx = cellX + nc * subSize + subSize / 2;
              const ny = cellY + nr * subSize + subSize / 2;
              drawCenteredText(ctx, String(n), nx, ny);
            }
          }
        }
      }
    }
  }

  // Thin 1.25px pastel cell grid lines (ONLY the Sudoku grid uses strokes)
  ctx.strokeStyle = palette.gridThinLine;
  ctx.lineWidth = 1.25;
  for (let i = 1; i < 9; i++) {
    if (i % 3 === 0) continue;
    const pos = i * cellSize;
    ctx.beginPath();
    ctx.moveTo(boardX + pos, boardY);
    ctx.lineTo(boardX + pos, boardY + boardSize);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(boardX, boardY + pos);
    ctx.lineTo(boardX + boardSize, boardY + pos);
    ctx.stroke();
  }

  // Heavy 2.2px pastel 3x3 box divider lines
  ctx.strokeStyle = palette.gridThickLine;
  ctx.lineWidth = 2.2;
  for (let i = 3; i < 9; i += 3) {
    const pos = i * cellSize;
    ctx.beginPath();
    ctx.moveTo(boardX + pos, boardY);
    ctx.lineTo(boardX + pos, boardY + boardSize);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(boardX, boardY + pos);
    ctx.lineTo(boardX + boardSize, boardY + pos);
    ctx.stroke();
  }

  ctx.restore();

  // Outer 3D embossed rounded pastel board border
  drawRoundedRect(ctx, boardX, boardY, boardSize, boardSize, 12);
  ctx.strokeStyle = palette.gridThickLine;
  ctx.lineWidth = 2.4;
  ctx.stroke();

  // 3D Embossed Inset Bevel (Top-Left Specular Sunlight Highlight)
  ctx.save();
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = darkMode ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.85)";
  ctx.beginPath();
  ctx.moveTo(boardX + 12, boardY + 1.2);
  ctx.lineTo(boardX + boardSize - 12, boardY + 1.2);
  ctx.moveTo(boardX + 1.2, boardY + 12);
  ctx.lineTo(boardX + 1.2, boardY + boardSize - 12);
  ctx.stroke();

  // 3D Embossed Inset Bevel (Bottom-Right Shadow Depth)
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = darkMode ? "rgba(0, 0, 0, 0.40)" : (palette.surfaceCardBorder || "rgba(0, 0, 0, 0.12)");
  ctx.beginPath();
  ctx.moveTo(boardX + 12, boardY + boardSize - 1.2);
  ctx.lineTo(boardX + boardSize - 12, boardY + boardSize - 1.2);
  ctx.moveTo(boardX + boardSize - 1.2, boardY + 12);
  ctx.lineTo(boardX + boardSize - 1.2, boardY + boardSize - 12);
  ctx.stroke();
  ctx.restore();

interface UnifiedStickerPalette {
  fill: string;
  text: string;
  border?: string;
  chipFill: string;
  chipText: string;
}

function getUnifiedStickerPalette(
  didWin: boolean,
  diffKey: string,
  darkMode: boolean
): UnifiedStickerPalette {
  if (!didWin) {
    if (darkMode) {
      return {
        fill: "#4C0519", // Elevated Deep Velvet Plum
        border: "#9F1239", // Subtle Ruby Stroke
        text: "#FFE4E6", // Crisp Soft Rose/White
        chipFill: "#2A0812", // Dark Maroon Fill
        chipText: "#FECDD3", // High-Contrast Accent Text
      };
    }
    return {
      fill: "#FECDD3", // Frosty Rose Red
      border: "#E11D48", // Crisp Crimson Border
      text: "#881337", // Deep Contrast Crimson
      chipFill: "#BE123C", // Accent Red Fill
      chipText: "#FFFFFF",
    };
  }

  const diff = String(diffKey || "EASY").toUpperCase();
  switch (diff) {
    case "MEDIUM":
      return darkMode
        ? {
            fill: "#78350F", // Elevated Warm Bronze
            border: "#F59E0B",
            text: "#FEF3C7",
            chipFill: "#3B1705",
            chipText: "#FEF3C7",
          }
        : {
            fill: "#FCD34D", // Golden Amber
            text: "#78350F", // Dark Espresso
            chipFill: "#B45309",
            chipText: "#FFFFFF",
          };
    case "HARD":
      return darkMode
        ? {
            fill: "#312E81", // Elevated Sapphire
            border: "#6366F1",
            text: "#E0E7FF",
            chipFill: "#171544",
            chipText: "#E0E7FF",
          }
        : {
            fill: "#A5B4FC", // Soft Indigo
            text: "#1E1B4B", // Deep Midnight
            chipFill: "#4338CA",
            chipText: "#FFFFFF",
          };
    case "EXPERT":
      return darkMode
        ? {
            fill: "#881337", // Elevated Dark Wine
            border: "#F43F5E",
            text: "#FFE4E6",
            chipFill: "#4C0519",
            chipText: "#FFE4E6",
          }
        : {
            fill: "#FB7185", // Soft Ruby
            text: "#881337", // Deep Burgundy
            chipFill: "#BE123C",
            chipText: "#FFFFFF",
          };
    case "EASY":
    default:
      return darkMode
        ? {
            fill: "#064E3B", // Elevated Jade
            border: "#10B981",
            text: "#D1FAE5",
            chipFill: "#022C22",
            chipText: "#D1FAE5",
          }
        : {
            fill: "#6EE7B7", // Fresh Mint
            text: "#064E3B", // Deep Forest
            chipFill: "#047857",
            chipText: "#FFFFFF",
          };
  }
}

  // Unified Sticker & Badge Zen Theme Palette
  const activeStickerTheme = getUnifiedStickerPalette(didWin, normalizedDiff, darkMode);

  const diagTapeBg = activeStickerTheme.fill;
  const diagTapeTextColor = activeStickerTheme.text;
  const diagTapeIconColor = activeStickerTheme.text;
  const diagChipBg = activeStickerTheme.chipFill;
  const diagChipTextColor = activeStickerTheme.chipText;

  // 4B. High-Contrast Diagonal (-5.5deg) Hero Sticker over Center of 9x9 Grid (Rows 4 & 5)
  const gridCenterX = boardX + boardSize / 2; // 180
  const gridCenterY = boardY + boardSize / 2; // 316
  const diagTapeW = Math.round(boardSize * 0.96); // 96% of grid width = 311px
  const diagTapeH = 84; // 84px height

  ctx.save();
  ctx.translate(gridCenterX, gridCenterY);
  ctx.rotate((-5.5 * Math.PI) / 180);

  // Soft drop shadow: rgba(0, 0, 0, 0.16), blur: 10px, offsetY: 4px
  ctx.save();
  ctx.shadowColor = darkMode ? "rgba(0, 0, 0, 0.45)" : "rgba(0, 0, 0, 0.16)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  drawRoundedRect(
    ctx,
    -diagTapeW / 2,
    -diagTapeH / 2,
    diagTapeW,
    diagTapeH,
    12
  );
  ctx.fillStyle = diagTapeBg;
  ctx.fill();
  if (activeStickerTheme.border) {
    ctx.strokeStyle = activeStickerTheme.border;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  ctx.restore();

  // Strict Locale Purity text lines
  const tapeStrings = getChallengeTapeStrings(activeLang, didWin, timeStr);

  // Line 1: Pure Canvas Vector Icon + Localized Hook (21px Bold Tabular)
  const line1IconSize = 19;
  const line1Gap = 7;
  const maxLine1TextW = diagTapeW - line1IconSize - line1Gap - 28;
  let line1FontSize = 21;
  ctx.font = `700 ${line1FontSize}px ${appSansFont}`;
  let line1TextW = ctx.measureText(tapeStrings.line1).width;
  while (line1TextW > maxLine1TextW && line1FontSize > 14) {
    line1FontSize -= 0.5;
    ctx.font = `700 ${line1FontSize}px ${appSansFont}`;
    line1TextW = ctx.measureText(tapeStrings.line1).width;
  }

  const line1TotalW = line1IconSize + line1Gap + line1TextW;
  const line1StartX = -line1TotalW / 2;
  const line1Y = -21;

  if (didWin) {
    drawVectorZap(
      ctx,
      line1StartX,
      line1Y - line1IconSize / 2,
      line1IconSize,
      diagTapeIconColor
    );
  } else {
    drawVectorAlertTriangle(
      ctx,
      line1StartX,
      line1Y - line1IconSize / 2,
      line1IconSize,
      diagTapeIconColor
    );
  }

  ctx.fillStyle = diagTapeTextColor;
  ctx.font = `700 ${line1FontSize}px ${appSansFont}`;
  drawLeftMiddleText(
    ctx,
    tapeStrings.line1,
    line1StartX + line1IconSize + line1Gap,
    line1Y
  );

  // Line 2 (14px Bold): Localized subtitle / challenge question
  const maxLine2W = diagTapeW - 24;
  let line2FontSize = 14;
  ctx.font = `700 ${line2FontSize}px ${appSansFont}`;
  let line2MeasuredW = ctx.measureText(tapeStrings.line2).width;
  while (line2MeasuredW > maxLine2W && line2FontSize > 10.5) {
    line2FontSize -= 0.5;
    ctx.font = `700 ${line2FontSize}px ${appSansFont}`;
    line2MeasuredW = ctx.measureText(tapeStrings.line2).width;
  }
  ctx.fillStyle = diagTapeTextColor;
  drawCenteredText(ctx, tapeStrings.line2, 0, 2);

  // Line 3 (Dedicated Room Pill): Contrasting pill reading "# Room Code: {code}" in 12px bold monospace
  const cleanRoomPrefix = i18n.footer.room_code.trim();
  const chipRoomLabel = cleanRoomPrefix.startsWith("#") ? cleanRoomPrefix : `# ${cleanRoomPrefix}`;
  const chipText = `${chipRoomLabel} ${extractedRoomCode}`;

  ctx.font = `700 12px ${appMonoFont}`;
  const chipTextW = ctx.measureText(chipText).width;
  const chipW = Math.min(diagTapeW - 32, chipTextW + 20);
  const chipH = 20;
  const chipY = 25;

  drawRoundedRect(
    ctx,
    -chipW / 2,
    chipY - chipH / 2,
    chipW,
    chipH,
    10
  );
  ctx.fillStyle = diagChipBg;
  ctx.fill();

  ctx.fillStyle = diagChipTextColor;
  ctx.font = `700 12px ${appMonoFont}`;
  drawCenteredText(ctx, chipText, 0, chipY);

  ctx.restore();

  // 5. Enlarged (+20%) Borderless Vector-Styled Pastel Achievement Sticker Badge
  // Anchored cleanly right above the top board boundary with a subtle 5px vertical drop (`boardY - 7`),
  // sitting naturally without overlapping Row 1 cell digits.
  if (stickerBadge.tier !== "none" && stickerBadge.label) {
    ctx.save();
    let stickerFontSize = 11.5;
    ctx.font = `700 ${stickerFontSize}px ${appSansFont}`;
    let stickerTextW = ctx.measureText(stickerBadge.label).width;
    const maxStickerAllowedW = 145;
    while (stickerTextW > maxStickerAllowedW && stickerFontSize > 9) {
      stickerFontSize -= 0.5;
      ctx.font = `700 ${stickerFontSize}px ${appSansFont}`;
      stickerTextW = ctx.measureText(stickerBadge.label).width;
    }
    const stickerIconSize = 15;
    const stickerGap = 5.5;
    const stickerContentW = stickerIconSize + stickerGap + stickerTextW;
    const stickerW = stickerContentW + 26;
    const stickerH = 26.5;

    const stickerCenterX = boardX + boardSize - stickerW / 2 - 4;
    const stickerCenterY = boardY - 7;

    ctx.translate(stickerCenterX, stickerCenterY);
    ctx.rotate((-2.5 * Math.PI) / 180);

    // Borderless soft vector drop shadow
    ctx.save();
    ctx.shadowColor = darkMode
      ? "rgba(0, 0, 0, 0.28)"
      : "rgba(0, 0, 0, 0.06)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;
    drawRoundedRect(
      ctx,
      -stickerW / 2,
      -stickerH / 2,
      stickerW,
      stickerH,
      stickerH / 2
    );
    ctx.fillStyle = activeStickerTheme.fill;
    ctx.fill();
    if (activeStickerTheme.border) {
      ctx.strokeStyle = activeStickerTheme.border;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.restore();

    const stickerStartX = -stickerContentW / 2;
    const stickerSvg =
      stickerBadge.tier === "defeat_freeze"
        ? getBrainSvg(activeStickerTheme.text)
        : stickerBadge.tier === "record"
        ? getZapSvg(activeStickerTheme.text)
        : stickerBadge.tier === "excellent" ||
          stickerBadge.tier === "defeat_close"
        ? getFlameSvg(activeStickerTheme.text)
        : stickerBadge.tier === "great"
        ? getStarSvg(activeStickerTheme.text)
        : stickerBadge.tier === "defeat_backup"
        ? getEyeSvg(activeStickerTheme.text)
        : getTrophySvg(activeStickerTheme.text);

    await drawSvg(
      ctx,
      stickerSvg,
      stickerStartX,
      -stickerIconSize / 2,
      stickerIconSize
    );
    ctx.fillStyle = activeStickerTheme.text;
    ctx.font = `700 ${stickerFontSize}px ${appSansFont}`;
    drawLeftMiddleText(
      ctx,
      stickerBadge.label,
      stickerStartX + stickerIconSize + stickerGap,
      0
    );
    ctx.restore();
  }
  // 6. Scaled-Up (+15-20%) Borderless Footer Banner (y = 490..528)
  const footerX = 18;
  const footerY = 490;
  const footerW = CARD_WIDTH - 36;
  const footerH = 38;

  const footerSurfaceBg = darkMode ? "#1E293B" : "#FFFFFF";
  const footerDomainColor = darkMode ? "#38BDF8" : "#2B6CB0";
  const footerLabelColor = darkMode ? "#94A3B8" : "#475569";
  const footerRoomCodeColor = darkMode ? "#E2E8F0" : "#1E293B";

  ctx.save();
  ctx.shadowColor = darkMode
    ? "rgba(0, 0, 0, 0.28)"
    : "rgba(28, 25, 23, 0.05)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 2;
  drawRoundedRect(ctx, footerX, footerY, footerW, footerH, 16);
  ctx.fillStyle = footerSurfaceBg;
  ctx.fill();
  ctx.restore();

  const isCrazyGames = typeof window !== "undefined" && Boolean(window.CrazyGames);
  const domainText = isCrazyGames ? "Play on CrazyGames.com" : "sudokusync.com";
  const dividerText = "  |  ";
  const cleanFooterPrefix = i18n.footer.room_code.trim();
  const roomLabelText = cleanFooterPrefix.startsWith("#") ? `${cleanFooterPrefix} ` : `# ${cleanFooterPrefix} `;
  const roomCodeValue = extractedRoomCode;
  const footerIconSize = 15;
  const footerGap = 5;

  ctx.font = `700 12.5px ${appSansFont}`;
  const domainW = ctx.measureText(domainText).width;
  const dividerW = ctx.measureText(dividerText).width;
  const roomLabelW = ctx.measureText(roomLabelText).width;

  ctx.font = `700 13px ${appMonoFont}`;
  const roomCodeW = ctx.measureText(roomCodeValue).width;

  const totalFooterContentW =
    footerIconSize +
    footerGap +
    domainW +
    dividerW +
    roomLabelW +
    roomCodeW;

  let cursorX = footerX + (footerW - totalFooterContentW) / 2;
  const footerCenterY = footerY + footerH / 2;

  await drawSvg(
    ctx,
    getGlobeSvg(footerDomainColor),
    cursorX,
    footerCenterY - footerIconSize / 2,
    footerIconSize
  );
  cursorX += footerIconSize + footerGap;

  ctx.fillStyle = footerDomainColor;
  ctx.font = `700 12.5px ${appSansFont}`;
  drawLeftMiddleText(ctx, domainText, cursorX, footerCenterY);
  cursorX += domainW;

  ctx.save();
  ctx.fillStyle = footerLabelColor;
  ctx.globalAlpha = 0.45;
  drawLeftMiddleText(ctx, dividerText, cursorX, footerCenterY);
  ctx.restore();
  cursorX += dividerW;

  ctx.fillStyle = footerLabelColor;
  ctx.font = `600 12px ${appSansFont}`;
  drawLeftMiddleText(ctx, roomLabelText, cursorX, footerCenterY);
  cursorX += roomLabelW;

  ctx.fillStyle = footerRoomCodeColor;
  ctx.font = `700 13px ${appMonoFont}`;
  drawLeftMiddleText(ctx, roomCodeValue, cursorX, footerCenterY);

  return canvas.toDataURL("image/png");
}

/**
 * Lossless PNG Blob export helper guaranteeing zero compression artifacts.
 */
export const canvasToBlob = (
  canvas: HTMLCanvasElement
): Promise<Blob | null> => {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
};

/**
 * Convenience helper returning a lossless image/png Blob directly.
 */
export async function generateShareCanvasBlob(
  gameState: ShareCanvasGameState | SudokuBoardState | null,
  challengeId?: string,
  themeColor?: string
): Promise<Blob | null> {
  const dataUrl = await generateShareCanvas(gameState, challengeId, themeColor);
  if (typeof fetch !== "undefined") {
    const res = await fetch(dataUrl);
    return await res.blob();
  }
  return null;
}

export default generateShareCanvas;
