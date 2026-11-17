"use client";
import { useEffect, useRef } from "react";

// Homepage motion layer:
//  - the hero video zooms in and fades as you scroll past it
//  - a soft gold spotlight follows the mouse
//  - buttons marked data-magnetic lean toward the cursor
// Everything is skipped for visitors who ask for reduced motion.
export default function HomeFX() {
  const spot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cleanups: (() => void)[] = [];

    // Hero scroll
    const hero = document.querySelector<HTMLElement>("[data-hero]");
    const media = hero?.querySelector<HTMLElement>("[data-hero-media]");
    if (hero && media) {
      let ticking = false;
      const update = () => {
        ticking = false;
        const p = Math.min(1, Math.max(0, window.scrollY / hero.offsetHeight));
        media.style.transform = `translate3d(0, ${p * 18}%, 0) scale(${1 + p * 0.18})`;
        media.style.opacity = String(1 - p * 0.75);
      };
      const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
      window.addEventListener("scroll", onScroll, { passive: true });
      update();
      cleanups.push(() => window.removeEventListener("scroll", onScroll));
    }

    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (finePointer) {
      // Spotlight
      const el = spot.current;
      let x = innerWidth / 2, y = innerHeight / 3, cx = x, cy = y, raf = 0, running = false;
      const loop = () => {
        cx += (x - cx) * 0.08; cy += (y - cy) * 0.08;
        if (el) el.style.transform = `translate3d(${cx - 350}px, ${cy - 350}px, 0)`;
        if (Math.abs(x - cx) + Math.abs(y - cy) > 0.5) raf = requestAnimationFrame(loop); else running = false;
      };
      const onMove = (e: PointerEvent) => {
        x = e.clientX; y = e.clientY;
        if (el) el.style.opacity = "1";
        if (!running) { running = true; raf = requestAnimationFrame(loop); }
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      cleanups.push(() => { window.removeEventListener("pointermove", onMove); cancelAnimationFrame(raf); });

      // Magnetic buttons
      document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((b) => {
        b.style.transition = "transform 0.35s cubic-bezier(.2,.8,.2,1), box-shadow 0.2s, background 0.2s, color 0.2s";
        const move = (e: PointerEvent) => {
          const r = b.getBoundingClientRect();
          const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
          b.style.transform = `translate(${dx * 0.22}px, ${dy * 0.3}px)`;
        };
        const leave = () => { b.style.transform = ""; };
        b.addEventListener("pointermove", move);
        b.addEventListener("pointerleave", leave);
        cleanups.push(() => { b.removeEventListener("pointermove", move); b.removeEventListener("pointerleave", leave); });
      });
    }

    return () => cleanups.forEach((c) => c());
  }, []);

  return (
    <div ref={spot} aria-hidden="true" className="fixed top-0 left-0 pointer-events-none z-[15] hidden md:block"
      style={{ width: 700, height: 700, opacity: 0, transition: "opacity 0.6s", mixBlendMode: "screen",
        background: "radial-gradient(circle, rgba(201,168,76,0.09) 0%, rgba(201,168,76,0.03) 35%, transparent 65%)" }} />
  );
}
