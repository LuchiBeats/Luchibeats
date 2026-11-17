import ScrollReveal from "./ScrollReveal";
import { getTestimonials, type Testimonial } from "@/lib/beats-store";

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: "default-1",
    quote: "Luchi is one of the best engineers I have ever worked with. He has recorded my music for years, and I can say without a doubt he is among the best in the game. His production is very diverse and efficient — when it comes to production all around, Luchi is the one. Easy to work with, a master of sound, and the producer/engineer you need in your corner.",
    name: "Calm King Causey",
    title: "Artist",
    image: "/artists/calm-king-causey.jpg",
    objectPosition: "top",
  },
  {
    id: "default-2",
    quote: "Luchi is a one-stop shop for everything music related. He produces, can lay down vocals, and much more. I've had the pleasure of working with him on many projects over the years. When it's time to work, he's ready for the moment — I can honestly say I have never been disappointed on anything we've created.",
    name: "Mach City",
    title: "Artist",
    image: "/artists/mach-city.jpg",
    objectPosition: "center",
  },
];

export default async function Testimonials() {
  let testimonials = DEFAULT_TESTIMONIALS;
  try {
    const stored = await getTestimonials();
    if (stored.length > 0) testimonials = stored;
  } catch {
    // fallback to defaults
  }

  return (
    <section className="relative max-w-7xl mx-auto px-4 py-12 md:py-24 overflow-hidden">
      <div className="absolute w-96 h-96 rounded-full pointer-events-none" style={{ background: "rgba(201,168,76,0.05)", filter: "blur(80px)", top: "0", left: "50%", transform: "translateX(-50%)" }} />
      <ScrollReveal className="text-center mb-10 md:mb-16">
        <p className="eyebrow mb-3">What Artists Say</p>
        <h2 className="section-title">Trusted by Artists</h2>
      </ScrollReveal>
      {/* Open layout, no cards: the artist's photo melts into the page and the quote sits under it */}
      <div className={`grid grid-cols-1 gap-14 md:gap-12 mx-auto ${testimonials.length === 2 ? "md:grid-cols-2 max-w-5xl" : "md:grid-cols-3"}`}>
        {testimonials.map((t, i) => (
          <ScrollReveal key={t.id} delay={i * 0.12} className="flex flex-col items-center text-center">
            {t.image && (
              <div className="photo-tile relative w-56 h-56 md:w-64 md:h-64 -mb-10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-full h-full object-cover"
                  style={{ objectPosition: t.objectPosition ?? "top", filter: "saturate(0.9) brightness(0.9)" }}
                />
              </div>
            )}
            <span aria-hidden="true" className="relative z-10 text-7xl font-black leading-none h-10 select-none gold-gradient">&ldquo;</span>
            <blockquote className="relative z-10 md:text-lg leading-relaxed max-w-md mb-6" style={{ color: "rgba(255,255,255,0.85)" }}>
              {t.quote}
            </blockquote>
            <p className="text-sm font-bold tracking-[0.2em] uppercase" style={{ color: "var(--gold)" }}>{t.name}</p>
            {t.title && <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{t.title}</p>}
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
