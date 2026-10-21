/**
 * Centralized Storage Engine for Sudoku Together
 *
 * Implements canonical single-vault persistence architecture.
 * Encapsulates profile, statistics, personal best times, and game history
 * into atomic user-scoped vaults to eliminate race conditions, key mismatches,
 * and data loss on hard page reload.
 */

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
}

// ============================================================================
// 2. STORAGE KEYS
// ============================================================================

export const STORAGE_KEYS = {
  ACTIVE_USER: "sudoku_active_user",
  VAULT_GUEST: "sudoku_vault_guest",
  VAULT_PREFIX: "sudoku_vault_",
  LAST_AUTH_UID: "sudoku_last_auth_uid",
  ACTIVE_GAME: "sudoku_active_game",
  SAVED_SESSION: "sudoku_savedSession",
  SETTINGS: "sudoku_settings",
  DEVICE_SETTINGS: "sudoku_device_settings",
  FCM_TOKEN: "sudoku_fcm_token",
  OFFLINE_QUEUE: "sudoku_offline_sync_queue",
} as const;

/**
 * Returns the scoped vault storage key for a given user identifier.
 * Guests and anonymous un-synced sessions resolve to 'sudoku_vault_guest'.
 */
export function getVaultKey(uid?: string | null): string {
  if (!uid || uid === "guest" || uid === "GUEST" || uid.startsWith("GUEST_") || uid === "GUEST_ANON") {
    return STORAGE_KEYS.VAULT_GUEST;
  }
  return `${STORAGE_KEYS.VAULT_PREFIX}${uid}`;
}

// ============================================================================
// 3. SAFE PARSERS & UTILITIES
// ============================================================================

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
    trimmed.startsWith("Bold Voyager")
  );
}

/**
 * Generates an empty default canonical vault with clean initial values.
 */
export function createDefaultVault(options?: Partial<UserVaultProfile>): UserVault {
  const isGuest = !options?.id || options.id.startsWith("GUEST_") || options.id === "guest";
  const defaultId = options?.id || (isGuest ? `GUEST_${Math.floor(1000 + Math.random() * 9000)}` : "GUEST");
  const defaultName = options?.displayName || `Pro_${defaultId.includes("_") ? defaultId.split("_")[1] : Math.floor(1000 + Math.random() * 9000)}`;

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
    savedGames: []
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

    // Strict Mistake Limit Rule Guard:
    // Disqualify if strictMistakeLimit is false (unlimited mistakes / casual mode)
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

    // Save canonical vault & purge legacy keys to prevent disk bloat
    saveVault(defaultVault, uid);
    purgeLegacyKeys(uid);
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
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && parsed.profile && parsed.stats) {
        // Enforce safe uppercase best times
        const safeBestTimes = reconcileBestTimesFromHistory(
          parsed.completedGames || [],
          parsed.bestTimes
        );

        return {
          profile: {
            id: parsed.profile.id || uid || "GUEST",
            displayName: parsed.profile.displayName || parsed.profile.name || "Player",
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
          savedGames: Array.isArray(parsed.savedGames) ? parsed.savedGames : []
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
      "sudoku_guest_vault",
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

  const key = getVaultKey(uid || vault.profile?.id);

  try {
    const serialized = JSON.stringify(vault);
    localStorage.setItem(key, serialized);
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

