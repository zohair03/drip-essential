"use client";

import { useState } from "react";
import {
  Instagram,
  Mail,
  Phone,
  X,
  ShieldAlert,
  Truck,
  RefreshCw,
} from "lucide-react";

export default function FooterSection() {
  const [isShippingOpen, setIsShippingOpen] = useState(false);
  const [isReturnsOpen, setIsReturnsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const handleHomeClick = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#0a0a0a] text-white border-t border-zinc-900 font-sans">
      {/* Main Footer Content */}
      <div className="max-w-[1000px] mx-auto px-6 py-16">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 md:gap-x-16">

          {/* Column 1 Top: Quick Links */}
          <div>
            <h4 className="uppercase tracking-widest text-xs md:text-sm font-extrabold text-white mb-6">
              Quick Links
            </h4>

            <ul className="space-y-4 text-xs md:text-sm text-zinc-400 font-medium font-sans">
              <li>
                <button
                  type="button"
                  onClick={handleHomeClick}
                  className="hover:text-white transition-colors text-xs md:text-sm font-medium font-sans block text-left cursor-pointer"
                >
                  Home
                </button>
              </li>

              <li>
                <button
                  onClick={() => setIsAboutOpen(true)}
                  className="hover:text-white transition-colors cursor-pointer text-left focus:outline-none text-xs md:text-sm font-medium font-sans block w-full"
                >
                  About Us
                </button>
              </li>

              <li>
                <button
                  onClick={() => setIsShippingOpen(true)}
                  className="hover:text-white transition-colors cursor-pointer text-left focus:outline-none text-xs md:text-sm font-medium font-sans block w-full"
                >
                  Shipping Info
                </button>
              </li>

              <li>
                <button
                  onClick={() => setIsReturnsOpen(true)}
                  className="hover:text-white transition-colors cursor-pointer text-left focus:outline-none text-xs md:text-sm font-medium font-sans block w-full"
                >
                  Returns
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2 Top: Get in Touch */}
          <div>
            <h4 className="uppercase tracking-widest text-xs md:text-sm font-extrabold text-white mb-6">
              Get in Touch
            </h4>

            <ul className="space-y-4 text-xs md:text-sm text-zinc-400 font-medium">
              <li>
                <a
                  href="mailto:dripessential62@gmail.com"
                  className="flex items-center gap-3 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4 text-zinc-500 shrink-0" />
                  <span className="truncate">
                    dripessential62@gmail.com
                  </span>
                </a>
              </li>

              <li>
                <a
                  href="https://wa.me/919137722174"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4 text-zinc-500 shrink-0" />
                  <span>+91 91377 22174</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 1 Bottom: We Accept */}
          <div>
            <h4 className="uppercase tracking-widest text-xs md:text-sm font-extrabold text-white mb-6">
              We Accept
            </h4>

            <div className="flex flex-wrap gap-2">
              {["VISA", "MC", "UPI", "COD"].map((payment) => (
                <span
                  key={payment}
                  className="bg-[#161616] border border-zinc-800/80 text-[10px] md:text-xs font-bold text-white px-3 py-1.5 rounded-lg select-none"
                >
                  {payment}
                </span>
              ))}
            </div>
          </div>

          {/* Column 2 Bottom: Social */}
          <div>
            <h4 className="uppercase tracking-widest text-xs md:text-sm font-extrabold text-white mb-6">
              Social
            </h4>

            <a
              href="https://www.instagram.com/_dripessential.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors text-xs md:text-sm"
            >
              {/* <Instagram /> */}
              <span>Instagram</span>
            </a>
          </div>
        </div>

        {/* Divider Line */}
        <div className="border-t border-zinc-900 mt-16 pt-8 text-center">
          <p className="text-zinc-500 text-xs md:text-sm font-medium">
            © 2026 dripessential.in. All rights reserved.
          </p>
        </div>
      </div>

      {/* Shipping Info Modal */}
      {isShippingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer transition-opacity"
            onClick={() => setIsShippingOpen(false)}
          />

          <div className="relative bg-[#121212] border border-zinc-800 rounded-xl max-w-md w-full p-8 shadow-2xl z-10 transform scale-100 transition-all duration-300">
            <button
              onClick={() => setIsShippingOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4 text-white">
                <Truck className="w-6 h-6" />
              </div>

              <h3
                className="uppercase tracking-wider text-xl mb-6 font-semibold text-white"
                style={{ fontFamily: "Oswald, sans-serif" }}
              >
                Shipping Info
              </h3>

              <div
                className="space-y-4 text-gray-300 text-sm leading-relaxed"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                <p>
                  All orders are dispatched within 36 working hours of order confirmation.
                </p>
                <p>
                  For complete transparency, we also share a live packing video before dispatch.
                </p>
                <p>
                  Tracking details are shared once your order is shipped.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Returns Modal */}
      {isReturnsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer transition-opacity"
            onClick={() => setIsReturnsOpen(false)}
          />

          <div className="relative bg-[#121212] border border-zinc-800 rounded-xl max-w-lg w-full p-8 shadow-2xl z-10 max-h-[85vh] overflow-y-auto transform scale-100 transition-all duration-300">
            <button
              onClick={() => setIsReturnsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white shrink-0">
                  <RefreshCw className="w-5 h-5" />
                </div>

                <div>
                  <h3
                    className="uppercase tracking-wider text-lg font-semibold leading-tight text-white"
                    style={{ fontFamily: "Oswald, sans-serif" }}
                  >
                    Return & Refund Policy
                  </h3>
                  <p className="text-xs text-gray-400 font-mono">
                    DRIP ESSENTIAL
                  </p>
                </div>
              </div>

              <div
                className="space-y-6 text-gray-300 text-sm leading-relaxed"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                <p className="text-gray-200 font-medium">
                  At Drip Essential, we ensure top-quality watches, but if you receive a damaged or defective piece, we’ve got you covered!
                </p>

                <div className="border-l-2 border-white/20 pl-4 space-y-3 bg-white/5 p-4 rounded-r-lg">
                  <h4 className="font-semibold text-white flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-white" />
                    Returns & Replacements:
                  </h4>

                  <ul className="list-disc list-inside space-y-1 text-gray-300 text-xs">
                    <li>
                      We only accept returns/replacements for watches that arrive with damaged.
                    </li>
                    <li>
                      A clear, uncut, and unedited unboxing video is mandatory as proof.
                    </li>
                  </ul>
                </div>

                <div className="border-l-2 border-red-500/50 pl-4 space-y-3 bg-red-500/5 p-4 rounded-r-lg">
                  <h4 className="font-semibold text-red-400">
                    No Returns/Refunds for:
                  </h4>

                  <ul className="list-disc list-inside text-gray-300 text-xs">
                    <li>
                      Orders without a valid unboxing video.
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-white">Process:</h4>

                  <ol className="space-y-2 text-xs">
                    <li className="flex gap-2">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/10 text-white font-semibold shrink-0">
                        1
                      </span>
                      <span>
                        Record a full, uncut unboxing video from the moment you open the package.
                      </span>
                    </li>

                    <li className="flex gap-2">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/10 text-white font-semibold shrink-0">
                        2
                      </span>
                      <span>
                        If damaged, contact us within 24 hours of delivery with the video proof.
                      </span>
                    </li>

                    <li className="flex gap-2">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/10 text-white font-semibold shrink-0">
                        3
                      </span>
                      <span>
                        Once verified, we’ll arrange a replacement or return as needed.
                      </span>
                    </li>
                  </ol>
                </div>

                <p className="text-center text-xs text-gray-400 font-medium pt-4 border-t border-zinc-800">
                  We value your trust and ensure 100% transparency in every purchase!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* About Us Modal */}
      {isAboutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer transition-opacity"
            onClick={() => setIsAboutOpen(false)}
          />

          <div className="relative bg-[#121212] border border-zinc-800 rounded-xl max-w-xl w-full p-8 shadow-2xl z-10 max-h-[85vh] overflow-y-auto transform scale-100 transition-all duration-300">
            <button
              onClick={() => setIsAboutOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col">
              <h3
                className="uppercase tracking-wider text-xl mb-6 font-semibold text-white text-center"
                style={{ fontFamily: "Oswald, sans-serif" }}
              >
                About Drip Essentials
              </h3>

              <div
                className="space-y-4 text-zinc-300 text-sm leading-relaxed text-left"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                <p>
                  Founded in 2021, Drip Essentials was created with a vision to make luxury-inspired timepieces accessible to watch enthusiasts across India. Our mission is simple—to offer premium-quality watches that combine timeless design, exceptional craftsmanship, and unbeatable value.
                </p>

                <p>
                  We understand that finding high-quality luxury watches at the right price can be difficult. That’s why we carefully curate premium-quality timepieces that deliver style, precision, and durability without the premium retail price.
                </p>

                <p>
                  At Drip Essentials, trust and transparency are at the core of everything we do. We offer Cash on Delivery (COD) across India and provide live product videos before dispatch if you ask, so you can see your watch before it reaches your doorstep. For customers who want extra confidence, we also offer video call verification, allowing you to inspect your watch in real time before shipping.
                </p>

                <p>
                  Operating online and delivering across India, our mission is to provide a smooth, secure, and reliable shopping experience for every customer. Every order is packed with care and dispatched quickly, ensuring your watch arrives safely and ready to wear.
                </p>

                <p>
                  Whether you’re adding to your collection or purchasing your first luxury-inspired timepiece, Drip Essentials is committed to delivering premium quality, complete transparency, and outstanding customer satisfaction.
                </p>

                <p className="font-semibold text-white text-center mt-6">
                  Welcome to Drip Essentials — where luxury meets trust.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
