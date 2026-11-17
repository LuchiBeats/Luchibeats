"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  const [duration, setDuration] = useState(0);
  useEffect(() => {
    const on = (e: MessageEvent) => {
      if (!/^https:\/\/www\.youtube(-nocookie)?\.com$/.test(e.origin) || e.source !== frame.current?.contentWindow) return;
      let d: { event?: string; info?: { currentTime?: number; playerState?: number; duration?: number } | number } | null = null;
      try { d = typeof e.data === "string" ? JSON.parse(e.data) : e.data; } catch { return; }
      if (!d) return;
      if (d.event === "infoDelivery" && d.info && typeof d.info === "object") {
        if (typeof d.info.currentTime === "number") setTime(d.info.currentTime);
        if (typeof d.info.duration === "number" && d.info.duration > 0) setDuration(d.info.duration);
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
  const reset = useCallback(() => { setTime(0); setState(-1); setDuration(0); }, []);
  return { time, state, duration, cmd, listen, reset };
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

/* ── Episode numbers ──
   Streams are numbered as episodes, oldest first. A title that says "Episode N" keeps N;
   "Pt 1" / "Pt 2" streams of the same show share one episode number and get a part. */
type Tag = { kind: "EP" | "CLIP" | "TAPE"; num: number; part?: number };
const pad = (n: number) => String(n).padStart(2, "0");
const tagText = (t?: Tag) => (t ? `${t.kind} ${pad(t.num)}${t.part ? ` · PT ${t.part}` : ""}` : "");

function buildTags(streams: ChannelVideo[], shorts: ChannelVideo[], videos: ChannelVideo[]) {
  const tags = new Map<string, Tag>();
  const time = (v: ChannelVideo) => (v.published ? Date.parse(v.published) : 0);
  const byBase = new Map<string, number>();
  let next = 1;
  [...streams].sort((a, b) => time(a) - time(b)).forEach((v) => {
    const ep = v.title.match(/episode\s*#?\s*(\d+)/i);
    const pt = v.title.match(/\b(?:pt|part)\.?\s*(\d+)/i);
    let num: number;
    if (ep) num = Number(ep[1]);
    else {
      const base = v.title.replace(/\s*[-–]?\s*\b(?:pt|part)\.?\s*\d+\b.*$/i, "").trim().toLowerCase();
      num = byBase.get(base) ?? next;
      byBase.set(base, num);
    }
    next = Math.max(next, num + 1);
    tags.set(v.id, { kind: "EP", num, part: pt ? Number(pt[1]) : undefined });
  });
  [...shorts].sort((a, b) => time(a) - time(b)).forEach((v, i) => tags.set(v.id, { kind: "CLIP", num: i + 1 }));
  [...videos].sort((a, b) => time(a) - time(b)).forEach((v, i) => tags.set(v.id, { kind: "TAPE", num: i + 1 }));
  return tags;
}

/* ── A cassette ── */
function TapeFace({ v, tag }: { v: ChannelVideo; tag?: Tag }) {
  const clip = v.kind === "short";
  return (
    <>
        <span className="vhs-label">
          <span className="vhs-stripe" />
          <span className={`vhs-title ${marker.className}`}>{v.title}</span>
          <span className={`vhs-meta ${vcr.className}`}>
            <span>{tagText(tag)}</span>
            <span>{shortDate(v.published)}</span>
          </span>
        </span>
        <span className="vhs-window" aria-hidden="true">
          <span className="reel" /><span className="vhs-tape" /><span className="reel" />
        </span>
        <span className="vhs-brand" aria-hidden="true">{clip ? "VHS-C" : "VHS"}</span>
    </>
  );
}

/* ── The cardboard sleeve the tape lives in, printed with the episode number ── */
function Sleeve({ v, tag, empty }: { v: ChannelVideo; tag?: Tag; empty: boolean }) {
  const word = tag?.kind === "EP" ? "Episode" : tag?.kind === "CLIP" ? "Clip" : "Tape";
  return (
    <span className="sleeve" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={poster(v)} alt="" loading="lazy" className="sleeve-art" />
      <span className="sleeve-mouth" />
      <span className="sleeve-spine" />
      <span className="sleeve-top">
        <span>LUCHI BEATS LIVE</span>
        <span className={vcr.className}>{shortDate(v.published)}</span>
      </span>
      <span className="sleeve-ep">
        <span className="sleeve-word">{word}</span>
        <span className="sleeve-num">{tag ? pad(tag.num) : "··"}</span>
      </span>
      {tag?.part && <span className={`sleeve-part ${marker.className}`}>Pt {tag.part}</span>}
      <span className="sleeve-bottom">
        <span className="sleeve-vhs">{v.kind === "short" ? "VHS-C" : "VHS"}</span>
        <span className="sleeve-series">{tag?.kind === "EP" ? "Luchi Beats & Friends" : v.kind === "short" ? "Studio Clips" : "On the Channel"}</span>
      </span>
      <span className="sleeve-gloss" />
      {empty && <span className={`sleeve-sticker ${vcr.className}`}>IN THE VCR</span>}
    </span>
  );
}

type Grab = (v: ChannelVideo, e: React.PointerEvent<HTMLButtonElement>) => void;

/* ── A tape in its sleeve on the shelf: grab it and drop it in the VCR (or just click it) ── */
function Tape({ v, tag, inDeck, lifted, onPick, onGrab }: { v: ChannelVideo; tag?: Tag; inDeck: boolean; lifted: boolean; onPick: (v: ChannelVideo) => void; onGrab: Grab }) {
  const clip = v.kind === "short";
  return (
    <div className={`tape-slot ${clip ? "is-clip" : ""}`}>
      <button type="button" onPointerDown={(e) => onGrab(v, e)} onClick={() => onPick(v)}
        aria-label={`Put in the VCR: ${tagText(tag)} ${v.title}`} className="tape-btn" disabled={inDeck}>
        <span className={`vhs vhs-body ${inDeck ? "is-out" : ""} ${lifted ? "is-lifted" : ""}`}>
          <TapeFace v={v} tag={tag} />
        </span>
        <Sleeve v={v} tag={tag} empty={inDeck} />
      </button>
    </div>
  );
}

function Shelf({ title, label, items, tags, current, lifted, onPick, onGrab }: {
  title: string; label: string; items: ChannelVideo[]; tags: Map<string, Tag>; current: ChannelVideo | null; lifted: string | null; onPick: (v: ChannelVideo) => void; onGrab: Grab;
}) {
  if (!items.length) return null;
  return (
    <section className="mb-14 md:mb-20">
      <p className="eyebrow mb-2 text-center">{label}</p>
      <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight mb-6 text-center">{title}</h2>
      <div className="shelf">
        <div className="shelf-row">
          {items.map((v) => <Tape key={v.id} v={v} tag={tags.get(v.id)} inDeck={current?.id === v.id} lifted={lifted === v.id} onPick={onPick} onGrab={onGrab} />)}
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
  const tags = useMemo(() => buildTags(streams, shorts, videos), [streams, shorts, videos]);

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

  /* ── Grab a tape and drop it in the VCR ── */
  type Drag = { v: ChannelVideo; rect: DOMRect; offX: number; offY: number; x: number; y: number };
  const [drag, setDrag] = useState<Drag | null>(null);
  const [over, setOver] = useState(false);
  const floatRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const dragged = useRef(false);

  const grab: Grab = (v, e) => {
    if (e.button !== 0 || current?.id === v.id) return;
    // Only the tape comes out; the sleeve stays on the shelf
    const rect = (e.currentTarget.querySelector(".vhs-body") ?? e.currentTarget).getBoundingClientRect();
    const sx = e.clientX, sy = e.clientY, id = e.pointerId;
    const offX = sx - rect.left, offY = sy - rect.top;
    const p = { x: sx, y: sy };
    let started = false, inside = false, raf = 0;
    dragged.current = false;

    const place = (lift = 1) => {
      const el = floatRef.current;
      if (el) el.style.transform = `translate(${p.x - offX}px, ${p.y - offY}px) rotate(${-5 * lift}deg) scale(${1 + 0.06 * lift})`;
    };
    const check = () => {
      const r = tvRef.current?.getBoundingClientRect();
      const now = !!r && p.x > r.left - 30 && p.x < r.right + 30 && p.y > r.top - 30 && p.y < r.bottom + 40;
      if (now !== inside) { inside = now; setOver(now); }
    };
    // Scroll the page while the tape is held near the top or bottom edge, so the VCR can be reached
    const tick = () => {
      const edge = 90;
      if (p.y < edge) window.scrollBy(0, -Math.ceil((edge - p.y) / 5));
      else if (p.y > innerHeight - edge) window.scrollBy(0, Math.ceil((p.y - (innerHeight - edge)) / 5));
      check();
      raf = requestAnimationFrame(tick);
    };
    const move = (ev: PointerEvent) => {
      if (ev.pointerId !== id) return;
      p.x = ev.clientX; p.y = ev.clientY;
      if (!started) {
        if (Math.hypot(p.x - sx, p.y - sy) < 8) return;
        started = true; dragged.current = true;
        document.documentElement.classList.add("is-dragging-tape");
        setDrag({ v, rect, offX, offY, x: p.x, y: p.y });
        raf = requestAnimationFrame(tick);
      }
      ev.preventDefault();
      place();
      check();
    };
    const finish = (ev: PointerEvent) => {
      if (ev.pointerId !== id) return;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("is-dragging-tape");
      if (!started) return;
      const dropIn = inside && ev.type === "pointerup";
      const el = floatRef.current;
      const fast = reducedMotion();
      if (el) {
        el.style.transition = fast ? "none" : "transform 0.32s cubic-bezier(.4,0,.2,1), opacity 0.32s";
        if (dropIn && slotRef.current) {
          // Fly into the slot
          const t = slotRef.current.getBoundingClientRect();
          const sc = Math.min(0.6, t.width / rect.width);
          el.style.transform = `translate(${t.left + t.width / 2 - (rect.width * sc) / 2}px, ${t.top + t.height / 2 - (rect.height * sc) / 2}px) scale(${sc})`;
          el.style.transformOrigin = "0 0";
          el.style.opacity = "0";
        } else {
          // Back to its spot on the shelf
          el.style.transform = `translate(${rect.left}px, ${rect.top}px) rotate(0deg) scale(1)`;
        }
      }
      later(() => {
        setDrag(null); setOver(false);
        if (dropIn) pick(v);
      }, fast ? 0 : 320);
    };
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", finish);
  };
  // A click right after a drag is not a click
  const clickPick = useCallback((v: ChannelVideo) => {
    if (dragged.current) { dragged.current = false; return; }
    pick(v);
  }, [pick]);

  // Ask the player to report its time and state once it has loaded
  const onFrameLoad = () => { [0, 400, 1200, 2500].forEach((ms) => later(() => yt.listen(), ms)); };

  /* ── Search: drag along the tape to any point (or scroll the wheel over the bar) ── */
  const [scrub, setScrub] = useState<number | null>(null);
  const canSearch = phase === "on" && !isLive && yt.duration > 0;
  const shownTime = scrub ?? yt.time;
  const scrubTo = (t: number) => {
    const next = Math.min(Math.max(0, t), yt.duration);
    setFlash(next >= shownTime ? "SEARCH ▶▶" : "◀◀ SEARCH");
    setScrub(next);
    yt.cmd("seekTo", [next, false]); // preview while dragging
  };
  const commitScrub = () => {
    if (scrub === null) return;
    yt.cmd("seekTo", [scrub, true]);
    later(() => { setScrub(null); setFlash(null); }, 700);
  };
  // Mouse wheel over the search bar skips 5 s per notch
  const searchRef = useRef<HTMLDivElement>(null);
  const wheelState = useRef({ canSearch, time: shownTime, duration: yt.duration });
  useEffect(() => { wheelState.current = { canSearch, time: shownTime, duration: yt.duration }; }, [canSearch, shownTime, yt.duration]);
  useEffect(() => {
    const el = searchRef.current;
    if (!el) return;
    let idle = 0;
    const onWheel = (e: WheelEvent) => {
      const s = wheelState.current;
      if (!s.canSearch) return;
      e.preventDefault();
      const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      const t = Math.min(Math.max(0, s.time + (delta > 0 ? 5 : -5)), s.duration);
      setFlash(delta > 0 ? "SEARCH ▶▶" : "◀◀ SEARCH");
      setScrub(t);
      wheelState.current.time = t;
      clearTimeout(idle);
      idle = window.setTimeout(() => { frame.current?.contentWindow?.postMessage(JSON.stringify({ id: 1, channel: "widget", event: "command", func: "seekTo", args: [t, true] }), "*"); window.setTimeout(() => { setScrub(null); setFlash(null); }, 700); }, 250);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => { el.removeEventListener("wheel", onWheel); clearTimeout(idle); };
  }, []);

  const playing = phase === "on" && (yt.state === 1 || yt.state === 3 || yt.state === -1);
  const paused = phase === "on" && yt.state === 2;
  const mode = scrub !== null ? "SEARCH" : drag ? (over ? "DROP IT" : "INSERT") : phase === "empty" ? "NO TAPE" : slot === "inserting" ? "LOAD" : slot === "ejecting" ? "EJECT" : phase === "loading" ? "TRACK"
    : phase === "stopped" ? "STOP" : isLive ? "LIVE" : paused ? "PAUSE" : yt.state === 0 ? "END" : "PLAY";
  const osdLeft = flash ?? (phase === "empty" ? "NO TAPE" : isLive && phase === "on" ? "● LIVE" : phase === "loading" ? "TRACKING" : phase === "stopped" ? "STOP ■" : paused ? "❚❚ PAUSE" : "PLAY ▶");
  const showOsd = flash !== null || phase !== "on" || paused;
  const vertical = current?.kind === "short";

  return (
    <>
      <ScrollReveal className="mb-16 md:mb-24">
        <div className="flex flex-col items-center gap-10 md:gap-12">
          {/* ── TV on top of the VCR ── */}
          <div ref={tvRef} className="relative w-full max-w-[760px]">
            {current && (
              // The screen lights up the room around the set
              // eslint-disable-next-line @next/next/no-img-element
              <img src={poster(current)} alt="" aria-hidden="true" className="absolute inset-x-[6%] top-[4%] w-[88%] h-[62%] object-cover pointer-events-none transition-opacity duration-700"
                style={{ filter: "blur(70px) saturate(1.8)", opacity: phase === "empty" ? 0 : 0.5 }} />
            )}

            <div className={`drop-glow ${drag ? "is-on" : ""} ${over ? "is-over" : ""}`} aria-hidden="true" />
            {/* ── One cabinet: TV on top, VCR deck built into the base ── */}
            <div className="combo" data-tilt="">
            <div className="tv">
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

            {/* ── VCR deck (built in) ── */}
            <div className="vcr">
              <div className="vcr-row">
                {/* Cassette slot with its spring flap */}
                <div ref={slotRef} className={`vcr-slot ${slot ? `is-${slot}` : ""} ${current && phase !== "empty" && !slot && !drag ? "is-loaded" : ""} ${drag ? "is-target" : ""} ${over ? "is-over" : ""}`}>
                  {current && !drag && (
                    <span className="vcr-tape" aria-hidden="true">
                      <span className={`vcr-tape-label ${marker.className}`}>{tagText(tags.get(current.id)) || "Tape"} · {current.title}</span>
                    </span>
                  )}
                  <span className="vcr-flap" aria-hidden="true" />
                </div>
                {/* Fluorescent display: mode + real tape counter */}
                <div className={`vcr-display ${vcr.className}`} aria-live="polite">
                  <span className="vcr-ghost" aria-hidden="true">8:88:88</span>
                  <span className="vcr-mode">{mode}</span>
                  <span className="vcr-count">{phase === "on" && !isLive ? counter(shownTime) : isLive && phase === "on" ? "LIVE" : "0:00:00"}</span>
                  <span className="vcr-tags"><span className={phase !== "empty" ? "on" : ""}>SP</span><span className={phase === "on" ? "on" : ""}>HI-FI</span></span>
                </div>
              </div>
              {/* Tape search: the whole tape, start to end */}
              <div ref={searchRef} className={`vcr-search ${canSearch ? "" : "is-off"} ${scrub !== null ? "is-scrubbing" : ""}`}
                style={{ ["--p" as string]: `${yt.duration ? (shownTime / yt.duration) * 100 : 0}%` }}>
                <span className={`${vcr.className} vcr-search-time`}>{counter(canSearch ? shownTime : 0)}</span>
                <div className="vcr-search-track">
                  <span className="vcr-search-ticks" aria-hidden="true" />
                  <span className="vcr-search-fill" aria-hidden="true" />
                  <span className="vcr-search-knob" aria-hidden="true" />
                  <input type="range" min={0} max={Math.max(1, Math.floor(yt.duration))} step={1} value={Math.floor(shownTime)}
                    disabled={!canSearch} aria-label="Search through the tape"
                    aria-valuetext={`${counter(shownTime)} of ${counter(yt.duration)}`}
                    onChange={(e) => scrubTo(Number(e.target.value))}
                    onPointerUp={commitScrub} onKeyUp={commitScrub} onBlur={commitScrub} />
                </div>
                <span className={`${vcr.className} vcr-search-time is-total`}>{isLive && phase === "on" ? "LIVE" : counter(canSearch ? yt.duration : 0)}</span>
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
            <span className="combo-model" aria-hidden="true">TV · VCR COMBO</span>
            </div>
          </div>

          {/* ── Now playing ── */}
          <div className="text-center max-w-2xl">
            <p className="eyebrow mb-3">{isLive ? "Live Now" : phase === "empty" ? "VCR Empty" : `In the VCR${tags.get(current?.id ?? "") ? ` · ${tagText(tags.get(current?.id ?? ""))}` : ""}`}</p>
            <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-[1.1]">
              {phase === "empty" || !current ? "Pick a tape off the shelf." : isLive ? "Live from the studio" : current.title}
            </h2>
            {current && phase !== "empty" && (current.published || current.views != null) && (
              <p className={`${vcr.className} mt-3 text-xl tracking-wider`} style={{ color: "var(--fire-light)" }}>
                {[stampDate(current.published), current.views != null ? `${current.views.toLocaleString()} VIEWS` : null].filter(Boolean).join("  ·  ")}
              </p>
            )}
            <div className="flex flex-wrap justify-center gap-3 mt-7">
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
            <p className="mt-6 text-sm" style={{ color: "var(--muted)" }}>Grab a tape off the shelf and drop it in the VCR. Drag the search bar (or scroll on it) to move through the tape.</p>
          </div>
        </div>
      </ScrollReveal>

      <Shelf label="Replays" title="The Tape Wall" items={streams} tags={tags} current={current} lifted={drag?.v.id ?? null} onPick={clickPick} onGrab={grab} />
      <Shelf label="Shorts" title="Camcorder Clips" items={shorts} tags={tags} current={current} lifted={drag?.v.id ?? null} onPick={clickPick} onGrab={grab} />
      <Shelf label="On the Channel" title="More Tapes" items={videos} tags={tags} current={current} lifted={drag?.v.id ?? null} onPick={clickPick} onGrab={grab} />

      {/* The tape in your hand */}
      {drag && createPortal(
        <div ref={floatRef} aria-hidden="true" className={`tape-float ${drag.v.kind === "short" ? "is-clip" : ""} ${over ? "is-over" : ""}`}
          style={{ width: drag.rect.width, height: drag.rect.height, transform: `translate(${drag.x - drag.offX}px, ${drag.y - drag.offY}px) rotate(-5deg) scale(1.06)` }}>
          <div className="vhs"><TapeFace v={drag.v} tag={tags.get(drag.v.id)} /></div>
        </div>,
        document.body
      )}
    </>
  );
}
