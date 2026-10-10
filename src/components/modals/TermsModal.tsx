import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ShieldCheck, Cloud, Scale, Mail } from "lucide-react";
import { useTranslation } from "../../i18n/useTranslation";

export interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode?: boolean;
  playClickSound?: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({
  isOpen,
  onClose,
  darkMode = false,
  playClickSound,
}) => {
  const { t } = useTranslation();

  const handleClose = () => {
    if (playClickSound) playClickSound();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="absolute inset-0 cursor-pointer"
            onClick={handleClose}
            aria-label={t("closeBtn")}
          />

          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className={`relative w-full max-w-xl max-h-[88vh] rounded-3xl shadow-2xl flex flex-col z-10 overflow-hidden border ${
              darkMode
                ? "bg-zinc-900 text-stone-100 border-zinc-700/80"
                : "bg-[#FDFBF7] text-stone-900 border-[#E8DFC8]"
            }`}
          >
            {/* Header */}
            <div
              className={`flex items-center justify-between px-6 py-4.5 border-b shrink-0 ${
                darkMode ? "border-zinc-800 bg-zinc-900/90" : "border-[#E8DFC8]/60 bg-[#FDFBF7]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-xl ${
                    darkMode ? "bg-sky-950/60 text-sky-400" : "bg-sky-100 text-sky-700"
                  }`}
                >
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-sans font-black text-base sm:text-lg tracking-tight leading-snug">
                    {t("termsOfServiceTitle")}
                  </h3>
                  <p className="text-[11px] font-mono opacity-65 leading-none">
                    {t("termsEffectiveDate")}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className={`p-2 rounded-full transition-colors cursor-pointer border-none ${
                  darkMode
                    ? "hover:bg-zinc-800 text-zinc-400 hover:text-white"
                    : "hover:bg-stone-200/80 text-stone-500 hover:text-stone-900"
                }`}
                aria-label={t("closeBtn")}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 text-xs leading-relaxed">
              {/* Section 1: Acceptance */}
              <div className="space-y-1">
                <h4 className="font-bold uppercase tracking-wider text-xs text-stone-800 dark:text-stone-200">
                  {t("termsSection1Header")}
                </h4>
                <p className="opacity-90">{t("termsSection1Desc")}</p>
              </div>

              {/* Section 2: Service Description */}
              <div className="space-y-1">
                <h4 className="font-bold uppercase tracking-wider text-xs text-stone-800 dark:text-stone-200">
                  {t("termsSection2Header")}
                </h4>
                <p className="opacity-90">{t("termsSection2Desc")}</p>
              </div>

              {/* Fair Play & Anti-Cheat */}
              <div
                className={`p-3.5 rounded-2xl border space-y-1.5 ${
                  darkMode
                    ? "bg-sky-950/30 border-sky-800/40 text-sky-200"
                    : "bg-sky-50 border-sky-200/80 text-sky-950"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-sky-500" />
                  <span>{t("termsFairPlayHeader")}</span>
                </div>
                <p className="text-[11.5px] opacity-90 leading-normal">
                  {t("termsFairPlayDesc")}
                </p>
              </div>

              {/* Cloud Account & Synchronization */}
              <div
                className={`p-3.5 rounded-2xl border space-y-1.5 ${
                  darkMode
                    ? "bg-purple-950/20 border-purple-800/40 text-purple-200"
                    : "bg-purple-50 border-purple-200/80 text-purple-950"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Cloud className="w-4 h-4 shrink-0 text-purple-500" />
                  <span>{t("termsCloudAccountHeader")}</span>
                </div>
                <p className="text-[11.5px] opacity-90 leading-normal">
                  {t("termsCloudAccountDesc")}
                </p>
              </div>

              {/* Section 3: Support & Contact */}
              <div className="space-y-1 pt-1">
                <h4 className="font-bold uppercase tracking-wider text-xs text-stone-800 dark:text-stone-200">
                  {t("termsSection3Header")}
                </h4>
                <p className="opacity-90">{t("termsSection3Desc")}</p>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400 pt-0.5">
                  <Mail className="w-3.5 h-3.5" />
                  <a
                    href="mailto:sudokutogethermode@gmail.com"
                    className="hover:underline font-mono"
                  >
                    sudokutogethermode@gmail.com
                  </a>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              className={`px-6 py-3.5 border-t flex justify-end shrink-0 ${
                darkMode ? "border-zinc-800 bg-zinc-900/60" : "border-[#E8DFC8]/60 bg-[#FDFBF7]"
              }`}
            >
              <button
                type="button"
                onClick={handleClose}
                className={`px-5 py-2 font-bold text-xs rounded-xl transition-all cursor-pointer border-none shadow-sm ${
                  darkMode
                    ? "bg-sky-600 hover:bg-sky-500 text-white"
                    : "bg-[#0369A1] hover:bg-[#0284c7] text-white"
                }`}
              >
                {t("closeBtn")}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
