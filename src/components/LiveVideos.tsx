"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Permanent_Marker, VT323 } from "next/font/google";
import { ExternalLink, Play } from "lucide-react";
import type { ChannelVideo } from "@/lib/youtube";
import ScrollReveal from "./ScrollReveal";

// The Live page as a tape wall: every stream is a VHS tape on a shelf, every clip a
// camcorder tape. Click one and it goes into the TV (static, then "PLAY ▶").

const marker = Permanent_Marker({ weight: "400", subsets: ["latin"], display: "swap" });
const vcr = VT323({ weight: "400", subsets: ["latin"], display: "swap" });

const watchUrl = (v: ChannelVideo) =>
  v.kind === "short" ? `https://www.youtube.com/shorts/${v.id}` : `https://www.youtube.com/watch?v=${v.id}`;
const poster = (v: ChannelVideo) =>
  v.kind === "short" ? `https://i.ytimg.com/vi/${v.id}/oardefault.jpg` : `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`;
const embedSrc = (id: string, autoplay: boolean) =>
  `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1${autoplay ? "&autoplay=1" : ""}`;

const shortDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" }).replace(/\//g, "·") : "";
const stampDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }).toUpperCase().replace(",", "") : "";
const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type Phase = "ready" | "static" | "playing" | "empty";

/* ── TV static ── */
function Static({ on }: { on: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!on) return;
    const c = ref.current!.getContext("2d")!;
    const w = 160, h = 120, img = c.createImageData(w, h);
    let raf = 0;
    const draw = () => {
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 255;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
      }
      c.putImageData(img, 0, 0);
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [on]);
  return <canvas ref={ref} width={160} height={120} aria-hidden="true" className="absolute inset-0 w-full h-full transition-opacity duration-200" style={{ opacity: on ? 1 : 0, imageRendering: "pixelated" }} />;
}

/* ── A cassette on the shelf ── */
function Tape({ v, n, inDeck, onPick }: { v: ChannelVideo; n: number; inDeck: boolean; onPick: (v: ChannelVideo, el: HTMLElement) => void }) {
  const clip = v.kind === "short";
  return (
    <div className={`tape-slot ${clip ? "is-clip" : ""}`}>
      {/* Empty slot outline stays behind while the tape is in the TV */}
      <div className="tape-ghost" aria-hidden="true" style={{ opacity: inDeck ? 1 : 0 }}>
        <span className={vcr.className}>IN THE DECK</span>
      </div>
      <button type="button" onClick={(e) => onPick(v, e.currentTarget)} aria-label={`Play tape: ${v.title}`}
        className={`vhs ${inDeck ? "is-out" : ""}`} disabled={inDeck}>
        <span className="vhs-label">
          <span className="vhs-stripe" />
          <span className={`vhs-title ${marker.className}`}>{v.title}</span>
          <span className={`vhs-meta ${vcr.className}`}>
            <span>{clip ? "CLIP" : "TAPE"} {String(n).padStart(2, "0")}</span>
            <span>{shortDate(v.published)}</span>
          </span>
        </span>
        <span className="vhs-window" aria-hidden="true">
          <span className="reel" /><span className="vhs-tape" /><span className="reel" />
        </span>
        <span className="vhs-brand" aria-hidden="true">{clip ? "VHS-C" : "VHS"}</span>
      </button>
    </div>
  );
}

function Shelf({ title, label, items, numberFrom = 1, current, onPick }: {
  title: string; label: string; items: ChannelVideo[]; numberFrom?: number; current: ChannelVideo | null; onPick: (v: ChannelVideo, el: HTMLElement) => void;
}) {
  if (!items.length) return null;
  return (
    <section className="mb-14 md:mb-20">
      <p className="eyebrow mb-2">{label}</p>
      <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight mb-6">{title}</h2>
      <div className="shelf">
        <div className="shelf-row">
          {items.map((v, i) => <Tape key={v.id} v={v} n={numberFrom + i} inDeck={current?.id === v.id} onPick={onPick} />)}
        </div>
        <div className="shelf-plank" aria-hidden="true" />
      </div>
    </section>
  );
}

