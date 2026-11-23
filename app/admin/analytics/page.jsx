"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageCircle,
  TrendingUp,
  Award,
  Calendar,
  ExternalLink,
  Watch,
  Loader2,
  RefreshCw,
} from "lucide-react";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/whatsapp", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (active) {
          if (json.success) {
            setData(json.analytics);
          } else {
            setError(json.error || "Failed to load analytics");
          }
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

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/whatsapp", { cache: "no-store" });
      const json = await res.json();
      if (json.success) setData(json.analytics);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
        <p className="font-bold">Failed to load analytics</p>
        <p className="mt-1 text-xs">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white uppercase tracking-wider"
        >
          Retry
        </button>
      </div>
    );
  }

  const {
    totalClicks = 0,
    thisMonthClicks = 0,
    currentMonth = "",
    topProduct = null,
    productBreakdown = [],
    monthlyTrend = [],
  } = data || {};

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-zinc-200/80">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900">
            WhatsApp Customer Analytics
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Track customer &quot;Buy in WhatsApp&quot; inquiries from individual watch product pages.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-bold text-zinc-700 tracking-wider uppercase hover:bg-zinc-50 w-fit"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 3 Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Clicks */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Total Inquiries All-Time
            </span>
            <div className="p-2 rounded-full bg-emerald-50 text-emerald-600">
              <MessageCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-zinc-900">{totalClicks}</p>
          <p className="text-[11px] text-zinc-500 mt-1">
            Recorded buyer purchase intent clicks
          </p>
        </div>

        {/* This Month */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Inquiries This Month ({currentMonth})
            </span>
            <div className="p-2 rounded-full bg-blue-50 text-blue-600">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-blue-700">{thisMonthClicks}</p>
          <p className="text-[11px] text-zinc-500 mt-1">
            Current calendar month volume
          </p>
        </div>

        {/* Most Clicked Watch */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Top Converting Timepiece
            </span>
            <div className="p-2 rounded-full bg-amber-50 text-amber-600">
              <Award className="h-4 w-4" />
            </div>
          </div>
          {topProduct ? (
            <div>
              <p className="text-lg font-extrabold text-zinc-900 truncate">
                {topProduct.productName || "Unknown Watch"}
              </p>
              <p className="text-xs text-zinc-500 uppercase font-semibold mt-0.5">
                {topProduct.brandName} • {topProduct.totalClicks} clicks
              </p>
            </div>
          ) : (
            <p className="text-sm font-semibold text-zinc-400 py-1">No clicks yet</p>
          )}
        </div>
      </div>

      {/* Main Grid: Breakdown by Product (2/3) + Monthly Timeline (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Product Breakdown Table */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold tracking-wider uppercase text-zinc-950">
              Inquiries by Watch Model
            </h3>
            <p className="text-xs text-zinc-400">
              Breakdown of customer buying inquiries per product
            </p>
          </div>

          {productBreakdown.length === 0 ? (
            <div className="p-12 text-center text-xs text-zinc-400 border border-dashed rounded-xl">
              No WhatsApp clicks recorded yet. Clicks will appear when visitors click &quot;BUY IN WHATSAPP&quot; on watch product pages.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50/70 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    <th className="py-3 px-3">Watch</th>
                    {/* <th className="py-3 px-3">Brand</th> */}
                    <th className="py-3 px-3">Price</th>
                    <th className="py-3 px-3">This Month</th>
                    <th className="py-3 px-3">Total Inquiries</th>
                    <th className="py-3 px-3 text-right">Store Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-medium">
                  {productBreakdown.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-zinc-50/50">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 shrink-0 rounded-md border border-zinc-200 bg-zinc-50 overflow-hidden flex items-center justify-center p-0.5">
                            {item.productImage ? (
                              <img
                                src={item.productImage}
                                alt={item.productName}
                                className="h-full w-full object-contain mix-blend-multiply"
                              />
                            ) : (
                              <Watch className="h-3.5 w-3.5 text-zinc-300" />
                            )}
                          </div>
                          <span className="font-bold text-zinc-900 line-clamp-1">
                            {item.productName || "Deleted Product"}
                          </span>
                        </div>
                      </td>
                      {/* <td className="py-3 px-3 font-semibold text-zinc-500 uppercase">
                        {item.brandName || "—"}
                      </td> */}
                      <td className="py-3 px-3 font-bold text-zinc-900">
                        {item.price
                          ? `₹${new Intl.NumberFormat("en-IN").format(item.price)}`
                          : "—"}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-zinc-100 text-zinc-800">
                          {item.thisMonthCount}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                          <MessageCircle className="h-3 w-3" />
                          <span>{item.totalClicks}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {item.productId && (
                          <Link
                            href={`/product/${item.productId}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-400 hover:text-black uppercase"
                          >
                            <span>View</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Monthly Trend Timeline */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold tracking-wider uppercase text-zinc-950">
              Monthly Inquiries
            </h3>
            <p className="text-xs text-zinc-400">Past performance history</p>
          </div>

          {monthlyTrend.length === 0 ? (
            <p className="text-xs text-zinc-400 italic py-6 text-center">
              No historical data available.
            </p>
          ) : (
            <div className="space-y-3">
              {monthlyTrend.map((m) => (
                <div
                  key={m.month}
                  className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 bg-zinc-50/70"
                >
                  <div className="flex items-center gap-2.5">
                    <Calendar className="h-4 w-4 text-zinc-400" />
                    <span className="text-xs font-bold text-zinc-900 font-mono">
                      {m.month}
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-zinc-900 bg-white border border-zinc-200 px-2.5 py-1 rounded-md shadow-2xs">
                    {m.clicks} clicks
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
