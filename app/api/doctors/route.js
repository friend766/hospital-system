import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Doctor from "@/models/Doctor";
import { getSessionUser, hashPassword } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const department = searchParams.get("department") || "";

    let query = {};
    if (department) {
      query.department = { $regex: department, $options: "i" };
    }

    if (search) {
      const users = await User.find({
        role: "doctor",
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }).select("_id");

      const userIds = users.map((u) => u._id);
      query.$or = [
        { userId: { $in: userIds } },
        { specialization: { $regex: search, $options: "i" } },
      ];
    }

    const doctors = await Doctor.find(query)
      .populate("userId", "name email phone profileImage createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ doctors });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getSessionUser(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden. Admin role required to create doctor accounts." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      name,
      email,
      password = "Doctor123!",
      phone = "",
      specialization = "General Medicine",
      department = "General OPD",
      availability = {
        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        timeSlots: ["09:00 AM - 01:00 PM", "02:00 PM - 05:00 PM"],
      },
    } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "doctor",
      phone,
    });

    const newDoctor = await Doctor.create({
      userId: newUser._id,
      specialization,
      department,
      availability,
    });

    const populatedDoctor = await Doctor.findById(newDoctor._id).populate(
      "userId",
      "name email phone createdAt"
    );

    return NextResponse.json(
      { message: "Doctor added successfully", doctor: populatedDoctor },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
