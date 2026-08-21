import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Patient from "@/models/Patient";
import Doctor from "@/models/Doctor";
import Appointment from "@/models/Appointment";
import { getSessionUser, hashPassword } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const sort = searchParams.get("sort") || "newest";

    let query = {};

    // Multi-Tenant Isolation
    if (session.role !== "superadmin" && session.organizationId) {
      query.organizationId = session.organizationId;
    }

    // Doctor scoping: Only patients appointed to this doctor
    if (session.role === "doctor") {
      const doctor = await Doctor.findOne({ userId: session.userId });
      if (!doctor) {
        return NextResponse.json({ patients: [] });
      }
      const doctorAppointments = await Appointment.find({ doctorId: doctor._id }).select("patientId");
      const assignedPatientIds = doctorAppointments.map((a) => a.patientId);
      query._id = { $in: assignedPatientIds };
    }

    if (search) {
      const userSearchQuery = {
        role: "patient",
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ],
      };
      if (session.role !== "superadmin" && session.organizationId) {
        userSearchQuery.organizationId = session.organizationId;
      }

      const users = await User.find(userSearchQuery).select("_id");
      const userIds = users.map((u) => u._id);

      if (query._id) {
        query = {
          $and: [
            { _id: query._id },
            { userId: { $in: userIds } },
          ],
        };
        if (session.role !== "superadmin" && session.organizationId) {
          query.$and.push({ organizationId: session.organizationId });
        }
      } else {
        query.userId = { $in: userIds };
      }
    }

    let sortOptions = { createdAt: -1 };
    if (sort === "oldest") sortOptions = { createdAt: 1 };

    const patients = await Patient.find(query)
      .populate("userId", "name email phone profileImage createdAt")
      .sort(sortOptions)
      .lean();

    return NextResponse.json({ patients });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getSessionUser(req);
    if (!session || (session.role !== "admin" && session.role !== "receptionist" && session.role !== "superadmin")) {
      return NextResponse.json(
        { error: "Forbidden. Admin or Receptionist role required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      name,
      email,
      password = "Password123!",
      phone = "",
      dateOfBirth = "",
      gender = "",
      address = "",
      emergencyContact = { name: "", phone: "", relationship: "" },
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
    const orgId = session.organizationId || null;

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "patient",
      organizationId: orgId,
      phone,
    });

    const newPatient = await Patient.create({
      userId: newUser._id,
      organizationId: orgId,
      dateOfBirth,
      gender,
      address,
      emergencyContact,
    });

    const populatedPatient = await Patient.findById(newPatient._id).populate(
      "userId",
      "name email phone createdAt"
    );

    return NextResponse.json(
      { message: "Patient registered successfully", patient: populatedPatient },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
