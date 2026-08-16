import connectToDatabase from "@/lib/mongodb";
import Prescription from "@/models/Prescription";
import Medicine from "@/models/Medicine";
import { getSessionUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const prescription = await Prescription.findById(id)
      .populate({
        path: "patientId",
        populate: { path: "userId", select: "name email phone" },
      })
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "name email phone" },
      })
      .populate("medicalRecordId", "visitDate diagnosis");

    if (!prescription) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
    }

    return NextResponse.json({ prescription });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await getSessionUser(req);
    if (!session || (session.role !== "pharmacist" && session.role !== "admin")) {
      return NextResponse.json(
        { error: "Forbidden. Pharmacist access required to dispense." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    await connectToDatabase();

    const prescription = await Prescription.findById(id);
    if (!prescription) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
    }

    // If status is changed to dispensed, decrement medicine stock
    if (status === "dispensed" && prescription.status !== "dispensed") {
      for (const item of prescription.medicines) {
        if (item.medicineId) {
          await Medicine.findByIdAndUpdate(item.medicineId, {
            $inc: { stockQuantity: -Math.abs(item.quantity) },
          });
        }
      }
      prescription.dispensedAt = new Date();
    }

    if (status) prescription.status = status;
    await prescription.save();

    const updated = await Prescription.findById(id)
      .populate({
        path: "patientId",
        populate: { path: "userId", select: "name email" },
      })
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "name email" },
      });

    return NextResponse.json({
      message: `Prescription ${status} successfully`,
      prescription: updated,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
