import Image from "next/image";

// Portraits scattered down both sides of the page, behind the content. Each one fades in,
// drifts a little and fades out again on its own staggered cycle, so a few are showing at
// any moment. Purely decorative: not clickable, hidden from screen readers.
// top = % down the page, side = which edge, x = % in from that edge, pos = where the face is.
const DRIFT = [
  { src: "/luchi/shoot/red-low-angle.webp", top: 2, side: "left", x: 3, pos: "55% 45%", delay: 0 },
  { src: "/luchi/shoot/bw-hand-face.webp", top: 7, side: "right", x: 4, pos: "50% 45%", delay: 5 },
  { src: "/luchi/shoot/red-half.webp", top: 17, side: "left", x: 6, pos: "75% 45%", delay: 9 },
  { src: "/luchi/shoot/bw-binoculars.webp", top: 25, side: "right", x: 2, pos: "50% 50%", delay: 2 },
  { src: "/luchi/shoot/red-profile.webp", top: 35, side: "left", x: 1, pos: "40% 50%", delay: 12 },
  { src: "/luchi/shoot/bw-half.webp", top: 44, side: "right", x: 6, pos: "80% 50%", delay: 7 },
  { src: "/luchi/shoot/red-eyes.webp", top: 54, side: "left", x: 5, pos: "50% 60%", delay: 3 },
  { src: "/luchi/shoot/bw-hand-mouth.webp", top: 63, side: "right", x: 3, pos: "55% 45%", delay: 10 },
  { src: "/luchi/shoot/red-stare.webp", top: 73, side: "left", x: 2, pos: "50% 50%", delay: 6 },
  { src: "/luchi/shoot/crimson-half.webp", top: 82, side: "right", x: 5, pos: "80% 45%", delay: 1 },
] as const;

export default function PortraitDrift() {
  return (
    <div className="portrait-drift" aria-hidden="true">
      {DRIFT.map((p) => (
        <div key={p.src} className={`drift-photo ${p.src.includes("/bw-") ? "is-bw" : ""}`}
          style={{ top: `${p.top}%`, [p.side]: `${p.x}%`, animationDelay: `-${p.delay * 1.6}s` }}>
          <Image src={p.src} alt="" fill sizes="(max-width: 768px) 55vw, 340px" className="object-cover" style={{ objectPosition: p.pos }} />
        </div>
      ))}
    </div>
  );
}
