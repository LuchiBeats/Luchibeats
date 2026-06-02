import type { Beat, MixingService, Artist } from "./types";

export const beats: Beat[] = [
  {
    id: "beat-1",
    title: "Midnight Trap",
    genre: "Trap",
    bpm: 140,
    key: "C minor",
    mood: "Dark",
    audioUrl: "/audio/midnight-trap.mp3",
    imageUrl: "/images/beats/midnight-trap.jpg",
    tags: ["trap", "dark", "808"],
    licenses: [
      { id: "b1-basic", name: "Basic", price: 35, format: "MP3", streams: "100K streams", description: "Non-exclusive MP3 lease" },
      { id: "b1-premium", name: "Premium", price: 99, format: "WAV + Stems", streams: "500K streams", description: "Non-exclusive WAV + tracked stems" },
      { id: "b1-exclusive", name: "Exclusive", price: 499, format: "WAV + Stems", streams: "Unlimited", description: "Full exclusive rights — removed from store" },
    ],
  },
  {
    id: "beat-2",
    title: "Golden Hour",
    genre: "R&B",
    bpm: 92,
    key: "F major",
    mood: "Melodic",
    audioUrl: "/audio/golden-hour.mp3",
    imageUrl: "/images/beats/golden-hour.jpg",
    tags: ["rnb", "melodic", "soulful"],
    licenses: [
      { id: "b2-basic", name: "Basic", price: 40, format: "MP3", streams: "100K streams", description: "Non-exclusive MP3 lease" },
      { id: "b2-premium", name: "Premium", price: 110, format: "WAV + Stems", streams: "500K streams", description: "Non-exclusive WAV + tracked stems" },
      { id: "b2-exclusive", name: "Exclusive", price: 599, format: "WAV + Stems", streams: "Unlimited", description: "Full exclusive rights" },
    ],
  },
  {
    id: "beat-3",
    title: "Street Anthem",
    genre: "Hip-Hop",
    bpm: 88,
    key: "G minor",
    mood: "Hard",
    audioUrl: "/audio/street-anthem.mp3",
    imageUrl: "/images/beats/street-anthem.jpg",
    tags: ["hiphop", "hard", "boom bap"],
    licenses: [
      { id: "b3-basic", name: "Basic", price: 30, format: "MP3", streams: "100K streams", description: "Non-exclusive MP3 lease" },
      { id: "b3-premium", name: "Premium", price: 85, format: "WAV + Stems", streams: "500K streams", description: "Non-exclusive WAV + tracked stems" },
      { id: "b3-exclusive", name: "Exclusive", price: 399, format: "WAV + Stems", streams: "Unlimited", description: "Full exclusive rights" },
    ],
  },
];

export const mixingServices: MixingService[] = [
  {
    id: "mix-only",
    name: "Mix Only",
    price: 150,
    turnaround: "3–5 business days",
    features: [
      "Full stereo mix",
      "Vocal balancing & tuning",
      "EQ & compression",
      "2 rounds of revisions",
      "WAV delivery",
    ],
  },
  {
    id: "mix-master",
    name: "Mix + Master",
    price: 250,
    turnaround: "5–7 business days",
    popular: true,
    features: [
      "Everything in Mix Only",
      "Professional mastering",
      "Streaming-ready loudness",
      "3 rounds of revisions",
      "WAV + MP3 delivery",
    ],
  },
  {
    id: "full-production",
    name: "Full Production",
    price: 500,
    turnaround: "7–14 business days",
    features: [
      "Custom beat production",
      "Full mix & master",
      "Vocal production guidance",
      "Unlimited revisions",
      "All stems + final files",
    ],
  },
];

export const artists: Artist[] = [
  {
    id: "artist-1",
    name: "Oskama Esteban",
    genre: "Hip-Hop",
    imageUrl: "/artists/oskama.jpg",
    bio: "Oskama Esteban is a recording artist hailing from the streets of Paterson, New Jersey — a city with a long legacy of producing raw, authentic talent. Known for his razor-sharp lyricism and unapologetic storytelling, Oskama channels the grit, hustle, and heart of his upbringing into every bar he writes. His music captures the tension between struggle and ambition, painting vivid portraits of life in the trenches while keeping his eyes locked on elevation. With a delivery that commands attention and a pen that doesn't flinch, Oskama has steadily built a loyal following across the tri-state area and beyond. Whether he's dropping introspective verses over soulful production or going bar-for-bar on harder records, his versatility and consistency set him apart. Oskama Esteban isn't just making music — he's documenting a journey, and the world is starting to pay attention.",
  },
  {
    id: "artist-2",
    name: "Harrd Luck",
    genre: "Hip-Hop / Street",
    imageUrl: "/artists/harrd-luck.jpg",
    bio: "Born and raised in Paterson, New Jersey, Harrd Luck is a product of real circumstances and relentless drive. His name tells the story before he even opens his mouth — a life marked by adversity, shaped by the kind of experiences that either break you or build you into something unbreakable. Harrd Luck chose to build. His music hits with the weight of lived truth, each track a testament to survival, sacrifice, and the refusal to quit. His voice carries a rare urgency that can't be manufactured, and his pen captures moments that listeners from every walk of life can feel in their chest. He doesn't make music to impress — he makes music because it's necessary. Harrd Luck is one of Paterson's most authentic voices, and every verse he drops is proof that the hardest roads produce the realest artists.",
  },
  {
    id: "artist-3",
    name: "Mach City",
    genre: "Hip-Hop / Rap",
    imageUrl: "",
    bio: "Mach City emerged from the vibrant underground of Paterson, New Jersey with a sound that hits like a freight train and lingers like a melody you can't shake. Raised in an environment that demanded toughness but rewarded creativity, Mach City found his voice early and never let go of it. His music reflects a life lived fully — the highs, the setbacks, the moments of clarity that only come after real pressure. What separates him from the pack isn't just skill, it's hunger. Every session is treated like it could be the one that changes everything, and that mentality bleeds through every track he touches. Fans gravitate toward his authenticity, his refusal to water things down, and his ability to make you feel exactly what he felt when he wrote it. Mach City is building something that lasts — brick by brick, record by record.",
  },
  {
    id: "artist-4",
    name: "Calm King Causey",
    genre: "Hip-Hop / R&B",
    imageUrl: "/artists/calm-king-causey.jpg",
    bio: "Out of Paterson, New Jersey comes Calm King Causey — an artist whose very name captures his essence. Where others bring chaos to the booth, Causey brings composure. His approach to music is deliberate, measured, and deeply intentional, resulting in records that feel both effortless and carefully crafted. His smooth, commanding delivery draws you in from the first bar, while his lyrics reveal a depth of perspective that only comes from truly living what you speak on. Calm King Causey has the rare ability to make a hard-hitting track feel like a conversation — personal, direct, and impossible to ignore. He's built a reputation in the tri-state area as an artist of genuine substance, earning respect from peers and listeners alike. In a world full of noise, Causey is the calm that cuts through it all.",
  },
];
