import { Globe, Tv2, Share2, Music } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 md:py-12" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)", borderRadius: "1rem" }}>
      <div className="mb-10 md:mb-16">
        <p className="text-xs tracking-[0.3em] mb-2" style={{ color: "var(--gold)" }}>THE PRODUCER</p>
        <h1 className="text-3xl md:text-4xl font-black text-white">About LuchiBeats</h1>
      </div>

      {/* Bio Section */}
      <div className="flex flex-col md:flex-row gap-8 md:gap-12 mb-14 md:mb-20">
        <div className="md:w-64 flex-shrink-0">
          <div className="w-full max-w-xs mx-auto md:max-w-none aspect-square rounded-lg flex items-center justify-center text-6xl font-black"
            style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))", color: "var(--gold)" }}>
            L
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

      {/* Services Summary */}
      <div className="card-surface rounded-lg p-5 md:p-8 mb-10 md:mb-12">
        <h2 className="text-xl md:text-2xl font-black text-white mb-5 md:mb-6">What I Offer</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-bold mb-2" style={{ color: "var(--gold)" }}>Beat Production</h3>
            <p className="text-sm" style={{ color: "var(--muted)" }}>Trap, R&B, Hip-Hop, Afrobeats, and more. Licensed in tiers to fit any budget.</p>
          </div>
          <div>
            <h3 className="font-bold mb-2" style={{ color: "var(--gold)" }}>Drum Kits & Sound Kits</h3>
            <p className="text-sm" style={{ color: "var(--muted)" }}>Custom-built kits pulled straight from real studio sessions — drums, samples, and sounds crafted for producers who want something different.</p>
          </div>
          <div>
            <h3 className="font-bold mb-2" style={{ color: "var(--gold)" }}>Mixing & Mastering</h3>
            <p className="text-sm" style={{ color: "var(--muted)" }}>Professional mixing that makes your record compete at the highest level.</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-14 md:mb-20">
        {[
          { number: "100+", label: "Artists Worked With" },
          { number: "500+", label: "Mixes Delivered" },
          { number: "10+", label: "Years of Experience" },
        ].map(({ number, label }) => (
          <div key={label} className="card-surface rounded-lg p-4 md:p-6 text-center">
            <p className="text-2xl md:text-3xl font-black mb-1 gold-gradient">{number}</p>
            <p className="text-xs md:text-sm" style={{ color: "var(--muted)" }}>{label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-4">
        <Link href="/beats" className="btn-gold px-8 py-3 rounded text-sm tracking-wide">Shop Beats</Link>
        <Link href="/contact" className="btn-outline px-8 py-3 rounded text-sm tracking-wide">Work With Me</Link>
      </div>
    </div>
  );
}
