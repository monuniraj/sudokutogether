import { useState, useEffect, useCallback, useRef } from "react";
import { doc, setDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { getTimestampMillis, PRESENCE_TIMEOUT_MS } from "../utils/formatTimestamp";
import { getActiveAuthUid, loadVault, isHydrationWriteLocked } from "../utils/storageEngine";

const INCOGNITO_STORAGE_KEY = "sudoku_is_incognito";
const INCOGNITO_EVENT = "sudoku_incognito_change";
const HEARTBEAT_INTERVAL_MS = 10 * 60 * 1000; // 10-minute heartbeat throttle for active sessions

export { PRESENCE_TIMEOUT_MS };

export interface FriendPresenceState {
  isIncognito: boolean;
  setIsIncognito: (val: boolean | ((prev: boolean) => boolean)) => void;
  toggleIncognito: () => void;
  friendPresenceMap: Record<string, "online" | "offline">;
  friendLastActiveMap: Record<string, any>;
  getFriendStatus: (
    friendId: string,
    fallbackStatus?: "online" | "offline",
    fallbackLastActive?: any
  ) => "online" | "offline";
  getFriendLastActive: (friendId: string, fallbackLastActive?: any) => any;
}

/**
 * Helper to safely extract current user ID from auth or canonical storage if not passed.
 */
function getStoredUserId(): string | null {
  try {
    const authUser = auth.currentUser;
    if (authUser && !authUser.isAnonymous && authUser.uid) {
      return authUser.uid;
    }
    const activeUid = getActiveAuthUid();
    const vault = loadVault(activeUid || "guest");
    if (vault?.profile?.id) return String(vault.profile.id);
  } catch {}
  return null;
}

/**
 * Resolves user/guest scoped storage key to enforce zero-third-space isolation
 */
function getScopedIncognitoKey(uid?: string | null): string {
  let effectiveUid = uid;
  if (!effectiveUid) {
    try {
      const authUser = auth.currentUser;
      if (authUser && !authUser.isAnonymous) {
        effectiveUid = authUser.uid;
      }
    } catch {}
    if (!effectiveUid) {
      effectiveUid = getStoredUserId();
    }
  }
  const isGuest = !effectiveUid || effectiveUid === "guest" || effectiveUid === "GUEST" || effectiveUid.startsWith("GUEST_");
  return isGuest ? "sudoku_guest_is_incognito" : `sudoku_user_${effectiveUid}_is_incognito`;
}

/**
 * Robust presence hook with incognito mode (ghost mode) and fail-safe disconnects.
 * 
 * Features:
 * - Dynamic broadcast lifecycle (online on active, offline on incognito/hidden/unload)
 * - 10-minute throttled heartbeat while visible and active
 * - Immediate presence ping when app/tab becomes visible
 * - 15-minute sliding presence cutoff (offline if lastActive > 15m or missing)
 * - Multi-tab storage sync via `storage` event & custom in-tab broadcast
 * - Real-time friend status subscriptions via Firestore onSnapshot
 * - 0 impact on incoming invite receipt (invites flow through independent Firestore paths)
 */
export function useFriendPresence(
  explicitUserId?: string,
  trackedFriendIds: string[] = []
): FriendPresenceState {
  const [resolvedUserId, setResolvedUserId] = useState<string | null>(() => explicitUserId || getStoredUserId());

  useEffect(() => {
    if (explicitUserId) {
      setResolvedUserId(explicitUserId);
    } else {
      setResolvedUserId(getStoredUserId());
    }
  }, [explicitUserId]);

  useEffect(() => {
    if (!explicitUserId) {
      const unsub = onAuthStateChanged(auth, (user) => {
        if (user && !user.isAnonymous && user.uid) {
          setResolvedUserId(user.uid);
        } else {
          setResolvedUserId(getStoredUserId());
        }
      });
      return () => unsub();
    }
  }, [explicitUserId]);

  const userId = explicitUserId || resolvedUserId || getStoredUserId();

  const [isIncognito, setIsIncognitoState] = useState<boolean>(() => {
    try {
      const scopedKey = getScopedIncognitoKey(explicitUserId || getStoredUserId());
      const saved = localStorage.getItem(scopedKey) ?? localStorage.getItem(INCOGNITO_STORAGE_KEY);
      return saved === "true";
    } catch {
      return false;
    }
  });

  const [friendPresenceMap, setFriendPresenceMap] = useState<Record<string, "online" | "offline">>({});
  const [friendLastActiveMap, setFriendLastActiveMap] = useState<Record<string, any>>({});

  const prevUserIdRef = useRef<string | null>(userId || null);
  const isIncognitoRef = useRef(isIncognito);
  isIncognitoRef.current = isIncognito;

  // Re-sync incognito state when persona (userId) transitions
  useEffect(() => {
    try {
      const scopedKey = getScopedIncognitoKey(userId);
      const val = localStorage.getItem(scopedKey) === "true";
      setIsIncognitoState(val);
    } catch {}
  }, [userId]);

  // Cleanup tracking: When userId transitions (e.g., from GUEST_XXXX to Google UID),
  // immediately broadcast status: "offline" to users/{prevUserId}
  useEffect(() => {
    const prevId = prevUserIdRef.current;
    if (prevId && prevId !== userId) {
      if (prevId !== "GUEST" && prevId !== "guest" && prevId !== "GUEST_ANON" && !isHydrationWriteLocked(prevId)) {
        console.log(`[useFriendPresence] User ID transitioned from ${prevId} to ${userId || "none"}. Broadcasting offline for ${prevId}.`);
        const prevRef = doc(db, "presence", prevId);
        setDoc(
          prevRef,
          {
            status: "offline",
            isMigrated: true,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        ).catch((err) => {
          console.warn("[useFriendPresence] Failed to broadcast offline for previous user ID:", err);
        });
      }
    }
    prevUserIdRef.current = userId || null;
  }, [userId]);

  // Broadcast presence to Firestore (/presence/{currentId})
  const broadcastStatus = useCallback(async (status: "online" | "offline") => {
    const activeAuthUser = auth.currentUser;
    const currentId = activeAuthUser?.uid || userId || getStoredUserId();
    if (!currentId || currentId === "GUEST" || currentId === "guest" || currentId === "GUEST_ANON" || currentId.startsWith("GUEST_") || isHydrationWriteLocked(currentId)) return;
    if (!activeAuthUser || activeAuthUser.uid !== currentId) return;

    try {
      const presenceRef = doc(db, "presence", currentId);
      await setDoc(
        presenceRef,
        {
          id: currentId,
          status,
          lastActive: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn("[useFriendPresence] Failed to broadcast presence status:", err);
    }
  }, [userId]);

  // Setter that updates state, localStorage, and notifies other components
  const setIsIncognito = useCallback((val: boolean | ((prev: boolean) => boolean)) => {
    setIsIncognitoState((prev) => {
      const nextVal = typeof val === "function" ? val(prev) : val;
      try {
        const scopedKey = getScopedIncognitoKey(userId || getStoredUserId());
        localStorage.setItem(scopedKey, String(nextVal));
      } catch {}
      queueMicrotask(() => {
        window.dispatchEvent(new CustomEvent(INCOGNITO_EVENT, { detail: nextVal }));
      });
      return nextVal;
    });
  }, [userId]);

  const toggleIncognito = useCallback(() => {
    setIsIncognito((prev) => !prev);
  }, [setIsIncognito]);

  // Sync across tabs & within same tab via storage & custom events
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      const currentScopedKey = getScopedIncognitoKey(userId || getStoredUserId());
      if ((e.key === currentScopedKey || e.key === INCOGNITO_STORAGE_KEY) && e.newValue !== null) {
        setIsIncognitoState(e.newValue === "true");
      }
    };

    const handleCustomChange = (e: Event) => {
      const custom = e as CustomEvent<boolean>;
      if (typeof custom.detail === "boolean") {
        setIsIncognitoState((prev) => (prev === custom.detail ? prev : custom.detail));
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(INCOGNITO_EVENT, handleCustomChange);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(INCOGNITO_EVENT, handleCustomChange);
    };
  }, [userId]);

  // Presence lifecycle: broadcast changes when isIncognito or userId changes
  useEffect(() => {
    if (!userId) return;

    if (isIncognito) {
      // Immediately broadcast offline when in incognito mode
      broadcastStatus("offline");
    } else {
      // If visible, broadcast online immediately
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        broadcastStatus("online");
      }
    }
  }, [isIncognito, userId, broadcastStatus]);

  // Lifecycle listeners: visibilitychange, beforeunload, pagehide, and periodic heartbeat
  useEffect(() => {
    if (!userId) return;

    let heartbeatTimer: any = null;

    const startHeartbeat = () => {
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      heartbeatTimer = setInterval(() => {
        if (
          !isIncognitoRef.current &&
          typeof document !== "undefined" &&
          document.visibilityState === "visible"
        ) {
          broadcastStatus("online");
        }
      }, HEARTBEAT_INTERVAL_MS);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        broadcastStatus("offline");
        if (heartbeatTimer) clearInterval(heartbeatTimer);
      } else if (document.visibilityState === "visible") {
        // Immediate ping when tab/app becomes visible
        if (!isIncognitoRef.current) {
          broadcastStatus("online");
        }
        // Throttle subsequent continuous pings to every 10 minutes
        startHeartbeat();
      }
    };

    const handleUnload = () => {
      broadcastStatus("offline");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("pagehide", handleUnload);

    // Initial heartbeat start if visible
    if (typeof document !== "undefined" && document.visibilityState === "visible") {
      startHeartbeat();
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("pagehide", handleUnload);
      if (heartbeatTimer) clearInterval(heartbeatTimer);
    };
  }, [userId, broadcastStatus]);

  // Real-time friend status tracking via Firestore onSnapshot
  useEffect(() => {
    if (!trackedFriendIds || trackedFriendIds.length === 0) return;

    const currentId = userId || getStoredUserId();

    // Filter unique valid friend IDs, excluding self and dummy IDs
    const uniqueIds = Array.from(
      new Set(
        trackedFriendIds.filter(
          (id) =>
            Boolean(id) &&
            id !== currentId &&
            id !== "GUEST_ANON" &&
            id !== "me"
        )
      )
    );
    const unsubs: Array<() => void> = [];

    uniqueIds.forEach((friendId) => {
      try {
        const friendRef = doc(db, "presence", friendId);
        const unsub = onSnapshot(
          friendRef,
          (snap) => {
            if (snap.exists()) {
              const data = snap.data();
              const rawStatus = data?.status === "online" ? "online" : "offline";
              const lastActive = data?.lastActive || data?.updatedAt || null;
              const lastActiveMs = getTimestampMillis(lastActive);

              // 15-minute sliding cutoff: only online if rawStatus is online AND lastActive is within 15 minutes
              const isRecent =
                lastActiveMs !== null && Date.now() - lastActiveMs <= PRESENCE_TIMEOUT_MS;
              const effectiveStatus: "online" | "offline" =
                rawStatus === "online" && isRecent ? "online" : "offline";

              setFriendPresenceMap((prev) => {
                if (prev[friendId] === effectiveStatus) return prev;
                return { ...prev, [friendId]: effectiveStatus };
              });

              if (lastActive) {
                setFriendLastActiveMap((prev) => ({ ...prev, [friendId]: lastActive }));
              }
            }
          },
          (err) => {
            // Document might not exist for guest bots or offline users, fallback smoothly
            console.debug(`[useFriendPresence] Presence listener error for ${friendId}:`, err);
          }
        );
        unsubs.push(unsub);
      } catch {}
    });

    return () => {
      unsubs.forEach((u) => {
        try {
          u();
        } catch {}
      });
    };
  }, [trackedFriendIds.join(",")]);

  // Periodic in-memory check to invalidate stale online statuses without extra network queries
  useEffect(() => {
    const timer = setInterval(() => {
      setFriendPresenceMap((prev) => {
        let changed = false;
        const next = { ...prev };
        const now = Date.now();
        for (const [fId, status] of Object.entries(next)) {
          if (status === "online") {
            const lastActive = friendLastActiveMap[fId];
            const ms = getTimestampMillis(lastActive);
            if (!ms || now - ms > PRESENCE_TIMEOUT_MS) {
              next[fId] = "offline";
              changed = true;
            }
          }
        }
        return changed ? next : prev;
      });
    }, 30000); // Check locally every 30s

    return () => clearInterval(timer);
  }, [friendLastActiveMap]);

  // Helper to resolve a friend's status, accounting for incognito, cutoff, and presence map
  const getFriendStatus = useCallback(
    (
      friendId: string,
      fallbackStatus?: "online" | "offline",
      fallbackLastActive?: any
    ): "online" | "offline" => {
      const currentId = userId || getStoredUserId();

      if (!friendId || friendId === "GUEST_ANON" || friendId === "me") {
        return "offline";
      }

      if (friendId === currentId) {
        return isIncognito ? "offline" : "online";
      }

      // Check raw status from real-time presence map or fallback
      const rawStatus = friendPresenceMap[friendId] || fallbackStatus;
      if (rawStatus !== "online") {
        return "offline";
      }

      // If marked online, enforce 15-minute sliding presence cutoff
      const targetLastActive = friendLastActiveMap[friendId] ?? fallbackLastActive;
      const lastActiveMs = getTimestampMillis(targetLastActive);

      if (lastActiveMs !== null && Date.now() - lastActiveMs <= PRESENCE_TIMEOUT_MS) {
        return "online";
      }

      // If lastActiveMs is missing or older than 15 minutes, evaluate status as "offline"
      return "offline";
    },
    [userId, isIncognito, friendPresenceMap, friendLastActiveMap]
  );

  // Helper to resolve a friend's lastActive timestamp
  const getFriendLastActive = useCallback(
    (friendId: string, fallbackLastActive?: any): any => {
      if (friendLastActiveMap[friendId]) {
        return friendLastActiveMap[friendId];
      }
      return fallbackLastActive;
    },
    [friendLastActiveMap]
  );

  return {
    isIncognito,
    setIsIncognito,
    toggleIncognito,
    friendPresenceMap,
    friendLastActiveMap,
    getFriendStatus,
    getFriendLastActive,
  };
}
