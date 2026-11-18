"use client";
import { motion } from "motion/react";
import { Truck, ShieldCheck, Package } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
  return (
    <div className="flex flex-col min-h-screen justify-between bg-white overflow-hidden relative">
      
      {/* Background Image Container - Anchored right on mobile to leave left side clear for text */}
      <div 
        className="absolute inset-0 z-0 bg-[url('/images/mobilehero.webp')] md:bg-[url('/images/hero-image.webp')] bg-cover bg-[85%_top] sm:bg-[80%_center] md:bg-top pointer-events-none"
      />

      {/* Top spacer to push content below the absolute header */}
      <div className="h-20 sm:h-24 md:h-32 shrink-0" />

      {/* Hero Typography & Content Overlay - strictly left-aligned and width-constrained on mobile */}
      <div className="flex flex-grow flex-col justify-start md:justify-center relative z-10 px-5 sm:px-8 md:pl-20 lg:pl-[12%] py-4 sm:py-6 md:py-12">
        <div className="space-y-3 sm:space-y-4 md:space-y-6 max-w-[60%] sm:max-w-[52%] md:max-w-2xl">
          
          {/* Main Title */}
          <motion.h1 
            className="font-serif font-normal text-2xl sm:text-3xl md:text-5xl lg:text-[5.5rem] leading-[1.15] md:leading-[1.08] text-[#111111]"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            Luxury Watches<br />Without Luxury<br className="md:hidden" /> Markups.
          </motion.h1>

          {/* Body Subtitle */}
          <motion.p 
            className="text-[11px] sm:text-xs md:text-base text-gray-700 max-w-[210px] sm:max-w-xs md:max-w-md leading-relaxed font-sans font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Premium timepieces crafted for those who value style, precision and confidence.
          </motion.p>

        </div>

        {/* Shop Call to Action Button */}
        <motion.div
          className="mt-4 sm:mt-6 md:mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Link
            href="/watches"
            className="bg-[#b38a5c] hover:bg-[#9c754a] text-white text-[9px] sm:text-xs font-bold tracking-widest uppercase py-2.5 px-5 sm:py-3.5 sm:px-8 md:py-4.5 md:px-10 transition-all inline-flex items-center gap-2 sm:gap-3 w-fit shadow-md cursor-pointer hover:shadow-lg hover:scale-[1.02] transform duration-300"
          >
            Shop Collection <span className="text-[10px] sm:text-sm">→</span>
          </Link>
        </motion.div>
      </div>

      {/* Bottom Features Banner - Visible on both mobile and desktop */}
      <div className="bg-black text-white py-3.5 sm:py-5 md:py-8 relative z-10 border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-6 grid grid-cols-3 divide-x divide-white/10">
          
          {/* Column 1: Free Shipping */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3 md:gap-4 px-1.5 sm:px-4 text-center sm:text-left">
            <Truck className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 text-[#b38a5c] shrink-0" />
            <div>
              <p className="font-sans text-[8px] sm:text-xs md:text-sm font-bold tracking-wider sm:tracking-widest uppercase text-white leading-tight">Free Shipping</p>
              <p className="font-sans text-[7px] sm:text-[10px] md:text-xs text-gray-400 font-semibold mt-0.5 leading-none">on Prepaid Orders</p>
            </div>
          </div>

          {/* Column 2: Warranty */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3 md:gap-4 px-1.5 sm:px-4 text-center sm:text-left">
            <ShieldCheck className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 text-[#b38a5c] shrink-0" />
            <div>
              <p className="font-sans text-[8px] sm:text-xs md:text-sm font-bold tracking-wider sm:tracking-widest uppercase text-white leading-tight">6 Months Warranty</p>
              <p className="font-sans text-[7px] sm:text-[10px] md:text-xs text-gray-400 font-semibold mt-0.5 leading-none">Quality you can trust</p>
            </div>
          </div>

          {/* Column 3: Packaging */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3 md:gap-4 px-1.5 sm:px-4 text-center sm:text-left">
            <Package className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 text-[#b38a5c] shrink-0" />
            <div>
              <p className="font-sans text-[8px] sm:text-xs md:text-sm font-bold tracking-wider sm:tracking-widest uppercase text-white leading-tight">Safety Packaging</p>
              <p className="font-sans text-[7px] sm:text-[10px] md:text-xs text-gray-400 font-semibold mt-0.5 leading-none">Carefully packed</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
