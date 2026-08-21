import connectToDatabase from "@/lib/mongodb";
import Organization from "@/models/Organization";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();
    const rawOrgs = await Organization.find({})
      .select("_id name slug plan subscriptionStatus")
      .sort({ name: 1 })
      .lean();

    const organizations = rawOrgs.map((o) => ({
      _id: o._id.toString(),
      name: o.name,
      slug: o.slug,
      plan: o.plan || "starter",
      subscriptionStatus: o.subscriptionStatus || "active",
    }));

    return NextResponse.json({ organizations });
  } catch (error) {
    return NextResponse.json({ organizations: [], error: error.message }, { status: 500 });
  }
}
