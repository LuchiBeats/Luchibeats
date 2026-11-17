"use client";
import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const LINKTREE_URL = "https://linktr.ee/luchibeats";

interface Props {
  badge?: string;
  headline?: string;
  subtext?: string;
}

export default function EmailCapture({
  badge = "JOIN THE LIST",
  headline = "Stay Up To Date\nOn New Drops",
  subtext = "Join the list. Be the first to hear new drops and exclusive deals.",
}: Props) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const [line1, line2] = headline.split("\n");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    // Open Linktree in a new tab synchronously (inside the click) so pop-up blockers allow it
    window.open(LINKTREE_URL, "_blank", "noopener,noreferrer");
    setLoading(true);
    try {
      await fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    } catch {}
    setLoading(false);
    setDone(true);
  }

  return (
    <section className="relative py-14 md:py-28 overflow-hidden" style={{ background: "linear-gradient(to bottom, transparent, var(--surface) 25%, var(--surface) 75%, transparent)" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(201,168,76,0.07) 0%, transparent 65%)" }} />

      <div className="relative max-w-2xl mx-auto px-4 text-center">
        <ScrollReveal>
          <p className="eyebrow mb-4">{badge || "Join the List"}</p>
          <h2 className="section-title mb-5">
            {line1}
            {line2 && <><br /><span className="gold-gradient">{line2}</span></>}
          </h2>
          <p className="md:text-lg mb-10" style={{ color: "rgba(255,255,255,0.65)" }}>
            {subtext}
          </p>

          {done ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full flex items-center justify-center fire-glow" style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.3)" }}>
                <Check size={28} style={{ color: "var(--fire)" }} />
              </div>
              <p className="font-bold text-white text-lg">You&apos;re in. Welcome to the list.</p>
              <a href={LINKTREE_URL} target="_blank" rel="noopener noreferrer" className="text-sm underline" style={{ color: "var(--fire)" }}>Linktree didn&apos;t open? Click here.</a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row sm:items-end gap-5 sm:gap-4 max-w-lg mx-auto">
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                aria-label="Email address"
                className="field flex-1 text-center sm:text-left"
              />
              <button type="submit" disabled={loading} className="btn-gold px-8 py-3.5 rounded text-sm font-bold flex items-center justify-center gap-2 whitespace-nowrap">
                {loading ? "Sending..." : <><span>Subscribe</span><ArrowRight size={15} /></>}
              </button>
            </form>
          )}
          <p className="mt-4 text-xs" style={{ color: "var(--muted)" }}>No spam. Unsubscribe anytime.</p>
        </ScrollReveal>
      </div>
    </section>
  );
}
