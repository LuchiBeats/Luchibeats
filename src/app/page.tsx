import type { Metadata } from "next";
import Link from "next/link";
import { Mic2, ShoppingBag, Phone, Users, Info, Drum } from "lucide-react";
import Marquee from "@/components/Marquee";
import ScrollReveal from "@/components/ScrollReveal";
import StatsCounter from "@/components/StatsCounter";
import Testimonials from "@/components/Testimonials";
import EmailCapture from "@/components/EmailCapture";
import ArtistsWorkedWith from "@/components/ArtistsWorkedWith";
import Productions from "@/components/Productions";
import FeaturedPlayer from "@/components/FeaturedPlayer";
import { getHomepageContent } from "@/lib/beats-store";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const content = await getHomepageContent();
    if (content.seoTitle || content.seoDescription) {
      return {
        title: content.seoTitle || undefined,
        description: content.seoDescription || undefined,
        openGraph: {
          title: content.seoTitle || undefined,
          description: content.seoDescription || undefined,
        },
        twitter: {
          title: content.seoTitle || undefined,
          description: content.seoDescription || undefined,
        },
      };
    }
  } catch {}
  return {};
}

export default async function HomePage() {
  const hp = await getHomepageContent();

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

        {/* Hero overlay — only rendered when set in admin */}
        {hp.heroHeadline && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6 text-center" style={{ background: "rgba(0,0,0,0.35)" }}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight" style={{ textShadow: "0 2px 30px rgba(0,0,0,0.9)" }}>
              {hp.heroHeadline}
            </h1>
            {hp.heroSubtext && (
              <p className="mt-4 text-base md:text-xl text-white/80 max-w-xl" style={{ textShadow: "0 1px 10px rgba(0,0,0,0.8)" }}>
                {hp.heroSubtext}
              </p>
            )}
            {hp.heroCta && (
              <Link
                href={hp.heroCtaUrl || "/beats"}
                className="mt-8 px-8 py-4 rounded-lg font-bold text-black text-sm transition-all hover:scale-105"
                style={{ background: "linear-gradient(90deg,#A8892E,#C9A84C,#E5C76B)", boxShadow: "0 4px 30px rgba(201,168,76,0.4)" }}
              >
                {hp.heroCta}
              </Link>
            )}
          </div>
        )}
      </section>

      {/* Page navigation tabs */}
      <div className="border-b tab-scrollbar overflow-x-auto" style={{ background: "rgba(10,10,10,0.98)", backdropFilter: "blur(12px)", borderColor: "var(--border)" }}>
        <div className="flex items-center min-w-max mx-auto px-4 md:px-0 md:justify-center">
          {[
            { href: "/beats",      label: "Beats",        icon: ShoppingBag },
            { href: "/drum-kits",  label: "Drum Kits",    icon: Drum },
            { href: "/mixing",     label: "Mix & Master", icon: Mic2 },
            { href: "/artists",    label: "Spotlights",   icon: Users },
            { href: "/about",      label: "About",        icon: Info },
            { href: "/contact",    label: "Contact",      icon: Phone },
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

      {/* Stats counter */}
      <StatsCounter stats={hp.stats} />

      {/* Portfolio Artists */}
      <ArtistsWorkedWith />

      {/* Featured Beats */}
      <section className="relative max-w-5xl mx-auto px-4 py-12 md:py-20 overflow-hidden">
        <div className="orb orb-1 w-96 h-96 -top-20 -left-20" style={{ background: "rgba(201,168,76,0.12)" }} />
        <ScrollReveal className="mb-8">
          <p className="text-xs tracking-[0.3em] mb-2" style={{ color: "var(--fire)" }}>{hp.beatsLabel || "FRESH CUTS"}</p>
          <h2 className="text-3xl md:text-4xl font-black text-white">{hp.beatsHeadline || "Latest Beats"}</h2>
        </ScrollReveal>
        <FeaturedPlayer />
      </section>

      {/* Productions */}
      <Productions videos={hp.productions} />

      {/* Testimonials */}
      <Testimonials />

      {/* Email Capture */}
      <EmailCapture
        badge={hp.emailBadge}
        headline={hp.emailHeadline}
        subtext={hp.emailSubtext}
      />
    </div>
  );
}
