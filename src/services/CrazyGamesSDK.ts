import { Capacitor } from "@capacitor/core";

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
let initPromise: Promise<void> | null = null;

/**
 * Robust Multi-Tier check whether the app is actively running in the CrazyGames platform.
 * Gracefully rejects native Capacitor builds and standalone web domains (sudokusync.com).
 * Accurately detects CrazyGames across top-level domain, sandboxed preview iframes,
 * ancestor origins, referrers, and portal test query parameters.
 */
export function isCrazyGamesActive(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  // 1. Immediately return false on native mobile apps (Capacitor Play Store / Android)
  try {
    if (Capacitor.isNativePlatform()) {
      return false;
    }
  } catch {
    // Ignore Capacitor check failure
  }

  // 2. Immediately return false on official standalone web / Firebase domains
  try {
    const host = window.location.hostname.toLowerCase();
    if (
      host.includes("sudokusync.com") ||
      host.includes("web.app") ||
      host.includes("firebaseapp.com")
    ) {
      return false;
    }

    // 3. Check for CrazyGames URL query parameters (e.g. ?useLocalSdk=true or ?crazygames=true)
    const search = window.location.search.toLowerCase();
    if (search.includes("uselocalsdk") || search.includes("crazygames")) {
      return true;
    }

    // 4. Check ancestor origins (available in Chromium for sandboxed/cross-origin iframes)
    try {
      const ancestors = (window.location as any).ancestorOrigins;
      if (ancestors && ancestors.length > 0) {
        for (let i = 0; i < ancestors.length; i++) {
          if (String(ancestors[i]).toLowerCase().includes("crazygames")) {
            return true;
          }
        }
      }
    } catch {
      // Ignore ancestor security errors
    }

    // 5. Check host, referrer, iframe hierarchy, or SDK environment
    const isCgHost = host.includes("crazygames");
    const isCgReferrer = typeof document !== "undefined" && document.referrer.toLowerCase().includes("crazygames");
    const isEmbeddedInIframe = window.parent !== window;
    const cgEnv = window.CrazyGames?.SDK?.environment;

    return Boolean(
      isCgHost ||
      isCgReferrer ||
      cgEnv === "crazygames" ||
      (isEmbeddedInIframe && !host.includes("sudokusync.com"))
    );
  } catch {
    return false;
  }
}

/**
 * Initializes the CrazyGames SDK v3 with resilient 100ms polling.
 * Gracefully no-ops if running outside CrazyGames (standalone web, Capacitor APK, Itch.io).
 */
export async function initCrazyGames(): Promise<void> {
  if (typeof window === "undefined" || !isCrazyGamesActive()) {
    return;
  }

  if (isInitialized) {
    return;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    // Resilient polling for window.CrazyGames?.SDK (100ms interval, timeout 3500ms)
    const startTime = Date.now();
    const timeoutMs = 3500;

    while (!window.CrazyGames?.SDK && (Date.now() - startTime) < timeoutMs) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    if (!window.CrazyGames?.SDK) {
      console.warn("[CrazyGamesSDK] Timed out waiting for window.CrazyGames.SDK script to load; continuing normal gameplay.");
      return;
    }

    try {
      await window.CrazyGames.SDK.init();
      isInitialized = true;
      console.log("[CrazyGamesSDK] Initialized successfully. Environment:", window.CrazyGames.SDK.environment || "crazygames");
    } catch (error) {
      console.warn("[CrazyGamesSDK] Initialization failed or ignored:", error);
    }
  })();

  return initPromise;
}

/**
 * Safely notifies CrazyGames that active gameplay has started or resumed.
 * Must be called when the player is actively interacting with a puzzle.
 */
export function crazyGamesGameplayStart(): void {
  if (typeof window === "undefined" || !isCrazyGamesActive()) {
    return;
  }
  try {
    if (window.CrazyGames?.SDK?.game?.gameplayStart) {
      window.CrazyGames.SDK.game.gameplayStart();
      console.log("[CrazyGamesSDK] gameplayStart signaled.");
    }
  } catch (error) {
    console.warn("[CrazyGamesSDK] Failed to signal gameplayStart:", error);
  }
}

/**
 * Safely notifies CrazyGames that active gameplay has stopped (paused, menu, game over).
 */
export function crazyGamesGameplayStop(): void {
  if (typeof window === "undefined" || !isCrazyGamesActive()) {
    return;
  }
  try {
    if (window.CrazyGames?.SDK?.game?.gameplayStop) {
      window.CrazyGames.SDK.game.gameplayStop();
      console.log("[CrazyGamesSDK] gameplayStop signaled.");
    }
  } catch (error) {
    console.warn("[CrazyGamesSDK] Failed to signal gameplayStop:", error);
  }
}

/**
 * Safely fetches the CrazyGames authenticated user profile.
 * Returns the user object if authenticated, or null if unauthenticated / running outside CrazyGames.
 */
export async function getCrazyGamesUser(): Promise<any | null> {
  if (typeof window === "undefined" || !isCrazyGamesActive() || !window.CrazyGames?.SDK?.user) {
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
  if (typeof window === "undefined" || !isCrazyGamesActive() || !window.CrazyGames?.SDK?.data?.getItem) {
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
  if (typeof window === "undefined" || !isCrazyGamesActive() || !window.CrazyGames?.SDK?.data?.setItem) {
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
 * Protected by strict isCrazyGamesActive guard and a 600ms fail-safe timeout to prevent hanging UI threads.
 */
export async function getCrazyGamesInviteLink(params: Record<string, string>): Promise<string | null> {
  if (typeof window === "undefined" || !isCrazyGamesActive() || !window.CrazyGames?.SDK?.game?.inviteLink) {
    return null;
  }

  try {
    const linkPromise = Promise.resolve(window.CrazyGames.SDK.game.inviteLink(params));
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 600));
    const result = await Promise.race([linkPromise, timeoutPromise]);
    return typeof result === "string" && result ? result : null;
  } catch (error) {
    console.warn("[CrazyGamesSDK] Failed to generate invite link:", error);
    return null;
  }
}
