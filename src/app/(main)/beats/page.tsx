"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import type { Beat } from "@/lib/types";
import { useCart } from "@/lib/store";
import { Play, Pause, ShoppingCart, Search, X, Check } from "lucide-react";

// ── Tokens ────────────────────────────────────────────────────────────────────
const GOLD        = "#C9A84C";
const GOLD_DIM    = "rgba(201,168,76,0.10)";
const GOLD_BORDER = "rgba(201,168,76,0.28)";
const GOLD_GLOW   = "rgba(201,168,76,0.18)";
const BG_ROW      = "#0a0a0c";
const BG_ROW_ACTIVE = "rgba(201,168,76,0.04)";
const BORDER      = "#1a1a1e";
const MUTED       = "#3e3e45";
const DIM         = "#6e6e7a";

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(s: number) {
  if (!isFinite(s) || s <= 0) return "0:00";
  const m = Math.floor(s / 60);
  return `${m}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
}

// Deterministic waveform bars seeded from beat id
function waveBars(id: string, n = 48): number[] {
  return Array.from({ length: n }, (_, i) => {
    const a = id.charCodeAt(i % id.length) || 60;
    const b = id.charCodeAt((i * 3) % id.length) || 40;
    const wave = Math.sin(i * 0.55 + a * 0.07) * 28 + Math.sin(i * 1.1 + b * 0.13) * 15;
    return Math.max(12, Math.min(92, 52 + wave));
  });
}

const GENRE_FILTERS = ["All", "Trap", "Hip-Hop", "R&B", "Drill", "Afrobeats", "Boom Bap", "Pop", "Melodic Trap"];
const SORT_OPTIONS  = ["Newest", "BPM ↑", "BPM ↓", "Price ↑", "Price ↓"];

// ── License button ─────────────────────────────────────────────────────────────
function LicenseBtn({
  label, price, format, streams, inCart, sold, onClick,
}: {
  label: string; price: number; format: string; streams: string;
  inCart: boolean; sold: boolean; onClick: () => void;
}) {
  const isExcl = label === "Exclusive";
  return (
    <button
      onClick={onClick}
      disabled={sold}
      className="flex flex-col items-center px-3 py-2.5 rounded-lg transition-all flex-1 min-w-[80px]"
      style={{
        background: sold ? "rgba(255,255,255,0.02)"
          : inCart ? "rgba(74,222,128,0.08)"
          : isExcl ? "rgba(201,168,76,0.08)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${sold ? BORDER : inCart ? "rgba(74,222,128,0.3)" : isExcl ? GOLD_BORDER : "#222"}`,
        opacity: sold ? 0.35 : 1,
        cursor: sold ? "not-allowed" : "pointer",
      }}
      onMouseEnter={e => { if (!sold && !inCart) { e.currentTarget.style.background = isExcl ? "rgba(201,168,76,0.14)" : "rgba(255,255,255,0.07)"; e.currentTarget.style.boxShadow = isExcl ? `0 0 14px ${GOLD_GLOW}` : "none"; } }}
      onMouseLeave={e => { e.currentTarget.style.background = sold ? "rgba(255,255,255,0.02)" : inCart ? "rgba(74,222,128,0.08)" : isExcl ? "rgba(201,168,76,0.08)" : "rgba(255,255,255,0.04)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <span className="text-xs font-black tracking-wide mb-0.5" style={{ color: sold ? MUTED : inCart ? "#4ade80" : isExcl ? GOLD : "#aaa" }}>
        {sold ? "SOLD" : inCart ? <span className="flex items-center gap-1"><Check size={10} /> IN CART</span> : label.toUpperCase()}
      </span>
      <span className="text-base font-black leading-none" style={{ color: sold ? MUTED : inCart ? "#4ade80" : "#fff" }}>
        {sold ? "—" : `$${price}`}
      </span>
      <span className="text-xs mt-0.5" style={{ color: MUTED }}>{format}</span>
    </button>
  );
}

