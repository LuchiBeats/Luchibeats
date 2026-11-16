import { Globe, Tv2, Share2, Music } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const GALLERY = [
  { src: "/luchi/session-laptop.webp", alt: "Luchi working on a beat in the studio" },
  { src: "/luchi/studio-window.webp", alt: "Luchi behind the board, seen through the studio glass" },
  { src: "/luchi/session-cigar.webp", alt: "Luchi mid-session at the laptop" },
  { src: "/luchi/portrait-half.webp", alt: "Portrait of Luchi" },
];

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 md:py-12" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)", borderRadius: "1rem" }}>
      <div className="mb-10 md:mb-16">
        <p className="text-xs tracking-[0.3em] mb-2" style={{ color: "var(--gold)" }}>THE PRODUCER</p>
        <h1 className="text-3xl md:text-4xl font-black text-white">About LuchiBeats</h1>
      </div>

      {/* Bio Section */}
      <div className="flex flex-col md:flex-row gap-8 md:gap-12 mb-14 md:mb-20">
        <div className="md:w-72 flex-shrink-0">
          <div className="relative w-full max-w-xs mx-auto md:max-w-none aspect-[2/3] photo-blend">
            <Image
              src="/luchi/portrait-studio.webp"
              alt="Luchi at the board in 934 Studio"
              fill
              priority
              sizes="(max-width: 768px) 320px, 288px"
              className="object-cover"
            />
          </div>
          <div className="mt-6 flex gap-4 justify-center md:justify-start">
            <a href="#" className="hover:text-white transition-colors" style={{ color: "var(--muted)" }}><Globe size={20} /></a>
            <a href="#" className="hover:text-white transition-colors" style={{ color: "var(--muted)" }}><Tv2 size={20} /></a>
            <a href="#" className="hover:text-white transition-colors" style={{ color: "var(--muted)" }}><Share2 size={20} /></a>
            <a href="#" className="hover:text-white transition-colors" style={{ color: "var(--muted)" }}><Music size={20} /></a>
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-xl md:text-2xl font-black text-white mb-5 md:mb-6">My Story</h2>
          <div className="space-y-5 leading-relaxed" style={{ color: "#ffffff" }}>
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
        <p className="text-xs tracking-[0.3em] mb-2" style={{ color: "var(--gold)" }}>BEHIND THE BOARD</p>
        <h2 className="text-xl md:text-2xl font-black text-white mb-5 md:mb-6">In the Studio</h2>
        {/* Phone: 2 per row, overlapping sideways and between rows. Desktop: 4 in one overlapping row. */}
        <div className="flex flex-wrap md:flex-nowrap">
          {GALLERY.map(({ src, alt }) => (
            <div key={src}
              className="photo-tile relative aspect-[2/3] w-[54%] md:w-[28%] overflow-hidden group even:-ml-[8%] [&:nth-child(n+3)]:-mt-[14%] md:[&:nth-child(n+3)]:mt-0 md:[&:not(:first-child)]:-ml-[4%]">
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

      {/* Services Summary */}
      <div className="card-surface rounded-lg p-5 md:p-8 mb-10 md:mb-12">
        <h2 className="text-xl md:text-2xl font-black text-white mb-5 md:mb-6">What I Offer</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold mb-2" style={{ color: "var(--gold)" }}>Beat Production</h3>
            <p className="text-sm" style={{ color: "var(--muted)" }}>Trap, R&B, Hip-Hop, Afrobeats, and more. Custom production built around your sound, from the first idea to the final mix.</p>
          </div>
          <div>
            <h3 className="font-bold mb-2" style={{ color: "var(--gold)" }}>Recording, Mixing & Mastering</h3>
            <p className="text-sm" style={{ color: "var(--muted)" }}>Vocal recording, mixing and mastering from someone who knows the record from the inside out — radio-ready and true to your sound.</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-14 md:mb-20">
        {[
          { number: "100+", label: "Artists Worked With" },
          { number: "100%", label: "Client Satisfaction" },
          { number: "10+", label: "Years of Experience" },
        ].map(({ number, label }) => (
          <div key={label} className="card-surface rounded-lg p-4 md:p-6 text-center">
            <p className="text-2xl md:text-3xl font-black mb-1 gold-gradient">{number}</p>
            <p className="text-xs md:text-sm" style={{ color: "var(--muted)" }}>{label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-4">
        <Link href="/contact" className="btn-gold px-8 py-3 rounded text-sm tracking-wide">Work With Me</Link>
      </div>
    </div>
  );
}
