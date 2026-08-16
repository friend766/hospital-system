"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import RecordTimeline from "@/components/common/RecordTimeline";

export default function MedicalRecordsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("list");

  useEffect(() => {
    fetchSession();
    fetchRecords();
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

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/medical-records");
      const data = await res.json();
      if (res.ok) {
        setRecords(data.records || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout user={currentUser}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy">Medical & Diagnosis Records</h1>
            <p className="text-sm text-slate-500">
              Patient consultation history, clinical diagnoses, and treatment plans
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* View Mode Toggle */}
            <div className="bg-white border border-border p-1 rounded-btn flex items-center text-xs font-semibold">
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 rounded-btn transition ${
                  viewMode === "list"
                    ? "bg-navy text-white"
                    : "text-slate-600 hover:text-navy"
                }`}
              >
                📋 List
              </button>
              <button
                onClick={() => setViewMode("timeline")}
                className={`px-3 py-1.5 rounded-btn transition ${
                  viewMode === "timeline"
                    ? "bg-navy text-white"
                    : "text-slate-600 hover:text-navy"
                }`}
              >
                ⏳ Timeline
              </button>
            </div>

            {(currentUser?.role === "doctor" || currentUser?.role === "admin") && (
              <Link
                href="/medical-records/new"
                className="inline-flex items-center justify-center px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-btn hover:bg-blue-700 transition shadow-xs"
              >
                + Create Medical Record
              </Link>
            )}
          </div>
        </div>

        {/* Record Content */}
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm bg-white border border-border rounded-card">
            Loading medical records...
          </div>
        ) : viewMode === "timeline" ? (
          <RecordTimeline records={records} />
        ) : (
          <div className="bg-white rounded-card border border-border shadow-xs overflow-hidden">
            {records.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No medical records found.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {records.map((rec) => (
                  <div
                    key={rec._id}
                    className="p-6 hover:bg-slate-50/50 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-400">
                          {rec.visitDate}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-primary border border-blue-100 font-medium">
                          Visit Record
                        </span>
                      </div>

                      <h2 className="font-bold text-base text-navy">
                        Patient: {rec.patientId?.userId?.name || "Patient"}
                      </h2>

                      <div className="text-xs text-slate-600">
                        <span className="font-semibold text-slate-700">Doctor:</span> Dr.{" "}
                        {rec.doctorId?.userId?.name || "Attending Doctor"}
                      </div>

                      {rec.diagnosis && (
                        <div className="text-sm text-slate-700 pt-1">
                          <span className="font-semibold text-navy">Diagnosis:</span>{" "}
                          {rec.diagnosis}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <Link
                        href={`/medical-records/${rec._id}`}
                        className="px-4 py-2 bg-lightBlue text-primary border border-blue-200 text-xs font-semibold rounded-btn hover:bg-blue-100 transition"
                      >
                        View Details & Notes
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
