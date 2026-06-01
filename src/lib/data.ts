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
    name: "Nova",
    genre: "R&B / Soul",
    imageUrl: "/images/artists/nova.jpg",
    bio: "Nova is a rising R&B artist blending classic soul with modern production. Her debut EP caught the attention of tastemakers across the country.",
    instagramUrl: "#",
    spotifyUrl: "#",
  },
  {
    id: "artist-2",
    name: "K-Real",
    genre: "Hip-Hop",
    imageUrl: "/images/artists/k-real.jpg",
    bio: "K-Real brings raw street narratives over cinematic beats. His storytelling and delivery set him apart in a crowded scene.",
    instagramUrl: "#",
    youtubeUrl: "#",
  },
  {
    id: "artist-3",
    name: "Zara M.",
    genre: "Afrobeats / Pop",
    imageUrl: "/images/artists/zara.jpg",
    bio: "Zara M. fuses Afrobeats rhythms with pop hooks to create infectious tracks that cross cultural boundaries.",
    spotifyUrl: "#",
    instagramUrl: "#",
  },
];
