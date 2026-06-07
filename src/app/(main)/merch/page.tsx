import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Tag, Mail } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "Merch — LuchiBeats Official Store",
  description: "Official LuchiBeats merchandise — premium streetwear and exclusive drops coming soon.",
};

const PREVIEW_ITEMS = ["Hoodie", "Cap", "T-Shirt", "Poster", "Sticker Pack", "Tote Bag"];

export default function MerchPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute w-[700px] h-[700px] rounded-full top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ background: "radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%)" }} />
        <div className="absolute w-96 h-96 rounded-full bottom-1/4 -right-48"
          style={{ background: "radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)" }} />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 py-20 md:py-32 text-center">
        <ScrollReveal>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full text-xs tracking-[0.25em] font-bold mb-10"
            style={{ background: "rgba(201,168,76,0.08)", color: "var(--fire)", border: "1px solid rgba(201,168,76,0.2)" }}>
            <Tag size={11} />
            OFFICIAL STORE
          </div>

          {/* Headline */}
          <h1 className="font-black leading-none mb-4"
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontStyle: "italic",
              fontSize: "clamp(3.5rem, 12vw, 7rem)",
              color: "var(--gold)",
            }}>
            Coming Soon
          </h1>

          <p className="text-lg md:text-xl font-bold text-white mb-4">Official LuchiBeats Merch</p>
          <p className="text-sm max-w-md mx-auto mb-14" style={{ color: "var(--muted)" }}>
            Premium streetwear, accessories, and exclusive limited drops for the culture.
            The official store is loading — stay tuned.
          </p>

          {/* Preview grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-14 max-w-xl mx-auto">
            {PREVIEW_ITEMS.map((item) => (
              <div key={item} className="rounded-2xl flex flex-col items-center justify-center gap-3 py-10"
                style={{ background: "rgba(201,168,76,0.03)", border: "1px solid rgba(201,168,76,0.1)" }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(201,168,76,0.07)", border: "1px solid rgba(201,168,76,0.15)" }}>
                  <Tag size={18} style={{ color: "rgba(201,168,76,0.35)" }} />
                </div>
                <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "rgba(201,168,76,0.3)" }}>
                  {item}
                </p>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="w-16 h-px mx-auto mb-10" style={{ background: "rgba(201,168,76,0.3)" }} />

          {/* CTA row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg text-sm font-bold transition-all hover:scale-105 hover:shadow-lg"
              style={{ background: "linear-gradient(90deg,#A8892E,#C9A84C,#E5C76B)", color: "#000" }}>
              <Mail size={14} />
              Get Notified
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-white"
              style={{ color: "var(--muted)" }}>
              ← Back to Home
            </Link>
          </div>

          <p className="mt-8 text-xs" style={{ color: "rgba(201,168,76,0.3)" }}>
            Drop alerts will go to current email subscribers first.
          </p>
        </ScrollReveal>
      </div>
    </div>
  );
}
