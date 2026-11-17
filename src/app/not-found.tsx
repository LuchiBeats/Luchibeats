import type { Metadata } from "next";
import Link from "next/link";
import { VT323 } from "next/font/google";

const vcr = VT323({ weight: "400", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = { title: "Tracking Lost", robots: { index: false } };

// Broken link: a VCR screen that lost tracking, with the way back
export default function NotFound() {
  return (
    <section className="relative min-h-[80vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="lost-screen" aria-hidden="true">
        <div className="lost-noise" />
        <div className="lost-band" />
        <div className={`${vcr.className} lost-osd`}><span>▶ PLAY</span><span>SP</span></div>
        <div className={`${vcr.className} lost-big`}>TRACKING LOST</div>
        <div className={`${vcr.className} lost-code`}>ERROR 404</div>
      </div>
      <h1 className="section-title mt-10 mb-4">This tape won&apos;t play.</h1>
      <p className="md:text-lg max-w-md mb-8" style={{ color: "rgba(255,255,255,0.7)" }}>
        The page you&apos;re looking for isn&apos;t here. It may have moved, or the link is off by a few letters.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-gold px-7 py-3 rounded text-sm tracking-wide">Back Home</Link>
        <Link href="/live" className="btn-outline px-7 py-3 rounded text-sm tracking-wide">Luchi Beats Live</Link>
        <Link href="/about" className="btn-outline px-7 py-3 rounded text-sm tracking-wide">About</Link>
        <Link href="/contact" className="btn-outline px-7 py-3 rounded text-sm tracking-wide">Contact</Link>
      </div>
    </section>
  );
}
