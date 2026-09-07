import { flushSync } from 'react-dom';
import { triggerHaptic, isHapticsEnabled, ImpactStyle } from './haptics';

/**
 * Singleton AudioContext holder to prevent exhausting audio contexts.
 */
let themeAudioCtx: AudioContext | null = null;

function getThemeAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextClass) return null;

    if (!themeAudioCtx || themeAudioCtx.state === 'closed') {
      themeAudioCtx = new AudioContextClass();
    }

    if (themeAudioCtx.state === 'suspended') {
      themeAudioCtx.resume().catch(() => {
        // Handled silently
      });
    }

    return themeAudioCtx;
  } catch {
    return null;
  }
}

/**
 * Triggers gentle haptic tap feedback if enabled, using central triggerHaptic engine.
 */
export const triggerThemeHaptics = (enabled?: boolean): void => {
  triggerHaptic(ImpactStyle.Light, enabled);
};

interface ThemeFeedbackOptions {
  soundEnabled?: boolean;
  hapticsEnabled?: boolean;
}

/**
 * Plays a soft procedural sine chime using Web Audio API with gain envelope ramping to 0 to prevent clicking:
 * - To Dark Mode (Descending): Two calm, warm tones (523Hz then 392Hz, ~0.25s duration, volume ~0.07).
 * - To Light Mode (Ascending): Two bright, soft tones (392Hz then 523Hz, ~0.25s duration, volume ~0.07).
 * 
 * Also triggers light haptic impact feedback if enabled.
 * Respects in-app sound and vibration settings.
 */
export function playThemeFeedback(
  toDarkMode: boolean,
  soundOrOptions?: boolean | ThemeFeedbackOptions,
  hapticsEnabledArg?: boolean
): void {
  // Resolve settings
  let soundEnabled: boolean;
  let hapticsEnabled: boolean | undefined;

  if (typeof soundOrOptions === 'boolean') {
    soundEnabled = soundOrOptions;
    hapticsEnabled = hapticsEnabledArg;
  } else if (soundOrOptions && typeof soundOrOptions === 'object') {
    soundEnabled = soundOrOptions.soundEnabled ?? true;
    hapticsEnabled = soundOrOptions.hapticsEnabled;
  } else {
    // Fall back to localStorage settings if not explicitly provided
    if (typeof window !== 'undefined') {
      soundEnabled = localStorage.getItem('sudoku_soundEffects') !== 'false';
      hapticsEnabled = isHapticsEnabled();
    } else {
      soundEnabled = true;
      hapticsEnabled = true;
    }
  }

  // 1. Trigger Light Haptic Feedback (strictly guarded by global setting)
  if (isHapticsEnabled(hapticsEnabled)) {
    triggerHaptic(ImpactStyle.Light, hapticsEnabled);
  }

  // 2. Play Procedural Chime if sound is enabled
  if (!soundEnabled) return;

  try {
    const ctx = getThemeAudioContext();
    if (!ctx) return;

    // Frequencies:
    // To Dark (Descending): 523Hz (C5) then 392Hz (G4)
    // To Light (Ascending): 392Hz (G4) then 523Hz (C5)
    const tones = toDarkMode ? [523, 392] : [392, 523];
    const now = ctx.currentTime;
    const peakVolume = 0.07;
    const toneDuration = 0.16;
    const noteSpacing = 0.09;

    tones.forEach((frequency, index) => {
      const startTime = now + index * noteSpacing;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, startTime);

      // Gain Envelope ramping to 0 to prevent clicking:
      gain.gain.setValueAtTime(0, startTime);
      // Soft attack
      gain.gain.linearRampToValueAtTime(peakVolume, startTime + 0.02);
      // Exponential decay
      const decayEnd = startTime + toneDuration - 0.015;
      gain.gain.exponentialRampToValueAtTime(0.0001, decayEnd);
      // Ramp to exact 0 at the end to prevent clicking
      gain.gain.linearRampToValueAtTime(0, startTime + toneDuration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + toneDuration + 0.02);
    });
  } catch {
    // Fail silently without disrupting UI transition
  }
}

/**
 * Industry-standard synchronized theme transition handler.
 * - Triggers procedural chime + haptics.
 * - Synchronously updates the HTML class list (.dark) to eliminate the asynchronous 1-frame gap.
 * - Uses the native document.startViewTransition API where supported for seamless compositor-level crossfades.
 * - Provides a scoped temporary .theme-transitioning class fallback for older browsers that cleans up after 250ms,
 *   preserving 0ms latency during gameplay.
 */
export function applyThemeToggle(
  nextMode: boolean,
  setDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void,
  soundEffects?: boolean,
  vibrations?: boolean
): void {
  // 1. Play auditory & tactile feedback
  playThemeFeedback(nextMode, soundEffects, vibrations);

  const performThemeDOMUpdate = () => {
    if (typeof document !== 'undefined') {
      if (nextMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      try {
        localStorage.setItem('sudoku_darkMode', String(nextMode));
      } catch {
        // Fail silently
      }
    }
    setDarkMode(nextMode);
  };

  // 2. Modern View Transitions API check
  if (
    typeof document !== 'undefined' &&
    'startViewTransition' in document &&
    typeof (document as unknown as { startViewTransition: (cb: () => void) => unknown }).startViewTransition === 'function'
  ) {
    try {
      // Temporarily suppress element-level transitions so the new snapshot captures pure new theme colors at T=0
      document.documentElement.classList.add('theme-snapshotting');

      const transition = (document as unknown as { 
        startViewTransition: (cb: () => void) => { finished?: Promise<unknown> } 
      }).startViewTransition(() => {
        flushSync(() => {
          performThemeDOMUpdate();
        });
      });

      const cleanupSnapshotting = () => {
        if (typeof document !== 'undefined') {
          document.documentElement.classList.remove('theme-snapshotting');
        }
      };

      if (transition && typeof transition.finished?.then === 'function') {
        transition.finished.finally(cleanupSnapshotting);
      } else {
        setTimeout(cleanupSnapshotting, 260);
      }
      return;
    } catch {
      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('theme-snapshotting');
      }
      // Fallback if view transition fails
    }
  }

  // 3. Fallback: Apply scoped transition class for 250ms, then clean up
  if (typeof document !== 'undefined') {
    document.documentElement.classList.add('theme-transitioning');
    performThemeDOMUpdate();
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 260);
  } else {
    performThemeDOMUpdate();
  }
}
