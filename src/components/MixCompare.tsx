"use client";
import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { AUDIO } from "@/lib/audio";

// "Hear the Difference": the same song before and after Luchi's mix, played in sync.
// The slider crossfades between them. Add both files and set AUDIO.mix in src/lib/audio.ts:
//   public/audio/mix-rough.mp3  and  public/audio/mix-final.mp3
const ROUGH = "/audio/mix-rough.mp3";
const FINAL = "/audio/mix-final.mp3";

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export default function MixCompare() {
  const ready = AUDIO.mix;
  const [playing, setPlaying] = useState(false);
  const [mix, setMix] = useState(1); // 0 = rough, 1 = final
  const [t, setT] = useState(0);
  const [dur, setDur] = useState(0);
  const rough = useRef<HTMLAudioElement>(null);
  const fin = useRef<HTMLAudioElement>(null);

  // Equal-power crossfade between the two versions
  useEffect(() => {
    if (rough.current) rough.current.volume = Math.cos((mix * Math.PI) / 2);
    if (fin.current) fin.current.volume = Math.sin((mix * Math.PI) / 2);
  }, [mix, ready]);

  // Keep the two tracks locked together and drive the time display
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const tick = () => {
      const a = rough.current, b = fin.current;
      if (a && b) {
        if (Math.abs(a.currentTime - b.currentTime) > 0.08) a.currentTime = b.currentTime;
        setT(b.currentTime);
        if (b.ended) setPlaying(false);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const toggle = async () => {
    const a = rough.current, b = fin.current;
    if (!a || !b) return;
    if (playing) { a.pause(); b.pause(); setPlaying(false); return; }
    a.currentTime = b.currentTime;
    try { await Promise.all([a.play(), b.play()]); setPlaying(true); } catch { setPlaying(false); }
  };
  const seek = (s: number) => { if (rough.current && fin.current) { rough.current.currentTime = s; fin.current.currentTime = s; setT(s); } };

  if (!ready) return null;
  const label = mix < 0.2 ? "Rough Mix" : mix > 0.8 ? "Final Mix" : "Blend";
  return (
    <section data-light="gold" className="relative max-w-3xl mx-auto px-4 py-14 md:py-20 text-center">
      <p className="eyebrow mb-3">Mixing &amp; Mastering</p>
      <h2 className="section-title mb-4">Hear the Difference</h2>
      <p className="md:text-lg mb-10 max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.7)" }}>
        Same song, before and after. Press play and slide between the rough mix and the final.
      </p>

      <audio ref={rough} src={ROUGH} preload="metadata" />
      <audio ref={fin} src={FINAL} preload="metadata" onLoadedMetadata={(e) => setDur(e.currentTarget.duration)} />

      <div className="mix-deck">
        <div className="flex items-center gap-4">
          <button type="button" onClick={toggle} className="mix-play" aria-label={playing ? "Pause" : "Play"}>
            {playing ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" className="ml-0.5" />}
          </button>
          <input type="range" min={0} max={dur || 1} step={0.1} value={t} onChange={(e) => seek(Number(e.target.value))}
            aria-label="Song position" className="mix-seek flex-1" />
          <span className="mix-time">{mmss(t)} / {mmss(dur)}</span>
        </div>

        <div className="mix-slider-wrap">
          <span className={`mix-end ${mix < 0.5 ? "is-on" : ""}`}>Rough</span>
          <input type="range" min={0} max={1} step={0.01} value={mix} onChange={(e) => setMix(Number(e.target.value))}
            aria-label="Rough mix to final mix" aria-valuetext={label} className="mix-slider flex-1" style={{ ["--m" as string]: `${mix * 100}%` }} />
          <span className={`mix-end ${mix >= 0.5 ? "is-on" : ""}`}>Final</span>
        </div>
        <p className="mix-label">{label}</p>
        <div className="flex justify-center gap-3 mt-2">
          <button type="button" className="mix-snap" onClick={() => setMix(0)}>Before</button>
          <button type="button" className="mix-snap" onClick={() => setMix(1)}>After</button>
        </div>
      </div>
    </section>
  );
}
