"use client";
import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export type LightboxPhoto = { src: string; alt: string };

// Full-screen photo viewer: arrows / swipe to flip, Esc or click outside to close.
export default function Lightbox({ photos, open, setOpen, label }: {
  photos: LightboxPhoto[];
  open: number | null;
  setOpen: (i: number | null) => void;
  label: string;
}) {
  const touchX = useRef<number | null>(null);
  const n = photos.length;
  const go = useCallback((d: number) => { if (open !== null) setOpen((open + d + n) % n); }, [open, n, setOpen]);

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
  }, [open, go, setOpen]);

  if (open === null) return null;
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center" role="dialog" aria-modal="true" aria-label={label}
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
        {photos.map(({ src, alt }, i) => (
          <Image key={src} src={src} alt={alt} fill sizes="92vw"
            className="object-contain transition-all duration-500"
            style={{ opacity: i === open ? 1 : 0, transform: i === open ? "scale(1)" : "scale(0.97)" }} />
        ))}
      </div>

      <div className="mt-5 flex items-center gap-6" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => go(-1)} aria-label="Previous photo" className="w-11 h-11 rounded-full flex items-center justify-center btn-outline"><ChevronLeft size={20} /></button>
        <span className="text-sm font-mono tabular-nums" style={{ color: "var(--muted)" }}>
          <span style={{ color: "var(--fire-light)" }}>{String(open + 1).padStart(2, "0")}</span> / {String(n).padStart(2, "0")}
        </span>
        <button onClick={() => go(1)} aria-label="Next photo" className="w-11 h-11 rounded-full flex items-center justify-center btn-outline"><ChevronRight size={20} /></button>
      </div>
    </div>,
    document.body
  );
}
