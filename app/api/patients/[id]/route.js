import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Patient from "@/models/Patient";
import Doctor from "@/models/Doctor";
import Appointment from "@/models/Appointment";
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

    let patient = await Patient.findById(id).populate("userId", "name email phone profileImage createdAt");
    if (!patient) {
      patient = await Patient.findOne({ userId: id }).populate("userId", "name email phone profileImage createdAt");
    }

    if (!patient) {
      return NextResponse.json({ error: "Patient record not found" }, { status: 404 });
    }

    // Role check: If Doctor, confirm doctor has an appointment with this patient
    if (session.role === "doctor") {
      const doctor = await Doctor.findOne({ userId: session.userId });
      if (!doctor) {
        return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });
      }
      const hasAppointment = await Appointment.exists({ doctorId: doctor._id, patientId: patient._id });
      if (!hasAppointment) {
        return NextResponse.json(
          { error: "Forbidden. You can only view details of patients appointed to you." },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ patient });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role === "doctor") {
      return NextResponse.json(
        { error: "Forbidden. Doctors can only view patient details, not modify them." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { name, phone, dateOfBirth, gender, address, emergencyContact } = body;

    await connectToDatabase();

    let patient = await Patient.findById(id);
    if (!patient) {
      patient = await Patient.findOne({ userId: id });
    }

    if (!patient) {
      return NextResponse.json({ error: "Patient record not found" }, { status: 404 });
    }

    // Role check: Admin, Receptionist, or Patient self
    const isSelf = patient.userId.toString() === session.userId;
    const isStaff = session.role === "admin" || session.role === "receptionist";
    if (!isSelf && !isStaff) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (name || phone !== undefined) {
      await User.findByIdAndUpdate(patient.userId, {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
      });
    }

    const updatedPatient = await Patient.findByIdAndUpdate(
      patient._id,
      {
        ...(dateOfBirth !== undefined && { dateOfBirth }),
        ...(gender !== undefined && { gender }),
        ...(address !== undefined && { address }),
        ...(emergencyContact !== undefined && { emergencyContact }),
      },
      { new: true }
    ).populate("userId", "name email phone createdAt");

    return NextResponse.json({
      message: "Patient updated successfully",
      patient: updatedPatient,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getSessionUser(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden. Admin access required to delete patients." },
        { status: 403 }
      );
    }

    const { id } = await params;
    await connectToDatabase();

    const patient = await Patient.findByIdAndDelete(id);
    if (patient) {
      await User.findByIdAndDelete(patient.userId);
    }

    return NextResponse.json({ message: "Patient deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
