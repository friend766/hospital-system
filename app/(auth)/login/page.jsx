"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

export default function LoginPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      const userRole = data.user?.role;
      if (userRole === "superadmin") router.push("/super-admin");
      else if (userRole === "admin") router.push("/admin/dashboard");
      else if (userRole === "doctor") router.push("/doctor/dashboard");
      else if (userRole === "receptionist") router.push("/receptionist/dashboard");
      else if (userRole === "pharmacist") router.push("/pharmacist/dashboard");
      else router.push("/patient/dashboard");

      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-[#0F172A] dark:text-[#F8FAFC] flex flex-col justify-between relative overflow-hidden transition-colors duration-300">
      {/* Background Medical Pattern Overlay */}
      <div className="absolute inset-0 opacity-15 dark:opacity-20 bg-[url('/medical-bg.jpg')] bg-repeat bg-[length:650px_auto] pointer-events-none" />

      {/* Top Header Bar with Announcement & Dark Mode Toggle */}
      <header className="relative z-20 w-full px-4 lg:px-8 py-3 bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-md border-b border-border dark:border-[#334155] flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-3 text-xs font-semibold">
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 animate-pulse">
            🌐 Multi-Tenant SaaS Platform
          </span>
          <span className="text-slate-600 dark:text-slate-300">
            Unified Healthcare, Pharmacy & Multi-Hospital SaaS Management
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/register-hospital"
            className="text-xs font-bold text-primary hover:underline px-3 py-1 bg-blue-50 dark:bg-blue-950/60 rounded-btn border border-blue-200 dark:border-blue-800"
          >
            + Register New Hospital Tenant
          </Link>
          <button
            onClick={toggleTheme}
            className="p-1.5 px-3 rounded-btn bg-slate-100 dark:bg-slate-800 border border-border dark:border-[#334155] text-xs font-bold text-navy dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition shadow-xs flex items-center gap-1.5"
          >
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>
        </div>
      </header>

      {/* Main Login Content Card */}
      <div className="max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 relative z-10 my-auto">
        <div className="bg-white dark:bg-[#1E293B] border border-border dark:border-[#334155] rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Rich System Info Panel */}
          <div className="lg:col-span-5 bg-gradient-to-br from-navy via-slate-900 to-blue-950 p-8 text-white flex flex-col justify-between relative overflow-hidden space-y-6">
            <div className="absolute -top-16 -left-16 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl" />

            <div className="relative z-10 space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg border border-blue-400/30">
                  H
                </div>
                <div>
                  <h1 className="font-black text-xl text-white leading-none tracking-tight">Hospital SaaS</h1>
                  <span className="text-[11px] text-blue-300 font-bold uppercase tracking-wider">Multi-Tenant Platform</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h2 className="text-2xl font-extrabold text-white leading-tight">
                  Multi-Tenant Healthcare Platform
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  Isolated hospital workspaces, doctor consultations, pharmacy stock control, and recurring billing.
                </p>
              </div>

              {/* Key Platform Capabilities */}
              <div className="space-y-2.5 pt-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">System Capabilities</span>
                <div className="space-y-2 text-xs font-semibold text-slate-200">
                  <div className="flex items-center space-x-2.5 p-2 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-purple-300 text-sm">🏢</span>
                    <span>Multi-Hospital & Tenant Data Isolation</span>
                  </div>
                  <div className="flex items-center space-x-2.5 p-2 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-teal-300 text-sm">🩺</span>
                    <span>Doctor Consultations & Clinical Records</span>
                  </div>
                  <div className="flex items-center space-x-2.5 p-2 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-emerald-300 text-sm">💊</span>
                    <span>Pharmacy Inventory & Auto Stock Deduction</span>
                  </div>
                  <div className="flex items-center space-x-2.5 p-2 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-sky-300 text-sm">💳</span>
                    <span>Stripe Recurring Subscription Billing</span>
                  </div>
                </div>
              </div>

              {/* Live Statistics Counter Widget */}
              <div className="p-3.5 bg-slate-800/80 border border-slate-700/60 rounded-xl grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-base font-black text-emerald-400">23+</div>
                  <div className="text-[10px] text-slate-400 font-semibold">Medicines</div>
                </div>
                <div className="border-x border-slate-700">
                  <div className="text-base font-black text-blue-400">SaaS</div>
                  <div className="text-[10px] text-slate-400 font-semibold">Multi-Tenant</div>
                </div>
                <div>
                  <div className="text-base font-black text-purple-400">24/7</div>
                  <div className="text-[10px] text-slate-400 font-semibold">Live System</div>
                </div>
              </div>
            </div>

            <div className="pt-4 relative z-10 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between items-center">
              <span>Security: SSL Encrypted</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> DB Connected
              </span>
            </div>
          </div>

          {/* Right Login Form */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
            <div>
              <h2 className="text-2xl font-black text-navy dark:text-white tracking-tight">
                Portal Sign In 👋
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                Enter your registered credentials to access your tenant workspace
              </p>
            </div>

            {error && (
              <div className="p-3.5 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-danger dark:text-red-300 text-xs font-bold rounded-btn flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-bold text-navy dark:text-slate-200 mb-1">
                  Registered Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. doctor@hospital.com or superadmin@saas.com"
                  className="w-full px-3.5 py-2.5 border border-border dark:border-[#334155] rounded-btn bg-white dark:bg-[#0F172A] text-navy dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-navy dark:text-slate-200">
                    Account Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] font-semibold text-primary hover:underline"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 border border-border dark:border-[#334155] rounded-btn bg-white dark:bg-[#0F172A] text-navy dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-btn text-xs font-bold text-white bg-primary hover:bg-blue-700 disabled:opacity-50 transition shadow-md"
              >
                {loading ? "Signing in..." : "Sign In to Tenant Portal →"}
              </button>
            </form>

            <div className="p-3.5 bg-slate-50 dark:bg-[#0F172A] border border-border dark:border-[#334155] rounded-btn space-y-2">
              <div className="text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-widest">
                💡 Hospital Tenant Registration:
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Want to register a new clinic or hospital?{" "}
                <Link href="/register-hospital" className="font-bold text-primary hover:underline">
                  Create Hospital Tenant Account →
                </Link>
              </div>
            </div>

            <div className="text-center text-xs text-slate-500 dark:text-slate-400 font-medium pt-2">
              Staff / Patient Account?{" "}
              <Link
                href="/register"
                className="font-bold text-primary hover:underline"
              >
                Register Here
              </Link>
            </div>
          </div>

        </div>
      </div>

      <footer className="relative z-20 w-full px-4 py-3 bg-white/80 dark:bg-[#1E293B]/80 border-t border-border dark:border-[#334155] text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
        <span>© 2026 Multi-Tenant Hospital SaaS • Powered by Next.js App Router & MongoDB Atlas</span>
      </footer>
    </div>
  );
}
