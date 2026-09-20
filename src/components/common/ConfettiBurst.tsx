import React, { useEffect, useRef } from "react";

interface ConfettiBurstProps {
  darkMode?: boolean;
  onComplete?: () => void;
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
}

export const ConfettiBurst: React.FC<ConfettiBurstProps> = ({ darkMode = false, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrameId: number;
    const startTime = performance.now();
    const duration = 1800; // 1.8 seconds total celebratory burst

    // Size canvas to viewport
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    // Color palettes tuned specifically for light and dark modes
    const lightColors = [
      "#34D399", // Emerald
      "#10B981", // Deep emerald
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

    // Create 75 diverse confetti particles bursting from dual origins
    const particles: Particle[] = [];
    const particleCount = 80;

    for (let i = 0; i < particleCount; i++) {
      // 50% left cannon, 50% right cannon
      const fromLeft = i % 2 === 0;
      const originX = fromLeft ? width * 0.25 : width * 0.75;
      const originY = height * 0.45;

      const angle = fromLeft
        ? -Math.PI / 3 + (Math.random() - 0.5) * 0.9 // angled right and up
        : (-2 * Math.PI) / 3 + (Math.random() - 0.5) * 0.9; // angled left and up

      const speed = 7 + Math.random() * 9;
      const shapeRand = Math.random();

      particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2, // extra initial upward kick
        size: 5 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vRotation: (Math.random() - 0.5) * 12,
        shape: shapeRand > 0.4 ? "rect" : shapeRand > 0.15 ? "circle" : "spark",
        tiltAngle: Math.random() * Math.PI,
        tiltAngleInc: (Math.random() * 0.08) + 0.04
      });
    }

    const render = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Fade out smoothly during the last 30% of the duration
      const alpha = progress > 0.7 ? Math.max(0, 1 - (progress - 0.7) / 0.3) : 1;

      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        // Physics
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.28; // Gravity
        p.vx *= 0.985; // Air resistance
        p.vy *= 0.985;
        p.rotation += p.vRotation;
        p.tiltAngle += p.tiltAngleInc;

        // 3D fluttering ribbon oscillation
        const xOffset = Math.sin(p.tiltAngle) * 3;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x + xOffset, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.45, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === "spark") {
          // Small 4-point star spark
          ctx.beginPath();
          const s = p.size * 0.6;
          ctx.moveTo(0, -s);
          ctx.lineTo(s * 0.3, 0);
          ctx.lineTo(0, s);
          ctx.lineTo(-s * 0.3, 0);
          ctx.closePath();
          ctx.fill();
        } else {
          // Fluttering rectangle
          const tiltScale = Math.cos(p.tiltAngle);
          ctx.scale(1, tiltScale);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        }

        ctx.restore();
      });

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

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [darkMode, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[100050]"
      style={{ touchAction: "none" }}
    />
  );
};
