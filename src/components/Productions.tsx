"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const videos = [
  { id: "DMjz34ubhg4", artist: "Mach City", title: "Machi 99",               credits: "Beat · Vocal Recording · Mix" },
  { id: "6a94jphQcaY", artist: "Mach City", title: "Make Em Trip",           credits: "Beat · Vocal Recording · Mix" },
  { id: "gPyvvEYe3Ng", artist: "Trey Budden x Oskama Esteban", title: "Cage Bird Sings",   credits: "Beat · Vocal Recording · Mix" },
  { id: "aLmZ0nV9_gc", artist: "A.D Ft K Godess", title: "Work",            credits: "Beat · Vocal Recording · Mix" },
  { id: "dft7z1yWCDg", artist: "Trey Budden", title: "PUBLIK!",              credits: "Beat · Vocal Recording · Mix" },
  { id: "PPnuRGkrRuY", artist: "Swizzyy Marleyy", title: "Super Gango",     credits: "Vocal Recording · Mix" },
  { id: "IwreOeCvK1M", artist: "Mysonne", title: "That's How We On It",     credits: "Vocal Recording · Mix" },
  { id: "zGzpIqC5zvQ", artist: "A Boogie Wit Da Hoodie", title: "Timeless", credits: "Initial Vocal Recording" },
];

const STEP = 360 / videos.length;

export default function Productions() {
  const [angle, setAngle] = useState(-STEP);
  const [paused, setPaused] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [dims, setDims] = useState({ radius: 380, cardW: 300, stageH: 340 });

  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (w < 480) setDims({ radius: 220, cardW: 150, stageH: 300 });
      else if (w < 768) setDims({ radius: 300, cardW: 220, stageH: 360 });
      else setDims({ radius: 380, cardW: 300, stageH: 400 });
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setAngle((a) => a - STEP), 5000);
    return () => clearInterval(id);
  }, [paused]);

  const prev = () => { setAngle((a) => a + STEP); setActiveIdx(null); };
  const next = () => { setAngle((a) => a - STEP); setActiveIdx(null); };

  const frontIdx = ((Math.round(-angle / STEP) % videos.length) + videos.length) % videos.length;

  return (
    <section className="relative py-16 md:py-28 overflow-hidden">
      <div className="orb orb-1 w-[600px] h-[600px] top-0 left-1/2 -translate-x-1/2" style={{ background: "rgba(201,168,76,0.05)" }} />

      <div className="max-w-6xl mx-auto px-4">
        <ScrollReveal className="flex items-end justify-between mb-12 md:mb-16">
          <div>
            <p className="text-xs tracking-[0.3em] mb-2" style={{ color: "var(--fire)" }}>STRAIGHT FROM THE STUDIO</p>
            <h2 className="text-3xl md:text-4xl font-black text-white">Productions</h2>
          </div>
          <span className="text-sm tabular-nums" style={{ color: "var(--muted)" }}>
            {frontIdx + 1} <span style={{ color: "rgba(201,168,76,0.3)" }}>/</span> {videos.length}
          </span>
        </ScrollReveal>
      </div>

      {/* 3D Stage */}
      <div
        className="relative mx-auto"
        style={{ height: `${dims.stageH}px`, perspective: "1100px" }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => { setPaused(false); setActiveIdx(null); }}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        {/* Spinning ring */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateY(${angle}deg)`,
            transition: "transform 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }}
        >
          {videos.map((video, i) => {
            const cardAngle = i * STEP;
            const isFront = i === frontIdx;
            const isActive = activeIdx === i;

            return (
              <div
                key={video.id}
                onClick={() => {
                  setAngle(-(i * STEP));
                  setActiveIdx(isActive ? null : i);
                }}
                style={{
                  position: "absolute",
                  width: `${dims.cardW}px`,
                  transform: `rotateY(${cardAngle}deg) translateZ(${dims.radius}px)`,
                  transition: "opacity 0.6s, transform 0.9s cubic-bezier(0.25,0.46,0.45,0.94)",
                  opacity: 1,
                  cursor: "pointer",
                  transformStyle: "preserve-3d",
                }}
              >
                <div
                  className="rounded-xl overflow-hidden shadow-2xl"
                  style={{
                    border: isFront
                      ? "1px solid rgba(201,168,76,0.6)"
                      : "1px solid rgba(201,168,76,0.15)",
                    transform: isFront ? "scale(1.08)" : "scale(1)",
                    transition: "transform 0.6s ease, border 0.6s ease, box-shadow 0.6s ease",
                    boxShadow: isFront ? "0 0 40px rgba(201,168,76,0.2)" : "none",
                  }}
                >
                  {/* Video or thumbnail */}
                  <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                    {isActive ? (
                      <iframe
                        key={video.id}
                        className="absolute inset-0 w-full h-full"
                        src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`}
                        title={`${video.artist} — ${video.title}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="absolute inset-0 w-full h-full flex items-center justify-center group" style={{ background: "#111" }}>
                        <img
                          src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
                          alt={video.title}
                          className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity"
                        />
                        <div className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                          style={{ background: "rgba(255,0,0,0.9)" }}>
                          <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6 ml-1">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Label */}
                  <div className="px-4 py-3" style={{ background: "var(--surface)" }}>
                    <p className="text-[10px] tracking-widest uppercase mb-0.5" style={{ color: "var(--fire)" }}>{video.artist}</p>
                    <p className="text-sm font-bold text-white truncate">{video.title}</p>
                    <p className="text-[10px] mt-1 truncate" style={{ color: "rgba(201,168,76,0.55)" }}>{video.credits}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 mt-8 md:mt-16">
        <button
          onClick={prev}
          aria-label="Previous"
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: "rgba(10,10,10,0.9)", border: "1px solid rgba(201,168,76,0.45)", color: "var(--fire)" }}
        >
          <ChevronLeft size={18} />
        </button>

        {/* Dots */}
        <div className="flex gap-2">
          {videos.map((_, i) => (
            <button
              key={i}
              onClick={() => { setAngle(-(i * STEP)); setActiveIdx(null); }}
              aria-label={`Go to video ${i + 1}`}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === frontIdx ? "24px" : "8px",
                height: "8px",
                background: i === frontIdx ? "var(--fire)" : "rgba(201,168,76,0.25)",
              }}
            />
          ))}
        </div>

        <button
          onClick={next}
          aria-label="Next"
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: "rgba(10,10,10,0.9)", border: "1px solid rgba(201,168,76,0.45)", color: "var(--fire)" }}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}
