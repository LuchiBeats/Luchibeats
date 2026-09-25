import { put, get } from "@vercel/blob";
import type { Beat, DrumKit } from "./types";

// ── Generic helpers ──────────────────────────────────────────────────────────
// All site data lives in the private Blob store (luchibeats-private) — it has no
// public URLs, so subscribers, orders, messages and admin credentials can only be
// read through these server-side helpers.

const PRIVATE_TOKEN = () => process.env.PRIVATE_READ_WRITE_TOKEN;

async function readJson<T>(pathname: string, fallback: T): Promise<T> {
  try {
    const result = await get(pathname, { access: "private", token: PRIVATE_TOKEN(), useCache: false });
    if (!result || result.statusCode !== 200) return fallback;
    return (await new Response(result.stream).json()) as T;
  } catch (err) {
    console.error(`[blob] read ${pathname} failed`, err);
    return fallback;
  }
}

async function writeJson(pathname: string, data: unknown): Promise<void> {
  await put(pathname, JSON.stringify(data), {
    access: "private",
    token: PRIVATE_TOKEN(),
    allowOverwrite: true,
    contentType: "application/json",
  });
}

const getBlob = <T,>(pathname: string) => readJson<T[]>(pathname, []);
const saveBlob = <T,>(pathname: string, data: T[]) => writeJson(pathname, data);
const getSingleBlob = <T,>(pathname: string, fallback: T) => readJson<T>(pathname, fallback);
const saveSingleBlob = <T,>(pathname: string, data: T) => writeJson(pathname, data);

// ── Beats ────────────────────────────────────────────────────────────────────

export const getBeats = () => getBlob<Beat>("beats-catalog.json");
export const saveBeats = (beats: Beat[]) => saveBlob("beats-catalog.json", beats);

// ── Drum Kits ─────────────────────────────────────────────────────────────────

export const getDrumKits = () => getBlob<DrumKit>("drum-kits-catalog.json");
export const saveDrumKits = (kits: DrumKit[]) => saveBlob("drum-kits-catalog.json", kits);

// ── Testimonials ─────────────────────────────────────────────────────────────

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  title: string;
  image?: string;
  objectPosition?: string;
}

export const getTestimonials = () => getBlob<Testimonial>("testimonials.json");
export const saveTestimonials = (t: Testimonial[]) => saveBlob("testimonials.json", t);

// ── Messages ─────────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
  starred?: boolean;
  replied?: boolean;
  folder?: "inbox" | "archive" | "trash";
}

export const getMessages = () => getBlob<Message>("messages.json");
export const saveMessages = (m: Message[]) => saveBlob("messages.json", m);

// ── Subscribers ───────────────────────────────────────────────────────────────

export interface Subscriber {
  id: string;
  email: string;
  createdAt: string;
}

export const getSubscribers = () => getBlob<Subscriber>("subscribers.json");
export const saveSubscribers = (s: Subscriber[]) => saveBlob("subscribers.json", s);

// ── Orders ────────────────────────────────────────────────────────────────────

export interface Order {
  id: string;
  type: "beat" | "service" | "drumkit";
  itemId?: string;
  itemTitle: string;
  licenseType?: string;
  customerEmail: string;
  customerName: string;
  amount: number;
  status: "pending" | "completed" | "refunded";
  createdAt: string;
  notes?: string;
  stripeSessionId?: string;
}

export const getOrders = () => getBlob<Order>("orders.json");
export const saveOrders = (o: Order[]) => saveBlob("orders.json", o);

// ── Analytics ─────────────────────────────────────────────────────────────────

export interface CountryStat {
  views: number;
  contacts: number;
  subscribers: number;
}

export interface Analytics {
  pageViews: number;
  mobileViews: number;
  desktopViews: number;
  beatPlays: Record<string, number>;
  countries: Record<string, CountryStat>;
  lastUpdated: string;
}

const ANALYTICS_FALLBACK: Analytics = { pageViews: 0, mobileViews: 0, desktopViews: 0, beatPlays: {}, countries: {}, lastUpdated: new Date().toISOString() };

export const getAnalytics = () => getSingleBlob<Analytics>("analytics.json", ANALYTICS_FALLBACK);
export const saveAnalytics = (a: Analytics) => saveSingleBlob("analytics.json", a);

// ── Homepage Content ──────────────────────────────────────────────────────────

export interface StatItem {
  value: number;
  suffix: string;
  label: string;
}

export interface ProductionVideo {
  id: string;
  artist: string;
  title: string;
  credits: string;
}

export interface HomepageContent {
  marqueeItems: string[];
  beatsLabel: string;
  beatsHeadline: string;
  heroHeadline?: string;
  heroSubtext?: string;
  heroCta?: string;
  heroCtaUrl?: string;
  stats?: StatItem[];
  emailBadge?: string;
  emailHeadline?: string;
  emailSubtext?: string;
  productions?: ProductionVideo[];
  seoTitle?: string;
  seoDescription?: string;
}

