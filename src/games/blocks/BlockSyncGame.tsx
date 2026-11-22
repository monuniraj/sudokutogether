import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import {
  Clock,
  Crown,
  Hand,
  HelpCircle,
  Sparkles,
  Undo2,
  Users,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { BlockSyncConfettiRain } from "./BlockSyncConfettiRain";
import { isHapticsEnabled, setGlobalHapticsEnabled } from "../../utils/haptics";
import { Language } from "../../i18n/translations";
import { useTranslation } from "../../i18n/useTranslation";
import {
  BlocksMatchStandingEntry,
  BlocksSavedSession,
  clearBlocksSavedSession,
  getSettings,
  loadBlocksSavedSession,
  loadBlocksVault,
  recordBlocksMatchHistory,
  saveBlocksSavedSession,
  saveSettings,
  updateBlocksBestScore,
} from "../../utils/storageEngine";
import {
  BlockSyncEndGameModal,
  BlockSyncRoomStandingEntry,
  BlockSyncSoloRunEntry,
} from "./BlockSyncEndGameModal";
import {
  BlockSyncSettingsAudioCue,
  BlockSyncSettingsModal,
} from "./BlockSyncSettingsModal";
import {
  BLOCK_POLYOMINO_SHAPES,
  clearPendingBlocksRoomSession,
  EARLY_BLOCK_SHAPE_IDS,
  generateSeededBlockTray,
  getPendingBlocksRoomSession,
  savePendingBlocksRoomSession,
  type BlockShapeId,
  type BlockShapeSpec,
  type BlockSyncPendingRoomSession,
  type BlockSyncPendingRoomTraySlot,
  type BlockSyncRoomConfig,
  type BlockSyncRoomMode,
  type BlockSyncRoomResultPayload,
  type BlockTier,
  type PastelColorKey,
  type PolyominoMatrix,
  type PolyominoPiece,
} from "./blocksRoomEngine";

export type {
  BlockSyncRoomConfig,
  BlockSyncRoomMode,
  BlockSyncRoomResultPayload,
  PolyominoPiece,
};

const TUTORIAL_SEEN_KEY = "block_sync_tutorial_seen";

export interface BlockSyncGameProps {
  darkMode: boolean;
  uid?: string | null;
  soundEffects?: boolean;
  vibrations?: boolean;
  language?: Language;
  isSettingsOpen?: boolean;
  onCloseSettings?: () => void;
  onToggleSoundEffects?: (enabled: boolean) => void;
  onToggleVibrations?: (enabled: boolean) => void;
  onLanguageChange?: (lang: Language) => void;
  onBackHome?: () => void;
  onOpenMoreGames?: () => void;
  onOpenMultiplayer?: () => void;
  // Optional Phase 3A Multiplayer Room props (Solo remains 100% unchanged when omitted)
  multiplayerRoom?: BlockSyncRoomConfig | null;
  roomStandings?: BlockSyncRoomStandingEntry[];
  onSubmitRoomResult?: (payload: BlockSyncRoomResultPayload) => void;
  onLeaveMultiplayerRoom?: () => void;
}

const BOARD_SIZE = 9;
const SUBGRID_SIZE = 3;
const TRAY_SLOT_COUNT = 3;
const TRAY_BASE_CELL_PX = 42;
const TRAY_BASE_GAP_PX = 5;

const POINTS_PER_PLACED_SQUARE = 10;
const POINTS_PER_CLEARED_GROUP = 100;
const VANISH_DURATION_MS = 300;
const MAX_UNDO_HISTORY = 25;

export interface BoardCell {
  color: PastelColorKey;
  isClearing?: boolean;
  isComboClear?: boolean;
  clearBatchId?: number;
}

type BoardState = (BoardCell | null)[][];

interface GridCoord {
  row: number;
  col: number;
}

interface BoardMetrics {
  cellSize: number;
  gapPx: number;
}

interface TraySlotMetrics {
  slotWidth: number;
  slotHeight: number;
}

interface ActiveDragState {
  slotIndex: number;
  piece: PolyominoPiece;
  pointerId: number;
  pointerType: string;
  clientX: number;
  clientY: number;
  homeCenterX: number;
  homeCenterY: number;
  trayReturnScale: number;
  boardCellPitch: number;
  boardCellSize: number;
  boardGapPx: number;
  isReturning: boolean;
}

interface ClearAnalysis {
  fullRows: number[];
  fullCols: number[];
  fullBoxes: { boxRow: number; boxCol: number }[];
  groupsClearedCount: number;
  clearKeys: Set<string>;
}

interface ClearFeedback {
  id: number;
  pointsDelta: number;
  comboMultiplier: number;
  streakCount: number;
}

interface GameOverSummary {
  finalScore: number;
  previousBestScore: number;
  bestScore: number;
  initialSessionBest: number;
  isNewBest: boolean;
  endReason: "out_of_moves" | "time_up";
  roomCode?: string;
  savedRoomBestScore?: number;
  didImproveRoomScore?: boolean;
  soloRuns: BlockSyncSoloRunEntry[];
}

interface MoveSnapshot {
  boardState: BoardState;
  currentBlocks: (PolyominoPiece | null)[];
  score: number;
  clearStreak: number;
  lastTrayShapeIds: BlockShapeId[];
  roomTrayIndex: number;
  linesCleared: number;
  bestCombo: number;
}

const POLYOMINO_SHAPES: readonly BlockShapeSpec[] = BLOCK_POLYOMINO_SHAPES;

// Vibrant saturated Soft-Square finishes (-300 lightest baseline stepping UP to -400/-500)
const PASTEL_TILE_CLASSES_LIGHT: Record<PastelColorKey, string> = {
  yellow:
    "bg-yellow-300 border border-amber-400/65 shadow-[inset_0_2px_3px_rgba(255,255,255,0.8),inset_0_-2px_4px_rgba(180,83,9,0.22),0_4px_14px_rgba(0,0,0,0.16)]",
  emerald:
    "bg-emerald-300 border border-emerald-400/65 shadow-[inset_0_2px_3px_rgba(255,255,255,0.78),inset_0_-2px_4px_rgba(4,120,87,0.2),0_4px_14px_rgba(0,0,0,0.16)]",
  "emerald-mid":
    "bg-emerald-400 border border-emerald-500/70 shadow-[inset_0_2px_3px_rgba(255,255,255,0.68),inset_0_-2px_4px_rgba(6,95,70,0.24),0_4px_14px_rgba(0,0,0,0.16)]",
  teal:
    "bg-teal-400 border border-teal-500/70 shadow-[inset_0_2px_3px_rgba(255,255,255,0.68),inset_0_-2px_4px_rgba(17,94,89,0.24),0_4px_14px_rgba(0,0,0,0.16)]",
  "emerald-rich":
    "bg-emerald-500 border border-emerald-600/75 shadow-[inset_0_2px_3px_rgba(255,255,255,0.58),inset_0_-2px_4px_rgba(6,78,59,0.28),0_4px_14px_rgba(0,0,0,0.18)]",
  orange:
    "bg-orange-300 border border-orange-400/65 shadow-[inset_0_2px_3px_rgba(255,255,255,0.78),inset_0_-2px_4px_rgba(194,65,12,0.2),0_4px_14px_rgba(0,0,0,0.16)]",
  amber:
    "bg-amber-400 border border-amber-500/70 shadow-[inset_0_2px_3px_rgba(255,255,255,0.68),inset_0_-2px_4px_rgba(180,83,9,0.24),0_4px_14px_rgba(0,0,0,0.16)]",
  "orange-deep":
    "bg-orange-400 border border-orange-500/70 shadow-[inset_0_2px_3px_rgba(255,255,255,0.68),inset_0_-2px_4px_rgba(154,52,18,0.24),0_4px_14px_rgba(0,0,0,0.16)]",
  sky:
    "bg-sky-300 border border-sky-400/70 shadow-[inset_0_2px_3px_rgba(255,255,255,0.8),inset_0_-2px_4px_rgba(3,105,161,0.22),0_4px_14px_rgba(0,0,0,0.16)]",
  indigo:
    "bg-indigo-400 border border-indigo-500/70 shadow-[inset_0_2px_3px_rgba(255,255,255,0.65),inset_0_-2px_4px_rgba(55,48,163,0.24),0_4px_14px_rgba(0,0,0,0.16)]",
  cyan:
    "bg-cyan-400 border border-cyan-500/70 shadow-[inset_0_2px_3px_rgba(255,255,255,0.7),inset_0_-2px_4px_rgba(14,116,144,0.22),0_4px_14px_rgba(0,0,0,0.16)]",
  violet:
    "bg-violet-400 border border-violet-500/70 shadow-[inset_0_2px_3px_rgba(255,255,255,0.66),inset_0_-2px_4px_rgba(91,33,182,0.24),0_4px_14px_rgba(0,0,0,0.16)]",
  purple:
    "bg-purple-300 border border-purple-400/70 shadow-[inset_0_2px_3px_rgba(255,255,255,0.74),inset_0_-2px_4px_rgba(107,33,168,0.22),0_4px_14px_rgba(0,0,0,0.16)]",
  rose:
    "bg-rose-400 border border-rose-500/70 shadow-[inset_0_2px_3px_rgba(255,255,255,0.66),inset_0_-2px_4px_rgba(159,18,57,0.24),0_4px_14px_rgba(0,0,0,0.16)]",
};

// Night-Safe Matte-Silicone Dark Palette (82-92% rich jewel saturation, lower luminance, soft 0.15 specular)
// Calibrated for #0E141B / #19222C / #283747 dark surfaces: warm gold separated from tangerine orange, rich non-chalky purple
const PASTEL_TILE_CLASSES_DARK: Record<PastelColorKey, string> = {
  yellow:
    "bg-[#E8B417] border border-[#BA860E]/75 shadow-[inset_0_2px_3px_rgba(255,255,255,0.15),inset_0_-3px_5px_rgba(140,82,4,0.52),0_5px_14px_rgba(0,0,0,0.45)]",
  emerald:
    "bg-[#20BD7A] border border-[#13945D]/75 shadow-[inset_0_2px_3px_rgba(255,255,255,0.15),inset_0_-3px_5px_rgba(6,95,70,0.54),0_5px_14px_rgba(0,0,0,0.45)]",
  "emerald-mid":
    "bg-[#15A86E] border border-[#0E8254]/75 shadow-[inset_0_2px_3px_rgba(255,255,255,0.14),inset_0_-3px_5px_rgba(6,78,59,0.56),0_5px_14px_rgba(0,0,0,0.45)]",
  teal:
    "bg-[#149B9E] border border-[#0D777A]/75 shadow-[inset_0_2px_3px_rgba(255,255,255,0.14),inset_0_-3px_5px_rgba(17,94,89,0.56),0_5px_14px_rgba(0,0,0,0.45)]",
  "emerald-rich":
    "bg-[#119464] border border-[#0B6E49]/75 shadow-[inset_0_2px_3px_rgba(255,255,255,0.14),inset_0_-3px_5px_rgba(4,66,46,0.58),0_5px_14px_rgba(0,0,0,0.46)]",
  orange:
    "bg-[#E66A1C] border border-[#B84D0E]/75 shadow-[inset_0_2px_3px_rgba(255,255,255,0.15),inset_0_-3px_5px_rgba(154,52,18,0.54),0_5px_14px_rgba(0,0,0,0.45)]",
  amber:
    "bg-[#DF8616] border border-[#B3630B]/75 shadow-[inset_0_2px_3px_rgba(255,255,255,0.15),inset_0_-3px_5px_rgba(146,64,14,0.54),0_5px_14px_rgba(0,0,0,0.45)]",
  "orange-deep":
    "bg-[#DE4B1E] border border-[#AC330F]/75 shadow-[inset_0_2px_3px_rgba(255,255,255,0.14),inset_0_-3px_5px_rgba(124,45,18,0.56),0_5px_14px_rgba(0,0,0,0.45)]",
  sky:
    "bg-[#1FA1E8] border border-[#147CB8]/75 shadow-[inset_0_2px_3px_rgba(255,255,255,0.15),inset_0_-3px_5px_rgba(7,89,133,0.54),0_5px_14px_rgba(0,0,0,0.45)]",
  indigo:
    "bg-[#4B5AE0] border border-[#3642B5]/75 shadow-[inset_0_2px_3px_rgba(255,255,255,0.14),inset_0_-3px_5px_rgba(49,46,129,0.58),0_5px_14px_rgba(0,0,0,0.45)]",
  cyan:
    "bg-[#17B5C9] border border-[#0E8C9C]/75 shadow-[inset_0_2px_3px_rgba(255,255,255,0.15),inset_0_-3px_5px_rgba(14,116,144,0.54),0_5px_14px_rgba(0,0,0,0.45)]",
  violet:
    "bg-[#7A42DE] border border-[#5B2BB5]/75 shadow-[inset_0_2px_3px_rgba(255,255,255,0.14),inset_0_-3px_5px_rgba(76,29,149,0.58),0_5px_14px_rgba(0,0,0,0.45)]",
  purple:
    "bg-[#9B42D6] border border-[#782AA8]/75 shadow-[inset_0_2px_3px_rgba(255,255,255,0.14),inset_0_-3px_5px_rgba(88,28,135,0.56),0_5px_14px_rgba(0,0,0,0.45)]",
  rose:
    "bg-[#E03158] border border-[#B01E40]/75 shadow-[inset_0_2px_3px_rgba(255,255,255,0.15),inset_0_-3px_5px_rgba(136,19,55,0.56),0_5px_14px_rgba(0,0,0,0.45)]",
};

const HOVER_PREVIEW_CLASSES_LIGHT: Record<PastelColorKey, string> = {
  yellow:
    "bg-yellow-300/55 border border-amber-400/45 shadow-[inset_0_2px_6px_rgba(255,255,255,0.55)]",
  emerald:
    "bg-emerald-300/55 border border-emerald-400/45 shadow-[inset_0_2px_6px_rgba(255,255,255,0.55)]",
  "emerald-mid":
    "bg-emerald-400/55 border border-emerald-500/45 shadow-[inset_0_2px_6px_rgba(255,255,255,0.5)]",
  teal:
    "bg-teal-400/55 border border-teal-500/45 shadow-[inset_0_2px_6px_rgba(255,255,255,0.5)]",
  "emerald-rich":
    "bg-emerald-500/55 border border-emerald-600/50 shadow-[inset_0_2px_6px_rgba(255,255,255,0.45)]",
  orange:
    "bg-orange-300/55 border border-orange-400/45 shadow-[inset_0_2px_6px_rgba(255,255,255,0.55)]",
  amber:
    "bg-amber-400/55 border border-amber-500/45 shadow-[inset_0_2px_6px_rgba(255,255,255,0.5)]",
  "orange-deep":
    "bg-orange-400/55 border border-orange-500/45 shadow-[inset_0_2px_6px_rgba(255,255,255,0.5)]",
  sky:
    "bg-sky-300/55 border border-sky-400/45 shadow-[inset_0_2px_6px_rgba(255,255,255,0.55)]",
  indigo:
    "bg-indigo-400/55 border border-indigo-500/45 shadow-[inset_0_2px_6px_rgba(255,255,255,0.5)]",
  cyan:
    "bg-cyan-400/55 border border-cyan-500/45 shadow-[inset_0_2px_6px_rgba(255,255,255,0.5)]",
  violet:
    "bg-violet-400/55 border border-violet-500/45 shadow-[inset_0_2px_6px_rgba(255,255,255,0.5)]",
  purple:
    "bg-purple-300/55 border border-purple-400/45 shadow-[inset_0_2px_6px_rgba(255,255,255,0.5)]",
  rose:
    "bg-rose-400/55 border border-rose-500/45 shadow-[inset_0_2px_6px_rgba(255,255,255,0.5)]",
};

const HOVER_PREVIEW_CLASSES_DARK: Record<PastelColorKey, string> = {
  yellow:
    "bg-[#F9CF43]/42 border border-[#F9CF43]/60 shadow-[inset_0_2px_5px_rgba(255,255,255,0.24)]",
  emerald:
    "bg-[#3AD994]/42 border border-[#3AD994]/60 shadow-[inset_0_2px_5px_rgba(255,255,255,0.22)]",
  "emerald-mid":
    "bg-[#1DC484]/42 border border-[#1DC484]/60 shadow-[inset_0_2px_5px_rgba(255,255,255,0.22)]",
  teal:
    "bg-[#1BB2B5]/42 border border-[#1BB2B5]/60 shadow-[inset_0_2px_5px_rgba(255,255,255,0.22)]",
  "emerald-rich":
    "bg-[#17AB75]/45 border border-[#17AB75]/60 shadow-[inset_0_2px_5px_rgba(255,255,255,0.2)]",
  orange:
    "bg-[#F7924A]/42 border border-[#F7924A]/60 shadow-[inset_0_2px_5px_rgba(255,255,255,0.24)]",
  amber:
    "bg-[#F6A831]/42 border border-[#F6A831]/60 shadow-[inset_0_2px_5px_rgba(255,255,255,0.24)]",
  "orange-deep":
    "bg-[#F26831]/42 border border-[#F26831]/60 shadow-[inset_0_2px_5px_rgba(255,255,255,0.22)]",
  sky:
    "bg-[#47BBF5]/42 border border-[#47BBF5]/60 shadow-[inset_0_2px_5px_rgba(255,255,255,0.24)]",
  indigo:
    "bg-[#6774F2]/42 border border-[#6774F2]/60 shadow-[inset_0_2px_5px_rgba(255,255,255,0.22)]",
  cyan:
    "bg-[#26D2E6]/42 border border-[#26D2E6]/60 shadow-[inset_0_2px_5px_rgba(255,255,255,0.24)]",
  violet:
    "bg-[#935DF0]/42 border border-[#935DF0]/60 shadow-[inset_0_2px_5px_rgba(255,255,255,0.22)]",
  purple:
    "bg-[#BA6EEB]/42 border border-[#BA6EEB]/60 shadow-[inset_0_2px_5px_rgba(255,255,255,0.22)]",
  rose:
    "bg-[#F04D70]/42 border border-[#F04D70]/60 shadow-[inset_0_2px_5px_rgba(255,255,255,0.22)]",
};

const EARLY_GAME_SHAPE_IDS: ReadonlySet<BlockShapeId> = EARLY_BLOCK_SHAPE_IDS;

let pieceSequenceCounter = 0;

function createEmptyBoard(): BoardState {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => null)
  );
}

interface BoardGroupCounts {
  rowCounts: number[];
  colCounts: number[];
  boxCounts: number[];
  occupiedTotal: number;
}

interface VariantBoardProfile {
  variantIndex: number;
  fitCount: number;
  clearTriggerCount: number;
  nearClearCount: number;
}

interface SpecBoardProfile {
  canFit: boolean;
  fitVariants: VariantBoardProfile[];
  clearVariants: VariantBoardProfile[];
  nearClearVariants: VariantBoardProfile[];
  maxFitCount: number;
}

function summarizeBoardOccupancy(board: BoardState): BoardGroupCounts {
  const rowCounts = Array.from({ length: BOARD_SIZE }, () => 0);
  const colCounts = Array.from({ length: BOARD_SIZE }, () => 0);
  const boxCounts = Array.from({ length: BOARD_SIZE }, () => 0);
  let occupiedTotal = 0;

  for (let r = 0; r < BOARD_SIZE; r += 1) {
    for (let c = 0; c < BOARD_SIZE; c += 1) {
      if (!isCellOccupied(board[r][c])) continue;
      rowCounts[r] += 1;
      colCounts[c] += 1;
      boxCounts[Math.floor(r / SUBGRID_SIZE) * SUBGRID_SIZE + Math.floor(c / SUBGRID_SIZE)] += 1;
      occupiedTotal += 1;
    }
  }

  return { rowCounts, colCounts, boxCounts, occupiedTotal };
}

