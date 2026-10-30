import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { Loader2 } from "lucide-react";
import { ShareIcon } from "./ShareIcon";
import {
  ShareCard,
  ShareDifficulty,
  buildFreshChallengeUrl,
} from "./ShareCard";
import { SudokuBoardState } from "../game/SudokuBoard";

export interface ShareActionWrapperProps {
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
  className?: string;
}

export const ShareActionWrapper: React.FC<ShareActionWrapperProps> = ({
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
  className = "",
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [liveBoardDataUrl, setLiveBoardDataUrl] = useState<string | null>(null);

  const { fullUrl, displayUrl } = buildFreshChallengeUrl(
    boardState,
    String(difficulty || "EASY"),
    roomCode
  );

  const finalTagline =
    tagline ||
    `मैंने इसे ${time} में सॉल्व किया! एक क्लिक में अपना रिकॉर्ड बनाने जाओ 👇`;

  const handleShare = async () => {
    if (playClickSound) {
      playClickSound();
    }
    if (isCapturing || !cardRef.current) return;

    setIsCapturing(true);
    try {
      // 1. Capture the authentic live DOM board (#live-sudoku-board) if mounted in the viewport
      const liveBoardEl = document.getElementById("live-sudoku-board");
      if (liveBoardEl) {
        try {
          const boardCanvas = await html2canvas(liveBoardEl, {
            scale: 2,
            useCORS: true,
            backgroundColor: null,
          });
          const boardUrl = boardCanvas.toDataURL("image/png");
          setLiveBoardDataUrl(boardUrl);
          // Allow React a micro-frame to paint the captured live board image inside ShareCard
          await new Promise((resolve) => setTimeout(resolve, 40));
        } catch {
          // If live element capture fails, ShareCard's mounted <SudokuBoard /> already provides 100% authentic rendering
        }
      }

      // 2. Capture the complete Apple-grade ShareCard widget
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });

      const shareText = `${finalTagline}\n${fullUrl}`;

      if (Capacitor.isNativePlatform()) {
        const dataUrl = canvas.toDataURL("image/png");
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");

        const savedFile = await Filesystem.writeFile({
          path: "share_result.png",
          data: base64Data,
          directory: Directory.Cache,
        });

        await Share.share({
          title: "Sudoku Sync",
          text: shareText,
          url: savedFile.uri,
          dialogTitle: "Share your Sudoku Triumph!",
        });
      } else {
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob((b) => resolve(b), "image/png")
        );

        if (!blob) {
          throw new Error("Failed to generate share image blob");
        }

        const file = new File([blob], "sudoku-sync-result.png", {
          type: "image/png",
        });

        if (
          typeof navigator !== "undefined" &&
          navigator.share &&
          (!navigator.canShare || navigator.canShare({ files: [file] }))
        ) {
          await navigator.share({
            title: "Sudoku Sync",
            text: shareText,
            files: [file],
          });
        } else {
          // Desktop browser fallback: download the Apple-grade PNG widget
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = "sudoku-sync-result.png";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        console.warn("[ShareActionWrapper] Share notice:", err);
      }
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <>
      {isCapturing ? (
        <button
          type="button"
          disabled
          aria-label="Preparing Share Card"
          className={`relative p-1.5 rounded-full border-none cursor-wait select-none flex items-center justify-center transition-colors ${
            darkMode
              ? "bg-amber-400/15 text-amber-300"
              : "bg-amber-100/90 text-amber-800"
          } ${className}`}
        >
          <Loader2 className="w-4 h-4 animate-spin" />
        </button>
      ) : (
        <ShareIcon
          onClick={handleShare}
          darkMode={darkMode}
          className={className}
        />
      )}

      {/* Off-screen Apple-grade ShareCard containing authentic <SudokuBoard /> + dynamic sticker + challenge link */}
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
    </>
  );
};

export default ShareActionWrapper;
