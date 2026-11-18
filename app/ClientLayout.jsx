"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import FooterSection from "@/components/sections/FooterSection";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      {children}
      <FooterSection />
    </>
  );
}
