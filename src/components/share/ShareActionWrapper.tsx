import React, { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
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
  const [preloadedImage, setPreloadedImage] = useState<any>(null);
  const [isPreparing, setIsPreparing] = useState<boolean>(true);
  const [liveBoardDataUrl, setLiveBoardDataUrl] = useState<string | null>(null);

  const { fullUrl, displayUrl } = buildFreshChallengeUrl(
    boardState,
    String(difficulty || "EASY"),
    roomCode
  );

  const finalTagline =
    tagline ||
    `मैंने इसे ${time} में सॉल्व किया! एक क्लिक में अपना रिकॉर्ड बनाने जाओ 👇`;

  // Background pre-generation on mount to eliminate Web Share API transient activation timeouts
  useEffect(() => {
    let isCancelled = false;
    setIsPreparing(true);

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
              "[ShareActionWrapper] Live board capture fallback to ShareCard <SudokuBoard />:",
              liveErr
            );
          }
        }

        if (isCancelled) return;

        // 2. Capture the full ShareCard widget (or fallback directly to #live-sudoku-board)
        const targetElement =
          cardRef.current || document.getElementById("live-sudoku-board");
        if (!targetElement) {
          throw new Error("Share target DOM element not found");
        }

        const canvas = await html2canvas(targetElement, {
          scale: 2,
          useCORS: true,
          backgroundColor: null,
        });

        if (isCancelled) return;

        if (Capacitor.isNativePlatform()) {
          const dataUrl = canvas.toDataURL("image/png");
          const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");

          const savedFile = await Filesystem.writeFile({
            path: "share_result.png",
            data: base64Data,
            directory: Directory.Cache,
          });

          if (!isCancelled) {
            setPreloadedImage({
              uri: savedFile.uri,
              base64Data,
            });
          }
        } else {
          const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob((b) => resolve(b), "image/png")
          );

          if (!blob) {
            throw new Error("Failed to generate preloaded PNG blob");
          }

          const file = new File([blob], "sudoku-sync-result.png", {
            type: "image/png",
          });

          if (!isCancelled) {
            setPreloadedImage({
              file,
              blob,
            });
          }
        }
      } catch (err) {
        console.error(
          "[ShareActionWrapper] Background pre-generation error:",
          err
        );
      } finally {
        if (!isCancelled) {
          setIsPreparing(false);
        }
      }
    }, 300);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [
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

  const handleShare = async () => {
    if (playClickSound) {
      playClickSound();
    }
    if (isPreparing || !preloadedImage) return;

    const shareText = `${finalTagline}\n${fullUrl}`;

    try {
      if (Capacitor.isNativePlatform()) {
        await Share.share({
          title: "Sudoku Sync",
          text: shareText,
          url: preloadedImage.uri,
          dialogTitle: "Share your Sudoku Triumph!",
        });
      } else {
        const { file, blob } = preloadedImage;

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
        } else if (blob) {
          // Desktop fallback: download the pre-generated PNG immediately
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
      console.error("[ShareActionWrapper] Share execution error:", err);
    }
  };

  return (
    <>
      <ShareIcon
        onClick={handleShare}
        isLoading={isPreparing}
        darkMode={darkMode}
        className={className}
      />

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
