"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function BillingPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchSession();
    fetchInvoices("");
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

  const fetchInvoices = async (status = "") => {
    try {
      setLoading(true);
      const res = await fetch(`/api/billing?status=${status}`);
      const data = await res.json();
      if (res.ok) {
        setInvoices(data.invoices || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (status) => {
    setStatusFilter(status);
    fetchInvoices(status);
  };

  return (
    <DashboardLayout user={currentUser}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy">Billing & Invoices 🧾</h1>
            <p className="text-sm text-slate-500">
              Patient consultation fees, medicine charges, and invoice receipts
            </p>
          </div>

          {(currentUser?.role === "pharmacist" || currentUser?.role === "receptionist" || currentUser?.role === "admin") && (
            <Link
              href="/billing/new"
              className="inline-flex items-center justify-center px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-btn hover:bg-blue-700 transition shadow-xs"
            >
              + Generate New Invoice
            </Link>
          )}
        </div>

        {/* Filter Controls */}
        <div className="bg-white p-4 rounded-card border border-border shadow-xs flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500 mr-2">Status:</span>
          {["", "unpaid", "paid"].map((st) => (
            <button
              key={st}
              onClick={() => handleFilterChange(st)}
              className={`px-3 py-1.5 rounded-btn text-xs font-semibold border transition capitalize ${
                statusFilter === st
                  ? "bg-navy text-white border-navy"
                  : "bg-slate-50 text-slate-600 border-border hover:bg-slate-100"
              }`}
            >
              {st || "All Invoices"}
            </button>
          ))}
        </div>

        {/* Invoices List */}
        <div className="bg-white rounded-card border border-border shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500 text-sm">Loading billing invoices...</div>
          ) : invoices.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No billing records found.</div>
          ) : (
            <div className="divide-y divide-border">
              {invoices.map((inv) => (
                <div key={inv._id} className="p-6 hover:bg-slate-50/50 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-navy text-base">
                        Invoice #{inv.invoiceNumber}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${
                        inv.status === "paid"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                          : "bg-amber-100 text-amber-800 border-amber-200"
                      }`}>
                        {inv.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600">
                      Patient: <span className="font-semibold text-navy">{inv.patientId?.userId?.name || "Patient"}</span> ({inv.patientId?.userId?.email})
                    </div>

                    <div className="text-xs text-slate-500">
                      Items: {inv.items?.length || 0} • Payment Method: {inv.paymentMethod}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 shrink-0">
                    <div className="text-right">
                      <div className="text-xs text-slate-400 font-semibold uppercase">Total Amount</div>
                      <div className="text-lg font-bold text-navy">${inv.totalAmount?.toFixed(2)}</div>
                    </div>

                    <Link
                      href={`/billing/${inv._id}`}
                      className="px-4 py-2 bg-lightBlue text-primary border border-blue-200 text-xs font-semibold rounded-btn hover:bg-blue-100 transition"
                    >
                      View Receipt
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
