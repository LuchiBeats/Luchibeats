// Which audio files are in public/audio/. Flip a value to true after adding the file;
// until then the matching player stays hidden and the site never asks for the file.
// (The site-wide beat, public/audio/maestro.mp3, is always on: see SoundButton.tsx.)
export const AUDIO = {
  mix: false,   // public/audio/mix-rough.mp3 + mix-final.mp3 – "Hear the Difference"
};
