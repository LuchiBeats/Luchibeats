import Link from "next/link";
import { ArrowRight, Music, Mic2, Star } from "lucide-react";
import { beats, artists } from "@/lib/data";

export default function HomePage() {
  const featuredBeats = beats.slice(0, 3);
  const featuredArtist = artists[0];

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, rgba(201,168,76,0.08) 0%, transparent 70%)" }} />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <p className="text-sm tracking-[0.4em] mb-4" style={{ color: "var(--gold)" }}>PREMIUM PRODUCER</p>
          <h1 className="text-5xl md:text-8xl font-black tracking-tight mb-6 leading-none">
            <span className="gold-gradient">LUCHI</span>
            <span className="text-white">BEATS</span>
          </h1>
          <p className="text-lg md:text-xl mb-10 max-w-xl mx-auto" style={{ color: "var(--muted)" }}>
            Cinematic beats. Professional mixing. Authentic sound — built for artists who are serious about their craft.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/beats" className="btn-gold px-8 py-3 rounded text-sm tracking-wide flex items-center gap-2">
              Browse Beats <ArrowRight size={16} />
            </Link>
            <Link href="/mixing" className="btn-outline px-8 py-3 rounded text-sm tracking-wide">
              Mixing Services
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Beats */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs tracking-[0.3em] mb-2" style={{ color: "var(--gold)" }}>FRESH CUTS</p>
            <h2 className="text-3xl font-black text-white">Latest Beats</h2>
          </div>
          <Link href="/beats" className="text-sm btn-outline px-4 py-2 rounded flex items-center gap-2">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredBeats.map((beat) => (
            <Link key={beat.id} href={`/beats`} className="card-surface rounded-lg overflow-hidden group hover:border-yellow-600 transition-colors">
              <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative">
                <Music size={48} style={{ color: "var(--gold)", opacity: 0.4 }} />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">Preview</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-white mb-1">{beat.title}</h3>
                <div className="flex gap-3 text-xs" style={{ color: "var(--muted)" }}>
                  <span>{beat.genre}</span>
                  <span>{beat.bpm} BPM</span>
                  <span>{beat.key}</span>
                </div>
                <p className="mt-3 text-sm font-semibold" style={{ color: "var(--gold)" }}>
                  From ${beat.licenses[0].price}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Services Banner */}
      <section className="border-y py-20" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { icon: Music, title: "Premium Beats", desc: "Trap, R&B, Hip-Hop, Afrobeats — all moods and genres covered.", href: "/beats" },
              { icon: Mic2, title: "Mix & Master", desc: "Professional mixing and mastering to make your record radio-ready.", href: "/mixing" },
              { icon: Star, title: "Artist Spotlights", desc: "We shine a light on rising artists we believe in.", href: "/artists" },
            ].map(({ icon: Icon, title, desc, href }) => (
              <Link key={title} href={href} className="group flex flex-col items-center p-6 rounded-lg transition-colors">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: "rgba(201,168,76,0.1)" }}>
                  <Icon size={24} style={{ color: "var(--gold)" }} />
                </div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-sm" style={{ color: "var(--muted)" }}>{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Artist Spotlight Teaser */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs tracking-[0.3em] mb-2" style={{ color: "var(--gold)" }}>ON THE RISE</p>
            <h2 className="text-3xl font-black text-white">Artist Spotlight</h2>
          </div>
          <Link href="/artists" className="text-sm btn-outline px-4 py-2 rounded flex items-center gap-2">
            All Artists <ArrowRight size={14} />
          </Link>
        </div>
        <div className="card-surface rounded-lg p-8 flex flex-col md:flex-row gap-8 items-center">
          <div className="w-32 h-32 rounded-full flex-shrink-0 flex items-center justify-center text-4xl font-black" style={{ background: "rgba(201,168,76,0.15)", color: "var(--gold)" }}>
            {featuredArtist.name[0]}
          </div>
          <div>
            <p className="text-xs tracking-[0.3em] mb-1" style={{ color: "var(--gold)" }}>{featuredArtist.genre.toUpperCase()}</p>
            <h3 className="text-2xl font-black text-white mb-3">{featuredArtist.name}</h3>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--muted)" }}>{featuredArtist.bio}</p>
            <Link href="/artists" className="btn-gold px-6 py-2 rounded text-sm inline-flex items-center gap-2">
              Read More <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center" style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.05) 0%, transparent 100%)" }}>
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Ready to level up your sound?</h2>
          <p className="mb-8" style={{ color: "var(--muted)" }}>Book a mixing session or grab a beat today.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/beats" className="btn-gold px-8 py-3 rounded text-sm tracking-wide">Shop Beats</Link>
            <Link href="/contact" className="btn-outline px-8 py-3 rounded text-sm tracking-wide">Get in Touch</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
