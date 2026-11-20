import React, { useEffect, useRef } from "react";

export interface BlockSyncConfettiRainProps {
  active: boolean;
  burstKey: number;
  isDarkMode: boolean;
  intensity?: "full" | "podium";
}

interface PaletteColor {
  front: string;
  back: string;
}

const LIGHT_CRYSTAL_PALETTE: readonly PaletteColor[] = [
  { front: "#38BDF8", back: "#0284C7" },
  { front: "#4ADE80", back: "#16A34A" },
  { front: "#FACC15", back: "#CA8A04" },
  { front: "#F472B6", back: "#DB2777" },
  { front: "#A855F7", back: "#7E22CE" },
  { front: "#FB7185", back: "#E11D48" },
  { front: "#FFFFFF", back: "#CBD5E1" },
];

const DARK_CRYSTAL_PALETTE: readonly PaletteColor[] = [
  { front: "#7DD3FC", back: "#0EA5E9" },
  { front: "#6EE7B7", back: "#10B981" },
  { front: "#FDE047", back: "#EAB308" },
  { front: "#F9A8D4", back: "#EC4899" },
  { front: "#D8B4FE", back: "#A855F7" },
  { front: "#FDA4AF", back: "#F43F5E" },
  { front: "#F8FAFC", back: "#94A3B8" },
];

