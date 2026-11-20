/**
 * Deterministic Seeded Polyomino Engine, Types & Per-Room Pending Session Vault
 * for Block Sync Multiplayer.
 * Zero side effects on Solo `blocks_*_savedSession` or Sudoku `sudoku_vault_*`.
 */

import { loadBlocksSavedSession } from "../../utils/storageEngine";

export type BlockSyncRoomMode = "classic" | "rush";
export type BlockSyncRoomTimeLimitSec = 120 | 180 | 300 | 600;

export interface BlockSyncRoomConfig {
  roomCode: string;
  roomSeed: number;
  mode: BlockSyncRoomMode;
  undoAllowed: boolean;
  timeLimitSec: BlockSyncRoomTimeLimitSec;
  isHost?: boolean;
  isLocked?: boolean;
}

export interface BlockSyncRoomResultPayload {
  roomCode: string;
  score: number;
  linesCleared: number;
  bestCombo: number;
  mode: BlockSyncRoomMode;
  endReason: "out_of_moves" | "time_up";
  durationSec: number;
  boardSnapshot: (string | null)[][];
}

export type PolyominoMatrix = readonly (readonly (0 | 1)[])[];

export type BlockTier = "small" | "medium" | "heavy";

export type BlockShapeId =
  | "dot-1x1"
  | "line-2"
  | "line-3"
  | "line-4"
  | "line-5"
  | "box-2x2"
  | "box-3x3"
  | "small-l"
  | "medium-l"
  | "big-l"
  | "t-shape"
  | "z-shape"
  | "s-shape"
  | "plus-cross";

export type PastelColorKey =
  | "yellow"
  | "emerald"
  | "emerald-mid"
  | "teal"
  | "emerald-rich"
  | "orange"
  | "amber"
  | "orange-deep"
  | "sky"
  | "indigo"
  | "cyan"
  | "violet"
  | "purple"
  | "rose";

export interface BlockShapeSpec {
  id: BlockShapeId;
  color: PastelColorKey;
  tier: BlockTier;
  variants: readonly { id: string; shape: PolyominoMatrix }[];
}

export interface PolyominoPiece {
  uid: string;
  shapeId: BlockShapeId;
  variantId: string;
  shape: PolyominoMatrix;
  color: PastelColorKey;
}

