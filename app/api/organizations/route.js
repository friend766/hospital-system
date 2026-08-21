import connectToDatabase from "@/lib/mongodb";
import Organization from "@/models/Organization";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();
    const organizations = await Organization.find({})
      .select("_id name slug plan subscriptionStatus")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ organizations: organizations || [] });
  } catch (error) {
    return NextResponse.json({ organizations: [], error: error.message }, { status: 500 });
  }
}
