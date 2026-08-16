export const ROLE_PERMISSIONS = {
  admin: ["admin", "doctor", "receptionist", "patient", "pharmacist"],
  doctor: ["doctor", "patient"],
  receptionist: ["receptionist", "patient", "doctor"],
  patient: ["patient"],
  pharmacist: ["pharmacist"],
};

export function hasRolePermission(userRole, requiredRole) {
  if (!userRole) return false;
  if (userRole === "admin") return true; // Admin has oversight access
  if (userRole === requiredRole) return true;

  const allowed = ROLE_PERMISSIONS[userRole] || [];
  return allowed.includes(requiredRole);
}

export function isRouteAllowed(path, userRole) {
  if (!userRole) return false;
  if (userRole === "admin") return true;

  if (path.startsWith("/admin") && userRole !== "admin") return false;
  if (path.startsWith("/doctor") && userRole !== "doctor") return false;
  if (path.startsWith("/receptionist") && userRole !== "receptionist") return false;

  return true;
}
