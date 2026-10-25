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

/**
 * Staggered Board Reveal: Soft ascending kalimba / crystal arpeggio chime
 */
export const playKalimbaRevealSound = (
  audioCtx: AudioContext | null,
  isEnabled: boolean = true
) => {
  if (!isEnabled || !audioCtx) return;
  try {
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    const t = audioCtx.currentTime;
    // D major pentatonic cascade: D5, F#5, A5, C#6, E6
    const freqs = [587.33, 739.99, 880.00, 1108.73, 1318.51];
    
    freqs.forEach((freq, idx) => {
      const noteTime = t + idx * 0.038;
      
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      // Warm kalimba tone: sine fundamental with gentle overtone
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, noteTime);
      
      gain.gain.setValueAtTime(0.0001, noteTime);
      gain.gain.linearRampToValueAtTime(0.075, noteTime + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.22);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start(noteTime);
      osc.stop(noteTime + 0.23);
      osc.onended = () => {
        try { osc.disconnect(); gain.disconnect(); } catch {}
      };
    });
  } catch (e) {
    console.error("Audio Kalimba Reveal Error:", e);
  }
};

/**
 * Row / Column Completion: Crisp wooden marimba note with acoustic body
 */
export const playMarimbaLineSound = (
  audioCtx: AudioContext | null,
  isEnabled: boolean = true
) => {
  if (!isEnabled || !audioCtx) return;
  try {
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    const t = audioCtx.currentTime;

    // 1. Resonant wooden bar (triangle wave with fast percussive attack)
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(440, t); // A4 marimba fundamental
    osc.frequency.exponentialRampToValueAtTime(420, t + 0.12);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.14, t + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(t);
    osc.stop(t + 0.15);
    osc.onended = () => {
      try { osc.disconnect(); gain.disconnect(); } catch {}
    };

    // 2. High wooden mallet click (harmonic ping at 3x fundamental)
    const mallet = audioCtx.createOscillator();
    const malletGain = audioCtx.createGain();
    mallet.type = "sine";
    mallet.frequency.setValueAtTime(1320, t);

    malletGain.gain.setValueAtTime(0.0001, t);
    malletGain.gain.linearRampToValueAtTime(0.06, t + 0.002);
    malletGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);

    mallet.connect(malletGain);
    malletGain.connect(audioCtx.destination);

    mallet.start(t);
    mallet.stop(t + 0.04);
    mallet.onended = () => {
      try { mallet.disconnect(); malletGain.disconnect(); } catch {}
    };
  } catch (e) {
    console.error("Audio Marimba Line Error:", e);
  }
};

/**
 * 3x3 Box Completion: Warm Rhodes electric piano chord
 */
export const playRhodesBoxSound = (
  audioCtx: AudioContext | null,
  isEnabled: boolean = true
) => {
  if (!isEnabled || !audioCtx) return;
  try {
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    const t = audioCtx.currentTime;

    // Warm Rhodes lowpass filter
    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1500, t);
    filter.Q.setValueAtTime(0.8, t);
    filter.connect(audioCtx.destination);

    // Warm Fmaj7 chord: F4 (349.23), A4 (440.00), C5 (523.25), E5 (659.25)
    const chord = [349.23, 440.00, 523.25, 659.25];

    chord.forEach((freq, idx) => {
      const noteDelay = idx * 0.015;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, t + noteDelay);

      gain.gain.setValueAtTime(0.0001, t + noteDelay);
      gain.gain.linearRampToValueAtTime(0.08, t + noteDelay + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + noteDelay + 0.42);

      osc.connect(gain);
      gain.connect(filter);

      osc.start(t + noteDelay);
      osc.stop(t + noteDelay + 0.45);
      osc.onended = () => {
        try { osc.disconnect(); gain.disconnect(); } catch {}
      };
    });
  } catch (e) {
    console.error("Audio Rhodes Box Error:", e);
  }
};

/**
 * Simultaneous Combo: Lush, harmonic Major 7th chord with crystalline shimmer
 */
export const playMajor7thComboSound = (
  audioCtx: AudioContext | null,
  isEnabled: boolean = true
) => {
  if (!isEnabled || !audioCtx) return;
  try {
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    const t = audioCtx.currentTime;

    // Rolling harp arpeggio: C4, G4, B4, E5, G5, B5
    const comboNotes = [261.63, 392.00, 493.88, 659.25, 783.99, 987.77];

    comboNotes.forEach((freq, idx) => {
      const noteTime = t + idx * 0.024;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = idx >= 3 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, noteTime);

      const vol = 0.08 + idx * 0.012;
      gain.gain.setValueAtTime(0.0001, noteTime);
      gain.gain.linearRampToValueAtTime(vol, noteTime + 0.010);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.58);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.60);
      osc.onended = () => {
        try { osc.disconnect(); gain.disconnect(); } catch {}
      };
    });
  } catch (e) {
    console.error("Audio Major 7th Combo Error:", e);
  }
};

/**
 * Keypad Number Exhaustion: Soft crystal bubble pop with gentle resonant chime
 */
export const playBubblePopSound = (
  audioCtx: AudioContext | null,
  isEnabled: boolean = true
) => {
  if (!isEnabled || !audioCtx) return;
  try {
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    const t = audioCtx.currentTime;

    // 1. Organic bubble pitch drop (880Hz down to 240Hz in 35ms)
    const popOsc = audioCtx.createOscillator();
    const popGain = audioCtx.createGain();

    popOsc.type = "sine";
    popOsc.frequency.setValueAtTime(880, t);
    popOsc.frequency.exponentialRampToValueAtTime(240, t + 0.038);

    popGain.gain.setValueAtTime(0.0001, t);
    popGain.gain.linearRampToValueAtTime(0.16, t + 0.003);
    popGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);

    popOsc.connect(popGain);
    popGain.connect(audioCtx.destination);

    popOsc.start(t);
    popOsc.stop(t + 0.05);
    popOsc.onended = () => {
      try { popOsc.disconnect(); popGain.disconnect(); } catch {}
    };

    // 2. Crystal bell chime ring (harmonic ping at D6 = 1174.66Hz)
    const chimeOsc = audioCtx.createOscillator();
    const chimeGain = audioCtx.createGain();

    chimeOsc.type = "sine";
    chimeOsc.frequency.setValueAtTime(1174.66, t + 0.01);

    chimeGain.gain.setValueAtTime(0.0001, t + 0.01);
    chimeGain.gain.linearRampToValueAtTime(0.08, t + 0.016);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);

    chimeOsc.connect(chimeGain);
    chimeGain.connect(audioCtx.destination);

    chimeOsc.start(t + 0.01);
    chimeOsc.stop(t + 0.30);
    chimeOsc.onended = () => {
      try { chimeOsc.disconnect(); chimeGain.disconnect(); } catch {}
    };
  } catch (e) {
    console.error("Audio Bubble Pop Error:", e);
  }
};

