"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function DoctorDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [profileRes, appRes, patRes] = await Promise.all([
        fetch("/api/user/profile"),
        fetch("/api/appointments"),
        fetch("/api/patients"),
      ]);

      const profileData = await profileRes.json();
      const appData = await appRes.json();
      const patData = await patRes.json();

      if (profileRes.ok) setCurrentUser(profileData.user);
      if (appRes.ok) setAppointments(appData.appointments || []);
      if (patRes.ok) setPatients(patData.patients || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const todaysAppointments = appointments.filter(
    (a) => a.date === todayStr || a.status === "confirmed" || a.status === "pending"
  );

  const displayName = currentUser?.name
    ? currentUser.name.startsWith("Dr.")
      ? currentUser.name
      : `Dr. ${currentUser.name}`
    : "Doctor";

  return (
    <DashboardLayout user={currentUser}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-navy dark:text-white">
            Doctor Dashboard — {displayName} 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Consultation schedule and active patient statistics
          </p>
        </div>

        {/* Summary Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#1E293B] p-6 rounded-card border border-border dark:border-[#334155] shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 text-primary flex items-center justify-center text-xl font-bold border border-blue-200 dark:border-blue-800">
              📅
            </div>
            <div>
              <div className="text-2xl font-black text-navy dark:text-white">
                {todaysAppointments.length}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                Active Appointments
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1E293B] p-6 rounded-card border border-border dark:border-[#334155] shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center text-xl font-bold border border-emerald-200 dark:border-emerald-800">
              👥
            </div>
            <div>
              <div className="text-2xl font-black text-navy dark:text-white">{patients.length}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                Total Patients
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1E293B] p-6 rounded-card border border-border dark:border-[#334155] shadow-xs flex items-center justify-between">
            <div>
              <div className="font-extrabold text-navy dark:text-white text-sm">Medical Records</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Add or review clinical notes</div>
            </div>
            <Link
              href="/medical-records/new"
              className="px-3.5 py-2 bg-primary text-white text-xs font-bold rounded-btn hover:bg-blue-700 transition shadow-xs"
            >
              + New Record
            </Link>
          </div>
        </div>

        {/* Today's Schedule Table */}
        <div className="bg-white dark:bg-[#1E293B] rounded-card border border-border dark:border-[#334155] shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-navy dark:text-white">
              Consultation Queue & Appointments
            </h2>
            <Link
              href="/appointments"
              className="text-xs font-bold text-primary hover:underline"
            >
              View Full Schedule
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-6 text-sm text-slate-500 dark:text-slate-400">
              Loading schedule...
            </div>
          ) : todaysAppointments.length === 0 ? (
            <div className="text-center py-6 text-sm text-slate-500 dark:text-slate-400">
              No appointments scheduled for today.
            </div>
          ) : (
            <div className="divide-y divide-border dark:divide-[#334155]">
              {todaysAppointments.slice(0, 5).map((app) => (
                <div
                  key={app._id}
                  className="py-3.5 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-navy dark:text-white text-sm">
                      Patient: {app.patientId?.userId?.name || "Patient"}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {app.date} at {app.time} — Reason: {app.reason || "General"}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800 capitalize">
                      {app.status}
                    </span>
                    <Link
                      href={`/medical-records/new?appointmentId=${app._id}&patientId=${app.patientId?._id}`}
                      className="px-3 py-1.5 bg-lightBlue dark:bg-slate-800 text-primary dark:text-blue-300 text-xs font-bold rounded-btn border border-blue-200 dark:border-slate-700"
                    >
                      + Record
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
