import connectToDatabase from "@/lib/mongodb";
import Prescription from "@/models/Prescription";
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
    const status = searchParams.get("status") || "";

    let query = {};

    // Multi-Tenant Isolation
    if (session.role !== "superadmin" && session.organizationId) {
      query.organizationId = session.organizationId;
    }

    if (status) query.status = status;

    if (session.role === "patient") {
      const patient = await Patient.findOne({ userId: session.userId });
      if (patient) query.patientId = patient._id;
      else return NextResponse.json({ prescriptions: [] });
    } else if (session.role === "doctor") {
      const doctor = await Doctor.findOne({ userId: session.userId });
      if (doctor) query.doctorId = doctor._id;
      else return NextResponse.json({ prescriptions: [] });
    }

    const prescriptions = await Prescription.find(query)
      .populate({
        path: "patientId",
        populate: { path: "userId", select: "name email phone" },
      })
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "name email phone" },
      })
      .populate("medicalRecordId", "visitDate diagnosis")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ prescriptions });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getSessionUser(req);
    if (!session || (session.role !== "doctor" && session.role !== "admin" && session.role !== "superadmin")) {
      return NextResponse.json(
        { error: "Forbidden. Only doctors can issue prescriptions." },
        { status: 403 }
      );
    }

    const body = await req.json();
    let { patientId, doctorId, medicalRecordId = null, medicines = [], notes = "" } = body;

    await connectToDatabase();

    if (session.role === "doctor" && !doctorId) {
      const doctor = await Doctor.findOne({ userId: session.userId });
      if (doctor) doctorId = doctor._id;
    }

    if (!patientId || !doctorId || medicines.length === 0) {
      return NextResponse.json(
        { error: "Patient, Doctor, and at least one medicine are required" },
        { status: 400 }
      );
    }

    const orgId = session.organizationId || null;

    const newPrescription = await Prescription.create({
      organizationId: orgId,
      patientId,
      doctorId,
      medicalRecordId: medicalRecordId || null,
      medicines,
      notes,
      status: "pending",
    });

    const populated = await Prescription.findById(newPrescription._id)
      .populate({
        path: "patientId",
        populate: { path: "userId", select: "name email" },
      })
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "name email" },
      });

    return NextResponse.json(
      { message: "Prescription issued successfully", prescription: populated },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
