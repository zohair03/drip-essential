"use client";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  Heart,
  SlidersHorizontal,
  Search,
  ArrowUpDown,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useProducts } from "../context/ProductContext";
import { ResponsiveImage } from "../sections/ResponsiveImage";

const ITEMS_PER_PAGE = 12;

function formatApiProduct(p) {
  const stock = typeof p.stock === "number" ? p.stock : Number(p.stock) || 0;
  const rawPrice = p.price ? String(p.price).replace(/,/g, "") : "0";
  const formattedPrice = !isNaN(Number(rawPrice))
    ? new Intl.NumberFormat("en-IN").format(Number(rawPrice))
    : String(p.price || "0");

  const brandName =
    typeof p.brand === "object" && p.brand !== null
      ? p.brand.name || "UNKNOWN"
      : p.brand || "UNKNOWN";

  const image = p.image || "/images/image.png";
  const images =
    Array.isArray(p.images) && p.images.length > 0 ? p.images : [image];

  return {
    id: String(p.id || p._id || Date.now()),
    brand: brandName.toUpperCase(),
    brandId: p.brandId || (typeof p.brand === "object" ? p.brand?._id : "") || "",
    name: p.name || "Product",
    modelId: p.modelId || "N/A",
    price: formattedPrice,
    rawPrice: Number(rawPrice) || 0,
    image,
    imagePublicId: p.imagePublicId || "",
    images,
    imagePublicIds: p.imagePublicIds || [],
    description: p.description || "",
    stock,
    status:
      p.status || (stock > 5 ? "Active" : stock > 0 ? "Low Stock" : "Draft"),
    store_type: p.store_type || "watches",
  };
}

