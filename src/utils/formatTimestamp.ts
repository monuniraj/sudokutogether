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
    // Check if seconds instead of milliseconds (10-digit unix epoch)
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
      if (!isNaN(numParsed) && numParsed > 0) {
        d = new Date(numParsed < 1e11 ? numParsed * 1000 : numParsed);
      } else {
        return trimmed;
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

  // Older than 24 hours (or distant future): Date + local hour and minute
  const currentYear = new Date().getFullYear();
  const datePart = d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(d.getFullYear() !== currentYear ? { year: "numeric" } : {})
  });
  const timePart = d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit"
  });

  return `${datePart}, ${timePart}`;
};

/**
 * Standardized invite timestamp formatter for Bell notifications and invites.
 */
export const formatInviteTimestamp = (timestamp?: any): string => {
  return formatMatchTimestamp(timestamp, "Just now");
};
