"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import type { DrumKit } from "@/lib/types";
import { useCart } from "@/lib/store";
import { Play, Pause, ShoppingCart, Search, X, Check, Disc3 } from "lucide-react";
import { registerAudio, unregisterAudio } from "@/components/VisibilityPause";

// ── Tokens (matches /beats) ─────────────────────────────────────────────────────
const GOLD        = "#C9A84C";
const GOLD_DIM    = "rgba(201,168,76,0.10)";
const GOLD_BORDER = "rgba(201,168,76,0.28)";
const GOLD_GLOW   = "rgba(201,168,76,0.18)";
const BG_ROW      = "#0a0a0c";
const BG_ROW_ACTIVE = "rgba(201,168,76,0.04)";
const BORDER      = "#1a1a1e";
const MUTED       = "#3e3e45";
const DIM         = "#6e6e7a";

const GENRE_FILTERS = ["All", "Hip-Hop / Trap", "Boom Bap / Hip-Hop", "R&B / Melodic", "Drill", "Afrobeats"];
const SORT_OPTIONS  = ["Newest", "Price ↑", "Price ↓", "Most Samples"];

function fmt(s: number) {
  if (!isFinite(s) || s <= 0) return "0:00";
  const m = Math.floor(s / 60);
  return `${m}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
}

// ── Kit card ──────────────────────────────────────────────────────────────────
function KitCard({
  kit, playing, progress, currentTime, duration, inCart,
  onPlay, onAddToCart,
}: {
  kit: DrumKit;
  playing: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  inCart: boolean;
  onPlay: () => void;
  onAddToCart: () => void;
}) {
  return (
    <div
      className="rounded-xl overflow-hidden transition-all flex flex-col"
      style={{
        background: playing ? BG_ROW_ACTIVE : BG_ROW,
        border: `1px solid ${playing ? GOLD_BORDER : BORDER}`,
        boxShadow: playing ? `0 0 30px rgba(201,168,76,0.06)` : "none",
      }}
    >
      {/* Cover art */}
      <div className="relative w-full aspect-video flex-shrink-0 group" onClick={kit.previewUrl ? onPlay : undefined} style={{ cursor: kit.previewUrl ? "pointer" : "default" }}>
        {kit.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={kit.imageUrl} alt={kit.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg,#111,#1a1a1a)" }}>
            <Disc3 size={36} style={{ color: GOLD }} />
          </div>
        )}
        {kit.popular && (
          <span className="absolute top-3 left-3 text-xs font-black tracking-wide px-2.5 py-1 rounded-full" style={{ background: GOLD, color: "#000" }}>
            POPULAR
          </span>
        )}
        {kit.previewUrl && (
          <div className="absolute inset-0 flex items-center justify-center transition-opacity"
            style={{ background: "rgba(0,0,0,0.45)", opacity: playing ? 1 : 0 }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "1"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = playing ? "1" : "0"; }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: GOLD, boxShadow: `0 0 20px rgba(201,168,76,0.5)` }}>
              {playing ? <Pause size={18} fill="#000" color="#000" /> : <Play size={18} fill="#000" color="#000" style={{ marginLeft: 3 }} />}
            </div>
          </div>
        )}
        {playing && (
          <div className="absolute bottom-3 left-3 right-3">
            <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.15)" }}>
              <div className="h-full" style={{ width: `${progress}%`, background: GOLD }} />
            </div>
            <div className="flex justify-between mt-1 text-xs font-mono" style={{ color: "#fff" }}>
              <span>{fmt(currentTime)}</span>
              <span>{fmt(duration)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-black text-white text-base leading-tight tracking-wide uppercase">{kit.name}</h3>
        </div>
        <p className="text-xs mb-3" style={{ color: DIM }}>
          {kit.genre} · {kit.sampleCount} samples{kit.formats.length > 0 ? ` · ${kit.formats.join(", ")}` : ""}
        </p>
        <p className="text-sm mb-3 flex-1" style={{ color: "rgba(255,255,255,0.6)" }}>{kit.description}</p>

        {kit.includes.length > 0 && (
          <ul className="space-y-1 mb-3">
            {kit.includes.map(item => (
              <li key={item} className="text-xs flex items-center gap-1.5" style={{ color: MUTED }}>
                <span style={{ color: GOLD }}>·</span> {item}
              </li>
            ))}
          </ul>
        )}

        {kit.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {kit.tags.slice(0, 6).map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded font-semibold"
                style={{ background: "rgba(255,255,255,0.04)", color: MUTED, border: `1px solid ${BORDER}` }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 mt-auto pt-3" style={{ borderTop: `1px solid ${BORDER}` }}>
          <span className="text-xl font-black" style={{ color: GOLD }}>${kit.price}</span>
          <button
            onClick={onAddToCart}
            disabled={inCart}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-black tracking-wide transition-all"
            style={{
              background: inCart ? "rgba(74,222,128,0.1)" : "linear-gradient(90deg,#A8892E,#C9A84C,#E5C76B)",
              color: inCart ? "#4ade80" : "#000",
              border: inCart ? "1px solid rgba(74,222,128,0.3)" : "none",
              cursor: inCart ? "default" : "pointer",
            }}>
            {inCart ? <><Check size={15} /> IN CART</> : <><ShoppingCart size={15} /> ADD TO CART</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DrumKitsPage() {
  const [kits, setKits]           = useState<DrumKit[]>([]);
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
    fetch("/api/drum-kits")
      .then(r => r.ok ? r.json() : [])
      .then((data: DrumKit[]) => { setKits(data); setLoading(false); })
      .catch(() => setLoading(false));
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

  const togglePlay = useCallback((kit: DrumKit) => {
    const audio = audioRef.current;
    if (!audio || !kit.previewUrl) return;
    if (playingId === kit.id) {
      if (audio.paused) audio.play(); else { audio.pause(); setPlayingId(null); }
      return;
    }
    audio.src = kit.previewUrl;
    audio.load();
    audio.play().then(() => setPlayingId(kit.id)).catch(() => {});
    setProgress(0); setCurrentTime(0); setDuration(0);
  }, [playingId]);

  const addToCart = useCallback((kit: DrumKit) => {
    addItem({ id: kit.id, type: "drumkit", name: kit.name, price: kit.price, imageUrl: kit.imageUrl });
  }, [addItem]);

  const filtered = kits
    .filter(k => {
      if (genre !== "All" && k.genre !== genre) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return k.name.toLowerCase().includes(q) || k.genre.toLowerCase().includes(q) || k.tags.some(t => t.toLowerCase().includes(q));
    })
    .sort((a, b) => {
      if (sort === "Price ↑") return a.price - b.price;
      if (sort === "Price ↓") return b.price - a.price;
      if (sort === "Most Samples") return b.sampleCount - a.sampleCount;
      return 0;
    });

  return (
    <div className="min-h-screen" style={{ background: "#070709" }}>
      <div className="max-w-5xl mx-auto px-4 py-10 md:py-16">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-black tracking-[0.4em] mb-2" style={{ color: GOLD }}>// SOUND KITS</p>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-none tracking-tight mb-1">
            Drum Kits
          </h1>
          <p className="text-sm" style={{ color: DIM }}>
            {loading ? "Loading kits…" : `${kits.length} kit${kits.length !== 1 ? "s" : ""} available`}
          </p>
        </div>

        {/* Search + filters */}
        <div className="mb-6 space-y-3">
          <div className="relative">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: DIM }} />
            <input
              type="text"
              placeholder="Search by name, genre, tag…"
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

        {search || genre !== "All" ? (
          <p className="text-xs mb-4 font-semibold" style={{ color: MUTED }}>
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            {genre !== "All" && ` in ${genre}`}
            {search && ` for "${search}"`}
          </p>
        ) : null}

        {/* Kit grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1,2,3,4].map(i => (
              <div key={i} className="rounded-xl animate-pulse" style={{ background: BG_ROW, border: `1px solid ${BORDER}`, height: 340 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-4xl mb-4">🥁</p>
            <p className="font-black text-white mb-2">{kits.length === 0 ? "No kits yet" : "No results"}</p>
            <p className="text-sm" style={{ color: MUTED }}>
              {kits.length === 0 ? "Check back soon — new kits dropping soon." : "Try a different search or filter."}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map(kit => (
              <KitCard
                key={kit.id}
                kit={kit}
                playing={playingId === kit.id}
                progress={playingId === kit.id ? progress : 0}
                currentTime={playingId === kit.id ? currentTime : 0}
                duration={playingId === kit.id ? duration : 0}
                inCart={cartItemIds.includes(kit.id)}
                onPlay={() => togglePlay(kit)}
                onAddToCart={() => addToCart(kit)}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