function analyzeSpecAgainstBoard(
  spec: BlockShapeSpec,
  board: BoardState,
  counts: BoardGroupCounts
): SpecBoardProfile {
  const fitVariants: VariantBoardProfile[] = [];
  const clearVariants: VariantBoardProfile[] = [];
  const nearClearVariants: VariantBoardProfile[] = [];
  let maxFitCount = 0;

  for (let vIdx = 0; vIdx < spec.variants.length; vIdx += 1) {
    const shape = spec.variants[vIdx].shape;
    const rows = shape.length;
    const cols = shape[0].length;
    const relCoords: GridCoord[] = [];
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        if (shape[r][c] === 1) {
          relCoords.push({ row: r, col: c });
        }
      }
    }

    let fitCount = 0;
    let clearTriggerCount = 0;
    let nearClearCount = 0;

    for (let anchorRow = 0; anchorRow <= BOARD_SIZE - rows; anchorRow += 1) {
      for (let anchorCol = 0; anchorCol <= BOARD_SIZE - cols; anchorCol += 1) {
        let valid = true;
        for (let i = 0; i < relCoords.length; i += 1) {
          if (isCellOccupied(board[anchorRow + relCoords[i].row][anchorCol + relCoords[i].col])) {
            valid = false;
            break;
          }
        }
        if (!valid) continue;

        fitCount += 1;

        // Only compute clear/near-clear dopamine potential when board has existing blocks
        if (counts.occupiedTotal > 0) {
          const rowAdds = new Map<number, number>();
          const colAdds = new Map<number, number>();
          const boxAdds = new Map<number, number>();

          for (let i = 0; i < relCoords.length; i += 1) {
            const tr = anchorRow + relCoords[i].row;
            const tc = anchorCol + relCoords[i].col;
            const tb = Math.floor(tr / SUBGRID_SIZE) * SUBGRID_SIZE + Math.floor(tc / SUBGRID_SIZE);
            rowAdds.set(tr, (rowAdds.get(tr) ?? 0) + 1);
            colAdds.set(tc, (colAdds.get(tc) ?? 0) + 1);
            boxAdds.set(tb, (boxAdds.get(tb) ?? 0) + 1);
          }

          let clearsHere = false;
          let nearHere = false;

          rowAdds.forEach((add, idx) => {
            const after = counts.rowCounts[idx] + add;
            if (after === BOARD_SIZE) clearsHere = true;
            else if (after === BOARD_SIZE - 1) nearHere = true;
          });
          colAdds.forEach((add, idx) => {
            const after = counts.colCounts[idx] + add;
            if (after === BOARD_SIZE) clearsHere = true;
            else if (after === BOARD_SIZE - 1) nearHere = true;
          });
          boxAdds.forEach((add, idx) => {
            const after = counts.boxCounts[idx] + add;
            if (after === BOARD_SIZE) clearsHere = true;
            else if (after === BOARD_SIZE - 1) nearHere = true;
          });

          if (clearsHere) clearTriggerCount += 1;
          else if (nearHere) nearClearCount += 1;
        }
      }
    }

    if (fitCount > 0) {
      const profile: VariantBoardProfile = {
        variantIndex: vIdx,
        fitCount,
        clearTriggerCount,
        nearClearCount,
      };
      fitVariants.push(profile);
      if (clearTriggerCount > 0) clearVariants.push(profile);
      if (nearClearCount > 0) nearClearVariants.push(profile);
      if (fitCount > maxFitCount) maxFitCount = fitCount;
    }
  }

  return {
    canFit: fitVariants.length > 0,
    fitVariants,
    clearVariants,
    nearClearVariants,
    maxFitCount,
  };
}

function getShapeWeightForScore(spec: BlockShapeSpec, score: number): number {
  if (score < 600) {
    if (!EARLY_GAME_SHAPE_IDS.has(spec.id)) return 0;
    return spec.tier === "small" ? 14 : 11;
  }

  // Progressive pacing from 600 -> 4000+: scales in line-4, line-5, big-l, z/s, plus-cross, and 3x3 Boss Block
  const progress = Math.min(1, (score - 600) / 3400);
  if (spec.tier === "small") {
    return 12 - 6 * progress;
  }
  if (spec.tier === "medium") {
    if (spec.id === "z-shape" || spec.id === "s-shape") {
      return 5 + 5 * progress;
    }
    return 10;
  }
  if (spec.id === "plus-cross" || spec.id === "box-3x3") {
    return 1.5 + 7.5 * progress;
  }
  return 2.5 + 7.5 * progress;
}

function getBoardAwareWeight(
  spec: BlockShapeSpec,
  currentScore: number,
  profile: SpecBoardProfile | undefined,
  counts: BoardGroupCounts | undefined
): number {
  let weight = getShapeWeightForScore(spec, currentScore);
  if (weight <= 0 || !profile || !counts) return weight;

  if (!profile.canFit) return 0;

  if (counts.occupiedTotal > 0) {
    if (profile.clearVariants.length > 0) {
      weight *= 1.85;
    } else if (profile.nearClearVariants.length > 0) {
      weight *= 1.3;
    }

    // Gently reduce heavy-tight pieces when a crowded board leaves very few anchor slots
    const occupancyRatio = counts.occupiedTotal / (BOARD_SIZE * BOARD_SIZE);
    if (occupancyRatio >= 0.45 && profile.maxFitCount <= 2) {
      weight *= 0.45;
    }
  }

  return weight;
}

function pickWeightedSpec(
  candidates: readonly BlockShapeSpec[],
  currentScore: number,
  boardProfiles?: ReadonlyMap<BlockShapeId, SpecBoardProfile>,
  counts?: BoardGroupCounts
): BlockShapeSpec {
  const weights = candidates.map((spec) =>
    Math.max(
      0.1,
      getBoardAwareWeight(spec, currentScore, boardProfiles?.get(spec.id), counts)
    )
  );
  let totalWeight = 0;
  for (let i = 0; i < weights.length; i += 1) {
    totalWeight += weights[i];
  }

  let roll = Math.random() * totalWeight;
  for (let i = 0; i < candidates.length; i += 1) {
    roll -= weights[i];
    if (roll <= 0) {
      return candidates[i];
    }
  }
  return candidates[0];
}

function spawnThreeBlocks(
  currentScore = 0,
  previousShapeIds: readonly BlockShapeId[] = [],
  lastPlacedShapeId?: BlockShapeId,
  boardState?: BoardState
): (PolyominoPiece | null)[] {
  const eligibleSpecs = POLYOMINO_SHAPES.filter(
    (spec) => getShapeWeightForScore(spec, currentScore) > 0
  );
  const previousTraySet = new Set<BlockShapeId>(previousShapeIds);
  const trayCounts = new Map<BlockShapeId, number>();
  let prevPieceShapeId: BlockShapeId | undefined =
    lastPlacedShapeId ?? previousShapeIds[previousShapeIds.length - 1];

  let boardCounts: BoardGroupCounts | undefined;
  let boardProfiles: Map<BlockShapeId, SpecBoardProfile> | undefined;
  if (boardState) {
    boardCounts = summarizeBoardOccupancy(boardState);
    boardProfiles = new Map<BlockShapeId, SpecBoardProfile>();
    for (const spec of eligibleSpecs) {
      boardProfiles.set(
        spec.id,
        analyzeSpecAgainstBoard(spec, boardState, boardCounts)
      );
    }
  }

  const canFitSpec = (spec: BlockShapeSpec): boolean =>
    !boardProfiles || (boardProfiles.get(spec.id)?.canFit ?? false);
  const hasAnyFittingSpec =
    !boardProfiles || eligibleSpecs.some((spec) => canFitSpec(spec));

  return Array.from({ length: TRAY_SLOT_COUNT }, (_, slotIdx) => {
    // 1. Strict pass: board-solvable, distinct in tray, never back-to-back identical
    let candidates = eligibleSpecs.filter((spec) => {
      if ((trayCounts.get(spec.id) ?? 0) > 0) return false;
      if (prevPieceShapeId && spec.id === prevPieceShapeId) return false;
      if (slotIdx === 0 && previousTraySet.has(spec.id)) return false;
      if (hasAnyFittingSpec && !canFitSpec(spec)) return false;
      return true;
    });

    // 2. Relaxed tray-first pass: allow repeat from previous tray slot 0 if needed while keeping fit & anti-repeat
    if (candidates.length === 0) {
      candidates = eligibleSpecs.filter(
        (spec) =>
          (trayCounts.get(spec.id) ?? 0) < 2 &&
          (!prevPieceShapeId || spec.id !== prevPieceShapeId) &&
          (!hasAnyFittingSpec || canFitSpec(spec))
      );
    }

    // 3. Crowded-endgame pass: once Slot 0 is guaranteed solvable, keep distinct & non-repeating shapes
    if (candidates.length === 0) {
      candidates = eligibleSpecs.filter(
        (spec) =>
          (trayCounts.get(spec.id) ?? 0) === 0 &&
          (!prevPieceShapeId || spec.id !== prevPieceShapeId)
      );
    }

    // 4. Hard safety passes: never emit 3 identical shapes in one tray batch
    if (candidates.length === 0) {
      candidates = eligibleSpecs.filter(
        (spec) =>
          (trayCounts.get(spec.id) ?? 0) < 2 &&
          (!prevPieceShapeId || spec.id !== prevPieceShapeId)
      );
    }
    if (candidates.length === 0) {
      candidates = eligibleSpecs.filter(
        (spec) => (trayCounts.get(spec.id) ?? 0) < 2
      );
    }
    if (candidates.length === 0) {
      candidates = eligibleSpecs;
    }

    const chosenSpec = pickWeightedSpec(
      candidates,
      currentScore,
      boardProfiles,
      boardCounts
    );
    const specProfile = boardProfiles?.get(chosenSpec.id);
    let variant =
      chosenSpec.variants[Math.floor(Math.random() * chosenSpec.variants.length)];

    if (specProfile && specProfile.canFit) {
      if (specProfile.clearVariants.length > 0 && Math.random() < 0.7) {
        const picked =
          specProfile.clearVariants[
          Math.floor(Math.random() * specProfile.clearVariants.length)
          ];
        variant = chosenSpec.variants[picked.variantIndex];
      } else {
        const picked =
          specProfile.fitVariants[
          Math.floor(Math.random() * specProfile.fitVariants.length)
          ];
        variant = chosenSpec.variants[picked.variantIndex];
      }
    }

    trayCounts.set(chosenSpec.id, (trayCounts.get(chosenSpec.id) ?? 0) + 1);
    prevPieceShapeId = chosenSpec.id;
    pieceSequenceCounter += 1;

    return {
      uid: `block-piece-${Date.now()}-${pieceSequenceCounter}`,
      shapeId: chosenSpec.id,
      variantId: variant.id,
      shape: variant.shape,
      color: chosenSpec.color,
    };
  });
}

function isCellOccupied(cell: BoardCell | null): boolean {
  return cell !== null && !cell.isClearing;
}

function canPlacePiece(
  board: BoardState,
  shape: PolyominoMatrix,
  anchorRow: number,
  anchorCol: number
): boolean {
  for (let r = 0; r < shape.length; r += 1) {
    for (let c = 0; c < shape[r].length; c += 1) {
      if (shape[r][c] === 0) continue;
      const targetRow = anchorRow + r;
      const targetCol = anchorCol + c;
      if (
        targetRow < 0 ||
        targetRow >= BOARD_SIZE ||
        targetCol < 0 ||
        targetCol >= BOARD_SIZE
      ) {
        return false;
      }
      if (isCellOccupied(board[targetRow][targetCol])) {
        return false;
      }
    }
  }
  return true;
}

function getPlacedCellCoords(
  shape: PolyominoMatrix,
  anchorRow: number,
  anchorCol: number
): GridCoord[] {
  const coords: GridCoord[] = [];
  for (let r = 0; r < shape.length; r += 1) {
    for (let c = 0; c < shape[r].length; c += 1) {
      if (shape[r][c] === 1) {
        coords.push({ row: anchorRow + r, col: anchorCol + c });
      }
    }
  }
  return coords;
}

/**
 * 3-Way Sudoku Clearing Algorithm:
 * Identifies all completed horizontal rows, vertical columns, and 3x3 sub-grids
 * in a single pass and returns their deduplicated union of coordinates.
 */
function analyzeSudokuClears(board: BoardState): ClearAnalysis {
  const fullRows: number[] = [];
  const fullCols: number[] = [];
  const fullBoxes: { boxRow: number; boxCol: number }[] = [];
  const clearKeys = new Set<string>();

  // 1. Completed Horizontal Rows (9 cells)
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    let rowFull = true;
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      if (!isCellOccupied(board[row][col])) {
        rowFull = false;
        break;
      }
    }
    if (rowFull) {
      fullRows.push(row);
      for (let col = 0; col < BOARD_SIZE; col += 1) {
        clearKeys.add(`${row},${col}`);
      }
    }
  }

  // 2. Completed Vertical Columns (9 cells)
  for (let col = 0; col < BOARD_SIZE; col += 1) {
    let colFull = true;
    for (let row = 0; row < BOARD_SIZE; row += 1) {
      if (!isCellOccupied(board[row][col])) {
        colFull = false;
        break;
      }
    }
    if (colFull) {
      fullCols.push(col);
      for (let row = 0; row < BOARD_SIZE; row += 1) {
        clearKeys.add(`${row},${col}`);
      }
    }
  }

  // 3. Completed 3x3 Sudoku Sub-Grids (9 cells)
  for (let boxRow = 0; boxRow < SUBGRID_SIZE; boxRow += 1) {
    for (let boxCol = 0; boxCol < SUBGRID_SIZE; boxCol += 1) {
      let boxFull = true;
      const startRow = boxRow * SUBGRID_SIZE;
      const startCol = boxCol * SUBGRID_SIZE;
      for (let dr = 0; dr < SUBGRID_SIZE && boxFull; dr += 1) {
        for (let dc = 0; dc < SUBGRID_SIZE; dc += 1) {
          if (!isCellOccupied(board[startRow + dr][startCol + dc])) {
            boxFull = false;
            break;
          }
        }
      }
      if (boxFull) {
        fullBoxes.push({ boxRow, boxCol });
        for (let dr = 0; dr < SUBGRID_SIZE; dr += 1) {
          for (let dc = 0; dc < SUBGRID_SIZE; dc += 1) {
            clearKeys.add(`${startRow + dr},${startCol + dc}`);
          }
        }
      }
    }
  }

  return {
    fullRows,
    fullCols,
    fullBoxes,
    groupsClearedCount: fullRows.length + fullCols.length + fullBoxes.length,
    clearKeys,
  };
}

/**
 * Pure read-only preview: computes all board coordinates ("row,col") belonging to
 * rows, columns, or 3x3 sub-grids that would complete if `placementCells` drop,
 * mapped to their staggered wave step distance from the placed piece footprint.
 */
function getAnticipatedClearWaves(
  board: BoardState,
  placementCells: readonly GridCoord[]
): Map<string, number> {
  const clearKeys = new Set<string>();
  const clearWaveSteps = new Map<string, number>();
  if (placementCells.length === 0) return clearWaveSteps;

  const hoverKeys = new Set<string>();
  const touchedRows = new Set<number>();
  const touchedCols = new Set<number>();
  const touchedBoxes = new Set<number>();

  for (let i = 0; i < placementCells.length; i += 1) {
    const { row, col } = placementCells[i];
    hoverKeys.add(`${row},${col}`);
    touchedRows.add(row);
    touchedCols.add(col);
    touchedBoxes.add(
      Math.floor(row / SUBGRID_SIZE) * SUBGRID_SIZE +
      Math.floor(col / SUBGRID_SIZE)
    );
  }

  const isFilledAfterHover = (r: number, c: number): boolean =>
    isCellOccupied(board[r][c]) || hoverKeys.has(`${r},${c}`);

  touchedRows.forEach((row) => {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      if (!isFilledAfterHover(row, col)) return;
    }
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      clearKeys.add(`${row},${col}`);
    }
  });

  touchedCols.forEach((col) => {
    for (let row = 0; row < BOARD_SIZE; row += 1) {
      if (!isFilledAfterHover(row, col)) return;
    }
    for (let row = 0; row < BOARD_SIZE; row += 1) {
      clearKeys.add(`${row},${col}`);
    }
  });

  touchedBoxes.forEach((boxIdx) => {
    const startRow = Math.floor(boxIdx / SUBGRID_SIZE) * SUBGRID_SIZE;
    const startCol = (boxIdx % SUBGRID_SIZE) * SUBGRID_SIZE;
    for (let dr = 0; dr < SUBGRID_SIZE; dr += 1) {
      for (let dc = 0; dc < SUBGRID_SIZE; dc += 1) {
        if (!isFilledAfterHover(startRow + dr, startCol + dc)) return;
      }
    }
    for (let dr = 0; dr < SUBGRID_SIZE; dr += 1) {
      for (let dc = 0; dc < SUBGRID_SIZE; dc += 1) {
        clearKeys.add(`${startRow + dr},${startCol + dc}`);
      }
    }
  });

  if (clearKeys.size === 0) return clearWaveSteps;

  // Assign staggered outward wave step from the hovered piece footprint (Chebyshev distance)
  clearKeys.forEach((key) => {
    const [rStr, cStr] = key.split(",");
    const r = Number(rStr);
    const c = Number(cStr);
    let minStep = BOARD_SIZE;
    for (let i = 0; i < placementCells.length; i += 1) {
      const dist = Math.max(
        Math.abs(r - placementCells[i].row),
        Math.abs(c - placementCells[i].col)
      );
      if (dist < minStep) minStep = dist;
    }
    clearWaveSteps.set(key, minStep);
  });

  return clearWaveSteps;
}

/**
 * Checks if at least one remaining polyomino in the tray can fit
 * anywhere onto empty spaces of the 9x9 board.
 */
function hasAnyValidMove(
  board: BoardState,
  trayBlocks: readonly (PolyominoPiece | null)[]
): boolean {
  for (const piece of trayBlocks) {
    if (!piece) continue;
    const rows = piece.shape.length;
    const cols = piece.shape[0].length;
    for (let anchorRow = 0; anchorRow <= BOARD_SIZE - rows; anchorRow += 1) {
      for (let anchorCol = 0; anchorCol <= BOARD_SIZE - cols; anchorCol += 1) {
        if (canPlacePiece(board, piece.shape, anchorRow, anchorCol)) {
          return true;
        }
      }
    }
  }
  return false;
}

function cloneStableBoard(board: BoardState): BoardState {
  return board.map((row) =>
    row.map((cell) =>
      cell && !cell.isClearing ? { color: cell.color, isClearing: false } : null
    )
  );
}

function cloneTrayBlocks(
  trayBlocks: readonly (PolyominoPiece | null)[]
): (PolyominoPiece | null)[] {
  return trayBlocks.map((piece) =>
    piece
      ? {
        ...piece,
        shape: piece.shape.map((row) => [...row]),
      }
      : null
  );
}

/**
 * Deterministic player percentile curve based on final Block Sync score:
 * - Score < 1,000 => Top 80%+ (higher than ~8-20%)
 * - Score 2,000   => Top 50%  (higher than 50%)
 * - Score 5,000+  => Top 5%-1% (higher than 95%-99%)
 */
function calculateBlockSyncPercentile(score: number): {
  higherThanPercent: number;
  topPercent: number;
} {
  const safe = Math.max(0, score);
  let higherThanPercent: number;

  if (safe === 0) {
    higherThanPercent = 5;
  } else if (safe < 1000) {
    higherThanPercent = Math.round(8 + (safe / 1000) * 12);
  } else if (safe <= 2000) {
    higherThanPercent = Math.round(20 + ((safe - 1000) / 1000) * 30);
  } else if (safe <= 5000) {
    higherThanPercent = Math.round(50 + ((safe - 2000) / 3000) * 45);
  } else {
    higherThanPercent = Math.min(99, Math.round(95 + ((safe - 5000) / 4000) * 4));
  }

  return {
    higherThanPercent,
    topPercent: Math.max(1, 100 - higherThanPercent),
  };
}

function measureBoardMetrics(boardEl: HTMLDivElement): BoardMetrics {
  const rect = boardEl.getBoundingClientRect();
  const computed = window.getComputedStyle(boardEl);
  const parsedGap = parseFloat(computed.columnGap || computed.gap || "4");
  const gapPx = Number.isFinite(parsedGap) ? parsedGap : 4;
  const cellSize = Math.max(
    24,
    (rect.width - (BOARD_SIZE - 1) * gapPx) / BOARD_SIZE
  );
  return { cellSize, gapPx };
}

function measureTraySlotMetrics(trayEl: HTMLElement): TraySlotMetrics {
  const rect = trayEl.getBoundingClientRect();
  const computed = window.getComputedStyle(trayEl);
  const padX =
    (parseFloat(computed.paddingLeft || "0") || 0) +
    (parseFloat(computed.paddingRight || "0") || 0);
  const padY =
    (parseFloat(computed.paddingTop || "0") || 0) +
    (parseFloat(computed.paddingBottom || "0") || 0);
  const flexGap = parseFloat(computed.columnGap || computed.gap || "8") || 8;
  const slotWidth = Math.max(
    64,
    (rect.width - padX - flexGap * (TRAY_SLOT_COUNT - 1)) / TRAY_SLOT_COUNT
  );
  const slotHeight = Math.max(64, rect.height - padY);
  return { slotWidth, slotHeight };
}

function getTrayPieceRawDimensions(
  shape: PolyominoMatrix,
  baseCellPx: number,
  baseGapPx: number
): { rawWidth: number; rawHeight: number } {
  const rows = shape.length;
  const cols = shape[0].length;
  return {
    rawWidth: cols * baseCellPx + Math.max(0, cols - 1) * baseGapPx,
    rawHeight: rows * baseCellPx + Math.max(0, rows - 1) * baseGapPx,
  };
}

/**
 * Dynamically computes scale so every polyomino — including 5-Straight Maha Line
 * and 3x3 Boss Block — fits neatly inside its flex slot without overflow.
 */
function getTrayPieceScale(
  shape: PolyominoMatrix,
  baseCellPx: number,
  baseGapPx: number,
  slotMetrics: TraySlotMetrics
): number {
  const { rawWidth, rawHeight } = getTrayPieceRawDimensions(
    shape,
    baseCellPx,
    baseGapPx
  );
  const availWidth = Math.max(48, slotMetrics.slotWidth - 14);
  const availHeight = Math.max(48, slotMetrics.slotHeight - 12);
  const fitScale = Math.min(
    availWidth / Math.max(1, rawWidth),
    availHeight / Math.max(1, rawHeight)
  );
  return Math.min(0.62, Math.max(0.24, fitScale));
}

