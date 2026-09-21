/**
 * Sound Effects Engine
 * Synthesizes rich, low-latency audio events via Web Audio API without external asset dependencies.
 */

// Pentatonic celebration progression across confetti cannon burst waves
// Wave 0: C5, Wave 1: E5, Wave 2: G5, Wave 3: A5, Wave 4: C6 Crown Sparkle
const CELEBRATION_SCALE = [523.25, 659.25, 783.99, 880.00, 1046.50];

/**
 * Layered Melodic Confetti Cannon Pop:
 * Layer A: Warm acoustic "pop / boom" (pitch-dropping sub thump + bandpass noise puff)
 * Layer B: Ascending celebratory chime / melody with high-shimmer exponential decay
 */
export const playPartyPopperSound = (
  audioCtx: AudioContext | null,
  burstIndex: number = 0,
  isEnabled: boolean = true
) => {
  if (!isEnabled || !audioCtx) return;

  try {
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }

    const t = audioCtx.currentTime;
    const clampedIndex = Math.max(0, Math.min(burstIndex, CELEBRATION_SCALE.length - 1));
    const isCrown = clampedIndex === CELEBRATION_SCALE.length - 1;

    // ==========================================
    // LAYER A: Warm Acoustic "Pop / Boom"
    // ==========================================

    // 1. Pressurized Sub-Thump (pitch drop 210Hz -> 52Hz over 70ms)
    const subOsc = audioCtx.createOscillator();
    const subGain = audioCtx.createGain();
    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(210, t);
    subOsc.frequency.exponentialRampToValueAtTime(52, t + 0.07);

    subGain.gain.setValueAtTime(0.001, t);
    subGain.gain.linearRampToValueAtTime(0.20, t + 0.004);
    subGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.075);

    subOsc.connect(subGain);
    subGain.connect(audioCtx.destination);

    subOsc.start(t);
    subOsc.stop(t + 0.08);
    subOsc.onended = () => {
      try {
        subOsc.disconnect();
        subGain.disconnect();
      } catch {}
    };

    // 2. Soft Bandpass-Filtered Air Puff (70ms filtered noise burst)
    const bufferSize = Math.floor(audioCtx.sampleRate * 0.07);
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioCtx.sampleRate * 0.02));
    }

    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.setValueAtTime(1100, t);
    noiseFilter.frequency.exponentialRampToValueAtTime(450, t + 0.065);
    noiseFilter.Q.setValueAtTime(1.6, t);

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.001, t);
    noiseGain.gain.linearRampToValueAtTime(0.13, t + 0.003);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);

    whiteNoise.start(t);
    whiteNoise.stop(t + 0.075);
    whiteNoise.onended = () => {
      try {
        whiteNoise.disconnect();
        noiseFilter.disconnect();
        noiseGain.disconnect();
      } catch {}
    };

    // ==========================================
    // LAYER B: Ascending Celebratory Chime / Melody
    // ==========================================
    const noteFreq = CELEBRATION_SCALE[clampedIndex];
    const chimeDuration = isCrown ? 0.65 : 0.45;

    // Fundamental Bell Note
    const chimeOsc = audioCtx.createOscillator();
    const chimeGain = audioCtx.createGain();
    chimeOsc.type = "sine";
    chimeOsc.frequency.setValueAtTime(noteFreq, t);

    const chimeVol = isCrown ? 0.15 : 0.11;
    chimeGain.gain.setValueAtTime(0.0001, t);
    chimeGain.gain.linearRampToValueAtTime(chimeVol, t + 0.008);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, t + chimeDuration);

    chimeOsc.connect(chimeGain);
    chimeGain.connect(audioCtx.destination);

    chimeOsc.start(t);
    chimeOsc.stop(t + chimeDuration + 0.02);
    chimeOsc.onended = () => {
      try {
        chimeOsc.disconnect();
        chimeGain.disconnect();
      } catch {}
    };

    // Shimmer Sparkle Harmonic (2x frequency overtone)
    const shimmerOsc = audioCtx.createOscillator();
    const shimmerGain = audioCtx.createGain();
    shimmerOsc.type = "triangle";
    shimmerOsc.frequency.setValueAtTime(noteFreq * 2, t);

    const shimmerDuration = isCrown ? 0.40 : 0.22;
    const shimmerVol = isCrown ? 0.045 : 0.028;
    shimmerGain.gain.setValueAtTime(0.0001, t);
    shimmerGain.gain.linearRampToValueAtTime(shimmerVol, t + 0.006);
    shimmerGain.gain.exponentialRampToValueAtTime(0.0001, t + shimmerDuration);

    shimmerOsc.connect(shimmerGain);
    shimmerGain.connect(audioCtx.destination);

    shimmerOsc.start(t);
    shimmerOsc.stop(t + shimmerDuration + 0.02);
    shimmerOsc.onended = () => {
      try {
        shimmerOsc.disconnect();
        shimmerGain.disconnect();
      } catch {}
    };

    // For final Crown Sparkle, add celestial top bell (C7 = 2093Hz)
    if (isCrown) {
      const crownOsc = audioCtx.createOscillator();
      const crownGain = audioCtx.createGain();
      crownOsc.type = "sine";
      crownOsc.frequency.setValueAtTime(2093.00, t + 0.02);

      crownGain.gain.setValueAtTime(0.0001, t + 0.02);
      crownGain.gain.linearRampToValueAtTime(0.04, t + 0.028);
      crownGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);

      crownOsc.connect(crownGain);
      crownGain.connect(audioCtx.destination);

      crownOsc.start(t + 0.02);
      crownOsc.stop(t + 0.60);
      crownOsc.onended = () => {
        try {
          crownOsc.disconnect();
          crownGain.disconnect();
        } catch {}
      };
    }
  } catch (e) {
    console.error("Audio Party Popper Error:", e);
  }
};
