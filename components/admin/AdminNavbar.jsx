"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Plus, ExternalLink, ShieldCheck } from "lucide-react";

export default function AdminNavbar({
  admin,
  onOpenMobile = () => {},
}) {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === "/admin/dashboard") return "Dashboard Overview";
    if (pathname === "/admin/products") return "Watch Inventory";
    if (pathname === "/admin/products/add") return "Add New Watch";
    if (pathname?.startsWith("/admin/products/edit")) return "Edit Watch";
    if (pathname === "/admin/showcase") return "Watch Showcase Management";
    if (pathname === "/admin/bestsellers") return "Best Sellers Management";
    if (pathname === "/admin/brands") return "Brand Management";
    if (pathname === "/admin/brands/add") return "Create New Brand";
    if (pathname?.startsWith("/admin/brands/edit")) return "Edit Brand";
    if (pathname === "/admin/analytics") return "WhatsApp Inquiries Analytics";
    if (pathname === "/admin/settings") return "Store Settings";
    return "Admin Console";
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-zinc-200/80 bg-white/95 px-6 backdrop-blur-md">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobile}
          className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-black md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-sm font-bold tracking-wider text-zinc-950 uppercase font-sans">
            {getPageTitle()}
          </h1>
          <p className="hidden sm:block text-[11px] text-zinc-400 font-medium">
            Drip Essentials Luxury Timepieces
          </p>
        </div>
      </div>

      {/* Right: Quick actions & status */}
      <div className="flex items-center gap-3">
        {/* Quick Add Product Button */}
        {pathname !== "/admin/products/add" && (
          <Link
            href="/admin/products/add"
            className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-black px-3.5 py-1.5 text-xs font-bold text-white tracking-wider uppercase transition hover:bg-zinc-800 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Watch</span>
          </Link>
        )}

        {/* Database Status indicator */}
        <div className="hidden lg:flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/60 px-3 py-1 text-[11px] font-semibold text-emerald-800">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>MongoDB Connected</span>
        </div>

        {/* Admin initials avatar */}
        <div className="flex items-center gap-2 border-l border-zinc-200 pl-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-white font-bold text-xs uppercase shadow-xs">
            {admin?.name ? admin.name.charAt(0) : "A"}
          </div>
          <span className="hidden md:block text-xs font-semibold text-zinc-800">
            {admin?.name || "Admin"}
          </span>
        </div>
      </div>
    </header>
  );
}
