import ScrollReveal from "./ScrollReveal";

const collaborators = [
  { name: "Dave East"      },
  { name: "Fabolous"       },
  { name: "Joe Budden"     },
  { name: "A Boogie"       },
  { name: "Fetty Wap"      },
  { name: "Tempo"          },
  { name: "Mysonne"        },
  { name: "Mariah Lynn"    },
  { name: "Arlene Mc"      },
  { name: "Harrd Luck"     },
  { name: "Oskama Esteban" },
  { name: "Albeal"         },
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
                className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden flex-shrink-0 fire-glow flex items-center justify-center text-xl font-black"
                style={{ border: "1.5px solid rgba(201,168,76,0.35)", background: "rgba(201,168,76,0.1)", color: "var(--fire)" }}
              >
                {artist.name[0]}
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
