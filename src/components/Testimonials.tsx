import ScrollReveal from "./ScrollReveal";

const testimonials: { quote: string; name: string; title: string; initial: string; image?: string }[] = [
  {
    quote: "Luchi is one of the best engineers I have ever worked with. He has recorded my music for years, and I can say without a doubt he is among the best in the game. His production is very diverse and efficient — when it comes to production all around, Luchi is the one. Easy to work with, a master of sound, and the producer/engineer you need in your corner.",
    name: "Calm King Causey",
    title: "Artist",
    initial: "C",
    image: "/artists/calm-king-causey.jpg",
  },
];

export default function Testimonials() {
  return (
    <section className="relative max-w-7xl mx-auto px-4 py-12 md:py-24 overflow-hidden">
      <div className="absolute w-96 h-96 rounded-full pointer-events-none" style={{ background: "rgba(201,168,76,0.05)", filter: "blur(80px)", top: "0", left: "50%", transform: "translateX(-50%)" }} />
      <ScrollReveal className="text-center mb-8 md:mb-14">
        <p className="text-xs tracking-[0.35em] mb-3" style={{ color: "var(--fire)" }}>WHAT ARTISTS SAY</p>
        <h2 className="text-3xl md:text-4xl font-black text-white">Trusted by Artists</h2>
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
                <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center text-sm font-black"
                  style={{ background: "rgba(201,168,76,0.12)", color: "var(--fire)", border: "1px solid rgba(201,168,76,0.25)" }}>
                  {t.image
                    ? <img src={t.image} alt={t.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                    : t.initial}
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
