import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { X, Loader2, Share2, Download, Check } from "lucide-react";
import { SudokuBoardState, Difficulty } from "../game/SudokuBoard";
import { useTranslation } from "../../i18n/useTranslation";
import {
  generateShareCanvas,
  ShareDifficulty,
  buildFreshChallengeUrl,
  evaluateBoardDidWin,
  SHARE_I18N,
  getShareI18n,
} from "../../utils/canvasShare";

export interface SharePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardState: SudokuBoardState | null;
  solutionGrid?: number[][];
  difficulty: ShareDifficulty;
  time: string;
  sessionSeconds?: number;
  playerName: string;
  tagline?: string;
  bestTime?: string;
  isNewRecord?: boolean;
  isWon?: boolean;
  darkMode?: boolean;
  roomCode?: string;
  playClickSound?: () => void;
  language?: string;
}

const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
  const response = await fetch(dataUrl);
  return await response.blob();
};

export const SharePreviewModal: React.FC<SharePreviewModalProps> = ({
  isOpen,
  onClose,
  boardState,
  solutionGrid = [],
  difficulty,
  time,
  sessionSeconds,
  playerName,
  bestTime,
  isNewRecord = false,
  isWon,
  darkMode = false,
  roomCode,
  playClickSound,
  language: propLanguage,
}) => {
  const { language: hookLanguage } = useTranslation();
  const activeLang = propLanguage || hookLanguage || "en";
  const i18n = getShareI18n(activeLang);

  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const [isSavedSuccess, setIsSavedSuccess] = useState<boolean>(false);
  const [clipboardToast, setClipboardToast] = useState<string | null>(null);

  const normalizedDiff = String(
    difficulty || boardState?.difficulty || "EASY"
  ).toUpperCase() as Difficulty;

  // Strict Win/Loss evaluation: requires < maxMistakes AND all 81 cells populated
  const didWin = evaluateBoardDidWin(boardState, isWon);

  const { fullUrl, extractedRoomCode, challengeId } = buildFreshChallengeUrl(
    boardState,
    normalizedDiff,
    roomCode,
    playerName
  );

  const ctaCopy = didWin
    ? (isNewRecord ? i18n.hook.win_record(time) : i18n.hook.win_normal(time))
    : i18n.hook.defeat;

  useEffect(() => {
    if (!isOpen) {
      setGeneratedImage(null);
      setIsGenerating(true);
      setIsSavedSuccess(false);
      setClipboardToast(null);
      return;
    }

    let isCancelled = false;
    setIsGenerating(true);
    setGeneratedImage(null);

    const runCanvasGenerator = async () => {
      try {
        const gameState = {
          boardState,
          solutionGrid,
          difficulty: normalizedDiff,
          time,
          sessionSeconds,
          playerName,
          bestTime,
          isNewRecord: isNewRecord && didWin,
          isWon: didWin,
          darkMode,
          roomCode,
          language: activeLang,
        };
        const themeColor = normalizedDiff;
        const url = await generateShareCanvas(
          gameState,
          challengeId,
          themeColor
        );

        if (!isCancelled) {
          setGeneratedImage(url);
        }
      } catch (error) {
        console.error("Canvas share generation failed:", error);
      } finally {
        if (!isCancelled) {
          setIsGenerating(false);
        }
      }
    };

    runCanvasGenerator();

    return () => {
      isCancelled = true;
    };
  }, [
    isOpen,
    boardState,
    solutionGrid,
    normalizedDiff,
    time,
    sessionSeconds,
    playerName,
    bestTime,
    isNewRecord,
    didWin,
    darkMode,
    roomCode,
    challengeId,
  ]);

  const handleShareScreenshot = async () => {
    if (playClickSound) playClickSound();
    if (isGenerating || !generatedImage) return;

    const challengeUrl =
      buildFreshChallengeUrl(challengeId, playerName) || window.location.href;
    const shareText = i18n.modal.share_msg(challengeUrl);
    const base64Data = generatedImage.replace(/^data:image\/png;base64,/, "");

    const triggerClipboardToast = () => {
      setClipboardToast(i18n.modal.toast_copied);
      setTimeout(() => {
        setClipboardToast((prev) =>
          prev === i18n.modal.toast_copied ? null : prev
        );
      }, 3800);
    };

    // Synchronously initiate clipboard write during active user gesture on non-native platforms
    // so desktop file sharing (which may strip accompanying text/URL) always retains the playable link
    if (!Capacitor.isNativePlatform()) {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        navigator.clipboard
          .writeText(shareText)
          .then(() => {
            triggerClipboardToast();
          })
          .catch(() => {
            // Ignore clipboard permission errors in restricted contexts
          });
      }
    }

    const copyChallengeToClipboard = async () => {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(shareText);
          triggerClipboardToast();
        } catch {
          // Ignore clipboard permission errors in restricted contexts
        }
      }
    };

    try {
      if (Capacitor.isNativePlatform()) {
        const savedFile = await Filesystem.writeFile({
          path: "share_result.png",
          data: base64Data,
          directory: Directory.Cache,
        });

        await Share.share({
          title: i18n.modal.share_title,
          text: shareText,
          url: savedFile.uri,
          dialogTitle: "Share this Screenshot",
        });
      } else {
        const blob = await dataUrlToBlob(generatedImage);
        const imageFile = new File([blob], "sudoku-sync-result.png", {
          type: "image/png",
        });

        const shareData: ShareData = {
          files: [imageFile],
          title: i18n.modal.share_title,
          text: `Can you beat my game? Play here: ${challengeUrl}`,
          url: challengeUrl,
        };

        if (typeof navigator !== "undefined" && navigator.share) {
          if (!navigator.canShare || navigator.canShare(shareData)) {
            await navigator.share(shareData);
          } else if (navigator.canShare({ files: [imageFile] })) {
            await copyChallengeToClipboard();
            await navigator.share({
              files: [imageFile],
              title: i18n.modal.share_title,
              text: shareText,
            });
          } else {
            await copyChallengeToClipboard();
            await navigator.share({
              title: i18n.modal.share_title,
              text: shareText,
              url: challengeUrl,
            });
          }
        } else {
          await copyChallengeToClipboard();
          const link = document.createElement("a");
          link.href = generatedImage;
          link.download = `sudoku-sync-${normalizedDiff.toLowerCase()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    } catch (error) {
      await copyChallengeToClipboard();
      console.error("Share failed:", error);
    }
  };

  const handleSaveToGallery = async () => {
    if (playClickSound) playClickSound();
    if (isGenerating || !generatedImage) return;

    const fileName = `sudoku-sync-${normalizedDiff.toLowerCase()}-${Date.now()}.png`;
    const base64Data = generatedImage.replace(/^data:image\/png;base64,/, "");

    try {
      if (Capacitor.isNativePlatform()) {
        await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Documents,
        });
        setIsSavedSuccess(true);
        setTimeout(() => setIsSavedSuccess(false), 2500);
      } else {
        const link = document.createElement("a");
        link.href = generatedImage;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsSavedSuccess(true);
        setTimeout(() => setIsSavedSuccess(false), 2500);
      }
    } catch (error) {
      console.error("Save to Gallery failed:", error);
    }
  };

  const primaryShareBtnClass = darkMode
    ? normalizedDiff === "EASY"
      ? "bg-[#065f46] hover:bg-[#047857] text-[#ecfdf5]"
      : normalizedDiff === "MEDIUM"
      ? "bg-[#78350f] hover:bg-[#92400e] text-[#fffbeb]"
      : normalizedDiff === "HARD"
      ? "bg-[#581c87] hover:bg-[#6b21a8] text-[#faf5ff]"
      : "bg-[#881337] hover:bg-[#9f1239] text-[#fff1f2]"
    : normalizedDiff === "EASY"
    ? "bg-[#A7F3D0] hover:bg-[#6EE7B7] text-[#064E3B]"
    : normalizedDiff === "MEDIUM"
    ? "bg-[#FDE68A] hover:bg-[#FCD34D] text-[#78350F]"
    : normalizedDiff === "HARD"
    ? "bg-[#E9D5FF] hover:bg-[#D8B4FE] text-[#4C1D95]"
    : "bg-[#FECDD3] hover:bg-[#FDA4AF] text-[#881337]";

  const isActionDisabled = isGenerating || !generatedImage;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="fixed inset-0 z-[10050] bg-black/55 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {/* Backdrop click dismisser */}
          <div
            className="absolute inset-0 cursor-pointer"
            onClick={() => {
              if (playClickSound) playClickSound();
              onClose();
            }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={`relative w-[392px] max-w-[95vw] max-h-[92vh] rounded-[32px] p-4 sm:p-5 flex flex-col items-center gap-3.5 border-none shadow-[0_20px_50px_rgba(0,0,0,0.16)] overflow-y-auto custom-scrollbar z-10 ${
              darkMode
                ? "bg-[#18181c] text-stone-100"
                : "bg-[#FDFBF7] text-stone-900"
            }`}
          >
            {/* Top Header Strip */}
            <div className="w-[360px] max-w-full mx-auto flex items-center justify-between select-none shrink-0">
              <span
                className={`text-xs sm:text-sm font-sans font-black uppercase tracking-wider ${
                  darkMode ? "text-stone-200" : "text-stone-800"
                }`}
              >
                {i18n.modal.title}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (playClickSound) playClickSound();
                  onClose();
                }}
                className={`p-1.5 rounded-full border-none cursor-pointer transition-all hover:scale-110 active:scale-95 ${
                  darkMode
                    ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                    : "bg-stone-100 hover:bg-stone-200 text-stone-600"
                }`}
                title="Close"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* PURE CANVAS PREVIEW IMAGE */}
            <div className="w-[360px] max-w-[360px] mx-auto flex items-center justify-center shrink-0">
              {generatedImage ? (
                <img
                  src={generatedImage}
                  alt="Share Preview"
                  className="w-[360px] mx-auto rounded-2xl shadow-lg select-none"
                />
              ) : (
                <div
                  className={`w-[360px] h-[512px] mx-auto rounded-2xl flex flex-col items-center justify-center gap-3 ${
                    darkMode ? "bg-zinc-800/60" : "bg-stone-100"
                  }`}
                >
                  <Loader2 className="w-8 h-8 animate-spin opacity-60" />
                  <span className="text-xs font-sans font-bold tracking-wide opacity-70">
                    {i18n.modal.generating}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons: Locked to fixed 360px container, disabled while generating */}
            <div className="w-[360px] max-w-[360px] mx-auto flex flex-col gap-2.5 pt-0.5 shrink-0">
              {clipboardToast && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className={`w-full py-2 px-3 rounded-xl text-[11px] font-sans font-bold text-center flex items-center justify-center gap-1.5 border-none shadow-[0_4px_12px_rgba(0,0,0,0.06)] ${
                    darkMode
                      ? "bg-[#064E3B] text-[#6EE7B7]"
                      : "bg-[#ECFDF5] text-[#047857]"
                  }`}
                >
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>{clipboardToast}</span>
                </motion.div>
              )}
              <button
                type="button"
                disabled={isActionDisabled}
                onClick={handleShareScreenshot}
                className={`w-full py-3.5 px-4 rounded-2xl font-sans font-black text-xs sm:text-sm tracking-wide flex items-center justify-center border-none transition-all shadow-[0_4px_14px_rgba(0,0,0,0.04)] ${
                  isActionDisabled
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer active:scale-95"
                } ${primaryShareBtnClass}`}
              >
                <Share2 className="w-5 h-5 mr-2 shrink-0" />
                <span>
                  {isGenerating ? i18n.modal.generating : i18n.modal.btn_share}
                </span>
                {isGenerating && (
                  <Loader2 className="animate-spin w-4 h-4 ml-2 inline shrink-0" />
                )}
              </button>

              <button
                type="button"
                disabled={isActionDisabled}
                onClick={handleSaveToGallery}
                className={`w-full py-3.5 px-4 rounded-2xl font-sans font-black text-xs sm:text-sm tracking-wide flex items-center justify-center border-none transition-all shadow-[0_4px_14px_rgba(0,0,0,0.04)] ${
                  isActionDisabled
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer active:scale-95"
                } ${
                  darkMode
                    ? "bg-zinc-800 hover:bg-zinc-700 text-stone-200"
                    : "bg-stone-100 hover:bg-stone-200 text-stone-800"
                }`}
              >
                {isSavedSuccess ? (
                  <>
                    <Check className="w-5 h-5 mr-2 shrink-0 text-emerald-500" />
                    <span>{i18n.modal.btn_save}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2 shrink-0" />
                    <span>{i18n.modal.btn_save}</span>
                    {isGenerating && (
                      <Loader2 className="animate-spin w-4 h-4 ml-2 inline shrink-0" />
                    )}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
};

export default SharePreviewModal;