export default function WatchesCollectionPage() {
  const { brandName } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const gridTopRef = useRef(null);

  const { featuredBrands } = useProducts();

  // Dynamic brands list from database
  const availableBrands = useMemo(() => {
    if (featuredBrands && featuredBrands.length > 0) {
      return featuredBrands.map((b) => b.name.toUpperCase());
    }
    return [
      "ROLEX",
      "TAG HEUER",
      "OMEGA",
      "SEIKO",
      "RADO",
      "G-SHOCK",
      "FOSSIL",
      "LONGINES",
      "CARTIER",
      "TISSOT",
      "SWATCH",
      "HUBLOT",
      "ARMANI",
      "BOSS",
      "AUDEMARS PIGUET",
      "PATEK PHILIPPE",
    ];
  }, [featuredBrands]);

  // Extract filter parameters from URL Search Parameters (Single Source of Truth)
  const urlBrand = searchParams.get("brand") || (brandName ? String(brandName) : "");
  const selectedBrands = useMemo(() => {
    if (!urlBrand) return [];
    return urlBrand
      .split(",")
      .map((b) => b.trim().toUpperCase())
      .filter(Boolean);
  }, [urlBrand]);

  const urlSearch = searchParams.get("search") || "";
  const urlMinPrice = parseInt(searchParams.get("minPrice") || "0", 10);
  const urlMaxPrice = parseInt(searchParams.get("maxPrice") || "500000", 10);
  const sortBy = searchParams.get("sort") || "featured";

  const urlAvailability = searchParams.get("availability") || "";
  const availability = useMemo(() => {
    if (!urlAvailability) return [];
    return urlAvailability
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  }, [urlAvailability]);

  const urlStrap = searchParams.get("strap") || "";
  const selectedStrapTypes = useMemo(() => {
    if (!urlStrap) return [];
    return urlStrap
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [urlStrap]);

  const urlMaterial = searchParams.get("material") || "";
  const selectedMaterials = useMemo(() => {
    if (!urlMaterial) return [];
    return urlMaterial
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
  }, [urlMaterial]);

  const urlColor = searchParams.get("color") || "";
  const selectedColours = useMemo(() => {
    if (!urlColor) return [];
    return urlColor
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
  }, [urlColor]);

  const currentPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

  // Local state for smooth typing & slider dragging without input lag
  const [searchInput, setSearchInput] = useState(urlSearch);
  const [localPriceRange, setLocalPriceRange] = useState([urlMinPrice, urlMaxPrice]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync local inputs if URL changes externally (e.g. back/forward navigation)
  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    setLocalPriceRange([urlMinPrice, urlMaxPrice]);
  }, [urlMinPrice, urlMaxPrice]);

  // Product Data States
  const [paginatedProducts, setPaginatedProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to update URL search parameters and keep state in sync
  const updateFilters = useCallback(
    (updates) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, val]) => {
        if (
          val === null ||
          val === undefined ||
          val === "" ||
          (Array.isArray(val) && val.length === 0)
        ) {
          params.delete(key);
        } else if (Array.isArray(val)) {
          params.set(key, val.join(","));
        } else {
          params.set(key, String(val));
        }
      });

      // If any filter other than page was modified, reset to page 1 unless page explicitly passed
      if (!("page" in updates) && updates.page === undefined) {
        params.delete("page");
      }

      const qs = params.toString();
      router.replace(`/watches${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [searchParams, router]
  );

  // Debounced update for search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput.trim() !== urlSearch) {
        updateFilters({ search: searchInput.trim() || null });
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput, urlSearch, updateFilters]);

  // Debounced update for price range
  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        localPriceRange[0] !== urlMinPrice ||
        localPriceRange[1] !== urlMaxPrice
      ) {
        updateFilters({
          minPrice: localPriceRange[0] > 0 ? localPriceRange[0] : null,
          maxPrice: localPriceRange[1] < 500000 ? localPriceRange[1] : null,
        });
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [localPriceRange, urlMinPrice, urlMaxPrice, updateFilters]);

  // Fetch only the active page's 12 watches from the database
  const activeFetchIdRef = useRef(0);
  const fetchWatches = useCallback(async () => {
    setIsLoading(true);
    const fetchId = ++activeFetchIdRef.current;

    try {
      const apiParams = new URLSearchParams();
      apiParams.set("page", String(currentPage));
      apiParams.set("limit", String(ITEMS_PER_PAGE));

      if (selectedBrands.length > 0) {
        apiParams.set("brand", selectedBrands.join(","));
      }
      if (urlSearch.trim()) {
        apiParams.set("search", urlSearch.trim());
      }
      if (urlMinPrice > 0) {
        apiParams.set("minPrice", String(urlMinPrice));
      }
      if (urlMaxPrice < 500000) {
        apiParams.set("maxPrice", String(urlMaxPrice));
      }
      if (availability.length === 1) {
        apiParams.set("availability", availability[0]);
      }
      if (selectedStrapTypes.length > 0) {
        apiParams.set("strap", selectedStrapTypes.join(","));
      }
      if (selectedMaterials.length > 0) {
        apiParams.set("material", selectedMaterials.join(","));
      }
      if (selectedColours.length > 0) {
        apiParams.set("color", selectedColours.join(","));
      }
      if (sortBy) {
        apiParams.set("sort", sortBy);
      }

      const res = await fetch(`/api/products?${apiParams.toString()}`, {
        cache: "no-store",
      });
      const data = await res.json();

      if (fetchId === activeFetchIdRef.current) {
        if (data && data.success) {
          const items = Array.isArray(data.products)
            ? data.products.map(formatApiProduct)
            : [];
          setPaginatedProducts(items);
          setTotalProducts(data.total || 0);
          setTotalPages(data.pages || 1);
        } else {
          setPaginatedProducts([]);
          setTotalProducts(0);
          setTotalPages(1);
        }
        setIsLoading(false);
      }
    } catch (err) {
      if (fetchId === activeFetchIdRef.current) {
        console.error("WatchesCollection fetch error:", err);
        setPaginatedProducts([]);
        setTotalProducts(0);
        setTotalPages(1);
        setIsLoading(false);
      }
    }
  }, [
    currentPage,
    selectedBrands,
    urlSearch,
    urlMinPrice,
    urlMaxPrice,
    availability,
    selectedStrapTypes,
    selectedMaterials,
    selectedColours,
    sortBy,
  ]);

  // Execute fetch when searchParams change
  useEffect(() => {
    fetchWatches();
  }, [fetchWatches]);

  // Handle page change with smooth scroll to top of collection
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage || isLoading) {
      return;
    }
    updateFilters({ page: newPage });
    if (gridTopRef.current) {
      const topOffset =
        gridTopRef.current.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top: Math.max(0, topOffset), behavior: "smooth" });
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchInput("");
    setLocalPriceRange([0, 500000]);
    router.replace("/watches", { scroll: false });
  };

  // Helper to parse price string to number
  const getProductPrice = (priceStr) => {
    return parseFloat(String(priceStr).replace(/,/g, "")) || 0;
  };

  // Handle Brand Toggle
  const handleBrandToggle = (brand) => {
    const brandUpper = brand.toUpperCase();
    const isSelected = selectedBrands.includes(brandUpper);
    const updated = isSelected
      ? selectedBrands.filter((b) => b !== brandUpper)
      : [...selectedBrands, brandUpper];
    updateFilters({ brand: updated });
  };

  // Handle Availability Toggle
  const handleAvailabilityToggle = (status) => {
    const isSelected = availability.includes(status);
    const updated = isSelected
      ? availability.filter((s) => s !== status)
      : [...availability, status];
    updateFilters({ availability: updated });
  };

  // Handle generic array filter toggle
  const handleFilterToggle = (list, key, item) => {
    const isSelected = list.includes(item);
    const updated = isSelected
      ? list.filter((i) => i !== item)
      : [...list, item];
    updateFilters({ [key]: updated });
  };

  // Smart Pagination numbers generator
  const pageNumbers = useMemo(() => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push("...");
      }
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) {
        pages.push("...");
      }
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, currentPage]);

  return (
    <div className="min-h-screen bg-white text-black font-['Montserrat',sans-serif]">
      {/* Toolbar / Search & Sort */}
      <div ref={gridTopRef} className="border-b border-gray-200 bg-white py-6 mt-16 md:mt-20">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Mobile Filter Button & Filter Count */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 border border-black px-4 py-2.5 text-xs font-bold tracking-widest uppercase hover:bg-black hover:text-white transition-all cursor-pointer"
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>

            <span className="text-xs font-semibold tracking-widest text-gray-500 uppercase">
              {isLoading ? "Searching..." : `${totalProducts} Timepieces Found`}
            </span>
          </div>

          {/* Search Bar & Sort Dropdown */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-end">
            <div className="relative flex-1 md:w-64 max-w-md">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="SEARCH WATCHES..."
                className="w-full bg-[#F3F3F3] border-none text-xs font-semibold tracking-widest placeholder-gray-400 py-3 pl-10 pr-4 rounded-sm focus:outline-none focus:ring-1 focus:ring-black uppercase"
              />
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              {searchInput && (
                <button
                  onClick={() => {
                    setSearchInput("");
                    updateFilters({ search: null });
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
              <ArrowUpDown size={14} className="text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => updateFilters({ sort: e.target.value })}
                className="bg-transparent text-xs font-semibold tracking-widest uppercase focus:outline-none cursor-pointer py-1"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price Low to High</option>
                <option value="price-high">Price High to Low</option>
                <option value="newest">New Arrivals</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid & Filters */}
      <main className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="flex gap-12">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-72 shrink-0 space-y-8 pr-6 border-r border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold tracking-widest uppercase flex items-center gap-2">
                <SlidersHorizontal size={16} />
                Filters
              </h2>

              <button
                onClick={resetFilters}
                className="text-[10px] font-bold tracking-widest text-red-500 uppercase hover:underline cursor-pointer"
              >
                Clear All
              </button>
            </div>

            {/* Brands Filter */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold tracking-widest uppercase border-b border-gray-200 pb-2">
                Brands
              </h3>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-2">
                {availableBrands.map((brand) => (
                  <label
                    key={brand}
                    className="flex items-center gap-3 cursor-pointer group text-xs font-semibold uppercase tracking-wider text-gray-600 hover:text-black"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand.toUpperCase())}
                      onChange={() => handleBrandToggle(brand)}
                      className="w-4 h-4 text-black focus:ring-black border-gray-300 rounded accent-black cursor-pointer"
                    />
                    {brand}
                  </label>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold tracking-widest uppercase border-b border-gray-200 pb-2">
                Price (INR)
              </h3>

              <div className="space-y-4">
                <div className="flex items-center gap-4 text-xs font-bold">
                  <div>
                    <span className="block text-[9px] text-gray-400 mb-1">
                      MIN PRICE
                    </span>
                    <input
                      type="number"
                      value={localPriceRange[0]}
                      onChange={(e) =>
                        setLocalPriceRange([
                          parseInt(e.target.value) || 0,
                          localPriceRange[1],
                        ])
                      }
                      className="w-full bg-[#F3F3F3] border-none px-2 py-1.5 focus:outline-none"
                    />
                  </div>

                  <div>
                    <span className="block text-[9px] text-gray-400 mb-1">
                      MAX PRICE
                    </span>
                    <input
                      type="number"
                      value={localPriceRange[1]}
                      onChange={(e) =>
                        setLocalPriceRange([
                          localPriceRange[0],
                          parseInt(e.target.value) || 500000,
                        ])
                      }
                      className="w-full bg-[#F3F3F3] border-none px-2 py-1.5 focus:outline-none"
                    />
                  </div>
                </div>

                <input
                  type="range"
                  min={0}
                  max={500000}
                  step={5000}
                  value={localPriceRange[1]}
                  onChange={(e) =>
                    setLocalPriceRange([localPriceRange[0], parseInt(e.target.value)])
                  }
                  className="w-full accent-black cursor-pointer"
                />
              </div>
            </div>

            {/* Availability Filter */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold tracking-widest uppercase border-b border-gray-200 pb-2">
                Availability
              </h3>

              <div className="space-y-2 text-xs font-semibold uppercase tracking-wider text-gray-600">
                <label className="flex items-center gap-3 cursor-pointer hover:text-black">
                  <input
                    type="checkbox"
                    checked={availability.includes("in-stock")}
                    onChange={() => handleAvailabilityToggle("in-stock")}
                    className="w-4 h-4 text-black focus:ring-black rounded accent-black cursor-pointer"
                  />
                  In Stock
                </label>

                <label className="flex items-center gap-3 cursor-pointer hover:text-black">
                  <input
                    type="checkbox"
                    checked={availability.includes("out-of-stock")}
                    onChange={() => handleAvailabilityToggle("out-of-stock")}
                    className="w-4 h-4 text-black focus:ring-black rounded accent-black cursor-pointer"
                  />
                  Out of Stock
                </label>
              </div>
            </div>

            {/* Strap Type Filter */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold tracking-widest uppercase border-b border-gray-200 pb-2">
                Strap Type
              </h3>

              <div className="space-y-2 text-xs font-semibold uppercase tracking-wider text-gray-600">
                {["Leather", "Metal", "Rubber", "Fabric"].map((strap) => (
                  <label
                    key={strap}
                    className="flex items-center gap-3 cursor-pointer hover:text-black"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStrapTypes.includes(strap)}
                      onChange={() =>
                        handleFilterToggle(selectedStrapTypes, "strap", strap)
                      }
                      className="w-4 h-4 text-black rounded accent-black cursor-pointer"
                    />
                    {strap}
                  </label>
                ))}
              </div>
            </div>

            {/* Material Filter */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold tracking-widest uppercase border-b border-gray-200 pb-2">
                Material
              </h3>

              <div className="space-y-2 text-xs font-semibold uppercase tracking-wider text-gray-600">
                {["Steel", "Gold", "Ceramic", "Titanium"].map((mat) => (
                  <label
                    key={mat}
                    className="flex items-center gap-3 cursor-pointer hover:text-black"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMaterials.includes(mat)}
                      onChange={() =>
                        handleFilterToggle(selectedMaterials, "material", mat)
                      }
                      className="w-4 h-4 text-black rounded accent-black cursor-pointer"
                    />
                    {mat}
                  </label>
                ))}
              </div>
            </div>

            {/* Color Filter */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold tracking-widest uppercase border-b border-gray-200 pb-2">
                Color
              </h3>

              <div className="space-y-2 text-xs font-semibold uppercase tracking-wider text-gray-600">
                {["Black", "Silver", "Gold", "Blue", "Green"].map((col) => (
                  <label
                    key={col}
                    className="flex items-center gap-3 cursor-pointer hover:text-black"
                  >
                    <input
                      type="checkbox"
                      checked={selectedColours.includes(col)}
                      onChange={() =>
                        handleFilterToggle(selectedColours, "color", col)
                      }
                      className="w-4 h-4 text-black rounded accent-black cursor-pointer"
                    />
                    {col}
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid & Pagination Section */}
          <section className="flex-1">
            {isLoading ? (
              /* Loading Skeleton Grid (12 items) */
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-x-3 sm:gap-x-6 gap-y-6 sm:gap-y-12">
                {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="border border-gray-100 p-3 sm:p-4 animate-pulse flex flex-col space-y-3"
                  >
                    <div className="aspect-square bg-gray-100 rounded-sm" />
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                    <div className="h-4 bg-gray-100 rounded w-4/5" />
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                    <div className="h-3 bg-gray-100 rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : paginatedProducts.length === 0 ? (
              <div className="text-center py-24 border border-dashed border-gray-200 rounded-sm">
                <p className="text-sm font-semibold tracking-widest text-gray-400 uppercase mb-4">
                  No watches matches your selection.
                </p>

                <button
                  onClick={resetFilters}
                  className="bg-black text-white px-6 py-3 text-xs font-bold tracking-widest uppercase hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-x-3 sm:gap-x-6 gap-y-6 sm:gap-y-12">
                  {paginatedProducts.map((product) => {
                    const rawPrice = getProductPrice(product.price);
                    const displayOriginalPrice = rawPrice * 1.15;

                    return (
                      <div
                        key={product.id}
                        onClick={() => router.push(`/product/${product.id}`)}
                        className="group flex flex-col relative bg-white cursor-pointer border border-gray-100/50 hover:shadow-lg transition-all duration-300 p-2 sm:p-4"
                      >
                        {/* Wishlist Icon */}
                        <button
                          className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 bg-white/95 p-1.5 sm:p-2 rounded-full hover:bg-white shadow-sm transition-colors cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                          aria-label="Save to Wishlist"
                        >
                          <Heart className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-black" />
                        </button>

                        {/* Image Frame */}
                        <div className="aspect-square bg-white mb-2 sm:mb-6 overflow-hidden flex items-center justify-center p-2 sm:p-6 relative">
                          <ResponsiveImage
                            src={product.image}
                            alt={product.name}
                            widths={[150, 300, 500]}
                            sizes="(max-width: 640px) 150px, (max-width: 1024px) 300px, 400px"
                            className="w-4/5 h-4/5 object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                          />

                          {product.stock === 0 && (
                            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                              <span className="bg-black text-white text-[8px] sm:text-[10px] font-bold uppercase tracking-widest px-2 py-1 sm:px-4 sm:py-2 rounded-sm">
                                Out of Stock
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Watch Specs */}
                        <div className="space-y-1 sm:space-y-2 flex-1 flex flex-col">
                          <div className="text-[8px] sm:text-[10px] font-bold text-gray-400 tracking-widest uppercase">
                            {product.brand}
                          </div>

                          <h3 className="font-oswald text-xs sm:text-sm font-semibold tracking-wider uppercase text-black line-clamp-2 h-8 sm:h-10 flex-1">
                            {product.name}
                          </h3>

                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-3">
                            <span className="text-xs sm:text-sm font-bold">
                              ₹{product.price}
                            </span>

                            <span className="text-[10px] sm:text-xs font-semibold text-red-500 line-through">
                              ₹
                              {new Intl.NumberFormat("en-IN").format(
                                Math.round(displayOriginalPrice)
                              )}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 sm:gap-1.5 text-[8px] sm:text-[9px] font-bold tracking-widest uppercase mt-1">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                product.stock > 0
                                  ? "bg-[#25D366]"
                                  : "bg-[#FF3B30]"
                              }`}
                            ></span>

                            {product.stock > 0 ? "In Stock" : "Out of Stock"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-14 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                    {/* Showing info */}
                    <div className="text-[11px] font-bold tracking-widest text-gray-400 uppercase text-center sm:text-left">
                      Showing{" "}
                      <span className="text-black">
                        {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                      </span>{" "}
                      –{" "}
                      <span className="text-black">
                        {Math.min(currentPage * ITEMS_PER_PAGE, totalProducts)}
                      </span>{" "}
                      of <span className="text-black">{totalProducts}</span> watches
                    </div>

                    {/* Pagination Buttons */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {/* Previous Page Button */}
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1 || isLoading}
                        className="px-3.5 py-2 border border-black text-[10px] sm:text-[11px] font-bold tracking-widest uppercase transition-all hover:bg-black hover:text-white disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-black cursor-pointer flex items-center gap-1"
                        aria-label="Previous Page"
                      >
                        <ChevronLeft size={14} />
                        <span className="hidden sm:inline">Prev</span>
                      </button>

                      {/* Numbered Page Buttons */}
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        {pageNumbers.map((pageNum, idx) => {
                          if (pageNum === "...") {
                            return (
                              <span
                                key={`dots-${idx}`}
                                className="w-8 h-8 flex items-center justify-center text-xs text-gray-400 font-bold"
                              >
                                ...
                              </span>
                            );
                          }
                          return (
                            <button
                              key={`page-${pageNum}`}
                              onClick={() => handlePageChange(pageNum)}
                              disabled={isLoading}
                              className={`w-8 h-8 sm:w-9 sm:h-9 text-[11px] sm:text-xs font-bold tracking-widest uppercase transition-all cursor-pointer flex items-center justify-center rounded-xs ${
                                currentPage === pageNum
                                  ? "bg-black text-white"
                                  : "border border-gray-200 text-gray-700 hover:border-black hover:text-black"
                              }`}
                              aria-label={`Page ${pageNum}`}
                              aria-current={currentPage === pageNum ? "page" : undefined}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      {/* Next Page Button */}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages || isLoading}
                        className="px-3.5 py-2 border border-black text-[10px] sm:text-[11px] font-bold tracking-widest uppercase transition-all hover:bg-black hover:text-white disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-black cursor-pointer flex items-center gap-1"
                        aria-label="Next Page"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>

      {/* Mobile Filter Sidebar Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsMobileFilterOpen(false)}
          ></div>

          <div className="relative w-80 max-w-full h-full bg-white flex flex-col overflow-y-auto p-6 z-10 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <h2 className="text-sm font-bold tracking-widest uppercase flex items-center gap-2">
                <SlidersHorizontal size={16} />
                Filters
              </h2>

              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Brands Filter */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold tracking-widest uppercase border-b border-gray-200 pb-2">
                Brands
              </h3>

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {availableBrands.map((brand) => (
                  <label
                    key={`mob-${brand}`}
                    className="flex items-center gap-3 cursor-pointer text-xs font-semibold uppercase tracking-wider text-gray-600 hover:text-black"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand.toUpperCase())}
                      onChange={() => handleBrandToggle(brand)}
                      className="w-4 h-4 text-black rounded accent-black cursor-pointer"
                    />
                    {brand}
                  </label>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold tracking-widest uppercase border-b border-gray-200 pb-2">
                Price (INR)
              </h3>

              <div className="space-y-4">
                <div className="flex items-center gap-4 text-xs font-bold">
                  <div>
                    <span className="block text-[9px] text-gray-400 mb-1">
                      MIN
                    </span>
                    <input
                      type="number"
                      value={localPriceRange[0]}
                      onChange={(e) =>
                        setLocalPriceRange([
                          parseInt(e.target.value) || 0,
                          localPriceRange[1],
                        ])
                      }
                      className="w-full bg-[#F3F3F3] border-none px-2 py-1"
                    />
                  </div>

                  <div>
                    <span className="block text-[9px] text-gray-400 mb-1">
                      MAX
                    </span>
                    <input
                      type="number"
                      value={localPriceRange[1]}
                      onChange={(e) =>
                        setLocalPriceRange([
                          localPriceRange[0],
                          parseInt(e.target.value) || 500000,
                        ])
                      }
                      className="w-full bg-[#F3F3F3] border-none px-2 py-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold tracking-widest uppercase border-b border-gray-200 pb-2">
                Availability
              </h3>

              <div className="space-y-2 text-xs font-semibold uppercase tracking-wider text-gray-600">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={availability.includes("in-stock")}
                    onChange={() => handleAvailabilityToggle("in-stock")}
                    className="w-4 h-4 text-black rounded accent-black cursor-pointer"
                  />
                  In Stock
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={availability.includes("out-of-stock")}
                    onChange={() => handleAvailabilityToggle("out-of-stock")}
                    className="w-4 h-4 text-black rounded accent-black cursor-pointer"
                  />
                  Out of Stock
                </label>
              </div>
            </div>

            {/* Strap Type Filter */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold tracking-widest uppercase border-b border-gray-200 pb-2">
                Strap Type
              </h3>

              <div className="space-y-2 text-xs font-semibold uppercase tracking-wider text-gray-600">
                {["Leather", "Metal", "Rubber", "Fabric"].map((strap) => (
                  <label
                    key={`mob-${strap}`}
                    className="flex items-center gap-3 cursor-pointer hover:text-black"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStrapTypes.includes(strap)}
                      onChange={() =>
                        handleFilterToggle(selectedStrapTypes, "strap", strap)
                      }
                      className="w-4 h-4 text-black rounded accent-black cursor-pointer"
                    />
                    {strap}
                  </label>
                ))}
              </div>
            </div>

            {/* Material Filter */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold tracking-widest uppercase border-b border-gray-200 pb-2">
                Material
              </h3>

              <div className="space-y-2 text-xs font-semibold uppercase tracking-wider text-gray-600">
                {["Steel", "Gold", "Ceramic", "Titanium"].map((mat) => (
                  <label
                    key={`mob-${mat}`}
                    className="flex items-center gap-3 cursor-pointer hover:text-black"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMaterials.includes(mat)}
                      onChange={() =>
                        handleFilterToggle(selectedMaterials, "material", mat)
                      }
                      className="w-4 h-4 text-black rounded accent-black cursor-pointer"
                    />
                    {mat}
                  </label>
                ))}
              </div>
            </div>

            {/* Color Filter */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold tracking-widest uppercase border-b border-gray-200 pb-2">
                Color
              </h3>

              <div className="space-y-2 text-xs font-semibold uppercase tracking-wider text-gray-600">
                {["Black", "Silver", "Gold", "Blue", "Green"].map((col) => (
                  <label
                    key={`mob-${col}`}
                    className="flex items-center gap-3 cursor-pointer hover:text-black"
                  >
                    <input
                      type="checkbox"
                      checked={selectedColours.includes(col)}
                      onChange={() =>
                        handleFilterToggle(selectedColours, "color", col)
                      }
                      className="w-4 h-4 text-black rounded accent-black cursor-pointer"
                    />
                    {col}
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-6 flex gap-4">
              <button
                onClick={resetFilters}
                className="flex-1 border border-black py-3 text-xs font-bold tracking-widest uppercase hover:bg-black hover:text-white transition-all cursor-pointer"
              >
                Clear All
              </button>

              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 bg-black text-white py-3 text-xs font-bold tracking-widest uppercase hover:bg-gray-800 transition-all cursor-pointer"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}