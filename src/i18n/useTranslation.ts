import { useState, useEffect, useCallback } from 'react';
import { translations, TranslationKey, Language, LANGUAGES, LanguageOption } from './translations';

const STORAGE_KEY = 'sudoku_language';
const LANGUAGE_CHANGE_EVENT = 'sudoku_language_change';

/**
 * Known uppercase code key aliases mapped to canonical camelCase translation keys.
 */
const ALIAS_MAP: Record<string, TranslationKey> = {
  WINRATELABEL: 'winRateLabel',
  WINSRATIO: 'winsRatio',
  PERSONALBESTTITLE: 'personalBestsTitle',
  HISTORYTAB: 'historyTabTitle',
  SAVEDTAB: 'savedTabTitle',
  FRIENDSTAB: 'friendsTabTitle',
  WONBADGE: 'wonBadge',
  FAILEDBADGE: 'failedBadge',
  TIMELABEL: 'timeLabel',
  ERRSLABEL: 'errsLabel',
  REPLAYACTION: 'replayAction',
  SAVEACTION: 'saveAction',
  SAVEDACTION: 'savedAction',
  UNSAVEACTION: 'unsaveAction',
  RANKINGSACTION: 'rankingsAction',
};

/**
 * Bulletproof last-resort sanitizer:
 * Ensures no ugly raw code identifiers (like WINRATELABEL, ERRSLABEL) ever render directly in the UI.
 */
function sanitizeFallbackKey(key: string, params?: Record<string, string | number>): string {
  const upper = key.toUpperCase();

  if (upper === 'WINRATELABEL' || upper === 'WIN_RATE_LABEL') return 'Win Rate';
  if (upper === 'WINSRATIO' || upper === 'WINS_RATIO') {
    if (params && params.wins !== undefined && params.total !== undefined) {
      return `${params.wins} Wins / ${params.total} Plays`;
    }
    return 'Wins Ratio';
  }
  if (upper === 'PERSONALBESTTITLE' || upper === 'PERSONAL_BEST_TITLE') return 'Personal Bests';
  if (upper === 'HISTORYTAB' || upper === 'HISTORY_TAB') return 'History';
  if (upper === 'SAVEDTAB' || upper === 'SAVED_TAB') return 'Saved';
  if (upper === 'FRIENDSTAB' || upper === 'FRIENDS_TAB') return 'Friends';
  if (upper === 'WONBADGE' || upper === 'WON_BADGE') return 'Won';
  if (upper === 'FAILEDBADGE' || upper === 'FAILED_BADGE') return 'Failed';
  if (upper === 'TIMELABEL' || upper === 'TIME_LABEL') return 'Time';
  if (upper === 'ERRSLABEL' || upper === 'ERRS_LABEL') return 'Mistakes';
  if (upper === 'REPLAYACTION' || upper === 'REPLAY_ACTION') return 'Replay';
  if (upper === 'SAVEACTION' || upper === 'SAVE_ACTION') return 'Save';
  if (upper === 'SAVEDACTION' || upper === 'SAVED_ACTION') return 'Saved';
  if (upper === 'UNSAVEACTION' || upper === 'UNSAVE_ACTION') return 'Unsave';
  if (upper === 'RANKINGSACTION' || upper === 'RANKINGS_ACTION') return 'Rankings';

  // General fallback: convert camelCase or UPPER_CASE identifier to Title Case
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Detects device locale from navigator.language with fallback to 'en'.
 * Only runs auto-detection if the user has not explicitly set a preference in localStorage.
 */
export function getDeviceLanguage(): Language {
  if (typeof window === 'undefined' || !navigator) return 'en';

  const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
  if (saved && translations[saved]) {
    return saved;
  }

  const rawLanguages =
    navigator.languages && navigator.languages.length > 0
      ? Array.from(navigator.languages)
      : [navigator.language || ''];

  for (const rawCode of rawLanguages) {
    if (!rawCode) continue;
    const lowerCode = rawCode.toLowerCase();

    if (lowerCode.startsWith('de')) return 'de';
    if (lowerCode.startsWith('ja')) return 'ja';
    if (lowerCode.startsWith('pt')) return 'pt-BR';
    if (lowerCode.startsWith('es')) return 'es';
    if (lowerCode.startsWith('fr')) return 'fr';
    if (lowerCode.startsWith('it')) return 'it';
    if (lowerCode.startsWith('ko')) return 'ko';
    if (lowerCode.startsWith('hi')) return 'hi';
    if (lowerCode.startsWith('en')) return 'en';
  }

  return 'en';
}

let globalLanguageState: Language = getDeviceLanguage();

/**
 * Programmatically sets global language across all hook subscribers and persists to localStorage.
 */
export function setGlobalLanguage(lang: Language): void {
  if (!translations[lang]) return;
  globalLanguageState = lang;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch (e) {
    console.error('Failed to persist language setting to localStorage:', e);
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(LANGUAGE_CHANGE_EVENT, { detail: lang }));
  }
}

/**
 * Returns current active language code.
 */
export function getCurrentLanguage(): Language {
  return globalLanguageState;
}

/**
 * React hook for localized text rendering and language management.
 */
export function useTranslation() {
  const [lang, setLangState] = useState<Language>(globalLanguageState);

  useEffect(() => {
    const handleLanguageChange = (e: Event) => {
      const customEvent = e as CustomEvent<Language>;
      if (customEvent.detail && translations[customEvent.detail]) {
        setLangState(customEvent.detail);
      }
    };

    window.addEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageChange);
    return () => {
      window.removeEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageChange);
    };
  }, []);

  const setLanguage = useCallback((newLang: Language) => {
    setGlobalLanguage(newLang);
  }, []);

  const t = useCallback(
    (key: TranslationKey | string, params?: Record<string, string | number>): string => {
      const currentDict = translations[lang] || translations['en'];

      // 1. Direct key match in current language dictionary or English dictionary
      let val = currentDict[key as TranslationKey] || translations['en']?.[key as TranslationKey];

      // 2. Try alias mapping (e.g. UPPERCASE code identifier to canonical camelCase key)
      if (!val) {
        const canonicalKey = ALIAS_MAP[key] || ALIAS_MAP[String(key).toUpperCase()];
        if (canonicalKey) {
          val = currentDict[canonicalKey] || translations['en']?.[canonicalKey];
        }
      }

      // 3. Last-resort fallback shield: never display ugly unformatted code identifiers
      if (!val) {
        val = sanitizeFallbackKey(String(key), params);
      }

      // 4. Interpolate parameters if present
      if (params && typeof val === 'string') {
        Object.entries(params).forEach(([paramKey, paramVal]) => {
          val = val.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
        });
      }

      return val;
    },
    [lang]
  );

  return {
    t,
    language: lang,
    setLanguage,
    languages: LANGUAGES as readonly LanguageOption[],
  };
}
