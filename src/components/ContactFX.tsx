"use client";
import { useEffect, useRef, useState } from "react";

// Shared "heat" for the Contact page: every keystroke and click adds energy,
// which the embers, the record and the sound wave all react to, then it cools off.
const EVENT = "lb:heat";
export function pulse(amount = 1) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(EVENT, { detail: amount }));
}

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Keeps a decaying energy level (0..1+) fed by pulse()
function useHeat() {
  const heat = useRef(0);
  useEffect(() => {
    const on = (e: Event) => { heat.current = Math.min(2.5, heat.current + 0.18 * ((e as CustomEvent).detail ?? 1)); };
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, []);
  return heat;
}

/* ── Rising embers behind the page ── */
export function Embers() {
  const ref = useRef<HTMLCanvasElement>(null);
  const heat = useHeat();
  useEffect(() => {
    if (reduced()) return;
    const canvas = ref.current!;
    const c = canvas.getContext("2d")!;
    type P = { x: number; y: number; vx: number; vy: number; r: number; life: number; max: number; hue: number };
    let parts: P[] = [], raf = 0, w = 0, h = 0, last = performance.now();
    const dpr = Math.min(2, devicePixelRatio || 1);
    const resize = () => { w = canvas.clientWidth; h = canvas.clientHeight; canvas.width = w * dpr; canvas.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); };
    resize(); window.addEventListener("resize", resize);
    const spawn = (burst = false) => {
      parts.push({
        x: burst ? w * (0.3 + Math.random() * 0.6) : Math.random() * w,
        y: burst ? h * (0.4 + Math.random() * 0.3) : h + 10,
        vx: (Math.random() - 0.5) * (burst ? 2.4 : 0.4),
        vy: -(0.4 + Math.random() * (burst ? 3.2 : 1.1)),
        r: 0.6 + Math.random() * 2.2, life: 0, max: 220 + Math.random() * 260, hue: 35 + Math.random() * 15,
      });
    };
    const onBurst = (e: Event) => { if (((e as CustomEvent).detail ?? 0) >= 5) for (let i = 0; i < 60; i++) spawn(true); };
    window.addEventListener(EVENT, onBurst);
    const tick = (t: number) => {
      const dt = Math.min(3, (t - last) / 16.7); last = t;
      heat.current *= Math.pow(0.985, dt);
      const rate = 0.2 + Math.min(1.2, heat.current) * 0.9;
      for (let n = rate * dt; n > 0; n--) if (Math.random() < n) spawn();
      c.clearRect(0, 0, w, h);
      c.globalCompositeOperation = "lighter";
      parts = parts.filter((p) => {
        p.life += dt;
        p.x += (p.vx + Math.sin((p.life + p.r * 40) / 30) * 0.35) * dt;
        p.y += p.vy * dt * (1 + heat.current * 0.6);
        const k = 1 - p.life / p.max;
        if (k <= 0 || p.y < -20) return false;
        const a = Math.min(1, p.life / 20) * k;
        const g = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        g.addColorStop(0, `hsla(${p.hue},95%,72%,${0.9 * a})`);
        g.addColorStop(0.4, `hsla(${p.hue - 10},90%,55%,${0.35 * a})`);
        g.addColorStop(1, "hsla(30,90%,40%,0)");
        c.fillStyle = g;
        c.beginPath(); c.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2); c.fill();
        return true;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); window.removeEventListener(EVENT, onBurst); };
  }, [heat]);
  return <canvas ref={ref} aria-hidden="true" className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }} />;
}

