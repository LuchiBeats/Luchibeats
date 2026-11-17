import type { Metadata } from "next";
import { MonitorPlay, Bell } from "lucide-react";
import NeonSign from "@/components/NeonSign";
import HomeFX from "@/components/HomeFX";
import LiveVideos from "@/components/LiveVideos";
import { getChannelData, YT_CHANNEL_URL } from "@/lib/youtube";

// Re-check the YouTube channel every 5 minutes so new streams and uploads appear on their own
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Luchi Beats Live",
  description: "Live streams, studio sessions and clips from the Luchi Beats YouTube channel.",
};

export default async function LivePage() {
  const data = await getChannelData();
  const empty = !data.liveNowId && !data.streams.length && !data.shorts.length && !data.videos.length;
  const all = [...data.streams, ...data.shorts, ...data.videos];
  const totalViews = all.reduce((n, v) => n + (v.views ?? 0), 0);
  const stats = [
    data.streams.length ? `${data.streams.length} stream${data.streams.length === 1 ? "" : "s"}` : null,
    data.shorts.length ? `${data.shorts.length} clip${data.shorts.length === 1 ? "" : "s"}` : null,
    totalViews ? `${totalViews.toLocaleString()} views` : null,
  ].filter(Boolean);

  return (
    <>
    <HomeFX />
    <div className="relative max-w-6xl mx-auto px-4 py-10 md:py-14">
      {/* Studio-light glow behind the header: red when live, gold otherwise */}
      <div aria-hidden="true" className="absolute -top-20 left-1/2 -translate-x-1/2 w-[900px] max-w-[140vw] h-[420px] pointer-events-none"
        style={{ background: `radial-gradient(ellipse at center, ${data.liveNowId ? "rgba(255,40,40,0.16)" : "rgba(201,168,76,0.10)"}, transparent 65%)` }} />
      <div className="relative mb-12 md:mb-16 flex flex-col items-center text-center gap-8">
        <div>
          {/* Neon sign on the wall: the LIVE box lights up red while streaming */}
          <NeonSign live={!!data.liveNowId} />
          <p className="mt-4 max-w-xl mx-auto md:text-lg" style={{ color: "rgba(255,255,255,0.7)" }}>
            {data.liveNowId ? "We're live right now. Pull up." : "Live streams, studio sessions and clips from the Luchi Beats channel."}
          </p>
          {stats.length > 0 && (
            <p className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs md:text-sm font-mono tracking-widest uppercase" style={{ color: "var(--fire-light)" }}>
              {stats.map((t, i) => <span key={i} className="flex items-center gap-3">{i > 0 && <span style={{ color: "rgba(255,255,255,0.25)" }}>/</span>}{t}</span>)}
            </p>
          )}
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <a href={`${YT_CHANNEL_URL}?sub_confirmation=1`} target="_blank" rel="noopener noreferrer" data-magnetic
            className="btn-gold inline-flex items-center gap-2 px-6 py-3 rounded text-sm tracking-wide">
            <Bell size={16} /> Subscribe
          </a>
          <a href={`${YT_CHANNEL_URL}/streams`} target="_blank" rel="noopener noreferrer" data-magnetic
            className="btn-outline inline-flex items-center gap-2 px-6 py-3 rounded text-sm tracking-wide">
            <MonitorPlay size={16} /> YouTube
          </a>
        </div>
      </div>

      {empty ? (
        <div className="card-surface rounded-lg p-10 text-center">
          <p className="text-white font-bold mb-2">Videos are loading slowly right now.</p>
          <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>Catch every stream and upload on the YouTube channel.</p>
          <a href={`${YT_CHANNEL_URL}/streams`} target="_blank" rel="noopener noreferrer" className="btn-gold px-8 py-3 rounded text-sm">Watch on YouTube</a>
        </div>
      ) : (
        <LiveVideos {...data} />
      )}
    </div>
    </>
  );
}
