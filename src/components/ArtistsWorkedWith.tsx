"use client";
import { useRef, useEffect } from "react";
import ScrollReveal from "./ScrollReveal";
import { collaborators } from "@/lib/collaborators";


// Three copies so the reset is always hidden off-screen
const items = [...collaborators, ...collaborators, ...collaborators];

export default function ArtistsWorkedWith() {
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0);
  const rafRef = useRef<number>(0);
  const pausedRef = useRef(false);

  // Sizes scale with the screen in CSS, so the server and the phone agree (no hydration mismatch)
  const avatarSize = "clamp(92px, 10.5vw, 150px)";
  const itemWidth  = "clamp(106px, 11.5vw, 164px)";
  const itemGap    = "clamp(26px, 3.4vw, 48px)";
  const fontSize   = "clamp(13px, 1.05vw, 15px)";

  useEffect(() => {
    const track = trackRef.current!;
    if (!track) return;

    const getOneSetWidth = () => track.scrollWidth / 3;
    const SPEED = 0.9;

    function tick() {
      if (!pausedRef.current && !document.hidden) {
        posRef.current += SPEED;
        const oneSet = getOneSetWidth();
        if (posRef.current >= oneSet) posRef.current -= oneSet;
        track.style.transform = `translateX(-${posRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <section
      className="relative py-12 md:py-16 overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, rgba(201,168,76,0.06) 0%, transparent 70%)" }}
      />

      <ScrollReveal className="text-center mb-10 md:mb-12 px-4">
        <p className="eyebrow mb-3">The Portfolio</p>
        <h2 className="section-title">Artists I&apos;ve Worked With</h2>
      </ScrollReveal>

      {/* Viewport: capped so fewer than 14 artists are ever visible at once */}
      <div
        className="relative overflow-hidden mx-auto"
        style={{
          maxWidth: "1200px",
          maskImage: "linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%)",
        }}
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; }}
      >
        <div
          ref={trackRef}
          style={{
            display: "flex",
            gap: `${itemGap}`,
            width: "max-content",
            willChange: "transform",
          }}
        >
          {items.map((artist, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
                flexShrink: 0,
                width: `${itemWidth}`,
              }}
            >
              <div
                style={{
                  width: `${avatarSize}`,
                  height: `${avatarSize}`,
                  borderRadius: "50%",
                  overflow: "hidden",
                  background: "#111",
                  border: "1.5px solid rgba(201,168,76,0.7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "28px",
                  fontWeight: 900,
                  color: "#C9A84C",
                  flexShrink: 0,
                  boxShadow: "0 0 0 5px rgba(201,168,76,0.06), 0 10px 30px rgba(0,0,0,0.6)",
                }}
              >
                {artist.image ? (
                  <img
                    src={artist.image}
                    alt={artist.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: artist.pos ?? "center top" }}
                  />
                ) : (
                  artist.name[0]
                )}
              </div>
              <p
                style={{
                  fontSize: `${fontSize}`,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.9)",
                  whiteSpace: "nowrap",
                  letterSpacing: "0.04em",
                  textAlign: "center",
                }}
              >
                {artist.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
