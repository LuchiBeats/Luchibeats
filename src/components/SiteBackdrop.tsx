"use client";
import { useEffect, useRef } from "react";

// The site-wide background, layered behind every page:
//  1. a faint wood-slat studio wall
//  2. colored studio light that changes with the section on screen (sections opt in
//     with data-light="gold" | "ember" | "blue"; anything else is gold)
//  3. slow warm haze drifting like stage fog
//  4. fine moving film grain on top of everything (click-through, very low opacity)
// Reduced-motion visitors get the same look without the movement.

const LIGHTS: Record<string, [string, string]> = {
  gold:  ["rgba(201,150,60,0.16)", "rgba(229,199,107,0.08)"],
  ember: ["rgba(190,70,30,0.17)",  "rgba(229,140,60,0.08)"],
  blue:  ["rgba(60,110,200,0.15)", "rgba(120,170,255,0.07)"],
};

export default function SiteBackdrop() {
  const lightRef = useRef<HTMLDivElement>(null);
  const hazeRef = useRef<HTMLCanvasElement>(null);

  // Light: follow whichever tagged section is at the middle of the screen
  useEffect(() => {
    const el = lightRef.current;
    if (!el) return;
    let current = "";
    let ticking = false;
    const apply = (name: string) => {
      if (name === current) return;
      current = name;
      const [a, b] = LIGHTS[name] ?? LIGHTS.gold;
      el.style.setProperty("--light-a", a);
      el.style.setProperty("--light-b", b);
    };
    const update = () => {
      ticking = false;
      const mid = innerHeight / 2;
      let pick = "gold";
      document.querySelectorAll<HTMLElement>("[data-light]").forEach((s) => {
        const r = s.getBoundingClientRect();
        if (r.top <= mid && r.bottom >= mid) pick = s.dataset.light || "gold";
      });
      apply(pick);
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // Pages change without a reload: re-check when the content changes
    const mo = new MutationObserver(onScroll);
    mo.observe(document.body, { childList: true, subtree: true });
    update();
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); mo.disconnect(); };
  }, []);

  // Haze: a few large soft warm clouds drifting slowly
  useEffect(() => {
    const canvas = hazeRef.current;
    if (!canvas) return;
    const c = canvas.getContext("2d");
    if (!c) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scale = 0.25; // drawn small and scaled up: soft and cheap
    type Cloud = { x: number; y: number; r: number; vx: number; vy: number; hue: number; a: number; phase: number };
    let w = 0, h = 0, raf = 0, last = performance.now();
    const clouds: Cloud[] = Array.from({ length: 7 }, (_, i) => ({
      x: Math.random(), y: Math.random(), r: 0.28 + Math.random() * 0.3,
      vx: (Math.random() - 0.5) * 0.000012, vy: (Math.random() - 0.5) * 0.000008,
      hue: 28 + Math.random() * 18, a: 0.05 + Math.random() * 0.05, phase: i * 1.3,
    }));
    const resize = () => {
      w = Math.ceil(innerWidth * scale); h = Math.ceil(innerHeight * scale);
      canvas.width = w; canvas.height = h;
    };
    const draw = (t: number) => {
      const dt = Math.min(64, t - last); last = t;
      c.clearRect(0, 0, w, h);
      c.globalCompositeOperation = "lighter";
      for (const k of clouds) {
        k.x += k.vx * dt; k.y += k.vy * dt;
        if (k.x < -0.3) k.x = 1.3; if (k.x > 1.3) k.x = -0.3;
        if (k.y < -0.3) k.y = 1.3; if (k.y > 1.3) k.y = -0.3;
        const breathe = 0.75 + 0.25 * Math.sin(t / 9000 + k.phase);
        const R = k.r * Math.max(w, h);
        const g = c.createRadialGradient(k.x * w, k.y * h, 0, k.x * w, k.y * h, R);
        g.addColorStop(0, `hsla(${k.hue},70%,55%,${k.a * breathe})`);
        g.addColorStop(0.5, `hsla(${k.hue},60%,40%,${k.a * 0.4 * breathe})`);
        g.addColorStop(1, "hsla(30,60%,30%,0)");
        c.fillStyle = g;
        c.beginPath(); c.arc(k.x * w, k.y * h, R, 0, Math.PI * 2); c.fill();
      }
      if (!still && !document.hidden) raf = requestAnimationFrame(draw);
    };
    const onVis = () => { if (!document.hidden && !still) { last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); } };
    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVis);
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); document.removeEventListener("visibilitychange", onVis); };
  }, []);

  return (
    <>
      <div aria-hidden="true" className="backdrop-layer backdrop-wall" />
      <div ref={lightRef} aria-hidden="true" className="backdrop-layer backdrop-light" />
      <canvas ref={hazeRef} aria-hidden="true" className="backdrop-layer backdrop-haze" />
      <div aria-hidden="true" className="backdrop-grain" />
    </>
  );
}
