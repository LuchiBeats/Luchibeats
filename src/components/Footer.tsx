import Link from "next/link";
import { Globe, Tv2, Share2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t mt-24 py-12" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <p className="text-xl font-black tracking-widest gold-gradient mb-2">LUCHIBEATS</p>
            <p className="text-sm" style={{ color: "var(--muted)" }}>Premium beats, mixing services,<br />and artist development.</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-white mb-3 tracking-wide">NAVIGATE</p>
            <div className="flex flex-col gap-2">
              {[["Beats", "/beats"], ["Mixing", "/mixing"], ["Artist Spotlights", "/artists"], ["About", "/about"], ["Contact", "/contact"]].map(([label, href]) => (
                <Link key={href} href={href} className="text-sm hover:text-white transition-colors" style={{ color: "var(--muted)" }}>{label}</Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-white mb-3 tracking-wide">CONNECT</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-yellow-400 transition-colors" style={{ color: "var(--muted)" }}><Globe size={20} /></a>
              <a href="#" className="hover:text-yellow-400 transition-colors" style={{ color: "var(--muted)" }}><Tv2 size={20} /></a>
              <a href="#" className="hover:text-yellow-400 transition-colors" style={{ color: "var(--muted)" }}><Share2 size={20} /></a>
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