// 14 Core Polyomino Shapes & Complete Direction/Mirror Matrix with Base-Anchor Shading
export const BLOCK_POLYOMINO_SHAPES: readonly BlockShapeSpec[] = [
  {
    id: "dot-1x1",
    color: "yellow",
    tier: "small",
    variants: [{ id: "dot-1x1", shape: [[1]] }],
  },
  {
    id: "line-2",
    color: "emerald",
    tier: "small",
    variants: [
      { id: "line-2-h", shape: [[1, 1]] },
      { id: "line-2-v", shape: [[1], [1]] },
    ],
  },
  {
    id: "line-3",
    color: "emerald-mid",
    tier: "medium",
    variants: [
      { id: "line-3-h", shape: [[1, 1, 1]] },
      { id: "line-3-v", shape: [[1], [1], [1]] },
    ],
  },
  {
    id: "line-4",
    color: "teal",
    tier: "heavy",
    variants: [
      { id: "line-4-h", shape: [[1, 1, 1, 1]] },
      { id: "line-4-v", shape: [[1], [1], [1], [1]] },
    ],
  },
  {
    id: "line-5",
    color: "emerald-rich",
    tier: "heavy",
    variants: [
      { id: "line-5-h", shape: [[1, 1, 1, 1, 1]] },
      { id: "line-5-v", shape: [[1], [1], [1], [1], [1]] },
    ],
  },
  {
    id: "small-l",
    color: "orange",
    tier: "small",
    variants: [
      {
        id: "small-l-tl",
        shape: [
          [1, 1],
          [1, 0],
        ],
      },
      {
        id: "small-l-tr",
        shape: [
          [1, 1],
          [0, 1],
        ],
      },
      {
        id: "small-l-bl",
        shape: [
          [1, 0],
          [1, 1],
        ],
      },
      {
        id: "small-l-br",
        shape: [
          [0, 1],
          [1, 1],
        ],
      },
    ],
  },
  {
    id: "medium-l",
    color: "amber",
    tier: "medium",
    variants: [
      {
        id: "medium-l-v-br",
        shape: [
          [1, 0],
          [1, 0],
          [1, 1],
        ],
      },
      {
        id: "medium-l-v-bl",
        shape: [
          [0, 1],
          [0, 1],
          [1, 1],
        ],
      },
      {
        id: "medium-l-v-tr",
        shape: [
          [1, 1],
          [1, 0],
          [1, 0],
        ],
      },
      {
        id: "medium-l-v-tl",
        shape: [
          [1, 1],
          [0, 1],
          [0, 1],
        ],
      },
      {
        id: "medium-l-h-bl",
        shape: [
          [1, 1, 1],
          [1, 0, 0],
        ],
      },
      {
        id: "medium-l-h-br",
        shape: [
          [1, 1, 1],
          [0, 0, 1],
        ],
      },
      {
        id: "medium-l-h-tl",
        shape: [
          [1, 0, 0],
          [1, 1, 1],
        ],
      },
      {
        id: "medium-l-h-tr",
        shape: [
          [0, 0, 1],
          [1, 1, 1],
        ],
      },
    ],
  },
  {
    id: "big-l",
    color: "orange-deep",
    tier: "heavy",
    variants: [
      {
        id: "big-l-bl",
        shape: [
          [1, 0, 0],
          [1, 0, 0],
          [1, 1, 1],
        ],
      },
      {
        id: "big-l-br",
        shape: [
          [0, 0, 1],
          [0, 0, 1],
          [1, 1, 1],
        ],
      },
      {
        id: "big-l-tl",
        shape: [
          [1, 1, 1],
          [1, 0, 0],
          [1, 0, 0],
        ],
      },
      {
        id: "big-l-tr",
        shape: [
          [1, 1, 1],
          [0, 0, 1],
          [0, 0, 1],
        ],
      },
    ],
  },
  {
    id: "t-shape",
    color: "sky",
    tier: "medium",
    variants: [
      {
        id: "t-shape-down",
        shape: [
          [1, 1, 1],
          [0, 1, 0],
        ],
      },
      {
        id: "t-shape-up",
        shape: [
          [0, 1, 0],
          [1, 1, 1],
        ],
      },
      {
        id: "t-shape-right",
        shape: [
          [1, 0],
          [1, 1],
          [1, 0],
        ],
      },
      {
        id: "t-shape-left",
        shape: [
          [0, 1],
          [1, 1],
          [0, 1],
        ],
      },
    ],
  },
  {
    id: "z-shape",
    color: "indigo",
    tier: "medium",
    variants: [
      {
        id: "z-shape-h",
        shape: [
          [1, 1, 0],
          [0, 1, 1],
        ],
      },
      {
        id: "z-shape-v",
        shape: [
          [0, 1],
          [1, 1],
          [1, 0],
        ],
      },
    ],
  },
  {
    id: "s-shape",
    color: "cyan",
    tier: "medium",
    variants: [
      {
        id: "s-shape-h",
        shape: [
          [0, 1, 1],
          [1, 1, 0],
        ],
      },
      {
        id: "s-shape-v",
        shape: [
          [1, 0],
          [1, 1],
          [0, 1],
        ],
      },
    ],
  },
  {
    id: "plus-cross",
    color: "violet",
    tier: "heavy",
    variants: [
      {
        id: "plus-cross",
        shape: [
          [0, 1, 0],
          [1, 1, 1],
          [0, 1, 0],
        ],
      },
    ],
  },
  {
    id: "box-2x2",
    color: "purple",
    tier: "small",
    variants: [
      {
        id: "box-2x2",
        shape: [
          [1, 1],
          [1, 1],
        ],
      },
    ],
  },
  {
    id: "box-3x3",
    color: "rose",
    tier: "heavy",
    variants: [
      {
        id: "box-3x3-boss",
        shape: [
          [1, 1, 1],
          [1, 1, 1],
          [1, 1, 1],
        ],
      },
    ],
  },
];

export const EARLY_BLOCK_SHAPE_IDS: ReadonlySet<BlockShapeId> = new Set<BlockShapeId>([
  "dot-1x1",
  "line-2",
  "line-3",
  "small-l",
  "medium-l",
  "t-shape",
  "box-2x2",
]);

/**
 * Deterministic 32-bit FNV-1a + integer avalanche hash for `(seedInput, trayIndex)`.
 */
