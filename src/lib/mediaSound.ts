// Players that make sound (recap videos, the Live page TV) announce it here, so the
// site's background beat can step aside while they're audible and come back after.
// Players also use it to stay polite to each other: when one starts making sound, the
// others mute.
export const MEDIA_EVENT = "lb-media-sound";

export type MediaSoundDetail = { source: string; on: boolean };

export function announceSound(source: string, on: boolean) {
  window.dispatchEvent(new CustomEvent<MediaSoundDetail>(MEDIA_EVENT, { detail: { source, on } }));
}
