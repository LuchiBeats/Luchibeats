import type { SyntheticEvent } from "react";

// YouTube thumbnails: the full-HD one (1280x720) is sharp on big/4K screens, but YouTube
// doesn't make it for every video. When it's missing YouTube still sends an image (a 120x90
// grey placeholder), so check the size, not just errors. Use ytHD() as the src, and
// ytFallback as onLoad + onError + ref (the ref catches images that loaded before React did).
export const ytHD = (id: string) => `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;

function fix(img: HTMLImageElement | null) {
  if (!img || !img.src.includes("/maxresdefault.jpg")) return;
  const missing = img.complete && img.naturalWidth > 0 && img.naturalWidth <= 120;
  const failed = img.complete && img.naturalWidth === 0 && img.currentSrc !== "";
  if (missing || failed) img.src = img.src.replace("/maxresdefault.jpg", "/hqdefault.jpg");
}

export function ytFallback(e: SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  if (e.type === "error") { if (img.src.includes("/maxresdefault.jpg")) img.src = img.src.replace("/maxresdefault.jpg", "/hqdefault.jpg"); return; }
  fix(img);
}

export const ytRef = (img: HTMLImageElement | null) => fix(img);
