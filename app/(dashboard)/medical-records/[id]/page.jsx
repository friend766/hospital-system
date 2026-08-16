"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PdfExportButton from "@/components/common/PdfExportButton";

export default function MedicalRecordDetailPage({ params }) {
  const { id } = use(params);
  const [currentUser, setCurrentUser] = useState(null);
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSession();
    fetchRecord();
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

  const fetchRecord = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/medical-records/${id}`);
      const data = await res.json();
      if (res.ok && data.record) {
        setRecord(data.record);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout user={currentUser}>
        <div className="p-8 text-center text-slate-500">Loading medical record...</div>
      </DashboardLayout>
    );
  }

  if (!record) {
    return (
      <DashboardLayout user={currentUser}>
        <div className="p-8 text-center text-slate-500">Medical record not found.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={currentUser}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/medical-records"
              className="text-xs font-semibold text-primary hover:underline mb-1 inline-block"
            >
              ← Back to Medical Records
            </Link>
            <h1 className="text-2xl font-bold text-navy">Medical Record Details</h1>
            <p className="text-sm text-slate-500">Visit Date: {record.visitDate}</p>
          </div>
          <PdfExportButton title="Export / Print PDF" />
        </div>

        <div className="bg-white p-6 rounded-card border border-border shadow-xs space-y-6">
          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-btn border border-border">
            <div>
              <div className="text-xs font-semibold text-slate-500">Patient:</div>
              <div className="font-bold text-navy text-base">
                {record.patientId?.userId?.name || "Patient"}
              </div>
              <div className="text-xs text-slate-400">
                {record.patientId?.userId?.email} | {record.patientId?.userId?.phone}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-500">Attending Doctor:</div>
              <div className="font-bold text-navy text-base">
                Dr. {record.doctorId?.userId?.name || "Doctor"}
              </div>
              <div className="text-xs text-slate-400">
                {record.doctorId?.specialization} ({record.doctorId?.department})
              </div>
            </div>
          </div>

          {/* Clinical Details */}
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-bold text-navy uppercase tracking-wider text-slate-600 mb-1">
                Diagnosis
              </h2>
              <p className="text-base text-navy font-semibold bg-blue-50/50 p-3 rounded-btn border border-blue-100">
                {record.diagnosis || "No diagnosis specified"}
              </p>
            </div>

            <div>
              <h2 className="text-sm font-bold text-navy uppercase tracking-wider text-slate-600 mb-1">
                Treatment Plan
              </h2>
              <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-btn border border-border whitespace-pre-wrap">
                {record.treatment || "No treatment details recorded"}
              </p>
            </div>

            <div>
              <h2 className="text-sm font-bold text-navy uppercase tracking-wider text-slate-600 mb-1">
                Clinical Notes
              </h2>
              <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-btn border border-border whitespace-pre-wrap">
                {record.notes || "No clinical notes recorded"}
              </p>
            </div>
          </div>

          {/* Pharmacy / Prescription Module */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-btn text-xs text-navy space-y-2">
            <div className="flex items-center justify-between font-bold">
              <span>Pharmacy & Prescription Module</span>
              <span className="bg-blue-100 text-primary px-2 py-0.5 rounded font-semibold">Active</span>
            </div>
            <p className="text-slate-600">
              Issue a prescription for this patient's consultation visit directly below.
            </p>
            <Link
              href={`/prescriptions/new?medicalRecordId=${record._id}&patientId=${record.patientId?._id}`}
              className="inline-block mt-2 px-4 py-2 bg-primary text-white font-semibold rounded-btn text-xs hover:bg-blue-700 transition shadow-xs"
            >
              + Create Prescription for Patient
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
