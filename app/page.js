import { getCloudinaryImages } from "@/lib/cloudinary";
import ImageGalleryView from "./components/ImageGalleryView";

export const metadata = {
  title: "Drip Essentials | Cloudinary Gallery",
  description: "Browse all images imported from Cloudinary for Drip Essentials",
};

export default async function Home() {
  let images = [];
  let error = null;

  try {
    images = await getCloudinaryImages(100);
  } catch (err) {
    error = err.message;
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 dark:bg-black dark:text-zinc-50">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-black/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-black text-sm tracking-widest">
              DE
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">DRIP ESSENTIALS</h1>
              <p className="text-[11px] font-medium text-zinc-500">Cloudinary Media Hub</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected: dnqbhqi6
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-zinc-200/60 bg-gradient-to-b from-white to-zinc-50/50 py-12 dark:border-zinc-800/60 dark:from-zinc-950 dark:to-black">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              Asset Catalog
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl text-zinc-950 dark:text-white">
              Cloudinary Media Gallery
            </h2>
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              All images synced live from your Cloudinary cloud (
              <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                dnqbhqi6
              </code>
              ). Click any image to view it full-size, or copy its optimized CDN URL.
            </p>
          </div>
        </div>
      </section>

      {/* Main Gallery Area */}
      <main className="mx-auto max-w-7xl px-6 py-10">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            <h3 className="font-bold text-base">Error Loading Images</h3>
            <p className="mt-1 text-sm">{error}</p>
            <p className="mt-3 text-xs text-red-600 dark:text-red-400">
              Please verify your Cloudinary credentials in <code>.env.local</code>.
            </p>
          </div>
        ) : (
          <ImageGalleryView initialImages={images} />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-zinc-200 bg-white py-8 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950">
        <p>Drip Essentials • Powered by Next.js & Cloudinary</p>
      </footer>
    </div>
  );
}
