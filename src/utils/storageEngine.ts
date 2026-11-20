/**
 * Centralized Storage Engine for Sudoku Together
 *
 * Implements canonical single-vault persistence architecture.
 * Encapsulates profile, statistics, personal best times, and game history
 * into atomic user-scoped vaults to eliminate race conditions, key mismatches,
 * and data loss on hard page reload.
 */

import { auth } from "../firebase";

// ============================================================================
// 1. CANONICAL SCHEMA DEFINITION
// ============================================================================

export interface UserVaultProfile {
  id: string;
  displayName: string;
  name?: string;
  avatarColor: string;
  isSynced: boolean;
  email?: string;
}

export interface UserVaultStats {
  totalGamesPlayed: number;
  totalWinsCount: number;
  winStreak: number;
}

export interface UserVaultBestTimes {
  EASY: number | null;
  MEDIUM: number | null;
  HARD: number | null;
  EXPERT: number | null;
  MASTER: number | null;
}

export interface UserVault {
  profile: UserVaultProfile;
  stats: UserVaultStats;
  bestTimes: UserVaultBestTimes;
  completedGames: any[];
  savedGames: any[];
  friends?: any[];
  pastPlayers?: any[];
}

// ============================================================================
// 1b. HYDRATION WRITE LOCK (CLOUD SSOT GUARD)
// ============================================================================
const hydrationWriteLockedUids = new Set<string>();

/**
 * Sets the cloud hydration write lock for an authenticated user UID.
 * While locked, all saveVault and updateVault writes to disk for this UID are BLOCKED,
 * preventing empty/cold-boot data or race conditions from overwriting localStorage or Firestore.
 */
export function setHydrationWriteLock(uid: string | null | undefined, locked: boolean): void {
  if (!uid || uid === "guest" || uid === "GUEST" || uid === "GUEST_ANON" || uid.startsWith("GUEST_")) return;
  if (locked) {
    hydrationWriteLockedUids.add(uid);
  } else {
    hydrationWriteLockedUids.delete(uid);
  }
}

/**
 * Checks whether the cloud hydration write lock is active for a given UID.
 * Strictly returns false for guest, anonymous, or null IDs.
 */
export function isHydrationWriteLocked(uid?: string | null): boolean {
  if (!uid || uid === "guest" || uid === "GUEST" || uid === "GUEST_ANON" || uid.startsWith("GUEST_")) return false;
  return hydrationWriteLockedUids.has(uid);
}

// ============================================================================
// 2. STORAGE KEYS
// ============================================================================

export const STORAGE_KEYS = {
  ACTIVE_USER: "sudoku_active_user",
  VAULT_GUEST: "sudoku_vault_guest",
  VAULT_PREFIX: "sudoku_vault_",
  BLOCKS_VAULT_GUEST: "blocks_guest_vault",
  BLOCKS_VAULT_PREFIX: "blocks_vault_",
  BLOCKS_SAVED_SESSION_GUEST: "blocks_guest_savedSession",
  BLOCKS_SAVED_SESSION_PREFIX: "blocks_user_",
  BLOCKS_SAVED_SESSION_SUFFIX: "_savedSession",
  LAST_AUTH_UID: "sudoku_last_auth_uid",
  ACTIVE_GAME: "sudoku_active_game",
  SAVED_SESSION: "sudoku_savedSession",
  SETTINGS: "sudoku_settings",
  DEVICE_SETTINGS: "sudoku_device_settings",
  FCM_TOKEN: "sudoku_fcm_token",
  OFFLINE_QUEUE: "sudoku_offline_sync_queue",
} as const;

/**
 * Resolves whether an identifier belongs to a guest/anonymous session so
 * guest data never writes into an authenticated UID namespace.
 */
function isGuestVaultIdentity(uid?: string | null): boolean {
  if (
    !uid ||
    uid === "guest" ||
    uid === "GUEST" ||
    uid.startsWith("GUEST_") ||
    uid === "GUEST_ANON"
  ) {
    return true;
  }

  try {
    const currentAuthUser = auth?.currentUser;
    if (currentAuthUser && currentAuthUser.uid === uid) {
      if (currentAuthUser.isAnonymous || !currentAuthUser.email) {
        return true;
      }
    }
    const activeAuthUid = getActiveAuthUid();
    if (!activeAuthUid && currentAuthUser?.isAnonymous) {
      return true;
    }
  } catch {}

  return false;
}

/**
 * Returns the scoped vault storage key for a given user identifier.
 * Guests and anonymous un-synced sessions resolve to 'sudoku_vault_guest'.
 */
export function getVaultKey(uid?: string | null): string {
  if (isGuestVaultIdentity(uid)) {
    return STORAGE_KEYS.VAULT_GUEST;
  }

  return `${STORAGE_KEYS.VAULT_PREFIX}${uid}`;
}

// ============================================================================
// 3. SAFE PARSERS & UTILITIES
// ============================================================================

/**
 * Deterministically generates or loads a permanent guest handle (e.g. Guest_4821)
 * stored in localStorage under 'sudoku_user_profile' so it survives reloads.
 */
export function getOrCreateGuestIdentity(): { id: string; displayName: string } {
  if (typeof window === "undefined") {
    return { id: "GUEST_1001", displayName: "Guest_1001" };
  }

  try {
    // 1. Check existing profile in localStorage under sudoku_user_profile
    const storedProfileRaw = localStorage.getItem("sudoku_user_profile") || localStorage.getItem("sudoku_userProfile");
    if (storedProfileRaw) {
      try {
        const parsed = JSON.parse(storedProfileRaw);
        if (parsed && typeof parsed === "object") {
          const rawName = (parsed.displayName || parsed.name || "").trim();
          const rawId = (parsed.id || "").trim();
          if (rawName && rawName !== "Player" && rawName !== "Anonymous" && rawId) {
            return {
              id: rawId.startsWith("GUEST_") ? rawId : `GUEST_${rawId}`,
              displayName: rawName
            };
          }
        }
      } catch {}
    }

    // 2. Check existing guest vault
    const guestVaultRaw = localStorage.getItem(STORAGE_KEYS.VAULT_GUEST) || localStorage.getItem("sudoku_guest_vault");
    if (guestVaultRaw) {
      try {
        const parsed = JSON.parse(guestVaultRaw);
        if (parsed?.profile) {
          const rawName = (parsed.profile.displayName || parsed.profile.name || "").trim();
          const rawId = (parsed.profile.id || "").trim();
          if (rawName && rawName !== "Player" && rawName !== "Anonymous" && rawId) {
            return {
              id: rawId.startsWith("GUEST_") ? rawId : `GUEST_${rawId}`,
              displayName: rawName
            };
          }
        }
      } catch {}
    }

    // 3. Generate a permanent guest identity once
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const guestId = `GUEST_${randomSuffix}`;
    const guestName = `Guest_${randomSuffix}`;

    const newProfile = {
      id: guestId,
      name: guestName,
      displayName: guestName,
      avatarColor: "#8B5CF6",
      isSynced: false
    };

    localStorage.setItem("sudoku_user_profile", JSON.stringify(newProfile));
    return { id: guestId, displayName: guestName };
  } catch (e) {
    return { id: "GUEST_1001", displayName: "Guest_1001" };
  }
}

