import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export default async function Home() {
  const session = await getSessionUser();

  if (session && session.role) {
    if (session.role === "admin") redirect("/admin/dashboard");
    if (session.role === "doctor") redirect("/doctor/dashboard");
    if (session.role === "receptionist") redirect("/receptionist/dashboard");
    if (session.role === "patient") redirect("/patient/dashboard");
  }

  redirect("/login");
}
