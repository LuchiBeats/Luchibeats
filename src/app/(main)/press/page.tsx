import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Download, FileText } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { RecapPair } from "@/components/LiveRecap";
import { collaborators } from "@/lib/collaborators";

// Press kit for A&Rs, managers and press: the one link to send when pitching.
// No credits list here or in the PDF (Luchi's call, 2026-11-20).

export const metadata: Metadata = {
  title: "Press Kit",
  description: "Luchi Beats press kit: bio, live recap videos, artists, quotes, press photos and a downloadable one-sheet.",
  openGraph: { title: "Luchi Beats — Press Kit", description: "Producer & engineer, Paterson NJ. Bio, videos, photos and one-sheet." },
};

const BIO_SHORT =
  "Luchi Beats is a producer and engineer out of Paterson, New Jersey. Over the years he has produced, recorded and mixed records for some of the most respected names in the culture, from street anthems to soulful, layered productions. Artists know him as a one-stop shop: the beat, the vocal session and the mix, all with the same focus.";

const QUOTES = [
  { by: "Calm King Causey", text: "Luchi is one of the best engineers I have ever worked with. His production is very diverse and efficient — a master of sound, and the producer/engineer you need in your corner." },
  { by: "Mach City", text: "Luchi is a one-stop shop for everything music related. He produces, can lay down vocals, and much more. When it's time to work, he's ready for the moment." },
];

// Portrait shoot: shown as light webp copies, downloads are the full-quality JPGs.
const shot = (n: string, alt: string, landscape = false) =>
  ({ src: `/luchi/shoot/${n}.webp`, dl: `/luchi/press/luchi-beats-${n}.jpg`, alt, w: landscape ? 1163 : 968, h: landscape ? 778 : 1450 });
const PHOTOS = [
  shot("red-low-angle", "Luchi, portrait against red"),
  shot("bw-hand-face", "Luchi, black and white, hand over his face"),
  shot("red-stare", "Luchi, straight-on against red", true),
  shot("red-profile", "Luchi in profile, red"),
  shot("bw-half", "Luchi, black and white half-face"),
  shot("bw-binoculars", "Luchi, black and white, looking through his hands", true),
  shot("red-half", "Luchi, half-face against orange"),
  shot("bw-hand-mouth", "Luchi, black and white, hand over his mouth"),
  shot("red-eyes", "Luchi, eyes and brow, red", true),
  shot("crimson-half", "Luchi, half-face against crimson"),
  { src: "/luchi/portrait-studio.webp", dl: "/luchi/portrait-studio.webp", alt: "Luchi at the console", w: 0, h: 0 },
  { src: "/luchi/studio-window.webp", dl: "/luchi/studio-window.webp", alt: "Luchi behind the board", w: 0, h: 0 },
  { src: "/luchi/session-laptop.webp", dl: "/luchi/session-laptop.webp", alt: "Luchi building a beat", w: 0, h: 0 },
];

const ONE_SHEET = "/luchi-beats-press-kit.pdf";

