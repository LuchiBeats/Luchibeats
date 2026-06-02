import { Globe, ExternalLink, Music } from "lucide-react";
import { artists } from "@/lib/data";

export default function ArtistsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <p className="text-xs tracking-[0.3em] mb-2" style={{ color: "var(--gold)" }}>SHINING A LIGHT</p>
        <h1 className="text-4xl font-black text-white mb-4">Artist Spotlights</h1>
        <p className="max-w-xl mx-auto" style={{ color: "var(--muted)" }}>
          These are the artists we believe in — talented creators who are putting in the work and making real music. Follow them, support them.
        </p>
      </div>

      <div className="space-y-12">
        {artists.map((artist, i) => (
          <div key={artist.id} className={`card-surface rounded-lg overflow-hidden flex flex-col ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
            {/* Artist photo */}
            <div className="md:w-72 aspect-square flex-shrink-0 flex items-center justify-center text-6xl font-black overflow-hidden"
              style={{ background: `linear-gradient(135deg, rgba(201,168,76,0.1), rgba(201,168,76,0.03))`, color: "var(--gold)" }}>
              {artist.imageUrl
                ? <img src={artist.imageUrl} alt={artist.name} className="w-full h-full object-cover object-top" />
                : artist.name[0]
              }
            </div>
            <div className="p-8 flex flex-col justify-center flex-1">
              <p className="text-xs tracking-[0.3em] mb-2" style={{ color: "var(--gold)" }}>{artist.genre.toUpperCase()}</p>
              <h2 className="text-3xl font-black text-white mb-4">{artist.name}</h2>
              <p className="leading-relaxed mb-6" style={{ color: "var(--muted)" }}>{artist.bio}</p>
              <div className="flex gap-4">
                {artist.instagramUrl && (
                  <a href={artist.instagramUrl} className="flex items-center gap-2 text-sm transition-colors hover:text-white" style={{ color: "var(--muted)" }}>
                    <Globe size={18} /> Instagram
                  </a>
                )}
                {artist.youtubeUrl && (
                  <a href={artist.youtubeUrl} className="flex items-center gap-2 text-sm transition-colors hover:text-white" style={{ color: "var(--muted)" }}>
                    <ExternalLink size={18} /> YouTube
                  </a>
                )}
                {artist.spotifyUrl && (
                  <a href={artist.spotifyUrl} className="flex items-center gap-2 text-sm transition-colors hover:text-white" style={{ color: "var(--muted)" }}>
                    <Music size={18} /> Spotify
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA for artists */}
      <div className="mt-20 text-center card-surface rounded-lg p-12">
        <p className="text-xs tracking-[0.3em] mb-2" style={{ color: "var(--gold)" }}>WANT TO BE FEATURED?</p>
        <h2 className="text-3xl font-black text-white mb-4">Apply for a Spotlight</h2>
        <p className="mb-8 max-w-md mx-auto" style={{ color: "var(--muted)" }}>
          Are you an independent artist making genuine music? Reach out — we spotlight artists we connect with.
        </p>
        <a href="/contact" className="btn-gold px-8 py-3 rounded text-sm tracking-wide inline-block">
          Get in Touch
        </a>
      </div>
    </div>
  );
}
