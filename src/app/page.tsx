import Link from "next/link";
import { ArrowRight, Music, Mic2, Star } from "lucide-react";
import { beats, artists } from "@/lib/data";
import Navbar from "@/components/Navbar";
import Marquee from "@/components/Marquee";
import ScrollReveal from "@/components/ScrollReveal";

export default function HomePage() {
  const featuredBeats = beats.slice(0, 3);
  const featuredArtist = artists[0];

  return (
    <div>
      {/* Hero — full screen video with lightning */}
      <section className="relative h-screen overflow-hidden">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover hero-video" src="/hero.mp4" />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)" }} />
        <div className="lightning-1 absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 20% 15%, rgba(200,220,255,0.35) 0%, transparent 50%)", mixBlendMode: "screen" }} />
        <div className="lightning-2 absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 80% 10%, rgba(180,210,255,0.4) 0%, transparent 45%)", mixBlendMode: "screen" }} />
        <div className="lightning-3 absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(220,230,255,0.3) 0%, transparent 55%)", mixBlendMode: "screen" }} />
        <div className="lightning-4 absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 75% 60%, rgba(255,220,180,0.25) 0%, transparent 50%)", mixBlendMode: "screen" }} />
      </section>

      {/* Sticky navbar */}
      <div className="sticky top-0 z-50">
        <Navbar />
      </div>

      {/* Marquee ticker */}
      <Marquee />

      {/* Featured Beats */}
      <section className="relative max-w-7xl mx-auto px-4 py-24 overflow-hidden">
        {/* Ambient orbs */}
        <div className="orb orb-1 w-96 h-96 -top-20 -left-20" style={{ background: "rgba(201,168,76,0.12)" }} />
        <div className="orb orb-2 w-72 h-72 top-1/2 -right-16" style={{ background: "rgba(255,140,0,0.08)" }} />

        <ScrollReveal className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs tracking-[0.3em] mb-2 fire-text" style={{ color: "var(--fire)" }}>FRESH CUTS</p>
            <h2 className="text-4xl font-black text-white">Latest Beats</h2>
          </div>
          <Link href="/beats" className="text-sm btn-outline px-4 py-2 rounded flex items-center gap-2">
            View All <ArrowRight size={14} />
          </Link>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger">
          {featuredBeats.map((beat, i) => (
            <ScrollReveal key={beat.id} delay={i * 0.1}>
              <Link href="/beats" className="beat-card card-surface rounded-lg overflow-hidden block">
                <div className="aspect-square flex items-center justify-center relative" style={{ background: "linear-gradient(135deg, #111 0%, #1a1a1a 100%)" }}>
                  <Music size={48} style={{ color: "var(--fire)", opacity: 0.3 }} />
                  <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center" style={{ background: "rgba(201,168,76,0.1)" }}>
                    <span className="text-white text-sm font-bold tracking-widest">PREVIEW</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-white mb-1">{beat.title}</h3>
                  <div className="flex gap-3 text-xs" style={{ color: "var(--muted)" }}>
                    <span>{beat.genre}</span><span>{beat.bpm} BPM</span><span>{beat.key}</span>
                  </div>
                  <p className="mt-3 text-sm font-bold" style={{ color: "var(--fire)" }}>From ${beat.licenses[0].price}</p>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Services Banner */}
      <section className="relative border-y py-24 overflow-hidden" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <div className="orb orb-3 w-80 h-80 top-0 left-1/2 -translate-x-1/2" style={{ background: "rgba(201,168,76,0.06)" }} />
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { icon: Music, title: "Premium Beats", desc: "Trap, R&B, Hip-Hop, Afrobeats — all moods covered.", href: "/beats" },
              { icon: Mic2, title: "Mix & Master", desc: "Professional mixing and mastering, radio-ready.", href: "/mixing" },
              { icon: Star, title: "Artist Spotlights", desc: "We shine a light on rising artists we believe in.", href: "/artists" },
            ].map(({ icon: Icon, title, desc, href }, i) => (
              <ScrollReveal key={title} delay={i * 0.15}>
                <Link href={href} className="group flex flex-col items-center p-8 rounded-lg transition-all hover:bg-black/30">
                  <div className="fire-glow w-16 h-16 rounded-full flex items-center justify-center mb-5" style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)" }}>
                    <Icon size={28} style={{ color: "var(--fire)" }} />
                  </div>
                  <h3 className="font-black text-white mb-3 text-lg">{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{desc}</p>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Artist Spotlight */}
      <section className="relative max-w-7xl mx-auto px-4 py-24 overflow-hidden">
        <div className="orb orb-2 w-96 h-96 -bottom-20 -right-20" style={{ background: "rgba(201,168,76,0.1)" }} />
        <ScrollReveal className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs tracking-[0.3em] mb-2 fire-text" style={{ color: "var(--fire)" }}>ON THE RISE</p>
            <h2 className="text-4xl font-black text-white">Artist Spotlight</h2>
          </div>
          <Link href="/artists" className="text-sm btn-outline px-4 py-2 rounded flex items-center gap-2">
            All Artists <ArrowRight size={14} />
          </Link>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <div className="card-surface rounded-lg p-8 flex flex-col md:flex-row gap-8 items-center" style={{ border: "1px solid rgba(201,168,76,0.15)" }}>
            <div className="fire-glow w-36 h-36 rounded-full flex-shrink-0 flex items-center justify-center text-5xl font-black" style={{ background: "rgba(201,168,76,0.12)", color: "var(--fire)", border: "1px solid rgba(201,168,76,0.3)" }}>
              {featuredArtist.name[0]}
            </div>
            <div>
              <p className="text-xs tracking-[0.3em] mb-1" style={{ color: "var(--fire)" }}>{featuredArtist.genre.toUpperCase()}</p>
              <h3 className="text-2xl font-black text-white mb-3">{featuredArtist.name}</h3>
              <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--muted)" }}>{featuredArtist.bio}</p>
              <Link href="/artists" className="btn-gold px-6 py-2 rounded text-sm inline-flex items-center gap-2">
                Read More <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* CTA */}
      <section className="relative py-28 text-center overflow-hidden" style={{ background: "linear-gradient(180deg, transparent 0%, rgba(201,168,76,0.04) 50%, transparent 100%)" }}>
        <div className="orb orb-1 w-[500px] h-[500px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ background: "rgba(201,168,76,0.06)" }} />
        <ScrollReveal className="relative max-w-2xl mx-auto px-4">
          <p className="text-xs tracking-[0.4em] mb-4 fire-text" style={{ color: "var(--fire)" }}>LEVEL UP</p>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-5 leading-tight">Ready to elevate<br/>your sound?</h2>
          <p className="mb-10 text-lg" style={{ color: "var(--muted)" }}>Book a session or grab a beat today.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/beats" className="btn-gold px-10 py-4 rounded text-sm tracking-widest">SHOP BEATS</Link>
            <Link href="/contact" className="btn-outline px-10 py-4 rounded text-sm tracking-widest">GET IN TOUCH</Link>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
