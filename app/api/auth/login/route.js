import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Organization from "@/models/Organization";
import { comparePassword, signToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    let orgName = "";
    if (user.organizationId && user.role !== "superadmin") {
      const org = await Organization.findById(user.organizationId);
      if (org) {
        orgName = org.name;
        if (org.subscriptionStatus === "pending_approval") {
          return NextResponse.json(
            { error: "⚠️ Your hospital tenant registration is pending approval by the SaaS Super-Admin. Please wait for activation." },
            { status: 403 }
          );
        }
        if (org.subscriptionStatus === "canceled") {
          return NextResponse.json(
            { error: "🔒 Your hospital tenant account has been locked or canceled by the SaaS Super-Admin." },
            { status: 403 }
          );
        }
      }
    }

    const tokenPayload = {
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId ? user.organizationId.toString() : null,
      organizationName: orgName,
    };

    const token = signToken(tokenPayload);

    const response = NextResponse.json({
      message: "Login successful",
      user: tokenPayload,
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Login failed" },
      { status: 500 }
    );
  }
}
