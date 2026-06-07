"use client";
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import type { ProductionVideo } from "@/lib/beats-store";

const DEFAULT_VIDEOS: ProductionVideo[] = [
  { id: "Oma1SZ8utmw", artist: "G Wreck ft Coi Leray",         title: "Froze",               credits: "Beat · Vocal Recording · Mix" },
  { id: "DMjz34ubhg4", artist: "Mach City",                    title: "Machi 99",            credits: "Beat · Vocal Recording · Mix" },
  { id: "6a94jphQcaY", artist: "Mach City",                    title: "Make Em Trip",        credits: "Beat · Vocal Recording · Mix" },
  { id: "gPyvvEYe3Ng", artist: "Trey Budden x Oskama Esteban", title: "Cage Bird Sings",     credits: "Beat · Vocal Recording · Mix" },
  { id: "aLmZ0nV9_gc", artist: "A.D Ft K Godess",              title: "Work",                credits: "Beat · Vocal Recording · Mix" },
  { id: "dft7z1yWCDg", artist: "Trey Budden",                  title: "PUBLIK!",             credits: "Beat · Vocal Recording · Mix" },
  { id: "PPnuRGkrRuY", artist: "Swizzyy Marleyy",              title: "Super Gango",         credits: "Vocal Recording · Mix" },
  { id: "IwreOeCvK1M", artist: "Mysonne",                      title: "That's How We On It", credits: "Vocal Recording · Mix" },
  { id: "zGzpIqC5zvQ", artist: "A Boogie Wit Da Hoodie",       title: "Timeless",            credits: "Initial Vocal Recording" },
];

