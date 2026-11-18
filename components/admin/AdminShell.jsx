"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";
import { Loader2 } from "lucide-react";

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === "/admin/login";

  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(!isLoginPage);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // If on login page, skip session check
    if (isLoginPage) {
      const timer = setTimeout(() => setLoading(false), 0);
      return () => clearTimeout(timer);
    }

    let isMounted = true;

    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.success && isMounted) {
            setAdmin(data.admin);
            setLoading(false);
            return;
          }
        }
        // Not authenticated
        if (isMounted) {
          router.replace("/admin/login");
        }
      } catch (err) {
        console.error("Session check error:", err);
        if (isMounted) {
          router.replace("/admin/login");
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [pathname, isLoginPage, router]);

  // If login page, render children without sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#F8F8F8]">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white font-black text-sm tracking-widest shadow-md mb-4">
          DE
        </div>
        <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-zinc-600 uppercase">
          <Loader2 className="h-4 w-4 animate-spin text-zinc-900" />
          <span>Authenticating Admin Console...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] text-zinc-900 font-sans flex flex-col">
      <AdminSidebar
        admin={admin}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area (Offset by desktop sidebar width 64 = 16rem = 256px) */}
      <div className="md:pl-64 flex flex-1 flex-col">
        <AdminNavbar
          admin={admin}
          onOpenMobile={() => setMobileMenuOpen(true)}
        />

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
