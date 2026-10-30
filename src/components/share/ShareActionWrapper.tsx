import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { Loader2 } from "lucide-react";
import { ShareIcon } from "./ShareIcon";
import { ShareCard, ShareCardBoardState, ShareDifficulty } from "./ShareCard";

export interface ShareActionWrapperProps {
  boardState: ShareCardBoardState | null;
  difficulty: ShareDifficulty;
  time: string;
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
  difficulty,
  time,
  playerName,
  tagline = "मैंने इसे इतनी देर में सॉल्व किया! क्या आप कर सकते हैं?",
  bestTime,
  isNewRecord = false,
  darkMode = false,
  roomCode,
  playClickSound,
  className = "",
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleShare = async () => {
    if (playClickSound) {
      playClickSound();
    }
    if (isCapturing || !cardRef.current) return;

    setIsCapturing(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });

      const shareText = `${tagline} (${String(difficulty).toUpperCase()} • ${time})`;

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
          // Desktop browser fallback: trigger download so user never hits a dead end
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
      // User cancellation (AbortError) or share dismissal is normal
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

      {/* Hidden off-screen ShareCard for html2canvas capture */}
      <ShareCard
        ref={cardRef}
        boardState={boardState}
        difficulty={difficulty}
        time={time}
        playerName={playerName}
        tagline={tagline}
        bestTime={bestTime}
        isNewRecord={isNewRecord}
        darkMode={darkMode}
        hiddenOffscreen={true}
        roomCode={roomCode}
      />
    </>
  );
};

export default ShareActionWrapper;
