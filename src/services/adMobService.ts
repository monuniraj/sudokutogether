import { Capacitor, PluginListenerHandle } from "@capacitor/core";
import {
  AdMob,
  InterstitialAdPluginEvents,
  RewardAdPluginEvents,
} from "@capacitor-community/admob";

// Official Google Sample AdMob Test IDs
export const TEST_INTERSTITIAL_AD_ID = "ca-app-pub-3940256099942544/1033173712";
export const TEST_REWARDED_AD_ID = "ca-app-pub-3940256099942544/5224354917";

// Set to true only when switching from Google Test Ad IDs to live production Ad Unit IDs
export const IS_PRODUCTION = false;

export const MAX_DAILY_ADS = 10;
export const MATCHES_PER_INTERSTITIAL = 3;

export type RewardAdFailureReason =
  | "NOT_NATIVE"
  | "DAILY_CAP_REACHED"
  | "LOAD_FAILED"
  | "SHOW_FAILED"
  | "DISMISSED";

export interface RewardAdResult {
  success: boolean;
  reason?: RewardAdFailureReason;
}

const STORAGE_KEY_DAILY_IMPRESSIONS = "admob_daily_impressions_v1";
const STORAGE_KEY_MATCHES_COUNTER = "admob_matches_counter_v1";

interface DailyImpressionsRecord {
  count: number;
  date: string; // YYYY-MM-DD (local calendar date)
}

function getTodayDateString(): string {
  try {
    return new Date().toLocaleDateString("en-CA");
  } catch {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}

export function getDailyImpressionsRecord(): DailyImpressionsRecord {
  if (typeof window === "undefined" || !window.localStorage) {
    return { count: 0, date: getTodayDateString() };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DAILY_IMPRESSIONS);
    if (!raw) {
      return { count: 0, date: getTodayDateString() };
    }
    const parsed = JSON.parse(raw);
    const today = getTodayDateString();
    if (parsed.date !== today) {
      // New calendar day: reset count
      const freshRecord: DailyImpressionsRecord = { count: 0, date: today };
      localStorage.setItem(STORAGE_KEY_DAILY_IMPRESSIONS, JSON.stringify(freshRecord));
      return freshRecord;
    }
    return parsed;
  } catch {
    return { count: 0, date: getTodayDateString() };
  }
}

export function isDailyAdCapReached(): boolean {
  if (!IS_PRODUCTION) {
    return false;
  }
  const record = getDailyImpressionsRecord();
  return record.count >= MAX_DAILY_ADS;
}

export function incrementDailyImpressions(): number {
  if (typeof window === "undefined" || !window.localStorage) return 0;
  try {
    const record = getDailyImpressionsRecord();
    const updated: DailyImpressionsRecord = {
      count: record.count + 1,
      date: getTodayDateString()
    };
    localStorage.setItem(STORAGE_KEY_DAILY_IMPRESSIONS, JSON.stringify(updated));
    return updated.count;
  } catch {
    return 0;
  }
}

export function getMatchesSinceLastInterstitial(): number {
  if (typeof window === "undefined" || !window.localStorage) return 0;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MATCHES_COUNTER);
    return raw ? parseInt(raw, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

export function incrementMatchesCounter(): number {
  if (typeof window === "undefined" || !window.localStorage) return 0;
  try {
    const current = getMatchesSinceLastInterstitial();
    const next = current + 1;
    localStorage.setItem(STORAGE_KEY_MATCHES_COUNTER, String(next));
    return next;
  } catch {
    return 0;
  }
}

export function resetMatchesCounter(): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    localStorage.setItem(STORAGE_KEY_MATCHES_COUNTER, "0");
  } catch {}
}

let isInitialized = false;
let initPromise: Promise<void> | null = null;
let isInterstitialReady = false;
let isRewardedReady = false;
let rewardedPreloadPromise: Promise<boolean> | null = null;
let interstitialPreloadPromise: Promise<boolean> | null = null;
let lifecycleListenersRegistered = false;

const AD_PREPARE_TIMEOUT_MS = 4000;