/**
 * Robust duration parser: converts time strings (e.g. "01:45", "02:15:30", "95")
 * or numeric seconds into a valid positive integer of seconds. Returns 0 on failure.
 */
export function parseTimeToSeconds(val: unknown): number {
  if (typeof val === "number" && !isNaN(val) && val > 0) {
    return Math.floor(val);
  }
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (/^\d+$/.test(trimmed)) {
      const num = parseInt(trimmed, 10);
      if (!isNaN(num) && num > 0) return num;
    }
    const parts = trimmed.split(":").map(p => parseInt(p, 10));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return parts[0] * 60 + parts[1];
    }
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
  }
  return 0;
}

/**
 * Validates whether a profile name is an un-customized generic placeholder.
 */
export function isGenericDisplayName(name?: string | null): boolean {
  if (!name) return true;
  const trimmed = name.trim();
  const genericPlaceholders = [
    "Anonymous",
    "Guest",
    "Guest Voyager",
    "Anonymous Voyager",
    "Guest Solver",
    "Player"
  ];
  return (
    !trimmed ||
    genericPlaceholders.includes(trimmed) ||
    trimmed.startsWith("Bold Voyager") ||
    /^Player[_\s-]?\d*$/i.test(trimmed) ||
    /^Pro[_\s-]?\d*$/i.test(trimmed)
  );
}

/**
 * Generates an empty default canonical vault with clean initial values.
 */
export function createDefaultVault(options?: Partial<UserVaultProfile>): UserVault {
  const isGuest = !options?.id || options.id.startsWith("GUEST_") || options.id === "guest" || options.id === "GUEST" || options.id === "GUEST_ANON";
  const guestIdentity = isGuest ? getOrCreateGuestIdentity() : null;
  const defaultId = options?.id || (isGuest ? guestIdentity!.id : "GUEST");
  const defaultName = options?.displayName || (isGuest ? guestIdentity!.displayName : (options?.email ? options.email.split("@")[0].slice(0, 15) : getOrCreateGuestIdentity().displayName));

  return {
    profile: {
      id: defaultId,
      displayName: defaultName,
      avatarColor: options?.avatarColor || "#8B5CF6",
      isSynced: options?.isSynced ?? !isGuest,
      email: options?.email
    },
    stats: {
      totalGamesPlayed: 0,
      totalWinsCount: 0,
      winStreak: 0
    },
    bestTimes: {
      EASY: null,
      MEDIUM: null,
      HARD: null,
      EXPERT: null,
      MASTER: null
    },
    completedGames: [],
    savedGames: [],
    friends: [],
    pastPlayers: []
  };
}

// ============================================================================
// 4. STORAGE OPERATIONS (READ / WRITE / UPDATE)
// ============================================================================

/**
 * Synchronously retrieves the active authenticated user ID bridge from localStorage.
 * Used during component startup / reload bootstrap before Firebase Auth finishes token checks.
 */
export function getActiveAuthUid(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const active = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER) || localStorage.getItem(STORAGE_KEYS.LAST_AUTH_UID);
    if (active && !active.startsWith("GUEST_") && active !== "GUEST" && active !== "guest") {
      return active;
    }
  } catch {}
  return null;
}

/**
 * Persists or clears the active authenticated user ID bridge token.
 */
export function setActiveAuthUid(uid?: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (uid && !uid.startsWith("GUEST_") && uid !== "GUEST" && uid !== "guest") {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, uid);
      localStorage.setItem(STORAGE_KEYS.LAST_AUTH_UID, uid);
    } else {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, "guest");
      localStorage.removeItem(STORAGE_KEYS.LAST_AUTH_UID);
    }
  } catch {}
}

/**
 * Scans an array of completed games to reconcile and extract the fastest qualifying winning times.
 * STRICT MISTAKE LIMIT GUARD:
 * If a game was completed with strictMistakeLimit === false (unlimited mistakes/casual mode),
 * or maxMistakes > 3, or mistakes >= 3, or hints > 3, it MUST NOT update or qualify for bestTimes!
 */
export function reconcileBestTimesFromHistory(
  history: any[],
  existingBestTimes?: Partial<UserVaultBestTimes>
): UserVaultBestTimes {
  const result: UserVaultBestTimes = {
    EASY: parseTimeToSeconds(existingBestTimes?.EASY) || null,
    MEDIUM: parseTimeToSeconds(existingBestTimes?.MEDIUM) || null,
    HARD: parseTimeToSeconds(existingBestTimes?.HARD) || null,
    EXPERT: parseTimeToSeconds(existingBestTimes?.EXPERT) || null,
    MASTER: parseTimeToSeconds(existingBestTimes?.MASTER) || null,
  };

  if (!Array.isArray(history)) return result;

  history.forEach(g => {
    if (!g) return;
    const isWon = Boolean(g.isWon === true || g.result === "win" || g.outcome === "win");
    if (!isWon) return;

    // Strict Mistake Limit & Mode Rule Guard:
    // Disqualify custom solver boards or casual/unlimited games from mutating Personal Best records
    if (g.gameMode === "custom") return;
    if (g.strictMistakeLimit === false) return;
    const maxMistakes = Number(g.maxMistakes);
    if (!isNaN(maxMistakes) && maxMistakes > 3) return; // e.g. 999 or custom multiplayer > 3
    const mistakes = Number(g.mistakes);
    if (!isNaN(mistakes) && mistakes >= 3) return;
    const hints = Number(g.hints);
    if (!isNaN(hints) && hints > 3) return;
    const maxHints = Number(g.maxHints);
    if (!isNaN(maxHints) && maxHints > 3) return;

    const diff = String(g.difficulty || "").toUpperCase() as keyof UserVaultBestTimes;
    if (!["EASY", "MEDIUM", "HARD", "EXPERT", "MASTER"].includes(diff)) return;

    const secs = parseTimeToSeconds(g.timeSec ?? g.time ?? g.durationSeconds ?? g.elapsedSeconds);
    if (secs > 0) {
      const current = result[diff];
      if (!current || current === 0 || secs < current) {
        result[diff] = secs;
      }
    }
  });

  return result;
}

/**
 * Updates personal best time for a given difficulty in the user vault with strict mistake limit guards.
 * If strictMistakeLimit === false (unlimited mistakes/casual mode), the path writing to bestTimes is bypassed.
 */