/* ── Spinning record with the LuchiBeats logo as the label ── */
export function Vinyl({ className = "" }: { className?: string }) {
  const disc = useRef<HTMLDivElement>(null);
  const heat = useHeat();
  useEffect(() => {
    if (reduced()) return;
    let angle = 0, raf = 0, last = performance.now(), speed = 0.6;
    const tick = (t: number) => {
      const dt = Math.min(3, (t - last) / 16.7); last = t;
      const target = 0.6 + heat.current * 6;
      speed += (target - speed) * 0.06 * dt;
      angle = (angle + speed * dt) % 360;
      if (disc.current) disc.current.style.transform = `rotate(${angle}deg)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [heat]);
  return (
    <div aria-hidden="true" className={`pointer-events-none ${className}`}>
      <div ref={disc} className="vinyl relative w-full h-full rounded-full">
        <div className="absolute inset-[31%] rounded-full overflow-hidden flex items-center justify-center"
          style={{ background: "radial-gradient(circle, #1a1407 0%, #0b0905 70%)", boxShadow: "0 0 0 2px rgba(201,168,76,0.5), 0 0 30px rgba(201,168,76,0.25)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" className="w-[135%] max-w-none select-none" />
        </div>
        <div className="absolute left-1/2 top-1/2 w-[3%] h-[3%] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: "#000" }} />
      </div>
    </div>
  );
}

/* ── Gold sound wave that jumps with every keystroke ── */
export function TypingWave() {
  const ref = useRef<HTMLCanvasElement>(null);
  const heat = useHeat();
  useEffect(() => {
    const canvas = ref.current!;
    const c = canvas.getContext("2d")!;
    const t0 = performance.now();
    let raf = 0, level = 0;
    const still = reduced();
    const draw = (t: number) => {
      const w = canvas.clientWidth, h = canvas.clientHeight, dpr = Math.min(2, devicePixelRatio || 1);
      if (canvas.width !== w * dpr) { canvas.width = w * dpr; canvas.height = h * dpr; }
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, w, h);
      level += (Math.min(1.6, heat.current) - level) * 0.15;
      const time = (t - t0) / 1000;
      const grad = c.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, "rgba(168,137,46,0)"); grad.addColorStop(0.2, "#C9A84C"); grad.addColorStop(0.5, "#F0D878"); grad.addColorStop(0.8, "#C9A84C"); grad.addColorStop(1, "rgba(168,137,46,0)");
      [[1, 1.6], [0.45, 1]].forEach(([amp, lw], layer) => {
        c.beginPath();
        for (let x = 0; x <= w; x += 2) {
          const u = x / w;
          const env = Math.sin(Math.PI * u);
          const y = h / 2 + env * (h * 0.42) * (0.06 + level * 0.6) * amp *
            (Math.sin(u * 22 + time * 6 + layer) * 0.6 + Math.sin(u * 51 - time * 9) * 0.3 + Math.sin(u * 9 + time * 2.5) * 0.4);
          if (x === 0) c.moveTo(x, y); else c.lineTo(x, y);
        }
        c.strokeStyle = grad; c.lineWidth = lw; c.globalAlpha = layer ? 0.45 : 1;
        c.shadowColor = "rgba(229,199,107,0.8)"; c.shadowBlur = 8 + level * 14;
        c.stroke();
      });
      c.globalAlpha = 1; c.shadowBlur = 0;
      if (!still) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [heat]);
  return <canvas ref={ref} aria-hidden="true" className="w-full h-14 block" />;
}

/* ── Headline word that scrambles into the next one ── */
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*@";
export function ScrambleWords({ words, interval = 2600 }: { words: string[]; interval?: number }) {
  const [text, setText] = useState(words[0]);
  useEffect(() => {
    if (reduced()) return;
    let i = 0, frame = 0, raf = 0;
    const id = window.setInterval(() => {
      const from = words[i], to = words[(i + 1) % words.length];
      i = (i + 1) % words.length;
      const len = Math.max(from.length, to.length), start = performance.now();
      cancelAnimationFrame(raf);
      const step = (t: number) => {
        const p = Math.min(1, (t - start) / 700);
        let out = "";
        for (let k = 0; k < len; k++) {
          const settle = k / len;
          if (p > settle * 0.7 + 0.3) out += to[k] ?? "";
          else if (p > settle * 0.5) out += to[k] === " " ? " " : GLYPHS[(frame + k * 7) % GLYPHS.length];
          else out += from[k] ?? "";
        }
        frame++;
        setText(out);
        if (p < 1) raf = requestAnimationFrame(step); else setText(to);
      };
      raf = requestAnimationFrame(step);
    }, interval);
    return () => { window.clearInterval(id); cancelAnimationFrame(raf); };
  }, [words, interval]);
  return <span className="gold-gradient inline-block min-w-[6ch]" style={{ textShadow: "none", filter: "drop-shadow(0 0 18px rgba(201,168,76,0.35))" }} aria-live="off">{text}</span>;
}
