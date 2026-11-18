import React from "react";
import Image from "next/image";

export function ResponsiveImage({
  src = "",
  alt = "",
  className = "",
  ...props
}) {
  return (
    <Image
      src={src}
      alt={alt || "Image"}
      width={400}
      height={300}
      unoptimized
      className={className}
      {...props}
    />
  );
}

export default ResponsiveImage;
