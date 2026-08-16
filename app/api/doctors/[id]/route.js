import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Doctor from "@/models/Doctor";
import { getSessionUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    await connectToDatabase();

    let doctor = await Doctor.findById(id).populate("userId", "name email phone profileImage createdAt");
    if (!doctor) {
      doctor = await Doctor.findOne({ userId: id }).populate("userId", "name email phone profileImage createdAt");
    }

    if (!doctor) {
      return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });
    }

    return NextResponse.json({ doctor });
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

    const { id } = await params;
    const body = await req.json();
    const { name, phone, specialization, department, availability } = body;

    await connectToDatabase();

    let doctor = await Doctor.findById(id);
    if (!doctor) {
      doctor = await Doctor.findOne({ userId: id });
    }

    if (!doctor) {
      return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });
    }

    const isSelf = doctor.userId.toString() === session.userId;
    const isAdmin = session.role === "admin";
    if (!isSelf && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (name || phone !== undefined) {
      await User.findByIdAndUpdate(doctor.userId, {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
      });
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      doctor._id,
      {
        ...(specialization !== undefined && { specialization }),
        ...(department !== undefined && { department }),
        ...(availability !== undefined && { availability }),
      },
      { new: true }
    ).populate("userId", "name email phone createdAt");

    return NextResponse.json({
      message: "Doctor updated successfully",
      doctor: updatedDoctor,
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
        { error: "Forbidden. Admin access required to remove doctor profiles." },
        { status: 403 }
      );
    }

    const { id } = await params;
    await connectToDatabase();

    const doctor = await Doctor.findByIdAndDelete(id);
    if (doctor) {
      await User.findByIdAndDelete(doctor.userId);
    }

    return NextResponse.json({ message: "Doctor profile removed successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
