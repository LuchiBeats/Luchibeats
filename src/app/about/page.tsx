import { Globe, Tv2, Share2, Music } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-16">
        <p className="text-xs tracking-[0.3em] mb-2" style={{ color: "var(--gold)" }}>THE PRODUCER</p>
        <h1 className="text-4xl font-black text-white">About LuchiBeats</h1>
      </div>

      {/* Bio Section */}
      <div className="flex flex-col md:flex-row gap-12 mb-20">
        <div className="md:w-64 flex-shrink-0">
          <div className="w-full aspect-square rounded-lg flex items-center justify-center text-6xl font-black"
            style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))", color: "var(--gold)" }}>
            L
          </div>
          <div className="mt-6 flex gap-4">
            <a href="#" className="hover:text-white transition-colors" style={{ color: "var(--muted)" }}><Globe size={20} /></a>
            <a href="#" className="hover:text-white transition-colors" style={{ color: "var(--muted)" }}><Tv2 size={20} /></a>
            <a href="#" className="hover:text-white transition-colors" style={{ color: "var(--muted)" }}><Share2 size={20} /></a>
            <a href="#" className="hover:text-white transition-colors" style={{ color: "var(--muted)" }}><Music size={20} /></a>
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-black text-white mb-6">My Story</h2>
          <div className="space-y-4 leading-relaxed" style={{ color: "var(--muted)" }}>
            <p>
              [Your bio goes here — tell your story, where you started, what drives you, who you&apos;ve worked with.]
            </p>
            <p>
              [Talk about your sound, your influences, what makes your beats and mixing services unique.]
            </p>
            <p>
              [Mention any notable collaborations, placements, or achievements you want people to know about.]
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
        {[
          { number: "500+", label: "Beats Produced" },
          { number: "100+", label: "Artists Worked With" },
          { number: "50+", label: "Mixes Delivered" },
          { number: "10+", label: "Years of Experience" },
        ].map(({ number, label }) => (
          <div key={label} className="card-surface rounded-lg p-6 text-center">
            <p className="text-3xl font-black mb-1 gold-gradient">{number}</p>
            <p className="text-sm" style={{ color: "var(--muted)" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Services Summary */}
      <div className="card-surface rounded-lg p-8 mb-12">
        <h2 className="text-2xl font-black text-white mb-6">What I Offer</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-bold mb-2" style={{ color: "var(--gold)" }}>Beat Production</h3>
            <p className="text-sm" style={{ color: "var(--muted)" }}>Trap, R&B, Hip-Hop, Afrobeats, and more. Licensed in tiers to fit any budget.</p>
          </div>
          <div>
            <h3 className="font-bold mb-2" style={{ color: "var(--gold)" }}>Mixing & Mastering</h3>
            <p className="text-sm" style={{ color: "var(--muted)" }}>Professional mixing that makes your record compete at the highest level.</p>
          </div>
          <div>
            <h3 className="font-bold mb-2" style={{ color: "var(--gold)" }}>Artist Development</h3>
            <p className="text-sm" style={{ color: "var(--muted)" }}>Artist spotlights, networking, and guidance for independent artists on the rise.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <Link href="/beats" className="btn-gold px-8 py-3 rounded text-sm tracking-wide">Shop Beats</Link>
        <Link href="/contact" className="btn-outline px-8 py-3 rounded text-sm tracking-wide">Work With Me</Link>
      </div>
    </div>
  );
}
