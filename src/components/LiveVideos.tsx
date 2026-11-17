"use client";
import { useEffect, useState } from "react";
import { Play, X, ExternalLink, Radio } from "lucide-react";
import type { ChannelVideo } from "@/lib/youtube";
import ScrollReveal from "./ScrollReveal";

const watchUrl = (v: ChannelVideo) =>
  v.kind === "short" ? `https://www.youtube.com/shorts/${v.id}` : `https://www.youtube.com/watch?v=${v.id}`;
const thumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
// Shorts have a full-size vertical thumbnail; the standard one is letterboxed and blurry
const thumbFor = (v: ChannelVideo, big: boolean) =>
  v.kind === "short" ? `https://i.ytimg.com/vi/${v.id}/oardefault.jpg` : big ? `https://i.ytimg.com/vi/${v.id}/maxresdefault.jpg` : thumb(v.id);
const embedSrc = (id: string, autoplay: boolean) =>
  `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1${autoplay ? "&autoplay=1" : ""}`;

function formatDate(iso?: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function Meta({ v }: { v: ChannelVideo }) {
  const parts = [formatDate(v.published), v.views != null ? `${v.views.toLocaleString()} views` : null].filter(Boolean);
  if (!parts.length) return null;
  return <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{parts.join(" · ")}</p>;
}

// Thumbnail with a play button. Embeddable videos open in the on-page player;
// the rest open on YouTube (embedding is switched off for them in YouTube Studio).
function Thumb({ v, onPlay, big = false }: { v: ChannelVideo; onPlay: (v: ChannelVideo) => void; big?: boolean }) {
  const vertical = v.kind === "short";
  const inner = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={thumbFor(v, big)} alt="" loading={big ? "eager" : "lazy"}
        // Not every video has a full-HD thumbnail — fall back to the standard one
        onError={(e) => { const img = e.currentTarget; if (!img.src.endsWith("/hqdefault.jpg")) img.src = thumb(v.id); }}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <div className="absolute inset-0" style={{ background: big
        ? "linear-gradient(to top, rgba(10,10,10,0.92), rgba(10,10,10,0.25) 45%, transparent 70%), linear-gradient(to right, rgba(10,10,10,0.5), transparent 55%)"
        : "linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.05) 55%)" }} />
      <span className={`play-btn absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${big ? "w-20 h-20 md:w-24 md:h-24" : "w-14 h-14"}`}
        style={{ background: "linear-gradient(135deg,#A8892E,#C9A84C,#E5C76B)", boxShadow: "0 0 30px rgba(201,168,76,0.45)" }}>
        <Play size={big ? 36 : 22} fill="#000" color="#000" className="ml-1" />
      </span>
      {!v.embeddable && (
        <span className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase"
          style={{ background: "rgba(0,0,0,0.7)", color: "#fff" }}>
          YouTube <ExternalLink size={10} />
        </span>
      )}
    </>
  );
  const cls = `group relative block w-full overflow-hidden rounded-lg ${vertical ? "aspect-[9/16]" : "aspect-video"}`;
  const style = { background: "#000", boxShadow: "0 20px 50px rgba(0,0,0,0.55)" };
  const link = v.embeddable ? (
    <button type="button" onClick={() => onPlay(v)} className={cls} style={style} aria-label={`Play ${v.title}`}>{inner}</button>
  ) : (
    <a href={watchUrl(v)} target="_blank" rel="noopener noreferrer" className={cls} style={style} aria-label={`Watch ${v.title} on YouTube`}>{inner}</a>
  );
  // Ambient glow: a blurred copy of the thumbnail lights up the page around the video
  return (
    <div className={`thumb-wrap relative ${big ? "is-big" : ""}`} data-tilt={big ? "" : undefined}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={thumbFor(v, false)} alt="" aria-hidden="true" loading="lazy" className="ambi absolute inset-0 w-full h-full object-cover rounded-lg pointer-events-none" />
      {link}
    </div>
  );
}

