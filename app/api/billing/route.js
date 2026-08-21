import connectToDatabase from "@/lib/mongodb";
import Billing from "@/models/Billing";
import Patient from "@/models/Patient";
import { getSessionUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";

    let query = {};

    // Multi-Tenant Scoping
    if (session.role !== "superadmin" && session.organizationId) {
      query.organizationId = session.organizationId;
    }

    if (status) query.status = status;

    if (session.role === "patient") {
      const patient = await Patient.findOne({ userId: session.userId });
      if (patient) query.patientId = patient._id;
      else return NextResponse.json({ invoices: [] });
    }

    const invoices = await Billing.find(query)
      .populate({
        path: "patientId",
        populate: { path: "userId", select: "name email phone" },
      })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ invoices });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getSessionUser(req);
    if (!session || (session.role !== "pharmacist" && session.role !== "receptionist" && session.role !== "admin" && session.role !== "superadmin")) {
      return NextResponse.json(
        { error: "Forbidden. Pharmacist, Receptionist, or Admin role required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    let { patientId, appointmentId = null, prescriptionId = null, items = [], paymentMethod = "Pending" } = body;

    if (!patientId || items.length === 0) {
      return NextResponse.json(
        { error: "Patient and at least one billable item are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const totalAmount = items.reduce((acc, curr) => acc + Number(curr.amount) * Number(curr.quantity || 1), 0);
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    const orgId = session.organizationId || null;

    const newInvoice = await Billing.create({
      organizationId: orgId,
      patientId,
      appointmentId: appointmentId || null,
      prescriptionId: prescriptionId || null,
      invoiceNumber,
      items,
      totalAmount,
      status: "unpaid",
      paymentMethod,
    });

    const populated = await Billing.findById(newInvoice._id).populate({
      path: "patientId",
      populate: { path: "userId", select: "name email" },
    });

    return NextResponse.json(
      { message: "Invoice generated successfully", invoice: populated },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
