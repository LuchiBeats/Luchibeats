"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Square } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

// LB-16: a playable drum machine. Every sound is synthesized with the Web Audio API,
// so there are no sample files to download.

type Voice = (ctx: AudioContext, out: AudioNode, t: number) => void;

const BPM = 92;
const STEP = 60 / BPM / 4; // one 16th note

let noiseBuf: AudioBuffer | null = null;
function noise(ctx: AudioContext) {
  if (!noiseBuf || noiseBuf.sampleRate !== ctx.sampleRate) {
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  return src;
}

function env(ctx: AudioContext, t: number, peak: number, decay: number, attack = 0.002) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  return g;
}

function noiseHit(ctx: AudioContext, out: AudioNode, t: number, type: BiquadFilterType, freq: number, peak: number, decay: number, q = 0.7) {
  const n = noise(ctx);
  const f = ctx.createBiquadFilter();
  f.type = type; f.frequency.value = freq; f.Q.value = q;
  const g = env(ctx, t, peak, decay);
  n.connect(f).connect(g).connect(out);
  n.start(t); n.stop(t + decay + 0.05);
}

function tone(ctx: AudioContext, out: AudioNode, t: number, type: OscillatorType, from: number, to: number, sweep: number, peak: number, decay: number) {
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(from, t);
  o.frequency.exponentialRampToValueAtTime(to, t + sweep);
  const g = env(ctx, t, peak, decay);
  o.connect(g).connect(out);
  o.start(t); o.stop(t + decay + 0.05);
}

const kick: Voice = (ctx, out, t) => {
  tone(ctx, out, t, "sine", 160, 42, 0.11, 1, 0.42);
  noiseHit(ctx, out, t, "highpass", 3000, 0.25, 0.01);
};
const snare: Voice = (ctx, out, t) => {
  noiseHit(ctx, out, t, "highpass", 1400, 0.55, 0.17);
  tone(ctx, out, t, "triangle", 210, 170, 0.06, 0.45, 0.1);
};
const clap: Voice = (ctx, out, t) => {
  [0, 0.011, 0.022].forEach((d) => noiseHit(ctx, out, t + d, "bandpass", 1600, 0.55, 0.025, 1.2));
  noiseHit(ctx, out, t + 0.03, "bandpass", 1500, 0.45, 0.16, 1);
};
const rim: Voice = (ctx, out, t) => {
  tone(ctx, out, t, "triangle", 1750, 1700, 0.01, 0.35, 0.035);
  noiseHit(ctx, out, t, "highpass", 5000, 0.2, 0.02);
};
const hat: Voice = (ctx, out, t) => noiseHit(ctx, out, t, "highpass", 7500, 0.32, 0.045);
const openHat: Voice = (ctx, out, t) => noiseHit(ctx, out, t, "highpass", 7000, 0.28, 0.32);
const shaker: Voice = (ctx, out, t) => noiseHit(ctx, out, t, "bandpass", 6500, 0.3, 0.07, 1.5);
const perc: Voice = (ctx, out, t) => {
  tone(ctx, out, t, "square", 560, 540, 0.05, 0.12, 0.12);
  tone(ctx, out, t, "square", 845, 830, 0.05, 0.08, 0.1);
};

function bass808(freq: number): Voice {
  return (ctx, out, t) => {
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(freq * 2.2, t);
    o.frequency.exponentialRampToValueAtTime(freq, t + 0.06);
    const shaper = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) { const x = (i / 128) - 1; curve[i] = Math.tanh(x * 2.2); }
    shaper.curve = curve;
    const g = env(ctx, t, 0.75, 1.1, 0.004);
    o.connect(shaper).connect(g).connect(out);
    o.start(t); o.stop(t + 1.2);
  };
}

const hz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);
function chord(notes: number[]): Voice {
  return (ctx, out, t) => {
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 2400;
    const g = env(ctx, t, 0.22, 1.8, 0.012);
    lp.connect(g).connect(out);
    notes.forEach((n, i) => {
      [1, 2.003].forEach((mult, j) => {
        const o = ctx.createOscillator();
        o.type = j ? "sine" : "triangle";
        o.frequency.value = hz(n) * mult;
        o.detune.value = (i % 2 ? 4 : -4);
        const og = ctx.createGain();
        og.gain.value = j ? 0.18 : 0.5;
        o.connect(og).connect(lp);
        o.start(t); o.stop(t + 1.9);
      });
    });
  };
}

