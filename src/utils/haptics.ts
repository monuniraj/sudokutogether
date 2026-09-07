import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

/**
 * Universal Haptics Engine for SudokuSync
 * Automatically switches between Capacitor Native (Android/iOS) and Web Browser (HTML5 Vibration API)
 * with complete safety guards for Safari, iOS web browsers, and desktop platforms.
 */

export const triggerHapticTap = (enabled: boolean = true): void => {
  if (!enabled) return;
  if (typeof window === 'undefined') return;

  try {
    if (Capacitor.isNativePlatform()) {
      Haptics.impact({ style: ImpactStyle.Light }).catch(() => {
        // Fail silently if device lacks haptic motor
      });
    } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator && typeof navigator.vibrate === 'function') {
      navigator.vibrate(25);
    }
  } catch {
    // Fail silently on unsupported environments (e.g. desktop, Safari)
  }
};

export const triggerHapticError = (enabled: boolean = true): void => {
  if (!enabled) return;
  if (typeof window === 'undefined') return;

  try {
    if (Capacitor.isNativePlatform()) {
      Haptics.notification({ type: NotificationType.Error }).catch(() => {
        // Fail silently
      });
    } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator && typeof navigator.vibrate === 'function') {
      navigator.vibrate([60, 40, 60]);
    }
  } catch {
    // Fail silently on unsupported environments
  }
};
