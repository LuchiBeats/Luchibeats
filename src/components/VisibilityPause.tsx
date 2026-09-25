"use client";
import { useEffect } from "react";

// Shared registry so audio players (which use detached `new Audio()` instances,
// not <audio> elements in the DOM) can be paused when the tab is backgrounded.
const activeAudioElements = new Set<HTMLAudioElement>();

export function registerAudio(el: HTMLAudioElement) {
  activeAudioElements.add(el);
}

export function unregisterAudio(el: HTMLAudioElement) {
  activeAudioElements.delete(el);
}

export default function VisibilityPause() {
  useEffect(() => {
    // Only resume videos that were actually playing when we paused them —
    // never override a video the user had already paused themselves.
    let pausedByUs: HTMLVideoElement[] = [];

    const onVisibility = () => {
      if (document.hidden) {
        document.body.classList.add("tab-hidden");
        pausedByUs = Array.from(document.querySelectorAll<HTMLVideoElement>("video")).filter((v) => !v.paused);
        pausedByUs.forEach((v) => v.pause());
        activeAudioElements.forEach((a) => a.pause());
      } else {
        document.body.classList.remove("tab-hidden");
        pausedByUs.forEach((v) => v.play().catch(() => {}));
        pausedByUs = [];
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return null;
}
