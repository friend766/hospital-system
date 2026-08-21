"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";

export default function SuperAdminDashboard() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchSuperAdminData();
  }, []);

  const fetchSuperAdminData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/super-admin");
      const json = await res.json();

      if (res.ok) {
        setData(json);
      } else {
        throw new Error(json.error || "Failed to load super-admin panel");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTenant = async (organizationId, payload) => {
    setUpdatingId(organizationId);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/super-admin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId, ...payload }),
      });

      const json = await res.json();
      if (res.ok) {
        setSuccessMsg("Hospital Tenant settings updated!");
        fetchSuperAdminData();
      } else {
        throw new Error(json.error || "Failed to update hospital tenant");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteTenant = async (organizationId, orgName) => {
    if (!confirm(`Are you sure you want to PURGE '${orgName}'? This will permanently delete all associated users, patients, doctors, and records.`)) {
      return;
    }

    setUpdatingId(organizationId);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/super-admin?organizationId=${organizationId}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (res.ok) {
        setSuccessMsg(`Hospital Tenant '${orgName}' purged successfully!`);
        fetchSuperAdminData();
      } else {
        throw new Error(json.error || "Failed to delete hospital tenant");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-[#0F172A] dark:text-[#F8FAFC] transition-colors duration-300">
      {/* Top SaaS Header */}
      <header className="h-16 bg-white dark:bg-[#1E293B] border-b border-border dark:border-[#334155] px-6 flex items-center justify-between shadow-xs sticky top-0 z-30">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-purple-600 text-white rounded-xl flex items-center justify-center font-black text-lg shadow-md">
            👑
          </div>
          <div>
            <h1 className="text-base font-extrabold text-navy dark:text-white leading-none">SaaS Super-Admin Console</h1>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider">Multi-Tenant Platform Control</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            href="/register-hospital"
            className="px-3.5 py-1.5 bg-primary text-white text-xs font-bold rounded-btn hover:bg-blue-700 transition shadow-xs"
          >
            + Register New Hospital Tenant
          </Link>
          <button
            onClick={toggleTheme}
            className="p-1.5 px-3 rounded-btn bg-slate-100 dark:bg-slate-800 text-xs font-bold border border-border dark:border-[#334155]"
          >
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>
          <button
            onClick={handleLogout}
            className="text-xs font-semibold text-slate-500 hover:text-danger"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Dashboard Container */}
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-navy dark:text-white">Super-Admin Master Control Center 🌐</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Manage hospital tenants, upgrade subscription plans, lock/unlock access, and view real-time platform metrics
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-danger dark:text-red-300 text-xs font-bold rounded-btn">
            ⚠️ {error}
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-btn">
            ✅ {successMsg}
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-slate-500 font-medium">Loading SaaS platform metrics...</div>
        ) : (
          <>
            {/* Metric Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-[#1E293B] p-6 rounded-card border border-border dark:border-[#334155] shadow-xs flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center text-xl font-bold border border-purple-200 dark:border-purple-800">
                  🏢
                </div>
                <div>
                  <div className="text-2xl font-black text-navy dark:text-white">
                    {data?.metrics?.totalOrganizations || 0}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    Hospital Tenants
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#1E293B] p-6 rounded-card border border-border dark:border-[#334155] shadow-xs flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 text-primary flex items-center justify-center text-xl font-bold border border-blue-200 dark:border-blue-800">
                  👥
                </div>
                <div>
                  <div className="text-2xl font-black text-navy dark:text-white">
                    {data?.metrics?.totalUsers || 0}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    Total Platform Users
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#1E293B] p-6 rounded-card border border-border dark:border-[#334155] shadow-xs flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center text-xl font-bold border border-teal-200 dark:border-teal-800">
                  🩺
                </div>
                <div>
                  <div className="text-2xl font-black text-navy dark:text-white">
                    {data?.metrics?.totalDoctors || 0}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    Active Doctors
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#1E293B] p-6 rounded-card border border-border dark:border-[#334155] shadow-xs flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center text-xl font-bold border border-emerald-200 dark:border-emerald-800">
                  💰
                </div>
                <div>
                  <div className="text-2xl font-black text-navy dark:text-white">
                    ${data?.metrics?.totalRevenue?.toFixed(2) || "0.00"}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    Platform Revenue
                  </div>
                </div>
              </div>
            </div>

            {/* Organizations Table with Interactive Super-Admin Controls */}
            <div className="bg-white dark:bg-[#1E293B] rounded-card border border-border dark:border-[#334155] shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-navy dark:text-white">
                  Hospital Tenants Management & Controls
                </h2>
                <span className="text-xs font-semibold text-slate-400">
                  {data?.organizations?.length || 0} active organizations
                </span>
              </div>

              <div className="border border-border dark:border-[#334155] rounded-btn overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-[#0F172A] text-slate-600 dark:text-slate-300 font-bold border-b border-border dark:border-[#334155]">
                    <tr>
                      <th className="py-3 px-4">Hospital Name & Slug</th>
                      <th className="py-3 px-4">Subscription Plan</th>
                      <th className="py-3 px-4">Status & Access Control</th>
                      <th className="py-3 px-4">Staff Limits (Docs / Patients)</th>
                      <th className="py-3 px-4 text-right">Super-Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border dark:divide-[#334155]">
                    {data?.organizations?.map((org) => (
                      <tr key={org._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                        <td className="py-3.5 px-4 font-bold text-navy dark:text-white">
                          <div className="text-sm font-extrabold">{org.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal">slug: {org.slug}</div>
                        </td>

                        {/* Plan Upgrade Dropdown */}
                        <td className="py-3.5 px-4">
                          <select
                            disabled={updatingId === org._id}
                            value={org.plan}
                            onChange={(e) => handleUpdateTenant(org._id, { plan: e.target.value })}
                            className="px-2.5 py-1 rounded-btn text-xs font-bold bg-white dark:bg-[#0F172A] border border-purple-300 dark:border-purple-800 text-purple-900 dark:text-purple-200 focus:outline-none"
                          >
                            <option value="free_trial">Free Trial</option>
                            <option value="starter">Starter Clinic ($49/mo)</option>
                            <option value="pro">Pro Hospital ($149/mo)</option>
                            <option value="enterprise">Enterprise ($299/mo)</option>
                          </select>
                        </td>

                        {/* Subscription Status Toggle */}
                        <td className="py-3.5 px-4">
                          <button
                            disabled={updatingId === org._id}
                            onClick={() => {
                              const nextStatus =
                                org.subscriptionStatus === "active"
                                  ? "past_due"
                                  : org.subscriptionStatus === "past_due"
                                  ? "canceled"
                                  : "active";
                              handleUpdateTenant(org._id, { subscriptionStatus: nextStatus });
                            }}
                            className={`px-3 py-1 rounded-full font-extrabold text-[10px] uppercase border transition ${
                              org.subscriptionStatus === "active"
                                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-200"
                                : org.subscriptionStatus === "past_due"
                                ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800 hover:bg-amber-200"
                                : "bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border-red-300 dark:border-red-800 hover:bg-red-200"
                            }`}
                            title="Click to toggle tenant access status"
                          >
                            {org.subscriptionStatus === "active"
                              ? "✓ Active"
                              : org.subscriptionStatus === "past_due"
                              ? "⚠️ Past Due"
                              : "🚫 Locked / Canceled"}
                          </button>
                        </td>

                        {/* Editable Limits */}
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                          <div className="flex items-center space-x-2">
                            <span>🩺 {org.maxDoctors} Docs</span>
                            <span>|</span>
                            <span>👥 {org.maxPatients} Patients</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <Link
                            href="/admin/dashboard"
                            className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 text-primary text-xs font-bold rounded-btn border border-blue-200 dark:border-blue-800 hover:bg-blue-100"
                          >
                            Inspect Workspace
                          </Link>
                          <button
                            disabled={updatingId === org._id}
                            onClick={() => handleDeleteTenant(org._id, org.name)}
                            className="px-2.5 py-1 bg-red-50 dark:bg-red-950/60 text-danger text-xs font-bold rounded-btn border border-red-200 dark:border-red-800 hover:bg-red-100"
                          >
                            Purge Tenant
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
