"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function PatientDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [profileRes, appRes, recRes] = await Promise.all([
        fetch("/api/user/profile"),
        fetch("/api/appointments"),
        fetch("/api/medical-records"),
      ]);

      const profileData = await profileRes.json();
      const appData = await appRes.json();
      const recData = await recRes.json();

      if (profileRes.ok) setCurrentUser(profileData.user);
      if (appRes.ok) setAppointments(appData.appointments || []);
      if (recRes.ok) setRecords(recData.records || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const upcomingAppointments = appointments.filter(
    (a) => a.status === "pending" || a.status === "confirmed"
  );

  return (
    <DashboardLayout user={currentUser}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-navy">
            Welcome, {currentUser?.name || "Patient"}! 👋
          </h1>
          <p className="text-sm text-slate-500">
            Patient Portal & Health Dashboard
          </p>
        </div>

        {/* Quick Actions & Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-card border border-border shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-primary flex items-center justify-center text-xl font-bold">
              📅
            </div>
            <div>
              <div className="text-2xl font-bold text-navy">
                {upcomingAppointments.length}
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Upcoming Appointments
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-card border border-border shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
              📋
            </div>
            <div>
              <div className="text-2xl font-bold text-navy">{records.length}</div>
              <div className="text-xs text-slate-500 font-medium">
                Medical Records
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-card border border-border shadow-xs flex items-center justify-between">
            <div>
              <div className="font-bold text-navy text-sm">Need a Doctor?</div>
              <div className="text-xs text-slate-500">
                Book a consultation easily
              </div>
            </div>
            <Link
              href="/appointments/new"
              className="px-3 py-2 bg-primary text-white text-xs font-semibold rounded-btn hover:bg-blue-700 transition"
            >
              Book Now
            </Link>
          </div>
        </div>

        {/* Upcoming Appointments Table */}
        <div className="bg-white rounded-card border border-border shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-navy">
              Your Upcoming Appointments
            </h2>
            <Link
              href="/appointments"
              className="text-xs font-semibold text-primary hover:underline"
            >
              View All
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-6 text-sm text-slate-500">
              Loading appointments...
            </div>
          ) : upcomingAppointments.length === 0 ? (
            <div className="text-center py-6 text-sm text-slate-500">
              No upcoming appointments found.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {upcomingAppointments.slice(0, 3).map((app) => (
                <div
                  key={app._id}
                  className="py-3 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-navy text-sm">
                      Dr. {app.doctorId?.userId?.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {app.date} at {app.time} — {app.doctorId?.specialization}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
