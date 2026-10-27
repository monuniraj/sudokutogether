/**
 * Sound Effects Engine
 * Synthesizes rich, low-latency audio events via Web Audio API without external asset dependencies.
 * All function implementations use hoisted 'export function' declarations to guarantee
 * zero Temporal Dead Zone (TDZ) ReferenceErrors across bundled/minified environments.
 */

// Pentatonic celebration progression across confetti cannon burst waves
// Wave 0: C5, Wave 1: E5, Wave 2: G5, Wave 3: A5, Wave 4: C6 Crown Sparkle
const CELEBRATION_SCALE = [523.25, 659.25, 783.99, 880.00, 1046.50];

/**
 * Muted Organic Party-Popper Puff:
 * 450Hz lowpass noise burst with 120ms soft decay and gentle low-register puff body
 */
export function playPartyPopperSound(
  audioCtx: AudioContext | null,
  burstIndex: number = 0,
  isEnabled: boolean = true
) {
  if (!isEnabled || !audioCtx) return;

  try {
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }

    const t = audioCtx.currentTime;

    // 1. Soft low-frequency puff body (pitch drop 110Hz -> 45Hz over 50ms)
    const subOsc = audioCtx.createOscillator();
    const subGain = audioCtx.createGain();
    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(110, t);
    subOsc.frequency.exponentialRampToValueAtTime(45, t + 0.050);

    subGain.gain.setValueAtTime(0.001, t);
    subGain.gain.linearRampToValueAtTime(0.12, t + 0.003);
    subGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.060);

    subOsc.connect(subGain);
    subGain.connect(audioCtx.destination);

    subOsc.start(t);
    subOsc.stop(t + 0.065);
    subOsc.onended = () => {
      try {
        subOsc.disconnect();
        subGain.disconnect();
      } catch {}
    };

    // 2. Muted Organic Lowpassed Noise Puff (450Hz lowpass, 120ms decay)
    const bufferSize = Math.floor(audioCtx.sampleRate * 0.12);
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioCtx.sampleRate * 0.035));
    }

    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.setValueAtTime(450, t);
    noiseFilter.Q.setValueAtTime(1.0, t);

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.001, t);
    noiseGain.gain.linearRampToValueAtTime(0.14, t + 0.003);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.120);

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);

    whiteNoise.start(t);
    whiteNoise.stop(t + 0.125);
    whiteNoise.onended = () => {
      try {
        whiteNoise.disconnect();
        noiseFilter.disconnect();
        noiseGain.disconnect();
      } catch {}
    };
  } catch (e) {
    console.error("Audio Party Popper Puff Error:", e);
  }
}

/**
 * 5-Tier Chebyshev Concentric Square Kalimba Synthesis:
 * Frame-accurate 1:1 synchronization with the 5 visual square rings:
 * - Ring 4 (Perimeter): T=0ms -> E4 (329.63Hz)
 * - Ring 3 (Outer-mid): T=140ms -> G4 (392.00Hz)
 * - Ring 2 (Mid-inner): T=280ms -> A4 (440.00Hz)
 * - Ring 1 (Inner):     T=420ms -> C5 (523.25Hz)
 * - Epicenter (Center): T=560ms -> E5 (659.25Hz) with natural acoustic ring-out to T=1100ms.
 * Warm 700Hz acoustic lowpass cutoff.
 */
