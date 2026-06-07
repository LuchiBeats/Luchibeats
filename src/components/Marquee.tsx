import { getHomepageContent } from "@/lib/beats-store";

const STATIC_ITEMS = [
  "15+ YEARS OF EXPERIENCE", "150+ ARTISTS WORKED WITH", "100% CLIENT SATISFACTION",
  "72HR AVG. TURNAROUND", "NEW BEATS AVAILABLE", "PREMIUM MIXING SERVICES",
  "EXCLUSIVE LICENSES", "ARTIST SPOTLIGHTS", "LUCHIBEATS.COM",
];

export default async function Marquee() {
  let items = STATIC_ITEMS;
  try {
    const content = await getHomepageContent();
    if (content.marqueeItems?.length > 0) items = content.marqueeItems;
  } catch {
    // fallback to static
  }
  const displayed = [...items, ...items];

  return (
    <div className="overflow-hidden border-y py-2" style={{ borderColor: "rgba(201,168,76,0.3)", background: "rgba(201,168,76,0.05)" }}>
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
