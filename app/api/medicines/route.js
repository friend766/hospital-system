import connectToDatabase from "@/lib/mongodb";
import Medicine from "@/models/Medicine";
import { getSessionUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const lowStock = searchParams.get("lowStock") === "true";

    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { genericName: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    let medicines = await Medicine.find(query).sort({ name: 1 }).lean();

    if (lowStock) {
      medicines = medicines.filter((m) => m.stockQuantity <= m.lowStockThreshold);
    }

    return NextResponse.json({ medicines });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getSessionUser(req);
    if (!session || (session.role !== "pharmacist" && session.role !== "admin")) {
      return NextResponse.json(
        { error: "Forbidden. Pharmacist or Admin role required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      name,
      genericName = "",
      category,
      price,
      stockQuantity = 0,
      lowStockThreshold = 10,
      dosageForm = "Tablet",
      expiryDate = "",
    } = body;

    if (!name || !category || price === undefined) {
      return NextResponse.json(
        { error: "Name, category, and price are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const newMedicine = await Medicine.create({
      name,
      genericName,
      category,
      price: Number(price),
      stockQuantity: Number(stockQuantity),
      lowStockThreshold: Number(lowStockThreshold),
      dosageForm,
      expiryDate,
    });

    return NextResponse.json(
      { message: "Medicine added to inventory successfully", medicine: newMedicine },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
