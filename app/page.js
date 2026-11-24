import dynamic from "next/dynamic";
import HeroSection from "@/components/sections/HeroSection";

// Dynamically import below-fold sections — they are not needed on initial render,
// so splitting them into separate JS chunks reduces TBT and speeds up FCP.
const BrandCategoriesSection = dynamic(
  () => import("@/components/sections/BrandCategoriesSection"),
  { ssr: true }
);
const WatchShowcase = dynamic(
  () => import("@/components/sections/WatchShowcase"),
  { ssr: true }
);
const AllTimeFavourites = dynamic(
  () => import("@/components/sections/AllTimeFavSection"),
  { ssr: true }
);

export const metadata = {
  title: "Drip Essentials",
  description: "Drip Essentials is your one-stop destination for luxury watches. Shop the latest collections from top brands and find your perfect timepiece today!",
};

export default async function Home() {
  return (
    <>
      {/* HeroSection is statically imported — it is the LCP element and must render immediately */}
      <HeroSection />
      {/* Below-fold sections are code-split to reduce initial JS bundle */}
      <BrandCategoriesSection />
      <WatchShowcase />
      <AllTimeFavourites />
    </>
  );
}
