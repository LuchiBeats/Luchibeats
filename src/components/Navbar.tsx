"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/live", label: "Luchi Beats Live" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <nav className="w-full" style={{ background: "linear-gradient(to bottom, #000, var(--bg))" }}>
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-20">
        <Link href="/">
          <Image src="/logo.png" alt="LuchiBeats" width={240} height={240} priority className="object-cover object-[50%_46%] h-14 w-28" />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1 lg:gap-2">
          {links.map((l) => {
            const active = isActive(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "px-2.5 lg:px-4 py-2 rounded-full text-[13px] lg:text-[15px] font-bold uppercase tracking-wide lg:tracking-wider transition-all border whitespace-nowrap",
                  active
                    ? "text-black border-transparent"
                    : "text-gray-100 border-transparent hover:text-[var(--fire-light)] hover:border-[rgba(201,168,76,0.4)] hover:bg-[rgba(201,168,76,0.08)]"
                )}
                style={active ? { background: "linear-gradient(90deg, var(--fire-red), var(--fire), var(--fire-light))", boxShadow: "0 0 18px rgba(201,168,76,0.35)" } : undefined}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          <button className="md:hidden flex items-center gap-2 px-3 py-2 rounded-full border text-sm font-bold uppercase tracking-wider"
            style={{ color: "var(--fire)", borderColor: "rgba(201,168,76,0.4)" }}
            onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Menu">
            {open ? <X size={20} /> : <Menu size={20} />}
            <span>Menu</span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden px-4 py-4 flex flex-col gap-2" style={{ background: "var(--bg)" }}>
          {links.map((l) => {
            const active = isActive(l.href);
            return (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "px-4 py-3 rounded-lg text-base font-bold uppercase tracking-wider border",
                  active ? "text-black border-transparent" : "text-gray-100 border-[var(--border)] active:bg-[rgba(201,168,76,0.1)]"
                )}
                style={active ? { background: "linear-gradient(90deg, var(--fire-red), var(--fire), var(--fire-light))" } : undefined}>
                {l.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
