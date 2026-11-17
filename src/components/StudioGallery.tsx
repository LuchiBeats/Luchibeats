"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X, Expand } from "lucide-react";

const GALLERY = [
  { src: "/luchi/session-laptop.webp", alt: "Luchi working on a beat in the studio" },
  { src: "/luchi/studio-window.webp", alt: "Luchi behind the board, seen through the studio glass" },
  { src: "/luchi/session-cigar.webp", alt: "Luchi mid-session at the laptop" },
  { src: "/luchi/portrait-half.webp", alt: "Portrait of Luchi" },
];

// The cross-faded studio photos; click one to open it full screen and flip through them.
export default function StudioGallery() {
  const [open, setOpen] = useState<number | null>(null);
  const touchX = useRef<number | null>(null);

  const go = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + GALLERY.length) % GALLERY.length)), []);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, go]);

  return (
    <>
      {/* Phone: 2 per row. Desktop: 4 across. Neighbours overlap by exactly their fade width so they cross-fade. */}
      <div className="flex flex-wrap md:flex-nowrap -mt-10 md:-mt-20 -mx-4 md:mx-0">
        {GALLERY.map(({ src, alt }, i) => (
          <button key={src} type="button" onClick={() => setOpen(i)} aria-label={`Open photo: ${alt}`}
            className="photo-tile relative aspect-[2/3] w-[57.15%] md:w-[30.77%] overflow-hidden group even:-ml-[14.3%] [&:nth-child(n+3)]:-mt-[26%] md:[&:nth-child(n+3)]:mt-0 md:[&:not(:first-child)]:-ml-[7.69%] hover:z-10 focus-visible:z-10">
            <Image src={src} alt={alt} fill sizes="(max-width: 768px) 50vw, 240px"
              className="object-cover transition-all duration-700 group-hover:scale-110 brightness-[0.85] group-hover:brightness-110" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: "rgba(0,0,0,0.55)", color: "var(--fire-light)", boxShadow: "0 0 0 1px rgba(201,168,76,0.5)" }}>
              <Expand size={18} />
            </span>
          </button>
        ))}
      </div>

      {open !== null && createPortal(
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center" role="dialog" aria-modal="true" aria-label="Studio photos"
          style={{ background: "rgba(5,5,5,0.97)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", animation: "fadeSlide 0.3s ease-out" }}
          onClick={() => setOpen(null)}
          onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
            touchX.current = null;
          }}>
          <button onClick={() => setOpen(null)} aria-label="Close" className="absolute top-4 right-4 w-11 h-11 rounded-full flex items-center justify-center z-10"
            style={{ background: "rgba(255,255,255,0.08)", color: "#fff" }}><X size={20} /></button>

          <div className="relative w-[92vw] h-[78vh] max-w-5xl" onClick={(e) => e.stopPropagation()}>
            {GALLERY.map(({ src, alt }, i) => (
              <Image key={src} src={src} alt={alt} fill sizes="92vw"
                className="object-contain transition-all duration-500"
                style={{ opacity: i === open ? 1 : 0, transform: i === open ? "scale(1)" : "scale(0.97)" }} />
            ))}
          </div>

          <div className="mt-5 flex items-center gap-6" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => go(-1)} aria-label="Previous photo" className="w-11 h-11 rounded-full flex items-center justify-center btn-outline"><ChevronLeft size={20} /></button>
            <span className="text-sm font-mono tabular-nums" style={{ color: "var(--muted)" }}>
              <span style={{ color: "var(--fire-light)" }}>{String(open + 1).padStart(2, "0")}</span> / {String(GALLERY.length).padStart(2, "0")}
            </span>
            <button onClick={() => go(1)} aria-label="Next photo" className="w-11 h-11 rounded-full flex items-center justify-center btn-outline"><ChevronRight size={20} /></button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
