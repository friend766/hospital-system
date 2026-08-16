"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function AppointmentsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    fetchSession();
    fetchAppointments("", "");
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

  const fetchAppointments = async (status = "", date = "") => {
    try {
      setLoading(true);
      let url = "/api/appointments?";
      if (status) url += `status=${status}&`;
      if (date) url += `date=${date}&`;

      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setAppointments(data.appointments || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newStatus, newDate) => {
    setStatusFilter(newStatus);
    setDateFilter(newDate);
    fetchAppointments(newStatus, newDate);
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchAppointments(statusFilter, dateFilter);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
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
            <h1 className="text-2xl font-bold text-navy">Appointments</h1>
            <p className="text-sm text-slate-500">
              View and manage consultation schedules & status
            </p>
          </div>

          {currentUser?.role !== "doctor" && (
            <Link
              href="/appointments/new"
              className="inline-flex items-center justify-center px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-btn hover:bg-blue-700 transition shadow-xs"
            >
              + Book Appointment
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-card border border-border shadow-xs flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold text-slate-500 mr-2">
              Status:
            </span>
            {["", "pending", "confirmed", "completed", "cancelled"].map((st) => (
              <button
                key={st}
                onClick={() => handleFilterChange(st, dateFilter)}
                className={`px-3 py-1.5 rounded-btn text-xs font-semibold border transition capitalize ${
                  statusFilter === st
                    ? "bg-navy text-white border-navy"
                    : "bg-slate-50 text-slate-600 border-border hover:bg-slate-100"
                }`}
              >
                {st || "All Statuses"}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-xs font-semibold text-slate-500">
              Date:
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => handleFilterChange(statusFilter, e.target.value)}
              className="px-3 py-1.5 border border-border rounded-btn text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {dateFilter && (
              <button
                onClick={() => handleFilterChange(statusFilter, "")}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-card border border-border shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              Loading appointments...
            </div>
          ) : appointments.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No appointments found matching current filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-border">
                  <tr>
                    <th className="py-3.5 px-4">Date & Time</th>
                    <th className="py-3.5 px-4">Patient</th>
                    <th className="py-3.5 px-4">Doctor</th>
                    <th className="py-3.5 px-4">Reason / Notes</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {appointments.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-navy">{app.date}</div>
                        <div className="text-xs text-slate-400">{app.time}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-navy">
                          {app.patientId?.userId?.name || "Patient"}
                        </div>
                        <div className="text-xs text-slate-400">
                          {app.patientId?.userId?.phone || app.patientId?.userId?.email}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-navy">
                          Dr. {app.doctorId?.userId?.name || "Doctor"}
                        </div>
                        <div className="text-xs text-slate-400">
                          {app.doctorId?.specialization || "General"}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {app.reason || "General Consultation"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${getStatusBadge(
                            app.status
                          )}`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1">
                        {/* Role action buttons */}
                        {app.status === "pending" && (currentUser?.role === "receptionist" || currentUser?.role === "admin" || currentUser?.role === "doctor") && (
                          <button
                            onClick={() => handleStatusUpdate(app._id, "confirmed")}
                            className="px-2.5 py-1 bg-primary text-white text-xs font-semibold rounded-btn hover:bg-blue-700 transition"
                          >
                            Confirm
                          </button>
                        )}
                        {app.status === "confirmed" && (currentUser?.role === "doctor" || currentUser?.role === "admin") && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(app._id, "completed")}
                              className="px-2.5 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-btn hover:bg-emerald-700 transition"
                            >
                              Complete
                            </button>
                            <Link
                              href={`/medical-records/new?appointmentId=${app._id}&patientId=${app.patientId?._id}&doctorId=${app.doctorId?._id}`}
                              className="inline-block px-2.5 py-1 bg-blue-50 text-primary border border-blue-200 text-xs font-semibold rounded-btn hover:bg-blue-100 transition"
                            >
                              + Record
                            </Link>
                          </>
                        )}
                        {app.status !== "cancelled" && app.status !== "completed" && (
                          <button
                            onClick={() => handleStatusUpdate(app._id, "cancelled")}
                            className="px-2.5 py-1 bg-red-50 text-danger border border-red-200 text-xs font-semibold rounded-btn hover:bg-red-100 transition"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
