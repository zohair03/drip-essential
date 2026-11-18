"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

// Default Luxury Watch Products fallback
export const defaultProducts = [
  {
    id: "1",
    brand: "ROLEX",
    name: "Cosmograph Daytona",
    modelId: "116500LN",
    price: "5000",
    image: "/images/image.png",
    images: ["/images/image.png"],
    description:
      "The Oyster Perpetual Cosmograph Daytona is the ultimate tool watch for those with a passion for driving and speed.",
    stock: 8,
    status: "Active",
    store_type: "watches",
  },
  {
    id: "2",
    brand: "TAG HEUER",
    name: "Aquaracer Professional 300",
    modelId: "WBP201B.BA0632",
    price: "5000",
    image: "/images/image.png",
    images: ["/images/image.png"],
    description:
      "The definitive luxury diver's watch. Designed for underwater exploration.",
    stock: 5,
    status: "Low Stock",
    store_type: "watches",
  },
  {
    id: "3",
    brand: "OMEGA",
    name: "Speedmaster Moonwatch",
    modelId: "310.30.42.50.01.002",
    price: "5000",
    image: "/images/image.png",
    images: ["/images/image.png"],
    description:
      "One of the world's most iconic timepieces. Having been a part of all six lunar missions.",
    stock: 12,
    status: "Active",
    store_type: "watches",
  },
  {
    id: "4",
    brand: "SEIKO",
    name: "Prospex Automatic",
    modelId: "SPB143J1",
    price: "5000",
    image: "/images/image.png",
    images: ["/images/image.png"],
    description:
      "Built for the challenge. A professional diver's watch with exceptional reliability.",
    stock: 24,
    status: "Active",
    store_type: "watches",
  },
];

// Default Featured Brands for BrandCategoriesSection fallback
export const defaultFeaturedBrands = [
  {
    name: "ROLEX",
    slug: "rolex",
    image: "https://res.cloudinary.com/dnqbhqi6/image/upload/v1795014632/drip-essential/brands/skjeajwirdkihnwo0umq.png",
    logoUrl: "https://res.cloudinary.com/dnqbhqi6/image/upload/v1795014632/drip-essential/brands/skjeajwirdkihnwo0umq.png",
    isVisible: true,
    order: 1,
  },
  {
    name: "OMEGA",
    slug: "omega",
    image: "https://res.cloudinary.com/dnqbhqi6/image/upload/v1795014550/drip-essential/brands/ypon7r9ioxwd2xgrozhf.png",
    logoUrl: "https://res.cloudinary.com/dnqbhqi6/image/upload/v1795014550/drip-essential/brands/ypon7r9ioxwd2xgrozhf.png",
    isVisible: true,
    order: 2,
  },
  {
    name: "TAG HEUER",
    slug: "tag-heuer",
    image: "https://res.cloudinary.com/dnqbhqi6/image/upload/v1795014681/drip-essential/brands/tznasc1ugzhdaidpaiah.png",
    logoUrl: "https://res.cloudinary.com/dnqbhqi6/image/upload/v1795014681/drip-essential/brands/tznasc1ugzhdaidpaiah.png",
    isVisible: true,
    order: 3,
  },
  {
    name: "TUDOR",
    slug: "tudor",
    image: "https://res.cloudinary.com/dnqbhqi6/image/upload/v1795014701/drip-essential/brands/jb9nitnvpv1idgjb4iku.png",
    logoUrl: "https://res.cloudinary.com/dnqbhqi6/image/upload/v1795014701/drip-essential/brands/jb9nitnvpv1idgjb4iku.png",
    isVisible: true,
    order: 4,
  },
  {
    name: "RADO",
    slug: "rado",
    image: "https://res.cloudinary.com/dnqbhqi6/image/upload/v1795014609/drip-essential/brands/ah7jnk0xzouy42sjyc3b.png",
    logoUrl: "https://res.cloudinary.com/dnqbhqi6/image/upload/v1795014609/drip-essential/brands/ah7jnk0xzouy42sjyc3b.png",
    isVisible: true,
    order: 5,
  },
  {
    name: "LOUIS ERARD",
    slug: "louis-erard",
    image: "https://res.cloudinary.com/dnqbhqi6/image/upload/v1795014519/drip-essential/brands/xumzotastm4zgjotyf47.png",
    logoUrl: "https://res.cloudinary.com/dnqbhqi6/image/upload/v1795014519/drip-essential/brands/xumzotastm4zgjotyf47.png",
    isVisible: true,
    order: 6,
  },
  {
    name: "G-SHOCK",
    slug: "g-shock",
    image: "https://res.cloudinary.com/dnqbhqi6/image/upload/v1795014478/drip-essential/brands/mll5k6y8qqatrgoysawh.png",
    logoUrl: "https://res.cloudinary.com/dnqbhqi6/image/upload/v1795014478/drip-essential/brands/mll5k6y8qqatrgoysawh.png",
    isVisible: true,
    order: 7,
  },
  {
    name: "FOSSIL",
    slug: "fossil",
    image: "https://res.cloudinary.com/dnqbhqi6/image/upload/v1795014412/drip-essential/brands/g7pplfcnteo6yqedenxe.png",
    logoUrl: "https://res.cloudinary.com/dnqbhqi6/image/upload/v1795014412/drip-essential/brands/g7pplfcnteo6yqedenxe.png",
    isVisible: true,
    order: 8,
  },
  {
    name: "SEIKO",
    slug: "seiko",
    image: "https://res.cloudinary.com/dnqbhqi6/image/upload/v1795014662/drip-essential/brands/nkz5dhhbfi6gvu7aqk8y.png",
    logoUrl: "https://res.cloudinary.com/dnqbhqi6/image/upload/v1795014662/drip-essential/brands/nkz5dhhbfi6gvu7aqk8y.png",
    isVisible: true,
    order: 9,
  },
];

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

