"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function DoctorsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchSession();
    fetchDoctors("");
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

  const fetchDoctors = async (query = "") => {
    try {
      setLoading(true);
      const res = await fetch(`/api/doctors?search=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (res.ok) {
        setDoctors(data.doctors || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDoctors(search);
  };

  return (
    <DashboardLayout user={currentUser}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy">Doctors & Medical Staff</h1>
            <p className="text-sm text-slate-500">
              Browse hospital specialists, schedules, and departments
            </p>
          </div>

          {currentUser?.role === "admin" && (
            <Link
              href="/doctors/new"
              className="inline-flex items-center justify-center px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-btn hover:bg-blue-700 transition shadow-xs"
            >
              + Add New Doctor
            </Link>
          )}
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-card border border-border shadow-xs">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by doctor name or specialization (e.g. Cardiology)..."
              className="flex-1 px-4 py-2 border border-border rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="px-5 py-2 bg-navy text-white text-sm font-semibold rounded-btn hover:bg-slate-800 transition"
            >
              Search
            </button>
          </form>
        </div>

        {/* Doctor Grid Cards */}
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            Loading doctor profiles...
          </div>
        ) : doctors.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No doctors found matching criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <div
                key={doctor._id}
                className="bg-white p-6 rounded-card border border-border shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-lightBlue text-primary flex items-center justify-center font-bold text-lg border border-blue-200 shrink-0">
                    👨‍⚕️
                  </div>
                  <div>
                    <h2 className="font-bold text-base text-navy">
                      Dr. {doctor.userId?.name || "Unassigned"}
                    </h2>
                    <p className="text-xs font-semibold text-primary">
                      {doctor.specialization}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {doctor.department}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-btn space-y-1">
                  <div className="font-medium text-slate-700">
                    Available Days:
                  </div>
                  <div className="text-slate-500">
                    {doctor.availability?.days?.join(", ") || "Mon - Fri"}
                  </div>
                  <div className="font-medium text-slate-700 pt-1">
                    Contact:
                  </div>
                  <div className="text-slate-500">
                    {doctor.userId?.email}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <Link
                    href={`/doctors/${doctor._id}`}
                    className="text-xs font-semibold text-slate-600 hover:text-navy"
                  >
                    View Details
                  </Link>

                  {(currentUser?.role === "patient" || currentUser?.role === "receptionist") && (
                    <Link
                      href={`/appointments/new?doctorId=${doctor._id}`}
                      className="px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-btn hover:bg-blue-700 transition"
                    >
                      Book Appointment
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
