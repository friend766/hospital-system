"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

export default function Topbar({ user, onMenuToggle }) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800";
      case "doctor":
        return "bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800";
      case "receptionist":
        return "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800";
      case "pharmacist":
        return "bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-200 border-teal-200 dark:border-teal-800";
      case "patient":
        return "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700";
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-[#0F172A] border-b border-border dark:border-slate-800 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs transition-colors duration-300">
      <div className="flex items-center space-x-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-btn text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
          aria-label="Toggle Navigation"
        >
          ☰
        </button>
        <h2 className="text-base font-bold text-navy dark:text-white hidden sm:block">
          Hospital & Pharmacy System
        </h2>
      </div>

      <div className="flex items-center space-x-3">
        {/* Dark Mode / Light Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 px-3 rounded-btn bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-1.5 border border-border dark:border-slate-700 shadow-xs"
          title="Toggle Light / Dark Mode"
        >
          {theme === "light" ? (
            <>
              <span>🌙</span>
              <span className="hidden sm:inline">Dark</span>
            </>
          ) : (
            <>
              <span>☀️</span>
              <span className="hidden sm:inline">Light</span>
            </>
          )}
        </button>

        {user ? (
          <div className="flex items-center space-x-3">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${getRoleBadgeColor(
                user.role
              )}`}
            >
              {user.role}
            </span>

            <Link
              href="/profile"
              className="flex items-center space-x-2 text-sm font-medium text-navy dark:text-white hover:text-primary transition"
            >
              <div className="w-8 h-8 rounded-full bg-lightBlue dark:bg-blue-950 text-primary dark:text-blue-300 flex items-center justify-center font-bold border border-blue-200 dark:border-blue-800">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <span className="hidden md:inline">{user.name}</span>
            </Link>

            <button
              onClick={handleLogout}
              className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-danger px-2.5 py-1.5 rounded-btn hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="text-sm font-medium text-primary hover:underline"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