export function hashRoomSeed(seedInput: number | string, trayIndex = 0): number {
  const safeTray = Math.max(0, Math.floor(Number(trayIndex) || 0));
  let hash = 2166136261 >>> 0;

  if (typeof seedInput === "number" && Number.isFinite(seedInput)) {
    const intSeed = Math.floor(seedInput) >>> 0;
    hash ^= intSeed & 0xff;
    hash = Math.imul(hash, 16777619) >>> 0;
    hash ^= (intSeed >>> 8) & 0xff;
    hash = Math.imul(hash, 16777619) >>> 0;
    hash ^= (intSeed >>> 16) & 0xff;
    hash = Math.imul(hash, 16777619) >>> 0;
    hash ^= (intSeed >>> 24) & 0xff;
    hash = Math.imul(hash, 16777619) >>> 0;
  } else {
    const text = String(seedInput ?? "0");
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619) >>> 0;
    }
  }

  // Mix in trayIndex cleanly so nearby trays diverge uniformly
  hash ^= (safeTray + 0x9e3779b9) >>> 0;
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x85ebca6b) >>> 0;
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 0xc2b2ae35) >>> 0;
  hash ^= hash >>> 16;
  return hash >>> 0;
}

/**
 * Standard Mulberry32 deterministic PRNG returning uniform floats in `[0, 1)`.
 */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function getShapeWeightForTrayIndex(spec: BlockShapeSpec, trayIndex: number): number {
  if (trayIndex < 5) {
    if (!EARLY_BLOCK_SHAPE_IDS.has(spec.id)) return 0;
    return spec.tier === "small" ? 14 : 11;
  }

  // Progressive difficulty ramp from tray 5 -> tray 30 (independent of board occupancy)
  const progress = Math.min(1, (trayIndex - 5) / 25);
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

function pickSeededWeightedSpec(
  candidates: readonly BlockShapeSpec[],
  trayIndex: number,
  rng: () => number
): BlockShapeSpec {
  const weights = candidates.map((spec) =>
    Math.max(0.1, getShapeWeightForTrayIndex(spec, trayIndex))
  );
  let totalWeight = 0;
  for (let i = 0; i < weights.length; i += 1) {
    totalWeight += weights[i];
  }

  let roll = rng() * totalWeight;
  for (let i = 0; i < candidates.length; i += 1) {
    roll -= weights[i];
    if (roll <= 0) {
      return candidates[i];
    }
  }
  return candidates[0];
}

/**
 * Generates an identical 3-piece polyomino tray strictly from `(roomSeed, trayIndex)`.
 * Pure function: produces exact same shapes, rotations, and pastel colors on any browser/device.
 */
export function generateSeededBlockTray(
  roomSeed: number,
  trayIndex: number
): PolyominoPiece[] {
  const safeTrayIndex = Math.max(0, Math.floor(Number(trayIndex) || 0));
  const normalizedSeed = Math.floor(Number(roomSeed) || 0) >>> 0;
  const rng = mulberry32(hashRoomSeed(normalizedSeed, safeTrayIndex));

  const eligibleSpecs = BLOCK_POLYOMINO_SHAPES.filter(
    (spec) => getShapeWeightForTrayIndex(spec, safeTrayIndex) > 0
  );
  const usedInTray = new Set<BlockShapeId>();
  const tray: PolyominoPiece[] = [];

  for (let slotIdx = 0; slotIdx < 3; slotIdx += 1) {
    let candidates = eligibleSpecs.filter((spec) => !usedInTray.has(spec.id));
    if (candidates.length === 0) {
      candidates = eligibleSpecs;
    }

    const chosenSpec = pickSeededWeightedSpec(candidates, safeTrayIndex, rng);
    const variantIdx = Math.floor(rng() * chosenSpec.variants.length);
    const chosenVariant = chosenSpec.variants[variantIdx] || chosenSpec.variants[0];

    usedInTray.add(chosenSpec.id);
    tray.push({
      uid: `block-room-${normalizedSeed}-t${safeTrayIndex}-s${slotIdx}`,
      shapeId: chosenSpec.id,
      variantId: chosenVariant.id,
      shape: chosenVariant.shape,
      color: chosenSpec.color,
    });
  }

  return tray;
}

// ============================================================================
// UID-ISOLATED PER-ROOM PENDING SESSION VAULT (MAX 5 ACTIVE ROOMS)
// ============================================================================

export interface BlockSyncPendingRoomTraySlot {
  id: string;
  shapeId: string;
  cells: number[][];
  colorKey: string;
}

export interface BlockSyncPendingRoomSession {
  config: BlockSyncRoomConfig;
  board: (string | null)[][];
  tray: Array<BlockSyncPendingRoomTraySlot | null>;
  roomTrayIndex: number;
  score: number;
  linesCleared: number;
  bestCombo: number;
  startedAt: number;
  rushEndAt?: number;
  updatedAt: number;
}

const MAX_PENDING_ROOM_SESSIONS = 5;
const BLOCKS_ROOM_SESSIONS_GUEST_KEY = "blocks_guest_roomSessions";

function isGuestRoomIdentity(uid?: string | null): boolean {
  if (
    !uid ||
    typeof uid !== "string" ||
    uid.trim() === "" ||
    uid === "guest" ||
    uid === "GUEST" ||
    uid === "GUEST_ANON" ||
    uid.startsWith("GUEST_")
  ) {
    return true;
  }
  return false;
}

export function getBlocksRoomSessionsKey(uid?: string | null): string {
  return isGuestRoomIdentity(uid)
    ? BLOCKS_ROOM_SESSIONS_GUEST_KEY
    : `blocks_user_${uid!.trim()}_roomSessions`;
}

function sanitizePendingRoomSession(raw: unknown): BlockSyncPendingRoomSession | null {
  if (!raw || typeof raw !== "object") return null;
  const candidate = raw as Record<string, unknown>;
  const rawConfig = candidate.config as Record<string, unknown> | undefined;
  if (!rawConfig || typeof rawConfig !== "object") return null;

  const roomCode = typeof rawConfig.roomCode === "string" ? rawConfig.roomCode.trim() : "";
  const roomSeed = Number(rawConfig.roomSeed);
  const mode: BlockSyncRoomMode = rawConfig.mode === "rush" ? "rush" : "classic";
  const undoAllowed = Boolean(rawConfig.undoAllowed);
  const rawLimit = Number(rawConfig.timeLimitSec);
  const timeLimitSec: BlockSyncRoomTimeLimitSec =
    rawLimit === 120 || rawLimit === 300 || rawLimit === 600 ? rawLimit : 180;

  if (!roomCode || !Number.isFinite(roomSeed)) return null;

  const rawBoard = candidate.board;
  if (
    !Array.isArray(rawBoard) ||
    rawBoard.length !== 9 ||
    !rawBoard.every(
      (row) =>
        Array.isArray(row) &&
        row.length === 9 &&
        row.every((cell) => cell === null || typeof cell === "string")
    )
  ) {
    return null;
  }

  const rawTray = candidate.tray;
  if (!Array.isArray(rawTray) || rawTray.length !== 3) {
    return null;
  }

  const tray: Array<BlockSyncPendingRoomTraySlot | null> = rawTray.map((slot) => {
    if (slot === null) return null;
    if (!slot || typeof slot !== "object") return null;
    const s = slot as Record<string, unknown>;
    if (
      typeof s.id !== "string" ||
      typeof s.shapeId !== "string" ||
      typeof s.colorKey !== "string" ||
      !Array.isArray(s.cells) ||
      s.cells.length === 0 ||
      !s.cells.every(
        (r) => Array.isArray(r) && r.length > 0 && r.every((v) => v === 0 || v === 1)
      )
    ) {
      return null;
    }
    return {
      id: s.id,
      shapeId: s.shapeId,
      cells: (s.cells as number[][]).map((r) => [...r]),
      colorKey: s.colorKey,
    };
  });

  const roomTrayIndex = Math.max(0, Math.floor(Number(candidate.roomTrayIndex) || 0));
  const score = Math.max(0, Math.floor(Number(candidate.score) || 0));
  const linesCleared = Math.max(0, Math.floor(Number(candidate.linesCleared) || 0));
  const bestCombo = Math.max(0, Math.floor(Number(candidate.bestCombo) || 0));
  const startedAt = Math.max(0, Number(candidate.startedAt) || Date.now());
  const updatedAt = Math.max(0, Number(candidate.updatedAt) || startedAt);
  const rushEndAtNum = Number(candidate.rushEndAt);

  return {
    config: {
      roomCode,
      roomSeed,
      mode,
      undoAllowed,
      timeLimitSec,
      ...(typeof rawConfig.isHost === "boolean" ? { isHost: rawConfig.isHost } : {}),
      ...(typeof rawConfig.isLocked === "boolean" ? { isLocked: rawConfig.isLocked } : {}),
    },
    board: (rawBoard as (string | null)[][]).map((row) => [...row]),
    tray,
    roomTrayIndex,
    score,
    linesCleared,
    bestCombo,
    startedAt,
    ...(Number.isFinite(rushEndAtNum) && rushEndAtNum > 0
      ? { rushEndAt: rushEndAtNum }
      : {}),
    updatedAt,
  };
}

function writePendingRoomSessions(
  uid: string | null | undefined,
  sessions: BlockSyncPendingRoomSession[]
): void {
  if (typeof window === "undefined") return;
  try {
    const key = getBlocksRoomSessionsKey(uid);
    if (sessions.length === 0) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(sessions.slice(0, MAX_PENDING_ROOM_SESSIONS)));
    }
  } catch {
    // Ignore quota or storage restriction errors silently
  }
}

