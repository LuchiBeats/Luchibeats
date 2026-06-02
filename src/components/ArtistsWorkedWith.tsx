import Image from "next/image";
import ScrollReveal from "./ScrollReveal";

const collaborators = [
  { name: "Dave East",       img: "/artists/dave-east.png"  },
  { name: "Fabolous",        img: "/artists/fabolous.jpg"   },
  { name: "Joe Budden",      img: "/artists/joe-budden.jpg" },
  { name: "A Boogie",        img: "/artists/a-boogie.png"   },
  { name: "Fetty Wap",       img: "/artists/fetty-wap.png"  },
  { name: "Tempo",           img: "/artists/tempo.jpg"      },
  { name: "Mysonne",         img: "/artists/mysonne.jpg"    },
  { name: "Mariah Lynn",     img: "/artists/mariah-lynn.jpg"},
  { name: "Arlene Mc",       img: "/artists/arlene-mc.jpg"  },
  { name: "Harrd Luck",      img: null                      },
  { name: "Oskama Esteban",  img: null                      },
  { name: "Albeal",          img: "/artists/albeal.jpg"     },
];

export default function ArtistsWorkedWith() {
  return (
    <section className="relative py-12 md:py-20 overflow-hidden border-y" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(201,168,76,0.05) 0%, transparent 70%)" }} />
      <div className="max-w-5xl mx-auto px-4">
        <ScrollReveal className="text-center mb-10 md:mb-14">
          <p className="text-xs tracking-[0.35em] mb-3 fire-text" style={{ color: "var(--fire)" }}>THE ROSTER</p>
          <h2 className="text-3xl md:text-4xl font-black text-white">Artists I&apos;ve Worked With</h2>
        </ScrollReveal>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-y-8 gap-x-4">
          {collaborators.map((artist, i) => (
            <ScrollReveal key={artist.name} delay={i * 0.04} className="flex flex-col items-center gap-3 group">
              <div
                className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden flex-shrink-0 fire-glow"
                style={{ border: "1.5px solid rgba(201,168,76,0.35)" }}
              >
                {artist.img ? (
                  <Image
                    src={artist.img}
                    alt={artist.name}
                    fill
                    className="object-cover object-top group-hover:scale-110 transition-transform duration-500"
                    sizes="80px"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-xl font-black"
                    style={{ background: "rgba(201,168,76,0.1)", color: "var(--fire)" }}
                  >
                    {artist.name[0]}
                  </div>
                )}
              </div>
              <p className="text-xs text-center font-semibold leading-tight" style={{ color: "var(--muted)" }}>
                {artist.name}
              </p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
