import HeroSection from "@/components/sections/HeroSection"
import BrandCategoriesSection from "@/components/sections/BrandCategoriesSection"
import WatchShowcase from "@/components/sections/WatchShowcase"
import AllTimeFavourites from "@/components/sections/AllTimeFavSection"

export const metadata = {
  title: "Drip Essentials | Cloudinary Gallery",
  description: "Browse all images imported from Cloudinary for Drip Essentials",
};

export default async function Home() {


  return (
    <>
      <HeroSection />
      <BrandCategoriesSection/>
      <WatchShowcase/>
      <AllTimeFavourites/>
    </>

  );
}
