import { Capacitor, PluginListenerHandle, registerPlugin } from "@capacitor/core";
import {
  AdMob,
  AdmobConsentInfo,
  AdmobConsentStatus,
  AdMobRewardItem,
  InterstitialAdPluginEvents,
  RewardAdPluginEvents,
} from "@capacitor-community/admob";

// Official Google Sample AdMob Test IDs
export const TEST_INTERSTITIAL_AD_ID = "ca-app-pub-3940256099942544/1033173712";
export const TEST_REWARDED_AD_ID = "ca-app-pub-3940256099942544/5224354917";

// Verified Production AdMob Unit IDs
export const PROD_INTERSTITIAL_AD_ID = "ca-app-pub-2107539674074275/7699541862";
export const PROD_REWARDED_AD_ID = "ca-app-pub-2107539674074275/2002547967";

// Expected Rewarded Ad item configuration (AdMob console: amount=1, item=hint)
export const EXPECTED_REWARD_ITEM = "hint";
export const EXPECTED_REWARD_AMOUNT = 1;

interface AppBuildInfoPlugin {
  getBuildInfo(): Promise<{ isDebuggable: boolean }>;
}

const AppBuildInfo = registerPlugin<AppBuildInfoPlugin>("AppBuildInfo");

const viteEnv = (import.meta as any).env || {};
const IS_VITE_PROD_MODE =
  Boolean(viteEnv.PROD) &&
  String(viteEnv.VITE_ADMOB_TEST_MODE ?? "").toLowerCase() !== "true";

// Static Vite release flag; refined on Android at runtime via ApplicationInfo.FLAG_DEBUGGABLE
export const IS_PRODUCTION = IS_VITE_PROD_MODE;

let isRuntimeProduction: boolean = IS_VITE_PROD_MODE;
let buildEnvResolved = false;
let buildEnvPromise: Promise<boolean> | null = null;

async function resolveAdProductionMode(): Promise<boolean> {
  if (buildEnvResolved) return isRuntimeProduction;
  if (buildEnvPromise) return buildEnvPromise;

  buildEnvPromise = (async () => {
    try {
      if (!IS_VITE_PROD_MODE) {
        isRuntimeProduction = false;
        return false;
      }

      if (!Capacitor.isNativePlatform()) {
        isRuntimeProduction = true;
        return true;
      }

      if (Capacitor.getPlatform() !== "android") {
        isRuntimeProduction = IS_VITE_PROD_MODE;
        return isRuntimeProduction;
      }

      const buildInfo = await AppBuildInfo.getBuildInfo();
      const isDebuggable = Boolean(buildInfo?.isDebuggable);
      isRuntimeProduction = IS_VITE_PROD_MODE && !isDebuggable;
      return isRuntimeProduction;
    } catch (err) {
      // Fail safe to test mode on Android if native debuggability cannot be verified
      console.warn("[AdMob] Failed to read AppBuildInfo; retaining test mode for safety:", err);
      isRuntimeProduction = false;
      return false;
    } finally {
      buildEnvResolved = true;
      buildEnvPromise = null;
    }
  })();

  return buildEnvPromise;
}

export function isAdMobProductionMode(): boolean {
  return isRuntimeProduction;
}

export function getInterstitialAdUnitId(): string {
  return isRuntimeProduction ? PROD_INTERSTITIAL_AD_ID : TEST_INTERSTITIAL_AD_ID;
}

export function getRewardedAdUnitId(): string {
  return isRuntimeProduction ? PROD_REWARDED_AD_ID : TEST_REWARDED_AD_ID;
}

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
  reward?: AdMobRewardItem;
  rewardAmount?: number;
  rewardItem?: string;
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
  if (!isRuntimeProduction) {
    return false;
  }
  const record = getDailyImpressionsRecord();
  return record.count >= MAX_DAILY_ADS;
}

