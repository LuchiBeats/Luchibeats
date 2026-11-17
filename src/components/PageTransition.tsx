"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";

// When you click to another page: a quick tape-style flicker, then the screen wipes up
// with a gold edge to reveal the new page. Never plays on the first page load.
export default function PageTransition() {
  const pathname = usePathname();
  const [seen, setSeen] = useState(pathname);
  const [moved, setMoved] = useState(false);
  if (pathname !== seen) {
    setSeen(pathname);
    if (!pathname.startsWith("/admin")) setMoved(true);
  }
  if (!moved || pathname.startsWith("/admin")) return null;
  return (
    <div key={pathname} className="page-wipe" aria-hidden="true">
      <span className="page-wipe-lines" />
      <span className="page-wipe-edge" />
    </div>
  );
}
