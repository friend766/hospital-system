import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Doctor from "@/models/Doctor";
import Patient from "@/models/Patient";
import Medicine from "@/models/Medicine";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();

    const seedUsers = [
      {
        name: "System Admin",
        email: "admin@hospital.com",
        password: "admin123",
        role: "admin",
        phone: "+1 (555) 019-2831",
      },
      {
        name: "Dr. Sarah Jenkins",
        email: "doctor@hospital.com",
        password: "doctor123",
        role: "doctor",
        phone: "+1 (555) 234-5678",
        specialization: "Cardiology",
        department: "Cardiovascular Care",
      },
      {
        name: "Emma Watson",
        email: "receptionist@hospital.com",
        password: "receptionist123",
        role: "receptionist",
        phone: "+1 (555) 345-6789",
      },
      {
        name: "David Miller",
        email: "pharmacist@hospital.com",
        password: "pharmacist123",
        role: "pharmacist",
        phone: "+1 (555) 456-7890",
      },
      {
        name: "John Doe",
        email: "patient@hospital.com",
        password: "patient123",
        role: "patient",
        phone: "+1 (555) 567-8901",
        dateOfBirth: "1992-05-14",
        gender: "Male",
        address: "452 Maple Street, Medical City",
      },
    ];

    const results = [];

    for (const u of seedUsers) {
      let existingUser = await User.findOne({ email: u.email });
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(u.password, 10);
        existingUser = await User.create({
          name: u.name,
          email: u.email,
          password: hashedPassword,
          role: u.role,
          phone: u.phone,
        });

        if (u.role === "doctor") {
          await Doctor.create({
            userId: existingUser._id,
            specialization: u.specialization,
            department: u.department,
          });
        } else if (u.role === "patient") {
          await Patient.create({
            userId: existingUser._id,
            dateOfBirth: u.dateOfBirth,
            gender: u.gender,
            address: u.address,
          });
        }
        results.push({ email: u.email, role: u.role, status: "created" });
      } else {
        results.push({ email: u.email, role: u.role, status: "already exists" });
      }
    }

    // Seed Sample Medicines if inventory is empty
    const medCount = await Medicine.countDocuments();
    if (medCount === 0) {
      await Medicine.insertMany([
        {
          name: "Amoxicillin 500mg",
          genericName: "Amoxicillin Trihydrate",
          category: "Antibiotics",
          price: 18.5,
          stockQuantity: 120,
          lowStockThreshold: 20,
          dosageForm: "Capsule",
        },
        {
          name: "Ibuprofen 400mg",
          genericName: "Ibuprofen",
          category: "Painkillers",
          price: 12.0,
          stockQuantity: 8, // Triggers low stock alert!
          lowStockThreshold: 15,
          dosageForm: "Tablet",
        },
        {
          name: "Metformin 850mg",
          genericName: "Metformin HCl",
          category: "Cardiovascular",
          price: 24.0,
          stockQuantity: 85,
          lowStockThreshold: 10,
          dosageForm: "Tablet",
        },
        {
          name: "Vitamin C 1000mg",
          genericName: "Ascorbic Acid",
          category: "Vitamins & Supplements",
          price: 9.99,
          stockQuantity: 200,
          lowStockThreshold: 25,
          dosageForm: "Tablet",
        },
      ]);
    }

    return NextResponse.json({
      message: "Database seed completed successfully!",
      accounts: results,
      credentialsHint: seedUsers.map((u) => ({
        role: u.role,
        email: u.email,
        password: u.password,
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
