"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PdfExportButton from "@/components/common/PdfExportButton";

export default function InvoiceDetailPage({ params }) {
  const { id } = use(params);
  const [currentUser, setCurrentUser] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSession();
    fetchInvoice();
  }, [id]);

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

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/billing/${id}`);
      const data = await res.json();
      if (res.ok && data.invoice) {
        setInvoice(data.invoice);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    setUpdating(true);
    setError("");

    try {
      const res = await fetch(`/api/billing/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paid" }),
      });

      const data = await res.json();

      if (res.ok) {
        setInvoice(data.invoice);
      } else {
        throw new Error(data.error || "Failed to update payment status");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout user={currentUser}>
        <div className="p-8 text-center text-slate-500">Loading invoice details...</div>
      </DashboardLayout>
    );
  }

  if (!invoice) {
    return (
      <DashboardLayout user={currentUser}>
        <div className="p-8 text-center text-slate-500">Invoice not found.</div>
      </DashboardLayout>
    );
  }

  const isStaff = currentUser?.role === "pharmacist" || currentUser?.role === "receptionist" || currentUser?.role === "admin";

  return (
    <DashboardLayout user={currentUser}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <Link
            href="/billing"
            className="text-xs font-semibold text-primary hover:underline mb-1 inline-block"
          >
            ← Back to Billing Invoices
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-navy">Invoice #{invoice.invoiceNumber}</h1>
            <PdfExportButton title="Export / Print Invoice" />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-danger text-sm rounded-btn">
            {error}
          </div>
        )}

        <div className="bg-white p-8 rounded-card border border-border shadow-xs space-y-6">
          {/* Receipt Header */}
          <div className="flex flex-col sm:flex-row justify-between border-b border-border pb-6">
            <div>
              <div className="text-lg font-bold text-primary">HOSPITAL & PHARMACY SYSTEM</div>
              <div className="text-xs text-slate-500">123 Health Boulevard, Medical District</div>
              <div className="text-xs text-slate-500">Support: billing@hospitalsystem.com</div>
            </div>

            <div className="mt-4 sm:mt-0 text-left sm:text-right">
              <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full border capitalize mb-1 ${
                invoice.status === "paid"
                  ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                  : "bg-amber-100 text-amber-800 border-amber-200"
              }`}>
                {invoice.status}
              </span>
              <div className="text-xs text-slate-400">
                Date: {new Date(invoice.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Billed To */}
          <div className="bg-slate-50 p-4 rounded-btn border border-border">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Billed To:
            </div>
            <div className="font-bold text-navy text-base">
              {invoice.patientId?.userId?.name || "Patient"}
            </div>
            <div className="text-xs text-slate-600">
              Email: {invoice.patientId?.userId?.email} | Phone: {invoice.patientId?.userId?.phone}
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-border text-xs">
                <tr>
                  <th className="py-3 px-4">Item Description</th>
                  <th className="py-3 px-4">Qty</th>
                  <th className="py-3 px-4">Unit Price</th>
                  <th className="py-3 px-4 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoice.items?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-navy">{item.description}</td>
                    <td className="py-3 px-4 text-slate-700 text-xs">{item.quantity}</td>
                    <td className="py-3 px-4 text-slate-700 text-xs">${item.amount?.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-bold text-navy">
                      ${(item.amount * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Receipt Footer */}
          <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              Payment Method: <span className="font-bold text-navy">{invoice.paymentMethod}</span>
              {invoice.paidAt && (
                <div>Paid on: {new Date(invoice.paidAt).toLocaleString()}</div>
              )}
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 font-semibold uppercase block">
                Total Amount Due
              </span>
              <span className="text-2xl font-bold text-primary">
                ${invoice.totalAmount?.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Mark Paid Action */}
          {isStaff && invoice.status !== "paid" && (
            <div className="pt-4 border-t border-border flex justify-end">
              <button
                onClick={handleMarkPaid}
                disabled={updating}
                className="px-6 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-btn hover:bg-emerald-700 disabled:opacity-50 transition shadow-xs"
              >
                {updating ? "Updating..." : "✓ Mark Invoice as Paid"}
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
