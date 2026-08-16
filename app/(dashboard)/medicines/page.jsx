"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function MedicinesPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  useEffect(() => {
    fetchSession();
    fetchMedicines("", "", false);
  }, []);

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/user/profile");
      const data = await res.json();
      if (res.ok && data.user) {
        setCurrentUser(data.user);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMedicines = async (q = "", cat = "", lowStock = false) => {
    try {
      setLoading(true);
      let url = `/api/medicines?search=${encodeURIComponent(q)}&category=${encodeURIComponent(cat)}`;
      if (lowStock) url += "&lowStock=true";

      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setMedicines(data.medicines || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (q, cat, lowStock) => {
    setSearch(q);
    setCategoryFilter(cat);
    setShowLowStockOnly(lowStock);
    fetchMedicines(q, cat, lowStock);
  };

  const categories = [
    "All Categories",
    "Antibiotics",
    "Painkillers",
    "Vitamins & Supplements",
    "Cardiovascular",
    "Respiratory",
    "Dermatology",
  ];

  return (
    <DashboardLayout user={currentUser}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy">Pharmacy Medicine Inventory</h1>
            <p className="text-sm text-slate-500">
              Manage stock quantities, categories, pricing, and low-stock alerts
            </p>
          </div>

          {(currentUser?.role === "pharmacist" || currentUser?.role === "admin") && (
            <Link
              href="/medicines/new"
              className="inline-flex items-center justify-center px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-btn hover:bg-blue-700 transition shadow-xs"
            >
              + Add New Medicine
            </Link>
          )}
        </div>

        {/* Filter Controls */}
        <div className="bg-white p-4 rounded-card border border-border shadow-xs flex flex-wrap gap-4 items-center justify-between">
          <div className="flex-1 flex gap-2 min-w-[250px]">
            <input
              type="text"
              value={search}
              onChange={(e) => handleFilterChange(e.target.value, categoryFilter, showLowStockOnly)}
              placeholder="Search medicine name, generic name, or category..."
              className="w-full px-4 py-2 border border-border rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={categoryFilter}
              onChange={(e) => handleFilterChange(search, e.target.value === "All Categories" ? "" : e.target.value, showLowStockOnly)}
              className="px-3 py-2 border border-border rounded-btn text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <button
              onClick={() => handleFilterChange(search, categoryFilter, !showLowStockOnly)}
              className={`px-3 py-2 rounded-btn text-xs font-semibold border transition ${
                showLowStockOnly
                  ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                  : "bg-slate-50 text-slate-600 border-border hover:bg-slate-100"
              }`}
            >
              ⚠️ Low Stock Only
            </button>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-card border border-border shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500 text-sm">Loading inventory...</div>
          ) : medicines.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No medicines found matching criteria.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-border">
                  <tr>
                    <th className="py-3.5 px-4">Medicine Name</th>
                    <th className="py-3.5 px-4">Category / Form</th>
                    <th className="py-3.5 px-4">Price</th>
                    <th className="py-3.5 px-4">Stock Level</th>
                    <th className="py-3.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {medicines.map((med) => {
                    const isLow = med.stockQuantity <= med.lowStockThreshold;
                    return (
                      <tr key={med._id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-navy">{med.name}</div>
                          {med.genericName && (
                            <div className="text-xs text-slate-400">
                              Generic: {med.genericName}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <div>{med.category}</div>
                          <div className="text-xs text-slate-400">{med.dosageForm}</div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-navy">
                          ${med.price?.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-navy">
                            {med.stockQuantity} units
                          </div>
                          <div className="text-xs text-slate-400">
                            Min threshold: {med.lowStockThreshold}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {isLow ? (
                            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                              ⚠️ Low Stock
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                              In Stock
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
