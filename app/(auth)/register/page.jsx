"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

export default function RegisterPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [organizations, setOrganizations] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "patient",
    organizationId: "",
    specialization: "General Practice",
    department: "Outpatient Department",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchOrgs() {
      try {
        const res = await fetch("/api/organizations");
        const contentType = res.headers.get("content-type");
        if (res.ok && contentType && contentType.includes("application/json")) {
          const data = await res.json();
          if (data.organizations && data.organizations.length > 0) {
            setOrganizations(data.organizations);
            setFormData((prev) => ({
              ...prev,
              organizationId: prev.organizationId || data.organizations[0]._id,
            }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch organizations:", err);
      }
    }
    fetchOrgs();
  }, []);

  const roles = [
    { id: "patient", label: "Patient", icon: "❤️", desc: "Book appointments & view history" },
    { id: "doctor", label: "Doctor", icon: "🩺", desc: "Consultations & clinical records" },
    { id: "receptionist", label: "Receptionist", icon: "🛎️", desc: "Front desk & patient registration" },
    { id: "pharmacist", label: "Pharmacist", icon: "💊", desc: "Inventory & medicine dispensing" },
    { id: "admin", label: "Admin", icon: "👑", desc: "Full hospital management" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    let field = name;
    if (name === "reg_user_fullname") field = "name";
    else if (name === "reg_user_email") field = "email";
    else if (name === "reg_user_password") field = "password";
    else if (name === "reg_user_phone") field = "phone";

    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const contentType = res.headers.get("content-type");
      let data = {};
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      }

      if (!res.ok) {
        throw new Error(data.error || "Registration failed. Please try again.");
      }

      // Auto login after successful registration
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (loginRes.ok) {
        const loginData = await loginRes.json();
        const role = loginData.user?.role;
        if (role === "admin") router.push("/admin/dashboard");
        else if (role === "doctor") router.push("/doctor/dashboard");
        else if (role === "receptionist") router.push("/receptionist/dashboard");
        else if (role === "pharmacist") router.push("/pharmacist/dashboard");
        else router.push("/patient/dashboard");
      } else {
        router.push("/login");
      }

      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-[#0F172A] dark:text-[#F8FAFC] flex flex-col justify-center relative overflow-hidden transition-colors duration-300 py-8">
      {/* Background Medical Pattern Overlay */}
      <div className="absolute inset-0 opacity-15 dark:opacity-20 bg-[url('/medical-bg.jpg')] bg-repeat bg-[length:650px_auto] pointer-events-none" />

      {/* Top Bar Controls */}
      <div className="absolute top-6 right-6 z-20 flex items-center space-x-3">
        <button
          onClick={toggleTheme}
          className="p-2 px-3.5 rounded-btn bg-white dark:bg-[#1E293B] border border-border dark:border-[#334155] text-xs font-bold text-navy dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm flex items-center gap-2"
        >
          {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </button>
      </div>

      <div className="max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="bg-white dark:bg-[#1E293B] border border-border dark:border-[#334155] rounded-2xl shadow-xl overflow-hidden p-6 sm:p-10 space-y-6">
          
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-9 h-9 bg-primary text-white rounded-xl flex items-center justify-center font-black text-lg shadow-sm">
                H
              </div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Hospital HMS Registration</span>
            </div>
            <h1 className="text-2xl font-black text-navy dark:text-white tracking-tight">
              Create New System Account ✨
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
              Select your hospital workspace and account role
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-danger dark:text-red-300 text-xs font-bold rounded-btn flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
            {/* Hidden dummy trap inputs to stop browser password manager auto-fill */}
            <input type="text" name="fake_email_trap" style={{ display: "none" }} tabIndex={-1} aria-hidden="true" />
            <input type="password" name="fake_password_trap" style={{ display: "none" }} tabIndex={-1} aria-hidden="true" />

            {/* Hospital Organization Tenant Selector */}
            <div className="space-y-1.5 p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
              <label className="block text-xs font-bold text-navy dark:text-blue-300">
                🏢 Select Hospital / Clinic Workspace *
              </label>
              <select
                name="organizationId"
                value={formData.organizationId}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 border border-blue-300 dark:border-blue-700 rounded-btn bg-white dark:bg-[#0F172A] text-navy dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {organizations.length > 0 ? (
                  organizations.map((org) => (
                    <option key={org._id} value={org._id}>
                      🏥 {org.name} ({(org.plan || "starter").toUpperCase()} Plan)
                    </option>
                  ))
                ) : (
                  <option value="">🏥 Central City Hospital (Default)</option>
                )}
              </select>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Your account will be securely isolated under your selected hospital workspace.
              </p>
            </div>

            {/* Interactive Role Selector Cards */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-navy dark:text-slate-200">
                Choose Account Role *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {roles.map((r) => {
                  const isSelected = formData.role === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: r.id })}
                      className={`p-3 rounded-card text-left transition border ${
                        isSelected
                          ? "bg-primary text-white border-primary shadow-md ring-2 ring-blue-400/40"
                          : "bg-slate-50 dark:bg-[#0F172A] border-border dark:border-[#334155] text-navy dark:text-slate-200 hover:border-primary"
                      }`}
                    >
                      <div className="text-xl mb-1">{r.icon}</div>
                      <div className="font-bold text-xs">{r.label}</div>
                      <div className={`text-[10px] line-clamp-1 mt-0.5 ${isSelected ? "text-blue-100" : "text-slate-400"}`}>
                        {r.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy dark:text-slate-200 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="reg_user_fullname"
                  required
                  autoComplete="off"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Dr. Sarah Ahmed"
                  className="w-full px-3.5 py-2.5 border border-border dark:border-[#334155] rounded-btn bg-white dark:bg-[#0F172A] text-navy dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy dark:text-slate-200 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="reg_user_email"
                  required
                  autoComplete="new-password"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 border border-border dark:border-[#334155] rounded-btn bg-white dark:bg-[#0F172A] text-navy dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy dark:text-slate-200 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="reg_user_phone"
                  autoComplete="off"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+92 300 1234567"
                  className="w-full px-3.5 py-2.5 border border-border dark:border-[#334155] rounded-btn bg-white dark:bg-[#0F172A] text-navy dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-navy dark:text-slate-200">
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] font-semibold text-primary hover:underline"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="reg_user_password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 border border-border dark:border-[#334155] rounded-btn bg-white dark:bg-[#0F172A] text-navy dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {formData.role === "doctor" && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-navy dark:text-slate-200 mb-1">
                      Specialization
                    </label>
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      placeholder="e.g. Cardiology"
                      className="w-full px-3.5 py-2.5 border border-border dark:border-[#334155] rounded-btn bg-white dark:bg-[#0F172A] text-navy dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-navy dark:text-slate-200 mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="e.g. Outpatient Cardiology"
                      className="w-full px-3.5 py-2.5 border border-border dark:border-[#334155] rounded-btn bg-white dark:bg-[#0F172A] text-navy dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-btn text-xs font-bold text-white bg-primary hover:bg-blue-700 disabled:opacity-50 transition shadow-md cursor-pointer"
            >
              {loading ? "Creating Account..." : "Create Account & Sign In →"}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 dark:text-slate-400 font-medium pt-2">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-primary hover:underline"
            >
              Sign In Here
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
