import connectToDatabase from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
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
    const date = searchParams.get("date") || "";

    let query = {};

    // Multi-Tenant Isolation
    if (session.role !== "superadmin" && session.organizationId) {
      query.organizationId = session.organizationId;
    }

    if (status) {
      query.status = status;
    }
    if (date) {
      query.date = date;
    }

    // Role-based scoping
    if (session.role === "patient") {
      const patient = await Patient.findOne({ userId: session.userId });
      if (patient) {
        query.patientId = patient._id;
      } else {
        return NextResponse.json({ appointments: [] });
      }
    } else if (session.role === "doctor") {
      const doctor = await Doctor.findOne({ userId: session.userId });
      if (doctor) {
        query.doctorId = doctor._id;
      } else {
        return NextResponse.json({ appointments: [] });
      }
    }

    const appointments = await Appointment.find(query)
      .populate({
        path: "patientId",
        populate: { path: "userId", select: "name email phone" },
      })
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "name email phone" },
      })
      .populate("createdBy", "name role")
      .sort({ date: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({ appointments });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role === "doctor") {
      return NextResponse.json(
        { error: "Forbidden. Doctors cannot book appointments." },
        { status: 403 }
      );
    }

    const body = await req.json();
    let { patientId, doctorId, date, time, reason = "" } = body;

    await connectToDatabase();

    // If patient is booking for themselves
    if (session.role === "patient" || !patientId) {
      const patient = await Patient.findOne({ userId: session.userId });
      if (!patient) {
        return NextResponse.json(
          { error: "Patient profile not found for logged in user" },
          { status: 404 }
        );
      }
      patientId = patient._id;
    }

    if (!doctorId || !date || !time) {
      return NextResponse.json(
        { error: "Doctor, date, and time are required" },
        { status: 400 }
      );
    }

    const orgId = session.organizationId || null;

    const newAppointment = await Appointment.create({
      organizationId: orgId,
      patientId,
      doctorId,
      date,
      time,
      reason,
      status: "pending",
      createdBy: session.userId,
    });

    const populated = await Appointment.findById(newAppointment._id)
      .populate({
        path: "patientId",
        populate: { path: "userId", select: "name email" },
      })
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "name email" },
      });

    return NextResponse.json(
      { message: "Appointment booked successfully", appointment: populated },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