export function playKalimbaRevealSound(
  audioCtx: AudioContext | null,
  isEnabled: boolean = true
) {
  if (!isEnabled || !audioCtx) return;
  try {
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    const t = audioCtx.currentTime;
    
    // Single shared submaster to eliminate buffer underruns and destination bus clipping
    const subMaster = audioCtx.createGain();
    subMaster.gain.setValueAtTime(0.80, t);
    subMaster.connect(audioCtx.destination);

    // Synchronized ADSR envelope matching radial wave (140ms spacing over 700ms lifecycle):
    // - T=0ms: Note 1 (E4 = 329.63Hz)
    // - T=140ms: Note 2 (G4 = 392.00Hz)
    // - T=280ms: Note 3 (A4 = 440.00Hz)
    // - T=420ms: Note 4 (C5 = 523.25Hz)
    // - T=560ms: Note 5 (E5 = 659.25Hz)
    // - T=560ms - 1100ms: Extended acoustic decay to natural silence (zero truncation)
    const notes = [
      { delay: 0.000, freq: 329.63, peak: 0.065, stopOffset: 0.700 }, // T=0ms: E4
      { delay: 0.140, freq: 392.00, peak: 0.070, stopOffset: 0.840 }, // T=140ms: G4
      { delay: 0.280, freq: 440.00, peak: 0.075, stopOffset: 0.950 }, // T=280ms: A4
      { delay: 0.420, freq: 523.25, peak: 0.080, stopOffset: 1.050 }, // T=420ms: C5
      { delay: 0.560, freq: 659.25, peak: 0.085, stopOffset: 1.100 }, // T=560ms: E5 (rings out to t+1.100s)
    ];

    notes.forEach((n) => {
      const noteTime = Math.max(audioCtx.currentTime, t + n.delay);
      const attackEnd = noteTime + 0.012; // Soft 12ms exponential curve to eliminate abrupt transient clicks
      const stopTime = t + n.stopOffset;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      // Warm 700Hz organic acoustic cutoff
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(700, noteTime);
      filter.Q.setValueAtTime(1.0, noteTime);

      // Warm wooden kalimba timbre: triangle wave filtered
      osc.type = "triangle";
      osc.frequency.setValueAtTime(n.freq, noteTime);

      // Soft exponential ramp-up & long unclipped decay down to 0.00001 (Zero cutoff / dropped bits)
      gain.gain.setValueAtTime(0.0001, noteTime);
      gain.gain.exponentialRampToValueAtTime(n.peak, attackEnd);
      gain.gain.exponentialRampToValueAtTime(0.00001, stopTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(subMaster);

      osc.start(noteTime);
      osc.stop(stopTime + 0.05);
      osc.onended = () => {
        try {
          osc.disconnect();
          filter.disconnect();
          gain.disconnect();
        } catch {}
      };
    });

    // Clean disconnect of submaster after the full 1100ms acoustic decay concludes
    setTimeout(() => {
      try {
        subMaster.disconnect();
      } catch {}
    }, 1250);
  } catch (e) {
    console.error("Audio Kalimba Reveal Error:", e);
  }
}

/**
 * Row / Column Completion: 2-note ascending kalimba interval
 * C4 (261.63Hz) -> E4 (329.63Hz) with 750Hz lowpass cutoff and 250ms soft decay
 */
export function playMarimbaLineSound(
  audioCtx: AudioContext | null,
  isEnabled: boolean = true
) {
  if (!isEnabled || !audioCtx) return;
  try {
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    const t = audioCtx.currentTime;

    const subMaster = audioCtx.createGain();
    subMaster.gain.setValueAtTime(0.85, t);
    subMaster.connect(audioCtx.destination);

    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(750, t);
    filter.Q.setValueAtTime(1.0, t);
    filter.connect(subMaster);

    const notes = [
      { delay: 0.000, freq: 261.63, peak: 0.12 }, // C4
      { delay: 0.070, freq: 329.63, peak: 0.14 }, // E4
    ];

    notes.forEach((n) => {
      const noteTime = t + n.delay;
      const attackEnd = noteTime + 0.008;
      const stopTime = noteTime + 0.250;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(n.freq, noteTime);

      gain.gain.setValueAtTime(0.0001, noteTime);
      gain.gain.linearRampToValueAtTime(n.peak, attackEnd);
      gain.gain.exponentialRampToValueAtTime(0.00001, stopTime);

      osc.connect(gain);
      gain.connect(filter);

      osc.start(noteTime);
      osc.stop(stopTime + 0.02);
      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {}
      };
    });

    setTimeout(() => {
      try {
        filter.disconnect();
        subMaster.disconnect();
      } catch {}
    }, 420);
  } catch (e) {
    console.error("Audio Marimba Line Error:", e);
  }
}

/**
 * 3x3 Box / Multi-Structure Completion: 3-note ascending triad with warm wooden body
 * C4 (261.63Hz) -> E4 (329.63Hz) -> G4 (392.00Hz) with 720Hz lowpass cutoff and 380ms soft decay
 */
