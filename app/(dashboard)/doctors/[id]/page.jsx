"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function DoctorDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    specialization: "",
    department: "",
  });

  useEffect(() => {
    fetchSession();
    fetchDoctor();
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

  const fetchDoctor = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/doctors/${id}`);
      const data = await res.json();
      if (res.ok && data.doctor) {
        setDoctor(data.doctor);
        setFormData({
          name: data.doctor.userId?.name || "",
          phone: data.doctor.userId?.phone || "",
          specialization: data.doctor.specialization || "",
          department: data.doctor.department || "",
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch(`/api/doctors/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Doctor profile updated successfully!" });
        setDoctor(data.doctor);
      } else {
        throw new Error(data.error || "Failed to update doctor");
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this doctor account?")) {
      return;
    }

    try {
      const res = await fetch(`/api/doctors/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/doctors");
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
        <div className="p-8 text-center text-slate-500">Loading doctor profile...</div>
      </DashboardLayout>
    );
  }

  if (!doctor) {
    return (
      <DashboardLayout user={currentUser}>
        <div className="p-8 text-center text-slate-500">Doctor profile not found.</div>
      </DashboardLayout>
    );
  }

  const isEditable = currentUser?.role === "admin" || (currentUser?.role === "doctor" && doctor.userId?._id === currentUser?._id);

  return (
    <DashboardLayout user={currentUser}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/doctors"
              className="text-xs font-semibold text-primary hover:underline mb-1 inline-block"
            >
              ← Back to Doctor Directory
            </Link>
            <h1 className="text-2xl font-bold text-navy">
              Dr. {doctor.userId?.name}
            </h1>
            <p className="text-sm text-slate-500">
              {doctor.specialization} — {doctor.department}
            </p>
          </div>

          {currentUser?.role === "admin" && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-50 text-danger border border-red-200 text-sm font-semibold rounded-btn hover:bg-red-100 transition"
            >
              Delete Doctor Account
            </button>
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
              Doctor Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  disabled={!isEditable}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Specialization
                </label>
                <input
                  type="text"
                  disabled={!isEditable}
                  value={formData.specialization}
                  onChange={(e) =>
                    setFormData({ ...formData, specialization: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  disabled={!isEditable}
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  disabled={!isEditable}
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-slate-50"
                />
              </div>
            </div>

            <div className="pt-2">
              <h3 className="text-xs font-semibold text-slate-600 mb-1">
                Schedule Availability
              </h3>
              <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-btn border border-border">
                {doctor.availability?.days?.join(", ") || "Monday - Friday"} (09:00 AM - 05:00 PM)
              </p>
            </div>
          </div>

          {isEditable && (
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-btn hover:bg-blue-700 disabled:opacity-50 transition shadow-xs"
              >
                {saving ? "Saving Changes..." : "Save Doctor Changes"}
              </button>
            </div>
          )}
        </form>
      </div>
    </DashboardLayout>
  );
}
