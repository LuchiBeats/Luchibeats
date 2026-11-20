"use client";
import { useState } from "react";
import Image from "next/image";
import { Expand } from "lucide-react";
import Lightbox from "@/components/Lightbox";

const GALLERY = [
  { src: "/luchi/session-laptop.webp", alt: "Luchi working on a beat in the studio" },
  { src: "/luchi/studio-window.webp", alt: "Luchi behind the board, seen through the studio glass" },
  { src: "/luchi/session-cigar.webp", alt: "Luchi mid-session at the laptop" },
  { src: "/luchi/portrait-half.webp", alt: "Portrait of Luchi" },
];

// The cross-faded studio photos; click one to open it full screen and flip through them.
export default function StudioGallery() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      {/* Phone: 2 per row. Desktop: 4 across. Neighbours overlap by exactly their fade width so they cross-fade. */}
      <div className="flex flex-wrap md:flex-nowrap -mt-10 md:-mt-20 -mx-4 md:mx-0">
        {GALLERY.map(({ src, alt }, i) => (
          <button key={src} type="button" onClick={() => setOpen(i)} aria-label={`Open photo: ${alt}`}
            className="photo-tile relative aspect-[2/3] w-[57.15%] md:w-[30.77%] overflow-hidden group even:-ml-[14.3%] [&:nth-child(n+3)]:-mt-[26%] md:[&:nth-child(n+3)]:mt-0 md:[&:not(:first-child)]:-ml-[7.69%] hover:z-10 focus-visible:z-10">
            <Image src={src} alt={alt} fill sizes="(max-width: 768px) 50vw, 240px"
              className="object-cover transition-all duration-700 group-hover:scale-110 brightness-[0.85] group-hover:brightness-110" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: "rgba(0,0,0,0.55)", color: "var(--fire-light)", boxShadow: "0 0 0 1px rgba(201,168,76,0.5)" }}>
              <Expand size={18} />
            </span>
          </button>
        ))}
      </div>

      <Lightbox photos={GALLERY} open={open} setOpen={setOpen} label="Studio photos" />
    </>
  );
}