export function playWoodenResonanceSound(
  audioCtx: AudioContext | null,
  isEnabled: boolean = true
) {
  if (!isEnabled || !audioCtx) return;
  try {
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    const t = audioCtx.currentTime;

    const subMaster = audioCtx.createGain();
    subMaster.gain.setValueAtTime(0.85, t);
    subMaster.connect(audioCtx.destination);

    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(720, t);
    filter.Q.setValueAtTime(1.1, t);
    filter.connect(subMaster);

    const chord = [
      { delay: 0.000, freq: 261.63, peak: 0.12, dur: 0.380 }, // C4
      { delay: 0.070, freq: 329.63, peak: 0.13, dur: 0.380 }, // E4
      { delay: 0.140, freq: 392.00, peak: 0.15, dur: 0.380 }, // G4
    ];

    chord.forEach((n) => {
      const noteTime = t + n.delay;
      const attackEnd = noteTime + 0.008;
      const stopTime = noteTime + n.dur;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(n.freq, noteTime);

      gain.gain.setValueAtTime(0.0001, noteTime);
      gain.gain.linearRampToValueAtTime(n.peak, attackEnd);
      gain.gain.exponentialRampToValueAtTime(0.00001, stopTime);

      osc.connect(gain);
      gain.connect(filter);

      osc.start(noteTime);
      osc.stop(stopTime + 0.03);
      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {}
      };
    });

    setTimeout(() => {
      try {
        filter.disconnect();
        subMaster.disconnect();
      } catch {}
    }, 600);
  } catch (e) {
    console.error("Audio Wooden Resonance Error:", e);
  }
}

/**
 * The Signature "Grand Tring" (Holy Grail Combo - Row + Col + Box Grand Tring):
 * 4-note resonant wooden chord: C4 (261.63Hz) -> E4 (329.63Hz) -> G4 (392.00Hz) -> B4 (493.88Hz)
 * with 700Hz lowpass cutoff and 600ms warm sustain decay.
 */
export function playMajor9thGrandTringSound(
  audioCtx: AudioContext | null,
  isEnabled: boolean = true
) {
  if (!isEnabled || !audioCtx) return;
  try {
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    const t = audioCtx.currentTime;

    const subMaster = audioCtx.createGain();
    subMaster.gain.setValueAtTime(0.85, t);
    subMaster.connect(audioCtx.destination);

    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(700, t);
    filter.Q.setValueAtTime(1.2, t);
    filter.connect(subMaster);

    const tringNotes = [
      { delay: 0.000, freq: 261.63, peak: 0.11 }, // C4
      { delay: 0.070, freq: 329.63, peak: 0.12 }, // E4
      { delay: 0.140, freq: 392.00, peak: 0.13 }, // G4
      { delay: 0.210, freq: 493.88, peak: 0.15 }, // B4
    ];

    tringNotes.forEach((n) => {
      const noteTime = t + n.delay;
      const attackEnd = noteTime + 0.010;
      const stopTime = noteTime + 0.600;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(n.freq, noteTime);

      gain.gain.setValueAtTime(0.0001, noteTime);
      gain.gain.linearRampToValueAtTime(n.peak, attackEnd);
      gain.gain.exponentialRampToValueAtTime(0.00001, stopTime);

      osc.connect(gain);
      gain.connect(filter);

      osc.start(noteTime);
      osc.stop(stopTime + 0.03);
      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {}
      };
    });

    setTimeout(() => {
      try {
        filter.disconnect();
        subMaster.disconnect();
      } catch {}
    }, 900);
  } catch (e) {
    console.error("Audio Grand Tring Error:", e);
  }
}

/**
 * Keypad Number Exhaustion: Joyful 3-note ascending micro-cascade
 * Note 1 (t=0ms): E5 (659.25Hz), peak 0.12, 120ms decay
 * Note 2 (t=40ms): G#5 (830.61Hz), peak 0.13, 120ms decay
 * Note 3 (t=80ms): B5 (987.77Hz), peak 0.15, 200ms decay
 * Mallet-strike envelope (3ms attack) through 1200Hz lowpass filter
 */
