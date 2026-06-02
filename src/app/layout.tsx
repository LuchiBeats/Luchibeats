import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import CustomCursor from "@/components/CustomCursor";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LuchiBeats — Premium Beats & Mixing Services",
  description: "Buy premium beats, book professional mixing services, and discover spotlighted artists — all in one place.",
  openGraph: {
    title: "LuchiBeats — Premium Beats & Mixing Services",
    description: "Buy premium beats, book professional mixing services, and discover spotlighted artists — all in one place.",
    url: "https://www.luchibeats.com",
    siteName: "LuchiBeats",
    images: [{ url: "https://www.luchibeats.com/og-image.png", width: 1200, height: 630, alt: "LuchiBeats" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LuchiBeats — Premium Beats & Mixing Services",
    description: "Buy premium beats, book professional mixing services, and discover spotlighted artists — all in one place.",
    images: ["https://www.luchibeats.com/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CustomCursor />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
