"use client";
import { useState, useEffect, useMemo } from "react";
import {
  Heart,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Share2,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useProducts } from "../context/ProductContext";
import { heroImageUrl, cardImageUrl, thumbImageUrl } from "@/lib/cloudinaryUrl";

function formatApiProduct(p) {
  if (!p) return null;
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
    id: String(p.id || p._id || ""),
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

const AccordionItem = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200">
      <div
        className="py-5 flex justify-between items-center cursor-pointer font-semibold text-sm tracking-widest uppercase hover:text-gray-600 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        style={{ fontFamily: "Montserrat, sans-serif" }}
      >
        {title}
        {isOpen ? (
          <ChevronUp size={20} className="text-gray-400" />
        ) : (
          <ChevronDown size={20} className="text-gray-400" />
        )}
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen
            ? "max-h-96 opacity-100 mb-5"
            : "max-h-0 opacity-0"
          }`}
      >
        <div
          className="text-sm text-gray-500 leading-relaxed"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default function WatchPage() {
  const { id } = useParams();
  const { products } = useProducts();

  const [product, setProduct] = useState(() => {
    if (!id || !Array.isArray(products)) return null;
    return products.find((p) => p.id === id) || null;
  });
  const [loading, setLoading] = useState(() => {
    if (!id || !Array.isArray(products)) return true;
    return !products.some((p) => p.id === id);
  });
  const [error, setError] = useState(false);

  const [mainImage, setMainImage] = useState(
    product?.image || "/imports/IMG_2394.png"
  );
  const [quantity, setQuantity] = useState(1);

  // Fetch exact product by id from database
  useEffect(() => {
    window.scrollTo(0, 0);

    if (!id) return;

    // Check if product is already in products context
    const cached = Array.isArray(products)
      ? products.find((p) => p.id === id)
      : null;

    if (cached) {
      setProduct(cached);
      setMainImage(cached.image || "/imports/IMG_2394.png");
      setQuantity(1);
      setLoading(false);
      setError(false);
      return;
    }

    // Otherwise fetch the specific product from the database
    let isCancelled = false;
    setLoading(true);
    setError(false);

    async function loadProduct() {
      try {
        const res = await fetch(`/api/products/${id}`, { cache: "no-store" });
        if (!res.ok) {
          throw new Error("Product not found");
        }
        const data = await res.json();
        if (data && data.success && data.product) {
          if (!isCancelled) {
            const formatted = formatApiProduct(data.product);
            setProduct(formatted);
            setMainImage(formatted.image || "/imports/IMG_2394.png");
            setQuantity(1);
            setLoading(false);
            setError(false);
          }
        } else {
          throw new Error("Product data missing");
        }
      } catch (err) {
        if (!isCancelled) {
          console.error("Error loading watch:", err);
          setError(true);
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      isCancelled = true;
    };
  }, [id, products]);

  const handleImageError = (e) => {
    e.currentTarget.src =
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=500&auto=format&fit=crop";
  };

  const handleWhatsAppClick = async () => {
    if (!product) return;

    try {
      const now = new Date();
      const monthYear = `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}`;

      fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          monthYear,
        }),
      }).catch((err) => console.warn("WhatsApp tracking warning:", err));
    } catch (e) {
      console.error("Error tracking click:", e);
    }

    const productUrl =
      typeof window !== "undefined" && window.location?.href
        ? window.location.href
        : `https://dripessential.in/product/${product.id}`;

    const lines = [
      "Hi Drip Essential,",
      "",
      "I am interested in purchasing this watch:",
      `Brand: ${product.brand}`,
      `Model: ${product.name}`,
      `Price: ₹${product.price}`,
    ];

    if (quantity > 1) {
      lines.push(`Quantity: ${quantity}`);
    }

    lines.push("", "Product Link:", productUrl);

    const message = lines.join("\n");

    window.open(
      `https://wa.me/919137722174?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const productImages =
    product?.images && product.images.length > 0
      ? product.images
      : [product?.image];

  const displaySimilar = useMemo(() => {
    if (!product || !Array.isArray(products)) return [];
    const sameBrand = products.filter(
      (p) =>
        p.id !== product.id &&
        p.brand?.toUpperCase() === product.brand?.toUpperCase() &&
        p.status !== "Draft"
    );
    if (sameBrand.length >= 4) {
      return sameBrand.slice(0, 4);
    }
    const otherWatches = products.filter(
      (p) =>
        p.id !== product.id &&
        p.brand?.toUpperCase() !== product.brand?.toUpperCase() &&
        p.status !== "Draft"
    );
    return [...sameBrand, ...otherWatches].slice(0, 4);
  }, [product, products]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase font-sans">
            Loading Timepiece Details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="text-center space-y-4 px-6">
          <h1 className="font-['Oswald',sans-serif] text-3xl uppercase tracking-wider text-black">
            Timepiece Not Found
          </h1>
          <p className="text-xs tracking-widest text-gray-500 uppercase font-sans">
            The requested timepiece could not be found or is unavailable.
          </p>
          <div className="pt-4">
            <Link
              href="/watches"
              className="inline-block border border-black bg-black text-white px-8 py-3 text-xs font-bold tracking-widest uppercase hover:bg-white hover:text-black transition-colors"
            >
              Browse All Watches
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div
          className="flex items-center text-xs text-gray-500 mt-20 mb-8 tracking-wider"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          <Link href="/" className="hover:text-black transition-colors">
            HOME
          </Link>

          <span className="mx-3">/</span>

          <span className="hover:text-black transition-colors uppercase">
            {product.brand}
          </span>

          <span className="mx-3">/</span>

          <span className="text-black font-semibold uppercase">
            {product.name}
          </span>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 mb-20">
          {/* Left Side: Images */}
          <div className="w-full lg:w-3/5 flex flex-col-reverse lg:flex-row gap-6">
            <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-visible no-scrollbar">
              {/* {productImages.map((img, idx) => (
                <button
                  key={idx}
                  className={`w-20 h-20 flex-shrink-0 bg-[#F3F3F3] border-b-2 transition-all p-2 flex items-center justify-center ${
                    mainImage === img
                      ? "border-black"
                      : "border-transparent hover:border-gray-300"
                  }`}
                  onClick={() => setMainImage(img)}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx}`}
                    onError={handleImageError}
                    className="max-w-full max-h-full object-contain mix-blend-multiply"
                  />
                </button>
              ))} */}
            </div>

            <div className="flex-1 bg-[#F3F3F3] p-10 flex items-center justify-center min-h-[400px] lg:min-h-[600px] relative group overflow-hidden">
              {/* LCP element: eager load, high fetch priority, Cloudinary-optimised at 900px wide */}
              <img
                src={heroImageUrl(mainImage, 900)}
                alt={product.name}
                onError={handleImageError}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="w-[80%] h-auto object-contain mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-110"
              />
            </div>
          </div>

          {/* Right Side: Product Details */}
          <div className="w-full lg:w-2/5 flex flex-col">
            <p
              className="text-xs font-semibold text-gray-500 tracking-[0.2em] mb-2 uppercase"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {product.brand}
            </p>

            <h1
              className="text-4xl lg:text-5xl font-bold uppercase tracking-wide mb-6"
              style={{ fontFamily: "Oswald, sans-serif" }}
            >
              {product.name}
            </h1>

            <div
              className="text-2xl font-bold mb-2"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              MRP ₹{product.price}
            </div>

            <p
              className="text-xs text-gray-500 mb-8"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Tax included. Shipping calculated at checkout.
            </p>

            <div
              className="flex items-center gap-2 text-sm font-semibold mb-8"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {product.stock > 0 ? (
                <>
                  <div className="w-2.5 h-2.5 bg-[#25D366] rounded-full animate-pulse"></div>
                  <span>IN STOCK ({product.stock} left)</span>
                </>
              ) : (
                <>
                  <div className="w-2.5 h-2.5 bg-[#FF3B30] rounded-full"></div>
                  <span className="text-[#FF3B30]">OUT OF STOCK</span>
                </>
              )}
            </div>

            <div
              className="mb-8"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              <p className="text-sm font-semibold mb-3">QUANTITY</p>

              <div className="flex items-center border border-gray-300 w-32 h-12 rounded-sm">
                <button
                  className="cursor-pointer flex-1 h-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                  onClick={() =>
                    setQuantity(Math.max(1, quantity - 1))
                  }
                >
                  -
                </button>

                <span className="flex-1 text-center font-medium">
                  {quantity}
                </span>

                <button
                  className="cursor-pointer flex-1 h-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleWhatsAppClick}
              className="cursor-pointer w-full h-14 bg-black text-white flex items-center justify-center gap-3 font-semibold text-sm tracking-widest hover:bg-[#111111] transition-all duration-300 mb-10 hover:shadow-[0_0_15px_rgba(37,211,102,0.3)] group rounded-sm"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              <MessageCircle
                size={20}
                className="group-hover:text-[#25D366] transition-colors"
              />
              BUY IN WHATSAPP
            </button>

            <div className="border-t border-gray-200">
              {/* <AccordionItem title="DESCRIPTION" defaultOpen={true}>
                {product.description}
              </AccordionItem> */}

              {/* <AccordionItem title="SPECIFICATIONS">
                <div className="grid grid-cols-[120px_1fr] gap-y-3 gap-x-4">
                  <div className="font-semibold text-gray-900">Brand</div>
                  <div className="uppercase">{product.brand}</div>

                  <div className="font-semibold text-gray-900">Model</div>
                  <div className="uppercase">{product.name}</div>

                  <div className="font-semibold text-gray-900">Movement</div>
                  <div>Perpetual, mechanical, self-winding</div>

                  <div className="font-semibold text-gray-900">Case</div>
                  <div>41 mm, Oystersteel</div>

                  <div className="font-semibold text-gray-900">Water Res</div>
                  <div>300 metres / 1,000 feet</div>

                  <div className="font-semibold text-gray-900">Warranty</div>
                  <div>5 Years International</div>
                </div>
              </AccordionItem> */}

              <AccordionItem title="SHIPPING INFORMATION">
                <div className="flex items-start gap-3 mb-3">
                  <Truck
                    size={18}
                    className="text-gray-900 shrink-0 mt-0.5"
                  />
                  <span>
                    Shipping policy<br /><br />
                    🚚 All orders are dispatched within 36 working hours of order confirmation.
                    <br />
                    <br />
                    🎥 For complete transparency, we also share a live packing video before dispatch.
                    <br />
                    <br />
                    📦 Tracking details are shared once your order is shipped.
                  </span>
                </div>
              </AccordionItem>
            </div>

            <div
              className="mt-8 flex items-center gap-4 text-xs font-semibold tracking-widest text-gray-500"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              SHARE

              <div className="flex gap-4">
                <button className="hover:text-black transition-colors">
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Similar Products Section */}
      <section className="bg-[#F9F9F9] py-10 md:py-20">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-['Oswald',sans-serif] tracking-wide mb-6 md:mb-12 text-center uppercase">
            YOU MAY ALSO LIKE
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {displaySimilar.map((similar, idx) => (
              <Link
                href={`/product/${similar.id}`}
                key={idx}
                className="group flex flex-col bg-white relative transition-shadow hover:shadow-xl border border-gray-100/50"
              >
                <div className="relative aspect-square overflow-hidden bg-white p-2 md:p-4 flex items-center justify-center">
                  <button
                    className="absolute top-2 right-2 md:top-4 md:right-4 z-10 bg-white/95 p-1.5 md:p-2 rounded-full hover:bg-white shadow-sm transition-colors"
                    onClick={(e) => e.preventDefault()}
                  >
                    <Heart className="w-3.5 h-3.5 md:w-5 md:h-5 text-black" />
                  </button>

                  <img
                    src={cardImageUrl(similar.image, 400)}
                    alt={similar.brand}
                    onError={handleImageError}
                    loading="lazy"
                    decoding="async"
                    width={400}
                    height={400}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 mix-blend-multiply"
                  />
                </div>

                <div className="p-3 md:p-6 space-y-1 md:space-y-2">
                  <p
                    className="uppercase tracking-widest text-[9px] md:text-xs text-gray-500 font-medium"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    {similar.brand}
                  </p>

                  <h3
                    className="uppercase tracking-wide text-xs md:text-base font-semibold text-black group-hover:text-gray-600 transition-colors line-clamp-2 h-8 md:h-12"
                    style={{ fontFamily: "Oswald, sans-serif" }}
                  >
                    {similar.name}
                  </h3>

                  <p
                    className="text-xs md:text-lg font-bold text-black"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    ₹{similar.price}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
