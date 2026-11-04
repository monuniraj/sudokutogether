/**
 * CrazyGames SDK v3 Isolated Wrapper Service
 * Provides safe initialization, user retrieval, cloud data persistence, and invite links
 * without mutating Firebase auth or UI state.
 */

declare global {
  interface Window {
    CrazyGames?: any;
  }
}

let isInitialized = false;

/**
 * Checks whether CrazyGames SDK is present in window.
 */
export function isCrazyGamesActive(): boolean {
  return typeof window !== "undefined" && Boolean(window.CrazyGames);
}

/**
 * Initializes the CrazyGames SDK v3.
 * Gracefully no-ops if running outside CrazyGames (standalone web, Capacitor APK, Itch.io).
 */
export async function initCrazyGames(): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  if (!window.CrazyGames) {
    console.log("[CrazyGamesSDK] window.CrazyGames is not available; continuing normal gameplay.");
    return;
  }

  if (isInitialized) {
    return;
  }

  try {
    await window.CrazyGames.SDK.init();
    isInitialized = true;
    console.log("[CrazyGamesSDK] Initialized successfully.");
  } catch (error) {
    console.warn("[CrazyGamesSDK] Initialization failed or ignored:", error);
  }
}

/**
 * Safely fetches the CrazyGames authenticated user profile.
 * Returns the user object if authenticated, or null if unauthenticated / running outside CrazyGames.
 */
export async function getCrazyGamesUser(): Promise<any | null> {
  if (typeof window === "undefined" || !window.CrazyGames?.SDK?.user) {
    return null;
  }

  try {
    const user = await window.CrazyGames.SDK.user.getUser();
    return user || null;
  } catch (error) {
    console.warn("[CrazyGamesSDK] Failed to fetch user:", error);
    return null;
  }
}

/**
 * Safely retrieves persistent key-value data via CrazyGames SDK.data.
 * Returns null if not running on CrazyGames or if the key does not exist.
 */
export async function getCrazyGamesData(key: string): Promise<string | null> {
  if (typeof window === "undefined" || !window.CrazyGames?.SDK?.data?.getItem) {
    return null;
  }

  try {
    const value = await window.CrazyGames.SDK.data.getItem(key);
    return typeof value === "string" ? value : null;
  } catch (error) {
    console.warn("[CrazyGamesSDK] Failed to get data for key:", key, error);
    return null;
  }
}

/**
 * Safely persists key-value data via CrazyGames SDK.data.
 * Gracefully no-ops if not running on CrazyGames.
 */
export async function setCrazyGamesData(key: string, value: string): Promise<void> {
  if (typeof window === "undefined" || !window.CrazyGames?.SDK?.data?.setItem) {
    return;
  }

  try {
    await window.CrazyGames.SDK.data.setItem(key, value);
  } catch (error) {
    console.warn("[CrazyGamesSDK] Failed to set data for key:", key, error);
  }
}

/**
 * Generates a CrazyGames dynamic invite link via SDK.game.inviteLink.
 * Returns the invite link string, or null if unavailable / running outside CrazyGames.
 */
export async function getCrazyGamesInviteLink(params: Record<string, string>): Promise<string | null> {
  if (typeof window === "undefined" || !window.CrazyGames?.SDK?.game?.inviteLink) {
    return null;
  }

  try {
    const link = await window.CrazyGames.SDK.game.inviteLink(params);
    return typeof link === "string" && link ? link : null;
  } catch (error) {
    console.warn("[CrazyGamesSDK] Failed to generate invite link:", error);
    return null;
  }
}
