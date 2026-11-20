"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Play, X } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import type { ProductionVideo } from "@/lib/beats-store";
import { ytHD, ytFallback, ytRef } from "@/lib/ytThumb";

const DEFAULT_VIDEOS: ProductionVideo[] = [
  { id: "zGzpIqC5zvQ", artist: "A Boogie Wit Da Hoodie",       title: "Timeless",            credits: "Vocal Recording" },
  { id: "DMjz34ubhg4", artist: "Mach City",                    title: "Machi 99",            credits: "Beat · Vocal Recording · Mix" },
  { id: "6a94jphQcaY", artist: "Mach City",                    title: "Make Em Trip",        credits: "Beat · Vocal Recording · Mix" },
  { id: "gPyvvEYe3Ng", artist: "Trey Budden x Oskama Esteban", title: "Cage Bird Sings",     credits: "Beat · Vocal Recording · Mix" },
  { id: "aLmZ0nV9_gc", artist: "A.D Ft K Godess",              title: "Work",                credits: "Beat · Vocal Recording · Mix" },
  { id: "dft7z1yWCDg", artist: "Trey Budden",                  title: "PUBLIK!",             credits: "Beat · Vocal Recording · Mix" },
  { id: "PPnuRGkrRuY", artist: "Swizzyy Marleyy",              title: "Super Gango",         credits: "Vocal Recording · Mix" },
  { id: "IwreOeCvK1M", artist: "Mysonne",                      title: "That's How We On It", credits: "Vocal Recording · Mix" },
  { id: "Oma1SZ8utmw", artist: "G Wreck ft Coi Leray",         title: "Froze",               credits: "Beat · Vocal Recording · Mix" },
];

// Roles come from the credits text the admin types ("Beat · Vocal Recording · Mix")
const FILTERS = [
  { key: "all",   label: "All",      test: () => true },
  { key: "beat",  label: "Produced", test: (c: string) => /beat|produc/i.test(c) },
  { key: "rec",   label: "Recorded", test: (c: string) => /record|vocal/i.test(c) },
  { key: "mix",   label: "Mixed",    test: (c: string) => /mix|master/i.test(c) },
] as const;
type FilterKey = (typeof FILTERS)[number]["key"];

const roles = (credits: string) => credits.split(/\s*[·•|,]\s*/).map((r) => r.trim()).filter(Boolean);
const still = ytHD;
// YouTube keeps three small frames from inside every video: flipping through them
// on hover gives a quick silent preview without loading a player.
const frames = (id: string) => [1, 2, 3].map((n) => `https://i.ytimg.com/vi/${id}/hq${n}.jpg`);

function Card({ v, n, onOpen }: { v: ProductionVideo; n: number; onOpen: (v: ProductionVideo) => void }) {
  const [frame, setFrame] = useState(-1);
  const timer = useRef(0);
  const start = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let i = 0; setFrame(0);
    window.clearInterval(timer.current);
    timer.current = window.setInterval(() => { i = (i + 1) % 3; setFrame(i); }, 650);
  };
  const stop = () => { window.clearInterval(timer.current); setFrame(-1); };
  useEffect(() => () => window.clearInterval(timer.current), []);

  return (
    <button type="button" onClick={() => onOpen(v)} onMouseEnter={start} onMouseLeave={stop} onFocus={start} onBlur={stop}
      className="credit-card group" aria-label={`Play ${v.artist} — ${v.title}`}>
      <span className="credit-thumb">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={still(v.id)} ref={ytRef} onLoad={ytFallback} onError={ytFallback} alt="" loading="lazy" className="credit-img" />
        {frames(v.id).map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={src} src={frame >= 0 ? src : undefined} alt="" aria-hidden="true" className="credit-img credit-frame" style={{ opacity: frame === i ? 1 : 0 }} />
        ))}
        <span className="credit-shade" />
        <span className="credit-num">{String(n).padStart(2, "0")}</span>
        <span className="credit-play"><Play size={20} fill="currentColor" className="ml-0.5" /></span>
        {frame >= 0 && <span className="credit-preview">PREVIEW</span>}
      </span>
      <span className="credit-text">
        <span className="credit-artist">{v.artist}</span>
        <span className="credit-title">{v.title}</span>
        <span className="credit-roles">
          {roles(v.credits).map((r) => <span key={r} className="credit-role">{r}</span>)}
        </span>
      </span>
    </button>
  );
}

export default function Productions({ videos: videosProp }: { videos?: ProductionVideo[] }) {
  const videos = videosProp?.length ? videosProp : DEFAULT_VIDEOS;
  const [filter, setFilter] = useState<FilterKey>("all");
  const [open, setOpen] = useState<ProductionVideo | null>(null);

  const counts = useMemo(() => Object.fromEntries(FILTERS.map((f) => [f.key, videos.filter((v) => f.test(v.credits)).length])), [videos]);
  const shown = useMemo(() => {
    const f = FILTERS.find((x) => x.key === filter)!;
    return videos.map((v, i) => ({ v, n: i + 1 })).filter(({ v }) => f.test(v.credits));
  }, [videos, filter]);

  const close = useCallback(() => setOpen(null), []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, close]);

  return (
    <section id="productions" data-light="gold" className="relative py-14 md:py-20 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4">
        <ScrollReveal className="text-center mb-8 md:mb-10">
          <p className="eyebrow mb-3">Straight From the Studio</p>
          <h2 className="section-title">Productions</h2>
          <p className="mt-4 md:text-lg max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.65)" }}>
            Records I produced, recorded and mixed. Pick a role to filter, and click any video to watch.
          </p>
        </ScrollReveal>

        {/* Filter by role */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-10 md:mb-12" role="group" aria-label="Filter productions by role">
          {FILTERS.filter((f) => counts[f.key] > 0).map((f) => (
            <button key={f.key} type="button" onClick={() => setFilter(f.key)} aria-pressed={filter === f.key}
              className={`credit-filter ${filter === f.key ? "is-on" : ""}`}>
              {f.label} <span className="credit-filter-count">{counts[f.key]}</span>
            </button>
          ))}
        </div>

        <ul key={filter} className="credit-grid">
          {shown.map(({ v, n }, i) => (
            <li key={v.id} className="credit-item" style={{ animationDelay: `${Math.min(i, 8) * 0.05}s` }}>
              <Card v={v} n={n} onOpen={setOpen} />
            </li>
          ))}
        </ul>
      </div>

      {/* Full-screen player */}
      {open && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center px-4" style={{ background: "rgba(5,4,3,0.96)", animation: "fadeSlide 0.3s ease-out" }}
          onClick={close} role="dialog" aria-modal="true" aria-label={`${open.artist} — ${open.title}`}>
          <button type="button" onClick={close} aria-label="Close video" autoFocus
            className="absolute top-4 right-4 w-11 h-11 rounded-full flex items-center justify-center z-10"
            style={{ background: "rgba(255,255,255,0.08)", color: "#fff" }}><X size={20} /></button>
          <div className="relative w-full max-w-[1000px] aspect-video" onClick={(e) => e.stopPropagation()}>
            <iframe className="absolute inset-0 w-full h-full rounded-lg"
              src={`https://www.youtube-nocookie.com/embed/${open.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`} title={`${open.artist} — ${open.title}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen />
          </div>
          <div className="mt-5 text-center" onClick={(e) => e.stopPropagation()}>
            <p className="eyebrow mb-1">{open.artist}</p>
            <p className="text-xl md:text-2xl font-black text-white">{open.title}</p>
            <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>{open.credits}</p>
          </div>
        </div>
      )}
    </section>
  );
}
