import React, { useState } from "react";
import { ShareIcon } from "./ShareIcon";
import { ShareDifficulty } from "./ShareCard";
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
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleOpenPreview = () => {
    if (playClickSound) {
      playClickSound();
    }
    setIsOpen(true);
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
        darkMode={darkMode}
        roomCode={roomCode}
        playClickSound={playClickSound}
      />
    </>
  );
};

export default ShareActionWrapper;
