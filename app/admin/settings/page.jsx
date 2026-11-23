"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  ShieldCheck,
  Database,
  Cloud,
  Lock,
  Phone,
  Mail,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setAdmin(d.admin);
      })
      .catch((e) => console.error(e));
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="pb-4 border-b border-zinc-200/80">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900">
          Store & System Settings
        </h2>
        <p className="text-xs text-zinc-500 mt-1">
          Review system status, connected integrations, and store contact parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Administrator Profile Card */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-zinc-100">
            <div className="p-2 rounded-lg bg-zinc-100 text-zinc-900">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                Administrator Profile
              </h3>
              <p className="text-[11px] text-zinc-400">Authenticated user details</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
                Full Name
              </span>
              <span className="font-bold text-zinc-900">
                {admin?.name || "Administrator"}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
                Email Address
              </span>
              <span className="font-semibold text-zinc-800">
                {admin?.email || "admin@dripessentials.com"}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
                Assigned Role
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-zinc-900 text-white mt-1">
                {admin?.role || "super_admin"}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
                Session Expiration
              </span>
              <span className="text-zinc-600 font-medium">
                7 Days (HttpOnly, SameSite Lax Cookie)
              </span>
            </div>
          </div>
        </div>

        {/* Storefront Contact & WhatsApp Setup */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-zinc-100">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                Store Inquiries Target
              </h3>
              <p className="text-[11px] text-zinc-400">Where WhatsApp inquiries are routed</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
                WhatsApp Phone Number
              </span>
              <span className="font-bold text-emerald-800 font-mono text-sm">
                +91 91377 22174
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
                Support Email
              </span>
              <span className="font-semibold text-zinc-800">
                dripessential62@gmail.com
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
                Currency & Pricing Format
              </span>
              <span className="font-semibold text-zinc-800">
                INR (₹) formatted via Intl.NumberFormat
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* System Integrations Status */}
      {/* <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 pb-2 border-b border-zinc-100">
          Connected Backend Services
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                <Database className="h-4 w-4 text-emerald-600" />
                MongoDB Atlas
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-zinc-500">
              Mongoose serverless connection caching enabled.
            </p>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
              <CheckCircle2 className="h-3 w-3" />
              Connected
            </span>
          </div>

          
          <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                <Cloud className="h-4 w-4 text-blue-600" />
                Cloudinary CDN
              </span>
              <span className="h-2 w-2 rounded-full bg-blue-500" />
            </div>
            <p className="text-[11px] text-zinc-500">
              Cloud: <code className="font-mono text-zinc-800">dnqbhqi6</code> (Signed uploads)
            </p>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded">
              <CheckCircle2 className="h-3 w-3" />
              Active
            </span>
          </div>

          
          <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-zinc-800" />
                JWT Security
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-[11px] text-zinc-500">
              jose HS256 signatures with HttpOnly cookies.
            </p>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-700 bg-zinc-200/60 px-2 py-0.5 rounded">
              <CheckCircle2 className="h-3 w-3" />
              Secured
            </span>
          </div>
        </div>
      </div> */}
    </div>
  );
}
