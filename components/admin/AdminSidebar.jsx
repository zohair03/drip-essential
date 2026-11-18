"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Watch,
  PlusCircle,
  Layers,
  MessageCircle,
  Settings,
  LogOut,
  ExternalLink,
  X,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export default function AdminSidebar({
  admin,
  mobileOpen = false,
  onCloseMobile = () => {},
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  };

  const navItems = [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Products",
      href: "/admin/products",
      icon: Watch,
      exact: true,
    },
    {
      label: "Add Product",
      href: "/admin/products/add",
      icon: PlusCircle,
      exact: true,
    },
    {
      label: "Watch Showcase",
      href: "/admin/showcase",
      icon: Sparkles,
      exact: false,
    },
    {
      label: "Best Sellers",
      href: "/admin/bestsellers",
      icon: TrendingUp,
      exact: false,
    },
    {
      label: "Brands",
      href: "/admin/brands",
      icon: Layers,
      exact: false,
    },
    {
      label: "WhatsApp Analytics",
      href: "/admin/analytics",
      icon: MessageCircle,
      exact: true,
    },
    {
      label: "Settings",
      href: "/admin/settings",
      icon: Settings,
      exact: true,
    },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white border-r border-zinc-200/80 p-5 font-sans">
      {/* Brand Header */}
      <div>
        <div className="flex items-center justify-between pb-6 border-b border-zinc-100">
          <Link
            href="/admin/dashboard"
            onClick={onCloseMobile}
            className="flex items-center gap-3 group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white font-black text-xs tracking-widest shadow-sm">
              DE
            </div>
            <div>
              <span className="block text-xs font-extrabold tracking-widest text-zinc-950 uppercase">
                Drip Essentials
              </span>
              <span className="block text-[10px] font-semibold text-zinc-400 tracking-wider uppercase">
                Admin Console
              </span>
            </div>
          </Link>

          {/* Mobile close button */}
          <button
            onClick={onCloseMobile}
            className="md:hidden rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="mt-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold tracking-wider transition-all uppercase ${
                  isActive
                    ? "bg-zinc-900 text-white shadow-sm"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-900"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Area: User info, View Store & Logout */}
      <div className="pt-6 border-t border-zinc-100 space-y-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between rounded-lg bg-zinc-50 border border-zinc-200/80 px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 hover:text-black transition"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
            <span>View Storefront</span>
          </span>
          <span className="text-[10px] text-zinc-400 uppercase">Live</span>
        </Link>

        {/* Admin profile snippet */}
        <div className="flex items-center justify-between rounded-lg bg-zinc-50/70 p-2.5 border border-zinc-100">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-zinc-700 font-bold text-xs uppercase">
              {admin?.name ? admin.name.charAt(0) : "A"}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-xs font-bold text-zinc-900">
                {admin?.name || "Administrator"}
              </p>
              <p className="truncate text-[10px] text-zinc-500">
                {admin?.email || "admin@dripessentials.com"}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Log out"
            className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 transition"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed) */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          />
          <div className="relative flex w-72 max-w-[85%] h-full flex-col">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