function getDragVisualCenter(drag: ActiveDragState): { x: number; y: number } {
  // Lift piece above fingertip on touch devices so target cells stay visible
  const touchLiftOffset =
    drag.pointerType === "touch" ? Math.max(48, drag.boardCellPitch * 1.25) : 0;
  return {
    x: drag.clientX,
    y: drag.clientY - touchLiftOffset,
  };
}

function resolveGridPlacement(
  drag: ActiveDragState,
  boardRect: DOMRect,
  board: BoardState
): { anchorRow: number; anchorCol: number; cells: GridCoord[] } | null {
  if (boardRect.width <= 0 || boardRect.height <= 0) return null;

  const { shape } = drag.piece;
  const rows = shape.length;
  const cols = shape[0].length;
  const stepX = boardRect.width / BOARD_SIZE;
  const stepY = boardRect.height / BOARD_SIZE;

  const { x: centerX, y: centerY } = getDragVisualCenter(drag);
  const pieceTopLeftX = centerX - (cols * stepX) / 2;
  const pieceTopLeftY = centerY - (rows * stepY) / 2;

  const anchorCol = Math.round((pieceTopLeftX - boardRect.left) / stepX);
  const anchorRow = Math.round((pieceTopLeftY - boardRect.top) / stepY);

  if (!canPlacePiece(board, shape, anchorRow, anchorCol)) {
    return null;
  }

  return {
    anchorRow,
    anchorCol,
    cells: getPlacedCellCoords(shape, anchorRow, anchorCol),
  };
}

let sharedBlocksAudioCtx: AudioContext | null = null;
let sharedBlocksMasterGain: GainNode | null = null;

function getBlocksAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!sharedBlocksAudioCtx) {
      const AudioCtx =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return null;
      const ctx = new AudioCtx();
      const masterGain = ctx.createGain();
      masterGain.gain.value = 0.85;

      // Master bus soft compressor prevents multi-note marimba clipping on loud speakers
      if (typeof ctx.createDynamicsCompressor === "function") {
        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(-14, ctx.currentTime);
        compressor.knee.setValueAtTime(16, ctx.currentTime);
        compressor.ratio.setValueAtTime(4, ctx.currentTime);
        compressor.attack.setValueAtTime(0.003, ctx.currentTime);
        compressor.release.setValueAtTime(0.14, ctx.currentTime);
        masterGain.connect(compressor);
        compressor.connect(ctx.destination);
      } else {
        masterGain.connect(ctx.destination);
      }

      sharedBlocksAudioCtx = ctx;
      sharedBlocksMasterGain = masterGain;
    }
    if (sharedBlocksAudioCtx.state === "suspended") {
      void sharedBlocksAudioCtx.resume();
    }
    return sharedBlocksAudioCtx;
  } catch {
    return null;
  }
}

function getBlocksAudioOutput(ctx: AudioContext): AudioNode {
  return sharedBlocksMasterGain ?? ctx.destination;
}

/**
 * Generates a subtle, soft matte silicone pickup cue when lifting a piece from the tray.
 */
function playSiliconeLiftSound(soundEnabled = true): void {
  if (!soundEnabled || getSettings().soundEffects === false) return;
  const ctx = getBlocksAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const output = getBlocksAudioOutput(ctx);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(360, now + 0.042);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.1, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.048);

    osc.connect(gain);
    gain.connect(output);
    osc.start(now);
    osc.stop(now + 0.052);

    const airOsc = ctx.createOscillator();
    const airFilter = ctx.createBiquadFilter();
    const airGain = ctx.createGain();
    airOsc.type = "triangle";
    airOsc.frequency.setValueAtTime(440, now);
    airOsc.frequency.exponentialRampToValueAtTime(580, now + 0.028);

    airFilter.type = "lowpass";
    airFilter.frequency.setValueAtTime(760, now);

    airGain.gain.setValueAtTime(0.0001, now);
    airGain.gain.linearRampToValueAtTime(0.035, now + 0.004);
    airGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.032);

    airOsc.connect(airFilter);
    airFilter.connect(airGain);
    airGain.connect(output);
    airOsc.start(now);
    airOsc.stop(now + 0.036);
  } catch { }
}

/**
 * Generates a subtle downward silicone cushion settle cue when a piece returns to tray.
 */
function playSiliconeReturnSound(soundEnabled = true): void {
  if (!soundEnabled || getSettings().soundEffects === false) return;
  const ctx = getBlocksAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const output = getBlocksAudioOutput(ctx);

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(145, now + 0.055);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(520, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.09, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.062);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(output);
    osc.start(now);
    osc.stop(now + 0.068);
  } catch { }
}

/**
 * Generates a balanced, crisp low-frequency sine/triangle burst for a tactile
 * matte silicone block placement thud.
 */
function playSiliconeThudSound(soundEnabled = true, isDucked = false): void {
  if (!soundEnabled || getSettings().soundEffects === false) return;
  const ctx = getBlocksAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const output = getBlocksAudioOutput(ctx);
    const duckMultiplier = isDucked ? 0.68 : 1;

    // Warm low-end silicone body thud calibrated for phone & laptop speakers
    const bodyOsc = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    bodyOsc.type = "sine";
    bodyOsc.frequency.setValueAtTime(175, now);
    bodyOsc.frequency.exponentialRampToValueAtTime(70, now + 0.088);

    bodyGain.gain.setValueAtTime(0.0001, now);
    bodyGain.gain.linearRampToValueAtTime(0.38 * duckMultiplier, now + 0.006);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(output);
    bodyOsc.start(now);
    bodyOsc.stop(now + 0.11);

    // Crisp muted triangle transient through lowpass for silicone cushion snap
    const tapOsc = ctx.createOscillator();
    const tapFilter = ctx.createBiquadFilter();
    const tapGain = ctx.createGain();
    tapOsc.type = "triangle";
    tapOsc.frequency.setValueAtTime(240, now);
    tapOsc.frequency.exponentialRampToValueAtTime(105, now + 0.05);

    tapFilter.type = "lowpass";
    tapFilter.frequency.setValueAtTime(420, now);

    tapGain.gain.setValueAtTime(0.0001, now);
    tapGain.gain.linearRampToValueAtTime(0.2 * duckMultiplier, now + 0.004);
    tapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

    tapOsc.connect(tapFilter);
    tapFilter.connect(tapGain);
    tapGain.connect(output);
    tapOsc.start(now);
    tapOsc.stop(now + 0.065);
  } catch { }
}

/**
 * Generates a warm, low-pass filtered ascending clear chime when Sudoku rows, columns,
 * or 3x3 sub-grids clear, scaling cleanly with lines/boxes cleared without harsh partials.
 */
function playMarimbaClearSound(
  comboCount = 1,
  streakCount = 1,
  soundEnabled = true
): void {
  if (!soundEnabled || getSettings().soundEffects === false) return;
  const ctx = getBlocksAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime + 0.02;
    const output = getBlocksAudioOutput(ctx);
    const effectiveCombo = Math.max(1, comboCount);
    const effectiveStreak = Math.max(1, streakCount);

    const clearFilter = ctx.createBiquadFilter();
    clearFilter.type = "lowpass";
    clearFilter.frequency.setValueAtTime(2100, now);
    clearFilter.Q.setValueAtTime(0.65, now);
    clearFilter.connect(output);

    const baseNotes =
      effectiveCombo >= 3
        ? [523.25, 659.25, 783.99, 987.77, 1046.5, 1318.51]
        : effectiveCombo === 2 || effectiveStreak >= 2
          ? [523.25, 659.25, 783.99, 987.77, 1046.5]
          : [523.25, 659.25, 783.99, 987.77];

    // Gentle semitone lift on consecutive clear streaks (capped at +4 semitones)
    const pitchMultiplier = Math.pow(
      2,
      Math.min(effectiveStreak - 1, 4) / 12
    );
    const noteGainPeak = Math.max(0.16, 0.23 - baseNotes.length * 0.01);

    baseNotes.forEach((rawFreq, idx) => {
      const freq = rawFreq * pitchMultiplier;
      const start = now + idx * 0.05;
      const osc = ctx.createOscillator();
      const shimmer = ctx.createOscillator();
      const gain = ctx.createGain();
      const shimmerGain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);

      shimmer.type = "sine";
      shimmer.frequency.setValueAtTime(freq * 2, start);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(noteGainPeak, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.28);

      shimmerGain.gain.setValueAtTime(0.0001, start);
      shimmerGain.gain.linearRampToValueAtTime(0.028, start + 0.008);
      shimmerGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.14);

      osc.connect(gain);
      shimmer.connect(shimmerGain);
      shimmerGain.connect(gain);
      gain.connect(clearFilter);

      osc.start(start);
      shimmer.start(start);
      osc.stop(start + 0.3);
      shimmer.stop(start + 0.16);
    });
  } catch { }
}

interface ActiveSustainedAudioVoice {
  gain: GainNode;
  oscs: OscillatorNode[];
}

const activeSustainedBlocksVoices = new Set<ActiveSustainedAudioVoice>();

function stopSustainedBlocksAudio(fadeSeconds = 0.05): void {
  const ctx = sharedBlocksAudioCtx;
  if (!ctx) {
    activeSustainedBlocksVoices.clear();
    return;
  }
  const now = ctx.currentTime;
  activeSustainedBlocksVoices.forEach((voice) => {
    try {
      voice.gain.gain.cancelScheduledValues(now);
      const currentVal = Math.max(0.0001, voice.gain.gain.value || 0.0001);
      voice.gain.gain.setValueAtTime(currentVal, now);
      voice.gain.gain.exponentialRampToValueAtTime(0.0001, now + fadeSeconds);
      voice.oscs.forEach((osc) => {
        try {
          osc.stop(now + fadeSeconds + 0.015);
        } catch { }
      });
    } catch { }
  });
  activeSustainedBlocksVoices.clear();
}

/**
 * Short fire-and-forget 2-note Zen shimmer when crossing previous best mid-game.
 */
function playMidGameBestShimmerSound(soundEnabled = true): void {
  if (!soundEnabled || getSettings().soundEffects === false) return;
  const ctx = getBlocksAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const output = getBlocksAudioOutput(ctx);
    const notes = [783.99, 1174.66]; // G5 -> D6

    notes.forEach((freq, idx) => {
      const start = now + idx * 0.075;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(2400, start);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(0.16, start + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.24);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(output);
      osc.start(start);
      osc.stop(start + 0.26);
    });
  } catch { }
}

/**
 * Short fire-and-forget 2-note descending silicone-marimba sigh on Out of Moves.
 */
function playOutOfMovesSighSound(soundEnabled = true): void {
  if (!soundEnabled || getSettings().soundEffects === false) return;
  const ctx = getBlocksAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const output = getBlocksAudioOutput(ctx);
    const notes = [329.63, 246.94]; // E4 -> B3

    notes.forEach((freq, idx) => {
      const start = now + idx * 0.105;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.96, start + 0.16);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(980, start);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(0.17, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.19);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(output);
      osc.start(start);
      osc.stop(start + 0.21);
    });
  } catch { }
}

/**
 * Short fire-and-forget UI tap cue for Play Again / Back to Home actions.
 */
function playModalTapSound(
  variant: "playAgain" | "backHome",
  soundEnabled = true
): void {
  if (!soundEnabled || getSettings().soundEffects === false) return;
  const ctx = getBlocksAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const output = getBlocksAudioOutput(ctx);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    if (variant === "playAgain") {
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.exponentialRampToValueAtTime(460, now + 0.055);
    } else {
      osc.frequency.setValueAtTime(290, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.06);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    osc.connect(gain);
    gain.connect(output);
    osc.start(now);
    osc.stop(now + 0.13);
  } catch { }
}

/**
 * Repeating soft score count-up tick (+3% rising pitch per tick) with fade-out protection.
 */
function playScoreCountTickSound(tickIndex: number, soundEnabled = true): void {
  if (!soundEnabled || getSettings().soundEffects === false) return;
  const ctx = getBlocksAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const output = getBlocksAudioOutput(ctx);
    const freq = 520 * Math.min(1.85, Math.pow(1.03, tickIndex));

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.055, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

    const voice: ActiveSustainedAudioVoice = { gain, oscs: [osc] };
    activeSustainedBlocksVoices.add(voice);
    osc.onended = () => {
      activeSustainedBlocksVoices.delete(voice);
    };

    osc.connect(gain);
    gain.connect(output);
    osc.start(now);
    osc.stop(now + 0.05);
  } catch { }
}

/**
 * Sustained 3-note ascending New Best Zen chord with 50ms interruption fade protection.
 */
function playNewBestChordSound(soundEnabled = true): void {
  if (!soundEnabled || getSettings().soundEffects === false) return;
  const ctx = getBlocksAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const output = getBlocksAudioOutput(ctx);
    const notes = [523.25, 659.25, 783.99]; // C5 - E5 - G5

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2200, now);
    filter.Q.setValueAtTime(0.65, now);
    filter.connect(output);

    notes.forEach((freq, idx) => {
      const start = now + idx * 0.07;
      const osc = ctx.createOscillator();
      const shimmer = ctx.createOscillator();
      const voiceGain = ctx.createGain();
      const shimmerGain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);

      shimmer.type = "sine";
      shimmer.frequency.setValueAtTime(freq * 2, start);

      voiceGain.gain.setValueAtTime(0.0001, start);
      voiceGain.gain.linearRampToValueAtTime(0.16, start + 0.012);
      voiceGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.48);

      shimmerGain.gain.setValueAtTime(0.0001, start);
      shimmerGain.gain.linearRampToValueAtTime(0.025, start + 0.01);
      shimmerGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);

      const voice: ActiveSustainedAudioVoice = {
        gain: voiceGain,
        oscs: [osc, shimmer],
      };
      activeSustainedBlocksVoices.add(voice);
      osc.onended = () => {
        activeSustainedBlocksVoices.delete(voice);
      };

      osc.connect(voiceGain);
      shimmer.connect(shimmerGain);
      shimmerGain.connect(voiceGain);
      voiceGain.connect(filter);

      osc.start(start);
      shimmer.start(start);
      osc.stop(start + 0.5);
      shimmer.stop(start + 0.24);
    });
  } catch { }
}

/**
 * Soft silicone double-tick cue fired on Time Rush completed minute / 1:00 marks.
 */
function playRushMinuteMarkerSound(soundEnabled = true): void {
  if (!soundEnabled || getSettings().soundEffects === false) return;
  const ctx = getBlocksAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const output = getBlocksAudioOutput(ctx);
    [784, 987.77].forEach((freq, idx) => {
      const start = now + idx * 0.085;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(0.075, start + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.065);

      osc.connect(gain);
      gain.connect(output);
      osc.start(start);
      osc.stop(start + 0.07);
    });
  } catch { }
}

/**
 * Crisp tactile Time Rush final-15s per-second tick (gently stepping pitch up on final 5s).
 */
function playRushFinalTickSound(remainingSec: number, soundEnabled = true): void {
  if (!soundEnabled || getSettings().soundEffects === false) return;
  const ctx = getBlocksAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const output = getBlocksAudioOutput(ctx);
    const freq = remainingSec <= 5 ? 740 + (5 - remainingSec) * 75 : 640;
    const peakGain = remainingSec <= 5 ? 0.095 : 0.062;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(peakGain, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.048);

    osc.connect(gain);
    gain.connect(output);
    osc.start(now);
    osc.stop(now + 0.055);
  } catch { }
}

/**
 * Decisive soft chime on 0:00 Time's Up expiration.
 */
function playRushTimeUpChimeSound(soundEnabled = true): void {
  if (!soundEnabled || getSettings().soundEffects === false) return;
  const ctx = getBlocksAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const output = getBlocksAudioOutput(ctx);
    [523.25, 392.0].forEach((freq, idx) => {
      const start = now + idx * 0.06;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(0.12, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.34);

      osc.connect(gain);
      gain.connect(output);
      osc.start(start);
      osc.stop(start + 0.36);
    });
  } catch { }
}

/**
 * Bright positive Zen silicone chime for #2 / #3 Podium finishes (#1 uses playNewBestChordSound fanfare).
 */
function playPodiumChimeSound(rank: number, soundEnabled = true): void {
  if (rank <= 1) {
    playNewBestChordSound(soundEnabled);
    return;
  }
  if (!soundEnabled || getSettings().soundEffects === false) return;
  const ctx = getBlocksAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const output = getBlocksAudioOutput(ctx);
    [523.25, 659.25].forEach((freq, idx) => {
      const start = now + idx * 0.075;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(0.13, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.36);

      osc.connect(gain);
      gain.connect(output);
      osc.start(start);
      osc.stop(start + 0.38);
    });
  } catch { }
}

/**
 * Fire-and-forget Block Sync settings/history UI audio cues with ±3% pitch variation.
 */
function playBlockSyncSettingsUiSound(
  cue: BlockSyncSettingsAudioCue,
  soundEnabled = true
): void {
  if (!soundEnabled || getSettings().soundEffects === false) return;
  const ctx = getBlocksAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const output = getBlocksAudioOutput(ctx);
    const microShift = 0.97 + Math.random() * 0.06; // ±3% organic micro-variation

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";

    if (cue === "toggleOn" || cue === "open") {
      const f0 = (cue === "open" ? 360 : 410) * microShift;
      const f1 = (cue === "open" ? 500 : 590) * microShift;
      osc.frequency.setValueAtTime(f0, now);
      osc.frequency.exponentialRampToValueAtTime(f1, now + 0.055);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.11, now + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.085);
      osc.connect(gain);
      gain.connect(output);
      osc.start(now);
      osc.stop(now + 0.095);
    } else if (cue === "toggleOff" || cue === "close") {
      const f0 = (cue === "close" ? 420 : 470) * microShift;
      const f1 = (cue === "close" ? 280 : 320) * microShift;
      osc.frequency.setValueAtTime(f0, now);
      osc.frequency.exponentialRampToValueAtTime(f1, now + 0.058);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.085);
      osc.connect(gain);
      gain.connect(output);
      osc.start(now);
      osc.stop(now + 0.095);
    } else if (cue === "replayConfirm") {
      const notes = [440 * microShift, 659.25 * microShift];
      notes.forEach((freq, idx) => {
        const start = now + idx * 0.05;
        const nOsc = ctx.createOscillator();
        const nGain = ctx.createGain();
        nOsc.type = "sine";
        nOsc.frequency.setValueAtTime(freq, start);
        nGain.gain.setValueAtTime(0.0001, start);
        nGain.gain.linearRampToValueAtTime(0.13, start + 0.006);
        nGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.14);
        nOsc.connect(nGain);
        nGain.connect(output);
        nOsc.start(start);
        nOsc.stop(start + 0.15);
      });
    } else {
      // Soft row tap
      osc.frequency.setValueAtTime(370 * microShift, now);
      osc.frequency.exponentialRampToValueAtTime(440 * microShift, now + 0.036);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.09, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.065);
      osc.connect(gain);
      gain.connect(output);
      osc.start(now);
      osc.stop(now + 0.075);
    }
  } catch { }
}

type BlockSyncHapticKind =
  | "light"
  | "medium"
  | "combo"
  | "success"
  | "success-double"
  | "warning";

function triggerBlockSyncHaptic(kind: BlockSyncHapticKind): void {
  if (!isHapticsEnabled() || getSettings().vibrations === false) return;
  try {
    if (Capacitor.isNativePlatform()) {
      if (kind === "light") {
        void Haptics.impact({ style: ImpactStyle.Light }).catch(() => { });
      } else if (kind === "medium" || kind === "combo") {
        void Haptics.impact({ style: ImpactStyle.Medium }).catch(() => { });
      } else if (kind === "success") {
        void Haptics.notification({ type: NotificationType.Success }).catch(() => { });
      } else if (kind === "success-double") {
        void Haptics.notification({ type: NotificationType.Success }).catch(() => { });
        window.setTimeout(() => {
          void Haptics.notification({ type: NotificationType.Success }).catch(() => { });
        }, 120);
      } else if (kind === "warning") {
        void Haptics.notification({ type: NotificationType.Warning }).catch(() => { });
      }
      return;
    }

    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      if (kind === "light") navigator.vibrate(10);
      else if (kind === "medium") navigator.vibrate(24);
      else if (kind === "combo") navigator.vibrate([12, 34, 18]);
      else if (kind === "success") navigator.vibrate(18);
      else if (kind === "success-double") navigator.vibrate([16, 48, 28]);
      else if (kind === "warning") navigator.vibrate([24, 36, 18]);
    }
  } catch { }
}

function triggerHapticSnap(isCombo = false): void {
  triggerBlockSyncHaptic(isCombo ? "combo" : "light");
}

function checkBlockSyncReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Block Sync (/blocks) — Zen 9x9 Sudoku-Block Hybrid.
 * Phase 2.1 locks Spawner Tray overflow auto-scaling for all 12 shapes across 5 pastel
 * families, calibrated deep charcoal Dark Mode contrast, board action bar, Web Audio
 * synthesis, Vault persistence, and interactive "How to Play" tutorial.
 */
