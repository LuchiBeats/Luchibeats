"use client";
import { useState, useEffect } from "react";
import { Send, Check, ArrowUpRight } from "lucide-react";

const SOCIALS = [
  { label: "Instagram", handle: "@luchi_beats", href: "https://www.instagram.com/luchi_beats" },
  { label: "YouTube", handle: "@LuchiBeats", href: "https://www.youtube.com/@LuchiBeats?sub_confirmation=1" },
  { label: "Kick", handle: "@luchibeats", href: "https://kick.com/luchibeats" },
];
import ScrollReveal from "@/components/ScrollReveal";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // "Make Offer" on /beats links here with ?beat=<title>
  const [offerBeat, setOfferBeat] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const beat = new URLSearchParams(window.location.search).get("beat")?.slice(0, 120);
    if (!beat) return;
    setOfferBeat(beat);
    setSubject(`Exclusive Offer: ${beat}`);
    setMessage(`Hi Luchi, I'd like to make an offer on the exclusive for "${beat}".

My offer: $
Artist name / links:
Release plans:`);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      subject: (form.elements.namedItem("subject") as HTMLSelectElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    };
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError((body as { error?: string }).error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
    } catch {
      setError("Network error. Check your connection and try again.");
      setLoading(false);
      return;
    }
    setLoading(false);
    setSent(true);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-16 grid grid-cols-1 md:grid-cols-[1fr_1.3fr] gap-12 md:gap-20">
      <div>
        <p className="eyebrow mb-3">Let&apos;s Talk</p>
        <h1 className="section-title mb-5">Get in Touch</h1>
        <p className="md:text-lg leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
          {offerBeat
            ? <>Making an offer on <span className="text-white font-semibold">{offerBeat}</span>. Every beat is sold exclusively to one artist.</>
            : "For custom beats, exclusive offers or general inquiries — send a message and I'll get back to you within 24–48 hours."}
        </p>
        <div className="mt-10 md:mt-14">
          <p className="eyebrow mb-4">Or find me on</p>
          <ul>
            {SOCIALS.map(({ label, handle, href }) => (
              <li key={label}>
                <a href={href} target="_blank" rel="noopener noreferrer"
                  className="group flex items-center justify-between py-4 transition-colors"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  <span>
                    <span className="block text-white font-bold text-lg group-hover:text-[var(--fire-light)] transition-colors">{label}</span>
                    <span className="text-sm" style={{ color: "var(--muted)" }}>{handle}</span>
                  </span>
                  <ArrowUpRight size={20} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" style={{ color: "var(--gold)" }} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="md:pt-8">

      {sent ? (
        <ScrollReveal className="py-16 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(201,168,76,0.15)" }}>
            <Check size={28} style={{ color: "var(--gold)" }} />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Message Sent</h2>
          <p style={{ color: "var(--muted)" }}>I&apos;ll get back to you within 24–48 hours.</p>
        </ScrollReveal>
      ) : (
        <ScrollReveal>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block eyebrow">Name</label>
              <input required name="name" type="text" placeholder="Your name"
                className="field" />
            </div>
            <div>
              <label className="block eyebrow">Email</label>
              <input required name="email" type="email" placeholder="your@email.com"
                className="field" />
            </div>
          </div>
          <div>
            <label className="block eyebrow">Subject</label>
            <select required name="subject" value={subject} onChange={e => setSubject(e.target.value)} className="field">
              <option value="">Select a topic...</option>
              {offerBeat && <option value={`Exclusive Offer: ${offerBeat}`}>Exclusive Offer: {offerBeat}</option>}
              <option value="Custom Beat Inquiry">Custom Beat Inquiry</option>
              <option value="Collaboration">Collaboration</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block eyebrow">Message</label>
            <textarea required name="message" rows={6} value={message} onChange={e => setMessage(e.target.value)} placeholder="Tell me about your project, timeline, budget..."
              className="field resize-none" />
          </div>
          {error && (
            <p className="text-sm rounded px-4 py-3" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
              ⚠ {error}
            </p>
          )}
          <button type="submit" disabled={loading} className="btn-gold w-full md:w-auto md:px-12 py-4 rounded text-sm tracking-wide flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? "Sending..." : <><Send size={16} /> Send Message</>}
          </button>
        </form>
        </ScrollReveal>
      )}
      </div>
    </div>
  );
}
