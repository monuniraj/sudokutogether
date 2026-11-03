/**
 * CrazyGames SDK v3 Isolated Wrapper Service
 * Provides safe initialization and user retrieval without mutating Firebase auth or UI state.
 */

let isInitialized = false;

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

