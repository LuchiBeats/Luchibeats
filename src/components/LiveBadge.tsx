"use client";
import { useEffect, useState } from "react";

// Shared live state: one check per page, re-checked every 2 minutes.
let cached: boolean | null = null;
const subs = new Set<(v: boolean) => void>();
let timer = 0;
async function check() {
  try {
    const r = await fetch("/api/live-status", { cache: "no-store" });
    const j = (await r.json()) as { live?: boolean };
    cached = !!j.live;
  } catch { cached = false; }
  subs.forEach((f) => f(cached!));
}

export function useLiveNow() {
  const [live, setLive] = useState(false);
  useEffect(() => {
    subs.add(setLive);
    if (cached !== null) { const t = window.setTimeout(() => setLive(cached!), 0); return () => { window.clearTimeout(t); subs.delete(setLive); }; }
    if (!timer) { void check(); timer = window.setInterval(check, 120_000); }
    return () => { subs.delete(setLive); };
  }, []);
  return live;
}

// Red pulsing "LIVE" pill shown next to the Live link while a stream is on
export default function LiveBadge({ className = "" }: { className?: string }) {
  const live = useLiveNow();
  if (!live) return null;
  return (
    <span className={`live-badge ${className}`} role="status" aria-label="Live now">
      <span className="live-badge-dot" aria-hidden="true" />LIVE
    </span>
  );
}
