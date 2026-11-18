"use client";
import { Heart } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useProducts } from "../context/ProductContext";
import { ResponsiveImage } from "./ResponsiveImage";

export default function AllTimeFavourites() {
  const { products, bestsellerWatches } = useProducts();
  const router = useRouter();

  // Curated best-selling watches managed by admin, or fallback to active products
  const favourites =
    bestsellerWatches && bestsellerWatches.length > 0
      ? bestsellerWatches.filter((p) => p.status !== "Draft").slice(0, 8)
      : products.filter((p) => p.status !== "Draft").slice(0, 8);

  return (
    <section id="favourites" className="py-10 md:py-20 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <div className="flex items-center justify-center mb-6 md:mb-12 border-b border-black/5 pb-2 md:pb-4">
          <h2
            className="uppercase tracking-widest text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center"
            style={{ fontFamily: "Bebas Neue, sans-serif" }}
          >
            Bestsellers
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-10">
          {favourites.map((watch, index) => (
            <motion.div
              key={watch.id}
              onClick={() => router.push(`/product/${watch.id}`)}
              className="group cursor-pointer border border-gray-100/50 hover:shadow-md transition-shadow duration-300 bg-white"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              viewport={{ once: true }}
            >
              {/* Image Container */}
              <div className="relative aspect-square overflow-hidden bg-white mb-2 md:mb-4">
                {/* Wishlist Heart */}
                <button
                  className="absolute top-2 right-2 md:top-4 md:right-4 z-10 bg-white/95 p-1.5 md:p-2 rounded-full hover:bg-white shadow-sm transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Heart className="w-3.5 h-3.5 md:w-5 md:h-5 text-black" />
                </button>

                {/* Watch Image */}
                <ResponsiveImage
                  src={watch.image}
                  alt={watch.name}
                  widths={[150, 300, 500]}
                  sizes="(max-width: 768px) 150px, (max-width: 1200px) 300px, 400px"
                  className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Product Info */}
              <div className="p-3 md:p-6 space-y-1 md:space-y-2 text-center">
                <p
                  className="uppercase tracking-widest text-[9px] md:text-xs text-gray-500 font-medium"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  {watch.brand}
                </p>

                <h3
                  className="uppercase tracking-wide text-xs md:text-base font-semibold text-black group-hover:text-gray-600 transition-colors line-clamp-2 h-8 md:h-12"
                  style={{ fontFamily: "Oswald, sans-serif" }}
                >
                  {watch.name}
                </h3>

                <p
                  className="text-xs md:text-lg font-bold text-black"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  ₹{watch.price}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <div className="flex justify-center mt-8 md:mt-12">
          <button
            onClick={() => router.push("/watches")}
            className="bg-black text-white text-xs uppercase tracking-widest px-8 py-3 hover:bg-gray-800 transition-all transform hover:scale-105"
          >
            View All
          </button>
        </div>
      </div>
    </section>
  );
}
