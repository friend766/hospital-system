"use client";

import { useState, useEffect } from "react";

export default function NotificationBanner() {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // Listen for custom status change notifications
    const handleNotify = (e) => {
      setNotification(e.detail);
      setTimeout(() => setNotification(null), 4000);
    };

    window.addEventListener("app-notification", handleNotify);
    return () => window.removeEventListener("app-notification", handleNotify);
  }, []);

  if (!notification) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce">
      <div className="bg-navy text-white px-4 py-3 rounded-card shadow-lg border border-slate-700 flex items-center space-x-3 text-sm">
        <span className="text-lg">🔔</span>
        <div>
          <div className="font-bold">{notification.title || "Notification"}</div>
          <div className="text-xs text-slate-300">{notification.message}</div>
        </div>
        <button
          onClick={() => setNotification(null)}
          className="text-slate-400 hover:text-white text-xs ml-3"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export function notify(title, message) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("app-notification", { detail: { title, message } })
    );
  }
}