async function registerLifecycleListeners(): Promise<void> {
  if (lifecycleListenersRegistered || !Capacitor.isNativePlatform()) {
    return;
  }
  lifecycleListenersRegistered = true;

  try {
    await AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
      isInterstitialReady = false;
      preloadInterstitialAd().catch(() => {});
    });
    await AdMob.addListener(InterstitialAdPluginEvents.FailedToShow, () => {
      isInterstitialReady = false;
      preloadInterstitialAd().catch(() => {});
    });
    await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
      isRewardedReady = false;
      preloadRewardedAd().catch(() => {});
    });
    await AdMob.addListener(RewardAdPluginEvents.FailedToShow, () => {
      isRewardedReady = false;
      preloadRewardedAd().catch(() => {});
    });
  } catch (err) {
    lifecycleListenersRegistered = false;
    console.warn("[AdMob] Failed to register lifecycle preload listeners:", err);
  }
}

async function loadRewardedAdInternal(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  if (isRewardedReady) return true;
  if (rewardedPreloadPromise) return rewardedPreloadPromise;

  rewardedPreloadPromise = (async () => {
    try {
      await initAdMob();
      await AdMob.prepareRewardVideoAd({
        adId: TEST_REWARDED_AD_ID,
      });
      isRewardedReady = true;
      console.log("[AdMob] Rewarded video ad preloaded and ready.");
      return true;
    } catch (err) {
      isRewardedReady = false;
      console.warn("[AdMob] Failed to preload rewarded ad:", err);
      return false;
    } finally {
      rewardedPreloadPromise = null;
    }
  })();

  return rewardedPreloadPromise;
}

async function loadInterstitialAdInternal(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  if (isInterstitialReady) return true;
  if (interstitialPreloadPromise) return interstitialPreloadPromise;

  interstitialPreloadPromise = (async () => {
    try {
      await initAdMob();
      await AdMob.prepareInterstitial({
        adId: TEST_INTERSTITIAL_AD_ID,
      });
      isInterstitialReady = true;
      console.log("[AdMob] Interstitial ad preloaded and ready.");
      return true;
    } catch (err) {
      isInterstitialReady = false;
      console.warn("[AdMob] Failed to preload interstitial ad:", err);
      return false;
    } finally {
      interstitialPreloadPromise = null;
    }
  })();

  return interstitialPreloadPromise;
}

export async function preloadRewardedAd(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  await loadRewardedAdInternal();
}

export async function preloadInterstitialAd(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  await loadInterstitialAdInternal();
}

/**
 * Initializes the AdMob SDK if running inside a native mobile environment (Android/iOS),
 * registers auto-reload listeners, and warms both ad formats on bootstrap.
 * Bypasses cleanly on desktop/web/PWA environments.
 */
export async function initAdMob(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  if (isInitialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      await AdMob.initialize({
        initializeForTesting: !IS_PRODUCTION,
      });
      isInitialized = true;
      console.log("[AdMob] Native AdMob SDK initialized successfully.");
      await registerLifecycleListeners();
      // Warm both ad slots immediately in background without blocking initialization
      void preloadRewardedAd();
      void preloadInterstitialAd();
    } catch (err) {
      console.warn("[AdMob] Failed to initialize native AdMob SDK:", err);
    } finally {
      initPromise = null;
    }
  })();

  return initPromise;
}

/**
 * Shows an interstitial ad between completed games, paced strictly at 1 ad every 3 matches,
 * provided the daily impression cap has not been reached.
 */
export async function showInterstitialBetweenMatches(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    return false;
  }

  const matchCount = incrementMatchesCounter();
  if (matchCount < MATCHES_PER_INTERSTITIAL) {
    if (!isInterstitialReady) {
      void preloadInterstitialAd();
    }
    return false;
  }

  if (isDailyAdCapReached()) {
    console.log("[AdMob] Daily cap of 10 ads reached. Interstitial suppressed.");
    return false;
  }

  try {
    await initAdMob();
    if (!isInterstitialReady) {
      let prepTimer: ReturnType<typeof setTimeout> | null = null;
      const loaded = await Promise.race<boolean>([
        loadInterstitialAdInternal(),
        new Promise<boolean>((resolve) => {
          prepTimer = setTimeout(() => resolve(false), AD_PREPARE_TIMEOUT_MS);
        }),
      ]);
      if (prepTimer) clearTimeout(prepTimer);
      if (!loaded || !isInterstitialReady) {
        console.warn("[AdMob] Interstitial not ready in time.");
        return false;
      }
    }

    isInterstitialReady = false;
    await AdMob.showInterstitial();
    incrementDailyImpressions();
    resetMatchesCounter();
    console.log("[AdMob] Interstitial presented successfully.");
    return true;
  } catch (err) {
    isInterstitialReady = false;
    console.warn("[AdMob] Failed to display interstitial ad:", err);
    void preloadInterstitialAd();
    return false;
  }
}

