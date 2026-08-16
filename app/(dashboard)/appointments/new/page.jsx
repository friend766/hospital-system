"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";

function AppointmentFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedDoctorId = searchParams.get("doctorId") || "";

  const [currentUser, setCurrentUser] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: preselectedDoctorId,
    date: new Date().toISOString().split("T")[0],
    time: "10:00 AM",
    reason: "",
  });

  useEffect(() => {
    fetchSessionAndOptions();
  }, []);

  const fetchSessionAndOptions = async () => {
    try {
      setLoading(true);
      const [profileRes, doctorsRes, patientsRes] = await Promise.all([
        fetch("/api/user/profile"),
        fetch("/api/doctors"),
        fetch("/api/patients"),
      ]);

      const profileData = await profileRes.json();
      const doctorsData = await doctorsRes.json();
      const patientsData = await patientsRes.json();

      if (profileRes.ok && profileData.user) {
        setCurrentUser(profileData.user);
      }

      if (doctorsRes.ok) {
        setDoctors(doctorsData.doctors || []);
        if (!preselectedDoctorId && doctorsData.doctors?.length > 0) {
          setFormData((prev) => ({ ...prev, doctorId: doctorsData.doctors[0]._id }));
        }
      }

      if (patientsRes.ok) {
        setPatients(patientsData.patients || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentUser?.role === "doctor") {
      setError("Doctors cannot book appointments.");
      return;
    }
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/appointments");
        router.refresh();
      } else {
        throw new Error(data.error || "Failed to book appointment");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const timeSlots = [
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
  ];

  if (loading) {
    return (
      <DashboardLayout user={currentUser}>
        <div className="p-8 text-center text-slate-500">Loading booking options...</div>
      </DashboardLayout>
    );
  }

  if (currentUser?.role === "doctor") {
    return (
      <DashboardLayout user={currentUser}>
        <div className="max-w-lg mx-auto p-8 bg-white border border-border rounded-card text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-50 text-danger flex items-center justify-center text-xl font-bold mx-auto">
            🚫
          </div>
          <h1 className="text-xl font-bold text-navy">Appointment Booking Restricted</h1>
          <p className="text-sm text-slate-500">
            Doctors cannot book appointments. Appointments can only be requested by patients or registered by receptionists/admins.
          </p>
          <Link
            href="/appointments"
            className="inline-block px-4 py-2 bg-navy text-white text-xs font-semibold rounded-btn"
          >
            ← Return to Appointments Schedule
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={currentUser}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-navy">Book Appointment</h1>
          <p className="text-sm text-slate-500">
            Schedule a consultation with a hospital specialist
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-danger text-sm rounded-btn">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-card border border-border shadow-xs space-y-4">
          {/* If Receptionist / Admin, pick patient */}
          {(currentUser?.role === "receptionist" || currentUser?.role === "admin") && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Select Patient *
              </label>
              <select
                required
                value={formData.patientId}
                onChange={(e) =>
                  setFormData({ ...formData, patientId: e.target.value })
                }
                className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              >
                <option value="">-- Choose Patient --</option>
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.userId?.name} ({p.userId?.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Select Doctor *
            </label>
            <select
              required
              value={formData.doctorId}
              onChange={(e) =>
                setFormData({ ...formData, doctorId: e.target.value })
              }
              className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            >
              <option value="">-- Choose Doctor --</option>
              {doctors.map((d) => (
                <option key={d._id} value={d._id}>
                  Dr. {d.userId?.name} — {d.specialization} ({d.department})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Appointment Date *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Preferred Time Slot *
              </label>
              <select
                required
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              >
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Reason for Visit / Symptoms
            </label>
            <textarea
              rows={3}
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              placeholder="Brief description of symptoms or consultation reason..."
              className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-btn hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-btn hover:bg-blue-700 disabled:opacity-50 transition shadow-xs"
            >
              {saving ? "Booking..." : "Confirm Booking"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default function NewAppointmentPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading form...</div>}>
      <AppointmentFormContent />
    </Suspense>
  );
}
