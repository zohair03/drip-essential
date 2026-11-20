"use client";
import { useState, useEffect } from "react";
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
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen
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

  // Find product by id, fallback to first product if not found
  const product = products.find((p) => p.id === id) || products[0];

  const [mainImage, setMainImage] = useState(
    product?.image || "/imports/IMG_2394.png"
  );
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    window.scrollTo(0, 0);

    const timer = setTimeout(() => {
      if (product) {
        setMainImage(product.image || "/imports/IMG_2394.png");
        setQuantity(1);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [id, product]);

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

    let message = `I'm interested in buying the ${product.name} (${product.brand})`;

    if (quantity > 1) {
      message += ` (Quantity: ${quantity})`;
    }

    window.open(
      `https://wa.me/919137722174?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const productImages =
    product?.images && product.images.length > 0
      ? product.images
      : [product?.image];

  const displaySimilar = products
    .filter((p) => p.id !== product?.id && p.status !== "Draft")
    .slice(0, 4);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center font-['Oswald',sans-serif] text-2xl">
        Product not found
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
              {productImages.map((img, idx) => (
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
              ))}
            </div>

            <div className="flex-1 bg-[#F3F3F3] p-10 flex items-center justify-center min-h-[400px] lg:min-h-[600px] relative group overflow-hidden">
              <img
                src={mainImage}
                alt={product.name}
                onError={handleImageError}
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
              <AccordionItem title="DESCRIPTION" defaultOpen={true}>
                {product.description}
              </AccordionItem>

              <AccordionItem title="SPECIFICATIONS">
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
              </AccordionItem>

              <AccordionItem title="SHIPPING INFORMATION">
                <div className="flex items-start gap-3 mb-3">
                  <Truck
                    size={18}
                    className="text-gray-900 shrink-0 mt-0.5"
                  />
                  <span>
                    Complimentary insured express shipping worldwide.
                    Dispatched within 24-48 hours. Signature required upon
                    delivery.
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
                    src={similar.image}
                    alt={similar.brand}
                    onError={handleImageError}
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
