"use client";
import { useEffect, useState } from "react";
import { Play, X, ExternalLink, Radio } from "lucide-react";
import type { ChannelVideo } from "@/lib/youtube";
import ScrollReveal from "./ScrollReveal";

const watchUrl = (v: ChannelVideo) =>
  v.kind === "short" ? `https://www.youtube.com/shorts/${v.id}` : `https://www.youtube.com/watch?v=${v.id}`;
const thumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
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
      <img src={big ? `https://i.ytimg.com/vi/${v.id}/maxresdefault.jpg` : thumb(v.id)} alt="" loading={big ? "eager" : "lazy"}
        // Not every video has a full-HD thumbnail — fall back to the standard one
        onError={(e) => { const img = e.currentTarget; if (!img.src.endsWith("/hqdefault.jpg")) img.src = thumb(v.id); }}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.05) 55%)" }} />
      <span className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${big ? "w-20 h-20" : "w-14 h-14"}`}
        style={{ background: "linear-gradient(135deg,#A8892E,#C9A84C,#E5C76B)", boxShadow: "0 0 30px rgba(201,168,76,0.45)" }}>
        <Play size={big ? 32 : 22} fill="#000" color="#000" className="ml-1" />
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
  return v.embeddable ? (
    <button type="button" onClick={() => onPlay(v)} className={cls} style={style} aria-label={`Play ${v.title}`}>{inner}</button>
  ) : (
    <a href={watchUrl(v)} target="_blank" rel="noopener noreferrer" className={cls} style={style} aria-label={`Watch ${v.title} on YouTube`}>{inner}</a>
  );
}

function Section({ label, title, items, onPlay }: { label: string; title: string; items: ChannelVideo[]; onPlay: (v: ChannelVideo) => void }) {
  if (!items.length) return null;
  const vertical = items[0].kind === "short";
  return (
    <section className="mb-14 md:mb-20">
      <p className="text-xs tracking-[0.3em] mb-2" style={{ color: "var(--gold)" }}>{label}</p>
      <h2 className="text-xl md:text-2xl font-black text-white mb-5 md:mb-6">{title}</h2>
      <div className={vertical ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4" : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5"}>
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
        <section className="mb-14 md:mb-20">
          <p className="text-xs tracking-[0.3em] mb-2" style={{ color: "var(--gold)" }}>{streams.length ? "LATEST STREAM" : "LATEST VIDEO"}</p>
          <h2 className="text-xl md:text-3xl font-black text-white mb-5">{featured.title}</h2>
          <ScrollReveal>
            <Thumb v={featured} onPlay={setPlaying} big />
            <Meta v={featured} />
          </ScrollReveal>
        </section>
      )}

      <Section label="REPLAYS" title="Past Streams" items={pastStreams} onPlay={setPlaying} />
      <Section label="SHORTS" title="Studio Clips" items={shorts} onPlay={setPlaying} />
      <Section label="ON THE CHANNEL" title="More Videos" items={otherVideos} onPlay={setPlaying} />

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
