"use client";
import { useEffect, useRef, useState } from "react";
import { collaborators } from "@/lib/collaborators";

const artists = collaborators.filter((a) => a.image);

// Every artist name in big type. On desktop, hovering a name brings up their photo,
// which trails the cursor. On phones, tapping a name shows it in the preview above.
export default function ArtistRoll() {
  const [active, setActive] = useState<number | null>(null);
  const [mobileActive, setMobileActive] = useState(0);
  const floatRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });

  // Smoothly trail the cursor and lean into the direction of movement
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const el = floatRef.current;
      const dx = target.current.x - pos.current.x;
      pos.current.x += dx * 0.14;
      pos.current.y += (target.current.y - pos.current.y) * 0.14;
      if (el) el.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) translate(-50%, -60%) rotate(${Math.max(-12, Math.min(12, dx * 0.08))}deg)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Phones: cycle the preview until the visitor taps a name
  const [tapped, setTapped] = useState(false);
  useEffect(() => {
    if (tapped) return;
    const id = window.setInterval(() => setMobileActive((i) => (i + 1) % artists.length), 2200);
    return () => window.clearInterval(id);
  }, [tapped]);

  return (
    <div className="relative"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const box = e.currentTarget.getBoundingClientRect();
        target.current = { x: e.clientX - box.left, y: e.clientY - box.top };
        if (active === null) pos.current = { ...target.current };
      }}
      onPointerLeave={() => setActive(null)}>

      {/* Phone preview */}
      <div className="md:hidden relative h-64 -mx-4 mb-4">
        {artists.map((a, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={a.name} src={a.image} alt={i === mobileActive ? a.name : ""} loading="lazy"
            className="photo-tile absolute inset-0 m-auto h-full aspect-[3/4] object-cover transition-opacity duration-700"
            style={{ objectPosition: a.pos ?? "center top", opacity: i === mobileActive ? 1 : 0 }} />
        ))}
      </div>

      <p className="leading-[1.15] md:leading-[1.1]">
        {artists.map((a, i) => {
          const on = active === i;
          return (
            <span key={a.name} className="inline">
              <button type="button"
                onPointerEnter={(e) => { if (e.pointerType === "mouse") setActive(i); }}
                onFocus={() => setActive(i)} onBlur={() => setActive(null)}
                onClick={() => { setMobileActive(i); setTapped(true); }}
                className="font-black tracking-tight transition-colors duration-300 text-left"
                style={{
                  fontSize: "clamp(1.6rem, 4.6vw, 4rem)",
                  color: on ? "#fff" : (active === null ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.16)"),
                }}>
                <span className="md:hidden" style={{ color: i === mobileActive ? "#fff" : undefined }}>{a.name}</span>
                <span className="hidden md:inline">{a.name}</span>
              </button>
              {i < artists.length - 1 && <span aria-hidden="true" className="mx-2 md:mx-4 font-light" style={{ color: "var(--gold)", fontSize: "clamp(1.2rem, 3vw, 2.6rem)", opacity: 0.6 }}>/</span>}
            </span>
          );
        })}
      </p>

      {/* Floating photo (desktop) */}
      <div ref={floatRef} aria-hidden="true" className="hidden md:block absolute top-0 left-0 w-60 h-72 pointer-events-none z-20 transition-opacity duration-300"
        style={{ opacity: active === null ? 0 : 1 }}>
        {artists.map((a, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={a.name} src={a.image} alt="" loading="lazy"
            className="absolute inset-0 w-full h-full object-cover rounded-2xl transition-opacity duration-300"
            style={{ objectPosition: a.pos ?? "center top", opacity: active === i ? 1 : 0, boxShadow: "0 30px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,168,76,0.35)" }} />
        ))}
      </div>
    </div>
  );
}
