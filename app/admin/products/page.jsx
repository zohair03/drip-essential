"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { thumbImageUrl } from "@/lib/cloudinaryUrl";
import OrderSortControl from "@/components/admin/OrderSortControl";
import {
  Watch,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Edit2,
  Trash2,
  ExternalLink,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedStock, setSelectedStock] = useState("all");
  const [sortBy, setSortBy] = useState("order");
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch Brands for filter dropdown
  useEffect(() => {
    fetch("/api/brands?all=true")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setBrands(d.brands || []);
      })
      .catch((e) => console.error(e));
  }, []);

  // Fetch Products with filters
  useEffect(() => {
    let active = true;
    const params = new URLSearchParams();
    params.set("admin", "true");
    params.set("limit", "1000");
    params.set("all", "true");
    params.set("t", Date.now().toString());
    if (search.trim()) params.set("search", search.trim());
    if (selectedBrand !== "all") params.set("brand", selectedBrand);
    if (selectedStatus !== "all") params.set("status", selectedStatus);
    if (sortBy) params.set("sort", sortBy);

    fetch(`/api/products?${params.toString()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data.success) {
          let list = data.products || [];
          if (selectedStock === "in-stock") {
            list = list.filter((p) => p.stock > 0);
          } else if (selectedStock === "out-of-stock") {
            list = list.filter((p) => p.stock === 0);
          }
          setProducts(list);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [search, selectedBrand, selectedStatus, selectedStock, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("admin", "true");
      params.set("limit", "1000");
      params.set("all", "true");
      params.set("t", Date.now().toString());
      if (search.trim()) params.set("search", search.trim());
      if (selectedBrand !== "all") params.set("brand", selectedBrand);
      if (selectedStatus !== "all") params.set("status", selectedStatus);
      if (sortBy) params.set("sort", sortBy);

      const res = await fetch(`/api/products?${params.toString()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (data.success) {
        let list = data.products || [];
        if (selectedStock === "in-stock") {
          list = list.filter((p) => p.stock > 0);
        } else if (selectedStock === "out-of-stock") {
          list = list.filter((p) => p.stock === 0);
        }
        setProducts(list);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMoveItem = async (index, direction) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= products.length) return;

    const newProducts = [...products];
    const [movedProduct] = newProducts.splice(index, 1);
    newProducts.splice(targetIndex, 0, movedProduct);

    // Normalize sequential orders 1..N
    const resequenced = newProducts.map((p, idx) => ({
      ...p,
      order: idx + 1,
    }));

    // Optimistic UI update
    setProducts(resequenced);

    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: resequenced.map((p) => ({ id: p.id, order: p.order })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update product orders");
      }
      setSuccessMsg("Product order updated successfully");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Product order move error:", err);
      fetchProducts();
    }
  };

  const handleOrderChange = async (product, newOrder) => {
    const orderNum = parseInt(newOrder, 10);
    if (isNaN(orderNum) || orderNum === product.order || orderNum < 1) return;

    const currentIndex = products.findIndex((p) => p.id === product.id);
    if (currentIndex === -1) return;

    const targetIndex = Math.max(0, Math.min(products.length - 1, orderNum - 1));
    if (currentIndex === targetIndex) return;

    const newProducts = [...products];
    const [movedProduct] = newProducts.splice(currentIndex, 1);
    newProducts.splice(targetIndex, 0, movedProduct);

    // Normalize sequential orders 1..N
    const resequenced = newProducts.map((p, idx) => ({
      ...p,
      order: idx + 1,
    }));

    // Optimistic UI update
    setProducts(resequenced);

    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: resequenced.map((p) => ({ id: p.id, order: p.order })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update product orders");
      }
      setSuccessMsg("Product order updated successfully");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Product order change error:", err);
      fetchProducts();
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${deleteModal.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteModal(null);
        fetchProducts();
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

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-zinc-200/80">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900">
            Watch Inventory
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Manage, filter, and edit all watches in your catalog.
          </p>
        </div>

        <Link
          href="/admin/products/add"
          className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-xs font-bold text-white tracking-widest uppercase transition hover:bg-zinc-800 shadow-sm w-fit"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add New Watch</span>
        </Link>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <input
              type="text"
              placeholder="Search by watch name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 py-2 pl-9 pr-3 text-xs font-medium text-zinc-900 placeholder-zinc-400 focus:border-black focus:bg-white focus:outline-none transition"
            />
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
          </div>

          {/* Brand Filter */}
          <div>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-xs font-semibold text-zinc-700 uppercase focus:border-black focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="all">All Brands</option>
              {brands.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-xs font-semibold text-zinc-700 uppercase focus:border-black focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Draft">Drafts Only</option>
            </select>
          </div>

          {/* Stock Filter */}
          <div>
            <select
              value={selectedStock}
              onChange={(e) => setSelectedStock(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-xs font-semibold text-zinc-700 uppercase focus:border-black focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="all">All Stock</option>
              <option value="in-stock">In Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Status count bar */}
        <div className="flex items-center justify-between text-[11px] text-zinc-400 font-semibold tracking-wider uppercase border-t border-zinc-100 pt-3">
          <span>Showing {products.length} watches</span>
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-zinc-900 font-bold focus:outline-none cursor-pointer"
            >
              <option value="order">Custom Order</option>
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white overflow-hidden shadow-xs">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-900" />
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-500 space-y-3">
            <Watch className="h-8 w-8 mx-auto text-zinc-300" />
            <p className="font-bold text-zinc-700">No watches found</p>
            <p className="text-zinc-400">Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/70 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  <th className="py-3.5 px-4 w-28">Order</th>
                  <th className="py-3.5 px-4">Watch</th>
                  <th className="py-3.5 px-4">Brand</th>
                  <th className="py-3.5 px-4">Price (INR)</th>
                  <th className="py-3.5 px-4">Inventory</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Added</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-medium">
                {products.map((p, index) => (
                  <tr key={p.id} className="hover:bg-zinc-50/50 transition">
                    {/* Order Control */}
                    <td className="py-3 px-4">
                      <OrderSortControl
                        order={p.order ?? index + 1}
                        index={index}
                        totalItems={products.length}
                        onMoveUp={() => handleMoveItem(index, "up")}
                        onMoveDown={() => handleMoveItem(index, "down")}
                        onOrderChange={(newOrder) => handleOrderChange(p, newOrder)}
                      />
                    </td>

                    {/* Watch Name & Thumbnail */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 shrink-0 rounded-lg border border-zinc-200 bg-zinc-50 overflow-hidden flex items-center justify-center p-1">
                          {p.image ? (
                            <img
                              src={thumbImageUrl(p.image, 96)}
                              alt={p.name}
                              loading="lazy"
                              decoding="async"
                              width={48}
                              height={48}
                              className="h-full w-full object-contain mix-blend-multiply"
                            />
                          ) : (
                            <Watch className="h-5 w-5 text-zinc-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900 hover:text-black line-clamp-1">
                            {p.name}
                          </p>
                          <p className="text-[10px] text-zinc-400 font-mono">
                            ID: {p.id.slice(-6)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Brand */}
                    <td className="py-3 px-4 font-bold uppercase text-zinc-700">
                      {p.brand}
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 font-extrabold text-zinc-900">
                      ₹{new Intl.NumberFormat("en-IN").format(p.price)}
                    </td>

                    {/* Stock */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 font-bold ${
                          p.stock > 5
                            ? "text-zinc-700"
                            : p.stock > 0
                            ? "text-amber-600"
                            : "text-red-600"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            p.stock > 5
                              ? "bg-emerald-500"
                              : p.stock > 0
                              ? "bg-amber-500"
                              : "bg-red-500"
                          }`}
                        />
                        <span>{p.stock} in stock</span>
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
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

                    {/* Date */}
                    <td className="py-3 px-4 text-zinc-400 text-[11px]">
                      {p.createdAt
                        ? new Date(p.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/product/${p.id}`}
                          target="_blank"
                          title="View on store"
                          className="rounded p-1.5 text-zinc-400 hover:text-black hover:bg-zinc-100 transition"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/products/edit/${p.id}`}
                          title="Edit watch"
                          className="rounded p-1.5 text-zinc-400 hover:text-black hover:bg-zinc-100 transition"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteModal(p)}
                          title="Delete watch"
                          className="rounded p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600 mb-2">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="text-base font-bold text-zinc-900">
                Delete Watch Permanently?
              </h3>
            </div>

            <p className="mt-2 text-xs text-zinc-600">
              Are you sure you want to delete{" "}
              <strong className="text-black">&quot;{deleteModal.name}&quot;</strong>?
              This action cannot be undone and will delete all associated Cloudinary images.
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
                onClick={handleDelete}
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
