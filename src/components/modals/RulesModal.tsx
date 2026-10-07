import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Trophy,
  Grid,
  Globe,
  ChevronDown,
  Volume2,
  Square,
  Sparkles,
  Search,
  Pencil,
  Lightbulb,
  RotateCcw,
} from "lucide-react";
import { useTranslation } from "../../i18n/useTranslation";
import { Language } from "../../i18n/translations";

export interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  playClickSound: () => void;
}

const BCP47_TAGS: Record<Language, string> = {
  en: "en-US",
  hi: "hi-IN",
  de: "de-DE",
  ja: "ja-JP",
  ko: "ko-KR",
  es: "es-ES",
  fr: "fr-FR",
  it: "it-IT",
  "pt-BR": "pt-BR",
};

const getBestVoiceForLocale = (targetLang: string): SpeechSynthesisVoice | null => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const bcp47 = targetLang.toLowerCase();
  const langPrefix = bcp47.split("-")[0];

  // 1. Filter voices for target locale or language prefix
  const matchingVoices = voices.filter((v) => {
    const vLang = v.lang.toLowerCase().replace("_", "-");
    return vLang === bcp47 || vLang.startsWith(langPrefix);
  });

  const candidates = matchingVoices.length > 0 ? matchingVoices : voices;

  // 2. Priority keywords for friendly, warm neural voices
  const priorityKeywords = ["natural", "neural", "online", "aria", "jenny", "samantha", "google", "microsoft"];
  const avoidKeywords = ["david", "espeak"];

  for (const kw of priorityKeywords) {
    const found = candidates.find((v) => v.name.toLowerCase().includes(kw));
    if (found) return found;
  }

  const nonAvoided = candidates.filter((v) => !avoidKeywords.some((akw) => v.name.toLowerCase().includes(akw)));
  return nonAvoided[0] || candidates[0] || null;
};

