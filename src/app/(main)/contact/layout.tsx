import type { Metadata } from "next";

// The contact page itself is interactive (client-side), so its title lives here
export const metadata: Metadata = {
  title: "Contact",
  description: "Work with Luchi Beats: custom beats, recording, mixing and mastering. Send a message and get a reply within 24–48 hours.",
  openGraph: { title: "Contact Luchi Beats", description: "Custom beats, recording, mixing and mastering." },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
