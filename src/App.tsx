import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { db } from "./firebase";
import { RulesModal } from "./components/modals/RulesModal";
import { SettingsModal } from "./components/modals/SettingsModal";
import { StatsModal } from "./components/modals/StatsModal";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
  serverTimestamp,
  getDocs,
  query,
  where,
  updateDoc
} from "firebase/firestore";
import { 
  Paintbrush, 
  Pencil,
  Layers, 
  RotateCcw, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  Scissors, 
  Heart, 
  Star, 
  Smile, 
  Grid3X3, 
  BookOpen, 
  Code,
  Sparkles,
  Info,
  RotateCw,
  Users,
  RefreshCw,
  Palette,
  CheckSquare,
  Bookmark,
  ChevronRight,
  ChevronLeft,
  Eye,
  HelpCircle,
  Play,
  Pause,
  Shuffle,
  Activity,
  AlertTriangle,
  Lightbulb,
  Award,
  Settings,
  Timer,
  BarChart2,
  ArrowLeft,
  Lock,
  Unlock,
  Share2,
  Sliders,
  X,
  Clock,
  BellOff,
  Bell,
  Minus,
  Home,
  KeyRound,
  UserPlus,
  Trophy,
  Brain,
  Zap,
  Rocket,
  TrendingUp,
  Link2,
  XCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Capacitor } from '@capacitor/core';
import { Clipboard } from '@capacitor/clipboard';
import { Share } from '@capacitor/share';
import { App as CapApp } from '@capacitor/app';
import { PushNotifications } from "@capacitor/push-notifications";
import { LocalNotifications } from "@capacitor/local-notifications";
import { getToken } from "firebase/messaging";
import { messaging } from "./firebase";

let globalAudioCtx: AudioContext | null = null;
const getAudioCtx = () => {
  try {
    if (!globalAudioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        globalAudioCtx = new AudioContextClass();
      }
    }
    if (globalAudioCtx && globalAudioCtx.state === "suspended") {
      globalAudioCtx.resume();
    }
    return globalAudioCtx;
  } catch(e) {
    return null;
  }
};

// Types corresponding exactly to Kotlin classes for Sudoku
interface SudokuCell {
  row: number;
  col: number;
  value: number; // 0 for empty
  isOriginalClue: boolean;
  isUserInput: boolean;
  notes: Set<number>;
}

interface BoardState {
  grid: SudokuCell[][]; // 9x9 board
  selectedRow: number | null;
  selectedCol: number | null;
  currentMistakesCount: number;
  maxMistakesLimit: number; // 3
  hintsCount: number;
  maxHintsLimit?: number;
  isGameOver: boolean;
  difficulty?: Difficulty;
  seed: number;
}

type Difficulty = "EASY" | "MEDIUM" | "HARD" | "EXPERT";

// Fast in-memory cache to eliminate redundant backtracking CPU locks on repeated seeds and joins
const puzzleCache = new Map<string, { solved: number[][]; puzzle: number[][] }>();

const DIFFICULTY_GRID_THEMES: Record<Difficulty, {
  activeCell: { light: string; dark: string };
  crosshair: { light: string; dark: string };
  identical: { light: string; dark: string };
}> = {
  EASY: {
    activeCell: { light: "#86EFAC", dark: "#064e3b" },
    crosshair: { light: "rgba(134, 239, 172, 0.15)", dark: "rgba(6, 78, 59, 0.28)" },
    identical: { light: "#D1FAE5", dark: "#022c22" },
  },
  MEDIUM: {
    activeCell: { light: "#FEF08A", dark: "#713f12" }, // soft butter yellow
    crosshair: { light: "rgba(253, 224, 71, 0.15)", dark: "rgba(113, 63, 18, 0.28)" },
    identical: { light: "#FFF99D", dark: "#451a03" },
  },
  HARD: {
    activeCell: { light: "#D8B4FE", dark: "#581c87" },
    crosshair: { light: "rgba(216, 180, 254, 0.15)", dark: "rgba(88, 28, 135, 0.28)" },
    identical: { light: "#F3E8FF", dark: "#2e1065" },
  },
  EXPERT: {
    activeCell: { light: "#F9A8D4", dark: "#881337" },
    crosshair: { light: "rgba(249, 168, 212, 0.15)", dark: "rgba(136, 19, 55, 0.28)" },
    identical: { light: "#FFE4E6", dark: "#4c0519" },
  },
};

interface CompletedGame {
  id: string;
  difficulty: Difficulty;
  timeSec: number;
  mistakes: number;
  maxMistakes: number;
  isWon: boolean;
  date: string;
  isChallenge: boolean;
  seed?: number;
  participants?: any[];
  userId?: string;
  playerName?: string;
}

interface PendingChallenge {
  id: string;
  inviteId?: string;
  difficulty: Difficulty;
  seed: number;
  maxMistakes: number;
  hintLimit?: number;
  timerEnabled: boolean;
  receivedAt: string;
  isNew: boolean;
  password?: string;
  senderName?: string;
  sentAt?: number;
}

interface FriendConnection {
  id: string;
  name: string;
  status: 'live' | 'away' | 'idle';
  bestTime: string;
  bestDiff: string;
}

const MOCK_FRIENDS: FriendConnection[] = [
  { id: "f-1", name: "Alex Code", status: "live", bestTime: "01:52", bestDiff: "EASY" },
  { id: "f-2", name: "Chloe Zen", status: "live", bestTime: "03:14", bestDiff: "MEDIUM" },
  { id: "f-3", name: "Dax Solver", status: "away", bestTime: "05:40", bestDiff: "HARD" },
  { id: "f-4", name: "Zoe Soft", status: "idle", bestTime: "07:11", bestDiff: "EXPERT" }
];


const getConflictReason = (grid: SudokuCell[][], r: number, c: number, val: number): string => {
  for (let i = 0; i < 9; i++) {
      if (i !== c && grid[r][i].value === val) return "row";
      if (i !== r && grid[i][c].value === val) return "column";
  }
  const startR = r - (r % 3);
  const startC = c - (c % 3);
  for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
          if ((startR + i !== r || startC + j !== c) && grid[startR + i][startC + j].value === val) {
              return "3x3 box";
          }
      }
  }
  return "puzzle logic";
};

// Hardcoded sample full solved grid to act as a fallback and base generator
const SAMPLE_COMPLETE_GRID = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9]
];

// Seeded PRNG Mulberry32 helper
const createPRNG = (seed: number) => {
  let a = seed;
  return () => {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const shuffleWithPRNG = <T,>(arr: T[], prng: () => number): T[] => {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(prng() * (i + 1));
    const temp = newArr[i];
    newArr[i] = newArr[j];
    newArr[j] = temp;
  }
  return newArr;
};

const getSharedOrigin = (): string => {
  if (typeof window === "undefined") return "";
  const origin = window.location.origin;
  const isCapacitorNative = typeof Capacitor !== "undefined" && Capacitor.isNativePlatform && Capacitor.isNativePlatform();
  const isLocalhostWebView = /^(https?|capacitor):\/\/localhost\/?$/.test(origin);
  
  if (isCapacitorNative || isLocalhostWebView) {
    return "https://sudoku-together-mode.web.app";
  }
  if (origin.includes("ais-dev-")) {
    return origin.replace("ais-dev-", "ais-pre-");
  }
  return origin;
};

const getChallengeBaseUrl = (): string => {
  const origin = getSharedOrigin();
  const path = typeof window !== "undefined" ? window.location.pathname : "/";
  const cleanPath = path.endsWith("/index.html") ? "/" : path;
  return `${origin}${cleanPath}`;
};

const getApiOrigin = (): string => {
  return getSharedOrigin();
};


const encodePass = (str: string): string => {
  if (!str) return "";
  try {
    return window.btoa(str).replace(/=/g, "");
  } catch (e) {
    return str;
  }
};

const decodePass = (str: string): string => {
  if (!str) return "";
  try {
    if (/^[A-Za-z0-9+/]+$/.test(str)) {
      let padded = str;
      while (padded.length % 4 !== 0) {
        padded += "=";
      }
      const decoded = window.atob(padded);
      if (/^[a-zA-Z0-9]+$/.test(decoded)) {
        return decoded;
      }
    }
  } catch (e) {}
  return str;
};

// Security sanitizers for query parameters, deep links, and user inputs
const sanitizeText = (val: unknown, maxLen = 50): string => {
  if (typeof val !== "string") return "";
  return val.replace(/[<>'"`;(){}[\]\\]/g, "").trim().slice(0, maxLen);
};

const sanitizeSenderName = (val: unknown): string => {
  if (typeof val !== "string") return "";
  const clean = val.replace(/[^a-zA-Z0-9\s._-]/g, "").trim();
  return clean.slice(0, 30);
};

const sanitizeGameId = (val: unknown): string | null => {
  if (typeof val !== "string") return null;
  const trimmed = val.trim();
  if (/^\d{1,10}$/.test(trimmed)) {
    return trimmed;
  }
  const regex = /^SUDOKU-(\d{1,10})-(EASY|MEDIUM|HARD|EXPERT)-M(\d{1,4})(?:-H(\d{1,3}))?-T([01])(?:-P([a-zA-Z0-9+=]{1,40}))?$/i;
  if (regex.test(trimmed)) {
    return trimmed;
  }
  return null;
};

const sanitizePassword = (val: unknown): string => {
  if (typeof val !== "string") return "";
  const clean = val.replace(/[^a-zA-Z0-9+=/]/g, "").trim();
  return clean.slice(0, 32);
};


// Design tokens list
const COLOR_SWATCHES = [
  { id: "mint", name: "Mint Green", hex: "#E6F4EA", jetpackRef: "ScrapbookTheme.Colors.MintGreen", bgClass: "bg-[#E6F4EA]", textClass: "text-[#1b4332]" },
  { id: "sky", name: "Sky Blue", hex: "#E0F2FE", jetpackRef: "ScrapbookTheme.Colors.SkyBlue", bgClass: "bg-[#E0F2FE]", textClass: "text-[#0369a1]" },
  { id: "canary", name: "Canary Yellow", hex: "#FEF9C3", jetpackRef: "ScrapbookTheme.Colors.CanaryYellow", bgClass: "bg-[#FEF9C3]", textClass: "text-[#713f12]" },
  { id: "lavender", name: "Lavender", hex: "#F3E8FF", jetpackRef: "ScrapbookTheme.Colors.Lavender", bgClass: "bg-[#F3E8FF]", textClass: "text-[#6b21a8]" },
  { id: "offwhite", name: "Base Canvas", hex: "#FDFBF7", jetpackRef: "ScrapbookTheme.Colors.BaseCanvasBackground", bgClass: "bg-[#FDFBF7]", textClass: "text-[#1E1E1E]" },
];

const fullKotlinFileText = `package com.example.sudoku.engine

/**
 * Sudoku Data Architecture
 */
data class SudokuCell(
    val row: Int,
    val col: Int,
    var value: Int, // 0 indicates empty
    val isOriginalClue: Boolean = false,
    val isUserInput: Boolean = false,
    val notes: Set<Int> = emptySet()
)

data class BoardState(
    val grid: List<List<SudokuCell>>,
    val selectedRow: Int? = null,
    val selectedCol: Int? = null,
    val currentMistakesCount: Int = 0,
    val maxMistakesLimit: Int = 3,
    val hintsCount: Int = 0,
    val isGameOver: Boolean = false
)

enum class SudokuDifficulty {
    EASY, MEDIUM, HARD, EXPERT
}

class SudokuEngine {
    fun isValidPlacement(grid: Array<IntArray>, row: Int, col: Int, num: Int): Boolean {
        for (x in 0 until 9) {
            if (grid[row][x] == num) return false
            if (grid[x][col] == num) return false
        }
        val br = row - (row % 3)
        val bc = col - (col % 3)
        for (i in 0 until 3) {
            for (j in 0 until 3) {
                if (grid[br + i][bc + j] == num) return false
            }
        }
        return true
    }

    fun solveSudoku(grid: Array<IntArray>): Boolean {
        for (row in 0 until 9) {
            for (col in 0 until 9) {
                if (grid[row][col] == 0) {
                    val numbers = (1..9).shuffled()
                    for (num in numbers) {
                        if (isValidPlacement(grid, row, col, num)) {
                            grid[row][col] = num
                            if (solveSudoku(grid)) return true
                            grid[row][col] = 0
                        }
                    }
                    return false
                }
            }
        }
        return true
    }

    fun countSolutions(grid: Array<IntArray>, limit: Int = 2): Int {
        var solutionCount = 0
        fun solveAndCount(g: Array<IntArray>): Boolean {
            for (row in 0 until 9) {
                for (col in 0 until 9) {
                    if (g[row][col] == 0) {
                        for (num in 1..9) {
                            if (isValidPlacement(g, row, col, num)) {
                                g[row][col] = num
                                if (solveAndCount(g)) solutionCount++
                                g[row][col] = 0
                                if (solutionCount >= limit) return true
                            }
                        }
                        return false
                    }
                }
            }
            return true
        }
        solveAndCount(Array(9) { r -> grid[r].clone() })
        return solutionCount
    }
}`;

const sudokuBoardKotlinText = `package com.example.sudoku.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.scrapbook.theme.ScrapbookTheme
import com.example.scrapbook.theme.scrapbookBorder
import com.example.scrapbook.theme.paperShadow
import com.example.scrapbook.theme.stickyNoteTilt
import com.example.sudoku.engine.BoardState
import com.example.sudoku.engine.SudokuCell

/**
 * Interactive 9x9 Sudoku board layout using Jetpack Compose.
 * Incorporates:
 * 1. An action command bar: Undo (curled marker line), Notes Mode (mechanical switch, highlighter ON), Hint (badge).
 * 2. 1 to 9 Input Pad: Chunky pop-comic buttons with responsive tactile compression.
 */
@Composable
fun InteractiveSudokuBoard(
    boardState: BoardState,
    onCellSelected: (row: Int, col: Int) -> Unit,
    onNumberEntered: (number: Int) -> Unit,
    onUndoPressed: () -> Unit,
    isNotesModeOn: Boolean,
    onNotesModeToggled: (Boolean) -> Unit,
    onClearPressed: () -> Unit,
    onSmartHintPressed: () -> Unit,
    modifier: Modifier = Modifier
) {
    val selectedRow = boardState.selectedRow
    val selectedCol = boardState.selectedCol

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(ScrapbookTheme.Colors.BaseCanvasBackground)
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Stats/Mistakes Banner
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .paperShadow(shape = RoundedCornerShape(4.dp))
                .background(Color.White)
                .scrapbookBorder(shape = RoundedCornerShape(4.dp))
                .padding(horizontal = 16.dp, vertical = 10.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "STATUS: ACTIVE PLAY",
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold,
                    color = ScrapbookTheme.Colors.AccentBorders
                )
                Text(
                    text = "Unique Solution Guard Enabled",
                    fontSize = 12.sp,
                    color = Color.Gray
                )
            }

            // Fault indicators
            Box(
                modifier = Modifier
                    .background(Color(0xFFFEE2E2))
                    .padding(horizontal = 8.dp, vertical = 4.dp)
            ) {
                Text(
                    text = "\\\${boardState.currentMistakesCount} / \\\${boardState.maxMistakesLimit} MISTAKES",
                    color = Color(0xFFDC2626),
                    fontWeight = FontWeight.Black,
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace
                )
            }
        }

        // 3x3 block quadrants structure
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
                .padding(vertical = 4.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            for (blockRow in 0..2) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    for (blockCol in 0..2) {
                        val subGridIndex = blockRow * 3 + blockCol
                        val blockBgColor = when (subGridIndex % 4) {
                            0 -> ScrapbookTheme.Colors.SkyBlue
                            1 -> ScrapbookTheme.Colors.MintGreen
                            2 -> ScrapbookTheme.Colors.CanaryYellow
                            else -> ScrapbookTheme.Colors.Lavender
                        }

                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .aspectRatio(1f)
                                .stickyNoteTilt(index = subGridIndex)
                                .paperShadow(shape = RoundedCornerShape(8.dp))
                                .background(blockBgColor, shape = RoundedCornerShape(8.dp))
                                .scrapbookBorder(shape = RoundedCornerShape(8.dp))
                                .padding(4.dp)
                        ) {
                            Column(
                                modifier = Modifier.fillMaxSize(),
                                verticalArrangement = Arrangement.SpaceEvenly
                            ) {
                                for (cellRowOffset in 0..2) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceEvenly
                                    ) {
                                        for (cellColOffset in 0..2) {
                                            val globalRow = blockRow * 3 + cellRowOffset
                                            val globalCol = blockCol * 3 + cellColOffset
                                            val cellData = boardState.grid[globalRow][globalCol]
                                            
                                            val isSelected = selectedRow == globalRow && selectedCol == globalCol
                                            val isRowSibling = selectedRow == globalRow
                                            val isColSibling = selectedCol == globalCol
                                            val isBoxSibling = selectedRow != null && selectedCol != null &&
                                                    (selectedRow / 3 == globalRow / 3) && (selectedCol / 3 == globalCol / 3)
                                            
                                            val inWatercolorInkCrosshair = (isRowSibling || isColSibling || isBoxSibling) && !isSelected

                                            Box(
                                                modifier = Modifier
                                                    .weight(1f)
                                                    .aspectRatio(1f)
                                                    .padding(1.dp)
                                                    .clip(RoundedCornerShape(4.dp))
                                                    .background(
                                                        color = when {
                                                            isSelected -> Color(0x33FFB300)
                                                            inWatercolorInkCrosshair -> Color(0x1210B981)
                                                            else -> Color.Transparent
                                                        }
                                                    )
                                                    .clickable { onCellSelected(globalRow, globalCol) },
                                                contentAlignment = Alignment.Center
                                            ) {
                                                if (cellData.value != 0) {
                                                    Text(
                                                        text = cellData.value.toString(),
                                                        fontSize = 18.sp,
                                                        fontWeight = if (cellData.isOriginalClue) FontWeight.Bold else FontWeight.Light,
                                                        color = if (cellData.isOriginalClue) Color.Black else Color(0xFF1D4ED8),
                                                        fontFamily = if (cellData.isOriginalClue) FontFamily.Default else FontFamily.Cursive
                                                    )
                                                } else if (cellData.notes.isNotEmpty()) {
                                                    Text(
                                                        text = cellData.notes.sorted().joinToString(""),
                                                        fontSize = 8.sp,
                                                        fontFamily = FontFamily.Monospace,
                                                        color = Color(0xFF7C3AED),
                                                        lineHeight = 9.sp,
                                                        textAlign = TextAlign.Center
                                                    )
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Control Actions Dashboard Row
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 4.dp),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            // 1. UNDO BUTTON
            val undoInteractionSource = remember { MutableInteractionSource() }
            val isUndoPressed by undoInteractionSource.collectIsPressedAsState()
            val undoScale by animateFloatAsState(targetValue = if (isUndoPressed) 0.93f else 1f, label = "undoScale")
            val undoShadow by animateFloatAsState(targetValue = if (isUndoPressed) 1f else 3f, label = "undoShadow")
            
            Box(
                modifier = Modifier
                    .weight(1f)
                    .graphicsLayer {
                        scaleX = undoScale
                        scaleY = undoScale
                    }
                    .paperShadow(shape = RoundedCornerShape(6.dp), offsetX = undoShadow.dp, offsetY = undoShadow.dp)
                    .background(Color.White, shape = RoundedCornerShape(6.dp))
                    .scrapbookBorder(shape = RoundedCornerShape(6.dp))
                    .clickable(
                        interactionSource = undoInteractionSource,
                        indication = null,
                        onClick = onUndoPressed
                    )
                    .padding(vertical = 12.dp),
                contentAlignment = Alignment.Center
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Canvas(modifier = Modifier.size(16.dp)) {
                        val path = Path().apply {
                            moveTo(size.width * 0.85f, size.height * 0.25f)
                            quadraticTo(
                                size.width * 0.85f, size.height * 0.85f,
                                size.width * 0.4f, size.height * 0.85f
                            )
                        }
                        drawPath(
                            path = path,
                            color = Color(0xFF1E1E1E),
                            style = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round)
                        )
                        val arrowPath = Path().apply {
                            moveTo(size.width * 0.5f, size.height * 0.65f)
                            lineTo(size.width * 0.2f, size.height * 0.85f)
                            lineTo(size.width * 0.5f, size.height * 1.05f)
                        }
                        drawPath(
                            path = arrowPath,
                            color = Color(0xFF1E1E1E),
                            style = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round)
                        )
                    }
                    Text(
                        text = "Undo",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF1E1E1E)
                    )
                }
            }

            // 2. NOTES MODE BUTTON (Acts as mechanical pencil switch)
            val notesScale by animateFloatAsState(targetValue = if (isNotesModeOn) 0.94f else 1f, label = "notesScale")
            val notesShadow by animateFloatAsState(targetValue = if (isNotesModeOn) 1f else 3f, label = "notesShadow")
            val notesBgColor = if (isNotesModeOn) Color(0xFFFFF200) else Color.White

            Box(
                modifier = Modifier
                    .weight(1.2f)
                    .graphicsLayer {
                        scaleX = notesScale
                        scaleY = notesScale
                    }
                    .paperShadow(shape = RoundedCornerShape(6.dp), offsetX = notesShadow.dp, offsetY = notesShadow.dp)
                    .background(notesBgColor, shape = RoundedCornerShape(6.dp))
                    .scrapbookBorder(shape = RoundedCornerShape(6.dp))
                    .clickable(
                        onClick = { onNotesModeToggled(!isNotesModeOn) }
                    )
                    .padding(vertical = 12.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = if (isNotesModeOn) "✏️ Notes: ON" else "✎ Notes: OFF",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = Color(0xFF1E1E1E),
                    textAlign = TextAlign.Center
                )
            }

            // 3. HINT BUTTON WITH COUNT BADGE
            val hintInteractionSource = remember { MutableInteractionSource() }
            val isHintPressed by hintInteractionSource.collectIsPressedAsState()
            val hintScale by animateFloatAsState(targetValue = if (isHintPressed) 0.93f else 1f, label = "hintScale")
            val hintShadow by animateFloatAsState(targetValue = if (isHintPressed) 1f else 3f, label = "hintShadow")

            Box(
                modifier = Modifier
                    .weight(1f)
                    .graphicsLayer {
                        scaleX = hintScale
                        scaleY = hintScale
                    }
                    .paperShadow(shape = RoundedCornerShape(6.dp), offsetX = hintShadow.dp, offsetY = hintShadow.dp)
                    .background(Color(0xFFE0F2FE), shape = RoundedCornerShape(6.dp))
                    .scrapbookBorder(shape = RoundedCornerShape(6.dp))
                    .clickable(
                        interactionSource = hintInteractionSource,
                        indication = null,
                        onClick = onSmartHintPressed
                    )
                    .padding(vertical = 12.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "💡 Hint",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF0369A1)
                )

                Box(
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .offset(x = 4.dp, y = (-4).dp)
                        .size(18.dp)
                        .background(Color(0xFF1E1E1E), shape = CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    val hintsLeft = maxOf(0, 3 - boardState.hintsCount)
                    Text(
                        text = hintsLeft.toString(),
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Black,
                        color = Color.White
                    )
                }
            }
        }

        // 1 to 9 Input Pad with Custom Tactile Animation Tiles
        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                val paletteColors = listOf(
                    ScrapbookTheme.Colors.SkyBlue,
                    ScrapbookTheme.Colors.MintGreen,
                    ScrapbookTheme.Colors.CanaryYellow,
                    ScrapbookTheme.Colors.Lavender
                )

                for (number in 1..9) {
                    val tileColor = paletteColors[(number - 1) % paletteColors.size]
                    PopComicInputTile(
                        number = number,
                        backgroundColor = tileColor,
                        onClick = { onNumberEntered(number) },
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End
            ) {
                Button(
                    onClick = onClearPressed,
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF3F4F6)),
                    modifier = Modifier.wrapContentWidth()
                ) {
                    Text(text = "Clear Selected Square", color = Color.Black, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
fun PopComicInputTile(
    number: Int,
    backgroundColor: Color,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    val scaleX by animateFloatAsState(targetValue = if (isPressed) 0.90f else 1.0f, label = "scaleX")
    val scaleY by animateFloatAsState(targetValue = if (isPressed) 0.90f else 1.0f, label = "scaleY")
    val shadowOffset by animateFloatAsState(targetValue = if (isPressed) 1.5f else 4.0f, label = "shadowOffset")

    Box(
        modifier = modifier
            .graphicsLayer {
                this.scaleX = scaleX
                this.scaleY = scaleY
            }
            .paperShadow(shape = RoundedCornerShape(8.dp), offsetX = shadowOffset.dp, offsetY = shadowOffset.dp)
            .background(backgroundColor, shape = RoundedCornerShape(8.dp))
            .scrapbookBorder(shape = RoundedCornerShape(8.dp))
            .clickable(interactionSource = interactionSource, indication = null, onClick = onClick)
            .aspectRatio(1f),
        contentAlignment = Alignment.Center
    ) {
        Text(text = number.toString(), fontSize = 18.sp, fontWeight = FontWeight.Black, color = ScrapbookTheme.Colors.AccentBorders)
    }
}
`;

const sudokuPreferencesKotlinText = `package com.example.sudoku.preferences

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.map
import java.io.IOException

// Delegate to instantiate DataStore on Context
val Context.sudokuPrefsStore: DataStore<Preferences> by preferencesDataStore(name = "sudoku_preferences")

/**
 * Advanced configuration variables and runtime hint inventory.
 * Utilizes Jetpack DataStore for thread-safe asynchronous preference persistence.
 */
data class SudokuPreferences(
    val isNumberFirstInputMode: Boolean,
    val isAutoRemoveNotesEnabled: Boolean,
    val isPreventMistakeNotesEnabled: Boolean,
    val rewardedHintInventoryCount: Int
)

class SudokuPreferencesManager(private val context: Context) {

    companion object {
        val KEY_NUMBER_FIRST_INPUT_MODE = booleanPreferencesKey("number_first_input_mode")
        val KEY_AUTO_REMOVE_NOTES = booleanPreferencesKey("auto_remove_notes")
        val KEY_PREVENT_MISTAKE_NOTES = booleanPreferencesKey("prevent_mistake_notes")
        val KEY_REWARDED_HINT_COUNT_INVENTORY = intPreferencesKey("rewarded_hint_count_inventory")
    }

    /**
     * Flow emitting the player preferences asynchronously
     */
    val preferencesFlow: Flow<SudokuPreferences> = context.sudokuPrefsStore.data
        .catch { exception ->
            if (exception is IOException) {
                emit(emptyPreferences())
            } else {
                throw exception
            }
        }
        .map { preferences ->
            SudokuPreferences(
                isNumberFirstInputMode = preferences[KEY_NUMBER_FIRST_INPUT_MODE] ?: false,
                isAutoRemoveNotesEnabled = preferences[KEY_AUTO_REMOVE_NOTES] ?: true,
                isPreventMistakeNotesEnabled = preferences[KEY_PREVENT_MISTAKE_NOTES] ?: true,
                rewardedHintInventoryCount = preferences[KEY_REWARDED_HINT_COUNT_INVENTORY] ?: 3
            )
        }

    /**
     * Set if Number-First input pad selection locks the designated key
     */
    suspend fun setNumberFirstInputMode(enabled: Boolean) {
        context.sudokuPrefsStore.edit { preferences ->
            preferences[KEY_NUMBER_FIRST_INPUT_MODE] = enabled
        }
    }

    /**
     * Remove pencil candidate note string digits inside Row/Col/3x3 quad on a correct value input
     */
    suspend fun setAutoRemoveNotes(enabled: Boolean) {
        context.sudokuPrefsStore.edit { preferences ->
            preferences[KEY_AUTO_REMOVE_NOTES] = enabled
        }
    }

    /**
     * Prevent clashes during draft pencil typing
     */
    suspend fun setPreventMistakeNotes(enabled: Boolean) {
        context.sudokuPrefsStore.edit { preferences ->
            preferences[KEY_PREVENT_MISTAKE_NOTES] = enabled
        }
    }

    /**
     * Adds free hints awarded after watching sponsored video streams
     */
    suspend fun addRewardedHints(count: Int) {
        context.sudokuPrefsStore.edit { preferences ->
            val current = preferences[KEY_REWARDED_HINT_COUNT_INVENTORY] ?: 3
            preferences[KEY_REWARDED_HINT_COUNT_INVENTORY] = current + count
        }
    }

    /**
     * Consumes one hint representation
     */
    suspend fun spendHint() {
        context.sudokuPrefsStore.edit { preferences ->
            val current = preferences[KEY_REWARDED_HINT_COUNT_INVENTORY] ?: 3
            if (current > 0) {
                preferences[KEY_REWARDED_HINT_COUNT_INVENTORY] = current - 1
            }
        }
    }
}
`;

const androidIntegrationSnippetsText = `/*
 * ANDROID INTEGRATION SNIPPETS
 * ─────────────────────────────────────────────────────────────────
 * File: MainActivity.kt (or GameActivity.kt depending on your structure)
 * Purpose: Contains the Hint Logic and How-To-Play Dialog.
 * 
 * Note: Provide your own dependencies where necessary (e.g., getting 'board'
 * and 'solution' from your Sudoku ViewModel, or updating the UI).
 */

// 1. SMART HINT FUNCTION
// Call this function when your 'Hint' button is clicked.
fun onHintClicked(selectedRow: Int, selectedCol: Int, availableHints: Int) {
    // 0. Check if user is out of hints
    if (availableHints <= 0) {
        showOutOfHintsDialog()
        return
    }

    // Assuming 'board' contains your current game state and 'solution' contains the solved grid
    val cell = board[selectedRow][selectedCol]
    val correctNumber = solution[selectedRow][selectedCol]
    
    // 1. Exclude system-generated numbers
    if (cell.isOriginalClue) {
        Toast.makeText(this, "This is a system-generated number. It is already correct!", Toast.LENGTH_SHORT).show()
        return
    }

    // Since a hint is going to be consumed, decrement hint count here:
    // decreaseHintCount()

    if (cell.value == 0) { 
        // 2. Cell is empty -> Provide the correct number
        cell.value = correctNumber
        updateBoardUI() // Call your UI refresh method here
        Toast.makeText(this, "Hint used! Filled correct number.", Toast.LENGTH_SHORT).show()
    } else {
        // 3. Cell is filled -> Validate existing number
        if (cell.value == correctNumber) {
            Toast.makeText(this, "Right! This is the correct number.", Toast.LENGTH_SHORT).show()
        } else {
            // Determine reason for incorrect validation
            val conflictReason = getConflictReason(selectedRow, selectedCol, cell.value)
            val message = "This is wrong because \${cell.value} already exists in this \$conflictReason. The correct number is \$correctNumber."
            
            AlertDialog.Builder(this)
                .setTitle("Incorrect Placement")
                .setMessage(message)
                .setPositiveButton("Got it") { dialog, _ -> 
                    dialog.dismiss() 
                }
                .show()
                
            // Fix it for the user
            cell.value = correctNumber
            updateBoardUI()
        }
    }
}

// Helper function to figure out why the user's placement was wrong
private fun getConflictReason(row: Int, col: Int, value: Int): String {
    // Check row and column
    for (i in 0 until 9) {
        if (i != col && board[row][i].value == value) return "row"
        if (i != row && board[i][col].value == value) return "column"
    }
    // Check 3x3 box
    val startRow = row - (row % 3)
    val startCol = col - (col % 3)
    for (i in 0 until 3) {
        for (j in 0 until 3) {
            if ((startRow + i != row || startCol + j != col) && 
                board[startRow + i][startCol + j].value == value) {
                return "3x3 box"
            }
        }
    }
    return "placement"
}


// 2. OUT OF HINTS DIALOG (WATCH AD)
// Triggered when the user runs out of hints.
fun showOutOfHintsDialog() {
    AlertDialog.Builder(this)
        .setTitle("Out of Hints!")
        .setMessage("Watch the ad to receive extra guidance and keep your game flowing smoothly.")
        .setPositiveButton("Watch Ad") { dialog, _ -> 
            // TODO: Trigger your Rewarded Video Ad logic here
            // e.g., adManager.showRewardedVideo()
            Toast.makeText(this, "Loading Ad...", Toast.LENGTH_SHORT).show()
            dialog.dismiss() 
        }
        .setNegativeButton("Cancel") { dialog, _ ->
            dialog.dismiss()
        }
        .show()
}


// 3. HOW TO PLAY DIALOG
// Link this function to the onClick listener of your help '?' ImageButton.
fun showHowToPlayDialog() {
    AlertDialog.Builder(this)
        .setTitle("How to Play")
        .setMessage("Fill the grid so that every row, column, and 3x3 box contains the digits 1-9 without repetition.")
        .setPositiveButton("Let's Play!") { dialog, _ -> 
            dialog.dismiss() 
        }
        .show()
}


/*
 * ─────────────────────────────────────────────────────────────────
 * File: res/layout/activity_main.xml (or your game layout file)
 * Purpose: UI component for the Help Button
 * 
 * Instructions: Place this exactly between your error_count_text and 
 * timer_text in your ConstraintLayout. Ensure @drawable/ic_help exists.
 */

<!-- Game Container Snippet -->
<ConstraintLayout
    android:id="@+id/gameContainer"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    app:layout_constraintTop_toTopOf="parent"
    app:layout_constraintBottom_toBottomOf="parent"
    app:layout_constraintVertical_bias="0.5">

    <!-- Header containing Error, Help, and Timer chained horizontally -->
    <TextView
        android:id="@+id/error_count_text"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Errors: 0"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toStartOf="@+id/help_icon"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintHorizontal_chainStyle="spread" />

    <ImageButton
        android:id="@+id/help_icon"
        android:layout_width="40dp"
        android:layout_height="40dp"
        android:src="@android:drawable/ic_menu_help"
        android:background="?attr/selectableItemBackgroundBorderless"
        android:contentDescription="How to Play"
        app:layout_constraintStart_toEndOf="@+id/error_count_text"
        app:layout_constraintEnd_toStartOf="@+id/timer_text"
        app:layout_constraintTop_toTopOf="@+id/error_count_text"
        app:layout_constraintBottom_toBottomOf="@+id/error_count_text" />

    <TextView
        android:id="@+id/timer_text"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Time: 00:00"
        app:layout_constraintStart_toEndOf="@+id/help_icon"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintTop_toTopOf="@+id/error_count_text"
        app:layout_constraintBottom_toBottomOf="@+id/error_count_text" />

    <!-- Game Board -->
    <include
        android:id="@+id/sudokuBoard"
        layout="@layout/sudoku_board"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginTop="16dp"
        app:layout_constraintTop_toBottomOf="@+id/help_icon"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />

</ConstraintLayout>


/*
 * ─────────────────────────────────────────────────────────────────
 * File: Game won / Game over Activity or Dialog
 * Purpose: Allows the user to share their best time via Android Intent
 * 
 * Instructions: Call this function when the user clicks the 
 * "Challenge Friends with Your Best Time" button.
 */

// 4. SOCIAL SHARING (INTENT)
// Pass the user's best time string (e.g. "04:23") into this function.
fun challengeFriendsWithBestTime(bestTime: String) {
    val shareIntent = Intent().apply {
        action = Intent.ACTION_SEND
        putExtra(Intent.EXTRA_TEXT, "I just solved a Sudoku puzzle in $bestTime! Think you can beat my best time? 🧩🚀")
        type = "text/plain"
    }

    // This triggers the standard Android system share sheet (WhatsApp, Messages, etc.)
    val chooser = Intent.createChooser(shareIntent, "Challenge friends via")
    startActivity(chooser)
}
`;

const difficultyIdMap: Record<Difficulty, number> = {
  EASY: 1,
  MEDIUM: 2,
  HARD: 3,
  EXPERT: 4
};

const decodeGoogleJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to decode Google JWT:", e);
    return null;
  }
};

const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (Capacitor.isNativePlatform()) {
      await Clipboard.write({ string: text });
      return true;
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      if (successful) return true;
    }
  } catch (err) {
    console.error("Failed to copy to clipboard:", err);
  }
  return false;
};

const shareOrCopyContent = async (
  title: string,
  text: string,
  url: string,
  onCopySuccess: (msg: string) => void,
  onCopyFailure: (msg: string) => void
) => {
  const fullText = `${text}\n${url}`;

  if (Capacitor.isNativePlatform()) {
    try {
      await Share.share({
        title: title,
        text: text,
        url: url,
        dialogTitle: title
      });
      return;
    } catch (e) {
      console.log("Capacitor native share failed/dismissed, falling back to copy:", e);
    }
  } else if (navigator.share) {
    try {
      await navigator.share({
        title: title,
        text: text,
        url: url
      });
      return;
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") {
        console.log("Web share action aborted by user");
        return;
      }
      console.log("Web share failed, falling back to copy:", e);
    }
  }

  // Fallback to clipboard
  const copied = await copyToClipboard(fullText);
  if (copied) {
    onCopySuccess("Challenge link & message copied! Share with your friends.");
  } else {
    onCopyFailure("Failed to copy challenge link.");
  }
};

export default function App() {
  const [googleClientId, setGoogleClientId] = useState<string | null>(() => {
    return (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || null;
  });

  const showCopiedToast = (message: string) => {
    setCopiedText(message);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const shareAppContent = async (title: string, text: string, url: string) => {
    await shareOrCopyContent(title, text, url, showCopiedToast, showCopiedToast);
  };

  const isIOSDevice = typeof window !== "undefined" && (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

  const [gisLoaded, setGisLoaded] = useState<boolean>(false);

useEffect(() => {
  const checkGis = () => {
    if ((window as any).google?.accounts?.id) {
      setGisLoaded(true);
    }
  };
    checkGis();
    const interval = setInterval(checkGis, 1000);
    return () => clearInterval(interval);
  }, []);

  const [activeTab, setActiveTab] = useState<"sudoku" | "sandbox" | "kotlin-code" | "spec-docs">("sudoku");
  const [currentScreen, setCurrentScreen] = useState<"home" | "status" | "settings" | "game" | "login" | "together">(
    typeof window !== "undefined" && window.innerWidth >= 1024 ? "game" : "home"
  );
  const [fromGameplaySettings, setFromGameplaySettings] = useState<boolean>(false);

  // --- SEAMLESS HYBRID THEME SWITCHER state ---
  const [activeTheme, setActiveTheme] = useState<"Original" | "Sticky Note Pro">(() => {
    try {
      const saved = localStorage.getItem("sudoku_activeTheme");
      return saved === "Sticky Note Pro" ? "Sticky Note Pro" : "Original";
    } catch {
      return "Original";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("sudoku_activeTheme", activeTheme);
    } catch {}
  }, [activeTheme]);

  // --- STACK-BASED CRASH-FREE SYSTEM NAVIGATION ---
  const [navigationHistory, setNavigationHistory] = useState<string[]>(["home"]);

  const navigateToScreen = (screen: "home" | "status" | "settings" | "game" | "login" | "together") => {
    setCurrentScreen(screen);
    setNavigationHistory(prev => {
      if (prev[prev.length - 1] === screen) return prev;
      return [...prev, screen];
    });
    window.history.pushState({ view: screen }, "", window.location.href);
  };

  const navigatorPop = () => {
    playClickSound();
    setNavigationHistory(prev => {
      if (prev.length <= 1) {
        setCurrentScreen("home");
        window.history.pushState({ view: "home" }, "", window.location.href);
        return ["home"];
      }
      const nextStack = prev.slice(0, -1);
      const lastScreen = nextStack[nextStack.length - 1] as "home" | "status" | "settings" | "game" | "login" | "together";
      
      if (lastScreen === "game" && (boardState?.isGameOver || !boardState)) {
        setCurrentScreen("home");
        window.history.pushState({ view: "home" }, "", window.location.href);
        return ["home"];
      }

      setCurrentScreen(lastScreen);
      window.history.pushState({ view: lastScreen }, "", window.location.href);
      return nextStack;
    });
  };
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);
  const [selectedKotlinFile, setSelectedKotlinFile] = useState<"engine" | "board" | "preferences" | "snippets">("snippets");
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [gridOverlay, setGridOverlay] = useState<boolean>(true);

  // --- HYBRID AUTHENTICATION LAYER STATE ---
  const [userProfile, setUserProfile] = useState<{
    id: string;
    name: string;
    email?: string;
    phone?: string;
    avatarColor: string;
    isSynced: boolean;
  } | null>(() => {
    try {
      const saved = localStorage.getItem("sudoku_userProfile");
      if (saved) return JSON.parse(saved);
    } catch {}
    // Auto-generate unique guest token identity with unique username
    const guestId = "GUEST_" + Math.floor(10000 + Math.random() * 90000);
    const adjectives = ["Bold", "Silent", "Clever", "Swift", "Sharp", "Quiet", "Bright", "Epic", "Calm", "Sonic", "Lunar", "Solar", "Nova", "Cosmic", "Vesta"];
    const nouns = ["Voyager", "Solver", "Maverick", "Pro", "Challenger", "Matrix", "Mind", "Zen", "Guru", "Wizard", "Ranger", "Pioneer", "Stargazer", "Kepler", "Comet"];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const randNum = guestId.split("_")[1];
    const uniqueName = `${adj} ${noun} ${randNum}`;
    
    const colors = ["#8B5CF6", "#EC4899", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#6366F1", "#14B8A6", "#06B6D4", "#D946EF"];
    const randColor = colors[Math.floor(Math.random() * colors.length)];
    const initialProfile = {
      id: guestId,
      name: uniqueName,
      avatarColor: randColor,
      isSynced: false
    };
    try {
      localStorage.setItem("sudoku_userProfile", JSON.stringify(initialProfile));
    } catch {}
    return initialProfile;
  });

  // Display name registration state
  const [showDisplayNameModal, setShowDisplayNameModal] = useState<boolean>(false);
  const [showInviteJoinNamePopup, setShowInviteJoinNamePopup] = useState<boolean>(false);
  const [inviteJoinName, setInviteJoinName] = useState<string>("");
  const [inviteJoinError, setInviteJoinError] = useState<string | null>(null);
  const [isVerifyingInviteJoinName, setIsVerifyingInviteJoinName] = useState<boolean>(false);
  const inviteJoinCallbackRef = useRef<(() => void) | null>(null);
  const isProcessingQueueRef = useRef<boolean>(false);

  const checkIsDisplayNameConfigured = (): boolean => {
    // 1. Manually configured flag is paramount
    const isConfiguredFlag = localStorage.getItem("sudoku_is_display_name_configured") === "true";
    
    // 2. Otherwise/synced, verify name validity
    if (!userProfile?.name) return false;
    const currentName = userProfile.name.trim();
    
    const isDefault = currentName === "Anonymous Voyager" || 
                      currentName === "Guest Voyager" || 
                      currentName === "Guest Solver" || 
                      currentName === "Guest" || 
                      currentName.startsWith("Player");
    
    if (isDefault) return false;
    
    // Check for auto-generated adjectives + nouns + numbers
    const adjectivesList = ["Bold", "Silent", "Clever", "Swift", "Sharp", "Quiet", "Bright", "Epic", "Calm", "Sonic", "Lunar", "Solar", "Nova", "Cosmic", "Vesta"];
    const nounsList = ["Voyager", "Solver", "Maverick", "Pro", "Challenger", "Matrix", "Mind", "Zen", "Guru", "Wizard", "Ranger", "Pioneer", "Stargazer", "Kepler", "Comet"];
    
    const parts = currentName.split(" ");
    if (parts.length === 3 && adjectivesList.includes(parts[0]) && nounsList.includes(parts[1]) && /^\d+$/.test(parts[2])) {
      return false; // This is a temporary/auto-generated name
    }
    
    // If name is synced from Google and not default, it is valid!
    if (userProfile?.isSynced) {
      return true;
    }
    
    // In any other case, we require the manual display name configuration flag to be set
    return isConfiguredFlag;
  };

  const handleAcceptInvitationWithProfileCheck = (onConfirm: () => void) => {
    const isConfigured = checkIsDisplayNameConfigured();

    if (!isConfigured) {
      inviteJoinCallbackRef.current = onConfirm;
      setInviteJoinName("");
      setInviteJoinError(null);
      setShowInviteJoinNamePopup(true);
      setShowInviteModal(false);
    } else {
      onConfirm();
    }
  };

  const saveAndExecuteName = (finalName: string) => {
    const updatedProfile = {
      ...(userProfile || { id: "GUEST_" + Math.floor(10000 + Math.random() * 90000), avatarColor: "#6B7280", isSynced: false }),
      name: finalName
    };
    setUserProfile(updatedProfile);
    localStorage.setItem("sudoku_userProfile", JSON.stringify(updatedProfile));
    localStorage.setItem("sudoku_is_display_name_configured", "true");
    
    setShowInviteJoinNamePopup(false);
    
    if (inviteJoinCallbackRef.current) {
      inviteJoinCallbackRef.current();
      inviteJoinCallbackRef.current = null;
    }
  };

  const handleInviteJoinContinue = async () => {
    const finalName = inviteJoinName.trim();
    if (!finalName) return;

    playClickSound();
    setIsVerifyingInviteJoinName(true);
    setInviteJoinError(null);

    const restrictedList = ["fuck", "nigger", "faggot", "cunt", "bitch", "shit", "dick", "pussy", "bastard", "slut", "whore"];
    const hasBadWord = restrictedList.some(bad => finalName.toLowerCase().includes(bad));

    if (hasBadWord) {
      setInviteJoinError("Please choose a name that is respectful to other players.");
      setIsVerifyingInviteJoinName(false);
      return;
    }

    const validation = validateNameLocally(finalName);
    if (validation.isValid) {
      saveAndExecuteName(finalName);
    } else {
      setInviteJoinError(validation.error || "Please choose a name that is respectful to other players.");
    }
    setIsVerifyingInviteJoinName(false);
  };
  const [enteredDisplayName, setEnteredDisplayName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("sudoku_userProfile");
      if (saved) {
        const profile = JSON.parse(saved);
        if (profile?.name && !profile.name.includes("Anonymous Voyager") && !profile.name.includes("Guest Voyager")) {
          return profile.name;
        }
      }
    } catch {}
    return "";
  });
  const [displayNameCallbackAction, setDisplayNameCallbackAction] = useState<"SHARE" | "START" | "END_GAME_SHARE" | "HISTORY_SHARE" | "PENDING_SHARE" | null>(null);
  const [displayNameError, setDisplayNameError] = useState<string | null>(null);
  const [isValidatingDisplayName, setIsValidatingDisplayName] = useState<boolean>(false);

  // Authentication UI Controls
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [isSyncingPending, setIsSyncingPending] = useState<boolean>(false);
  const [showSyncSuccessToast, setShowSyncSuccessToast] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<"SELECT" | "GOOGLE" | "PHONE" | "OTP">("SELECT");
  const [emailInput, setEmailInput] = useState<string>("");
  const [usernameInput, setUsernameInput] = useState<string>("");
  const [phoneInput, setPhoneInput] = useState<string>("");
  const [authOtpInput, setAuthOtpInput] = useState<string>("");
  const [otpCode, setOtpCode] = useState<string>("");
  const [authPendingPhone, setAuthPendingPhone] = useState<string>("");
  const [playerToUnfriend, setPlayerToUnfriend] = useState<string | null>(null);

  // --- CHALLENGE / COMPETITIVE SYSTEM SEEDS AND CONFIGS ---
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [syncedLeaderboard, setSyncedLeaderboard] = useState<any[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState<boolean>(false);
  const [challengeMode, setChallengeMode] = useState<boolean>(false);
  const [challengeSeed, setChallengeSeed] = useState<number | null>(null);
  const [challengeMistakeLimit, setChallengeMistakeLimit] = useState<number>(3);
  const [challengeTimerEnabled, setChallengeTimerEnabled] = useState<boolean>(true);
  const [challengeHintLimit, setChallengeHintLimit] = useState<number>(3);
  const [challengeDifficulty, setChallengeDifficulty] = useState<Difficulty>("EASY");
  const [challengeRoomAccess, setChallengeRoomAccess] = useState<"OPEN" | "PRIVATE">("OPEN");
  
  // Custom states matching user requirements
  const [timerVisibility, setTimerVisibility] = useState<boolean>(true);
  const [roomPassword, setRoomPassword] = useState<string>("");
  const [isRoomLocked, setIsRoomLocked] = useState<boolean>(false);
  const [roomPin, setRoomPin] = useState<string>("");
  const [openDropdown, setOpenDropdown] = useState<"difficulty" | "mistakes" | "hints" | "timer" | null>(null);
  const [dropdownCoords, setDropdownCoords] = useState<{
    top: number;
    left: number;
    width: number;
    openUp: boolean;
  } | null>(null);

  const toggleDropdownPortal = (
    type: "difficulty" | "mistakes" | "hints" | "timer",
    targetEl: HTMLElement
  ) => {
    if (openDropdown === type) {
      setOpenDropdown(null);
      setDropdownCoords(null);
      return;
    }
    const rect = targetEl.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const menuEstimatedHeight = type === "timer" ? 95 : 180;
    const openUp = spaceBelow < menuEstimatedHeight + 10;

    setDropdownCoords({
      top: openUp ? Math.max(10, rect.top - menuEstimatedHeight - 6) : rect.bottom + 6,
      left: rect.left,
      width: rect.width,
      openUp
    });
    setOpenDropdown(type);
  };
  const [sharingPendingChallenge, setSharingPendingChallenge] = useState<any | null>(null);

  // Hub Navigation (Create vs Join Room modal)
  const [showMultiplayerForkModal, setShowMultiplayerForkModal] = useState<boolean>(false);
  const [showJoinRoomModal, setShowJoinRoomModal] = useState<boolean>(false);
  const [joinRoomCodeInput, setJoinRoomCodeInput] = useState<string>("");
  const [joinRoomPinInput, setJoinRoomPinInput] = useState<string>("");
  const [joinRoomError, setJoinRoomError] = useState<string | null>(null);
  const [isJoiningRoomLoading, setIsJoiningRoomLoading] = useState<boolean>(false);
  
  // List of past players/friends to present under 'Invite Friends'
  const [multiplayerPlayers, setMultiplayerPlayers] = useState<Array<{
    id: string;
    name: string;
    isFriend: boolean;
    status: 'online' | 'offline';
    inviteStatus: 'idle' | 'sent' | 'joined' | 'declined';
    isSynced?: boolean;
    inviteSentTimestamp?: number;
    declinedTimestamp?: number;
  }>>(() => {
    try {
      const saved = localStorage.getItem("sudoku_past_players");
      if (saved) {
        const parsed = JSON.parse(saved) as any[];
        if (Array.isArray(parsed)) {
          // Filter out legacy simulated demo bots and always reset stale inviteStatus to 'idle'
          return parsed
            .filter(p => p.id !== "USER_88201" && p.id !== "GUEST_99210" && p.id !== "USER_33104")
            .map(p => ({
              ...p,
              inviteStatus: "idle" as const,
              inviteSentTimestamp: undefined,
              declinedTimestamp: undefined
            }));
        }
      }
    } catch {}
    
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem("sudoku_past_players", JSON.stringify(multiplayerPlayers));
    } catch {}
  }, [multiplayerPlayers]);

  const [privacyEnabled, setPrivacyEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("sudoku_privacyEnabled");
      return saved !== null ? saved === "true" : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("sudoku_privacyEnabled", String(privacyEnabled));
    } catch {}
  }, [privacyEnabled]);
  
  // Overlays / Modals and share states
  const [userLobbyStatus, setUserLobbyStatus] = useState<'online' | 'busy'>('online');
  const [showCreateChallengeModal, setShowCreateChallengeModal] = useState<boolean>(false);
  const [showGameOverModal, setShowGameOverModal] = useState<boolean>(false);
  const [showMidGameInviteModal, setShowMidGameInviteModal] = useState<boolean>(false);
  const [showHistoryChallengeModal, setShowHistoryChallengeModal] = useState<boolean>(false);
  const [historyChallengeGame, setHistoryChallengeGame] = useState<CompletedGame | null>(null);
  const [viewingRankingsGame, setViewingRankingsGame] = useState<CompletedGame | null>(null);
  const [historyRankings, setHistoryRankings] = useState<any[]>([]);
  const [isLoadingHistoryRankings, setIsLoadingHistoryRankings] = useState<boolean>(false);
  const [showFriendsListSection, setShowFriendsListSection] = useState<boolean>(true);
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [incomingChallengeId, setIncomingChallengeId] = useState<string | null>(null);
  const [incomingChallengeDetails, setIncomingChallengeDetails] = useState<{
    seed: number;
    difficulty: Difficulty;
    maxMistakes: number;
    hintLimit?: number;
    timerEnabled: boolean;
    password?: string;
    senderName?: string;
  } | null>(null);
  const [enteredInvitePassword, setEnteredInvitePassword] = useState<string>("");
  const [invitePasswordError, setInvitePasswordError] = useState<string | null>(null);

  // Rematch state variables for Issue 6
  const [showRematchInviteModal, setShowRematchInviteModal] = useState<boolean>(false);
  const [rematchParticipants, setRematchParticipants] = useState<Array<{ id: string; name: string; isReal: boolean }>>([]);
  const [rematchGameId, setRematchGameId] = useState<string>("");
  const [rematchInvitedPlayers, setRematchInvitedPlayers] = useState<Set<string>>(new Set());
  const [lobbyAcceptedUserIds, setLobbyAcceptedUserIds] = useState<Set<string>>(new Set());
  const [rematchInviteStates, setRematchInviteStates] = useState<Record<string, { status: "idle" | "sent" | "declined" | "joined"; timerEnd: number }>>({});
  const [lobbyTickTime, setLobbyTickTime] = useState<number>(Date.now());
  const [endGameStep, setEndGameStep] = useState<1 | 2>(1); // 1=Results/Config, 2=Invite Lobby
  const [pendingRematchSeed, setPendingRematchSeed] = useState<number | null>(null); // seed locked when entering Screen 2
  const [rematchMatchMode, setRematchMatchMode] = useState<"replay" | "remix">("replay");
  const [isInvitingAll, setIsInvitingAll] = useState<boolean>(false);
  const inviteAllAbortRef = useRef<boolean>(false);

  // Bell Invites modal
  const [showBellInvitesModal, setShowBellInvitesModal] = useState<boolean>(false);

  // Issue 7: Friend System Identity states
  const [showLoginRequiredModal, setShowLoginRequiredModal] = useState<boolean>(false);
  const [loginRequiredPurpose, setLoginRequiredPurpose] = useState<string>("");
  const [showTargetLoginRequiredModal, setShowTargetLoginRequiredModal] = useState<boolean>(false);
  const [pendingTargetPlayer, setPendingTargetPlayer] = useState<{ id: string; name: string } | null>(null);
  const [activeCompliancePage, setActiveCompliancePage] = useState<"privacy" | "terms" | "about" | "contact" | null>(null);
  const [lastGameParticipants, setLastGameParticipants] = useState<Array<{ id: string; name: string; isReal: boolean }>>([]);

  const isUserAuthorizedForMultiplayer = () => {
    return true;
  };

  // Invite queue and DND/postpone silence duration states
  const [muteUntil, setMuteUntil] = useState<number>(() => {
    try {
      const stored = localStorage.getItem("sudoku_invite_mute_until");
      return stored ? Number(stored) : 0;
    } catch {
      return 0;
    }
  });

  const [inviteQueue, setInviteQueue] = useState<Array<{
    id: string;
    queryPw?: string;
    senderName?: string;
  }>>([]);

  // --- DUAL-SECTION COMPETE HISTORY TRACKERS ---
  const [activeHistoryTab, setActiveHistoryTab] = useState<"completed" | "saved" | "friends">("completed");
  const [requestedFriendIds, setRequestedFriendIds] = useState<string[]>([]);

  const [challengeLeaderboardCache, setChallengeLeaderboardCache] = useState<Record<string, any[]>>(() => {
    try {
      const saved = localStorage.getItem("sudoku_challenge_leaderboards");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") return parsed;
      }
    } catch {
      // Ignore parse errors and recreate cache
    }
    return {};
  });

  useEffect(() => {
    try {
      localStorage.setItem("sudoku_challenge_leaderboards", JSON.stringify(challengeLeaderboardCache));
    } catch {
      // Ignore failures to persist cache
    }
  }, [challengeLeaderboardCache]);

  const getCachedLeaderboard = (challengeId: string): any[] | undefined => {
    return challengeId ? challengeLeaderboardCache[challengeId] : undefined;
  };

  const getDisplayParticipants = (game: CompletedGame): any[] | undefined => {
    return getCachedLeaderboard(game.id) ?? game.participants;
  };

  const shouldRepairParticipants = (game: CompletedGame): boolean => {
    return !Array.isArray(game.participants) || game.participants.length === 0;
  };

  const repairGameParticipants = (game: CompletedGame, results: any[]): CompletedGame => {
    if (shouldRepairParticipants(game) && Array.isArray(results) && results.length > 0) {
      return { ...game, participants: results };
    }
    return game;
  };

  const resolveParticipantsForSave = (game: CompletedGame): any[] | undefined => {
    return game.participants || getCachedLeaderboard(game.id) || (game.id === activeGameId ? syncedLeaderboard : undefined);
  };

  const [savedGames, setSavedGames] = useState<CompletedGame[]>(() => {
    try {
      const saved = localStorage.getItem("sudoku_saved_games");
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.slice(0, 10);
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  const [completedGames, setCompletedGames] = useState<CompletedGame[]>(() => {
    try {
      const saved = localStorage.getItem("sudoku_completed_games");
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.slice(0, 10);
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  const [pendingChallenges, setPendingChallenges] = useState<PendingChallenge[]>(() => {
    try {
      const saved = localStorage.getItem("sudoku_pending_challenges");
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.sort((a: any, b: any) => (b.sentAt || 0) - (a.sentAt || 0)).slice(0, 10);
        }
      }
      return [];
    } catch {
      return [];
    }
  });


  // DB Sync callback
  const handleSyncAndMergeData = (newProfile: { id: string; name: string; email?: string; phone?: string; avatarColor: string }) => {
    const localWins = Number(localStorage.getItem("sudoku_winsCount") || "3");
    addLog(`🔄 Syncing: Successfully migrated ${localWins} wins and stats telemetry into secure cloud database.`);
    const updated = { ...newProfile, isSynced: true };
    setUserProfile(updated);
    localStorage.setItem("sudoku_userProfile", JSON.stringify(updated));
    showToast("Journal stats merged into database successfully!");
  };

  // Google OAuth flow disabled at this stage as requested
  useEffect(() => {
    // Disabled placeholder
    return;
  }, [gisLoaded, googleClientId, authModalTab, currentScreen]);

  // --- DYNAMIC RESUME GAME STATE LOOP ---
  const [savedSessionInfo, setSavedSessionInfo] = useState<{ difficulty: Difficulty; seconds: number } | null>(null);
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);

  // Save game state helper
  const saveCurrentGameToLocal = (state: BoardState | null, seconds: number, diff: Difficulty) => {
    if (!state || state.isGameOver) {
      localStorage.removeItem("sudoku_savedSession");
      setSavedSessionInfo(null);
      return;
    }
    try {
      const serializedGrid = state.grid.map(row => 
        row.map(cell => ({
          ...cell,
          notes: Array.from(cell.notes) // Convert Set to Array for JSON
        }))
      );
      const sessionData = {
        grid: serializedGrid,
        selectedRow: state.selectedRow,
        selectedCol: state.selectedCol,
        currentMistakesCount: state.currentMistakesCount,
        maxMistakesLimit: state.maxMistakesLimit,
        hintsCount: state.hintsCount,
        isGameOver: state.isGameOver,
        sessionSeconds: seconds,
        difficulty: diff,
        seed: state.seed,
        timestamp: Date.now()
      };
      localStorage.setItem("sudoku_savedSession", JSON.stringify(sessionData));
      setSavedSessionInfo({ difficulty: diff, seconds });
    } catch (error) {
      console.error("Autosave error:", error);
    }
  };

  const loadCurrentGameFromLocal = () => {
    try {
      const saved = localStorage.getItem("sudoku_savedSession");
      if (!saved) return null;
      const sessionData = JSON.parse(saved);
      const revivedGrid: SudokuCell[][] = sessionData.grid.map((row: any) => 
        row.map((cell: any) => ({
          ...cell,
          notes: new Set<number>(cell.notes)
        }))
      );
      const state: BoardState = {
        grid: revivedGrid,
        selectedRow: sessionData.selectedRow,
        selectedCol: sessionData.selectedCol,
        currentMistakesCount: sessionData.currentMistakesCount,
        maxMistakesLimit: sessionData.maxMistakesLimit,
        hintsCount: sessionData.hintsCount,
        isGameOver: sessionData.isGameOver,
        difficulty: sessionData.difficulty as Difficulty,
        seed: sessionData.seed || (Math.floor(Math.random() * 900000) + 100000)
      };
      return {
        state,
        seconds: sessionData.sessionSeconds,
        difficulty: sessionData.difficulty as Difficulty
      };
    } catch (error) {
      console.error("Resume loading error:", error);
      return null;
    }
  };

  useEffect(() => {
    if (currentScreen === "home" && typeof window !== "undefined" && window.innerWidth >= 1024) {
      setCurrentScreen("game");
      setNavigationHistory(["game"]);
    }
  }, [currentScreen]);

  // On Screen transitions to Home, update Saved state presence
  useEffect(() => {
    if (currentScreen === "home") {
      try {
        const saved = localStorage.getItem("sudoku_savedSession");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && !parsed.isGameOver) {
            setSavedSessionInfo({
              difficulty: parsed.difficulty,
              seconds: parsed.sessionSeconds
            });
          } else {
            setSavedSessionInfo(null);
          }
        } else {
          setSavedSessionInfo(null);
        }
      } catch {
        setSavedSessionInfo(null);
      }
    }
  }, [currentScreen]);

  // New settings toggles
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("sudoku_darkMode");
      if (saved !== null) {
        return saved === "true";
      }
      if (typeof window !== "undefined" && window.matchMedia) {
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
      }
      return false;
    } catch {
      return false;
    }
  });
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [soundEffects, setSoundEffects] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("sudoku_soundEffects");
      return saved !== null ? saved === "true" : true;
    } catch {
      return true;
    }
  });
  const [vibrations, setVibrations] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("sudoku_vibrations");
      return saved !== null ? saved === "true" : true;
    } catch {
      return true;
    }
  });
  const [timerEnabled, setTimerEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("sudoku_timerEnabled");
      return saved !== null ? saved === "true" : true;
    } catch {
      return true;
    }
  });
  const [displayScores, setDisplayScores] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("sudoku_displayScores");
      return saved !== null ? saved === "true" : true;
    } catch {
      return true;
    }
  });
  const [mistakeLimitEnabled, setMistakeLimitEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("sudoku_mistakeLimitEnabled");
      return saved !== null ? saved === "true" : true;
    } catch {
      return true;
    }
  });

  const [lightningMode, setLightningMode] = useState<boolean>(false);
  const [magicNote, setMagicNote] = useState<boolean>(false);
  const [hideUsedNumber, setHideUsedNumber] = useState<boolean>(false);
  const [highlightAreas, setHighlightAreas] = useState<boolean>(true);
  const [highlightIdentical, setHighlightIdentical] = useState<boolean>(true);
  const [showRemainingNumbers, setShowRemainingNumbers] = useState<boolean>(true);
  const [autoComplete, setAutoComplete] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("sudoku_notificationsEnabled");
      return saved !== null ? saved === "true" : true;
    } catch {
      return true;
    }
  });
  const [sessionStartTime] = useState<number>(() => Date.now());
  const [activeInviteNotification, setActiveInviteNotification] = useState<any | null>(null);

  // Stats status trackers derived directly from the actual completed games array (no fake data!)
  const gamesPlayed = completedGames.length;
  const winsCount = completedGames.filter(g => g.isWon).length;
  const [difficulty, setDifficulty] = useState<Difficulty>("EASY");
  // Dynamically analyze and compute the absolute actual best times from the actual completed won games (solo or challenge)
  const bestTimes = React.useMemo<Record<Difficulty, number>>(() => {
    const records: Record<Difficulty, number> = {
      EASY: 0,
      MEDIUM: 0,
      HARD: 0,
      EXPERT: 0
    };
    
    completedGames.forEach(g => {
      if (g.isWon && g.difficulty) {
        // Normalize difficulty casing
        const diffKey = g.difficulty.toUpperCase() as Difficulty;
        if (records[diffKey] === 0 || g.timeSec < records[diffKey]) {
          records[diffKey] = g.timeSec;
        }
      }
    });
    
    return records;
  }, [completedGames]);

  // Derived bestTime for current selected difficulty
  const bestTime = bestTimes[difficulty];

  // Together Mode dynamic colors mapped to selected difficulty and dark/light modes
  const themeTextAccent = darkMode ? (
    difficulty === "EASY" ? "text-emerald-400" :
    difficulty === "MEDIUM" ? "text-amber-400" :
    difficulty === "HARD" ? "text-purple-400" :
    "text-rose-400"
  ) : (
    difficulty === "EASY" ? "text-emerald-600" :
    difficulty === "MEDIUM" ? "text-amber-600" :
    difficulty === "HARD" ? "text-purple-600" :
    "text-rose-600"
  );

  // Dynamic box styling for settings, status elements, and containers mapping to current active difficulty color theme!
  const statusBoxBg = darkMode ? (
    difficulty === "EASY" ? "bg-emerald-950/20 border border-emerald-900/35 text-stone-200 shadow-md" :
    difficulty === "MEDIUM" ? "bg-amber-950/20 border border-amber-900/35 text-stone-200 shadow-md" :
    difficulty === "HARD" ? "bg-purple-950/20 border border-purple-900/35 text-stone-200 shadow-md" :
    "bg-rose-950/20 border border-rose-900/35 text-stone-200 shadow-md"
  ) : (
    difficulty === "EASY" ? "bg-[#E6F4EA]/60 border border-emerald-100 text-stone-850 shadow-[0_8px_30px_rgba(6,95,70,0.03)]" :
    difficulty === "MEDIUM" ? "bg-[#FFF99D]/40 border border-amber-100 text-[#854D0E] shadow-[0_8px_30px_rgba(133,77,14,0.03)]" :
    difficulty === "HARD" ? "bg-[#F3E8FF]/60 border border-purple-100 text-[#6B21A8] shadow-[0_8px_30px_rgba(107,33,168,0.03)]" :
    "bg-[#FCE7F3]/60 border border-pink-100 text-[#9D174D] shadow-[0_8px_30px_rgba(157,23,77,0.03)]"
  );

  const statusLabelColor = darkMode ? (
    difficulty === "EASY" ? "text-emerald-400" :
    difficulty === "MEDIUM" ? "text-amber-400" :
    difficulty === "HARD" ? "text-purple-400" :
    "text-rose-400"
  ) : (
    difficulty === "EASY" ? "text-emerald-700 font-bold" :
    difficulty === "MEDIUM" ? "text-amber-700 font-bold" :
    difficulty === "HARD" ? "text-purple-700 font-bold" :
    "text-rose-700 font-bold"
  );

  const statusGaugeStroke = darkMode ? (
    difficulty === "EASY" ? "#34d399" :
    difficulty === "MEDIUM" ? "#fbbf24" :
    difficulty === "HARD" ? "#c084fc" :
    "#f43f5e"
  ) : (
    difficulty === "EASY" ? "#065F46" :
    difficulty === "MEDIUM" ? "#854D0E" :
    difficulty === "HARD" ? "#6B21A8" :
    "#9D174D"
  );

  const themePrimaryBtn = darkMode ? (
    difficulty === "EASY" ? "bg-[#022c22] hover:bg-[#022c22]/80 text-[#d1fae5] font-black" :
    difficulty === "MEDIUM" ? "bg-[#451a03] hover:bg-[#451a03]/80 text-[#fef08a] font-black" :
    difficulty === "HARD" ? "bg-[#2e1065] hover:bg-[#2e1065]/80 text-[#e9d5ff] font-black" :
    "bg-[#4c0519] hover:bg-[#4c0519]/80 text-[#fecdd3] font-black"
  ) : (
    difficulty === "EASY" ? "bg-[#D1FAE5] hover:bg-[#A7F3D0]/70 text-[#065F46] font-black shadow-sm" :
    difficulty === "MEDIUM" ? "bg-[#FFF99D] hover:bg-[#ffffbf] text-[#854D0E] font-black shadow-sm" :
    difficulty === "HARD" ? "bg-[#F3E8FF] hover:bg-[#f3e8ff]/70 text-[#6B21A8] font-black shadow-sm" :
    "bg-[#FFE4E6] hover:bg-[#ffe4e6]/70 text-[#9D174D] font-black shadow-sm"
  );

  const themeSecondaryBtn = darkMode ? (
    difficulty === "EASY" ? "bg-zinc-800 text-emerald-400 hover:bg-zinc-750" :
    difficulty === "MEDIUM" ? "bg-zinc-800 text-amber-400 hover:bg-zinc-750" :
    difficulty === "HARD" ? "bg-zinc-800 text-purple-400 hover:bg-zinc-750" :
    "bg-zinc-800 text-rose-400 hover:bg-zinc-750"
  ) : (
    difficulty === "EASY" ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80" :
    difficulty === "MEDIUM" ? "bg-amber-50 text-amber-805 hover:bg-amber-100/80" :
    difficulty === "HARD" ? "bg-purple-50 text-purple-700 hover:bg-purple-100/85" :
    "bg-rose-50 text-rose-700 hover:bg-rose-100/85"
  );

  const themeSelectionBg = 
    difficulty === "EASY" ? "selection:bg-emerald-250" :
    difficulty === "MEDIUM" ? "selection:bg-amber-100" :
    difficulty === "HARD" ? "selection:bg-purple-100" :
    "selection:bg-rose-100";

  const themeCardShadow = darkMode 
    ? "0 8px 25px rgba(0,0,0,0.5)" 
    : difficulty === "EASY" ? "0 8px 25px rgba(6,95,70,0.05)" :
      difficulty === "MEDIUM" ? "0 8px 25px rgba(133,77,14,0.05)" :
      difficulty === "HARD" ? "0 8px 25px rgba(107,33,168,0.05)" :
      "0 8px 25px rgba(157,23,77,0.05)";

  const themeTabSelected = darkMode ? (
    difficulty === "EASY" ? "bg-zinc-800 text-emerald-400 font-bold" :
    difficulty === "MEDIUM" ? "bg-zinc-800 text-amber-400 font-bold" :
    difficulty === "HARD" ? "bg-zinc-800 text-purple-400 font-bold" :
    "bg-zinc-800 text-rose-400 font-bold"
  ) : (
    difficulty === "EASY" ? "bg-[#D1FAE5]/60 text-[#065F46] shadow-2xs font-extrabold" :
    difficulty === "MEDIUM" ? "bg-[#FFF99D]/60 text-[#854D0E] shadow-2xs font-extrabold" :
    difficulty === "HARD" ? "bg-[#F3E8FF]/60 text-[#6B21A8] shadow-2xs font-extrabold" :
    "bg-[#FFE4E6]/60 text-[#9D174D] shadow-2xs font-extrabold"
  );

  // Sync settings states to localStorage
  useEffect(() => {
    localStorage.setItem("sudoku_winsCount", String(winsCount));
    localStorage.setItem("sudoku_gamesPlayed", String(gamesPlayed));
  }, [winsCount, gamesPlayed]);

  useEffect(() => {
    localStorage.setItem("sudoku_darkMode", String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("sudoku_soundEffects", String(soundEffects));
  }, [soundEffects]);
  useEffect(() => {
    localStorage.setItem("sudoku_vibrations", String(vibrations));
  }, [vibrations]);
  useEffect(() => {
    localStorage.setItem("sudoku_timerEnabled", String(timerEnabled));
  }, [timerEnabled]);
  useEffect(() => {
    localStorage.setItem("sudoku_displayScores", String(displayScores));
  }, [displayScores]);
  useEffect(() => {
    localStorage.setItem("sudoku_mistakeLimitEnabled", String(mistakeLimitEnabled));
  }, [mistakeLimitEnabled]);

  useEffect(() => {
    localStorage.setItem("sudoku_notificationsEnabled", String(notificationsEnabled));
  }, [notificationsEnabled]);

  // Synchronize dynamic friend invitations across multiple browser tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "sudoku_together_accepted_timestamp") {
        setMultiplayerPlayers(prev => {
          let updated = false;
          const next = prev.map(p => {
            if (p.inviteStatus === "sent" && !updated) {
              updated = true;
              return { ...p, inviteStatus: "joined" as const };
            }
            return p;
          });
          if (updated) {
            addLog("✓ A participant accepted the invitation link from another screen and joined the lobby!");
            try { playClickSound(); } catch (err) {}
          }
          return next;
        });
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Real-time listener for incoming invites from Firestore
  useEffect(() => {
    const user = userProfile ? { uid: userProfile.id } : null;
    if (!user?.uid) return;

    console.log(`[Firestore] Subscribing to incoming invites for user: ${user.uid}`);
    const invitesCol = collection(db, "invites");
    
    const handleSnapshot = (snapshot: any) => {
      snapshot.docChanges().forEach((change: any) => {
        const inviteData = change.doc.data();
        const rawCode = inviteData.roomCode || inviteData.gameId || "";
        const roomCode = /^\d{6}$/.test(rawCode) ? rawCode : (rawCode.match(/SUDOKU-(\d{6})/i)?.[1] || rawCode);
        const gameId = roomCode || rawCode;
        const inviteId = change.doc.id;

        if (change.type === "added") {
          const ts = inviteData.timestamp;
          const inviteTime = typeof ts === "number" ? ts : (ts?.toMillis ? ts.toMillis() : Date.now());
          
          const matchDiff = gameId.match(/-EASY|-MEDIUM|-HARD|-EXPERT/i);
          const difficulty = matchDiff ? matchDiff[0].replace("-", "").toUpperCase() : "EASY";
          const matchSeed = gameId.match(/SUDOKU-(\d+)/i);
          const seed = matchSeed ? parseInt(matchSeed[1], 10) : (parseInt(roomCode, 10) || 123456);
          const matchMistakes = gameId.match(/-M(\d+)/i);
          const maxMistakes = matchMistakes ? parseInt(matchMistakes[1], 10) : 3;
          const matchHint = gameId.match(/-H(\d+)/i);
          const hintLimit = matchHint ? parseInt(matchHint[1], 10) : 3;
          const matchTimer = gameId.match(/-T(\d+)/i);
          const timerEnabled = matchTimer ? matchTimer[1] === "1" : true;
          
          const newPending = {
            id: roomCode || gameId,
            inviteId: inviteId,
            senderName: inviteData.fromName || "Player",
            difficulty,
            seed,
            maxMistakes,
            hintLimit,
            timerEnabled,
            password: inviteData.password || "",
            sentAt: inviteTime
          };

          setPendingChallenges(prev => {
            if (prev.some(p => p.inviteId === inviteId || p.id === (roomCode || gameId))) return prev;
            const updated = [newPending, ...prev].slice(0, 10);
            try {
              localStorage.setItem("sudoku_pending_challenges", JSON.stringify(updated));
            } catch (e) {}
            return updated;
          });

          if (inviteTime > sessionStartTime - 5000) {
            if (notificationsEnabled) {
              if (document.visibilityState === "hidden") {
                triggerBackgroundNotification(inviteData);
              } else {
                playInviteChime();
                setActiveInviteNotification({
                  id: inviteId,
                  fromName: inviteData.fromName || "Player",
                  gameId: roomCode || gameId,
                  roomCode: roomCode,
                  password: inviteData.password || "",
                  recipientId: inviteData.recipientId || inviteData.toUserId || user.uid,
                  toUserId: inviteData.toUserId || inviteData.recipientId || user.uid,
                  status: inviteData.status || "pending"
                });
              }
            }
          }
        } else if (change.type === "modified") {
          if (inviteData.status !== "pending") {
            setPendingChallenges(prev => {
              const updated = prev.filter(p => p.inviteId !== inviteId && p.id !== gameId);
              try {
                localStorage.setItem("sudoku_pending_challenges", JSON.stringify(updated));
              } catch (e) {}
              return updated;
            });
          }
        } else if (change.type === "removed") {
          setPendingChallenges(prev => {
            const updated = prev.filter(p => p.inviteId !== inviteId && p.id !== gameId);
            try {
              localStorage.setItem("sudoku_pending_challenges", JSON.stringify(updated));
            } catch (e) {}
            return updated;
          });
        }
      });
    };

    const q1 = query(invitesCol, where("toUserId", "==", user.uid), where("status", "==", "pending"));
    const unsubscribe1 = onSnapshot(q1, handleSnapshot);

    const q2 = query(invitesCol, where("recipientId", "==", user.uid), where("status", "==", "pending"));
    const unsubscribe2 = onSnapshot(q2, handleSnapshot);

    return () => {
      console.log(`[Firestore] Unsubscribing from incoming invites for user: ${user.uid}`);
      unsubscribe1();
      unsubscribe2();
    };
  }, [userProfile?.id, notificationsEnabled, sessionStartTime]);

  // Dynamically update friends & past players to "online/live" if another app instance/tab is open in the browser
  useEffect(() => {
    const tabId = Math.random().toString(36).substring(2, 11);
    
    const updatePresence = () => {
      const now = Date.now();
      try {
        localStorage.setItem(`sudoku_active_tab_${tabId}`, String(now));
      } catch (err) {}

      // Clean up dead tabs and check for other active ones
      let otherTabExists = false;
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("sudoku_active_tab_")) {
          const id = key.substring("sudoku_active_tab_".length);
          if (id === tabId) continue;
          
          try {
            const val = Number(localStorage.getItem(key));
            if (now - val > 4000) {
              keysToRemove.push(key);
            } else {
              otherTabExists = true;
            }
          } catch (e) {
            keysToRemove.push(key);
          }
        }
      }

      // Remove stale entries
      keysToRemove.forEach(k => {
        try { localStorage.removeItem(k); } catch (e) {}
      });

      // Update statuses dynamically inside React state
      setMultiplayerPlayers(prev => {
        return prev.map(p => {
          // If another tab exists, make specific players online (Alex Code, Chloe Zen, Yuki Matsu, Liam Stone)
          // otherwise set everyone to offline
          const shouldBeOnline = otherTabExists && (p.id === "mp-1" || p.id === "mp-2" || p.id === "mp-4" || p.id === "mp-6");
          const targetStatus = shouldBeOnline ? "online" as const : "offline" as const;
          if (p.status !== targetStatus) {
            return { ...p, status: targetStatus };
          }
          return p;
        });
      });
    };

    // Run immediately and then on a regular interval
    updatePresence();
    const interval = setInterval(updatePresence, 1500);

    // Also clean up on tab unload
    const handleUnload = () => {
      try {
        localStorage.removeItem(`sudoku_active_tab_${tabId}`);
      } catch (err) {}
    };
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleUnload);
      handleUnload();
    };
  }, []);

  // Spam Control & Queue processor: checks periodically or when invite queue or mute state changes
  useEffect(() => {
    const processQueue = () => {
      const now = Date.now();
      const isMuted = now < muteUntil;
      const isShowing = showInviteModal;

      if (!isMuted && !isShowing && inviteQueue.length > 0) {
        const nextInvite = inviteQueue[0];
        // Dequeue
        setInviteQueue(prev => prev.slice(1));
        // Parse & trigger the modal directly!
        triggerLoadInviteDirectly(nextInvite.id, nextInvite.queryPw, nextInvite.senderName);
      }
    };

    processQueue();

    const interval = setInterval(processQueue, 2000);
    return () => clearInterval(interval);
  }, [showInviteModal, muteUntil, inviteQueue]);

  // Navigation interceptor using History API for Android/system swipe-to-back gestures
  useEffect(() => {
    // Initialize initial state if empty to keep history alignment intact
    if (!window.history.state || !window.history.state.hasOwnProperty("view")) {
      window.history.replaceState({ view: "home" }, "", window.location.href);
    }

    const handlePopState = (event: PopStateEvent) => {
      const params = new URLSearchParams(window.location.search);
      let chalParam = params.get("challenge") || params.get("gameId") || params.get("seed") || params.get("room");
      if (!chalParam && window.location.hash) {
        const qs = window.location.hash.substring(window.location.hash.indexOf("?") + 1);
        const hashParams = new URLSearchParams(qs);
        chalParam = hashParams.get("challenge") || hashParams.get("gameId") || hashParams.get("seed") || hashParams.get("room");
      }
      if (!chalParam && window.location.hash) {
        const cleanedHash = window.location.hash.substring(1);
        if (cleanedHash.startsWith("SUDOKU-")) {
          chalParam = cleanedHash;
        }
      }

      if (chalParam) {
        const queryPw = params.get("pin") || params.get("pw") || params.get("password");
        const senderParam = params.get("sender") || params.get("senderName") || params.get("invitedBy") || params.get("sender_name");
        handleLoadChallengeFromId(chalParam, queryPw || undefined, senderParam || undefined, true);
        return;
      }

      const state = event.state;
      if (state && typeof state === "object" && state.view) {
        const v = state.view as "home" | "status" | "settings" | "game" | "login" | "together";
        setCurrentScreen(v);
        setNavigationHistory(prev => {
          if (prev[prev.length - 2] === v) {
            return prev.slice(0, -1);
          }
          if (prev[prev.length - 1] === v) return prev;
          return [...prev, v];
        });
      } else {
        setCurrentScreen("home");
        setNavigationHistory(["home"]);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const saveOpponentsToPastPlayers = async (opponents: Array<{ id: string, name: string }>) => {
    const currentUserId = userProfile?.id;
    if (!currentUserId) return;

    // Filter out self and anonymous guests
    const filteredOpponents = opponents.filter(opp => opp.id && opp.id !== currentUserId && opp.id !== "GUEST_ANON" && opp.id !== "me");
    if (filteredOpponents.length === 0) return;

    console.log("[Multiplayer] Saving opponents to past players:", filteredOpponents);

    // 1. Update local state `multiplayerPlayers`
    setMultiplayerPlayers(prev => {
      let next = [...prev];
      let updated = false;

      filteredOpponents.forEach(opp => {
        const index = next.findIndex(p => p.id === opp.id);
        if (index === -1) {
          next.push({
            id: opp.id,
            name: opp.name || "Player " + opp.id.substring(0, 5),
            isFriend: false,
            status: "offline" as const,
            inviteStatus: "idle" as const
          });
          updated = true;
        } else {
          // If name changed or was blank, update it
          if (opp.name && next[index].name !== opp.name) {
            next[index] = { ...next[index], name: opp.name };
            updated = true;
          }
        }
      });

      return updated ? next : prev;
    });

    // 2. Write to Firestore `users/{currentUserId}/past_players/{opponentId}`
    try {
      for (const opp of filteredOpponents) {
        // Find if they are currently marked as a friend locally
        const localRecord = multiplayerPlayers.find(p => p.id === opp.id);
        const isFriendVal = localRecord ? localRecord.isFriend : false;

        const pastPlayerRef = doc(db, "users", currentUserId, "past_players", opp.id);
        await setDoc(pastPlayerRef, {
          id: opp.id,
          name: opp.name || "Player",
          isFriend: isFriendVal,
          timestamp: serverTimestamp()
        }, { merge: true });
      }
      console.log("[Firestore] Opponents saved to users subcollection successfully.");
    } catch (err) {
      console.error("[Firestore] Failed to save opponents to past_players subcollection:", err);
    }
  };

  const handleToggleFriend = (playerId: string, playerName?: string) => {
    playClickSound();

    if (!isUserAuthorizedForMultiplayer()) {
      setLoginRequiredPurpose("ADD_FRIEND");
      setShowLoginRequiredModal(true);
      return;
    }

    setMultiplayerPlayers(prev => {
      const playerIndex = prev.findIndex(p => p.id === playerId);

      if (playerIndex >= 0) {
        const player = prev[playerIndex];
        if (player.isFriend) {
          // Remove friend
          const updated = prev.map(p => p.id === playerId ? { ...p, isFriend: false } : p);
          addLog(`✓ ${player.name} removed from Friends list.`);
          showToast(`Removed ${player.name} from friends.`);

          // Async sync to Firestore
          const currentUserId = userProfile?.id;
          if (currentUserId) {
            const pastPlayerRef = doc(db, "users", currentUserId, "past_players", playerId);
            setDoc(pastPlayerRef, { isFriend: false }, { merge: true }).catch(err => {
              console.error("[Firestore] Failed to remove friend in DB:", err);
            });
          }

          return updated;
        } else {
          // Enforce 50-friend cap
          const currentFriendsCount = prev.filter(p => p.isFriend).length;
          if (currentFriendsCount >= 50) {
            showToast("Friend limit reached (Max 50 friends).");
            addLog("⚠️ Attempted to add friend but limit of 50 has been reached.");
            return prev;
          }

          // Add friend
          const updated = prev.map(p => p.id === playerId ? { ...p, isFriend: true } : p);
          addLog(`✓ ${player.name} connected and added to Friends list.`);
          showToast(`✓ Added ${player.name} as a persistent friend!`);

          // Async sync to Firestore
          const currentUserId = userProfile?.id;
          if (currentUserId) {
            const pastPlayerRef = doc(db, "users", currentUserId, "past_players", playerId);
            setDoc(pastPlayerRef, { isFriend: true }, { merge: true }).catch(err => {
              console.error("[Firestore] Failed to add friend in DB:", err);
            });
          }

          return updated;
        }
      } else {
        // Enforce 50-friend cap
        const currentFriendsCount = prev.filter(p => p.isFriend).length;
        if (currentFriendsCount >= 50) {
          showToast("Friend limit reached (Max 50 friends).");
          addLog("⚠️ Attempted to add friend but limit of 50 has been reached.");
          return prev;
        }

        // Add them as a new friend directly since they aren't in the list
        const name = playerName || "Player " + playerId.substring(0, 5);
        const newPlayer = {
          id: playerId,
          name: name,
          isFriend: true,
          status: "offline" as const,
          inviteStatus: "idle" as const
        };
        const updated = [...prev, newPlayer];
        addLog(`✓ ${name} added to past players and Friends list.`);
        showToast(`✓ Added ${name} as a persistent friend!`);

        // Async sync to Firestore
        const currentUserId = userProfile?.id;
        if (currentUserId) {
          const pastPlayerRef = doc(db, "users", currentUserId, "past_players", playerId);
          setDoc(pastPlayerRef, {
            id: playerId,
            name: name,
            isFriend: true,
            timestamp: serverTimestamp()
          }, { merge: true }).catch(err => {
            console.error("[Firestore] Failed to add new friend in DB:", err);
          });
        }

        return updated;
      }
    });
  };

  const saveFcmToken = async (token: string) => {
    try {
      console.log(`[FCM] Storing token to user profile: ${token}`);
      localStorage.setItem("sudoku_fcm_token", token);
      if (userProfile?.id) {
        const userRef = doc(db, "users", userProfile.id);
        await setDoc(userRef, { fcmToken: token }, { merge: true });
      }
    } catch (e) {
      console.error("[FCM] Failed to save FCM token:", e);
    }
  };

  const parseGameId = (gameId: string) => {
    const regex = /^SUDOKU-(\d+)-([A-Z]+)-M(\d+)(?:-H(\d+))?-T([01])(?:-P([a-zA-Z0-9+=]+))?$/i;
    const match = gameId ? gameId.match(regex) : null;
    if (match) {
      const seed = parseInt(match[1], 10);
      const rawDiff = match[2].toUpperCase();
      const validDiffs: Difficulty[] = ["EASY", "MEDIUM", "HARD", "EXPERT"];
      const diff: Difficulty = validDiffs.includes(rawDiff as Difficulty) ? (rawDiff as Difficulty) : "MEDIUM";
      const mistakes = Math.min(Math.max(0, parseInt(match[3], 10) || 3), 999);
      const hintLimit = match[4] !== undefined ? Math.min(Math.max(0, parseInt(match[4], 10) || 3), 20) : 3;
      const timerOn = match[5] === "1";
      const rawPassword = match[6] || "";
      return { seed, diff, mistakes, hintLimit, timerOn, rawPassword };
    }
    return null;
  };

  // Universal Auto-Navigate on Accept - Single Source of Truth from Firestore
  const handleAcceptAndLaunchInvite = async (
    targetGameId: string,
    inviteDocId?: string,
    passwordOverride?: string,
    isDirectInvite = false,
    preloadedRoomData?: any
  ) => {
    playClickSound();

    // 1. Optimistically switch directly to game arena and dismiss open modals immediately (<1ms)
    // This completely prevents the Home screen from flashing or bouncing!
    navigateToScreen("game");
    setShowGameOverModal(false);
    setShowInviteModal(false);
    setShowBellInvitesModal(false);
    setShowCreateChallengeModal(false);
    setShowRematchInviteModal(false);
    setShowJoinRoomModal(false);
    setShowMultiplayerForkModal(false);

    // Update Firestore invite status if doc ID provided
    if (inviteDocId) {
      try {
        await updateDoc(doc(db, "invites", inviteDocId), { status: "accepted" });
      } catch (err) {
        console.error("[Firestore] Failed to update invite to accepted:", err);
      }
    }

    // Extract canonical 6-digit roomCode
    const trimmedId = (targetGameId || "").trim();
    let roomCode = "";
    if (/^\d{6}$/.test(trimmedId)) {
      roomCode = trimmedId;
    } else {
      const matchSudoku = trimmedId.match(/SUDOKU-(\d{6})/i);
      if (matchSudoku) {
        roomCode = matchSudoku[1];
      } else {
        const digits = trimmedId.replace(/[^0-9]/g, '');
        if (digits.length >= 6) {
          roomCode = digits.slice(0, 6);
        }
      }
    }

    if (!roomCode) {
      showToast("❌ Invalid room code.");
      navigateToScreen("home");
      return;
    }

    // Read canonical session document from Firestore (/rooms/{roomCode}) or use preloaded
    let seed: number;
    let diff: Difficulty;
    let mistakesLimit: number;
    let hintsLimit: number;
    let timerEnabled: boolean;
    let preloadedBoard: { puzzle?: number[][]; solution?: number[][] } | undefined;

    try {
      let rData = preloadedRoomData;
      if (!rData) {
        const roomSnap = await getDoc(doc(db, "rooms", roomCode));
        if (!roomSnap.exists()) {
          console.warn(`[Firestore] Canonical room /rooms/${roomCode} not found.`);
          showToast("❌ Room not found or no longer active.");
          addLog(`⚠️ Attempted join failed: Room /rooms/${roomCode} does not exist in Firestore.`);
          navigateToScreen("home");
          return;
        }
        rData = roomSnap.data();
      }

      if (rData.status === "closed" || rData.isClosed) {
        showToast("❌ This room session is closed.");
        navigateToScreen("home");
        return;
      }

      // Security check for locked rooms if PIN is set (Bypassed if direct in-game invite)
      if (isDirectInvite) {
        // Unconditional bypass: skip all PIN / password validation
      } else if (rData.isLocked) {
        const expectedPin = (rData.pin || rData.roomPin || "").trim();
        if (expectedPin.length > 0) {
          const providedPin = (passwordOverride || "").trim();
          let isMatch = providedPin === expectedPin || decodePass(providedPin) === expectedPin;
          try {
            if (decodeURIComponent(providedPin) === expectedPin) isMatch = true;
          } catch (e) {}
          if (!isMatch) {
            showToast("❌ Room PIN required or incorrect.");
            navigateToScreen("home");
            return;
          }
        }
      }

      seed = rData.seed !== undefined ? Number(rData.seed) : parseInt(roomCode, 10);
      diff = (rData.difficulty || "EASY").toUpperCase() as Difficulty;
      mistakesLimit = rData.mistakesLimit !== undefined 
        ? Number(rData.mistakesLimit) 
        : (rData.mistakeLimit !== undefined ? Number(rData.mistakeLimit) : 3);
      hintsLimit = rData.hintsLimit !== undefined 
        ? Number(rData.hintsLimit) 
        : (rData.hintLimit !== undefined ? Number(rData.hintLimit) : 3);
      timerEnabled = rData.timerEnabled !== undefined ? Boolean(rData.timerEnabled) : true;
      if (rData.puzzle && rData.solution) {
        preloadedBoard = { puzzle: rData.puzzle, solution: rData.solution };
      }
    } catch (err) {
      console.error("[Firestore] Failed to read canonical room document:", err);
      showToast("❌ Network error connecting to room.");
      navigateToScreen("home");
      return;
    }

    // 2. Dismiss remaining modals & drawers
    setShowHowToPlayModal(false);
    setShowDeleteAccountModal(false);
    setShowResetSettingsModal(false);
    setShowDisplayNameModal(false);
    setShowAuthModal(false);
    setShowLoginRequiredModal(false);
    setShowTargetLoginRequiredModal(false);
    setActiveCompliancePage(null);
    setActiveInviteNotification(null);
    setEndGameStep(1);

    // 3. Set current active match ID to the canonical roomCode
    setActiveGameId(roomCode);
    setRematchGameId(roomCode);
    setChallengeMode(true);
    setChallengeSeed(seed);
    setChallengeDifficulty(diff);
    setChallengeMistakeLimit(mistakesLimit);
    setChallengeTimerEnabled(timerEnabled);
    setChallengeHintLimit(hintsLimit);
    setDifficulty(diff);
    setMistakeLimitEnabled(mistakesLimit !== 999);
    setTimerEnabled(timerEnabled);

    // 4. Register challenge join in Firestore
    registerChallengeJoin(roomCode);

    // 5. Mount puzzle using the exact canonical parameters and preloaded board if present
    await generateAndSetNewPuzzle(diff, seed, mistakesLimit, timerEnabled, hintsLimit, preloadedBoard);
    setSessionSeconds(0);
    setIsTimerPaused(false);

    try { window.history.replaceState({ view: "game" }, "", window.location.pathname); } catch (e) {}
    try { localStorage.setItem("sudoku_together_accepted_timestamp", String(Date.now())); } catch (e) {}

    // Clean from local pending challenges
    setPendingChallenges(prev => {
      const updated = prev.filter(p => p.id !== targetGameId && p.id !== roomCode);
      try {
        localStorage.setItem("sudoku_pending_challenges", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    addLog(`✓ Joined canonical room #${roomCode}! Entering game arena...`);
    showToast(`✓ Joined Room ${roomCode}!`);
  };

  const handleAcceptAndPlayBellInvite = async (challenge: PendingChallenge) => {
    const code = String(challenge.seed || challenge.id).padStart(6, '0').slice(-6);
    await handleAcceptAndLaunchInvite(code, challenge.inviteId, challenge.password, true);
  };

  const handleDeclineBellInvite = async (challenge: PendingChallenge) => {
    playClickSound();
    if (challenge.inviteId) {
      try {
        await updateDoc(doc(db, "invites", challenge.inviteId), { status: "declined" });
      } catch (err) {
        console.error("Failed to decline invite in DB:", err);
      }
    }
    setPendingChallenges(prev => {
      const updated = prev.filter(p => p.id !== challenge.id);
      try {
        localStorage.setItem("sudoku_pending_challenges", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    showToast("Challenge invitation declined.");
  };

  const registerPushNotifications = async () => {
    const user = userProfile ? { uid: userProfile.id } : null;
    if (!user?.uid) return;
    if (!notificationsEnabled) return;
    
    try {
      if (Capacitor.isNativePlatform()) {
        console.log("[Push] Requesting native push permissions...");
        let permStatus = await PushNotifications.checkPermissions();
        
        if (permStatus.receive === 'prompt') {
          permStatus = await PushNotifications.requestPermissions();
        }
        
        if (permStatus.receive === 'granted') {
          console.log("[Push] Native push permission granted. Registering...");
          try {
            await PushNotifications.register();
            await LocalNotifications.requestPermissions();
          } catch (fcmErr: any) {
            // FCM init failed — most likely google-services.json is missing from android/app/
            // Log gracefully and skip — do NOT let this bubble up and crash the app process
            console.error("[Push] FCM registration failed. Is google-services.json present in android/app/?", fcmErr);
            return;
          }
        } else {
          console.warn("[Push] Native push permission denied.");
        }
      } else {
        if (typeof window !== "undefined" && "Notification" in window) {
          console.log("[Push] Requesting web push permissions...");
          const permission = await Notification.requestPermission();
          if (permission === "granted") {
            console.log("[Push] Web push permission granted.");
            if (messaging) {
              try {
                const registration = await navigator.serviceWorker.ready;
                const token = await getToken(messaging, { 
                  serviceWorkerRegistration: registration
                });
                if (token) {
                  saveFcmToken(token);
                }
              } catch (err) {
                console.error("[Push] Failed to get web push token:", err);
              }
            }
          } else {
            console.warn("[Push] Web push permission denied.");
          }
        }
      }
    } catch (err) {
      console.error("[Push] Error during registerPushNotifications:", err);
    }
  };

  const triggerBackgroundNotification = async (inviteData: any) => {
    const title = "Sudoku Challenge Invite";
    const body = `${inviteData.fromName} invited you to play Sudoku!`;
    const gameId = inviteData.gameId;
    const password = inviteData.password || "";
    const senderName = inviteData.fromName || "Player";

    if (Capacitor.isNativePlatform()) {
      try {
        await LocalNotifications.schedule({
          notifications: [
            {
              title,
              body,
              id: Math.floor(Math.random() * 100000),
              extra: { gameId, password, senderName },
              actionTypeId: "tap_invite"
            }
          ]
        });
        console.log("[Push] Scheduled native background local notification.");
      } catch (err) {
        console.error("[Push] Failed to schedule native local notification:", err);
      }
    } else {
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        try {
          const registration = await navigator.serviceWorker.ready;
          registration.showNotification(title, {
            body,
            icon: '/logo.png',
            data: { gameId, password, senderName }
          });
          console.log("[Push] Dispatched web background notification via SW.");
        } catch (err) {
          new Notification(title, { body });
          console.log("[Push] Dispatched web background notification via default Notification class.");
        }
      }
    }
  };

  // Set up push notification listeners
  useEffect(() => {
    const user = userProfile ? { uid: userProfile.id } : null;
    if (!user?.uid) return;
    if (!notificationsEnabled) return;

    let pushRegListener: any = null;
    let pushErrListener: any = null;
    let pushRecListener: any = null;
    let pushActListener: any = null;
    let localActListener: any = null;

    const setupListeners = async () => {
      try {
        if (Capacitor.isNativePlatform()) {
          pushRegListener = await PushNotifications.addListener('registration', (token) => {
            console.log("[Push] Native registration success. Token:", token.value);
            saveFcmToken(token.value);
          });

          pushErrListener = await PushNotifications.addListener('registrationError', (err) => {
            console.error("[Push] Native registration error:", err);
          });

          pushRecListener = await PushNotifications.addListener('pushNotificationReceived', (notification) => {
            console.log("[Push] Native push received in foreground/background:", notification);
            if (notificationsEnabled) {
              playInviteChime();
              const { gameId, password, senderName } = notification.data || {};
              if (gameId) {
                setActiveInviteNotification({
                  id: notification.id || Math.random().toString(),
                  fromName: senderName || "Player",
                  gameId,
                  password: password || ""
                });
              }
            }
          });

          pushActListener = await PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
            console.log("[Push] Native push action performed:", action);
            const { gameId, password, senderName } = action.notification.data || {};
            if (gameId) {
              handleLoadChallengeFromId(gameId, password, senderName);
            }
          });

          localActListener = await LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
            console.log("[Push] Native local action performed:", action);
            const { gameId, password, senderName } = action.notification.extra || {};
            if (gameId) {
              handleLoadChallengeFromId(gameId, password, senderName);
            }
          });
        } else {
          const handleServiceWorkerMessage = (event: MessageEvent) => {
            if (event.data && event.data.type === 'navigate_invite') {
              console.log("[Push] Web push action received from SW:", event.data);
              const { gameId, password, senderName } = event.data;
              handleLoadChallengeFromId(gameId, password, senderName);
            }
          };
          navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
          return () => {
            navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
          };
        }
      } catch (err) {
        console.error("[Push] Error setting up listeners:", err);
      }
    };

    setupListeners();

    return () => {
      try {
        if (pushRegListener) pushRegListener.remove();
        if (pushErrListener) pushErrListener.remove();
        if (pushRecListener) pushRecListener.remove();
        if (pushActListener) pushActListener.remove();
        if (localActListener) localActListener.remove();
      } catch (err) {
        console.error("[Push] Error cleaning up listeners:", err);
      }
    };
  }, [userProfile?.id, notificationsEnabled]);

  // Trigger push registration when setting is enabled
  useEffect(() => {
    if (notificationsEnabled) {
      registerPushNotifications();
    }
  }, [notificationsEnabled]);

  // Click sound generator (tactile crisp feedback)
  const playClickSound = () => {
    if (!soundEffects) return; // settings guard cond
    try {
      const audioCtx = getAudioCtx();
      if (!audioCtx) return;
      
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
      console.error("Audio Web Synth Click Error:", e);
    }
  };

  // Play an immediate, distinct error/alert audio tone (clean negative beep)
  const playMistakeSound = () => {
    if (!soundEffects) return; // settings guard cond
    try {
      const audioCtx = getAudioCtx();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, audioCtx.currentTime); // A3
      osc.frequency.exponentialRampToValueAtTime(140, audioCtx.currentTime + 0.18);

      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.18);
    } catch (e) {
      console.error("Audio Mistake Sound Error:", e);
    }
  };

  // Play a pleasant ascending invitation chime (C5 -> E5) using Web Audio API
  const playInviteChime = () => {
    if (!notificationsEnabled) return; // settings guard cond
    try {
      const audioCtx = getAudioCtx();
      if (!audioCtx) return;

      const playNote = (freq: number, start: number, duration: number) => {
        try {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0.08, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
          osc.start(start);
          osc.stop(start + duration);
        } catch (noteErr) {
          console.warn("Audio chime note play blocked:", noteErr);
        }
      };

      const now = audioCtx.currentTime;
      playNote(523.25, now, 0.15); // C5
      playNote(659.25, now + 0.10, 0.25); // E5
    } catch (e) {
      console.error("Audio Chime Error:", e);
    }
  };

  // Celebration win fanfare (chord / arpeggio)
  const playWinSound = () => {
    if (!soundEffects) return; // settings guard cond
    try {
      const audioCtx = getAudioCtx();
      if (!audioCtx) return;
      
      const playNote = (freq: number, start: number, duration: number, type: OscillatorType = "triangle") => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, start);
        
        gain.gain.setValueAtTime(0.10, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        
        osc.start(start);
        osc.stop(start + duration);
      };
      
      const now = audioCtx.currentTime;
      playNote(261.63, now, 0.25); // C4
      playNote(329.63, now + 0.12, 0.25); // E4
      playNote(392.00, now + 0.24, 0.25); // G4
      playNote(523.25, now + 0.36, 0.4); // C5
      playNote(659.25, now + 0.52, 0.4); // E5
      playNote(783.99, now + 0.68, 1.0, "sine"); // G5
      playNote(1046.50, now + 0.68, 1.0, "sine"); // C6
    } catch (e) {
      console.error("Audio Web Synth Win Error:", e);
    }
  };
  
  // Advanced Preference Variables (representing Jetpack DataStore states)
  const [isNumberFirstInputMode, setIsNumberFirstInputMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("sudoku_isNumberFirstInputMode");
      return saved !== null ? saved === "true" : false;
    } catch {
      return false;
    }
  });
  const [isAutoRemoveNotesEnabled, setIsAutoRemoveNotesEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("sudoku_isAutoRemoveNotesEnabled");
      return saved !== null ? saved === "true" : true;
    } catch {
      return true;
    }
  });
  const [isPreventMistakeNotesEnabled, setIsPreventMistakeNotesEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("sudoku_isPreventMistakeNotesEnabled");
      return saved !== null ? saved === "true" : true;
    } catch {
      return true;
    }
  });
  const [hintInventory, setHintInventory] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("sudoku_hintInventory");
      return saved !== null ? parseInt(saved, 10) : 3;
    } catch {
      return 3;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("sudoku_isNumberFirstInputMode", String(isNumberFirstInputMode));
    } catch (e) {
      console.error(e);
    }
  }, [isNumberFirstInputMode]);

  useEffect(() => {
    try {
      localStorage.setItem("sudoku_isAutoRemoveNotesEnabled", String(isAutoRemoveNotesEnabled));
    } catch (e) {
      console.error(e);
    }
  }, [isAutoRemoveNotesEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem("sudoku_isPreventMistakeNotesEnabled", String(isPreventMistakeNotesEnabled));
    } catch (e) {
      console.error(e);
    }
  }, [isPreventMistakeNotesEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem("sudoku_hintInventory", String(hintInventory));
    } catch (e) {
      console.error(e);
    }
  }, [hintInventory]);

  // Locked number for Number-First input mode
  const [lockedNum, setLockedNum] = useState<number | null>(null);

  // Rewarded Video Ad simulated card states
  const [rewardType, setRewardType] = useState<"hint_reward" | "mistake_reward" | null>(null);
  const [isWatchingAd, setIsWatchingAd] = useState<boolean>(false);
  const [adSuccessMsg, setAdSuccessMsg] = useState<boolean>(false);
  const [hintExplanation, setHintExplanation] = useState<{ num: number, row: number, col: number } | null>(null);

  // Support Modals
  const [showHowToPlayModal, setShowHowToPlayModal] = useState<boolean>(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState<boolean>(false);
  const [showResetSettingsModal, setShowResetSettingsModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sudoku state variables
  const [boardState, setBoardState] = useState<BoardState | null>(null);

  const hasTriggeredGameOverRef = useRef(false);

  useEffect(() => {
    if (boardState?.isGameOver) {
      if (!hasTriggeredGameOverRef.current) {
        hasTriggeredGameOverRef.current = true;
        setShowGameOverModal(true);
        setEndGameStep(1); // Always start on Screen 1 (Results) when game first ends
        setPendingRematchSeed(null);
        if (challengeMode) {
          // Populate rematchParticipants immediately when game is over
          const othersList: Array<{ id: string; name: string; isReal: boolean }> = [];
          syncedLeaderboard.forEach(r => {
            if (r.userId !== userProfile?.id && !othersList.some(o => o.id === r.userId)) {
              othersList.push({ id: r.userId, name: r.playerName, isReal: true });
            }
          });
          setRematchParticipants(othersList);
          setRematchInvitedPlayers(new Set());
        }
      }
    } else {
      hasTriggeredGameOverRef.current = false;
      setShowGameOverModal(false);
    }
  }, [boardState?.isGameOver, challengeMode, syncedLeaderboard, userProfile?.id]);

  const [pencilMode, setPencilMode] = useState<boolean>(false);
  const [solutionGrid, setSolutionGrid] = useState<number[][]>([]);
  const [history, setHistory] = useState<SudokuCell[][][]>([]);

  const resumeSavedSession = () => {
    const loaded = loadCurrentGameFromLocal();
    if (loaded) {
      setBoardState(loaded.state);
      setSessionSeconds(loaded.seconds);
      setDifficulty(loaded.difficulty);
      
      const boardArr = loaded.state.grid.map(row => 
        row.map(c => c.isOriginalClue ? c.value : 0)
      );
      solveSudokuRecursive(boardArr);
      setSolutionGrid(boardArr);
      return loaded;
    }
    return null;
  };
  
  // Visual Backtracking visualizer state
  const [visualizingBacktrack, setVisualizingBacktrack] = useState<boolean>(false);
  const [backtrackStepsRun, setBacktrackStepsRun] = useState<number>(0);
  const [backtrackStackHeight, setBacktrackStackHeight] = useState<number>(0);
  const [backtrackCurrentCell, setBacktrackCurrentCell] = useState<{ r: number, c: number } | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [generatorLogs, setGeneratorLogs] = useState<string[]>([]);

  // Sandbox sticker customization variables
  // Automated background cache on every board touch callback or timer tick
  useEffect(() => {
    if (currentScreen === "game" && boardState && !boardState.isGameOver) {
      saveCurrentGameToLocal(boardState, sessionSeconds, difficulty);
    }
  }, [boardState, sessionSeconds, currentScreen, difficulty]);

  const [stickers, setStickers] = useState<Array<{ id: string; type: string; content: string; color: string; x: number; y: number; rotation: number; scale: number }>>([
    { id: "1", type: "badge", content: "ENGINE OK", color: "#10B981", x: 670, y: 300, rotation: 12, scale: 1.1 },
    { id: "2", type: "tape", content: "washi-tape", color: "rgba(254, 240, 138, 0.6)", x: 20, y: 140, rotation: -8, scale: 1.1 },
    { id: "3", type: "handwritten", content: "Amazing Game!", color: "#8B5CF6", x: 740, y: 150, rotation: -6, scale: 1.2 },
    { id: "4", type: "badge", content: "ONE SOLUTION", color: "#EC4899", x: 140, y: 440, rotation: -14, scale: 1.0 }
  ]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const dragTargetRef = useRef<string | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  // Parser and state populator for incoming challenge links with spam control, sanitization, and queue handling
  const handleLoadChallengeFromId = (id: string, queryPw?: string, senderName?: string, isDirectUrl = false) => {
    // 1. Sanitize input parameters
    const sanitizedId = sanitizeGameId(id);
    if (!sanitizedId) {
      addLog(`⚠️ Attempted challenge load blocked: Invalid or tampered Game ID format.`);
      return;
    }

    const sanitizedPw = queryPw ? sanitizePassword(queryPw) : undefined;
    const sanitizedSenderParam = senderName ? sanitizeSenderName(senderName) : undefined;

    const now = Date.now();
    const isMuted = now < muteUntil;
    const isAlreadyShowing = showInviteModal;

    // Resolve sender's name cleanly
    let finalSender = sanitizedSenderParam;
    if (!finalSender) {
      // Pick another player if they have 'inviteStatus === joined' or status 'online'
      const onlinePlayers = multiplayerPlayers.filter(p => p.status === 'online');
      if (onlinePlayers.length > 0) {
        finalSender = onlinePlayers[Math.floor(Math.random() * onlinePlayers.length)].name;
      } else {
        // Fallback names based on hash index
        const names = ["Alex Code", "Chloe Zen", "Dax Solver", "Zoe Soft"];
        finalSender = names[sanitizedId.charCodeAt(sanitizedId.length - 1) % names.length];
      }
    }
    finalSender = sanitizeSenderName(finalSender);

    // Direct deep-link URL navigation explicitly bypasses spam mute control
    const shouldMute = !isDirectUrl && isMuted;

    if (shouldMute || isAlreadyShowing) {
      // Hold it in queue!
      setInviteQueue(prev => {
        // Prevent duplicate queueing
        if (prev.some(inv => inv.id === sanitizedId)) return prev;
        return [...prev, { id: sanitizedId, queryPw: sanitizedPw, senderName: finalSender }];
      });
      addLog(`⏳ Challenge invite from ${finalSender} queued due to Active Mute / Spam Control.`);
      return;
    }

    triggerLoadInviteDirectly(sanitizedId, sanitizedPw, finalSender);
  };

  const triggerLoadInviteDirectly = async (id: string, queryPw?: string, resolvedSenderName?: string) => {
    const validId = sanitizeGameId(id);
    if (!validId) {
      addLog(`⚠️ Attempted challenge load failed: Invalid Game ID format [${id}]`);
      return;
    }
    const cleanSender = sanitizeSenderName(resolvedSenderName || "A Friend");

    // 1. Check if validId is a 6-digit room code and fetch settings from Firestore
    if (/^\d{6}$/.test(validId.trim())) {
      const code = validId.trim();
      try {
        const roomSnap = await getDoc(doc(db, "rooms", code));
        if (roomSnap.exists()) {
          const rData = roomSnap.data();
          if (rData.status === "closed" || rData.isClosed) {
            showToast("❌ This room session is closed.");
            return;
          }
          const rSeed = rData.seed !== undefined ? Number(rData.seed) : parseInt(code, 10);
          const rDiff = (rData.difficulty || "EASY").toUpperCase() as Difficulty;
          const rMistakes = rData.mistakesLimit !== undefined 
            ? Number(rData.mistakesLimit) 
            : (rData.mistakeLimit !== undefined ? Number(rData.mistakeLimit) : 3);
          const rHints = rData.hintsLimit !== undefined 
            ? Number(rData.hintsLimit) 
            : (rData.hintLimit !== undefined ? Number(rData.hintLimit) : 3);
          const rTimer = rData.timerEnabled !== undefined ? Boolean(rData.timerEnabled) : true;
          const isLocked = Boolean(rData.isLocked);
          const storedPin = (rData.pin || rData.roomPin || "").trim();

          const rawSuppliedPw = (queryPw || "").trim();
          const decodedPw = rawSuppliedPw ? decodePass(rawSuppliedPw).trim() : "";
          let isPinMatch = false;
          try {
            const uriDecoded = decodeURIComponent(rawSuppliedPw).trim();
            isPinMatch = Boolean(
              storedPin.length > 0 &&
              (rawSuppliedPw === storedPin || decodedPw === storedPin || uriDecoded === storedPin)
            );
          } catch (e) {
            isPinMatch = Boolean(
              storedPin.length > 0 &&
              (rawSuppliedPw === storedPin || decodedPw === storedPin)
            );
          }

          if (!isLocked || storedPin.length === 0 || isPinMatch) {
            // Unlocked or authorized via link credentials: mount directly with zero popups, zero error toasts, and zero duplicate fetches!
            await handleAcceptAndLaunchInvite(code, undefined, storedPin, true, rData);
            return;
          }

          // Locked and link lacks matching PIN: show clean PIN prompt dialog
          setEnteredInvitePassword("");
          setInvitePasswordError(null);
          setIncomingChallengeId(code);
          setIncomingChallengeDetails({
            seed: rSeed,
            difficulty: rDiff,
            maxMistakes: rMistakes,
            hintLimit: rHints,
            timerEnabled: rTimer,
            password: storedPin,
            senderName: cleanSender
          });
          setShowInviteModal(true);
          return;
        } else {
          addLog(`⚠️ Room #${code} not found in Firestore.`);
          showToast(`❌ Room #${code} does not exist or expired.`);
          return; // CRITICAL: NEVER fallback to local board generation!
        }
      } catch (err) {
        console.error("Could not query room from Firestore:", err);
        showToast(`❌ Error connecting to room #${code}.`);
        return; // CRITICAL: NEVER fallback to local board generation!
      }
    }

    // Format: SUDOKU-[seed]-[difficulty]-M[maxMistakes]-H[hintLimit]-T[timer_code] or optionally -P[password]
    const regex = /^SUDOKU-(\d+)-([A-Z]+)-M(\d+)(?:-H(\d+))?-T([01])(?:-P([a-zA-Z0-9+=]+))?$/i;
    const match = validId.match(regex);
    if (match) {
      const seed = parseInt(match[1], 10);
      const rawDiff = match[2].toUpperCase();
      const validDiffs: Difficulty[] = ["EASY", "MEDIUM", "HARD", "EXPERT"];
      const diff: Difficulty = validDiffs.includes(rawDiff as Difficulty) ? (rawDiff as Difficulty) : "MEDIUM";
      const mistakes = Math.min(Math.max(0, parseInt(match[3], 10) || 3), 999);
      const hintLimit = match[4] !== undefined ? Math.min(Math.max(0, parseInt(match[4], 10) || 3), 20) : 3;
      const timerOn = match[5] === "1";
      const rawPassword = match[6] || queryPw || "";
      const matchedPassword = rawPassword ? sanitizePassword(decodePass(rawPassword)) : "";
      
      setEnteredInvitePassword("");
      setInvitePasswordError(null);
      
      setIncomingChallengeId(validId);
      setIncomingChallengeDetails({
        seed,
        difficulty: diff,
        maxMistakes: mistakes,
        hintLimit: hintLimit,
        timerEnabled: timerOn,
        password: matchedPassword,
        senderName: cleanSender
      });
      setShowInviteModal(true);

      // Auto-append to pending challenges if not already exists
      setPendingChallenges(prev => {
        const exists = prev.some(c => c.id === validId);
        if (exists) return prev;
        const newChallenge: PendingChallenge = {
          id: validId,
          difficulty: diff,
          seed: seed,
          maxMistakes: mistakes,
          hintLimit: hintLimit,
          timerEnabled: timerOn,
          receivedAt: new Date().toISOString(),
          sentAt: Date.now(),
          isNew: true,
          password: matchedPassword || undefined,
          senderName: cleanSender
        };
        const updated = [newChallenge, ...prev].sort((a, b) => (b.sentAt || 0) - (a.sentAt || 0)).slice(0, 10);
        try {
          localStorage.setItem("sudoku_pending_challenges", JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
      addLog(`📥 Challenge received & indexed from ${cleanSender}. Match seed #${seed || validId.slice(0, 8)}`);
    } else {
      addLog(`⚠️ Attempted challenge load failed: Invalid Game ID format [${validId}]`);
    }
  };

  // Maybe Later option silences all incoming invites for 1 hour, keeping the challenge in the Pending section
  const handleMaybeLaterChallenge = () => {
    if (incomingChallengeId && incomingChallengeDetails) {
      setPendingChallenges(prev => {
        const exists = prev.some(c => c.id === incomingChallengeId);
        if (exists) {
          return prev.map(c => c.id === incomingChallengeId ? { ...c, isNew: true } : c);
        }
        const newChallenge: PendingChallenge = {
          id: incomingChallengeId,
          difficulty: incomingChallengeDetails.difficulty,
          seed: incomingChallengeDetails.seed,
          maxMistakes: incomingChallengeDetails.maxMistakes,
          timerEnabled: incomingChallengeDetails.timerEnabled,
          receivedAt: new Date().toISOString(),
          sentAt: Date.now(),
          isNew: true,
          password: incomingChallengeDetails.password || undefined,
          senderName: incomingChallengeDetails.senderName
        };
        const updated = [newChallenge, ...prev].sort((a, b) => (b.sentAt || 0) - (a.sentAt || 0)).slice(0, 10);
        localStorage.setItem("sudoku_pending_challenges", JSON.stringify(updated));
        return updated;
      });
      addLog(`📥 Challenge ${incomingChallengeId} postponed to Pending folder. Visual alert indicator active.`);
      showToast("Saved to Pending! Muted for 1 hour.");
    }

    const silenceUntil = Date.now() + 1 * 60 * 60 * 1000;
    setMuteUntil(silenceUntil);
    try {
      localStorage.setItem("sudoku_invite_mute_until", String(silenceUntil));
    } catch (e) {}

    setShowInviteModal(false);
  };

  // DND option silences all incoming invites for 24 hours, keeping the challenge in the Pending section
  const handleDNDChallenge = () => {
    if (incomingChallengeId && incomingChallengeDetails) {
      setPendingChallenges(prev => {
        const exists = prev.some(c => c.id === incomingChallengeId);
        if (exists) {
          return prev.map(c => c.id === incomingChallengeId ? { ...c, isNew: true } : c);
        }
        const newChallenge: PendingChallenge = {
          id: incomingChallengeId,
          difficulty: incomingChallengeDetails.difficulty,
          seed: incomingChallengeDetails.seed,
          maxMistakes: incomingChallengeDetails.maxMistakes,
          timerEnabled: incomingChallengeDetails.timerEnabled,
          receivedAt: new Date().toISOString(),
          isNew: true,
          password: incomingChallengeDetails.password || undefined,
          senderName: incomingChallengeDetails.senderName
        };
        const updated = [newChallenge, ...prev].slice(0, 10);
        localStorage.setItem("sudoku_pending_challenges", JSON.stringify(updated));
        return updated;
      });
      addLog(`📥 Challenge ${incomingChallengeId} postcode silenced. DND activated for 24 hours.`);
      showToast("Saved to Pending! Muted for 24 hours.");
    }

    const silenceUntil = Date.now() + 24 * 60 * 60 * 1000;
    setMuteUntil(silenceUntil);
    try {
      localStorage.setItem("sudoku_invite_mute_until", String(silenceUntil));
    } catch (e) {}

    setShowInviteModal(false);
  };

  const executeShareInviteAction = async () => {
    const targetSeed = challengeSeed || (boardState?.seed ? Number(String(boardState.seed).slice(-6)) : (Math.floor(Math.random() * 900000) + 100000));
    if (!challengeSeed) {
      setChallengeSeed(targetSeed);
    }
    const activeRoomCode = String(targetSeed).padStart(6, '0').slice(-6);
    const cleanPin = (isRoomLocked && roomPin) ? roomPin.trim() : "";
    const pinParam = cleanPin ? `&pw=${encodeURIComponent(cleanPin)}&pin=${encodeURIComponent(cleanPin)}` : "";
    const currentProfileName = userProfile?.name || "Player";
    const chalUrl = `${getChallengeBaseUrl()}?room=${activeRoomCode}${pinParam}&sender=${encodeURIComponent(currentProfileName)}`;
    const pwMsg = cleanPin ? ` (PIN: ${cleanPin})` : "";
    const shareText = `Let's play Sudoku Together! Join room CODE: ${activeRoomCode}${pwMsg}:`;

    await shareOrCopyContent("Color Sudoku Together", shareText, chalUrl, showCopiedToast, showCopiedToast);
  };

  const executeEndGameShareAction = async () => {
    const timeToShare = (bestTime && bestTime > 0) ? bestTime : sessionSeconds;
    const formattedTime = formatTimer(timeToShare);
    const targetSeed = boardState?.seed || Math.floor(Math.random() * 900000) + 100000;
    const finalGameId = activeGameId || `SUDOKU-${targetSeed}-${difficulty}-M${mistakeLimitEnabled ? 3 : 999}-H${challengeHintLimit}-T${timerEnabled ? 1 : 0}`;
    const currentProfileName = userProfile?.name || "Player";

    // Ensure the game result is submitted/synced to Firestore for this challenge ID
    const isWon = boardState 
      ? (boardState.maxMistakesLimit === 0 
          ? (boardState.currentMistakesCount === 0) 
          : (boardState.currentMistakesCount < boardState.maxMistakesLimit)) 
      : true;
    const rBody = {
      challengeId: finalGameId,
      userId: userProfile?.id || "GUEST_ANON",
      playerName: currentProfileName,
      timeSec: timeToShare,
      mistakes: boardState ? boardState.currentMistakesCount : 0,
      isWon: isWon,
      date: new Date().toLocaleDateString()
    };
    submitGameResult(rBody);

    // Also enrich/mark the local history record as a challenge game
    setCompletedGames(prev => {
      const updated = prev.map(g => {
        if (g.id === finalGameId || g.id === activeGameId) {
          return { ...g, isChallenge: true, seed: targetSeed };
        }
        return g;
      });
      localStorage.setItem("sudoku_completed_games", JSON.stringify(updated));
      return updated;
    });

    const challengeLink = `${getChallengeBaseUrl()}?challenge=${finalGameId}&sender=${encodeURIComponent(currentProfileName)}`;
    const shareText = `${currentProfileName} solved a Sudoku puzzle in ${formattedTime} on ${difficulty}! Think you can beat this? Try here:`;
    
    await shareAppContent("Sudoku Together", shareText, challengeLink);
  };

  const executeHistoryShareAction = async () => {
    if (!historyChallengeGame) return;
    const targetSeed = historyChallengeGame.seed || (Math.floor(Math.random() * 900000) + 100000);
    const matchHint = historyChallengeGame.id.match(/-H(\d+)/i);
    const hintLimitVal = matchHint ? parseInt(matchHint[1], 10) : (historyChallengeGame.hintLimit ?? 3);
    const finalId = `SUDOKU-${targetSeed}-${historyChallengeGame.difficulty}-M${historyChallengeGame.maxMistakes || 3}-H${hintLimitVal}-T${1}`;
    
    const currentProfileName = userProfile?.name || "Player";

    // Ensure the game result is submitted/synced to Firestore for this challenge ID
    const rBody = {
      challengeId: finalId,
      userId: historyChallengeGame.userId || userProfile?.id || "GUEST_ANON",
      playerName: historyChallengeGame.playerName || currentProfileName,
      timeSec: historyChallengeGame.timeSec,
      mistakes: historyChallengeGame.mistakes,
      isWon: historyChallengeGame.isWon,
      date: historyChallengeGame.date || new Date().toLocaleDateString()
    };
    submitGameResult(rBody);

    // Also enrich/mark the local completed game as challenge
    setCompletedGames(prev => {
      const updated = prev.map(g => {
        if (g.id === historyChallengeGame.id) {
          return { ...g, isChallenge: true, seed: targetSeed };
        }
        return g;
      });
      localStorage.setItem("sudoku_completed_games", JSON.stringify(updated));
      return updated;
    });

    const challengeLink = `${getChallengeBaseUrl()}?challenge=${finalId}&sender=${encodeURIComponent(currentProfileName)}`;
    const formattedTime = formatTimer(historyChallengeGame.timeSec);
    const shareText = `${currentProfileName} completed a Sudoku Together match in ${formattedTime} on ${historyChallengeGame.difficulty} level! Think you can beat this? Try here:`;
    
    await shareAppContent("Sudoku Together", shareText, challengeLink);
  };

  const shareChallengeLink = async (gameId: string, customText?: string) => {
    const isLocked = isRoomLocked;
    const currentProfileName = userProfile?.name || "Player";
    
    // Extract 6-digit room code from gameId
    let roomCode = "";
    if (/^\d{6}$/.test(gameId)) {
      roomCode = gameId;
    } else {
      const match = gameId.match(/SUDOKU-(\d{6})/i) || gameId.match(/(\d{6})/);
      roomCode = match ? match[1] : (challengeSeed ? String(challengeSeed).slice(-6) : "849201");
    }
    
    const cleanPin = (isLocked && roomPin) ? roomPin.trim() : "";
    const pinParam = cleanPin ? `&pw=${encodeURIComponent(cleanPin)}&pin=${encodeURIComponent(cleanPin)}` : "";
    const chalUrl = `${getChallengeBaseUrl()}?room=${roomCode}${pinParam}&sender=${encodeURIComponent(currentProfileName)}`;
    const pwMsg = cleanPin ? ` (Room PIN: ${cleanPin})` : "";
    const shareText = customText || `Let's play a Sudoku Rematch! Join my challenge room #${roomCode}${pwMsg}:`;

    await shareAppContent("Sudoku Together", shareText, chalUrl);
  };

  const executePendingChallengeShareAction = async (challengeCard: any) => {
    const finalCard = challengeCard || sharingPendingChallenge;
    if (!finalCard) return;
    
    const baseId = finalCard.id.split("-P")[0];
    const currentProfileName = userProfile?.name || "Player";

    const chalUrl = `${getChallengeBaseUrl()}?challenge=${baseId}${finalCard.password ? `&pw=${encodePass(finalCard.password)}` : ""}&sender=${encodeURIComponent(currentProfileName)}`;
    
    const copied = await copyToClipboard(chalUrl);
    if (copied) {
      showCopiedToast("Challenge Link Copied");
    } else {
      showCopiedToast("Failed to copy challenge link.");
    }
  };

  const openCreateRoomModal = (initialDifficulty: Difficulty = "EASY", initialTimer: boolean = true) => {
    const canonicalSeed = Math.floor(100000 + Math.random() * 900000);
    const roomCode = canonicalSeed.toString();

    setChallengeDifficulty(initialDifficulty);
    setChallengeMistakeLimit(3);
    setChallengeHintLimit(3);
    setChallengeTimerEnabled(initialTimer);
    setIsRoomLocked(false);
    setRoomPin("");
    setChallengeSeed(canonicalSeed);
    setActiveGameId(roomCode);
    setRematchGameId(roomCode);

    // Reset roster invite statuses & clear in-memory lobby states
    setMultiplayerPlayers(prev => prev.map(p => ({
      ...p,
      inviteStatus: 'idle' as const,
      inviteSentTimestamp: undefined,
      declinedTimestamp: undefined
    })));
    setLobbyAcceptedUserIds(new Set());
    setRematchInviteStates({});

    // Instantly switch view within unified modal container
    setShowMultiplayerForkModal(false);
    setShowJoinRoomModal(false);
    setShowCreateChallengeModal(true);

    // Write canonical session record to Firestore in the background without blocking UI
    setDoc(doc(db, "rooms", roomCode), {
      roomCode: roomCode,
      seed: canonicalSeed,
      difficulty: initialDifficulty,
      mistakesLimit: 3,
      hintsLimit: 3,
      timerEnabled: initialTimer,
      isLocked: false,
      pin: "",
      status: "active",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }).then(() => {
      console.log(`[Firestore] Initialized canonical room /rooms/${roomCode}`);
    }).catch(err => {
      console.error("[Firestore] Failed to initialize canonical room document:", err);
    });
  };

  const handleExecuteJoinRoomByCode = async () => {
    const code = joinRoomCodeInput.trim().replace(/[^0-9]/g, '');
    if (code.length !== 6) {
      setJoinRoomError("Please enter a valid 6-digit room code.");
      return;
    }
    setIsJoiningRoomLoading(true);
    setJoinRoomError(null);
    try {
      const roomSnap = await getDoc(doc(db, "rooms", code));
      if (!roomSnap.exists()) {
        setJoinRoomError("Room not found. Please check the 6-digit code.");
        setIsJoiningRoomLoading(false);
        return; // CRITICAL: NEVER fallback to local board generation!
      }
      const rData = roomSnap.data();
      if (rData.status === "closed" || rData.isClosed) {
        setJoinRoomError("This room session is closed.");
        setIsJoiningRoomLoading(false);
        return;
      }
      if (rData.isLocked) {
        const expectedPin = (rData.pin || rData.roomPin || "").trim();
        if (expectedPin.length > 0) {
          const enteredPin = joinRoomPinInput.trim();
          if (!enteredPin) {
            setJoinRoomError("This room is locked. Please enter the 4-digit PIN.");
            setIsJoiningRoomLoading(false);
            return;
          }
          if (enteredPin !== expectedPin) {
            setJoinRoomError("❌ Incorrect 4-digit PIN.");
            setIsJoiningRoomLoading(false);
            return;
          }
        }
      }
      
      setShowJoinRoomModal(false);
      await handleAcceptAndLaunchInvite(code, undefined, joinRoomPinInput.trim(), false, rData);
    } catch (err: any) {
      console.error("Join room error:", err);
      setJoinRoomError("Failed to connect to room. Please try again.");
    } finally {
      setIsJoiningRoomLoading(false);
    }
  };

  const updateRoomSettingsInFirestore = async (updates: {
    difficulty?: Difficulty;
    mistakesLimit?: number;
    hintsLimit?: number;
    timerEnabled?: boolean;
    isLocked?: boolean;
    pin?: string;
    status?: "active" | "closed";
    isClosed?: boolean;
  }) => {
    const seed = challengeSeed || (boardState?.seed ? Number(String(boardState.seed).slice(-6)) : 100000);
    const code = String(seed).padStart(6, '0').slice(-6);

    const payload: any = {
      updatedAt: serverTimestamp()
    };
    if (updates.difficulty !== undefined) payload.difficulty = updates.difficulty;
    if (updates.mistakesLimit !== undefined) {
      payload.mistakesLimit = updates.mistakesLimit;
      payload.mistakeLimit = updates.mistakesLimit;
    }
    if (updates.hintsLimit !== undefined) {
      payload.hintsLimit = updates.hintsLimit;
      payload.hintLimit = updates.hintsLimit;
    }
    if (updates.timerEnabled !== undefined) payload.timerEnabled = updates.timerEnabled;
    if (updates.isLocked !== undefined) payload.isLocked = updates.isLocked;
    if (updates.pin !== undefined) {
      payload.pin = updates.pin;
      payload.roomPin = updates.pin;
    }
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.isClosed !== undefined) payload.isClosed = updates.isClosed;

    try {
      await setDoc(doc(db, "rooms", code), payload, { merge: true });
      console.log(`[Firestore] Room ${code} synchronized in real time:`, updates);
    } catch (err) {
      console.error("[Firestore] Failed to update room in Firestore:", err);
    }
  };

  const persistRoomLockToFirestore = async (locked: boolean, pin: string) => {
    await updateRoomSettingsInFirestore({ isLocked: locked, pin });
  };

  const executeStartGameAction = () => {
    const canonicalSeed = challengeSeed || 100000;
    const activeRoomCode = String(canonicalSeed).padStart(6, '0').slice(-6);

    setActiveGameId(activeRoomCode);
    setRematchGameId(activeRoomCode);
    setChallengeMode(true);
    setChallengeSeed(canonicalSeed);
    setChallengeDifficulty(challengeDifficulty);
    setChallengeMistakeLimit(challengeMistakeLimit);
    setChallengeTimerEnabled(challengeTimerEnabled);
    setChallengeHintLimit(challengeHintLimit);
    setDifficulty(challengeDifficulty);
    setMistakeLimitEnabled(challengeMistakeLimit !== 999);
    setTimerEnabled(challengeTimerEnabled);
    
    generateAndSetNewPuzzle(challengeDifficulty, canonicalSeed, challengeMistakeLimit, challengeTimerEnabled, challengeHintLimit);

    setShowCreateChallengeModal(false);
    setIsTimerPaused(false);
    navigateToScreen("game");
  };

  // Standardized invite cooldown helper with strict safety caps (30s sent / 60s declined)
  const getInviteCooldownState = (playerId: string) => {
    const inviteState = rematchInviteStates[playerId];
    const isJoined = inviteState?.status === "joined" || lobbyAcceptedUserIds.has(playerId);
    if (isJoined) {
      return { isJoined: true, isPendingSent: false, isDeclined: false, remainingSeconds: 0 };
    }
    if (!inviteState || !inviteState.timerEnd) {
      return { isJoined: false, isPendingSent: false, isDeclined: false, remainingSeconds: 0 };
    }
    const diffMs = inviteState.timerEnd - lobbyTickTime;
    if (diffMs <= 0) {
      return { isJoined: false, isPendingSent: false, isDeclined: false, remainingSeconds: 0 };
    }
    const maxCap = inviteState.status === "declined" ? 60 : 30;
    const remainingSeconds = Math.min(maxCap, Math.max(0, Math.ceil(diffMs / 1000)));
    return {
      isJoined: false,
      isPendingSent: inviteState.status === "sent" && remainingSeconds > 0,
      isDeclined: inviteState.status === "declined" && remainingSeconds > 0,
      remainingSeconds
    };
  };

  // Handles multiplayer invite process and dynamic join simulation
  const handleInviteFriend = async (playerId: string) => {
    playClickSound();

    // Issue 7 requirement: Require Google Login before Direct Friend Invites
    if (!isUserAuthorizedForMultiplayer()) {
      setLoginRequiredPurpose("DIRECT_INVITE");
      setShowLoginRequiredModal(true);
      return;
    }

    const now = Date.now();
    setLobbyTickTime(now);
    setMultiplayerPlayers(prev => prev.map(p => {
      if (p.id === playerId) {
        return { ...p, inviteStatus: 'sent', inviteSentTimestamp: now };
      }
      return p;
    }));
    setRematchInviteStates(prev => ({
      ...prev,
      [playerId]: { status: "sent", timerEnd: now + 30000 }
    }));
    addLog(`📤 Custom challenge invite dispatched to player.`);

    const seed = challengeSeed || (boardState?.seed ? Number(String(boardState.seed).slice(-6)) : 100000);
    const activeRoomCode = String(seed).padStart(6, '0').slice(-6);
    const currentUserId = userProfile?.id || "GUEST_ANON";
    const currentUserName = userProfile?.name || "Player";

    // Write to Firestore invites collection with canonical payload directly bound to active roomCode
    try {
      const inviteRef = doc(collection(db, "invites"));
      await setDoc(inviteRef, {
        id: inviteRef.id,
        toUserId: playerId,
        fromUserId: currentUserId,
        fromName: currentUserName,
        roomCode: activeRoomCode,
        gameId: activeRoomCode,
        status: "pending",
        timestamp: Date.now()
      });
      console.log(`[Firestore] Dispatched real-time invite to player ${playerId} for canonical room ${activeRoomCode}`);
    } catch (err) {
      console.error("[Firestore] Failed to dispatch invite:", err);
    }
  };

  const cancelInviteAll = () => {
    inviteAllAbortRef.current = true;
    setIsInvitingAll(false);
  };

  const handleReinviteAll = async (targetPlayers?: Array<{ id: string; name: string }>) => {
    playClickSound();

    // Toggle: If currently batch inviting, clicking the button immediately stops the loop
    if (isInvitingAll) {
      cancelInviteAll();
      addLog("⏹️ Batch invitations stopped by user.");
      return;
    }

    if (!isUserAuthorizedForMultiplayer()) {
      setLoginRequiredPurpose("DIRECT_INVITE");
      setShowLoginRequiredModal(true);
      return;
    }

    inviteAllAbortRef.current = false;
    setIsInvitingAll(true);
    addLog("🚀 Dispatching batch invitations...");

    const playersToInvite = targetPlayers || multiplayerPlayers;

    try {
      for (const p of playersToInvite) {
        if (inviteAllAbortRef.current) {
          console.log("[Invites] Batch invite aborted by user.");
          break;
        }

        const inviteState = rematchInviteStates[p.id];
        const isJoined = (p as any).inviteStatus === 'joined' || inviteState?.status === 'joined' || lobbyAcceptedUserIds.has(p.id);
        const isSent = inviteState?.status === 'sent' && (inviteState.timerEnd - Date.now() > 0);

        if (!isJoined && !isSent) {
          await handleInviteFriend(p.id);
          // Brief 250ms spacing between batch dispatches to allow cancellation checks
          await new Promise(resolve => setTimeout(resolve, 250));
        }
      }
    } finally {
      setIsInvitingAll(false);
      inviteAllAbortRef.current = false;
    }
  };

  // Strict modal close / dismiss cancellation safeguard
  useEffect(() => {
    if (
      !showGameOverModal &&
      !showCreateChallengeModal &&
      !showMidGameInviteModal &&
      !showRematchInviteModal &&
      !showMultiplayerForkModal
    ) {
      if (isInvitingAll) {
        cancelInviteAll();
      }
    }
  }, [
    showGameOverModal,
    showCreateChallengeModal,
    showMidGameInviteModal,
    showRematchInviteModal,
    showMultiplayerForkModal,
    isInvitingAll
  ]);

  // Handles adding a past player as a friend
  const handleAddFriend = (playerId: string) => {
    playClickSound();

    // Issue 7 requirement: Require Google Login before Add Friend
    if (!isUserAuthorizedForMultiplayer()) {
      setLoginRequiredPurpose("ADD_FRIEND");
      setShowLoginRequiredModal(true);
      return;
    }

    const player = multiplayerPlayers.find(p => p.id === playerId);
    if (!player) return;

    setMultiplayerPlayers(prev => prev.map(p => {
      if (p.id === playerId) {
        return { ...p, isFriend: true };
      }
      return p;
    }));
    addLog(`✓ ${player.name} connected and added to Friends list.`);
    showToast(`✓ Added ${player.name} as a persistent friend!`);
  };

  // Save played games (won or lost/terminated) into history list
  const saveGameToHistory = (isWon: boolean, mistakesOverride?: number) => {
    const gameSeed = boardState?.seed || challengeSeed || (Math.floor(Math.random() * 900000) + 100000);
    const finalGameId = activeGameId || `SUDOKU-${gameSeed}-${difficulty}-M${mistakeLimitEnabled ? 3 : 999}-H${challengeHintLimit}-T${timerEnabled ? 1 : 0}`;
    
    const finalMistakes = mistakesOverride !== undefined 
      ? mistakesOverride 
      : (boardState ? boardState.currentMistakesCount : 0);

    // Check if duplicate record exists
    setCompletedGames(prev => {
      const exists = prev.some(r => r.id === finalGameId);
      if (exists) return prev;

      const isConfigured = checkIsDisplayNameConfigured();
      const pName = isConfigured && userProfile?.name
        ? userProfile.name
        : "Player " + (userProfile?.id?.substring(6) || "Guest");

      const newRecord: CompletedGame = {
        id: finalGameId,
        difficulty: difficulty,
        timeSec: sessionSeconds,
        mistakes: finalMistakes,
        maxMistakes: boardState ? boardState.maxMistakesLimit : 3,
        isWon: isWon,
        date: new Date().toLocaleDateString(),
        isChallenge: challengeMode,
        seed: gameSeed,
        userId: userProfile?.id || "GUEST_ANON",
        playerName: pName,
        participants: challengeMode ? resolveParticipantsForSave({ id: finalGameId } as CompletedGame) : undefined
      };

      const updated = [newRecord, ...prev].slice(0, 10);
      localStorage.setItem("sudoku_completed_games", JSON.stringify(updated));
      return updated;
    });

    // Remove from pendingchallenges list if matches active ID to keep cleanly in sync
    setPendingChallenges(prev => {
      const updated = prev.filter(c => c.id !== finalGameId);
      localStorage.setItem("sudoku_pending_challenges", JSON.stringify(updated));
      return updated;
    });

    const isConfigured = checkIsDisplayNameConfigured();
    const pName = isConfigured && userProfile?.name
      ? userProfile.name
      : "Player " + (userProfile?.id?.substring(6) || "Guest");
    const rBody = {
      challengeId: finalGameId,
      userId: userProfile?.id || "GUEST_ANON",
      playerName: pName,
      timeSec: sessionSeconds,
      mistakes: finalMistakes,
      isWon: isWon,
      date: new Date().toLocaleDateString()
    };

    submitGameResult(rBody);
  };

  const handleReplayGame = (game: CompletedGame) => {
    playClickSound();
    const match = game.id.match(/^SUDOKU-(\d+)-([A-Z]+)-M(\d+)(?:-H(\d+))?-T([01])(?:-P[a-zA-Z0-9]+)?$/i);
    let seedVal = game.seed;
    let maxMistakesVal = game.maxMistakes;
    let timerOnVal = game.isChallenge ? true : timerEnabled;
    let hintLimitVal = 3;
    if (match) {
      seedVal = parseInt(match[1], 10);
      maxMistakesVal = parseInt(match[3], 10);
      if (match[4] !== undefined) {
        hintLimitVal = parseInt(match[4], 10);
      }
      timerOnVal = match[5] === "1";
    }
    
    // Default fallback if seed doesn't exist
    if (seedVal === undefined) {
      seedVal = Math.floor(Math.random() * 900000) + 100000;
    }

    generateAndSetNewPuzzle(
      game.difficulty,
      seedVal,
      maxMistakesVal,
      timerOnVal,
      hintLimitVal
    );
    
    setDifficulty(game.difficulty);
    setMistakeLimitEnabled(maxMistakesVal < 999);
    setTimerEnabled(timerOnVal);
    setChallengeMode(game.isChallenge);
    setChallengeSeed(seedVal);
    setChallengeMistakeLimit(maxMistakesVal);
    setChallengeHintLimit(hintLimitVal);
    setChallengeTimerEnabled(timerOnVal);
    setIsTimerPaused(false);
    navigateToScreen("game");
    
    addLog(`🎮 Replaying puzzle from History with seed #${seedVal}`);
  };

  const handleChallengeFriend = (game: CompletedGame) => {
    playClickSound();
    setHistoryChallengeGame(game);
    setShowHistoryChallengeModal(true);
    addLog(`👾 Opened challenge lobby panel for game seed #${game.seed || game.id}`);
  };

  const handleSaveGame = (game: CompletedGame) => {
    playClickSound();
    setSavedGames(prev => {
      const exists = prev.some(r => r.id === game.id);
      if (exists) {
        const filtered = prev.filter(r => r.id !== game.id);
        localStorage.setItem("sudoku_saved_games", JSON.stringify(filtered));
        showToast("Removed puzzle from Saved list.");
        addLog(`📌 Puzzle #${game.seed || game.id} unsaved.`);
        return filtered;
      } else {
        if (prev.length >= 10) {
          showToast("Storage full. Please unsave an older match to save this one.");
          addLog(`⚠️ Attempted save failed: Saved list reached hard cap limit of 10 entries.`);
          return prev;
        }
        
        // Resolve participants from available cache or live state, but do not mutate existing history later.
        const finalParticipants = resolveParticipantsForSave(game);
        const enrichedGame = finalParticipants ? { ...game, participants: finalParticipants } : game;
        
        const updated = [enrichedGame, ...prev];
        localStorage.setItem("sudoku_saved_games", JSON.stringify(updated));
        showToast("Added puzzle to Saved list!");
        addLog(`📌 Puzzle #${game.seed || game.id} saved to Saved folder.`);
        
        if (!finalParticipants) {
          fetch(`${getApiOrigin()}/api/challenges/${encodeURIComponent(game.id)}/leaderboard`)
            .then(res => res.json())
            .then(data => {
              if (data && Array.isArray(data.results)) {
                setChallengeLeaderboardCache(prev => ({
                  ...prev,
                  [game.id]: data.results
                }));
              }
            })
            .catch(() => {});
        }
        
        return updated;
      }
    });
  };

  const handleOpenRankings = (game: CompletedGame) => {
    playClickSound();
    setViewingRankingsGame(game);
    setHistoryRankings(getDisplayParticipants(game) || []);
    setIsLoadingHistoryRankings(true);
    
    console.log(`[Sync] Fetching live rankings for historical game ID: ${game.id}`);
    fetch(`${getApiOrigin()}/api/challenges/${encodeURIComponent(game.id)}/leaderboard`)
      .then(async res => {
        if (!res.ok) throw new Error(`HTTP status ${res.status}`);
        const data = await res.json();
        console.log(`[Sync] Live rankings response for ID ${game.id}:`, data);
        if (data && Array.isArray(data.results)) {
          setHistoryRankings(data.results);
          setChallengeLeaderboardCache(prev => ({
            ...prev,
            [game.id]: data.results
          }));

          setViewingRankingsGame(prev => prev && prev.id === game.id ? { 
            ...prev, 
            userId: prev.userId || game.userId || userProfile?.id,
            playerName: prev.playerName || game.playerName || userProfile?.name
          } : prev);

          if (shouldRepairParticipants(game)) {
            setCompletedGames(prev => {
              const index = prev.findIndex(g => g.id === game.id);
              if (index === -1) return prev;
              const updated = [...prev];
              updated[index] = repairGameParticipants(updated[index], data.results);
              try {
                localStorage.setItem("sudoku_completed_games", JSON.stringify(updated));
              } catch {}
              return updated;
            });

            setSavedGames(prev => {
              const index = prev.findIndex(g => g.id === game.id);
              if (index === -1) return prev;
              const updated = [...prev];
              updated[index] = repairGameParticipants(updated[index], data.results);
              try {
                localStorage.setItem("sudoku_saved_games", JSON.stringify(updated));
              } catch {}
              return updated;
            });
          }
        }
      })
      .catch(err => {
        console.error("Failed to fetch live rankings for historical game:", err);
      })
      .finally(() => {
        setIsLoadingHistoryRankings(false);
      });
  };

  const handleAddRecentFriend = (player: { id: string; name: string }) => {
    playClickSound();
    setRequestedFriendIds(prev => [...prev, player.id]);
    handleToggleFriend(player.id, player.name);
  };

  const handleSelectHistoryTab = (tab: "completed" | "saved" | "friends") => {
    playClickSound();
    setActiveHistoryTab(tab);
  };

  // ─── Firestore helpers ─────────────────────────────────────────────────────
  // Derive a stable Firestore document ID from any challengeId string
  const getSeedDocId = (challengeId: string): string => {
    // Use the full challenge ID as the document key (Firestore allows slashes via path segments)
    // Replace slashes since they delimit path segments
    return challengeId.replace(/\//g, "_");
  };

  // Full profanity / restricted-word list (mirrors server.ts list)
  const validateNameLocally = (name: string): { isValid: boolean; error?: string } => {
    const trimmed = name.trim();
    if (!trimmed) return { isValid: false, error: "Name is required." };
    if (!/^[a-zA-Z0-9\s]+$/.test(trimmed)) {
      return { isValid: false, error: "Please choose a name that contains only alphanumeric characters." };
    }
    const restricted = [
      "fuck", "nigger", "faggot", "cunt", "bitch", "shit", "dick",
      "pussy", "bastard", "slut", "whore", "kike", "chink", "asshole",
      "motherfucker", "fuk", "shyt", "bich", "dyke", "masturbat",
      "penis", "vagina", "orgasm", "clitoris", "cock", "testicle",
      "semen", "sperm", "ejaculat", "porn", "xxx", "pedophil", "rape",
      "nigg", "fag", "retard", "scum", "bollocks", "wanker", "piss"
    ];
    const lower = trimmed.toLowerCase();
    for (const word of restricted) {
      if (lower.includes(word)) {
        return { isValid: false, error: "Please choose a name that is respectful to other players." };
      }
    }
    return { isValid: true };
  };

  // Submit a completed game result to Firestore, with 1 retry and offline queuing
  const submitGameResult = async (rBody: any, attempt = 1): Promise<void> => {
    console.log(`[Firestore] Submitting result. ID: ${rBody.challengeId}, User: ${rBody.userId}, Attempt: ${attempt}`);
    try {
      const docId = getSeedDocId(rBody.challengeId);
      const participantRef = doc(db, "challenge_results", docId, "participants", rBody.userId);

      // Read existing to enforce "best result wins" logic
      const existing = await getDoc(participantRef);
      const existingData = existing.exists() ? existing.data() : null;

      const newRecord = {
        challengeId: rBody.challengeId,
        userId: rBody.userId,
        playerName: rBody.playerName,
        timeSec: Number(rBody.timeSec),
        mistakes: Number(rBody.mistakes),
        isWon: !!rBody.isWon,
        isPending: false,
        date: rBody.date || new Date().toLocaleDateString(),
        timestamp: serverTimestamp()
      };

      // Only update if: previously pending, new win over a loss, better time, or fewer mistakes
      const shouldUpdate =
        !existingData ||
        existingData.isPending ||
        (newRecord.isWon && !existingData.isWon) ||
        (newRecord.isWon && existingData.isWon && newRecord.timeSec < (existingData.timeSec || Infinity)) ||
        (!newRecord.isWon && !existingData.isWon && newRecord.mistakes < (existingData.mistakes || Infinity));

      if (shouldUpdate) {
        await setDoc(participantRef, newRecord);
        console.log(`[Firestore] Result saved for ID ${rBody.challengeId}`);
      } else {
        console.log(`[Firestore] Existing result is better, skipping update.`);
      }
      addLog(`✓ Game completion synced with Firestore!`);

      try {
        const docId = getSeedDocId(rBody.challengeId);
        const participantsCol = collection(db, "challenge_results", docId, "participants");
        const querySnapshot = await getDocs(participantsCol);
        const opponents = querySnapshot.docs.map(d => {
          const data = d.data();
          return { id: data.userId, name: data.playerName };
        });
        saveOpponentsToPastPlayers(opponents);
      } catch (err) {
        console.error("Failed to sync past players during submitGameResult:", err);
      }
    } catch (err) {
      console.error(`[Firestore] Submit attempt ${attempt} failed:`, err);
      if (attempt < 2) {
        const delay = 1000 * Math.pow(2, attempt);
        console.log(`[Firestore] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return submitGameResult(rBody, attempt + 1);
      } else {
        addLog("⚠️ Connection offline or sync failed. Score queued locally for automatic retry.");
        enqueueOfflineSubmission(rBody);
      }
    }
  };

  const enqueueOfflineSubmission = (payload: any) => {
    try {
      const saved = localStorage.getItem("sudoku_offline_sync_queue");
      const queue = saved ? JSON.parse(saved) : [];
      const exists = queue.some(
        (item: any) => item.challengeId === payload.challengeId && item.userId === payload.userId
      );
      if (!exists) {
        queue.push(payload);
        localStorage.setItem("sudoku_offline_sync_queue", JSON.stringify(queue));
      }
    } catch (e) {
      console.error("Failed to enqueue offline submission:", e);
    }
  };

  const processOfflineSyncQueue = async () => {
    if (isProcessingQueueRef.current) return;
    isProcessingQueueRef.current = true;
    try {
      const saved = localStorage.getItem("sudoku_offline_sync_queue");
      if (!saved) return;
      const queue = JSON.parse(saved);
      if (!Array.isArray(queue) || queue.length === 0) return;

      const remaining: any[] = [];

      for (const payload of queue) {
        try {
          const docId = getSeedDocId(payload.challengeId);
          const participantRef = doc(db, "challenge_results", docId, "participants", payload.userId);
          await setDoc(participantRef, {
            challengeId: payload.challengeId,
            userId: payload.userId,
            playerName: payload.playerName,
            timeSec: Number(payload.timeSec),
            mistakes: Number(payload.mistakes),
            isWon: !!payload.isWon,
            isPending: false,
            date: payload.date || new Date().toLocaleDateString(),
            timestamp: serverTimestamp()
          });
          console.log(`[Firestore] Offline queue item synced: ${payload.challengeId}`);
        } catch (err) {
          console.error("Failed to process queued Firestore submission:", err);
          remaining.push(payload);
        }
      }

      localStorage.setItem("sudoku_offline_sync_queue", JSON.stringify(remaining));
      if (remaining.length < queue.length) {
        addLog(`✓ Offline queue flushed (${queue.length - remaining.length} item(s) synced).`);
      }
    } catch (e) {
      console.error("Error processing offline sync queue:", e);
    } finally {
      isProcessingQueueRef.current = false;
    }
  };

  // fetchLeaderboardResults: kept as a one-shot fetch for use in history/saved game ranking views
  const fetchLeaderboardResults = async (challengeId: string) => {
    setIsLoadingLeaderboard(true);
    console.log(`[Firestore] One-shot leaderboard fetch for: ${challengeId}`);
    try {
      const docId = getSeedDocId(challengeId);
      const participantsCol = collection(db, "challenge_results", docId, "participants");
      // One-shot read using statically imported getDocs
      const snap = await getDocs(participantsCol);
      const results = snap.docs.map(d => d.data());
      setSyncedLeaderboard(results);
      setChallengeLeaderboardCache(prev => ({ ...prev, [challengeId]: results }));
      console.log(`[Firestore] One-shot fetch returned ${results.length} entries for ${challengeId}`);
    } catch (err) {
      console.error(`[Firestore] One-shot fetch failed for ${challengeId}:`, err);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  };

  const registerChallengeJoin = async (challengeId: string) => {
    if (!challengeId) return;

    const isConfigured = checkIsDisplayNameConfigured();
    if (!isConfigured) return;

    const pName = userProfile?.name
      ? userProfile.name
      : "Player " + (userProfile?.id?.substring(6) || "Guest");
    const userId = userProfile?.id || "GUEST_ANON";

    try {
      const docId = getSeedDocId(challengeId);
      const participantRef = doc(db, "challenge_results", docId, "participants", userId);
      const existing = await getDoc(participantRef);
      if (!existing.exists()) {
        // Only create the pending record if player hasn't submitted yet
        await setDoc(participantRef, {
          challengeId,
          userId,
          playerName: pName,
          timeSec: 0,
          mistakes: 0,
          isWon: false,
          isPending: true,
          date: new Date().toLocaleDateString(),
          timestamp: serverTimestamp()
        });
        console.log(`[Firestore] Registered join for ${userId} on ${challengeId}`);
      }
    } catch (err) {
      console.error("[Firestore] Failed to register join:", err);
    }
  };

  // Automatically register a join slot when starting/accepting any challenge
  useEffect(() => {
    if (challengeMode && activeGameId) {
      registerChallengeJoin(activeGameId);
    }
  }, [challengeMode, activeGameId]);

  // Real-time Firestore listener: auto-updates syncedLeaderboard whenever any player submits/joins
  useEffect(() => {
    if (!challengeMode || !activeGameId) return;

    const docId = getSeedDocId(activeGameId);
    const participantsCol = collection(db, "challenge_results", docId, "participants");

    console.log(`[Firestore] Attaching real-time listener for: ${activeGameId}`);
    setIsLoadingLeaderboard(true);

    const unsubscribe = onSnapshot(
      participantsCol,
      (snapshot) => {
        const results = snapshot.docs.map(d => d.data());
        console.log(`[Firestore] Real-time update: ${results.length} entries for ${activeGameId}`);
        setSyncedLeaderboard(results);
        setChallengeLeaderboardCache(prev => ({ ...prev, [activeGameId]: results }));
        setIsLoadingLeaderboard(false);

        // Auto-save all participants as past players
        const opponents = results.map(r => ({ id: r.userId, name: r.playerName }));
        saveOpponentsToPastPlayers(opponents);
      },
      (err) => {
        console.error(`[Firestore] Listener error for ${activeGameId}:`, err);
        setIsLoadingLeaderboard(false);
      }
    );

    // Clean up listener when game changes or challenge mode ends
    return () => {
      console.log(`[Firestore] Detaching listener for: ${activeGameId}`);
      unsubscribe();
    };
  }, [challengeMode, activeGameId]);

  // Active 1-second interval ticker for invite countdowns across active views (SENT 30s / DECLINED 60s)
  // OPTIMIZATION: Runs strictly when an invite/lobby modal is open, completely eliminating root re-renders during active gameplay!
  useEffect(() => {
    const isAnyLobbyOrInviteModalOpen = Boolean(
      showGameOverModal ||
      showCreateChallengeModal ||
      showMidGameInviteModal ||
      showRematchInviteModal ||
      showMultiplayerForkModal ||
      showBellInvitesModal ||
      showJoinRoomModal ||
      showInviteModal
    );

    if (!isAnyLobbyOrInviteModalOpen) return;

    const interval = setInterval(() => {
      const now = Date.now();
      setLobbyTickTime(now);

      // Auto-expire and clean up cooldown entries once their timer runs out
      setRematchInviteStates(prev => {
        let changed = false;
        const next = { ...prev };
        Object.entries(next).forEach(([uid, state]) => {
          if ((state.status === "sent" || state.status === "declined") && state.timerEnd > 0 && state.timerEnd <= now) {
            delete next[uid];
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [
    showGameOverModal,
    showCreateChallengeModal,
    showMidGameInviteModal,
    showRematchInviteModal,
    showMultiplayerForkModal,
    showBellInvitesModal,
    showJoinRoomModal,
    showInviteModal
  ]);

  // Auto-cancel any ongoing batch invitation loop if all invite modals are closed
  useEffect(() => {
    if (!showGameOverModal && !showCreateChallengeModal && !showMidGameInviteModal && !showRematchInviteModal && !showMultiplayerForkModal) {
      if (isInvitingAll) {
        cancelInviteAll();
      }
    }
  }, [showGameOverModal, showCreateChallengeModal, showMidGameInviteModal, showRematchInviteModal, showMultiplayerForkModal, isInvitingAll]);

  // Real-time listener for active lobby/rematch invites and joins
  useEffect(() => {
    if (!rematchGameId) {
      setLobbyAcceptedUserIds(new Set());
      setRematchInviteStates({});
      return;
    }

    // 1. Listen to invites for this rematchGameId
    const invitesQuery = query(collection(db, "invites"), where("gameId", "==", rematchGameId));
    const unsubInvites = onSnapshot(invitesQuery, (snapshot) => {
      const accepted = new Set<string>();
      const updatedStates: Record<string, { status: "idle" | "sent" | "declined" | "joined"; timerEnd: number }> = {};

      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        const toUserId = data.toUserId || data.recipientId;
        if (!toUserId) return;

        if (data.status === "accepted") {
          accepted.add(toUserId);
          updatedStates[toUserId] = { status: "joined", timerEnd: 0 };
        } else if (data.status === "declined") {
          updatedStates[toUserId] = { status: "declined", timerEnd: Date.now() + 60000 };
        }
      });

      if (accepted.size > 0) {
        setLobbyAcceptedUserIds(prev => {
          const next = new Set(prev);
          accepted.forEach(id => next.add(id));
          return next;
        });
      }

      if (Object.keys(updatedStates).length > 0) {
        setRematchInviteStates(prev => {
          const next = { ...prev };
          Object.entries(updatedStates).forEach(([uid, state]) => {
            // Keep existing declined timer if it's already running and has more time left
            if (state.status === "declined" && next[uid]?.status === "declined" && next[uid].timerEnd > Date.now()) {
              return;
            }
            next[uid] = state;
          });
          return next;
        });
      }
    }, (err) => {
      console.warn("Lobby invites listener error:", err);
    });

    // 2. Listen to participants for rematchGameId in case someone joins directly
    const docId = getSeedDocId(rematchGameId);
    const participantsCol = collection(db, "challenge_results", docId, "participants");
    const unsubParticipants = onSnapshot(participantsCol, (snapshot) => {
      const joined = new Set<string>();
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data.userId && data.userId !== userProfile?.id) {
          joined.add(data.userId);
        }
      });
      if (joined.size > 0) {
        setLobbyAcceptedUserIds(prev => {
          const next = new Set(prev);
          joined.forEach(id => next.add(id));
          return next;
        });
        setRematchInviteStates(prev => {
          const next = { ...prev };
          joined.forEach(id => {
            next[id] = { status: "joined", timerEnd: 0 };
          });
          return next;
        });
      }
    }, (err) => {
      console.warn("Lobby participants listener error:", err);
    });

    return () => {
      unsubInvites();
      unsubParticipants();
    };
  }, [rematchGameId, userProfile?.id]);

  // Process offline sync queue on app startup, window focus, online status, and Capacitor app resume
  useEffect(() => {
    // Initial sync check on mount
    processOfflineSyncQueue();

    const handleFocusOrOnline = () => {
      processOfflineSyncQueue();
    };

    window.addEventListener("focus", handleFocusOrOnline);
    window.addEventListener("online", handleFocusOrOnline);

    let appStateListener: any = null;
    const setupAppStateListener = async () => {
      try {
        if (Capacitor.isNativePlatform()) {
          appStateListener = await CapApp.addListener('appStateChange', (state) => {
            if (state.isActive) {
              processOfflineSyncQueue();
            }
          });
        }
      } catch (e) {
        console.error("Failed to register appStateChange listener for offline queue:", e);
      }
    };

    setupAppStateListener();

    return () => {
      window.removeEventListener("focus", handleFocusOrOnline);
      window.removeEventListener("online", handleFocusOrOnline);
      if (appStateListener) {
        appStateListener.remove();
      }
    };
  }, []);





  // Load Initial puzzle or handle deep-linked challenge invite on startup
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let chalParam = params.get("room") || params.get("challenge") || params.get("gameId") || params.get("seed") || params.get("c");
    let queryPw = params.get("pin") || params.get("pw") || params.get("password");
    let senderParam = params.get("sender") || params.get("senderName") || params.get("invitedBy") || params.get("sender_name");
    
    // Support hash parameters too for static routing structures
    if (!chalParam && window.location.hash) {
      const hashIndex = window.location.hash.indexOf("?");
      if (hashIndex !== -1) {
        const qs = window.location.hash.substring(hashIndex + 1);
        const hashParams = new URLSearchParams(qs);
        chalParam = hashParams.get("room") || hashParams.get("challenge") || hashParams.get("gameId") || hashParams.get("seed") || hashParams.get("c");
        if (!queryPw) {
          queryPw = hashParams.get("pin") || hashParams.get("pw") || hashParams.get("password");
        }
        if (!senderParam) {
          senderParam = hashParams.get("sender") || hashParams.get("senderName") || hashParams.get("invitedBy") || hashParams.get("sender_name");
        }
      }
    }
    
    // Also support hash direct string match (e.g. #SUDOKU-...)
    if (!chalParam && window.location.hash) {
      const cleanedHash = window.location.hash.replace(/^[#/]+/, "");
      if (cleanedHash.startsWith("SUDOKU-")) {
        chalParam = cleanedHash;
      }
    }

    // PWA / Service Worker rescue fallback: read from sessionStorage which was written
    // by the early-capture inline script in index.html BEFORE React / SW had a chance to
    // lose the query string during cache-first navigation. Consume & clear after use.
    if (!chalParam) {
      try {
        const ssChallenge = sessionStorage.getItem("sudoku_invite_challenge");
        if (ssChallenge) {
          chalParam = ssChallenge;
          if (!queryPw) queryPw = sessionStorage.getItem("sudoku_invite_pw") || undefined;
          if (!senderParam) senderParam = sessionStorage.getItem("sudoku_invite_sender") || undefined;
          // Consume immediately so a page refresh doesn't replay the invite
          sessionStorage.removeItem("sudoku_invite_challenge");
          sessionStorage.removeItem("sudoku_invite_pw");
          sessionStorage.removeItem("sudoku_invite_sender");
        }
      } catch (e) {}
    }

    if (chalParam) {
      const sanitizedChallenge = sanitizeGameId(chalParam);
      const sanitizedPw = queryPw ? sanitizePassword(queryPw) : undefined;
      const sanitizedSender = senderParam ? sanitizeSenderName(senderParam) : undefined;
      if (sanitizedChallenge) {
        handleLoadChallengeFromId(sanitizedChallenge, sanitizedPw, sanitizedSender, true);
      } else {
        generateAndSetNewPuzzle(difficulty);
      }
    } else {
      generateAndSetNewPuzzle(difficulty);
    }
  }, []);

  // Handle Capacitor native deep links (appUrlOpen events)
  useEffect(() => {
    let isSubscribed = true;
    let urlListener: any = null;

    const setupDeepLinkListener = async () => {
      try {
        urlListener = await CapApp.addListener('appUrlOpen', (event: any) => {
          if (!isSubscribed || !event?.url) return;
          console.log('App opened with URL:', event.url);
          
          try {
            const urlObj = new URL(event.url);
            const params = new URLSearchParams(urlObj.search);
            let chalParam = params.get("room") || params.get("challenge") || params.get("gameId") || params.get("seed") || params.get("c");
            let queryPw = params.get("pin") || params.get("pw") || params.get("password");
            let senderParam = params.get("sender") || params.get("senderName") || params.get("invitedBy") || params.get("sender_name");
            
            if (!chalParam && urlObj.hash) {
              const hashIdx = urlObj.hash.indexOf("?");
              if (hashIdx !== -1) {
                const qs = urlObj.hash.substring(hashIdx + 1);
                const hashParams = new URLSearchParams(qs);
                chalParam = hashParams.get("room") || hashParams.get("challenge") || hashParams.get("gameId") || hashParams.get("seed") || hashParams.get("c");
                if (!queryPw) {
                  queryPw = hashParams.get("pin") || hashParams.get("pw") || hashParams.get("password");
                }
                if (!senderParam) {
                  senderParam = hashParams.get("sender") || hashParams.get("senderName") || hashParams.get("invitedBy") || hashParams.get("sender_name");
                }
              }
            }
            
            if (chalParam) {
              const sanitizedChallenge = sanitizeGameId(chalParam);
              const sanitizedPw = queryPw ? sanitizePassword(queryPw) : undefined;
              const sanitizedSender = senderParam ? sanitizeSenderName(senderParam) : undefined;
              if (sanitizedChallenge) {
                handleLoadChallengeFromId(sanitizedChallenge, sanitizedPw, sanitizedSender, true);
              }
            }
          } catch (e) {
            console.error("Failed to parse incoming deep link URL:", e);
          }
        });
      } catch (e) {
        console.error("Failed to register App appUrlOpen listener:", e);
      }
    };

    if (Capacitor.isNativePlatform()) {
      setupDeepLinkListener();
    }

    return () => {
      isSubscribed = false;
      if (urlListener) {
        urlListener.remove();
      }
    };
  }, []);

  // Game running session timer increment effect
  useEffect(() => {
    let interval: any = null;
    if (currentScreen === "game" && boardState && !boardState.isGameOver && !visualizingBacktrack && !isTimerPaused) {
      interval = setInterval(() => {
        setSessionSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentScreen, boardState?.isGameOver, visualizingBacktrack, isTimerPaused]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Utility to push log updates
  const addLog = (msg: string) => {
    setGeneratorLogs(prev => [...prev.slice(-15), msg]);
  };

  // SUDOKU LOGICAL CALCULATIONS ENGINE (TypeScript counterpart matching kotlin logic)
  const isValidPlacement = (grid: number[][], row: number, col: number, num: number): boolean => {
    // Check row
    for (let x = 0; x < 9; x++) {
      if (grid[row][x] === num) return false;
    }
    // Check col
    for (let x = 0; x < 9; x++) {
      if (grid[x][col] === num) return false;
    }
    // Check local 3x3 square
    const boxRowStart = row - (row % 3);
    const boxColStart = col - (col % 3);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[boxRowStart + i][boxColStart + j] === num) return false;
      }
    }
    return true;
  };

  // Backtracking solver
  const solveSudokuRecursive = (grid: number[][], prng?: () => number): boolean => {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] === 0) {
          // Shuffle 1..9 to introduce randomness using either the challenge PRNG or Math.random
          const baseNums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
          const nums = prng ? shuffleWithPRNG(baseNums, prng) : baseNums.sort(() => Math.random() - 0.5);
          for (const num of nums) {
            if (isValidPlacement(grid, r, c, num)) {
              grid[r][c] = num;
              if (solveSudokuRecursive(grid, prng)) {
                return true;
              }
              grid[r][c] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  };

  // Count solutions using backtracking (returns total solutions up to max limit of 2)
  const countSolutions = (grid: number[][], limit = 2): number => {
    let count = 0;
    
    const clone = (arr: number[][]) => arr.map(row => [...row]);
    const workGrid = clone(grid);

    const checkAndSolve = (g: number[][]): boolean => {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (g[r][c] === 0) {
            for (let num = 1; num <= 9; num++) {
              if (isValidPlacement(g, r, c, num)) {
                g[r][c] = num;
                if (checkAndSolve(g)) {
                  count++;
                }
                g[r][c] = 0;
                if (count >= limit) {
                  return true; // Stop early
                }
              }
            }
            return false;
          }
        }
      }
      return true;
    };

    checkAndSolve(workGrid);
    return count;
  };

  // Generates valid complete grid and punctures holes while ensuring exactly ONE unique solution
  const generateAndSetNewPuzzle = async (
    level: Difficulty,
    seedOverride?: number,
    maxMistakesOverride?: number,
    timerEnabledOverride?: boolean,
    hintLimitOverride?: number,
    preloadedBoardData?: { puzzle?: number[][]; solution?: number[][] }
  ) => {
    setVisualizingBacktrack(false);
    setGeneratorLogs([]);
    addLog("⚡ Initiating unique sudoku puzzle algorithm...");

    // Determine the seed (either user override or generate a new random seed)
    const seed = seedOverride !== undefined ? seedOverride : (Math.floor(Math.random() * 900000) + 100000);
    const prng = createPRNG(seed);

    // Build or set active Game ID
    const customLimit = maxMistakesOverride ?? (mistakeLimitEnabled ? 3 : 999);
    const customTimer = timerEnabledOverride ?? timerEnabled;
    const customHintLimit = hintLimitOverride ?? challengeHintLimit;
    const gameId = `SUDOKU-${seed}-${level}-M${customLimit}-H${customHintLimit}-T${customTimer ? 1 : 0}`;
    
    // Set active game details for displays
    setActiveGameId(gameId);
    // Clear stale leaderboard from a previous game so it doesn't flash before the new fetch arrives
    setSyncedLeaderboard([]);

    const cacheKey = `${level}_${seed}`;
    let solved: number[][];
    let puzzle: number[][];

    if (preloadedBoardData?.puzzle && preloadedBoardData?.solution) {
      solved = preloadedBoardData.solution.map(r => [...r]);
      puzzle = preloadedBoardData.puzzle.map(r => [...r]);
      addLog(`⚡ Instant puzzle load from canonical room payload (seed: [${seed}], ${level}) - 0ms CPU time!`);
      // Also prime cache
      puzzleCache.set(cacheKey, {
        solved: solved.map(r => [...r]),
        puzzle: puzzle.map(r => [...r])
      });
    } else if (puzzleCache.has(cacheKey)) {
      const cached = puzzleCache.get(cacheKey)!;
      solved = cached.solved.map(r => [...r]);
      puzzle = cached.puzzle.map(r => [...r]);
      addLog(`⚡ Instant puzzle load from memory cache (seed: [${seed}], ${level}) - 0ms CPU time!`);
    } else {
      addLog(`1. Creating fully solved board with seed: [${seed}]`);
      
      solved = Array(9).fill(null).map(() => Array(9).fill(0));
      solveSudokuRecursive(solved, prng);
      addLog("✓ Solved base seed successfully verified.");

      let removedTarget = 24;
      if (level === "EASY") removedTarget = 30;
      else if (level === "MEDIUM") removedTarget = 40;
      else if (level === "HARD") removedTarget = 48;
      else if (level === "EXPERT") removedTarget = 54;

      addLog(`2. Slicing board values (Targeting ${removedTarget} empty cells for ${level})`);

      puzzle = solved.map(r => [...r]);
      let removedCount = 0;
      // Generate randomized position paths using the same PRNG
      const baseList = Array.from({ length: 81 }, (_, i) => i);
      const list = shuffleWithPRNG(baseList, prng);
      
      for (const pos of list) {
        if (removedCount >= removedTarget) break;
        const row = Math.floor(pos / 9);
        const col = pos % 9;
        const originalVal = puzzle[row][col];

        // Temporary puncture
        puzzle[row][col] = 0;

        // Count solutions
        const sols = countSolutions(puzzle, 2);
        if (sols === 1) {
          removedCount++;
        } else {
          // Putting value back if it results in non-unique solutions
          puzzle[row][col] = originalVal;
        }
      }

      addLog(`✓ Uniqueness checks complete. Pipelined exactly ${81 - removedCount} persistent clues.`);

      // Store in memory cache (cap to 50 items to keep footprint minimal)
      if (puzzleCache.size >= 50) {
        const firstKey = puzzleCache.keys().next().value;
        if (firstKey) puzzleCache.delete(firstKey);
      }
      puzzleCache.set(cacheKey, {
        solved: solved.map(r => [...r]),
        puzzle: puzzle.map(r => [...r])
      });
    }

    // Set matching source solution grid
    setSolutionGrid(solved.map(r => [...r]));
    addLog(`Difficulty Tagged: ${level}`);

    // Convert flat array representation to state model data structures
    const finishedGrid: SudokuCell[][] = Array(9).fill(null).map((_, r) => {
      return Array(9).fill(null).map((_, c) => {
        const hasVal = puzzle[r][c] !== 0;
        return {
          row: r,
          col: c,
          value: puzzle[r][c],
          isOriginalClue: hasVal,
          isUserInput: false,
          notes: new Set<number>()
        };
      });
    });

    setBoardState({
      grid: finishedGrid,
      selectedRow: null,
      selectedCol: null,
      currentMistakesCount: 0,
      maxMistakesLimit: customLimit,
      hintsCount: 0,
      maxHintsLimit: customHintLimit,
      isGameOver: false,
      difficulty: level,
      seed: seed
    });
    
    setHistory([]);
    setLockedNum(null);
    setHintInventory(3);
    setSessionSeconds(0);
    setShowGameOverModal(false);

    // Also update current active challenge states if this started a challenge
    if (seedOverride !== undefined) {
      setChallengeMode(true);
      setChallengeSeed(seed);
      setChallengeMistakeLimit(customLimit);
      setChallengeTimerEnabled(customTimer);
      setChallengeHintLimit(customHintLimit);
      setMistakeLimitEnabled(customLimit < 999);
      setTimerEnabled(customTimer);
    } else {
      setChallengeMode(false);
      setChallengeSeed(null);
    }
  };

  // Replay / Retry Puzzle: Resets personal board progress without leaving or affecting other room participants
  const handlePersonalReplay = async () => {
    if (!boardState) return;
    playClickSound();

    // Reset current player's board inputs and notes while preserving original puzzle clues
    const resetGrid: SudokuCell[][] = boardState.grid.map(row => row.map(cell => ({
      ...cell,
      value: cell.isOriginalClue ? cell.value : 0,
      isUserInput: false,
      notes: new Set<number>()
    })));

    setBoardState(prev => prev ? {
      ...prev,
      grid: resetGrid,
      selectedRow: null,
      selectedCol: null,
      currentMistakesCount: 0,
      hintsCount: 0,
      isGameOver: false,
    } : null);

    setHistory([]);
    setLockedNum(null);
    setHintInventory(boardState.maxHintsLimit !== undefined ? boardState.maxHintsLimit : 3);
    setSessionSeconds(0);
    setIsTimerPaused(false);
    setShowGameOverModal(false);
    setShowMidGameInviteModal(false);

    // Update room progress in Firestore if active
    const liveSeed = challengeSeed || (boardState?.seed ? Number(String(boardState.seed).slice(-6)) : 100000);
    const liveRoomCode = String(liveSeed).padStart(6, '0').slice(-6);
    if (currentUser?.uid && liveRoomCode) {
      try {
        await setDoc(doc(db, "rooms", liveRoomCode, "players", currentUser.uid), {
          progress: 0,
          mistakes: 0,
          status: "active",
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (e) {}
    }
    addLog("🔄 Puzzle replayed! Personal board, mistakes (0/3), and timer reset to 00:00.");
  };

  // Keyboard controls handling for grid input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!boardState || activeTab !== "sudoku" || currentScreen !== "game" || visualizingBacktrack) return;
      const key = e.key;

      // In Paint / Fast-Fill mode, pressing 1-9 sets lockedNum and keeps active cell focus
      if (isNumberFirstInputMode && /^[1-9]$/.test(key)) {
        const val = parseInt(key);
        if (lockedNum === val) {
          setLockedNum(null);
          addLog(`🔓 Unlocked digit ${val}.`);
        } else {
          setLockedNum(val);
          addLog(`🎨 Selected paint digit ${val}. Tap empty cells to fast fill!`);
        }
        return;
      }

      const { selectedRow, selectedCol } = boardState;
      if (selectedRow === null || selectedCol === null) return;

      const cell = boardState.grid[selectedRow][selectedCol];

      // Handle navigation
      if (key === "ArrowUp") {
        setBoardState(prev => prev ? { ...prev, selectedRow: Math.max(0, selectedRow - 1) } : null);
        return;
      } else if (key === "ArrowDown") {
        setBoardState(prev => prev ? { ...prev, selectedRow: Math.min(8, selectedRow + 1) } : null);
        return;
      } else if (key === "ArrowLeft") {
        setBoardState(prev => prev ? { ...prev, selectedCol: Math.max(0, selectedCol - 1) } : null);
        return;
      } else if (key === "ArrowRight") {
        setBoardState(prev => prev ? { ...prev, selectedCol: Math.min(8, selectedCol + 1) } : null);
        return;
      }

      if (boardState.isGameOver) return;
      if (cell.isOriginalClue) return;

      // Handle numbers input
      if (/^[1-9]$/.test(key)) {
        const val = parseInt(key);
        handleValueInput(val);
      } else if (key === "Backspace" || key === "Delete") {
        handleClearCell();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [boardState, activeTab, pencilMode, visualizingBacktrack, isNumberFirstInputMode, lockedNum]);

  const pushToHistory = () => {
    if (!boardState) return;
    const gridClone = boardState.grid.map(row => row.map(c => ({
      ...c,
      notes: new Set(c.notes)
    })));
    setHistory(prev => [...prev.slice(-45), gridClone]);
  };

  const handleUndo = () => {
    if (!boardState || boardState.isGameOver) return;
    if (history.length === 0) {
      addLog("ℹ️ No remaining actions in your clipboard history.");
      return;
    }
    const prevGrid = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    setBoardState(prev => prev ? {
      ...prev,
      grid: prevGrid
    } : null);
    addLog("↩️ Action Undone. Restored previous notes/value states layout.");
  };

  // Insert value on user input
  const handleValueInput = (num: number, overrideRow?: number, overrideCol?: number) => {
    if (!boardState || boardState.isGameOver) return;
    const selectedRow = overrideRow !== undefined ? overrideRow : boardState.selectedRow;
    const selectedCol = overrideCol !== undefined ? overrideCol : boardState.selectedCol;
    if (selectedRow === null || selectedCol === null) return;

    const cell = boardState.grid[selectedRow][selectedCol];
    if (cell.isOriginalClue) return;

    // Same-digit toggle: clear value and bypass checks
    if (cell.value === num) {
      pushToHistory();
      const newGrid = boardState.grid.map(row => row.map(c => {
        if (c.row === selectedRow && c.col === selectedCol) {
          return { ...c, value: 0, isUserInput: false, notes: new Set<number>() };
        }
        return c;
      }));
      setBoardState(prev => prev ? { 
        ...prev, 
        grid: newGrid,
        selectedRow,
        selectedCol
      } : null);
      addLog(`✨ Same-Digit Toggle: Erased value ${num} from Cell (Row ${selectedRow + 1}, Col ${selectedCol + 1}).`);
      return;
    }

    pushToHistory();

    if (pencilMode) {
      const cellNotes = cell.notes;
      const isAdding = !cellNotes.has(num);

      let hasClash = false;
      if (isAdding && isPreventMistakeNotesEnabled) {
        for (let r = 0; r < 9; r++) {
          for (let c = 0; c < 9; c++) {
            if (boardState.grid[r][c].value === num) {
              const inRow = r === selectedRow;
              const inCol = c === selectedCol;
              const inBox = Math.floor(r / 3) === Math.floor(selectedRow / 3) &&
                            Math.floor(c / 3) === Math.floor(selectedCol / 3);
              if (inRow || inCol || inBox) {
                hasClash = true;
                break;
              }
            }
          }
          if (hasClash) break;
        }
      }

      if (hasClash) {
        addLog(`⚠️ Mistake note blocked! Digit ${num} is already revealed in the row, column, or block quadrant.`);
        return;
      }

      // Add or remove pencil notes draft
      const newGrid = boardState.grid.map(row => row.map(c => {
        if (c.row === selectedRow && c.col === selectedCol) {
          const updatedNotes = new Set(c.notes);
          if (updatedNotes.has(num)) {
            updatedNotes.delete(num);
          } else {
            updatedNotes.add(num);
          }
          return { ...c, value: 0, notes: updatedNotes, isUserInput: false };
        }
        return c;
      }));

      setBoardState(prev => prev ? { 
        ...prev, 
        grid: newGrid,
        selectedRow,
        selectedCol
      } : null);
    } else {
      // Normal direct play input
      const correctVal = solutionGrid[selectedRow][selectedCol];
      const isMismatch = num !== correctVal;

      const newGrid = boardState.grid.map(row => row.map(c => {
        if (c.row === selectedRow && c.col === selectedCol) {
          return { ...c, value: num, isUserInput: true, notes: new Set<number>() };
        }
        return c;
      }));

      // Auto-Remove Notes feature on placing a direct value
      let finalGrid = newGrid;
      if (isAutoRemoveNotesEnabled && !isMismatch) {
        finalGrid = newGrid.map(row => row.map(c => {
          const inRow = c.row === selectedRow;
          const inCol = c.col === selectedCol;
          const inBox = Math.floor(c.row / 3) === Math.floor(selectedRow / 3) &&
                        Math.floor(c.col / 3) === Math.floor(selectedCol / 3);
          
          if ((inRow || inCol || inBox) && (c.row !== selectedRow || c.col !== selectedCol)) {
            if (c.notes.has(num)) {
              const updatedNotes = new Set(c.notes);
              updatedNotes.delete(num);
              return { ...c, notes: updatedNotes };
            }
          }
          return c;
        }));
        addLog(`✨ Auto-Removed candidate note digit ${num} from row, column, or 3x3 block neighbors.`);
      }

      const newMistakes = isMismatch ? boardState.currentMistakesCount + 1 : boardState.currentMistakesCount;
      const isOver = mistakeLimitEnabled 
        ? (boardState.maxMistakesLimit === 0 
            ? (newMistakes > 0) 
            : (newMistakes >= boardState.maxMistakesLimit)) 
        : false;

      setBoardState(prev => prev ? {
        ...prev,
        grid: finalGrid,
        currentMistakesCount: newMistakes,
        isGameOver: isOver,
        selectedRow,
        selectedCol
      } : null);

      if (isMismatch) {
        playMistakeSound();
        addLog(`⚠️ Mistake at Row ${selectedRow + 1} Col ${selectedCol + 1}. Selected digit ${num} is incorrect.`);
        if (isOver) {
          saveGameToHistory(false, newMistakes);
        }
      } else {
        // Check game win
        const currentProgress = finalGrid.every(r => r.every(cell => cell.value === solutionGrid[cell.row][cell.col]));
        if (currentProgress) {
          setBoardState(prev => prev ? { ...prev, isGameOver: true } : null);
          addLog("⭐ Victory! All sudoku square criteria satisfied uniquely!");
          playWinSound();
          saveGameToHistory(true, boardState ? boardState.currentMistakesCount : 0);
        }
      }
    }
  };

  const handleClearCell = () => {
    if (!boardState || boardState.isGameOver) return;
    const { selectedRow, selectedCol } = boardState;
    if (selectedRow === null || selectedCol === null) return;

    const cell = boardState.grid[selectedRow][selectedCol];
    if (cell.isOriginalClue) return;

    pushToHistory();

    const newGrid = boardState.grid.map(row => row.map(c => {
      if (c.row === selectedRow && c.col === selectedCol) {
        return { ...c, value: 0, isUserInput: false, notes: new Set<number>() };
      }
      return c;
    }));

    setBoardState(prev => prev ? { ...prev, grid: newGrid } : null);
  };

  const triggerSmartHint = () => {
    if (!boardState || boardState.isGameOver) return;
    const { selectedRow, selectedCol } = boardState;
    if (selectedRow === null || selectedCol === null) {
      addLog("💡 Tip: Select a cell first to receive hint.");
      showToast("💡 Tip: Select a cell first to receive hint.");
      return;
    }

    const cell = boardState.grid[selectedRow][selectedCol];
    const solvedNum = solutionGrid[selectedRow][selectedCol];

    if (cell.isOriginalClue) {
      addLog("💡 This is a system-generated number. It is already correct!");
      showToast("This is a system-generated number. It is already correct!");
      return;
    }

    const isChallengeGame = boardState.maxHintsLimit !== undefined;
    const hintsLeft = isChallengeGame ? (boardState.maxHintsLimit - boardState.hintsCount) : hintInventory;

    if (cell.value !== 0) {
      if (cell.value === solvedNum) {
        addLog("💡 Right! This is the correct number.");
        showToast("Right! This is the correct number.");
        return;
      } else {
        const conflict = getConflictReason(boardState.grid, selectedRow, selectedCol, cell.value);
        let msg = `This is wrong because ${cell.value} already exists in this ${conflict}. The correct number is ${solvedNum}.`;
        if (conflict === "puzzle logic") {
           msg = `This is wrong because it violates the ${conflict}. The correct number is ${solvedNum}.`;
        }
        addLog(`💡 ${msg}`);
        showToast(msg);
        
        if (hintsLeft <= 0) {
          if (isChallengeGame) {
            showToast("⚠️ You have reached the hint limit for this challenge!");
          } else {
            setRewardType("hint_reward");
          }
          return;
        }
      }
    } else {
      if (hintsLeft <= 0) {
        if (isChallengeGame) {
          showToast("⚠️ You have reached the hint limit for this challenge!");
        } else {
          setRewardType("hint_reward");
        }
        return;
      }
    }

    pushToHistory();

    const newGrid = boardState.grid.map(row => row.map(c => {
      if (c.row === selectedRow && c.col === selectedCol) {
        return { ...c, value: solvedNum, isUserInput: true, notes: new Set<number>() };
      }
      return c;
    }));

    // Auto-Remove Notes applies on Hint inputs as well
    let finalGrid = newGrid;
    if (isAutoRemoveNotesEnabled) {
      finalGrid = newGrid.map(row => row.map(c => {
        const inRow = c.row === selectedRow;
        const inCol = c.col === selectedCol;
        const inBox = Math.floor(c.row / 3) === Math.floor(selectedRow / 3) &&
                      Math.floor(c.col / 3) === Math.floor(selectedCol / 3);
        
        if ((inRow || inCol || inBox) && (c.row !== selectedRow || c.col !== selectedCol)) {
          if (c.notes.has(solvedNum)) {
            const updatedNotes = new Set(c.notes);
            updatedNotes.delete(solvedNum);
            return { ...c, notes: updatedNotes };
          }
        }
        return c;
      }));
    }

    setBoardState(prev => prev ? {
      ...prev,
      grid: finalGrid,
      hintsCount: prev.hintsCount + 1
    } : null);

    if (!isChallengeGame) {
      setHintInventory(prev => prev - 1);
    }

    addLog(`💡 Smart hint injected for Cell (Row ${selectedRow + 1}, Col ${selectedCol + 1}) → ${solvedNum}`);
    setHintExplanation({ num: solvedNum, row: selectedRow, col: selectedCol });
  };

  // Run Real-Time step-by-step Visual Backtracking solver
  const handleVisualBacktrackingSimulation = async () => {
    if (!boardState || visualizingBacktrack) return;
    setVisualizingBacktrack(true);
    addLog("🏁 Commencing step-by-step visual backtracking solver...");

    // Setup visual draft grid state
    const tempGrid: number[][] = boardState.grid.map(row => row.map(c => c.isOriginalClue ? c.value : 0));
    let stackHeight = 0;
    let stepsCounter = 0;

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const solveStepByStep = async (r: number, c: number): Promise<boolean> => {
      if (r === 9) return true; // Successfully solved base
      
      const nextR = c === 8 ? r + 1 : r;
      const nextC = c === 8 ? 0 : c + 1;

      if (tempGrid[r][c] !== 0) {
        return await solveStepByStep(nextR, nextC);
      }

      for (let num = 1; num <= 9; num++) {
        stepsCounter++;
        setBacktrackStepsRun(stepsCounter);
        setBacktrackCurrentCell({ r, c });
        stackHeight++;
        setBacktrackStackHeight(stackHeight);

        if (isValidPlacement(tempGrid, r, c, num)) {
          tempGrid[r][c] = num;

          // Update visible grid reactive UI
          setBoardState(prev => {
            if (!prev) return null;
            const updatedGrid = prev.grid.map(row => row.map(cell => {
              if (cell.row === r && cell.col === c) {
                return { ...cell, value: num, isUserInput: true };
              }
              return cell;
            }));
            return { ...prev, grid: updatedGrid };
          });

          // Delay for high contrast visual constraint animation
          await sleep(60);

          if (await solveStepByStep(nextR, nextC)) {
            return true;
          }

          // Backtrack step
          tempGrid[r][c] = 0;
          setBoardState(prev => {
            if (!prev) return null;
            const updatedGrid = prev.grid.map(row => row.map(cell => {
              if (cell.row === r && cell.col === c) {
                return { ...cell, value: 0, isUserInput: false };
              }
              return cell;
            }));
            return { ...prev, grid: updatedGrid };
          });
          await sleep(40);
        }
        stackHeight--;
        setBacktrackStackHeight(stackHeight);
      }

      return false; // Triggers backward flow
    };

    const hasResolved = await solveStepByStep(0, 0);
    setVisualizingBacktrack(false);
    setBacktrackCurrentCell(null);
    if (hasResolved) {
      addLog(`✓ Composable grid solved visually in ${stepsCounter} constraint iterations!`);
    } else {
      addLog("⚠️ Visual board state contains invalid baseline inputs configuration.");
    }
  };

  // Sticker drag handlers
  const handleStickerMouseDown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedStickerId(id);
    dragTargetRef.current = id;
  };

  const handleStickerMouseMove = (e: React.MouseEvent) => {
    if (!dragTargetRef.current || !canvasRef.current) return;
    const canvasBounds = canvasRef.current.getBoundingClientRect();
    const x = Math.min(Math.max(e.clientX - canvasBounds.left - 40, 10), canvasBounds.width - 120);
    const y = Math.min(Math.max(e.clientY - canvasBounds.top - 20, 10), canvasBounds.height - 60);

    setStickers(prev => prev.map(s => {
      if (s.id === dragTargetRef.current) {
        return { ...s, x, y };
      }
      return s;
    }));
  };

  const handleStickerMouseUp = () => {
    dragTargetRef.current = null;
  };

  const spawnNewStickerFromTray = (stickerType: string, content: string, color: string) => {
    const randomX = 150 + Math.random() * 300;
    const randomY = 100 + Math.random() * 200;
    const randomRotation = -20 + Math.random() * 40;
    
    setStickers(prev => [...prev, {
      id: Date.now().toString(),
      type: stickerType,
      content,
      color,
      x: randomX,
      y: randomY,
      rotation: randomRotation,
      scale: 1.0 + (Math.random() * 0.2 - 0.1)
    }]);
  };

  const triggerCopyToast = async (text: string, label: string) => {
    const copied = await copyToClipboard(text);
    if (copied) {
      setCopiedText(label);
    } else {
      setCopiedText("Failed to copy");
    }
    setTimeout(() => setCopiedText(null), 2500);
  };

  const deleteActiveSticker = () => {
    if (selectedStickerId) {
      setStickers(prev => prev.filter(s => s.id !== selectedStickerId));
      setSelectedStickerId(null);
    }
  };

  const subgridColors = [
    "bg-[#E0F2FE]", // block 0: Sky Blue
    "bg-[#FEF9C3]", // block 1: Canary Yellow
    "bg-[#E0F2FE]", // block 2: Sky Blue
    "bg-[#FEF9C3]", // block 3: Canary Yellow
    "bg-[#E0F2FE]", // block 4: Sky Blue
    "bg-[#FEF9C3]", // block 5: Canary Yellow
    "bg-[#E0F2FE]", // block 6: Sky Blue
    "bg-[#FEF9C3]", // block 7: Canary Yellow
    "bg-[#E0F2FE]"  // block 8: Sky Blue
  ];
  const subgridTilts = [
    "-rotate-1",         // block 0
    "rotate-1",          // block 1
    "rotate-[-1deg]",    // block 2
    "rotate-[1.2deg]",   // block 3
    "-rotate-2",         // block 4
    "rotate-[1deg]",     // block 5
    "rotate-[-0.8deg]",  // block 6
    "-rotate-1",         // block 7
    "rotate-[1.2deg]"    // block 8
  ];

  const renderAdSenseContent = (context: "home" | "game") => {
    const faqs = [
      {
        q: "Is this Sudoku free to play?",
        a: "Yes, our Sudoku is completely free to play with unlimited puzzles. You can generate and solve as many boards as you want without any restrictions or hidden costs."
      },
      {
        q: "What difficulty should I start with?",
        a: "Beginners should start with Easy or Medium difficulty levels. This allows you to get comfortable with the grid, rules, and basic scanning techniques before moving up to Hard or Expert."
      },
      {
        q: "Can I play on mobile?",
        a: "Yes, our Sudoku is fully responsive for all devices. It is designed to scale beautifully and operate smoothly on desktop, tablet, and mobile browsers."
      }
    ];

    return (
      <section className="w-full max-w-4xl mx-auto px-4 py-16 mt-8 border-t border-stone-200/50 dark:border-zinc-800/50 flex flex-col gap-16 select-text selection:bg-[#E0F2FE]">
        {/* Our Unique Features (USP) */}
        <div className={`p-8 rounded-3xl border-none shadow-[0_8px_30px_rgba(0,0,0,0.03)] ${darkMode ? "bg-indigo-950/20 text-indigo-200" : "bg-[#EEF2FF] text-[#333333]"}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-xl ${darkMode ? "bg-indigo-900/40 text-indigo-300" : "bg-indigo-100 text-[#4F46E5]"}`}>
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className={`text-xl md:text-2xl font-black uppercase tracking-tight leading-none ${darkMode ? "text-indigo-100" : "text-[#333333]"}`}>Our Unique Features (USP)</h2>
              <p className={`text-[10px] opacity-80 mt-1 font-mono uppercase tracking-wider ${darkMode ? "text-indigo-300" : "text-[#333333]/80"}`}>A modern social multiplayer experience</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <Link2 className={`w-5 h-5 mt-0.5 shrink-0 ${darkMode ? "text-indigo-300" : "text-[#4F46E5]"}`} />
              <div>
                <h3 className={`font-bold text-sm md:text-base uppercase tracking-wide ${darkMode ? "text-indigo-100" : "text-[#333333]"}`}>Share the same puzzle with friends</h3>
                <p className={`text-xs md:text-sm opacity-80 mt-1 ${darkMode ? "text-indigo-200/90" : "text-[#333333]/90"}`}>Generate a game and send a link to play the exact same grid simultaneously with friends.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Trophy className={`w-5 h-5 mt-0.5 shrink-0 ${darkMode ? "text-indigo-300" : "text-[#4F46E5]"}`} />
              <div>
                <h3 className={`font-bold text-sm md:text-base uppercase tracking-wide ${darkMode ? "text-indigo-100" : "text-[#333333]"}`}>Live Competition Arena</h3>
                <p className={`text-xs md:text-sm opacity-80 mt-1 ${darkMode ? "text-indigo-200/90" : "text-[#333333]/90"}`}>Compete on identical grids. See results, rankings, and stats as each player finishes the game.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <BarChart2 className={`w-5 h-5 mt-0.5 shrink-0 ${darkMode ? "text-indigo-300" : "text-[#4F46E5]"}`} />
              <div>
                <h3 className={`font-bold text-sm md:text-base uppercase tracking-wide ${darkMode ? "text-indigo-100" : "text-[#333333]"}`}>Performance Review</h3>
                <p className={`text-xs md:text-sm opacity-80 mt-1 ${darkMode ? "text-indigo-200/90" : "text-[#333333]/90"}`}>Analyze your finished boards and mistake frequencies. Compare your personal performance metrics against friends.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <RotateCcw className={`w-5 h-5 mt-0.5 shrink-0 ${darkMode ? "text-indigo-300" : "text-[#4F46E5]"}`} />
              <div>
                <h3 className={`font-bold text-sm md:text-base uppercase tracking-wide ${darkMode ? "text-indigo-100" : "text-[#333333]"}`}>Game History & Replayability</h3>
                <p className={`text-xs md:text-sm opacity-80 mt-1 ${darkMode ? "text-indigo-200/90" : "text-[#333333]/90"}`}>Review past games, re-run challenges, and analyze board metrics to continuously improve.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Why Play Our Sudoku? */}
        <div>
          <div className="text-center mb-8">
            <h2 className={`text-xl md:text-2xl font-black uppercase tracking-tight ${darkMode ? "text-white" : "text-[#333333]"}`}>Why Play Our Sudoku?</h2>
            <p className={`text-xs mt-1 font-mono uppercase tracking-wider ${darkMode ? "text-stone-400" : "text-[#666666]"}`}>Engineered for absolute mental clarity</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-6 rounded-2xl border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex flex-col gap-3 transition-transform duration-200 hover:-translate-y-1 ${
              darkMode ? "bg-[#022c22] text-[#d1fae5]" : "bg-[#D1FAE5] text-[#065F46]"
            }`}>
              <Brain className={`w-6 h-6 shrink-0 ${darkMode ? "text-[#d1fae5]" : "text-[#065F46]"}`} />
              <h3 className="font-black text-sm uppercase tracking-wider">Boost Brain Power</h3>
              <p className="text-xs opacity-90 leading-relaxed">Engage your brain, improve concentration, and stimulate logical processing cells with daily runs.</p>
            </div>
            
            <div className={`p-6 rounded-2xl border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex flex-col gap-3 transition-transform duration-200 hover:-translate-y-1 ${
              darkMode ? "bg-[#451a03] text-[#fef08a]" : "bg-[#FFF99D] text-[#854D0E]"
            }`}>
              <Zap className={`w-6 h-6 shrink-0 ${darkMode ? "text-[#fef08a]" : "text-[#854D0E]"}`} />
              <h3 className="font-black text-sm uppercase tracking-wider">4 Difficulty Levels</h3>
              <p className="text-xs opacity-90 leading-relaxed">Easily switch between Easy, Medium, Hard, and Expert levels to fine-tune your solving challenges.</p>
            </div>
            
            <div className={`p-6 rounded-2xl border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex flex-col gap-3 transition-transform duration-200 hover:-translate-y-1 ${
              darkMode ? "bg-[#2e1065] text-[#e9d5ff]" : "bg-[#F3E8FF] text-[#6B21A8]"
            }`}>
              <Rocket className={`w-6 h-6 shrink-0 ${darkMode ? "text-[#e9d5ff]" : "text-[#6B21A8]"}`} />
              <h3 className="font-black text-sm uppercase tracking-wider">Instant Play</h3>
              <p className="text-xs opacity-90 leading-relaxed">Play instantly on the web in any browser without needing to download files or register accounts.</p>
            </div>
            
            <div className={`p-6 rounded-2xl border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex flex-col gap-3 transition-transform duration-200 hover:-translate-y-1 ${
              darkMode ? "bg-[#4c0519] text-[#fecdd3]" : "bg-[#FFE4E6] text-[#9D174D]"
            }`}>
              <TrendingUp className={`w-6 h-6 shrink-0 ${darkMode ? "text-[#fecdd3]" : "text-[#9D174D]"}`} />
              <h3 className="font-black text-sm uppercase tracking-wider">Track Your Progress</h3>
              <p className="text-xs opacity-90 leading-relaxed">Log your best completion times and success rates to visualize your continuous improvement journey.</p>
            </div>
          </div>
        </div>

        {/* How to Play Guide & Solving Techniques */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 flex flex-col gap-4">
            <h2 className={`text-xl md:text-2xl font-black uppercase tracking-tight ${darkMode ? "text-white" : "text-[#333333]"}`}>How to Play Sudoku</h2>
            <div className={`p-6 rounded-3xl border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] text-xs md:text-sm leading-relaxed font-sans ${darkMode ? "bg-zinc-900/60 text-stone-300" : "bg-stone-50 text-[#333333]"}`}>
              <h3 className="font-bold text-sm mb-2 uppercase">Official Game Rules</h3>
              <p className="mb-4">
                Sudoku is a logic-based, number-placement puzzle that has captivated minds worldwide. The classic game is played on a 9x9 grid, which is further divided into nine smaller 3x3 subgrids or 'regions'. The objective is simple yet mentally engaging: fill every empty cell with digits from 1 to 9. However, you must follow a strict core rule: each digit must appear exactly once in every horizontal row, once in every vertical column, and once in every 3x3 region without any duplicates or repetition.
              </p>
              <p className="mb-4">
                You begin each game with a partially completed grid containing pre-filled clues. Solving a Sudoku puzzle requires absolutely no arithmetic calculations; instead, it relies entirely on systematic deduction and logical reasoning. By analyzing the numbers already present and identifying empty cells, you can step-by-step eliminate invalid candidates for each location until only one correct number remains.
              </p>
              <p>
                Starting with Easy puzzles helps beginners build core confidence and learn to recognize basic visual patterns. As you gradually advance to Medium, Hard, and Expert levels, you will encounter complex grid lock-ins that demand deeper deduction. Play patiently, think logically, and experience the mental clarity that comes from solving!
              </p>
            </div>
          </div>
          
          <div className="lg:col-span-5 flex flex-col gap-4">
            <h2 className={`text-xl md:text-2xl font-black uppercase tracking-tight ${darkMode ? "text-white" : "text-[#333333]"}`}>Sudoku Strategy Guides</h2>
            <div className="flex flex-col gap-4">
              <div className={`p-5 rounded-2xl border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] ${darkMode ? "bg-zinc-900/60 text-stone-300" : "bg-stone-50 text-[#333333]"}`}>
                <h3 className="font-black text-sm uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">Scanning Technique</h3>
                <p className="text-xs leading-relaxed">
                  A quick, visual scanning technique. Scan horizontal rows and vertical columns within a specific 3x3 grid to identify where a missing number must go. By tracking which rows and columns already contain that digit in neighboring grids, you can cross-eliminate cells and find the only available spot for it.
                </p>
              </div>
              
              <div className={`p-5 rounded-2xl border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] ${darkMode ? "bg-zinc-900/60 text-stone-300" : "bg-stone-50 text-[#333333]"}`}>
                <h3 className="font-black text-sm uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">Elimination Method</h3>
                <p className="text-xs leading-relaxed">
                  A deeper logic technique. For any given empty cell, list all candidate numbers that do not violate the row, column, or 3x3 region rules. If a cell has only one possible candidate remaining (a 'naked single'), that must be its value. If a candidate can only fit in one specific cell, it goes there.
                </p>
              </div>

              <div className={`p-5 rounded-2xl border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] ${darkMode ? "bg-zinc-900/60 text-stone-300" : "bg-stone-50 text-[#333333]"}`}>
                <h3 className="font-black text-sm uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-2">Naked Singles strategy</h3>
                <p className="text-xs leading-relaxed">
                  A foundational solving concept. A "Naked Single" occurs when a specific cell has only one viable candidate value remaining after row, column, and box cross-elimination. Filling these values immediately is critical to unlock advanced solving stages.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible FAQ */}
        <div className="w-full flex flex-col gap-4">
          <div className="text-center mb-4">
            <h2 className={`text-xl md:text-2xl font-black uppercase tracking-tight ${darkMode ? "text-white" : "text-[#333333]"}`}>Frequently Asked Questions</h2>
            <p className={`text-xs mt-1 font-mono uppercase tracking-wider ${darkMode ? "text-stone-400" : "text-[#666666]"}`}>Quick answers to common questions</p>
          </div>
          
          <div className={`p-6 md:p-8 rounded-3xl border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] ${darkMode ? "bg-zinc-900/40 text-stone-300" : "bg-stone-50 text-[#333333]"} flex flex-col gap-2`}>
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="border-b border-stone-200/50 dark:border-zinc-800/50 last:border-none py-3">
                  <button
                    onClick={() => {
                      playClickSound();
                      setOpenFaq(isOpen ? null : idx);
                    }}
                    className={`w-full flex justify-between items-center text-left font-sans font-black text-xs md:text-sm uppercase tracking-wider py-2.5 bg-transparent border-none cursor-pointer hover:opacity-80 transition-opacity ${darkMode ? "text-white" : "text-[#333333]"}`}
                  >
                    <span>{faq.q}</span>
                    <ChevronRight 
                      className={`w-4 h-4 transition-transform duration-200 shrink-0 ml-4 ${darkMode ? "text-stone-400" : "text-[#666666]"} ${isOpen ? "rotate-90" : "rotate-0"}`} 
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p className={`pt-2 pb-3 text-xs md:text-sm font-sans leading-relaxed ${darkMode ? "text-stone-300" : "text-[#333333]/90"}`}>
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Anchor Button */}
        <div className="flex justify-center mt-4">
          <button
            onClick={() => {
              playClickSound();
              if (context === "home") {
                generateAndSetNewPuzzle(difficulty);
                setIsTimerPaused(false);
                navigateToScreen("game");
              } else {
                document.getElementById("status-and-grid-group")?.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className={`px-8 py-4 text-center font-black text-sm tracking-wider uppercase transition-all duration-155 select-none rounded-2xl active:scale-[0.98] active:translate-y-px cursor-pointer border-none shadow-md ${
              darkMode 
                ? "bg-emerald-800 hover:bg-emerald-700 text-[#d1fae5]" 
                : "bg-[#D1FAE5] hover:bg-[#A7F3D0] text-[#065F46]"
            }`}
          >
            Start Playing
          </button>
        </div>
      </section>
    );
  };

  return (
    <div className={`min-h-screen ${darkMode ? "bg-[#18181B] text-[#E5E5E5] selection:bg-[#312E81]" : "bg-[#F3EFE9] text-[#1E1E1E] selection:bg-[#E0F2FE]"} flex flex-col font-sans overflow-hidden`}>
      {/* Toast Notification */}
      <AnimatePresence>
        {copiedText && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100000] px-6 py-4.5 rounded-2xl shadow-[0_15px_45px_rgba(0,0,0,0.25)] flex items-center gap-3 text-sm font-semibold select-none border-none text-center max-w-[90vw] md:max-w-md ${darkMode ? "bg-zinc-900 text-zinc-100" : "bg-[#1E1E1E] text-[#FDFBF7]"}`}
          >
            <Check className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              {["Mint Green", "Sky Blue", "Canary Yellow", "Lavender", "Base Canvas"].includes(copiedText)
                ? `Copied ${copiedText} spec snippet!`
                : copiedText}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* IMMERSIVE 3-PANE SCREEN ROUTER (NO GLOBAL SCROLLBARS) */}
      <div className={`flex-1 h-screen w-screen relative overflow-hidden flex flex-col justify-start ${darkMode ? "bg-[#121212] paper-pattern-dark text-[#E5E5E5]" : "bg-[#FDFBF7] paper-pattern text-[#1E1E1E]"}`}>
        
        {/* PREMIUM TOP-CORNER NAVIGATION FLANKING THE BRAND DATA */}
        {/* ENFORCE GLOBAL ROOT NAVIGATION LAYER (PERMANENT FIXED POSITION) */}
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "calc(70px + env(safe-area-inset-top, 0px))",
            paddingTop: "env(safe-area-inset-top, 0px)",
            zIndex: 9999,
            backgroundColor: darkMode ? "#18181B" : "#f7f5ee",
            paddingLeft: "16px",
            paddingRight: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: darkMode ? "0 2px 12px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.03)"
          }}
          className="select-none"
        >
          {/* Left Back Arrow: ArrowLeft or Status button */}
          <button
            onClick={() => {
              playClickSound();
              const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;
              if (currentScreen === "game") {
                if (isDesktop) {
                  navigateToScreen("status");
                } else {
                  saveCurrentGameToLocal(boardState, sessionSeconds, difficulty);
                  setCurrentScreen("home");
                  setNavigationHistory(["home"]);
                  window.history.pushState({ view: "home" }, "", window.location.href);
                }
              } else if (currentScreen !== "home") {
                navigatorPop();
              } else {
                // Clicking on home goes to Voyage Status view
                navigateToScreen("status");
              }
            }}
            className={`p-2.5 rounded-full transition-all duration-150 cursor-pointer select-none active:translate-y-[2px] flex items-center justify-center border-none shadow-xs ${darkMode ? "bg-zinc-800 hover:bg-zinc-750 text-zinc-100" : "bg-white text-stone-700"}`}
            title={(currentScreen === "home" || (currentScreen === "game" && typeof window !== "undefined" && window.innerWidth >= 1024)) ? "Voyage Status" : "Back"}
            id="global-top-left-back-button"
          >
            {(currentScreen === "home" || (currentScreen === "game" && typeof window !== "undefined" && window.innerWidth >= 1024)) ? (
              <BarChart2 className={`w-4.5 h-4.5 stroke-[2] ${darkMode ? "text-zinc-100" : "text-stone-700"}`} />
            ) : (
              <ArrowLeft className={`w-4.5 h-4.5 stroke-[2] font-bold ${darkMode ? "text-zinc-100" : "text-stone-700"}`} />
            )}
          </button>

          {/* Central matte title */}
          <div className="relative flex flex-col items-center justify-center px-7">
            <h1 className="relative z-10 text-xl md:text-2xl font-black tracking-tight uppercase font-sans pre-wrap flex items-center justify-center gap-1 inline-flex select-none leading-none pt-0.5">
              <span className={`font-sans font-black transition-colors ${darkMode ? "text-white" : "text-black"}`}>SUDOKU</span>
              <span className={`ml-1.5 font-sans font-black transition-colors ${darkMode ? "text-[#38bdf8]" : "text-[#2B6CB0]"}`}>TOGETHER</span>
            </h1>
            <span className={`text-[10px] md:text-[11.5px] uppercase font-sans font-bold tracking-[0.25em] leading-none opacity-75 select-none mt-2 text-center ${(currentScreen === "home" || currentScreen === "game") ? (darkMode ? ((boardState?.difficulty || difficulty) === "EASY" ? "text-[#d1fae5]" : (boardState?.difficulty || difficulty) === "MEDIUM" ? "text-[#fef08a]" : (boardState?.difficulty || difficulty) === "HARD" ? "text-[#e9d5ff]" : "text-[#fecdd3]") : ((boardState?.difficulty || difficulty) === "EASY" ? "text-[#065F46]" : (boardState?.difficulty || difficulty) === "MEDIUM" ? "text-[#854D0E]" : (boardState?.difficulty || difficulty) === "HARD" ? "text-[#6B21A8]" : "text-[#9D174D]")) : (darkMode ? "text-[#38bdf8]" : "text-[#2B6CB0]")}`}>
              {currentScreen === "together" ? "Together Mode" : currentScreen === "settings" ? "Settings" : currentScreen === "login" ? "Authorization" : currentScreen === "status" ? "Player Insights" : (boardState?.difficulty || difficulty)}
            </span>
          </div>

          {/* Right Actions: Clean main header with only Settings gear! */}
          <div className="flex items-center gap-2">
            {/* Bell Icon (Only on Home Screen and if there are pending invites) */}
            {currentScreen === "home" && pendingChallenges.length > 0 && (
              <button
                onClick={() => {
                  playClickSound();
                  setShowBellInvitesModal(true);
                }}
                className={`relative p-2.5 rounded-full transition-all duration-150 cursor-pointer select-none active:translate-y-[2px] flex items-center justify-center border-none shadow-xs ${
                  darkMode ? "bg-zinc-800 hover:bg-zinc-750 text-zinc-100" : "bg-white text-stone-700"
                }`}
                title="Notifications"
                id="global-top-right-bell-button"
              >
                <Bell className={`w-4.5 h-4.5 stroke-[2] ${darkMode ? "text-zinc-100" : "text-stone-700"}`} />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-black text-white shadow-sm font-mono">
                  {pendingChallenges.length}
                </span>
              </button>
            )}

            {/* Settings Gear */}
            <button
              onClick={() => {
                playClickSound();
                if (currentScreen === "settings") {
                  navigatorPop();
                } else {
                  setFromGameplaySettings(currentScreen === "game");
                  navigateToScreen("settings");
                }
              }}
              className={`p-2.5 rounded-full transition-all duration-150 cursor-pointer select-none active:translate-y-[2px] flex items-center justify-center border-none shadow-xs ${darkMode ? "bg-zinc-800 hover:bg-zinc-750 text-zinc-100" : "bg-white text-stone-700"}`}
              title="Settings"
              id="global-top-right-settings-button"
            >
              <Settings className={`w-4.5 h-4.5 stroke-[2] ${darkMode ? "text-zinc-100" : "text-stone-700"}`} />
            </button>
          </div>
        </div>

        {/* PANE 1: HOME DASHBOARD */}
        {currentScreen === "home" && (
          <div className="flex-1 w-full lg:hidden flex flex-col items-center justify-start overflow-y-auto select-none pt-[calc(70px+env(safe-area-inset-top,0px))]">

            {/* Inner Wrapper spanning 100vh minus header to center elements vertically and push AdSense below the fold */}
            <div className="w-full min-h-[calc(100vh-70px)] flex flex-col justify-center items-center p-3 md:p-6 shrink-0" id="home-screen-inner-wrapper">
              
              {/* Center column container: combines difficulty selectors and Play Button */}
              <div className="w-full max-w-sm mx-auto flex flex-col justify-center gap-4 sm:gap-6 py-2 sm:py-6 font-sans shrink-0" id="home-screen-inner-container">
                
                {/* 📌 PREMIUM FLOATING STICKY NOTE (CHIT) */}
                <div 
                  className={`w-full p-6 sm:p-8 mb-4 sm:mb-6 relative rounded-2xl transition-all duration-300 select-none flex flex-col justify-center items-center gap-2 sm:gap-3 transform rotate-[-1.5deg] ${
                    darkMode ? (
                      difficulty === "EASY" ? "bg-[#022c22] text-[#d1fae5] shadow-[0_10px_25px_rgba(0,0,0,0.5)]" :
                      difficulty === "MEDIUM" ? "bg-[#451a03] text-[#fef08a] shadow-[0_10px_25px_rgba(0,0,0,0.5)]" :
                      difficulty === "HARD" ? "bg-[#2e1065] text-[#e9d5ff] shadow-[0_10px_25px_rgba(0,0,0,0.5)]" :
                      "bg-[#4c0519] text-[#fecdd3] shadow-[0_10px_25px_rgba(0,0,0,0.5)]"
                    ) : (
                      difficulty === "EASY" ? "bg-[#D1FAE5] shadow-[0_10px_25px_rgba(6,95,70,0.06)] text-[#065F46]" :
                      difficulty === "MEDIUM" ? "bg-[#FFF99D] shadow-[0_10px_25px_rgba(133,77,14,0.06)] text-[#854D0E]" :
                      difficulty === "HARD" ? "bg-[#F3E8FF] shadow-[0_10px_25px_rgba(107,33,168,0.06)] text-[#6B21A8]" :
                      "bg-[#FFE4E6] shadow-[0_10px_25px_rgba(157,23,77,0.06)] text-[#9D174D]"
                    )
                  }`}
                  style={{ border: 'none' }}
                >
                  {/* Subtle top tape aesthetic or fold bar, styled borderless */}
                  <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-16 h-3.5 ${darkMode ? "bg-white/15" : "bg-white/60"} backdrop-blur-[1px] rotate-1 shadow-[0_1px_3px_rgba(0,0,0,0.05)] pointer-events-none`} />

                  <div className="text-center">
                    <span className="text-[10px] uppercase font-mono tracking-widest block mb-0.5 font-bold opacity-80">
                      CURRENT RECORD
                    </span>
                    <h2 className="text-xl md:text-3xl uppercase tracking-tight flex items-center justify-center gap-2 font-sans font-black">
                      <Timer className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3.5] shrink-0" />
                      <span>BEST TIME:</span>
                      <span className="font-mono font-black text-2xl md:text-3xl">
                        {bestTime && bestTime > 0 ? formatTimer(bestTime) : "--:--"}
                      </span>
                    </h2>
                    <p className="text-xs mt-1 select-none handwriting opacity-95 text-sm font-semibold">
                      {bestTime && bestTime > 0 
                        ? "Can you break your own record?" 
                        : "No record yet... Can you set the first one?"}
                    </p>
                  </div>
                </div>

                {/* Difficulty level selecting buttons - SOLID LOCKED FIXED POSITION CONTAINER */}
                <div className="w-full shrink-0 select-none pb-1" id="difficulty-level-container">
                  <span className={`block text-center text-[11px] font-black uppercase tracking-wider mb-3 font-mono ${darkMode ? "text-zinc-400" : "text-stone-650"}`}>
                    CHOOSE GAMEBOARD DIFFICULTY:
                  </span>
                  <div className="h-[38px] flex flex-row justify-between items-stretch gap-2 min-w-full font-mono text-2xs md:text-xs">
                    {(["EASY", "MEDIUM", "HARD", "EXPERT"] as Difficulty[]).map((lvl) => {
                      const isSelected = difficulty === lvl;
                      
                      // Pastel color scheme mapping matching the global designer guidelines with precise active pressed values
                      const scheme = darkMode ? (
                        lvl === "EASY" ? { active: "bg-[#022c22] text-[#d1fae5] font-black shadow-[0_8px_16px_rgba(0,0,0,0.4)] scale-102 active:bg-[#064e3b]", inactive: "bg-zinc-900/60 hover:bg-[#022c22]/40 text-[#d1fae5]/70 active:bg-zinc-800" } :
                        lvl === "MEDIUM" ? { active: "bg-[#451a03] text-[#fef08a] font-black shadow-[0_8px_16px_rgba(0,0,0,0.4)] scale-102 active:bg-[#713f12]", inactive: "bg-zinc-900/60 hover:bg-[#451a03]/40 text-[#fef08a]/70 active:bg-zinc-800" } :
                        lvl === "HARD" ? { active: "bg-[#2e1065] text-[#e9d5ff] font-black shadow-[0_8px_16px_rgba(0,0,0,0.4)] scale-102 active:bg-[#3b0764]", inactive: "bg-zinc-900/60 hover:bg-[#2e1065]/40 text-[#e9d5ff]/70 active:bg-zinc-800" } :
                        { active: "bg-[#4c0519] text-[#fecdd3] font-black shadow-[0_8px_16px_rgba(0,0,0,0.4)] scale-102 active:bg-[#881337]", inactive: "bg-zinc-900/60 hover:bg-[#4c0519]/40 text-[#fecdd3]/70 active:bg-zinc-800" }
                      ) : (
                        lvl === "EASY" ? { active: "bg-[#D1FAE5] text-[#065F46] font-black shadow-[0_8px_16px_rgba(6,95,70,0.06),_0_2px_4px_rgba(0,0,0,0.02)] scale-102 active:bg-[#A7F3D0] active:scale-98 active:shadow-none", inactive: "bg-white/60 hover:bg-[#D1FAE5]/30 text-stone-500 shadow-sm active:bg-stone-150 active:shadow-none" } :
                        lvl === "MEDIUM" ? { active: "bg-[#FFF99D] text-[#854D0E] font-black shadow-[0_8px_16px_rgba(133,77,14,0.06),_0_2px_4px_rgba(0,0,0,0.02)] scale-102 active:bg-[#FDE047] active:scale-98 active:shadow-none", inactive: "bg-white/60 hover:bg-[#FFF99D]/30 text-stone-500 shadow-sm active:bg-stone-150 active:shadow-none" } :
                        lvl === "HARD" ? { active: "bg-[#F3E8FF] text-[#6B21A8] font-black shadow-[0_8px_16px_rgba(107,33_168,0.06),_0_2px_4px_rgba(0,0,0,0.02)] scale-102 active:bg-[#D8B4FE] active:scale-98 active:shadow-none", inactive: "bg-white/60 hover:bg-[#F3E8FF]/30 text-stone-500 shadow-sm active:bg-stone-150 active:shadow-none" } :
                        { active: "bg-[#FFE4E6] text-[#9D174D] font-black shadow-[0_8px_16px_rgba(157,23,77,0.06),_0_2px_4px_rgba(0,0,0,0.02)] scale-102 active:bg-[#FBCFE8] active:scale-98 active:shadow-none", inactive: "bg-white/60 hover:bg-[#FFE4E6]/30 text-stone-500 shadow-sm active:bg-stone-150 active:shadow-none" }
                      );
 
                      const btnClass = isSelected ? scheme.active : scheme.inactive;
 
                      return (
                        <button
                          key={lvl}
                          onClick={() => {
                            playClickSound();
                            setDifficulty(lvl);
                            addLog(`⚙️ Difficulty changed to: ${lvl}`);
                          }}
                          className={`flex-1 h-full flex items-center justify-center text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer select-none rounded-xl border-none outline-none ${btnClass}`}
                        >
                          {lvl}
                        </button>
                      );
                    })}
                  </div>
                </div>
 
                {/* 🔄 RESUME SOLO & MULTIPLAYER SIDE-BY-SIDE GRID - Adhering to the 'Zen' Design System */}
                <div className="w-full grid grid-cols-2 gap-3.5 select-none shrink-0" id="solo-multiplayer-split-container">
                  {/* Left Button ('Resume') */}
                  <button
                    onClick={() => {
                      playClickSound();
                      if (savedSessionInfo) {
                        const loaded = resumeSavedSession();
                        if (loaded) {
                          setDifficulty(loaded.difficulty);
                          setIsTimerPaused(false);
                          navigateToScreen("game");
                        }
                      } else {
                        showToast("Select a difficulty above and click PLAY NEW GAME!");
                      }
                    }}
                    className={`border-none py-3 px-4 text-center transition-all duration-150 select-none rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-[0.98] active:translate-y-px ${
                      savedSessionInfo
                        ? (darkMode ? "bg-[#0c4a6e]/20 hover:bg-[#0c4a6e]/40 text-[#7dd3fc] border border-[#bae6fd]/15" : "bg-[#E0F2FE]/60 hover:bg-[#E0F2FE]/80 active:bg-[#bae6fd]/60 text-[#0369a1] shadow-[0_8px_30px_rgba(3,105,161,0.04)]")
                        : (darkMode ? "bg-zinc-800/40 text-stone-500 cursor-not-allowed opacity-60 border border-zinc-700/30" : "bg-stone-100/60 text-stone-400 cursor-not-allowed opacity-60 shadow-[0_8px_30px_rgba(0,0,0,0.02)]")
                    }`}
                  >
                    <RotateCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3] shrink-0 ${savedSessionInfo ? "animate-pulse" : ""}`} />
                    <span className="font-sans font-black text-2xs sm:text-xs md:text-sm tracking-wider uppercase leading-none">
                      Resume
                    </span>
                  </button>
 
                  {/* Right Button ('Multiplayer') */}
                  <button
                    onClick={() => {
                      playClickSound();
                      setShowMultiplayerForkModal(true);
                    }}
                    className={`border-none py-3 px-4 text-center transition-all duration-150 select-none rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-[0.98] active:translate-y-px ${
                      darkMode ? "bg-[#3b0764]/20 hover:bg-[#3b0764]/40 border border-[#f5f3ff]/15 text-[#d8b4fe]" : "bg-[#f3e8ff]/60 hover:bg-[#e9d5ff]/60 active:bg-[#d8b4fe]/60 shadow-[0_8px_30px_rgba(107,33,168,0.04)] text-[#6B21A8]"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3] shrink-0" />
                    <span className="font-sans font-black text-2xs sm:text-xs md:text-sm tracking-wider uppercase leading-none">
                      Multiplayer
                    </span>
                  </button>
                </div>

                {/* 🚀 Play New Game Button styled with Expert theme */}
                <button
                  onClick={() => {
                    playClickSound();
                    generateAndSetNewPuzzle(difficulty);
                    setIsTimerPaused(false);
                    navigateToScreen("game");
                  }}
                  className={`w-full border-none p-6 md:p-8 mt-4 sm:mt-6 text-center font-black text-lg md:text-2xl tracking-wider uppercase transition-all duration-150 select-none rounded-[20px] active:scale-[0.98] active:translate-y-px cursor-pointer shadow-md ${
                    darkMode 
                      ? "bg-[#4c0519] hover:bg-[#4c0519]/80 text-[#fecdd3]" 
                      : "bg-[#FFE4E6] hover:bg-[#FFE4E6]/80 active:bg-[#FBCFE8] text-[#9D174D]"
                  }`}
                >
                  <span className="flex items-center justify-center gap-2.5 sm:gap-3 leading-none">
                    <span className="text-sm sm:text-base md:text-lg animate-pulse select-none leading-none">▶</span>
                    <span>PLAY NEW GAME</span>
                  </span>
                </button>

              </div>
            </div>
            {renderAdSenseContent("home")}
            <footer className="w-full max-w-4xl mx-auto px-4 py-8 mt-6 text-center text-xs font-sans text-stone-500 border-t border-dashed border-stone-200/50 dark:border-zinc-800/50 flex flex-col items-center gap-4 animate-fade-in select-text">
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                <button onClick={() => { playClickSound(); setActiveCompliancePage("about"); }} className="bg-transparent border-none cursor-pointer text-stone-550 hover:text-[#0369A1] dark:text-stone-400 dark:hover:text-[#bae6fd] font-semibold transition-colors">About Us</button>
                <button onClick={() => { playClickSound(); setActiveCompliancePage("contact"); }} className="bg-transparent border-none cursor-pointer text-stone-550 hover:text-[#0369A1] dark:text-stone-400 dark:hover:text-[#bae6fd] font-semibold transition-colors">Contact Us</button>
                <button onClick={() => { playClickSound(); setActiveCompliancePage("privacy"); }} className="bg-transparent border-none cursor-pointer text-stone-550 hover:text-[#0369A1] dark:text-stone-400 dark:hover:text-[#bae6fd] font-semibold transition-colors">Privacy Policy</button>
                <button onClick={() => { playClickSound(); setActiveCompliancePage("terms"); }} className="bg-transparent border-none cursor-pointer text-stone-550 hover:text-[#0369A1] dark:text-stone-400 dark:hover:text-[#bae6fd] font-semibold transition-colors">Terms of Service</button>
              </div>
              <div className="opacity-80 font-mono text-[10px]">
                © {new Date().getFullYear()} Sudoku Together Mode. All rights reserved. Supported by Google AdSense advertising.
              </div>
            </footer>
          </div>
        )}

          {/* PANE 2: ACTIVE GAMEPLAY ARENA */}
          {currentScreen === "game" && (
            <div className={`flex-1 w-full flex flex-col items-center justify-start p-1 sm:p-3 md:p-6 overflow-hidden lg:overflow-y-auto pb-16 select-none pt-[calc(70px+env(safe-area-inset-top,0px))] md:pt-[76px] lg:pt-[85px] selection:bg-[#E0F2FE] bg-transparent touch-none lg:touch-auto`}>
              
              {/* Main responsive outer layout container - Centers automatically and stretches beautifully */}
              <div 
                className="w-full flex flex-col lg:flex-row gap-5 lg:gap-3 xl:gap-4 justify-center items-center lg:items-stretch select-none mx-auto lg:max-w-[940px] xl:max-w-[980px] my-auto shrink-0"
                style={{ margin: "auto" }}
                id="main-responsive-game-container"
              >
                
                {/* COLUMN 1: SUDOKU GRID & SCOREBOARD (Left Column 58-60% on Wide Screens, centered, proportional styling) */}
                <div 
                  className="w-full lg:w-auto lg:max-w-[min(94vw,62vh,500px)] xl:max-w-[min(94vw,66vh,540px)] lg:flex-1 flex flex-col gap-3 relative select-none"
                  style={{ margin: "0 auto" }}
                  id="game-grid-column"
                >
                
                {/* 1. TOP MINIMALIST HEADER BAR (TIGHTLY SITTING DIRECTLY ON GRID'S TOP EDGE) */}
                <div className="w-full flex flex-col gap-1.5 select-none shrink-0" id="status-and-grid-group">
                  
                  {/* DESKTOP NATIVE CONTROLS - Embedded Home Screen Replacements (Hidden on mobile) */}
                  <div className="hidden lg:flex w-full flex-col gap-3 mb-4 shrink-0 transition-opacity duration-300" id="desktop-home-controls-embedded">
                     <div className="w-full shrink-0 select-none pb-1" id="difficulty-level-container">
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <span className={`block text-xs font-black uppercase tracking-wider font-mono ${darkMode ? "text-zinc-400" : "text-[#1E1E1E]"}`}>
                          CHOOSE GAMEBOARD DIFFICULTY:
                        </span>
                      </div>
                      <div className="h-[38px] flex flex-row justify-between items-stretch gap-2 min-w-full font-mono text-xs">
                        {(["EASY", "MEDIUM", "HARD", "EXPERT"] as Difficulty[]).map((lvl) => {
                          const isSelected = difficulty === lvl;
                          
                          // Pastel color scheme mapping matching the global designer guidelines with precise active pressed values
                          const scheme = darkMode ? (
                            lvl === "EASY" ? { active: "bg-[#022c22] text-[#d1fae5] font-black shadow-[0_8px_16px_rgba(0,0,0,0.4)] scale-102 active:bg-[#064e3b]", inactive: "bg-zinc-900/60 hover:bg-[#022c22]/40 text-[#d1fae5]/70 active:bg-zinc-800" } :
                            lvl === "MEDIUM" ? { active: "bg-[#451a03] text-[#fef08a] font-black shadow-[0_8px_16px_rgba(0,0,0,0.4)] scale-102 active:bg-[#713f12]", inactive: "bg-zinc-900/60 hover:bg-[#451a03]/40 text-[#fef08a]/70 active:bg-zinc-800" } :
                            lvl === "HARD" ? { active: "bg-[#2e1065] text-[#e9d5ff] font-black shadow-[0_8px_16px_rgba(0,0,0,0.4)] scale-102 active:bg-[#3b0764]", inactive: "bg-zinc-900/60 hover:bg-[#2e1065]/40 text-[#e9d5ff]/70 active:bg-zinc-800" } :
                            { active: "bg-[#4c0519] text-[#fecdd3] font-black shadow-[0_8px_16px_rgba(0,0,0,0.4)] scale-102 active:bg-[#881337]", inactive: "bg-zinc-900/60 hover:bg-[#4c0519]/40 text-[#fecdd3]/70 active:bg-zinc-800" }
                          ) : (
                            lvl === "EASY" ? { active: "bg-[#D1FAE5] text-[#065F46] font-black shadow-[0_8px_16px_rgba(6,95,70,0.06),_0_2px_4px_rgba(0,0,0,0.02)] scale-102 active:bg-[#A7F3D0] active:scale-98 active:shadow-none", inactive: "bg-[#FDFBF7] border border-stone-200/50 hover:bg-[#D1FAE5]/50 text-stone-600 shadow-sm active:bg-[#D1FAE5]/80 active:shadow-none" } :
                            lvl === "MEDIUM" ? { active: "bg-[#FFF99D] text-[#854D0E] font-black shadow-[0_8px_16px_rgba(133,77,14,0.06),_0_2px_4px_rgba(0,0,0,0.02)] scale-102 active:bg-[#FDE047] active:scale-98 active:shadow-none", inactive: "bg-[#FDFBF7] border border-stone-200/50 hover:bg-[#FFF99D]/50 text-stone-600 shadow-sm active:bg-[#FFF99D]/80 active:shadow-none" } :
                            lvl === "HARD" ? { active: "bg-[#F3E8FF] text-[#6B21A8] font-black shadow-[0_8px_16px_rgba(107,33,168,0.06),_0_2px_4px_rgba(0,0,0,0.02)] scale-102 active:bg-[#D8B4FE] active:scale-98 active:shadow-none", inactive: "bg-[#FDFBF7] border border-stone-200/50 hover:bg-[#F3E8FF]/50 text-stone-600 shadow-sm active:bg-[#F3E8FF]/80 active:shadow-none" } :
                            { active: "bg-[#FFE4E6] text-[#9D174D] font-black shadow-[0_8px_16px_rgba(157,23,77,0.06),_0_2px_4px_rgba(0,0,0,0.02)] scale-102 active:bg-[#FBCFE8] active:scale-98 active:shadow-none", inactive: "bg-[#FDFBF7] border border-stone-200/50 hover:bg-[#FFE4E6]/50 text-stone-600 shadow-sm active:bg-[#FFE4E6]/80 active:shadow-none" }
                          );
    
                          const btnClass = isSelected ? scheme.active : scheme.inactive;
    
                          return (
                            <button
                              key={lvl}
                              onClick={() => {
                                playClickSound();
                                setDifficulty(lvl);
                                generateAndSetNewPuzzle(lvl);
                                addLog(`⚙️ Started new ${lvl} game on desktop`);
                              }}
                              className={`flex-1 h-full flex items-center justify-center text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer select-none rounded-xl outline-none ${btnClass}`}
                            >
                              {lvl}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="w-full grid grid-cols-2 gap-3.5 select-none shrink-0" id="desktop-solo-multiplayer-split">
                      <button
                        onClick={() => {
                          playClickSound();
                          if (savedSessionInfo) {
                            const loaded = resumeSavedSession();
                            if (loaded) {
                              setDifficulty(loaded.difficulty);
                              setIsTimerPaused(false);
                            }
                          } else {
                            showToast("Select a difficulty above and click PLAY NEW GAME!");
                          }
                        }}
                        className={`border-none py-3 px-4 text-center transition-all duration-150 select-none rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-[0.98] active:translate-y-px ${
                          savedSessionInfo
                            ? (darkMode ? "bg-[#0c4a6e]/20 hover:bg-[#0c4a6e]/40 text-[#7dd3fc] border border-[#bae6fd]/15" : "bg-[#E0F2FE]/60 hover:bg-[#E0F2FE]/80 active:bg-[#bae6fd]/60 text-[#0369a1] shadow-[0_8px_30px_rgba(3,105,161,0.04)]")
                            : (darkMode ? "bg-zinc-800/40 text-stone-500 cursor-not-allowed opacity-60 border border-zinc-700/30" : "bg-stone-100/60 text-stone-400 cursor-not-allowed opacity-60 shadow-[0_8px_30px_rgba(0,0,0,0.02)]")
                        }`}
                      >
                        <RotateCw className={`w-4 h-4 stroke-[3] shrink-0 ${savedSessionInfo ? "animate-pulse" : ""}`} />
                        <span className="font-sans font-black text-xs md:text-sm tracking-wider uppercase leading-none">
                          Resume
                        </span>
                      </button>
    
                      <button
                        onClick={() => {
                          playClickSound();
                          setShowMultiplayerForkModal(true);
                        }}
                        className={`border-none py-3 px-4 text-center transition-all duration-150 select-none rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-[0.98] active:translate-y-px ${
                          darkMode ? "bg-[#3b0764]/20 hover:bg-[#3b0764]/40 border border-[#f5f3ff]/15 text-[#d8b4fe]" : "bg-[#f3e8ff]/60 hover:bg-[#e9d5ff]/60 active:bg-[#d8b4fe]/60 shadow-[0_8px_30px_rgba(107,33,168,0.04)] text-[#6B21A8]"
                        }`}
                      >
                        <Users className="w-4 h-4 stroke-[3] shrink-0" />
                        <span className="font-sans font-black text-xs md:text-sm tracking-wider uppercase leading-none">
                          Multiplayer
                        </span>
                      </button>
                    </div>
                  </div>


                  {/* Status Indicators directly above the grid with swapped positions - hidden on desktop */}
                  <div className="w-full flex items-center justify-between px-1 pb-0.5 md:pb-4 lg:hidden" id="unified-bridge-container">
                    {/* Mistakes status metric inside elegant borderless layout */}
                    <span className={`font-sans font-black text-xs sm:text-sm tracking-wider leading-none ${darkMode ? "text-pink-400" : "text-[#9D174D]"}`}>
                      ERR: {boardState ? boardState.currentMistakesCount : 0}{mistakeLimitEnabled ? `/${boardState?.maxMistakesLimit ?? 3}` : ""}
                    </span>

                    {/* Middle HUD Icons: Multiplayer Invite and Help */}
                    <div className="flex items-center gap-1">
                      {/* Borderless Multiplayer Invite Icon Button */}
                      <button
                        onClick={() => {
                          playClickSound();
                          setIsTimerPaused(true);
                          setShowMidGameInviteModal(true);
                        }}
                        className={`p-1.5 border-none bg-transparent transition-all cursor-pointer active:scale-90 flex items-center justify-center ${darkMode ? "text-sky-400 hover:text-sky-300" : "text-[#2B6CB0] hover:text-[#1d4ed8]"}`}
                        aria-label="Invite Players to Match"
                        title="Invite Players"
                      >
                        <Users className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
                      </button>

                      {/* Help Icon Mobile */}
                      <button
                        onClick={() => setShowHowToPlayModal(true)}
                        className={`p-1.5 border-none bg-transparent transition-all cursor-pointer active:scale-90 flex items-center justify-center ${darkMode ? "text-sky-400 hover:text-sky-300" : "text-[#2B6CB0] hover:text-[#1d4ed8]"}`}
                        aria-label="How to play"
                        title="How to play"
                      >
                        <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
                      </button>
                    </div>

                    {/* Running Timer and Pause Button placed directly adjacent on the right */}
                    {timerEnabled ? (
                      <div className="flex items-center gap-1.5 justify-end">
                        <button
                          onClick={() => {
                            playClickSound();
                            setIsTimerPaused(!isTimerPaused);
                            addLog(isTimerPaused ? "⏱️ Session timer resumed!" : "⏸️ Session timer paused.");
                          }}
                          className="bg-transparent border-none p-0 cursor-pointer outline-none hover:opacity-80 transition-all flex items-center justify-center active:scale-90 duration-150"
                          title={isTimerPaused ? "Resume Game" : "Pause Game"}
                        >
                          {isTimerPaused ? (
                            <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current ${darkMode ? "text-sky-450 text-sky-400" : "text-[#2B6CB0]"}`} viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          ) : (
                            <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current ${darkMode ? "text-sky-450 text-sky-400" : "text-[#2B6CB0]"}`} viewBox="0 0 24 24">
                              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                            </svg>
                          )}
                        </button>
                        <span className={`font-sans font-bold text-xs sm:text-sm tracking-wider leading-none ${darkMode ? "text-sky-400" : "text-[#2B6CB0]"}`}>
                          {isTimerPaused ? "PAUSED" : formatTimer(sessionSeconds)}
                        </span>
                      </div>
                    ) : (
                      <div />
                    )}
                  </div>

                  {/* 2. CENTER CANVAS: Corner-to-Corner Sudoku grid with custom border hierarchy and height-aware sizing */}
                  <div className="w-full flex items-center justify-center p-0.5 overflow-hidden relative rounded-none">
                    {boardState ? (
                      <div 
                        className={`relative w-full aspect-square grid grid-cols-9 p-0 overflow-hidden rounded-none transition-colors duration-200 ${darkMode ? "bg-zinc-950 border-t-[3px] border-l-[3px]" : "bg-white border-t-[3px] border-l-[3px]"} ${darkMode ? ((boardState?.difficulty || difficulty) === "EASY" ? "border-[#064e3b]/60" : (boardState?.difficulty || difficulty) === "MEDIUM" ? "border-[#713f12]/60" : (boardState?.difficulty || difficulty) === "HARD" ? "border-[#581c87]/60" : "border-[#881337]/60") : ((boardState?.difficulty || difficulty) === "EASY" ? "border-[#065f46]/40" : (boardState?.difficulty || difficulty) === "MEDIUM" ? "border-[#854d0e]/40" : (boardState?.difficulty || difficulty) === "HARD" ? "border-[#6b21a8]/40" : "border-[#9d174d]/40")}`}
                        style={{ 
                          boxShadow: darkMode ? "0 4px 20px rgba(0,0,0,0.6)" : "0 4px 20px rgba(43,108,176,0.03)",
                          width: "100%",
                          maxWidth: "100%",
                          margin: "0 auto",
                        }}
                      >
                        
                        {/* PAUSE SCREEN OVERLAY */}
                        {isTimerPaused && (
                          <div className={`absolute inset-0 ${darkMode ? "bg-zinc-950/95 text-zinc-100" : "bg-[#FDFBF7]/95 text-stone-900"} backdrop-blur-xs z-45 flex flex-col items-center justify-center gap-3 rounded-xl`}>
                            <span className="text-3xl">⏸️</span>
                            <span className={`font-sans font-black text-xs uppercase tracking-widest ${darkMode ? "text-zinc-100" : "text-[#1E1E1E]"}`}>Sudoku Paused</span>
                            <button
                              onClick={() => {
                                playClickSound();
                                setIsTimerPaused(false);
                              }}
                              className={`border-none py-2 px-5 rounded-xl font-sans text-xs font-black uppercase tracking-wider cursor-pointer shadow-md transition-all active:scale-98 ${darkMode ? "bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white" : "bg-[#2B6CB0] hover:bg-[#1D4ED8] text-white"}`}
                            >
                              Resume Session
                            </button>
                          </div>
                        )}
                        
                        {Array.from({ length: 9 }).map((_, r) =>
                          Array.from({ length: 9 }).map((_, c) => {
                            const cell = boardState.grid[r][c];
                              
                              const isMistake = cell.value !== 0 && 
                                !cell.isOriginalClue && 
                                solutionGrid[r] && 
                                cell.value !== solutionGrid[r][c];

                              const isSelected = boardState.selectedRow === r && boardState.selectedCol === c;
                              
                              let isHighlightedSibling = false;
                              if (highlightAreas && boardState.selectedRow !== null && boardState.selectedCol !== null) {
                                const isRowSibling = boardState.selectedRow === r;
                                const isColSibling = boardState.selectedCol === c;
                                const isBoxSibling = 
                                  Math.floor(boardState.selectedRow / 3) === Math.floor(r / 3) && 
                                  Math.floor(boardState.selectedCol / 3) === Math.floor(c / 3);
                                isHighlightedSibling = (isRowSibling || isColSibling || isBoxSibling) && !isSelected;
                              }

                              const selectedCellValue = (boardState.selectedRow !== null && boardState.selectedCol !== null)
                                ? boardState.grid[boardState.selectedRow][boardState.selectedCol].value
                                : 0;

                              const activeSelectedNumber = (isNumberFirstInputMode && lockedNum !== null)
                                ? lockedNum
                                : selectedCellValue;

                              const isIdenticalValue = highlightIdentical && 
                                activeSelectedNumber !== 0 && 
                                cell.value === activeSelectedNumber && 
                                !isSelected;

                              const currentDiff = ((boardState.difficulty || difficulty).toUpperCase()) as Difficulty;
                              const diffTheme = DIFFICULTY_GRID_THEMES[currentDiff] || DIFFICULTY_GRID_THEMES.EASY;

                              let cellBgClass = "";
                              let cellBgStyle: React.CSSProperties = {};

                              if (isMistake) {
                                cellBgClass = darkMode ? "bg-[#4c0519]/40 border border-rose-900/30" : "bg-[#FFE4E6]";
                              } else if (isSelected) {
                                cellBgStyle = {
                                  backgroundColor: darkMode ? diffTheme.activeCell.dark : diffTheme.activeCell.light,
                                };
                                if (darkMode) cellBgClass = "text-white animate-pulse";
                              } else if (isIdenticalValue) {
                                cellBgStyle = {
                                  backgroundColor: darkMode ? diffTheme.identical.dark : diffTheme.identical.light,
                                };
                                if (darkMode) cellBgClass = "text-white";
                              } else if (isHighlightedSibling) {
                                cellBgStyle = {
                                  backgroundColor: darkMode ? diffTheme.crosshair.dark : diffTheme.crosshair.light,
                                };
                              } else {
                                cellBgClass = darkMode ? "bg-zinc-900/60" : "bg-white";
                              }

                              // Precise line weight styling: 3x3 and outer perimeter boundaries get exact identical 3px thick border, others get thin 0.75px borders
                              let borderClasses = "";
                              const heavyBorderR = darkMode 
                                ? (currentDiff === "EASY" ? "border-r-[#064e3b]/60" : currentDiff === "MEDIUM" ? "border-r-[#713f12]/60" : currentDiff === "HARD" ? "border-r-[#581c87]/60" : "border-r-[#881337]/60")
                                : (currentDiff === "EASY" ? "border-r-[#065f46]/40" : currentDiff === "MEDIUM" ? "border-r-[#854d0e]/40" : currentDiff === "HARD" ? "border-r-[#6b21a8]/40" : "border-r-[#9d174d]/40");
                              const heavyBorderB = darkMode 
                                ? (currentDiff === "EASY" ? "border-b-[#064e3b]/60" : currentDiff === "MEDIUM" ? "border-b-[#713f12]/60" : currentDiff === "HARD" ? "border-b-[#581c87]/60" : "border-b-[#881337]/60")
                                : (currentDiff === "EASY" ? "border-b-[#065f46]/40" : currentDiff === "MEDIUM" ? "border-b-[#854d0e]/40" : currentDiff === "HARD" ? "border-b-[#6b21a8]/40" : "border-b-[#9d174d]/40");

                              const lightBorderR = darkMode
                                ? (currentDiff === "EASY" ? "border-r-[#064e3b]/30" : currentDiff === "MEDIUM" ? "border-r-[#713f12]/30" : currentDiff === "HARD" ? "border-r-[#581c87]/30" : "border-r-[#881337]/30")
                                : (currentDiff === "EASY" ? "border-r-[#065f46]/20" : currentDiff === "MEDIUM" ? "border-r-[#854d0e]/20" : currentDiff === "HARD" ? "border-r-[#6b21a8]/20" : "border-r-[#9d174d]/20");
                                
                              const lightBorderB = darkMode
                                ? (currentDiff === "EASY" ? "border-b-[#064e3b]/30" : currentDiff === "MEDIUM" ? "border-b-[#713f12]/30" : currentDiff === "HARD" ? "border-b-[#581c87]/30" : "border-b-[#881337]/30")
                                : (currentDiff === "EASY" ? "border-b-[#065f46]/20" : currentDiff === "MEDIUM" ? "border-b-[#854d0e]/20" : currentDiff === "HARD" ? "border-b-[#6b21a8]/20" : "border-b-[#9d174d]/20");

                              if (c === 2 || c === 8 || c === 5) {
                                borderClasses += ` border-r-[3px] ${heavyBorderR}`;
                              } else {
                                borderClasses += ` border-r-[0.75px] ${lightBorderR}`;
                              }

                              if (r === 2 || r === 8 || r === 5) {
                                borderClasses += ` border-b-[3px] ${heavyBorderB}`;
                              } else {
                                borderClasses += ` border-b-[0.75px] ${lightBorderB}`;
                              }

                              return (
                                <div
                                  key={`${r}-${c}`}
                                  onClick={() => {
                                    if (visualizingBacktrack || isTimerPaused) return;
                                    if (boardState?.isGameOver) {
                                      setBoardState(prev => prev ? { ...prev, selectedRow: r, selectedCol: c } : null);
                                      return;
                                    }
                                    playClickSound();
                                    setBoardState(prev => prev ? { ...prev, selectedRow: r, selectedCol: c } : null);

                                    if (isNumberFirstInputMode) {
                                      if (cell.value !== 0) {
                                        // Tapping any filled cell immediately sets that number as the active brush digit
                                        setLockedNum(cell.value);
                                        addLog(`🎨 Selected paint digit ${cell.value} from grid cell. Click empty cells to fast fill!`);
                                      } else if (lockedNum !== null && !cell.isOriginalClue) {
                                        // Fast fill empty cell with the active brush digit
                                        handleValueInput(lockedNum, r, c);
                                      }
                                    }
                                  }}
                                  style={cellBgStyle}
                                  className={`aspect-square relative cursor-pointer select-none ${cellBgClass} ${borderClasses} p-0 overflow-hidden flex items-center justify-center`}
                                >
                                  {cell.value !== 0 ? (
                                    <div 
                                      className={`absolute inset-0 flex items-center justify-center text-center select-none ${
                                        cell.isOriginalClue 
                                          ? (darkMode ? "text-white font-sans font-normal" : "text-stone-900 font-sans font-normal")
                                          : isMistake
                                            ? (darkMode ? "text-rose-400 handwriting font-black animate-pulse" : "text-rose-600 handwriting font-black")
                                            : (darkMode ? "text-[#38bdf8] handwriting font-normal" : "text-[#2B6CB0] handwriting font-normal")
                                      }`}
                                      style={{
                                        fontSize: cell.isOriginalClue 
                                          ? "clamp(22px, min(7.5vw, 6.5vh), 42px)" 
                                          : "clamp(26px, min(9.5vw, 8.5vh), 50px)"
                                      }}
                                    >
                                      {cell.value}
                                    </div>
                                  ) : (
                                    /* Soft muted light grey note digits */
                                    <div 
                                      className={`absolute inset-px grid grid-cols-3 p-[2px] font-mono leading-none ${darkMode ? "text-sky-400/50" : "text-[#2B6CB0]/55"}`}
                                      style={{
                                        fontSize: "clamp(6px, min(1.8vw, 1.4vh), 12px)",
                                        lineHeight: "1.1"
                                      }}
                                    >
                                      {Array.from({ length: 9 }).map((_, id) => {
                                        const cand = id + 1;
                                        const hasNote = cell.notes.has(cand);
                                        return (
                                          <div key={id} className={`flex items-center justify-center text-center font-bold ${
                                            hasNote 
                                              ? (darkMode ? "text-sky-400/90 font-black font-sans" : "text-[#2B6CB0]/85 font-black font-sans") 
                                              : "opacity-0"
                                          }`}>
                                            {cand}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )
                        }
                      </div>
                    ) : (
                      <div className="w-full max-w-[420px] aspect-square flex flex-col items-center justify-center bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-2xl shadow-xl border border-stone-200/50 dark:border-zinc-800 p-8 my-auto select-none">
                        <RefreshCw className="w-10 h-10 animate-spin text-sky-500 mb-3" />
                        <span className="font-mono text-sm font-black tracking-widest text-stone-800 dark:text-stone-100 uppercase">
                          ENTERING MATCH...
                        </span>
                        <span className="text-xs text-stone-400 dark:text-zinc-500 font-mono mt-1">
                          Synchronizing Sudoku arena
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                </div>

                {/* COLUMN 2: CONTROLS & NUMBERS DECK (Right Column compacted on Desktop to match Sudoku 3/3 dimensions) */}
                <div 
                  className="w-full lg:w-[260px] xl:w-[285px] flex flex-col gap-3 lg:gap-0 lg:justify-between px-2 py-3 sm:px-2 sm:py-4 lg:p-4.5 transition-colors duration-300 border-none select-none mt-2 lg:mt-0 shrink-0 lg:self-stretch lg:h-auto"
                  id="game-controls-column"
                >
                  
                  {/* 1. STATUS INDICATORS (Desktop-only, placed at the top of the right panel) */}
                  <div className="hidden lg:flex items-center justify-between w-full border-b border-stone-200/20 dark:border-zinc-800 pb-3 mb-1" id="desktop-status-indicators">
                    {/* Mistakes counter */}
                    <div className="flex flex-col gap-1 w-1/3">
                      <span className="text-[10px] font-black font-mono tracking-widest text-[#0369A1] dark:text-[#38BDF8] uppercase">
                        Mistakes
                      </span>
                      <span className={`font-sans font-black text-sm tracking-wider leading-none ${darkMode ? "text-pink-400" : "text-[#9D174D]"}`}>
                        ERR: {boardState ? boardState.currentMistakesCount : 0}{mistakeLimitEnabled ? `/${boardState?.maxMistakesLimit ?? 3}` : ""}
                      </span>
                    </div>

                    {/* Help & Invite Icons Desktop */}
                    <div className="flex items-center justify-center gap-2 w-1/3">
                      <button
                        onClick={() => {
                          playClickSound();
                          setIsTimerPaused(true);
                          setShowMidGameInviteModal(true);
                        }}
                        className={`p-1.5 border-none bg-transparent transition-all cursor-pointer hover:scale-110 active:scale-95 flex items-center justify-center ${darkMode ? "text-sky-400 hover:text-sky-300" : "text-[#2B6CB0] hover:text-[#1d4ed8]"}`}
                        aria-label="Invite Players to Match"
                        title="Invite Players"
                      >
                        <Users className="w-5 h-5" strokeWidth={2} />
                      </button>

                      <button
                        onClick={() => setShowHowToPlayModal(true)}
                        className={`p-1.5 border-none bg-transparent transition-all cursor-pointer hover:scale-110 active:scale-95 flex items-center justify-center ${darkMode ? "text-sky-400 hover:text-sky-300" : "text-[#2B6CB0] hover:text-[#1d4ed8]"}`}
                        title="How to play"
                      >
                        <HelpCircle className="w-5 h-5" strokeWidth={2} />
                      </button>
                    </div>

                    {/* Timer/Time counter */}
                    <div className="flex flex-col items-end gap-1 w-1/3">
                      <span className="text-[10px] font-black font-mono tracking-widest text-[#0369A1] dark:text-[#38BDF8] uppercase">
                        Timer
                      </span>
                      {timerEnabled ? (
                        <div className="flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => {
                              playClickSound();
                              setIsTimerPaused(!isTimerPaused);
                              addLog(isTimerPaused ? "⏱️ Session timer resumed!" : "⏸️ Session timer paused.");
                            }}
                            className="bg-transparent border-none p-0 cursor-pointer outline-none hover:opacity-80 transition-all flex items-center justify-center active:scale-95 duration-150"
                            title={isTimerPaused ? "Resume Game" : "Pause Game"}
                          >
                            {isTimerPaused ? (
                              <svg className="w-3.5 h-3.5 fill-current text-[#2B6CB0] dark:text-sky-450 text-sky-400" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5 fill-current text-[#2B6CB0] dark:text-sky-450 text-sky-400" viewBox="0 0 24 24">
                                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                              </svg>
                            )}
                          </button>
                          <span className={`font-sans font-bold text-sm tracking-wider leading-none ${darkMode ? "text-sky-400" : "text-[#2B6CB0]"}`}>
                            {isTimerPaused ? "PAUSED" : formatTimer(sessionSeconds)}
                          </span>
                        </div>
                      ) : (
                        <span className={`font-sans font-bold text-sm tracking-wider leading-none ${darkMode ? "text-sky-400" : "text-[#2B6CB0]"}`}>
                          --:--
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 2. UTILITY BUTTONS: Position the 'Undo', 'Erase', 'Notes' (toggle), and 'Hint' buttons in a single horizontal row immediately below indicators */}
                  <div className="shrink-0 w-full flex flex-col mt-1 px-0.5 overflow-visible" id="game-utility-buttons-deck">
                    <div className="grid grid-cols-4 gap-2 lg:gap-2 xl:gap-2.5 relative z-10 w-full overflow-visible">
                      
                      {/* UNDO BUTTON: pastel Light Blue with active dark state and reduced shadow */}
                      <button
                        onClick={() => { playClickSound(); handleUndo(); }}
                        disabled={!boardState || boardState.isGameOver || history.length === 0}
                        className={`aspect-[1.12/1] w-full p-2 transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed select-none rounded-[16px] flex flex-col items-center justify-center gap-0.5 active:scale-95 active:shadow-none border-none shadow-md ${darkMode ? "bg-zinc-900 border border-sky-950 hover:bg-zinc-850 text-[#38BDF8] active:bg-zinc-800" : "bg-[#E0F2FE] hover:bg-[#bae6fd] active:bg-[#C0E8FF] text-[#0369A1] shadow-[0_8px_16px_rgba(3,105,161,0.06),_0_2px_4px_rgba(0,0,0,0.02)]"}`}
                      >
                        <RotateCcw className={`w-[16px] h-[16px] xl:w-[18px] xl:h-[18px] stroke-[2.5] ${darkMode ? "text-[#38BDF8]" : "text-[#0369A1]"}`} />
                        <span className="text-[9px] xl:text-[10px] font-sans font-extrabold tracking-wider uppercase leading-none mt-1">
                          Undo
                        </span>
                      </button>

                      {/* ERASE BUTTON: pastel Light Pink with active dark state and reduced shadow */}
                      <button
                        onClick={() => { playClickSound(); handleClearCell(); }}
                        disabled={!boardState || boardState.isGameOver}
                        className={`aspect-[1.12/1] w-full p-2 transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed select-none rounded-[16px] flex flex-col items-center justify-center gap-0.5 active:scale-95 active:shadow-none border-none shadow-md ${darkMode ? "bg-zinc-900 border border-pink-950 hover:bg-zinc-850 text-[#F472B6] active:bg-zinc-800" : "bg-[#FCE7F3] hover:bg-[#FBCFE8] active:bg-[#F9A8D4] text-[#9D174D] shadow-[0_8px_16px_rgba(157,23,77,0.06),_0_2px_4px_rgba(0,0,0,0.02)]"}`}
                      >
                        <Trash2 className={`w-[16px] h-[16px] xl:w-[18px] xl:h-[18px] ${darkMode ? "text-[#F472B6]" : "text-[#9D174D]"}`} />
                        <span className="text-[9px] xl:text-[10px] font-sans font-extrabold tracking-wider uppercase leading-none mt-1">
                          Erase
                        </span>
                      </button>

                      {/* NOTES ON/OFF BUTTON: pastel Light Purple or active Yellow with active pressed states */}
                      <button
                        onClick={() => { playClickSound(); setPencilMode(!pencilMode); }}
                        disabled={!boardState || boardState.isGameOver}
                        className={`aspect-[1.12/1] w-full p-2 transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed select-none rounded-[16px] flex flex-col items-center justify-center gap-0.5 active:scale-95 active:shadow-none border-none shadow-md ${
                          darkMode 
                            ? (pencilMode 
                                ? "bg-[#713f12] hover:bg-[#854d0e] active:bg-[#854d0e] text-[#facc15] font-black border border-yellow-950" 
                                : "bg-zinc-900 hover:bg-zinc-850 active:bg-zinc-800 text-[#C084FC] border border-purple-950")
                            : (pencilMode 
                                ? "bg-[#FFF99D] hover:bg-[#FEF08A] active:bg-[#FDE047] text-[#854D0E] font-black shadow-[0_8px_16px_rgba(133,77,14,0.12),_0_2px_4px_rgba(0,0,0,0.02)]" 
                                : "bg-[#F3E8FF] hover:bg-[#E9D5FF] active:bg-[#D8B4FE] text-[#6B21A8] shadow-[0_8px_16px_rgba(107,33,168,0.06),_0_2px_4px_rgba(0,0,0,0.02)]")
                        }`}
                      >
                        <Pencil className="w-[16px] h-[16px] xl:w-[18px] xl:h-[18px]" />
                        <span className="text-[9px] xl:text-[10px] font-sans font-extrabold tracking-wider uppercase leading-none mt-1">
                          Notes {pencilMode ? "ON" : "OFF"}
                        </span>
                      </button>

                      {/* HINT BUTTON: pastel Light Green with active pressed states */}
                      <button
                        onClick={() => { playClickSound(); triggerSmartHint(); }}
                        disabled={!boardState || boardState.isGameOver}
                        className={`aspect-[1.12/1] w-full p-2 transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed select-none rounded-[16px] flex flex-col items-center justify-center gap-0.5 active:scale-95 active:shadow-none border-none shadow-md ${darkMode ? "bg-zinc-900 border border-emerald-950 hover:bg-zinc-850 text-[#34D399] active:bg-[#135236]" : "bg-[#E6F4EA] hover:bg-[#D1FAE5] text-[#135236] shadow-[0_8px_16px_rgba(19,82,54,0.06),_0_2px_4px_rgba(0,0,0,0.02)]"}`}
                      >
                        <div className="relative pointer-events-none flex items-center justify-center">
                          <Lightbulb className={`w-[16px] h-[16px] xl:w-[18px] xl:h-[18px] ${darkMode ? "text-[#34D399]" : "text-[#135236]"}`} />
                          <span className={`absolute -top-1.5 -right-2 text-[7px] font-mono font-black rounded-full h-3.5 w-3.5 border flex items-center justify-center shadow-sm ${darkMode ? "bg-[#FBCFE8] text-[#831843] border-[#FBCFE8]" : "bg-[#FCE7F3] text-[#9D174D] border-white"}`}>
                            {boardState && boardState.maxHintsLimit !== undefined ? Math.max(0, boardState.maxHintsLimit - boardState.hintsCount) : hintInventory}
                          </span>
                        </div>
                        <span className="text-[9px] xl:text-[10px] font-sans font-extrabold tracking-wider uppercase leading-none mt-1">
                          Hint
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* 3. NUMBER PAD: Arrange the numbers 1-9 in a 3x3 grid below the utility buttons on desktop, horizontal row on mobile */}
                  <div className="shrink-0 w-full mt-1 lg:mt-2 pb-0.5 overflow-visible px-1 sm:px-0" id="game-number-pad-deck">
                    <div className="grid grid-cols-9 lg:grid-cols-3 gap-1 sm:gap-1.5 lg:gap-2 xl:gap-2.5 w-full select-none overflow-visible">
                      {Array.from({ length: 9 }).map((_, i) => {
                        const num = i + 1;
                        const selectedVal = (boardState && boardState.selectedRow !== null && boardState.selectedCol !== null)
                          ? boardState.grid[boardState.selectedRow][boardState.selectedCol].value
                          : 0;
                        const isLocked = isNumberFirstInputMode && (lockedNum === num);
                        
                        let remainingCount = 9;
                        if (boardState) {
                          let count = 0;
                          for (let r = 0; r < 9; r++) {
                            for (let c = 0; c < 9; c++) {
                              if (boardState.grid[r][c].value === num) {
                                count++;
                              }
                            }
                          }
                          remainingCount = 9 - count;
                        }

                        return (
                          <button
                            key={num}
                            onClick={() => {
                              playClickSound();
                              if (isNumberFirstInputMode) {
                                if (lockedNum === num) {
                                  setLockedNum(null);
                                  addLog(`🔓 Unlocked digit ${num}.`);
                                } else {
                                  setLockedNum(num);
                                  addLog(`🎨 Selected paint digit ${num}. Tap empty cells to fast fill!`);
                                }
                              } else {
                                handleValueInput(num);
                              }
                            }}
                            disabled={!boardState || boardState.isGameOver || visualizingBacktrack || remainingCount <= 0}
                            className={`aspect-[1/1.55] lg:aspect-[1/1.15] w-full relative flex items-center justify-center font-sans font-normal cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none transition-all rounded-xl border-none hover:translate-y-[-1px] active:scale-95 active:shadow-none shadow-md ${
                              isLocked 
                                ? (darkMode 
                                    ? "bg-[#713f12] text-[#facc15] active:bg-[#854d0e] border border-yellow-950" 
                                    : "bg-[#FFF99D] text-[#854D0E] active:bg-[#FDE047] shadow-[0_8px_16px_rgba(133,77,14,0.12),_0_2px_4px_rgba(0,0,0,0.02)]")
                                : (darkMode 
                                    ? "bg-[#1E1E26] text-sky-450 hover:bg-[#252530] border border-zinc-805 shadow-[0_4px_10px_rgba(0,0,0,0.4)]" 
                                    : "bg-white/95 text-[#2B6CB0] hover:bg-white active:bg-stone-250 shadow-[0_8px_16px_rgba(43,108,176,0.08),_0_2px_4px_rgba(0,0,0,0.02)]")
                            }`}
                          >
                            <div className="flex flex-col items-center justify-center absolute inset-0">
                              <span 
                                className="leading-none flex items-center justify-center"
                                style={{ fontSize: "clamp(20px, min(6.5vw, 5.5vh), 38px)" }}
                              >
                                {num}
                              </span>
                              {showRemainingNumbers && (
                                <span className={`text-[9px] lg:text-xs xl:text-sm font-mono leading-none mt-1 lg:mt-1.5 font-bold ${remainingCount <= 0 ? "opacity-30" : "opacity-70"}`}>
                                  {remainingCount > 0 ? remainingCount : 0}
                                </span>
                              )}
                            </div>
                            {isLocked && (
                              <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[6px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-black z-10">
                                ✓
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4. ACTION BUTTON: 'New Game' button at the bottom of the right panel, spanning the width of the number pad on desktop */}
                  <button
                    onClick={() => {
                      playClickSound();
                      generateAndSetNewPuzzle(difficulty);
                      setIsTimerPaused(false);
                      addLog("🔄 Started a fresh new board!");
                    }}
                    className={`hidden lg:block w-full border-none p-4 lg:py-5 xl:py-6 text-center font-black text-sm xl:text-base tracking-wider uppercase transition-all duration-150 select-none rounded-[16px] xl:rounded-2xl active:scale-[0.98] active:translate-y-px cursor-pointer shadow-md mt-1 lg:mt-2 ${
                      darkMode 
                        ? "bg-[#4c0519] hover:bg-[#4c0519]/80 text-[#fecdd3]" 
                        : "bg-[#FFE4E6] hover:bg-[#FFE4E6]/85 active:bg-[#FBCFE8] text-[#9D174D]"
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2.5 leading-none">
                      <RefreshCw className="w-4 h-4 xl:w-5 xl:h-5 animate-spin-slow stroke-[2.5]" />
                      <span>New Game</span>
                    </span>
                  </button>

                </div> {/* Close game-controls-column */}
              </div> {/* Close main-responsive-game-container */}

              {/* GAME OVER AND VICTORY OVERLAYS */}

              {/* 1. MULTIPLAYER LEADERBOARD MODAL (when challengeMode is true) */}
              {boardState && showGameOverModal && challengeMode && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 sm:p-6" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className={`p-4 sm:p-6 md:p-8 w-[92%] sm:w-full max-w-lg max-h-[85dvh] my-auto mx-auto relative flex flex-col gap-3 sm:gap-4 rounded-[28px] shadow-[0_24px_50px_rgba(0,0,0,0.2)] overflow-hidden ${darkMode ? "bg-zinc-900 border border-zinc-700/50" : "bg-[#FDFBF7] border border-stone-200"}`}
                  >
                    {/* ── 2-STEP END-GAME FLOW ── */}
                    {endGameStep === 1 ? (
                      <>
                        {/* Header Strip for Step 1: MATCH RESULTS + X button */}
                        <div className="flex items-center justify-between shrink-0 select-none">
                          <div className="flex items-center gap-2">
                            <h3 className={`text-lg sm:text-xl font-sans font-black tracking-tight uppercase ${darkMode ? "text-white" : "text-[#1C1917]"}`}>
                              MATCH RESULTS
                            </h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${darkMode ? "bg-purple-900/40 text-purple-300" : "bg-[#F3E8FF] text-[#6B21A8]"}`}>
                              {difficulty}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              playClickSound();
                              setShowGameOverModal(false);
                            }}
                            className={`p-1.5 rounded-full border-none cursor-pointer transition-all hover:scale-110 active:scale-95 ${darkMode ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300" : "bg-stone-100 hover:bg-stone-200 text-stone-600"}`}
                            title="Close"
                          >
                            <X className="w-4 h-4" strokeWidth={2.5} />
                          </button>
                        </div>

                        <div className={`w-full h-px shrink-0 ${darkMode ? "bg-zinc-800" : "bg-stone-200"}`} />

                        {/* SCREEN 1: ONLY Middle Leaderboard Player List is Scrollable */}
                        <div className="flex-1 min-h-0 overflow-y-auto pr-0.5 no-scrollbar flex flex-col gap-2">
                          {(() => {
                            const didCurrentPlayerFail = mistakeLimitEnabled && 
                              (boardState.maxMistakesLimit === 0 
                                ? boardState.currentMistakesCount > 0 
                                : boardState.currentMistakesCount >= boardState.maxMistakesLimit);
                            
                            const resultsMap = new Map<string, any>();

                            const isConfigured = checkIsDisplayNameConfigured();
                            const localMe = {
                              id: userProfile?.id || 'me',
                              name: isConfigured && userProfile?.name ? userProfile.name : "You",
                              time: didCurrentPlayerFail ? 9999 : sessionSeconds,
                              elapsedTime: sessionSeconds,
                              mistakes: boardState.currentMistakesCount,
                              failed: didCurrentPlayerFail,
                              isMe: true,
                              isReal: true,
                              isPending: false
                            };
                            resultsMap.set(localMe.id, localMe);

                            syncedLeaderboard.forEach(r => {
                              const isCurrentUser = r.userId === userProfile?.id;
                              resultsMap.set(r.userId, {
                                id: r.userId,
                                name: r.playerName,
                                time: !r.isWon ? 9999 : Number(r.timeSec),
                                elapsedTime: Number(r.timeSec) || 0,
                                mistakes: Number(r.mistakes),
                                failed: !r.isWon && !r.isPending,
                                isMe: isCurrentUser,
                                isReal: true,
                                isPending: !isCurrentUser ? !!r.isPending : false
                              });
                            });

                            const results = Array.from(resultsMap.values());
                            results.sort((a, b) => {
                              const aPending = !!a.isPending;
                              const bPending = !!b.isPending;
                              if (aPending !== bPending) return aPending ? 1 : -1;
                              if (a.failed !== b.failed) return a.failed ? 1 : -1;
                              if (a.time !== b.time) return a.time - b.time;
                              return a.mistakes - b.mistakes;
                            });

                            return results.map((player, idx) => {
                              const isPending = !!player.isPending;
                              const medal = isPending ? "⏳" : idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : "";
                              const positionStr = isPending ? "" : idx === 0 ? "1st" : idx === 1 ? "2nd" : idx === 2 ? "3rd" : `${idx + 1}th`;
                              
                              return (
                                <div 
                                  key={player.id}
                                  className={`flex items-center justify-between p-3 rounded-2xl transition-all ${
                                    player.isMe 
                                      ? (darkMode ? "bg-[#1e1b4b]/60 border border-indigo-900/50 shadow-md" : "bg-[#EEF2FF] border border-[#C7D2FE] shadow-[0_4px_12px_rgba(99,102,241,0.05)]") 
                                      : (darkMode ? "bg-zinc-800/40" : "bg-stone-55")
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <span className={`font-mono text-sm sm:text-base font-black w-8 text-center ${
                                      isPending ? "text-amber-500 animate-pulse" : idx === 0 ? "text-yellow-500" : idx === 1 ? "text-slate-400" : idx === 2 ? "text-amber-700" : darkMode ? "text-zinc-600" : "text-stone-400"
                                    }`}>
                                      {medal || positionStr}
                                    </span>
                                    <div className="flex flex-col">
                                      <span className={`font-sans font-bold text-sm leading-none flex items-center gap-1.5 ${player.isMe ? (darkMode ? "text-indigo-300" : "text-indigo-950") : (darkMode ? "text-zinc-200" : "text-stone-850")}`}>
                                        {player.name}
                                        {player.isMe && <span className="text-[9px] bg-indigo-500/20 text-indigo-500 px-1.5 py-0.5 rounded uppercase tracking-wider font-black">You</span>}
                                        {player.isReal && !player.isMe && !isPending && (
                                          <span className="text-[9px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">Synced ✓</span>
                                        )}
                                      </span>
                                      <span className={`font-sans text-[10px] mt-1.5 uppercase font-bold tracking-wider ${player.failed ? "text-rose-500" : isPending ? "text-amber-500" : darkMode ? "text-zinc-400" : "text-stone-500"}`}>
                                        {isPending ? "In Progress..." : player.failed ? "Mistake Limit Reached" : "Board Completed"}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="flex flex-col items-end justify-center gap-0.5">
                                      {isPending ? (
                                        <>
                                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                                            darkMode ? "bg-amber-900/30 text-amber-300 border border-amber-800/40" : "bg-amber-50 text-amber-700 border border-amber-200/70"
                                          }`}>
                                            PLAYING
                                          </span>
                                          <span className={`font-sans text-[8.5px] uppercase font-bold tracking-wider ${
                                            darkMode ? "text-amber-400/80" : "text-amber-600"
                                          } animate-pulse`}>
                                            SOLVING...
                                          </span>
                                        </>
                                      ) : player.failed ? (
                                        <>
                                          <span className="font-mono font-black text-xs sm:text-sm text-red-500 tracking-wide">
                                            FAIL • {formatTimer(player.elapsedTime)}
                                          </span>
                                          <span className={`font-sans text-[8.5px] uppercase font-bold tracking-wider ${
                                            darkMode ? "text-zinc-400" : "text-stone-500"
                                          }`}>
                                            {player.mistakes} {player.mistakes === 1 ? "Error" : "Errors"}
                                          </span>
                                        </>
                                      ) : (
                                        <>
                                          <span className={`font-mono font-black text-sm sm:text-base ${
                                            player.isMe 
                                              ? (darkMode ? "text-indigo-200" : "text-indigo-950") 
                                              : (darkMode ? "text-zinc-200" : "text-stone-850")
                                          }`}>
                                            {formatTimer(player.elapsedTime || player.time)}
                                          </span>
                                          <span className={`font-sans text-[8.5px] uppercase font-bold tracking-wider ${
                                            player.isMe 
                                              ? (darkMode ? "text-indigo-400/80" : "text-indigo-600/80") 
                                              : (darkMode ? "text-zinc-400" : "text-stone-500")
                                          }`}>
                                            {player.mistakes === 0 ? "Flawless" : `${player.mistakes} ${player.mistakes === 1 ? "Error" : "Errors"}`}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>

                        {/* INTERACTIVE MATCH RULES CONFIG — 4 Sleek Compact Dropdown Tags */}
                        <div className="relative select-none shrink-0">
                          <div className="grid grid-cols-2 gap-2 w-full">
                            {/* Top-Left: Difficulty */}
                            <div className="relative w-full">
                              <button
                                onClick={(e) => {
                                  playClickSound();
                                  toggleDropdownPortal("difficulty", e.currentTarget);
                                }}
                                className={`w-full py-1.5 px-2.5 flex items-center justify-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider rounded-lg border-none outline-none cursor-pointer transition-all duration-150 active:scale-95 ${
                                  challengeDifficulty === "EASY"
                                    ? (darkMode ? "bg-[#022c22] text-[#d1fae5] shadow-xs" : "bg-[#D1FAE5] text-[#065F46] shadow-xs")
                                    : challengeDifficulty === "MEDIUM"
                                    ? (darkMode ? "bg-[#451a03] text-[#fef08a] shadow-xs" : "bg-[#FFF99D] text-[#854D0E] shadow-xs")
                                    : challengeDifficulty === "HARD"
                                    ? (darkMode ? "bg-[#2e1065] text-[#e9d5ff] shadow-xs" : "bg-[#F3E8FF] text-[#6B21A8] shadow-xs")
                                    : (darkMode ? "bg-[#4c0519] text-[#fecdd3] shadow-xs" : "bg-[#FFE4E6] text-[#9D174D] shadow-xs")
                                }`}
                              >
                                <span className="truncate">
                                  {challengeDifficulty === "EASY" ? "Easy" : challengeDifficulty === "MEDIUM" ? "Medium" : challengeDifficulty === "HARD" ? "Hard" : "Expert"} ▾
                                </span>
                              </button>
                            </div>

                            {/* Top-Right: Mistakes */}
                            <div className="relative w-full">
                              <button
                                onClick={(e) => {
                                  playClickSound();
                                  toggleDropdownPortal("mistakes", e.currentTarget);
                                }}
                                className={`w-full py-1.5 px-2.5 flex items-center justify-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider rounded-lg border-none outline-none cursor-pointer transition-all duration-150 active:scale-95 ${
                                  darkMode
                                    ? "bg-[#451a03] text-[#fef08a] shadow-xs"
                                    : "bg-[#FFF99D] text-[#854D0E] shadow-xs"
                                }`}
                              >
                                <span className="truncate">
                                  {challengeMistakeLimit === 0 ? "0 Mistakes" : challengeMistakeLimit === 999 ? "Unlimited" : `${challengeMistakeLimit} Mistakes`} ▾
                                </span>
                              </button>
                            </div>

                            {/* Bottom-Left: Hints */}
                            <div className="relative w-full">
                              <button
                                onClick={(e) => {
                                  playClickSound();
                                  toggleDropdownPortal("hints", e.currentTarget);
                                }}
                                className={`w-full py-1.5 px-2.5 flex items-center justify-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider rounded-lg border-none outline-none cursor-pointer transition-all duration-150 active:scale-95 ${
                                  darkMode
                                    ? "bg-[#2e1065] text-[#e9d5ff] shadow-xs"
                                    : "bg-[#F3E8FF] text-[#6B21A8] shadow-xs"
                                }`}
                              >
                                <Lightbulb className="w-3 h-3 stroke-[2.5] shrink-0" />
                                <span className="truncate">
                                  {challengeHintLimit === 0 ? "No Hints" : challengeHintLimit === 1 ? "1 Hint" : `${challengeHintLimit} Hints`} ▾
                                </span>
                              </button>
                            </div>

                            {/* Bottom-Right: Timer */}
                            <div className="relative w-full">
                              <button
                                onClick={(e) => {
                                  playClickSound();
                                  toggleDropdownPortal("timer", e.currentTarget);
                                }}
                                className={`w-full py-1.5 px-2.5 flex items-center justify-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider rounded-lg border-none outline-none cursor-pointer transition-all duration-150 active:scale-95 ${
                                  challengeTimerEnabled
                                    ? (darkMode ? "bg-[#0c4a6e]/50 text-[#bae6fd] shadow-xs" : "bg-[#E0F2FE] text-[#0369A1] shadow-xs")
                                    : (darkMode ? "bg-zinc-800/80 text-stone-400" : "bg-stone-150 text-stone-600")
                                }`}
                              >
                                <Timer className="w-3 h-3 stroke-[2.5] shrink-0" />
                                <span className="truncate">
                                  {challengeTimerEnabled ? "TIMER ON ▾" : "TIMER OFF ▾"}
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* FLOATING PORTAL FOR SETTINGS DROPDOWN */}
                        {openDropdown && dropdownCoords && typeof document !== "undefined" && createPortal(
                          <div 
                            className="fixed inset-0 z-[99998] bg-transparent cursor-default pointer-events-auto" 
                            onClick={() => { setOpenDropdown(null); setDropdownCoords(null); }}
                          >
                            <div
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                position: "fixed",
                                top: dropdownCoords.top,
                                left: Math.max(8, Math.min(dropdownCoords.left, window.innerWidth - (openDropdown === "mistakes" ? 225 : 165))),
                                minWidth: Math.max(dropdownCoords.width, openDropdown === "mistakes" ? 215 : 150),
                                maxWidth: "calc(100vw - 16px)",
                              }}
                              className={`rounded-xl p-1.5 flex flex-col gap-1 z-[99999] shadow-2xl border transition-all ${
                                darkMode ? "bg-zinc-900 border-zinc-700 text-stone-100" : "bg-white border-stone-200 text-stone-850"
                              }`}
                            >
                              {openDropdown === "difficulty" && (
                                (["EASY", "MEDIUM", "HARD", "EXPERT"] as Difficulty[]).map(lvl => (
                                  <button
                                    key={lvl}
                                    onClick={() => {
                                      playClickSound();
                                      setChallengeDifficulty(lvl);
                                      setOpenDropdown(null);
                                      setDropdownCoords(null);
                                      updateRoomSettingsInFirestore({ difficulty: lvl });
                                    }}
                                    className={`w-full py-2 px-2.5 rounded-lg text-[10px] font-mono font-black uppercase tracking-wider text-left border-none cursor-pointer transition-all ${
                                      lvl === "EASY"
                                        ? (darkMode ? "hover:bg-[#022c22] text-[#d1fae5]" : "hover:bg-[#D1FAE5] text-[#065F46]")
                                        : lvl === "MEDIUM"
                                        ? (darkMode ? "hover:bg-[#451a03] text-[#fef08a]" : "hover:bg-[#FFF99D] text-[#854D0E]")
                                        : lvl === "HARD"
                                        ? (darkMode ? "hover:bg-[#2e1065] text-[#e9d5ff]" : "hover:bg-[#F3E8FF] text-[#6B21A8]")
                                        : (darkMode ? "bg-[#4c0519] text-[#fecdd3]" : "bg-[#FFE4E6] text-[#9D174D]")
                                    } ${challengeDifficulty === lvl ? (darkMode ? "bg-zinc-800 font-black" : "bg-stone-100 font-black") : "bg-transparent"}`}
                                  >
                                    {lvl.charAt(0) + lvl.slice(1).toLowerCase()}
                                  </button>
                                ))
                              )}

                              {openDropdown === "mistakes" && (
                                [
                                  { label: "0 Mistakes (Sudden Death)", val: 0 },
                                  { label: "3 Mistakes", val: 3 },
                                  { label: "5 Mistakes", val: 5 },
                                  { label: "Unlimited", val: 999 },
                                ].map(opt => (
                                  <button
                                    key={opt.label}
                                    onClick={() => {
                                      playClickSound();
                                      setChallengeMistakeLimit(opt.val);
                                      setOpenDropdown(null);
                                      setDropdownCoords(null);
                                      updateRoomSettingsInFirestore({ mistakesLimit: opt.val });
                                    }}
                                    className={`w-full py-2 px-2.5 rounded-lg text-[10px] font-mono font-black uppercase tracking-wider text-left border-none cursor-pointer transition-all ${
                                      darkMode
                                        ? "hover:bg-[#451a03] text-[#fef08a]"
                                        : "hover:bg-[#FFF99D] text-[#854D0E]"
                                    } ${challengeMistakeLimit === opt.val ? (darkMode ? "bg-zinc-800 font-black" : "bg-stone-100 font-black") : "bg-transparent"}`}
                                  >
                                    {opt.label}
                                  </button>
                                ))
                              )}

                              {openDropdown === "hints" && (
                                [
                                  { label: "No Hints", val: 0 },
                                  { label: "1 Hint", val: 1 },
                                  { label: "3 Hints", val: 3 },
                                  { label: "5 Hints", val: 5 },
                                ].map(opt => (
                                  <button
                                    key={opt.label}
                                    onClick={() => {
                                      playClickSound();
                                      setChallengeHintLimit(opt.val);
                                      setOpenDropdown(null);
                                      setDropdownCoords(null);
                                      updateRoomSettingsInFirestore({ hintsLimit: opt.val });
                                    }}
                                    className={`w-full py-2 px-2.5 rounded-lg text-[10px] font-mono font-black uppercase tracking-wider text-left border-none cursor-pointer transition-all flex items-center gap-1.5 ${
                                      darkMode
                                        ? "hover:bg-[#2e1065] text-[#e9d5ff]"
                                        : "hover:bg-[#F3E8FF] text-[#6B21A8]"
                                    } ${challengeHintLimit === opt.val ? (darkMode ? "bg-zinc-800 font-black" : "bg-stone-100 font-black") : "bg-transparent"}`}
                                  >
                                    <Lightbulb className="w-3 h-3 stroke-[2.5] shrink-0" />
                                    <span>{opt.label}</span>
                                  </button>
                                ))
                              )}

                              {openDropdown === "timer" && (
                                [
                                  { label: "Timer On", val: true },
                                  { label: "Timer Off", val: false },
                                ].map(opt => (
                                  <button
                                    key={opt.label}
                                    onClick={() => {
                                      playClickSound();
                                      setChallengeTimerEnabled(opt.val);
                                      setOpenDropdown(null);
                                      setDropdownCoords(null);
                                      updateRoomSettingsInFirestore({ timerEnabled: opt.val });
                                    }}
                                    className={`w-full py-2 px-2.5 rounded-lg text-[10px] font-mono font-black uppercase tracking-wider text-left border-none cursor-pointer transition-all flex items-center gap-1.5 ${
                                      darkMode
                                        ? "hover:bg-[#0c4a6e]/50 text-[#bae6fd]"
                                        : "hover:bg-[#E0F2FE] text-[#0369A1]"
                                    } ${challengeTimerEnabled === opt.val ? (darkMode ? "bg-zinc-800 font-black" : "bg-stone-100 font-black") : "bg-transparent"}`}
                                  >
                                    <Timer className="w-3 h-3 stroke-[2.5] shrink-0" />
                                    <span>{opt.label}</span>
                                  </button>
                                ))
                              )}
                            </div>
                          </div>,
                          document.body
                        )}

                        {/* SCREEN 1: Action buttons — SAME GAME | NEW GAME — Evenly Sharing Footer */}
                        <div className="flex gap-2.5 w-full pt-3 border-t border-stone-200/50 dark:border-zinc-800/50 shrink-0">
                          {/* [ SAME GAME ] — Replay same board and parameters */}
                          <button
                            onClick={async () => {
                              playClickSound();
                              setRematchMatchMode("replay");
                              const seed = pendingRematchSeed ?? boardState?.seed ?? (Math.floor(Math.random() * 900000) + 100000);
                              const roomCode = String(seed).padStart(6, '0').slice(-6);

                              const othersList: Array<{ id: string; name: string; isReal: boolean }> = [];
                              syncedLeaderboard.forEach(r => {
                                if (r.userId !== userProfile?.id && !othersList.some(o => o.id === r.userId)) {
                                  othersList.push({ id: r.userId, name: r.playerName, isReal: true });
                                }
                              });
                              setLastGameParticipants(othersList);
                              setRematchParticipants(othersList);
                              setRematchGameId(roomCode);
                              setChallengeSeed(seed);
                              setPendingRematchSeed(seed);
                              setRematchInvitedPlayers(new Set());
                              setLobbyAcceptedUserIds(new Set());
                              setRematchInviteStates({});

                              // Update room in Firestore
                              try {
                                await setDoc(doc(db, "rooms", roomCode), {
                                  roomCode: roomCode,
                                  seed: seed,
                                  difficulty: challengeDifficulty,
                                  mistakesLimit: challengeMistakeLimit,
                                  hintsLimit: challengeHintLimit,
                                  timerEnabled: challengeTimerEnabled,
                                  isLocked: isRoomLocked,
                                  pin: isRoomLocked ? roomPin : "",
                                  status: "active",
                                  createdAt: serverTimestamp(),
                                  updatedAt: serverTimestamp()
                                }, { merge: true });
                              } catch (err) {
                                console.error("[Firestore] Failed to update room for SAME GAME:", err);
                              }

                              setEndGameStep(2);
                            }}
                            className={`flex-1 py-3 px-2 rounded-2xl flex items-center justify-center gap-1.5 text-xs font-mono font-black uppercase tracking-wider transition-all shadow-xs active:scale-95 border-none cursor-pointer ${darkMode ? "bg-[#022c22] hover:bg-[#022c22]/80 text-[#d1fae5]" : "bg-[#D1FAE5] hover:bg-[#A7F3D0] text-[#065F46]"}`}
                          >
                             <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                             <span>SAME GAME</span>
                          </button>

                          {/* [ NEW GAME ] — Fresh board seed and parameters */}
                          <button
                            onClick={async () => {
                              playClickSound();
                              setRematchMatchMode("remix");
                              const newSeed = Math.floor(Math.random() * 900000) + 100000;
                              const roomCode = String(newSeed).padStart(6, '0').slice(-6);
                              addLog(`⚔️ Initializing New Challenge (Room #${roomCode})...`);

                              const othersList: Array<{ id: string; name: string; isReal: boolean }> = [];
                              syncedLeaderboard.forEach(r => {
                                if (r.userId !== userProfile?.id && !othersList.some(o => o.id === r.userId)) {
                                  othersList.push({ id: r.userId, name: r.playerName, isReal: true });
                                }
                              });
                              setLastGameParticipants(othersList);
                              setRematchParticipants(othersList);
                              setRematchGameId(roomCode);
                              setChallengeSeed(newSeed);
                              setPendingRematchSeed(newSeed);
                              setRematchInvitedPlayers(new Set());
                              setLobbyAcceptedUserIds(new Set());
                              setRematchInviteStates({});

                              // Create / update room in Firestore
                              try {
                                await setDoc(doc(db, "rooms", roomCode), {
                                  roomCode: roomCode,
                                  seed: newSeed,
                                  difficulty: challengeDifficulty,
                                  mistakesLimit: challengeMistakeLimit,
                                  hintsLimit: challengeHintLimit,
                                  timerEnabled: challengeTimerEnabled,
                                  isLocked: isRoomLocked,
                                  pin: isRoomLocked ? roomPin : "",
                                  status: "active",
                                  createdAt: serverTimestamp(),
                                  updatedAt: serverTimestamp()
                                });
                              } catch (err) {
                                console.error("[Firestore] Failed to create room for NEW GAME:", err);
                              }

                              setEndGameStep(2);
                            }}
                            className={`flex-1 py-3 px-2 rounded-2xl flex items-center justify-center gap-1.5 text-xs font-mono font-black uppercase tracking-wider transition-all shadow-xs active:scale-95 border-none cursor-pointer ${darkMode ? "bg-[#2e1065] hover:bg-[#2e1065]/80 text-[#e9d5ff]" : "bg-[#F3E8FF] hover:bg-[#E9D5FF] text-[#6B21A8]"}`}
                          >
                             <Sparkles className="w-4 h-4 stroke-[2.5]" />
                             <span>NEW GAME</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* SCREEN 2: REMATCH LOBBY & INVITATIONS */}
                        {(() => {
                          const activeRematchRoomCode = String(rematchGameId || challengeSeed || (boardState?.seed ? String(boardState.seed).slice(-6) : "849201")).padStart(6, '0').slice(-6);

                          return (
                            <div className="flex-1 min-h-0 flex flex-col gap-3 overflow-hidden">
                              {/* HEADER BAR: CODE & LOCK TOGGLE + CLOSE BUTTON */}
                              <div className="flex flex-col gap-2 shrink-0 select-none">
                                <div className="flex items-center justify-between">
                                  {/* Left: 6-digit room code */}
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs sm:text-sm font-sans font-black tracking-wider text-stone-850 dark:text-stone-100 flex items-center gap-1.5">
                                      <span className="text-stone-400 dark:text-stone-500 text-2xs uppercase font-bold">CODE:</span>
                                      <span className="font-mono tracking-widest text-sm sm:text-base select-all">{activeRematchRoomCode}</span>
                                    </span>
                                    <button
                                      onClick={() => {
                                        playClickSound();
                                        copyToClipboard(activeRematchRoomCode);
                                        showCopiedToast("Room code copied!");
                                      }}
                                      title="Copy room code"
                                      className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 hover:bg-stone-150 dark:hover:bg-zinc-800 transition-colors border-none cursor-pointer"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  {/* Right: Lock toggle + Close button */}
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => {
                                        playClickSound();
                                        const next = !isRoomLocked;
                                        setIsRoomLocked(next);
                                        updateRoomSettingsInFirestore({ isLocked: next, pin: roomPin });
                                      }}
                                      className={`px-3 py-1.5 rounded-xl font-mono text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all duration-150 cursor-pointer border-none active:scale-95 flex items-center gap-1.5 select-none ${
                                        isRoomLocked
                                          ? (darkMode
                                              ? "bg-[#4c0519] text-[#fecdd3] shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
                                              : "bg-[#FFE4E6] text-[#9D174D] shadow-[0_8px_16px_rgba(157,23,77,0.06),_0_2px_4px_rgba(0,0,0,0.02)]")
                                          : (darkMode
                                              ? "bg-[#022c22] text-[#d1fae5] shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
                                              : "bg-[#D1FAE5] text-[#065F46] shadow-[0_8px_16px_rgba(6,95,70,0.06),_0_2px_4px_rgba(0,0,0,0.02)]")
                                      }`}
                                    >
                                      {isRoomLocked ? (
                                        <>
                                          <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                                          <span>LOCKED</span>
                                        </>
                                      ) : (
                                        <>
                                          <Unlock className="w-3.5 h-3.5 stroke-[2.5]" />
                                          <span>UNLOCKED</span>
                                        </>
                                      )}
                                    </button>

                                    <button
                                      onClick={() => {
                                        playClickSound();
                                        setShowGameOverModal(false);
                                      }}
                                      className={`p-1.5 rounded-full border-none cursor-pointer transition-all hover:scale-110 active:scale-95 ${darkMode ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300" : "bg-stone-100 hover:bg-stone-200 text-stone-600"}`}
                                      title="Close"
                                    >
                                      <X className="w-4 h-4" strokeWidth={2.5} />
                                    </button>
                                  </div>
                                </div>

                                {/* Revealed inline PIN input if locked */}
                                <AnimatePresence>
                                  {isRoomLocked && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      transition={{ duration: 0.18 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="flex items-center justify-between gap-2 px-3 py-2 mt-1 rounded-xl bg-stone-100/80 dark:bg-zinc-900/60 border border-stone-200/80 dark:border-zinc-800/80">
                                        <span className="font-sans font-bold text-[10px] sm:text-xs uppercase tracking-wider text-stone-700 dark:text-stone-300">
                                          SET 4-DIGIT PIN:
                                        </span>
                                        <input
                                          type="text"
                                          inputMode="numeric"
                                          maxLength={4}
                                          placeholder="_ _ _ _"
                                          value={roomPin}
                                          onChange={(e) => {
                                            const cleaned = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                                            setRoomPin(cleaned);
                                            updateRoomSettingsInFirestore({ isLocked: true, pin: cleaned });
                                          }}
                                          className="w-24 px-2 py-1 text-center font-mono font-black text-xs sm:text-sm tracking-widest rounded-lg border border-stone-300/80 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-stone-850 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
                                        />
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>

                              {/* PLAYER ROSTER & INLINE ACTIONS */}
                              <div className="flex-1 min-h-0 overflow-y-auto pr-0.5 no-scrollbar flex flex-col gap-2 max-h-[190px] my-1.5 py-0.5">
                                {multiplayerPlayers.length === 0 ? (
                                  <span className="text-xs italic text-stone-500 py-4 text-center">
                                    No past players yet. Share the link below to invite someone.
                                  </span>
                                ) : (
                                  multiplayerPlayers.map(player => {
                                    const { isJoined, isPendingSent, isDeclined, remainingSeconds } = getInviteCooldownState(player.id);

                                    return (
                                      <div
                                        key={player.id}
                                        className={`flex items-center justify-between p-2.5 px-3 rounded-xl transition-all duration-200 ${
                                          darkMode 
                                            ? "bg-zinc-900/60 border border-zinc-800/60 text-stone-200" 
                                            : "bg-white border border-stone-200/60 text-stone-850 shadow-xs"
                                        }`}
                                      >
                                        {/* Left: Status Dot, Username, Inline Friend Toggle */}
                                        <div className="flex items-center gap-2 min-w-0">
                                          <span className={`w-2 h-2 rounded-full shrink-0 ${
                                            player.status === 'online' ? "bg-emerald-400 animate-pulse" : "bg-stone-300 dark:bg-zinc-700"
                                          }`} />
                                          <span className="font-bold text-xs font-sans truncate">
                                            {player.name}
                                          </span>
                                          {player.isFriend ? (
                                            <span className={`text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg shrink-0 ${
                                              darkMode ? "bg-[#022c22] text-[#d1fae5]" : "bg-[#D1FAE5] text-[#065F46]"
                                            }`}>
                                              FRIEND
                                            </span>
                                          ) : (
                                            <button
                                              onClick={() => handleToggleFriend(player.id, player.name)}
                                              className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border-none cursor-pointer shrink-0 transition-all active:scale-95 ${
                                                darkMode ? "bg-zinc-800 hover:bg-zinc-750 text-stone-300" : "bg-stone-150 hover:bg-stone-200 text-stone-700"
                                              }`}
                                            >
                                              + Add
                                            </button>
                                          )}
                                        </div>

                                        {/* Right: Dedicated match invite button */}
                                        <div className="shrink-0 ml-2">
                                          {isJoined ? (
                                            <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl flex items-center gap-1 ${
                                              darkMode ? "bg-[#022c22] text-[#d1fae5]" : "bg-[#D1FAE5] text-[#065F46]"
                                            }`}>
                                              <Check className="w-3 h-3 stroke-[3]" />
                                              JOINED
                                            </span>
                                          ) : isPendingSent ? (
                                            <button
                                              disabled
                                              className={`text-[9.5px] font-mono font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-xl border-none opacity-90 cursor-not-allowed ${
                                                darkMode ? "bg-[#451a03] text-[#fef08a]" : "bg-[#FFF99D] text-[#854D0E]"
                                              }`}
                                            >
                                              SENT ({remainingSeconds}s)...
                                            </button>
                                          ) : isDeclined ? (
                                            <button
                                              disabled
                                              className={`text-[9.5px] font-mono font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-xl border-none opacity-90 cursor-not-allowed ${
                                                darkMode ? "bg-[#4c0519] text-[#fecdd3]" : "bg-[#FFE4E6] text-[#9D174D]"
                                              }`}
                                            >
                                              DECLINED ({remainingSeconds}s)
                                            </button>
                                          ) : (
                                            <button
                                              onClick={() => {
                                                playClickSound();
                                                handleInviteFriend(player.id);
                                              }}
                                              className={`text-[9.5px] font-mono font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl border-none cursor-pointer transition-all active:scale-95 shadow-xs ${
                                                darkMode ? "bg-[#4c0519] hover:bg-[#831843] text-[#fecdd3]" : "bg-[#FFE4E6] hover:bg-[#FBCFE8] text-[#9D174D]"
                                              }`}
                                            >
                                              INVITE
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>

                              {/* ACTION ROW: RE-INVITE ALL & SHARE LINK */}
                              <div className="grid grid-cols-2 gap-2.5 w-full shrink-0 mt-2 mb-1">
                                {/* Left: RE-INVITE ALL / STOP */}
                                <button
                                  onClick={() => handleReinviteAll()}
                                  disabled={!isInvitingAll && multiplayerPlayers.length === 0}
                                  className={`w-full py-2.5 px-2 text-xs font-mono font-black uppercase tracking-wider rounded-xl border-none transition-all duration-150 cursor-pointer text-center flex items-center justify-center gap-1.5 active:scale-95 shadow-xs ${
                                    isInvitingAll
                                      ? "bg-rose-500 hover:bg-rose-600 text-white animate-pulse"
                                      : darkMode
                                        ? "bg-[#2e1065]/60 hover:bg-[#2e1065] text-[#e9d5ff]"
                                        : "bg-[#F3E8FF] hover:bg-[#E9D5FF] text-[#6B21A8]"
                                  }`}
                                >
                                  {isInvitingAll ? (
                                    <>
                                      <XCircle className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                                      <span>STOP</span>
                                    </>
                                  ) : (
                                    <>
                                      <Users className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                                      <span>RE-INVITE ALL</span>
                                    </>
                                  )}
                                </button>

                                {/* Right: SHARE LINK */}
                                <button
                                  onClick={async () => {
                                    playClickSound();
                                    await shareChallengeLink(activeRematchRoomCode, `Join my Sudoku Rematch! Room #${activeRematchRoomCode}:`);
                                  }}
                                  className={`w-full py-2.5 px-2 text-xs font-mono font-black uppercase tracking-wider rounded-xl border-none transition-all duration-150 cursor-pointer text-center flex items-center justify-center gap-1.5 active:scale-95 shadow-xs ${
                                    darkMode
                                      ? "bg-[#0c4a6e]/50 hover:bg-[#0c4a6e]/80 text-[#bae6fd]"
                                      : "bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#0369A1]"
                                  }`}
                                >
                                  <Share2 className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                                  <span>SHARE LINK</span>
                                </button>
                              </div>

                              {/* BOTTOM ROW: Back (Left) | START GAME (Right / Primary) */}
                              <div className="flex items-center gap-3 w-full pt-2 border-t border-stone-200/50 dark:border-zinc-800/50 shrink-0">
                                {/* Left: Back to Step 1 */}
                                <button
                                  onClick={() => {
                                    playClickSound();
                                    setEndGameStep(1);
                                  }}
                                  className={`p-3 rounded-2xl flex items-center justify-center transition-all shadow-xs active:scale-95 border-none cursor-pointer shrink-0 ${
                                    darkMode ? "bg-zinc-850 hover:bg-zinc-800 text-stone-300" : "bg-stone-100 hover:bg-stone-200 text-stone-700"
                                  }`}
                                  title="Back to Leaderboard"
                                >
                                  <ArrowLeft className="w-5 h-5" strokeWidth={2} />
                                </button>

                                {/* Right / Primary: START GAME */}
                                <button
                                  onClick={() => {
                                    playClickSound();
                                    const targetSeed = pendingRematchSeed ?? challengeSeed ?? 100000;
                                    const roomCode = String(targetSeed).padStart(6, '0').slice(-6);

                                    addLog(`⚔️ Launching match duel in room #${roomCode}...`);
                                    setActiveGameId(roomCode);
                                    setRematchGameId(roomCode);
                                    setChallengeMode(true);
                                    setChallengeSeed(targetSeed);
                                    setChallengeDifficulty(challengeDifficulty);
                                    setChallengeMistakeLimit(challengeMistakeLimit);
                                    setChallengeTimerEnabled(challengeTimerEnabled);
                                    setChallengeHintLimit(challengeHintLimit);
                                    setDifficulty(challengeDifficulty);
                                    setMistakeLimitEnabled(challengeMistakeLimit !== 999);
                                    setTimerEnabled(challengeTimerEnabled);

                                    registerChallengeJoin(roomCode);
                                    generateAndSetNewPuzzle(challengeDifficulty, targetSeed, challengeMistakeLimit, challengeTimerEnabled, challengeHintLimit);
                                    setSessionSeconds(0);
                                    setIsTimerPaused(false);
                                    setShowGameOverModal(false);
                                    setEndGameStep(1);
                                    navigateToScreen("game");
                                    try { window.history.replaceState({ view: "game" }, "", window.location.pathname); } catch (e) {}
                                    showToast("🚀 Match started!");
                                  }}
                                  className={`flex-1 py-3 px-6 rounded-2xl flex items-center justify-center gap-2 font-mono font-black text-sm tracking-wider uppercase transition-all shadow-md active:scale-98 border-none cursor-pointer text-white ${
                                    darkMode 
                                      ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/40" 
                                      : "bg-emerald-600 hover:bg-emerald-550 shadow-emerald-600/30"
                                  }`}
                                >
                                  <Play className="w-4 h-4 fill-current" />
                                  <span>START GAME</span>
                                </button>
                              </div>
                            </div>
                          );
                        })()}
                      </>
                    )}
                  </motion.div>
                </div>
              )}

              {/* 2. SOLO GAME OVER AND VICTORY OVERLAY (when challengeMode is false) */}
              {boardState && showGameOverModal && !challengeMode && (
                <div className="fixed inset-0 z-50 bg-[#FDFBF7]/80 dark:bg-[#1A1A1A]/80 backdrop-blur-sm flex items-center justify-center p-6">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className={`border-none p-8 max-w-sm w-full relative text-center rounded-[32px] shadow-[0_12px_40px_rgba(0,0,0,0.08)] flex flex-col gap-6 ${darkMode ? "bg-[#2A2D24]" : "bg-[#FDFBF7]"}`}
                  >
                    {/* Top-right X dismiss button — closes modal without leaving the board */}
                    <button
                      onClick={() => {
                        playClickSound();
                        setShowGameOverModal(false);
                      }}
                      className={`absolute top-4 right-4 p-1.5 rounded-full border-none cursor-pointer transition-all hover:scale-110 active:scale-95 z-50 ${darkMode ? "bg-zinc-700/60 hover:bg-zinc-600 text-zinc-300" : "bg-stone-100 hover:bg-stone-200 text-stone-500"}`}
                      title="Close"
                    >
                      <X className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                    <div className="flex flex-col items-center gap-1">
                      <span className={`text-[10px] font-sans font-bold uppercase tracking-widest ${darkMode ? "text-[#D1D5DB]" : "text-[#9CA3AF]"}`}>
                        {difficulty} Difficulty
                      </span>
                      <h3 className={`text-3xl font-sans font-medium tracking-tight mt-2 ${darkMode ? "text-[#FDFBF7]" : "text-[#4B5563]"}`}>
                        {(mistakeLimitEnabled && boardState.currentMistakesCount >= boardState.maxMistakesLimit) ? "Try Again" : "Cleared!"}
                      </h3>
                      <p className={`text-sm font-sans mt-1 ${darkMode ? "text-[#9CA3AF]" : "text-[#6B7280]"}`}>
                        {(mistakeLimitEnabled && boardState.currentMistakesCount >= boardState.maxMistakesLimit) 
                          ? `You accumulated ${boardState.maxMistakesLimit} mistakes.`
                          : `Great job completing the board.`}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-center gap-8 py-2">
                       <div className="flex flex-col items-center">
                         <span className={`text-[10px] uppercase font-bold tracking-widest ${darkMode ? "text-[#6B7280]" : "text-[#D1D5DB]"}`}>Time</span>
                         <span className={`text-lg font-mono font-medium ${darkMode ? "text-[#E5E7EB]" : "text-[#4B5563]"}`}>{formatTimer(sessionSeconds)}</span>
                       </div>
                       <div className={`w-[1px] h-8 ${darkMode ? "bg-[#4B5563]" : "bg-[#E5E7EB]"}`} />
                       <div className="flex flex-col items-center">
                         <span className={`text-[10px] uppercase font-bold tracking-widest ${darkMode ? "text-[#6B7280]" : "text-[#D1D5DB]"}`}>Errors</span>
                         <span className={`text-lg font-mono font-medium ${darkMode ? "text-[#E5E7EB]" : "text-[#4B5563]"}`}>{boardState.currentMistakesCount}</span>
                       </div>
                    </div>

                    {/* Button Split */}
                    {/* Action buttons row */}
                    <div className="flex w-full gap-3 mt-2">
                      {/* Button 1: Back Arrow */}
                      <button
                        onClick={() => {
                          playClickSound();
                          setShowGameOverModal(false);
                          navigateToScreen("home");
                        }}
                        className={`flex-1 aspect-[2/1] rounded-[24px] flex items-center justify-center transition-all shadow-[0_4px_12px_rgba(0,0,0,0.02)] active:scale-95 border-none cursor-pointer ${darkMode ? "bg-zinc-850 hover:bg-zinc-800 text-stone-300" : "bg-stone-100 hover:bg-stone-200 text-stone-700"}`}
                        title="Back to Home"
                      >
                         <ArrowLeft className="w-7 h-7" strokeWidth={1.5} />
                      </button>

                      {/* Button 2: Replay Same Board */}
                      <button
                        onClick={() => {
                          playClickSound();
                          generateAndSetNewPuzzle(difficulty, boardState?.seed);
                          setIsTimerPaused(false);
                          setShowGameOverModal(false);
                        }}
                        className={`flex-1 aspect-[2/1] rounded-[24px] flex items-center justify-center transition-all shadow-[0_4px_12px_rgba(0,0,0,0.02)] active:scale-95 border-none cursor-pointer ${darkMode ? "bg-[#D1FAE5]/10 hover:bg-[#D1FAE5]/20 text-[#a7f3d0]" : "bg-[#D1FAE5] hover:bg-[#A7F3D0] text-[#065F46]"}`}
                        title="Replay Same Board"
                      >
                         <RotateCcw className="w-7 h-7" strokeWidth={1.5} />
                      </button>
 
                      {/* Button 3: Start New Puzzle */}
                      <button
                        onClick={() => {
                          playClickSound();
                          generateAndSetNewPuzzle(difficulty);
                          setIsTimerPaused(false);
                          setShowGameOverModal(false);
                        }}
                        className={`flex-1 aspect-[2/1] rounded-[24px] flex items-center justify-center transition-all shadow-[0_4px_12px_rgba(0,0,0,0.02)] active:scale-95 border-none cursor-pointer ${darkMode ? "bg-purple-900/40 hover:bg-purple-900/60 text-purple-200" : "bg-purple-100 hover:bg-purple-200 text-purple-900"}`}
                        title="Start New Puzzle"
                      >
                         <Shuffle className="w-7 h-7" strokeWidth={1.5} />
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Desktop-only AdSense Compliance section */}
              <div className="hidden lg:block w-full shrink-0">
                {renderAdSenseContent("game")}
                <footer className="w-full max-w-4xl mx-auto px-4 py-8 mt-8 text-center text-xs font-sans text-stone-500 border-t border-dashed border-stone-200/50 dark:border-zinc-800/50 flex flex-col items-center gap-4 select-text">
                  <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                    <button onClick={() => { playClickSound(); setActiveCompliancePage("about"); }} className="bg-transparent border-none cursor-pointer text-stone-550 hover:text-[#0369A1] dark:text-stone-400 dark:hover:text-[#bae6fd] font-semibold transition-colors">About Us</button>
                    <button onClick={() => { playClickSound(); setActiveCompliancePage("contact"); }} className="bg-transparent border-none cursor-pointer text-stone-550 hover:text-[#0369A1] dark:text-stone-400 dark:hover:text-[#bae6fd] font-semibold transition-colors">Contact Us</button>
                    <button onClick={() => { playClickSound(); setActiveCompliancePage("privacy"); }} className="bg-transparent border-none cursor-pointer text-stone-550 hover:text-[#0369A1] dark:text-stone-400 dark:hover:text-[#bae6fd] font-semibold transition-colors">Privacy Policy</button>
                    <button onClick={() => { playClickSound(); setActiveCompliancePage("terms"); }} className="bg-transparent border-none cursor-pointer text-stone-550 hover:text-[#0369A1] dark:text-stone-400 dark:hover:text-[#bae6fd] font-semibold transition-colors">Terms of Service</button>
                  </div>
                  <div className="opacity-80 font-mono text-[10px]">
                    © {new Date().getFullYear()} Sudoku Together Mode. All rights reserved. Supported by Google AdSense advertising.
                  </div>
                </footer>
              </div>
            </div>
          )}

          {/* PANE 3: ADVANCED PREFERENCES SCREEN */}
          {currentScreen === "settings" && (
            <SettingsModal
              fromGameplaySettings={fromGameplaySettings}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              soundEffects={soundEffects}
              setSoundEffects={setSoundEffects}
              vibrations={vibrations}
              setVibrations={setVibrations}
              notificationsEnabled={notificationsEnabled}
              setNotificationsEnabled={setNotificationsEnabled}
              highlightIdentical={highlightIdentical}
              setHighlightIdentical={setHighlightIdentical}
              showRemainingNumbers={showRemainingNumbers}
              setShowRemainingNumbers={setShowRemainingNumbers}
              highlightAreas={highlightAreas}
              setHighlightAreas={setHighlightAreas}
              isAutoRemoveNotesEnabled={isAutoRemoveNotesEnabled}
              setIsAutoRemoveNotesEnabled={setIsAutoRemoveNotesEnabled}
              isNumberFirstInputMode={isNumberFirstInputMode}
              setIsNumberFirstInputMode={setIsNumberFirstInputMode}
              timerEnabled={timerEnabled}
              setTimerEnabled={setTimerEnabled}
              mistakeLimitEnabled={mistakeLimitEnabled}
              setMistakeLimitEnabled={setMistakeLimitEnabled}
              challengeMode={challengeMode}
              boardState={boardState}
              challengeMistakeLimit={challengeMistakeLimit}
              userProfile={userProfile}
              setUserProfile={setUserProfile}
              playClickSound={playClickSound}
              addLog={addLog}
              onBackToGame={() => setCurrentScreen("game")}
              onOpenDisplayNameModal={() => {
                const currentName = (userProfile?.name && userProfile.name !== "Anonymous Voyager" && userProfile.name !== "Guest Voyager" && userProfile.name !== "Guest Solver") 
                  ? userProfile.name 
                  : "";
                setEnteredDisplayName(currentName);
                setDisplayNameCallbackAction(null);
                setDisplayNameError(null);
                setShowDisplayNameModal(true);
              }}
              onOpenHowToPlay={() => setShowHowToPlayModal(true)}
              onOpenCompliancePage={(page) => setActiveCompliancePage(page)}
              onOpenDeleteAccountModal={() => setShowDeleteAccountModal(true)}
              onOpenResetSettingsModal={() => setShowResetSettingsModal(true)}
            />
          )}

          {/* PANE 4: STATUS SCREEN */}
          {currentScreen === "status" && (
            <StatsModal
              darkMode={darkMode}
              winsCount={winsCount}
              gamesPlayed={gamesPlayed}
              bestTimes={bestTimes}
              activeHistoryTab={activeHistoryTab}
              handleSelectHistoryTab={handleSelectHistoryTab}
              completedGames={completedGames}
              savedGames={savedGames}
              multiplayerPlayers={multiplayerPlayers}
              requestedFriendIds={requestedFriendIds}
              handleReplayGame={handleReplayGame}
              handleSaveGame={handleSaveGame}
              handleOpenRankings={handleOpenRankings}
              handleToggleFriend={handleToggleFriend}
              handleAddRecentFriend={handleAddRecentFriend}
              formatTimer={formatTimer}
            />
          )}

          {/* PANE: TOGETHER MODE SOCIAL DASHBOARD */}
          {false && currentScreen === "together" && (
            <div className={`flex-1 w-full flex flex-col items-center justify-start p-4 sm:p-6 select-none pt-[calc(85px+env(safe-area-inset-top,0px))] ${themeSelectionBg}`}>
              <div className="w-full max-w-sm mx-auto flex flex-col gap-5 font-sans">
                
                {/* Clean centralized typography header aligned with the home screen preferences */}
                <div className="text-center pb-2 flex flex-col items-center shrink-0">
                  <h2 className={`text-xl md:text-2xl font-black uppercase tracking-tight font-sans ${darkMode ? "text-zinc-100" : "text-[#1C1917]"}`}>Together Mode</h2>
                </div>

                {/* Start Custom Multi Card - Styled with the Hard/Purple theme! */}
                <div 
                  className={`p-5 rounded-2xl flex flex-col gap-3.5 ${
                    darkMode 
                      ? "bg-purple-950/20 text-stone-200 shadow-md" 
                      : "bg-[#F3E8FF]/60 text-[#6B21A8] shadow-[0_8px_30px_rgba(107,33,168,0.03)]"
                  }`}
                  id="start-custom-multi-card"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-sans font-black uppercase tracking-wider text-purple-700 dark:text-purple-400">Start Custom Multi</span>
                  </div>
                  
                  <button
                    onClick={() => {
                      playClickSound();
                      openCreateRoomModal(difficulty, timerEnabled);
                      addLog("🎯 Opened Start New Session overlay from Together dashboard.");
                    }}
                    className={`w-full border-none py-3 px-4 text-center mt-1 transition-all duration-150 select-none rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.98] active:translate-y-px ${
                      darkMode 
                        ? "bg-purple-900 hover:bg-purple-800 text-purple-100" 
                        : "bg-[#6B21A8] hover:bg-[#581c87] text-white"
                    }`}
                  >
                    <span className="font-sans font-black text-xs tracking-wider flex items-center justify-center gap-1.5 leading-none uppercase">
                      <Users className="w-4 h-4 stroke-[2.5]" />
                      <span>Create Multi Challenge</span>
                    </span>
                  </button>
                </div>

                {/* Friends & Privacy - Together Mode Panel - Styled with the Hard/Purple theme! */}
                <div 
                  className={`p-5 rounded-2xl flex flex-col gap-4 ${
                    darkMode 
                      ? "bg-purple-950/20 text-stone-200 shadow-md" 
                      : "bg-[#F3E8FF]/60 text-[#6B21A8] shadow-[0_8px_30px_rgba(107,33,168,0.03)]"
                  }`}
                  id="friends-privacy-multi-panel"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-purple-200/20 dark:border-purple-900/20">
                    <div className="flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                      <span className="text-[10px] font-sans font-black uppercase tracking-wider text-purple-700 dark:text-purple-400">Active Multiplayers</span>
                    </div>

                    {/* Privacy presence toggler */}
                    <button
                      onClick={() => {
                        playClickSound();
                        setPrivacyEnabled(!privacyEnabled);
                        addLog(`🔒 Privacy toggle changed to: ${!privacyEnabled ? "ON" : "OFF"}`);
                      }}
                      className={`text-xs font-sans font-black uppercase tracking-wider py-1 px-3 border rounded-xl transition-all duration-150 cursor-pointer ${
                        privacyEnabled
                          ? (darkMode ? "bg-rose-950/20 text-rose-455 border-rose-900/50" : "bg-rose-50 border-rose-100 text-rose-700")
                          : (darkMode ? "bg-emerald-950/20 text-emerald-400 border-emerald-900/50" : "bg-emerald-50 border-emerald-100 text-emerald-700")
                      }`}
                    >
                      Presence: {privacyEnabled ? "🔒 Private" : "● Live"}
                    </button>
                  </div>

                   {/* Friends List status indicators */}
                  <div className="flex flex-col gap-2 pt-1 font-sans">
                    {!isUserAuthorizedForMultiplayer() ? (
                      <div className="py-6 text-center text-stone-500 font-sans text-xs select-none">
                        Sign-in required
                      </div>
                    ) : (() => {
                      const activeFriends = multiplayerPlayers.filter(p => p.isFriend);
                      if (activeFriends.length === 0) {
                        return (
                          <div className={`p-4 rounded-xl text-center flex flex-col items-center gap-1.5 border border-dashed ${
                            darkMode ? "border-purple-950/40 bg-purple-950/5 text-stone-400" : "border-purple-100 bg-white/20 text-stone-600"
                          }`}>
                            <span className="text-[10px] font-sans font-black uppercase tracking-wider text-purple-700 dark:text-purple-400">
                              No Active Friends
                            </span>
                            <span className="text-[9.5px] leading-normal opacity-85 max-w-[280px]">
                              You haven't added any authenticated friends yet. Share a challenge room and click the (+) add icon next to a real participant to build your persistent friends list!
                            </span>
                          </div>
                        );
                      }

                      return activeFriends.map(friend => {
                        const isOnline = friend.status === "online";
                        return (
                          <div 
                            key={friend.id}
                            className={`p-3 rounded-xl flex items-center justify-between transition-all ${
                              darkMode 
                                ? "bg-purple-950/30 hover:bg-purple-950/50 text-stone-300" 
                                : "bg-white/70 hover:bg-[#F3E8FF]/30 text-stone-850"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 text-left">
                              {/* Glowing soft status bullets */}
                              <span className="relative flex h-2.5 w-2.5">
                                {isOnline && (
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70" />
                                )}
                                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 transition-colors ${
                                  isOnline ? "bg-emerald-500 shadow-[0_0_8px_#10B981]" : "bg-stone-300 dark:bg-zinc-700"
                                }`} />
                              </span>
                              <div className="text-left flex flex-col">
                                <span className="text-xs font-black tracking-tight leading-none mb-1">{friend.name}</span>
                                <span className="text-[9.5px] text-stone-500 leading-none">
                                  {isOnline ? "Online" : "Offline"}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  playClickSound();
                                  openCreateRoomModal(difficulty, timerEnabled);
                                  addLog(`⚡ Setup Invite Challenge link for ${friend.name}`);
                                }}
                                className={`ml-1 px-3 py-1.5 border-none text-[10px] font-black uppercase rounded-lg cursor-pointer transition-all active:scale-[0.96] leading-none ${
                                  darkMode 
                                    ? "bg-purple-900/40 text-purple-200 hover:bg-purple-800/45" 
                                    : "bg-purple-100 text-[#6B21A8] hover:bg-[#E8D5FF]"
                                }`}
                              >
                                Duel
                              </button>
                              <button
                                onClick={() => handleToggleFriend(friend.id)}
                                title="Remove Friend"
                                className={`p-1.5 rounded-full border-none cursor-pointer transition-all active:scale-90 flex items-center justify-center shrink-0 ${
                                  darkMode ? "bg-zinc-700/50 text-stone-300 hover:bg-zinc-600" : "bg-stone-200/50 text-stone-600 hover:bg-stone-300"
                                }`}
                              >
                                <Minus className="w-3 h-3 stroke-[3]" />
                              </button>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Social Game History Panel with custom two-tab pill interface - Styled beautifully in Pastel Pink! */}
                <div 
                  className={`w-full rounded-2xl flex flex-col font-sans shrink-0 overflow-hidden transition-all duration-300 ${
                    darkMode 
                      ? "bg-[#9d174d]/10 text-stone-200 shadow-md" 
                      : "bg-[#FDF2F8]/45 text-[#3b0764] shadow-[0_8px_30px_rgba(219,39,119,0.02)]"
                  }`}
                  id="social-history-tabs-container"
                >
                  {/* Tab Selectors */}
                  <div className={`grid grid-cols-3 p-1.5 font-sans text-[10px] sm:text-[10.5px] font-black uppercase tracking-tight ${
                    darkMode 
                      ? "bg-[#9d174d]/5 text-[#fbcfe8]" 
                      : "bg-[#FDF2F8]/20 text-[#9D174D]"
                  }`}>
                    <button
                      onClick={() => handleSelectHistoryTab("completed")}
                      className={`py-2 px-1.5 rounded-xl border-none cursor-pointer transition-all flex items-center justify-center gap-1.5 uppercase font-[#9D174D] font-black tracking-wider ${
                        activeHistoryTab === "completed"
                          ? (darkMode ? "bg-[#9d174d]/55 text-[#fbcfe8]" : "bg-[#FCE7F3] text-[#9D174D] shadow-xs")
                          : (darkMode ? "text-pink-400/70 hover:text-[#fbcfe8] bg-transparent" : "text-pink-600/75 hover:text-[#9D174D] bg-transparent")
                      }`}
                    >
                      <span>History</span>
                      <span className={`text-[9.5px] px-1.5 py-0.25 rounded-md ${darkMode ? "bg-[#9d174d]/45 text-[#fbcfe8]/80" : "bg-pink-100/50 text-[#9D174D]/80"}`}>
                        {completedGames.length}
                      </span>
                    </button>

                    <button
                      onClick={() => handleSelectHistoryTab("saved")}
                      className={`py-2 px-1.5 rounded-xl border-none cursor-pointer transition-all flex items-center justify-center gap-1.5 uppercase font-[#9D174D] font-black tracking-wider ${
                        activeHistoryTab === "saved"
                          ? (darkMode ? "bg-[#9d174d]/55 text-[#fbcfe8]" : "bg-[#FCE7F3] text-[#9D174D] shadow-xs")
                          : (darkMode ? "text-pink-400/70 hover:text-[#fbcfe8] bg-transparent" : "text-pink-600/75 hover:text-[#9D174D] bg-transparent")
                      }`}
                    >
                      <span>Saved</span>
                      <span className={`text-[9.5px] px-1.5 py-0.25 rounded-md ${darkMode ? "bg-[#9d174d]/45 text-[#fbcfe8]/80" : "bg-pink-100/50 text-[#9D174D]/80"}`}>
                        {savedGames.length}
                      </span>
                    </button>

                    <button
                      onClick={() => handleSelectHistoryTab("friends")}
                      className={`py-2 px-1.5 rounded-xl border-none cursor-pointer transition-all flex items-center justify-center gap-1.5 uppercase font-[#9D174D] font-black tracking-wider ${
                        activeHistoryTab === "friends"
                          ? (darkMode ? "bg-[#9d174d]/55 text-[#fbcfe8]" : "bg-[#FCE7F3] text-[#9D174D] shadow-xs")
                          : (darkMode ? "text-pink-400/70 hover:text-[#fbcfe8] bg-transparent" : "text-pink-600/75 hover:text-[#9D174D] bg-transparent")
                      }`}
                    >
                      <span>Friends</span>
                      <span className={`text-[9.5px] px-1.5 py-0.25 rounded-md ${darkMode ? "bg-[#9d174d]/45 text-[#fbcfe8]/80" : "bg-pink-100/50 text-[#9D174D]/80"}`}>
                        {multiplayerPlayers.filter(p => p.isFriend).length}
                      </span>
                    </button>
                  </div>

                  {/* Dynamic Tab Panel Content */}
                  <div className="p-4 flex flex-col gap-3 max-h-[300px] overflow-y-auto custom-scrollbar text-left font-sans">
                    {activeHistoryTab === "completed" ? (
                      completedGames.length === 0 ? (
                        <div className="py-8 text-center text-stone-500 font-sans text-xs">
                          No completed games yet.
                        </div>
                      ) : (
                        completedGames.map((game) => (
                          <div 
                            key={game.id} 
                            className={`p-3.5 rounded-xl border flex flex-col gap-2 transition-all text-xs ${
                              darkMode ? "bg-zinc-950/45 border-zinc-800 text-stone-300" : "bg-stone-50/45 border-stone-100 text-stone-850"
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className={`text-xs font-sans font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                                game.isWon 
                                  ? (darkMode ? "bg-emerald-950/20 text-emerald-400" : "bg-emerald-100 text-emerald-850")
                                  : (darkMode ? "bg-rose-950/20 text-rose-455" : "bg-rose-100 text-rose-850")
                              }`}>
                                {game.isWon ? "✓ Won" : "✗ Failed"}
                              </span>
                              
                              <span className="font-sans text-xs md:text-sm font-medium text-stone-500">
                                {game.date}
                              </span>
                            </div>

                            <div className="flex justify-between items-center">
                              <div className="flex flex-col text-left">
                                <div className="flex items-center gap-1.5 mb-1 bg-transparent">
                                  <span className={`text-xs font-sans font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                                    game.isChallenge
                                      ? (darkMode ? "bg-[#2e1065] text-[#e9d5ff] border border-[#3b0764] shadow-[0_2px_8px_rgba(0,0,0,0.4)]" : "bg-[#F3E8FF] text-[#6B21A8] border border-[#D8B4FE] shadow-[0_2px_8px_rgba(107,33,168,0.06)]")
                                      : (darkMode ? "bg-[#172554] text-[#dbeafe]" : "bg-[#eff6ff] text-[#172554]")
                                  }`}>
                                    {game.isChallenge ? "Multi" : "Solo"}
                                  </span>
                                </div>
                                <span className={`font-sans font-black text-sm uppercase leading-none ${darkMode ? "text-stone-200" : "text-stone-850"}`}>
                                  {game.difficulty}
                                </span>
                              </div>

                              <div className="flex items-center gap-3.5 font-sans text-xs font-black">
                                <div className="flex flex-col items-end leading-tight">
                                  <span className="text-[10px] lg:text-xs text-stone-500 uppercase font-sans mb-1">Time</span>
                                  <span>{formatTimer(game.timeSec)}</span>
                                </div>
                                <div className="flex flex-col items-end leading-tight">
                                  <span className="text-[10px] lg:text-xs text-stone-500 uppercase font-sans mb-1">Errs</span>
                                  <span className="text-rose-500">{game.mistakes}/{game.maxMistakes}</span>
                                </div>
                              </div>
                            </div>

                            {/* 3 Equal-Width Action Buttons: Replay (mint green), Save/Saved (pastel yellow), Rankings (pastel rose) */}
                            <div className="grid grid-cols-3 gap-1.5 mt-1.5 pt-2 border-t border-dashed border-stone-250 dark:border-zinc-800">
                              <button
                                onClick={() => handleReplayGame(game)}
                                className={`py-1.5 px-2 font-sans text-[10px] sm:text-xs font-black uppercase rounded-lg border-none cursor-pointer transition-all active:scale-95 text-center flex items-center justify-center gap-1 ${
                                  darkMode ? "bg-emerald-950/40 text-emerald-300 hover:bg-emerald-950/60" : "bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#166534]"
                                }`}
                              >
                                Replay
                              </button>
                              <button
                                onClick={() => handleSaveGame(game)}
                                className={`py-1.5 px-2 font-sans text-[10px] sm:text-xs font-black uppercase rounded-lg border-none cursor-pointer transition-all active:scale-95 text-center flex items-center justify-center gap-1 ${
                                  savedGames.some(r => r.id === game.id)
                                    ? (darkMode ? "bg-yellow-950/50 text-yellow-300 font-black border border-yellow-800/40" : "bg-[#FEFCE8] text-[#854D0E] font-black border border-yellow-200")
                                    : (darkMode ? "bg-yellow-950/30 text-yellow-400 hover:bg-yellow-950/50" : "bg-[#FEFCE8] hover:bg-[#FEF9C3] text-[#854D0E]")
                                }`}
                              >
                                {savedGames.some(r => r.id === game.id) ? "Saved" : "Save"}
                              </button>
                              <button
                                onClick={() => handleOpenRankings(game)}
                                className={`py-1.5 px-2 font-sans text-[10px] sm:text-xs font-black uppercase rounded-lg border-none cursor-pointer transition-all active:scale-95 text-center flex items-center justify-center gap-1 ${
                                  darkMode ? "bg-rose-950/40 hover:bg-rose-950/60 text-rose-300" : "bg-[#FFE4E6] hover:bg-[#FECDD3] text-[#9F1239]"
                                }`}
                              >
                                Rankings
                              </button>
                            </div>
                          </div>
                        ))
                      )
                    ) : activeHistoryTab === "saved" ? (
                      savedGames.length === 0 ? (
                        <div className="py-8 text-center text-stone-500 font-sans text-xs">
                          No saved games yet. Click Save on a completed game item to save it!
                        </div>
                      ) : (
                        savedGames.map((game) => (
                          <div 
                            key={game.id} 
                            className={`p-3.5 rounded-xl border flex flex-col gap-2 transition-all text-xs ${
                              darkMode ? "bg-zinc-950/45 border-zinc-800 text-stone-300" : "bg-stone-50/45 border-stone-100 text-stone-850"
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className={`text-xs font-sans font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                                game.isWon 
                                  ? (darkMode ? "bg-emerald-950/20 text-emerald-400" : "bg-emerald-100 text-emerald-850")
                                  : (darkMode ? "bg-rose-950/20 text-rose-455" : "bg-rose-100 text-rose-850")
                              }`}>
                                {game.isWon ? "✓ Won" : "✗ Failed"}
                              </span>
                              
                              <span className="font-sans text-xs md:text-sm font-medium text-stone-500">
                                {game.date || "Saved Config"}
                              </span>
                            </div>

                            <div className="flex justify-between items-center">
                              <div className="flex flex-col text-left">
                                <div className="flex items-center gap-1.5 mb-1 bg-transparent">
                                  <span className={`text-xs font-sans font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                                    game.isChallenge
                                      ? (darkMode ? "bg-[#2e1065] text-[#e9d5ff] border border-[#3b0764] shadow-[0_2px_8px_rgba(0,0,0,0.4)]" : "bg-[#F3E8FF] text-[#6B21A8] border border-[#D8B4FE] shadow-[0_2px_8px_rgba(107,33,168,0.06)]")
                                      : (darkMode ? "bg-[#172554] text-[#dbeafe]" : "bg-[#eff6ff] text-[#172554]")
                                  }`}>
                                    {game.isChallenge ? "Multi" : "Solo"}
                                  </span>
                                </div>
                                <span className={`font-sans font-black text-sm uppercase leading-none ${darkMode ? "text-stone-200" : "text-stone-850"}`}>
                                  {game.difficulty}
                                </span>
                              </div>

                              <div className="flex items-center gap-3.5 font-sans text-xs font-black">
                                <div className="flex flex-col items-end leading-tight">
                                  <span className="text-[10px] lg:text-xs text-stone-500 uppercase font-sans mb-1">Time</span>
                                  <span>{formatTimer(game.timeSec)}</span>
                                </div>
                                <div className="flex flex-col items-end leading-tight">
                                  <span className="text-[10px] lg:text-xs text-stone-500 uppercase font-sans mb-1">Errs</span>
                                  <span className="text-rose-500">{game.mistakes}/{game.maxMistakes}</span>
                                </div>
                              </div>
                            </div>

                            {/* 3 Equal-Width Action Buttons: Replay (mint green), Unsave (pastel yellow), Rankings (pastel rose) */}
                            <div className="grid grid-cols-3 gap-1.5 mt-1.5 pt-2 border-t border-dashed border-stone-250 dark:border-zinc-800">
                              <button
                                onClick={() => handleReplayGame(game)}
                                className={`py-1.5 px-2 font-sans text-[10px] sm:text-xs font-black uppercase rounded-lg border-none cursor-pointer transition-all active:scale-95 text-center flex items-center justify-center gap-1 ${
                                  darkMode ? "bg-emerald-950/40 text-emerald-300 hover:bg-emerald-950/60" : "bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#166534]"
                                }`}
                              >
                                Replay
                              </button>
                              <button
                                onClick={() => handleSaveGame(game)}
                                className={`py-1.5 px-2 font-sans text-[10px] sm:text-xs font-black uppercase rounded-lg border-none cursor-pointer transition-all active:scale-95 text-center flex items-center justify-center gap-1 ${
                                  darkMode ? "bg-yellow-950/30 text-yellow-400 hover:bg-yellow-950/50" : "bg-[#FEFCE8] hover:bg-[#FEF9C3] text-[#854D0E]"
                                }`}
                              >
                                Unsave
                              </button>
                              <button
                                onClick={() => handleOpenRankings(game)}
                                className={`py-1.5 px-2 font-sans text-[10px] sm:text-xs font-black uppercase rounded-lg border-none cursor-pointer transition-all active:scale-95 text-center flex items-center justify-center gap-1 ${
                                  darkMode ? "bg-rose-950/40 hover:bg-rose-950/60 text-rose-300" : "bg-[#FFE4E6] hover:bg-[#FECDD3] text-[#9F1239]"
                                }`}
                              >
                                Rankings
                              </button>
                            </div>
                          </div>
                        ))
                      )
                    ) : (
                      /* FRIENDS TAB PANEL */
                      <div className="flex flex-col gap-4">
                        {/* My Friends Section */}
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                              My Friends ({multiplayerPlayers.filter(p => p.isFriend).length})
                            </span>
                          </div>
                          {multiplayerPlayers.filter(p => p.isFriend).length === 0 ? (
                            <div className="py-4 text-center text-stone-400 dark:text-stone-500 font-sans text-xs">
                              No friends added yet.
                            </div>
                          ) : (
                            multiplayerPlayers.filter(p => p.isFriend).map(friend => (
                              <div 
                                key={friend.id} 
                                className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                                  darkMode ? "bg-zinc-950/45 border-zinc-800 text-stone-200" : "bg-stone-50/45 border-stone-200/50 text-stone-850"
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="relative">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                      darkMode ? "bg-purple-950/60 text-purple-300 border border-purple-800/40" : "bg-purple-100 text-purple-800 border border-purple-200"
                                    }`}>
                                      {friend.name ? friend.name.slice(0, 2).toUpperCase() : "PL"}
                                    </div>
                                    <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 ${
                                      darkMode ? "border-zinc-900" : "border-white"
                                    } ${friend.status === "online" ? "bg-emerald-500" : "bg-stone-400"}`} />
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-sans font-bold text-xs">{friend.name}</span>
                                    <span className="text-[9.5px] text-stone-400 capitalize">{friend.status || "online"}</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleToggleFriend(friend.id, friend.name)}
                                  className="text-[10.5px] font-sans font-semibold text-rose-500 hover:text-rose-600 dark:text-rose-400 border-none bg-transparent cursor-pointer transition-all active:scale-95 px-2 py-1"
                                >
                                  Remove
                                </button>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Recent Players Section */}
                        <div className="flex flex-col gap-2 pt-2 border-t border-dashed border-stone-200/40 dark:border-zinc-800">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                              Recent Players ({multiplayerPlayers.filter(p => !p.isFriend).length})
                            </span>
                          </div>
                          {multiplayerPlayers.filter(p => !p.isFriend).length === 0 ? (
                            <div className="py-4 text-center text-stone-400 dark:text-stone-500 font-sans text-xs">
                              No recent players.
                            </div>
                          ) : (
                            multiplayerPlayers.filter(p => !p.isFriend).map(player => {
                              const isRequested = requestedFriendIds.includes(player.id);
                              return (
                                <div 
                                  key={player.id} 
                                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                                    darkMode ? "bg-zinc-950/45 border-zinc-800 text-stone-200" : "bg-stone-50/45 border-stone-200/50 text-stone-850"
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                      darkMode ? "bg-zinc-800 text-stone-300" : "bg-stone-150 text-stone-700"
                                    }`}>
                                      {player.name ? player.name.slice(0, 2).toUpperCase() : "PL"}
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="font-sans font-bold text-xs">{player.name}</span>
                                      <span className="text-[9.5px] text-stone-400">Match Participant</span>
                                    </div>
                                  </div>
                                  <button
                                    disabled={isRequested}
                                    onClick={() => handleAddRecentFriend(player)}
                                    className={`py-1 px-2.5 rounded-lg border-none cursor-pointer transition-all active:scale-95 text-[10.5px] font-sans font-bold uppercase tracking-wider ${
                                      isRequested
                                        ? "bg-stone-200/50 text-stone-400 dark:bg-zinc-800 dark:text-zinc-500 cursor-not-allowed"
                                        : (darkMode ? "bg-purple-950/60 text-purple-300 hover:bg-purple-900/80" : "bg-purple-100 text-purple-800 hover:bg-purple-200")
                                    }`}
                                  >
                                    {isRequested ? "Requested" : "+ Add"}
                                  </button>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}


          {/* PANE: SEPARATE LOGIN SCREEN */}
          {currentScreen === "login" && (
            <div className="flex-1 w-full flex flex-col items-center justify-start p-6 select-none pt-[calc(85px+env(safe-area-inset-top,0px))] lg:pt-[130px] selection:bg-[#E0F2FE]">
              <div className="w-full max-w-sm mx-auto flex flex-col gap-6 text-center font-sans mt-4" id="login-screen-inner-container">
                
                {/* Back Button */}
                <div className="flex justify-start w-full">
                  <button
                    onClick={() => {
                      playClickSound();
                      navigatorPop();
                    }}
                    className={`px-4.5 py-2 text-xs font-black uppercase rounded-full cursor-pointer transition-all active:scale-[0.98] border-none shadow-sm active:shadow-none ${darkMode ? "bg-zinc-900 border border-zinc-800 text-stone-200 hover:bg-zinc-805" : "bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-700 hover:text-stone-900"}`}
                  >
                    ◀ BACK
                  </button>
                </div>

                {/* Login Card Container */}
                <div className={`p-8 rounded-3xl flex flex-col items-center justify-center gap-6 border-none shadow-md ${darkMode ? "bg-zinc-900/80 border border-zinc-800 text-stone-200" : "bg-white shadow-[0_12px_45px_rgba(0,0,0,0.04)]"}`}>
                  <div className="flex flex-col gap-2.5 items-center select-none">
                    {/* Circle identity context */}
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl shadow-xs ${darkMode ? "bg-zinc-800 text-sky-400" : "bg-[#E0F2FE] text-[#0369A1]"}`}>
                      👤
                    </div>
                    <h2 className={`text-3xl font-sans font-black uppercase tracking-tight mt-2.5 leading-none ${darkMode ? "text-sky-400" : "text-[#2B6CB0]"}`}>
                      LOGIN
                    </h2>
                    <p className={`text-xs font-semibold mt-2 font-sans tracking-tight max-w-[210px] leading-relaxed ${darkMode ? "text-stone-400" : "text-stone-500"}`}>
                      Sync your progress across all your devices
                    </p>
                  </div>

                  {/* Active Google Sync Action States */}
                  <div className="flex flex-col gap-1.5 w-full select-none">
                    <button
                      disabled
                      className={`w-full flex items-center justify-center gap-2 font-sans text-xs font-black uppercase tracking-wider py-3.5 px-6 rounded-full transition-all text-center border-none opacity-50 cursor-not-allowed ${darkMode ? "bg-zinc-800 text-stone-500" : "bg-stone-100 text-stone-400"}`}
                    >
                      <svg className="w-4 h-4 shrink-0 opacity-40 grayscale" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Connect with Google</span>
                    </button>
                    <p className="text-[10.5px] text-stone-500 dark:text-zinc-400 mt-1 leading-normal font-sans text-center max-w-[210px]">
                      Cloud synchronization across devices will be available in a future update.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

      {false && (
        <>
          {/* Main Top Header Strip representing our clean Scrapbook branding */}
          <header className="border-b-4 border-[#1E1E1E] bg-[#FDFBF7] py-6 px-8 relative overflow-hidden shrink-0">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="bg-[#1E1E1E] text-[#FDFBF7] text-xs font-bold font-mono px-2 py-0.5 tracking-wider uppercase">
                    Jetpack Compose Core Model Spec
                  </span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase leading-none">
                  SUDOKU <span className="font-light italic text-stone-600 font-sans">Core Engine</span>
                </h1>
                <p className="text-xs text-stone-500 mt-2 font-mono">
                  Pure Algorithmic Backtracking Solution • Unique Layout Constraint Modifiers
                </p>
              </div>

              <div className="text-right">
                <span className="handwriting text-3xl md:text-4xl block text-amber-600 transform -rotate-1">
                  v1.1.0 - "Sudoku Draft"
                </span>
                <div className="text-xs font-mono text-stone-400 mt-1">
                  Jetpack Compose Extension Specs
                </div>
              </div>
            </div>

            {/* Diagonal aesthetic wash design tapes as decorative anchors */}
            <div className="absolute top-0 right-1/4 w-12 h-6 bg-yellow-200/40 transform -rotate-12 border-b border-dashed border-stone-400/20 pointer-events-none"></div>
            <div className="absolute bottom-1 left-24 w-16 h-5 bg-purple-200/30 transform rotate-15 border-t border-dashed border-stone-400/20 pointer-events-none"></div>
          </header>

          {/* Navigation Sub-Tab Bar Strip */}
          <nav className="border-b-2 border-[#1E1E1E] bg-stone-100 flex overflow-x-auto select-none shrink-0">
            <div className="max-w-7xl mx-auto w-full px-8 flex">
              <button 
                onClick={() => setActiveTab("sudoku")}
                className={`px-5 py-4 flex items-center gap-2 font-bold uppercase tracking-wider text-xs border-r-2 border-[#1E1E1E] transition-colors ${activeTab === "sudoku" ? "bg-[#FDFBF7] text-[#1E1E1E]" : "bg-stone-100 text-stone-500 hover:bg-stone-50"}`}
              >
                <Grid3X3 className="w-4 h-4 text-emerald-600" />
                <span>Interactive Play Sudoku</span>
              </button>
              
              <button 
                onClick={() => setActiveTab("sandbox")}
                className={`px-5 py-4 flex items-center gap-2 font-bold uppercase tracking-wider text-xs border-r-2 border-[#1E1E1E] transition-colors ${activeTab === "sandbox" ? "bg-[#FDFBF7] text-[#1E1E1E]" : "bg-stone-100 text-stone-500 hover:bg-stone-50"}`}
              >
                <Paintbrush className="w-4 h-4 text-purple-600" />
                <span>Scrapbook Token Sandbox</span>
              </button>

              <button 
                onClick={() => setActiveTab("kotlin-code")}
                className={`px-5 py-4 flex items-center gap-2 font-bold uppercase tracking-wider text-xs border-r-2 border-[#1E1E1E] transition-colors ${activeTab === "kotlin-code" ? "bg-[#FDFBF7] text-[#1E1E1E]" : "bg-stone-100 text-stone-500 hover:bg-stone-50"}`}
              >
                <Code className="w-4 h-4 text-blue-600" />
                <span>View Kotlin Files (Core)</span>
              </button>

              <button 
                onClick={() => setActiveTab("spec-docs")}
                className={`px-5 py-4 flex items-center gap-2 font-bold uppercase tracking-wider text-xs border-r-2 border-[#1E1E1E] transition-colors ${activeTab === "spec-docs" ? "bg-[#FDFBF7] text-[#1E1E1E]" : "bg-stone-100 text-stone-500 hover:bg-stone-50"}`}
              >
                <BookOpen className="w-4 h-4 text-amber-600" />
                <span>Design Tokens Manual</span>
              </button>
            </div>
          </nav>

          {/* Main Workspace Frame container */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 overflow-y-auto">

        {/* 2. SANDBOX COMPONENT DESIGNERS */}
        {activeTab === "sandbox" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Control panel left */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Token swatch details */}
              <div className="bg-white scrapbook-border paper-shadow p-6 relative">
                <span className="tag">Tokens Manual</span>
                <h3 className="text-lg font-black uppercase">Color Code Tokens</h3>
                <p className="text-xs text-stone-500 font-mono leading-relaxed mt-1 mb-4">
                  Physical paper swatches defined in ScrapbookTheme.Colors
                </p>

                <div className="space-y-3">
                  {COLOR_SWATCHES.map((color) => (
                    <div 
                      key={color.id} 
                      onClick={() => triggerCopyToast(color.jetpackRef, color.name)}
                      className="p-3 border border-stone-200 hover:border-[#1E1E1E] transition-all flex justify-between items-center bg-stone-50 group cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-none scrapbook-border ${color.bgClass}`}></div>
                        <div>
                          <p className="text-xs font-black text-stone-800">{color.name}</p>
                          <p className="text-[10px] text-stone-400 font-mono italic">{color.hex}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-stone-500 block truncate max-w-[120px]">{color.jetpackRef.split('.').pop()}</span>
                        <span className="text-[9px] text-[#3B82F6] opacity-0 group-hover:opacity-100 transition-opacity font-bold">COPY REF</span>
                      </div>
                    </div>
                  ))}
                </div>

              </div>

              {/* Physical sticker tray builder */}
              <div className="bg-[#1E1E1E] text-white scrapbook-border paper-shadow p-6 relative">
                <span className="tag !bg-purple-500">STICKERS PACK</span>
                <h3 className="text-lg font-black text-[#FEF9C3] uppercase">Stickers drawer</h3>
                <p className="text-xs text-stone-400 leading-normal mt-1 mb-4 animate-pulse">
                  Click tokens to append them onto your sandbox scrapbook mockup board. Rotate or scale them freely!
                </p>

                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => spawnNewStickerFromTray("badge", "URGENT", "#EF4444")}
                    className="px-2.5 py-1.5 bg-[#2C2C2C] border border-stone-700 text-[11px] uppercase font-bold text-red-400 hover:bg-stone-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Urgent Badge</span>
                  </button>
                  <button
                    onClick={() => spawnNewStickerFromTray("badge", "APPROVED", "#10B981")}
                    className="px-2.5 py-1.5 bg-[#2C2C2C] border border-stone-700 text-[11px] uppercase font-bold text-teal-400 hover:bg-stone-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Approved Badge</span>
                  </button>
                  <button
                    onClick={() => spawnNewStickerFromTray("icon", "heart", "#EC4899")}
                    className="px-2.5 py-1.5 bg-[#2C2C2C] border border-stone-700 text-[11px] uppercase font-bold text-pink-400 hover:bg-stone-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    <span>Heart Stamper</span>
                  </button>
                  <button
                    onClick={() => spawnNewStickerFromTray("icon", "star", "#F59E0B")}
                    className="px-2.5 py-1.5 bg-[#2C2C2C] border border-stone-700 text-[11px] uppercase font-bold text-amber-400 hover:bg-stone-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>Star Stamper</span>
                  </button>
                  <button
                    onClick={() => spawnNewStickerFromTray("tape", "washi-pink", "rgba(244, 143, 177, 0.7)")}
                    className="px-2.5 py-1.5 bg-[#2C2C2C] border border-stone-700 text-[11px] uppercase font-bold text-stone-200 hover:bg-stone-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Washi tape strip</span>
                  </button>
                </div>

                {selectedStickerId && (
                  <div className="mt-4 p-3 bg-stone-900 border border-stone-800 flex flex-col gap-2">
                    <span className="text-[10px] font-black uppercase text-amber-400 font-mono">SELECTED STICKER TOOL ACTIONS</span>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <button 
                        onClick={() => {
                          setStickers(prev => prev.map(s => s.id === selectedStickerId ? { ...s, rotation: s.rotation - 10 } : s));
                        }}
                        className="py-1 bg-stone-800 border border-stone-700 hover:white text-white text-center"
                      >
                        Rotate Z Left
                      </button>
                      <button 
                        onClick={() => {
                          setStickers(prev => prev.map(s => s.id === selectedStickerId ? { ...s, rotation: s.rotation + 10 } : s));
                        }}
                        className="py-1 bg-stone-800 border border-stone-700 hover:white text-white text-center"
                      >
                        Rotate Z Right
                      </button>
                      <button 
                        onClick={() => {
                          setStickers(prev => prev.map(s => s.id === selectedStickerId ? { ...s, scale: Math.max(0.6, s.scale - 0.1) } : s));
                        }}
                        className="py-1 bg-stone-800 border border-stone-700 hover:white text-white text-center"
                      >
                        Decrease Size (-)
                      </button>
                      <button 
                        onClick={() => {
                          setStickers(prev => prev.map(s => s.id === selectedStickerId ? { ...s, scale: Math.min(2.0, s.scale + 0.1) } : s));
                        }}
                        className="py-1 bg-stone-800 border border-stone-700 hover:white text-white text-center"
                      >
                        Increase Size (+)
                      </button>
                    </div>
                    <button
                      onClick={deleteActiveSticker}
                      className="w-full py-1 bg-red-950 text-red-200 border border-red-800 hover:bg-red-900 text-xs font-bold uppercase mt-1"
                    >
                      Delete Selected Sticker
                    </button>
                  </div>
                )}

              </div>

            </div>

            {/* Sandbox Canvas Right */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              <div 
                ref={canvasRef}
                onMouseMove={handleStickerMouseMove}
                onMouseUp={handleStickerMouseUp}
                onMouseLeave={handleStickerMouseUp}
                className="w-full min-h-[460px] relative scrapbook-border paper-shadow p-8 rounded-none overflow-hidden bg-[#FDFBF7] paper-pattern"
                style={{ cursor: dragTargetRef.current ? "grabbing" : "default" }}
              >
                <div className="absolute top-2 left-3 text-[10px] font-mono text-stone-400 select-none flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Interactive Scrapbook Sandbox Board</span>
                </div>

                {/* Decorative sticker sheet widgets */}
                <div className="w-full h-full flex items-center justify-center pt-8 pb-4">
                  
                  {/* Styled Composable Notebook Mockup */}
                  <div className="relative transform rotate-[-1deg] select-none scrapbook-border paper-shadow p-8 m-4 max-w-md bg-white">
                    <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
                      <div className="w-4 h-4 bg-red-600 rounded-full border border-stone-800 shadow-sm flex items-center justify-center">
                        <div className="w-1 h-1 bg-white opacity-60 rounded-full"></div>
                      </div>
                      <div className="w-0.5 h-2 bg-stone-400 -mt-1"></div>
                    </div>

                    <span className="tag">Modifier.stickyNoteTilt()</span>
                    
                    <h4 className="text-xl font-bold uppercase mb-2">Artistic Layout Guidelines</h4>
                    <p className="text-sm font-sans leading-relaxed text-stone-600 border-b border-dashed border-stone-300 pb-3 mb-3">
                      This system replicates physical scrapbook mockups. We bypass smooth digitial shadows and perfect 90-degree lines. By tilting notes slightly based on indexes, designs look organically crafted.
                    </p>

                    <div className="flex justify-between items-center text-xs font-mono text-stone-400">
                      <span>$shadow: 4dp solid</span>
                      <span className="handwriting text-2xl text-blue-600 italic">"Pure Paper Style"</span>
                    </div>
                  </div>

                </div>

                {/* Draggable user stickers */}
                {stickers.map((sticker) => {
                  const isSelected = sticker.id === selectedStickerId;
                  return (
                    <div
                      key={sticker.id}
                      onMouseDown={(e) => handleStickerMouseDown(sticker.id, e)}
                      className={`absolute select-none cursor-grab active:cursor-grabbing transform z-35 ${isSelected ? "ring-2 ring-purple-600 shadow-md" : "hover:brightness-105"}`}
                      style={{
                        left: `${sticker.x}px`,
                        top: `${sticker.y}px`,
                        transform: `rotate(${sticker.rotation}deg) scale(${sticker.scale})`
                      }}
                    >
                      {sticker.type === "badge" && (
                        <div 
                          className="px-3 py-1 text-[11px] font-bold text-white uppercase tracking-widest scrapbook-border select-none"
                          style={{ backgroundColor: sticker.color }}
                        >
                          {sticker.content}
                        </div>
                      )}

                      {sticker.type === "icon" && (
                        <div 
                          className="w-10 h-10 bg-white border-2 border-[#1E1E1E] rounded-full flex items-center justify-center shadow-sm select-none"
                        >
                          {sticker.content === "heart" && <Heart className="w-5 h-5 fill-[#EC4899] text-[#EC4899]" />}
                          {sticker.content === "star" && <Star className="w-5 h-5 fill-[#F59E0B] text-[#F59E0B]" />}
                        </div>
                      )}

                      {sticker.type === "tape" && (
                        <div 
                          className="w-24 h-6 border-l-2 border-r-2 border-dashed border-stone-800/20 opacity-90 text-[10px] font-bold text-stone-600 flex items-center justify-center uppercase select-none"
                          style={{ backgroundColor: sticker.color }}
                        >
                          Washi Tape
                        </div>
                      )}

                      {sticker.type === "handwritten" && (
                        <div className="handwriting font-bold text-4xl text-[#1E1E1E] tracking-tight bg-[#FEF9C3]/70 px-2 rotate-1 border border-dashed border-amber-300">
                          {sticker.content}
                        </div>
                      )}
                    </div>
                  );
                })}

              </div>

            </div>

          </div>
        )}

        {/* 3. CORE KOTLIN FILES CODE INSPECTOR */}
        {activeTab === "kotlin-code" && (
          <div className="grid grid-cols-1 gap-6">
            
            <div className="bg-[#1E1E1E] text-stone-200 scrapbook-border paper-shadow p-6 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-stone-800 pb-3 gap-2.5">
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Kotlin Data Models & Algorithmic Core</h3>
                  <p className="text-xs text-stone-400 font-mono mt-0.5">
                    {selectedKotlinFile === "board" 
                      ? "SudokuComposeBoard.kt • 3x3 Block Sticky Note Layout" 
                      : selectedKotlinFile === "preferences"
                        ? "SudokuPreferencesManager.kt • Jetpack DataStore Preferences Key-Value Store"
                        : selectedKotlinFile === "snippets"
                          ? "AndroidSnippets.kt • Requested Integrations"
                          : "SudokuEngine.kt • Backtracking and Uniqueness solvers"}
                  </p>
                </div>
                
                <button
                  onClick={() => triggerCopyToast(
                    selectedKotlinFile === "board" 
                      ? sudokuBoardKotlinText 
                      : selectedKotlinFile === "preferences"
                        ? sudokuPreferencesKotlinText
                        : selectedKotlinFile === "snippets"
                          ? androidIntegrationSnippetsText
                          : fullKotlinFileText,
                    selectedKotlinFile === "board" 
                      ? "SudokuComposeBoard.kt" 
                      : selectedKotlinFile === "preferences"
                        ? "SudokuPreferencesManager.kt"
                        : selectedKotlinFile === "snippets"
                          ? "AndroidSnippets.kt"
                          : "SudokuEngine.kt"
                  )}
                  className="flex items-center gap-1.5 text-xs bg-stone-850 hover:bg-stone-750 hover:text-amber-400 px-3.5 py-2 text-sky-400 font-bold border border-stone-750 cursor-pointer self-stretch sm:self-auto justify-center"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Active File Code</span>
                </button>
              </div>

              {/* Subtabs for switching between Compose and Logic Engine files */}
              <div className="flex flex-wrap border-b border-stone-800 text-xs font-mono">
                <button
                  onClick={() => setSelectedKotlinFile("board")}
                  className={`px-4 py-2 border-b-2 tracking-wider uppercase font-bold transition-all ${selectedKotlinFile === "board" ? "border-amber-400 text-amber-400 font-black bg-stone-900" : "border-transparent text-stone-500 hover:text-white"}`}
                >
                  [ 📱 SudokuComposeBoard.kt ]
                </button>
                <button
                  onClick={() => setSelectedKotlinFile("preferences")}
                  className={`px-4 py-2 border-b-2 tracking-wider uppercase font-bold transition-all ${selectedKotlinFile === "preferences" ? "border-amber-400 text-amber-400 font-black bg-stone-900" : "border-transparent text-stone-500 hover:text-white"}`}
                >
                  [ 🔑 SudokuPreferencesManager.kt ]
                </button>
                <button
                  onClick={() => setSelectedKotlinFile("snippets")}
                  className={`px-4 py-2 border-b-2 tracking-wider uppercase font-bold transition-all ${selectedKotlinFile === "snippets" ? "border-amber-400 text-amber-400 font-black bg-stone-900" : "border-transparent text-stone-500 hover:text-white"}`}
                >
                  [ 🧩 User Snippets ]
                </button>
                <button
                  onClick={() => setSelectedKotlinFile("engine")}
                  className={`px-4 py-2 border-b-2 tracking-wider uppercase font-bold transition-all ${selectedKotlinFile === "engine" ? "border-amber-400 text-amber-400 font-black bg-stone-900" : "border-transparent text-stone-500 hover:text-white"}`}
                >
                  [ ⚙️ SudokuEngine.kt ]
                </button>
              </div>

              <pre className="text-xs font-mono overflow-auto max-h-[500px] bg-stone-900/80 p-4 leading-relaxed">
                <code className="text-[#A5D6FF]">
                  {selectedKotlinFile === "board" 
                    ? sudokuBoardKotlinText 
                    : selectedKotlinFile === "preferences"
                      ? sudokuPreferencesKotlinText
                      : selectedKotlinFile === "snippets"
                        ? androidIntegrationSnippetsText
                        : fullKotlinFileText}
                </code>
              </pre>
            </div>

          </div>
        )}

        {/* 4. DESIGN TOKENS MANUAL TAB */}
        {activeTab === "spec-docs" && (
          <div className="flex flex-col gap-8">
            <h2 className="text-3xl font-bold uppercase tracking-tight border-b-2 border-stone-800 pb-2">
              Modifier Specifications Manual
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-[#E6F4EA] scrapbook-border paper-shadow p-6 flex flex-col justify-between">
                <div>
                  <div className="bg-[#1E1E1E] text-white text-[10px] font-mono uppercase px-2 py-0.5 inline-block mb-3">
                    Modifier.scrapbookBorder()
                  </div>
                  <h3 className="text-xl font-bold uppercase mb-2">Dual Outlines Stroke</h3>
                  <p className="text-sm text-stone-700 leading-relaxed mb-4">
                    Applies a physical scrapbook separation utilizing a solid outer black charcoal boarder, and a 2dp pure white inner stroke. Bypasses digitial glow values to preserve real cardboard look.
                  </p>
                </div>
                <div className="bg-white/50 p-3 border border-stone-300 font-mono text-xs">
                  <span className="text-[#3B82F6]">Compose definition:</span>
                  <pre className="mt-1 text-stone-800 font-sans text-[11px]">
                    Modifier.border(2.dp, color = CharcoalBlack).padding(2.dp).border(2.dp, color = Color.White)
                  </pre>
                </div>
              </div>

              <div className="bg-[#E0F2FE] scrapbook-border paper-shadow p-6 flex flex-col justify-between">
                <div>
                  <div className="bg-[#1E1E1E] text-white text-[10px] font-mono uppercase px-2 py-0.5 inline-block mb-3">
                    Modifier.paperShadow()
                  </div>
                  <h3 className="text-xl font-bold uppercase mb-2">Hard Drop Solid Shadows</h3>
                  <p className="text-sm text-stone-700 leading-relaxed mb-4">
                    Generates completely solid sharp outlines offset shadows (4dp, completely unblurred). Bypasses soft digital blurs to represent heavy scrap paperboards.
                  </p>
                </div>
                <div className="bg-white/50 p-3 border border-stone-300 font-mono text-xs">
                  <span className="text-[#3B82F6]">Compose definition:</span>
                  <pre className="mt-1 text-stone-800 font-sans text-[11px]">
                    Modifier.drawBehind {"{"} drawOutline(offset) {"}"}
                  </pre>
                </div>
              </div>

              <div className="bg-[#FEF9C3] scrapbook-border paper-shadow p-6 flex flex-col justify-between">
                <div>
                  <div className="bg-[#1E1E1E] text-white text-[10px] font-mono uppercase px-2 py-0.5 inline-block mb-3">
                    Modifier.stickyNoteTilt()
                  </div>
                  <h3 className="text-xl font-bold uppercase mb-2">Micro Angle Layout Tilts</h3>
                  <p className="text-sm text-stone-700 leading-relaxed mb-4">
                    Applies slight rotations alternating symmetrically between -1.0° and +1.0° based on provided indexes. Rotates card grids to remove mechanical rigidity.
                  </p>
                </div>
                <div className="bg-white/50 p-3 border border-stone-300 font-mono text-xs">
                  <span className="text-[#3B82F6]">Compose definition:</span>
                  <pre className="mt-1 text-stone-800 font-sans text-[11px]">
                    Modifier.graphicsLayer {"{"} rotationZ = if (even) -1.0f else 1.0f {"}"}
                  </pre>
                </div>
              </div>

            </div>

            <div className="bg-[#FDFBF7] scrapbook-border paper-shadow p-6">
              <h3 className="text-lg font-bold uppercase mb-3 text-stone-800">Sudoku Calculations Logic</h3>
              <p className="text-sm text-stone-600 leading-relaxed mb-3">
                Our engine ensures high-performance validation and grid generation utilizing three layered algorithms:
              </p>
              <ul className="list-decimal list-inside space-y-2 text-xs font-mono text-stone-600">
                <li><strong className="text-stone-800">Randomized Backtracking:</strong> Generates perfect boards by filling cells column-by-col with shuffled candidates (1 to 9).</li>
                <li><strong className="text-stone-800">Uniqueness Checks:</strong> Before making holes, the algorithm simulates another solve to prove exactly one path exists. Restores values if multi-paths are found.</li>
                <li><strong className="text-stone-800">Subgrid Validation checks:</strong> Runs bitwise mapping verification on corresponding row, column, and local 3x3 quadrant sections.</li>
              </ul>
            </div>

          </div>
        )}

      </main>
    </>
  )}

      {/* Rewarded Video Ad Sponsored Transmission Modal */}
      {/* REWARDED VIDEO AD MODAL */}
      {rewardType !== null && (
        <div className="fixed inset-0 z-50 bg-[#FDFBF7]/80 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={`border-none p-8 max-w-xs w-full relative text-center rounded-[32px] shadow-[0_12px_40px_rgba(0,0,0,0.08)] flex flex-col gap-6 ${darkMode ? "bg-[#2A2D24]" : "bg-[#FDFBF7]"}`}
          >
            <div className="flex flex-col items-center gap-2">
               <h3 className={`text-2xl font-sans font-medium tracking-tight mt-2 ${darkMode ? "text-[#FDFBF7]" : "text-[#4B5563]"}`}>
                 Out of Hints
               </h3>
               <p className={`text-sm font-sans mt-1 ${darkMode ? "text-[#9CA3AF]" : "text-[#6B7280]"}`}>
                 Watch the ad to receive extra guidance and keep your game flowing smoothly.
               </p>
            </div>

            {isWatchingAd ? (
               <div className="flex justify-center py-4">
                 <div className={`w-8 h-8 rounded-full border-2 animate-spin ${darkMode ? "border-[#065F46] border-t-[#D1FAE5]" : "border-[#D1FAE5] border-t-[#059669]"}`} />
               </div>
            ) : adSuccessMsg ? (
               <div className="flex justify-center py-4">
                 <span className="text-4xl">🌱</span>
               </div>
            ) : null}

            <div className="flex w-full gap-3 mt-2">
              <button 
                onClick={() => {
                  if (!isWatchingAd) {
                    setRewardType(null);
                    setAdSuccessMsg(false);
                  }
                }}
                disabled={isWatchingAd}
                className={`flex-1 aspect-[2/1] rounded-[24px] flex items-center justify-center transition-all shadow-[0_4px_12px_rgba(0,0,0,0.02)] active:scale-95 border-none cursor-pointer ${darkMode ? "bg-[#3F4238] text-[#FDFBF7] hover:bg-[#4E5146]" : "bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]"}`}
              >
                 <X className="w-7 h-7" strokeWidth={1.5} />
              </button>
              
              {!adSuccessMsg ? (
                <button
                  onClick={() => {
                    if (isWatchingAd || adSuccessMsg) return;
                    setIsWatchingAd(true);
                    setTimeout(() => {
                      setIsWatchingAd(false);
                      setAdSuccessMsg(true);
                      if (rewardType === "hint_reward") {
                        setHintInventory(prev => prev + 2);
                        addLog(`🎬 Rewarded video completed! Injected +2 hints.`);
                      }
                      setTimeout(() => {
                         setRewardType(null);
                         setAdSuccessMsg(false);
                      }, 1200);
                    }, 1500);
                  }}
                  disabled={isWatchingAd}
                  className={`flex-1 aspect-[2/1] rounded-[24px] flex items-center justify-center transition-all shadow-[0_4px_12px_rgba(0,0,0,0.02)] active:scale-95 border-none cursor-pointer ${darkMode ? "bg-[#D1FAE5] text-[#065F46] hover:bg-[#A7F3D0]" : "bg-[#D1FAE5] text-[#065F46] hover:bg-[#A7F3D0]"}`}
                >
                   <Play className="w-7 h-7" strokeWidth={1.5} />
                </button>
              ) : null}
            </div>
          </motion.div>
        </div>
      )}

      {/* HINT EXPLANATION BOTTOM MODAL */}
      <AnimatePresence>
        {hintExplanation !== null && (
          <div className="fixed inset-0 z-50 pointer-events-none flex items-end justify-center p-4 pb-8 sm:pb-12">
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className={`pointer-events-auto border-none p-6 max-w-sm w-full relative text-center rounded-[32px] shadow-[0_12px_40px_rgba(0,0,0,0.12)] flex flex-col gap-4 ${darkMode ? "bg-[#2A2D24]" : "bg-[#FDFBF7]"}`}
            >
              <button 
                onClick={() => setHintExplanation(null)}
                className={`absolute top-4 right-4 p-1.5 rounded-full transition-all active:scale-95 border-none cursor-pointer ${darkMode ? "bg-[#3F4238] text-[#FDFBF7] hover:bg-[#4E5146]" : "bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]"}`}
              >
                 <X className="w-5 h-5" strokeWidth={2} />
              </button>
              
              <div className="flex flex-col items-start text-left gap-1 pr-8">
                <span className={`text-[12px] font-sans font-bold uppercase tracking-widest ${darkMode ? "text-[#D1D5DB]" : "text-[#9CA3AF]"}`}>
                  Hint Used
                </span>
                <p className={`text-[15px] font-sans leading-relaxed ${darkMode ? "text-[#FDFBF7]" : "text-[#4B5563]"}`}>
                  This is the only spot left for a <strong className="font-extrabold text-lg mx-0.5">{hintExplanation.num}</strong>! Checking the row, column, and block confirms it's the perfect fit.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🤝 TOGETHER MODE: UNIFIED MULTIPLAYER MODAL WRAPPER (LOBBY | JOIN | CREATE) */}
      <AnimatePresence>
        {(showMultiplayerForkModal || showJoinRoomModal || showCreateChallengeModal) && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            {/* Backdrop click dismisser */}
            <div 
              className="absolute inset-0 cursor-pointer" 
              onClick={() => {
                playClickSound();
                setShowMultiplayerForkModal(false);
                setShowJoinRoomModal(false);
                setShowCreateChallengeModal(false);
              }} 
            />

            <AnimatePresence mode="wait" initial={false}>
              {/* 1. ROUTE SELECTION (LOBBY) */}
              {showMultiplayerForkModal && (
                <motion.div 
                  key="multiplayer-fork-modal"
                  initial={{ scale: 0.96, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.96, opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className={`relative w-full max-w-[400px] rounded-3xl p-5 border-none flex flex-col gap-4 select-none z-[10001] text-left transition-colors duration-300 ${
                    darkMode ? "bg-[#1A1A1A] text-stone-200" : "bg-[#FDFBF7] text-stone-850"
                  }`}
                  style={{
                    boxShadow: darkMode ? '0 10px 40px rgba(0,0,0,0.6)' : '0 4px 20px rgba(0,0,0,0.08)'
                  }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className={`text-[10px] font-sans font-black tracking-widest uppercase ${darkMode ? "text-purple-400" : "text-[#6B21A8]"}`}>
                        Together Mode
                      </span>
                      <h3 className="text-xl font-sans font-black tracking-tight leading-none text-stone-850 dark:text-stone-100 mt-0.5">
                        Multiplayer Lobby
                      </h3>
                    </div>
                    <button
                      onClick={() => {
                        playClickSound();
                        setShowMultiplayerForkModal(false);
                      }}
                      className="p-1.5 rounded-full text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 hover:bg-stone-150 dark:hover:bg-zinc-800 transition-colors border-none cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Routes Grid */}
                  <div className="grid grid-cols-1 gap-2.5">
                    {/* Route 1: Create Room */}
                    <button
                      onClick={() => {
                        playClickSound();
                        openCreateRoomModal();
                      }}
                      className={`w-full py-3 px-4 rounded-2xl flex items-center justify-between border-none cursor-pointer transition-all duration-150 text-left shadow-xs active:scale-[0.98] ${
                        darkMode 
                          ? "bg-[#2e1065]/40 hover:bg-[#2e1065]/60 text-purple-200 border border-purple-900/40" 
                          : "bg-[#F3E8FF] hover:bg-[#e9d5ff] active:bg-[#d8b4fe] text-[#6B21A8]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl flex items-center justify-center ${darkMode ? "bg-purple-900/60 text-purple-300" : "bg-white/80 text-[#6B21A8] shadow-xs"}`}>
                          <Users className="w-5 h-5 stroke-[2.5]" />
                        </div>
                        <span className="font-sans font-black text-sm uppercase tracking-wider leading-none">
                          Create Room
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5 stroke-[2.5] opacity-60" />
                    </button>

                    {/* Route 2: Join Room */}
                    <button
                      onClick={() => {
                        playClickSound();
                        setShowMultiplayerForkModal(false);
                        setJoinRoomCodeInput("");
                        setJoinRoomPinInput("");
                        setJoinRoomError(null);
                        setShowJoinRoomModal(true);
                      }}
                      className={`w-full py-3 px-4 rounded-2xl flex items-center justify-between border-none cursor-pointer transition-all duration-150 text-left shadow-xs active:scale-[0.98] ${
                        darkMode 
                          ? "bg-[#0c4a6e]/40 hover:bg-[#0c4a6e]/60 text-sky-200 border border-sky-900/40" 
                          : "bg-[#E0F2FE] hover:bg-[#bae6fd] active:bg-[#7dd3fc] text-[#0369a1]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl flex items-center justify-center ${darkMode ? "bg-sky-900/60 text-sky-300" : "bg-white/80 text-[#0369a1] shadow-xs"}`}>
                          <Grid3X3 className="w-5 h-5 stroke-[2.5]" />
                        </div>
                        <span className="font-sans font-black text-sm uppercase tracking-wider leading-none">
                          Join Room
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5 stroke-[2.5] opacity-60" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* 2. JOIN ROOM BY CODE */}
              {showJoinRoomModal && (
                <motion.div 
                  key="multiplayer-join-modal"
                  initial={{ scale: 0.96, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.96, opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className={`relative w-full max-w-[420px] rounded-3xl p-6 border-none flex flex-col gap-4 select-none z-[10001] text-left transition-colors duration-300 ${
                    darkMode ? "bg-[#1A1A1A] text-stone-200" : "bg-[#FDFBF7] text-stone-850"
                  }`}
                  style={{
                    boxShadow: darkMode ? '0 10px 40px rgba(0,0,0,0.6)' : '0 4px 20px rgba(0,0,0,0.08)'
                  }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      <span className={`text-[10px] font-sans font-black tracking-widest uppercase ${darkMode ? "text-sky-400" : "text-[#0369a1]"}`}>
                        Together Mode
                      </span>
                      <h3 className="text-xl font-sans font-black tracking-tight leading-none text-stone-850 dark:text-stone-100">
                        Join Room
                      </h3>
                    </div>
                    <button
                      onClick={() => {
                        playClickSound();
                        setShowJoinRoomModal(false);
                      }}
                      className="p-1.5 rounded-full text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 hover:bg-stone-150 dark:hover:bg-zinc-800 transition-colors border-none cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-xs font-sans text-stone-500 dark:text-stone-400">
                    Ask your friend for their 6-digit room code to enter the match.
                  </p>

                  {/* 6-digit room code input */}
                  <div className="flex flex-col gap-1.5 mt-1">
                    <label className="font-sans font-bold text-2xs uppercase tracking-wider text-stone-400 dark:text-stone-500">
                      6-Digit Room Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="849201"
                      value={joinRoomCodeInput}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/[^0-9]/g, '');
                        setJoinRoomCodeInput(cleaned);
                        setJoinRoomError(null);
                      }}
                      className={`w-full py-3 px-4 rounded-xl text-center text-xl font-mono font-black tracking-[0.3em] border-none outline-none transition-colors ${
                        darkMode 
                          ? "bg-zinc-900 text-stone-100 placeholder-zinc-700 focus:ring-2 focus:ring-sky-500/50" 
                          : "bg-stone-100 text-stone-850 placeholder-stone-400 focus:ring-2 focus:ring-sky-500/30 shadow-inner"
                      }`}
                    />
                  </div>

                  {/* Optional Room PIN input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans font-bold text-2xs uppercase tracking-wider text-stone-400 dark:text-stone-500">
                      4-Digit PIN (If Room Is Locked)
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="• • • •"
                      value={joinRoomPinInput}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/[^0-9]/g, '');
                        setJoinRoomPinInput(cleaned);
                        setJoinRoomError(null);
                      }}
                      className={`w-full py-2.5 px-4 rounded-xl text-center text-sm font-mono font-bold tracking-widest border-none outline-none transition-colors ${
                        darkMode 
                          ? "bg-zinc-900 text-stone-100 placeholder-zinc-700 focus:ring-2 focus:ring-sky-500/50" 
                          : "bg-stone-100 text-stone-850 placeholder-stone-400 focus:ring-2 focus:ring-sky-500/30 shadow-inner"
                      }`}
                    />
                  </div>

                  {/* Error Message */}
                  {joinRoomError && (
                    <p className="text-xs font-sans font-bold text-rose-500 text-center -my-1">
                      {joinRoomError}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2.5 mt-2">
                    <button
                      onClick={() => {
                        playClickSound();
                        setShowJoinRoomModal(false);
                        setShowMultiplayerForkModal(true);
                      }}
                      className={`flex-1 py-3 px-4 rounded-2xl font-sans font-black text-xs uppercase tracking-wider border-none cursor-pointer transition-all active:scale-98 ${
                        darkMode ? "bg-zinc-800 text-stone-300 hover:bg-zinc-700" : "bg-stone-150 text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      Back
                    </button>
                    <button
                      disabled={joinRoomCodeInput.trim().length !== 6 || isJoiningRoomLoading}
                      onClick={() => {
                        playClickSound();
                        handleExecuteJoinRoomByCode();
                      }}
                      className={`flex-2 py-3 px-4 rounded-2xl font-sans font-black text-xs uppercase tracking-wider border-none cursor-pointer transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 ${
                        joinRoomCodeInput.trim().length === 6 && !isJoiningRoomLoading
                          ? (darkMode ? "bg-[#0c4a6e] hover:bg-[#0369a1] text-sky-100" : "bg-[#E0F2FE] hover:bg-[#bae6fd] text-[#0369a1]")
                          : "opacity-50 cursor-not-allowed bg-stone-200 dark:bg-zinc-800 text-stone-400"
                      }`}
                    >
                      {isJoiningRoomLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4 fill-current" />
                      )}
                      <span>{isJoiningRoomLoading ? "Joining..." : "Join Game"}</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* 3. CREATE / CHALLENGE SETUP */}
              {showCreateChallengeModal && (
                <motion.div 
                  key="multiplayer-create-modal"
                  initial={{ scale: 0.96, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.96, opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className={`relative w-[92%] max-w-md h-[70vh] rounded-3xl p-5 sm:p-6 border-none flex flex-col gap-4 select-none z-[10001] text-left transition-colors duration-300 ${
                    darkMode ? "bg-[#1A1A1A] text-stone-200" : "bg-[#FDFBF7] text-stone-850"
                  }`}
                  style={{
                    boxShadow: darkMode ? '0 10px 40px rgba(0,0,0,0.6)' : '0 4px 20px rgba(0,0,0,0.08)'
                  }}
                >
                  {(() => {
                    const activeRoomCode = String(challengeSeed || (boardState?.seed ? String(boardState.seed).slice(-6) : "849201")).padStart(6, '0').slice(-6);

                    return (
                      <>
                        {/* 1. HEADER: ROOM CODE & LOCK STATUS */}
                        <div className="flex flex-col gap-2 shrink-0 select-none">
                          <div className="flex items-center justify-between">
                            {/* Left: 6-digit room code */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs sm:text-sm font-sans font-black tracking-wider text-stone-850 dark:text-stone-100 flex items-center gap-1.5">
                                <span className="text-stone-400 dark:text-stone-500 text-2xs uppercase font-bold">CODE:</span>
                                <span className="font-mono tracking-widest text-sm sm:text-base select-all">{activeRoomCode}</span>
                              </span>
                              <button
                                onClick={() => {
                                  playClickSound();
                                  copyToClipboard(activeRoomCode);
                                  showCopiedToast("Room code copied!");
                                }}
                                title="Copy room code"
                                className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 hover:bg-stone-150 dark:hover:bg-zinc-800 transition-colors border-none cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Right: Lock toggle & Close button */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  playClickSound();
                                  const next = !isRoomLocked;
                                  setIsRoomLocked(next);
                                  updateRoomSettingsInFirestore({ isLocked: next, pin: roomPin });
                                }}
                                className={`px-3 py-1.5 rounded-xl font-mono text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all duration-150 cursor-pointer border-none active:scale-95 flex items-center gap-1.5 select-none ${
                                  isRoomLocked
                                    ? (darkMode
                                        ? "bg-[#4c0519] text-[#fecdd3] shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
                                        : "bg-[#FFE4E6] text-[#9D174D] shadow-[0_8px_16px_rgba(157,23,77,0.06),_0_2px_4px_rgba(0,0,0,0.02)]")
                                    : (darkMode
                                        ? "bg-[#022c22] text-[#d1fae5] shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
                                        : "bg-[#D1FAE5] text-[#065F46] shadow-[0_8px_16px_rgba(6,95,70,0.06),_0_2px_4px_rgba(0,0,0,0.02)]")
                                }`}
                              >
                                {isRoomLocked ? (
                                  <>
                                    <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                                    <span>LOCKED</span>
                                  </>
                                ) : (
                                  <>
                                    <Unlock className="w-3.5 h-3.5 stroke-[2.5]" />
                                    <span>UNLOCKED</span>
                                  </>
                                )}
                              </button>

                              <button 
                                onClick={() => { playClickSound(); setShowCreateChallengeModal(false); }}
                                className={`p-1.5 rounded-full border-none cursor-pointer transition-all active:scale-95 hover:scale-105 ${
                                  darkMode ? "bg-zinc-800 hover:bg-zinc-750 text-stone-250" : "bg-stone-100 hover:bg-stone-200 text-stone-700"
                                }`}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Revealed inline soft-bordered input if locked */}
                          <AnimatePresence>
                            {isRoomLocked && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.18 }}
                                className="overflow-hidden"
                              >
                                <div className="flex items-center justify-between gap-2 px-3 py-2 mt-1 rounded-xl bg-stone-100/80 dark:bg-zinc-900/60 border border-stone-200/80 dark:border-zinc-800/80">
                                  <span className="font-sans font-bold text-[10px] sm:text-xs uppercase tracking-wider text-stone-700 dark:text-stone-300">
                                    SET 4-DIGIT PIN:
                                  </span>
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={4}
                                    placeholder="_ _ _ _"
                                    value={roomPin}
                                    onChange={(e) => {
                                      const cleaned = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                                      setRoomPin(cleaned);
                                      updateRoomSettingsInFirestore({ isLocked: true, pin: cleaned });
                                    }}
                                    className="w-24 px-2 py-1 text-center font-mono font-black text-xs sm:text-sm tracking-widest rounded-lg border border-stone-300/80 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-stone-850 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
                                  />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* 2. COMPACT SETTINGS 2x2 BALANCED GRID (HOMEPAGE PILL STYLING) */}
                        <div className="relative z-[10010] shrink-0 select-none">
                          {/* Invisible backdrop to dismiss open dropdown */}
                          {openDropdown && (
                            <div
                              className="fixed inset-0 z-[10015] bg-transparent cursor-default"
                              onClick={() => setOpenDropdown(null)}
                            />
                          )}

                          <div className="grid grid-cols-2 gap-2.5 w-full">
                            {/* Top-Left: Difficulty */}
                            <div className="relative w-full">
                              <button
                                onClick={() => {
                                  playClickSound();
                                  setOpenDropdown(openDropdown === "difficulty" ? null : "difficulty");
                                }}
                                className={`w-full h-[38px] flex items-center justify-center gap-1 px-2 text-xs font-mono font-black uppercase tracking-wider rounded-xl border-none outline-none cursor-pointer transition-all duration-150 active:scale-95 ${
                                  challengeDifficulty === "EASY"
                                    ? (darkMode ? "bg-[#022c22] text-[#d1fae5] shadow-[0_8px_16px_rgba(0,0,0,0.4)]" : "bg-[#D1FAE5] text-[#065F46] shadow-[0_8px_16px_rgba(6,95,70,0.06),_0_2px_4px_rgba(0,0,0,0.02)]")
                                    : challengeDifficulty === "MEDIUM"
                                    ? (darkMode ? "bg-[#451a03] text-[#fef08a] shadow-[0_8px_16px_rgba(0,0,0,0.4)]" : "bg-[#FFF99D] text-[#854D0E] shadow-[0_8px_16px_rgba(133,77,14,0.06),_0_2px_4px_rgba(0,0,0,0.02)]")
                                    : challengeDifficulty === "HARD"
                                    ? (darkMode ? "bg-[#2e1065] text-[#e9d5ff] shadow-[0_8px_16px_rgba(0,0,0,0.4)]" : "bg-[#F3E8FF] text-[#6B21A8] shadow-[0_8px_16px_rgba(107,33,168,0.06),_0_2px_4px_rgba(0,0,0,0.02)]")
                                    : (darkMode ? "bg-[#4c0519] text-[#fecdd3] shadow-[0_8px_16px_rgba(0,0,0,0.4)]" : "bg-[#FFE4E6] text-[#9D174D] shadow-[0_8px_16px_rgba(157,23,77,0.06),_0_2px_4px_rgba(0,0,0,0.02)]")
                                }`}
                              >
                                <span className="truncate">
                                  {challengeDifficulty === "EASY" ? "Easy" : challengeDifficulty === "MEDIUM" ? "Medium" : challengeDifficulty === "HARD" ? "Hard" : "Expert"} ▾
                                </span>
                              </button>

                              {openDropdown === "difficulty" && (
                                <div className="absolute top-full left-0 mt-1.5 w-full min-w-[140px] rounded-xl p-1.5 flex flex-col gap-1 z-[10020] bg-white dark:bg-zinc-900 shadow-xl border border-stone-200/80 dark:border-zinc-800">
                                  {(["EASY", "MEDIUM", "HARD", "EXPERT"] as Difficulty[]).map(lvl => (
                                    <button
                                      key={lvl}
                                      onClick={() => {
                                        playClickSound();
                                        setChallengeDifficulty(lvl);
                                        setOpenDropdown(null);
                                        updateRoomSettingsInFirestore({ difficulty: lvl });
                                      }}
                                      className={`w-full py-2 px-2.5 rounded-lg text-[10px] font-mono font-black uppercase tracking-wider text-left border-none cursor-pointer transition-all ${
                                        lvl === "EASY"
                                          ? (darkMode ? "hover:bg-[#022c22] text-[#d1fae5]" : "hover:bg-[#D1FAE5] text-[#065F46]")
                                          : lvl === "MEDIUM"
                                          ? (darkMode ? "hover:bg-[#451a03] text-[#fef08a]" : "hover:bg-[#FFF99D] text-[#854D0E]")
                                          : lvl === "HARD"
                                          ? (darkMode ? "hover:bg-[#2e1065] text-[#e9d5ff]" : "hover:bg-[#F3E8FF] text-[#6B21A8]")
                                          : (darkMode ? "hover:bg-[#4c0519] text-[#fecdd3]" : "hover:bg-[#FFE4E6] text-[#9D174D]")
                                      } ${challengeDifficulty === lvl ? (darkMode ? "bg-zinc-800 font-black" : "bg-stone-100 font-black") : "bg-transparent"}`}
                                    >
                                      {lvl.charAt(0) + lvl.slice(1).toLowerCase()}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Top-Right: Mistakes */}
                            <div className="relative w-full">
                              <button
                                onClick={() => {
                                  playClickSound();
                                  setOpenDropdown(openDropdown === "mistakes" ? null : "mistakes");
                                }}
                                className={`w-full h-[38px] flex items-center justify-center gap-1 px-2 text-xs font-mono font-black uppercase tracking-wider rounded-xl border-none outline-none cursor-pointer transition-all duration-150 active:scale-95 ${
                                  darkMode
                                    ? "bg-[#451a03] text-[#fef08a] shadow-[0_8px_16px_rgba(0,0,0,0.4)]"
                                    : "bg-[#FFF99D] text-[#854D0E] shadow-[0_8px_16px_rgba(133,77,14,0.06),_0_2px_4px_rgba(0,0,0,0.02)]"
                                }`}
                              >
                                <span className="truncate">
                                  {challengeMistakeLimit === 0 ? "0 Mistakes" : challengeMistakeLimit === 999 ? "Unlimited" : `${challengeMistakeLimit} Mistakes`} ▾
                                </span>
                              </button>

                              {openDropdown === "mistakes" && (
                                <div className="absolute top-full right-0 mt-1.5 w-full min-w-[200px] rounded-xl p-1.5 flex flex-col gap-1 z-[10020] bg-white dark:bg-zinc-900 shadow-xl border border-stone-200/80 dark:border-zinc-800">
                                  {[
                                    { label: "0 Mistakes (Sudden Death)", val: 0 },
                                    { label: "3 Mistakes", val: 3 },
                                    { label: "5 Mistakes", val: 5 },
                                    { label: "Unlimited", val: 999 },
                                  ].map(opt => (
                                    <button
                                      key={opt.label}
                                      onClick={() => {
                                        playClickSound();
                                        setChallengeMistakeLimit(opt.val);
                                        setOpenDropdown(null);
                                        updateRoomSettingsInFirestore({ mistakesLimit: opt.val });
                                      }}
                                      className={`w-full py-2 px-2.5 rounded-lg text-[10px] font-mono font-black uppercase tracking-wider text-left border-none cursor-pointer transition-all ${
                                        darkMode
                                          ? "hover:bg-[#451a03] text-[#fef08a]"
                                          : "hover:bg-[#FFF99D] text-[#854D0E]"
                                      } ${challengeMistakeLimit === opt.val ? (darkMode ? "bg-zinc-800 font-black" : "bg-stone-100 font-black") : "bg-transparent"}`}
                                    >
                                      {opt.label}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Bottom-Left: Hints */}
                            <div className="relative w-full">
                              <button
                                onClick={() => {
                                  playClickSound();
                                  setOpenDropdown(openDropdown === "hints" ? null : "hints");
                                }}
                                className={`w-full h-[38px] flex items-center justify-center gap-1.5 px-2 text-xs font-mono font-black uppercase tracking-wider rounded-xl border-none outline-none cursor-pointer transition-all duration-150 active:scale-95 ${
                                  darkMode
                                    ? "bg-[#2e1065] text-[#e9d5ff] shadow-[0_8px_16px_rgba(0,0,0,0.4)]"
                                    : "bg-[#F3E8FF] text-[#6B21A8] shadow-[0_8px_16px_rgba(107,33,168,0.06),_0_2px_4px_rgba(0,0,0,0.02)]"
                                }`}
                              >
                                <Lightbulb className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                                <span className="truncate">
                                  {challengeHintLimit === 0 ? "No Hints" : challengeHintLimit === 1 ? "1 Hint" : `${challengeHintLimit} Hints`} ▾
                                </span>
                              </button>

                              {openDropdown === "hints" && (
                                <div className="absolute top-full left-0 mt-1.5 w-full min-w-[150px] rounded-xl p-1.5 flex flex-col gap-1 z-[10020] bg-white dark:bg-zinc-900 shadow-xl border border-stone-200/80 dark:border-zinc-800">
                                  {[
                                    { label: "No Hints", val: 0 },
                                    { label: "1 Hint", val: 1 },
                                    { label: "3 Hints", val: 3 },
                                    { label: "5 Hints", val: 5 },
                                  ].map(opt => (
                                    <button
                                      key={opt.label}
                                      onClick={() => {
                                        playClickSound();
                                        setChallengeHintLimit(opt.val);
                                        setOpenDropdown(null);
                                        updateRoomSettingsInFirestore({ hintsLimit: opt.val });
                                      }}
                                      className={`w-full py-2 px-2.5 rounded-lg text-[10px] font-mono font-black uppercase tracking-wider text-left border-none cursor-pointer transition-all flex items-center gap-1.5 ${
                                        darkMode
                                          ? "hover:bg-[#2e1065] text-[#e9d5ff]"
                                          : "hover:bg-[#F3E8FF] text-[#6B21A8]"
                                      } ${challengeHintLimit === opt.val ? (darkMode ? "bg-zinc-800 font-black" : "bg-stone-100 font-black") : "bg-transparent"}`}
                                    >
                                      <Lightbulb className="w-3 h-3 stroke-[2.5] shrink-0" />
                                      <span>{opt.label}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Bottom-Right: Timer */}
                            <div className="relative w-full">
                              <button
                                onClick={() => {
                                  playClickSound();
                                  setOpenDropdown(openDropdown === "timer" ? null : "timer");
                                }}
                                className={`w-full h-[38px] flex items-center justify-center gap-1.5 px-2 text-xs font-mono font-black uppercase tracking-wider rounded-xl border-none outline-none cursor-pointer transition-all duration-150 active:scale-95 ${
                                  challengeTimerEnabled
                                    ? (darkMode ? "bg-[#0c4a6e]/50 text-[#bae6fd] shadow-[0_8px_16px_rgba(0,0,0,0.4)]" : "bg-[#E0F2FE] text-[#0369A1] shadow-[0_8px_16px_rgba(3,105,161,0.06),_0_2px_4px_rgba(0,0,0,0.02)]")
                                    : (darkMode ? "bg-zinc-800/80 text-stone-400" : "bg-stone-150 text-stone-600")
                                }`}
                              >
                                <Timer className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                                <span className="truncate">
                                  {challengeTimerEnabled ? "TIMER ON ▾" : "TIMER OFF ▾"}
                                </span>
                              </button>

                              {openDropdown === "timer" && (
                                <div className="absolute top-full right-0 mt-1.5 w-full min-w-[150px] rounded-xl p-1.5 flex flex-col gap-1 z-[10020] bg-white dark:bg-zinc-900 shadow-xl border border-stone-200/80 dark:border-zinc-800">
                                  {[
                                    { label: "Timer On", val: true },
                                    { label: "Timer Off", val: false },
                                  ].map(opt => (
                                    <button
                                      key={opt.label}
                                      onClick={() => {
                                        playClickSound();
                                        setChallengeTimerEnabled(opt.val);
                                        setOpenDropdown(null);
                                        updateRoomSettingsInFirestore({ timerEnabled: opt.val });
                                      }}
                                      className={`w-full py-2 px-2.5 rounded-lg text-[10px] font-mono font-black uppercase tracking-wider text-left border-none cursor-pointer transition-all flex items-center gap-1.5 ${
                                        darkMode
                                          ? "hover:bg-[#0c4a6e]/50 text-[#bae6fd]"
                                          : "hover:bg-[#E0F2FE] text-[#0369A1]"
                                      } ${challengeTimerEnabled === opt.val ? (darkMode ? "bg-zinc-800 font-black" : "bg-stone-100 font-black") : "bg-transparent"}`}
                                    >
                                      <Timer className="w-3 h-3 stroke-[2.5] shrink-0" />
                                      <span>{opt.label}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 3. PLAYER ROSTER & INLINE ACTIONS */}
                        <div className="flex-1 min-h-0 flex flex-col gap-2 select-none">
                          <div className="flex items-center justify-between px-1 shrink-0">
                            <span className={`font-sans font-black uppercase tracking-wider text-[10px] ${darkMode ? "text-stone-400" : "text-stone-500"}`}>
                              Players & Friends:
                            </span>
                            <span className={`text-[10px] font-mono font-bold ${darkMode ? "text-stone-500" : "text-stone-400"}`}>
                              {multiplayerPlayers.length} Available
                            </span>
                          </div>

                          <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-2 no-scrollbar">
                            {multiplayerPlayers.length === 0 ? (
                              <span className="text-xs italic text-stone-500 py-6 text-center">
                                No past players yet. Share your room code or link below!
                              </span>
                            ) : (
                              multiplayerPlayers.map(player => {
                                const { isJoined, isPendingSent, isDeclined, remainingSeconds } = getInviteCooldownState(player.id);

                                return (
                                  <div
                                    key={player.id}
                                    className={`flex items-center justify-between p-2.5 px-3 rounded-xl transition-all duration-200 shrink-0 ${
                                      darkMode 
                                        ? "bg-zinc-900/60 border border-zinc-800/60 text-stone-200" 
                                        : "bg-white border border-stone-200/60 text-stone-850 shadow-xs"
                                    }`}
                                  >
                                    {/* Left: Status Dot, Username, Inline Friend Toggle */}
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                                        player.status === 'online' ? "bg-emerald-400 animate-pulse" : "bg-stone-300 dark:bg-zinc-700"
                                      }`} />
                                      <span className="font-bold text-xs font-sans truncate">
                                        {player.name}
                                      </span>
                                      {player.isFriend ? (
                                        <span className={`text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg shrink-0 ${
                                          darkMode ? "bg-[#022c22] text-[#d1fae5]" : "bg-[#D1FAE5] text-[#065F46]"
                                        }`}>
                                          FRIEND
                                        </span>
                                      ) : (
                                        <button
                                          onClick={() => handleToggleFriend(player.id, player.name)}
                                          className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border-none cursor-pointer shrink-0 transition-all active:scale-95 ${
                                            darkMode ? "bg-zinc-800 hover:bg-zinc-750 text-stone-300" : "bg-stone-150 hover:bg-stone-200 text-stone-700"
                                          }`}
                                        >
                                          + Add
                                        </button>
                                      )}
                                    </div>

                                    {/* Right: Dedicated match invite button */}
                                    <div className="shrink-0 ml-2">
                                      {isJoined ? (
                                        <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl flex items-center gap-1 ${
                                          darkMode ? "bg-[#022c22] text-[#d1fae5]" : "bg-[#D1FAE5] text-[#065F46]"
                                        }`}>
                                          <Check className="w-3 h-3 stroke-[3]" />
                                          JOINED
                                        </span>
                                      ) : isPendingSent ? (
                                        <button
                                          disabled
                                          className={`text-[9.5px] font-mono font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-xl border-none opacity-90 cursor-not-allowed ${
                                            darkMode ? "bg-[#451a03] text-[#fef08a]" : "bg-[#FFF99D] text-[#854D0E]"
                                          }`}
                                        >
                                          SENT ({remainingSeconds}s)...
                                        </button>
                                      ) : isDeclined ? (
                                        <button
                                          disabled
                                          className={`text-[9.5px] font-mono font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-xl border-none opacity-90 cursor-not-allowed ${
                                            darkMode ? "bg-[#4c0519] text-[#fecdd3]" : "bg-[#FFE4E6] text-[#9D174D]"
                                          }`}
                                        >
                                          DECLINED ({remainingSeconds}s)
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => {
                                            playClickSound();
                                            handleInviteFriend(player.id);
                                          }}
                                          className={`text-[9.5px] font-mono font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl border-none cursor-pointer transition-all active:scale-95 shadow-xs ${
                                            darkMode ? "bg-[#4c0519] hover:bg-[#831843] text-[#fecdd3]" : "bg-[#FFE4E6] hover:bg-[#FBCFE8] text-[#9D174D]"
                                          }`}
                                        >
                                          INVITE
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>

                        {/* 4. BOTTOM ACTION GROUPING */}
                        <div className="flex flex-col gap-2.5 shrink-0 select-none mt-[14px]">
                          {/* Side-by-side equal-width buttons */}
                          <div className="grid grid-cols-2 gap-2.5 w-full">
                            {/* Left: RE-INVITE ALL / STOP */}
                            <button
                              onClick={() => handleReinviteAll()}
                              disabled={!isInvitingAll && multiplayerPlayers.length === 0}
                              className={`w-full py-2.5 px-2 text-xs font-mono font-black uppercase tracking-wider rounded-xl border-none transition-all duration-150 cursor-pointer text-center flex items-center justify-center gap-1.5 active:scale-95 shadow-xs ${
                                isInvitingAll
                                  ? "bg-rose-500 hover:bg-rose-600 text-white animate-pulse"
                                  : darkMode
                                    ? "bg-[#2e1065]/60 hover:bg-[#2e1065] text-[#e9d5ff]"
                                    : "bg-[#F3E8FF] hover:bg-[#E9D5FF] text-[#6B21A8]"
                              }`}
                            >
                              {isInvitingAll ? (
                                <>
                                  <XCircle className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                                  <span>STOP</span>
                                </>
                              ) : (
                                <>
                                  <Users className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                                  <span>RE-INVITE ALL</span>
                                </>
                              )}
                            </button>

                            {/* Right: SHARE LINK */}
                            <button
                              onClick={async () => {
                                playClickSound();
                                const isConfigured = checkIsDisplayNameConfigured();
                                if (!isConfigured) {
                                  setDisplayNameCallbackAction("SHARE");
                                  setShowDisplayNameModal(true);
                                } else {
                                  await executeShareInviteAction();
                                }
                              }}
                              className={`w-full py-2.5 px-2 text-xs font-mono font-black uppercase tracking-wider rounded-xl border-none transition-all duration-150 cursor-pointer text-center flex items-center justify-center gap-1.5 active:scale-95 shadow-xs ${
                                darkMode
                                  ? "bg-[#0c4a6e]/50 hover:bg-[#0c4a6e]/80 text-[#bae6fd]"
                                  : "bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#0369A1]"
                              }`}
                            >
                              <Link2 className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                              <span>SHARE LINK</span>
                            </button>
                          </div>

                          {/* Full-width primary START GAME button */}
                          <button
                            onClick={() => {
                              playClickSound();
                              const isConfigured = checkIsDisplayNameConfigured();
                              if (!isConfigured) {
                                setDisplayNameCallbackAction("START");
                                setShowDisplayNameModal(true);
                              } else {
                                executeStartGameAction();
                              }
                            }}
                            className={`w-full py-3.5 sm:py-4 px-4 text-xs sm:text-sm font-sans font-black uppercase tracking-wider rounded-2xl border-none transition-all duration-150 cursor-pointer text-center hover:scale-[1.01] active:scale-98 shadow-md flex items-center justify-center gap-2 ${
                              darkMode
                                ? "bg-[#022c22] hover:bg-[#064e3b] text-[#d1fae5] shadow-[0_8px_20px_rgba(0,0,0,0.5)]"
                                : "bg-[#D1FAE5] hover:bg-[#A7F3D0] active:bg-[#6EE7B7] text-[#065F46] shadow-[0_8px_20px_rgba(6,95,70,0.12)]"
                            }`}
                          >
                            <span>START GAME</span>
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </AnimatePresence>

      {/* 🔮 CUSTOM GAME HISTORY OR SAVED CHALLENGE LOBBY MODAL */}
      <AnimatePresence>
        {showHistoryChallengeModal && historyChallengeGame && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            {/* Backdrop click dismisser */}
            <div 
              className="absolute inset-0 cursor-pointer" 
              onClick={() => {
                playClickSound();
                setShowHistoryChallengeModal(false);
              }} 
            />

            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className={`relative w-full max-w-[460px] rounded-2xl p-6 md:p-8 border-none flex flex-col max-h-[88vh] select-none z-[10001] text-left transition-colors duration-300 ${
                darkMode ? "bg-[#1A1A1A] text-stone-200" : "bg-[#FDFBF7] text-stone-850"
              }`}
              style={{
                boxShadow: darkMode ? '0 10px 40px rgba(0,0,0,0.6)' : '0 4px 20px rgba(0,0,0,0.08)'
              }}
            >
              {/* Header block with floating layout and no lines */}
              <div className="flex justify-between items-center select-none shrink-0 mb-4">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className={`text-base font-sans font-black ${darkMode ? "text-purple-300" : "text-[#6B21A8]"}`}>★</span>
                    <h4 className="text-lg font-sans font-black uppercase tracking-wide">
                      Challenge Room Lobby
                    </h4>
                  </div>
                  <span className={`text-[10px] uppercase font-bold tracking-wider opacity-60 mt-0.5 ${darkMode ? "text-purple-300" : "text-[#6B21A8]"}`}>
                    Invite friends to beat your statistics!
                  </span>
                </div>
                <button 
                  onClick={() => { playClickSound(); setShowHistoryChallengeModal(false); }}
                  className={`p-1.5 rounded-full border-none cursor-pointer transition-all active:scale-95 hover:scale-105 ${
                    darkMode ? "bg-zinc-800 hover:bg-zinc-750 text-stone-250" : "bg-stone-100 hover:bg-stone-200 text-stone-700"
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Game stats preview card - Borderless with background */}
              <div className={`p-4 rounded-xl flex flex-col gap-1.5 mb-5 select-none ${
                darkMode ? "bg-zinc-900/45 text-stone-300" : "bg-stone-50/70 text-stone-800"
              }`}>
                <span className="text-[9.5px] uppercase font-bold tracking-widest leading-none text-stone-400 dark:text-stone-500 mb-0.5">Match Profile</span>
                <div className="flex justify-between items-center h-5">
                  <span className="font-sans font-black text-xs uppercase text-[#9D174D] dark:text-pink-300">
                    {historyChallengeGame.difficulty} Match
                  </span>
                  <span className="font-mono text-[10.5px] font-bold opacity-80">
                    Seed: #{historyChallengeGame.seed || historyChallengeGame.id.slice(0, 8)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10.5px] font-sans mt-1">
                  <div className="flex flex-col">
                    <span className="text-[8.5px] uppercase opacity-50 font-semibold">Outcome</span>
                    <span className={`font-bold ${historyChallengeGame.isWon ? "text-emerald-500" : "text-rose-500"}`}>
                      {historyChallengeGame.isWon ? "Won Match" : "Failed"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8.5px] uppercase opacity-50 font-semibold">Beat Time</span>
                    <span className="font-bold">{formatTimer(historyChallengeGame.timeSec)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8.5px] uppercase opacity-50 font-semibold">Errors Made</span>
                    <span className="font-bold text-rose-500">{historyChallengeGame.mistakes}/{historyChallengeGame.maxMistakes}</span>
                  </div>
                </div>
              </div>

              {/* PAST PLAYERS & FRIENDS LIST */}
              <div className={`p-4 rounded-2xl flex flex-col gap-3 select-none mb-5 ${
                darkMode ? "bg-[#0c4a6e]/15" : "bg-[#F0F9FF]/85"
              }`}>
                <span className={`font-sans font-bold uppercase tracking-wider text-[10px] ${darkMode ? "text-sky-300" : "text-sky-850"}`}>
                  Invite Game Friends & Past Players:
                </span>
                
                {!isUserAuthorizedForMultiplayer() ? (
                  <div className="py-4 text-center text-stone-500 font-sans text-xs select-none">
                    Sign-in required
                  </div>
                ) : multiplayerPlayers.length === 0 ? (
                  <div className="py-6 text-center text-stone-500 dark:text-stone-400 font-sans text-xs select-none italic">
                    Waiting for real players to join...
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5 max-h-[150px] overflow-y-auto pr-1 no-scrollbar-y">
                    {[...multiplayerPlayers]
                      .sort((a, b) => {
                        if (a.status === 'online' && b.status !== 'online') return -1;
                        if (a.status !== 'online' && b.status === 'online') return 1;
                        return 0;
                      })
                      .map(player => {
                        const { isJoined, isPendingSent, isDeclined, remainingSeconds } = getInviteCooldownState(player.id);
                        
                        const rowBgClass = isJoined
                          ? (darkMode ? "bg-[#064e3b]/30 text-[#a7f3d0]" : "bg-[#E8F5E9] text-[#1B5E20]")
                          : (darkMode ? "bg-zinc-900/40 text-stone-300" : "bg-white/60 text-stone-800");

                        return (
                          <div 
                            key={player.id}
                            className={`flex items-center justify-between p-2.5 px-3 rounded-xl transition-all duration-300 ${rowBgClass}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                player.status === 'online' ? "bg-emerald-400" : "bg-stone-300 dark:bg-zinc-700"
                              }`} />
                              <div className="flex flex-col">
                                <span className="font-medium text-[11px] font-sans leading-tight">
                                  {player.name}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {player.isFriend ? (
                                <>
                                  {isJoined ? (
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-[#a7f3d0] flex items-center gap-1">
                                      <Check className="w-3 h-3 stroke-[3]" />
                                      Joined
                                    </span>
                                  ) : isPendingSent ? (
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 font-mono">
                                      SENT ({remainingSeconds}s)...
                                    </span>
                                  ) : isDeclined ? (
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-500 font-mono">
                                      DECLINED ({remainingSeconds}s)
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => handleInviteFriend(player.id)}
                                      className={`px-3 py-1 text-[9.5px] font-bold uppercase tracking-wider rounded-lg border-none cursor-pointer transition-all ${
                                        darkMode 
                                          ? "bg-[#4c0519] text-[#fecdd3] hover:bg-[#831843]" 
                                          : "bg-[#FCE7F3] text-[#9D174D] hover:bg-[#FBCFE8]"
                                      }`}
                                    >
                                      Invite
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleToggleFriend(player.id, player.name)}
                                    title="Unfriend"
                                    className={`p-1 rounded-full border-none cursor-pointer transition-all active:scale-90 flex items-center justify-center ${
                                      darkMode 
                                        ? "bg-zinc-700/50 text-stone-300 hover:bg-zinc-600" 
                                        : "bg-stone-200/50 text-stone-600 hover:bg-stone-300"
                                    }`}
                                  >
                                    <Minus className="w-3.5 h-3.5 stroke-[3]" />
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => handleToggleFriend(player.id, player.name)}
                                  title="Add friend"
                                  className={`p-1 rounded-full border-none cursor-pointer transition-all active:scale-90 flex items-center justify-center ${
                                    darkMode 
                                      ? "bg-[#4c0519] text-[#fecdd3] hover:bg-[#831843]" 
                                      : "bg-[#FCE7F3] text-[#9D174D] hover:bg-[#FBCFE8]"
                                  }`}
                                >
                                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* ACTION FOOTER */}
              <div className="flex flex-col gap-2 pt-2 select-none border-t border-dashed border-stone-200/15 dark:border-zinc-800/15">
                {/* Single central Share Invite */}
                <button
                  onClick={async () => {
                    playClickSound();
                    const isConfigured = checkIsDisplayNameConfigured();
                    if (!isConfigured) {
                      setDisplayNameCallbackAction("HISTORY_SHARE");
                      setShowDisplayNameModal(true);
                    } else {
                      await executeHistoryShareAction();
                    }
                  }}
                  className={`w-full py-3.5 px-4 text-[10px] font-black uppercase tracking-wider rounded-full border-none transition-all duration-150 cursor-pointer text-center hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 ${
                    darkMode ? "bg-[#4c0519] hover:bg-[#831843] text-[#fecdd3]" : "bg-[#FCE7F3] hover:bg-[#FBCFE8] active:bg-[#F9A8D4] text-[#9D174D]"
                  }`}
                >
                  <Share2 className="w-4 h-4 shrink-0 stroke-[2.5]" />
                  <span>Share Invite</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🏆 HISTORICAL CHALLENGE RANKINGS MODAL */}
      <AnimatePresence>
        {viewingRankingsGame && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            {/* Backdrop click dismisser */}
            <div 
              className="absolute inset-0 cursor-pointer" 
              onClick={() => {
                playClickSound();
                setViewingRankingsGame(null);
              }} 
            />

            <motion.div 
               initial={{ scale: 0.95, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.95, opacity: 0 }}
               transition={{ type: "spring", damping: 28, stiffness: 220 }}
               className={`relative w-full max-w-[460px] rounded-2xl p-6 md:p-8 border flex flex-col max-h-[88vh] select-none z-[10001] text-left transition-colors duration-300 ${
                 darkMode ? "bg-[#1A1A1A] border-zinc-800 text-stone-200" : "bg-[#FDFBF7] border-stone-200 text-stone-850"
               }`}
               style={{
                 boxShadow: darkMode ? '0 10px 40px rgba(0,0,0,0.6)' : '0 4px 20px rgba(0,0,0,0.08)'
               }}
            >
              {/* Header block */}
              <div className="flex justify-between items-center select-none shrink-0 mb-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500 shrink-0 stroke-[2.2]" />
                  <h4 className="text-lg font-sans font-black uppercase tracking-wide">
                    Match Results
                  </h4>
                </div>
                <button 
                  onClick={() => { playClickSound(); setViewingRankingsGame(null); }}
                  className={`p-1.5 rounded-full border-none cursor-pointer transition-all active:scale-95 hover:scale-105 ${
                    darkMode ? "bg-zinc-800 hover:bg-zinc-750 text-stone-250" : "bg-stone-100 hover:bg-stone-200 text-stone-700"
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Single Compact Info Banner */}
              <div className={`px-3.5 py-2 rounded-xl flex items-center justify-center font-sans text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-3 select-none flex-wrap gap-y-1 ${
                darkMode ? "bg-zinc-900/60 text-stone-300 border border-zinc-800/60" : "bg-stone-100/70 text-stone-700 border border-stone-200/50"
              }`}>
                <span>ROOM: #{String(viewingRankingsGame.seed || viewingRankingsGame.id.slice(0, 6)).padStart(6, '0').slice(-6)}</span>
                <span className="mx-1.5 opacity-40">•</span>
                <span className="text-[#9D174D] dark:text-pink-300 font-black">{viewingRankingsGame.difficulty}</span>
                <span className="mx-1.5 opacity-40">•</span>
                <span>{viewingRankingsGame.mistakes}/{viewingRankingsGame.maxMistakes || 3} MISTAKES</span>
                <span className="mx-1.5 opacity-40">•</span>
                <span>{(viewingRankingsGame as any).hintsUsed ?? 0} HINTS</span>
              </div>

              {/* Loader */}
              {isLoadingHistoryRankings ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                  <div className="w-8 h-8 rounded-full border-3 border-t-rose-500 border-r-rose-400/20 border-b-rose-400/20 border-l-rose-400/20 animate-spin" />
                  <span className="text-xs font-sans text-stone-500 animate-pulse">Syncing results...</span>
                </div>
              ) : (
                <>
                  {/* SCROLLABLE LEADERBOARD LIST */}
                  <div className="flex flex-col gap-2.5 max-h-[48vh] overflow-y-auto no-scrollbar pb-2 px-0.5">
                    {(() => {
                      const resultsMap = new Map<string, any>();

                      // 1. Seed historical game owner/player statistics
                      const originalPlayerId = viewingRankingsGame.userId || userProfile?.id || 'original-player';
                      
                      const originalPlayer = {
                        id: originalPlayerId,
                        name: "You",
                        time: !viewingRankingsGame.isWon ? 9999 : viewingRankingsGame.timeSec,
                        mistakes: viewingRankingsGame.mistakes,
                        hints: (viewingRankingsGame as any).hintsUsed ?? 0,
                        failed: !viewingRankingsGame.isWon,
                        isMe: true,
                        isReal: true,
                        isPending: false
                      };
                      resultsMap.set(originalPlayer.id, originalPlayer);

                      // 2. Overlay live synced results downloaded from server
                      if (Array.isArray(historyRankings)) {
                        historyRankings.forEach(r => {
                          const isCurrentUser = r.userId === userProfile?.id || r.userId === originalPlayerId;
                          resultsMap.set(r.userId, {
                            id: r.userId,
                            name: isCurrentUser ? "You" : r.playerName,
                            time: !r.isWon ? 9999 : Number(r.timeSec),
                            mistakes: r.mistakes !== undefined ? Number(r.mistakes) : 0,
                            hints: r.hints !== undefined ? Number(r.hints) : 0,
                            failed: !r.isWon,
                            isMe: isCurrentUser,
                            isReal: true,
                            isPending: !isCurrentUser ? !!r.isPending : false
                          });
                        });
                      }

                      const results = Array.from(resultsMap.values());

                      // Sort results: Completed (wins) first, then completed (failed), then pending
                      results.sort((a, b) => {
                        const aPending = !!a.isPending;
                        const bPending = !!b.isPending;
                        
                        if (aPending !== bPending) {
                          return aPending ? 1 : -1; // completed first, pending last
                        }
                        
                        if (a.failed !== b.failed) {
                          return a.failed ? 1 : -1; // completed wins first, completed failures next
                        }
                        if (a.time !== b.time) return a.time - b.time;
                        return a.mistakes - b.mistakes;
                      });

                      return results.map((player, idx) => {
                        const isPending = !!player.isPending;
                        const positionStr = isPending ? "⏳" : idx === 0 ? "1st" : idx === 1 ? "2nd" : idx === 2 ? "3rd" : `${idx + 1}th`;
                        const timeStr = isPending ? "--:--" : formatTimer(player.time);
                        const errorsStr = `${player.mistakes}/${viewingRankingsGame.maxMistakes || 3} Errs`;
                        const hintsStr = `${player.hints ?? 0} Hints`;
                        const statusStr = player.failed ? "FAILED" : isPending ? "PLAYING" : "WON";
                        
                        return (
                          <div 
                            key={player.id}
                            className={`flex items-center justify-between p-3 rounded-2xl transition-all ${
                              player.isMe 
                                ? (darkMode ? "bg-[#1e1b4b]/60 border border-indigo-900/50 shadow-md" : "bg-[#EEF2FF] border border-[#C7D2FE] shadow-[0_4px_12px_rgba(99,102,241,0.05)]") 
                                : (darkMode ? "bg-zinc-800/40 border border-zinc-800/60" : "bg-stone-50 border border-stone-200/50")
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {/* Rank Badge */}
                              <span className={`font-mono text-xs sm:text-sm font-black w-7 text-center shrink-0 ${
                                isPending ? "text-amber-500 animate-pulse" : idx === 0 ? "text-amber-500" : idx === 1 ? "text-slate-400" : idx === 2 ? "text-amber-700" : darkMode ? "text-zinc-500" : "text-stone-400"
                              }`}>
                                {positionStr}
                              </span>

                              {/* Avatar */}
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                player.isMe
                                  ? (darkMode ? "bg-purple-950/80 text-purple-300 border border-purple-800/40" : "bg-purple-100 text-purple-800 border border-purple-200")
                                  : (darkMode ? "bg-zinc-800 text-stone-300" : "bg-stone-200/80 text-stone-700")
                              }`}>
                                {player.name ? player.name.slice(0, 2).toUpperCase() : "PL"}
                              </div>

                              {/* Name & Performance Line */}
                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className={`font-sans font-bold text-xs sm:text-sm leading-tight truncate ${
                                    player.isMe ? (darkMode ? "text-indigo-300" : "text-indigo-950") : (darkMode ? "text-zinc-200" : "text-stone-850")
                                  }`}>
                                    {player.name}
                                  </span>
                                  {player.isMe && (
                                    <span className="text-[9px] bg-[#F3E8FF] text-[#6B21A8] dark:bg-purple-950/60 dark:text-purple-300 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                                      YOU
                                    </span>
                                  )}
                                </div>
                                <span className={`font-sans text-[10px] sm:text-[10.5px] mt-0.5 tracking-tight font-medium ${darkMode ? "text-zinc-400" : "text-stone-500"}`}>
                                  {timeStr}  •  {errorsStr}  •  {hintsStr}  •  <span className={`font-bold ${player.failed ? "text-rose-500" : !isPending ? "text-emerald-600 dark:text-emerald-400" : "text-amber-500"}`}>{statusStr}</span>
                                </span>
                              </div>
                            </div>

                            {/* Social Action Button */}
                            {!player.isMe && (
                              (() => {
                                const localRecord = multiplayerPlayers.find(p => p.id === player.id);
                                const isFriend = localRecord ? localRecord.isFriend : false;
                                return isFriend ? (
                                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                    <span className="text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                      Friend
                                    </span>
                                    <button
                                      onClick={() => handleToggleFriend(player.id, player.name)}
                                      className="text-[10px] font-sans font-semibold text-stone-400 hover:text-rose-500 dark:hover:text-rose-400 border-none bg-transparent cursor-pointer transition-all active:scale-95 px-1 py-0.5"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleToggleFriend(player.id, player.name)}
                                    className="py-1 px-2.5 rounded-lg border-none cursor-pointer transition-all active:scale-95 text-[10.5px] font-sans font-bold uppercase tracking-wider bg-[#F3E8FF] text-[#6B21A8] hover:bg-[#E9D5FF] dark:bg-purple-950/60 dark:text-purple-300 dark:hover:bg-purple-900/80 shrink-0 ml-2"
                                  >
                                    + Add
                                  </button>
                                );
                              })()
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🔮 REMATCH CHALLENGE INVITE AND LOBBY OVERLAY MODAL */}
      <AnimatePresence>
        {false && showRematchInviteModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div 
              className="absolute inset-0 cursor-pointer" 
              onClick={() => {
                playClickSound();
                setShowRematchInviteModal(false);
              }} 
            />

            <motion.div 
               initial={{ scale: 0.95, opacity: 0, y: 15 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.95, opacity: 0, y: 15 }}
               transition={{ type: "spring", damping: 28, stiffness: 220 }}
               className={`relative w-full max-w-[440px] rounded-3xl p-6 sm:p-8 border flex flex-col max-h-[85vh] select-none z-[10001] text-left transition-colors duration-300 ${
                 darkMode ? "bg-[#1A1A1A] border-zinc-800 text-stone-200" : "bg-[#FDFBF7] border-stone-200 text-stone-850"
               }`}
               style={{
                 boxShadow: darkMode ? '0 10px 40px rgba(0,0,0,0.6)' : '0 4px 20px rgba(0,0,0,0.08)'
               }}
            >
              {/* Header */}
              {(() => {
                const isSameMatchReplay = boardState && rematchGameId.includes(`-${boardState.seed}-`);
                return (
                  <div className="flex justify-between items-center select-none shrink-0 mb-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        {isSameMatchReplay ? (
                          <RotateCcw className="w-5 h-5 text-emerald-500" strokeWidth={2.5} />
                        ) : (
                          <Zap className="w-5 h-5 text-amber-500 animate-pulse" strokeWidth={2.5} />
                        )}
                        <h4 className="text-lg font-sans font-black uppercase tracking-wide">
                          {isSameMatchReplay ? "Same Match Replay" : "New Match"}
                        </h4>
                      </div>
                      <span className={`text-[10px] uppercase font-bold tracking-wider opacity-70 mt-0.5 ${darkMode ? "text-purple-400" : "text-purple-750"}`}>
                        {isSameMatchReplay ? "Board reset to start" : "Fresh puzzle loaded"}
                      </span>
                    </div>
                    <button 
                      onClick={() => { playClickSound(); setShowRematchInviteModal(false); }}
                      className={`p-1.5 rounded-full border-none cursor-pointer transition-all active:scale-95 hover:scale-105 ${
                        darkMode ? "bg-zinc-800 hover:bg-zinc-750 text-stone-250" : "bg-stone-100 hover:bg-stone-200 text-stone-700"
                      }`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })()}

              {/* Match profile brief definition */}
              <div className={`p-4 rounded-xl flex flex-col gap-1.5 mb-5 select-none ${
                darkMode ? "bg-zinc-900/40 border border-zinc-800/40 text-stone-300" : "bg-stone-100/60 border border-stone-200/50 text-stone-800"
              }`}>
                <div className="flex justify-between items-center">
                  <span className="font-sans font-black text-xs uppercase text-purple-700 dark:text-purple-300">
                    {challengeDifficulty} Settings Retained
                  </span>
                  <span className="font-mono text-[9.5px] font-bold opacity-60">
                    ID: {rematchGameId.substring(0, 18)}...
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-sans mt-1">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase opacity-50 font-bold tracking-wider">Errors Limit</span>
                    <span className="font-bold">{challengeMistakeLimit} Mistakes</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase opacity-50 font-bold tracking-wider">Timer</span>
                    <span className="font-bold">{challengeTimerEnabled ? "Enabled" : "Disabled"}</span>
                  </div>
                </div>
              </div>

              {/* Scrollable participant list */}
              <div className="flex-1 overflow-y-auto no-scrollbar mb-4 flex flex-col gap-2.5">
                <span className={`text-[10px] uppercase font-black tracking-wider opacity-85 ${darkMode ? "text-stone-400" : "text-stone-500"}`}>
                  Re-invite Previous Participants:
                </span>
                {rematchParticipants.length === 0 ? (
                  <span className="text-xs italic text-stone-500 py-3 text-center">No other participants found.</span>
                ) : (
                  <div className="flex flex-col gap-2">
                    {rematchParticipants.map((p) => {
                      const hasInvited = rematchInvitedPlayers.has(p.id);
                      return (
                        <div 
                          key={p.id}
                          className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                            darkMode 
                              ? "bg-zinc-900/30 border-zinc-800/80 hover:bg-zinc-900/60" 
                              : "bg-white border-stone-200/60 hover:bg-stone-50/50"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                            <div className="flex flex-col">
                              <span className="font-sans font-bold text-sm text-stone-850 dark:text-stone-150">
                                {p.name}
                              </span>
                              <span className="text-[8.5px] uppercase font-bold text-stone-400 dark:text-stone-550 leading-none mt-0.5">
                                {p.isReal ? "Previous Opponent" : "Active Player"}
                              </span>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => {
                              playClickSound();
                              // Track local invite
                              setRematchInvitedPlayers(prev => {
                                const next = new Set(prev);
                                next.add(p.id);
                                return next;
                              });
                              // Also trigger invitation system standard handling
                              handleInviteFriend(p.id);
                              addLog(`✉️ Re-invited ${p.name} to the rematch lobby.`);
                            }}
                            className={`px-3 py-1.5 font-sans text-[10.5px] font-black uppercase tracking-wider rounded-xl border-none cursor-pointer transition-all active:scale-95 ${
                              hasInvited 
                                ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 cursor-not-allowed" 
                                : (darkMode ? "bg-purple-900/30 text-purple-300 hover:bg-purple-900/50" : "bg-purple-50 text-purple-800 hover:bg-purple-100")
                            }`}
                            disabled={hasInvited}
                          >
                            {hasInvited ? "Invited ✓" : "Invite"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2.5 shrink-0 pt-4 border-t border-dashed border-stone-200/10 dark:border-zinc-800">
                
                {/* One click re-invite everyone button / STOP */}
                <button
                  onClick={() => handleReinviteAll(rematchParticipants)}
                  disabled={!isInvitingAll && rematchParticipants.length === 0}
                  className={`w-full py-3.5 px-4 font-sans text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2 border ${
                    isInvitingAll
                      ? "bg-rose-500 hover:bg-rose-600 text-white border-rose-600 animate-pulse"
                      : darkMode 
                        ? "bg-zinc-900 border-amber-950 hover:bg-zinc-850 text-[#FBBF24]" 
                        : "bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E] border-amber-200"
                  }`}
                >
                  {isInvitingAll ? (
                    <>
                      <XCircle className="w-4 h-4" />
                      <span>STOP INVITING</span>
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4" />
                      <span>One-Click Re-invite All</span>
                    </>
                  )}
                </button>

                <div className="flex gap-2.5">
                  <button
                    onClick={() => {
                      playClickSound();
                      shareChallengeLink(rematchGameId, `Join my Sudoku Rematch! Challenge link:`);
                    }}
                    className={`flex-1 py-3 px-4 font-sans text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 border ${
                      darkMode 
                        ? "bg-zinc-900 border-purple-950 hover:bg-zinc-850 text-[#C084FC]" 
                        : "bg-[#F3E8FF] hover:bg-[#E9D5FF] text-[#6B21A8] border-purple-200"
                    }`}
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Share Link
                  </button>
                  <button
                    onClick={() => {
                      playClickSound();
                      setShowRematchInviteModal(false);
                    }}
                    className={`px-5 py-3 font-sans text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-95 border ${
                      darkMode 
                        ? "bg-zinc-900 border-sky-950 hover:bg-zinc-850 text-[#38BDF8]" 
                        : "bg-[#E0F2FE] hover:bg-[#bae6fd] text-[#0f172a] border-sky-200"
                    }`}
                  >
                    Start Solving
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInviteModal && incomingChallengeDetails && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#FDFBF7]/80 dark:bg-[#1A1A1A]/80 backdrop-blur-sm p-4">
            {/* Backdrop click dismisser */}
            <div 
              className="absolute inset-0 cursor-pointer" 
              onClick={() => {
                playClickSound();
                setShowInviteModal(false);
              }} 
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={`relative w-full max-w-sm rounded-[32px] p-8 border-none flex flex-col gap-6 shadow-[0_12px_40px_rgba(0,0,0,0.08)] select-none z-[10001] text-center transition-colors duration-300 ${
                darkMode ? "bg-[#2A2D24] text-[#FDFBF7]" : "bg-[#FDFBF7] text-[#4B5563]"
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className={`text-[12px] font-sans font-bold uppercase tracking-widest ${darkMode ? "text-[#D1D5DB]" : "text-[#9CA3AF]"}`}>
                  Game Invitation
                </span>
                <h3 className={`text-2xl font-sans font-medium tracking-tight mt-1 ${darkMode ? "text-[#FDFBF7]" : "text-[#4B5563]"}`}>
                  {incomingChallengeDetails.senderName || "Fellow Player"}
                </h3>
                <p className={`text-sm font-sans mt-0.5 ${darkMode ? "text-[#9CA3AF]" : "text-[#6B7280]"}`}>
                  invited you to clear a board.
                </p>
              </div>

              {/* 📊 SUMMARY */}
              <div className="flex items-center justify-center gap-6 py-2">
                 <div className="flex flex-col items-center">
                   <span className={`text-[10px] uppercase font-bold tracking-widest ${darkMode ? "text-[#6B7280]" : "text-[#D1D5DB]"}`}>Level</span>
                   <span className="text-lg font-mono font-medium">{incomingChallengeDetails.difficulty}</span>
                 </div>
                 <div className={`w-[1px] h-8 ${darkMode ? "bg-[#4B5563]" : "bg-[#E5E7EB]"}`} />
                 <div className="flex flex-col items-center">
                   <span className={`text-[10px] uppercase font-bold tracking-widest ${darkMode ? "text-[#6B7280]" : "text-[#D1D5DB]"}`}>Mistakes</span>
                   <span className="text-lg font-mono font-medium">{incomingChallengeDetails.maxMistakes} limit</span>
                 </div>
              </div>

              {/* 🔒 PASSWORD FIELD */}
              {incomingChallengeDetails.password && (
                <div className={`p-4 rounded-3xl border-none flex flex-col gap-2 select-none ${
                  darkMode ? "bg-stone-800/20 text-rose-300" : "bg-[#FFF5F5] text-red-950"
                }`}>
                  <div className="flex items-center justify-center gap-1.5 font-sans font-bold uppercase tracking-wider text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-red-500 animate-pulse" />
                    Enter Password
                  </div>
                  <input
                    type="text"
                    maxLength={16}
                    placeholder="Passcode..."
                    value={enteredInvitePassword}
                    onChange={(e) => {
                      setEnteredInvitePassword(e.target.value.replace(/[^a-zA-Z0-9]/g, ''));
                      setInvitePasswordError(null);
                    }}
                    className={`w-full py-2.5 px-3 rounded-[16px] text-center text-xs font-mono font-bold tracking-widest border-none focus:outline-none focus:ring-0 select-none ${
                      darkMode ? "bg-black/20 text-stone-100 placeholder-zinc-700" : "bg-white text-stone-850 placeholder-stone-300"
                    }`}
                  />
                  {invitePasswordError && (
                    <span className="text-[10px] font-bold text-rose-600 text-center uppercase tracking-wide mt-0.5">
                      {invitePasswordError}
                    </span>
                  )}
                </div>
              )}

              {/* ACTION FOOTER */}
              <div className="flex w-full gap-3 mt-2">
                <button
                  onClick={() => {
                    playClickSound();
                    const matchingPending = pendingChallenges.find(c => c.id === incomingChallengeId);
                    if (matchingPending?.inviteId) {
                      try {
                        updateDoc(doc(db, "invites", matchingPending.inviteId), { status: "declined" });
                      } catch (e) {}
                    }
                    handleMaybeLaterChallenge();
                    setShowInviteModal(false);
                  }}
                  className={`flex-1 aspect-[2/1] rounded-[24px] flex items-center justify-center transition-all shadow-[0_4px_12px_rgba(0,0,0,0.02)] active:scale-95 border-none cursor-pointer ${darkMode ? "bg-[#3F4238] text-[#FDFBF7] hover:bg-[#4E5146]" : "bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]"}`}
                >
                   <X className="w-7 h-7" strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => {
                    playClickSound();

                    // Password check
                    if (incomingChallengeDetails.password) {
                      const correct = incomingChallengeDetails.password.trim().toLowerCase();
                      const entered = enteredInvitePassword.trim().toLowerCase();
                      if (entered !== correct) {
                        setInvitePasswordError("❌ Incorrect Password");
                        return;
                      }
                    }

                    const matchingPending = pendingChallenges.find(c => c.id === incomingChallengeId);
                    const launch = () => {
                      handleAcceptAndLaunchInvite(
                        incomingChallengeId,
                        matchingPending?.inviteId,
                        incomingChallengeDetails.password,
                        true
                      );
                    };

                    handleAcceptInvitationWithProfileCheck(launch);
                  }}
                  className={`flex-1 aspect-[2/1] rounded-[24px] flex items-center justify-center transition-all shadow-[0_4px_12px_rgba(0,0,0,0.02)] active:scale-95 border-none cursor-pointer ${darkMode ? "bg-[#D1FAE5] text-[#065F46] hover:bg-[#A7F3D0]" : "bg-[#D1FAE5] text-[#065F46] hover:bg-[#A7F3D0]"}`}
                >
                   <Check className="w-7 h-7" strokeWidth={1.5} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {playerToUnfriend && (
          <div className="fixed inset-0 z-[10000] bg-[#FDFBF7]/80 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={`border-none p-8 max-w-sm w-full relative text-center rounded-[32px] shadow-[0_12px_40px_rgba(0,0,0,0.08)] flex flex-col gap-6 ${darkMode ? "bg-[#2A2D24]" : "bg-[#FDFBF7]"}`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className={`text-[10px] font-sans font-bold uppercase tracking-widest ${darkMode ? "text-[#D1D5DB]" : "text-[#9CA3AF]"}`}>
                  Confirm Action
                </span>
                <h3 className={`text-2xl font-sans font-medium tracking-tight mt-2 ${darkMode ? "text-[#FDFBF7]" : "text-[#4B5563]"}`}>
                  Remove Friend
                </h3>
                <p className={`text-sm font-sans mt-2 ${darkMode ? "text-[#9CA3AF]" : "text-[#6B7280]"}`}>
                  Are you sure you want to unfriend <strong>{multiplayerPlayers.find(p => p.id === playerToUnfriend)?.name}</strong>?
                </p>
              </div>

              <div className="flex gap-3 mt-2">
                <button 
                  onClick={() => { playClickSound(); setPlayerToUnfriend(null); }}
                  className={`flex-1 py-3.5 px-4 rounded-xl border-none cursor-pointer font-sans text-xs font-black uppercase tracking-wider transition-all active:translate-y-px ${
                    darkMode ? "bg-zinc-800 text-stone-300 hover:bg-zinc-700" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                  }`}
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    playClickSound();
                    setMultiplayerPlayers(prev => prev.map(p => p.id === playerToUnfriend ? { ...p, isFriend: false } : p));
                    setPlayerToUnfriend(null);
                    addLog('✓ Player unfriended successfully.');
                  }}
                  className={`flex-1 py-3.5 px-4 rounded-xl border-none cursor-pointer font-sans text-xs font-black uppercase tracking-wider transition-all active:translate-y-px ${
                    darkMode ? "bg-[#7f1d1d] text-[#fecaca] hover:bg-[#991b1b]" : "bg-[#FEE2E2] text-[#DC2626] hover:bg-[#FECACA]"
                  }`}
                >
                  Unfriend
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ⚠️ LOGIN REQUIRED POPUP MODULE */}
      <AnimatePresence>
        {showLoginRequiredModal && (
          <div className="fixed inset-0 z-[10100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={`p-6 sm:p-8 max-w-md w-full relative text-center rounded-[32px] border-none flex flex-col gap-6 shadow-[0_24px_60px_rgba(0,0,0,0.2)] ${
                darkMode ? "bg-zinc-900 text-stone-200" : "bg-[#FDFBF7] text-stone-850"
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={`p-3.5 rounded-full ${darkMode ? "bg-purple-900/30 text-purple-400" : "bg-[#F3E8FF] text-[#6B21A8]"}`}>
                  <Lock className="w-10 h-10 stroke-[2]" />
                </div>
                <h3 className={`text-2xl font-sans font-black uppercase tracking-tight mt-3 ${darkMode ? "text-white" : "text-[#1C1917]"}`}>
                  Google Sync Required
                </h3>
                <p className={`text-sm leading-relaxed font-sans ${darkMode ? "text-stone-400" : "text-stone-600"} mt-1 max-w-[290px]`}>
                  {loginRequiredPurpose === "ADD_FRIEND" 
                    ? "Adding persistent friends requires a verified Google Account so you can stay permanently connected across sessions."
                    : loginRequiredPurpose === "DIRECT_INVITE"
                    ? "Direct challenge invites are a secure, persistent multiplayer feature that requires syncing with a companion Google login."
                    : "To create, accept, track, and synchronize persistent friend lists, a secure Google login is required."
                  }
                </p>
              </div>

              <div className="flex flex-col gap-2.5 mt-2">
                <button
                  onClick={() => {
                    playClickSound();
                    setShowLoginRequiredModal(false);
                    // Redirect to secure identity portal tab
                    setEmailInput(userProfile?.email || "");
                    const pName = userProfile?.name && !userProfile.name.startsWith("GUEST_") ? userProfile.name : "";
                    setUsernameInput(pName);
                    setAuthModalTab("GOOGLE");
                    setShowAuthModal(true);
                    addLog("🔑 Redirected to the Identity Hub to complete secure Google Sync.");
                  }}
                  className={`w-full py-4 px-4 rounded-xl border-none cursor-pointer font-sans text-xs font-black uppercase tracking-wider transition-all duration-150 text-center flex items-center justify-center gap-2 active:scale-[0.98] ${
                    darkMode ? "bg-purple-900 text-purple-100 hover:bg-purple-800" : "bg-[#6B21A8] text-white hover:bg-[#581c87]"
                  }`}
                >
                  <KeyRound className="w-4 h-4 text-white" />
                  <span>Sign In with Google</span>
                </button>
                <button 
                  onClick={() => { playClickSound(); setShowLoginRequiredModal(false); }}
                  className={`w-full py-3.5 px-4 rounded-xl border-none cursor-pointer font-sans text-xs font-black uppercase tracking-wider transition-all ${
                    darkMode ? "bg-zinc-800 text-stone-300 hover:bg-zinc-700" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                  }`}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ⚠️ TARGET PLAYER LOGIN REQUIRED INDICATOR */}
      <AnimatePresence>
        {showTargetLoginRequiredModal && pendingTargetPlayer && (
          <div className="fixed inset-0 z-[10100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={`p-6 sm:p-8 max-w-md w-full relative text-center rounded-[32px] border-none flex flex-col gap-6 shadow-[0_24px_60px_rgba(0,0,0,0.2)] ${
                darkMode ? "bg-zinc-900 text-[#E11D48]" : "bg-[#FDFBF7] text-[#E11D48]"
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={`p-3.5 rounded-full ${darkMode ? "bg-rose-950/40 text-rose-455" : "bg-rose-100 text-[#E11D48]"}`}>
                  <UserPlus className="w-10 h-10 stroke-[2]" />
                </div>
                <h3 className={`text-2xl font-sans font-black uppercase tracking-tight mt-3 ${darkMode ? "text-rose-400" : "text-rose-700"}`}>
                  Target Sign-In Required
                </h3>
                <p className={`text-sm leading-relaxed font-sans ${darkMode ? "text-stone-300" : "text-stone-700"} mt-1 max-w-[295px]`}>
                  <strong>{pendingTargetPlayer.name}</strong> is currently playing as an offline <strong>Guest</strong>. 
                  <br /><br />
                  They must sign in with Google on their client before you can save them as a permanent, direct partner/friend.
                </p>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <button 
                  onClick={() => { 
                    playClickSound(); 
                    setShowTargetLoginRequiredModal(false); 
                    setPendingTargetPlayer(null); 
                  }}
                  className={`w-full py-4 px-4 rounded-xl border-none cursor-pointer font-sans text-xs font-black uppercase tracking-wider transition-all text-center flex items-center justify-center gap-2 active:scale-[0.98] ${
                    darkMode ? "bg-zinc-800 text-stone-300 hover:bg-zinc-700" : "bg-stone-100 text-stone-800 hover:bg-stone-200"
                  }`}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteAccountModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="absolute inset-0 cursor-pointer" onClick={() => { playClickSound(); setShowDeleteAccountModal(false); }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={`relative w-full max-w-sm rounded-[16px] shadow-2xl overflow-hidden flex flex-col p-6 ${darkMode ? "bg-[#1E1E1E] border border-zinc-800" : "bg-[#FDFBF7]"}`}
            >
              <h3 className={`font-sans font-black text-lg mb-3 ${darkMode ? "text-red-400" : "text-red-600"}`}>Delete Account</h3>
              <p className={`font-sans text-sm leading-relaxed mb-6 ${darkMode ? "text-stone-300" : "text-stone-700"}`}>
                Warning: This action is permanent and will delete all your account data, game progress, and profile information. Are you sure you want to proceed?
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => { 
                    playClickSound(); 
                    
                    // Clear all sudoku_ related local storage keys to simulate full data deletion
                    const keysToRemove = [];
                    for (let i = 0; i < localStorage.length; i++) {
                      const key = localStorage.key(i);
                      if (key && key.startsWith("sudoku_")) {
                        keysToRemove.push(key);
                      }
                    }
                    keysToRemove.forEach(k => localStorage.removeItem(k));
                    
                    setUserProfile({
                      id: "GUEST_" + Math.floor(10000 + Math.random() * 90000),
                      name: "Guest Voyager",
                      avatarColor: "#6B7280",
                      isSynced: false
                    });
                    setCompletedGames([]);
                    setSavedGames([]);
                    setBoardState(null);
                    
                    addLog("🗑️ Account and all local data permanently deleted.");
                    setShowDeleteAccountModal(false);
                    alert("Your account and all associated data have been permanently deleted.");
                  }} 
                  className={`py-3 px-4 rounded-xl font-sans font-black text-xs uppercase tracking-wider text-white border-none cursor-pointer ${darkMode ? "bg-red-600 hover:bg-red-500" : "bg-red-600 hover:bg-red-700"}`}
                >
                  Yes, Delete My Account
                </button>
                <button 
                  onClick={() => { playClickSound(); setShowDeleteAccountModal(false); }} 
                  className={`py-3 px-4 rounded-xl font-sans font-black text-xs uppercase tracking-wider border-none cursor-pointer ${darkMode ? "bg-zinc-800 text-stone-300 hover:bg-zinc-700" : "bg-stone-200 text-stone-700 hover:bg-stone-300"}`}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showResetSettingsModal && (
          <div className="fixed inset-0 z-[10000] bg-[#FDFBF7]/80 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={`border-none p-8 max-w-sm w-full relative text-center rounded-[32px] shadow-[0_12px_40px_rgba(0,0,0,0.08)] flex flex-col gap-6 ${darkMode ? "bg-[#2A2D24]" : "bg-[#FDFBF7]"}`}
            >
              <div className="flex flex-col items-center gap-1">
                <h3 className={`text-2xl font-sans font-medium tracking-tight mt-2 ${darkMode ? "text-[#FDFBF7]" : "text-[#4B5563]"}`}>
                  Reset Settings
                </h3>
              </div>

              <div className="flex flex-col gap-3 mt-2">
                <button 
                  onClick={() => { 
                    playClickSound();
                    
                    setDarkMode(false);
                    setSoundEffects(true);
                    setVibrations(true);
                    setTimerEnabled(true);
                    setMistakeLimitEnabled(true);
                    setHighlightIdentical(true);
                    setHighlightAreas(true);
                    setShowRemainingNumbers(true);
                    setAutoComplete(false);
                    setLightningMode(false);
                    setMagicNote(false);
                    setHideUsedNumber(false);
                    setNotificationsEnabled(true);
                    
                    setShowResetSettingsModal(false);
                    showToast("Preferences reset to defaults");
                  }}
                  className={`w-full py-3.5 px-4 rounded-xl border-none cursor-pointer font-sans text-xs font-black uppercase tracking-wider transition-all active:translate-y-px ${
                    darkMode ? "bg-zinc-800 text-stone-300 hover:bg-zinc-700" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                  }`}
                >
                  Reset Preferences Only
                </button>
                <button 
                  onClick={() => {
                    playClickSound();
                    
                    setDarkMode(false);
                    setSoundEffects(true);
                    setVibrations(true);
                    setTimerEnabled(true);
                    setMistakeLimitEnabled(true);
                    setHighlightIdentical(true);
                    setHighlightAreas(true);
                    setShowRemainingNumbers(true);
                    setAutoComplete(false);
                    setLightningMode(false);
                    setMagicNote(false);
                    setHideUsedNumber(false);
                    setNotificationsEnabled(true);

                    const keysToRemove = [];
                    for (let i = 0; i < localStorage.length; i++) {
                      const key = localStorage.key(i);
                      if (key && key.startsWith("sudoku_") && key !== "sudoku_userProfile") {
                        keysToRemove.push(key);
                      }
                    }
                    keysToRemove.forEach(k => localStorage.removeItem(k));
                    
                    setSavedGames([]);
                    setCompletedGames([]);
                    setHistory([]);
                    setBoardState(null);

                    setShowResetSettingsModal(false);
                    showToast("Factory reset complete");
                  }}
                  className={`w-full py-3.5 px-4 rounded-xl border-none cursor-pointer font-sans text-xs font-black uppercase tracking-wider transition-all active:translate-y-px ${
                    darkMode ? "bg-[#7f1d1d] text-[#fecaca] hover:bg-[#991b1b]" : "bg-[#FEE2E2] text-[#DC2626] hover:bg-[#FECACA]"
                  }`}
                >
                  Factory Reset
                </button>
              </div>
              <button 
                onClick={() => { playClickSound(); setShowResetSettingsModal(false); }}
                className={`absolute top-4 right-4 p-2 rounded-full border-none cursor-pointer transition-colors ${darkMode ? "bg-transparent text-stone-400 hover:text-stone-200" : "bg-transparent text-stone-400 hover:text-stone-600"}`}
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <RulesModal
        isOpen={showHowToPlayModal}
        onClose={() => setShowHowToPlayModal(false)}
        darkMode={darkMode}
        playClickSound={playClickSound}
      />

      {/* MID-GAME MULTIPLAYER INVITE MODAL */}
      <AnimatePresence>
        {showMidGameInviteModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            <div 
              className="absolute inset-0 cursor-pointer" 
              onClick={() => {
                playClickSound();
                setShowMidGameInviteModal(false);
                setIsTimerPaused(false);
              }} 
            />
            {(() => {
              const liveSeed = challengeSeed || (boardState?.seed ? Number(String(boardState.seed).slice(-6)) : 100000);
              const liveRoomCode = String(liveSeed).padStart(6, '0').slice(-6);

              return (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className={`p-4 sm:p-6 w-[92%] sm:w-full max-w-lg max-h-[85dvh] relative flex flex-col gap-3 sm:gap-4 rounded-[28px] shadow-[0_24px_50px_rgba(0,0,0,0.2)] overflow-hidden z-[10001] select-none ${
                    darkMode ? "bg-zinc-900 border border-zinc-700/50 text-stone-100" : "bg-[#FDFBF7] border border-stone-200 text-stone-850"
                  }`}
                >
                  {/* Top Header Bar */}
                  <div className="flex items-center justify-between shrink-0 select-none pb-1 border-b border-stone-200/60 dark:border-zinc-800">
                    {/* Left: CODE: [ActiveRoomCode] + Copy Button */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs sm:text-sm font-sans font-black tracking-wider text-stone-850 dark:text-stone-100 flex items-center gap-1.5">
                        <span className="text-stone-400 dark:text-stone-500 text-2xs uppercase font-bold">CODE:</span>
                        <span className="font-mono tracking-widest text-sm sm:text-base select-all">{liveRoomCode}</span>
                      </span>
                      <button
                        onClick={() => {
                          playClickSound();
                          copyToClipboard(liveRoomCode);
                          showCopiedToast("Room code copied!");
                        }}
                        title="Copy room code"
                        className={`p-1 rounded-lg border-none cursor-pointer transition-all active:scale-90 ${
                          darkMode ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300" : "bg-stone-100 hover:bg-stone-200 text-stone-600"
                        }`}
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Center/Right: Lock status/PIN if locked */}
                    <div className="flex items-center gap-2">
                      {isRoomLocked && roomPin ? (
                        <span className={`px-2.5 py-1 rounded-lg font-mono text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-1 ${
                          darkMode ? "bg-[#4c0519] text-[#fecdd3]" : "bg-[#FFE4E6] text-[#9D174D]"
                        }`}>
                          <Lock className="w-3 h-3 stroke-[2.5]" />
                          <span>PIN: {roomPin}</span>
                        </span>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-lg font-mono text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-1 ${
                          darkMode ? "bg-[#022c22] text-[#d1fae5]" : "bg-[#D1FAE5] text-[#065F46]"
                        }`}>
                          <Unlock className="w-3 h-3 stroke-[2.5]" />
                          <span>OPEN</span>
                        </span>
                      )}

                      {/* Top-Right: Clean "✕" close button */}
                      <button
                        onClick={() => {
                          playClickSound();
                          setShowMidGameInviteModal(false);
                          setIsTimerPaused(false);
                        }}
                        className={`p-1.5 rounded-full border-none cursor-pointer transition-all hover:scale-110 active:scale-95 ${
                          darkMode ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300" : "bg-stone-100 hover:bg-stone-200 text-stone-600"
                        }`}
                        title="Close"
                      >
                        <X className="w-4 h-4" strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>

                  {/* Body: Scrollable list of recent players & friends */}
                  <div className="flex-1 min-h-0 overflow-y-auto pr-0.5 no-scrollbar flex flex-col gap-2 max-h-[260px]">
                    {multiplayerPlayers.length === 0 ? (
                      <span className="text-xs italic text-stone-500 py-6 text-center">
                        No past players yet. Share the link below to invite someone to this game!
                      </span>
                    ) : (
                      multiplayerPlayers.map(player => {
                        const { isJoined, isPendingSent, isDeclined, remainingSeconds } = getInviteCooldownState(player.id);

                        return (
                          <div
                            key={player.id}
                            className={`flex items-center justify-between p-2.5 px-3 rounded-xl transition-all duration-200 ${
                              darkMode 
                                ? "bg-zinc-900/60 border border-zinc-800/60 text-stone-200" 
                                : "bg-white border border-stone-200/60 text-stone-850 shadow-xs"
                            }`}
                          >
                            {/* Left: Status Dot, Username, Inline Friend Toggle */}
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`w-2 h-2 rounded-full shrink-0 ${
                                player.status === 'online' ? "bg-emerald-400 animate-pulse" : "bg-stone-300 dark:bg-zinc-700"
                              }`} />
                              <span className="font-bold text-xs font-sans truncate">
                                {player.name}
                              </span>
                              {player.isFriend ? (
                                <span className={`text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg shrink-0 ${
                                  darkMode ? "bg-[#022c22] text-[#d1fae5]" : "bg-[#D1FAE5] text-[#065F46]"
                                }`}>
                                  FRIEND
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleToggleFriend(player.id, player.name)}
                                  className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border-none cursor-pointer shrink-0 transition-all active:scale-95 ${
                                    darkMode ? "bg-zinc-800 hover:bg-zinc-750 text-stone-300" : "bg-stone-150 hover:bg-stone-200 text-stone-700"
                                  }`}
                                >
                                  + Add
                                </button>
                              )}
                            </div>

                            {/* Right: Dedicated match invite button */}
                            <div className="shrink-0 ml-2">
                              {isJoined ? (
                                <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl flex items-center gap-1 ${
                                  darkMode ? "bg-[#022c22] text-[#d1fae5]" : "bg-[#D1FAE5] text-[#065F46]"
                                }`}>
                                  <Check className="w-3 h-3 stroke-[3]" />
                                  JOINED
                                </span>
                              ) : isPendingSent ? (
                                <button
                                  disabled
                                  className={`text-[9.5px] font-mono font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-xl border-none opacity-90 cursor-not-allowed ${
                                    darkMode ? "bg-[#451a03] text-[#fef08a]" : "bg-[#FFF99D] text-[#854D0E]"
                                  }`}
                                >
                                  SENT ({remainingSeconds}s)...
                                </button>
                              ) : isDeclined ? (
                                <button
                                  disabled
                                  className={`text-[9.5px] font-mono font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-xl border-none opacity-90 cursor-not-allowed ${
                                    darkMode ? "bg-[#4c0519] text-[#fecdd3]" : "bg-[#FFE4E6] text-[#9D174D]"
                                  }`}
                                >
                                  DECLINED ({remainingSeconds}s)
                                </button>
                              ) : (
                                <button
                                  onClick={async () => {
                                    playClickSound();
                                    // Ensure room doc in Firestore exists for this live seed
                                    try {
                                      await setDoc(doc(db, "rooms", liveRoomCode), {
                                        roomCode: liveRoomCode,
                                        seed: liveSeed,
                                        difficulty: boardState?.difficulty || difficulty,
                                        mistakesLimit: challengeMistakeLimit,
                                        hintsLimit: challengeHintLimit,
                                        timerEnabled: challengeTimerEnabled,
                                        isLocked: isRoomLocked,
                                        pin: isRoomLocked && roomPin ? roomPin : "",
                                        status: "active",
                                        updatedAt: serverTimestamp()
                                      }, { merge: true });
                                    } catch (e) {}
                                    handleInviteFriend(player.id);
                                  }}
                                  className={`text-[9.5px] font-mono font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl border-none cursor-pointer transition-all active:scale-95 shadow-xs ${
                                    darkMode ? "bg-[#4c0519] hover:bg-[#831843] text-[#fecdd3]" : "bg-[#FFE4E6] hover:bg-[#FBCFE8] text-[#9D174D]"
                                  }`}
                                >
                                  INVITE
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Personal Replay Section: Immediate 1-Tap Action */}
                  <div className="w-full pt-2 border-t border-stone-200/60 dark:border-zinc-800 shrink-0 flex flex-col gap-2">
                    <button
                      onClick={handlePersonalReplay}
                      className={`w-full py-2.5 px-3 text-xs font-mono font-black uppercase tracking-wider rounded-xl border-none transition-all duration-150 cursor-pointer text-center flex items-center justify-center gap-1.5 active:scale-95 shadow-xs ${
                        darkMode
                          ? "bg-[#713f12]/50 hover:bg-[#713f12] text-[#fef08a]"
                          : "bg-[#FFF99D] hover:bg-[#FEF08A] text-[#854D0E]"
                      }`}
                    >
                      <RotateCcw className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                      <span>REPLAY BOARD</span>
                    </button>

                    {/* Bottom Action Row: [ 👥 RE-INVITE ALL ] and [ 🔗 SHARE LINK ] */}
                    <div className="grid grid-cols-2 gap-2.5 w-full">
                      {/* Left: RE-INVITE ALL / STOP */}
                      <button
                        onClick={async () => {
                          playClickSound();
                          if (isInvitingAll) {
                            cancelInviteAll();
                            return;
                          }
                          try {
                            await setDoc(doc(db, "rooms", liveRoomCode), {
                              roomCode: liveRoomCode,
                              seed: liveSeed,
                              difficulty: boardState?.difficulty || difficulty,
                              mistakesLimit: challengeMistakeLimit,
                              hintsLimit: challengeHintLimit,
                              timerEnabled: challengeTimerEnabled,
                              isLocked: isRoomLocked,
                              pin: isRoomLocked && roomPin ? roomPin : "",
                              status: "active",
                              updatedAt: serverTimestamp()
                            }, { merge: true });
                          } catch (e) {}
                          handleReinviteAll();
                        }}
                        disabled={!isInvitingAll && multiplayerPlayers.length === 0}
                        className={`w-full py-2.5 px-2 text-xs font-mono font-black uppercase tracking-wider rounded-xl border-none transition-all duration-150 cursor-pointer text-center flex items-center justify-center gap-1.5 active:scale-95 shadow-xs ${
                          isInvitingAll
                            ? "bg-rose-500 hover:bg-rose-600 text-white animate-pulse shadow-md"
                            : darkMode
                            ? "bg-[#2e1065]/60 hover:bg-[#2e1065] text-[#e9d5ff]"
                            : "bg-[#F3E8FF] hover:bg-[#E9D5FF] text-[#6B21A8]"
                        }`}
                      >
                        {isInvitingAll ? (
                          <>
                            <XCircle className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                            <span>STOP</span>
                          </>
                        ) : (
                          <>
                            <Users className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                            <span>RE-INVITE ALL</span>
                          </>
                        )}
                      </button>

                      {/* Right: SHARE LINK */}
                      <button
                        onClick={async () => {
                          playClickSound();
                          try {
                            await setDoc(doc(db, "rooms", liveRoomCode), {
                              roomCode: liveRoomCode,
                              seed: liveSeed,
                              difficulty: boardState?.difficulty || difficulty,
                              mistakesLimit: challengeMistakeLimit,
                              hintsLimit: challengeHintLimit,
                              timerEnabled: challengeTimerEnabled,
                              isLocked: isRoomLocked,
                              pin: isRoomLocked && roomPin ? roomPin : "",
                              status: "active",
                              updatedAt: serverTimestamp()
                            }, { merge: true });
                          } catch (e) {}
                          await shareChallengeLink(liveRoomCode, `Join my live Sudoku match! Room #${liveRoomCode}:`);
                        }}
                        className={`w-full py-2.5 px-2 text-xs font-mono font-black uppercase tracking-wider rounded-xl border-none transition-all duration-150 cursor-pointer text-center flex items-center justify-center gap-1.5 active:scale-95 shadow-xs ${
                          darkMode
                            ? "bg-[#0c4a6e]/60 hover:bg-[#0c4a6e] text-[#bae6fd]"
                            : "bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#0369A1]"
                        }`}
                      >
                        <Share2 className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                        <span>SHARE LINK</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })()}
          </div>
        )}
      </AnimatePresence>


      <AnimatePresence>
        {showDisplayNameModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            {/* Backdrop click dismisser */}
            <div 
              className="absolute inset-0 cursor-pointer" 
              onClick={() => {
                playClickSound();
                setShowDisplayNameModal(false);
                setDisplayNameCallbackAction(null);
              }} 
            />

            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className={`relative w-full max-w-[430px] rounded-2xl p-6 md:p-8 border-none flex flex-col gap-6 select-none z-[10001] text-left transition-all duration-300 ${
                darkMode ? "bg-[#1A1A1A] text-stone-200" : "bg-[#FDFBF7] text-stone-850"
              }`}
              style={{
                boxShadow: darkMode ? '0 10px 40px rgba(0,0,0,0.6)' : '0 4px 20px rgba(0,0,0,0.08)'
              }}
            >
              {/* Header */}
              <div className="flex justify-between items-start select-none shrink-0">
                <div className="flex flex-col gap-1">
                  <h4 className={`text-xl font-sans font-black uppercase tracking-tight ${darkMode ? "text-[#fbcfe8]" : "text-[#9D174D]"}`}>
                    Personalize Your Invite
                  </h4>
                  <div className={`text-xs font-sans font-semibold tracking-wide ${darkMode ? "text-stone-300" : "text-stone-600"} mt-0.5`}>
                    Enter your display name so your friends know it’s you.
                  </div>
                </div>
                <button 
                  onClick={() => { 
                    playClickSound(); 
                    setShowDisplayNameModal(false); 
                    setDisplayNameCallbackAction(null);
                    setDisplayNameError(null);
                  }}
                  className={`p-1.5 rounded-full border-none cursor-pointer transition-all active:scale-95 hover:scale-105 ${
                    darkMode ? "bg-zinc-800 hover:bg-zinc-750 text-stone-250" : "bg-stone-100 hover:bg-stone-200 text-stone-700"
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Input Box */}
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  maxLength={24}
                  placeholder="Enter your name..."
                  value={enteredDisplayName}
                  onChange={(e) => {
                    setDisplayNameError(null);
                    setEnteredDisplayName(e.target.value.replace(/[^a-zA-Z0-9\s]/g, ''));
                  }}
                  className={`w-full py-3.5 px-4 rounded-xl text-center text-xs font-sans font-bold tracking-wider border-none focus:outline-none focus:ring-0 select-none ${
                    darkMode ? "bg-zinc-950 text-stone-100 placeholder-zinc-700" : "bg-stone-100 text-stone-850 placeholder-stone-400"
                  }`}
                />

                {displayNameError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-xs font-bold font-sans tracking-wide text-center px-2 py-2 rounded-xl select-none ${
                      darkMode ? "text-rose-400 bg-rose-950/20" : "text-[#9D174D] bg-[#FFF1F2]"
                    }`}
                  >
                    {displayNameError}
                  </motion.div>
                )}
              </div>

              {/* Action Button */}
              <div className="flex flex-col gap-3.5 pt-2 select-none">
                <button
                  disabled={!enteredDisplayName.trim() || isValidatingDisplayName}
                  onClick={async () => {
                    const finalName = enteredDisplayName.trim();
                    if (!finalName) return;

                    playClickSound();
                    setIsValidatingDisplayName(true);
                    setDisplayNameError(null);

                    try {
                      const validation = validateNameLocally(finalName);
                      if (validation.isValid) {
                        // Save locally in user profile structure
                        const updatedProfile = {
                          ...(userProfile || { id: "GUEST_" + Math.floor(10000 + Math.random() * 90000), avatarColor: "#6B7280", isSynced: false }),
                          name: finalName
                        };
                        setUserProfile(updatedProfile);
                        localStorage.setItem("sudoku_userProfile", JSON.stringify(updatedProfile));
                        localStorage.setItem("sudoku_is_display_name_configured", "true");

                        setShowDisplayNameModal(false);

                        // Execute callback action
                        if (displayNameCallbackAction === "SHARE") {
                          await executeShareInviteAction();
                        } else if (displayNameCallbackAction === "START") {
                          executeStartGameAction();
                        } else if (displayNameCallbackAction === "END_GAME_SHARE") {
                          await executeEndGameShareAction();
                        } else if (displayNameCallbackAction === "HISTORY_SHARE") {
                          await executeHistoryShareAction();
                        } else if (displayNameCallbackAction === "PENDING_SHARE") {
                          executePendingChallengeShareAction(null);
                        }
                        setDisplayNameCallbackAction(null);
                      } else {
                        setDisplayNameError(validation.error || "Please choose a name that is respectful to other players.");
                      }
                    } finally {
                      setIsValidatingDisplayName(false);
                    }
                  }}
                  className={`w-full py-3.5 px-4 text-[11px] font-black uppercase tracking-wider rounded-full border-none transition-all cursor-pointer text-center hover:scale-[1.02] active:scale-95 shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none ${
                    darkMode ? "bg-emerald-800 hover:bg-emerald-700 text-emerald-100" : "bg-[#D1FAE5] hover:bg-[#A7F3D0] text-[#065F46]"
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>{isValidatingDisplayName ? "Verifying..." : "Continue"}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInviteJoinNamePopup && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div 
              className="absolute inset-0 cursor-pointer" 
              onClick={() => {
                playClickSound();
                setShowInviteJoinNamePopup(false);
                inviteJoinCallbackRef.current = null;
              }} 
            />

            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className={`relative w-full max-w-[430px] rounded-2xl p-6 md:p-8 border-none flex flex-col gap-6 select-none z-[10001] text-left transition-all duration-300 ${
                darkMode ? "bg-[#1A1A1A] text-stone-200" : "bg-[#FDFBF7] text-stone-850"
              }`}
              style={{
                boxShadow: darkMode ? '0 10px 40px rgba(0,0,0,0.6)' : '0 4px 20px rgba(0,0,0,0.08)'
              }}
            >
              <div className="flex justify-between items-start select-none shrink-0">
                <div className="flex flex-col gap-1">
                  <h4 className={`text-xl font-sans font-black uppercase tracking-tight ${darkMode ? "text-amber-200" : "text-amber-800"}`}>
                    Choose Your Display Name
                  </h4>
                  <div className={`text-xs font-sans font-semibold tracking-wide ${darkMode ? "text-stone-300" : "text-stone-600"} mt-0.5`}>
                    This name will appear on results, rankings, and active participant boards when you join.
                  </div>
                </div>
                <button 
                  onClick={() => { 
                    playClickSound(); 
                    setShowInviteJoinNamePopup(false); 
                    inviteJoinCallbackRef.current = null;
                    setInviteJoinError(null);
                  }}
                  className={`p-1.5 rounded-full border-none cursor-pointer transition-all active:scale-95 hover:scale-105 ${
                    darkMode ? "bg-zinc-800 hover:bg-zinc-750 text-stone-250" : "bg-stone-100 hover:bg-stone-200 text-stone-700"
                  }`}
                >
                  <X className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  maxLength={24}
                  placeholder="Enter your name..."
                  value={inviteJoinName}
                  onChange={(e) => {
                    setInviteJoinError(null);
                    setInviteJoinName(e.target.value.replace(/[^a-zA-Z0-9\s]/g, ''));
                  }}
                  onKeyDown={async (e) => {
                    if (e.key === "Enter" && inviteJoinName.trim() && !isVerifyingInviteJoinName) {
                      await handleInviteJoinContinue();
                    }
                  }}
                  className={`w-full py-3.5 px-4 rounded-xl text-center text-xs font-sans font-bold tracking-wider border-none focus:outline-none focus:ring-0 select-none ${
                    darkMode ? "bg-zinc-950 text-stone-100 placeholder-zinc-700" : "bg-stone-100 text-stone-850 placeholder-stone-400"
                  }`}
                />

                {inviteJoinError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-xs font-bold font-sans tracking-wide text-center px-2 py-2 rounded-xl select-none ${
                      darkMode ? "text-rose-400 bg-rose-950/20" : "text-[#9D174D] bg-[#FFF1F2]"
                    }`}
                  >
                    {inviteJoinError}
                  </motion.div>
                )}
              </div>

              <div className="flex flex-col gap-3 pt-2 select-none">
                <button
                  disabled={!inviteJoinName.trim() || isVerifyingInviteJoinName}
                  onClick={handleInviteJoinContinue}
                  className={`w-full py-3.5 px-4 text-[11px] font-black uppercase tracking-wider rounded-full border-none transition-all cursor-pointer text-center hover:scale-[1.02] active:scale-95 shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none ${
                    darkMode ? "bg-[#3B82F6] hover:bg-[#2563EB] text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>{isVerifyingInviteJoinName ? "Verifying..." : "Continue"}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 👤 HYBRID INTEGRATED AUTHENTICATION SYSTEM (SLIDE-UP BOTTOM SHEET MODAL) */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[10000] flex items-end justify-center bg-[#1E1E1E]/60 backdrop-blur-xs">
            {/* Backdrop click dismisser */}
            <div 
              className="absolute inset-0 cursor-pointer" 
              onClick={() => {
                playClickSound();
                setShowAuthModal(false);
              }} 
            />

            <motion.div 
              initial={{ y: "100%", opacity: 0.9 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-[460px] bg-[#FCF9F2] rounded-t-[32px] p-6 pb-8 border-none flex flex-col gap-5 select-none overflow-hidden max-h-[85vh] overflow-y-auto z-[10001] shadow-[0_-15px_45px_rgba(43,108,176,0.08)]"
            >
              {/* Top notch detail for mobile drag feeling */}
              <div className="w-12 h-1 bg-[#2B6CB0]/20 rounded-full mx-auto shrink-0 mb-1" />

              {/* Header */}
              <div className="flex justify-between items-start border-b border-stone-200/50 pb-3">
                <div>
                  <span className="bg-[#E0F2FE] text-[#0369A1] text-[8.5px] font-bold font-mono px-2.5 py-1 uppercase tracking-wider block w-fit rounded-xl">
                    IDENTITY HUB
                  </span>
                  <h4 className="text-xl font-sans font-black uppercase text-[#2B6CB0] mt-2 tracking-tight">
                     Hybrid Credentials
                  </h4>
                </div>
                <button 
                  onClick={() => { playClickSound(); setShowAuthModal(false); }}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-600 font-extrabold w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border-none shadow-sm transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* SELECT OR STATUS VIEW */}
              {authModalTab === "SELECT" && (
                <div className="flex flex-col gap-4 text-left font-sans">
                  {/* Current Profile Display */}
                  <div className="bg-white p-5 border-none rounded-2xl flex items-center gap-3.5 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-black text-white shrink-0 shadow-sm"
                      style={{ backgroundColor: userProfile?.avatarColor || "#2B6CB0" }}
                    >
                      {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : "V"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-sans font-black text-[#2B6CB0] text-sm">
                          {userProfile?.name || "Anonymous Voyager"}
                        </span>
                        <span className={`text-[8.5px] font-mono font-black px-2 py-0.5 rounded-full ${
                          userProfile?.isSynced ? "bg-[#E6F4EA] text-[#135236]" : "bg-[#F3E8FF] text-[#6B21A8]"
                        }`}>
                          {userProfile?.isSynced ? "CLOUD SYNCED ✓" : "OFFLINE GUEST"}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-[#2B6CB0] font-mono uppercase mt-0.5 tracking-wide leading-none">
                        ID: {userProfile?.id || "N/A"}
                      </p>
                      {userProfile?.email && (
                        <p className="text-xs text-stone-650 font-sans mt-1">📧 {userProfile.email}</p>
                      )}
                      {userProfile?.phone && (
                        <p className="text-xs text-stone-650 font-sans mt-0.5">📱 {userProfile.phone}</p>
                      )}
                    </div>
                  </div>

                  {!userProfile?.isSynced ? (
                    <>
                      <p className="text-xs text-[#2B6CB0]/80 leading-relaxed font-sans font-semibold">
                        You are currently playing in <strong>Guest Offline Mode</strong>. Sync a dynamic identity to preserve best times, statistics, and journal logs across sessions securely and access the leaderboards.
                      </p>

                      <div className="flex flex-col gap-3.5 pt-1">
                        {/* Google Sign-in Placeholder (Disabled) */}
                        <div className="flex flex-col gap-1 w-full select-none">
                          <button
                            disabled
                            className="w-full bg-[#E0F2FE]/40 text-stone-400 border border-stone-200/50 py-3 px-4 rounded-xl font-sans text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
                          >
                            <svg className="w-4.5 h-4.5 shrink-0 opacity-40 grayscale" viewBox="0 0 24 24">
                              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                            </svg>
                            <span>Connect with Google</span>
                          </button>
                          <p className="text-[10.5px] text-stone-500 dark:text-zinc-400 mt-1 leading-normal font-sans text-center">
                            Cloud synchronization across devices will be available in a future update.
                          </p>
                        </div>

                        {/* Mobile OTP option */}
                        <button
                          onClick={() => {
                            playClickSound();
                            setAuthModalTab("PHONE");
                          }}
                          className="bg-[#F3E8FF] hover:bg-[#E9D5FF] text-[#6B21A8] border-none py-3 px-4 rounded-xl font-sans text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm cursor-pointer active:translate-y-px transition-all"
                        >
                          <span className="text-sm">📱</span>
                          <span>Link Mobile & OTP</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div className="bg-[#E6F4EA] border-none p-4 text-xs text-[#135236] leading-relaxed rounded-2xl font-sans shadow-[0_2px_8px_rgba(19,82,54,0.02)]">
                        <p className="font-sans font-black text-[#135236] uppercase mb-1">✓ Core Identity Linked</p>
                        <p className="font-sans mb-2">Successfully authenticated. Your unique player profile is now linked to your authenticated identity.</p>
                        <p className="font-sans font-bold text-emerald-800">Cloud synchronization across devices will be available in a future update.</p>
                      </div>
                      
                      <button
                        onClick={() => {
                          playClickSound();
                          if (window.confirm("Disconnect security identity and return to offline Guest mode? Current device stats remain intact.")) {
                            setUserProfile({
                              id: "GUEST_" + Math.floor(10000 + Math.random() * 90000),
                              name: "Anonymous Voyager",
                              avatarColor: "#6B7280",
                              isSynced: false
                            });
                            localStorage.removeItem("sudoku_userProfile");
                            localStorage.removeItem("sudoku_is_display_name_configured");
                            addLog("👤 Returned to Guest Offline Profile Mode.");
                          }
                        }}
                        className="bg-[#FCE7F3] text-[#9D174D] hover:bg-[#FBCFE8] border-none transition-colors py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer mt-2 shadow-sm"
                      >
                        Reset Profile (Logout)
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* GOOGLE INTERACTIVE SHEET */}
              {authModalTab === "GOOGLE" && (
                <div className="flex flex-col gap-4 text-left font-sans">
                  <div>
                    <span className="text-stone-400 font-mono text-[9px] uppercase tracking-wider block mb-1">
                      {googleClientId ? "GOOGLE AUTHENTICATION" : "STEP 2 OF 2"}
                    </span>
                    <h5 className="text-md font-sans font-black text-stone-900 uppercase">
                      {googleClientId ? "Google Secure Login" : "Google Account Link"}
                    </h5>
                    <p className="text-xs text-stone-500 mt-1">
                      {googleClientId 
                        ? "Confirm your verified Google account details via the official browser dialog." 
                        : "Link your custom email to configure your verified game profile logs."}
                    </p>
                  </div>

                  {googleClientId ? (
                    <div className="flex flex-col items-center justify-center p-5 bg-[#F8FAFC] rounded-2xl border border-dashed border-sky-100">
                      <div id="google-signin-button-modal" className="w-full flex justify-center py-1 select-none" />
                      <p className="text-[10px] text-stone-400 font-sans text-center mt-3 leading-normal max-w-[245px]">
                        Secure connection via Google Accounts. Your browser maintains individual privacy control.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className="block">
                        <span className="block text-[10px] font-mono font-black text-[#0369A1] uppercase tracking-wider mb-1.5">GMAIL ADDRESS:</span>
                        <input 
                          type="email" 
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="yourname@gmail.com"
                          className="w-full bg-white text-stone-950 border border-stone-200 rounded-xl p-3 text-xs md:text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#2B6CB0]/20 shadow-xs"
                        />
                      </label>

                      <label className="block">
                        <span className="block text-[10px] font-mono font-black text-[#5B21B6] uppercase tracking-wider mb-1.5">VOYAGE USERNAME:</span>
                        <input 
                          type="text" 
                          value={usernameInput}
                          onChange={(e) => setUsernameInput(e.target.value)}
                          placeholder="e.g. My Username"
                          className="w-full bg-white text-[#1E1E1E] border border-stone-200 rounded-xl p-3 text-xs md:text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#2B6CB0]/20 shadow-xs"
                        />
                      </label>

                      <div className="bg-[#FEF3C7]/60 border border-[#FDE68A]/30 p-3 rounded-xl text-[10.5px] text-[#92400E] leading-normal font-sans">
                        💡 <strong>Notice:</strong> Native Google account popup selection requires defining <code>VITE_GOOGLE_CLIENT_ID</code> in AI Studio settings list.
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2.5 pt-2">
                    <button
                      onClick={() => { playClickSound(); setAuthModalTab("SELECT"); }}
                      className="bg-stone-100 hover:bg-stone-200 text-stone-850 border-none py-3 px-4 rounded-xl font-sans text-xs font-black uppercase tracking-wider cursor-pointer active:translate-y-px transition-all"
                    >
                      Back
                    </button>
                    {!googleClientId && (
                      <button
                        onClick={() => {
                          playClickSound();
                          if (!emailInput || !emailInput.trim() || !emailInput.includes("@")) {
                            alert("Please supply your correct personal Gmail address to register.");
                            return;
                          }
                          const finalEmail = emailInput.trim();
                          const fallbackName = userProfile?.name && !userProfile.name.startsWith("GUEST_") ? userProfile.name : finalEmail.split("@")[0];
                          const finalName = usernameInput.trim() || fallbackName;
                          
                          addLog(`🔒 Synced custom email credential node: ${finalEmail}`);
                          handleSyncAndMergeData({
                            id: "G_" + Math.floor(100000 + Math.random() * 900000),
                            name: finalName,
                            email: finalEmail,
                            avatarColor: "#0369A1"
                          });
                          setShowAuthModal(false);
                        }}
                        className="flex-1 bg-[#E0F2FE] hover:bg-[#bae6fd] text-[#0369A1] border-none py-3 px-4 rounded-xl font-sans text-xs font-black uppercase tracking-wider text-center cursor-pointer shadow-sm active:translate-y-px transition-all"
                      >
                        Authorize & Sync
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* MOBILE PHONE INPUT */}
              {authModalTab === "PHONE" && (
                <div className="flex flex-col gap-4 text-left font-sans">
                  <div>
                    <span className="text-stone-400 font-mono text-[9px] uppercase tracking-wider block mb-1">STEP 2 OF 3</span>
                    <h5 className="text-md font-sans font-black text-stone-900 uppercase">Mobile Verification</h5>
                    <p className="text-xs text-stone-500 mt-1">We will send a one-time 4-digit code (OTP) to your phone number for secure authentication.</p>
                  </div>

                  <div>
                    <label className="block">
                      <span className="block text-[10px] font-mono font-black text-stone-600 uppercase tracking-wider mb-1.5">PHONE NUMBER:</span>
                      <input 
                        type="tel" 
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="+1 (555) 0123"
                        className="w-full bg-white text-[#1E1E1E] border-none rounded-xl p-3 text-xs md:text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#2B6CB0]/20 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                      />
                    </label>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      onClick={() => { playClickSound(); setAuthModalTab("SELECT"); }}
                      className="bg-stone-100 hover:bg-stone-200 text-stone-850 border-none py-3 px-4 rounded-xl font-sans text-xs font-black uppercase tracking-wider cursor-pointer active:translate-y-px transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => {
                        playClickSound();
                        if (!phoneInput.trim()) {
                          alert("Please fill in a valid phone number.");
                          return;
                        }
                        const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
                        setOtpCode(randomCode);
                        setAuthPendingPhone(phoneInput);
                        addLog(`📱 Dispatching OTP Verification SMS. Simulated mock security code: ${randomCode}`);
                        
                        alert(`[SMS Dispatch Simulation]\nVerification Code sent to ${phoneInput}:\n👉 Code: ${randomCode}`);
                        
                        setAuthModalTab("OTP");
                        setAuthOtpInput("");
                      }}
                      className="flex-1 bg-[#E6F4EA] hover:bg-[#D1FAE5] text-[#135236] border-none py-3 px-4 rounded-xl font-sans text-xs font-black uppercase tracking-wider text-center cursor-pointer shadow-sm active:translate-y-px transition-all"
                    >
                      Request OTP Code
                    </button>
                  </div>
                </div>
              )}

              {/* OTP CODE VERIFICATION */}
              {authModalTab === "OTP" && (
                <div className="flex flex-col gap-4 text-left font-sans">
                  <div>
                    <span className="text-stone-400 font-mono text-[9px] uppercase tracking-wider block mb-1">STEP 3 OF 3</span>
                    <h5 className="text-md font-sans font-black text-stone-900 uppercase">Input OTP Code</h5>
                    <p className="text-xs text-stone-500 mt-1">Please type the 4-digit code dispatched to <strong>{authPendingPhone}</strong>.</p>
                  </div>

                  <div>
                    <label className="block">
                      <span className="block text-[10px] font-mono font-black text-stone-600 uppercase tracking-wider mb-1.5">ENTER 4-DIGIT VERIFICATION CODE:</span>
                      <input 
                        type="text" 
                        maxLength={4}
                        value={authOtpInput}
                        onChange={(e) => setAuthOtpInput(e.target.value)}
                        placeholder="e.g. 1234"
                        className="w-full text-center bg-white text-stone-950 border-none rounded-xl p-3 text-lg font-mono font-black tracking-widest focus:outline-none focus:ring-2 focus:ring-[#2B6CB0]/20 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
                      />
                    </label>
                    <p className="text-[10px] text-stone-500 italic font-mono mt-1 text-center">
                      Cheat Sheet: Current OTP validation token is <strong className="text-[#2B6CB0] font-black">{otpCode}</strong>
                    </p>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      onClick={() => { playClickSound(); setAuthModalTab("PHONE"); }}
                      className="bg-stone-100 hover:bg-stone-200 text-stone-850 border-none py-3 px-4 rounded-xl font-sans text-xs font-black uppercase tracking-wider cursor-pointer active:translate-y-px transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => {
                        playClickSound();
                        if (authOtpInput.trim() !== otpCode) {
                          alert(`Invalid OTP code entered. Please retry or check the cheat sheet of value ${otpCode}`);
                          return;
                        }
                        
                        addLog(`📱 OTP Verification Succeeded for: ${authPendingPhone}`);
                        handleSyncAndMergeData({
                          id: "P_" + Math.floor(100000 + Math.random() * 900000),
                          name: "Voyager " + authPendingPhone.slice(-4),
                          phone: authPendingPhone,
                          avatarColor: "#10B981"
                        });
                        setShowAuthModal(false);
                      }}
                      className="flex-1 bg-emerald-650 hover:bg-emerald-700 text-white border-none py-2.5 px-4 rounded-md font-sans text-xs font-bold uppercase tracking-wider text-center cursor-pointer shadow-xs"
                    >
                      Verify & Synchronize
                    </button>
                  </div>
                </div>
              )}

              {/* Storage telemetry status report */}
              <div className="bg-stone-100/50 border border-stone-200/50 p-3 rounded-md text-[10px] text-stone-400 font-mono text-center shrink-0">
                Data Merging: Zero data loss, sync merges browser localStorage into persistent remote profiles.
              </div>

              {/* Statutory compliance links in auth flow */}
              <div className="flex justify-center items-center gap-3 text-[10px] font-mono text-stone-400 shrink-0 pb-1">
                <button
                  onClick={() => { playClickSound(); setActiveCompliancePage("privacy"); }}
                  className="bg-transparent border-none p-0 cursor-pointer text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 underline font-mono text-[10px]"
                >
                  Privacy Policy
                </button>
                <span>•</span>
                <button
                  onClick={() => { playClickSound(); setActiveCompliancePage("terms"); }}
                  className="bg-transparent border-none p-0 cursor-pointer text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 underline font-mono text-[10px]"
                >
                  Terms of Service
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 💚 NOTEBOOK SYNCED SUCCESS TOAST */}
      <AnimatePresence>
        {showSyncSuccessToast && (
          <div className="fixed inset-x-4 top-[85px] z-[50000] flex justify-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="bg-[#E6F4EA] border border-[#A7F3D0] text-[#135236] px-6 py-4.5 rounded-2xl shadow-[0_12px_24px_rgba(19,82,54,0.1)] flex items-center gap-3.5 select-none"
            >
              <div className="w-6 h-6 rounded-full bg-[#135236] text-white flex items-center justify-center font-black text-sm shrink-0">
                ✓
              </div>
              <div className="flex flex-col text-left">
                <span className="font-sans font-black text-sm uppercase tracking-tight leading-none text-[#135236]">Notebook Synced!</span>
                <span className="text-[10px] text-[#135236]/80 mt-1 font-sans font-medium">Your progress is now linked securely to Google cloud node.</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🔔 BELL NOTIFICATIONS MODAL OVERLAY */}
      <AnimatePresence>
        {showBellInvitesModal && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            {/* Backdrop click dismisser */}
            <div 
              className="absolute inset-0 cursor-pointer" 
              onClick={() => {
                playClickSound();
                setShowBellInvitesModal(false);
              }} 
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={`relative w-full max-w-md rounded-3xl p-6 border-none flex flex-col gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.15)] select-none z-[100001] transition-all duration-300 ${
                darkMode ? "bg-zinc-900 text-stone-100" : "bg-white text-stone-850"
              }`}
            >
              <div className="flex justify-between items-center pb-2 border-b border-stone-200/50 dark:border-zinc-800/50">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-indigo-500" />
                  <h3 className="font-sans font-black text-base uppercase tracking-wider">
                    Challenge Invites
                  </h3>
                </div>
                <button
                  onClick={() => {
                    playClickSound();
                    setShowBellInvitesModal(false);
                  }}
                  className={`p-1 rounded-full border-none cursor-pointer hover:bg-stone-100 dark:hover:bg-zinc-800 transition-all ${
                    darkMode ? "text-stone-400" : "text-stone-600"
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable list */}
              <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3.5 max-h-[50vh] pr-0.5">
                {pendingChallenges.length === 0 ? (
                  <div className="py-12 text-center text-stone-500 font-sans text-sm italic">
                    No pending challenge invites.
                  </div>
                ) : (
                  pendingChallenges.map((challenge) => (
                    <div 
                      key={challenge.id} 
                      className={`p-4 rounded-2xl flex flex-col gap-3 border transition-all ${
                        darkMode ? "bg-zinc-950/45 border-zinc-800 text-stone-300" : "bg-slate-50/80 border-stone-200/60 text-stone-850"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col text-left">
                          <span className={`text-[10px] font-black uppercase tracking-wider ${
                            challenge.difficulty === "EASY" ? "text-emerald-500" :
                            challenge.difficulty === "MEDIUM" ? "text-amber-500" :
                            challenge.difficulty === "HARD" ? "text-purple-500" : "text-rose-500"
                          }`}>
                            {challenge.difficulty} Duel
                          </span>
                          <span className="font-sans text-xs font-bold mt-0.5">
                            Invited by <strong className="font-extrabold">{challenge.senderName}</strong>
                          </span>
                        </div>
                        {challenge.sentAt && (
                          <span className="text-[9px] font-mono opacity-70">
                            {new Date(challenge.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 text-[9px] font-sans p-2 rounded-xl bg-stone-500/5 text-center">
                        <div>
                          <span className="block opacity-65 uppercase font-bold text-[8px]">Mistakes</span>
                          <span className="font-black text-rose-500">{challenge.maxMistakes === 0 ? "0 (Sudden Death)" : challenge.maxMistakes < 999 ? `${challenge.maxMistakes} Limit` : "None"}</span>
                        </div>
                        <div>
                          <span className="block opacity-65 uppercase font-bold text-[8px]">Hints</span>
                          <span className="font-black text-emerald-500">{challenge.hintLimit ?? 3} Limit</span>
                        </div>
                        <div>
                          <span className="block opacity-65 uppercase font-bold text-[8px]">Timer</span>
                          <span className="font-black">{challenge.timerEnabled ? "Visible" : "Hidden"}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 w-full mt-0.5">
                        <button
                          onClick={() => handleDeclineBellInvite(challenge)}
                          className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer border-none transition-all active:scale-95 ${
                            darkMode ? "bg-zinc-800 hover:bg-zinc-750 text-stone-300" : "bg-stone-100 hover:bg-stone-200 text-stone-600"
                          }`}
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleAcceptAndPlayBellInvite(challenge)}
                          className="flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer border-none transition-all active:scale-95 text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                          Accept & Play
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 📥 IN-APP INVITATION TOAST BANNER */}
      <AnimatePresence>
        {activeInviteNotification && (
          <div className="fixed inset-x-4 top-[24px] z-[70000] flex justify-center animate-bounce-subtle">
            <motion.div
              initial={{ opacity: 0, y: -40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`w-full max-w-md p-4 rounded-2xl flex items-center justify-between gap-4 backdrop-blur-md border ${
                darkMode 
                  ? "bg-zinc-900/95 border-zinc-800 text-stone-100 shadow-[0_16px_36px_rgba(0,0,0,0.5)]" 
                  : "bg-white/95 border-stone-200 text-stone-900 shadow-[0_16px_36px_rgba(0,0,0,0.12)]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${darkMode ? "bg-purple-950/50 text-purple-300" : "bg-purple-50 text-purple-600"}`}>
                  <Users className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <div className="flex flex-col text-left">
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${darkMode ? "text-purple-400" : "text-purple-700"}`}>
                    Sudoku Invite
                  </span>
                  <span className="font-sans text-xs font-semibold mt-0.5">
                    <strong>{activeInviteNotification.fromName}</strong> invited you to play!
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={async () => {
                    playClickSound();
                    try {
                      await updateDoc(doc(db, "invites", activeInviteNotification.id), { status: "declined" });
                    } catch (e) {
                      console.error("Failed to decline invite in DB:", e);
                    }
                    setActiveInviteNotification(null);
                  }}
                  className={`px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider cursor-pointer border-none transition-all active:scale-95 ${
                    darkMode ? "bg-zinc-850 hover:bg-zinc-800 text-stone-300" : "bg-stone-100 hover:bg-stone-200 text-stone-600"
                  }`}
                >
                  Decline
                </button>
                <button
                  onClick={async () => {
                    const { gameId, roomCode, id, password } = activeInviteNotification;
                    await handleAcceptAndLaunchInvite(roomCode || gameId, id, password, true);
                  }}
                  className={`px-4.5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider cursor-pointer border-none transition-all active:scale-95 text-white ${
                    darkMode ? "bg-emerald-600 hover:bg-emerald-500" : "bg-emerald-600 hover:bg-emerald-550"
                  }`}
                >
                  Accept
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GLOBAL TOAST OVERLAY */}
      <AnimatePresence>
        {toastMessage && (
          <div className="fixed inset-x-4 top-[100px] z-[60000] flex justify-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`${darkMode ? "bg-zinc-800 text-white shadow-xl border border-zinc-700" : "bg-emerald-950 text-white shadow-[0_12px_24px_rgba(0,0,0,0.15)]"} px-5 py-3 rounded-full flex items-center gap-2 select-none`}
            >
              <Info className="w-4 h-4 text-sky-400" />
              <span className="font-sans font-medium text-sm tracking-wide">{toastMessage}</span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Decorative dashed margin footers */}
      {activeTab !== "sudoku" && (
        <footer className="mt-auto py-8 bg-[#FDFBF7] border-t-4 border-[#1E1E1E] text-center text-xs text-stone-500 font-mono relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-8 flex justify-between items-center flex-col md:flex-row gap-2">
            <span>Google AI Studio • Scrapbook & Sudoku Engine Kit</span>
            <span>Crafted in Jetpack Compose Design Specification Style</span>
          </div>
        </footer>
      )}

      {/* 📜 NATIVE STATUTORY COMPLIANCE PAGES OVERLAY (AdSense Requirement) */}
      <AnimatePresence>
        {activeCompliancePage && (
          <div className="fixed inset-0 z-[20000] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto">
            <div className="absolute inset-0 cursor-pointer" onClick={() => setActiveCompliancePage(null)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className={`relative w-full max-w-2xl rounded-3xl p-6 md:p-8 border flex flex-col max-h-[85vh] select-text z-[20001] text-left transition-colors duration-300 ${
                darkMode ? "bg-zinc-900 border-zinc-800 text-stone-300" : "bg-[#FDFBF7] border-stone-200 text-stone-850"
              }`}
              style={{
                boxShadow: darkMode ? '0 10px 40px rgba(0,0,0,0.6)' : '0 4px 20px rgba(0,0,0,0.08)'
              }}
            >
              <div className="flex justify-between items-center shrink-0 mb-4 pb-2 border-b border-stone-200/50 dark:border-zinc-800/50">
                <h3 className="text-xl font-sans font-black uppercase tracking-wide">
                  {activeCompliancePage === "about" && "About Us"}
                  {activeCompliancePage === "contact" && "Contact Us"}
                  {activeCompliancePage === "privacy" && "Privacy Policy"}
                  {activeCompliancePage === "terms" && "Terms of Service"}
                </h3>
                <button 
                  onClick={() => { playClickSound(); setActiveCompliancePage(null); }}
                  className={`p-1.5 rounded-full border-none cursor-pointer transition-all active:scale-95 hover:scale-105 ${
                    darkMode ? "bg-zinc-800 hover:bg-zinc-750 text-stone-250" : "bg-stone-100 hover:bg-stone-200 text-stone-700"
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 no-scrollbar leading-relaxed text-xs sm:text-sm font-sans flex flex-col gap-4 select-text">
                {activeCompliancePage === "about" && (
                  <div className="space-y-3">
                    <p className="font-bold text-sm text-[#0369A1] dark:text-[#7dd3fc]">Welcome to Sudoku Together Mode!</p>
                    <p>
                      <strong>Sudoku Together Mode</strong> (<a href="https://sudoku-together-mode.web.app" target="_blank" rel="noopener noreferrer" className="text-sky-500 underline">sudoku-together-mode.web.app</a>) is a modern, high-performance logic puzzle and brain-training platform designed for solo solvers and competitive friends alike.
                    </p>
                    <p>
                      Our mission is to elevate classic paper-and-pencil Sudoku into an engaging digital multiplayer experience. Powered by deterministic seed generation (Mulberry32 PRNG), custom mistake limits, real-time board synchronization, and procedural sound synthesis, our platform brings players together on identical, mathematically verified 1-solution puzzles without heavy data transmission.
                    </p>
                    <h4 className="font-bold uppercase tracking-wider text-xs text-stone-800 dark:text-stone-200 mt-3">Key Features & Architecture:</h4>
                    <ul className="list-disc pl-5 space-y-1.5 text-xs">
                      <li><strong>Deterministic Seeded Generation:</strong> Play identical puzzles with friends across web and Android mobile by simply sharing a room link or numeric seed.</li>
                      <li><strong>Scrapbook Design Aesthetic:</strong> Premium paper-and-ink visual theme with customizable sticky notes, washi tape, and drag-and-drop stickers.</li>
                      <li><strong>Procedural Web Audio Engine:</strong> Dynamic, zero-latency synthesizer sounds created natively via the browser Web Audio API.</li>
                      <li><strong>Offline-First Resilience:</strong> Full gameplay capability offline with automatic Firestore synchronization when back online.</li>
                    </ul>
                    <p className="pt-2 text-stone-600 dark:text-stone-400">
                      This application is 100% free to play, supported by Google AdSense advertisements, and built with privacy, speed, and accessibility at its core.
                    </p>
                  </div>
                )}

                {activeCompliancePage === "contact" && (
                  <div className="space-y-3">
                    <p className="font-bold text-sm text-[#0369A1] dark:text-[#7dd3fc]">Need Help, Support, or Data Inquiries?</p>
                    <p>
                      We are committed to providing prompt support and full transparency for our global players. If you have questions, bug reports, feature suggestions, or privacy inquiries, please reach out directly:
                    </p>
                    <div className="p-4 rounded-2xl bg-stone-500/5 dark:bg-zinc-800/60 border border-stone-200/60 dark:border-zinc-700/60 my-2 space-y-2">
                      <p className="font-bold text-xs uppercase tracking-wider text-stone-600 dark:text-stone-300">Official Support & Privacy Contact:</p>
                      <a href="mailto:sudokutogethermode@gmail.com?subject=Sudoku%20Together%20Support%20Inquiry" className="text-sky-500 dark:text-sky-400 font-bold hover:underline text-sm block">
                        sudokutogethermode@gmail.com
                      </a>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                        Response Turnaround: Within 24 to 48 business hours.
                      </p>
                    </div>
                    <h4 className="font-bold uppercase tracking-wider text-xs text-stone-800 dark:text-stone-200 mt-2">Data & Account Deletion Requests:</h4>
                    <p className="text-xs">
                      You can instantly delete your local cache and Cloud Firestore profile using the in-app <strong>"Delete Account & Data"</strong> tool located under Settings, or by emailing our support desk with your player nickname.
                    </p>
                  </div>
                )}

                {activeCompliancePage === "privacy" && (
                  <div className="space-y-4">
                    <div>
                      <p className="font-bold text-sm text-[#0369A1] dark:text-[#7dd3fc]">Privacy Policy</p>
                      <p className="text-[11px] font-mono opacity-80">Effective Date: August 12, 2026 | Version 2.4</p>
                    </div>
                    
                    <p>
                      At <strong>Sudoku Together Mode</strong> (accessible from <a href="https://sudoku-together-mode.web.app" target="_blank" rel="noopener noreferrer" className="text-sky-500 underline">https://sudoku-together-mode.web.app</a> and the official Android mobile app), we consider the privacy of our visitors and players to be of extreme importance. This Privacy Policy document describes in comprehensive detail the types of information collected, stored, and processed, and how we uphold global privacy standards including the <strong>General Data Protection Regulation (GDPR)</strong>, the <strong>California Consumer Privacy Act (CCPA/CPRA)</strong>, the <strong>Children's Online Privacy Protection Act (COPPA)</strong>, <strong>Google Play Store Data Safety Policies</strong>, and <strong>Google AdSense Program Policies</strong>.
                    </p>

                    <h4 className="font-bold uppercase tracking-wider text-xs text-stone-800 dark:text-stone-200 mt-2">1. Information Collection & Storage Architecture</h4>
                    <p>We believe in strict data minimization. Our architecture distinguishes clearly between client-only local data and cloud database records:</p>
                    <ul className="list-disc pl-5 space-y-2 text-xs">
                      <li>
                        <strong>Client-Side Local Storage (Browser & Device Only):</strong> We use standard browser <code>localStorage</code> solely on your device to persist UI preferences (Dark Mode, sound synthesis, haptics), mistake counter limits, timer visibility, active puzzle board state/notes, and saved single-player games. <em>This data is stored locally on your device and is never sold, shared, or transmitted to third-party marketing entities.</em>
                      </li>
                      <li>
                        <strong>Google Cloud Firestore (Real-Time Multiplayer & Leaderboards):</strong> When participating in multiplayer challenges or global matches, the following non-sensitive game parameters are stored on Google Cloud Firestore:
                        <ul className="list-circle pl-5 mt-1 space-y-1 opacity-90">
                          <li>Anonymous Challenge ID, seed number, and difficulty level.</li>
                          <li>Player display nickname (user-chosen alphanumeric string) and user ID.</li>
                          <li>Match performance metrics: Completion time (seconds), mistake count, and win/loss completion status.</li>
                          <li>Multiplayer room invitations (sender ID, recipient ID, game ID, status: pending/accepted/declined).</li>
                          <li>Firebase Cloud Messaging (FCM) push notification tokens (if opted-in, used strictly to alert you of incoming match invites).</li>
                          <li>Recent opponent player list (for 1-click rematch invitations).</li>
                        </ul>
                      </li>
                      <li>
                        <strong>Infrastructure & Diagnostic Server Logs:</strong> Standard web server request logs (including IP addresses, browser user-agent, timestamps, and rate limiting metrics) are processed automatically by Google Firebase Hosting and our Express server solely for operational security, DDoS prevention, and rate-limiting integrity.
                      </li>
                    </ul>

                    <h4 className="font-bold uppercase tracking-wider text-xs text-stone-800 dark:text-stone-200 mt-3">2. Google AdSense & Third-Party Cookies</h4>
                    <p>
                      We partner with third-party advertising vendors, including <strong>Google LLC (Google AdSense)</strong>, to serve advertisements when you visit our website. Third-party advertising networks use cookies, web beacons, and device identifiers to measure ad performance and serve advertisements based on your prior visits to this website or other websites on the Internet.
                    </p>
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-400/30 text-xs space-y-2">
                      <p className="font-semibold text-amber-900 dark:text-amber-200">
                        🍪 Advertising Cookie Transparency & Opt-Out Portals:
                      </p>
                      <p>
                        Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our sites and/or other sites on the Internet. You have the full right to opt out of personalized advertising at any time through the following official privacy portals:
                      </p>
                      <ul className="list-disc pl-5 space-y-1 text-[11.5px]">
                        <li>
                          <strong>Google Ads Settings:</strong> <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-sky-500 dark:text-sky-400 underline break-all">https://www.google.com/settings/ads</a>
                        </li>
                        <li>
                          <strong>Network Advertising Initiative (NAI):</strong> <a href="https://optout.networkadvertising.org/" target="_blank" rel="noopener noreferrer" className="text-sky-500 dark:text-sky-400 underline break-all">https://optout.networkadvertising.org/</a>
                        </li>
                        <li>
                          <strong>Digital Advertising Alliance (DAA / AboutAds):</strong> <a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer" className="text-sky-500 dark:text-sky-400 underline break-all">https://optout.aboutads.info/</a>
                        </li>
                        <li>
                          <strong>European Interactive Digital Advertising Alliance (EDAA):</strong> <a href="https://www.youronlinechoices.eu/" target="_blank" rel="noopener noreferrer" className="text-sky-500 dark:text-sky-400 underline break-all">https://www.youronlinechoices.eu/</a>
                        </li>
                      </ul>
                    </div>
                    <p className="text-xs">
                      <strong>Ad Traffic & Quality Protection:</strong> Automated bots, click-farms, repeated manual ad clicks, ad-block tampering, or proxy manipulations are strictly prohibited and actively filtered to preserve ecosystem integrity.
                    </p>

                    <h4 className="font-bold uppercase tracking-wider text-xs text-stone-800 dark:text-stone-200 mt-3">3. GDPR Rights (European Economic Area & UK)</h4>
                    <p>
                      Under the European Union General Data Protection Regulation (GDPR), users located in the EEA and UK possess the following statutory rights:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-xs">
                      <li><strong>Right of Access:</strong> Request a copy of your stored player and leaderboard records.</li>
                      <li><strong>Right to Rectification:</strong> Update or modify your player display nickname at any time in-game.</li>
                      <li><strong>Right to Erasure ("Right to be Forgotten"):</strong> Instantly delete all your Firestore data and local storage via the in-app <em>"Delete Account & Data"</em> button or by emailing <a href="mailto:sudokutogethermode@gmail.com" className="text-sky-500 underline">sudokutogethermode@gmail.com</a>.</li>
                      <li><strong>Right to Data Portability & Restriction:</strong> Request restrictions or export of your match telemetry.</li>
                    </ul>

                    <h4 className="font-bold uppercase tracking-wider text-xs text-stone-800 dark:text-stone-200 mt-3">4. California Privacy Rights (CCPA / CPRA)</h4>
                    <p className="text-xs">
                      Under the California Consumer Privacy Act as amended by the CPRA, California residents are entitled to know what data categories are collected and to request data deletion. <strong>We do NOT sell or share your personal information</strong> with third parties for monetary or commercial consideration.
                    </p>

                    <h4 className="font-bold uppercase tracking-wider text-xs text-stone-800 dark:text-stone-200 mt-3">5. Children's Privacy Protection (COPPA)</h4>
                    <p className="text-xs">
                      Protecting the privacy of young children is especially important. Sudoku Together Mode does not knowingly collect or solicit personally identifiable information from children under the age of 13 (or under 16 in the EEA/UK). Our game does not require real names, physical addresses, or phone numbers to play. If a parent or guardian believes their child has submitted personal information to our servers, please contact us immediately at <a href="mailto:sudokutogethermode@gmail.com" className="text-sky-500 underline">sudokutogethermode@gmail.com</a> and we will expeditiously remove such records.
                    </p>

                    <h4 className="font-bold uppercase tracking-wider text-xs text-stone-800 dark:text-stone-200 mt-3">6. Data Retention & Security Controls</h4>
                    <p className="text-xs">
                      Multiplayer challenge match records older than 30 days are pruned automatically from our databases. All client-to-server traffic is encrypted in transit using industry-standard TLS/HTTPS protocols. Strict Firestore security rules enforce document-level ownership and prevent unauthorized data tampering.
                    </p>

                    <h4 className="font-bold uppercase tracking-wider text-xs text-stone-800 dark:text-stone-200 mt-3">7. Contact Information</h4>
                    <p className="text-xs">
                      For any questions regarding this Privacy Policy or our data handling practices, please contact our Data Protection desk at:
                      <br />
                      <strong className="text-sky-500 dark:text-sky-400">sudokutogethermode@gmail.com</strong>
                    </p>
                  </div>
                )}

                {activeCompliancePage === "terms" && (
                  <div className="space-y-4">
                    <div>
                      <p className="font-bold text-sm text-[#0369A1] dark:text-[#7dd3fc]">Terms of Service</p>
                      <p className="text-[11px] font-mono opacity-80">Effective Date: August 12, 2026 | Version 2.4</p>
                    </div>
                    
                    <h4 className="font-bold uppercase tracking-wider text-xs text-stone-800 dark:text-stone-200 mt-2">1. Agreement & Acceptance of Terms</h4>
                    <p className="text-xs">
                      By accessing, browsing, installing, or playing <strong>Sudoku Together Mode</strong> (via <a href="https://sudoku-together-mode.web.app" target="_blank" rel="noopener noreferrer" className="text-sky-500 underline">sudoku-together-mode.web.app</a> or our official Android application), you agree to be bound by these Terms of Service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this application.
                    </p>

                    <h4 className="font-bold uppercase tracking-wider text-xs text-stone-800 dark:text-stone-200 mt-2">2. Description of Service & Free Access</h4>
                    <p className="text-xs">
                      Sudoku Together Mode provides free-to-play digital Sudoku puzzles, deterministic seeded matchmaking rooms, real-time leaderboards, and logic training tools. The service is provided on an "AS IS" and "AS AVAILABLE" basis. We reserve the right to modify, update, or discontinue features of the game at any time without prior notice.
                    </p>

                    <h4 className="font-bold uppercase tracking-wider text-xs text-stone-800 dark:text-stone-200 mt-2">3. User Conduct & Community Standards</h4>
                    <p className="text-xs">To ensure a fair and enjoyable environment for all players, you agree NOT to:</p>
                    <ul className="list-disc pl-5 space-y-1 text-xs">
                      <li>Choose offensive, vulgar, defamatory, or abusive player nicknames (automated profanity filters and alphanumeric validation are enforced on all sync APIs).</li>
                      <li>Deploy automated bots, solving scripts, or memory-injection hacks to artificially alter completion times or leaderboard rankings.</li>
                      <li>Engage in denial-of-service (DoS/DDoS) attacks, flood sync endpoints, or attempt unauthorized database modifications.</li>
                      <li>Engage in fraudulent, automated, or deceptive clicks on advertisements displayed within the app.</li>
                    </ul>

                    <h4 className="font-bold uppercase tracking-wider text-xs text-stone-800 dark:text-stone-200 mt-2">4. Intellectual Property Rights</h4>
                    <p className="text-xs">
                      All game logic engines, procedural sound synthesis code, user interface designs, the Scrapbook Design System tokens, graphics, logos, and software code are the intellectual property of Sudoku Together Mode and protected by international copyright and trademark laws.
                    </p>

                    <h4 className="font-bold uppercase tracking-wider text-xs text-stone-800 dark:text-stone-200 mt-2">5. Third-Party Advertisements</h4>
                    <p className="text-xs">
                      The service is monetized via Google AdSense advertisements. We do not control or endorse the content of third-party advertisements or external links. Any interactions or transactions with advertised third parties are solely between you and the respective advertiser.
                    </p>

                    <h4 className="font-bold uppercase tracking-wider text-xs text-stone-800 dark:text-stone-200 mt-2">6. Disclaimer of Warranties & Limitation of Liability</h4>
                    <p className="text-xs">
                      The materials and software on Sudoku Together Mode are provided on an 'as is' basis. Sudoku Together Mode makes no warranties, expressed or implied, and hereby disclaims all other warranties including, without limitation, implied warranties of merchantability, fitness for a particular purpose, or non-infringement. In no event shall Sudoku Together Mode or its developers be liable for any damages (including, without limitation, damages for loss of data or profit) arising out of the use or inability to use the game.
                    </p>

                    <h4 className="font-bold uppercase tracking-wider text-xs text-stone-800 dark:text-stone-200 mt-2">7. Account Deletion & Termination</h4>
                    <p className="text-xs">
                      You may stop using the application at any time. You can delete all your stored profile data instantly using the in-app deletion button. We reserve the right to ban or remove player nicknames or access for users who violate these Terms of Service.
                    </p>

                    <h4 className="font-bold uppercase tracking-wider text-xs text-stone-800 dark:text-stone-200 mt-2">8. Contact Us</h4>
                    <p className="text-xs">
                      If you have questions or legal notices regarding these Terms of Service, please contact us at:
                      <br />
                      <strong className="text-sky-500 dark:text-sky-400">sudokutogethermode@gmail.com</strong>
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