/**
 * Loads active pending multiplayer room sessions (newest-first, capped at 5).
 */
export function loadPendingBlocksRoomSessions(
  uid?: string | null
): BlockSyncPendingRoomSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(getBlocksRoomSessionsKey(uid));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const byCode = new Map<string, BlockSyncPendingRoomSession>();
    for (const item of parsed) {
      const clean = sanitizePendingRoomSession(item);
      if (!clean) continue;
      const existing = byCode.get(clean.config.roomCode);
      if (!existing || clean.updatedAt > existing.updatedAt) {
        byCode.set(clean.config.roomCode, clean);
      }
    }

    return Array.from(byCode.values())
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, MAX_PENDING_ROOM_SESSIONS);
  } catch {
    return [];
  }
}

/**
 * Returns the pending saved session for `roomCode` if present.
 */
export function getPendingBlocksRoomSession(
  uid: string | null | undefined,
  roomCode: string
): BlockSyncPendingRoomSession | null {
  const cleanCode = (roomCode || "").trim();
  if (!cleanCode) return null;
  const list = loadPendingBlocksRoomSessions(uid);
  return list.find((s) => s.config.roomCode === cleanCode) ?? null;
}

/**
 * Upserts a pending room session by `roomCode` and caps the list at the 5 newest rooms.
 */
