"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// "Step Inside / The Studio": three studio photos blended into one room.
// The room assembles itself the first time it scrolls into view; the photos drift with the mouse.

type Panel = { src: string; alt: string; depth: number };

const PANELS: Panel[] = [
  { src: "/luchi/studio-window.webp", alt: "The vocal booth seen through the control room glass", depth: 10 },
  { src: "/luchi/portrait-studio.webp", alt: "Luchi at the console in the control room", depth: 18 },
  { src: "/luchi/session-laptop.webp", alt: "Luchi building a beat on the keys", depth: 12 },
];

export default function StudioScene({ as: Heading = "h2" }: { as?: "h1" | "h2" }) {
  const [ready, setReady] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;
    // Phones: open the swipe strip on the control room (middle panel)
    const mid = panelRefs.current[1]?.parentElement;
    if (mid && el.scrollWidth > el.clientWidth) el.scrollLeft = mid.offsetLeft - (el.clientWidth - mid.clientWidth) / 2;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const t = window.setTimeout(() => setReady(true), 0);
      return () => window.clearTimeout(t);
    }
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setReady(true); obs.disconnect(); } }, { threshold: 0.25 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Mouse parallax: closer panels move more
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !window.matchMedia("(pointer: fine)").matches) return;
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const onMove = (e: PointerEvent) => { tx = e.clientX / innerWidth - 0.5; ty = e.clientY / innerHeight - 0.5; };
    const loop = () => {
      cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
      panelRefs.current.forEach((el, i) => { if (el) el.style.transform = `translate3d(${-cx * PANELS[i].depth}px, ${-cy * PANELS[i].depth * 0.6}px, 0)`; });
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => { window.removeEventListener("pointermove", onMove); cancelAnimationFrame(raf); };
  }, []);

  return (
    <section className="relative overflow-hidden" style={{ background: "var(--bg)" }}>
      <div className="relative z-20 max-w-6xl mx-auto px-4 pt-12 md:pt-16 pointer-events-none">
        <p className="eyebrow mb-3">Step Inside</p>
        <Heading className="section-title">The Studio</Heading>
      </div>

      {/* Three 2:3 photos, overlapping and cross-fading into one room */}
      <div ref={sceneRef}
        className="studio-scene relative mx-auto -mt-6 md:-mt-16 flex md:block overflow-x-auto md:overflow-visible snap-x snap-mandatory"
        style={{ ["--w" as string]: "min(100vw, calc((100dvh - 200px) * 1.84))" }}>
        {PANELS.map((p, pi) => (
          <div key={p.src}
            className="relative shrink-0 snap-center w-[86vw] aspect-[2/3] md:absolute md:top-0 md:w-[36.23%] md:aspect-[2/3]"
            style={{ left: `${pi * 31.88}%`, zIndex: pi === 1 ? 3 : 2, filter: "brightness(0.9)" }}>
            <div ref={(el) => { panelRefs.current[pi] = el; }} className="absolute inset-0 will-change-transform">
              {/* Entrance: the middle photo comes into focus first, then the sides slide in like doors opening */}
              <div className="studio-photo absolute inset-0" style={{
                opacity: ready ? 1 : 0,
                transform: ready ? "none" : `translateX(${(pi - 1) * 90}px) scale(${pi === 1 ? 1.22 : 1.1})`,
                filter: ready ? "blur(0) brightness(1)" : "blur(18px) brightness(1.9)",
                transition: `opacity 1s ${pi === 1 ? 0 : 0.4}s ease, transform 1.8s ${pi === 1 ? 0 : 0.4}s cubic-bezier(.16,1,.3,1), filter 1.5s ${pi === 1 ? 0 : 0.4}s ease`,
              }}>
                <Image src={p.src} alt={p.alt} fill sizes="(max-width: 768px) 86vw, 36vw" className="object-cover" />
                {/* Gold light streak; each panel's starts later so it reads as one sweep across the room */}
                <span aria-hidden="true" className={`photo-sweep ${ready ? "is-on" : ""}`} style={{ animationDelay: `${1.3 + pi * 0.42}s` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
