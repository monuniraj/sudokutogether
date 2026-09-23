import React, { useEffect, useRef } from "react";

interface ConfettiBurstProps {
  darkMode?: boolean;
  onComplete?: () => void;
  onBurst?: (burstIndex: number) => void;
  mode?: "all" | "top-only" | "cannon-only";
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRotation: number;
  shape: "rect" | "circle" | "spark" | "streamer";
  tiltAngle: number;
  tiltAngleInc: number;
  bornAt: number;
  lifespan: number;
}

export const ConfettiBurst: React.FC<ConfettiBurstProps> = ({ darkMode = false, onComplete, onBurst, mode = "all" }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Stable refs for callbacks to prevent re-triggering useEffect on parent re-renders
  const onCompleteRef = useRef(onComplete);
  const onBurstRef = useRef(onBurst);
  onCompleteRef.current = onComplete;
  onBurstRef.current = onBurst;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrameId: number;
    let isDisposed = false;
    const startTime = performance.now();

    // Size canvas to viewport
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    // Curated color palettes for light and dark modes
    const lightColors = [
      "#10B981", // Deep emerald
      "#34D399", // Emerald
      "#F59E0B", // Amber gold
      "#FBBF24", // Warm gold
      "#8B5CF6", // Violet
      "#A78BFA", // Soft purple
      "#38BDF8", // Sky blue
      "#F43F5E"  // Rose
    ];

    const darkColors = [
      "#10B981", // Neon emerald
      "#34D399", // Bright mint
      "#FBBF24", // Vibrant gold
      "#FDE047", // Electric yellow
      "#EC4899", // Neon pink
      "#F43F5E", // Bright magenta
      "#C084FC", // Neon purple
      "#38BDF8"  // Electric cyan
    ];

    const colors = darkMode ? darkColors : lightColors;

    // CONTINUOUS ADDITIVE PARTICLE POOL:
    // Particles from all bursts coexist here. New bursts simply push into this pool.
    // Existing particles are never wiped out or truncated.
    const particles: Particle[] = [];

    // 5 distinct burst waves scheduled across the first 2.0s for 'all', or 5 rhythmic cannon bursts for 'cannon-only', or a single burst for 'top-only'
    const burstSchedule = mode === "top-only"
      ? [{ delay: 0, count: 28, waveIndex: 0 }]
      : mode === "cannon-only"
      ? [
          { delay: 0, count: 42, waveIndex: 0 },
          { delay: 440, count: 38, waveIndex: 1 },
          { delay: 880, count: 38, waveIndex: 2 },
          { delay: 1320, count: 34, waveIndex: 3 },
          { delay: 1760, count: 34, waveIndex: 4 }
        ]
      : [
          { delay: 0, count: 40, waveIndex: 0 },
          { delay: 480, count: 36, waveIndex: 1 },
          { delay: 960, count: 36, waveIndex: 2 },
          { delay: 1440, count: 32, waveIndex: 3 },
          { delay: 1920, count: 32, waveIndex: 4 }
        ];

    const firedBursts = new Set<number>();

    // Spawn corner cannons positioned at bottom-left and bottom-right of the modal card
    const spawnCornerCannons = (count: number, currentTime: number) => {
      const cardHalfWidth = Math.min(width * 0.44, 250);
      const leftOriginX = Math.max(16, width * 0.5 - cardHalfWidth - 16);
      const rightOriginX = Math.min(width - 16, width * 0.5 + cardHalfWidth + 16);
      const cannonY = Math.min(height * 0.88, height * 0.5 + 230);

      for (let i = 0; i < count; i++) {
        const fromLeft = i % 2 === 0;
        const originX = fromLeft ? leftOriginX : rightOriginX;
        const originY = cannonY;

        // Angle: Upward and inward so particles arc across and frame the modal card
        // Left cannon shoots up-right (~-63°); Right cannon shoots up-left (~-117°)
        const baseAngle = fromLeft ? -Math.PI * 0.36 : -Math.PI * 0.64;
        const angleSpread = (Math.random() - 0.5) * 0.36;
        const angle = baseAngle + angleSpread;
        const speed = 11 + Math.random() * 7;

        const shapeRand = Math.random();
        particles.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2.8,
          size: 5 + Math.random() * 6.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          vRotation: (Math.random() - 0.5) * 14,
          shape: shapeRand > 0.4 ? "rect" : shapeRand > 0.15 ? "circle" : "spark",
          tiltAngle: Math.random() * Math.PI,
          tiltAngleInc: (Math.random() * 0.08) + 0.04,
          bornAt: currentTime,
          lifespan: 1400 + Math.random() * 450 // Each particle lives 1.4s to 1.85s independently
        });
      }
    };

    // Spawn celebratory streamers and particles cascading gracefully from the top viewport edge
    const spawnTopCascade = (count: number, currentTime: number) => {
      for (let i = 0; i < count; i++) {
        const originX = Math.random() * width;
        const originY = -12 - Math.random() * 28;
        const isStreamer = Math.random() < 0.45;

        // Gentle downward velocity with gentle horizontal sway
        const vx = (Math.random() - 0.5) * 2.2;
        const vy = isStreamer ? 1.6 + Math.random() * 1.8 : 2.2 + Math.random() * 2.6;

        particles.push({
          x: originX,
          y: originY,
          vx,
          vy,
          size: isStreamer ? 7 + Math.random() * 6 : 5 + Math.random() * 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          vRotation: (Math.random() - 0.5) * 8,
          shape: isStreamer ? "streamer" : Math.random() > 0.4 ? "rect" : "circle",
          tiltAngle: Math.random() * Math.PI,
          tiltAngleInc: (Math.random() * 0.06) + 0.03,
          bornAt: currentTime,
          lifespan: 2600 + Math.random() * 900 // Float gracefully across the screen
        });
      }
    };

    const dispose = () => {
      if (isDisposed) return;
      isDisposed = true;
      cancelAnimationFrame(animFrameId);
      particles.length = 0;
      if (ctx) {
        ctx.clearRect(0, 0, width, height);
      }
      onCompleteRef.current?.();
    };

    // Safety timer adjusted for mode
    const safetyDuration = mode === "cannon-only" ? 4200 : mode === "top-only" ? 3800 : 5200;
    const safetyTimer = setTimeout(() => {
      dispose();
    }, safetyDuration);

    // Cancel immediately if tab is backgrounded
    const handleVisibilityChange = () => {
      if (document.hidden) {
        dispose();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const render = (now: number) => {
      if (isDisposed) return;

      const elapsed = now - startTime;

      // Check for scheduled dual-corner bursts and top streamers and push into the continuous pool
      burstSchedule.forEach((burst) => {
        if (elapsed >= burst.delay && !firedBursts.has(burst.waveIndex)) {
          firedBursts.add(burst.waveIndex);
          if (mode !== "top-only") {
            spawnCornerCannons(burst.count, now);
            onBurstRef.current?.(burst.waveIndex);
          }
          if (mode !== "cannon-only") {
            spawnTopCascade(mode === "top-only" ? 36 : 24, now);
          }
        }
      });

      ctx.clearRect(0, 0, width, height);

      // Render active particles from the continuous pool
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        const age = now - p.bornAt;

        // Individual lifespan check: each particle only leaves when its personal flight finishes
        if (age > p.lifespan) {
          particles.splice(i, 1);
          continue;
        }

        // Smooth individual particle fade-out during the last 25% of its lifespan
        const pAlpha = age > p.lifespan * 0.75 
          ? Math.max(0, 1 - (age - p.lifespan * 0.75) / (p.lifespan * 0.25)) 
          : 1;

        // Physics: individual trajectory integration
        p.x += p.vx;
        p.y += p.vy;
        if (p.shape === "streamer") {
          p.vy = Math.min(p.vy + 0.05, 3.6); // Gentle terminal fall speed for streamers
          p.vx *= 0.99;
        } else {
          p.vy += 0.24; // Gravity
          p.vx *= 0.984; // Air drag
          p.vy *= 0.984;
        }
        p.rotation += p.vRotation;
        p.tiltAngle += p.tiltAngleInc;

        const xOffset = Math.sin(p.tiltAngle) * 3;

        ctx.save();
        ctx.globalAlpha = pAlpha;
        ctx.translate(p.x + xOffset, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.45, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === "spark") {
          ctx.beginPath();
          const s = p.size * 0.6;
          ctx.moveTo(0, -s);
          ctx.lineTo(s * 0.3, 0);
          ctx.lineTo(0, s);
          ctx.lineTo(-s * 0.3, 0);
          ctx.closePath();
          ctx.fill();
        } else if (p.shape === "streamer") {
          const tiltScale = Math.cos(p.tiltAngle);
          ctx.scale(tiltScale, 1);
          ctx.fillRect(-p.size * 0.35, -p.size * 1.5, p.size * 0.7, p.size * 3.0);
        } else {
          const tiltScale = Math.cos(p.tiltAngle);
          ctx.scale(1, tiltScale);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        }

        ctx.restore();
      }

      // If all scheduled bursts have fired and all particles have completed their lifespans, finish
      if (firedBursts.size === burstSchedule.length && particles.length === 0) {
        dispose();
      } else {
        animFrameId = requestAnimationFrame(render);
      }
    };

    animFrameId = requestAnimationFrame(render);

    return () => {
      clearTimeout(safetyTimer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      isDisposed = true;
      cancelAnimationFrame(animFrameId);
      if (ctx) {
        ctx.clearRect(0, 0, width, height);
      }
    };
  }, [darkMode, mode]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[100050]"
      style={{ touchAction: "none" }}
    />
  );
};
