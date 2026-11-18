"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import CloudinaryImageUploader from "@/components/admin/CloudinaryImageUploader";

export default function EditBrandPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "Active",
    image: "",
    imagePublicId: "",
  });

  useEffect(() => {
    if (!id) return;
    fetch(`/api/brands/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.brand) {
          setFormData({
            name: d.brand.name || "",
            description: d.brand.description || "",
            status: d.brand.status || "Active",
            image: d.brand.image || "",
            imagePublicId: d.brand.imagePublicId || "",
          });
        } else {
          throw new Error(d.error || "Brand not found");
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = ({ images, imagePublicIds }) => {
    setFormData((prev) => ({
      ...prev,
      image: images[0] || "",
      imagePublicId: imagePublicIds[0] || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Brand name is required.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`/api/brands/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update brand.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/brands");
        router.refresh();
      }, 1000);
    } catch (err) {
      setError(err.message || "Failed to update brand.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-900" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200/80">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/brands"
            className="rounded-lg border border-zinc-200 bg-white p-2 text-zinc-500 hover:text-black hover:bg-zinc-50 transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900">
              Edit Brand: {formData.name}
            </h2>
            <p className="text-xs text-zinc-400">
              Update name, description, status, or logo image.
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={handleSubmit}
          className="flex items-center gap-2 rounded-lg bg-black px-5 py-2 text-xs font-bold text-white tracking-wider uppercase hover:bg-zinc-800 transition disabled:opacity-50 shadow-sm cursor-pointer"
        >
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          <span>Save Changes</span>
        </button>
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
          <span>Brand updated successfully! Redirecting...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs space-y-4">
          {/* Brand Name */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
              Brand Name *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-bold text-zinc-900 uppercase focus:border-black focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
              Brand Description
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-xs font-medium text-zinc-900 focus:border-black focus:outline-none"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
              Visibility Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-900 uppercase focus:border-black focus:outline-none cursor-pointer"
            >
              <option value="Active">Active (Visible in Store)</option>
              <option value="Inactive">Inactive (Hidden)</option>
            </select>
          </div>
        </div>

        {/* Brand Logo Upload */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs space-y-3">
          <h3 className="text-xs font-bold tracking-wider uppercase text-zinc-950 pb-2 border-b border-zinc-100">
            Brand Logo (Cloudinary)
          </h3>
          <CloudinaryImageUploader
            images={formData.image ? [formData.image] : []}
            imagePublicIds={formData.imagePublicId ? [formData.imagePublicId] : []}
            mainImage={formData.image}
            onChange={handleImageChange}
            folder="drip-essential/brands"
            maxFiles={1}
          />
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/admin/brands"
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
            <span>Save Brand Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
