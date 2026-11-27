"use client";

import { useState, useRef } from "react";
import { Upload, X, Star, Loader2 } from "lucide-react";
import { thumbnailImage } from "@/lib/cloudflareImage";

/**
 * R2 Image Uploader — uploads directly to Cloudflare R2 via /api/upload/r2
 * Preserves the exact filename of each image file.
 */
export default function R2ImageUploader({
  images = [],
  imagePublicIds = [],
  mainImage = "",
  onChange,
  maxFiles = 8,
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > maxFiles) {
      setUploadError(`Maximum of ${maxFiles} images allowed.`);
      return;
    }

    setUploadError("");
    setUploading(true);

    try {
      const formData = new FormData();
      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          throw new Error(`File "${file.name}" is not an image.`);
        }
        if (file.size > 15 * 1024 * 1024) {
          throw new Error(`File "${file.name}" exceeds the 15MB limit.`);
        }
        formData.append("files", file);
      }

      const res = await fetch("/api/upload/r2", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Upload failed.");
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Upload failed.");
      }

      const newImages = [...images];
      const newPublicIds = [...imagePublicIds];

      for (const result of data.images) {
        newImages.push(result.url);
        newPublicIds.push(result.publicId);
      }

      const primary = mainImage || newImages[0] || "";

      onChange({
        images: newImages,
        imagePublicIds: newPublicIds,
        mainImage: primary,
      });
    } catch (err) {
      console.error("R2 upload error:", err);
      setUploadError(err.message || "Failed to upload image(s).");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = (index) => {
    const removedImg = images[index];
    const newImages = images.filter((_, i) => i !== index);
    const newPublicIds = imagePublicIds.filter((_, i) => i !== index);

    let newMain = mainImage;
    if (newMain === removedImg) newMain = newImages[0] || "";

    onChange({
      images: newImages,
      imagePublicIds: newPublicIds,
      mainImage: newMain,
    });
  };

  const handleSetMain = (url) => {
    onChange({
      images,
      imagePublicIds,
      mainImage: url,
    });
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center transition-all cursor-pointer ${
          uploading
            ? "border-zinc-300 bg-zinc-50 cursor-not-allowed"
            : "border-zinc-300 bg-zinc-50/50 hover:border-black hover:bg-zinc-100/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-900" />
            <p className="text-xs font-semibold tracking-wider text-zinc-700 uppercase">
              Uploading to Cloudflare R2...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white border border-zinc-200 shadow-sm text-zinc-800">
              <Upload className="h-5 w-5" />
            </div>
            <p className="text-xs font-bold tracking-widest text-zinc-900 uppercase mt-1">
              Click or drag to upload images
            </p>
            <p className="text-[11px] text-zinc-500 font-medium">
              Exact filename preserved. Uploads directly to Cloudflare R2 at /products/.
            </p>
          </div>
        )}
      </div>

      {uploadError && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-600 font-medium">
          {uploadError}
        </div>
      )}

      {/* Preview Grid */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-widest uppercase text-zinc-400">
              Uploaded Images ({images.length})
            </span>
            <span className="text-[11px] text-zinc-500">
              Click the star to set as main image
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {images.map((url, idx) => {
              const isMain = url === mainImage || (!mainImage && idx === 0);
              return (
                <div
                  key={url + idx}
                  className={`group relative aspect-square rounded-lg overflow-hidden border bg-white shadow-sm transition-all ${
                    isMain ? "border-black ring-2 ring-black" : "border-zinc-200"
                  }`}
                >
                  <img
                    src={thumbnailImage(url)}
                    alt={`Preview ${idx}`}
                    className="h-full w-full object-contain p-2 mix-blend-multiply"
                  />

                  {isMain && (
                    <span className="absolute top-1.5 left-1.5 bg-black text-white text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded uppercase">
                      Main
                    </span>
                  )}

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!isMain && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetMain(url);
                        }}
                        title="Set as main image"
                        className="rounded-full bg-white p-1.5 text-zinc-800 hover:text-black shadow"
                      >
                        <Star className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(idx);
                      }}
                      title="Remove image"
                      className="rounded-full bg-white p-1.5 text-red-600 hover:text-red-700 shadow"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
