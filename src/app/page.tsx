import Link from "next/link";
import { ArrowRight, Music, Mic2, Star, ShoppingBag, Phone, Users, Info } from "lucide-react";
import { beats, artists } from "@/lib/data";
import Navbar from "@/components/Navbar";
import Marquee from "@/components/Marquee";
import ScrollReveal from "@/components/ScrollReveal";
import StatsCounter from "@/components/StatsCounter";
import Testimonials from "@/components/Testimonials";
import EmailCapture from "@/components/EmailCapture";
import ArtistsWorkedWith from "@/components/ArtistsWorkedWith";
import Productions from "@/components/Productions";

export default function HomePage() {
  const featuredBeats = beats.slice(0, 3);
  const featuredArtist = artists[0];

  return (
    <div>
      {/* Hero — full screen video with lightning */}
      <section className="relative overflow-hidden aspect-video md:aspect-auto md:h-[100dvh]">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover hero-video">
          <source src="/hero-mobile.mp4" media="(max-width: 768px)" type="video/mp4" />
          <source src="/hero-desktop.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)" }} />
        <div className="lightning-1 absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 20% 15%, rgba(200,220,255,0.35) 0%, transparent 50%)", mixBlendMode: "screen" }} />
        <div className="lightning-2 absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 80% 10%, rgba(180,210,255,0.4) 0%, transparent 45%)", mixBlendMode: "screen" }} />
        <div className="lightning-3 absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(220,230,255,0.3) 0%, transparent 55%)", mixBlendMode: "screen" }} />
        <div className="lightning-4 absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 75% 60%, rgba(255,220,180,0.25) 0%, transparent 50%)", mixBlendMode: "screen" }} />
      </section>

      {/* Page navigation tabs */}
      <div className="border-b tab-scrollbar overflow-x-auto" style={{ background: "rgba(10,10,10,0.98)", backdropFilter: "blur(12px)", borderColor: "var(--border)" }}>
        <div className="flex items-center min-w-max mx-auto px-4 md:px-0 md:justify-center">
          {[
            { href: "/beats",   label: "Beats",       icon: ShoppingBag },
            { href: "/mixing",  label: "Mix & Master", icon: Mic2 },
            { href: "/artists", label: "Spotlights",   icon: Users },
            { href: "/about",   label: "About",        icon: Info },
            { href: "/contact", label: "Contact",      icon: Phone },
          ].map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 px-5 py-4 text-sm font-semibold tracking-wide whitespace-nowrap border-b-2 border-transparent transition-all hover:text-white page-tab"
              style={{ color: "var(--muted)" }}
            >
              <Icon size={14} />
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Marquee ticker */}
      <Marquee />

      {/* Portfolio Artists — after nav tabs */}
      <ArtistsWorkedWith />

      {/* Featured Beats */}
      <section className="relative max-w-7xl mx-auto px-4 py-12 md:py-24 overflow-hidden">
        {/* Ambient orbs */}
        <div className="orb orb-1 w-96 h-96 -top-20 -left-20" style={{ background: "rgba(201,168,76,0.12)" }} />
        <div className="orb orb-2 w-72 h-72 top-1/2 -right-16" style={{ background: "rgba(255,140,0,0.08)" }} />

        <ScrollReveal className="flex items-end justify-between mb-8 md:mb-10">
          <div>
            <p className="text-xs tracking-[0.3em] mb-2 fire-text" style={{ color: "var(--fire)" }}>FRESH CUTS</p>
            <h2 className="text-3xl md:text-4xl font-black text-white">Latest Beats</h2>
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
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-white">{beat.title}</h3>
                    <div className="waveform">
                      {[...Array(12)].map((_, j) => <div key={j} className="waveform-bar" />)}
                    </div>
                  </div>
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
      <section className="relative border-y py-12 md:py-24 overflow-hidden" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <div className="orb orb-3 w-80 h-80 top-0 left-1/2 -translate-x-1/2" style={{ background: "rgba(201,168,76,0.06)" }} />
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { icon: Music, title: "Premium Beats", desc: "Trap, R&B, Hip-Hop, Afrobeats — all moods covered. Fast delivery, 100% satisfaction guaranteed.", href: "/beats" },
              { icon: Mic2, title: "Mix & Master", desc: "Professional mixing and mastering, radio-ready. Quick turnaround so you never miss a deadline.", href: "/mixing" },
              { icon: Star, title: "Artist Spotlights", desc: "We shine a light on rising artists we believe in.", href: "/artists" },
            ].map(({ icon: Icon, title, desc, href }, i) => (
              <ScrollReveal key={title} delay={i * 0.15}>
                <Link href={href} className="group flex flex-col items-center p-5 md:p-8 rounded-lg transition-all hover:bg-black/30">
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

      {/* Productions */}
      <Productions />

      {/* Stats */}
      <StatsCounter />

      {/* Testimonials */}
      <Testimonials />

      {/* Email Capture */}
      <EmailCapture />

      {/* CTA */}
      <section className="relative py-14 md:py-28 text-center overflow-hidden" style={{ background: "linear-gradient(180deg, transparent 0%, rgba(201,168,76,0.04) 50%, transparent 100%)" }}>
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
