import React, { useState } from "react";
import { ShareIcon } from "./ShareIcon";
import { ShareDifficulty } from "../../utils/canvasShare";
import { SharePreviewModal } from "./SharePreviewModal";
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
  isWon?: boolean;
  darkMode?: boolean;
  roomCode?: string;
  playClickSound?: () => void;
  className?: string;
  onEnsureRoomCreated?: () => Promise<string | null>;
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
  isWon,
  darkMode = false,
  roomCode,
  playClickSound,
  className = "",
  onEnsureRoomCreated,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [verifiedRoomCode, setVerifiedRoomCode] = useState<string | undefined>(roomCode);

  React.useEffect(() => {
    if (roomCode) {
      setVerifiedRoomCode(roomCode);
    }
  }, [roomCode]);

  const handleOpenPreview = async () => {
    if (playClickSound) {
      playClickSound();
    }
    setIsOpen(true);

    if (!verifiedRoomCode && onEnsureRoomCreated) {
      try {
        const provisioned = await onEnsureRoomCreated();
        if (provisioned) {
          setVerifiedRoomCode(provisioned);
        }
      } catch (err) {
        console.warn("[ShareActionWrapper] JIT room provisioning failed:", err);
      }
    }
  };

  return (
    <>
      <ShareIcon
        onClick={handleOpenPreview}
        darkMode={darkMode}
        className={className}
      />

      <SharePreviewModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        boardState={boardState}
        solutionGrid={solutionGrid}
        difficulty={difficulty}
        time={time}
        sessionSeconds={sessionSeconds}
        playerName={playerName}
        tagline={tagline}
        bestTime={bestTime}
        isNewRecord={isNewRecord}
        isWon={isWon}
        darkMode={darkMode}
        roomCode={verifiedRoomCode}
        playClickSound={playClickSound}
      />
    </>
  );
};

export default ShareActionWrapper;