function Section({ label, title, items, onPlay, cols }: { label: string; title: string; items: ChannelVideo[]; onPlay: (v: ChannelVideo) => void; cols: string }) {
  if (!items.length) return null;
  const vertical = items[0].kind === "short";
  return (
    <section className="mb-14 md:mb-20 min-w-0">
      <p className="eyebrow mb-2">{label}</p>
      <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight mb-6 md:mb-8">{title}</h2>
      <div className={`grid gap-x-4 gap-y-8 md:gap-x-5 ${cols}`}>
        {items.map((v, i) => (
          <ScrollReveal key={v.id} delay={(i % 4) * 0.1}>
            <Thumb v={v} onPlay={onPlay} />
            <p className={`font-bold text-white mt-3 leading-snug ${vertical ? "text-xs md:text-sm" : "text-sm md:text-base"}`}>{v.title}</p>
            {!vertical && <Meta v={v} />}
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}

export default function LiveVideos({ liveNowId, streams, shorts, videos }: {
  liveNowId: string | null; streams: ChannelVideo[]; shorts: ChannelVideo[]; videos: ChannelVideo[];
}) {
  const [playing, setPlaying] = useState<ChannelVideo | null>(null);

  useEffect(() => {
    if (!playing) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setPlaying(null); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [playing]);

  // The newest stream is featured at the top; if nothing is streamed yet, the newest video is
  const featured = streams[0] ?? videos[0];
  const pastStreams = streams.slice(1);
  const otherVideos = streams.length ? videos : videos.slice(1);

  return (
    <>
      {liveNowId && (
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-widest" style={{ background: "#dc2626", color: "#fff" }}>
              <Radio size={14} className="animate-pulse" /> LIVE NOW
            </span>
          </div>
          <div className="relative w-full aspect-video rounded-lg overflow-hidden" style={{ boxShadow: "0 0 60px rgba(220,38,38,0.25)" }}>
            <iframe className="absolute inset-0 w-full h-full" src={embedSrc(liveNowId, true) + "&mute=1"} title="Luchi Beats live now"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen />
          </div>
          <a href={`https://www.youtube.com/watch?v=${liveNowId}`} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-3 text-sm underline" style={{ color: "var(--muted)" }}>
            Join the chat on YouTube <ExternalLink size={13} />
          </a>
        </section>
      )}

      {featured && featured.id !== liveNowId && (
        <ScrollReveal className="relative mb-16 md:mb-24">
          <Thumb v={featured} onPlay={setPlaying} big />
          {/* Title block: under the video on phones, over its lower-left corner on desktop */}
          <div className="md:absolute md:left-0 md:bottom-0 md:max-w-[60%] pt-5 md:p-10 pointer-events-none">
            <p className="eyebrow mb-2">{streams.length ? "Latest Stream" : "Latest Video"}</p>
            <h2 className="over-photo text-2xl md:text-5xl font-black text-white tracking-tight leading-[1.05]">{featured.title}</h2>
            <div className="over-photo"><Meta v={featured} /></div>
          </div>
        </ScrollReveal>
      )}

      <div className={pastStreams.length && shorts.length ? "lg:grid lg:grid-cols-[1.7fr_1fr] lg:gap-14" : ""}>
        <Section label="Replays" title="Past Streams" items={pastStreams} onPlay={setPlaying}
          cols={shorts.length ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"} />
        <Section label="Shorts" title="Studio Clips" items={shorts} onPlay={setPlaying}
          cols={pastStreams.length ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-2" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"} />
      </div>
      <Section label="On the Channel" title="More Videos" items={otherVideos} onPlay={setPlaying}
        cols="grid-cols-1 sm:grid-cols-2 md:grid-cols-3" />

      {playing && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.96)" }}
          onClick={() => setPlaying(null)} role="dialog" aria-modal="true" aria-label={playing.title}>
          <button onClick={() => setPlaying(null)} aria-label="Close video"
            className="absolute top-4 right-4 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110 z-10"
            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff" }}>
            <X size={20} />
          </button>
          <div onClick={(e) => e.stopPropagation()}
            className={playing.kind === "short" ? "relative h-[80vh] max-h-[800px] aspect-[9/16] max-w-full" : "relative w-full max-w-[960px] aspect-video"}>
            <iframe className="absolute inset-0 w-full h-full rounded-lg" src={embedSrc(playing.id, true)} title={playing.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen />
          </div>
          <p className="mt-5 text-lg md:text-xl font-black text-white text-center" onClick={(e) => e.stopPropagation()}>{playing.title}</p>
        </div>
      )}
    </>
  );
}
