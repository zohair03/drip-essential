"use client";
import { motion } from "motion/react";
import { Truck, ShieldCheck, Package } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
  return (
    <div className="flex flex-col min-h-screen justify-between bg-white overflow-hidden relative">
      
      {/* Background Image Container */}
      <div 
        className="absolute inset-0 z-0 bg-[url('/images/mobilehero.webp')] md:bg-[url('/images/hero-image.webp')] bg-cover bg-center md:bg-top pointer-events-none"
      />

      {/* Top spacer to push content below the absolute header */}
      <div className="h-24 sm:h-28 md:h-32 shrink-0" />

      {/* Hero Typography & Content Overlay */}
      <div className="flex flex-grow flex-col justify-center relative z-10 px-6 sm:px-10 md:pl-20 lg:pl-[12%] py-8 md:py-12">
        <div className="space-y-4 md:space-y-6 max-w-xl md:max-w-2xl">
          
          {/* Main Title */}
          <motion.h1 
            className="font-serif font-normal text-3xl sm:text-4xl md:text-5xl lg:text-[5.5rem] leading-[1.12] md:leading-[1.08] text-[#111111]"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            Luxury Watches<br />Without Luxury Markups.
          </motion.h1>

          {/* Body Subtitle */}
          <motion.p 
            className="text-xs sm:text-sm md:text-base text-gray-700 max-w-xs sm:max-w-sm md:max-w-md leading-relaxed font-sans font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Premium timepieces crafted for those<br /> who value style, precision and confidence.
          </motion.p>

        </div>

        {/* Shop Call to Action Button */}
        <motion.div
          className="mt-6 sm:mt-8 md:mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Link
            href="/watches"
            className="bg-[#b38a5c] hover:bg-[#9c754a] text-white text-[10px] sm:text-xs font-bold tracking-widest uppercase py-3.5 px-7 sm:py-4 sm:px-8 md:py-4.5 md:px-10 transition-all inline-flex items-center gap-2.5 sm:gap-3 w-fit shadow-md cursor-pointer hover:shadow-lg hover:scale-[1.02] transform duration-300"
          >
            Shop Collection <span className="text-xs sm:text-sm">→</span>
          </Link>
        </motion.div>
      </div>

      {/* DESKTOP-ONLY: Bottom Features Banner */}
      <div className="hidden md:block bg-black text-white py-8 relative z-10 border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-3 divide-x divide-white/10">
          
          {/* Column 1: Free Shipping */}
          <div className="flex flex-row items-center justify-center gap-4 px-4 text-left">
            <Truck className="w-8 h-8 text-[#b38a5c] shrink-0" />
            <div>
              <p className="font-sans text-xs md:text-sm font-bold tracking-widest uppercase text-white leading-tight">Free Shipping</p>
              <p className="font-sans text-xs text-gray-400 font-semibold mt-0.5 leading-none">on Prepaid Orders</p>
            </div>
          </div>

          {/* Column 2: Warranty */}
          <div className="flex flex-row items-center justify-center gap-4 px-4 text-left">
            <ShieldCheck className="w-8 h-8 text-[#b38a5c] shrink-0" />
            <div>
              <p className="font-sans text-xs md:text-sm font-bold tracking-widest uppercase text-white leading-tight">6 Months Warranty</p>
              <p className="font-sans text-xs text-gray-400 font-semibold mt-0.5 leading-none">Quality you can trust</p>
            </div>
          </div>

          {/* Column 3: Packaging */}
          <div className="flex flex-row items-center justify-center gap-4 px-4 text-left">
            <Package className="w-8 h-8 text-[#b38a5c] shrink-0" />
            <div>
              <p className="font-sans text-xs md:text-sm font-bold tracking-widest uppercase text-white leading-tight">Safety Packaging</p>
              <p className="font-sans text-xs text-gray-400 font-semibold mt-0.5 leading-none">Carefully packed for protection</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
