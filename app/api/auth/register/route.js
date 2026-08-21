import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Patient from "@/models/Patient";
import Doctor from "@/models/Doctor";
import Organization from "@/models/Organization";
import { hashPassword } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { name, email, password, role = "patient", organizationId, phone = "", specialization = "", department = "" } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    // Minimum password length check
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check duplicate email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // Resolve Organization ID
    let targetOrgId = organizationId;
    if (!targetOrgId) {
      const defaultOrg = await Organization.findOne({ slug: "central-city-hospital" });
      if (defaultOrg) targetOrgId = defaultOrg._id;
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || "patient",
      organizationId: targetOrgId || null,
      phone,
    });

    // Automatically create linked profile based on role
    if (newUser.role === "patient") {
      await Patient.create({
        userId: newUser._id,
        organizationId: targetOrgId || null,
      });
    } else if (newUser.role === "doctor") {
      await Doctor.create({
        userId: newUser._id,
        organizationId: targetOrgId || null,
        specialization: specialization || "General Medicine",
        department: department || "General OPD",
      });
    }

    // Return sanitized user object without password
    const userWithoutPassword = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      organizationId: targetOrgId,
      phone: newUser.phone,
      createdAt: newUser.createdAt,
    };

    return NextResponse.json(
      { message: "Registration successful", user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Registration failed" },
      { status: 500 }
    );
  }
}
