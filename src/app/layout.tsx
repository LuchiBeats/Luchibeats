import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import CustomCursor from "@/components/CustomCursor";
import PWARegister from "@/components/PWARegister";
import PageTracker from "@/components/PageTracker";
import VisibilityPause from "@/components/VisibilityPause";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LuchiBeats — Premium Beats & Production",
  description: "Buy premium beats — all in one place.",
  applicationName: "LuchiBeats",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LuchiBeats",
  },
  formatDetection: { telephone: false },
  openGraph: {
    title: "LuchiBeats — Premium Beats & Production",
    description: "Buy premium beats — all in one place.",
    url: "https://www.luchibeats.com",
    siteName: "LuchiBeats",
    images: [{ url: "https://www.luchibeats.com/og-image.png", width: 1200, height: 630, alt: "LuchiBeats" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LuchiBeats — Premium Beats & Production",
    description: "Buy premium beats — all in one place.",
    images: ["https://www.luchibeats.com/og-image.png"],
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
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
        <PWARegister />
        <PageTracker />
        <VisibilityPause />
        <CustomCursor />
        <main className="relative z-10 flex-1">{children}</main>
        {/* Logo sign-off at the bottom of every page, with the heat-shimmer flame effect.
            It used to be pinned behind the content, where photos and text ran into it. */}
        <div aria-hidden="true" className="relative z-10 pointer-events-none flex justify-center pt-16 -mb-12">
          <svg style={{ position: "absolute", width: 0, height: 0 }}>
            <defs>
              <filter id="fireWarp" x="-5%" y="-30%" width="110%" height="150%" colorInterpolationFilters="sRGB">
                <feTurbulence type="fractalNoise" baseFrequency="0.006 0.04" numOctaves="3" result="turb">
                  <animate attributeName="baseFrequency" values="0.006 0.04;0.008 0.05;0.005 0.035;0.007 0.045;0.006 0.04" dur="6s" repeatCount="indefinite" />
                </feTurbulence>
                <feDisplacementMap in="SourceGraphic" in2="turb" scale="9" xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </defs>
          </svg>
          <div className="relative w-[70vw] max-w-lg">
            <img src="/logo.png" alt="" className="w-full select-none" style={{ opacity: 0.25 }} />
            <img
              src="/logo.png" alt=""
              className="w-full select-none absolute inset-0 hidden md:block"
              style={{ opacity: 0.4, filter: "url(#fireWarp) brightness(1.4)" }}
            />
          </div>
        </div>
        <Footer />
      </body>
    </html>
  );
}