export default function PressPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 md:py-16">
      {/* ── Header ── */}
      <header className="text-center">
        <p className="eyebrow mb-3">Press Kit</p>
        <h1 className="section-title">Luchi Beats</h1>
        <p className="mt-4 text-sm md:text-base font-semibold tracking-[0.3em] uppercase" style={{ color: "rgba(255,255,255,0.8)" }}>
          Producer <span style={{ color: "var(--gold)" }}>·</span> Engineer
        </p>
        <p className="mt-1 text-xs md:text-sm tracking-[0.35em] uppercase" style={{ color: "rgba(255,255,255,0.5)" }}>Paterson, NJ</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={ONE_SHEET} download data-magnetic className="btn-gold inline-flex items-center gap-2 px-7 py-3 rounded text-sm tracking-wide">
            <FileText size={16} /> Download One-Sheet (PDF)
          </a>
          <Link href="/contact" data-magnetic className="btn-outline inline-flex items-center gap-2 px-7 py-3 rounded text-sm tracking-wide">
            Booking &amp; Inquiries <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      {/* ── Bio ── */}
      <section className="mt-16 md:mt-20 grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8 md:gap-12 items-center">
        <ScrollReveal className="press-portrait relative mx-auto w-[min(300px,80vw)] aspect-[4/5]">
          <Image src="/luchi/shoot/red-low-angle.webp" alt="Luchi Beats" fill sizes="300px" className="object-cover object-[50%_35%]" />
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <p className="eyebrow mb-3">Bio</p>
          <p className="md:text-lg leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>{BIO_SHORT}</p>
          <dl className="press-facts mt-6">
            <div><dt>Based in</dt><dd>Paterson, New Jersey</dd></div>
            <div><dt>Does</dt><dd>Production · Recording · Mixing &amp; Mastering</dd></div>
            <div><dt>Genres</dt><dd>Hip-Hop · Latin Hip-Hop · Reggaeton · Trap · R&amp;B · Afrobeats</dd></div>
            <div><dt>Open to</dt><dd>Publishing · Production Deals · Placements · Studio Partnerships · A&amp;R</dd></div>
            <div><dt>Business</dt><dd>Luchi Beats LLC · BMI-registered · Split sheets on every session</dd></div>
            <div><dt>Live</dt><dd><Link href="/live" className="underline decoration-[rgba(229,199,107,0.5)] underline-offset-4 hover:text-[var(--fire-light)]">Luchi Beats &amp; Friends</Link> on YouTube</dd></div>
          </dl>
        </ScrollReveal>
      </section>

      {/* ── Videos (the press kit PDF's video tiles link here) ── */}
      <section id="videos" className="mt-20 md:mt-24 text-center scroll-mt-28">
        <ScrollReveal className="mb-8">
          <p className="eyebrow mb-3">Watch</p>
          <h2 className="section-title">Live Recap Videos</h2>
        </ScrollReveal>
        <RecapPair />
      </section>

      {/* ── Artists ── */}
      <section className="mt-20 md:mt-24 text-center">
        <ScrollReveal>
          <p className="eyebrow mb-3">The Portfolio</p>
          <h2 className="section-title mb-8">Worked With</h2>
        </ScrollReveal>
        <p className="press-names">
          {collaborators.map((a, i) => (
            <span key={a.name}><span className="whitespace-nowrap">{a.name}</span>{i < collaborators.length - 1 && <span className="press-dot" aria-hidden="true"> · </span>}</span>
          ))}
        </p>
      </section>

      {/* ── Quotes ── */}
      <section className="mt-20 md:mt-24 grid grid-cols-1 md:grid-cols-2 gap-10">
        {QUOTES.map((q) => (
          <ScrollReveal key={q.by} className="press-quote">
            <span className="press-quote-mark" aria-hidden="true">&ldquo;</span>
            <blockquote>{q.text}</blockquote>
            <p className="press-quote-by">— {q.by}</p>
          </ScrollReveal>
        ))}
      </section>

      {/* ── Press photos ── */}
      <section className="mt-20 md:mt-24">
        <ScrollReveal className="text-center mb-8">
          <p className="eyebrow mb-3">Media</p>
          <h2 className="section-title">Press Photos</h2>
          <p className="mt-3 text-sm" style={{ color: "var(--muted)" }}>Free to use with credit to Luchi Beats. Click to download.</p>
        </ScrollReveal>
        <ul className="press-photos">
          {PHOTOS.map((p) => (
            <li key={p.src}>
              <a href={p.dl} download className="press-photo group" aria-label={`Download photo: ${p.alt}`}>
                {p.w ? (
                  <Image src={p.src} alt={p.alt} width={p.w} height={p.h} sizes="(max-width: 640px) 50vw, 320px" />
                ) : (
                  <span className="block relative aspect-[2/3]"><Image src={p.src} alt={p.alt} fill sizes="(max-width: 640px) 50vw, 320px" className="object-cover" /></span>
                )}
                <span className="press-photo-dl"><Download size={16} /> Download</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Contact ── */}
      <section className="mt-20 md:mt-24 text-center">
        <h2 className="section-title mb-4">Booking &amp; Inquiries</h2>
        <p className="md:text-lg mb-8" style={{ color: "rgba(255,255,255,0.7)" }}>For production, sessions, features or interviews, reach out directly.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/contact" data-magnetic className="btn-gold inline-flex items-center gap-2 px-8 py-3.5 rounded text-sm tracking-wide">Contact Luchi <ArrowRight size={15} /></Link>
          <a href="https://www.instagram.com/luchi_beats" target="_blank" rel="noopener noreferrer" className="btn-outline px-6 py-3.5 rounded text-sm tracking-wide">Instagram</a>
          <a href="https://www.youtube.com/@LuchiBeats" target="_blank" rel="noopener noreferrer" className="btn-outline px-6 py-3.5 rounded text-sm tracking-wide">YouTube</a>
        </div>
      </section>
    </div>
  );
}