export function updatePersonalBestTime(
  uid: string | null | undefined,
  difficulty: string,
  elapsedSeconds: number,
  options?: {
    strictMistakeLimit?: boolean;
    mistakes?: number;
    maxMistakes?: number;
    hints?: number;
    maxHints?: number;
  }
): boolean {
  if (options?.strictMistakeLimit === false) return false;
  if (options?.maxMistakes !== undefined && options.maxMistakes > 3) return false;
  if (options?.mistakes !== undefined && options.mistakes >= 3) return false;
  if (options?.hints !== undefined && options.hints > 3) return false;
  if (options?.maxHints !== undefined && options.maxHints > 3) return false;
  if (!elapsedSeconds || elapsedSeconds <= 0) return false;

  const diffKey = String(difficulty || "").toUpperCase() as keyof UserVaultBestTimes;
  if (!["EASY", "MEDIUM", "HARD", "EXPERT", "MASTER"].includes(diffKey)) return false;

  let isNewRecord = false;
  updateVault((prevVault) => {
    const current = prevVault.bestTimes[diffKey] || 0;
    if (current === 0 || elapsedSeconds < current) {
      isNewRecord = true;
      return {
        ...prevVault,
        bestTimes: {
          ...prevVault.bestTimes,
          [diffKey]: elapsedSeconds
        }
      };
    }
    return prevVault;
  }, uid);

  return isNewRecord;
}

/**
 * Migrates data from legacy fragmented keys into a canonical UserVault.
 * Ensures zero data-loss for returning users who have data stored across disparate keys.
 */
export function migrateLegacyToVault(uid?: string | null): UserVault {
  const key = getVaultKey(uid);
  const isGuest = key === STORAGE_KEYS.VAULT_GUEST;
  const defaultVault = createDefaultVault(uid ? { id: uid, isSynced: !isGuest } : undefined);

  if (typeof window === "undefined") return defaultVault;

  try {
    // 1. Recover Profile
    const profileRaw = (isGuest ? localStorage.getItem("sudoku_userProfile") : null) 
      || (isGuest ? localStorage.getItem("sudoku_user_profile") : null)
      || (uid ? localStorage.getItem(`sudoku_user_${uid}_userProfile`) : null)
      || (uid ? localStorage.getItem(`sudoku_usr_${uid}_userProfile`) : null);

    if (profileRaw) {
      try {
        const parsed = JSON.parse(profileRaw);
        if (parsed && typeof parsed === "object") {
          if (parsed.id) defaultVault.profile.id = parsed.id;
          if (parsed.name && !isGenericDisplayName(parsed.name)) defaultVault.profile.displayName = parsed.name;
          if (parsed.displayName && !isGenericDisplayName(parsed.displayName)) defaultVault.profile.displayName = parsed.displayName;
          if (parsed.avatarColor) defaultVault.profile.avatarColor = parsed.avatarColor;
          if (typeof parsed.isSynced === "boolean") defaultVault.profile.isSynced = parsed.isSynced;
          if (parsed.email) defaultVault.profile.email = parsed.email;
        }
      } catch {}
    }

    // 2. Recover History
    const historyRaw = (uid ? localStorage.getItem(`sudoku_user_${uid}_completed_games`) : null)
      || (uid ? localStorage.getItem(`sudoku_user_${uid}_history`) : null)
      || (uid ? localStorage.getItem(`sudoku_usr_${uid}_completed_games`) : null)
      || (uid ? localStorage.getItem(`sudoku_usr_${uid}_history`) : null)
      || (isGuest ? localStorage.getItem("sudoku_guest_completed_games") : null)
      || (isGuest ? localStorage.getItem("sudoku_completed_games") : null);

    if (historyRaw) {
      try {
        const parsed = JSON.parse(historyRaw);
        if (Array.isArray(parsed)) defaultVault.completedGames = parsed;
      } catch {}
    }

    // 3. Recover Saved Puzzles
    const savedRaw = (uid ? localStorage.getItem(`sudoku_user_${uid}_saved_games`) : null)
      || (isGuest ? localStorage.getItem("sudoku_guest_saved_games") : null)
      || (isGuest ? localStorage.getItem("sudoku_saved_games") : null);

    if (savedRaw) {
      try {
        const parsed = JSON.parse(savedRaw);
        if (Array.isArray(parsed)) defaultVault.savedGames = parsed;
      } catch {}
    }

    // 4. Recover Career Statistics
    const gamesRaw = (uid ? localStorage.getItem(`sudoku_user_${uid}_total_games_played`) : null)
      || (uid ? localStorage.getItem(`sudoku_user_${uid}_gamesPlayed`) : null)
      || (uid ? localStorage.getItem(`sudoku_usr_${uid}_gamesPlayed`) : null)
      || (isGuest ? localStorage.getItem("sudoku_guest_total_games_played") : null)
      || (isGuest ? localStorage.getItem("sudoku_guest_gamesPlayed") : null)
      || (isGuest ? localStorage.getItem("sudoku_total_games_played") : null)
      || (isGuest ? localStorage.getItem("sudoku_gamesPlayed") : null);

    const winsRaw = (uid ? localStorage.getItem(`sudoku_user_${uid}_total_wins_count`) : null)
      || (uid ? localStorage.getItem(`sudoku_user_${uid}_winsCount`) : null)
      || (uid ? localStorage.getItem(`sudoku_usr_${uid}_winsCount`) : null)
      || (isGuest ? localStorage.getItem("sudoku_guest_total_wins_count") : null)
      || (isGuest ? localStorage.getItem("sudoku_guest_winsCount") : null)
      || (isGuest ? localStorage.getItem("sudoku_total_wins_count") : null)
      || (isGuest ? localStorage.getItem("sudoku_winsCount") : null);

    const streakRaw = (uid ? localStorage.getItem(`sudoku_user_${uid}_winStreak`) : null)
      || (uid ? localStorage.getItem(`sudoku_usr_${uid}_winStreak`) : null)
      || (isGuest ? localStorage.getItem("sudoku_guest_winStreak") : null)
      || (isGuest ? localStorage.getItem("sudoku_winStreak") : null);

    const gamesNum = gamesRaw !== null ? parseInt(gamesRaw, 10) : 0;
    const winsNum = winsRaw !== null ? parseInt(winsRaw, 10) : 0;
    const streakNum = streakRaw !== null ? parseInt(streakRaw, 10) : 0;

    defaultVault.stats.totalGamesPlayed = Math.max(
      isNaN(gamesNum) ? 0 : gamesNum,
      defaultVault.completedGames.length
    );
    defaultVault.stats.totalWinsCount = Math.max(
      isNaN(winsNum) ? 0 : winsNum,
      defaultVault.completedGames.filter(g => g && (g.isWon === true || g.result === "win")).length
    );
    defaultVault.stats.winStreak = isNaN(streakNum) ? 0 : streakNum;

    // 5. Recover Best Times
    const bestTimesRaw = (uid ? localStorage.getItem(`sudoku_user_${uid}_best_times`) : null)
      || (uid ? localStorage.getItem(`sudoku_usr_${uid}_best_times`) : null)
      || (isGuest ? localStorage.getItem("sudoku_guest_best_times") : null)
      || (isGuest ? localStorage.getItem("sudoku_best_times") : null);

    let parsedBestTimes: any = null;
    if (bestTimesRaw) {
      try {
        parsedBestTimes = JSON.parse(bestTimesRaw);
      } catch {}
    }

    defaultVault.bestTimes = reconcileBestTimesFromHistory(
      defaultVault.completedGames,
      parsedBestTimes
    );

    // 6. Recover Friends & Past Players (Guests only)
    if (isGuest) {
      try {
        const legacyPast = localStorage.getItem("sudoku_guest_past_players") || localStorage.getItem("sudoku_guest_recent_players");
        if (legacyPast) {
          const lp = JSON.parse(legacyPast);
          if (Array.isArray(lp)) defaultVault.pastPlayers = lp;
        }
        const legacyFriends = localStorage.getItem("sudoku_guest_friends");
        if (legacyFriends) {
          const lf = JSON.parse(legacyFriends);
          if (Array.isArray(lf)) defaultVault.friends = lf;
        }
      } catch {}
    }

    // Save canonical vault & purge legacy keys to prevent disk bloat
    // For authenticated users, do NOT save a blank/default vault to disk during cold boot.
    // Cloud Firestore is the SSOT and will supply the authoritative vault during hydrateUserFromCloud.
    const isAuthUser = Boolean(uid && uid !== "guest" && uid !== "GUEST" && !uid.startsWith("GUEST_"));
    const hasRecoveredData = defaultVault.completedGames.length > 0
      || defaultVault.stats.totalGamesPlayed > 0
      || defaultVault.stats.totalWinsCount > 0
      || (defaultVault.profile.displayName && !isGenericDisplayName(defaultVault.profile.displayName));

    if (!isAuthUser || hasRecoveredData) {
      if (!isHydrationWriteLocked(uid)) {
        saveVault(defaultVault, uid);
        purgeLegacyKeys(uid);
      }
    }
  } catch (err) {
    console.warn("[StorageEngine] Legacy data migration notice:", err);
  }

  return defaultVault;
}

