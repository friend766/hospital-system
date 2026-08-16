import { NextResponse } from "next/server";

function decodeJwtPayload(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // Define public routes that don't require authentication
  const isPublicRoute =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/test-db") ||
    pathname.startsWith("/_next") ||
    pathname.includes("favicon.ico");

  if (isPublicRoute) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  const decoded = decodeJwtPayload(token);
  if (!decoded || !decoded.role) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  const userRole = decoded.role;

  // Strict role check for dashboard homepages
  if (pathname.startsWith("/admin") && userRole !== "admin") {
    return NextResponse.redirect(new URL(`/${userRole}/dashboard`, req.url));
  }
  if (pathname.startsWith("/doctor") && userRole !== "doctor" && userRole !== "admin") {
    return NextResponse.redirect(new URL(`/${userRole}/dashboard`, req.url));
  }
  if (pathname.startsWith("/receptionist") && userRole !== "receptionist" && userRole !== "admin") {
    return NextResponse.redirect(new URL(`/${userRole}/dashboard`, req.url));
  }
  if (pathname.startsWith("/patient") && userRole !== "patient" && userRole !== "admin" && userRole !== "doctor" && userRole !== "receptionist") {
    return NextResponse.redirect(new URL(`/${userRole}/dashboard`, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