interface CrystalFlake {
  x: number;
  y: number;
  z: number;
  baseWidth: number;
  baseHeight: number;
  isGlintShape: boolean;
  vy: number;
  vxDrift: number;
  swayAmp: number;
  swayFreq: number;
  swayPhase: number;
  rotZ: number;
  rotZSpeed: number;
  phaseX: number;
  phaseXSpeed: number;
  palette: PaletteColor;
  baseAlpha: number;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export const BlockSyncConfettiRain: React.FC<BlockSyncConfettiRainProps> = ({
  active,
  burstKey,
  isDarkMode,
  intensity = "full",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active || prefersReducedMotion()) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const paletteSet = isDarkMode ? DARK_CRYSTAL_PALETTE : LIGHT_CRYSTAL_PALETTE;
    const totalTarget = intensity === "podium" ? 110 : 220;
    const emitWindowMs = intensity === "podium" ? 1800 : 2800;

    let viewportW = Math.max(320, window.innerWidth || 390);
    let viewportH = Math.max(480, window.innerHeight || 844);
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const syncCanvasSize = () => {
      viewportW = Math.max(320, window.innerWidth || 390);
      viewportH = Math.max(480, window.innerHeight || 844);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(viewportW * dpr);
      canvas.height = Math.round(viewportH * dpr);
      canvas.style.width = `${viewportW}px`;
      canvas.style.height = `${viewportH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    syncCanvasSize();
    window.addEventListener("resize", syncCanvasSize);

    const flakes: CrystalFlake[] = [];
    let spawnedCount = 0;

    const spawnFlake = (): CrystalFlake => {
      // z in [0.45 .. 1.65]: far background tiny slips -> near foreground larger crisp ribbons
      const z = 0.45 + Math.random() * 1.2;
      const depthNorm = (z - 0.45) / 1.2;
      const isGlintShape = Math.random() < 0.25;
      const baseWidth = isGlintShape
        ? 4.5 + depthNorm * 5.2
        : 4.5 + depthNorm * 6.5;
      const baseHeight = isGlintShape
        ? baseWidth
        : 8.0 + depthNorm * 11.0;

      const vy = 115 + depthNorm * 155 + Math.random() * 35;
      return {
        x: -20 + Math.random() * (viewportW + 40),
        y: -15 - Math.random() * 35,
        z,
        baseWidth,
        baseHeight,
        isGlintShape,
        vy,
        vxDrift: (Math.random() - 0.5) * 18,
        swayAmp: 10 + Math.random() * 18 * (0.6 + depthNorm * 0.6),
        swayFreq: 1.4 + Math.random() * 1.8,
        swayPhase: Math.random() * Math.PI * 2,
        rotZ: Math.random() * Math.PI * 2,
        rotZSpeed: (Math.random() - 0.5) * 3.6,
        phaseX: Math.random() * Math.PI * 2,
        phaseXSpeed: (2.8 + Math.random() * 3.8) * (Math.random() < 0.5 ? -1 : 1),
        palette: paletteSet[Math.floor(Math.random() * paletteSet.length)],
        baseAlpha: 0.72 + depthNorm * 0.26,
      };
    };

    // Seed gentle initial leading curtain across the upper band immediately
    const initialSeed = Math.min(18, Math.round(totalTarget * 0.08));
    for (let i = 0; i < initialSeed; i += 1) {
      flakes.push(spawnFlake());
      spawnedCount += 1;
    }

    let rafId = 0;
    let startAt: number | null = null;
    let lastAt: number | null = null;
    let cancelled = false;

    const renderFrame = (now: number) => {
      if (cancelled) return;
      if (startAt === null) {
        startAt = now;
        lastAt = now;
      }

      const elapsedMs = now - startAt;
      const rawDtMs = lastAt !== null ? now - lastAt : 16.67;
      lastAt = now;
      const dt = Math.min(33, Math.max(0, rawDtMs)) / 1000;

      // Stream remaining particles continuously across the emitter window
      if (spawnedCount < totalTarget && elapsedMs <= emitWindowMs) {
        const emitProgress = Math.min(1, elapsedMs / emitWindowMs);
        // Smooth ease-out taper toward the end of emission window
        const desiredCount = Math.min(
          totalTarget,
          Math.floor(totalTarget * (emitProgress * (1.18 - 0.18 * emitProgress)))
        );
        while (spawnedCount < desiredCount) {
          flakes.push(spawnFlake());
          spawnedCount += 1;
        }
      } else if (spawnedCount < totalTarget && elapsedMs > emitWindowMs) {
        while (spawnedCount < totalTarget) {
          flakes.push(spawnFlake());
          spawnedCount += 1;
        }
      }

      ctx.clearRect(0, 0, viewportW, viewportH);

      const elapsedSec = elapsedMs / 1000;
      const bottomExitY = viewportH + 40;

      for (let i = flakes.length - 1; i >= 0; i -= 1) {
        const f = flakes[i];
        f.y += f.vy * dt;
        const swayVelocity =
          Math.cos(elapsedSec * f.swayFreq + f.swayPhase) * f.swayAmp;
        f.x += (f.vxDrift + swayVelocity) * dt;
        f.rotZ += f.rotZSpeed * dt;
        f.phaseX += f.phaseXSpeed * dt;

        if (f.y > bottomExitY) {
          flakes.splice(i, 1);
          continue;
        }

        const fallProgress = Math.min(1, Math.max(0, (f.y + 40) / (viewportH + 60)));
        const perspectiveScale = 1 + fallProgress * 0.22 * f.z;
        const cosFlip = Math.cos(f.phaseX);
        const absFlip = Math.abs(cosFlip);
        const edgeFade =
          f.y > viewportH - 90 ? Math.max(0, (bottomExitY - f.y) / 130) : 1;

        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.rotZ);
        ctx.scale(perspectiveScale, perspectiveScale * Math.max(0.14, absFlip));

        ctx.globalAlpha = f.baseAlpha * edgeFade;
        ctx.fillStyle = cosFlip >= 0 ? f.palette.front : f.palette.back;

        const w = f.baseWidth;
        const h = f.baseHeight;
        if (f.isGlintShape) {
          ctx.rotate(Math.PI / 4);
          ctx.fillRect(-w * 0.5, -h * 0.5, w, h);
        } else {
          ctx.fillRect(-w * 0.5, -h * 0.5, w, h);
        }

        // Crisp subtle crystal edge-glint when turning edge-on
        if (absFlip < 0.22) {
          ctx.globalAlpha = (isDarkMode ? 0.85 : 0.72) * edgeFade;
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(-w * 0.5, -Math.max(1, h * 0.16), w, Math.max(1.5, h * 0.32));
        }

        ctx.restore();
      }

      if (spawnedCount < totalTarget || flakes.length > 0) {
        rafId = window.requestAnimationFrame(renderFrame);
      } else {
        ctx.clearRect(0, 0, viewportW, viewportH);
      }
    };

    rafId = window.requestAnimationFrame(renderFrame);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", syncCanvasSize);
      if (rafId) window.cancelAnimationFrame(rafId);
      ctx.clearRect(0, 0, viewportW, viewportH);
    };
  }, [active, burstKey, isDarkMode, intensity]);

  if (!active || prefersReducedMotion()) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 z-[10050] pointer-events-none"
    />
  );
};
