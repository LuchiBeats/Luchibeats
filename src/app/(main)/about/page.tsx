import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronDown } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import StatsCounter from "@/components/StatsCounter";
import ScrollStory, { type StoryBlock } from "@/components/ScrollStory";
import StudioGallery from "@/components/StudioGallery";
import ArtistRoll from "@/components/ArtistRoll";
import HomeFX from "@/components/HomeFX";
import { getHomepageContent } from "@/lib/beats-store";

// Stats come from the admin Homepage tab so About and the homepage always show the same numbers
export const dynamic = "force-dynamic";

// Luchi's story, with the artists' words pulled out as quotes
const STORY: StoryBlock[] = [
  [{ text: "Paterson, New Jersey doesn't produce artists — it produces survivors. And the ones who survive long enough to find their gift come out forged, not just formed. Luchi is one of those. Raised in the cultural weight of a city that demands authenticity, he didn't choose music so much as music chose him — through years of obsession, refinement, and an unwavering commitment to a craft that most walk away from long before it pays off." }],
  [{ text: "His portfolio carries a level of credibility that speaks before he does. From street anthems to soulful, layered productions, his fingerprints are on records tied to some of the most respected names the culture has to offer — artists who move crowds, command respect, and don't settle for average. Luchi has operated in those rooms not as a guest, but as a cornerstone. Mach City said it plainly:" }],
  { quote: "Luchi is a one-stop shop for everything music related. He produces, can lay down vocals, and much more. When it's time to work, he's ready for the moment — I have never been disappointed on anything we've created.", by: "Mach City" },
  [{ text: "What separates him isn't pedigree — it's presence. Every session gets the same focus, the same intensity, whether it's an independent artist finding their voice or an established name chasing something they haven't caught yet. Calm King Causey, one of New Jersey's most respected voices, put it this way:" }],
  { quote: "Luchi is one of the best engineers I have ever worked with. His production is very diverse and efficient — a master of sound, and the producer/engineer you need in your corner.", by: "Calm King Causey" },
  { punch: "That's not praise. That's a track record." },
];

const SERVICES = [
  { title: "Beat Production", text: "Trap, R&B, Hip-Hop, Afrobeats, and more. Custom production built around your sound, from the first idea to the final mix." },
  { title: "Recording, Mixing & Mastering", text: "Vocal recording, mixing and mastering from someone who knows the record from the inside out — radio-ready and true to your sound." },
];

export default async function AboutPage() {
  let stats;
  try { stats = (await getHomepageContent()).stats; } catch {}
  return (
    <>
    <HomeFX />

    {/* ── Hero: the portrait in front of a giant gold outline of the name ── */}
    <section className="about-hero">
      <span className="about-hero-outline" aria-hidden="true" data-parallax="-0.12">LUCHI</span>
      <div className="about-hero-photo" data-parallax="0.06">
        <Image src="/luchi/portrait-studio.webp" alt="Luchi at the console in the studio" fill priority
          sizes="(max-width: 768px) 92vw, 560px" className="object-cover object-[68%_22%]" />
      </div>
      <div className="about-hero-text">
        <p className="eyebrow mb-3">About</p>
        <h1 className="about-hero-name">Luchi</h1>
        <p className="about-hero-role">Producer <span>·</span> Engineer <span>·</span> Paterson, New Jersey</p>
        <a href="#story" className="about-hero-cue" aria-label="Read the story"><ChevronDown size={22} /></a>
      </div>
    </section>

    <div className="max-w-5xl mx-auto px-4">
      {/* ── The story, centered, lighting up as you read ── */}
      <section id="story" className="scroll-mt-24 max-w-[680px] mx-auto pt-6 md:pt-10 mb-20 md:mb-28">
        <p className="eyebrow mb-3 text-center">The Producer</p>
        <h2 className="section-title text-center mb-10 md:mb-14">My Story</h2>
        <ScrollStory paragraphs={STORY} />
      </section>

      {/* ── In the Studio ── */}
      <div className="mb-20 md:mb-28">
        <div className="over-photo relative z-10 text-center">
          <p className="eyebrow mb-3">Behind the Board</p>
          <h2 className="section-title">In the Studio</h2>
        </div>
        <StudioGallery />
      </div>

      {/* ── Every artist: hover a name to see them ── */}
      <section className="mb-20 md:mb-28 text-center">
        <ScrollReveal>
          <p className="eyebrow mb-3">Worked With</p>
          <h2 className="section-title mb-8 md:mb-12">In the Room With</h2>
        </ScrollReveal>
        <ArtistRoll />
      </section>

      {/* ── What I Offer ── */}
      <section className="mb-10 md:mb-14">
        <ScrollReveal className="text-center">
          <p className="eyebrow mb-3">Services</p>
          <h2 className="section-title mb-10 md:mb-14">What I Offer</h2>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-0 max-w-4xl mx-auto">
          {SERVICES.map(({ title, text }, i) => (
            <ScrollReveal key={title} delay={i * 0.12} className={`offer ${i === 1 ? "md:border-l" : ""}`}>
              <p className="text-6xl md:text-7xl font-black gold-gradient leading-none mb-4 tabular-nums">0{i + 1}</p>
              <div className="h-px w-16 mx-auto mb-5" style={{ background: "linear-gradient(90deg, transparent, var(--gold), transparent)" }} />
              <h3 className="text-xl md:text-2xl font-bold text-white mb-3">{title}</h3>
              <p className="leading-relaxed max-w-sm mx-auto" style={{ color: "rgba(255,255,255,0.65)" }}>{text}</p>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </div>

    {/* Same numbers as the homepage */}
    <StatsCounter stats={stats} />

    {/* Closing call to action */}
    <ScrollReveal className="max-w-3xl mx-auto px-4 pt-6 pb-4 text-center">
      <h2 className="section-title mb-5">Let&apos;s make the record.</h2>
      <p className="md:text-lg mb-8" style={{ color: "rgba(255,255,255,0.65)" }}>
        Custom beats, recording, mixing and mastering. Tell me what you&apos;re working on.
      </p>
      <Link href="/contact" data-magnetic className="btn-gold inline-flex items-center gap-2 px-10 py-4 rounded text-sm tracking-wide">
        Work With Me <ArrowRight size={16} />
      </Link>
    </ScrollReveal>
    </>
  );
}
