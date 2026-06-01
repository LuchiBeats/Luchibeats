const items = [
  "NEW BEATS AVAILABLE",
  "PREMIUM MIXING SERVICES",
  "EXCLUSIVE LICENSES",
  "ARTIST SPOTLIGHTS",
  "LUCHIBEATS.COM",
  "NEW BEATS AVAILABLE",
  "PREMIUM MIXING SERVICES",
  "EXCLUSIVE LICENSES",
  "ARTIST SPOTLIGHTS",
  "LUCHIBEATS.COM",
];

export default function Marquee() {
  return (
    <div className="overflow-hidden border-y py-2" style={{ borderColor: "rgba(255,85,0,0.3)", background: "rgba(255,85,0,0.05)" }}>
      <div className="marquee-track">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-6 px-6 text-xs tracking-[0.3em] font-semibold whitespace-nowrap" style={{ color: "var(--fire)" }}>
            {item}
            <span style={{ color: "rgba(255,85,0,0.4)" }}>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
