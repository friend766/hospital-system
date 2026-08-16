import connectToDatabase from "@/lib/mongodb";
import Billing from "@/models/Billing";
import { getSessionUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const invoice = await Billing.findById(id).populate({
      path: "patientId",
      populate: { path: "userId", select: "name email phone address" },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await getSessionUser(req);
    if (!session || (session.role !== "pharmacist" && session.role !== "receptionist" && session.role !== "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status, paymentMethod } = body;

    await connectToDatabase();

    const invoice = await Billing.findById(id);
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (status === "paid" && invoice.status !== "paid") {
      invoice.paidAt = new Date();
    }

    if (status) invoice.status = status;
    if (paymentMethod) invoice.paymentMethod = paymentMethod;

    await invoice.save();

    const updated = await Billing.findById(id).populate({
      path: "patientId",
      populate: { path: "userId", select: "name email" },
    });

    return NextResponse.json({
      message: "Invoice updated successfully",
      invoice: updated,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
