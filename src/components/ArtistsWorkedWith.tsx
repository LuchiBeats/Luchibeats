"use client";
import { useRef, useEffect } from "react";
import ScrollReveal from "./ScrollReveal";

const collaborators: { name: string; image?: string; pos?: string }[] = [
  { name: "Dave East",       image: "/artists/dave-east.webp" },
  { name: "Fabolous",        image: "/artists/fabolous.webp" },
  { name: "Joe Budden",     image: "/artists/joe-budden.webp", pos: "center 50%" },
  { name: "A Boogie",       image: "/artists/a-boogie.webp",  pos: "center 40%" },
  { name: "Fetty Wap",      image: "/artists/fetty-wap.jpg",  pos: "75% center" },
  { name: "Tempo",          image: "/artists/tempo.avif",     pos: "75% center" },
  { name: "Mysonne",        image: "/artists/mysonne.jpg" },
  { name: "Mariah Lynn",    image: "/artists/mariah-lynn.jpg" },
  { name: "Arlene Mc",      image: "/artists/arlene-mc.jpg" },
  { name: "Harrd Luck",     image: "/artists/harrd-luck.jpg" },
  { name: "Oskama Esteban", image: "/artists/oskama.jpg" },
  { name: "Albeal",         image: "/artists/albeal.jpg",     pos: "center center" },
  { name: "Nyah Lee",        image: "/artists/nyah-lee.jpg" },
  { name: "Raekwon",        image: "/artists/raekwon.avif" },
  { name: "Max Santos",     image: "/artists/max-santos.jpg" },
];

// Three copies so the reset is always hidden off-screen
const items = [...collaborators, ...collaborators, ...collaborators];

export default function ArtistsWorkedWith() {
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0);
  const rafRef = useRef<number>(0);
  const pausedRef = useRef(false);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 480;
  const avatarSize = isMobile ? 90 : 120;
  const itemWidth  = isMobile ? 104 : 132;
  const itemGap    = isMobile ? 36 : 56;
  const fontSize   = isMobile ? 13 : 15;

  useEffect(() => {
    const track = trackRef.current!;
    if (!track) return;

    // Width of one copy (14 artists). Measured after mount.
    const getOneSetWidth = () => track.scrollWidth / 3;

    const SPEED = 0.9; // px per frame (~54px/s at 60fps)

    function tick() {
      if (!pausedRef.current) {
        posRef.current += SPEED;
        const oneSet = getOneSetWidth();
        // Once we've scrolled one full copy, jump back — seamless because copy 2 looks identical to copy 1
        if (posRef.current >= oneSet) {
          posRef.current -= oneSet;
        }
        track.style.transform = `translateX(-${posRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <section
      className="relative py-12 md:py-16 overflow-hidden border-y"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, rgba(201,168,76,0.06) 0%, transparent 70%)" }}
      />

      <ScrollReveal className="text-center mb-6 px-4">
        <p className="text-xs tracking-[0.35em] mb-2" style={{ color: "var(--fire)" }}>THE PORTFOLIO</p>
        <h2 className="text-2xl md:text-3xl font-black text-white">Portfolio Artists Include</h2>
      </ScrollReveal>

      {/* Viewport: capped so fewer than 14 artists are ever visible at once */}
      <div
        className="relative overflow-hidden mx-auto"
        style={{
          maxWidth: "1000px",
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
            gap: `${itemGap}px`,
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
                width: `${itemWidth}px`,
              }}
            >
              <div
                style={{
                  width: `${avatarSize}px`,
                  height: `${avatarSize}px`,
                  borderRadius: "50%",
                  overflow: "hidden",
                  background: "#111",
                  border: "2px solid #C9A84C",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "28px",
                  fontWeight: 900,
                  color: "#C9A84C",
                  flexShrink: 0,
                  boxShadow: "0 0 10px rgba(201,168,76,0.25)",
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
                  fontSize: `${fontSize}px`,
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
