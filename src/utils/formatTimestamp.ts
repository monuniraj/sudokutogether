export const PRESENCE_TIMEOUT_MS = 45 * 1000; // 45-second sliding presence cutoff for active heartbeats

/**
 * Robust utility to extract epoch milliseconds from any Firestore Timestamp,
 * Date object, Unix seconds/milliseconds number, or ISO date string.
 */
export const getTimestampMillis = (val?: any): number | null => {
  if (!val) return null;
  if (typeof val === "number") {
    // If it's a small number like < 10000000 (e.g. raw seconds duration), ignore safely
    if (val < 10000000) return null;
    return val < 1e11 ? val * 1000 : val;
  }
  if (val instanceof Date) {
    const t = val.getTime();
    return isNaN(t) ? null : t;
  }
  if (typeof val?.toMillis === "function") {
    try {
      const ms = val.toMillis();
      return typeof ms === "number" && !isNaN(ms) ? ms : null;
    } catch {}
  }
  if (typeof val?.toDate === "function") {
    try {
      const d = val.toDate();
      const t = d?.getTime();
      return typeof t === "number" && !isNaN(t) ? t : null;
    } catch {}
  }
  if (typeof val?.seconds === "number") {
    return val.seconds * 1000 + Math.floor((val.nanoseconds || 0) / 1000000);
  }
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (!trimmed) return null;
    const parsedTime = Date.parse(trimmed);
    if (!isNaN(parsedTime)) return parsedTime;
    const num = Number(trimmed);
    if (!isNaN(num) && num > 10000000) {
      return num < 1e11 ? num * 1000 : num;
    }
  }
  return null;
};

/**
 * Standardized timestamp formatter for Match History, Notifications, and Activity Logs.
 * - Under 1m: "Just now"
 * - Under 1h: "Xm ago" (e.g., "5m ago")
 * - Under 24h: "Xh ago" (e.g., "2h ago")
 * - Older than 24h: Date + local hour and minute (e.g., "Sep 9, 12:06 PM")
 * Converts automatically to the user's local device timezone.
 */
export const formatMatchTimestamp = (dateStrOrTimestamp?: any, fallback = "Saved Config", locale?: string): string => {
  if (!dateStrOrTimestamp) return fallback;

  const ms = getTimestampMillis(dateStrOrTimestamp);
  if (ms === null) {
    return typeof dateStrOrTimestamp === "string" ? dateStrOrTimestamp : fallback;
  }

  const d = new Date(ms);
  if (isNaN(d.getTime())) {
    return typeof dateStrOrTimestamp === "string" ? dateStrOrTimestamp : fallback;
  }

  const now = Date.now();
  const diffMs = now - d.getTime();

  // If created within the last 60 seconds (or slightly in future due to client clock skew)
  if (diffMs >= -60 * 1000 && diffMs < 60 * 1000) {
    return "Just now";
  }

  // Under 60 minutes
  if (diffMs >= 60 * 1000 && diffMs < 60 * 60 * 1000) {
    const mins = Math.floor(diffMs / (60 * 1000));
    return `${mins}m ago`;
  }

  // Under 24 hours
  if (diffMs >= 60 * 60 * 1000 && diffMs < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diffMs / (60 * 60 * 1000));
    return `${hours}h ago`;
  }

  // Between 24 and 48 hours: "Yesterday"
  if (diffMs >= 24 * 60 * 60 * 1000 && diffMs < 48 * 60 * 60 * 1000) {
    return "Yesterday";
  }

  // Older than 48 hours: Clean localized date (e.g. "Sep 16" or "Sep 16, 2025" if different year)
  const isCurrentYear = d.getFullYear() === new Date(now).getFullYear();
  const targetLocale = locale || (typeof navigator !== "undefined" ? navigator.language : "en-US");
  return d.toLocaleDateString(targetLocale, {
    month: "short",
    day: "numeric",
    ...(isCurrentYear ? {} : { year: "numeric" })
  });
};

/**
 * Standardized invite timestamp formatter for Bell notifications and invites.
 */
export const formatInviteTimestamp = (timestamp?: any, locale?: string): string => {
  return formatMatchTimestamp(timestamp, "Just now", locale);
};

/**
 * Standardized user presence subtext formatter.
 * Strict Rule: When online AND active within PRESENCE_TIMEOUT_MS (15m), returns "Active now".
 * When inactive > 15m or offline, returns relative time ("Active 25m ago", "Active 2h ago", etc.) or "Offline".
 */
export const formatActiveStatus = (
  status?: string,
  lastSeenOrPlayed?: any,
  locale?: string
): string => {
  const timestampMs = getTimestampMillis(lastSeenOrPlayed);
  const now = Date.now();
  const isRecent = timestampMs !== null && now - timestampMs <= PRESENCE_TIMEOUT_MS;

  // A user is ONLY "Active now" if marked online AND has verified activity within 15 minutes
  if (status === "online" && isRecent) {
    return "Active now";
  }

  // If no timestamp is present or cannot be parsed, fallback to "Offline"
  if (!lastSeenOrPlayed || timestampMs === null) {
    return "Offline";
  }

  const rel = formatMatchTimestamp(lastSeenOrPlayed, "Offline", locale);
  if (!rel || rel === "Offline" || rel === "Saved Config") {
    return "Offline";
  }
  if (rel === "Just now") {
    return "Active just now";
  }
  return `Active ${rel}`;
};

