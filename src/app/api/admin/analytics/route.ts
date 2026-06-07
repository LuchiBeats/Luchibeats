import { NextResponse } from "next/server";
import { getAnalytics, getBeats, getMessages, getSubscribers } from "@/lib/beats-store";
import { isAuthenticated } from "@/lib/admin-auth";



export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [analytics, beats, messages, subscribers] = await Promise.all([
    getAnalytics(),
    getBeats(),
    getMessages(),
    getSubscribers(),
  ]);
  return NextResponse.json({
    pageViews: analytics.pageViews,
    beatPlays: analytics.beatPlays,
    totalBeats: beats.length,
    totalMessages: messages.length,
    unreadMessages: messages.filter((m) => !m.read).length,
    totalSubscribers: subscribers.length,
    recentSubscribers: subscribers.slice(0, 5),
    recentMessages: messages.slice(0, 5),
    topBeats: beats
      .map((b) => ({ id: b.id, title: b.title, plays: analytics.beatPlays[b.id] ?? 0 }))
      .sort((a, b) => b.plays - a.plays)
      .slice(0, 5),
  });
}
