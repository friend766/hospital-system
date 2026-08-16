"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function PrescriptionDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dispensing, setDispensing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSession();
    fetchPrescription();
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

  const fetchPrescription = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/prescriptions/${id}`);
      const data = await res.json();
      if (res.ok && data.prescription) {
        setPrescription(data.prescription);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDispense = async () => {
    setDispensing(true);
    setError("");

    try {
      const res = await fetch(`/api/prescriptions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "dispensed" }),
      });

      const data = await res.json();

      if (res.ok) {
        setPrescription(data.prescription);
      } else {
        throw new Error(data.error || "Failed to dispense prescription");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setDispensing(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout user={currentUser}>
        <div className="p-8 text-center text-slate-500">Loading prescription details...</div>
      </DashboardLayout>
    );
  }

  if (!prescription) {
    return (
      <DashboardLayout user={currentUser}>
        <div className="p-8 text-center text-slate-500">Prescription not found.</div>
      </DashboardLayout>
    );
  }

  const isPharmacist = currentUser?.role === "pharmacist" || currentUser?.role === "admin";

  return (
    <DashboardLayout user={currentUser}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <Link
            href="/prescriptions"
            className="text-xs font-semibold text-primary hover:underline mb-1 inline-block"
          >
            ← Back to Prescriptions
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-navy">Prescription Details 💊</h1>
            <span className={`px-3 py-1 text-xs font-bold rounded-full border capitalize ${
              prescription.status === "dispensed"
                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                : "bg-amber-100 text-amber-800 border-amber-200"
            }`}>
              Status: {prescription.status}
            </span>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-danger text-sm rounded-btn">
            {error}
          </div>
        )}

        <div className="bg-white p-6 rounded-card border border-border shadow-xs space-y-6">
          {/* Patient & Doctor Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-btn border border-border">
            <div>
              <div className="text-xs font-semibold text-slate-500">Patient:</div>
              <div className="font-bold text-navy text-base">
                {prescription.patientId?.userId?.name || "Patient"}
              </div>
              <div className="text-xs text-slate-400">
                Email: {prescription.patientId?.userId?.email} | Phone: {prescription.patientId?.userId?.phone}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-500">Prescribing Physician:</div>
              <div className="font-bold text-navy text-base">
                Dr. {prescription.doctorId?.userId?.name || "Doctor"}
              </div>
              <div className="text-xs text-slate-400">
                Date: {new Date(prescription.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Prescribed Items Table */}
          <div>
            <h2 className="text-sm font-bold text-navy uppercase tracking-wider mb-3">
              Prescribed Medicines & Dosage
            </h2>
            <div className="border border-border rounded-btn overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-border text-xs">
                  <tr>
                    <th className="py-3 px-4">Medicine Item</th>
                    <th className="py-3 px-4">Dosage</th>
                    <th className="py-3 px-4">Frequency</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4 text-right">Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {prescription.medicines?.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-navy">{m.medicineName}</td>
                      <td className="py-3 px-4 text-slate-700 text-xs">{m.dosage}</td>
                      <td className="py-3 px-4 text-slate-700 text-xs">{m.frequency}</td>
                      <td className="py-3 px-4 text-slate-700 text-xs">{m.duration}</td>
                      <td className="py-3 px-4 text-right font-bold text-navy">{m.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {prescription.notes && (
            <div>
              <h2 className="text-xs font-bold text-navy uppercase tracking-wider mb-1">
                Doctor's Special Notes
              </h2>
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-btn border border-border whitespace-pre-wrap">
                {prescription.notes}
              </p>
            </div>
          )}

          {/* Pharmacist Dispense Action Button */}
          {isPharmacist && prescription.status !== "dispensed" && (
            <div className="pt-4 border-t border-border flex justify-end">
              <button
                onClick={handleDispense}
                disabled={dispensing}
                className="px-6 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-btn hover:bg-emerald-700 disabled:opacity-50 transition shadow-xs"
              >
                {dispensing ? "Dispensing..." : "✓ Dispense Medicines & Deduct Stock"}
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