/**
 * Loads the user vault from localStorage.
 * If the single vault doesn't exist yet, attempts transparent migration from legacy keys.
 */
export function loadVault(uid?: string | null): UserVault {
  const key = getVaultKey(uid);
  if (typeof window === "undefined") {
    return createDefaultVault(uid ? { id: uid } : undefined);
  }

  try {
    let raw = localStorage.getItem(key);
    if (!raw && key === STORAGE_KEYS.VAULT_GUEST) {
      raw = localStorage.getItem("sudoku_guest_vault");
    }
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && parsed.profile && parsed.stats) {
        // Enforce safe uppercase best times
        const safeBestTimes = reconcileBestTimesFromHistory(
          parsed.completedGames || [],
          parsed.bestTimes
        );

        const isGuestVault = key === STORAGE_KEYS.VAULT_GUEST || !uid || uid === "guest" || uid.startsWith("GUEST_") || uid === "GUEST_ANON";
        let resolvedProfileId = parsed.profile.id || uid || "GUEST";
        let resolvedProfileName = parsed.profile.displayName || parsed.profile.name || (isGuestVault ? getOrCreateGuestIdentity().displayName : "Player");
        if (isGuestVault && (resolvedProfileName === "Player" || resolvedProfileName === "Anonymous" || !resolvedProfileName)) {
          const guestIdentity = getOrCreateGuestIdentity();
          resolvedProfileName = guestIdentity.displayName;
          if (!resolvedProfileId || resolvedProfileId === "GUEST" || resolvedProfileId === "guest" || resolvedProfileId === "GUEST_ANON") {
            resolvedProfileId = guestIdentity.id;
          }
        }

        let parsedFriends: any[] | undefined = Array.isArray(parsed.friends) ? parsed.friends : undefined;
        let parsedPastPlayers: any[] | undefined = Array.isArray(parsed.pastPlayers) ? parsed.pastPlayers : undefined;

        if (isGuestVault) {
          if (!parsedPastPlayers) {
            try {
              const legacyPast = localStorage.getItem("sudoku_guest_past_players") || localStorage.getItem("sudoku_guest_recent_players");
              if (legacyPast) {
                const lp = JSON.parse(legacyPast);
                if (Array.isArray(lp)) parsedPastPlayers = lp;
              }
            } catch {}
          }
          if (!parsedFriends) {
            try {
              const legacyFriends = localStorage.getItem("sudoku_guest_friends");
              if (legacyFriends) {
                const lf = JSON.parse(legacyFriends);
                if (Array.isArray(lf)) parsedFriends = lf;
              }
            } catch {}
          }
        }

        return {
          profile: {
            id: resolvedProfileId,
            displayName: resolvedProfileName,
            avatarColor: parsed.profile.avatarColor || "#8B5CF6",
            isSynced: Boolean(parsed.profile.isSynced),
            email: parsed.profile.email
          },
          stats: {
            totalGamesPlayed: Number(parsed.stats.totalGamesPlayed ?? parsed.stats.gamesPlayed) || 0,
            totalWinsCount: Number(parsed.stats.totalWinsCount ?? parsed.stats.winsCount ?? parsed.stats.wins) || 0,
            winStreak: Number(parsed.stats.winStreak) || 0
          },
          bestTimes: safeBestTimes,
          completedGames: Array.isArray(parsed.completedGames) ? parsed.completedGames : [],
          savedGames: Array.isArray(parsed.savedGames) ? parsed.savedGames : [],
          friends: parsedFriends || [],
          pastPlayers: parsedPastPlayers || []
        };
      }
    }
  } catch (err) {
    console.warn(`[StorageEngine] Error parsing vault for key "${key}":`, err);
  }

  // Fallback: migrate from legacy keys and save immediately
  const migrated = migrateLegacyToVault(uid);
  return migrated;
}

/**
 * Safely purges un-scoped and legacy keys from localStorage once migrated to the canonical vault.
 */