export function playWoodenLatchSnapSound(
  audioCtx: AudioContext | null,
  isEnabled: boolean = true
) {
  if (!isEnabled || !audioCtx) return;
  try {
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    const t = audioCtx.currentTime;

    const subMaster = audioCtx.createGain();
    subMaster.gain.setValueAtTime(0.85, t);
    subMaster.connect(audioCtx.destination);

    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1200, t);
    filter.Q.setValueAtTime(1.0, t);
    filter.connect(subMaster);

    const notes = [
      { delay: 0.000, freq: 659.25, peak: 0.12, dur: 0.120 }, // E5
      { delay: 0.040, freq: 830.61, peak: 0.13, dur: 0.120 }, // G#5
      { delay: 0.080, freq: 987.77, peak: 0.15, dur: 0.200 }, // B5
    ];

    notes.forEach((n) => {
      const noteTime = t + n.delay;
      const attackEnd = noteTime + 0.003;
      const stopTime = noteTime + n.dur;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(n.freq, noteTime);

      gain.gain.setValueAtTime(0.0001, noteTime);
      gain.gain.linearRampToValueAtTime(n.peak, attackEnd);
      gain.gain.exponentialRampToValueAtTime(0.00001, stopTime);

      osc.connect(gain);
      gain.connect(filter);

      osc.start(noteTime);
      osc.stop(stopTime + 0.02);
      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {}
      };
    });

    setTimeout(() => {
      try {
        filter.disconnect();
        subMaster.disconnect();
      } catch {}
    }, 350);
  } catch (e) {
    console.error("Audio Number Exhaustion Cascade Error:", e);
  }
}

/**
 * Pencil Notes Mark: Soft graphite tick
 * Lightweight 1200Hz micro-tap at half volume (0.05 gain) to distinguish rough pencil notes from firm entry
 */
export function playGraphiteTickSound(
  audioCtx: AudioContext | null,
  isEnabled: boolean = true
) {
  if (!isEnabled || !audioCtx) return;
  try {
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    const t = audioCtx.currentTime;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1500, t);
    filter.Q.setValueAtTime(0.7, t);

    osc.type = "sine";
    osc.frequency.setValueAtTime(1200, t);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.05, t + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(t);
    osc.stop(t + 0.040);
    osc.onended = () => {
      try {
        osc.disconnect();
        filter.disconnect();
        gain.disconnect();
      } catch {}
    };
  } catch (e) {
    console.error("Audio Graphite Tick Error:", e);
  }
}

/**
 * Invalid Move / Mistake Feedback: Tactile muted wood-block knock
 * Organic frequency drop 220Hz -> 110Hz, 480Hz lowpass filter, 80ms decay
 */
export function playWoodBlockErrorSound(
  audioCtx: AudioContext | null,
  isEnabled: boolean = true
) {
  if (!isEnabled || !audioCtx) return;
  try {
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    const t = audioCtx.currentTime;

    const osc = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();

    // Low-Q damped organic body filter
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(480, t);
    filter.Q.setValueAtTime(1.8, t);

    // Warm triangle percussive thump dropping from 220Hz down to 110Hz in 45ms
    osc.type = "triangle";
    osc.frequency.setValueAtTime(220, t);
    osc.exponentialRampToValueAtTime(110, t + 0.045);

    // Tactile damped envelope: fast 2ms attack, rapid 80ms decay
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.16, t + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.080);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(t);
    osc.stop(t + 0.085);
    osc.onended = () => {
      try {
        osc.disconnect();
        filter.disconnect();
        gain.disconnect();
      } catch {}
    };
  } catch (e) {
    console.error("Audio Wood-Block Error Sound Error:", e);
  }
}

// ============================================================================
// CANONICAL BACKWARD-COMPATIBLE ALIASES
// Placed strictly at the bottom of the file AFTER all implementations are hoisted
// ============================================================================
export const playLineCompleteSound = playMarimbaLineSound;
export const playRhodesBoxSound = playWoodenResonanceSound;
export const playBoxCompleteSound = playWoodenResonanceSound;
export const playMajor7thComboSound = playWoodenResonanceSound;
export const playMultiLineCompleteSound = playWoodenResonanceSound;
export const playTripleCompleteSound = playMajor9thGrandTringSound;
export const playBubblePopSound = playWoodenLatchSnapSound;
export const playNumberExhaustionSound = playWoodenLatchSnapSound;
export const playErrorSound = playWoodBlockErrorSound;
export const playMistakeSound = playWoodBlockErrorSound;
