import connectToDatabase from "@/lib/mongodb";
import Organization from "@/models/Organization";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();
    const organizations = await Organization.find({ subscriptionStatus: { $ne: "canceled" } })
      .select("name slug plan")
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({ organizations });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
