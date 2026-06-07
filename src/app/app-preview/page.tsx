"use client";
import { useState } from "react";

type Tab = "home" | "beats" | "artists" | "inbox" | "menu";

const GOLD = "#C9A84C";
const BG   = "#0a0a0a";
const SURF = "#111111";
const MUT  = "#666666";

// ── Icons ─────────────────────────────────────────────────────────────────────
function HomeIcon({ active }: { active: boolean }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? GOLD : MUT}><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>;
}
function BeatsIcon({ active }: { active: boolean }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? GOLD : MUT}><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3z"/></svg>;
}
function ArtistsIcon({ active }: { active: boolean }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? GOLD : MUT}><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>;
}
function InboxIcon({ active }: { active: boolean }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? GOLD : MUT}><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>;
}
function MenuIcon({ active }: { active: boolean }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? GOLD : MUT}><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>;
}

// ── Artist card ────────────────────────────────────────────────────────────────
function ArtistCard({ name, genre, img }: { name: string; genre: string; img: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid #1a1a1a" }}>
      <div style={{ width: 52, height: 52, borderRadius: "50%", overflow: "hidden", border: `2px solid ${GOLD}`, flexShrink: 0, background: "#1a1a1a" }}>
        <img src={img} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</p>
        <p style={{ color: MUT, fontSize: 12, margin: 0 }}>{genre}</p>
      </div>
      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(201,168,76,0.1)", border: `1px solid rgba(201,168,76,0.3)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill={GOLD}><path d="M8 5v14l11-7z"/></svg>
      </div>
    </div>
  );
}

