import HeroSection from "@/components/sections/HeroSection"
import BrandCategoriesSection from "@/components/sections/BrandCategoriesSection"
import WatchShowcase from "@/components/sections/WatchShowcase"
import AllTimeFavourites from "@/components/sections/AllTimeFavSection"

export const metadata = {
  title: "Drip Essentials | Luxury Watches",
  description: "Drip Essentials is your one-stop destination for luxury watches. Shop the latest collections from top brands and find your perfect timepiece today!",
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