export default function Productions({ videos: videosProp }: { videos?: ProductionVideo[] }) {
  const videos = videosProp?.length ? videosProp : DEFAULT_VIDEOS;
  const STEP = 360 / videos.length;
  const [angle, setAngle]           = useState(-STEP);
  const [paused, setPaused]         = useState(false);
  const [modalVideo, setModalVideo] = useState<(typeof videos)[number] | null>(null);
  const [dims, setDims]             = useState({ radius: 520, cardW: 260, stageH: 380 });
  const touchStartX = useRef(0);
  const swipedRef   = useRef(false);
  const modalRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (w < 480)      setDims({ radius: 270, cardW: 125, stageH: 280 });
      else if (w < 768) setDims({ radius: 370, cardW: 190, stageH: 340 });
      else              setDims({ radius: 520, cardW: 260, stageH: 380 });
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // When modal opens: pause carousel, lock scroll, go fullscreen
  useEffect(() => {
    if (!modalVideo) {
      document.body.style.overflow = "";
      return;
    }

    setPaused(true);
    document.body.style.overflow = "hidden";

    // Request native fullscreen on the modal container
    const el = modalRef.current;
    if (el) {
      const req =
        (el as any).requestFullscreen ||
        (el as any).webkitRequestFullscreen ||
        (el as any).mozRequestFullScreen;
      req?.call(el)?.catch(() => {});
    }

    return () => { document.body.style.overflow = ""; };
  }, [modalVideo]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setAngle((a) => a - STEP), 5000);
    return () => clearInterval(id);
  }, [paused]);

  const prev = () => setAngle((a) => a + STEP);
  const next = () => setAngle((a) => a - STEP);

  const frontIdx = ((Math.round(-angle / STEP) % videos.length) + videos.length) % videos.length;

  const closeModal = () => {
    setModalVideo(null);
    setTimeout(() => setPaused(false), 300);
    // Exit native fullscreen if active
    try {
      const exit =
        (document as any).exitFullscreen ||
        (document as any).webkitExitFullscreen ||
        (document as any).mozCancelFullScreen;
      if (
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement
      ) {
        exit?.call(document);
      }
    } catch {}
  };

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

      {/* 3D Stage — thumbnails only, no inline iframes */}
      <div
        className="relative mx-auto"
        style={{ height: `${dims.stageH}px`, perspective: "1500px" }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={(e) => {
          setPaused(true);
          touchStartX.current = e.touches[0].clientX;
          swipedRef.current = false;
        }}
        onTouchMove={(e) => {
          if (Math.abs(e.touches[0].clientX - touchStartX.current) > 10) {
            swipedRef.current = true;
          }
        }}
        onTouchEnd={(e) => {
          if (swipedRef.current) {
            const diff = e.changedTouches[0].clientX - touchStartX.current;
            if (diff < 0) next(); else prev();
          }
          setTimeout(() => setPaused(false), 400);
        }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateY(${angle}deg)`,
            transition: "transform 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }}
        >
          {videos.map((video, i) => {
            const isFront = i === frontIdx;

            return (
              <div
                key={video.id}
                onClick={() => {
                  if (swipedRef.current) return;
                  if (isFront) {
                    setModalVideo(video);
                  } else {
                    setAngle(-(i * STEP));
                  }
                }}
                style={{
                  position: "absolute",
                  width: `${dims.cardW}px`,
                  transform: `rotateY(${i * STEP}deg) translateZ(${dims.radius}px)`,
                  transition: "transform 0.9s cubic-bezier(0.25,0.46,0.45,0.94)",
                  cursor: "pointer",
                  transformStyle: "preserve-3d",
                }}
              >
                <div
                  className="rounded-xl overflow-hidden shadow-2xl"
                  style={{
                    border: isFront ? "1px solid rgba(201,168,76,0.6)" : "1px solid rgba(201,168,76,0.15)",
                    transform: isFront ? "scale(1.08)" : "scale(1)",
                    transition: "transform 0.6s ease, border 0.6s ease, box-shadow 0.6s ease",
                    boxShadow: isFront ? "0 0 40px rgba(201,168,76,0.2)" : "none",
                  }}
                >
                  {/* Thumbnail */}
                  <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                    <div className="absolute inset-0 group" style={{ background: "#111" }}>
                      <img
                        src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity"
                      />
                      {/* Play overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                          style={{ background: "rgba(255,0,0,0.9)", boxShadow: "0 0 20px rgba(255,0,0,0.4)" }}
                        >
                          <svg viewBox="0 0 24 24" fill="white" style={{ width: "20px", height: "20px", marginLeft: "3px" }}>
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
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
        <button onClick={prev} aria-label="Previous"
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: "rgba(10,10,10,0.9)", border: "1px solid rgba(201,168,76,0.45)", color: "var(--fire)" }}>
          <ChevronLeft size={18} />
        </button>

        <div className="flex gap-2">
          {videos.map((_, i) => (
            <button key={i} onClick={() => setAngle(-(i * STEP))} aria-label={`Go to video ${i + 1}`}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === frontIdx ? "24px" : "8px",
                height: "8px",
                background: i === frontIdx ? "var(--fire)" : "rgba(201,168,76,0.25)",
              }}
            />
          ))}
        </div>

        <button onClick={next} aria-label="Next"
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: "rgba(10,10,10,0.9)", border: "1px solid rgba(201,168,76,0.45)", color: "var(--fire)" }}>
          <ChevronRight size={18} />
        </button>
      </div>

      {/* ── Fullscreen video modal ── */}
      {modalVideo && (
        <div
          ref={modalRef}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center px-4"
          style={{ background: "#000" }}
          onClick={closeModal}
        >
          {/* Close button */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110 z-10"
            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff" }}
            aria-label="Close video"
          >
            <X size={20} />
          </button>

          {/* Video frame — stops click from closing */}
          <div
            className="w-full"
            style={{ maxWidth: "900px", position: "relative", paddingBottom: "56.25%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube-nocookie.com/embed/${modalVideo.id}?autoplay=1&rel=0&modestbranding=1&playsinline=0&fs=1`}
              title={`${modalVideo.artist} — ${modalVideo.title}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>

          {/* Video info below */}
          <div className="mt-5 text-center" onClick={(e) => e.stopPropagation()}>
            <p className="text-xs tracking-[0.3em] uppercase mb-1" style={{ color: "var(--fire)" }}>{modalVideo.artist}</p>
            <p className="text-xl font-black text-white">{modalVideo.title}</p>
            <p className="text-xs mt-1" style={{ color: "rgba(201,168,76,0.55)" }}>{modalVideo.credits}</p>
          </div>

          <p className="absolute bottom-6 text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
            Tap outside to close
          </p>
        </div>
      )}
    </section>
  );
}
