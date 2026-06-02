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
              <div className="flex flex-wrap gap-3">
                {artist.instagramUrl && (
                  <a href={artist.instagramUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-all hover:scale-105"
                    style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.4)", color: "#C9A84C" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                    Instagram
                  </a>
                )}
                {artist.youtubeUrl && (
                  <a href={artist.youtubeUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-all hover:scale-105"
                    style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.4)", color: "#C9A84C" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>
                    YouTube
                  </a>
                )}
                {artist.spotifyUrl && (
                  <a href={artist.spotifyUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-all hover:scale-105"
                    style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.4)", color: "#C9A84C" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                    Spotify
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
