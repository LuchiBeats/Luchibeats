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
  soldSessionId?: string;  // Stripe session that bought the exclusive (set by the webhook)
  exclusiveHold?: { sessionId: string; until: string }; // exclusive reserved while a buyer is in checkout
  hidden?: boolean;
  goLiveAt?: string;
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
  agreementUrl?: string;   // uploaded license agreement (e.g. exported from Sound Credit) — required to sell this tier
}

// A beat can't be live or sold until every license tier has an uploaded agreement.
export function missingAgreements(beat: Pick<Beat, "licenses">): License["name"][] {
  return (["Basic", "Premium", "Exclusive"] as const).filter(
    (name) => !beat.licenses?.find((l) => l.name === name)?.agreementUrl
  );
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
  type: "beat" | "service" | "drumkit";
  name: string;
  licenseName?: string;
  price: number;
  imageUrl?: string;
}
