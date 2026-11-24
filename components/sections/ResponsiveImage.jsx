import React from "react";
import Image from "next/image";
import { cardImageUrl } from "@/lib/cloudinaryUrl";

/**
 * ResponsiveImage — wraps next/image with:
 *  - Automatic Cloudinary f_auto,q_auto,w_{width} transformations
 *  - Lazy loading by default (eager for LCP images via priority prop)
 *  - Explicit width/height to prevent CLS
 *
 * Props:
 *  src        – Image URL (Cloudinary or other)
 *  alt        – Alt text
 *  width      – Intrinsic width (also used to set Cloudinary transform width)
 *  height     – Intrinsic height
 *  priority   – true → eager load + fetchpriority=high (use for LCP images)
 *  className  – Additional CSS classes
 *  ...rest    – Any other next/image props
 */
export function ResponsiveImage({
  height = 300,
  width = 200,
  src = "",
  alt = "",
  className = "",
  priority = false,
  ...props
}) {
  // Apply Cloudinary optimisation transforms; non-Cloudinary URLs pass through unchanged
  const optimisedSrc = cardImageUrl(src, width > 0 ? width : 400);

  return (
    <Image
      src={optimisedSrc || "/images/image.png"}
      alt={alt || "Image"}
      width={width}
      height={height}
      priority={priority}
      className={className}
      {...props}
    />
  );
}

export default ResponsiveImage;