function formatApiBrand(b, index) {
  return {
    id: b.id || b._id,
    name: (b.name || "").toUpperCase(),
    slug: b.slug || (b.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    logoUrl: b.image || "/images/image.png",
    image: b.image || "/images/image.png",
    isVisible: b.status !== "Inactive",
    order: index + 1,
    productCount: b.productCount || 0,
  };
}

const ProductContext = createContext(undefined);

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(defaultProducts);
  const [featuredBrands, setFeaturedBrands] = useState(defaultFeaturedBrands);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const [productsRes, brandsRes] = await Promise.all([
        fetch("/api/products?limit=200", { cache: "no-store" }).catch(() => null),
        fetch("/api/brands", { cache: "no-store" }).catch(() => null),
      ]);

      if (productsRes && productsRes.ok) {
        const pData = await productsRes.json();
        if (pData?.success && Array.isArray(pData.products) && pData.products.length > 0) {
          setProducts(pData.products.map(formatApiProduct));
        }
      }

      if (brandsRes && brandsRes.ok) {
        const bData = await brandsRes.json();
        if (bData?.success && Array.isArray(bData.brands) && bData.brands.length > 0) {
          setFeaturedBrands(bData.brands.map(formatApiBrand));
        }
      }
    } catch (e) {
      console.warn("ProductContext fetch error, using defaults:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const addProduct = useCallback((newProduct) => {
    const formatted = formatApiProduct(newProduct);
    setProducts((prev) => [formatted, ...prev]);
    return formatted;
  }, []);

  const updateProduct = useCallback((id, updatedData) => {
    setProducts((prev) =>
      prev.map((p) =>
        String(p.id) === String(id)
          ? formatApiProduct({ ...p, ...updatedData, id: p.id })
          : p
      )
    );
  }, []);

  const deleteProduct = useCallback((id) => {
    setProducts((prev) => prev.filter((p) => String(p.id) !== String(id)));
  }, []);

  return (
    <ProductContext.Provider
      value={{
        products,
        featuredBrands,
        addProduct,
        updateProduct,
        deleteProduct,
        isLoaded,
        fetchProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
}

export default ProductContext;
