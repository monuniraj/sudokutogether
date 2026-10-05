import { useCallback, useRef, useEffect } from "react";
import { triggerHapticTap, triggerHaptic, triggerHapticCompletion } from "../utils/haptics";

/**
 * Singleton AudioContext for Podium C-Major Acoustic Synthesis
 * Preserves browser resource limits and avoids duplicate AudioContext warnings.
 */
let podiumAudioCtx: AudioContext | null = null;

function getPodiumAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!podiumAudioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    try {
      podiumAudioCtx = new AudioContextClass();
    } catch {
      return null;
    }
  }
  return podiumAudioCtx;
}

/**
 * Hook for synchronized C-Major harmonic synthesis during multiplayer podium reveals.
 *
 * Sequence:
 * - Step 1 (T = 0ms - Rank 3 Land): Triangle @ C4 (261.63Hz) + 1200Hz lowpass + Light Tap
 * - Step 2 (T = 250ms - Rank 2 Land): Sine/Triangle blend @ E4 (329.63Hz) + Light Tap
 * - Step 3 (T = 650ms - Rank 1 Coronation): Glass triad G4 (392Hz) + C5 (523.25Hz) + E5 (659.25Hz) + Medium Impact
 */
export function usePodiumAudio() {
  const isPlayingRef = useRef<boolean>(false);
  const activeTimeoutsRef = useRef<number[]>([]);

  // Cleanup pending timeouts on unmount
  useEffect(() => {
    return () => {
      activeTimeoutsRef.current.forEach((id) => clearTimeout(id));
      activeTimeoutsRef.current = [];
      isPlayingRef.current = false;
    };
  }, []);

  const playPodiumSequence = useCallback(async (isWinner: boolean = false, isPB: boolean = false) => {
    // Prevent overlapping sequence triggers
    if (isPlayingRef.current) return;
    isPlayingRef.current = true;

    // Clear any previous timeouts
    activeTimeoutsRef.current.forEach((id) => clearTimeout(id));
    activeTimeoutsRef.current = [];

    // Check sound preference from localStorage
    let isSoundEnabled = true;
    try {
      isSoundEnabled = localStorage.getItem("sudoku_soundEffects") !== "false";
    } catch {
      isSoundEnabled = true;
    }

    const ctx = isSoundEnabled ? getPodiumAudioContext() : null;

    if (ctx && ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch {}
    }

    // ─────────────────────────────────────────────
    // STEP 1 (T = 0ms - Rank 3 Land)
    // Triangle oscillator @ C4 (261.63Hz) through 1200Hz lowpass
    // Duration: 180ms. Gain: 0.12 -> 0.001. Haptic: Light tap.
    // ─────────────────────────────────────────────
    triggerHapticTap();

    if (ctx && isSoundEnabled) {
      try {
        const t1 = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const filter1 = ctx.createBiquadFilter();
        const gain1 = ctx.createGain();

        osc1.type = "triangle";
        osc1.frequency.setValueAtTime(261.63, t1); // C4

        filter1.type = "lowpass";
        filter1.frequency.setValueAtTime(1200, t1);

        gain1.gain.setValueAtTime(0.001, t1);
        gain1.gain.linearRampToValueAtTime(0.12, t1 + 0.02); // 20ms gentle attack
        gain1.gain.exponentialRampToValueAtTime(0.001, t1 + 0.18); // 180ms total

        osc1.connect(filter1);
        filter1.connect(gain1);
        gain1.connect(ctx.destination);

        osc1.start(t1);
        osc1.stop(t1 + 0.19);
        osc1.onended = () => {
          try {
            osc1.disconnect();
            filter1.disconnect();
            gain1.disconnect();
          } catch {}
        };
      } catch (err) {
        console.warn("[usePodiumAudio] Step 1 synthesis error:", err);
      }
    }

    // ─────────────────────────────────────────────
    // STEP 2 (T = 250ms - Rank 2 Land)
    // Sine/triangle blend @ E4 (329.63Hz)
    // Duration: 260ms. Gain: 0.13 -> 0.001. Haptic: Light tap.
    // ─────────────────────────────────────────────
    const t2Id = window.setTimeout(() => {
      triggerHapticTap();

      if (ctx && isSoundEnabled) {
        try {
          const t2 = ctx.currentTime;
          const oscSine = ctx.createOscillator();
          const oscTri = ctx.createOscillator();
          const gain2 = ctx.createGain();

          oscSine.type = "sine";
          oscSine.frequency.setValueAtTime(329.63, t2); // E4

          oscTri.type = "triangle";
          oscTri.frequency.setValueAtTime(329.63, t2); // E4

          gain2.gain.setValueAtTime(0.001, t2);
          gain2.gain.linearRampToValueAtTime(0.13, t2 + 0.025); // 25ms attack
          gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.26); // 260ms total

          oscSine.connect(gain2);
          oscTri.connect(gain2);
          gain2.connect(ctx.destination);

          oscSine.start(t2);
          oscTri.start(t2);
          oscSine.stop(t2 + 0.27);
          oscTri.stop(t2 + 0.27);

          oscSine.onended = () => {
            try {
              oscSine.disconnect();
              oscTri.disconnect();
              gain2.disconnect();
            } catch {}
          };
        } catch (err) {
          console.warn("[usePodiumAudio] Step 2 synthesis error:", err);
        }
      }
    }, 250);
    activeTimeoutsRef.current.push(t2Id);

    // ─────────────────────────────────────────────
    // STEP 3 (T = 650ms - Rank 1 Coronation)
    // C-Major glass triad: G4 (392Hz), C5 (523.25Hz), E5 (659.25Hz)
    // 25ms pillowy linear attack, 1.2s exponential decay tail
    // Gain: 0.10 per note. Haptic: Medium impact + optional Completion.
    // ─────────────────────────────────────────────
    const t3Id = window.setTimeout(() => {
      triggerHaptic("medium");
      if (isWinner || isPB) {
        triggerHapticCompletion();
      }

      if (ctx && isSoundEnabled) {
        try {
          const t3 = ctx.currentTime;
          const notes = [392.0, 523.25, 659.25];
          const attack = 0.025;
          const duration = 1.2;
          const noteGain = 0.1;

          notes.forEach((freq) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, t3);

            gain.gain.setValueAtTime(0.001, t3);
            gain.gain.linearRampToValueAtTime(noteGain, t3 + attack);
            gain.gain.exponentialRampToValueAtTime(0.0001, t3 + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(t3);
            osc.stop(t3 + duration + 0.05);
            osc.onended = () => {
              try {
                osc.disconnect();
                gain.disconnect();
              } catch {}
            };
          });
        } catch (err) {
          console.warn("[usePodiumAudio] Step 3 synthesis error:", err);
        }
      }
    }, 650);
    activeTimeoutsRef.current.push(t3Id);

    // Reset isPlaying lock after full tail completion (650ms + 1200ms = 1850ms)
    const endId = window.setTimeout(() => {
      isPlayingRef.current = false;
    }, 1850);
    activeTimeoutsRef.current.push(endId);
  }, []);

  return { playPodiumSequence };
}
