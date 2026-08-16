"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function PatientDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    emergencyContact: { name: "", phone: "", relationship: "" },
  });

  useEffect(() => {
    fetchSession();
    fetchPatient();
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

  const fetchPatient = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/patients/${id}`);
      const data = await res.json();
      if (res.ok && data.patient) {
        setPatient(data.patient);
        setFormData({
          name: data.patient.userId?.name || "",
          phone: data.patient.userId?.phone || "",
          dateOfBirth: data.patient.dateOfBirth || "",
          gender: data.patient.gender || "",
          address: data.patient.address || "",
          emergencyContact: data.patient.emergencyContact || {
            name: "",
            phone: "",
            relationship: "",
          },
        });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to load patient" });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (currentUser?.role === "doctor") return; // Doctors cannot modify

    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch(`/api/patients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Patient record updated successfully!" });
        setPatient(data.patient);
      } else {
        throw new Error(data.error || "Failed to update patient");
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this patient record? This cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/patients/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/patients");
      } else {
        const data = await res.json();
        alert(data.error || "Delete failed");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <DashboardLayout user={currentUser}>
        <div className="p-8 text-center text-slate-500">Loading patient details...</div>
      </DashboardLayout>
    );
  }

  if (!patient) {
    return (
      <DashboardLayout user={currentUser}>
        <div className="p-8 text-center text-slate-500 max-w-lg mx-auto space-y-4">
          <div className="p-4 bg-red-50 text-danger border border-red-200 rounded-btn text-sm">
            {message.text || "Patient record not found or access forbidden."}
          </div>
          <Link href="/patients" className="text-xs font-semibold text-primary hover:underline">
            ← Return to Patients List
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const isDoctor = currentUser?.role === "doctor";

  return (
    <DashboardLayout user={currentUser}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/patients"
              className="text-xs font-semibold text-primary hover:underline mb-1 inline-block"
            >
              ← Back to Patient Directory
            </Link>
            <h1 className="text-2xl font-bold text-navy">
              Patient Record: {patient.userId?.name}
            </h1>
            <p className="text-sm text-slate-500">
              Registered Email: {patient.userId?.email}
            </p>
          </div>

          {currentUser?.role === "admin" && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-50 text-danger border border-red-200 text-sm font-semibold rounded-btn hover:bg-red-100 transition"
            >
              Delete Patient
            </button>
          )}

          {isDoctor && (
            <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full border border-slate-200">
              🔒 View-Only Mode (Doctor)
            </span>
          )}
        </div>

        {message.text && (
          <div
            className={`p-4 rounded-btn border text-sm font-medium ${
              message.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-danger"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="bg-white p-6 rounded-card border border-border shadow-xs space-y-4">
            <h2 className="text-base font-bold text-navy border-b border-border pb-3">
              Personal Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  disabled={isDoctor}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-slate-100 disabled:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  disabled={isDoctor}
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-slate-100 disabled:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  disabled={isDoctor}
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    setFormData({ ...formData, dateOfBirth: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-slate-100 disabled:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Gender
                </label>
                <select
                  disabled={isDoctor}
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white disabled:bg-slate-100 disabled:text-slate-600"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  disabled={isDoctor}
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-slate-100 disabled:text-slate-600"
                />
              </div>
            </div>

            <h3 className="text-sm font-bold text-navy pt-3 border-t border-border">
              Emergency Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  disabled={isDoctor}
                  value={formData.emergencyContact?.name || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emergencyContact: {
                        ...formData.emergencyContact,
                        name: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-slate-100 disabled:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  disabled={isDoctor}
                  value={formData.emergencyContact?.phone || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emergencyContact: {
                        ...formData.emergencyContact,
                        phone: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-slate-100 disabled:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Relationship
                </label>
                <input
                  type="text"
                  disabled={isDoctor}
                  value={formData.emergencyContact?.relationship || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emergencyContact: {
                        ...formData.emergencyContact,
                        relationship: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-slate-100 disabled:text-slate-600"
                />
              </div>
            </div>
          </div>

          {!isDoctor && (
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-btn hover:bg-blue-700 disabled:opacity-50 transition shadow-xs"
              >
                {saving ? "Saving Changes..." : "Save Patient Changes"}
              </button>
            </div>
          )}
        </form>
      </div>
    </DashboardLayout>
  );
}
