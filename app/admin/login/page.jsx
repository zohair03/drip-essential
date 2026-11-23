"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, Loader2, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingExisting, setCheckingExisting] = useState(true);

  // Check if admin is already logged in
  useEffect(() => {
    let mounted = true;
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && mounted) {
          router.replace("/admin/dashboard");
        }
      })
      .catch(() => { })
      .finally(() => {
        if (mounted) setCheckingExisting(false);
      });

    return () => {
      mounted = false;
    };
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid email or password.");
      }

      // Redirect to dashboard
      router.push("/admin/dashboard");
      router.refresh();
    } catch (err) {
      setError(err.message || "An error occurred during sign in.");
      setLoading(false);
    }
  };

  if (checkingExisting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F8F8]">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-900" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F8F8] px-4 py-12 font-sans">
      <div className="w-full max-w-md">
        {/* Brand Card Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-25 w-25 items-center justify-center rounded-2xl bg-white bg-[url('/images/logo.png')] bg-contain bg-center bg-no-repeat text-white font-black text-sm tracking-widest shadow-md mb-4">
          </div>
          <h1 className="text-2xl font-extrabold tracking-wider uppercase text-zinc-950 font-sans">
            Drip Essentials
          </h1>
          <p className="text-xs font-semibold text-zinc-500 tracking-widest uppercase mt-1">
            Internal Administration Portal
          </p>
        </div>

        {/* Login Box */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-zinc-900">Admin Login</h2>
            <p className="text-xs text-zinc-500 mt-1">
              Authorized personnel only. Sessions expire after 7 days.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200/80 p-3 text-xs text-red-600 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@dripessentials.com"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 pl-10 text-xs font-medium text-zinc-900 placeholder-zinc-400 focus:border-black focus:outline-none transition"
                  disabled={loading}
                />
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400 pointer-events-none" />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 pl-10 pr-10 text-xs font-medium text-zinc-900 placeholder-zinc-400 focus:border-black focus:outline-none transition"
                  disabled={loading}
                />
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-black py-3 text-xs font-bold text-white tracking-widest uppercase hover:bg-zinc-800 transition disabled:opacity-50 shadow-sm cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Credential Hint for convenience */}
          {/* <div className="mt-6 pt-5 border-t border-zinc-100 text-center">
            <p className="text-[11px] text-zinc-400 font-mono">
              Default: <span className="text-zinc-600 font-semibold">admin@dripessentials.com</span> /{" "}
              <span className="text-zinc-600 font-semibold">Admin@Drip2026</span>
            </p>
          </div> */}
        </div>

        {/* Back to storefront link */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs text-zinc-500 hover:text-black font-semibold tracking-wider transition uppercase"
          >
            ← Back to Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
