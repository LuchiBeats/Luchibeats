import Image from "next/image";
import ScrollReveal from "./ScrollReveal";
import { collaborators } from "@/lib/collaborators";

// "In the Room With": every artist as a portrait that fades into the page, name underneath.
// Hover brings the photo to full color and lifts it.
export default function ArtistGrid() {
  const artists = collaborators.filter((a) => a.image);
  return (
    <ul className="artist-grid">
      {artists.map((a, i) => (
        <li key={a.name}>
          <ScrollReveal delay={(i % 6) * 0.06} className="artist-card">
            <div className="artist-photo" data-tilt="">
              <Image src={a.image!} alt={a.name} fill sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 380px"
                className="object-cover" style={{ objectPosition: a.pos ?? "center top" }} />
            </div>
            <p className="artist-name">{a.name}</p>
          </ScrollReveal>
        </li>
      ))}
    </ul>
  );
}
