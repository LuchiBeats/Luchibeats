"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Volume2, VolumeX, Maximize2 } from "lucide-react";

// The 11/14 live stream on the homepage: the recap (from Instagram, re-scored with "Maestro")
// and a vertical behind-the-scenes reel with its original sound, shown in the same 16:9 frame.
// Each plays silently while it's on screen and pauses when it isn't; the visitor taps for sound,
// and only one can have sound at a time. The original VP9 files are used where the browser can
// play them (untouched picture); everything else gets a near-identical H.264 copy.
// Nothing downloads until the video is close to view.
const SOUND_EVENT = "lb-recap-sound";

// Blurred, darkened copy of the video's own picture painted behind it, so a vertical clip
// fills a 16:9 frame like the recap. Drawn from the same <video> into a tiny canvas
// (no second download or decode) a few times a second while it plays.
function useBackdrop(video: React.RefObject<HTMLVideoElement | null>, canvas: React.RefObject<HTMLCanvasElement | null>, on: boolean) {
  useEffect(() => {
    const v = video.current, c = canvas.current;
    if (!on || !v || !c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    let raf = 0, last = 0;
    // Centre crop of the frame at the canvas's 16:9 shape
    const paint = () => {
      const vw = v.videoWidth, vh = v.videoHeight;
      if (!vw || !vh) return;
      const sh = Math.min(vh, (vw * c.height) / c.width);
      try { ctx.drawImage(v, 0, (vh - sh) / 2, vw, sh, 0, 0, c.width, c.height); } catch {}
    };
    const draw = (now: number) => {
      if (now - last > 66) { last = now; paint(); }
      raf = requestAnimationFrame(draw);
    };
    const start = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); };
    const stop = () => cancelAnimationFrame(raf);
    v.addEventListener("play", start);
    v.addEventListener("pause", stop);
    v.addEventListener("loadeddata", paint);
    return () => { stop(); v.removeEventListener("play", start); v.removeEventListener("pause", stop); v.removeEventListener("loadeddata", paint); };
  }, [video, canvas, on]);
}

function RecapVideo({ id, base, label, codecs, vertical = false }: { id: string; base: string; label: string; codecs: string; vertical?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const bg = useRef<HTMLCanvasElement>(null);
  useBackdrop(ref, bg, vertical);
  const [muted, setMuted] = useState(true);
  const heardOnce = useRef(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    // Play whenever it's on screen. Loading starts slightly earlier; if it comes into view at
    // the same moment loading starts, the load would cancel the play, so retry once it can play.
    let visible = false;
    const tryPlay = () => { if (visible) v.play().catch(() => {}); };
    v.addEventListener("canplay", tryPlay);
    const near = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { v.preload = "auto"; v.load(); near.disconnect(); }
    }, { rootMargin: "600px 0px" });
    const seen = new IntersectionObserver(([e]) => {
      visible = e.intersectionRatio >= 0.35;
      if (visible) tryPlay(); else v.pause();
    }, { threshold: [0, 0.35] });
    // Another video turned its sound on: go quiet
    const onOther = (e: Event) => {
      if ((e as CustomEvent<string>).detail !== id && !v.muted) { v.muted = true; setMuted(true); }
    };
    near.observe(v);
    seen.observe(v);
    window.addEventListener(SOUND_EVENT, onOther);
    return () => { near.disconnect(); seen.disconnect(); v.removeEventListener("canplay", tryPlay); window.removeEventListener(SOUND_EVENT, onOther); };
  }, [id]);

  const toggleSound = () => {
    const v = ref.current;
    if (!v) return;
    // First time the sound comes on, start from the top
    if (v.muted && !heardOnce.current) { v.currentTime = 0; heardOnce.current = true; }
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted) window.dispatchEvent(new CustomEvent(SOUND_EVENT, { detail: id }));
    v.play().catch(() => {});
  };

  const fullscreen = () => {
    const v = ref.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (!v) return;
    if (v.requestFullscreen) v.requestFullscreen().catch(() => {});
    else v.webkitEnterFullscreen?.();
  };

  return (
    <div className={`live-recap relative aspect-video${vertical ? " is-vertical" : ""}`}>
      {vertical && <canvas ref={bg} width={48} height={27} className="live-recap-bg" aria-hidden="true"
        style={{ backgroundImage: `url(${base}-poster.webp)` }} />}
      <video ref={ref} muted loop playsInline preload="none" poster={`${base}-poster.webp`}
        onClick={toggleSound} className="live-recap-video cursor-pointer" aria-label={label}>
        <source src={`${base}.mp4`} type={`video/mp4; codecs="${codecs}"`} />
        <source src={`${base}-h264.mp4`} type="video/mp4" />
      </video>
      <div className="live-recap-controls">
        <button type="button" onClick={toggleSound} className={`live-recap-sound${muted ? " is-muted" : ""}`}
          aria-label={muted ? "Turn sound on" : "Turn sound off"} aria-pressed={!muted}>
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          <span>{muted ? "Tap for sound" : "Sound on"}</span>
        </button>
        <button type="button" onClick={fullscreen} className="live-recap-icon" aria-label="Full screen"><Maximize2 size={17} /></button>
      </div>
    </div>
  );
}

export default function LiveRecap() {
  return (
    <section data-light="gold" className="relative max-w-6xl mx-auto px-4 pt-10 md:pt-16 pb-10 md:pb-16 text-center">
      <p className="eyebrow mb-3">Luchi Beats Presents</p>
      <h2 className="section-title mb-8 md:mb-10">The 11/14 Live Stream</h2>

      <div className="live-recap-pair">
        <figure className="live-recap-main">
          <RecapVideo id="recap" base="/video/live-recap" codecs="vp09.00.40.08, mp4a.40.2"
            label="11/14 live stream recap, music: Maestro by Luchi Beats" />
          <figcaption className="live-recap-cap">The Recap <span>· Music: <b>Maestro</b> (Prod. Luchi Beats)</span></figcaption>
        </figure>
        <figure className="live-recap-side">
          <RecapVideo id="bts" base="/video/live-bts" codecs="vp09.00.40.08, mp4a.40.5" vertical
            label="Behind the scenes at the 11/14 live stream" />
          <figcaption className="live-recap-cap">Behind the Scenes</figcaption>
        </figure>
      </div>

      <Link href="/live" data-magnetic className="btn-outline mt-8 md:mt-10 inline-flex items-center gap-2 px-8 py-3 rounded text-sm tracking-wide">
        Watch the Streams <ArrowRight size={16} />
      </Link>
    </section>
  );
}
