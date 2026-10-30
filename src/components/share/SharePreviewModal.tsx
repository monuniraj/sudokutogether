import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import html2canvas from "html2canvas";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { X, Loader2, Share2, Download, Check } from "lucide-react";
import { SudokuBoardState, Difficulty } from "../game/SudokuBoard";
import {
  ShareCard,
  ShareDifficulty,
  buildFreshChallengeUrl,
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
  isWon?: boolean;
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

/**
 * Converts modern CSS color functions (e.g. Tailwind v4 oklch/oklab/color)
 * into standard rgb/rgba strings inside the cloned html2canvas document so
 * html2canvas never throws "Attempting to parse an unsupported color function".
 */
const sanitizeClonedColorsForHtml2Canvas = (
  clonedDoc: Document,
  clonedRoot: HTMLElement
) => {
  try {
    const cvs = clonedDoc.createElement("canvas");
    cvs.width = 1;
    cvs.height = 1;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;

    const toRgb = (cssColor: string): string => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = "rgba(0,0,0,0)";
      ctx.fillStyle = cssColor;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
      if (a === 0) return "rgba(0, 0, 0, 0)";
      if (a === 255) return `rgb(${r}, ${g}, ${b})`;
      return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
    };

    const colorFnRegex = /(?:oklch|oklab|lch|lab|color-mix|color)\([^)]+\)/gi;
    const propsToSanitize = [
      "color",
      "background-color",
      "border-top-color",
      "border-right-color",
      "border-bottom-color",
      "border-left-color",
      "outline-color",
      "text-decoration-color",
      "box-shadow",
      "background-image",
    ];

    const view = clonedDoc.defaultView || window;
    const nodes: Element[] = [
      clonedDoc.documentElement,
      clonedDoc.body,
      clonedRoot,
      ...Array.from(clonedRoot.querySelectorAll("*")),
    ];

    for (const node of nodes) {
      if (!(node instanceof HTMLElement) && !(node instanceof SVGElement)) {
        continue;
      }
      const computed = view.getComputedStyle(node);
      for (const prop of propsToSanitize) {
        const val = computed.getPropertyValue(prop);
        if (val && colorFnRegex.test(val)) {
          colorFnRegex.lastIndex = 0;
          const sanitized = val.replace(colorFnRegex, (match) => toRgb(match));
          node.style.setProperty(prop, sanitized, "important");
        }
      }
    }
  } catch (err) {
    console.error("[SharePreviewModal] Color sanitization warning:", err);
  }
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
  isWon,
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

  const mistakes = boardState?.currentMistakesCount ?? 0;
  const maxMistakes = boardState?.maxMistakesLimit ?? 3;
  const didWin =
    isWon !== undefined
      ? Boolean(isWon)
      : maxMistakes === 0
      ? mistakes === 0
      : mistakes < maxMistakes;

  const { fullUrl, displayUrl, extractedRoomCode } = buildFreshChallengeUrl(
    boardState,
    normalizedDiff,
    roomCode
  );

  const ctaCopy = didWin
    ? "Can you beat my time?"
    : "Stuck! Can you help me finish this?";

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
          throw new Error("Visible ShareCard container ref is null");
        }

        const canvas = await html2canvas(targetEl, {
          width: 360,
          windowWidth: 360,
          scale: 2,
          useCORS: true,
          backgroundColor: null,
          onclone: (clonedDoc, clonedEl) => {
            const clonedTarget = clonedDoc.getElementById(
              "share-card-capture-target"
            );
            if (clonedTarget) {
              clonedTarget.style.width = "360px";
              clonedTarget.style.height = "auto";
            }

            // Enforce strict baseline centering on all cloned digits to prevent cross-OS font shifts
            const digitNodes = clonedEl.querySelectorAll(
              ".sudoku-digit-text, .handwriting"
            );
            digitNodes.forEach((el) => {
              if (el instanceof HTMLElement) {
                el.style.setProperty("display", "flex", "important");
                el.style.setProperty("align-items", "center", "important");
                el.style.setProperty("justify-content", "center", "important");
                el.style.setProperty("line-height", "1", "important");
                el.style.setProperty("transform", "translateY(0)", "important");
                el.style.setProperty("margin", "0", "important");
                el.style.setProperty("padding", "0", "important");
              }
            });

            sanitizeClonedColorsForHtml2Canvas(clonedDoc, clonedEl);
          },
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
    }, 350);

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
    didWin,
    darkMode,
    roomCode,
  ]);

  const handleShareScreenshot = async () => {
    if (playClickSound) playClickSound();
    if (isGenerating || !generatedImage) return;

    const shareText = `${time} (${normalizedDiff}) — ${ctaCopy}\nsudokusync.com | Room Code: ${extractedRoomCode}\n${fullUrl}`;

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
          dialogTitle: "Share this Screenshot",
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
    if (isGenerating || !generatedImage) return;

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

            {/* VISIBLE DOM RENDER & CAPTURE: Fixed mobile aspect ratio container (w-[360px] max-w-[360px] mx-auto) */}
            <div className="w-[360px] max-w-[360px] mx-auto flex items-center justify-center shrink-0">
              <ShareCard
                ref={offscreenCaptureRef}
                boardState={boardState}
                solutionGrid={solutionGrid}
                difficulty={normalizedDiff}
                time={time}
                sessionSeconds={sessionSeconds}
                playerName={playerName}
                tagline={tagline}
                bestTime={bestTime}
                isNewRecord={isNewRecord && didWin}
                isWon={didWin}
                darkMode={darkMode}
                roomCode={roomCode}
                challengeUrl={displayUrl}
              />
            </div>

            {/* Action Buttons: Locked to fixed 360px container, disabled while generating */}
            <div className="w-[360px] max-w-[360px] mx-auto flex flex-col gap-2.5 pt-0.5 shrink-0">
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
                  {isGenerating ? "Generating..." : "Share this Screenshot"}
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
                    <span>Save to Gallery</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2 shrink-0" />
                    <span>Save to Gallery</span>
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
