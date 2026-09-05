import React from "react";
import { Pencil } from "lucide-react";

export interface SettingsModalProps {
  fromGameplaySettings: boolean;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  soundEffects: boolean;
  setSoundEffects: (val: boolean) => void;
  vibrations: boolean;
  setVibrations: (val: boolean) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (val: boolean) => void;
  highlightIdentical: boolean;
  setHighlightIdentical: (val: boolean) => void;
  showRemainingNumbers: boolean;
  setShowRemainingNumbers: (val: boolean) => void;
  highlightAreas: boolean;
  setHighlightAreas: (val: boolean) => void;
  isAutoRemoveNotesEnabled: boolean;
  setIsAutoRemoveNotesEnabled: (val: boolean) => void;
  isNumberFirstInputMode: boolean;
  setIsNumberFirstInputMode: (val: boolean) => void;
  timerEnabled: boolean;
  setTimerEnabled: (val: boolean) => void;
  mistakeLimitEnabled: boolean;
  setMistakeLimitEnabled: (val: boolean) => void;
  challengeMode: boolean;
  boardState?: { maxMistakesLimit?: number } | null;
  challengeMistakeLimit?: number;
  userProfile?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    avatarColor?: string;
    isSynced?: boolean;
  } | null;
  setUserProfile: (profile: any) => void;
  playClickSound: () => void;
  addLog: (msg: string) => void;
  onBackToGame: () => void;
  onOpenDisplayNameModal: () => void;
  onOpenHowToPlay: () => void;
  onOpenCompliancePage: (page: "terms" | "privacy" | "about" | "contact") => void;
  onOpenDeleteAccountModal: () => void;
  onOpenResetSettingsModal: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  fromGameplaySettings,
  darkMode,
  setDarkMode,
  soundEffects,
  setSoundEffects,
  vibrations,
  setVibrations,
  notificationsEnabled,
  setNotificationsEnabled,
  highlightIdentical,
  setHighlightIdentical,
  showRemainingNumbers,
  setShowRemainingNumbers,
  highlightAreas,
  setHighlightAreas,
  isAutoRemoveNotesEnabled,
  setIsAutoRemoveNotesEnabled,
  isNumberFirstInputMode,
  setIsNumberFirstInputMode,
  timerEnabled,
  setTimerEnabled,
  mistakeLimitEnabled,
  setMistakeLimitEnabled,
  challengeMode,
  boardState,
  challengeMistakeLimit = 3,
  userProfile,
  setUserProfile,
  playClickSound,
  addLog,
  onBackToGame,
  onOpenDisplayNameModal,
  onOpenHowToPlay,
  onOpenCompliancePage,
  onOpenDeleteAccountModal,
  onOpenResetSettingsModal
}) => {
  return (
    <div
      className={`${
        fromGameplaySettings
          ? `fixed inset-0 w-screen h-screen z-50 p-6 flex flex-col items-center justify-start overflow-y-auto pt-[calc(80px+env(safe-area-inset-top,0px))] lg:pt-[85px] ${
              darkMode ? "bg-[#121212] paper-pattern-dark" : "bg-[#FDFBF7] paper-pattern"
            }`
          : "flex-1 w-full flex flex-col items-center justify-start p-4 md:p-6 overflow-y-auto pb-24 pt-[calc(80px+env(safe-area-inset-top,0px))] lg:pt-[85px]"
      } select-none selection:bg-[#E0F2FE]`}
      style={{ minHeight: 0 }}
    >
      {/* Pink Back Tag Arrow Button - only visible if entered from gameplay options */}
      {fromGameplaySettings && (
        <button
          onClick={() => {
            playClickSound();
            onBackToGame();
          }}
          className="absolute top-4 left-4 bg-[#FCE7F3] hover:bg-[#FBCFE8] text-[#9D174D] border-none px-4 py-2.5 text-xs font-black uppercase rounded-xl cursor-pointer shadow-[0_4px_12px_rgba(157,23,77,0.06),_0_2px_4px_rgba(0,0,0,0.02)] transition-all active:scale-95 flex items-center justify-center gap-1.5 z-50 mb-6"
        >
          ◀ BACK
        </button>
      )}

      {/* Directly sit on main background, wrapped in a max-w-sm utility shell for responsive centering and flex spacing */}
      <div
        className={`w-full max-w-sm lg:max-w-4xl mx-auto flex flex-col lg:grid lg:grid-cols-2 lg:items-start gap-5 lg:gap-6 ${
          fromGameplaySettings ? "mt-3" : ""
        }`}
        id="settings-screen-inner-container"
      >
        {/* 👤 PLAYER IDENTITY DISPLAY NAME CARD */}
        <div
          className={`p-5 rounded-2xl flex flex-col gap-4 text-left font-sans border-none shadow-md lg:col-span-2 ${
            darkMode
              ? "bg-[#3b0764]/20 border border-[#f5f3ff]/15 text-[#d8b4fe]"
              : "bg-[#f3e8ff]/60 lg:bg-[#FDFBF7] text-[#6b21a8] shadow-[0_8px_30px_rgba(107,33,168,0.04)]"
          }`}
        >
          <div
            className={`flex items-center justify-between p-3 rounded-xl border ${
              darkMode ? "bg-zinc-950/45 border-purple-900/20" : "bg-white/60 border-purple-200/40"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full border-none flex items-center justify-center text-md font-sans font-black text-white shrink-0 shadow-sm"
                style={{ backgroundColor: userProfile?.avatarColor || "#8B5CF6" }}
              >
                {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : "V"}
              </div>
              <div className="flex flex-col">
                <span
                  className={`text-[10px] font-mono font-black uppercase tracking-wider ${
                    darkMode ? "text-purple-300" : "text-purple-700"
                  }`}
                >
                  Display Name
                </span>
                <span
                  className={`font-sans font-bold text-sm ${
                    darkMode ? "text-stone-100" : "text-purple-950"
                  }`}
                >
                  {userProfile?.name &&
                  userProfile.name !== "Anonymous Voyager" &&
                  userProfile.name !== "Guest Voyager" &&
                  userProfile.name !== "Guest Solver"
                    ? userProfile.name
                    : "Anonymous Voyager"}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                playClickSound();
                onOpenDisplayNameModal();
              }}
              className={`p-2 rounded-full border-none cursor-pointer transition-all hover:bg-purple-200/50 dark:hover:bg-purple-950/40 active:scale-95 text-purple-700 dark:text-purple-300 flex items-center justify-center`}
              title="Edit Display Name"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>

          {/* Google Credentials Sync Section rendered directly inside the main card */}
          {userProfile?.isSynced ? (
            <div className="flex flex-col gap-2.5">
              <div
                className={`p-3 rounded-xl border ${
                  darkMode
                    ? "bg-purple-950/40 border-purple-800/30 text-purple-100"
                    : "bg-white border border-purple-200/60 text-purple-950"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 inline-block animate-pulse" />
                  <span className="text-xs font-sans font-bold text-purple-600 dark:text-purple-400">
                    Synced Securely ✓
                  </span>
                </div>
                <span
                  className={`text-[11px] font-mono mt-1 select-all truncate block ${
                    darkMode ? "text-purple-200" : "text-purple-900"
                  }`}
                >
                  {userProfile?.email || "sudokutogethermode@gmail.com"}
                </span>
              </div>

              <button
                onClick={() => {
                  playClickSound();
                  setUserProfile({
                    id: "GUEST_" + Math.floor(10000 + Math.random() * 90000),
                    name: "Guest Voyager",
                    avatarColor: "#6B7280",
                    isSynced: false
                  });
                  localStorage.removeItem("sudoku_userProfile");
                  localStorage.removeItem("sudoku_is_display_name_configured");
                  addLog("👤 Profile disconnected from cloud sync.");
                }}
                className={`w-full font-sans text-[10px] lg:text-[12px] font-black uppercase tracking-wider py-2.5 lg:py-3 border-none rounded-xl active:scale-[0.98] transition-all text-center cursor-pointer ${
                  darkMode
                    ? "bg-purple-950/50 hover:bg-purple-950/80 text-purple-200 border border-purple-800/30"
                    : "bg-purple-100 hover:bg-purple-200 text-purple-950"
                }`}
              >
                Disconnect Sync
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 w-full select-none">
              <button
                disabled
                className={`w-full flex items-center justify-center gap-2 font-sans text-[10.5px] lg:text-[13px] font-black uppercase tracking-wider py-2.5 lg:py-3.5 px-4 rounded-xl transition-all text-center border-none opacity-50 cursor-not-allowed ${
                  darkMode ? "bg-zinc-800 text-stone-500" : "bg-stone-100 text-stone-400"
                }`}
              >
                <svg
                  className="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0 bg-[#A8A29E]/30 p-0.5 rounded-full grayscale opacity-50"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Connect Google Account</span>
              </button>
              <p className="text-[10px] text-stone-500 dark:text-zinc-400 mt-1.5 leading-normal font-sans text-center">
                Cloud synchronization across devices will be available in a future update.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5 lg:gap-6">
          {/* CATEGORY 1: [GENERAL PREFERENCES] */}
          <div
            className={`p-5 rounded-xl flex flex-col gap-4 text-left font-sans border-none shadow-md ${
              darkMode
                ? "bg-[#0c4a6e]/20 border border-[#bae6fd]/15 text-[#bae6fd]"
                : "bg-[#E0F2FE]/60 lg:bg-[#FDFBF7] text-[#0369A1] shadow-[0_8px_30px_rgba(3,105,161,0.04)]"
            }`}
          >
            <span
              className={`text-base font-bold tracking-tight leading-none ${
                darkMode ? "text-sky-300" : "text-[#0369A1]"
              }`}
            >
              GENERAL PREFERENCES
            </span>

            {/* Dark Mode Theme */}
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${darkMode ? "text-stone-300" : "text-stone-850"}`}>
                Dark Mode Theme
              </span>
              <button
                onClick={() => {
                  playClickSound();
                  setDarkMode(!darkMode);
                }}
                className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-all duration-200 border-none cursor-pointer active:scale-95 ${
                  darkMode
                    ? "bg-sky-500 active:bg-sky-600 shadow-none"
                    : "bg-[#BAE6FD] active:bg-[#90cdf4] shadow-sm active:shadow-none"
                }`}
              >
                <div
                  className={`w-[16px] h-[16px] bg-white rounded-full shadow-md transform transition-all duration-200 border-none ${
                    darkMode ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Sound Effects */}
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${darkMode ? "text-stone-300" : "text-stone-850"}`}>
                Sound Effects
              </span>
              <button
                onClick={() => {
                  setSoundEffects(!soundEffects);
                }}
                className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-all duration-200 border-none cursor-pointer active:scale-95 ${
                  soundEffects
                    ? darkMode
                      ? "bg-sky-500"
                      : "bg-[#0369A1] active:bg-[#025a8b] shadow-none"
                    : darkMode
                    ? "bg-zinc-850"
                    : "bg-[#BAE6FD] active:bg-[#90cdf4] shadow-sm active:shadow-none"
                }`}
              >
                <div
                  className={`w-[16px] h-[16px] bg-white rounded-full shadow-md transform transition-all duration-200 border-none ${
                    soundEffects ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Haptic Vibrations */}
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${darkMode ? "text-stone-300" : "text-stone-850"}`}>
                Haptic Vibrations
              </span>
              <button
                onClick={() => {
                  playClickSound();
                  setVibrations(!vibrations);
                }}
                className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-all duration-200 border-none cursor-pointer active:scale-95 ${
                  vibrations
                    ? darkMode
                      ? "bg-sky-500"
                      : "bg-[#0369A1] active:bg-[#025a8b] shadow-none"
                    : darkMode
                    ? "bg-zinc-850"
                    : "bg-[#BAE6FD] active:bg-[#90cdf4] shadow-sm active:shadow-none"
                }`}
              >
                <div
                  className={`w-[16px] h-[16px] bg-white rounded-full shadow-md transform transition-all duration-200 border-none ${
                    vibrations ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Push Notifications */}
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${darkMode ? "text-stone-300" : "text-stone-850"}`}>
                Push Notifications
              </span>
              <button
                onClick={() => {
                  playClickSound();
                  setNotificationsEnabled(!notificationsEnabled);
                }}
                className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-all duration-200 border-none cursor-pointer active:scale-95 ${
                  notificationsEnabled
                    ? darkMode
                      ? "bg-sky-500"
                      : "bg-[#0369A1] active:bg-[#025a8b] shadow-none"
                    : darkMode
                    ? "bg-zinc-850"
                    : "bg-[#BAE6FD] active:bg-[#90cdf4] shadow-sm active:shadow-none"
                }`}
              >
                <div
                  className={`w-[16px] h-[16px] bg-white rounded-full shadow-md transform transition-all duration-200 border-none ${
                    notificationsEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* CATEGORY 3: [SMART ASSISTANTS] */}
          <div
            className={`p-5 rounded-xl flex flex-col gap-4 text-left font-sans border-none shadow-md ${
              darkMode
                ? "bg-[#4c0519]/25 border border-[#fecdd3]/15 text-[#fecdd3]"
                : "bg-[#FCE7F3]/60 lg:bg-[#FDFBF7] text-stone-850 shadow-[0_8px_30px_rgba(157,23,77,0.03)]"
            }`}
          >
            <span
              className={`text-base font-bold tracking-tight leading-none ${
                darkMode ? "text-pink-300" : "text-[#9D174D]"
              }`}
            >
              SMART ASSISTANTS
            </span>

            {/* Highlight Identical */}
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${darkMode ? "text-[#fecdd3]/90" : "text-stone-850"}`}>
                Highlight Identical
              </span>
              <button
                onClick={() => {
                  playClickSound();
                  setHighlightIdentical(!highlightIdentical);
                }}
                className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-all duration-200 border-none cursor-pointer active:scale-95 ${
                  highlightIdentical
                    ? darkMode
                      ? "bg-pink-500"
                      : "bg-[#9D174D] active:bg-[#7e123d] shadow-none"
                    : "bg-[#FBCFE8] active:bg-[#f9a8d4] shadow-sm active:shadow-none"
                }`}
              >
                <div
                  className={`w-[16px] h-[16px] bg-white rounded-full shadow-md transform transition-all duration-200 border-none ${
                    highlightIdentical ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Remaining Numbers */}
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${darkMode ? "text-[#fecdd3]/90" : "text-stone-850"}`}>
                Remaining Numbers
              </span>
              <button
                onClick={() => {
                  playClickSound();
                  setShowRemainingNumbers(!showRemainingNumbers);
                }}
                className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-all duration-200 border-none cursor-pointer active:scale-95 ${
                  showRemainingNumbers
                    ? darkMode
                      ? "bg-pink-500"
                      : "bg-[#9D174D] active:bg-[#7e123d] shadow-none"
                    : "bg-[#FBCFE8] active:bg-[#f9a8d4] shadow-sm active:shadow-none"
                }`}
              >
                <div
                  className={`w-[16px] h-[16px] bg-white rounded-full shadow-md transform transition-all duration-200 border-none ${
                    showRemainingNumbers ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Highlight Area */}
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${darkMode ? "text-[#fecdd3]/90" : "text-stone-850"}`}>
                Highlight Area
              </span>
              <button
                onClick={() => {
                  playClickSound();
                  setHighlightAreas(!highlightAreas);
                }}
                className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-all duration-200 border-none cursor-pointer active:scale-95 ${
                  highlightAreas
                    ? darkMode
                      ? "bg-pink-500"
                      : "bg-[#9D174D] active:bg-[#7e123d] shadow-none"
                    : "bg-[#FBCFE8] active:bg-[#f9a8d4] shadow-sm active:shadow-none"
                }`}
              >
                <div
                  className={`w-[16px] h-[16px] bg-white rounded-full shadow-md transform transition-all duration-200 border-none ${
                    highlightAreas ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Auto-Remove Notes */}
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${darkMode ? "text-[#fecdd3]/90" : "text-stone-850"}`}>
                Auto-Remove Notes
              </span>
              <button
                onClick={() => {
                  playClickSound();
                  setIsAutoRemoveNotesEnabled(!isAutoRemoveNotesEnabled);
                }}
                className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-all duration-200 border-none cursor-pointer active:scale-95 ${
                  isAutoRemoveNotesEnabled
                    ? darkMode
                      ? "bg-pink-500"
                      : "bg-[#9D174D] active:bg-[#7e123d] shadow-none"
                    : "bg-[#FBCFE8] active:bg-[#f9a8d4] shadow-sm active:shadow-none"
                }`}
              >
                <div
                  className={`w-[16px] h-[16px] bg-white rounded-full shadow-md transform transition-all duration-200 border-none ${
                    isAutoRemoveNotesEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Paint Mode */}
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${darkMode ? "text-[#fecdd3]/90" : "text-stone-850"}`}>
                Paint Mode
              </span>
              <button
                onClick={() => {
                  playClickSound();
                  setIsNumberFirstInputMode(!isNumberFirstInputMode);
                }}
                className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-all duration-200 border-none cursor-pointer active:scale-95 ${
                  isNumberFirstInputMode
                    ? darkMode
                      ? "bg-pink-500"
                      : "bg-[#9D174D] active:bg-[#7e123d] shadow-none"
                    : "bg-[#FBCFE8] active:bg-[#f9a8d4] shadow-sm active:shadow-none"
                }`}
              >
                <div
                  className={`w-[16px] h-[16px] bg-white rounded-full shadow-md transform transition-all duration-200 border-none ${
                    isNumberFirstInputMode ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5 lg:gap-6">
          {/* CATEGORY 2: [GAMEPLAY RULES] */}
          <div
            className={`p-5 rounded-xl flex flex-col gap-4 text-left font-sans border-none shadow-md ${
              darkMode
                ? "bg-[#064e3b]/25 border border-[#a7f3d0]/15 text-[#a7f3d0]"
                : "bg-[#E6F4EA]/60 lg:bg-[#FDFBF7] text-stone-850 shadow-[0_8px_30px_rgba(3,105,161,0.02)]"
            }`}
          >
            <span
              className={`text-base font-bold tracking-tight leading-none ${
                darkMode ? "text-emerald-300" : "text-[#135236]"
              }`}
            >
              GAMEPLAY RULES
            </span>

            {/* Active Timer Clock */}
            <div className={`flex items-center justify-between ${challengeMode ? "opacity-60 select-none" : ""}`}>
              <div className="flex flex-col">
                <span className={`text-sm font-medium ${darkMode ? "text-[#a7f3d0]/90" : "text-stone-850"}`}>
                  Active Timer Clock
                </span>
                {challengeMode && (
                  <span className="text-[10px] text-red-500 font-black tracking-wide mt-0.5 flex items-center gap-0.5">
                    🔒 LOCKED BY CHALLENGE
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  if (challengeMode) return;
                  playClickSound();
                  setTimerEnabled(!timerEnabled);
                }}
                disabled={challengeMode}
                className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-all duration-200 border-none ${
                  challengeMode ? "cursor-not-allowed opacity-80" : "cursor-pointer active:scale-95"
                } ${
                  timerEnabled
                    ? darkMode
                      ? "bg-emerald-500"
                      : "bg-[#135236] active:bg-[#0e3c28] shadow-none"
                    : "bg-[#D1FAE5] active:bg-[#a7f3d0] shadow-sm active:shadow-none"
                }`}
              >
                <div
                  className={`w-[16px] h-[16px] bg-white rounded-full shadow-md transform transition-all duration-200 border-none ${
                    timerEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Strict Mistake Limit */}
            <div className={`flex flex-col gap-1 ${challengeMode ? "opacity-60 select-none" : ""}`}>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className={`text-sm font-medium ${darkMode ? "text-[#a7f3d0]/90" : "text-stone-850"}`}>
                    Strict Mistake Limit
                  </span>
                  {challengeMode && (
                    <span className="text-[10px] text-red-500 font-black tracking-wide mt-0.5 flex items-center gap-0.5">
                      🔒 LOCKED TO {boardState?.maxMistakesLimit ?? challengeMistakeLimit} ERRORS
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    if (challengeMode) return;
                    playClickSound();
                    setMistakeLimitEnabled(!mistakeLimitEnabled);
                  }}
                  disabled={challengeMode}
                  className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-all duration-200 border-none ${
                    challengeMode ? "cursor-not-allowed opacity-80" : "cursor-pointer active:scale-95"
                  } ${
                    mistakeLimitEnabled
                      ? darkMode
                        ? "bg-emerald-500"
                        : "bg-[#135236] active:bg-[#0e3c28] shadow-none"
                      : "bg-[#D1FAE5] active:bg-[#a7f3d0] shadow-sm active:shadow-none"
                  }`}
                >
                  <div
                    className={`w-[16px] h-[16px] bg-white rounded-full shadow-md transform transition-all duration-200 border-none ${
                      mistakeLimitEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Support and Info Section */}
          <div
            className={`p-5 rounded-2xl flex flex-col gap-4 text-left font-sans border-none shadow-md ${
              darkMode
                ? "bg-[#78350f]/20 border border-[#fde68a]/15 text-[#fde68a]"
                : "bg-[#FEF3C7]/60 lg:bg-[#FDFBF7] text-amber-950 shadow-[0_8px_30px_rgba(180,83,9,0.04)]"
            }`}
          >
            <span
              className={`text-[10.5px] font-mono font-black uppercase tracking-wider border-b pb-1.5 ${
                darkMode ? "text-amber-300 border-[#fde68a]/20" : "text-amber-800 border-amber-200"
              }`}
            >
              Support & Info
            </span>

            <div className="flex flex-col gap-2 font-mono">
              <button
                onClick={() => {
                  playClickSound();
                  onOpenHowToPlay();
                }}
                className={`w-full py-2.5 px-4 text-[11px] uppercase font-black tracking-wider text-left rounded-xl border-none shadow-sm active:scale-[0.98] transition-all cursor-pointer flex justify-between items-center ${
                  darkMode
                    ? "bg-amber-950/40 hover:bg-amber-950/60 text-amber-200"
                    : "bg-white hover:bg-amber-50 text-amber-950"
                }`}
              >
                <span>How to Play</span>
                <svg
                  className="w-3.5 h-3.5 opacity-60"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  onOpenCompliancePage("terms");
                }}
                className={`w-full py-2.5 px-4 text-[11px] uppercase font-black tracking-wider text-left rounded-xl border-none shadow-sm active:scale-[0.98] transition-all cursor-pointer flex justify-between items-center ${
                  darkMode
                    ? "bg-amber-950/40 hover:bg-amber-950/60 text-amber-200"
                    : "bg-white hover:bg-amber-50 text-amber-950"
                }`}
              >
                <span>Terms of Service</span>
                <svg
                  className="w-3.5 h-3.5 opacity-60"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  onOpenCompliancePage("privacy");
                }}
                className={`w-full py-2.5 px-4 text-[11px] uppercase font-black tracking-wider text-left rounded-xl border-none shadow-sm active:scale-[0.98] transition-all cursor-pointer flex justify-between items-center ${
                  darkMode
                    ? "bg-amber-950/40 hover:bg-amber-950/60 text-amber-200"
                    : "bg-white hover:bg-amber-50 text-amber-950"
                }`}
              >
                <span>Privacy Policy</span>
                <svg
                  className="w-3.5 h-3.5 opacity-60"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  onOpenCompliancePage("about");
                }}
                className={`w-full py-2.5 px-4 text-[11px] uppercase font-black tracking-wider text-left rounded-xl border-none shadow-sm active:scale-[0.98] transition-all cursor-pointer flex justify-between items-center ${
                  darkMode
                    ? "bg-amber-950/40 hover:bg-amber-950/60 text-amber-200"
                    : "bg-white hover:bg-amber-50 text-amber-950"
                }`}
              >
                <span>About Us</span>
                <svg
                  className="w-3.5 h-3.5 opacity-60"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  onOpenCompliancePage("contact");
                }}
                className={`w-full py-2.5 px-4 text-[11px] uppercase font-black tracking-wider text-left rounded-xl border-none shadow-sm active:scale-[0.98] transition-all cursor-pointer flex justify-between items-center ${
                  darkMode
                    ? "bg-amber-950/40 hover:bg-amber-950/60 text-amber-200"
                    : "bg-white hover:bg-amber-50 text-amber-950"
                }`}
              >
                <span>Contact Support</span>
                <svg
                  className="w-3.5 h-3.5 opacity-60"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  if (!userProfile?.isSynced) {
                    alert(
                      "No account data found. Since you are not logged in, there is no account or personal data to delete."
                    );
                  } else {
                    onOpenDeleteAccountModal();
                  }
                }}
                className={`w-full mt-2 py-2.5 px-4 text-[11px] uppercase font-black tracking-wider text-left rounded-xl border-none shadow-sm active:scale-[0.98] transition-all cursor-pointer flex justify-between items-center ${
                  darkMode
                    ? "bg-red-900/40 hover:bg-red-900/60 text-red-300"
                    : "bg-red-50 hover:bg-red-100 text-red-700"
                }`}
              >
                <span>Delete Account & Data</span>
                <svg
                  className="w-3.5 h-3.5 opacity-60"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  onOpenResetSettingsModal();
                }}
                className={`w-full mt-2 py-2.5 px-4 text-[11px] uppercase font-black tracking-wider text-left rounded-xl border-none shadow-sm active:scale-[0.98] transition-all cursor-pointer flex justify-between items-center ${
                  darkMode
                    ? "bg-stone-800/40 hover:bg-stone-800/60 text-stone-300"
                    : "bg-stone-100 hover:bg-stone-200 text-stone-700"
                }`}
              >
                <span>Reset Settings</span>
                <svg
                  className="w-3.5 h-3.5 opacity-60"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
