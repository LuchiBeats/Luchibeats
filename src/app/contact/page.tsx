"use client";
import { useState } from "react";
import { Send, Check } from "lucide-react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSent(true);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-12">
        <p className="text-xs tracking-[0.3em] mb-2" style={{ color: "var(--gold)" }}>LET&apos;S TALK</p>
        <h1 className="text-4xl font-black text-white mb-4">Get in Touch</h1>
        <p style={{ color: "var(--muted)" }}>
          For custom beats, booking a mix session, artist spotlights, or general inquiries — reach out below.
        </p>
      </div>

      {sent ? (
        <div className="card-surface rounded-lg p-12 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(201,168,76,0.15)" }}>
            <Check size={28} style={{ color: "var(--gold)" }} />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Message Sent</h2>
          <p style={{ color: "var(--muted)" }}>I&apos;ll get back to you within 24–48 hours.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card-surface rounded-lg p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Name</label>
              <input required type="text" placeholder="Your name"
                className="w-full rounded px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:ring-1"
                style={{ background: "var(--surface2)", border: "1px solid var(--border)" }} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Email</label>
              <input required type="email" placeholder="your@email.com"
                className="w-full rounded px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:ring-1"
                style={{ background: "var(--surface2)", border: "1px solid var(--border)" }} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Subject</label>
            <select required className="w-full rounded px-4 py-3 text-sm text-white outline-none"
              style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}>
              <option value="">Select a topic...</option>
              <option value="beat">Custom Beat Inquiry</option>
              <option value="mix">Mixing / Mastering</option>
              <option value="spotlight">Artist Spotlight</option>
              <option value="collab">Collaboration</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Message</label>
            <textarea required rows={6} placeholder="Tell me about your project, timeline, budget..."
              className="w-full rounded px-4 py-3 text-sm text-white placeholder-gray-600 outline-none resize-none"
              style={{ background: "var(--surface2)", border: "1px solid var(--border)" }} />
          </div>
          <button type="submit" disabled={loading} className="btn-gold w-full py-3 rounded text-sm tracking-wide flex items-center justify-center gap-2">
            {loading ? "Sending..." : <><Send size={16} /> Send Message</>}
          </button>
        </form>
      )}
    </div>
  );
}
