/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.dripessential.in",
        pathname: "/**",
      },
    ],
    // Serve modern formats — browsers that support AVIF get ~50% smaller files
    formats: ["image/avif", "image/webp"],
    // Common device widths so Next.js generates the right srcset entries
    deviceSizes: [640, 768, 1024, 1280, 1600],
    imageSizes: [64, 128, 256, 400, 512],
    // Cache optimised images on Vercel CDN for up to 7 days
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },
  // Add Cache-Control headers for static assets and API responses
  async headers() {
    return [
      {
        // Cache brand logos and product images served via /api for 10 minutes on CDN
        source: "/api/brands",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=600, stale-while-revalidate=1200",
          },
        ],
      },
      {
        source: "/api/bestsellers",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=300, stale-while-revalidate=600",
          },
        ],
      },
      {
        source: "/api/showcase",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=300, stale-while-revalidate=600",
          },
        ],
      },
    ];
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
