"use client";
import { useEffect, useRef, useState } from "react";

// A paragraph is a list of runs; italic runs are emphasis. A quote block is pulled out
// on its own as a big gold quote with who said it.
export type StoryRun = { text: string; italic?: boolean };
export type StoryBlock = StoryRun[] | { quote: string; by: string } | { punch: string };

const words = (text: string) =>
  text.split(/(\s+)/).map((part, i) => (/^\s+$/.test(part) || part === "" ? part : <span key={i} className="sw">{part}</span>));

// The story lights up word by word as you scroll through it, like a lyric sheet following the track.
// Text renders fully lit on the server and for reduced-motion visitors; dimming starts only after mount.
export default function ScrollStory({ paragraphs }: { paragraphs: StoryBlock[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const root = ref.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const all = Array.from(root.querySelectorAll<HTMLElement>(".sw"));
    const t = window.setTimeout(() => setReady(true), 0);
    let lit = -1, ticking = false;
    const update = () => {
      ticking = false;
      const r = root.getBoundingClientRect(), vh = window.innerHeight;
      // Starts when the story's top reaches 80% down the screen, done when its bottom reaches 55%
      const start = vh * 0.8, end = vh * 0.55;
      const p = Math.min(1, Math.max(0, (start - r.top) / (r.height + start - end)));
      const n = Math.round(p * all.length);
      if (n === lit) return;
      all.forEach((w, i) => w.classList.toggle("lit", i < n));
      lit = n;
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => { window.clearTimeout(t); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, []);

  return (
    <div ref={ref} className={`scroll-story ${ready ? "is-ready" : ""}`}>
      {paragraphs.map((block, pi) => {
        if ("quote" in block) {
          return (
            <figure key={pi} className="story-quote">
              <span className="story-quote-mark" aria-hidden="true">&ldquo;</span>
              <blockquote>{words(block.quote)}</blockquote>
              <figcaption>— {block.by}</figcaption>
            </figure>
          );
        }
        if ("punch" in block) return <p key={pi} className="story-punch">{words(block.punch)}</p>;
        return (
          <p key={pi} className={pi === 0 ? "story-first" : undefined}>
            {block.map((run, ri) => (run.italic ? <em key={ri}>{words(run.text)}</em> : <span key={ri}>{words(run.text)}</span>))}
          </p>
        );
      })}
    </div>
  );
}
