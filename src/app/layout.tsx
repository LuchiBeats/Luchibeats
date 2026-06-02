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
        {/* Faded logo watermark with heat-shimmer flame animation */}
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center"
        >
          <svg style={{ position: "absolute", width: 0, height: 0 }}>
            <defs>
              <filter id="fireWarp" x="-5%" y="-30%" width="110%" height="150%" colorInterpolationFilters="sRGB">
                <feTurbulence type="fractalNoise" baseFrequency="0.006 0.04" numOctaves="3" result="turb">
                  <animate attributeName="seed" from="0" to="50" dur="0.4s" repeatCount="indefinite" calcMode="discrete" />
                  <animate attributeName="baseFrequency" values="0.006 0.04;0.008 0.05;0.005 0.035;0.007 0.045;0.006 0.04" dur="2.5s" repeatCount="indefinite" />
                </feTurbulence>
                <feDisplacementMap in="SourceGraphic" in2="turb" scale="9" xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </defs>
          </svg>

          <div className="relative w-[70vw] max-w-2xl">
            <img src="/logo.png" alt="" className="w-full select-none" style={{ opacity: 0.12 }} />
            <img
              src="/logo.png" alt=""
              className="w-full select-none absolute inset-0 hidden md:block"
              style={{ opacity: 0.22, filter: "url(#fireWarp) brightness(1.4)" }}
            />
          </div>
        </div>
        <CustomCursor />
        <main className="relative z-10 flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
