import { getHomepageContent } from "@/lib/beats-store";

const STATIC_ITEMS = [
  "15+ YEARS OF EXPERIENCE", "150+ ARTISTS WORKED WITH", "100% CLIENT SATISFACTION",
  "PRODUCTION & ENGINEERING", "RECORDING · MIXING · MASTERING",
  "LUCHIBEATS.COM",
];

// Nothing is sold on the site anymore — skip saved ticker lines that advertise kits or the old stores
const RETIRED = /drum\s*kit|merch|beat\s*store|free\s*beat/i;

export default async function Marquee() {
  let items = STATIC_ITEMS;
  try {
    const content = await getHomepageContent();
    const saved = (content.marqueeItems ?? []).filter((t) => !RETIRED.test(t));
    if (saved.length > 0) items = saved;
  } catch {
    // fallback to static
  }
  const displayed = [...items, ...items];

  return (
    <div className="relative overflow-hidden py-2" style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.06) 20%, rgba(201,168,76,0.06) 80%, transparent), var(--bg)" }}>
      {/* Gold hairlines that fade out at both ends instead of hard borders */}
      <div className="absolute inset-x-0 top-0 h-px pointer-events-none" style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.35), transparent)" }} />
      <div className="absolute inset-x-0 bottom-0 h-px pointer-events-none" style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.35), transparent)" }} />
      <div className="marquee-track">
        {displayed.map((item, i) => (
          <span key={i} className="flex items-center gap-6 px-6 text-xs tracking-[0.3em] font-semibold whitespace-nowrap" style={{ color: "var(--fire)" }}>
            {item}
            <span style={{ color: "rgba(201,168,76,0.4)" }}>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
