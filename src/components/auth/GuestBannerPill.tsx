import React, { useState } from "react";
import { X, Sparkles } from "lucide-react";
import { useTranslation } from "../../i18n/useTranslation";
import { dismissGuestPrompt24h, shouldShowGuestPrompt } from "../../utils/guestTracking";

interface GuestBannerPillProps {
  onConnectGoogle: () => void;
  darkMode: boolean;
  className?: string;
}

export const GuestBannerPill: React.FC<GuestBannerPillProps> = ({
  onConnectGoogle,
  darkMode,
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(() => shouldShowGuestPrompt(true));
  const { language } = useTranslation();

  if (!isVisible) return null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    dismissGuestPrompt24h();
    setIsVisible(false);
  };

  const isHindi = Boolean(language && language.toLowerCase().startsWith("hi"));

  const bannerText = isHindi
    ? "अतिथि मोड में हैं। अपने रिकॉर्ड और दोस्त सुरक्षित रखने के लिए Google जोड़ें।"
    : "Playing as Guest. Connect Google to save your records & friend list.";

  const connectButtonText = isHindi ? "Google जोड़ें" : "Connect";

  return (
    <div
      className={`w-full p-3 sm:p-3.5 mb-2 rounded-2xl flex items-center justify-between gap-3 shadow-xs select-none transition-all duration-200 ${
        darkMode
          ? "bg-amber-950/40 text-amber-100 shadow-[0_4px_16px_rgba(0,0,0,0.25)]"
          : "bg-[#FEF3C7]/90 text-amber-950 shadow-[0_2px_10px_rgba(180,83,9,0.06)]"
      } ${className}`}
      style={{ border: "none" }}
      role="region"
      aria-label="Guest Mode Reminder"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className={`p-2 rounded-xl shrink-0 flex items-center justify-center ${
            darkMode ? "bg-amber-900/60 text-amber-300" : "bg-amber-100 text-amber-700"
          }`}
        >
          <Sparkles className="w-4 h-4 shrink-0" />
        </div>
        <p className="text-[11.5px] sm:text-xs font-medium leading-snug line-clamp-2 text-left">
          {bannerText}
        </p>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={onConnectGoogle}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs border-none ${
            darkMode
              ? "bg-amber-400 hover:bg-amber-300 text-amber-950"
              : "bg-amber-600 hover:bg-amber-700 text-white"
          }`}
        >
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{connectButtonText}</span>
        </button>

        <button
          type="button"
          onClick={handleDismiss}
          className={`p-1.5 rounded-lg opacity-60 hover:opacity-100 transition-opacity cursor-pointer border-none ${
            darkMode ? "text-amber-300 hover:bg-amber-900/40" : "text-amber-800 hover:bg-amber-100"
          }`}
          title="Dismiss for 24 hours"
          aria-label="Dismiss for 24 hours"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
