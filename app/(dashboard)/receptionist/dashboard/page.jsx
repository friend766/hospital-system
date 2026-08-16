"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function ReceptionistDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [profileRes, appRes, patRes, docRes] = await Promise.all([
        fetch("/api/user/profile"),
        fetch("/api/appointments"),
        fetch("/api/patients"),
        fetch("/api/doctors"),
      ]);

      const profileData = await profileRes.json();
      const appData = await appRes.json();
      const patData = await patRes.json();
      const docData = await docRes.json();

      if (profileRes.ok) setCurrentUser(profileData.user);
      if (appRes.ok) setAppointments(appData.appointments || []);
      if (patRes.ok) setPatients(patData.patients || []);
      if (docRes.ok) setDoctors(docData.doctors || []);
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
            Receptionist Dashboard — Welcome 👋
          </h1>
          <p className="text-sm text-slate-500">
            Hospital Front Desk & Patient Registration Management
          </p>
        </div>

        {/* Quick Actions & Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-card border border-border shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-primary flex items-center justify-center text-xl font-bold">
              👥
            </div>
            <div>
              <div className="text-2xl font-bold text-navy">{patients.length}</div>
              <div className="text-xs text-slate-500 font-medium">Total Patients</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-card border border-border shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-xl font-bold">
              👨‍⚕️
            </div>
            <div>
              <div className="text-2xl font-bold text-navy">{doctors.length}</div>
              <div className="text-xs text-slate-500 font-medium">Available Doctors</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-card border border-border shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
              📅
            </div>
            <div>
              <div className="text-2xl font-bold text-navy">{appointments.length}</div>
              <div className="text-xs text-slate-500 font-medium">Total Appointments</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-card border border-border shadow-xs flex flex-col justify-center space-y-2">
            <Link
              href="/patients/new"
              className="w-full py-2 px-3 bg-primary text-white text-xs font-semibold rounded-btn hover:bg-blue-700 text-center transition"
            >
              + Register Patient
            </Link>
            <Link
              href="/appointments/new"
              className="w-full py-2 px-3 bg-navy text-white text-xs font-semibold rounded-btn hover:bg-slate-800 text-center transition"
            >
              + Book Appointment
            </Link>
          </div>
        </div>

        {/* Appointment Schedule */}
        <div className="bg-white rounded-card border border-border shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-navy">Recent & Upcoming Appointments</h2>
            <Link href="/appointments" className="text-xs font-semibold text-primary hover:underline">
              Manage All
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-6 text-sm text-slate-500">Loading appointments...</div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-6 text-sm text-slate-500">No appointments logged.</div>
          ) : (
            <div className="divide-y divide-border">
              {appointments.slice(0, 5).map((app) => (
                <div key={app._id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-navy text-sm">
                      Patient: {app.patientId?.userId?.name || "Patient"}
                    </div>
                    <div className="text-xs text-slate-500">
                      With Dr. {app.doctorId?.userId?.name} on {app.date} ({app.time})
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
