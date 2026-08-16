import connectToDatabase from "@/lib/mongodb";
import Medicine from "@/models/Medicine";
import { getSessionUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const medicine = await Medicine.findById(id);
    if (!medicine) {
      return NextResponse.json({ error: "Medicine not found" }, { status: 404 });
    }

    return NextResponse.json({ medicine });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await getSessionUser(req);
    if (!session || (session.role !== "pharmacist" && session.role !== "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    await connectToDatabase();

    const updatedMedicine = await Medicine.findByIdAndUpdate(id, body, { new: true });
    if (!updatedMedicine) {
      return NextResponse.json({ error: "Medicine not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Medicine updated successfully",
      medicine: updatedMedicine,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getSessionUser(req);
    if (!session || (session.role !== "pharmacist" && session.role !== "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    await connectToDatabase();

    await Medicine.findByIdAndDelete(id);
    return NextResponse.json({ message: "Medicine removed from inventory" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
