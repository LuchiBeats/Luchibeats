import ScrollReveal from "./ScrollReveal";

const videos = [
  { id: "DMjz34ubhg4", artist: "Mach City" },
  { id: "6a94jphQcaY", artist: "Mach City" },
  { id: "gPyvvEYe3Ng", artist: "Trey Budden x Oskama Esteban" },
];

export default function Productions() {
  return (
    <section className="relative py-12 md:py-24 overflow-hidden">
      <div className="orb orb-1 w-96 h-96 top-0 left-1/2 -translate-x-1/2" style={{ background: "rgba(201,168,76,0.07)" }} />
      <div className="max-w-7xl mx-auto px-4">
        <ScrollReveal className="flex items-end justify-between mb-8 md:mb-12">
          <div>
            <p className="text-xs tracking-[0.3em] mb-2 fire-text" style={{ color: "var(--fire)" }}>STRAIGHT FROM THE STUDIO</p>
            <h2 className="text-3xl md:text-4xl font-black text-white">Productions</h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((v, i) => (
            <ScrollReveal key={v.id} delay={i * 0.12}>
              <div className="rounded-lg overflow-hidden" style={{ border: "1px solid rgba(201,168,76,0.2)" }}>
                <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube-nocookie.com/embed/${v.id}?rel=0&modestbranding=1`}
                    title={`${v.artist} — produced by LuchiBeats`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="px-4 py-3" style={{ background: "var(--surface)" }}>
                  <p className="text-xs tracking-widest uppercase" style={{ color: "var(--fire)" }}>Artist</p>
                  <p className="text-sm font-bold text-white mt-0.5">{v.artist}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
