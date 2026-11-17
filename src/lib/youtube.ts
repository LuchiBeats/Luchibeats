// Reads the public LuchiBeats YouTube channel without an API key:
//  - the channel's RSS feed (newest ~15 uploads, with titles, dates and view counts)
//  - the channel's Live and Shorts tabs (to sort videos into streams / shorts / videos)
//  - YouTube's oEmbed endpoint (tells us whether a video may be played on other sites)
// Every request is best-effort and cached, so if YouTube changes its pages the site
// falls back to the plain feed instead of breaking.

export const YT_CHANNEL_ID = "UCbSznbGXVICmNsKzqs_fVQQ";
export const YT_CHANNEL_URL = "https://www.youtube.com/@LuchiBeats";

// How often (seconds) the site re-checks YouTube for new videos or a live stream
export const YT_REFRESH = 300;

export type VideoKind = "stream" | "short" | "video";

export interface ChannelVideo {
  id: string;
  title: string;
  published?: string; // ISO date, when known
  views?: number;
  description?: string; // from the feed, for the tape sleeve's back cover
  length?: number;      // seconds, when YouTube reports it
  kind: VideoKind;
  embeddable: boolean; // false when "Allow embedding" is off for the video in YouTube Studio
}

export interface ChannelData {
  liveNowId: string | null;
  streams: ChannelVideo[];
  shorts: ChannelVideo[];
  videos: ChannelVideo[];
}

const HEADERS = { "User-Agent": "Mozilla/5.0 (compatible; LuchiBeatsSite/1.0)", "Accept-Language": "en-US,en;q=0.9" };

async function getText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: HEADERS, next: { revalidate: YT_REFRESH } });
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  }
}

const decode = (s: string) =>
  s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

interface FeedEntry { id: string; title: string; published?: string; views?: number; description?: string }

async function getFeed(): Promise<FeedEntry[]> {
  const xml = await getText(`https://www.youtube.com/feeds/videos.xml?channel_id=${YT_CHANNEL_ID}`);
  if (!xml) return [];
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].flatMap(([, e]) => {
    const id = e.match(/<yt:videoId>([^<]+)</)?.[1];
    if (!id) return [];
    const views = e.match(/<media:statistics views="(\d+)"/)?.[1];
    return [{
      id,
      title: decode(e.match(/<title>([^<]*)</)?.[1] ?? ""),
      published: e.match(/<published>([^<]+)</)?.[1],
      views: views ? Number(views) : undefined,
      description: decode(e.match(/<media:description>([\s\S]*?)<\/media:description>/)?.[1] ?? "").trim() || undefined,
    }];
  });
}

// Pull { id, title } pairs out of a channel tab page (Live or Shorts).
async function getTab(tab: "streams" | "shorts"): Promise<{ id: string; title: string }[]> {
  const html = await getText(`${YT_CHANNEL_URL}/${tab}`);
  if (!html) return [];
  const found = new Map<string, string>();
  const json = html.match(/var ytInitialData = (\{[\s\S]*?\});<\/script>/)?.[1];
  if (json) {
    try {
      const walk = (o: unknown): void => {
        if (Array.isArray(o)) { o.forEach(walk); return; }
        if (!o || typeof o !== "object") return;
        const rec = o as Record<string, unknown>;
        // Streams tab: lockupViewModel { contentId, metadata.lockupMetadataViewModel.title.content }
        const lockup = rec.lockupViewModel as Record<string, any> | undefined; // eslint-disable-line @typescript-eslint/no-explicit-any
        if (lockup?.contentId) found.set(lockup.contentId, lockup.metadata?.lockupMetadataViewModel?.title?.content ?? "");
        // Shorts tab: shortsLockupViewModel { onTap...videoId, overlayMetadata.primaryText.content }
        const short = rec.shortsLockupViewModel as Record<string, any> | undefined; // eslint-disable-line @typescript-eslint/no-explicit-any
        const shortId = short?.onTap?.innertubeCommand?.reelWatchEndpoint?.videoId;
        if (shortId) found.set(shortId, short?.overlayMetadata?.primaryText?.content ?? "");
        Object.values(rec).forEach(walk);
      };
      walk(JSON.parse(json));
    } catch { /* page format changed — fall through */ }
  }
  return [...found].map(([id, title]) => ({ id, title }));
}

async function isEmbeddable(id: string): Promise<boolean> {
  try {
    const url = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}`;
    const res = await fetch(url, { headers: HEADERS, next: { revalidate: YT_REFRESH } });
    return res.ok;
  } catch {
    return false;
  }
}

// A video's own page says whether it was a live broadcast and whether it is only scheduled.
// Backs up the Live tab (which can fail to load) and filters out streams that haven't started.
async function getWatchInfo(id: string): Promise<{ wasLive: boolean; upcoming: boolean; length?: number }> {
  const html = await getText(`https://www.youtube.com/watch?v=${id}`);
  const len = html?.match(/"lengthSeconds":"(\d+)"/)?.[1];
  return { wasLive: !!html && /"isLiveContent":true/.test(html), upcoming: !!html && /"isUpcoming":true/.test(html), length: len ? Number(len) : undefined };
}

// The channel's /live URL resolves to the current broadcast when one is running.
export async function getLiveNowId(): Promise<string | null> {
  const html = await getText(`${YT_CHANNEL_URL}/live`);
  if (!html || !/"isLiveNow":true/.test(html)) return null;
  return html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([\w-]{11})"/)?.[1] ?? null;
}

export async function getChannelData(): Promise<ChannelData> {
  const [feed, streamTab, shortTab, liveNowId] = await Promise.all([
    getFeed(), getTab("streams"), getTab("shorts"), getLiveNowId(),
  ]);

  const streamIds = new Set(streamTab.map((v) => v.id));
  const shortIds = new Set(shortTab.map((v) => v.id));

  // Merge: feed entries first (they have dates/views), then anything only seen on a tab
  const byId = new Map<string, FeedEntry>();
  for (const e of feed) byId.set(e.id, e);
  for (const t of [...streamTab, ...shortTab]) if (!byId.has(t.id) && t.title) byId.set(t.id, { id: t.id, title: t.title });

  const all = (await Promise.all(
    [...byId.values()].map(async (e): Promise<ChannelVideo | null> => {
      let kind: VideoKind = streamIds.has(e.id) ? "stream" : shortIds.has(e.id) ? "short" : "video";
      let length: number | undefined;
      if (kind !== "short") {
        const info = await getWatchInfo(e.id);
        // Skip scheduled streams that haven't started — once one goes live it shows as LIVE NOW
        if (info.upcoming && e.id !== liveNowId) return null;
        if (info.wasLive) kind = "stream";
        length = info.length;
      }
      return { ...e, length, kind, embeddable: await isEmbeddable(e.id) };
    }),
  )).filter((v): v is ChannelVideo => v !== null);

  // Newest first; tab-only entries (no date) keep the order YouTube listed them in, after dated ones
  const sorted = all.sort((a, b) => (b.published ?? "").localeCompare(a.published ?? ""));
  return {
    liveNowId,
    streams: sorted.filter((v) => v.kind === "stream"),
    shorts: sorted.filter((v) => v.kind === "short"),
    videos: sorted.filter((v) => v.kind === "video"),
  };
}
