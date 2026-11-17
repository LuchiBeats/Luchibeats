"use client";
import { useEffect, useRef, useState } from "react";

// A paragraph is a list of runs; italic runs are the artists' quotes.
export type StoryRun = { text: string; italic?: boolean };

// The story lights up word by word as you scroll through it, like a lyric sheet following the track.
// Text renders fully lit on the server and for reduced-motion visitors; dimming starts only after mount.
export default function ScrollStory({ paragraphs }: { paragraphs: StoryRun[][] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const root = ref.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const words = Array.from(root.querySelectorAll<HTMLElement>(".sw"));
    setReady(true);
    let lit = -1, ticking = false;
    const update = () => {
      ticking = false;
      const r = root.getBoundingClientRect(), vh = window.innerHeight;
      // Starts when the story's top reaches 80% down the screen, done when its bottom reaches 55%
      const start = vh * 0.8, end = vh * 0.55;
      const p = Math.min(1, Math.max(0, (start - r.top) / (r.height + start - end)));
      const n = Math.round(p * words.length);
      if (n === lit) return;
      words.forEach((w, i) => w.classList.toggle("lit", i < n));
      lit = n;
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, []);

  return (
    <div ref={ref} className={`scroll-story space-y-5 md:text-[17px] leading-relaxed ${ready ? "is-ready" : ""}`} style={{ color: "#fff" }}>
      {paragraphs.map((runs, pi) => (
        <p key={pi}>
          {runs.map((run, ri) => {
            const parts = run.text.split(/(\s+)/);
            const words = parts.map((part, wi) =>
              /^\s+$/.test(part) || part === "" ? part : <span key={wi} className="sw">{part}</span>
            );
            return run.italic ? <em key={ri}>{words}</em> : <span key={ri}>{words}</span>;
          })}
        </p>
      ))}
    </div>
  );
}
