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
    const startTime = performance.now();
    const totalDuration = 2400; // 2.4 seconds total celebratory sequence

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

    // Burst timestamps relative to startTime (in ms)
    const burstSchedule = [
      { delay: 0, count: 50, type: "dual" },         // Burst 1: Dual cannons from left & right
      { delay: 600, count: 40, type: "high-cross" }, // Burst 2: High angled cross-burst
      { delay: 1200, count: 35, type: "center" }     // Burst 3: Celebratory center flare
    ];

    const firedBursts = new Set<number>();

    const spawnBurst = (type: string, count: number, currentTime: number) => {
      for (let i = 0; i < count; i++) {
        let originX: number;
        let originY: number;
        let angle: number;
        let speed: number;

        if (type === "dual") {
          const fromLeft = i % 2 === 0;
          originX = fromLeft ? width * 0.18 : width * 0.82;
          originY = height * 0.48;
          angle = fromLeft
            ? -Math.PI / 3 + (Math.random() - 0.5) * 0.85
            : (-2 * Math.PI) / 3 + (Math.random() - 0.5) * 0.85;
          speed = 8 + Math.random() * 9;
        } else if (type === "high-cross") {
          const fromLeft = i % 2 === 0;
          originX = fromLeft ? width * 0.28 : width * 0.72;
          originY = height * 0.38;
          angle = fromLeft
            ? -Math.PI / 3.5 + (Math.random() - 0.5) * 0.75
            : (-2.2 * Math.PI) / 3.5 + (Math.random() - 0.5) * 0.75;
          speed = 7 + Math.random() * 8;
        } else {
          // Center umbrella burst
          originX = width * 0.50;
          originY = height * 0.35;
          angle = Math.random() * Math.PI * 2;
          speed = 4 + Math.random() * 8;
        }

        const shapeRand = Math.random();
        particles.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (type === "center" ? 1.5 : 3),
          size: 5 + Math.random() * 6.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          vRotation: (Math.random() - 0.5) * 14,
          shape: shapeRand > 0.4 ? "rect" : shapeRand > 0.15 ? "circle" : "spark",
          tiltAngle: Math.random() * Math.PI,
          tiltAngleInc: (Math.random() * 0.08) + 0.04,
          bornAt: currentTime,
          lifespan: 1400 + Math.random() * 400
        });
      }
    };

    const render = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / totalDuration);

      // Check for scheduled bursts
      burstSchedule.forEach((burst, idx) => {
        if (elapsed >= burst.delay && !firedBursts.has(idx)) {
          firedBursts.add(idx);
          spawnBurst(burst.type, burst.count, now);
          if (onBurst) {
            try { onBurst(idx); } catch (e) {}
          }
        }
      });

      // Fade out overall sequence smoothly over the last 600ms
      const globalAlpha = progress > 0.75 ? Math.max(0, 1 - (progress - 0.75) / 0.25) : 1;

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
        p.vy += 0.28; // Gravity
        p.vx *= 0.985; // Air drag
        p.vy *= 0.985;
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
        ctx.clearRect(0, 0, width, height);
        if (onComplete) {
          onComplete();
        }
      }
    };

    animFrameId = requestAnimationFrame(render);

    // Strict cleanup on unmount: immediately cancel animation and wipe canvas
    return () => {
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
