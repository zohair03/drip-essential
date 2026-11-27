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
