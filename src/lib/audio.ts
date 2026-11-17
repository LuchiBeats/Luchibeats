// Which audio files are in public/audio/. Flip a value to true after adding the file;
// until then the matching player stays hidden and the site never asks for the file.
export const AUDIO = {
  loop: false,  // public/audio/loop.mp3       – beat loop for the Sound button
  tag: false,   // public/audio/tag.mp3        – producer tag, plays before the loop
  mix: false,   // public/audio/mix-rough.mp3 + mix-final.mp3 – "Hear the Difference"
};