export function purgeLegacyKeys(uid?: string | null): void {
  if (typeof window === "undefined") return;
  const targetUid = uid && uid !== "guest" ? uid : null;
  const keysToRemove: string[] = [
    "sudoku_total_games_played",
    "sudoku_gamesPlayed",
    "sudoku_total_wins_count",
    "sudoku_winsCount",
    "sudoku_winStreak",
    "sudoku_best_times",
    "sudoku_completed_games",
    "sudoku_saved_games",
    "sudoku_history",
    "sudoku_user_profile"
  ];

  if (!targetUid) {
    keysToRemove.push(
      "sudoku_guest_theme",
      "sudoku_guest_activeTheme",
      "sudoku_guest_darkMode",
      "sudoku_guest_userProfile",
      "sudoku_guest_completed_games",
      "sudoku_guest_saved_games",
      "sudoku_guest_total_games_played",
      "sudoku_guest_gamesPlayed",
      "sudoku_guest_total_wins_count",
      "sudoku_guest_winsCount",
      "sudoku_guest_winStreak",
      "sudoku_guest_best_times",
      "sudoku_guest_stats"
    );
  } else {
    keysToRemove.push(
      `sudoku_user_${targetUid}_profile`,
      `sudoku_usr_${targetUid}_userProfile`,
      `sudoku_user_${targetUid}_completed_games`,
      `sudoku_user_${targetUid}_history`,
      `sudoku_usr_${targetUid}_completed_games`,
      `sudoku_usr_${targetUid}_history`,
      `sudoku_user_${targetUid}_saved_games`,
      `sudoku_user_${targetUid}_total_games_played`,
      `sudoku_user_${targetUid}_gamesPlayed`,
      `sudoku_usr_${targetUid}_gamesPlayed`,
      `sudoku_user_${targetUid}_total_wins_count`,
      `sudoku_user_${targetUid}_winsCount`,
      `sudoku_usr_${targetUid}_winsCount`,
      `sudoku_user_${targetUid}_winStreak`,
      `sudoku_usr_${targetUid}_winStreak`,
      `sudoku_user_${targetUid}_best_times`,
      `sudoku_usr_${targetUid}_best_times`,
      `sudoku_usr_${targetUid}_stats`,
      `sudoku_user_${targetUid}_stats`,
      `sudoku_usr_${targetUid}_friends`,
      `sudoku_usr_${targetUid}_recent_players`,
      `sudoku_usr_${targetUid}_activeTheme`,
      `sudoku_usr_${targetUid}_darkMode`
    );
  }

  for (const k of keysToRemove) {
    try {
      localStorage.removeItem(k);
    } catch {}
  }
}

/**
 * Persists the user vault to localStorage atomically.
 * Returns true if the write succeeded.
 * Supports both saveVault(vault, uid) and saveVault(uid, vault).
 */
export function saveVault(vault: UserVault, uid?: string | null): boolean;
export function saveVault(uid: string | null | undefined, vault: UserVault): boolean;
export function saveVault(
  arg1: UserVault | string | null | undefined,
  arg2?: UserVault | string | null
): boolean {
  if (typeof window === "undefined" || (!arg1 && !arg2)) return false;
  let vault: UserVault;
  let uid: string | null = null;

  if (arg1 && typeof arg1 === "object" && "profile" in arg1 && "stats" in arg1) {
    vault = arg1 as UserVault;
    uid = typeof arg2 === "string" ? arg2 : null;
  } else if (arg2 && typeof arg2 === "object" && "profile" in arg2 && "stats" in arg2) {
    vault = arg2 as UserVault;
    uid = typeof arg1 === "string" ? arg1 : null;
  } else {
    return false;
  }

  const targetUid = uid || vault.profile?.id;
  if (isHydrationWriteLocked(targetUid)) {
    console.warn(`[StorageEngine] Suppressed saveVault for uid "${targetUid}" — Cloud hydration write-lock is active.`);
    return false;
  }

  const key = getVaultKey(targetUid);

  try {
    const serialized = JSON.stringify(vault);
    localStorage.setItem(key, serialized);
    if (key === STORAGE_KEYS.VAULT_GUEST) {
      localStorage.setItem("sudoku_guest_vault", serialized);
    }
    return true;
  } catch (err) {
    console.error(`[StorageEngine] Failed to write vault to key "${key}":`, err);
    return false;
  }
}

/**
 * Atomically updates the vault using an updater transformation function.
 * Supports both updateVault(updater, uid) and updateVault(uid, updater).
 */
export function updateVault(updater: (prev: UserVault) => UserVault, uid?: string | null): UserVault;
export function updateVault(uid: string | null | undefined, updater: (prev: UserVault) => UserVault): UserVault;
export function updateVault(
  arg1: ((prev: UserVault) => UserVault) | string | null | undefined,
  arg2?: ((prev: UserVault) => UserVault) | string | null
): UserVault {
  let updater: (prev: UserVault) => UserVault;
  let uid: string | null = null;

  if (typeof arg1 === "function") {
    updater = arg1;
    uid = typeof arg2 === "string" ? arg2 : null;
  } else if (typeof arg2 === "function") {
    updater = arg2;
    uid = typeof arg1 === "string" ? arg1 : null;
  } else {
    throw new Error("[StorageEngine] updateVault requires an updater function");
  }

  const current = loadVault(uid);
  const next = updater(current);
  saveVault(next, uid);
  return next;
}

/**
 * Clears the vault for a given user from localStorage.
 */
export function clearVault(uid?: string | null): void {
  if (typeof window === "undefined") return;
  const key = getVaultKey(uid);
  try {
    localStorage.removeItem(key);
  } catch {}
}

/**
 * Checks whether a persistent vault exists in localStorage for a given user identifier.
 */
export function hasVault(uid?: string | null): boolean {
  if (typeof window === "undefined") return false;
  const key = getVaultKey(uid);
  try {
    return localStorage.getItem(key) !== null;
  } catch {
    return false;
  }
}

// ============================================================================
// 5. CANONICAL DEVICE SETTINGS (sudoku_settings)
// ============================================================================

export interface DeviceSettings {
  theme?: "Original" | "Sticky Note Pro";
  activeTheme?: "Original" | "Sticky Note Pro";
  darkMode?: boolean;
  soundEffects?: boolean;
  vibrations?: boolean;
  hapticVibrations?: boolean;
  timerEnabled?: boolean;
  activeTimerClock?: boolean;
  mistakeLimitEnabled?: boolean;
  strictMistakeLimit?: boolean;
  notificationsEnabled?: boolean;
  pushNotifications?: boolean;
  language?: string;
  [key: string]: any;
}

/**
 * Loads device settings from the canonical sudoku_settings storage key.
 */
