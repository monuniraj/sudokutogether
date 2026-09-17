/**
 * Standardized timestamp formatter for Match History, Notifications, and Activity Logs.
 * - Under 1m: "Just now"
 * - Under 1h: "Xm ago" (e.g., "5m ago")
 * - Under 24h: "Xh ago" (e.g., "2h ago")
 * - Older than 24h: Date + local hour and minute (e.g., "Sep 9, 12:06 PM")
 * Converts automatically to the user's local device timezone.
 */
export const formatMatchTimestamp = (dateStrOrTimestamp?: any, fallback = "Saved Config"): string => {
  if (!dateStrOrTimestamp) return fallback;

  let d: Date;
  if (typeof dateStrOrTimestamp === "number") {
    // If it's a small number like < 10000000 (e.g. raw seconds duration), fallback safely
    if (dateStrOrTimestamp < 10000000) {
      return fallback;
    }
    // Check if seconds instead of milliseconds (10-digit unix epoch vs 13-digit ms)
    d = new Date(dateStrOrTimestamp < 1e11 ? dateStrOrTimestamp * 1000 : dateStrOrTimestamp);
  } else if (dateStrOrTimestamp instanceof Date) {
    d = dateStrOrTimestamp;
  } else if (dateStrOrTimestamp?.toMillis && typeof dateStrOrTimestamp.toMillis === "function") {
    d = new Date(dateStrOrTimestamp.toMillis());
  } else if (dateStrOrTimestamp?.toDate && typeof dateStrOrTimestamp.toDate === "function") {
    d = dateStrOrTimestamp.toDate();
  } else if (typeof dateStrOrTimestamp === "string") {
    const trimmed = dateStrOrTimestamp.trim();
    if (!trimmed) return fallback;
    const parsedTime = Date.parse(trimmed);
    if (!isNaN(parsedTime)) {
      d = new Date(parsedTime);
    } else {
      const numParsed = Number(trimmed);
      if (!isNaN(numParsed) && numParsed > 10000000) {
        d = new Date(numParsed < 1e11 ? numParsed * 1000 : numParsed);
      } else {
        return fallback;
      }
    }
  } else {
    return fallback;
  }

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
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(isCurrentYear ? {} : { year: "numeric" })
  });
};

/**
 * Standardized invite timestamp formatter for Bell notifications and invites.
 */
export const formatInviteTimestamp = (timestamp?: any): string => {
  return formatMatchTimestamp(timestamp, "Just now");
};
