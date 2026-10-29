import React, { useEffect, useRef } from "react";

interface ConfettiBurstProps {
  darkMode?: boolean;
  onComplete?: () => void;
  onBurst?: (burstIndex: number) => void;
  mode?: "all" | "top-only" | "cannon-only" | "top-two-waves";
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
  layer?: "background" | "primary";
  swayAngle?: number;
  source?: "cannon" | "cascade";
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

    // Distinct burst waves scheduled across timeline:
    // 'top-two-waves': Wave 1 fires corner cannons + top streamers; Wave 2 triggers at exact 1400ms halfway mark
    const burstSchedule = mode === "top-only"
      ? [{ delay: 0, count: 28, waveIndex: 0 }]
      : mode === "top-two-waves"
      ? [
          { delay: 0, count: 42, waveIndex: 0 },
          { delay: 1400, count: 38, waveIndex: 1 }
        ]
      : mode === "cannon-only"
      ? [
          { delay: 0, count: 42, waveIndex: 0 },
          { delay: 360, count: 38, waveIndex: 1 },
          { delay: 720, count: 36, waveIndex: 2 },
          { delay: 1080, count: 32, waveIndex: 3 }
        ]
      : [
          { delay: 0, count: 40, waveIndex: 0 },
          { delay: 480, count: 36, waveIndex: 1 },
          { delay: 960, count: 36, waveIndex: 2 },
          { delay: 1440, count: 32, waveIndex: 3 },
          { delay: 1920, count: 32, waveIndex: 4 }
        ];

    const firedBursts = new Set<number>();