export function getSettings(): DeviceSettings {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS) || localStorage.getItem(STORAGE_KEYS.DEVICE_SETTINGS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

/**
 * Persists device settings to the canonical sudoku_settings storage key.
 */
export function saveSettings(settings: Partial<DeviceSettings>): DeviceSettings {
  if (typeof window === "undefined") return settings as DeviceSettings;
  try {
    const current = getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error("[StorageEngine] Failed to save settings:", err);
    return settings as DeviceSettings;
  }
}

// ============================================================================
// 6. BLOCK SYNC VAULT (blocks_vault_${uid} / blocks_guest_vault)
// ============================================================================

export interface BlocksRunEntry {
  id: string;
  score: number;
  achievedAt: number;
}

export interface BlocksMatchStandingEntry {
  uid: string;
  name: string;
  score: number;
  isCurrentUser?: boolean;
}

export interface BlocksMatchRecord {
  id: string;
  score: number;
  bestAtTime: number;
  isNewBest: boolean;
  percentile: number;
  mode: "solo" | "multiplayer";
  boardSnapshot: (string | null)[][];
  roomCode?: string;
  roomStandings?: BlocksMatchStandingEntry[];
  playedAt: string;
}

export interface BlocksVault {
  bestScore: number;
  updatedAt: number;
  gamesPlayed?: number;
  topRuns?: BlocksRunEntry[];
  recentMatches?: BlocksMatchRecord[];
}

const MAX_BLOCKS_TOP_RUNS = 15;
const MAX_BLOCKS_RECENT_MATCHES = 20;

function sanitizeBlocksTopRuns(raw: unknown): BlocksRunEntry[] {
  if (!Array.isArray(raw)) return [];
  const valid: BlocksRunEntry[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const candidate = item as Record<string, unknown>;
    const score = Math.max(0, Math.floor(Number(candidate.score) || 0));
    const achievedAt = Math.max(0, Number(candidate.achievedAt) || 0);
    const id =
      typeof candidate.id === "string" && candidate.id.trim().length > 0
        ? candidate.id
        : `run-${achievedAt}-${score}-${valid.length}`;
    valid.push({ id, score, achievedAt });
  }
  valid.sort((a, b) => b.score - a.score || b.achievedAt - a.achievedAt);
  return valid.slice(0, MAX_BLOCKS_TOP_RUNS);
}

function sanitizeBlocksBoardSnapshot(raw: unknown): (string | null)[][] {
  if (!Array.isArray(raw) || raw.length !== 9) return [];
  const rows: (string | null)[][] = [];
  for (const rawRow of raw) {
    if (!Array.isArray(rawRow) || rawRow.length !== 9) return [];
    rows.push(
      rawRow.map((cell) =>
        typeof cell === "string" && cell.trim().length > 0 ? cell : null
      )
    );
  }
  return rows;
}

function sanitizeBlocksRoomStandings(
  raw: unknown
): BlocksMatchStandingEntry[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const entries: BlocksMatchStandingEntry[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const candidate = item as Record<string, unknown>;
    const uid =
      typeof candidate.uid === "string" ? candidate.uid.trim() : "";
    const name =
      typeof candidate.name === "string" && candidate.name.trim().length > 0
        ? candidate.name.trim()
        : "Player";
    const score = Math.max(0, Math.floor(Number(candidate.score) || 0));
    entries.push({
      uid,
      name,
      score,
      ...(candidate.isCurrentUser ? { isCurrentUser: true } : {}),
    });
  }
  return entries.length > 0 ? entries : undefined;
}

function sanitizeBlocksRecentMatches(raw: unknown): BlocksMatchRecord[] {
  if (!Array.isArray(raw)) return [];
  const valid: BlocksMatchRecord[] = [];
  const seenIds = new Set<string>();

  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const candidate = item as Record<string, unknown>;
    const score = Math.max(0, Math.floor(Number(candidate.score) || 0));
    const bestAtTime = Math.max(
      score,
      Math.floor(Number(candidate.bestAtTime) || 0)
    );
    const percentile = Math.min(
      99,
      Math.max(0, Math.round(Number(candidate.percentile) || 0))
    );
    const mode: "solo" | "multiplayer" =
      candidate.mode === "multiplayer" ? "multiplayer" : "solo";
    const playedAt =
      typeof candidate.playedAt === "string" &&
      !Number.isNaN(Date.parse(candidate.playedAt))
        ? candidate.playedAt
        : new Date().toISOString();
    const id =
      typeof candidate.id === "string" && candidate.id.trim().length > 0
        ? candidate.id
        : `match-${Date.parse(playedAt) || Date.now()}-${score}-${valid.length}`;

    if (seenIds.has(id)) continue;
    seenIds.add(id);

    const roomCode =
      typeof candidate.roomCode === "string" && candidate.roomCode.trim().length > 0
        ? candidate.roomCode.trim()
        : undefined;
    const roomStandings = sanitizeBlocksRoomStandings(candidate.roomStandings);

    valid.push({
      id,
      score,
      bestAtTime,
      isNewBest: Boolean(candidate.isNewBest),
      percentile,
      mode,
      boardSnapshot: sanitizeBlocksBoardSnapshot(candidate.boardSnapshot),
      ...(roomCode ? { roomCode } : {}),
      ...(roomStandings ? { roomStandings } : {}),
      playedAt,
    });
  }

  valid.sort((a, b) => {
    const timeDiff = (Date.parse(b.playedAt) || 0) - (Date.parse(a.playedAt) || 0);
    return timeDiff;
  });

  return valid.slice(0, MAX_BLOCKS_RECENT_MATCHES);
}

/**
 * Returns the UID-isolated Block Sync vault key (`blocks_vault_${uid}` or `blocks_guest_vault`).
 */
export function getBlocksVaultKey(uid?: string | null): string {
  if (isGuestVaultIdentity(uid)) {
    return STORAGE_KEYS.BLOCKS_VAULT_GUEST;
  }
  return `${STORAGE_KEYS.BLOCKS_VAULT_PREFIX}${uid}`;
}

/**
 * Loads the persisted Block Sync vault for the given user or guest identity.
 */
export function loadBlocksVault(uid?: string | null): BlocksVault {
  if (typeof window === "undefined") {
    return { bestScore: 0, updatedAt: 0, gamesPlayed: 0, topRuns: [], recentMatches: [] };
  }

  const key = getBlocksVaultKey(uid);
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        const bestScore = Math.max(0, Math.floor(Number(parsed.bestScore) || 0));
        const updatedAt = Math.max(0, Number(parsed.updatedAt) || 0);
        const gamesPlayed = Math.max(0, Math.floor(Number(parsed.gamesPlayed) || 0));
        const topRuns = sanitizeBlocksTopRuns(parsed.topRuns);
        const recentMatches = sanitizeBlocksRecentMatches(parsed.recentMatches);
        return { bestScore, updatedAt, gamesPlayed, topRuns, recentMatches };
      }
    }
  } catch (err) {
    console.warn(`[StorageEngine] Error loading blocks vault for key "${key}":`, err);
  }

  return { bestScore: 0, updatedAt: 0, gamesPlayed: 0, topRuns: [], recentMatches: [] };
}

/**
 * Saves the Block Sync vault cleanly under the UID-isolated storage key.
 */
export function saveBlocksVault(vault: BlocksVault, uid?: string | null): boolean {
  if (typeof window === "undefined") return false;
  const key = getBlocksVaultKey(uid);
  const topRuns = sanitizeBlocksTopRuns(vault.topRuns);
  const recentMatches = sanitizeBlocksRecentMatches(vault.recentMatches);
  const highestRunScore = topRuns[0]?.score ?? 0;
  const gamesPlayed = Math.max(
    0,
    Math.floor(Number(vault.gamesPlayed) || 0),
    recentMatches.length
  );
  const sanitized: BlocksVault = {
    bestScore: Math.max(0, Math.floor(Number(vault.bestScore) || 0), highestRunScore),
    updatedAt: Number(vault.updatedAt) || Date.now(),
    gamesPlayed,
    topRuns,
    recentMatches,
  };

  try {
    localStorage.setItem(key, JSON.stringify(sanitized));
    return true;
  } catch (err) {
    console.error(`[StorageEngine] Failed to save blocks vault "${key}":`, err);
    return false;
  }
}

