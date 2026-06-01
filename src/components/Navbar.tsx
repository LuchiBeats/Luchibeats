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
  { href: "/mixing", label: "Mixing" },
  { href: "/artists", label: "Spotlights" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { items } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b" style={{ background: "rgba(10,10,10,0.92)", backdropFilter: "blur(12px)", borderColor: "var(--border)" }}>
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/">
          <Image src="/logo.png" alt="LuchiBeats" width={120} height={60} className="object-contain h-12 w-auto" />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "text-sm tracking-wide transition-colors",
                pathname === l.href ? "text-orange-500" : "text-gray-400 hover:text-white"
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative">
            <ShoppingCart size={20} className="text-gray-300 hover:text-white transition-colors" />
            {items.length > 0 && (
              <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold" style={{ background: "var(--fire)", color: "#fff" }}>
                {items.length}
              </span>
            )}
          </Link>
          <button className="md:hidden text-gray-300" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t px-4 py-4 flex flex-col gap-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className={cn("text-sm tracking-wide", pathname === l.href ? "text-orange-500" : "text-gray-400")}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
