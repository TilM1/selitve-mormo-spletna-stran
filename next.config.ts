import type { NextConfig } from "next";

const apex = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://selitve-mormo.si").host;

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: { formats: ["image/avif", "image/webp"] },
  async headers() {
    return [
      {
        // Hero files are never changed in place: a new encode gets a new file name (e.g. .v2.mp4).
        source: "/hero/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  async redirects() {
    // One preferred hostname: www → apex. (Set the same in the hosting dashboard.)
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: `www.${apex}` }],
        destination: `https://${apex}/:path*`,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
