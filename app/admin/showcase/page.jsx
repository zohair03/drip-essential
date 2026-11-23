"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import OrderSortControl from "@/components/admin/OrderSortControl";
import {
  Sparkles,
  Plus,
  Trash2,
  Loader2,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
  ArrowUpDown,
  MoveUp,
  MoveDown,
} from "lucide-react";

export default function ShowcaseAdminPage() {
  const [items, setItems] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [orderInput, setOrderInput] = useState(1);
  const [statusInput, setStatusInput] = useState("Active");
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch showcase items
  const fetchShowcaseItems = useCallback(async () => {
    try {
      setError("");
      const res = await fetch("/api/showcase?all=true", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setItems(data.items || []);
      } else {
        throw new Error(data.error || "Failed to load showcase items");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load showcase items");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all products for selection modal
  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products?limit=200&admin=true", {
        cache: "no-store",
      });
      const data = await res.json();
      if (data.success) {
        setAllProducts(data.products || []);
      }
    } catch (err) {
      console.error("Failed to load inventory:", err);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchShowcaseItems();
      fetchProducts();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchShowcaseItems, fetchProducts]);

  const showcaseProductIds = useMemo(() => {
    return new Set(items.map((it) => it.product?.id || it.product?._id));
  }, [items]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return allProducts;
    return allProducts.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        (typeof p.brand === "string" ? p.brand : p.brand?.name)
          ?.toLowerCase()
          .includes(q)
    );
  }, [allProducts, searchQuery]);

  const handleOpenAddModal = () => {
    setSelectedProductId("");
    setSearchQuery("");
    setModalError("");
    setOrderInput(items.length + 1);
    setStatusInput("Active");
    setIsAddModalOpen(true);
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    setModalError("");

    if (!selectedProductId) {
      setModalError("Please select a watch to add to the showcase.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/showcase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProductId,
          order: Number(orderInput) || items.length + 1,
          status: statusInput,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to add watch to showcase");
      }

      setSuccessMsg("Watch successfully added to Homepage Showcase!");
      setTimeout(() => setSuccessMsg(""), 4000);
      setIsAddModalOpen(false);
      fetchShowcaseItems();
    } catch (err) {
      setModalError(err.message || "Failed to add watch");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (item) => {
    const newStatus = item.status === "Active" ? "Inactive" : "Active";
    try {
      const res = await fetch("/api/showcase", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, status: newStatus } : it))
        );
      }
    } catch (err) {
      console.error("Status toggle error:", err);
    }
  };

  const handleMoveItem = async (index, direction) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const newItems = [...items];
    const [movedItem] = newItems.splice(index, 1);
    newItems.splice(targetIndex, 0, movedItem);

    // Normalize sequential orders 1..N
    const resequenced = newItems.map((it, idx) => ({
      ...it,
      order: idx + 1,
    }));

    // Optimistic UI update
    setItems(resequenced);

    try {
      const res = await fetch("/api/showcase", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: resequenced.map((it) => ({ id: it.id, order: it.order })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update order");
      }
    } catch (err) {
      console.error("Order move error:", err);
      fetchShowcaseItems();
    }
  };

  const handleOrderChange = async (item, newOrder) => {
    const orderNum = parseInt(newOrder, 10);
    if (isNaN(orderNum) || orderNum === item.order || orderNum < 1) return;

    const currentIndex = items.findIndex((it) => it.id === item.id);
    if (currentIndex === -1) return;

    const targetIndex = Math.max(0, Math.min(items.length - 1, orderNum - 1));
    if (currentIndex === targetIndex) return;

    const newItems = [...items];
    const [movedItem] = newItems.splice(currentIndex, 1);
    newItems.splice(targetIndex, 0, movedItem);

    // Normalize sequential orders 1..N
    const resequenced = newItems.map((it, idx) => ({
      ...it,
      order: idx + 1,
    }));

    // Optimistic UI update
    setItems(resequenced);

    try {
      const res = await fetch("/api/showcase", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: resequenced.map((it) => ({ id: it.id, order: it.order })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update order");
      }
      setSuccessMsg("Showcase orders updated successfully");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Order change error:", err);
      fetchShowcaseItems();
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/showcase?id=${itemToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to remove watch from showcase");
      }

      setSuccessMsg("Watch removed from Homepage Showcase.");
      setTimeout(() => setSuccessMsg(""), 4000);
      setItems((prev) => prev.filter((it) => it.id !== itemToDelete.id));
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err) {
      setError(err.message || "Failed to delete item");
    } finally {
      setDeleting(false);
    }
  };

  const activeCount = items.filter((it) => it.status === "Active").length;

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-zinc-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-neutral-900 text-white rounded-md">
              <Sparkles className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">
              Watch Showcase Section
            </h1>
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            Curate selective timepieces featured in the primary &ldquo;Watches&rdquo; showcase on your homepage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/#watches"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-600 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View on Homepage
          </Link>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-black text-white px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Watch to Showcase
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg animate-fade-in">
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs">
          <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
            Total Showcase Watches
          </span>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{items.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs">
          <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
            Visible on Homepage
          </span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{activeCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs">
          <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
            Hidden / Inactive
          </span>
          <p className="text-2xl font-bold text-neutral-400 mt-1">
            {items.length - activeCount}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs">
          <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
            Total Store Inventory
          </span>
          <p className="text-2xl font-bold text-neutral-900 mt-1">
            {allProducts.length}
          </p>
        </div>
      </div>

      {/* Showcase Table Card */}
      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
              Curated Showcase Timepieces
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-neutral-100 text-neutral-600 rounded-full">
              {items.length} items
            </span>
          </div>
          <p className="text-[11px] text-neutral-400">
            Displayed on the homepage in order of sequence
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
            <Loader2 className="h-6 w-6 animate-spin mb-2" />
            <span className="text-xs">Loading showcase collection...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-3">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-800">
              No watches in showcase
            </h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              Add products from your existing inventory to display them selectively on your homepage showcase.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 text-white text-xs font-medium rounded-lg hover:bg-black transition"
            >
              <Plus className="h-4 w-4" />
              Add First Watch
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50/75 border-b border-zinc-200/80 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="py-3 px-4 w-28">Order</th>
                  <th className="py-3 px-4">Watch</th>
                  <th className="py-3 px-4">Brand</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-neutral-700">
                {items.map((item, index) => {
                  const p = item.product || {};
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-neutral-50/50 transition-colors group"
                    >
                      {/* Order Input & Up/Down Stepper */}
                      <td className="py-3 px-4">
                        <OrderSortControl
                          order={item.order ?? index + 1}
                          index={index}
                          totalItems={items.length}
                          onMoveUp={() => handleMoveItem(index, "up")}
                          onMoveDown={() => handleMoveItem(index, "down")}
                          onOrderChange={(newOrder) => handleOrderChange(item, newOrder)}
                        />
                      </td>

                      {/* Watch Image & Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 rounded-lg bg-neutral-100 overflow-hidden flex-shrink-0 border border-neutral-200/60 p-1">
                            <Image
                              src={p.image || "/images/image.png"}
                              alt={p.name || "Watch"}
                              fill
                              sizes="48px"
                              unoptimized
                              className="object-contain"
                            />
                          </div>
                          <div>
                            <Link
                              href={`/product/${p.id}`}
                              target="_blank"
                              className="font-semibold text-neutral-900 hover:underline flex items-center gap-1 line-clamp-1"
                            >
                              {p.name}
                              <ExternalLink className="h-3 w-3 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                            <span className="text-[10px] text-neutral-400 font-mono">
                              ID: {p.id?.slice(-6)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Brand */}
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 text-neutral-800 tracking-wider">
                          {p.brand || "—"}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 font-mono font-medium text-neutral-900">
                        ₹{p.price}
                      </td>

                      {/* Stock */}
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs font-medium ${
                            p.stock > 5
                              ? "text-emerald-600"
                              : p.stock > 0
                              ? "text-amber-600"
                              : "text-red-600"
                          }`}
                        >
                          {p.stock} units
                        </span>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleStatus(item)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition cursor-pointer ${
                            item.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                          }`}
                        >
                          {item.status}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setItemToDelete(item);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1.5 text-neutral-400 hover:text-red-600 rounded hover:bg-red-50 transition"
                          title="Remove from Showcase"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD WATCH MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in font-sans">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
                  Add Watch to Showcase
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Select an existing timepiece from your store catalog.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Product Search */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Search Inventory
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by watch name or brand..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>

              {/* Product Selection List */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Select Watch ({filteredProducts.length})
                </label>
                <div className="border border-neutral-200 rounded-lg max-h-52 overflow-y-auto divide-y divide-zinc-100">
                  {filteredProducts.length === 0 ? (
                    <div className="p-4 text-center text-xs text-neutral-400">
                      No matching products found.
                    </div>
                  ) : (
                    filteredProducts.map((p) => {
                      const isAlreadyInShowcase = showcaseProductIds.has(p.id);
                      const isSelected = selectedProductId === p.id;
                      const brandName =
                        typeof p.brand === "string" ? p.brand : p.brand?.name;

                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            if (!isAlreadyInShowcase) {
                              setSelectedProductId(p.id);
                            }
                          }}
                          className={`p-2.5 flex items-center justify-between text-xs transition cursor-pointer ${
                            isAlreadyInShowcase
                              ? "opacity-40 bg-neutral-50 cursor-not-allowed"
                              : isSelected
                              ? "bg-neutral-900 text-white"
                              : "hover:bg-neutral-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative h-9 w-9 rounded bg-neutral-100 overflow-hidden flex-shrink-0 p-0.5">
                              <Image
                                src={p.image || "/images/image.png"}
                                alt={p.name}
                                fill
                                sizes="36px"
                                unoptimized
                                className="object-contain"
                              />
                            </div>
                            <div>
                              <p className="font-semibold line-clamp-1">{p.name}</p>
                              <span
                                className={`text-[10px] ${
                                  isSelected ? "text-neutral-300" : "text-neutral-500"
                                }`}
                              >
                                {brandName} · ₹{p.price}
                              </span>
                            </div>
                          </div>

                          {isAlreadyInShowcase ? (
                            <span className="text-[10px] font-semibold text-neutral-500 bg-neutral-200 px-2 py-0.5 rounded">
                              Added
                            </span>
                          ) : isSelected ? (
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          ) : null}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Order & Status Row */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Display Sequence
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={orderInput}
                    onChange={(e) => setOrderInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900 font-mono"
                  />
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    Position in homepage showcase
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Visibility Status
                  </label>
                  <select
                    value={statusInput}
                    onChange={(e) => setStatusInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900 bg-white"
                  >
                    <option value="Active">Active (Visible)</option>
                    <option value="Inactive">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-100 flex items-center justify-end gap-2 bg-neutral-50">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/50 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddItem}
                disabled={submitting || !selectedProductId}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition disabled:opacity-50"
              >
                {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Add to Showcase
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalOpen && itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in font-sans">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                Remove from Showcase?
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Are you sure you want to remove &ldquo;{itemToDelete.product?.name}&rdquo; from the homepage showcase?
                <br />
                <span className="text-[11px] text-neutral-400 mt-1 block">
                  (The watch will remain in your main store inventory.)
                </span>
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setItemToDelete(null);
                }}
                disabled={deleting}
                className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition"
              >
                {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
