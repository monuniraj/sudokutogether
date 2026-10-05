import { useState, useEffect, useCallback, useRef } from "react";
import { doc, setDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

const INCOGNITO_STORAGE_KEY = "sudoku_is_incognito";
const INCOGNITO_EVENT = "sudoku_incognito_change";
const HEARTBEAT_INTERVAL_MS = 30000; // 30s heartbeat for active sessions

export interface FriendPresenceState {
  isIncognito: boolean;
  setIsIncognito: (val: boolean | ((prev: boolean) => boolean)) => void;
  toggleIncognito: () => void;
  friendPresenceMap: Record<string, "online" | "offline">;
  getFriendStatus: (friendId: string, fallbackStatus?: "online" | "offline") => "online" | "offline";
}

/**
 * Helper to safely extract current user ID from localStorage if not passed.
 */
function getStoredUserId(): string | null {
  try {
    const saved = localStorage.getItem("sudoku_userProfile");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.id) return String(parsed.id);
    }
  } catch {}
  return null;
}

/**
 * Robust presence hook with incognito mode (ghost mode) and fail-safe disconnects.
 * 
 * Features:
 * - Dynamic broadcast lifecycle (online on active, offline on incognito/hidden/unload)
 * - Multi-tab storage sync via `storage` event & custom in-tab broadcast
 * - Real-time friend status subscriptions via Firestore onSnapshot
 * - 0 impact on incoming invite receipt (invites flow through independent Firestore paths)
 */
export function useFriendPresence(
  explicitUserId?: string,
  trackedFriendIds: string[] = []
): FriendPresenceState {
  const [isIncognito, setIsIncognitoState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(INCOGNITO_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const [friendPresenceMap, setFriendPresenceMap] = useState<Record<string, "online" | "offline">>({});

  const userId = explicitUserId || getStoredUserId();
  const isIncognitoRef = useRef(isIncognito);
  isIncognitoRef.current = isIncognito;

  // Broadcast presence to Firestore
  const broadcastStatus = useCallback(async (status: "online" | "offline") => {
    const currentId = userId || getStoredUserId();
    if (!currentId) return;

    try {
      const userRef = doc(db, "users", currentId);
      await setDoc(
        userRef,
        {
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
        localStorage.setItem(INCOGNITO_STORAGE_KEY, String(nextVal));
      } catch {}
      window.dispatchEvent(new CustomEvent(INCOGNITO_EVENT, { detail: nextVal }));
      return nextVal;
    });
  }, []);

  const toggleIncognito = useCallback(() => {
    setIsIncognito((prev) => !prev);
  }, [setIsIncognito]);

  // Sync across tabs & within same tab via storage & custom events
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === INCOGNITO_STORAGE_KEY && e.newValue !== null) {
        setIsIncognitoState(e.newValue === "true");
      }
    };

    const handleCustomChange = (e: Event) => {
      const custom = e as CustomEvent<boolean>;
      if (typeof custom.detail === "boolean") {
        setIsIncognitoState(custom.detail);
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(INCOGNITO_EVENT, handleCustomChange);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(INCOGNITO_EVENT, handleCustomChange);
    };
  }, []);

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

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        broadcastStatus("offline");
      } else if (document.visibilityState === "visible") {
        if (!isIncognitoRef.current) {
          broadcastStatus("online");
        }
      }
    };

    const handleUnload = () => {
      broadcastStatus("offline");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("pagehide", handleUnload);

    // Heartbeat: keep timestamp fresh while active and visible
    const heartbeatTimer = setInterval(() => {
      if (
        !isIncognitoRef.current &&
        typeof document !== "undefined" &&
        document.visibilityState === "visible"
      ) {
        broadcastStatus("online");
      }
    }, HEARTBEAT_INTERVAL_MS);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("pagehide", handleUnload);
      clearInterval(heartbeatTimer);
    };
  }, [userId, broadcastStatus]);

  // Real-time friend status tracking via Firestore onSnapshot
  useEffect(() => {
    if (!trackedFriendIds || trackedFriendIds.length === 0) return;

    // Filter unique valid friend IDs
    const uniqueIds = Array.from(new Set(trackedFriendIds.filter(Boolean)));
    const unsubs: Array<() => void> = [];

    uniqueIds.forEach((friendId) => {
      try {
        const friendRef = doc(db, "users", friendId);
        const unsub = onSnapshot(
          friendRef,
          (snap) => {
            if (snap.exists()) {
              const data = snap.data();
              const status = data?.status === "online" ? "online" : "offline";
              setFriendPresenceMap((prev) => {
                if (prev[friendId] === status) return prev;
                return { ...prev, [friendId]: status };
              });
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

  // Helper to resolve a friend's status, accounting for incognito and presence map
  const getFriendStatus = useCallback(
    (friendId: string, fallbackStatus?: "online" | "offline"): "online" | "offline" => {
      const currentId = userId || getStoredUserId();
      if (friendId === currentId) {
        return isIncognito ? "offline" : "online";
      }

      if (friendPresenceMap[friendId]) {
        return friendPresenceMap[friendId];
      }

      return fallbackStatus || "offline";
    },
    [userId, isIncognito, friendPresenceMap]
  );

  return {
    isIncognito,
    setIsIncognito,
    toggleIncognito,
    friendPresenceMap,
    getFriendStatus,
  };
}
