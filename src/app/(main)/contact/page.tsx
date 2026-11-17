"use client";
import { useState, useEffect, useMemo } from "react";
import { Send, Check, ArrowUpRight, Clock } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import HomeFX from "@/components/HomeFX";
import { Embers, TypingWave, ScrambleWords, pulse } from "@/components/ContactFX";

const HEADLINE_WORDS = ["a hit.", "a record.", "history.", "noise.", "magic."];

const SOCIALS = [
  { label: "Instagram", handle: "@luchi_beats", href: "https://www.instagram.com/luchi_beats" },
  { label: "YouTube", handle: "@LuchiBeats", href: "https://www.youtube.com/@LuchiBeats?sub_confirmation=1" },
  { label: "Kick", handle: "@luchibeats", href: "https://kick.com/luchibeats" },
];

// What the visitor can pick; each one tunes the message hint
const TOPICS = [
  { label: "Custom Beat", hint: "What's the vibe? Reference tracks, tempo, artists you're inspired by..." },
  { label: "Recording", hint: "How many songs, when you want to get in the booth, anything I should hear first..." },
  { label: "Mixing & Mastering", hint: "How many tracks, links to rough mixes, references and your release date..." },
  { label: "Collaboration", hint: "Who you are, what you're working on and what you have in mind..." },
  { label: "Something Else", hint: "Tell me what's on your mind..." },
];
const MAX = 5000;

// Live time in Paterson, NJ (rendered after mount so server and browser agree)
function PatersonClock() {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const fmt = () => new Date().toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit" });
    const first = window.setTimeout(() => setNow(fmt()), 0);
    const id = window.setInterval(() => setNow(fmt()), 15000);
    return () => { window.clearTimeout(first); window.clearInterval(id); };
  }, []);
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
      <span className="flex items-center gap-2">
        <span className="relative flex w-2 h-2">
          <span className="absolute inset-0 rounded-full animate-ping" style={{ background: "var(--gold)", opacity: 0.6 }} />
          <span className="relative w-2 h-2 rounded-full" style={{ background: "var(--gold)" }} />
        </span>
        {now ? <>It&apos;s <span className="text-white font-semibold tabular-nums">{now}</span> in Paterson, NJ</> : "Paterson, NJ"}
      </span>
      <span className="flex items-center gap-2"><Clock size={14} style={{ color: "var(--gold)" }} /> Replies within 24–48 hours</span>
    </div>
  );
}

