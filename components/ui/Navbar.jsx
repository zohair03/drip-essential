"use client";

import { Search, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useProducts } from "../context/ProductContext";


export default function Navbar({ theme = "light" }) {
  const isDark = theme === "dark";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const { products, featuredBrands } = useProducts();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when menu or search is open
  useEffect(() => {
    if (isMenuOpen || isSearchOpen) {
      document.body.classList.add(
        "overflow-hidden",
        "md:overflow-hidden"
      );
    } else {
      document.body.classList.remove(
        "overflow-hidden",
        "md:overflow-hidden"
      );
    }

    return () => {
      document.body.classList.remove(
        "overflow-hidden",
        "md:overflow-hidden"
      );
    };
  }, [isMenuOpen, isSearchOpen]);

  const isHomeActive = pathname === "/";
  const isCollectionsActive =
    pathname.startsWith("/watches") ||
    pathname.startsWith("/product");

  const handleBestSellersClick = (e) => {
    if (pathname === "/") {
      e.preventDefault();

      const el = document.getElementById("favourites");

      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      router.push("/watches");
    }
  };

  const handleAboutUsClick = (e) => {
    e.preventDefault();

    const el = document.getElementById("footer");

    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const brands =
    featuredBrands && featuredBrands.length > 0
      ? featuredBrands
        .filter((b) => b.isVisible)
        .sort((a, b) => a.order - b.order)
        .map((b) => b.name)
      : [
        "Rolex",
        "Omega",
        "Tag Heuer",
        "Seiko",
        "Rado",
        "Tudor",
        "Longines",
        "G-SHOCK",
        "Fossil",
      ];

  const searchSuggestions =
    searchQuery.trim() === ""
      ? []
      : products
        .filter(
          (p) =>
            p.status !== "Draft" &&
            (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.brand.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .slice(0, 5);

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    if (searchQuery.trim()) {
      setIsSearchOpen(false);

      router.push(
        `/watches?search=${encodeURIComponent(searchQuery.trim())}`
      );

      setSearchQuery("");
    }
  };

  return (
    <nav
      className={`z-50 font-['Playfair_Display'] fixed top-0 left-0 right-0 transition-all duration-300 ${isHomeActive
          ? isScrolled
            ? "bg-white/80 backdrop-blur-md border-b border-black/5 shadow-sm"
            : "bg-transparent"
          : isDark
            ? isScrolled
              ? "bg-black/80 backdrop-blur-md border-b border-white/5 shadow-sm"
              : "bg-black"
            : isScrolled
              ? "bg-white/80 backdrop-blur-md border-b border-black/5 shadow-sm"
              : "bg-transparent"
        }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="flex items-center justify-between">

          {/* Left: Hamburger / Desktop Navigation Links */}
          <div className="flex items-center z-50 gap-4">

            {/* Hamburger */}
            <button
              className={`transition-colors ${isDark && !isMenuOpen
                ? "text-white hover:text-gray-300"
                : "text-black hover:text-gray-600"
                }`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            {/* Desktop Navigation Links (Hidden on mobile & tablet, visible on lg+) */}
            <div
              className={`hidden lg:flex items-center gap-8 font-sans text-[11px] font-bold tracking-widest uppercase ${isDark ? "text-white" : "text-black"
                }`}
            >
              <Link
                href="/"
                className="hover:opacity-75 transition-opacity pb-0.5"
              >
                Home
              </Link>

              <Link
                href="/watches"
                className="hover:opacity-75 transition-opacity pb-0.5"
              >
                Collections
              </Link>

              <a
                href="/watches"
                onClick={handleBestSellersClick}
                className="hover:opacity-75 transition-opacity pb-0.5"
              >
                Best Sellers
              </a>

              <a
                href="#footer"
                onClick={handleAboutUsClick}
                className="hover:opacity-75 transition-opacity pb-0.5"
              >
                About Us
              </a>

            </div>
          </div>

          {/* Center: Logo */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 flex items-center z-50"
          >
            <img
              src="/images/logo.png"
              alt="Drip Essential"
              className={`h-10 sm:h-10 md:h-12 w-auto object-contain transition-all duration-300 ${isDark && !isMenuOpen ? "invert" : ""
                }`}
            />
          </Link>

          {/* Right: Icons */}
          <div
            className={`flex items-center gap-5 z-50 ${isDark ? "text-white" : "text-black"
              }`}
          >
            <button
              className="transition-colors hover:opacity-75 cursor-pointer"
              onClick={() => {
                setIsSearchOpen(true);
                setIsMenuOpen(false);
              }}
            >
              <Search className="w-5 h-5 md:w-[1.4rem] md:h-[1.4rem] stroke-[1.5]" />
            </button>
          </div>
        </div>

        {/* Fullscreen Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="fixed top-0 left-0 w-full h-[100dvh] bg-white/95 backdrop-blur-sm z-40 overflow-y-auto overscroll-contain text-black"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col items-center justify-start min-h-full pt-28 pb-16 px-6 w-full">
                <div className="flex flex-col items-center gap-8 text-2xl w-full max-w-2xl">

                  <Link
                    href="/"
                    onClick={() => setIsMenuOpen(false)}
                    className="hover:text-gray-500 transition-colors"
                  >
                    Home
                  </Link>

                  <Link
                    href="/watches"
                    onClick={() => setIsMenuOpen(false)}
                    className="hover:text-gray-500 transition-colors"
                  >
                    Watches
                  </Link>

                  <Link
                    href="/watches"
                    onClick={() => setIsMenuOpen(false)}
                    className="hover:text-gray-500 transition-colors"
                  >
                    Bestsellers
                  </Link>

                  <div className="flex flex-col items-center gap-4 mt-8">
                    <p className="text-gray-400 text-sm tracking-widest uppercase font-sans">
                      Brands
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-4 text-center text-lg">
                      {brands.map((brand) => (
                        <Link
                          key={brand}
                          href={`/watches/${brand.toLowerCase()}`}
                          onClick={() => setIsMenuOpen(false)}
                          className="hover:text-gray-500 transition-colors"
                        >
                          {brand}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <a
                    href="https://wa.me/919137722174"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsMenuOpen(false)}
                    className="mt-8 hover:text-gray-500 transition-colors"
                  >
                    Contact
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fullscreen Search Overlay */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              className="fixed top-0 left-0 w-full h-[100dvh] bg-white/95 backdrop-blur-sm z-40 overflow-y-auto overscroll-contain text-black"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col items-center justify-start min-h-full pt-32 px-6 w-full">

                <button
                  className="absolute top-8 right-6 text-black hover:text-gray-600"
                  onClick={() => setIsSearchOpen(false)}
                >
                  <X className="w-8 h-8" />
                </button>

                <div className="w-full max-w-2xl">
                  <form
                    onSubmit={handleSearchSubmit}
                    className="relative"
                  >
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search watches by name or brand..."
                      className="w-full bg-transparent border-b-2 border-black text-xl md:text-3xl py-4 pr-12 focus:outline-none placeholder-gray-400 font-sans tracking-widest uppercase"
                      autoFocus
                    />

                    <button
                      type="submit"
                      className="absolute right-0 top-1/2 -translate-y-1/2"
                    >
                      <Search className="w-6 h-6 md:w-8 md:h-8" />
                    </button>
                  </form>

                  {searchSuggestions.length > 0 && (
                    <div className="mt-12 flex flex-col gap-2 font-sans text-left">
                      <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-4">
                        Suggestions
                      </p>

                      {searchSuggestions.map((product) => (
                        <Link
                          key={product.id}
                          href={`/product/${product.id}`}
                          onClick={() => setIsSearchOpen(false)}
                          className="flex items-center gap-6 group hover:bg-gray-50 p-3 -mx-3 rounded transition-colors"
                        >
                          <div className="w-20 h-20 bg-white shrink-0 flex items-center justify-center p-2 rounded border border-gray-100 overflow-hidden">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
                            />
                          </div>

                          <div className="flex flex-col justify-center">
                            <span className="text-[10px] md:text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">
                              {product.brand}
                            </span>

                            <span className="text-sm md:text-lg font-bold uppercase tracking-wider text-black">
                              {product.name}
                            </span>

                            <span className="text-xs md:text-sm font-semibold tracking-widest text-gray-500 mt-1">
                              ₹{product.price}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
