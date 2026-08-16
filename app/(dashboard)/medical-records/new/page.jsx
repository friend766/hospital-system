"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";

function NewRecordFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preAppointmentId = searchParams.get("appointmentId") || "";
  const prePatientId = searchParams.get("patientId") || "";
  const preDoctorId = searchParams.get("doctorId") || "";

  const [currentUser, setCurrentUser] = useState(null);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    patientId: prePatientId,
    doctorId: preDoctorId,
    appointmentId: preAppointmentId,
    visitDate: new Date().toISOString().split("T")[0],
    diagnosis: "",
    treatment: "",
    notes: "",
  });

  useEffect(() => {
    fetchSessionAndOptions();
  }, []);

  const fetchSessionAndOptions = async () => {
    try {
      setLoading(true);
      const [profileRes, patientsRes, doctorsRes] = await Promise.all([
        fetch("/api/user/profile"),
        fetch("/api/patients"),
        fetch("/api/doctors"),
      ]);

      const profileData = await profileRes.json();
      const patientsData = await patientsRes.json();
      const doctorsData = await doctorsRes.json();

      if (profileRes.ok && profileData.user) {
        setCurrentUser(profileData.user);
      }

      if (patientsRes.ok) {
        setPatients(patientsData.patients || []);
        if (!prePatientId && patientsData.patients?.length > 0) {
          setFormData((prev) => ({ ...prev, patientId: patientsData.patients[0]._id }));
        }
      }

      if (doctorsRes.ok) {
        setDoctors(doctorsData.doctors || []);
        if (!preDoctorId && doctorsData.doctors?.length > 0) {
          setFormData((prev) => ({ ...prev, doctorId: doctorsData.doctors[0]._id }));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/medical-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/medical-records");
        router.refresh();
      } else {
        throw new Error(data.error || "Failed to create medical record");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout user={currentUser}>
        <div className="p-8 text-center text-slate-500">Loading form options...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={currentUser}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-navy">New Medical Record</h1>
          <p className="text-sm text-slate-500">
            Document clinical diagnosis, treatment plan, and consultation notes
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-danger text-sm rounded-btn">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-card border border-border shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Patient *
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

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Attending Doctor *
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
                    Dr. {d.userId?.name} — {d.specialization}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Visit Date *
              </label>
              <input
                type="date"
                required
                value={formData.visitDate}
                onChange={(e) =>
                  setFormData({ ...formData, visitDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Diagnosis *
            </label>
            <input
              type="text"
              required
              value={formData.diagnosis}
              onChange={(e) =>
                setFormData({ ...formData, diagnosis: e.target.value })
              }
              placeholder="e.g. Essential Hypertension, Acute Bronchitis"
              className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Treatment Plan & Recommendations
            </label>
            <textarea
              rows={3}
              value={formData.treatment}
              onChange={(e) =>
                setFormData({ ...formData, treatment: e.target.value })
              }
              placeholder="e.g. Prescribed bed rest for 3 days, low sodium diet, hydration..."
              className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Clinical Notes
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Observation notes, lab test recommendations, follow-up instructions..."
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
              {saving ? "Saving Record..." : "Save Medical Record"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default function NewMedicalRecordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading form...</div>}>
      <NewRecordFormContent />
    </Suspense>
  );
}
