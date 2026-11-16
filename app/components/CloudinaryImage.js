import Image from "next/image";
import { getCloudinaryUrl } from "@/lib/cloudinary";

/**
 * CloudinaryImage Component
 * Accepts a Cloudinary public_id (e.g. "0.2767215335533455") or full secure_url.
 */
export default function CloudinaryImage({
  src,
  alt = "Cloudinary Image",
  width,
  height,
  fill,
  sizes,
  options = {},
  className = "",
  priority = false,
  ...props
}) {
  const imageUrl = getCloudinaryUrl(src, {
    width: typeof width === "number" ? width : undefined,
    height: typeof height === "number" ? height : undefined,
    ...options,
  });

  return (
    <Image
      src={imageUrl}
      alt={alt}
      width={fill ? undefined : width || 800}
      height={fill ? undefined : height || 800}
      fill={fill}
      sizes={sizes}
      className={className}
      priority={priority}
      {...props}
    />
  );
}
