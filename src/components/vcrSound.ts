// VCR sound effects, synthesized with the Web Audio API (no audio files).
// They only ever play in response to a click, tap or drag, and can be muted
// with the speaker button on the TV (remembered in this browser).

const KEY = "lb-vcr-sound";
let ctx: AudioContext | null = null;
let muted = false;
try { muted = typeof window !== "undefined" && window.localStorage.getItem(KEY) === "off"; } catch { /* storage blocked */ }

export const isMuted = () => muted;
export function setMuted(m: boolean) {
  muted = m;
  try { window.localStorage.setItem(KEY, m ? "off" : "on"); } catch { /* storage blocked */ }
}

function audio(): AudioContext | null {
  if (muted || typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new Ctx();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch { return null; }
}

let noiseBuf: AudioBuffer | null = null;
function noise(c: AudioContext, seconds: number) {
  if (!noiseBuf || noiseBuf.sampleRate !== c.sampleRate) {
    noiseBuf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const src = c.createBufferSource();
  src.buffer = noiseBuf;
  src.loop = seconds > 2;
  return src;
}

function env(c: AudioContext, t: number, peak: number, attack: number, decay: number) {
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  return g;
}

/** Short filtered noise tick, the core of every mechanical sound */
function tick(c: AudioContext, t: number, freq: number, peak: number, decay: number, q = 1.2) {
  const n = noise(c, decay + 0.05);
  const f = c.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = freq; f.Q.value = q;
  const g = env(c, t, peak, 0.001, decay);
  n.connect(f).connect(g).connect(c.destination);
  n.start(t); n.stop(t + decay + 0.05);
}

/** Low body thump */
function thump(c: AudioContext, t: number, from: number, to: number, peak: number, decay: number) {
  const o = c.createOscillator(); o.type = "sine";
  o.frequency.setValueAtTime(from, t); o.frequency.exponentialRampToValueAtTime(to, t + decay);
  const g = env(c, t, peak, 0.002, decay);
  o.connect(g).connect(c.destination);
  o.start(t); o.stop(t + decay + 0.05);
}

/** Motor whir that rises or falls in pitch */
function motor(c: AudioContext, t: number, from: number, to: number, dur: number, peak: number) {
  const o = c.createOscillator(); o.type = "sawtooth";
  o.frequency.setValueAtTime(from, t); o.frequency.linearRampToValueAtTime(to, t + dur);
  const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 900;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + dur * 0.2);
  g.gain.linearRampToValueAtTime(peak * 0.8, t + dur * 0.8);
  g.gain.linearRampToValueAtTime(0.0001, t + dur);
  o.connect(lp).connect(g).connect(c.destination);
  o.start(t); o.stop(t + dur + 0.05);
}

export const sfx = {
  /** A transport key being pressed */
  click() {
    const c = audio(); if (!c) return;
    const t = c.currentTime;
    tick(c, t, 3200, 0.22, 0.025, 2);
    tick(c, t + 0.045, 2200, 0.12, 0.03, 2);
  },
  /** Tape pushed into the slot: flap, slide, then the deck pulls it in with a clunk */
  insert() {
    const c = audio(); if (!c) return;
    const t = c.currentTime;
    tick(c, t, 1800, 0.18, 0.05);                    // flap
    const slide = noise(c, 0.4);
    const bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 900; bp.Q.value = 0.8;
    const g = env(c, t + 0.05, 0.08, 0.08, 0.3);
    slide.connect(bp).connect(g).connect(c.destination); slide.start(t + 0.05); slide.stop(t + 0.5);
    motor(c, t + 0.35, 70, 110, 0.55, 0.05);         // loading motor
    thump(c, t + 0.9, 160, 55, 0.5, 0.18);           // clunk
    tick(c, t + 0.9, 1200, 0.25, 0.06);
    tick(c, t + 1.05, 2600, 0.12, 0.04);
  },
  /** Eject: motor spins down the other way and the tape pops out */
  eject() {
    const c = audio(); if (!c) return;
    const t = c.currentTime;
    motor(c, t, 120, 70, 0.5, 0.05);
    thump(c, t + 0.45, 140, 60, 0.35, 0.14);
    tick(c, t + 0.45, 1500, 0.22, 0.05);
    tick(c, t + 0.6, 2000, 0.12, 0.04);
  },
  /** TV static hiss for a moment */
  static(ms = 700) {
    const c = audio(); if (!c) return;
    const t = c.currentTime, d = ms / 1000;
    const n = noise(c, d);
    const hp = c.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 1200;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.07, t + 0.05);
    g.gain.setValueAtTime(0.07, t + d - 0.15);
    g.gain.linearRampToValueAtTime(0.0001, t + d);
    n.connect(hp).connect(g).connect(c.destination); n.start(t); n.stop(t + d + 0.05);
  },
  /** Tape searching fast: a short high chirp, up for forward, down for back */
  search(forward: boolean) {
    const c = audio(); if (!c) return;
    const t = c.currentTime;
    const o = c.createOscillator(); o.type = "square";
    o.frequency.setValueAtTime(forward ? 900 : 1500, t);
    o.frequency.exponentialRampToValueAtTime(forward ? 1600 : 800, t + 0.18);
    const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2500;
    const g = env(c, t, 0.025, 0.01, 0.18);
    o.connect(lp).connect(g).connect(c.destination); o.start(t); o.stop(t + 0.22);
  },
};