export default function LiveVideos({ liveNowId, streams, shorts, videos }: {
  liveNowId: string | null; streams: ChannelVideo[]; shorts: ChannelVideo[]; videos: ChannelVideo[];
}) {
  const live: ChannelVideo | null = liveNowId ? { id: liveNowId, title: "Live now", kind: "stream", embeddable: true } : null;
  const [current, setCurrent] = useState<ChannelVideo | null>(live ?? streams[0] ?? videos[0] ?? shorts[0] ?? null);
  const [phase, setPhase] = useState<Phase>(current ? "ready" : "empty");
  const [osd, setOsd] = useState(true);
  const tvRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const isLive = !!live && current?.id === live.id;

  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const play = useCallback(() => {
    setPhase("playing"); setOsd(true);
    later(() => setOsd(false), 2600);
  }, []);

  const pick = useCallback((v: ChannelVideo) => {
    timers.current.forEach(clearTimeout); timers.current = [];
    setCurrent(v);
    const tv = tvRef.current;
    if (tv) {
      const r = tv.getBoundingClientRect();
      if (r.top < 60 || r.bottom > innerHeight) tv.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "center" });
    }
    if (!v.embeddable) { setPhase("ready"); setOsd(true); return; }
    setPhase("static");
    later(() => play(), reducedMotion() ? 0 : 700);
  }, [play]);

  const eject = () => {
    timers.current.forEach(clearTimeout); timers.current = [];
    setPhase("static");
    later(() => { setCurrent(null); setPhase("empty"); }, reducedMotion() ? 0 : 450);
  };

  const osdLeft = phase === "empty" ? "NO TAPE" : isLive ? "● LIVE" : phase === "playing" ? "PLAY ▶" : phase === "static" ? "TRACKING" : "STOP ■";
  const vertical = current?.kind === "short";

  return (
    <>
      {/* ── TV + now playing ── */}
      <ScrollReveal className="mb-16 md:mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1.55fr_1fr] gap-8 lg:gap-12 items-center">
          <div ref={tvRef} className="relative">
            {/* The screen lights up the room around the TV */}
            {current && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={poster(current)} alt="" aria-hidden="true" className="absolute inset-[6%] w-[88%] h-[80%] object-cover pointer-events-none transition-opacity duration-700"
                style={{ filter: "blur(70px) saturate(1.8)", opacity: phase === "empty" ? 0 : 0.55 }} />
            )}
            <div className="crt relative" data-tilt="">
              <div className="crt-screen">
                {/* Picture */}
                {current && phase !== "playing" && phase !== "empty" && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={poster(current)} alt="" className={`absolute inset-0 w-full h-full ${vertical ? "object-contain" : "object-cover"} crt-picture`} />
                )}
                {current && phase === "playing" && (
                  <iframe key={current.id} className="absolute inset-0 w-full h-full" src={embedSrc(current.id, true)} title={current.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen />
                )}
                <Static on={phase === "static" || phase === "empty"} />

                {/* Big play / YouTube prompt over the stopped picture */}
                {current && phase === "ready" && (
                  current.embeddable ? (
                    <button type="button" onClick={play} aria-label={`Play ${current.title}`} className="absolute inset-0 flex items-center justify-center group z-[3]">
                      <span className={`${vcr.className} crt-osd-big`}><Play size={34} fill="currentColor" /> PRESS PLAY</span>
                    </button>
                  ) : (
                    <a href={watchUrl(current)} target="_blank" rel="noopener noreferrer" className="absolute inset-0 flex items-center justify-center z-[3]">
                      <span className={`${vcr.className} crt-osd-big`}>PLAYS ON YOUTUBE <ExternalLink size={22} /></span>
                    </a>
                  )
                )}
                {phase === "empty" && (
                  <span className={`${vcr.className} absolute inset-0 flex items-center justify-center crt-osd-big z-[3] pointer-events-none`}>INSERT TAPE</span>
                )}

                {/* On-screen display, like a VCR */}
                <div className={`${vcr.className} crt-osd`} style={{ opacity: osd || phase !== "playing" ? 1 : 0 }}>
                  <span className={isLive ? "text-[#ff5050]" : ""}>{osdLeft}</span>
                  <span>SP</span>
                </div>
                {current?.published && phase !== "empty" && (
                  <div className={`${vcr.className} crt-stamp`} style={{ opacity: osd || phase !== "playing" ? 1 : 0 }}>{stampDate(current.published)}</div>
                )}
                <div className="crt-glass" aria-hidden="true" />
              </div>

              {/* Front panel */}
              <div className="crt-panel">
                <span className="crt-brand">LUCHIVISION</span>
                <span className="flex items-center gap-3 md:gap-4">
                  <span className="crt-knob" aria-hidden="true" />
                  <span className="crt-knob" aria-hidden="true" />
                  {current && (
                    <button type="button" onClick={eject} className={`${vcr.className} crt-eject`} aria-label="Eject tape">⏏ EJECT</button>
                  )}
                  <span className={`crt-led ${phase === "playing" ? "is-on" : ""}`} aria-hidden="true" />
                </span>
              </div>
            </div>
          </div>

          {/* Now playing */}
          <div>
            <p className="eyebrow mb-3">{isLive ? "Live Now" : phase === "empty" ? "Deck Empty" : "In the Deck"}</p>
            <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-[1.1]">
              {phase === "empty" || !current ? "Pick a tape off the shelf." : isLive ? "Live from the studio" : current.title}
            </h2>
            {current && phase !== "empty" && (current.published || current.views != null) && (
              <p className={`${vcr.className} mt-3 text-xl tracking-wider`} style={{ color: "var(--fire-light)" }}>
                {[stampDate(current.published), current.views != null ? `${current.views.toLocaleString()} VIEWS` : null].filter(Boolean).join("  ·  ")}
              </p>
            )}
            <div className="flex flex-wrap gap-3 mt-7">
              {current && phase === "ready" && current.embeddable && (
                <button type="button" onClick={play} data-magnetic className="btn-gold inline-flex items-center gap-2 px-7 py-3 rounded text-sm tracking-wide">
                  <Play size={16} fill="currentColor" /> Play Tape
                </button>
              )}
              {current && phase !== "empty" && (
                <a href={watchUrl(current)} target="_blank" rel="noopener noreferrer" data-magnetic className="btn-outline inline-flex items-center gap-2 px-7 py-3 rounded text-sm tracking-wide">
                  {isLive ? "Join the chat on YouTube" : "Watch on YouTube"} <ExternalLink size={14} />
                </a>
              )}
            </div>
            <p className="mt-6 text-sm" style={{ color: "var(--muted)" }}>Every tape on the shelf plays right here.</p>
          </div>
        </div>
      </ScrollReveal>

      {/* ── The shelves ── */}
      <Shelf label="Replays" title="The Tape Wall" items={streams} current={current} onPick={pick} />
      <Shelf label="Shorts" title="Camcorder Clips" items={shorts} current={current} onPick={pick} />
      <Shelf label="On the Channel" title="More Tapes" items={videos} numberFrom={streams.length + 1} current={current} onPick={pick} />
    </>
  );
}
