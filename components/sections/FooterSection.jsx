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
import Link from "next/link";


const FoxframeWebLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="#a0a0a0ff" viewBox="0 0 631 477" height="24px" width="24px" >
    <path d="M 94.50,378.25 L 79.75,384.75 L 61.00,397.50 L 46.75,408.75 L 20.50,433.75 L 9.75,446.75 L 14.50,447.50 L 64.25,447.75 L 69.75,428.50 L 75.00,414.25 L 82.50,398.25 Z M 443.75,296.50 L 444.00,296.50 L 444.25,296.25 L 445.00,296.25 L 445.25,296.50 L 446.00,296.50 L 446.25,296.75 L 447.50,296.75 L 447.75,297.00 L 448.25,297.00 L 448.50,297.25 L 449.25,297.25 L 449.50,297.50 L 450.75,297.75 L 451.00,298.00 L 452.25,298.50 L 453.50,299.50 L 453.75,299.50 L 454.75,300.50 L 455.00,300.50 L 456.25,302.00 L 456.25,302.25 L 456.50,302.50 L 456.50,303.50 L 456.25,303.75 L 456.25,304.25 L 456.00,304.50 L 455.50,305.75 L 454.75,306.50 L 454.50,307.25 L 454.00,307.75 L 453.75,307.75 L 453.50,308.00 L 453.50,308.25 L 453.25,308.50 L 453.00,308.50 L 452.00,309.50 L 451.50,309.50 L 450.75,310.00 L 448.75,310.00 L 448.50,309.75 L 448.25,309.75 L 445.75,307.25 L 445.75,307.00 L 445.25,306.50 L 445.25,306.25 L 444.50,305.00 L 444.50,304.50 L 443.75,303.25 L 443.75,301.50 L 443.50,301.25 L 443.50,299.00 L 443.25,298.75 L 443.25,297.50 L 443.50,297.25 L 443.50,296.75 Z M 389.75,279.50 L 391.75,282.75 L 406.00,297.50 L 416.50,311.00 L 424.25,317.00 L 432.50,320.25 L 474.25,326.50 L 473.25,323.50 L 462.00,305.50 L 456.25,297.50 L 450.75,293.00 L 427.00,286.50 Z M 614.75,354.25 L 528.50,310.50 L 504.00,245.25 L 384.75,181.00 L 305.75,66.25 L 197.00,201.75 L 147.75,279.25 L 160.75,279.50 L 71.75,364.25 L 150.50,343.00 L 105.50,399.50 L 83.00,470.00 L 110.25,448.00 L 185.25,448.50 L 275.75,350.50 L 202.50,360.25 L 225.00,328.75 L 284.50,277.25 L 357.75,248.25 L 331.50,232.00 L 301.00,153.50 L 279.50,205.50 L 280.00,251.25 L 256.25,260.50 L 260.50,191.00 L 304.00,108.25 L 388.00,246.00 L 471.25,272.75 L 499.75,331.25 L 562.00,357.50 L 575.75,380.00 L 537.50,406.75 L 429.00,376.50 L 352.00,376.50 L 309.25,396.25 L 337.75,403.50 L 285.25,449.50 L 351.75,450.00 L 401.00,419.50 L 456.25,409.75 L 530.00,417.50 L 491.50,447.25 L 574.25,409.50 Z M 506.50,63.50 L 453.50,93.50 L 381.00,140.50 L 392.75,161.00 L 442.50,182.75 L 437.25,172.25 L 423.00,161.75 L 441.25,139.50 L 470.50,112.00 L 445.50,181.75 L 447.75,186.25 L 467.25,197.75 Z" fillRule="evenodd" />
  </svg>
);


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
          <div className="mt-2 xl:mt-3 flex gap-2 justify-center align-middle items-center">
            <FoxframeWebLogo />
            <p className="text-xs sm:text-sm font-semibold text-white/60">
              Built by <Link href={"https://www.instagram.com/foxframe.web/"} target="_blank" className="underline underline-offset-3 decoration-white/40 hover:text-white hover:decoration-white/90  transition-colors duration-300 delay-150 ">Foxframe Web</Link>
            </p>
          </div>
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
