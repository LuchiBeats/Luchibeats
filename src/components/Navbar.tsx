"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/store";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/beats", label: "Beats" },
  { href: "/drum-kits", label: "Drum Kits" },
  { href: "/merch", label: "Merch" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { items } = useCart();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <nav className="w-full border-b" style={{ background: "rgba(0,0,0,0.95)", backdropFilter: "blur(12px)", borderColor: "var(--border)" }}>
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-20">
        <Link href="/">
          <Image src="/logo.png" alt="LuchiBeats" width={120} height={60} className="object-contain h-12 w-auto" />
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
          <Link href="/cart" className="relative" aria-label="Cart">
            <ShoppingCart size={24} className="text-gray-100 hover:text-[var(--fire-light)] transition-colors" />
            {items.length > 0 && (
              <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold" style={{ background: "var(--fire)", color: "#000" }}>
                {items.length}
              </span>
            )}
          </Link>
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
        <div className="md:hidden border-t px-4 py-4 flex flex-col gap-2" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
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
