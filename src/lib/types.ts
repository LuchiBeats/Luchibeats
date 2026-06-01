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
  featuredTrack?: string;
}

export interface CartItem {
  id: string;
  type: "beat" | "service";
  name: string;
  licenseName?: string;
  price: number;
  imageUrl?: string;
}