interface Pad { label: string; key: string; voice: Voice; group: "chord" | "bass" | "top" | "drum" }

// C minor: Cm9 · Abmaj7 · Fm9 · Gm7
const PADS: Pad[] = [
  { label: "Cm9",    key: "1", group: "chord", voice: chord([48, 51, 55, 58, 62]) },
  { label: "Abmaj7", key: "2", group: "chord", voice: chord([44, 48, 51, 55, 60]) },
  { label: "Fm9",    key: "3", group: "chord", voice: chord([41, 44, 48, 51, 55]) },
  { label: "Gm7",    key: "4", group: "chord", voice: chord([43, 46, 50, 53, 58]) },
  { label: "808 C",  key: "Q", group: "bass",  voice: bass808(hz(36)) },
  { label: "808 Ab", key: "W", group: "bass",  voice: bass808(hz(32)) },
  { label: "808 F",  key: "E", group: "bass",  voice: bass808(hz(29)) },
  { label: "808 G",  key: "R", group: "bass",  voice: bass808(hz(31)) },
  { label: "Hat",    key: "A", group: "top",   voice: hat },
  { label: "Open",   key: "S", group: "top",   voice: openHat },
  { label: "Shaker", key: "D", group: "top",   voice: shaker },
  { label: "Perc",   key: "F", group: "top",   voice: perc },
  { label: "Kick",   key: "Z", group: "drum",  voice: kick },
  { label: "Snare",  key: "X", group: "drum",  voice: snare },
  { label: "Clap",   key: "C", group: "drum",  voice: clap },
  { label: "Rim",    key: "V", group: "drum",  voice: rim },
];
const idx = (label: string) => PADS.findIndex((p) => p.label === label);

// The demo groove: 4 bars of 16 steps. Chords and 808 follow Cm9 · Abmaj7 · Fm9 · Gm7.
function grooveHits(bar: number, step: number): number[] {
  const hits: number[] = [];
  const chordPads = ["Cm9", "Abmaj7", "Fm9", "Gm7"];
  const bassPads = ["808 C", "808 Ab", "808 F", "808 G"];
  if (step === 0) hits.push(idx(chordPads[bar]));
  if (step === 0 || step === 10 || (bar % 2 === 1 && step === 7)) { hits.push(idx("Kick")); hits.push(idx(bassPads[bar])); }
  if (step === 4 || step === 12) { hits.push(idx("Snare")); hits.push(idx("Clap")); }
  if (step % 2 === 0) hits.push(idx(step === 14 && bar === 3 ? "Open" : "Hat"));
  if (bar === 3 && (step === 13 || step === 15)) hits.push(idx("Hat"));
  if (step === 3 || step === 11) hits.push(idx("Shaker"));
  if (bar === 1 && step === 15) hits.push(idx("Rim"));
  return hits;
}

const GROUP_TINT: Record<Pad["group"], string> = {
  chord: "rgba(229,199,107,0.16)",
  bass: "rgba(201,168,76,0.12)",
  top: "rgba(255,255,255,0.05)",
  drum: "rgba(255,255,255,0.07)",
};

