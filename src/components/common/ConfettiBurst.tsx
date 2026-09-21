import React, { useEffect, useRef } from "react";

interface ConfettiBurstProps {
  darkMode?: boolean;
  onComplete?: () => void;
  onBurst?: (burstIndex: number) => void;
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
  shape: "rect" | "circle" | "spark";
  tiltAngle: number;
  tiltAngleInc: number;
  bornAt: number;
  lifespan: number;
}

export const ConfettiBurst: React.FC<ConfettiBurstProps> = ({ darkMode = false, onComplete, onBurst }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrameId: number;
    let isDisposed = false;
    const startTime = performance.now();
    const totalDuration = 3500; // Strict 3.5 seconds maximum sequence duration

    // Size canvas to viewport
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    // Color palettes tuned specifically for light and dark modes
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
    const particles: Particle[] = [];

    // Exactly 5 crisp burst waves over 3.5 seconds total
    const burstSchedule = [
      { delay: 0, count: 42, waveIndex: 0 },
      { delay: 650, count: 38, waveIndex: 1 },
      { delay: 1300, count: 38, waveIndex: 2 },
      { delay: 1950, count: 34, waveIndex: 3 },
      { delay: 2600, count: 34, waveIndex: 4 }
    ];

    const firedBursts = new Set<number>();

    // Spawn dual corner cannons strictly positioned at bottom-left and bottom-right of the modal card
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
        const angleSpread = (Math.random() - 0.5) * 0.38;
        const angle = baseAngle + angleSpread;
        const speed = 10.5 + Math.random() * 7.5;

        const shapeRand = Math.random();
        particles.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2.5,
          size: 5 + Math.random() * 6.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          vRotation: (Math.random() - 0.5) * 14,
          shape: shapeRand > 0.4 ? "rect" : shapeRand > 0.15 ? "circle" : "spark",
          tiltAngle: Math.random() * Math.PI,
          tiltAngleInc: (Math.random() * 0.08) + 0.04,
          bornAt: currentTime,
          lifespan: 1300 + Math.random() * 450
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
      if (onComplete) {
        onComplete();
      }
    };

    // Strict 3.5-second maximum lifespan timer safety valve
    const cleanupTimer = setTimeout(() => {
      dispose();
    }, 3500);

    // Cancel animation immediately if tab is backgrounded
    const handleVisibilityChange = () => {
      if (document.hidden) {
        dispose();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const render = (now: number) => {
      if (isDisposed) return;

      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / totalDuration);

      // Check for scheduled dual-corner bursts
      burstSchedule.forEach((burst) => {
        if (elapsed >= burst.delay && !firedBursts.has(burst.waveIndex)) {
          firedBursts.add(burst.waveIndex);
          spawnCornerCannons(burst.count, now);
          if (onBurst) {
            try { onBurst(burst.waveIndex); } catch (e) {}
          }
        }
      });

      // Fade out overall sequence smoothly over the last 600ms
      const globalAlpha = progress > 0.78 ? Math.max(0, 1 - (progress - 0.78) / 0.22) : 1;

      ctx.clearRect(0, 0, width, height);

      // Render active particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        const age = now - p.bornAt;
        if (age > p.lifespan) {
          particles.splice(i, 1);
          continue;
        }

        // Particle specific fadeout near end of individual life
        const pAlpha = age > p.lifespan * 0.7 
          ? Math.max(0, 1 - (age - p.lifespan * 0.7) / (p.lifespan * 0.3)) 
          : 1;

        // Physics
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.26; // Gentle gravity
        p.vx *= 0.984; // Air drag
        p.vy *= 0.984;
        p.rotation += p.vRotation;
        p.tiltAngle += p.tiltAngleInc;

        const xOffset = Math.sin(p.tiltAngle) * 3;

        ctx.save();
        ctx.globalAlpha = globalAlpha * pAlpha;
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
        } else {
          const tiltScale = Math.cos(p.tiltAngle);
          ctx.scale(1, tiltScale);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        }

        ctx.restore();
      }

      if (progress < 1) {
        animFrameId = requestAnimationFrame(render);
      } else {
        dispose();
      }
    };

    animFrameId = requestAnimationFrame(render);

    // Strict cleanup on unmount: immediately cancel animation and wipe canvas
    return () => {
      clearTimeout(cleanupTimer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      isDisposed = true;
      cancelAnimationFrame(animFrameId);
      if (ctx) {
        ctx.clearRect(0, 0, width, height);
      }
    };
  }, [darkMode, onComplete, onBurst]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[100050]"
      style={{ touchAction: "none" }}
    />
  );
};
