"use client";
import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ringX = 0, ringY = 0, dotX = 0, dotY = 0;
    let raf: number;
    let active = false;

    const startLoop = () => {
      if (active) return;
      active = true;
      raf = requestAnimationFrame(animate);
    };

    const animate = () => {
      const dx = dotX - ringX;
      const dy = dotY - ringY;
      ringX += dx * 0.12;
      ringY += dy * 0.12;

      if (dot.current) dot.current.style.transform = `translate(${dotX}px, ${dotY}px)`;
      if (ring.current) ring.current.style.transform = `translate(${ringX}px, ${ringY}px)`;

      // Stop the loop once the ring has caught up — restart on next mousemove
      if (Math.abs(dx) < 0.05 && Math.abs(dy) < 0.05) {
        active = false;
        return;
      }
      raf = requestAnimationFrame(animate);
    };

    const onMove = (e: MouseEvent) => {
      dotX = e.clientX;
      dotY = e.clientY;
      startLoop();
    };

    const onEnter = () => {
      dot.current?.classList.add("cursor-hover");
      ring.current?.classList.add("cursor-hover");
    };
    const onLeave = () => {
      dot.current?.classList.remove("cursor-hover");
      ring.current?.classList.remove("cursor-hover");
    };

    const hoverEls: Element[] = [];
    window.addEventListener("mousemove", onMove);
    document.querySelectorAll("a, button").forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
      hoverEls.push(el);
    });

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      hoverEls.forEach((el) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
    };
  }, []);

  return (
    <>
      <div ref={dot} className="cursor-dot" />
      <div ref={ring} className="cursor-ring" />
    </>
  );
}
