"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useProducts } from "../context/ProductContext";
import { ResponsiveImage } from "./ResponsiveImage";

export function BrandCategoriesSection() {
  const router = useRouter();
  const { featuredBrands } = useProducts();

  const brands =
    featuredBrands && featuredBrands.length > 0
      ? featuredBrands
          .filter((b) => b.isVisible)
          .sort((a, b) => a.order - b.order)
          .map((b) => ({
            name: b.name,
            image: b.logoUrl,
          }))
      : [
          { name: "ROLEX", image: "/images/image.png" },
          { name: "OMEGA", image: "/images/image.png" },
          { name: "TAG HEUER", image: "/images/image.png" },
          { name: "TUDOR", image: "/images/image.png" },
          { name: "RADO", image: "/images/image.png" },
          { name: "LOUIS ERARD", image: "/images/image.png" },
          { name: "G-SHOCK", image: "/images/image.png" },
          { name: "FOSSIL", image: "/images/image.png" },
        ];

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
              <motion.div
                key={brand.name}
                onClick={() =>
                  router.push(`/watches/${brand.name.toLowerCase()}`)
                }
                className="group cursor-pointer flex-shrink-0 flex flex-col items-center justify-between bg-white w-[280px]"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                }}
                viewport={{ once: true }}
              >
                <div className="w-full h-[220px] flex items-center justify-center overflow-hidden mb-6">
                  <ResponsiveImage
                    src= "/images/image.png"
                    alt="image"
                    widths={[150, 300, 500]}
                    sizes="(max-width: 768px) 150px, 300px"
                    className="max-w-[95%] max-h-[95%] object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
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
              </motion.div>
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
