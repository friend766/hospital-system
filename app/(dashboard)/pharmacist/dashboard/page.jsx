"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function PharmacistDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [profileRes, medRes, rxRes, billRes] = await Promise.all([
        fetch("/api/user/profile"),
        fetch("/api/medicines"),
        fetch("/api/prescriptions?status=pending"),
        fetch("/api/billing"),
      ]);

      const profileData = await profileRes.json();
      const medData = await medRes.json();
      const rxData = await rxRes.json();
      const billData = await billRes.json();

      if (profileRes.ok) setCurrentUser(profileData.user);
      if (medRes.ok) setMedicines(medData.medicines || []);
      if (rxRes.ok) setPrescriptions(rxData.prescriptions || []);
      if (billRes.ok) setInvoices(billData.invoices || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const lowStockItems = medicines.filter((m) => m.stockQuantity <= m.lowStockThreshold);

  return (
    <DashboardLayout user={currentUser}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-navy">
            Pharmacist Portal & Inventory Dashboard 💊
          </h1>
          <p className="text-sm text-slate-500">
            Manage pharmacy stock, dispense prescriptions, and process medical billing
          </p>
        </div>

        {/* Summary Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-card border border-border shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-primary flex items-center justify-center text-xl font-bold">
              💊
            </div>
            <div>
              <div className="text-2xl font-bold text-navy">{medicines.length}</div>
              <div className="text-xs text-slate-500 font-medium">Medicines in Stock</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-card border border-border shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-warning flex items-center justify-center text-xl font-bold">
              ⚠️
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">{lowStockItems.length}</div>
              <div className="text-xs text-slate-500 font-medium">Low-Stock Alerts</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-card border border-border shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
              📋
            </div>
            <div>
              <div className="text-2xl font-bold text-navy">{prescriptions.length}</div>
              <div className="text-xs text-slate-500 font-medium">Pending Prescriptions</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-card border border-border shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-xl font-bold">
              💵
            </div>
            <div>
              <div className="text-2xl font-bold text-navy">{invoices.length}</div>
              <div className="text-xs text-slate-500 font-medium">Total Invoices</div>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Low-Stock Warning Box */}
          <div className="bg-white rounded-card border border-border shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-navy flex items-center gap-2">
                <span>⚠️</span> Low-Stock Inventory Alerts
              </h2>
              <Link href="/medicines" className="text-xs font-semibold text-primary hover:underline">
                Manage Inventory
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-6 text-sm text-slate-500">Scanning inventory...</div>
            ) : lowStockItems.length === 0 ? (
              <div className="text-center py-6 text-sm text-slate-500 bg-emerald-50 text-emerald-800 rounded-btn">
                All medicine stock levels are healthy!
              </div>
            ) : (
              <div className="divide-y divide-border">
                {lowStockItems.map((item) => (
                  <div key={item._id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-navy text-sm">{item.name}</div>
                      <div className="text-xs text-slate-500">
                        Category: {item.category} • Form: {item.dosageForm}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                      Stock: {item.stockQuantity} / min {item.lowStockThreshold}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Prescription Dispensing Queue */}
          <div className="bg-white rounded-card border border-border shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-navy">Pending Prescription Dispensing</h2>
              <Link href="/prescriptions" className="text-xs font-semibold text-primary hover:underline">
                View All
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-6 text-sm text-slate-500">Loading prescription queue...</div>
            ) : prescriptions.length === 0 ? (
              <div className="text-center py-6 text-sm text-slate-500">No pending prescriptions.</div>
            ) : (
              <div className="divide-y divide-border">
                {prescriptions.slice(0, 4).map((rx) => (
                  <div key={rx._id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-navy text-sm">
                        Patient: {rx.patientId?.userId?.name || "Patient"}
                      </div>
                      <div className="text-xs text-slate-500">
                        Doctor: Dr. {rx.doctorId?.userId?.name} • Items: {rx.medicines?.length || 0}
                      </div>
                    </div>
                    <Link
                      href={`/prescriptions/${rx._id}`}
                      className="px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-btn hover:bg-blue-700 transition"
                    >
                      Dispense
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
