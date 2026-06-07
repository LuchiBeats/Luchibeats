export interface Beat {
  id: string;
  title: string;
  genre: string;
  bpm: number;
  key: string;
  mood: string;
  audioUrl: string;
  imageUrl: string;
  licenses: License[];
  tags: string[];
  soldExclusive?: boolean;
  hidden?: boolean;
  goLiveAt?: string;
  isFree?: boolean;
  copyrightTimestamp?: string;
  mp3Url?: string;
  wavUrl?: string;
  stemsUrl?: string;
}

export interface License {
  id: string;
  name: "Basic" | "Premium" | "Exclusive";
  price: number;
  format: string;
  streams: string;
  description: string;
}

export interface MixingService {
  id: string;
  name: string;
  price: number;
  turnaround: string;
  features: string[];
  popular?: boolean;
}

export interface Artist {
  id: string;
  name: string;
  genre: string;
  imageUrl: string;
  bio: string;
  spotifyUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  linktreeUrl?: string;
  featuredTrack?: string;
}

export interface DrumKit {
  id: string;
  name: string;
  genre: string;
  description: string;
  price: number;
  sampleCount: number;
  formats: string[];
  tags: string[];
  includes: string[];
  popular?: boolean;
  hidden?: boolean;
  imageUrl?: string;
  previewUrl?: string;
  downloadUrl?: string;
}

export interface CartItem {
  id: string;
  type: "beat" | "service";
  name: string;
  licenseName?: string;
  price: number;
  imageUrl?: string;
}
