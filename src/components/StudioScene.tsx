"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// "The studio is the menu": three studio photos blended into one room.
// Each piece of gear is a hotspot that leads to a part of the site.

type Spot = { x: number; y: number; label: string; text: string; href: string; side?: "left" | "right" };
type Panel = { src: string; alt: string; depth: number; spots: Spot[] };

const PANELS: Panel[] = [
  {
    src: "/luchi/studio-window.webp", alt: "The vocal booth seen through the control room glass", depth: 10,
    spots: [{ x: 60, y: 52, label: "The Booth", text: "Vocal recording sessions", href: "/contact", side: "left" }],
  },
  {
    src: "/luchi/portrait-studio.webp", alt: "Luchi at the console in the control room", depth: 18,
    spots: [
      { x: 20, y: 40, label: "On Screen", text: "Live streams & studio sessions", href: "/live", side: "right" },
      { x: 22, y: 56, label: "The Console", text: "Mixing & mastering", href: "/contact", side: "right" },
      { x: 52, y: 49, label: "Monitors", text: "Hear the productions", href: "/#productions", side: "right" },
      { x: 88, y: 47, label: "Meet Luchi", text: "The story so far", href: "/about", side: "left" },
    ],
  },
  {
    src: "/luchi/session-laptop.webp", alt: "Luchi building a beat on the keys", depth: 12,
    spots: [{ x: 30, y: 83, label: "The Keys", text: "Custom beat production", href: "/contact", side: "right" }],
  },
];

export default function StudioScene({ as: Heading = "h2" }: { as?: "h1" | "h2" }) {
  const [active, setActive] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  // On touch screens the first tap shows the label, the second one follows the link
  const shownOnPress = useRef<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 50);
    // Phones: open the swipe strip on the control room (middle panel)
    const el = sceneRef.current, mid = panelRefs.current[1]?.parentElement;
    if (el && mid && el.scrollWidth > el.clientWidth) el.scrollLeft = mid.offsetLeft - (el.clientWidth - mid.clientWidth) / 2;
    return () => window.clearTimeout(t);
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

  const activePanel = active ? Number(active.split(":")[0]) : null;

  return (
    <section className="relative overflow-hidden" style={{ background: "var(--bg)" }}>
      {/* Title */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 pt-12 md:pt-16 pointer-events-none">
        <p className="eyebrow mb-3">Step Inside</p>
        <Heading className="section-title">The Studio</Heading>
        <p className="mt-3 md:text-lg" style={{ color: "rgba(255,255,255,0.65)" }}>
          <span className="hidden md:inline">Hover the gear. Click to go anywhere.</span>
          <span className="md:hidden">Swipe through the room. Tap the gold lights.</span>
        </p>
      </div>

      {/* Scene: three panels, each a 2:3 photo, overlapping and cross-fading into one room */}
      <div ref={sceneRef}
        className="studio-scene relative mx-auto -mt-10 md:-mt-24 flex md:block overflow-x-auto md:overflow-visible snap-x snap-mandatory"
        style={{ ["--w" as string]: "min(100vw, calc((100dvh - 230px) * 1.84))" }}>
        {PANELS.map((p, pi) => {
          const dim = activePanel !== null && activePanel !== pi;
          return (
            <div key={p.src}
              className="studio-panel relative shrink-0 snap-center w-[86vw] aspect-[2/3] md:absolute md:top-0 md:w-[36.23%] md:aspect-[2/3]"
              style={{
                left: `${pi * 31.88}%`,
                zIndex: activePanel === pi ? 5 : pi === 1 ? 3 : 2,
                opacity: ready ? 1 : 0,
                transition: `opacity 1.2s ${0.15 + pi * 0.25}s ease, filter 0.5s ease`,
                filter: dim ? "brightness(0.35) saturate(0.6)" : activePanel === pi ? "brightness(1.12)" : "brightness(0.85)",
              }}>
              <div ref={(el) => { panelRefs.current[pi] = el; }} className="absolute inset-0 will-change-transform">
                <div className="studio-photo absolute inset-0">
                  <Image src={p.src} alt={p.alt} fill priority={pi === 1} sizes="(max-width: 768px) 86vw, 36vw" className="object-cover" />
                </div>

                {p.spots.map((s, si) => {
                  const id = `${pi}:${si}`;
                  const on = active === id;
                  return (
                    <div key={id} className="absolute z-10" style={{ left: `${s.x}%`, top: `${s.y}%` }}>
                      <Link href={s.href} aria-label={`${s.label}: ${s.text}`}
                        onPointerEnter={(e) => { if (e.pointerType === "mouse") setActive(id); }}
                        onPointerLeave={(e) => { if (e.pointerType === "mouse") setActive(null); }}
                        onFocus={() => setActive(id)} onBlur={() => setActive(null)}
                        onPointerDown={(e) => { if (e.pointerType !== "mouse") shownOnPress.current = active === id ? id : null; }}
                        onClick={(e) => {
                          if (window.matchMedia("(pointer: coarse)").matches && shownOnPress.current !== id) { e.preventDefault(); setActive(id); }
                        }}
                        className="hotspot group absolute -translate-x-1/2 -translate-y-1/2 block"
                        style={{ opacity: ready ? 1 : 0, transition: `opacity 0.6s ${1.2 + (pi * 3 + si) * 0.12}s` }}>
                        <span className="hotspot-ring" />
                        <span className="hotspot-dot" style={on ? { transform: "scale(1.35)" } : undefined} />
                      </Link>

                      {/* Label: line out from the dot, then the card */}
                      <div className={`absolute top-0 pointer-events-none ${s.side === "left" ? "right-4 flex-row-reverse" : "left-4"} flex items-center -translate-y-1/2`}
                        style={{ opacity: on ? 1 : 0, transition: "opacity 0.3s" }}>
                        <span className="block h-px transition-all duration-500" style={{ width: on ? 44 : 0, background: "linear-gradient(90deg, #E5C76B, rgba(229,199,107,0.2))" }} />
                        <Link href={s.href} className="pointer-events-auto whitespace-nowrap px-4 py-3 rounded-lg"
                          style={{ background: "rgba(8,8,8,0.78)", backdropFilter: "blur(8px)", boxShadow: "0 0 0 1px rgba(201,168,76,0.4), 0 12px 30px rgba(0,0,0,0.6)", transform: on ? "translateX(0)" : `translateX(${s.side === "left" ? 8 : -8}px)`, transition: "transform 0.35s" }}>
                          <span className="block text-[10px] tracking-[0.3em] uppercase" style={{ color: "var(--gold)" }}>{s.label}</span>
                          <span className="flex items-center gap-2 text-white font-bold text-sm md:text-base">{s.text} <ArrowRight size={14} /></span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
