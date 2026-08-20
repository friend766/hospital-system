import connectToDatabase from "@/lib/mongodb";
import Organization from "@/models/Organization";
import User from "@/models/User";
import Patient from "@/models/Patient";
import Doctor from "@/models/Doctor";
import Medicine from "@/models/Medicine";
import Billing from "@/models/Billing";
import { getSessionUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "superadmin") {
      return NextResponse.json({ error: "Access denied. Super-Admin required." }, { status: 403 });
    }

    await connectToDatabase();

    const [organizations, totalUsers, totalPatients, totalDoctors, totalMedicines, billings] = await Promise.all([
      Organization.find().sort({ createdAt: -1 }),
      User.countDocuments(),
      Patient.countDocuments(),
      Doctor.countDocuments(),
      Medicine.countDocuments(),
      Billing.find({ status: "paid" }),
    ]);

    const totalRevenue = billings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    return NextResponse.json({
      organizations,
      metrics: {
        totalOrganizations: organizations.length,
        totalUsers,
        totalPatients,
        totalDoctors,
        totalMedicines,
        totalRevenue,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to fetch super-admin data" }, { status: 500 });
  }
}
