"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar({ role, isOpen, onClose }) {
  const pathname = usePathname();

  const getNavLinks = (userRole) => {
    switch (userRole) {
      case "admin":
        return [
          { label: "Dashboard", href: "/admin/dashboard", icon: "📊" },
          { label: "Patients", href: "/patients", icon: "👥" },
          { label: "Doctors", href: "/doctors", icon: "👨‍⚕️" },
          { label: "Appointments", href: "/appointments", icon: "📅" },
          { label: "Medical Records", href: "/medical-records", icon: "📋" },
          { label: "Prescriptions", href: "/prescriptions", icon: "💊" },
          { label: "Medicine Inventory", href: "/medicines", icon: "📦" },
          { label: "Billing & Invoices", href: "/billing", icon: "🧾" },
          { label: "My Profile", href: "/profile", icon: "👤" },
        ];
      case "doctor":
        return [
          { label: "Dashboard", href: "/doctor/dashboard", icon: "📊" },
          { label: "Appointments", href: "/appointments", icon: "📅" },
          { label: "Patients", href: "/patients", icon: "👥" },
          { label: "Medical Records", href: "/medical-records", icon: "📋" },
          { label: "Prescriptions", href: "/prescriptions", icon: "💊" },
          { label: "My Profile", href: "/profile", icon: "👤" },
        ];
      case "receptionist":
        return [
          { label: "Dashboard", href: "/receptionist/dashboard", icon: "📊" },
          { label: "Register Patient", href: "/patients/new", icon: "➕" },
          { label: "Patient Directory", href: "/patients", icon: "👥" },
          { label: "Appointments", href: "/appointments", icon: "📅" },
          { label: "Doctors", href: "/doctors", icon: "👨‍⚕️" },
          { label: "Billing & Invoices", href: "/billing", icon: "🧾" },
          { label: "My Profile", href: "/profile", icon: "👤" },
        ];
      case "pharmacist":
        return [
          { label: "Dashboard", href: "/pharmacist/dashboard", icon: "📊" },
          { label: "Medicine Inventory", href: "/medicines", icon: "📦" },
          { label: "Prescriptions Queue", href: "/prescriptions", icon: "💊" },
          { label: "Billing & Invoices", href: "/billing", icon: "🧾" },
          { label: "My Profile", href: "/profile", icon: "👤" },
        ];
      case "patient":
        return [
          { label: "Dashboard", href: "/patient/dashboard", icon: "📊" },
          { label: "Book Appointment", href: "/appointments/new", icon: "➕" },
          { label: "My Appointments", href: "/appointments", icon: "📅" },
          { label: "Medical Records", href: "/medical-records", icon: "📋" },
          { label: "My Prescriptions", href: "/prescriptions", icon: "💊" },
          { label: "My Invoices", href: "/billing", icon: "🧾" },
          { label: "My Profile", href: "/profile", icon: "👤" },
        ];
      default:
        return [
          { label: "Dashboard", href: "/profile", icon: "📊" },
          { label: "My Profile", href: "/profile", icon: "👤" },
        ];
    }
  };

  const links = getNavLinks(role);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-navy text-white z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } flex flex-col justify-between`}
      >
        <div>
          {/* Logo & Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-primary text-white rounded-btn flex items-center justify-center font-bold text-lg">
                H
              </div>
              <div>
                <h1 className="font-bold text-sm leading-tight text-white">
                  Hospital & Pharmacy
                </h1>
                <p className="text-[11px] text-slate-400 capitalize">
                  {role} Portal
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              ✕
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={`flex items-center space-x-3 px-4 py-2.5 rounded-btn text-sm font-medium transition ${
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <span className="text-base">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-slate-300">Hospital HMS</span>
            <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded font-medium">
              v2.0 Active
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