export function savePendingBlocksRoomSession(
  uid: string | null | undefined,
  session: BlockSyncPendingRoomSession
): BlockSyncPendingRoomSession[] {
  const current = loadPendingBlocksRoomSessions(uid);
  const filtered = current.filter((s) => s.config.roomCode !== session.config.roomCode);
  const stamped: BlockSyncPendingRoomSession = {
    ...session,
    updatedAt: Number.isFinite(session.updatedAt) && session.updatedAt > 0
      ? session.updatedAt
      : Date.now(),
  };
  const next = [stamped, ...filtered]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, MAX_PENDING_ROOM_SESSIONS);
  writePendingRoomSessions(uid, next);
  return next;
}

/**
 * Removes a finished or abandoned room session cleanly by `roomCode`.
 */
export function clearPendingBlocksRoomSession(
  uid: string | null | undefined,
  roomCode: string
): BlockSyncPendingRoomSession[] {
  const cleanCode = (roomCode || "").trim();
  const current = loadPendingBlocksRoomSessions(uid);
  const next = current.filter((s) => s.config.roomCode !== cleanCode);
  writePendingRoomSessions(uid, next);
  return next;
}

/**
 * Returns the newest active pending multiplayer room session for quick resume, or `null`.
 */
export function getMostRecentPendingBlocksRoom(
  uid?: string | null
): BlockSyncPendingRoomSession | null {
  const list = loadPendingBlocksRoomSessions(uid);
  return list[0] ?? null;
}

/**
 * Read-only helper returning Solo's saved `score` if a non-empty `blocks_*_savedSession` exists.
 * Never mutates or clears Solo's saved session.
 */
export function getBlocksSavedSoloScore(uid?: string | null): number | null {
  const soloSession = loadBlocksSavedSession(uid);
  if (!soloSession) return null;
  const hasProgress =
    soloSession.score > 0 ||
    soloSession.historyStack.length > 0 ||
    soloSession.boardState.some((row) => row.some((cell) => cell !== null));
  return hasProgress ? soloSession.score : null;
}
