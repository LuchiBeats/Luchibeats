import Stripe from "stripe";
import { getBeats, getDrumKits } from "./beats-store";
import { downloadUrlFor } from "./r2";
import { missingAgreements, type Beat, type License } from "./types";

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  return key ? new Stripe(key) : null;
}

// What the browser sends: just the cart item's id and type. Prices are never trusted from the client.
export interface CartRef {
  id: string;
  type: "beat" | "drumkit" | "service";
}

export interface DownloadLink {
  label: string;
  url: string;
}

export interface ResolvedItem {
  kind: "beat" | "drumkit";
  refId: string;           // beat id or kit id
  licenseName?: License["name"];
  name: string;
  price: number;           // dollars
  imageUrl?: string;
}

const LICENSE_NAMES: License["name"][] = ["Basic", "Premium", "Exclusive"];

function isLive(b: Beat, now: Date) {
  return !b.soldExclusive && !b.hidden && (!b.goLiveAt || new Date(b.goLiveAt) <= now) && missingAgreements(b).length === 0;
}

// Turn cart refs into priced items using the live catalog. Throws with a buyer-facing message if anything is unavailable.
export async function resolveCart(refs: CartRef[]): Promise<ResolvedItem[]> {
  if (!Array.isArray(refs) || refs.length === 0) throw new Error("Your cart is empty.");
  if (refs.length > 50) throw new Error("Too many items in cart.");

  const [beats, kits] = await Promise.all([getBeats(), getDrumKits()]);
  const now = new Date();
  const items: ResolvedItem[] = [];
  const seen = new Set<string>();

  for (const ref of refs) {
    const id = String(ref?.id ?? "");
    if (!id || seen.has(id)) continue;
    seen.add(id);

    if (ref.type === "beat") {
      // Cart id format: `${beat.id}-${license.name}`
      const licenseName = LICENSE_NAMES.find((n) => id.endsWith(`-${n}`));
      const beatId = licenseName ? id.slice(0, -(licenseName.length + 1)) : "";
      const beat = beats.find((b) => b.id === beatId);
      const license = beat?.licenses.find((l) => l.name === licenseName);
      if (!beat || !license || !isLive(beat, now)) {
        throw new Error("One of the beats in your cart is no longer available. Please remove it and try again.");
      }
      items.push({
        kind: "beat", refId: beat.id, licenseName: license.name,
        name: `${beat.title} — ${license.name} License`, price: license.price, imageUrl: beat.imageUrl,
      });
    } else if (ref.type === "drumkit") {
      const kit = kits.find((k) => k.id === id);
      if (!kit || kit.hidden) throw new Error("One of the drum kits in your cart is no longer available.");
      items.push({ kind: "drumkit", refId: kit.id, name: kit.name, price: kit.price, imageUrl: kit.imageUrl });
    } else {
      throw new Error("Services can't be purchased online yet — please use the contact page.");
    }
  }

  // Can't buy the exclusive and a lease of the same beat, or two exclusives of the same beat
  const exclusives = items.filter((i) => i.licenseName === "Exclusive").map((i) => i.refId);
  if (items.some((i) => i.kind === "beat" && i.licenseName !== "Exclusive" && exclusives.includes(i.refId))) {
    throw new Error("You have both a lease and the exclusive of the same beat in your cart — keep just one.");
  }
  return items;
}

// Which files a buyer receives, based on the license's format text (e.g. "MP3", "WAV + Stems").
function beatFiles(beat: Beat, licenseName: License["name"]): DownloadLink[] {
  const format = (beat.licenses.find((l) => l.name === licenseName)?.format ?? "").toLowerCase();
  const all = licenseName === "Exclusive";
  const links: DownloadLink[] = [];
  if (beat.mp3Url) links.push({ label: "MP3", url: beat.mp3Url });
  if (beat.wavUrl && (all || format.includes("wav"))) links.push({ label: "WAV", url: beat.wavUrl });
  if (beat.stemsUrl && (all || format.includes("stem"))) links.push({ label: "Stems", url: beat.stemsUrl });
  const agreementUrl = beat.licenses.find((l) => l.name === licenseName)?.agreementUrl;
  if (agreementUrl) links.push({ label: "License Agreement", url: agreementUrl });
  return links;
}

function extOf(ref: string) {
  const ext = ref.split("?")[0].split(".").pop();
  return ext && ext.length <= 5 ? `.${ext}` : "";
}

// Swap stored file references for downloadable links (signed + expiring for files in the private bucket)
async function resolveLinks(links: DownloadLink[], baseName: string): Promise<DownloadLink[]> {
  const resolved = await Promise.all(
    links.map(async (l) => {
      const url = await downloadUrlFor(l.url, `${baseName} - ${l.label}${extOf(l.url)}`);
      return url ? { label: l.label, url } : null;
    }),
  );
  return resolved.filter((l): l is DownloadLink => l !== null);
}

export interface PurchasedItem {
  kind: "beat" | "drumkit";
  refId: string;
  licenseName?: License["name"];
  name: string;
  amount: number;          // dollars actually paid for this line
  downloads: DownloadLink[];
}

// Read back what was bought in a completed Checkout Session, with fresh download links from the current catalog.
export async function purchasedItems(stripe: Stripe, sessionId: string): Promise<PurchasedItem[]> {
  const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, { limit: 100, expand: ["data.price.product"] });
  const [beats, kits] = await Promise.all([getBeats(), getDrumKits()]);
  const out: PurchasedItem[] = [];
  for (const li of lineItems.data) {
    const product = li.price?.product as Stripe.Product | undefined;
    const md = product?.metadata ?? {};
    const amount = (li.amount_total ?? 0) / 100;
    if (md.kind === "beat") {
      const beat = beats.find((b) => b.id === md.refId);
      const licenseName = md.license as License["name"];
      out.push({
        kind: "beat", refId: md.refId, licenseName, name: li.description ?? "Beat", amount,
        downloads: beat ? await resolveLinks(beatFiles(beat, licenseName), `${beat.title} (${licenseName})`) : [],
      });
    } else if (md.kind === "drumkit") {
      const kit = kits.find((k) => k.id === md.refId);
      out.push({
        kind: "drumkit", refId: md.refId, name: li.description ?? "Drum Kit", amount,
        downloads: kit?.downloadUrl ? await resolveLinks([{ label: "Download Kit", url: kit.downloadUrl }], kit.name) : [],
      });
    }
  }
  return out;
}
