import React from "react";
import { cardImageUrl } from "@/lib/cloudinaryUrl";

/**
 * ResponsiveImage — renders an optimized <img> tag with direct Cloudinary delivery.
 *
 * Why direct Cloudinary delivery instead of next/image:
 *   1. Bypasses Vercel's 5,000 monthly image optimization quota on Hobby (Free) Tier.
 *   2. Prevents Vercel edge nodes from downloading raw unoptimized images from Cloudinary
 *      on cold cache misses.
 *   3. Leverages Cloudinary's global Fastly/Akamai CDN edge caching (max-age=2592000, 30 days)
 *      with f_auto (WebP/AVIF), q_auto, and c_limit dimensions.
 *   4. Keeps CLS at 0 by providing explicit width and height attributes.
 *
 * Props:
 *   src        – Image URL (Cloudinary or static path)
 *   alt        – Alternative text
 *   width      – Natural / container width in px (default 400)
 *   height     – Natural / container height in px (default 400)
 *   priority   – true for LCP images (eager + high fetchPriority), false for lazy
 *   className  – Tailwind CSS classes
 */
export function ResponsiveImage({
  height = 400,
  width = 400,
  src = "",
  alt = "",
  className = "",
  priority = false,
  sizes, // accepted for backward compatibility
  ...props
}) {
  const isCloudinary = src && typeof src === "string" && src.includes("res.cloudinary.com");
  const isR2 = src && typeof src === "string" && (src.includes("images.dripessential.in") || src.includes(".r2."));
  const displayWidth = width > 0 ? width : 400;

  const optimizedSrc = isCloudinary || isR2
    ? cardImageUrl(src, displayWidth)
    : src || "/images/image.png";

  // Filter out any Next.js-specific props that shouldn't reach a native <img>
  const { unoptimized, fill, blurDataURL, placeholder, loader, ...imgProps } = props;

  return (
    <img
      src={optimizedSrc}
      alt={alt || "Image"}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      className={className}
      {...imgProps}
    />
  );
}

export default ResponsiveImage;