/**
 * Shows a rewarded video ad for an in-game hint.
 * Resolves { success: true } ONLY when RewardAdPluginEvents.Rewarded actually fired.
 * Differentiates LOAD_FAILED, SHOW_FAILED, DISMISSED, NOT_NATIVE, and DAILY_CAP_REACHED.
 */
export async function showRewardedHintAd(): Promise<RewardAdResult> {
  if (!Capacitor.isNativePlatform()) {
    console.warn("[AdMob] Rewarded ads are only supported in native mobile app.");
    return { success: false, reason: "NOT_NATIVE" };
  }

  if (isDailyAdCapReached()) {
    console.log("[AdMob] Daily cap of 10 ads reached. Rewarded ad suppressed.");
    return { success: false, reason: "DAILY_CAP_REACHED" };
  }

  try {
    await initAdMob();

    if (!isRewardedReady) {
      let prepTimer: ReturnType<typeof setTimeout> | null = null;
      const loaded = await Promise.race<boolean>([
        loadRewardedAdInternal(),
        new Promise<boolean>((resolve) => {
          prepTimer = setTimeout(() => resolve(false), AD_PREPARE_TIMEOUT_MS);
        }),
      ]);
      if (prepTimer) clearTimeout(prepTimer);
      if (!loaded || !isRewardedReady) {
        isRewardedReady = false;
        return { success: false, reason: "LOAD_FAILED" };
      }
    }
  } catch (err) {
    console.warn("[AdMob] Failed to prepare rewarded video ad:", err);
    isRewardedReady = false;
    return { success: false, reason: "LOAD_FAILED" };
  }

  return new Promise<RewardAdResult>(async (resolve) => {
    let earnedReward = false;
    let settled = false;
    let rewardListener: PluginListenerHandle | null = null;
    let dismissListener: PluginListenerHandle | null = null;
    let failedToShowListener: PluginListenerHandle | null = null;

    const cleanup = async () => {
      try {
        if (rewardListener) await rewardListener.remove();
        if (dismissListener) await dismissListener.remove();
        if (failedToShowListener) await failedToShowListener.remove();
      } catch {}
    };

    const settle = async (result: RewardAdResult) => {
      if (settled) return;
      settled = true;
      await cleanup();
      resolve(result);
    };

    try {
      rewardListener = await AdMob.addListener(
        RewardAdPluginEvents.Rewarded,
        () => {
          earnedReward = true;
          console.log("[AdMob] User earned rewarded video incentive.");
        }
      );

      dismissListener = await AdMob.addListener(
        RewardAdPluginEvents.Dismissed,
        async () => {
          isRewardedReady = false;
          void preloadRewardedAd();
          if (earnedReward) {
            incrementDailyImpressions();
            await settle({ success: true });
          } else {
            await settle({ success: false, reason: "DISMISSED" });
          }
        }
      );

      failedToShowListener = await AdMob.addListener(
        RewardAdPluginEvents.FailedToShow,
        async (err) => {
          console.warn("[AdMob] Rewarded video failed to show:", err);
          isRewardedReady = false;
          void preloadRewardedAd();
          await settle({ success: false, reason: "SHOW_FAILED" });
        }
      );

      isRewardedReady = false;
      await AdMob.showRewardVideoAd();
    } catch (err) {
      console.warn("[AdMob] Failed to display rewarded video ad:", err);
      isRewardedReady = false;
      void preloadRewardedAd();
      await settle({ success: false, reason: "LOAD_FAILED" });
    }
  });
}

