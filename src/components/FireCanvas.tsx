"use client";
import { useEffect, useRef } from "react";

const W = 120;
const H = 70;
const COOLING = 18;

// Gold/fire palette: black → deep red → orange → gold → white-yellow
function buildPalette(): Uint32Array {
  const p = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let r = 0, g = 0, b = 0;
    if (i < 60) {
      r = Math.round((i / 60) * 180);
    } else if (i < 120) {
      r = 180 + Math.round(((i - 60) / 60) * 75);
      g = Math.round(((i - 60) / 60) * 80);
    } else if (i < 180) {
      r = 255;
      g = 80 + Math.round(((i - 120) / 60) * 140);
    } else {
      r = 255;
      g = 220 + Math.round(((i - 180) / 76) * 35);
      b = Math.round(((i - 180) / 76) * 180);
    }
    // ABGR format for ImageData (little-endian)
    p[i] = (255 << 24) | (b << 16) | (g << 8) | r;
  }
  return p;
}

export default function FireCanvas({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    if (!ctx) return;

    const palette = buildPalette();
    const fire = new Float32Array(W * H);
    const imageData = ctx.createImageData(W, H);
    const buf = new Uint32Array(imageData.data.buffer);

    let raf: number;

    function tick() {
      // Seed bottom 2 rows with intense heat, randomly patchy for natural look
      for (let x = 0; x < W; x++) {
        const heat = Math.random() > 0.08 ? 220 + Math.random() * 35 : 80 + Math.random() * 60;
        fire[(H - 1) * W + x] = heat;
        fire[(H - 2) * W + x] = heat * 0.92;
      }

      // Propagate fire upward with cooling
      for (let y = 0; y < H - 2; y++) {
        for (let x = 0; x < W; x++) {
          const s =
            fire[(y + 1) * W + Math.max(0, x - 1)] +
            fire[(y + 1) * W + x] +
            fire[(y + 1) * W + Math.min(W - 1, x + 1)] +
            fire[(y + 2) * W + x];
          fire[y * W + x] = Math.max(0, s / 4 - Math.random() * COOLING);
        }
      }

      // Write pixels
      for (let i = 0; i < W * H; i++) {
        const v = Math.min(255, Math.floor(fire[i]));
        const alpha = v < 8 ? 0 : Math.min(255, v * 2.5);
        buf[i] = (alpha << 24) | (palette[v] & 0x00ffffff);
      }
      ctx.putImageData(imageData, 0, 0);

      raf = requestAnimationFrame(tick);
    }

    tick();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      className={className}
      style={{ imageRendering: "pixelated", ...style }}
    />
  );
}
