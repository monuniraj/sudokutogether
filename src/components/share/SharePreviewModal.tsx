import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import html2canvas from "html2canvas";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import {
  X,
  Loader2,
  Share2,
  Download,
  Image as ImageIcon,
  Check,
  Trophy,
  Sparkles,
  Clock,
  Award,
  ShieldCheck,
  ExternalLink,
  Flame,
  Target,
} from "lucide-react";
import { SudokuBoard, Difficulty, SudokuBoardState } from "../game/SudokuBoard";
import {
  ShareDifficulty,
  buildFreshChallengeUrl,
  evaluatePerformanceSticker,
} from "./ShareCard";

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
  darkMode?: boolean;
  roomCode?: string;
  playClickSound?: () => void;
}

interface GeneratedImagePayload {
  dataUrl: string;
  base64Data: string;
  blob: Blob | null;
  file: File | null;
  nativeUri?: string;
}

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

export const SharePreviewModal: React.FC<SharePreviewModalProps> = ({
  isOpen,
  onClose,
  boardState,
  solutionGrid = [],
  difficulty,
  time,
  sessionSeconds,
  playerName,
  tagline,
  bestTime,
  isNewRecord = false,
  darkMode = false,
  roomCode,
  playClickSound,
}) => {
  const offscreenCaptureRef = useRef<HTMLDivElement | null>(null);
  const [generatedImage, setGeneratedImage] =
    useState<GeneratedImagePayload | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const [isSavedSuccess, setIsSavedSuccess] = useState<boolean>(false);

  const normalizedDiff = String(
    difficulty || boardState?.difficulty || "EASY"
  ).toUpperCase() as Difficulty;

  const { fullUrl, displayUrl } = buildFreshChallengeUrl(
    boardState,
    normalizedDiff,
    roomCode
  );

  const finalTagline =
    tagline ||
    `मैंने इसे ${time} में सॉल्व किया! एक क्लिक में अपना रिकॉर्ड बनाने जाओ`;

  const mistakes = boardState?.currentMistakesCount ?? 0;
  const effectiveSeconds =
    typeof sessionSeconds === "number" && sessionSeconds > 0
      ? sessionSeconds
      : parseFormattedTimeToSeconds(time);

  const stickerBadge = evaluatePerformanceSticker(
    normalizedDiff,
    effectiveSeconds
  );

  useEffect(() => {
    if (!isOpen) {
      setGeneratedImage(null);
      setIsGenerating(true);
      setIsSavedSuccess(false);
      return;
    }

    let isCancelled = false;
    setIsGenerating(true);
    setGeneratedImage(null);

    const timer = setTimeout(async () => {
      try {
        const targetEl = offscreenCaptureRef.current;
        if (!targetEl) {
          throw new Error("Off-screen capture container ref is null");
        }

        const canvas = await html2canvas(targetEl, {
          scale: 2,
          useCORS: true,
          backgroundColor: null,
        });

        if (isCancelled) return;

        const dataUrl = canvas.toDataURL("image/png");
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");

        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob((b) => resolve(b), "image/png")
        );

        const file = blob
          ? new File([blob], "sudoku-sync-result.png", { type: "image/png" })
          : null;

        let nativeUri: string | undefined;
        if (Capacitor.isNativePlatform()) {
          try {
            const savedFile = await Filesystem.writeFile({
              path: "share_result.png",
              data: base64Data,
              directory: Directory.Cache,
            });
            nativeUri = savedFile.uri;
          } catch (fsErr) {
            console.error(
              "[SharePreviewModal] Capacitor Filesystem cache write error:",
              fsErr
            );
          }
        }

        if (!isCancelled) {
          setGeneratedImage({
            dataUrl,
            base64Data,
            blob,
            file,
            nativeUri,
          });
        }
      } catch (error) {
        console.error("Capture failed:", error);
      } finally {
        if (!isCancelled) {
          setIsGenerating(false);
        }
      }
    }, 300);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [
    isOpen,
    boardState,
    difficulty,
    time,
    sessionSeconds,
    playerName,
    bestTime,
    isNewRecord,
    darkMode,
    roomCode,
  ]);

  const handleShareScreenshot = async () => {
    if (playClickSound) playClickSound();
    if (!generatedImage) return;

    const shareText = `${finalTagline}\n${fullUrl}`;

    try {
      if (Capacitor.isNativePlatform()) {
        let uriToShare = generatedImage.nativeUri;
        if (!uriToShare) {
          const savedFile = await Filesystem.writeFile({
            path: "share_result.png",
            data: generatedImage.base64Data,
            directory: Directory.Cache,
          });
          uriToShare = savedFile.uri;
        }

        await Share.share({
          title: "Sudoku Sync",
          text: shareText,
          url: uriToShare,
          dialogTitle: "SHARE SCREENSHOT",
        });
      } else {
        const { file, dataUrl } = generatedImage;
        if (
          typeof navigator !== "undefined" &&
          navigator.share &&
          file &&
          (!navigator.canShare || navigator.canShare({ files: [file] }))
        ) {
          await navigator.share({
            title: "Sudoku Sync",
            text: shareText,
            files: [file],
          });
        } else if (typeof navigator !== "undefined" && navigator.share) {
          await navigator.share({
            title: "Sudoku Sync",
            text: shareText,
            url: fullUrl,
          });
        } else {
          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = `sudoku-sync-${normalizedDiff.toLowerCase()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  const handleSaveToGallery = async () => {
    if (playClickSound) playClickSound();
    if (!generatedImage) return;

    const fileName = `sudoku-sync-${normalizedDiff.toLowerCase()}-${Date.now()}.png`;

    try {
      if (Capacitor.isNativePlatform()) {
        await Filesystem.writeFile({
          path: fileName,
          data: generatedImage.base64Data,
          directory: Directory.Documents,
        });
        setIsSavedSuccess(true);
        setTimeout(() => setIsSavedSuccess(false), 2500);
      } else {
        const url = generatedImage.blob
          ? URL.createObjectURL(generatedImage.blob)
          : generatedImage.dataUrl;
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        if (generatedImage.blob) {
          setTimeout(() => URL.revokeObjectURL(url), 1500);
        }
        setIsSavedSuccess(true);
        setTimeout(() => setIsSavedSuccess(false), 2500);
      }
    } catch (error) {
      console.error("Save to Gallery failed:", error);
    }
  };

  // Difficulty-matched pastel theme tokens
  const cardBgGradient = darkMode
    ? normalizedDiff === "EASY"
      ? "linear-gradient(155deg, #052e24 0%, #121615 58%, #064e3b 100%)"
      : normalizedDiff === "MEDIUM"
      ? "linear-gradient(155deg, #2e1c05 0%, #161412 58%, #451a03 100%)"
      : normalizedDiff === "HARD"
      ? "linear-gradient(155deg, #241042 0%, #141218 58%, #3b0764 100%)"
      : "linear-gradient(155deg, #3b0819 0%, #181214 58%, #4c0519 100%)"
    : normalizedDiff === "EASY"
    ? "linear-gradient(155deg, #ECFDF5 0%, #FDFBF7 52%, #D1FAE5 100%)"
    : normalizedDiff === "MEDIUM"
    ? "linear-gradient(155deg, #FFFBEB 0%, #FDFBF7 52%, #FEF3C7 100%)"
    : normalizedDiff === "HARD"
    ? "linear-gradient(155deg, #FAF5FF 0%, #FDFBF7 52%, #F3E8FF 100%)"
    : "linear-gradient(155deg, #FFF1F2 0%, #FDFBF7 52%, #FFE4E6 100%)";

  const pillBg = darkMode
    ? normalizedDiff === "EASY"
      ? "rgba(16, 185, 129, 0.22)"
      : normalizedDiff === "MEDIUM"
      ? "rgba(245, 158, 11, 0.22)"
      : normalizedDiff === "HARD"
      ? "rgba(168, 85, 247, 0.22)"
      : "rgba(244, 63, 94, 0.22)"
    : normalizedDiff === "EASY"
    ? "#D1FAE5"
    : normalizedDiff === "MEDIUM"
    ? "#FEF3C7"
    : normalizedDiff === "HARD"
    ? "#F3E8FF"
    : "#FFE4E6";

  const pillText = darkMode
    ? normalizedDiff === "EASY"
      ? "#6EE7B7"
      : normalizedDiff === "MEDIUM"
      ? "#FCD34D"
      : normalizedDiff === "HARD"
      ? "#D8B4FE"
      : "#FDA4AF"
    : normalizedDiff === "EASY"
    ? "#065F46"
    : normalizedDiff === "MEDIUM"
    ? "#92400E"
    : normalizedDiff === "HARD"
    ? "#6B21A8"
    : "#9D174D";

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

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="fixed inset-0 z-[10050] bg-black/55 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
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
            initial={{ opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className={`relative w-full max-w-md rounded-[32px] p-5 sm:p-6 flex flex-col items-center gap-4 border-none shadow-[0_20px_50px_rgba(0,0,0,0.16)] overflow-hidden z-10 ${
              darkMode
                ? "bg-[#18181c] text-stone-100"
                : "bg-[#FDFBF7] text-stone-900"
            }`}
          >
            {/* Top Header Strip */}
            <div className="w-full flex items-center justify-between select-none">
              <span
                className={`text-xs sm:text-sm font-sans font-black uppercase tracking-wider ${
                  darkMode ? "text-stone-200" : "text-stone-800"
                }`}
              >
                SHARE SCREENSHOT
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

            {/* Center Preview Area: Loading vs Generated Screenshot vs Error */}
            <div className="w-full flex items-center justify-center min-h-[340px] max-h-[62vh] overflow-y-auto custom-scrollbar rounded-3xl">
              {isGenerating ? (
                <div
                  className={`w-full aspect-[4/5] rounded-3xl flex flex-col items-center justify-center gap-3 p-6 select-none animate-pulse ${
                    darkMode ? "bg-zinc-900/80" : "bg-stone-100/90"
                  }`}
                >
                  <Loader2
                    className={`w-8 h-8 animate-spin ${
                      darkMode ? "text-amber-300" : "text-amber-600"
                    }`}
                  />
                  <span
                    className={`text-xs sm:text-sm font-sans font-bold tracking-wide ${
                      darkMode ? "text-stone-300" : "text-stone-600"
                    }`}
                  >
                    Generating Screenshot...
                  </span>
                </div>
              ) : generatedImage ? (
                <motion.img
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  src={generatedImage.dataUrl}
                  alt="Sudoku Sync Screenshot"
                  className="w-full max-w-[330px] h-auto object-contain rounded-[26px] shadow-[0_8px_28px_rgba(0,0,0,0.08)] select-none"
                />
              ) : (
                <div className="text-red-400 flex flex-col items-center">
                  <ImageIcon className="w-10 h-10 mb-2" />
                  <span>Failed to generate screenshot</span>
                </div>
              )}
            </div>

            {/* Action Buttons: Share this Screenshot & Save to Gallery */}
            <div className="w-full flex flex-col gap-2.5 pt-1">
              <button
                type="button"
                disabled={isGenerating || !generatedImage}
                onClick={handleShareScreenshot}
                className={`w-full py-3.5 px-4 rounded-2xl font-sans font-black text-xs sm:text-sm tracking-wide flex items-center justify-center border-none transition-all active:scale-95 shadow-[0_4px_14px_rgba(0,0,0,0.04)] ${
                  isGenerating || !generatedImage
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                } ${primaryShareBtnClass}`}
              >
                <Share2 className="w-5 h-5 mr-2 shrink-0" />
                <span>Share this Screenshot</span>
              </button>

              <button
                type="button"
                disabled={isGenerating || !generatedImage}
                onClick={handleSaveToGallery}
                className={`w-full py-3.5 px-4 rounded-2xl font-sans font-black text-xs sm:text-sm tracking-wide flex items-center justify-center border-none transition-all active:scale-95 shadow-[0_4px_14px_rgba(0,0,0,0.04)] ${
                  isGenerating || !generatedImage
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                } ${
                  darkMode
                    ? "bg-zinc-800 hover:bg-zinc-700 text-stone-200"
                    : "bg-stone-100 hover:bg-stone-200 text-stone-800"
                }`}
              >
                {isSavedSuccess ? (
                  <>
                    <Check className="w-5 h-5 mr-2 shrink-0 text-emerald-500" />
                    <span>Saved to Gallery</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2 shrink-0" />
                    <span>Save to Gallery</span>
                  </>
                )}
              </button>
            </div>

            {/* PIXEL-PERFECT OFF-SCREEN CAPTURE CONTAINER (Real <SudokuBoard /> with exact boardState) */}
            <div
              ref={offscreenCaptureRef}
              className="absolute top-[-9999px] left-[-9999px] w-[360px] max-w-[360px] pointer-events-none select-none overflow-hidden"
              style={{
                background: cardBgGradient,
                borderRadius: "28px",
                padding: "20px",
                color: darkMode ? "#F5F5F4" : "#1C1917",
                boxSizing: "border-box",
              }}
            >
              <div className="flex flex-col gap-3.5 w-full">
                {/* Brand & Difficulty Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      style={{
                        width: "34px",
                        height: "34px",
                        borderRadius: "10px",
                        backgroundColor: "#121212",
                      }}
                      className="flex items-center justify-center overflow-hidden shrink-0"
                    >
                      <img
                        src="/logo.png"
                        alt="Sudoku Sync"
                        crossOrigin="anonymous"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col leading-tight">
                      <span className="text-xs font-black uppercase tracking-wider">
                        Sudoku Sync
                      </span>
                      <span
                        className="text-[10px] font-bold"
                        style={{ color: darkMode ? "#A8A29E" : "#78716C" }}
                      >
                        {playerName}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      backgroundColor: pillBg,
                      color: pillText,
                      padding: "4px 10px",
                      borderRadius: "9999px",
                      fontSize: "10px",
                      fontWeight: 900,
                    }}
                    className="uppercase flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{normalizedDiff}</span>
                  </div>
                </div>

                {/* Solve Time & Record Strip */}
                <div
                  style={{
                    backgroundColor: darkMode
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(255, 255, 255, 0.86)",
                    borderRadius: "18px",
                    padding: "10px 14px",
                  }}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex flex-col">
                    <span
                      className="text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-1"
                      style={{ color: darkMode ? "#A8A29E" : "#78716C" }}
                    >
                      <Clock className="w-3 h-3" />
                      <span>SOLVE TIME</span>
                    </span>
                    <span className="text-2xl font-mono font-black leading-tight">
                      {time}
                    </span>
                  </div>

                  <div
                    style={{
                      backgroundColor: pillBg,
                      color: pillText,
                      borderRadius: "12px",
                      padding: "6px 10px",
                    }}
                    className="flex flex-col items-end justify-center shrink-0"
                  >
                    <div className="flex items-center gap-1">
                      {isNewRecord ? (
                        <Trophy className="w-3.5 h-3.5" />
                      ) : mistakes === 0 ? (
                        <ShieldCheck className="w-3.5 h-3.5" />
                      ) : (
                        <Award className="w-3.5 h-3.5" />
                      )}
                      <span className="text-[9px] font-black uppercase tracking-wider">
                        {isNewRecord
                          ? "NEW BEST TIME!"
                          : bestTime
                          ? `BEST ${bestTime}`
                          : mistakes === 0
                          ? "FLAWLESS WIN"
                          : "COMPLETED"}
                      </span>
                    </div>
                    <span className="text-[9.5px] font-bold opacity-85 mt-0.5">
                      {mistakes === 0
                        ? "0 Mistakes • 100% Clean"
                        : `${mistakes} Mistake${mistakes === 1 ? "" : "s"}`}
                    </span>
                  </div>
                </div>

                {/* Authentic Off-Screen <SudokuBoard /> + Dynamic Rotated Sticker */}
                <div className="relative w-full aspect-square flex items-center justify-center">
                  <SudokuBoard
                    id="offscreen-authentic-sudoku-board"
                    boardState={boardState}
                    difficulty={normalizedDiff}
                    solutionGrid={solutionGrid}
                    isTimerPaused={false}
                    onResumeSession={() => {}}
                    visualizingBacktrack={false}
                    highlightAreas={true}
                    highlightIdentical={true}
                    isNumberFirstInputMode={false}
                    lockedNum={null}
                    activeKeypadNum={null}
                    darkMode={darkMode}
                    playClickSound={() => {}}
                    onCellClick={() => {}}
                  />

                  <div
                    style={{
                      position: "absolute",
                      top: "-10px",
                      right: "-6px",
                      transform: "rotate(-2deg)",
                      backgroundColor: pillBg,
                      color: pillText,
                      boxShadow: darkMode
                        ? "0 8px 20px rgba(0,0,0,0.5)"
                        : "0 8px 20px rgba(0,0,0,0.12)",
                      padding: "5px 12px",
                      borderRadius: "9999px",
                      fontSize: "10px",
                      fontWeight: 900,
                      zIndex: 20,
                    }}
                    className="flex items-center gap-1 uppercase"
                  >
                    {stickerBadge.tier === "excellent" ? (
                      <Flame className="w-3 h-3" />
                    ) : stickerBadge.tier === "great" ? (
                      <Sparkles className="w-3 h-3" />
                    ) : (
                      <Target className="w-3 h-3" />
                    )}
                    <span>{stickerBadge.label}</span>
                  </div>
                </div>

                {/* Tagline & Unsolved Challenge Link */}
                <div
                  style={{
                    backgroundColor: darkMode
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(255, 255, 255, 0.88)",
                    borderRadius: "18px",
                    padding: "10px 12px",
                  }}
                  className="flex flex-col items-center gap-1.5 text-center"
                >
                  <p className="text-[11.5px] font-extrabold leading-snug m-0">
                    {finalTagline}
                  </p>
                  <div
                    style={{
                      backgroundColor: pillBg,
                      color: pillText,
                      borderRadius: "10px",
                      padding: "5px 10px",
                      fontSize: "9.5px",
                      fontWeight: 800,
                    }}
                    className="w-full font-mono flex items-center justify-center gap-1.5 truncate"
                  >
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    <span className="truncate">{displayUrl}</span>
                  </div>
                </div>
              </div>
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