const HOMEPAGE_FALLBACK: HomepageContent = {
  marqueeItems: [
    "15+ YEARS OF EXPERIENCE", "150+ ARTISTS WORKED WITH", "100% CLIENT SATISFACTION",
    "NEW BEATS AVAILABLE", "EXCLUSIVE LICENSES",
    "LUCHIBEATS.COM",
  ],
  beatsLabel: "FRESH CUTS",
  beatsHeadline: "Latest Beats",
  stats: [
    { value: 15,  suffix: "+",  label: "Years of Experience" },
    { value: 150, suffix: "+",  label: "Artists Worked With" },
    { value: 100, suffix: "%",  label: "Client Satisfaction" },
  ],
  productions: [
    { id: "Oma1SZ8utmw", artist: "G Wreck ft Coi Leray",         title: "Froze",               credits: "Beat · Vocal Recording · Mix" },
    { id: "DMjz34ubhg4", artist: "Mach City",                    title: "Machi 99",            credits: "Beat · Vocal Recording · Mix" },
    { id: "6a94jphQcaY", artist: "Mach City",                    title: "Make Em Trip",        credits: "Beat · Vocal Recording · Mix" },
    { id: "gPyvvEYe3Ng", artist: "Trey Budden x Oskama Esteban", title: "Cage Bird Sings",     credits: "Beat · Vocal Recording · Mix" },
    { id: "aLmZ0nV9_gc", artist: "A.D Ft K Godess",              title: "Work",                credits: "Beat · Vocal Recording · Mix" },
    { id: "dft7z1yWCDg", artist: "Trey Budden",                  title: "PUBLIK!",             credits: "Beat · Vocal Recording · Mix" },
    { id: "PPnuRGkrRuY", artist: "Swizzyy Marleyy",              title: "Super Gango",         credits: "Vocal Recording · Mix" },
    { id: "IwreOeCvK1M", artist: "Mysonne",                      title: "That's How We On It", credits: "Vocal Recording · Mix" },
    { id: "zGzpIqC5zvQ", artist: "A Boogie Wit Da Hoodie",       title: "Timeless",            credits: "Initial Vocal Recording" },
  ],
  emailBadge: "JOIN THE LIST",
  emailHeadline: "Stay Up To Date\nOn New Drops",
  emailSubtext: "Join the list. Be the first to hear new drops and exclusive deals.",
};

export const getHomepageContent = () => getSingleBlob<HomepageContent>("homepage-content.json", HOMEPAGE_FALLBACK);
export const saveHomepageContent = (c: HomepageContent) => saveSingleBlob("homepage-content.json", c);

// ── Settings (free beat + push subscriptions) ─────────────────────────────────

export interface PushSub {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export interface Settings {
  pushSubscriptions: PushSub[];
}

const SETTINGS_FALLBACK: Settings = { pushSubscriptions: [] };

export const getSettings = () => getSingleBlob<Settings>("settings.json", SETTINGS_FALLBACK);
export const saveSettings = (s: Settings) => saveSingleBlob("settings.json", s);

// ── Admin credentials ────────────────────────────────────────────────────────

export interface AdminCredentials {
  email: string;
  passwordHash: string;
}

const ADMIN_CREDS_FALLBACK: AdminCredentials = { email: "", passwordHash: "" };

export const getAdminCredentials = () => getSingleBlob<AdminCredentials>("admin-credentials.json", ADMIN_CREDS_FALLBACK);
export const saveAdminCredentials = (c: AdminCredentials) => saveSingleBlob("admin-credentials.json", c);

// ── Exclusive Sale Archive ─────────────────────────────────────────────────────
// Append-only record of every beat sold exclusive. Survives beat catalog edits.

export interface SoldExclusiveEntry {
  beat: Beat;
  soldAt: string;
  customerName?: string;
  customerEmail?: string;
  orderId?: string;
  amount?: number;
}

export const getSoldArchive = () => getBlob<SoldExclusiveEntry>("sold-exclusive-archive.json");
export const saveSoldArchive = (entries: SoldExclusiveEntry[]) => saveBlob("sold-exclusive-archive.json", entries);

// ── Shopify Config ────────────────────────────────────────────────────────────

export interface ShopifyConfig {
  storeHandle?: string;
  storefrontToken?: string;
  collectionId?: string;
  connected?: boolean;
}

export const getShopifyConfig = () => getSingleBlob<ShopifyConfig>("shopify-config.json", {});
export const saveShopifyConfig = (c: ShopifyConfig) => saveSingleBlob("shopify-config.json", c);
