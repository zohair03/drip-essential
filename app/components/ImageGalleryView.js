"use client";

import { useState, useMemo } from "react";
import Image from "next/image";

export default function ImageGalleryView({ initialImages = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeModalImage, setActiveModalImage] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Group images into categories: "my-uploads" vs "samples"
  const categories = [
    { id: "all", label: "All Images" },
    { id: "uploads", label: "Your Uploads" },
    { id: "samples", label: "Cloudinary Samples" },
  ];

  const filteredImages = useMemo(() => {
    return initialImages.filter((img) => {
      const isSample =
        img.public_id.startsWith("samples/") ||
        img.public_id.startsWith("cld-sample");

      if (selectedCategory === "uploads" && isSample) return false;
      if (selectedCategory === "samples" && !isSample) return false;

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = img.public_id.toLowerCase().includes(query);
        const matchesFormat = (img.format || "").toLowerCase().includes(query);
        return matchesName || matchesFormat;
      }

      return true;
    });
  }, [initialImages, selectedCategory, searchTerm]);

  const handleCopy = (id, url) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full">
      {/* Filter and Search Bar */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-900"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search images or format..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-full border border-zinc-200 bg-white py-2 pl-4 pr-10 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-2.5 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Image Counter */}
      <div className="mb-4 text-xs font-medium uppercase tracking-wider text-zinc-400">
        Showing {filteredImages.length} of {initialImages.length} assets
      </div>

      {/* Grid of Images */}
      {filteredImages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center text-zinc-500 dark:border-zinc-800">
          No images matched your filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredImages.map((img) => {
            const isCopied = copiedId === img.public_id;
            return (
              <div
                key={img.public_id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
              >
                {/* Image Container */}
                <div
                  onClick={() => setActiveModalImage(img)}
                  className="relative aspect-square w-full cursor-pointer overflow-hidden bg-zinc-100 dark:bg-zinc-800"
                >
                  <Image
                    src={img.secure_url}
                    alt={img.public_id}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />

                  {/* Format Badge */}
                  <span className="absolute left-3 top-3 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                    {img.format || "img"}
                  </span>
                </div>

                {/* Details Bar */}
                <div className="flex flex-1 flex-col justify-between p-4">
                  <div>
                    <h3
                      title={img.public_id}
                      className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                    >
                      {img.public_id}
                    </h3>
                    <div className="mt-1 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                      <span>
                        {img.width} × {img.height} px
                      </span>
                      <span>{formatFileSize(img.bytes)}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                    <button
                      onClick={() => handleCopy(img.public_id, img.secure_url)}
                      className="flex-1 rounded-lg bg-zinc-100 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                    >
                      {isCopied ? "✓ Copied Link" : "Copy URL"}
                    </button>
                    <a
                      href={img.secure_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-zinc-200 p-1.5 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                      title="Open full size in new tab"
                    >
                      ↗
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {activeModalImage && (
        <div
          onClick={() => setActiveModalImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[90vh] max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-zinc-900"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {activeModalImage.public_id}
                </h2>
                <p className="text-xs text-zinc-500">
                  {activeModalImage.width} × {activeModalImage.height} px •{" "}
                  {formatFileSize(activeModalImage.bytes)}
                </p>
              </div>
              <button
                onClick={() => setActiveModalImage(null)}
                className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              >
                ✕
              </button>
            </div>

            {/* Modal Image */}
            <div className="relative flex max-h-[70vh] min-h-[300px] w-full items-center justify-center bg-zinc-950 p-4">
              <Image
                src={activeModalImage.secure_url}
                alt={activeModalImage.public_id}
                width={activeModalImage.width || 1200}
                height={activeModalImage.height || 800}
                className="max-h-[65vh] w-auto rounded-lg object-contain"
                priority
              />
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50 px-6 py-3 dark:border-zinc-800 dark:bg-zinc-900/50">
              <span className="text-xs font-mono text-zinc-500 truncate max-w-md">
                {activeModalImage.secure_url}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleCopy(activeModalImage.public_id, activeModalImage.secure_url)
                  }
                  className="rounded-lg bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  {copiedId === activeModalImage.public_id ? "Copied!" : "Copy URL"}
                </button>
                <a
                  href={activeModalImage.secure_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  Open Original ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
