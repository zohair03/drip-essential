import { Suspense } from "react";
import AdminShell from "@/components/admin/AdminShell";

export const metadata = {
  title: "Admin Console | Drip Essentials",
  description: "Internal management portal for Drip Essentials luxury timepieces",
};

export default function AdminLayout({ children }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center text-sm text-neutral-400 font-mono">Loading Admin Portal...</div>}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
