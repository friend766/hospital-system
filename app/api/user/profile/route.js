import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
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

    const user = await User.findById(session.userId).select("-password").lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let extraProfile = null;
    if (user.role === "patient") {
      extraProfile = await Patient.findOne({ userId: user._id }).lean();
    } else if (user.role === "doctor") {
      extraProfile = await Doctor.findOne({ userId: user._id }).lean();
    }

    return NextResponse.json({
      user,
      extraProfile,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, profileImage, ...extraData } = body;

    await connectToDatabase();

    const updatedUser = await User.findByIdAndUpdate(
      session.userId,
      {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(profileImage !== undefined && { profileImage }),
      },
      { new: true }
    ).select("-password");

    if (updatedUser.role === "patient") {
      await Patient.findOneAndUpdate(
        { userId: session.userId },
        {
          ...(extraData.dateOfBirth !== undefined && { dateOfBirth: extraData.dateOfBirth }),
          ...(extraData.gender !== undefined && { gender: extraData.gender }),
          ...(extraData.address !== undefined && { address: extraData.address }),
          ...(extraData.emergencyContact !== undefined && { emergencyContact: extraData.emergencyContact }),
        },
        { upsert: true, new: true }
      );
    } else if (updatedUser.role === "doctor") {
      await Doctor.findOneAndUpdate(
        { userId: session.userId },
        {
          ...(extraData.specialization !== undefined && { specialization: extraData.specialization }),
          ...(extraData.department !== undefined && { department: extraData.department }),
          ...(extraData.availability !== undefined && { availability: extraData.availability }),
        },
        { upsert: true, new: true }
      );
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
