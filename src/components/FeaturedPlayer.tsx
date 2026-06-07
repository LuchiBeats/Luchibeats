import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function FeaturedPlayer() {
  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col items-center justify-center py-20 px-6 text-center"
      style={{
        background: "var(--surface)",
        border: "1px solid rgba(201,168,76,0.2)",
        boxShadow: "0 4px 60px rgba(0,0,0,0.5)",
      }}
    >
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{ background: "rgba(201,168,76,0.08)", border: "2px solid rgba(201,168,76,0.3)" }}
      >
        <svg viewBox="0 0 24 24" fill="none" style={{ width: "36px", height: "36px" }}>
          <path d="M9 18V5l12-2v13" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="6" cy="18" r="3" stroke="#C9A84C" strokeWidth="1.5"/>
          <circle cx="18" cy="16" r="3" stroke="#C9A84C" strokeWidth="1.5"/>
        </svg>
      </div>
      <p className="text-xs tracking-[0.35em] font-bold mb-3" style={{ color: "var(--fire)" }}>BEATS STORE</p>
      <h3 className="text-3xl font-black text-white mb-3">Coming Soon</h3>
      <p className="text-sm max-w-sm mb-8" style={{ color: "var(--muted)" }}>
        New beats dropping soon. Stay tuned or reach out to get early access to the catalog.
      </p>
      <Link
        href="/contact"
        className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold transition-all hover:scale-105"
        style={{ background: "linear-gradient(90deg,#A8892E,#C9A84C,#E5C76B)", color: "#000" }}
      >
        Get Early Access <ArrowRight size={14} />
      </Link>
    </div>
  );
}
