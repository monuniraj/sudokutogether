import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Lightbulb, Play, WifiOff, Loader2 } from "lucide-react";
import { useTranslation } from "../../i18n/useTranslation";

export interface HintRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWatchAd: () => Promise<void>;
  isOnline: boolean;
  darkMode: boolean;
  playClickSound?: () => void;
}

export const HintRewardModal: React.FC<HintRewardModalProps> = ({
  isOpen,
  onClose,
  onWatchAd,
  isOnline,
  darkMode,
  playClickSound,
}) => {
  const { t } = useTranslation();
  const [isAdLoading, setIsAdLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setIsAdLoading(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    if (isAdLoading) return;
    if (playClickSound) playClickSound();
    onClose();
  };

  const handleWatch = async () => {
    if (isAdLoading) return;
    if (playClickSound) playClickSound();
    setIsAdLoading(true);
    try {
      await onWatchAd();
    } finally {
      setIsAdLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
          {/* Backdrop Click Dismiss */}
          <div
            className="absolute inset-0 cursor-pointer"
            onClick={handleClose}
            aria-label="Dismiss modal"
          />

          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className={`relative w-full max-w-[360px] rounded-3xl p-6 border-none flex flex-col items-center text-center gap-5 z-10 ${
              darkMode ? "bg-[#1A1A1A] text-stone-200" : "bg-[#FDFBF7] text-stone-850"
            }`}
            style={{
              boxShadow: darkMode
                ? "0 10px 40px rgba(0,0,0,0.6)"
                : "0 4px 20px rgba(0,0,0,0.08)",
            }}
          >
            {/* Dismiss Cross */}
            <button
              onClick={handleClose}
              disabled={isAdLoading}
              className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 hover:bg-stone-200/50 dark:hover:bg-zinc-800 transition-colors border-none cursor-pointer disabled:opacity-40"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {!isOnline ? (
              /* 🚫 OFFLINE STATE: Network Required Guard */
              <div className="flex flex-col items-center justify-center pt-2 w-full">
                <div
                  className={`p-4 rounded-3xl mb-4 flex items-center justify-center ${
                    darkMode
                      ? "bg-rose-500/10 text-rose-400"
                      : "bg-rose-500/10 text-rose-600"
                  }`}
                >
                  <WifiOff className="w-12 h-12 stroke-[2]" />
                </div>

                <span
                  className={`text-[10px] font-sans font-black tracking-widest uppercase mb-1 ${
                    darkMode ? "text-rose-400" : "text-rose-600"
                  }`}
                >
                  {t("hintOfflineNotice")}
                </span>

                <h3 className="text-xl font-sans font-black tracking-tight leading-snug text-stone-900 dark:text-stone-100 mb-2">
                  {t("hintConnectionRequired")}
                </h3>

                <p className="text-xs sm:text-sm font-sans font-medium text-stone-500 dark:text-stone-400 max-w-[260px] leading-relaxed mb-6">
                  {t("hintNoInternetDesc")}
                </p>

                <button
                  onClick={handleClose}
                  className={`w-full py-3.5 px-4 rounded-2xl font-sans font-black text-xs uppercase tracking-wider transition-all duration-150 border-none cursor-pointer shadow-xs active:scale-[0.98] ${
                    darkMode
                      ? "bg-zinc-800 hover:bg-zinc-700 text-stone-200"
                      : "bg-stone-200 hover:bg-stone-300 text-stone-850"
                  }`}
                >
                  {t("gotItAction") || "Got It"}
                </button>
              </div>
            ) : (
              /* 💡 ONLINE STATE: Rewarded Ad Incentive */
              <div className="flex flex-col items-center justify-center pt-2 w-full">
                <div
                  className={`p-4 rounded-3xl mb-4 flex items-center justify-center ${
                    darkMode
                      ? "bg-amber-500/10 text-amber-400"
                      : "bg-amber-500/10 text-amber-600"
                  }`}
                >
                  <Lightbulb className="w-12 h-12 stroke-[2]" />
                </div>

                <span
                  className={`text-[10px] font-sans font-black tracking-widest uppercase mb-1 ${
                    darkMode ? "text-amber-400" : "text-amber-600"
                  }`}
                >
                  {t("hintAssistance")}
                </span>

                <h3 className="text-xl font-sans font-black tracking-tight leading-snug text-stone-900 dark:text-stone-100 mb-2">
                  {t("outOfHintsTitle")}
                </h3>

                <p className="text-xs sm:text-sm font-sans font-medium text-stone-500 dark:text-stone-400 max-w-[260px] leading-relaxed mb-6">
                  {t("outOfHintsDesc")}
                </p>

                <div className="flex flex-col gap-2.5 w-full">
                  <button
                    onClick={handleWatch}
                    disabled={isAdLoading}
                    className={`w-full py-3.5 px-4 rounded-2xl font-sans font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-150 border-none cursor-pointer shadow-sm active:scale-[0.98] ${
                      darkMode
                        ? "bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black"
                        : "bg-amber-500 hover:bg-amber-600 text-white font-black"
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {isAdLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{t("loadingAdText")}</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        <span>{t("watchAdAction")}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleClose}
                    disabled={isAdLoading}
                    className={`w-full py-3 px-4 rounded-2xl font-sans font-bold text-xs tracking-wider transition-all duration-150 border-none cursor-pointer ${
                      darkMode
                        ? "text-stone-400 hover:text-stone-200 hover:bg-zinc-800/60"
                        : "text-stone-500 hover:text-stone-800 hover:bg-stone-200/60"
                    } disabled:opacity-40`}
                  >
                    {t("maybeLaterAction")}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

