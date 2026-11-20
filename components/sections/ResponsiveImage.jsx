import React from "react";
import Image from "next/image";

export function ResponsiveImage({
  height = 300,
  width = 200,
  src = "",
  alt = "",
  className = "",
  ...props
}) {
  return (
    <Image
      src={src}
      alt={alt || "Image"}
      width={width}
      height={height}
      unoptimized
      className={className}
      {...props}
    />
  );
}

export default ResponsiveImage;
