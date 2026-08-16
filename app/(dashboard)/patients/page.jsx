"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function PatientsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchSession();
    fetchPatients("");
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

  const fetchPatients = async (query = "") => {
    try {
      setLoading(true);
      const res = await fetch(`/api/patients?search=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (res.ok) {
        setPatients(data.patients || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPatients(search);
  };

  return (
    <DashboardLayout user={currentUser}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy">Patients Directory</h1>
            <p className="text-sm text-slate-500">
              Manage patient records and hospital registrations
            </p>
          </div>

          {(currentUser?.role === "admin" || currentUser?.role === "receptionist") && (
            <Link
              href="/patients/new"
              className="inline-flex items-center justify-center px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-btn hover:bg-blue-700 transition shadow-xs"
            >
              + Register New Patient
            </Link>
          )}
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-card border border-border shadow-xs">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patients by name, email, or phone..."
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

        {/* Patients Table / List */}
        <div className="bg-white rounded-card border border-border shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              Loading patient records...
            </div>
          ) : patients.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No patients found matching criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-border">
                  <tr>
                    <th className="py-3.5 px-4">Patient Name</th>
                    <th className="py-3.5 px-4">Contact Info</th>
                    <th className="py-3.5 px-4">DOB / Gender</th>
                    <th className="py-3.5 px-4">Emergency Contact</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {patients.map((patient) => (
                    <tr key={patient._id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-navy">
                          {patient.userId?.name || "N/A"}
                        </div>
                        <div className="text-xs text-slate-400">
                          ID: {patient._id.slice(-6).toUpperCase()}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div>{patient.userId?.email}</div>
                        <div className="text-xs text-slate-400">
                          {patient.userId?.phone || "No Phone"}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div>{patient.dateOfBirth || "N/A"}</div>
                        <div className="text-xs text-slate-400">
                          {patient.gender || "Not specified"}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {patient.emergencyContact?.name ? (
                          <div>
                            <span className="font-medium text-navy">
                              {patient.emergencyContact.name}
                            </span>{" "}
                            ({patient.emergencyContact.relationship})
                            <div className="text-xs text-slate-400">
                              {patient.emergencyContact.phone}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">None</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/patients/${patient._id}`}
                          className="inline-block px-3 py-1.5 bg-lightBlue text-primary text-xs font-semibold rounded-btn border border-blue-200 hover:bg-blue-100 transition"
                        >
                          View Details
                        </Link>
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
