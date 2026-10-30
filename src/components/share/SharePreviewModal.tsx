import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import html2canvas from "html2canvas";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { X, Loader2, Share2, Download, Check } from "lucide-react";
import {
  ShareCard,
  ShareDifficulty,
  buildFreshChallengeUrl,
} from "./ShareCard";
import { SudokuBoardState } from "../game/SudokuBoard";

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

export const SharePreviewModal: React.FC<SharePreviewModalProps> = ({
  isOpen,
  onClose,
  boardState,
  solutionGrid,
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
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [generatedImage, setGeneratedImage] =
    useState<GeneratedImagePayload | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const [liveBoardDataUrl, setLiveBoardDataUrl] = useState<string | null>(null);
  const [isSavedSuccess, setIsSavedSuccess] = useState<boolean>(false);

  const normalizedDiff = String(
    difficulty || boardState?.difficulty || "EASY"
  ).toUpperCase();

  const { fullUrl, displayUrl } = buildFreshChallengeUrl(
    boardState,
    normalizedDiff,
    roomCode
  );

  const finalTagline =
    tagline ||
    `मैंने इसे ${time} में सॉल्व किया! एक क्लिक में अपना रिकॉर्ड बनाने जाओ 👇`;

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
        // 1. Capture live #live-sudoku-board if present in DOM
        const liveBoardEl = document.getElementById("live-sudoku-board");
        if (liveBoardEl) {
          try {
            const boardCanvas = await html2canvas(liveBoardEl, {
              scale: 2,
              useCORS: true,
              backgroundColor: null,
            });
            if (!isCancelled) {
              setLiveBoardDataUrl(boardCanvas.toDataURL("image/png"));
              await new Promise((resolve) => setTimeout(resolve, 50));
            }
          } catch (liveErr) {
            console.error(
              "[SharePreviewModal] Live board capture fallback to ShareCard <SudokuBoard />:",
              liveErr
            );
          }
        }

        if (isCancelled) return;

        // 2. Capture full ShareCard (or fallback to #live-sudoku-board)
        const targetElement =
          cardRef.current || document.getElementById("live-sudoku-board");
        if (!targetElement) {
          throw new Error("ShareCard target DOM element not found");
        }

        const canvas = await html2canvas(targetElement, {
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
      } catch (err) {
        console.error("[SharePreviewModal] Image generation error:", err);
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

  const handleShareWithFriends = async () => {
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
          dialogTitle: "Share your Sudoku Triumph!",
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
          // Fallback to download if Web Share API is unavailable on desktop browser
          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = `sudoku-sync-${normalizedDiff.toLowerCase()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    } catch (err: any) {
      console.error("[SharePreviewModal] Share with Friends error:", err);
    }
  };

  const handleSaveToDevice = async () => {
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
    } catch (err: any) {
      console.error("[SharePreviewModal] Save to Device error:", err);
    }
  };

  // Difficulty-matched pastel button tokens
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
                Share Your Triumph
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

            {/* Center Preview Area: Loading Skeleton vs Generated Image */}
            <div className="w-full flex items-center justify-center min-h-[340px] max-h-[62vh] overflow-y-auto custom-scrollbar rounded-3xl">
              {isGenerating || !generatedImage ? (
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
                    Generating your Triumph...
                  </span>
                </div>
              ) : (
                <motion.img
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  src={generatedImage.dataUrl}
                  alt="Sudoku Sync Triumph Card"
                  className="w-full max-w-[330px] h-auto object-contain rounded-[26px] shadow-[0_8px_28px_rgba(0,0,0,0.08)] select-none"
                />
              )}
            </div>

            {/* Action Buttons: Share with Friends & Save to Device */}
            <div className="w-full flex flex-col sm:flex-row gap-2.5 pt-1">
              <button
                type="button"
                disabled={isGenerating || !generatedImage}
                onClick={handleShareWithFriends}
                className={`flex-1 py-3.5 px-4 rounded-2xl font-sans font-black text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 border-none transition-all active:scale-95 shadow-[0_4px_14px_rgba(0,0,0,0.04)] ${
                  isGenerating || !generatedImage
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                } ${primaryShareBtnClass}`}
              >
                <Share2 className="w-4 h-4 shrink-0 stroke-[2.4]" />
                <span>📲 Share with Friends</span>
              </button>

              <button
                type="button"
                disabled={isGenerating || !generatedImage}
                onClick={handleSaveToDevice}
                className={`flex-1 py-3.5 px-4 rounded-2xl font-sans font-black text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 border-none transition-all active:scale-95 shadow-[0_4px_14px_rgba(0,0,0,0.04)] ${
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
                    <Check className="w-4 h-4 shrink-0 text-emerald-500 stroke-[2.6]" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 shrink-0 stroke-[2.4]" />
                    <span>💾 Save to Device</span>
                  </>
                )}
              </button>
            </div>

            {/* Hidden Offscreen ShareCard rendered when modal is open for html2canvas capture */}
            <ShareCard
              ref={cardRef}
              boardState={boardState}
              solutionGrid={solutionGrid}
              difficulty={difficulty}
              time={time}
              sessionSeconds={sessionSeconds}
              playerName={playerName}
              tagline={finalTagline}
              bestTime={bestTime}
              isNewRecord={isNewRecord}
              darkMode={darkMode}
              hiddenOffscreen={true}
              roomCode={roomCode}
              challengeUrl={displayUrl}
              liveBoardDataUrl={liveBoardDataUrl}
            />
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
