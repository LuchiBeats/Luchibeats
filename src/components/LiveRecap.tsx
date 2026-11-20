"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Volume2, VolumeX, Maximize2 } from "lucide-react";

// The 11/14 live stream recap (from Instagram) with "Maestro" as its soundtrack.
// Plays silently while it's on screen and pauses when it isn't; the visitor taps for sound.
// The original VP9 file is used where the browser can play it (12 MB, untouched picture);
// everything else gets a near-identical H.264 copy. Nothing loads until it's close to view.
export default function LiveRecap() {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const heardOnce = useRef(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const near = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { v.preload = "auto"; v.load(); near.disconnect(); }
    }, { rootMargin: "600px 0px" });
    const seen = new IntersectionObserver(([e]) => {
      if (e.intersectionRatio >= 0.35) v.play().catch(() => {});
      else v.pause();
    }, { threshold: [0, 0.35] });
    near.observe(v);
    seen.observe(v);
    return () => { near.disconnect(); seen.disconnect(); };
  }, []);

  const toggleSound = () => {
    const v = ref.current;
    if (!v) return;
    // First time the sound comes on, start from the top so the beat plays from its intro
    if (v.muted && !heardOnce.current) { v.currentTime = 0; heardOnce.current = true; }
    v.muted = !v.muted;
    setMuted(v.muted);
    v.play().catch(() => {});
  };

  const fullscreen = () => {
    const v = ref.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (!v) return;
    if (v.requestFullscreen) v.requestFullscreen().catch(() => {});
    else v.webkitEnterFullscreen?.();
  };

  return (
    <section data-light="gold" className="relative max-w-6xl mx-auto px-4 pt-10 md:pt-16 pb-10 md:pb-16 text-center">
      <p className="eyebrow mb-3">Luchi Beats Presents</p>
      <h2 className="section-title mb-3">The 11/14 Live Stream</h2>
      <p className="mb-8 md:mb-10 text-sm md:text-base" style={{ color: "rgba(255,255,255,0.6)" }}>
        Music: <span style={{ color: "var(--fire-light)" }}>Maestro</span> (Prod. Luchi Beats)
      </p>

      <div className="live-recap relative mx-auto">
        <video ref={ref} muted loop playsInline preload="none" poster="/video/live-recap-poster.webp"
          onClick={toggleSound} className="w-full h-auto block cursor-pointer" aria-label="11/14 live stream recap, music: Maestro by Luchi Beats">
          <source src="/video/live-recap.mp4" type='video/mp4; codecs="vp09.00.40.08, mp4a.40.2"' />
          <source src="/video/live-recap-h264.mp4" type="video/mp4" />
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

      <Link href="/live" data-magnetic className="btn-outline mt-8 md:mt-10 inline-flex items-center gap-2 px-8 py-3 rounded text-sm tracking-wide">
        Watch the Streams <ArrowRight size={16} />
      </Link>
    </section>
  );
}
