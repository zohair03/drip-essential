import CloudinaryImage from "./CloudinaryImage";
import { getCloudinaryImages } from "@/lib/cloudinary";

/**
 * Server Component that fetches all images from Cloudinary and renders them.
 */
export default async function CloudinaryGallery() {
  let images = [];
  let errorMessage = null;

  try {
    images = await getCloudinaryImages(30);
  } catch (error) {
    errorMessage = error.message;
  }

  if (errorMessage) {
    return (
      <div className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">
        <p className="font-semibold">Failed to fetch Cloudinary images:</p>
        <p className="text-sm">{errorMessage}</p>
      </div>
    );
  }

  if (images.length === 0) {
    return <p className="text-zinc-500">No images found in your Cloudinary account.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {images.map((img) => (
        <div
          key={img.public_id}
          className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="relative aspect-square w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
            <CloudinaryImage
              src={img.public_id}
              alt={img.public_id}
              width={600}
              height={600}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="p-3">
            <p className="truncate text-xs font-medium text-zinc-600 dark:text-zinc-300">
              {img.public_id}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
