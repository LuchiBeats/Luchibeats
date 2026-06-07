import ScrollReveal from "./ScrollReveal";

const testimonials: { quote: string; name: string; title: string; initial: string; image?: string; objectPosition?: string }[] = [
  {
    quote: "Luchi is one of the best engineers I have ever worked with. He has recorded my music for years, and I can say without a doubt he is among the best in the game. His production is very diverse and efficient — when it comes to production all around, Luchi is the one. Easy to work with, a master of sound, and the producer/engineer you need in your corner.",
    name: "Calm King Causey",
    title: "Artist",
    initial: "C",
    image: "/artists/calm-king-causey.jpg",
    objectPosition: "top",
  },
  {
    quote: "Luchi is a one-stop shop for everything music related. He produces, can lay down vocals, and much more. I've had the pleasure of working with him on many projects over the years. When it's time to work, he's ready for the moment — I can honestly say I have never been disappointed on anything we've created.",
    name: "Mach City",
    title: "Artist",
    initial: "M",
    image: "/artists/mach-city.jpg",
    objectPosition: "center",
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
            <div className="relative rounded-xl overflow-hidden h-full flex flex-col group hover:border-yellow-600/40 transition-all duration-300"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              {/* Large photo */}
              {t.image && (
                <div className="w-full overflow-hidden" style={{ height: "280px" }}>
                  <img
                    src={t.image}
                    alt={t.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: t.objectPosition ?? "top" }}
                  />
                </div>
              )}
              {/* Card body */}
              <div className="relative p-6 flex flex-col flex-1 justify-between">
                <span className="absolute top-3 right-5 text-5xl font-black leading-none select-none" style={{ color: "rgba(201,168,76,0.12)" }}>"</span>
                <p className="text-sm leading-relaxed mb-5 relative z-10" style={{ color: "var(--muted)" }}>"{t.quote}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">{t.name}</p>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>{t.title}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, j) => (
                      <span key={j} className="text-xs" style={{ color: "var(--fire)" }}>★</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