// ── Beat row ──────────────────────────────────────────────────────────────────
function BeatRow({
  beat, playing, progress, currentTime, duration,
  onPlay, onSeek, onAddToCart, cartItems,
}: {
  beat: Beat;
  playing: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  onPlay: () => void;
  onSeek: (pct: number) => void;
  onAddToCart: (license: Beat["licenses"][0]) => void;
  cartItems: string[];
}) {
  const bars = waveBars(beat.id);
  const barCount = bars.length;

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
          {/* Play overlay */}
          <div className="absolute inset-0 rounded-lg flex items-center justify-center transition-opacity"
            style={{ background: "rgba(0,0,0,0.55)", opacity: playing ? 1 : 0 }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "1"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = playing ? "1" : "0"; }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: GOLD, boxShadow: `0 0 16px rgba(201,168,76,0.5)` }}>
              {playing ? <Pause size={14} fill="#000" color="#000" /> : <Play size={14} fill="#000" color="#000" style={{ marginLeft: 2 }} />}
            </div>
          </div>
          {/* Always-visible play hint when not playing */}
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
          {/* Title row */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="min-w-0">
              <h3 className="font-black text-white text-sm md:text-base leading-tight truncate tracking-wide uppercase">{beat.title}</h3>
              <p className="text-xs mt-0.5" style={{ color: DIM }}>
                {beat.genre} · {beat.bpm} BPM · {beat.key} · {beat.mood}
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
            style={{ height: 36 }}
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
            {/* Time overlay */}
            {playing && (
              <div className="absolute right-0 -top-5 text-xs font-mono" style={{ color: DIM }}>
                {fmt(currentTime)} / {fmt(duration)}
              </div>
            )}
          </div>

          {/* Tags */}
          {beat.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {beat.tags.slice(0, 6).map(tag => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded font-semibold"
                  style={{ background: "rgba(255,255,255,0.04)", color: MUTED, border: `1px solid ${BORDER}` }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* License buttons */}
          <div className="flex gap-2">
            {beat.licenses.map(lic => (
              <LicenseBtn
                key={lic.id}
                label={lic.name}
                price={lic.price}
                format={lic.format}
                streams={lic.streams}
                inCart={cartItems.includes(`${beat.id}-${lic.name}`)}
                sold={false}
                onClick={() => onAddToCart(lic)}
              />
            ))}
            <a href="/cart"
              className="flex items-center justify-center w-10 h-auto rounded-lg flex-shrink-0 transition-all"
              style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${BORDER}`, color: MUTED }}
              onMouseEnter={e => { e.currentTarget.style.background = GOLD_DIM; e.currentTarget.style.borderColor = GOLD_BORDER; (e.currentTarget as HTMLAnchorElement).style.color = GOLD; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = BORDER; (e.currentTarget as HTMLAnchorElement).style.color = MUTED; }}>
              <ShoppingCart size={15} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function BeatsPage() {
  const [beats, setBeats]         = useState<Beat[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [genre, setGenre]         = useState("All");
  const [sort, setSort]           = useState("Newest");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [progress, setProgress]   = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration]   = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { addItem, items } = useCart();
  const cartItemIds = items.map(i => i.id);

  useEffect(() => {
    fetch("/api/beats")
      .then(r => r.ok ? r.json() : [])
      .then((data: Beat[]) => { setBeats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Single shared audio element
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    const onTime    = () => { setCurrentTime(audio.currentTime); setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0); };
    const onMeta    = () => setDuration(audio.duration);
    const onEnded   = () => { setPlayingId(null); setProgress(0); setCurrentTime(0); setDuration(0); };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnded);
    return () => { audio.pause(); audio.removeEventListener("timeupdate", onTime); audio.removeEventListener("loadedmetadata", onMeta); audio.removeEventListener("ended", onEnded); };
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

  const addToCart = useCallback((beat: Beat, license: Beat["licenses"][0]) => {
    addItem({ id: `${beat.id}-${license.name}`, type: "beat", name: `${beat.title} — ${license.name} License`, licenseName: license.name, price: license.price, imageUrl: beat.imageUrl });
  }, [addItem]);

  const filtered = beats
    .filter(b => {
      if (genre !== "All" && b.genre !== genre) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return b.title.toLowerCase().includes(q) || b.genre.toLowerCase().includes(q) || b.mood.toLowerCase().includes(q) || b.tags.some(t => t.toLowerCase().includes(q));
    })
    .sort((a, b) => {
      if (sort === "BPM ↑") return a.bpm - b.bpm;
      if (sort === "BPM ↓") return b.bpm - a.bpm;
      if (sort === "Price ↑") return (a.licenses[0]?.price ?? 0) - (b.licenses[0]?.price ?? 0);
      if (sort === "Price ↓") return (b.licenses[0]?.price ?? 0) - (a.licenses[0]?.price ?? 0);
      return 0;
    });

  return (
    <div className="min-h-screen" style={{ background: "#070709" }}>
      <div className="max-w-5xl mx-auto px-4 py-10 md:py-16">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-black tracking-[0.4em] mb-2" style={{ color: GOLD }}>// CATALOG</p>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-none tracking-tight mb-1">
            Beats Store
          </h1>
          <p className="text-sm" style={{ color: DIM }}>
            {loading ? "Loading catalog…" : `${beats.length} beat${beats.length !== 1 ? "s" : ""} available`}
          </p>
        </div>

        {/* Search + filters */}
        <div className="mb-6 space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: DIM }} />
            <input
              type="text"
              placeholder="Search by title, genre, mood, tag…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-xl text-sm text-white outline-none transition-all"
              style={{ background: "#0e0e11", border: `1px solid ${BORDER}` }}
              onFocus={e => { e.target.style.borderColor = GOLD; e.target.style.boxShadow = `0 0 0 3px ${GOLD_GLOW}`; }}
              onBlur={e => { e.target.style.borderColor = BORDER; e.target.style.boxShadow = "none"; }}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors" style={{ color: DIM }}
                onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={e => (e.currentTarget.style.color = DIM)}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Genre chips + sort */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-1.5 flex-wrap flex-1">
              {GENRE_FILTERS.map(g => (
                <button key={g} onClick={() => setGenre(g)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={{
                    background: genre === g ? GOLD_DIM : "rgba(255,255,255,0.04)",
                    color: genre === g ? GOLD : MUTED,
                    border: `1px solid ${genre === g ? GOLD_BORDER : BORDER}`,
                    boxShadow: genre === g ? `0 0 12px ${GOLD_GLOW}` : "none",
                  }}>
                  {g}
                </button>
              ))}
            </div>
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold outline-none transition-all flex-shrink-0"
              style={{ background: "#0e0e11", border: `1px solid ${BORDER}`, color: DIM }}>
              {SORT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Result count */}
        {search || genre !== "All" ? (
          <p className="text-xs mb-4 font-semibold" style={{ color: MUTED }}>
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            {genre !== "All" && ` in ${genre}`}
            {search && ` for "${search}"`}
          </p>
        ) : null}

        {/* Beat list */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="rounded-xl p-4 animate-pulse" style={{ background: BG_ROW, border: `1px solid ${BORDER}`, height: 130 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-4xl mb-4">🎵</p>
            <p className="font-black text-white mb-2">{beats.length === 0 ? "No beats yet" : "No results"}</p>
            <p className="text-sm" style={{ color: MUTED }}>
              {beats.length === 0 ? "Check back soon — new beats dropping soon." : "Try a different search or filter."}
            </p>
            {(search || genre !== "All") && (
              <button onClick={() => { setSearch(""); setGenre("All"); }}
                className="mt-6 px-6 py-2.5 rounded-lg text-sm font-bold transition-all"
                style={{ background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}`, color: GOLD }}>
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(beat => (
              <BeatRow
                key={beat.id}
                beat={beat}
                playing={playingId === beat.id}
                progress={playingId === beat.id ? progress : 0}
                currentTime={playingId === beat.id ? currentTime : 0}
                duration={playingId === beat.id ? duration : 0}
                onPlay={() => togglePlay(beat)}
                onSeek={(pct) => seek(beat, pct)}
                onAddToCart={(lic) => addToCart(beat, lic)}
                cartItems={cartItemIds}
              />
            ))}
          </div>
        )}

        {/* License legend */}
        {!loading && filtered.length > 0 && (
          <div className="mt-10 rounded-xl p-5" style={{ background: BG_ROW, border: `1px solid ${BORDER}` }}>
            <p className="text-xs font-black tracking-[0.25em] uppercase mb-4" style={{ color: MUTED }}>// License Guide</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {[
                { name: "Basic", price: "from $35", format: "MP3", features: ["Non-exclusive", "Up to 2,500 streams", "Credit required"] },
                { name: "Premium", price: "from $99", format: "WAV + Stems", features: ["Non-exclusive", "Up to 50,000 streams", "Credit required"] },
                { name: "Exclusive", price: "from $499", format: "WAV + Stems", features: ["Full exclusive rights", "Unlimited streams", "Beat removed after purchase", "Credit required"] },
              ].map(tier => (
                <div key={tier.name} className="rounded-lg p-4" style={{ background: "#080809", border: `1px solid ${BORDER}` }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-black text-white text-sm">{tier.name}</span>
                    <span className="text-xs font-bold" style={{ color: GOLD }}>{tier.price}</span>
                  </div>
                  <p className="text-xs font-semibold mb-2" style={{ color: DIM }}>{tier.format}</p>
                  <ul className="space-y-1">
                    {tier.features.map(f => (
                      <li key={f} className="text-xs flex items-center gap-1.5" style={{ color: MUTED }}>
                        <span style={{ color: GOLD }}>·</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