function normalizeHintReward(
  payload: AdMobRewardItem | undefined,
  isProd: boolean
): AdMobRewardItem {
  if (!payload) {
    return { type: EXPECTED_REWARD_ITEM, amount: EXPECTED_REWARD_AMOUNT };
  }

  const rawType = typeof payload.type === "string" ? payload.type.trim() : "";
  const rawAmount =
    typeof payload.amount === "number" && Number.isFinite(payload.amount)
      ? Math.floor(payload.amount)
      : 0;
  const normalizedType = rawType.toLowerCase();

  if (isProd && (normalizedType !== EXPECTED_REWARD_ITEM || rawAmount !== EXPECTED_REWARD_AMOUNT)) {
    console.warn(
      `[AdMob] Unexpected production reward payload (${rawType}:${rawAmount}); aligning to ${EXPECTED_REWARD_ITEM}:${EXPECTED_REWARD_AMOUNT}.`
    );
  }

  // Always enforce the configured reward of 1 hint (even when Google sample test ads return coins/10)
  return {
    type: normalizedType === EXPECTED_REWARD_ITEM ? normalizedType : EXPECTED_REWARD_ITEM,
    amount:
      normalizedType === EXPECTED_REWARD_ITEM && rawAmount > 0
        ? Math.min(rawAmount, EXPECTED_REWARD_AMOUNT)
        : EXPECTED_REWARD_AMOUNT,
  };
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
let isConsentResolved = false;
let consentPromise: Promise<AdmobConsentInfo | null> | null = null;
let lastConsentInfo: AdmobConsentInfo | null = null;
let isInterstitialReady = false;
let isRewardedReady = false;
let rewardedPreloadPromise: Promise<boolean> | null = null;
let interstitialPreloadPromise: Promise<boolean> | null = null;
let lifecycleListenersRegistered = false;

const AD_PREPARE_TIMEOUT_MS = 4000;
const UMP_REQUEST_DELAY_MS = 50;
const UMP_STATUS_CHECK_TIMELINE_MS = 200;
const UMP_POST_RESOLVE_SETTLE_MS = 10;
const UMP_NETWORK_TIMEOUT_MS = 4500;

function sleepMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));
}

/**
 * Google UMP (User Messaging Platform) GDPR/CMP Consent Pipeline:
 * - T=0ms: App UI renders immediately without blocking.
 * - T=50ms: Calls `AdMob.requestConsentInfo()` (respecting device native/WebView locale for automatic 9-language translation).
 * - T=200ms: Evaluates consent status; if `AdmobConsentStatus.REQUIRED`, loads & shows the consent form (`AdMob.showConsentForm()`).
 * - T+10ms (after resolution): Resolves so `AdMob.initialize()` can safely proceed.
 * - Silent error fallback: Any network/SDK failure is caught silently so the app never freezes and initializes with default limited tracking.
 */
