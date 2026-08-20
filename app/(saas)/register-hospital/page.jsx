"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

export default function RegisterHospitalPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [formData, setFormData] = useState({
    hospitalName: "",
    slug: "",
    adminName: "",
    adminEmail: "",
    password: "",
    plan: "starter",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const plans = [
    { id: "starter", title: "Starter Clinic", price: "$49 / mo", desc: "Up to 5 Doctors & 100 Patients", badge: "Small Clinics" },
    { id: "pro", title: "Pro Hospital", price: "$149 / mo", desc: "Up to 20 Doctors & 1,000 Patients", badge: "Most Popular" },
    { id: "enterprise", title: "Enterprise Chain", price: "$299 / mo", desc: "Unlimited Staff, Patients & Pharmacy", badge: "Large Facilities" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "hospitalName" && !formData.slug) {
      const autoSlug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      setFormData({ ...formData, hospitalName: value, slug: autoSlug });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register-hospital", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Hospital registration failed");
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-[#0F172A] dark:text-[#F8FAFC] flex flex-col justify-center relative overflow-hidden transition-colors duration-300 py-10">
      {/* Background Medical Pattern Overlay */}
      <div className="absolute inset-0 opacity-15 dark:opacity-20 bg-[url('/medical-bg.jpg')] bg-repeat bg-[length:650px_auto] pointer-events-none" />

      {/* Top Bar Controls */}
      <div className="absolute top-6 right-6 z-20 flex items-center space-x-3">
        <button
          onClick={toggleTheme}
          className="p-2 px-3.5 rounded-btn bg-white dark:bg-[#1E293B] border border-border dark:border-[#334155] text-xs font-bold text-navy dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm flex items-center gap-2"
        >
          {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </button>
      </div>

      <div className="max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="bg-white dark:bg-[#1E293B] border border-border dark:border-[#334155] rounded-2xl shadow-xl overflow-hidden p-6 sm:p-10 space-y-6">
          
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-9 h-9 bg-purple-600 text-white rounded-xl flex items-center justify-center font-black text-lg shadow-sm">
                🏢
              </div>
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Hospital SaaS Onboarding</span>
            </div>
            <h1 className="text-2xl font-black text-navy dark:text-white tracking-tight">
              Register Your Hospital or Clinic Tenant 🌐
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
              Create an isolated hospital workspace for your medical team, doctors, pharmacists, and patients
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-danger dark:text-red-300 text-xs font-bold rounded-btn flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Interactive Subscription Plan Cards */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-navy dark:text-slate-200">
                Choose Subscription Plan *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {plans.map((p) => {
                  const isSelected = formData.plan === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, plan: p.id })}
                      className={`p-4 rounded-card text-left transition border ${
                        isSelected
                          ? "bg-purple-600 text-white border-purple-600 shadow-md ring-2 ring-purple-400/40"
                          : "bg-slate-50 dark:bg-[#0F172A] border-border dark:border-[#334155] text-navy dark:text-slate-200 hover:border-purple-500"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isSelected ? "bg-white/20 text-white" : "bg-purple-100 text-purple-800"}`}>
                          {p.badge}
                        </span>
                      </div>
                      <div className="font-black text-sm">{p.title}</div>
                      <div className="text-lg font-extrabold mt-1">{p.price}</div>
                      <div className={`text-[11px] mt-1 ${isSelected ? "text-purple-100" : "text-slate-400"}`}>
                        {p.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy dark:text-slate-200 mb-1">
                  Hospital / Clinic Name *
                </label>
                <input
                  type="text"
                  name="hospitalName"
                  required
                  value={formData.hospitalName}
                  onChange={handleChange}
                  placeholder="e.g. City Care Medical Complex"
                  className="w-full px-3.5 py-2.5 border border-border dark:border-[#334155] rounded-btn bg-white dark:bg-[#0F172A] text-navy dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy dark:text-slate-200 mb-1">
                  Tenant Subdomain / Slug *
                </label>
                <input
                  type="text"
                  name="slug"
                  required
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="e.g. city-care-hospital"
                  className="w-full px-3.5 py-2.5 border border-border dark:border-[#334155] rounded-btn bg-white dark:bg-[#0F172A] text-navy dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy dark:text-slate-200 mb-1">
                  Hospital Admin Full Name *
                </label>
                <input
                  type="text"
                  name="adminName"
                  required
                  value={formData.adminName}
                  onChange={handleChange}
                  placeholder="e.g. Dr. Mehmood Ashraf"
                  className="w-full px-3.5 py-2.5 border border-border dark:border-[#334155] rounded-btn bg-white dark:bg-[#0F172A] text-navy dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy dark:text-slate-200 mb-1">
                  Admin Email Address *
                </label>
                <input
                  type="email"
                  name="adminEmail"
                  required
                  value={formData.adminEmail}
                  onChange={handleChange}
                  placeholder="admin@hospital.com"
                  className="w-full px-3.5 py-2.5 border border-border dark:border-[#334155] rounded-btn bg-white dark:bg-[#0F172A] text-navy dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="sm:col-span-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-navy dark:text-slate-200">
                    Admin Password (min. 6 characters) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 border border-border dark:border-[#334155] rounded-btn bg-white dark:bg-[#0F172A] text-navy dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-btn text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition shadow-md"
            >
              {loading ? "Registering Hospital Workspace..." : "Create Hospital Tenant & Launch Dashboard →"}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 dark:text-slate-400 font-medium pt-2">
            Already registered?{" "}
            <Link href="/login" className="font-bold text-purple-600 dark:text-purple-400 hover:underline">
              Sign In to Your Workspace
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
