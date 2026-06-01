"use client";
import { useState } from "react";
import { Play, ShoppingCart, Check } from "lucide-react";
import { beats } from "@/lib/data";
import { useCart } from "@/lib/store";
import type { Beat, License } from "@/lib/types";
import { cn } from "@/lib/utils";

const genres = ["All", "Trap", "R&B", "Hip-Hop", "Afrobeats"];
const moods = ["All", "Dark", "Melodic", "Hard", "Chill"];

export default function BeatsPage() {
  const [genreFilter, setGenreFilter] = useState("All");
  const [moodFilter, setMoodFilter] = useState("All");
  const [selected, setSelected] = useState<{ beat: Beat; license: License } | null>(null);
  const { addItem, items } = useCart();

  const filtered = beats.filter((b) => {
    const genreMatch = genreFilter === "All" || b.genre === genreFilter;
    const moodMatch = moodFilter === "All" || b.mood === moodFilter;
    return genreMatch && moodMatch;
  });

  const inCart = (beatId: string, licenseId: string) =>
    items.some((i) => i.id === `${beatId}-${licenseId}`);

  const handleAddToCart = (beat: Beat, license: License) => {
    addItem({
      id: `${beat.id}-${license.id}`,
      type: "beat",
      name: `${beat.title} — ${license.name} License`,
      licenseName: license.name,
      price: license.price,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12">
        <p className="text-xs tracking-[0.3em] mb-2" style={{ color: "var(--gold)" }}>CATALOG</p>
        <h1 className="text-4xl font-black text-white mb-2">Beats Store</h1>
        <p style={{ color: "var(--muted)" }}>Preview, license, and download premium beats instantly.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-6 mb-10">
        <div className="flex flex-wrap gap-2">
          {genres.map((g) => (
            <button key={g} onClick={() => setGenreFilter(g)}
              className={cn("px-4 py-1.5 rounded text-sm transition-colors", genreFilter === g ? "btn-gold" : "btn-outline")}>
              {g}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {moods.map((m) => (
            <button key={m} onClick={() => setMoodFilter(m)}
              className={cn("px-4 py-1.5 rounded text-sm transition-colors", moodFilter === m ? "btn-gold" : "btn-outline")}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Beat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((beat) => (
          <div key={beat.id} id={beat.id} className="card-surface rounded-lg overflow-hidden">
            {/* Cover */}
            <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative group cursor-pointer">
              <Play size={40} style={{ color: "var(--gold)", opacity: 0.6 }} />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "var(--gold)" }}>
                  <Play size={20} className="text-black ml-1" />
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-white text-lg">{beat.title}</h3>
                  <div className="flex gap-3 text-xs mt-1" style={{ color: "var(--muted)" }}>
                    <span>{beat.genre}</span>
                    <span>{beat.bpm} BPM</span>
                    <span>{beat.key}</span>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded" style={{ background: "rgba(201,168,76,0.1)", color: "var(--gold)" }}>{beat.mood}</span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {beat.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded" style={{ background: "var(--surface2)", color: "var(--muted)" }}>#{tag}</span>
                ))}
              </div>

              {/* Licenses */}
              <div className="space-y-2">
                {beat.licenses.map((license) => {
                  const added = inCart(beat.id, license.id);
                  return (
                    <div key={license.id} className="flex items-center justify-between p-3 rounded" style={{ background: "var(--surface2)" }}>
                      <div>
                        <p className="text-sm font-semibold text-white">{license.name}</p>
                        <p className="text-xs" style={{ color: "var(--muted)" }}>{license.format} · {license.streams}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold" style={{ color: "var(--gold)" }}>${license.price}</span>
                        <button
                          onClick={() => handleAddToCart(beat, license)}
                          disabled={added}
                          className={cn("p-1.5 rounded transition-colors", added ? "text-green-400" : "hover:text-yellow-400")}
                          style={{ color: added ? undefined : "var(--muted)" }}>
                          {added ? <Check size={16} /> : <ShoppingCart size={16} />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20" style={{ color: "var(--muted)" }}>
          No beats match your filters. Try a different combination.
        </div>
      )}
    </div>
  );
}
