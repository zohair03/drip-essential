"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Plus,
} from "lucide-react";
import R2ImageUploader from "@/components/admin/R2ImageUploader";

export default function AddProductPage() {
  const router = useRouter();

  const [brands, setBrands] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    description: "",
    price: "",
    stock: "1",
    status: "Active",
    image: "",
    imagePublicId: "",
    images: [],
    imagePublicIds: [],
    // R2 fields
    r2Image: null,
    r2ImageStandard: null,
    r2ImageFull: null,
    r2Key: null,
    r2KeyStandard: null,
    r2KeyFull: null,
    r2Images: [],
    r2ImagesStandard: [],
    r2ImagesFull: [],
    r2Keys: [],
    r2KeysStandard: [],
    r2KeysFull: [],
  });

  // Load brands
  useEffect(() => {
    fetch("/api/brands?all=true")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBrands(data.brands || []);
          if (data.brands?.length > 0) {
            setFormData((prev) => ({ ...prev, brand: data.brands[0].id }));
          }
        }
      })
      .catch((e) => console.error("Error loading brands:", e))
      .finally(() => setLoadingBrands(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = ({ images, imagePublicIds, mainImage }) => {
    setFormData((prev) => ({
      ...prev,
      images,
      imagePublicIds,
      image: mainImage,
      imagePublicId:
        imagePublicIds[images.indexOf(mainImage)] || imagePublicIds[0] || "",
    }));
  };

  const handleSubmit = async (e, overrideStatus = null) => {
    if (e) e.preventDefault();
    setError("");

    // Validate
    if (!formData.name.trim()) {
      setError("Please enter a watch name.");
      return;
    }
    if (!formData.brand) {
      setError("Please select a brand.");
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      setError("Please enter a valid positive price.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        stock: parseInt(formData.stock, 10) || 0,
        status: overrideStatus || formData.status,
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create product.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/products");
        router.refresh();
      }, 1000);
    } catch (err) {
      setError(err.message || "Failed to save product.");
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      {/* Back button & Title */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200/80">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="rounded-lg border border-zinc-200 bg-white p-2 text-zinc-500 hover:text-black hover:bg-zinc-50 transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900">
              Add New Timepiece
            </h2>
            <p className="text-xs text-zinc-400">
              Create a new luxury watch listing with Cloudinary imagery.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* <button
            type="button"
            disabled={saving}
            onClick={(e) => handleSubmit(e, "Draft")}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-xs font-bold text-zinc-700 tracking-wider uppercase hover:bg-zinc-50 transition disabled:opacity-50 cursor-pointer"
          >
            Save as Draft
          </button> */}
          {/* <button
            type="button"
            disabled={saving}
            onClick={(e) => handleSubmit(e, "Active")}
            className="flex items-center gap-2 rounded-lg bg-black px-5 py-2 text-xs font-bold text-white tracking-wider uppercase hover:bg-zinc-800 transition disabled:opacity-50 shadow-sm cursor-pointer"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>Publish Watch</span>
          </button> */}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-4 text-xs font-semibold text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Watch created successfully! Redirecting to inventory...</span>
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
        {/* SECTION A: Basic Details */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold tracking-wider uppercase text-zinc-950 pb-2 border-b border-zinc-100">
            1. Watch Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Watch Name */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                Watch Model Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Submariner Date 41mm"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-900 placeholder-zinc-400 focus:border-black focus:outline-none"
              />
            </div>

            {/* Brand Dropdown */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700">
                  Brand *
                </label>
                {/* <Link
                  href="/admin/brands/add"
                  target="_blank"
                  className="text-[10px] font-bold text-zinc-400 hover:text-black uppercase flex items-center gap-0.5"
                >
                  <Plus className="h-3 w-3" />
                  <span>New Brand</span>
                </Link> */}
              </div>

              {loadingBrands ? (
                <div className="h-9 w-full rounded-lg bg-zinc-100 animate-pulse" />
              ) : (
                <select
                  name="brand"
                  required
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-900 uppercase focus:border-black focus:outline-none cursor-pointer"
                >
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Description */}
          {/* <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
              Description & Specifications
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Case diameter, bezel, dial color, movement, water resistance, etc..."
              className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-xs font-medium text-zinc-900 placeholder-zinc-400 focus:border-black focus:outline-none"
            />
          </div> */}
        </div>

        {/* SECTION B: Pricing & Inventory */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold tracking-wider uppercase text-zinc-950 pb-2 border-b border-zinc-100">
            2. Pricing & Inventory
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Price */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                Price (INR ₹) *
              </label>
              <input
                type="number"
                name="price"
                required
                min="0"
                step="1"
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g. 14800"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-bold text-zinc-900 placeholder-zinc-400 focus:border-black focus:outline-none"
              />
            </div>

            {/* Stock Quantity */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                Stock Quantity *
              </label>
              <input
                type="number"
                name="stock"
                required
                min="0"
                value={formData.stock}
                onChange={handleChange}
                placeholder="e.g. 5"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-900 placeholder-zinc-400 focus:border-black focus:outline-none"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                Catalog Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-900 uppercase focus:border-black focus:outline-none cursor-pointer"
              >
                <option value="Active">Active (Visible)</option>
                <option value="Draft">Draft (Hidden)</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION C: R2 Images */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="pb-2 border-b border-zinc-100 flex items-center justify-between">
            <h3 className="text-xs font-bold tracking-wider uppercase text-zinc-950">
              3. Product Images
            </h3>
            <span className="text-[11px] text-zinc-400">
              Stored on Cloudflare R2 · Auto-optimized WebP
            </span>
          </div>

          <R2ImageUploader
            images={formData.images}
            imagePublicIds={formData.imagePublicIds}
            mainImage={formData.image}
            onChange={handleImageChange}
          />
        </div>

        {/* Bottom Action Bar */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            href="/admin/products"
            className="rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-xs font-bold text-zinc-700 tracking-wider uppercase hover:bg-zinc-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-black px-6 py-2.5 text-xs font-bold text-white tracking-wider uppercase hover:bg-zinc-800 transition shadow-sm cursor-pointer disabled:opacity-50"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>Save & Publish Watch</span>
          </button>
        </div>
      </form>
    </div>
  );
}