    // Spawn corner cannons shooting upward from { x: 0.15, y: 0.95 } and { x: 0.85, y: 0.95 }
    const spawnCornerCannons = (count: number, currentTime: number) => {
      const leftOriginX = width * 0.15;
      const rightOriginX = width * 0.85;
      const cannonY = height * 0.72;

      for (let i = 0; i < count; i++) {
        const fromLeft = i % 2 === 0;
        const originX = fromLeft ? leftOriginX : rightOriginX;
        const originY = cannonY;

        // Angle: Upward and inward so particles arc diagonally and converge at top-center (0.50·W, 0.35·H)
        // Left cannon shoots up-right (-73.5° / -0.408π); Right cannon shoots up-left (-106.5° / -0.592π)
        const baseAngle = fromLeft ? -Math.PI * 0.408 : -Math.PI * 0.592;
        const angleSpread = (Math.random() - 0.5) * 0.20;
        const angle = baseAngle + angleSpread;
        const speed = 16 + Math.random() * 4;

        const shapeRand = Math.random();
        particles.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 5 + Math.random() * 6.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          vRotation: (Math.random() - 0.5) * 14,
          shape: shapeRand > 0.4 ? "rect" : shapeRand > 0.15 ? "circle" : "spark",
          tiltAngle: Math.random() * Math.PI,
          tiltAngleInc: (Math.random() * 0.08) + 0.04,
          bornAt: currentTime,
          lifespan: 1800 + Math.random() * 500, // Balanced flight to reach peak and gracefully float down
          source: "cannon"
        });
      }
    };

    // Neutralized: Background micro-pellets disabled to keep the solved grid pristine and uncluttered
    const spawnBackgroundVeil = (_currentTime: number) => {
      // Discarded micro-pellets: prevents visual clutter over the completed board
    };

    // Spawn celebratory streamers and particles cascading gracefully from the top viewport edge
    const spawnTopCascade = (count: number, currentTime: number) => {
      for (let i = 0; i < count; i++) {
        const originX = Math.random() * width;
        const originY = -20 - Math.random() * 20; // Strictly -20px to -40px off-screen
        const shapeRand = Math.random();
        const isBall = shapeRand < 0.28; // Circles or sparks
        const isStreamer = !isBall && shapeRand > 0.65;
        const shape: Particle["shape"] = isBall 
          ? (Math.random() > 0.5 ? "circle" : "spark") 
          : (isStreamer ? "streamer" : "rect");

        // Initial downward drop impulse: balls drop slightly faster to establish leading ~10% delta
        const vx = (Math.random() - 0.5) * 2.4;
        const vy = isBall ? 5.2 + Math.random() * 1.6 : 4.0 + Math.random() * 1.4;

        particles.push({
          x: originX,
          y: originY,
          vx,
          vy,
          size: isStreamer ? 7 + Math.random() * 6 : 5 + Math.random() * 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          vRotation: (Math.random() - 0.5) * 8,
          shape,
          tiltAngle: Math.random() * Math.PI,
          tiltAngleInc: (Math.random() * 0.06) + 0.03,
          bornAt: currentTime,
          lifespan: 3600 + Math.random() * 1400, // Float gracefully across the screen
          layer: "primary",
          swayAngle: Math.random() * Math.PI * 2,
          source: "cascade"
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

    // Safety timer adjusted for mode (extended to 7500ms for full cinematic celebration lifecycle)
    const safetyDuration = mode === "cannon-only" 
      ? 4200 
      : mode === "top-two-waves"
      ? 7500
      : mode === "top-only" 
      ? 4800 
      : 7500;
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
          if (burst.waveIndex === 0) {
            spawnBackgroundVeil(now);
          }
          // Corner cannons fire for 'all', 'cannon-only', and on Wave 1 of 'top-two-waves'
          if (mode !== "top-only" && (mode !== "top-two-waves" || burst.waveIndex === 0)) {
            spawnCornerCannons(burst.count, now);
            onBurstRef.current?.(burst.waveIndex);
          }
          if (mode !== "cannon-only") {
            spawnTopCascade(mode === "top-only" || mode === "top-two-waves" ? 42 : 32, now);
          }
        }
      });

      ctx.clearRect(0, 0, width, height);

      const decelThreshold = height * 0.25;

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

        // Physics: Viewport-relative deceleration zone & terminal speed caps
        if (p.source === "cannon") {
          // Ballistic Cannon Flight: arc diagonally upward toward top-center banner (0.50·W, 0.35·H)
          p.vy += 0.38; // Gravitational acceleration
          p.vx *= 0.985; // Air drag
          p.x += p.vx;
          p.y += p.vy;
        } else if (p.layer === "background") {
          p.vy = 1.4;
          p.swayAngle = (p.swayAngle || 0) + 0.035;
          p.x += p.vx + Math.sin(p.swayAngle) * 0.8;
          p.y += p.vy;
        } else if (p.shape === "circle" || p.shape === "spark") {
          // Heavy Circles / Stars (Balls):
          // Rapidly soak downward drop momentum within top quarter (y <= height * 0.25)
          // Lock to terminal float speed vy = 2.8px/frame
          if (p.y <= decelThreshold) {
            p.vy = Math.max(2.8, p.vy * 0.93);
          } else {
            p.vy = 2.8;
          }
          p.vx *= 0.985;
          p.x += p.vx;
          p.y += p.vy;
        } else {
          // Paper Ribbons / Rectangles / Streamers:
          // Rapidly soak downward momentum within top quarter (y <= height * 0.25)
          // Lock to terminal float speed vy = 2.1px/frame
          if (p.y <= decelThreshold) {
            p.vy = Math.max(2.1, p.vy * 0.90);
          } else {
            p.vy = 2.1;
          }
          p.vx *= 0.985;
          p.swayAngle = (p.swayAngle || 0) + 0.045;
          p.x += p.vx + Math.sin(p.swayAngle) * 0.6;
          p.y += p.vy;
        }

        p.rotation += p.vRotation;
        p.tiltAngle += p.tiltAngleInc;

        const xOffset = Math.sin(p.tiltAngle) * 3;

        ctx.save();
        const baseAlpha = p.layer === "background" ? 0.45 : 1.0;
        ctx.globalAlpha = pAlpha * baseAlpha;
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
      className="fixed inset-0 pointer-events-none z-[100]"
      style={{ touchAction: "none" }}
    />
  );
};
