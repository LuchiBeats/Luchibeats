"use client";
import { useState } from "react";
import Image from "next/image";
import Lightbox from "@/components/Lightbox";

// Framed prints hung on the studio wall (salon hang). Click one to view it full screen.
const PRINTS = [
  { src: "/luchi/shoot/bw-hand-face.webp", alt: "Luchi, black and white, tattooed hand over his face", w: 968, h: 1450, area: "a" },
  { src: "/luchi/shoot/red-eyes.webp", alt: "Luchi, eyes and brow against a red wall", w: 1163, h: 778, area: "b" },
  { src: "/luchi/shoot/red-low-angle.webp", alt: "Luchi, low-angle portrait against red", w: 968, h: 1450, area: "c" },
  { src: "/luchi/shoot/bw-binoculars.webp", alt: "Luchi, black and white, looking through his hands", w: 1163, h: 778, area: "d" },
  { src: "/luchi/shoot/red-profile.webp", alt: "Luchi in profile against a red wall", w: 968, h: 1450, area: "e" },
];

export default function PortraitWall() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <div className="portrait-wall">
        {PRINTS.map((p, i) => (
          <button key={p.src} type="button" onClick={() => setOpen(i)} aria-label={`Open photo: ${p.alt}`}
            className="print" style={{ gridArea: p.area }}>
            <span className="print-frame">
              <Image src={p.src} alt={p.alt} width={p.w} height={p.h}
                sizes={p.area === "c" ? "(max-width: 768px) 90vw, 400px" : "(max-width: 768px) 45vw, 300px"} />
            </span>
          </button>
        ))}
      </div>
      <Lightbox photos={PRINTS} open={open} setOpen={setOpen} label="Portraits" />
    </>
  );
}