export const BlockSyncGame: React.FC<BlockSyncGameProps> = ({
  darkMode,
  uid,
  soundEffects,
  vibrations,
  language,
  isSettingsOpen = false,
  onCloseSettings,
  onToggleSoundEffects,
  onToggleVibrations,
  onLanguageChange,
  onBackHome,
  onOpenMoreGames,
  onOpenMultiplayer,
  multiplayerRoom = null,
  roomStandings,
  onSubmitRoomResult,
  onLeaveMultiplayerRoom,
}) => {
  const { t } = useTranslation();
  const tRef = useRef(t);
  tRef.current = t;
  const isRoomMode = Boolean(multiplayerRoom);
  const isUndoAllowed = !multiplayerRoom || multiplayerRoom.undoAllowed;

  const initialSessionRef = useRef<BlocksSavedSession | null | undefined>(undefined);
  const initialPendingRoomRef = useRef<BlockSyncPendingRoomSession | null | undefined>(undefined);
  if (initialSessionRef.current === undefined) {
    if (multiplayerRoom) {
      // Never load or overwrite Solo saved session while inside a multiplayer room
      initialSessionRef.current = null;
      const candidateRoom = getPendingBlocksRoomSession(uid, multiplayerRoom.roomCode);
      initialPendingRoomRef.current =
        candidateRoom &&
          candidateRoom.config.roomSeed === multiplayerRoom.roomSeed &&
          candidateRoom.config.mode === multiplayerRoom.mode
          ? candidateRoom
          : null;
    } else {
      initialPendingRoomRef.current = null;
      const candidate = loadBlocksSavedSession(uid);
      initialSessionRef.current =
        candidate &&
          candidate.boardState.every((row) =>
            row.every((cell) => !cell || cell.color in PASTEL_TILE_CLASSES_LIGHT)
          ) &&
          candidate.currentBlocks.every((p) => !p || p.color in PASTEL_TILE_CLASSES_LIGHT)
          ? candidate
          : null;
    }
  }
  const restoredSession = initialSessionRef.current;
  const restoredPendingRoom = initialPendingRoomRef.current ?? null;

  const restoreBoardFromPending = (rawBoard: (string | null)[][]): BoardState =>
    rawBoard.map((row) =>
      row.map((cellColor) =>
        cellColor && cellColor in PASTEL_TILE_CLASSES_LIGHT
          ? { color: cellColor as PastelColorKey }
          : null
      )
    );

  const restoreTrayFromPending = (
    slots: Array<BlockSyncPendingRoomTraySlot | null>,
    roomSeed?: number,
    trayIndex?: number
  ): (PolyominoPiece | null)[] => {
    const mapped = slots.map((slot) => {
      if (!slot) return null;
      const color = (
        slot.colorKey in PASTEL_TILE_CLASSES_LIGHT ? slot.colorKey : "sky"
      ) as PastelColorKey;
      return {
        uid: slot.id,
        shapeId: slot.shapeId as BlockShapeId,
        variantId: slot.id,
        shape: slot.cells.map((row) => row.map((v) => (v ? 1 : 0) as 0 | 1)),
        color,
      };
    });
    if (mapped.every((s) => s === null) && typeof roomSeed === "number") {
      return generateSeededBlockTray(roomSeed, trayIndex ?? 0);
    }
    return mapped;
  };

  const [boardState, setBoardState] = useState<BoardState>(() => {
    if (restoredSession) {
      return cloneStableBoard(restoredSession.boardState as BoardState);
    }
    if (restoredPendingRoom) {
      return restoreBoardFromPending(restoredPendingRoom.board);
    }
    return createEmptyBoard();
  });
  const [currentBlocks, setCurrentBlocks] = useState<(PolyominoPiece | null)[]>(() => {
    if (restoredSession) {
      return cloneTrayBlocks(restoredSession.currentBlocks as (PolyominoPiece | null)[]);
    }
    if (restoredPendingRoom && multiplayerRoom) {
      return restoreTrayFromPending(
        restoredPendingRoom.tray,
        multiplayerRoom.roomSeed,
        restoredPendingRoom.roomTrayIndex
      );
    }
    if (multiplayerRoom) {
      return generateSeededBlockTray(multiplayerRoom.roomSeed, 0);
    }
    return spawnThreeBlocks(0);
  });
  const reducedMotion = useMemo(() => checkBlockSyncReducedMotion(), []);
  const [score, setScore] = useState<number>(
    () => restoredSession?.score ?? restoredPendingRoom?.score ?? 0
  );
  const [bestScore, setBestScore] = useState<number>(() => loadBlocksVault(uid).bestScore);
  const [initialSessionBest, setInitialSessionBest] = useState<number>(
    () => loadBlocksVault(uid).bestScore
  );
  const [rushRemainingSec, setRushRemainingSec] = useState<number | null>(() => {
    if (multiplayerRoom?.mode !== "rush") return null;
    if (restoredPendingRoom?.rushEndAt) {
      return Math.max(0, Math.ceil((restoredPendingRoom.rushEndAt - Date.now()) / 1000));
    }
    return multiplayerRoom.timeLimitSec;
  });
  const [clearFeedback, setClearFeedback] = useState<ClearFeedback | null>(null);
  const [isBoardLockedBeat, setIsBoardLockedBeat] = useState<boolean>(false);
  const [midGameBestBanner, setMidGameBestBanner] = useState<{
    id: number;
    exiting: boolean;
  } | null>(null);
  const [milestoneRain, setMilestoneRain] = useState<{
    active: boolean;
    burstKey: number;
  }>({ active: false, burstKey: 0 });
  const [bestCardGoldPulse, setBestCardGoldPulse] = useState<boolean>(false);
  const [gameOverSummary, setGameOverSummary] = useState<GameOverSummary | null>(null);
  const [dragState, setDragState] = useState<ActiveDragState | null>(null);
  const [hoverCells, setHoverCells] = useState<GridCoord[]>([]);
  const [clearPreviewSteps, setClearPreviewSteps] = useState<Map<string, number>>(
    () => new Map()
  );
  const [hoverWaveSignature, setHoverWaveSignature] = useState<string>("");
  const lastHoverSignatureRef = useRef<string>("");
  const [boardMetrics, setBoardMetrics] = useState<BoardMetrics>({
    cellSize: TRAY_BASE_CELL_PX,
    gapPx: TRAY_BASE_GAP_PX,
  });
  const [traySlotMetrics, setTraySlotMetrics] = useState<TraySlotMetrics>({
    slotWidth: 96,
    slotHeight: 112,
  });

  const isGameOver = gameOverSummary !== null;

  const [localSoundOn, setLocalSoundOn] = useState<boolean>(
    () => soundEffects ?? getSettings().soundEffects !== false
  );
  const [localMusicOn, setLocalMusicOn] = useState<boolean>(
    () => getSettings().musicEnabled !== false
  );
  const [localVibrationsOn, setLocalVibrationsOn] = useState<boolean>(
    () => vibrations ?? isHapticsEnabled()
  );
  const soundOn = soundEffects !== undefined ? soundEffects : localSoundOn;
  const musicOn = localMusicOn;
  const vibrationsOn = vibrations !== undefined ? vibrations : localVibrationsOn;
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [tutorialStage, setTutorialStage] = useState<0 | 1 | 2 | 3>(0);
  const [canUndo, setCanUndo] = useState<boolean>(() =>
    Boolean(restoredSession && restoredSession.historyStack.length > 0)
  );

  // First-visit tutorial check (`block_sync_tutorial_seen`)
  useEffect(() => {
    try {
      if (localStorage.getItem(TUTORIAL_SEEN_KEY) !== "1") {
        localStorage.setItem(TUTORIAL_SEEN_KEY, "1");
        setShowTutorial(true);
      }
    } catch { }
  }, []);

  // Continuous 4-stage How-to-Play demo loop (Row -> Column -> 3x3 Box -> Combo x2)
  useEffect(() => {
    if (!showTutorial) return;
    setTutorialStage(0);
    if (reducedMotion || typeof window === "undefined") return;
    const intervalId = window.setInterval(() => {
      setTutorialStage((prev) => ((prev + 1) % 4) as 0 | 1 | 2 | 3);
    }, 2700);
    return () => window.clearInterval(intervalId);
  }, [showTutorial, reducedMotion]);

  const boardGridRef = useRef<HTMLDivElement | null>(null);
  const trayContainerRef = useRef<HTMLElement | null>(null);
  const trayPieceRefs = useRef<(HTMLDivElement | null)[]>([null, null, null]);
  const returnTimerRef = useRef<number | null>(null);
  const vanishTimersRef = useRef<Set<number>>(new Set());
  const feedbackTimerRef = useRef<number | null>(null);
  const clarityBeatTimerRef = useRef<number | null>(null);
  const midGameBannerTimerRef = useRef<number | null>(null);
  const midGameBannerExitTimerRef = useRef<number | null>(null);
  const milestoneRainTimerRef = useRef<number | null>(null);
  const bestPulseTimerRef = useRef<number | null>(null);
  const clearBatchSeqRef = useRef<number>(0);
  const feedbackSeqRef = useRef<number>(0);
  const midGameSeqRef = useRef<number>(0);
  const clearStreakRef = useRef<number>(restoredSession?.clearStreak ?? 0);
  const hasCrossedBestThisRunRef = useRef<boolean>(
    Boolean(
      initialSessionBest > 0 &&
        ((restoredSession && restoredSession.score > initialSessionBest) ||
          (restoredPendingRoom && restoredPendingRoom.score > initialSessionBest))
    )
  );
  const matchRecordedForCurrentRunRef = useRef<boolean>(false);
  const lastTrayShapeIdsRef = useRef<BlockShapeId[]>(
    restoredSession && restoredSession.lastTrayShapeIds.length > 0
      ? (restoredSession.lastTrayShapeIds as BlockShapeId[])
      : currentBlocks
        .filter((p): p is PolyominoPiece => p !== null)
        .map((p) => p.shapeId)
  );
  const historyStackRef = useRef<MoveSnapshot[]>(
    restoredSession
      ? restoredSession.historyStack.map((snap) => ({
        boardState: cloneStableBoard(snap.boardState as BoardState),
        currentBlocks: cloneTrayBlocks(snap.currentBlocks as (PolyominoPiece | null)[]),
        score: snap.score,
        clearStreak: snap.clearStreak,
        lastTrayShapeIds: [...snap.lastTrayShapeIds] as BlockShapeId[],
        roomTrayIndex: 0,
        linesCleared: 0,
        bestCombo: 0,
      }))
      : []
  );
  const stableBoardRef = useRef<BoardState>(
    restoredSession
      ? cloneStableBoard(restoredSession.boardState as BoardState)
      : restoredPendingRoom
        ? restoreBoardFromPending(restoredPendingRoom.board)
        : createEmptyBoard()
  );

  const roomTrayIndexRef = useRef<number>(restoredPendingRoom?.roomTrayIndex ?? 0);
  const linesClearedRef = useRef<number>(restoredPendingRoom?.linesCleared ?? 0);
  const bestComboRef = useRef<number>(restoredPendingRoom?.bestCombo ?? 0);
  const roomStartedAtRef = useRef<number>(restoredPendingRoom?.startedAt ?? Date.now());
  const roomSubmittedForCurrentRunRef = useRef<boolean>(false);
  const rushEndAtRef = useRef<number | null>(
    multiplayerRoom?.mode === "rush"
      ? (restoredPendingRoom?.rushEndAt ?? Date.now() + multiplayerRoom.timeLimitSec * 1000)
      : null
  );
  const [rushMinutePulse, setRushMinutePulse] = useState<boolean>(false);
  const rushMinutePulseTimerRef = useRef<number | null>(null);
  const lastRushWholeSecRef = useRef<number | null>(null);
  const lastRushMinuteMarkTriggeredRef = useRef<number | null>(null);

  const dragStateRef = useRef<ActiveDragState | null>(null);
  const boardStateRef = useRef<BoardState>(boardState);
  const currentBlocksRef = useRef<(PolyominoPiece | null)[]>(currentBlocks);
  const scoreRef = useRef<number>(score);
  const isGameOverRef = useRef<boolean>(isGameOver);
  const isBoardLockedBeatRef = useRef<boolean>(isBoardLockedBeat);
  const initialSessionBestRef = useRef<number>(initialSessionBest);
  const uidRef = useRef<string | null | undefined>(uid);
  const soundOnRef = useRef<boolean>(soundOn);
  const musicOnRef = useRef<boolean>(musicOn);
  const vibrationsOnRef = useRef<boolean>(vibrationsOn);
  const isSettingsOpenRef = useRef<boolean>(isSettingsOpen);
  const showTutorialRef = useRef<boolean>(showTutorial);
  const gameOverSummaryRef = useRef<GameOverSummary | null>(gameOverSummary);
  const endGameModalSettledRef = useRef<boolean>(false);
  const endGamePlayAgainTriggerRef = useRef<(() => void) | null>(null);
  const multiplayerRoomRef = useRef<BlockSyncRoomConfig | null>(multiplayerRoom);
  const roomStandingsRef = useRef<BlockSyncRoomStandingEntry[] | undefined>(roomStandings);
  const onSubmitRoomResultRef = useRef(onSubmitRoomResult);
  const onLeaveMultiplayerRoomRef = useRef(onLeaveMultiplayerRoom);
  const isUndoAllowedRef = useRef<boolean>(isUndoAllowed);

  dragStateRef.current = dragState;
  boardStateRef.current = boardState;
  currentBlocksRef.current = currentBlocks;
  scoreRef.current = score;
  isGameOverRef.current = isGameOver;
  isBoardLockedBeatRef.current = isBoardLockedBeat;
  initialSessionBestRef.current = initialSessionBest;
  uidRef.current = uid;
  soundOnRef.current = soundOn;
  musicOnRef.current = musicOn;
  vibrationsOnRef.current = vibrationsOn;
  isSettingsOpenRef.current = isSettingsOpen;
  showTutorialRef.current = showTutorial;
  gameOverSummaryRef.current = gameOverSummary;
  multiplayerRoomRef.current = multiplayerRoom;
  roomStandingsRef.current = roomStandings;
  onSubmitRoomResultRef.current = onSubmitRoomResult;
  onLeaveMultiplayerRoomRef.current = onLeaveMultiplayerRoom;
  isUndoAllowedRef.current = isUndoAllowed;

  const applySoundSetting = useCallback(
    (next: boolean, playBoardThud = false) => {
      soundOnRef.current = next;
      setLocalSoundOn(next);
      if (onToggleSoundEffects) {
        onToggleSoundEffects(next);
      } else {
        saveSettings({ soundEffects: next });
      }
      if (playBoardThud && next) {
        playSiliconeThudSound(true);
      }
    },
    [onToggleSoundEffects]
  );

  const handleToggleSound = useCallback(() => {
    applySoundSetting(!soundOnRef.current, true);
  }, [applySoundSetting]);

  const handleToggleMusic = useCallback(() => {
    const next = !musicOnRef.current;
    musicOnRef.current = next;
    setLocalMusicOn(next);
    saveSettings({ musicEnabled: next });
  }, []);

  const handleToggleVibrations = useCallback(() => {
    const next = !vibrationsOnRef.current;
    vibrationsOnRef.current = next;
    setLocalVibrationsOn(next);
    setGlobalHapticsEnabled(next);
    if (onToggleVibrations) {
      onToggleVibrations(next);
    } else {
      saveSettings({ vibrations: next, hapticVibrations: next });
    }
  }, [onToggleVibrations]);

  // Peer modal mutual exclusion: opening Settings auto-closes How to Play, and vice versa
  useEffect(() => {
    if (isSettingsOpen) {
      setShowTutorial(false);
    }
  }, [isSettingsOpen]);

  const openHowToPlayModal = useCallback(() => {
    if (isSettingsOpenRef.current) {
      onCloseSettings?.();
    }
    setShowTutorial(true);
  }, [onCloseSettings]);

  const toggleHowToPlayModal = useCallback(() => {
    setShowTutorial((prev) => {
      const next = !prev;
      if (next && isSettingsOpenRef.current) {
        onCloseSettings?.();
      }
      return next;
    });
  }, [onCloseSettings]);

  const isRunInProgress =
    score > 0 ||
    boardState.some((row) => row.some((cell) => cell !== null));

  const clearCelebrationTimers = useCallback(() => {
    if (clarityBeatTimerRef.current !== null) {
      window.clearTimeout(clarityBeatTimerRef.current);
      clarityBeatTimerRef.current = null;
    }
    if (midGameBannerTimerRef.current !== null) {
      window.clearTimeout(midGameBannerTimerRef.current);
      midGameBannerTimerRef.current = null;
    }
    if (midGameBannerExitTimerRef.current !== null) {
      window.clearTimeout(midGameBannerExitTimerRef.current);
      midGameBannerExitTimerRef.current = null;
    }
    if (milestoneRainTimerRef.current !== null) {
      window.clearTimeout(milestoneRainTimerRef.current);
      milestoneRainTimerRef.current = null;
    }
    if (bestPulseTimerRef.current !== null) {
      window.clearTimeout(bestPulseTimerRef.current);
      bestPulseTimerRef.current = null;
    }
    setMilestoneRain((prev) => (prev.active ? { ...prev, active: false } : prev));
  }, []);

  // Reload isolated vault whenever identity changes (Guest <-> Authenticated UID)
  useEffect(() => {
    clearCelebrationTimers();
    stopSustainedBlocksAudio(0.05);
    const vaultBest = loadBlocksVault(uid).bestScore;
    setBestScore(vaultBest);
    setInitialSessionBest(vaultBest);
    initialSessionBestRef.current = vaultBest;
    hasCrossedBestThisRunRef.current = false;
    matchRecordedForCurrentRunRef.current = false;
    setIsBoardLockedBeat(false);
    setMidGameBestBanner(null);
    setBestCardGoldPulse(false);
  }, [clearCelebrationTimers, uid]);

  const triggerMidGameBestCross = useCallback(() => {
    if (midGameBannerTimerRef.current !== null) {
      window.clearTimeout(midGameBannerTimerRef.current);
    }
    if (midGameBannerExitTimerRef.current !== null) {
      window.clearTimeout(midGameBannerExitTimerRef.current);
    }
    if (milestoneRainTimerRef.current !== null) {
      window.clearTimeout(milestoneRainTimerRef.current);
    }
    if (bestPulseTimerRef.current !== null) {
      window.clearTimeout(bestPulseTimerRef.current);
    }

    midGameSeqRef.current += 1;
    const burstId = midGameSeqRef.current;
    setMidGameBestBanner({ id: burstId, exiting: false });
    setMilestoneRain({ active: true, burstKey: burstId });
    setBestCardGoldPulse(true);
    playMidGameBestShimmerSound(soundOnRef.current);
    triggerBlockSyncHaptic("success");

    bestPulseTimerRef.current = window.setTimeout(() => {
      setBestCardGoldPulse(false);
      bestPulseTimerRef.current = null;
    }, 520);

    midGameBannerTimerRef.current = window.setTimeout(() => {
      midGameBannerTimerRef.current = null;
      setMidGameBestBanner((prev) => (prev ? { ...prev, exiting: true } : null));
      midGameBannerExitTimerRef.current = window.setTimeout(() => {
        midGameBannerExitTimerRef.current = null;
        setMidGameBestBanner(null);
      }, 240);
    }, 1920);

    milestoneRainTimerRef.current = window.setTimeout(() => {
      milestoneRainTimerRef.current = null;
      setMilestoneRain((prev) =>
        prev.burstKey === burstId && prev.active ? { ...prev, active: false } : prev
      );
    }, 3400);
  }, []);

  const tileClasses = darkMode
    ? PASTEL_TILE_CLASSES_DARK
    : PASTEL_TILE_CLASSES_LIGHT;

  const hoverCellSet = useMemo(() => {
    const keys = new Set<string>();
    for (const cell of hoverCells) {
      keys.add(`${cell.row},${cell.col}`);
    }
    return keys;
  }, [hoverCells]);

  const clearHoverPreview = useCallback(() => {
    if (lastHoverSignatureRef.current === "") return;
    lastHoverSignatureRef.current = "";
    setHoverWaveSignature("");
    setHoverCells([]);
    setClearPreviewSteps(new Map());
  }, []);

  const clearReturnTimer = useCallback(() => {
    if (returnTimerRef.current !== null) {
      window.clearTimeout(returnTimerRef.current);
      returnTimerRef.current = null;
    }
  }, []);

  const clearAllVanishTimers = useCallback(() => {
    vanishTimersRef.current.forEach((timerId) => {
      window.clearTimeout(timerId);
    });
    vanishTimersRef.current.clear();
  }, []);

  const clearFeedbackTimer = useCallback(() => {
    if (feedbackTimerRef.current !== null) {
      window.clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const boardEl = boardGridRef.current;
    const trayEl = trayContainerRef.current;
    if (!boardEl && !trayEl) return;

    const syncMetrics = () => {
      if (boardGridRef.current) {
        setBoardMetrics(measureBoardMetrics(boardGridRef.current));
      }
      if (trayContainerRef.current) {
        setTraySlotMetrics(measureTraySlotMetrics(trayContainerRef.current));
      }
    };
    syncMetrics();

    const observer = new ResizeObserver(syncMetrics);
    if (boardEl) observer.observe(boardEl);
    if (trayEl) observer.observe(trayEl);
    window.addEventListener("resize", syncMetrics);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", syncMetrics);
    };
  }, []);

  const persistActiveSession = useCallback(() => {
    if (isGameOverRef.current) return;

    const activeRoom = multiplayerRoomRef.current;
    if (activeRoom) {
      // Save per-room pending state in isolated room vault; NEVER touch Solo savedSession
      const boardSnapshot = stableBoardRef.current.map((row) =>
        row.map((cell) => (cell ? cell.color : null))
      );
      const traySlots: Array<BlockSyncPendingRoomTraySlot | null> =
        currentBlocksRef.current.map((piece) =>
          piece
            ? {
              id: piece.uid,
              shapeId: piece.shapeId,
              cells: piece.shape.map((r) => [...r]),
              colorKey: piece.color,
            }
            : null
        );
      savePendingBlocksRoomSession(uidRef.current, {
        config: activeRoom,
        board: boardSnapshot,
        tray: traySlots,
        roomTrayIndex: roomTrayIndexRef.current,
        score: scoreRef.current,
        linesCleared: linesClearedRef.current,
        bestCombo: bestComboRef.current,
        startedAt: roomStartedAtRef.current,
        ...(rushEndAtRef.current !== null ? { rushEndAt: rushEndAtRef.current } : {}),
        updatedAt: Date.now(),
      });
      return;
    }

    if (historyStackRef.current.length === 0 && scoreRef.current === 0) return;

    saveBlocksSavedSession(
      {
        boardState: cloneStableBoard(stableBoardRef.current),
        currentBlocks: cloneTrayBlocks(currentBlocksRef.current),
        score: scoreRef.current,
        clearStreak: clearStreakRef.current,
        lastTrayShapeIds: [...lastTrayShapeIdsRef.current],
        historyStack: historyStackRef.current.map((snap) => ({
          boardState: cloneStableBoard(snap.boardState),
          currentBlocks: cloneTrayBlocks(snap.currentBlocks),
          score: snap.score,
          clearStreak: snap.clearStreak,
          lastTrayShapeIds: [...snap.lastTrayShapeIds],
        })),
        updatedAt: Date.now(),
      },
      uidRef.current
    );
  }, []);

  useEffect(() => {
    const handlePageHide = () => {
      persistActiveSession();
    };
    const handleVisibilitySave = () => {
      if (document.visibilityState === "hidden") {
        persistActiveSession();
      }
    };
    window.addEventListener("pagehide", handlePageHide);
    document.addEventListener("visibilitychange", handleVisibilitySave);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("visibilitychange", handleVisibilitySave);
      persistActiveSession();
      stopSustainedBlocksAudio(0.05);
      clearCelebrationTimers();
      clearReturnTimer();
      clearAllVanishTimers();
      clearFeedbackTimer();
    };
  }, [
    clearAllVanishTimers,
    clearCelebrationTimers,
    clearFeedbackTimer,
    clearReturnTimer,
    persistActiveSession,
  ]);

  const finalizeGameOver = useCallback(
    (finalScore: number, endReason: "out_of_moves" | "time_up" = "out_of_moves") => {
      const activeRoom = multiplayerRoomRef.current;
      if (activeRoom) {
        clearPendingBlocksRoomSession(uidRef.current, activeRoom.roomCode);
      } else {
        clearBlocksSavedSession(uidRef.current);
      }
      setIsBoardLockedBeat(false);
      isBoardLockedBeatRef.current = false;
      const vaultOutcome = updateBlocksBestScore(finalScore, uidRef.current);
      setBestScore(vaultOutcome.bestScore);
      isGameOverRef.current = true;

      const boardSnapshot = stableBoardRef.current.map((row) =>
        row.map((cell) => (cell ? cell.color : null))
      );

      if (activeRoom && !roomSubmittedForCurrentRunRef.current) {
        roomSubmittedForCurrentRunRef.current = true;
        const elapsedSec = Math.max(
          0,
          Math.round((Date.now() - roomStartedAtRef.current) / 1000)
        );
        const durationSec =
          activeRoom.mode === "rush"
            ? Math.min(activeRoom.timeLimitSec, elapsedSec)
            : elapsedSec;

        onSubmitRoomResultRef.current?.({
          roomCode: activeRoom.roomCode,
          score: finalScore,
          linesCleared: linesClearedRef.current,
          bestCombo: bestComboRef.current,
          mode: activeRoom.mode,
          endReason,
          durationSec,
          boardSnapshot,
        });
      }

      const existingStandings = activeRoom ? roomStandingsRef.current || [] : [];
      const existingCompletedSelf = activeRoom
        ? existingStandings.find((entry) => entry.isSelf && !entry.statusLabel)
        : undefined;
      const previousSavedRoomScore = existingCompletedSelf
        ? existingCompletedSelf.score
        : null;
      const didImproveRoomScore = activeRoom
        ? previousSavedRoomScore === null || finalScore > previousSavedRoomScore
        : false;
      const savedRoomBestScore =
        activeRoom && previousSavedRoomScore !== null
          ? Math.max(previousSavedRoomScore, finalScore)
          : undefined;

      const mergedStandingsForHistory = activeRoom
        ? (() => {
          const list = existingStandings.map((entry) =>
            entry.isSelf
              ? {
                ...entry,
                score: Math.max(entry.score, finalScore),
                statusLabel: undefined,
              }
              : { ...entry }
          );
          if (!list.some((entry) => entry.isSelf)) {
            list.push({
              id: uidRef.current || "self",
              name: tRef.current("blocks_you"),
              score: finalScore,
              isSelf: true,
              statusLabel: undefined,
            });
          }
          list.sort((a, b) => {
            const aDone = !a.statusLabel;
            const bDone = !b.statusLabel;
            if (aDone !== bDone) return aDone ? -1 : 1;
            return b.score - a.score;
          });
          return list;
        })()
        : [];
      const selfOptimisticRank =
        mergedStandingsForHistory.findIndex((entry) => entry.isSelf) + 1;

      if (!matchRecordedForCurrentRunRef.current) {
        matchRecordedForCurrentRunRef.current = true;
        const percentile = calculateBlockSyncPercentile(finalScore).higherThanPercent;
        const mappedStandings: BlocksMatchStandingEntry[] | undefined =
          activeRoom && mergedStandingsForHistory.length > 0
            ? mergedStandingsForHistory.map((entry) => ({
              uid: entry.id,
              name: entry.name,
              score: entry.score,
              isCurrentUser: entry.isSelf,
            }))
            : undefined;

        recordBlocksMatchHistory(uidRef.current, {
          id: vaultOutcome.currentRunId,
          score: finalScore,
          bestAtTime: vaultOutcome.bestScore,
          isNewBest: vaultOutcome.isNewBest,
          percentile,
          mode: activeRoom ? "multiplayer" : "solo",
          ...(activeRoom ? { roomCode: activeRoom.roomCode } : {}),
          ...(mappedStandings ? { roomStandings: mappedStandings } : {}),
          boardSnapshot,
        });
      }

      const willCelebratePodium = Boolean(
        activeRoom &&
        didImproveRoomScore &&
        (selfOptimisticRank === 1 ||
          (selfOptimisticRank === 2 && mergedStandingsForHistory.length >= 2) ||
          (selfOptimisticRank === 3 && mergedStandingsForHistory.length >= 3))
      );

      if (!vaultOutcome.isNewBest && !willCelebratePodium && endReason !== "time_up") {
        playOutOfMovesSighSound(soundOnRef.current);
        triggerBlockSyncHaptic("warning");
      }
      const soloRuns: BlockSyncSoloRunEntry[] = vaultOutcome.topRuns.map((entry) => ({
        id: entry.id,
        score: entry.score,
        achievedAt: entry.achievedAt,
        isCurrent: entry.id === vaultOutcome.currentRunId,
        label:
          entry.id === vaultOutcome.currentRunId
            ? tRef.current("blocks_this_run")
            : entry.id.startsWith("legacy-best-")
              ? tRef.current("blocks_prior_best")
              : undefined,
      }));
      setGameOverSummary({
        finalScore,
        previousBestScore: vaultOutcome.previousBestScore,
        bestScore: vaultOutcome.bestScore,
        initialSessionBest: initialSessionBestRef.current,
        isNewBest: vaultOutcome.isNewBest,
        endReason,
        roomCode: activeRoom?.roomCode,
        savedRoomBestScore,
        didImproveRoomScore,
        soloRuns,
      });
    },
    []
  );

  // Wall-clock Time Rush countdown (`mode === "rush"`) + behavioral tension psychology
  useEffect(() => {
    if (!multiplayerRoom || multiplayerRoom.mode !== "rush" || isGameOver) {
      if (!multiplayerRoom || multiplayerRoom.mode !== "rush") {
        setRushRemainingSec(null);
        setRushMinutePulse(false);
        lastRushWholeSecRef.current = null;
        lastRushMinuteMarkTriggeredRef.current = null;
      }
      return;
    }

    if (rushEndAtRef.current === null) {
      rushEndAtRef.current = Date.now() + multiplayerRoom.timeLimitSec * 1000;
    }

    // Seed initial baseline second cleanly so mount doesn't false-fire minute mark at T=0
    if (lastRushWholeSecRef.current === null) {
      lastRushWholeSecRef.current = Math.ceil(
        Math.max(0, rushEndAtRef.current - Date.now()) / 1000
      );
    }

    const syncClock = () => {
      if (isGameOverRef.current || rushEndAtRef.current === null) return;
      const remainingMs = Math.max(0, rushEndAtRef.current - Date.now());
      const nextSec = Math.ceil(remainingMs / 1000);
      const prevSec = lastRushWholeSecRef.current;

      setRushRemainingSec((prev) => (prev === nextSec ? prev : nextSec));

      if (prevSec !== null && nextSec < prevSec) {
        // Check crossed whole-minute marks & final 1:00 threshold cleanly
        for (let s = prevSec - 1; s >= nextSec; s -= 1) {
          if (
            s > 0 &&
            s < multiplayerRoom.timeLimitSec &&
            s % 60 === 0 &&
            lastRushMinuteMarkTriggeredRef.current !== s
          ) {
            lastRushMinuteMarkTriggeredRef.current = s;
            setRushMinutePulse(true);
            if (rushMinutePulseTimerRef.current !== null) {
              window.clearTimeout(rushMinutePulseTimerRef.current);
            }
            rushMinutePulseTimerRef.current = window.setTimeout(() => {
              setRushMinutePulse(false);
              rushMinutePulseTimerRef.current = null;
            }, 340);
            playRushMinuteMarkerSound(soundOnRef.current);
          }
        }

        // Peak escalation in final 15s (gentle pitch step-up & light haptics in final 5s)
        if (nextSec >= 1 && nextSec <= 15) {
          playRushFinalTickSound(nextSec, soundOnRef.current);
          if (nextSec <= 5) {
            triggerBlockSyncHaptic("light");
          }
        }

        lastRushWholeSecRef.current = nextSec;
      }

      if (remainingMs <= 0) {
        isGameOverRef.current = true;
        if (rushMinutePulseTimerRef.current !== null) {
          window.clearTimeout(rushMinutePulseTimerRef.current);
          rushMinutePulseTimerRef.current = null;
        }
        setRushMinutePulse(false);
        if (clarityBeatTimerRef.current !== null) {
          window.clearTimeout(clarityBeatTimerRef.current);
          clarityBeatTimerRef.current = null;
        }
        clearReturnTimer();
        clearHoverPreview();
        dragStateRef.current = null;
        setDragState(null);
        setIsBoardLockedBeat(false);
        isBoardLockedBeatRef.current = false;
        playRushTimeUpChimeSound(soundOnRef.current);
        triggerBlockSyncHaptic("warning");
        finalizeGameOver(scoreRef.current, "time_up");
      }
    };

    syncClock();
    const intervalId = window.setInterval(syncClock, 250);
    const handleVisibilityOrFocus = () => syncClock();
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);
    window.addEventListener("focus", handleVisibilityOrFocus);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      window.removeEventListener("focus", handleVisibilityOrFocus);
      if (rushMinutePulseTimerRef.current !== null) {
        window.clearTimeout(rushMinutePulseTimerRef.current);
        rushMinutePulseTimerRef.current = null;
      }
    };
  }, [
    multiplayerRoom?.roomCode,
    multiplayerRoom?.mode,
    multiplayerRoom?.timeLimitSec,
    isGameOver,
    clearHoverPreview,
    clearReturnTimer,
    finalizeGameOver,
  ]);

  const handlePlayAgain = useCallback(() => {
    const activeRoom = multiplayerRoomRef.current;
    stopSustainedBlocksAudio(0.05);
    clearCelebrationTimers();
    clearReturnTimer();
    clearAllVanishTimers();
    clearFeedbackTimer();
    if (!activeRoom) {
      clearBlocksSavedSession(uidRef.current);
    }

    const freshVaultBest = loadBlocksVault(uidRef.current).bestScore;
    setBestScore(freshVaultBest);
    setInitialSessionBest(freshVaultBest);
    initialSessionBestRef.current = freshVaultBest;
    hasCrossedBestThisRunRef.current = false;
    matchRecordedForCurrentRunRef.current = false;
    roomTrayIndexRef.current = 0;
    linesClearedRef.current = 0;
    bestComboRef.current = 0;
    roomStartedAtRef.current = Date.now();
    roomSubmittedForCurrentRunRef.current = false;

    const emptyBoard = createEmptyBoard();
    const freshTray = activeRoom
      ? generateSeededBlockTray(activeRoom.roomSeed, 0)
      : spawnThreeBlocks(0, lastTrayShapeIdsRef.current);
    lastTrayShapeIdsRef.current = freshTray
      .filter((p): p is PolyominoPiece => p !== null)
      .map((p) => p.shapeId);

    if (activeRoom?.mode === "rush") {
      rushEndAtRef.current = Date.now() + activeRoom.timeLimitSec * 1000;
      setRushRemainingSec(activeRoom.timeLimitSec);
      lastRushWholeSecRef.current = activeRoom.timeLimitSec;
    } else {
      rushEndAtRef.current = null;
      lastRushWholeSecRef.current = null;
      lastRushMinuteMarkTriggeredRef.current = null;
      setRushMinutePulse(false);
      setRushRemainingSec(null);
      lastRushWholeSecRef.current = null;
    }
    lastRushMinuteMarkTriggeredRef.current = null;
    setRushMinutePulse(false);

    stableBoardRef.current = emptyBoard;
    boardStateRef.current = emptyBoard;
    currentBlocksRef.current = freshTray;
    dragStateRef.current = null;
    scoreRef.current = 0;
    clearStreakRef.current = 0;
    historyStackRef.current = [];
    isGameOverRef.current = false;
    isBoardLockedBeatRef.current = false;
    endGameModalSettledRef.current = false;

    setBoardState(emptyBoard);
    setCurrentBlocks(freshTray);
    setScore(0);
    setCanUndo(false);
    setIsBoardLockedBeat(false);
    setMidGameBestBanner(null);
    setBestCardGoldPulse(false);
    clearHoverPreview();
    setClearFeedback(null);
    setDragState(null);
    setGameOverSummary(null);
  }, [
    clearAllVanishTimers,
    clearCelebrationTimers,
    clearFeedbackTimer,
    clearHoverPreview,
    clearReturnTimer,
  ]);

  // Restore saved per-room progress or reset cleanly if multiplayerRoom identity/config changes while mounted
  const roomIdentityKey = multiplayerRoom
    ? `${multiplayerRoom.roomCode}:${multiplayerRoom.roomSeed}:${multiplayerRoom.mode}:${multiplayerRoom.undoAllowed ? 1 : 0}:${multiplayerRoom.timeLimitSec}`
    : "solo";
  const prevRoomIdentityKeyRef = useRef<string>(roomIdentityKey);
  useEffect(() => {
    if (prevRoomIdentityKeyRef.current === roomIdentityKey) return;
    prevRoomIdentityKeyRef.current = roomIdentityKey;

    if (!multiplayerRoom) {
      // Transitioning from Room -> Solo: restore saved Solo run safely without clearing blocks_*_savedSession
      const savedSolo = loadBlocksSavedSession(uidRef.current);
      const validSolo =
        savedSolo &&
          savedSolo.boardState.every((row) =>
            row.every((cell) => !cell || cell.color in PASTEL_TILE_CLASSES_LIGHT)
          ) &&
          savedSolo.currentBlocks.every((p) => !p || p.color in PASTEL_TILE_CLASSES_LIGHT)
          ? savedSolo
          : null;

      stopSustainedBlocksAudio(0.05);
      clearCelebrationTimers();
      clearReturnTimer();
      clearAllVanishTimers();
      clearFeedbackTimer();

      const nextBoard = validSolo
        ? cloneStableBoard(validSolo.boardState as BoardState)
        : createEmptyBoard();
      const nextTray = validSolo
        ? cloneTrayBlocks(validSolo.currentBlocks as (PolyominoPiece | null)[])
        : spawnThreeBlocks(0, lastTrayShapeIdsRef.current);

      stableBoardRef.current = nextBoard;
      boardStateRef.current = nextBoard;
      currentBlocksRef.current = nextTray;
      lastTrayShapeIdsRef.current = nextTray
        .filter((p): p is PolyominoPiece => p !== null)
        .map((p) => p.shapeId);
      const freshVaultBest = loadBlocksVault(uidRef.current).bestScore;
      setBestScore(freshVaultBest);
      setInitialSessionBest(freshVaultBest);
      initialSessionBestRef.current = freshVaultBest;
      scoreRef.current = validSolo?.score ?? 0;
      hasCrossedBestThisRunRef.current = Boolean(
        freshVaultBest > 0 && validSolo && validSolo.score > freshVaultBest
      );
      matchRecordedForCurrentRunRef.current = false;
      clearStreakRef.current = validSolo?.clearStreak ?? 0;
      historyStackRef.current = validSolo
        ? validSolo.historyStack.map((snap) => ({
          boardState: cloneStableBoard(snap.boardState as BoardState),
          currentBlocks: cloneTrayBlocks(snap.currentBlocks as (PolyominoPiece | null)[]),
          score: snap.score,
          clearStreak: snap.clearStreak,
          lastTrayShapeIds: [...snap.lastTrayShapeIds] as BlockShapeId[],
          roomTrayIndex: 0,
          linesCleared: 0,
          bestCombo: 0,
        }))
        : [];
      roomTrayIndexRef.current = 0;
      linesClearedRef.current = 0;
      bestComboRef.current = 0;
      rushEndAtRef.current = null;
      lastRushWholeSecRef.current = null;
      lastRushMinuteMarkTriggeredRef.current = null;
      setRushMinutePulse(false);
      isGameOverRef.current = false;
      isBoardLockedBeatRef.current = false;
      endGameModalSettledRef.current = false;

      setBoardState(nextBoard);
      setCurrentBlocks(nextTray);
      setScore(scoreRef.current);
      setCanUndo(historyStackRef.current.length > 0);
      setRushRemainingSec(null);
      setIsBoardLockedBeat(false);
      setMidGameBestBanner(null);
      setBestCardGoldPulse(false);
      clearHoverPreview();
      setClearFeedback(null);
      setDragState(null);
      setGameOverSummary(null);
      return;
    }

    const pending = getPendingBlocksRoomSession(uidRef.current, multiplayerRoom.roomCode);
    if (
      pending &&
      pending.config.roomSeed === multiplayerRoom.roomSeed &&
      pending.config.mode === multiplayerRoom.mode
    ) {
      stopSustainedBlocksAudio(0.05);
      clearCelebrationTimers();
      clearReturnTimer();
      clearAllVanishTimers();
      clearFeedbackTimer();

      const restoredBoard = restoreBoardFromPending(pending.board);
      const restoredTray = restoreTrayFromPending(
        pending.tray,
        multiplayerRoom.roomSeed,
        pending.roomTrayIndex
      );

      roomTrayIndexRef.current = pending.roomTrayIndex;
      linesClearedRef.current = pending.linesCleared;
      bestComboRef.current = pending.bestCombo;
      roomStartedAtRef.current = pending.startedAt;
      roomSubmittedForCurrentRunRef.current = false;
      matchRecordedForCurrentRunRef.current = false;
      rushEndAtRef.current =
        multiplayerRoom.mode === "rush"
          ? (pending.rushEndAt ?? Date.now() + multiplayerRoom.timeLimitSec * 1000)
          : null;

      stableBoardRef.current = restoredBoard;
      boardStateRef.current = restoredBoard;
      currentBlocksRef.current = restoredTray;
      lastTrayShapeIdsRef.current = restoredTray
        .filter((p): p is PolyominoPiece => p !== null)
        .map((p) => p.shapeId);
      const freshVaultBest = loadBlocksVault(uidRef.current).bestScore;
      setBestScore(freshVaultBest);
      setInitialSessionBest(freshVaultBest);
      initialSessionBestRef.current = freshVaultBest;
      scoreRef.current = pending.score;
      hasCrossedBestThisRunRef.current = Boolean(
        freshVaultBest > 0 && pending.score > freshVaultBest
      );
      clearStreakRef.current = 0;
      historyStackRef.current = [];
      isGameOverRef.current = false;
      isBoardLockedBeatRef.current = false;
      endGameModalSettledRef.current = false;

      setBoardState(restoredBoard);
      setCurrentBlocks(restoredTray);
      setScore(pending.score);
      setCanUndo(false);
      setIsBoardLockedBeat(false);
      setMidGameBestBanner(null);
      setBestCardGoldPulse(false);
      clearHoverPreview();
      setClearFeedback(null);
      setDragState(null);
      setGameOverSummary(null);
      setRushRemainingSec(
        rushEndAtRef.current !== null
          ? Math.max(0, Math.ceil((rushEndAtRef.current - Date.now()) / 1000))
          : null
      );
      lastRushWholeSecRef.current =
        rushEndAtRef.current !== null
          ? Math.max(0, Math.ceil((rushEndAtRef.current - Date.now()) / 1000))
          : null;
      lastRushMinuteMarkTriggeredRef.current = null;
      setRushMinutePulse(false);
      return;
    }

    handlePlayAgain();
  }, [
    roomIdentityKey,
    multiplayerRoom,
    handlePlayAgain,
    clearAllVanishTimers,
    clearCelebrationTimers,
    clearFeedbackTimer,
    clearHoverPreview,
    clearReturnTimer,
  ]);

  const handleUndo = useCallback(() => {
    if (!isUndoAllowedRef.current) return;
    if (isGameOverRef.current || isBoardLockedBeatRef.current || dragStateRef.current) return;
    const prevSnapshot = historyStackRef.current.pop();
    if (!prevSnapshot) return;

    clearReturnTimer();
    clearAllVanishTimers();
    clearFeedbackTimer();

    const restoredBoard = cloneStableBoard(prevSnapshot.boardState);
    stableBoardRef.current = restoredBoard;
    boardStateRef.current = restoredBoard;
    currentBlocksRef.current = prevSnapshot.currentBlocks;
    scoreRef.current = prevSnapshot.score;
    clearStreakRef.current = prevSnapshot.clearStreak;
    lastTrayShapeIdsRef.current = [...prevSnapshot.lastTrayShapeIds];
    roomTrayIndexRef.current = prevSnapshot.roomTrayIndex;
    linesClearedRef.current = prevSnapshot.linesCleared;
    bestComboRef.current = prevSnapshot.bestCombo;

    setBoardState(restoredBoard);
    setCurrentBlocks(prevSnapshot.currentBlocks);
    setScore(prevSnapshot.score);
    setCanUndo(historyStackRef.current.length > 0);
    setClearFeedback(null);
    clearHoverPreview();

    persistActiveSession();
    playSiliconeLiftSound(soundOnRef.current);
    triggerHapticSnap(false);
  }, [clearAllVanishTimers, clearFeedbackTimer, clearHoverPreview, clearReturnTimer, persistActiveSession]);

  const handleNavigateHomeClick = useCallback(() => {
    stopSustainedBlocksAudio(0.05);
    persistActiveSession();
    clearCelebrationTimers();
    clearReturnTimer();
    clearAllVanishTimers();
    clearFeedbackTimer();
    if (multiplayerRoomRef.current && onLeaveMultiplayerRoomRef.current) {
      onLeaveMultiplayerRoomRef.current();
      return;
    }
    if (onBackHome) {
      onBackHome();
      return;
    }
    if (typeof window !== "undefined") {
      window.history.pushState({ view: "home" }, "", "/");
      window.dispatchEvent(new PopStateEvent("popstate", { state: { view: "home" } }));
    }
  }, [
    clearAllVanishTimers,
    clearCelebrationTimers,
    clearFeedbackTimer,
    clearReturnTimer,
    onBackHome,
    persistActiveSession,
  ]);

  const registerPlayAgainTrigger = useCallback(
    (triggerFn: (() => void) | null) => {
      endGamePlayAgainTriggerRef.current = triggerFn;
    },
    []
  );

  // Scoped & guarded Web Keyboard Shortcut Parity inside Block Sync
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement | null;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.tagName === "SELECT" ||
          activeEl.isContentEditable)
      ) {
        return;
      }

      // Yield cleanly ONLY if a visible external App.tsx dialog is open
      // (ignores always-mounted aria-hidden containers like closed DifficultyBottomSheet)
      const externalDialogs = document.querySelectorAll(
        '[role="dialog"][aria-modal="true"]:not([data-block-sync-dialog="true"])'
      );
      const externalDialogOpen = Array.from(externalDialogs).some((el) => {
        if (el.closest('[aria-hidden="true"]')) return false;
        const htmlEl = el as HTMLElement;
        const style = window.getComputedStyle(htmlEl);
        if (
          style.display === "none" ||
          style.visibility === "hidden" ||
          style.opacity === "0"
        ) {
          return false;
        }
        const rect = htmlEl.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });
      if (externalDialogOpen || isSettingsOpenRef.current) return;

      const keyLower = e.key.toLowerCase();

      // Ctrl+Z / Cmd+Z (without Shift): Undo last move when active and allowed
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && keyLower === "z") {
        if (
          isUndoAllowedRef.current &&
          !isGameOverRef.current &&
          !isBoardLockedBeatRef.current &&
          !dragStateRef.current &&
          !showTutorialRef.current &&
          historyStackRef.current.length > 0
        ) {
          e.preventDefault();
          handleUndo();
        }
        return;
      }

      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // M: Toggle Block Sync sound mute/unmute
      if (keyLower === "m") {
        e.preventDefault();
        handleToggleSound();
        return;
      }

      // ? (Shift+/) or H: Toggle Block Sync Help/Rules modal when active
      if (e.key === "?" || (e.shiftKey && e.key === "/") || keyLower === "h") {
        if (!isGameOverRef.current && !isBoardLockedBeatRef.current && !dragStateRef.current) {
          e.preventDefault();
          setShowTutorial((prev) => !prev);
        }
        return;
      }

      // Escape / Backspace: Close non-terminal Block Sync modals (Help/Rules); never dismiss Game Over
      if (e.key === "Escape" || e.key === "Backspace") {
        if (showTutorialRef.current) {
          e.preventDefault();
          setShowTutorial(false);
        }
        return;
      }

      // Enter: Trigger Play Again when End-Game modal is open and settled
      if (e.key === "Enter") {
        if (
          gameOverSummaryRef.current &&
          endGameModalSettledRef.current &&
          activeEl?.id !== "block-sync-back-home-button"
        ) {
          e.preventDefault();
          endGamePlayAgainTriggerRef.current?.();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleToggleSound, handleUndo]);

  const updateHoverPreview = useCallback(
    (nextDrag: ActiveDragState | null) => {
      if (!nextDrag || nextDrag.isReturning || !boardGridRef.current) {
        clearHoverPreview();
        return;
      }
      const boardRect = boardGridRef.current.getBoundingClientRect();
      const placement = resolveGridPlacement(
        nextDrag,
        boardRect,
        boardStateRef.current
      );
      if (!placement) {
        clearHoverPreview();
        return;
      }
      const nextSignature = `${nextDrag.piece.uid}:${placement.anchorRow},${placement.anchorCol}`;
      if (lastHoverSignatureRef.current === nextSignature) {
        return;
      }
      lastHoverSignatureRef.current = nextSignature;
      setHoverWaveSignature(nextSignature);
      setHoverCells(placement.cells);
      setClearPreviewSteps(
        getAnticipatedClearWaves(boardStateRef.current, placement.cells)
      );
    },
    [clearHoverPreview]
  );

  const trayRenderCellSize = Math.max(TRAY_BASE_CELL_PX, boardMetrics.cellSize);
  const trayRenderGapPx = Math.max(TRAY_BASE_GAP_PX, boardMetrics.gapPx);

  const handlePiecePointerDown = useCallback(
    (slotIndex: number, piece: PolyominoPiece, e: React.PointerEvent<HTMLDivElement>) => {
      if (isGameOverRef.current || isBoardLockedBeatRef.current) return;
      if (e.button !== 0 && e.pointerType === "mouse") return;
      e.preventDefault();

      // Unlock/resume Web Audio and play a subtle tactile lift cue
      playSiliconeLiftSound(soundOnRef.current);

      clearReturnTimer();

      const trayEl = trayPieceRefs.current[slotIndex];
      const boardEl = boardGridRef.current;
      if (!trayEl || !boardEl) return;

      const trayRect = trayEl.getBoundingClientRect();
      const boardRect = boardEl.getBoundingClientRect();
      const liveMetrics = measureBoardMetrics(boardEl);
      const cols = piece.shape[0].length;

      const trayVisualWidth = trayRect.width;
      const dragWidth =
        cols * liveMetrics.cellSize + Math.max(0, cols - 1) * liveMetrics.gapPx;
      const trayReturnScale =
        dragWidth > 0 ? Math.min(1, trayVisualWidth / dragWidth) : 0.45;

      const nextDrag: ActiveDragState = {
        slotIndex,
        piece,
        pointerId: e.pointerId,
        pointerType: e.pointerType,
        clientX: e.clientX,
        clientY: e.clientY,
        homeCenterX: trayRect.left + trayRect.width / 2,
        homeCenterY: trayRect.top + trayRect.height / 2,
        trayReturnScale,
        boardCellPitch: boardRect.width / BOARD_SIZE,
        boardCellSize: liveMetrics.cellSize,
        boardGapPx: liveMetrics.gapPx,
        isReturning: false,
      };

      setDragState(nextDrag);
      updateHoverPreview(nextDrag);
    },
    [clearReturnTimer, updateHoverPreview]
  );

  useEffect(() => {
    if (!dragState || dragState.isReturning) return;

    const handlePointerMove = (e: PointerEvent) => {
      const active = dragStateRef.current;
      if (!active || active.isReturning || e.pointerId !== active.pointerId) return;

      const updated: ActiveDragState = {
        ...active,
        clientX: e.clientX,
        clientY: e.clientY,
      };
      dragStateRef.current = updated;
      setDragState(updated);
      updateHoverPreview(updated);
    };

    const handlePointerFinish = (e: PointerEvent) => {
      const active = dragStateRef.current;
      if (!active || active.isReturning || e.pointerId !== active.pointerId) return;

      const latestDrag: ActiveDragState = {
        ...active,
        clientX: e.clientX,
        clientY: e.clientY,
      };

      const boardEl = boardGridRef.current;
      const placement =
        e.type === "pointerup" && boardEl && !isGameOverRef.current
          ? resolveGridPlacement(
            latestDrag,
            boardEl.getBoundingClientRect(),
            boardStateRef.current
          )
          : null;

      clearHoverPreview();

      if (placement) {
        // 0. Record pre-move snapshot for Undo
        historyStackRef.current = [
          ...historyStackRef.current.slice(-(MAX_UNDO_HISTORY - 1)),
          {
            boardState: cloneStableBoard(boardStateRef.current),
            currentBlocks: cloneTrayBlocks(currentBlocksRef.current),
            score: scoreRef.current,
            clearStreak: clearStreakRef.current,
            lastTrayShapeIds: [...lastTrayShapeIdsRef.current],
            roomTrayIndex: roomTrayIndexRef.current,
            linesCleared: linesClearedRef.current,
            bestCombo: bestComboRef.current,
          },
        ];
        setCanUndo(true);

        // 1. Place the block squares onto a cloned board
        const placedBoard = boardStateRef.current.map((row) =>
          row.map((cell) => (cell ? { ...cell } : null))
        );
        for (const cell of placement.cells) {
          placedBoard[cell.row][cell.col] = {
            color: latestDrag.piece.color,
            isClearing: false,
          };
        }

        // 2. Analyze 3-Way Sudoku clears (Rows, Columns, 3x3 Sub-Grids)
        const clearAnalysis = analyzeSudokuClears(placedBoard);
        const groupsCleared = clearAnalysis.groupsClearedCount;
        if (groupsCleared > 0) {
          linesClearedRef.current += groupsCleared;
          if (groupsCleared > bestComboRef.current) {
            bestComboRef.current = groupsCleared;
          }
        }
        const nextStreak = groupsCleared > 0 ? clearStreakRef.current + 1 : 0;
        clearStreakRef.current = nextStreak;
        const isCelebrationClear =
          groupsCleared >= 2 || (groupsCleared > 0 && nextStreak >= 2);

        // 3. Calculate Score & Combo Multiplier
        const placementPoints = placement.cells.length * POINTS_PER_PLACED_SQUARE;
        const clearPoints =
          groupsCleared > 0
            ? groupsCleared * POINTS_PER_CLEARED_GROUP * groupsCleared
            : 0;
        const pointsDelta = placementPoints + clearPoints;
        const nextTotalScore = scoreRef.current + pointsDelta;

        scoreRef.current = nextTotalScore;
        setScore(nextTotalScore);

        if (
          initialSessionBestRef.current > 0 &&
          nextTotalScore > initialSessionBestRef.current &&
          !hasCrossedBestThisRunRef.current
        ) {
          hasCrossedBestThisRunRef.current = true;
          triggerMidGameBestCross();
        }

        if (groupsCleared > 0) {
          feedbackSeqRef.current += 1;
          setClearFeedback({
            id: feedbackSeqRef.current,
            pointsDelta,
            comboMultiplier: groupsCleared,
            streakCount: nextStreak,
          });
          clearFeedbackTimer();
          feedbackTimerRef.current = window.setTimeout(() => {
            setClearFeedback(null);
            feedbackTimerRef.current = null;
          }, isCelebrationClear ? 1350 : 1100);
        }

        // 4. Mark cleared cells with isClearing: true for ~300ms Zen vanish animation
        let logicalPostClearBoard = placedBoard;
        if (clearAnalysis.clearKeys.size > 0) {
          clearBatchSeqRef.current += 1;
          const batchId = clearBatchSeqRef.current;

          const animatingBoard = placedBoard.map((row, r) =>
            row.map((cell, c) => {
              if (!cell || !clearAnalysis.clearKeys.has(`${r},${c}`)) {
                return cell;
              }
              return {
                ...cell,
                isClearing: true,
                isComboClear: isCelebrationClear,
                clearBatchId: batchId,
              };
            })
          );

          logicalPostClearBoard = placedBoard.map((row, r) =>
            row.map((cell, c) =>
              clearAnalysis.clearKeys.has(`${r},${c}`) ? null : cell
            )
          );

          boardStateRef.current = animatingBoard;
          setBoardState(animatingBoard);

          const vanishTimerId = window.setTimeout(() => {
            vanishTimersRef.current.delete(vanishTimerId);
            setBoardState((prev) => {
              const cleaned = prev.map((row) =>
                row.map((cell) =>
                  cell && cell.isClearing && cell.clearBatchId === batchId
                    ? null
                    : cell
                )
              );
              boardStateRef.current = cleaned;
              return cleaned;
            });
          }, VANISH_DURATION_MS);
          vanishTimersRef.current.add(vanishTimerId);
        } else {
          boardStateRef.current = placedBoard;
          setBoardState(placedBoard);
        }

        playSiliconeThudSound(soundOnRef.current, groupsCleared > 0);
        if (groupsCleared > 0) {
          playMarimbaClearSound(groupsCleared, nextStreak, soundOnRef.current);
        }
        triggerHapticSnap(isCelebrationClear);

        // 5. Update tray & respawn 3 progressive-scaled blocks when empty
        const consumedTray = currentBlocksRef.current.map((slot, idx) =>
          idx === latestDrag.slotIndex ? null : slot
        );
        let nextTray: (PolyominoPiece | null)[];
        if (consumedTray.every((slot) => slot === null)) {
          if (multiplayerRoomRef.current) {
            const nextTrayIdx = roomTrayIndexRef.current + 1;
            roomTrayIndexRef.current = nextTrayIdx;
            nextTray = generateSeededBlockTray(
              multiplayerRoomRef.current.roomSeed,
              nextTrayIdx
            );
          } else {
            nextTray = spawnThreeBlocks(
              nextTotalScore,
              lastTrayShapeIdsRef.current,
              latestDrag.piece.shapeId,
              logicalPostClearBoard
            );
          }
          lastTrayShapeIdsRef.current = nextTray
            .filter((p): p is PolyominoPiece => p !== null)
            .map((p) => p.shapeId);
        } else {
          nextTray = consumedTray;
        }

        stableBoardRef.current = logicalPostClearBoard;
        currentBlocksRef.current = nextTray;
        setCurrentBlocks(nextTray);

        dragStateRef.current = null;
        setDragState(null);

        // 6. Evaluate Game Over against post-clear board & active tray blocks
        if (!hasAnyValidMove(logicalPostClearBoard, nextTray)) {
          isGameOverRef.current = true;
          isBoardLockedBeatRef.current = true;
          setIsBoardLockedBeat(true);
          if (!multiplayerRoomRef.current) {
            clearBlocksSavedSession(uidRef.current);
          }
          if (clarityBeatTimerRef.current !== null) {
            window.clearTimeout(clarityBeatTimerRef.current);
          }
          clarityBeatTimerRef.current = window.setTimeout(() => {
            clarityBeatTimerRef.current = null;
            finalizeGameOver(nextTotalScore, "out_of_moves");
          }, 320);
        } else {
          persistActiveSession();
        }
        return;
      }

      // Invalid drop: spring-animate dragged block smoothly back to its tray slot
      playSiliconeReturnSound(soundOnRef.current);
      setDragState({
        ...latestDrag,
        isReturning: true,
      });

      clearReturnTimer();
      returnTimerRef.current = window.setTimeout(() => {
        setDragState(null);
        returnTimerRef.current = null;
      }, 240);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerup", handlePointerFinish);
    window.addEventListener("pointercancel", handlePointerFinish);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerFinish);
      window.removeEventListener("pointercancel", handlePointerFinish);
    };
  }, [
    clearFeedbackTimer,
    clearHoverPreview,
    clearReturnTimer,
    dragState?.isReturning,
    dragState?.pointerId,
    finalizeGameOver,
    persistActiveSession,
    triggerMidGameBestCross,
    updateHoverPreview,
  ]);

  const floatingOverlayStyle = useMemo<React.CSSProperties | null>(() => {
    if (!dragState) return null;

    const { x, y } = dragState.isReturning
      ? { x: dragState.homeCenterX, y: dragState.homeCenterY }
      : getDragVisualCenter(dragState);

    const scale = dragState.isReturning ? dragState.trayReturnScale : 1.04;

    return {
      left: 0,
      top: 0,
      transform: `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`,
      transition: dragState.isReturning
        ? "transform 240ms cubic-bezier(0.34, 1.38, 0.64, 1)"
        : "none",
      willChange: "transform",
    };
  }, [dragState]);

  const percentileData = useMemo(() => {
    if (!gameOverSummary) return null;
    return calculateBlockSyncPercentile(gameOverSummary.finalScore);
  }, [gameOverSummary]);

  const renderPolyominoSquareTiles = (
    piece: PolyominoPiece,
    cellPx: number,
    gapPx: number
  ) => {
    const rows = piece.shape.length;
    const cols = piece.shape[0].length;
    return (
      <div
        className="grid"
        style={{
          gridTemplateRows: `repeat(${rows}, ${cellPx}px)`,
          gridTemplateColumns: `repeat(${cols}, ${cellPx}px)`,
          gap: `${gapPx}px`,
        }}
      >
        {piece.shape.map((rowArr, r) =>
          rowArr.map((filled, c) =>
            filled === 1 ? (
              <div
                key={`${piece.uid}-${r}-${c}`}
                className={`w-full h-full aspect-square rounded-[24%] ${tileClasses[piece.color]}`}
              />
            ) : (
              <div
                key={`${piece.uid}-empty-${r}-${c}`}
                className="w-full h-full aspect-square"
              />
            )
          )
        )}
      </div>
    );
  };

  return (
    <main
      id="block-sync-screen"
      className={`flex-1 min-h-0 h-full w-full overflow-y-auto overscroll-y-contain flex flex-col items-center px-2 sm:px-3 md:px-6 pt-[calc(70px+env(safe-area-inset-top,0px))] pb-[max(12px,env(safe-area-inset-bottom,0px))] select-none transition-colors duration-300 ${darkMode ? "bg-[#141A21] text-slate-100" : "bg-[#F4F8FB] text-[#2C3E50]"
        }`}
    >
      <style>{`
        @keyframes blockSyncZenVanish {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          32% {
            transform: scale(1.06);
            opacity: 0.9;
          }
          100% {
            transform: scale(0.45);
            opacity: 0;
          }
        }
        @keyframes blockSyncComboVanish {
          0% {
            transform: scale(1);
            filter: brightness(1);
            opacity: 1;
          }
          36% {
            transform: scale(1.12);
            filter: brightness(1.14);
            opacity: 0.96;
          }
          100% {
            transform: scale(0.36);
            filter: brightness(1.04);
            opacity: 0;
          }
        }
        @keyframes blockSyncFadeIn {
          from {
            opacity: 0;
            transform: scale(0.97);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes bsRushMinutePop {
          0% { transform: scale(1); }
          45% { transform: scale(1.09); }
          100% { transform: scale(1); }
        }
        @keyframes bsRushHeartbeat {
          0%, 100% { transform: scale(1); }
          14% { transform: scale(1.07); }
          28% { transform: scale(1); }
          42% { transform: scale(1.045); }
          70% { transform: scale(1); }
        }
        .bs-rush-minute-pop {
          animation: bsRushMinutePop 320ms cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform;
        }
        .bs-rush-heartbeat {
          animation: bsRushHeartbeat 1s ease-in-out infinite;
          will-change: transform;
        }
        @media (prefers-reduced-motion: reduce) {
          .bs-rush-minute-pop,
          .bs-rush-heartbeat,
          .bs-tut-piece,
          .bs-tut-finger,
          .bs-tut-hover,
          .bs-tut-vanish,
          .bs-tut-pop {
            animation: none !important;
          }
        }
        @keyframes bsTutPiece {
          0%, 8% { transform: translate(0px, 0px) scale(1); opacity: 1; }
          16% { transform: translate(calc(var(--bs-tut-dx) * 0.2), -14px) scale(1.06); opacity: 1; }
          44% { transform: translate(var(--bs-tut-dx), var(--bs-tut-dy)) scale(1.05); opacity: 1; }
          49%, 60% { transform: translate(var(--bs-tut-dx), var(--bs-tut-dy)) scale(1); opacity: 1; }
          66% { transform: translate(var(--bs-tut-dx), var(--bs-tut-dy)) scale(1.06); opacity: 0.92; }
          78%, 100% { transform: translate(var(--bs-tut-dx), var(--bs-tut-dy)) scale(0.38); opacity: 0; }
        }
        @keyframes bsTutFinger {
          0%, 8% { transform: translate(0px, 0px) scale(1); opacity: 0.95; }
          14% { transform: translate(0px, 0px) scale(0.9); opacity: 1; }
          44% { transform: translate(var(--bs-tut-dx), var(--bs-tut-dy)) scale(0.9); opacity: 1; }
          49% { transform: translate(var(--bs-tut-dx), var(--bs-tut-dy)) scale(1); opacity: 0.92; }
          56%, 100% { transform: translate(var(--bs-tut-dx), var(--bs-tut-dy)) scale(1); opacity: 0; }
        }
        @keyframes bsTutHover {
          0%, 22% { opacity: 0; }
          32%, 47% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        @keyframes bsTutVanish {
          0%, 60% { transform: scale(1); opacity: 1; }
          66% { transform: scale(1.06); opacity: 0.92; }
          78%, 100% { transform: scale(0.38); opacity: 0; }
        }
        @keyframes bsTutPop {
          0%, 56% { transform: translateY(6px) scale(0.9); opacity: 0; }
          66% { transform: translateY(-2px) scale(1); opacity: 1; }
          84% { transform: translateY(-10px) scale(1); opacity: 1; }
          96%, 100% { transform: translateY(-15px) scale(0.95); opacity: 0; }
        }
        .bs-tut-piece { animation: bsTutPiece 2.7s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .bs-tut-finger { animation: bsTutFinger 2.7s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .bs-tut-hover { animation: bsTutHover 2.7s ease-in-out forwards; }
        .bs-tut-vanish { animation: bsTutVanish 2.7s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .bs-tut-pop { animation: bsTutPop 2.7s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        @keyframes blockSyncClearPreviewEnter {
          0% {
            opacity: 0;
            transform: scale(0.84);
          }
          100% {
            opacity: 0.94;
            transform: scale(0.985);
          }
        }
        @keyframes blockSyncClearPreviewWave {
          0%, 100% {
            opacity: 0.94;
            transform: scale(0.985);
          }
          50% {
            opacity: 1;
            transform: scale(1.035);
          }
        }
        .block-sync-vanishing-cell {
          animation: blockSyncZenVanish ${VANISH_DURATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .block-sync-combo-vanishing-cell {
          animation: blockSyncComboVanish ${VANISH_DURATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .block-sync-clear-preview-wave {
          will-change: transform, opacity;
        }
        .block-sync-fade-in {
          animation: blockSyncFadeIn 240ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes bsMidBestEnter {
          0% { transform: translateY(10px) scale(0.84); opacity: 0; }
          70% { transform: translateY(-2px) scale(1.04); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes bsMidBestExit {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-14px) scale(0.96); opacity: 0; }
        }
      `}</style>

      {/* 25% Full-Screen 3D Crystal-Pastel Milestone Rain on Mid-Game Best Crossing */}
      <BlockSyncConfettiRain
        active={milestoneRain.active}
        burstKey={milestoneRain.burstKey}
        isDarkMode={darkMode}
        intensity="milestone"
      />

      {/* Adaptive Optical Upper-Middle Top Spacer (~36/64 weighted split) */}
      <div
        aria-hidden="true"
        style={{ flexGrow: 0.72, flexShrink: 1, flexBasis: "0px" }}
        className="w-full min-h-[12px] max-h-[14dvh]"
      />

      <div className="w-full max-w-[448px] mx-auto flex flex-col items-center justify-center gap-2.5 sm:gap-3 shrink-0">
        {/* Sudoku-Aligned Board Group: Compact Room Badge (when active) + Symmetric 3-Module HUD + 9x9 Board */}
        <div className="w-full max-w-[min(92vw,424px,47dvh)] flex flex-col gap-1.5 shrink-0">
          {multiplayerRoom && (
            <div
              id="block-sync-room-hud-bar"
              className="w-full flex items-center justify-between gap-2 px-0.5 min-w-0"
            >
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-2xl text-[10.5px] font-mono font-bold tracking-wider uppercase truncate ${darkMode
                  ? "bg-[#1B242E] text-slate-200 shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                  : "bg-[#E6F1F8]/95 text-[#2C3E50] shadow-[0_4px_12px_rgba(44,62,80,0.05)]"
                  }`}
              >
                <span className="opacity-60">{t("blocks_room")}</span>
                <span aria-hidden="true" className="opacity-40">
                  ·
                </span>
                <span className="tabular-nums">{multiplayerRoom.roomCode}</span>
              </span>

              {multiplayerRoom.mode === "rush" ? (
                (() => {
                  const displaySec = Math.max(
                    0,
                    rushRemainingSec ?? multiplayerRoom.timeLimitSec
                  );
                  const mins = Math.floor(displaySec / 60);
                  const secs = displaySec % 60;
                  const formattedClock = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
                  const isCriticalTime = displaySec <= 15;
                  const isWarmUrgency = displaySec > 15 && displaySec <= 30;
                  return (
                    <span
                      id="block-sync-rush-timer-pill"
                      aria-live="off"
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-2xl text-[10.5px] font-mono font-extrabold tracking-wider uppercase tabular-nums shrink-0 transition-colors duration-200 ${isCriticalTime
                        ? `${darkMode
                          ? "bg-[#4c0519]/90 text-[#fda4af] ring-1 ring-rose-400/60 shadow-[0_0_16px_rgba(244,63,94,0.28)]"
                          : "bg-[#FFE4E6] text-[#9D174D] ring-1 ring-rose-400/60 shadow-[0_0_14px_rgba(244,63,94,0.20)]"
                        } ${displaySec > 0 && !isGameOver ? "bs-rush-heartbeat" : ""}`
                        : isWarmUrgency
                          ? darkMode
                            ? "bg-[#F59E0B]/20 text-[#FBBF24] ring-1 ring-[#F59E0B]/45"
                            : "bg-amber-100/95 text-[#D97706] ring-1 ring-[#F59E0B]/55"
                          : darkMode
                            ? "bg-[#1B242E] text-[#38BDF8] shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                            : "bg-[#E6F1F8]/95 text-[#0369A1] shadow-[0_4px_12px_rgba(44,62,80,0.05)]"
                        } ${rushMinutePulse && !isCriticalTime ? "bs-rush-minute-pop" : ""}`}
                    >
                      <Clock className="w-3 h-3 shrink-0" aria-hidden="true" />
                      <span>{t("blocks_mode_rush_short")}</span>
                      <span>{formattedClock}</span>
                    </span>
                  );
                })()
              ) : (
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-2xl text-[10.5px] font-mono font-extrabold tracking-wider uppercase shrink-0 ${darkMode
                    ? "bg-[#1B242E] text-[#34D399] shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                    : "bg-[#E6F1F8]/95 text-[#065F46] shadow-[0_4px_12px_rgba(44,62,80,0.05)]"
                    }`}
                >
                  {t("blocks_mode_classic")}
                </span>
              )}
            </div>
          )}

          {/* Symmetric 3-Module Instrument HUD Bar Aligned 1:1 with 9x9 Board */}
          <div className="w-full grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 mb-0.5">
            {/* Left (1fr): Current Score Card */}
            <div
              aria-label={t("blocks_score")}
              className={`min-w-0 w-full h-[48px] px-2 sm:px-3 rounded-[clamp(10px,3vw,16px)] flex flex-col items-center justify-center transition-colors duration-300 ${darkMode
                ? "bg-[#1B242E] border-none shadow-[0_6px_18px_rgba(0,0,0,0.34)]"
                : "bg-[#E8F2FA]/90 border border-[#C4DCEF]/75 shadow-[0_6px_18px_rgba(44,62,80,0.06)]"
                }`}
            >
              <span
                className={`text-[9.5px] leading-none font-semibold tracking-[0.10em] uppercase whitespace-nowrap truncate max-w-full opacity-55 ${darkMode ? "text-slate-100" : "text-[#2C3E50]"
                  }`}
              >
                {t("blocks_score")}
              </span>
              <span
                id="block-sync-score-value"
                className={`mt-0.5 text-[16px] sm:text-[18px] leading-tight font-extrabold tabular-nums tracking-tight whitespace-nowrap truncate max-w-full ${darkMode ? "text-slate-100" : "text-[#2C3E50]"
                  }`}
              >
                {score.toLocaleString()}
              </span>
            </div>

            {/* Center (auto): Soft Dock for Sound, Multiplayer & Help */}
            <div
              className={`h-[48px] px-1.5 rounded-[clamp(10px,3vw,16px)] flex items-center justify-center gap-1 shrink-0 transition-colors duration-300 ${darkMode
                ? "bg-[#1B242E] border-none shadow-[0_6px_18px_rgba(0,0,0,0.34)]"
                : "bg-[#E8F2FA]/90 border border-[#C4DCEF]/75 shadow-[0_6px_18px_rgba(44,62,80,0.06)]"
                }`}
              id="block-sync-action-bar"
            >
              {[
                {
                  id: "block-sync-speaker-button",
                  label: soundOn ? t("blocks_aria_mute") : t("blocks_aria_unmute"),
                  onClick: handleToggleSound,
                  icon: soundOn ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  ),
                },
                {
                  id: "block-sync-multiplayer-button",
                  label: t("blocks_aria_multiplayer"),
                  onClick: () => onOpenMultiplayer?.(),
                  icon: <Users className="w-4 h-4" />,
                },
                {
                  id: "block-sync-tutorial-button",
                  label: t("blocks_aria_how_to_play"),
                  onClick: openHowToPlayModal,
                  icon: <HelpCircle className="w-4 h-4" />,
                },
              ].map((btn) => (
                <button
                  key={btn.id}
                  id={btn.id}
                  type="button"
                  aria-label={btn.label}
                  title={btn.label}
                  onClick={btn.onClick}
                  className={`w-9 h-9 rounded-xl border-none flex items-center justify-center cursor-pointer transition-all duration-150 active:scale-90 ${darkMode
                    ? "text-slate-200 hover:bg-[#24303D]"
                    : "text-[#49637A] hover:bg-[#D5E6F3]/80"
                    }`}
                >
                  {btn.icon}
                </button>
              ))}
            </div>

            {/* Right (1fr): Best Score Card (with 260ms warm-gold Mid-Game Best Cross pulse) */}
            <div
              id="block-sync-best-card"
              aria-label={t("blocks_best")}
              className={`min-w-0 w-full h-[48px] px-2 sm:px-3 rounded-[clamp(10px,3vw,16px)] flex flex-col items-center justify-center transition-all duration-[260ms] ${bestCardGoldPulse
                ? darkMode
                  ? "bg-[#2B2618] border-none ring-2 ring-[#F9CF43]/70 shadow-[0_0_20px_rgba(249,207,67,0.28)] scale-[1.03]"
                  : "bg-amber-100/95 border-none ring-2 ring-amber-400/75 shadow-[0_6px_20px_rgba(245,158,11,0.25)] scale-[1.03]"
                : darkMode
                  ? "bg-[#1B242E] border-none shadow-[0_6px_18px_rgba(0,0,0,0.34)]"
                  : "bg-[#E8F2FA]/90 border border-[#C4DCEF]/75 shadow-[0_6px_18px_rgba(44,62,80,0.06)]"
                }`}
            >
              <span
                className={`text-[9.5px] leading-none font-semibold tracking-[0.10em] uppercase whitespace-nowrap truncate max-w-full opacity-55 ${darkMode ? "text-slate-100" : "text-[#2C3E50]"
                  }`}
              >
                {t("blocks_best")}
              </span>
              <span
                id="block-sync-best-value"
                className={`mt-0.5 text-[16px] sm:text-[18px] leading-tight font-extrabold tabular-nums tracking-tight whitespace-nowrap truncate max-w-full ${bestCardGoldPulse
                  ? darkMode
                    ? "text-[#F9CF43]"
                    : "text-[#925808]"
                  : darkMode
                    ? "text-slate-200"
                    : "text-[#3B556C]"
                  }`}
              >
                {Math.max(bestScore, score).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Centered 9x9 Board with Crisp Outer Border & 3x3 Sub-Grid Tinting */}
          <section
            aria-label="Block Sync 9 by 9 Board"
            className={`relative w-full aspect-square p-2.5 sm:p-3.5 rounded-[clamp(16px,4.8vw,24px)] backdrop-blur-md transition-colors duration-300 ${darkMode
              ? "bg-[#19222C] border border-slate-700/50 shadow-[0_14px_38px_rgba(0,0,0,0.52)]"
              : "bg-[#D1E4F3]/95 border border-[#B7D2E8]/60 shadow-[0_12px_36px_rgba(44,62,80,0.08)]"
              }`}
          >
            {/* Non-Blocking Center-of-Board Mid-Game Best Cross Designer Crown Pill */}
            {midGameBestBanner && (
              <div
                key={`midgame-best-${midGameBestBanner.id}`}
                aria-live="polite"
                className="pointer-events-none absolute inset-0 z-[40] flex items-center justify-center"
              >
                <div
                  id="block-sync-midgame-best-banner"
                  style={
                    reducedMotion
                      ? undefined
                      : {
                        animation: midGameBestBanner.exiting
                          ? "bsMidBestExit 240ms ease-in forwards"
                          : "bsMidBestEnter 220ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
                        willChange: "transform, opacity",
                      }
                  }
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-black uppercase tracking-[0.14em] whitespace-nowrap ${darkMode
                    ? "bg-[#16202B]/95 text-[#F8FAFC] border border-[#FBBF24]/45 shadow-[0_10px_30px_rgba(251,191,36,0.22)]"
                    : "bg-white/95 text-[#1E293B] border border-[#F59E0B]/45 shadow-[0_10px_28px_rgba(245,158,11,0.22)]"
                    }`}
                >
                  <Crown
                    className={`w-4 h-4 shrink-0 ${darkMode ? "text-[#FBBF24]" : "text-[#D97706]"}`}
                    aria-hidden="true"
                  />
                  <span>{t("blocks_new_best_banner")}</span>
                </div>
              </div>
            )}

            {/* Non-shifting Floating Combo / Clear Points Pill */}
            {clearFeedback && (
              <div className="pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                {(() => {
                  const isCelebration =
                    clearFeedback.comboMultiplier >= 2 ||
                    clearFeedback.streakCount >= 2;
                  const labels = [`+${clearFeedback.pointsDelta}`];
                  if (clearFeedback.comboMultiplier > 1) {
                    labels.push(t("blocks_combo_x", { n: clearFeedback.comboMultiplier }));
                  }
                  if (clearFeedback.streakCount > 1) {
                    labels.push(t("blocks_streak_n", { n: clearFeedback.streakCount }));
                  }

                  return (
                    <div
                      id="block-sync-combo-pill"
                      key={`combo-pill-${clearFeedback.id}`}
                      className={`block-sync-fade-in inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border-none text-xs font-semibold tracking-wide whitespace-nowrap ${isCelebration
                        ? darkMode
                          ? "bg-[#2C243D] text-[#D8B4FE] shadow-[0_6px_18px_rgba(0,0,0,0.48)]"
                          : "bg-purple-200 text-[#432C7A] shadow-[0_6px_18px_rgba(67,44,122,0.14)]"
                        : darkMode
                          ? "bg-[#22303E] text-[#98C8E8] shadow-[0_6px_16px_rgba(0,0,0,0.45)]"
                          : "bg-sky-200 text-[#1E4E70] shadow-[0_6px_16px_rgba(44,62,80,0.12)]"
                        }`}
                    >
                      {isCelebration && (
                        <Sparkles className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      )}
                      <span>{labels.join(" · ")}</span>
                    </div>
                  );
                })()}
              </div>
            )}

            <div
              ref={boardGridRef}
              className="w-full h-full grid grid-cols-9 grid-rows-9 gap-1 sm:gap-1.5"
            >
              {boardState.map((rowArr, rowIdx) =>
                rowArr.map((cell, colIdx) => {
                  const cellKey = `${rowIdx},${colIdx}`;
                  const isHovered = hoverCellSet.has(cellKey);
                  const clearWaveStep =
                    dragState && !dragState.isReturning
                      ? clearPreviewSteps.get(cellKey)
                      : undefined;
                  const isClearPreview = clearWaveStep !== undefined;
                  const waveDelayMs = (clearWaveStep ?? 0) * 28;
                  const isAltSudokuBox =
                    (Math.floor(rowIdx / SUBGRID_SIZE) +
                      Math.floor(colIdx / SUBGRID_SIZE)) %
                    2 ===
                    1;

                  const activeHoverClass =
                    isHovered && dragState
                      ? `${(darkMode
                        ? HOVER_PREVIEW_CLASSES_DARK
                        : HOVER_PREVIEW_CLASSES_LIGHT)[dragState.piece.color]
                      } scale-[0.98]`
                      : "";

                  const emptyCellClass = darkMode
                    ? isAltSudokuBox
                      ? "border-none bg-[#283747] shadow-[inset_0_2px_6px_rgba(0,0,0,0.52)]"
                      : "border-none bg-[#0E141B] shadow-[inset_0_3px_7px_rgba(0,0,0,0.74)]"
                    : isAltSudokuBox
                      ? "border-none bg-[#BDD9EE]/95 shadow-[inset_0_2px_6px_rgba(88,128,166,0.30)]"
                      : "border-none bg-white shadow-[inset_0_2px_6px_rgba(116,154,186,0.28)]";

                  return (
                    <div
                      key={`block-sync-cell-${rowIdx}-${colIdx}`}
                      className={`relative w-full h-full aspect-square rounded-[24%] transition-all duration-150 ${cell
                        ? `${tileClasses[cell.color]} ${cell.isClearing
                          ? `${cell.isComboClear
                            ? "block-sync-combo-vanishing-cell"
                            : "block-sync-vanishing-cell"
                          } pointer-events-none`
                          : ""
                        }`
                        : isHovered
                          ? activeHoverClass
                          : emptyCellClass
                        }`}
                    >
                      {cell && !cell.isClearing && isClearPreview && dragState && (
                        <div
                          key={`clear-wave-${hoverWaveSignature}-${cellKey}`}
                          aria-hidden="true"
                          style={{
                            animation: `blockSyncClearPreviewEnter 190ms cubic-bezier(0.22, 1, 0.36, 1) ${waveDelayMs}ms backwards, blockSyncClearPreviewWave 1350ms ease-in-out ${waveDelayMs + 190}ms infinite`,
                          }}
                          className={`pointer-events-none absolute -inset-px rounded-[inherit] block-sync-clear-preview-wave ${tileClasses[dragState.piece.color]}`}
                        />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>

        {/* Overflow-Safe Auto-Scaling Flex Spawner Tray */}
        <section
          ref={trayContainerRef}
          aria-label="Block Sync Piece Spawner Tray"
          className={`w-full max-w-[min(92vw,424px,47dvh)] h-24 sm:h-28 px-2.5 sm:px-3.5 py-2 rounded-[clamp(16px,4.8vw,24px)] backdrop-blur-md flex items-center justify-between gap-2 sm:gap-2.5 overflow-hidden shrink-0 transition-colors duration-300 ${darkMode
            ? "bg-[#1B242E] border-none shadow-[0_10px_30px_rgba(0,0,0,0.42)]"
            : "bg-[#E8F2FA]/90 border border-[#C4DCEF]/75 shadow-[0_10px_30px_rgba(44,62,80,0.06)]"
            }`}
        >
          {currentBlocks.map((piece, slotIndex) => {
            const isBeingDragged = dragState?.slotIndex === slotIndex;
            const trayScale = piece
              ? getTrayPieceScale(
                piece.shape,
                trayRenderCellSize,
                trayRenderGapPx,
                traySlotMetrics
              )
              : 0.5;
            const rawDims = piece
              ? getTrayPieceRawDimensions(
                piece.shape,
                trayRenderCellSize,
                trayRenderGapPx
              )
              : { rawWidth: 0, rawHeight: 0 };

            return (
              <div
                key={`spawner-slot-${slotIndex}`}
                className="flex-1 min-w-0 min-h-0 h-full flex items-center justify-center overflow-hidden"
              >
                {piece && (
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label={`Draggable ${piece.variantId} block`}
                    onPointerDown={(e) => handlePiecePointerDown(slotIndex, piece, e)}
                    style={{ touchAction: "none" }}
                    className={`w-full h-full min-w-0 min-h-0 flex items-center justify-center rounded-2xl transition-[transform,opacity] duration-200 ${isGameOver || isBoardLockedBeat
                      ? "opacity-45 cursor-default pointer-events-none"
                      : isBeingDragged
                        ? "opacity-0 pointer-events-none"
                        : "opacity-100 cursor-grab active:cursor-grabbing hover:scale-[1.04]"
                      }`}
                  >
                    <div
                      className="flex items-center justify-center shrink-0"
                      style={{
                        width: `${rawDims.rawWidth * trayScale}px`,
                        height: `${rawDims.rawHeight * trayScale}px`,
                      }}
                    >
                      <div
                        ref={(el) => {
                          trayPieceRefs.current[slotIndex] = el;
                        }}
                        className="flex items-center justify-center origin-center shrink-0"
                        style={{
                          transform: `scale(${trayScale})`,
                        }}
                      >
                        {renderPolyominoSquareTiles(
                          piece,
                          trayRenderCellSize,
                          trayRenderGapPx
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </section>

        {/* Bottom-Left Compact Undo Control Below Spawner Tray (hidden when room disables Undo) */}
        {isUndoAllowed && (
          <div className="w-full min-w-0 max-w-[min(92vw,424px,47dvh)] flex items-center justify-start shrink-0">
            <button
              id="block-sync-undo-button"
              type="button"
              aria-label={t("blocks_aria_undo")}
              title={t("blocks_aria_undo")}
              disabled={isGameOver || isBoardLockedBeat || !canUndo}
              onClick={handleUndo}
              className={`h-8 sm:h-9 px-3.5 rounded-2xl border-none inline-flex items-center justify-center gap-1.5 max-w-full overflow-hidden text-xs font-semibold transition-all duration-150 ${isGameOver || isBoardLockedBeat || !canUndo
                ? darkMode
                  ? "bg-[#1B242E]/65 text-slate-500 opacity-50 cursor-not-allowed shadow-[0_3px_10px_rgba(0,0,0,0.22)]"
                  : "bg-[#E6F1F8]/65 text-[#8AA0B5] opacity-60 cursor-not-allowed shadow-[0_3px_10px_rgba(44,62,80,0.03)]"
                : darkMode
                  ? "bg-[#1B242E] text-slate-200 shadow-[0_4px_12px_rgba(0,0,0,0.38)] cursor-pointer active:scale-[0.97] hover:scale-[1.02]"
                  : "bg-[#E6F1F8]/95 text-[#3B556C] shadow-[0_4px_12px_rgba(44,62,80,0.06)] cursor-pointer active:scale-[0.97] hover:scale-[1.02]"
                }`}
            >
              <Undo2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{t("blocks_undo")}</span>
            </button>
          </div>
        )}
      </div>

      {/* Adaptive Optical Upper-Middle Bottom Spacer (~36/64 weighted split) */}
      <div
        aria-hidden="true"
        style={{ flexGrow: 1.28, flexShrink: 1, flexBasis: "0px" }}
        className="w-full min-h-[12px]"
      />

      {/* Floating Drag Layer (1:1 Grid Cell Size + scale(1.1) Elevation) */}
      {dragState && floatingOverlayStyle && (
        <div
          aria-hidden="true"
          className={`fixed z-50 pointer-events-none ${dragState.isReturning
            ? ""
            : darkMode
              ? "drop-shadow-[0_18px_30px_rgba(0,0,0,0.58)]"
              : "drop-shadow-[0_18px_30px_rgba(44,62,80,0.22)]"
            }`}
          style={floatingOverlayStyle}
        >
          {renderPolyominoSquareTiles(
            dragState.piece,
            dragState.boardCellSize,
            dragState.boardGapPx
          )}
        </div>
      )}

      {/* Stage 2 End-Game Celebration Modal with Snapshot, Choreography, Audio/Haptics & Scrollable Standings */}
      {gameOverSummary && percentileData && (
        <BlockSyncEndGameModal
          darkMode={darkMode}
          finalScore={gameOverSummary.finalScore}
          previousBestScore={gameOverSummary.previousBestScore}
          bestScore={gameOverSummary.bestScore}
          initialSessionBest={gameOverSummary.initialSessionBest}
          isNewBest={gameOverSummary.isNewBest}
          percentileData={percentileData}
          finalBoardState={boardState}
          tileClasses={tileClasses}
          soloRuns={gameOverSummary.soloRuns}
          roomMode={isRoomMode}
          roomCode={gameOverSummary.roomCode}
          savedRoomBestScore={gameOverSummary.savedRoomBestScore}
          didImproveRoomScore={gameOverSummary.didImproveRoomScore}
          endReason={gameOverSummary.endReason}
          standings={
            isRoomMode
              ? (() => {
                const base = (roomStandings || []).map((entry) =>
                  entry.isSelf
                    ? {
                      ...entry,
                      score: Math.max(entry.score, gameOverSummary.finalScore),
                      statusLabel: undefined,
                    }
                    : { ...entry }
                );
                if (!base.some((entry) => entry.isSelf)) {
                  base.push({
                    id: uidRef.current || "self",
                    name: t("blocks_you"),
                    score: gameOverSummary.finalScore,
                    isSelf: true,
                    statusLabel: undefined,
                  });
                }
                base.sort((a, b) => {
                  const aDone = !a.statusLabel;
                  const bDone = !b.statusLabel;
                  if (aDone !== bDone) return aDone ? -1 : 1;
                  return b.score - a.score;
                });
                return base;
              })()
              : roomStandings
          }
          onPlayAgain={handlePlayAgain}
          onBackHome={handleNavigateHomeClick}
          onScoreTick={(tickIndex) =>
            playScoreCountTickSound(tickIndex, soundOnRef.current)
          }
          onNewBestReveal={() => {
            playNewBestChordSound(soundOnRef.current);
            triggerBlockSyncHaptic("success-double");
          }}
          onPodiumReveal={(rank) => {
            playPodiumChimeSound(rank, soundOnRef.current);
            triggerBlockSyncHaptic(rank === 1 ? "success-double" : "medium");
          }}
          onModalSettledChange={(settled) => {
            endGameModalSettledRef.current = settled;
          }}
          onButtonTapCue={(action) => {
            stopSustainedBlocksAudio(0.05);
            playModalTapSound(action, soundOnRef.current);
            triggerBlockSyncHaptic(action === "playAgain" ? "medium" : "light");
          }}
          registerPlayAgainTrigger={registerPlayAgainTrigger}
        />
      )}

      {/* Interactive "How to Play" Guide (auto-opens on first visit) */}
      {showTutorial && (
        <div
          role="dialog"
          aria-modal="true"
          data-block-sync-dialog="true"
          aria-labelledby="block-sync-tutorial-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowTutorial(false);
            }
          }}
          className={`fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-sm ${darkMode ? "bg-black/60" : "bg-[#2C3E50]/25"
            }`}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative block-sync-fade-in w-full max-w-[360px] max-h-[calc(100dvh-32px)] overflow-y-auto px-5 py-5 rounded-3xl border-none flex flex-col items-center gap-3 text-center ${darkMode
              ? "bg-[#1B242E] text-slate-100 shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
              : "bg-[#F8FBFE] text-[#2C3E50] shadow-[0_24px_60px_rgba(44,62,80,0.14)]"
              }`}
          >
            <div className="w-full flex items-center justify-between gap-2 shrink-0">
              <span className="w-8 shrink-0" aria-hidden="true" />
              <h2
                id="block-sync-tutorial-title"
                className="text-lg sm:text-xl font-bold tracking-tight"
              >
                {t("blocks_how_to_play_title")}
              </h2>
              <button
                id="block-sync-tutorial-close-button"
                type="button"
                aria-label={t("closeBtn")}
                title={t("closeBtn")}
                onClick={() => setShowTutorial(false)}
                className={`w-8 h-8 rounded-full border-none shrink-0 flex items-center justify-center cursor-pointer transition-colors duration-150 active:scale-90 ${darkMode
                  ? "bg-[#141A21] hover:bg-[#24303D] text-slate-300"
                  : "bg-[#E6F1F8] hover:bg-[#D5E6F3] text-[#49637A]"
                  }`}
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* 6x6 Real 3x3 Checkerboard 4-Stage Interactive Demo (Row -> Column -> 3x3 Box -> Combo x2) */}
            {(() => {
              const stageConfigs = [
                {
                  key: "row",
                  label: "Row Clear",
                  color: "emerald" as PastelColorKey,
                  prefilled: ["2,0", "2,1", "2,4", "2,5"],
                  targets: ["2,2", "2,3"],
                  pieceOffsets: [
                    [0, 0],
                    [0, 1],
                  ] as readonly [number, number][],
                  cols: 2,
                  rows: 1,
                  startX: 90,
                  startY: 197,
                  dx: 0,
                  dy: -131,
                  fingerX: 112,
                  fingerY: 207,
                  popText: "+100",
                  popTop: 60,
                  isCombo: false,
                },
                {
                  key: "col",
                  label: "Column Clear",
                  color: "sky" as PastelColorKey,
                  prefilled: ["0,2", "1,2", "4,2", "5,2"],
                  targets: ["2,2", "3,2"],
                  pieceOffsets: [
                    [0, 0],
                    [1, 0],
                  ] as readonly [number, number][],
                  cols: 1,
                  rows: 2,
                  startX: 103,
                  startY: 184,
                  dx: -13,
                  dy: -118,
                  fingerX: 112,
                  fingerY: 205,
                  popText: "+100",
                  popTop: 72,
                  isCombo: false,
                },
                {
                  key: "box",
                  label: "3×3 Box Clear",
                  color: "violet" as PastelColorKey,
                  prefilled: ["0,3", "0,4", "0,5", "1,3", "1,5", "2,5"],
                  targets: ["1,4", "2,3", "2,4"],
                  pieceOffsets: [
                    [0, 1],
                    [1, 0],
                    [1, 1],
                  ] as readonly [number, number][],
                  cols: 2,
                  rows: 2,
                  startX: 90,
                  startY: 184,
                  dx: 26,
                  dy: -144,
                  fingerX: 112,
                  fingerY: 206,
                  popText: "+100",
                  popTop: 42,
                  isCombo: false,
                },
                {
                  key: "combo",
                  label: `${t("blocks_combo_x", { n: 2 })}!`,
                  color: "rose" as PastelColorKey,
                  prefilled: [
                    "3,0", "3,1", "3,2",
                    "4,0", "4,3", "4,4", "4,5",
                    "5,0", "5,1", "5,2",
                  ],
                  targets: ["4,1", "4,2"],
                  pieceOffsets: [
                    [0, 0],
                    [0, 1],
                  ] as readonly [number, number][],
                  cols: 2,
                  rows: 1,
                  startX: 90,
                  startY: 197,
                  dx: -26,
                  dy: -79,
                  fingerX: 112,
                  fingerY: 207,
                  popText: `${t("blocks_combo_x", { n: 2 })}! · +400`,
                  popTop: 94,
                  isCombo: true,
                },
              ];

              const activeStage = stageConfigs[tutorialStage] || stageConfigs[0];
              const prefilledSet = new Set(activeStage.prefilled);
              const targetSet = new Set(activeStage.targets);
              const demoHoverClass = darkMode
                ? HOVER_PREVIEW_CLASSES_DARK[activeStage.color]
                : HOVER_PREVIEW_CLASSES_LIGHT[activeStage.color];

              return (
                <div className="w-full flex flex-col items-center gap-2 shrink-0">
                  {/* Subtle Step Pill Above Mini-Board */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide ${activeStage.isCombo
                      ? darkMode
                        ? "bg-[#2C243D] text-[#D8B4FE]"
                        : "bg-purple-200/90 text-[#432C7A]"
                      : darkMode
                        ? "bg-[#141A21] text-[#38BDF8]"
                        : "bg-[#E6F1F8] text-[#2B8CEE]"
                      }`}
                  >
                    {activeStage.isCombo && (
                      <Sparkles className="w-3 h-3 shrink-0" aria-hidden="true" />
                    )}
                    <span>{activeStage.label}</span>
                  </span>

                  {/* Self-Contained 6x6 Mini-Board (2x2 of 3x3 Zones) + Tray Stage */}
                  <div
                    key={`tut-stage-${activeStage.key}`}
                    aria-hidden="true"
                    style={
                      {
                        "--bs-tut-dx": `${activeStage.dx}px`,
                        "--bs-tut-dy": `${activeStage.dy}px`,
                      } as React.CSSProperties
                    }
                    className={`relative w-[228px] h-[240px] rounded-3xl overflow-hidden shrink-0 ${darkMode
                      ? "bg-[#141A21] shadow-[inset_0_2px_10px_rgba(0,0,0,0.55)]"
                      : "bg-[#EBF3F9] shadow-[inset_0_2px_10px_rgba(140,178,209,0.28)]"
                      }`}
                  >
                    {/* Authentic 6x6 Checkerboard Mini-Board (left=30px, top=6px, p=8px -> cell 22px, gap 4px) */}
                    <div
                      className={`absolute left-[30px] top-[6px] w-[168px] h-[168px] p-[8px] rounded-2xl ${darkMode
                        ? "bg-[#19222C] border border-slate-700/50 shadow-[0_8px_20px_rgba(0,0,0,0.48)]"
                        : "bg-[#D1E4F3]/95 border border-[#B7D2E8]/60 shadow-[0_8px_20px_rgba(44,62,80,0.08)]"
                        }`}
                    >
                      <div className="grid grid-cols-6 grid-rows-6 gap-[4px]">
                        {Array.from({ length: 36 }, (_, idx) => {
                          const r = Math.floor(idx / 6);
                          const c = idx % 6;
                          const cellCoord = `${r},${c}`;
                          const isAltBox = (Math.floor(r / 3) + Math.floor(c / 3)) % 2 === 1;
                          const isPrefilled = prefilledSet.has(cellCoord);
                          const isTarget = targetSet.has(cellCoord);

                          const pocketCls = darkMode
                            ? isAltBox
                              ? "border-none bg-[#283747] shadow-[inset_0_2px_5px_rgba(0,0,0,0.52)]"
                              : "border-none bg-[#0E141B] shadow-[inset_0_2px_6px_rgba(0,0,0,0.74)]"
                            : isAltBox
                              ? "border-none bg-[#BDD9EE]/95 shadow-[inset_0_2px_4px_rgba(78,122,160,0.24)]"
                              : "border-none bg-white shadow-[inset_0_2px_4px_rgba(116,154,186,0.16)]";

                          return (
                            <div
                              key={`tut-6x6-${cellCoord}`}
                              className={`relative w-[22px] h-[22px] rounded-[24%] ${pocketCls}`}
                            >
                              {isTarget && (
                                <div
                                  className={`absolute inset-0 rounded-[24%] bs-tut-hover ${demoHoverClass}`}
                                />
                              )}
                              {isPrefilled && (
                                <div
                                  className={`absolute inset-0 rounded-[24%] bs-tut-vanish ${tileClasses[activeStage.color]} !shadow-none`}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Matching Mini Spawner Tray Slot Below Mini-Board */}
                    <div
                      className={`absolute left-[30px] top-[182px] w-[168px] h-[52px] rounded-2xl ${darkMode
                        ? "bg-[#1B242E] shadow-[inset_0_2px_6px_rgba(0,0,0,0.45)]"
                        : "bg-[#E8F2FA]/90 border border-[#C4DCEF]/75 shadow-[inset_0_2px_6px_rgba(140,178,209,0.2)]"
                        }`}
                    />

                    {/* Dragged Polyomino Piece */}
                    <div
                      style={{
                        left: `${activeStage.startX}px`,
                        top: `${activeStage.startY}px`,
                        width: `${activeStage.cols * 22 + (activeStage.cols - 1) * 4}px`,
                        height: `${activeStage.rows * 22 + (activeStage.rows - 1) * 4}px`,
                      }}
                      className="absolute bs-tut-piece pointer-events-none z-10"
                    >
                      {activeStage.pieceOffsets.map(([pr, pc], pIdx) => (
                        <div
                          key={`tut-drag-sq-${pIdx}`}
                          style={{
                            left: `${pc * 26}px`,
                            top: `${pr * 26}px`,
                          }}
                          className={`absolute w-[22px] h-[22px] rounded-[24%] ${tileClasses[activeStage.color]}`}
                        />
                      ))}
                    </div>

                    {/* Crisp Score / Combo Pop Over Cleared Cells */}
                    <div
                      style={{ top: `${activeStage.popTop}px` }}
                      className="pointer-events-none absolute inset-x-0 flex justify-center z-20 bs-tut-pop"
                    >
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold tracking-wide whitespace-nowrap ${activeStage.isCombo
                          ? darkMode
                            ? "bg-[#2C243D] text-[#D8B4FE] shadow-[0_6px_14px_rgba(0,0,0,0.45)]"
                            : "bg-purple-200 text-[#432C7A] shadow-[0_6px_14px_rgba(67,44,122,0.16)]"
                          : darkMode
                            ? "bg-[#22303E] text-yellow-300 shadow-[0_6px_14px_rgba(0,0,0,0.45)]"
                            : "bg-yellow-200 text-[#92400E] shadow-[0_6px_14px_rgba(140,178,209,0.28)]"
                          }`}
                      >
                        {activeStage.popText}
                      </span>
                    </div>

                    {/* Pointer Hand Tracking Drag Movement */}
                    <div
                      style={{
                        left: `${activeStage.fingerX}px`,
                        top: `${activeStage.fingerY}px`,
                      }}
                      className={`pointer-events-none absolute z-30 drop-shadow-sm bs-tut-finger ${darkMode ? "text-slate-100" : "text-[#2C3E50]"
                        }`}
                    >
                      <Hand className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Subtle 4-Dot Stage Indicator (tappable for instant inspection) */}
                  <div className="flex items-center justify-center gap-1.5" role="tablist" aria-label="Demo steps">
                    {stageConfigs.map((st, idx) => {
                      const isActive = tutorialStage === idx;
                      return (
                        <button
                          key={`tut-dot-${st.key}`}
                          type="button"
                          aria-label={st.label}
                          aria-selected={isActive}
                          onClick={() => setTutorialStage(idx as 0 | 1 | 2 | 3)}
                          className={`h-1.5 rounded-full border-none cursor-pointer transition-all duration-200 ${isActive
                            ? darkMode
                              ? "w-5 bg-[#38BDF8]"
                              : "w-5 bg-[#2B8CEE]"
                            : darkMode
                              ? "w-1.5 bg-slate-600/70 hover:bg-slate-500"
                              : "w-1.5 bg-[#B7D2E8] hover:bg-[#8FB7D8]"
                            }`}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            <ol className="w-full flex flex-col gap-2 text-left text-sm font-medium">
              {[
                t("blocks_how_to_play_step1"),
                t("blocks_how_to_play_step2"),
                t("blocks_how_to_play_step3"),
              ].map((text, idx) => (
                <li key={`tut-step-${idx}`} className="flex items-start gap-2.5">
                  <span
                    className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${darkMode
                      ? "bg-[#243445] text-[#A9D2EE]"
                      : "bg-sky-200 text-[#2E5E82]"
                      }`}
                  >
                    {idx + 1}
                  </span>
                  <span className={darkMode ? "text-slate-300" : "text-[#49637A]"}>
                    {text}
                  </span>
                </li>
              ))}
            </ol>

            <button
              id="block-sync-tutorial-start-button"
              type="button"
              onClick={() => setShowTutorial(false)}
              className={`w-full py-3.5 px-5 rounded-2xl border-none font-semibold text-sm transition-transform duration-150 active:scale-[0.98] hover:scale-[1.02] ${darkMode
                ? "bg-[#6CA3CA] text-slate-950 shadow-[0_8px_22px_rgba(0,0,0,0.38)]"
                : "bg-[#CFE4F4] text-[#223447] shadow-[0_8px_22px_rgba(140,178,209,0.28)]"
                }`}
            >
              {isRunInProgress ? t("blocks_got_it") : t("blocks_got_it_play")}
            </button>
          </div>
        </div>
      )}

      {/* Stage 2 Context-Aware Block Sync Settings & Match History Modal */}
      {isSettingsOpen && (
        <BlockSyncSettingsModal
          darkMode={darkMode}
          uid={uid}
          currentScore={score}
          tileClasses={tileClasses}
          soundOn={soundOn}
          musicOn={musicOn}
          vibrationsOn={vibrationsOn}
          language={language}
          onToggleSound={() => applySoundSetting(!soundOnRef.current, false)}
          onToggleMusic={handleToggleMusic}
          onToggleVibrations={handleToggleVibrations}
          onChangeLanguage={onLanguageChange}
          onReplay={() => {
            onCloseSettings?.();
            handlePlayAgain();
          }}
          onGoHome={() => {
            onCloseSettings?.();
            handleNavigateHomeClick();
          }}
          onOpenMoreGames={() => {
            persistActiveSession();
            onCloseSettings?.();
            if (onOpenMoreGames) {
              onOpenMoreGames();
            } else {
              handleNavigateHomeClick();
            }
          }}
          onClose={() => onCloseSettings?.()}
          onPlayUiSound={(cue) =>
            playBlockSyncSettingsUiSound(cue, soundOnRef.current)
          }
          onTriggerHaptic={(kind) => triggerBlockSyncHaptic(kind)}
        />
      )}
    </main>
  );
};

export default BlockSyncGame;
