import connectToDatabase from "@/lib/mongodb";
import MedicalRecord from "@/models/MedicalRecord";
import { getSessionUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const record = await MedicalRecord.findById(id)
      .populate({
        path: "patientId",
        populate: { path: "userId", select: "name email phone" },
      })
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "name email phone" },
      })
      .populate("appointmentId", "date time reason");

    if (!record) {
      return NextResponse.json({ error: "Medical record not found" }, { status: 404 });
    }

    return NextResponse.json({ record });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await getSessionUser(req);
    if (!session || (session.role !== "doctor" && session.role !== "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { diagnosis, treatment, notes, visitDate } = body;

    await connectToDatabase();

    const updated = await MedicalRecord.findByIdAndUpdate(
      id,
      {
        ...(diagnosis !== undefined && { diagnosis }),
        ...(treatment !== undefined && { treatment }),
        ...(notes !== undefined && { notes }),
        ...(visitDate !== undefined && { visitDate }),
      },
      { new: true }
    )
      .populate({
        path: "patientId",
        populate: { path: "userId", select: "name email" },
      })
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "name email" },
      });

    return NextResponse.json({
      message: "Medical record updated successfully",
      record: updated,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