export async function resolveUmpConsent(): Promise<AdmobConsentInfo | null> {
  if (!Capacitor.isNativePlatform()) {
    isConsentResolved = true;
    return null;
  }

  if (isConsentResolved) {
    return lastConsentInfo;
  }

  if (consentPromise) {
    return consentPromise;
  }

  consentPromise = (async () => {
    const bootTimelineStart = Date.now();
    try {
      // T=50ms: Defer UMP network handshake so T=0ms first paint is 100% unblocked
      await sleepMs(UMP_REQUEST_DELAY_MS);

      let timeoutHandle: ReturnType<typeof setTimeout> | null = null;
      const consentInfo = await Promise.race<AdmobConsentInfo | null>([
        AdMob.requestConsentInfo({
          tagForUnderAgeOfConsent: false,
        }),
        new Promise<null>((resolve) => {
          timeoutHandle = setTimeout(() => resolve(null), UMP_NETWORK_TIMEOUT_MS);
        }),
      ]);
      if (timeoutHandle) clearTimeout(timeoutHandle);

      if (consentInfo) {
        lastConsentInfo = consentInfo;
      }

      // T=200ms: Align status inspection to the T=200ms boot milestone
      const elapsedSinceStart = Date.now() - bootTimelineStart;
      const remainingTo200ms = UMP_STATUS_CHECK_TIMELINE_MS - elapsedSinceStart;
      if (remainingTo200ms > 0) {
        await sleepMs(remainingTo200ms);
      }

      if (
        consentInfo &&
        consentInfo.status === AdmobConsentStatus.REQUIRED &&
        consentInfo.isConsentFormAvailable !== false
      ) {
        const updatedConsentInfo = await AdMob.showConsentForm();
        if (updatedConsentInfo) {
          lastConsentInfo = updatedConsentInfo;
        }
      }
    } catch {
      // Silent fallback (Luxury UX): if UMP fails due to offline/network issues,
      // proceed gracefully without freezing or showing disruptive errors.
    } finally {
      // T+10ms: Settle 10ms after consent resolution before AdMob.initialize()
      await sleepMs(UMP_POST_RESOLVE_SETTLE_MS);
      isConsentResolved = true;
      consentPromise = null;
    }

    return lastConsentInfo;
  })();

  return consentPromise;
}

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
      const isProd = await resolveAdProductionMode();
      await AdMob.prepareRewardVideoAd({
        adId: getRewardedAdUnitId(),
        isTesting: !isProd,
      });
      isRewardedReady = true;
      console.log(
        `[AdMob] Rewarded video ad preloaded (${isProd ? "PRODUCTION" : "TEST"} mode).`
      );
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
      const isProd = await resolveAdProductionMode();
      await AdMob.prepareInterstitial({
        adId: getInterstitialAdUnitId(),
        isTesting: !isProd,
      });
      isInterstitialReady = true;
      console.log(
        `[AdMob] Interstitial ad preloaded (${isProd ? "PRODUCTION" : "TEST"} mode).`
      );
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
 * strictly after Google UMP GDPR/CMP consent resolution (Zero-Ad-Leakage gate:
 * T=50ms requestConsentInfo -> T=200ms REQUIRED check & showConsentForm -> T+10ms settle),
 * resolves debug vs. release mode natively (ApplicationInfo.FLAG_DEBUGGABLE + Vite env),
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
      // Zero-Ad-Leakage Gate: Never initialize AdMob or preload ads before UMP consent resolves
      await resolveUmpConsent();

      const isProd = await resolveAdProductionMode();
      await AdMob.initialize({
        initializeForTesting: !isProd,
      });
      isInitialized = true;
      console.log(
        `[AdMob] Native AdMob SDK initialized (${isProd ? "PRODUCTION" : "TEST"} mode).`
      );
      await registerLifecycleListeners();
      // Warm both ad slots immediately in background without blocking initialization
      void preloadRewardedAd();
      void preloadInterstitialAd();
    } catch {
      // Silent error handling: never disrupt gameplay if AdMob SDK initialization fails
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

  await resolveAdProductionMode();

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
 * Resolves { success: true, reward, rewardAmount: 1, rewardItem: "hint" }
 * ONLY when RewardAdPluginEvents.Rewarded actually fired.
 * Differentiates LOAD_FAILED, SHOW_FAILED, DISMISSED, NOT_NATIVE, and DAILY_CAP_REACHED.
 */
export async function showRewardedHintAd(): Promise<RewardAdResult> {
  if (!Capacitor.isNativePlatform()) {
    console.warn("[AdMob] Rewarded ads are only supported in native mobile app.");
    return { success: false, reason: "NOT_NATIVE" };
  }

  const isProd = await resolveAdProductionMode();

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
    let earnedRewardPayload: AdMobRewardItem | undefined;
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
        (reward: AdMobRewardItem) => {
          earnedReward = true;
          earnedRewardPayload = reward;
          console.log("[AdMob] User earned rewarded video incentive:", reward);
        }
      );

      dismissListener = await AdMob.addListener(
        RewardAdPluginEvents.Dismissed,
        async () => {
          isRewardedReady = false;
          void preloadRewardedAd();
          if (earnedReward) {
            const normalizedReward = normalizeHintReward(earnedRewardPayload, isProd);
            incrementDailyImpressions();
            await settle({
              success: true,
              reward: normalizedReward,
              rewardAmount: normalizedReward.amount,
              rewardItem: normalizedReward.type,
            });
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

