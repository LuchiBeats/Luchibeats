"use client";
import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { AUDIO } from "@/lib/audio";

// Optional site soundtrack. Add the files to public/audio/ and switch them on in src/lib/audio.ts:
//   loop.mp3  – a short beat loop (required for the button to show)
//   tag.mp3   – your producer tag, played once before the loop starts (optional)
// Nothing ever plays until the visitor presses the button.
const LOOP = "/audio/loop.mp3";
const TAG = "/audio/tag.mp3";


export default function SoundButton() {
  const ready = AUDIO.loop, hasTag = AUDIO.tag;
  const [on, setOn] = useState(false);
  const loop = useRef<HTMLAudioElement | null>(null);
  const tag = useRef<HTMLAudioElement | null>(null);
  const fade = useRef(0);

  useEffect(() => {
    return () => { loop.current?.pause(); tag.current?.pause(); window.clearInterval(fade.current); };
  }, []);

  const ramp = (a: HTMLAudioElement, to: number, ms: number, done?: () => void) => {
    window.clearInterval(fade.current);
    const from = a.volume, steps = Math.max(1, Math.round(ms / 40)); let i = 0;
    fade.current = window.setInterval(() => {
      i++; a.volume = Math.min(1, Math.max(0, from + (to - from) * (i / steps)));
      if (i >= steps) { window.clearInterval(fade.current); done?.(); }
    }, 40);
  };

  const start = () => {
    if (!loop.current) { loop.current = new Audio(LOOP); loop.current.loop = true; }
    const l = loop.current;
    const playLoop = () => { l.volume = 0; l.play().then(() => ramp(l, 0.55, 1200)).catch(() => setOn(false)); };
    if (hasTag && l.currentTime === 0) {
      if (!tag.current) tag.current = new Audio(TAG);
      tag.current.volume = 0.9;
      tag.current.onended = playLoop;
      tag.current.play().catch(playLoop);
    } else playLoop();
    setOn(true);
  };
  const stop = () => {
    tag.current?.pause();
    const l = loop.current;
    if (l) ramp(l, 0, 500, () => l.pause());
    setOn(false);
  };

  // Pause when the tab is hidden
  useEffect(() => {
    const onVis = () => { if (document.hidden && on) stop(); };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  });

  if (!ready) return null;
  return (
    <button type="button" onClick={on ? stop : start} aria-pressed={on} className={`sound-btn ${on ? "is-on" : ""}`}
      aria-label={on ? "Turn the music off" : "Play the music"}>
      {on ? <Volume2 size={18} /> : <VolumeX size={18} />}
      <span className="sound-bars" aria-hidden="true"><span /><span /><span /><span /></span>
      <span className="sound-label">{on ? "Sound on" : "Sound off"}</span>
    </button>
  );
}