/**
 * Compares a finished game's score against the persisted Best Score, records the
 * completed run in the UID-isolated top runs list (preserving legacy prior best if
 * runs history was empty), and updates the Block Sync vault without clobbering
 * `gamesPlayed` or `recentMatches`.
 */
export function updateBlocksBestScore(
  score: number,
  uid?: string | null
): {
  previousBestScore: number;
  bestScore: number;
  isNewBest: boolean;
  currentRunId: string;
  topRuns: BlocksRunEntry[];
} {
  const safeScore = Math.max(0, Math.floor(Number(score) || 0));
  const current = loadBlocksVault(uid);
  const previousBestScore = current.bestScore;
  const now = Date.now();
  const currentRunId = `run-${now}-${Math.random().toString(36).slice(2, 7)}`;

  const existingRuns = [...(current.topRuns ?? [])];
  if (existingRuns.length === 0 && previousBestScore > 0) {
    existingRuns.push({
      id: `legacy-best-${current.updatedAt || 0}`,
      score: previousBestScore,
      achievedAt: current.updatedAt || 0,
    });
  }
  existingRuns.push({
    id: currentRunId,
    score: safeScore,
    achievedAt: now,
  });

  const sortedRuns = sanitizeBlocksTopRuns(existingRuns);
  const nextBestScore = Math.max(previousBestScore, safeScore);
  const isNewBest = safeScore > previousBestScore;

  saveBlocksVault(
    {
      bestScore: nextBestScore,
      updatedAt: now,
      gamesPlayed: current.gamesPlayed,
      topRuns: sortedRuns,
      recentMatches: current.recentMatches,
    },
    uid
  );

  return {
    previousBestScore,
    bestScore: nextBestScore,
    isNewBest,
    currentRunId,
    topRuns: sortedRuns,
  };
}

/**
 * Records a completed Block Sync match into UID-isolated `recentMatches` (up to 20
 * reverse-chronological entries) without breaking `bestScore`, `gamesPlayed`, or `topRuns`.
 */
