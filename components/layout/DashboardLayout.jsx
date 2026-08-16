"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import NotificationBanner from "../common/NotificationBanner";

export default function DashboardLayout({ user, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const role = user?.role || "patient";

  // Role-specific Wallpaper Image & Theme Config
  const getRoleTheme = (userRole) => {
    switch (userRole) {
      case "admin":
        return {
          title: "System Administrator Control Center",
          badge: "👑 Executive Admin Portal",
          bgImage: "/admin-bg.png",
          badgeStyle: "bg-purple-400 text-purple-950 font-black border border-purple-300 shadow-md",
          statusBorder: "border-purple-500/40 bg-purple-950/70 text-purple-200",
          textShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]",
          overlayGradient: "from-slate-950/85 via-navy/80 to-purple-950/70",
        };
      case "doctor":
        return {
          title: "Clinical Medical Practitioner Portal",
          badge: "🩺 Medical Specialist Portal",
          bgImage: "/doctor-bg.png",
          badgeStyle: "bg-teal-300 text-teal-950 font-black border border-teal-200 shadow-md",
          statusBorder: "border-teal-500/40 bg-teal-950/70 text-teal-200",
          textShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]",
          overlayGradient: "from-slate-950/85 via-teal-950/80 to-navy/70",
        };
      case "receptionist":
        return {
          title: "Hospital Front-Desk & Patient Care Desk",
          badge: "🛎️ Receptionist Concierge Desk",
          bgImage: "/receptionist-bg.png",
          badgeStyle: "bg-cyan-300 text-cyan-950 font-black border border-cyan-200 shadow-md",
          statusBorder: "border-cyan-500/40 bg-cyan-950/70 text-cyan-200",
          textShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]",
          overlayGradient: "from-slate-950/85 via-sky-950/80 to-navy/70",
        };
      case "pharmacist":
        return {
          title: "Pharmacy Counter & Dispensary Hub",
          badge: "💊 Apothecary & Dispensing Hub",
          bgImage: "/pharmacist-bg.png",
          badgeStyle: "bg-emerald-300 text-emerald-950 font-black border border-emerald-200 shadow-md",
          statusBorder: "border-emerald-500/40 bg-emerald-950/70 text-emerald-200",
          textShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]",
          overlayGradient: "from-slate-950/85 via-emerald-950/80 to-navy/70",
        };
      case "patient":
      default:
        return {
          title: "Patient Personal Health & Consultation Hub",
          badge: "❤️ Patient Care Portal",
          bgImage: "/patient-bg.png",
          badgeStyle: "bg-blue-300 text-blue-950 font-black border border-blue-200 shadow-md",
          statusBorder: "border-blue-500/40 bg-blue-950/70 text-blue-200",
          textShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]",
          overlayGradient: "from-slate-950/85 via-blue-950/80 to-navy/70",
        };
    }
  };

  const theme = getRoleTheme(role);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-[#0F172A] dark:text-[#F8FAFC] flex flex-col relative overflow-x-hidden transition-colors duration-300">
      <Sidebar
        role={role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64 flex flex-col flex-1">
        <Topbar
          user={user}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* User-Uploaded Custom Role Background Wallpaper Banner */}
        <div
          className="w-full relative overflow-hidden py-10 px-4 lg:px-8 shadow-lg border-b border-slate-800 bg-cover bg-center transition-all duration-500"
          style={{ backgroundImage: `url('${theme.bgImage}')` }}
        >
          {/* Gradient Overlay for Text Readability & Ambiance */}
          <div className={`absolute inset-0 bg-gradient-to-r ${theme.overlayGradient} backdrop-blur-[2px]`} />

          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className={`inline-block px-3 py-1 rounded-full text-xs uppercase tracking-wider ${theme.badgeStyle}`}>
                  {theme.badge}
                </span>
              </div>
              <h2 className={`text-2xl lg:text-3xl font-black text-white tracking-tight ${theme.textShadow}`}>
                Welcome back, {user?.name || "User"}!
              </h2>
              <p className={`text-xs lg:text-sm text-slate-200 font-medium ${theme.textShadow}`}>
                {theme.title} • Logged in as <span className="font-bold text-white capitalize underline decoration-2">{role}</span>
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <div className={`p-3.5 rounded-card ${theme.statusBorder} backdrop-blur-md border shadow-lg text-xs space-y-0.5`}>
                <div className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">System Status</div>
                <div className="font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse ring-4 ring-emerald-400/30"></span>
                  Active & Connected
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content Container */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

      <NotificationBanner />
    </div>
  );
}
