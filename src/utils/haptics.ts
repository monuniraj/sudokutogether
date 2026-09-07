import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export { ImpactStyle, NotificationType };

export type HapticStyle =
  | ImpactStyle
  | 'light'
  | 'medium'
  | 'heavy'
  | 'error'
  | NotificationType;

/**
 * Universal Global Haptics Engine for SudokuSync
 * Ensures 100% adherence to user vibration/haptics preference across the entire app.
 * Automatically handles Capacitor Native (Android/iOS) and Web Browser (HTML5 Vibration API)
 * with robust safety guards for Safari, iOS web browsers, and desktop platforms.
 */

/**
 * Checks if haptics/vibration is enabled by user preference.
 * Priority:
 * 1. Explicit parameter if provided (boolean)
 * 2. Active in-app setting in localStorage (`sudoku_vibrations`, `vibrationEnabled`, `isHapticsEnabled`)
 */
export const isHapticsEnabled = (explicitSetting?: boolean): boolean => {
  if (explicitSetting !== undefined) {
    return explicitSetting === true;
  }
  if (typeof window === 'undefined') return false;

  try {
    const sudokuVibrations = localStorage.getItem('sudoku_vibrations');
    if (sudokuVibrations === 'false') return false;

    const vibrationEnabled = localStorage.getItem('vibrationEnabled');
    if (vibrationEnabled === 'false') return false;

    const isHaptics = localStorage.getItem('isHapticsEnabled');
    if (isHaptics === 'false') return false;

    return true;
  } catch {
    return false;
  }
};

/**
 * Updates the global haptic setting across all known storage keys.
 */
export const setGlobalHapticsEnabled = (enabled: boolean): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('sudoku_vibrations', String(enabled));
    localStorage.setItem('vibrationEnabled', String(enabled));
    localStorage.setItem('isHapticsEnabled', String(enabled));
  } catch {
    // Fail silently
  }
};

/**
 * Central helper to trigger haptic feedback.
 * CRITICAL ENFORCEMENT: First checks if haptics is enabled.
 * If the setting is OFF, vibration is 100% disabled across the entire app.
 */
export const triggerHaptic = (
  style: HapticStyle = ImpactStyle.Light,
  explicitSetting?: boolean
): void => {
  // If haptics is OFF, abort immediately
  if (!isHapticsEnabled(explicitSetting)) return;
  if (typeof window === 'undefined') return;

  try {
    if (style === 'error' || style === NotificationType.Error) {
      if (Capacitor.isNativePlatform()) {
        Haptics.notification({ type: NotificationType.Error }).catch(() => {
          // Fail silently if device lacks haptic motor
        });
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator && typeof navigator.vibrate === 'function') {
        navigator.vibrate([60, 40, 60]);
      }
      return;
    }

    let impactStyle = ImpactStyle.Light;
    let webDuration = 25;

    if (style === 'medium' || style === ImpactStyle.Medium) {
      impactStyle = ImpactStyle.Medium;
      webDuration = 35;
    } else if (style === 'heavy' || style === ImpactStyle.Heavy) {
      impactStyle = ImpactStyle.Heavy;
      webDuration = 50;
    }

    if (Capacitor.isNativePlatform()) {
      Haptics.impact({ style: impactStyle }).catch(() => {
        // Fail silently
      });
    } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator && typeof navigator.vibrate === 'function') {
      navigator.vibrate(webDuration);
    }
  } catch {
    // Fail silently on unsupported environments
  }
};

/**
 * Convenience wrapper for standard tap feedback.
 * Always checks global setting if `enabled` is omitted.
 */
export const triggerHapticTap = (enabled?: boolean): void => {
  triggerHaptic(ImpactStyle.Light, enabled);
};

/**
 * Convenience wrapper for error/warning feedback.
 * Always checks global setting if `enabled` is omitted.
 */
export const triggerHapticError = (enabled?: boolean): void => {
  triggerHaptic('error', enabled);
};
