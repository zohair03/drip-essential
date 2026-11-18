"use client";
import { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  Heart,
  SlidersHorizontal,
  Search,
  ArrowUpDown,
  X,
} from "lucide-react";
import { useProducts } from "../context/ProductContext";
import { ResponsiveImage } from "../sections/ResponsiveImage";
import {WatchesCollectionNavbar} from "../ui/WatchesCollectionNavbar.jsx"


export default function WatchesCollectionPage() {
  const { brandName } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const { products } = useProducts();

  // Scroll to top on mount or when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [brandName]);

  // Active products only
  const activeProducts = useMemo(
    () => products.filter((p) => p.status !== "Draft"),
    [products]
  );

  // Available brands in database dynamically
  const availableBrands = useMemo(() => {
    const brandsSet = new Set();

    activeProducts.forEach((p) => {
      if (p.brand) {
        brandsSet.add(p.brand.toUpperCase());
      }
    });

    return Array.from(brandsSet);
  }, [activeProducts]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedStrapTypes, setSelectedStrapTypes] = useState([]);
  const [selectedColours, setSelectedColours] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [sortBy, setSortBy] = useState("featured");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 20;

  // Sync route parameters and search query params
  useEffect(() => {
    const timer = setTimeout(() => {
      if (brandName) {
        setSelectedBrands([brandName.toUpperCase()]);
      } else {
        setSelectedBrands([]);
      }

      const query = searchParams.get("search");

      if (query) {
        setSearchQuery(query);
      } else {
        setSearchQuery("");
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [brandName, searchParams]);

  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedBrands(brandName ? [brandName.toUpperCase()] : []);
    setAvailability([]);
    setSelectedMaterials([]);
    setSelectedStrapTypes([]);
    setSelectedColours([]);
    setPriceRange([0, 500000]);
    setSortBy("featured");
    setCurrentPage(1);
  };

  // Helper to parse price string to number
  const getProductPrice = (priceStr) => {
    return parseFloat(String(priceStr).replace(/,/g, "")) || 0;
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return activeProducts.filter((p) => {
      // 1. Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();

        const matchesName = p.name.toLowerCase().includes(query);
        const matchesBrand = p.brand.toLowerCase().includes(query);
        const matchesDesc = p.description.toLowerCase().includes(query);

        if (!matchesName && !matchesBrand && !matchesDesc) {
          return false;
        }
      }

      // 2. Brand filter
      if (selectedBrands.length > 0) {
        if (!selectedBrands.includes(p.brand.toUpperCase())) {
          return false;
        }
      }

      // 3. Availability filter
      if (availability.length > 0) {
        const inStock = p.stock > 0;

        if (availability.includes("in-stock") && !inStock) {
          return false;
        }

        if (availability.includes("out-of-stock") && inStock) {
          return false;
        }
      }

      // 4. Material filter
      if (selectedMaterials.length > 0) {
        const desc = p.description.toLowerCase();

        const matchesMaterial = selectedMaterials.some((m) =>
          desc.includes(m.toLowerCase())
        );

        if (!matchesMaterial) {
          return false;
        }
      }

      // 5. Strap Type filter
      if (selectedStrapTypes.length > 0) {
        const desc = p.description.toLowerCase();

        const matchesStrap = selectedStrapTypes.some((s) =>
          desc.includes(s.toLowerCase())
        );

        if (!matchesStrap) {
          return false;
        }
      }

      // 6. Colour filter
      if (selectedColours.length > 0) {
        const desc = p.description.toLowerCase();
        const name = p.name.toLowerCase();

        const matchesColour = selectedColours.some(
          (c) =>
            desc.includes(c.toLowerCase()) ||
            name.includes(c.toLowerCase())
        );

        if (!matchesColour) {
          return false;
        }
      }

      // 7. Price Filter
      const price = getProductPrice(p.price);

      if (price < priceRange[0] || price > priceRange[1]) {
        return false;
      }

      return true;
    });
  }, [
    activeProducts,
    searchQuery,
    selectedBrands,
    availability,
    selectedMaterials,
    selectedStrapTypes,
    selectedColours,
    priceRange,
  ]);

  // Sorted Products
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];

    if (sortBy === "price-low") {
      list.sort(
        (a, b) => getProductPrice(a.price) - getProductPrice(b.price)
      );
    } else if (sortBy === "price-high") {
      list.sort(
        (a, b) => getProductPrice(b.price) - getProductPrice(a.price)
      );
    } else if (sortBy === "newest") {
      list.reverse();
    }

    return list;
  }, [filteredProducts, sortBy]);

  // Show all products without pagination
  const paginatedProducts = sortedProducts;

  // Handle brand filter
  const handleBrandToggle = (brand) => {
    if (selectedBrands.includes(brand)) {
      const updated = selectedBrands.filter((b) => b !== brand);

      setSelectedBrands(updated);

      if (brandName && brandName.toUpperCase() === brand) {
        router.push("/watches");
      }
    } else {
      setSelectedBrands([...selectedBrands, brand]);
    }
  };

  // Handle availability filter
  const handleAvailabilityToggle = (status) => {
    if (availability.includes(status)) {
      setAvailability(availability.filter((s) => s !== status));
    } else {
      setAvailability([...availability, status]);
    }
  };

  // Handle other filters
  const handleFilterToggle = (list, setList, item) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-['Montserrat',sans-serif]">

        <WatchesCollectionNavbar theme="dark" />
      {/* Toolbar / Search & Sort */}
      <div className="border-b border-gray-200 bg-white py-6">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Mobile Filter Button & Filter Count */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 border border-black px-4 py-2.5 text-xs font-bold tracking-widest uppercase hover:bg-black hover:text-white transition-all"
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>

            <span className="text-xs font-semibold tracking-widest text-gray-500 uppercase">
              {sortedProducts.length} Timepieces Found
            </span>
          </div>

          {/* Search Bar & Sort Dropdown */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-end">
            <div className="relative flex-1 md:w-64 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH WATCHES..."
                className="w-full bg-[#F3F3F3] border-none text-xs font-semibold tracking-widest placeholder-gray-400 py-3 pl-10 pr-4 rounded-sm focus:outline-none focus:ring-1 focus:ring-black uppercase"
              />

              <Search
                size={14}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>

            <div className="relative flex items-center border border-gray-200 rounded-sm bg-white px-3 py-2.5">
              <ArrowUpDown size={14} className="text-gray-500 mr-2" />

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none text-xs font-bold tracking-widest uppercase focus:outline-none cursor-pointer pr-4"
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
                className="text-[10px] font-bold tracking-widest text-red-500 uppercase hover:underline"
              >
                Clear All
              </button>
            </div>

            {/* Brands Filter */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold tracking-widest uppercase border-b border-gray-200 pb-2">
                Brands
              </h3>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {availableBrands.map((brand) => (
                  <label
                    key={brand}
                    className="flex items-center gap-3 cursor-pointer group text-xs font-semibold uppercase tracking-wider text-gray-600 hover:text-black"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => handleBrandToggle(brand)}
                      className="w-4 h-4 text-black focus:ring-black border-gray-300 rounded accent-black"
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
                      value={priceRange[0]}
                      onChange={(e) =>
                        setPriceRange([
                          parseInt(e.target.value) || 0,
                          priceRange[1],
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
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([
                          priceRange[0],
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
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([
                      priceRange[0],
                      parseInt(e.target.value),
                    ])
                  }
                  className="w-full accent-black"
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
                    className="w-4 h-4 text-black focus:ring-black rounded accent-black"
                  />
                  In Stock
                </label>

                <label className="flex items-center gap-3 cursor-pointer hover:text-black">
                  <input
                    type="checkbox"
                    checked={availability.includes("out-of-stock")}
                    onChange={() => handleAvailabilityToggle("out-of-stock")}
                    className="w-4 h-4 text-black focus:ring-black rounded accent-black"
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
                {["Oystersteel", "Leather", "Rubber", "Steel"].map((strap) => (
                  <label
                    key={strap}
                    className="flex items-center gap-3 cursor-pointer hover:text-black"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStrapTypes.includes(strap)}
                      onChange={() =>
                        handleFilterToggle(
                          selectedStrapTypes,
                          setSelectedStrapTypes,
                          strap
                        )
                      }
                      className="w-4 h-4 text-black rounded accent-black"
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
                {["Ceramic", "Gold", "Titanium", "Oystersteel"].map((mat) => (
                  <label
                    key={mat}
                    className="flex items-center gap-3 cursor-pointer hover:text-black"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMaterials.includes(mat)}
                      onChange={() =>
                        handleFilterToggle(
                          selectedMaterials,
                          setSelectedMaterials,
                          mat
                        )
                      }
                      className="w-4 h-4 text-black rounded accent-black"
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
                        handleFilterToggle(
                          selectedColours,
                          setSelectedColours,
                          col
                        )
                      }
                      className="w-4 h-4 text-black rounded accent-black"
                    />
                    {col}
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <section className="flex-1">
            {sortedProducts.length === 0 ? (
              <div className="text-center py-24 border border-dashed border-gray-200 rounded-sm">
                <p className="text-sm font-semibold tracking-widest text-gray-400 uppercase mb-4">
                  No watches matches your selection.
                </p>

                <button
                  onClick={resetFilters}
                  className="bg-black text-white px-6 py-3 text-xs font-bold tracking-widest uppercase hover:bg-gray-800 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
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
                        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 bg-white/95 p-1.5 sm:p-2 rounded-full hover:bg-white shadow-sm transition-colors"
                        onClick={(e) => e.stopPropagation()}
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

              <button onClick={() => setIsMobileFilterOpen(false)}>
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
                    className="flex items-center gap-3 cursor-pointer text-xs font-semibold uppercase tracking-wider text-gray-600"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => handleBrandToggle(brand)}
                      className="w-4 h-4 text-black rounded accent-black"
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
                      value={priceRange[0]}
                      onChange={(e) =>
                        setPriceRange([
                          parseInt(e.target.value) || 0,
                          priceRange[1],
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
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([
                          priceRange[0],
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
                    className="w-4 h-4 text-black rounded accent-black"
                  />
                  In Stock
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={availability.includes("out-of-stock")}
                    onChange={() => handleAvailabilityToggle("out-of-stock")}
                    className="w-4 h-4 text-black rounded accent-black"
                  />
                  Out of Stock
                </label>
              </div>
            </div>

            <div className="pt-6 flex gap-4">
              <button
                onClick={resetFilters}
                className="flex-1 border border-black py-3 text-xs font-bold tracking-widest uppercase hover:bg-black hover:text-white transition-all"
              >
                Clear
              </button>

              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 bg-black text-white py-3 text-xs font-bold tracking-widest uppercase hover:bg-gray-800 transition-all"
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