export default function BeatPad() {
  const ctxRef = useRef<AudioContext | null>(null);
  const outRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const padRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState({ bar: 0, step: -1 });
  const timer = useRef<number | null>(null);
  const nextTime = useRef(0);
  const stepRef = useRef(0);

  const audio = useCallback(() => {
    if (!ctxRef.current) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      const master = ctx.createGain();
      master.gain.value = 0.8;
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14; comp.ratio.value = 4;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      master.connect(comp).connect(analyser).connect(ctx.destination);
      ctxRef.current = ctx; outRef.current = master; analyserRef.current = analyser;
    }
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const flash = useCallback((i: number, delayMs = 0) => {
    const go = () => {
      const el = padRefs.current[i];
      if (!el) return;
      el.classList.remove("pad-hit");
      void el.offsetWidth; // restart the animation
      el.classList.add("pad-hit");
    };
    if (delayMs > 0) window.setTimeout(go, delayMs); else go();
  }, []);

  const hit = useCallback((i: number) => {
    const ctx = audio();
    PADS[i].voice(ctx, outRef.current!, ctx.currentTime + 0.005);
    flash(i);
  }, [audio, flash]);

  // Look-ahead scheduler: queue the groove slightly ahead of time so it stays tight
  const schedule = useCallback(() => {
    const ctx = ctxRef.current!;
    while (nextTime.current < ctx.currentTime + 0.12) {
      const s = stepRef.current;
      const bar = Math.floor(s / 16) % 4, step = s % 16;
      const t = nextTime.current;
      grooveHits(bar, step).forEach((i) => {
        PADS[i].voice(ctx, outRef.current!, t);
        flash(i, (t - ctx.currentTime) * 1000);
      });
      window.setTimeout(() => setPos({ bar, step }), Math.max(0, (t - ctx.currentTime) * 1000));
      nextTime.current += STEP;
      stepRef.current = (s + 1) % 64;
    }
  }, [flash]);

  const stop = useCallback(() => {
    if (timer.current) window.clearInterval(timer.current);
    timer.current = null;
    setPlaying(false);
    setPos({ bar: 0, step: -1 });
  }, []);

  const toggle = useCallback(() => {
    if (timer.current) return stop();
    const ctx = audio();
    stepRef.current = 0;
    nextTime.current = ctx.currentTime + 0.06;
    schedule();
    timer.current = window.setInterval(schedule, 25);
    setPlaying(true);
  }, [audio, schedule, stop]);

  // Keyboard: 1-4 / Q-R / A-F / Z-V play the pads, space starts/stops the groove
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const box = canvasRef.current?.closest("section")?.getBoundingClientRect();
      const onScreen = box && box.bottom > 0 && box.top < window.innerHeight;
      if (!onScreen) return;
      if (e.code === "Space") { e.preventDefault(); toggle(); return; }
      const i = PADS.findIndex((p) => p.key === e.key.toUpperCase());
      if (i >= 0) { e.preventDefault(); hit(i); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hit, toggle]);

  // Stop the groove once the drum machine scrolls out of view, and clean up on leaving the page
  useEffect(() => {
    const section = canvasRef.current?.closest("section");
    if (!section) return;
    const obs = new IntersectionObserver(([e]) => { if (!e.isIntersecting && timer.current) stop(); }, { threshold: 0 });
    obs.observe(section);
    return () => obs.disconnect();
  }, [stop]);
  useEffect(() => () => { if (timer.current) window.clearInterval(timer.current); ctxRef.current?.close(); }, []);

  // Gold spectrum on the little screen
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const c = canvas.getContext("2d")!;
    let raf = 0;
    const data = new Uint8Array(64);
    const draw = () => {
      const w = canvas.width = canvas.clientWidth * devicePixelRatio;
      const h = canvas.height = canvas.clientHeight * devicePixelRatio;
      c.clearRect(0, 0, w, h);
      const a = analyserRef.current;
      if (a) a.getByteFrequencyData(data); else data.fill(0);
      const bars = 40, gap = 2 * devicePixelRatio, bw = (w - gap * (bars - 1)) / bars;
      const grad = c.createLinearGradient(0, h, 0, 0);
      grad.addColorStop(0, "#A8892E"); grad.addColorStop(1, "#F0D878");
      c.fillStyle = grad;
      for (let i = 0; i < bars; i++) {
        const v = data[Math.floor(i * 1.4)] / 255;
        const bh = Math.max(2 * devicePixelRatio, v * h * 0.95);
        c.globalAlpha = 0.35 + v * 0.65;
        c.fillRect(i * (bw + gap), h - bh, bw, bh);
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 55%, rgba(201,168,76,0.09), transparent 70%)" }} />
      <div className="relative max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-16 items-center">
        <ScrollReveal>
          <p className="eyebrow mb-3">Your Turn</p>
          <h2 className="section-title mb-5">Step Up<br />to the Pads</h2>
          <p className="md:text-lg leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.7)" }}>
            Tap the pads to play kicks, snares, 808s and chords. Hit play and jam over the groove.
          </p>
          <p className="text-sm mb-8 hidden md:block" style={{ color: "var(--muted)" }}>
            Keyboard: <Kbd>1</Kbd>–<Kbd>4</Kbd> chords · <Kbd>Q</Kbd>–<Kbd>R</Kbd> 808s · <Kbd>A</Kbd>–<Kbd>F</Kbd> hats · <Kbd>Z</Kbd>–<Kbd>V</Kbd> drums · <Kbd>Space</Kbd> groove
          </p>
          <a href="/contact" data-magnetic className="btn-outline inline-block px-8 py-3 rounded text-sm tracking-wide">Want the real thing? Book a session</a>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="relative rounded-3xl p-4 sm:p-6 select-none"
            style={{ background: "linear-gradient(160deg, #1b1913, #0d0d0c 60%)", boxShadow: "0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,168,76,0.12), inset 0 1px 0 rgba(255,255,255,0.05)" }}>
            {/* Screen */}
            <div className="flex items-stretch gap-3 mb-4 sm:mb-5">
              <div className="flex-1 rounded-xl px-3 py-2 sm:px-4 sm:py-3 relative overflow-hidden" style={{ background: "#070707", boxShadow: "inset 0 2px 10px rgba(0,0,0,0.9)" }}>
                <div className="flex justify-between text-[10px] sm:text-xs font-mono tracking-widest" style={{ color: "var(--fire-light)" }}>
                  <span>LB-16</span>
                  <span>{BPM} BPM · {playing ? `BAR ${pos.bar + 1}` : "READY"}</span>
                </div>
                <canvas ref={canvasRef} className="w-full h-10 sm:h-14 mt-1 block" aria-hidden="true" />
                <div className="flex gap-[3px] mt-1.5">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <span key={i} className="h-1 flex-1 rounded-full transition-colors duration-75"
                      style={{ background: playing && pos.step === i ? "#F0D878" : i % 4 === 0 ? "rgba(201,168,76,0.35)" : "rgba(255,255,255,0.08)" }} />
                  ))}
                </div>
              </div>
              <button type="button" onClick={toggle} aria-label={playing ? "Stop groove" : "Play groove"}
                className="w-16 sm:w-20 rounded-xl flex flex-col items-center justify-center gap-1 text-[10px] font-bold tracking-widest transition-transform active:scale-95"
                style={playing
                  ? { background: "linear-gradient(135deg,#A8892E,#E5C76B)", color: "#000", boxShadow: "0 0 24px rgba(201,168,76,0.45)" }
                  : { background: "#151515", color: "var(--fire-light)", boxShadow: "inset 0 0 0 1px rgba(201,168,76,0.35)" }}>
                {playing ? <Square size={18} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                {playing ? "STOP" : "PLAY"}
              </button>
            </div>

            {/* Pads */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {PADS.map((p, i) => (
                <button key={p.label} type="button"
                  ref={(el) => { padRefs.current[i] = el; }}
                  onPointerDown={(e) => { e.preventDefault(); hit(i); }}
                  onKeyDown={(e) => { if (e.key === "Enter") hit(i); }}
                  aria-label={`${p.label} pad`}
                  className="pad relative aspect-square rounded-xl sm:rounded-2xl flex flex-col items-start justify-end p-2 sm:p-3 text-left touch-manipulation"
                  style={{ ["--tint" as string]: GROUP_TINT[p.group] }}>
                  <span className="absolute top-1.5 right-2 sm:top-2 sm:right-2.5 text-[9px] sm:text-[10px] font-mono hidden md:block" style={{ color: "rgba(255,255,255,0.3)" }}>{p.key}</span>
                  <span className="text-[11px] sm:text-sm font-bold tracking-wide" style={{ color: p.group === "chord" || p.group === "bass" ? "var(--fire-light)" : "rgba(255,255,255,0.75)" }}>{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="inline-block px-1.5 py-0.5 mx-0.5 rounded text-[11px] font-mono" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.8)", boxShadow: "inset 0 -1px 0 rgba(255,255,255,0.12)" }}>{children}</kbd>;
}
