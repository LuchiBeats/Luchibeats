import Link from "next/link";

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2" />
    </svg>
  );
}

function KickIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 20, height: 20 }}>
      <path d="M5 4h3.5v6.5L14 4h4.5L12 11.5 18.5 20H14l-5.5-6.5V20H5V4z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="border-t mt-24 py-12" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <p className="text-xl font-black tracking-widest gold-gradient mb-2">LUCHIBEATS</p>
            <p className="text-sm" style={{ color: "var(--muted)" }}>Premium beats<br />and artist development.</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-white mb-3 tracking-wide">NAVIGATE</p>
            <div className="flex flex-col gap-2">
              {[["Beats", "/beats"], ["About", "/about"], ["Contact", "/contact"]].map(([label, href]) => (
                <Link key={href} href={href} className="text-sm hover:text-white transition-colors" style={{ color: "var(--muted)" }}>{label}</Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-white mb-3 tracking-wide">CONNECT</p>
            <div className="flex gap-5 items-center">
              <a href="https://www.instagram.com/luchi_beats" target="_blank" rel="noopener noreferrer"
                className="transition-colors hover:text-yellow-400" style={{ color: "var(--muted)" }}
                aria-label="Instagram @luchi_beats">
                <InstagramIcon />
              </a>
              <a href="https://www.youtube.com/@LuchiBeats?sub_confirmation=1" target="_blank" rel="noopener noreferrer"
                className="transition-colors hover:text-yellow-400" style={{ color: "var(--muted)" }}
                aria-label="YouTube @LuchiBeats">
                <YouTubeIcon />
              </a>
              <a href="https://kick.com/luchibeats" target="_blank" rel="noopener noreferrer"
                className="transition-colors hover:text-yellow-400" style={{ color: "var(--muted)" }}
                aria-label="Kick @luchibeats">
                <KickIcon />
              </a>
            </div>
            <div className="mt-3 flex flex-col gap-1">
              <p className="text-xs" style={{ color: "var(--muted)" }}>Instagram: <span style={{ color: "rgba(255,255,255,0.5)" }}>@luchi_beats</span></p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>YouTube: <span style={{ color: "rgba(255,255,255,0.5)" }}>@LuchiBeats</span></p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>Kick: <span style={{ color: "rgba(255,255,255,0.5)" }}>@luchibeats</span></p>
            </div>
          </div>
        </div>
        <div className="border-t pt-6 flex flex-col md:flex-row justify-between items-center gap-2" style={{ borderColor: "var(--border)" }}>
          <p className="text-xs" style={{ color: "var(--muted)" }}>© {new Date().getFullYear()} LuchiBeats. All rights reserved.</p>
          <p className="text-xs" style={{ color: "var(--muted)" }}>luchibeats.com</p>
        </div>
      </div>
    </footer>
  );
}
