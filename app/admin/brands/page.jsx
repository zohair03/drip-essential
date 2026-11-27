"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { thumbImageUrl } from "@/lib/cloudinaryUrl";
import OrderSortControl from "@/components/admin/OrderSortControl";
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    let active = true;
    fetch(`/api/brands?all=true&admin=true&t=${Date.now()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (active && data.success) {
          setBrands(data.brands || []);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/brands?all=true&admin=true&t=${Date.now()}`, { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setBrands(data.brands || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMoveItem = async (index, direction) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= brands.length) return;

    const newBrands = [...brands];
    const [movedBrand] = newBrands.splice(index, 1);
    newBrands.splice(targetIndex, 0, movedBrand);

    // Normalize sequential orders 1..N
    const resequenced = newBrands.map((b, idx) => ({
      ...b,
      order: idx + 1,
    }));

    // Optimistic UI update
    setBrands(resequenced);

    try {
      const res = await fetch("/api/brands", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: resequenced.map((b) => ({ id: b.id, order: b.order })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update brand orders");
      }
      setSuccessMsg("Brand order updated successfully");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Brand order move error:", err);
      fetchBrands();
    }
  };

  const handleOrderChange = async (brand, newOrder) => {
    const orderNum = parseInt(newOrder, 10);
    if (isNaN(orderNum) || orderNum === brand.order || orderNum < 1) return;

    const currentIndex = brands.findIndex((b) => b.id === brand.id);
    if (currentIndex === -1) return;

    const targetIndex = Math.max(0, Math.min(brands.length - 1, orderNum - 1));
    if (currentIndex === targetIndex) return;

    const newBrands = [...brands];
    const [movedBrand] = newBrands.splice(currentIndex, 1);
    newBrands.splice(targetIndex, 0, movedBrand);

    // Normalize sequential orders 1..N
    const resequenced = newBrands.map((b, idx) => ({
      ...b,
      order: idx + 1,
    }));

    // Optimistic UI update
    setBrands(resequenced);

    try {
      const res = await fetch("/api/brands", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: resequenced.map((b) => ({ id: b.id, order: b.order })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update brand orders");
      }
      setSuccessMsg("Brand order updated successfully");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Brand order change error:", err);
      fetchBrands();
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    setDeleteError("");

    try {
      const res = await fetch(`/api/brands/${deleteModal.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete brand.");
      }

      setDeleteModal(null);
      fetchBrands();
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-zinc-200/80">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900">
            Brand Management
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Organize watch brands, logos, and catalog categorization.
          </p>
        </div>

        <Link
          href="/admin/brands/add"
          className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-xs font-bold text-white tracking-widest uppercase transition hover:bg-zinc-800 shadow-sm w-fit"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add New Brand</span>
        </Link>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Brand Grid / Table */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white overflow-hidden shadow-xs">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-900" />
          </div>
        ) : brands.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-500 space-y-3">
            <Layers className="h-8 w-8 mx-auto text-zinc-300" />
            <p className="font-bold text-zinc-700">No brands found</p>
            <p className="text-zinc-400">Click &quot;Add New Brand&quot; to create your first brand.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/70 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  <th className="py-3.5 px-4 w-28">Order</th>
                  <th className="py-3.5 px-4">Brand Logo</th>
                  <th className="py-3.5 px-4">Brand Name</th>
                  {/* <th className="py-3.5 px-4">Slug</th> */}
                  {/* <th className="py-3.5 px-4">Associated Watches</th> */}
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-medium">
                {brands.map((b, index) => (
                  <tr key={b.id} className="hover:bg-zinc-50/50 transition">
                    {/* Order Input & Up/Down Stepper */}
                    <td className="py-3 px-4">
                      <OrderSortControl
                        order={b.order ?? index + 1}
                        index={index}
                        totalItems={brands.length}
                        onMoveUp={() => handleMoveItem(index, "up")}
                        onMoveDown={() => handleMoveItem(index, "down")}
                        onOrderChange={(newOrder) => handleOrderChange(b, newOrder)}
                      />
                    </td>

                    {/* Brand Image */}
                    <td className="py-3 px-4">
                      <div className="h-10 w-16 rounded-md border border-zinc-200 bg-zinc-50 flex items-center justify-center p-1 overflow-hidden">
                        {b.image ? (
                          <img
                            src={thumbImageUrl(b.image, 128)}
                            alt={b.name}
                            loading="lazy"
                            decoding="async"
                            width={64}
                            height={40}
                            className="h-full w-full object-contain mix-blend-multiply"
                          />
                        ) : (
                          <span className="text-[10px] font-black text-zinc-300">
                            {b.name.slice(0, 3)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Name */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-zinc-900 text-sm uppercase">
                        {b.name}
                      </span>
                      {b.description && (
                        <p className="text-[10px] text-zinc-400 line-clamp-1">
                          {b.description}
                        </p>
                      )}
                    </td>

                    {/* Slug */}
                    {/* <td className="py-3 px-4 font-mono text-[11px] text-zinc-500">
                      /watches/{b.slug}
                    </td> */}

                    {/* Product Count */}
                    {/* <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold text-zinc-700 bg-zinc-100">
                        {b.productCount || 0} watches
                      </span>
                    </td> */}

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          b.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                            : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/watches/${b.name.toLowerCase()}`}
                          target="_blank"
                          title="View on storefront"
                          className="rounded p-1.5 text-zinc-400 hover:text-black hover:bg-zinc-100 transition"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/brands/edit/${b.id}`}
                          title="Edit brand"
                          className="rounded p-1.5 text-zinc-400 hover:text-black hover:bg-zinc-100 transition"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteError("");
                            setDeleteModal(b);
                          }}
                          title="Delete brand"
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

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600 mb-2">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="text-base font-bold text-zinc-900">
                Delete Brand: {deleteModal.name}
              </h3>
            </div>

            {deleteModal.productCount > 0 ? (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 my-3">
                <p className="font-bold">Deletion Blocked</p>
                <p className="mt-1">
                  This brand has <strong>{deleteModal.productCount}</strong> watch(es) associated with it. Please reassign or delete those watches first before deleting this brand.
                </p>
              </div>
            ) : (
              <p className="mt-2 text-xs text-zinc-600">
                Are you sure you want to delete brand <strong>&quot;{deleteModal.name}&quot;</strong>? This action cannot be undone.
              </p>
            )}

            {deleteError && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-600 font-semibold my-2">
                {deleteError}
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteModal(null)}
                disabled={deleting}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                Close
              </button>
              {deleteModal.productCount === 0 && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 flex items-center gap-2"
                >
                  {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Delete Brand</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
