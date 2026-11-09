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
  const [isProvisioning, setIsProvisioning] = useState<boolean>(false);
  const [verifiedRoomCode, setVerifiedRoomCode] = useState<string | undefined>(() =>
    roomCode && roomCode.trim().length > 0 && roomCode !== "OFFLINE" ? roomCode : undefined
  );

  const isMountedRef = React.useRef<boolean>(true);
  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  React.useEffect(() => {
    if (roomCode && roomCode.trim().length > 0 && roomCode !== "OFFLINE") {
      setVerifiedRoomCode(roomCode);
    } else {
      setVerifiedRoomCode(undefined);
    }
  }, [roomCode, boardState?.seed]);

  const handleOpenPreview = async () => {
    if (isProvisioning) return;
    if (playClickSound) {
      playClickSound();
    }

    if (!verifiedRoomCode && onEnsureRoomCreated) {
      setIsProvisioning(true);
      let failSafeTimer: ReturnType<typeof setTimeout> | null = null;
      try {
        const provisioned = await Promise.race<string | null>([
          onEnsureRoomCreated(),
          new Promise<null>((resolve) => {
            failSafeTimer = setTimeout(() => resolve(null), 5000);
          }),
        ]);
        if (provisioned && provisioned.trim().length > 0 && provisioned !== "OFFLINE") {
          if (isMountedRef.current) {
            setVerifiedRoomCode(provisioned);
          }
        }
      } catch (err) {
        console.warn("[ShareActionWrapper] JIT room provisioning failed:", err);
      } finally {
        if (failSafeTimer) clearTimeout(failSafeTimer);
        if (isMountedRef.current) {
          setIsProvisioning(false);
        }
      }
    }

    if (isMountedRef.current) {
      setIsOpen(true);
    }
  };

  return (
    <>
      <ShareIcon
        onClick={handleOpenPreview}
        darkMode={darkMode}
        className={className}
        isLoading={isProvisioning}
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
