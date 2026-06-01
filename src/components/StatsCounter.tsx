"use client";
import { useEffect, useRef, useState } from "react";

const stats = [
  { value: 500, suffix: "+", label: "Beats Produced" },
  { value: 150, suffix: "+", label: "Artists Worked With" },
  { value: 98,  suffix: "%", label: "Client Satisfaction" },
  { value: 10,  suffix: "+", label: "Years in the Game" },
];

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 1800;
        const steps = 60;
        const increment = value / steps;
        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= value) { setCount(value); clearInterval(timer); }
          else setCount(Math.floor(current));
        }, duration / steps);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [value]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function StatsCounter() {
  return (
    <section className="relative border-y py-20 overflow-hidden" style={{ borderColor: "rgba(201,168,76,0.2)", background: "var(--surface)" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(201,168,76,0.04) 0%, transparent 70%)" }} />
      <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map(({ value, suffix, label }) => (
          <div key={label} className="group">
            <p className="text-4xl md:text-6xl font-black mb-2 gold-gradient tabular-nums">
              <Counter value={value} suffix={suffix} />
            </p>
            <p className="text-xs tracking-[0.25em] uppercase" style={{ color: "var(--muted)" }}>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
