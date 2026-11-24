"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { thumbImageUrl } from "@/lib/cloudinaryUrl";
import {
  Watch,
  Layers,
  MessageCircle,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Loader2,
  CheckCircle,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/stats", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Could not load dashboard stats");
        return res.json();
      })
      .then((json) => {
        if (active) {
          if (json.success) setData(json.stats);
          else setError(json.error || "Failed to load stats");
        }
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/stats", { cache: "no-store" });
      if (!res.ok) throw new Error("Could not load dashboard stats");
      const json = await res.json();
      if (json.success) {
        setData(json.stats);
      } else {
        throw new Error(json.error || "Failed to load stats");
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${deleteModal.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteModal(null);
        fetchStats();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to delete product");
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
        <p className="font-bold">Failed to load dashboard metrics</p>
        <p className="mt-1 text-xs">{error}</p>
        <button
          onClick={fetchStats}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white uppercase tracking-wider"
        >
          Retry
        </button>
      </div>
    );
  }

  const {
    totalProducts = 0,
    activeProducts = 0,
    draftProducts = 0,
    totalBrands = 0,
    outOfStock = 0,
    totalClicks = 0,
    recentProducts = [],
    lowStockProducts = [],
    mostClicked = [],
  } = data || {};

  return (
    <div className="space-y-8 font-sans">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-zinc-200/80">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900">
            Welcome back, Admin
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Here&apos;s an overview of your watch collection and WhatsApp customer inquiries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/add"
            className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-xs font-bold text-white tracking-widest uppercase transition hover:bg-zinc-800 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Product</span>
          </Link>
          <Link
            href="/admin/brands/add"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-800 tracking-widest uppercase transition hover:bg-zinc-50"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Brand</span>
          </Link>
        </div>
      </div>

      {/* 6 Key Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Products */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Total Watches
            </span>
            <Watch className="h-4 w-4 text-zinc-400" />
          </div>
          <p className="text-2xl font-extrabold text-zinc-900">{totalProducts}</p>
          <span className="text-[10px] text-zinc-400 font-medium">In database</span>
        </div>

        {/* Active Products */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Active Store
            </span>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-700">{activeProducts}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Visible to buyers</span>
        </div>

        {/* Draft Products */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Drafts
            </span>
            <span className="h-2 w-2 rounded-full bg-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-amber-600">{draftProducts}</p>
          <span className="text-[10px] text-zinc-400 font-medium">Hidden from store</span>
        </div>

        {/* Total Brands */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Brands
            </span>
            <Layers className="h-4 w-4 text-zinc-400" />
          </div>
          <p className="text-2xl font-extrabold text-zinc-900">{totalBrands}</p>
          <span className="text-[10px] text-zinc-400 font-medium">Rolex, Omega, etc.</span>
        </div>

        {/* Out of Stock */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Out of Stock
            </span>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-2xl font-extrabold text-red-600">{outOfStock}</p>
          <span className="text-[10px] text-red-500 font-medium">Needs inventory</span>
        </div>

        {/* WhatsApp Clicks */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              WhatsApp Clicks
            </span>
            <MessageCircle className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-zinc-900">{totalClicks}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Direct inquiries</span>
        </div>
      </div>

      {/* Main Grid: Recent Products (2/3) + Sidebar panels (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Products Table */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold tracking-wider uppercase text-zinc-950">
                Recently Added Watches
              </h3>
              <p className="text-xs text-zinc-400">Latest additions to your catalog</p>
            </div>
            <Link
              href="/admin/products"
              className="text-xs font-bold text-zinc-800 hover:text-black tracking-wider uppercase flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recentProducts.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-400 border border-dashed rounded-xl">
              No products found in the database.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    <th className="pb-3">Watch</th>
                    <th className="pb-3">Brand</th>
                    <th className="pb-3">Price</th>
                    <th className="pb-3">Stock</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 font-medium">
                  {recentProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-50/60 transition">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 rounded-lg border border-zinc-200 bg-zinc-50 overflow-hidden flex items-center justify-center p-1">
                            {p.image ? (
                              <img
                                src={thumbImageUrl(p.image, 80)}
                                alt={p.name}
                                loading="lazy"
                                decoding="async"
                                width={40}
                                height={40}
                                className="h-full w-full object-contain mix-blend-multiply"
                              />
                            ) : (
                              <Watch className="h-4 w-4 text-zinc-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-zinc-900 line-clamp-1">
                              {p.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-zinc-500 uppercase font-semibold">
                        {p.brand}
                      </td>
                      <td className="py-3 font-bold text-zinc-900">
                        ₹{new Intl.NumberFormat("en-IN").format(p.price)}
                      </td>
                      <td className="py-3">
                        <span
                          className={`font-semibold ${
                            p.stock > 0 ? "text-zinc-700" : "text-red-600 font-bold"
                          }`}
                        >
                          {p.stock > 0 ? `${p.stock} pcs` : "Out of stock"}
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            p.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                              : "bg-amber-50 text-amber-700 border border-amber-200/60"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/products/edit/${p.id}`}
                            title="Edit"
                            className="rounded p-1 text-zinc-400 hover:text-black hover:bg-zinc-100"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            onClick={() => setDeleteModal(p)}
                            title="Delete"
                            className="rounded p-1 text-zinc-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Sidebar: Low Stock + Most Inquired on WhatsApp */}
        <div className="space-y-6">
          {/* Most Clicked on WhatsApp */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold tracking-wider uppercase text-zinc-900">
                Most Inquired Watches
              </h3>
              <Link
                href="/admin/analytics"
                className="text-[10px] font-bold text-zinc-400 hover:text-black uppercase"
              >
                Analytics →
              </Link>
            </div>

            {mostClicked.length === 0 ? (
              <p className="text-xs text-zinc-400 italic py-4 text-center">
                No customer inquiries tracked yet.
              </p>
            ) : (
              <div className="space-y-3">
                {mostClicked.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-100 text-xs"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <span className="text-[10px] font-extrabold text-zinc-400 w-4">
                        #{idx + 1}
                      </span>
                      <div className="truncate">
                        <p className="font-bold text-zinc-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-zinc-400 uppercase font-medium">
                          {item.brand}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200/60">
                      {item.totalClicks} clicks
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Low Stock Alerts */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs">
            <h3 className="text-xs font-bold tracking-wider uppercase text-zinc-900 mb-4">
              Low Stock Warnings
            </h3>

            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-zinc-400 italic py-4 text-center">
                All inventory levels are optimal.
              </p>
            ) : (
              <div className="space-y-2.5">
                {lowStockProducts.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50/60 border border-amber-200/60 text-xs"
                  >
                    <div className="truncate pr-2">
                      <p className="font-bold text-zinc-900 truncate">{p.name}</p>
                      <p className="text-[10px] text-zinc-500 uppercase">{p.brand}</p>
                    </div>
                    <span className="shrink-0 font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[10px]">
                      {p.stock} left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-zinc-900">
              Confirm Watch Deletion
            </h3>
            <p className="mt-2 text-xs text-zinc-600">
              Are you sure you want to delete{" "}
              <strong className="text-black">&quot;{deleteModal.name}&quot;</strong>?
              This will permanently remove the product and its associated Cloudinary images.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteModal(null)}
                disabled={deleting}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 flex items-center gap-2"
              >
                {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
