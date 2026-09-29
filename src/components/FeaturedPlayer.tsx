"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import type { Beat } from "@/lib/types";
import { Play, Pause, ArrowRight } from "lucide-react";
import { registerAudio, unregisterAudio } from "./VisibilityPause";

// ── Tokens (matches /beats) ─────────────────────────────────────────────────────
const GOLD        = "#C9A84C";
const GOLD_BORDER = "rgba(201,168,76,0.28)";
const GOLD_GLOW   = "rgba(201,168,76,0.18)";
const BG_ROW      = "#0a0a0c";
const BG_ROW_ACTIVE = "rgba(201,168,76,0.04)";
const BORDER      = "#1a1a1e";
const MUTED       = "#3e3e45";
const DIM         = "#6e6e7a";

const FEATURED_COUNT = 3;

function fmt(s: number) {
  if (!isFinite(s) || s <= 0) return "0:00";
  const m = Math.floor(s / 60);
  return `${m}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
}

// Deterministic waveform bars seeded from beat id
function waveBars(id: string, n = 40): number[] {
  return Array.from({ length: n }, (_, i) => {
    const a = id.charCodeAt(i % id.length) || 60;
    const b = id.charCodeAt((i * 3) % id.length) || 40;
    const wave = Math.sin(i * 0.55 + a * 0.07) * 28 + Math.sin(i * 1.1 + b * 0.13) * 15;
    return Math.max(12, Math.min(92, 52 + wave));
  });
}

// ── Featured row ──────────────────────────────────────────────────────────────
function FeaturedRow({
  beat, playing, progress, currentTime, duration, onPlay, onSeek,
}: {
  beat: Beat;
  playing: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  onPlay: () => void;
  onSeek: (pct: number) => void;
}) {
  const bars = waveBars(beat.id);
  const barCount = bars.length;
  const fromPrice = beat.licenses.reduce((min, l) => Math.min(min, l.price), beat.licenses[0]?.price ?? 0);

  return (
    <div
      className="rounded-xl overflow-hidden transition-all"
      style={{
        background: playing ? BG_ROW_ACTIVE : BG_ROW,
        border: `1px solid ${playing ? GOLD_BORDER : BORDER}`,
        boxShadow: playing ? `0 0 30px rgba(201,168,76,0.06)` : "none",
      }}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Cover art + play */}
        <div className="relative flex-shrink-0 group" onClick={onPlay} style={{ cursor: "pointer" }}>
          {beat.imageUrl && beat.imageUrl !== "/images/beats/default.jpg" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={beat.imageUrl} alt={beat.title}
              className="w-14 h-14 md:w-16 md:h-16 rounded-lg object-cover"
              style={{ border: `1px solid ${playing ? GOLD_BORDER : BORDER}` }} />
          ) : (
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#111,#1a1a1a)", border: `1px solid ${playing ? GOLD_BORDER : BORDER}` }}>
              <span style={{ color: GOLD, fontSize: 20 }}>♪</span>
            </div>
          )}
          <div className="absolute inset-0 rounded-lg flex items-center justify-center transition-opacity"
            style={{ background: "rgba(0,0,0,0.55)", opacity: playing ? 1 : 0 }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "1"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = playing ? "1" : "0"; }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: GOLD, boxShadow: `0 0 16px rgba(201,168,76,0.5)` }}>
              {playing ? <Pause size={14} fill="#000" color="#000" /> : <Play size={14} fill="#000" color="#000" style={{ marginLeft: 2 }} />}
            </div>
          </div>
          {!playing && (
            <div className="absolute inset-0 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: "rgba(0,0,0,0.55)" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: GOLD }}>
                <Play size={14} fill="#000" color="#000" style={{ marginLeft: 2 }} />
              </div>
            </div>
          )}
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="min-w-0">
              <h3 className="font-black text-white text-sm md:text-base leading-tight truncate tracking-wide uppercase">{beat.title}</h3>
              <p className="text-xs mt-0.5" style={{ color: DIM }}>
                {beat.genre} · {beat.bpm} BPM · {beat.key}
              </p>
            </div>
            {playing && (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: GOLD, boxShadow: `0 0 6px ${GOLD}` }} />
                <span className="text-xs font-bold font-mono" style={{ color: GOLD }}>PLAYING</span>
              </div>
            )}
          </div>

          {/* Waveform */}
          <div
            className="relative flex items-end gap-px my-2 cursor-pointer select-none"
            style={{ height: 32 }}
            onClick={e => {
              const rect = e.currentTarget.getBoundingClientRect();
              onSeek((e.clientX - rect.left) / rect.width);
            }}
          >
            {bars.map((h, i) => {
              const pct = (i / barCount) * 100;
              const filled = playing && pct <= progress;
              return (
                <div key={i}
                  className="flex-1 rounded-sm transition-colors"
                  style={{
                    height: `${h}%`,
                    background: filled
                      ? `linear-gradient(180deg, ${GOLD}, rgba(201,168,76,0.5))`
                      : playing
                        ? "rgba(201,168,76,0.12)"
                        : "rgba(255,255,255,0.07)",
                    minWidth: 2,
                  }}
                />
              );
            })}
            {playing && (
              <div className="absolute right-0 -top-5 text-xs font-mono" style={{ color: DIM }}>
                {fmt(currentTime)} / {fmt(duration)}
              </div>
            )}
          </div>

          <Link href="/beats" className="text-xs font-bold inline-flex items-center gap-1 transition-colors" style={{ color: GOLD }}>
            Exclusive ${fromPrice} · One Owner Only <ArrowRight size={11} />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Player ────────────────────────────────────────────────────────────────────
export default function FeaturedPlayer() {
  const [beats, setBeats]         = useState<Beat[] | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [progress, setProgress]   = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration]   = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch("/api/beats")
      .then(r => r.ok ? r.json() : [])
      .then((data: Beat[]) => setBeats(data.slice(0, FEATURED_COUNT)))
      .catch(() => setBeats([]));
  }, []);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    registerAudio(audio);
    const onTime  = () => { setCurrentTime(audio.currentTime); setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0); };
    const onMeta  = () => setDuration(audio.duration);
    const onEnded = () => { setPlayingId(null); setProgress(0); setCurrentTime(0); setDuration(0); };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnded);
    return () => { audio.pause(); unregisterAudio(audio); audio.removeEventListener("timeupdate", onTime); audio.removeEventListener("loadedmetadata", onMeta); audio.removeEventListener("ended", onEnded); };
  }, []);

  const togglePlay = useCallback((beat: Beat) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playingId === beat.id) {
      if (audio.paused) audio.play(); else { audio.pause(); setPlayingId(null); }
      return;
    }
    audio.src = beat.audioUrl;
    audio.load();
    audio.play().then(() => setPlayingId(beat.id)).catch(() => {});
    setProgress(0); setCurrentTime(0); setDuration(0);
  }, [playingId]);

  const seek = useCallback((beat: Beat, pct: number) => {
    const audio = audioRef.current;
    if (!audio || playingId !== beat.id || !isFinite(audio.duration)) return;
    audio.currentTime = pct * audio.duration;
  }, [playingId]);

  // Loading skeleton
  if (beats === null) {
    return (
      <div className="space-y-3">
        {Array.from({ length: FEATURED_COUNT }).map((_, i) => (
          <div key={i} className="rounded-xl animate-pulse" style={{ background: BG_ROW, border: `1px solid ${BORDER}`, height: 108 }} />
        ))}
      </div>
    );
  }

  // Empty state — genuinely no live beats in the catalog
  if (beats.length === 0) {
    return (
      <div
        className="rounded-2xl overflow-hidden flex flex-col items-center justify-center py-20 px-6 text-center"
        style={{ background: "var(--surface)", border: "1px solid rgba(201,168,76,0.2)", boxShadow: "0 4px 60px rgba(0,0,0,0.5)" }}
      >
        <p className="text-xs tracking-[0.35em] font-bold mb-3" style={{ color: "var(--fire)" }}>BEATS STORE</p>
        <h3 className="text-3xl font-black text-white mb-3">New Beats Dropping Soon</h3>
        <p className="text-sm max-w-sm mb-8" style={{ color: "var(--muted)" }}>
          Stay tuned or reach out to get early access to the catalog.
        </p>
        <Link
          href="/contact"
          className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold transition-all hover:scale-105"
          style={{ background: "linear-gradient(90deg,#A8892E,#C9A84C,#E5C76B)", color: "#000" }}
        >
          Get Early Access <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {beats.map(beat => (
        <FeaturedRow
          key={beat.id}
          beat={beat}
          playing={playingId === beat.id}
          progress={playingId === beat.id ? progress : 0}
          currentTime={playingId === beat.id ? currentTime : 0}
          duration={playingId === beat.id ? duration : 0}
          onPlay={() => togglePlay(beat)}
          onSeek={(pct) => seek(beat, pct)}
        />
      ))}
      <div className="text-center pt-2">
        <Link
          href="/beats"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold transition-all hover:scale-105"
          style={{ background: "linear-gradient(90deg,#A8892E,#C9A84C,#E5C76B)", color: "#000" }}
        >
          Browse Full Catalog <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