// Gold sparks that fly out from the check mark when a message is sent
function Burst() {
  const sparks = useMemo(() => Array.from({ length: 18 }, (_, i) => {
    const a = (i / 18) * Math.PI * 2 + (i % 2) * 0.2;
    const d = 70 + (i % 3) * 28;
    return { x: Math.cos(a) * d, y: Math.sin(a) * d, delay: (i % 4) * 0.03, size: 4 + (i % 3) * 2 };
  }), []);
  return (
    <div aria-hidden="true" className="absolute left-1/2 top-1/2 pointer-events-none">
      {sparks.map((s, i) => (
        <span key={i} className="spark absolute rounded-full"
          style={{ width: s.size, height: s.size, ["--x" as string]: `${s.x}px`, ["--y" as string]: `${s.y}px`, animationDelay: `${s.delay}s`,
            background: i % 3 ? "#E5C76B" : "#FFF3C4", boxShadow: "0 0 10px rgba(229,199,107,0.9)" }} />
      ))}
    </div>
  );
}

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Old "Make Offer" links point here with ?beat=<title>
  const [offerBeat, setOfferBeat] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const beat = new URLSearchParams(window.location.search).get("beat")?.slice(0, 120);
    if (!beat) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read once from the URL on mount
    setOfferBeat(beat);
    setTopics([`Exclusive Offer: ${beat}`]);
    setMessage(`Hi Luchi, I'd like to make an offer on the exclusive for "${beat}".

My offer: $
Artist name / links:
Release plans:`);
  }, []);

  const toggleTopic = (t: string) => { pulse(3); setTopics((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t])); };
  const hint = TOPICS.find((t) => t.label === topics[topics.length - 1])?.hint ?? "Tell me about your project, timeline, budget...";
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const steps = [topics.length > 0, name.trim().length > 0, emailOk, message.trim().length > 9];
  const done = steps.filter(Boolean).length;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!topics.length) { setError("Pick what we're working on first."); return; }
    setLoading(true);
    setError("");
    pulse(4);
    try {
      const res = await fetch("/api/contact", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject: topics.join(" + ").slice(0, 200), message }),
      });
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
    pulse(8);
  }

  function reset() {
    setSent(false); setTopics([]); setMessage(""); setError("");
  }

  const topicList = offerBeat ? [{ label: `Exclusive Offer: ${offerBeat}`, hint: "" }, ...TOPICS] : TOPICS;

  return (
    <>
    <HomeFX />
    <Embers />
    <div className="max-w-3xl mx-auto px-4 py-10 md:py-16">
      {/* ── Heading ── */}
      <header className="text-center">
        <p className="eyebrow mb-3">Get in Touch</p>
        <h1 className="section-title mb-6">Let&apos;s make<br /><ScrambleWords words={HEADLINE_WORDS} /></h1>
        <p className="md:text-lg leading-relaxed max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.75)" }}>
          {offerBeat
            ? <>Making an offer on <span className="text-white font-semibold">{offerBeat}</span>. Every beat is sold exclusively to one artist.</>
            : "Custom beats, recording, mixing and mastering, or just an idea you want to run by me. Send a message and let's get to work."}
        </p>
        <PatersonClock />
      </header>

      {/* ── The form ── */}
      <div className="contact-form mt-12 md:mt-16">
      {sent ? (
        <div className="relative py-16 text-center" role="status" style={{ animation: "fadeSlide 0.5s ease-out" }}>
          <div className="relative w-24 h-24 mx-auto mb-6">
            <Burst />
            <svg viewBox="0 0 52 52" className="w-24 h-24" aria-hidden="true">
              <circle className="draw-circle" cx="26" cy="26" r="24" fill="none" stroke="url(#goldStroke)" strokeWidth="2" />
              <path className="draw-check" d="M15 27 l7 7 l15 -16" fill="none" stroke="#E5C76B" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              <defs><linearGradient id="goldStroke" x1="0" x2="1"><stop offset="0" stopColor="#A8892E" /><stop offset="1" stopColor="#F0D878" /></linearGradient></defs>
            </svg>
          </div>
          <h2 className="section-title mb-3">Message Sent</h2>
          <p className="md:text-lg mb-8" style={{ color: "rgba(255,255,255,0.7)" }}>
            Thanks{name.trim() ? `, ${name.trim().split(" ")[0]}` : ""}. I&apos;ll get back to you within 24–48 hours.
          </p>
          <button type="button" onClick={reset} className="btn-outline px-8 py-3 rounded text-sm tracking-wide">Send another</button>
        </div>
      ) : (
        <ScrollReveal>
        <form onSubmit={handleSubmit} className="space-y-9" noValidate={false}>
          {/* Progress */}
          <div>
            <div className="flex justify-between text-xs mb-2 font-mono tracking-widest" style={{ color: "var(--muted)" }}>
              <span>{done === 4 ? "READY TO SEND" : "YOUR MESSAGE"}</span>
              <span style={{ color: done === 4 ? "var(--fire-light)" : undefined }}>{done}/4</span>
            </div>
            <div className="h-[3px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div className="h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(done / 4) * 100}%`, background: "linear-gradient(90deg,#A8892E,#E5C76B,#F0D878)", boxShadow: done ? "0 0 12px rgba(229,199,107,0.6)" : "none" }} />
            </div>
          </div>

          <fieldset>
            <legend className="eyebrow mb-4 w-full text-center">What are we working on?</legend>
            <div className="flex flex-wrap justify-center gap-2.5">
              {topicList.map(({ label }) => {
                const on = topics.includes(label);
                return (
                  <button key={label} type="button" onClick={() => toggleTopic(label)} aria-pressed={on}
                    className="topic-chip relative overflow-hidden inline-flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300"
                    style={on
                      ? { background: "linear-gradient(90deg,#A8892E,#C9A84C,#E5C76B)", color: "#000", boxShadow: "0 6px 24px rgba(201,168,76,0.35)" }
                      : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.85)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)" }}>
                    <span className="grid transition-all duration-300" style={{ gridTemplateColumns: on ? "1fr" : "0fr" }}>
                      <span className="overflow-hidden"><Check size={14} strokeWidth={3} /></span>
                    </span>
                    {label}
                    <span aria-hidden="true" className="chip-shine" />
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="field-wrap">
              <label htmlFor="c-name" className="block eyebrow">Name</label>
              <input id="c-name" required name="name" type="text" placeholder="Your name" autoComplete="name"
                value={name} onChange={(e) => setName(e.target.value)} className="field" onKeyDown={() => pulse()} />
            </div>
            <div className="field-wrap">
              <label htmlFor="c-email" className="block eyebrow">Email</label>
              <input id="c-email" required name="email" type="email" placeholder="your@email.com" autoComplete="email"
                value={email} onChange={(e) => setEmail(e.target.value)} className="field" onKeyDown={() => pulse()} />
            </div>
          </div>
          <div className="field-wrap">
            <div className="flex justify-between items-baseline">
              <label htmlFor="c-message" className="block eyebrow">Message</label>
              <span className="text-xs tabular-nums" style={{ color: message.length > MAX * 0.9 ? "#f87171" : "var(--muted)" }}>{message.length}/{MAX}</span>
            </div>
            <textarea id="c-message" required name="message" rows={6} maxLength={MAX} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={hint}
              className="field resize-none" onKeyDown={() => pulse()} />
          </div>
          {error && (
            <p className="text-sm rounded px-4 py-3" role="alert" style={{ background: "rgba(239,68,68,0.08)", color: "#f87171" }}>
              ⚠ {error}
            </p>
          )}
          <div className="-mt-4"><TypingWave /></div>
          <button type="submit" disabled={loading} data-magnetic
            className="send-btn btn-gold w-full md:w-auto md:px-14 mx-auto py-4 rounded text-sm tracking-wide flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? "Sending..." : <><Send size={16} className="send-icon" /> Send Message</>}
          </button>
        </form>
        </ScrollReveal>
      )}
      </div>

      {/* ── Socials ── */}
      <div className="mt-16 md:mt-20 text-center">
        <p className="eyebrow mb-5">Or find me on</p>
        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          {SOCIALS.map(({ label, handle, href }) => (
            <li key={label}>
              <a href={href} target="_blank" rel="noopener noreferrer" className="social-tile group">
                <span className="relative z-10 flex flex-col items-center">
                  <span className="text-white font-bold text-lg transition-colors duration-300 group-hover:text-black">{label}</span>
                  <span className="text-sm transition-colors duration-300 text-[var(--muted)] group-hover:text-black/75">{handle}</span>
                </span>
                <ArrowUpRight size={18} className="social-tile-arrow" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
    </>
  );
}
