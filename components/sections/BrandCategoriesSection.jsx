"use client";

import { useRouter } from "next/navigation";
import { useProducts, defaultFeaturedBrands } from "../context/ProductContext";
import { ResponsiveImage } from "./ResponsiveImage";

export function BrandCategoriesSection() {
  const router = useRouter();
  const { featuredBrands } = useProducts();

  const brands =
    featuredBrands && featuredBrands.length > 0
      ? featuredBrands
          .filter((b) => b.isVisible !== false)
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((b) => ({
            id: b.id,
            name: b.name,
            slug: b.slug || b.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            image: b.image || b.logoUrl || "/images/image.png",
          }))
      : defaultFeaturedBrands.map((b) => ({
          name: b.name,
          slug: b.slug,
          image: b.image || b.logoUrl,
        }));

  return (
    <section className="py-20 bg-white">
      <div className="max-w-[1600px] mx-auto px-6">
        <h2
          className="text-center uppercase tracking-widest mb-12"
          style={{
            fontFamily: "Bebas Neue, sans-serif",
            fontSize: "clamp(3rem, 8vw, 5rem)",
          }}
        >
          Shop By Brand
        </h2>

        <div className="overflow-x-auto scrollbar-hide">
          <div
            className="flex gap-0 md:gap-4 pb-4"
            style={{ width: "max-content" }}
          >
            {brands.map((brand, index) => (
              <div
                key={brand.id || brand.slug || brand.name}
                onClick={() =>
                  router.push(
                    `/watches?brand=${encodeURIComponent(brand.name)}`
                  )
                }
                className="group cursor-pointer flex-shrink-0 flex flex-col items-center justify-between bg-white w-fit"
              >
                <div className="w-fit h-fit md:h-[220px] flex items-center justify-center overflow-hidden mb-2">
                  <ResponsiveImage
                    height={190}
                    width={190}
                    src={brand.image || "/images/image.png"}
                    alt={brand.name}
                    sizes="(max-width: 768px) 190px, 190px"
                    className="max-w-[90%] max-h-[90%] object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                <h3
                  className="text-black uppercase tracking-widest text-center font-bold"
                  style={{
                    fontFamily: "Oswald, sans-serif",
                    fontSize: "1.5rem",
                  }}
                >
                  {brand.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}

export default BrandCategoriesSection;