export const RulesModal: React.FC<RulesModalProps> = ({
  isOpen,
  onClose,
  darkMode,
  playClickSound,
}) => {
  const { t, language, setLanguage, languages } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentLangObj = languages.find((l) => l.code === language);

  // Pre-fetch voices on mount to handle asynchronous voice loading in browsers
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const loadVoices = () => {
        window.speechSynthesis.getVoices();
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  }, []);

  // Stop audio on modal close or unmount
  useEffect(() => {
    if (!isOpen) {
      stopAudio();
    }
    return () => {
      stopAudio();
    };
  }, [isOpen, stopAudio]);

  const handleToggleAudio = () => {
    playClickSound();

    if (isPlaying) {
      stopAudio();
      return;
    }

    const narrationText = `${t("duelRulesTitle")}. ${t("duelRulesDesc")} ${t("classicRulesTitle")}. ${t("classicRulesDesc")} ${t("proTipsTitle")}. ${t("tip1Title")}: ${t("tip1Desc")} ${t("tip2Title")}: ${t("tip2Desc")} ${t("tip3Title")}: ${t("tip3Desc")} ${t("tip4Title")}: ${t("tip4Desc")}`;
    const audioPath = `/audio/rules/rules_${language}.mp3`;

    const audio = new Audio(audioPath);
    audioRef.current = audio;

    let fallbackAttempted = false;

    const runSpeechSynthesisFallback = () => {
      if (fallbackAttempted) return;
      fallbackAttempted = true;
      if (audioRef.current === audio) {
        audioRef.current = null;
      }

      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(narrationText);
        const targetBcp47 = BCP47_TAGS[language] || "en-US";
        utterance.lang = targetBcp47;

        // Acoustic Tuning (Happy & Enthusiastic Vibe)
        utterance.rate = 1.02;   // Snappy, energetic pace
        utterance.pitch = 1.08;  // Bright, uplifting cadence
        utterance.volume = 1.0;

        // Smart Neural Voice Selector
        const bestVoice = getBestVoiceForLocale(targetBcp47);
        if (bestVoice) {
          utterance.voice = bestVoice;
        }

        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);

        setIsPlaying(true);
        window.speechSynthesis.speak(utterance);
      } else {
        setIsPlaying(false);
      }
    };

    audio.onended = () => {
      setIsPlaying(false);
      audioRef.current = null;
    };

    audio.onerror = () => {
      runSpeechSynthesisFallback();
    };

    audio
      .play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch(() => {
        runSpeechSynthesisFallback();
      });
  };

  const handleClose = () => {
    playClickSound();
    stopAudio();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.15, ease: "easeOut" } }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
        >
          <div className="absolute inset-0 cursor-pointer" onClick={handleClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12, transition: { duration: 0.15, ease: "easeOut" } }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className={`modal card relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col border-none ${
              darkMode ? "bg-[#18181c] text-stone-100" : "bg-[#FDFBF7] text-stone-900"
            }`}
          >
            {/* Modal Header */}
            <div
              className={`p-4 flex items-center justify-between gap-3 border-none ${
                darkMode ? "bg-zinc-900/60" : "bg-stone-100/60"
              }`}
            >
              {/* Language Selector (Top Left Pill) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setIsLangDropdownOpen((prev) => !prev);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border-none outline-none cursor-pointer active:scale-95 ${
                    darkMode
                      ? "bg-zinc-800 text-stone-200 hover:bg-zinc-700 shadow-sm"
                      : "bg-stone-200/80 text-stone-800 hover:bg-stone-300/80 shadow-xs"
                  }`}
                  aria-label="Select Language"
                >
                  <Globe className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>{currentLangObj?.nativeName || "English"}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isLangDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Native Language Dropdown Menu */}
                {isLangDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10 cursor-default"
                      onClick={() => setIsLangDropdownOpen(false)}
                    />
                    <div
                      className={`absolute top-full left-0 mt-1.5 z-20 w-48 rounded-xl shadow-2xl py-1.5 border-none overflow-hidden backdrop-blur-md ${
                        darkMode
                          ? "bg-zinc-900/95 text-stone-200"
                          : "bg-white/95 text-stone-800"
                      }`}
                    >
                      {languages.map((langOpt) => (
                        <button
                          key={langOpt.code}
                          type="button"
                          onClick={() => {
                            playClickSound();
                            stopAudio();
                            setLanguage(langOpt.code);
                            setIsLangDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors flex items-center justify-between border-none cursor-pointer ${
                            language === langOpt.code
                              ? darkMode
                                ? "bg-amber-500/20 text-amber-300 font-bold"
                                : "bg-amber-100 text-amber-900 font-bold"
                              : darkMode
                              ? "hover:bg-zinc-800 text-stone-300"
                              : "hover:bg-amber-50/60 text-stone-700"
                          }`}
                        >
                          <span>{langOpt.nativeName}</span>
                          {language === langOpt.code && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Title Header */}
              <h3
                className={`font-sans font-black text-sm sm:text-base truncate ${
                  darkMode ? "text-stone-100" : "text-stone-800"
                }`}
              >
                {t("howToPlayTitle")}
              </h3>

              {/* Action Buttons: Audio Narration & Close */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Speaker Vector Audio Narration Button */}
                <button
                  type="button"
                  onClick={handleToggleAudio}
                  title={isPlaying ? "Stop Narration" : "Listen to Rules"}
                  aria-label={isPlaying ? "Stop Narration" : "Listen to Rules"}
                  className={`p-2 rounded-full border-none cursor-pointer transition-all active:scale-95 flex items-center justify-center ${
                    isPlaying
                      ? "bg-amber-500 text-white shadow-md shadow-amber-500/40 animate-pulse ring-2 ring-amber-400"
                      : darkMode
                      ? "bg-zinc-800 text-amber-400 hover:bg-zinc-700"
                      : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                  }`}
                >
                  {isPlaying ? (
                    <Square className="w-4 h-4 fill-current" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={handleClose}
                  className={`p-2 rounded-full border-none cursor-pointer hover:opacity-80 active:scale-95 transition-all flex items-center justify-center ${
                    darkMode ? "bg-zinc-800 text-stone-300 hover:bg-zinc-700" : "bg-stone-200 text-stone-600 hover:bg-stone-300"
                  }`}
                  aria-label="Close Rules"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Rules & Pro Tips Content */}
            <div className="p-5 max-h-[72vh] overflow-y-auto flex flex-col gap-4">
              {/* 1. Multiplayer Race & Podium Card (SUPPORT & INFO Theme) */}
              <div
                className={`p-5 rounded-2xl border-none shadow-md transition-all ${
                  darkMode
                    ? "bg-[#78350f]/20 text-[#fde68a]"
                    : "bg-[#FEF3C7]/60 text-amber-950 shadow-[0_8px_30px_rgba(180,83,9,0.04)]"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className={`w-4 h-4 shrink-0 ${darkMode ? "text-amber-300" : "text-amber-800"}`} />
                  <h4 className={`font-sans font-black text-xs sm:text-sm uppercase tracking-wide ${
                    darkMode ? "text-amber-300" : "text-amber-800"
                  }`}>
                    {t("duelRulesTitle")}
                  </h4>
                </div>
                <p className={`font-sans text-xs leading-relaxed m-0 ${
                  darkMode ? "text-amber-100/90" : "text-amber-900/90"
                }`}>
                  {t("duelRulesDesc")}
                </p>
              </div>

              {/* 2. Classic Sudoku Rules Card (GENERAL PREFERENCES Theme) */}
              <div
                className={`p-5 rounded-2xl border-none shadow-md transition-all ${
                  darkMode
                    ? "bg-[#0c4a6e]/20 text-[#bae6fd]"
                    : "bg-[#E0F2FE]/60 text-[#0369A1] shadow-[0_8px_30px_rgba(3,105,161,0.04)]"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Grid className={`w-4 h-4 shrink-0 ${darkMode ? "text-sky-300" : "text-[#0369A1]"}`} />
                  <h4 className={`font-sans font-black text-xs sm:text-sm uppercase tracking-wide ${
                    darkMode ? "text-sky-300" : "text-[#0369A1]"
                  }`}>
                    {t("classicRulesTitle")}
                  </h4>
                </div>
                <p className={`font-sans text-xs leading-relaxed m-0 ${
                  darkMode ? "text-sky-100/90" : "text-sky-950"
                }`}>
                  {t("classicRulesDesc")}
                </p>
              </div>

              {/* 3. Smart Strategy & Tools Card (GAMEPLAY RULES Theme with Lightbulb Icon) */}
              <div
                className={`p-5 rounded-2xl border-none shadow-md flex flex-col gap-3 transition-all ${
                  darkMode
                    ? "bg-[#064e3b]/25 text-[#a7f3d0]"
                    : "bg-[#E6F4EA]/60 text-stone-850 shadow-[0_8px_30px_rgba(3,105,161,0.02)]"
                }`}
              >
                <div className="flex items-center gap-2 pb-1 border-none">
                  <Lightbulb className={`w-4 h-4 shrink-0 ${darkMode ? "text-emerald-300" : "text-[#135236]"}`} />
                  <h4 className={`font-sans font-black text-xs sm:text-sm uppercase tracking-wide ${
                    darkMode ? "text-emerald-300" : "text-[#135236]"
                  }`}>
                    {t("proTipsTitle")}
                  </h4>
                </div>

                <div className="flex flex-col gap-3">
                  {/* Tip 1: Check Before Placing */}
                  <div className="flex items-start gap-2.5">
                    <Search className={`w-4 h-4 shrink-0 mt-0.5 ${darkMode ? "text-emerald-300" : "text-emerald-700"}`} />
                    <div className="flex flex-col">
                      <span className={`font-sans font-bold text-xs ${
                        darkMode ? "text-emerald-100" : "text-emerald-950"
                      }`}>
                        {t("tip1Title")}
                      </span>
                      <span className={`font-sans text-[11.5px] leading-relaxed mt-0.5 ${
                        darkMode ? "text-emerald-100/90" : "text-emerald-900/90"
                      }`}>
                        {t("tip1Desc")}
                      </span>
                    </div>
                  </div>

                  {/* Tip 2: Never Guess (Pencil Mode) */}
                  <div className="flex items-start gap-2.5">
                    <Pencil className={`w-4 h-4 shrink-0 mt-0.5 ${darkMode ? "text-emerald-300" : "text-emerald-700"}`} />
                    <div className="flex flex-col">
                      <span className={`font-sans font-bold text-xs ${
                        darkMode ? "text-emerald-100" : "text-emerald-950"
                      }`}>
                        {t("tip2Title")}
                      </span>
                      <span className={`font-sans text-[11.5px] leading-relaxed mt-0.5 ${
                        darkMode ? "text-emerald-100/90" : "text-emerald-900/90"
                      }`}>
                        {t("tip2Desc")}
                      </span>
                    </div>
                  </div>

                  {/* Tip 3: Hint Button */}
                  <div className="flex items-start gap-2.5">
                    <Lightbulb className={`w-4 h-4 shrink-0 mt-0.5 ${darkMode ? "text-emerald-300" : "text-emerald-700"}`} />
                    <div className="flex flex-col">
                      <span className={`font-sans font-bold text-xs ${
                        darkMode ? "text-emerald-100" : "text-emerald-950"
                      }`}>
                        {t("tip3Title")}
                      </span>
                      <span className={`font-sans text-[11.5px] leading-relaxed mt-0.5 ${
                        darkMode ? "text-emerald-100/90" : "text-emerald-900/90"
                      }`}>
                        {t("tip3Desc")}
                      </span>
                    </div>
                  </div>

                  {/* Tip 4: Erase & Undo */}
                  <div className="flex items-start gap-2.5">
                    <RotateCcw className={`w-4 h-4 shrink-0 mt-0.5 ${darkMode ? "text-emerald-300" : "text-emerald-700"}`} />
                    <div className="flex flex-col">
                      <span className={`font-sans font-bold text-xs ${
                        darkMode ? "text-emerald-100" : "text-emerald-950"
                      }`}>
                        {t("tip4Title")}
                      </span>
                      <span className={`font-sans text-[11.5px] leading-relaxed mt-0.5 ${
                        darkMode ? "text-emerald-100/90" : "text-emerald-900/90"
                      }`}>
                        {t("tip4Desc")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
