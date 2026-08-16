"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
  });

  const [extraData, setExtraData] = useState({
    dateOfBirth: "",
    gender: "",
    address: "",
    emergencyContact: { name: "", phone: "", relationship: "" },
    specialization: "",
    department: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/user/profile");
      const data = await res.json();

      if (res.ok && data.user) {
        setUserData({
          name: data.user.name || "",
          email: data.user.email || "",
          phone: data.user.phone || "",
          role: data.user.role || "",
        });

        if (data.extraProfile) {
          setExtraData({
            dateOfBirth: data.extraProfile.dateOfBirth || "",
            gender: data.extraProfile.gender || "",
            address: data.extraProfile.address || "",
            emergencyContact: data.extraProfile.emergencyContact || {
              name: "",
              phone: "",
              relationship: "",
            },
            specialization: data.extraProfile.specialization || "",
            department: data.extraProfile.department || "",
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const payload = {
        name: userData.name,
        phone: userData.phone,
        ...extraData,
      };

      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Profile saved successfully!" });
      } else {
        throw new Error(data.error || "Failed to update profile");
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout user={userData}>
        <div className="p-8 text-center text-slate-500">
          Loading profile...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={userData}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-navy">User Profile</h1>
          <p className="text-sm text-slate-500">
            View and manage your account information
          </p>
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Account Information Card */}
          <div className="bg-white p-6 rounded-card border border-border shadow-xs space-y-4">
            <h2 className="text-base font-bold text-navy border-b border-border pb-3">
              Account Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={userData.name}
                  onChange={(e) =>
                    setUserData({ ...userData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Email Address (Read-only)
                </label>
                <input
                  type="email"
                  disabled
                  value={userData.email}
                  className="w-full px-3 py-2 border border-border rounded-btn text-sm bg-slate-100 text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={userData.phone}
                  onChange={(e) =>
                    setUserData({ ...userData, phone: e.target.value })
                  }
                  placeholder="+1 234 567 890"
                  className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Account Role
                </label>
                <input
                  type="text"
                  disabled
                  value={userData.role.toUpperCase()}
                  className="w-full px-3 py-2 border border-border rounded-btn text-sm bg-slate-100 font-semibold text-slate-700 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Role-Specific Fields */}
          {userData.role === "patient" && (
            <div className="bg-white p-6 rounded-card border border-border shadow-xs space-y-4">
              <h2 className="text-base font-bold text-navy border-b border-border pb-3">
                Patient Medical Info
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={extraData.dateOfBirth}
                    onChange={(e) =>
                      setExtraData({ ...extraData, dateOfBirth: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Gender
                  </label>
                  <select
                    value={extraData.gender}
                    onChange={(e) =>
                      setExtraData({ ...extraData, gender: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
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
                    value={extraData.address}
                    onChange={(e) =>
                      setExtraData({ ...extraData, address: e.target.value })
                    }
                    placeholder="123 Street Name, City, Country"
                    className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <h3 className="text-sm font-bold text-navy pt-2">
                Emergency Contact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={extraData.emergencyContact?.name || ""}
                    onChange={(e) =>
                      setExtraData({
                        ...extraData,
                        emergencyContact: {
                          ...extraData.emergencyContact,
                          name: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={extraData.emergencyContact?.phone || ""}
                    onChange={(e) =>
                      setExtraData({
                        ...extraData,
                        emergencyContact: {
                          ...extraData.emergencyContact,
                          phone: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Relationship
                  </label>
                  <input
                    type="text"
                    value={extraData.emergencyContact?.relationship || ""}
                    onChange={(e) =>
                      setExtraData({
                        ...extraData,
                        emergencyContact: {
                          ...extraData.emergencyContact,
                          relationship: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. Spouse, Parent"
                    className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {userData.role === "doctor" && (
            <div className="bg-white p-6 rounded-card border border-border shadow-xs space-y-4">
              <h2 className="text-base font-bold text-navy border-b border-border pb-3">
                Doctor Professional Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Specialization
                  </label>
                  <input
                    type="text"
                    value={extraData.specialization}
                    onChange={(e) =>
                      setExtraData({ ...extraData, specialization: e.target.value })
                    }
                    placeholder="e.g. Cardiology"
                    className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={extraData.department}
                    onChange={(e) =>
                      setExtraData({ ...extraData, department: e.target.value })
                    }
                    placeholder="e.g. Outpatient Cardiology"
                    className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-btn hover:bg-blue-700 disabled:opacity-50 transition shadow-sm"
            >
              {saving ? "Saving Changes..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
