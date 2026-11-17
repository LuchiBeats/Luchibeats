import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import StatsCounter from "@/components/StatsCounter";
import { getHomepageContent } from "@/lib/beats-store";

// Stats come from the admin Homepage tab so About and the homepage always show the same numbers
export const dynamic = "force-dynamic";

const GALLERY = [
  { src: "/luchi/session-laptop.webp", alt: "Luchi working on a beat in the studio" },
  { src: "/luchi/studio-window.webp", alt: "Luchi behind the board, seen through the studio glass" },
  { src: "/luchi/session-cigar.webp", alt: "Luchi mid-session at the laptop" },
  { src: "/luchi/portrait-half.webp", alt: "Portrait of Luchi" },
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
    <div className="max-w-5xl mx-auto px-4 py-10 md:py-12">
      <div className="mb-10 md:mb-16">
        <p className="eyebrow mb-3">The Producer</p>
        <h1 className="section-title">About LuchiBeats</h1>
      </div>

      {/* Bio Section */}
      {/* Portrait sits behind the story and fades out under the text */}
      <div className="relative mb-14 md:mb-20 md:min-h-[680px]">
        <div className="photo-backdrop from-right absolute top-0 -left-4 -right-4 h-[560px] md:left-auto md:right-[-1rem] md:w-[62%] md:h-full pointer-events-none" aria-hidden="true">
          <Image
            src="/luchi/portrait-studio.webp"
            alt=""
            fill
            priority
            sizes="(max-width: 768px) 100vw, 640px"
            className="object-cover object-[70%_20%]"
          />
        </div>
        <div className="over-photo relative z-10 pt-[400px] md:pt-16 md:pr-[46%]">

          <h2 className="text-2xl md:text-3xl font-black text-white mb-5 md:mb-6">My Story</h2>
          <div className="space-y-5 md:text-[17px] leading-relaxed" style={{ color: "rgba(255,255,255,0.88)" }}>
            <p>
              Paterson, New Jersey doesn&apos;t produce artists — it produces survivors. And the ones who survive long enough to find their gift come out forged, not just formed. Luchi is one of those. Raised in the cultural weight of a city that demands authenticity, he didn&apos;t choose music so much as music chose him — through years of obsession, refinement, and an unwavering commitment to a craft that most walk away from long before it pays off.
            </p>
            <p>
              His portfolio carries a level of credibility that speaks before he does. From street anthems to soulful, layered productions, his fingerprints are on records tied to some of the most respected names the culture has to offer — artists who move crowds, command respect, and don&apos;t settle for average. Luchi has operated in those rooms not as a guest, but as a cornerstone. Mach City said it plainly: <em>&ldquo;Luchi is a one-stop shop for everything music related. He produces, can lay down vocals, and much more. When it&apos;s time to work, he&apos;s ready for the moment — I have never been disappointed on anything we&apos;ve created.&rdquo;</em>
            </p>
            <p>
              What separates him isn&apos;t pedigree — it&apos;s presence. Every session gets the same focus, the same intensity, whether it&apos;s an independent artist finding their voice or an established name chasing something they haven&apos;t caught yet. Calm King Causey, one of New Jersey&apos;s most respected voices, put it this way: <em>&ldquo;Luchi is one of the best engineers I have ever worked with. His production is very diverse and efficient — a master of sound, and the producer/engineer you need in your corner.&rdquo;</em> That&apos;s not praise. That&apos;s a track record.
            </p>
          </div>
        </div>
      </div>

      {/* In the Studio */}
      <div className="mb-14 md:mb-20">
        {/* Heading sits in front; the photos rise up behind it */}
        <div className="over-photo relative z-10">
          <p className="eyebrow mb-3">Behind the Board</p>
          <h2 className="section-title">In the Studio</h2>
        </div>
        {/* Phone: 2 per row. Desktop: 4 across. Neighbours overlap by exactly their fade width so they cross-fade. */}
        <div className="flex flex-wrap md:flex-nowrap -mt-10 md:-mt-20 -mx-4 md:mx-0">
          {GALLERY.map(({ src, alt }) => (
            <div key={src}
              className="photo-tile relative aspect-[2/3] w-[57.15%] md:w-[30.77%] overflow-hidden group even:-ml-[14.3%] [&:nth-child(n+3)]:-mt-[26%] md:[&:nth-child(n+3)]:mt-0 md:[&:not(:first-child)]:-ml-[7.69%]">
              <Image
                src={src}
                alt={alt}
                fill
                sizes="(max-width: 768px) 50vw, 240px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>

      {/* What I Offer: open columns, no box */}
      <section className="mb-6 md:mb-10">
        <ScrollReveal>
          <p className="eyebrow mb-3">Services</p>
          <h2 className="section-title mb-10 md:mb-14">What I Offer</h2>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
          {SERVICES.map(({ title, text }, i) => (
            <ScrollReveal key={title} delay={i * 0.12}>
              <p className="text-5xl md:text-6xl font-black gold-gradient leading-none mb-4 tabular-nums">0{i + 1}</p>
              <div className="h-px w-16 mb-5" style={{ background: "linear-gradient(90deg, var(--gold), transparent)" }} />
              <h3 className="text-xl md:text-2xl font-bold text-white mb-3">{title}</h3>
              <p className="leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>{text}</p>
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
      <Link href="/contact" className="btn-gold inline-flex items-center gap-2 px-10 py-4 rounded text-sm tracking-wide">
        Work With Me <ArrowRight size={16} />
      </Link>
    </ScrollReveal>
    </>
  );
}