export function recordBlocksMatchHistory(
  uid: string | null | undefined,
  record: Omit<BlocksMatchRecord, "id" | "playedAt"> & {
    id?: string;
    playedAt?: string;
  }
): BlocksMatchRecord[] {
  const current = loadBlocksVault(uid);
  const existingMatches = current.recentMatches ?? [];
  const entryId =
    typeof record.id === "string" && record.id.trim().length > 0
      ? record.id.trim()
      : `match-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  if (existingMatches.some((m) => m.id === entryId)) {
    return existingMatches;
  }

  const normalizedRecord: BlocksMatchRecord = {
    id: entryId,
    score: Math.max(0, Math.floor(Number(record.score) || 0)),
    bestAtTime: Math.max(
      Math.floor(Number(record.score) || 0),
      Math.floor(Number(record.bestAtTime) || 0)
    ),
    isNewBest: Boolean(record.isNewBest),
    percentile: Math.min(99, Math.max(0, Math.round(Number(record.percentile) || 0))),
    mode: record.mode === "multiplayer" ? "multiplayer" : "solo",
    boardSnapshot: sanitizeBlocksBoardSnapshot(record.boardSnapshot),
    ...(record.roomCode ? { roomCode: record.roomCode } : {}),
    ...(record.roomStandings && record.roomStandings.length > 0
      ? { roomStandings: record.roomStandings }
      : {}),
    playedAt:
      typeof record.playedAt === "string" &&
      !Number.isNaN(Date.parse(record.playedAt))
        ? record.playedAt
        : new Date().toISOString(),
  };

  const nextMatches = sanitizeBlocksRecentMatches([
    normalizedRecord,
    ...existingMatches,
  ]);
  const nextBestScore = Math.max(
    current.bestScore,
    normalizedRecord.score,
    normalizedRecord.bestAtTime
  );

  saveBlocksVault(
    {
      bestScore: nextBestScore,
      updatedAt: Date.now(),
      gamesPlayed: (current.gamesPlayed ?? 0) + 1,
      topRuns: current.topRuns,
      recentMatches: nextMatches,
    },
    uid
  );

  return nextMatches;
}

/**
 * Returns up to 20 recent Block Sync matches in reverse-chronological order for the UID.
 */
export function getBlocksMatchHistory(uid?: string | null): BlocksMatchRecord[] {
  return loadBlocksVault(uid).recentMatches ?? [];
}

// ============================================================================
// 7. BLOCK SYNC RESUME SESSION (blocks_user_${uid}_savedSession / blocks_guest_savedSession)
// ============================================================================

export interface BlocksSavedBoardCell {
  color: string;
  isClearing?: boolean;
}

export interface BlocksSavedPiece {
  uid: string;
  shapeId: string;
  variantId: string;
  shape: readonly (readonly (0 | 1)[])[];
  color: string;
}

export interface BlocksSavedMoveSnapshot {
  boardState: (BlocksSavedBoardCell | null)[][];
  currentBlocks: (BlocksSavedPiece | null)[];
  score: number;
  clearStreak: number;
  lastTrayShapeIds: string[];
}

export interface BlocksSavedSession {
  boardState: (BlocksSavedBoardCell | null)[][];
  currentBlocks: (BlocksSavedPiece | null)[];
  score: number;
  clearStreak: number;
  lastTrayShapeIds: string[];
  historyStack: BlocksSavedMoveSnapshot[];
  updatedAt: number;
}

const BLOCKS_BOARD_DIM = 9;
const BLOCKS_TRAY_COUNT = 3;
const BLOCKS_MAX_HISTORY = 25;

function sanitizeBlocksBoard(rawBoard: unknown): (BlocksSavedBoardCell | null)[][] | null {
  if (!Array.isArray(rawBoard) || rawBoard.length !== BLOCKS_BOARD_DIM) return null;

  const cleanBoard: (BlocksSavedBoardCell | null)[][] = [];
  for (let r = 0; r < BLOCKS_BOARD_DIM; r += 1) {
    const rawRow = rawBoard[r];
    if (!Array.isArray(rawRow) || rawRow.length !== BLOCKS_BOARD_DIM) return null;

    const cleanRow: (BlocksSavedBoardCell | null)[] = [];
    for (let c = 0; c < BLOCKS_BOARD_DIM; c += 1) {
      const cell = rawRow[c];
      if (cell === null) {
        cleanRow.push(null);
      } else if (
        cell &&
        typeof cell === "object" &&
        typeof (cell as { color?: unknown }).color === "string"
      ) {
        const typedCell = cell as { color: string; isClearing?: unknown };
        // Strip transient vanish animation cells cleanly so resumed boards never freeze
        cleanRow.push(
          typedCell.isClearing === true
            ? null
            : { color: typedCell.color, isClearing: false }
        );
      } else {
        return null;
      }
    }
    cleanBoard.push(cleanRow);
  }
  return cleanBoard;
}

function sanitizeBlocksPiece(rawPiece: unknown): BlocksSavedPiece | null | undefined {
  if (rawPiece === null) return null;
  if (!rawPiece || typeof rawPiece !== "object") return undefined;

  const p = rawPiece as Record<string, unknown>;
  if (
    typeof p.uid !== "string" ||
    typeof p.shapeId !== "string" ||
    typeof p.variantId !== "string" ||
    typeof p.color !== "string" ||
    !Array.isArray(p.shape) ||
    p.shape.length === 0
  ) {
    return undefined;
  }

  const colCount = Array.isArray(p.shape[0]) ? p.shape[0].length : 0;
  if (colCount === 0) return undefined;

  const cleanShape: (0 | 1)[][] = [];
  for (let r = 0; r < p.shape.length; r += 1) {
    const row = p.shape[r];
    if (!Array.isArray(row) || row.length !== colCount) return undefined;
    const cleanRow: (0 | 1)[] = [];
    for (let c = 0; c < row.length; c += 1) {
      const bit = row[c];
      if (bit !== 0 && bit !== 1) return undefined;
      cleanRow.push(bit);
    }
    cleanShape.push(cleanRow);
  }

  return {
    uid: p.uid,
    shapeId: p.shapeId,
    variantId: p.variantId,
    shape: cleanShape,
    color: p.color,
  };
}

function sanitizeBlocksTray(rawTray: unknown): (BlocksSavedPiece | null)[] | null {
  if (!Array.isArray(rawTray) || rawTray.length !== BLOCKS_TRAY_COUNT) return null;
  const cleanTray: (BlocksSavedPiece | null)[] = [];
  let hasPiece = false;

  for (let i = 0; i < BLOCKS_TRAY_COUNT; i += 1) {
    const cleanPiece = sanitizeBlocksPiece(rawTray[i]);
    if (cleanPiece === undefined) return null;
    if (cleanPiece !== null) hasPiece = true;
    cleanTray.push(cleanPiece);
  }

  return hasPiece ? cleanTray : null;
}

function sanitizeBlocksSnapshot(rawSnap: unknown): BlocksSavedMoveSnapshot | null {
  if (!rawSnap || typeof rawSnap !== "object") return null;
  const s = rawSnap as Record<string, unknown>;
  const boardState = sanitizeBlocksBoard(s.boardState);
  const currentBlocks = sanitizeBlocksTray(s.currentBlocks);
  if (!boardState || !currentBlocks) return null;
  if (typeof s.score !== "number" || !Number.isFinite(s.score) || s.score < 0) return null;

  return {
    boardState,
    currentBlocks,
    score: Math.floor(s.score),
    clearStreak: Math.max(0, Math.floor(Number(s.clearStreak) || 0)),
    lastTrayShapeIds: Array.isArray(s.lastTrayShapeIds)
      ? s.lastTrayShapeIds.filter((id): id is string => typeof id === "string")
      : [],
  };
}

/**
 * Returns the UID-isolated Block Sync saved session key
 * (`blocks_user_${uid}_savedSession` or `blocks_guest_savedSession`).
 */
export function getBlocksSavedSessionKey(uid?: string | null): string {
  if (isGuestVaultIdentity(uid)) {
    return STORAGE_KEYS.BLOCKS_SAVED_SESSION_GUEST;
  }
  return `${STORAGE_KEYS.BLOCKS_SAVED_SESSION_PREFIX}${uid}${STORAGE_KEYS.BLOCKS_SAVED_SESSION_SUFFIX}`;
}

/**
 * Persists the active in-progress Block Sync game session for resume continuity.
 */
export function saveBlocksSavedSession(
  session: BlocksSavedSession,
  uid?: string | null
): boolean {
  if (typeof window === "undefined") return false;
  const key = getBlocksSavedSessionKey(uid);
  const cleanBoard = sanitizeBlocksBoard(session.boardState);
  const cleanTray = sanitizeBlocksTray(session.currentBlocks);
  if (
    !cleanBoard ||
    !cleanTray ||
    typeof session.score !== "number" ||
    !Number.isFinite(session.score) ||
    session.score < 0
  ) {
    return false;
  }

  const cleanHistory: BlocksSavedMoveSnapshot[] = Array.isArray(session.historyStack)
    ? session.historyStack
        .slice(-BLOCKS_MAX_HISTORY)
        .map(sanitizeBlocksSnapshot)
        .filter((snap): snap is BlocksSavedMoveSnapshot => snap !== null)
    : [];

  const sanitized: BlocksSavedSession = {
    boardState: cleanBoard,
    currentBlocks: cleanTray,
    score: Math.floor(session.score),
    clearStreak: Math.max(0, Math.floor(Number(session.clearStreak) || 0)),
    lastTrayShapeIds: Array.isArray(session.lastTrayShapeIds)
      ? session.lastTrayShapeIds.filter((id): id is string => typeof id === "string")
      : [],
    historyStack: cleanHistory,
    updatedAt: Number(session.updatedAt) || Date.now(),
  };

  try {
    localStorage.setItem(key, JSON.stringify(sanitized));
    return true;
  } catch (err) {
    console.error(`[StorageEngine] Failed to save blocks session "${key}":`, err);
    return false;
  }
}

/**
 * Loads and validates a saved in-progress Block Sync session, returning null when
 * absent or malformed.
 */
export function loadBlocksSavedSession(uid?: string | null): BlocksSavedSession | null {
  if (typeof window === "undefined") return null;
  const key = getBlocksSavedSessionKey(uid);

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown> | null;
    if (!parsed || typeof parsed !== "object") return null;

    const boardState = sanitizeBlocksBoard(parsed.boardState);
    const currentBlocks = sanitizeBlocksTray(parsed.currentBlocks);
    if (
      !boardState ||
      !currentBlocks ||
      typeof parsed.score !== "number" ||
      !Number.isFinite(parsed.score) ||
      parsed.score < 0
    ) {
      return null;
    }

    const historyStack: BlocksSavedMoveSnapshot[] = Array.isArray(parsed.historyStack)
      ? parsed.historyStack
          .slice(-BLOCKS_MAX_HISTORY)
          .map(sanitizeBlocksSnapshot)
          .filter((snap): snap is BlocksSavedMoveSnapshot => snap !== null)
      : [];

    return {
      boardState,
      currentBlocks,
      score: Math.floor(parsed.score),
      clearStreak: Math.max(0, Math.floor(Number(parsed.clearStreak) || 0)),
      lastTrayShapeIds: Array.isArray(parsed.lastTrayShapeIds)
        ? parsed.lastTrayShapeIds.filter((id): id is string => typeof id === "string")
        : [],
      historyStack,
      updatedAt: Math.max(0, Number(parsed.updatedAt) || 0),
    };
  } catch (err) {
    console.warn(`[StorageEngine] Error loading blocks session for key "${key}":`, err);
    return null;
  }
}

/**
 * Clears the persisted in-progress Block Sync session for the active identity.
 */
export function clearBlocksSavedSession(uid?: string | null): void {
  if (typeof window === "undefined") return;
  const key = getBlocksSavedSessionKey(uid);
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[StorageEngine] Failed to clear blocks session "${key}":`, err);
  }
}

