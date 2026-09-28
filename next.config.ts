import type { NextConfig } from "next";

// Content Security Policy. Scripts are limited to this site (inline allowed because pages are
// statically rendered — nonces would force every page dynamic). Admin uploads PUT straight to R2,
// and the 3D background's lighting preset loads from raw.githack.com.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "media-src 'self' blob: https://cdn.luchibeats.com https://*.r2.cloudflarestorage.com https://*.public.blob.vercel-storage.com",
  "connect-src 'self' blob: https://cdn.luchibeats.com https://*.r2.cloudflarestorage.com https://raw.githack.com https://raw.githubusercontent.com",
  "frame-src https://www.youtube-nocookie.com https://www.youtube.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  // Dev mode needs eval for hot reload, so the CSP only applies to production builds
  ...(process.env.NODE_ENV === "production" ? [{ key: "Content-Security-Policy", value: csp }] : []),
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  turbopack: {},
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
