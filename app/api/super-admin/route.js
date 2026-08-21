import connectToDatabase from "@/lib/mongodb";
import Organization from "@/models/Organization";
import User from "@/models/User";
import Patient from "@/models/Patient";
import Doctor from "@/models/Doctor";
import Medicine from "@/models/Medicine";
import Billing from "@/models/Billing";
import Appointment from "@/models/Appointment";
import MedicalRecord from "@/models/MedicalRecord";
import Prescription from "@/models/Prescription";
import { getSessionUser } from "@/lib/auth";
import { NextResponse } from "next/server";

// GET Platform Analytics & Organizations List
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

// PUT Update Hospital Tenant Plan, Status, or Staff Limits
export async function PUT(req) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "superadmin") {
      return NextResponse.json({ error: "Access denied. Super-Admin required." }, { status: 403 });
    }

    const { organizationId, plan, subscriptionStatus, maxDoctors, maxPatients } = await req.json();

    if (!organizationId) {
      return NextResponse.json({ error: "Organization ID is required" }, { status: 400 });
    }

    await connectToDatabase();

    const updateFields = {};
    if (plan) updateFields.plan = plan;
    if (subscriptionStatus) updateFields.subscriptionStatus = subscriptionStatus;
    if (maxDoctors !== undefined) updateFields.maxDoctors = maxDoctors;
    if (maxPatients !== undefined) updateFields.maxPatients = maxPatients;

    const updatedOrg = await Organization.findByIdAndUpdate(
      organizationId,
      updateFields,
      { new: true }
    );

    return NextResponse.json({
      message: "Hospital Tenant updated successfully",
      organization: updatedOrg,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to update organization" }, { status: 500 });
  }
}

// DELETE Purge Hospital Tenant & Associated Records
export async function DELETE(req) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "superadmin") {
      return NextResponse.json({ error: "Access denied. Super-Admin required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json({ error: "Organization ID is required" }, { status: 400 });
    }

    await connectToDatabase();

    // Delete organization and all tenant scoped documents
    await Promise.all([
      Organization.findByIdAndDelete(organizationId),
      User.deleteMany({ organizationId }),
      Patient.deleteMany({ organizationId }),
      Doctor.deleteMany({ organizationId }),
      Medicine.deleteMany({ organizationId }),
      Billing.deleteMany({ organizationId }),
      Appointment.deleteMany({ organizationId }),
      MedicalRecord.deleteMany({ organizationId }),
      Prescription.deleteMany({ organizationId }),
    ]);

    return NextResponse.json({ message: "Hospital Tenant purged successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to delete organization" }, { status: 500 });
  }
}
