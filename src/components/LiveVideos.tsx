"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Permanent_Marker, VT323 } from "next/font/google";
import { ExternalLink, Play } from "lucide-react";
import type { ChannelVideo } from "@/lib/youtube";
import ScrollReveal from "./ScrollReveal";

// The Live page as a living-room setup: every stream is a VHS tape on a shelf, every clip a
// camcorder tape. Click one and it goes into the VCR under the TV; the VCR buttons
// (play, pause, rewind, fast-forward, stop, eject) really control the video.

const marker = Permanent_Marker({ weight: "400", subsets: ["latin"], display: "swap" });
const vcr = VT323({ weight: "400", subsets: ["latin"], display: "swap" });

const watchUrl = (v: ChannelVideo) =>
  v.kind === "short" ? `https://www.youtube.com/shorts/${v.id}` : `https://www.youtube.com/watch?v=${v.id}`;
const poster = (v: ChannelVideo) =>
  v.kind === "short" ? `https://i.ytimg.com/vi/${v.id}/oardefault.jpg` : `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`;
const embedSrc = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1&autoplay=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`;

const shortDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" }).replace(/\//g, "·") : "";
const stampDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }).toUpperCase().replace(",", "") : "";
const counter = (s: number) => {
  const t = Math.max(0, Math.floor(s));
  return `${Math.floor(t / 3600)}:${String(Math.floor((t % 3600) / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
};
const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// stopped: tape in, picture paused on the cover · loading: tape going in / static · on: the YouTube player is up
type Phase = "empty" | "loading" | "stopped" | "on";

/* ── Talks to the YouTube player inside the TV (no extra scripts: the player's postMessage API) ── */
function useYouTube(frame: React.RefObject<HTMLIFrameElement | null>) {
  const [time, setTime] = useState(0);
  const [state, setState] = useState(-1); // 1 playing, 2 paused, 0 ended, 3 buffering
  useEffect(() => {
    const on = (e: MessageEvent) => {
      if (!/^https:\/\/www\.youtube(-nocookie)?\.com$/.test(e.origin) || e.source !== frame.current?.contentWindow) return;
      let d: { event?: string; info?: { currentTime?: number; playerState?: number } | number } | null = null;
      try { d = typeof e.data === "string" ? JSON.parse(e.data) : e.data; } catch { return; }
      if (!d) return;
      if (d.event === "infoDelivery" && d.info && typeof d.info === "object") {
        if (typeof d.info.currentTime === "number") setTime(d.info.currentTime);
        if (typeof d.info.playerState === "number") setState(d.info.playerState);
      }
      if (d.event === "onStateChange" && typeof d.info === "number") setState(d.info);
    };
    window.addEventListener("message", on);
    return () => window.removeEventListener("message", on);
  }, [frame]);
  const post = useCallback((msg: object) => frame.current?.contentWindow?.postMessage(JSON.stringify({ id: 1, channel: "widget", ...msg }), "*"), [frame]);
  const cmd = useCallback((func: string, args: unknown[] = []) => post({ event: "command", func, args }), [post]);
  const listen = useCallback(() => post({ event: "listening" }), [post]);
  const reset = useCallback(() => { setTime(0); setState(-1); }, []);
  return { time, state, cmd, listen, reset };
}

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
function Tape({ v, n, inDeck, onPick }: { v: ChannelVideo; n: number; inDeck: boolean; onPick: (v: ChannelVideo) => void }) {
  const clip = v.kind === "short";
  return (
    <div className={`tape-slot ${clip ? "is-clip" : ""}`}>
      <div className="tape-ghost" aria-hidden="true" style={{ opacity: inDeck ? 1 : 0 }}>
        <span className={vcr.className}>IN THE VCR</span>
      </div>
      <button type="button" onClick={() => onPick(v)} aria-label={`Put in the VCR: ${v.title}`} className={`vhs ${inDeck ? "is-out" : ""}`} disabled={inDeck}>
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
  title: string; label: string; items: ChannelVideo[]; numberFrom?: number; current: ChannelVideo | null; onPick: (v: ChannelVideo) => void;
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

/* ── VCR button ── */
function Key({ label, title, name, onClick, active, disabled }: { label: string; title: string; name: string; onClick: () => void; active?: boolean; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={title} title={title} className={`vcr-key ${active ? "is-active" : ""}`}>
      <span className="vcr-key-cap">{label}</span>
      <span className="vcr-key-name">{name}</span>
    </button>
  );
}

export default function LiveVideos({ liveNowId, streams, shorts, videos }: {
  liveNowId: string | null; streams: ChannelVideo[]; shorts: ChannelVideo[]; videos: ChannelVideo[];
}) {
  const live: ChannelVideo | null = liveNowId ? { id: liveNowId, title: "Live now", kind: "stream", embeddable: true } : null;
  const [current, setCurrent] = useState<ChannelVideo | null>(live ?? streams[0] ?? videos[0] ?? shorts[0] ?? null);
  const [phase, setPhase] = useState<Phase>(current ? "stopped" : "empty");
  const [slot, setSlot] = useState<"" | "inserting" | "ejecting">("");
  const [flash, setFlash] = useState<string | null>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const tvRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const yt = useYouTube(frame);
  const isLive = !!live && current?.id === live.id;

  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };
  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => () => clearTimers(), []);

  const say = (text: string) => { setFlash(text); later(() => setFlash(null), 1600); };

  // Turn the player on (tape plays)
  const start = useCallback(() => {
    if (!current) return;
    if (!current.embeddable) { window.open(watchUrl(current), "_blank", "noopener,noreferrer"); return; }
    yt.reset();
    setPhase("on");
    setFlash("PLAY ▶"); later(() => setFlash(null), 2200);
  }, [current, yt]);

  // Tape from the shelf: into the VCR slot, static, then play
  const pick = useCallback((v: ChannelVideo) => {
    clearTimers();
    const tv = tvRef.current;
    if (tv) {
      const r = tv.getBoundingClientRect();
      if (r.top < 60 || r.bottom > innerHeight) tv.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "center" });
    }
    const fast = reducedMotion();
    setCurrent(v); yt.reset();
    setPhase("loading"); setSlot("inserting");
    later(() => setSlot(""), fast ? 0 : 1100);
    later(() => {
      if (!v.embeddable) { setPhase("stopped"); return; }
      setPhase("on"); setFlash("PLAY ▶"); later(() => setFlash(null), 2200);
    }, fast ? 0 : 1700);
  }, [yt]);

  const playPause = () => {
    if (phase === "stopped") return start();
    if (phase !== "on") return;
    if (yt.state === 1 || yt.state === 3) { yt.cmd("pauseVideo"); say("❚❚ PAUSE"); }
    else { yt.cmd("playVideo"); say("PLAY ▶"); }
  };
  const seek = (d: number) => {
    if (phase !== "on" || isLive) return;
    yt.cmd("seekTo", [Math.max(0, yt.time + d), true]);
    say(d < 0 ? "◀◀ REW" : "FF ▶▶");
  };
  const stop = () => {
    if (phase !== "on") return;
    clearTimers(); yt.reset(); setPhase("stopped"); say("STOP ■");
  };
  const eject = () => {
    if (!current) return;
    clearTimers(); yt.reset();
    setPhase("loading"); setSlot("ejecting"); setFlash("EJECT ⏏");
    later(() => { setSlot(""); setCurrent(null); setPhase("empty"); setFlash(null); }, reducedMotion() ? 0 : 900);
  };

  // Ask the player to report its time and state once it has loaded
  const onFrameLoad = () => { [0, 400, 1200, 2500].forEach((ms) => later(() => yt.listen(), ms)); };

  const playing = phase === "on" && (yt.state === 1 || yt.state === 3 || yt.state === -1);
  const paused = phase === "on" && yt.state === 2;
  const mode = phase === "empty" ? "NO TAPE" : slot === "inserting" ? "LOAD" : slot === "ejecting" ? "EJECT" : phase === "loading" ? "TRACK"
    : phase === "stopped" ? "STOP" : isLive ? "LIVE" : paused ? "PAUSE" : yt.state === 0 ? "END" : "PLAY";
  const osdLeft = flash ?? (phase === "empty" ? "NO TAPE" : isLive && phase === "on" ? "● LIVE" : phase === "loading" ? "TRACKING" : phase === "stopped" ? "STOP ■" : paused ? "❚❚ PAUSE" : "PLAY ▶");
  const showOsd = flash !== null || phase !== "on" || paused;
  const vertical = current?.kind === "short";

  return (
    <>
      <ScrollReveal className="mb-16 md:mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1.55fr_1fr] gap-8 lg:gap-12 items-center">
          {/* ── TV on top of the VCR ── */}
          <div ref={tvRef} className="relative">
            {current && (
              // The screen lights up the room around the set
              // eslint-disable-next-line @next/next/no-img-element
              <img src={poster(current)} alt="" aria-hidden="true" className="absolute inset-x-[6%] top-[4%] w-[88%] h-[62%] object-cover pointer-events-none transition-opacity duration-700"
                style={{ filter: "blur(70px) saturate(1.8)", opacity: phase === "empty" ? 0 : 0.5 }} />
            )}

            <div className="tv" data-tilt="">
              <div className="tv-bezel">
                <div className="tv-screen">
                  {current && phase !== "on" && phase !== "empty" && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={poster(current)} alt="" className={`absolute inset-0 w-full h-full ${vertical ? "object-contain" : "object-cover"} tv-picture`} />
                  )}
                  {current && phase === "on" && (
                    <iframe ref={frame} key={current.id} onLoad={onFrameLoad} className="absolute inset-0 w-full h-full" src={embedSrc(current.id)} title={current.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen />
                  )}
                  <Static on={phase === "loading" || phase === "empty"} />

                  {current && phase === "stopped" && (
                    current.embeddable ? (
                      <button type="button" onClick={start} aria-label={`Play ${current.title}`} className="absolute inset-0 flex items-center justify-center group z-[3]">
                        <span className={`${vcr.className} tv-osd-big`}><Play size={34} fill="currentColor" /> PRESS PLAY</span>
                      </button>
                    ) : (
                      <a href={watchUrl(current)} target="_blank" rel="noopener noreferrer" className="absolute inset-0 flex items-center justify-center z-[3]">
                        <span className={`${vcr.className} tv-osd-big`}>PLAYS ON YOUTUBE <ExternalLink size={22} /></span>
                      </a>
                    )
                  )}
                  {phase === "empty" && <span className={`${vcr.className} absolute inset-0 flex items-center justify-center tv-osd-big z-[3] pointer-events-none`}>INSERT TAPE</span>}

                  <div className={`${vcr.className} tv-osd`} style={{ opacity: showOsd ? 1 : 0 }}>
                    <span className={isLive && phase === "on" ? "text-[#ff5050]" : ""}>{osdLeft}</span>
                    <span>SP</span>
                  </div>
                  {current?.published && phase !== "empty" && (
                    <div className={`${vcr.className} tv-stamp`} style={{ opacity: showOsd ? 1 : 0 }}>{stampDate(current.published)}</div>
                  )}
                  <div className="tv-glass" aria-hidden="true" />
                </div>
              </div>
              {/* Lower front: speaker grille, badge, power */}
              <div className="tv-front">
                <span className="tv-grille" aria-hidden="true" />
                <span className="tv-badge">LUCHIVISION</span>
                <span className="flex items-center gap-3">
                  <span className={`tv-led ${phase === "on" ? "is-on" : ""}`} aria-hidden="true" />
                  <span className="tv-power" aria-hidden="true" />
                </span>
              </div>
            </div>

            {/* ── VCR ── */}
            <div className="vcr">
              <div className="vcr-row">
                <div className="vcr-left">
                  <span className="vcr-brand">LUCHIVISION</span>
                  <span className="vcr-sub">VIDEO CASSETTE RECORDER</span>
                </div>
                {/* Cassette slot with its spring flap */}
                <div className={`vcr-slot ${slot ? `is-${slot}` : ""} ${current && phase !== "empty" && !slot ? "is-loaded" : ""}`}>
                  {current && (
                    <span className="vcr-tape" aria-hidden="true">
                      <span className={`vcr-tape-label ${marker.className}`}>{current.kind === "short" ? "Clip" : "Tape"} · {current.title}</span>
                    </span>
                  )}
                  <span className="vcr-flap" aria-hidden="true" />
                </div>
                {/* Fluorescent display: mode + real tape counter */}
                <div className={`vcr-display ${vcr.className}`} aria-live="polite">
                  <span className="vcr-ghost" aria-hidden="true">8:88:88</span>
                  <span className="vcr-mode">{mode}</span>
                  <span className="vcr-count">{phase === "on" && !isLive ? counter(yt.time) : isLive && phase === "on" ? "LIVE" : "0:00:00"}</span>
                  <span className="vcr-tags"><span className={phase !== "empty" ? "on" : ""}>SP</span><span className={phase === "on" ? "on" : ""}>HI-FI</span></span>
                </div>
              </div>
              <div className="vcr-keys">
                <Key label="⏏" title="Eject" name="Eject" onClick={eject} disabled={!current} />
                <Key label="◀◀" title="Rewind 10 seconds" name="Rew" onClick={() => seek(-10)} disabled={phase !== "on" || isLive} />
                <Key label="▶" title="Play" name="Play" onClick={() => (phase === "on" ? (paused ? playPause() : undefined) : start())} active={playing} disabled={!current || phase === "loading"} />
                <Key label="❚❚" title="Pause" name="Pause" onClick={playPause} active={paused} disabled={phase !== "on"} />
                <Key label="■" title="Stop" name="Stop" onClick={stop} disabled={phase !== "on"} />
                <Key label="▶▶" title="Fast forward 10 seconds" name="FF" onClick={() => seek(10)} disabled={phase !== "on" || isLive} />
              </div>
            </div>
          </div>

          {/* ── Now playing ── */}
          <div>
            <p className="eyebrow mb-3">{isLive ? "Live Now" : phase === "empty" ? "VCR Empty" : "In the VCR"}</p>
            <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-[1.1]">
              {phase === "empty" || !current ? "Pick a tape off the shelf." : isLive ? "Live from the studio" : current.title}
            </h2>
            {current && phase !== "empty" && (current.published || current.views != null) && (
              <p className={`${vcr.className} mt-3 text-xl tracking-wider`} style={{ color: "var(--fire-light)" }}>
                {[stampDate(current.published), current.views != null ? `${current.views.toLocaleString()} VIEWS` : null].filter(Boolean).join("  ·  ")}
              </p>
            )}
            <div className="flex flex-wrap gap-3 mt-7">
              {current && phase === "stopped" && current.embeddable && (
                <button type="button" onClick={start} data-magnetic className="btn-gold inline-flex items-center gap-2 px-7 py-3 rounded text-sm tracking-wide">
                  <Play size={16} fill="currentColor" /> Play Tape
                </button>
              )}
              {current && phase !== "empty" && (
                <a href={watchUrl(current)} target="_blank" rel="noopener noreferrer" data-magnetic className="btn-outline inline-flex items-center gap-2 px-7 py-3 rounded text-sm tracking-wide">
                  {isLive ? "Join the chat on YouTube" : "Watch on YouTube"} <ExternalLink size={14} />
                </a>
              )}
            </div>
            <p className="mt-6 text-sm" style={{ color: "var(--muted)" }}>Use the VCR buttons to pause, rewind or skip ahead.</p>
          </div>
        </div>
      </ScrollReveal>

      <Shelf label="Replays" title="The Tape Wall" items={streams} current={current} onPick={pick} />
      <Shelf label="Shorts" title="Camcorder Clips" items={shorts} current={current} onPick={pick} />
      <Shelf label="On the Channel" title="More Tapes" items={videos} numberFrom={streams.length + 1} current={current} onPick={pick} />
    </>
  );
}
