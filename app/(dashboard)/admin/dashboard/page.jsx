"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function AdminDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState({
    patientsCount: 0,
    doctorsCount: 0,
    appointmentsCount: 0,
    recordsCount: 0,
    medicinesCount: 0,
    invoicesCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const [profileRes, appRes, patRes, docRes, recRes, medRes, billRes] = await Promise.all([
        fetch("/api/user/profile"),
        fetch("/api/appointments"),
        fetch("/api/patients"),
        fetch("/api/doctors"),
        fetch("/api/medical-records"),
        fetch("/api/medicines"),
        fetch("/api/billing"),
      ]);

      const profileData = await profileRes.json();
      const appData = await appRes.json();
      const patData = await patRes.json();
      const docData = await docRes.json();
      const recData = await recRes.json();
      const medData = await medRes.json();
      const billData = await billRes.json();

      if (profileRes.ok) setCurrentUser(profileData.user);

      setStats({
        appointmentsCount: appData.appointments?.length || 0,
        patientsCount: patData.patients?.length || 0,
        doctorsCount: docData.doctors?.length || 0,
        recordsCount: recData.records?.length || 0,
        medicinesCount: medData.medicines?.length || 0,
        invoicesCount: billData.invoices?.length || 0,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout user={currentUser}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-navy">
            Hospital & Pharmacy System Dashboard 🛠️
          </h1>
          <p className="text-sm text-slate-500">
            Complete system overview, hospital metrics, pharmacy inventory & billing
          </p>
        </div>

        {/* System Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-5 rounded-card border border-border shadow-xs">
            <div className="text-xl font-bold text-navy">{stats.patientsCount}</div>
            <div className="text-xs text-slate-500 font-medium mt-1">Patients</div>
          </div>

          <div className="bg-white p-5 rounded-card border border-border shadow-xs">
            <div className="text-xl font-bold text-navy">{stats.doctorsCount}</div>
            <div className="text-xs text-slate-500 font-medium mt-1">Doctors</div>
          </div>

          <div className="bg-white p-5 rounded-card border border-border shadow-xs">
            <div className="text-xl font-bold text-navy">{stats.appointmentsCount}</div>
            <div className="text-xs text-slate-500 font-medium mt-1">Appointments</div>
          </div>

          <div className="bg-white p-5 rounded-card border border-border shadow-xs">
            <div className="text-xl font-bold text-navy">{stats.recordsCount}</div>
            <div className="text-xs text-slate-500 font-medium mt-1">Medical Records</div>
          </div>

          <div className="bg-white p-5 rounded-card border border-border shadow-xs">
            <div className="text-xl font-bold text-primary">{stats.medicinesCount}</div>
            <div className="text-xs text-slate-500 font-medium mt-1">Medicines</div>
          </div>

          <div className="bg-white p-5 rounded-card border border-border shadow-xs">
            <div className="text-xl font-bold text-emerald-600">{stats.invoicesCount}</div>
            <div className="text-xs text-slate-500 font-medium mt-1">Invoices</div>
          </div>
        </div>

        {/* Quick Management Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-card border border-border shadow-xs space-y-3">
            <h2 className="text-base font-bold text-navy">Doctor & Clinical Staff</h2>
            <p className="text-xs text-slate-500">
              Manage doctor profiles, schedules, departments, and medical records.
            </p>
            <div className="flex space-x-2 pt-2">
              <Link
                href="/doctors"
                className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-btn hover:bg-slate-200"
              >
                View Doctors
              </Link>
              <Link
                href="/doctors/new"
                className="px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-btn hover:bg-blue-700"
              >
                + Add Doctor
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-card border border-border shadow-xs space-y-3">
            <h2 className="text-base font-bold text-navy">Pharmacy Inventory</h2>
            <p className="text-xs text-slate-500">
              Manage pharmaceutical stock, low-stock threshold alerts, and categories.
            </p>
            <div className="flex space-x-2 pt-2">
              <Link
                href="/medicines"
                className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-btn hover:bg-slate-200"
              >
                Stock Inventory
              </Link>
              <Link
                href="/medicines/new"
                className="px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-btn hover:bg-blue-700"
              >
                + Add Medicine
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-card border border-border shadow-xs space-y-3">
            <h2 className="text-base font-bold text-navy">Billing & Prescriptions</h2>
            <p className="text-xs text-slate-500">
              Oversee patient prescriptions, dispensing queue, and medical invoices.
            </p>
            <div className="flex space-x-2 pt-2">
              <Link
                href="/prescriptions"
                className="px-3 py-1.5 bg-navy text-white text-xs font-semibold rounded-btn hover:bg-slate-800"
              >
                Prescriptions
              </Link>
              <Link
                href="/billing"
                className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-btn hover:bg-emerald-700"
              >
                Invoices
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
