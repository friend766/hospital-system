"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function PrescriptionsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchSession();
    fetchPrescriptions("");
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

  const fetchPrescriptions = async (status = "") => {
    try {
      setLoading(true);
      const res = await fetch(`/api/prescriptions?status=${status}`);
      const data = await res.json();
      if (res.ok) {
        setPrescriptions(data.prescriptions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (status) => {
    setStatusFilter(status);
    fetchPrescriptions(status);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "dispensed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <DashboardLayout user={currentUser}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy">Prescriptions Directory</h1>
            <p className="text-sm text-slate-500">
              Doctor issued prescriptions and pharmacy dispensing queue
            </p>
          </div>

          {(currentUser?.role === "doctor" || currentUser?.role === "admin") && (
            <Link
              href="/prescriptions/new"
              className="inline-flex items-center justify-center px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-btn hover:bg-blue-700 transition shadow-xs"
            >
              + Issue Prescription
            </Link>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="bg-white p-4 rounded-card border border-border shadow-xs flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500 mr-2">Filter Status:</span>
          {["", "pending", "dispensed", "cancelled"].map((st) => (
            <button
              key={st}
              onClick={() => handleFilterChange(st)}
              className={`px-3 py-1.5 rounded-btn text-xs font-semibold border transition capitalize ${
                statusFilter === st
                  ? "bg-navy text-white border-navy"
                  : "bg-slate-50 text-slate-600 border-border hover:bg-slate-100"
              }`}
            >
              {st || "All Prescriptions"}
            </button>
          ))}
        </div>

        {/* Prescription List */}
        <div className="bg-white rounded-card border border-border shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500 text-sm">Loading prescriptions...</div>
          ) : prescriptions.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No prescriptions found.</div>
          ) : (
            <div className="divide-y divide-border">
              {prescriptions.map((rx) => (
                <div key={rx._id} className="p-6 hover:bg-slate-50/50 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-navy text-base">
                        Patient: {rx.patientId?.userId?.name || "Patient"}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${getStatusBadge(rx.status)}`}>
                        {rx.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500">
                      Prescribed by Dr. {rx.doctorId?.userId?.name || "Doctor"} • Items: {rx.medicines?.length || 0}
                    </div>

                    <div className="text-xs text-slate-600 font-medium pt-1">
                      Medicines: {rx.medicines?.map((m) => m.medicineName).join(", ")}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <Link
                      href={`/prescriptions/${rx._id}`}
                      className="px-4 py-2 bg-lightBlue text-primary border border-blue-200 text-xs font-semibold rounded-btn hover:bg-blue-100 transition"
                    >
                      View & Dispense
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
