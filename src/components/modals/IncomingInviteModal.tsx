import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Check } from "lucide-react";

export interface IncomingInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  incomingChallengeDetails: {
    senderName?: string;
    difficulty?: string;
    maxMistakes?: number;
    password?: string;
    [key: string]: any;
  } | null;
  enteredInvitePassword: string;
  setEnteredInvitePassword: (val: string) => void;
  invitePasswordError: string | null;
  setInvitePasswordError: (err: string | null) => void;
  onDecline: () => void;
  onAccept: () => void;
  darkMode: boolean;
  playClickSound: () => void;
}

export const IncomingInviteModal: React.FC<IncomingInviteModalProps> = ({
  isOpen,
  onClose,
  incomingChallengeDetails,
  enteredInvitePassword,
  setEnteredInvitePassword,
  invitePasswordError,
  setInvitePasswordError,
  onDecline,
  onAccept,
  darkMode,
  playClickSound
}) => {
  return (
    <AnimatePresence>
      {isOpen && incomingChallengeDetails && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#FDFBF7]/80 dark:bg-[#1A1A1A]/80 backdrop-blur-sm p-4">
          {/* Backdrop click dismisser */}
          <div 
            className="absolute inset-0 cursor-pointer" 
            onClick={() => {
              playClickSound();
              onClose();
            }} 
          />

          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className={`relative w-full max-w-sm rounded-[32px] p-8 border-none flex flex-col gap-6 shadow-[0_12px_40px_rgba(0,0,0,0.08)] select-none z-[10001] text-center transition-colors duration-300 ${
              darkMode ? "bg-[#2A2D24] text-[#FDFBF7]" : "bg-[#FDFBF7] text-[#4B5563]"
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <span className={`text-[12px] font-sans font-bold uppercase tracking-widest ${darkMode ? "text-[#D1D5DB]" : "text-[#9CA3AF]"}`}>
                Game Invitation
              </span>
              <h3 className={`text-2xl font-sans font-medium tracking-tight mt-1 ${darkMode ? "text-[#FDFBF7]" : "text-[#4B5563]"}`}>
                {incomingChallengeDetails.senderName || "Fellow Player"}
              </h3>
              <p className={`text-sm font-sans mt-0.5 ${darkMode ? "text-[#9CA3AF]" : "text-[#6B7280]"}`}>
                invited you to clear a board.
              </p>
            </div>

            {/* 📊 SUMMARY */}
            <div className="flex items-center justify-center gap-6 py-2">
              <div className="flex flex-col items-center">
                <span className={`text-[10px] uppercase font-bold tracking-widest ${darkMode ? "text-[#6B7280]" : "text-[#D1D5DB]"}`}>Level</span>
                <span className="text-lg font-mono font-medium">{incomingChallengeDetails.difficulty}</span>
              </div>
              <div className={`w-[1px] h-8 ${darkMode ? "bg-[#4B5563]" : "bg-[#E5E7EB]"}`} />
              <div className="flex flex-col items-center">
                <span className={`text-[10px] uppercase font-bold tracking-widest ${darkMode ? "text-[#6B7280]" : "text-[#D1D5DB]"}`}>Mistakes</span>
                <span className="text-lg font-mono font-medium">{incomingChallengeDetails.maxMistakes} limit</span>
              </div>
            </div>

            {/* 🔒 PASSWORD FIELD */}
            {incomingChallengeDetails.password && (
              <div className={`p-4 rounded-3xl border-none flex flex-col gap-2 select-none ${
                darkMode ? "bg-stone-800/20 text-rose-300" : "bg-[#FFF5F5] text-red-950"
              }`}>
                <div className="flex items-center justify-center gap-1.5 font-sans font-bold uppercase tracking-wider text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-red-500 animate-pulse" />
                  Enter Password
                </div>
                <input
                  type="text"
                  maxLength={16}
                  placeholder="Passcode..."
                  value={enteredInvitePassword}
                  onChange={(e) => {
                    setEnteredInvitePassword(e.target.value.replace(/[^a-zA-Z0-9]/g, ''));
                    setInvitePasswordError(null);
                  }}
                  className={`w-full py-2.5 px-3 rounded-[16px] text-center text-xs font-mono font-bold tracking-widest border-none focus:outline-none focus:ring-0 select-none ${
                    darkMode ? "bg-black/20 text-stone-100 placeholder-zinc-700" : "bg-white text-stone-850 placeholder-stone-300"
                  }`}
                />
                {invitePasswordError && (
                  <span className="text-[10px] font-bold text-rose-600 text-center uppercase tracking-wide mt-0.5">
                    {invitePasswordError}
                  </span>
                )}
              </div>
            )}

            {/* ACTION FOOTER */}
            <div className="flex w-full gap-3 mt-2">
              <button
                onClick={() => {
                  playClickSound();
                  onDecline();
                }}
                className={`flex-1 aspect-[2/1] rounded-[24px] flex items-center justify-center transition-all shadow-[0_4px_12px_rgba(0,0,0,0.02)] active:scale-95 border-none cursor-pointer ${
                  darkMode ? "bg-[#3F4238] text-[#FDFBF7] hover:bg-[#4E5146]" : "bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]"
                }`}
              >
                <X className="w-7 h-7" strokeWidth={1.5} />
              </button>
              <button
                onClick={() => {
                  playClickSound();
                  onAccept();
                }}
                className={`flex-1 aspect-[2/1] rounded-[24px] flex items-center justify-center transition-all shadow-[0_4px_12px_rgba(0,0,0,0.02)] active:scale-95 border-none cursor-pointer ${
                  darkMode ? "bg-[#D1FAE5] text-[#065F46] hover:bg-[#A7F3D0]" : "bg-[#D1FAE5] text-[#065F46] hover:bg-[#A7F3D0]"
                }`}
              >
                <Check className="w-7 h-7" strokeWidth={1.5} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
