import { Capacitor, PluginListenerHandle } from "@capacitor/core";
import {
  AdMob,
  RewardAdPluginEvents,
} from "@capacitor-community/admob";

// Official Google Sample AdMob Test IDs
export const TEST_INTERSTITIAL_AD_ID = "ca-app-pub-3940256099942544/1033173712";
export const TEST_REWARDED_AD_ID = "ca-app-pub-3940256099942544/5224354917";

export const MAX_DAILY_ADS = 10;
export const MATCHES_PER_INTERSTITIAL = 3;

const STORAGE_KEY_DAILY_IMPRESSIONS = "admob_daily_impressions_v1";
const STORAGE_KEY_MATCHES_COUNTER = "admob_matches_counter_v1";

interface DailyImpressionsRecord {
  count: number;
  date: string; // YYYY-MM-DD
}

function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
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

/**
 * Initializes the AdMob SDK if running inside a native mobile environment (Android/iOS).
 * Bypasses cleanly on desktop/web/PWA environments.
 */
export async function initAdMob(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  if (isInitialized) return;

  try {
    await AdMob.initialize({
      initializeForTesting: true,
    });
    isInitialized = true;
    console.log("[AdMob] Native AdMob SDK initialized successfully.");
  } catch (err) {
    console.warn("[AdMob] Failed to initialize native AdMob SDK:", err);
  }
}

/**
 * Shows an interstitial ad between completed games, paced strictly at 1 ad every 3 matches,
 * provided the 10-daily impression cap has not been reached.
 */
export async function showInterstitialBetweenMatches(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    return false;
  }

  const matchCount = incrementMatchesCounter();
  if (matchCount < MATCHES_PER_INTERSTITIAL) {
    return false;
  }

  if (isDailyAdCapReached()) {
    console.log("[AdMob] Daily cap of 10 ads reached. Interstitial suppressed.");
    return false;
  }

  try {
    await initAdMob();
    await AdMob.prepareInterstitial({
      adId: TEST_INTERSTITIAL_AD_ID,
    });
    await AdMob.showInterstitial();
    incrementDailyImpressions();
    resetMatchesCounter();
    console.log("[AdMob] Interstitial presented successfully.");
    return true;
  } catch (err) {
    console.warn("[AdMob] Failed to display interstitial ad:", err);
    return false;
  }
}

/**
 * Shows a rewarded video ad for an in-game hint.
 * Resolves true ONLY when the user finishes watching the ad and earns the reward.
 */
export async function showRewardedHintAd(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    console.warn("[AdMob] Rewarded ads are only supported in native mobile app.");
    return false;
  }

  if (isDailyAdCapReached()) {
    console.log("[AdMob] Daily cap of 10 ads reached. Rewarded ad suppressed.");
    return false;
  }

  return new Promise<boolean>(async (resolve) => {
    let earnedReward = false;
    let rewardListener: PluginListenerHandle | null = null;
    let dismissListener: PluginListenerHandle | null = null;

    const cleanup = async () => {
      try {
        if (rewardListener) await rewardListener.remove();
        if (dismissListener) await dismissListener.remove();
      } catch {}
    };

    try {
      await initAdMob();

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
          await cleanup();
          if (earnedReward) {
            incrementDailyImpressions();
            resolve(true);
          } else {
            resolve(false);
          }
        }
      );

      await AdMob.prepareRewardVideoAd({
        adId: TEST_REWARDED_AD_ID,
      });

      const rewardItem = await AdMob.showRewardVideoAd();
      if (rewardItem && rewardItem.amount > 0) {
        earnedReward = true;
      }
    } catch (err) {
      console.warn("[AdMob] Failed to display rewarded video ad:", err);
      await cleanup();
      resolve(false);
    }
  });
}

