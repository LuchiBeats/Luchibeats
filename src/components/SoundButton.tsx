"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Volume2, VolumeX } from "lucide-react";
import { MEDIA_EVENT, type MediaSoundDetail } from "@/lib/mediaSound";

// Site soundtrack: "Maestro" (Prod. Luchi Beats) plays across every page and keeps going
// while you move between them (this lives in the root layout, so it isn't remounted).
// - One mute button; muting anywhere mutes everywhere, in every open tab, and is remembered.
// - Browsers don't allow sound before the visitor interacts with the page, so if starting
//   is blocked it begins on their first click/tap/key press, and the button says "Tap to play".
// - Steps aside (fades out) while a video or the Live TV is making sound, then comes back.
// - Silent on the admin panel and the app preview.
const SRC = "/audio/maestro.mp3";
const MUTE_KEY = "lb-music-muted";   // localStorage: "1" when muted
const POS_KEY = "lb-music-pos";      // sessionStorage: where the beat was, so a reload carries on
const VOLUME = 0.45;

type Mode = "on" | "off" | "blocked";

const readMuted = () => { try { return localStorage.getItem(MUTE_KEY) === "1"; } catch { return false; } };

export default function SoundButton() {
  const pathname = usePathname() || "/";
  const quietPage = pathname.startsWith("/admin") || pathname.startsWith("/app-preview");
  const [mode, setMode] = useState<Mode>("off");
  const [ready, setReady] = useState(false);

  const audio = useRef<HTMLAudioElement | null>(null);
  const muted = useRef(true);
  const quiet = useRef(quietPage);
  const others = useRef(new Set<string>());   // players currently making sound
  const fade = useRef(0);
  const waitingForGesture = useRef(false);

  const el = () => {
    if (!audio.current) {
      const a = new Audio(SRC);
      a.loop = true;
      a.preload = "auto";
      a.volume = 0;
      try { const t = Number(sessionStorage.getItem(POS_KEY)); if (t > 0) a.currentTime = t; } catch {}
      audio.current = a;
    }
    return audio.current;
  };

  const ramp = (a: HTMLAudioElement, to: number, ms: number, done?: () => void) => {
    window.clearInterval(fade.current);
    const from = a.volume, steps = Math.max(1, Math.round(ms / 40)); let i = 0;
    fade.current = window.setInterval(() => {
      i++;
      a.volume = Math.min(1, Math.max(0, from + (to - from) * (i / steps)));
      if (i >= steps) { window.clearInterval(fade.current); done?.(); }
    }, 40);
  };

  // Play or pause to match the current situation
  const sync = useCallback(() => {
    const shouldPlay = !muted.current && !quiet.current && others.current.size === 0 && !document.hidden;
    const a = el();
    if (shouldPlay) {
      if (!a.paused && a.volume > 0) { setMode("on"); return; }
      a.play().then(() => { waitingForGesture.current = false; setMode("on"); ramp(a, VOLUME, 1500); })
        .catch(() => { waitingForGesture.current = true; setMode("blocked"); });
    } else {
      if (!a.paused) ramp(a, 0, 600, () => a.pause());
      setMode(muted.current ? "off" : quiet.current ? "off" : "on");
    }
  }, []);

  // Start-up: read the saved mute choice and try to start
  useEffect(() => {
    muted.current = readMuted();
    const id = window.setTimeout(() => { setReady(true); sync(); }, 0);
    return () => window.clearTimeout(id);
  }, [sync]);

  // Admin / app preview: go quiet
  useEffect(() => { quiet.current = quietPage; if (ready) sync(); }, [quietPage, ready, sync]);

  // Blocked by the browser: start on the visitor's first click, tap or key press.
  // Browsers only allow sound from certain events: a mouse press counts as it goes down, but a
  // finger on a phone only counts when it lifts (touchend / click), so listen for all of them.
  useEffect(() => {
    const onGesture = (e: Event) => {
      if (!waitingForGesture.current) return;
      if ((e.target as Element | null)?.closest?.(".sound-btn")) return; // the button handles itself
      sync();
    };
    const opts = { capture: true, passive: true } as const;
    const events = ["pointerdown", "pointerup", "touchend", "click", "keydown"];
    events.forEach((t) => document.addEventListener(t, onGesture, opts));
    return () => events.forEach((t) => document.removeEventListener(t, onGesture, opts));
  }, [sync]);

  // Other players making sound, tab hidden, mute changed in another tab, remember position
  useEffect(() => {
    const onMedia = (e: Event) => {
      const { source, on } = (e as CustomEvent<MediaSoundDetail>).detail;
      if (on) others.current.add(source); else others.current.delete(source);
      sync();
    };
    const onVis = () => sync();
    const onStorage = (e: StorageEvent) => { if (e.key === MUTE_KEY) { muted.current = e.newValue === "1"; sync(); } };
    const savePos = () => { try { if (audio.current) sessionStorage.setItem(POS_KEY, String(audio.current.currentTime)); } catch {} };
    window.addEventListener(MEDIA_EVENT, onMedia);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("storage", onStorage);
    window.addEventListener("pagehide", savePos);
    return () => {
      window.removeEventListener(MEDIA_EVENT, onMedia);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("pagehide", savePos);
      window.clearInterval(fade.current);
    };
  }, [sync]);

  const onClick = () => {
    // "Tap to play": this click is the go-ahead the browser was waiting for
    if (mode === "blocked") { sync(); return; }
    muted.current = !muted.current;
    try { localStorage.setItem(MUTE_KEY, muted.current ? "1" : "0"); } catch {}
    sync();
  };

  if (!ready || quietPage) return null;
  const on = mode === "on";
  const label = mode === "blocked" ? "Tap to play" : on ? "Sound on" : "Sound off";
  return (
    <button type="button" onClick={onClick} aria-pressed={on} className={`sound-btn ${on ? "is-on" : ""} ${mode === "blocked" ? "is-waiting" : ""}`}
      aria-label={mode === "blocked" ? "Play the music: Maestro, prod. Luchi Beats" : on ? "Mute the music" : "Turn the music on"}
      title="Maestro (Prod. Luchi Beats)">
      {on ? <Volume2 size={18} /> : <VolumeX size={18} />}
      <span className="sound-bars" aria-hidden="true"><span /><span /><span /><span /></span>
      <span className="sound-label">{label}</span>
    </button>
  );
}
