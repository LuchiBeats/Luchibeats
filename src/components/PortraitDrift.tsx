import Image from "next/image";

// The portrait shoot as a quiet background for the About page. Two fixed spots, one in each
// side margin, stay put while you scroll; all 10 photos take turns in them (5 per side),
// cross-fading one into the next, colour and black-and-white alternating so the sides balance.
// Phones have no side margins, so a single faint centered spot cycles through all 10.
// Decorative only: not clickable, hidden from screen readers.
const S = (n: string, pos = "50% 40%") => ({ src: `/luchi/shoot/${n}.webp`, pos, bw: n.startsWith("bw-") });

const LEFT = [S("red-low-angle", "55% 45%"), S("bw-hand-face", "45% 45%"), S("red-profile", "35% 45%"), S("bw-half", "80% 45%"), S("red-half", "75% 45%")];
const RIGHT = [S("bw-binoculars", "50% 55%"), S("red-eyes", "50% 70%"), S("bw-hand-mouth", "55% 40%"), S("red-stare", "50% 45%"), S("crimson-half", "80% 45%")];
const ALL = LEFT.flatMap((l, i) => [l, RIGHT[i]]);

type Shot = ReturnType<typeof S>;

function Slot({ shots, className, sizes, step, offset = 0 }: { shots: Shot[]; className: string; sizes: string; step: number; offset?: number }) {
  return (
    <div className={`drift-slot ${className}`}>
      {shots.map((p, i) => (
        <div key={p.src} className={`drift-photo${p.bw ? " is-bw" : ""}`}
          style={{ animationDuration: `${shots.length * step}s`, animationDelay: `${i * step + offset}s` }}>
          <Image src={p.src} alt="" fill sizes={sizes} className="object-cover" style={{ objectPosition: p.pos }} />
        </div>
      ))}
    </div>
  );
}

export default function PortraitDrift() {
  return (
    <div className="portrait-drift" aria-hidden="true">
      <div className="drift-stage">
        <Slot shots={LEFT} className="is-left" sizes="360px" step={6} />
        <Slot shots={RIGHT} className="is-right" sizes="360px" step={6} offset={3} />
        <Slot shots={ALL} className="is-center" sizes="80vw" step={6} />
      </div>
    </div>
  );
}
