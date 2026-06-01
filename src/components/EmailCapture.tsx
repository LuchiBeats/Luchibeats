"use client";
import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

export default function EmailCapture() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setDone(true);
  }

  return (
    <section className="relative py-28 overflow-hidden" style={{ background: "var(--surface)" }}>
      {/* Animated gold background pulse */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(201,168,76,0.07) 0%, transparent 65%)" }} />
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)" }} />
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)" }} />

      <div className="relative max-w-2xl mx-auto px-4 text-center">
        <ScrollReveal>
          <div className="inline-block px-4 py-1 rounded-full text-xs tracking-widest font-bold mb-6" style={{ background: "rgba(201,168,76,0.1)", color: "var(--fire)", border: "1px solid rgba(201,168,76,0.25)" }}>
            FREE BEAT
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            Get a Free Beat<br />
            <span className="gold-gradient">When You Subscribe</span>
          </h2>
          <p className="mb-10" style={{ color: "var(--muted)" }}>
            Join the list. Be the first to hear new drops, exclusive deals, and get a free beat delivered straight to your inbox.
          </p>

          {done ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full flex items-center justify-center fire-glow" style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.3)" }}>
                <Check size={28} style={{ color: "var(--fire)" }} />
              </div>
              <p className="font-bold text-white text-lg">You&apos;re in. Check your inbox.</p>
              <p className="text-sm" style={{ color: "var(--muted)" }}>Your free beat is on its way.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 rounded px-5 py-3 text-sm text-white placeholder-gray-600 outline-none"
                style={{ background: "var(--surface2)", border: "1px solid rgba(201,168,76,0.25)" }}
              />
              <button type="submit" disabled={loading} className="btn-gold px-6 py-3 rounded text-sm font-bold flex items-center justify-center gap-2 whitespace-nowrap">
                {loading ? "Sending..." : <><span>Get Free Beat</span><ArrowRight size={15} /></>}
              </button>
            </form>
          )}
          <p className="mt-4 text-xs" style={{ color: "var(--muted)" }}>No spam. Unsubscribe anytime.</p>
        </ScrollReveal>
      </div>
    </section>
  );
}
