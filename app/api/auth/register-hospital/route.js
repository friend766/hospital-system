import connectToDatabase from "@/lib/mongodb";
import Organization from "@/models/Organization";
import User from "@/models/User";
import { hashPassword, signToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { hospitalName, slug, adminName, adminEmail, password, plan } = await req.json();

    if (!hospitalName || !adminName || !adminEmail || !password) {
      return NextResponse.json(
        { error: "Hospital Name, Admin Name, Email, and Password are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const formattedSlug = (slug || hospitalName)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Check if slug or email exists
    const existingOrg = await Organization.findOne({ slug: formattedSlug });
    if (existingOrg) {
      return NextResponse.json(
        { error: "A hospital with this slug already exists. Please choose another name." },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email: adminEmail.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 400 }
      );
    }

    // Set plan limits
    let maxDoctors = 5;
    let maxPatients = 100;
    if (plan === "pro") {
      maxDoctors = 20;
      maxPatients = 1000;
    } else if (plan === "enterprise") {
      maxDoctors = 100;
      maxPatients = 10000;
    }

    // 1. Create Organization
    const organization = await Organization.create({
      name: hospitalName,
      slug: formattedSlug,
      plan: plan || "starter",
      subscriptionStatus: "active",
      maxDoctors,
      maxPatients,
    });

    // 2. Create Admin User
    const hashedPassword = await hashPassword(password);
    const adminUser = await User.create({
      name: adminName,
      email: adminEmail.toLowerCase(),
      password: hashedPassword,
      role: "admin",
      organizationId: organization._id,
    });

    // 3. Issue Token & Auto-login
    const tokenPayload = {
      userId: adminUser._id.toString(),
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role,
      organizationId: organization._id.toString(),
      organizationName: organization.name,
    };

    const token = signToken(tokenPayload);

    const response = NextResponse.json({
      message: "Hospital Organization registered successfully!",
      organization,
      user: tokenPayload,
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to register hospital tenant" },
      { status: 500 }
    );
  }
}
