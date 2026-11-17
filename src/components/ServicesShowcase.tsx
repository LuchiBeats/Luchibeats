"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const SERVICES = [
  {
    title: "Beat Production",
    text: "Trap, R&B, Hip-Hop, Afrobeats and more. Custom production built around your sound, from the first idea to the final mix.",
    photo: "/luchi/session-laptop.webp",
    pos: "center 30%",
  },
  {
    title: "Vocal Recording",
    text: "Clean takes and a session that keeps the energy up — the room artists like Mach City and Calm King Causey come back to.",
    photo: "/luchi/studio-window.webp",
    pos: "center 40%",
  },
  {
    title: "Mixing",
    text: "Balance, punch and space. Mixes that hit hard and still sound like you.",
    photo: "/luchi/session-cigar.webp",
    pos: "25% 35%",
  },
  {
    title: "Mastering",
    text: "Loud, clear and radio-ready — finished for streaming, radio and the club.",
    photo: "/luchi/portrait-studio.webp",
    pos: "70% 20%",
  },
];

// Big interactive list: hovering (or tapping) a service swaps the studio photo behind it.
// It cycles on its own until the visitor takes over.
export default function ServicesShowcase() {
  const [active, setActive] = useState(0);
  const [userControlled, setUserControlled] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (userControlled || !inView) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % SERVICES.length), 3800);
    return () => window.clearInterval(id);
  }, [userControlled, inView]);

  const pick = (i: number) => { setActive(i); setUserControlled(true); };

  return (
    <section ref={ref} className="relative py-14 md:py-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 relative">
        {/* Photos: stacked and cross-faded, melting into the page like the rest of the site */}
        <div className="photo-backdrop from-right absolute -top-4 -left-4 -right-4 h-[340px] md:top-0 md:left-auto md:right-[-1rem] md:w-[58%] md:h-full pointer-events-none" aria-hidden="true">
          {SERVICES.map((s, i) => (
            <Image key={s.photo} src={s.photo} alt="" fill sizes="(max-width: 768px) 100vw, 640px"
              className="object-cover transition-all duration-1000 ease-out"
              style={{ objectPosition: s.pos, opacity: i === active ? 1 : 0, transform: i === active ? "scale(1)" : "scale(1.08)" }} />
          ))}
        </div>

        <div className="relative z-10 pt-[260px] md:pt-0 md:max-w-[62%]">
          <p className="eyebrow mb-3 over-photo">What I Do</p>
          <h2 className="sr-only">Services</h2>
          <ul onMouseLeave={() => setUserControlled(false)}>
            {SERVICES.map((s, i) => {
              const on = i === active;
              return (
                <li key={s.title} className="over-photo">
                  <button type="button"
                    onMouseEnter={() => pick(i)} onFocus={() => pick(i)} onClick={() => pick(i)}
                    aria-expanded={on}
                    className="group w-full text-left py-3 md:py-4 flex items-baseline gap-4 md:gap-6">
                    <span className="text-sm md:text-base font-mono tabular-nums transition-colors duration-300"
                      style={{ color: on ? "var(--gold)" : "rgba(255,255,255,0.25)" }}>0{i + 1}</span>
                    <span className="font-black tracking-tight leading-none transition-all duration-500"
                      style={{
                        fontSize: "clamp(2rem, 5.2vw, 4.25rem)",
                        color: on ? "#fff" : "rgba(255,255,255,0.22)",
                        transform: on ? "translateX(6px)" : "none",
                      }}>
                      {s.title}
                    </span>
                  </button>
                  {/* Description slides open under the active service */}
                  <div className="grid transition-all duration-500 ease-out" style={{ gridTemplateRows: on ? "1fr" : "0fr", opacity: on ? 1 : 0 }}>
                    <div className="overflow-hidden">
                      <p className="pl-10 md:pl-14 pb-4 max-w-lg md:text-lg leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>{s.text}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <Link href="/contact" data-magnetic className="btn-gold mt-8 inline-flex items-center gap-2 px-8 py-3.5 rounded text-sm tracking-wide">
            Start a Project <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
