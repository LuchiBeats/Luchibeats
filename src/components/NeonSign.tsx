import { Neonderthaw, Tilt_Neon } from "next/font/google";

const script = Neonderthaw({ weight: "400", subsets: ["latin"], display: "swap" });
const tube = Tilt_Neon({ subsets: ["latin"], display: "swap" });

// Neon wall sign for the Live page: "Luchi Beats" in gold script tubing, always lit,
// with a red LIVE box that lights up (and flickers) only while a stream is on.
export default function NeonSign({ live }: { live: boolean }) {
  return (
    <div className={`neon-sign ${live ? "is-live" : ""}`}>
      <span className="neon-wire" aria-hidden="true" />
      <div className="neon-plate">
        <span className="neon-screw tl" aria-hidden="true" /><span className="neon-screw tr" aria-hidden="true" />
        <span className="neon-screw bl" aria-hidden="true" /><span className="neon-screw br" aria-hidden="true" />
        <h1 className="neon-title">
          <span className={`neon-script ${script.className}`}>Luchi Beats</span>
          <span className={`neon-live ${tube.className}`}>
            <span className="neon-dot" aria-hidden="true" />
            {live ? "On Air" : "Live"}
            <span className="sr-only">{live ? " — streaming now" : " — off air right now"}</span>
          </span>
        </h1>
      </div>
    </div>
  );
}
