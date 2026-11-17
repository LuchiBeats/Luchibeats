import type { Metadata } from "next";
import { MonitorPlay, Bell } from "lucide-react";
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-12">
      <div className="mb-10 md:mb-14 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <p className="text-xs tracking-[0.3em] mb-2" style={{ color: "var(--gold)" }}>ON YOUTUBE</p>
          <h1 className="section-title">Luchi Beats Live</h1>
          <p className="mt-3 max-w-xl" style={{ color: "var(--muted)" }}>
            Live streams, studio sessions and clips from the Luchi Beats channel.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a href={`${YT_CHANNEL_URL}?sub_confirmation=1`} target="_blank" rel="noopener noreferrer"
            className="btn-gold inline-flex items-center gap-2 px-6 py-3 rounded text-sm tracking-wide">
            <Bell size={16} /> Subscribe
          </a>
          <a href={`${YT_CHANNEL_URL}/streams`} target="_blank" rel="noopener noreferrer"
            className="btn-outline inline-flex items-center gap-2 px-6 py-3 rounded text-sm tracking-wide">
            <MonitorPlay size={16} /> Open Channel
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
  );
}