// ── Beat row ──────────────────────────────────────────────────────────────────
function BeatRow({ title, bpm, keyNote, genre, price }: { title: string; bpm: number; keyNote: string; genre: string; price: number }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid #1a1a1a" }}>
      <button onClick={() => setPlaying(!playing)}
        style={{ width: 44, height: 44, borderRadius: "50%", background: playing ? GOLD : "rgba(201,168,76,0.1)", border: `1px solid rgba(201,168,76,0.4)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
        {playing
          ? <svg width="16" height="16" viewBox="0 0 24 24" fill="#000"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          : <svg width="16" height="16" viewBox="0 0 24 24" fill={GOLD}><path d="M8 5v14l11-7z"/></svg>
        }
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</p>
        <p style={{ color: MUT, fontSize: 11, margin: "2px 0 0" }}>{genre} · {bpm} BPM · {keyNote}</p>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <p style={{ color: GOLD, fontWeight: 800, fontSize: 13, margin: 0 }}>${price}</p>
        <p style={{ color: MUT, fontSize: 10, margin: 0 }}>from</p>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AppPreview() {
  const [tab, setTab] = useState<Tab>("home");

  const artists = [
    { name: "Oskama Esteban", genre: "Hip-Hop / Rap", img: "/artists/oskama.jpg" },
    { name: "Harrd Luck",     genre: "Hip-Hop / Rap", img: "/artists/harrd-luck.jpg" },
    { name: "Mach City",      genre: "Hip-Hop / Rap", img: "/artists/mach-city.jpg" },
    { name: "Calm King Causey", genre: "Hip-Hop / R&B", img: "/artists/calm-king-causey.jpg" },
  ];

  const beats = [
    { title: "Dark Tunnel",    bpm: 140, keyNote: "A minor", genre: "Trap",    price: 35 },
    { title: "Golden Hour",    bpm: 92,  keyNote: "F major",  genre: "R&B",     price: 40 },
    { title: "Street Anthem",  bpm: 88,  keyNote: "G minor", genre: "Hip-Hop", price: 30 },
    { title: "Midnight Trap",  bpm: 145, keyNote: "C minor", genre: "Trap",    price: 35 },
    { title: "Neon Nights",    bpm: 130, keyNote: "D minor", genre: "Drill",   price: 45 },
  ];

  return (
    <div style={{ background: BG, minHeight: "100dvh", maxWidth: 430, margin: "0 auto", display: "flex", flexDirection: "column", fontFamily: "system-ui, -apple-system, sans-serif", position: "relative", overflow: "hidden" }}>

      {/* Status bar */}
      <div style={{ background: BG, padding: "12px 20px 6px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>9:41</span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="#fff"><rect x="0" y="4" width="3" height="8" rx="1"/><rect x="4" y="2" width="3" height="10" rx="1"/><rect x="8" y="0" width="3" height="12" rx="1"/><rect x="12" y="0" width="3" height="12" rx="1" opacity="0.3"/></svg>
          <svg width="16" height="12" viewBox="0 0 24 24" fill="#fff"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3a4.237 4.237 0 0 0-6 0zm-4-4 2 2a7.074 7.074 0 0 1 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
          <div style={{ display: "flex", gap: 1, alignItems: "center" }}>
            <div style={{ width: 22, height: 11, border: "1.5px solid #fff", borderRadius: 3, padding: "1px 1.5px", display: "flex", alignItems: "center", gap: 1 }}>
              <div style={{ width: "75%", height: "100%", background: "#4ade80", borderRadius: 1 }}/>
            </div>
          </div>
        </div>
      </div>

      {/* App header */}
      <div style={{ padding: "4px 20px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <img src="/logo.png" alt="LuchiBeats" style={{ height: 32, objectFit: "contain" }} />
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: SURF, border: `1px solid #222`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill={MUT}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 90px" }}>

        {/* ── HOME ── */}
        {tab === "home" && (
          <div>
            {/* Hero banner */}
            <div style={{ borderRadius: 16, overflow: "hidden", marginBottom: 20, position: "relative", height: 180, background: "linear-gradient(135deg, #1a1400, #0a0a0a)" }}>
              <video autoPlay muted loop playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.5 }}>
                <source src="/hero-mobile.mp4" type="video/mp4" />
              </video>
              <div style={{ position: "relative", zIndex: 1, padding: 20, height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                <p style={{ color: GOLD, fontSize: 10, letterSpacing: "0.25em", fontWeight: 700, margin: "0 0 4px" }}>NEW DROPS</p>
                <p style={{ color: "#fff", fontSize: 22, fontWeight: 900, margin: 0, lineHeight: 1.2 }}>Fresh Beats<br/>Just Landed</p>
              </div>
            </div>

            {/* Quick stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
              {[["15+", "Years"], ["150+", "Artists"], ["500+", "Mixes"]].map(([n, l]) => (
                <div key={l} style={{ background: SURF, borderRadius: 12, padding: "12px 8px", textAlign: "center", border: "1px solid #1e1e1e" }}>
                  <p style={{ color: GOLD, fontWeight: 900, fontSize: 18, margin: 0 }}>{n}</p>
                  <p style={{ color: MUT, fontSize: 10, margin: "2px 0 0" }}>{l}</p>
                </div>
              ))}
            </div>

            {/* Featured beats */}
            <p style={{ color: "#fff", fontWeight: 900, fontSize: 16, margin: "0 0 4px" }}>Featured Beats</p>
            <p style={{ color: MUT, fontSize: 12, margin: "0 0 12px" }}>Tap to preview</p>
            {beats.slice(0, 3).map((b) => <BeatRow key={b.title} {...b} keyNote={b.keyNote} />)}

            {/* Artists section */}
            <p style={{ color: "#fff", fontWeight: 900, fontSize: 16, margin: "20px 0 4px" }}>Spotlighted Artists</p>
            <p style={{ color: MUT, fontSize: 12, margin: "0 0 12px" }}>Artists Luchi has worked with</p>
            {artists.slice(0, 2).map((a) => <ArtistCard key={a.name} {...a} />)}
          </div>
        )}

        {/* ── BEATS ── */}
        {tab === "beats" && (
          <div>
            <p style={{ color: GOLD, fontSize: 11, letterSpacing: "0.25em", fontWeight: 700, margin: "0 0 4px" }}>CATALOG</p>
            <p style={{ color: "#fff", fontWeight: 900, fontSize: 22, margin: "0 0 16px" }}>All Beats</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
              {["All", "Trap", "Hip-Hop", "R&B", "Drill"].map((g) => (
                <button key={g} style={{ padding: "6px 16px", borderRadius: 20, background: g === "All" ? GOLD : SURF, color: g === "All" ? "#000" : MUT, border: "none", fontWeight: 700, fontSize: 12, whiteSpace: "nowrap", cursor: "pointer" }}>{g}</button>
              ))}
            </div>
            {beats.map((b) => <BeatRow key={b.title} {...b} keyNote={b.keyNote} />)}
          </div>
        )}

        {/* ── ARTISTS ── */}
        {tab === "artists" && (
          <div>
            <p style={{ color: GOLD, fontSize: 11, letterSpacing: "0.25em", fontWeight: 700, margin: "0 0 4px" }}>SPOTLIGHTS</p>
            <p style={{ color: "#fff", fontWeight: 900, fontSize: 22, margin: "0 0 16px" }}>Artists</p>
            {artists.map((a) => <ArtistCard key={a.name} {...a} />)}
          </div>
        )}

        {/* ── INBOX ── */}
        {tab === "inbox" && (
          <div>
            <p style={{ color: GOLD, fontSize: 11, letterSpacing: "0.25em", fontWeight: 700, margin: "0 0 4px" }}>GET IN TOUCH</p>
            <p style={{ color: "#fff", fontWeight: 900, fontSize: 22, margin: "0 0 20px" }}>Contact</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {["Name", "Email"].map((f) => (
                <div key={f}>
                  <p style={{ color: MUT, fontSize: 11, fontWeight: 700, margin: "0 0 6px", letterSpacing: "0.1em" }}>{f.toUpperCase()}</p>
                  <input placeholder={f} style={{ width: "100%", background: SURF, border: "1px solid #222", borderRadius: 10, padding: "12px 14px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
              <div>
                <p style={{ color: MUT, fontSize: 11, fontWeight: 700, margin: "0 0 6px", letterSpacing: "0.1em" }}>SUBJECT</p>
                <select style={{ width: "100%", background: SURF, border: "1px solid #222", borderRadius: 10, padding: "12px 14px", color: "#fff", fontSize: 14, outline: "none" }}>
                  <option>Custom Beat Inquiry</option>
                  <option>Mixing / Mastering</option>
                  <option>Artist Spotlight</option>
                  <option>Collaboration</option>
                </select>
              </div>
              <div>
                <p style={{ color: MUT, fontSize: 11, fontWeight: 700, margin: "0 0 6px", letterSpacing: "0.1em" }}>MESSAGE</p>
                <textarea rows={5} placeholder="Tell me about your project..." style={{ width: "100%", background: SURF, border: "1px solid #222", borderRadius: 10, padding: "12px 14px", color: "#fff", fontSize: 14, outline: "none", resize: "none", boxSizing: "border-box" }} />
              </div>
              <button style={{ background: `linear-gradient(90deg, #A8892E, ${GOLD}, #E5C76B)`, color: "#000", fontWeight: 900, fontSize: 15, padding: "14px", borderRadius: 12, border: "none", cursor: "pointer" }}>
                Send Message
              </button>
            </div>
          </div>
        )}

        {/* ── MENU ── */}
        {tab === "menu" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24, padding: 16, background: SURF, borderRadius: 16, border: "1px solid #1e1e1e" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: `rgba(201,168,76,0.1)`, border: `2px solid ${GOLD}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: GOLD, fontWeight: 900, fontSize: 22 }}>L</span>
              </div>
              <div>
                <p style={{ color: "#fff", fontWeight: 900, fontSize: 16, margin: 0 }}>LuchiBeats</p>
                <p style={{ color: MUT, fontSize: 12, margin: "2px 0 0" }}>Producer · Engineer · Mixer</p>
              </div>
            </div>
            {[
              { label: "About Luchi", icon: "👤" },
              { label: "Mixing & Mastering", icon: "🎚️" },
              { label: "Drum Kits", icon: "🥁" },
              { label: "Merch", icon: "👕" },
              { label: "Subscribe for Free Beat", icon: "🎁" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid #1a1a1a" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <p style={{ color: "#fff", fontWeight: 600, fontSize: 14, margin: 0 }}>{item.label}</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill={MUT}><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Bottom tab bar */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "rgba(10,10,10,0.96)", backdropFilter: "blur(20px)", borderTop: "1px solid #1e1e1e", display: "flex", justifyContent: "space-around", padding: "8px 0 20px", zIndex: 100 }}>
        {([
          { id: "home",    label: "Home",    Icon: HomeIcon },
          { id: "beats",   label: "Beats",   Icon: BeatsIcon },
          { id: "artists", label: "Artists", Icon: ArtistsIcon },
          { id: "inbox",   label: "Contact", Icon: InboxIcon },
          { id: "menu",    label: "More",    Icon: MenuIcon },
        ] as { id: Tab; label: string; Icon: React.ComponentType<{ active: boolean }> }[]).map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", padding: "4px 12px" }}>
            <Icon active={tab === id} />
            <span style={{ fontSize: 10, fontWeight: tab === id ? 700 : 400, color: tab === id ? GOLD : MUT }}>{label}</span>
          </button>
        ))}
      </div>

    </div>
  );
}
