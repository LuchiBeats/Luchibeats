import ScrollReveal from "./ScrollReveal";

const testimonials = [
  {
    quote: "Luchi's beats are on another level. The moment I heard 'Midnight Trap' I knew I had to record over it. The mix he delivered was flawless — radio ready straight out the box.",
    name: "Nova",
    title: "R&B Artist",
    initial: "N",
  },
  {
    quote: "Working with LuchiBeats changed the direction of my whole project. He understood the vibe immediately. The production quality is elite and the turnaround was faster than I expected.",
    name: "K-Real",
    title: "Hip-Hop Artist",
    initial: "K",
  },
  {
    quote: "I've worked with a lot of producers but Luchi stands out. The beats have this cinematic quality that makes every song feel like an event. My streams doubled after that release.",
    name: "Zara M.",
    title: "Afrobeats / Pop Artist",
    initial: "Z",
  },
];

export default function Testimonials() {
  return (
    <section className="relative max-w-7xl mx-auto px-4 py-24 overflow-hidden">
      <div className="absolute w-96 h-96 rounded-full pointer-events-none" style={{ background: "rgba(201,168,76,0.05)", filter: "blur(80px)", top: "0", left: "50%", transform: "translateX(-50%)" }} />
      <ScrollReveal className="text-center mb-14">
        <p className="text-xs tracking-[0.35em] mb-3" style={{ color: "var(--fire)" }}>WHAT ARTISTS SAY</p>
        <h2 className="text-4xl font-black text-white">Trusted by Artists</h2>
      </ScrollReveal>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <ScrollReveal key={t.name} delay={i * 0.12}>
            <div className="relative rounded-xl p-7 h-full flex flex-col justify-between group hover:border-yellow-600/40 transition-all duration-300"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              {/* Quote mark */}
              <span className="absolute top-5 right-6 text-5xl font-black leading-none select-none" style={{ color: "rgba(201,168,76,0.12)" }}>"</span>
              <p className="text-sm leading-relaxed mb-6 relative z-10" style={{ color: "var(--muted)" }}>"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
                  style={{ background: "rgba(201,168,76,0.12)", color: "var(--fire)", border: "1px solid rgba(201,168,76,0.25)" }}>
                  {t.initial}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{t.name}</p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>{t.title}</p>
                </div>
                {/* Gold stars */}
                <div className="ml-auto flex gap-0.5">
                  {[...Array(5)].map((_, j) => (
                    <span key={j} className="text-xs" style={{ color: "var(--fire)" }}>★</span>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
