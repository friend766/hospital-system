import connectToDatabase from "@/lib/mongodb";
import MedicalRecord from "@/models/MedicalRecord";
import Patient from "@/models/Patient";
import Doctor from "@/models/Doctor";
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
    const patientId = searchParams.get("patientId");

    let query = {};

    // Multi-Tenant Isolation
    if (session.role !== "superadmin" && session.organizationId) {
      query.organizationId = session.organizationId;
    }

    if (patientId) {
      query.patientId = patientId;
    }

    // Role-based scoping
    if (session.role === "patient") {
      const patient = await Patient.findOne({ userId: session.userId });
      if (patient) {
        query.patientId = patient._id;
      } else {
        return NextResponse.json({ records: [] });
      }
    } else if (session.role === "doctor") {
      const doctor = await Doctor.findOne({ userId: session.userId });
      if (doctor && !patientId) {
        query.doctorId = doctor._id;
      }
    }

    const records = await MedicalRecord.find(query)
      .populate({
        path: "patientId",
        populate: { path: "userId", select: "name email phone" },
      })
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "name email" },
      })
      .populate("appointmentId", "date time reason")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ records });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getSessionUser(req);
    if (!session || (session.role !== "doctor" && session.role !== "admin" && session.role !== "superadmin")) {
      return NextResponse.json(
        { error: "Forbidden. Only doctors and admins can create medical records." },
        { status: 403 }
      );
    }

    const body = await req.json();
    let { patientId, doctorId, appointmentId = null, visitDate, notes = "", diagnosis = "", treatment = "" } = body;

    await connectToDatabase();

    if (session.role === "doctor" && !doctorId) {
      const doctor = await Doctor.findOne({ userId: session.userId });
      if (doctor) doctorId = doctor._id;
    }

    if (!patientId || !doctorId) {
      return NextResponse.json(
        { error: "Patient and doctor are required" },
        { status: 400 }
      );
    }

    const orgId = session.organizationId || null;

    const newRecord = await MedicalRecord.create({
      organizationId: orgId,
      patientId,
      doctorId,
      appointmentId: appointmentId || null,
      visitDate: visitDate || new Date().toISOString().split("T")[0],
      notes,
      diagnosis,
      treatment,
    });

    const populated = await MedicalRecord.findById(newRecord._id)
      .populate({
        path: "patientId",
        populate: { path: "userId", select: "name email" },
      })
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "name email" },
      });

    return NextResponse.json(
      { message: "Medical record created successfully", record: populated },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
